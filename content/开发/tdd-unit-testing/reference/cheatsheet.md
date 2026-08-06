---
title: "重构手法速查表"
description: "重构手法速查表 — 名称、描述、示例与应用场景"
tags: [reference, refactoring, cheatsheet]
draft: false
---

# 重构手法速查表

## 基础手法

| 手法 | 英文 | 描述 | 场景 |
|------|------|------|------|
| 提炼函数 | Extract Function | 将代码块抽取为独立的命名函数 | 方法体过长、重复代码 |
| 组装成类 | Assemble Methods to Class | 将相关函数组织成类 | 多个函数共享状态或行为 |
| 用查询替代变量 | Replace Variable with Query | 将硬编码值改为方法查询 | 魔法数字、可变常量 |

## 中级手法

| 手法 | 英文 | 描述 | 场景 |
|------|------|------|------|
| 去除原始类型偏执 | Remove Primitive Obsession | 用对象/枚举替代原始类型 | 业务概念用 String/int 表示 |
| 用查询替代参数 | Replace Parameter with Query | 方法内部查询替代参数传递 | 参数可从别的来源推导 |
| 用管道替代循环 | Replace Loop with Pipeline | 用 Stream API 替代 for 循环 | 集合遍历、过滤、转换 |
| 用函数表达意图 | Express Intent with Functions | 用命名函数封装条件/逻辑 | 复杂条件表达式 |

## 高级手法

| 手法 | 英文 | 描述 | 场景 |
|------|------|------|------|
| 用多态取代条件 | Replace Conditional with Polymorphism | 用多态替代 if-else 分支 | 多个条件分支、策略模式 |
| 变量作用域上移 | Move Variable to Higher Scope | 将局部变量提升为成员变量 | 多个方法共享同一依赖 |

## 代码对比

### 去除原始类型偏执
```java
// ❌ Before
if ("GOLD".equals(level)) discount = 10;
else if ("SILVER".equals(level)) discount = 5;
else discount = 0;

// ✅ After
enum UserLevel {
    GOLD(10), SILVER(5), NORMAL(0);
    final int discount;
    UserLevel(int discount) { this.discount = discount; }
}
// total = total - level.discount;
```

### 用管道替代循环
```java
// ❌ Before
List<String> result = new ArrayList<>();
for (User u : users) {
    if (u.isActive()) {
        result.add(u.getName().toUpperCase());
    }
}

// ✅ After
var result = users.stream()
    .filter(User::isActive)
    .map(u -> u.getName().toUpperCase())
    .collect(Collectors.toList());
```

### 用多态取代条件
```java
// ❌ Before
if (type.equals("EMAIL")) {
    sendEmail(user);
} else if (type.equals("SMS")) {
    sendSms(user);
}

// ✅ After
interface Notifier { void send(User user); }
class EmailNotifier implements Notifier { ... }
class SmsNotifier implements Notifier { ... }
// notifier.send(user);
```

### 用查询替代参数
```java
// ❌ Before
public int calcPrice(int a, int b, int expressFee) {
    return a + b + expressFee;
}
// 调用方每次都要传 expressFee

// ✅ After
public int calcPrice(int a, int b) {
    return a + b + getTodayExpressFee();
}
private int getTodayExpressFee() {
    return expressConfigService.getTodayPrice();
}
```

## 重构节奏

```
小步提交 → 运行测试 → 继续重构
    ↑            |
    └──── 测试通过 ┘
```

> 每做一步改动就运行一次测试，确保不破坏现有功能。