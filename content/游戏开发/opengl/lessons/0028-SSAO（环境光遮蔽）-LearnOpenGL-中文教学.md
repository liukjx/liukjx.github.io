---
title: 第0028课：SSAO（环境光遮蔽） | LearnOpenGL 中文教学
description: 理解环境光遮蔽的原理，掌握 SSAO 在屏幕空间的采样算法及其在商业引擎中的应用。
tags: [opengl, 图形学, SSAO]
date: 2025-01-01
---

第 0028 课


# SSAO（屏幕空间环境光遮蔽）

理解环境光遮蔽的原理，掌握 SSAO 在屏幕空间的采样算法及其在商业引擎中的应用。

 ===== 1. 什么是环境光遮蔽 =====

## 1. 环境光遮蔽（Ambient Occlusion）

在之前的课程中，我们使用环境光（Ambient Light）来近似场景中的间接光照。但简单的环境光无法表现物体接触面之间的阴影细节——比如墙角、物体之间的缝隙、桌子和地面的接触处。

**环境光遮蔽（AO）**就是用来模拟这种效果的：物体表面的某一点被周围几何体遮挡的程度，决定了该点接收环境光的多少。遮挡越多，该点越暗。


> [!INFO]
> **核心概念：AO 原理**
>
> 在真实世界中，两个物体接触的地方（如墙角和地面接缝）会显得更暗，因为周围几何体阻挡了来自环境的光线。AO 就是一种模拟这种"接触阴影"的技术，能大幅提升场景的真实感和立体感。
 ===== 2. SSAO 原理 =====

## 2. SSAO（屏幕空间环境光遮蔽）

SSAO 是由 Crytek 在 2007 年提出的技术（Crysis 中首次使用），核心思想是**在屏幕空间中利用深度缓冲采样遮挡信息**，而不需要场景的完整几何数据。

### 2.1 SSAO 算法流程

在 `ssao.cpp` 中，SSAO 实现流程如下：


1. **G-Buffer 阶段**：与延迟着色一样，先渲染位置和法线到纹理
2. **SSAO 计算**：为每个像素生成半球采样核，在位置纹理周围采样深度，统计遮挡比例
3. **模糊去噪**：对 SSAO 结果进行模糊，消除随机采样带来的噪点
4. **光照阶段**：将 SSAO 因子应用到光照计算中


### 2.2 法线半球采样核

在 SSAO 中，我们在切线空间的**法线指向的半球内**进行采样，而不是完整的球体。这是因为法线指向的面才是"外面"，背面不应该参与遮挡计算。


```cpp
// 生成 64 个采样点（在法线半球内）
std::vector<glm::vec3> ssaoKernel;
for (unsigned int i = 0; i < 64; ++i) {
    // 在 [-1, 1]^3 立方体内随机采样，z 限制在 [0, 1]（半球）
    glm::vec3 sample(randomFloats(generator) * 2.0 - 1.0,
                     randomFloats(generator) * 2.0 - 1.0,
                     randomFloats(generator));
    sample = glm::normalize(sample);
    sample *= randomFloats(generator);

    // 让采样点更集中在中心附近（靠近法线的点贡献更大）
    float scale = float(i) / 64.0;
    scale = lerp(0.1f, 1.0f, scale * scale);
    sample *= scale;
    ssaoKernel.push_back(sample);
}
```


这里使用了 **lerp + 平方** 的技巧：靠近中心的采样点被缩小（约 0.1 倍），边缘的采样点保持原大小（1.0 倍）。这样采样核在中心附近有更多采样点，遮挡估计更准确。

 ===== 3. SSAO 核心计算 =====

## 3. SSAO 核心计算

在 SSAO 片段着色器中，对每个像素执行以下步骤：


```
const int KERNEL_SIZE = 64;
const float RADIUS = 0.5;  // 采样半径
const float BIAS = 0.025;  // 深度偏差，避免自遮挡

// 1. 从 G-Buffer 获取位置和法线
vec3 fragPos = texture(gPosition, TexCoords).rgb;
vec3 normal = normalize(texture(gNormal, TexCoords).rgb);

// 2. 构建 TBN 矩阵（将采样核从切线空间转到观察空间）
vec3 randomVec = texture(texNoise, TexCoords * noiseScale).xyz;
vec3 tangent = normalize(randomVec - normal * dot(randomVec, normal));
vec3 bitangent = cross(normal, tangent);
mat3 TBN = mat3(tangent, bitangent, normal);

// 3. 对每个采样点计算遮挡
float occlusion = 0.0;
for (int i = 0; i < KERNEL_SIZE; i++) {
    vec3 samplePos = TBN * samples[i];     // 转到观察空间
    samplePos = fragPos + samplePos * RADIUS;

    vec4 offset = projection * vec4(samplePos, 1.0);
    offset.xyz /= offset.w;                   // 透视除法
    offset.xyz = offset.xyz * 0.5 + 0.5;      // 转到 [0,1] UV 空间

    float sampleDepth = texture(gPosition, offset.xy).z; // 采样深度

    // 4. 如果采样点深度 > 真实深度 → 被遮挡
    float rangeCheck = smoothstep(0.0, 1.0, RADIUS / abs(fragPos.z - sampleDepth));
    occlusion += (sampleDepth >= samplePos.z + BIAS ? 1.0 : 0.0) * rangeCheck;
}
occlusion = 1.0 - (occlusion / KERNEL_SIZE);
```

> [!INFO]
> **关键理解：遮挡判断**
>
> 核心逻辑：我们在像素 P 周围采样点 S，将 S 投影到屏幕空间，找到 S 对应的实际深度 depth(S)。如果 depth(S) 大于 S 的期望深度，说明有物体在 S 前面，遮挡了 P。64 个采样点中被遮挡的比例就是该像素的遮挡值。
 ===== 4. 随机采样与噪声 =====

## 4. 随机采样与去噪

### 4.1 噪声纹理

如果对每个像素都使用相同的 64 个采样方向，会产生明显的带状伪影（banding）。为了解决这个问题，我们引入一个**随机旋转噪声纹理**，让相邻像素的采样核方向各不相同：


```cpp
// 生成 4x4 随机旋转向量（绕 z 轴旋转）
std::vector<glm::vec3> ssaoNoise;
for (unsigned int i = 0; i < 16; i++) {
    glm::vec3 noise(randomFloats(generator) * 2.0 - 1.0,
                    randomFloats(generator) * 2.0 - 1.0,
                    0.0f);  // z = 0，围绕 z 轴旋转
    ssaoNoise.push_back(noise);
}

// 创建 4x4 噪声纹理
unsigned int noiseTexture;
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA32F, 4, 4, 0,
             GL_RGB, GL_FLOAT, &ssaoNoise[0]);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
```


噪声纹理大小为 4x4，设置为 `GL_REPEAT` 模式，会在整个屏幕平铺。这样相邻像素使用不同的旋转值，斑驳的噪点模式比带状伪影更容易被模糊消除。

### 4.2 模糊去噪

随机采样带来了高频噪点，我们用一个简单的**盒式模糊（Box Blur）**来消除：


```cpp
// 单独的 SSAO 模糊 Pass
uniform sampler2D ssaoInput;

void main() {
    vec2 texelSize = 1.0 / vec2(textureSize(ssaoInput, 0));
    float result = 0.0;
    for (int x = -2; x < 2; ++x) {
        for (int y = -2; y < 2; ++y) {
            result += texture(ssaoInput, TexCoords +
                      vec2(x, y) * texelSize).r;
        }
    }
    FragColor = result / 16.0;  // 归一化
}
```


在 `ssao.cpp` 中，使用两个 FBO 分别存储原始 SSAO 和模糊后的 SSAO：


```
// 创建 SSAO 和 SSAO 模糊帧缓冲
unsigned int ssaoFBO, ssaoBlurFBO;
glGenFramebuffers(1, &ssaoFBO);
glGenFramebuffers(1, &ssaoBlurFBO);

// SSAO 输出（单通道灰度纹理）
glTexImage2D(GL_TEXTURE_2D, 0, GL_RED, ...);
```

> [!INFO]
> **引擎连接：降噪技术进化**
>
> Crytek 的原始 SSAO 使用简单的盒式模糊。后来的技术如 HDAO、HBAO+、GTAO 使用更复杂的交叉双边滤波（Cross Bilateral Filter），在模糊的同时保留边缘信息。UE5 的 Ambient Occlusion 使用基于深度和法线的双边模糊，既去噪又保边。
 ===== 5. 渲染流程 =====

## 5. SSAO 完整渲染管线

在 `ssao.cpp` 中，完整的 SSAO 渲染分为四个阶段：

### 阶段 1：几何 Pass


```
glBindFramebuffer(GL_FRAMEBUFFER, gBuffer);
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
shaderGeometryPass.use();
// 渲染房间和背包模型
renderCube();  // 房间（反转法线）
backpack.Draw(shaderGeometryPass);  // 背包模型
glBindFramebuffer(GL_FRAMEBUFFER, 0);
```


### 阶段 2：SSAO Pass


```
glBindFramebuffer(GL_FRAMEBUFFER, ssaoFBO);
glClear(GL_COLOR_BUFFER_BIT);
shaderSSAO.use();
// 传入采样核和噪声纹理
for (unsigned int i = 0; i < 64; ++i)
    shaderSSAO.setVec3("samples[" + std::to_string(i) + "]", ssaoKernel[i]);
// 采样 G-Buffer 和噪声
glActiveTexture(GL_TEXTURE0); glBindTexture(GL_TEXTURE_2D, gPosition);
glActiveTexture(GL_TEXTURE1); glBindTexture(GL_TEXTURE_2D, gNormal);
glActiveTexture(GL_TEXTURE2); glBindTexture(GL_TEXTURE_2D, noiseTexture);
renderQuad();
glBindFramebuffer(GL_FRAMEBUFFER, 0);
```


### 阶段 3：模糊 Pass


```
glBindFramebuffer(GL_FRAMEBUFFER, ssaoBlurFBO);
glClear(GL_COLOR_BUFFER_BIT);
shaderSSAOBlur.use();
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, ssaoColorBuffer);
renderQuad();
glBindFramebuffer(GL_FRAMEBUFFER, 0);
```


### 阶段 4：光照 Pass


```
shaderLightingPass.use();
glActiveTexture(GL_TEXTURE0); glBindTexture(GL_TEXTURE_2D, gPosition);
glActiveTexture(GL_TEXTURE1); glBindTexture(GL_TEXTURE_2D, gNormal);
glActiveTexture(GL_TEXTURE2); glBindTexture(GL_TEXTURE_2D, gAlbedo);
glActiveTexture(GL_TEXTURE3); glBindTexture(GL_TEXTURE_2D, ssaoColorBufferBlur); // SSAO 因子
renderQuad();
```


在光照着色器中，SSAO 因子直接乘以环境光部分：


```
// 应用 AO 到环境光
float ao = texture(ssao, TexCoords).r;  // 0.0(全遮挡) ~ 1.0(无遮挡)
vec3 ambient = vec3(0.3 * ao) * albedo;  // 环境光乘以 AO 因子
```
 ===== 6. 引擎连接 =====

## 6. 引擎连接：商业引擎中的 AO


> [!INFO]
> **Unity Post-Processing**
> - **Ambient Occlusion** 后处理效果支持两种模式：
>
> - **Scalable Ambient Obscurance**：基于 SSAO 的改进算法，性能可调
> - **Multi-scale Volumetric Occlusion (MVO)**：更高品质的 AO，使用多级深度采样
> - 参数包括 Intensity（强度）、Radius（采样半径）、Quality（采样质量）
> - URP 和 HDRP 中的 AO 实现不同，HDRP 支持更高质量的 GTAO（Ground Truth AO）

> [!INFO]
> **Unreal Engine**
> - 默认使用 **Ambient Occlusion** 后处理
> - 历史版本使用 SSAO（UE3/UE4 早期），后来演变为 **HBAO+**（Horizon-Based AO+）
> - UE5 引入 **GTAO**（Ground Truth AO），使用球体追踪算法提供更物理正确的 AO 效果
> - 在 Post-Process Volume 中可设置：Intensity、Radius、Fade Distance、Power 等参数
> - AO 结合 Distance Field 可以为远处物体提供正确的遮挡效果

> [!INFO]
> **AO 技术的演进**
> - **SSAO (2007)**：Crytek 提出，基于深度缓冲随机采样，速度快但噪点多
> - **HBAO (2008)**：NVIDIA 改进版，在水平方向采样，噪点更少
> - **HBAO+ (2014)**：改进的 HBAO，性能更好
> - **GTAO (2016)**：基于物理的 AO，考虑可见性和多重散射，质量最高
> - **RTAO (2018+)**：基于光线追踪的 AO，完全物理正确，但需要 RTX 硬件
 ===== 7. SSAO 参数调优 =====

## 7. SSAO 参数调优


| 参数 | 作用 | 调优建议 |
| --- | --- | --- |
| 采样核大小 (KERNEL_SIZE) | 每个像素采样点数 | 16 = 快速/低质量, 32 = 中等, 64 = 高质量 |
| 采样半径 (RADIUS) | 采样范围大小 | 0.3 = 近距离细节, 0.8 = 远距离遮挡, 1.5 = 过度扩散 |
| 深度偏差 (BIAS) | 避免自遮挡的偏移量 | 0.01~0.05，太小会自遮挡，太大会漏遮挡 |
| 模糊大小 | 降噪强度 | 2x2~4x4，太大会导致 AO 细节模糊 |
 ===== 8. 练习 =====

## 8. 练习：开启/关闭 SSAO 的视觉对比

### 练习 1：观察 SSAO 效果


1. 运行 `ssao.cpp`，观察场景中的背包模型和房间
2. 识别哪些区域有 SSAO 效果（墙角、背包与地面接触处、背包带子之间）
3. 尝试在光照 Pass 中临时注释掉 `* ao`，对比有无 SSAO 的效果差异


### 练习 2：理解采样核

修改 SSAO 的参数并观察变化：


- 将 `RADIUS` 分别设为 0.1、0.5、2.0，观察 AO 影响范围
- 将 `KERNEL_SIZE` 改为 16 和 128，观察噪点和性能变化
- 移除噪声纹理（将 TBN 矩阵设为单位矩阵），观察带状伪影


### 练习 3：可视化 SSAO 纹理


1. 在 SSAO Pass 完成后，将 `ssaoColorBuffer` 直接渲染到屏幕上
2. 观察灰度图——白色 = 无遮挡，黑色 = 完全遮挡
3. 对比模糊前后的 SSAO 纹理，理解模糊对噪点的消除作用


### 练习 4：双边滤波


1. 将简单的盒式模糊改为**双边滤波（Bilateral Filter）**
2. 在模糊时考虑深度和法线差异：差异大的像素权重降低
3. 对比盒式模糊和双边滤波的 SSAO 效果差异


### 练习 5：引擎对照


1. 在 Unity 中创建场景，添加 AO 后处理效果
2. 调整 Radius 和 Intensity 参数，观察与 OpenGL 实现的对应关系
3. 思考：为什么引擎中的 AO 效果通常比单纯 SSAO 更干净？（提示：时域积累、更高采样率、更高级的降噪算法）
 ===== 导航 ===== 