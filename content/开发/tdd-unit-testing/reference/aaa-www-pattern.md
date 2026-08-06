---
title: "AAA 与 WWW 模式参考"
description: "AAA 与 WWW 模式参考 — 测试命名与结构的方法论"
tags: [reference, aaa, www, methodology]
draft: false
---

# AAA 与 WWW 模式参考

## WWW 命名方法论

### 公式
```
{被测方法}_{给定场景}_{期望结果}
What        When          Want
```

### 示例

| What | When | Want | 完整名称 |
|------|------|------|----------|
| signIn | givenValidInfo | willReturnUserId | `signIn_givenValidInfo_willReturnUserId` |
| signIn | givenInvalidPassword | willThrowException | `signIn_givenInvalidPassword_willThrowException` |
| findByUsername | givenExistingUser | willReturnUser | `findByUsername_givenExistingUser_willReturnUser` |
| calculatePrice | givenTotalAbove100 | willReturnOriginalPrice | `calculatePrice_givenTotalAbove100_willReturnOriginalPrice` |
| calculatePrice | givenTotalBelow50 | willAddExpressFee | `calculatePrice_givenTotalBelow50_willAddExpressFee` |

### 命名原则

1. **What**: 被测的方法名（动词）
2. **When**: 测试的场景/条件（given...）
3. **Want**: 期望的结果（should.../will...）

> 关键是"把事情说清楚"，而非拘泥于格式。中文命名同样可行：`登录_给合法参数_返回用户ID`

---

## AAA 方法论

### 公式
```java
@Test
void method_givenScenario_willExpectedResult() {
    // Arrange — 准备阶段
    // 创建测试替身、设置预期、准备输入数据
    
    // Action — 执行阶段
    // 调用被测方法
    
    // Assert — 断言阶段
    // 验证结果是否符合预期
}
```

### 阶段详解

| 阶段 | 职责 | 典型操作 |
|------|------|----------|
| **Arrange** | 搭建测试场景 | new 对象、Mock 行为、准备参数、设置 Stub |
| **Action** | 驱动被测代码 | 调用目标方法、发送 HTTP 请求 |
| **Assert** | 验证行为正确 | assertEquals、verify、andExpect |

### 完整示例

```java
@Test
void calculatePrice_givenTotal90_willAddExpressFee20() {
    // Arrange
    var calculator = new PriceCalculator();
    var expressServiceMock = mock(ExpressService.class);
    when(expressServiceMock.getTodayPrice()).thenReturn(20);
    calculator.setExpressService(expressServiceMock);
    
    // Action
    var result = calculator.calculatePrice(70, 20);  // total = 90
    
    // Assert
    assertEquals(110, result);
}
```

### 反例: 缺少 AAA 结构

```java
// ❌ 坏味道：准备、执行、断言混在一起
@Test
void test() {
    var calc = new PriceCalculator();
    var result = calc.calculatePrice(70, 20);
    when(expressService.getTodayPrice()).thenReturn(20); // 准备放在执行后
    assertEquals(result, 110); // 参数顺序错误
}
```

## AAA + WWW 结合

```mermaid
graph LR
    subgraph ”测试命名 (WWW)”
        WHAT[”What: 被测方法”]
        WHEN[”When: 场景条件”]
        WANT[”Want: 期望结果”]
    end
    
    subgraph ”测试方法体 (AAA)”
        ARRANGE[”Arrange: 准备”]
        ACTION[”Action: 执行”]
        ASSERT[”Assert: 断言”]
    end
    
    WHAT --> ARRANGE
    WHEN --> ACTION
    WANT --> ASSERT
```