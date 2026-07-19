---
title: "HLSL / Cg 基础速查表"
tags: [unity, shader, rendering, reference]
type: reference
---

# HLSL / Cg 基础速查表

本表涵盖 Unity 着色器中 HLSL/Cg 编程的核心语法元素。适用于 Built-in RP（Cg）和 URP/HDRP（HLSL）。

## 一、CGPROGRAM vs HLSLPROGRAM

|  | CGPROGRAM / ENDCG | HLSLPROGRAM / ENDHLSL |
| --- | --- | --- |
| 兼容管线 | Built-in RP | Built-in RP + URP + HDRP |
| 支持 fixed 类型 | 是 | 否（需替换为 half/float） |
| Include 路径 | `#include "UnityCG.cginc"` | `#include "Packages/.../Core.hlsl"` |
| 推荐 | 仅维护旧项目 | 新项目首选 |

// 互相转换
CGPROGRAM  →  HLSLPROGRAM
ENDCG      →  ENDHLSL
fixed      →  half 或 float
#include "UnityCG.cginc"  →  #include "Packages/.../Core.hlsl"

## 二、数据类型与精度

| 类型 | 位数 | Cg | HLSL | 典型用途 |
| --- | --- | --- | --- | --- |
| `float` | 32 | 是 | 是 | 世界空间位置、纹理 UV、高精度计算 |
| `half` | 16 | 是 | 是 | 方向向量、物体空间坐标、HDR 颜色 |
| `fixed` | 11 | 是 | 否 | 简单颜色（仅 Cg） |
| `int` | 32 | 是 | 是 | 索引、循环计数 |
| `bool` | — | 是 | 是 | 条件判断 |
| `sampler2D` | — | 是 | 是 | 2D 纹理 + 采样状态 |
| `samplerCUBE` | — | 是 | 是 | 立方体贴图 |

### 向量声明

float2 uv       = float2(0.5, 0.5);   // 2D
half3  normal   = half3(0, 1, 0);      // 3D
fixed4 color    = fixed4(1, 1, 1, 1);  // 4D 颜色
// 分量访问：color.rgba / color.xyzw / color.argb

### 矩阵声明

float3x3 rot = float3x3(1,0,0, 0,1,0, 0,0,1);
float4x4 mvp = float4x4(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);

## 三、常用语义（Semantics）

| 语义 | 阶段 | 类型 | 说明 |
| --- | --- | --- | --- |
| `POSITION` | 顶点输入 | float4 | 物体空间顶点位置 |
| `SV_POSITION` | 顶点输出 | float4 | 裁剪空间顶点位置（系统值） |
| `NORMAL` | 顶点输入 | float3/4 | 法线方向 |
| `TANGENT` | 顶点输入 | float4 | 切线（.w 为副法线方向） |
| `TEXCOORD[n]` | 输入/输出 | float2/3/4 | UV 坐标或任意插值数据 |
| `COLOR[n]` | 输入/输出 | float4 | 顶点颜色 |
| `SV_Target` | 片元输出 | float4/half4 | 渲染目标颜色 |
| `SV_IsFrontFace` | 片元输入 | bool | 当前像素是否在正面 |

## 四、Pragmas 指令

| 指令 | 说明 |
| --- | --- |
| `#pragma vertex vert` | 声明顶点着色器入口函数 |
| `#pragma fragment frag` | 声明片元着色器入口函数 |
| `#pragma multi_compile_fog` | 启用雾效变体 |
| `#pragma multi_compile A B C` | 声明着色器变体（全部保留） |
| `#pragma shader_feature A B` | 声明着色器变体（仅保留已使用的） |

## 五、标准结构体模板

### appdata（顶点输入）

struct appdata {
    float4 vertex : POSITION;
    float2 uv     : TEXCOORD0;
    // 按需添加：
    float3 normal  : NORMAL;
    float4 tangent : TANGENT;
    float4 color   : COLOR;
};

### v2f（顶点输出 → 片元输入）

struct v2f {
    float4 vertex : SV_POSITION;
    float2 uv     : TEXCOORD0;
    // 按需添加（使用 TEXCOORD[n], n ≥ 1）：
    float3 worldNormal : TEXCOORD1;
    float3 worldPos    : TEXCOORD2;
};

## 六、顶点 → 片元完整流程

// 顶点着色器
v2f vert(appdata v) {
    v2f o;
    o.vertex = UnityObjectToClipPos(v.vertex);
    o.uv     = TRANSFORM_TEX(v.uv, _MainTex);
    UNITY_TRANSFER_FOG(o, o.vertex);
    return o;
}

// 片元着色器
fixed4 frag(v2f i) : SV_Target {
    fixed4 col = tex2D(_MainTex, i.uv);
    UNITY_APPLY_FOG(i.fogCoord, col);
    return col;
}

## 七、UnityCG.cginc 常用函数

| 函数 | 功能 |
| --- | --- |
| `UnityObjectToClipPos(v)` | 物体空间 → 裁剪空间（MVP 变换） |
| `UnityObjectToWorldNormal(v)` | 物体空间法线 → 世界空间法线 |
| `UnityObjectToWorldDir(v)` | 物体空间方向 → 世界空间方向 |
| `WorldSpaceViewDir(v)` | 计算世界空间的视线方向 |
| `TRANSFORM_TEX(uv, tex)` | 应用纹理的 Tiling & Offset |
| `tex2D(sampler, uv)` | 采样 2D 纹理 |
| `lerp(a, b, t)` | 线性插值 |
| `saturate(x)` | 截断到 [0, 1] 范围 |
| `dot(a, b)` | 向量点积 |
| `normalize(v)` | 向量归一化 |

## 八、常见错误排查

| 错误症状 | 可能原因 |
| --- | --- |
| 粉色材质 | Shader 编译错误（检查控制台） |
| 属性在 Inspector 中不显示 | 属性声明末尾误加分号 `;` |
| 属性变化无反应 | 缺少同名连接变量 |
| "undeclared identifier" | 变量未声明或拼写错误 |
| 透明物体显示为不透明 | 未设置 `Queue"="Transparent"` |
| 片元着色器未执行 | 缺少 `#pragma fragment frag` |
| 使用 `fixed` 在 HLSL 中报错 | HLSL 不支持 `fixed`，替换为 `half` |