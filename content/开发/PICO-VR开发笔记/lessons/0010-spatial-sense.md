---
title: "第10课：Spatial Sense — 空间感知"
description: "Spatial Sense 模块是 PICO SDK 中让应用「看见」现实世界的桥梁。它包括空间锚点、平面检测、网格扫描、键盘检测等功能，是构建 MR 混合现实应用的基石。"
---

Spatial Sense 模块是 PICO SDK 中让应用"看见"现实世界的桥梁。它包括空间锚点、平面检测、网格扫描、键盘检测等功能，是构建 MR 混合现实应用的基石。

> [!NOTE]
> **核心概念**
> Sense 模块解决一个问题：**虚拟内容如何与现实世界对齐**。通过 Anchor（锚点）系统，你可以把虚拟物体固定在现实世界的某个位置上，即使重启设备也能记住。

## 1. 模块结构

`spatial-sense` 包含 5 个主要概念包：

| 包 | 核心类 | 用途 | Demo 示例 |
| --- | --- | --- | --- |
| `sense.base` | `Anchor`, `TrackingState`, `SemanticLabelType` | 基础类型：锚点基类、追踪状态、语义标签 | spatialmesh |
| `sense.world` | `WorldAnchor`, `WorldTrackingManager` | 世界锚点——将虚拟物体固定在现实位置 | welcomespace |
| `sense.plane` | `PlaneAnchor`, `PlaneTrackingManager` | 平面检测——检测墙壁、地面、桌面 | spatialmesh |
| `sense.mesh` | `MeshAnchor`, `MeshTrackingManager` | 空间网格——扫描现实环境形状 | spatialmesh |
| `sense.keyboard` | `PICOKeyboardAnchor`, `PICOKeyboardTrackingManager` | 键盘检测——识别 PICO 键盘位置 | — |

## 2. Anchor（锚点）体系

所有锚点继承自同一个基类：

```kotlin
open class Anchor  // 基类
  ├── WorldAnchor      // 世界锚点（空间中的固定位置）
  ├── PlaneAnchor      // 平面锚点（检测到的平面）
  ├── MeshAnchor       // 网格锚点（扫描的网格）
  └── PICOKeyboardAnchor // 键盘锚点
```

### Anchor 的核心属性

```kotlin
class WorldAnchor : Anchor() {
    val uuid: UUID           // 唯一标识
    val name: String         // 名称
    val position: Vector3    // 在空间中的位置
    val rotation: Quat       // 旋转
}

// 追踪状态枚举
enum class TrackingState {
    NONE, INITIALIZED, RUNNING, PAUSED, STOPPED, INVALID, UNKNOWN
}
```

## 3. Mesh 空间网格 — spatialmesh Demo

spatialmesh Demo 是 Sense 模块的最佳学习材料。它演示了如何扫描现实环境的形状，并在网格上实现交互（射击游戏）。

### 3.1 订阅网格更新

```kotlin
// MeshScanManager.kt
class MeshScanManager(private val content: SpatialViewContent) {
    private var scope: CoroutineScope? = null

    fun startScan() {
        scope = CoroutineScope(Dispatchers.Main.immediate + SupervisorJob())

        // 订阅网格锚点更新
        val cancellable = MeshTrackingManager.subscribeAnchorUpdate { update ->
            scope?.launch {
                when (update.event) {
                    AnchorUpdate.Event.ADDED -> onMeshAdded(update.anchor)
                    AnchorUpdate.Event.UPDATED -> onMeshUpdated(update.anchor)
                    AnchorUpdate.Event.REMOVED -> onMeshRemoved(update.anchor)
                }
            }
        }
    }

    private suspend fun onMeshAdded(anchor: MeshAnchor) {
        // 从网格锚点加载网格资源
        val mesh = withContext(Dispatchers.IO) {
            MeshResource.loadFromMeshAnchor(anchor.uuid)
        }

        // 创建实体并在网格位置放置模型
        val entity = Entity().apply {
            components.set(ModelComponent(
                model = ModelEntity(mesh = mesh, material = material)
            ))
            components.set(CollisionComponent(
                shape = ShapeResource.createStaticMesh(mesh),
                responseMode = CollisionResponseMode.COLLIDE
            ))
        }
        content.addEntity(entity)
    }
}
```

### 3.2 语义标签

SDK 可以对检测到的平面和物体进行语义分类：

```kotlin
// 语义标签枚举（部分）
enum class SemanticLabelType {
    WALL, FLOOR, CEILING, TABLE, CHAIR, BED,
    DOOR, WINDOW, SOFA, CABINET, SCREEN,
    HUMAN, PLANT, LAMP, STAIRWAY,
    VIRTUAL_WALL  // 用户绘制的虚拟边界
}

// 使用
if (anchor.semanticLabel == SemanticLabelType.TABLE) {
    // 在桌子上放置物体
}
```

## 4. Plane 平面检测

```kotlin
// 平面锚点属性
class PlaneAnchor : Anchor() {
    val orientation: PlaneOrientation  // 平面方向
    val extent: Vector2                // 平面尺寸
    val center: Vector3                // 平面中心
}

// 平面方向
enum class PlaneOrientation {
    HORIZONTAL_UPWARD,     // 向上的水平面（地面）
    HORIZONTAL_DOWNWARD,   // 向下的水平面（天花板）
    VERTICAL,              // 垂直面（墙壁）
    ARBITRARY,             // 任意方向
    UNKNOWN_ORIENTATION
}

// 订阅平面更新
PlaneTrackingManager.subscribeAnchorUpdate { update ->
    when (update.event) {
        AnchorUpdate.Event.ADDED -> {
            val plane = update.anchor
            if (plane.orientation == PlaneOrientation.HORIZONTAL_UPWARD) {
                // 在地面上放置物体
            }
        }
    }
}
```

## 5. World Anchor 世界锚点

世界锚点让你保存虚拟物体的位置，下次启动应用时还在同样的现实位置：

```kotlin
// 在世界空间创建锚点
val anchor = WorldAnchor(
    position = Vector3(0f, 0f, -2f),
    rotation = Quat.identity,
    name = "my_anchor"
)

// 保存锚点（需要 Full Space 权限）
WorldTrackingManager.addAnchor(anchor)

// 查询已有锚点
val savedAnchors = WorldTrackingManager.getAllAnchors()

// 删除锚点
WorldTrackingManager.deleteAnchor(anchor.uuid)

// 使用锚点定位实体
entity.components.set(AnchorComponent(
    anchorUUID = anchor.uuid,
    trackingMode = TrackingMode.PERSISTENT  // 持久追踪
))
```

## 6. 空间键盘（PICOKeyboardAnchor）

SDK 可以检测 PICO 蓝牙键盘在现实空间中的位置，让你在键盘上方显示虚拟 UI 或结合键盘输入。

```kotlin
// 订阅键盘锚点更新
PICOKeyboardTrackingManager.subscribeAnchorUpdate { update ->
    when (update.event) {
        AnchorUpdate.Event.ADDED -> {
            val keyboard = update.anchor as PICOKeyboardAnchor
            // 在键盘上方显示虚拟 UI
            val keyboardEntity = Entity().apply {
                components.set(TransformComponent(
                    position = keyboard.position + Vector3(0f, 0.1f, 0f),
                    rotation = keyboard.rotation
                ))
                components.set(ModelComponent(
                    model = ModelEntity(resource = virtualKeyboardRes)
                ))
            }
            content.addEntity(keyboardEntity)
        }
        AnchorUpdate.Event.UPDATED -> {
            // 键盘被移动，更新虚拟 UI 位置
            val keyboard = update.anchor
            keyboardEntity.setPosition(keyboard.position + Vector3(0f, 0.1f, 0f))
        }
        AnchorUpdate.Event.REMOVED -> {
            // 键盘断开连接，隐藏虚拟 UI
            content.removeEntity(keyboardEntity)
        }
    }
}

// 查询当前连接的键盘
val connectedKeyboard = PICOKeyboardTrackingManager.getLatestAnchor()
connectedKeyboard?.let { keyboard ->
    Log.d(TAG, "键盘位置: ${keyboard.position}, 型号: ${keyboard.deviceName}")
}

// 空间键盘的典型应用场景：
// 1. 在键盘上方显示快捷工具栏（类似 iPad 的快捷栏）
// 2. 键盘旁的辅助信息面板
// 3. 键盘输入时的候选词显示
```

## 7. 空间权限要求

> [!WARNING]
> **重要**
> 使用 Sense 功能需要在 `AndroidManifest.xml` 中声明空间权限，并且应用需要切换到 Full Space（Stage）。

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="com.pico.permission.SPATIAL_ANCHOR" />
<uses-permission android:name="com.pico.permission.SPATIAL_MESH" />
<uses-permission android:name="com.pico.permission.SPATIAL_PLANE" />
```

## 8. 何时使用哪个

| 需求 | 使用 | 示例场景 |
| --- | --- | --- |
| 把虚拟物体"钉"在现实位置 | WorldAnchor | 在墙上挂一幅虚拟画 |
| 检测地面/墙壁/桌面 | PlaneAnchor | 在桌面上放置虚拟茶杯 |
| 扫描现实环境形状 | MeshAnchor | 让虚拟子弹击中现实物体 |
| 对现实物体分类 | SemanticLabelType | 识别椅子、床、门 |
| 检测键盘位置 | PICOKeyboardAnchor | 在键盘上方显示 UI |

## 快速练习

1. 在 `spatialmesh-0.13.3` Demo 中，找到语义标签（SemanticLabelType）的渲染实现——哪个文件根据标签类型设置了不同的网格颜色？
2. 实现一个 Composable 函数：在检测到水平平面（桌面）时，在该平面中心放置一个虚拟花瓶。需要用到哪些 Manager 和 Anchor 类型？
3. 在 `welcomespace-0.13.3` 中，找出应用如何保存和恢复世界锚点位置。提示：查看 `WorldAnchor` 和 `AnchorComponent` 的使用。

<details>
  <summary>点击查看答案</summary>

1. `spatialmesh-0.13.3/app/.../ui/MeshColor.kt`（或类似命名）中定义了根据 `SemanticLabelType` 返回不同颜色的逻辑——墙壁灰色、地面棕色、桌子蓝色等
2. `PlaneTrackingManager.subscribeAnchorUpdate` 监听 `ADDED` 事件 → 检查 `PlaneAnchor.orientation == HORIZONTAL_UPWARD` → 用 `anchor.center` 作为位置，创建 Entity + ModelComponent 添加到场景
3. `welcomespace-0.13.3/app/.../ecs/PersistenceManager.kt`（或类似命名）中调用 `WorldTrackingManager.addAnchor()` 保存，`getAllAnchors()` 恢复

</details>

> [!INFO]
> **参考资料**
> - 本地 API 文档：`pico-sdk-0.13.3-mirror/spatial-api/0.13.3/sensepack/sense/`
> - 最佳 Demo 参考：`PICOProject/spatialmesh-0.13.3/manager/MeshScanManager.kt`
> - 官方 SDK 文档：`downloads/spatial-sdk/markdown/100-spatial-anchor.md`

---
**上一课**: [[0009-spatial-core-ecs|第9课：Spatial Core — ECS]] | **下一课**: [[0011-spatial-tracking|第11课：Spatial Tracking — 空间追踪]]