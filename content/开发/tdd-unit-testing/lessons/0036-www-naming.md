---
title: "第36课：WWW 命名方法论"
description: "KP-150 ~ KP-152 — 掌握测试方法命名的 WWW 模式：What（测什么方法）+ When（什么场景下）+ Want（期望什么结果）"
tags: [tdd, naming, www, methodology, unit-testing]
date: 2026-07-06
draft: false
---

# 第36课：WWW 命名方法论

## 概述

测试方法的名字就是测试的**第一行文档**。一个清晰、自解释的测试方法名能让读者一眼看懂测试的意图。WWW 命名方法论正是为此而生。

> **WWW = What + When + Want**

---

## WWW 三要素

| 要素 | 含义 | 英文 | 说明 |
|------|------|------|------|
| **What** | 测什么方法 | 被测的方法名 | 通常是动词 |
| **When** | 什么场景下 | 给定的场景/条件 | given... 前缀 |
| **Want** | 期望什么结果 | 期望的行为或返回值 | should.../will... 前缀 |

### 公式

```
{What}_{When}_{Want}
```

### 示例

```java
// What: signIn
// When: givenValidSignInfo（合法登录信息）
// Want: willReturnUserId（返回用户ID）
@Test
void signIn_givenValidSignInfo_willReturnUserId() {
    // ...
}

// What: signIn
// When: givenInvalidPassword（错误密码）
// Want: willThrowException（抛出异常）
@Test
void signIn_givenInvalidPassword_willThrowException() {
    // ...
}

// What: findByUsername
// When: givenExistingUser（用户存在）
// Want: willReturnUser（返回用户对象）
@Test
void findByUsername_givenExistingUser_willReturnUser() {
    // ...
}

// What: calculatePrice
// When: givenTotalAbove100（总额大于100）
// Want: willReturnOriginalPrice（返回原价）
@Test
void calculatePrice_givenTotalAbove100_willReturnOriginalPrice() {
    // ...
}
```

---

## 下划线分割 vs 驼峰风格

测试方法名中，WWW 三段通常用**下划线** `_` 分割，而每段内部使用**驼峰**风格：

| 风格 | 示例 | 可读性 |
|------|------|--------|
| 下划线分割 + 驼峰 | `signIn_givenValidInfo_willReturnUserId` | 高（三段分明） |
| 全驼峰 | `signInGivenValidInfoWillReturnUserId` | 低（单词挤在一起） |
| 全小写 | `signin_given_valid_info_will_return_user_id` | 中（过长） |

> 推荐的风格：`{method}_{given场景}_{will期望}`——下划线切分三段，每段内部驼峰。

---

## 中文命名的可行性

WWW 模式同样可以用中文命名，关键是把事情说清楚。

```java
// 中文命名同样可行
@Test
void 登录_给合法参数_返回用户ID() {
    // ...
}

@Test
void 登录_给错误密码_抛出异常() {
    // ...
}

@Test
void 查询用户_用户名存在_返回用户对象() {
    // ...
}
```

> 中文命名的优势是**团队成员母语阅读速度快**；劣势是**中英文混搭可能不统一**。团队约定一致即可。

---

## 命名中的关键词选择

| 场景部分 | 常用前缀 | 示例 |
|----------|----------|------|
| 正常场景 | `givenValid...` / `givenExisting...` | `givenValidPassword` |
| 异常场景 | `givenInvalid...` / `givenMissing...` | `givenInvalidUsername` |
| 边界场景 | `givenEmpty...` / `givenNull...` | `givenEmptyList` |
| 权限场景 | `givenUnauthorized...` / `givenGuest...` | `givenUnauthorizedUser` |

| 期望部分 | 常用前缀 | 示例 |
|----------|----------|------|
| 返回结果 | `willReturn...` | `willReturnUserId` |
| 抛出异常 | `willThrow...` / `willThrowException` | `willThrowNotFoundException` |
| 调用验证 | `willCall...` / `shouldInvoke...` | `willCallRepository` |
| 状态变更 | `willChange...` / `willUpdate...` | `willUpdateStatusToInactive` |

---

## WWW 命名 vs 传统命名

```mermaid
graph LR
    subgraph ”传统命名”
        A[”test1()<br/>❌ 无意义”]
        B[”testSignIn()<br/>⚠️ 缺少场景”]
        C[”testSignInWithValidInfo()<br/>⚠️ 缺少期望”]
    end

    subgraph ”WWW 命名”
        D[”signIn_givenValidInfo_willReturnUserId()<br/>✅ 完整清晰”]
    end

    A -.->|”看不懂”| D
    B -.->|”什么场景?”| D
    C -.->|”期望什么?”| D
```

---

## 与 AAA 模式的对应关系

WWW 命名与 [[0037-aaa-pattern|AAA 模式]] 存在自然的映射：

| WWW | AAA | 对应关系 |
|-----|-----|----------|
| **What**（方法名）| **Arrange**（准备）| What 决定了 Arrange 阶段要准备什么 |
| **When**（场景）| **Action**（执行）| When 描述的场景对应 Action 阶段的输入参数 |
| **Want**（期望）| **Assert**（断言）| Want 是断言阶段的验证目标 |

> 完整示例参见 [[reference/aaa-www-pattern|AAA 与 WWW 模式参考]]

---

## 坏味道：命名与测试体不匹配

```java
// ❌ 坏味道：名字说"合法参数"，但实际传了 null
@Test
void signIn_givenValidSignInfo_willReturnUserId() {
    var result = authService.signIn(null);  // 传了 null！
    assertEquals(0, result);
}
```

> **命名是承诺。** 测试名称必须忠实反映测试体内的场景和断言。

---

## 静态收束

测试方法的命名不仅是名字的选择，更是**测试意图的声明**。WWW 方法论通过 What、When、Want 三要素，强制开发者先想清楚"测什么、什么条件、期望什么"，然后才动手写测试体。一个良好的命名习惯，能让测试集成为项目中最可靠的文档。