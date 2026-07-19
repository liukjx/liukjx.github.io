---
title: "第15课：Compute Shader —— GPU 通用计算"
tags: [unity, shader, rendering]
lesson: 15
type: lesson
---

# 第15课：Compute Shader —— GPU 通用计算

教材对照：*The Unity Shaders Bible* 第10章 (p. 297–330)

## 15.1 概述：什么是 Compute Shader？

在本节之前，我们研究的着色器（Vertex、Fragment、Surface）都属于**图形渲染管线**的一部分。然而，**Compute Shader** 是一个完全不同的概念——它是一个可以在 GPU 的"计算单元"上直接执行数据算法的程序，用于**通用 GPU 计算（GPGPU）**。

Compute Shader 的独特之处在于：

- 它拥有**自己独立的渲染管线**，不属于传统的图形渲染管线。
- 它可以处理**非图形性质**的计算任务，例如物理模拟、粒子系统、百万顶点计算。
- 它通过 **Direct3D API** 将输出直接链接到逻辑渲染管线。

> [!info] **跨引擎通用原理** Compute Shader 并非 Unity 特有的概念。OpenGL 有 **OpenGL Compute Shader**，DirectX 有 **DirectCompute**，Vulkan 提供 **Vulkan Compute**，Metal 也有对应的 **Metal Compute Kernel**。虽然 API 不同，但核心思想完全一致：*在 GPU 上启动大量并行线程，每个线程执行相同的函数，处理不同的数据*。

## 15.2 Compute Shader 的结构

### 15.2.1 默认模板分析

在 Unity 中创建 Compute Shader（*Create / Shaders / Compute Shader*）后，默认模板如下：

结构分析：

| 组件 | 说明 | 对应 Vertex/Fragment Shader |
| --- | --- | --- |
| `#pragma kernel CSMain` | 声明 CSMain 函数为 kernel（计算核） | `#pragma vertex vert` / `#pragma fragment frag` |
| `RWTexture2D<float4> Result` | 支持读/写的 2D RGBA 纹理缓冲区 | —（Vertex/Fragment 无此概念） |
| `[numthreads(8, 8, 1)]` | 定义每个线程组的线程数量 | —（不适用） |
| `SV_DispatchThreadID` | 当前线程的全局唯一 ID | `SV_VertexID` / `SV_Position` 等语义 |

### 15.2.2 与传统着色器的核心区别

Compute Shader 与传统 Vertex/Fragment Shader 的最大区别在于：

- **没有 ShaderLab 包装**：Compute Shader 不需要 ShaderLab 的 `Shader {}` / `SubShader {}` / `Pass {}` 结构。
- **需要 C# 脚本驱动**：Compute Shader 必须通过 C# 脚本调用 `Dispatch()` 来执行。
- **完全控制线程**：开发者手动定义线程组的数量和布局。
- **数据驱动**：输入输出通过纹理和缓冲区（Buffer）传递，而非传统的顶点属性。

## 15.3 线程组（Thread Groups）的概念

### 15.3.1 numthreads 详解

`[numthreads(x, y, z)]` 定义了**每个线程组中**的线程数量。默认值 (8, 8, 1) 意味着：

- X 轴：8 列线程
- Y 轴：8 行线程
- Z 轴：1 组深度
- 总线程数：8 × 8 × 1 = **64 线程/组**

> [!warning] **硬件兼容性** GPU 将线程组划分为更小的子块：NVIDIA 称为 **warps**（32 线程），ATI/AMD 称为 **wavefronts**（64 线程）。每个线程组的总线程数必须是 warp/wavefront 大小的倍数。Unity 默认使用 8×8（64 线程）正好兼容两者。

### 15.3.2 线程 ID 语义

Compute Shader 中有几种重要的线程 ID 语义：

| 语义 | 含义 | 示例值 |
| --- | --- | --- |
| `SV_GroupID` | 当前线程组在网格中的索引 | (0,0,0), (1,0,0), … |
| `SV_GroupThreadID` | 当前线程在其所属组内的索引 | (0,0,0) 到 (7,7,0) |
| `SV_DispatchThreadID` | 全局线程 ID，等于 GroupID × numthreads + GroupThreadID | (0,0,0) 到 (255,255,0) |

#### SV_DispatchThreadID 计算公式

`SV_DispatchThreadID = (SV_GroupID × numthreads) + SV_GroupThreadID`

例如：如果 numthreads = (8,8,1)，GroupID = (2,3,0)，GroupThreadID = (5,6,0) 则 DispatchThreadID = (2×8+5, 3×8+6, 0) = (21, 30, 0)

## 15.4 第一个 Compute Shader 实践

### 15.4.1 C# 控制脚本

创建 `USBSimpleColorController.cs`，将其挂载到场景中的一个 Quad 上：

### 15.4.2 Dispatch 的工作机制

`Dispatch(kernelIndex, groupsX, groupsY, groupsZ)` 是启动 Compute Shader 的关键函数：

- **kernelIndex**：Kernel 的索引（第一个为 0）。
- **groupsX/Y/Z**：三个维度上的线程组数量。

在我们的例子中，纹理大小为 256×256，numthreads 为 (8,8,1)，因此：

- 网格列数：256 ÷ 8 = **32**
- 网格行数：256 ÷ 8 = **32**
- 总线程组：32 × 32 × 1 = **1024 组**
- 总线程数：1024 × 64 = **65,536 个线程**（每个 texel 对应一个线程）

> [!tip] **多 Kernel 支持** 一个 Compute Shader 可以有多个 Kernel，每个 Kernel 自动分配一个 ID： #pragma kernel CSMain          // id 0
#pragma kernel CSFunction01    // id 1
#pragma kernel CSFunction02    // id 2 在 C# 中通过 `m_shader.SetTexture(1, "Result", tex)` 分别设置。

### 15.4.3 纹理输出——Sierpinski 分形

默认的 Compute Shader 代码生成了一个 **Sierpinski 三角形**分形图案：

这段代码利用**位运算**（&）生成分形结构。`id.x & id.y` 的位与运算结果产生了自相似的分形图案，这是 GPGPU 编程中经典的入门示例。

如果直接输出纯色就更容易理解：

### 15.4.4 线程数量与纹理尺寸的关系

如果将 numthreads 改为 (4, 4, 1)，但 Dispatch 参数不变（32, 32, 1），则：

- 有效覆盖：32 × 4 = 128，即只有纹理的**四分之一**被渲染。
- 原因：Dispatch 组数 × numthreads = 实际处理的像素数。

> [!warning] **线程同步限制** 不同线程组之间**不能同步**。GPU 可以将不同线程组发送到不同的计算单元，执行顺序不可控。只有同一组内的线程可以通过 GroupMemoryBarrier 等函数同步。这也是为什么随机写入纹理时需要启用 `enableRandomWrite = true`。

## 15.5 UV 坐标与纹理操作

在 Compute Shader 中处理纹理时，我们需要手动计算 UV 坐标。

### 15.5.1 获取纹理尺寸

### 15.5.2 Wrap Mode 的注意事项

| Wrap Mode | UV 计算方式 |
| --- | --- |
| Clamp | `float2 uv = float2(id.xy / float2(width, height));` |
| Repeat | `float2 uv = float2((id.xy + float2(0.5, 0.5)) / float2(width, height));` |

两者的区别在于是否在像素中心点采样。Repeat 模式需要 +0.5 偏移以防止边缘反射。

### 15.5.3 C# 端传递纹理

## 15.6 缓冲区（Buffers）

当需要处理大量数据（粒子系统、后处理、光线追踪）时，使用缓冲区比逐个设置变量高效得多。

### 15.6.1 数据传递的两种方式

| 方式 | C# 端 | Compute Shader 端 | 适用场景 |
| --- | --- | --- | --- |
| 单个变量 | `SetFloat()` / `SetVector()` | `float` / `float4` 变量 | 少量参数 |
| 结构化缓冲区 | `ComputeBuffer` → `SetBuffer()` | `StructuredBuffer<T>` | 大量结构化数据 |
| 追加缓冲区 | `ComputeBuffer` (Append) | `AppendBuffer<T>` | 动态长度数据输出 |

### 15.6.2 实战：缓冲区实现圆形绘制

**Compute Shader 端**：

**C# 端**：

> [!tip] **Stride 计算** stride 是缓冲区中每个元素的大小（以字节为单位）。对于包含 3 个 float 的结构体：**stride = (1 + 1 + 1) × 4 = 12 字节**。结构体在 HLSL 和 C# 中的内存布局必须完全匹配。

## 15.7 Compute Shader 的跨引擎原理

Compute Shader 是**现代图形 API 的标准功能**，在不同 API 中名称和语法略有不同，但核心概念一致：

| API / 平台 | 名称 | 关键特性 |
| --- | --- | --- |
| DirectX 11+ | **DirectCompute** | CS_5_0 起支持，Unity Compute Shader 的基础 |
| OpenGL 4.3+ | **OpenGL Compute Shader** | `layout(local_size_x = …)` 代替 numthreads |
| Vulkan | **Vulkan Compute** | 通过 VkPipeline 创建计算管线，SPIR-V 中间表示 |
| Metal | **Metal Compute Kernel** | `kernel void function(device float *data [[buffer(0)]])` |
| CUDA | **CUDA Kernel** | NVIDIA 专属，`<<<grid, block>>>` 相当于 dispatch + numthreads |

> [!info] **关键洞察** 无论底层 API 如何变化，Compute Shader 的架构始终遵循： **C#（CPU）→ Dispatch（启动线程组）→ Kernel（GPU 并行执行）→ Buffer / Texture（数据交换）** 掌握 Unity 中的 Compute Shader 后，你可以将此知识迁移到任何支持计算着色器的平台。

## 15.8 教材对照

| 教材章节 | 页码 | 内容 |
| --- | --- | --- |
| 第3章引言 | p. 297–298 | Compute Shader 概念引入 |
| 10.0.1 | p. 298–301 | Compute Shader 结构 |
| 10.0.2 | p. 302–315 | 第一个 Compute Shader |
| 10.0.3 | p. 316–319 | UV 坐标与纹理操作 |
| 10.0.4 | p. 320–330 | 缓冲区（Buffers） |

## 15.9 练习与回顾

### 思考题

1. Compute Shader 与传统的 Vertex/Fragment Shader 在渲染管线中的位置有何不同？
2. 什么是线程组（Thread Group）？`numthreads` 和 `Dispatch` 的参数之间是什么关系？
3. 为什么不同线程组之间不能同步？这对程序设计有什么约束？
4. `SV_DispatchThreadID` 和 `SV_GroupThreadID` 的区别是什么？在什么场景下需要使用后者？
5. StructuredBuffer 和 RWStructuredBuffer 的区别是什么？AppendBuffer 有什么特殊用途？

### 实践练习

1. **基础练习**：创建一个 Compute Shader，生成一张彩色渐变纹理（从左上到右下 RGB 渐变）。
2. **进阶练习**：使用 ComputeBuffer 将顶点位置数据传入 Compute Shader，实现顶点位置的批量修改。
3. **挑战练习**：实现一个简单的 N-Body 模拟——每个粒子受到其他所有粒子的引力，使用 Compute Shader 并行计算粒子的位置更新。 *提示*：使用两个缓冲区（位置/速度），在 Compute Shader 中更新后交换。