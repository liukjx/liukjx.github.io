---
title: 第0010课：颜色与基础光照 | LearnOpenGL
description: 从本课开始，我们正式进入 OpenGL 光照渲染的世界。在此之前，我们只能看到物体的"本色"——顶点颜色或纹理颜色，没有任何立体感。而光照模型，就是让物体呈现三
tags: [opengl, 图形学, 颜色, 光照]
date: 2025-01-01
---

# 第0010课：颜色与基础光照

从本课开始，我们正式进入 OpenGL 光照渲染的世界。在此之前，我们只能看到物体的"本色"——顶点颜色或纹理颜色，没有任何立体感。而光照模型，就是让物体呈现三维立体效果的关键。

本课将介绍计算机图形学中最经典的 **Phong 光照模型**，它至今仍是几乎所有实时渲染引擎的基础。理解它，你就理解了 Unity 的 Standard Shader 和 Unreal 的 Lit Shader 背后的核心思想。

## 1. 颜色在计算机中的表示

在计算机图形学中，颜色使用 **RGB 向量** 表示，每个分量范围 [0, 1]。例如：


- 红色 = `(1.0, 0.0, 0.0)`
- 青色 = `(0.0, 1.0, 1.0)`
- 白色 = `(1.0, 1.0, 1.0)`


颜色的核心操作是 **分量相乘**（逐分量乘法，component-wise multiplication），它模拟了物理世界中的"颜色过滤"：


```
// 片段着色器中的颜色相乘
vec3 result = lightColor * objectColor;
FragColor = vec4(result, 1.0);
```


当白光 `(1.0, 1.0, 1.0)` 照射到一个反射橙色的物体 `(1.0, 0.5, 0.31)` 上时：


```
result = (1.0, 1.0, 1.0) * (1.0, 0.5, 0.31) = (1.0, 0.5, 0.31)  // 呈现橙色
```


如果光源是纯青色的 `(0.0, 1.0, 1.0)`：


```
result = (0.0, 1.0, 1.0) * (1.0, 0.5, 0.31) = (0.0, 0.5, 0.31)  // 红色被过滤掉了
```


这就是为什么在特定颜色光照下，物体的颜色会发生变化——物体只能"反射"自身颜色中存在的分量。


> [!INFO]
> **引擎连接：颜色的分量乘法**
>
> Unity Shader 中的 `col * _LightColor0`、Unreal 材质节点中的 `Multiply`，底层都是这个逐分量乘法。这是光照计算中最基本的操作。


## 2. Phong 光照模型概述

Phong 光照模型将最终光照分解为三个独立分量的叠加：


```
最终颜色 = 环境光(Ambient) + 漫反射(Diffuse) + 高光(Specular)
```


我们打开本次课程的 C++ 源文件和着色器，可以看到这个模型逐步构建的过程。

### 2.1 环境光 (Ambient)

环境光是一个很小的常量值，确保物体在完全没有直接光照的情况下也不会完全变黑，模拟了光线在场景中经过多次弹射后的间接照明效果：


```
// 片段着色器
float ambientStrength = 0.1;
vec3 ambient = ambientStrength * lightColor;
```


在 `2.1.basic_lighting_diffuse.cpp` 中，我们通过 uniform 传入光源位置和颜色：


```
lightingShader.setVec3("lightColor", 1.0f, 1.0f, 1.0f);
lightingShader.setVec3("lightPos", lightPos);
```


### 2.2 漫反射 (Diffuse) — 兰伯特余弦定律

漫反射模拟了粗糙表面将光向各个方向均匀散射的现象。它的强度取决于 **表面法向量** 与 **光线方向** 的夹角：


```
// 顶点着色器：将法向量和片元位置传递到片段着色器
FragPos = vec3(model * vec4(aPos, 1.0));
Normal = aNormal;  // 课程 2.1 中直接传递法线

// 片段着色器：漫反射计算
vec3 norm = normalize(Normal);
vec3 lightDir = normalize(lightPos - FragPos);
float diff = max(dot(norm, lightDir), 0.0);
vec3 diffuse = diff * lightColor;
```


**兰伯特余弦定律**：当光线垂直于表面时（法线与光线方向夹角为 0），漫反射最强；当光线平行于表面时（夹角 90 度），漫反射为零。这就是为什么正对光源的面最亮，侧面逐渐变暗。


> [!INFO]
> **关键理解：法线方向**
>
> 法线是理解光照的核心。在代码中，每个顶点数据包含 6 个 float：前 3 个是位置 (x,y,z)，后 3 个是法线 (nx,ny,nz)。注意 `2.1.basic_lighting_diffuse.cpp` 中的顶点布局：`glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)(3 * sizeof(float)))`。


### 2.3 高光 (Specular) — Blinn-Phong 与半程向量

高光模拟了光滑表面上的镜面反射——当观察方向接近反射方向时，会看到明亮的高光点。在 `2.2.basic_lighting_specular.cpp` 中，我们引入了观察者位置：


```
lightingShader.setVec3("viewPos", camera.Position);
```


对应的片段着色器使用 **反射向量** 计算高光：


```
// 原始 Phong 高光
float specularStrength = 0.5;
vec3 viewDir = normalize(viewPos - FragPos);
vec3 reflectDir = reflect(-lightDir, norm);
float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32);
vec3 specular = specularStrength * spec * lightColor;
```


**半程向量 (Blinn-Phong 改进)**：在实际引擎中，更常用 Blinn-Phong 模型，它使用"半程向量"代替反射向量，效率更高且效果更柔和：


```
vec3 halfDir = normalize(lightDir + viewDir);
float spec = pow(max(dot(norm, halfDir), 0.0), shininess);
```


`shininess`（高光指数/反光度）控制高光斑的大小：值越大，高光斑越小越亮（更光滑的表面）。


| shininess 值 | 效果 | 材质示例 |
| --- | --- | --- |
| 2-8 | 大而柔和的高光 | 粗糙塑料、木材 |
| 16-64 | 中等大小高光 | 一般塑料、光滑石材 |
| 64-256 | 小而锐利的高光 | 金属、玻璃、宝石 |
| 512+ | 极小的亮点 | 抛光镜面、车漆 |


## 3. 法线矩阵 (Normal Matrix)

你可能注意到 `2.1.basic_lighting_diffuse` 的顶点着色器中，法线直接传递：`Normal = aNormal`。而在 `2.2.basic_lighting_specular` 中变成了：


```
Normal = mat3(transpose(inverse(model))) * aNormal;
```


为什么？当模型矩阵包含 **非均匀缩放**（例如 `scale(1.0, 2.0, 1.0)`）时，法线会被扭曲，不再垂直于表面。解决方法是用 **法线矩阵**（模型矩阵的逆转置矩阵的 3x3 部分）来变换法线。


> [!INFO]
> **引擎连接：法线矩阵**
>
> 在 Unity 中，Shader 内建变量 `UNITY_MATRIX_IT_MV` 就是法线矩阵（逆转置模型视图矩阵）。Unreal 材质系统中，`TransformVector` 节点也处理类似的法线变换。当你在引擎中使用非均匀缩放时，引擎会自动处理法线矩阵的计算。


## 4. 完整代码结构分析

让我们来看看三个版本的递增变化：

### 版本 1：仅颜色 (1.colors)

只有 `objectColor` 和 `lightColor` 相乘，没有光照效果。物体看起来是扁平的。

### 版本 2：环境 + 漫反射 (2.1.basic_lighting_diffuse)

顶点数据加入了法线（每个顶点 6 个 float），着色器计算环境光和漫反射。物体有了立体感，但不是正对光源的面仍然是暗的。

### 版本 3：完整 Phong (2.2.basic_lighting_specular)

加入了观察者位置 `viewPos` 和高光计算。物体表面出现高光亮点，更有质感。


> [!INFO]
> **引擎连接：Unity Standard Shader / Unreal Lit Shader**
>
> Unreal Engine 的 Lit Shader 在底层使用改进版的 Blinn-Phong 模型（PBR 版本），添加了粗糙度 (Roughness)、金属度 (Metallic) 等参数。Unity 的 Standard Shader 同样基于 PBR（基于物理的渲染），但其核心仍然是法线与光线方向的点积运算——只是加入了微表面分布函数 (NDF) 和几何遮挡函数来更精确地模拟真实材质。理解 Phong 模型是你走向 PBR 的第一步，因为它们的数学骨架是相同的。


## 5. 动手练习


1. **调整光源位置**：修改 `lightPos` 的值（例如 `glm::vec3(2.0f, 0.5f, 0.0f)`），观察漫反射和高光如何随光源移动而变化。
2. **改变光源颜色**：将 `lightColor` 改为纯红 `(1.0, 0.0, 0.0)`，观察物体颜色变化。
3. **调整高光强度**：将 `specularStrength` 从 0.5 改为 0.1 和 1.0，对比效果差异。
4. **调整反光度**：把 `pow(..., 32)` 中的 32 改为 2、8、128，观察高光斑大小变化。
5. **模拟 Blinn-Phong**：在着色器中用半程向量 `normalize(lightDir + viewDir)` 替代反射向量，比较效果差异。


## 6. 推荐阅读


- [LearnOpenGL CN - 颜色](https://learnopengl-cn.github.io/02%20Lighting/01%20Colors/)
- [LearnOpenGL CN - 基础光照](https://learnopengl-cn.github.io/02%20Lighting/02%20Basic%20Lighting/)
- [Wikipedia - Phong Reflection Model](https://en.wikipedia.org/wiki/Phong_reflection_model)
- [Wikipedia - Blinn-Phong Reflection Model](https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_reflection_model)
- [Unity - Standard Shader 文档](https://docs.unity3d.com/Manual/shader-StandardShader.md)
上一课：坐标系统下一课：材质