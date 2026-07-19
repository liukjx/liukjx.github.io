---
title: "着色器类型与结构：Shader 是什么？"
tags: [unity, shader, rendering]
type: lesson
---

# 着色器类型与结构：Shader 是什么？

> [!info] **教材对照** 本课对应The Unity Shaders Bible 第 2.0.1 – 2.0.8 节（第 33–38 页）。涵盖着色器的基本定义、Unity 中的着色器文件类型以及五大着色器类型的对比。

## 2.1 什么是着色器（Shader）？

着色器（Shader）是一段运行在**图形处理器（GPU）**上的小型程序。它的核心任务是将三维物体的信息转化为屏幕上二维像素的颜色。虽然每段着色器代码通常很短，但它在现代实时渲染中扮演着至关重要的角色。

### 2.1.1 CPU 与 GPU 的分工

要理解着色器，首先要理解 CPU 与 GPU 的本质区别：

| 特性 | CPU（中央处理器） | GPU（图形处理器） |
| --- | --- | --- |
| 设计目标 | 串行顺序处理 | 大规模并行计算 |
| 核心数 | 4–16 个高性能核心 | 数千个小而高效的核心 |
| 擅长任务 | 逻辑分支、复杂控制流 | 大量相同运算并行执行 |
| 着色器运行 | 不运行着色器 | 每个核心并行处理一个顶点/像素 |

> [!tip] **跨引擎通用概念** 无论你使用 Unity、Unreal Engine 还是 Godot，"着色器是运行在 GPU 上的小程序"这一原理完全通用。GPU 的并行架构是所有现代图形 API（Direct3D、Vulkan、Metal、OpenGL）的基础。

### 2.1.2 着色器的工作流程

一个典型的着色器程序遵循以下处理流程：

3D 顶点数据

→

顶点着色器

→

光栅化

→

片元着色器

→

输出到帧缓冲

**顶点着色器（Vertex Shader）**：逐顶点执行，负责将顶点从模型空间变换到裁剪空间。**片元着色器（Fragment Shader）**：逐像素执行，决定每个像素的最终颜色。两者都是**可编程阶段**——这正是着色器编程的核心所在。

## 2.2 Unity 中的着色器文件类型

在 Unity 中，着色器以不同的文件扩展名存在，每种扩展名服务于不同的用途。

| 扩展名 | 用途 | 可编程语言 | 适用管线 |
| --- | --- | --- | --- |
| `.shader` | 传统着色器代码文件 | ShaderLab + Cg/HLSL | Built-in RP / URP / HDRP |
| `.shadergraph` | 可视化节点图着色器 | 节点图形化（无代码） | URP / HDRP 专用 |
| `.hlsl` | HLSL 函数库文件（自定义函数） | HLSL | URP / HDRP（配合 Shader Graph） |
| `.cginc` | Cg 包含文件（函数与变量库） | Cg | Built-in RP |

### 2.2.1.shader文件

这是 Unity 中最核心的着色器文件。它使用 **ShaderLab** 声明式语言定义属性、子着色器（SubShader）和通道（Pass），并在 `CGPROGRAM` / `HLSLPROGRAM` 块中编写 Cg 或 HLSL 代码。所有渲染管线（Built-in RP、URP、HDRP）都支持 `.shader` 文件。

### 2.2.2.shadergraph文件

Shader Graph 是 Unity 的可视化着色器编辑工具，仅适用于 **通用渲染管线（URP）** 和 **高清渲染管线（HDRP）**。用户通过节点连线的方式构建着色器，无需手写代码。在 Built-in RP 中无法使用 Shader Graph。

> [!warning] **注意** Shader Graph 是 Unity**特有** 的工具。其他引擎如 Unreal 有 Material Editor，Godot 有 Visual Shader——概念相似但实现完全不同。学习手写着色器代码能让你跨越引擎壁垒。

### 2.2.3.hlsl文件

HLSL（High-Level Shader Language）文件用于存放自定义 HLSL 函数，通常配合 Shader Graph 中的 **Custom Function** 节点使用。在 URP/HDRP 项目中，这些文件替代了传统 `.cginc` 的角色。

### 2.2.4.cginc文件

Cg Include 文件包含预定义的变量和辅助函数库。Unity 内置了多个 `.cginc` 文件（如 `UnityCG.cginc`），存放在 Unity 安装目录的 `Data/CGIncludes/` 路径下。它也支持用户创建自定义 `.cginc` 文件。

> [!tip] **核心对应关系** `.cginc` ↔`.shader` 中的 CGPROGRAM
> `.hlsl` ↔`.shadergraph` 中的 HLSLPROGRAM
> 理解这一对应关系是掌握 Unity 着色器系统不同分支的关键。

## 2.3 Unity 的五种着色器类型

Unity 提供了五种内置的着色器模板。下面逐一分析它们的用途、特性和局限性。

### 2.3.1 Standard Surface Shader（标准表面着色器）

**表面着色器（Surface Shader）** 是 Unity 特有的一层抽象，它自动生成与光照交互的 Cg 代码。你只需编写 `surf` 函数，Unity 会处理顶点和片元着色器的光照计算。

- **适用范围**：仅 Built-in RP
- **核心特性**：内置基础光照模型（albedo、specular、diffuse）
- **优化程度**：高 —— 自动生成大量模板代码
- **缺点**：不适用于 URP/HDRP；隐藏了底层实现细节，不利于学习

> [!warning] **注意** 表面着色器是 Unity**特有** 的概念。Unreal Engine 和 Godot 没有直接对应的"表面着色器"。当你迁移到其他引擎时，需要理解底层的顶点/片元着色器工作方式。

### 2.3.2 Unlit Shader（无光照着色器）

Unlit Shader 不包含任何光照计算，是纯粹的颜色输出模型。它将是本书中使用最多的着色器模板。

- **适用范围**：Built-in RP 和 Scriptable RP（URP/HDRP）
- **核心特性**：代码完全可见，没有任何隐藏优化
- **学习价值**：极高 —— 是理解着色器结构的理想起点
- **适用场景**：低端硬件、UI 元素、特殊视觉效果

> [!tip] **跨引擎通用概念** Unlit Shader 的概念在所有引擎中都是通用的——它是"基础颜色输出模型"。Unreal 中的 Material 可以将 Lighting Mode 设为 Unlit，Godot 中的 ShaderMaterial 也可以简单输出颜色。掌握 Unlit Shader 等于掌握了着色器的骨骼。

### 2.3.3 Image Effect Shader（图像效果着色器）

图像效果着色器在结构上与 Unlit Shader 非常相似，但专门用于**后处理**（post-processing）效果。它通常配合 C# 脚本的 `OnRenderImage` 函数使用。

- **适用范围**：Built-in RP（在 URP/HDRP 中由 Volume 组件替代）
- **典型应用**：色彩校正、模糊、辉光、边缘检测
- **处理时机**：场景渲染完成后，在最终输出到屏幕之前

> [!info] **通用概念** 后处理（Post-Processing）是所有现代引擎和图形应用的标准环节。在 Unreal 中通过 Post Process Volume，在 Godot 中通过 Environment 节点，在原生 DirectX 中通过全屏四边形（full-screen quad）实现。原理完全相同：将渲染好的图像作为纹理，再进行一次逐像素处理。

### 2.3.4 Compute Shader（计算着色器）

计算着色器是一种特殊类型的着色器，它**不在常规渲染管线**内运行，而是直接在 GPU 上进行通用计算（GPGPU）。

- **文件扩展名**：`.compute`
- **编程语言**：HLSL
- **应用场景**：粒子系统、物理模拟、图像处理、神经网络推理
- **关键区别**：没有顶点/片元的概念，只有线程（thread）和线程组（thread group）

> [!tip] **跨引擎通用概念** Compute Shader 在所有现代图形 API 中都存在：DirectX 叫 Compute Shader，Vulkan 和 OpenGL 也有 compute shader 支持。CUDA 和 OpenCL 也属于广义的 GPU 通用计算。这是一个纯图形/计算领域的标准概念。

### 2.3.5 Ray Tracing Shader（光线追踪着色器）

光线追踪着色器是 Unity 中较新的实验性着色器类型，扩展名为 `.raytrace`。它基于 DirectX Ray Tracing（DXR）技术。

- **适用范围**：仅 High Definition RP（HDRP）
- **硬件要求**：GTX 1080 或更高（需支持 RTX），Windows 10 1809+
- **应用场景**：全局光照、反射、折射、焦散（caustics）
- **与 Compute Shader 的关系**：可以替代计算着色器处理光线投射算法

> [!warning] **注意** 光线追踪虽然名字里带"着色器"，但其工作方式与传统的 rasterization 着色器有本质区别。它是通过反向追踪光线路径来计算颜色的，而非将三角形光栅化到像素上。这一概念（ray tracing）独立于任何游戏引擎，是计算机图形学的基本算法之一。

## 2.4 着色器类型对比一览

| 类型 | 代码复杂度 | 光照支持 | Built-in RP | URP / HDRP | 主要用途 |
| --- | --- | --- | --- | --- | --- |
| Surface Shader | 低（自动生成） | 是 | 是 | 否 | 有光照的标准材质 |
| Unlit Shader | 中（完全可见） | 否 | 是 | 是 | 无光照效果、学习 |
| Image Effect | 中 | 不适用 | 是 | 否（由 Volume 替代） | 后处理效果 |
| Compute Shader | 高 | 不适用 | 是 | 是 | GPU 通用计算 |
| Ray Tracing | 高 | 是（原生） | 否 | 仅 HDRP | 光线追踪效果 |

## 2.5 通用渲染概念与 Unity 专有概念

> [!note]
> #### 通用（跨引擎）概念
> - GPU 并行执行着色器
> - 顶点着色器 → 光栅化 → 片元着色器
> - HLSL / GLSL 语言
> - 逐顶点、逐像素处理
> - 后处理（Post-Processing）
> - 计算着色器（Compute Shader）
> - 光线追踪

> [!note]
> #### Unity 专有概念
> - ShaderLab 声明式语言
> - `.shader` 文件结构
> - Surface Shader 抽象层
> - Shader Graph 可视化工具
> - `.shadergraph` 扩展名
> - Cg 语言兼容性

## 2.6 Unity 着色器的历史演变

了解 Unity 着色器系统的演变历史有助于理解为什么现在有这么多"遗留"概念：

| 时期 | 主要语言 | 着色器系统 | 特点 |
| --- | --- | --- | --- |
| Unity 4.x 及更早 | Cg + ShaderLab | Surface Shader 为主 | Cg 是主流，GLSL 兼容 |
| Unity 5.x – 2018 | Cg + ShaderLab | Surface / Unlit Shader | Built-in RP 成熟期 |
| Unity 2019 – 2021 | HLSL + ShaderLab | Shader Graph 出现 | HLSL 成为官方语言，SRP 引入 |
| Unity 2022+ | HLSL + ShaderLab | URP / HDRP 标准 | Cg 标记为弃用，推荐纯 HLSL |

> [!warning] **对学习者的影响** 尽管 Unity 官方已转向 HLSL，但在 Built-in RP 中新建的`.shader` 文件仍然默认使用 CGPROGRAM。这在 Unity 2021.2 官方文档中也有明确说明：代码**仍然编译** ，出于兼容性考虑保留旧关键字。你可以手动将 CGPROGRAM 替换为 HLSLPROGRAM，将 ENDCG 替换为 ENDHLSL，代码即可在 URP/HDRP 中编译。

## 练习与回顾

> [!note]
> #### 思考题
> 1. 为什么着色器必须在 GPU 上运行，而不是 CPU？两者在架构设计上有哪些本质区别？
> 2. Unity 的 Surface Shader 和 Unlit Shader 最核心的区别是什么？为什么学习时推荐从 Unlit Shader 开始？
> 3. 如果你需要将一个使用 Surface Shader 的 Unity 项目迁移到 URP，会遇到哪些问题？如何解决？
> 4. Compute Shader 和传统 Vertex/Fragment Shader 的工作方式有什么不同？它们各自适合什么任务？
> 5. 尝试用你自己的语言解释：为什么 `.cginc` 与 `.hlsl` 不能混用——它们在 Unity 生态中分别属于哪个分支？

> [!note]
> #### 实践建议
> 1. 打开 Unity，在 Built-in RP 下创建一个 Unlit Shader，观察其默认代码结构。
> 2. 在 URP 项目中尝试创建 Shader Graph，对比两者的异同。
> 3. 查找 Unity 安装目录下的 `CGIncludes` 文件夹，浏览 `UnityCG.cginc` 的内容。

> [!info] **教材对照 — 已覆盖内容** 第 2.0.1 节：什么是着色器（第 33 页）
> 第 2.0.2 节：编程语言介绍 — HLSL、Cg、ShaderLab（第 34–35 页）
> 第 2.0.3 – 2.0.8 节：五种着色器类型详解（第 35–38 页）