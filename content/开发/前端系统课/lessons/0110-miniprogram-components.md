---
title: 第110课：小程序组件和 API
description: 小程序内置组件、自定义组件、生命周期和常用 API 调用
date: 2026-08-06
tags:
  - 小程序
  - 组件
  - API
  - 自定义组件
  - 生命周期
---

# 小程序组件和 API

## 学习目标

- 掌握小程序常见内置组件的使用
- 掌握自定义组件的创建和通信
- 理解组件生命周期
- 掌握常用的微信 API

---

## 内置组件

### 视图容器

```xml
<!-- view：基础容器 -->
<view class="container">
  <view class="item">Item 1</view>
</view>

<!-- scroll-view：可滚动视图 -->
<scroll-view
  scroll-y="{{true}}"
  scroll-x="{{false}}"
  bindscrolltolower="loadMore"
  refresher-enabled="{{true}}"
  bindrefresherrefresh="onRefresh"
  class="scroll-area"
>
  <view wx:for="{{list}}" wx:key="id">{{item.name}}</view>
</scroll-view>

<!-- swiper：轮播 -->
<swiper
  indicator-dots="{{true}}"
  autoplay="{{true}}"
  interval="{{3000}}"
  duration="{{500}}"
  circular="{{true}}"
  indicator-color="#rgba(255,255,255,0.6)"
  indicator-active-color="#fff"
>
  <swiper-item wx:for="{{banners}}" wx:key="id">
    <image src="{{item.image}}" mode="aspectFill" />
  </swiper-item>
</swiper>

<!-- movable-view：可移动视图 -->
<movable-area>
  <movable-view direction="all">拖拽</movable-view>
</movable-area>
```

### 基础组件

```xml
<!-- text：文本 -->
<text selectable="{{true}}" user-select="{{true}}">可选中的文本</text>
<text decode="{{true}}">&amp; &lt; &gt; &nbsp;</text>

<!-- rich-text：富文本 -->
<rich-text nodes="{{htmlContent}}" />

<!-- icon：图标 -->
<icon type="success" size="40" color="#07c160" />
<icon type="info" size="40" />
<icon type="warn" size="40" color="#e64340" />

<!-- progress：进度条 -->
<progress percent="{{progress}}" stroke-width="6" activeColor="#07c160" />
```

### 表单组件

```xml
<!-- button -->
<button type="primary" size="default" loading="{{false}}"
        disabled="{{false}}" bindtap="handleClick">
  主要按钮
</button>
<button open-type="getUserInfo" bindgetuserinfo="onGetUserInfo">
  获取用户信息
</button>
<button open-type="share">分享</button>

<!-- input -->
<input
  type="text"
  placeholder="请输入内容"
  value="{{inputValue}}"
  maxlength="50"
  bindinput="onInput"
  bindfocus="onFocus"
  bindblur="onBlur"
/>

<!-- textarea -->
<textarea value="{{content}}" maxlength="200"
          bindinput="onContentInput" auto-height />

<!-- picker -->
<picker
  mode="selector"
  range="{{cityList}}"
  value="{{cityIndex}}"
  bindchange="onCityChange"
>
  <view>{{cityList[cityIndex] || '请选择城市'}}</view>
</picker>

<!-- switch -->
<switch checked="{{isAgreed}}" color="#07c160"
        bindchange="onSwitchChange" />
```

---

## 自定义组件

### 创建组件

```javascript
// components/my-component/my-component.js
Component({
  // 组件属性
  properties: {
    title: {
      type: String,
      value: '默认标题'
    },
    count: {
      type: Number,
      value: 0,
      observer(newVal, oldVal) {
        console.log('count 变化:', oldVal, '->', newVal);
      }
    },
    list: {
      type: Array,
      value: []
    }
  },

  // 组件内部数据
  data: {
    internalCount: 0,
    isVisible: true
  },

  // 组件方法
  methods: {
    handleTap() {
      this.setData({
        internalCount: this.data.internalCount + 1
      });
      // 触发自定义事件
      this.triggerEvent('change', {
        count: this.data.internalCount
      });
    },

    updateTitle(newTitle) {
      this.setData({ title: newTitle });
    }
  },

  // 组件生命周期
  lifetimes: {
    created() {
      console.log('组件被创建');
    },
    attached() {
      console.log('组件被添加到页面');
    },
    ready() {
      console.log('组件渲染完成');
    },
    detached() {
      console.log('组件被移除');
    }
  },

  // 页面生命周期（组件所在页面）
  pageLifetimes: {
    show() {
      console.log('页面显示');
    },
    hide() {
      console.log('页面隐藏');
    }
  }
});
```

### 组件的 WXML

```xml
<!-- components/my-component/my-component.wxml -->
<view class="component-container">
  <view class="header">
    <text>{{title}}</text>
    <text>内部计数: {{internalCount}}</text>
  </view>

  <!-- slot：插槽 -->
  <slot name="before" />
  <view class="content">
    <view wx:for="{{list}}" wx:key="id">{{item.name}}</view>
  </view>
  <slot />

  <button bindtap="handleTap">触发事件</button>
</view>
```

### 组件的样式

```css
/* components/my-component/my-component.wxss */
/* 默认样式隔离 */

.component-container {
  padding: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

/* 定义暴露给外部的样式变量 */
.component-container {
  --component-primary-color: #07c160;
}
```

### 使用组件

```json
// pages/index/index.json
{
  "usingComponents": {
    "my-component": "/components/my-component/my-component"
  }
}
```

```xml
<!-- pages/index/index.wxml -->
<my-component
  title="自定义组件"
  count="{{pageCount}}"
  list="{{pageList}}"
  bind:change="onComponentChange"
>
  <!-- 插槽内容 -->
  <view slot="before">插槽内容</view>
  默认插槽内容
</my-component>
```

---

## 常用 API

### 交互反馈

```javascript
// 加载提示
wx.showLoading({
  title: '加载中...',
  mask: true  // 防止触摸穿透
});
wx.hideLoading();

// 提示框
wx.showToast({
  title: '操作成功',
  icon: 'success',  // success / error / loading / none
  duration: 2000,
  mask: true
});

// 模态对话框
wx.showModal({
  title: '提示',
  content: '确定要删除吗？',
  success(res) {
    if (res.confirm) {
      // 用户点击确定
    } else if (res.cancel) {
      // 用户点击取消
    }
  }
});

// 操作菜单
wx.showActionSheet({
  itemList: ['拍照', '从相册选择', '取消'],
  success(res) {
    console.log(res.tapIndex);
  }
});
```

### 网络请求

```javascript
// 发起请求
wx.request({
  url: 'https://api.example.com/data',
  method: 'GET',
  data: {
    page: 1,
    size: 20
  },
  header: {
    'Authorization': 'Bearer token'
  },
  success(res) {
    console.log(res.data);
  },
  fail(err) {
    wx.showToast({ title: '网络错误', icon: 'error' });
  },
  complete() {
    wx.hideLoading();
  }
});

// 上传文件
wx.uploadFile({
  url: 'https://api.example.com/upload',
  filePath: tempFilePath,
  name: 'file',
  success(res) {
    console.log(JSON.parse(res.data));
  }
});
```

### 数据缓存

```javascript
// 存储
wx.setStorageSync('key', 'value');
wx.setStorage({
  key: 'userInfo',
  data: { name: '张三', age: 25 },
  success() {
    console.log('存储成功');
  }
});

// 读取
const value = wx.getStorageSync('key');
wx.getStorage({
  key: 'userInfo',
  success(res) {
    console.log(res.data);
  }
});

// 删除
wx.removeStorageSync('key');
wx.clearStorageSync();
```

---

## 自测题

### 问题 1
小程序自定义组件中，properties 和 data 有什么区别？

<details>
<summary>查看答案</summary>
properties 是组件对外暴露的属性，由组件的使用者传入，可以设置 type、value、observer 等配置。data 是组件的内部状态，对外不可见。properties 的数据通过 WXML 属性传递，data 在组件内部初始化。两者在组件内部都可以通过 this.data 访问，通过 this.setData 更新。
</details>

### 问题 2
小程序中如何实现组件和页面之间的通信？

<details>
<summary>查看答案</summary>
组件通信有三种方式：1）父到子：通过 properties 传递数据；2）子到父：通过 triggerEvent 触发自定义事件，父组件通过 bind:eventName 监听；3）组件间关系：通过 relations 实现父组件和子组件的关联通信。此外，也可以通过全局数据（getApp()）或状态管理库实现跨组件通信。
</details>

### 问题 3
wx.request 的请求限额和注意事项是什么？

<details>
<summary>查看答案</summary>
1）必须配置合法域名（在微信公众平台设置）；2）开发环境可开启"不校验合法域名"；3）并发请求数上限为 10 个；4）建议统一封装请求方法，添加 token、错误处理、loading 控制等；5）HTTPS 请求必须使用 TLS 1.2 及以上版本；6）超时时间默认为 60s，可在 app.json 中配置 networkTimeout。
</details>