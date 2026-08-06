---
title: "CQS 方法论参考"
description: "CQS（命令查询分离）方法论参考 — 原则、示例与应用"
tags: [reference, cqs, design-principle]
draft: false
---

# CQS 方法论参考

## 核心原则

**CQS (Command-Query Separation)** — 每个方法要么是**命令**（执行动作），要么是**查询**（返回数据），但不应兼而有之。

### 定义

| 类型 | 英文 | 特点 | 副作用 |
|------|------|------|--------|
| **命令** | Command (Modifier) | 修改状态，通常返回 void | 有副作用 |
| **查询** | Query | 返回数据，不改变状态 | 无副作用 |

### 对比

```mermaid
graph LR
    subgraph ”命令 (Command)”
        C[”deleteUser(id)<br/>void”]
        C_SIDE[”副作用: 删除数据库记录”]
    end
    
    subgraph ”查询 (Query)”
        Q[”findUser(id)<br/>User”]
        Q_SIDE[”无副作用<br/>无论查多少次结果不变”]
    end
```

## 命令 vs 查询

### 命令示例
```java
// 命令：有副作用，修改状态
public void deleteUser(Long userId) {
    userRepository.deleteById(userId);
}

public void closeUserBind(String username) {
    var user = userRepository.findByUsername(username);
    // ... 执行关闭操作
}
```

### 查询示例
```java
// 查询：无副作用，只返回数据
public User findByUsername(String username) {
    return userRepository.findByUsername(username);
}

public BigDecimal getTodayExpressPrice() {
    return expressConfigService.getTodayPrice();
}
```

## 时序问题与 CQS

### 问题场景
```java
// ❌ 违反 CQS：同一个方法又查询又删除
public void closeUserBind(String username) {
    // 查询
    var user = userRepository.findByUsername(username);
    // ... 一些操作 ...
    // 命令 (但此时可能 user 已被其他线程删除)
    userRepository.deleteById(user.getId());
}
```

### CQS 解决后的方案
```java
// ✅ 遵循 CQS：查询与命令分离

// Controller 层
public void closeUserBind(String username) {
    // 查询 (在 Controller 中完成)
    var user = userService.findByUsername(username);
    // 命令 (传入查询结果)
    userService.deleteUser(user.getId());
}

// Service 层
public User findByUsername(String username) {
    return userRepository.findByUsername(username);  // 查询
}

public void deleteUser(Long userId) {
    userRepository.deleteById(userId);  // 命令
}
```

## CQS 驱动架构平衡

### 问题："干巴巴的 Controller"
```java
// ❌ Controller 只有一行调用
@PostMapping("/closeBind")
public void closeBind(@RequestParam String username) {
    userService.closeUserBind(username);  // 全部逻辑在 Service
}
```

### CQS 改进后
```java
// ✅ Controller 有自己的行为逻辑
@PostMapping("/closeBind")
public void closeBind(@RequestParam String username) {
    var user = userQueryService.findByUsername(username);  // 查询在 Controller
    userCommandService.deleteUser(user.getId());            // 命令也在 Controller
}
```

## CQS 在微服务中的应用

CQS 原则可从方法级别扩展到服务级别：

- **查询服务 (Query Service)**: 只读接口，负责数据查询
- **命令服务 (Command Service)**: 写接口，负责数据变更

## CQS 与单元测试

CQS 让测试更容易:
- 查询方法：只需要验证返回值，不需要关心状态变更
- 命令方法：只需要验证副作用是否发生

```java
// 查询测试
@Test
void findByUsername_whenUserExists_willReturnUser() {
    var user = userService.findByUsername("test");
    assertNotNull(user);
}

// 命令测试
@Test
void deleteUser_whenUserExists_willRemoveFromDB() {
    userService.deleteUser(1L);
    verify(userRepository).deleteById(1L);  // 验证副作用
}
```