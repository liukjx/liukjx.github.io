---
title: "测试术语表"
description: "测试术语表 — 中英文对照与释义"
tags: [reference, glossary, testing]
draft: false
---

# 测试术语表 (Glossary)

## 核心概念

| 术语 | 英文 | 释义 |
|------|------|------|
| 单元测试 | Unit Test | 对代码中最小可测试单元（方法/函数）进行验证的测试 |
| 集成测试 | Integration Test | 验证多个单元/模块之间协作的测试 |
| 端到端测试 | E2E Test | 从用户视角验证完整业务流程的测试 |
| 测试切片 | Test Slicing | 按层/范围划分测试，只启动所需的最小环境 |
| 测试先行 | Test-First / TDD | 先编写测试用例，再编写通过测试的实现代码 |

## 测试替身

| 术语 | 英文 | 释义 |
|------|------|------|
| 测试替身 | Test Double | 测试中用来替代真实依赖的对象 |
| 桩 | Stub | 返回预设结果的替身方法 |
| 间谍 | Spy | 记录调用信息的替身，可验证交互行为 |
| 模拟对象 | Mock | 可预设行为并可验证交互的对象（Mockito） |
| 替身类 | Double Class | 通过继承/实现接口创建的替代类 |

## JUnit 相关

| 术语 | 英文 | 释义 |
|------|------|------|
| 测试运行时 | Test Runtime | 执行测试方法的框架（如 JUnit） |
| 断言 | Assertion | 验证实际结果与预期结果是否一致的机制 |
| 测试报告 | Test Report | 测试执行结果的汇总文档 |
| @Test | Test Annotation | 标记方法为 JUnit 测试方法的注解 |

## Spring Boot 测试注解

| 注解 | 用途 |
|------|------|
| @SpringBootTest | 启动完整 Spring Boot 环境（E2E测试） |
| @WebMvcTest | 只启动 Web/MVC 层 |
| @DataJpaTest | 只启动 JPA 数据访问层 |
| @JsonTest | 只启动 JSON 序列化组件 |
| @MockBean | 在 Spring 上下文中替换为 Mock 对象 |
| @WithMockUser | 为 Security 测试提供模拟认证用户 |

## 重构手法

| 手法 | 英文 | 描述 |
|------|------|------|
| 提炼函数 | Extract Function | 将代码块抽取为命名函数 |
| 用查询替代变量 | Replace Variable with Query | 将硬编码值改为查询方法 |
| 组装成类 | Assemble Methods to Class | 将相关函数组织为类 |
| 去除原始类型偏执 | Remove Primitive Obsession | 用对象/枚举替代原始类型 |
| 用查询替代参数 | Replace Parameter with Query | 方法内部查询代替参数传递 |
| 用管道替代循环 | Replace Loop with Pipeline | 用函数式管道替代 for 循环 |
| 用多态取代条件 | Replace Conditional with Polymorphism | 用多态替代 if-else 条件分支 |
| 用函数表达意图 | Express Intent with Functions | 用命名函数表达代码意图 |

## 方法论

| 术语 | 英文 | 释义 |
|------|------|------|
| 红绿重构 | Red-Green-Refactoring | TDD 三步骤循环 |
| AAA | Arrange-Action-Assert | 测试方法体的三段式结构 |
| WWW | What-When-Want | 测试命名方法论 |
| CQS | Command-Query Separation | 命令（修改）与查询（读取）职责分离 |
| TDD | Test-Driven Development | 测试驱动开发 |

## 测试反模式

| 术语 | 释义 |
|------|------|
| 测试坏味道 (Test Smell) | 测试代码中表明设计问题的特征 |
| 脆弱测试 (Fragile Test) | 因实现细节变更而频繁失败的测试 |
| 过度 Mock (Over-mocking) | Mock 了本不需要隔离的依赖 |
| 不稳定断言 (Flaky Assertion) | 多次运行结果不一致的断言 |