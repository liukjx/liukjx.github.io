---
title: "向量运算速查表"
tags: [unity, shader, rendering, reference]
type: reference
---

# 向量运算速查表

着色器中所有向量操作的快速参考。包含数学公式、HLSL 函数和图形学应用。

## 一、基本概念

= 方向 (Direction) + 大小 (Magnitude)

= 只有一个数值的量

| 概念 | 数学表示 | HLSL 类型 | 示例 |
| --- | --- | --- | --- |
| 2D 向量 | v = (x, y) | float2, half2, fixed2 | UV 坐标 |
| 3D 向量 | v = (x, y, z) | float3, half3, fixed3 | 位置、法线、颜色(RGB) |
| 4D 向量 | v = (x, y, z, w) | float4, half4, fixed4 | 裁剪坐标、颜色(RGBA) |
| 标量 | s = n | float, half, fixed | 亮度、距离、Alpha |

### Swizzle 操作

HLSL 允许用 `.rgba` 或 `.xyzw` 访问和重组向量分量：

## 二、核心向量运算

## 三、点积 (Dot Product) 详解

### 夹角与点积的关系

| 夹角 θ | cos(θ) | 点积值 | 图形学含义 |
| --- | --- | --- | --- |
| 0° | 1 | |a|·|b| | 表面正对光源 → 最大光照 |
| 0° < θ < 90° | (0, 1) | 正数 | 表面偏对光源 → 部分光照 |
| 90° | 0 | 0 | 表面平行光源 → 零光照 |
| 90° < θ < 180° | (-1, 0) | 负数 | 表面背对光源 → 背光面 |
| 180° | -1 | -|a|·|b| | 完全背对 → 最暗 |

### 图形学三大应用

## 四、叉积 (Cross Product) 详解

### 重要特性

- **不可交换**：a × b = -(b × a)
- **右手定则**：方向由右手螺旋定则决定
- **平行向量**：若 a ∥ b，则 a × b = 0
- **结果垂直**：a × b 同时垂直于 a 和 b

### 标准正交基示例

### 图形学应用

| 应用 | 公式 | 说明 |
| --- | --- | --- |
| TBN 构建 | B = cross(T, N) * T.w | 法线贴图的切线空间基础 |
| 法线计算 | N = cross(v2 - v1, v3 - v1) | 由三角形顶点求面法线 |
| 轴向判定 | axis = cross(refDir, targetDir) | 判断旋转轴 |

## 五、坐标空间变换

| 变换 | 矩阵 | HLSL 函数 | 说明 |
| --- | --- | --- | --- |
| 对象 → 世界 | unity_ObjectToWorld | mul(unity_ObjectToWorld, v) | 顶点位置变换 |
| 对象 → 世界 (法线) | unity_ObjectToWorld | mul((float3x3)unity_ObjectToWorld, n) | 法线方向变换，W=0 |
| 世界 → 对象 | unity_WorldToObject | mul(unity_WorldToObject, v) | 逆变换 |
| 对象 → 裁剪 | UNITY_MATRIX_MVP | UnityObjectToClipPos(v) | Built-in RP |
| 对象 → 裁剪 (URP) | — | TransformObjectToHClip(v) | URP |

> [!info] **快速记忆**
>   - **法线变换**：位置用 float4(v, 1)，方向用 float4(v, 0)
>   - **世界空间**：所有光照、摄像机相关计算的世界

## 六、常见光照公式中的向量运算

| 光照分量 | 公式 | 向量运算 |
| --- | --- | --- |
| 漫反射 (Diffuse) | max(0, dot(N, L)) | 点积 |
| 高光 (Specular) | pow(max(0, dot(N, H)), gloss) | 点积 + pow |
| 反射方向 | reflect(-L, N) | 内置 reflect 函数 |
| 半程向量 | normalize(L + V) | 加法 + 归一化 |
| 边缘光 (Rim) | 1 - max(0, dot(N, V)) | 点积 |
| 视线方向 | normalize(_WorldSpaceCameraPos - worldPos) | 减法 + 归一化 |

参考：《The Unity Shaders Bible》第 II 章 · 更新于 2026-07