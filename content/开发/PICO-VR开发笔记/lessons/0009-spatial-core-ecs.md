---
title: "第9课：Spatial Core & ECS 架构"
description: "spatial-core 是 PICO SDK 的心脏模块。它基于实体-组件-系统（ECS）模式管理所有 3D 场景内容。理解 ECS 是理解 PICO 空间应用的钥匙。"
---

`spatial-core` 是 PICO SDK 的心脏模块。它基于**实体-组件-系统（ECS）**模式管理所有 3D 场景内容。理解 ECS 是理解 PICO 空间应用的钥匙。

> [!NOTE]
> **ECS 思维模式转变**
> 传统 OOP："我有一个 Robot 类，它继承自 Entity，有 move() 方法"
> ECS："我有一个 Entity，它加上了 ModelComponent（显示模型）+ AnimationComponent（播放动画）+ RigidBodyComponent（物理模拟）"

## 1. ECS 三大概念

| 概念 | 类比 OOP | 作用 |
| --- | --- | --- |
| **Entity** | 对象（但只有 ID） | 标识一个"东西"，本身没有行为和数据 |
| **Component** | 对象的属性/字段 | 纯数据：位置、模型、碰撞体、灯光等 |
| **System** | 方法/逻辑 | 每帧执行：处理特定组件的计算 |

## 2. Entity 完整 API

### 2.1 创建 Entity

```kotlin
// 空实体
val empty = Entity()

// 创建并添加组件
val entity = Entity().apply {
    components.set(ModelComponent(model = ModelEntity(resource = modelRes)))
    components.set(TransformComponent(position = Vector3(0f, 1f, -2f)))
}

// 从模型文件加载（最常用的方式）
val character = withContext(Dispatchers.IO) {
    Entity.load("models/robot.glb")  // 返回已含 ModelComponent 的 Entity
}

// 从 AssetBundle 加载模型
val bundle = assetBundle.await()
val sceneModel = bundle.loadModel("Scenes/MainScene")  // 返回 Entity
```

### 2.2 组件管理

```kotlin
entity.components.apply {
    // 设置/添加组件
    set(TransformComponent(position = Vector3(0f, 0f, -2f)))
    set(ModelComponent(model = ModelEntity(resource = res)))
    set(CollisionComponent(shape = ShapeResource.createSphere(0.15f)))

    // 获取组件（返回 null 如果不存在）
    val transform = get<TransformComponent>()
    val model = get<ModelComponent>()

    // 检查组件是否存在
    val hasPhysics = has<RigidBodyComponent>()

    // 移除组件
    remove<CollisionComponent>()
}

// 通过索引操作符
val transform = entity.components[TransformComponent::class]
entity.components[CollisionComponent::class] = CollisionComponent(shape)
```

### 2.3 Transform 操作

```kotlin
// 位置操作
entity.components.get<TransformComponent>()?.apply {
    setPosition(Vector3(1f, 2f, -3f))
    setScaleVector(Vector3(0.5f))   // 统一缩放 0.5
    setEulerAngles(EulerAngles(0f, 90f, 0f))  // 绕 Y 轴旋转 90 度

    // 读取属性
    val pos = position
    val rot = eulerAngles
}

// 快捷操作
entity.setPosition(Vector3(1f, 0f, -1f))
entity.setScaleVector(Vector3(2f))
entity.setQuaternion(Quat.identity)
entity.setEulerAngles(EulerAngles(0f, 45f, 0f))
entity.scaleBy(0.8f)  // 整体缩放

// 获取包围盒
val boundingBox = entity.getBoundingBox()

// 坐标转换（不同实体坐标系之间）
val worldPos = entity.convertPositionFrom(localPos, referenceEntity)
val worldRot = entity.convertRotationFrom(localRot, referenceEntity)
```

### 2.4 实体层级管理

```kotlin
// 构建层级树
val parent = Entity()
val child1 = Entity()
val child2 = Entity()

parent.addChild(child1)
parent.addChild(child2)

// 查询
val children = parent.getChildren()  // 返回 List<Entity>
val byName = parent.findEntity("child_name")  // 按名称递归查找
val skinnedMesh = parent.findSkinnedMeshEntity()  // 查找骨骼网格子实体

// 命名
parent.setName("robot_parent")
val name = parent.getName()

// 移除
parent.removeChild(child1)
parent.removeAllChildren()

// 获取父级
val parentEntity = child1.getParent()

// 启用/禁用（不会销毁）
parent.enabled = false  // 隐藏整个子树
```

### 2.5 克隆与销毁

```kotlin
// 克隆实体
val clone = originalEntity.clone(
    CloneOptions(
        recursive = true,                    // 同时克隆子实体
        shouldShareMaterialInstance = false  // 克隆后的材质是否独立
    )
)

// 克隆注意事项
// 1. clone() 返回的实体需要手动添加到场景中
content.addEntity(clone)

// 2. 浅克隆 (recursive=false) 只克隆实体本身，不克隆子实体
// 3. shouldShareMaterialInstance=true 时，原始和克隆共享材质——改一个两者都变
// 4. shouldShareMaterialInstance=false 时，各自拥有独立材质副本
// 5. AnimationPlaybackController 不会被克隆，需要为克隆体重新创建
// 6. 物理组件 (RigidBodyComponent) 会被复制但物理世界不会自动感知，需手动 addEntity

// 对象池模式（代替频繁创建/销毁）
class EntityPool(private val template: Entity, private val size: Int = 10) {
    private val pool = mutableListOf<Entity>()

    fun init(content: SpatialViewContent) {
        repeat(size) {
            val instance = template.clone(CloneOptions(recursive = true))
            pool.add(instance)
        }
    }

    fun acquire(): Entity? {
        val entity = pool.firstOrNull { !it.enabled }
        entity?.enabled = true
        return entity
    }

    fun release(entity: Entity) {
        entity.enabled = false  // 禁用而非销毁，下次复用
    }
}

// 销毁
entity.destroy()  // 释放所有 GPU 资源
// 销毁后的实体不可再使用
```

### 2.6 坐标空间转换（SpatialCoordinateSpaceConverter）

在 XR 开发中经常需要在不同坐标空间之间转换位置和旋转：本地空间（相对于父实体）↔ 世界空间（全局）↔ 相机空间（相对于用户视角）。

```kotlin
import com.pico.spatial.core.coordinate.SpatialCoordinateSpaceConverter
import com.pico.spatial.core.coordinate.ViewCoordinateSpace

// 获取坐标转换器
val converter = SpatialCoordinateSpaceConverter()

// 1. 实体本地坐标 → 世界坐标
val localPos = Vector3(0.5f, 0f, 0f)  // 相对于父实体的位置
val worldPos = entity.convertPositionFrom(localPos, entity.parentEntity)
// 或使用 converter
val worldPos2 = converter.convertPosition(
    position = localPos,
    from = ViewCoordinateSpace.Local(entity),
    to = ViewCoordinateSpace.World
)

// 2. 世界坐标 → 相机坐标（相对于用户头显）
val cameraRelativePos = converter.convertPosition(
    position = worldPos,
    from = ViewCoordinateSpace.World,
    to = ViewCoordinateSpace.Camera
)

// 3. 旋转转换（同理）
val localRot = EulerAngles(0f, 45f, 0f)
val worldRot = converter.convertRotation(
    rotation = localRot,
    from = ViewCoordinateSpace.Local(entity),
    to = ViewCoordinateSpace.World
)

// 4. 常用场景：将手柄射线方向转换为世界方向
val controllerForward = Vector3(0f, 0f, -1f)
val worldDirection = converter.convertDirection(
    direction = controllerForward,
    from = ViewCoordinateSpace.Local(controllerEntity),
    to = ViewCoordinateSpace.World
)

// 5. 碰撞点坐标转换（碰撞事件的坐标通常在 World 空间）
content.subscribe(CollisionEvents.Enter::class.java) { event ->
    val hitPosWorld = event.position  // 世界坐标的碰撞点
    // 转为实体的本地坐标
    val hitPosLocal = converter.convertPosition(
        position = hitPosWorld,
        from = ViewCoordinateSpace.World,
        to = ViewCoordinateSpace.Local(myEntity)
    )
}

// ViewCoordinateSpace 支持的坐标空间
ViewCoordinateSpace.World                    // 世界空间（全局原点）
ViewCoordinateSpace.Camera                   // 相机空间（头显为原点）
ViewCoordinateSpace.Local(entity)            // 实体本地空间（父实体为原点）
ViewCoordinateSpace.SpatialCoordinateSpace   // 空间UI坐标空间
```

## 3. 内置组件目录

| 组件 | 包/模块 | 用途 | 关键属性 |
| --- | --- | --- | --- |
| `TransformComponent` | core | 位置/旋转/缩放 | `position`, `quaternion`, `eulerAngles`, `scale` |
| `ModelComponent` | core | 3D 模型显示 | `model`, `materials` (List) |
| `CollisionComponent` | core | 碰撞体检测 | `shape`, `physicsMaterial`, `filter`, `responseMode` |
| `RigidBodyComponent` | core | 物理刚体 | `mode` (DYNAMIC/STATIC/KINEMATIC), `massProperties` |
| `PhysicsVelocityComponent` | core | 物理速度 | `linearVelocity`, `angularVelocity` |
| `InteractableComponent` | core | 标记为可手势交互 | （无属性，标记用） |
| `AnimationComponent` | core | 骨骼动画控制 | `play()`, `pause()`, `speed`, `stop()` |
| `AmbientAudioComponent` | core | 环境背景音频 | `volume`, `loop`, `resource` |
| `ObjectAudioComponent` | core | 3D 定位音频 | `volume`, `directivity`, `distanceAttenuationMode` |
| `VideoPlayerComponent` | core | 视频播放 | `player`, `mesh`, `material` |
| `DirectionalLightComponent` | core | 方向光 | `color`, `intensity` |
| `StageEnvironmentLightingComponent` | core | 环境照明 | `source`, `intensityExponent` |
| `AnchorComponent` | sense | 空间锚点绑定 | `anchor`, `positionOffset` |
| `LookAtComponent` | core | 朝向目标 | `target` |

## 4. 自定义 ECS 组件和系统

### 自定义 Component

```kotlin
// spatialmesh/AmmoComponent.kt
class AmmoComponent : Component() {
    var isFired = false
    var lifeTime = 0f
    var shooterId = -1

    override fun clone(): AmmoComponent = AmmoComponent().also {
        it.isFired = isFired
        it.lifeTime = lifeTime
        it.shooterId = shooterId
    }
}

// physics/ecs/Domino.kt
class DominoComponent(val index: Int = -1) : Component() {
    override fun clone(): DominoComponent = DominoComponent(index)
}
```

### 自定义 System

```kotlin
// welcomespace/RotationSystem.kt
class RotationSystem : System() {

    // 每帧调用一次
    override fun update(context: SceneUpdateContext) {
        // context.deltaTime    —— 上一帧到本帧的时间间隔（秒）
        // context.scene        —— 场景引用，用于查询实体

        // 查询所有带有 RotationComponent 的实体
        val entities = context.scene.queryEntity(
            EntityQueryCondition.hasComponent(RotationComponent::class)
        )

        for (entity in entities) {
            val transform = entity.components.get<TransformComponent>() ?: continue
            val rotation = entity.components.get<RotationComponent>() ?: continue

            // 每帧增加旋转角度（deltaTime 保证不同帧率下速度一致）
            transform.quaternion *= Quat.fromEulerAngles(
                EulerAngles(0f, rotation.speed * context.deltaTime, 0f)
            )
        }
    }
}

// 更复杂的查询条件
val query = EntityQueryCondition
    .hasComponent(RigidBodyComponent::class)
    .and(EntityQueryCondition.hasComponent(CollisionComponent::class))

val physicsEntities = context.scene.queryEntity(query)
```

### 注册/注销 System

```kotlin
// 在 Compose 中注册（WindowContainer 或 Stage 作用域内）
@Composable
fun GameScene() {
    // 注册 —— 进入组合时自动注册，离开时自动注销
    registerSystem<RotationSystem>()
    registerSystem<AmmoSystem>()

    // 或在 DisposableEffect 中手动管理
    DisposableEffect(Unit) {
        registerSystem<AmmoSystem>()
        onDispose {
            unregisterSystem<AmmoSystem>()
        }
    }
}
```

## 5. 资源生命周期管理

PICO SDK 的资源（AudioResource、TextureResource、AnimationResource 等）需要手动管理内存：

```kotlin
// 加载资源
val texture = withContext(Dispatchers.IO) {
    TextureResource.load("textures/wood_01.ktx", LoadType.FROM_ASSETS)
}
val audioRes = AudioResource.load("bgm", "audio/background.mp3", LoadType.FROM_ASSETS)

// 使用资源（use 块结束后自动释放）
texture.use {
    // 在这里使用 texture
    material.setBaseColorTexture(texture)
}
// 等价于：
try {
    material.setBaseColorTexture(texture)
} finally {
    texture.close()
}

// 动画资源也遵循此模式
val animResource = entity.getAnimationResources().first()
animResource.use {
    entity.playAnimation(animResource)
}

// 全局资源 —— 长时间存活
meshResource.toGlobal()      // 设为全局（跨场景共享）
shaderMaterial.toGlobal()
```

## 6. 碰撞与物理（完整 API）

```kotlin
// 碰撞体配置
entity.components.set(CollisionComponent(

    // 碰撞形状
    shape = ShapeResource.createSphere(radius = 0.15f),
    // 或 ShapeResource.createBox(halfExtents = Vector3(0.1f, 0.3f, 0.05f))
    // 或 ShapeResource.createCapsule(radius = 0.1f, height = 0.5f)
    // 或 ShapeResource.createConvexMesh(meshResource)
    // 或 ShapeResource.createStaticMesh(meshResource)

    // 物理材质属性
    physicsMaterial = PhysicsMaterialResource(
        staticFriction = 0.5f,
        dynamicFriction = 0.3f,
        restitution = 0.2f   // 弹性系数
    ),

    // 碰撞响应模式
    responseMode = CollisionResponseMode.COLLIDER_FULL,
    // COLLIDER_FULL — 完全物理碰撞（推开、反弹）
    // TRIGGER_LITE  — 轻量触发器（只检测重叠，无物理推离）
    // TRIGGER       — 触发器

    // 碰撞过滤（位掩码）
    filter = CollisionFilter(
        group = CollisionGroup(1u),     // 本物体属于组 1
        mask = CollisionGroup(2u)        // 只与组 2 碰撞
    )
))

// 刚体
entity.components.set(RigidBodyComponent(
    mode = RigidBodyComponent.Mode.DYNAMIC,  // DYNAMIC / STATIC / KINEMATIC
    massProperties = MassProperties(
        mass = 1f,
        inertia = Vector3(1f, 1f, 1f),
        centerOfMass = Vector3(0f, 0f, 0f)
    ),
    isAffectedByGravity = true
))

// 速度
entity.components.set(PhysicsVelocityComponent(
    linearVelocity = Vector3(frontX, 0f, frontZ) * 0.5f,
    angularVelocity = Vector3(0f, 1f, 0f)  // 绕 Y 轴旋转
))

// 锁定物理轴
entity.components.set(Bool3(x = true, y = false, z = true))

// 碰撞事件
content.subscribe(
    eventType = CollisionEvents.Enter::class.java
) { event: CollisionEvents.Enter ->
    val hitEntity = event.entityB     // 被碰撞的实体
    val hitPosition = event.position  // 碰撞点位置
}

// 射线检测（CollisionCast）
val hitResult = CollisionCast.raycast(
    origin = Vector3(0f, 1.5f, -0.5f),
    direction = Vector3(0f, 0f, -1f),
    maxDistance = 10f,
    hitMode = CollisionCastHitMode.NEAREST
)
when (hitResult) {
    is CollisionCastResult.Hit -> {
        val target = hitResult.entity
        val point = hitResult.position
        Log.d(TAG, "击中: ${target.getName()} 距离: ${hitResult.distance}")
    }
    is CollisionCastResult.NoHit -> {}
}

// 形状检测（球体扫描）
CollisionCast.shapeCast(
    shape = ShapeResource.createSphere(0.1f),
    startPosition = Vector3(0f, 1.5f, -0.5f),
    endPosition = Vector3(0f, 1.5f, -5f),
    hitMode = CollisionCastHitMode.NEAREST
)  // 碰撞点位置
}
```

## 7. 材质系统

```kotlin
// 物理基渲染（PBR）材质
val material = PhysicallyBasedMaterial.create()

// 属性设置
material.apply {
    setBaseColor(Color4(1f, 0.5f, 0f, 1f))      // 橘色
    setMetallic(0.8f)                             // 金属感
    setRoughness(0.3f)                            // 粗糙度
    setOpacity(1f)                                // 不透明度
    setEmissiveColor(Color4(1f, 0.2f, 0f, 1f))   // 自发光颜色

    // 渲染模式
    setBlendingMode(BlendingMode.TRANSPARENT)     // TRANSPARENT / OPAQUE
    setCullingMode(MaterialCullingMode.BACK)       // BACK / FRONT / NONE
    setPolygonFillMode(PolygonFillMode.FILL)       // FILL / LINE（线框模式）

    // 纹理
    setBaseColorTexture(texture)
}

// 无光照材质（不响应光照）
val unlit = UnlitMaterial.create()
unlit.setBaseColor(Color4(1f, 0f, 0f, 1f))

// ShaderGraph 材质（自定义着色器）
val shaderMat = ShaderGraphMaterial.loadFromAssetBundle(
    bundle, "Materials/MyShader"
)
shaderMat.setParameter("_Intensity", 1.5f)
shaderMat.toGlobal()  // 跨实体共享

// 应用到组件
entity.components.set(ModelComponent(
    model = ModelEntity(resource = modelRes),
    materials = listOf(material)  // 覆盖默认材质
))
```

## 8. ECS 在 Demo 中的架构模式

spatialmesh Demo 的 ECS 架构是最完整的参考：

```kotlin
自定义组件:
  AmmoComponent        — 标识弹药实体，包含生命周期状态
  ShooterComponent     — 标识射击者，包含射击状态和 HMD 追踪
  SpatialMeshComponent — 标识网格命中状态

自定义系统:
  AmmoSystem    — 每帧检查弹药存活时间，过期销毁
  ShooterSystem — 每帧检测射击输入，生成弹药，处理命中

管理器（协调逻辑）:
  AmmoManager     — 弹药池创建和回收（对象池模式）
  GameplayManager — 游戏规则：命中处理、记分
  MeshScanManager — 空间网格扫描和实体创建
  GameUIBridge    — UI ↔ ECS 桥接（单例持有 ViewModel 引用）
```

> [!NOTE]
> **对象池模式（Object Pooling）**
> 在 AmmoManager 中，弹药实体不是每次射击都创建/销毁的。而是预先创建一批弹药实体，射击时从池中取一个激活，超出生命周期后还回池中。这避免了频繁 GC 导致的帧率抖动，在 XR 开发中非常常见。
>
> 参考 `spatialmesh/AmmoManager.kt` 中的 `prepare()` 和 `spawn()` 方法。

## 快速练习

1. 在 `physics-0.13.3` Demo 中找出 DominoComponent 的定义和使用位置
2. 在 `spatialmesh-0.13.3` 中找出 AmmoSystem.update() 方法的实现——它每帧做了什么？
3. 如果想实现一个"围绕 Y 轴旋转的发光球体"，需要哪些组件和系统？

<details style="margin-top: 1rem; cursor: pointer;">
  <summary>点击查看答案</summary>
  <ol>
    <li><code>PICOProject/physics-0.13.3/app/.../ecs/Domino.kt</code></li>
    <li><code>PICOProject/spatialmesh-0.13.3/app/.../ecs/AmmoSystem.kt</code> — 每帧检查 AmmoComponent.lifeTime，超过阈值则回收弹药</li>
    <li>Entity + TransformComponent(位置) + ModelComponent(球体模型) + PhysicallyBasedMaterial(setEmissiveColor) + 自定义 RotationSystem(绕 Y 轴旋转) + 注册系统</li>
  </ol>
</details>

---

> [!INFO]
> **参考资料**
> - 本地 API 文档：`pico-sdk-0.13.3-mirror/spatial-api/0.13.3/spatialpack/core/`
> - 最佳 Demo 参考：`PICOProject/spatialmesh-0.13.3/`（ECS 最完整）
> - 官方 SDK 文档：
>   `downloads/spatial-sdk/markdown/034-ecs-overview.md` (ECS 总览) —
>   `downloads/spatial-sdk/markdown/035-entity-overview.md`~`044-entity-events.md` (Entity API 系列) —
>   `downloads/spatial-sdk/markdown/046-customize-systems-and-components.md` (自定义组件)

---
**上一课**: [[0008-pico-sdk-architecture|第8课：PICO Spatial SDK 总体架构]] | **下一课**: [[0010-spatial-sense|第10课：Spatial Sense — 空间感知]]