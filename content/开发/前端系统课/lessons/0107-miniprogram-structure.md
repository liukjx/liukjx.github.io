---
title: 第107课：小程序项目结构
description: 小程序项目结构、app.json 配置、页面配置、WXML 和 WXSS
date: 2026-08-06
tags:
  - 小程序
  - 项目结构
  - app.json
  - WXML
  - WXSS
  - 配置
---

# 小程序项目结构

## 学习目标

- 掌握小程序的全局配置文件 app.json
- 理解页面配置文件的优先级
- 了解 WXML 和 WXSS 的基本语法
- 掌握 sitemap 配置

---

## app.json 全局配置

### 基本结构

```json
{
  "pages": [
    "pages/index/index",
    "pages/logs/logs",
    "pages/detail/detail"
  ],
  "window": {
    "navigationBarTitleText": "我的小程序",
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#f5f5f5",
    "backgroundTextStyle": "dark",
    "enablePullDownRefresh": true
  },
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#1296db",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "images/home.png",
        "selectedIconPath": "images/home-active.png"
      },
      {
        "pagePath": "pages/logs/logs",
        "text": "日志",
        "iconPath": "images/log.png",
        "selectedIconPath": "images/log-active.png"
      }
    ]
  }
}
```

### 常用配置项

| 配置项 | 类型 | 说明 |
|-------|------|------|
| pages | string[] | 页面路径列表，第一项为首页 |
| window | Object | 全局窗口表现配置 |
| tabBar | Object | 底部 Tab 栏配置 |
| networkTimeout | Object | 网络超时时间配置 |
| debug | boolean | 调试模式开关 |
| permission | Object | 接口权限配置 |
| requiredBackgroundModes | string[] | 后台运行能力 |
| plugins | Object | 插件配置 |
| subpackages | Object[] | 分包配置 |

### 页面配置（page.json）

```json
{
  "usingComponents": {
    "my-component": "/components/my-component/my-component"
  },
  "navigationBarTitleText": "详情页",
  "enablePullDownRefresh": false,
  "disableScroll": true
}
```

页面配置会覆盖 app.json 中的 window 配置。

---

## 分包加载

```json
{
  "pages": [
    "pages/index/index",
    "pages/login/login"
  ],
  "subpackages": [
    {
      "root": "packageA",
      "pages": [
        "pages/detail/detail",
        "pages/search/search"
      ]
    },
    {
      "root": "packageB",
      "pages": [
        "pages/user/user",
        "pages/setting/setting"
      ],
      "independent": true
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "packages": ["packageA"],
      "network": "all"
    }
  }
}
```

---

## WXML 基础

WXML（WeiXin Markup Language）是小程序的标记语言，类似 HTML。

### 基本语法

```xml
<!-- 基础标签 -->
<view>文本内容</view>
<text>纯文本</text>
<image src="/images/logo.png" />
<button type="primary">按钮</button>

<!-- 数据绑定 -->
<view>{{message}}</view>

<!-- 属性绑定 -->
<view data-id="{{id}}"></view>

<!-- 条件渲染 -->
<view wx:if="{{condition}}">显示</view>
<view wx:elif="{{otherCondition}}">其他条件</view>
<view wx:else>默认</view>

<!-- 列表渲染 -->
<view wx:for="{{items}}" wx:key="id">
  {{index}}: {{item.name}}
</view>
```

### WXML 特点

- 使用 `view` 替代 `div`
- 使用 `text` 替代 `span`
- 使用 `image` 替代 `img`
- 使用 `navigator` 替代 `a`
- 所有标签都是闭合标签
- 不支持 DOM 操作

---

## WXSS 基础

WXSS（WeiXin Style Sheets）是小程序的样式语言，扩展了 CSS 的特性。

### 尺寸单位：rpx

```css
/* rpx（responsive pixel）：自适应单位 */
/* 以 750rpx 为基准 */
/* iPhone 6/7/8: 1rpx = 0.5px */
/* iPhone 6 Plus: 1rpx = 0.552px */

.container {
  width: 750rpx;        /* 满屏宽度 */
  height: 100rpx;       /* 高度 */
  padding: 20rpx;       /* 内边距 */
  font-size: 28rpx;     /* 字体大小 */
}

/* 使用 calc */
.box {
  width: calc(100vw - 40rpx);
}
```

### 样式导入

```css
/* 导入外部样式文件 */
@import '/styles/common.wxss';
@import '/styles/theme.wxss';
```

---

## sitemap 配置

```json
{
  "rules": [
    {
      "action": "allow",
      "page": "pages/index/*"
    },
    {
      "action": "disallow",
      "page": "pages/user/*"
    },
    {
      "action": "disallow",
      "params": ["unwanted_param"],
      "matching": "exact"
    }
  ]
}
```

---

## 项目配置文件

```json
// project.config.json
{
  "description": "项目配置文件",
  "packOptions": {
    "ignore": [
      { "type": "file", "value": ".eslintrc.js" },
      { "type": "folder", "value": "node_modules" }
    ]
  },
  "setting": {
    "urlCheck": true,
    "es6": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": true,
    "autoAudits": false
  },
  "compileType": "miniprogram",
  "libVersion": "3.0.0",
  "appid": "wxYourAppId",
  "projectname": "my-miniprogram"
}
```

---

## 自测题

### 问题 1
app.json 中的 pages 数组顺序有什么意义？

<details>
<summary>查看答案</summary>
pages 数组中的第一项是小程序的首页（第一个显示的页面）。新增页面时需要在 pages 中注册，否则无法访问。页面路径不需要写文件扩展名，小程序会自动查找对应名称的 wxml、wxss、js、json 文件。数组顺序不影响页面跳转，只决定首页。
</details>

### 问题 2
rpx 和 vw/vh 单位有什么区别？

<details>
<summary>查看答案</summary>
rpx 以 750rpx = 屏幕宽度为基准进行换算，是微信小程序特有的响应式单位，能够根据设备宽度自动适配。vw/vh 是 CSS3 标准单位，1vw = 视口宽度的 1%。rpx 在换算时按照 750 设计稿来适配，更加方便设计稿还原。小程序中推荐优先使用 rpx。
</details>

### 问题 3
为什么要使用分包加载？

<details>
<summary>查看答案</summary>
小程序主包体积限制为 2MB，分包可以将非首页功能拆分为独立包，每个分包大小限制为 2MB，总包不超过 20MB。分包加载的优势：1）减少首屏加载时间（只需下载主包）；2）按需加载（用户访问到分包时才下载）；3）支持独立分包（可独立运行，不依赖主包）；4）预加载规则可提前下载分包。
</details>