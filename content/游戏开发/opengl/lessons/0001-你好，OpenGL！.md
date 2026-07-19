---
title: "第01课：你好，OpenGL！— 图形世界的入口"
description: 在你眼前打开一扇通往 3D 图形世界的窗口。
tags: [opengl, 图形学]
date: 2025-01-01
---

# 你好，OpenGL！— 图形世界的入口


*在你眼前打开一扇通往 3D 图形世界的窗口。*


## 这堂课在 mission 中的位置

你的最终目标是开发 **WebXR 应用**（浏览器中的 AR/VR）。WebXR 底层使用 **WebGL**（≈ OpenGL ES 的浏览器版本）。这个项目的代码是基于 [LearnOpenGL — Joey de Vries](https://learnopengl.com) 的教程库，覆盖了从窗口创建到 PBR（基于物理的渲染）的完整知识体系。学完它就是打好了图形学的全部基础。


> **🎯 连接 WebXR** OpenGL 学习的每一个概念 — 渲染管线、着色器、变换矩阵、光照 — 都 1:1 映射到 WebGL。你现在学的每一课，都是在为 WebXR 打地基。


## OpenGL 是什么？

**OpenGL**（Open Graphics Library）是一个跨平台的 3D 图形 API。简单来说，它是你**让 GPU（显卡）干活**的接口。

想象你在拍电影：


- 你（CPU）是导演，告诉演员该做什么
- GPU 是整个摄影和特效团队
- OpenGL 就是你和摄影团队之间的**对讲机** — 用标准化的指令告诉 GPU 渲染什么


OpenGL 是现代图形学的事实标准，它影响了 WebGL（浏览器 3D）、Vulkan（新一代高性能 API）、甚至游戏主机图形 API 的设计。学习 OpenGL 的核心概念，迁移到任何其他图形 API 都只需要学语法差异。


> [!TIP]
> **💡 核心 Profile（Core Profile）vs 固定管线**
>
> 本项目使用 OpenGL 3.3+ Core Profile — 意味着我们只写*可编程管线*（用着色器），不学老式的固定管线。你现在学的就是行业仍在使用的现代方法。


## 项目概览

让我们看看这个仓库的结构。它是你的主战场：


```
LearnOpenGL/
├── CMakeLists.txt      # 构建系统配置
├── includes/           # 第三方库头文件
│   ├── GLAD/           # OpenGL 函数加载器
│   ├── GLFW/           # 窗口管理库
│   ├── GLM/            # 3D 数学库
│   └── learnopengl/    # 课程工具类（shader、camera 等）
├── src/                # 课程代码（核心！）
│   ├── 1.getting_started/    # 入门 - 基础渲染
│   ├── 2.lighting/           # 光照 - 让场景变真实
│   ├── 3.model_loading/      # 模型加载
│   ├── 4.advanced_opengl/    # 高级 OpenGL 技术
│   ├── 5.advanced_lighting/  # 高级光照
│   ├── 6.pbr/                # 基于物理的渲染
│   └── 7.in_practice/        # 实战（调试、文字渲染、2D游戏）
├── resources/          # 纹理、模型、字体等资源
├── lib/                # 预编译的库文件（Windows）
└── dlls/               # 运行时 DLL
```


每个课程文件夹按章节组织。比如 `1.getting_started` 下：


```
1.getting_started/
├── 1.1.hello_window/           # 创建第一个窗口
├── 2.1.hello_triangle/         # 绘制第一个三角形
├── 3.3.shaders_class/          # 使用着色器类
├── 4.1.textures/               # 纹理贴图
├── 5.1.transformations/        # 变换（平移/旋转/缩放）
├── 6.1.coordinate_systems/     # 坐标系
└── 7.4.camera_class/           # 3D 摄像控制
```


## 渲染管线 — 最重要的思维模型

在学习任何代码之前，你需要理解 OpenGL 如何工作。这叫**图形渲染管线**（Graphics Pipeline）：


```
  顶点数据         顶点着色器       几何着色器        光栅化
  [位置、颜色]  →  [处理每个顶点] →  [可选]        →  [转成像素]
                                                         ↓
  屏幕输出        ←  片段着色器    ←   裁剪/深度测试
  [最终图像]      ←  [决定每个像素] ←   [丢弃隐藏部分]
```


这是一个**流水线** — 数据从一端进入，经过每个阶段处理，最终从另一端输出图像。你可以把它想象成工厂流水线：


1. **顶点数据**：你定义 3D 物体的形状（三角形的位置）
2. **顶点着色器**：对每个顶点执行一次（比如变换位置）— *你可以编程*
3. **光栅化**：把三角形转成屏幕上的像素点
4. **片段着色器**：对每个像素执行一次（决定颜色）— *你可以编程*
5. **测试与混合**：深度测试（远处的物体被近处的遮挡）、混合（透明效果）
6. **输出**：最终图像显示在窗口

> [!TIP]
> **🔑 关键理解**
>
> GPU 是**极度并行**的。每个顶点/每个像素独立处理。顶点着色器可能同时运行数百万次！这是为什么 GPU 比 CPU 更适合图形渲染。


## 走读代码：hello_window

这是项目中最简单的例子 — 仅仅创建一个窗口。让我们一行行理解它：


```cpp
#include <glad/glad.h>       // OpenGL 函数加载器
#include <GLFW/glfw3.h>     // 窗口和输入管理
#include <iostream>

const unsigned int SCR_WIDTH = 800;
const unsigned int SCR_HEIGHT = 600;
```


**GLFW** 用来创建窗口和处理输入（键盘、鼠标）。**GLAD** 用来加载 OpenGL 的函数指针（因为 OpenGL 是显卡驱动的一部分，C++ 不能直接链接到它）。


```
int main() {
    // 1. 初始化 GLFW
    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

    // 2. 创建窗口
    GLFWwindow* window = glfwCreateWindow(800, 600,
        "LearnOpenGL", NULL, NULL);
    glfwMakeContextCurrent(window);

    // 3. 初始化 GLAD
    gladLoadGLLoader((GLADloadproc)glfwGetProcAddress);

    // 4. 渲染循环
    while (!glfwWindowShouldClose(window)) {
        processInput(window);     // 处理键盘输入
        glfwSwapBuffers(window);  // 交换缓冲区（双缓冲）
        glfwPollEvents();         // 处理事件
    }

    glfwTerminate();
    return 0;
}
```


这个循环是**所有**图形应用的核心模式：


| 步骤 | 代码 | 说明 |
| --- | --- | --- |
| 初始化 | glfwInit() | 启动窗口系统 |
| 创建窗口 | glfwCreateWindow() | 创建 + 设置 OpenGL 上下文 |
| 加载 OpenGL | gladLoadGLLoader() | 获取 GPU 的 OpenGL 功能 |
| 渲染循环 | while(...) | 每帧重复：输入→渲染→交换 |
| 清理 | glfwTerminate() | 释放资源 |

> [!TIP]
> **🔑 双缓冲**
>
> 为什么用 `glfwSwapBuffers`？因为我们在**幕后缓冲区**绘制，画完后**交换**到屏幕。这避免了用户看到画面逐像素绘制的闪烁过程。所有现代图形应用都使用双缓冲。


## OpenGL 状态机模型

OpenGL 本质上是一个**巨大的状态机**。你设置状态（比如"当前使用的着色器"、"当前绑定的纹理"），然后调用绘制命令，GPU 根据当前状态执行渲染。

理解状态机很重要，因为：


- 忘记设置某个状态 → 画面不对
- 设置错了状态 → 后续所有绘制都受影响
- 这是常见的 bug 来源

```
// OpenGL 状态机示例
glUseProgram(shader);      // 设置当前着色器状态
glBindTexture(GL_TEXTURE_2D, tex);  // 设置当前纹理状态
glDrawArrays(GL_TRIANGLES, 0, 3);  // 使用当前状态绘制
```


## 与 WebXR 的关联

现在你可能在想："我学的是桌面 OpenGL，这和浏览器里的 WebXR 有什么关系？" 答案：**直接相关**。


| OpenGL 概念 | WebGL / WebXR 对应 |
| --- | --- |
| GLSL 着色器 | 几乎相同的 GLSL ES 语法 |
| VAO / VBO | WebGL 的 VAO/VBO 完全相同 |
| 矩阵变换 (GLM) | gl-matrix.js / Three.js 矩阵 |
| 渲染管线 | 完全相同的管线模型 |
| 纹理 | WebGL 纹理 API 几乎相同 |
| 帧缓冲（后处理） | WebGL framebuffer 相同概念 |

> **💡 学习策略**
> 学习 OpenGL 时，每学一个新概念，想一想它在 WebXR 中怎么用。比如光照 → 在 AR 中如何让虚拟物体看起来真实地放在真实场景里。


## 动手练习


1. **浏览项目**：打开 `LearnOpenGL/src/1.getting_started/` 目录，看看有哪些章节
2. **读代码**：打开 `hello_window_clear.cpp`（1.2），看它比 hello_window 多了什么（提示：`glClearColor` 和 `glClear`）
3. **思考**：渲染循环为什么使用 `while` 而不是 `for`？如果换成 `for` 会怎样？

> [!TIP]
> **📚 推荐阅读**
>
> 阅读 [LearnOpenGL 第一章：OpenGL](https://learnopengl.com/Getting-started/OpenGL) 获取更详细的背景知识。这是本课的配套教材。


## 下一课预告

下一课我们将**搭建开发环境**——安装 CMake 和编译器，编译和运行这个项目，亲眼看到那个窗口！

