---
title: "第32课：Breakout 游戏引擎实战"
description: 一个完整的 2D 游戏引擎 —— 从 OpenGL 到游戏应用的桥梁
tags: [opengl, 图形学]
date: 2025-01-01
---

LearnOpenGL 系列 · 最终章


# 第0032课：Breakout 游戏引擎实战


*一个完整的 2D 游戏引擎 —— 从 OpenGL 到游戏应用的桥梁*


## 一、概述

本课是 LearnOpenGL 全系列的 **收官之作**。我们将回顾一个完整的、基于 OpenGL 的 Breakout（打砖块）游戏引擎。它虽然是一个 2D 小游戏，但其架构设计已经具备了商业游戏引擎的核心理念：资源管理、渲染管线、游戏对象系统、粒子特效、后处理、碰撞检测、文字 UI、音效系统。

本课对应的源文件：`src/7.in_practice/3.2d_game/0.full_source/`

主要组件文件：


- `program.cpp` — 主入口，GLFW 初始化与游戏循环
- `game.h/cpp` — 游戏核心状态与逻辑
- `sprite_renderer.cpp` — 精灵渲染器
- `resource_manager.cpp` — 静态资源管理器
- `game_object.cpp` — 游戏对象基类
- `ball_object.cpp` — 球对象（继承自 GameObject）
- `game_level.cpp` — 关卡系统
- `particle_generator.cpp` — 粒子系统
- `post_processor.cpp` — 后处理特效
- `text_renderer.cpp` — 文字渲染


## 二、系统架构总览


| 组件 | 职责 | 对应的 OpenGL 知识 |
| --- | --- | --- |
| ResourceManager | 全局单例，加载/缓存 Shader 与 Texture | 着色器编译、纹理加载、std::map 容器管理 |
| SpriteRenderer | 通用四边形渲染，带变换/颜色/纹理 | VAO/VBO、模型矩阵变换、纹理采样 |
| GameObject | 所有可渲染实体的基类 | 面向对象封装，组合 SpriteRenderer |
| BallObject | 球（继承 GameObject），含物理运动 | 继承与多态，物理更新循环 |
| GameLevel | 从文本文件加载关卡砖块布局 | 文件 I/O、网格生成、条件渲染 |
| ParticleGenerator | 粒子系统（尾迹特效） | 实例渲染、混合模式、动画循环 |
| PostProcessor | 后处理（震屏、混乱、边缘检测） | FBO/MSAA、卷积核、全屏四边形 |
| TextRenderer | 基于 FreeType 的文字渲染 | 纹理四边形、Alpha 混合、Dynamic VBO |
| Game | 游戏主控类，协调所有子系统 | 状态机、DeltaTime、输入处理 |


## 三、各组件详解

### 3.1 主循环 (program.cpp)

标准的游戏循环模式：Init → [ ProcessInput → Update → Render ] × N 帧 → Cleanup：


```

Breakout.Init();

while (!glfwWindowShouldClose(window)) {
    float currentFrame = glfwGetTime();
    deltaTime = currentFrame - lastFrame;
    lastFrame = currentFrame;

    glfwPollEvents();
    Breakout.ProcessInput(deltaTime);
    Breakout.Update(deltaTime);

    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT);
    Breakout.Render();

    glfwSwapBuffers(window);
}
ResourceManager::Clear();

```


这个循环模式是所有游戏引擎的基本节拍，Unity 的 `Update()`、Unreal 的 `Tick()` 本质相同。

### 3.2 ResourceManager（资源管理器）

使用静态工厂模式 + 缓存（std::map），按名称加载和获取 Shader 与 Texture：


```

static std::map<std::string, Shader>    Shaders;
static std::map<std::string, Texture2D> Textures;

static Shader   LoadShader(const char *vFile, const char *fFile,
                           const char *gFile, std::string name);
static Texture2D LoadTexture(const char *file, bool alpha, std::string name);
static void     Clear();  // 程序退出时释放所有 GPU 资源

```

> **引擎对比**：Unity 的 Resources.Load()、Unreal 的 UObject 引用系统、Godot 的 ResourceLoader，核心都是"按路径加载 + 缓存 + 引用计数"。ResourceManager 是它们的微型演示。


### 3.3 SpriteRenderer（精灵渲染器）

封装了四边形渲染的所有细节：


- 初始化阶段创建 VBO + VAO，定义顶点布局（位置 2D + 纹理坐标 2D）
- 渲染时将 model 矩阵（平移 → 旋转 → 缩放）应用到四边形上
- 支持纹理绑定和颜色调制


### 3.4 游戏对象系统

`GameObject` 是基类，包含位置、大小、速度、颜色、纹理、刚体标志。 `BallObject` 继承自 GameObject，增加半径、黏着状态和 AABB 碰撞逻辑：


```cpp

class BallObject : public GameObject {
    float Radius;
    bool  Stuck;    // 是否黏在挡板上
    bool  Sticky;   // 碰到砖块不反弹（道具效果）
    bool  PassThrough; // 穿透砖块（道具效果）

    glm::vec2 Move(float dt, unsigned int window_width);
    void Reset(glm::vec2 position, glm::vec2 velocity);
};

```


### 3.5 关卡系统

关卡数据存储为文本文件，每行表示一行，数字代表砖块类型：1=实心砖（不可摧毁）、2=普通砖、3=奖励砖等。


```

// 关卡文件示例
1 1 1 1 1 1 1 1 1 1
2 2 2 2 2 2 2 2 2 2
3 3 0 3 3 0 3 3 0 3

```


`GameLevel::Load()` 解析文件，`GameLevel::init()` 根据网格尺寸计算每个砖块的位置并创建 GameObject。

### 3.6 粒子系统

粒子系统为球拍撞击砖块时产生尾迹效果：


- 对象池模式：预分配固定数量粒子
- 每个粒子有位置、速度、颜色、Alpha 生命值
- `Update()` 减少生命值，回收已死亡的粒子
- 使用添加剂混合（SRC_ALPHA, ONE）产生发光效果


### 3.7 后处理特效

PostProcessor 使用 **多采样 FBO**（MSAA）先渲染场景，再将结果 blit 到普通纹理后应用全屏后处理着色器：


- **Shake（震屏）** — 对纹理坐标添加时间相关的偏移
- **Confuse（混乱）** — 反转纹理坐标，产生镜像效果
- **Chaos（混沌）** — 边缘检测卷积核，产生卡通轮廓

```

// PostProcessor 初始化
glGenFramebuffers(1, &this->MSFBO);          // 多采样 FBO
glGenFramebuffers(1, &this->FBO);             // 中间 FBO
glRenderbufferStorageMultisample(..., 4, ...); // 4x MSAA

// 后处理着色器中应用卷积核
int edge_kernel[9] = {
    -1, -1, -1,
    -1,  8, -1,
    -1, -1, -1
};

```


## 四、从这堂课到商业引擎

这个 Breakout 游戏虽然只有几千行代码，但它包含了游戏引擎的所有基础模块。下面这张映射表让你直观理解：学完这些课，你其实已经掌握了 3D 引擎渲染层的核心原理。

## 五、OpenGL 概念 ↔ 引擎概念映射表


| OpenGL / LearnOpenGL | Unity | Unreal Engine | Godot |
| --- | --- | --- | --- |
| VAO / VBO | Mesh 内部缓存 | FStaticMeshVertexBuffer | ArrayMesh 内部数据 |
| Shader | Shader / ShaderGraph | UMaterial / Material Graph | ShaderMaterial / VisualShader |
| FBO + 多渲染目标 | Camera stack / RenderTexture | SceneCapture / RenderTarget | Viewport / BackBufferCopy |
| 纹理 / 采样器 | Texture2D | UTexture2D | Texture2D / ImageTexture |
| 变换矩阵 | Transform 组件 | USceneComponent 层级 | Transform2D / Transform3D |
| 光照计算 | Light 组件 + Standard Shader | ULightComponent + Lit Material | Light3D + SpatialMaterial |
| PBR | Standard Shader | Lit Shader（默认） | SpatialMaterial（ORM 纹理） |
| 阴影映射 | Shadow Map（方向光/点光源） | Shadow Map + Cascaded Shadow Maps | OmniLight / DirectionalLight 阴影 |
| HDR + Tone Mapping | Post Processing Stack | PostProcessVolume | WorldEnvironment |
| 延迟渲染 | Deferred Rendering Path | Deferred Shading（默认） | Forward+（默认） |
| IBL / 环境贴图 | Reflection Probe | Reflection Capture | ReflectionProbe |
| 帧缓冲后处理 | Post Processing V2 | PostProcessMaterial | WorldEnvironment + ColorRect |
| 粒子系统 | Particle System / VFX Graph | Niagara / Cascade | GPUParticles2D/3D |
| 碰撞检测 | Physics (BoxCollider etc.) | UCollisionComponent | CollisionShape2D/3D |
| 资源管理 | Resources / Addressables | UObject / Package System | ResourceLoader / .import |
| 文字渲染 | TextMeshPro | UFont / Slate / TextRender | Label / RichTextLabel |
| 音效 | AudioSource | UAudioComponent | AudioStreamPlayer2D/3D |
| DeltaTime 游戏循环 | MonoBehaviour.Update() | Actor.Tick() | Node._process(delta) |


## 六、总结：你已走完的旅程


> [!INFO]
> **回顾全课程路线图**


从最基础的窗口创建开始，你学习了：


1. **基础阶段**：窗口创建 → 三角形 → 着色器 → 纹理 → 变换 → 坐标系 → 摄像机
2. **光照阶段**：光照基础 → 材质 → 光照贴图 → 投光物 → 多光源 → Blinn-Phong
3. **模型加载**：Assimp 库 → Mesh 类 → Model 类
4. **高级 OpenGL**：模板测试 → 混合 → 面剔除 → 帧缓冲 → Cubemap → 实例化 → 抗锯齿
5. **高级光照**：Gamma 校正 → 阴影映射（方向光/点光源/CSM） → 法线贴图 → 视差贴光 → HDR → Bloom → 延迟渲染 → SSAO
6. **最终章**：PBR → IBL → 调试/文字 → Breakout 游戏引擎

> **你现在具备了怎样的能力？**
> 你能打开 Unity 的 Frame Debugger，看到每一帧的 Draw Call、Shader 切换、FBO 绑定——理解每一行背后发生的事。
>
> 你能阅读 Unreal 的 Shader 源码，理解材质编辑器节点最终翻译成的 GLSL/HLSL。
>
> 你能在 Godot 中自定义 ShaderMaterial，从零写出 PBR 光照和屏幕后处理效果。
>
> 本质上，**你已经能看懂任何一个现代 3D 引擎的渲染层了**。


## 七、练习：最后的挑战


> [!INFO]
> **练习 1：添加新关卡**
> 按关卡文件格式创建一个新的 .txt 关卡文件，在 Breakout 中加载并测试。

> [!INFO]
> **练习 2：新增道具**
> 参考已有的 PowerUp 系统（黏着、穿透、扩大挡板），新增一个"多球分裂"道具：吃到后球一分为三。

> [!INFO]
> **练习 3：3D 扩展**
> 将 SpriteRenderer 扩展为 3D ModelRenderer，将游戏场景改为 3D 模式——你将立刻发现，所有学过的知识（变换、光照、摄像机、纹理）完全适用。

> [!INFO]
> **最后练习：用 RenderDoc 分析 Breakout**
> 用 RenderDoc 抓取 Breakout 的一帧，查看有多少 Draw Call、每个 Draw 的状态——并与 Unity/Unreal 的空场景对比。你会发现，无论多复杂的引擎，最终执行的不过是 glDrawArrays 和 glBindFramebuffer。
[← 上一课：调试与文字渲染](../lessons/0031-debugging-text.md)[返回目录 ↑](../lessons/0001-getting-started.md)