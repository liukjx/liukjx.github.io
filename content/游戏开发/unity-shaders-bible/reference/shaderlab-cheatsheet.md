---
title: "ShaderLab 速查表"
tags: [unity, shader, rendering, reference]
type: reference
---

# ShaderLab 速查表

ShadeLab 是 Unity 的声明式着色器语言。本表覆盖最常见的语法模式。与 Cg/HLSL 不同，ShaderLab 属性声明结尾**不加分号**。

## 一、.shader 文件骨架

Shader "路径/名称" {
    Properties { /* 属性 */ }
    SubShader {
        Tags { "RenderType"="Opaque" }
        LOD 100
        Pass {
            CGPROGRAM
            // Cg/HLSL 代码
            ENDCG
        }
    }
    Fallback "备用着色器"
}

## 二、属性类型

| 类型 | 语法 | Inspector 控件 |
| --- | --- | --- |
| Range | `_Name ("显示名", Range(min, max)) = 默认值` | 滑条 |
| Float | `_Name ("显示名", Float) = 默认值` | 数值输入框 |
| Int | `_Name ("显示名", Int) = 默认值` | 整数输入框 |
| Color | `_Name ("显示名", Color) = (R, G, B, A)` | 颜色拾取器 |
| Vector | `_Name ("显示名", Vector) = (x, y, z, w)` | 四分量数值 |
| 2D | `_Name ("显示名", 2D) = "默认色" {}` | 纹理槽 |
| Cube | `_Name ("显示名", Cube) = "默认色" {}` | 立方体贴图槽 |
| 3D | `_Name ("显示名", 3D) = "默认色" {}` | 体积纹理槽 |

## 三、连接变量

ShaderLab 属性 → Cg/HLSL 变量：**名称必须完全一致**

| 属性类型 | 连接变量类型 | 说明 |
| --- | --- | --- |
| Color / Vector | `float4 / half4 / fixed4` | 四维向量 |
| Range / Float | `float / half / fixed` | 标量值 |
| Int | `int` | 整型 |
| 2D | `sampler2D` + `float4 _Name_ST` | 纹理 + Tiling/Offset |
| Cube | `samplerCUBE` | 立方体贴图 |
| 3D | `sampler3D` | 体积纹理 |

// 示例
sampler2D _MainTex;
float4 _MainTex_ST;   // .xy = Tiling, .zw = Offset
float4 _Color;

## 四、MaterialPropertyDrawer

| Drawer | 语法 | 用途 |
| --- | --- | --- |
| Toggle | `[Toggle] _Name ("名", Float) = 0` | 开关（搭配 #pragma shader_feature） |
| KeywordEnum | `[KeywordEnum(A,B,C)] _Name ("名", Float) = 0` | 多选下拉（搭配 #pragma multi_compile） |
| Enum | `[Enum(val, id,...)] _Name ("名", Float) = 0` | 枚举值映射（直接传值给命令） |
| PowerSlider | `[PowerSlider(n)] _Name ("名", Range(a,b)) = v` | 非线性滑条 |
| IntRange | `[IntRange] _Name ("名", Range(a,b)) = v` | 整数范围滑条 |
| Space | `[Space(n)]` | 垂直间距 |
| Header | `[Header(标题)]` | 分组标题 |

## 五、Toggle vs KeywordEnum vs Enum

|  | Toggle | KeywordEnum | Enum |
| --- | --- | --- | --- |
| 状态数 | 2 | 2–9 | 任意 |
| 生成变体 | shader_feature | multi_compile | 不生成 |
| 运行时切换 | 否 | 是 | 是（值传递） |
| 典型用途 | 启用/禁用效果 | 质量等级切换 | Cull/Blend 模式选择 |
| 转换规则 | _NAME_ON | _NAME_A _NAME_B | 直接使用 Float 值 |

## 六、渲染状态命令

| 命令 | 可选值 | 默认值 |
| --- | --- | --- |
| Cull | Back / Front / Off | Back |
| ZWrite | On / Off | On |
| ZTest | Less / Greater / LEqual / GEqual / Equal / NotEqual / Always | LEqual |
| ColorMask | R / G / B / A / 0 / 组合 | RGBA |
| AlphaToMask | On / Off | Off |
| Blend | SrcFactor DstFactor | Off |

## 七、常用 Blend 模式

Blend SrcAlpha OneMinusSrcAlpha  // 标准透明
Blend One One                      // 叠加（Additive）
Blend OneMinusDstColor One        // 柔和叠加
Blend DstColor Zero               // 乘法
Blend DstColor SrcColor           // 2x 乘法
Blend Zero OneMinusSrcColor       // 负片

## 八、Queue 标签值

| 队列 | 值 | 范围 |
| --- | --- | --- |
| Background | 1000 | 0–1499 |
| Geometry（默认） | 2000 | 1500–2399 |
| AlphaTest | 2450 | 2400–2699 |
| Transparent | 3000 | 2700–3599 |
| Overlay | 4000 | 3600–5000 |