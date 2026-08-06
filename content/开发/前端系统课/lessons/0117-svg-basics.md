---
title: 第117课：SVG 基础
description: SVG 创建方式、基本图形绘制、样式设置、坐标系统
date: 2026-08-06
tags:
  - SVG
  - 矢量图形
  - 图形绘制
  - 坐标
  - 样式
---

# SVG 基础

## 学习目标

- 掌握 SVG 的创建和使用方式
- 掌握基本图形的绘制
- 理解 SVG 的坐标系统
- 掌握 SVG 的样式设置

---

## SVG 介绍

SVG（Scalable Vector Graphics）是一种基于 XML 的矢量图形格式，用于在 Web 上描述二维图形。

### 创建方式

```html
<!-- 方式 1：内联 SVG（推荐） -->
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <circle cx="200" cy="150" r="100" fill="#FF6B6B" />
</svg>

<!-- 方式 2：SVG 文件 -->
<img src="image.svg" alt="SVG 图片" />

<!-- 方式 3：CSS background -->
<div style="background: url(image.svg);"></div>

<!-- 方式 4：object 标签 -->
<object data="image.svg" type="image/svg+xml"></object>

<!-- 方式 5：iframe -->
<iframe src="image.svg"></iframe>
```

### 使用 JavaScript 创建 SVG

```javascript
// 创建 SVG 元素
const svgNS = 'http://www.w3.org/2000/svg';
const svg = document.createElementNS(svgNS, 'svg');
svg.setAttribute('width', '400');
svg.setAttribute('height', '300');

// 创建图形元素
const circle = document.createElementNS(svgNS, 'circle');
circle.setAttribute('cx', '200');
circle.setAttribute('cy', '150');
circle.setAttribute('r', '100');
circle.setAttribute('fill', '#4ECDC4');

svg.appendChild(circle);
document.body.appendChild(svg);
```

---

## 基本图形

### 矩形

```svg
<svg width="400" height="300">
  <!-- 普通矩形 -->
  <rect x="20" y="20" width="160" height="100"
        fill="#FF6B6B" stroke="#333" stroke-width="2" />

  <!-- 圆角矩形 -->
  <rect x="200" y="20" width="160" height="100"
        rx="15" ry="15"
        fill="#4ECDC4" />

  <!-- 只有描边的矩形 -->
  <rect x="20" y="150" width="160" height="100"
        fill="none" stroke="#45B7D1" stroke-width="4" />
</svg>
```

### 圆形和椭圆

```svg
<svg width="400" height="300">
  <!-- 圆形 -->
  <circle cx="100" cy="100" r="60"
          fill="#FFE66D" stroke="#333" stroke-width="2" />

  <!-- 椭圆 -->
  <ellipse cx="300" cy="100" rx="80" ry="40"
           fill="#F38181" />
</svg>
```

### 线条和折线

```svg
<svg width="400" height="300">
  <!-- 直线 -->
  <line x1="20" y1="20" x2="200" y2="100"
        stroke="#AA96DA" stroke-width="3" />

  <!-- 折线 -->
  <polyline points="20,150 80,200 140,160 200,220"
            fill="none" stroke="#96CEB4" stroke-width="3"
            stroke-linejoin="round" />

  <!-- 多边形 -->
  <polygon points="250,200 300,150 350,200 320,260 280,260"
           fill="#FF6B6B" fill-opacity="0.7"
           stroke="#333" stroke-width="2" />
</svg>
```

### 路径

```svg
<svg width="400" height="300">
  <!-- 复杂路径 -->
  <path d="M 50 50
           L 150 50
           L 150 150
           L 50 150
           Z"
        fill="#4ECDC4" stroke="#333" stroke-width="2" />

  <!-- 弧线 -->
  <path d="M 250 100
           A 50 50 0 0 1 350 100
           A 50 50 0 0 1 250 100"
        fill="#FF6B6B" />
</svg>
```

### 路径命令

```
M = moveto（移动到）
L = lineto（画线到）
H = horizontal lineto（水平线）
V = vertical lineto（垂直线）
C = curveto（三次贝塞尔曲线）
S = smooth curveto（平滑三次贝塞尔曲线）
Q = quadratic Bézier curve（二次贝塞尔曲线）
T = smooth quadratic Bézier curveto（平滑二次贝塞尔曲线）
A = elliptical Arc（椭圆弧）
Z = closepath（闭合路径）

大写 = 绝对坐标
小写 = 相对坐标
```

---

## 坐标系统

### ViewBox

```svg
<!-- viewBox: min-x min-y width height -->
<!-- 定义画布内部坐标系 -->
<svg width="400" height="300" viewBox="0 0 400 300">
  <!-- 默认可视区域 -->
</svg>

<!-- viewBox 配合 preserveAspectRatio -->
<svg viewBox="0 0 200 200" width="400" height="400"
     preserveAspectRatio="xMidYMid meet">
  <!-- preserveAspectRatio 控制缩放对齐方式 -->
  <!-- xMinYMin | xMidYMid | xMaxYMax -->
  <!-- meet: 等比缩放完全显示 -->
  <!-- slice: 等比缩放裁剪 -->
  <circle cx="100" cy="100" r="100" fill="#4ECDC4" />
</svg>
```

### 嵌套坐标系

```svg
<svg width="500" height="400">
  <!-- 外层坐标系 -->
  <rect x="0" y="0" width="500" height="400" fill="#f0f0f0" />

  <!-- 内层 SVG -->
  <svg x="50" y="50" width="400" height="300" viewBox="0 0 100 100">
    <rect x="10" y="10" width="80" height="80" fill="#FF6B6B" />
  </svg>
</svg>
```

---

## 样式设置

### 属性 vs CSS

```svg
<!-- 方式 1：属性 -->
<circle cx="100" cy="100" r="50"
        fill="#FF6B6B" stroke="#333" stroke-width="3" />

<!-- 方式 2：内联样式 -->
<circle cx="100" cy="100" r="50"
        style="fill: #4ECDC4; stroke: #333; stroke-width: 3;" />

<!-- 方式 3：CSS 类 -->
<style>
  .circle { fill: #FFE66D; stroke: #333; stroke-width: 2; }
  .circle:hover { fill: #F38181; }
</style>
<circle cx="200" cy="200" r="80" class="circle" />
```

### SVG 特有样式属性

```css
.fill-primary   { fill: #FF6B6B; }
.fill-secondary { fill: #4ECDC4; }
.fill-none      { fill: none; }

.stroke-thick   { stroke: #333; stroke-width: 4; }
.stroke-thin    { stroke: #999; stroke-width: 1; }

.stroke-dashed  { stroke-dasharray: 5 5; }
.stroke-dotted  { stroke-dasharray: 2 2; }

/* 线条样式 */
stroke-linecap: butt | round | square;
stroke-linejoin: miter | round | bevel;
stroke-miterlimit: 4;
fill-opacity: 0.5;
stroke-opacity: 0.8;
opacity: 0.6;

/* 转场动画 */
transition: all 0.3s ease;
```

---

## 自测题

### 问题 1
SVG 中的 viewBox 是什么？它的作用是什么？

<details>
<summary>查看答案</summary>
viewBox 定义了 SVG 内部的坐标系统，格式为 "min-x min-y width height"。它允许将逻辑坐标映射到实际显示区域。例如 viewBox="0 0 100 100" 定义了一个 100x100 的内部坐标系，当实际 SVG 大小为 400x400 时，坐标系中的 1 单位对应实际 4px。这使得 SVG 可以自适应缩放，保持图形在不同尺寸下的比例。
</details>

### 问题 2
SVG 路径命令中大写和小写字母的区别？

<details>
<summary>查看答案</summary>
大写字母表示使用绝对坐标（相对于 SVG 坐标系原点），小写字母表示使用相对坐标（相对于当前点）。例如 M 100 100 移动到绝对坐标 (100, 100)，m 10 10 从当前点向右下移动 (10, 10)。相对坐标在绘制相对位置图案时更方便，绝对坐标在精确定位时更直观。
</details>

### 问题 3
Canvas 和 SVG 分别适合什么场景？

<details>
<summary>查看答案</summary>
SVG 适合：1）交互式图表和地图；2）需要高精度缩放的图标和插图；3）元素数量少（< 1000）但交互复杂的场景；4）需要 CSS 动画和 DOM 事件的图形；5）响应式设计。Canvas 适合：1）大量图形元素（> 1000）；2）实时动画和游戏；3）像素级操作（滤镜、图像处理）；4）不需要元素级交互的场景；5）高频更新的大数据可视化。
</details>