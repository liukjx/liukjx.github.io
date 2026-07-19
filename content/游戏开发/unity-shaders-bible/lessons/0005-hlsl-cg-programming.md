---
title: "HLSL / Cg 编程基础：数据类型、语法制导、顶点与片元"
tags: [unity, shader, rendering]
type: lesson
---

# HLSL / Cg 编程基础：数据类型、语法制导、顶点与片元

> [!info] **教材对照** 本课对应The Unity Shaders Bible 第 3.2.6 – 3.3.4 节（第 93–112 页）。涵盖 CGPROGRAM / HLSLPROGRAM、数据类型、Pragmas、Include 文件、顶点输入/输出结构体、顶点与片元着色器阶段、连接变量。

## 5.1 CGPROGRAM / ENDCG 与 HLSLPROGRAM 的演变

在 `.shader` 文件中，实际的可编程代码写在 `Pass` 内的 `CGPROGRAM ... ENDCG` 或 `HLSLPROGRAM ... ENDHLSL` 块中。这两者之间的区别反映了 Unity 着色器系统的历史演进。

ShaderLab 声明

→

CGPROGRAM

Cg / HLSL 代码

→

ENDCG

| 特性 | CGPROGRAM / ENDCG | HLSLPROGRAM / ENDHLSL |
| --- | --- | --- |
| 底层语言 | Cg（NVIDIA，已弃用）+ HLSL 混合 | 纯 HLSL（Microsoft） |
| Unity 默认模板 | 是（Built-in RP） | 是（URP / HDRP） |
| Built-in RP 支持 | 是 | 是 |
| URP / HDRP 支持 | 有限兼容 | 原生支持 |
| fixed 类型 | 支持 | **不支持** |
| .cginc 包含 | 是 | 需改用 .hlsl 包含 |
| 推荐度 | 仅用于维护旧项目 | 新项目首选 |

> [!tip] **实践建议** 对于新项目，推荐使用 HLSLPROGRAM。即使你正在使用 Built-in RP，也可以手动将 CGPROGRAM 替换为 HLSLPROGRAM（以及 ENDCG → ENDHLSL），并修改对应的 include 路径。这是最"未来兼容"的做法。

## 5.2 Cg / HLSL 数据类型

### 5.2.1 浮点精度类型

着色器编程区别于普通 C/C++ 的一个关键点在于提供了**多种精度的浮点类型**，允许开发者根据需求选择精度与性能的平衡。

32

#### float

高精度

世界空间位置、UV 坐标、三角函数、指数运算

16

#### half

中等精度

方向向量、物体空间位置、HDR 颜色

11

#### fixed

低精度（仅 Cg）

简单颜色存储、低强度计算

| 类型 | 位数 | Cg | HLSL | 典型用途 |
| --- | --- | --- | --- | --- |
| `float` | 32 | 是 | 是 | 世界空间位置 `float4 vertex : POSITION;` |
| `half` | 16 | 是 | 是 | 方向向量、UV 坐标 |
| `fixed` | 11 | 是 | **否** | 简单颜色（仅 Cg 中可用） |
| `int` | 32 | 是 | 是 | 循环计数器、索引 |
| `bool` | — | 是 | 是 | 条件判断 |

> [!warning] **性能原则** 虽然全程使用`float` 不会导致编译错误，但 GPU 处理高精度数据需要更多时间和功耗。最佳实践是：**用最小的精度完成所需任务** 。如果只是存储颜色值，`fixed4` （Cg）或`half4` （HLSL）足够；只有世界空间坐标才需要用`float4` 。

### 5.2.2 向量类型

### 5.2.3 矩阵类型

### 5.2.4 Sampler 类型

Sampler 类型用于在着色器中对纹理进行采样。在 Cg/HLSL 中有两种写法：

> [!tip] **通用概念** Sampler（采样器）是所有图形 API 的标准概念。它定义了纹理如何被读取：寻址模式（wrap/clamp/mirror）、过滤方式（point/linear/anisotropic）等。在 DirectX 12 中对应`D3D12_SAMPLER_DESC` ，在 Vulkan 中对应`VkSampler` 。

## 5.3 Pragmas（编译指令）

Pragma 是 Cg/HLSL 中的预处理器指令，告诉编译器如何处理代码。

### 5.3.1 核心 pragma

| 指令 | 功能 |
| --- | --- |
| `#pragma vertex vert` | 将 `vert` 函数标记为顶点着色器阶段 |
| `#pragma fragment frag` | 将 `frag` 函数标记为片元着色器阶段 |
| `#pragma multi_compile_fog` | 启用 Unity 雾效功能（生成雾效变体） |
| `#pragma multi_compile` | 生成多个着色器变体（全部包含在构建中） |
| `#pragma shader_feature` | 生成着色器变体（仅包含已使用的） |

> [!warning] **重要** 如果没有`#pragma vertex vert` ，GPU 无法识别`vert()` 函数是顶点着色器阶段，程序将编译失败。这两个 pragma 是 .shader 文件中**必须存在** 的指令。

### 5.3.2 multi_compile vs shader_feature

| 特性 | multi_compile | shader_feature |
| --- | --- | --- |
| 构建时包含 | 所有变体 | 仅已使用的变体 |
| 运行时动态切换 | 支持 | 不支持 |
| 构建体积 | 较大 | 较小 |
| 典型用途 | KeywordEnum（运行时切换） | Toggle（Inspector 预设） |

## 5.4 Include 文件系统

Include 指令允许将外部文件中定义的函数和变量引入当前着色器。

### 5.4.1 UnityCG.cginc 中的常用函数

| 函数 / 宏 | 功能 |
| --- | --- |
| `UnityObjectToClipPos(v.vertex)` | 将顶点从物体空间转换到裁剪空间 |
| `TRANSFORM_TEX(v.uv, _MainTex)` | 应用纹理的 Tiling & Offset |
| `UNITY_FOG_COORDS(idx)` | 在 v2f 中声明雾效插值坐标 |
| `UNITY_TRANSFER_FOG(o, o.vertex)` | 在顶点着色器中计算雾效因子 |
| `UNITY_APPLY_FOG(i.fogCoord, col)` | 在片元着色器中应用雾效 |
| `UNITY_PI` | π 常量（3.14159265） |

> [!tip] **文件位置** 内置 .cginc 文件位于 Unity 安装目录：
> Windows:`{Unity 安装路径}/Data/CGIncludes/UnityCG.cginc`
> Mac:`/Applications/Unity/Unity.app/Contents/CGIncludes/UnityCG.cginc`
> 深入阅读这些文件内容，是理解 Unity 着色器底层机制的绝佳方式。

## 5.5 顶点输入（Vertex Input）与顶点输出（Vertex Output）

在着色器中，**结构体（struct）**用于定义顶点着色器的输入和输出。Unity 默认提供了两个结构体模板：`appdata`（输入）和 `v2f`（输出）。

### 5.5.1 appdata —— 顶点输入

### 5.5.2 v2f —— 顶点输出（片元输入）

### 5.5.3 语义（Semantics）详解

语义（Semantics）是着色器编程中的核心概念。它是一个标签，告诉 GPU 某个变量对应的是物体的哪个属性。

| 语义 | 维度 | 含义 | 输入/输出 |
| --- | --- | --- | --- |
| `POSITION[n]` | float4 | 顶点位置（物体空间） | 输入 |
| `SV_POSITION` | float4 | 顶点位置（裁剪空间，系统值） | 输出 |
| `NORMAL[n]` | float3/4 | 法线方向 | 输入 |
| `TANGENT[n]` | float4 | 切线方向 | 输入 |
| `TEXCOORD[n]` | float2/3/4 | 纹理坐标或任意插值数据 | 输入/输出 |
| `COLOR[n]` | float4 | 顶点颜色 | 输入/输出 |
| `SV_Target` | float4/half4/fixed4 | 片元着色器输出（渲染目标） | 输出（片元） |
| `SV_IsFrontFace` | bool | 当前像素是否在正面 | 输入（片元） |

> [!info] **通用概念** 语义是 HLSL 的固有特性，也是 Direct3D API 的一部分。在 GLSL 中，语义通过`layout(location = n)` 实现。虽然语法不同，底层原理完全一致：通过预定义标识符在 GPU 的不同阶段间传递特定数据。

## 5.6 顶点着色器阶段与片元着色器阶段的对应关系

这两个阶段构成了 Unlit Shader 的核心处理流程。理解它们之间的**数据流对应关系**是掌握着色器编程的关键。

appdata

→

vert(appdata v)

→

v2f

→

frag(v2f i)

→

SV_Target

> [!tip] **数据流关键概念**
>   1. `v.vertex`（输入）→ `UnityObjectToClipPos` → `o.vertex`（输出）：位置变换。
>   2. `v.uv`（输入）→ `TRANSFORM_TEX` → `o.uv`（输出）：UV 变换。
>   3. 顶点着色器的输出 **v2f o** 经过 GPU 光栅化插值后，作为 **v2f i** 进入片元着色器。
>   4. 输入和输出的对应变量**维度必须一致**（如都是 float4）。

## 5.7 变量与连接向量（Connection Vectors）

回顾第 3 课中提到的"连接变量"概念：ShaderLab 属性与 Cg/HLSL 全局变量通过**同名匹配**建立连接。这里我们深入看一个完整的例子：

> [!warning] **注意事项**
>   1. 连接变量通常声明为**全局变量**（在函数之外）。`uniform` 关键字可以省略。
>   2. 纹理的连接变量有两个：`sampler2D _MainTex;`（纹理数据 + 采样状态）和 `float4 _MainTex_ST;`（Tiling xy + Offset zw）。`_ST` 后缀是 Unity 的约定。
>   3. 如果属性类型是 `Color`，连接变量的类型是 `float4`（或 `half4`/`fixed4`）。

## 5.8 完整的 Unlit Shader 解剖

> [!tip] **十一步流程** 从顶到低，一个 Unity <.shader> 文件按以下顺序组织：
> (1) Shader 声明 → (2) Properties → (3) SubShader → (4) Tags + LOD → (5) Pass → (6) Pragmas → (7) Include → (8) 连接变量 → (9) 输入/输出结构体 → (10) 顶点着色器 → (11) 片元着色器 → Fallback 结尾。
> 理解这个骨架后，你已经掌握了 Unity 着色器文件的基本结构。

## 5.9 跨引擎对照

| 概念 | Unity (.shader) | Unreal (.usf) | Godot (.gdshader) |
| --- | --- | --- | --- |
| 顶点着色器入口 | `#pragma vertex vert` | `void MainVS()` | `void vertex()` |
| 片元着色器入口 | `#pragma fragment frag` | `void MainPS()` | `void fragment()` |
| 数据精度控制 | float / half / fixed | float / half / fixed | highp / mediump / lowp |
| 顶点位置语义 | `: POSITION` | `ATTRIBUTE()` | `VERTEX` |
| UV 坐标语义 | `: TEXCOORD0` | `TEXCOORD0` | `UV` |
| 输出颜色语义 | `: SV_Target` | `SV_Target` | `COLOR` |
| Include / 模块化 | `#include "UnityCG.cginc"` | `#include "/Engine/.../Common.ush"` | 内置函数 + 自定义 shader 文件 |

> [!info] **核心洞察** 尽管语法不同，所有着色器系统共享相同的基础架构：
>   - 一个处理顶点变换的阶段（Vertex Shader）
>   - 一个处理像素颜色的阶段（Fragment / Pixel Shader）
>   - 通过语义/属性实现从 CPU/网格到 GPU 的数据传递
>   - 通过精度控制优化性能
> 一旦你在 Unity 中理解了这些概念，迁移到其他引擎只是语法适应的问题。

## 练习与回顾

> [!note]
> #### 思考题
> 1. `float4`、`half4`、`fixed4` 三者之间有什么区别？为什么 HLSL 不支持 `fixed`？
> 2. 如果你在 CGPROGRAM 块中编写代码，但希望它在 URP 中也能编译，需要修改哪些地方？
> 3. 假设你需要在 v2f 结构体中传递一个额外的法线向量到片元着色器。应该如何声明和赋值？
> 4. `SV_POSITION` 和 `POSITION` 有什么不同？为什么顶点输入和输出要用不同的语义？
> 5. 在片元着色器中，`i.uv` 的值和 `v.uv` 的值是一回事吗？为什么？

> [!note]
> #### 实践建议
> 1. 在 Unity 中创建一个 Unlit Shader，尝试将所有 `fixed` 替换为 `half`，验证 HLSL 兼容性。
> 2. 在 `appdata` 中增加一个 `float3 normal : NORMAL`，在 v2f 中也加上对应字段，在 vert 中用 `UnityObjectToWorldNormal(v.normal)` 传递它，在 frag 中输出 `normal.rgb` 作为颜色（观察法线可视化效果）。
> 3. 打开 Unity 安装目录下的 `UnityCG.cginc`，找到 `UnityObjectToClipPos` 和 `TRANSFORM_TEX` 的实现，理解其数学原理。

> [!info] **教材对照 — 已覆盖内容** 第 3.2.6 节：CGPROGRAM / HLSLPROGRAM（第 93–95 页）
> 第 3.2.7 节：数据类型（第 95–98 页）
> 第 3.2.8 – 3.2.9 节：Pragmas 与 Include（第 98–101 页）
> 第 3.3.0 – 3.3.1 节：顶点输入/输出与连接变量（第 101–106 页）
> 第 3.3.2 – 3.3.3 节：顶点着色器与片元着色器阶段（第 106–110 页）