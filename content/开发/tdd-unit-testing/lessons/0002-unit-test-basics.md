---
title: 第02课：单元测试基础
description: 从一个简单的 sum 函数开始，理解测试用例和单元测试的本质
tags: [unit-test, test-case, basics]
date: 2024-01-01
draft: false
---

# 第02课：单元测试基础

> 覆盖知识点：KP-010 ~ KP-012

## 1. 从一个简单的 sum 函数开始

假设我们需要一个对两个整数求和的函数：

```java
public class Calculator {
    public int sum(int a, int b) {
        return a + b;
    }
}
```

### 手动测试

在没有单元测试框架的情况下，我们通常用 `main` 方法手动验证：

```java
public class Calculator {
    public int sum(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        Calculator calc = new Calculator();
        int result = calc.sum(1, 2);
        System.out.println("1 + 2 = " + result);  // 期望输出 3
    }
}
```

这种方式的问题很明显：
- 每次都要手动查看输出
- 改代码后容易忘记重新运行
- 无法自动化，不能作为回归保护
- 测试代码和生产代码混在一起

## 2. Case（测试用例）的概念

**测试用例 (Test Case)** 是对一个特定场景的输入-输出描述。

对于 `sum` 函数，我们可以定义多个 case：

| Case | 输入 (a, b) | 期望输出 | 场景描述 |
|------|-------------|----------|----------|
| Case 1 | 1, 2 | 3 | 两个正数相加 |
| Case 2 | -1, 1 | 0 | 正负数抵消 |
| Case 3 | 0, 0 | 0 | 零值相加 |
| Case 4 | Integer.MAX_VALUE, 1 | Integer.MIN_VALUE | 整数溢出 |
| Case 5 | -5, -3 | -8 | 两个负数相加 |

> 一个好的测试用例集应该覆盖**正常路径**、**边界值**和**异常情况**。仅靠一个 case 永远不够。

## 3. 单元测试 = 用不同 case 对方法调用结果进行验证的函数

单元测试的本质就是**一个函数，它调用被测试的方法，并用断言验证结果是否符合预期**。

### 纯 Java 单元测试示例（无框架）

```java
public class CalculatorTest {

    public static void main(String[] args) {
        CalculatorTest test = new CalculatorTest();
        test.should_return_3_when_sum_1_and_2();
        test.should_return_0_when_sum_negative_1_and_1();
        test.should_return_negative_8_when_sum_negative_5_and_negative_3();
        System.out.println("所有测试通过！");
    }

    // Case 1: 1 + 2 = 3
    public void should_return_3_when_sum_1_and_2() {
        Calculator calc = new Calculator();
        int result = calc.sum(1, 2);
        assertEqual(3, result, "1 + 2 应该等于 3");
    }

    // Case 2: -1 + 1 = 0
    public void should_return_0_when_sum_negative_1_and_1() {
        Calculator calc = new Calculator();
        int result = calc.sum(-1, 1);
        assertEqual(0, result, "-1 + 1 应该等于 0");
    }

    // Case 3: (-5) + (-3) = -8
    public void should_return_negative_8_when_sum_negative_5_and_negative_3() {
        Calculator calc = new Calculator();
        int result = calc.sum(-5, -3);
        assertEqual(-8, result, "-5 + (-3) 应该等于 -8");
    }

    // 简单的断言工具方法
    private void assertEqual(int expected, int actual, String message) {
        if (expected != actual) {
            throw new AssertionError(message + "，期望: " + expected + "，实际: " + actual);
        }
    }
}
```

运行这个测试类，如果所有断言都通过，控制台输出"所有测试通过！"；如果有任何一个 case 失败，程序会抛出 `AssertionError` 并终止。

### 单元测试的三要素结构

每个测试 case 通常遵循这样的结构：

```
1. 准备（Arrange）— 创建被测试对象和测试数据
2. 执行（Act）— 调用被测试方法
3. 断言（Assert）— 验证结果是否符合预期
```

> 这种 Arrange-Act-Assert 模式，就是后面 [[0037-aaa-pattern|第37课：AAA 方法论]] 要深入讲解的内容。

## 4. 单元测试的作用与价值

| 作用 | 说明 |
|------|------|
| **质量保证** | 自动验证代码行为符合预期 |
| **回归保护** | 修改代码后，运行测试确保没有破坏原有功能 |
| **文档作用** | 测试用例本身就是"可执行的需求文档"，描述代码应该做什么 |
| **设计反馈** | 难以测试的代码往往意味着设计有问题 |

> 这三者中最容易被忽视的是**文档作用**。好的测试用例集合比任何文档都更有说服力——它们不会过时，因为过时的测试会失败。

### 质量保证示意图

```mermaid
graph TD
    subgraph ”无测试”
        A[修改代码] --> B[手动检查]
        B --> C[容易遗漏]
    end

    subgraph ”有测试”
        D[修改代码] --> E[运行测试]
        E --> F{全部通过？}
        F -->|是| G[放心提交]
        F -->|否| H[定位修复]
    end
```

## 5. 其他语言的等价写法

> [!tip] 跨语言视角
> 单元测试的思想与语言无关。无论使用什么语言，核心都是**定义测试用例 → 执行被测试代码 → 验证结果**。

**Python 等效写法：**

```python
# test_calculator.py
def test_sum_returns_3_when_1_plus_2():
    result = Calculator().sum(1, 2)
    assert result == 3, f"期望 3，实际 {result}"

def test_sum_returns_0_when_negative_1_plus_1():
    result = Calculator().sum(-1, 1)
    assert result == 0, f"期望 0，实际 {result}"
```

**Go 等效写法：**

```go
// calculator_test.go
func TestSum(t *testing.T) {
    calc := Calculator{}
    result := calc.Sum(1, 2)
    if result != 3 {
        t.Errorf("期望 3，实际 %d", result)
    }
}
```

## 6. 参考资料

- [[reference/glossary|测试术语表]] — 查看"单元测试"、"测试用例"等术语定义
- [[0037-aaa-pattern|第37课：AAA 方法论]] — 深入学习三要素结构

---

## 练习与自测

1. **动手写**：为 `Calculator` 的 `sum` 方法补充 Case 4（整数溢出）和 Case 5（两个负数相加）的测试。
2. **思考**：如果一个函数接收 `String` 参数并返回其长度，你应该设计哪些测试 case？（提示：空字符串、空格字符串、null 等）
3. **理解**：单元测试的三要素（Arrange-Act-Assert）中，如果不做 Assert 步骤，这个"测试"还有意义吗？
4. **预习**：下一课 [[0003-test-as-daemon|第03课：测试与守护进程]] 将介绍如何让测试持续运行，像守护进程一样守护代码质量。