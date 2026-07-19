---
title: "第13课：光源类型 (Light Casters) | LearnOpenGL 中文教程"
description: 在上一阶段我们学习了 Phong 光照模型的基本框架。但现实世界中的光源远不止一种类型——太阳光从无限远处射来，灯泡从一点向四周发散，手电筒打出锥形光束。这一课
tags: [opengl, 图形学, 光照, 着色器]
date: 2025-01-01
---

LearnOpenGL 第二阶段：光照


# 第 0013 课：光源类型

在上一阶段我们学习了 Phong 光照模型的基本框架。但现实世界中的光源远不止一种类型——太阳光从无限远处射来，灯泡从一点向四周发散，手电筒打出锥形光束。这一课我们将实现这三种最核心的光源类型，并理解它们在 GPU 上是如何计算的。

## 1. 三种光源概览


| 光源类型 | 英文 | 核心特征 | 现实类比 |
| --- | --- | --- | --- |
| 平行光 | Directional Light | 统一方向，无衰减，无限远 | 太阳 |
| 点光源 | Point Light | 从一点向所有方向，有衰减 | 灯泡、蜡烛 |
| 聚光灯 | Spot Light | 锥形区域，有方向，可柔化边缘 | 手电筒、舞台聚光灯 |


在 OpenGL 中，这三种光源本质上都是片段着色器中的光照计算函数——区别在于 **光线方向向量的计算方式** 和 **衰减模式**。

## 2. 平行光 (Directional Light)

### 2.1 核心原理

平行光模拟来自无限远的光源（如太阳）。其核心假设是：**所有片段接收到的光线方向相同**。因此我们不需要光源位置，只需要一个统一的方向向量。

### 2.2 着色器实现

从源文件 `5.1.light_casters.fs` 看，平行光的 Light 结构体不包含位置字段，而是包含 direction：


```
struct Light {
    vec3 direction;   // 统一光照方向
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};
```


片段着色器中计算光线方向时直接使用负方向（从光源指向片段）：


```
vec3 lightDir = normalize(-light.direction);
```

> **关键理解：**`light.direction` 是从片段指向光源的方向（与从光源发出的方向相反）。取负号得到从光源指向片段的实际光线向量，用于与法线点积计算漫反射。


### 2.3 C++ 代码中的设置


```
lightingShader.setVec3("light.direction", -0.2f, -1.0f, -0.3f);
lightingShader.setVec3("light.ambient",  0.2f, 0.2f, 0.2f);
lightingShader.setVec3("light.diffuse",  0.5f, 0.5f, 0.5f);
lightingShader.setVec3("light.specular", 1.0f, 1.0f, 1.0f);
```


注意在 `5.1.light_casters_directional.cpp` 中，**光源立方体被注释掉了**——因为平行光没有空间中的位置，无法用一个小立方体表示。

### 2.4 平行光的特性


- **无衰减**：无论距离光源多近或多远，光照强度不变
- **无位置**：只有方向，因此无法通过移动光源位置改变照明
- **阴影一致**：所有物体投影方向平行，适合模拟太阳光


## 3. 点光源 (Point Light)

### 3.1 核心原理

点光源模拟从一个点向所有方向均匀发光的光源。核心特征：**光照强度随距离衰减**。

### 3.2 衰减公式

从 `5.2.light_casters.fs` 中提取的衰减计算公式：


```
float distance = length(light.position - FragPos);
float attenuation = 1.0 / (constant + linear * distance + quadratic * (distance * distance));
```


这个公式有三项参数：


| 参数 | 符号 | 作用 | 典型值 |
| --- | --- | --- | --- |
| 常数项 | Kc | 保持基础强度，通常为 1.0 | 1.0 |
| 一次项 | Kl | 线性衰减，主导中距离 | 0.09 |
| 二次项 | Kq | 二次衰减，主导远距离 | 0.032 |


光照强度随距离的衰减曲线如下：


- 近距离（d 很小）：衰减 ≈ 1（完全强度）
- 中距离（d 中等）：一次项主导，线性下降
- 远距离（d 很大）：二次项主导，快速衰减到 0

> **经验值参考：**
> 小范围光源（7 单位内）：Kc=1.0, Kl=0.7, Kq=1.8
> 中范围光源（50 单位内）：Kc=1.0, Kl=0.09, Kq=0.032
> 大范围光源（100 单位内）：Kc=1.0, Kl=0.014, Kq=0.0007


### 3.3 关键代码

点光源的 Light 结构体包含 position 和三项衰减参数：


```
struct Light {
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float constant;
    float linear;
    float quadratic;
};
```


光线方向在每个片段都不同：


```
vec3 lightDir = normalize(light.position - FragPos);
```


最终将衰减应用到所有光照分量上：


```
ambient  *= attenuation;
diffuse  *= attenuation;
specular *= attenuation;
```


在 C++ 端，点光源对应的代码还渲染了一个小立方体表示光源位置（`5.2.light_casters_point.cpp`）：


```cpp
lightCubeShader.use();
model = glm::translate(model, lightPos);
model = glm::scale(model, glm::vec3(0.2f));
// ...draw the light cube...
```


## 4. 聚光灯 (Spot Light)

### 4.1 硬边聚光灯

源文件 `5.3.light_casters.fs` 实现了硬边聚光灯。核心是在点光源的基础上增加一个圆锥体约束：


```
vec3 lightDir = normalize(light.position - FragPos);
float theta = dot(lightDir, normalize(-light.direction));

if(theta > light.cutOff) {
    // 锥体内部：完整的 Phong 光照计算（含衰减）
} else {
    // 锥体外部：只有环境光
    FragColor = vec4(light.ambient * texture(material.diffuse, TexCoords).rgb, 1.0);
}
```


**注意：**这里 theta 和 cutOff 都是余弦值而非角度值。因为余弦在 0 到 180 度内是递减函数，所以当 `theta > cutOff` 时表示角度小于 cutoff 角度——即片段在锥体内。

### 4.2 柔边聚光灯

源文件 `5.4.light_casters.fs`（软边缘版本）引入了 `outerCutOff`，在内外角之间做平滑过渡：


```
float theta = dot(lightDir, normalize(-light.direction));
float epsilon = (light.cutOff - light.outerCutOff);
float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0);

diffuse  *= intensity;
specular *= intensity;
```


`intensity` 的计算效果如下：


- theta > cutOff（内锥内部）：intensity = 1.0（完全照亮）
- theta < outerCutOff（外锥外部）：intensity = 0.0（无光）
- outerCutOff < theta < cutOff（过渡区）：intensity 在 0~1 之间线性插值


### 4.3 聚光灯的 C++ 设置


```cpp
lightingShader.setVec3("light.position", camera.Position);
lightingShader.setVec3("light.direction", camera.Front);
lightingShader.setFloat("light.cutOff", glm::cos(glm::radians(12.5f)));
lightingShader.setFloat("light.outerCutOff", glm::cos(glm::radians(17.5f)));
```


注意在 `5.3.spot` 和 `5.4.spot_soft` 中，聚光灯的位置和方向绑定到摄像机——实现了一个"手电筒"效果（第一人称跟随光源）。

## 5. 三种光源的着色器对比总结


| 维度 | 平行光 | 点光源 | 聚光灯 |
| --- | --- | --- | --- |
| 方向向量 | normalize(-light.direction)（统一） | normalize(light.pos - FragPos)（逐片段） | 同点光源 + 锥体约束 |
| 衰减 | 无 | Kc+Kld+Kqd2 | 衰减 × 锥体强度 |
| 位置 | 不需要（无限远） | 需要 vec3 position | 需要 vec3 position |
| 方向切割 | 无 | 无 | cutOff / outerCutOff |
| 渲染光体 | 不渲染 | 渲染小立方体 | 一般不渲染（在摄像机位置） |


## 6. 引擎连接

这三种光源类型构成了现代游戏引擎光照系统的基础：


| 引擎 | 平行光 | 点光源 | 聚光灯 |
| --- | --- | --- | --- |
| Unity | Directional Light | Point Light | Spot Light |
| Unreal | Directional Light | Point Light | Spot Light |
| Godot | DirectionalLight3D | OmniLight3D | SpotLight3D |


当你按下图所示在 Unity 中创建一个 Directional Light，Unity 的渲染管线本质上在做的事情就是在场景物体的所有着色器中将光方向设置为统一值、不计算衰减——和我们在 OpenGL 中手写的平行光着色器完全一致。


> **思考：** Unity 的 Light 组件中的 Range、Intensity、Spot Angle 等参数，思考它们对应 OpenGL 实现中的哪些 uniform 变量？


## 7. 练习


1. **修改衰减参数**：修改 `5.2.light_casters_point` 的衰减参数，观察不同距离下光照强度的变化
2. **混合光源场景**：创建一个场景，同时包含一束平行光（模拟月亮）和两个不同颜色的点光源
3. **手电筒效果**：基于 `5.4.light_casters_spot_soft` 的代码，让聚光灯跟随摄像机（已在示例中实现，验证并理解其代码逻辑）
4. **移动点光源**：让点光源沿圆形路径运动，感受动态光照的效果
← 上一课：材质下一课：多光源 →