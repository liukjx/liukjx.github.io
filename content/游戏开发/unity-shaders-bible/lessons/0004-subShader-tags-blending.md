---
title: "SubShader 渲染状态：标签、混合、剔除与模板"
tags: [unity, shader, rendering]
type: lesson
---

# SubShader 渲染状态：标签、混合、剔除与模板

> [!info] **教材对照** 本课对应The Unity Shaders Bible 第 3.1.3 – 3.2.5 节（第 59–92 页）。涵盖 SubShader 结构、Queue/RenderType 标签、Blending、AlphaToMask、ColorMask、Culling、Depth Testing、Stencil 以及 Fallback。

## 4.1 SubShader 结构

每个 `.shader` 文件至少包含一个 **SubShader**。SubShader 是 GPU 读取的配置入口，它告诉 GPU 如何渲染物体。

### 4.1.1 多 SubShader 机制

一个着色器可以包含**多个** SubShader。Unity 会从上到下遍历列表，选择**第一个**在当前硬件上兼容的 SubShader 执行。如果所有 SubShader 都不兼容，则回退到 Fallback。

> [!tip] **跨平台设计模式** 多 SubShader 是 Unity 的跨平台策略。你可以为高端 GPU（支持 Metal/Vulkan）编写一个 SubShader，为低端设备（OpenGL ES 2.0）编写另一个。这一设计模式体现了"渐进式降级"的图形编程思想——在其他引擎中通常通过材质质量级别（Material Quality Level）或平台宏实现。

### 4.1.2 Pass（渲染通道）

Pass 是 SubShader 中的最小渲染单元。一个 SubShader 可以有多个 Pass，每个 Pass 对应一次 **Draw Call**。

> [!warning] **性能提示** 一个 Pass = 一次 Draw Call。多 Pass 着色器虽然可以实现更丰富的视觉效果，但会增加 GPU 负载。在移动端应尽量避免多 Pass 着色器。

在 Scriptable Render Pipeline（URP/HDRP）中，一个 SubShader 目前**只能包含一个 Pass**。

## 4.2 渲染标签（Tags）

Tags 是键值对形式的元数据，告诉 Unity 渲染引擎"何时"以及"如何"处理这个着色器。Tags 可以写在 SubShader 级别（影响所有 Pass）或 Pass 级别（仅影响该 Pass）。

### 4.2.1 Queue 标签 —— 渲染队列

控制物体的**渲染顺序**。GPU 根据 Queue 值决定先画谁后画谁，范围从 0（最远）到 5000（最近）。

| 队列名称 | 值范围 | 默认值 | 用途 |
| --- | --- | --- | --- |
| `Background` | 0–1499 | 1000 | 天空盒等最远元素 |
| `Geometry` | 1500–2399 | 2000 | 不透明物体（默认） |
| `AlphaTest` | 2400–2699 | 2450 | 半透明裁剪（草、植被） |
| `Transparent` | 2700–3599 | 3000 | 透明物体（玻璃、粒子） |
| `Overlay` | 3600–5000 | 4000 | UI 等最上层元素 |

> [!info] **通用原理** "渲染顺序"是所有实时渲染引擎的核心概念。GPU 默认按**从远到近** 的顺序绘制物体（画家算法），Unity 的 Queue 标签允许开发者显式控制这一顺序。Unreal 中的 Translucency Sort Priority、Godot 中的 Render Priority 都服务于相同目的。

我们也可以指定**相对于默认值的偏移**：

### 4.2.2 RenderType 标签 —— 渲染类型

RenderType 标签用于**着色器替换（Shader Replacement）**机制。当使用 `Camera.SetReplacementShader()` 时，Unity 会查找场景中所有具有匹配 RenderType 的着色器并替换它们。

| 值 | 说明 |
| --- | --- |
| `Opaque` | 默认。不透明物体。 |
| `Transparent` | 透明物体。 |
| `TransparentCutout` | 有剪裁的透明物体。 |
| `Background` | 背景物体（天空盒等）。 |
| `Overlay` | 覆盖层。 |
| `TreeOpaque` / `TreeTransparentCutout` | 树木渲染。 |
| `Grass` / `GrassBillboard` | 草地渲染。 |

> [!tip] **实际用途** RenderType 替换常用于：编辑器中的场景视图特效、X-Ray 透视效果、夜视仪、红外扫描等需要在运行时替换材质显示方式的场景。

## 4.3 混合模式（Blending）

Blending（混合）是将**片元着色器输出的颜色**与**帧缓冲中已有的颜色**进行混合的过程。它在渲染管线的**合并阶段（Merge Stage）**执行，位于片元着色器之后。

> **渲染管线流程：** 

### 4.3.1 混合方程

#### 混合方程

`FinalColor = SrcFactor × SrcValue [OP] DstFactor × DstValue`

- **SrcValue**：片元着色器输出的 RGB 颜色（新像素）
- **DstValue**：帧缓冲中已有的 RGB 颜色（旧像素）
- **SrcFactor** / **DstFactor**：用于缩放 SrcValue 和 DstValue 的因子
- **[OP]**：混合操作，默认为加法（Add）

### 4.3.2 混合因子（Blend Factors）

| 因子 | 值 | 说明 |
| --- | --- | --- |
| `One` | (1, 1, 1) | 完全保留 |
| `Zero` | (0, 0, 0) | 完全忽略 |
| `SrcColor` | SrcValue 的 RGB | 源颜色 |
| `SrcAlpha` | SrcValue 的 Alpha | 源 Alpha |
| `OneMinusSrcColor` | 1 − SrcValue RGB | 源颜色取反 |
| `OneMinusSrcAlpha` | 1 − SrcValue Alpha | 源 Alpha 取反 |
| `DstColor` | DstValue 的 RGB | 目标颜色 |
| `DstAlpha` | DstValue 的 Alpha | 目标 Alpha |
| `OneMinusDstColor` | 1 − DstValue RGB | 目标颜色取反 |
| `OneMinusDstAlpha` | 1 − DstValue Alpha | 目标 Alpha 取反 |

### 4.3.3 常用混合模式

| 写法 | 效果 | 典型用途 |
| --- | --- | --- |
| `Blend SrcAlpha OneMinusSrcAlpha` | 标准透明度 | 玻璃、UI |
| `Blend One One` | 叠加（Additive） | 粒子、发光 |
| `Blend OneMinusDstColor One` | 柔和叠加 | 辉光 |
| `Blend DstColor Zero` | 乘法（Multiplicative） | 暗色滤镜 |
| `Blend DstColor SrcColor` | 2x 乘法 | 双重暗化 |
| `Blend SrcColor One` | 叠加覆盖 | 高光 |
| `Blend OneMinusSrcColor One` | 柔光 | 柔和光照 |
| `Blend Zero OneMinusSrcColor` | 负片 | 颜色反转 |

> [!warning] **关键注意点** 使用 Blending 时，务必同时设置`Tags { "Queue"="Transparent" }` 。如果不改变 Queue，默认的 Geometry 队列会在不透明物体阶段绘制，导致透明效果不正确。

## 4.4 AlphaToMask

AlphaToMask 是一种特殊的透明技术，它不像 Blending 那样产生连续的透明度级别（0.0–1.0），而是将 Alpha 通道转换为**二进制掩码**（0 或 1）。每个像素要么完全不透明，要么完全透明。

| 属性 | Blending | AlphaToMask |
| --- | --- | --- |
| 透明度级别 | 连续（0.0 – 1.0） | 离散（0 或 1） |
| 渲染队列 | 需设为 Transparent | Opaque 即可 |
| ZWrite | 通常 Off | 保持 On |
| 最佳用途 | 玻璃、渐变 | 植被剪影、传送门效果 |

## 4.5 ColorMask

ColorMask 限制 GPU 写入的颜色通道。默认写入所有四个通道（RGBA），但我们可以选择只写入特定通道。

| 写法 | 效果 |
| --- | --- |
| `ColorMask RGBA` | 写入所有通道（默认） |
| `ColorMask R` | 仅红色通道 |
| `ColorMask G` | 仅绿色通道 |
| `ColorMask B` | 仅蓝色通道 |
| `ColorMask A` | 仅 Alpha 通道 |
| `ColorMask 0` | 不写入任何颜色通道（用于模板掩码物体） |

## 4.6 Culling 与 Depth Testing

### 4.6.1 Z-Buffer（深度缓冲）与 Depth Testing

在理解 Culling 之前，必须先理解 **Z-Buffer（深度缓冲）**。每个像素不仅存储 RGB 颜色值（在 Color Buffer 中），还存储一个深度值（在 Z-Buffer 中），表示该像素到摄像机的距离。

- **Z-Buffer**：存储每个像素的深度值。靠近摄像机 = 较小值，远离 = 较大值。
- **Depth Testing**：GPU 比较新像素与 Z-Buffer 中已有像素的深度值，决定是否覆盖。
- 默认规则：**小值覆盖大值**（近处覆盖远处）。

> [!tip] **通用概念** Z-Buffer / Depth Buffer 是所有 3D 图形系统的基础设施。它解决了"物体遮挡"问题。在 DirectX、Vulkan、OpenGL 以及所有游戏引擎中，这一机制的名称和原理完全相同。

### 4.6.2 Cull（面剔除）

控制**哪些面被剔除**（不渲染）。每个多边形有内外两面，默认只渲染**正面**。

| 值 | 行为 | 用途 |
| --- | --- | --- |
| `Cull Back` | 剔除背面（默认） | 标准物体渲染 |
| `Cull Front` | 剔除正面 | 双面渲染、特殊效果 |
| `Cull Off` | 双面渲染 | 透明物体、叶子、布料 |

使用 `SV_IsFrontFace` 语义可在片元着色器中动态判断正反面：

> [!warning] **注意** `SV_IsFrontFace` 仅在`Cull Off` 时有效。如果开启了面剔除，被剔除的那一面根本不会进入片元着色器，语义无法生效。

### 4.6.3 ZWrite（深度写入）

| 值 | 行为 | 典型场景 |
| --- | --- | --- |
| `ZWrite On` | 写入深度缓冲（默认） | 不透明物体 |
| `ZWrite Off` | 不写入深度缓冲 | 透明物体、粒子 |

为什么透明物体要关闭 ZWrite？如果不关，半透明像素会写入深度值，导致它**遮挡**后面的物体，破坏透明叠加效果。同时，多个透明物体在同一深度时会产生 **Z-fighting（深度冲突）**，表现为闪烁条纹。

### 4.6.4 ZTest（深度测试）

| 值 | 操作 | 说明 |
| --- | --- | --- |
| `ZTest Less` | < | 仅当前像素深度小于缓冲值时通过 |
| `ZTest Greater` | > | 仅当前像素深度大于缓冲值时通过 |
| `ZTest LEqual` | ≤ | 默认值。小于或等于缓冲值时通过 |
| `ZTest GEqual` | ≥ | 大于或等于缓冲值时通过 |
| `ZTest Equal` | == | 仅等于缓冲值时通过 |
| `ZTest NotEqual` | != | 不等于缓冲值时通过 |
| `ZTest Always` | — | 全部通过（无深度测试） |

## 4.7 Stencil（模板测试）

模板缓冲（Stencil Buffer）为每个像素存储一个 **8 位整数值**（0–255）。Stencil Test 是一个可选的测试阶段，在片元着色器之前执行，决定当前像素是否被处理。

if ( StencilRef & StencilReadMask [Comp] StencilBufferValue & StencilReadMask )
{
    // 通过 → 继续处理该像素
}
else
{
    // 不通过 → 丢弃该像素
}

### 4.7.1 Stencil 参数

| 参数 | 说明 |
| --- | --- |
| `Ref` | 参考值，作为当前像素的模板 ID（0–255） |
| `ReadMask` | 读取掩码，默认 255（所有位参与比较） |
| `WriteMask` | 写入掩码，默认 255 |
| `Comp` | 比较函数（Never, Less, Equal, LEqual, Greater, NotEqual, GEqual, Always） |
| `Pass` | 测试通过时对模板缓冲的操作（Keep, Replace, IncrWrap, DecrWrap 等） |
| `Fail` | 测试失败时对模板缓冲的操作 |
| `ZFail` | 深度测试失败时对模板缓冲的操作 |

### 4.7.2 模板遮罩实例

Stencil 最常见的用途是**遮罩**。需要两个着色器：一个写模板（mask shader），一个读模板（被遮罩物体）。

**Step 1：遮罩着色器（写模板值 2）**

**Step 2：被遮罩物体着色器（读模板值 2）**

> [!info] **工作原理**
>   1. 遮罩物体先渲染（Geometry-1），在屏幕上画出一个"洞"：其覆盖区域的模板缓冲置为 2。
>   2. 被遮罩物体后渲染（Geometry）。在遮罩区域内，模板缓冲 = 2，`Comp NotEqual` 不通过 → 像素被丢弃。在遮罩区域外，模板缓冲 ≠ 2，`Comp NotEqual` 通过 → 正常渲染。
>   3. 结果：被遮罩物体在遮罩区域"镂空"，露出后面的物体。

## 4.8 ShaderLab Fallback

Fallback 是着色器的**最后一道保险**。当所有 SubShader 都不兼容当前 GPU 时（例如在老旧设备上运行），Unity 会使用 Fallback 指定的着色器作为替代。

> [!tip] **最佳实践** 在多平台游戏中，始终为着色器指定一个 Fallback，且建议使用 Unity 内置的通用着色器（如`Mobile/Diffuse` 、`Mobile/Unlit` ）。这确保你的游戏在极端硬件条件下至少能正确显示，而非出现粉色错误材质。

## 4.9 渲染状态汇总

| 命令 | 可选值 | 默认值 | 兼容性 |
| --- | --- | --- | --- |
| Cull | Back / Front / Off | Back | Built-in + Scriptable RP |
| ZWrite | On / Off | On | Built-in + Scriptable RP |
| ZTest | Less / Greater / LEqual / GEqual / Equal / NotEqual / Always | LEqual | Built-in + Scriptable RP |
| Blend | 多种 Factor 组合 | Off | Built-in + Scriptable RP |
| AlphaToMask | On / Off | Off | Built-in + Scriptable RP |
| ColorMask | R / G / B / A 组合 或 0 | RGBA | Built-in + Scriptable RP |
| Stencil | Ref / Comp / Pass / Fail / ZFail 等 | — | Built-in + Scriptable RP |

> [!tip] **跨引擎通用概念** 本节中所有渲染状态（Culling、Depth Testing、Blending、Stencil）都不是 Unity 特有的。它们在 Direct3D、Vulkan、Metal、OpenGL 中都有对应的 API 调用。例如：
>   - Cull → `ID3D11RasterizerState::SetCullMode`
>   - Depth Test → `vkCmdSetDepthTestEnable`
>   - Blending → `ID3D11BlendState::SetBlendState`
>   - Stencil → `glStencilFunc / glStencilOp`
> 学习 Unity ShaderLab 中的这些命令，本质上就是在学习图形 API 的通用概念。

## 练习与回顾

> [!note]
> #### 思考题
> 1. 为什么要区分五种不同的渲染队列（Background / Geometry / AlphaTest / Transparent / Overlay）？如果不区分会怎么样？
> 2. Blend One One（Additive Blending）适合什么场景？为什么它不需要修改 ZWrite？
> 3. Z-fighting 是如何产生的？为什么关闭 ZWrite 可以解决透明物体闪烁问题？
> 4. 如果你想让一个物体只显示"被其他物体遮挡的部分"（类似于 X-Ray 效果），应该如何组合 ZTest 和 Cull？
> 5. Stencil 需要至少两个着色器才能工作。有没有可能用一个着色器完成模板遮罩？为什么？

> [!note]
> #### 实践建议
> 1. 在 Unity 中创建一个半透明着色器，尝试更换不同的 Blend 模式，观察效果差异。
> 2. 实现一个简单的模板遮罩效果：一个方块作为遮罩，球体在方块区域被"掏空"。
> 3. 创建两个 Pass 的着色器：第一个 Pass 渲染背面（红色），第二个 Pass 渲染正面（蓝色）。使用 Cull Front / Cull Back 分别控制。

> [!info] **教材对照 — 已覆盖内容** 第 3.1.3 – 3.1.4 节：SubShader 结构（第 59–61 页）
> 第 3.1.5 – 3.1.6 节：Queue 与 RenderType 标签（第 61–69 页）
> 第 3.1.7 – 3.1.9 节：Blending、AlphaToMask、ColorMask（第 69–76 页）
> 第 3.2.0 – 3.2.4 节：Culling、ZWrite、ZTest、Stencil（第 76–91 页）
> 第 3.2.5 节：Pass（第 91–93 页）
> 第 3.3.4 节：Fallback（第 110–112 页）