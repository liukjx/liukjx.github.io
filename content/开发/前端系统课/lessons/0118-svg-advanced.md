---
title: 第118课：SVG 高级
description: SVG 渐变、滤镜、形变、SMIL 动画和高级特效
date: 2026-08-06
tags:
  - SVG
  - 渐变
  - 滤镜
  - 形变
  - SMIL
  - 动画
---

# SVG 高级

## 学习目标

- 掌握 SVG 渐变的定义和使用
- 掌握 SVG 滤镜的效果
- 理解 SVG 形变机制
- 掌握 SMIL 动画的编写

---

## 渐变

### 线性渐变

```svg
<svg width="400" height="200">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#FF6B6B" />
      <stop offset="50%"  stop-color="#4ECDC4" />
      <stop offset="100%" stop-color="#45B7D1" />
    </linearGradient>

    <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="rotate(45)">
      <stop offset="0%"   stop-color="#FFE66D" />
      <stop offset="100%" stop-color="#F38181" />
    </linearGradient>
  </defs>

  <rect x="20" y="20" width="360" height="60"
        rx="10" fill="url(#grad1)" />
  <rect x="20" y="100" width="360" height="60"
        rx="10" fill="url(#grad2)" />
</svg>
```

### 径向渐变

```svg
<svg width="400" height="200">
  <defs>
    <radialGradient id="radialGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#4ECDC4" stop-opacity="1" />
      <stop offset="70%"  stop-color="#FF6B6B" stop-opacity="0.7" />
      <stop offset="100%" stop-color="#333" stop-opacity="0" />
    </radialGradient>
  </defs>

  <circle cx="200" cy="100" r="80" fill="url(#radialGrad)" />
</svg>
```

---

## 滤镜

### 基本滤镜

```svg
<svg width="600" height="400">
  <defs>
    <!-- 模糊滤镜 -->
    <filter id="blur">
      <feGaussianBlur stdDeviation="3" />
    </filter>

    <!-- 阴影滤镜 -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="5" dy="5" stdDeviation="5" flood-color="#333" flood-opacity="0.3" />
    </filter>

    <!-- 浮雕滤镜 -->
    <filter id="emboss">
      <feColorMatrix in="SourceGraphic" type="luminanceToAlpha" />
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 1" />
      </feComponentTransfer>
    </filter>
  </defs>

  <circle cx="100" cy="100" r="60" fill="#FF6B6B" filter="url(#blur)" />
  <circle cx="300" cy="100" r="60" fill="#4ECDC4" filter="url(#shadow)" />
</svg>
```

### 高级滤镜效果

```svg
<svg width="400" height="200">
  <defs>
    <!-- 水彩效果 -->
    <filter id="watercolor">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" />
    </filter>

    <!-- 老照片效果 -->
    <filter id="oldPhoto">
      <feColorMatrix type="matrix" values="
        0.3 0.5 0.2 0 0
        0.2 0.4 0.3 0 0
        0.1 0.3 0.4 0 0
        0   0   0   1 0" />

      <feComponentTransfer>
        <feFuncR type="linear" slope="1.2" intercept="0.1" />
        <feFuncG type="linear" slope="1.1" intercept="0.05" />
        <feFuncB type="linear" slope="0.8" intercept="0" />
      </feComponentTransfer>
    </filter>
  </defs>

  <rect x="20" y="20" width="360" height="160" fill="#4ECDC4" filter="url(#oldPhoto)" />
</svg>
```

---

## 形变

```svg
<svg width="400" height="300">
  <!-- 平移 -->
  <g transform="translate(50, 50)">
    <rect x="0" y="0" width="80" height="60" fill="#FF6B6B" />
  </g>

  <!-- 旋转 -->
  <g transform="translate(200, 100) rotate(45)">
    <rect x="-40" y="-30" width="80" height="60" fill="#4ECDC4" />
  </g>

  <!-- 缩放 -->
  <g transform="translate(50, 200) scale(1.5)">
    <rect x="0" y="0" width="80" height="60" fill="#FFE66D" />
  </g>

  <!-- 倾斜 -->
  <g transform="translate(200, 200) skewX(20)">
    <rect x="0" y="0" width="80" height="60" fill="#F38181" />
  </g>

  <!-- 组合变换 -->
  <g transform="translate(350, 50) scale(0.8) rotate(30)">
    <rect x="-40" y="-30" width="80" height="60" fill="#AA96DA" />
  </g>
</svg>
```

---

## SMIL 动画

### 基本动画

```svg
<svg width="500" height="400">
  <!-- animate：数值动画 -->
  <circle cx="100" cy="200" r="30" fill="#FF6B6B">
    <animate attributeName="cx"
             from="100" to="400"
             dur="2s" repeatCount="indefinite" />
  </circle>

  <!-- animateTransform：变换动画 -->
  <rect x="-40" y="-40" width="80" height="80" fill="#4ECDC4">
    <animateTransform attributeName="transform"
                      type="rotate"
                      from="0 250 200" to="360 250 200"
                      dur="3s" repeatCount="indefinite" />
  </rect>

  <!-- 多个属性同时动画 -->
  <ellipse cx="250" cy="350" rx="60" ry="30" fill="#FFE66D">
    <animate attributeName="rx"
             values="60; 30; 60" dur="1.5s" repeatCount="indefinite" />
    <animate attributeName="ry"
             values="30; 60; 30" dur="1.5s" repeatCount="indefinite" />
  </ellipse>
</svg>
```

### 沿路径动画

```svg
<svg width="500" height="400">
  <defs>
    <path id="motionPath" d="M 50,200 C 100,50 300,50 400,200 S 400,300 250,300" fill="none" stroke="#ccc" />
  </defs>

  <!-- 路径动画 -->
  <circle r="10" fill="#FF6B6B">
    <animateMotion dur="4s" repeatCount="indefinite">
      <mpath href="#motionPath" />
    </animateMotion>
  </circle>

  <!-- 沿路径运动的矩形 -->
  <rect x="-12" y="-12" width="24" height="24" fill="#4ECDC4">
    <animateMotion dur="4s" repeatCount="indefinite" rotate="auto">
      <mpath href="#motionPath" />
    </animateMotion>
  </rect>
</svg>
```

---

## SVG 优化

```javascript
// 1. 使用 viewBox 而非固定尺寸
// 2. 简化路径（减少节点数）
// 3. 使用 CSS 而非内联样式
// 4. 压缩 SVG 文件（移除无用属性和空格）

// 工具推荐
// - SVGO: Node.js SVG 优化工具
// - SVGOMG: SVGO 的 GUI 版本
// - Icomoon: 图标管理和优化

// 5. 使用 symbol 和 use 复用图形
<svg>
  <defs>
    <symbol id="icon-star" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </symbol>
  </defs>

  <use href="#icon-star" x="50" y="50" width="40" height="40" fill="#FFE66D" />
  <use href="#icon-star" x="100" y="50" width="30" height="30" fill="#FF6B6B" />
  <use href="#icon-star" x="140" y="50" width="20" height="20" fill="#4ECDC4" />
</svg>
```

---

## 自测题

### 问题 1
SVG 滤镜（filter）的工作原理是什么？

<details>
<summary>查看答案</summary>
SVG 滤镜基于图形缓冲区处理。每个滤镜由多个滤镜基元（filter primitive）组成，如 feGaussianBlur（模糊）、feColorMatrix（颜色矩阵）、feDropShadow（阴影）等。滤镜基元依次执行，前一个的输出作为后一个的输入，最终输出处理后的图像。滤镜通过 in 和 result 属性控制输入输出连接，in="SourceGraphic" 表示原始图形，in="SourceAlpha" 表示图形的 Alpha 通道。
</details>

### 问题 2
SMIL 动画和 CSS 动画在 SVG 中有什么不同？

<details>
<summary>查看答案</summary>
SMIL 是 SVG 原生动画规范，使用 <animate>、<animateTransform>、<animateMotion> 等元素定义动画。优势：可以动画 SVG 特有的属性（如 viewBox、path 的 d 属性），支持沿路径动画（animateMotion）。CSS 动画可以动画大部分 SVG 属性但有限制（如路径变形不支持）。SMIL 的兼容性和性能不如 CSS 动画，但功能更强大。建议简单动画用 CSS，复杂 SVG 特定动画用 SMIL。
</details>

### 问题 3
使用 <symbol> 和 <use> 复用 SVG 图形有什么好处？

<details>
<summary>查看答案</summary>
1）减少代码重复：图形定义一次，多处引用；2）减小文件体积：特别是图标集场景；3）统一管理：修改定义处即可更新所有引用；4）支持颜色继承：通过 fill="currentColor" 让使用处控制颜色；5）支持响应式：每个 use 实例可以独立设置尺寸和位置。这是 SVG 图标系统的推荐做法，很多图标库（如 Font Awesome 的 SVG 版本）采用此方案。
</details>