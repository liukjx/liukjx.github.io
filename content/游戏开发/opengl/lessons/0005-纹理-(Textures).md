---
title: "第05课：纹理 (Textures) — 让画面拥有细节"
description: 将二维图像贴到三维几何体表面，从"色块"到"真实物体"的跨越。
tags: [opengl, 图形学, 纹理, 坐标系统, 材质]
date: 2025-01-01
---

# 纹理 (Textures) — 让画面拥有细节


*将二维图像贴到三维几何体表面，从"色块"到"真实物体"的跨越。*


## 回顾与引入

上一课我们学习了着色器——顶点着色器控制形状，片段着色器控制颜色。但片段着色器中，我们只能用 `vec4(r, g, b, a)` 硬编码颜色，或者用 varying 插值产生渐变色。

渐变色虽然比纯色好看，但和现实世界还差得很远。现实中的物体表面有木纹、砖墙纹理、金属划痕——这些丰富的细节不可能用纯数学公式逐像素计算。解决方案就是**纹理（Texture）**：把一张图片"贴"到三角形表面，用图片的每个像素（纹素 / texel）来决定对应屏幕像素的颜色。


> **纹理无处不在** 在任何一个现代游戏中，你看的每个物体表面几乎都有纹理。地板的木纹、角色的皮肤、天空的背景、枪械的锈迹——这些都是纹理。纹理是现代图形学的核心资产，也是游戏美术师最主要的工作产出。


## 纹理坐标系统 (UV 坐标)

要把一张图片贴在三角形上，首先要解决一个映射问题：图片的哪个点对应三角形的哪个点？

OpenGL 使用了**纹理坐标（Texture Coordinates）**系统，通常用 `(u, v)` 表示，取值范围 **0 到 1**：


```
  纹理坐标系 (UV坐标)
  (0,1) ─────── (1,1)
    │             │
    │  纹理空间    │
    │             │
  (0,0) ─────── (1,0)

  四个角点对应纹理的四个角：
  (0,0) → 左下角
  (1,0) → 右下角
  (1,1) → 右上角
  (0,1) → 左上角
```


在 4.1 示例中，我们给每个顶点增加了 2 个 float 作为纹理坐标：


```
float vertices[] = {
    // positions          // colors           // texture coords
     0.5f,  0.5f, 0.0f,   1.0f, 0.0f, 0.0f,   1.0f, 1.0f, // 右上
     0.5f, -0.5f, 0.0f,   0.0f, 1.0f, 0.0f,   1.0f, 0.0f, // 右下
    -0.5f, -0.5f, 0.0f,   0.0f, 0.0f, 1.0f,   0.0f, 0.0f, // 左下
    -0.5f,  0.5f, 0.0f,   1.0f, 1.0f, 0.0f,   0.0f, 1.0f  // 左上
};
```


对应的顶点着色器接收这些纹理坐标并传递给片段着色器：


```glsl
// 顶点着色器 (4.1.texture.vs)
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aColor;
layout (location = 2) in vec2 aTexCoord;

out vec3 ourColor;
out vec2 TexCoord;

void main() {
    gl_Position = vec4(aPos, 1.0);
    ourColor = aColor;
    TexCoord = aTexCoord;  // 传递给片段着色器
}
```


片段着色器用纹理坐标采样纹理：


```cpp
// 片段着色器 (4.1.texture.fs)
#version 330 core
out vec4 FragColor;

in vec3 ourColor;
in vec2 TexCoord;

uniform sampler2D texture1;  // 纹理采样器

void main() {
    FragColor = texture(texture1, TexCoord);  // 在 TexCoord 位置采样颜色
}
```


`texture(sampler, coord)` 是 GLSL 内置函数，它读取 sampler 指定的纹理在 coord 坐标处的颜色值（返回 `vec4`）。这是片段着色器中最常用的函数之一。


> [!INFO]
> **UV 坐标的常见误区** 注意纹理坐标的 (0,0) 是*左下角*，但很多图片格式（如 PNG、JPEG）的存储顺序是*从上到下*的。如果不做处理，纹理在屏幕上会是上下颠倒的。解决方案是在加载图片时调用 `stbi_set_flip_vertically_on_load(true)`，这正是 4.2 示例在加载前做的。


## 纹理环绕方式 (Wrapping)

如果纹理坐标超出了 0~1 范围，GPU 怎么处理？这由**纹理环绕方式**决定。OpenGL 提供了 4 种模式：


| 模式 | 效果 | 适用场景 |
| --- | --- | --- |
| GL_REPEAT (默认) | 超出部分重复纹理（平铺） | 地板、砖墙、布料等重复纹理 |
| GL_MIRRORED_REPEAT | 镜像重复，每重复一次翻转方向 | 需要无缝拼接但希望减少重复感的场景 |
| GL_CLAMP_TO_EDGE | 拉伸边缘像素 | 边缘不能出现接缝的纹理（如 UI 元素） |
| GL_CLAMP_TO_BORDER | 超出部分显示指定的边框颜色 | 需要纯色边框的场景 |


设置方式：


```
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
```


这里的 `S` 和 `T` 分别对应纹理坐标的 `u`（水平）和 `v`（垂直）方向。两个方向可以独立设置不同的模式。


```
环绕方式效果示意图：

   GL_REPEAT            GL_MIRRORED_REPEAT     GL_CLAMP_TO_EDGE
  ┌───┬───┬───┐        ┌───┬───┬───┐         ┌───────────┐
  │   │   │   │        │   │   │   │         │           │
  │ 1 │ 2 │ 3 │        │ 2 │ 1 │ 2 │         │ 拉伸边缘  │
  │   │   │   │        │   │   │   │         │           │
  ├───┼───┼───┤        ├───┼───┼───┤         └───────────┘
  │   │   │   │        │   │   │   │
  │ 4 │ 5 │ 6 │        │ 2 │ 1 │ 2 │
  │   │   │   │        │   │   │   │
  ├───┼───┼───┤        ├───┼───┼───┤
  │   │   │   │        │   │   │   │
  │ 7 │ 8 │ 9 │        │ 3 │ 2 │ 3 │
  │   │   │   │        │   │   │   │
  └───┴───┴───┘        └───┴───┴───┘
```


## 纹理过滤 (Filtering)

当一个纹理像素（texel）被放大或缩小时，一个屏幕像素可能覆盖了多个 texel（缩小），或者一个 texel 需要覆盖多个屏幕像素（放大）。纹理过滤决定了这些情况下的颜色计算方法。

### 放大过滤 (Magnification)


| 过滤器 | 速度 | 质量 | 原理 |
| --- | --- | --- | --- |
| GL_NEAREST（最近邻） | 最快 | 最低（像素感强） | 取距离最近的 texel，产生"马赛克"效果 |
| GL_LINEAR（双线性插值） | 快 | 好（平滑模糊） | 取周围 4 个 texel 加权平均，产生平滑过渡 |


### 缩小过滤 + Mipmap

当一个纹理在屏幕上被缩得很小（比如远处的墙壁），同一个像素可能覆盖成百上千个 texel。如果逐 texel 采样，会产生严重的锯齿和闪烁。解决方案是 **Mipmap**：

Mipmap 是一种预计算好的纹理金字塔：


```
  原始纹理 (128×128)    →  64×64   →   32×32   →   ...   →   1×1
      (第 0 级)           (第 1 级)    (第 2 级)              (第 7 级)
```


GPU 根据物体距离摄像机的远近，自动选择合适的 mipmap 层级采样，避免锯齿。


| 缩小过滤器 | 说明 |
| --- | --- |
| GL_LINEAR_MIPMAP_LINEAR（三线性过滤） | 在两层 mipmap 之间做线性插值 + 每层内双线性插值，质量最高，最常用 |
| GL_NEAREST_MIPMAP_LINEAR | 两层 mipmap 间线性混合，但每层用最近邻采样 |
| GL_LINEAR_MIPMAP_NEAREST | 选最近 mipmap 层，该层内双线性插值 |
| GL_NEAREST_MIPMAP_NEAREST | 选最近 mipmap 层，最近邻采样，最快但质量最低 |


生成 mipmap 只需一行代码：


```
glGenerateMipmap(GL_TEXTURE_2D);
```


设置方式：


```
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
```

> [!WARNING]
> **重要限制**`GL_TEXTURE_MAG_FILTER` 不能使用 mipmap 模式（即 `GL_*_MIPMAP_*`），因为放大时没有更高分辨率的纹理层级可用。如果你设置 `GL_TEXTURE_MAG_FILTER` 为 `GL_LINEAR_MIPMAP_LINEAR`，OpenGL 会返回 `GL_INVALID_ENUM` 错误！这是常见的新手 bug。


## 使用 stb_image.h 加载图片

要在 GPU 中使用纹理，首先要把图片文件从硬盘加载到内存，然后上传到 GPU。OpenGL 本身没有文件解析功能，我们需要第三方库来解码图片格式。

`stb_image.h` 是 Sean Barrett 开发的单头文件图片加载库，支持 JPEG、PNG、BMP、GIF 等几乎所有常见格式。使用方式极为简单：


```cpp
#include <stb_image.h>

int width, height, nrChannels;
// 加载图片到内存，返回像素数据指针
unsigned char *data = stbi_load("container.jpg",
                                &width, &height, &nrChannels, 0);

if (data) {
    // 将像素数据上传到 GPU 纹理
    glTexImage2D(GL_TEXTURE_2D,        // 纹理目标
                 0,                    // mipmap 层级（0 = 基础层级）
                 GL_RGB,              // 内部格式（GPU 存储格式）
                 width, height,       // 图片尺寸
                 0,                   // 边框（必须为 0）
                 GL_RGB,              // 输入数据格式
                 GL_UNSIGNED_BYTE,    // 输入数据类型
                 data);               // 像素数据指针

    glGenerateMipmap(GL_TEXTURE_2D);  // 自动生成所有 mipmap 层级
} else {
    std::cout << "Failed to load texture" << std::endl;
}

// 释放 CPU 内存（数据已上传到 GPU）
stbi_image_free(data);
```


注意 PNG 图片包含 Alpha 通道，加载时需使用 `GL_RGBA`：


```
// 对于透明 PNG 图片
unsigned char *data = stbi_load("awesomeface.png",
                                &width, &height, &nrChannels, 0);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0,
             GL_RGBA, GL_UNSIGNED_BYTE, data);
```

> [!INFO]
> **完整的纹理创建流程**
> ```
> unsigned int texture;
> glGenTextures(1, &texture);           // 1. 生成纹理对象
> glBindTexture(GL_TEXTURE_2D, texture); // 2. 绑定（设置为当前纹理）
>
> // 3. 设置采样参数
> glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
> glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
> glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
> glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
>
> // 4. 加载图片并上传到 GPU
> unsigned char *data = stbi_load("image.jpg", &w, &h, &n, 0);
> glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, w, h, 0, GL_RGB, GL_UNSIGNED_BYTE, data);
> glGenerateMipmap(GL_TEXTURE_2D);
> stbi_image_free(data);
> ```


## 纹理单元 (Texture Units)

GPU 可以在同一个着色器程序中使用**多个纹理**。但片段着色器中的每个 `sampler2D` 如何知道去哪个纹理中采样？这就要靠**纹理单元（Texture Unit）**机制。

纹理单元是 GPU 上的一个"纹理插槽"，编号从 `GL_TEXTURE0` 到 `GL_TEXTURE31`（最多 32 个）。每个着色器中的 `sampler2D` 对应一个纹理单元编号：


```
  纹理单元工作机制：

  片段着色器                        GPU 硬件
  ┌──────────────────┐            ┌──────────────┐
  │ sampler2D tex1   │  ──单元0──→│ GL_TEXTURE0  │──→ container.jpg
  │ sampler2D tex2   │  ──单元1──→│ GL_TEXTURE1  │──→ awesomeface.png
  └──────────────────┘            └──────────────┘
```


实现代码（来自 `4.2.textures_combined/textures_combined.cpp`）：


```
// 初始化阶段：绑定 sampler 到纹理单元（只需一次）
ourShader.use(); // 必须先激活着色器程序！
ourShader.setInt("texture1", 0);  // texture1 对应 GL_TEXTURE0
ourShader.setInt("texture2", 1);  // texture2 对应 GL_TEXTURE1

// 渲染循环中：激活纹理单元并绑定纹理
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, texture1);
glActiveTexture(GL_TEXTURE1);
glBindTexture(GL_TEXTURE_2D, texture2);

ourShader.use();
glBindVertexArray(VAO);
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
```

> [!INFO]
> **默认纹理单元** 如果没有显式设置 uniform，`sampler2D` 默认绑定到纹理单元 0。这就是为什么 4.1 示例中有一个纹理时不需要调用 `glUniform1i` 的原因——`texture1` 默认就是单元 0。


## 纹理组合：混合两个纹理

在 `4.2.textures_combined` 中，片段着色器将两个纹理按照指定比例混合：


```cpp
#version 330 core
out vec4 FragColor;

in vec3 ourColor;
in vec2 TexCoord;

uniform sampler2D texture1;
uniform sampler2D texture2;

void main() {
    // mix(a, b, t) = (1-t)*a + t*b
    // 这里 0.2 表示：20% awesomeface + 80% container
    FragColor = mix(texture(texture1, TexCoord),
                    texture(texture2, TexCoord), 0.2);
}
```


`mix()` 是 GLSL 内置的线性插值函数，定义非常直观：


```
mix(a, b, t) = a × (1 - t) + b × t
```


当 `t = 0.0` 时，输出 `a`；`t = 1.0` 时，输出 `b`；`t = 0.2` 时，两者按比例混合。

这个示例的结果是两个纹理的混合效果：容器（木箱）纹理上叠加了笑脸图案，透明度为 20%。

## 数据流全景图（含纹理）

现在把纹理加入我们上一课的着色器数据流图中：


```glsl
┌────────────────────────────────────────────────────────────────────┐
│                    CPU (C++ 代码)                                   │
│                                                                    │
│  vertices[] 包含位置 / 颜色 / 纹理坐标 (UV)                          │
│  glBufferData → VBO                                              │
│  glVertexAttribPointer(location=2, 2 floats) → 纹理坐标属性         │
│                                                                    │
│  stbi_load("container.jpg") → 像素数据                              │
│  glTexImage2D → GPU 纹理对象 texture1                              │
│  stbi_load("awesomeface.png") → 像素数据                            │
│  glTexImage2D → GPU 纹理对象 texture2                              │
│                                                                    │
│  glUniform1i("texture1", 0)  → 设置纹理单元映射                      │
│  glUniform1i("texture2", 1)                                        │
│                                                                    │
│  glActiveTexture(GL_TEXTURE0) + glBindTexture(texture1)            │
│  glActiveTexture(GL_TEXTURE1) + glBindTexture(texture2)            │
│  glDrawElements → 触发渲染                                         │
└──────────────────────────┬─────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│                 顶点着色器 (每顶点)                                  │
│  layout(loc=2) in vec2 aTexCoord;                                  │
│  out vec2 TexCoord;                                                │
│  gl_Position → 变换后的位置                                         │
│  TexCoord = aTexCoord;                                             │
└──────────────────────────────────┬─────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────┐
│          光栅化阶段 (固定功能)                                       │
│                                                                   │
│  gl_Position → 屏幕坐标                                           │
│  对 TexCoord 做重心坐标插值 →                                      │
│  像素位置越靠近顶点A，插值结果越接近顶点A的 UV 坐标                  │
└──────────────────────────────────┬─────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────┐
│                 片段着色器 (每像素)                                  │
│                                                                   │
│  in vec2 TexCoord;  ← 收到插值后的 UV 值                           │
│  uniform sampler2D texture1;  ← 对应 GL_TEXTURE0                  │
│  uniform sampler2D texture2;  ← 对应 GL_TEXTURE1                  │
│                                                                   │
│  vec4 texel1 = texture(texture1, TexCoord);  从纹理1采样           │
│  vec4 texel2 = texture(texture2, TexCoord);  从纹理2采样           │
│  FragColor = mix(texel1, texel2, 0.2);       混合两个纹理          │
└──────────────────────────────────┬─────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────┐
│              输出合并 → 帧缓冲 → 屏幕                               │
└────────────────────────────────────────────────────────────────────┘
```


## 引擎连接：Unity 材质面板与纹理贴图


> [!INFO]
> **Unity 材质的工作方式**
>
> 在 Unity 中创建一个 Material，你会看到这样一个面板：
>
>
> ```
>
>   Material [Standard]
>   ├── Albedo      ── 拖入一张纹理 → sampler2D _MainTex (纹理单元 0)
>   ├── Normal Map  ── 拖入一张纹理 → sampler2D _BumpMap (纹理单元 1)
>   ├── Metallic    ── 拖入一张纹理 → sampler2D _MetallicGlossMap (纹理单元 2)
>   ├── Occlusion   ── 拖入一张纹理 → sampler2D _OcclusionMap (纹理单元 3)
>   └── Emission    ── 拖入一张纹理 → sampler2D _EmissionMap (纹理单元 4)
>
> ```
>
>
> 当你把 5 张纹理拖入这些插槽时，Unity 做的事情和我们刚才写的代码完全一样：
>
>
> 1. 用 `stb_image`（或类似库）加载每张图片到 CPU 内存
> 2. 用 `glTexImage2D` 上传到 GPU，创建纹理对象
> 3. 在渲染时调用 `glActiveTexture(GL_TEXTURE0~4)` 绑定每个纹理
> 4. 通过 `glUniform1i` 设置 `sampler2D` 对应的纹理单元编号
> 5. 片段着色器中用 `texture()` 采样各个纹理进行光照计算
>
>
> 你调整的 "Tiling" 参数（水平/垂直重复次数）实际上就是在设置 `GL_TEXTURE_WRAP_S/T` 和纹理坐标的缩放。

> [!INFO]
> **Unreal Engine 的纹理系统**
>
> Unreal 材质编辑器中的 Texture Sample 节点允许你加载任意纹理，然后连接到各种材质引脚：
>
>
> - Base Color → Albedo 贴图（物体固有色）
> - Normal → 法线贴图（模拟表面凹凸细节，不需增加顶点）
> - Roughness → 粗糙度贴图（控制高光模糊程度）
> - Metallic → 金属度贴图（控制是否金属质感）
> - Ambient Occlusion → AO 贴图（模拟环境光遮蔽阴影）
>
>
> 每个纹理在运行时都绑定到一个独立的纹理单元，通过不同的 `sampler2D` 在着色器中访问。这就是为什么游戏引擎中的材质可以有 5-10 张纹理同时工作——它们各自在不同的纹理单元上。

| 你学的概念 | Unity 对应 | Unreal 对应 |
| --- | --- | --- |
| texCoords (0~1) | Mesh 的 UV 通道（UV0, UV1...） | Texture Coordinate 节点 |
| glTexParameteri (Wrap) | 纹理导入设置的 Wrap Mode | 纹理资源的寻址模式 |
| glTexParameteri (Filter) | 纹理导入设置的 Filter Mode | 纹理资源的过滤类型 |
| glGenerateMipmap | 纹理导入时自动生成（Generate Mip Maps） | 纹理导入时自动生成 |
| GL_TEXTURE0~31 | 材质面板不同的贴图插槽 | 材质编辑器中不同的纹理引脚 |
| texture(sampler, uv) | tex2D(_MainTex, uv) | Texture Sample 节点的 RGBA 输出 |
| mix()/lerp() | lerp(a, b, t) | Linear Interpolate (Lerp) 节点 |


## 动手练习


1. **加载自己的图片**：在 `4.1.textures` 的代码中，将加载的纹理文件换成你自己的图片（放到 `resources/textures/` 目录下）。注意检查图片格式是 RGB 还是 RGBA，相应修改 `glTexImage2D` 的格式参数。
2. **纹理混合参数**：在 `4.2.textures_combined` 中，修改 `mix()` 的第三个参数，观察不同混合比例的效果。然后试试用 uniform 传递这个比例，让它在运行时动态变化（参考第 4 课 uniform 的用法）。
3. **纹理环绕实验**：在 `4.1.textures` 中将纹理坐标范围改为 `0.0 ~ 2.0`（在顶点数据中把 1.0 改成 2.0），分别测试 `GL_REPEAT`、`GL_MIRRORED_REPEAT` 和 `GL_CLAMP_TO_EDGE` 三种环绕方式，观察渲染结果的不同。
4. **纹理 + 颜色混合**：修改 `4.1.texture.fs`，将纹理采样的颜色与顶点颜色（`ourColor`）相乘：`FragColor = texture(texture1, TexCoord) * vec4(ourColor, 1.0)`。观察每个顶点的颜色如何影响纹理的表现。

> [!INFO]
> **推荐阅读**
> - [LearnOpenGL 原文 — Textures](https://learnopengl.com/Getting-started/Textures) — 本课的英文原版教材
> - [stb_image.h 官方仓库](https://github.com/nothings/stb/blob/master/stb_image.h) — 单头文件图片加载库，了解其 API
> - [docs.gl — glTexImage2D 参考](https://docs.gl/gl3/glTexImage2D) — 纹理上传 API 的完整参数说明
> - [docs.gl — glTexParameter 参考](https://docs.gl/gl3/glTexParameter) — 环绕方式和过滤参数的官方文档


## 下一课预告

掌握了纹理之后，我们已经有能力让物体表面有丰富的视觉效果了。但我们的三角形仍然是静止的。接下来我们要学习**变换（Transformations）**——用矩阵运算让物体平移、旋转和缩放，真正进入 3D 世界！

