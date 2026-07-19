---
title: "补充课2：Kotlin Flow 深入"
description: "探索 Kotlin Flow 的深入用法，包括 StateFlow、combine、stateIn、snapshotFlow 等操作符，以及它们在 PICO VR 开发中的应用模式。"
---

# Kotlin Flow 深入

Flow 是 Kotlin 协程的响应式数据流。如果你熟悉 Java 的 `Publisher/Subscriber` 或 RxJava 的 `Observable`，Flow 是 Kotlin 原生的替代方案。

> [!NOTE]
> **为什么 PICO 开发需要深入 Flow？**
> PICO Demo 中 5/8 的项目使用 StateFlow 管理 UI 状态。但大多数 Demo 只用了 Flow 最基础的功能（作为一个可观察的"状态盒子"）。理解 Flow 的完整能力后，你可以写出更声明式、少 bug 的代码。

## 1. Flow 是什么

简单理解：Flow 是一个**异步数据序列**，它会在数据准备好后**发射（emit）**多个值。

```kotlin
// Java 类比：如果 Supplier<T> 是"生产一个值"
// 那 Flow<T> 就是"异步生产多个值"

// 创建一个 Flow
val numberFlow: Flow<Int> = flow {
    for (i in 1..3) {
        delay(1000)      // 模拟异步
        emit(i)          // 发射一个值
    }
}

// 收集（消费）Flow
scope.launch {
    numberFlow.collect { value ->
        println("收到: $value")  // 每秒打印一个数字
    }
}
```

## 2. StateFlow — PICO 用得最多的 Flow

`StateFlow` 是 Flow 的一种特殊实现：它始终持有**一个当前值**，新订阅者会立即拿到这个值。这就是为什么它在 ViewModel 中如此流行。

### PICO Demo 中的标准模式

```kotlin
class VideoViewModel : ViewModel() {
    // 1. 私有可变流
    private val _videoState = MutableStateFlow(
        PlaybackState.IDLE
    )
    // 2. 公有不可变流
    val videoState: StateFlow<PlaybackState> =
        _videoState.asStateFlow()

    // 3. 在 init 或其他函数中更新
    init {
        viewModelScope.launch {
            snapshotFlow { manager.state }
                .collectLatest { state ->
                    _videoState.value = state  // 更新
                }
        }
    }
}

// 4. 在 Compose 中收集
@Composable
fun VideoScreen(vm: VideoViewModel) {
    val videoState by vm.videoState
        .collectAsStateWithLifecycle()
    // 当 videoState 变化时，Text 自动重组
    Text("状态: $videoState")
}
```

### StateFlow 的特性

| 特性 | 说明 |
| --- | --- |
| 有初始值 | 创建时必须传入初始值 |
| 去重 | 如果新值 == 旧值，不会通知订阅者 |
| 粘性 | 新订阅者立即拿到当前值 |
| 冷->热转换 | StateFlow 是"热"的——即使没有订阅者也存在 |

## 3. collectAsStateWithLifecycle — 生命周期感知收集

这是 Compose 中收集 Flow 的**推荐方式**。它会在 Activity 进入后台时停止收集，回到前台时恢复：

```kotlin
// ✅ 推荐 — 生命周期感知
val videoState by videoViewModel.videoState
    .collectAsStateWithLifecycle()

// ❌ 不推荐 — 无生命周期感知（只有 3 个 PICO Demo 在用）
val videoState by videoViewModel.videoState
    .collectAsState()
```

PICO Demo 中，`spatialui` 和 `spatialvideo` 使用了推荐的 `collectAsStateWithLifecycle`（共 15 处），其他 3 个项目使用了旧的 `collectAsState`（5 处）。

> [!TIP]
> **最佳实践**
> 在 Compose 中收集 Flow 时，始终使用 `collectAsStateWithLifecycle()` 而不是 `collectAsState()`。它来自 `androidx.lifecycle:lifecycle-runtime-compose`。

## 4. combine — 合并多个 Flow

当我们有多个状态流，需要将它们合并为一个时使用 `combine`：

```kotlin
// VideoViewModel.kt — PICO Demo 中唯一的 Flow 运算符用法
val videoProgress: StateFlow<Float> =
    combine(
        _playbackTime,    // 当前播放时间
        _isSeeking,       // 是否在拖动进度条
        _seekingPosition  // 拖动的目标位置
    ) { playbackTime, isSeeking, seekingPosition ->
        // 如果正在拖动，显示拖动位置；否则显示实际进度
        if (isSeeking) seekingPosition
        else playbackTime.toFloat()
    }
    .stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = 0f
    )
```

> [!NOTE]
> **理解 combine**
> `combine` 类似于 Java 的 `CompletableFuture.allOf()` + 转换，但不同点在于：**只要任何一个 Flow 有新值，combine 就触发一次**，参数始终是所有 Flow 的最新值。

## 5. stateIn — 将冷流转热

`stateIn` 将普通 Flow 转换为 StateFlow：

```kotlin
combine(flowA, flowB) { a, b -> a + b }
    .stateIn(
        scope = viewModelScope,            // 协程作用域
        started = SharingStarted.WhileSubscribed(5000), // 启动策略
        initialValue = 0f                  // 初始值
    )
```

`SharingStarted` 有三种策略：

| 策略 | 行为 | 适用场景 |
| --- | --- | --- |
| `Eagerly` | 立即启动，不管有没有订阅者 | 数据必须一直最新 |
| `Lazily` | 第一个订阅者出现时才启动 | 懒加载 |
| `WhileSubscribed(5000)` | 没有订阅者时保留 5 秒 | ✅ PICO 推荐 — 屏幕旋转等场景不会重启 |

## 6. snapshotFlow — Compose 到 Flow 的桥梁

`snapshotFlow` 将 Compose 的 `mutableStateOf` 或属性读取转换为 Flow：

```kotlin
// VideoViewModel.kt
init {
    viewModelScope.launch {
        // 读取 Compose 状态属性，将它们转为 Flow
        snapshotFlow {
            Triple(
                manager.state,
                manager.hasFirstFrameRendered,
                manager.duration
            )
        }
        .collectLatest { (state, rendered, duration) ->
            // 每当上述三个值之一变化，这里触发
            _videoState.value = state
            _hasFirstFrameRendered.value = rendered
            _duration.value = duration
        }
    }
}
```

## 7. 常见的 Flow 操作符

| 操作符 | 作用 | 类似 Java |
| --- | --- | --- |
| `map` | 转换每个值 | `Function` |
| `filter` | 过滤值 | `Predicate` |
| `combine` | 合并多个 Flow | `CompletableFuture.allOf + thenApply` |
| `catch` | 捕获上游异常 | `try-catch` |
| `retry` | 失败重试 | 手动循环 |
| `debounce` | 防抖动 | 手动 Timer |
| `collectLatest` | 新值到达时取消前一个处理 | `switchMap` (Rx) |
| `flowOn` | 改变上游调度器 | `subscribeOn` |

## 8. PICO Demo 中的 Flow 模式总结

根据对全部 8 个 Demo 的扫描，Flow 的使用分为三个层次：

### 第 1 层：状态容器（5 个项目在用）

```kotlin
// 最简单的模式——把 StateFlow 当"可观察的状态"
class AudioControlViewModel : ViewModel() {
    private val _isEnabled = MutableStateFlow(false)
    val isEnabled: StateFlow<Boolean> = _isEnabled.asStateFlow()

    fun toggle() { _isEnabled.value = !_isEnabled.value }
}
```

### 第 2 层：响应式转换（仅 spatialvideo）

```kotlin
// 使用 combine + stateIn 做声明式数据转换
val progress = combine(flowA, flowB, flowC) { ... }
    .stateIn(viewModelScope, WhileSubscribed(5000), 0f)
```

### 第 3 层：Flow 与 Compose 桥接（仅 spatialvideo）

```kotlin
// 使用 snapshotFlow 将 Compose 属性转为 Flow
snapshotFlow { Triple(a, b, c) }.collectLatest { ... }
```

## 快速练习

尝试分析 `PICOProject/spatialvideo-0.13.3/app/src/main/java/com/pico/spatial/sample/spatialvideo/ui/VideoViewModel.kt`：

1. 有多少个 StateFlow？分别是什么类型？
2. videoProgress 是如何由多个 Flow 组合派生出来的？
3. SharingStarted.WhileSubscribed(5000) 中的 5000ms 有什么意义？

> [!INFO]
> **参考资料**
> * 最佳 Demo 参考：`PICOProject/spatialvideo-0.13.3/ui/VideoViewModel.kt`
> * [Kotlin Flow 官方文档](https://kotlinlang.org/docs/flow.html)
> * [Android Flow 使用指南](https://developer.android.com/kotlin/flow)

---
**上一课**: [[s01-compose-side-effects|补充课1：Compose 副作用与高级主题]] | **下一课**: [[s03-coroutine-exception-handling|补充课3：协程异常处理与结构化并发]]