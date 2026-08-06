---
title: 第13课：测试的分类
description: 用测试金字塔理解单元测试、集成测试、E2E测试和行为测试的分层策略
tags: [tdd, test-classification, test-pyramid, unit-testing, integration-testing, e2e-testing, java]
date: 2024-01-01
draft: false
---

# 测试的分类

> 覆盖知识点：KP-038 ~ KP-039

测试并非只有一种。不同类型的测试服务于不同的目的，它们共同构成了一个分层体系。理解这个体系，你就知道**在什么场景下应该写什么类型的测试**。

## 测试金字塔

测试金字塔是 Mike Cohn 提出的经典模型，描述了不同测试类型的**数量比例**和**投入产出比**。

```mermaid
flowchart TD
    subgraph ”测试金字塔”
        direction TB
        B[”行为测试<br/>端到端业务流程验证”]
        E[”E2E 测试<br/>系统级接口验证”]
        I[”集成测试<br/>模块间协作验证”]
        U[”单元测试<br/>方法级别逻辑验证”]
    end
    
    U --> I --> E --> B
    
    style U fill:#4CAF50,stroke:#333,color:#000
    style I fill:#FFC107,stroke:#333,color:#000
    style E fill:#FF9800,stroke:#333,color:#000
    style B fill:#F44336,stroke:#333,color:#000
```

## 四层测试详解

### 第一层：单元测试（Unit Test）

> **定义**：验证单个方法/函数的行为是否符合预期。

- **范围**：单一方法或函数
- **速度**：毫秒级
- **依赖**：无外部依赖（使用替身隔离）
- **数量**：最多
- **维护成本**：最低

```java
// 单元测试示例
class ShippingFeeCalculatorTest {
    @Test
    void should_return_20_for_normal_shipping() {
        ShippingFeeCalculator calculator = new ShippingFeeCalculator();
        double fee = calculator.calculate(new Order(), ShippingType.NORMAL);
        assertEquals(20.0, fee, 0.001);
    }
}
```

### 第二层：集成测试（Integration Test）

> **定义**：验证多个模块/组件之间的协作是否正确。

- **范围**：多个模块/组件的交互
- **速度**：秒级
- **依赖**：可能需要真实数据库或部分真实服务
- **数量**：中等
- **维护成本**：中等

```java
// 集成测试示例
@SpringBootTest
class OrderRepositoryIntegrationTest {
    @Autowired
    private OrderRepository orderRepository;
    
    @Test
    void should_save_and_retrieve_order() {
        Order order = new Order(1L, 150.0);
        Order saved = orderRepository.save(order);
        Order found = orderRepository.findById(saved.getId()).get();
        assertEquals(150.0, found.getTotalAmount(), 0.001);
    }
}
```

### 第三层：E2E 测试（End-to-End Test）

> **定义**：从用户视角出发，验证完整的系统功能链路。

- **范围**：完整系统链路（从前端到后端到数据库）
- **速度**：秒级到分钟级
- **依赖**：完整的运行环境
- **数量**：少
- **维护成本**：高

```java
// E2E 测试示例
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class OrderE2ETest {
    @Autowired
    private WebTestClient webTestClient;
    
    @Test
    void should_create_order_end_to_end() {
        webTestClient.post().uri("/orders")
            .bodyValue(new CreateOrderRequest(/*...*/))
            .exchange()
            .expectStatus().isCreated()
            .expectBody()
            .jsonPath("$.id").isNotEmpty()
            .jsonPath("$.totalAmount").isEqualTo(150.0);
    }
}
```

### 第四层：行为测试（Behavior Test）

> **定义**：从业务角度出发，验证完整的用户故事和业务流程。

- **范围**：跨系统的业务流程
- **速度**：分钟级
- **依赖**：完整的部署环境（可能包括多个微服务）
- **数量**：最少
- **维护成本**：最高

```java
// 行为测试通常使用 Cucumber / JBehave 等 BDD 框架
// 这是用 Cucumber 写的行为测试描述
Feature: 用户下单流程
  Scenario: 用户成功下单并支付
    Given 用户已登录
    And 用户购物车中有商品"Java编程思想"，价格80元，数量1
    When 用户点击"结算"
    Then 系统显示订单总价为100元（含20元快递费）
    And 用户完成支付后，订单状态变为"已支付"
```

## 测试分类对比表

| 维度 | 单元测试 | 集成测试 | E2E测试 | 行为测试 |
|------|----------|----------|---------|---------|
| **测试粒度** | 方法级 | 模块级 | 系统级 | 业务级 |
| **执行速度** | 毫秒 | 秒 | 秒~分 | 分 |
| **环境依赖** | 无 | 部分 | 完整 | 生产级 |
| **失败定位** | 精确 | 较精确 | 粗略 | 粗略 |
| **维护成本** | 低 | 中 | 高 | 最高 |
| **数量比例** | ~70% | ~20% | ~7% | ~3% |
| **主要受众** | 开发者 | 开发者 | 开发者/QA | QA/业务方 |
| **运行频率** | 每次提交 | 每日构建 | 预发布 | 上线前 |
| **是否可 Mock** | 是 | 部分 | 否 | 否 |

## 测试成本与范围的关系

> **一个测试的启动成本与它的范围成正比，范围越大，成本越高。**

```mermaid
flowchart LR
    subgraph ”成本递增”
        U[”单元测试<br/>成本: $1”]
        I[”集成测试<br/>成本: $10”]
        E[”E2E测试<br/>成本: $100”]
        B[”行为测试<br/>成本: $1000”]
    end
    
    U --> I --> E --> B
```

为什么成本会递增？

| 因素 | 单元测试 | 集成测试 | E2E测试 |
|------|----------|----------|---------|
| 启动时间 | ~50ms | ~3s | ~10s+ |
| 环境配置 | 无需 | 需数据库 | 需完整环境 |
| 数据管理 | 无 | 需清理 | 需准备/清理 |
| 并行能力 | 完全并行 | 部分并行 | 串行 |
| 调试难度 | 低 | 中 | 高 |
| CI 配置 | 简单 | 中等 | 复杂 |

## 如何选择合适的测试类型？

```
面对一个功能需求，选择测试类型的决策流程：

这个功能的核心价值是什么？
│
├── 业务规则和计算逻辑 → 单元测试
│   └── 例：运费计算、折扣策略、状态机转换
│
├── 多个模块的协作流程 → 集成测试
│   └── 例：Service 调用 Repository、消息发送与消费
│
├── 完整的用户操作路径 → E2E 测试
│   └── 例：用户注册 → 登录 → 下单 → 支付
│
└── 跨系统的业务流程 → 行为测试
    └── 例：订单流转影响库存、财务、物流等多个系统
```

## 反模式：冰淇淋锥

有些人把测试金字塔颠倒了——**大量的 E2E 测试，少量的单元测试**，这就形成了"冰淇淋锥"反模式：

```mermaid
flowchart TD
    subgraph ”冰淇淋锥（反模式）”
        direction TB
        B[”行为测试（大量）”]
        E[”E2E测试（很多）”]
        I[”集成测试（不多）”]
        U[”单元测试（几乎没有）”]
    end
    
    style U fill:#4CAF50,stroke:#333,color:#000
    style I fill:#FFC107,stroke:#333,color:#000
    style E fill:#FF9800,stroke:#333,color:#000
    style B fill:#F44336,stroke:#333,color:#000
```

冰淇淋锥的后果：

- 测试运行极慢（跑一次测试要几十分钟）
- 测试不稳定（随环境波动）
- 无法定位问题（失败时不知道哪里出了错）
- 维护成本极高（每次修改要改大量 E2E 测试）

> [!warning] 警惕冰淇淋锥
> 如果项目中没有单元测试，只有一堆 E2E 测试，这不是"测试完备"——这是"测试负债"。

## 最佳实践：分层测试策略

```java
// 1. 单元测试覆盖所有业务逻辑
// 2. 集成测试覆盖关键协作路径
// 3. E2E 测试覆盖核心用户旅程
// 4. 行为测试覆盖跨系统业务流程

// 示例：创建订单功能
@Tag("unit")
class OrderCalculationTest { ... }        // 单元测试：价格计算逻辑

@Tag("integration")
class OrderRepositoryTest { ... }          // 集成测试：数据持久化

@Tag("e2e")
class CreateOrderE2ETest { ... }           // E2E测试：完整下单流程

@Tag("behavior")
class OrderProcessBehaviorTest { ... }    // 行为测试：订单跨系统流转
```

> [!note] 其他语言的等效实践
> - **Python**：`pytest` + `pytest-cov`（单元）；`pytest-django`（集成）；Selenium/Playwright（E2E）；`behave`/`pytest-bdd`（行为测试）
> - **Go**：`go test`（单元，使用 `_test.go` 命名）；`go test -tags=integration`（集成）；`testcontainers-go` + `httptest`（E2E）；`godog`（行为测试/Cucumber）
> - **JavaScript**：Vitest/Jest（单元）；Supertest + TestContainers（集成）；Playwright/Cypress（E2E）；`@cucumber/cucumber`（行为测试）
> - **本质**：**测试金字塔模型适用于任何技术栈**，区别仅在于各语言选用什么测试框架。关键是对"什么层级的逻辑用什么类型的测试"有清晰的认知

---

> 测试的分类为我们建立了全局视角。在进入[[0014-test-first-introduction|第14课：测试先行]]之前，建议回顾 [[reference/glossary|测试术语表]] 巩固基本概念。理解了测试金字塔之后，你就可以根据具体场景合理分配测试资源——这正是高效测试策略的核心。