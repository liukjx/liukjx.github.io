---
title: "第16课：模型加载 (Model Loading) | LearnOpenGL"
description: 经过光照阶段的学习，我们已经掌握了如何让物体在三维空间中呈现真实的明暗效果。但到目前为止，我们所有的几何体都是手动在代码中定义顶点数据——一个立方体、一个平面、
tags: [opengl, 图形学]
date: 2025-01-01
---

LearnOpenGL 教学系列 — 第0016课


# 模型加载 (Model Loading)

经过光照阶段的学习，我们已经掌握了如何让物体在三维空间中呈现真实的明暗效果。但到目前为止，我们所有的几何体都是手动在代码中定义顶点数据——一个立方体、一个平面、一个球体。在实际的游戏引擎（如 Unity、UE、Godot）中，场景中的物体都是从 3D 模型文件导入的。

本课将介绍如何使用 Assimp 库加载复杂的 3D 模型，理解模型文件的内部结构，并构建可复用的 Model 类和 Mesh 类。

## 1. Assimp 库简介

Assimp（Open Asset Import Library，开放资源导入库）是一个跨平台的 3D 模型加载库，支持导入超过 40 种 3D 模型格式，包括：


- **FBX** — Autodesk 的通用交换格式，Unity/UE 最常用的格式
- **OBJ** — 经典的 Wavefront 格式，结构简单
- **glTF** — Khronos 标准的"3D 界的 JPEG"，Web 和实时渲染的首选
- **Collada (DAE)** — 基于 XML 的交换格式
- **STL、3DS、Blend** 等


Assimp 将不同格式的模型统一解析为内部的数据结构（`aiScene`），开发者无需关心具体格式的差异。这正是引擎开发中的"适配器模式"——将多种外部格式统一为内部表示。


```cpp
#include <assimp/Importer.hpp>
#include <assimp/scene.h>
#include <assimp/postprocess.h>

Assimp::Importer importer;
const aiScene* scene = importer.ReadFile(path,
    aiProcess_Triangulate |          // 将多边形三角化
    aiProcess_GenSmoothNormals |     // 生成平滑法线
    aiProcess_FlipUVs |              // 翻转 UV（OpenGL 坐标）
    aiProcess_CalcTangentSpace);     // 计算切线空间（法线贴图用）

```

> [!INFO]
> **引擎连接：Unity 的模型导入**
>
> 当你在 Unity 中将一个 FBX 文件拖入项目时，Unity 内部做了类似 Assimp 的事情：解析文件格式，提取网格、材质、动画、骨骼数据，然后转换为 Unity 内部的 `Mesh` 和 `Material` 对象。不同之处在于 Unity 使用自己的 C++ 导入器（或 FBX SDK），并且会生成中间 Asset 文件来提高导入速度。Godot 则直接使用 Assimp 作为其模型导入后端。


## 2. 场景图结构：aiScene / aiNode / aiMesh

Assimp 将模型文件解析为一棵"场景树"（Scene Graph），其核心结构如下：

### aiScene（场景）

场景的根容器，包含所有数据：


- `mRootNode` — 根节点指针
- `mNumMeshes` / `mMeshes[]` — 所有网格的数组
- `mNumMaterials` / `mMaterials[]` — 所有材质的数组
- `mNumTextures` / `mTextures[]` — 内嵌纹理（较少使用）


### aiNode（节点）

场景图的节点，形成树状层级结构：


- `mName` — 节点名称
- `mTransformation` — 节点的本地变换矩阵（位移/旋转/缩放）
- `mNumMeshes` / `mMeshes[]` — 该节点引用的网格索引数组
- `mNumChildren` / `mChildren[]` — 子节点数组


### aiMesh（网格）

实际的几何数据：


- `mVertices[]` — 顶点位置数组
- `mNormals[]` — 法线数组
- `mTextureCoords[8][]` — 最多 8 组纹理坐标
- `mTangents[]` / `mBitangents[]` — 切线/副切线
- `mFaces[]` — 面数据（包含顶点索引）
- `mMaterialIndex` — 使用的材质索引

```
// 场景图遍历示意
void processNode(aiNode* node, const aiScene* scene) {
    // 处理当前节点的所有网格
    for (unsigned int i = 0; i < node->mNumMeshes; i++) {
        aiMesh* mesh = scene->mMeshes[node->mMeshes[i]];
        // 提取顶点数据、索引、材质...
    }
    // 递归处理子节点
    for (unsigned int i = 0; i < node->mNumChildren; i++) {
        processNode(node->mChildren[i], scene);
    }
}

```

> [!INFO]
> **引擎连接：Unity 的 Transform 层级**
>
> Unity 场景面板中的 GameObject 层级结构，本质上就是一棵场景图。每个 GameObject 的 Transform 组件对应 aiNode 的 `mTransformation`。当你将一个 FBX 模型拖入 Unity 场景时，Unity 会根据 FBX 文件内部的节点层级自动创建对应的 GameObject 层级。这在 UE 中称为 Actor 层级，在 Godot 中则是 Node 树。


## 3. Mesh 类封装

`Mesh` 类将单个网格的数据封装为可直接渲染的 OpenGL 对象。从源文件 `mesh.h` 中可以看到：

### Vertex 结构体


```cpp
struct Vertex {
    glm::vec3 Position;    // 位置
    glm::vec3 Normal;      // 法线
    glm::vec2 TexCoords;   // 纹理坐标
    glm::vec3 Tangent;     // 切线（法线贴图用）
    glm::vec3 Bitangent;   // 副切线
    int m_BoneIDs[4];      // 骨骼 ID（蒙皮动画用）
    float m_Weights[4];    // 骨骼权重
};

```


### Texture 结构体


```
struct Texture {
    unsigned int id;    // OpenGL 纹理 ID
    string type;        // 类型：diffuse / specular / normal / height
    string path;        // 文件路径（用于去重）
};

```


### setupMesh() 核心逻辑

构造函数中调用 `setupMesh()`，完成以下工作：


1. 生成 VAO、VBO、EBO
2. 将顶点数据上传到 VBO
3. 将索引数据上传到 EBO
4. 设置顶点属性指针（位置、法线、UV、切线、副切线、骨骼）


### Draw() 渲染流程

`Draw()` 方法按类型编号纹理（如 `texture_diffuse1`、`texture_diffuse2`），逐个激活纹理单元并绑定，最后通过 `glDrawElements` 绘制索引网格。


```
void Draw(Shader &shader) {
    // 1. 绑定所有纹理到对应的纹理单元
    for (unsigned int i = 0; i < textures.size(); i++) {
        glActiveTexture(GL_TEXTURE0 + i);
        // 设置纹理单元编号到着色器 uniform
        glUniform1i(glGetUniformLocation(shader.ID,
            (name + number).c_str()), i);
        glBindTexture(GL_TEXTURE_2D, textures[i].id);
    }
    // 2. 绘制 mesh
    glBindVertexArray(VAO);
    glDrawElements(GL_TRIANGLES, indices.size(),
        GL_UNSIGNED_INT, 0);
    glBindVertexArray(0);
}

```

> [!INFO]
> **引擎连接：Unity Mesh 和 Material**
>
> Unity 中的 `Mesh` 类包含 `vertices`、`normals`、`uv`、`tangents` 等数组，与我们的 Vertex 结构体一一对应。Unity 的 `Material` 类管理纹理引用和渲染状态，对应我们 Mesh 中的 `textures` 数组。区别在于 Unity 在 C# 侧管理这些数据，底层通过 Graphics API 的 GfxDevice 进行实际的缓冲区和绘制调用。


## 4. Model 类封装

`Model` 类代表一个完整的 3D 模型，封装了场景图遍历和多个 Mesh 的管理。

### 构造函数


```
Model(string const &path, bool gamma = false) : gammaCorrection(gamma) {
    loadModel(path);
}

```


### loadModel() 加载流程


1. 使用 `Assimp::Importer` 读取文件，指定后处理标志
2. 获取 `aiScene` 指针，检查有效性
3. 提取目录路径（用于加载外部纹理文件）
4. 从根节点开始递归处理


### 纹理去重优化

模型可能包含多个网格共享同一纹理文件。`Model` 类维护 `textures_loaded` 列表，在加载纹理时按路径查重，避免同一纹理被多次加载到 GPU 内存。


```
// 纹理去重逻辑
bool skip = false;
for (unsigned int j = 0; j < textures_loaded.size(); j++) {
    if (std::strcmp(textures_loaded[j].path.data(),
        str.C_Str()) == 0) {
        textures.push_back(textures_loaded[j]);
        skip = true;
        break;
    }
}

```


### 材质导入

`loadMaterialTextures()` 从 `aiMaterial` 中提取指定类型的纹理：


- `aiTextureType_DIFFUSE` → `texture_diffuse`（漫反射贴图）
- `aiTextureType_SPECULAR` → `texture_specular`（高光贴图）
- `aiTextureType_HEIGHT` → `texture_normal`（法线贴图）
- `aiTextureType_AMBIENT` → `texture_height`（高度贴图）


加载纹理使用 `stb_image.h`，支持的格式包括 JPG、PNG、TGA、BMP 等。

## 5. 主程序中的使用


```
// 使用 Model 类仅需两行代码：
Model ourModel("resources/objects/backpack/backpack.obj");

// 在渲染循环中：
shader.use();
shader.setMat4("projection", projection);
shader.setMat4("view", view);
shader.setMat4("model", model);
ourModel.Draw(shader);

```


启用深度测试使得模型的前后遮挡关系正确。

## 6. 完整的加载管线

从模型文件到屏幕渲染的完整流程：


1. **文件解析**：Assimp 读取 FBX/OBJ/glTF 文件，生成 aiScene
2. **场景图遍历**：从 aiScene->mRootNode 开始递归，收集所有 aiMesh
3. **顶点提取**：从 aiMesh 中提取位置、法线、UV、切线
4. **材质提取**：从 aiMaterial 中提取纹理路径并加载到 GPU
5. **Mesh 创建**：上传顶点数据和纹理到 OpenGL 缓冲区
6. **渲染**：在渲染循环中绑定 Shader，调用 Model::Draw()


## 7. 练习


> [!INFO]
> **练习：加载一个自定义模型**
> 1. 下载任意一个 glTF 或 OBJ 格式的 3D 模型（如 Sketchfab、Free3D 等网站）
> 2. 修改程序中的模型路径，加载该模型
> 3. 如果纹理没有正确显示，检查着色器中的纹理名称是否与 Model 类生成的名称一致
> 4. 尝试在模型周围添加多个光源，验证法线贴图是否正确
> 5. 进阶：修改 Model 类以支持 `aiProcess_JoinIdenticalVertices` 标志
