---
title: "第04课：深入解读 PICO Demo 中的 Kotlin 代码"
description: 综合运用前3课所学知识，深入分析 PICO 官方 8 个 Demo 项目的代码模式，涵盖扩展函数、密封类、单例模式等核心 Kotlin 特性在 VR 开发中的实际应用。
---

# 深入解读 PICO Demo 中的 Kotlin 代码

前三课我们分别学了基础语法、协程、集合和作用域函数。本节课我们将综合运用所有知识，深入分析 PICO 官方 8 个 Demo 项目的代码模式。

> [!NOTE]
> **目标**
> 学完本课后，你能独立阅读任意一个 PICO Demo 项目的完整代码，并准确识别出其中的 Kotlin 惯用模式、架构风格和 SDK 使用方式。

## 1. 项目结构的共同模式

所有 8 个 Demo 项目都遵循相同的顶层结构（以 `animation-0.13.3` 为例）：

```
animation-0.13.3/
├── build.gradle.kts              # 顶层构建配置
├── settings.gradle.kts           # 项目设置 + 仓库配置
├── gradle.properties             # Gradle 属性
├── gradle/
│   └── libs.versions.toml        # 版本目录（依赖版本管理）
└── app/
    ├── build.gradle.kts          # 应用模块构建配置
    ├── proguard-rules.pro
    └── src/main/
        ├── AndroidManifest.xml
        ├── res/                   # 资源文件
        └── java/com/pico/spatial/sample/xxx/
            ├── Main.kt                        # mainApp() 入口
            ├── platform/
            │   ├── SpatialApplication.kt      # Application 入口
            │   └── LaunchActivity.kt          # Activity（通常空实现）
            ├── data/                          # 数据模型
            ├── manager/                       # Manager 类（业务逻辑）
            ├── ecs/                           # ECS 组件/系统（如有）
            ├── ui/                            # Compose UI
            │   ├── home/                      # 首页
            │   └── xxx/                       # 其他页面
            └── ktx/                           # 扩展函数（如有）
```

## 2. 应用启动流程

所有 Demo 项目都遵循完全相同的启动流程：

```
  AndroidManifest.xml
         │
         ▼
  SpatialApplication.onCreate()
         │
         ▼
  launch(::mainApp)     ← PICO SDK DSL 函数
         │
         ▼
  fun mainApp(scope: SpatialAppScope) = with(scope) { ... }
         │
         ├── DefaultWindowContainer { }   ← 2D 窗口容器
         ├── WindowContainer(form = Volumetric) { }  ← 3D 体积窗口
         └── Stage { }                    ← 全空间舞台
               │
               ▼
         PicoTheme { }                    ← PICO 主题
               │
               ▼
         HomePage()                       ← 应用首页
```

7 个项目的 `SpatialApplication.kt` 几乎完全相同：

```kotlin
class SpatialApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        launch(::mainApp)    // :: 是函数引用——把 mainApp 函数作为参数传递
    }
}
```

`launch(::mainApp)` 做了三件事：

1. 创建 `SpatialAppScope`（PICO SDK 提供的作用域）
2. 在作用域中启动一个协程
3. 将作用域作为参数传给 `mainApp()`

## 3. mainApp 的架构模式

### 最简单的模式 — animation / physics / spatialaudio / spatialui

```kotlin
fun mainApp(scope: SpatialAppScope) =
    with(scope) {
        DefaultWindowContainer {
            PicoTheme {
                HomePage()  // 单一容器 + 主题
            }
        }
    }
```

### 多容器模式 — spatialvideo

```kotlin
fun mainApp(scope: SpatialAppScope) =
    with(scope) {
        DefaultWindowContainer {
            PicoTheme { VideoMainScreen() }
        }
        WindowContainer(
            id = "videoPlayerContainer",
            form = Form.Volumetric  // 体积窗口播放视频
        ) { PicoTheme { VideoPlayerScreen() } }
    }
```

### 最复杂的模式 — welcomespace（同时使用三种容器）

```kotlin
fun mainApp(scope: SpatialAppScope) =
    with(scope) {
        DefaultWindowContainer { PicoTheme { HomePage() } }
        WindowContainer(form = Form.Volumetric, id = "displayBox") {
            PicoTheme { ItemDisplayVolume() }
        }
        Stage(immersion = 100) {
            PicoTheme { FullSpaceRoom() }
        }
    }
```

## 4. Kotlin 特性在 Demo 中的集中体现

### 4.1 扩展函数 — Extensions.kt

`animation-0.13.3/app/.../ktx/Extensions.kt` 是一个典范：

```kotlin
// 给 String 添加扩展函数
fun String.asTitle(): String =
    split('_').joinToString(" ") { word ->
        word.lowercase(Locale.ROOT)
            .replaceFirstChar { it.titlecase(Locale.ROOT) }
    }

// 给 SDK 的 EaseType 枚举添加扩展函数
fun EaseType.toDisplayName(): String =
    when (this) {
        EaseType.LINEAR      -> "linear"
        EaseType.EASE_IN     -> "ease-in"
        EaseType.EASE_OUT    -> "ease-out"
        EaseType.EASE_INOUT  -> "ease-in-out"
        // ...
    }
```

> [!NOTE]
> 扩展函数让你在不修改原始类的情况下添加新功能——在 Java 中你需要写静态工具方法，在 Kotlin 中你可以直接 `"some_text".asTitle()`。

### 4.2 枚举 + 属性 + companion object

```kotlin
// AnimationModels.kt
enum class NavigationState(val value: Int, val icon: Int) {
    SKELETAL(0, R.drawable.ic_skeletal_animation),
    TWEEN(1, R.drawable.ic_tween_animation);

    companion object {
        fun getList(): List<NavigationState> =
            NavigationState.entries.toList()
    }
}

// 使用
val list = NavigationState.getList()
val icon = NavigationState.SKELETAL.icon  // 直接访问属性
```

### 4.3 data class + 默认参数 + copy()

```kotlin
data class TweenAnimationControl(
    val duration: Float = 1.0F,
    val speed: Float = 1.0F,
    val repeatCount: Int = -1,
    val repeatMode: RepeatMode = RepeatMode.REVERSE,
    val easeType: EaseType = EaseType.EASE_INOUT,
) {
    fun copyWith(property: TweenAnimationProperties, value: Any): TweenAnimationControl {
        return when (property) {
            TweenAnimationProperties.SPEED -> copy(speed = value as Float)
            TweenAnimationProperties.DURATION -> copy(duration = value as Float)
            // ...
        }
    }
}
```

### 4.4 object 单例

Kotlin 的 `object` 声明单例，在 Demo 中广泛应用于 Manager 和常量。

但 PICO Demo 中出现了 **3 种不同的"单例"模式**，需要分清：

| | `object` | `companion object` | 顶层 val |
|---|---|---|---|
| 本质 | 完整的单例类 | 类内部的静态成员容器 | 文件级常量 |
| 可以有方法 | ✅ 可以 | ✅ 可以 | ❌ 只有值 |
| 可以有属性 | ✅ 可变/不可变 | ✅ 可变/不可变 | ✅ 仅不可变 |
| 继承 | ✅ 可继承类/接口 | ✅ 可继承类/接口 | ❌ |
| Demo 典型用途 | Manager 类、配置 | 枚举的工具方法 | 全局常量 |

```kotlin
// 1. object — 完整单例（最常用）
//    特点：全局唯一实例，类似 Java 的 public static class
//    Demo 位置: spatialmesh/manager/GameplayManager.kt
object GameplayManager {
    var score = 0                      // 可变状态（全局单例持有）
    fun onMeshHit(entity: Entity) { }  // 全局方法
    fun resetGame() { score = 0 }
}

// 2. companion object — 类的伴生对象（= Java 的 static 成员）
//    特点：属于某个类，可以访问类的私有构造器
//    Demo 位置: animation/data/AnimationModels.kt
enum class NavigationState(val value: Int, val icon: Int) {
    SKELETAL(0, R.drawable.ic_skeletal_animation),
    TWEEN(1, R.drawable.ic_tween_animation);

    companion object {               // 相当于 Java 的 static {}
        fun getList(): List<NavigationState> =
            NavigationState.entries.toList()
    }
}

// 3. 顶层 val — 文件级常量
//    特点：不属于任何类，直接用
//    Demo 位置: welcomespace/util/Constants.kt
const val LOG_TAG = "WelcomeSpace"
val DEFAULT_IMMERSION = 80

// 使用方式对比
GameplayManager.score             // object.属性
GameplayManager.resetGame()       // object.方法
NavigationState.getList()         // 类名.companion方法
val tag = LOG_TAG                 // 直接使用
```

### 4.5 密封类的事件模式

密封类（`sealed class`）是 Kotlin 中定义**有限子类型集合**的方式。它和 `enum` 的区别：enum 的每个值是**同一个类型**的实例，sealed class 的每个子类可以是**不同类型**。

在 PICO SDK 和 Demo 中，sealed class 是**异步结果/事件回调**的标准模式：

```kotlin
// 模式 1：SDK 中的密封类 — WorldTrackingResult
// 成功时带数据、失败时带错误码，类型安全
sealed class WorldTrackingResult<out T> {
    data class Success<T>(val data: T) : WorldTrackingResult<T>()
    data class Error(val code: Int, val message: String) : WorldTrackingResult<Nothing>()
}

// 使用时：when 必须覆盖所有分支（编译器强制检查）
fun onAnchorResult(result: WorldTrackingResult<List<Anchor>>) {
    when (result) {
        is WorldTrackingResult.Success -> {
            showAnchors(result.data)     // result.data 自动转型为 List<Anchor>
        }
        is WorldTrackingResult.Error -> {
            showError(result.message)    // 编译器知道这里只有 Error 有 message
        }
    }
    // 不需要 else 分支 — 编译器检查密封类所有子类已覆盖
}

// 模式 2：UI 状态管理 — UIState 密封类
// Demo 中常用的 UI 状态模式
sealed class GalleryUiState {
    data object Loading : GalleryUiState()
    data class Success(val artworks: List<Artwork>) : GalleryUiState()
    data class Error(val message: String) : GalleryUiState()
}

@Composable
fun GalleryScreen(state: GalleryUiState) {
    when (state) {
        is GalleryUiState.Loading -> LoadingIndicator()
        is GalleryUiState.Success -> ArtworkList(state.artworks)
        is GalleryUiState.Error -> ErrorPanel(state.message)
    }
}

// 模式 3：事件总线 — 用密封类定义事件类型
sealed class AnimationEvent {
    data class Started(val name: String) : AnimationEvent()
    data class Completed(val name: String, val duration: Float) : AnimationEvent()
    data object LoopEnded : AnimationEvent()
}

// 为什么用 sealed class 而不是枚举？
// 1. 每个子类可以携带不同的数据（Started 有 name，Completed 还有 duration）
// 2. when 编译器穷尽检查，新增子类时所有 when 都会编译报错
// 3. data object 可以表示无参数状态（Loading, LoopEnded）
```

## 5. 各 Demo 的独特架构展示

| Demo | 架构特点 | 核心 Kotlin 特性 |
|---|---|---|
| animation | MVVM + 无状态工具类 | 扩展函数、data class、when 表达式 |
| physics | ECS 组件 + ViewModel 状态机 | 自定义 Component 继承、sealed class 状态 |
| spatialmesh | ECS 系统 + Manager 协调者 | object 单例、自定义 System 循环、awaitCancellation |
| spatialaudio | 资源池 + Manager 模式 | 并发 async/awaitAll、withContext(IO) |
| spatialvideo | 多容器 + 效果管理器 | scope.async、Deferred、SupervisorJob |
| welcomespace | DI (Koin) + 多容器 + 自定义 System | Koin 依赖注入、自定义 ECS System、CompositionLocal |
| spatialui | 纯 UI 展示 + Navigation | Sealed class 路由、StateFlow、collectAsStateWithLifecycle |
| spatialml | ML Pipeline 异步框架 | async 流水线、挂起函数链、Deferred 管理 |

## 6. 一个完整的 Demo 解读：Animation

让我们串读 `animation-0.13.3` 的全部源代码（18 个文件），理解各文件间的协作关系：

```
文件结构：
├── Main.kt                         → mainApp() 入口
├── data/AnimationModels.kt         → 所有数据模型
├── ktx/Extensions.kt               → 工具扩展函数
├── manager/EventManager.kt         → SDK 事件管理器
├── platform/
│   ├── SpatialApplication.kt       → Application 入口
│   └── LaunchActivity.kt           → Activity
├── ui/
│   ├── common/AnimationPlayView.kt → 动画播放器 UI
│   ├── home/
│   │   ├── AnimationList.kt        → 动画列表
│   │   ├── HomePage.kt             → 首页组合
│   │   ├── HomeViewModel.kt        → 首页 ViewModel
│   │   └── TabBar.kt               → 标签栏
│   ├── skeletal/
│   │   ├── SkeletalAnimationList.kt    → 骨骼动画列表
│   │   └── SkeletalAnimationViewModel.kt → 骨骼动画 ViewModel
│   └── tween/
│       ├── ControlWidgets.kt       → 补间动画控件
│       ├── TweenAnimationList.kt   → 补间动画列表
│       └── TweenAnimationViewModel.kt → 补间动画 ViewModel
└── util/
    ├── SkeletalAnimationUtil.kt    → 骨骼动画加载工具
    └── TweenAnimationUtil.kt       → 补间动画加载工具
```

### 数据流

```
User Action (点击动画项)
    │
    ▼
ViewModel (处理业务逻辑)
    │
    ▼
UI State (StateFlow / mutableStateOf)
    │
    ▼
Compose UI (自动重组)
    │
    ▼
SDK 操作 (Entity.load, animation.play 等)
```

## 7. 你现在的技能水平

完成前 4 课后，你应该已经能够：

- ✅ 阅读任意 Kotlin 代码，理解其与 Java 的对应关系
- ✅ 识别 PICO Demo 中的扩展函数、data class、object 单例等模式
- ✅ 理解 launch/async/await 协程模式在 Demo 中的实际用途
- ✅ 理解 with(scope) 等作用域函数的意义
- ✅ 快速定位 Demo 项目中的各个模块
- ✅ 理解 MVVM 架构的数据流向

> [!INFO]
> **练习建议**<br>
> 打开 `PICOProject/animation-0.13.3/` 的所有 Kotlin 源文件通读一遍，尝试在代码中标识出我们学过的每种 Kotlin 特性。<br><br>
> **有疑问？** 随时在对话中问我。

---
**上一课**: [[0003-kotlin-collections-functional|第3课]] | **下一课**: [[0005-android-project-structure|第5课]]