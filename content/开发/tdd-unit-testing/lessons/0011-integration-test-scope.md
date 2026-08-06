---
title: 第11课：集成测试的范围
description: 集成测试测多个单元的协作，理解数据库集成和服务间集成的测试策略与成本
tags: [tdd, integration-testing, test-scope, database, collaboration, java]
date: 2024-01-01
draft: false
---

# 集成测试的范围

> 覆盖知识点：KP-036

如果说单元测试是"微观检查"，那么集成测试就是"宏观验证"。**集成测试关注的是多个单元之间的协作是否正确**。

## 集成测试的定义

> **集成测试（Integration Test）**：验证多个单元（模块/服务/组件）之间的交互是否符合预期。

```mermaid
flowchart LR
    subgraph ”单元A”
        A1[”方法1”]
        A2[”方法2”]
    end
    
    subgraph ”单元B”
        B[”服务/模块”]
    end
    
    subgraph ”集成测试的范围”
        C[”验证A→B的协作”]
    end
    
    A1 --> B
    A2 --> B
    C -.-> A1
    C -.-> B
```

## 单元测试 vs 集成测试

| 维度 | 单元测试 | 集成测试 |
|------|----------|----------|
| 测试对象 | 单个方法/函数 | 多个组件/模块的协作 |
| 依赖管理 | 用替身隔离外部依赖 | 使用真实或部分真实的依赖 |
| 启动成本 | 毫秒级 | 秒级到分钟级 |
| 失败定位 | 精确到方法级别 | 需要排查协作链路 |
| 环境依赖 | 无 | 可能需要 DB/网络/第三方服务 |
| 用例数量 | 多（覆盖各种边界） | 少（覆盖关键路径） |
| 维护成本 | 低 | 高 |

## 典型场景：数据库集成测试

假设有一个 `OrderRepository` 需要和数据库协作：

```java
// 需要数据库支持的方法
public interface OrderRepository {
    Order save(Order order);
    Optional<Order> findById(Long id);
    List<Order> findByCustomerId(Long customerId);
}
```

集成测试会真实地操作数据库：

```java
// 集成测试 —— 需要真实的数据库环境
@SpringBootTest
class OrderRepositoryIntegrationTest {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Test
    void should_save_and_find_order() {
        // Arrange
        Order order = new Order();
        order.setCustomerId(1L);
        order.setTotalAmount(150.0);
        
        // Act
        Order saved = orderRepository.save(order);
        Order found = orderRepository.findById(saved.getId()).get();
        
        // Assert
        assertNotNull(saved.getId());
        assertEquals(150.0, found.getTotalAmount(), 0.001);
        assertEquals(1L, found.getCustomerId());
    }
}
```

> [!tip] 集成测试的数据库策略
> - 使用**内存数据库**（如 H2）加速测试，但需注意行为差异
> - 使用**测试容器**（TestContainers）提供真实数据库环境
> - 每次测试后**清理数据**，确保测试隔离性

## 典型场景：服务间集成测试

当 `OrderService` 需要调用 `PaymentService` 时：

```java
// 服务间调用的场景
@Service
public class OrderService {
    
    private final PaymentService paymentService;
    private final OrderRepository orderRepository;
    
    public OrderService(PaymentService paymentService, OrderRepository orderRepository) {
        this.paymentService = paymentService;
        this.orderRepository = orderRepository;
    }
    
    public Order processOrder(Order order) {
        orderRepository.save(order);
        PaymentResult result = paymentService.charge(order.getTotalAmount());
        order.setPaymentStatus(result.getStatus());
        return orderRepository.save(order);
    }
}
```

集成测试验证的是**这些组件在真实协作时的行为**：

```java
@SpringBootTest
class OrderServiceIntegrationTest {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @MockBean
    private PaymentService paymentService;
    
    @Test
    void should_process_order_with_payment() {
        // Arrange
        Order order = new Order();
        order.setTotalAmount(150.0);
        when(paymentService.charge(150.0))
            .thenReturn(new PaymentResult("SUCCESS"));
        
        // Act
        Order result = orderService.processOrder(order);
        
        // Assert
        assertEquals("SUCCESS", result.getPaymentStatus());
        
        // 验证数据已持久化
        Order saved = orderRepository.findById(result.getId()).get();
        assertNotNull(saved);
    }
}
```

此处 `PaymentService` 是 Mock 的，但 `OrderRepository` 是真实的——这是**部分集成**的策略，聚焦于验证 `OrderService` + `OrderRepository` 的协作。

## 集成测试的启动成本

```mermaid
flowchart TD
    subgraph ”单元测试启动路径”
        A[”JUnit Runtime”] --> B[”加载测试类”]
        B --> C[”执行测试方法”]
        C --> D[”毫秒级完成”]
    end
    
    subgraph ”集成测试启动路径”
        E[”JUnit Runtime”] --> F[”加载 Spring 上下文”]
        F --> G[”启动嵌入式数据库”]
        G --> H[”加载所有 Bean”]
        H --> I[”执行测试方法”]
        I --> J[”秒级完成”]
    end
```

启动成本的对比：

| 测试类型 | 启动时间 | 单个测试执行时间 | 100个测试总时间 |
|----------|---------|-----------------|----------------|
| 纯单元测试 | ~50ms | ~1ms | ~150ms |
| 集成测试（H2） | ~3s | ~50ms | ~8s |
| 集成测试（真实DB） | ~5s | ~100ms | ~15s |
| E2E测试 | ~10s | ~500ms | ~60s |

> [!warning] 测试速度决定了测试频率
> 一个需要 10 秒启动的测试，开发者在每次修改后不会去运行它。最终它只能在 CI 上跑，失去了"守护进程"的价值。

## 何时写单元测试，何时写集成测试？

```
决策树：

这个测试验证的是"逻辑是否正确"还是"协作是否正确"？
│
├── 逻辑是否正确 → 单元测试
│   └── 示例：快递费计算方法、价格计算规则
│
└── 协作是否正确 → 集成测试
    ├── 示例：数据能否正确写入数据库？
    ├── 示例：服务 A 调用服务 B 时参数传递是否正确？
    └── 示例：事务回滚是否按预期工作？
```

## 集成测试的最佳实践

1. **只测关键路径**：不是所有协作都需要集成测试验证
2. **最小化外部依赖**：用 Mock 替代非关键的第三方服务
3. **数据清理**：每次测试后清理测试数据（`@AfterEach` / `@Transactional`）
4. **独立运行**：集成测试应与单元测试分开运行（通过 Maven/Gradle 的 profile 隔离）
5. **合理选择数据库**：H2 用于 CI，TestContainers 用于验证兼容性

```java
// 使用 @Tag 区分测试类型
@Tag("integration")
@SpringBootTest
class OrderRepositoryIntegrationTest {
    // ...
}
```

配合 Gradle 配置分开执行：

```groovy
// build.gradle
test {
    useJUnitPlatform {
        excludeTags "integration"
    }
}

task integrationTest(type: Test) {
    useJUnitPlatform {
        includeTags "integration"
    }
}
```

> [!note] 其他语言的等效实践
> - **Python**：使用 `pytest-django` 或 `pytest-flask` 启动真实应用上下文，数据库使用 `pytest-postgresql` 或 testcontainers-python
> - **Go**：使用 `testing` 包的 `TestMain` 启动数据库容器，`go test -tags=integration` 区分集成测试
> - **JavaScript**：使用 Supertest + 真实数据库（通过 testcontainers 或 docker-compose）验证 API + 数据库的协作
> - **本质**：集成测试的核心是**验证组件间的契约是否成立**，无论语言和框架

---

> 集成测试弥补了单元测试无法覆盖的"协作"层面。在[[0012-refactoring-methodology|第12课：重构的方法论]]中，我们将总结已学的三种重构手法。理解单元测试和集成测试的区别后，[[0013-test-classification|第13课：测试的分类]]将为你呈现完整的测试全景图。