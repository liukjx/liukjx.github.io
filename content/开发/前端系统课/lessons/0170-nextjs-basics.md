---
title: 第170课：Next.js 基础
description: Next.js 项目创建、路由系统、页面和布局
date: 2026-08-06
tags:
  - Next.js
  - React
  - SSR
  - 路由
  - 布局
---

# Next.js 基础

## 学习目标

- 掌握 Next.js 项目创建
- 掌握文件路由系统
- 掌握布局和页面

---

## 创建项目

```bash
npx create-next-app@latest my-app --typescript
cd my-app
npm run dev
```

---

## 路由系统

```
app/
├── page.tsx           # /
├── layout.tsx         # 根布局
├── about/
│   └── page.tsx       # /about
├── blog/
│   ├── page.tsx       # /blog
│   └── [id]/
│       └── page.tsx   # /blog/:id
└── api/
    └── posts/
        └── route.ts   # API 路由
```

```typescript
// app/blog/[id]/page.tsx
interface Props {
  params: { id: string };
  searchParams: { [key: string]: string | undefined };
}

export default function BlogPost({ params }: Props) {
  return <h1>Blog Post: {params.id}</h1>;
}
```

---

## 布局

```tsx
// app/layout.tsx
export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

---

## 自测题

### 问题 1
Next.js 13/14 的 App Router 和 Pages Router 有什么区别？

<details>
<summary>查看答案</summary>
App Router（app/ 目录）是 Next.js 13 引入的新路由系统，基于 React Server Components。Pages Router（pages/ 目录）是旧路由系统。App Router 支持：1）服务端组件和客户端组件分离；2）布局嵌套（layout.tsx）；3）流式渲染（loading.tsx）；4）错误边界（error.tsx）；5）更简单的数据获取。新项目推荐使用 App Router。
</details>

### 问题 2
Next.js 中的布局嵌套是如何工作的？

<details>
<summary>查看答案</summary>
layout.tsx 包裹同一目录下的所有页面，支持多层嵌套。目录结构中的 layout.tsx 自动形成嵌套布局，父布局包裹子布局，子布局包裹页面。布局在页面切换时保持状态（不会重新渲染），适合存放导航栏、侧边栏等持久 UI。
</details>