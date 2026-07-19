---
title: "第24课：阴影映射 (Shadow Mapping) | LearnOpenGL 教学"
description: 阴影是渲染中最重要的深度线索之一。没有阴影，物体会"漂浮"在场景中，缺乏空间感。本课将学习阴影映射（Shadow Mapping）——现代渲染引擎中最主流的实时
tags: [opengl, 图形学, 阴影]
date: 2025-01-01
---

# 阴影映射 (Shadow Mapping)

阴影是渲染中最重要的深度线索之一。没有阴影，物体会"漂浮"在场景中，缺乏空间感。本课将学习阴影映射（Shadow Mapping）——现代渲染引擎中最主流的实时阴影技术。

 ============================================================

## 1. 核心思想：从光源视角看世界

阴影映射的核心理念非常直观：**从光源的位置观察场景，看不到的表面就是阴影区域**。

具体来说，算法包含两个主要步骤：


1. **生成深度图**：从光源视角渲染场景，只记录每个像素的深度值
2. **阴影检测**：从摄像机视角渲染场景，将每个片段转换到光源空间，比较其深度值与深度图中记录的最近深度值

> [!INFO]
> **引擎连接：阴影的本质**
> 在 Unity 和 Unreal 中，当你开启一个方向光的阴影时，引擎做的就是这两件事。大多数阴影质量问题（如阴影锯齿、边缘闪烁）都可以从这两个步骤中找到根本原因。
 ============================================================

## 2. 两遍渲染：深度图生成

### 2.1 配置深度帧缓冲

在 `shadow_mapping.cpp` 中，第一件事是创建一个专门用于存储深度的帧缓冲：


```
const unsigned int SHADOW_WIDTH = 1024, SHADOW_HEIGHT = 1024;
unsigned int depthMapFBO;
glGenFramebuffers(1, &depthMapFBO);

// 创建深度纹理
unsigned int depthMap;
glGenTextures(1, &depthMap);
glBindTexture(GL_TEXTURE_2D, depthMap);
glTexImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT,
             SHADOW_WIDTH, SHADOW_HEIGHT, 0,
             GL_DEPTH_COMPONENT, GL_FLOAT, NULL);

// 关键：不需要颜色输出
glBindFramebuffer(GL_FRAMEBUFFER, depthMapFBO);
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT,
                       GL_TEXTURE_2D, depthMap, 0);
glDrawBuffer(GL_NONE);
glReadBuffer(GL_NONE);
```


注意 `glDrawBuffer(GL_NONE)` 和 `glReadBuffer(GL_NONE)` —— 因为我们只需要深度信息，不需要颜色输出。

### 2.2 光源空间矩阵

我们需要将场景转换到光源的视角下，方向光使用正交投影：


```cpp
glm::mat4 lightProjection = glm::ortho(-10.0f, 10.0f, -10.0f, 10.0f,
                                       near_plane, far_plane);
glm::mat4 lightView = glm::lookAt(lightPos, glm::vec3(0.0f),
                                   glm::vec3(0.0, 1.0, 0.0));
glm::mat4 lightSpaceMatrix = lightProjection * lightView;
```


对于聚光灯，可以使用透视投影以获得更精确的阴影。这个 `lightSpaceMatrix` 在第二遍渲染中被用来将世界坐标转换到光源空间。

 ============================================================

## 3. 阴影检测

在第二遍片段着色器中，核心代码如下：


```
float ShadowCalculation(vec4 fragPosLightSpace) {
    // 执行透视除法，得到 NDC 坐标 [-1, 1]
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    // 转换到 [0, 1] 范围（纹理坐标）
    projCoords = projCoords * 0.5 + 0.5;

    // 从深度图采样得到最近深度
    float closestDepth = texture(shadowMap, projCoords.xy).r;
    // 当前片段的深度
    float currentDepth = projCoords.z;

    // 比较：如果当前深度 > 最近深度，说明在阴影中
    float shadow = currentDepth > closestDepth ? 1.0 : 0.0;
    return shadow;
}
```
 ============================================================

## 4. 阴影痤疮 (Shadow Acne) 与 Peter Panning

### 4.1 Shadow Acne

当光线以一定角度照射平面时，深度图中的采样点与当前片段位置不完全对齐，导致表面自身与深度图产生自遮挡——表面上出现杂乱的条纹图案，这就是**阴影痤疮**。

解决方法：引入一个小的 **bias**（偏移量），在比较深度时将阈值略微后移：


```
float bias = max(0.05 * (1.0 - dot(normal, lightDir)), 0.005);
float shadow = currentDepth - bias > closestDepth ? 1.0 : 0.0;
```


偏移量应随光线与法线的角度变化：光线越倾斜，偏移量越大。

### 4.2 Peter Panning

如果偏移量过大，阴影会与物体分离，产生物体"漂浮"的效果——这就是 Peter Panning（彼得潘现象，像小飞侠的影子脱离身体）。

解决方法是使用更聪明的偏移策略：**正面剔除 (Front Face Culling)**。在渲染深度图时只剔除正面，只渲染背面，这样深度图记录的是物体的"背面"深度，自然消除了自遮挡：


```
glCullFace(GL_FRONT);  // 渲染深度图时剔除正面
renderScene(simpleDepthShader);
glCullFace(GL_BACK);   // 恢复
```

> [!WARNING]
> **常见陷阱**
> Shadow Acne 和 Peter Panning 是一对矛盾：偏移太小 → Acne，偏移太大 → Peter Panning。好的阴影实现需要在两者间找到平衡。引擎中的"阴影偏移"（Shadow Bias）和"法线偏移"（Normal Bias）设置就是在调节这个平衡。
 ============================================================

## 5. PCF：百分比渐近滤波

硬阴影的边缘有严重的锯齿。PCF（Percentage Closer Filtering）通过在深度图周围多次采样并取平均来产生软阴影：


```
float shadow = 0.0;
vec2 texelSize = 1.0 / textureSize(shadowMap, 0);
for (int x = -1; x <= 1; ++x) {
    for (int y = -1; y <= 1; ++y) {
        float pcfDepth = texture(shadowMap,
            projCoords.xy + vec2(x, y) * texelSize).r;
        shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;
    }
}
shadow /= 9.0;  // 3x3 邻域平均
```


采样范围越大，阴影越柔和。3x3 → 较硬阴影，5x5 → 更柔和。也可以使用泊松分布采样获得更自然的效果。

 ============================================================

## 6. 点光源阴影：立方体贴图

方向光的阴影映射只需要一个 2D 深度纹理，但**点光源**向所有方向发出光线，需要一个立方体贴图。

在 `point_shadows.cpp` 中：


```
// 创建立方体贴图深度纹理
unsigned int depthCubemap;
glGenTextures(1, &depthCubemap);
glBindTexture(GL_TEXTURE_CUBE_MAP, depthCubemap);
for (unsigned int i = 0; i < 6; ++i)
    glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X + i, 0,
                 GL_DEPTH_COMPONENT, SHADOW_WIDTH, SHADOW_HEIGHT, 0,
                 GL_DEPTH_COMPONENT, GL_FLOAT, NULL);

// 几何着色器是关键！
// 使用几何着色器在一次绘制调用中将场景渲染到立方体贴图的 6 个面
```


点光源阴影使用**几何着色器 (Geometry Shader)** 在一次绘制调用中同时渲染到立方体贴图的 6 个面。每个面对应一个视角矩阵：


```
// 6 个观察方向：+X, -X, +Y, -Y, +Z, -Z
for (unsigned int i = 0; i < 6; ++i)
    simpleDepthShader.setMat4("shadowMatrices[" + std::to_string(i) + "]",
                              shadowTransforms[i]);
```


在阴影检测阶段，通过计算片段到光源的距离，与立方体贴图中对应方向的深度值比较：


```
// 点光源阴影检测核心
float currentDepth = length(fragPos - lightPos);
float closestDepth = texture(depthCubemap, fragToLightDir).r * far_plane;
float shadow = currentDepth - bias > closestDepth ? 1.0 : 0.0;
```


点光源的 PCF 通过在立方体贴图周围沿多个方向采样来实现。

 ============================================================

## 7. CSM：级联阴影映射

单个阴影贴图的精度是固定的。靠近摄像机的物体需要高精度阴影，而远处的物体可以用较低精度。CSM (Cascaded Shadow Maps) 将视锥体分割成多个区域（级联），每个区域有独立的阴影贴图。


| Cascade | 距离范围 | 阴影贴图分辨率 | 精度特点 |
| --- | --- | --- | --- |
| Cascade 0 | 近处 | 1024x1024 | 高精度，边缘锐利 |
| Cascade 1 | 中间 | 1024x1024 | 中等精度 |
| Cascade 2 | 远处 | 1024x1024 | 较低精度，边缘柔和 |


片段着色器根据片段的深度值选择对应的级联进行采样。级联之间需要进行混合过渡以避免明显的边界跳跃。

在 `csm.cpp` 中，场景包含多个立方体在不同距离，通过分割视锥体实现了分级阴影映射：


```
// CSM 的关键：计算视锥体分割
// 通常使用对数和均匀分割的混合：
// split = lambda * log_split + (1 - lambda) * uniform_split
// 不同的分割距离对应不同的 lightSpaceMatrix
```

> [!INFO]
> **引擎连接：Unity / Unreal 的阴影设置**
> 在 Unity 中，质量设置（Quality Settings）中的 **Shadow Cascades** 选项就是 CSM 的级联数量（No Cascades / Two Cascades / Four Cascades）。Unreal Engine 的 **Dynamic Shadow Distance** 和 **Num Dynamic Shadow Cascades** 也是同样的概念。你在引擎中看到的"阴影距离"和"阴影分辨率"本质上是 CSM 各层级参数的视觉表现。
 ============================================================

## 8. 代码关键点解读

### 完整的阴影映射流程


```
// === 第一遍：从光源视角渲染深度图 ===
glViewport(0, 0, SHADOW_WIDTH, SHADOW_HEIGHT);
glBindFramebuffer(GL_FRAMEBUFFER, depthMapFBO);
glClear(GL_DEPTH_BUFFER_BIT);
simpleDepthShader.use();
simpleDepthShader.setMat4("lightSpaceMatrix", lightSpaceMatrix);
renderScene(simpleDepthShader);
glBindFramebuffer(GL_FRAMEBUFFER, 0);

// === 第二遍：正常渲染场景，使用深度图判断阴影 ===
glViewport(0, 0, SCR_WIDTH, SCR_HEIGHT);
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
shader.use();
shader.setMat4("lightSpaceMatrix", lightSpaceMatrix);
shader.setVec3("lightPos", lightPos);
glActiveTexture(GL_TEXTURE1);
glBindTexture(GL_TEXTURE_2D, depthMap);  // 传入深度图
renderScene(shader);
```
 ============================================================

## 9. 练习与实验


1. **基础阴影**：运行 `shadow_mapping` 程序，观察场景中的阴影。按 Space 切换阴影开启/关闭。
2. **观察 Shadow Acne**：将代码中的 bias 设为 0，观察地面上出现的条纹图案。然后逐步增大 bias，观察 Acne 消失和 Peter Panning 出现的过程。
3. **PCF 采样范围**：修改 PCF 的采样范围从 1 扩展到 2，观察软阴影效果的变化。
4. **修改阴影分辨率**：将 `SHADOW_WIDTH` 从 1024 改为 256 和 4096，观察阴影质量的变化。
5. **CSM 观察**：运行 `csm` 程序，移动摄像机从近到远，观察不同级联区域的阴影精度变化。
6. **思考题**：为什么方向光使用正交投影，而聚光灯使用透视投影？这两种投影方式对阴影质量有什么影响？
 ============================================================ 