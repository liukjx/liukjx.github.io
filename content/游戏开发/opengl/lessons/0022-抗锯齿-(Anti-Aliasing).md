---
title: 第0022课：抗锯齿 (Anti Aliasing) - LearnOpenGL
description: 本课探讨渲染中的锯齿（Aliasing）问题及其解决方案——抗锯齿（Anti Aliasing, AA）。锯齿是实时图形学中最常见的视觉瑕疵之一，表现为物体边缘
tags: [opengl, 图形学, 抗锯齿]
date: 2025-01-01
---

LearnOpenGL 系列课程


# 第0022课：抗锯齿 (Anti Aliasing)

本课探讨渲染中的**锯齿**（Aliasing）问题及其解决方案——**抗锯齿**（Anti Aliasing, AA）。锯齿是实时图形学中最常见的视觉瑕疵之一，表现为物体边缘的"阶梯状"或"闪烁"现象。

## 1. 锯齿产生的原因

### 1.1 采样率不足

锯齿的根本原因是**采样率不足**（Undersampling）。数字图像由离散的像素组成（空间采样），当信号（场景中的几何边缘）的频率高于采样频率时，就会发生**走样**（Aliasing）——高频信息被错误地映射为低频信息，表现为锯齿边缘。

一个类比：用低分辨率摄像机拍摄细条纹衬衫——屏幕上会出现奇怪的波纹图案（摩尔纹），这就是走样。

### 1.2 几何锯齿

三角形的边缘在像素网格上呈现阶梯状，这是因为每个像素只能取一个颜色值。如果像素中心落在三角形内部，整个像素就被三角形颜色填充；否则就不填充。这种"是/否"的二值判断导致了锯齿。

## 2. MSAA（多重采样抗锯齿）

### 2.1 MSAA 原理

MSAA（Multisample Anti Aliasing，多重采样抗锯齿）是最常用的硬件抗锯齿技术。其核心思想是：


- **每个像素使用多个采样点**（而非一个），检测哪些采样点被三角形覆盖
- **片段着色器只执行一次**（在每个像素中心），但结果被写入所有被覆盖的采样点
- 最终像素颜色 = 所有采样点的平均值


例如 4x MSAA，每个像素有 4 个采样点。如果一个像素的 4 个采样点中有 2 个在三角形内、2 个在三角形外，则颜色 = 50% 三角形颜色 + 50% 背景颜色，产生平滑过渡。

### 2.2 开启 MSAA

在 OpenGL 中，如果 GLFW 窗口支持多重采样，只需启用 `GL_MULTISAMPLE`：


```
// 请求 GLFW 创建多重采样窗口（在创建窗口前设置）
glfwWindowHint(GLFW_SAMPLES, 4);

// 启用多重采样
glEnable(GL_MULTISAMPLE);
```


默认帧缓冲的 MSAA 由 GLFW 自动处理，不需要额外的代码。

### 2.3 离屏 MSAA

当使用自定义帧缓冲（做后处理等）时，需要手动创建多重采样的纹理和渲染缓冲：

**创建多重采样纹理**：


```
unsigned int textureColorBufferMultiSampled;
glGenTextures(1, &textureColorBufferMultiSampled);
glBindTexture(GL_TEXTURE_2D_MULTISAMPLE, textureColorBufferMultiSampled);
glTexImage2DMultisample(GL_TEXTURE_2D_MULTISAMPLE, 4, GL_RGB, SCR_WIDTH, SCR_HEIGHT, GL_TRUE);
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D_MULTISAMPLE, textureColorBufferMultiSampled, 0);
```


**创建多重采样渲染缓冲**：


```
unsigned int rbo;
glGenRenderbuffers(1, &rbo);
glBindRenderbuffer(GL_RENDERBUFFER, rbo);
glRenderbufferStorageMultisample(GL_RENDERBUFFER, 4, GL_DEPTH24_STENCIL8, SCR_WIDTH, SCR_HEIGHT);
glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_RENDERBUFFER, rbo);
```


### 2.4 多重采样帧缓冲的解析 (Blit)

多重采样纹理不能直接在着色器中采样。要将 MSAA 结果用于后处理，需要通过 `glBlitFramebuffer` 将多重采样缓冲**解析**（Resolve）到普通纹理中：


```
// 配置中间帧缓冲（普通纹理）
unsigned int intermediateFBO;
glGenFramebuffers(1, &intermediateFBO);
// ... 附加普通纹理 ...

// 将多重采样缓冲 blit 到普通帧缓冲
glBindFramebuffer(GL_READ_FRAMEBUFFER, multisampledFBO);
glBindFramebuffer(GL_DRAW_FRAMEBUFFER, intermediateFBO);
glBlitFramebuffer(0, 0, SCR_WIDTH, SCR_HEIGHT, 0, 0, SCR_WIDTH, SCR_HEIGHT, GL_COLOR_BUFFER_BIT, GL_NEAREST);

// 然后使用 intermediateFBO 的纹理进行后处理
```

> [!INFO]
> **离屏 MSAA 完整流程**
> 1. 创建多重采样 FBO（多重采样颜色纹理 + 多重采样 RBO）
> 2. 创建中间 FBO（普通纹理，用于解析后处理和最终输出）
> 3. 渲染到多重采样 FBO（场景正常绘制到 MSAA 缓冲）
> 4. glBlitFramebuffer 解析到中间 FBO
> 5. 使用中间 FBO 的纹理进行后处理或输出到屏幕


## 3. 源文件分析

### 3.1 窗口 MSAA (11.1.anti_aliasing_msaa)

最简单的 MSAA 示例：


- 在 glfwInit 后通过 `glfwWindowHint(GLFW_SAMPLES, 4)` 请求 4x MSAA
- 在初始化中 `glEnable(GL_MULTISAMPLE)` 启用多重采样
- 绘制一个带旋转的立方体，观察边缘的平滑效果
- 按 '1' 键切换线框模式，可以更清楚地看到 MSAA 的效果


### 3.2 离屏 MSAA (11.2.anti_aliasing_offscreen)

更复杂的示例，结合帧缓冲和 MSAA：


- 创建多重采样 FBO（GL_TEXTURE_2D_MULTISAMPLE 颜色纹理 + 多重采样 RBO）
- 创建中间 FBO（普通 GL_TEXTURE_2D 纹理，用于解析后输出）
- 渲染循环：场景 -> 多重采样 FBO -> glBlitFramebuffer -> 中间 FBO -> 后处理 -> 屏幕
- 这样既获得了 MSAA 的抗锯齿效果，又能应用后处理特效


## 4. 其他抗锯齿技术


| 技术 | 原理 | 性能 | 质量 |
| --- | --- | --- | --- |
| SSAA (超级采样) | 在更高分辨率渲染，然后降采样 | 极耗 | 最好 |
| MSAA (多重采样) | 仅对深度/模板做多重采样，片段着色器执行一次 | 中等 | 好 |
| FXAA (快速近似) | 后处理方式检测边缘并模糊 | 极低 | 一般（模糊） |
| TAA (时序抗锯齿) | 利用多帧信息进行抗锯齿 | 低 | 很好（但可能有拖影） |
| SMAA (增强子像素) | 改进的边缘检测后处理 AA | 低 | 较好 |


MSAA 在高质量和合理性能之间取得了良好的平衡，是当前游戏引擎最常用的硬件抗锯齿方案。

## 5. 引擎连接


> [!INFO]
> **Unity 引擎对应**
> - **Project Settings > Quality > Anti Aliasing**：Unity 的质量设置中的抗锯齿选项直接对应 MSAA。可选项为 Disabled、2x、4x、8x。
> - **Camera 的 MSAA 属性**：当相机使用 HDR 渲染时，MSAA 可能不可用，此时需要配合 Post-Processing 中的 TAA 使用。
> - **Post-Processing 中的 Antialiasing**：Unity Post-Processing Stack 提供了 FXAA 和 TAA 作为后处理抗锯齿方案，它们不依赖硬件 MSAA。
> - **URP/HDRP 中的 MSAA**：Unity 可编程渲染管线中，需要在管线资产中开启 MSAA。

> [!WARNING]
> **UE 引擎对应**
> - **Default Engine Scalability Settings**：UE 的可扩展性设置中的 Anti-Aliasing 选项，默认使用 TAA。
> - **Post Process Volume > Anti-Aliasing Method**：UE 在后处理体积中提供多种 AA 方法选择：None、FXAA、TAA、MSAA。
> - **MSAA 在 UE5**：UE5 默认使用 TAA（时序抗锯齿），因为 Nanite 虚拟几何体技术与 MSAA 不完全兼容。对于传统渲染路径，MSAA 仍可使用。


## 6. 练习


1. **对比 MSAA 开启/关闭**：运行 `11.1.anti_aliasing_msaa`，注释掉 `glEnable(GL_MULTISAMPLE)` 这行，对比开启和关闭 MSAA 时的边缘质量。
2. **不同采样率对比**：修改 `glfwWindowHint(GLFW_SAMPLES, N)` 的 N 值（2, 4, 8, 16），观察边缘平滑度的差异和帧率变化。
3. **离屏 MSAA 后处理**：在 `11.2.anti_aliasing_offscreen` 的基础上，为输出的屏幕纹理添加边缘检测或模糊后处理效果。
4. **MSAA 与线框模式**：在线框模式下（glPolygonMode），MSAA 对三角形边缘的平滑效果如何？思考原因。
5. **性能分析**：在 4x MSAA 下渲染大量几何体，对比开启/关闭 MSAA 的帧率差异，理解 MSAA 的显存和带宽开销。
