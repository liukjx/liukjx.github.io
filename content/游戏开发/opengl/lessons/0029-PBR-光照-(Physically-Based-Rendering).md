---
title: 第0029课：PBR 光照 (Physically Based Rendering)
description: 基于物理的渲染 —— 现代图形学的光照基石
tags: [opengl, 图形学, PBR, 纹理, 材质]
date: 2025-01-01
---

LearnOpenGL 系列 · 最终章


# 第0029课：PBR 光照


*基于物理的渲染 —— 现代图形学的光照基石*


## 一、概述

PBR（Physically Based Rendering，基于物理的渲染）是当代游戏引擎与影视渲染的事实标准。与之前课程中使用的 Blinn-Phong 经验模型不同，PBR 建立在真实物理定律之上，能够用 **统一参数**（金属度、粗糙度）描述从绝缘体到金属的完整材质范围。

本课对应的源文件：


- `src/6.pbr/1.1.lighting/lighting.cpp` — 无纹理 PBR，纯参数调节
- `src/6.pbr/1.2.lighting_textured/lighting_textured.cpp` — 基于纹理的 PBR 材质


## 二、PBR 的三大理论基础

### 2.1 微平面模型 (Microfacet Model)

任何表面在微观尺度上都是由大量朝向各异的小平面（微平面）构成的。粗糙表面微平面朝向混乱，高光分散；光滑表面微平面朝向一致，高光集中。微平面模型认为：**表面反射的光是所有微平面各自反射光的总和**。

### 2.2 能量守恒

出射光的总能量 **不超过** 入射光的总能量。表现为：粗糙度越高，高光越扩散但总面积不变；金属度越高，反射率越高，漫反射越弱甚至消失。


> **关键原则**：反射能量 + 折射（漫反射）能量 = 入射总能量。金属只反射不折射，绝缘体兼顾两者。


### 2.3 菲涅尔效应 (Fresnel Effect)

视线与表面法线夹角越大，反射越强。比如站在湖边俯视能看到水底，平视只能看到水面倒影。数学上用 Schlick 近似描述这一现象。

## 三、Cook-Torrance BRDF

PBR 的核心是 Cook-Torrance 微平面 BRDF（双向反射分布函数），它将反射分为两部分：


```

fr = kd * flambert + ks * fcook-torrance

```


### 3.1 漫反射项：Lambert


```

flambert = c / π

```


其中 c 为表面颜色（albedo）。除以 π 是为了归一化半球积分。

### 2.2 高光项：Cook-Torrance


```

fcook-torrance = (D * G * F) / (4 * (ωo·n) * (ωi·n))

```


三个核心函数分别为法线分布函数 D、几何函数 G、菲涅尔方程 F。

## 四、三大核心函数详解

### 4.1 法线分布函数 NDF — GGX/Trowbridge-Reitz

NDF 描述微平面法线方向与半向量（h）一致的概率密度。粗糙度越高，分布越分散。


```

NDF_GGX(n, h, α) = α² / (π * ((n·h)² * (α² - 1) + 1)²)

```


其中 α = roughness²，n 为宏观法线，h 为半向量。

GGX 的"长尾"特性使其高光过渡比 Blinn-Phong 更加自然，尤其在掠射角时表现优异。

### 4.2 几何函数 — Smith

几何函数描述微平面之间的自遮挡效应。粗糙表面自遮挡更严重，高光因此减弱。


```

G(n, v, l, k) = GSchlickGGX(n, v, k) * GSchlickGGX(n, l, k)

GSchlickGGX(n, x, k) = (n·x) / ((n·x) * (1 - k) + k)

```


对于 IBL 使用 k = (roughness²) / 2，直接光照使用 k = (roughness + 1)² / 8。

### 4.3 菲涅尔方程 — Schlick 近似


```

F(h, v, F₀) = F₀ + (1 - F₀) * (1 - (h·v))⁵

```


F₀ 是表面的基础反射率，对绝缘体通常为 0.04，对金属使用其反射颜色（如金为 (1.0, 0.71, 0.29)）。

## 五、金属度-粗糙度工作流

这是业界最主流的 PBR 参数化方案：


| 参数 | 含义 | 取值范围 |
| --- | --- | --- |
| albedo | 表面颜色（漫反射/反射底色） | [0, 1] RGB |
| metallic | 金属度，0=绝缘体，1=金属 | [0, 1] |
| roughness | 粗糙度，0=镜面，1=完全粗糙 | [0, 1] |
| ao | 环境光遮蔽，模拟角落阴影 | [0, 1] |


在 `lighting.cpp` 中，7x7 个球体以 **行=金属度**、**列=粗糙度** 的方式排列，直观展示了参数变化对最终渲染结果的影响：


```

for (int row = 0; row < nrRows; ++row) {
    shader.setFloat("metallic", (float)row / (float)nrRows);
    for (int col = 0; col < nrColumns; ++col) {
        shader.setFloat("roughness", clamp((float)col / (float)nrColumns, 0.05f, 1.0f));
        // ... 渲染球体
    }
}

```


## 六、基于纹理的 PBR 材质

在 `lighting_textured.cpp` 中，五个 PBR 纹理通道被分别加载并绑定到不同的纹理单元：


- **albedoMap** — 基础颜色
- **normalMap** — 法线贴图，增加细节凹凸感
- **metallicMap** — 金属度贴图
- **roughnessMap** — 粗糙度贴图
- **aoMap** — 环境光遮蔽贴图

> **实践中**：这些纹理通常由 Substance Painter、Quixel Mixer 等工具生成，是 PBR 材质管线中的标准输出。


## 七、引擎连接：Unity / Unreal 的 PBR

### Unity Standard Shader

Unity 的内置 Standard Shader 正是本文所述金属度-粗糙度 PBR 的工程实现。其 Inspector 面板上的 Albedo、Metallic、Smoothness（1-粗糙度）直接对应 PBR 参数。

### Unreal Engine 的 Lit Shader

Unreal 的材质系统的 Base Color、Metallic、Roughness 参数完全对应本课的 PBR 公式。Unreal 还额外提供了 Specular 参数（默认 0.5），用于细微调节绝缘体的 F₀。


> **理解即力量**：学完本课，Unity/Unreal 材质面板上的每一个滑块，你都知道它在 GPU 上如何影响最终的像素颜色。


## 八、练习


> [!INFO]
> **练习 1：金属度对比**
> 修改 `lighting.cpp` 中的 metallic 值数组，观察金属球与非金属球的视觉差异——注意金属球没有漫反射颜色、反射更强。

> [!INFO]
> **练习 2：粗糙度对比**
> 将 roughness 固定为 0.0（完美镜面），观察高光变成极小的亮点；再设为 1.0，观察高光完全扩散。

> [!INFO]
> **练习 3：菲涅尔观察**
> 旋转摄像机视角使视线接近掠射角（与表面平行），观察绝缘体表面高光急剧增强的菲涅尔效应。
[← 上一课：高级光照](../lessons/0028-advanced-lighting.md)[下一课：IBL（基于图像的光照） →](../lessons/0030-ibl.md)