---
title: "渲染管线速查表"
tags: [unity, shader, rendering, reference]
type: reference
---

# 渲染管线速查表

图形学通用概念，不限于 Unity。

## 渲染管线四阶段

| 阶段 | 位置 | 可编程？ | 核心任务 |
| --- | --- | --- | --- |
| 应用 (Application) | CPU | — | 场景管理、视锥体裁剪、发送图元 |
| 几何 (Geometry) | GPU | ✅ 顶点着色器 | 顶点变换（Object→Clip）、投影、裁剪 |
| 光栅化 (Rasterization) | GPU | ❌ 固定功能 | 三角形→片元（找出覆盖的像素） |
| 像素 (Pixel) | GPU | ✅ 像素着色器 | 计算像素最终颜色 |

## 坐标空间变换链

物体空间 → [M] → 世界空间 → [V] → 观察空间 → [P] → 裁剪空间 → [视口] → 屏幕坐标

- **M** (Model): 物体→世界, `unity_ObjectToWorld`
- **V** (View): 世界→观察, `UNITY_MATRIX_V`
- **P** (Projection): 观察→裁剪, `UNITY_MATRIX_P`
- **MVP** = P × V × M: 一键跳转, `UnityObjectToClipPos(v.vertex)`

## 物体属性

| 属性 | HLSL 语义 | 说明 |
| --- | --- | --- |
| 顶点位置 | `: POSITION[n]` | 物体的"骨架"点 |
| 法线 | `: NORMAL` | 垂直表面的方向 |
| 切线 | `: TANGENT` | 沿纹理 U 方向 |
| UV 坐标 | `: TEXCOORD[n]` | 纹理映射坐标 [0,1] |
| 顶点颜色 | `: COLOR` | 默认 (1,1,1,1) |

## Forward vs Deferred

|  | Forward | Deferred |
| --- | --- | --- |
| 光照计算 | 逐物体逐光源 | 统一在 G-Buffer 后计算 |
| Draw Call | 物体 × (1 + 光源数) | 物体 + 光源 |
| MSAA | ✅ 支持 | ❌ 不支持 |
| 多光源 | 性能差 | 性能好 |
| Unity 适用 | Built-in, URP, HDRP | Built-in, HDRP |

## 常用术语

- **图元 (Primitive)**: 基本的几何单元（三角形、线段、点）
- **片元 (Fragment)**: 光栅化后的候选像素
- **Draw Call**: 向 GPU 发送的一次绘制命令
- **视锥体裁剪 (Frustum Culling)**: 丢弃摄像机外的物体
- **插值 (Interpolation)**: 顶点属性在三角形面上的平滑过渡