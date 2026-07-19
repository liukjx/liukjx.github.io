---
title: "第13课：其他模块 — 动画/音频/视频/物理/光照/材质"
description: "本节课覆盖 spatial-core 中的功能子系统和 spatial-ml。每个模块相对独立，需要时按需查阅即可。"
---

本节课覆盖 spatial-core 中的功能子系统和 spatial-ml。每个模块相对独立，需要时按需查阅即可。

> [!NOTE]
> **使用建议**
> 本课内容较多，不需要一次性全部记住。把它当作参考手册——需要做动画、音频、视频、物理等功能时回来查阅对应章节。

## 1. 动画系统

PICO SDK 支持 6 种动画类型，由 `animation-0.13.3` Demo 完整演示：

| 类型 | 用途 | 关键类/API |
| --- | --- | --- |
| **Skeletal** | 驱动 3D 角色骨骼运动 | `AnimationComponent.play("idle")` |
| **Tween** | 属性补间：位置/旋转/缩放/颜色 | `TweenAnimation.createTweenAnimation()` |
| **Orbit** | 物体绕中心运行 | 自定义 System + 每帧旋转 |
| **Timeline** | 时间线编排多个动画 | `TimelineAnimation` (SDK 084) |
| **BlendShape** | 面部表情/变形动画 | `BlendShapeAnimation` (SDK 085) |
| **Animation Group** | 动画分组与播放控制 | `AnimationGroup` + `PlaybackControl` (SDK 086) |

### 1.1 骨骼动画 (Skeletal)

```kotlin
// 加载带骨骼和动画的 GLB 模型
val character = withContext(Dispatchers.IO) {
    Entity.load("models/character.glb")
}

// 获取动画资源列表
val animations = character.getAnimationResources()
animations.forEach { anim ->
    Log.d(TAG, "动画: ${anim.getName()}")
}

// 通过 AnimationComponent 播放
val animComponent = character.components.get<AnimationComponent>()
animComponent?.apply {
    play("idle")                    // 按名称播放
    play("walk", loop = true)       // 循环
    play("jump") { /* 完成回调 */ }

    speed = 2.0f                    // 播放速度
    pause()
    resume()
    stop()
}

// 通过 Entity 直接播放（不获取 AnimationComponent）
character.playAnimation(animationResource)

// 骨骼网格查询
val skinnedEntity = character.findSkinnedMeshEntity()
```

### 1.2 补间动画 (Tween)

```kotlin
// 完整的补间动画创建
val tweenAnim = TweenAnimation.createTweenAnimation(
    bindTarget = AnimationBindTarget.bindPosition(),  // 绑定属性
    from = Vector3(0f, 0f, -2f),    // 起始值
    to = Vector3(1f, 0f, -2f),      // 结束值
    duration = 2.0f,                 // 时长（秒）
    speed = 1.0f,                    // 播放速度
    repeatCount = -1,                // 循环次数（-1 = 无限）
    repeatMode = RepeatMode.REVERSE, // RESTART / REVERSE
    easeType = EaseType.EASE_INOUT   // 缓动函数
)

// 生成 AnimationResource 并播放
val entity = Entity.load("models/box.glb")
val animResource = AnimationResource.generateWithTweenAnimation(tweenAnim)
entity.playAnimation(animResource)

// AnimationBindTarget 支持的绑定类型
AnimationBindTarget.bindPosition()
AnimationBindTarget.bindRotation()
AnimationBindTarget.bindScale()
AnimationBindTarget.bindTransform()            // 位置+旋转+缩放
AnimationBindTarget.bindMaterial(index, target) // 材质属性

// MaterialTarget 枚举
MaterialTarget.BASE_COLOR   // 基础颜色
MaterialTarget.OPACITY      // 不透明度
MaterialTarget.METALLIC     // 金属度
MaterialTarget.ROUGHNESS    // 粗糙度
MaterialTarget.EMISSIVE     // 自发光

// 示例：材质闪烁效果
val flashAnim = TweenAnimation.createTweenAnimation(
    bindTarget = AnimationBindTarget.bindMaterial(0, MaterialTarget.EMISSIVE),
    from = Color4(0f, 0f, 0f, 1f),
    to = Color4(1f, 1f, 0f, 1f),
    duration = 0.5f,
    repeatMode = RepeatMode.REVERSE,
    repeatCount = 3,
    easeType = EaseType.EASE_IN
)

// EaseType 完整枚举
EaseType.LINEAR        // 匀速
EaseType.EASE_IN       // 加速
EaseType.EASE_OUT      // 减速
EaseType.EASE_INOUT    // 先加速后减速
EaseType.EASE_IN_CUBIC // 立方加速
EaseType.EASE_OUT_CUBIC
EaseType.EASE_INOUT_CUBIC
EaseType.UNKNOWN       // 默认
```

### 1.3 Blend Shape 混合变形动画

```kotlin
// Blend Shape 用于面部表情、口型同步、肌肉变形等
// 由 3D 模型预定义的多个"变形目标"组成

// 获取实体上的 BlendShapeComponent
val blendShape = entity.components.get<BlendShapeComponent>()

// 获取所有变形目标名称
val shapeNames = blendShape?.getShapeNames()
// 返回: ["blink", "smile", "eyeOpen", "browRaise", ...]

// 通过名称设置变形权重（0.0 ~ 1.0）
blendShape?.setWeight("blink", 1.0f)      // 完全闭眼
blendShape?.setWeight("smile", 0.5f)       // 半微笑

// 使用 BlendShapeAnimation 驱动变形动画
import com.pico.spatial.core.ecs.animation.BlendShapeAnimation

val blinkAnim = BlendShapeAnimation(
    shapeName = "blink",
    from = 0.0f,
    to = 1.0f,
    duration = 0.15f,
    repeatMode = RepeatMode.REVERSE
)
entity.playAnimation(
    AnimationResource.generateWithBlendShapeAnimation(blinkAnim)
)

// 查询实体可控制的 Blend Shape
// 在 PICO Spatial Editor 的 blend shape 面板中管理
val controllableShape = entity.getControllableShapes()
// 返回模型定义的变形目标列表

// 应用场景
// - 面部表情：微笑、皱眉、眨眼
// - 口型同步：根据音频驱动口型
// - 肌肉变形：手臂弯曲时二头肌鼓起
// - 捏脸系统：多个 blend shape 组合创造不同角色
```

### 1.4 动画事件监听

```kotlin
// 订阅动画事件
content.subscribe(
    eventType = AnimationEvents.Started::class.java
) { event: AnimationEvents.Started ->
    Log.d(TAG, "动画开始: ${event.animationName}")
}

content.subscribe(
    eventType = AnimationEvents.Terminated::class.java
) { event: AnimationEvents.Terminated ->
    Log.d(TAG, "动画结束: ${event.animationName}")
}

// 事件订阅返回 Cancellable
val cancellable: Cancellable = content.subscribe(...)
cancellable.cancel()  // 取消订阅
```

## 2. 空间音频

`spatialaudio-0.13.3` Demo 展示了完整音频功能：

### 2.1 音频资源加载

```kotlin
val audioRes = withContext(Dispatchers.IO) {
    AudioResource.load(
        name = "bird_song",
        path = "audio/bird.mp3",
        loadType = LoadType.FROM_ASSETS  // FROM_ASSETS / FROM_FILE / FROM_NETWORK
    )
}
// 使用 AudioResource.use { } 管理生命周期
```

### 2.2 音频组件

```kotlin
// 环境音频（背景音乐，无空间定位）
ambientEntity.components.set(AmbientAudioComponent(
    resource = audioRes,
    volume = 0.5f,
    loop = true
))

// 3D 定位音频（空间音频，随位置变化）
val audioEntity = Entity()
audioEntity.components.set(TransformComponent(position = Vector3(2f, 1f, -3f)))
audioEntity.components.set(ObjectAudioComponent(
    volume = 1.0f,
    // 声束指向性
    directivity = Directivity(
        directivity = 0.8f,   // 0=全向, 1=单向
        sharpness = 2.0f      // 指向锐度
    ),
    // 距离衰减
    distanceAttenuationMode = DistanceAttenuationMode.INVERSE_SQUARED,
    reverbVolume = 0.2f       // 混响音量
))

// 或者用更简单的方式
audioEntity.prepareAudio(audioRes)   // 返回 AudioPlayerController
```

### 2.3 AudioPlayerController — 播放控制

```kotlin
val controller = audioEntity.prepareAudio(audioRes)

controller.play()          // 播放
controller.pause()         // 暂停
controller.stop()          // 停止
controller.setVolume(0.5f) // 音量
controller.setLoop(true)   // 循环
controller.seekTo(10000)   // 跳到第 10 秒
controller.close()         // 释放资源

// 音频事件
content.subscribe(AudioEvents.PlaybackStarted::class.java) { event -> }
content.subscribe(AudioEvents.PlaybackPaused::class.java) { event -> }
content.subscribe(AudioEvents.PlaybackCompleted::class.java) { event -> }
```

## 3. 空间视频

`spatialvideo-0.13.3` 演示了完整的视频播放管线：

### 3.1 CypressMediaPlayer — 媒体播放器

```kotlin
// 创建播放器
val player = CypressMediaPlayer()

// 设置数据源
player.setDataSource("https://example.com/video.mp4")  // URL
// 或 player.setDataSource(context, uri)

// 异步准备
player.prepareAsync()

// 注册回调
player.registerCypressMediaPlayerCallback(object : CypressMediaPlayerCallback {
    override fun onPrepared() {
        // 准备完成，可以播放
        player.play()
    }
    override fun onStarted() { }
    override fun onPaused() { }
    override fun onStopped() { }
    override fun onCompleted() { /* 播放完成 */ }
    override fun onSeekToCompleted() { }
    override fun onVideoSizeChanged(width: Int, height: Int) { }
    override fun onError(errorCode: CypressMediaPlayerErrorCode) {
        Log.e(TAG, "播放错误: $errorCode")
    }
})

// 播放控制
player.play()
player.pause()
player.resume()
player.seekTo(positionMs)
player.setVolume(0.8f)

// 查询
val duration = player.getDuration()
val position = player.getCurrentPosition()
val vol = player.getVolume()

// 释放
player.close()
```

### 3.2 VideoPlayerComponent — ECS 集成

```kotlin
// 创建视频面板（网格）
val panelMesh = MeshResource.createVideoPanel(
    width = 2.0f,
    height = 1.2f,
    cornerRadius = 0.05f
)

// 视频材质
val videoMat = VideoMaterial(
    blendingMode = BlendingMode.OPAQUE,
    dimensionMode = VideoDimensionMode.SIDE_BY_SIDE,  // 立体 360° 视频
    cullingMode = MaterialCullingMode.FRONT,           // 球体内侧看用 FRONT
    clearColor = Color4(0f, 0f, 0f, 1f)
)

// 应用到实体
val videoEntity = Entity()
videoEntity.components.set(TransformComponent(position = Vector3(0f, 1.5f, -3f)))
videoEntity.components.set(ModelComponent(
    model = ModelEntity(resource = modelRes, mesh = panelMesh),
    materials = listOf(videoMat)
))
videoEntity.components.set(VideoPlayerComponent(
    player = player,
    mesh = panelMesh,
    material = videoMat
))

// 自定义着色器与视频结合
shaderMaterial.let { mat ->
    videoMat.attachShaderGraphMaterial(mat)
    mat.setParameter("_Intensity", 0.8f)
}

// 面剔除选择
MaterialCullingMode.FRONT   // 球体内侧（360° 视频）
MaterialCullingMode.BACK    // 面板正面（普通视频）
MaterialCullingMode.NONE    // 双面
```

## 4. 物理系统

`physics-0.13.3` + `welcomespace-0.13.3` + `spatialmesh-0.13.3` 演示了物理系统：

### 4.1 碰撞形状

```kotlin
// 全部 5 种碰撞形状
ShapeResource.createSphere(radius = 0.15f)
ShapeResource.createBox(halfExtents = Vector3(0.1f, 0.3f, 0.05f))
ShapeResource.createCapsule(radius = 0.1f, height = 0.5f)
ShapeResource.createConvexMesh(meshResource)  // 凸包网格（精确碰撞）
ShapeResource.createStaticMesh(meshResource)  // 静态网格（环境碰撞）

// 形状变换
ShapeResource.createBox(Vector3(0.1f, 0.3f, 0.05f))
    .offsetByTranslation(Vector3(0f, 0.3f, 0f))      // 偏移
    .offsetByRotation(EulerAngles(0f, 45f, 0f))       // 旋转

// 物理材质
PhysicsMaterialResource(
    staticFriction = 0.5f,    // 静摩擦
    dynamicFriction = 0.3f,   // 动摩擦
    restitution = 0.2f        // 弹性（0=完全不弹, 1=完全弹性）
)
```

### 4.2 碰撞配置

```kotlin
// 碰撞响应模式
CollisionResponseMode.COLLIDER_FULL   // 完全物理碰撞（推开/反弹）
CollisionResponseMode.TRIGGER_LITE    // 轻量触发器（只检测，无物理）
CollisionResponseMode.TRIGGER         // 完整触发器

// 碰撞过滤（位掩码）
CollisionFilter(
    group = CollisionGroup(1u),   // 本物体属于组 1
    mask = CollisionGroup(2u)     // 只与组 2 碰撞
)
// 常见分组：1u=默认, 2u=玩家, 4u=子弹, 8u=环境
// spatialmesh 中: GROUP_SPATIAL_MESH = 4u
```

### 4.3 碰撞事件

```kotlin
// 方式 1：通过 content 订阅（在 SpatialView 范围内）
content.subscribe(
    eventType = CollisionEvents.Enter::class.java
) { event: CollisionEvents.Enter ->
    val entityA = event.entityA     // 碰撞发起方
    val entityB = event.entityB     // 碰撞接收方
    val position = event.position   // 碰撞点
}

// 方式 2：通过 Manager 的回调
// physics/manager/EventManager.kt
class CollisionManager {
    var collisionEnterCallback: ((CollisionEvents.Enter) -> Unit)? = null

    fun setup(content: SpatialViewContent) {
        content.subscribe(CollisionEvents.Enter::class.java) { event ->
            collisionEnterCallback?.invoke(event)
        }
    }
}
```

### 4.4 刚体与物理场景

```kotlin
// 从 AssetBundle 加载完整物理场景
val bundle = assetBundle.await()
val scene = bundle.load("Scenes/DominoScene")

// 物理场景包含：
// - 地板（Static 刚体 + 碰撞体）
// - 骨牌（Dynamic 刚体 + 碰撞体 + 变换组件）
// - 光照和相机配置

// 手动创建物理对象
entity.components.apply {
    set(RigidBodyComponent(
        mode = RigidBodyComponent.Mode.DYNAMIC,  // DYNAMIC/STATIC/KINEMATIC
        massProperties = MassProperties(
            mass = 1f,
            inertia = Vector3(1f, 1f, 1f),
            centerOfMass = Vector3(0f, 0f, 0f)
        ),
        isAffectedByGravity = true
    ))
    set(CollisionComponent(
        shape = ShapeResource.createBox(Vector3(0.1f, 0.3f, 0.05f)),
        physicsMaterial = PhysicsMaterialResource(
            staticFriction = 0.8f,
            dynamicFriction = 0.6f,
            restitution = 0.05f
        ),
        responseMode = CollisionResponseMode.COLLIDER_FULL
    ))
    set(PhysicsVelocityComponent(
        linearVelocity = impactDirection * speed,
        angularVelocity = Vector3(0f, 1f, 0f)
    ))
}

// 标记为可交互
entity.components.set(InteractableComponent())
```

## 5. 光照系统

```kotlin
// 基于图像的环境光照（IBL）
// welcomespace/RoomLighting.kt
val iblTexture = withContext(Dispatchers.IO) {
    TextureResource.load("textures/room_ibl.ktx", LoadType.FROM_ASSETS)
}
val iblSource = ImageBasedLightSource.Single(texture = iblTexture)

stageEntity.components.set(StageEnvironmentLightingComponent(
    source = iblSource,
    intensityExponent = 1.0f
))

// TextureResource 生命周期
texture.use { /* 使用纹理 */ }  // 自动 close()
// 或手动 texture.close()

// 方向光
entity.components.set(DirectionalLightComponent(
    color = Color4(1f, 1f, 1f, 1f),
    intensity = 1.0f
))

// 阴影（SDK 074）
DynamicShadowing.setup(scene, shadowMapSize = 1024)
```

### 5.1 光照渲染增强

```kotlin
// 多光源组合
val mainLight = Entity()
mainLight.components.set(DirectionalLightComponent(
    color = Color4(1f, 0.95f, 0.9f, 1f),  // 暖色主光
    intensity = 1.2f
))
val fillLight = Entity()
fillLight.components.set(DirectionalLightComponent(
    color = Color4(0.8f, 0.85f, 1f, 1f),  // 冷色补光
    intensity = 0.4f
))

// 阴影配置
import com.pico.spatial.core.ecs.DynamicShadowing
DynamicShadowing.setup(
    scene = scene,
    shadowMapSize = 2048,             // 阴影贴图分辨率
    shadowDistance = 10f,             // 阴影渲染距离
    cascadeCount = 4,                 // 级联阴影层数（0=关闭级联）
    softness = 0.3f                   // 阴影柔化
)

// 渲染顺序控制
import com.pico.spatial.core.ecs.DrawOrderGroup
entity.components.set(DrawOrderGroup(
    group = 10,                       // 数字越大越晚绘制
    overwriteDepth = false
))

// 标记为 UI 元素（始终在最前渲染）
import com.pico.spatial.core.ecs.SortAsUIElement
entity.components.set(SortAsUIElement(true))

// 线框渲染模式（调试用）
material.setPolygonFillMode(PolygonFillMode.LINE)

// Portal 传送门效果（两个空间之间的视觉连接）
import com.pico.spatial.core.ecs.PortalComponent
portalEntity.components.set(PortalComponent(
    targetEntity = remoteRoomEntity,
    // 看到的是另一个位置的场景
))
```

> [!TIP]
> **性能提示**
> 阴影对性能影响较大，移动端建议 shadowMapSize ≤ 1024，非必要不使用 cascade。

### 5.2 粒子系统

```kotlin
// 粒子（SDK 077）
ParticleComponent(
    emitterConfig = ParticleEmitterConfig(
        maxParticles = 100,
        emissionRate = 20f,
        startColor = Color4(1f, 0.5f, 0f, 1f),
        endColor = Color4(1f, 0f, 0f, 0f),
        startSize = 0.05f,
        endSize = 0.01f,
        lifetime = 2.0f,
        speed = 0.5f,
        gravity = Vector3(0f, -0.2f, 0f),
        loop = true
    )
)

// 常用粒子效果速查
// 火花: 短lifetime + 小size + 橙黄 + speed 1.0
// 烟雾: 大size + 长lifetime + 灰色 + 缓慢上升
// 魔法: 蓝紫 + 随机方向 + 发光颜色
// 爆炸: burst模式 + 各方向扩散 + 快速淡出
```

## 6. 材质系统完整参考

```kotlin
// ---- PhysicallyBasedMaterial ----
val material = PhysicallyBasedMaterial.create()
material.apply {
    // 颜色
    setBaseColor(Color4(1f, 0.5f, 0f, 1f))           // 基础色
    getBaseColor()                                      // 读取

    // 表面属性
    setMetallic(0.8f)                                   // 金属度
    getMetallic()
    setRoughness(0.3f)                                  // 粗糙度
    getRoughness()

    // 透明度
    setOpacity(0.7f)                                    // 不透明度
    getOpacity()

    // 自发光
    setEmissiveColor(Color4(1f, 0.2f, 0f, 1f))         // 自发光色
    getEmissiveColor()

    // 渲染状态
    setBlendingMode(BlendingMode.TRANSPARENT)           // OPAQUE / TRANSPARENT
    setCullingMode(MaterialCullingMode.BACK)             // FRONT / BACK / NONE
    setPolygonFillMode(PolygonFillMode.FILL)             // FILL（实心）/ LINE（线框）
    setDepthTest(true)
    setDepthWrite(true)

    // 纹理
    setBaseColorTexture(texture)
}

// ---- UnlitMaterial（无光照） ----
val unlit = UnlitMaterial.create()
unlit.setBaseColor(Color4(1f, 0f, 0f, 1f))

// ---- ShaderGraphMaterial（自定义着色器） ----
val shaderMat = ShaderGraphMaterial.loadFromAssetBundle(
    bundle = assetBundle,
    path = "Materials/MyShader"
)
if (shaderMat.valid) {
    shaderMat.setParameter("_Intensity", 1.5f)
    shaderMat.setParameter("_Color", Color4(1f, 0f, 0f, 1f))
    shaderMat.toGlobal()  // 跨实体共享

    // 绑定到模型
    modelComponent.materials[0] = shaderMat
}
shaderMat.close()  // 释放
```

## 7. 空间 ML

`spatialml-0.13.3` 演示了端侧 ML 管线（超分辨率 + VQA）：

```kotlin
// 创建 ML Instance
val instance = SpatialMLInstance.create(appContext)
// 等待 instance.ready

// 创建 Session
val session = instance.createSession(
    SpatialMLSession.InitInfo(
        imageWidth = 640,
        imageHeight = 640,
        containerWidth = 4,
        containerHeight = 4,
        containerDepth = 4
    )
)

// 创建 Pipeline
val pipeline = session.newPipeline()

// 创建输入张量
val inputTensor = pipeline.newLocalTensor(
    MultiDimensionalInitInfo(
        dataType = DataType.UINT8,
        dimensions = intArrayOf(1, 640, 640, 3),
        channel = ChannelProperty.SYNC,
        dynamicTexture = null
    )
)

// 执行模型推理
pipeline.runModelInference(
    modelName = "super_resolution",
    modelType = Pipeline.ModelInferenceType.QNN_HTP,
    modelBinary = modelBytes,
    inputs = listOf(Pipeline.ModelNodeEncoding("input", inputTensor)),
    outputs = listOf(Pipeline.ModelNodeEncoding("output", outputPlaceholder))
)

// 提交管线执行
val task = pipeline.submit(
    placeholderMap = mapOf(...),
    callback = { /* 完成回调 */ }
)

// 读回结果
val content = GlobalTensor.readbackContentSuspend()          // 异步读回数据
val texture = dynamicTexture.readbackAsTextureResourceSuspend()  // 读回为纹理

// 场景图操作
session.newSceneFromGLTFSuspend("models/scene.glb")
pipeline.updateSceneGraphProperty(sceneGraph, path, property, tensor)
pipeline.switchSceneVisibility(sceneGraph1, sceneGraph2)
```

> [!WARNING]
> **注意**
> Spatial ML 模块相对独立且专业。除非你有端侧 AI 需求（超分辨率、图像处理等），否则可以暂时跳过。

## 8. 性能调试工具

SDK 提供了一系列工具用于分析 XR 应用性能，涵盖渲染管线和场景复杂度。参考 `downloads/spatial-sdk/markdown/121-127` 系列。

### 8.1 Metrics HUD — 实时性能显示

```kotlin
// 在开发阶段开启性能 HUD
import com.pico.spatial.core.performance.MetricsHUD

// 显示 FPS 和帧时间
MetricsHUD.show(
    metrics = MetricsHUD.Metrics(
        showFps = true,
        showFrameTime = true,
        showDrawCalls = true,
        showTriangleCount = true,
        showEntityCount = true
    ),
    position = MetricsHUD.Position.TOP_RIGHT
)

// 隐藏
MetricsHUD.hide()

// 在非 Debug 构建中自动关闭
if (BuildConfig.DEBUG) {
    MetricsHUD.show(metrics)
}
```

### 8.2 Trace / Perfetto — 性能记录

```kotlin
// 开始性能记录
import com.pico.spatial.core.performance.Trace

Trace.begin("GameLoop")
// ... 游戏逻辑 ...
Trace.end()

// 嵌套记录
Trace.begin("PhysicsStep")
Trace.begin("CollisionDetection")
// ... 碰撞检测 ...
Trace.end()  // CollisionDetection
Trace.begin("Integration")
// ... 物理积分 ...
Trace.end()  // Integration
Trace.end()  // PhysicsStep

// 导出 Trace 文件（可用 Perfetto 分析）
Trace.exportToFile("/sdcard/trace.pftrace")

// 自定义性能计数器
val counter = Trace.createCounter("ActiveEntities")
counter.setValue(entityCount)
```

### 8.3 场景复杂度预算

```kotlin
// 场景复杂度建议值（移动端 XR）
// Draw Calls:    ≤ 200
// 三角形数量:     ≤ 200k
// 实体数量:       ≤ 1000
// 动态光源:      ≤ 3
// 阴影贴图:      1024 x 1024 或更低
// 粒子数量:      ≤ 500

// 性能检查清单
// 1. 使用 MeshResource 的 LOD（细节层级）
// 2. 启用 Frustum Culling（视锥剔除）
// 3. 对象池代替频繁创建/销毁
// 4. 使用 Static 刚体代替 Dynamic（固定物体）
// 5. 减少 Overdraw（透明重叠区域）
// 6. 合并小网格减少 Draw Call
// 7. 纹理压缩（使用 KTX 格式）
// 8. 粒子使用 Attenuation（渐隐）尽早销毁
```

## 9. 模块选择速查表

| 需求 | 使用的模块/API | 参考 Demo |
| --- | --- | --- |
| 骨骼动画 | Entity.playAnimation() / AnimationComponent | animation |
| 补间动画 | TweenAnimation.createTweenAnimation() | animation |
| 轨道/旋转 | 自定义 System + 每帧 Quat 更新 | welcomespace |
| 背景音乐 | AmbientAudioComponent | spatialaudio |
| 3D 定位音效 | ObjectAudioComponent + Transform | spatialaudio |
| 2D 视频播放 | CypressMediaPlayer + VideoPlayerComponent | spatialvideo |
| 360° 立体视频 | VideoMaterial(SIDE_BY_SIDE) + CullingMode.FRONT | spatialvideo |
| 物理模拟 | RigidBodyComponent + CollisionComponent | physics |
| 碰撞检测 | CollisionEvents.Enter + subscribe | physics / spatialmesh |
| 手势交互 | InteractableComponent + detectSpatial\*Gesture | welcomespace / spatialml |
| 环境光照 | ImageBasedLightSource + StageEnvironmentLightingComponent | welcomespace |
| 自定义着色器 | ShaderGraphMaterial | welcomespace |
| 线框渲染 | PolygonFillMode.LINE | spatialmesh |
| 端侧 AI | SpatialMLInstance + Pipeline + Tensor | spatialml |
| 对象池 | Manager 类 + 预分配 + 复用 | spatialmesh (AmmoManager) |
| 资源生命周期 | resource.use {} / toGlobal() / close() | 多个 Demo |
| 实时性能监控 | MetricsHUD（FPS/帧时间/Draw Calls） | — |
| 性能记录分析 | Trace / Perfetto 导出 | — |
| 动态阴影 | DynamicShadowing（shadowMapSize/cascadeCount） | welcomespace |
| 渲染顺序控制 | DrawOrderGroup / SortAsUIElement | — |
| 传送门效果 | PortalComponent | — |

## 快速练习

1. 在 `animation-0.13.3` 的 TweenAnimationUtil.kt 中，找出 MaterialTarget 的使用方式
2. 在 `physics-0.13.3` 的 PhysicsManager.kt 中，列出使用了哪些 ShapeResource 类型
3. 在 `spatialvideo-0.13.3` 的 VideoViewModel.kt 中，找出 CypressMediaPlayerCallback 的实现
4. 开启 MetricsHUD 观察当前应用的 Draw Calls 和帧率——FPS 低于多少时会出现卡顿感？

> [!INFO]
> **参考资料**
> - 动画完整参考：`downloads/spatial-sdk/markdown/080-animation-system.md` 起（编号 080-088）
> - 音频参考：`downloads/spatial-sdk/markdown/052-audio-resource.md`
> - 视频参考：`downloads/spatial-sdk/markdown/053-video-file.md`
> - 物理参考：`downloads/spatial-sdk/markdown/089-physics-simulation.md` 起（编号 089-093）
> - 材质参考：`downloads/spatial-sdk/markdown/050-material.md`
> - 光照参考：`downloads/spatial-sdk/markdown/072-image-based-lighting.md` / `073-dynamic-lighting.md`
> - ML 参考：`downloads/spatial-sdk/markdown/094-spatialml-overview.md` 起
> - 性能调试参考：`downloads/spatial-sdk/markdown/121-performance-overview.md` 起（编号 121-127）
> - 各 Demo 目录：`PICOProject/animation-0.13.3/`, `physics-0.13.3/`, `spatialaudio-0.13.3/`, `spatialvideo-0.13.3/`, `spatialml-0.13.3/`, `welcomespace-0.13.3/`

---
**上一课**: [[0012-spatial-ui|第12课：Spatial UI — 空间用户界面]] | **下一课**: [[0014-building-from-scratch|第14课：从零搭建 PICO 应用]]