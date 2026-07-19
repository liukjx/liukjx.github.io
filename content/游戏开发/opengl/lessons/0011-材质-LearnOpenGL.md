---
title: 第0011课：材质 | LearnOpenGL
description: 在上一课中，我们使用统一的 objectColor 来定义物体的颜色。但真实世界中的物体对光的响应方式各不相同：金属会强烈反射高光且高光带颜色，塑料的高光是白色
tags: [opengl, 图形学, 材质, 着色器]
date: 2025-01-01
---

# 第0011课：材质 (Materials)

在上一课中，我们使用统一的 `objectColor` 来定义物体的颜色。但真实世界中的物体对光的响应方式各不相同：金属会强烈反射高光且高光带颜色，塑料的高光是白色的且相对柔和，木材几乎没有高光。这些差异就是由 **材质** 决定的。

本课将介绍如何在 OpenGL 中定义和使用材质，让同一个光照模型下，不同物体呈现出完全不同的视觉效果。

## 1. 源文件概览

本课对应的源文件位于：


- `src/2.lighting/3.1.materials/materials.cpp` — C++ 主程序
- `src/2.lighting/3.1.materials/3.1.materials.vs` — 顶点着色器
- `src/2.lighting/3.1.materials/3.1.materials.fs` — 片段着色器（核心）


## 2. 什么是材质

**材质** 定义了物体表面如何与光线交互。在 Phong 光照模型下，一个材质由以下属性组成：


| 属性 | 含义 | 模拟效果 |
| --- | --- | --- |
| ambient | 环境色 | 物体在暗处呈现的基础颜色 |
| diffuse | 漫反射色 | 物体在光照下的"本色" |
| specular | 高光色 | 物体高光的颜色和强度 |
| shininess | 反光度 | 高光斑的集中程度（越大越亮越集中） |


## 3. GLSL 材质结构体

在 `3.1.materials.fs` 中，我们使用 GLSL 的 `struct` 来组织材质属性：


```
struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
};

struct Light {
    vec3 position;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};
```


将光照计算中的"光属性"和"材质属性"分离后，完整的 Phong 光照公式变成：


```
// ambient = 光的环境分量 × 材质的环境色
vec3 ambient = light.ambient * material.ambient;

// diffuse = 光的漫反射分量 × (漫反射因子 × 材质的漫反射色)
vec3 diffuse = light.diffuse * (diff * material.diffuse);

// specular = 光的高光分量 × (高光因子 × 材质的高光色)
vec3 specular = light.specular * (spec * material.specular);

// 最终颜色
vec3 result = ambient + diffuse + specular;
```

> [!INFO]
> **注意与上一课的区别**
>
> 上一课中，环境光和漫反射共用同一个 `objectColor`：`result = (ambient + diffuse + specular) * objectColor`。而本课中，环境色、漫反射色和高光色可以不同——这意味着你可以让物体对环境光呈现一种颜色，对漫反射光呈现另一种颜色，对高光又是一种颜色，模拟出更丰富的材质效果。


## 4. 在 C++ 代码中设置材质

在 `materials.cpp` 中，我们通过 uniform 将材质数据传递到着色器：


```
// 设置材质的各个分量
lightingShader.setVec3("material.ambient", 1.0f, 0.5f, 0.31f);
lightingShader.setVec3("material.diffuse", 1.0f, 0.5f, 0.31f);
lightingShader.setVec3("material.specular", 0.5f, 0.5f, 0.5f);
lightingShader.setFloat("material.shininess", 32.0f);
```


同时，光源的属性也被分解为三个分量：


```cpp
glm::vec3 lightColor;
lightColor.x = static_cast(sin(glfwGetTime() * 2.0));
lightColor.y = static_cast(sin(glfwGetTime() * 0.7));
lightColor.z = static_cast(sin(glfwGetTime() * 1.3));

glm::vec3 diffuseColor = lightColor * glm::vec3(0.5f);
glm::vec3 ambientColor = diffuseColor * glm::vec3(0.2f);

lightingShader.setVec3("light.ambient", ambientColor);
lightingShader.setVec3("light.diffuse", diffuseColor);
lightingShader.setVec3("light.specular", 1.0f, 1.0f, 1.0f);
```


注意这里光源颜色随时间变化（使用了 `glfwGetTime()` 的正弦值），物体的外观会随着光源颜色的变化而变化——这是实时渲染中常见的动态效果。

## 5. 不同材质的对比

这里列出一些经典材质的参数值，你可以替换到代码中观察效果：


```
// 金 (Gold)
material.ambient  = vec3(0.24725, 0.19950, 0.07450);
material.diffuse  = vec3(0.75164, 0.60648, 0.22648);
material.specular = vec3(0.62828, 0.55580, 0.36607);
material.shininess = 51.2;

// 铜 (Copper)
material.ambient  = vec3(0.19125, 0.07350, 0.02250);
material.diffuse  = vec3(0.70380, 0.27048, 0.08280);
material.specular = vec3(0.25678, 0.13762, 0.08601);
material.shininess = 12.8;

// 铬 (Chrome)
material.ambient  = vec3(0.25000, 0.25000, 0.25000);
material.diffuse  = vec3(0.40000, 0.40000, 0.40000);
material.specular = vec3(0.77460, 0.77460, 0.77460);
material.shininess = 76.8;

// 塑料 (Cyan Plastic)
material.ambient  = vec3(0.0, 0.1, 0.06);
material.diffuse  = vec3(0.0, 0.50980, 0.50980);
material.specular = vec3(0.50196, 0.50196, 0.50196);
material.shininess = 32.0;

// 橡皮 (Rubber)
material.ambient  = vec3(0.02, 0.02, 0.02);
material.diffuse  = vec3(0.01, 0.01, 0.01);
material.specular = vec3(0.4, 0.4, 0.4);
material.shininess = 10.0;
```

> [!INFO]
> **关键观察：金属 vs 非金属**
>
> 金属材质的 `specular` 分量通常带有颜色（如金色、铜色），且反射强烈；而非金属（如塑料、木材）的高光 `specular` 通常是均匀的灰色/白色。这也是基于物理渲染 (PBR) 中区分金属和非金属的核心特征之一。


## 6. 顶点着色器：法线矩阵

在 `3.1.materials.vs` 中，我们采用了正确的法线变换方式：


```
Normal = mat3(transpose(inverse(model))) * aNormal;
```


上一课已经介绍过，这里使用模型矩阵的 **逆转置矩阵的 3x3 部分** 来变换法线，确保在非均匀缩放下法线方向仍然正确。

`transpose(inverse(model))` 在 CPU 端计算代价较高，在性能敏感的场景中，可以在 C++ 端预先计算法线矩阵，然后通过 uniform 传入。但在这里为了教学清晰，直接在着色器中计算。


> [!INFO]
> **引擎连接：Unity 的材质 Inspector**
>
> 在 Unity 的材质面板中，你设置的 Albedo（反照率）、Metallic（金属度）、Smoothness（光滑度）本质上就是我们这里的材质参数：
>
>
> | Unity 材质参数 | 对应本课参数 | 说明 |
> | --- | --- | --- |
> | Albedo | ambient + diffuse | 物体的基础颜色（通常是同一张贴图） |
> | Metallic | 决定 specular 是否带颜色 | 金属的 specular 有颜色，非金属为白色 |
> | Smoothness | shininess（反向映射） | 越光滑，shininess 越高，高光斑越小 |
>
>
> Unreal Engine 的材质系统同样有 Roughness（粗糙度，与 Shininess 成反比）、Metallic 等节点，遵循相同的物理原理。


## 7. 动手练习


1. **实现材质切换**：修改 `materials.cpp`，在渲染循环中根据按键（如 1、2、3 键）切换不同的材质预设（金、铜、塑料等）。
2. **动态光源颜色**：在代码中已实现光源颜色随时间变化（使用 sin 函数），尝试修改频率或颜色范围。
3. **自定义材质**：查找真实物体的 RGB 值，创建你自己的材质——例如翡翠、红宝石、青铜。
4. **金属 vs 塑料**：固定光源颜色为白色，对比金属材质（specular 带颜色）和塑料材质（specular 为灰色）的外观差异。
5. **shininess 实验**：保持材质颜色不变，只改变 `shininess` 从 2 到 256，观察高光斑的变化。


## 8. 推荐阅读


- [LearnOpenGL CN - 材质](https://learnopengl-cn.github.io/02%20Lighting/03%20Materials/)
- [OpenGL 材质参数参考表](https://devernay.free.fr/cours/ensimag/3d/ref/Material%20in%20OpenGL.htm)
- [Unity Standard Shader 材质参数说明](https://docs.unity3d.com/Manual/StandardShaderMaterialParameters.md)
- [Unreal Engine 材质输入节点文档](https://docs.unrealengine.com/5.0/en-US/material-inputs-in-unreal-engine/)
上一课：颜色与基础光照下一课：光照贴图