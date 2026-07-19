---
title: "Shader Graph 速查手册"
tags: [unity, shader, rendering, reference]
type: reference
---

# Shader Graph 速查手册

本手册为 *The Unity Shaders Bible* 课程第14课的配套参考文档，汇总了 Shader Graph 中的核心概念、节点类型、常用工作流及与手写 HLSL 的对照关系。

## 一、界面核心组件速查

| 组件 | 快捷键 | 功能描述 | 等效 ShaderLab |
| --- | --- | --- | --- |
| Save Asset | Ctrl+S / Cmd+S | 保存着色器配置 | 保存 .shader 文件 |
| Blackboard（黑板） | — | 管理属性变量（颜色、纹理、Float 等） | `Properties { … }` |
| Graph Inspector | — | 节点属性 + 着色器全局设置 | 属性声明 + Pass 状态设置 |
| Main Preview | — | 实时预览效果，可导入自定义 Mesh | Game 视图 |
| 创建节点 | Space（空格键） | 搜索并创建节点 | — |
| 创建节点（右键菜单） | 右键 → Create Node | 浏览分类节点列表 | — |

## 二、Graph Inspector 设置速查

### Graph Settings（着色器全局设置）

| 设置项 | 选项 | 等效 ShaderLab 命令 |
| --- | --- | --- |
| Surface Type | Opaque / Transparent | `Blend SrcFactor DstFactor` |
| Render Face | Front / Back / Both | `Cull Back / Front / Off` |
| Alpha Clip | True / False | `clip()` |
| Blend Mode | Alpha / Premultiply / Additive / Multiply | `Blend [Src] [Dst]` |

### Node Settings（节点属性设置）

| 设置项 | 说明 |
| --- | --- |
| Name | 属性在 ShaderLab 中的引用名称 |
| Reference | 属性的内部标识符 |
| Default | 属性的默认值（颜色、浮点数等） |
| Mode | 纹理模式：White / Black / Gray / Bump |
| Precision | 计算精度：Inherit / Single (float) / Half |

## 三、常用节点分类速查

### 3.1 输入节点（Input）

| 节点 | 输出 | 等效 HLSL |
| --- | --- | --- |
| Color | Vector4 (RGBA) | `float4` 颜色常量 |
| Texture 2D Asset | Texture2D | `sampler2D _Tex` |
| Vector 1 / 2 / 3 / 4 | float / float2 / float3 / float4 | 对应维度向量 |
| Boolean | bool | `bool` |
| Time | float (Time) | `_Time` |
| UV | float2 | `i.uv` |

### 3.2 数学运算节点（Math）

| 节点 | 操作 | 等效 HLSL |
| --- | --- | --- |
| Add | A + B | `a + b` |
| Subtract | A - B | `a - b` |
| Multiply | A * B | `a * b` |
| Divide | A / B | `a / b` |
| Power | A ^ B | `pow(a, b)` |
| Square Root | sqrt(A) | `sqrt(a)` |
| Clamp | clamp(In, Min, Max) | `clamp(x, min, max)` |
| Lerp | lerp(A, B, T) | `lerp(a, b, t)` |
| Saturate | clamp(A, 0, 1) | `saturate(x)` |
| Smoothstep | smoothstep(Edge1, Edge2, In) | `smoothstep(e1, e2, x)` |
| Remap | 将 In 从一个范围映射到另一个范围 | 自定义映射公式 |
| Normalize | normalize(V) | `normalize(v)` |
| Dot Product | dot(A, B) | `dot(a, b)` |
| Cross Product | cross(A, B) | `cross(a, b)` |
| Absolute | abs(In) | `abs(x)` |
| Sign | sign(In) | `sign(x)` |
| Floor / Ceil / Round | 取整操作 | `floor / ceil / round` |
| Fraction | frac(In) | `frac(x)` |
| Minimum / Maximum | min(A, B) / max(A, B) | `min(a,b) / max(a,b)` |
| Sin / Cos / Tan | 三角运算 | `sin / cos / tan` |

### 3.3 纹理与采样节点

| 节点 | 功能 | 等效 HLSL |
| --- | --- | --- |
| Sample Texture 2D | 采样 2D 纹理 | `tex2D(tex, uv)` |
| Sample Texture 2D Array | 采样纹理数组 | `tex2Darray` |
| Texture 2D LOD | 指定 LOD 级别采样 | `tex2Dlod(tex, float4(uv,0,lod))` |
| Gather Texture 2D | 采集四个邻近纹素 | `tex2Dgather` |
| Flipbook | 精灵图动画采样 | 自定义 UV 偏移 |
| Channel Mask | 提取指定通道（R/G/B/A） | `col.r / .g / .b / .a` |

### 3.4 向量与 UV 节点

| 节点 | 功能 |
| --- | --- |
| Split | 将向量拆分为各分量（R/G/B/A 或 X/Y/Z/W） |
| Combine | 将各分量组合为向量 |
| Swizzle | 重排向量分量（如 .rbg → .grb） |
| Flip | 翻转指定的 UV 通道 |
| Twirl | UV 扭曲/漩涡效果 |
| Rotate | UV 旋转 |
| Tiling And Offset | UV 平铺与偏移 |

### 3.5 艺术效果节点

| 节点 | 功能 | 等效 HLSL（近似） |
| --- | --- | --- |
| Fresnel Effect | 菲涅尔边缘光效果 | `pow(1 - saturate(dot(N, V)), exp)` |
| Blend | 多种混合模式（Overlay / Screen / Multiply 等） | Photoshop 风格混合公式 |
| Noise | Simple / Gradient 噪波 | 伪随机函数 |
| Distortion | 基于法线贴图的 UV 扭曲 | 法线偏移 + 纹理重采样 |
| Invert Colors | 颜色反转 | `1 - col` |
| Posterize | 色调分离（减少颜色层级） | `floor(col * n) / n` |

## 四、Custom Function 节点配置速查

| 配置项 | 说明 | 示例 |
| --- | --- | --- |
| Type | File（引用 .hlsl 文件）或 String（内联代码） | File |
| Name | 函数名（必须与 HLSL 函数名完全一致） | `CustomLight_float` |
| Source | Type=File 时，指定 .hlsl 文件路径 | `CustomLight.hlsl` |
| Body | Type=String 时，直接粘贴函数代码 | `void Foo_float(...)` |
| Inputs / Outputs | 在 Graph Inspector 中定义输入输出端口 | float A, float B → float Out |

> [!tip] **常见 HLSL 模板** // 无输入，有输出
void MyFunction_float(out float3 result)
{
    result = float3(1, 0, 0);
}

// 有输入，有输出
void MyFunction_float(float3 input, out float3 output)
{
    output = normalize(input);
}

## 五、关键工作流程

### 5.1 创建基本 Unlit Shader 的流程

1. Create → Shader → Universal Render Pipeline → Unlit Shader Graph
2. 在 Blackboard 添加属性（_Color, _MainTex 等）
3. 拖入节点区，连接 Sample Texture 2D
4. 用 Multiply 节点组合颜色和纹理
5. 连接输出到 Fragment 的 Base Color
6. Save Asset

### 5.2 创建透明 Shader 的流程

1. 在 Graph Settings 中设置 Surface Type = Transparent
2. 设置 Blend Mode（Alpha / Additive 等）
3. 将 Alpha 通道连接到 Fragment 的 Alpha 输入

### 5.3 创建自定义光照 Shader 的流程

1. 创建 .hlsl 文件，写一个输出光照方向的函数
2. 添加 Custom Function 节点，引用该文件
3. 将输出连接到 Normalize 节点
4. 与法线做 Dot Product
5. Saturate 后乘以颜色

## 六、Shader Graph vs 手写 HLSL 快速对照

| Shader Graph | 手写 HLSL (.shader) |
| --- | --- |
| Blackboard 属性 | `Properties { _Name ("Display", Type) = default }` |
| Sample Texture 2D 节点 | `tex2D(_Tex, i.uv)` |
| Multiply 节点 | `a * b` |
| Graph Settings → Surface | `Blend [Src] [Dst]`, `Cull [Back/Front/Off]` |
| Graph Settings → Alpha Clip | `clip(color.a - threshold)` |
| Graph Inspector → Precision | `float` (single) 或 `half` |
| Sub Graph | 自定义函数（.hlsl include） |
| Custom Function 节点 | `void Func(in type val, out type result)` |
| Vertex 阶段 Position(3) | `float3 vertex : POSITION` |
| Fragment 阶段 Base Color | `return fixed4(color, alpha); // SV_Target` |

## 七、最佳实践与常见问题

### 最佳实践

- **善用 Sub Graph**：将常用的节点组合封装为 Sub Graph，提高复用性和可维护性。
- **命名规范**：属性命名使用下划线前缀（_Color, _MainTex），保持与 ShaderLab 传统一致。
- **精度策略**：移动端优先使用 Half 精度；需要高精度计算（如世界空间位置）使用 Single。
- **Custom Function**：复杂逻辑优先用 .hlsl 文件方式，便于版本控制和跨项目复用。
- **版本管理**：Shader Graph 不同版本间可能存在功能差异，团队内部统一 Unity 版本。

### 常见问题

| 问题 | 可能原因 | 解决方案 |
| --- | --- | --- |
| 着色器编译错误 | 节点连接了不兼容的类型或维度 | 检查节点输入输出维度（float / float2 / float3 / float4）是否匹配 |
| Custom Function 不工作 | Name 与函数名不匹配或文件路径错误 | 确认 Name 精确匹配函数名（含后缀 _float / _half） |
| 升级后无法编译 | 新版 Shader Graph 弃用了某些节点 | 查看升级指南，替换废弃节点 |
| 预览与实际渲染不一致 | Preview 中未启用 SHADERGRAPH_PREVIEW 相关逻辑 | 在 Custom Function 中处理 SHADERGRAPH_PREVIEW 分支 |
| 材质显示为粉红色 | 着色器编译失败或管线不匹配 | 检查着色器是否为当前渲染管线（URP / HDRP）兼容格式 |

> [!note]
> 本速查手册对应 *The Unity Shaders Bible* 第14课（0014-shader-graph.html），完整课程请查阅对应 HTML 文件。