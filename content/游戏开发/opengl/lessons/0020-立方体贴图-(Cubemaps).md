---
title: 第0020课：立方体贴图 (Cubemaps) - LearnOpenGL
description: 本课介绍立方体贴图（Cubemap），这是一种由 6 张纹理组成的特殊纹理类型，用于实现天空盒和环境映射。天空盒为 3D 场景提供无限远的背景，环境映射让物体反
tags: [opengl, 图形学]
date: 2025-01-01
---

LearnOpenGL 系列课程


# 第0020课：立方体贴图 (Cubemaps)

本课介绍**立方体贴图**（Cubemap），这是一种由 6 张纹理组成的特殊纹理类型，用于实现天空盒和环境映射。天空盒为 3D 场景提供无限远的背景，环境映射让物体反射或折射周围环境。

## 1. 立方体贴图基础

### 1.1 什么是立方体贴图

立方体贴图是一个包含 6 张 2D 纹理的数组，分别对应立方体的 6 个面：右(+X)、左(-X)、上(+Y)、下(-Y)、前(+Z)、后(-Z)。采样时使用一个 3D 方向向量，OpenGL 根据向量方向决定从哪个面采样。

6 个面的纹理枚举常量：


```
GL_TEXTURE_CUBE_MAP_POSITIVE_X  // 右 (+X)
GL_TEXTURE_CUBE_MAP_NEGATIVE_X  // 左 (-X)
GL_TEXTURE_CUBE_MAP_POSITIVE_Y  // 上 (+Y)
GL_TEXTURE_CUBE_MAP_NEGATIVE_Y  // 下 (-Y)
GL_TEXTURE_CUBE_MAP_POSITIVE_Z  // 前 (+Z)
GL_TEXTURE_CUBE_MAP_NEGATIVE_Z  // 后 (-Z)
```


由于这些枚举值是连续的，可以用循环加载：


```
for (unsigned int i = 0; i < faces.size(); i++)
    glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, data);
```


### 1.2 加载立方体贴图


```
vector<std::string> faces {
    "right.jpg", "left.jpg", "top.jpg", "bottom.jpg", "front.jpg", "back.jpg"
};
unsigned int cubemapTexture = loadCubemap(faces);

unsigned int loadCubemap(vector<std::string> faces) {
    unsigned int textureID;
    glGenTextures(1, &textureID);
    glBindTexture(GL_TEXTURE_CUBE_MAP, textureID);
    // 加载 6 个面...
    glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_R, GL_CLAMP_TO_EDGE);
    return textureID;
}
```

> [!INFO]
> **纹理坐标包裹模式**
>
> 立方体贴图使用 `GL_CLAMP_TO_EDGE` 作为包裹模式，因为面之间不需要纹理重复。注意第三个坐标轴使用 `GL_TEXTURE_WRAP_R`（对应 3D 纹理的 R 坐标）。


## 2. 天空盒 (Skybox)

### 2.1 天空盒的渲染技巧

天空盒是包裹整个场景的巨大立方体，相机位于其中心。渲染天空盒需要两个特殊技巧：

**技巧一：移除平移变换**

将视图矩阵的平移部分移除（将 4x4 矩阵转 3x3 再转回 4x4），使天空盒始终跟随相机位置，看起来像在无限远处：


```cpp
glm::mat4 view = glm::mat4(glm::mat3(camera.GetViewMatrix()));
skyboxShader.setMat4("view", view);
```


**技巧二：提前深度测试**

天空盒应该始终在场景的最远端。我们将深度比较函数改为 `GL_LEQUAL`，并在场景之后绘制天空盒。由于天空盒的深度值总是 1.0（在 NDC 中的最大深度），当场景中的物体通过深度测试时（深度值 <= 1.0），它们会覆盖天空盒。


```
// 先绘制场景物体
drawScene();

// 再绘制天空盒
glDepthFunc(GL_LEQUAL);  // 允许深度值相等时通过
skyboxShader.use();
drawSkybox();
glDepthFunc(GL_LESS);    // 恢复默认
```


### 2.2 天空盒着色器

顶点着色器输出 3D 位置作为纹理坐标：


```glsl
// 顶点着色器
void main() {
    TexCoords = aPos;  // 用顶点位置作为立方体贴图采样方向
    vec4 pos = projection * view * vec4(aPos, 1.0);
    gl_Position = pos.xyww;  // 确保深度为 1.0
}

// 片段着色器
void main() {
    FragColor = texture(skybox, TexCoords);
}
```


注意 `gl_Position = pos.xyww`：将 z 分量设为 w，使深度始终为 1.0，确保天空盒在最远端。

## 3. 环境映射 (Environment Mapping)

环境映射使用立方体贴图来模拟物体对周围环境的反射和折射。在源文件 `6.2.cubemaps_environment_mapping` 中，立方体使用了法线属性（而非纹理坐标），用立方体贴图作为环境映射。

### 3.1 反射 (Reflection)

反射需要观察方向向量 `I` 和表面法线 `N`，使用 GLSL 内置函数 `reflect` 计算反射方向：


```glsl
// 顶点着色器传递位置和法线
void main() {
    FragPos = vec3(model * vec4(aPos, 1.0));
    Normal = mat3(transpose(inverse(model))) * aNormal;
    gl_Position = projection * view * vec4(FragPos, 1.0);
}

// 片段着色器
void main() {
    vec3 I = normalize(FragPos - cameraPos);  // 从物体指向相机
    vec3 R = reflect(I, normalize(Normal));    // 反射方向
    FragColor = vec4(texture(skybox, R).rgb, 1.0);
}
```


### 3.2 折射 (Refraction)

折射使用 `refract` 函数，需要额外的折射率参数（真空到材质的折射率比）：


```
float ratio = 1.00 / 1.52;  // 空气/玻璃
vec3 R = refract(I, normalize(Normal), ratio);
FragColor = vec4(texture(skybox, R).rgb, 1.0);
```

> [!INFO]
> **反射 vs 折射**
> - **反射**：光线从表面弹回，反射角等于入射角。使用 `reflect(I, N)`。
> - **折射**：光线穿过介质时发生弯曲。使用 `refract(I, N, eta)`，eta 是折射率比。
> - 二者都可以通过立方体贴图采样实现逼真的环境映射效果。


## 4. 源文件分析

### 4.1 天空盒 (6.1.cubemaps_skybox)

该示例加载了一个纹理立方体和一个天空盒。天空盒使用 6 张独立纹理文件，在场景中作为背景渲染。关键代码：


- `loadCubemap()` 函数加载 6 张纹理到立方体贴图
- 渲染循环中先画物体，再用 `glDepthFunc(GL_LEQUAL)` 画天空盒
- 视图矩阵去除平移分量，天空盒始终包围相机


### 4.2 环境映射 (6.2.cubemaps_environment_mapping)

该示例将立方体贴图同时用于天空盒和物体的环境映射：


- 立方体顶点数据包含位置和法线（不包含纹理坐标）
- 片段着色器中根据法线和视角方向计算反射/折射方向
- 从立方体贴图采样得到环境反射/折射颜色
- 可以动态切换反射和折射效果


## 5. 引擎连接


> [!INFO]
> **Unity 引擎对应**
> - **Skybox 材质**：Unity 的 Skybox 材质本质上就是一个立方体贴图。6-Sided 天空盒模式直接对应 OpenGL 的 6 面立方体贴图加载。
> - **Reflection Probe**：Unity 的反射探针（Reflection Probe）在场景中某个位置拍摄 6 个方向的快照，生成一个立方体贴图。其原理与 `loadCubemap` 完全相同，只是 Unity 在运行时动态生成而非从文件加载。
> - **Material 的 Reflection 属性**：Unity 标准材质中的 Reflection 和 Refraction 参数，底层就是使用 reflect/refract 函数采样 Reflection Probe 的立方体贴图。
> - **Light Probe**：光照探针是 Reflection Probe 的简化版本，用于为动态物体提供间接光照信息。

> [!WARNING]
> **UE 引擎对应**
> - **Sky Sphere / Sky Light**：UE 中的天空球和天空光照，背后使用立方体贴图作为环境光照来源。
> - **Reflection Capture**：UE 的反射捕获组件，等价于 Unity 的 Reflection Probe。
> - **Sphere Reflection Captures**：UE 在物体周围放置多个反射捕获点，插值得到平滑的反射效果。


## 6. 练习


1. **加载不同的天空盒**：从网上下载或制作一组天空盒纹理（right, left, top, bottom, front, back），替换示例中的纹理路径，观察不同环境的效果。
2. **实现反射效果**：修改 `6.2` 示例，让立方体显示天空盒的反射。移动相机观察反射方向的变化。
3. **混合反射和物体纹理**：让物体既有自身的纹理颜色又有环境的反射颜色，通过 uniform 控制混合比例（例如 0.3 纹理 + 0.7 反射）。
4. **实现折射效果**：将片段着色器中的 reflect 替换为 refract，观察折射变形效果。尝试不同的折射率（水 1.33，玻璃 1.52，钻石 2.42）。
5. **组合反射和折射**：实现一个 Fresnel 效果（菲涅尔效应），让视线角度大时反射强，角度小时折射强。
