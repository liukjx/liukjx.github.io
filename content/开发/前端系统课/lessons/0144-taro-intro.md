---
title: 第144课：Taro 入门
description: Taro 3 跨平台框架、React 语法开发、配置
date: 2026-08-06
tags:
  - Taro
  - 跨平台
  - React
  - 小程序
  - H5
---

# Taro 入门

## 学习目标

- 理解 Taro 的跨平台原理
- 掌握 Taro 项目的创建
- 掌握 Taro + React 的开发方式

---

## Taro 介绍

Taro 是一个开放式跨端跨框架解决方案，支持使用 React 语法编写代码，编译到微信小程序、H5、App 等平台。

### 安装和创建

```bash
npm install -g @tarojs/cli
taro init my-app
# 选择模板：React + TypeScript
cd my-app
npm run dev:weapp  # 编译到微信小程序
npm run dev:h5     # 编译到 H5
```

---

## 目录结构

```
src/
├── app.config.ts        # 全局配置
├── app.tsx              # 入口组件
├── app.scss             # 全局样式
├── pages/
│   ├── index/
│   │   ├── index.config.ts  # 页面配置
│   │   ├── index.tsx        # 页面组件
│   │   └── index.scss       # 页面样式
│   └── detail/
├── components/          # 公共组件
└── utils/               # 工具
```

---

## 组件开发

```tsx
import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components';
import { useState, useEffect } from 'react';

interface Banner {
  id: number;
  imageUrl: string;
}

const BannerSwiper: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    Taro.request({
      url: '/api/banner',
      success: (res) => setBanners(res.data)
    });
  }, []);

  return (
    <Swiper
      indicatorDots
      autoplay
      interval={3000}
      circular
    >
      {banners.map(banner => (
        <SwiperItem key={banner.id}>
          <Image src={banner.imageUrl} mode="aspectFill" />
        </SwiperItem>
      ))}
    </Swiper>
  );
};
```

---

## 自测题

### 问题 1
Taro 3 相比 Taro 2 的核心变化是什么？

<details>
<summary>查看答案</summary>
Taro 3 采用了全新的架构，不再使用编译时适配，而是使用运行时适配。Taro 3 在运行时模拟了 React 在 Web 端的渲染机制，将 React 渲染到小程序的自定义组件树上。这意味着 Taro 3 支持更完整的 React 语法（包括 Hooks），开发者体验更接近 Web 开发。
</details>

### 问题 2
Taro 中如何使用小程序的原生 API？

<details>
<summary>查看答案</summary>
Taro 对微信小程序的 API 进行了封装，但保留了与 wx API 相同的调用方式。直接使用全局的 Taro 对象调用 API，如 Taro.request、Taro.showToast、Taro.navigateTo 等。Taro 内部会处理不同平台的差异，开发者无需关心底层实现。
</details>