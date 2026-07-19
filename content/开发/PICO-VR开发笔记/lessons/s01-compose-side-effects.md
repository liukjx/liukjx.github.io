---
title: "补充课1：Compose 副作用与高级主题"
description: |
  Compose 中的"副作用"是指发生在 Composable 函数范围之外的操作——比如网络请求、数据库写入、事件订阅。由于 Composable 函数可能在重组中频繁调用，不能直接在其中写副作用代码，必须使用 Compose 提供的安全副作用 API。
---

# Compose 副作用与高级主题

Compose 中的"副作用"是指发生在 Composable 函数范围之外的操作——比如网络请求、数据库写入、事件订阅。由于 Composable 函数可能在重组中频繁调用，**不能直接在其中写副作用代码**，必须使用 Compose 提供的**安全副作用 API**。

> [!NOTE]
> **核心认知**
>
> Composable 函数可能在任何时候被 Compose 引擎重复调用（重组）。如果直接把 `launch { }` 写在 Composable 函数体里，每次重组都会启动一个新协程——这就是需要副作用 API 的原因。

## 1. PICO Demo 中的副作用使用总览

| API | PICO Demo 中使用次数 | 项目数 | 最常见用途 |
|---|---|---|---|
| `DisposableEffect` | 15 | 6/8 | 清理资源、生命周期观察者、反注册系统 |
| `LaunchedEffect` | 6 | 5/8 | 一次性初始化、响应状态变化轮播 |
| `rememberCoroutineScope` | 6 | 5/8 | 从按钮点击等回调中启动协程 |
| `snapshotFlow` | 1 | 1/8 | 将 Compose 状态转为 Flow |

## 2. LaunchedEffect — 在 Composable 中安全启动协程

`LaunchedEffect` 进入组合时启动一个协程，离开组合时自动取消。它的 `key` 参数变化时会重启协程。

```kotlin
// 签名
LaunchedEffect(key1, key2, ...) {
    // 在这里写 suspend 代码，离开组合时自动取消
}
```

### 用法 1：一次性初始化（key = Unit）

传入 `Unit` 表示该效果只执行一次，不会重启。

```kotlin
// spatialmesh/GameScene.kt — 初始化 ECS 系统
LaunchedEffect(Unit) {
    AmmoManager.initialize()
    MeshScanManager.subscribeMeshAnchorUpdate()
    registerSystem<AmmoSystem>()
    hmdTrackingProvider.start()
    registerSystem<ShooterSystem>()
    AudioRepository.playBGM()
    // 不结束，一直挂起等待取消
    awaitCancellation()
}
```

### 用法 2：响应状态变化（key = 某个状态）

当 key 变化时，旧协程取消，新协程启动：

```kotlin
// animation/AnimationPlayView.kt
LaunchedEffect(isSkeletalSelected) {
    if (isSkeletalSelected) {
        skeletalEntity.enabled = true
        tweenEntity.enabled = false
        tweenAnimationViewModel.resetControl()
    } else {
        skeletalEntity.enabled = false
        tweenEntity.enabled = true
    }
}

// spatialml/SuperResolutionSpatialView.kt
LaunchedEffect(hasCameraPermission) {
    if (!hasCameraPermission && appMode == MR_CONFIRMED) {
        launcher.launch(Manifest.permission.CAMERA)
    } else {
        srViewModel.init(context, 4.0f)
    }
}
```

### 用法 3：循环操作

```kotlin
// spatialui/FeedsPage.kt — 自动轮播
LaunchedEffect(pagerState) {
    while (true) {
        delay(loopDuration)
        if (!pagerState.isScrollInProgress) {
            val nextPage = pagerState.currentPage + 1
            pagerState.animateScrollToPage(nextPage)
        }
    }
}
```

## 3. DisposableEffect — 安全的资源清理

`DisposableEffect` 在 Composable 离开组合时执行清理操作。这是 PICO Demo 中使用最多的副作用 API。

```kotlin
// 签名
DisposableEffect(key1, key2, ...) {
    // 初始化/注册
    onDispose {
        // 清理/反注册 — 离开组合时执行
    }
}
```

### 用法 1：反注册事件

```kotlin
// animation/AnimationPlayView.kt
DisposableEffect(Unit) {
    onDispose {
        EventManager.unsubscribeAllAnimationEvents()
    }
}

// physics/MainScreen.kt
DisposableEffect(Unit) {
    onDispose {
        viewModel.unsubscribeAllCollisionEvents()
    }
}
```

### 用法 2：生命周期观察者（PICO 最常用模式）

这是 PICO Demo 的标准模式——配合 `LifecycleEventObserver` 监听 Activity 生命周期：

```kotlin
// spatialaudio/ControlPanel.kt
DisposableEffect(lifecycleOwner) {
    val observer = LifecycleEventObserver { _, event ->
        if (event == Lifecycle.Event.ON_PAUSE ||
            event == Lifecycle.Event.ON_DESTROY) {
            coroutine.launch(Dispatchers.Main.immediate) {
                closeStage()
            }
        }
    }
    lifecycleOwner.lifecycle.addObserver(observer)
    onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
}

// spatialvideo/SpatialVideoScreen.kt
DisposableEffect(lifecycleOwner) {
    val observer = LifecycleEventObserver { _, event ->
        when (event) {
            Lifecycle.Event.ON_PAUSE  -> videoViewModel.pause()
            Lifecycle.Event.ON_RESUME -> videoViewModel.resume()
            else -> {}
        }
    }
    lifecycleOwner.lifecycle.addObserver(observer)
    onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
}
```

### 用法 3：ECS 系统注册/反注册

```kotlin
// welcomespace/ItemDisplayVolume.kt
DisposableEffect(Unit) {
    registerSystem<RotationSystem>()
    onDispose {
        unregisterSystem<RotationSystem>()
        finishDisplay()
    }
}
```

## 4. rememberCoroutineScope — 从回调中启动协程

`LaunchedEffect` 和 `DisposableEffect` 在 Composable 的"声明阶段"启动协程。但如果需要从 `onClick` 之类的**回调**中启动协程呢？用 `rememberCoroutineScope`：

```kotlin
@Composable
fun PlaybackToolbar(videoViewModel: VideoViewModel) {
    val coroutineScope = rememberCoroutineScope()

    Button(onClick = {
        // 从按钮点击中启动协程
        coroutineScope.launch {
            videoViewModel.toggleImmersiveMode()
        }
    }) {
        Text("切换沉浸模式")
    }
}

// PICO Demo 中的实际用法
// spatialui/ContentDetailPage.kt
@Composable
fun ContentDetailPage() {
    val scope = rememberCoroutineScope()

    Button(onClick = {
        scope.launch {
            showSnackbar("已添加到收藏")
            // 打开子窗口
            openWindow(id = "detail_$id")
        }
    })
}
```

> [!TIP]
> **记住三者的区别**
>
> - `LaunchedEffect` — Compose 帮你启动、管理生命周期、可以取消重启
> - `DisposableEffect` — 非协程，用于注册/反注册资源
> - `rememberCoroutineScope` — 你自己控制何时启动，随 Composable 生命周期自动取消

## 5. awaitCancellation — 常驻协程模式

`awaitCancellation()` 是 Kotlin 的挂起函数，它永远不返回——协程被取消时才停止。这个模式在 `spatialmesh/GameScene.kt` 中被用于创建"常驻初始化协程"：

```kotlin
LaunchedEffect(Unit) {
    try {
        // 1. 初始化所有系统
        AmmoManager.initialize()
        MeshScanManager.subscribeMeshAnchorUpdate()
        registerSystem<AmmoSystem>()
        hmdTrackingProvider.start()
        registerSystem<ShooterSystem>()
        AudioRepository.playBGM()

        // 2. 挂起等待——组合被移除时自动取消
        awaitCancellation()
    } catch (t: Throwable) {
        Log.e(TAG, "[init] failed", t)
        throw t
    } finally {
        // 3. 无论取消还是异常，都执行清理
        withContext(NonCancellable) {
            runCatching { unregisterSystem<ShooterSystem>() }
            runCatching { hmdTrackingProvider.stop() }
            runCatching { unregisterSystem<AmmoSystem>() }
            runCatching { GameplayManager.clear() }
            runCatching { MeshScanManager.unsubscribeMeshAnchorUpdate() }
            runCatching { gameViewModel.reset() }
        }
    }
}
```

> [!NOTE]
> **这个模式为什么优秀？**
>
> 1. 一次性初始化（`LaunchedEffect(Unit)` 只执行一次）
> 2. 常驻运行（`awaitCancellation()` 保持协程存活）
> 3. 保证清理（`finally` 块确保反注册所有系统）
> 4. 安全执行（`NonCancellable` 确保即使被取消也执行完清理）
> 5. 容错处理（`runCatching` 让每个清理步骤独立，一个失败不影响其他的）

## 6. snapshotFlow — 将 Compose 状态转为 Flow

`snapshotFlow` 将 Compose 的**可观察状态**转换为 Kotlin Flow：

```kotlin
// spatialvideo/VideoViewModel.kt
init {
    viewModelScope.launch {
        // 每当 manager.state / hasFirstFrameRendered / duration 变化时发射新值
        snapshotFlow {
            Triple(
                manager.state,
                manager.hasFirstFrameRendered,
                manager.duration
            )
        }
        .collectLatest { (state, rendered, duration) ->
            _videoState.value = state
            _hasFirstFrameRendered.value = rendered
            _duration.value = duration
        }
    }
}
```

## 7. 实战规则总结

| 需求 | 使用 | 原因 |
|---|---|---|
| 进入页面时加载数据 | `LaunchedEffect(Unit)` | 自动管理协程生命周期 |
| 响应某个状态变化 | `LaunchedEffect(state)` | key 变化时自动重启 |
| 离开页面时清理资源 | `DisposableEffect` | `onDispose` 保证执行 |
| 监听 Activity 生命周期 | `DisposableEffect + LifecycleEventObserver` | PICO 标准模式 |
| 按钮点击触发异步 | `rememberCoroutineScope().launch` | 不能直接在 onClick 中调 suspend |
| 常驻运行+安全清理 | `LaunchedEffect + awaitCancellation + finally + NonCancellable` | spatialmesh 的最佳实践 |
| Composable 状态转为 Flow | `snapshotFlow` | 桥接 Compose 和 Flow 世界 |

## 8. CompositionLocal — 跨组件隐式传参

`CompositionLocal` 是 Compose 中实现**隐式依赖传递**的机制。类似 React 的 `Context` 或后端的 `ThreadLocal`——你不需要在每个函数参数中显式传递某个值，CompositionLocal 会自动向下传递。

> [!NOTE]
> **为什么需要 CompositionLocal？**
>
> 想象你需要把 `NavController` 从首页传到深层的子页面——如果每层 Composable 都加一个 `navController` 参数，接口会非常臃肿。CompositionLocal 让你在顶层"提供"值，任意下层直接"消费"。

### 8.1 compositionLocalOf — 创建局部的"依赖提供者"

```kotlin
// 1. 定义一个 CompositionLocal（通常在顶层文件中）
val LocalMainNavController = compositionLocalOf<NavHostController> {
    error("NavController not provided")  // 默认值（未提供时抛出）
}

// 2. 在顶层用 CompositionLocalProvider 提供值
@Composable
fun MainScreen() {
    val navController = rememberNavController()

    CompositionLocalProvider(LocalMainNavController provides navController) {
        // 所有子 Composable 都可以通过 LocalMainNavController.current 获取
        NavHost(navController, startDestination = "home") {
            composable("home") { HomePage() }
            composable("detail") { DetailPage() }
        }
    }
}

// 3. 在深层子组件中消费（不需要逐层传参）
@Composable
fun DeepNestedButton() {
    // 直接从 CompositionLocal 获取 NavController
    val navController = LocalMainNavController.current
    Button(onClick = { navController.navigate("detail") }) {
        Text("跳转")
    }
}
```

### 8.2 welcomespace 中的真实案例

`welcomespace/ui/navigation/MainNavHost.kt` 使用 CompositionLocal 传递 `NavController`：

```kotlin
// 定义（顶层 val）
val LocalMainNavController =
    compositionLocalOf<NavHostController> { error("NavController not provided") }

// 提供
@Composable
fun MainNavHost(modifier: Modifier = Modifier) {
    val navController = rememberNavController()
    CompositionLocalProvider(LocalMainNavController provides navController) {
        NavHost(navController = navController, startDestination = "homepage") {
            composable("homepage") { HomePage(...) }
            composable("furniture_library") { FurnitureLibraryPage() }
        }
    }
}

// 消费（在 FurnitureLibraryPage 的任意子组件中）
val navController = LocalMainNavController.current
navController.navigate("furniture_library")
```

### 8.3 PICO SDK 的内置 CompositionLocal

PICO Spatial UI 也大量使用 CompositionLocal 传递空间计算上下文：

| CompositionLocal | 提供的内容 | 用途 |
|---|---|---|
| `LocalSpatialNavigator` | `SpatialNavigator` | 打开/关闭 WindowContainer 和 Stage |
| `LocalWindowContainerScope` | `WindowContainerScope` | 当前窗口容器的作用域 |
| `LocalContext` | `Context` | Android Context（Compose 内置） |
| `LocalLifecycleOwner` | `LifecycleOwner` | 当前生命周期所有者（Compose 内置） |

```kotlin
// PICO 中使用 LocalSpatialNavigator 打开空间窗口
@Composable
fun OpenVolumeButton() {
    val spatialNavigator = LocalSpatialNavigator.current
    Button(onClick = {
        coroutineScope.launch {
            spatialNavigator.openWindowContainer(
                id = "detail_view",
                form = Form.Volumetric
            )
        }
    }) {
        Text("打开 3D 展示窗口")
    }
}
```

### 8.4 compositionLocalOf vs staticCompositionLocalOf

| | `compositionLocalOf` | `staticCompositionLocalOf` |
|---|---|---|
| 值变化时 | 只有**使用**该 Local 的组件重组 | 所有**子组件**都重组 |
| 性能 | 高（精确追踪） | 低（全量重组） |
| 适用场景 | 频繁变化的值（主题色、当前路由） | 几乎不变的值（Context、字体） |

> [!TIP]
> **💡 与后端对比**
>
> CompositionLocal 就像后端的依赖注入容器——在顶层注册依赖，下层自动获取。区别是 CompositionLocal 在 Compose 树层级生效（组件级作用域），而 Koin/Dagger 在对象图层级生效（类级作用域）。

## 快速练习

在 `PICOProject/spatialmesh-0.13.3/app/src/main/java/com/pico/spatial/sample/spatialmesh/ui/GameScene.kt` 中：

1. 找到 LaunchedEffect(Unit) 和 awaitCancellation 的用法
2. 找到所有 DisposableEffect 和它们各自的 onDispose 逻辑
3. 理解清理顺序为什么是逆序的

> [!INFO]
> **参考资料**
>
> - 最佳 Demo 参考：`PICOProject/spatialmesh-0.13.3/ui/GameScene.kt` — 包含所有四种副作用模式
> - 官方文档：[Compose Side Effects 官方指南](https://developer.android.com/compose/side-effects)

---
**上一课**: [[0022-dev-workflow-and-debugging|第22课]] | **下一课**: [[s02-kotlin-flow-deep|补充课2]]