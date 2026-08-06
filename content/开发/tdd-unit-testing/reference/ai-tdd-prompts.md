---
title: "AI + TDD 提示词模板"
description: "AI + TDD 提示词模板 — 系统提示词与任务提示词"
tags: [reference, ai, prompts, tdd]
draft: false
---

# AI + TDD 提示词模板

## 系统提示词（System Prompt）

将以下规则嵌入 AI 的系统提示词中，确保 AI 遵循 TDD 流程：

```yaml
你是一个遵循 TDD（测试驱动开发）的编程助手。
请遵守以下规则：
1. 先编写单元测试，再编写实现代码
2. 确保测试遵循 AAA（Arrange-Action-Assert）模式
3. 测试命名遵循 WWW（What-When-Want）方法论
4. 使用 Mockito 隔离外部依赖
5. 生成的代码必须通过编译和测试
6. 按层编写测试：Controller → Service → Repository
7. 代码质量要求：可读、可维护、符合项目规范
```

## 功能开发提示词模板

```markdown
## 需求描述
[描述要开发的功能]

## 技术栈
- 框架: Spring Boot 3.x
- 测试: JUnit 5 + Mockito
- 构建: Gradle

## 要求
1. 先编写单元测试（测试先行）
2. 测试覆盖正常流程和异常流程
3. 使用 AAA 模式编写测试方法体
4. 使用 WWW 模式命名测试方法
5. 按 MVC → Service → Repository 顺序编写
6. 确保所有测试通过
7. 检查 E2E 测试是否完整
```

## 低错误率代码提示词

当需要 AI 一次性输出高质量代码时，使用以下提示词模板：

```markdown
请开发一个完整的 [功能名称]：

1. 先阅读项目结构和现有代码规范
2. 理解数据库表结构
3. 按以下顺序开发：
   - Repository 层 + 测试
   - Service 层 + 测试
   - Controller 层 + 测试
   - E2E 集成测试
4. 每个层次开发完毕后自动运行测试
5. 如果测试失败，分析原因并修正代码
6. 直到所有测试通过后才输出最终代码
```

## 代码审查提示词

```markdown
请审查以下代码的测试覆盖：
1. 是否有完整的单元测试？
2. 测试是否遵循 AAA 模式？
3. 是否有遗漏的边界条件？
4. Mock 是否合理（没有过度 Mock）？
5. 是否有测试坏味道？
```

## 跨语言提示词适配

```markdown
虽然项目使用 [Java/Go/Python/TypeScript]，
但请遵循通用的 TDD 原则：
1. 使用 [语言对应的测试框架] 编写测试
2. 使用 [语言对应的 Mock 库] 隔离依赖
3. 遵循 AAA 模式
4. 使用 WWW 模式命名
5. 测试先行
```