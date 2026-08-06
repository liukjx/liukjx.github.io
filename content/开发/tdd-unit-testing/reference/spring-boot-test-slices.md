---
title: "Spring Boot 测试切片参考"
description: "Spring Boot 测试切片注解速查 — 各层测试的范围与配置"
tags: [reference, spring-boot, test-slicing]
draft: false
---

# Spring Boot 测试切片参考

## 测试切片对比

| 切片类型 | 注解 | 加载范围 | 适用场景 | 速度 |
|----------|------|----------|----------|------|
| Service 测试 | @ExtendWith(MockitoExtension.class) + @Mock/@InjectMocks | 仅 Mockito + JUnit | Service 层业务逻辑 | ⚡ 极快 |
| MVC 测试 | @WebMvcTest | Web 层 + MVC 基础设施 | Controller 端点测试 | 🚀 快 |
| Security 测试 | @WebMvcTest + @WithMockUser | Web 层 + Security 配置 | 认证/授权测试 | 🚀 快 |
| JSON 测试 | @JsonTest | Jackson/Gson 组件 | 序列化/反序列化 | 🚀 快 |
| Repository 测试 | @DataJpaTest / @JooqTest | JPA/JOOQ + 数据源 | 数据访问层 | 🐢 中 |
| E2E 测试 | @SpringBootTest | 完整应用上下文 | 端到端接口验证 | 🐌 慢 |

## 各层测试要点

### Service 测试
```java
@ExtendWith(MockitoExtension.class)
class SignInServiceTest {
    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private SignInService signInService;
    
    @Test
    void signIn_givenValidInfo_willReturnUserId() {
        // Arrange
        var dto = new SignInDto("user", "pass");
        when(userRepository.findByUsername("user"))
            .thenReturn(new User(1L, "user", "encodedPass"));
        
        // Action
        var result = signInService.signIn(dto);
        
        // Assert
        assertEquals(1L, result);
    }
}
```

### MVC 测试
```java
@WebMvcTest(controllers = SignInController.class)
@Import(SecurityConfig.class)
class SignInControllerTest {
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private SignInService signInService;
    
    @Test
    @WithMockUser
    void signIn_givenValidPayload_willReturn200() throws Exception {
        var payload = """
            {"username": "user", "password": "pass"}
            """;
        
        when(signInService.signIn(any()))
            .thenReturn(1L);
        
        mockMvc.perform(post("/auth/signIn")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isOk());
    }
}
```

### Repository 测试
```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
class UserRepositoryTest {
    @Autowired
    private UserRepository userRepository;
    
    @Test
    void findByUsername_whenUserExists_willReturnUser() {
        var user = new User("test", "encodedPass");
        userRepository.save(user);
        
        var found = userRepository.findByUsername("test");
        
        assertTrue(found.isPresent());
        assertEquals("test", found.get().getUsername());
    }
}
```

### E2E 测试
```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class E2ETest {
    @Autowired
    private WebTestClient webTestClient;
    
    @AfterEach
    void cleanup() {
        // 清理测试数据
    }
    
    @Test
    void signUp_and_signIn_shouldWork() {
        // 注册
        webTestClient.post().uri("/auth/signUp")
            .bodyValue(Map.of("username", "test", "password", "pass"))
            .exchange()
            .expectStatus().isCreated();
        
        // 登录
        webTestClient.post().uri("/auth/signIn")
            .bodyValue(Map.of("username", "test", "password", "pass"))
            .exchange()
            .expectStatus().isOk();
    }
}
```

## 分层测试范围示意图

```mermaid
graph TD
    subgraph ”完整项目”
        Controller
        Service
        Repository
        DB[(”Database”)]
        Web[Web 容器]
    end
    
    subgraph ”MVC Test”
        MVC_CTRL[Controller]
        MVC_SVC_MOCK[”Service (Mock)”]
    end
    
    subgraph ”Service Test”
        SVC_SERVICE[Service]
        SVC_REPO_MOCK[”Repository (Mock)”]
    end
    
    subgraph ”Repository Test”
        REPO_REPO[Repository]
        REPO_DB[(”Test DB / TC”)]
    end
    
    MVC_CTRL --> MVC_SVC_MOCK
    SVC_SERVICE --> SVC_REPO_MOCK
    REPO_REPO --> REPO_DB
```

## 选择指南

1. **测业务逻辑** → Service Test (最快，最纯粹)
2. **测 Web 端点** → MVC Test (验证 HTTP 映射、参数、状态码)
3. **测安全配置** → MVC Test + @WithMockUser
4. **测 JSON 序列化** → @JsonTest
5. **测数据访问** → Repository Test (使用 TestContainers)
6. **测完整流程** → E2E Test (最少使用，但关键路径必测)