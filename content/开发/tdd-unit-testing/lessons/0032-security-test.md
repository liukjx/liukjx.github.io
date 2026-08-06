---
title: "第32课：Security 身份认证测试"
description: "KP-134 ~ KP-135 — Spring Security 默认保护端点导致的 401 问题；@WithMockUser 注解隔离认证，只测 Web 功能"
tags: [tdd, unit-testing, spring-boot, security, withmockuser, testing]
date: 2026-07-06
draft: false
---

# 第32课：Security 身份认证测试

> Spring Security 会默认保护所有端点，导致测试在不配置认证的情况下返回 401。`@WithMockUser` 可以绕过认证，让我们专注测试 Web 功能本身。

---

## Spring Security 默认保护端点带来的问题

**KP-135 | Spring Security 默认端点保护对测试的影响**

当你使用 `@WebMvcTest` 测试 Controller 时，如果你的项目引入了 Spring Security 依赖，Security 的自动配置会默认**保护所有端点**：

```java
// 即使测试只关心登录逻辑，Spring Security 也会要求认证
@WebMvcTest(SignInController.class)
class SignInControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void should_return_200_when_signin() throws Exception {
        // 这个请求会被 Spring Security 拦截，返回 401
        mockMvc.perform(post("/api/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"username": "admin", "password": "password"}
                    """))
            .andExpect(status().isOk());  // ❌ 实际返回 401 Unauthorized
    }
}
```

问题的根源：`@WebMvcTest` 虽然不启动全部环境，但会加载 Security 过滤器链（如果 classpath 上有 `spring-boot-starter-security`）。Security 过滤器会在请求到达 Controller 之前进行认证检查。

| Security 默认行为 | 对测试的影响 |
|-----------------|-------------|
| 所有端点需要认证 | 未认证的请求返回 401 |
| CSRF 保护 | POST/PUT/DELETE 请求被拦截 |
| Session 管理 | 需要维护会话状态 |

---

## @WithMockUser 注解隔离认证

**KP-134 | SecurityTest：@WithMockUser 注解隔离认证**

`@WithMockUser` 是 Spring Security Test 提供的注解，它会在测试方法的 SecurityContext 中注入一个模拟的认证用户，从而**跳过**认证过滤器链。

```java
@WebMvcTest(SignInController.class)
class SignInControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SignInService signInService;

    @Test
    @WithMockUser(username = "admin", roles = "USER")
    void should_return_200_when_signin() throws Exception {
        // given
        when(signInService.execute(any())).thenReturn(
            new SignInResponse("token-123", "admin"));

        // when & then
        mockMvc.perform(post("/api/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"username": "admin", "password": "password"}
                    """))
            .andExpect(status().isOk());
    }
}
```

### @WithMockUser 的参数说明

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `username` | `"user"` | 模拟认证用户的用户名 |
| `password` | `"password"` | 模拟认证用户的密码 |
| `roles` | `{"USER"}` | 模拟认证用户的角色（**不包含 `ROLE_` 前缀**） |
| `authorities` | `{}` | 模拟认证用户的权限（覆盖 roles） |

```java
// 模拟管理员角色
@Test
@WithMockUser(roles = "ADMIN")
void should_return_200_when_admin_access() throws Exception {
    // ...
}

// 模拟特定用户名
@Test
@WithMockUser(username = "chuck", roles = "USER")
void should_return_200_when_chuck_access() throws Exception {
    // ...
}
```

> [!tip] `roles` 参数不需要添加 `ROLE_` 前缀。`roles = "ADMIN"` 等价于 `ROLE_ADMIN` 权限。

---

## 不隔离 Security 的后果

```mermaid
graph LR
    subgraph ”没有 @WithMockUser”
        A[”HTTP 请求”] --> B[”Security Filter Chain”]
        B --> C{”是否已认证?”}
        C -->|”否”| D[”返回 401 Unauthorized”]
        C -->|”是”| E[”Controller”]
    end

    subgraph ”有 @WithMockUser”
        F[”HTTP 请求”] --> G[”Security Filter Chain”]
        G --> H{”SecurityContext<br/>已有认证用户?”}
        H -->|”是（@WithMockUser）”| I[”跳过认证 → Controller”]
    end

    style D fill:#f44336,color:#fff
    style I fill:#4CAF50,color:#fff
```

---

## 最佳实践：只测 Web 功能，不与认证逻辑耦合

测试 Controller 时，你的关注点应该是：

- 端点映射是否正确（`POST /api/signin`）
- 参数接收是否正确（`@RequestBody` 映射）
- 响应状态码和结构是否正确（`200 OK`、`401 Unauthorized`）
- 错误处理是否正确（异常 → HTTP Status 映射）

**不应该**由 Controller 测试来验证：

- 密码加密算法是否正确
- Token 生成的签名的有效性
- 数据库中的用户是否存在

这些是 Service 层和 Repository 层的职责。

```java
@WebMvcTest(SignInController.class)
class SignInControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SignInService signInService;

    @Test
    @WithMockUser
    void should_return_200_when_signin_success() throws Exception {
        // 只验证 Web 层的 HTTP 行为
        // 业务逻辑的正确性由 SignInServiceTest 验证
        when(signInService.execute(any()))
            .thenReturn(new SignInResponse("tok-1", "admin"));

        mockMvc.perform(post("/api/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"username": "admin", "password": "pass"}
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").value("tok-1"));
    }

    @Test
    @WithMockUser
    void should_return_401_when_signin_fails() throws Exception {
        when(signInService.execute(any()))
            .thenThrow(new AuthenticationException("密码错误"));

        mockMvc.perform(post("/api/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"username": "admin", "password": "wrong"}
                    """))
            .andExpect(status().isUnauthorized());
    }
}
```

---

## 前情回顾

- [[0031-mvctest|第31课：MVC 控制器层测试]] —— @WebMvcTest + @MockBean + MockMvc
- [[0029-test-slicing-overview|第29课：测试切片概念]] —— 切片测试只关注本层职责
- [[reference/spring-boot-test-slices|Spring Boot 测试切片参考]] —— 官方切片注解速查

## 下一步

- [[0033-json-test|第33课：JSON 序列化与反序列化测试]] —— 使用 @JsonTest 测试 JSON 转换