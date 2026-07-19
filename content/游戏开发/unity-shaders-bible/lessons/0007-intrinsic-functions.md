---
title: "内置函数 — 着色器的数学工具箱"
tags: [unity, shader, rendering]
type: lesson
---

# 内置函数 — 着色器的数学工具箱

内置函数（Intrinsic Functions）是 CG/HLSL/GLSL 中最基础也最强大的组成部分。它们是 GPU 原生支持的数学运算，比你自己用循环实现的版本快几个数量级。

> [!info] **本课目标** 逐个学习 Cg/HLSL 中最常用的内置函数，理解它们的数学含义、图形学用途，并用可视化的方式"看到"每个函数的效果曲线。

> [!tip] **跨引擎通用性** 本课讲解的所有函数在**Cg、HLSL、GLSL** 中都是通用的。无论是在 Unity、Unreal、Godot 还是自定义引擎中，`abs()` 永远是绝对值，`lerp()` 永远是线性插值。学会一次，终身受用。

## 1. Abs — 绝对值

float abs(float n);

float2 abs(float2 n);

float3 abs(float3 n);

float4 abs(float4 n);

**数学含义：**返回一个数的绝对值。任何负数都变成正数，正数不变。

| -3 | = 3

| -5 | = 5

| 6 | = 6

输入: -0.5 → 输出: 0.5

输入: 0.3 → 输出: 0.3

输入: -1.0 → 输出: 1.0

**图形学用途：**

- **万花筒 / 镜像效果**：对 UV 坐标减去 0.5 后取绝对值，产生对称效果
- **三平面映射 (Triplanar Mapping)**：对法线取绝对值，判断投影轴向

## 2. Ceil / Floor — 向上/向下取整

#### Ceil（天花板）

float ceil(float n);

返回≥输入值的最小整数

`ceil(0.1) = 1`

`ceil(1.7) = 2`

总是"向上舍入"

#### Floor（地板）

float floor(float n);

返回≤输入值的最大整数

`floor(1.56) = 1`

`floor(0.34) = 0`

总是"向下舍入"

**图形学用途：**

- **Ceil — 缩放/放大镜效果**：配合 Lerp 实现纹理局部放大
- **Floor — 卡通着色 (Toon Shading)**：将连续的颜色梯度分成离散色块

## 3. Clamp — 限定范围

float clamp(float a, float x, float b);

// a = 最小值, x = 要限制的值, b = 最大值

**数学含义：**将值 x 限制在 [a, b] 范围内。如果 x < a 返回 a，x > b 返回 b，否则返回 x。

输入 x = -0.5，范围 [0, 1] → 输出 0

输入 x = 0.5，范围 [0, 1] → 输出 0.5

输入 x = 1.5，范围 [0, 1] → 输出 1

**图形学用途：**

- **防止颜色饱和**：将计算结果限制在 [0, 1] 之间
- **点积结果钳制**：将 [-1, 1] 的法线·光照结果 clamp 到 [0, 1]

## 4. Step / Smoothstep — 阶跃与平滑过渡（重点）

### 4.1 Step

float step(float x, float edge);

// 当 edge ≥ x 时返回 1，否则返回 0

UV.y < 0.5 → 黑色 (0)

UV.y ≥ 0.5 → 白色 (1)

──────── 阶跃 ────────>

0.0 ─── edge=0.5 ─── 1.0

黑          |          白

### 4.2 Smoothstep

float smoothstep(float a, float b, float edge);

**数学含义：**与 step 类似，但在 a 和 b 之间产生**平滑的 Hermite 插值**，而不是硬边缘。

t = saturate((edge - a) / (b - a))

return t² × (3 - 2 × t)

0.0 ──── a ══ 平滑过渡 ══ b ──── 1.0

黑    渐变上升           白

| 对比 | Step | Smoothstep |
| --- | --- | --- |
| 边缘 | 硬边缘（二元值：0 或 1） | 平滑过渡（连续值 0→1） |
| 参数数量 | 2 个（x, edge） | 3 个（a, b, edge） |
| 典型用途 | 二元遮罩、裁剪 | 边缘羽化、圆形柔化 |

## 5. Lerp — 线性插值（重点）

float lerp(float a, float b, float n);

// 返回 a + n × (b - a)

**数学含义：**在 a 和 b 之间按 n 比例插值。n=0 时返回 a，n=1 时返回 b。

t=0.0 → 纯黑

t=0.5 → 50% 灰

t=1.0 → 纯白

**图形学用途：**

- **纹理混合 (Texture Blending)**：在两张贴图之间渐变
- **淡入淡出 (Crossfade)**：在两种皮肤/颜色之间平滑过渡
- **任何需要"在两个值之间渐变"的场景**

> [!tip] **Lerp 的三个参数** 第三个参数 n 不限于 [0, 1]。如果 n < 0，lerp 会外推到 a 之外；如果 n > 1，会外推到 b 之外。这在某些特效中很有用。

## 6. Min / Max — 最小值与最大值

#### Min

float min(float a, float b);

返回 a 和 b 中较小的值

`min(3, 7) = 3`

#### Max

float max(float a, float b);

返回 a 和 b 中较大的值

`max(3, 7) = 7`

**图形学用途：**

- **Clamp 的基础**：`clamp(a, x, b) = max(a, min(x, b))`
- **漫反射光照**：`max(0, dot(normal, lightDir))` 防止背光面出现负值

## 7. Frac — 小数部分

float frac(float n);

// 返回 n - floor(n)

**图形学用途：**

- **平铺 / 重复图案**：对 UV 乘 N 后取 frac，产生网格状重复
- **噪声 / 随机**：在程序化生成中创建重复单元

## 8. Length — 向量长度

float length(float n);

float length(float2 n);

// 内部实现: sqrt(dot(n, n))

**数学含义：**返回向量的模（长度），即从原点到该点的距离。

**图形学用途：**

- **绘制圆形**：`length(UV - center) < radius`
- **距离场**：计算片元到某点的距离

## 9. Exp / Exp2 / Pow — 指数与幂

#### Exp

float exp(float n);

eⁿ（e ≈ 2.71828）

`exp(2) ≈ 7.389`

#### Exp2

float exp2(float n);

2ⁿ

`exp2(3) = 8`

#### Pow

float pow(float x, float n);

x 的 n 次幂

`pow(3, 2) = 9`

**图形学用途：**

- **Gamma 校正**：`pow(color, 2.2)` 将颜色映射到 Gamma 空间
- **光照衰减**：`pow(max(0, dot(N, L)), _Gloss)` 高光计算
- **噪声和程序化纹理**：指数函数用于创建平滑衰减

## 10. Sin / Cos / Tan — 三角函数（重点）

### 10.1 Sin / Cos

float sin(float n);

float cos(float n);

sin(0) = 0

sin(π/2) = 1

sin(π) = 0

sin(3π/2) = -1

cos(0) = 1

cos(π/2) = 0

cos(π) = -1

cos(3π/2) = 0

**图形学用途：**

- **旋转矩阵**：sin 和 cos 构成旋转矩阵的基础
- **循环动画**：sin(_Time.y) 产生 -1 到 1 的循环值
- **波动/呼吸效果**：`sin(UV.x * freq + _Time.y)`

### 10.2 Tan

Tan(θ) = Sin(θ) / Cos(θ)。它的值域比 [-1, 1] 大得多，因此图像有尖锐的峰值。

**图形学用途：**

- **全息投影线**：`abs(tan(uv.y * _Sections))` 生成扫描线效果

## 11. 函数速查表

| 函数 | 数学含义 | 典型用途 | 跨引擎 |
| --- | --- | --- | --- |
| abs(n) | 绝对值 | 镜像、万花筒 | Cg/HLSL/GLSL |
| ceil(n) | 向上取整 | 缩放效果 | Cg/HLSL/GLSL |
| floor(n) | 向下取整 | 卡通着色 | Cg/HLSL/GLSL |
| clamp(a,x,b) | 限制在[a,b] | 防止饱和 | Cg/HLSL/GLSL |
| step(x,edge) | 阶跃函数 | 硬边缘遮罩 | Cg/HLSL/GLSL |
| smoothstep(a,b,x) | 平滑阶跃 | 柔化边缘 | Cg/HLSL/GLSL |
| lerp(a,b,n) | 线性插值 | 纹理混合 | Cg/HLSL/GLSL |
| min(a,b)/max(a,b) | 最小/最大值 | 漫反射、求交 | Cg/HLSL/GLSL |
| frac(n) | 小数部分 | 重复图案 | Cg/HLSL/GLSL |
| length(v) | 向量长度 | 圆形、距离场 | Cg/HLSL/GLSL |
| exp(n)/exp2(n) | 指数 | Gamma、衰减 | Cg/HLSL/GLSL |
| pow(x,n) | 幂运算 | 高光、Gamma | Cg/HLSL/GLSL |
| sin(n)/cos(n)/tan(n) | 三角函数 | 旋转、波动 | Cg/HLSL/GLSL |

## 12. 练习与回顾

### 思考题

1. **Abs + UV**：为什么 `abs(i.uv.x - 0.5)` 能产生镜像效果？如果把 UV.y 也加上呢？
2. **Step vs. Smoothstep**：在什么场景下应该用 step，什么场景用 smoothstep？
3. **Lerp 外推**：如果 lerp 的第三个参数是 -0.5，会发生什么？
4. **三角函数**：sin 和 cos 的核心区别是什么（相位差）？为什么旋转矩阵需要同时使用两者？
5. **Length 画圆**：`length(p - center) - radius` 返回负值时表示什么？
6. **动手实验**：在 Unity 中创建两个纹理材质，用 lerp + 时间变量实现自动交叉渐变。

## 13. 教材对照

> [!info] **教材对照**
> 本课对应《The Unity Shaders Bible》第 I 章 (p.127-173)：
>   - 4.0.7 内置函数概述 (p.127)
>   - 4.0.8 Abs 函数 (p.127-132)
>   - 4.0.9 Ceil 函数 (p.132-137)
>   - 4.1.0 Clamp 函数 (p.137-141)
>   - 4.1.1 Sin / Cos 函数 (p.142-146)
>   - 4.1.2 Tan 函数 (p.147-150)
>   - 4.1.3 Exp / Exp2 / Pow 函数 (p.150-152)
>   - 4.1.4 Floor 函数 (p.152-156)
>   - 4.1.5 Step / Smoothstep 函数 (p.157-160)
>   - 4.1.6 Length 函数 (p.160-164)
>   - 4.1.7 Frac 函数 (p.164-168)
>   - 4.1.8 Lerp 函数 (p.168-171)
>   - 4.1.9 Min / Max 函数 (p.172-173)