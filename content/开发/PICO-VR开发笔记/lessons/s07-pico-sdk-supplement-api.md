---
title: "第S07课：PICO SDK 补充API参考"
description: "PICO Spatial SDK 0.13.3 中存在于 API 文档但未被 15 课主课程覆盖的全部 API，按实用价值分组并附代码示例，可作为开发中的速查手册"
---

# PICO SDK 补充API参考

本页汇总了 PICO Spatial SDK 0.13.3 中存在于 API 文档但未被 15 课主课程覆盖的全部 API，按实用价值分组并附代码示例。可作为开发中的速查手册。

> [!NOTE]
> **如何使用**
> 开发时遇到某个需求（如"检测射线是否击中物体"），先在本页查找对应 API。每个条目标注了所属模块和参考 Demo（如有），可快速定位到具体代码。

> [!TIP]
> **已晋升到主课的 API**
> 以下 5 个 API 已从本页迁移到对应主课，建议直接在主课中学习：
> - **CollisionCast** → [[0009-spatial-core-ecs|第9课 碰撞与物理]]
> - **controllerHapticFeedback** → [[0011-spatial-tracking|第11课 手柄震动反馈]]
> - **InteractionKind** → [[0012-spatial-ui|第12课 6.1节]]
> - **WindowContainerParamsUpdater** → [[0012-spatial-ui|第12课 3.1节]]
> - **ParticleComponent** → [[0013-remaining-modules|第13课 粒子系统]]

## 目录

- [1. 高实用价值（日常开发推荐）](#1-高实用价值)
- [2. 中等实用价值（特定场景）](#2-中等实用价值)
- [3. 较低实用价值（专业场景）](#3-较低实用价值)
- [4. 速查表](#4-速查表)
- [5. API 文档位置](#5-api-文档位置)

---

## 1. 高实用价值

### 1.1 CollisionCast — 射线 / 形状检测

从空间某点发射射线（或形状）并检测击中的物体。类似 Unity 的 `Raycast`。位于 `core.ecs.simulation` 包。

```kotlin
import com.pico.spatial.core.ecs.simulation.*

// 1. 射线检测（从手柄位置向前发射）
val rayOrigin = Vector3(0f, 1.5f, -0.5f)
val rayDirection = Vector3(0f, 0f, -1f)

// 检测最近的击中物
val nearestHit = CollisionCast.raycast(
    origin = rayOrigin,
    direction = rayDirection,
    maxDistance = 10f,
    hitMode = CollisionCastHitMode.NEAREST  // 只返回最近的一个
)

// 检测所有击中物
val allHits = CollisionCast.raycast(
    origin = rayOrigin,
    direction = rayDirection,
    maxDistance = 10f,
    hitMode = CollisionCastHitMode.ALL  // 返回射线路径上的全部物体
)

// 处理结果
when (nearestHit) {
    is CollisionCastResult.Hit -> {
        val entity = nearestHit.entity       // 被击中的实体
        val point = nearestHit.position      // 击中点坐标
        val normal = nearestHit.normal       // 击中表面法线
        val distance = nearestHit.distance   // 距离
        Log.d(TAG, "击中: ${entity.getName()}, 距离: $distance")
    }
    is CollisionCastResult.NoHit -> {
        Log.d(TAG, "未击中任何物体")
    }
}

// 2. 形状检测（用球体/盒体扫描，比射线更精确）
val sphereHit = CollisionCast.shapeCast(
    shape = ShapeResource.createSphere(0.1f),
    startPosition = Vector3(0f, 1.5f, -0.5f),
    endPosition = Vector3(0f, 1.5f, -5f),
    hitMode = CollisionCastHitMode.NEAREST
)

// 3. 碰撞过滤（只检测特定组）
val filter = CollisionFilter(
    group = CollisionGroup(1u),
    mask = CollisionGroup(2u)
)
val filteredHit = CollisionCast.raycast(
    origin = rayOrigin,
    direction = rayDirection,
    maxDistance = 10f,
    filter = filter
)
```

| 类/接口 | 关键成员 |
|---|---|
| `CollisionCast` | `raycast()`, `shapeCast()` 静态方法 |
| `CollisionCastHitMode` | `NEAREST` — 最近一个；`ALL` — 全部 |
| `CollisionCastResult.Hit` | `entity`, `position`, `normal`, `distance`, `shapeIndex` |
| `CollisionCastResult.NoHit` | 未击中的哨兵结果 |

### 1.2 controllerHapticFeedback — 手柄震动

Modifier 扩展函数，在 Composable 中直接触发手柄震动反馈。位于 `ui.foundation.haptic`。

```kotlin
import com.pico.spatial.ui.foundation.haptic.controllerHapticFeedback
import androidx.compose.ui.platform.LocalView

@Composable
fun HapticButton() {
    val haptic = rememberSpatialHapticFeedback()

    Button(onClick = {
        // 触发短暂震动
        haptic.controllerHapticFeedback(
            amplitude = 0.8f,     // 0.0 ~ 1.0
            durationMs = 50       // 毫秒
        )
    }) {
        Text("震动按钮")
    }
}

// 在不同交互场景中使用
@Composable
fun GestureFeedback() {
    val haptic = rememberSpatialHapticFeedback()

    // 拾取物体时
    haptic.controllerHapticFeedback(0.5f, 30)

    // 确认操作时（强震动）
    haptic.controllerHapticFeedback(1.0f, 80)

    // 错误操作时（短促震动）
    haptic.controllerHapticFeedback(0.8f, 15)
}
```

### 1.3 SpatialSoundEffect — 系统音效

预定义的 12 种系统 UI 音效，无需加载音频文件即可播放。位于 `ui.platform`。

```kotlin
import com.pico.spatial.ui.platform.SpatialSoundEffect
import com.pico.spatial.ui.platform.playSystemSound

// 在 Composable 中播放系统音效
@Composable
fun SoundButton() {
    Button(onClick = {
        playSystemSound(SpatialSoundEffect.CONFIRM)
    }) {
        Text("确认")
    }
}

// 全部 12 种音效
SpatialSoundEffect.CONFIRM       // 确认（正向反馈）
SpatialSoundEffect.CANCEL        // 取消
SpatialSoundEffect.TOGGLE_ON     // 开关 — 开
SpatialSoundEffect.TOGGLE_OFF    // 开关 — 关
SpatialSoundEffect.SLIDE         // 滑动
SpatialSoundEffect.ERROR         // 错误提示
SpatialSoundEffect.NOTIFICATION  // 通知
SpatialSoundEffect.PAGE_CHANGE   // 页面切换
SpatialSoundEffect.PICK          // 拾取/选择
SpatialSoundEffect.DROP          // 放下/取消选择
SpatialSoundEffect.HOVER         // 悬停
SpatialSoundEffect.CLICK         // 点击

// 典型用法对照
// CONFIRM → 按钮点击、操作成功
// CANCEL  → 关闭弹窗、取消操作
// ERROR   → 表单验证失败、操作不允许
// SLIDE   → Slider 拖动
// PICK    → 拾取 3D 物体
// DROP    → 放下 3D 物体
// TOGGLE_ON/OFF → Checkbox / Switch
```

### 1.4 InteractionKind — 交互方式枚举

区分用户通过什么方式与 UI / 3D 物体交互。位于 `ui.foundation.gesture.data`。

```kotlin
import com.pico.spatial.ui.foundation.gesture.data.InteractionKind

// 5 种交互方式
InteractionKind.DirectPinch      // 直接用手捏合（手部追踪时）
InteractionKind.Poke             // 用手指戳（点击）
InteractionKind.GazePinch        // 凝视 + 捏合（视线选中+手势确认）
InteractionKind.RayBasedPinch    // 射线瞄准 + 捏合（手柄默认）
InteractionKind.Pointer          // 指针设备（测试/开发工具）

// 在手势检测回调中获取交互方式
Modifier.pointerInput(Unit) {
    detectSpatialTapGesture { hitEntity, hitPosition, interactionKind ->
        when (interactionKind) {
            InteractionKind.RayBasedPinch -> {
                // 手柄射线点击 — 显示标准 UI 反馈
            }
            InteractionKind.DirectPinch -> {
                // 直接手部触摸 — 可以显示更丰富的触觉反馈
                haptic.controllerHapticFeedback(0.6f, 40)
            }
            InteractionKind.GazePinch -> {
                // 凝视选中 — 高亮被注视物体
                highlightEntity(hitEntity)
            }
            else -> { /* 其他方式 */ }
        }
    }
}

// 根据交互方式调整 UI 大小（手部直接交互时按钮可以更小）
val buttonSize = if (interactionKind == InteractionKind.DirectPinch) 48.dp else 64.dp
```

### 1.5 PhysicsWorldComponent — 物理世界配置

配置全局物理参数。位于 `core.ecs`。

```kotlin
import com.pico.spatial.core.ecs.PhysicsWorldComponent
import com.pico.spatial.core.math.Vector3

// 自定义物理世界（在初始化时设置）
val physicsWorld = Entity()
physicsWorld.components.set(PhysicsWorldComponent(
    gravity = Vector3(0f, -1.6f, 0f),       // 月球重力（约为地球 1/6）
    solverIterations = 8,                     // 求解器迭代次数（默认 6，越大越精确但越耗性能）
    simulationClock = PhysicsWorldComponent.SimulationClock(
        timeScale = 1.0f,                     // 时间缩放（0.5 = 慢动作，2.0 = 加速）
        maxSubSteps = 4                       // 最大子步数
    )
))

// 通过 content 获取当前物理世界
val currentPhysicsWorld = content.findEntity("physics_world")
val physComp = currentPhysicsWorld?.components?.get<PhysicsWorldComponent>()

// 动态修改重力（切换场景时）
physicsWorld.components.set(PhysicsWorldComponent(
    gravity = Vector3(0f, -9.81f, 0f)       // 恢复地球重力
))

// 物理世界与碰撞过滤配合
CollisionFilter(
    group = CollisionGroup(1u),
    mask = CollisionGroup(2u) or CollisionGroup(4u)
)
```

### 1.6 WindowContainerParamsUpdater — 运行时改窗口参数

在运行时动态修改已打开的 WindowContainer 的外观和行为。位于 `ui.platform.containers`。

```kotlin
import com.pico.spatial.ui.platform.containers.WindowContainerParamsUpdater
import com.pico.spatial.ui.foundation.dsl.LocalSpatialNavigator

@Composable
fun WindowSettings() {
    val navigator = LocalSpatialNavigator.current

    // 获取窗口参数更新器
    val updater = WindowContainerParamsUpdater(navigator, "mainWindow")

    // 修改标题栏类型
    Button(onClick = {
        updater.setCaptionBarType(
            WindowContainerParamsUpdater.CaptionBarType.SMALL
            // SMALL / LARGE / NONE
        )
    }) { Text("小标题栏") }

    Button(onClick = {
        updater.setResizeRestriction(
            WindowContainerParamsUpdater.ResizeRestriction.NO_RESTRICTION
            // NO_RESTRICTION / FIXED_SIZE / MIN_MAX
        )
    }) { Text("允许缩放") }

    Button(onClick = {
        updater.setVolumeBasePanelType(
            WindowContainerParamsUpdater.VolumeBasePanelType.ALWAYS_ON
            // ALWAYS_ON / ON_INTERACTION / OFF
        )
    }) { Text("显示底座面板") }
}
```

### 1.8 AssetBundle — Editor 资源包加载

PICO 的 Editor 工具导出的场景以 `.bundle` 格式打包（类似 Unity 的 AssetBundle），通过 `AssetBundle.load()` 加载。位于 `core.ecs.resource`。

```kotlin
import com.pico.spatial.core.ecs.resource.AssetBundle
import kotlinx.coroutines.*
import com.pico.spatial.core.ecs.Entity

// 1. 基本加载（欢迎页面示例）
private const val BUNDLE_URI = "asset://editor-asset.bundle"

val bundle: Deferred<AssetBundle> =
    CoroutineScope(Dispatchers.IO).async(start = CoroutineStart.LAZY) {
        AssetBundle.load(BUNDLE_URI)
    }

// 2. 从 Bundle 加载模型
suspend fun loadModel(modelName: String): Entity? =
    withContext(Dispatchers.IO) {
        assetBundle.await().loadModel(modelName)
    }

// 3. 在 SpatialView.initial 中使用
SpatialView(
    initial = { content, attachments ->
        val item = withContext(Dispatchers.IO) { assetBundle.await().loadModel("PicoVase") }
        item?.apply {
            components[TransformComponent::class.java]?.apply {
                setPosition(Vector3(0f, 0f, 0f))
            }
            content.addEntity(this)
        }
    }
)
```

> [!NOTE]
> **AssetBundle 设计要点**
> - **编辑器导出** — 用 PICO Editor 工具导出 3D 场景为 `.bundle` 文件，放在 `editor-asset/src/main/res3d/` 目录
> - **URI 协议** — `asset://` 前缀指向 APK 内的编辑器资产模块
> - **协程加载** — 使用 `async(Dispatchers.IO)` 做异步 I/O，`CoroutineStart.LAZY` 延迟到首次 `await()` 才实际加载
> - **与 Entity.load() 的对比** — `Entity.load("models/robot.glb")` 加载单个 GLB 文件，`AssetBundle.load()` 加载整个编辑器导出的场景包，后者可以包含多个模型、材质和动画

---

## 2. 中等实用价值

### 2.1 MotionTrackingProvider — 手柄扩展追踪

监听手柄的电池电量、连接状态和按键事件。位于 `tracking.motion`。

```kotlin
import com.pico.spatial.tracking.motion.MotionTrackingProvider
import com.pico.spatial.tracking.TrackingNode

// 监听手柄电池电量
MotionTrackingProvider.listenBatteryLevel(
    node = TrackingNode.RIGHT_HAND
) { level: Int ->
    // level: 0-100
    if (level < 20) {
        showLowBatteryWarning()
    }
}

// 监听连接状态
MotionTrackingProvider.listenConnectionState(
    node = TrackingNode.LEFT_HAND
) { connected: Boolean ->
    if (!connected) {
        showControllerDisconnectedMessage()
    }
}

// 监听按键事件
MotionTrackingProvider.listenKeyEvent(
    node = TrackingNode.RIGHT_HAND
) { event: MotionTrackingProvider.KeyEvent ->
    when (event.key) {
        MotionTrackingProvider.Key.TRIGGER -> onTrigger()
        MotionTrackingProvider.Key.GRIP -> onGrip()
        MotionTrackingProvider.Key.MENU -> onMenu()
        MotionTrackingProvider.Key.JOYSTICK -> onJoystick(event.value)
    }
}

// 释放监听（不再需要时）
MotionTrackingProvider.unregisterAll()
```

### 2.2 AudioMixerGroupsComponent — 音频分组管理

将音频源分组管理，独立控制每组音量。位于 `core.ecs`。

```kotlin
import com.pico.spatial.core.ecs.AudioMixerGroupsComponent

// 1. 创建音频混合器实体
val mixerEntity = Entity()
mixerEntity.components.set(AudioMixerGroupsComponent())

// 2. 创建分组
mixerEntity.components.get<AudioMixerGroupsComponent>()?.apply {
    // 添加分组（返回 groupId）
    val bgmGroupId = addMixerGroup("BGM")
    val sfxGroupId = addMixerGroup("SFX")
    val voiceGroupId = addMixerGroup("VOICE")

    // 设置分组音量（0.0 ~ 1.0）
    setMixerGroupVolume(bgmGroupId, 0.5f)   // 背景音乐 50%
    setMixerGroupVolume(sfxGroupId, 0.8f)   // 音效 80%
    setMixerGroupVolume(voiceGroupId, 1.0f) // 语音 100%

    // 将音频实体分配到分组
    addToMixerGroup(bgmGroupId, bgmEntity)
    addToMixerGroup(sfxGroupId, sfxEntity)

    // 查询所有分组
    val allGroups = getAllMixerGroups()
    allGroups.forEach { group ->
        Log.d(TAG, "分组: ${group.name}, 音量: ${group.volume}")
    }

    // 移除分组
    removeMixerGroup(bgmGroupId)
}
```

### 2.3 LookAtComponent — 始终面向目标

让一个实体始终朝向另一个实体或某个位置。位于 `core.ecs`。

```kotlin
import com.pico.spatial.core.ecs.LookAtComponent

// 让标签始终面向用户（HMD）
val labelEntity = Entity()
labelEntity.components.set(TransformComponent(
    position = Vector3(1f, 2f, -1f)
))
labelEntity.components.set(LookAtComponent(
    target = LookAtComponent.Target.HMD,         // 面向头显
    // 或 target = LookAtComponent.Target.Position(Vector3(0f, 0f, 0f))
    // 或 target = LookAtComponent.Target.Entity(otherEntity)
    axis = LookAtComponent.Axis.POSITIVE_Z,       // 哪个轴指向目标
    upAxis = LookAtComponent.Axis.POSITIVE_Y,     // 上方向轴
    lerpSpeed = 5.0f                              // 旋转平滑速度（0 = 瞬间）
))

// 典型用途：信息标签、HP 条、名字始终面向玩家
// 相当于 Unity 的 Billboard 效果
```

### 2.4 ParticleComponent — 粒子系统

创建粒子特效。位于 `core.ecs`。课程第 13 课仅提及名称，未展开。

```kotlin
import com.pico.spatial.core.ecs.ParticleComponent
import com.pico.spatial.core.ecs.ParticleEmitterConfig

// 创建粒子实体
val particleEntity = Entity()
particleEntity.components.set(TransformComponent(
    position = Vector3(0f, 0.5f, -1f)
))

// 配置粒子发射器
particleEntity.components.set(ParticleComponent(
    emitterConfig = ParticleEmitterConfig(
        maxParticles = 100,           // 最大粒子数
        emissionRate = 20f,           // 每秒发射数
        startColor = Color4(1f, 0.5f, 0f, 1f),  // 初始颜色
        endColor = Color4(1f, 0f, 0f, 0f),       // 结束颜色（包含 alpha 淡出）
        startSize = 0.05f,            // 初始大小
        endSize = 0.01f,              // 结束大小
        lifetime = 2.0f,              // 粒子存活时间（秒）
        speed = 0.5f,                 // 粒子速度
        speedRandom = 0.3f,           // 速度随机范围
        gravity = Vector3(0f, -0.2f, 0f),  // 粒子重力
        loop = true                   // 循环发射
    )
))

// 常用粒子效果
// 火花: 短 lifetime + 小 size + 橙色
// 烟雾: 大 size + 长 lifetime + 灰色 + 缓慢上升
// 魔法: 蓝紫色 + 随机方向 + 发光效果
// 爆炸: 一次爆发大量粒子 + 各方向扩散
```

### 2.5 SubMenu — 菜单层级

在 Menu 内嵌套子菜单。位于 `ui.design.menu`。

```kotlin
import com.pico.spatial.ui.design.Menu
import com.pico.spatial.ui.design.MenuItem
import com.pico.spatial.ui.design.SubMenu

@Composable
fun FileMenu() {
    Menu {
        MenuItem(onClick = { /* 新建 */ }) { Text("新建文件") }
        MenuItem(onClick = { /* 打开 */ }) { Text("打开文件") }

        // 子菜单
        SubMenu(title = { Text("导出为") }) {
            MenuItem(onClick = { export("glb") }) { Text("GLB 格式") }
            MenuItem(onClick = { export("usdz") }) { Text("USDZ 格式") }
            MenuItem(onClick = { export("obj") }) { Text("OBJ 格式") }
        }

        MenuItem(onClick = { /* 另存为 */ }) { Text("另存为...") }

        SubMenu(title = { Text("最近的文件") }) {
            MenuItem(onClick = { openRecent("file1") }) { Text("项目A") }
            MenuItem(onClick = { openRecent("file2") }) { Text("项目B") }
        }
    }
}
```

### 2.6 Box3DScope — 3D 布局容器

在 3D 空间中排列子元素的布局容器。位于 `ui.foundation.layout`。

```kotlin
import com.pico.spatial.ui.foundation.layout.Box3DScope
import com.pico.spatial.ui.foundation.layout.DepthAlignment

@Composable
fun GalleryGrid3D() {
    // 3D 盒子布局：子元素在 X/Y/Z 三个轴向上排列
    Box3DScope(
        modifier = Modifier
            .size(400.dp, 300.dp)
            .requiredDepth(200.dp),
        depthAlignment = DepthAlignment.DepthCenter  // Z 轴居中
    ) {
        // 子元素按 Z 轴从前到后排列
        Text("最前层", modifier = Modifier.depthAlign(DepthAlignment.DepthFront))
        Text("中间层", modifier = Modifier.depthAlign(DepthAlignment.DepthCenter))
        Text("最后层", modifier = Modifier.depthAlign(DepthAlignment.DepthBack))

        // 3D 偏移
        Text("偏移元素", modifier = Modifier.offset(50.dp, 0.dp, 30.dp))
        //                                                        ↑ Z 轴偏移
    }
}

// DepthAlignment 三种模式
DepthAlignment.DepthFront    // Z 轴前端（离用户最近）
DepthAlignment.DepthCenter   // Z 轴居中
DepthAlignment.DepthBack     // Z 轴后端（离用户最远）
```

### 2.7 Augment — 窗口附着定位

将 UI 窗口附着到实体上，随实体移动/旋转。位于 `ui.foundation.window`。

```kotlin
import com.pico.spatial.ui.foundation.window.Augment
import com.pico.spatial.ui.foundation.layout.ViewPoint

@Composable
fun EntityLabel(entity: Entity) {
    // 将标签窗口附着到 3D 实体上
    Augment(
        anchor = entity,                    // 附着目标
        alignment = Augment.Alignment.TOP_CENTER,  // 对齐位置
        offset = Vector3(0f, 0.2f, 0f),     // 额外偏移
        followViewpoints = ViewPoint.FrontOnly,    // 仅正面可见
        windowSizeBehaviors = Augment.WindowSizeBehaviors.FIXED_SIZE
    ) {
        PicoTheme {
            Surface(
                modifier = Modifier
                    .backgroundMaterial(Material.Thick)
                    .padding(12.dp)
            ) {
                Text("花瓶", style = PicoTheme.typography.bodyMedium)
            }
        }
    }
}

// Augment.Alignment 对齐方式
Augment.Alignment.TOP_CENTER        // 锚点顶部居中
Augment.Alignment.BOTTOM_CENTER     // 锚点底部居中
Augment.Alignment.CENTER            // 锚点中心
Augment.Alignment.TOP_LEFT          // 锚点左上
Augment.Alignment.TOP_RIGHT         // 锚点右上
Augment.Alignment.BOTTOM_LEFT       // 锚点左下
Augment.Alignment.BOTTOM_RIGHT      // 锚点右下

// 与 AttachmentPanel 的区别
// AttachmentPanel: 在 SpatialView 内部将 Compose UI 附着到 3D 实体
// Augment: 在整个窗口系统级别将独立窗口附着到实体（更强大，但更重量级）
```

### 2.8 StageParamsUpdater — 运行时改 Stage 参数

在运行时修改 Stage 的沉浸度和上半身渲染模式。位于 `ui.platform.ability`。

```kotlin
import com.pico.spatial.ui.platform.ability.StageParamsUpdater

@Composable
fun ImmersionControl() {
    val stageUpdater = StageParamsUpdater.current

    Slider(
        value = immersionLevel,
        onValueChange = { level ->
            // 动态调整沉浸度（0-100）
            stageUpdater.updateImmersion(level.toInt())
        },
        valueRange = 0f..100f
    )

    Button(onClick = {
        // 切换上半身渲染模式
        stageUpdater.updateUpperLimbRenderMode(
            UpperLimbRenderMode.SHOW  // SHOW / HIDE / TRANSPARENT
        )
    }) { Text("显示双手") }
}
```

### 2.9 TimelinePlayerEvents — 时间线动画事件

时间线动画（TimelineAnimation）的播放事件监听。位于 `core.ecs.event`。

```kotlin
import com.pico.spatial.core.ecs.event.TimelinePlayerEvents

// 在 SpatialViewContent 内订阅时间线事件
content.subscribe(TimelinePlayerEvents.Started::class.java) { event ->
    Log.d(TAG, "时间线开始: ${event.timelineName}")
}

content.subscribe(TimelinePlayerEvents.Paused::class.java) { event ->
    Log.d(TAG, "时间线暂停")
}

content.subscribe(TimelinePlayerEvents.Resumed::class.java) { event ->
    Log.d(TAG, "时间线恢复")
}

content.subscribe(TimelinePlayerEvents.Completed::class.java) { event ->
    Log.d(TAG, "时间线播放完成")
    onTimelineComplete()
}

content.subscribe(TimelinePlayerEvents.Terminated::class.java) { event ->
    Log.d(TAG, "时间线被终止")
}

// 与普通 AnimationEvents 的关系
// AnimationEvents.Started → 单个动画开始
// TimelinePlayerEvents.Started → 整个时间线序列开始
// 时间线包含多个按顺序/并行播放的动画
```

---

## 3. 较低实用价值

### 3.1 PortalComponent — 传送门

在一个位置透视到另一个位置的传送门效果。位于 `core.ecs`。

```kotlin
import com.pico.spatial.core.ecs.PortalComponent

// 创建传送门（从门 A 看到门 B 位置的场景）
val portalA = Entity()
portalA.components.set(TransformComponent(
    position = Vector3(0f, 1.5f, -2f)
))
portalA.components.set(PortalComponent(
    targetEntity = roomBEntity,   // 目标场景实体
    // 通过传送门看到的是 roomBEntity 所包含的场景
))

// 注意：需要配合特定的 Shader / 渲染管线才能工作
// 适用于: 神秘通道、镜子效果、空间折叠视觉效果
```

### 3.2 TextSelectionAndToolbarProvider — 文本选择工具栏

为 TextField / TextArea 提供文本选择后的操作工具栏（复制/粘贴/剪切）。位于 `ui.design.text`。

```kotlin
import com.pico.spatial.ui.design.text.TextSelectionAndToolbarProvider

@Composable
fun EditableText() {
    TextSelectionAndToolbarProvider {
        TextArea(
            value = text,
            onValueChange = { text = it },
            placeholder = { Text("输入描述...") }
        )
    }
}

// 选中文本后自动显示工具栏
// 工具栏包含: 复制 / 粘贴 / 剪切 / 全选（根据上下文自动适配）
```

### 3.3 enableSpatialHittestProvider — 空间命中测试

启用命中测试提供者，用于精细的碰撞点检测。位于 `ui.foundation`。

```kotlin
import com.pico.spatial.ui.foundation.enableSpatialHittestProvider

// 在初始化 spatial view 时启用
val content: SpatialViewContent = // ...
content.enableSpatialHittestProvider(true)

// 启用后可以进行更精确的点-平面命中检测
// 主要用于平面检测中的精确点击定位
```

---

## 4. 速查表

| 需求 | API | 模块 | 实用度 | 参考 Demo |
|---|---|---|---|---|
| 射线检测"视线是否击中物体" | CollisionCast.raycast() | core.ecs.simulation | 高 | physics |
| 手柄震动反馈 | controllerHapticFeedback | ui.foundation.haptic | 高 | welcomespace |
| UI 交互音效 | SpatialSoundEffect | ui.platform | 高 | — |
| 区分用户交互方式 | InteractionKind | ui.foundation.gesture.data | 高 | welcomespace |
| 自定义物理世界参数 | PhysicsWorldComponent | core.ecs | 高 | physics |
| 运行时改窗口参数 | WindowContainerParamsUpdater | ui.platform.containers | 高 | spatialui |
| 手柄按键/电量监听 | MotionTrackingProvider | tracking.motion | 中 | — |
| 音频分组独立调音 | AudioMixerGroupsComponent | core.ecs | 中 | spatialaudio |
| 标签始终面向玩家 | LookAtComponent | core.ecs | 中 | welcomespace |
| 粒子特效 | ParticleComponent | core.ecs | 中 | welcomespace |
| 菜单嵌套层级 | SubMenu | ui.design.menu | 中 | spatialui |
| 3D 盒子布局 | Box3DScope | ui.foundation.layout | 中 | spatialui |
| Z 轴对齐方式 | DepthAlignment | ui.foundation.layout | 中 | spatialui |
| 窗口附着到 3D 实体 | Augment | ui.foundation.window | 中 | — |
| 运行时改 Stage 参数 | StageParamsUpdater | ui.platform.ability | 中 | — |
| 时间线事件监听 | TimelinePlayerEvents | core.ecs.event | 中 | animation |
| 传送门视觉效果 | PortalComponent | core.ecs | 低 | — |
| 文本选择工具栏 | TextSelectionAndToolbarProvider | ui.design.text | 低 | spatialui |
| 命中测试提供者 | enableSpatialHittestProvider | ui.foundation | 低 | — |

---

## 5. API 文档位置

以下是在 SDK API 文档中查找本页各 API 的路径：

```
pico-sdk-0.13.3-mirror/spatial-api/0.13.3/
├── core/
│   └── com/pico/spatial/core/ecs/
│       ├── PhysicsWorldComponent.html
│       ├── LookAtComponent.html
│       ├── ParticleComponent.html
│       ├── PortalComponent.html
│       ├── AudioMixerGroupsComponent.html
│       └── simulation/
│           ├── CollisionCast.html
│           ├── CollisionCastHitMode.html
│           └── CollisionCastResult.html
├── tracking/
│   └── com/pico/spatial/tracking/motion/
│       └── MotionTrackingProvider.html
├── ui/
│   └── com/pico/spatial/ui/
│       ├── foundation/
│       │   ├── haptic/XXX.html          # controllerHapticFeedback
│       │   ├── gesture/data/InteractionKind.html
│       │   ├── layout/Box3DScope.html
│       │   ├── layout/DepthAlignment.html
│       │   └── window/Augment.html
│       ├── design/
│       │   ├── menu/SubMenu.html
│       │   └── text/TextSelectionAndToolbarProvider.html
│       └── platform/
│           ├── SpatialSoundEffect.html
│           ├── containers/WindowContainerParamsUpdater.html
│           └── ability/StageParamsUpdater.html
```

> [!TIP]
> **说明**
> 本页代码示例基于 SDK 0.13.3 的 API 签名推断编写，部分方法名/参数可能与实际略有出入。实际开发时请以 `pico-sdk-0.13.3-mirror/spatial-api/0.13.3/` 下的 HTML API 文档为准。

> [!INFO]
> **关联课程**
> - [[0013-remaining-modules|第13课：动画/音频/视频/物理/光照/材质]] — 物理 + 粒子基础
> - [[0012-spatial-ui|第12课：Spatial UI]] — 手势 + UI 组件基础
> - [[0009-spatial-core-ecs|第9课：Spatial Core & ECS]] — Entity/Component 基础
> - [[0008-pico-sdk-architecture|第8课：SDK 架构]] — 模块决策树

---
**上一课**: [[s06-networking-retrofit|S06：网络请求 - Retrofit]] | **下一课**: [[s08-ecs-in-practice|S08：ECS 实战]]