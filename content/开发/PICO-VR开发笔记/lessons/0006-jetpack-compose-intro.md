---
title: "第06课：Jetpack Compose 声明式 UI"
description: "Jetpack Compose 是 Android 的现代 UI 框架——用 Kotlin 代码声明 UI，而不是 XML 布局文件。PICO 的 Spatial UI 基于 Compose 构建，二者共享相同的声明式范式。"
---

> [!NOTE]
> **核心思维转变**
> 传统的 Android 布局（或前端 MVC）是"命令式"的：你创建视图、设置属性、手动更新 UI。Compose 是"声明式"的：你描述 UI 应该是什么样子，框架自动处理更新。
>
> **简单类比**：后端模板引擎（如 Thymeleaf）是声明式的—你写 HTML 模板，框架渲染。但 Compose 更进一步——数据变化时 UI 自动"重组"（recompose），类似 React 的 re-render。

## 1. 声明式 vs 命令式

**☕ 命令式 (传统 Android View)**

```java
TextView textView = findViewById(R.id.text);
textView.setText("Hello");
textView.setTextColor(Color.RED);

// 数据变化时手动更新
button.setOnClickListener(v -> {
    textView.setText("Clicked!");
    textView.setTextColor(Color.BLUE);
});
```

** Kotlin Compose**

```kotlin
@Composable
fun Greeting(name: String) {
    Text(
        text = "Hello $name",
        color = Color.Red
    )
}

// 数据变化时自动重组
@Composable
fun ClickableGreeting() {
    var text by remember { mutableStateOf("Hello") }
    Button(onClick = { text = "Clicked!" }) {
        Text(text, color = Color.Blue)
    }
}
```

## 2. Compose 三大核心概念

### 2.1 @Composable 函数

用 `@Composable` 注解标记的函数就是 UI 组件。它们：

- 只能用 `@Composable` 函数中调用其他 Composable
- 可以接受参数（数据），没有返回值（或返回 `Unit`）
- 数据变化时自动**重组**（recompose）

```kotlin
// 一个最简单的 Composable
@Composable
fun HomePage() {
    Row(verticalAlignment = Alignment.CenterVertically) {
        AnimationList()
        AnimationPlayView()
    }
}

// 这是 PICO Demo 中的真实代码（HomePage.kt）
// 它描述了一行中放两个组件：动画列表和播放器
```

### 2.2 remember + mutableStateOf

`remember` 在重组时保持值不被重置。`mutableStateOf` 创建可观察状态，状态变化触发重组。

```kotlin
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }
    // 等价于：val count = remember { mutableStateOf(0) }
    // 然后用 count.value 访问

    Button(onClick = { count++ }) {
        Text("点了我 $count 次")
    }
}
// 每次点击 count 改变，Text 自动更新（重组）
```

### 2.3 重组（Recomposition）

**理解重组是理解 Compose 的关键**：

- 重组不是整个 UI 重建——只有 `state` 发生变化的部分会重组
- 重组是"智能的"——Compose 编译器会分析哪些参数变化了，只重新执行依赖这些参数的代码
- Composable 函数可以在重组中被**频繁调用**，所以函数体应该没有副作用

## 3. Compose 布局基础

### 3.1 常用布局

```kotlin
// 行布局（水平排列）
@Composable
fun RowExample() {
    Row(
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text("左")
        Text("中")
        Text("右")
    }
}

// 列布局（垂直排列）
@Composable
fun ColumnExample() {
    Column(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text("上")
        Text("下")
    }
}

// Box（层叠布局，类似 FrameLayout）
@Composable
fun BoxExample() {
    Box(Modifier.fillMaxSize()) {
        Text("居中", modifier = Modifier.align(Alignment.Center))
    }
}
```

### 3.2 Modifier — 万能修饰符

Compose 用 `Modifier` 链式调用设置布局属性，没有 `setPadding()`、`setBackground()` 等方法：

```kotlin
@Composable
fun StyledText() {
    Text(
        text = "Hello",
        modifier = Modifier
            .padding(16.dp)           // 内边距
            .fillMaxWidth()           // 填满宽度
            .background(Color.Blue)   // 背景色
            .clickable { onClick() }  // 点击事件
    )
}
```

#### 3.2.1 链式顺序敏感 — 最常见的坑

**Modifier 的链式顺序决定执行顺序，调换顺序结果完全不同。**这是初学者最容易犯错的地方：

```kotlin
// 顺序 A：padding 在 clickable 外面
Text(
    text = "Hello",
    modifier = Modifier
        .padding(16.dp)           // 1. 先加 16dp 内边距
        .clickable { onClick() }  // 2. 在 padding 后的区域上设点击
        .background(Color.Blue)   // 3. 在点击区域上设背景
)

// 顺序 B：padding 在 clickable 里面
Text(
    text = "Hello",
    modifier = Modifier
        .clickable { onClick() }  // 1. 先在整个组件区域设点击
        .padding(16.dp)           // 2. 再加 16dp 内边距（点击区域缩小）
        .background(Color.Blue)   // 3. 在 padding 后的区域上设背景
)
```

> [!NOTE]
> **顺序敏感的核心原理**
> Modifier 链的每个环节都**包裹**前一个环节。`Modifier.A.B` 等价于 `A(B(content))`——A 包裹 B，B 包裹内容。
>
> **典型错误**：`.clickable { }.padding(16.dp)`——点击区域包含了 padding 的外部，padding 没有把点击区域缩小。
> **正确做法**：`.padding(16.dp).clickable { }`——先缩小内容区域，再在缩小后的区域上设点击。

另一个常见例子：`background` 和 `padding` 的顺序：

```kotlin
// 背景包含 padding 区域
Modifier.background(Color.Red).padding(16.dp)
// → 整个 16dp padding 区域也是红色背景

// padding 区域无背景
Modifier.padding(16.dp).background(Color.Red)
// → padding 区域透明，只有内容区域有红色背景
```

**经验法则**：先"布局"修饰符（`padding`、`size`、`fillMaxWidth`），后"交互"修饰符（`clickable`、`pointerInput`），最后"外观"修饰符（`background`、`clip`）。

#### 3.2.2 PICO Spatial 修饰符

PICO Spatial UI 在标准 Compose Modifier 之上扩展了空间计算专用的修饰符：

| 修饰符 | 作用 | 示例 |
| --- | --- | --- |
| `offset(z)` | Z 轴深度偏移（单个参数 = Z 轴） | `Modifier.offset(300.dp)` |
| `requiredDepth(d)` | 约束内容深度 | `Modifier.requiredDepth(100.dp)` |
| `rotate3D { }` | 3D 旋转 | `Modifier.rotate3D { Offset3D(0f, r, 0f).toRotation3D() }` |
| `scale3d { }` | 3D 缩放 | `Modifier.scale3D { Offset3D(s, s, s).toScale3D() }` |
| `spatialFloating()` | Z 轴浮动悬浮 | `Modifier.spatialFloating(height = 20.dp)` |
| `backgroundMaterial()` | 毛玻璃效果 | `Modifier.backgroundMaterial(Material.Thick)` |
| `spatialHoverEffect()` | 手部靠近高亮 | `Modifier.spatialHoverEffect()` |
| `vibrantEffect(v)` | 颜色层级效果 | `Modifier.vibrantEffect(Vibrant.SemiLight)` |
| `tooltip(text)` | 悬停提示 | `Modifier.tooltip("收藏")` |
| `windowConstraints(w,h)` | 约束窗口尺寸 | `Modifier.windowConstraints(width = 400.dp)` |

```kotlin
// PICO 修饰符组合示例——顺序同样敏感
@Composable
fun SpatialCard(tilt: Float) {
    Box(
        modifier = Modifier
            .size(200.dp, 100.dp)
            .requiredDepth(50.dp)            // 1. 设定深度
            .spatialFloating(height = 20.dp) // 2. 悬浮在 Z 轴
            .backgroundMaterial(Material.Thick)   // 3. 毛玻璃背景
            .spatialHoverEffect()            // 4. 悬停高亮
            .rotate3D { Offset3D(x = 0f, y = tilt, z = 0f).toRotation3D() } // 5. 3D 旋转
    ) {
        Text("空间卡片", style = PicoTheme.typography.titleMedium)
    }
}
```

> [!TIP]
> **💡 与 CSS 类比**
> Modifier 链就像 CSS 的 `transform` 顺序——`transform: translateX(10px) scale(2)` 和 `transform: scale(2) translateX(10px)` 结果不同。Modifier 也是一样，每个修饰符改变的是"输入"的尺寸/位置/事件区域，然后传给下一个。

## 4. PICO Spatial UI 与 Compose 的关系

PICO 的 Spatial UI 建立在 Jetpack Compose 之上，添加了空间计算特有的扩展：

| 标准 Compose | PICO Spatial UI | 用途 |
| --- | --- | --- |
| `MaterialTheme` | `PicoTheme` | PICO 空间 UI 主题 |
| `Button` | `Button`（在 PicoTheme 内） | 按钮（支持空间交互） |
| `Text` | `Text`（Spatial 字体） | 文本显示 |
| `Scaffold` | `WindowContainer` / `Stage` | 空间容器 |
| `Modifier.padding()` | `Modifier.depth()` | 3D 深度 |
| `Image` | `SpatialView` / `SpatialModelView` | 3D 模型展示 |
| `—` | `detectSpatialDragGesture()` | 空间拖拽手势 |

```kotlin
// PICO Demo 中的 Compose UI（animation/HomePage.kt）
@Composable
fun HomePage() {
    Row(verticalAlignment = Alignment.CenterVertically) {
        AnimationList()
        AnimationPlayView()
    }
}

// PICO Demo 中的 Compose + PICO 主题（animation/Main.kt）
fun mainApp(scope: SpatialAppScope) =
    with(scope) {
        DefaultWindowContainer {
            PicoTheme {            // ← PICO 主题替代 MaterialTheme
                Box {
                    AnimationTypeTabBar()
                    HomePage()
                }
            }
        }
    }
```

## 5. Compose 状态管理

在 PICO Demo 中可以看到多种状态管理方式：

### 5.1 mutableStateOf（Physics Demo）

```kotlin
class PhysicsViewModel : ViewModel() {
    var playPhase by mutableStateOf(PlayPhase.IDLE)
        private set

    fun startGame() {
        playPhase = PlayPhase.PLAYING  // 自动触发 UI 重组
    }
}
```

### 5.2 StateFlow（多数 Demo）

```kotlin
class VideoViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(VideoUiState())
    val uiState: StateFlow<VideoUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            // 收集数据流，更新状态
            _uiState.value = _uiState.value.copy(isInitialized = true)
        }
    }
}

// 在 Composable 中收集
@Composable
fun VideoScreen(viewModel: VideoViewModel) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    Text("初始化: ${uiState.isInitialized}")
}
```

## 6. 从后端视角理解 Compose

| 后端概念 | Compose 对应 |
| --- | --- |
| HTML 模板 | `@Composable` 函数 |
| 模板变量 | 函数参数 + state |
| Re-render | 重组（Recomposition） |
| 组件树 | Composable 嵌套调用 |
| CSS | `Modifier` |
| React 的 useState | `remember + mutableStateOf` |
| Vue 的计算属性 | `derivedStateOf` |

## 快速练习

尝试理解以下 Compose 代码：

```kotlin
@Composable
fun AnimationList(viewModel: HomeViewModel) {
    val animations by viewModel.animations.collectAsStateWithLifecycle()

    LazyColumn {
        items(animations) { animation ->
            Text(
                text = animation.name,
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { viewModel.select(animation) }
                    .padding(16.dp)
            )
        }
    }
}
```

你能识别出以下元素吗？

- 哪个是 Composable 函数？
- 状态从哪里来？
- 用户点击时发生了什么？

<details>
<summary>点击查看解析</summary>

- `AnimationList` 是 Composable 函数（`@Composable` 标注）
- 状态来自 `viewModel.animations`（StateFlow），通过 `collectAsStateWithLifecycle()` 转成 Compose 状态
- 用户点击时调用 `viewModel.select(animation)`，触发 ViewModel 更新状态，UI 自动重组

</details>

> [!INFO]
> **参考资料**
> - [Jetpack Compose 官方文档](https://developer.android.com/compose)
> - [Compose 状态管理官方指南](https://developer.android.com/compose/state)
> - 本地 Demo：`PICOProject/spatialui-0.13.3/app/src/main/java/`
>
> **有疑问？** 随时问我。

---
**上一课**: [[0005-android-project-structure|第5课：Android 项目结构与 Gradle 构建]] | **下一课**: [[0007-android-lifecycle-mvvm|第7课：Android 生命周期与 MVVM 架构]]