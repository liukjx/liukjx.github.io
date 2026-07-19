---
title: "第12课：Spatial UI — 空间用户界面"
description: "PICO Spatial UI 是基于 Jetpack Compose 构建的空间 UI 框架。它将标准 Compose 组件扩展到三维空间，支持眼动+手部交互、空间布局和 3D 内容集成。"
---

# Spatial UI — 空间用户界面

PICO Spatial UI 是基于 Jetpack Compose 构建的空间 UI 框架。它将标准 Compose 组件扩展到三维空间，支持眼动+手部交互、空间布局和 3D 内容集成。

> [!NOTE]
> **一句话概括**
> Spatial UI = Jetpack Compose（声明式 2D UI）+ 空间扩展（3D 布局、立体交互、空间容器）

## 1. 三层架构

| 层级 | Maven 坐标 | 内容 |
|------|-----------|------|
| **UI Foundation** | `spatial-ui-foundation` | DSL 入口、WindowContainer/Stage、SpatialView、手势、布局修饰符、3D 效果、悬停、触觉、AttachmentPanel |
| **UI Design** | `spatial-ui-design` | PicoTheme、全部 UI 组件库（Button/Text/Slider/Menu/Dialog 等 30+）、设计令牌 |
| **UI Platform** | `spatial-ui-platform` | SpatialLaunchActivity、容器导航、长度单位转换、平台能力检测、Material 样式 |

## 2. PicoTheme — 空间主题

```kotlin
DefaultWindowContainer {
    PicoTheme {
        // 所有 UI 组件在此渲染
    }
}

// 自定义颜色方案
PicoTheme(colorScheme = defaultColorScheme()) { ... }

// 主题提供的设计令牌
PicoTheme.colorScheme.fillPrimary        // 填充色（主色）
PicoTheme.colorScheme.labelPrimaryLight  // 标签色（浅色）
PicoTheme.colorTokens.LabelPrimary       // 标签色（独立令牌）
PicoTheme.typography.bodyLarge           // 排版系统
PicoTheme.typography.titleMedium
PicoTheme.typography.display             // 展示大标题
PicoTheme.typography.headlineLarge       // 头条标题
```

## 3. 窗口容器完整 API

```kotlin
// DefaultWindowContainer — 最简单的平面窗口
DefaultWindowContainer {
    PicoTheme { HomePage() }
}

// WindowContainer — 完整配置
WindowContainer(
    id = "myWindow",
    form = Form.Volumetric,                    // Planar / Volumetric
    defaultSize = Size(800f, 600f, 800f),      // 宽/高/深度
    resizeType = ContainerResizeType.ContentSize,
    worldScale = WorldScale.Fixed,             // Fixed / Dynamic
    enableMaterialBackground = true            // 材质背景（玻璃效果）
) {
    PicoTheme { Content() }
}

// Stage — 全空间沉浸式
Stage(
    id = "mainStage",
    immersion = 80,                            // 0-100 沉浸度
    upperLimbRenderMode = UpperLimbRenderMode.HIDE
) {
    PicoTheme { FullSpaceRoom() }
}

// 容器间导航
@Composable
fun HomePage() {
    val navigator = LocalSpatialNavigator.current

    Button(onClick = {
        // 打开新窗口
        navigator.openWindowContainer(id = "detail", key = "item_001")
    })

    Button(onClick = {
        // 打开 Stage
        navigator.openStage("gameStage", StageStyle.Mixed)
    })

    Button(onClick = {
        // 关闭
        navigator.closeWindowContainer("detail")
        closeStage()  // 或直接调用 （在 Stage 内）
    })
}

// 容器间传参
navigator.openWindowContainer(
    id = "detail",
    key = "artwork_001",
    bundle = bundleOf("artworkId" to "001", "title" to "Ancient Vase")
)

// 目标容器中接收
@Composable
fun DetailPage() {
    val artworkId = bundle?.getString("artworkId") ?: return
    // 使用 artworkId 加载数据
}
```

### 3.1 WindowContainerParamsUpdater — 运行时改窗口参数

```kotlin
import com.pico.spatial.ui.platform.containers.WindowContainerParamsUpdater
import com.pico.spatial.ui.foundation.dsl.LocalSpatialNavigator

@Composable
fun WindowSettings() {
    val navigator = LocalSpatialNavigator.current
    val updater = WindowContainerParamsUpdater(navigator, "mainWindow")

    // 修改标题栏类型
    updater.setCaptionBarType(
        WindowContainerParamsUpdater.CaptionBarType.SMALL
        // SMALL / LARGE / NONE
    )

    // 修改缩放限制
    updater.setResizeRestriction(
        WindowContainerParamsUpdater.ResizeRestriction.NO_RESTRICTION
        // NO_RESTRICTION / FIXED_SIZE / MIN_MAX
    )

    // 修改体积窗口底座面板
    updater.setVolumeBasePanelType(
        WindowContainerParamsUpdater.VolumeBasePanelType.ALWAYS_ON
        // ALWAYS_ON / ON_INTERACTION / OFF
    )
}
```

## 4. UI 组件完整目录

PICO Spatial UI 提供了 30+ 个组件。以下是完整目录：

### 4.1 基础组件

```kotlin
// Button — 有多种尺寸变体
Button(onClick = { }) { Text("确定") }
Button(onClick = { }, enabled = false) { Text("不可用") }
Button(
    onClick = { },
    colors = ButtonDefaults.buttonColors(
        containerColor = PicoTheme.colorScheme.fillPrimary,
        contentColor = Color.White
    ),
    shape = ButtonDefaults.Small     // Min / Small / Regular / Max
) { Text("自定义") }

// IconButton
IconButton(onClick = { }) {
    Icon(painter = painterResource(R.drawable.ic_star), contentDescription = "收藏")
}
IconButton(
    onClick = { },
    colors = IconButtonDefaults.iconButtonColors(
        containerColor = Color.Vibrant.withVibrant(Vibrant.Darkest),
        contentColor = Color.White
    ),
    modifier = Modifier.size(IconButtonDefaults.iconButtonSize(48.dp))
)

// ToggleIconButton（开关图标按钮）
ToggleIconButton(checked = isFav, onCheckedChange = { }) {
    Icon(...)
}

// Text
Text("Hello PICO", style = PicoTheme.typography.titleLarge)
Text("描述文本", fontSize = 14.sp, fontWeight = FontWeight.Medium, maxLines = 2)

// Icon
Icon(painter = painterResource(R.drawable.ic_heart), contentDescription = null)

// Divider
Divider()
```

### 4.2 输入组件

```kotlin
// SearchField
SearchField(
    value = query,
    onValueChange = { query = it },
    onSearch = { performSearch(it) },
    placeholder = { Text("搜索艺术作品") },
    leadingIcon = { Icon(Icons.Default.Search, null) }
)

// TextField / TextArea
TextField(
    value = text,
    onValueChange = { text = it },
    placeholder = { Text("输入名称") },
    colors = TextFieldDefaults.textFieldColors()
)
TextArea(value = desc, onValueChange = { desc = it })

// NumberField（数字输入）
NumberField(value = count, onValueChange = { count = it }, editable = true)

// Slider
Slider(
    value = volume,
    onValueChange = { volume = it },
    valueRange = 0f..1f,
    modifier = Modifier.weight(1f),
    colors = SliderDefaults.sliderColors(
        thumbColor = Color.Vibrant.withVibrant(Vibrant.Darkest)
    )
)

// SegmentControl（分段选择器）
SegmentControl {
    items(segments) { segment ->
        SegmentItem(
            selected = selected == segment,
            onClick = { selected = segment }
        ) {
            Text(segment.label)
        }
    }
}

// Checkbox
Checkbox(
    checked = isChecked,
    onCheckedChange = { isChecked = it },
    contentSize = CheckboxContentSize.Small
)

// Switch
Switch(checked = isEnabled, onCheckedChange = { isEnabled = it })

// Option（选项按钮）
Option(selected = isSelected, onSelectChange = { }) { Text("选项") }

// Chip 系列
Chip(onClick = { }) { Text("标签") }
RemovableChip(checked = true, onCheckedChange = { }) { Text("可移除") }
ToggleableChip(checked = isFiltered, onCheckedChange = { }) { Text("筛选") }
ButtonChip(onClick = { }) { Text("操作") }
```

### 4.3 导航与容器

```kotlin
// TabBar
TabBar(followViewpoints = ViewPoint.FrontOnly) {
    item(selected = currentTab == 0, mainContent = { Text("推荐") },
         supportContent = { Text("为你推荐") }, onClick = { currentTab = 0 })
    item(selected = currentTab == 1, mainContent = { Text("分类") },
         supportContent = { Text("浏览分类") }, onClick = { currentTab = 1 })
}

// SideNavigation
SideNavigation {
    SideNavigationItem(selected = true, onClick = { }) { Text("首页") }
    SideNavigationItem(selected = false, onClick = { }) { Text("设置") }
}

// TitleBar
TitleBar(
    title = "虚拟画廊",
    titleAlignment = TitleAlignment.CenterInBar,
    leadingActions = { IconButton(onClick = { }) { Icon(...) } }
)

// Toolbar（底部工具栏）
Toolbar(cornerSize = 12.dp) {
    // 固定在底部的操作栏
}

// PageControl（分页指示器）
PageControl(
    currentIndex = currentPage,
    totalDots = 5,
    onClickAction = { page -> /* 跳转 */ },
    colors = PageControlDefaults.pageControlColors().copy(normalColor = Color.Gray)
)

// Badge（徽标）
Badge(badgeColor = Color.Red, radius = 8.dp, contentPadding = PaddingValues(4.dp)) {
    Text("3")
}

// Link（超链接）
Link(onClick = { openUrl("https://example.com") }) { Text("查看详情") }
```

### 4.4 弹窗与反馈

```kotlin
// AlertDialog
AlertDialog(
    title = { Text("确认删除？") },
    content = { Text("此操作不可撤销") },
    buttons = {
        Button(onClick = { dismiss() }) { Text("取消") }
        Button(onClick = { confirm(); dismiss() }) { Text("删除") }
    },
    onDismissRequest = { dismiss() }
)

// Sheet（底部弹出面板）
Sheet(
    leadingAction = { IconButton(onClick = { }) { Icon(...) } },
    title = { Text("详情") },
    bottom = { Button(onClick = { }) { Text("确认") } },
    onDismissRequest = { }
) {
    // 内容
}

// Snackbar（轻提示）
val snackbarHostState = LocalSnackbarHostState.current
Button(onClick = {
    coroutineScope.launch {
        snackbarHostState.show(message = "已添加到收藏夹")
    }
})

// SpatialPopup（空间弹窗）
SpatialPopup(
    onDismissRequest = { showPopup = false },
    popupPositionProvider = rememberSpatialPopupPositionProvider(
        verticalPlacement = VerticalPlacement.above(8.dp),
        horizontalPlacement = HorizontalPlacement.alignStart()
    )
) {
    // 弹窗内容
}

// Menu
Menu {
    MenuItem(onClick = { }) { Text("编辑") }
    MenuItem(onClick = { }) { Text("分享") }
    MenuItem(onClick = { }) { Text("删除") }
}
```

### 4.5 展示组件

```kotlin
// ProgressIndicator
LinearProgressIndicator(progress = 0.5f, height = 4.dp)
CircularProgressIndicator()

// Subwindow（子窗口）
Subwindow {
    Text("这是一个子窗口内容")
}

// Coachmark（新手引导）
CoachmarkBox { Text("点击这里开始") }
RichCoachmark(
    title = { Text("欢迎！") },
    content = { Text("这是引导说明") },
    image = { Icon(...) },
    buttons = {
        CoachmarkDefaults.CoachmarkButton(onClick = { }) { Text("下一步") }
    }
)

// DatePicker
val dateState = rememberDatePickerState(initialSelectedDateMillis = System.currentTimeMillis())
DatePicker(
    state = dateState,
    onDateSelected = { millis -> /* 选择日期 */ },
    headerStyle = HeaderStyle.Dropdown
)
```

## 5. 3D 内容集成

### 5.1 SpatialView — 嵌入 3D 场景

```kotlin
@Composable
fun GameView() {
    SpatialView(
        modifier = Modifier.fillMaxWidth().height(500.dp),
        // initial: 初始化 3D 内容（只执行一次）
        initial = { content: SpatialViewContent ->
            val entity = Entity.load("models/robot.glb")
            content.addEntity(entity)
        },
        // update: 每帧更新
        update = { content, deltaTime ->
            // 每帧逻辑
        },
        // attachments: 在 3D 场景上叠加 2D UI
        attachments = {
            AttachmentPanel {
                Button(onClick = { shoot() }) {
                    Text("射击")
                }
            }
        }
    )
}
```

### 5.2 SpatialViewContent API

```kotlin
// content 可用方法：
content.addEntity(entity)                // 添加实体到场景
content.removeEntity(entity)             // 从场景移除

// 订阅事件（系统级、碰撞、动画、音频等）
content.subscribe(CollisionEvents.Enter::class.java) { event -> }
content.subscribeAnimationEvents { event -> }
content.subscribe(AudioEvents.PlaybackCompleted::class.java) { event -> }

// 加载模型资源
val modelRes = content.loadModelResource("models/vase.usdz")

// 坐标空间转换
content.convertRotation(rotation, from = ViewCoordinateSpace.Global, to = content.localSpatialCoordinateSpace)
```

### 5.3 SpatialModelView — 快捷 3D 模型展示

```kotlin
@Composable
fun ModelCard() {
    // 从 AssetBundle 加载 model
    SpatialModelView(
        source = Source.bundle("Models/MyModel") {
            runBlocking { assetBundle.await() }
        },
        modifier = Modifier.size(200.dp, 250.dp),
        resizability = Resizability.FitInside
    ) { state ->
        // state 是 ModelLoadingState 的 sealed class
        when (state) {
            is ModelLoadingState.Loading -> CircularProgressIndicator()
            is ModelLoadingState.Success -> {
                // 模型已加载，可以添加交互
                Model(state.model)
            }
            is ModelLoadingState.Error -> Text("加载失败")
        }
    }
}
```

### 5.4 AttachmentPanel — 3D 附着 2D UI

```kotlin
// 在 SpatialView 中将 2D UI 附着到 3D 实体上
SpatialView(
    initial = { content ->
        val entity = Entity.load("models/cube.glb")
        entity.setName("target_cube")
        content.addEntity(entity)
    },
    attachments = {
        // 附着到名为 "target_cube" 的实体上
        AttachmentPanel(
            id = "label",
            entity = attachments.entity("target_cube"),
            alignment = AttachmentPanelComponent.Alignment.TOP_CENTER
        ) {
            Text("这是一个立方体", style = PicoTheme.typography.bodySmall)
        }
    }
)
```

## 6. 3D 手势交互

```kotlin
@Composable
fun GestureDemo() {
    var scale by remember { mutableFloatStateOf(1f) }
    var rotationY by remember { mutableFloatStateOf(0f) }

    SpatialView(
        initial = { content ->
            val entity = Entity.load("models/vase.glb")
            entity.setName("vase")
            // 添加 InteractableComponent 标记为可交互
            entity.components.set(InteractableComponent())
            content.addEntity(entity)
        },
        modifier = Modifier
            .fillMaxWidth()
            .height(400.dp)
            // 3D 点击手势
            .pointerInput(Unit) {
                detectSpatialTapGesture(
                    context = this,
                    target = TargetEntity.any { it.getName() == "vase" }
                ) { hitEntity, hitPosition ->
                    // 点击了花瓶
                }
            }
            // 3D 拖拽手势
            .pointerInput(Unit) {
                detectSpatialDragGesture(
                    context = this,
                    target = TargetEntity.any { it.getName() == "vase" }
                ) { dragEntity, delta ->
                    // 拖拽 delta 增量
                }
            }
            // 3D 缩放手势
            .pointerInput(Unit) {
                detectSpatialScaleGesture(
                    context = this,
                    onScale = { scaleFactor ->
                        scale *= scaleFactor
                    }
                )
            }
    )
}

// 也可以直接在 SpatialView 上附加手势检测（不指定 target 则检测所有）
SpatialView(
    modifier = Modifier.pointerInput(Unit) {
        detectSpatialTapGesture(context = this) { entity, position ->
            // 点击了场景中的任意实体
        }
    }
)
```

### 6.1 InteractionKind — 区分交互方式

```kotlin
import com.pico.spatial.ui.foundation.gesture.data.InteractionKind

// 在手势回调中获取交互方式
Modifier.pointerInput(Unit) {
    detectSpatialTapGesture { hitEntity, hitPosition, interactionKind ->
        when (interactionKind) {
            InteractionKind.RayBasedPinch -> { /* 手柄射线点击 */ }
            InteractionKind.DirectPinch -> { /* 手部直接触摸 */ }
            InteractionKind.GazePinch -> { /* 凝视选中 */ }
            InteractionKind.Poke -> { /* 手指戳 */ }
            InteractionKind.Pointer -> { /* 指针设备 */ }
        }
    }
}

// 5 种交互方式适用场景
// RayBasedPinch — 手柄默认，远距离操作
// DirectPinch  — 手部追踪时直接抓取
// GazePinch    — 眼动注视 + 手部确认
// Poke         — 近距离戳点（按钮）
// Pointer      — 测试/开发工具
```

## 7. 空间修饰符

PICO Spatial UI 提供了一系列 Compose 修饰符，让 2D UI 在 3D 空间中正确显示：

| 修饰符 | 作用 | Demo 示例 |
|--------|------|-----------|
| `offset(x, y)` | 2D 偏移 | `Modifier.offset(100.dp, 0.dp)` |
| `offset(z)` | 3D 深度偏移（在 Z 轴方向移动） | `Modifier.offset(300.dp)` ← 注意：单个参数 = Z 轴 |
| `requiredDepth(d)` | 约束内容深度 | `Modifier.requiredDepth(100.dp)` |
| `rotate3D { rotation3D }` | 3D 旋转 | `Modifier.rotate3D { Offset3D(0f, rotation, 0f).toRotation3D() }` |
| `scale3d { }` | 3D 缩放 | `Modifier.scale3D { Offset3D(s, s, s).toScale3D() }` |
| `spatialFloating()` | Z 轴浮动悬浮 | `Modifier.spatialFloating(height = 20.dp)` |
| `backgroundMaterial()` | 材质背景（毛玻璃） | `Modifier.backgroundMaterial(style = Material.Thick)` |
| `spatialHoverEffect()` | 悬停高亮效果（手部靠近时） | `Modifier.spatialHoverEffect()` |
| `vibrantEffect(vibrant)` | 鲜艳/玻璃效果 | `Modifier.vibrantEffect(Vibrant.SemiLight)` |
| `windowConstraints(w, h)` | 约束窗口尺寸 | `Modifier.windowConstraints(width = 400.dp)` |
| `tooltip(text)` | 悬停提示 | `Modifier.tooltip("点击收藏")` |
| `semantics { contentDescription }` | 无障碍语义 | `Modifier.semantics { contentDescription = "收藏按钮" }` |

### 7.1 空间定位修饰符

```kotlin
// Z 轴深度偏移
@Composable
fun DepthExample() {
    Row {
        Box(Modifier.offset(z = 50.dp).requiredDepth(30.dp).backgroundMaterial()) {
            Text("近层")
        }
        Box(Modifier.offset(z = 0.dp).requiredDepth(30.dp).backgroundMaterial()) {
            Text("中层")
        }
        Box(Modifier.offset(z = -50.dp).requiredDepth(30.dp).backgroundMaterial()) {
            Text("远层")
        }
    }
}

// spatialFloating — 悬浮感
@Composable
fun FloatingCard() {
    Card(
        modifier = Modifier.size(150.dp, 200.dp)
            .spatialFloating(height = 30.dp)
            .backgroundMaterial()
    ) {
        Text("悬浮卡片", modifier = Modifier.padding(12.dp))
    }
}
```

### 7.2 3D 变换修饰符

```kotlin
// rotate3D — Y 轴翻转
@Composable
fun RotatingCard(tiltAngle: Float) {
    Box(
        modifier = Modifier.size(200.dp, 120.dp)
            .backgroundMaterial()
            .rotate3D { Offset3D(x = 0f, y = tiltAngle, z = 0f).toRotation3D() }
    ) {
        Text("3D 翻转", style = PicoTheme.typography.titleMedium)
    }
}

// scale3d — Z 轴空间缩放
@Composable
fun ScaleOnHover(isHovered: Boolean) {
    val s = if (isHovered) 1.2f else 1.0f
    Box(
        modifier = Modifier.size(100.dp)
            .backgroundMaterial()
            .scale3D { Offset3D(x = s, y = s, z = s).toScale3D() }
            .spatialHoverEffect()
    ) {
        Text("悬停放大")
    }
}

// 组合使用
@Composable
fun GlassCard() {
    Box(
        modifier = Modifier.size(200.dp, 100.dp)
            .requiredDepth(50.dp)
            .spatialFloating(height = 20.dp)
            .backgroundMaterial(style = Material.Thick)
            .spatialHoverEffect()
            .vibrantEffect(Vibrant.SemiLight)
            .rotate3D { Offset3D(x = 0f, y = tiltAngle, z = 0f).toRotation3D() }
    ) {
        Text("悬浮卡片", style = PicoTheme.typography.bodyLarge)
    }
}
```

### 7.3 视觉效果修饰符

```kotlin
// backgroundMaterial — 3 种毛玻璃厚度
@Composable
fun MaterialDemo() {
    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
        Box(Modifier.size(80.dp).backgroundMaterial(Material.Thin)) {
            Text("薄")
        }
        Box(Modifier.size(80.dp).backgroundMaterial(Material.Regular)) {
            Text("中")
        }
        Box(Modifier.size(80.dp).backgroundMaterial(Material.Thick)) {
            Text("厚")
        }
    }
}

// spatialHoverEffect — 手部靠近高亮
@Composable
fun HoverButton() {
    Button(onClick = { }, modifier = Modifier.spatialHoverEffect()) {
        Text("悬停高亮")
    }
}

// vibrantEffect — PICO 颜色层级
@Composable
fun VibrantPanel() {
    Surface(modifier = Modifier.size(200.dp, 60.dp).vibrantEffect(Vibrant.Darkest)) {
        Text("Darkest")
    }
    Surface(modifier = Modifier.size(200.dp, 60.dp).vibrantEffect(Vibrant.SemiLight)) {
        Text("SemiLight")
    }
    Surface(modifier = Modifier.size(200.dp, 60.dp).vibrantEffect(Vibrant.Neutral)) {
        Text("Neutral")
    }
}

// PICO 鲜艳颜色系统
Color.Vibrant              // 基础鲜艳色
Color.Vibrant.withVibrant(Vibrant.Darkest)
Color.Vibrant.withVibrant(Vibrant.Darker)
Color.Vibrant.withVibrant(Vibrant.SemiLight)
Color.Vibrant.withVibrant(Vibrant.Light)
Color.Vibrant.withVibrant(Vibrant.Neutral)
```

### 7.4 交互增强修饰符

```kotlin
// tooltip — 悬停提示
@Composable
fun TooltipButton() {
    IconButton(onClick = { }, modifier = Modifier.tooltip("收藏")) {
        Icon(painter = painterResource(R.drawable.ic_heart), contentDescription = "收藏")
    }
}

// windowConstraints — 约束内容宽度
@Composable
fun ConstrainedPanel() {
    Column(modifier = Modifier.fillMaxWidth().windowConstraints(width = 400.dp)) {
        // 内容自动适配
    }
}
```

## 8. 平台工具

```kotlin
// dp 到世界空间米的转换
val converter = LocalPhysicalLengthConverter.current
val worldMeters = converter.dpToLength(100.dp, LengthUnit.Meters)

// 设备能力检测
if (SpatialBuild.isSpatialPlatform()) {
    // 在 PICO 设备上运行
} else {
    // 在普通 Android 设备上（可能无法使用空间功能）
}

// Material 样式枚举
Material.Thick    // 厚材质（更不透明）
Material.Thin     // 薄材质（更透明）
Material.Regular  // 普通
```

## 9. spatialui Demo 架构

```text
spatialui-0.13.3/
└── app/src/main/java/com/pico/spatial/sample/spatialui/
    ├── Main.kt                   — DefaultWindowContainer + PicoTheme 入口
    ├── ui/
    │   ├── HomePage.kt           — TabBar + NavHost 导航
    │   ├── pages/
    │   │   ├── FeedsPage.kt      — HorizontalPager + LazyVerticalGrid + Badge
    │   │   ├── SearchPage.kt     — SearchField + Chip 筛选 + LazyVerticalGrid
    │   │   └── ContentDetailPage.kt — Snackbar + Toolbar + Menu + Subwindow
    │   ├── viewmodel/
    │   │   ├── FeedsViewModel.kt — StateFlow + 数据管理
    │   │   └── SearchViewModel.kt — 搜索 + 分类过滤
    │   └── model/DataModel.kt    — data class 模型定义
    └── ktx/Extensions.kt         — 扩展函数

welcomespace-0.13.3/ （3D 交互学习最佳参考）
    ├── Main.kt                   — WindowContainer + Stage 多容器
    ├── ecs/                      — 自定义 System + Component
    └── ui/
        ├── FullSpaceRoom.kt      — Stage 全空间 + SpatialView + ShaderGraph
        ├── ItemDisplayVolume.kt  — Volumetric 窗口 + 手势交互 + 碰撞
        ├── ItemModelCard.kt      — SpatialModelView + dragGesture + rotate3D
        └── SettingContent.kt     — DatePicker + Sheet + AlertDialog + Checkbox
```

## 10. 交互反馈 API

### 10.1 SpatialSoundEffect — 系统音效

无需加载音频文件即可播放的 12 种预定义 UI 音效。

```kotlin
import com.pico.spatial.ui.platform.SpatialSoundEffect
import com.pico.spatial.ui.platform.playSystemSound

@Composable
fun SoundButton() {
    Button(onClick = { playSystemSound(SpatialSoundEffect.CONFIRM) }) {
        Text("确认")
    }
}

// 常用音效对照
SpatialSoundEffect.CONFIRM       // 按钮点击、操作成功
SpatialSoundEffect.CANCEL        // 关闭弹窗、取消操作
SpatialSoundEffect.ERROR         // 表单验证失败、操作不允许
SpatialSoundEffect.TOGGLE_ON     // 开关 — 开
SpatialSoundEffect.TOGGLE_OFF    // 开关 — 关
SpatialSoundEffect.SLIDE         // Slider 拖动
SpatialSoundEffect.PICK          // 拾取 3D 物体
SpatialSoundEffect.DROP          // 放下 3D 物体
SpatialSoundEffect.NOTIFICATION  // 通知提示
SpatialSoundEffect.PAGE_CHANGE   // 页面切换
```

### 10.2 跨窗口拖放（Drag-and-Drop）

在 WindowContainer 之间拖拽 3D 物体或 UI 元素。

```kotlin
// "拖出"源窗口
SpatialView(
    modifier = Modifier.detectSpatialDragGesture(
        context = this,
        target = TargetEntity.any { it.getName() == "draggable" }
    ) { entity, delta ->
        // 拖拽过程中每帧更新位置
        entity.setPosition(entity.position + delta)
    }
)

// 跨窗口场景：源窗口拖出 → 目标窗口接收
// 1. 源窗口内开始拖拽，同时标记拖拽状态
// 2. 通过 navigator 在目标窗口显示放置指示器
// 3. 释放时通过 EventBus / shared ViewModel 传递 Entity 引用

val navigator = LocalSpatialNavigator.current
val sharedModel: GalleryViewModel = koinViewModel()

// 源窗口：开始拖拽
Modifier.detectSpatialDragGesture { entity, delta ->
    sharedModel.setDragging(true)
    // 显示跟随拖拽位置的预览实体
    previewEntity.setPosition(previewEntity.position + delta)
}

// 目标窗口：接收放置
Modifier.detectSpatialTapGesture { hitEntity, position ->
    if (sharedModel.isDragging) {
        // 在放置位置创建新实体
        val droppedEntity = Entity.load("models/item.glb")
        droppedEntity.setPosition(position)
        content.addEntity(droppedEntity)
        sharedModel.setDragging(false)
    }
}
```

## 11. 组件速查 — Top 10 实战用法

以下展示最常用的 10 个空间 UI 组件在真实布局中的用法，可以直接复制作为页面模板起点。

```kotlin
// ─── 1. Settings Page 模板 ───
// 展示 Button / Text / Slider / Checkbox / Switch 组合使用
@Composable
fun SettingsPage() {
    var volume by remember { mutableFloatStateOf(0.5f) }
    var isVibration by remember { mutableStateOf(true) }
    var isMusic by remember { mutableStateOf(false) }

    Column(modifier = Modifier.padding(24.dp).fillMaxWidth()) {
        // 标题
        Text("设置", style = PicoTheme.typography.Display)

        Spacer(Modifier.height(24.dp))

        // 音量滑块
        Text("音量", style = PicoTheme.typography.titleMedium)
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(painter = painterResource(R.drawable.ic_volume), null)
            Slider(
                value = volume,
                onValueChange = { volume = it },
                valueRange = 0f..1f,
                modifier = Modifier.weight(1f)
            )
        }
        // 显示当前值
        Text("${(volume * 100).toInt()}%", style = PicoTheme.typography.bodySmall)

        Spacer(Modifier.height(16.dp))

        // 开关选项
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("震动反馈", modifier = Modifier.weight(1f))
            Switch(checked = isVibration, onCheckedChange = { isVibration = it })
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("背景音乐", modifier = Modifier.weight(1f))
            Switch(checked = isMusic, onCheckedChange = { isMusic = it })
        }

        Spacer(Modifier.height(24.dp))
        HorizontalDivider()
        Spacer(Modifier.height(16.dp))

        // 分段选择器
        Text("画面模式", style = PicoTheme.typography.titleMedium)
        val modes = listOf("标准", "鲜艳", "护眼")
        var selectedMode by remember { mutableStateOf(0) }
        SegmentControl {
            modes.forEachIndexed { index, label ->
                SegmentItem(
                    selected = index == selectedMode,
                    onClick = { selectedMode = index }
                ) { Text(label) }
            }
        }

        Spacer(Modifier.height(32.dp))

        // 操作按钮
        Button(onClick = { /* 保存 */ },
            modifier = Modifier.fillMaxWidth(),
            shape = ButtonDefaults.Regular
        ) { Text("保存设置") }
    }
}

// ─── 2. Search Bar 模板 ───
@Composable
fun SearchPage() {
    var query by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("全部") }
    val categories = listOf("全部", "图片", "视频", "模型")

    Column(modifier = Modifier.padding(16.dp)) {
        SearchField(
            value = query,
            onValueChange = { query = it },
            onSearch = { performSearch(it) },
            placeholder = { Text("搜索作品...") },
            leadingIcon = { Icon(Icons.Default.Search, null) }
        )

        Spacer(Modifier.height(12.dp))
        // Chip 筛选
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            categories.forEach { cat ->
                Chip(
                    selected = cat == selectedCategory,
                    onClick = { selectedCategory = cat }
                ) { Text(cat) }
            }
        }
    }
}

// ─── 3. Dialog + Snackbar 模板 ───
@Composable
fun DeleteConfirmDialog(
    onDismiss: () -> Unit,
    onConfirm: () -> Unit
) {
    val snackbarHostState = LocalSnackbarHostState.current
    val scope = rememberCoroutineScope()

    AlertDialog(
        title = { Text("确认删除？") },
        content = { Text("删除后无法恢复此作品。") },
        buttons = {
            Button(onClick = onDismiss) { Text("取消") }
            Button(onClick = {
                onConfirm()
                scope.launch {
                    snackbarHostState.show(message = "已删除")
                }
            }) { Text("删除") }
        },
        onDismissRequest = onDismiss
    )
}

// ─── 4. TabBar 导航模板 ───
@Composable
fun MainTabs() {
    var currentTab by remember { mutableIntStateOf(0) }

    Column {
        TabBar(followViewpoints = ViewPoint.FrontOnly) {
            item(selected = currentTab == 0,
                 mainContent = { Text("推荐") },
                 onClick = { currentTab = 0 })
            item(selected = currentTab == 1,
                 mainContent = { Text("分类") },
                 onClick = { currentTab = 1 })
            item(selected = currentTab == 2,
                 mainContent = { Text("我的") },
                 onClick = { currentTab = 2 })
        }

        // 根据 currentTab 显示不同内容
        when (currentTab) {
            0 -> Text("推荐内容")
            1 -> Text("分类浏览")
            2 -> Text("个人中心")
        }
    }
}
```

## 附录：空间 UI 设计规范速查

以下是最关键的 4 条设计规范，详细内容见 [[0020-spatial-ui-design-guide|第20课：空间 UI 设计规范]]：

| 规则 | 要点 | 后果 |
|------|------|------|
| 1. 使用 PicoTheme 包裹 | 所有容器根节点用 `PicoTheme { ... }` | 样式不一致 |
| 2. 内置组件优先 | 优先使用 `com.pico.spatial.ui.design.*` | 不必要的自定义工作 |
| 3. hover 用 spatialHoverEffect | 禁止使用 `hoverable + animateFloatAsState` | 行为与系统不一致 |
| 4. 窗口使用系统玻璃材质 | 根节点不加 `Modifier.background()` | 破坏玻璃视觉效果 |

### 手势冲突规则

```kotlin
// ❌ 错误：多个 detectSpatial* 在同一个 pointerInput 块
Modifier.pointerInput(Unit) {
    detectSpatialDragGesture { ... }
    detectSpatialRotateGesture { ... }  // 不会生效
}

// ✅ 正确：复合手势用一个识别器
Modifier.pointerInput(Unit) {
    detectSpatialTransformGesture { event ->
        // 同时处理旋转/缩放/拖动
    }
}
```

### E 中的交互前置条件

| 交互类型 | 必须组件 |
|----------|---------|
| 程序化命中测试 (RayCast) | `CollisionComponent` |
| 用户交互 (注视/点击/拖拽) | `CollisionComponent` + `InteractableComponent` |
| 注视反馈高亮 | 额外加 `HoverEffectComponent` |

## 快速练习

查看 `PICOProject/welcomespace-0.13.3/app/.../ui/`：

1. 在 `ItemModelCard.kt` 中找到 `detectSpatialDragGesture` 和 `rotate3D` 修饰符的使用
2. 在 `ItemDisplayVolume.kt` 中找到 `detectSpatialScaleGesture` 和 `InteractableComponent`
3. 在 `SettingContent.kt` 中找到 `DatePicker`、`Checkbox`、`AlertDialog` 的使用

> [!INFO]
> **参考资料**
> - 本地 API 文档：`pico-sdk-0.13.3-mirror/spatial-api/0.13.3/spatialui/`
> - 最佳 Demo 参考：`PICOProject/welcomespace-0.13.3/`（3D 交互 + 容器 + 手势）
> - UI 组件库：`PICOProject/spatialui-0.13.3/`（30+ 组件示例）
> - 官方 UI 组件库文档：`downloads/spatial-sdk/markdown/031-spatial-ui-component-library.md`
> - 官方手势指南：`downloads/spatial-sdk/markdown/057-spatial-gestures.md`

---
**上一课**: [[0011-spatial-tracking|第11课：Spatial Tracking]] | **下一课**: [[0013-remaining-modules|第13课：其他模块]]