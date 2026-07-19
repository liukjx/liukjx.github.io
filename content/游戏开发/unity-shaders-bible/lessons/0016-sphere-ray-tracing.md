---
title: "第16课：Sphere Tracing 与 Ray Tracing"
tags: [unity, shader, rendering]
lesson: 16
type: lesson
---

# 第16课：Sphere Tracing 与 Ray Tracing

教材对照：*The Unity Shaders Bible* 第11章 (p. 331–352) 与第12章 (p. 353–363)

## 16.1 概述：光线追踪家族

Sphere Tracing（球体追踪，也称 Ray Marching / Sphere Casting）和 Ray Tracing（光线追踪）属于同一技术家族——它们都通过**发射光线**来渲染场景。两者的核心三步骤完全一致：

1. **Ray Generation（光线生成）**：确定光线的起点（摄像机位置）和方向。
2. **Ray Intersection（光线求交）**：计算光线与物体的交点。
3. **Shading（着色）**：在交点处计算光照、阴影和材质。

> [!info] **核心关系** **Sphere Tracing 是 Ray Tracing 的一种特殊形式**。两者都基于光线投射（Ray Casting）原理，但 Sphere Tracing 使用迭代的"步进"方法逼近隐式曲面，而现代 Ray Tracing（DXR / RTX）通过硬件加速的 BVH 遍历来精确计算光线与三角形网格的交点。

| 对比维度 | Sphere Tracing (Ray Marching) | Ray Tracing (DXR / RTX) |
| --- | --- | --- |
| **表面表示** | 隐式曲面（SDF，Signed Distance Functions） | 显式几何（三角形网格） |
| **求交方法** | 迭代步进（Marching），沿着光线逐步前进 | BVH 加速结构，精确求交 |
| **硬件要求** | 任何支持 Fragment Shader 的 GPU 即可 | 需要 RT Core 硬件加速（NVIDIA 20 系列+） |
| **API 支持** | 纯 HLSL/Cg 实现 | 需要 DirectX 12 + DXR |
| **实时性能** | 中等（取决于步进次数） | 高（硬光追加速） |
| **适用场景** | 体积渲染、程序化几何、特殊效果 | 真实感渲染、反射/折射、全局光照 |

## 16.2 Sphere Tracing 的基本原理

根据 John C. Hart 在 *The Visual Computer* (1995) 中的定义：

> [!info] "Sphere Tracing 是一种使用几何距离来渲染隐式表面的技术。"

基本流程如下：

1. 从摄像机出发，沿像素方向射出一条光线。
2. 在光线上采样点 **p**，计算该点到最近表面的距离（通过 SDF）。
3. 如果距离 > 阈值（表面精度），则沿光线方向向前"步进"该距离。
4. 重复步骤 2-3，直到距离 < 阈值（命中表面）或超出最大距离（未命中）。

#### SDF（Signed Distance Function）

SDF 接受一个空间点作为输入，返回该点到某个表面的**最短带符号距离**：

- **正值**：点在表面外部，光线继续前进。
- **零或负值**：点在表面内部或表面上，光线击中。

## 16.3 实现 SDF（Signed Distance Functions）

### 16.3.1 球体的 SDF

等式 `x² + y² + z² - 1 = 0` 是球体的隐式方程。写成向量形式即为 `||p|| - 1 = 0`。

### 16.3.2 平面的 SDF

平面 SDF 是最简单的 SDF——只需返回点到平面的带符号垂直距离。

### 16.3.3 Sphere Casting 函数

> [!tip] **常量说明**
>   - `MAX_MARCHING_STEPS (50)`：最大步进次数，防止无限循环。步数越多，越能发现细小表面，但性能开销也越大。
>   - `MAX_DISTANCE (10.0)`：最大可见距离，远处的物体不渲染。
>   - `SURFACE_DISTANCE (0.001)`：表面精度容差。值越小，表面越精确，但需要的步数越多。

### 16.3.4 实战：切片水果效果（Sliced-Fruit）

在 Unity 中实现一个"切片水果"效果——使用 SDF 平面分割球体：

关键点：

- 使用 `Cull Off` 显示球体双面。
- `SV_isFrontFace` 语义区分正面和背面片段。
- 背面显示 SDF 平面的位置（p 的颜色），正面显示正常纹理。

## 16.4 纹理投影

在 SDF 平面上投影纹理，需要考虑平面的朝向和 UV 坐标：

> [!tip] **投影数学** 使用 `p.xz` 作为 UV 坐标是因为平面法线朝向 Y 轴方向，因此纹理投影在 XZ 平面上。减去 0.5 是为了将原点从网格中心对齐到平面中心。动态缩放公式 `l = (-|_Edge|)² + (-|_Edge| - 1)²` 确保纹理大小随边缘位置平滑变化。

## 16.5 Smooth Minimum（平滑融合）

在构造实体几何（CSG，Constructive Solid Geometry）中，`min(a, b)` 可以实现两个 SDF 形状的**并集**。但普通的 min 会在连接处产生尖锐的棱角。

Íñigo Quilez（著名图形学专家）提出了 **polynomial smooth minimum**（多项式平滑最小值）函数，使两个曲面能够**平滑融合**：

使用方法：

> [!note]
> `_K` 参数控制融合的平滑程度：值越大，两个曲面之间的过渡越平滑柔和；值越小（接近 0），行为越接近普通的 `min()`，产生尖锐的连接线。

| CSG 操作 | 函数 | 说明 |
| --- | --- | --- |
| 并集（Union） | `min(a, b)` | 两个形状合并 |
| 交集（Intersection） | `max(a, b)` | 保留两个形状重叠部分 |
| 差集（Subtraction） | `max(a, -b)` | 从 a 中减去 b 的部分 |
| 平滑并集 | `smin(a, b, k)` | 并集 + 平滑过渡 |

## 16.6 Ray Tracing 在 HDRP 中的配置

现代 Ray Tracing（通过 DXR / RTX）在 Unity 中需要 **High Definition RP（HDRP）** 支持，配置过程分三个主要步骤：

### 16.6.1 硬件与系统要求

- Windows 10 版本 1809+
- DirectX 12
- NVIDIA 20 系列+（RTX 2060, 2070, 2080 及 Ti 型号）
- NVIDIA Turing 和 Pascal（GTX 1060+）架构也支持，但性能受限

### 16.6.2 配置步骤

**第一步：Render Pipeline Asset**

1. 找到项目中的 HD Render Pipeline Asset（不同质量级别可能有不同的 Asset）。
2. 在 Inspector 的 **Rendering** 菜单中，启用 **Realtime Ray Tracing (Preview)**。
3. 在 **Lighting** 菜单中启用：

**第二步：Project Settings**

1. 进入 *Windows / Panels / Project Settings*。
2. 在 **HDRP Default Settings** 中，确保 Ray Tracing 已启用。
3. 在 **Quality** 中，为每个质量级别的 Render Pipeline Asset 启用 Ray Tracing。

**第三步：DirectX 12 配置**

1. 进入 *Windows / Render Pipeline / HD Render Pipeline Wizard*。
2. 在 **DirectX Raytracing (HDRP + DXR)** 选项卡中点击 **Fix All**。
3. 重启 Unity，界面标题栏会显示 `<DX12>` 标签。

> [!warning] **关键约束** Ray Tracing **只支持 DirectX 12**。如果你的项目配置为 DX11，即便其他设置正确也无法启用 Ray Tracing。需要先通过 HD Render Pipeline Wizard 完成 DX12 切换。

## 16.7 在场景中使用 Ray Tracing

### 16.7.1 默认反射 vs. 光线追踪反射

配置完成后，在材质中增加 **Metallic**（金属度）和 **Smoothness**（光滑度）即可看到实时反射。但默认（Screen Space）反射依赖于摄像机的视角，会产生图形伪影。

要启用真正的光线追踪反射：

1. 选择场景中的 **Sky and Fog Volume** 对象。
2. 找到其 Volume 组件，点击 **Add Override**。
3. 选择 *Lighting / Screen Space Reflection*。
4. 启用 **Ray Tracing (Preview)**。
5. 调整 **Bounce Count** 参数控制光线反弹次数。

相同的流程也适用于：

- **Screen Space Global Illumination**：实时全局光照，光线多次反弹模拟间接光照。
- **Screen Space Ambient Occlusion**：环境光遮蔽，模拟角落和缝隙的暗部。
- **Screen Space Shadows**：从光源方向投射光线，生成精确的阴影。

### 16.7.2 光线追踪阴影

对于场景中的定向光（Sun）：

1. 选择定向光对象。
2. 在 Shadows 菜单中启用 **Screen Space Shadows**。
3. 勾选 **Ray Traced Shadows (Preview)**。
4. 通过 **Shape / Angular Diameter** 调整阴影柔化程度。

## 16.8 Sphere Tracing vs Ray Tracing：区别与联系

> [!info] **本质上的统一** 无论是 Sphere Tracing 还是 Ray Tracing，核心都是**光线投射（Ray Casting）**——从摄像机出发，为每个像素计算一条光线，找到场景中最近的交点，然后进行着色。两者的根本区别在于"如何找到交点"。

| 方面 | Sphere Tracing | Ray Tracing (DXR) |
| --- | --- | --- |
| **求交算法** | 迭代逼近（步进），每步前进 SDF 距离 | 通过 BVH（Bounding Volume Hierarchy）加速结构精确求交 |
| **几何表示** | 隐式曲面（数学公式定义） | 显式三角形网格 |
| **硬件依赖** | 无特殊要求，纯 Shader 计算 | 需要 RT Core（NVIDIA RTX 系列）或 DXR 支持 |
| **精度** | 取决于步进次数和 SURFACE_DISTANCE 阈值 | 理论上精确（与三角形精确求交） |
| **复杂场景** | 步进次数随场景复杂度线性增长 | BVH 加速，适合复杂网格场景 |
| **体积渲染** | 天然适合（云、雾、流体等半透明体积） | 需要额外实现（Volumetric Fog 等） |
| **着色模型** | 通常在 SDF 交点手动计算法线和光照 | 支持完整的光照模型，包括多次反射、折射 |

### 16.8.1 如何选择？

- **使用 Sphere Tracing 当**：你需要渲染程序化几何体（分形、数学曲面）、体积效果（云、烟雾），或者不能依赖硬件光线追踪加速（移动端、低端 PC）。
- **使用 Ray Tracing 当**：你需要真实的反射/折射/全局光照，场景主要由三角形网格构成，并且目标平台支持 DXR（高端 PC、主机）。
- **混合使用**：两者可以共存。例如，在 HDRP 中用 Ray Tracing 处理场景光照，同时在自定义 Pass 中用 Sphere Tracing 渲染体积雾或程序化特效。

## 16.9 教材对照

| 教材章节 | 页码 | 内容 |
| --- | --- | --- |
| 第11章引言 | p. 331–333 | Sphere Tracing 原理 |
| 11.0.1 | p. 333–342 | 实现 Sphere Tracing 函数 |
| 11.0.2 | p. 342–348 | 纹理投影 |
| 11.0.3 | p. 348–352 | Smooth Minimum（平滑融合） |
| 第12章引言 | p. 353–354 | Ray Tracing 概念 |
| 12.0.1 | p. 354–361 | HDRP 中配置 Ray Tracing |
| 12.0.2 | p. 361–363 | 在场景中使用 Ray Tracing |

## 16.10 练习与回顾

### 思考题

1. 解释 Sphere Tracing 中"步进"（Marching）的核心思想。为什么每次步进的距离可以设为 SDF 的返回值？
2. SDF 返回值的正负分别表示什么？`SURFACE_DISTANCE` 常量的作用是什么？
3. 对比 CSG 中的并集（Union）、交集（Intersection）和差集（Subtraction）操作，它们在 SDF 中如何实现？
4. 什么是 `SV_isFrontFace` 语义？在切片水果效果中它的作用是什么？
5. 为什么 Ray Tracing 需要 DirectX 12 和特定的 NVIDIA 显卡？"光线追踪"和"光栅化"在渲染流程中的根本区别是什么？

### 实践练习

1. **基础练习**：创建一个 Unlit Shader，在 Quad 上实现两个圆的 SDF，并使用 `smin()` 函数实现平滑融合效果。
2. **进阶练习**：实现一个简单的 SDF 场景——一个球体放在一个平面上，使用 Sphere Tracing 渲染，并计算简单的漫反射光照（提示：SDF 梯度求法线）。
3. **挑战练习**：实现一个 Fractal（分形）的 Sphere Tracing 渲染，如 Mandelbulb 或 Julia Set。在 Unity 中调整分形的迭代深度观察细节变化。