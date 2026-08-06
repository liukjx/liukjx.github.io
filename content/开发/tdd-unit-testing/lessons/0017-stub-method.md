---
title: "第17课：测试打桩（Stub Method）"
description: "KP-052 ~ KP-054 — 桩是替身的行为——返回预设结果的方法，替身与桩的区别"
tags: [tdd, stub, test-double, isolation, express-service]
date: 2026-07-06
draft: false
---

# 第17课：测试打桩（Stub Method）

## 从替身到桩

上一课我们用 [[0016-test-double|测试替身]] 隔离了 `ExpressService` 依赖。替身类中重写的方法返回了预设值，这些预设值的返回方法在测试术语中有一个专门的名字——**桩（Stub）**。

```java
// ExpressServiceDouble 中的 fullFee() 就是一个桩方法
@Override
public int fullFee() {
    return this.fullFee;  // 返回预设值，像一个木桩一样 "钉" 在原地
}
```

---

## 替身 vs 桩

> 替身（Double）是对象的替代品，桩（Stub）是替身的行为。

用一个表格来区分：

| 概念 | 英文 | 本质 | 类比 |
|------|------|------|------|
| **测试替身** | Test Double | **对象**级别的替代 | 替身演员 |
| **桩方法** | Stub Method | **行为**级别的替代 | 固定台词的剧本 |

```mermaid
flowchart TD
    subgraph ”测试替身（对象级）”
        A[”ExpressServiceDouble<br/><small>替身对象</small>”]
    end
    subgraph ”桩方法（行为级）”
        B[”fullFee() → 返回 20”]
        C[”halfFee() → 返回 10”]
    end
    A --> B
    A --> C
```

**替身是容器，桩是容器里的行为。**

---

## 打桩的完整示例

现在我们为 `ExpressService` 和 `PriceCalculator` 之间的所有依赖关系打桩。

### 业务类

```java
public class PriceCalculator {
    private ExpressService expressService;

    public void setExpressService(ExpressService expressService) {
        this.expressService = expressService;
    }

    public int calculate(int total) {
        if (total < 30) {
            // 足额快递费 + 手续费
            return total + expressService.fullFee() + 5;
        }
        if (total < 100) {
            // 足额快递费
            return total + expressService.fullFee();
        }
        if (total > 100 && total < 150) {
            // 一半快递费
            return total + expressService.halfFee();
        }
        return total;
    }
}
```

### 替身类（含桩方法）

```java
public class ExpressServiceDouble extends ExpressService {

    private int fullFee;
    private int halfFee;

    public ExpressServiceDouble(int fullFee, int halfFee) {
        this.fullFee = fullFee;
        this.halfFee = halfFee;
    }

    // 桩方法：返回预设的全额快递费
    @Override
    public int fullFee() {
        return this.fullFee;
    }

    // 桩方法：返回预设的半额快递费
    @Override
    public int halfFee() {
        return this.halfFee;
    }
}
```

### 单元测试（使用替身+桩）

```java
class PriceCalculatorUnitTest {

    @Test
    void should_add_full_express_fee_when_total_less_than_100() {
        // Arrange - 创建替身并打桩
        ExpressServiceDouble stub = new ExpressServiceDouble(20, 10);
        PriceCalculator calculator = new PriceCalculator();
        calculator.setExpressService(stub);  // 注入替身

        // Act - 执行被测方法
        int result = calculator.calculate(85);

        // Assert - 验证结果
        assertThat(result).isEqualTo(105);  // 85 + 20（桩返回的值）
    }

    @Test
    void should_add_half_express_fee_when_total_between_100_and_150() {
        // Arrange
        ExpressServiceDouble stub = new ExpressServiceDouble(20, 10);
        PriceCalculator calculator = new PriceCalculator();
        calculator.setExpressService(stub);

        // Act
        int result = calculator.calculate(110);

        // Assert
        assertThat(result).isEqualTo(120);  // 110 + 10（桩返回的值）
    }
}
```

---

## 打桩的注意事项

### 1. 桩返回的值要有区分度

当 `PriceCalculator` 中有多个分支都调用了 `expressService.fullFee()` 时，桩返回的值应确保**不同分支产生不同结果**。

```java
// 测试 "total < 30" 分支（会加 5 元手续费）
ExpressServiceDouble stub = new ExpressServiceDouble(20, 10);
// 如果结果 25 + 20 + 5 = 50，没问题

// 但如果想通过价格区分分支，桩值不要设成一样的
```

### 2. 桩的值要与测试目标匹配

每个测试的桩值应当服务于该测试的目标：

| 测试目标 | fullFee 桩值 | halfFee 桩值 | 输入 | 预期输出 |
|---------|-------------|-------------|------|---------|
| 测试 < 30 分支 | 20 | 10 | 25 | 25 + 20 + 5 = 50 |
| 测试 < 100 分支 | 20 | 10 | 85 | 85 + 20 = 105 |
| 测试 100~150 分支 | 20 | 10 | 110 | 110 + 10 = 120 |

---

## 替身 + 桩 = 隔离依赖

```
被测对象 ──调用──> 替身对象 ──执行──> 桩方法 ──返回──> 预设值
```

通过这种机制，`calculate()` 方法的所有**外部依赖**都被替换为可控的预设值，测试只验证 `calculate()` 自身的逻辑是否正确。

---

## 与其他语言的类比

> [!note] Python（unittest.mock）等效写法
> ```python
> from unittest.mock import Mock
>
> # 创建替身并打桩
> express_mock = Mock(spec=ExpressService)
> express_mock.full_fee.return_value = 20
> express_mock.half_fee.return_value = 10
>
> calculator = PriceCalculator(express_mock)
> assert calculator.calculate(85) == 105
> ```

> [!note] JavaScript（Jest）等效写法
> ```javascript
> const expressStub = {
>   fullFee: () => 20,
>   halfFee: () => 10,
> };
>
> const calculator = new PriceCalculator(expressStub);
> expect(calculator.calculate(85)).toBe(105);
> ```

---

## 本课小结

- **桩（Stub）** 是替身的行为——返回预设结果的方法
- **替身** = 对象级替代，**桩** = 行为级替代
- 打桩的核心是 **重写方法并返回预设值**
- 合理设置桩值，使不同分支产生可区分的测试结果

---

## 练习

现在 `PriceCalculator` 还依赖 `InsureService.fee()`，请为其创建替身并打桩，然后编写测试覆盖 150~200 区间的逻辑。

---

## 参考

- [[reference/test-doubles|测试替身参考]]
- [[0016-test-double|第16课：认识测试替身（Test Double）]]
- [[0018-test-spy|第18课：使用测试间谍（Spy）]]