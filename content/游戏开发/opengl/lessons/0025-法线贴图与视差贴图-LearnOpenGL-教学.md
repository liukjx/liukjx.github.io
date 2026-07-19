---
title: 第0025课：法线贴图与视差贴图 | LearnOpenGL 教学
description: 低多边形模型性能好但细节不足，高多边形模型细节丰富但性能开销大。有没有办法让低模看起来像高模？这就是法线贴图和视差贴图要解决的问题——它们是"用计算换几何"的经
tags: [opengl, 图形学, 光照]
date: 2025-01-01
---

# 法线贴图与视差贴图

低多边形模型性能好但细节不足，高多边形模型细节丰富但性能开销大。有没有办法让低模看起来像高模？这就是**法线贴图**和**视差贴图**要解决的问题——它们是"用计算换几何"的经典代表。

 ============================================================

## 1. 法线贴图：欺骗光照的魔法

### 1.1 基本原理

法线贴图是一张纹理，其 RGB 通道编码了**法线方向**（Normal Direction）。每个像素不再只是一张"颜色图"，而是告诉渲染器"这个位置的法线应该指向哪里"。

法线编码方式：


```
// 法线从 [-1, 1] 映射到 [0, 1] 进行存储
normal.r = (normal.x + 1.0) / 2.0;   // → R 通道
normal.g = (normal.y + 1.0) / 2.0;   // → G 通道
normal.b = (normal.z + 1.0) / 2.0;   // → B 通道（通常最强）

// 采样时反向还原：
vec3 normal = texture(normalMap, texCoords).rgb;
normal = normalize(normal * 2.0 - 1.0);  // 还原到 [-1, 1]
```


法线贴图中的蓝色调（`vec3(0.5, 0.5, 1.0)` 对应 `vec3(0, 0, 1)`）意味着大部分区域是"平的"（朝向 +Z 方向），只有凹凸区域才有颜色变化。

### 1.2 效果对比

在 `normal_mapping.cpp` 中，一个简单的四边形通过法线贴图呈现出砖墙的凹凸感，而实际的几何体只是一个平面：


```
// 加载漫反射贴图和法线贴图
unsigned int diffuseMap = loadTexture("brickwall.jpg");
unsigned int normalMap  = loadTexture("brickwall_normal.jpg");

shader.use();
shader.setInt("diffuseMap", 0);
shader.setInt("normalMap", 1);
```

> [!INFO]
> **引擎连接：Unity 的 Normal Map 导入**
> 在 Unity 中，导入纹理时将 Texture Type 设置为 **Normal Map**，引擎会自动处理法线贴图解码（将颜色转换为法线方向）。勾选 **Create from Grayscale** 还可以从灰度图生成法线贴图。Unreal Engine 也有完全相同的设置，称为 **Texture Group: NormalMap**。
 ============================================================

## 2. 切线空间 (Tangent Space)

法线贴图中的法线是在**切线空间**中定义的，而不是世界空间。为什么？


- **可重用性**：一张法线贴图可以贴在任何方向、任何形状的模型上
- **压缩性**：切線空间的法线变化更平滑，便于压缩
- **独立性**：法线方向相对于表面，不受模型变换影响


切线空间由三个基向量定义：


```
// TBN 矩阵的构建
vec3 T = normalize(tangent);      // 切线（沿着纹理 U 方向）
vec3 B = normalize(bitangent);    // 副切线（沿着纹理 V 方向）
vec3 N = normalize(normal);       // 法线

// TBN 矩阵：从切线空间转换到世界空间
mat3 TBN = mat3(T, B, N);
```


如果只需要将世界空间的向量转换到切线空间（更高效——因为你在片段着色器中只需要变换光照方向和视线方向）：


```
// TBN 的逆矩阵 = 其转置（因为 TBN 是正交矩阵）
mat3 TBN_inv = transpose(mat3(T, B, N));
// 将光照和视线转换到切线空间
vec3 lightDir = TBN_inv * worldLightPos;
vec3 viewDir  = TBN_inv * worldViewPos;
```


### 2.2 TBN 矩阵的计算

在 `normal_mapping.cpp` 的 `renderQuad()` 中，切线是在 CPU 端通过三角形顶点和 UV 坐标计算出来的：


```cpp
// 根据三角形边缘向量和 UV 差计算切线
glm::vec3 edge1 = pos2 - pos1;
glm::vec3 edge2 = pos3 - pos1;
glm::vec2 deltaUV1 = uv2 - uv1;
glm::vec2 deltaUV2 = uv3 - uv1;

float f = 1.0f / (deltaUV1.x * deltaUV2.y - deltaUV2.x * deltaUV1.y);

tangent1.x = f * (deltaUV2.y * edge1.x - deltaUV1.y * edge2.x);
tangent1.y = f * (deltaUV2.y * edge1.y - deltaUV1.y * edge2.y);
tangent1.z = f * (deltaUV2.y * edge1.z - deltaUV1.y * edge2.z);
```

> [!INFO]
> **引擎连接：引擎自动计算切线**
> 在 Unity 和 Unreal 中，导入模型时引擎会自动计算切线向量（如果模型不包含切线数据）。这就是为什么你需要确保 FBX 导出时包含切线和法线信息，否则光照可能会出现奇怪的断裂。Unity 的 Model Import Settings 中有 **Calculate Tangent Space** 选项。
 ============================================================

## 3. 视差贴图：让砖缝"真的"有深度

法线贴图能欺骗光照，但无法产生**视差效果**——当你改变视角时，砖缝之间应该是相互遮挡的，但法线贴图做不到这一点。

视差贴图（Parallax Mapping）通过一张**高度图**（Height Map / Depth Map）和根据视角**偏移 UV 坐标**来模拟这种遮挡效果。

### 3.1 基本视差映射


```
// 在 tangent space 中计算
vec3 viewDir = normalize(fragViewDir);
float height = texture(depthMap, texCoords).r;

// 根据视角方向和高度偏移 UV
vec2 parallaxOffset = viewDir.xy / viewDir.z * height * heightScale;
vec2 finalTexCoords = texCoords - parallaxOffset;

// 用偏移后的 UV 采样漫反射和法线贴图
```


关键参数 `heightScale` 控制视差效果的强度。在 `parallax_mapping.cpp` 中，使用 Q 和 E 键调整：


```
if (glfwGetKey(window, GLFW_KEY_Q) == GLFW_PRESS) {
    if (heightScale > 0.0f) heightScale -= 0.0005f;
    else heightScale = 0.0f;
}
else if (glfwGetKey(window, GLFW_KEY_E) == GLFW_PRESS) {
    if (heightScale < 1.0f) heightScale += 0.0005f;
    else heightScale = 1.0f;
}
```


### 3.2 陡峭视差映射

基本的视差映射在视角倾斜时效果会严重退化。陡峭视差映射（Steep Parallax Mapping）通过**分层采样**来提高精度：


- 将深度范围均匀分成 N 层（如 8-32 层）
- 从顶层开始逐层向下采样高度
- 找到高度图中"穿过"表面的那一层
- 用该层的偏移量作为最终 UV 偏移


分层越多，效果越精确，但性能开销也越大。

### 3.3 视差遮蔽映射

陡峭视差映射找到了穿过表面的两层之间（一层在表面上，一层在表面下），但输出的位置是离散的——这会导致阶梯状的视觉伪影。

**视差遮蔽映射（Parallax Occlusion Mapping, POM）** 在陡峭视差映射的结果基础上进行**线性插值**：


```
// 在穿过表面的相邻两层之间进行插值
float weight = afterDepth / (afterDepth - beforeDepth);
vec2 finalOffset = beforeOffset * weight + afterOffset * (1.0 - weight);
```


POM 是目前游戏中最广泛使用的视差贴图技术，能在相对较低的性能开销下提供令人信服的三维深度感。


| 技术 | 精度 | 性能 | 使用范围 |
| --- | --- | --- | --- |
| 基本视差映射 | 低 | 最快 | 轻度凹凸表面 |
| 陡峭视差映射 | 中 | 中等 | 中等深度表面 |
| 视差遮蔽映射 | 高 | 较慢 | 高质量复杂表面 |

> [!INFO]
> **引擎连接：Unity 的 Parallax 材质选项**
> 在 Unity 的 Standard Shader 中，有一个 **Parallax Map** 纹理槽。当放入高度图后，Unity 会自动启用视差遮蔽映射。效果在 Brick 材质等有明显凹凸感的表面上尤为明显——旋转视角时可以看到砖块之间的相互遮挡。Unreal Engine 的 Material Editor 中也有 **Parallax Occlusion Mapping** 节点，同样需要高度图和法线贴图的配合。
 ============================================================

## 4. 代码关键点解读

### 4.1 法线贴图渲染流程


```
// normal_mapping.cpp
// 1. 计算 TBN 矩阵（在顶点着色器中或 CPU）
// 2. 在片段着色器中采样法线贴图
// 3. 将法线从切线空间转换到世界空间
// 4. 用转换后的法线进行光照计算

// 片段着色器核心代码：
vec3 normal = texture(normalMap, texCoords).rgb;
normal = normalize(normal * 2.0 - 1.0);  // 解码
normal = normalize(TBN * normal);        // 转到世界空间
```


### 4.2 视差贴图渲染流程


```
// parallax_mapping.cpp
// 1. 在片段着色器中将视线和光照方向转换到切线空间
// 2. 根据高度图和视线方向计算 UV 偏移
// 3. 用偏移后的 UV 坐标采样漫反射和法线贴图
// 4. 进行正常的光照计算
```


### 4.3 顶点属性的布局对比

普通的四边形顶点属性：


```
// 位置(3) + 法线(3) + UV(2) = 8 个 float
// 而在法线贴图/视差贴图示例中：
// 位置(3) + 法线(3) + UV(2) + 切线(3) + 副切线(3) = 14 个 float
```


法线贴图需要额外的切线（tangent）和副切线（bitangent）属性，它们是构建 TBN 矩阵的输入。

 ============================================================

## 5. 综合示例：完整的 POM 表面

在 `parallax_occlusion_mapping.cpp` 中，一个旋转的四边形通过法线贴图 + POM 实现了令人惊叹的立体感：


```cpp
// 渲染循环中旋转四边形以展示视差效果
model = glm::rotate(model,
    glm::radians((float)glfwGetTime() * -10.0f),
    glm::normalize(glm::vec3(1.0, 0.0, 1.0)));
shader.setMat4("model", model);
```


当四边形旋转时，砖缝的相互遮挡关系会随视角实时变化——这是纯法线贴图做不到的。

 ============================================================

## 6. 性能考量


- **法线贴图**：几乎无额外性能开销（只需额外一次纹理采样 + 几次着色器运算）
- **基本视差贴图**：轻微开销（一次额外纹理采样 + 数学运算）
- **陡峭视差贴图**：N 次纹理采样（N 为层数），可通过角度自适应减少层数
- **POM**：N 次纹理采样 + 额外插值运算，是最重但效果最好的


现代引擎通常采用**自适应分层**策略：视角越倾斜，层数越多；视角越正对表面，层数越少。

 ============================================================

## 7. 练习与实验


1. **法线贴图观察**：运行 `normal_mapping` 程序，观察旋转的砖墙表面。在代码中分别查看漫反射贴图和法线贴图的效果（注释掉法线贴图采样，只使用表面法线）。
2. **切线空间可视化**：修改着色器，将 TBN 向量的方向（T、B、N）作为颜色输出，观察它们的分布。
3. **视差效果对比**：运行 `parallax_mapping` 程序，按 Q/E 调整 `heightScale` 参数，观察视差强度变化。当 `heightScale = 0` 时，效果等同于纯法线贴图。
4. **POM vs 基本视差**：对比 `parallax_mapping` 和 `parallax_occlusion_mapping` 的效果，在倾斜视角下观察基本视差贴图的伪影（UV 偏移不准确导致的扭曲）以及 POM 对此的改善。
5. **思考题**：法线贴图是在切线空间还是在世界空间中计算光照效率更高？为什么？
 ============================================================ 