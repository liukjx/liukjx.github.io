---
title: "ShaderLab 属性系统：参数声明与材质面板"
tags: [unity, shader, rendering]
type: lesson
---

# ShaderLab 属性系统：参数声明与材质面板

> [!info] **教材对照** 本课对应The Unity Shaders Bible 第 3.0.1 – 3.1.2 节（第 39–59 页）。涵盖`.shader` 文件结构骨架、ShaderLab 属性声明以及全部七种 MaterialPropertyDrawer。

## 3.1.shader文件结构骨架

在深入属性系统之前，我们先理解一个 `.shader` 文件的整体骨架。创建 Unlit Shader 后的默认代码结构如下：

> [!tip] **结构解析**
>   1. **Shader 声明行**：`Shader "路径/名称"` —— 定义在材质 Inspector 中显示的路径和名称。
>   2. **Properties 块**：声明可在 Inspector 中编辑的属性参数。
>   3. **SubShader 块**：包含渲染状态配置和 Pass 通道——GPU 读取程序的核心部分。
>   4. **Pass 块**：一个渲染通道，内部包含 Cg/HLSL 程序。
>   5. **Fallback 块**：当 SubShader 不兼容时的备用着色器路径。

### 3.1.1 GPU 线性读取特性

一个重要的原则：GPU **从上到下线性读取**着色器程序。如果你在使用某个函数之后才定义它，GPU 将无法识别，导致编译错误。

> [!warning] **注意** 这是一个**通用编译原理** ，不仅限于 Unity 着色器。大多数编程语言（C、C++、HLSL、GLSL）都遵循"先声明后使用"的规则。

## 3.2 ShaderLab 属性（Properties）系统

属性（Properties）是 ShaderLab 声明式语言中最直观的部分。它们定义了在 Unity Inspector 材质面板中可编辑的参数。属性声明的通用语法如下：

- **PropertyName**：变量名（如 `_MainTex`），以下划线开头是 Unity 惯例
- **Display Name**：在 Inspector 中对用户显示的友好名称
- **type**：数据类型（Number, Color, Vector, Texture 等）
- **defaultValue**：默认值

> [!warning] **语法规格** 属性声明结尾**不需要** 分号`;` 。这是因为属性属于 ShaderLab 声明式语言，不是 Cg/HLSL 代码。如果加了分号，GPU 将无法正确解析。

### 3.2.1 数字与滑条属性（Number & Slider）

用于向着色器传递数值参数，有三种形式：

| 类型声明 | 说明 | 示例 |
| --- | --- | --- |
| `Range(min, max)` | 带滑条的浮点数范围 | `_Specular ("Specular", Range(0.0, 1.0)) = 0.3` |
| `Float` | 任意浮点数 | `_Factor ("Color Factor", Float) = 0.3` |
| `Int` | 整数值 | `_Cid ("Color ID", Int) = 2` |

### 3.2.2 颜色与向量属性（Color & Vector）

颜色和向量都是四维值（RGBA / XYZW），但 Inspector 中显示的控件不同。

| 类型 | 语义 | Inspector 控件 | 默认值示例 |
| --- | --- | --- | --- |
| `Color` | RGBA 颜色值 | 颜色拾取器（带 Alpha） | `(1, 1, 1, 1)`（白色） |
| `Vector` | 四维向量 | 四个数值输入框 | `(0, 0, 0, 1)` |

### 3.2.3 纹理属性（Texture Properties）

纹理属性允许将外部图像文件作为输入传递给着色器。Unity 支持三种纹理类型：

| 类型 | 用途 | 默认值示例 |
| --- | --- | --- |
| `2D` | 标准二维纹理（贴图） | `"white" {}` |
| `Cube` | 立方体贴图（Cubemap，用于反射/环境映射） | `"black" {}` |
| `3D` | 三维体积纹理（较少使用） | `"white" {}` |

> [!tip] **通用概念** 纹理映射（Texture Mapping）是计算机图形学的基础概念，所有引擎和 API 都支持。2D 纹理、Cubemap、3D 纹理在 DirectX、Vulkan、OpenGL 中都有对应概念。Cubemap 用于环境反射是跨引擎的标准做法。

### 3.2.4 连接变量（Connection Variables）

一个至关重要的概念：ShaderLab 属性是在 **声明式语言层** 定义的，而 Cg/HLSL 代码在 **编程语言层**。两者是**不同的语言**，因此必须在 CGPROGRAM 中用**完全相同的名称**声明"连接变量"才能互通数据。

> [!warning] **关键点**
>   1. ShaderLab 属性名与 Cg/HLSL 连接变量名**必须完全一致**（大小写敏感）。
>   2. 连接变量通常在 CGPROGRAM 中作为**全局变量**声明（`uniform` 关键字可以省略——Unity 自动为 `.shader` 中的属性添加 uniform 前缀）。
>   3. 纹理属性的连接变量类型是 `sampler2D`（而非 `Texture2D`）。`sampler2D` 同时包含纹理数据和采样状态。

## 3.3 MaterialPropertyDrawer（材质属性绘制器）

MaterialPropertyDrawer 是 ShaderLab 中用于**增强 Inspector 控件**的一类工具。它们不是独立的属性类型，而是通过对属性添加 `[DrawerName]` 标签来改变控件的外观和行为。

截至目前，Unity 共提供了**七种**内置 Drawer：

| Drawer | 功能 | Inspector 控件 | 配合需求 |
| --- | --- | --- | --- |
| [Toggle] | 开关（模拟布尔值） | 复选框 | #pragma shader_feature |
| [KeywordEnum] | 多选下拉菜单（最多 9 项） | 下拉列表 | #pragma multi_compile 或 shader_feature |
| [Enum] | 枚举映射（值/ID） | 下拉列表 | 直接传递给 ShaderLab 命令 |
| [PowerSlider] | 非线性滑条 | 滑条（指数曲线） | 同常规连接变量 |
| [IntRange] | 整数范围滑条 | 滑条（整数步进） | 同常规连接变量 |
| [Space] | 属性间距 | 垂直空白 | 无 |
| [Header] | 分组标题 | 粗体标签 | 无 |

### 3.3.1 [Toggle] —— 开关条件

着色器中没有布尔类型，Toggle 用 `Float` 的 0/1 值实现"开/关"语义。

> [!tip] **命名规则** `[Toggle]` 的`shader_feature` 关键字会自动转换为`属性名大写 + _ON` 。例如`_Enable` →`_ENABLE_ON` 。`_ON` 对应 Toggle 的"启用"状态。

### 3.3.2 [KeywordEnum] —— 关键字多选

生成下拉菜单，最多支持 9 个状态。适合在运行时动态切换多种效果。

**Toggle vs KeywordEnum：**

| 特性 | [Toggle] | [KeywordEnum] |
| --- | --- | --- |
| 状态数量 | 2（开/关） | 2–9 |
| 推荐搭配 | shader_feature | multi_compile |
| 构建输出 | 仅选中的变体 | 全部变体 |
| 运行时切换 | 否（需在 Inspector 预设） | 是（可通过脚本动态切换） |

### 3.3.3 [Enum] —— 枚举映射

与 KeywordEnum 不同，**Enum 不创建 shader variant**，而是将选中的**数字 ID** 传递给 ShaderLab 命令（如 `Cull`、`ZTest`、`Blend`）。

Enum 也可直接引用 Unity 引擎预定义枚举：

> [!info] **Enum 与 KeywordEnum 的核心区别**
>   - **KeywordEnum** → 生成 `#if` 预处理指令，适用于代码内分支。
>   - **Enum** → 生成一个 **Float 值**，可直接赋值给 ShaderLab 命令，不产生 shader variant。

### 3.3.4 [PowerSlider] —— 非线性滑条

标准 `Range` 的线性滑条在数值接近 0 时难以精细控制。`PowerSlider` 使用幂函数曲线让滑条响应呈非线性，参数控制曲线陡峭程度。

当参数值为 3.0 时，滑条在低值区域有更精细的控制范围——非常适合曝光度、粗糙度等对数值不敏感的物理参数。

### 3.3.5 [IntRange] —— 整数范围

标准的 `Range` 产生浮点值，而 `IntRange` 强制输出整数。适合表示样本数、迭代次数、数组索引等离散值。

### 3.3.6 [Space] 与 [Header] —— 组织美化

这两个 Drawer 不参与数据传递，仅用于美化 Inspector 布局。

> [!tip] **组织建议** 在包含大量属性的着色器中，合理使用`[Header]` 和`[Space]` 可以极大提升材质编辑体验。建议按功能分组：基础参数、光照参数、纹理输入、效果开关等。

## 3.4 完整示例：综合应用所有属性

## 3.5 属性系统的跨引擎思考

> [!note]
> #### Unity ShaderLab 属性
> - 声明在 `Properties { }` 块中
> - 通过同名连接变量传递给 Cg/HLSL
> - 支持 Drawer 标签增强 UI
> - 材质面板自动生成
> - 支持运行时通过脚本修改

> [!note]
> #### 通用渲染原理
> - **着色器参数**是所有图形 API 的标准概念
> - DirectX：Constant Buffers
> - Vulkan：Push Constants / Descriptor Sets
> - OpenGL：Uniform 变量
> - Unreal：Material Parameter Collection
> - Godot：Shader Param
> - 本质都是"CPU → GPU 的数据通道"

## 练习与回顾

> [!note]
> #### 思考题
> 1. 为什么 ShaderLab 属性声明结尾不能加分号？连接变量声明在 CGPROGRAM 中又为什么需要分号？
> 2. 如果你在 Properties 中声明了 `_MyColor ("My Color", Color) = (1, 0, 0, 1)`，在 CGPROGRAM 中忘记声明 `float4 _MyColor`，会发生什么？
> 3. 什么场景下应该使用 `shader_feature` 而非 `multi_compile`？这两种 pragma 对最终构建体积有什么影响？
> 4. [Toggle] 和 [Enum] 虽然都在 Inspector 中生成下拉控件，但它们在底层的运行机制有何根本不同？
> 5. 如果你想让一个属性在 Inspector 中显示为滑条但数值范围是 0–1 的整数（即 0 或 1），应该用什么组合？

> [!note]
> #### 实践建议
> 1. 在 Unity 中创建一个新的 Unlit Shader，手动添加至少三种不同类型的属性，并在 Inspector 中观察效果。
> 2. 实现一个带有 [Toggle] 的着色器，用 `#pragma shader_feature` 控制是否应用颜色叠加。
> 3. 尝试使用 [KeywordEnum] 实现一个"四季切换"的着色器效果（春/夏/秋/冬对应不同颜色叠加）。

> [!info] **教材对照 — 已覆盖内容** 第 3.0.1 节：顶点/片元着色器结构（第 39–43 页）
> 第 3.0.2 – 3.0.3 节：ShaderLab 声明与属性字段（第 44–45 页）
> 第 3.0.4 – 3.0.6 节：数字、颜色、纹理属性（第 46–49 页）
> 第 3.0.7 – 3.1.2 节：七种 MaterialPropertyDrawer（第 50–59 页）