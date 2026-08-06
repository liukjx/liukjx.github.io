---
title: 第20课：去除原始类型偏执（Remove Primitive Obsession）
description: 用枚举和对象封装业务概念，消除 String/int 偏执
tags: [refactoring, primitive-obsession, enum, java]
date: 2026-07-06
draft: false
---

# 第20课：去除原始类型偏执

覆盖知识点：KP-058 ~ KP-059

## 什么是原始类型偏执

**原始类型偏执（Primitive Obsession）** 是指过度使用编程语言内置的原始类型（String、int、boolean 等）来表示业务概念，而不为这些概念创建专门的类型。

```java
// ❌ 原始类型偏执：用 String 表示会员等级
public double calculateDiscount(String level, double amount) {
    if ("GOLD".equals(level)) {
        return amount * 0.1;
    } else if ("SILVER".equals(level)) {
        return amount * 0.05;
    }
    return 0;
}
```

> [!warning] 原始类型偏执的危害
> - 类型不安全：字符串拼写错误编译器无法发现
> - 逻辑分散：与业务概念相关的行为散落在各处
> - 可读性差：`String level` 无法表达业务含义
> - 维护成本高：新增等级需要修改所有 if-else 分支

## 用枚举封装业务概念

解决方案是为业务概念创建专门的类型。对于固定集合的概念，**枚举（enum）** 是最自然的选择。

### 重构前：字符串比较 + if-else 链

```java
public class OrderService {
    public double calculateDiscount(String userLevel, double amount) {
        double discountRate;
        if ("GOLD".equals(userLevel)) {
            discountRate = 0.1;
        } else if ("SILVER".equals(userLevel)) {
            discountRate = 0.05;
        } else if ("NORMAL".equals(userLevel)) {
            discountRate = 0.0;
        } else {
            throw new IllegalArgumentException("Unknown level: " + userLevel);
        }
        return amount * discountRate;
    }
}
```

```java
// 调用方也充斥着字符串常量或魔法值
orderService.calculateDiscount("GOLD", 100.0);
orderService.calculateDiscount("PLATINUM", 200.0); // 运行时错误，编译期无法发现
```

### 重构后：枚举封装业务行为

```java
public enum UserLevel {
    GOLD(0.1),
    SILVER(0.05),
    NORMAL(0.0);

    private final double discountRate;

    UserLevel(double discountRate) {
        this.discountRate = discountRate;
    }

    public double getDiscountRate() {
        return discountRate;
    }
}
```

```java
public class OrderService {
    public double calculateDiscount(UserLevel level, double amount) {
        return amount * level.getDiscountRate();
    }
}

// 调用方：类型安全，IDE 自动补全
orderService.calculateDiscount(UserLevel.GOLD, 100.0);
// orderService.calculateDiscount("PLATINUM", 200.0); // 编译错误，安全！
```

> [!tip] 核心转变
> 重构后，`calculateDiscount` 方法中的 if-else 链完全消失了。折扣率是 `UserLevel` 枚举的固有属性，由枚举自身管理。这正是 **"把数据和行为封装在一起"** 的面向对象原则。

## 代码对比

| 维度 | 重构前（String） | 重构后（Enum） |
|------|-----------------|---------------|
| 类型安全 | 编译期不检查 | 编译期严格检查 |
| 业务概念 | 隐含在字符串中 | 显式声明为类型 |
| 新增等级 | 修改所有 if-else | 新增一个枚举常量 |
| IDE 支持 | 无 | 自动补全、重构 |
| 行为封装 | 分散在外层代码 | 集中在枚举内部 |

## 扩展场景：枚举携带更多行为

枚举不仅可以包含字段，还可以包含抽象方法，让每个常量实现自己的行为。

```java
public enum UserLevel {
    GOLD(0.1) {
        @Override
        public double calculatePoints(double amount) {
            return amount * 2.0; // 双倍积分
        }
    },
    SILVER(0.05) {
        @Override
        public double calculatePoints(double amount) {
            return amount * 1.5; // 1.5 倍积分
        }
    },
    NORMAL(0.0) {
        @Override
        public double calculatePoints(double amount) {
            return amount * 1.0; // 标准积分
        }
    };

    private final double discountRate;

    UserLevel(double discountRate) {
        this.discountRate = discountRate;
    }

    public double getDiscountRate() {
        return discountRate;
    }

    public abstract double calculatePoints(double amount);
}
```

> [!note] 变量作用域上移
> 在本课的重构过程中，还涉及一个辅助重构手法：**变量作用域上移（Move Variable to Higher Scope）**。当多个方法共享同一依赖（如 `UserLevel`）时，应将其提升为成员变量或方法参数，消除重复声明。

## 其他语言中的等效做法

> [!note] Python
> Python 没有内置枚举时可以用类常量，Python 3.4+ 推荐使用 `enum.Enum`：
> ```python
> from enum import Enum
>
> class UserLevel(Enum):
>     GOLD = 0.1
>     SILVER = 0.05
>     NORMAL = 0.0
>
>     @property
>     def discount_rate(self):
>         return self.value
> ```

> [!note] TypeScript
> TypeScript 的枚举天然支持数字和字符串：
> ```typescript
> enum UserLevel {
>   GOLD = 0.1,
>   SILVER = 0.05,
>   NORMAL = 0.0
> }
> ```

## Mermaid：重构流程

```mermaid
flowchart LR
    A[原始类型偏执\nString level] --> B[识别业务概念\n会员等级]
    B --> C[创建枚举\nUserLevel]
    C --> D[将行为移入枚举\ndiscountRate 字段]
    D --> E[消除 if-else 链\nlevel.getDiscountRate()]
    
    style A fill:#f96,stroke:#333
    style E fill:#6f9,stroke:#333
```

## 何时使用

使用枚举封装业务概念的场景：

- 概念有**固定有限**的取值集合
- 不同取值对应**不同的行为或属性**
- 取值之间有**比较或排序**需求
- 希望**类型安全**地传递业务概念

不适合使用枚举的场景：

- 取值集合是开放的（如用户自定义标签）—— 应使用类或接口
- 取值数量极大（如数万个）—— 应使用数据库或配置中心
- 行为差异极大且频繁变化 —— 应使用策略模式（参见 [[0024-replace-conditional-with-polymorphism|第24课：用多态取代条件]]）

---

## 自测题

1. 以下哪项不属于原始类型偏执的表现？
   A. 用 String 表示电话号码  
   B. 用 int 表示年龄  
   C. 用 LocalDate 表示日期  
   D. 用 String 表示会员等级

2. 重构后的 `UserLevel` 枚举带来了哪些好处？（多选）
   A. 类型安全  
   B. 消除 if-else 链  
   C. 提高运行性能  
   D. 将数据和行为封装在一起

> **下一课预告**：[[0021-replace-parameter-with-query|第21课：用查询替代函数参数]] —— 不需要把能查询到的值作为参数传递，让方法自己查询。