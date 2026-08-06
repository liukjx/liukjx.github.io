---
title: 第23课：用函数进行表达（Express Intent with Functions）
description: 把条件逻辑和复杂表达式抽取为命名良好的函数，让代码自文档化
tags: [refactoring, intent, function, expressiveness, java]
date: 2026-07-06
draft: false
---

# 第23课：用函数进行表达

覆盖知识点：KP-064 ~ KP-065

## 核心思想：代码即文档

最好的文档不是注释，而是**代码本身**。当一段逻辑比较复杂时，不要写注释来解释它，而应该将其抽取为一个**命名良好的函数**——函数名本身就是最好的注释。

```java
// ❌ 需要注释来解释的代码
// 检查用户是否有资格获得折扣：
// 1. 必须是活跃用户
// 2. 订单金额超过 100 元
// 3. 不是黑名单用户
if (user.isActive() && amount > 100 && !blacklist.contains(user.getId())) {
    // 应用折扣...
}
```

```java
// ✅ 函数名本身就是文档
if (isEligibleForDiscount(user, amount)) {
    // 应用折扣...
}

private boolean isEligibleForDiscount(User user, double amount) {
    return user.isActive()
        && amount > MIN_DISCOUNT_THRESHOLD
        && !blacklist.contains(user.getId());
}
```

> [!tip] 核心原则
> 好的函数名应该让调用方**一眼就知道代码在做什么**，而不用深入阅读实现细节。这就是"用函数进行表达"的本质。

## 提取条件逻辑为命名函数

### 重构前：内联条件

```java
public double processOrder(Order order, User user) {
    // 复杂的业务规则直接写在条件中
    if (order.getTotalAmount() > 500
        && user.getRegistrationDays() > 30
        && !user.isBanned()
        && order.getItemCount() >= 3) {
        return applyBulkDiscount(order);
    }
    return applyRegularPrice(order);
}
```

这段代码的问题是：读者必须逐字阅读整个条件才能理解它在判断什么，而每个判断条件的业务含义都被埋没在语法细节中。

### 重构后：命名函数表达意图

```java
public double processOrder(Order order, User user) {
    if (isEligibleForBulkDiscount(order, user)) {
        return applyBulkDiscount(order);
    }
    return applyRegularPrice(order);
}

private boolean isEligibleForBulkDiscount(Order order, User user) {
    return order.getTotalAmount() > BULK_DISCOUNT_THRESHOLD
        && user.getRegistrationDays() > MIN_REGISTRATION_DAYS
        && !user.isBanned()
        && order.getItemCount() >= MIN_ITEM_COUNT;
}
```

> [!note] 可读性的提升
> 重构后的 `processOrder` 方法读起来就像是一段业务描述："如果符合批量折扣条件，应用批量折扣，否则应用常规价格。" 具体什么是"批量折扣条件"，由 `isEligibleForBulkDiscount` 函数封装。

## 将表达式分层表达

复杂的业务逻辑可以通过**多层函数调用**来分层表达，每一层都在合适的抽象级别上：

```java
public void processRefund(RefundRequest request) {
    if (!canProcessRefund(request)) {
        throw new RefundNotAllowedException("Refund not allowed");
    }
    
    RefundAmount amount = calculateRefundAmount(request);
    notifyRefundInitiated(request, amount);
    executeRefund(request, amount);
}

// 第一层抽象：能否处理退款
private boolean canProcessRefund(RefundRequest request) {
    return isWithinRefundPeriod(request)
        && !isAlreadyRefunded(request)
        && hasValidPurchaseRecord(request);
}

// 第二层抽象：各子条件
private boolean isWithinRefundPeriod(RefundRequest request) {
    return request.getPurchaseDate()
        .plusDays(REFUND_PERIOD_DAYS)
        .isAfter(LocalDate.now());
}

private boolean isAlreadyRefunded(RefundRequest request) {
    return refundRecordService.hasRefundRecord(request.getOrderId());
}

private boolean hasValidPurchaseRecord(RefundRequest request) {
    return purchaseRepository.existsByOrderId(request.getOrderId());
}
```

> [!tip] 分层抽象的好处
> - **顶层函数**（如 `processRefund`）描述业务流程
> - **中层函数**（如 `canProcessRefund`）描述业务规则
> - **底层函数**（如 `isWithinRefundPeriod`）描述具体判断逻辑
> - 每层函数都在同一个抽象级别上工作

## Mermaid：函数抽象层次

```mermaid
flowchart TD
    subgraph ”业务流程层”
        A[processRefund]
    end
    
    subgraph ”业务规则层”
        B[canProcessRefund]
        C[calculateRefundAmount]
        D[notifyRefundInitiated]
        E[executeRefund]
    end
    
    subgraph ”条件判断层”
        F[isWithinRefundPeriod]
        G[isAlreadyRefunded]
        H[hasValidPurchaseRecord]
    end
    
    A --> B
    A --> C
    A --> D
    A --> E
    B --> F
    B --> G
    B --> H
    
    style A fill:#6f9,stroke:#333
    style B fill:#9cf,stroke:#333
    style F fill:#fc9,stroke:#333
```

## 代码对比

| 维度 | 内联条件 | 命名函数 |
|------|---------|---------|
| 可读性 | 需要解析语法 | 函数名直接表达意图 |
| 可维护性 | 条件修改时需仔细定位 | 修改被封装在函数内 |
| 可复用性 | 相同条件需重复写 | 函数可被多处调用 |
| 可测试性 | 条件作为整体测试 | 函数可独立测试 |
| 文档价值 | 需额外注释 | 代码自文档化 |

## 更多示例

### 示例 1：时间判断

```java
// ❌ 内联
if (order.getCreateTime().plusDays(7).isAfter(LocalDateTime.now())) {
    // ...
}

// ✅ 命名函数
if (isRecentlyCreated(order)) {
    // ...
}

private boolean isRecentlyCreated(Order order) {
    return order.getCreateTime().plusDays(RECENT_DAYS).isAfter(LocalDateTime.now());
}
```

### 示例 2：集合判断

```java
// ❌ 内联
if (items.size() >= 3 && items.stream().allMatch(Item::isInStock)) {
    // ...
}

// ✅ 命名函数
if (meetsMinimumOrderRequirement(items)) {
    // ...
}

private boolean meetsMinimumOrderRequirement(List<Item> items) {
    return items.size() >= MIN_ORDER_ITEMS
        && items.stream().allMatch(Item::isInStock);
}
```

### 示例 3：数值计算

```java
// ❌ 内联
double price = basePrice * (1 - discountRate / 100) + tax;

// ✅ 命名函数
double price = calculateFinalPrice(basePrice, discountRate, tax);

private double calculateFinalPrice(double basePrice, double discountRate, double tax) {
    return basePrice * (1 - discountRate / 100) + tax;
}
```

> [!warning] 不要过度抽取
> 并不是每一行代码都需要抽取为函数。一行就能看懂的简单表达式（如 `a + b`）直接写出来就好。判断标准是：**如果不加注释，读者是否能在一秒内理解这段代码的意图？**

## 与其他重构手法的关系

- **[[0022-replace-loop-with-pipeline|第22课：用管道替代循环]]** 中的 `filter`/`map` 操作本身就是用命名方法表达意图的体现
- **[[0024-replace-conditional-with-polymorphism|第24课：用多态取代条件]]** 在条件逻辑更复杂时，进一步用多态替代 if-else
- **[[0004-extract-function-refactoring|第04课：提炼函数]]** 是此手法的理论基础

## 其他语言中的等效做法

> [!note] Python
> ```python
> # ❌ 内联条件
> if user.is_active and order.amount > 100 and not user.is_banned:
>     apply_discount(order)
>
> # ✅ 命名函数
> def is_eligible_for_discount(user, order):
>     return user.is_active and order.amount > 100 and not user.is_banned
>
> if is_eligible_for_discount(user, order):
>     apply_discount(order)
> ```

> [!note] JavaScript / TypeScript
> ```typescript
> // ✅ 命名箭头函数
> const isEligibleForDiscount = (user: User, amount: number): boolean =>
>   user.isActive && amount > 100 && !user.isBanned;
>
> if (isEligibleForDiscount(user, amount)) {
>   applyDiscount(order);
> }
> ```

> [!note] Go
> ```go
> // Go 中函数是第一等公民
> func isEligibleForDiscount(user User, amount float64) bool {
>     return user.IsActive && amount > 100 && !user.IsBanned
> }
> ```

---

## 自测题

1. 用函数进行表达的核心目的是什么？
   A. 减少代码行数  
   B. 用函数名代替注释，让代码自文档化  
   C. 提高代码运行速度  
   D. 增加代码的复杂度

2. 以下哪个函数名最清晰地表达了意图？
   A. `check(x, y)`  
   B. `isEligibleForBulkDiscount(order, user)`  
   C. `processData(data)`  
   D. `doSomething(a, b)`

3. 判断是否需要抽取为函数的标准是？
   A. 代码行数超过 3 行  
   B. 不加注释的情况下，读者能否在一秒内理解这段代码的意图  
   C. 这段代码是否包含 if 语句  
   D. 这段代码是否包含循环

> **下一课预告**：[[0024-replace-conditional-with-polymorphism|第24课：用多态取代条件]] —— 当条件分支不断增长时，用多态和策略模式彻底消除 if-else。