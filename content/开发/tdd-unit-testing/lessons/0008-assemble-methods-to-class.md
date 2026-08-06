---
title: 第08课：把函数组装成类
description: 将有相同行为的散落函数组装成一个类的重构手法，从面向过程到面向对象的转换
tags: [tdd, refactoring, oop, class-design, java]
date: 2024-01-01
draft: false
---

# 把函数组装成类

> 覆盖知识点：KP-033

在代码重构的旅程中，我们经常会遇到一类问题：**多个函数做着相似的事情，但却散落在各处**。当看到这种模式时，就该考虑把它们"组装"成一个类了。

## 问题场景：散落的 case 函数

假设在快递费计算中，我们有三个独立的函数分别处理不同的场景：

```java
// 散落在不同地方的三个函数
public double case1(Order order) {
    // 普通快递：20元固定费用
    return 20.0;
}

public double case2(Order order) {
    // 加急快递：按商品总价的10%计算
    double subtotal = order.getItems().stream()
        .mapToDouble(item -> item.getPrice() * item.getQuantity())
        .sum();
    return subtotal * 0.1;
}

public double case3(Order order) {
    // 国际快递：基础费50 + 按重量计算
    double weightFee = order.getItems().stream()
        .mapToDouble(item -> item.getWeight() * 10)
        .sum();
    return 50.0 + weightFee;
}
```

这三个函数有几个共同点：
- 都接收 `Order` 参数
- 都返回 `double` 类型的费用
- 都是快递费计算相关的逻辑

但它们目前是**独立的函数**，没有体现这些共性。

## 重构：组装成类

### 第一步：创建一个类来容纳这些行为

```java
public class ShippingFeeCalculator {
    
    public double calculate(Order order, ShippingType type) {
        switch (type) {
            case NORMAL:
                return case1(order);
            case EXPRESS:
                return case2(order);
            case INTERNATIONAL:
                return case3(order);
            default:
                throw new IllegalArgumentException("Unknown shipping type: " + type);
        }
    }
    
    private double case1(Order order) {
        return 20.0;
    }
    
    private double case2(Order order) {
        double subtotal = order.getItems().stream()
            .mapToDouble(item -> item.getPrice() * item.getQuantity())
            .sum();
        return subtotal * 0.1;
    }
    
    private double case3(Order order) {
        double weightFee = order.getItems().stream()
            .mapToDouble(item -> item.getWeight() * 10)
            .sum();
        return 50.0 + weightFee;
    }
}
```

### 第二步：引入枚举类型

```java
public enum ShippingType {
    NORMAL,      // 普通快递
    EXPRESS,     // 加急快递
    INTERNATIONAL // 国际快递
}
```

### 第三步：在 OrderService 中使用

```java
public class OrderService {
    private ShippingFeeCalculator shippingCalculator = new ShippingFeeCalculator();
    
    public double calculateTotal(Order order) {
        double subtotal = order.getItems().stream()
            .mapToDouble(item -> item.getPrice() * item.getQuantity())
            .sum();
        double shippingFee = shippingCalculator.calculate(order, order.getShippingType());
        return subtotal + shippingFee;
    }
}
```

## 测试这个类

```java
class ShippingFeeCalculatorTest {
    private ShippingFeeCalculator calculator = new ShippingFeeCalculator();
    
    @Test
    void should_calculate_normal_shipping_fee() {
        Order order = new Order();
        order.setShippingType(ShippingType.NORMAL);
        
        double fee = calculator.calculate(order, ShippingType.NORMAL);
        
        assertEquals(20.0, fee, 0.001);
    }
    
    @Test
    void should_calculate_express_shipping_fee() {
        Order order = new Order();
        order.addItem(new Item("book", 100.0, 1));
        order.setShippingType(ShippingType.EXPRESS);
        
        double fee = calculator.calculate(order, ShippingType.EXPRESS);
        
        assertEquals(10.0, fee, 0.001);  // 100 * 0.1 = 10
    }
    
    @Test
    void should_calculate_international_shipping_fee() {
        Order order = new Order();
        order.addItem(new Item("book", 100.0, 1));
        order.setShippingType(ShippingType.INTERNATIONAL);
        
        double fee = calculator.calculate(order, ShippingType.INTERNATIONAL);
        
        assertEquals(60.0, fee, 0.001);  // 50 + 10 = 60
    }
}
```

## 从面向过程到面向对象

这个重构过程实际上是一次**范式转换**：

```mermaid
flowchart LR
    subgraph ”重构前：面向过程”
        A1[”函数 case1()”] 
        A2[”函数 case2()”]
        A3[”函数 case3()”]
    end
    
    subgraph ”重构后：面向对象”
        B[”ShippingFeeCalculator<br/>类”]
        B1[”方法 case1()”]
        B2[”方法 case2()”]
        B3[”方法 case3()”]
    end
    
    A1 --> B1
    A2 --> B2
    A3 --> B3
```

| 维度 | 面向过程（重构前） | 面向对象（重构后） |
|------|-------------------|-------------------|
| 组织单位 | 函数 | 类 |
| 数据与行为 | 分离 | 聚合 |
| 扩展性 | 新增函数散落各处 | 新增方法在类内 |
| 测试性 | 函数级别测试 | 类级别测试 |
| 可复用性 | 按需导入函数 | 通过类/接口复用 |
| 命名空间 | 全局命名空间 | 类命名空间 |

## 组装成类的判断标准

什么时候应该把散落的函数组装成类？

1. **共享输入数据**：多个函数操作相同或相似的数据结构
2. **业务概念一致**：函数属于同一个业务领域（如快递费计算）
3. **变化频率一致**：它们往往因为同一个原因而改变
4. **测试维度一致**：可以在同一个测试类中集中验证

> [!tip] 单一职责原则
> 类应该只有一个引起它变化的原因。ShippingFeeCalculator 的职责就是"计算快递费"，这是一个清晰且单一的职责。

## 进一步演进：多态方案

当 case 分支越来越多时，可以考虑用多态替代 switch：

```java
public interface ShippingFeeStrategy {
    double calculate(Order order);
}

public class NormalShippingFee implements ShippingFeeStrategy {
    public double calculate(Order order) {
        return 20.0;
    }
}

public class ExpressShippingFee implements ShippingFeeStrategy {
    public double calculate(Order order) {
        // ...
    }
}

public class InternationalShippingFee implements ShippingFeeStrategy {
    public double calculate(Order order) {
        // ...
    }
}
```

这是第4章 [[0024-replace-conditional-with-polymorphism|用多态取代条件]] 的内容，会在后续课程中详细展开。

> [!note] 其他语言的等效实践
> - **Python**：将散落的函数组装为类（class），用法与 Java 类似，但 Python 的 `__call__` 魔法方法可以让实例像函数一样调用
> - **Go**：将散落的函数归入一个 struct 的方法集中，或使用接口（interface）定义行为契约
> - **JavaScript**：使用 ES6 class 将相关函数归为方法，或使用模块（Module）导出包含相关函数的对象
> - **本质**：核心都是**将散落的逻辑按业务领域归拢**，提高内聚性

---

> 组装成类是提升代码组织结构的关键技巧。在[[0009-replace-query-for-variable|第09课]]中，我们将学习如何用查询来替代硬编码变量，进一步消除魔法数字。这两种手法都是[[0012-refactoring-methodology|第12课：重构的方法论]]中三种核心手法的重要组成部分。