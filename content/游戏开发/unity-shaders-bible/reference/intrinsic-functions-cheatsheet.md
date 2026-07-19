---
title: "内置函数速查表"
tags: [unity, shader, rendering, reference]
type: reference
---

# 内置函数速查表

Cg/HLSL 内置函数完整参考。所有函数在 **HLSL、Cg、GLSL** 中均可使用（个别函数名可能略有差异）。

> [!info] **使用提示** - 函数支持`float` /`float2` /`float3` /`float4` 四种重载
> - 除非特别说明，返回值类型与输入类型一致
> - 精度可用`half` 或`fixed` 替换`float` 以提升性能

## 一、数学基础

## 二、取整

## 三、阶跃与插值

## 四、向量运算

## 五、三角函数

## 六、指数与幂

## 七、符号与判断

## 八、常用模式速记

| 模式 | 公式 | 效果 |
| --- | --- | --- |
| 闪烁 | `abs(sin(t * speed))` | 0-1 快速切换 |
| 脉动 | `sin(t * speed) * 0.5 + 0.5` | 0-1 平滑呼吸 |
| 流动 | `uv.x += t * speed` | 纹理滚动 |
| 波动 | `sin(uv.x * freq + t * speed)` | 旗帜/水面 |
| 圆形 | `length(uv - center) < radius` | 绘制圆形 |
| 遮罩 | `step(edge, uv.y)` | 硬裁剪 |
| 柔化遮罩 | `smoothstep(a, b, uv.y)` | 羽化边缘 |
| 网格平铺 | `frac(uv * n)` | N×N 重复网格 |
| 漫反射 | `max(0, dot(N, L))` | 兰伯特光照 |

> [!tip] **跨引擎对照** Cg/HLSLGLSL说明lerp(a, b, n)mix(a, b, n)线性插值frac(x)fract(x)小数部分saturate(x)clamp(x, 0, 1)钳制到 [0,1]step(x, e)step(x, e)完全相同smoothstep(a, b, x)smoothstep(a, b, x)完全相同

参考：《The Unity Shaders Bible》第 I 章 · 更新于 2026-07