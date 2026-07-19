---
title: "第20课：空间 UI 设计规范与最佳实践"
description: "掌握 PICO Spatial UI 的设计规范、PicoTheme 主题系统、玻璃材质控制、hover 效果规范、手势冲突避免等核心设计知识。"
---

# 空间 UI 设计规范与最佳实践

**本课目标**：掌握 PICO Spatial UI 的设计规范、PicoTheme 主题系统、玻璃材质控制、hover 效果规范、手势冲突避免等核心设计知识。

## 1. 四条最高优先级规范

以下四条规则是**绝对约束**，在所有情况下都必须遵守：

### 规则 1：必须使用 PicoTheme 包裹

每个 Activity / WindowContainer / Stage 的根节点必须用 `PicoTheme { ... }` 包裹。

```kotlin
DefaultWindowContainer {
    PicoTheme {          // ✅ 必须
        Box(Modifier.fillMaxSize()) {
            AppContent()
        }
    }
}

// 默认 colorScheme 使用系统主题色，不需额外传参
// 只在需要覆盖时：PicoTheme(colorScheme = myScheme)
```

### 规则 2：优先使用内置设计组件

所有 UI 组件优先使用 `com.pico.spatial.ui.design.*` 包中的内置组件。只有当没有合适的内置组件时才自定义。

**常用内置组件**：Button、Text、Icon、Card、TabBar、Toolbar、Slider、Toggle、ProgressIndicator、Dialog、Tooltip、Badge、Divider、List、NavigationBar 等 30+ 组件。

### 规则 3：hover 效果必须使用 spatialHoverEffect

自定义 hover 视觉效果必须使用 `Modifier.spatialHoverEffect`。

```kotlin
// ✅ 正确
Modifier.spatialHoverEffect()

// ❌ 错误：手动实现 hover 效果
Modifier.hoverable + animateFloatAsState(scale)  // 禁止
```

### 规则 4：窗口根节点背景——使用系统玻璃材质

默认情况下，窗口自带 `Material.Regular` 玻璃背景。不要在根节点上再叠加背景色。

**不同容器的玻璃控制方式不同**：

| 容器类型 | 玻璃开关位置 | 默认 |
|---|---|---|
| `DefaultWindowContainer` | AndroidManifest 的 Activity meta-data<br>`pico.spatial.windowcontainer.materialbackground="1"` | 开启 |
| `WindowContainer(...)` | DSL 参数 `enableMaterialBackground: Boolean = true` | 开启 |
| `Augment(...)` | DSL 参数 `enableMaterialBackground: Boolean = true` | 开启 |

```kotlin
// 需要自定义玻璃风格时：
// 1. 先关闭系统默认玻璃
// 2. 再手动设置

// Manifest 中（DefaultWindowContainer）
<meta-data android:name="pico.spatial.windowcontainer.materialbackground" android:value="0" />

// DSL 中（WindowContainer/Augment）
WindowContainer(id = "Detail", ..., enableMaterialBackground = false) {
    PicoTheme {
        // 自定义玻璃
        Box(Modifier.backgroundMaterial(
            enable = true,
            style = Material.Light  // 或 Material.Dark
        ))
    }
}

// ❌ 错误：在系统默认玻璃上再涂一层颜色
Box(Modifier.fillMaxSize().background(Color.Black))  // 禁止：会覆盖玻璃
```

## 2. PicoTheme 主题系统

### 2.1 颜色角色

```kotlin
PicoTheme.colorScheme.<role>
// 包括：primary, onPrimary, primaryContainer, onPrimaryContainer,
//       secondary, tertiary, background, surface, error 等
```

### 2.2 排版角色

```kotlin
PicoTheme.typography.<role>
// 包括：displayLarge, displayMedium, displaySmall,
//       headlineLarge, headlineMedium, headlineSmall,
//       titleLarge, titleMedium, titleSmall,
//       bodyLarge, bodyMedium, bodySmall,
//       labelLarge, labelMedium, labelSmall
```

### 2.3 最小合规骨架

```kotlin
class MyApp : Application() {
    override fun onCreate() {
        super.onCreate()
        launch(::mainApp)
    }
}

fun mainApp(scope: SpatialAppScope) = with(scope) {
    DefaultWindowContainer {
        PicoTheme {
            // ✅ 规则4：不在此处加 Modifier.background()
            Box(Modifier.fillMaxSize()) {
                AppContent()
            }
        }
    }

    // 附加窗口
    WindowContainer(id = "DetailPanel", form = Form.Planar,
        defaultSize = WindowContainerSize(640.dp, 360.dp)
    ) {
        PicoTheme {
            Box(Modifier.fillMaxSize()) {
                DetailContent()
            }
        }
    }
}
```

## 3. 空间 UI 能力 API

- **🖐️ 手势**: `detectSpatialTapGesture` / `detectSpatialDragGesture` / `detectSpatialRotateGesture` / `detectSpatialScaleGesture` / `detectSpatialTransformGesture`
- **✨ Vibrant 材质**: `Modifier.vibrantEffect(vibrant)` / `Color.withVibrant(...)` / `animateColorVibrantAsState`
- **🔆 Hover 效果**: `Modifier.spatialHoverEffect(...)` / `spatialHoverEffectGroup` / `disableSpatialHoverEffect`
- **📐 深度布局**: `Modifier.depth` / `depthIn` / `Box3D` / `padding3D` / `alignDepth` / `layout3D`
- **🪟 窗口约束**: `Modifier.windowConstraints(...)`
- **🫧 玻璃背景**: `Modifier.backgroundMaterial(style)`
- **↕️ Z 轴偏移**: `Modifier.offset(z)` / `Modifier.zOffset { ... }`
- **🔄 3D 变换**: `Modifier.rotate3D(...)` / `Modifier.scale3D(...)`
- **🗂️ 增强面板**: `Augment(...)` / `TabBar` / `Toolbar` / `Subwindow`

## 4. 手势系统详解

### 4.1 手势识别器

```kotlin
// 点击
Modifier.pointerInput(Unit) {
    detectSpatialTapGesture { tapEvent ->
        // tapEvent.position: Offset (2D 位置)
        println("Tapped at $tapEvent")
    }
}

// 拖动
Modifier.pointerInput(Unit) {
    detectSpatialDragGesture { change, dragAmount ->
        // dragAmount: Offset (每帧的拖动偏移)
        println("Dragged by $dragAmount")
    }
}

// 旋转
Modifier.pointerInput(Unit) {
    detectSpatialRotateGesture { rotation ->
        // rotation: Float (旋转角度)
        println("Rotated by $rotation")
    }
}

// 缩放
Modifier.pointerInput(Unit) {
    detectSpatialScaleGesture { scale ->
        // scale: Float (缩放比例)
        println("Scaled by $scale")
    }
}

// 复合变换（旋转+缩放+拖动同时检测）
Modifier.pointerInput(Unit) {
    detectSpatialTransformGesture { transformEvent ->
        // transformEvent 包含旋转/缩放/偏移
    }
}
```

### 4.2 手势冲突规则

> [!WARNING] 关键规则
> 不要在同一个 `pointerInput` 块中同时调用多个 `detectSpatial*` 识别器。如果需要复合手势，使用 `detectSpatialTransformGesture`。

```kotlin
// ✅ 正确：复合手势用一个识别器
Modifier.pointerInput(Unit) {
    detectSpatialTransformGesture { event ->
        // 同时处理旋转、缩放、拖动
    }
}

// ❌ 错误：不能在同一个 pointerInput 块中放多个
Modifier.pointerInput(Unit) {
    detectSpatialDragGesture { ... }  // 只会有第一个生效
    detectSpatialRotateGesture { ... }
}
```

### 4.3 可交互实体的前提条件

| 交互类型 | 需要的组件 |
|---|---|
| 程序化命中测试（RayCast） | 仅 `CollisionComponent` |
| 用户交互（注视/点击/拖动） | `CollisionComponent` + `InteractableComponent` |
| 注视反馈高亮 | 额外加 `HoverEffectComponent` |

## 5. 组件使用规则

### 5.1 内置组件优先

```kotlin
// ✅ 使用内置 Button
Button(onClick = { /* ... */ }) {
    Text("确认")
}

// ✅ 使用内置 Card
Card {
    Text("内容")
}

// ❌ 避免在不必要时自定义
// 如果内置组件能满足需求，不要自己从零写
```

### 5.2 自定义组件规范

当必须自定义组件时：

- 颜色：使用 `PicoTheme.colorScheme.<role>`，不要硬编码颜色值
- 排版：使用 `PicoTheme.typography.<role>`
- 点击反馈：使用 `LocalIndication.current` + `controllerHapticFeedback`
- hover：必须使用 `Modifier.spatialHoverEffect`
- 禁用状态：使用 `LocalDisableAlpha.current`

## 6. Vibrant 材质系统

Vibrant 材质让 UI 感知用户的注视焦点，产生动态的颜色变化：

```kotlin
// 方式 1：Modifier
Box(Modifier.vibrantEffect(Vibrant.LEVEL_1))

// 方式 2：颜色
val vibrantColor = MaterialTheme.colorScheme.primary.withVibrant(Vibrant.LEVEL_2)

// 方式 3：带动画
val animatedVibrant = animateColorVibrantAsState(
    targetVibrant = if (isFocused) Vibrant.LEVEL_3 else Vibrant.LEVEL_0
)
```

**Vibrant 级别**：LEVEL_0（无效果）→ LEVEL_1 → LEVEL_2 → LEVEL_3（最强效果）。级别越高，高亮越明显。

## 7. Modifier 组合顺序

当同时使用多个 SpatialUI modifier 时，固定顺序如下：

```
Box(
    Modifier
        .windowConstraints(...)           // 1️⃣ 窗口约束（最外层）
        .depth { ... }                    // 2️⃣ 深度布局
        .rotate3D(...) / .scale3D(...)    // 3️⃣ 3D 变换
        .backgroundMaterial(...)          // 4️⃣ 材质背景
        .spatialHoverEffect(...)          // 5️⃣ Hover 效果
        .vibrantEffect(...)               // 6️⃣ Vibrant 效果
        .zOffset { ... }                  // 7️⃣ Z 轴偏移
        .offset(z = ...)                  // 8️⃣ Z 偏移（最后）
        .pointerInput(Unit) {             // 9️⃣ 手势（最内层）
            detectSpatialTapGesture { }
        }
)
```

## 8. 常见反模式

| 反模式 | 问题 | 正确做法 |
|---|---|---|
| 不用 PicoTheme | 样式不一致，缺乏空间感 | 所有容器根节点用 PicoTheme 包裹 |
| 在玻璃上涂背景色 | 破坏玻璃视觉效果 | 先关玻璃开关，再自定义 |
| 手动实现 hover（hoverable + scale） | 与系统行为不一致 | 使用 spatialHoverEffect |
| 不指定 touchTarget 大小 | 空间交互难以命中 | 确保可交互元素 ≥ 48dp |
| pointerInput 中多个手势 | 只有第一个生效 | 用 detectSpatialTransformGesture |
| 硬编码颜色 | 主题切换时失效 | 使用 PicoTheme.colorScheme |
| Subwindow 不指定深度的 Z 位置 | 视觉上悬浮无层次 | 使用 depth / zOffset 控制层次 |

## 9. 交付自检清单

每次提交 UI 代码前，逐项检查：

1. ☐ 所有容器使用 `PicoTheme` 包裹
2. ☐ 使用了 `com.pico.spatial.ui.design.*` 内置组件（尽量）
3. ☐ 窗口根节点没有额外的 `Modifier.background()`（用了系统玻璃）
4. ☐ 所有 hover 效果使用 `Modifier.spatialHoverEffect`
5. ☐ 自定义组件使用 `PicoTheme.colorScheme` 而不是硬编码颜色
6. ☐ 手势识别：同一个 pointerInput 中只有 1 个 detectSpatial*
7. ☐ 可交互元素尺寸 ≥ 48dp 或使用 CollisionComponent
8. ☐ Modifier 顺序符合规范
9. ☐ 禁用状态使用了 `LocalDisableAlpha.current`

---
**上一课**: [[0019-scene-asset-workflow|第19课：场景资产工作流]] | **下一课**: [[0021-porting-android-app|第21课：应用移植]]