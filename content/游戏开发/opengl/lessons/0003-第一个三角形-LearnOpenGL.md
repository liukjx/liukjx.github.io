---
title: "第03课：第一个三角形 | LearnOpenGL"
description: LearnOpenGL 系列 · 零基础图形编程
tags: [opengl, 图形学, 着色器]
date: 2025-01-01
---

 ============================== NAV ==============================  ============================== HEADER ==============================

# 第0003课：第一个三角形

LearnOpenGL 系列 · 零基础图形编程

第0002课中我们创建了一个可以运行 OpenGL 的窗口，并用 `glClearColor` 改变了窗口的背景色。但一个只显示纯色的窗口还算不上"图形"。这一课，我们将在屏幕上画出一个三角形——这是图形编程的"Hello World"。

我们将使用两个源文件：`hello_triangle.cpp`（基础三角形）和 `hello_triangle_indexed.cpp`（用索引缓冲画矩形）。

 ============================== 1 ==============================

## 1. 绘制三角形需要什么

回顾第0001课的渲染管线流程，要画出一个三角形，我们需要：


1. **顶点数据**——三角形的三个顶点的位置信息
2. **顶点着色器**——处理每个顶点的位置（把模型坐标转换到屏幕坐标）
3. **片段着色器**——决定每个像素的颜色
4. **将数据送入 GPU**——通过 OpenGL 的缓冲对象把顶点数据传输到显存
5. **发出绘制命令**——告诉 GPU "用这些数据画三角形"


本课的重点是第 1 步和第 4 步——理解顶点数据在 CPU 和 GPU 之间的传输机制。着色器将在下一课深入讨论。

 ============================== 2 ==============================

## 2. 核心模式与 VAO——必须遵守的规则

在第0002课中我们通过 `glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE)` 启用了 OpenGL 的**核心模式**。核心模式最显著的变化是：**你必须使用 VAO**。

在旧版的 OpenGL（立即模式）中，你可以这样画三角形：


```
// 旧版立即模式——已废弃
glBegin(GL_TRIANGLES);
glVertex3f(-0.5f, -0.5f, 0.0f);
glVertex3f( 0.5f, -0.5f, 0.0f);
glVertex3f( 0.0f,  0.5f, 0.0f);
glEnd();
```


这种方式每帧都把顶点数据从 CPU 传输到 GPU，效率极低。核心模式强制使用**顶点缓冲对象（VBO）**和**顶点数组对象（VAO）**来批量上传数据并缓存属性布局。


> [!WARNING]
> **核心模式的兼容性**
>   如果你在核心模式下忘记创建和绑定 VAO，OpenGL 会直接拒绝绘制——什么也不显示，且可能返回错误代码 `GL_INVALID_OPERATION`。这也是初学现代 OpenGL 最常见的卡壳点之一。
 ============================== 3 ==============================

## 3. 顶点输入——三角形的三个点

在 `hello_triangle.cpp` 中，我们首先定义了三个顶点：


```
float vertices[] = {
    -0.5f, -0.5f, 0.0f,  // 左下
     0.5f, -0.5f, 0.0f,  // 右下
     0.0f,  0.5f, 0.0f   // 顶部
};
```


每个顶点由三个 `float` 值组成：X、Y、Z 坐标。这里的坐标范围是 `[-1.0, 1.0]`，对应所谓的**标准化设备坐标（Normalized Device Coordinates, NDC）**。

NDC 是 OpenGL 渲染管线的中间坐标系：**X 轴向右为正，Y 轴向上为正**，范围都是 -1 到 1。任何超出这个范围的顶点会被**裁剪**掉，不会出现在屏幕上。


> [!INFO]
> **引擎连接：Unity 的坐标范围**
>   Unity 中，一个 Mesh 的顶点坐标是在**模型空间（Local Space）**中的任意值，通过 MVP 矩阵变换后才会进入 NDC。我们这里直接使用 NDC 是简化——实际引擎中顶点会经过复杂的坐标变换（模型→世界→视图→投影→NDC），后续课程会详细讲解。
 ============================== 4 ==============================

## 4. VBO——顶点缓冲对象

顶点数据目前在 CPU 内存中的一个数组里。要把它们送到 GPU 的显存中，我们需要创建一个 **VBO（Vertex Buffer Object，顶点缓冲对象）**。


```
unsigned int VBO;
glGenBuffers(1, &VBO);             // 1. 生成一个缓冲对象
glBindBuffer(GL_ARRAY_BUFFER, VBO); // 2. 绑定到 GL_ARRAY_BUFFER 目标
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW); // 3. 上传数据
```


逐行解释：


1. **`glGenBuffers(1, &VBO)`** —— 生成一个缓冲对象的名称（一个无符号整数 ID）。这相当于向 OpenGL "注册"了一个新的缓冲，得到一个句柄。
2. **`glBindBuffer(GL_ARRAY_BUFFER, VBO)`** —— 将新生成的缓冲绑定到 `GL_ARRAY_BUFFER` 目标。OpenGL 是状态机，这意味着"从此以后，所有针对 `GL_ARRAY_BUFFER` 的操作都是针对这个 VBO 的"。
3. **`glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW)`** —— 真正将顶点数据从 CPU 内存复制到 GPU 显存。


- 第一个参数：目标缓冲
- 第二个参数：数据大小（字节数）
- 第三个参数：CPU 内存中的源数据指针
- 第四个参数：使用模式——`GL_STATIC_DRAW` 表示数据不会或很少改变，适合静态物体


第四个参数告诉 GPU 如何优化存储：`GL_STATIC_DRAW`（数据几乎不变，存到性能最高的显存中）、`GL_DYNAMIC_DRAW`（数据会时常改变）、`GL_STREAM_DRAW`（数据每帧都变）。选择正确的模式可以显著影响性能。


> [!INFO]
> **引擎连接：静态 vs 动态几何体**
>   在 Unity 中，一个标记为 **Batching Static** 的物体的顶点数据会被标记为 `GL_STATIC_DRAW`，GPU 可以将其存储在最快的显存区域。而一个动态物体（比如飘动的旗帜，顶点每帧变形）则可能使用 `GL_DYNAMIC_DRAW` 或 `GL_STREAM_DRAW`，这解释了为什么 Unity 场景中静态物体和动态物体的渲染性能有显著差异。
 ============================== 5 ==============================

## 5. VAO——顶点数组对象

现在数据已经上传到 GPU 显存了。但 GPU 还需要知道一件关键的事情：**这些二进制数据如何解释？**

我们上传的 `vertices` 数组是 9 个 float 值排成一排（-0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.0, 0.5, 0.0）。GPU 怎么知道每 3 个 float 组成一个顶点？怎么知道前 3 个是位置信息？

这就是 **VAO（Vertex Array Object，顶点数组对象）** 的作用——它**记录了顶点属性的布局设置**。


```
unsigned int VAO;
glGenVertexArrays(1, &VAO);   // 生成 VAO
glBindVertexArray(VAO);       // 绑定 VAO（开始记录属性设置）

glBindBuffer(GL_ARRAY_BUFFER, VBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);

glBindBuffer(GL_ARRAY_BUFFER, 0);  // 解绑 VBO（属性设置已记录在 VAO 中）
glBindVertexArray(0);              // 解绑 VAO
```


这里关键的是 `glVertexAttribPointer`。我们详细拆解它的每个参数：


| 参数 | 值 | 含义 |
| --- | --- | --- |
| index | 0 | 顶点属性的位置索引。对应着色器中的 layout (location = 0)。 |
| size | 3 | 每个顶点属性由几个分量组成。这里是 3（X, Y, Z）。 |
| type | GL_FLOAT | 数据类型。每个分量是 32 位浮点数。 |
| normalized | GL_FALSE | 是否将整数数据归一化到 [0,1] 或 [-1,1]。float 类型不需要归一化。 |
| stride | 3 * sizeof(float) | 步长，即相邻两个顶点之间的字节间距。这里每个顶点只有位置数据，所以步长就是 3 个 float = 12 字节。 |
| pointer | (void*)0 | 这个属性在当前顶点数据中的起始偏移量。从缓冲开头算起，所以是 0。 |


理解步长（stride）是关键。假如每个顶点不仅有位置（3个float），还有颜色（3个float）和纹理坐标（2个float），一个顶点就是 `3 + 3 + 2 = 8` 个 float，步长就是 `8 * sizeof(float) = 32` 字节。颜色属性的起始偏移量则是 `3 * sizeof(float) = 12` 字节。


> [!INFO]
> **为什么需要 VAO？**
>   想象你有一个包含数千个顶点的复杂 3D 模型。每次绘制时都需要告诉 OpenGL "步长是 32 字节，位置在偏移 0，颜色在偏移 12，纹理坐标在偏移 24"——这些信息需要从 CPU 传递给 GPU。VAO 的作用就是**把这些布局设置打包记录下来**，绘制时只需 `glBindVertexArray(VAO)` 一键恢复所有设置，省去重复配置的开销。在现代 OpenGL 中，VAO 是**强制要求**的。
 ============================== 6 ==============================

## 6. EBO——索引缓冲对象

现在来看 `hello_triangle_indexed.cpp`。如果要画一个矩形，直观的想法是定义 4 个顶点：


```
float vertices[] = {
     0.5f,  0.5f, 0.0f,  // 右上
     0.5f, -0.5f, 0.0f,  // 右下
    -0.5f, -0.5f, 0.0f,  // 左下
    -0.5f,  0.5f, 0.0f   // 左上
};
```


但是 OpenGL 只画三角形，不画四边形。要画一个矩形，需要 **2 个三角形**：左上-左下-右上 和 左下-右下-右上。这就意味着 6 个顶点，其中 2 个是重复的。

重复顶点浪费显存——对于一个矩形还不明显，但对于一个包含数万甚至数百万顶点的复杂模型，顶点复用能节省大量显存。

**EBO（Element Buffer Object，索引缓冲对象）** 就是用来解决这个问题的：


```
unsigned int indices[] = {
    0, 1, 3,  // 第一个三角形：右上(0)、右下(1)、左上(3)
    1, 2, 3   // 第二个三角形：右下(1)、左下(2)、左上(3)
};
```


可以看到，两个三角形共用顶点 1（右下）和 3（左上）。4 个顶点 + 6 个索引，而不是 6 个独立的顶点。

EBO 的创建和使用方式与 VBO 类似：


```
unsigned int EBO;
glGenBuffers(1, &EBO);
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);
```


注意一个重要的细节：**EBO 必须在 VAO 绑定之后再绑定**。因为 VAO 会记录 EBO 的绑定状态——当 VAO 绑定时，绑定的 `GL_ELEMENT_ARRAY_BUFFER` 会被这个 VAO 记住。这也是为什么在 `hello_triangle_indexed.cpp` 中有一个显式注释："do NOT unbind the EBO while a VAO is active"。


> [!INFO]
> **引擎连接：Mesh 的组成**
>   在 Unity 中，一个 `Mesh` 由 `vertices`（顶点数组）+ `triangles`（索引数组）组成。当你将一个 FBX 模型导入 Unity 时，Unity 的导入器会解析模型文件，提取出顶点数据填入 VBO，提取出三角面索引数据填入 EBO。你在 Unity 中编写的 `MeshFilter` + `MeshRenderer`，底层对应的就是 VAO + VBO + EBO + 着色器的组合。
 ============================== 7 ==============================

## 7. 绘制命令：glDrawArrays vs glDrawElements

数据上传完毕，准备工作完成，最后一步是发出绘制命令。有两种方式：

### 7.1 glDrawArrays（无索引）


```
glUseProgram(shaderProgram);
glBindVertexArray(VAO);
glDrawArrays(GL_TRIANGLES, 0, 3);  // 从顶点 0 开始，画 3 个顶点
```

- **第一个参数**：图元类型。`GL_TRIANGLES` 表示每 3 个顶点组成一个独立三角形。
- **第二个参数**：起始顶点索引。
- **第三个参数**：绘制的顶点数量。


`glDrawArrays` 按顺序依次取顶点数据。如果要用它画矩形，需要传 6 个顶点（包含 2 个重复的），对应代码中的 `glDrawArrays(GL_TRIANGLES, 0, 6)`。

### 7.2 glDrawElements（有索引）


```
glUseProgram(shaderProgram);
glBindVertexArray(VAO);
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
```

- **第一个参数**：图元类型。
- **第二个参数**：索引的数量（注意不是顶点数量）。这里是 6 个索引。
- **第三个参数**：索引数据的类型。`GL_UNSIGNED_INT` 是 32 位无符号整数。
- **第四个参数**：索引数据的偏移量（如果 EBO 中有多个模型数据）。


`glDrawElements` 根据 EBO 中的索引来查找顶点。顶点只存储 4 个，但通过 6 个索引复用，绘制出 2 个三角形组成的矩形。


| 特性 | glDrawArrays | glDrawElements |
| --- | --- | --- |
| 顶点复用 | 不支持，重复顶点需重复存储 | 通过索引支持 |
| 内存占用 | 较大（有重复顶点） | 较小（索引复用） |
| 需要 EBO | 不需要 | 需要 |
| 适合场景 | 粒子系统、点精灵等 | 大部分 3D 模型 |
 ============================== 8 ==============================

## 8. 数据流全貌

让我们用一张 ASCII 图来展示整个数据流：


```
                          ┌─────────────────────────────────────┐
   CPU 内存               │            GPU 显存                  │
                          │                                     │
  float vertices[] = {    │  ┌─── VBO ──────────────────────┐   │
    -0.5, -0.5, 0.0,      │  │ -0.5, -0.5, 0.0              │   │
     0.5, -0.5, 0.0,      │  │  0.5, -0.5, 0.0              │   │
     0.0,  0.5, 0.0       │  │  0.0,  0.5, 0.0              │   │
  };                       │  └──────────────────────────────┘   │
         │                 │                                     │
         │ glBufferData()  │         ┌── VAO ────────────┐       │
         ▼                 │         │ 属性 0 (位置):     │       │
                          │         │   size: 3          │       │
                          │         │   type: GL_FLOAT   │       │
                          │         │   stride: 12       │       │
                          │         │   offset: 0        │       │
                          │         │   VBO: [vbo_id]    │       │
                          │         └────────────────────┘       │
                          │              │                        │
                          │              ▼                        │
                          │  ┌─── EBO ──────────────────────┐     │
                          │  │ 0, 1, 3, 1, 2, 3           │     │
                          │  └──────────────────────────────┘     │
                          │                                     │
                          │  glBindVertexArray(VAO)              │
                          │  glDrawElements(GL_TRIANGLES, 6,...) │
                          │         │                            │
                          │         ▼                            │
                          │  ┌─────────────────────────────┐     │
                          │  │   顶点着色器处理每个顶点      │     │
                          │  │   → 图元装配（三角形）        │     │
                          │  │   → 光栅化                  │     │
                          │  │   → 片段着色器上色          │     │
                          │  │   → 输出到屏幕              │     │
                          │  └─────────────────────────────┘     │
                          └─────────────────────────────────────┘
```


**关键流程回顾：**


1. 在 CPU 内存中定义顶点数据的 C++ 数组（`vertices[]`）
2. `glGenBuffers + glBindBuffer + glBufferData` 将数据从 CPU → GPU 显存（VBO）
3. `glVertexAttribPointer + glEnableVertexAttribArray` 告诉 VAO 如何解释 VBO 中的数据
4. 对于索引绘制，额外用 EBO 存储索引数据（同样 CPU → GPU）
5. 渲染循环中绑定 VAO（恢复所有布局设置），调用 `glDrawArrays` 或 `glDrawElements`
6. GPU 根据 VAO 的布局信息从 VBO 读取顶点数据，送入顶点着色器
 ============================== 9 ==============================

## 9. 编译着色器（简要说明）

`hello_triangle.cpp` 中有大约 40 行用于编译着色器的代码。这里我们只做简要介绍，下一课会深入展开：


- **顶点着色器**：每个顶点执行一次，将位置从模型空间变换到 NDC（当前只是简单透传）
- **片段着色器**：每个像素执行一次，决定最终颜色（当前设为固定的橙黄色）
- **着色器程序**：顶点着色器 + 片段着色器链接在一起形成完整的可编程管线


当前我们只需知道：`glUseProgram(shaderProgram)` 在绘制前激活着色器程序，之后的绘制调用都会使用这个着色器。

 ============================== 10 ==============================

## 10. 引擎连接：Unity Mesh 组件的工作原理

让我们把本课学到的概念映射到 Unity 引擎中：


| OpenGL 概念 | Unity 对应物 |
| --- | --- |
| VBO（顶点数据缓冲） | Mesh.vertices（顶点位置数组） |
| EBO（索引缓冲） | Mesh.triangles（三角形索引数组） |
| VAO（顶点属性布局） | VertexAttributeDescriptor[]（Mesh 的顶点数据布局描述） |
| glVertexAttribPointer | Mesh 的顶点数据格式（position 在 offset 0，normal 在 offset 12 等） |
| glDrawElements | Graphics.DrawMeshNow() 底层调用 |
| 着色器程序 | Material.shader（Shader 资源） |
| glUseProgram | Material.SetPass() |


当你将一个 FBX 或 glTF 模型拖入 Unity 场景时，Unity 的导入管线会：


1. 解析文件格式（FBX、OBJ、glTF 等），提取顶点位置、法线、UV 等数据
2. 填充 `Mesh` 对象的 `vertices`、`normals`、`uv`、`triangles` 等属性
3. 在渲染时，Unity 将这些数据上传到 GPU 的 VBO/EBO 中，并设置 VAO 布局
4. 最终调用 `glDrawElements`（或 Vulkan/DirectX 等效调用）绘制

> [!INFO]
> **引擎连接：GPU Instancing**
>   当你用 Unity 的 `Graphics.DrawMeshInstanced` 绘制大量相同物体时，Unity 实际上是在**同一组 VAO+VBO+EBO 上多次调用 glDrawElements**，每次传入不同的变换矩阵。这就是为什么 GPU Instancing 能大幅提升性能——因为 VAO/VBO/EBO 的设置和状态切换开销被均摊了。
 ============================== 11 ==============================

## 11. 资源管理与清理

在程序的最后，我们释放了创建的 OpenGL 资源：


```
glDeleteVertexArrays(1, &VAO);
glDeleteBuffers(1, &VBO);
glDeleteBuffers(1, &EBO);
glDeleteProgram(shaderProgram);
glfwTerminate();
```


OpenGL 资源在 GPU 显存中分配，不会在程序退出时自动释放。良好的资源管理是编写稳定图形应用的基础。


> [!WARNING]
> **显存泄漏**
>   每次调用 `glGenBuffers` 或 `glCreateProgram` 都会在 GPU 上分配资源。如果忘记对应的 `glDelete*` 调用，程序运行时间越长，占用的显存越多，最终可能导致 GPU 内存耗尽。Unity 的 `OnDestroy()` 中释放 Mesh/Material 资源也是同样的道理。
 ============================== 12 ==============================

## 12. 动手练习


1. **修改三角形顶点位置**

在 `hello_triangle.cpp` 中修改三个顶点的坐标，让三角形移动到屏幕的右上方。比如将所有 X 值增加 0.5，Y 值增加 0.3。观察三角形位置的变化。
2. **用 EBO 画一个矩形**

从 `hello_triangle.cpp` 开始：将顶点数组改为矩形的 4 个顶点，添加 EBO 的创建和绑定代码，将绘制命令从 `glDrawArrays` 改为 `glDrawElements`。参考 `hello_triangle_indexed.cpp` 中的做法。
3. **创建一个等腰梯形**

用 4 个顶点 + EBO 画一个等腰梯形。提示：梯形的上底两个顶点 Y 值相等，下底两个顶点 Y 值相等但更低，X 值更宽。
4. **试试线框模式**

取消 `//glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);` 的注释，观察三角形的线框渲染效果。再试试 `GL_POINT` 模式。
 ============================== 13 ==============================

## 13. 本课总结


- **VBO** 把顶点数据从 CPU 内存上传到 GPU 显存
- **VAO** 记录顶点属性的布局设置（数据格式、步长、偏移），核心模式强制使用
- **EBO** 用索引复用顶点，节省显存
- **glVertexAttribPointer** 的 6 个参数定义了单个顶点属性的全部信息
- **glDrawArrays** 按顺序取顶点，**glDrawElements** 按索引取顶点
- 完整流程：CPU 数组 → glBufferData → GPU VBO → VAO 布局描述 → glDrawElements → 顶点着色器 → ... → 屏幕
- Unity 的 Mesh 组件底层就是 VAO + VBO + EBO 的组合
 ============================== 14 ==============================

## 推荐阅读


- [LearnOpenGL: Hello Triangle](https://learnopengl.com/Getting-started/Hello-Triangle)
- [LearnOpenGL: Shaders（下一课内容，可提前了解）](https://learnopengl.com/Getting-started/Shaders)
- [Unity Mesh 类文档](https://docs.unity3d.com/ScriptReference/Mesh.md)
- [OpenGL 4 官方参考手册](https://registry.khronos.org/OpenGL-Refpages/gl4/)
- [Khronos Wiki: Vertex Specification](https://www.khronos.org/opengl/wiki/Vertex_Specification)
 ============================== NAV ============================== 