---
title: "第31课：MVC 控制器层测试"
description: "KP-131 ~ KP-133 — @WebMvcTest 只启动 Web 层，@MockBean 自动注入 Spring 上下文，MockMvc 完成 HTTP 请求模拟与断言"
tags: [tdd, unit-testing, spring-boot, mvc, mockmvc, testing]
date: 2026-07-06
draft: false
---

# 第31课：MVC 控制器层测试

> 控制器层的职责是接收 HTTP 请求、解析参数、调用 Service、返回响应。`@WebMvcTest` 只启动 Web 层，不对 Service / Repository 负责。

---

## @WebMvcTest 注解

**KP-132 | @WebMvcTest 注解：只启动 Web 层**

`@WebMvcTest` 是 Spring Boot 提供的 Controller 层切片注解，它只加载：

- `@Controller` / `@RestController` Bean
- Spring MVC 基础设施（`DispatcherServlet`、`HandlerMapping`、`HandlerAdapter`）
- `Jackson` 自动配置（JSON 序列化/反序列化）
- `MessageConverter` 配置

**不加载**：`@Service`、`@Repository`、`@Component`、数据库配置、Security 过滤器链（未被请求时）。

```mermaid
graph TD
    subgraph ”@WebMvcTest 加载范围”
        A[”DispatcherServlet”]
        B[”@Controller / @RestController”]
        C[”Jackson 配置”]
        D[”MessageConverter”]
    end

    subgraph ”不加载”
        E[”@Service”]
        F[”@Repository”]
        G[”DataSource / DB”]
        H[”Security Filter Chain”]
    end

    A --> B
    B --> C
    B --> D

    style A fill:#4CAF50,color:#fff
    style B fill:#4CAF50,color:#fff
    style C fill:#4CAF50,color:#fff
    style D fill:#4CAF50,color:#fff
    style E fill:#f44336,color:#fff
    style F fill:#f44336,color:#fff
    style G fill:#f44336,color:#fff
    style H fill:#f44336,color:#fff
```

---

## @MockBean 自动注入

**KP-131 | @MockBean 的自动注入特性**

`@MockBean` 与 `@Mock` 的核心区别在于：

| 特性 | `@Mock` | `@MockBean` |
|------|---------|-------------|
| 适用上下文 | 纯 JUnit（无 Spring） | Spring 测试上下文 |
| Bean 替换 | 不涉及 Spring | **替换** Spring 容器中的真实 Bean |
| 自动注入 | 需配合 `@InjectMocks` | 自动注入到所有依赖该类型的 Bean |

当你在 `@WebMvcTest` 中使用 `@MockBean` 声明一个 `UserService` 时，Spring 会用这个 Mock 替换掉容器中原本的 `UserService` Bean，Controller 中注入的 `UserService` 就变成了 Mock。

```java
@WebMvcTest(SignInController.class)
class SignInControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SignInService signInService;  // 替换 Spring 容器中的 SignInService

    // ...
}
```

---

## MockMvc 用法

**KP-133 | MockMvc：测试环境中的 HTTP 客户端**

`MockMvc` 是 Spring 提供的 HTTP 请求模拟工具，它**不启动真实的 Web 服务器**，而是直接在 `DispatcherServlet` 层面模拟请求和响应。

### 基本流程：`perform` → `andExpect` → `andReturn`

```mermaid
graph LR
    A[”perform(request)”] --> B[”andExpect(断言)”]
    B --> C[”andReturn(获取结果)”]

    subgraph ”perform 支持”
        D[”MockMvcRequestBuilders<br/>.get / .post / .put / .delete”]
    end

    subgraph ”andExpect 支持”
        E[”status().isOk()<br/>content().json(...)<br/>jsonPath('$.key', value)”]
    end

    D --> A
    B --> E
```

### 测试 POST 请求示例

```java
@WebMvcTest(SignInController.class)
class SignInControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SignInService signInService;

    @Test
    void should_return_200_when_signin_with_valid_credentials() throws Exception {
        // given
        var requestBody = """
            {
                "username": "admin",
                "password": "correct-password"
            }
            """;

        var mockResponse = new SignInResponse("token-123", "admin");
        when(signInService.execute(any(SignInRequest.class)))
            .thenReturn(mockResponse);

        // when & then
        mockMvc.perform(post("/api/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").value("token-123"))
            .andExpect(jsonPath("$.username").value("admin"));
    }

    @Test
    void should_return_401_when_signin_with_invalid_credentials() throws Exception {
        // given
        var requestBody = """
            {
                "username": "admin",
                "password": "wrong-password"
            }
            """;

        when(signInService.execute(any(SignInRequest.class)))
            .thenThrow(new AuthenticationException("密码错误"));

        // when & then
        mockMvc.perform(post("/api/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andExpect(status().isUnauthorized());
    }
}
```

---

## 测试 POST 请求的关键验证点

| 验证点 | MockMvc 方法 | 说明 |
|--------|-------------|------|
| HTTP Status | `status().isOk()` / `isUnauthorized()` | 验证响应状态码 |
| 响应头 | `header().string("key", "value")` | 验证响应头 |
| JSON  Body | `jsonPath("$.field").value(...)` | 验证 JSON 字段 |
| 完整 JSON | `content().json("{\"key\":\"value\"}")` | 验证完整 JSON |
| 异常处理 | `status().isXxx()` | 验证错误状态码 |

> [!tip] `jsonPath` 是验证 JSON 响应的利器。`$` 代表根对象，`$.field` 访问根字段，`$.array[0]` 访问数组第一个元素。

---

## 前情回顾

- [[0030-service-test|第30课：Service 层测试]] —— Service 是 Controller 的下游依赖
- [[0029-test-slicing-overview|第29课：测试切片概念]] —— @WebMvcTest 是切片的一种
- [[0025-junit-runtime|第25课：JUnit 运行时]] —— 理解测试运行时的层次

## 下一步

- [[0032-security-test|第32课：Security 身份认证测试]] —— 如何处理 Security 对测试的影响