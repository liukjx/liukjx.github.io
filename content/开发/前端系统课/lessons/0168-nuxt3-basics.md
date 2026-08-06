---
title: 第168课：Nuxt3 基础
description: Nuxt3 创建、路由、布局、中间件
date: 2026-08-06
tags:
  - Nuxt3
  - Vue3
  - SSR
  - 路由
  - 布局
---

# Nuxt3 基础

## 学习目标

- 掌握 Nuxt3 项目创建
- 掌握文件路由系统
- 掌握布局和中间件

---

## 创建项目

```bash
npx nuxi@latest init my-app
cd my-app
npm install
npm run dev
```

---

## 文件路由

```
pages/
├── index.vue          # /
├── about.vue          # /about
├── blog/
│   ├── index.vue      # /blog
│   └── [id].vue       # /blog/:id
└── category/
    └── [category]/
        └── index.vue  # /category/:category
```

```vue
<!-- pages/blog/[id].vue -->
<script setup>
const route = useRoute();
const { data: post } = await useFetch(`/api/posts/${route.params.id}`);
</script>
```

---

## 布局

```vue
<!-- layouts/default.vue -->
<template>
  <div>
    <header>
      <NuxtLink to="/">首页</NuxtLink>
      <NuxtLink to="/about">关于</NuxtLink>
    </header>
    <main>
      <slot />
    </main>
    <footer>Footer</footer>
  </div>
</template>
```

---

## 中间件

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('token');
  if (!token.value && to.path !== '/login') {
    return navigateTo('/login');
  }
});
```

---

## 自测题

### 问题 1
Nuxt3 的文件路由是如何工作的？

<details>
<summary>查看答案</summary>
Nuxt3 使用文件系统路由，pages/ 目录下的每个 .vue 文件自动对应一个路由。index.vue 对应 /，[id].vue 对应动态参数 /:id，[...slug].vue 匹配所有路径。不需要手动配置路由，文件和目录结构即路由结构。
</details>

### 问题 2
Nuxt3 中 useFetch 和 $fetch 有什么区别？

<details>
<summary>查看答案</summary>
useFetch 是 Nuxt3 的组合式函数（composable），自动提供 data、pending、error、refresh 等响应式属性，支持 SSR 数据获取（服务端获取数据并在客户端水合）。$fetch 是 Nitro 的 HTTP 客户端，只发送请求并返回数据，不提供响应式状态管理。SSR 场景下推荐使用 useFetch。
</details>