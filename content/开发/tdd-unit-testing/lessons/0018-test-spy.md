---
title: "第18课：使用测试间谍（Spy）"
description: "KP-055 — Spy 的概念：不仅返回预设值，还记录调用信息，验证交互行为"
tags: [tdd, spy, test-double, interaction-testing, verification]
date: 2026-07-06
draft: false
---

# 第18课：使用测试间谍（Spy）

## 桩的局限性

[[0017-stub-method|上一课]] 我们使用桩方法返回预设值，隔离了外部依赖。但有些场景下，仅仅返回值是不够的——**你还需要验证方法是否被正确调用了**。

例如，在 `PriceCalculator` 的 `calculate()` 方法中：

```java
public int calculate(int total) {
    if (total < 100) {
        return total + expressService.fullFee();  // 走了这个分支
    }
    if (total > 100 && total < 150) {
        return total + expressService.halfFee();  // 还是走了这个分支？
    }
    // ...
}
```

如果 `fullFee()` 和 `halfFee()` 返回的值相同（比如都是 20），你光靠返回值就无法判断**到底走的是哪个分支**。这时就需要 **测试间谍（Spy）**。

---

## 什么是测试间谍

**Spy（间谍）** 是测试替身的一种变体，它在桩的基础上增加了**记录调用信息**的能力：

- 方法是否被调用
- 被调用的次数
- 调用时传递的参数

```mermaid
flowchart LR
    subgraph ”桩（Stub）”
        A[”返回预设值”]
    end
    subgraph ”间谍（Spy）”
        B[”返回预设值<br/>+ 记录调用信息”]
    end
    A -.-> B
```

---

## Spy vs Stub 对比

| 能力 | Stub（桩） | Spy（间谍） |
|------|-----------|------------|
| 返回预设值 | 是 | 是 |
| 验证方法是否被调用 | 否 | 是 |
| 验证调用次数 | 否 | 是 |
| 验证调用参数 | 否 | 是 |
| 隔离依赖 | 是 | 是 |

---

## 实现一个简单的 Spy

我们可以基于 [[0016-test-double|测试替身]] 的继承机制，在桩的基础上增加记录功能：

```java
public class ExpressServiceSpy extends ExpressService {

    private int fullFee;
    private int halfFee;

    // 用于记录调用信息的 Map
    // key: 方法名, value: 调用次数
    private Map<String, Integer> callCount = new HashMap<>();

    public ExpressServiceSpy(int fullFee, int halfFee) {
        this.fullFee = fullFee;
        this.halfFee = halfFee;
    }

    @Override
    public int fullFee() {
        // 记录：fullFee 被调用了一次
        callCount.merge("fullFee", 1, Integer::sum);
        return this.fullFee;
    }

    @Override
    public int halfFee() {
        // 记录：halfFee 被调用了一次
        callCount.merge("halfFee", 1, Integer::sum);
        return this.halfFee;
    }

    // 对外暴露记录信息，供测试验证
    public int getCallCount(String methodName) {
        return callCount.getOrDefault(methodName, 0);
    }
}
```

---

## 使用 Spy 验证交互行为

现在我们可以既验证返回值，又验证方法调用情况：

```java
class PriceCalculatorSpyTest {

    @Test
    void should_call_fullFee_when_total_less_than_100() {
        // Arrange - 创建 Spy
        ExpressServiceSpy spy = new ExpressServiceSpy(20, 10);
        PriceCalculator calculator = new PriceCalculator();
        calculator.setExpressService(spy);

        // Act
        int result = calculator.calculate(85);

        // Assert - 验证返回值
        assertThat(result).isEqualTo(105);

        // Assert - 验证方法调用
        assertThat(spy.getCallCount("fullFee")).isEqualTo(1);  // fullFee 被调用了 1 次
        assertThat(spy.getCallCount("halfFee")).isEqualTo(0);   // halfFee 未被调用
    }

    @Test
    void should_call_halfFee_when_total_between_100_and_150() {
        // Arrange
        ExpressServiceSpy spy = new ExpressServiceSpy(20, 10);
        PriceCalculator calculator = new PriceCalculator();
        calculator.setExpressService(spy);

        // Act
        int result = calculator.calculate(110);

        // Assert - 验证返回值
        assertThat(result).isEqualTo(120);

        // Assert - 验证方法调用
        assertThat(spy.getCallCount("fullFee")).isEqualTo(0);   // fullFee 未被调用
        assertThat(spy.getCallCount("halfFee")).isEqualTo(1);   // halfFee 被调用了 1 次
    }
}
```

---

## 什么时候该用 Spy？

| 场景 | 方案 |
|------|------|
| 只关心返回值 | Stub 足够 |
| 需要验证某个方法是否被调用了 | 使用 Spy |
| 需要验证调用了多少次 | 使用 Spy |
| 既要返回值又要验证交互 | 使用 Spy（即具备了 Mock 的特性） |

### 典型使用场景

1. **验证日志记录**：确保 `logger.warn()` 在特定条件下被调用
2. **验证通知发送**：确保 `emailService.send()` 被调用了一次
3. **验证数据库操作**：确保 `repository.save()` 被调用了，且只调用了一次
4. **验证分支选择**：如上例所示，验证走了哪条分支

> [!danger] 不要过度验证交互
> 只在**交互行为本身是业务逻辑的一部分**时使用 Spy。如果仅仅是返回值就可以判断正确性，就不需要额外验证调用次数——过度验证会使测试变得脆弱。

---

## Stub + Spy = Mock

当一个方法既能返回预设值（Stub 行为），又能记录调用信息（Spy 行为）时，它就具备了 **Mock（模拟对象）** 的特性：

```
替身（Test Double）
├── 桩（Stub）      = 预设返回值
├── 间谍（Spy）     = 记录调用信息
└── 模拟对象（Mock） = Stub + Spy
```

> [!tip] 理解这三者的关系
> - **Stub**：关注"返回什么"
> - **Spy**：关注"是否被调用了"
> - **Mock**：关注"是否被**正确地**调用了"

---

## 与其他语言的类比

> [!note] Python（unittest.mock）等效写法
> ```python
> from unittest.mock import Mock
>
> express_mock = Mock(spec=ExpressService)
> express_mock.full_fee.return_value = 20
>
> calculator = PriceCalculator(express_mock)
> calculator.calculate(85)
>
> express_mock.full_fee.assert_called_once()  # 验证调用次数
> express_mock.half_fee.assert_not_called()    # 验证未被调用
> ```

> [!note] JavaScript（Jest）等效写法
> ```javascript
> const expressMock = {
>   fullFee: jest.fn(() => 20),
>   halfFee: jest.fn(() => 10),
> };
>
> const calculator = new PriceCalculator(expressMock);
> calculator.calculate(85);
>
> expect(expressMock.fullFee).toHaveBeenCalledTimes(1);
> expect(expressMock.halfFee).not.toHaveBeenCalled();
> ```

> [!note] Go 等效写法
> ```go
> type ExpressServiceSpy struct {
>     fullFeeCallCount int
> }
>
> func (s *ExpressServiceSpy) FullFee() int {
>     s.fullFeeCallCount++
>     return 20
> }
>
> // 测试中
> spy := &ExpressServiceSpy{}
> calculator := NewPriceCalculator(spy)
> calculator.Calculate(85)
> assert.Equal(t, 1, spy.fullFeeCallCount)
> ```

---

## 本课小结

- **Spy** 在 Stub 的基础上增加了**记录调用信息**的能力
- Spy 可以验证方法是否被调用、调用次数、调用参数
- 当返回值不足以判断正确性时，Spy 是重要的补充工具
- **不要过度验证**：只在必要时使用 Spy，否则测试会变得脆弱
- Stub + Spy = Mock（[[0026-mockito-basics|第26课]] 深入讲解）

---

## 练习

为 `PriceCalculator` 新增一个 `log()` 依赖：当总价超过 200 时，记录一条"高价商品"日志。使用 Spy 验证 `log()` 方法在正确的条件下被调用。

---

## 参考

- [[reference/test-doubles|测试替身参考]]
- [[0016-test-double|第16课：认识测试替身（Test Double）]]
- [[0017-stub-method|第17课：测试打桩（Stub Method）]]
- [[0026-mockito-basics|第26课：Mock 与单元测试的方法论]]