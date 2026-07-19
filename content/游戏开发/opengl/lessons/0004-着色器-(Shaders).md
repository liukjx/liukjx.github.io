---
title: 第 4 课：着色器 (Shaders) — GPU 编程入门
description: 从固定功能到可编程管线，用 GLSL 让 GPU 为你作画。
tags: [opengl, 图形学, 着色器, 材质]
date: 2025-01-01
---

# 着色器 (Shaders) — GPU 编程入门


*从固定功能到可编程管线，用 GLSL 让 GPU 为你作画。*


## 回顾与引入

在上一课中，我们用 VAO、VBO 和 EBO 绘制了一个三角形。但有一个关键部分我们只是"照着做了"——那就是**着色器（Shader）**。这一课我们要深入理解它。

着色器是理解图形学的核心分水岭。学完这一课后，你将不再是一个"OpenGL API 调用者"，而是真正可以控制 GPU 做任何视觉效果的人。Unity 的 ShaderLab、Unreal 的材质编辑器、Godot 的 shader 语言 — 它们的底层都是今天要学的 GLSL。


> **为什么着色器如此重要** 现代图形渲染管线中，*只有* 顶点着色器和片段着色器是可编程的阶段。其他阶段（光栅化、深度测试等）是固定的。也就是说，你能"写代码"控制 GPU 的唯一入口就是着色器。整个行业的视觉效果创新 — 从卡通渲染到电影级光照 — 全部发生在着色器里。


## GLSL 语言基础

GLSL（OpenGL Shading Language）是 OpenGL 的着色器编程语言。它的语法类似 C 语言，但加入了大量图形学特有的数据类型和内置变量。

### 版本声明

每个着色器的第一行必须是版本声明。本系列使用 OpenGL 3.3，对应的 GLSL 版本是 330：


```
#version 330 core
```


这里的 `core` 表示使用 Core Profile（可编程管线），兼容性如下：


| OpenGL 版本 | GLSL 版本 |
| --- | --- |
| 3.3 | 330 |
| 4.0 | 400 |
| 4.6 | 460 |


### 数据类型

GLSL 继承了 C 语言的基本类型，并增加了图形学专用的向量和矩阵类型：


| 类别 | 类型 | 说明 |
| --- | --- | --- |
| 标量 | float, int, bool | 和 C 语言一样 |
| 浮点向量 | vec2, vec3, vec4 | 2/3/4 维浮点向量（最常用） |
| 整数向量 | ivec2, ivec3, ivec4 | 整数版本 |
| 布尔向量 | bvec2, bvec3, bvec4 | 布尔版本 |
| 浮点矩阵 | mat2, mat3, mat4 | 2x2 / 3x3 / 4x4 矩阵（变换矩阵用 mat4） |
| 采样器 | sampler2D, samplerCube | 纹理采样器，用于读取纹理 |


### 向量访问方式 — Swizzle

GLSL 向量支持一种叫 **swizzle（洗牌）** 的语法，可以用 `.xyz`（位置）、`.rgb`（颜色）、`.st`（纹理坐标）来访问和重组向量的分量：


```
vec4 color = vec4(1.0, 0.5, 0.2, 1.0);
color.rgb;  // 等价于 color.xyz，取前三个分量
color.a;    // 等价于 color.w，取最后一个分量
vec3 brightness = color.rgb * 0.5;    // 整个向量运算
vec2 uv = texCoord.st;                // 纹理坐标常用 st

// Swizzle 的灵活重组
vec4 swapped = color.bgra;            // 反转通道顺序
vec3 mixed = color.rr g;               // 复制通道
```


### 三种核心存储限定符


| 关键字 | 方向 | 用途 |
| --- | --- | --- |
| in | 输入到此着色器 | 在顶点着色器中接收顶点属性，在片段着色器中接收插值后的 varying 值 |
| out | 从此着色器输出 | 在顶点着色器中输出 varying 到下一阶段，在片段着色器中输出最终颜色 |
| uniform | CPU → GPU（全局常量） | 从 CPU 端传递给整个着色器程序的数据，所有顶点/片段共享 |

> [!INFO]
> **in / out 匹配规则** 顶点着色器的 `out` 变量名必须与片段着色器的 `in` 变量名*完全一致*，否则链接失败。这是 GPU 在光栅化阶段做插值的依据——名字匹配的连接点是管线通道。


## 顶点着色器 vs 片段着色器

这是整个图形渲染管线中**最重要的两个可编程阶段**。理解它们的职责分工，就是理解了图形渲染的一半。


| 特性 | 顶点着色器 | 片段着色器 |
| --- | --- | --- |
| 执行次数 | 每个顶点执行一次 | 每个像素（片段）执行一次 |
| 输入 | 顶点属性（位置、颜色、法线等） | 插值后的 varying 值 |
| 主要任务 | 计算顶点的最终位置（gl_Position） | 计算像素的最终颜色（FragColor） |
| 输出 | gl_Position（必须赋值）+ 其他 out 变量 | 自定义 out vec4 作为颜色输出 |
| 并行度 | 顶点数量级（几百 ~ 百万） | 屏幕像素数量级（几万 ~ 千万） |
| 你能控制的 | 位置变换、形态动画、骨骼蒙皮 | 颜色计算、光照、纹理采样、特效 |


类比理解：顶点着色器决定"形状"，片段着色器决定"颜色"。


> **关键认识** 一个三角形有 3 个顶点，但它可能覆盖屏幕上的成千上万个像素。这意味着顶点着色器执行 3 次，而片段着色器执行成千上万次。这种巨大的数量差异决定了两个着色器的设计哲学：顶点着色器适合做"稀疏但昂贵"的计算，片段着色器适合做"每个像素"的操作。


## Uniform：CPU 与 GPU 的桥梁

打开源文件 `3.1.shaders_uniform/shaders_uniform.cpp`，看关键片段：

这是 C++ 侧的代码（每帧执行）：


```
// 片段着色器中声明的 uniform
// uniform vec4 ourColor;

// C++ 端设置 uniform
double timeValue = glfwGetTime();
float greenValue = static_cast<float>(sin(timeValue) / 2.0 + 0.5);

int vertexColorLocation = glGetUniformLocation(shaderProgram, "ourColor");
glUniform4f(vertexColorLocation, 0.0f, greenValue, 0.0f, 1.0f);
```


这是着色器侧（`3.1.shaders_uniform` 的片段着色器）：


```cpp
#version 330 core
out vec4 FragColor;

uniform vec4 ourColor;  // 从 CPU 传入

void main() {
    FragColor = ourColor;
}
```


**Uniform 的关键特性：**


- **全局性**：每帧设置一次，所有顶点/片段共享同一个值
- **只读**：着色器内部不能修改 uniform，只能读取
- **持久性**：设置后保持直到下一次 `glUniform*` 调用
- **类型化 API**：`glUniform1f`、`glUniform3f`、`glUniform4f`、`glUniformMatrix4fv` 等对应不同类型

> [!INFO]
> **uniform 生命周期规则** 每次 `glUseProgram` 切换着色器程序时，uniform 值*不会*保持。如果你有两个着色器程序 A 和 B，切换回 A 时之前设的 uniform 值还在（它属于程序对象）。但如果重新编译了程序，所有 uniform 恢复为默认值（0 或空）。


在 `3.1` 示例中，我们利用 `glfwGetTime()` 获取运行时间，用正弦函数产生 `0~1` 之间变化的值作为绿色分量，实现了三角形的颜色随时间的呼吸动画。

## Varying / 插值：从顶点到片段的平滑过渡

这是着色器中最优雅的设计之一。打开 `3.2.shaders_interpolation/` 中的代码：

顶点数据现在包含了**位置 + 颜色**两个属性：


```
float vertices[] = {
    // positions         // colors
     0.5f, -0.5f, 0.0f,  1.0f, 0.0f, 0.0f,  // 右下 → 红色
    -0.5f, -0.5f, 0.0f,  0.0f, 1.0f, 0.0f,  // 左下 → 绿色
     0.0f,  0.5f, 0.0f,  0.0f, 0.0f, 1.0f   // 顶部 → 蓝色
};
```


顶点着色器（`3.2.shaders_interpolation` 的内嵌代码）：


```glsl
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aColor;

out vec3 ourColor;  // → 这个值会被插值！

void main() {
    gl_Position = vec4(aPos, 1.0);
    ourColor = aColor;
}
```


片段着色器：


```cpp
#version 330 core
out vec4 FragColor;

in vec3 ourColor;  // ← 接收到的是插值后的值

void main() {
    FragColor = vec4(ourColor, 1.0f);
}
```


为什么三角形的三个顶点分别是纯红、纯绿、纯蓝，但中间却是平滑的渐变？

因为 GPU 的光栅化单元在顶点着色器输出 `out` 和片段着色器输入 `in` 之间，自动进行了**重心坐标插值（Barycentric Interpolation）**：


```
             顶点 A（红）     顶点 B（绿）
                 \            /
                  \  像素 P  /
                   \   ↑    /
                    \ 混合  /
                     \    /
                  顶点 C（蓝）

三角形内部的每个像素，其颜色 =
  w_A × 顶点A颜色 + w_B × 顶点B颜色 + w_C × 顶点C颜色

其中 w_A + w_B + w_C = 1，具体值取决于像素到三个顶点的距离
```


你可以把插值理解为：三角形内部的每个像素，都"混合"了三个顶点的颜色，混合权重取决于该像素在三角形中的相对位置。靠近顶点的像素更多继承该顶点颜色。


> [!INFO]
> **为什么不是"值传递"而是"插值"？** 如果只做简单的值传递，三角形内部的所有像素都会是同一个颜色，画面就是纯色块而不会有渐变。GPU 的自动插值让开发者 *无成本* 获得平滑过渡效果—这是硬件光栅化的核心价值之一。


## 用 Shader 类封装一切

前两个例子中，着色器源代码是硬编码在 C++ 字符串中的。实际项目中，着色器应该写在单独的文件里，运行时读取、编译和链接。

打开 `includes/learnopengl/shader_s.h`，看看 Shader 类的核心逻辑：

### 构造函数流程


```
Shader(const char* vertexPath, const char* fragmentPath) {
    // 1. 从文件读取源代码
    std::ifstream vShaderFile(vertexPath);
    std::stringstream vShaderStream;
    vShaderStream << vShaderFile.rdbuf();
    std::string vertexCode = vShaderStream.str();

    // 2. 编译顶点着色器
    unsigned int vertex = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertex, 1, &vShaderCode, NULL);
    glCompileShader(vertex);
    checkCompileErrors(vertex, "VERTEX");

    // 3. 编译片段着色器（同上）

    // 4. 链接成着色器程序
    ID = glCreateProgram();
    glAttachShader(ID, vertex);
    glAttachShader(ID, fragment);
    glLinkProgram(ID);
    checkCompileErrors(ID, "PROGRAM");

    // 5. 清理：着色器对象不再需要
    glDeleteShader(vertex);
    glDeleteShader(fragment);
}
```


### 使用时的便捷方法


```
void use() {
    glUseProgram(ID);
}

// 设置 uniform 的便捷方法
void setBool(const std::string &name, bool value) const;
void setInt(const std::string &name, int value) const;
void setFloat(const std::string &name, float value) const;

// 还可以扩展 setVec3, setMat4 等
```


有了这个类，3.3 示例中的代码变得极其简洁：


```
// 初始化阶段
Shader ourShader("3.3.shader.vs", "3.3.shader.fs");

// 渲染循环中
ourShader.use();
glBindVertexArray(VAO);
glDrawArrays(GL_TRIANGLES, 0, 3);
```

> [!INFO]
> **着色器对象的生命周期**`glCreateShader` 创建的着色器对象在链接后可以立即删除（`glDeleteShader`），因为链接后的程序对象已经包含了编译后的二进制代码。这节省了 GPU 内存。而程序对象（`glCreateProgram` 返回的 ID）需要在整个渲染期间保持，直到不再使用才删除。


## 数据流全景图

现在我们可以把学到的所有概念串起来，形成完整的着色器数据流图：


```glsl
┌──────────────────────────────────────────────────────────────────┐
│                         CPU (C++ 代码)                            │
│                                                                   │
│  float vertices[] = { pos, color, texCoord, ... }                 │
│  glBufferData(...)  →  VBO                                        │
│  glVertexAttribPointer(...)  →  VAO 描述如何解析顶点数据            │
│                                                                   │
│  glGetUniformLocation → 获取 uniform 位置                          │
│  glUniform4f(...)     → 每帧更新 uniform 值（如时间、相机位置）      │
│                                                                   │
│  glDrawArrays / glDrawElements  →  触发 GPU 渲染                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    顶点着色器 (每顶点执行一次)                      │
│                                                                   │
│  #version 330 core                                                │
│  layout (location = 0) in vec3 aPos;    ◄── 从 VAO 读取顶点数据    │
│  layout (location = 1) in vec3 aColor;                           │
│  uniform mat4 transform;                ◄── 从 CPU 接收 uniform   │
│                                                                   │
│  out vec3 ourColor;                     ──┐                       │
│  out vec2 TexCoord;                       │  插值器（自动）         │
│                                           │                       │
│  void main() {                            │                       │
│      gl_Position = transform * vec4(aPos, │                       │
│                           1.0);           │                       │
│      ourColor = aColor;                   │                       │
│      TexCoord = aTexCoord;                │                       │
│  }                                         │                       │
└──────────────────────────────────────────┬─┘                       │
                                           │                         │
                                           ▼                         │
┌────────────────────────────────────────────────────────────────────┤
│              光栅化阶段 (固定功能，不可编程)                         │
│                                                                   │
│  1. 把三角形从连续坐标 → 离散像素（片段）                            │
│  2. 对每个 out 变量做重心坐标插值                                    │
│  3. 深度测试：丢弃被遮挡的片段                                        │
│                                                                   │
│  ourColor = 插值(顶点A颜色, 顶点B颜色, 顶点C颜色)                   │◄──┘
│  TexCoord = 插值(顶点A的UV, 顶点B的UV, 顶点C的UV)                  │
└──────────────────────────────────────────┬────────────────────────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    片段着色器 (每像素执行一次)                      │
│                                                                   │
│  #version 330 core                                                │
│  in vec3 ourColor;                   ◄── 收到插值后的值            │
│  in vec2 TexCoord;                                                │
│  uniform sampler2D texture1;         ◄── 从 CPU 接收纹理单元编号   │
│                                                                   │
│  out vec4 FragColor;                                              │
│                                                                   │
│  void main() {                                                    │
│      FragColor = texture(texture1, TexCoord) * vec4(ourColor,1.0);│
│  }                                                                │
└──────────────────────────────────────────┬────────────────────────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    输出合并 (固定功能)                              │
│                                                                   │
│  混合（Alpha Blending）→ 颜色缓冲 → 交换到屏幕                    │
└──────────────────────────────────────────────────────────────────┘
```


这张图是理解 OpenGL 渲染的**终极思维模型**。每个概念都对应图中的一步，每次你写 shader 代码都是在图中的某个方框内部编程。

## 引擎连接：Unity ShaderLab & Unreal 材质编辑器

现在你已经知道 GLSL 是怎样工作的了，来看游戏引擎是如何使用它的：


> [!INFO]
> **Unity ShaderLab = GLSL 的封装**
>
> Unity 中的 ShaderLab 文件（`.shader`）本质上是 GLSL（在 Unity 中其实是 HLSL，但原理一致）的包装层：
>
>
> ```glsl
> Shader "Custom/MyShader" {
>     Properties {
>         _Color ("Color", Color) = (1,1,1,1)  // → 相当于 uniform
>         _MainTex ("Texture", 2D) = "white" {} // → 相当于 sampler2D
>     }
>     SubShader {
>         Pass {
>             CGPROGRAM
>             #pragma vertex vert
>             #pragma fragment frag
>
>             // 这就是你熟悉的 GLSL 代码！(语法略有不同)
>             float4 _Color;
>
>             struct appdata {
>                 float4 vertex : POSITION;  // → in vec3 aPos;
>             };
>             struct v2f {
>                 float4 vertex : SV_POSITION; // → gl_Position
>                 float2 uv : TEXCOORD0;       // → out vec2 TexCoord;
>             };
>
>             v2f vert (appdata v) { ... }  // → 顶点着色器
>             float4 frag (v2f i) : SV_Target { ... }  // → 片段着色器
>             ENDCG
>         }
>     }
> }
> ```
>
>
> Unity 的材质面板中的每个滑块（Metallic、Smoothness 等），对应的都是着色器中的一个 `uniform`。你调整滑块 → CPU 更新 uniform → GPU 重新渲染。

> [!INFO]
> **Unreal 材质编辑器 = 可视化着色器编程**
>
> Unreal Engine 的材质编辑器是**节点图**，每个节点最终被编译为 HLSL（DirectX 的着色器语言，语法几乎与 GLSL 相同）：
>
>
> - Texture Sample 节点 → `sampler2D` + `texture()` 采样
> - Lerp 节点 → `mix()` 函数
> - Time 节点 → `uniform float _Time` 传入时间
> - 最终输出引脚（Base Color、Metallic、Normal）→ `out vec4 FragColor` 的不同分量
>
>
> 你拖拽的每个节点图，最终在引擎编译后，就是一段标准的着色器代码，运行在 GPU 上。这正是我们正在学习的 GLSL。

| 你学的概念 | Unity 对应 | Unreal 对应 |
| --- | --- | --- |
| 顶点着色器 | #pragma vertex vert | 材质编辑器中的 World Position / Vertex Normal 节点 |
| 片段着色器 | #pragma fragment frag | 材质输出的各种引脚（Base Color, Roughness...） |
| uniform | Material Property 滑块 | Material Instance Parameter |
| in/out varying | v2f 结构体（TEXCOORD0-7） | Interpolator 节点 |
| sampler2D + texture() | Texture 2D 类型 + tex2D() | Texture Sample 节点 |
| mix() 插值 | lerp() | Lerp 节点 |


## 动手练习


1. **Uniform 颜色动画**：修改 `3.1.shaders_uniform` 的代码，将 uniform 改为 `vec4 ourColor`，用 `sin(glfwGetTime())` 分别控制 R、G、B 三个通道，让三角形周期性变换颜色。提示：`glUniform4f(location, r, g, b, 1.0f)`。
2. **颜色插值实验**：在 `3.2.shaders_interpolation` 中，修改三角形的三个顶点颜色，让它们分别是 (1,0,0)、(0,1,0)、(0,0,1)。然后交换顶点顺序，观察渐变方向的变化。
3. **扩展 Shader 类**：在 `shader_s.h` 中添加 `setVec3` 和 `setMat4` 方法，参考已有的 `setFloat` 实现。提示：`glUniform3f` 和 `glUniformMatrix4fv`。
4. **文件分离**：将 3.1 中的硬编码着色器字符串提取到单独的 `.vs` 和 `.fs` 文件中，使用 `Shader` 类加载。参考 3.3 示例的做法。

> [!INFO]
> **推荐阅读**
> - [LearnOpenGL 原文 — Shaders](https://learnopengl.com/Getting-started/Shaders) — 本课的英文原版教材，内容更详细
> - [docs.gl — OpenGL 官方参考手册](https://docs.gl/) — 查询 glUniform*、glCreateShader 等 API 细节
> - [Khronos GLSL Wiki](https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language) — GLSL 语言规范的权威参考
> - [The Book of Shaders](https://shader-demo.kitchen/) — 通过交互式示例学习片段着色器（高级）


## 下一课预告

我们学会了用 uniform 传递数据、用 varying 做插值。但三角形还是纯色或渐变色，不够"真实"。下一课我们将学习**纹理（Texture）**——把图片贴到几何体表面，让渲染结果瞬间拥有丰富的细节。

