---
title: 第115课：Canvas 基础
description: Canvas 绘图基础、图形绘制、路径操作、文本渲染、图像处理和形变
date: 2026-08-06
tags:
  - Canvas
  - 图形绘制
  - 路径
  - 图像处理
  - 前端可视化
---

# Canvas 基础

## 学习目标

- 理解 Canvas 的工作原理
- 掌握基本图形的绘制方法
- 掌握路径和贝塞尔曲线
- 掌握图像处理和形变操作

---

## Canvas 简介

Canvas 是 HTML5 提供的绘图 API，通过 JavaScript 在网页上绘制 2D 图形。

### 创建 Canvas

```html
<canvas id="myCanvas" width="800" height="600">
  您的浏览器不支持 Canvas
</canvas>
```

```javascript
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// 检查支持
if (!ctx) {
  console.log('Canvas 不被支持');
}
```

### Canvas 坐标系

```
(0,0) ----------> x (向右为正)
  |
  |
  |
  v y (向下为正)
```

---

## 绘制基本图形

### 矩形

```javascript
// 绘制矩形
ctx.fillStyle = '#FF6B6B';    // 填充颜色
ctx.fillRect(50, 50, 200, 100); // 填充矩形 (x, y, width, height)

ctx.strokeStyle = '#4ECDC4';    // 描边颜色
ctx.lineeWidth = 4;
ctx.strokeRect(300, 50, 200, 100); // 描边矩形

// 清除区域
ctx.clearRect(100, 80, 100, 40);  // 清除矩形区域

// 绘制圆角矩形
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  ctx.fill();
}
```
```

### 圆形和弧

```javascript
// 绘制圆形
ctx.beginPath();
ctx.arc(200, 200, 100, 0, Math.PI * 2); // (x, y, radius, startAngle, endAngle)
ctx.fillStyle = '#FFE66D';
ctx.fill();

// 绘制弧（扇形）
ctx.beginPath();
ctx.moveTo(400, 200);
ctx.arc(400, 200, 80, 0, Math.PI * 0.5); // 0 到 90 度
ctx.closePath();
ctx.fillStyle = '#95E1D3';
ctx.fill();

// 绘制半圆
ctx.beginPath();
ctx.arc(600, 200, 80, 0, Math.PI);
ctx.fillStyle = '#F38181';
ctx.fill();
```

### 线条和路径

```javascript
// 绘制直线
ctx.beginPath();
ctx.moveTo(50, 300);      // 起点
ctx.lineTo(250, 300);     // 终点
ctx.lineTo(150, 450);
ctx.closePath();          // 闭合路径
ctx.strokeStyle = '#AA96DA';
ctx.lineWidth = 4;
ctx.stroke();

// 虚线
ctx.setLineDash([10, 5]);  // [实线长度, 间隔长度]
ctx.strokeRect(300, 300, 150, 100);

// 线条样式
ctx.lineCap = 'round';    // butt | round | square
ctx.lineJoin = 'round';   // miter | bevel | round
```

### 贝塞尔曲线

```javascript
// 二次贝塞尔曲线
ctx.beginPath();
ctx.moveTo(50, 500);
ctx.quadraticCurveTo(150, 400, 250, 500);
ctx.stroke();

// 三次贝塞尔曲线
ctx.beginPath();
ctx.moveTo(300, 500);
ctx.bezierCurveTo(400, 400, 450, 600, 550, 500);
ctx.stroke();
```

---

## 文本渲染

```javascript
// 文本样式
ctx.font = 'bold 48px Arial';
ctx.fillStyle = '#333';
ctx.textAlign = 'center';   // start | end | center | left | right
ctx.textBaseline = 'middle'; // top | hanging | middle | alphabetic | ideographic | bottom

// 填充文本
ctx.fillText('Hello Canvas', 400, 100);

// 描边文本
ctx.strokeStyle = '#FF6B6B';
ctx.lineWidth = 2;
ctx.strokeText('Hello Canvas', 400, 200);

// 文本度量
const metrics = ctx.measureText('Hello Canvas');
console.log(metrics.width);        // 文本宽度
console.log(metrics.actualBoundingBoxAscent);  // 上边界
console.log(metrics.actualBoundingBoxDescent); // 下边界
```

---

## 渐变和阴影

```javascript
// 线性渐变
const gradient = ctx.createLinearGradient(50, 50, 250, 150);
gradient.addColorStop(0, '#FF6B6B');
gradient.addColorStop(0.5, '#4ECDC4');
gradient.addColorStop(1, '#45B7D1');
ctx.fillStyle = gradient;
ctx.fillRect(50, 50, 200, 100);

// 径向渐变
const radialGrad = ctx.createRadialGradient(400, 100, 20, 400, 100, 80);
radialGrad.addColorStop(0, '#FFE66D');
radialGrad.addColorStop(0.7, '#F38181');
radialGrad.addColorStop(1, '#AA96DA');
ctx.fillStyle = radialGrad;
ctx.arc(400, 100, 80, 0, Math.PI * 2);
ctx.fill();

// 阴影
ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
ctx.shadowBlur = 20;
ctx.shadowOffsetX = 10;
ctx.shadowOffsetY = 10;
ctx.fillRect(550, 50, 150, 100);
```

---

## 图像处理

```javascript
// 加载并绘制图像
const img = new Image();
img.src = 'image.jpg';
img.onload = function() {
  // 绘制原始大小
  ctx.drawImage(img, 50, 400);

  // 绘制指定大小
  ctx.drawImage(img, 300, 400, 150, 100);

  // 裁剪并绘制
  // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
  ctx.drawImage(img, 50, 50, 100, 100, 500, 400, 150, 150);
};

// 像素操作
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const data = imageData.data;
for (let i = 0; i < data.length; i += 4) {
  // data[i]   = R
  // data[i+1] = G
  // data[i+2] = B
  // data[i+3] = A

  // 灰度处理
  const gray = data[i] * 0.3 + data[i+1] * 0.59 + data[i+2] * 0.11;
  data[i] = data[i+1] = data[i+2] = gray;
}
ctx.putImageData(imageData, 0, 0);

// 导出图片
const dataURL = canvas.toDataURL('image/png');
// 或 canvas.toBlob(callback, 'image/jpeg', 0.9);
```

---

## 形变

```javascript
// 平移
ctx.translate(200, 100);  // 将原点移动到 (200, 100)

// 旋转
ctx.rotate(Math.PI / 4);  // 旋转 45 度

// 缩放
ctx.scale(2, 1.5);  // x 方向放大 2 倍，y 方向放大 1.5 倍

// 保存和恢复状态
ctx.save();          // 保存当前状态（变换、样式等）
ctx.translate(100, 100);
ctx.rotate(0.5);
ctx.fillRect(0, 0, 50, 50);
ctx.restore();       // 恢复之前保存的状态

// 矩阵变换
ctx.transform(a, b, c, d, e, f);
ctx.setTransform(a, b, c, d, e, f);  // 重置为单位矩阵后再变换
```

---

## 自测题

### 问题 1
Canvas 中 save() 和 restore() 的作用是什么？它们保存和恢复哪些内容？

<details>
<summary>查看答案</summary>
save() 保存当前画布的状态栈，restore() 恢复到最近一次 save() 时的状态。保存的内容包括：变换矩阵（translate/rotate/scale）、裁剪区域、样式属性（fillStyle、strokeStyle、lineWidth、font、shadowBlur 等）、全局透明度（globalAlpha）、合成操作（globalCompositeOperation）等。不保存的是路径和已绘制的图形。
</details>

### 问题 2
Canvas 的像素操作有什么用途和注意事项？

<details>
<summary>查看答案</summary>
像素操作（getImageData/putImageData）可以读取和修改 Canvas 中每个像素的 RGBA 值，用于图像滤镜（灰度、模糊、边缘检测等）、颜色拾取、碰撞检测等。注意事项：1）跨域图片需要在服务器设置 CORS，且 img 设置 crossOrigin 属性；2）像素操作是同步的，大图片处理会阻塞主线程；3）频繁读写性能较差，推荐使用 Web Workers 或离屏 Canvas 优化。
</details>

### 问题 3
Canvas 中 drawImage 的九参数形式如何工作？

<details>
<summary>查看答案</summary>
drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) 的九参数形式用于裁剪和缩放。sx/sy/sWidth/sHeight 定义源图像中的裁剪区域（矩形），dx/dy/dWidth/dHeight 定义目标画布上的绘制位置和大小。这个功能常用于精灵图（spritesheet）的绘制、图像局部放大、缩略图生成等场景。
</details>