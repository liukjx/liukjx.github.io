---
title: "第14课：重构与测试先行"
description: "KP-040 ~ KP-041 — 什么是测试先行，以及先写测试与后补测试的视角差异"
tags: [tdd, test-first, refactoring, red-green-refactoring]
date: 2026-07-06
draft: false
---

# 第14课：重构与测试先行

## 从一个需求变更说起

在之前的章节中，我们重构了一个快递费计算器 `PriceCalculator`，它根据商品总价 `total` 决定是否收取快递费。现在业务方提出一个新需求：

> 当商品总价在 **100 ~ 150 元** 之间时，加收一半的快递费（即 10 元）。

按照过去的习惯，你可能会直接打开 `PriceCalculator` 类，增加一个 `if` 分支。但问题来了——**这个新分支没有对应的测试覆盖**。你改完代码后运行已有的测试，它们依然通过，但你真的放心吗？

这正是 **测试先行（Test-First）** 要解决的问题。

---

## 什么是测试先行

测试先行的核心思想是：**在编写业务逻辑代码之前，先编写测试代码**。

```mermaid
flowchart LR
    A[”编写测试<br/><small>（红）</small>”] --> B[”测试失败<br/><small>（确认测试有效）</small>”]
    B --> C[”编写业务代码<br/><small>让测试通过</small>”]
    C --> D[”测试通过<br/><small>（绿）</small>”]
    D --> E[”重构优化<br/><small>保持绿色</small>”]
    E --> A
```

它与 [[0006-red-green-refactoring|红绿重构]] 一脉相承，区别在于：红绿重构通常已有测试，而测试先行是从**无测试**的状态开始的。

---

## 先写测试 vs 后补测试

这是两种截然不同的开发视角：

| 维度 | 先写测试 | 后补测试 |
|------|----------|----------|
| **视角** | 用户/测试人员视角 | 开发人员视角 |
| **动机** | 定义"什么行为是正确的" | 让测试"跑通" |
| **关注点** | 输入、输出、边界条件 | 迎合已有实现 |
| **测试质量** | 通常更全面 | 容易流于形式 |
| **代码设计** | 天然可测试 | 可能难以测试 |

> [!quote] 核心洞察
> 后补测试时，你的潜意识目标是让测试**通过**而非让测试**发现问题**。当你已经知道代码是怎么写的，你的测试很大概率只是验证你已经知道的结果，而不会去挑战它。

---

## 示例：为 100-150 区间编写测试先行的代码

### 第 1 步：编写测试

我们新增一个测试方法，描述"总价在 100 到 150 之间应加收一半快递费"的行为：

```java
@Test
void should_add_half_express_fee_when_total_between_100_and_150() {
    // Arrange
    PriceCalculator calculator = new PriceCalculator();

    // Act
    int total = 80 + 30;  // 110，落在 100~150 区间
    int result = calculator.calculate(total);

    // Assert
    assertThat(result).isEqualTo(120);  // 110 + 10（一半快递费）
}
```

此时运行测试，结果是**红色**（失败）——因为业务逻辑尚未实现。

### 第 2 步：编写业务逻辑

```java
public int calculate(int total) {
    if (total > 100 && total < 150) {
        return total + halfExpressFee();
    }
    // ... 其他已有逻辑
}

private int halfExpressFee() {
    return expressFee / 2;  // expressFee = 20, half = 10
}
```

### 第 3 步：验证绿色

运行测试，通过。完成了一轮"红 -> 绿"循环。

### 第 4 步：继续追加更多区间

按照同样的模式，我们继续追加新的测试用例：

1. **150 ~ 200 区间**：不收快递费，但加收保险费
2. **小于 30 的区间**：足额快递费加手续费

每一次都是**先写测试 -> 红色 -> 写业务逻辑 -> 绿色**。

```mermaid
flowchart LR
    subgraph ”传统方式”
        A1[”写业务代码”] --> A2[”后补测试<br/><small>（可能敷衍）</small>”]
    end
    subgraph ”测试先行”
        B1[”写测试<br/><small>（用户视角）</small>”] --> B2[”写业务代码”] --> B3[”测试验证”]
    end
```

> [!tip] 关键区别
> 测试先行让你在写代码之前，先想清楚"这段代码应该产出的结果是什么"。这是一种 **用户视角** 的编程方式。

---

## 为什么测试先行能提高代码质量

1. **强制思考边界条件**：在写代码之前就要想好正常值、异常值、边界值
2. **产出可测试的设计**：如果一段代码很难写测试，往往意味着设计有问题
3. **天然生成回归测试**：业务代码写完时，测试也写完了
4. **减少调试时间**：问题在测试阶段被捕获，而非运行时

> [!quote]
> 先写测试不是多花时间，而是把时间花在更正确的地方。

---

## 与其他语言的类比

> [!note] Python 等效写法
> ```python
> def test_should_add_half_express_fee_when_total_between_100_and_150():
>     calculator = PriceCalculator()
>     result = calculator.calculate(110)
>     assert result == 120
> ```

> [!note] Go 等效写法
> ```go
> func TestShouldAddHalfExpressFeeWhenTotalBetween100And150(t *testing.T) {
>     calculator := NewPriceCalculator()
>     result := calculator.Calculate(110)
>     assert.Equal(t, 120, result)
> }
> ```

---

## 本课小结

- **测试先行** 是先写测试再写业务逻辑的开发方式
- 先写测试让你以**用户视角**思考代码行为
- 后补测试容易流于形式，因为你潜意识里只想让它跑通
- 测试先行配合[[0006-red-green-refactoring|红绿重构]]，是 TDD 的核心实践

---

## 下节预告

测试已经有了，但你知道每个测试 **到底在测什么** 吗？下一课我们将讨论如何**明确测试目标**。

---

## 参考

- [[reference/glossary|测试术语表]]
- [[0015-define-test-goal|第15课：明确测试目标]]