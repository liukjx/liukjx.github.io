---
title: "第27课：延迟着色 (Deferred Shading) | LearnOpenGL 中文教学"
description: 理解前向渲染的瓶颈、延迟渲染的核心思想以及它在现代引擎中的地位。
tags: [opengl, 图形学, 光照]
date: 2025-01-01
---

第 0027 课


# 延迟着色 (Deferred Shading)

理解前向渲染的瓶颈、延迟渲染的核心思想以及它在现代引擎中的地位。

 ===== 1. 前向渲染的问题 =====

## 1. 前向渲染的问题

在之前的课程中，我们一直使用**前向渲染（Forward Rendering）**。流程很简单：对每个物体，用所有灯计算光照，然后输出颜色。伪代码如下：


```
for (每个物体) {
    for (每个光源) {
        // 计算光照并累加
        color += computeLighting(material, light);
    }
    // 输出最终颜色
    FragColor = vec4(color, 1.0);
}
```


问题在于：当一个场景有 100 个物体和 32 盏灯时，我们需要执行 3200 次光照计算。而且很多物体可能在屏幕空间中只占几个像素，却要执行完整的光照计算——这是巨大的浪费。


> [!WARNING]
> **前向渲染的性能瓶颈**
>
> 前向渲染中，每个物体对每盏灯都需要计算一次光照。时间复杂度 = O(物体数 x 光源数)。当光源数量增加到几十甚至上百时，性能会急剧下降。这是前向渲染的可扩展性问题。
 ===== 2. 延迟渲染的核心思想 =====

## 2. 延迟渲染（Deferred Rendering）

延迟渲染的核心思想是**将光照计算推迟到屏幕空间进行**。它将渲染流程分为两遍：

### 2.1 第一遍：G-Buffer 阶段（几何处理）

将场景的几何信息渲染到多张纹理中，称为**G-Buffer**（Geometry Buffer）。这个阶段只关心"屏幕上每个像素对应的几何是什么"，不进行光照计算：


```cpp
// 片段着色器输出：
// 位置（Position）    → gPosition（RGBA16F 纹理）
// 法线（Normal）      → gNormal（RGBA16F 纹理）
// 漫反射颜色 + 镜面   → gAlbedoSpec（RGBA8 纹理）
layout(location = 0) out vec3 gPosition;
layout(location = 1) out vec3 gNormal;
layout(location = 2) out vec4 gAlbedoSpec;

void main() {
    gPosition = fs_in.FragPos;                 // 世界空间位置
    gNormal   = normalize(fs_in.Normal);       // 法线
    gAlbedoSpec = vec4(fs_in.Color, fs_in.Shininess); // 颜色 + 高光强度
}
```


### 2.2 第二遍：光照阶段（屏幕空间光照）

渲染一个全屏四边形，从 G-Buffer 采样位置、法线、颜色信息，在屏幕空间中逐像素计算光照：


```
// 从 G-Buffer 采样
vec3 fragPos  = texture(gPosition, TexCoords).rgb;
vec3 normal   = texture(gNormal, TexCoords).rgb;
vec3 albedo   = texture(gAlbedoSpec, TexCoords).rgb;
float spec    = texture(gAlbedoSpec, TexCoords).a;

// 对每盏灯计算光照（逐像素）
vec3 lighting = ambient * albedo;
for (int i = 0; i < NR_LIGHTS; i++) {
    // Blinn-Phong 光照计算
    vec3 lightDir = lightPositions[i] - fragPos;
    float dist = length(lightDir);
    float attenuation = 1.0 / (1.0 + linear * dist + quadratic * dist * dist);
    // ... 漫反射 + 高光计算 ...
    lighting += att * (diffuse + specular);
}
FragColor = vec4(lighting, 1.0);
```
 ===== 3. G-Buffer 内容 =====

## 3. G-Buffer 详解

在 `deferred_shading.cpp` 中，G-Buffer 包含三张纹理：


| Attachment | 名称 | 格式 | 存储内容 |
| --- | --- | --- | --- |
| COLOR_ATTACHMENT0 | gPosition | GL_RGBA16F | 世界空间位置 (xyz) + 未使用 |
| COLOR_ATTACHMENT1 | gNormal | GL_RGBA16F | 世界空间法线 (xyz) + 未使用 |
| COLOR_ATTACHMENT2 | gAlbedoSpec | GL_RGBA8 | 漫反射颜色 (rgb) + 高光强度 (a) |


对应的 C++ 帧缓冲配置：


```
// 位置缓冲（16位浮点）
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F,
             SCR_WIDTH, SCR_HEIGHT, 0, GL_RGBA, GL_FLOAT, NULL);
// 法线缓冲（16位浮点）
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F,
             SCR_WIDTH, SCR_HEIGHT, 0, GL_RGBA, GL_FLOAT, NULL);
// 颜色+高光（8位常规）
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA,
             SCR_WIDTH, SCR_HEIGHT, 0, GL_RGBA, GL_UNSIGNED_BYTE, NULL);

// 设置多渲染目标
unsigned int attachments[3] = {
    GL_COLOR_ATTACHMENT0, GL_COLOR_ATTACHMENT1, GL_COLOR_ATTACHMENT2
};
glDrawBuffers(3, attachments);
```

> [!INFO]
> **引擎连接：G-Buffer 格式**
>
> Unity 的 Deferred 渲染路径使用 **MRT（Multiple Render Targets）**，G-Buffer 包含 RT0（漫反射+遮挡）、RT1（镜面+粗糙度）、RT2（法线+金属度）、RT3（发光+自发光）。Unreal Engine 的 G-Buffer 更为丰富，包含 BaseColor、Metallic、Specular、Roughness、Normal、Depth、SubsurfaceColor 等多达 10 个通道。
 ===== 4. 光照体积优化 =====

## 4. 光照体积（Light Volumes）优化

在基础延迟渲染中，光照阶段仍然需要遍历所有光源——即使某个光源根本不会影响当前像素。对于 32 盏灯以上的场景，这仍然很浪费。

**光照体积**是一种优化方法：每盏灯有一个有限的**影响半径**，超过这个半径光照衰减到几乎为零。我们可以在着色器中跳过超出半径的光源：


```
// 计算光源影响半径（在 C++ 中预计算）
const float constant  = 1.0;
const float linear    = 0.7;
const float quadratic = 1.8;
float maxBrightness = max(max(lightColor.r, lightColor.g), lightColor.b);
float radius = (-linear + sqrt(linear * linear - 4 * quadratic *
               (constant - (256.0 / 5.0) * maxBrightness))) /
               (2.0 * quadratic);

// 传递给着色器，在光照计算中跳过超出范围的光源
float distance = length(light.Position - fragPos);
if (distance < light.Radius) {
    // 计算光照...
```


在 `deferred_shading_volumes.cpp` 中，更进一步使用 **Stencil 技术**：先根据光源的球体体积渲染到 Stencil Buffer，只对球体内的像素进行光照计算，大幅减少像素着色器调用次数。


> [!INFO]
> **引擎连接：Cluster Deferred Shading**
>
> 在 Unity 和 UE 中，对于大量动态光源（50-100+），使用 **Clustered Deferred Rendering**。它将屏幕空间划分成 3D 网格（Tile），每个 Tile 维护一个光源列表。光照阶段只对影响该 Tile 的光源进行计算。UE5 的 Nanite + Lumen 系统就使用这种技术处理数千个动态光源。
 ===== 5. 延迟渲染完整流程 =====

## 5. 延迟渲染的完整管线

### 步骤 1：G-Buffer 填充

绑定 G-Buffer FBO，渲染所有不透明物体，输出位置、法线、颜色到多张纹理：


```
glBindFramebuffer(GL_FRAMEBUFFER, gBuffer);
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
shaderGeometryPass.use();
// ... 对每个物体设置 model 矩阵并渲染 ...
backpack.Draw(shaderGeometryPass);
glBindFramebuffer(GL_FRAMEBUFFER, 0);
```


### 步骤 2：光照计算

渲染全屏四边形，采样 G-Buffer 纹理，逐像素计算光照：


```
shaderLightingPass.use();
glActiveTexture(GL_TEXTURE0); glBindTexture(GL_TEXTURE_2D, gPosition);
glActiveTexture(GL_TEXTURE1); glBindTexture(GL_TEXTURE_2D, gNormal);
glActiveTexture(GL_TEXTURE2); glBindTexture(GL_TEXTURE_2D, gAlbedoSpec);
// 设置灯光参数 ...
renderQuad();
```


### 步骤 3：深度缓冲复制 + 光源球体渲染

为了在场景中正确显示光源位置，需要将 G-Buffer 的深度复制到默认帧缓冲，然后叠加光源球体：


```cpp
// 复制深度缓冲
glBindFramebuffer(GL_READ_FRAMEBUFFER, gBuffer);
glBindFramebuffer(GL_DRAW_FRAMEBUFFER, 0);
glBlitFramebuffer(0, 0, SCR_WIDTH, SCR_HEIGHT,
                  0, 0, SCR_WIDTH, SCR_HEIGHT,
                  GL_DEPTH_BUFFER_BIT, GL_NEAREST);

// 渲染光源球体
shaderLightBox.use();
for (auto& pos : lightPositions) {
    model = glm::translate(glm::mat4(1.0), pos);
    model = glm::scale(model, glm::vec3(0.125f));
    shaderLightBox.setMat4("model", model);
    renderCube();
}
```
 ===== 6. 前向 vs 延迟对比 =====

## 6. 前向渲染 vs 延迟渲染


| 特性 | 前向渲染 | 延迟渲染 |
| --- | --- | --- |
| 光源数量 | 支持少量（~4-8） | 支持大量（~32-1000+） |
| 复杂度 | O(物体数 x 光源数) | O(像素 x 光源数) |
| 透明物体 | 完全支持 | 需要额外处理 |
| MSAA | 原生支持 | 不支持（需定制方案） |
| 显存占用 | 低 | 高（G-Buffer 多张纹理） |
| 带宽消耗 | 低 | 高（G-Buffer 采样） |
| 硬件要求 | 低（移动端友好） | 高（需要 MRT 支持） |
| 材质复杂度 | 高（可每个物体不同） | 受限于 G-Buffer 有限通道 |

> [!WARNING]
> **延迟渲染的缺点**
> 1. **不支持透明物体**：G-Buffer 每个像素只存最近物体的信息，透明物体需要放到后面前向渲染
> 2. **不支持 MSAA**：由于在屏幕空间操作，MSAA 无法使用（需要定制 Morphological AA）
> 3. **显存占用高**：G-Buffer 通常需要 3-4 张全屏纹理，1080p 下约 50-100MB
> 4. **带宽消耗大**：光照阶段每帧需要读取 G-Buffer 全部纹理
> 5. **材质表达有限**：G-Buffer 通道有限，难以表达各向异性、次表面散射等复杂材质
 ===== 7. 引擎连接 =====

## 7. 引擎连接：商业引擎中的延迟渲染


> [!INFO]
> **Unity 渲染路径**
> - **Forward**：默认路径，每个物体逐灯计算。适用移动平台或少量光源
> - **Deferred**：需要 GPU 支持 MRT，G-Buffer 使用 4 张 RT：RT0 (diffuse+occlusion)、RT1 (specular+roughness)、RT2 (normal+metalness)、RT3 (emission+自发光)
> - **Forward+**（2019+）：改进的前向渲染，使用 Tile-based 光源裁剪，兼具前向的 MSAA 支持和延迟的灯光数量优势

> [!INFO]
> **Unreal Engine**
> - 默认使用 **延迟渲染**（Deferred Shading），可切换到前向渲染（Forward Shading）以获得 MSAA 支持
> - G-Buffer 称为 "GBuffer"，包含 GBufferA~E 共 5 张纹理，编码了 BaseColor、Metallic、Specular、Roughness、Normal、Depth、ShadingModel 等
> - 光照计算使用 **Tile-based** 优化：将屏幕分为 32x32 像素的块，每个块预处理影响它的光源列表
> - UE5 的 Lumen 间接光照系统也工作在延迟渲染的框架下

> [!INFO]
> **Godot Engine**
> - 默认使用前向渲染（移动端/低配）
> - Godot 4 引入了 **Cluster Forward** 渲染，使用类似延迟渲染的光源裁剪策略，但仍然使用前向的着色流程
> - 支持 OpenGL 3/4 和 Vulkan 后端
 ===== 8. 练习 =====

## 8. 练习：实现延迟渲染管线

### 练习 1：阅读 G-Buffer 配置

打开 `deferred_shading.cpp`，找到 G-Buffer 创建部分：


- 分别有哪些纹理附件？各用什么格式？
- 为什么位置和法线用 `GL_RGBA16F` 而颜色用 `GL_RGBA8`？
- 尝试将位置和法线改为 `GL_RGBA32F`，观察精度变化和显存消耗


### 练习 2：理解 MRT


1. 找到 `glDrawBuffers(3, attachments)` 这行代码
2. 解释 MRT 的工作原理——如何在一个 Pass 中输出到多张纹理？
3. 尝试增加一个 G-Buffer 纹理存储物体 ID 或自定义数据


### 练习 3：添加更多光源


1. 在 `deferred_shading.cpp` 中，将 `NR_LIGHTS` 从 32 改为 100
2. 观察性能变化——延迟渲染下 100 盏灯是否能保持流畅？
3. 对比前向渲染：如果改用前向渲染，100 盏灯会怎样？


### 练习 4：光照半径优化


1. 阅读 `deferred_shading_volumes.cpp` 中的光照半径计算逻辑
2. 在光照 Pass 中实现半径裁剪——只对距离小于 Radius 的像素计算光照
3. 测试性能提升幅度


### 练习 5：透明物体处理


1. 延迟渲染本身不支持透明物体，尝试在延迟渲染完成后添加一个前向 Pass 来渲染透明物体
2. 注意需要禁用深度写入，或使用特殊的透明排序
3. 思考 Unity 和 UE 是如何处理这个问题的
 ===== 导航 ===== 