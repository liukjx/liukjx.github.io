---
title: "补充课03：协程异常处理与结构化并发"
description: "深入理解 Kotlin 协程的异常传播机制与结构化并发，包括 SupervisorJob、CoroutineExceptionHandler、runCatching、awaitCancellation 与 NonCancellable 等关键技术，以及它们在 PICO VR Demo 中的实际应用模式。"
---

# 协程异常处理与结构化并发

Java 的异常处理在线程边界处断裂——一个线程抛出的异常不会自动传播到创建它的线程。Kotlin 协程的**结构化并发**解决了这个问题：协程的异常会在**协程层次结构中传播**。

> [!NOTE]
> **核心思维**
> 协程中的异常处理不是在"catch 一个 Throwable"，而是在理解"结构化并发"的基础上选择正确的异常传播策略。

## 1. 协程异常的传播方式

Kotlin 协程有两种异常传播方式：

|  | Job 模式（默认） | SupervisorJob 模式 |
|---|---|---|
| 子协程失败 | 向上传播，取消父协程和兄弟协程 | 不影响父协程和兄弟协程 |
| 适用场景 | 关联任务——一个失败全部取消 | 独立任务——一个失败不影响其他 |
| 类比 Java | ThreadGroup 中一个线程崩溃，通知所有线程停止 | 线程池中一个任务失败，不影响其他任务 |
| PICO Demo 使用 | 较少 | Manager 类中大量使用 |

## 2. SupervisorJob — PICO Demo 的首选

PICO 的 Manager 类几乎都使用 `SupervisorJob`，因为 Manager 管理多个不相关的异步操作，一个失败不应影响其他：

```kotlin
// spatialmesh/MeshScanManager.kt
class MeshScanManager(private val content: SpatialViewContent) {
    private var scope: CoroutineScope? = null

    fun startScan() {
        // SupervisorJob：一个网格更新失败不取消其他扫描
        scope = CoroutineScope(
            Dispatchers.Main.immediate + SupervisorJob()
        )
    }
}

// spatialaudio/AudioControlViewModel.kt
class AudioControlViewModel : ViewModel() {
    private val scope = CoroutineScope(
        SupervisorJob() + Dispatchers.Main
    )
}

// physics/PhysicsManager.kt
class PhysicsManager {
    private val coroutineScope = CoroutineScope(
        SupervisorJob() + Dispatchers.Main.immediate
    )
}

// spatialvideo/VideoEffectManager.kt
class VideoEffectManager {
    private val scope = CoroutineScope(
        SupervisorJob() + Dispatchers.IO
    )
}
```

> [!TIP]
> **SupervisorJob vs Job 的选择**<br>
> ✅ 用 SupervisorJob：Manager 类、ViewModel 中多个独立操作<br>
> ❌ 用默认 Job：一个事务的多个步骤（全部成功或全部回滚）

## 3. 异常处理三种方式

### 方式 1：try-catch 在协程内部

这是最直接的方式，在 `launch` 或 `async` 的 lambda 内部使用：

```kotlin
scope.launch {
    try {
        val data = withContext(Dispatchers.IO) {
            fetchFromNetwork()
        }
        _uiState.value = Success(data)
    } catch (e: Exception) {
        _uiState.value = Error(e.message)
    }
}
```

### 方式 2：CoroutineExceptionHandler — 全局兜底

```kotlin
val exceptionHandler = CoroutineExceptionHandler { _, throwable ->
    Log.e(TAG, "协程未捕获异常: ", throwable)
    // 上报、弹窗等统一处理
}

// 在作用域或协程上安装
scope.launch(exceptionHandler) {
    riskyOperation()
}
```

> [!WARNING]
> **注意**
> `CoroutineExceptionHandler` 只在 `launch` 中生效（不处理 `async` 抛出的异常）。`async` 的异常在 `await()` 时抛出，需要用 try-catch 处理。

### 方式 3：runCatching — Kotlin 的 Result 封装

PICO Demo 中 spatialmesh 使用了 `runCatching` 来独立执行多个清理步骤：

```kotlin
// 多个清理操作，每个独立运行，一个失败不影响其他的
withContext(NonCancellable) {
    runCatching { unregisterSystem<ShooterSystem>() }
    runCatching { hmdTrackingProvider.stop() }
    runCatching { unregisterSystem<AmmoSystem>() }
    runCatching { GameplayManager.clear() }
    runCatching { MeshScanManager.unsubscribeMeshAnchorUpdate() }
    runCatching { gameViewModel.reset() }
}
```

> [!NOTE]
> **runCatching 与 try-catch 的区别**<br>
> `try-catch` 适合有返回值的异常分支处理；<br>
> `runCatching` 适合"尝试执行，失败就跳过"——返回值是 `Result<T>`，你可以用 `.onSuccess {}` / `.onFailure {}` 后续处理。

## 4. awaitCancellation + finally — 结构化清理

这是 PICO Demo 中最重要的协程模式。在 `spatialmesh/GameScene.kt` 中有最佳实现：

```kotlin
LaunchedEffect(Unit) {
    try {
        // 1. 初始化所有系统
        AmmoManager.initialize()
        registerSystem<AmmoSystem>()
        hmdTrackingProvider.start()
        registerSystem<ShooterSystem>()
        AudioRepository.playBGM()

        // 2. 挂起等待组合被移除
        awaitCancellation()

    } catch (t: Throwable) {
        Log.e(TAG, "初始化失败", t)
        throw t  // 重新抛出，LaunchedEffect 会记录错误
    } finally {
        // 3. 使用 NonCancellable 保证清理完成
        withContext(NonCancellable) {
            runCatching { unregisterSystem<ShooterSystem>() }
            runCatching { hmdTrackingProvider.stop() }
            runCatching { unregisterSystem<AmmoSystem>() }
            runCatching { GameplayManager.clear() }
            runCatching { gameViewModel.reset() }
        }
    }
}
```

## 5. 协程取消的协作性质

协程取消是**协作式**的——不是调用 `cancel()` 就立即停止，而是在下一个挂起点检查取消状态。

```kotlin
// 这个协程无法被取消：没有挂起点
scope.launch {
    for (i in 1..1_000_000) {
        doHeavyWork()  // CPU 密集，不挂起
    }
    // cancel() 后这个仍然会执行完
}

// 可取消的版本
scope.launch {
    for (i in 1..1_000_000) {
        ensureActive()  // 检查取消，如果已取消抛出 CancellationException
        doHeavyWork()
    }
}

// 或者 yield()——挂起并允许取消
scope.launch {
    for (i in 1..1_000_000) {
        yield()
        doHeavyWork()
    }
}
```

## 6. NonCancellable — 不可取消的上下文

`NonCancellable` 在清理场景中至关重要。在 `finally` 块中如果不使用 `NonCancellable`，任何挂起操作（如 `withContext`）都会立即抛出 `CancellationException`：

```kotlin
// ❌ 错误的清理方式
try {
    awaitCancellation()
} finally {
    // 这里已经是在取消状态下！
    withContext(Dispatchers.IO) {  // 立即抛出 CancellationException！
        saveToDatabase()
    }
}

// ✅ 正确的清理方式
try {
    awaitCancellation()
} finally {
    withContext(NonCancellable) {  // 忽略取消状态
        saveToDatabase()           // 安全执行
    }
}
```

## 7. 协程异常处理速查表

| 场景 | 方案 | 代码 |
|---|---|---|
| 普通 try-catch | 在 launch/async 内部 | `try { ... } catch (e: Exception) { ... }` |
| 全局异常兜底 | CoroutineExceptionHandler | `launch(handler) { ... }` |
| 独立异步任务 | SupervisorJob | `CoroutineScope(SupervisorJob())` |
| 容错执行 | runCatching | `runCatching { riskyOp() }.onFailure { ... }` |
| 保证清理（取消时） | NonCancellable | `withContext(NonCancellable) { cleanup() }` |
| 长时间计算可取消 | ensureActive / yield | `ensureActive()` |
| async 异常获取 | 在 await() 处捕获 | `try { deferred.await() } catch ...` |

## 8. PICO Demo 异常处理模式总结

PICO Demo 异常处理模式总结

```kotlin
// 第 1 层：try-catch（最基本）
// animation/TweenAnimationUtil.kt
scope.launch {
    try {
        val character = withContext(Dispatchers.IO) {
            Entity.load(STATIC_ROBOT)
        }
    } catch (e: Exception) {
        Log.e(TAG, "加载模型失败", e)
    }
}

// 第 2 层：runCatching（容错执行）
// spatialmesh/GameScene.kt — finally 清理
finally {
    withContext(NonCancellable) {
        runCatching { unregisterSystem<AmmoSystem>() }
        runCatching { hmdTrackingProvider.stop() }
    }
}

// 第 3 层：SupervisorJob（隔离失败）
// spatialmesh/MeshScanManager.kt
scope = CoroutineScope(
    Dispatchers.Main.immediate + SupervisorJob()
)
// 一个网格更新失败不会影响其他网格的扫描
```

## 快速练习

在 `PICOProject/spatialmesh-0.13.3` 中：

1. 找到 `SupervisorJob` 的使用位置
2. 找到 `runCatching` 的使用位置
3. 为什么 GameScene.kt 的 finally 块中要用 NonCancellable？

<details>
<summary>点击查看提示</summary>

1. `MeshScanManager.kt:56` — `CoroutineScope(Dispatchers.Main.immediate + SupervisorJob())`
2. `GameScene.kt:178-184` — finally 块中的 runCatching 链
3. 因为协程被取消后，所有挂起操作会立即抛出 CancellationException，用 NonCancellable 才能阻止取消传播，确保清理代码执行完毕

</details>

> [!INFO]
> **参考资料**
> * 最佳 Demo 参考：`PICOProject/spatialmesh-0.13.3/` — 异常处理最完整
> * [Kotlin 协程异常处理官方文档](https://kotlinlang.org/docs/coroutines-and-channels.html#exception-handling)
> * 对比参考：`PICOProject/spatialvideo-0.13.3/VideoEffectManager.kt` — 自定义 scoped SupervisorJob

---
**上一课**: [[s02-kotlin-flow-deep|补充课2：Kotlin Flow 深入]] | **下一课**: [[s04-android-permissions|补充课4：Android 权限系统与 PICO 空间权限]]