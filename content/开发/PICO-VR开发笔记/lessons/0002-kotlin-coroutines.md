---
title: "第02课：Kotlin 协程基础"
description: 学习 Kotlin 协程的核心概念——launch、async/await、挂起函数、调度器与结构化并发，并通过 Java 并发模型对比加深理解。
---

# Kotlin 协程基础

作为 Java 开发者，你习惯用 `Thread`、`ExecutorService`、`CompletableFuture` 处理并发。Kotlin 协程是更轻量级的方案——它不是线程的替代品，而是一种**可挂起计算**的抽象，可以在不阻塞线程的前提下暂停和恢复。

> [!NOTE]
> **关键认知**
> 协程运行在线程之上。一个线程可以运行成千上万个协程。协程的挂起是**零成本**的（不像阻塞线程那样耗资源）。
>
> Java 的并发是"重资源、显式管理"；Kotlin 协程是"轻资源、结构化管理"。

## 1. 协程 vs 线程：宏观对比

| 概念 | Java | Kotlin |
|------|------|--------|
| 启动异步任务 | `new Thread(runnable).start()` | `scope.launch { ... }` |
| 获取异步结果 | `Future.get()` → 阻塞 | `async { ... }.await()` → 挂起 |
| 线程池 | `ExecutorService` | `Dispatchers.IO / Default / Main` |
| 任务取消 | `future.cancel()` | `scope.cancel()` / 协程自动传播取消 |
| 异常处理 | `try-catch` 围绕 `get()` | `try-catch` 在协程内部，或 `CoroutineExceptionHandler` |
| 组合异步操作 | `CompletableFuture.thenCombine()` | `async + await()` 或 `coroutineScope { }` |

> [!TIP]
> **理解关键**
> 协程的"挂起" != 线程的"阻塞"。挂起时协程释放线程去做其他工作，等条件满足后再恢复——整个过程不需要额外线程。

## 2. launch：启动并忘记

`launch` 是最常用的协程构建器，它启动一个不返回结果的协程（类似于 `new Thread(runnable)`，但轻量得多）。

```java
// ☕ Java 线程
new Thread(() -> {
    doWork();
    doMoreWork();
}).start();
// 无法结构化取消
```

```kotlin
// 🚀 Kotlin launch
scope.launch {
    doWork()
    doMoreWork()
}
// scope.cancel() 可取消所有协程
```

> [!TIP]
> **🔑 PICO Demo 实战**
> 几乎所有项目都会在 `mainApp()` 中使用 `MainScope().launch { assetBundle.await() }` 来启动异步资源加载。
>
> ViewModel 中更是随处可见 `viewModelScope.launch { ... }`——这是 Android 为 ViewModel 提供的生命周期感知协程作用域。

## 3. async/await：获取异步结果

当需要异步结果时使用 `async`，它返回一个 `Deferred<T>`（类似于 Java 的 `Future<T>`）。

```java
// ☕ CompletableFuture
CompletableFuture<Data> future =
    CompletableFuture.supplyAsync(() -> {
        return loadData();
    });
Data data = future.get(); // 阻塞调用线程
```

```kotlin
// 🚀 Kotlin async
val deferred: Deferred<Data> = scope.async {
    loadData()
}
val data = deferred.await() // 挂起，不阻塞
```

**核心差异**：`future.get()` 阻塞当前线程；`deferred.await()` 挂起当前协程，不阻塞线程。

> [!TIP]
> **🔑 PICO Demo 实战**
> 多个项目使用 `async(start = CoroutineStart.LAZY)` 创建延迟加载的资源：
>
> ```kotlin
> // 定义时不会立即执行——只有 .await() 时才触发
> val assetBundle = CoroutineScope(Dispatchers.IO).async(
>     start = CoroutineStart.LAZY
> ) {
>     AssetBundle.load(BUNDLE_URI)
> }
>
> // 在其他地方消费时自动触发加载
> MainScope().launch {
>     val bundle = assetBundle.await()
> }
> ```

## 4. 挂起函数：suspend 关键字

`suspend` 是 Kotlin 协程的核心。挂起函数可以挂起协程的执行，而不会阻塞其所在线程。

```kotlin
// 挂起函数只能在协程中或其他挂起函数中调用
suspend fun loadData(): Data {
    // 这个调用可能挂起当前协程
    return withContext(Dispatchers.IO) {
        // 在 IO 线程池中执行耗时操作
        database.query()
    }
    // 协程恢复后，回到原来的调度器（通常是 Main）
}

// 调用
scope.launch {
    val data = loadData()  // 可能挂起，但不阻塞 UI
    updateUI(data)         // 恢复后继续执行
}
```

> [!TIP]
> **🔑 PICO Demo 实战**
> 所有 SDK 的异步操作都是挂起函数。看 `VideoViewModel.kt`：
>
> ```kotlin
> // 挂起函数初始化视频
> suspend fun initialize(converter: PhysicalLengthConverter) {
>     val bundle = videoAssetBundle.await()
>     // IO 密集型操作
>     val mediaPlayer = withContext(Dispatchers.IO) {
>         bundle.loadMediaPlayer(mediaPath)
>     }
>     // 回到主线程更新 UI 状态
>     _uiState.value = _uiState.value.copy(isInitialized = true)
> }
> ```

## 5. 调度器：Dispatchers

Kotlin 用 `Dispatchers` 控制协程在哪个线程池执行，相当于 Java 的 `ExecutorService`：

| 调度器 | 用途 | 类比 Java |
|--------|------|-----------|
| `Dispatchers.Main` | UI 操作（Compose 更新） | `Platform.runLater()` (JavaFX) |
| `Dispatchers.IO` | 网络请求、文件读写、数据库 | `Executors.newCachedThreadPool()` |
| `Dispatchers.Default` | CPU 密集型计算 | `Executors.newFixedThreadPool(n)` |

```kotlin
// PICO Demo 中的标准模式：用 withContext 切换调度器
scope.launch {                          // 默认 Main 调度器
    val model = withContext(Dispatchers.IO) {
        Entity.load(STATIC_ROBOT)       // IO 操作
    }
    // 回到 Main，更新 UI
    updateUI(model)
}
```

## 6. 协程作用域：结构化并发

Java 的线程缺乏结构化管理——线程一旦启动就无法自动取消。Kotlin 通过**协程作用域**实现结构化并发。

| 作用域 | 生命周期 | 在 PICO Demo 中的用途 |
|--------|----------|----------------------|
| `viewModelScope` | ViewModel 销毁时自动取消 | ViewModel 中的异步操作（5 个 Demo 使用） |
| `MainScope()` | 手动管理（一般在 mainApp 中使用） | 4 个 Demo 在 `Main.kt` 中用于资源加载 |
| `rememberCoroutineScope()` | 随 Compose 组件的生命周期 | Composable 中的按钮点击、生命周期事件 |
| 自定义 `CoroutineScope(SupervisorJob() + Dispatchers.Main)` | 类内部管理 | Manager 类的异步操作（PhysicsManager 等） |

> [!TIP]
> **🔑 为什么用 SupervisorJob？**
> 在 PICO Demo 中多处看到 `CoroutineScope(SupervisorJob() + Dispatchers.Main)`——`SupervisorJob` 确保一个子协程失败不会取消其他兄弟协程。这对 Manager 类很重要，一个操作失败不应该影响其他并行任务。

## 7. PICO Demo 协程模式全景

综合 8 个 Demo 项目，协程的使用可以归纳为 5 种模式：

### 模式 1：延迟异步资源加载

```kotlin
// 在文件顶层定义
val assetBundle = CoroutineScope(Dispatchers.IO).async(
    start = CoroutineStart.LAZY
) { AssetBundle.load(BUNDLE_URI) }

// 使用时 .await() 触发加载
scope.launch { val bundle = assetBundle.await() }
```

### 模式 2：IO 密集型操作调度

```kotlin
// 几乎所有涉及 3D 模型、纹理、网格的操作
val result = withContext(Dispatchers.IO) {
    Entity.load(modelPath)
}
```

### 模式 3：ViewModel 中的生命周期感知协程

```kotlin
class MyViewModel : ViewModel() {
    init {
        viewModelScope.launch {
            // ViewModel 销毁时自动取消
            someFlow.collect { value ->
                _state.value = value
            }
        }
    }
}
```

### 模式 4：并行并发

```kotlin
suspend fun preloadAll() = coroutineScope {
    listOf(audio1, audio2, audio3).map { name ->
        async(Dispatchers.IO) {
            name to AudioResource.load(name = name, path = path)
        }
    }.awaitAll().forEach { (name, res) ->
        cache[name] = res
    }
}
```

### 模式 5：Composable 中的协程

```kotlin
@Composable
fun MyScreen() {
    val coroutineScope = rememberCoroutineScope()

    Button(onClick = {
        coroutineScope.launch {
            // 按钮点击触发的异步操作
            doSomething()
        }
    })
}
```

## 8. 与 Java 并发工具的对应关系速查

| 你要做的事 | Java 方式 | Kotlin 协程方式 |
|-----------|-----------|----------------|
| 执行异步任务 | `executor.submit(runnable)` | `scope.launch { }` |
| 获取异步结果 | `executor.submit(callable)` | `scope.async { }.await()` |
| 线程池 | `Executors.newFixedThreadPool()` | `Dispatchers.IO` / `Dispatchers.Default` |
| 回调转异步 | `CompletableFuture` | `suspendCancellableCoroutine` |
| 超时控制 | `future.get(timeout, unit)` | `withTimeout(time) { }` |
| 组合结果 | `CompletableFuture.thenCombine()` | `coroutineScope { val a = async { }; val b = async { }; a.await() + b.await() }` |
| 任务取消 | `future.cancel()` (但无法取消正在执行的任务) | `scope.cancel()` (协作式取消，可响应中断) |

## 快速练习

以下 Java 代码用 `CompletableFuture` 加载两个资源然后合并。请思考如何用 Kotlin 协程改写：

```java
// Java
CompletableFuture<Model> modelFuture =
    CompletableFuture.supplyAsync(() -> loadModel(), executor);
CompletableFuture<Texture> textureFuture =
    CompletableFuture.supplyAsync(() -> loadTexture(), executor);

modelFuture.thenCombine(textureFuture, (model, texture) -> {
    return createScene(model, texture);
}).join();
```

<details style="margin-top: 1rem; cursor: pointer;">
  <summary>点击查看答案</summary>

```kotlin
// Kotlin 协程
coroutineScope {
    val model = async(Dispatchers.IO) { loadModel() }
    val texture = async(Dispatchers.IO) { loadTexture() }
    createScene(model.await(), texture.await()) // 自动等待两个完成
}

// 更接近 PICO Demo 风格的方式：
suspend fun loadScene() = withContext(Dispatchers.IO) {
    val modelDeferred = async { loadModel() }
    val textureDeferred = async { loadTexture() }
    createScene(modelDeferred.await(), textureDeferred.await())
}
```
</details>

> [!INFO]
> **参考资料**
> - [Kotlin 协程官方指南](https://kotlinlang.org/docs/coroutines-overview.html)
> - 本地 Demo 中的协程用法见 `PICOProject/*/data/AssetBundle.kt` 和 `*/*ViewModel.kt`
>
> **有疑问？** 随时问我，我会用 Java 并发的概念给你类比讲解。

---
**上一课**: [[0001-kotlin-for-java-developers|第1课：Kotlin for Java Developers]] | **下一课**: [[0003-kotlin-collections-functional|第3课：Kotlin 集合与函数式编程]]