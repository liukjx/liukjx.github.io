---
title: 第09课：用查询来替代变量
description: 把硬编码常量改为通过查询方法获取，消除魔法数字，提高代码可维护性
tags: [tdd, refactoring, query-method, magic-number, maintainability, java]
date: 2024-01-01
draft: false
---

# 用查询来替代变量

> 覆盖知识点：KP-034

魔法数字（Magic Number）是代码中最常见的坏味道之一。当代码中出现一个"意义不明的字面量"时，读代码的人会陷入困惑：**这个数字是哪里来的？为什么要用这个值？它会不会变？**

"用查询来替代变量"（Replace Query for Variable）正是解决这个问题的重构手法。

## 问题场景：硬编码的快递费

回到上节课的快递费计算：

```java
public class ShippingFeeCalculator {
    
    private double case1(Order order) {
        return 20.0;  // 这个 20.0 是什么？
    }
    
    private double case2(Order order) {
        double subtotal = order.getItems().stream()
            .mapToDouble(item -> item.getPrice() * item.getQuantity())
            .sum();
        return subtotal * 0.1;  // 这个 0.1 又是什么？
    }
}
```

20.0 是普通快递费，0.1 是加急快递费率——但代码本身**没有表达这些意图**。

## 重构手法：用查询方法替代硬编码

### 第一步：提取为私有查询方法

```java
public class ShippingFeeCalculator {
    
    private double case1(Order order) {
        return normalShippingFee();
    }
    
    private double case2(Order order) {
        double subtotal = order.getItems().stream()
            .mapToDouble(item -> item.getPrice() * item.getQuantity())
            .sum();
        return subtotal * expressShippingRate();
    }
    
    private double normalShippingFee() {
        return 20.0;
    }
    
    private double expressShippingRate() {
        return 0.1;
    }
}
```

### 第二步：在测试中使用查询方法

```java
class ShippingFeeCalculatorTest {
    private ShippingFeeCalculator calculator = new ShippingFeeCalculator();
    
    @Test
    void normal_shipping_fee_should_equal_configured_rate() {
        Order order = new Order();
        order.setShippingType(ShippingType.NORMAL);
        
        double fee = calculator.calculate(order, ShippingType.NORMAL);
        
        // 不再硬编码 20.0，而是通过查询方法获取期望值
        assertEquals(20.0, fee, 0.001);
    }
}
```

## 为什么使用查询方法？

```mermaid
flowchart TD
    subgraph ”重构前”
        A[”return 20.0;”] --> B[”意义不明的字面量”]
        B --> C[”修改时需要全局搜索”]
        C --> D[”容易遗漏或改错”]
    end
    
    subgraph ”重构后”
        E[”return normalShippingFee();”] --> F[”方法名表达了意图”]
        F --> G[”修改时只改一处”]
        G --> H[”安全可靠”]
    end
```

| 问题 | 硬编码变量 | 查询方法 |
|------|-----------|---------|
| 意图表达 | 不清晰（20.0 是什么？） | 清晰（`normalShippingFee()`） |
| 修改成本 | 全文搜索替换 | 修改方法体一处 |
| 测试性 | 只能硬编码断言 | 可通过方法统一验证 |
| 可维护性 | 低 | 高 |
| 重复 | 可能在多处出现相同魔法数字 | 消除重复 |

## 应用场景扩展

这种重构手法不仅适用于数字常量，也适用于其他类型的硬编码值：

```java
// 重构前：硬编码字符串
public String formatAddress(Order order) {
    return order.getProvince() + "省" + order.getCity() + "市";  // "省"和"市"也是魔法值
}

// 重构后：查询方法
public String formatAddress(Order order) {
    return order.getProvince() + provinceSuffix() + order.getCity() + citySuffix();
}

private String provinceSuffix() {
    return "省";
}

private String citySuffix() {
    return "市";
}
```

## 查询方法的三个层次

查询方法可以有不同的"来源"层次：

| 层次 | 示例 | 适用场景 |
|------|------|----------|
| **硬编码查询** | `return 20.0;` | 固定不变的配置 |
| **配置查询** | `return config.getShippingFee();` | 环境相关的配置值 |
| **计算查询** | `return baseRate * weight * distance;` | 动态计算的值 |

```java
// 层次一：硬编码查询（临时方案）
private double normalShippingFee() {
    return 20.0;
}

// 层次二：配置查询（后续演进）
private double normalShippingFee() {
    return shippingConfig.getNormalFee();  // 从配置文件读取
}

// 层次三：计算查询（完整方案）
private double normalShippingFee(Order order) {
    return rateService.getBaseRate() * order.getWeight();
}
```

> [!tip] 渐进式优化
> 不必一步到位。可以先从**硬编码查询**开始，后续随着系统演进，再升级为**配置查询**或**计算查询**。关键在于**先把意图表达清楚**。

## 与 Extract Constant 的区别

初学者可能会问："这不就是提取常量（Extract Constant）吗？"

实际上两者有本质区别：

| 维度 | Extract Constant | Replace Query for Variable |
|------|------------------|---------------------------|
| 产出 | 常量字段 | 方法 |
| 灵活性 | 编译期固定 | 运行时计算 |
| 重写能力 | 不能被子类重写 | 可被子类重写/Override |
| 测试替身 | 无法 Mock | 可通过继承/接口 Mock |
| 适用场景 | 真正永恒不变的量 | 可能会变的业务规则 |

```java
// Extract Constant：适用于数学常数等
private static final double PI = 3.14159;

// Replace Query：适用于业务规则
private double normalShippingFee() {
    return 20.0;  // 业务规则可能变化
}
```

> [!note] 其他语言的等效实践
> - **Python**：使用 `@property` 装饰器把硬编码值变成属性查询方法，或使用配置模块统一管理业务常量
> - **Go**：使用函数或方法替代常量，Go 的接口机制天然支持将常量的获取抽象为方法调用
> - **JavaScript**：使用函数或 getter（`get normalShippingFee()`）替代硬编码字面量
> - **本质**：核心是**将"是什么值"的语义转化为"如何获取值"的行为抽象**，为后续变化预留扩展点

---

> 用查询替代变量是消除魔法数字的标准手法。在[[0010-test-scope-unit|第10课]]中，我们将深入探讨单元测试的范围概念——理解了查询方法的本质，你就已经掌握了"单一职责"的微观体现。本课与[[0004-extract-function-refactoring|第04课：提炼函数]]、[[0008-assemble-methods-to-class|第08课：把函数组装成类]]共同构成了[[0012-refactoring-methodology|第12课：重构的方法论]]的三大核心手法。