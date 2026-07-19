---
title: "第08课：PICO Spatial SDK 总体架构"
description: >
  这是 SDK 学习的开篇。本节课从宏观层面理解 SDK 的模块划分、依赖关系和设计哲学。学完本课后，你将清楚"什么时候该用哪个模块"以及"具体该用哪个 API"。
---

# 第8课：PICO Spatial SDK 总体架构

这是 SDK 学习的开篇。本节课从宏观层面理解 SDK 的模块划分、依赖关系和设计哲学。学完本课后，你将清楚"什么时候该用哪个模块"以及"具体该用哪个 API"。

> [!NOTE]
> **本节课目标**
> 学完后你能回答：SDK 有哪些模块？每个模块的关键类是什么？模块之间如何依赖？我想实现某个功能应该去查哪个模块的哪个 API？

## 1. SDK 概述

PICO Spatial SDK 是 PICO OS 6/7 的官方 XR 开发工具包，建立在 Android 标准应用框架之上：

- **空间计算能力**：场景构建、环境感知、多模态交互
- **声明式 UI 框架**：PICO Spatial UI（基于 Jetpack Compose）
- **ECS 架构**：实体-组件-系统用于管理 3D 场景

## 2. 模块全景图

```text
┌──────────────────────────────────────────────────────────┐
│                       你的应用 (App)                        │
├──────────────────────────────────────────────────────────┤
│   PICO Spatial UI                      │  Spatial ML     │
│   ┌──────────────────┐                │  ┌────────────┐  │
│   │ ui:design        │  UI 组件库     │  │ ml:securemr│  │
│   │   Button/Text/   │  PicoTheme     │  │ ml:readback│  │
│   │   Slider/Menu..  │  设计令牌      │  └────────────┘  │
│   ├──────────────────┤                │                   │
│   │ ui:foundation    │  UI 基元       │                   │
│   │   WindowContainer│  手势/布局     │                   │
│   │   SpatialView    │  3D 效果/悬停  │                   │
│   ├──────────────────┤                │                   │
│   │ ui:platform      │  平台桥接      │                   │
│   │   SpatialNavigator│容器管理       │                   │
│   │   PhysicalLength  │能力检测       │                   │
│   └────────┬─────────┘                └───────────────────┘
│            │ 依赖                                           │
│   ┌────────▼────────────────────────────────────────────┐  │
│   │              Spatial Core                           │  │
│   │  ┌──────────────────────────────────────────────┐   │  │
│   │  │  ECS (Entity-Component-System)               │   │  │
│   │  │  Entity / Component / System / Query          │   │  │
│   │  └──────────────────────────────────────────────┘   │  │
│   │  ┌──────────────────────────────────────────────┐   │  │
│   │  │  3D 内容子系统                               │   │  │
│   │  │  Model/Transform/Mesh/Texture/Material        │   │  │
│   │  │  Animation / Audio / Physics / Video          │   │  │
│   │  │  Lighting (IBL/Directional)                  │   │  │
│   │  └──────────────────────────────────────────────┘   │  │
│   │  ┌──────────────────────────────────────────────┐   │  │
│   │  │  Spatial Container                           │   │  │
│   │  │  WindowContainer / Stage / DefaultWindow     │   │  │
│   │  └──────────────────────────────────────────────┘   │  │
│   └─────────────────────────────────────────────────────┘  │
│            │                                                │
│   ┌────────▼────────────────────────────────────────────┐  │
│   │           Environment Perception (Sense)              │  │
│   │  MeshTracking / PlaneTracking / WorldTracking        │  │
│   │  Anchor (WorldAnchor/PlaneAnchor/MeshAnchor)         │  │
│   └────────────────────────────────────────────────────────┘  │
│            │                                                │
│   ┌────────▼────────────────────────────────────────────┐  │
│   │               Tracking                               │  │
│   │  HandTracking / EyeTracking / BodyTracking          │  │
│   │  ControllerTracking / HMDTracking / MotionTracking  │  │
│   └────────────────────────────────────────────────────────┘  │
│            │                                                │
│   ┌────────▼────────────────────────────────────────────┐  │
│   │              Foundation                              │  │
│   │  Math (Vector3/Quat/Matrix4/Transform/EulerAngles)   │  │
│   │  Color4 / Bool3 / Offset3D / Rotation3D             │  │
│   └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## 3. 模块详解 & 关键类速查

| 模块 | Maven 坐标 | 关键类 / API | 何时使用 |
| --- | --- | --- | --- |
| **Foundation** | `spatial-foundation` | `Vector3`, `Quat`, `Matrix4`, `Transform`, `EulerAngles`, `Color4`, `Bool3`, `Offset3D`, `Rotation3D` | 位置/旋转/缩放计算、颜色表示 |
| **Core** | `spatial-core` | `Entity`, `Component`, `System`, `SceneUpdateContext`, `EntityQueryCondition`<br>`TransformComponent`, `ModelComponent`, `MeshResource`, `TextureResource`, `PhysicallyBasedMaterial`, `ModelEntity`<br>`RigidBodyComponent`, `CollisionComponent`, `PhysicsVelocityComponent`<br>`AmbientAudioComponent`, `ObjectAudioComponent`, `AudioPlayerController`<br>`VideoPlayerComponent`, `CypressMediaPlayer`, `ShaderGraphMaterial`<br>`AssetBundle`, `AnimationResource`, `TweenAnimation` | 所有涉及 3D 内容的应用——这是核心依赖 |
| **Sense** | `spatial-sense` | `MeshTrackingManager`, `PlaneTrackingManager`, `WorldTrackingManager`<br>`WorldAnchor`, `PlaneAnchor`, `MeshAnchor`, `AnchorComponent`, `AnchorEntity` | 需要与现实世界交互的应用（MR 场景） |
| **Tracking** | `spatial-tracking` | `HandTrackingProvider`, `EyeTrackingProvider`, `BodyTrackingProvider`<br>`ControllerTrackingProvider`, `HMDTrackingProvider`, `MotionTrackingProvider`<br>`DataProvider<T>`, `HMDPose`, `HandJoint` | 需要手势交互、眼动追踪、全身动捕 |
| **UI Foundation** | `spatial-ui-foundation` | `SpatialAppScope`, `WindowContainer`, `Stage`, `Form`<br>`SpatialView`, `SpatialViewContent`, `AttachmentPanel`<br>`detectSpatialTapGesture`, `detectSpatialDragGesture`, `detectSpatialScaleGesture`<br>`backgroundMaterial`, `spatialHoverEffect`, `vibrantEffect`, `rotate3D`<br>`SpatialModelView`, `LocalSpatialNavigator` | 所有 PICO 应用——Compose 与 PICO 空间 UI 的桥梁 |
| **UI Design** | `spatial-ui-design` | `PicoTheme`, `Button`, `Text`, `Icon`, `TabBar`, `Slider`, `Menu`<br>`Dialog`, `Sheet`, `Snackbar`, `SearchField`, `TextField`, `Checkbox`<br>`Switch`, `DatePicker`, `Badge`, `Chip`, `Coachmark`, `ProgressIndicator`<br>`SideNavigation`, `TitleBar`, `Toolbar`, `PageControl`, `SegmentControl` | 需要标准 PICO UI 组件的应用（几乎所有） |
| **UI Platform** | `spatial-ui-platform` | `SpatialLaunchActivity`, `SpatialBuild`, `ContainerResizeType`<br>`PhysicalLengthConverter`, `LengthUnit`, `ViewPoint`, `StageStyle`<br>`Material` (Thick/Thin/Regular) | 平台能力检测、容器管理、尺寸转换 |
| **Spatial ML** | `spatial-ml-securemr`<br>`spatial-ml-readback` | `SpatialMLInstance`, `SpatialMLSession`, `Pipeline`<br>`PipelineTensor`, `GlobalTensor`, `MultiDimensionalInitInfo`<br>`DataType`, `ModelInferenceType.QNN_HTP` | 需要在设备上运行 ML 模型 |

## 4. 需求 → 模块 → API 完整决策树

下面是从"我想实现什么"到"该用哪个模块的哪个 API"的完整指南：

### 4.1 UI 相关

```text
┌─ 我想显示一个窗口 → spatial-ui-foundation → WindowContainer / DefaultWindowContainer
├─ 我想用全空间沉浸模式 → spatial-ui-foundation → Stage(id, immersion)
├─ 我想用 PICO 主题 → spatial-ui-design → PicoTheme { }
├─ 我想显示按钮 → spatial-ui-design → Button(onClick) { Text }
├─ 我想用 Tab 切换 → spatial-ui-design → TabBar { item { } }
├─ 我想用滑动条 → spatial-ui-design → Slider(value, onValueChange)
├─ 我想用搜索框 → spatial-ui-design → SearchField(value, onValueChange)
├─ 我想用菜单 → spatial-ui-design → Menu { MenuItem { } }
├─ 我想用弹窗 → spatial-ui-design → AlertDialog / Sheet / Snackbar / SpatialPopup
├─ 我想显示列表 → spatial-ui-design → LazyColumn / LazyVerticalGrid
├─ 我想用日期选择器 → spatial-ui-design → DatePicker(rememberDatePickerState())
├─ 我想显示加载 → spatial-ui-design → LinearProgressIndicator / CircularProgressIndicator
├─ 我想用复选框/开关 → spatial-ui-design → Checkbox / Switch
├─ 我想用新手引导 → spatial-ui-design → CoachmarkBox / RichCoachmark
├─ 我想用分页控制 → spatial-ui-design → PageControl / HorizontalPager
├─ 我想用徽标 → spatial-ui-design → Badge
├─ 我想用侧边导航 → spatial-ui-design → SideNavigation
├─ 我想用标题栏/工具栏 → spatial-ui-design → TitleBar / Toolbar
├─ 我想显示 3D 模型 → spatial-ui-foundation → SpatialModelView
├─ 我想嵌入 3D 场景 → spatial-ui-foundation → SpatialView(initial, attachments)
├─ 我想在 3D 上叠加 UI → spatial-ui-foundation → AttachmentPanel { }
├─ 我想检测 3D 点击 → spatial-ui-foundation → detectSpatialTapGesture
├─ 我想检测 3D 拖拽 → spatial-ui-foundation → detectSpatialDragGesture
├─ 我想检测 3D 缩放 → spatial-ui-foundation → detectSpatialScaleGesture
├─ 我想用 3D 悬停效果 → spatial-ui-foundation → spatialHoverEffect()
├─ 我想用玻璃效果 → spatial-ui-foundation → vibrantEffect() / backgroundMaterial()
├─ 我想用 3D 旋转修饰 → spatial-ui-foundation → rotate3D { rotation3D }
├─ 我想在 3D 空间偏移 → spatial-ui-foundation → offset(x, y) / offset(z)
├─ 我想打开/关闭窗口 → spatial-ui-platform → LocalSpatialNavigator → openWindowContainer/closeWindowContainer
├─ 我想打开/关闭 Stage → spatial-ui-platform → LocalSpatialNavigator → openStage/closeStage
├─ 我想转换 dp 到世界米 → spatial-ui-platform → PhysicalLengthConverter.dpToLength()
```

### 4.2 3D 场景

```text
┌─ 我想创建 3D 物体 → spatial-core → Entity() + components.set(ModelComponent(...))
├─ 我想添加位置/旋转 → spatial-core → Entity.components.set(TransformComponent(...)) / .setPosition() / .setEulerAngles()
├─ 我想加载 GLB 模型 → spatial-core → Entity.load(path) / ModelEntity(resource = ...)
├─ 我想加载资源包 → spatial-core → AssetBundle.load(path) / bundle.loadModel(name)
├─ 我想加载纹理 → spatial-core → TextureResource.load(path, LoadType)
├─ 我想加载网格 → spatial-core → MeshResource.loadFromMeshAnchor(uuid) / createVideoPanel()
├─ 我想管理实体层级 → spatial-core → entity.addChild() / removeChild() / findEntity() / getChildren()
├─ 我想克隆实体 → spatial-core → entity.clone(CloneOptions)
├─ 我想销毁实体 → spatial-core → entity.destroy()
├─ 我想查询实体 → spatial-core → EntityQueryCondition.hasComponent() + scene.queryEntity()
├─ 我想自定义组件 → spatial-core → class MyComponent : Component() { override fun clone() }
├─ 我想自定义系统 → spatial-core → class MySystem : System() { override fun update(context) }
├─ 我想设置材质属性 → spatial-core → PhysicallyBasedMaterial.setBaseColor() / setMetallic() / setOpacity()
├─ 我想用 ShaderGraph → spatial-core → ShaderGraphMaterial.loadFromAssetBundle() + .setParameter()
├─ 我想用无光照材质 → spatial-core → UnlitMaterial.create()
├─ 我想获取包围盒 → spatial-core → entity.getBoundingBox()
├─ 我想转换坐标系 → spatial-core → entity.convertPositionFrom() / convertRotationFrom()
```

### 4.3 动画

```text
┌─ 我想播放骨骼动画 → spatial-core → entity.playAnimation(resource) / AnimationComponent.play("idle")
├─ 我想做补间动画 → spatial-core → TweenAnimation.createTweenAnimation()
├─ 我想做轨道动画 → spatial-core → 自定义 System + 每帧更新旋转角度
├─ 我想做时间线动画 → spatial-core → AnimationResource + Timeline (SDK 084)
├─ 我想做 BlendShape → spatial-core → blendshape animation (SDK 085)
├─ 我想监听动画事件 → spatial-core → content.subscribe(AnimationEvents.Started)
├─ 我想分组控制动画 → spatial-core → animation group + playback control (SDK 086)
├─ 我想设置缓动函数 → spatial-core → EaseType (LINEAR/EASE_IN/EASE_OUT/EASE_INOUT/...)
├─ 我想设置重复模式 → spatial-core → RepeatMode (RESTART/REVERSE)
```

### 4.4 音频

```text
┌─ 我想播放背景音乐 → spatial-core → AmbientAudioComponent(volume, loop)
├─ 我想播放 3D 定位音效 → spatial-core → ObjectAudioComponent + TransformComponent
├─ 我想调整声束指向 → spatial-core → Directivity(directivity, sharpness)
├─ 我想设置距离衰减 → spatial-core → DistanceAttenuationMode (INVERSE_SQUARED / NONE)
├─ 我想加载音频文件 → spatial-core → AudioResource.load(name, path, loadType)
├─ 我想控制播放 → spatial-core → AudioPlayerController.play/stop/pause/setVolume/seekTo
├─ 我想订阅音频事件 → spatial-core → content.subscribe(AudioEvents.PlaybackStarted/Completed)
```

### 4.5 视频

```text
┌─ 我想播放 2D 视频 → spatial-core → CypressMediaPlayer + VideoPlayerComponent
├─ 我想播放 360° 视频 → spatial-core → VideoMaterial(VideoDimensionMode.SIDE_BY_SIDE)
├─ 我想控制播放 → spatial-core → CypressMediaPlayer.play/pause/seekTo/setVolume
├─ 我想监听视频状态 → spatial-core → CypressMediaPlayerCallback
├─ 我想用着色器特效 → spatial-core → ShaderGraphMaterial + VideoMaterial.attachShaderGraphMaterial()
├─ 我想创建视频面板 → spatial-core → MeshResource.createVideoPanel(width, height, cornerRadius)
├─ 我想设置面剔除 → spatial-core → MaterialCullingMode (FRONT / BACK)
```

### 4.6 物理

```text
┌─ 我想模拟刚体 → spatial-core → RigidBodyComponent(mode, massProperties)
├─ 我想添加碰撞体 → spatial-core → CollisionComponent(shape, material, filter)
├─ 我想用碰撞形状 → spatial-core → ShapeResource.createSphere / createBox / createCapsule / createConvexMesh / createStaticMesh
├─ 我想设置碰撞过滤 → spatial-core → CollisionFilter(group, mask) + CollisionGroup(bitmask)
├─ 我想施加物理力 → spatial-core → PhysicsVelocityComponent(linearVelocity, angularVelocity)
├─ 我想检测碰撞 → spatial-core → content.subscribe(CollisionEvents.Enter)
├─ 我想检测触发器 → spatial-core → CollisionResponseMode.TRIGGER_LITE / FULL
├─ 我想锁定物理轴 → spatial-core → Bool3(x, y, z)
├─ 我想标记得交互 → spatial-core → InteractableComponent (标记为可手势交互)
├─ 我想做物理场景 → spatial-core → AssetBundle.load("physics_scene")
```

### 4.7 空间感知

```text
┌─ 我想扫描空间网格 → spatial-sense → MeshTrackingManager.start() + subscribeAnchorUpdate()
├─ 我想检测平面 → spatial-sense → PlaneTrackingManager
├─ 我想创建锚点 → spatial-sense → WorldAnchor + WorldTrackingManager
├─ 我想持久化锚点 → spatial-sense → WorldAnchor UUID + Room 保存
├─ 我想定位到现实物体 → spatial-sense → AnchorEntity + AnchorTarget.createCameraTarget()
├─ 我想加载网格几何体 → spatial-sense + core → MeshResource.loadFromMeshAnchor(uuid)
```

### 4.8 追踪

```text
┌─ 我想追踪手部 → spatial-tracking → HandTrackingProvider + DataProvider 模式
├─ 我想获取指尖位置 → spatial-tracking → HandTrackingProvider.latestData.joints[HAND_JOINT_INDEX_TIP]
├─ 我想追踪眼球 → spatial-tracking → EyeTrackingProvider + EyeGazeData
├─ 我想追踪头显 → spatial-tracking → HMDTrackingProvider + HMDPose
├─ 我想追踪控制器 → spatial-tracking → ControllerTrackingProvider (按钮/摇杆/触觉)
├─ 我想追踪身体 → spatial-tracking → BodyTrackingProvider
├─ 我想发送触觉反馈 → spatial-tracking → ControllerTrackingProvider.sendHaptic()
```

### 4.9 ML

```text
┌─ 我想创建 ML 实例 → spatial-ml → SpatialMLInstance.create(context)
├─ 我想创建 ML Session → spatial-ml → instance.createSession(InitInfo(...))
├─ 我想创建推理管线 → spatial-ml → session.newPipeline() + pipeline.runModelInference()
├─ 我想创建张量 → spatial-ml → pipeline.newLocalTensor() / session.newGlobalTensor()
├─ 我想执行数学运算 → spatial-ml → pipeline.arithmetic() / copy() / applyAffine()
├─ 我想读回结果 → spatial-ml → GlobalTensor.readbackContent() / readbackAsTextureResource()
├─ 我想做超分 → spatial-ml → SuperResolutionManager (详见 Demo: spatialml)
```

### 4.10 照明

```text
┌─ 我想用环境照明 → spatial-core → ImageBasedLightSource + StageEnvironmentLightingComponent
├─ 我想用动态光照 → spatial-core → DirectionalLightComponent + DynamicLighting
├─ 我想用阴影 → spatial-core → DynamicShadowing
├─ 我想用粒子 → spatial-core → ParticleComponent (SDK 077)
├─ 我想用 Portal → spatial-core → PortalComponent (SDK 076)
```

## 5. 容器模型详解

所有 PICO 应用的 UI 都构建在空间容器之上：

| 容器类型 | 形态 | 特点 | 适用场景 |
| --- | --- | --- | --- |
| **DefaultWindowContainer** | Planar (平面窗口) | 自动创建，默认配置 | 简单应用，只有一个窗口 |
| **WindowContainer(id, form=Planar)** | Planar | 可配置大小、位置、大小调整行为 | 2D 内容展示、设置面板 |
| **WindowContainer(id, form=Volumetric, defaultSize)** | Volumetric (体积) | 有深度，3D 内容容器 | 3D 物体展示、空间交互 |
| **Stage(id, immersion)** | 全空间 | 无边框沉浸式 | 全空间 MR 体验 |

```kotlin
// WindowContainer 的完整配置
WindowContainer(
    id = "myWindow",
    form = Form.Volumetric,
    defaultSize = Size(width = 800f, height = 600f, depth = 800f),
    resizeType = ContainerResizeType.ContentSize,  // 随内容大小调整
    worldScale = WorldScale.Fixed,                 // 固定世界缩放
    enableMaterialBackground = true                // 启用材质背景
) {
    PicoTheme { /* UI 内容 */ }
}

// 容器间通信（通过 bundle）
spatialNavigator.openWindowContainer(
    id = "detailPage",
    key = "artwork_001",
    bundle = bundleOf("artworkId" to artwork.id)
)

// 在目标容器中读取
val artworkId = bundle?.getString("artworkId")
```

## 6. 依赖配置实战

```kotlin
// settings.gradle.kts
dependencyResolutionManagement {
    repositories {
        google(); mavenCentral()
        maven { url = uri("https://artifact.bytedance.com/repository/Volcengine") }
    }
}

// libs.versions.toml
[versions]
spatial-bom = "0.13.3"
agp = "8.7.3"; kotlin = "2.1.0"

[libraries]
spatial-bom = { group = "com.pico.spatial", name = "spatial-bom", version.ref = "spatial-bom" }
spatial-core = { group = "com.pico.spatial", name = "spatial-core" }
spatial-foundation = { group = "com.pico.spatial", name = "spatial-foundation" }
spatial-sense = { group = "com.pico.spatial", name = "spatial-sense" }
spatial-tracking = { group = "com.pico.spatial", name = "spatial-tracking" }
spatial-ui-foundation = { group = "com.pico.spatial.ui", name = "spatial-ui-foundation" }
spatial-ui-design = { group = "com.pico.spatial.ui", name = "spatial-ui-design" }
spatial-ui-platform = { group = "com.pico.spatial.ui", name = "spatial-ui-platform" }
spatial-ml-securemr = { group = "com.pico.spatial.ml", name = "spatial-ml-securemr" }
spatial-ml-readback = { group = "com.pico.spatial.ml", name = "spatial-ml-readback" }

// app/build.gradle.kts
android {
    defaultConfig {
        ndk { abiFilters.add("arm64-v8a") }
    }
    buildFeatures { compose = true }
}
dependencies {
    implementation(platform(libs.spatial.bom))
    implementation(libs.spatial.core)
    implementation(libs.spatial.foundation)
    implementation(libs.spatial.ui.foundation)
    implementation(libs.spatial.ui.design)
    implementation(libs.spatial.ui.platform)
    // 按需添加:
    // implementation(libs.spatial.sense)     // 空间感知
    // implementation(libs.spatial.tracking)  // 追踪
    // implementation(libs.spatial.ml.*)      // ML
}
```

## 7. Demo 项目的 SDK 使用情况

| Demo | 使用的 SDK 模块 | 适合学习 |
| --- | --- | --- |
| **spatialui** | foundation, core, tracking, sense, ui-* | UI 组件库、导航、布局——UI 开发首选参考 |
| **welcomespace** | foundation, core, tracking, sense, ui-* | Stage 全空间、3D 手势交互、SpatialView 完整 API |
| **animation** | foundation, core, tracking, ui-* | 3 种动画类型、EaseType、TweenAnimation 完整参数 |
| **physics** | foundation, core, tracking, ui-* | 物理系统完整：刚体/碰撞/触发器/碰撞事件/AssetBundle |
| **spatialmesh** | foundation, core, tracking, sense, ui-* | ECS 最佳实践、Mesh 扫描、自定义 System+Component |
| **spatialvideo** | foundation, core, tracking, sense, ui-* | 视频播放器、Koin DI、combine+stateIn/Flow 响应式 |
| **spatialaudio** | foundation, core, tracking, sense, ui-* | 3D 音频、ObjectAudioComponent、音频事件 |
| **spatialml** | foundation, core, tracking, ml-*, ui-* | ML Pipeline/PipelineTensor、HttpURLConnection 网络 |

## 快速练习

1. 你想在 PICO 应用中显示一个可以拖拽旋转的 3D 模型，应该用到哪些模块和 API？
2. 你想扫描用户房间的平面并在桌面上放置虚拟物体，应该用到哪些模块和 API？
3. 查看 `PICOProject/spatialui-0.13.3/app/build.gradle.kts`，它引入了哪些 SDK 模块？

<details>
<summary>点击查看答案</summary>

1. `spatial-ui-foundation` 的 SpatialModelView 或 SpatialView + `spatial-core` 的 Entity+ModelComponent + `spatial-ui-foundation` 的 detectSpatialDragGesture
2. `spatial-sense` 的 PlaneTrackingManager 检测平面 + `spatial-core` 的 WorldAnchor/TransformComponent 放置物体 + `spatial-ui-foundation` 的 SpatialView 显示
3. 查看 `libs.versions.toml` 和 `app/build.gradle.kts` 中的 dependencies 部分

</details>

---

> [!INFO]
> **参考资料**
> - 本地 API 文档：`pico-sdk-0.13.3-mirror/spatial-api/0.13.3/index.html`
> - 本地 SDK 指南：`downloads/spatial-sdk/markdown/`（100+ 篇，按编号阅读）
> - 核心 API 参考：`downloads/spatial-sdk/markdown/034-entity-overview.md` 起
> - UI 组件库参考：`downloads/spatial-sdk/markdown/031-spatial-ui-component-library.md`

---

**上一课**: [[0007-android-lifecycle-mvvm|Android 生命周期与 MVVM 架构]] | **下一课**: [[0009-spatial-core-ecs|Spatial Core & ECS 架构]]