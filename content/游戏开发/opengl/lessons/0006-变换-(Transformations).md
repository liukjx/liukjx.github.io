---
title: 第 6 课：变换 (Transformations) — 让物体动起来
description: 在上一课中我们学会了给三角形穿上纹理"外衣"。但有一个问题：物体只能呆在原地。我们绘制一个正方形，它就在窗口正中央，动不了。这一课，我们将学习如何用矩阵来移动、
tags: [opengl, 图形学, 变换]
date: 2025-01-01
---

# 变换 (Transformations) — 让物体动起来

在上一课中我们学会了给三角形穿上纹理"外衣"。但有一个问题：**物体只能呆在原地**。我们绘制一个正方形，它就在窗口正中央，动不了。这一课，我们将学习如何用矩阵来移动、旋转和缩放物体——这正是游戏引擎中每个 GameObject 能够自由变换位置的核心原理。

## 为什么需要变换矩阵？

回想一下我们之前定义的顶点数据：


```
float vertices[] = {
    // positions          // texture coords
     0.5f,  0.5f, 0.0f,   1.0f, 1.0f, // top right
     0.5f, -0.5f, 0.0f,   1.0f, 0.0f, // bottom right
    -0.5f, -0.5f, 0.0f,   0.0f, 0.0f, // bottom left
    -0.5f,  0.5f, 0.0f,   0.0f, 1.0f  // top left
};
```


这些顶点在 **局部空间 (Local Space)** 中定义，范围在 -0.5 ~ 0.5 之间。如果我们想让这个正方形出现在屏幕上不同位置，或者让它旋转、变大变小，该怎么办？

**方案一（错误的）：** 修改每个顶点的坐标。比如你想向右移动 0.5，就把每个顶点的 x 加上 0.5。但如果你想让它持续旋转呢？那需要在 CPU 上每帧重新计算所有顶点，效率极低。

**方案二（正确的）：** 使用变换矩阵。将顶点数据保持不动，用一个 **4x4 矩阵** 乘以每个顶点，在 **顶点着色器** 中完成变换。GPU 就是为这种大规模并行矩阵运算而生的。


> [!INFO]
> **核心观念：数据 vs 变换**
>
> 永远记住：顶点数据是"原材料"，变换矩阵是"加工方法"。两者分开，你就能用同一份顶点数据、通过不同的矩阵组合，渲染出无数个不同位置、姿态、大小的物体。这正是游戏引擎中 Instance 渲染的核心思想。


## GLM 库介绍

要进行矩阵运算，我们需要一个数学库。OpenGL 本身不提供矩阵运算功能（它只负责把矩阵传给 GPU）。**GLM (OpenGL Mathematics)** 就是为此而生的 header-only 数学库。

GLM 的三大特点：


- **Header-only**：只需要 `#include`，不需要链接 .lib / .dll
- **语法与 GLSL 高度一致**：`vec3`、`mat4`、`radians()` 等与 GLSL 中的对应类型/函数几乎一样
- **专为 OpenGL 设计**：矩阵布局、坐标系约定与 OpenGL 完全匹配


在本项目中，GLM 位于 `includes/glm/` 目录下。常用包含：


```cpp
#include <glm/glm.hpp>               // 核心：vec3, mat4 等
#include <glm/gtc/matrix_transform.hpp>  // translate, rotate, scale, perspective
#include <glm/gtc/type_ptr.hpp>         // value_ptr（将 glm 矩阵转为 OpenGL 数组）
```


## 三种基本变换

### 单位矩阵

一切从单位矩阵开始。单位矩阵相当于"乘以任何向量都不变"的矩阵，就像数字 1 一样：


```cpp
glm::mat4 transform = glm::mat4(1.0f); // 初始化 4x4 单位矩阵
```


单位矩阵如下（对角线为 1，其余为 0）：


```
| 1  0  0  0 |
| 0  1  0  0 |
| 0  0  1  0 |
| 0  0  0  1 |
```


### 平移 (Translate)

让物体沿 x、y、z 方向移动。平移矩阵通过第 4 列控制位移：


```cpp
transform = glm::translate(transform, glm::vec3(0.5f, -0.5f, 0.0f));
```


相当于把物体向右 0.5 单位、向下 0.5 单位。

### 旋转 (Rotate)

让物体绕某个轴旋转：


```cpp
transform = glm::rotate(transform, (float)glfwGetTime(), glm::vec3(0.0f, 0.0f, 1.0f));
```


参数说明：


- 第二个参数：旋转角度（**弧度**）。`glfwGetTime()` 返回程序运行秒数，所以物体会持续旋转
- 第三个参数：旋转轴。这里 (0, 0, 1) 表示绕 Z 轴旋转（在 2D 屏幕上就是绕屏幕中心旋转）

> [!INFO]
> **弧度 vs 角度**
>
> GLM 的旋转函数接受弧度值。如果你习惯用角度，用 `glm::radians(degrees)` 转换。例如 `glm::radians(90.0f)` = π/2 弧度。


### 缩放 (Scale)

让物体沿各方向放大或缩小：


```cpp
transform = glm::scale(transform, glm::vec3(2.0f, 0.5f, 1.0f));
```


上述代码让物体在 x 方向放大 2 倍、y 方向压扁为 0.5 倍、z 方向不变。

## 组合变换的矩阵乘法顺序

这是本课**最重要的知识点**。当我们说"先缩放，再旋转，再平移"时，代码是这样写的：


```cpp
glm::mat4 transform = glm::mat4(1.0f);
transform = glm::translate(transform, glm::vec3(0.5f, -0.5f, 0.0f));
transform = glm::rotate(transform, (float)glfwGetTime(), glm::vec3(0.0f, 0.0f, 1.0f));
transform = glm::scale(transform, glm::vec3(1.0f, 1.0f, 1.0f));
```


代码看起来像是"先平移 → 再旋转 → 再缩放"，但数学上矩阵乘法是从右到左应用的：

**result = translate × rotate × scale × vertex**

这意味着顶点先被 **scale**，再被 **rotate**，最后被 **translate**。为什么这个顺序重要？


- **先缩放再旋转**：得到正确的旋转后的缩放（物体绕自身轴缩放）
- **先旋转再平移**：物体在自身旋转后的局部坐标系中平移
- **如果先平移再旋转**：物体会绕原点公转，而不是绕自身旋转！

> [!WARNING]
> **常见错误：变换顺序**
>
> 想象你在 Unity 中把一个 Cube 的 Position 设为 (2, 0, 0)，然后旋转 90 度。它是在 (2, 0, 0) 的位置绕自身旋转。这就是 SRT（Scale→Rotate→Translate）顺序的效果。如果你搞错了顺序，物体可能会围绕原点画圈圈，而不是绕自身旋转。


## 走读代码：transformations.cpp

让我们分析本课的核心源文件 `src/1.getting_started/5.1.transformations/transformations.cpp`。

### 顶点着色器：接收 uniform 矩阵

顶点着色器 `5.1.transform.vs`：


```glsl
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec2 aTexCoord;

out vec2 TexCoord;

uniform mat4 transform;

void main()
{
    gl_Position = transform * vec4(aPos, 1.0);
    TexCoord = vec2(aTexCoord.x, aTexCoord.y);
}
```


**关键点**：


- `uniform mat4 transform`：这个 uniform 变量会在 CPU 端每帧更新
- `gl_Position = transform * vec4(aPos, 1.0)`：将变换矩阵乘以顶点位置。注意我们需要把 vec3 扩展为 vec4（w 分量设为 1.0），才能和 4x4 矩阵相乘
- 我们 **没有** 在 CPU 上逐个修改顶点坐标——顶点数据本身是不变的，变换在 GPU 上完成


### CPU 端：构建矩阵并传递给着色器

核心代码段：


```cpp
// 1. 构建变换矩阵
glm::mat4 transform = glm::mat4(1.0f);
transform = glm::translate(transform, glm::vec3(0.5f, -0.5f, 0.0f));
transform = glm::rotate(transform, (float)glfwGetTime(), glm::vec3(0.0f, 0.0f, 1.0f));

// 2. 获取 uniform 位置
ourShader.use();
unsigned int transformLoc = glGetUniformLocation(ourShader.ID, "transform");

// 3. 将矩阵传给着色器
glUniformMatrix4fv(transformLoc, 1, GL_FALSE, glm::value_ptr(transform));

// 4. 绘制
glBindVertexArray(VAO);
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
```


`glUniformMatrix4fv` 参数详解：


| 参数 | 值 | 说明 |
| --- | --- | --- |
| location | transformLoc | uniform 变量的位置 |
| count | 1 | 矩阵数量（可以传递多个矩阵数组） |
| transpose | GL_FALSE | 是否转置。GLM 使用列主序，OpenGL 也期望列主序，所以不需要转置 |
| value | glm::value_ptr(transform) | 将 glm::mat4 转换为 float* |

> [!INFO]
> **为什么不在 CPU 上做完变换再传到 GPU？**
>
> 你*可以*这样做：在 CPU 上循环每个顶点，用矩阵乘一下，把结果存到新的 VBO 中，再绘制。但这样做：
>
>
> - CPU 串行计算，对于有大量顶点的模型极慢
> - 每帧都要重新上传顶点数据到 GPU，浪费带宽
> - 更好的做法：把矩阵作为 uniform 传入，让 GPU 在顶点着色器中并行计算
>
>
> GPU 有上千个核心，可以同时处理所有顶点的矩阵乘法。这正是 GPU 设计的初衷。


## 引擎连接：Unity Transform 组件

现在你已经知道了 TRS（Translate-Rotate-Scale）矩阵变换。打开 Unity，选中任何一个 GameObject，看看 Inspector 中的 **Transform** 组件：


```cpp
Transform
├── Position:  (x, y, z)    ← 对应 glm::translate
├── Rotation:  (x, y, z)    ← 对应 glm::rotate（欧拉角形式）
└── Scale:     (x, y, z)    ← 对应 glm::scale
```


Unity 的 Transform 组件本质上就是存储了三个操作参数，在底层组合成一个 TRS 矩阵（即 Model 矩阵）。当你修改 Inspector 中的任意数值时，Unity 就会重新计算这个矩阵，并在渲染时传递给着色器。

不仅如此：


- Transform 的层级关系（Parent-Child）就是矩阵的**级联乘法**：Child.worldMatrix = Parent.worldMatrix * Child.localMatrix
- 你在 Scene 视图中用 Gizmo 拖拽物体，底层就是在修改这三个参数
- Animator 组件驱动 Transform 的动画，其实就是每帧修改 Position/Rotation/Scale 的值

> [!INFO]
> **深入理解：为什么用四元数而不是欧拉角？**
>
> 你可能会注意到，OpenGL 的旋转用 `glm::rotate` 需要指定 **轴** 和 **角度**，而 Unity 的 Rotation 显示为 (x, y, z) 三个角度（欧拉角）。实际上 Unity 底层用 **四元数 (Quaternion)** 存储旋转，因为欧拉角存在 **万向锁 (Gimbal Lock)** 问题。Inspector 显示的欧拉角只是为了方便人理解。


## 本课完整代码示例

以下是 transformations.cpp 中渲染循环的核心逻辑：


```cpp
// 每帧执行：
while (!glfwWindowShouldClose(window))
{
    processInput(window);

    glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT);

    // 绑定纹理
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, texture1);
    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, texture2);

    // 构建变换矩阵
    glm::mat4 transform = glm::mat4(1.0f);
    transform = glm::translate(transform, glm::vec3(0.5f, -0.5f, 0.0f));
    transform = glm::rotate(transform, (float)glfwGetTime(), glm::vec3(0.0f, 0.0f, 1.0f));

    // 传给着色器并绘制
    ourShader.use();
    unsigned int transformLoc = glGetUniformLocation(ourShader.ID, "transform");
    glUniformMatrix4fv(transformLoc, 1, GL_FALSE, glm::value_ptr(transform));

    glBindVertexArray(VAO);
    glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);

    glfwSwapBuffers(window);
    glfwPollEvents();
}
```


运行效果：一个带有笑脸贴图的方块，从中心向右下方偏移，并持续旋转。

## 动手练习


1. **旋转动画**：修改代码，让方块绕 X 轴或 Y 轴旋转（而不是 Z 轴），观察旋转动画的变化。提示：修改 `glm::rotate` 的第三个参数。
2. **缩放效果**：在旋转之前加入缩放的变换，尝试先缩放后旋转 vs 先旋转后缩放，观察两者的视觉差异。
3. **绕一点旋转（公转）**：先平移再旋转，让方块围绕原点做公转——这与先旋转再平移（自转）有什么不同？
4. **多物体变换**：准备两个不同的变换矩阵，在同一个渲染循环中调用两次 `glDrawElements`，每次使用不同的 transform uniform，观察屏幕上出现两个独立运动的方块。
5. **思考题**：在 Unity 中，子物体的 Transform 是相对于父物体的。如果父物体旋转了 90 度，子物体在世界空间中的变化矩阵是什么？

> [!INFO]
> **推荐阅读**
> - [LearnOpenGL: Transformations](https://learnopengl.com/Getting-started/Transformations) — 本课的官方配套教程
> - [GLM 官方文档](https://glm.g-truc.net/) — GLM 数学库参考
> - [Wikipedia: Transformation Matrix](https://en.wikipedia.org/wiki/Transformation_matrix) — 变换矩阵的数学背景


## 下一课预告

你已经学会了如何对一个物体进行变换。但我们的世界是 3D 的——物体有远近之分，我们还需要一个"摄像机"来观察这个世界。下一课我们将学习 **坐标系统**，理解 MVP 矩阵如何将 3D 世界投影到 2D 屏幕上。

