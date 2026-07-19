---
title: "第18课：混合与面剔除 | LearnOpenGL"
description: 本课涉及渲染管线中两个重要的环节：混合（Blending）控制透明物体的渲染方式，面剔除（Face Culling）通过跳过背面的片元来优化性能。两者在游戏引擎
tags: [opengl, 图形学]
date: 2025-01-01
---

LearnOpenGL 教学系列 — 第0018课


# 混合与面剔除 (Blending & Face Culling)

本课涉及渲染管线中两个重要的环节：**混合（Blending）**控制透明物体的渲染方式，**面剔除（Face Culling）**通过跳过背面的片元来优化性能。两者在游戏引擎的渲染管线中都是基础而关键的配置。

## 第一部分：混合 (Blending)

## 1. Alpha 测试 vs Alpha 混合

要渲染透明物体，有两种基本策略：


|  | Alpha 测试 (Discard) | Alpha 混合 (Blending) |
| --- | --- | --- |
| 原理 | 在片元着色器中用 discard 丢弃透明度低于阈值的片元 | 将当前片元颜色与颜色缓冲中的颜色进行混合计算 |
| 透明效果 | 要么完全透明，要么完全不透明（锯齿硬边） | 支持渐变透明度（平滑过渡） |
| 绘制顺序 | 无关 | 必须从远到近绘制 |
| 性能 | 较快（直接丢弃片元） | 较慢（需要读取和写入颜色缓冲） |
| 典型用途 | 草、树叶、铁丝网 | 玻璃窗、水面、烟雾 |


## 2. 使用 discard 关键字：草叶效果

源文件 `blending_discard.cpp` 演示了如何用 `discard` 实现草叶效果。其核心思路是使用一张包含透明通道的纹理（如 PNG），在片元着色器中检查 alpha 值：


```cpp
// 片元着色器中的 discard 用法
#version 330 core
in vec2 TexCoords;
out vec4 FragColor;

uniform sampler2D texture1;

void main() {
    vec4 texColor = texture(texture1, TexCoords);
    if (texColor.a < 0.1)  // 如果 alpha 值低于阈值
        discard;           // 丢弃该片元
    FragColor = texColor;
}

```


这种方法适合草、树叶等不需要真正半透明的物体。注意纹理的 Wrap 模式需要设置为 `GL_CLAMP_TO_EDGE`，否则纹理边缘的半透明像素会因为 `GL_REPEAT` 的插值产生错误边框。


```
// RGBA 纹理需要设置 CLAMP_TO_EDGE 防止透明边缘伪影
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S,
    format == GL_RGBA ? GL_CLAMP_TO_EDGE : GL_REPEAT);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T,
    format == GL_RGBA ? GL_CLAMP_TO_EDGE : GL_REPEAT);

```

> [!INFO]
> **引擎连接：Unity 的 Cutout 渲染模式**
>
> Unity 标准着色器的 `Rendering Mode` 有四种：`Opaque`、`Cutout`、`Transparent`、`Fade`。其中 `Cutout` 模式就对应 OpenGL 的 `discard` 方式——片元要么完全可见，要么被丢弃。它在材质面板中有一个 `Alpha Cutoff` 滑动条（默认 0.5），对应代码中的 alpha 阈值。这是渲染草、树木、铁栅栏等大量细节物体的标准方式，因为在移动端 `discard` 比真正的混合更高效。


## 3. 混合方程

当需要真正的半透明效果（如玻璃窗）时，需要开启混合：


```
glEnable(GL_BLEND);
glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

```


对应的混合方程为：


```
C_result = C_source * S_factor + C_destination * D_factor

// 对于 glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA)：
C_result = C_source * alpha + C_destination * (1 - alpha)

```


其中：


- `C_source` = 当前片元的颜色（源颜色）
- `C_destination` = 颜色缓冲中的颜色（目标颜色）
- `alpha` = 源片元的 Alpha 值
- `S_factor` = 源因子（`GL_SRC_ALPHA`）
- `D_factor` = 目标因子（`GL_ONE_MINUS_SRC_ALPHA`）


其他常用的混合模式：


| 混合函数 | 效果 | Unity 对应 |
| --- | --- | --- |
| GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA | 标准透明混合 | Transparent |
| GL_ONE, GL_ONE | 叠加混合（变亮） | Additive |
| GL_DST_COLOR, GL_ZERO | 乘法混合（变暗） | Multiply |
| GL_SRC_ALPHA, GL_ONE | 预乘 Alpha 混合 | Premultiplied Alpha |


## 4. 透明物体的绘制顺序问题

这是混合渲染中最关键也最容易忽视的问题。由于深度测试的存在，混合透明物体时必须**从远到近**绘制，否则会出现错误的结果。

源文件 `blending_sorted.cpp` 演示了正确的做法：


```cpp
// 在渲染循环中，先计算所有透明物体到摄像机的距离
std::map<float, glm::vec3> sorted;
for (unsigned int i = 0; i < windows.size(); i++) {
    float distance = glm::length(camera.Position - windows[i]);
    sorted[distance] = windows[i];  // map 自动按 key 升序排列
}

// 然后从远到近绘制（reverse iterator）
// 先绘制不透明物体...
DrawOpaqueObjects();

// 最后从远到近绘制透明物体
for (std::map<float, glm::vec3>::reverse_iterator it = sorted.rbegin();
     it != sorted.rend(); ++it) {
    model = glm::translate(glm::mat4(1.0f), it->second);
    shader.setMat4("model", model);
    glDrawArrays(GL_TRIANGLES, 0, 6);
}

```


**为什么需要从远到近？**

考虑两个重叠的半透明玻璃窗：


1. 如果先绘制近处的窗户（写入深度缓冲），再绘制远处的窗户——远处的片元会因为深度测试失败而被丢弃，近处的半透明窗户后面本该看到的远处窗户就消失了
2. 如果先绘制远处的窗户，再绘制近处的窗户——近处的半透明玻璃正确地混合到已经存在的远处窗户颜色上

> [!WARNING]
> **性能提示：透明物体排序的代价**
>
> 每帧对所有透明物体按距离排序是有性能开销的。在 Unity 中，`Transparent` 渲染队列（Queue=3000）的物体会自动被引擎按距离排序后提交绘制。UE 也有类似机制。在大型场景中，成千上万的透明物体全部排序可能会成为瓶颈，因此引擎通常使用 OIT（Order-Independent Transparency，顺序无关透明度）技术，如加权混合（WBOIT）或链表（Linked List）方案。


## 第二部分：面剔除 (Face Culling)

## 5. 面剔除原理

在三维场景中，物体的背面永远不可见（对于封闭的实体模型）。这意味着你可以安全地跳过背面的片元处理，节省大约一半的渲染开销。


```
glEnable(GL_CULL_FACE);       // 启用面剔除
glCullFace(GL_BACK);          // 剔除背面
glFrontFace(GL_CCW);          // 逆时针方向为正面（默认）

```


### 环绕顺序与正面判定

OpenGL 通过三角形顶点在屏幕空间的环绕顺序（Winding Order）来决定正面/背面：


- **逆时针 (CCW，Counter ClockWise)** = 正面（默认）
- **顺时针 (CW，ClockWise)** = 背面


从源文件 `face_culling_exercise1.cpp` 中可以看到立方体顶点数据按逆时针排列——确保外部面是正面：


```
// 每个面的三角形顺时针排列会被判定为背面
// 如果要反转（顺时针为正面）：
glFrontFace(GL_CW);

```


### glCullFace 的可选模式


| 模式 | 效果 |
| --- | --- |
| GL_BACK | 剔除背面（最常用） |
| GL_FRONT | 剔除正面 |
| GL_FRONT_AND_BACK | 全部剔除（仅用于特殊的 Debug） |


## 6. 面剔除的应用场景


- **实体模型渲染**：默认启用，节省性能
- **半透明物体**：有时需要禁用面剔除来看到玻璃的另一侧内部
- **双面渲染**：同时渲染正面和背面（如草、纸片）
- **阴影体**：在模板阴影中利用正面/背面的不同处理
- **Inside-Out 渲染**：禁用面剔除或反转剔除方向来渲染物体内部（Skybox、环境映射）

> [!INFO]
> **引擎连接：Unity 的 Cull 设置**
>
> Unity ShaderLab 中的 `Cull` 命令直接对应 OpenGL 的面剔除：
>
>
> ```
> // Unity ShaderLab 语法
> Cull Back     // 等同于 glEnable(GL_CULL_FACE); glCullFace(GL_BACK)
> Cull Front    // 等同于 glCullFace(GL_FRONT)
> Cull Off      // 等同于 glDisable(GL_CULL_FACE)
>
> ```
>
>
> 在 Unity 中，`Transparent` 物体默认 `Cull Back`，但许多半透明材质（如玻璃）需要设置为 `Cull Off` 才能从两侧看到内部。UE 材质编辑器中也有 `Two Sided` 选项，开启后禁用面剔除。


## 7. 完整的渲染流程总结

经过本课的学习，渲染管线中的逐片元操作阶段可以总结为：


1. **片元着色器**：计算片元颜色
2. **Scissor Test**：裁剪矩形区域（可选）
3. **Stencil Test**：模板测试（可选，需启用）
4. **Depth Test**：深度测试（可选，需启用）
5. **Blending**：混合（可选，需启用）
6. **颜色缓冲写入**


在实际的游戏引擎中，渲染管线的组织通常按照**渲染队列**分层：


| Unity 队列 | 索引 | 内容 | OpenGL 状态 |
| --- | --- | --- | --- |
| Background | 1000 | 天空盒、背景 | Depth 开, Blend 关, Cull 开 |
| Geometry (默认) | 2000 | 不透明物体 | Depth 开, Blend 关, Cull 开 |
| AlphaTest | 2450 | Cutout 物体（草、树叶） | Depth 开, discard, Cull 开 |
| Transparent | 3000 | 半透明物体（玻璃、水） | Depth 开(只读), Blend 开, Cull 可选 |
| Overlay | 4000 | UI、镜头光晕 | Depth 关, Blend 开, Cull 关 |


## 8. 练习


> [!INFO]
> **练习一：实现透明窗户**
> 1. 基于 `blending_sorted.cpp`，将草地纹理替换为窗户纹理
> 2. 确保纹理是 RGBA 格式（带有 alpha 通道的 PNG）
> 3. 观察不排序和排序后的渲染差异
> 4. 尝试使用不同的混合函数（叠加、乘法）实现不同的视觉效果

> [!INFO]
> **练习二：草地图案**
> 1. 基于 `blending_discard.cpp`，在平面上生成更多草地片，形成图案
> 2. 在场景中布置草地时，让每片草地的朝向随机旋转
> 3. 启用面剔除，观察草地是否从某些角度消失——理解为什么草可能需要双面渲染
> 4. 进阶：尝试在同一个场景中同时使用 `discard`（草）和混合（窗户），注意绘制顺序
