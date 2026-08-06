---
title: 第50课：jQuery DOM 操作
description: jQuery 属性操作、样式操作、类操作、CSS 方法和内容操作
date: 2026-08-06
tags:
  - jQuery
  - DOM 操作
  - CSS
---

# 第50课：jQuery DOM 操作

## 学习目标

- 掌握 jQuery 的文本操作方法（text/html/val）
- 理解 CSS 样式的获取与设置（css/width/height）
- 熟练使用 class 操作（addClass/removeClass/toggleClass）
- 区分 attr、prop 和 data 三种属性操作
- 掌握 DOM 元素的插入、删除、替换和克隆

---

## 一、文本内容操作

### 1.1 text() —— 纯文本内容

类似于原生 `textContent`，只操作文本，不解析 HTML 标签。

```javascript
// 获取文本内容（返回所有子元素的文本拼接）
var text = $('ul').text()

// 设置文本内容（会覆盖原有的子元素）
$('ul').text('新的文本内容')

// 设置文本内容时，HTML 标签会被转义为普通文本
$('ul').text('<span>带标签的文本</span>')
// 页面显示的是：<span>带标签的文本</span>（作为纯文本）
```

### 1.2 html() —— HTML 内容

类似于原生 `innerHTML`，获取或设置元素的 HTML 结构。

```javascript
// 获取 HTML 内容
var html = $('ul').html()

// 设置 HTML 内容（会替换原有的子元素）
$('ul').html('<li>新的列表项</li>')

// HTML 标签会被解析渲染
$('ul').html('<span style="color:red">红色文字</span>')
```

### 1.3 val() —— 表单值

类似于原生 `value`，用于获取或设置表单元素的 value 属性。

```html
<input type="text" class="username" value="请输入用户名">

<script>
  // 获取值
  var value = $('.username').val()
  console.log(value) // "请输入用户名"

  // 设置值
  $('.username').val('新的值')
</script>
```

> [!NOTE] text/html/val 三者分工
> - `text()`：操作纯文本（转义标签）
> - `html()`：操作 HTML 结构（解析标签）
> - `val()`：操作表单元素的 value 值

---

## 二、CSS 样式操作

### 2.1 css() 方法

`css()` 方法既可以获取样式值，也可以设置样式值。

```javascript
// 获取单个样式（返回带单位的字符串）
var width = $('ul').css('width')
console.log(width)   // "223px"

// 获取多个样式（返回对象）
var styles = $('ul').css(['width', 'height'])
console.log(styles)  // { width: "223px", height: "105px" }

// 设置单个样式
$('ul').css('width', '450px')

// 设置多个样式（传入对象）
$('ul').css({
  width: 100,
  height: 100,
  color: 'red'
})

// 链式调用 + 过滤器组合
$('ul li')
  .css('color', 'green')
  .odd()
  .css({ color: 'red' })
```

### 2.2 width() 和 height()

专门用于获取/设置元素的宽高，与 `css('width')` 不同，返回的是数值（不带单位）。

```javascript
// 获取宽度（数值，无单位）
var w = $('ul').width()
console.log(w)   // 223

// 设置宽度
$('ul').width(300)

// 设置带单位的字符串也可以
$('ul').width('300px')

// 获取内部宽高（不包括 padding, border）
$('ul').innerWidth()
$('ul').innerHeight()

// 获取外部宽高（包括 border）
$('ul').outerWidth()
$('ul').outerHeight(true)  // true 表示包括 margin
```

---

## 三、Class 操作

jQuery 提供一组专门操作 class 属性的方法：

| 方法 | 说明 |
|------|------|
| `addClass(className)` | 添加一个或多个类 |
| `removeClass(className)` | 移除一个或多个类 |
| `toggleClass(className)` | 切换类（存在则删除，不存在则添加） |
| `hasClass(className)` | 判断是否包含某个类 |

```javascript
// 添加类
$('ul').addClass('active')
$('ul').addClass('active highlight')  // 一次添加多个

// 移除类
$('ul').removeClass('panel')
$('ul').removeClass('panel active')   // 一次移除多个

// 切换类
$('ul').toggleClass('active')

// 判断类是否存在
if ($('ul').hasClass('panel')) {
  console.log('包含 panel 类')
}
```

> [!TIP] class 操作与 css() 的选用
> 操作样式时优先使用 class 操作（`addClass`/`removeClass`），而非直接使用 `css()`。这样做的好处是：样式逻辑集中在 CSS 文件中，便于维护；且 class 切换天然支持状态管理。

---

## 四、属性的操作

### 4.1 attr() —— HTML 属性

操作元素在 HTML 标签上显式定义的属性。

```html
<ul id="list" name="liujun" age="17">
  <li class="li-1">li-1</li>
</ul>

<script>
  // 获取属性值
  console.log($('ul').attr('id'))     // "list"
  console.log($('ul').attr('name'))   // "liujun"

  // 设置属性值
  $('ul').attr('id', 'box')

  // 设置多个属性值
  $('ul').attr({
    id: 'container',
    class: 'panel',
    name: 'coder'
  })

  // 删除属性
  $('ul').removeAttr('id')
  $('ul').removeAttr('name')
</script>
```

### 4.2 prop() —— DOM 属性

操作 DOM 元素对象上的属性（如 checked、selected、disabled 等布尔值属性）。

```javascript
// 获取布尔值属性（推荐使用 prop）
console.log($('input').prop('checked'))  // true / false

// 设置布尔值属性
$('input').prop('checked', true)
$('input').prop('disabled', false)
```

> [!WARNING] attr 与 prop 的区别
> - `attr` 操作的是 HTML 标签上的属性（attribute），获取的是字符串
> - `prop` 操作的是 DOM 对象上的属性（property），获取的是原始类型的值
> - 对于 checked、selected、disabled 等布尔值属性，**必须使用 `prop()`**，用 `attr()` 可能得到 undefined 或字符串

### 4.3 data() —— 数据存储

`data()` 用于在元素上存储/读取数据，不会直接反映在 HTML 标签上。

```javascript
// 在元素上存储数据
$('ul').data('name', 'coderwhy')
$('ul').data('age', 18)

// 读取数据
console.log($('ul').data('name'))  // "coderwhy"
console.log($('ul').data('age'))   // 18

// 读取 data-* 属性（HTML5 自定义数据属性）
// <div data-user-id="12345">...</div>
console.log($('div').data('userId'))  // 12345
```

---

## 五、DOM 插入操作

jQuery 提供了两组插入方法，区别在于**调用的对象**和**插入的位置**：

### 5.1 在选中元素内部插入

| 方法 | 说明 |
|------|------|
| `append(content)` | 在选中元素内部的末尾插入 |
| `prepend(content)` | 在选中元素内部的开头插入 |

```javascript
// 在 ul 末尾插入内容
$('ul').append('<li>新增的 li</li>')

// 在 ul 开头插入内容
$('ul').prepend('<li>最前面的 li</li>')
```

### 5.2 在选中元素外部插入

| 方法 | 说明 |
|------|------|
| `before(content)` | 在选中元素的前面插入（兄弟关系） |
| `after(content)` | 在选中元素的后面插入（兄弟关系） |

```javascript
// 在 ul 前面插入
$('ul').before('<div>ul 前面的 div</div>')

// 在 ul 后面插入
$('ul').after('<div>ul 后面的 div</div>')
```

### 5.3 参数类型

插入方法的参数可以是多种类型：

```javascript
// 字符串（HTML/纯文本）
$('ul').append('文本')
$('ul').append('<li>新元素</li>')

// jQuery 对象
var $newLi = $('<li>').text('动态创建')
$('ul').append($newLi)

// DOM 元素
var newLi = document.createElement('li')
newLi.textContent = '原生创建'
$('ul').append(newLi)

// 函数
$('ul').append(function(index, html) {
  return '<li>第 ' + (index + 1) + ' 个</li>'
})
```

---

## 六、DOM 删除/替换/克隆

### 6.1 删除元素

```javascript
// remove()：移除元素及其所有子元素（返回被删除的元素）
var $removed = $('.li-1').remove()
// 被删除的元素仍然可以继续操作

// empty()：清空元素的所有子节点（保留自身）
$('ul').empty()
// ul 标签还在，但内部的 li 全部被清空
```

### 6.2 替换元素

```javascript
// replaceWith()：将选中元素替换为新内容
$('.li-1').replaceWith('<li>被替换的新 li</li>')

// replaceAll()：与 replaceWith 相反（新内容.replaceAll(目标)）
$('<li>被替换的新 li</li>').replaceAll('.li-1')
```

### 6.3 克隆元素

```javascript
// clone()：克隆元素（可传递参数）
// clone(true) 表示同时克隆事件处理函数
var $cloned = $('.li-1').clone(true)
$('ul').append($cloned)
```

> [!TIP] clone() 的参数
> `clone()` 不带参数或传入 `false` 时只克隆结构和样式，不克隆事件。传入 `true` 时会深度克隆，包括事件监听。

---

## 自测问题

<details>
<summary>1. text() 和 html() 有什么区别？</summary>

`text()` 操作纯文本内容，HTML 标签会被转义为普通文本；`html()` 操作 HTML 内容，标签会被解析渲染。`text()` 对应原生 `textContent`，`html()` 对应原生 `innerHTML`。
</details>

<details>
<summary>2. 对于复选框的 checked 属性，应该用 attr() 还是 prop()？</summary>

应该使用 `prop()`。因为 `checked` 是 DOM 属性（property），反映的是元素的当前状态（选中/未选中），是布尔值。`attr()` 获取的是 HTML 标签上的初始属性值，是字符串，不能准确反映状态的动态变化。
</details>

<details>
<summary>3. append() 和 after() 有什么区别？</summary>

`append()` 将内容插入到选中元素的内部末尾（成为子元素），而 `after()` 将内容插入到选中元素的外部后面（成为兄弟元素）。
</details>

<details>
<summary>4. remove() 和 empty() 有什么区别？</summary>

`remove()` 会将元素自身从 DOM 中移除（包括所有子节点），返回被移除的元素可以再次追加。`empty()` 只清空元素的所有子节点，元素自身保留在 DOM 中。
</details>