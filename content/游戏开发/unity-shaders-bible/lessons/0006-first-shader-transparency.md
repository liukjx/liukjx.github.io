---
title: "第一个着色器与透明度"
tags: [unity, shader, rendering]
type: lesson
---

# 第一个着色器与透明度

从零开始编写你的第一个 Unity 着色器，理解 Shader 与 Material 的关系，学会添加半透明效果，掌握 HLSL 函数的结构，以及如何调试 Shader 错误。

> [!info] **本课目标**
>   - 理解 Shader 与 Material 的关系
>   - 编写第一个完整的 Cg/HLSL 着色器
>   - 实现透明度（Alpha Blending）效果
>   - 掌握 HLSL 函数的声明与调用
>   - 学会调试 Shader 的几种方法
>   - 为着色器添加 URP 兼容性

## 1. Shader 与 Material 的关系

在深入学习着色器之前，必须先厘清两个极易混淆的核心概念：**Shader（着色器）**和 **Material（材质）**。

> [!info] **一句话理解** Material 是 Shader 的"容器"，Shader 是 Material 的"计算核心"。

更具体地说：

- **Shader** 是一段运行在 GPU 上的程序，它定义了"如何计算一个表面的颜色"。它接收顶点数据、纹理、光照信息等作为输入，输出最终像素的颜色。
- **Material** 是 Unity 编辑器中的一个可配置资源，它**引用**一个 Shader，并为该 Shader 的参数赋值（比如贴图、颜色、数值等）。

#### Shader

= 数学公式

定义了计算过程 但不能直接用在物体上

→

#### Material

= 套用了公式的表格

包含公式 + 具体参数值 可以直接赋给物体

| 维度 | Shader | Material |
| --- | --- | --- |
| 本质 | GPU 程序（代码） | 资源对象（参数集合） |
| 能否单独使用 | 不能 — 必须通过 Material | 不能 — 必须引用 Shader |
| 在 Unity 中的文件格式 | `.shader` | `.mat` |
| 修改方式 | 通过代码编辑器修改 | 通过 Inspector 面板调整 |
| 类比 | 烹饪食谱 | 按食谱做好的菜 |

> [!tip] **工作流程** 在 Unity 中创建一个 Shader → 创建一个 Material → 将 Shader 赋给 Material → 将 Material 拖到 3D 物体上 → 在场景中看到效果。

## 2. 第一个完整着色器

让我们从 Unity 内置的 **Unlit Shader** 模板开始，创建一个最基本的着色器。

### 2.1 创建步骤

1. 在 Project 窗口中右键 → Create → Shader → Unlit Shader
2. 命名为 `USB_simple_color`
3. 双击打开，观察其结构

### 2.2 ShaderLab 结构拆解

Shader

{

Properties

{

_MainTex (

, 2D) =

{}

_Color (

, Color) = (1, 1, 1, 1)

}

SubShader

{

Tags {

="Opaque" }

LOD 100

Pass

{

CGPROGRAM

vertex vert

fragment frag

ENDCG

}

}

Fallback

}

### 2.3 添加颜色属性

现在我们来扩展这个着色器。在 `Properties` 中添加一个颜色属性，使材质可以改变纹理的色调：

然后在 CGPROGRAM 中声明连接变量：

最后在片元着色器中使用它：

> [!tip] **注意精度关键字** 在 Cg 中使用`fixed4` （低精度），在 HLSL 中使用`half4` （中精度）。`fixed` 适用于颜色和 UV 等低动态范围数据，`half` 适用于大多数中间计算，`float` 适用于位置和矩阵等高精度数据。

## 3. 添加透明度（Alpha Blending）

现在我们有了颜色属性，它的 RGBA 四个通道都可以在 Inspector 中调整。但你可能会发现：**修改 Alpha 通道没有效果**。这是因为我们的着色器还没有启用**混合（Blending）**。

### 3.1 什么是 Blending？

Blending 是 GPU 在像素着色器之后执行的一个**固定功能阶段**，它决定新计算出的颜色（Src）如何与帧缓冲区中已有的颜色（Dst）进行混合。对于透明度来说，我们使用 Alpha 通道来控制混合比例。

### 3.2 配置透明度

需要在 SubShader 中做三件事：

#### Blend 运算公式

`Blend SrcAlpha OneMinusSrcAlpha` 对应的混合方程为：

FinalColor = SrcColor × SrcAlpha + DstColor × (1 - SrcAlpha)

这意味着：新颜色以 Alpha 比例叠加，背景颜色以 (1 - Alpha) 比例透出。Alpha = 1 时不透明，Alpha = 0 时完全透明。

| 元素 | 作用 |
| --- | --- |
| `"RenderType"="Transparent"` | 标记渲染类型，供后处理或 Shader Replacement 使用 |
| `"Queue"="Transparent"` | 将物体放入透明渲染队列（索引 3000+），确保从远到近排序 |
| `Blend SrcAlpha OneMinusSrcAlpha` | 启用 Alpha 混合，标准透明度混合模式 |

> [!warning] **常见误区** 透明物体**不会写入深度缓冲** （默认情况下），所以如果两个透明物体前后重叠，它们的渲染顺序取决于距离摄像机的远近。排序不当时会出现"透明排序错误"——这是实时图形学中的经典难题。

## 4. HLSL 函数的结构

在 HLSL/Cg 中定义函数与 C# 类似，但有一些关键差异。函数可以有两种形式：

### 4.1 空函数（Void 函数）

不返回值，通过 `out` 关键字输出结果：

在片元着色器中调用：

### 4.2 返回值函数

直接返回计算结果，不需要精度后缀：

### 4.3 函数声明修饰符

| 修饰符 | 含义 | 示例 |
| --- | --- | --- |
| `in` | 输入参数（默认） | `in float3 Normal` |
| `out` | 输出参数（不初始化传入） | `out float3 Out` |
| `inout` | 输入输出参数 | `inout float3 Value` |
| `uniform` | 全局常量（来自 CPU） | `uniform float4 _Color` |
| `const` | 编译期常量 | `const float PI = 3.14159` |

> [!tip] **重要规则：函数必须先声明后使用** GPU 编译器从上到下读取代码。如果你的函数 A 调用了函数 B，那么函数 B**必须定义在函数 A 之前** ，否则需要先声明函数原型。

## 5. 调试 Shader

调试着色器与调试 C# 脚本非常不同——你不能使用 `Debug.Log()`。在 GPU 上，调试的主要方法是：**用颜色可视化数据**。

### 5.1 三种关键颜色

记住这三个颜色的意义，它们是你调试时最重要的线索。

### 5.2 常见错误及排查

**错误一：缺少分号**

Unity 的控制台会提示：*"Shader error in 'USB/USB_simple_color': ... expected ';' at line 61"*。注意报错行号可能指向实际问题的**下一行**——GPU 编译器到下一行才发现缺少分号。

**错误二：向量维度不匹配**

控制台会报："cannot convert from 'half2' to 'half4'"。解决方法：只对需要的通道赋值，或者使用 `.xyz` 等 swizzle 操作。

### 5.3 用颜色可视化调试

这是最强大的调试技术。如果你想查看某个中间值，直接把它输出为颜色：

> [!tip] **颜色调试三部曲**
>   1. 想查看某个变量的值 → 将它输出为颜色
>   2. 白色 = 最大值，黑色 = 最小值，灰色 = 中间值
>   3. 确认值域范围正确后，再继续下一步

### 5.4 关于洋红色的其他原因

着色器出现洋红色还可能因为：

- **渲染管线不匹配**：导入的资产使用 Built-in RP 的 Standard Shader，但项目是 URP
- 解决方法：将材质切换到 Shader Graph 或对应的 URP 着色器

## 6. 添加 URP 兼容性

Universal Render Pipeline（URP）只支持 **HLSL**，不支持 Cg。要让我们的着色器在 URP 下正常工作，需要做以下调整。

### 6.1 修改 Tags

### 6.2 替换代码块声明

### 6.3 替换依赖文件

### 6.4 替换顶点变换函数

### 6.5 处理精度差异

URP 默认不支持 `fixed` 类型。有两种解决方式：

- **手动替换**：将所有 `fixed` 改为 `half`
- **包含兼容头文件**：`#include "HLSLSupport.cginc"` 后仍然可以使用 `fixed`

| Built-in RP | URP |
| --- | --- |
| `CGPROGRAM ... ENDCG` | `HLSLPROGRAM ... ENDHLSL` |
| `#include "UnityCG.cginc"` | `#include "Core.hlsl"` |
| `UnityObjectToClipPos()` | `TransformObjectToHClip()` |
| `UNITY_FOG_COORDS / UNITY_TRANSFER_FOG / UNITY_APPLY_FOG` | 需替换为 URP 雾函数 |
| `fixed` 类型可用 | 需 `HLSLSupport.cginc` 或替换为 `half` |

> [!warning] **通用着色器概念 vs. Unity 特定**
>   - **通用（跨引擎）**：顶点/片元着色器模型、HLSL 语法、Blending 操作、Transform 矩阵概念
>   - **Unity 特定**：ShaderLab Tags、CGPROGRAM/HLSLPROGRAM 块、UnityCG.cginc/Core.hlsl 路径、`_Time` 等内置变量
> 理解这两者的区别，能帮助你将来轻松迁移到 Unreal、Godot 等其他引擎。

## 7. 本课总结

| 概念 | 要点 |
| --- | --- |
| Shader vs. Material | Shader = GPU 程序，Material = 参数容器 |
| 着色器结构 | Shader → Properties → SubShader → Pass → CG/HLSL 程序 |
| 透明度 | 需要设置 RenderType、Queue、Blend 三项 |
| 函数声明 | void 函数需要精度后缀 + out 参数；返回值函数不需要 |
| Shader 调试 | 用颜色可视化数据：白=1，黑=0，洋红=错误 |
| URP 兼容 | 替换 CG→HLSL，替换 .cginc→Core.hlsl，替换顶点变换函数 |

## 8. 练习与回顾

### 思考题

1. **Shader 和 Material 的关系**：用自己的话解释。为什么不直接把 Shader 赋给 3D 物体？
2. **透明度的三项配置**：`RenderType`、`Queue`、`Blend` 各自的作用是什么？漏掉其中一项会怎样？
3. **调试方法**：如果物体显示为洋红色，有哪些可能的原因？如何排查？
4. **函数类型**：void 函数和返回值函数有什么区别？什么时候用哪种？
5. **URP 迁移**：将 Built-in RP 的着色器迁移到 URP 需要做哪几个步骤？
6. **动手实验**：在 Unity 中创建一个 Unlit Shader，添加一个 `_Brightness` 属性（Range 类型），在片元着色器中将纹理颜色乘以这个亮度值。

## 9. 教材对照

> [!info] **教材对照**
> 本课对应《The Unity Shaders Bible》第 I 章：
>   - 4.0.1 Shader 与 Material 的类比 (p.112)
>   - 4.0.2 第一个 Cg/HLSL 着色器 (p.112-114)
>   - 4.0.3 添加透明度 (p.114-115)
>   - 4.0.4 HLSL 函数的结构 (p.115-118)
>   - 4.0.5 调试 Shader (p.119-122)
>   - 4.0.6 添加 URP 兼容性 (p.122-126)