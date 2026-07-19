---
title: 第0017课：深度测试与模板测试 | LearnOpenGL
description: 在前面的课程中，我们通过简单的 glEnable(GL_DEPTH_TEST) 开启了深度测试，解决了物体的前后遮挡问题。但深度测试远不止如此——它涉及深度值的
tags: [opengl, 图形学]
date: 2025-01-01
---

LearnOpenGL 教学系列 — 第0017课


# 深度测试与模板测试 (Depth & Stencil Testing)

在前面的课程中，我们通过简单的 `glEnable(GL_DEPTH_TEST)` 开启了深度测试，解决了物体的前后遮挡问题。但深度测试远不止如此——它涉及深度值的精度、多种比较函数、以及常见的 z-fighting 问题。而模板测试则是深度测试的"伙伴"，提供了逐像素的掩码控制能力。

本课将深入探讨 OpenGL 管线中这两个关键的逐片元测试阶段。

## 第一部分：深度测试 (Depth Testing)

## 1. 深度缓冲原理

深度缓冲（Depth Buffer，也称为 Z-Buffer）是一个与颜色缓冲大小相同的二维数组，每个像素存储一个深度值（通常为 0.0~1.0）。当每个片元即将写入颜色缓冲时，OpenGL 会先将其深度值与深度缓冲中对应位置的值进行比较：


- 如果片元通过深度测试，它的深度值会替换缓冲中的旧值
- 如果未通过，片元被丢弃


这个过程发生在片元着色器执行之后、颜色混合之前。对应源文件中可以看到启用方式：


```
glEnable(GL_DEPTH_TEST);  // 启用深度测试
glDepthFunc(GL_LESS);     // 设置深度比较函数：小于则通过

// 清除缓冲时也要清除深度缓冲
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

```

> [!WARNING]
> **关键陷阱：忘记清除深度缓冲**
>
> 如果 `glClear()` 只传了 `GL_COLOR_BUFFER_BIT` 而忘了 `GL_DEPTH_BUFFER_BIT`，上一帧的深度值会保留下来，导致新渲染的物体出现随机遮挡——这是初学者最容易犯的错误之一。


## 2. 深度测试函数

通过 `glDepthFunc()` 可以设置不同的比较函数：


| 函数 | 描述 | 典型用途 |
| --- | --- | --- |
| GL_ALWAYS | 始终通过 | 调试 / 禁用深度测试的效果 |
| GL_NEVER | 从不通过 | 特殊效果 |
| GL_LESS | 片元深度 < 缓冲深度 | 标准设置（默认值） |
| GL_LEQUAL | 片元深度 ≤ 缓冲深度 | 用于线框叠加渲染 |
| GL_GREATER | 片元深度 > 缓冲深度 | 反转深度测试 |
| GL_EQUAL | 片元深度 = 缓冲深度 | 模板阴影体积 |


在 `depth_testing.cpp` 中，第一个示例使用 `GL_ALWAYS` 来演示深度测试被"禁用"的效果——后绘制的物体会覆盖先绘制的，无论前后关系如何。


```
// 第一个示例：glDepthFunc(GL_ALWAYS) —— 地板覆盖立方体
glEnable(GL_DEPTH_TEST);
glDepthFunc(GL_ALWAYS); // 始终通过

// 第二个示例：glDepthFunc(GL_LESS) —— 正常遮挡
glEnable(GL_DEPTH_TEST);
glDepthFunc(GL_LESS);   // 更近的覆盖更远的

```


## 3. 深度值精度问题

深度值并非线性映射到 [0, 1] 范围。由于透视投影的特性，深度缓冲使用非线性的 **对数分布**：


- **近平面附近**：深度值变化剧烈，精度高
- **远平面附近**：深度值变化缓慢，精度低


公式如下：


```
深度缓冲值 = (1/z - 1/near) / (1/far - 1/near)

// 其中 z 是观察空间中的深度值（负数），near 和 far 是近/远平面距离

```


这意味着：


1. 设置太近的近平面（如 0.01）和太远的远平面（如 10000.0）会加剧精度不足
2. 远处物体的深度冲突更加明显
3. 解决方案：可以使用 `glDepthRange()` 或反转深度（Reverse Z）


## 4. Z-fighting（深度冲突）

当两个表面非常接近时，深度缓冲的精度不足以区分它们的先后顺序，导致像素在两个表面之间闪烁，这就是 **Z-fighting**。

典型场景：


- 两个平面完全重叠
- 一个平面紧贴另一个表面
- 大场景中远处物体的深度测试错误


解决方案：


1. **多边形偏移（Polygon Offset）**：使用 `glPolygonOffset()` 对指定面的深度值做偏移
2. **近/远平面设置**：在不影响视景体裁剪的前提下尽量缩小 near/far 的比值
3. **反向 Z（Reverse Z）**：将近平面映射到 1，远平面映射到 0，配合浮点深度缓冲获得更好的精度分布
4. **指数深度（Logarithmic Depth Buffer）**：在着色器中手动变换深度值

> [!INFO]
> **引擎连接：Unity 的深度设置**
>
> Unity 中 Camera 组件的 `Clipping Planes` 的 Near/Far 参数直接影响深度精度。在 Project Settings 中有 `Depth Buffer` 设置（16 位 / 24 位 / 32 位）。Unity 的 `Offset` 属性在 Shader 中对应 `glPolygonOffset`，用于解决 Z-fighting。UE 默认为 Reverse Z 方案，使用 24 位或 32 位浮点深度缓冲，这在远处提供比 OpenGL 默认设置更好的精度。


## 第二部分：模板测试 (Stencil Testing)

## 5. 模板缓冲原理

模板缓冲（Stencil Buffer）是一个与颜色缓冲大小相同的逐像素整数缓冲（通常为 8 位，每个像素存储 0~255 的整数值）。它像一个"掩码层"——你可以控制片元只在模板缓冲的特定区域被渲染。

模板测试在深度测试之前执行（或者在之后，取决于具体实现配置）：


```
glEnable(GL_STENCIL_TEST);

// 模板测试函数
glStencilFunc(GL_EQUAL, ref, mask);
// 模板操作
glStencilOp(fail, zfail, zpass);

```


### glStencilFunc

定义测试条件：`(ref & mask) OP (stencil & mask)`


- `func`：比较函数（`GL_NEVER`、`GL_LESS`、`GL_EQUAL`、`GL_NOTEQUAL`、`GL_ALWAYS` 等）
- `ref`：参考值
- `mask`：掩码，只有掩码覆盖的位参与比较


### glStencilOp

定义模板缓冲的更新行为：


- `fail`：模板测试失败时执行的操作
- `zfail`：模板测试通过但深度测试失败时执行的操作
- `zpass`：模板测试和深度测试都通过时执行的操作


操作包括：`GL_KEEP`（保持）、`GL_ZERO`（置零）、`GL_REPLACE`（替换为 ref）、`GL_INCR`（增加）、`GL_DECR`（减少）等。

## 6. 物体轮廓描边效果

模板测试最经典的 Demo 是绘制物体轮廓（Outline），对应 `stencil_testing.cpp` 的实现原理如下：


```
// 第一步：绘制地板，不写入模板缓冲
glStencilMask(0x00); // 禁止写入模板缓冲
DrawFloor();

// 第二步：正常绘制物体，同时写入模板缓冲
glStencilFunc(GL_ALWAYS, 1, 0xFF); // 始终通过，参考值设为 1
glStencilMask(0xFF);               // 允许写入，掩码为全 1
DrawCubes();

// 第三步：绘制放大版的纯色物体，模板值 != 1 的区域才绘制
glStencilFunc(GL_NOTEQUAL, 1, 0xFF); // 值不等于 1 的区域
glStencilMask(0x00);                  // 禁止写入
glDisable(GL_DEPTH_TEST);            // 关闭深度测试避免干扰
shaderSingleColor.use();
scale = 1.1f;  // 放大 1.1 倍
DrawScaledCubes();

// 恢复状态
glStencilMask(0xFF);
glStencilFunc(GL_ALWAYS, 0, 0xFF);
glEnable(GL_DEPTH_TEST);

```


效果分析：


1. 第一步，地板像素的模板缓冲值为 0
2. 第二步，立方体占据的像素的模板缓冲值被设为 1
3. 第三步，放大后的立方体轮廓区域（原始立方体外部像素）模板值仍为 0，满足 `GL_NOTEQUAL` 条件，被绘制为纯色——形成了轮廓线条
4. 原始立方体内部的像素模板值为 1，不满足条件，不会被覆盖

> [!INFO]
> **引擎连接：Unity 描边与选中高亮**
>
> Unity 的选中高亮（Selection Outline）和许多后处理描边效果本质上利用了模板缓冲。在 Unity 的 URP/ HDRP 中，后处理 Stack 的 Outline 效果通常分两步：第一步将目标物体渲染到模板缓冲，第二步在全屏 Pass 中检测模板边界并绘制轮廓。UE 的 `PostProcessVolume` 中的 `Outline` 或 `CustomDepth` 功能也基于类似原理——将特定物体渲染到自定义深度/模板通道，然后在后处理中检测边缘。


## 7. 模板测试的高级应用

除了轮廓描边，模板测试在游戏引擎中还有多种用途：


- **阴影体积（Shadow Volumes）**：通过模板缓冲计算阴影的精确区域（经典的 DOOM 3 阴影方案）
- **镜面反射**：只将反射内容渲染到镜面区域的模板缓冲中
- **UI 裁剪**：限制 3D 内容只出现在 UI 遮罩区域内
- **分屏渲染**：用模板缓冲标记每个玩家视角的屏幕区域
- **局部后处理**：只对特定物体应用后处理效果


## 8. 实践提示


```
// 常见的模板测试配置

// 1. 设置模板缓冲的写入掩码（哪些位可以被写入）
glStencilMask(0xFF);  // 允许写入所有位
glStencilMask(0x00);  // 禁止写入任何位

// 2. 清除模板缓冲
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);

// 3. 注意绘制顺序：先绘制不参与模板测试的物体
// 4. 记得在每次绘制循环中恢复模板状态

```


## 9. 练习


> [!INFO]
> **练习：实现物体轮廓效果**
> 1. 基于 `stencil_testing.cpp` 的代码，在场景中添加更多物体并给它们都画上轮廓
> 2. 修改描边颜色为可变的（例如随时间变化）
> 3. 尝试只给特定的物体画轮廓（使用不同的模板参考值）
> 4. 进阶：实现"镜面反射"效果——用模板缓冲限定反射纹理只显示在镜面物体区域内
> 5. 进阶：结合深度测试和模板测试，实现半透明物体的正确绘制顺序
