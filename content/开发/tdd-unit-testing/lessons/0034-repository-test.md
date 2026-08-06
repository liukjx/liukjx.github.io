---
title: "第34课：Repository 数据仓储层测试"
description: "KP-137 ~ KP-138 — @DataJpaTest / @JooqTest 用于 Repository 层测试；使用测试容器（TestContainers）连接真实数据库；自动回滚保证测试隔离"
tags: [tdd, unit-testing, spring-boot, repository, jpa, testcontainers, testing]
date: 2026-07-06
draft: false
---

# 第34课：Repository 数据仓储层测试

> Repository 层负责数据持久化。`@DataJpaTest` 只加载 JPA 相关组件，配合测试容器实现真实数据库测试。关键是：**不要 Mock 数据库，使用真实数据库实例**。

---

## @DataJpaTest 注解

**KP-137 | @DataJpaTest / @JooqTest：Repository 层测试**

`@DataJpaTest` 是 Spring Boot 提供的 JPA 层切片注解，它只加载：

- `@Entity` 实体类
- `@Repository` Bean（JPA Repository）
- `DataSource` 自动配置
- `JPA` / Hibernate 相关配置
- 嵌入式数据库（默认 H2）

**不加载**：`@Controller`、`@Service`、`@Component`、Web 层配置、Security。

```mermaid
graph TD
    subgraph ”@DataJpaTest 加载”
        A[”DataSource”]
        B[”JPA / Hibernate”]
        C[”@Entity 实体”]
        D[”@Repository”]
        E[”嵌入式数据库 (H2)”]
    end

    subgraph ”不加载”
        F[”@Controller”]
        G[”@Service”]
        H[”Web 层配置”]
        I[”Security Filter”]
    end

    A --> B --> D
    B --> C
    A --> E

    style A fill:#4CAF50,color:#fff
    style B fill:#4CAF50,color:#fff
    style C fill:#4CAF50,color:#fff
    style D fill:#4CAF50,color:#fff
    style E fill:#4CAF50,color:#fff
    style F fill:#f44336,color:#fff
    style G fill:#f44336,color:#fff
    style H fill:#f44336,color:#fff
    style I fill:#f44336,color:#fff
```

---

## 避免 Mock 数据库——使用真实数据库实例

**KP-138 | 测试容器（TestContainers）用于数据库测试**

Mock 数据库（如 Mockito mock `JpaRepository`）的问题是：

- 无法验证 SQL 语法是否正确
- 无法验证 JPQL / 原生查询的语义
- 无法验证数据库约束（唯一键、外键）
- Mock 方法默认返回 null，不能测试真实的 CRUD 行为

正确的做法是使用**真实数据库实例**。有两种方式：

| 方式 | 优点 | 缺点 |
|------|------|------|
| 嵌入式 H2 | 无需外部依赖，启动快 | 与生产数据库行为可能不一致 |
| TestContainers | 使用真实数据库（MySQL/PostgreSQL） | 需要 Docker 环境 |

### 默认方式：嵌入式数据库

```java
@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void should_save_and_find_user() {
        // given
        var user = new User("admin", "encoded-password");

        // when
        var saved = userRepository.save(user);
        var found = userRepository.findByUsername("admin");

        // then
        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(saved.getId());
        assertThat(found.get().getUsername()).isEqualTo("admin");
    }
}
```

### 进阶方式：TestContainers

```java
@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserRepositoryTestWithTestContainers {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private UserRepository userRepository;

    @Test
    void should_save_and_find_user() {
        var user = new User("admin", "encoded-password");
        var saved = userRepository.save(user);
        var found = userRepository.findByUsername("admin");

        assertThat(found).isPresent();
        assertThat(found.get().getUsername()).isEqualTo("admin");
    }
}
```

---

## 自动回滚保证测试隔离

`@DataJpaTest` 默认在每个测试方法结束后**自动回滚**事务，保证测试之间互不影响。

```java
@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void should_save_first_user() {
        userRepository.save(new User("alice", "pass1"));
        var count = userRepository.count();
        assertThat(count).isEqualTo(1);
    }

    @Test
    void should_save_second_user_without_interference() {
        userRepository.save(new User("bob", "pass2"));
        var count = userRepository.count();
        assertThat(count).isEqualTo(1);  // ✅ 不会受到 alice 的影响
    }
}
```

| 特性 | 默认行为 | 说明 |
|------|---------|------|
| 事务管理 | 每个测试在事务中运行 | 测试结束自动回滚 |
| 测试隔离 | 隔离 | 一个测试的写入不会影响另一个 |
| 回滚控制 | `@Rollback(false)` | 如果需要保留数据可以禁用回滚 |

---

## 完整示例：用户 Repository 测试

```java
@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void should_find_user_by_username() {
        // given
        userRepository.save(new User("chuck", "encoded-pass"));

        // when
        var result = userRepository.findByUsername("chuck");

        // then
        assertThat(result).isPresent();
        assertThat(result.get().getUsername()).isEqualTo("chuck");
    }

    @Test
    void should_return_empty_when_user_not_found() {
        // when
        var result = userRepository.findByUsername("nonexistent");

        // then
        assertThat(result).isEmpty();
    }

    @Test
    void should_check_username_exists() {
        // given
        userRepository.save(new User("chuck", "encoded-pass"));

        // when & then
        assertThat(userRepository.existsByUsername("chuck")).isTrue();
        assertThat(userRepository.existsByUsername("nobody")).isFalse();
    }

    @Test
    void should_enforce_unique_username() {
        // given
        userRepository.save(new User("chuck", "pass1"));

        // when & then: 重复用户名应该抛出异常
        assertThrows(Exception.class, () ->
            userRepository.save(new User("chuck", "pass2")));
        userRepository.flush();  // 触发数据库约束验证
    }
}
```

---

## 前情回顾

- [[0033-json-test|第33课：JSON 序列化测试]] —— 另一层的切片测试
- [[0029-test-slicing-overview|第29课：测试切片概念]] —— @DataJpaTest 是 Repository 切片
- [[reference/spring-boot-test-slices|Spring Boot 测试切片参考]] —— 所有切片注解速查

## 下一步

- [[0035-e2e-test|第35课：E2E 端到端接口测试]] —— 使用 @SpringBootTest 启动完整环境