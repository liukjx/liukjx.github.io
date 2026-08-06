---
title: "第30课：Service 层测试"
description: "KP-130 — 使用 @Mock + @InjectMocks 测试 Service 层的业务逻辑，通过 SignInService 示例掌握正常登录与异常登录的测试编写"
tags: [tdd, unit-testing, spring-boot, service-layer, mockito, testing]
date: 2026-07-06
draft: false
---

# 第30课：Service 层测试

> Service 层包含核心业务逻辑，是单元测试最密集的领域。使用 `@Mock` + `@InjectMocks` 隔离依赖，专注测试业务规则。

---

## Service 层测试的特点

**KP-130 | ServiceTest：测试 Service 层的业务逻辑**

Service 层是三层架构中的"大脑"——它负责编排业务规则、调用 Repository 获取数据、调用其他 Service 完成协作。

Service 层测试的要点：

- **不启动 Spring 上下文**：纯 JUnit + Mockito，毫秒级完成
- **Mock 所有外部依赖**：Repository、其他 Service、外部 API 客户端
- **只测业务逻辑**：输入是什么 → 经过什么业务规则 → 输出是什么

| 特性 | Service 测试 |
|------|-------------|
| 启动时间 | `< 1秒` |
| Spring 上下文 | 不启动 |
| 依赖处理 | `@Mock` + `@InjectMocks` |
| 测试范围 | 纯业务逻辑 |

---

## @Mock + @InjectMocks 详解

### @Mock

创建被测类所依赖的 Mock 对象。Mock 对象的所有方法调用默认返回默认值（`null`、`0`、`false` 等），需要通过 `when().thenReturn()` 来定义行为。

### @InjectMocks

创建被测类的真实实例，并将标记了 `@Mock` 的依赖自动注入到该实例中（按类型匹配）。

```java
@ExtendWith(MockitoExtension.class)
class SignInServiceTest {

    @Mock
    private UserRepository userRepository;       // 依赖：Mock

    @Mock
    private PasswordEncoder passwordEncoder;     // 依赖：Mock

    @InjectMocks
    private SignInService signInService;         // 被测对象：真实实例
}
```

> [!tip] `@ExtendWith(MockitoExtension.class)` 是 JUnit 5 集成 Mockito 的桥梁，它会自动初始化 `@Mock` 和 `@InjectMocks`。

---

## SignInService 测试示例

### 被测类

```java
public class SignInService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SignInService(UserRepository userRepository,
                         PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public SignInResponse execute(SignInRequest request) {
        // 1. 查找用户
        var user = userRepository.findByUsername(request.username())
            .orElseThrow(() -> new AuthenticationException("用户不存在"));

        // 2. 验证密码
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new AuthenticationException("密码错误");
        }

        // 3. 生成 Token（简化版）
        var token = "token-" + user.getId();
        return new SignInResponse(token, user.getUsername());
    }
}
```

### 测试类

```java
@ExtendWith(MockitoExtension.class)
class SignInServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private SignInService signInService;

    @Test
    void should_return_token_when_login_with_valid_credentials() {
        // given
        var request = new SignInRequest("admin", "correct-password");
        var user = new User(1L, "admin", "encoded-password");

        when(userRepository.findByUsername("admin"))
            .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct-password", "encoded-password"))
            .thenReturn(true);

        // when
        var response = signInService.execute(request);

        // then
        assertThat(response.token()).isNotBlank();
        assertThat(response.username()).isEqualTo("admin");
    }

    @Test
    void should_throw_exception_when_login_with_invalid_password() {
        // given
        var request = new SignInRequest("admin", "wrong-password");
        var user = new User(1L, "admin", "encoded-password");

        when(userRepository.findByUsername("admin"))
            .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "encoded-password"))
            .thenReturn(false);

        // when & then
        assertThrows(AuthenticationException.class,
            () -> signInService.execute(request));
    }

    @Test
    void should_throw_exception_when_login_with_non_existent_user() {
        // given
        var request = new SignInRequest("unknown", "password");

        when(userRepository.findByUsername("unknown"))
            .thenReturn(Optional.empty());

        // when & then
        var exception = assertThrows(AuthenticationException.class,
            () -> signInService.execute(request));
        assertThat(exception.getMessage()).contains("用户不存在");
    }
}
```

---

## 测试要点分析

### 正常登录测试

| 步骤 | 验证点 |
|------|--------|
| Arrange | 准备有效凭证，Mock 返回有效用户和密码匹配 |
| Action | 调用 `signInService.execute(request)` |
| Assert | Token 不为空，用户名正确 |

### 异常登录测试

| 场景 | 验证点 |
|------|--------|
| 密码错误 | `assertThrows(AuthenticationException.class)` |
| 用户不存在 | `assertThrows(AuthenticationException.class)` + 验证异常消息 |

---

## 最佳实践

1. **每个测试只测一个场景**：正常登录、密码错误、用户不存在各是一个独立测试方法
2. **使用有意义的测试命名**：遵循 [[0036-www-naming|WWW 命名方法论]]
3. **遵循 AAA 模式**： Arrange → Action → Assert（[[0037-aaa-pattern|参考 AAA 方法论]]）
4. **不要 Mock 被测类本身**：`@InjectMocks` 创建的是真实实例，只有依赖是 Mock

---

## 前情回顾

- [[0029-test-slicing-overview|第29课：测试切片概念]] —— 为什么 Service 层不需要启动 Spring 上下文
- [[0026-mockito-basics|第26课：Mockito 基础]] —— @Mock 和 @InjectMocks 的底层原理
- [[0016-test-double|第16课：测试替身]] —— Mock 在测试替身家族中的定位

## 下一步

- [[0031-mvctest|第31课：MVC 控制器层测试]] —— 使用 @WebMvcTest 测试 Controller