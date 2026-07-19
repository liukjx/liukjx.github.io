---
title: "第12课：Standard Surface Shader 与 PBR"
tags: [unity, shader, rendering]
lesson: 12
type: lesson
---

# 第12课：Standard Surface Shader 与 PBR

教材对照：*The Unity Shaders Bible* 第七章 7.0.7 — 7.0.8

## 12.1 Standard Surface Shader 的结构

前两课我们使用 **Unlit Shader** 一步步构建了 Lambert 漫反射、Blinn-Phong 高光、环境反射等光照计算。 虽然这有助于理解原理，但在实际项目中重复实现这些基本光照是不必要的。

Unity 提供了 **Surface Shader** 这一抽象层，它**自动处理光照交互**， 将复杂的逐像素光照计算封装在内部。开发者只需要在 `surf()` 函数中设置表面属性即可。

### 12.1.1 Surface Shader 的骨架

> [!info] **Surface Shader 的自动生成** 编写 Surface Shader 时，我们并没有编写 Vertex Shader 和 Fragment Shader——Unity 的编译系统会根据`#pragma surface surf Standard` 指令自动生成完整的 vertex/fragment shader 代码，
  包括 Pass 定义、光照计算、阴影处理等。

### 12.1.2 #pragma surface 指令详解

| 参数 | 可选值 | 说明 |
| --- | --- | --- |
| surfaceFunction | `surf`（可自定义名称） | 表面函数的名称 |
| lightingModel | `Standard` / `StandardSpecular` / 自定义 | 使用的光照模型 |
| lightingModel | `fullforwardshadows` / `addshadow` | 阴影选项 |
| lightingModel | `vertex:vertFunction` | 自定义顶点修改函数 |
| lightingModel | `finalcolor:colorFunction` | 最终颜色修改函数 |

## 12.2 SurfaceOutput 结构体

Surface Shader 的核心在于 `SurfaceOutputStandard` 结构体，它定义了**表面材质的所有属性**。 Unity 提供了两种预定义版本：

### 12.2.1 SurfaceOutputStandard（金属工作流）

### 12.2.2 SurfaceOutputStandardSpecular（高光工作流）

### 12.2.3 Input 结构体

与 SurfaceOutput 对应的是 `Input` 结构体，它定义了 surf 函数的输入数据。 不同于 Unlit Shader 中的 `appdata`，Input 使用**预定义的属性名**来启用特定功能：

> [!tip] **Input vs appdata** appdata 使用 POSITION、NORMAL、TANGENT 等语义声明顶点数据；而 Input 使用语义化的变量名，
  Unity 编译系统自动将顶点数据映射到对应的 Input 成员。例如`viewDir` 会自动计算`_WorldSpaceCameraPos - worldPos` ，无需手动编写。

## 12.3 PBR（基于物理渲染）的核心概念

**PBR（Physically Based Rendering）**是现代游戏引擎的标准渲染方法。 与上一课中基于经验模型的 Blinn-Phong / Lambert 不同，PBR 基于**真实的物理规律** 来描述光与表面的交互。

### 12.3.1 金属度（Metallic）vs 高光（Specular）工作流

PBR 有两种常见的工作流，Unity 的 Standard Shader 同时支持两者：

| 对比维度 | 金属工作流（Metallic） | 高光工作流（Specular） |
| --- | --- | --- |
| 核心属性 | Albedo + Metallic + Smoothness | Albedo + Specular Color + Smoothness |
| 参数数量 | 3 个 | 3 个（Specular 是颜色而非标量） |
| 物理原理 | 基于金属/非金属的 F0（法线入射反射率） | 直接指定高光颜色 |
| 非金属材质 | Metallic = 0，F0 ≈ 0.04（灰色） | Specular ≈ 灰度值（4% 反射率） |
| 金属材质 | Metallic = 1，F0 来自 Albedo | Specular = 金属的颜色（金、银等） |
| 易用性 | **更常用**，参数直观 | 更灵活，但需要手动调整 |

> [!info] **F0（法线入射反射率）** 在 PBR 中，所有材质的反射率从"垂直观察"时的值（F0）开始：
>   - **非金属**（绝缘体）：F0 ≈ 0.02 — 0.05（如：水 0.02，玻璃 0.04，钻石 0.17）
>   - **金属**（导体）：F0 ≈ 0.5 — 1.0（如：铁 0.56，金 0.71，银 0.95）
> 金属工作流自动处理了 F0——将非金属的 F0 固定为 0.04，金属的 F0 从 Albedo 中提取。
  这是它比高光工作流更"物理"的原因。

### 12.3.2 粗糙度（Roughness）与光滑度（Smoothness）

**Smoothness** 是粗糙度的反义词：

- **Smoothness = 1.0**（Roughness = 0.0）：完美镜面，高光极其集中锐利
- **Smoothness = 0.0**（Roughness = 1.0）：完全粗糙，高光扩散到几乎不可见（如沙纸）

在 Unity Standard Shader 中，Smoothness 对高光的影响通过**法线分布函数（NDF）**实现， 具体使用 **GGX / Trowbridge-Reitz** 分布（这是比 Blinn-Phong 更物理的分布函数）：

#### GGX 法线分布函数

D(h) = α² / (π × ( (n·h)² × (α² − 1) + 1 )²)

其中 α = roughness²（粗糙度的平方），控制微表面法线的分布宽度

α 越小（越光滑），高光越集中；α 越大（越粗糙），高光越分散

### 12.3.3 能量守恒

PBR 最重要的原则是**能量守恒（Energy Conservation）**：**出射光的总能量 ≤ 入射光的总能量**。 具体表现为：

- **反射 + 折射 ≤ 1**：光要么被反射，要么被吸收/折射，总和不会超过 100%
- **光滑度影响分布而非总量**：光滑表面的高光更集中但总量不变，粗糙表面的高光更分散但总量同样不变
- **金属吸收折射光**：金属的高光反射率很高，且完全吸收折射光（金属没有漫反射——Albedo = 0 当 Metallic = 1）

在 Unity Standard Shader 中，能量守恒通过**Cook-Torrance BRDF** 自动保证， 它包含三个部分：

| BRDF 分量 | 物理意义 | 对应函数 |
| --- | --- | --- |
| D（法线分布函数） | 微表面法线的统计分布 | GGX / Beckmann |
| F（Fresnel 函数） | 视角相关的反射率 | Schlick 近似 |
| G（几何遮蔽函数） | 微表面之间的自遮挡 | Smith / Schlick-GGX |

## 12.4 Unity 标准着色器的输入与输出

### 12.4.1 Properties 映射到 SurfaceOutput

一个完整的 Standard Surface Shader 通常包含以下属性映射：

> [!tip] **Surface Shader 自动处理的功能**
>   - **光照计算**：自动生成多个 Pass（ForwardBase、ForwardAdd、Deferred 等）
>   - **阴影**：fullforwardshadows 自动添加 Shadow Caster Pass
>   - **全局光照**：自动与 Light Probe、Reflection Probe 交互
>   - **雾效**：自动应用 Unity 的 Fog 设置

## 12.5 从自定义光照 Shader 过渡到 PBR Shader

在第11课中，我们手动实现了 Lambert + Blinn-Phong。下面是向 PBR 过渡的关键差异：

| 方面 | Blinn-Phong（经验模型） | Standard / PBR | 改进原因 |
| --- | --- | --- | --- |
| 漫反射 | Lambert: max(0, n·l) | 迪士尼漫反射或 Lambert 改进 | PBR 漫反射考虑粗糙度和能量守恒 |
| 高光 | (n·h)p | GGX / Cook-Torrance | GGX 高光拖尾更真实，"光晕"更柔和 |
| Fresnel | F = (1−n·e)power | Schlick 近似: F(θ) = F0 + (1−F0)(1−cosθ)5 | 基于真实物理测量数据 |
| 高光指数 | 无物理意义，凭感觉调 | roughness 有物理对应值 | 粗糙度可以通过仪器测量 |
| 能量守恒 | 不保证 | 严格保证 | 出射光不会超过入射光 |
| 参数调整 | 需要艺术家经验 | 基于真实材质参数 | 可参考真实世界材质数据库 |

### 12.5.1 什么时候还用自定义光照？

> [!warning] **注意** Surface Shader 只能在**Built-in Render Pipeline** 中使用。
  在**Universal RP** 或**HDRP** 中，需要使用 Shader Graph 或手写 HLSL。
  此外，Surface Shader 的自动化特性在需要高性能优化时反而可能是限制——手写 vertex/fragment shader
  可以精确控制指令数量。

## 12.6 跨引擎通用的 PBR

PBR 的概念和技术在所有现代引擎中基本一致：

> [!note]
> - **Unreal Engine**：基于 Cook-Torrance BRDF，使用 GGX 高光 + Schlick Fresnel + Smith 几何遮蔽。材质参数为 BaseColor、Roughness、Metallic、Specular。
> - **Unity (Standard)**：同样基于 Cook-Torrance BRDF，GGX 高光 + Schlick Fresnel，使用 Albedo、Metallic、Smoothness。
> - **Filament (Google)**：Google 的开源 PBR 引擎，文档极佳，所有公式公开。
> - **Three.js (MeshStandardMaterial)**：同样的 PBR 参数集。
> - **Blender**：Principled BSDF 基于迪士尼 PBR 模型。
> 差异仅在于具体实现和参数命名，底层的物理原理完全相同。

## 练习与回顾

1. **概念对比**：SurfaceOutputStandard 中的 Metallic 和 SurfaceOutputStandardSpecular 中的 Specular 有何本质区别？何时选择哪种工作流？
2. **数据分析**：查找常见材质（塑料、木材、铁、金、玻璃）的 F0 值，并验证为什么金属工作流中非金属的 F0 可以近似为 0.04。
3. **代码分析**：在 Surface Shader 的 Input 结构体中，为什么 viewDir、worldPos 等成员不需要在 appdata 中声明语义？它们是如何被赋值的？
4. **数学推导**：Schlick Fresnel 近似公式 F(θ) = F0 + (1−F0)(1−cosθ)⁵ 在 θ = 0° 和 θ = 90° 时的值分别是多少？验证这个公式是否正确描述了 Fresnel 效应。
5. **工程思考**：假设你需要为移动平台创建一个性能优化的 Shader，你会选择 Surface Shader 还是手写 Vertex/Fragment Shader？为什么？
6. **扩展阅读**：了解 Disney Principled BRDF 的提出背景，以及它为什么成为行业标准 PBR 的基础。

---

**教材对照**：*The Unity Shaders Bible* Chapter II, Section 7.0.7—7.0.8 (Pages 246-251)