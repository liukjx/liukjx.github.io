---
title: "第33课：JSON 序列化与反序列化测试"
description: "KP-136 — @JsonTest 注解验证 Jackson 序列化/反序列化配置的正确性，确保 JSON 格式符合预期"
tags: [tdd, unit-testing, spring-boot, json, jackson, testing]
date: 2026-07-06
draft: false
---

# 第33课：JSON 序列化与反序列化测试

> 前端与后端通过 JSON 交换数据，JSON 序列化/反序列化的正确性直接决定接口是否可用。`@JsonTest` 可以独立验证 Jackson 配置。

---

## @JsonTest 注解

**KP-136 | @JsonTest：JSON 序列化/反序列化测试**

`@JsonTest` 是 Spring Boot 提供的 JSON 切片测试注解，它只加载：

- Jackson 的 `ObjectMapper` Bean
- `@JsonComponent` Bean
- Jackson 模块（`Jackson2ObjectMapperBuilder` 等）

**不加载**：Controller、Service、Repository、数据库配置。

```java
@JsonTest
class SignInRequestJsonTest {

    @Autowired
    private JacksonTester<SignInRequest> jacksonTester;

    // ...
}
```

---

## 序列化测试：Java 对象 → JSON

```java
@JsonTest
class SignInRequestJsonTest {

    @Autowired
    private JacksonTester<SignInRequest> json;

    @Test
    void should_serialize_to_json() throws IOException {
        // given
        var request = new SignInRequest("admin", "my-password");

        // when
        var result = json.write(request);

        // then
        assertThat(result).isEqualToJson("""
            {
                "username": "admin",
                "password": "my-password"
            }
            """);
    }
}
```

### 验证 JSON 字段

```java
@Test
void should_serialize_with_correct_field_names() throws IOException {
    // given
    var request = new SignInRequest("admin", "my-password");

    // when
    var result = json.write(request);

    // then
    assertThat(result).hasJsonPathValue("$.username");
    assertThat(result).hasJsonPathValue("$.password");
    assertThat(result).extractingJsonPathStringValue("$.username")
        .isEqualTo("admin");
}
```

---

## 反序列化测试：JSON → Java 对象

```java
@JsonTest
class SignInResponseJsonTest {

    @Autowired
    private JacksonTester<SignInResponse> json;

    @Test
    void should_deserialize_from_json() throws IOException {
        // given
        var jsonContent = """
            {
                "token": "token-abc-123",
                "username": "admin"
            }
            """;

        // when
        var result = json.parseObject(jsonContent);

        // then
        assertThat(result.token()).isEqualTo("token-abc-123");
        assertThat(result.username()).isEqualTo("admin");
    }

    @Test
    void should_throw_when_required_field_missing() {
        // given: 缺少 token 字段
        var invalidJson = """
            {
                "username": "admin"
            }
            """;

        // when & then
        assertThrows(IOException.class, () -> json.parseObject(invalidJson));
    }
}
```

---

## Jackson 配置验证

`@JsonTest` 可以验证 Jackson 的各种配置是否生效：

| 配置 | 作用 | 测试验证 |
|------|------|---------|
| `@JsonProperty` | 自定义 JSON 字段名 | 验证字段名是否符合预期 |
| `@JsonIgnore` | 忽略字段 | 验证该字段不在 JSON 中 |
| `@JsonFormat` | 日期格式 | 验证日期格式是否正确 |
| `@JsonInclude` | 空值包含策略 | 验证 null 字段是否被包含 |
| `@JsonNaming` | 命名策略（如 SnakeCase） | 验证命名转换是否正确 |

### 示例：验证 @JsonProperty 和 @JsonIgnore

```java
public class UserDto {
    @JsonProperty("user_id")
    private Long id;

    @JsonProperty("user_name")
    private String username;

    @JsonIgnore
    private String password;

    // getters / setters / constructors
}
```

```java
@JsonTest
class UserDtoJsonTest {

    @Autowired
    private JacksonTester<UserDto> json;

    @Test
    void should_use_jsonproperty_names() throws IOException {
        // given
        var user = new UserDto(1L, "admin", "secret");

        // when
        var result = json.write(user);

        // then: 字段名是 "user_id" 和 "user_name"，不是 "id" 和 "username"
        assertThat(result).isEqualToJson("""
            {
                "user_id": 1,
                "user_name": "admin"
            }
            """);
        // password 被 @JsonIgnore 排除
    }

    @Test
    void should_exclude_password_field() throws IOException {
        var user = new UserDto(1L, "admin", "secret");

        var result = json.write(user);

        assertThat(result).doesNotHaveJsonPathValue("$.password");
    }
}
```

---

## @JsonTest 的加载范围

```mermaid
graph TD
    subgraph ”@JsonTest 加载”
        A[”ObjectMapper”]
        B[”JacksonTester”]
        C[”@JsonComponent”]
        D[”Jackson 模块”]
    end

    subgraph ”不加载”
        E[”@Controller / @RestController”]
        F[”@Service”]
        G[”@Repository”]
        H[”DataSource / DB”]
        I[”Security Filter”]
    end

    style A fill:#4CAF50,color:#fff
    style B fill:#4CAF50,color:#fff
    style C fill:#4CAF50,color:#fff
    style D fill:#4CAF50,color:#fff
    style E fill:#f44336,color:#fff
    style F fill:#f44336,color:#fff
    style G fill:#f44336,color:#fff
    style H fill:#f44336,color:#fff
    style I fill:#f44336,color:#fff
```

> [!tip] 使用 `@JsonTest` 的好处在于：如果 JSON 序列化出错，你能立刻定位到是 Jackson 配置问题，而不是被其他层的错误干扰。

---

## 前情回顾

- [[0032-security-test|第32课：Security 身份认证测试]] —— @WithMockUser 隔离认证
- [[0031-mvctest|第31课：MVC 控制器层测试]] —— MockMvc 中的 `content().json()` 与 @JsonTest 的关系
- [[0029-test-slicing-overview|第29课：测试切片概念]] —— @JsonTest 是 Spring Boot 最小的切片之一

## 下一步

- [[0034-repository-test|第34课：Repository 数据仓储层测试]] —— 使用 @DataJpaTest 测试数据库访问