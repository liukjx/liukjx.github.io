---
title: 第 7 课：坐标系统 (Coordinate Systems) — 3D 世界的摄像机
description: 上一课我们用变换矩阵让物体旋转起来，但画面仍然是"扁平的"——看起来像是 2D 纸片在旋转。这一课，我们将真正进入 3D 世界：学习如何将 3D 场景通过一系列
tags: [opengl, 图形学, 坐标系统, 摄像机]
date: 2025-01-01
---

# 坐标系统 (Coordinate Systems) — 3D 世界的摄像机

上一课我们用变换矩阵让物体旋转起来，但画面仍然是"扁平的"——看起来像是 2D 纸片在旋转。这一课，我们将真正进入 3D 世界：学习如何将 3D 场景通过一系列坐标变换，最终投射到你的 2D 屏幕上。这就是游戏引擎中"摄像机"和"投影"的底层原理。

## 5 个坐标空间的完整管线

一个 3D 物体从建模到显示在屏幕上，要经历 **5 个坐标空间** 的变换：


```
局部空间(Local) → 世界空间(World) → 观察空间(View) → 裁剪空间(Clip) → 屏幕空间(Screen)
```


每一步都由一个对应的矩阵完成变换：


```
顶点 → [Model矩阵] → [View矩阵] → [Projection矩阵] → [视口变换] → 屏幕像素
       局部→世界      世界→观察       观察→裁剪        裁剪→屏幕
```


在顶点着色器中，我们通常将这 3 个矩阵相乘为一个 **MVP 矩阵**，然后一次性应用到顶点上：


```glsl
gl_Position = projection * view * model * vec4(aPos, 1.0);
```


这和上一课不同——上一课我们只乘了一个 `transform` 矩阵，而这里我们分解成了三个独立矩阵。为什么要分开？因为这样更灵活：


- **model** 每个物体都不同（位置/旋转/缩放）
- **view** 整个场景共享一个（摄像机的姿态）
- **projection** 整个场景共享一个（摄像机的镜头参数）

> [!INFO]
> **核心观念：三个矩阵，三种职责**
>
> Model 矩阵回答："物体在哪里？"  View 矩阵回答："摄像机在哪里？"  Projection 矩阵回答："镜头是什么参数？" 三者独立，正是游戏引擎中 Transform 组件、Camera 组件、Projection 设置三个独立功能的体现。


## Model 矩阵：局部 → 世界

Model 矩阵的作用是把物体从它的 **局部空间**（建模时的坐标系，比如一个立方体以中心为原点）变换到 **世界空间**（整个场景的坐标系）。

它本质上就是上一课学的 TRS 组合矩阵：


```cpp
glm::mat4 model = glm::mat4(1.0f);
model = glm::translate(model, cubePositions[i]);           // 移到世界中的某处
model = glm::rotate(model, glm::radians(angle), glm::vec3(1.0f, 0.3f, 0.5f));  // 旋转
```


每个物体都有自己独立的 model 矩阵。在 `coordinate_systems_multiple.cpp` 中，我们在循环中为每个立方体计算不同的 model 矩阵：


```cpp
for (unsigned int i = 0; i < 10; i++)
{
    glm::mat4 model = glm::mat4(1.0f);
    model = glm::translate(model, cubePositions[i]);
    float angle = 20.0f * i;
    model = glm::rotate(model, glm::radians(angle), glm::vec3(1.0f, 0.3f, 0.5f));
    ourShader.setMat4("model", model);

    glDrawArrays(GL_TRIANGLES, 0, 36);
}
```


10 个立方体，共享同一份顶点数据，只是模型矩阵不同，就出现在了世界上不同的位置。

## View 矩阵：世界 → 观察（摄像机）

View 矩阵相当于 **摄像机**——它定义了观察者从什么位置、朝什么方向看。

一个直观的理解：如果你把摄像机往后移，等价于把整个世界往前移。OpenGL 中 View 矩阵就是这么实现的——**对世界做反向变换**：


```cpp
glm::mat4 view = glm::mat4(1.0f);
// 把摄像机向后移 3 个单位 = 把世界向前移 3 个单位
view = glm::translate(view, glm::vec3(0.0f, 0.0f, -3.0f));
```


这意味着：


- 世界中的物体不动
- 但整个场景沿着 Z 轴负方向平移了 3 个单位
- 效果上等同于摄像机在 Z 轴正方向 3 个单位处观察

> [!INFO]
> **直观理解**
>
> 想象你在拍电影：你（摄像机）往后退一步，效果相当于整个场景向前移动一步。View 矩阵就是这个"场景移动"的数学表达。在下一课的 Camera 类中，我们会用更直观的方式控制 View 矩阵（用位置和朝向角度），但本质都是这个反向变换。


## Projection 矩阵：观察 → 裁剪

Projection 矩阵是最让人迷惑但也最酷的一个。它定义了两件事：


1. **视景体 (View Frustum)**：摄像机能看到的空间范围
2. **投影方式**：透视（近大远小）还是正交（没有透视效果）


### 正交投影 (Orthographic Projection)


```cpp
glm::ortho(0.0f, 800.0f, 0.0f, 600.0f, 0.1f, 100.0f);
```


正交投影创建一个**长方体**视景体。在这个范围内的物体都会被映射到屏幕上，**没有近大远小**的效果。相同大小的物体不管远近，在屏幕上占据相同像素。适合 2D 游戏、UI、工程制图。

### 透视投影 (Perspective Projection)


```cpp
projection = glm::perspective(
    glm::radians(45.0f),          // FOV (Field of View)，视野角度
    (float)SCR_WIDTH / SCR_HEIGHT, // 宽高比 (Aspect Ratio)
    0.1f,                          // 近平面 (near plane)
    100.0f                         // 远平面 (far plane)
);
```


透视投影创建一个**平截头体 (Frustum)**——一个被切掉尖端的金字塔。这模拟了人眼和真实摄像机的效果：


- **FOV**：视野角度，45-60 度是标准视角，越大越像"鱼眼"
- **Aspect Ratio**：宽高比，保证画面不被拉伸
- **Near / Far**：远近裁剪面。在此范围外的物体被裁剪掉（不渲染）


## 透视除法：w 分量的魔法

这里有一个关键问题：投影矩阵是如何实现"近大远小"的？

秘密在于 **w 分量**。当 Projection 矩阵乘以顶点位置后，输出的 w 分量不再等于 1，而是等于一个**与顶点深度 (z) 成正比的数值**。然后 OpenGL 自动执行 **透视除法 (Perspective Division)**：


```glsl
// OpenGL 自动执行的透视除法
gl_Position.xyz = gl_Position.xyz / gl_Position.w;
gl_Position.w = 1.0;
```


想象两个物体：一个离摄像机近（深度 z = -2），一个离得远（深度 z = -9）。经过投影矩阵运算后：


- 近处物体的 w 值较小，除以 w 后坐标放大 → 占据更多屏幕空间
- 远处物体的 w 值较大，除以 w 后坐标缩小 → 占据更少屏幕空间


**这就产生了"近大远小"的透视效果**。w 分量就像一个"深度缩放因子"。透视除法由 GPU 自动完成，在顶点着色器之后、光栅化之前执行。


> [!INFO]
> **裁剪空间的标准化设备坐标 (NDC)**
>
> 经过透视除法后，所有顶点都被变换到 **标准化设备坐标 (Normalized Device Coordinates, NDC)**，范围在 -1 到 1 之间。x、y、z 都在 [-1, 1] 范围内的顶点才会被渲染。然后 OpenGL 通过**视口变换 (Viewport Transform)** 将 NDC 映射到屏幕像素坐标。


## 深度缓冲 (Depth Buffer / Z-buffer)

当你渲染多个 3D 物体时，一个不可避免的问题是：**远处的物体应该被近处的物体遮挡**。如果没有深度测试，远处的物体会画在近处物体之上（因为在绘制顺序上后绘制的会覆盖先绘制的）。

OpenGL 使用 **深度缓冲 (Depth Buffer)** 来解决这个问题：


- 每个像素对应一个深度值（z 值），存储在深度缓冲中
- 当要绘制一个像素时，比较它的深度值和深度缓冲中已有的值
- 如果新的像素更近（深度值更小），覆盖并更新深度缓冲
- 如果新的像素更远，丢弃它


启用深度测试只需要两行代码：


```
// 初始化时开启深度测试
glEnable(GL_DEPTH_TEST);

// 每帧清空深度缓冲（和颜色缓冲一起）
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
```


如果不开启 `GL_DEPTH_TEST`，OpenGL 会按照绘制顺序直接覆盖像素，造成遮挡关系错误。这是初学者最常见的 3D 渲染 bug 之一。


> [!WARNING]
> **常见的 bug：忘记清除深度缓冲**
>
> 如果你开启了深度测试但忘记了 `glClear(GL_DEPTH_BUFFER_BIT)`，深度缓冲会保留上一帧的值。这会导致新一帧中本该显示的像素因为"比上一帧的某个物体远"而被丢弃，产生闪烁或错误的遮挡。


## MVP 矩阵组合

在顶点着色器中，三个矩阵按固定顺序相乘：


```glsl
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec2 aTexCoord;

out vec2 TexCoord;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    gl_Position = projection * view * model * vec4(aPos, 1.0);
    TexCoord = vec2(aTexCoord.x, aTexCoord.y);
}
```


注意乘法顺序：**从右到左** 应用：

**gl_Position = projection × view × model × vertex**


1. 顶点先乘以 model 矩阵：从局部空间到世界空间
2. 再乘以 view 矩阵：从世界空间到观察空间
3. 再乘以 projection 矩阵：从观察空间到裁剪空间
4. GPU 自动进行透视除法：从裁剪空间到 NDC
5. GPU 自动进行视口变换：从 NDC 到屏幕坐标


## 走读代码：三个版本的坐标系统示例

### 6.1 — 基础版本：单个 3D 立方体

这是最简单的 3D 示例。在 `coordinate_systems.cpp` 中：


```cpp
// 构建 model、view、projection 三个矩阵
glm::mat4 model = glm::mat4(1.0f);
glm::mat4 view = glm::mat4(1.0f);
glm::mat4 projection = glm::mat4(1.0f);

model = glm::rotate(model, glm::radians(-55.0f), glm::vec3(1.0f, 0.0f, 0.0f));
view = glm::translate(view, glm::vec3(0.0f, 0.0f, -3.0f));
projection = glm::perspective(glm::radians(45.0f), (float)SCR_WIDTH / (float)SCR_HEIGHT, 0.1f, 100.0f);

// 三个不同的方式传递矩阵（展示三种等价写法）
glUniformMatrix4fv(modelLoc, 1, GL_FALSE, glm::value_ptr(model));
glUniformMatrix4fv(viewLoc, 1, GL_FALSE, &view[0][0]);
ourShader.setMat4("projection", projection);
```


这里同时展示了三种传递矩阵给 uniform 的方法（本质相同）：


- 使用 GLM 的 `glm::value_ptr()` 辅助函数
- 直接取矩阵首元素地址 `&view[0][0]`
- 使用 Shader 类的封装方法 `setMat4()`


### 6.2 — 深度测试版本

`coordinate_systems_depth.cpp` 与上一个的唯一区别是：


1. 添加了 `glEnable(GL_DEPTH_TEST)` 启用深度测试
2. 清空缓冲时增加了 `GL_DEPTH_BUFFER_BIT`
3. 模型旋转变为随时间变化：`model = glm::rotate(model, (float)glfwGetTime(), ...)`
4. 使用了 **36 个顶点的独立三角形** 数据（每个面 2 个三角形 × 3 个顶点 × 6 个面），而不是索引绘制


运行结果：一个在 3D 空间中旋转的立体方块，有正确的远近遮挡关系。

### 6.3 — 多立方体版本

`coordinate_systems_multiple.cpp` 是最完整的示例。定义了一个包含 **10 个不同位置** 的立方体数组：


```cpp
glm::vec3 cubePositions[] = {
    glm::vec3( 0.0f,  0.0f,  0.0f),
    glm::vec3( 2.0f,  5.0f, -15.0f),
    glm::vec3(-1.5f, -2.2f, -2.5f),
    glm::vec3(-3.8f, -2.0f, -12.3f),
    glm::vec3( 2.4f, -0.4f, -3.5f),
    glm::vec3(-1.7f,  3.0f, -7.5f),
    glm::vec3( 1.3f, -2.0f, -2.5f),
    glm::vec3( 1.5f,  2.0f, -2.5f),
    glm::vec3( 1.5f,  0.2f, -1.5f),
    glm::vec3(-1.3f,  1.0f, -1.5f)
};
```


在渲染循环中，为每个立方体计算不同的 model 矩阵：


```cpp
for (unsigned int i = 0; i < 10; i++)
{
    glm::mat4 model = glm::mat4(1.0f);
    model = glm::translate(model, cubePositions[i]);
    float angle = 20.0f * i;
    model = glm::rotate(model, glm::radians(angle), glm::vec3(1.0f, 0.3f, 0.5f));
    ourShader.setMat4("model", model);
    glDrawArrays(GL_TRIANGLES, 0, 36);
}
```


这段代码展示了 **Instancing 的基础思想**：同一份顶点数据，通过不同的模型矩阵，在场景中渲染出多个独立的物体。每个立方体在世界中的位置、旋转角度都不同，共同构成一个 3D 场景。

## 引擎连接

### Unity 中的 MVPs

现在你可以理解 Unity 渲染背后的数学了：


| Unity 概念 | OpenGL 对应 | 说明 |
| --- | --- | --- |
| GameObject.Transform | Model 矩阵 | Inspector 中的 Position/Rotation/Scale → TRS 组合矩阵 |
| Camera 组件 (位置/旋转) | View 矩阵 | 右键 Scene 视图旋转视角，就是改变 View 矩阵 |
| Camera 投影设置 | Projection 矩阵 | Perspective 透视 / Orthographic 正交 |
| Camera 的 Field of View | glm::perspective(fov, ...) | FOV 参数直接映射 |
| Camera 的 Clipping Planes | Near/Far 平面 | 设置最近/最远渲染距离 |
| Scene 视图切换 2D/3D | 正交/透视投影切换 | 2D 模式用 ortho，3D 模式用 perspective |
| 深度写入 / ZTest | GL_DEPTH_TEST | Unity Shader 中的 ZWrite / ZTest 开关 |


### Project 矩阵在引擎中的实际应用

在 Unity 中选择 Camera 组件，你会看到：


- **Projection**：Perspective 或 Orthographic 下拉菜单
- **Field of View (FOV)**：视野角度，对应 `glm::perspective` 的第一个参数
- **Clipping Planes (Near/Far)**：对应 `glm::perspective` 的最后两个参数


在 UE (Unreal Engine) 中也是一样：**Camera 组件 → Projection Mode**（透视/正交），**Field of View**，**Near/Far Clip Plane**。


> [!INFO]
> **深入理解：为什么近平面不能设为 0？**
>
> `glm::perspective` 的 near 参数不能为 0。因为这会导致投影矩阵中的除法分母为零，使得深度值失去意义。通常设为 0.01 ~ 0.1 即可。太小的 near 值会导致深度精度问题（z-fighting）——远处物体的 z 值区分度不够，产生闪烁。


## 完整的 3D 场景构建流程

让我们梳理一下，从创建窗口到显示 3D 场景，每一步的代码：


```cpp
// === 1. 初始化 ===
glfwInit();
GLFWwindow* window = glfwCreateWindow(800, 600, "3D Scene", NULL, NULL);
gladLoadGLLoader((GLADloadproc)glfwGetProcAddress);
glEnable(GL_DEPTH_TEST);   // ★ 启用深度测试

// === 2. 准备顶点数据（一个立方体，36个顶点）===
// ... (省略 VAO / VBO 设置)

// === 3. 渲染循环 ===
while (!glfwWindowShouldClose(window))
{
    // 清空颜色和深度缓冲
    glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    // 绑定纹理
    glBindTexture(GL_TEXTURE_2D, texture);

    // --- 设置 MVP 矩阵 ---
    // Model：物体位置和姿态（每个物体不同）
    glm::mat4 model = glm::mat4(1.0f);
    model = glm::translate(model, glm::vec3(0.0f, 0.0f, 0.0f));
    model = glm::rotate(model, (float)glfwGetTime(), glm::vec3(0.5f, 1.0f, 0.0f));

    // View：摄像机（整个场景共享）
    glm::mat4 view = glm::mat4(1.0f);
    view = glm::translate(view, glm::vec3(0.0f, 0.0f, -3.0f));

    // Projection："镜头"（整个场景共享）
    glm::mat4 projection = glm::perspective(
        glm::radians(45.0f),
        800.0f / 600.0f,
        0.1f, 100.0f
    );

    // 传递矩阵给着色器
    ourShader.setMat4("model", model);
    ourShader.setMat4("view", view);
    ourShader.setMat4("projection", projection);

    // 绘制
    glDrawArrays(GL_TRIANGLES, 0, 36);

    glfwSwapBuffers(window);
    glfwPollEvents();
}
```


## 动手练习


1. **多物体布局**：修改 `coordinate_systems_multiple.cpp` 中的 `cubePositions` 数组，让你的 10 个立方体排列成一个圆圈。
2. **透视 vs 正交**：将透视投影 `glm::perspective` 替换为正交投影 `glm::ortho`，观察场景视觉上的差异。为什么 3D 游戏用透视而 2D 游戏用正交？
3. **调整 FOV**：改变 `glm::perspective` 的第一个参数（FOV），从 10 度到 120 度变化，观察视野的变化。
4. **关闭深度测试**：注释掉 `glEnable(GL_DEPTH_TEST)` 和 `GL_DEPTH_BUFFER_BIT`，观察渲染结果——你会发现遮挡关系错乱了。
5. **旋转中心**：让所有立方体围绕场景中心旋转（提示：修改 View 矩阵，让摄像机绕着 Y 轴旋转：`glm::rotate(viewMat, time, glm::vec3(0,1,0))` 先于平移）。
6. **思考题**：在 Unity 中创建一个脚本，每帧打印 Camera 的 projectionMatrix 和 worldToCameraMatrix，看看它们的数值是什么？和本课学的 model/view/projection 矩阵对应得上吗？

> [!INFO]
> **推荐阅读**
> - [LearnOpenGL: Coordinate Systems](https://learnopengl.com/Getting-started/Coordinate-Systems) — 本课的官方配套教程
> - [Song Ho: OpenGL Projection Matrix](https://www.songho.ca/opengl/gl_projectionmatrix.md) — 投影矩阵的详细数学推导
> - [Wikipedia: Z-buffering](https://en.wikipedia.org/wiki/Z-buffering) — 深度缓冲的算法细节
> - [LearnOpenGL: Camera](https://learnopengl.com/Getting-started/Camera) — 下一课的预告，更灵活的摄像机控制


## 下一课预告

你现在已经可以在 3D 空间中渲染物体了，但摄像机的控制还很笨拙——每次都要手动设置 View 矩阵的位置和朝向。下一课我们将学习 **Camera 类**，用鼠标和键盘自由地控制摄像机，像玩游戏一样在 3D 场景中漫游。

