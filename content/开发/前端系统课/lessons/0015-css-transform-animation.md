---
title: 第15课：CSS 形变动画
description: transform/translate/scale/rotate/skew/transform-origin/transition/animation/@keyframes/vertical-align
date: 2026-08-06
tags:
  - css
  - course
  - web
---

# 第15课：CSS 形变动画

## 学习目标

- 掌握 transform 变换（平移、缩放、旋转、倾斜）
- 掌握 transition 过渡动画
- 掌握 animation 和 @keyframes 关键帧动画
- 理解 vertical-align 的作用和行盒概念
- 能够实现常见的 CSS 动画效果

---

## 一、transform（形变）

### 1.1 transform 概述

`transform` 允许对元素进行平移、缩放、旋转、倾斜等变换，**不会影响其他元素的布局**。

```css
transform: 函数1(参数) 函数2(参数);
```

### 1.2 translate（平移）

```css
.transform-translate {
  /* 单个值：水平移动 */
  transform: translateX(100px);     /* 向右100px */
  transform: translateX(-50px);     /* 向左50px */

  /* 两个值：水平 + 垂直 */
  transform: translate(100px, 50px); /* 右100px, 下50px */

  /* 百分比：相对于自身尺寸 */
  transform: translate(50%, 50%);    /* 向右移动自身宽度50%，向下移动自身高度50% */
}
```

**利用 translate 实现垂直居中**：

```css
.center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);  /* 自身宽高的-50% */
}
```

> [!TIP]
> 使用 `translate(-50%, -50%)` 配合 `absolute` 定位是实现垂直居中的常用方法，不需要知道元素的宽高。

### 1.3 scale（缩放）

```css
.transform-scale {
  /* 单个值：等比缩放 */
  transform: scale(1.5);        /* 放大1.5倍 */
  transform: scale(0.8);        /* 缩小到0.8倍 */

  /* 两个值：水平 + 垂直分别缩放 */
  transform: scale(2, 1);       /* 水平放大2倍，垂直不变 */

  /* 单独方向 */
  transform: scaleX(1.5);       /* 水平放大 */
  transform: scaleY(0.5);       /* 垂直缩小 */
}
```

### 1.4 rotate（旋转）

```css
.transform-rotate {
  transform: rotate(45deg);      /* 顺时针45度 */
  transform: rotate(-90deg);     /* 逆时针90度 */
  transform: rotate(0.5turn);    /* 半圈 */
  transform: rotate(1rad);       /* 弧度 */
}
```

### 1.5 skew（倾斜）

```css
.transform-skew {
  transform: skew(30deg);        /* 水平倾斜30度 */
  transform: skew(10deg, 20deg); /* 水平倾斜10度，垂直倾斜20度 */
  transform: skewX(45deg);
  transform: skewY(45deg);
}
```

### 1.6 组合变换

```css
.transform-combo {
  /* 多个变换叠加 */
  transform: translate(100px, 50px) rotate(45deg) scale(1.2);
}
```

> [!WARNING]
> 多个变换的执行顺序是从右到左。例如 `transform: translate(100px, 0) rotate(45deg)` 会先旋转再平移，而不是先平移再旋转。

### 1.7 transform-origin（变换原点）

```css
.transform-origin {
  transform-origin: center;          /* 默认值，中心点 */
  transform-origin: top left;        /* 左上角 */
  transform-origin: 0 0;             /* 坐标(0, 0) */
  transform-origin: 50% 100%;        /* 底部中间 */
}
```

---

## 二、transition（过渡动画）

### 2.1 什么是过渡

过渡让 CSS 属性值的变化在一定时间内平滑进行，而不是瞬间完成。

```css
.box {
  width: 200px;
  height: 200px;
  background: #3498db;
  transition: all 0.3s ease;  /* 所有属性0.3秒过渡 */
}

.box:hover {
  background: #e74c3c;
  transform: scale(1.1);
  /* 变化会以过渡动画的形式发生 */
}
```

### 2.2 transition 属性

```css
.box {
  /* 完整属性 */
  transition-property: all;          /* 哪些属性参与过渡 */
  transition-duration: 0.3s;         /* 过渡时长 */
  transition-timing-function: ease;  /* 速度曲线 */
  transition-delay: 0s;              /* 延迟时间 */

  /* 缩写 */
  transition: all 0.3s ease 0s;

  /* 只对特定属性生效 */
  transition: background-color 0.3s, transform 0.5s ease;
}
```

### 2.3 速度曲线（timing-function）

```css
transition-timing-function: ease;          /* 慢→快→慢（默认） */
transition-timing-function: linear;        /* 匀速 */
transition-timing-function: ease-in;       /* 慢→快 */
transition-timing-function: ease-out;      /* 快→慢 */
transition-timing-function: ease-in-out;   /* 慢→快→慢 */
transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1); /* 自定义贝塞尔曲线 */
transition-timing-function: steps(4);      /* 分步动画 */
```

### 2.4 可过渡的属性

并非所有 CSS 属性都能过渡。常见可过渡属性：

- **颜色**：`color`、`background-color`、`border-color`
- **尺寸**：`width`、`height`、`padding`、`margin`、`border-width`
- **位置**：`left`、`top`、`right`、`bottom`
- **变换**：`transform`
- **透明度**：`opacity`

> [!NOTE]
> 性能优化提示：`transform` 和 `opacity` 的动画由 GPU 加速，性能最好。避免对 `width`、`height`、`left`、`top` 做动画，它们会触发 Reflow。

---

## 三、animation（动画）

### 3.1 transition 的局限性

- 需要事件触发（如 hover）
- 只能从 A 到 B，不能定义中间帧
- 不能循环（除非用 JS）

### 3.2 @keyframes 关键帧

```css
@keyframes slideIn {
  /* 开始帧 */
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  /* 结束帧 */
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes bounce {
  /* 使用百分比定义多个关键帧 */
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
```

### 3.3 animation 属性

```css
.box {
  /* 完整属性 */
  animation-name: slideIn;           /* 动画名称 */
  animation-duration: 1s;            /* 动画时长 */
  animation-timing-function: ease;    /* 速度曲线 */
  animation-delay: 0s;               /* 延迟 */
  animation-iteration-count: 1;       /* 循环次数 */
  animation-direction: normal;        /* 方向 */
  animation-fill-mode: none;          /* 填充模式 */
  animation-play-state: running;      /* 播放状态 */

  /* 缩写 */
  animation: slideIn 1s ease 0s 1 normal none;

  /* 无限循环 */
  animation: bounce 2s ease infinite;

  /* 交替循环 */
  animation: bounce 2s ease infinite alternate;
}
```

### 3.4 属性详解

**animation-direction**：

| 值 | 说明 |
|----|------|
| `normal` | 正向播放（默认） |
| `reverse` | 反向播放 |
| `alternate` | 正反交替 |
| `alternate-reverse` | 反反正交替 |

**animation-fill-mode**：

| 值 | 说明 |
|----|------|
| `none` | 动画前后不应用样式（默认） |
| `forwards` | 动画结束后保持在结束帧 |
| `backwards` | 动画开始前应用开始帧 |
| `both` | 同时 forwards + backwards |

### 3.5 完整动画示例

```css
@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 15px rgba(52, 152, 219, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(52, 152, 219, 0);
  }
}

.btn {
  animation: pulse 2s infinite;
}
```

---

## 四、vertical-align

### 4.1 行盒的概念

在 CSS 中，每一行文本都有一个看不见的**行盒**（line-box），`vertical-align` 控制行内级元素在行盒中的垂直对齐方式。

### 4.2 常用值

```css
img, span, input {
  vertical-align: baseline;    /* 默认值，基线对齐 */
  vertical-align: top;         /* 行盒顶部对齐 */
  vertical-align: bottom;      /* 行盒底部对齐 */
  vertical-align: middle;      /* 行盒中间对齐 */
  vertical-align: text-top;    /* 文本顶部对齐 */
  vertical-align: text-bottom; /* 文本底部对齐 */
}
```

### 4.3 常见问题：图片底部间隙

```html
<div style="border: 1px solid #333;">
  <img src="image.jpg" alt="" />
  <!-- 图片下方有大约3px的空白间隙 -->
</div>
```

**原因**：图片默认 `vertical-align: baseline`，基线下方还有空间。

**解决方案**：

```css
/* 方案一：修改 vertical-align */
img {
  vertical-align: bottom;   /* 或 top / middle */
}

/* 方案二：将图片设为块级 */
img {
  display: block;
}
```

### 4.4 多个元素的对齐

```html
<div>
  <span style="font-size: 32px;">大文本</span>
  <span style="font-size: 16px;">小文本</span>
  <img src="icon.png" width="24" />
</div>
```

```css
/* 对齐所有元素到中间 */
span, img {
  vertical-align: middle;
}
```

---

## 五、总结：transform / translate / transition 的区别

| 术语 | 类别 | 说明 |
|------|------|------|
| `transform` | CSS 属性 | 对元素进行形变（平移/缩放/旋转/倾斜） |
| `translate` | transform 函数 | 用于平移变换 |
| `transition` | CSS 属性 | 定义属性值变化的过渡动画 |

```css
.transform { transform: translate(100px, 0) rotate(45deg); }
.transition { transition: transform 0.3s ease; }
/* ⬆️ 合起来使用：transform 的变化会以过渡动画的形式展现 */
```

---

## 自测问题

<details>
<summary>1. `transform: translate(-50%, -50%)` 常用于什么场景？</summary>

配合 absolute 定位实现元素的水平垂直居中，不需要知道元素的宽高。
</details>

<details>
<summary>2. transition 和 animation 有什么区别？</summary>

transition 需要事件触发，只能定义开始和结束状态；animation 无需触发，可通过 @keyframes 定义多个关键帧，支持循环。
</details>

<details>
<summary>3. 哪些 CSS 属性做动画性能最好？</summary>

`transform` 和 `opacity`，由 GPU 加速，不会触发 Reflow。
</details>

<details>
<summary>4. 图片底部为什么会有空白间隙？如何去除？</summary>

图片默认 `vertical-align: baseline`，基线下方留有空间。解决方案：设置 `vertical-align: bottom` 或 `display: block`。
</details>

<details>
<summary>5. 写出一个无限循环的脉冲动画的关键帧定义。</summary>

```css
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
.element { animation: pulse 2s ease infinite; }
```

</details>

---

> 下一课：[[0016-html-css-project|第16课：综合项目实战]]