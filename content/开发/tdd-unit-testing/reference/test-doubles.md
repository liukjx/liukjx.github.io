---
title: "测试替身参考"
description: "测试替身参考 — Stub、Spy、Mock 的概念、区别与使用场景"
tags: [reference, test-doubles, mock, stub, spy]
draft: false
---

# 测试替身参考

## 概念关系

```mermaid
graph TD
    TD[”测试替身 (Test Double)”]
    TD --> Stub[”桩 (Stub)<br/>返回预设值”]
    TD --> Spy[”间谍 (Spy)<br/>记录调用信息”]
    TD --> Mock[”模拟对象 (Mock)<br/>预设行为 + 验证交互”]
    TD --> Dummy[”哑元 (Dummy)<br/>占位无逻辑”]
    TD --> Fake[”伪造 (Fake)<br/>轻量实现”]
```

## 三种主要替身对比

| 特性 | Stub（桩） | Spy（间谍） | Mock（模拟） |
|------|-----------|-------------|--------------|
| 返回预设值 | ✅ 是 | ✅ 是 | ✅ 是 |
| 记录调用次数 | ❌ 否 | ✅ 是 | ✅ 是 |
| 验证调用参数 | ❌ 否 | ✅ 是 | ✅ 是 |
| 验证调用顺序 | ❌ 否 | ✅ 是 | ✅ 是 |
| 典型实现 | 手动继承 + 重写 | 手动记录调用 | Mockito 框架 |

## 手动实现示例

### Stub
```java
// 通过继承创建替身
class PriceCalculatorStub extends PriceCalculator {
    private int expectedPrice;
    
    public PriceCalculatorStub(int expectedPrice) {
        this.expectedPrice = expectedPrice;
    }
    
    @Override
    public int sum(int a, int b) {
        return expectedPrice;  // 返回预设值
    }
}
```

### Spy
```java
// 通过继承创建间谍
class ExpressServiceSpy extends ExpressService {
    private int callCount = 0;
    private List<Integer> calledParams = new ArrayList<>();
    
    @Override
    public int getTodayPrice() {
        callCount++;
        return 20;
    }
    
    public int getCallCount() { return callCount; }
    
    public boolean wasCalled() { return callCount > 0; }
}
```

### Mock (Mockito)
```java
// 使用 Mockito 框架
@Mock
private UserRepository userRepository;

@Test
void test() {
    // 预设行为 (Stub)
    when(userRepository.findByUsername("test"))
        .thenReturn(new User("test", "pass"));
    
    // 验证交互 (Mock)
    verify(userRepository).findByUsername("test");
    verify(userRepository, times(1)).findByUsername(any());
}
```

## Mockito 常用 API

### 创建 Mock
```java
// 注解方式
@Mock
private UserRepository userRepository;

// 编程方式
var mock = mock(UserRepository.class);
```

### 预设行为 (Stubbing)
```java
// 基本返回
when(mock.findByUsername("test")).thenReturn(user);

// 异常
when(mock.findByUsername(any())).thenThrow(new RuntimeException());

// 多次调用不同返回
when(mock.findByUsername(any()))
    .thenReturn(user1)
    .thenReturn(user2);
```

### 验证交互 (Verification)
```java
// 验证是否被调用
verify(mock).findByUsername("test");

// 验证调用次数
verify(mock, times(1)).findByUsername(any());
verify(mock, never()).deleteById(any());
verify(mock, atLeast(1)).findByUsername(any());

// 验证无多余交互
verifyNoMoreInteractions(mock);
```

## 选择指南

| 场景 | 推荐方式 |
|------|----------|
| 依赖简单，只需返回固定值 | 手动 Stub |
| 需要验证方法是否被调用 | Spy / Mockito verify |
| 需要验证调用次数 | Mockito verify(times) |
| 依赖复杂，多个返回值 | Mockito |
| 测试遗留代码，无法使用框架 | 手动 Stub / Spy |