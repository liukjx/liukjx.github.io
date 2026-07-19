---
title: "补充课08：ECS 实战 — Rotation.kt 全解析"
description: "通过 welcomespace 中的 Rotation.kt 学习 PICO ECS 架构的自定义 Component 和 System 实现"
---

# ECS 实战：从 Rotation.kt 学习自定义 Component/System

第 9 课介绍了 ECS 的理论概念。本节课用 `welcomespace-0.13.3` 中的真实代码，带你完整走一遍"自定义 Component → 自定义 System → 注册到场景"的流程。

> [!NOTE]
> **目标**
> 学完本课后，你能独立实现自己的 Component/System 并接入 PICO 场景。

## 1. 案例全景

`welcomespace` Demo 实现了一个"3D 家具展示"功能。用户可以在体积窗口中查看家具模型，并控制其自动旋转。整个功能涉及以下文件：

```text
ecs/Rotation.kt                    ← 自定义 Component + System（本节课核心）
ui/display/ItemDisplayVolume.kt    ← 注册 System + 给实体挂载 Component
data/AssetBundle.kt                ← 加载 GLB 模型
Main.kt                            ← 创建 WindowContainer(Volumetric)
```

数据流如下：

```text
ItemDisplayVolume (Composable)
    │
    ├── DisposableEffect ── registerSystem<RotationSystem>()
    │
    └── SpatialView.initial ── 创建 Entity
            │
            ├── TransformComponent    ← 位置/旋转/缩放
            ├── RotationComponent     ← 自定义：是否启用 + 步长
            ├── InteractableComponent ← 可交互
            └── CollisionComponent    ← 碰撞体
                    │
                    ▼
            RotationSystem.update() 每帧执行：
                1. queryEntity(RotationComponent 条件)
                2. 对每个匹配实体：Transform.quaternion *= 旋转增量
```

## 2. 自定义 Component（最简单也最容易被忽略的部分）

先看 `welcomespace/ecs/Rotation.kt` 第 25-33 行：

```kotlin
class RotationComponent(
    var isEnabled: Boolean = false,    // 开关：是否启用旋转
    val step: Float = 1f               // 每帧旋转角度（度）
) : Component() {

    override fun clone(): RotationComponent {
        return RotationComponent(this.isEnabled, this.step)
    }
}
```

**关键规则**：

- **必须继承 `Component()`**——这是 PICO SDK 的基类
- **必须重写 `clone()`**——ECS 引擎在复制实体时需要克隆组件
- **组件是纯数据**——没有逻辑，只有属性。逻辑在 System 中
- **属性用 `var`**（可写）和 `val`（只读）区分

> [!WARNING]
> **容易犯的错误**
> 忘记重写 `clone()` 会在运行时抛异常。Kotlin 编译器不会检查这一点——你需要自己记住。
> `clone()` 必须创建**新实例**，不能返回 `this`。

## 3. 自定义 System — 核心逻辑

同文件第 35-48 行：

```kotlin
class RotationSystem : System() {

    override fun update(context: SceneUpdateContext) {
        // 1. 构建查询条件：找出所有有 RotationComponent 的实体
        val condition = EntityQueryCondition.hasComponent(
            RotationComponent::class.java
        )
        // 2. 执行查询
        val filteredEntities = context.scene.queryEntity(condition)

        // 3. 遍历结果
        filteredEntities.forEach { entity ->
            val rotation = entity.components[RotationComponent::class.java]
            val transform = entity.components[TransformComponent::class.java]
            if (rotation?.isEnabled == true && transform != null) {
                // 4. 每帧绕 Y 轴旋转 step 度
                val deltaQuaternion = EulerAngles(0f, rotation.step, 0f).toQuat()
                transform.quaternion *= deltaQuaternion
            }
        }
    }
}
```

### 3.1 SceneUpdateContext — 系统的"每帧工具箱"

`SceneUpdateContext` 是 System 的核心参数，每帧提供给 `update()`。它包含：

| 属性/方法 | 类型 | 用途 |
| --- | --- | --- |
| `context.deltaTime` | `Float` | 距上一帧的时间差（秒），用于做帧率无关的动画 |
| `context.scene` | `Scene` | 当前场景的引用，可查询/添加/删除实体 |
| `context.scene.queryEntity(condition)` | `List<Entity>` | 用条件查询实体列表 |
| `context.scene.createEntity(name)` | `Entity` | 创建新实体 |
| `context.scene.removeEntity(entity)` | `Unit` | 移除实体 |

> [!TIP]
> **deltaTime 的正确使用**
> 上面的 RotationSystem 直接用了固定角度步长（每帧 1 度），这意味着 120Hz 下转得比 60Hz 快。正确的做法应该是：
> `val stepThisFrame = rotation.step * context.deltaTime * 60`
> 但 Demo 中为了简单直接用了固定值——在实战中记得乘以 deltaTime 做帧率补偿。

### 3.2 EntityQueryCondition — 实体查询

`EntityQueryCondition` 用于筛选特定实体。Demo 中用了最简单的形式——按组件类型筛选：

```kotlin
// 方式 1：必须有某个组件
val cond1 = EntityQueryCondition.hasComponent(RotationComponent::class.java)

// 方式 2：同时有多个组件（用 and/or 链式组合）
val cond2 = EntityQueryCondition.hasComponent(RotationComponent::class.java)
    .and(EntityQueryCondition.hasComponent(TransformComponent::class.java))

// 方式 3：满足任一条件
val cond3 = EntityQueryCondition.hasComponent(RotationComponent::class.java)
    .or(EntityQueryCondition.hasComponent(LightComponent::class.java))

// 方式 4：排除某种组件
val cond4 = EntityQueryCondition.hasComponent(RotationComponent::class.java)
    .and(EntityQueryCondition.hasNotComponent(UiComponent::class.java))
```

> [!NOTE]
> **为什么用 EntityQueryCondition 而不是直接遍历所有实体？**
> 场景中可能有成千上万个实体。ECS 引擎内部维护了组件-实体的索引表（类似数据库的倒排索引），`queryEntity(condition)` 只需要扫描具有目标组件的实体子集，而不是全表扫描。这是 ECS 高性能的关键。

## 4. 注册 System 到场景

定义好 `RotationSystem` 后，需要注册到场景中它才会每帧执行。`ItemDisplayVolume.kt` 第 116-122 行展示了标准做法：

```kotlin
// 用 DisposableEffect 管理 System 生命周期
DisposableEffect(Unit) {
    registerSystem<RotationSystem>()
    onDispose {
        unregisterSystem<RotationSystem>()
    }
}
```

### 4.1 registerSystem 生命周期规则

| 时机 | 操作 | 说明 |
| --- | --- | --- |
| Composable 首次进入组合 | `registerSystem<RotationSystem>()` | System 开始每帧执行 |
| Composable 移出组合 | `unregisterSystem<RotationSystem>()` | System 停止执行 |
| 应用退出 | 自动清理 | SDK 会在进程销毁时清理 |

`registerSystem` 和 `unregisterSystem` 是 PICO SDK 提供的作用域函数（`com.pico.spatial.ui.foundation.dsl`），只能在 `WindowContainerScope` 内调用。这保证了 System 的注册范围不会超出其所属的窗口。

> [!TIP]
> **多个相同 System 的实例**
> 如果同一个 Composable 被多次组合（比如列表中有多个 ItemDisplayVolume），`registerSystem` 不会重复注册同一个类——SDK 内部会去重。调用两次 `registerSystem` 只注册一次，但需要对应两次 `unregisterSystem` 才会真正移除（引用计数模式）。

## 5. 给实体挂载 Component

在 `SpatialView.initial` 中创建实体并挂载组件（第 153-171 行）：

```kotlin
// initial 块中创建实体
initial = { content, attachments ->
    // 加载 3D 模型
    item = withContext(Dispatchers.IO) { assetBundle.await().loadModel(modelName) }
    item?.apply {
        // 1. 获取已有组件并修改（模型加载时自带的 TransformComponent）
        components[TransformComponent::class.java]?.apply {
            setPosition(initTransform.position)
            setEulerAngles(initTransform.rotation)
            setScaleVector(initTransform.scale)
        }
        // 2. 添加自定义组件
        components.set(RotationComponent(isEnabled = isRotateEnabled))
        // 3. 添加交互能力
        components.set(InteractableComponent())
        // 4. 添加碰撞体
        components.set(
            CollisionComponent(
                collisionShape =
                    listOf(ShapeResource.createBox(size = INTERACTABLE_BOX_SIZE)),
                physicsMaterial = PhysicsMaterialResource(),
            )
        )
        // 5. 添加到场景
        content.addEntity(this)
    }
}
```

### 5.1 components 的三种操作方式

| 操作 | 语法 | 说明 |
| --- | --- | --- |
| 获取组件 | `components[TransformComponent::class.java]` | 返回 `TransformComponent?`（可能为 null） |
| 获取组件（泛型版） | `components.get<TransformComponent>()` | 同上的泛型语法糖 |
| 设置/覆盖组件 | `components.set(RotationComponent(...))` | 如果已存在同名组件则覆盖 |
| 移除组件 | `components.remove(RotationComponent::class.java)` | 从实体上移除 |

## 6. 运行时修改组件属性

组件是 `var` 属性，所以你可以在运行时修改它们，System 会在下一帧读到新值：

```kotlin
// ItemDisplayVolume.kt 第 234-235 行
// 用户点击了"自动旋转"开关
isRotateEnabled = it
// 直接修改实体上的 RotationComponent.isEnabled
item?.components?.get(RotationComponent::class.java)?.isEnabled = it
// RotationSystem 下一帧检测到 isEnabled 变化，自动开始/停止旋转
```

这是 ECS 模式的强大之处：**数据驱动逻辑**。你只需要修改 Component 的数据，System 每帧检查数据自动做出响应，不需要显式调用任何"开始旋转()/停止旋转()"方法。

## 7. 完整生命周期时序

```text
用户打开家具展示页面
    │
    ▼
ItemDisplayVolume 进入组合
    │
    ├── DisposableEffect(Unit) ── registerSystem<RotationSystem>()
    │   └── RotationSystem 开始每帧执行 update()
    │
    ├── SpatialView.initial ── 创建实体并挂载组件
    │   ├── TransformComponent（已有，修改位置）
    │   ├── RotationComponent(isEnabled = false)  ← 默认关闭
    │   ├── InteractableComponent
    │   └── CollisionComponent
    │
    ├── 用户点击"自动旋转"开关
    │   └── RotationComponent.isEnabled = true
    │       └── RotationSystem 检测到 → 开始每帧旋转
    │
    ├── 用户拖拽旋转模型
    │   └── 手势 → 修改 TransformComponent.quaternion
    │       └── RotationSystem 在旋转基础上继续叠加旋转
    │
    ├── 用户关闭"自动旋转"
    │   └── RotationComponent.isEnabled = false
    │       └── RotationSystem 停止旋转
    │
    └── 用户返回上一页
        └── DisposableEffect.onDispose ── unregisterSystem<RotationSystem>()
```

## 8. 自己动手：实现一个 PulseComponent

现在你可以尝试自己实现一个简单的 ECS 逻辑——让实体做呼吸式缩放：

```kotlin
// 1. 自定义 Component
class PulseComponent(
    var isEnabled: Boolean = true,
    val minScale: Float = 0.9f,
    val maxScale: Float = 1.1f,
    val speed: Float = 1.0f
) : Component() {
    override fun clone(): PulseComponent {
        return PulseComponent(isEnabled, minScale, maxScale, speed)
    }
}

// 2. 自定义 System
class PulseSystem : System() {
    private var time = 0f

    override fun update(context: SceneUpdateContext) {
        time += context.deltaTime
        val condition = EntityQueryCondition.hasComponent(PulseComponent::class.java)
        val entities = context.scene.queryEntity(condition)
        entities.forEach { entity ->
            val pulse = entity.components[PulseComponent::class.java] ?: return@forEach
            val transform = entity.components[TransformComponent::class.java] ?: return@forEach
            if (!pulse.isEnabled) return@forEach

            // 用正弦波做平滑呼吸效果
            val t = (sin(time * pulse.speed) + 1f) / 2f  // 0..1
            val s = pulse.minScale + (pulse.maxScale - pulse.minScale) * t
            transform.setScaleVector(Vector3(s, s, s))
        }
    }
}

// 3. 在 Composable 中注册
DisposableEffect(Unit) {
    registerSystem<PulseSystem>()
    onDispose { unregisterSystem<PulseSystem>() }
}

// 4. 给实体挂载
entity.components.set(PulseComponent(isEnabled = true, speed = 2.0f))
```

## 9. 核心要点回顾

| 步骤 | 要点 |
| --- | --- |
| 1. 定义 Component | 继承 `Component()`，重写 `clone()`，只存数据 |
| 2. 定义 System | 继承 `System()`，在 `update(context)` 中写逻辑 |
| 3. 构建查询条件 | `EntityQueryCondition.hasComponent()` + `and()`/`or()` |
| 4. 执行查询 | `context.scene.queryEntity(condition)` |
| 5. 读写组件数据 | `entity.components[T::class.java]` / `components.set()` |
| 6. 注册 System | `registerSystem<T>()` 配合 `DisposableEffect` |
| 7. 取消注册 | `unregisterSystem<T>()` 在 `onDispose` 中 |

> [!NOTE]
> **ECS 的威力**
> 组件是数据，系统是行为，实体只是 ID。这种分离让你可以：
> - 为不同实体自由组合功能（组合优于继承）
> - 添加新行为只需加 Component + System，不改既有代码
> - System 天然具备批处理能力（一次查询处理所有匹配实体）

## 快速练习

1. RotationSystem 中为什么需要检查 `rotation?.isEnabled == true && transform != null`？哪些情况可能不满足？
2. 实现一个 `BobComponent`：让实体在 Y 轴方向上下浮动（参考 PulseComponent 使用正弦波）。
3. 如果希望只有"同时拥有 RotationComponent 和 InteractableComponent"的实体才旋转，EntityQueryCondition 应该怎么写？

> [!NOTE]
> **点击查看答案**
> 1. 三个原因：(1) `components[T::class.java]` 返回可空类型，可能为 null（实体没有这个组件）；(2) `isEnabled` 可能是 false（用户关闭了自动旋转）；(3) 某些实体有 RotationComponent 但不一定有 TransformComponent（刚创建还没设置位置）。不加安全检查会 NPE。
> 2. 参考 PulseComponent 的写法，把缩放改为 Y 轴偏移：`transform.setPosition(transform.position.x, baseY + sin(time * speed) * amplitude, transform.position.z)`
> 3. `EntityQueryCondition.hasComponent(RotationComponent::class.java).and(EntityQueryCondition.hasComponent(InteractableComponent::class.java))`

## 参考文件

- `welcomespace-0.13.3/app/src/main/java/com/pico/spatial/sample/welcomespace/ecs/Rotation.kt` — 完整 Component + System
- `welcomespace-0.13.3/app/src/main/java/com/pico/spatial/sample/welcomespace/ui/display/ItemDisplayVolume.kt` — 注册 + 挂载
- 第 9 课：[[0009-spatial-core-ecs|Spatial Core & ECS 架构]] — ECS 理论基础

> [!INFO]
> **有疑问？** 随时在对话中问我，我可以帮你调试自定义 Component/System。

---
**上一课**: [[s07-pico-sdk-supplement-api]] | **下一课**: [[0016-capability-map]]