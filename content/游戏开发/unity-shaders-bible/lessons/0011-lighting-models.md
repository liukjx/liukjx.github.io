---
title: "第11课：光照模型（Lighting Models）"
tags: [unity, shader, rendering]
lesson: 11
type: lesson
---

# 第11课：光照模型（Lighting Models）

教材对照：*The Unity Shaders Bible* 第七章 7.0.1 — 7.0.6

## 11.1 光照模型的概念

**光照模型（Lighting Model）**是计算机图形学中描述**光与表面相互作用**的数学近似。 它定义了给定光源属性（颜色、强度、方向等）和材质属性（颜色、粗糙度、金属度等）后， 表面上一点应该呈现的最终颜色。

> [!info] **光照模型 = 表面 + 光源 + 观察者** 一个完整的光照模型通常考虑三个因素：
>   1. **光源**：光的颜色、强度、方向、衰减
>   2. **表面**：材质属性（漫反射色、高光色、粗糙度、法线等）
>   3. **观察者**：视角方向——不同角度看到的效果不同

光照模型是**跨引擎通用**的概念。无论是 Unity、Unreal、Godot 还是 Blender， 其渲染管线的核心都是光照模型的计算。差异仅在于具体实现 API 和预设的便捷程度。

### 11.1.1 逐顶点光照（Per-Vertex Lighting）vs 逐像素光照（Per-Pixel Lighting）

| 对比维度 | 逐顶点光照（Gouraud Shading） | 逐像素光照（Phong Shading） |
| --- | --- | --- |
| 计算位置 | Vertex Shader 中计算，像素间插值 | Fragment Shader 中每个像素独立计算 |
| 性能 | **高**（计算量少，仅对顶点计算） | 较低（每个像素都需要计算） |
| 质量 | 较低（高光容易出现锯齿/马赫带） | **高**（细节丰富，高光平滑） |
| 高光质量 | 高光可能走样，或完全丢失 | 高光精确到每个像素 |
| 适用场景 | 移动端/低端设备、无关紧要的物体 | 主要物体、角色、高质量场景 |

> [!tip] **经验法则** 现代硬件上，除非是极低端设备或特殊优化，否则都应使用逐像素光照。
  在 Unity 中，Surface Shader 默认就是逐像素光照。

## 11.2 环境光（Ambient Color）

在真实世界中，物体表面除了直接接收光源的照射外，还会接收到来自周围环境反射的**间接光照**。 例如一面白墙旁边的红色物体，其暗面会略带红色——这是光线从白墙反射到物体的结果。

**环境光（Ambient Color）**正是用来近似这种间接光照的。它为一个物体的所有表面提供一个**基础照明**， 确保背光面不至于完全漆黑。

> [!info] **环境光 ≠ 真实全局光照** 传统的环境光模型仅仅是添加一个**常数颜色值** 到所有像素上，不区分方向。
  这是一种粗糙的近似。更真实的方案是使用**IBL（Image-Based Lighting）** 或**GI（Global Illumination）** ，
  如 Unity 的 Light Probe 系统和 Enlighten / GPU Lightmapper。

在 Unity 中，环境光通过 `UNITY_LIGHTMODEL_AMBIENT` 变量访问，在 Shader 中使用方式如下：

在 Unity 编辑器中，环境光通过 **Window / Rendering / Lighting → Environment** 面板配置， 可以选择 **Color**、**Gradient** 或 **Skybox** 作为环境光源。

## 11.3 漫反射（Diffuse Reflection）—— Lambert 模型

### 11.3.1 Lambert 余弦定律

**漫反射**是指光线照射到粗糙表面后向各个方向**均匀反射**的现象。 无论视角如何变化，漫反射表面的亮度看起来都是相同的——这是因为表面微表面将光均匀散射到所有方向。

**Johann Heinrich Lambert** 在 1760 年提出了**Lambert 余弦定律（Lambert's Cosine Law）**， 定义了漫反射的计算方式：

#### Lambert 漫反射模型

D = Dr × Dl × max(0, **n** · **l**)

其中：

- D = 最终漫反射颜色
- Dr = 漫反射颜色（材质颜色 × 光源颜色）
- Dl = 光源强度
- **n** = 表面法线（归一化）
- **l** = 光照方向（归一化，指向光源）
- max(0, n·l) = 点积取正值，模拟"光照不到的地方就是暗的"

### 11.3.2 Shader 实现

> [!note]
> **跨引擎通用性**：Lambert 模型是所有 3D 软件和引擎的基础。
> - Autodesk Maya：Lambert 材质
> - Blender：原理化 BSDF 中的 Diffuse 分量
> - Unreal Engine：Lambert 是 Default Lit 的漫反射基础
> - Three.js：MeshLambertMaterial

## 11.4 高光反射（Specular Reflection）—— Blinn-Phong 模型

### 11.4.1 Phong 与 Blinn-Phong

**高光反射**描述了光滑表面上的**镜面高光**——当光源方向与视角方向满足反射关系时， 表面会出现明亮的光斑。Bui Tuong Phong 在 1975 年提出了经典的 Phong 反射模型。

后来 **Blinn-Phong 模型**（Jim Blinn 对 Phong 的改进）被更广泛地使用。 两者的核心区别在于：Phong 使用反射向量与视角方向的点积，而 Blinn-Phong 使用**半程向量（Halfway Vector）** 与法线的点积。

#### Blinn-Phong 高光模型

S = Sa × Sp × max(0, **n** · **h**)specularPow

半程向量 h：

**h** = normalize(**l** + **e**)

其中：

- Sa = 高光颜色（光源颜色 × 高光贴图）
- Sp = 高光强度
- **n** = 表面法线
- **h** = 半程向量（光照方向 + 视线方向的归一化）
- **l** = 光照方向
- **e** = 视线方向（从表面指向相机）
- specularPow = 高光指数（范围 1-128，越大高光越集中）

### 11.4.2 为什么用半程向量？

Phong 模型中，高光依赖于 **反射向量 r** 和 **视线方向 e** 的夹角。 而计算反射向量 r 需要额外的数学运算。Blinn-Phong 使用 h = normalize(l + e)， 这个向量表示"最能使光线反射到视线的法线方向"——当 n 与 h 对齐时，高光最强。

Blinn-Phong 的优势：

- **计算更高效**：半程向量计算比反射向量更简单
- **效果更好**：在大多数情况下，Blinn-Phong 的高光形状更符合物理
- **仍然是近似**：但它是 Phong 模型的显著改进

### 11.4.3 Shader 实现

> [!tip] **注意** 漫反射使用乘法`col.rgb *= diffuse` ，而高光使用加法`col.rgb += specular` 。
  这是物理正确的：漫反射是表面吸收并重新发射的光（减法混合），高光是表面直接反射的光（加法混合）。

## 11.5 环境反射（Environmental Reflection）—— 立方体贴图

**环境反射**使用 **Cubemap（立方体贴图）**来模拟物体对周围环境的反射。 与高光反射不同——高光只反射主光源，环境反射反射**整个环境**中的光线。

### 11.5.1 反射计算原理

计算环境反射的核心是 **reflect 函数**，它根据法线和视线方向计算出射方向：

#### 反射向量计算

reflect(**i**, **n**) = **i** − 2 × **n** × dot(**n**, **i**)

其中 i 是入射方向（指向物体），n 是法线方向

### 11.5.2 Unity 中的快捷方法

Unity 提供了更简便的方式获取环境反射——使用 `UNITY_SAMPLE_TEXCUBE` 宏， 它会自动采样场景中 Reflection Probe 的立方体贴图：

## 11.6 Fresnel 效应（菲涅尔效应）

### 11.6.1 现象与原理

法国物理学家 **Augustin Jean Fresnel** 发现：**反射率随视角变化**。 具体来说：

- 当视线**垂直**于表面时（法线 ≈ 视线），反射最弱，透射最强
- 当视线**掠射**表面时（视线与表面夹角很小），反射最强

现实中很容易观察到：站在湖边低头看脚下——水是透明的，可以看到水底的石头； 但往远处看——水面像镜子一样反射天空。这就是 Fresnel 效应。

> [!info] **Fresnel 效应在渲染中的重要性** 在 PBR 中，Fresnel 效应通过 **Schlick 近似** 实现，它是金属质感的关键。 所有导体（金属）在掠射角都有接近 100% 的反射率，这正是金属表面"闪闪发光"的原因之一。

### 11.6.2 Shader Graph 中的 Fresnel 公式

#### Fresnel 效应函数（Unity Shader Graph）

Out = pow((1 − saturate(dot(**n**, **e**))), *power*)

其中：

- **n** = 法线方向
- **e** = 视线方向
- saturate 将值限制在 [0, 1] 区间
- `1 − x` 反转结果（平行时反射为 0）
- power 控制衰减速度

具体分析：当法线与视线**平行**时（dot = 1），`1 - 1 = 0`，Fresnel 为黑色； 当法线与视线**垂直**时（dot = 0），`1 - 0 = 1`，Fresnel 为白色。

### 11.6.3 Shader 实现

## 11.7 光照模型公式速查

| 光照分量 | 公式 | 输入 | 特点 |
| --- | --- | --- | --- |
| 环境光 | ambient = globalAmbient × intensity | 全局环境颜色、强度 | 最简单的近似，无方向性 |
| Lambert 漫反射 | D = Dr × Dl × max(0, n·l) | 法线 n、光照方向 l | 各向同性，视角独立 |
| Blinn-Phong 高光 | S = Sa × Sp × (n·h)p | 法线 n、半程向量 h、指数 p | 视角相关，光滑表面 |
| 环境反射 | R = texCUBE(reflDir) × intensity | 视线 e、法线 n、Cubemap | 反射周围环境 |
| Fresnel 效应 | F = (1 − n·e)power | 法线 n、视线 e、指数 power | 视角相关，掠射角反射最强 |

## 11.8 跨引擎光照模型对比

> [!note]
> 这些光照模型并非 Unity 专有——它们是整个计算机图形学的共同遗产：
> - **Unreal Engine**：其光照模型基于 Cook-Torrance BRDF（PBR），但本质仍包含漫反射（Lambert）和高光（GGX），Fresnel 通过 Schlick 近似实现。
> - **Godot**：StandardMaterial3D 同样基于 Lambert 漫反射 + Blinn-Phong 高光，4.0 后引入 PBR。
> - **Three.js**：MeshPhongMaterial 实现了 Blinn-Phong 高光。
> - **Blender**：原理化 BSDF 的着色器节点中包含 Diffuse（Lambert）和 Glossy（GGX）分量。
> - **DirectX SDK / Vulkan Samples**：所有光照模型从底层 shader 实现，与 Unity 无本质区别。
> 理解了 Unity 中的 Blinn-Phong，你在任何引擎中都能快速上手其高光实现。

## 练习与回顾

1. **数学分析**：Lambert 模型中 `max(0, n·l)` 的取值范围是什么？当 n·l 为负数时意味着什么？
2. **对比思考**：Blinn-Phong 使用半程向量 h 替代了 Phong 模型中的反射向量 r。请推导 h = normalize(l + e) 的计算过程，并说明为什么它比反射向量更高效。
3. **代码修改**：在 Fresnel 函数中，如果去掉 `1 - x` 这一步，直接使用 `saturate(dot(normal, viewDir))` 作为输出，效果会变成什么样？
4. **效果预测**：在 Blinn-Phong 中，当 specularPow = 1 和 specularPow = 128 时，高光形状有何不同？哪种情况下高光范围更广？
5. **性能分析**：逐顶点光照中，高光反射可能会出现什么问题？为什么逐像素光照在高光计算中效果更好？
6. **扩展思考**：环境反射使用 Cubemap 有什么局限性？为什么 PBR 中引入了 IBL（Image-Based Lighting）来解决这个问题？

---

**教材对照**：*The Unity Shaders Bible* Chapter II, Section 7.0.1—7.0.6 (Pages 203-246)