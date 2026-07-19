---
title: OpenGL 术语表
description: OpenGL OpenGL 术语表
tags: [opengl, 图形学, 参考]
date: 2025-01-01
---

# OpenGL 术语表


- **OpenGL**：开放图形库。跨平台的 3D 图形 API，定义 CPU 与 GPU 通信的标准接口。
- **Core Profile**：现代 OpenGL 模式（3.2+），只暴露可编程管线，废弃了旧的固定管线。
- **渲染管线 (Pipeline)**：顶点数据变成最终图像所经过的流水线：顶点着色器 → 光栅化 → 片段着色器 → 输出。
- **顶点着色器 (Vertex Shader)**：对每个顶点执行一次的可编程着色器，通常用于坐标变换。
- **片段着色器 (Fragment Shader)**：对每个像素（片段）执行一次的可编程着色器，决定最终颜色。
- **GLSL**：OpenGL 着色语言。编写顶点/片段着色器的类 C 语言。
- **VAO (Vertex Array Object)**：顶点数组对象。封装了顶点数据的格式和布局设置。
- **VBO (Vertex Buffer Object)**：顶点缓冲对象。GPU 中存储顶点数据（位置、颜色等）的内存。
- **EBO (Element Buffer Object)**：索引缓冲对象。通过索引复用顶点，减少重复数据。
- **GLFW**：窗口管理库。创建 OpenGL 上下文、处理输入事件。
- **GLAD**：OpenGL 函数加载器。因为 OpenGL 是驱动层面的，需要它来获取函数指针。
- **GLM**：OpenGL Mathematics。3D 数学库，提供向量、矩阵运算。
- **双缓冲 (Double Buffering)**：使用前缓冲（显示）和后缓冲（绘制），绘制完成后交换，避免闪烁。
- **状态机 (State Machine)**：OpenGL 是状态机模型 — 设置状态（如当前着色器、纹理），然后绘制。
- **WebGL**：Web Graphics Library。基于 OpenGL ES 的浏览器 3D API，是 WebXR 的底层图形接口。
- **WebXR**：Web 扩展现实。浏览器中的 AR/VR 标准 API，使用 WebGL 进行渲染。
