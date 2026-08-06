---
title: 第06课：CSS 选择器详解
description: 通配选择器、简单选择器、属性选择器、后代选择器、兄弟选择器、选择器组、伪类、伪元素
date: 2026-08-06
tags:
  - css
  - course
  - web
---

# 第06课：CSS 选择器详解

## 学习目标

- 掌握所有常用 CSS 选择器的语法和用法
- 理解不同选择器的优先级
- 掌握伪类的使用方法（尤其是动态伪类）
- 掌握伪元素（before/after）的使用

---

## 一、选择器分类总览

```mermaid
graph TD
    A[CSS选择器] --> B[基础选择器]
    A --> C[组合选择器]
    A --> D[伪类/伪元素]
    
    B --> B1[通配选择器 *]
    B --> B2[元素选择器 div]
    B --> B3[类选择器 .class]
    B --> B4[ID选择器 #id]
    B --> B5[属性选择器 [attr]]
    
    C --> C1[后代选择器 空格]
    C --> C2[直接后代 >]
    C --> C3[相邻兄弟 +]
    C --> C4[通用兄弟 ~]
    C --> C5[交集选择器]
    C --> C6[并集选择器]
```

---

## 二、基础选择器

### 2.1 通配选择器

```css
/* 选中页面上所有元素 */
* {
  margin: 0;
  padding: 0;
}
```

> [!WARNING]
> 通配选择器会匹配所有元素，在大项目中使用可能影响性能。推荐用 `reset.css` 或 `normalize.css` 替代。

### 2.2 元素选择器（标签选择器）

```css
/* 选中所有 div 元素 */
div {
  border: 1px solid #ccc;
}

/* 选中所有 p 元素 */
p {
  color: #333;
}

/* 选中所有 h1 元素 */
h1 {
  font-size: 28px;
}
```

### 2.3 类选择器

```css
/* 选中所有 class="box" 的元素 */
.box {
  width: 200px;
  height: 200px;
  background-color: #f0f0f0;
}

/* 多个类组合 */
.box.rounded {
  border-radius: 10px;
}
```

```html
<div class="box rounded"></div>
```

> [!TIP]
> 一个元素可以有多个类名（用空格分隔）。类选择器**可重复**，是最常用的选择器。

### 2.4 ID 选择器

```css
/* 选中 id="header" 的元素 */
#header {
  background-color: #2c3e50;
  color: white;
}
```

```html
<div id="header">网站头部</div>
```

> [!WARNING]
> ID 在页面中必须唯一。ID 选择器的优先级高于类选择器。

---

## 三、属性选择器

```css
/* 带有 title 属性的元素 */
[title] {
  cursor: help;
}

/* title 属性值等于 "hello" 的元素 */
[title="hello"] {
  color: red;
}

/* href 属性值以 https 开头的元素 */
a[href^="https"] {
  color: green;
}

/* href 属性值以 .pdf 结尾的元素 */
a[href$=".pdf"] {
  color: orange;
}

/* href 属性值包含 "example" 的元素 */
a[href*="example"] {
  font-weight: bold;
}
```

| 选择器 | 说明 |
|--------|------|
| `[attr]` | 含有 attr 属性的元素 |
| `[attr="val"]` | attr 属性值等于 val |
| `[attr^="val"]` | attr 属性值以 val 开头 |
| `[attr$="val"]` | attr 属性值以 val 结尾 |
| `[attr*="val"]` | attr 属性值包含 val |

---

## 四、组合选择器

### 4.1 后代选择器

```css
/* 选中 div 内部的所有 p（包括嵌套的子元素） */
div p {
  color: #333;
}
```

```html
<div>
  <p>直接子元素 ✓</p>
  <section>
    <p>嵌套子元素 ✓</p>
  </section>
</div>
```

### 4.2 直接后代选择器

```css
/* 选中 div 的直接子元素 p */
div > p {
  color: #c0392b;
}
```

```html
<div>
  <p>直接子元素 ✓</p>
  <section>
    <p>不是直接子元素 ✗</p>
  </section>
</div>
```

### 4.3 相邻兄弟选择器

```css
/* 选中 class="title" 后面紧邻的 p */
.title + p {
  font-weight: bold;
}
```

```html
<h2 class="title">标题</h2>
<p>这个段落会被选中 ✓</p>
<p>这个不会被选中 ✗</p>
```

### 4.4 通用兄弟选择器

```css
/* 选中 class="title" 后面所有的 p */
.title ~ p {
  color: #2980b9;
}
```

```html
<h2 class="title">标题</h2>
<p>第一个兄弟 ✓</p>
<p>第二个兄弟 ✓</p>
```

---

## 五、选择器组

### 5.1 交集选择器

```css
/* 既是 div 元素，class 又包含 "box" */
div.box {
  border: 2px solid #e74c3c;
}

/* 既是 p 元素，class 又包含 "highlight" */
p.highlight {
  background-color: yellow;
}
```

```html
<div class="box">有边框 ✓</div>
<p class="box">不匹配 ✗</p>
<p class="highlight">黄色背景 ✓</p>
```

> [!NOTE]
> 交集选择器中，元素选择器必须写在最前面。

### 5.2 并集选择器

```css
/* 同时选中 h1, h2, h3 */
h1, h2, h3 {
  font-weight: bold;
  color: #2c3e50;
}

/* 选中多个不同类型的元素 */
h1, .box, #footer {
  margin-bottom: 20px;
}
```

---

## 六、伪类

伪类用于描述元素的特殊状态。

### 6.1 动态伪类

```css
/* 链接相关 */
a:link {
  color: blue;        /* 未访问 */
}
a:visited {
  color: purple;      /* 已访问 */
}
a:hover {
  color: red;         /* 鼠标悬停 */
}
a:active {
  color: orange;      /* 鼠标按下 */
}

/* 输入聚焦 */
input:focus {
  outline: 2px solid #3498db;
}
```

> [!TIP]
> 记忆顺序：**L**ink — **V**isited — **H**over — **A**ctive（LVHA）。

### 6.2 结构伪类

```css
/* 第一个子元素 */
li:first-child {
  color: red;
}

/* 最后一个子元素 */
li:last-child {
  color: blue;
}

/* 第2个子元素 */
li:nth-child(2) {
  font-weight: bold;
}

/* 奇数位置 */
li:nth-child(odd) {
  background-color: #f9f9f9;
}
li:nth-child(2n+1) {
  background-color: #f9f9f9;
}

/* 偶数位置 */
li:nth-child(even) {
  background-color: #eef;
}
li:nth-child(2n) {
  background-color: #eef;
}

/* 前3个 */
li:nth-child(-n+3) {
  border-bottom: 1px solid #ccc;
}

/* 第2个同类型元素 */
li:nth-of-type(2) {
  color: green;
}
```

### 6.3 否定伪类

```css
/* 选中所有不是 .special 的 li */
li:not(.special) {
  color: #666;
}

/* 选中所有不是第一个的 p */
p:not(:first-child) {
  text-indent: 2em;
}
```

### 6.4 其他伪类

```css
/* :root 等同于 html */
:root {
  --primary-color: #3498db;
}

/* 空元素 */
div:empty {
  display: none;
}
```

---

## 七、伪元素

伪元素用于创建不存在于 DOM 中的元素或选择元素的特定部分。

### 7.1 first-line 和 first-letter

```css
/* 选中元素的第一个字母 */
p::first-letter {
  font-size: 2em;
  font-weight: bold;
  color: #c0392b;
}

/* 选中元素的第一行 */
p::first-line {
  font-weight: bold;
}
```

### 7.2 before 和 after（最常用）

```css
/* 在元素内容前插入 */
.element::before {
  content: "→ ";
  color: #3498db;
}

/* 在元素内容后插入 */
.element::after {
  content: " ←";
  color: #3498db;
}
```

**伪元素的特点**：

- `content` 属性**不能省略**（可以为空字符串）
- 默认是**行内级元素**
- 可设置 `display: block` 或 `display: inline-block` 来改变布局
- 通过伪元素生成的内容不会被 DOM 树捕获

**实用案例**：

```css
/* 清除浮动 */
.clearfix::after {
  content: "";
  display: block;
  clear: both;
}

/* 图标 */
.icon-star::before {
  content: "";
  display: inline-block;
  width: 16px;
  height: 16px;
  background-image: url("star.png");
  background-size: cover;
}
```

> [!NOTE]
> 伪元素用 `::`（CSS3 语法），伪类用 `:`（CSS3 语法）。为了向后兼容，CSS2 中的伪元素（`:before`、`:after`）也可用单冒号。

---

## 八、选择器优先级

| 选择器 | 权重 |
|--------|------|
| `!important` | 10000 |
| 内联样式 | 1000 |
| ID 选择器 | 100 |
| 类 / 伪类 / 属性选择器 | 10 |
| 元素选择器 | 1 |
| 通配选择器 `*` | 0 |
| 继承的样式 | 无（优先级最低） |

**计算规则**：将权重相加，数值大的优先级高。

```css
/* 权重：1 + 10 = 11 */
div .highlight { color: red; }

/* 权重：10 + 1 = 11 */
.highlight p { color: blue; }

/* 优先级相同，后面的覆盖前面 */
```

---

## 自测问题

<details>
<summary>1. 后代选择器和直接后代选择器有什么区别？</summary>

后代选择器（空格）选中所有子孙元素；直接后代选择器（`>`）只选中直接子元素。
</details>

<details>
<summary>2. 相邻兄弟选择器和通用兄弟选择器的区别？</summary>

相邻兄弟选择器（`+`）只选紧随其后的一个兄弟；通用兄弟选择器（`~`）选后面所有兄弟。
</details>

<details>
<summary>3. `:before` 和 `::before` 有什么区别？</summary>

`:before` 是 CSS2 语法，`::before` 是 CSS3 语法。CSS3 中推荐使用双冒号与伪类区分。
</details>

<details>
<summary>4. 写出以下选择器的权重：`#header .nav a`</summary>

`#header`（100）+ `.nav`（10）+ `a`（1）= 111。
</details>

<details>
<summary>5. `:nth-child(2n+1)` 选中的是哪些元素？</summary>

所有奇数位置的子元素（第1、3、5、7...个）。
</details>

---

> 下一课：[[0007-css-cascade|第07课：CSS 继承层叠]]