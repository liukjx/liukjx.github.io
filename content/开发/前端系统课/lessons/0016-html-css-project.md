---
title: 第16课：综合项目实战
description: 王者荣耀首页实战、弘源海购移动端项目、HTML5语义化元素、white-space/text-overflow/var/calc/blur/gradient
date: 2026-08-06
tags:
  - html
  - css
  - course
  - project
---

# 第16课：综合项目实战

## 学习目标

- 通过王者荣耀首页项目综合运用 HTML+CSS 知识
- 理解项目结构设计（公共类、模块化）
- 掌握实际项目中的常见布局模式
- 了解 CSS 函数（var / calc / blur / gradient）
- 了解浏览器前缀

---

## 一、CSS 函数补充

在项目实战前，先补充一些实用的 CSS 函数。

### 1.1 var（CSS 自定义属性）

```css
:root {
  --primary-color: #3498db;
  --text-color: #333;
  --font-size-base: 16px;
  --spacing: 20px;
}

.element {
  color: var(--primary-color);
  font-size: var(--font-size-base);
  padding: var(--spacing);
}

/* 带默认值 */
.element {
  color: var(--secondary-color, #2ecc71);  /* 如果 --secondary-color 未定义，使用 #2ecc71 */
}
```

### 1.2 calc（计算）

```css
.element {
  width: calc(100% - 200px);           /* 减去固定宽度 */
  height: calc(100vh - 60px);          /* 视口高度减去导航栏 */
  font-size: calc(16px + 2vw);         /* 响应式字号 */
  padding: calc(10px + 2%);
}
```

> [!TIP]
> `calc()` 中的运算符两侧必须有空格，否则不生效。

### 1.3 blur（模糊）

```css
/* 元素本身模糊 */
.filter-blur {
  filter: blur(5px);       /* 高斯模糊5px */
}

/* 背景模糊（背景后的内容模糊） */
.backdrop-blur {
  backdrop-filter: blur(10px);  /* 磨砂玻璃效果 */
  background: rgba(255, 255, 255, 0.3);
}
```

### 1.4 gradient（渐变）

```css
/* 线性渐变 */
.linear-gradient {
  background-image: linear-gradient(to bottom, #3498db, #2ecc71);
  background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 径向渐变 */
.radial-gradient {
  background-image: radial-gradient(circle, #ff6b6b, #c0392b);
}

/* 多重渐变 */
.multi-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%),
              url("bg.png") no-repeat center;
}
```

---

## 二、浏览器前缀

不同浏览器对 CSS 新特性的支持可能需要前缀：

```css
.element {
  -webkit-transform: rotate(45deg);   /* Chrome/Safari/Edge */
  -moz-transform: rotate(45deg);      /* Firefox */
  -ms-transform: rotate(45deg);       /* IE */
  -o-transform: rotate(45deg);        /* Opera */
  transform: rotate(45deg);           /* 标准语法，放最后 */
}
```

> [!NOTE]
> 现代前端开发中通常使用自动化工具（如 Autoprefixer、PostCSS）自动添加浏览器前缀，无需手动编写。

---

## 三、white-space 和 text-overflow

### 3.1 white-space（空白处理）

```css
.white-space-normal {
  white-space: normal;      /* 默认，合并空白，自动换行 */
}
.white-space-nowrap {
  white-space: nowrap;      /* 合并空白，不换行 */
}
.white-space-pre {
  white-space: pre;         /* 保留空白，不换行（类似 pre 标签） */
}
```

### 3.2 text-overflow（文本溢出）

```css
/* 单行文本省略号 */
.ellipsis {
  white-space: nowrap;           /* 不换行 */
  overflow: hidden;              /* 溢出隐藏 */
  text-overflow: ellipsis;       /* 省略号 */
}
```

---

## 四、王者荣耀首页项目

### 4.1 项目结构

```
王者荣耀首页/
├── index.html
├── css/
│   ├── common.css      # 公共样式
│   ├── header.css      # 头部导航
│   ├── banner.css      # 轮播区域
│   ├── news.css        # 新闻区域
│   ├── entrance.css    # 入口区域
│   └── video.css       # 视频列表
└── images/             # 图片资源
```

### 4.2 公共类封装

```css
/* 清除浮动 */
.clearfix::after {
  content: "";
  display: block;
  clear: both;
}

/* 文字省略 */
.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 图片块级化 */
img {
  display: block;
  width: 100%;
}
```

### 4.3 轮播图区域

```html
<div class="banner">
  <div class="banner-list">
    <img src="images/banner1.jpg" alt="轮播图" />
  </div>
  <ul class="title-list">
    <li class="active">新闻标题1</li>
    <li>新闻标题2</li>
    <li>新闻标题3</li>
  </ul>
</div>
```

```css
.banner {
  position: relative;
}

.banner-list img {
  width: 100%;
  display: block;
}

.title-list {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  list-style: none;
  gap: 10px;
}

.title-list li {
  padding: 5px 15px;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.title-list li.active {
  background: rgba(255, 215, 0, 0.8);
}
```

### 4.4 新闻区域

```html
<div class="news">
  <!-- news-titles-list -->
  <div class="news-titles">
    <span class="active">最新</span>
    <span>热门</span>
    <span>新闻</span>
  </div>

  <!-- 公告 -->
  <div class="notice">
    <span class="icon">📢</span>
    <span class="text">维护公告：服务器将于凌晨2点进行维护</span>
  </div>

  <!-- 新闻列表 -->
  <ul class="news-list">
    <li>
      <i class="icon-new"></i>
      <a href="#">新英雄即将上线</a>
      <span class="date">08-06</span>
    </li>
    <li>
      <i class="icon-hot"></i>
      <a href="#">版本更新公告</a>
      <span class="date">08-05</span>
    </li>
  </ul>
</div>
```

### 4.5 入口区域

```css
.entrance {
  display: flex;
}

.entrance-item {
  flex: 1;
  text-align: center;
  padding: 20px 0;
  transition: transform 0.3s ease;
}

.entrance-item:hover {
  transform: scale(1.1);  /* 悬停放大 */
}
```

### 4.6 视频列表

```html
<div class="video-list">
  <div class="video-item">
    <div class="cover">
      <img src="images/video1.jpg" alt="视频封面" />
      <div class="play-icon">▶</div>
    </div>
    <h3 class="title">视频标题</h3>
    <p class="subtitle">副标题描述</p>
  </div>
  <!-- 更多 video-item -->
</div>
```

```css
.video-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.video-item {
  flex: 0 0 calc(25% - 15px);  /* 四列 */
  cursor: pointer;
}

.video-item .cover {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.video-item .cover img {
  width: 100%;
  display: block;
  transition: transform 0.3s;
}

.video-item:hover .cover img {
  transform: scale(1.05);  /* 悬停放大效果 */
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  opacity: 0;
  transition: opacity 0.3s;
}

.video-item:hover .play-icon {
  opacity: 1;
}
```

### 4.7 tab 控件封装

```css
/* 等分 tab */
.tab-control {
  display: flex;
}

.tab-control .tab-item {
  flex: 1;              /* 等分 */
  text-align: center;
  padding: 10px 0;
  cursor: pointer;
}

.tab-control .tab-item.active {
  color: #ffd700;
  border-bottom: 2px solid #ffd700;
}
```

---

## 五、弘源海购项目（移动端）

### 5.1 项目结构

```
弘源海购/
├── index.html
├── css/
│   ├── base.css        # 基础样式
│   └── index.css       # 首页样式
└── images/             # 图片资源
```

### 5.2 模块划分

```html
<!-- tabbar 底部导航 -->
<div class="tabbar">
  <a href="#" class="tabbar-item active">
    <i class="icon-home"></i>
    <span>首页</span>
  </a>
  <a href="#" class="tabbar-item">
    <i class="icon-category"></i>
    <span>分类</span>
  </a>
  <a href="#" class="tabbar-item">
    <i class="icon-cart"></i>
    <span>购物车</span>
  </a>
  <a href="#" class="tabbar-item">
    <i class="icon-profile"></i>
    <span>我的</span>
  </a>
</div>

<!-- 补贴模块 -->
<div class="subsidy">
  <div class="subsidy-item">
    <img src="images/subsidy1.png" alt="" />
    <span class="price">¥9.9</span>
  </div>
  <!-- ... -->
</div>

<!-- 分类商品 -->
<div class="category">
  <div class="category-item">
    <img src="images/cat1.png" alt="" />
    <span>食品</span>
  </div>
  <!-- ... -->
</div>

<!-- 商品列表 -->
<div class="product-list">
  <div class="product-item">
    <img src="images/product1.jpg" alt="" />
    <h4>商品名称</h4>
    <p class="desc">商品描述</p>
    <div class="tags">
      <span class="tag">包邮</span>
      <span class="tag">特价</span>
    </div>
    <p class="price">¥99.00</p>
  </div>
  <!-- ... -->
</div>
```

### 5.3 移动端基础样式

```css
/* 移动端基础重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
  background-color: #f5f5f5;
}

img {
  display: block;
  width: 100%;
}

a {
  text-decoration: none;
  color: inherit;
}
```

---

## 自测问题

<details>
<summary>1. CSS 自定义属性如何定义和使用？</summary>

在 `:root` 中用 `--变量名` 定义，用 `var(--变量名)` 使用。
</details>

<details>
<summary>2. `calc(100% - 200px)` 的作用是什么？</summary>

计算父容器宽度减去 200px 后的值，常用于响应式布局。
</details>

<details>
<summary>3. 如何实现单行文本溢出显示省略号？</summary>

```css
white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
```

</details>

<details>
<summary>4. 在王者荣耀项目中，视频列表鼠标悬停放大的效果如何实现？</summary>

使用 `transition: transform 0.3s;` 配合 `:hover` 时设置 `transform: scale(1.05)`。
</details>

<details>
<summary>5. 项目中「子绝父相」模式在哪些地方使用了？</summary>

轮播图标题定位、视频播放图标定位、新闻列表图标定位等。子元素 absolute 定位，父元素 relative 定位。
</details>

---

> 下一课：[[0017-css-extra-topics|第17课：CSS 补充主题]]