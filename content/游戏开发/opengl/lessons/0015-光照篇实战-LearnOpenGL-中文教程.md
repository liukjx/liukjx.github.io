---
title: 第0015课：光照篇实战 | LearnOpenGL 中文教程
description: 本课是光照阶段的复习与整合课。我们将把第 0009-0014 课的所有知识点串联起来，建立完整的知识体系，并审视游戏引擎中光照的底层原理。
tags: [opengl, 图形学, 光照, 实战, 调试]
date: 2025-01-01
---

LearnOpenGL 第二阶段：光照


# 第 0015 课：光照篇实战

本课是光照阶段的复习与整合课。我们将把第 0009-0014 课的所有知识点串联起来，建立完整的知识体系，并审视游戏引擎中光照的底层原理。

## 1. 光照阶段全景回顾

### 1.1 学习路线图

让我们回顾整个第二阶段的学习轨迹：


| 课程 | 主题 | 核心收获 |
| --- | --- | --- |
| 0009 | 颜色 | 颜色是光的波长组合；物体颜色 = 光源色 × 反射色 |
| 0010 | 基础光照 | Phong 模型：环境光 + 漫反射 + 镜面高光 |
| 0011 | 材质 | 物体通过材质结构体控制对光的响应 |
| 0012 | 光照贴图 | 使用纹理逐像素控制漫反射和镜面反射属性 |
| 0013 | 光源类型 | 平行光、点光源、聚光灯的实现与特性 |
| 0014 | 多光源 | 多个光源的独立计算与结果累加 |


### 1.2 概念地图

以下是光照阶段所有概念的关联图：


```

                    ┌──────────────────────────────┐
                    │        光源 (Light)           │
                    │  ┌──────┬──────┬───────────┐  │
                    │  │平行光│点光源│  聚光灯    │  │
                    │  │方向  │位置+衰减│ 位置+衰减  │  │
                    │  │无衰减│      │ +锥体约束  │  │
                    │  └──┬───┴──┬───┴─────┬─────┘  │
                    └─────┼──────┼─────────┼────────┘
                          │      │         │
                          ▼      ▼         ▼
                    ┌──────────────────────────────┐
                    │    光照计算（每个光源）        │
                    │  ambient + diffuse + specular │
                    │  ┌─ Phong 光照模型 ────────┐  │
                    │  │ L = ambient             │  │
                    │  │    + kd * max(N·L, 0)   │  │
                    │  │    + ks * max(R·V, 0)^s │  │
                    │  └─────────────────────────┘  │
                    └────────────┬─────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────────┐
                    │     材质 (Material)           │
                    │  ┌────────────────────────┐   │
                    │  │  diffuse 贴图（基础色） │   │
                    │  │  specular 贴图（反射）  │   │
                    │  │  shininess（光泽度）    │   │
                    │  └────────────────────────┘   │
                    └────────────┬─────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────────┐
                    │   多光源累加                  │
                    │  color = Σ CalcLight(light)   │
                    │  = CalcDirLight               │
                    │  + Σ CalcPointLight           │
                    │  + CalcSpotLight              │
                    └────────────┬─────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────────┐
                    │    最终片段颜色                │
                    │  FragColor = vec4(result, 1)  │
                    └──────────────────────────────┘
```


## 2. Phong 模型关键公式回顾

Phong 光照模型是整个阶段的数学基础：


```
// 每个光源的 Phong 计算
vec3 CalcLight(Light light, Material material, vec3 fragPos,
               vec3 normal, vec3 viewDir) {

    // 1. 计算光线方向
    vec3 lightDir = /* 取决于光源类型 */;

    // 2. 计算衰减
    float attenuation = /* 点光源/聚光灯有，平行光为 1.0 */;

    // 3. 环境光 - 模拟间接光照
    vec3 ambient = light.ambient * material.diffuse;

    // 4. 漫反射 - Lambert 余弦定律
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = light.diffuse * diff * material.diffuse;

    // 5. 镜面高光 - Blinn-Phong 可选
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 specular = light.specular * spec * material.specular;

    // 6. 合成
    return (ambient + diffuse + specular) * attenuation;
}
```

> **进阶注记：** 在 Blinn-Phong 模型中，`reflectDir` 被替换为半程向量 `H = normalize(L + V)`，然后计算 `max(dot(N, H), 0)`。这是 Unity 和 Unreal 默认使用的镜面反射计算方式，因为它效率更高且不会产生反射向量的不连续问题。


## 3. 引擎连接总览表

以下是 OpenGL 光照概念与现代游戏引擎的完整对应关系：


| OpenGL 概念 | Unity | Unreal Engine | 说明 |
| --- | --- | --- | --- |
| 环境光 (ambient) | Environment Lighting / Ambient Color | Sky Light + Ambient Cubemap | 简化模拟间接光照 |
| 漫反射 (diffuse) | Albedo × Light Color × NdotL | Base Color × Light Color × NdotL | 兰伯特余弦定律 |
| 镜面高光 (specular) | Smoothness + Specular Color | Roughness + Specular | Unity 用平滑度，UE 用粗糙度（取反） |
| shininess | Smoothness (1~0 映射到高光锐度) | Roughness 贴图 | Unity 值越大越亮越集中；UE 粗糙度值越大越模糊 |
| diffuse 贴图 | Albedo Map | Base Color Map | 物体基础颜色 |
| specular 贴图 | Metallic + Specular Map | Roughness + Metallic Map | PBR 中金属度决定了反射方式 |
| 平行光 | Directional Light | Directional Light | 仅方向，无衰减 |
| 点光源 | Point Light | Point Light | 位置 + Range（范围对应衰减参数） |
| 聚光灯 | Spot Light | Spot Light | 位置 + 方向 + Spot Angle |
| 多光源累加 | 多个 Light 组件 | 多个 Light Actor | 前向渲染中逐片段累加 |
| 光源强度 | Intensity 参数 | Intensity 参数 | 乘到 diffuse/specular 上 |
| 光源颜色 | Color 属性 | Light Color | 乘到光照计算结果上 |


## 4. 实战分析：Unity 默认场景

打开 Unity 新建一个默认场景，你会看到：


1. **一个 Directional Light**——Unity 自动创建的平行光，相当于我们在 `6.multiple_lights.fs` 中定义的 `dirLight`
2. **天空盒**——提供环境光，对应我们的 `ambient` 分量
3. **平面和方块**上的 Standard Shader 材质——内部包含 Albedo（漫反射贴图）、Metallic（金属度）/Smoothness（光滑度）贴图，对应我们的 `material.diffuse`、`material.specular` 和 `material.shininess`


当你点击 Unity 场景中的球体时，Inspector 面板中看到的效果，本质上就是我们在着色器中手写的 Phong 光照计算的产物。不同之处在于：


- Unity 使用 PBR（基于物理的渲染）替代了 Phong 模型——PBR 遵守能量守恒定律
- Unity 的 Standard Shader 同时处理了金属和非金属两种材质的反射差异
- Unity 自动管理多个光源的循环和累加（通过渲染管线的 Pass）


当你添加第二盏 Point Light 时，Unity 内部做的事情与我们在 `multiple_lights.fs` 中写的 `result += CalcPointLight(...)` 是完全相同的逻辑。


> **思考：** 试着在 Unity 中创建一个场景，添加一盏 Directional Light 和两盏不同颜色的 Point Light。想象每个物体表面片段中 GPU 正在执行的着色器代码——你现在已经能够写出这段代码了。


## 5. 常见陷阱与调试技巧


| 问题 | 可能原因 | 检查方法 |
| --- | --- | --- |
| 物体全黑 | 法线方向错误或未传入 | 输出 normal 到 FragColor 查看 |
| 高光不显示 | shininess 太小或视角向量错误 | 输出 specular 分量单独调试 |
| 点光源过暗/过亮 | 衰减参数不匹配场景尺度 | 根据距离范围调整 Kc/Kl/Kq |
| 多光源闪烁 | uniform 命名与着色器不匹配 | 检查 setVec3/setFloat 的 name 参数 |
| 聚光灯内外反转 | 余弦比较方向搞反 | 确认 > 和 < 的使用 |
| 纹理不显示 | 纹理单元绑定顺序错误 | 确认 setInt 对应 GL_TEXTURE 索引 |

> **调试着色器的黄金法则：** 不知道哪里出问题了？把中间结果直接输出为 FragColor。想要看法线？`FragColor = vec4(normal, 1.0)`。想看漫反射系数？`FragColor = vec4(vec3(diff), 1.0)`。这种"可视化调试"是图形学调试的最有效手段。


## 6. 你已经学到了什么？

经过光照阶段的学习，你现在掌握了：


- ✔ 理解光的颜色模型和 Phong 光照公式的数学推导
- ✔ 用结构体和 uniform 在着色器中组织材质和光源数据
- ✔ 用纹理贴图控制物体表面的光照响应
- ✔ 实现三种主流光源类型及其衰减
- ✔ 多光源场景的累加渲染方案
- ✔ 将 OpenGL 光照知识与商业引擎对应起来


这些知识构成了现代图形渲染管线的光照基础。无论将来学习 PBR、全局光照、阴影映射还是延迟渲染，核心的光照计算逻辑都是一致的。

## 7. 预告：第三阶段

在第三阶段中，我们将进入模型加载和高级 OpenGL：


1. **模型加载**：学会使用 Assimp 库加载复杂的 3D 模型（不再只是画立方体！）
2. **深度测试**：理解 Z 缓冲区的原理和深度冲突问题
3. **模板测试**：利用模板缓冲实现轮廓描边等特效
4. **混合与透明度**：正确处理透明物体渲染
5. **面剔除**：优化渲染性能，忽略不可见的背面三角面
6. **帧缓冲**：创建自己的渲染目标，实现后期处理
7. **立方体贴图**：实现天空盒和环境映射
8. **高级 GLSL**：Uniform 缓冲对象、接口块等进阶特性


届时你会将光照知识应用到真实的 3D 模型上，实现更加炫酷的视觉效果。

← 上一课：多光源下一阶段：模型加载 →