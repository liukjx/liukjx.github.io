---
title: "第14课：Shader Graph —— 可视化着色器编辑"
tags: [unity, shader, rendering]
lesson: 14
type: lesson
---

# 第14课：Shader Graph —— 可视化着色器编辑

教材对照：*The Unity Shaders Bible* 第9章 (p. 276–295)

## 14.1 概述：什么是 Shader Graph？

在本书的前面章节中，我们深入研究了渲染管线的结构，理解了 Unity 着色器的工作原理。如今，几乎所有主流游戏引擎和渲染工具都提供了**可视化着色器编辑工具**：Unreal Engine 称之为 **Material Graph**，Godot 称之为 **Visual Shader**，Unity 则称之为 **Shader Graph**。虽然名称和界面细节各不相同，但其核心思想是一致的——*通过节点图（Node Graph）来代替手写代码创建着色器*。

Shader Graph 是 Unity 的一个包（Package），它为 Unity 增加了可视化的节点编辑工具。基于 HLSL，它的界面可以被艺术家和开发者共同使用，通过连接节点而非编写代码来创建自定义着色器。更重要的是，Shader Graph 的 **Custom Function 节点** 与 HLSL 高度兼容，允许我们在可视化编辑中嵌入自定义的 HLSL 代码。

> [!info] **跨引擎通用概念** 可视化着色器编辑器的本质是：**将着色器中的数学运算（加法、乘法、点积、正弦等）和纹理操作（采样、混合）抽象为可视化的节点块**。无论你今后使用 Unity 的 Shader Graph、Unreal 的 Material Editor，还是 Blender 的 Shader Editor，底层原理都是相通的——你只需要理解每个节点的数学含义，而非记忆特定的 API 拼写。

目前，Shader Graph 支持两种渲染管线：**High Definition RP（HDRP）** 和 **Universal RP（URP）**。在 Unity 2018 版本中 Shader Graph 尚处于 Beta 阶段，而从 Unity 2019.1 起开始正式支持。

> [!warning] **版本兼容性警告** 不同版本的 Shader Graph 之间存在**功能差异**。例如，版本 8.3.1 中顶点和片段着色器阶段合并在一个 "Master" 节点中，而在版本 12.0.0 中两者分离且独立工作。在不同 Unity 版本之间迁移 Shader Graph 项目时，节点集可能需要调整。

## 14.2 Shader Graph 的界面与工作流程

### 14.2.1 安装方式

有两种方式将 Shader Graph 引入项目：

1. **默认安装**：在创建 URP 或 HDRP 项目时自动包含。
2. **手动安装**：通过 *Window / Package Manager* 安装 Shader Graph 包。

如果是从 Built-in RP 升级到 URP，需要额外安装 Universal RP 包并在 Project Settings 中配置 Render Pipeline Asset。

> [!warning] **重要限制** 不能从 Built-in RP 或 URP 升级到 HDRP。HDRP 是面向高端游戏的渲染管线，只能通过 Unity Hub 以 HDRP 模板创建新项目。

### 14.2.2 界面核心组件

打开一个 Shader Graph 文件（.shadergraph）后，界面包含以下关键区域：

| 组件 | 功能描述 | 对应 ShaderLab 概念 |
| --- | --- | --- |
| **Save Asset** | 保存着色器配置，等同 Ctrl+S / Cmd+S | 保存 .shader 文件 |
| **Blackboard（黑板）** | 管理着色器的属性和变量 | `Properties { … }` 块 |
| **Graph Inspector** | 修改节点和着色器的全局设置 | ShaderLab 中的标签和状态设置 |
| **Main Preview** | 预览当前节点配置的效果 | Game 视图的实时渲染 |
| **节点工作区** | 可视化编辑区域，连接节点 | CGPROGRAM / HLSLPROGRAM 代码 |

### 14.2.3 Blackboard（黑板）

Blackboard 是 Shader Graph 中属性的管理面板，等同于 ShaderLab 中的 `Properties` 声明块。在 Blackboard 中点击 "+" 按钮即可添加新属性。与手写着色器不同，Shader Graph 在创建新着色器时 Blackboard 是**空的**，需要手动添加所有需要的属性。

### 14.2.4 Graph Inspector

Graph Inspector 分为两个选项卡：

| 选项卡 | 功能 |
| --- | --- |
| **Node Settings** | 设置属性名称、引用、默认值、模式、精度等。例如修改 _Color 属性的默认颜色，或设置纹理的 "Mode"（white / black / gray） |
| **Graph Settings** | 定义着色器全局配置，如表面类型（透明/不透明/叠加）、Cull 模式、深度写入等。对应 ShaderLab 中的 Blend、Cull、ZWrite 命令 |

> [!tip] **精度控制** Graph Inspector 中的 "precision" 属性控制节点的计算精度：**Single**（float，6位小数精度）和 **Half**（3位小数精度）。默认值 "inherit" 继承父节点精度。在移动端使用 Half 可以显著提升性能。

## 14.3 创建第一个 Shader Graph

我们将创建一个 USB_simple_color_SG 着色器，复现之前章节中的 USB_simple_color 效果。

### 14.3.1 步骤概览

1. 在 Project 窗口中右键：*Create / Shader / Universal Render Pipeline / Unlit Shader Graph*，命名为 `USB_simple_color_SG`。
2. 双击打开文件，进入 Shader Graph 界面。
3. 在 Blackboard 中添加两个属性：`_Color`（Color 类型）和 `_MainTex`（Texture2D 类型）。
4. 将属性从 Blackboard 拖入节点工作区。
5. 添加 **Sample Texture 2D** 节点（按空格键搜索或右键 Create Node），将 _MainTex 连接到其 Texture(T2) 输入。
6. 添加 **Multiply** 节点，将 Sample Texture 2D 的 RGBA 输出和 _Color 的输出相乘。
7. 将 Multiply 的结果连接到 Fragment 阶段的 **Base Color** 输入。
8. 点击 **Save Asset** 保存。

### 14.3.2 节点连线解析

这个过程等价于手写 HLSL 中的以下代码：

> [!note]
> 在 Shader Graph 的 Vertex 阶段，输入 Position(3)、Normal(3)、Tangent(3) 分别对应 HLSL 中的 `float3 POSITION`、`float3 NORMAL`、`float3 TANGENT`。为什么是三维而非四维？因为第四维 W 分量在大多数情况下为 1（位置点）或 0（方向向量），Shader Graph 将其省略以简化界面。

### 14.3.3 节点是函数的图形化表示

Shader Graph 中的每个节点本质上都是一个 HLSL 函数的图形化封装。例如 **Clamp 节点**对应以下代码：

由于 Shader Graph 基于 HLSL，这些函数也可以直接在 `.shader` 文件中使用：

| Shader Graph 节点 | 等效 HLSL 函数 | 用途 |
| --- | --- | --- |
| Multiply | `a * b` | 颜色调制、强度缩放 |
| Add | `a + b` | 颜色叠加、偏移 |
| Clamp | `clamp(x, min, max)` | 值域限制 |
| Lerp | `lerp(a, b, t)` | 线性插值 |
| Sample Texture 2D | `tex2D(tex, uv)` | 纹理采样 |
| Normalize | `normalize(v)` | 向量归一化 |
| Dot Product | `dot(a, b)` | 点积（光照计算） |

## 14.4 Custom Function 节点：在 Shader Graph 中嵌入 HLSL

Custom Function 节点是 Shader Graph 中最强大的功能之一，它允许我们在可视化编辑中嵌入**自定义 HLSL 代码**。这是连接可视化编辑与传统手写代码的桥梁。

### 14.4.1 两种工作方式

| 方式 | 说明 | 推荐场景 |
| --- | --- | --- |
| **Type: File** | 引用外部的 `.hlsl` 文件 | 代码复用、团队协作、大型项目 |
| **Type: String** | 直接在节点体内编写函数 | 快速原型、小型逻辑 |

### 14.4.2 实战：创建自定义光照函数

以复现 `_WorldSpaceLightPos` 变量行为为例，创建一个 `CustomLight.hlsl` 文件：

关键点说明：

- `SHADERGRAPH_PREVIEW` 宏：在 Shader Graph 预览模式下，使用默认方向（Y轴向上）。
- 在 URP 环境中，通过 `GetMainLight()` 获取场景主光源方向。
- 在 Graph Inspector 的 Node Settings 中，将 Source 设置为 CustomLight.hlsl 文件，Name 设置为 `CustomLight`。
- 输出类型为 `half3`，意味着节点精度应设置为 "inherit"（默认16位）或 "half"。

> [!tip] **命名匹配** Custom Function 节点在 Graph Inspector 中设置的 **Name** 必须与 HLSL 文件中的函数名完全一致（大小写敏感），否则会产生编译错误。

使用该函数节点后，配合 Normalize、Dot Product 和 Saturate 节点，即可在 Shader Graph 中完成完整的漫反射光照计算（n·l 模型），完全不需要手写光照代码。

## 14.5 Shader Graph 与手写 HLSL 对比

| 对比维度 | Shader Graph | 手写 HLSL（.shader） |
| --- | --- | --- |
| **学习曲线** | 低，无需记忆语法，直观拖拽连线 | 高，需要掌握 HLSL 语法和 ShaderLab 结构 |
| **迭代速度** | 快，实时预览，所见即所得 | 中等，需要编译和查看结果 |
| **艺术家友好度** | 极高，与 Maya Hypershade、Blender Shader Editor 类似 | 低，需要编程能力 |
| **代码复用** | 需要通过 Sub Graph 或 Custom Function 实现 | 通过 #include 或 CGPROGRAM 块自然复用 |
| **性能优化空间** | 有限，编译器自动优化 | 完全控制，可针对目标平台手动优化 |
| **版本兼容** | 不同版本间可能存在编译问题 | 相对稳定，语法变化小 |
| **复杂逻辑** | 复杂算法时节点图变得庞大难维护 | 代码更简洁，易于维护复杂逻辑 |
| **跨管线兼容** | 仅支持 URP 和 HDRP | 可适配 Built-in RP / URP / HDRP |

> [!info] **最佳实践建议** **对于艺术家**：Shader Graph 是理想选择，可以独立创建大量视觉效果。 **对于技术美术 / 图形程序员**：建议混合使用——用 Shader Graph 做快速原型和简单效果，用 Custom Function 节点嵌入优化后的 HLSL 代码处理复杂逻辑，必要时直接编写 .shader 文件。

## 14.6 可视化着色器的跨引擎通用概念

> [!note]
> 无论你使用哪个引擎的可视化着色器编辑器，以下概念都是通用的：

- **数据流**：属性（Properties / Parameters）→ 节点运算 → 主输出（Master / Material Output）。
- **纹理采样**：TexCoord → Sample Texture → 后续运算，等同于 `tex2D()` 或 `Sample()`。
- **数学运算**：Add、Multiply、Lerp、Clamp、Dot、Cross、Normalize——所有引擎都有这些节点。
- **向量操作**：Split（拆分为分量）、Combine（合并为向量）、Swizzle（重排分量）。
- **自定义代码**：Custom Function (Unity) / Custom Expression (UE) / Custom Node (Godot) 都允许嵌入代码。
- **子图（Sub Graph）**：将一组节点封装为可复用的子图，等同于函数封装。

> [!tip] **学习建议** 如果你想真正掌握可视化着色器，建议先理解 **手写 HLSL/Cg 的基础知识**（如本书前几章所讲），因为 Shader Graph 中的每个节点背后都是一个 HLSL 函数。理解了数学原理和渲染管线的数据流，你就能在任何引擎的可视化编辑器之间无缝切换。

## 14.7 教材对照

| 教材章节 | 页码 | 内容 |
| --- | --- | --- |
| 9.0.1 | p. 276–277 | Shader Graph 简介 |
| 9.0.2 | p. 278–279 | 安装与项目配置 |
| 9.0.3 | p. 280–281 | 界面分析 |
| 9.0.4 | p. 282–288 | 第一个 Shader Graph |
| 9.0.5 | p. 289–290 | Graph Inspector |
| 9.0.6 | p. 290–292 | 节点详解 |
| 9.0.7 | p. 292–295 | Custom Function 节点 |

## 14.8 练习与回顾

### 思考题

1. Shader Graph 中的 Blackboard 对应传统 ShaderLab 中的哪个部分？Graph Inspector 的 Graph Settings 又对应哪些 ShaderLab 命令？
2. 为什么 Shader Graph 的 Vertex 阶段输入是三维向量（Position(3)、Normal(3)）而非四维？
3. Custom Function 节点中 `SHADERGRAPH_PREVIEW` 宏的作用是什么？在什么情况下需要用到它？
4. 假设你需要创建一个包含复杂光照计算和后期处理效果的着色器，你会选择 Shader Graph 还是手写 HLSL？为什么？
5. 对比 Unity Shader Graph、Unreal Material Graph 和 Godot Visual Shader 在概念上的异同（如果你接触过多个引擎）。

### 实践练习

1. **基础练习**：创建一个 Shader Graph，实现纹理与颜色的乘法混合（如本节课所述）。尝试添加一个 Float 属性控制纹理的亮度。
2. **进阶练习**：使用 Custom Function 节点，嵌入一个实现菲涅尔（Fresnel）效果的 HLSL 函数。
3. **挑战练习**：创建一个 Sub Graph，封装一个自定义的噪波生成函数，然后在主图中复用。