---
title: "第13课：阴影映射（Shadow Mapping）"
tags: [unity, shader, rendering]
lesson: 13
type: lesson
---

# 第13课：阴影映射（Shadow Mapping）

教材对照：*The Unity Shaders Bible* 第八章 8.0.1 — 8.0.6

## 13.1 阴影映射的核心原理

### 13.1.1 视觉本质

在实时渲染中，阴影本质上是**一个像素是否被光源"看到"的问题**。 如果一个像素在光源的视角下是可见的，它就被照亮；如果被其他物体遮挡，它就处于阴影中。

**阴影映射（Shadow Mapping）**是 Lance Williams 在 1978 年提出的算法， 至今仍是实时渲染中最主流的阴影技术。其核心思想是**两趟渲染（Two-Pass）**：

1. **第一趟：从光源视角渲染场景**，只记录每个像素的**深度值**到一张纹理中——这张纹理就是**阴影贴图（Shadow Map）**
2. **第二趟：从主摄像机视角渲染场景**，将每个像素变换到光源视角，比较其深度与阴影贴图中存储的深度，判断该像素是否处于阴影中

> [!info] **通俗理解** 想象光源是一个"手电筒"。手电筒发出的光被物体挡住的地方就是阴影。
  阴影映射相当于在光源位置放一台摄像机，拍一张"深度照片"，然后从正常视角看场景时，
  对于每个点，检查"光源的深度照片"里这个点是否被更近的物体挡住了。

### 13.1.2 正交投影 vs 透视投影

光源的投影类型决定了阴影贴图的性质：

| 光源类型 | 投影方式 | 阴影贴图性质 | 示例 |
| --- | --- | --- | --- |
| 方向光（Directional Light） | **正交投影** | 平行投影，深度值均匀 | 太阳 |
| 点光源（Point Light） | **透视投影** | 需要 6 张贴图（立方体贴图） | 灯泡 |
| 聚光灯（Spot Light） | **透视投影** | 锥形投影，一张贴图 | 手电筒 |

## 13.2 Shadow Caster Pass（阴影投射通道）

在 Unity 的 Built-in RP 中，一个完整的阴影 Shader 需要包含**两个 Pass**：

- **Shadow Caster Pass**：负责生成阴影贴图（从光源视角渲染深度）
- **颜色 Pass**：负责正常渲染 + 采样阴影贴图

### 13.2.1 最简单的 Shadow Caster

这个最简单的 Shadow Caster 已经可以工作了。但它没有考虑 **法线偏移（Normal Bias）** 等消除阴影锯齿的参数。

### 13.2.2 使用 Unity 宏优化

Unity 提供了三个宏方便地实现完整的 Shadow Caster：

> [!tip] **宏的功能说明**
>   - `V2F_SHADOW_CASTER`：定义包含阴影计算所需的所有插值器（顶点位置、法线、切线、副切线）
>   - `TRANSFER_SHADOW_CASTER_NORMALOFFSET(o)`：变换顶点坐标 + 计算法线偏移
>   - `SHADOW_CASTER_FRAGMENT(i)`：输出阴影颜色，处理平台差异
>   - `#pragma multi_compile_shadowcaster`：编译所有阴影相关的变体

## 13.3 阴影贴图纹理的生成

### 13.3.1 坐标变换：NDC 到 UV

在颜色 Pass 中，我们需要将主摄像机视角下的像素变换到光源的投影空间中， 采样阴影贴图来判断是否处于阴影中。

核心挑战：**从 NDC（Normalized Device Coordinates）变换到 UV 坐标**。

#### NDC → UV 变换

NDC 范围：[−1, 1]

UV 范围：[0, 1]

**U = (NDC.x + 1) × 0.5**

**V = (NDC.y + 1) × 0.5**

等价于：UV = (clipPos.xy / clipPos.w + 1) × 0.5

然而，实际实现时还需要考虑两个额外问题：

- **平台差异**：OpenGL 和 Direct3D 的 UV 原点 Y 方向相反，需用 `_ProjectionParams.x` 校正
- **半像素偏移（Half-Texel Offset）**：在 D3D 9 等平台上需要微调 UV 以避免采样错误

### 13.3.2 完整的 NDCToUV 函数

## 13.4 在着色器中实现阴影

### 13.4.1 颜色 Pass 的 Vertex Shader

注意 `_ShadowMapTexture` 是 Unity 在运行时自动传入的，**不需要在 Properties 中声明**。

### 13.4.2 Fragment Shader 中的阴影采样

> [!info] **为什么是 Alpha 通道？** 阴影贴图本质上是一张灰度图——黑色表示阴影，白色表示光照。Alpha 通道的范围 [0, 1]
  正好可以表示"阴影的程度"。0 = 完全阴影，1 = 完全照亮。

## 13.5 Unity Built-in RP 的阴影优化

上述手动实现虽然直观，但效率不高。Unity 提供了三个宏来优化阴影映射：

| 宏 | 功能 | 替代什么？ |
| --- | --- | --- |
| `SHADOW_COORDS(n)` | 在 v2f 中声明阴影坐标 | 手动声明 shadowCoord |
| `TRANSFER_SHADOW(o)` | 在 Vertex Shader 中计算阴影 UV | NDCToUV 函数 |
| `SHADOW_ATTENUATION(i)` | 在 Fragment Shader 中返回阴影值 | tex2D(_ShadowMapTexture, ...) |

### 13.5.1 使用宏的优化版本

> [!warning] **注意事项** 使用这些宏时，输入/输出变量名必须遵循约定：
>   - appdata 中的 UV 必须命名为 `texcoord`（而非 `uv`）
>   - v2f 中的顶点位置必须命名为 `pos`（而非 `vertex`）
>   - 必须 `#include "AutoLight.cginc"`
>   - 必须 `#pragma multi_compile_fwdbase`
> 如果不遵守，宏内部无法正确解析变量名，导致编译错误。

## 13.6 Universal RP 中的阴影映射

在 **Universal Render Pipeline（URP）** 中实现阴影需要使用 HLSL 文件和不同的依赖库。 URP 使用 **SRP（Scriptable Render Pipeline）** 的方式管理阴影。

### 13.6.1 URP Shadow Mapping 的依赖

### 13.6.2 URP 的关键函数

> [!tip] **Built-in RP vs URP 关键差异**
>   - Built-in RP 使用 CGPROGRAM / ENDCG + UnityCG.cginc / AutoLight.cginc
>   - URP 使用 HLSLPROGRAM / ENDHLSL + Core.hlsl / Lighting.hlsl
>   - URP 中使用 `TransformObjectToHClip` 而非 `UnityObjectToClipPos`
>   - URP 使用 `GetMainLight(shadowCoord)` 获取包含阴影衰减的光照数据
>   - URP 可以通过 `UsePass "Universal Render Pipeline/Lit/ShadowCaster"` 复用内置的 Shadow Caster

## 13.7 阴影的通用原理

> [!note]
> 阴影映射（Shadow Mapping）的核心思想在所有引擎和框架中是一致的：
> - **两趟渲染**：光源视角 → 深度贴图，主视角 → 比较深度
> - **深度比较**：比较像素在光源空间的深度与阴影贴图中的最近深度
> - **坐标变换**：从主相机视角到光源投影的坐标变换
> 差异仅在于 API 名称和实现细节：
> - **OpenGL / Direct3D**：阴影贴图作为深度纹理（GL_TEXTURE_2D / ID3D11DepthStencilView）
> - **Unreal Engine**：使用 Shadow Map 或 Signed Distance Field Shadow
> - **Godot**：内置阴影映射，支持 PCF（Percentage Closer Filtering）软阴影
> - **Three.js**：DirectionalLight 和 SpotLight 自动生成 Shadow Map

### 13.7.1 常见阴影问题

| 问题 | 现象 | 原因 | 解决方案 |
| --- | --- | --- | --- |
| **阴影锯齿（Aliasing）** | 阴影边缘呈锯齿状 | 阴影贴图分辨率不足 | 提高分辨率、使用 PCF 软阴影 |
| **阴影偏移错误（Shadow Acne）** | 表面出现条带状亮暗交替 | 深度比较时的浮点精度误差 | 添加深度偏移（Bias） |
| **彼得潘现象（Peter Panning）** | 阴影脱离物体（"飘"起来） | 深度偏移过大 | 使用法线偏移（Normal Bias） |
| **硬阴影** | 阴影边界过分锐利 | 没有软阴影处理 | PCF / VSM / ESM 等软阴影技术 |

## 练习与回顾

1. **原理推导**：请解释为什么 Shadow Mapping 需要两趟渲染？能否用一趟完成？
2. **数学分析**：NDCToUV 函数中，为什么需要乘以 `_ProjectionParams.x`？在 OpenGL 和 Direct3D 中这个值分别是多少？
3. **代码比较**：对比 Built-in RP 和 URP 中阴影实现的差异。如果要在两个管线之间移植一个带阴影的 Shader，需要修改哪些部分？
4. **问题诊断**：如果你在场景中看到物体表面出现条纹状闪烁，你认为是什么问题？如何验证和修复？
5. **设计思考**：方向光使用正交投影生成阴影贴图，点光源需要立方体阴影贴图。两者在实现上有何本质不同？
6. **扩展研究**：了解 PCF（Percentage Closer Filtering）的工作原理。它与简单的阴影贴图采样有何不同？为什么能做到软阴影效果？

---

**教材对照**：*The Unity Shaders Bible* Chapter II, Section 8.0.1—8.0.6 (Pages 251-276)