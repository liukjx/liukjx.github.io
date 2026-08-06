---
title: "第29课：单元测试的切片概念"
description: "KP-120 ~ KP-122 — 理解测试切片的核心思想：按层划分测试范围，只启动所需环境，从根本上提升测试性能"
tags: [tdd, unit-testing, spring-boot, test-slicing, testing]
date: 2026-07-06
draft: false
---

# 第29课：单元测试的切片概念

> 测试切片 = 按层 / 范围划分测试，只启动所需环境；单元测试不应启动整个 Spring Boot 环境。

---

## 为什么需要测试切片？

在 [[0027-spring-boot-test-structure|第27课]] 中我们了解到，Spring Boot 项目天然包含 Controller、Service、Repository 三层。如果用 `@SpringBootTest` 启动全部环境来测试一个 Service 方法，代价过于高昂：

| 对比维度 | `@SpringBootTest` 全量启动 | 切片测试 |
|---------|---------------------------|---------|
| 启动时间 | 10~30 秒 | 1~3 秒 |
| 加载 Bean 数 | 全部（可能数百个） | 仅本层相关（十几个） |
| 数据库依赖 | 需要真实 DB 或嵌入式 DB | 不需要 |
| Web 容器 | 启动嵌入式 Tomcat | 不启动 |
| 测试独立性 | 受全局配置影响 | 高 |

```mermaid
graph LR
    subgraph ”@SpringBootTest 全量启动”
        A1[JUnit] --> A2[Spring Boot 全部环境]
        A2 --> A3[Controller]
        A2 --> A4[Service]
        A2 --> A5[Repository]
        A2 --> A6[Security]
        A2 --> A7[JPA]
        A2 --> A8[Web Server]
    end

    subgraph ”切片测试”
        B1[JUnit] --> B2[仅加载切片]
        B2 --> B3[Controller / Service / Repository 之一]
        B2 -.-> B4[Mock 替代其他层]
    end
```

---

## 核心思想：按需加载

**KP-120 | 测试切片的概念：按层划分测试范围**

测试切片（Test Slicing）的核心思想是：**你正在测试哪一层，就只启动哪一层的环境**。其他层的依赖通过 Mock / Stub 来模拟。

Spring Boot 提供了多种切片注解：

| 切片注解 | 目标层 | 加载范围 |
|---------|-------|---------|
| `@WebMvcTest` | Controller | Web 层 + MVC 基础设施 |
| `@DataJpaTest` | Repository | JPA / Repository 层 |
| `@JsonTest` | JSON 序列化 | Jackson / JSON 序列化 |
| `@RestClientTest` | REST 客户端 | RestTemplate 相关 |
| 无注解（纯 JUnit） | Service | 仅 Mockito + JUnit |

---

## 为什么单元测试不应启动整个 Spring Boot 环境？

**KP-121 | 单元测试不应启动 Spring Boot 全部环境**

原因有三：

1. **速度**：全量启动包含自动配置、数据库连接、Web 容器、Security 过滤器链等，每次运行测试都要等待数十秒。
2. **依赖冲突**：测试环境中可能不需要数据库，但全量启动会因为缺少数据源配置而报错。
3. **职责不清**：测试 Controller 时如果因为数据库连接失败而报错，你无法确定问题是出在 Controller 还是 DB 配置。

> [!tip] 黄金法则
> 用最适合该层的最小环境来测试。Service 层就纯 JUnit + Mockito，Controller 层就 `@WebMvcTest`，Repository 层就 `@DataJpaTest`。

---

## JUnit 运行时只加载 Mockito 和 JUnit

**KP-122 | JUnit 运行时只加载 Mockito 和 JUnit 库**

当你不使用任何 Spring Boot 测试注解时（即纯单元测试），JUnit 运行时只加载：

- **JUnit 5**（Jupiter API + Engine）
- **Mockito**（如果使用了 `@Mock` / `@InjectMocks`）
- **AssertJ** 或 Hamcrest（断言库）

此时没有 Spring 上下文，没有 ApplicationContext，没有自动注入。这是**最快**的测试方式，也是最纯粹的"单元测试"。

```java
// 纯单元测试 —— 最快，无 Spring 上下文
@ExtendWith(MockitoExtension.class)
class SignInServiceUnitTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SignInService signInService;

    @Test
    void should_return_token_when_login_success() {
        // given
        var credentials = new SignInRequest("admin", "password");
        when(userRepository.findByUsername("admin"))
            .thenReturn(Optional.of(new User("admin", "encoded-password")));

        // when
        var result = signInService.execute(credentials);

        // then
        assertThat(result.token()).isNotBlank();
    }
}
```

---

## 切片对比总结

```mermaid
graph TD
    subgraph ”测试性能金字塔”
        UT[”纯单元测试<br/>JUnit + Mockito<br/>毫秒级”]
        ST[”切片测试<br/>@WebMvcTest / @DataJpaTest<br/>秒级”]
        IT[”集成测试 / E2E<br/>@SpringBootTest<br/>十秒级”]
    end

    UT --> ST --> IT

    style UT fill:#4CAF50,color:#fff
    style ST fill:#FF9800,color:#fff
    style IT fill:#f44336,color:#fff
```

> 越往上速度越快，越往下越接近真实环境。切片测试处于中间位置——既保证了测试速度，又拥有一定的集成验证能力。

---

## 前情回顾

- [[0028-assertions-in-depth|第28课：深入断言]] —— 断言是测试的自我验证核心
- [[reference/spring-boot-test-slices|Spring Boot 测试切片参考]] —— 官方切片注解速查

## 下一步

- [[0030-service-test|第30课：Service 层测试]] —— 使用 @Mock + @InjectMocks 测试业务逻辑