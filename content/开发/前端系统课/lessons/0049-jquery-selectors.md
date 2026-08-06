---
title: 第49课：jQuery 选择器与过滤器
description: jQuery 基本选择器、层级选择器、过滤选择器、表单选择器和过滤器 API
date: 2026-08-06
tags:
  - jQuery
  - 选择器
  - 过滤器
---

# 第49课：jQuery 选择器与过滤器

## 学习目标

- 掌握 jQuery 的基本选择器和层级选择器
- 理解 jQuery 扩展选择器与 CSS 伪类选择器的区别
- 熟练使用过滤器 API（eq、first、last、not、filter）
- 理解链式调用的实现原理

---

## 一、基本选择器

jQuery 的选择器完全兼容 CSS 语法，并在此基础上做了扩展：

| 选择器 | 示例 | 说明 |
|--------|------|------|
| ID 选择器 | `$('#list')` | 匹配 id 为 list 的元素 |
| 类选择器 | `$('.li-1')` | 匹配 class 为 li-1 的元素 |
| 元素选择器 | `$('li')` | 匹配所有 li 元素 |
| 后代选择器 | `$('ul li')` | 匹配 ul 内部所有 li 元素 |
| 子代选择器 | `$('ul > li')` | 匹配 ul 的直接子元素 li |
| 并集选择器 | `$('.li-1, .li-2')` | 匹配多个选择器的元素 |

```html
<ul id="list">
  <li class="li-1">li-1</li>
  <li class="li-2">li-2</li>
  <li class="li-3">li-3</li>
  <li class="li-4">li-4</li>
  <li class="li-5">li-5</li>
</ul>

<script>
  console.log($('.li-1'))      // 类选择器
  console.log($('#list'))      // ID 选择器
  console.log($('ul li'))      // 后代选择器
</script>
```

---

## 二、jQuery 扩展选择器

CSS3 标准选择器中有 `:nth-child()` 等伪类选择器，但缺少 `:eq()`、`:first` 等。jQuery 额外扩展了这些选择器：

| 扩展选择器 | 说明 | 示例 |
|-----------|------|------|
| `:eq(index)` | 匹配索引为 index 的元素（从 0 开始） | `$('ul li:eq(1)')` |
| `:first` | 匹配第一个元素 | `$('ul li:first')` |
| `:last` | 匹配最后一个元素 | `$('ul li:last')` |
| `:odd` | 匹配索引为奇数的元素（1, 3, 5...） | `$('ul li:odd')` |
| `:even` | 匹配索引为偶数的元素（0, 2, 4...） | `$('ul li:even')` |

> [!NOTE] 原生 querySelector 不支持 :eq
> `document.querySelector('ul li:eq(1)')` 在原生 JavaScript 中不会生效，这是 jQuery 独有的扩展选择器。

```javascript
// jQuery 扩展选择器（原生 CSS 不支持）
console.log($('ul li:eq(1)'))    // 第2个 li
console.log($('ul li:first'))    // 第1个 li
console.log($('ul li:last'))     // 最后1个 li
console.log($('ul li:odd'))      // 奇数行
console.log($('ul li:even'))     // 偶数行
```

---

## 三、过滤器 API（方法形式）

过滤器也可以作为 jQuery 原型上的方法调用，这比选择器字符串更加灵活，并且支持链式调用。

| 方法 | 说明 | 示例 |
|------|------|------|
| `eq(index)` | 获取指定索引的元素 | `$('li').eq(2)` |
| `first()` | 获取第一个元素 | `$('li').first()` |
| `last()` | 获取最后一个元素 | `$('li').last()` |
| `not(selector)` | 排除匹配的元素 | `$('li').not('.li-1')` |
| `filter(selector)` | 筛选匹配的元素 | `$('li').filter('.li-4')` |
| `odd()` | 获取奇数索引的元素 | `$('li').odd()` |
| `even()` | 获取偶数索引的元素 | `$('li').even()` |

### 3.1 选择器与 API 的对比

```javascript
// 选择器字符串方式
$('ul li:eq(2)')

// API 方法方式
$('ul li').eq(2)

// API 方式更灵活：可以分步操作
var $li = $('ul li')
$li.eq(2).css('color', 'red')
```

### 3.2 not 和 filter 的使用

```javascript
// not：排除不需要的元素
$('ul li').not('.li-1')
$('ul li').not('.li-1, .li-2')

// filter：筛选出需要的元素
$('ul li').filter('.li-4')
$('ul li').filter('.li-4, .li-3')

// filter 支持函数作为参数
$('ul li').filter(function(index) {
  return index > 2
})
```

---

## 四、链式调用

jQuery 的**链式调用**是其最优雅的特性之一。原理是大部分方法在执行完操作后返回 `this`（即当前的 jQuery 对象），允许继续调用其他方法。

```javascript
// 链式调用示例
$('ul li')
  .filter('.li-2, .li-3, .li-4')
  .eq(1)
  .css('color', 'red')

// 等价于
var $els = $('ul li')
var $filtered = $els.filter('.li-2, .li-3, .li-4')
var $target = $filtered.eq(1)
$target.css('color', 'red')
```

> [!TIP] 链式调用的使用建议
> 链式调用可以让代码更简洁，但也不要过度使用——当链条过长时，可读性反而下降。适当分行和缩进可以提高可读性。

---

## 自测问题

<details>
<summary>1. `$('ul li:eq(1)')` 和 `$('ul li').eq(1)` 有什么区别？</summary>

功能相同，都是获取第 2 个 li 元素。但前者是选择器字符串方式（jQuery 内部解析），后者是 API 方法方式（直接在原型上调用）。API 方式更灵活，可以与其他方法链式组合。
</details>

<details>
<summary>2. 如何选择索引为 2、3、4 的 li 元素？</summary>

使用过滤器 `$('ul li').filter('.li-3, .li-4, .li-5')` 或者 `$('ul li').filter(function(index) { return index >= 2 && index <= 4 })`。
</details>

<details>
<summary>3. jQuery 的链式调用是如何实现的？</summary>

jQuery 原型上的方法在执行完操作后，会返回 `this`（当前 jQuery 对象），从而允许继续调用其他方法。如 `$('ul li').filter('.li-2').eq(1).css('color', 'red')`。
</details>

<details>
<summary>4. 原生 CSS 的 :nth-child(2) 与 jQuery 的 :eq(1) 有什么不同？</summary>

`:nth-child(2)` 是 CSS 标准伪类，匹配父元素的第二个子元素（按兄弟顺序），不要求元素类型。`:eq(1)` 是 jQuery 扩展，匹配集合中索引为 1 的元素（从 0 开始）。另外 `:nth-child` 的索引从 1 开始，而 `:eq` 从 0 开始。
</details>