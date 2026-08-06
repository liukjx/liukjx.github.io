---
title: 第51课：jQuery 事件处理
description: jQuery 事件绑定与解绑、on/off/trigger、事件委托、事件对象与命名空间
date: 2026-08-06
tags:
  - jQuery
  - 事件
  - 事件委托
---

# 第51课：jQuery 事件处理

## 学习目标

- 掌握 `on()` 和 `off()` 绑定/解绑事件的方法
- 理解 `click()` 等快捷方法与 `on()` 的区别
- 掌握 `trigger()` 手动触发事件
- 理解事件冒泡和事件委托的机制
- 熟悉 jQuery 事件对象的常用属性和方法

---

## 一、事件绑定

### 1.1 on() 方法

`on()` 是 jQuery 中绑定事件的核心方法，统一了所有事件的绑定方式。

```javascript
$(function() {
  // 使用 on 绑定事件
  $('ul').on('click', function() {
    console.log('click 事件触发')
  })

  // 绑定鼠标移入事件
  $('ul').on('mouseenter', function() {
    console.log('mouseenter 事件触发')
  })

  // 绑定多个事件（空格分隔）
  $('ul').on('mouseenter mouseleave', function() {
    console.log('鼠标移入或移出')
  })

  // 绑定多个事件（对象形式）
  $('ul').on({
    click: function() { console.log('click') },
    mouseenter: function() { console.log('mouseenter') }
  })
})
```

### 1.2 快捷方法

jQuery 为常用事件提供了简写方法，如 `click()`、`mouseenter()`、`mouseleave()` 等。

```javascript
// 快捷绑定
$('ul').click(function() {
  console.log('click')
})

$('ul').mouseenter(function() {
  console.log('mouseenter')
})

// 快捷方法的本质是调用了 on()
// $('ul').click(fn) 等价于 $('ul').on('click', fn)
```

> [!NOTE] on 与快捷方法的关系
> 所有快捷方法（`click`、`mouseenter` 等）内部都是调用 `on()` 实现的。`on()` 是统一的底层接口，推荐始终使用 `on()`，保持代码风格一致。

---

## 二、事件解绑

### 2.1 off() 方法

```javascript
// 取消 ul 元素上所有的事件
$('ul').off()

// 取消 ul 上特定类型的事件
$('ul').off('click')
$('ul').off('mouseenter')

// 取消特定的事件处理函数
function handler() { console.log('handler') }
$('ul').on('click', handler)
$('ul').off('click', handler)  // 只移除这个函数
```

---

## 三、手动触发事件

### 3.1 trigger() 方法

用程序代码模拟用户的交互操作。

```javascript
// 模拟点击 ul 元素
$('ul').trigger('click')

// 模拟鼠标移入
$('ul').trigger('mouseenter')

// 模拟触发自定义事件
$('ul').on('customEvent', function() {
  console.log('自定义事件触发')
})
$('ul').trigger('customEvent')
```

> [!TIP] trigger 的用途
> `trigger()` 常用于：页面初始化时自动触发某个交互效果；在单元测试中模拟用户操作；触发自定义事件实现模块间通信。

---

## 四、事件对象

事件处理函数中的参数 `event` 是 jQuery 封装后的事件对象，它兼容了原生事件对象的属性和方法。

```javascript
$(function() {
  $('ul').on('click', function(event) {
    // 事件类型
    console.log(event.type)         // "click"

    // 事件目标元素（真正被点击的元素）
    console.log(event.target)       // DOM Element

    // 当前绑定事件的元素
    console.log(event.currentTarget) // ul 元素

    // 阻止默认行为（如链接跳转、表单提交）
    event.preventDefault()

    // 阻止事件冒泡
    event.stopPropagation()

    // 是否阻止了默认行为
    console.log(event.isDefaultPrevented())

    // 是否阻止了冒泡
    console.log(event.isPropagationStopped())
  })
})
```

### 4.1 事件处理函数中的 this

```javascript
$('ul li').on('click', function() {
  // this 指向原生的 DOM 元素
  console.log(this)        // <li>...</li>

  // 包装成 jQuery 对象
  var $this = $(this)
  $this.css('color', 'red')
})
```

---

## 五、事件冒泡

事件冒泡是指事件从最内层的元素开始触发，然后逐层向上传播到最外层。

```html
<ul id="list">
  <li>li-1
    <p>我是 p 元素</p>
  </li>
</ul>

<script>
  $('ul').on('click', function() {
    console.log('ul 被点击')
  })

  $('li').on('click', function(event) {
    console.log('li 被点击')
    event.stopPropagation()  // 阻止事件冒泡到 ul
  })

  $('p').on('click', function(event) {
    console.log('p 被点击')
    event.stopPropagation()  // 阻止事件冒泡到 li
  })
</script>
```

---

## 六、事件委托

事件委托利用事件冒泡机制，将子元素的事件绑定到父元素上。这对于**动态添加的元素**特别有用。

```html
<ul id="list">
  <li>li-1
    <p>我是 p 元素</p>
  </li>
</ul>

<script>
  // 方式一：在父元素上监听，然后判断 event.target
  $('ul').on('click', function(event) {
    console.log(event.target)  // 可能是 ul, li, p
  })

  // 方式二：使用事件委托（推荐）
  // 只在 li 内部的 p 元素被点击时触发
  $('ul').on('click', 'li p', function(event) {
    console.log(event.target)  // 只有 p 元素
  })

  // 动态添加的元素也能响应事件
  $('ul').append('<li>动态添加的 li</li>')
  // 新添加的 li 点击时，上面的委托也能触发
</script>
```

> [!WARNING] on 与 click 的关键区别
> 直接使用 `click()` 绑定的事件，对后续动态添加的元素**不生效**。而使用 `on()` 的委托语法（第二个参数传递选择器），对动态元素**同样有效**。

```javascript
// 这种写法对动态添加的元素不生效
$('ul li').click(function() { ... })

// 这种写法对动态添加的元素也生效（事件委托）
$('ul').on('click', 'li', function() { ... })
```

---

## 七、常见事件类型

| 事件 | 说明 |
|------|------|
| `click` | 鼠标单击 |
| `dblclick` | 鼠标双击 |
| `mouseenter` | 鼠标移入（不冒泡） |
| `mouseleave` | 鼠标移出（不冒泡） |
| `mousedown` | 鼠标按下 |
| `mouseup` | 鼠标松开 |
| `mousemove` | 鼠标移动 |
| `focus` | 获得焦点（表单元素） |
| `blur` | 失去焦点（表单元素） |
| `change` | 值改变（表单元素） |
| `submit` | 表单提交 |
| `keydown` | 键盘按下 |
| `keyup` | 键盘松开 |
| `resize` | 窗口大小改变 |
| `scroll` | 滚动 |

---

## 八、案例：选项卡切换

事件处理中常结合动画实现选项卡切换效果，其核心逻辑是：

1. 点击某个选项卡标签时，通过索引找到对应的内容面板
2. 当前标签添加激活样式，其他标签移除激活样式
3. 当前面板显示，其他面板隐藏

```javascript
// 选项卡切换核心逻辑
$('.tab-item').on('click', function() {
  var index = $(this).index()

  // 切换标签样式
  $(this).addClass('active').siblings().removeClass('active')

  // 切换内容面板
  $('.panel').eq(index).addClass('active').siblings().removeClass('active')
})
```

---

## 自测问题

<details>
<summary>1. on() 和 click() 有什么区别？</summary>

`click()` 是 `on('click', handler)` 的快捷写法，功能相同。但 `on()` 更统一，且支持事件委托语法（第二个参数传入选择器字符串），对动态元素也有效。推荐统一使用 `on()`。
</details>

<details>
<summary>2. 什么是事件委托？它的优点是什么？</summary>

事件委托是将子元素的事件绑定到父元素上，利用事件冒泡机制，通过 `event.target` 判断实际触发事件的元素。优点：减少事件监听器的数量（性能更好）；对动态添加的元素自动生效。
</details>

<details>
<summary>3. 如何阻止事件冒泡和默认行为？</summary>

调用 `event.stopPropagation()` 阻止事件冒泡；调用 `event.preventDefault()` 阻止默认行为（如链接跳转、表单提交）。也可以直接在事件处理函数中 `return false`，jQuery 中同时做了这两件事。
</details>

<details>
<summary>4. trigger() 的作用是什么？</summary>

`trigger()` 用于使用程序代码手动触发事件，包括模拟用户操作（如 `trigger('click')`）和触发自定义事件。常用于页面初始化触发效果、测试模拟用户交互等场景。
</details>