---
title: 第0014课：多光源 (Multiple Lights) | LearnOpenGL 中文教程
description: 在上一课中，我们学习了平行光、点光源和聚光灯三种光源类型。实际游戏场景中几乎不会只有一盏灯——一个房间可能有顶灯、台灯、窗外射入的阳光，还有角色的手电筒。本课将
tags: [opengl, 图形学, 光照]
date: 2025-01-01
---

LearnOpenGL 第二阶段：光照


# 第 0014 课：多光源

在上一课中，我们学习了平行光、点光源和聚光灯三种光源类型。实际游戏场景中几乎不会只有一盏灯——一个房间可能有顶灯、台灯、窗外射入的阳光，还有角色的手电筒。本课将学习如何在片段着色器中同时处理多个光源。

## 1. 多光源的核心思想

多光源的数学原理非常简单：**每个光源独立计算其贡献，然后累加**。


```
finalColor = light0_contribution + light1_contribution + light2_contribution + ...
```


这被称为光照的**线性叠加**。在现实物理中光确实是这样叠加的——多盏灯同时照亮一面墙，总亮度等于每盏灯贡献之和。

## 2. 代码组织：三个光源结构体

源文件 `6.multiple_lights.fs` 定义了三种独立的结构体，每种对应一种光源类型：


```
struct DirLight {
    vec3 direction;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

struct PointLight {
    vec3 position;
    float constant;
    float linear;
    float quadratic;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

struct SpotLight {
    vec3 position;
    vec3 direction;
    float cutOff;
    float outerCutOff;
    float constant;
    float linear;
    float quadratic;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};
```


注意这里每种光源的 `ambient/diffuse/specular` 是各自独立的——这样每盏灯就可以有不同的颜色和强度。

## 3. 数组与计数


```
#define NR_POINT_LIGHTS 4

uniform PointLight pointLights[NR_POINT_LIGHTS];
```


片段着色器通过数组来接收多个点光源。GLSL 支持在着色器中使用固定大小的数组，uniform 上传时的命名约定为 `pointLights[0].position`、`pointLights[1].position` 等。

## 4. 封装光照计算函数

为了让代码更清晰，源文件将每种光源的计算封装为独立的函数：


```
// 函数原型
vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir);
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir);
vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir);
```


每个函数的内部逻辑就是对之前学过的对应光源类型的完整计算。

### 4.1 CalcDirLight——平行光计算


```
vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir) {
    vec3 lightDir = normalize(-light.direction);

    float diff = max(dot(normal, lightDir), 0.0);

    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);

    vec3 ambient  = light.ambient  * vec3(texture(material.diffuse, TexCoords));
    vec3 diffuse  = light.diffuse  * diff * vec3(texture(material.diffuse, TexCoords));
    vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));

    return (ambient + diffuse + specular);
}
```


### 4.2 CalcPointLight——点光源计算


```
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir) {
    vec3 lightDir = normalize(light.position - fragPos);

    float diff = max(dot(normal, lightDir), 0.0);

    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);

    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance
                       + light.quadratic * (distance * distance));

    vec3 ambient  = light.ambient  * vec3(texture(material.diffuse, TexCoords));
    vec3 diffuse  = light.diffuse  * diff * vec3(texture(material.diffuse, TexCoords));
    vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));

    ambient  *= attenuation;
    diffuse  *= attenuation;
    specular *= attenuation;

    return (ambient + diffuse + specular);
}
```


### 4.3 CalcSpotLight——聚光灯计算


```
vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir) {
    vec3 lightDir = normalize(light.position - fragPos);

    float diff = max(dot(normal, lightDir), 0.0);

    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);

    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance
                       + light.quadratic * (distance * distance));

    float theta = dot(lightDir, normalize(-light.direction));
    float epsilon = light.cutOff - light.outerCutOff;
    float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0);

    vec3 ambient  = light.ambient  * vec3(texture(material.diffuse, TexCoords));
    vec3 diffuse  = light.diffuse  * diff * vec3(texture(material.diffuse, TexCoords));
    vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));

    ambient  *= attenuation * intensity;
    diffuse  *= attenuation * intensity;
    specular *= attenuation * intensity;

    return (ambient + diffuse + specular);
}
```


## 5. Main 函数中的累加


```cpp
void main() {
    vec3 norm = normalize(Normal);
    vec3 viewDir = normalize(viewPos - FragPos);

    // 阶段 1：平行光（全局环境光+日光）
    vec3 result = CalcDirLight(dirLight, norm, viewDir);

    // 阶段 2：4 个点光源
    for (int i = 0; i < NR_POINT_LIGHTS; i++)
        result += CalcPointLight(pointLights[i], norm, FragPos, viewDir);

    // 阶段 3：聚光灯（手电筒）
    result += CalcSpotLight(spotLight, norm, FragPos, viewDir);

    FragColor = vec4(result, 1.0);
}
```


这段代码清晰地展示了多光源的累加过程：**先计算平行光，再循环累加所有点光源，最后加上聚光灯**。

## 6. C++ 端：上传多光源数据

在 `multiple_lights.cpp` 中，4 个点光源的位置定义在场景中：


```cpp
glm::vec3 pointLightPositions[] = {
    glm::vec3( 0.7f,  0.2f,  2.0f),
    glm::vec3( 2.3f, -3.3f, -4.0f),
    glm::vec3(-4.0f,  2.0f, -12.0f),
    glm::vec3( 0.0f,  0.0f, -3.0f)
};
```


然后逐帧上传每个光源的 uniform 数据：


```
// 点光源 0
lightingShader.setVec3("pointLights[0].position", pointLightPositions[0]);
lightingShader.setVec3("pointLights[0].ambient", 0.05f, 0.05f, 0.05f);
lightingShader.setVec3("pointLights[0].diffuse", 0.8f, 0.8f, 0.8f);
lightingShader.setVec3("pointLights[0].specular", 1.0f, 1.0f, 1.0f);
lightingShader.setFloat("pointLights[0].constant", 1.0f);
lightingShader.setFloat("pointLights[0].linear", 0.09f);
lightingShader.setFloat("pointLights[0].quadratic", 0.032f);

// 点光源 1-3：同理...
```


另外，还绘制了 4 个发光小方块来表示每个点光源的位置：


```cpp
glBindVertexArray(lightCubeVAO);
for (unsigned int i = 0; i < 4; i++) {
    model = glm::mat4(1.0f);
    model = glm::translate(model, pointLightPositions[i]);
    model = glm::scale(model, glm::vec3(0.2f));
    lightCubeShader.setMat4("model", model);
    glDrawArrays(GL_TRIANGLES, 0, 36);
}
```


## 7. 光源数量与性能

多光源场景下，每个片段需要执行 `光源数量 × 光照计算量` 次操作。如果有 1 个平行光、4 个点光源、1 个聚光灯，每个片段要计算 6 次完整的 Phong 光照。对于 1080p 分辨率（约 200 万像素），每帧需要执行上千万次光照计算。

这就是为什么：


- 游戏引擎通常限制点光源的影响范围（通过 Range 参数）
- 延迟渲染（Deferred Shading）将光照计算从 N 次/片段减少到 1 次/片段
- Unity 的"重要光源"（Important Light）和"不重要的光源"（Not Important）概念直接对应是否允许光源叠加

> **性能提示：** 你现在手写的逐片段累加渲染方式，正是游戏引擎中"前向渲染"（Forward Rendering）的基础。当你将来学习延迟渲染时，会发现底层还是这些 Calc 函数——只是计算时机不同。


## 8. 引擎连接


| OpenGL 概念 | Unity 对应 | Unreal 对应 |
| --- | --- | --- |
| DirLight + PointLights[] 数组 | 场景中多个 Light 组件 | 场景中多个 Light Actor |
| 函数封装 CalcXXXLight() | Shader Graph 中的光照节点 | Material 中每个光源类型的计算 |
| 结果累加 result += ... | 场景光照叠加渲染 | Lighting Accumulation Buffer |
| 每个光源独立的 ambient/diffuse/specular | Light 组件的 Color + Intensity | Light 组件的 Light Color + Intensity |
| 点光源位置 + 衰减参数 | Point Light + Range + Intensity | Point Light + Attenuation Radius |


## 9. 练习


1. **添加更多点光源**：将 `NR_POINT_LIGHTS` 改为 6，在场景中添加两个新的彩色点光源（例如红色和蓝色）
2. **调色光源**：修改每个点光源的 `light.diffuse` 颜色，让场景呈现五彩斑斓的效果
3. **动态光源**：让其中一个点光源沿着路径运动，观察动态光照下物体表面的光影变化
4. **理解环境光**：将所有点光源的 ambient 设为 (0,0,0)，观察只有平行光提供环境光时场景的明暗分布
← 上一课：光源类型下一课：光照篇实战 →