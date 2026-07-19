---
title: "第12课：光照贴图 | LearnOpenGL"
description: 上一课中，我们为整个物体定义了统一的材质属性——所有面共享相同的环境色、漫反射色、高光色和反光度。但在真实世界中，一个物体表面的不同区域通常有不同的材质属性：例
tags: [opengl, 图形学, 光照, 纹理, 坐标系统, 材质]
date: 2025-01-01
---

# 第0012课：光照贴图 (Lighting Maps)

上一课中，我们为整个物体定义了统一的材质属性——所有面共享相同的环境色、漫反射色、高光色和反光度。但在真实世界中，一个物体表面的不同区域通常有不同的材质属性：例如一个生锈的铁箱，铁的部分有金属光泽，而锈蚀的部分则粗糙黯淡。

本课介绍 **光照贴图**——使用纹理来逐像素控制物体的材质属性，让同一个模型的不同部分展现出不同的光照响应。

## 1. 源文件概览

本课对应两个逐步递进的版本：


| 版本 | 源文件路径 | 功能 |
| --- | --- | --- |
| 4.1 | src/2.lighting/4.1.lighting_maps_diffuse_map/ | 使用漫反射贴图替代环境色 + 漫反射色 |
| 4.2 | src/2.lighting/4.2.lighting_maps_specular_map/ | 加入高光贴图，单独控制高光区域 |


## 2. 为什么需要光照贴图

回顾上一课，我们给整个物体设置了一个 uniform 材质值：


```
lightingShader.setVec3("material.diffuse", 1.0f, 0.5f, 0.31f);    // 整个物体都是橙色
lightingShader.setVec3("material.specular", 0.5f, 0.5f, 0.5f);   // 整个物体都有高光
```


但想象一个砖墙：有些砖块表面光滑、有些粗糙、有些覆盖着青苔。用 uniform 只能让整面墙表现相同。我们需要的是 **逐像素的材质属性控制**，这就是光照贴图发挥作用的地方。


> [!INFO]
> **核心思想**
>
> 光照贴图本质上就是把材质属性存储到纹理中。在片段着色器中，从纹理采样得到的值替代了之前 uniform 设置的固定值。


## 3. 顶点数据的变化：加入纹理坐标

对比本课和上一课的顶点数据：


```
// 上一课（材质）：顶点只有位置 + 法线，每行 6 个 float
-0.5f, -0.5f, -0.5f,  0.0f,  0.0f, -1.0f,

// 本课（光照贴图）：顶点包含位置 + 法线 + 纹理坐标，每行 8 个 float
-0.5f, -0.5f, -0.5f,  0.0f,  0.0f, -1.0f,  0.0f,  0.0f,
  // 位置 (3)           法线 (3)              纹理坐标 (2)
```


对应顶点属性设置（在 `lighting_maps_diffuse.cpp` 中）：


```
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)0);       // 位置
glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)(3 * sizeof(float))); // 法线
glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)(6 * sizeof(float))); // 纹理坐标
```


## 4. 漫反射贴图 (Diffuse Map)

在 `4.1.lighting_maps_diffuse_map` 中，我们将材质的 `diffuse` 属性从 `vec3` 改为 `sampler2D`（纹理采样器）：


```
struct Material {
    sampler2D diffuse;  // 不再是 vec3，而是纹理
    vec3 specular;
    float shininess;
};
```


片段着色器中的光照计算也随之改变——从纹理中采样颜色：


```
// ambient = 光的环境分量 × 从漫反射贴图采样
vec3 ambient = light.ambient * texture(material.diffuse, TexCoords).rgb;

// diffuse = 光的漫反射分量 × 漫反射因子 × 从漫反射贴图采样
vec3 diffuse = light.diffuse * diff * texture(material.diffuse, TexCoords).rgb;
```


在 C++ 代码中，加载纹理并绑定到纹理单元：


```
unsigned int diffuseMap = loadTexture(FileSystem::getPath("resources/textures/container2.png").c_str());

// 配置着色器，告诉它漫反射贴图使用纹理单元 0
lightingShader.use();
lightingShader.setInt("material.diffuse", 0);

// 渲染循环中绑定纹理
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, diffuseMap);
```


**漫反射贴图同时取代了环境色和漫反射色**——因为通常情况下，物体的环境色和漫反射色就是同一个纹理。这在 PBR 工作流中也正是 Albedo 贴图的功能。

## 5. 高光贴图 (Specular Map)

在 `4.2.lighting_maps_specular_map` 中，更进一步把 `specular` 也改为纹理：


```
struct Material {
    sampler2D diffuse;
    sampler2D specular;  // 高光贴图
    float shininess;
};
```


片段着色器中，从高光贴图采样来控制高光强度：


```
vec3 specular = light.specular * spec * texture(material.specular, TexCoords).rgb;
```


C++ 端加载第二张纹理并绑定到纹理单元 1：


```
unsigned int diffuseMap = loadTexture("resources/textures/container2.png");
unsigned int specularMap = loadTexture("resources/textures/container2_specular.png");

lightingShader.setInt("material.diffuse", 0);
lightingShader.setInt("material.specular", 1);

// 渲染循环
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, diffuseMap);
glActiveTexture(GL_TEXTURE1);
glBindTexture(GL_TEXTURE_2D, specularMap);
```

> [!INFO]
> **高光贴图的原理**
>
> 容器图片中，铁框部分是金属，会有强烈的高光反射；而木板部分不是金属，几乎没有高光。高光贴图 `container2_specular.png` 中，铁框区域为白色（高光强），木板区域为黑色（无高光）。这样在光照计算中，`texture(material.specular, TexCoords).rgb` 就会在铁框处返回白色 `(1.0, 1.0, 1.0)`，在木板处返回黑色 `(0.0, 0.0, 0.0)`——完美控制哪些区域出现高光。


## 6. 加载纹理的实用函数

两个版本的 C++ 代码中都包含了一个 `loadTexture` 函数：


```
unsigned int loadTexture(char const * path)
{
    unsigned int textureID;
    glGenTextures(1, &textureID);

    int width, height, nrComponents;
    unsigned char *data = stbi_load(path, &width, &height, &nrComponents, 0);
    if (data)
    {
        GLenum format;
        if (nrComponents == 1)      format = GL_RED;
        else if (nrComponents == 3) format = GL_RGB;
        else if (nrComponents == 4) format = GL_RGBA;

        glBindTexture(GL_TEXTURE_2D, textureID);
        glTexImage2D(GL_TEXTURE_2D, 0, format, width, height, 0, format, GL_UNSIGNED_BYTE, data);
        glGenerateMipmap(GL_TEXTURE_2D);

        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

        stbi_image_free(data);
    }
    return textureID;
}
```


这个函数使用 `stb_image.h` 库加载图片，生成 mipmap，设置纹理包裹和过滤参数，是开发中常用的纹理加载模板。

## 7. 从材质到贴图的演进逻辑


| 阶段 | 漫反射 | 高光 | 控制粒度 |
| --- | --- | --- | --- |
| 第0010课（基础光照） | uniform vec3（与 objectColor 相乘） | uniform float（固定强度） | 整个物体 |
| 第0011课（材质） | uniform vec3 material.diffuse | uniform vec3 material.specular | 整个物体 |
| 第0012课（光照贴图） | sampler2D material.diffuse | sampler2D material.specular | 逐像素 |


这就是实时渲染材质系统的演化路径：从 uniform 到纹理，从整体到逐像素，越来越精细。


> [!INFO]
> **引擎连接：Unity 的 Albedo + Smoothness 贴图**
>
> 在 Unity 的 Standard Shader 中：
>
>
> - **Albedo 贴图** 对应本课的漫反射贴图，定义了物体的基础颜色。引擎内部将其同时用于环境光和漫反射光的计算。
> - **Smoothness 贴图** 通常存储在 Metallic 贴图的 Alpha 通道中，控制表面的光滑程度（等价于 shininess 的倒数）。光滑的区域反射强（高光亮），粗糙的区域反射弱（高光暗或没有）。
>
>
> Unreal Engine 同样使用类似的工作流：Base Color 贴图对应漫反射，Roughness 贴图控制粗糙度（与 shininess 反向相关），Specular 贴图控制高光强度。这些贴图共同构成了 PBR 材质的核心。
>
>
>
> 简单来说：引擎的材质贴图系统，就是本课光照贴图思想的工程化扩展。


## 8. 动手练习


1. **使用自己的贴图**：找一张砖墙或其他材质的图片，用图片编辑软件创建对应的漫反射贴图和高光贴图（高光贴图中，光滑部分为白色、粗糙部分为黑色），替换源文件中的纹理路径。
2. **交换贴图通道**：故意把高光贴图传入漫反射纹理单元，观察效果——你会看到物体的颜色完全变成了高光贴图的灰度值。
3. **单通道高光贴图**：将高光贴图改为 `GL_RED` 格式的单通道纹理（只需要存储灰度值），修改着色器从 `.rgb` 改为 `.rrr`，观察是否仍能正常工作。
4. **添加法线贴图**（进阶）：搜索 "normal mapping" 概念，尝试理解如何用纹理存储法线方向来增加表面细节。这将是后续课程的内容。
5. **组合纹理**：在片段着色器中尝试将漫反射贴图和高光贴图的值进行混合，创造特殊的视觉效果。


## 9. 推荐阅读


- [LearnOpenGL CN - 光照贴图](https://learnopengl-cn.github.io/02%20Lighting/04%20Lighting%20maps/)
- [LearnOpenGL CN - 投光物（下一课）](https://learnopengl-cn.github.io/02%20Lighting/05%20Light%20casters/)
- [Unity Standard Shader 材质属性文档](https://docs.unity3d.com/Manual/StandardShaderMaterialProperties.md)
- [Unreal Engine PBR 文档](https://docs.unrealengine.com/5.0/en-US/physically-based-rendering-in-unreal-engine/)
上一课：材质下一课：投光物