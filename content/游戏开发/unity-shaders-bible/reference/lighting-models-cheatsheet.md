---
title: "光照模型公式与对比速查表"
tags: [unity, shader, rendering, reference]
type: reference
---

# 光照模型公式与对比速查表

本表汇总了 *The Unity Shaders Bible* 第 7-8 章中涉及的所有光照模型公式、Shader 实现要点和跨引擎对比。

## 一、光照公式速查

### 1.1 环境光（Ambient Color）

**光照公式**：`ambient = UNITY_LIGHTMODEL_AMBIENT × _Ambient`

**输入**：全局环境颜色 + 强度标量 [0, 1]

**输出**：float3 RGB 环境色

**Unity 变量**：`UNITY_LIGHTMODEL_AMBIENT`

**说明**：最简单的全局光照近似，无方向性。在 Unity 中通过 Lighting 窗口的 Environment 面板配置。

### 1.2 Lambert 漫反射

**光照公式**：`D = Dr× Dl× max(0,n·l)`

**输入**：法线 n，光照方向 l，光源颜色 `Dr`，光源强度 `Dl`

**输出**：float3 RGB 漫反射色

**Unity 变量**：`_WorldSpaceLightPos0`（光照方向）、`_LightColor0`（光源颜色）

### 1.3 Blinn-Phong 高光反射

**光照公式**：

`h= normalize(l+e)`（半程向量）

`S = Sa× Sp× max(0,n·h)p`

**输入**：法线 n，光照方向 l，视线方向 e，高光颜色 `Sa`，高光强度 `Sp`，指数 `p` [1, 128]

**输出**：float3 RGB 高光色

**Unity 变量**：`_WorldSpaceCameraPos`（相机位置，用于计算视线方向）

### 1.4 环境反射（Cubemap）

**光照公式**：

`r= reflect(e,n) =e− 2n(n·e)`

`cubemap = texCUBElod(samplerCUBE, float4(r, detail))`

`reflection = intensity × cubemap.rgb × (cubemap.a × exposure)`

**快捷方法**：`UNITY_SAMPLE_TEXCUBE(unity_SpecCube0, reflect_world)`

**输出**：float3 RGB 环境反射色

### 1.5 Fresnel 效应（菲涅尔效应）

**光照公式**：

`F = pow(1 − saturate(n·e), power)`

**输入**：法线 n，视线方向 e，指数 power

**输出**：float（标量，范围 [0, 1]）

**物理意义**：视线与法线夹角越大（掠射角），反射越强

### 1.6 Schlick Fresnel 近似（PBR）

**公式**：

`F(θ) = F0 + (1 − F0) × (1 − cosθ)5`

其中 `cosθ = saturate(n·e)`，`F0` 为法线入射反射率

**F0 参考值**：

| 材质 | 类型 | F0 |
| --- | --- | --- |
| 水 | 非金属 | 0.02 |
| 玻璃 | 非金属 | 0.04 |
| 塑料 | 非金属 | 0.04-0.05 |
| 钻石 | 非金属 | 0.17 |
| 铁 | 金属 | 0.56 |
| 金 | 金属 | 0.71 |
| 银 | 金属 | 0.95 |

## 二、标准 Lighting 函数实现模板

### 2.1 LambertShading

### 2.2 SpecularShading (Blinn-Phong)

### 2.3 AmbientReflection (Cubemap)

### 2.4 Fresnel 效应

## 三、Unity 内置变量速查

| 变量名 | 类型 | 说明 | 所属 |
| --- | --- | --- | --- |
| `UNITY_LIGHTMODEL_AMBIENT` | float4 | 环境光颜色 | UnityCG.cginc |
| `_WorldSpaceLightPos0` | float4 | 方向光方向（世界空间） | UnityCG.cginc |
| `_LightColor0` | float4 | 光源颜色 | 需手动声明 |
| `_WorldSpaceCameraPos` | float3 | 相机位置（世界空间） | UnityCG.cginc |
| `_ProjectionParams` | float4 | x: 翻转标志, y: Znear, z: Zfar, w: 1/Zfar | 内置 |
| `_ScreenParams` | float4 | x: 宽度, y: 高度, z: 1+1/宽, w: 1+1/高 | 内置 |
| `unity_ObjectToWorld` | float4x4 | 物体→世界矩阵 | 内置 |
| `unity_WorldToObject` | float4x4 | 世界→物体矩阵 | 内置 |
| `unity_SpecCube0` | samplerCUBE | 默认反射探针 | 内置 |
| `_ShadowMapTexture` | sampler2D | 阴影贴图（Built-in RP） | AutoLight.cginc |

## 四、PBR 参数对照表

| Unity Standard | Unreal Engine | Filament | Three.js | 物理意义 |
| --- | --- | --- | --- | --- |
| Albedo | Base Color | BaseColor | color / map | 表面基础颜色（非金属的漫反射色 / 金属的 F0） |
| Metallic | Metallic | Metallic | metalness | 金属度：0=绝缘体, 1=导体 |
| Smoothness | Roughness（反向） | Roughness | roughness（反向） | 表面光滑程度（1=完美镜面, 0=完全粗糙） |
| Normal | Normal | Normal | normalMap | 法线贴图（切线空间） |
| Occlusion | Ambient Occlusion | Ambient Occlusion | aoMap | 环境光遮蔽 |
| Emission | Emissive Color | Emissive | emissive / emissiveMap | 自发光（不受光照影响） |

## 五、阴影映射速查

### 5.1 Built-in RP 阴影宏

| 宏 | 使用位置 | 作用 |
| --- | --- | --- |
| `V2F_SHADOW_CASTER` | v2f 结构体 | 声明阴影投射所需的插值器 |
| `TRANSFER_SHADOW_CASTER_NORMALOFFSET(o)` | vert 函数 | 变换顶点坐标 + 法线偏移 |
| `SHADOW_CASTER_FRAGMENT(i)` | frag 函数 | 输出阴影深度值 |
| `SHADOW_COORDS(n)` | v2f 结构体 | 声明阴影 UV 坐标在 TEXCOORD[n] |
| `TRANSFER_SHADOW(o)` | vert 函数 | 计算阴影 UV 坐标 |
| `SHADOW_ATTENUATION(i)` | frag 函数 | 获取阴影衰减值 [0, 1] |

### 5.2 URP 阴影关键函数

| 函数/宏 | 所在文件 | 作用 |
| --- | --- | --- |
| `TransformObjectToHClip()` | Core.hlsl | 物体空间→齐次裁剪空间 |
| `GetVertexPositionInputs()` | ShaderVariablesFunctions.hlsl | 获取顶点位置信息 |
| `GetShadowCoord()` | Shadows.hlsl | 计算阴影坐标 |
| `GetMainLight(shadowCoord)` | Lighting.hlsl | 获取主光源信息（含阴影衰减） |

### 5.3 常见阴影问题及解决方案

| 问题 | 现象 | 解决方案 |
| --- | --- | --- |
| Shadow Acne（阴影锯齿） | 表面条带状闪烁 | 增加 Depth Bias |
| Peter Panning（阴影漂浮） | 阴影与物体分离 | 减小 Depth Bias 或调整 Normal Bias |
| 锯齿边缘 | 阴影边缘有锯齿 | 提高 Shadow Map 分辨率 / 开启 PCF |
| 阴影完全消失 | 所有阴影不见了 | 检查 Light Mode 标签和 Shader 变体编译 |

## 六、引擎光照模型跨平台对比

| 功能 | Unity (Built-in) | Unity (URP) | Unreal Engine | Godot | Three.js |
| --- | --- | --- | --- | --- | --- |
| Shader 语言 | CG/HLSL | HLSL | HLSL (USD) | GLSL (Godot Shader) | GLSL (WebGL) |
| 默认光照模型 | Standard (Cook-Torrance) | Lit (Cook-Torrance) | Default Lit (Cook-Torrance) | StandardMaterial3D | MeshStandardMaterial |
| PBR 工作流 | Metallic / Specular | Metallic | Metallic | Metallic / Specular | Metallic / Specular |
| PBR 工作流 | Surface Shader | Shader Graph / HLSL | Material Graph | Shader Graph (4.0+) | Material (JS) |
| 阴影默认方法 | Shadow Mapping + PCF | Shadow Mapping + PCF | Shadow Mapping / DF Soft | Shadow Mapping + PCF | Shadow Mapping + PCF |
| 环境反射 | Reflection Probe | Reflection Probe | Reflection Capture | ReflectionProbe | CubeCamera / envMap |

## 七、推荐资源

- **书籍**：*The Unity Shaders Bible*（本课教材）Chapters 6-8
- **书籍**：*Real-Time Rendering, 4th Edition* (Möller et al.) — 实时渲染圣经
- **文档**：Unity Manual — [Surface Shader](https://docs.unity3d.com/Manual/SL-SurfaceShaders.html)
- **文档**：Catlike Coding — [Rendering 系列教程](https://catlikecoding.com/unity/tutorials/)
- **文档**：Google Filament — [PBR 参考文档](https://google.github.io/filament/Filament.md.html)
- **工具**：[Shadertoy](https://www.shadertoy.com/) — 在线交互式 Shader 编辑器
- **工具**：[Interactive Shader Format](https://interactiveimmersive.io/) — Shader 可视化调试

---

**教材对照**：*The Unity Shaders Bible* Chapter II, Sections 6.0.1—8.0.6