---
title: 第169课：Nuxt3 数据
description: Nuxt3 数据获取、useFetch/useAsyncData、状态管理
date: 2026-08-06
tags:
  - Nuxt3
  - 数据获取
  - useFetch
  - 状态管理
  - Pinia
---

# Nuxt3 数据

## 学习目标

- 掌握 useFetch 的使用
- 掌握 useAsyncData 的使用
- 掌握 Pinia 状态管理

---

## useFetch

```vue
<script setup>
// 基础使用
const { data, pending, error, refresh } = await useFetch('/api/posts', {
  // 选项
  method: 'GET',
  params: { page: 1 },
  headers: { Authorization: 'Bearer token' },

  // Nuxt 特有选项
  server: true,       // 在服务端执行
  lazy: false,        // 是否延迟加载
  immediate: true,    // 是否立即执行
  default: () => [],
  transform: (data) => data.posts,
  pick: ['title', 'content']
});

// 刷新数据
await refresh();

// 监听数据变化
watch(data, (newData) => {
  console.log('数据更新:', newData);
});
</script>
```

---

## useAsyncData

```vue
<script setup>
const { data: posts } = await useAsyncData('posts', async () => {
  // 自定义异步操作
  const [posts, users] = await Promise.all([
    $fetch('/api/posts'),
    $fetch('/api/users')
  ]);
  return posts.map(post => ({
    ...post,
    author: users.find(user => user.id === post.userId)
  }));
}, {
  // 缓存 key
  // 默认：当前文件路径 + 行号
});
</script>
```

---

## 状态管理

```typescript
// Pinia store
// stores/counter.ts
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0);
  const increment = () => count.value++;
  return { count, increment };
});

// 在组件中使用
const counter = useCounterStore();

// useState - Nuxt3 内置状态管理
const count = useState('count', () => 0);
```

---

## 自测题

### 问题 1
useFetch 和 useAsyncData 的区别是什么？

<details>
<summary>查看答案</summary>
useFetch 对 $fetch 的封装，自动处理 URL 拼接和响应解析，适用于直接调用 API 端点。useAsyncData 更底层，可以执行任意异步逻辑（不仅限于 HTTP 请求），需要开发者自行处理数据获取逻辑。两者都提供 SSR 数据水合、响应式状态、自动去重等功能。
</details>

### 问题 2
Nuxt3 中如何在服务端获取数据并在客户端避免重复请求？

<details>
<summary>查看答案</summary>
Nuxt3 使用 payload 机制：服务端 useFetch/useAsyncData 获取的数据会序列化为 JSON 并注入到 HTML 的 __NUXT__ 全局变量中。客户端加载时解析 payload，直接使用已有数据，不会发起重复请求。key 参数用于匹配服务端和客户端的数据。这是 Nuxt3 实现 SSR 数据水合的核心机制。
</details>