---
title: 全课程地图 — LearnOpenGL 系统学习
description: OpenGL 全课程地图 — LearnOpenGL 系统学习
tags: [opengl, 图形学, 参考]
date: 2025-01-01
---

# LearnOpenGL 全课程地图


*共 30 课，分 7 个阶段，从零到掌握现代图形渲染管线。*

> [!INFO]
> **🗺️ 使用说明**
>
> 每课对应一个 HTML 文件 (`lessons/NNNN-name.html`)。建议顺序学习，每课完成后在 [Mission](../MISSION.md) 中标记进度。每课末尾有实操练习和对应项目源码路径。
 ============================================================  PHASE 0  ============================================================
## 第 0 阶段：准备工作


1 课 · 打好基础

- 0001你好，OpenGL！ — 渲染管线、项目结构、与游戏引擎的关系
- —环境搭建指南 — VS Code + CMake + 编译器安装参考文档
 ============================================================  PHASE 1  ============================================================
## 第 1 阶段：入门基础


8 课 · 核心概念：窗口 → 三角形 → 着色器 → 纹理 → 变换 → 3D → 摄像机

- 0002创建窗口 — GLFW 初始化、OpenGL 上下文、渲染循环1.1.hello_window + 1.2.hello_window_clear
- 0003第一个三角形 — VAO、VBO、顶点属性、绘制命令2.1-2.5.hello_triangle*
- 0004着色器 — GLSL、uniform、属性插值、shader 类封装3.1-3.6.shaders*
- 0005纹理 — 纹理坐标、纹理单元、纹理过滤与环绕、Mipmap4.1-4.6.textures*
- 0006变换 — GLM 数学库、平移/旋转/缩放、矩阵组合5.1-5.2.transformations*
- 0007坐标系统 — 局部→世界→观察→裁剪→屏幕空间6.1-6.4.coordinate_systems*
- 0008摄像机 — 视角矩阵、欧拉角、鼠标/键盘交互、摄像机类7.1-7.6.camera*
- 0009入门篇实战 — 搭建可交互的 3D 场景复习

> [!INFO]
> **🔗 引擎连接：**学完本阶段后，你就能理解 Unity/Unreal 场景编辑器里的 Transform 组件、Camera 控制的底层原理了。
 ============================================================  PHASE 2  ============================================================
## 第 2 阶段：光照


6 课 · 让场景从黑白变成真实世界

- 0010颜色与基础光照 — Phong 光照模型（环境+漫反射+高光）2.lighting/1.colors + 2.1-2.2.basic_lighting
- 0011材质 — 定义物体的光照响应属性2.lighting/3.1-3.2.materials*
- 0012光照贴图 — 漫反射贴图、高光贴图、放射光贴图2.lighting/4.1-4.4.lighting_maps*
- 0013光源类型 — 平行光、点光源、聚光灯、衰减2.lighting/5.1-5.4.light_casters*
- 0014多光源 — 组合多种光源、GLSL 结构体数组2.lighting/6.multiple_lights*
- 0015光照篇实战 — 实现完整的照明场景复习→ Unity HDRP 光照原理

> [!INFO]
> **🔗 引擎连接：**光照阶段学完，你就知道 Unity 的 Directional/Point/Spot Light、Unreal 的 Light 组件的底层数学计算了。Unity 的 Standard Shader = 光照贴图 + PBR。
 ============================================================  PHASE 3  ============================================================
## 第 3 阶段：模型加载与高级 OpenGL


7 课 · 从手绘三角形到复杂模型、从基础到高级渲染技术

- 0016模型加载 — Assimp 库、Mesh 类、Model 类3.model_loading/1.model_loading→ UE/Unity FBX 导入原理
- 0017深度测试与模板测试 — 深度缓冲、模板缓冲、物体轮廓4.advanced_opengl/1.1-1.2.depth + 2.stencil
- 0018混合与面剔除 — 透明物体、绘制顺序、背面剔除4.advanced_opengl/3.1-3.2.blending + 4.face_culling
- 0019帧缓冲 — 离屏渲染、后处理、镜面效果4.advanced_opengl/5.1-5.2.framebuffers→ Unity Post-Processing Stack
- 0020立方体贴图 — 天空盒、环境映射、反射/折射4.advanced_opengl/6.1-6.2.cubemaps*
- 0021几何着色器与实例化 — 几何体生成、大量物体高效渲染4.advanced_opengl/8-9-10.*
- 0022抗锯齿 — MSAA、离屏 MSAA4.advanced_opengl/11.1-11.2.anti_aliasing*
 ============================================================  PHASE 4  ============================================================
## 第 4 阶段：高级光照


7 课 · 阴影、法线贴图、HDR、Bloom、延迟着色

- 0023Blinn-Phong 与 Gamma 校正 — 更真实的光照、颜色空间5.advanced_lighting/1 + 2→ Unity 线性颜色空间
- 0024阴影映射 — 阴影深度贴图、PCF 软阴影、CSM5.advanced_lighting/3.1-3.3.shadow_mapping* + csm→ UE 级联阴影
- 0025法线贴图与视差贴图 — 让平面拥有立体感5.advanced_lighting/4 + 5.1-5.3→ Unity 法线贴图原理
- 0026HDR 与 Bloom — 高动态范围、泛光特效5.advanced_lighting/6 + 7→ UE Eye Adaptation
- 0027延迟着色 — 高效多光源渲染、前向 vs 延迟对比5.advanced_lighting/8.1-8.2.deferred*→ Unity Deferred 渲染路径
- 0028SSAO — 屏幕空间环境光遮蔽5.advanced_lighting/9.ssao
 ============================================================  PHASE 5  ============================================================
## 第 5 阶段：PBR（基于物理的渲染）


2 课 · 现代游戏/引擎的标准渲染模型

- 0029PBR 光照 — 微平面模型、Cook-Torrance BRDF6.pbr/1.1-1.2.lighting*→ UE 金属度/粗糙度工作流
- 0030IBL（基于图像的光照）— 辐照度图、预滤波环境贴图、BRDF LUT6.pbr/2.1-2.2.ibl*→ Unity Reflection Probe

> [!INFO]
> **🔗 引擎连接：**PBR 就是 Unity Standard Shader、Unreal 默认 Lit Shader 的底层数学。学完你就能看懂引擎材质面板里的每一个参数。
 ============================================================  PHASE 6  ============================================================
## 第 6 阶段：实战


2 课 · 综合应用

- 0031调试与文字渲染 — OpenGL 调试工具、FreeType 文字渲染7.in_practice/1.debugging + 2.text_rendering
- 0032Breakout 游戏 — 完整 2D 游戏引擎实战7.in_practice/3.2d_game→ 小型游戏引擎架构
 ============================================================  SUMMARY  ============================================================

## 学习路线总览


| 阶段 | 课数 | 核心收获 | 引擎对应 |
| --- | --- | --- | --- |
| 第 0 阶段 准备 | 1 | 理解 OpenGL 是什么、项目结构、渲染管线概念 | 理解引擎渲染层的架构位置 |
| 第 1 阶段 入门基础 | 8 | 能搭建 3D 场景、控制摄像机、加载纹理 | Transform / Camera 组件原理 |
| 第 2 阶段 光照 | 6 | 实现 Phong 光照、多种光源、材质系统 | Light 组件、Standard Shader |
| 第 3 阶段 模型+高级 | 7 | 加载 3D 模型、后处理、帧缓冲、高级特性 | FBX 导入、Post-Processing |
| 第 4 阶段 高级光照 | 6 | 阴影、法线贴图、HDR/Bloom、延迟着色 | 级联阴影、HDRP、Deferred 路径 |
| 第 5 阶段 PBR | 2 | 理解 PBR 数学、IBL 环境光照 | Unity Standard / UE Lit Shader |
| 第 6 阶段 实战 | 2 | 调试技巧、小游戏引擎 | 游戏引擎架构实践 |
| 总计 | 32 课 | 完整的图形学基础 | 看懂引擎渲染底层 |
