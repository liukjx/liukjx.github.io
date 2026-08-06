---
title: 第54课：jQuery 插件与实战项目
description: jQuery 插件开发机制、Lodash 工具库、Dayjs 时间库、Bootstrap 框架、综合实战项目
date: 2026-08-06
tags:
  - jQuery
  - 插件
  - Lodash
  - Dayjs
  - Bootstrap
  - 项目实战
---

# 第54课：jQuery 插件与实战项目

## 学习目标

- 掌握 jQuery 插件开发机制（`$.fn` 扩展）
- 了解 Lodash 工具库的常用方法
- 掌握 Dayjs 时间库的基本使用
- 了解 Bootstrap 框架的网格系统和组件
- 回顾综合实战项目（HYBeiKe / HYSmartLife）

---

## 一、jQuery 插件开发

### 1.1 插件开发原理

jQuery 的插件机制基于原型扩展。`$.fn` 就是 `jQuery.prototype`，在 `$.fn` 上添加方法，所有 jQuery 对象都能调用。

```javascript
// 插件的基本结构
;(function(window, $) {

  // 在 jQuery 原型上添加方法
  $.fn.showlinklocation = function() {
    // this 指向调用该方法的 jQuery 对象
    this.filter('a').each(function() {
      var $a = $(this)          // DOM Element -> jQuery 对象
      var link = $a.attr('href') // 获取 a 标签的 href 属性
      $a.append(`(${link})`)     // 在链接文本后追加地址
    })
    return this  // 返回 this 支持链式调用
  }

})(window, jQuery)

// 使用插件
$('a').showlinklocation().css('color', 'red')
```

### 1.2 插件开发规范

| 规范 | 说明 |
|------|------|
| 使用 IIFE | 避免全局变量污染 |
| 传入 `window` 和 `jQuery` | 提高性能，方便压缩 |
| 方法最后 `return this` | 支持链式调用 |
| 文件命名 | `jquery.插件名.js` |

---

## 二、Lodash 工具库

Lodash 是一个一致性、模块化、高性能的 JavaScript 实用工具库，提供了大量数组、对象、函数等操作的方法。

### 2.1 引入与基本使用

```html
<script src="./libs/lodash-4.17.21.js"></script>
<script>
  console.log(_.VERSION)           // 查看版本号
  console.log(_.join([2022, 6, 23], '-'))  // "2022-6-23"
</script>
```

### 2.2 Number 操作

```javascript
// 随机数
_.random(1, 100)      // 1 到 100 之间的随机整数

// 范围
_.range(5)            // [0, 1, 2, 3, 4]
_.range(1, 5)         // [1, 2, 3, 4]
```

### 2.3 String 操作

```javascript
_.pad('abc', 8)              // "  abc   "（两端补空格）
_.startsWith('hello', 'h')   // true
_.endsWith('hello', 'o')     // true
_.repeat('abc', 3)           // "abcabcabc"
```

### 2.4 Array 操作

```javascript
// 去重
_.uniq([2, 1, 2, 3, 1])     // [2, 1, 3]

// 扁平化
_.flatten([1, [2, [3]]])     // [1, 2, [3]]
_.flattenDeep([1, [2, [3]]]) // [1, 2, 3]

// 分组
_.chunk(['a', 'b', 'c', 'd'], 2)  // [['a','b'], ['c','d']]

// 移除假值
_.compact([0, 1, false, 2, '', 3])  // [1, 2, 3]
```

### 2.5 Object 操作

```javascript
// 合并对象
_.merge({ a: 1 }, { b: 2 })          // { a: 1, b: 2 }

// 获取对象路径的值
var obj = { a: { b: { c: 3 } } }
_.get(obj, 'a.b.c')                  // 3

// 省略指定属性
_.omit({ name: 'why', age: 18 }, 'age')  // { name: 'why' }

// 选取指定属性
_.pick({ name: 'why', age: 18 }, 'name')  // { name: 'why' }
```

### 2.6 函数操作（防抖与节流）

```javascript
// 防抖：一段时间内多次触发只执行最后一次
_.debounce(function() {
  console.log('搜索请求发送')
}, 300)

// 节流：一段时间内只执行一次
_.throttle(function() {
  console.log('滚动事件处理')
}, 100)
```

---

## 三、Dayjs 时间库

Dayjs 是一个轻量级的 JavaScript 日期处理库，API 设计与 Moment.js 一致，但体积只有 2KB。

### 3.1 基本使用

```javascript
// 创建 Dayjs 对象
var now = dayjs()         // 当前时间
console.log(dayjs().format())  // "2022-06-23T14:30:00+08:00"

// 格式化
dayjs().format('YYYY-MM-DD HH:mm:ss')
dayjs().format('YYYY 年 MM 月 DD 日')
```

### 3.2 获取和设置时间

```javascript
// 获取
dayjs().year()       // 2022
dayjs().month()      // 0-11（注意：从 0 开始）
dayjs().date()       // 1-31
dayjs().day()        // 星期几（0-6, 0 表示星期日）
dayjs().hour()       // 0-23
dayjs().minute()     // 0-59
dayjs().second()     // 0-59

// 设置
dayjs().year(2023)
dayjs().month(5)     // 6 月
dayjs().date(15)
```

### 3.3 时间操作

```javascript
// 加减
dayjs().add(7, 'day')       // 7 天后
dayjs().subtract(1, 'month') // 1 个月前
dayjs().add(1, 'year')      // 1 年后

// 开头/末尾
dayjs().startOf('month')    // 本月初
dayjs().endOf('year')       // 年末最后一刻
```

### 3.4 时间解析

```javascript
// 解析时间字符串
dayjs('2022-06-23')
dayjs('2022-06-23 14:30:00')

// 时间差
dayjs('2022-12-31').diff(dayjs(), 'day')  // 距离年底还有多少天
```

### 3.5 插件系统

Dayjs 通过插件扩展功能，需要使用时手动加载：

```javascript
// 加载中文语言包
dayjs.locale('zh-cn')

// 相对时间插件
// 需要加载 relativeTime 插件
dayjs.extend(window.dayjs_plugin_relativeTime)
dayjs('2021-01-01').fromNow()  // "2 年前"

// 自定义解析格式
dayjs.extend(window.dayjs_plugin_customParseFormat)
dayjs('23-06-2022', 'DD-MM-YYYY')
```

---

## 四、Bootstrap 框架

Bootstrap 是 Twitter 开发的 CSS 框架，提供了响应式布局、组件和工具类。

### 4.1 安装方式

```html
<!-- CDN 引入 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.css">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.bundle.js"></script>
```

### 4.2 响应式容器

| 类名 | 说明 |
|------|------|
| `.container` | 固定宽度且居中的容器 |
| `.container-fluid` | 全宽容器（始终 100%） |
| `.container-{breakpoint}` | 指定断点的响应式容器 |

```html
<!-- 全宽容器 -->
<div class="container-fluid">...</div>

<!-- 固定宽度容器 -->
<div class="container">...</div>

<!-- 响应式容器：大屏固定宽度，小屏全宽 -->
<div class="container-lg">...</div>
```

### 4.3 网格系统

Bootstrap 的网格系统基于 12 列布局，通过 `row` 和 `col` 类实现。

```html
<!-- 等列宽布局 -->
<div class="row">
  <div class="col">列 1</div>
  <div class="col">列 2</div>
  <div class="col">列 3</div>
</div>

<!-- 指定列宽 -->
<div class="row">
  <div class="col-4">占 4 列</div>
  <div class="col-8">占 8 列</div>
</div>

<!-- 自动列宽 -->
<div class="row">
  <div class="col-auto">根据内容自动宽度</div>
  <div class="col">占据剩余空间</div>
</div>

<!-- 响应式列 -->
<div class="row">
  <div class="col-lg-4 col-md-6 col-12">
    大屏占 4 列，中屏占 6 列，小屏占 12 列
  </div>
</div>
```

### 4.4 响应式工具类

| 类名 | 说明 |
|------|------|
| `.d-none` | 隐藏 |
| `.d-block` | 显示为块级 |
| `.d-flex` | 弹性布局 |
| `.d-{breakpoint}-none` | 指定断点以上隐藏 |
| `.d-{breakpoint}-block` | 指定断点以上显示 |

```html
<!-- 在 md 断点以上显示，以下隐藏 -->
<div class="d-none d-md-block">只在中等及以上屏幕显示</div>

<!-- 在 lg 断点以上隐藏 -->
<div class="d-lg-none">在大屏幕隐藏</div>
```

### 4.5 常用组件

Bootstrap 提供丰富的 UI 组件：导航栏（Navbar）、轮播图（Carousel）、卡片（Card）、模态框（Modal）、表单（Form）等。

```html
<!-- 导航栏组件 -->
<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <a class="navbar-brand" href="#">Logo</a>
  <div class="collapse navbar-collapse">
    <ul class="navbar-nav">
      <li class="nav-item active">
        <a class="nav-link" href="#">首页</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#">关于</a>
      </li>
    </ul>
  </div>
</nav>
```

---

## 五、综合实战项目

### 5.1 HYBeiKe（贝壳找房项目）

一个基于 jQuery + LESS + Ajax 的房源信息展示项目，实现了：

- 首页数据展示（通过封装的 `HYReq` 请求接口）
- 房源列表渲染（模板拼接或 DOM 操作）
- 搜索功能（搜索建议、关键词查询）
- 模块化代码组织（`config.js`、`request.js`、`utils.js`）

**项目目录结构**：

```
HYBeiKe/
├── index.html        # 主页面
├── css/              # LESS 样式文件
│   ├── reset.css
│   ├── common.less
│   ├── bk_header.less
│   ├── bk_new_house.less
│   ├── bk_second_house.less
│   └── variable.less
├── js/               # JavaScript 文件
│   ├── config.js     # API 地址配置
│   ├── request.js    # Ajax 请求封装
│   ├── utils.js      # 工具函数
│   ├── home.js       # 首页逻辑
│   └── home-v1.js    # 首页逻辑（V1 版本）
├── img/              # 图片资源
└── libs/             # 第三方库
    ├── jquery-3.6.0.js
    └── less.min.js
```

### 5.2 HYSmartLife（智慧生活项目）

一个基于 Bootstrap 4 的响应式企业官网项目，使用了：

- Bootstrap 的网格系统实现响应式布局
- 导航栏组件实现顶部导航
- 响应式工具类控制不同设备的显示/隐藏

---

## 自测问题

<details>
<summary>1. 如何开发一个 jQuery 插件？有什么基本规范？</summary>

在 `$.fn` 上添加方法即可。规范包括：使用 IIFE 避免全局污染；传入 `window` 和 `jQuery` 参数；方法最后 `return this` 以支持链式调用；文件命名为 `jquery.插件名.js`。
</details>

<details>
<summary>2. Lodash 的 debounce 和 throttle 有什么区别？</summary>

`debounce`（防抖）在连续触发时只执行最后一次，适用于输入框搜索建议；`throttle`（节流）在连续触发时按固定频率执行一次，适用于滚动事件、窗口缩放等高频场景。
</details>

<details>
<summary>3. Bootstrap 的网格系统基于什么原理？</summary>

基于 12 列布局系统，通过 `row`（行容器，使用 flex 布局）和 `col`（列）类实现。支持响应式断点（sm/md/lg/xl），在不同屏幕尺寸下可以设置不同的列宽。
</details>

<details>
<summary>4. Dayjs 和 Moment.js 相比有什么优势？</summary>

Dayjs 与 Moment.js API 完全兼容，但体积只有 2KB（Moment.js 约 200KB）。Dayjs 采用插件化设计，按需加载功能模块，更适合现代前端构建。
</details>