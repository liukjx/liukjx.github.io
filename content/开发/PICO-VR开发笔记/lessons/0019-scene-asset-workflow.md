---
title: "第19课：3D 场景资产工作流"
description: "掌握 3D 模型的加载、测量、场景变换配置、编辑器资产管线等完整工作流。"
---

# 第19课：3D 场景资产工作流

**本课目标**：掌握 3D 模型的加载、测量、场景变换配置、编辑器资产管线等完整工作流。

## 1. 支持的模型格式

| 格式 | 支持级别 | 加载 API | 单位 | 说明 |
| --- | --- | --- | --- | --- |
| USD (.usd/.usda/.usdc) | ⭐ 首选 | Entity.loadSuspend | 厘米 (cm) | 完整精度，推荐 |
| USDZ (.usdz) | ⭐ 首选 | Entity.loadSuspend | 厘米 (cm) | Apple 兼容格式 |
| glTF (.gltf/.glb) | ✅ 支持 | Entity.loadSuspend | 米 (m) | 广泛使用的开放格式 |
| OBJ (.obj) | ❌ 不直接支持 | — | — | 需转换为 USD/glTF |
| FBX (.fbx) | ❌ 不直接支持 | — | — | 需转换为 USD/glTF |

## 2. 模型加载方式

### 2.1 异步加载（推荐）

```kotlin
// 在 Compose SpatialView 中一次性加载
SpatialView(initial = { content, _ ->
  // loadSuspend 可在主线程调用
  val modelRoot = Entity.loadSuspend("asset://model.glb")
  // 将根实体添加到场景
  content.addEntity(modelRoot)
})

// 或使用 IO 线程
val modelRoot = withContext(Dispatchers.IO) {
  Entity.load("asset://model.glb")
}
content.addEntity(modelRoot)
```

> [!TIP]
> **✅ 重要规则**：
> - 加载完成后返回的是**根 Entity**，需要添加到场景中
> - 带有 Mesh 的子 Entity 自动拥有 `ModelComponent`
> - 所有子 Entity 自动拥有 `TransformComponent`
> - 千万不要在 `update` 回调中加载模型——那会每帧都加载

### 2.2 AssetBundle 加载

PICO Spatial Editor 制作的场景会导出为 `.bundle` 文件：

```kotlin
// 在 editor-asset 模块中构建 bundle
// editor-asset/src/main/res3d/ 目录下放置场景文件
// 构建后通过 asset:// URL 加载

val bundle = AssetBundle.load("asset://editor-asset.bundle")
// 获取场景中的实体
val sceneRoot = bundle.root
content.addEntity(sceneRoot)
```

## 3. 模型测量（计算包围盒）

> [!WARNING]
> **禁止猜测尺寸**：永远不要猜测 3D 模型的尺寸。必须使用测量工具。

使用 `calculate_bbox` 工具获取模型精确尺寸：

```bash
# 测量 glTF/GLB 模型（返回单位：米）
python calculate_bbox.py /path/to/model.glb

# 测量 USD/USDZ 模型（返回单位：厘米，需 /100 转米）
python calculate_bbox.py /path/to/model.usdz
```

输出示例：

```json
{
  "file": "sofa.glb",
  "format": "glb",
  "dimensions_meters": {
    "width": 2.0,
    "height": 0.8,
    "depth": 0.9
  },
  "center": [0, 0.4, 0]
}
```

## 4. 场景变换配置

### 4.1 上下文推理

在放置模型之前，先做常识推理：
- 这个场景是什么？（比如"客厅"）
- 每个物体的真实世界尺寸应该是多少？（沙发 ≈ 2m 宽，书 ≈ 0.3m 高）
- 物体之间的空间关系是什么？

### 4.2 变换计算三要素

| 变换 | 作用 | 计算方法 |
| --- | --- | --- |
| **Scale**（缩放） | 将模型原生尺寸调整到目标真实尺寸 | 目标尺寸 / 原生尺寸 |
| **Translation**（位移） | 确定物体在场景中的位置 | 相对于原点或父节点 |
| **Rotation**（旋转） | 确定物体的朝向 | 欧拉角（可读性好）或四元数 |

```kotlin
// 示例：将测量后的模型以正确尺寸和位置放入场景
// 已知：模型原生宽 0.5m，目标宽 2.0m -> scale = 4.0
// 位置：地面高度 0，x 轴偏移 1.0m

entity.transform.scale = Vector3(4.0f, 4.0f, 4.0f)
entity.transform.position = Vector3(1.0f, 0.0f, -1.5f)
```

### 4.3 scene_transforms.json 配置文件

推荐将所有场景变换配置集中在一个文件中，保存在 `.spatialsdk/scene_transforms.json`：

```json
{
  "scene_context": "客厅场景，包含沙发、茶几和地毯",
  "scene_dimensions": { "width": 5.0, "height": 3.0, "depth": 4.0 },
  "elements": [
    {
      "name": "sofa",
      "file": "models/sofa.glb",
      "original_bbox": { "width": 0.5, "height": 0.2, "depth": 0.23 },
      "transform": {
        "translation": [0.0, 0.0, -1.0],
        "rotation": [0.0, 0.0, 0.0],
        "scale": [4.0, 4.0, 4.0]
      },
      "final_size_meters": { "width": 2.0, "height": 0.8, "depth": 0.9 }
    },
    {
      "name": "table",
      "file": "models/table.glb",
      "original_bbox": { "width": 0.3, "height": 0.15, "depth": 0.3 },
      "transform": {
        "translation": [1.2, 0.0, -0.5],
        "rotation": [0.0, 0.0, 0.0],
        "scale": [2.0, 2.0, 2.0]
      }
    }
  ]
}
```

## 5. 坐标系统与单位转换

### 5.1 空间坐标对比

| 坐标空间 | 坐标系 | 单位 | 原点 |
| --- | --- | --- | --- |
| Stage / Entity / SpatialView | 右手系 (+X 右, +Y 上, +Z 向用户) | 米 (m) | 用户脚底 |
| Compose 2D 视图空间 | 左手系 (+Y 向下) | 虚拟像素 (dp/px) | 窗口左上角 |
| WindowContainer 窗口 | 混合 2D+3D | dp + 米 | 窗口自身 |

### 5.2 格式单位转换

```kotlin
// 模型文件单位
// USD/USDZ：厘米 (cm) -> 需 /100 转成米
// glTF/GLB：米 (m) -> 直接使用

// 示例：USDZ 模型原生尺寸 200cm -> 场景中应为 2m
val scale = 2.0f / 200.0f  // 缩放系数

// 单位转换 API（由 SDK 提供）
val meters = dpToMeters(100.dp)
val dp = metersToDp(1.5f)
```

### 5.3 跨容器变换转换

```kotlin
// 从 WindowContainer 到 Stage 的变换需要显式转换
// 包括：位置(position)、旋转(rotation)、缩放(scale)

// 声明源和目标
// sourceSpace = WindowContainer 的 2D 视图空间
// targetSpace = Stage 的 3D 世界空间
val worldTransform = convertToWorldSpace(localTransform, sourceContainer)
entity.transform.set(worldTransform)
```

> [!NOTE]
> **黄金法则**：每次进行空间变换时，用注释标明**源坐标空间**和**目标坐标空间**。这能避免大多数坐标相关 Bug。

## 6. PICO Spatial Editor 管线

对于复杂的 3D 场景，使用 PICO Spatial Editor 制作：

🎨 Spatial Editor (制作 3D 场景) → 📦 导出 Bundle (editor-asset 模块) → ⚙️ Gradle 构建 (将 bundle 打包进 APK) → 📱 运行时加载 (AssetBundle.load()) → 🖼️ 场景渲染 (content.addEntity())

项目结构：

```text
YourProject/
├── app/
│   └── src/main/assets/    <- bundle 打包到这里
└── editor-asset/            <- 编辑器项目
    ├── build.gradle.kts
    └── src/main/res3d/     <- 3D 资源源文件
```

```kotlin
// editor-asset/build.gradle.kts 配置
plugins {
    id("com.pico.spatial.editor-asset")
}

spatialEditor {
    // 编辑器版本与 SDK 版本匹配
    version.set("0.13.3")
}
```

## 7. 人体尺度参考

空间应用中，保持物体真实比例对沉浸感至关重要：

| 物体 | 真实世界尺寸 |
| --- | --- |
| 普通沙发 | 宽 1.8-2.2m × 深 0.8-1.0m × 高 0.7-0.9m |
| 咖啡桌 | 宽 0.9-1.2m × 深 0.5-0.6m × 高 0.4-0.5m |
| 书架 | 宽 0.6-0.9m × 深 0.3-0.4m × 高 1.8-2.4m |
| 电视/显示器 | 对角线 0.5-1.5m（约 24-60 英寸） |
| 椅子 | 宽 0.5-0.6m × 深 0.5-0.6m × 高 0.8-1.0m |
| 人 | 身高 1.6-1.8m |

---

> [!INFO]
> PICO Spatial SDK 0.13.3 · 参考 demo：`PICOProject/coordinates-2d-spatial-0.13.3/` · [[0018-performance-diagnosis|第18课：性能诊断]] · [[0020-spatial-ui-design-guide|第20课：UI 设计规范]]

---
**上一课**: [[0018-performance-diagnosis|第18课：性能诊断]] | **下一课**: [[0020-spatial-ui-design-guide|第20课：UI 设计规范]]