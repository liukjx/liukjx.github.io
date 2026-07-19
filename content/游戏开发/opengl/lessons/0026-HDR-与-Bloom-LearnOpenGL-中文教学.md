---
title: "第26课：HDR 与 Bloom | LearnOpenGL 中文教学"
description: 理解高动态范围和泛光效果的原理与实现，以及它们在商业引擎中的应用。
tags: [opengl, 图形学, HDR, 帧缓冲, 后处理]
date: 2025-01-01
---

第 0026 课


# HDR 与 Bloom

理解高动态范围和泛光效果的原理与实现，以及它们在商业引擎中的应用。

 ===== 1. 为什么需要 HDR =====

## 1. 为什么需要 HDR

在之前的课程中，我们一直使用 `[0.0, 1.0]` 范围的颜色值。但真实世界的光照强度范围是极其宽广的——太阳的亮度可能是室内灯光的数千倍。如果我们将所有亮度都 clamp 到 1.0，就会丢失高亮区域的细节和亮度信息。


> [!INFO]
> **核心概念：HDR（High Dynamic Range）**
>
> HDR 渲染允许颜色值超出 1.0 的范围，保留场景中真实的光照强度比例。这样我们可以区分"亮"和"非常亮"——虽然显示器只能显示 [0,1]，但我们在渲染流程中保留 HDR 信息，最后通过 Tone Mapping 映射到显示范围。


在 `hdr.cpp` 中，灯光颜色值被设到了 200.0（一个点光源）——这在实际的物理世界中对应一个非常强的光源：


```cpp
lightColors.push_back(glm::vec3(200.0f, 200.0f, 200.0f)); // 极亮光源
lightColors.push_back(glm::vec3(0.1f, 0.0f, 0.0f));       // 暗红色
lightColors.push_back(glm::vec3(0.0f, 0.0f, 0.2f));       // 暗蓝色
lightColors.push_back(glm::vec3(0.0f, 0.1f, 0.0f));       // 暗绿色
```
 ===== 2. 浮点帧缓冲 =====

## 2. 浮点帧缓冲

要实现 HDR 渲染，首先需要一个能存储超过 [0,1] 颜色值的帧缓冲。我们使用浮点纹理作为颜色附件：


```
// 创建浮点帧缓冲
glGenFramebuffers(1, &hdrFBO);

// 创建浮点颜色缓冲（GL_RGBA16F 表示 16 位浮点）
unsigned int colorBuffer;
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F,
             SCR_WIDTH, SCR_HEIGHT, 0, GL_RGBA, GL_FLOAT, NULL);

// 创建深度缓冲（使用 Renderbuffer）
unsigned int rboDepth;
glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT,
                      SCR_WIDTH, SCR_HEIGHT);
```


这里关键的是 `GL_RGBA16F` 内部格式，它表示每个通道使用 16 位浮点数存储，允许远大于 1.0 的值。你也可以使用 `GL_RGBA32F` 获得更高精度，但显存消耗更大。


> [!INFO]
> **引擎连接：浮点纹理**
>
> Unity 的 HDR 渲染使用 `GraphicsFormat.R16G16B16A16_SFloat` 格式的 RenderTexture，与 OpenGL 的 `GL_RGBA16F` 完全对应。在 UE 中，默认的 SceneColor 就是 `PF_FloatRGBA`（16 位浮点格式），所有光照计算都在 HDR 空间进行。
 ===== 3. Tone Mapping =====

## 3. Tone Mapping（色调映射）

HDR 渲染完成后，我们得到了一个包含超出 [0,1] 范围颜色值的纹理。但显示器只能显示 [0,1] 范围，所以我们需要一个**色调映射（Tone Mapping）**步骤来将 HDR 颜色映射到 LDR 范围。

在 LearnOpenGL 的实现中，分为两步：先渲染场景到 HDR FBO，然后渲染一个全屏四边形，使用 HDR shader 进行 Tone Mapping：


```
// 第一步：渲染场景到 HDR 帧缓冲
glBindFramebuffer(GL_FRAMEBUFFER, hdrFBO);
    // ... 正常渲染场景，光照计算 ...
glBindFramebuffer(GL_FRAMEBUFFER, 0);

// 第二步：Tone Mapping 到默认帧缓冲
hdrShader.use();
hdrShader.setInt("hdr", hdr);
hdrShader.setFloat("exposure", exposure);
renderQuad();
```


### 3.1 Reinhard Tone Mapping

最简单的 Tone Mapping 方法是 Reinhard 算子，它可以将任意大的值映射到 [0,1]：


```
// Reinhard Tone Mapping
vec3 mapped = color / (color + vec3(1.0));
```


Reinhard 的特点是"亮度越高压缩越多"，能很好地保留整体对比度，但高光区域的细节会显得偏灰。

### 3.2 曝光控制（Exposure）

在 HDR 渲染中，我们可以像真实相机一样控制**曝光**。通过调节曝光值，可以模拟人眼在不同亮度环境下的适应过程：


```
// 带曝光控制的 Tone Mapping
vec3 mapped = vec3(1.0) - exp(-color * exposure);
```


在 `hdr.cpp` 中，通过 Q/E 键调整曝光值：


```
if (glfwGetKey(window, GLFW_KEY_Q) == GLFW_PRESS) exposure -= 0.001f;
else if (glfwGetKey(window, GLFW_KEY_E) == GLFW_PRESS) exposure += 0.001f;
```


### 3.3 ACES Filmic Tone Mapping

ACES（Academy Color Encoding System）是目前行业标准的高级 Tone Mapping 算法，被广泛应用于电影和游戏行业。它的曲线在暗部和亮部都有更好的表现：


```
// ACES Filmic Tone Mapping (近似)
vec3 ACESFilm(vec3 x) {
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}
```

> [!INFO]
> **引擎连接：Tone Mapping**
>
> Unity Post-Processing 的 Tonemapping 提供了三种模式：Neutral（中性）、ACES（电影级）、ACES Proxy。UE 的 Post-Process Volume 中也有 Film ACES 和 Reinhard 选项。大多数 AAA 游戏现在使用 ACES。
 ===== 4. Bloom =====

## 4. Bloom（泛光）原理

Bloom 是一种模拟真实相机镜头的光晕效果——当光线特别亮时，会在周围区域产生光晕。在 HDR 渲染的基础上实现 Bloom 非常自然：我们利用 HDR 帧缓冲中亮部区域的值 > 1.0 的特性，提取出这些区域并进行模糊处理。

### 4.1 Bloom 实现流程

在 `bloom.cpp` 中，Bloom 的渲染流程分为四个步骤：


1. **渲染场景到 HDR FBO**：使用两个颜色附件，一个存完整场景，一个存亮部区域
2. **提取亮部**：在片段着色器中通过阈值判断哪些像素是"亮部"
3. **高斯模糊**：对亮部纹理进行两遍分离式高斯模糊
4. **叠加**：将模糊后的亮部叠加到原始场景上


### 4.2 MRT 多渲染目标

Bloom 使用 MRT（Multiple Render Targets）技术，一个 Pass 渲染到多个颜色附件：


```
// 创建两个颜色附件
unsigned int colorBuffers[2];
for (unsigned int i = 0; i < 2; i++) {
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F, ...);
    glFramebufferTexture2D(GL_FRAMEBUFFER,
        GL_COLOR_ATTACHMENT0 + i, ...);
}
// 告诉 OpenGL 使用两个颜色附件
unsigned int attachments[2] = { GL_COLOR_ATTACHMENT0, GL_COLOR_ATTACHMENT1 };
glDrawBuffers(2, attachments);
```


在片段着色器中提取亮部区域：


```
// 正常颜色输出到 colorBuffers[0]
FragColor = vec4(result, 1.0);

// 亮度超过阈值的部分输出到 colorBuffers[1]
float brightness = dot(result, vec3(0.2126, 0.7152, 0.0722));
BrightColor = brightness > 1.0 ? vec4(result, 1.0) : vec4(0.0, 0.0, 0.0, 1.0);
```
 ===== 5. 高斯模糊 =====

## 5. 高斯模糊（两遍分离式）

标准的 NxN 高斯模糊需要采样 N² 次纹理，效率较低。分离式高斯模糊利用高斯函数的可分离性，将二维模糊分解为两个一维模糊：先水平方向再垂直方向（或反之），只需要 2N 次采样。

### 5.1 Ping-Pong FBO

在 `bloom.cpp` 中，使用两个帧缓冲（pingpongFBO[0] 和 pingpongFBO[1]）交替进行水平和垂直模糊：


```
bool horizontal = true, first_iteration = true;
int amount = 10;
for (unsigned int i = 0; i < amount; i++) {
    glBindFramebuffer(GL_FRAMEBUFFER, pingpongFBO[horizontal]);
    shaderBlur.setInt("horizontal", horizontal);
    // 第一次迭代取 colorBuffers[1]（亮部纹理），后续取上一次的模糊结果
    glBindTexture(GL_TEXTURE_2D,
        first_iteration ? colorBuffers[1] : pingpongColorbuffers[!horizontal]);
    renderQuad();
    horizontal = !horizontal;
    if (first_iteration) first_iteration = false;
}
```


### 5.2 高斯权重

在片段着色器中计算水平或垂直方向的高斯权重：


```
// 水平模糊（垂直方向类似，用 texcoord.y 替换 texcoord.x）
float weight[5] = float[] (0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);
vec2 tex_offset = 1.0 / textureSize(image, 0); // 单个像素大小

vec3 result = texture(image, TexCoords).rgb * weight[0];
for(int i = 1; i < 5; ++i) {
    result += texture(image, TexCoords + vec2(tex_offset.x * i, 0.0)).rgb * weight[i];
    result += texture(image, TexCoords - vec2(tex_offset.x * i, 0.0)).rgb * weight[i];
}
```

> [!INFO]
> **引擎连接：高斯模糊优化**
>
> Unity Bloom 组件使用类似的两遍分离式高斯模糊，但采用了可调迭代次数和模糊半径。URP 中的 Bloom 还加入了"降采样"优化——先将亮部纹理缩小到 1/2 或 1/4 再进行模糊，大幅提升性能。UE 的 Bloom 默认使用 1/2、1/4、1/8、1/16 的多级降采样金字塔结构。
 ===== 6. Bloom 叠加 =====

## 6. Bloom 最终合成

最后一步，将模糊后的亮部纹理叠加到原始 HDR 场景上，再进行 Tone Mapping：


```
// bloom_final.fs 中：将场景颜色与 Bloom 模糊结果混合
vec3 color = texture(scene, TexCoords).rgb;       // 原始 HDR 场景
vec3 bloom = texture(bloomBlur, TexCoords).rgb;   // 模糊后的亮部

if(bloom)  // 用户可开关 Bloom
    color += bloom; // 直接相加

// 最后做 Tone Mapping
vec3 mapped = vec3(1.0) - exp(-color * exposure);
FragColor = vec4(mapped, 1.0);
```


在 `bloom.cpp` 中，通过按 Space 键切换 Bloom 效果：


```
if (glfwGetKey(window, GLFW_KEY_SPACE) == GLFW_PRESS && !bloomKeyPressed) {
    bloom = !bloom;
    bloomKeyPressed = true;
}
```
 ===== 7. 引擎连接 =====

## 7. 引擎连接：商业引擎中的 HDR 与 Bloom


> [!INFO]
> **Unity Post-Processing**
> - **Bloom**：参数包括 Intensity（强度）、Threshold（阈值，控制哪些亮度触发 Bloom）、Scatter（扩散，控制模糊半径）、Anamorphic（变形，X/Y 轴模糊量不同）
> - **Eye Adaptation**（自动曝光）：模拟人眼对亮度的自动适应，使用直方图计算场景平均亮度，动态调整曝光值

> [!INFO]
> **Unreal Engine**
> - **Bloom**：默认开启，基于多级降采样的高斯模糊。参数：Intensity、Threshold、Size（控制模糊范围）、Method（高斯/Gaussian 或 Tent）
> - **Eye Adaptation**：UE 的自动曝光系统基于 HDR 渲染，可在后处理体积中设置 Exposure Compensation、Min/Max Brightness
> - UE 使用的 Tone Mapping 算子默认为 **Film ACES**（Tony McMapface）

> [!INFO]
> **Godot Engine**
> - 使用 `USE_HDR` 的 16 位浮点帧缓冲
> - Bloom 在 WorldEnvironment 节点中配置，支持高/中/低三种质量预设
> - Tone Mapping 支持 Reinhard、Filmic、ACES 模式
 ===== 8. 练习 =====

## 8. 练习：实现 HDR + Bloom

### 练习 1：理解 HDR 帧缓冲

打开 `hdr.cpp`，找到创建浮点帧缓冲的代码。尝试回答：


- 为什么使用 `GL_RGBA16F` 而不是 `GL_RGBA`？
- 如果不使用 HDR 帧缓冲，直接渲染到默认帧缓冲会看到什么现象？
- 将 `lightColors[0]` 的 200.0 改为 1.0，HDR 效果会消失吗？


### 练习 2：Reinhard vs ACES

在 HDR 片段着色器中，分别实现 Reinhard 和 ACES Tone Mapping：


1. Reinhard：`color / (color + vec3(1.0))`
2. ACES Filmic 近似（使用上面的公式）
3. 对比两者在高光和暗部区域的视觉效果差异


### 练习 3：Bloom 参数调优

打开 `bloom.cpp`，调整以下参数并观察效果变化：


- 修改模糊迭代次数 `amount`（当前为 10），分别设为 2、5、20
- 修改 Bloom 阈值，提取不同亮度的区域（在片段着色器中修改 `brightness > 1.0` 的比较值）
- 在 Bloom 叠加时，尝试使用 `lerp(color, bloom, 0.5)` 替代直接相加


### 练习 4：引擎效果对照


1. 在 Unity 中创建一个新场景，添加 Post-Processing Volume
2. 启用 Bloom，将 Threshold 设为 0.8，观察哪些区域产生 Bloom
3. 对比 OpenGL 实现的效果——两者的 Bloom 生成原理完全相同
 ===== 导航 ===== 