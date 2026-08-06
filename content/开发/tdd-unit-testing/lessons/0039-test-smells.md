---
title: "第39课：单元测试的坏味道"
description: "KP-157 ~ KP-158 — 常见测试坏味道：过多 Mock、脆弱测试、不稳定断言、测试间依赖、过于复杂的准备、测试重复代码"
tags: [tdd, test-smells, anti-pattern, code-quality]
date: 2026-07-06
draft: false
---

# 第39课：单元测试的坏味道

## 概述

单元测试代码和业务代码一样，也会产生"坏味道"（Test Smells）。识别并消除这些坏味道，才能让测试集既可靠又可维护。

---

## 常见测试坏味道速查表

| # | 坏味道 | 症状 | 危害 | 解决方案 |
|---|--------|------|------|----------|
| 1 | 过多 Mock | 几乎所有对象都是 Mock | 测试只测了 Mock 框架，不真实 | 集成测试补全，减少不必要的 Mock |
| 2 | 脆弱测试 | 改动实现细节导致测试失败 | 维护成本剧增 | 只测行为/结果，不测内部实现 |
| 3 | 不稳定断言 | 断言受随机因素影响 | 测试时而通过时而失败 | 固定随机种子、Mock 时间 |
| 4 | 测试间依赖 | 测试必须按特定顺序运行 | 单独运行失败 | 每个测试独立准备和清理 |
| 5 | 过于复杂的准备 | Arrange 阶段代码冗长 | 测试难以理解 | 抽取 Builder/Factory 方法 |
| 6 | 测试重复代码 | 多个测试有相同的准备逻辑 | 修改时遗漏 | 提取 `@BeforeEach` 或 Helper 方法 |

---

## 坏味道详解

### 1. 过多 Mock

```java
// ❌ 坏味道：几乎所有对象都是 Mock
@Test
void createOrder_whenValidRequest_shouldSucceed() {
    var mockRepo = mock(UserRepository.class);
    var mockProductRepo = mock(ProductRepository.class);
    var mockDiscountService = mock(DiscountService.class);
    var mockInventoryService = mock(InventoryService.class);
    var mockNotificationService = mock(NotificationService.class);
    var mockLogService = mock(LogService.class);

    var orderService = new OrderService(mockRepo, mockProductRepo,
        mockDiscountService, mockInventoryService,
        mockNotificationService, mockLogService);

    when(mockProductRepo.findById(1L)).thenReturn(Optional.of(new Product()));
    // ... 更多 Mock 设置 ...

    var result = orderService.createOrder(request);

    assertNotNull(result);
}
```

> **解决：** 思考是否有些层可以用真实对象或集成测试覆盖，减少不必要的 Mock。

---

### 2. 脆弱测试

```java
// ❌ 坏味道：依赖实现细节
@Test
void calculatePrice_shouldCallInternalHelper() {
    var calculator = spy(new PriceCalculator());
    calculator.calculatePrice(100);

    // ❌ 验证了私有方法的调用 —— 这是实现细节
    verify(calculator, privateMethod("applyDiscount")).call();
}
```

> **解决：** 只验证公开的行为（返回值、状态变更、对外部服务的调用），不验证内部实现细节。

---

### 3. 不稳定的断言

```java
// ❌ 坏味道：断言受随机因素影响
@Test
void generateOrderId_shouldReturnUniqueId() {
    var orderService = new OrderService();
    var id1 = orderService.generateOrderId();
    var id2 = orderService.generateOrderId();

    // ❌ 依赖于系统时间，偶发失败
    assertNotEquals(id1, id2);
}

// ✅ 解决：Mock 时间源
@Test
void generateOrderId_givenFixedTime_willReturnExpectedId() {
    var orderService = new OrderService();
    var clock = mock(Clock.class);
    when(clock.instant()).thenReturn(Instant.parse("2024-06-15T10:00:00Z"));
    orderService.setClock(clock);

    var id = orderService.generateOrderId();

    assertEquals("20240615-100000-abc123", id);
}
```

---

### 4. 测试间依赖

```java
// ❌ 坏味道：测试 B 依赖测试 A 创建的数据
class UserServiceTest {
    static User createdUser;

    @Test
    void testA_createUser() {
        createdUser = userService.createUser("test");
        assertNotNull(createdUser);
    }

    @Test
    void testB_findUser() {
        // ❌ 依赖 testA 先运行并创建了 createdUser
        var found = userService.findById(createdUser.getId());
        assertNotNull(found);
    }
}
```

> **解决：** 每个测试独立准备自己的数据。如果准备逻辑复杂，抽取 `@BeforeEach`。

---

### 5. 过于复杂的准备

```java
// ❌ 坏味道：准备代码太长
@Test
void createOrder_shouldSucceed() {
    var user = new User();
    user.setId(1L);
    user.setName("test");
    user.setEmail("test@example.com");
    user.setPhone("13800138000");
    user.setAddress("Beijing");
    user.setLevel(UserLevel.VIP);
    user.setCreateTime(LocalDateTime.now());
    // ... 20 行准备工作 ...

    var product = new Product();
    product.setId(100L);
    // ... 又是 15 行 ...
}

// ✅ 解决：使用 Builder 模式
@Test
void createOrder_shouldSucceed() {
    var user = UserBuilder.aUser()
            .withId(1L)
            .withLevel(UserLevel.VIP)
            .build();
    var product = ProductBuilder.aProduct()
            .withId(100L)
            .withPrice(new BigDecimal("99.00"))
            .build();
    // ...
}
```

---

### 6. 测试重复代码

```java
// ❌ 坏味道：每个测试都重复相同的 Mock 设置
class OrderServiceTest {
    @Test
    void testCase1() {
        var discountMock = mock(DiscountService.class);
        when(discountMock.getDiscount(any())).thenReturn(new BigDecimal("0.9"));
        var orderService = new OrderService(discountMock);
        // ...
    }

    @Test
    void testCase2() {
        var discountMock = mock(DiscountService.class);
        when(discountMock.getDiscount(any())).thenReturn(new BigDecimal("0.9"));
        var orderService = new OrderService(discountMock);
        // ...
    }
}

// ✅ 解决：抽取到 @BeforeEach
class OrderServiceTest {
    private DiscountService discountMock;
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        discountMock = mock(DiscountService.class);
        when(discountMock.getDiscount(any())).thenReturn(new BigDecimal("0.9"));
        orderService = new OrderService(discountMock);
    }

    @Test
    void testCase1() { /* ... */ }
    @Test
    void testCase2() { /* ... */ }
}
```

---

## 坏味道检测清单

| 类别 | 自查问题 |
|------|----------|
| Mock 使用 | 是否 Mock 了本该用真实对象的依赖？ |
| 测试稳定性 | 测试是否偶发失败？是否依赖时间/随机数/网络？ |
| 测试独立性 | 能否单独运行每个测试？ |
| 测试可读性 | 准备代码是否超过 15 行？是否抽取了 Builder？ |
| 测试维护性 | 改业务代码时是否多个测试同时红？ |

---

> [!NOTE] 语言迁移
> **测试坏味道具有语言无关性**。无论在 Java 的 JUnit、Python 的 pytest 还是 JavaScript 的 Jest 中，过多 Mock、脆弱测试、测试间依赖等问题都会出现。消除坏味道的思路——抽取共用代码、面向行为而非实现测试、使用 Builder 简化准备——在所有语言中都是通用的。

---

## 静态收束

测试代码也需要持续重构。定期审视测试中的坏味道，就像定期清理技术债务一样重要。好的测试集应该像好的业务代码一样——干净、表达性强、易于维护。当测试代码出现了坏味道，不要视而不见，它们通常也是业务代码设计需要改进的信号。