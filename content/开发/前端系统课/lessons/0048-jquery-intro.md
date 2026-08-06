---
title: 第48课：jQuery 入门
description: jQuery 框架介绍、引入方式、$ 函数、入口函数与冲突处理
date: 2026-08-06
tags:
  - jQuery
  - JavaScript
  - 前端框架
---

# 第48课：jQuery 入门

## 学习目标

- 了解 jQuery 是什么以及它的核心优势
- 掌握 jQuery 的两种引入方式（CDN 和下载源码）
- 理解 `$` 工厂函数的五种参数类型
- 掌握 jQuery 入口函数的使用场景
- 熟悉 `noConflict` 解决变量名冲突的方法

---

## 一、jQuery 简介

jQuery 是一个快速、简洁的 JavaScript 框架，极大地简化了 DOM 操作、事件处理、动画和 Ajax 交互。它的核心理念是 **"Write Less, Do More"**。

### 核心特点

1. **强大的选择器** —— 兼容 CSS 所有选择器并扩展了更多选择方式
2. **链式调用** —— 大部分方法返回 jQuery 对象自身，支持连续调用
3. **隐式迭代** —— 操作集合元素时自动遍历，无需手动循环
4. **事件处理** —— 统一的事件绑定/解绑机制
5. **跨浏览器兼容** —— 抹平浏览器差异

> [!NOTE] 版本说明
> 课程中使用的是 jQuery 3.6.0 版本，这是 jQuery 3.x 系列的最新稳定版，也是目前生产环境广泛使用的版本。

---

## 二、引入 jQuery

### 2.1 使用 CDN 引入

```html
<!-- 方法一：使用 CDN 引入（推荐用于生产环境） -->
<script src="https://code.jquery.com/jquery-3.6.0.js"></script>
```

引入后，浏览器会加载并执行该 JS 文件，在全局注册两个函数：

- `window.jQuery` —— 工厂函数
- `window.$` —— 工厂函数的别名

> [!TIP] CDN 的 integrity 与 crossorigin
> 加载第三方 CDN 资源时，建议添加 `integrity` 属性进行完整性校验，防止资源被篡改。`crossorigin="anonymous"` 表示跨域请求时不携带用户凭证。

### 2.2 下载源码引入

```html
<!-- 方法二：下载到本地后通过相对路径引入 -->
<script src="./libs/jquery-3.6.0.js"></script>
```

下载方式：访问 [jQuery 官网](https://jquery.com/) 或 CDN 链接，保存文件到项目目录。

### 2.3 验证引入是否成功

```javascript
// 检查 jQuery 函数是否存在
console.log(typeof jQuery)  // "function"
console.log(typeof $)        // "function"
console.log($ === jQuery)    // true
```

---

## 三、初体验：计数器案例

### 3.1 原生 JavaScript 实现

```html
<button class="sub">-</button>
<span class="counter">0</span>
<button class="add">+</button>

<script>
  var subBtn = document.querySelector('.sub')
  var counterSpan = document.querySelector('.counter')
  var addBtn = document.querySelector('.add')
  var counter = 0

  subBtn.onclick = function() {
    counterSpan.textContent = --counter
  }
  addBtn.onclick = function() {
    counterSpan.textContent = ++counter
  }
</script>
```

### 3.2 jQuery 实现

```html
<script src="./libs/jquery-3.6.0.js"></script>
<script>
  var $sub = jQuery('.sub')
  var $span = jQuery('.counter')
  var $add = jQuery('.add')
  var counter = 0

  $sub.on('click', function() {
    $span.text(--counter)
  })
  $add.on('click', function() {
    $span.text(++counter)
  })
</script>
```

**对比分析**：
| 原生 | jQuery |
|------|--------|
| `document.querySelector()` | `jQuery()` 或 `$()` |
| `element.textContent` | `$element.text()` |
| `element.onclick` | `$element.on()` |

> [!NOTE] jQuery 变量命名约定
> 通常用 `$` 前缀命名 jQuery 对象变量（如 `$sub`, `$span`），这是社区约定，便于区分 jQuery 对象和原生 DOM 对象。

---

## 四、$ 函数的五种参数

`$()` 是 jQuery 的核心工厂函数，根据参数类型不同，行为也不同：

| 参数类型 | 说明 | 示例 |
|---------|------|------|
| 假值 | 返回空的 jQuery 对象 | `$('')`, `$(null)`, `$(undefined)` |
| 字符串（CSS 选择器） | 查找匹配元素 | `$('ul li')` |
| 字符串（HTML 片段） | 创建 DOM 元素 | `$('<div>我是div</div>')` |
| DOM 元素 | 包装成 jQuery 对象 | `$(document.body)` |
| 函数 | 文档加载完成后执行 | `$(function() { ... })` |

### 4.1 创建元素

```javascript
// 创建单个元素
var $div = $('<div>')
// document.createElement('div')

// 创建多个元素并追加到 body
var $els = $(`
  <div>我是div</div>
  <p>我是一个p</p>
`)
$els.appendTo('body')
```

---

## 五、入口函数（文档加载监听）

### 5.1 DOMContentLoaded 与 load

| 事件 | 触发时机 |
|------|---------|
| `DOMContentLoaded` | DOM 树解析完成，外部资源（图片等）可能未加载完 |
| `load` | 所有资源（包括图片、样式）全部加载完成 |

> [!TIP] 推荐使用 DOMContentLoaded
> 大多数情况下，只需 DOM 树就绪即可操作元素，不必等待图片加载完成，这样性能更好。

### 5.2 jQuery 入口函数的三种写法

```javascript
// 写法一：最常用，简写形式
$(function() {
  // DOM 解析完成后执行
})

// 写法二：标准形式
$(document).ready(function() {
  // DOM 解析完成后执行
})

// 写法三：监听 window load
$(window).on('load', function() {
  // 所有资源加载完成后执行
})
```

### 5.3 入口函数的作用

- 确保 DOM 元素已存在，避免操作不存在的元素报错
- 将 script 标签放在 body 的任何位置都能正常工作

```html
<script src="../libs/jquery-3.6.0.js"></script>
<script>
  // 即使 script 在 body 上方，也能正常工作
  $(function() {
    var $sub = jQuery('.sub')
    var $span = jQuery('.counter')
    var $add = jQuery('.add')
    // ...
  })
</script>

<button class="sub">-</button>
<span class="counter">0</span>
<button class="add">+</button>
```

---

## 六、变量名冲突处理

### 6.1 $ 符号冲突

当页面中同时使用其他也占用 `$` 变量的库（如 Prototype）时，会发生冲突。

```javascript
// 方案一：使用 jQuery 全名代替 $
jQuery('body').text('hello')

// 方案二：使用 noConflict 释放 $，然后定义新的简写
var hy = jQuery.noConflict()
hy('body').text('hello')
```

### 6.2 jQuery 变量冲突

```javascript
// 释放 jQuery 变量名
var newJQ = jQuery.noConflict(true)
// 此时 jQuery 和 $ 都不可用，需要用 newJQ
```

### 6.3 立即执行函数保护 $（推荐）

```javascript
// 利用立即执行函数，保证函数内的 $ 指向 jQuery
;(function($) {
  // 这里的 $ 就是 jQuery，不受外部影响
  $('body').text('hello')
})(jQuery)
```

---

## 七、jQuery 架构设计图

jQuery 的源码架构采用经典的 IIFE（立即执行函数表达式）模式，避免污染全局作用域：

```javascript
;(function(global, factory) {
  factory(global)
})(window, function(window) {
  // 核心构造函数
  function jQuery(selector) {
    return new jQuery.fn.init(selector)
  }

  // 原型方法
  jQuery.prototype = {
    constructor: jQuery,
    // text, css, attr 等方法...
  }

  // 类方法（静态方法）
  jQuery.noConflict = function() {}
  jQuery.isArray = function() {}

  jQuery.fn = jQuery.prototype

  // 真正的构造函数
  jQuery.fn.init = function(selector) {
    // CSS 选择器查找元素
    var el = document.querySelector(selector)
    this[0] = el
    this.length = 1
    return this
  }

  // 让 init 的实例访问 jQuery 原型
  jQuery.fn.init.prototype = jQuery.fn

  // 暴露到全局
  window.jQuery = window.$ = jQuery
})
```

这一架构模式实现了：
- **不用 new 关键字**：用户直接调用 `$()`，内部通过 `new init()` 创建实例
- **原型共享**：`init.prototype = jQuery.fn`，确保 `$()` 返回的对象能访问 jQuery 的所有原型方法

---

## 自测问题

<details>
<summary>1. jQuery 的 $ 函数传入一个选择器字符串时，返回的是什么？</summary>

返回一个 jQuery 对象（类数组对象），包含匹配到的 DOM 元素。这个对象拥有 jQuery 原型上的所有方法，可以链式调用。
</details>

<details>
<summary>2. 入口函数 $(function(){}) 在什么时候执行？</summary>

在 DOM 树解析完成后立即执行，相当于原生 `DOMContentLoaded` 事件。这比 `window.onload` 更早触发，因为不需要等待图片等外部资源的加载。
</details>

<details>
<summary>3. 如何解决 jQuery 的 $ 符号与其他库的冲突？</summary>

有三种方式：使用 `jQuery` 全名代替 `$`；调用 `jQuery.noConflict()` 释放 `$`；使用立即执行函数 `;(function($) { ... })(jQuery)` 隔离作用域。
</details>

<details>
<summary>4. jQuery 源码中为什么不需要写 new 关键字？</summary>

因为 `jQuery` 函数内部已经通过 `return new jQuery.fn.init(selector)` 创建了实例，外部调用 `$()` 时无需再使用 `new`。同时通过 `init.prototype = jQuery.fn` 确保实例能访问 jQuery 的所有原型方法。
</details>