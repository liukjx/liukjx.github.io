---
title: 第3课：Kotlin 集合与函数式编程
description: Kotlin 集合操作与作用域函数（let、apply、run、with、also）详解，以及 PICO Demo 中的函数式编程模式。
---

# Kotlin 集合与函数式编程

Java 8 引入了 Stream API，Kotlin 则在内置的集合操作库中提供了更丰富的函数式编程支持。更重要的是，Kotlin 的**作用域函数**（scope functions）是 Java 中没有的概念——它们是代码组织的重要工具。

## 1. 集合创建：告别 new ArrayList<>()

**Java:**

```kotlin
List<String> list = new ArrayList<>();
list.add("a");
list.add("b");

// Java 9+
List.of("a", "b");       // 不可变
Map.of("k1", "v1");
```

**Kotlin:**

```kotlin
val list = listOf("a", "b")          // 不可变 List
val mutableList = mutableListOf("a")  // 可变 List
val map = mapOf("k1" to "v1")        // 不可变 Map
val set = setOf("a", "b")            // 不可变 Set
```

> [!NOTE]
> **重要哲学**
> Kotlin 区分**可变**和**不可变**集合。默认使用不可变（`listOf`、`mapOf`），需要修改时才用可变版本。这与 Java 的「集合默认都可变」完全不同。

## 2. 链式集合操作

Kotlin 的集合操作不需要 `.stream()`——直接在集合上调用即可，并且比 Java Stream API 更丰富。

**Java Stream:**

```kotlin
list.stream()
    .filter(s -> s.length() > 3)
    .map(String::toUpperCase)
    .sorted()
    .collect(Collectors.toList());
```

**Kotlin:**

```kotlin
list.filter { it.length > 3 }
    .map { it.uppercase() }
    .sorted()
    .toList()
// 不需要 .stream()，直接调用
```

Kotlin 的关键改进：

- **不需要 `.stream()`** — 集合操作是内置的
- **`it`** — 单参数 lambda 的隐式名称，不用写 `s ->`
- **更丰富的操作符** — `chunked`、`windowed`、`zip`、`associateBy` 等

### 常用操作速览

| 操作 | 作用 | Kotlin 示例 |
|---|---|---|
| `filter` | 过滤 | `list.filter { it > 5 }` |
| `map` | 转换 | `list.map { it.toString() }` |
| `flatMap` | 展平嵌套集合 | `list.flatMap { it.subList() }` |
| `groupBy` | 分组 | `list.groupBy { it.category }` |
| `associateBy` | 转 Map | `list.associateBy { it.id }` |
| `chunked` | 按大小分块 | `list.chunked(3)` |
| `zip` | 两个集合配对 | `names.zip(ages)` |
| `distinct` | 去重 | `list.distinct()` |
| `sortedBy` | 按属性排序 | `list.sortedBy { it.name }` |

> [!TIP]
> **🔑 PICO Demo 实战**
> 看 `AnimationModels.kt` 中的写法：
> ```kotlin
> companion object {
>     fun getList(): List<NavigationState> =
>         NavigationState.entries.toList()
> }
> ```
> `entries` 是 Kotlin 1.9+ 中替代 `values()` 的方式。

## 3. 作用域函数 — Kotlin 的独门武器

作用域函数是 Kotlin 中最常用的语法糖之一。一共有 5 个：`let`、`apply`、`run`、`with`、`also`。

### 3.1 with — "在这个对象上下文中"

```kotlin
// PICO Demo 中最常见的用法
fun mainApp(scope: SpatialAppScope) =
    with(scope) {
        // 这里直接调用 scope 的方法，不需要 scope.xxx
        DefaultWindowContainer {
            PicoTheme {
                // ...
            }
        }
    }
```

`with` 把接收者作为 lambda 的上下文，让你直接调用接收者的方法而无需重复写 `scope.`。

### 3.2 apply — "配置对象并返回它"

```kotlin
// Java 方式：先 new，然后 set，最后返回
Entity entity = new Entity("myId");
entity.setName("MyName");
entity.setParent(parent);

// Kotlin apply：创建 + 配置 = 一条表达式
val entity = Entity().apply {
    name = "MyName"
    parent = parentEntity
}
// apply 返回配置后的对象本身
```

> [!TIP]
> **🔑 PICO Demo 实战**
> ```kotlin
> // RoomLighting.kt
> viewModelScope.async {
>     IblEntity().apply {
>         initialize()
>     }
> }
> ```
> `apply` 让对象创建和初始化在一条表达式中完成。

### 3.3 let — "对非空值执行操作"

```kotlin
// Java 式空检查
if (data != null) {
    process(data);
}

// Kotlin 的 let + 安全调用
data?.let { processed ->
    process(processed)
}
// 或者用隐式 it
data?.let { process(it) }
```

`let` 在 PICO Demo 中最常见的用途是与安全调用运算符 `?.` 配合使用。

### 3.4 run — "计算一个值"

```kotlin
val label = run {
    val formatted = formatData()
    val timestamp = getTimestamp()
    "$formatted @ $timestamp"
}

// run 也可以作为带接收者的 lambda——等价于 with，但返回值是 lambda 的最后一行
entity.run {
    // this 是 entity
    position = Vector3(0f, 1f, 0f)
    rotation = Quat.identity
}
```

### 3.5 also — "执行副作用"

```kotlin
// also 返回原始对象，但允许你执行额外操作
val entity = Entity().also {
    Log.d(TAG, "Created entity: ${it.id}")
    statsCounter.increment()
}
```

### 速查表

| 函数 | 上下文对象 | 返回值 | 典型用途 |
|---|---|---|---|
| `let` | `it` | lambda 结果 | 空安全执行、局部变量限定 |
| `apply` | `this` | 上下文对象本身 | 对象配置（Builder 风格） |
| `run` | `this` | lambda 结果 | 对象配置 + 返回值 |
| `with` | `this` | lambda 结果 | 对同一对象执行多个操作（非扩展函数） |
| `also` | `it` | 上下文对象本身 | 副作用、日志、调试 |

## 4. Sequence — 惰性集合

Kotlin 的 `Sequence` 类似 Java 的 `Stream`——惰性求值，避免中间集合创建。

**Java Stream:**

```kotlin
list.stream()
    .filter(x -> x > 3)
    .map(x -> x * 2)
    .limit(5)
    .collect(toList());
```

**Kotlin Sequence:**

```kotlin
list.asSequence()
    .filter { it > 3 }
    .map { it * 2 }
    .take(5)
    .toList()
```

> [!WARNING]
> **注意**
> 对于小集合，直接使用 `list.filter {...}.map {...}` 更简单。只有在链式操作很多、或者处理大集合时才需要 `asSequence()`。

## 5. PICO Demo 中的函数式模式

### 模式：用 Map/List 存储多种方案

```kotlin
// PhysicsViewModel.kt — 用 mapOf 存储状态映射
data class PhysicsUiState(
    val playPhase: PlayPhase = PlayPhase.IDLE,
    val hint: String = "",
    val isHintShow: Boolean = false
)

// spatalui demo — 用 data class List 存储 UI 数据
data class CardData(
    @DrawableRes val image: Int,
    @StringRes val title: Int,
    @StringRes val content: Int,
    val color: Color
)

val demoData = listOf(
    CardData(...),
    CardData(...),
)
```

### 模式：with(scope) + DSL 构建 UI

```kotlin
// 7 个 Demo 项目的 mainApp 统一模式
fun mainApp(scope: SpatialAppScope) =
    with(scope) {
        DefaultWindowContainer {
            PicoTheme {
                HomePage()
            }
        }
    }

// with(scope) 让 scope 变成 this
// DefaultWindowContainer { } 相当于 this.DefaultWindowContainer { }
// PicoTheme { } 相当于 this.PicoTheme { }
```

### 模式：协程 + 集合 + 函数式

```kotlin
// AudioResourceStore.kt — 预加载所有音频文件
suspend fun preloadAudio() = coroutineScope {
    AUDIO_NAME_TO_PATH
        .filterKeys { it !in audioResourceMap }
        .map { (name, path) ->
            async(Dispatchers.IO) {
                name to AudioResource.load(name, path, LoadType.FROM_ASSETS)
            }
        }
        .awaitAll()
        .forEach { (name, res) -> audioResourceMap[name] = res }
}
```

看到这里的组合了吗？**集合操作（filterKeys + map）** + **协程（async + awaitAll）** + **作用域函数（forEach）** —— Kotlin 的三大特性融合在一起。

## 快速练习

用 Kotlin 将以下 Java 代码重写：

```kotlin
// Java
List<String> result = new ArrayList<>();
for (User user : userList) {
    if (user.getAge() >= 18) {
        result.add(user.getName().toUpperCase());
    }
}
Collections.sort(result);
```

<details>
  <summary>点击查看答案</summary>

```kotlin
// Kotlin
val result = userList
    .filter { it.age >= 18 }
    .map { it.name.uppercase() }
    .sorted()
```
</details>

## 下一课预告

下一课我们将进入实战环节——综合解读 PICO 8 个 Demo 项目的 Kotlin 代码模式，把所有学到的知识串联起来。

> [!INFO]
> **参考资料**
> - [Kotlin 作用域函数官方文档](https://kotlinlang.org/docs/scope-functions.html)
> - [Kotlin 集合官方文档](https://kotlinlang.org/docs/collections-overview.html)
> - 本地 Demo 作用域函数：`PICOProject/*/Main.kt` 中的 `with(scope)`

---

**上一课**: [[0002-kotlin-coroutines]] | **下一课**: [[0004-pico-demo-code-analysis]]