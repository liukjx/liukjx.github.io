---
title: 第109课：WXSS 样式
description: 小程序 WXSS 响应式单位 rpx、样式适配、选择器和样式导入
date: 2026-08-06
tags:
  - 小程序
  - WXSS
  - 样式
  - rpx
  - 响应式
  - 适配
---

# WXSS 样式

## 学习目标

- 掌握 rpx 单位的使用和换算
- 理解小程序的选择器体系
- 掌握常见的适配技巧
- 理解样式导入和组件样式隔离

---

## rpx 响应式单位

### rpx 的换算原理

rpx（responsive pixel）是微信小程序中的自适应单位，以 750rpx = 屏幕宽度为基准：

```javascript
// 换算公式
// 设计稿宽度 750px 时：1rpx = 1px
// 设计稿宽度 375px 时：1rpx = 0.5px

// 不同设备换算
// iPhone 5: 320px -> 1rpx = 0.426px
// iPhone 6/7/8: 375px -> 1rpx = 0.5px
// iPhone 6/7/8 Plus: 414px -> 1rpx = 0.552px
// iPhone X: 375px -> 1rpx = 0.5px
```

### 视觉稿适配

```css
/* 以 750px 设计稿为例 */

/* 设计稿元素宽度 375px */
.element {
  width: 375rpx;  /* 所有设备上都是 50% 宽度 */
}

/* 设计稿字体大小 32px */
.text {
  font-size: 32rpx;
}

/* 设计稿间距 20px */
.space {
  margin: 20rpx;
  padding: 30rpx;
}
```

### 常用 rpx 值参考

```css
/* 安全区域 */
.safe-top {
  padding-top: 88rpx;  /* 适配刘海屏 */
}
.safe-bottom {
  padding-bottom: 68rpx;  /* 适配底部黑条 */
}

/* 常见布局值 */
.full-width {
  width: 750rpx;
}
.half-width {
  width: 375rpx;
}

/* 1px 边框（物理像素） */
.border-1px {
  position: relative;
}
.border-1px::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: #e5e5e5;
  transform: scaleY(0.5);/* 高清屏上显示 1px */
}
```

---

## 选择器体系

### 基础选择器

```css
/* 类选择器（最常用） */
.container {}
.item {}

/* ID 选择器 */
#header {}

/* 元素选择器 */
view {}
text {}
image {}

/* 属性选择器 */
[type="primary"] {}
[data-id="1"] {}

/* 伪类选择器 */
:first-child {}
:last-child {}
:nth-child(2) {}
```

### 组合选择器

```css
/* 后代选择器 */
.container .item {}

/* 子代选择器 */
.container > .item {}

/* 交集选择器 */
view.active {}

/* 并集选择器 */
.item, .other {}
```

### 小程序特有选择器

```css
/* :host - 自定义组件根节点 */
:host {
  display: block;
}

/* 自定义组件样式隔离 */
/* 默认情况下，组件样式不会影响页面，页面样式不会影响组件 */
```

---

## 样式导入

### @import

```css
/* common.wxss - 公共样式 */
@import '/styles/reset.wxss';
@import '/styles/variables.wxss';
@import '/styles/mixins.wxss';
```

### 全局样式 vs 页面样式

```css
/* app.wxss - 全局生效 */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 28rpx;
  color: #333;
  background: #f5f5f5;
}

/* pages/index/index.wxss - 仅当前页面生效 */
.index-container {
  padding: 30rpx;
}
```

---

## Flex 布局

```css
/* Flex 容器 */
.flex-container {
  display: flex;
  flex-direction: row;       /* 主轴方向 */
  flex-wrap: wrap;           /* 是否换行 */
  justify-content: center;   /* 主轴对齐 */
  align-items: center;       /* 交叉轴对齐 */
  align-content: stretch;    /* 多行对齐 */
}

/* Flex 项目 */
.flex-item {
  flex: 1;                   /* 等分 */
  flex: 0 0 200rpx;          /* 固定宽度 */
  align-self: center;        /* 单独对齐 */
  order: -1;                 /* 排序 */
}

/* 常见布局示例 */

/* 水平居中 */
.horizontal-center {
  display: flex;
  justify-content: center;
}

/* 垂直居中 */
.vertical-center {
  display: flex;
  align-items: center;
}

/* 居中 */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 两端对齐 */
.space-between {
  display: flex;
  justify-content: space-between;
}

/* 等分布局 */
.equal-grid {
  display: flex;
  flex-wrap: wrap;
}
.equal-grid .item {
  flex: 0 0 33.33%;  /* 三列等分 */
}
```

---

## 组件样式隔离

### 样式隔离规则

```css
/* 自定义组件的样式隔离 */

/* 方式 1：在组件 JSON 中配置 */
{
  "styleIsolation": "isolated"
  // isolated - 组件内外样式互不影响（默认）
  // apply-shared - 页面样式影响组件，但组件样式不影响页面
  // shared - 组件内外样式互相影响
}

/* 方式 2：在组件 JS 中配置 */
Component({
  options: {
    styleIsolation: 'isolated'
  }
});
```

---

## 自测题

### 问题 1
rpx 的实现原理是什么？为什么以 750rpx 为基准？

<details>
<summary>查看答案</summary>
rpx 的实现基于屏幕宽度自适应。以 750rpx = 屏幕宽度为基准，小程序在渲染时根据当前设备的屏幕宽度计算 1rpx 对应的实际像素值。750 是 iPhone 6/7/8 的逻辑宽度（375px）的 2 倍，选这个值是为了方便从 750px 的设计稿直接转换，开发时按照设计稿的 px 值直接写 rpx 即可。
</details>

### 问题 2
小程序的 1px 边框为什么需要特殊处理？

<details>
<summary>查看答案</summary>
在 Retina 屏幕（2x/3x）上，CSS 的 1px 实际上对应的是 2px 或 3px 的物理像素，看起来比设计稿粗。解决方案：1）使用 transfrom: scaleY(0.5) 配合伪元素实现真正的 1px 边框；2）使用边框图片；3）使用 box-shadow 模拟。小程序中通常使用伪元素 + transform 的方式。
</details>

### 问题 3
自定义组件的样式隔离有哪几种模式？各适用于什么场景？

<details>
<summary>查看答案</summary>
三种模式：1）isolated（默认）：组件内外部样式完全隔离，适用于通用组件库；2）apply-shared：页面样式可以影响组件，组件样式不影响页面，适用于页面内的专用组件；3）shared：组件内外样式相互影响，适用于需要统一样式的场景。推荐使用默认的 isolated 模式，需要共享样式时在组件内显式导入。
</details>