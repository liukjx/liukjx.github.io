---
title: 第143课：UniApp 组件和 API
description: UniApp 内置组件、uni 接口、平台差异处理
date: 2026-08-06
tags:
  - UniApp
  - 组件
  - API
  - 跨平台
  - 条件编译
---

# UniApp 组件和 API

## 学习目标

- 掌握 UniApp 常用组件
- 掌握 uni 接口的使用
- 掌握平台差异的处理

---

## 常用组件

```vue
<template>
  <view class="container">
    <!-- 视图容器 -->
    <scroll-view scroll-y @scrolltolower="loadMore">
      <view v-for="item in list" :key="item.id">{{ item.name }}</view>
    </scroll-view>

    <!-- 轮播 -->
    <swiper :indicator-dots="true" :autoplay="true" :interval="3000">
      <swiper-item v-for="item in banners" :key="item.id">
        <image :src="item.image" mode="aspectFill" />
      </swiper-item>
    </swiper>

    <!-- 表单 -->
    <input v-model="value" placeholder="请输入" @input="handleInput" />
    <button type="primary" @click="handleSubmit">提交</button>
  </view>
</template>
```

---

## uni 接口

```vue
<script setup>
// 网络请求
const getData = () => {
  uni.request({
    url: 'https://api.example.com/data',
    success: (res) => console.log(res.data),
    fail: (err) => console.error(err)
  });
};

// 路由跳转
const navigate = () => {
  uni.navigateTo({ url: '/pages/detail/detail?id=1' });
};

// 交互反馈
uni.showLoading({ title: '加载中...' });
uni.hideLoading();
uni.showToast({ title: '成功', icon: 'success' });

// 数据缓存
uni.setStorageSync('key', 'value');
const value = uni.getStorageSync('key');
</script>
```

---

## 平台差异

```vue
<!-- 条件编译 -->
<!-- #ifdef MP-WEIXIN -->
<view>只在微信小程序中显示</view>
<!-- #endif -->

<!-- #ifdef H5 -->
<view>只在 H5 中显示</view>
<!-- #endif -->

<!-- #ifdef APP-PLUS -->
<view>只在 App 中显示</view>
<!-- #endif -->

<!-- #ifndef MP -->
<view>非小程序平台显示</view>
<!-- #endif -->
```

---

## 自测题

### 问题 1
UniApp 中如何使用条件编译处理平台差异？

<details>
<summary>查看答案</summary>
条件编译使用特殊注释语法，在编译时根据目标平台保留或删除代码。语法格式：<!-- #ifdef 平台标识 --> ... <!-- #endif -->。支持的平台标识包括：MP-WEIXIN（微信小程序）、H5、APP-PLUS（App）、MP-ALIPAY（支付宝）等。条件编译可以在模板、样式、JS 代码中使用。
</details>

### 问题 2
uni 的 API 和微信小程序的 wx API 有何异同？

<details>
<summary>查看答案</summary>
UniApp 对微信小程序的 wx API 进行了封装和统一，API 名称和参数基本保持一致（uni 替代 wx）。UniApp 内部处理了各平台的差异，开发者使用 uni 命名空间的 API 即可在多个平台正常运行。对于一些平台特有的 API，UniApp 提供了 uni.requireNativePlugin 或标准 H5 API 等方式调用。
</details>