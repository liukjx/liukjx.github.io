---
title: 第108课：WXML 模板
description: 小程序 WXML 数据绑定、条件渲染、循环渲染、模板和 WXS
date: 2026-08-06
tags:
  - 小程序
  - WXML
  - 数据绑定
  - 条件渲染
  - 循环渲染
  - WXS
---

# WXML 模板

## 学习目标

- 掌握 WXML 数据绑定的语法
- 掌握条件渲染和循环渲染
- 理解 wx:key 的重要性
- 掌握 WXS 语法的使用场景

---

## 数据绑定

### 基本数据绑定

```xml
<!-- pages/index/index.wxml -->
<view>{{message}}</view>
<view>用户: {{username}}, 年龄: {{age}}</view>
<view>{{isAdmin ? '管理员' : '普通用户'}}</view>
<view>{{a + b}}</view>
<view>{{"Hello " + name}}</view>
```

```javascript
// pages/index/index.js
Page({
  data: {
    message: 'Hello World',
    username: '张三',
    age: 25,
    isAdmin: false,
    a: 10,
    b: 20,
    name: 'WeChat'
  }
});
```

### 属性绑定

```xml
<!-- 属性绑定 -->
<view id="{{itemId}}">ID 绑定</view>
<view data-user-id="{{userId}}">自定义属性</view>
<image src="{{imageUrl}}" mode="aspectFill" />
<navigator url="{{url}}">跳转</navigator>
<checkbox checked="{{isChecked}}" />
```

### 样式绑定

```xml
<!-- 类名绑定 -->
<view class="{{ isActive ? 'active' : 'normal' }}">动态类名</view>

<!-- 内联样式 -->
<view style="color: {{textColor}}; font-size: {{fontSize}}rpx;">
  动态样式
</view>

<!-- 绑定对象 -->
<view style="{{dynamicStyle}}">样式对象</view>
```

```javascript
Page({
  data: {
    isActive: true,
    textColor: '#ff0000',
    fontSize: 32,
    dynamicStyle: 'background: #f0f0f0; padding: 20rpx;'
  }
});
```

### 运算和逻辑

```xml
<!-- 三元运算 -->
<view>{{gender === 1 ? '男' : '女'}}</view>

<!-- 算术运算 -->
<view>总计: {{price * count + shipping}}</view>

<!-- 逻辑运算 -->
<view wx:if="{{isLogin && isVip}}">VIP 用户内容</view>

<!-- 字符串运算 -->
<view>{{"姓名: " + firstName + lastName}}</view>

<!-- 数据路径运算 -->
<view>{{object.key}} - {{array[0]}}</view>
```

---

## 条件渲染

### wx:if / wx:elif / wx:else

```xml
<view wx:if="{{score >= 90}}">优秀</view>
<view wx:elif="{{score >= 80}}">良好</view>
<view wx:elif="{{score >= 60}}">及格</view>
<view wx:else>不及格</view>
```

### block wx:if

```xml
<!-- block 不会渲染为真实节点 -->
<block wx:if="{{showGroup}}">
  <view>标题</view>
  <view>内容 1</view>
  <view>内容 2</view>
</block>
```

### hidden

```xml
<!-- hidden：组件始终渲染，只是切换 display -->
<view hidden="{{!isVisible}}">通过 hidden 控制显示</view>

<!-- wx:if vs hidden 的选择 -->
<!-- wx:if：条件为 false 时不渲染，适合切换频率低的场景 -->
<!-- hidden：始终渲染，适合切换频率高的场景 -->
```

---

## 循环渲染

### wx:for

```xml
<!-- 简单数组 -->
<view wx:for="{{array}}" wx:key="index">
  索引: {{index}}, 值: {{item}}
</view>

<!-- 对象数组 -->
<view wx:for="{{users}}" wx:key="id">
  <text>{{item.name}} - {{item.age}}岁</text>
</view>

<!-- 重命名 -->
<view wx:for="{{items}}" wx:for-item="product" wx:for-index="idx">
  <text>{{idx + 1}}. {{product.name}}</text>
</view>

<!-- 嵌套循环 -->
<view wx:for="{{categories}}" wx:for-item="category" wx:key="id">
  <text>{{category.name}}</text>
  <view wx:for="{{category.products}}" wx:for-item="product" wx:key="sku">
    <text>{{product.name}}</text>
  </view>
</view>
```

### wx:key 的重要性

```javascript
// wx:key 用于提高列表渲染性能
// 最佳实践：使用唯一且稳定的标识符

Page({
  data: {
    items: [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
      { id: 3, name: 'C' }
    ]
  },

  // wx:key 可以是字符串（属性名）或保留关键字
  // wx:key="id"       - 使用 item 的 id 属性
  // wx:key="*this"    - 使用 item 本身（基础类型时）
  // wx:key="index"    - 使用索引（不推荐）
});
```

---

## 模板

### template

```xml
<!-- 定义模板 -->
<template name="productItem">
  <view class="product">
    <image src="{{image}}"></image>
    <text>{{name}}</text>
    <text>¥{{price}}</text>
  </view>
</template>

<!-- 使用模板 -->
<template is="productItem" data="{{...item}}" />

<!-- 带数据的模板 -->
<template is="productItem" data="{{image: item.img, name: item.title, price: item.price}}" />
```

### import 和 include

```xml
<!-- import：导入模板 -->
<import src="/templates/product.wxml" />
<template is="productItem" data="{{item}}" />

<!-- include：直接引入文件内容 -->
<include src="/includes/header.wxml" />
```

---

## WXS

### 基本使用

WXS（WeiXin Script）是小程序的一套脚本语言，运行在渲染层：

```wxs
// filters.wxs
function formatPrice(price) {
  return '¥' + price.toFixed(2);
}

function formatDate(timestamp, format) {
  var date = getDate(timestamp);
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  return year + '-' + month + '-' + day;
}

function limitText(text, length) {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

module.exports = {
  formatPrice: formatPrice,
  formatDate: formatDate,
  limitText: limitText
};
```

```xml
<wxs src="/utils/filters.wxs" module="filters" />
<view>{{filters.formatPrice(price)}}</view>
<view>{{filters.formatDate(createTime)}}</view>
<view>{{filters.limitText(content, 50)}}</view>
```

### 内联 WXS

```xml
<wxs module="utils">
  function add(a, b) {
    return a + b;
  }
  function isEven(num) {
    return num % 2 === 0;
  }
  module.exports = {
    add: add,
    isEven: isEven
  };
</wxs>

<view>{{utils.add(count, 1)}}</view>
<view>{{utils.isEven(count) ? '偶数' : '奇数'}}</view>
```

---

## 自测题

### 问题 1
wx:if 和 hidden 的区别是什么？如何选择？

<details>
<summary>查看答案</summary>
wx:if 是条件渲染，条件为 false 时组件不会渲染到 DOM 中，切换时有局部编译/卸载的开销。hidden 是始终渲染，通过 display: none 控制显示隐藏，切换时没有编译卸载开销。使用建议：切换频率低时用 wx:if（减少初始渲染开销），切换频率高时用 hidden（减少切换开销）。
</details>

### 问题 2
wx:key 的作用是什么？为什么推荐使用？

<details>
<summary>查看答案</summary>
wx:key 帮助小程序识别列表中元素的唯一性，优化列表渲染性能。当数据变化时，通过 key 匹配新旧元素，只更新变化的部分，而不是重新渲染整个列表。如果不提供 key，小程序会使用索引进行比较，当列表顺序变化时（如插入、删除、排序）会导致不必要的重新渲染或状态错乱。
</details>

### 问题 3
WXS 和 JavaScript 在小程序中有什么区别？

<details>
<summary>查看答案</summary>
WXS 运行在渲染层（WebView），JS 运行在逻辑层（JSCore）。WXS 的局限性：1）不支持 ES6+ 语法；2）不能调用小程序 API；3）不能操作 DOM；4）模块化方式不同（module.exports）。WXS 的优势：在渲染层执行，不需要通过 Native Bridge 通信，数据处理更高效，适合在 WXML 中进行数据格式化。
</details>