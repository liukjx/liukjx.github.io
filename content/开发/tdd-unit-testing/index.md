---
title: "AI编程幻觉终结者：TDD + 重构驱动的单元测试实战"
description: "TDD + 重构驱动的单元测试实战课程 — AI编程幻觉终结者"
tags: [tdd, unit-testing, refactoring, spring-boot, java, testing]
draft: false
---

# AI编程幻觉终结者：TDD + 重构驱动的单元测试实战

> 从零到一掌握测试驱动开发，结合 AI 编写低错误率的高质量代码

## 课程目标

本课程从**单元测试**的基础概念出发，逐步深入到**重构方法论**、**测试替身**、**Spring Boot 各层切片测试**、**测试哲学**以及 **AI + TDD 结合的现代编程范式**。无论你使用什么语言和框架，课程中的测试思想和方法论都能迁移运用。

## 适用人群

- 有 Java/Spring 基础，想系统掌握测试技术的开发者
- 希望将测试思维应用到非 Java 项目的工程师
- 想要结合 AI 提升代码质量和开发效率的编程者

## 前置知识

- Java 基础语法（类、继承、多态、枚举）
- Spring Boot 基础使用（Controller / Service / Repository 三层架构）
- 基本的 Git 和构建工具（Gradle / Maven）概念

## 课程结构

### 第 1 章：课程导入
- [[0001-course-introduction|第01课：课程导学 — AI + TDD + 重构的单元测试实战]]

### 第 2 章：初识单元测试与红绿重构
- [[0002-unit-test-basics|第02课：初识单元测试]]
- [[0003-test-as-daemon|第03课：测试与守护进程]]
- [[0004-extract-function-refactoring|第04课：提炼函数与重构]]
- [[0005-unit-test-and-refactoring|第05课：单元测试与重构的关系]]
- [[0006-red-green-refactoring|第06课：红绿切换（Red-Green-Refactoring）]]

### 第 3 章：重构划定范围与测试分类
- [[0007-refactoring-scope|第07课：运用重构来划定范围]]
- [[0008-assemble-methods-to-class|第08课：把函数组装成类]]
- [[0009-replace-query-for-variable|第09课：用查询来替代变量]]
- [[0010-test-scope-unit|第10课：单元测试的范围]]
- [[0011-integration-test-scope|第11课：集成测试的范围]]
- [[0012-refactoring-methodology|第12课：重构的方法论]]
- [[0013-test-classification|第13课：测试的分类]]

### 第 4 章：替换的艺术 — 重构技巧实战
- [[0014-test-first-introduction|第14课：重构与测试先行]]
- [[0015-define-test-goal|第15课：明确测试目标]]
- [[0016-test-double|第16课：认识测试替身（Test Double）]]
- [[0017-stub-method|第17课：测试打桩（Stub Method）]]
- [[0018-test-spy|第18课：使用测试间谍（Spy）]]
- [[0019-assertion-over-if|第19课：用断言替代 if-else]]
- [[0020-remove-primitive-obsession|第20课：去除原始类型偏执]]
- [[0021-replace-parameter-with-query|第21课：用查询替代函数参数]]
- [[0022-replace-loop-with-pipeline|第22课：用管道替代循环]]
- [[0023-express-intent-with-functions|第23课：用函数进行表达]]
- [[0024-replace-conditional-with-polymorphism|第24课：用多态取代条件]]

### 第 5 章：Spring Boot 单元测试实战
- [[0025-junit-runtime|第25课：认识 JUnit 运行时]]
- [[0026-mockito-basics|第26课：Mock 与单元测试的方法论]]
- [[0027-spring-boot-test-structure|第27课：Spring Boot 中的测试结构]]
- [[0028-assertions-in-depth|第28课：深入断言]]

### 第 6 章：单元测试切片（性能优化）
- [[0029-test-slicing-overview|第29课：单元测试的切片]]
- [[0030-service-test|第30课：Service 层测试]]
- [[0031-mvctest|第31课：MVC 控制器层测试]]
- [[0032-security-test|第32课：Security 身份认证测试]]
- [[0033-json-test|第33课：JSON 序列化测试]]
- [[0034-repository-test|第34课：Repository 数据仓储层测试]]
- [[0035-e2e-test|第35课：E2E 端到端接口测试]]

### 第 7 章：测试哲学
- [[0036-www-naming|第36课：WWW 命名方法论]]
- [[0037-aaa-pattern|第37课：AAA 方法论]]
- [[0038-what-is-good-test|第38课：什么是最好的测试]]
- [[0039-test-smells|第39课：单元测试的坏味道]]
- [[0040-test-driven-development|第40课：测试先行（TDD）]]
- [[0041-tdd-by-layer|第41课：TDD 按层推进]]
- [[0042-cqs-command-query-separation|第42课：CQS 方法论（命令查询分离）]]
- [[0043-tdd-philosophy-review|第43课：TDD 理念回顾与技巧总结]]

### 第 8 章：AI + TDD 编程新范式
- [[0044-ai-tdd-introduction|第44课：AI 与 TDD 的理论结合]]
- [[0045-tdd-prompts-for-ai|第45课：TDD 提示词工程]]
- [[0046-ai-low-error-code|第46课：让 AI 一次性输出低错误率代码]]
- [[0047-self-verification-mechanism|第47课：代码的自验证机制]]
- [[0048-ai-testing-interfaces|第48课：AI 测试接口层面代码]]
- [[0049-tdd-ai-summary|第49课：TDD + AI 编程手法总结]]

### 第 9 章：课程总结
- [[0050-course-summary|第50课：课程总结与展望]]

## 参考文档

- [[reference/glossary|测试术语表]]
- [[reference/cheatsheet|重构手法速查表]]
- [[reference/test-doubles|测试替身参考]]
- [[reference/spring-boot-test-slices|Spring Boot 测试切片参考]]
- [[reference/aaa-www-pattern|AAA 与 WWW 模式参考]]
- [[reference/cqs-reference|CQS 方法论参考]]
- [[reference/refactoring-catalog|重构手法目录]]
- [[reference/ai-tdd-prompts|AI+TDD 提示词模板]]

## 学习路径建议

1. **基础篇**（第1-3章）：理解单元测试的本质和重构基础
2. **进阶篇**（第4-5章）：掌握测试替身和 Mockito 实战
3. **高级篇**（第6章）：学习测试切片性能优化
4. **哲学篇**（第7章）：提炼测试思想，形成方法论
5. **前沿篇**（第8-9章）：将 TDD 与 AI 结合，提升开发效率

---

> "计算机最重要的就是基础，无论 AI 怎么发展，都离不开人去认识代码、理解代码。" — Chuck 老师