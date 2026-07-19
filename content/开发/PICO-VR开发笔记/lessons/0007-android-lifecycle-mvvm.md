---
title: "第7课：Android 生命周期与 MVVM 架构"
description: "这是进入 PICO SDK 之前的最后一块 Android 基础知识。理解 Android 生命周期和 MVVM 模式，你就掌握了 PICO 8 个 Demo 共同遵守的架构规范。"
---

# Android 生命周期与 MVVM 架构

这是进入 PICO SDK 之前的最后一块 Android 基础知识。理解 Android 生命周期和 MVVM 模式，你就掌握了 PICO 8 个 Demo 共同遵守的架构规范。

## 1. Android Activity 生命周期

Activity 是 Android 应用的基本"页面"单位。它有 6 个主要回调：

```text
         onCreate()         ← 创建（一次）
            │
         onStart()          ← 可见
            │
         onResume()         ← 获得焦点（可交互）
            │
         onPause()          ← 失去焦点（部分可见）
            │
         onStop()           ← 不可见
            │
         onDestroy()        ← 销毁（一次）
```

> [!NOTE]
> **后端类比**
> 这类似于 Web 请求的生命周期：onCreate = Servlet.init()、onResume = 请求处理中、onPause = 响应提交后、onDestroy = Servlet.destroy()。但 Activity 可以随时被销毁并重建（比如旋转屏幕）。

### PICO 中的简化

PICO Demo 中，Activity 被大幅简化。通常一个应用只需一个 Activity：

```kotlin
// LaunchActivity.kt — 所有 Demo 都如此
class LaunchActivity : SpatialLaunchActivity()

// 空的！SpatialLaunchActivity 内部已经处理了生命周期。
// 所有 UI 逻辑在 Compose 中管理。
```

> [!TIP]
> **为什么 PICO 不需要多个 Activity？**
> 传统 Android 每个"页面"一个 Activity。但在 PICO 的空间应用中，所有"页面"其实是 WindowContainer 或 Stage 中的 Compose 视图，由 Navigation 管理。PICO SDK 的 `SpatialLaunchActivity` 处理了窗口容器的创建和生命周期。

## 2. ViewModel — 生命周期感知的状态容器

ViewModel 是在屏幕旋转等配置变更时**保留数据**的组件。它是 MVVM 架构的核心。

```kotlin
// 标准 ViewModel 示例（PICO Demo 风格）
class PhysicsViewModel : ViewModel() {
    // 使用 mutableStateOf 持有状态
    var playPhase by mutableStateOf(PlayPhase.IDLE)
        private set

    var score by mutableIntStateOf(0)
        private set

    // 使用 viewModelScope 管理协程
    fun startGame() {
        viewModelScope.launch {
            playPhase = PlayPhase.PLAYING
            // 游戏循环...
        }
    }

    fun resetGame() {
        score = 0
        playPhase = PlayPhase.IDLE
    }
}

// 在 Composable 中使用
@Composable
fun GameScreen(viewModel: PhysicsViewModel = viewModel()) {
    // 当 playPhase 变化时，Text 自动重组
    Text("状态: ${viewModel.playPhase}")

    Button(onClick = { viewModel.startGame() }) {
        Text("开始游戏")
    }
}
```

> [!NOTE]
> **ViewModel 与后端 Controller 的区别**
> 后端的 Controller 每次请求新建。ViewModel 跟随 Activity/Fragment 的生命周期——Activity 还在，ViewModel 就在。这就意味着 ViewModel 天然适合持有 UI 状态。

## 3. MVVM 架构模式

PICO 所有 Demo 都遵循 MVVM（Model-View-ViewModel）模式：

```text
┌──────────┐    观察状态    ┌──────────┐    调用方法    ┌──────────┐
│          │ ←──────────── │          │ ←──────────── │          │
│  View    │               │ViewModel │               │  Model   │
│ (Compose)│ ────────────→ │ (State)  │ ────────────→ │  (Data)  │
│          │   自动重组     │          │   更新状态     │          │
└──────────┘               └──────────┘               └──────────┘
```

| 层 | 职责 | PICO Demo 示例 |
|---|---|---|
| **View** | UI 渲染，用户交互 | `HomePage.kt`、`GameScene.kt` |
| **ViewModel** | 持有 UI 状态，处理业务逻辑 | `HomeViewModel.kt`、`PhysicsViewModel.kt` |
| **Model** | 数据层（实体、资源、管理器） | `AnimationModels.kt`、`AssetBundle.kt` |

### 数据流示例（完整链路）

```kotlin
// 1. Model — 数据定义（AnimationModels.kt）
enum class NavigationState(val value: Int, val icon: Int) {
    SKELETAL(0, R.drawable.ic_skeletal),
    TWEEN(1, R.drawable.ic_tween)
}

// 2. ViewModel — 状态管理（HomeViewModel.kt）
class HomeViewModel : ViewModel() {
    private val _selectedTab = MutableStateFlow<NavigationState>(NavigationState.SKELETAL)
    val selectedTab: StateFlow<NavigationState> = _selectedTab.asStateFlow()

    fun onTabSelected(tab: NavigationState) {
        _selectedTab.value = tab
    }
}

// 3. View — UI 展示（HomePage.kt）
@Composable
fun HomePage(viewModel: HomeViewModel = viewModel()) {
    val selectedTab by viewModel.selectedTab.collectAsStateWithLifecycle()

    Column {
        TabBar(selectedTab) { viewModel.onTabSelected(it) }
        when (selectedTab) {
            NavigationState.SKELETAL -> SkeletalAnimationList()
            NavigationState.TWEEN -> TweenAnimationList()
        }
    }
}
```

## 4. PICO Demo 中的 MVVM 变化形式

### 形式 A：StateFlow 模式（最常用）

```kotlin
// spatialui, spatialvideo, spatialmesh 等
class VideoViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(VideoUiState())
    val uiState: StateFlow<VideoUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            val bundle = videoAssetBundle.await()
            _uiState.value = _uiState.value.copy(isInitialized = true)
        }
    }
}

data class VideoUiState(
    val isInitialized: Boolean = false,
    val isPlaying: Boolean = false,
    val progress: Float = 0f
)
```

### 形式 B：mutableStateOf 模式（简单场景）

```kotlin
// physics-0.13.3 — 状态简单，直接用 mutableStateOf
class PhysicsViewModel : ViewModel() {
    var playPhase by mutableStateOf(PlayPhase.IDLE)
        private set
    var hint by mutableStateOf("")
        private set
}
```

### 形式 C：Koin 作用域注入（复杂场景）

```kotlin
// welcomespace-0.13.3 — 使用 Koin 管理 ViewModel
class FullSpaceRoomViewModel(
    private val assetBundle: Deferred<AssetBundle>
) : ViewModel() {
    // ...
}

// Koin 模块定义
val appModule = module {
    scopedOf<FurnitureLibraryViewModel>()
    scopedOf<ItemDisplayViewModel>()
    scopedOf<DecorateSpaceViewModel>()
}

// 在 Composable 中解析
@Composable
fun SomeScreen() {
    val viewModel: FullSpaceRoomViewModel =
        koinViewModel(scope = getKoin().getOrCreateScope("roomScope"))
}
```

## 5. Android 生命周期与协程

PICO Demo 中处理生命周期的最佳实践：

```kotlin
// 方式 1：viewModelScope（ViewModel 销毁时自动取消）
viewModelScope.launch {
    // 网络请求、资源加载等
    val data = repository.fetchData()
    _uiState.value = _uiState.value.copy(data = data)
}

// 方式 2：DisposableEffect + LifecycleEventObserver（Composable 中）
@Composable
fun LifecycleAwareComposable() {
    DisposableEffect(Unit) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_RESUME -> { /* 恢复 */ }
                Lifecycle.Event.ON_PAUSE  -> { /* 暂停 */ }
                else -> {}
            }
        }
        lifecycle.addObserver(observer)
        onDispose { lifecycle.removeObserver(observer) }
    }
}

// 方式 3：LaunchedEffect + awaitCancellation（PICO 特有的模式）
@Composable
fun MainStageContent() {
    LaunchedEffect(Unit) {
        try {
            // 初始化
        } finally {
            // 清理（使用 NonCancellable 确保即使取消也执行）
            withContext(NonCancellable) {
                unregisterSystem<AmmoSystem>()
                gameplayManager.reset()
            }
        }
    }
}
```

## 6. 从后端角度理解 MVVM

| 后端概念 | Android MVVM 对应 |
|---|---|
| Controller | ViewModel（管理状态）+ Navigation（管理页面路由） |
| Service | ViewModel + Repository |
| DTO | data class / UI State |
| Session | ViewModel（存活于 Activity 生命周期内） |
| 依赖注入（Spring） | Koin / Hilt（welcomespace 使用 Koin） |
| Model/Entity | data class + Repository + ECS Entity（PICO 特有） |

## 7. 如何阅读一个 PICO Demo 项目

当你打开一个新的 Demo 项目，按这个顺序阅读：

1. **build.gradle.kts** — 了解使用的 SDK 模块
2. **AndroidManifest.xml** — 了解入口 Activity 和 PICO 配置
3. **SpatialApplication.kt** → **Main.kt** — 启动流程
4. **data/*.kt** — 数据模型
5. ***ViewModel.kt** — 业务逻辑
6. **ui/*.kt** — UI 组件（入口页面开始）

## 快速练习

阅读 `PICOProject/animation-0.13.3` 的 `SkeletalAnimationViewModel.kt`，回答：

1. 它使用哪个协程作用域？
2. 它的状态是用 `StateFlow` 还是 `mutableStateOf`？
3. 初始化逻辑在哪里执行？

<details>
<summary>点击查看提示</summary>
打开 `PICOProject/animation-0.13.3/app/src/main/java/com/pico/spatial/sample/animation/ui/skeletal/SkeletalAnimationViewModel.kt` 查看。
</details>

---

> [!INFO]
> **参考资料**
> - [Android ViewModel 官方文档](https://developer.android.com/topic/libraries/architecture/viewmodel)
> - 本地 Demo：`PICOProject/*/ui/*ViewModel.kt`
>
> **有疑问？** 随时问我。

---
**上一课**: [[0006-jetpack-compose-intro|第6课：Jetpack Compose 声明式 UI]] | **下一课**: [[0008-pico-sdk-architecture|第8课：PICO Spatial SDK 总体架构]]