---
title: 第0023课：Blinn-Phong 与 Gamma 校正 | LearnOpenGL 教学
description: 在前面的课程中，我们学习了 Phong 光照模型。它虽然简单有效，但在某些角度下会出现明显的高光断裂问题。同时，我们还忽略了显示器的一个"小秘密"——它并不按线
tags: [opengl, 图形学, 颜色]
date: 2025-01-01
---

# Blinn-Phong 与 Gamma 校正

在前面的课程中，我们学习了 Phong 光照模型。它虽然简单有效，但在某些角度下会出现明显的高光断裂问题。同时，我们还忽略了显示器的一个"小秘密"——它并不按线性方式输出亮度。本课将解决这两个问题。

 ============================================================

## 1. Phong 高光的问题：光线断裂

回顾 Phong 光照模型的高光部分，它依赖**反射向量 R** 与**视线方向 V** 之间的夹角余弦值：


```
float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
```


当视线方向与反射方向的夹角超过 90 度时，`dot(viewDir, reflectDir)` 为负值，被 `max(..., 0.0)` 截断为零——高光瞬间消失。这在光源位于物体表面"边缘"时尤其明显，会产生一块突兀的暗区，即**高光断裂**。

在 `advanced_lighting.cpp` 中，按下 B 键可在 Phong 和 Blinn-Phong 之间切换，观察地板上高光的明显变化：


```
// Phong 高光断裂时的视觉效果：
// 当反射向量偏离视线 > 90 度 → 高光立即消失 → 产生突兀的暗区
// Blinn-Phong 则在整个过程中保持平滑过渡
```

> [!INFO]
> **引擎连接：Unity / Unreal**
> 在 Unity 中，标准着色器（Standard Shader）默认使用 Blinn-Phong 模型。Unreal Engine 的默认光照也是基于 Blinn-Phong 的改良版本。你几乎不会在现代引擎中看到纯 Phong 高光，因为 Blinn-Phong 在计算效率和视觉质量上都更好。
 ============================================================

## 2. Blinn-Phong：半程向量登场

Blinn-Phong 模型由 Jim Blinn 提出，是 Phong 模型的一个高效变体。其核心思想是：**不用反射向量 R，而是用半程向量 H**。

半程向量定义为视线方向与光照方向的中间向量：


```
vec3 halfDir = normalize(lightDir + viewDir);
```


然后计算半程向量与表面法线的点积来得到高光强度：


```
float spec = pow(max(dot(normal, halfDir), 0.0), shininess);
```


为什么这能解决断裂问题？因为半程向量与法线的夹角永远不会超过 90 度，除非光线来自物体背面。无论视线方向如何，高光都能平滑过渡。


| 对比项 | Phong | Blinn-Phong |
| --- | --- | --- |
| 计算内容 | 反射向量 R · 视线方向 V | 法线 N · 半程向量 H |
| 高光断裂 | 当 R·V < 0 时断裂 | 无断裂 |
| 计算量 | 反射向量（较重） | 加法 + 归一化（更轻） |
| 等效光泽度 | 使用原始光泽度 | 需调整光泽度（通常除以 4） |
 ============================================================

## 3. Gamma 校正：显示器的非线性秘密

显示器（CRT / LCD）的物理特性决定了它**不是线性输出**的。输入亮度值 v 与显示亮度之间的关系近似为：


```
displayed = v ^ gamma    // gamma ≈ 2.2
```


也就是说，如果你在计算机中存储颜色值 `0.5`，显示器实际显示的亮度只有约 `0.5^2.2 ≈ 0.218`——颜色偏暗。

为补偿这一点，**Gamma 校正**在输出前对颜色进行反向操作：


```
corrected = color ^ (1.0 / gamma)    // 取 1/2.2 次方，即乘方 0.45
```


这样，显示器输出后得到的就是正确的线性亮度。


> [!WARNING]
> **常见误解**
> 很多人认为 sRGB 是一种"颜色格式"，但它的本质是一个 Gamma 曲线标准（近似 gamma ≈ 2.2，但在暗处有细微调整）。sRGB 是互联网和消费电子的事实标准——你的相机拍的照片、网上下载的贴图，几乎都是 sRGB 编码的。
 ============================================================

## 4. sRGB 颜色空间

sRGB 颜色空间定义了颜色的编码方式。当你在 Photoshop 中保存一张"普通"图片时，它通常就是 sRGB 编码的——已经应用了 Gamma 曲线。

这带来了一个关键问题：**如果直接将 sRGB 贴图用于光照计算，结果会不正确**，因为你是在对非线性数据做线性计算。

正确流程：


1. 加载 sRGB 贴图 → 转换为线性空间（Gamma 解码）
2. 在线性空间中进行光照计算
3. 输出前进行 Gamma 校正（编码）→ 显示


在 OpenGL 中，只需在加载纹理时指定 `GL_SRGB` 内部格式：


```
// 在 gamma_correction.cpp 中可以看到关键代码：
GLenum internalFormat = gammaCorrection ? GL_SRGB : GL_RGB;
// ...
glTexImage2D(GL_TEXTURE_2D, 0, internalFormat, width, height, 0,
             dataFormat, GL_UNSIGNED_BYTE, data);
```


当内部格式为 `GL_SRGB` 时，OpenGL 在采样时会自动将 sRGB 转换为线性值，无需手动处理。

 ============================================================

## 5. 线性空间渲染管线

完整的 Gamma 校正渲染管线是：


```
纹理输入（sRGB）  →  解码为线性  →  光照计算  →  Gamma 编码  →  显示器
```


如果不做 Gamma 校正：


- 暗部细节丢失（因为显示器压暗了中间值）
- 高光区域被过度扩展（看起来模糊不自然）
- 光照衰减看起来不真实


对比 `gamma_correction.cpp` 中的效果：场景中有 4 个光源，亮度从 0.25 到 1.0。按 Space 键切换 Gamma 校正的开启和关闭：


- **Gamma 关闭**：暗部区域偏暗，整体色调偏深
- **Gamma 开启**：亮度分布更自然，暗部细节清晰可见

> [!INFO]
> **引擎连接：Unity 的"线性颜色空间"**
> 在 Unity 的 **Player Settings → Other Settings → Color Space** 中，可以选择 `Gamma` 或 `Linear` 颜色空间。选择 `Linear` 时，Unity 会自动执行完整的线性渲染管线——sRGB 纹理解码、线性光照计算、最终 Gamma 输出。这是所有现代游戏的标准配置。Unreal Engine 默认全程使用线性空间渲染。
 ============================================================

## 6. 关于 Gamma 校正的更多细节

### 6.1 衰减的正确计算

在线性空间中，光照衰减使用平方反比定律：`attenuation = 1.0 / (distance * distance)`。在 Gamma 空间中，同样的衰减看起来会像 `1.0 / (distance^4.4)`，衰减速度过快。

### 6.2 纹理过滤

在 sRGB 空间中进行 mipmap 插值也是不正确的。正确的做法是在线性空间中进行插值。使用 `GL_SRGB` 内部格式后，OpenGL 会自动处理这一切——采样时解码为线性，然后才进行插值。

### 6.3 帧缓冲的 Gamma

当使用 HDR 帧缓冲时，通常将颜色以线性值存储在浮点纹理中，最后一遍绘制全屏四边形时再应用 Gamma 校正（作为 Tone Mapping 的一部分）。

 ============================================================

## 7. 代码关键点解读

### Blinn-Phong 切换


```
// advanced_lighting.cpp 中的核心逻辑
shader.setInt("blinn", blinn);
// 在片段着色器中根据 blinn 标志选择计算方法：
// if (blinn)
//     spec = pow(max(dot(normal, halfDir), 0.0), 32.0);
// else
//     spec = pow(max(dot(viewDir, reflectDir), 0.0), 8.0);
```


### Gamma 校正纹理加载


```
// gamma_correction.cpp 中的纹理加载函数
unsigned int loadTexture(char const *path, bool gammaCorrection) {
    // ...
    if (nrComponents == 3)
        internalFormat = gammaCorrection ? GL_SRGB : GL_RGB;
    else if (nrComponents == 4)
        internalFormat = gammaCorrection ? GL_SRGB_ALPHA : GL_RGBA;
    // ...
    glTexImage2D(GL_TEXTURE_2D, 0, internalFormat, ...);
}
```
 ============================================================

## 8. 练习与实验


1. **Phong vs Blinn-Phong 对比**：运行 `advanced_lighting` 程序，按 B 键切换两种模式。从不同角度观察地板上的高光区域，注意 Phong 模式下高光突然消失的位置。
2. **Gamma 校正对比**：运行 `gamma_correction` 程序，按 Space 键切换。观察 4 个不同亮度光源下地板的颜色变化。特别注意暗部区域的可见度。
3. **修改光泽度**：尝试修改 Blinn-Phong 的 shininess 值（如 4, 16, 64, 128），对比与 Phong 模式下等效外观的 shininess 关系。
4. **思考题**：为什么在游戏引擎中，"线性颜色空间"已成为默认配置？如果不开启，可能出现哪些视觉异常？
 ============================================================ 