---
title: 第0002课：创建窗口 | LearnOpenGL
description: LearnOpenGL 系列 · 零基础图形编程
tags: [opengl, 图形学]
date: 2025-01-01
---

 ============================== NAV ==============================  ============================== HEADER ==============================

# 第0002课：创建窗口

LearnOpenGL 系列 · 零基础图形编程

欢迎来到第一行代码。在第0001课中，我们宏观了解了渲染管线的全貌：顶点数据进入 GPU，经过一系列可编程阶段，最终变成屏幕上的像素。这一课，我们将亲手搭建一个可以运行 OpenGL 的窗口环境。

 ============================== 1 ==============================

## 1. 渲染窗口——图形应用的起点

任何图形应用都需要一个"画板"——一个可以绘制内容的窗口。在 Unity 里这个窗口叫 **Game 视图**，在 Godot 里叫 **Game Viewport**。而我们直接操作 OpenGL 时，需要自己创建这个窗口。

但是 OpenGL 本身**只负责渲染**，它不提供任何窗口管理、事件处理或上下文创建的功能。这就好比你拿到了一套顶级的画笔和颜料，但没有画布。我们需要一个额外的工具来帮我们搞定"画布"和"画架"的问题。

这个工具就是 **GLFW**。

 ============================== 2 ==============================

## 2. GLFW 是什么

**GLFW**（Graphics Library Framework）是一个轻量级的 C 语言库，专门为 OpenGL 应用提供三样东西：


1. **窗口创建**——在操作系统上创建一个可渲染的窗口
2. **OpenGL 上下文**——让 OpenGL 知道"画到哪个窗口上"
3. **输入处理**——键盘、鼠标、游戏手柄的事件获取


在源文件 `hello_window.cpp` 中，前几行代码就是在做这件事：


```
glfwInit();      // 1. 初始化 GLFW 库
glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);  // 2. 告诉 GLFW 我们要 OpenGL 3.3
glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE); // 核心模式
```


`glfwWindowHint` 是用来配置 GLFW 行为的一系列"提示"。这里我们指定了 OpenGL 版本为 3.3，并且使用**核心模式（Core Profile）**。

接下来真正创建窗口：


```
GLFWwindow* window = glfwCreateWindow(800, 600, "LearnOpenGL", NULL, NULL);
if (window == NULL) {
    // 创建失败的处理
    glfwTerminate();
    return -1;
}
glfwMakeContextCurrent(window);  // 将窗口的 OpenGL 上下文设置为当前线程的上下文
```


`glfwCreateWindow` 返回一个 `GLFWwindow*` 指针——这个指针代表了我们创建的窗口对象。如果返回 `NULL`，说明创建失败，通常是因为显卡不支持 OpenGL 3.3。


> [!INFO]
> **引擎连接：窗口对象**
>   Unity 中的 `GameView` 和 Editor 窗口、Godot 的 `MainLoop`，底层都是操作系统原生窗口的封装。GLFW 让你直接接触到这个层级。你在 Unity 中看到的 Game 窗口，本质上也是一个 OS 窗口 + OpenGL/DirectX 上下文。


### 2.1 glfwMakeContextCurrent 的含义

你的应用程序可能同时存在多个窗口（想想 Unity 的 Scene 视图和 Game 视图）。OpenGL 是一个**全局状态机**，它怎么知道当前操作的是哪个窗口？答案就在这一行代码。

`glfwMakeContextCurrent(window)` 告诉操作系统："从此以后，所有 OpenGL 命令都作用于这个窗口。" 这相当于把 OpenGL 这个"状态机"的**当前上下文**绑定到了这个窗口上。

 ============================== 3 ==============================

## 3. GLAD——连接 OpenGL 的桥梁

创建完窗口后，我们还有一行非常重要的初始化代码：


```
if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress))
{
    std::cout << "Failed to initialize GLAD" << std::endl;
    return -1;
}
```


为什么需要 GLAD？要理解这一点，需要先了解 OpenGL 的运作方式。

### 3.1 OpenGL 是驱动层面的 API

OpenGL 本质上不是一个链接库（.lib / .dll / .so），而是一个**规范**。真正实现这个规范的是你的**显卡驱动程序**。当你调用 `glClearColor()` 这样的函数时，调用最终是由显卡驱动转发到 GPU 硬件的。

问题在于：**不同的显卡厂商（NVIDIA、AMD、Intel）实现 OpenGL 函数的方式不同，函数指针的地址在运行时才能确定。** 你不能像调用普通 C++ 函数那样直接 #include 一个头文件就完事——编译器不知道去哪里找这些函数的实现。

GLAD 解决的就是这个问题。它在运行时查询驱动提供的函数地址，然后将这些地址赋值给对应的函数指针。简单来说：


- **GLFW** 提供了 `glfwGetProcAddress` —— 一个能查询 OpenGL 函数地址的工具
- **GLAD** 使用这个工具，把所有的 `gl*` 函数"接"到你的程序里


所以初始化的顺序是：**先 glfwInit → 创建窗口 → 设置上下文 → 再 gladLoadGLLoader**。如果顺序颠倒，GLAD 无法获取到有效的函数地址。


> [!WARNING]
> **常见错误**
>   如果你在初始化 GLAD 之前就调用任何 `gl*` 函数（比如 `glViewport`），程序几乎一定会崩溃。这是因为那些函数指针还是空的。这个错误在初学者中非常普遍。
 ============================== 4 ==============================

## 4. 视口设置与窗口尺寸变化

接下来看这段代码：


```
glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);
```


它注册了一个**回调函数**。当用户拖动窗口边缘改变窗口大小时，GLFW 会自动调用这个函数：


```
void framebuffer_size_callback(GLFWwindow* window, int width, int height)
{
    glViewport(0, 0, width, height);
}
```


`glViewport` 告诉 OpenGL 渲染区域的大小和位置。这里参数的意思是：从窗口左下角 (0, 0) 开始，宽为 `width`，高为 `height` 的矩形区域是本次渲染的目标。

如果你没有注册这个回调，当窗口放大时，渲染图像会保持原来尺寸，周围出现空白或拉伸变形——在 Unity 中这就是 **Game 视图的 Aspect Ratio Fitter** 背后在做的事情。

 ============================== 5 ==============================

## 5. 渲染循环——游戏的"心脏"

这是图形编程最重要的概念之一。来看核心代码：


```
while (!glfwWindowShouldClose(window))
{
    // 输入处理
    processInput(window);

    // 渲染指令
    glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT);

    // 交换缓冲 + 处理事件
    glfwSwapBuffers(window);
    glfwPollEvents();
}
```


这个 `while` 循环就是所谓的**渲染循环（Render Loop）**——或者说**游戏循环（Game Loop）**。它是实时图形应用的驱动力。每一次循环迭代就是一**帧（Frame）**。

### 5.1 逐行拆解


1. **`glfwWindowShouldClose(window)`** —— 检查窗口是否收到了关闭信号（比如用户点了 × 按钮）。返回 true 时循环结束，程序退出。
2. **`processInput(window)`** —— 自定义的输入处理函数。在 `hello_window.cpp` 中它的实现很简单：


```
void processInput(GLFWwindow *window)
{
    if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
        glfwSetWindowShouldClose(window, true);
}
```


如果用户按下了 ESC 键，就告诉 GLFW "请关闭窗口"。在真实的游戏引擎中，这里会检查所有按键（WASD 移动、空格跳跃等），然后驱动物体运动逻辑。
3. **`glClearColor(0.2f, 0.3f, 0.3f, 1.0f)`** —— 设置"清屏颜色"。四个参数分别是红、绿、蓝、透明度，取值范围 0.0 ~ 1.0。这里设置的是深蓝绿色。
4. **`glClear(GL_COLOR_BUFFER_BIT)`** —— 用上面设置的颜色清空颜色缓冲。GL_COLOR_BUFFER_BIT 告诉 OpenGL "请清空颜色数据"。如果不调用 glClear，上一帧的画面会残留在屏幕上。
5. **`glfwSwapBuffers(window)`** —— 交换前后缓冲（详见第6节）。
6. **`glfwPollEvents()`** —— 让 GLFW 处理操作系统事件（鼠标移动、按键按下、窗口缩放等）并触发对应的回调函数。如果忘记调用这个函数，窗口会**卡死无响应**。
 ============================== 6 ==============================

## 6. 双缓冲（Double Buffering）

为什么需要 `glfwSwapBuffers`？为什么不是直接画到屏幕上？

想象一下，如果你直接在屏幕上绘制，每一帧的绘制过程对用户是可见的。你会看到画面从上到下被逐行刷新，出现**撕裂（tearing）**或**闪烁（flickering）**。这在实时渲染中是不可接受的。

解决方案是**双缓冲**：


- **前缓冲（Front Buffer）** —— 当前屏幕上显示的画面
- **后缓冲（Back Buffer）** —— 正在后台绘制的新画面


每一帧的流程：


1. 在你的渲染指令（glClear、glDrawArrays 等）执行期间，GPU 写入**后缓冲**
2. `glfwSwapBuffers` 执行时，前后缓冲瞬间交换
3. 后缓冲变为新的前缓冲，显示在屏幕上；原来的前缓冲变为后缓冲，供下一帧绘制


这个交换发生在**垂直消隐区间（VBlank）**——也就是显示器两次刷新之间的间隔时刻。这样就保证了画面完整、不撕裂。


> [!INFO]
> **引擎连接：Unity 的渲染循环**
>   Unity 的每一帧也是这样工作的：`Update() → 渲染场景 → EndFrame() → SwapBuffers`
>   你在 `Update()` 中写的代码对应 `processInput` 和逻辑更新；Unity 内部的渲染管线对应 `glClear` 和 `glDrawElements`；而 `SwapBuffers` 在 Unity 底层默默执行。这就是为什么你可以在 Unity 的 Frame Debugger 中看到每一帧的绘制调用——那些最终都会变成 OpenGL API 调用。
 ============================== 7 ==============================

## 7. OpenGL 上下文——状态机的本质

在本课中，我们已经多次遇到"上下文"这个词。现在来做一个完整的解释。

**OpenGL 本质上是一个巨大的状态机（State Machine）。** 它内部维护了非常多的状态变量：


- 当前着色器是什么？
- 当前绑定的 VAO 是哪个？
- 清屏颜色是什么？
- 视口大小是多少？
- 深度测试是否开启？
- 当前绘制的颜色是什么？


**OpenGL 上下文**就是所有这些状态的集合。当你调用 `glMakeContextCurrent(window)`，你实际上是说："请把 OpenGL 这个状态机切换到这个窗口的上下文中。"

这也是为什么在渲染循环中，每次 `glClearColor` 调用之后 OpenGL 会"记住"清除颜色——不需要每次 glClear 的时候重新指定颜色。直到下次调用 glClearColor 改变它为止。


> [!WARNING]
> **多线程注意事项**
>   OpenGL 上下文在任一时刻只能被一个线程拥有。如果你想在多线程中渲染，需要手动管理上下文的归属。很多引擎（包括 Unity 的渲染线程）会创建额外的共享上下文来处理这个问题。
 ============================== 8. Hello Window Clear ==============================

## 8. 完整示例：hello_window_clear

现在来看 `hello_window_clear.cpp`。它和 `hello_window.cpp` 的唯一区别是渲染循环中多了两行：


```
glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
glClear(GL_COLOR_BUFFER_BIT);
```


这就是我们之前解释过的清屏操作。执行这段程序后，你会看到一个深蓝绿色的窗口——颜色来自 `glClearColor` 的参数。

`hello_window.cpp` 没有这两行，所以理论上它也会清屏（驱动会做默认处理），但显式调用 `glClear` 是一个好的编程习惯。在实际项目中，每一帧开始都要清空上一帧的内容。

完整的两层关系如下图：


```
┌─────────────────────────────────────────────────────────────────┐
│                       你的应用（main 函数）                      │
│                                                                 │
│  glfwInit()          ← 初始化 GLFW                              │
│  glfwCreateWindow()  ← 创建窗口                                 │
│  glfwMakeContextCurrent() ← 设置 OpenGL 上下文                  │
│  gladLoadGLLoader()  ← 加载 OpenGL 函数指针                     │
│                                                                 │
│  ┌─ 渲染循环（每秒60次）────────────────────────────────────────┐│
│  │  processInput()     ← 处理用户输入（ESC 退出）              ││
│  │  glClearColor()     ← 设置清屏颜色                          ││
│  │  glClear()          ← 清除上一帧内容                        ││
│  │  glfwSwapBuffers()  ← 交换双缓冲，显示本帧画面              ││
│  │  glfwPollEvents()   ← 处理操作系统事件                      ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                 │
│  glfwTerminate()      ← 销毁窗口，释放资源                      │
└─────────────────────────────────────────────────────────────────┘
```
 ============================== 9 ==============================

## 9. 核心模式 vs 立即模式

前面我们提到了 `GLFW_OPENGL_CORE_PROFILE`（核心模式）。与之相对的是**立即模式（Immediate Mode）**，也就是 OpenGL 的旧版 API（也称"固定管线"）。


| 特性 | 立即模式（旧） | 核心模式（现代） |
| --- | --- | --- |
| 渲染方式 | glBegin() / glEnd() 逐顶点提交 | VBO + VAO 批量提交 |
| 编程方式 | 固定管线，不能编程 | 可编程着色器（Shader） |
| 性能 | 每帧 CPU 反复上传数据，慢 | 数据预存 GPU 显存，快 |
| 学习难度 | 简单但过时 | 稍复杂但符合业界标准 |


现代游戏引擎全部使用核心模式。从第0003课开始，我们会深入核心模式的核心概念：VAO、VBO、着色器。

 ============================== 10 ==============================

## 10. 动手练习


1. **修改背景颜色**

在 `hello_window_clear.cpp` 中修改 `glClearColor` 的参数，试试不同的颜色组合。比如 `(1.0f, 0.0f, 0.0f, 1.0f)` 是红色，`(0.0f, 0.0f, 0.0f, 1.0f)` 是黑色。试着调出你喜欢的颜色。
2. **修改窗口标题**

修改 `glfwCreateWindow` 的第三个参数，把 `"LearnOpenGL"` 改成你自己的标题，比如 `"我的第一个OpenGL窗口"`。
3. **窗口大小变化时保持画面比例**

在 `framebuffer_size_callback` 中尝试将视口设置为窗口的中间部分（比如留出 50 像素的边距），观察效果。
4. **观察 glfwPollEvents 缺失的效果**

（选做）注释掉 `glfwPollEvents()` 这一行，运行程序，拖动窗口看看会发生什么。
 ============================== 11 ==============================

## 11. 本课总结


- **GLFW** 负责窗口创建、上下文管理和输入处理
- **GLAD** 负责在运行时加载 OpenGL 驱动提供的函数指针
- **OpenGL 上下文**是状态机，所有 OpenGL 操作都依赖于当前的上下文
- **渲染循环**是每帧重复执行的流程：输入 → 更新 → 渲染 → 交换缓冲
- **双缓冲**解决画面撕裂问题：在后缓冲绘制，完成后交换到前缓冲显示
- **核心模式**是现代 OpenGL 的标准，要求使用 VAO/VBO 和着色器
- Unity 的 Game 窗口渲染循环底层就是同样的模式
 ============================== 12 ==============================

## 推荐阅读


- [GLFW 官方文档](https://www.glfw.org/documentation.md)
- [GLAD 项目仓库](https://github.com/Dav1dde/glad)
- [LearnOpenGL: Creating a window](https://learnopengl.com/Getting-started/Creating-a-window)
- [LearnOpenGL: Hello Window](https://learnopengl.com/Getting-started/Hello-Window)
- [Unity 脚本执行顺序（理解引擎的帧循环）](https://docs.unity3d.com/Manual/ExecutionOrder.md)
 ============================== NAV ============================== 