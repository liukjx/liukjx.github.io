---
title: 第0019课：帧缓冲 (Framebuffers) - LearnOpenGL
description: 在前面的课程中，我们学习了模型加载、深度测试和模板测试。所有渲染都直接输出到屏幕上的默认帧缓冲。本课将介绍自定义帧缓冲，这是实现后处理特效、阴影映射、镜面反射等
tags: [opengl, 图形学, 帧缓冲]
date: 2025-01-01
---

LearnOpenGL 系列课程


# 第0019课：帧缓冲 (Framebuffers)

在前面的课程中，我们学习了模型加载、深度测试和模板测试。所有渲染都直接输出到屏幕上的默认帧缓冲。本课将介绍**自定义帧缓冲**，这是实现后处理特效、阴影映射、镜面反射等高级渲染技术的基础。

## 1. 默认帧缓冲 vs 自定义帧缓冲

### 1.1 什么是帧缓冲

帧缓冲（Framebuffer）是 OpenGL 渲染管线的最终输出目标，包含了颜色缓冲、深度缓冲和模板缓冲。通常我们使用窗口系统提供的**默认帧缓冲**（ID = 0），其颜色缓冲直接对应到屏幕显示。

### 1.2 自定义帧缓冲

OpenGL 允许我们创建自己的帧缓冲对象（Framebuffer Object, FBO），将渲染结果输出到纹理或渲染缓冲对象中，而不是直接显示在屏幕上。这称为**离屏渲染**（Off-Screen Rendering）。


| 特性 | 默认帧缓冲 | 自定义帧缓冲 |
| --- | --- | --- |
| 创建方式 | GLFW 自动创建 | glGenFramebuffers() |
| 颜色目标 | 窗口显示缓冲 | 纹理 或 渲染缓冲 |
| 可见性 | 直接显示在屏幕 | 不可见，需后续处理 |
| 用途 | 正常渲染 | 后处理、阴影、反射等 |


## 2. 离屏渲染管线

自定义帧缓冲的工作流程遵循"创建 -> 附加 -> 绑定 -> 渲染 -> 使用"的五步模式：

### 2.1 创建帧缓冲


```
unsigned int fbo;
glGenFramebuffers(1, &fbo);
glBindFramebuffer(GL_FRAMEBUFFER, fbo);
```


### 2.2 附加颜色纹理

我们需要为帧缓冲附加至少一个颜色缓冲附件。最灵活的方式是附加一个纹理，这样渲染结果就可以在后续的渲染 pass 中作为纹理采样使用。


```
unsigned int texColorBuffer;
glGenTextures(1, &texColorBuffer);
glBindTexture(GL_TEXTURE_2D, texColorBuffer);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, SCR_WIDTH, SCR_HEIGHT, 0, GL_RGB, GL_UNSIGNED_BYTE, NULL);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, texColorBuffer, 0);
```


### 2.3 附加深度和模板缓冲

深度和模板缓冲可以使用**渲染缓冲对象**（Renderbuffer Object, RBO）附加。渲染缓冲是 OpenGL 内部管理的缓冲，不支持采样，但性能优于纹理。


```
unsigned int rbo;
glGenRenderbuffers(1, &rbo);
glBindRenderbuffer(GL_RENDERBUFFER, rbo);
glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH24_STENCIL8, SCR_WIDTH, SCR_HEIGHT);
glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_RENDERBUFFER, rbo);
```


### 2.4 检查完整性

帧缓冲必须处于"完整"状态才能用于渲染：


```
if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE)
    cout << "ERROR::FRAMEBUFFER:: Framebuffer is not complete!" << endl;
```


### 2.5 渲染到纹理

在渲染循环中，先绑定到自定义帧缓冲渲染场景，然后绑定回默认帧缓冲，将渲染结果纹理绘制到一个全屏四边形上：


```
// 第一遍：渲染到帧缓冲
glBindFramebuffer(GL_FRAMEBUFFER, fbo);
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
// ... 正常绘制场景 ...

// 第二遍：使用纹理绘制到屏幕
glBindFramebuffer(GL_FRAMEBUFFER, 0);
glClear(GL_COLOR_BUFFER_BIT);
screenShader.use();
glBindTexture(GL_TEXTURE_2D, texColorBuffer);
glDrawArrays(GL_TRIANGLES, 0, 6);
```

> [!INFO]
> **核心流程**
>
> 离屏渲染的完整管线：**创建 FBO → 附加纹理/RBO → 绑定 FBO → 渲染场景 → 解绑 FBO → 使用纹理作为输入 → 渲染到屏幕**。这个模式在后续课程的阴影映射、延迟着色中会反复出现。


## 3. 后处理效果

后处理的核心思想是将场景渲染到帧缓冲的纹理上，然后通过一个全屏四边形的片段着色器对纹理进行逐像素处理。我们可以通过修改片段着色器实现各种视觉效果。

### 3.1 反相 (Inversion)

最简单的后处理效果：用 1.0 减去每个颜色分量：


```cpp
void main() {
    vec3 col = texture(screenTexture, TexCoords).rgb;
    FragColor = vec4(vec3(1.0 - col), 1.0);
}
```


### 3.2 灰度 (Grayscale)

将彩色转换为灰度，常用加权平均法（人眼对绿色最敏感）：


```cpp
void main() {
    vec3 col = texture(screenTexture, TexCoords).rgb;
    float gray = dot(col, vec3(0.2126, 0.7152, 0.0722));
    FragColor = vec4(vec3(gray), 1.0);
}
```


### 3.3 核卷积与模糊 (Blur)

图像处理中的**核卷积**（Kernel Convolution）是后处理的核心技术。它用一个 NxN 矩阵（核）与像素及其邻域进行加权平均：

模糊核（3x3）：


```
const float kernel[9] = float[](
    1.0/16, 2.0/16, 1.0/16,
    2.0/16, 4.0/16, 2.0/16,
    1.0/16, 2.0/16, 1.0/16
);
```

```cpp
void main() {
    vec2 offsets[9] = vec2[](
        vec2(-1,  1), vec2(0,  1), vec2(1,  1),
        vec2(-1,  0), vec2(0,  0), vec2(1,  0),
        vec2(-1, -1), vec2(0, -1), vec2(1, -1)
    );
    vec3 sampleTex[9];
    for(int i = 0; i < 9; i++)
        sampleTex[i] = texture(screenTexture, TexCoords.st + offsets[i] * vec2(texOffset)).rgb;

    vec3 col = vec3(0.0);
    for(int i = 0; i < 9; i++)
        col += sampleTex[i] * kernel[i];
    FragColor = vec4(col, 1.0);
}
```


### 3.4 边缘检测 (Edge Detection)

使用 Sobel 算子可以检测图像中的边缘：


```
const float sobelX[9] = float[](
     1,  0, -1,
     2,  0, -2,
     1,  0, -1
);
const float sobelY[9] = float[](
     1,  2,  1,
     0,  0,  0,
    -1, -2, -1
);
// 分别计算 x 和 y 方向的梯度，取长度
```

> [!INFO]
> **核卷积原理**
>
> 卷积核是一个权重矩阵，中心对应当前像素，周围对应邻域像素。每个像素的新值 = 权重与对应像素的乘积之和。不同核产生不同效果：模糊核取平均、锐化核增强差异、边缘检测核提取梯度。这是图像处理和计算机视觉的基础操作。


## 4. 源文件分析

### 4.1 基础帧缓冲 (5.1.framebuffers)

该示例创建了一个自定义帧缓冲，将场景渲染到纹理，然后通过全屏四边形显示。场景中包含两个带纹理的立方体和一个地板平面。


- **第一遍渲染**：绑定到自定义 FBO，渲染立方体和地板，输出到 color texture
- **第二遍渲染**：绑定回默认 FBO，禁用深度测试，用 screenShader 将纹理绘制到全屏四边形


### 4.2 镜面反射练习 (5.2.framebuffers_exercise1)

该示例巧妙地将帧缓冲用于创建镜面反射效果：


- **第一遍**：将相机绕 Y 轴旋转 180 度，渲染场景到帧缓冲纹理（相当于从镜子视角看世界）
- **第二遍**：正常渲染场景
- **第三遍**：在屏幕上方绘制一个小四边形，显示第一遍的纹理——形成镜面效果


## 5. 引擎连接


> [!INFO]
> **Unity 引擎对应**
> - **Post-Processing Stack**：Unity 的后处理栈本质上就是帧缓冲后处理。它先将相机画面渲染到一张 RT（RenderTexture），然后通过一系列全屏 Pass 应用各种效果（Bloom、Color Grading、DOF 等）。
> - **Camera.targetTexture**：Unity 中设置相机的 targetTexture 属性，相当于将相机渲染到自定义帧缓冲。这是实现安全摄像头画面、小地图、镜面反射等效果的基础。
> - **OnRenderImage 回调**：Unity 的 MonoBehaviour.OnRenderImage(RenderTexture src, RenderTexture dest) 本质上就是帧缓冲后处理的抽象，src 是上一阶段的帧缓冲纹理，dest 是输出目标。

> [!WARNING]
> **UE 引擎对应**
> - **Post Process Volume**：Unreal Engine 的后处理体积，同样是基于帧缓冲的多 Pass 渲染。
> - **Scene Capture 2D**：相当于 Unity 的 targetTexture，将场景渲染到纹理用于 UI 或材质。
> - **Render Target**：UE 中的渲染目标概念，直接对应 OpenGL 帧缓冲。


## 6. 练习


1. **实现反相效果**：修改 screenShader 的片段着色器，在屏幕四边形的片段着色器中实现颜色反相。
2. **实现灰度效果**：在反相的基础上，添加按键切换功能（如按 '1' 切换反相，按 '2' 切换灰度），使用 uniform 变量控制效果类型。
3. **实现模糊效果**：使用 5x5 模糊核对渲染结果进行模糊处理。观察不同核大小对模糊程度的影响。
4. **实现边缘检测**：使用 Sobel 算子实现边缘检测效果，尝试调整阈值。
5. **组合效果**：在单次后处理 pass 中组合多种效果，例如先灰度再边缘检测。
