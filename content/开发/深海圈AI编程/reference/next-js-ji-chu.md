---
title: Next.js 基础
description: Next.js 核心概念速览 — App Router、渲染模式、API 路由、部署
tags:
  - Next.js
  - React
  - Web开发
  - 参考
draft: false
---

# Next.js 基础

> Next.js 是一个基于 React 的全栈 Web 框架，专为生产环境设计。它提供了文件路由、服务端渲染、API 路由等开箱即用的能力。

---

## 什么是 Next.js？

- **基于 React**：底层 UI 库是 React，所有 React 知识都适用
- **全栈框架**：前端 + 后端（API 路由）在一个项目里
- **多种渲染模式**：SSR、SSG、CSR、ISR 按需选择
- **约定大于配置**：文件名即路由，目录结构即项目架构
- **开发体验好**：热更新、TypeScript 原生支持、Turbopack

---

## App Router vs Pages Router

Next.js 有两种路由模式：

| 特性 | App Router（推荐） | Pages Router（旧版） |
|:----|:------------------|:-------------------|
| 推出时间 | Next.js 13+ | Next.js 12 及更早 |
| 路由方式 | 基于文件系统目录 | 基于文件系统文件 |
| 默认渲染 | 服务端组件 (Server Components) | 客户端组件 (Client Components) |
| 布局能力 | 支持嵌套布局（layout.tsx） | 不支持 |
| 加载状态 | 内置 loading.tsx | 手动实现 |
| 错误处理 | 内置 error.tsx | 手动实现 |
| API 路由 | route.ts | pages/api/*.ts |
| **当前推荐** | **新项目都该用 App Router** | 仅维护老项目 |

> 本课程全部使用 **App Router**。

---

## 核心文件约定

在 `app/` 目录下，文件名定义了它是什么：

```
app/
├── page.tsx          # 页面（对应 URL 路径）
├── layout.tsx        # 布局（包裹页面和子路由）
├── loading.tsx       # 加载态 UI
├── error.tsx         # 错误边界 UI
├── not-found.tsx     # 404 页面
├── route.ts          # API 路由（返回 JSON 等）
└── api/
    └── hello/
        └── route.ts  # → /api/hello
```

### page.tsx — 页面

```tsx
// app/page.tsx — 对应 /
export default function Home() {
    return <h1>首页</h1>;
}

// app/about/page.tsx — 对应 /about
export default function About() {
    return <h1>关于我们</h1>;
}

// 动态路由
// app/posts/[id]/page.tsx — 对应 /posts/1, /posts/abc 等
export default function Post({ params }: { params: { id: string } }) {
    return <h1>文章: {params.id}</h1>;
}
```

### layout.tsx — 布局

```tsx
// app/layout.tsx — 根布局（整个应用共享）
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="zh-CN">
            <body>
                <header>网站导航</header>
                <main>{children}</main>
                <footer>页脚</footer>
            </body>
        </html>
    );
}

// app/dashboard/layout.tsx — 嵌套布局（仅 /dashboard 下的页面使用）
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="dashboard">
            <aside>侧边栏</aside>
            <main>{children}</main>
        </div>
    );
}
```

### route.ts — API 路由

```tsx
// app/api/hello/route.ts
export async function GET() {
    return Response.json({ message: 'Hello, World!' });
}

export async function POST(request: Request) {
    const body = await request.json();
    return Response.json({ received: body }, { status: 201 });
}
```

---

## 三种渲染模式对比

| 特性 | SSR（服务端渲染） | SSG（静态生成） | CSR（客户端渲染） |
|:----|:-----------------|:---------------|:----------------|
| 渲染时机 | 每次请求时 | 构建时 | 浏览器加载后 |
| 数据新鲜度 | 实时 | 构建时固定 | 取决于 API 调用 |
| 首屏速度 | 快 | 极快 | 慢（需加载 JS） |
| SEO | 好 | 最好 | 差 |
| 适用场景 | 动态数据、需登录的页面 | 博客、文档、营销页 | 管理后台、仪表盘 |
| 服务端成本 | 高（每次请求都渲染） | 低（静态文件） | 无（全靠客户端） |

### 在 Next.js App Router 中控制渲染

```tsx
// 默认：SSR（服务端组件）
export default function Page() {
    return <h1>我是 SSR</h1>;
}

// SSG：用 generateStaticParams 指定静态路径
export async function generateStaticParams() {
    const posts = await fetch('https://api.example.com/posts').then(r => r.json());
    return posts.map((post: any) => ({ id: String(post.id) }));
}

// CSR：使用 "use client" 标记为客户端组件
'use client';
import { useEffect, useState } from 'react';
export default function ClientPage() {
    const [data, setData] = useState(null);
    useEffect(() => {
        fetch('/api/data').then(r => r.json()).then(setData);
    }, []);
    return <div>{JSON.stringify(data)}</div>;
}

// ISR（增量静态生成）：revalidate 选项
export const revalidate = 60; // 每 60 秒重新生成
```

---

## 环境变量

| 变量位置 | 暴露范围 |
|:--------|:--------|
| `NEXT_PUBLIC_*` | 浏览器 + 服务端 |
| `其他变量` | 仅服务端 |

```bash
# .env.local（本地开发，不提交到 Git）
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# .env.production（生产环境）
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="https://myapp.com"
```

```tsx
// 使用环境变量
const dbUrl = process.env.DATABASE_URL;                // 仅服务端
const appUrl = process.env.NEXT_PUBLIC_APP_URL;        // 浏览器 + 服务端

// 服务端组件中获取
import { headers } from 'next/headers';
export default async function Page() {
    const headersList = await headers();
    const host = headersList.get('host');
    // ...
}
```

---

## 部署到 Vercel

Vercel 是 Next.js 官方推荐的部署平台。

### 部署步骤

1. **推送代码到 GitHub**
2. **登录 [vercel.com](https://vercel.com)**，点击 "Add New Project"
3. **导入你的 GitHub 仓库**
4. **配置环境变量**（Database URL 等）
5. **点击 Deploy** — 完成

### Vercel 自动能力

- ✅ 自动 HTTPS（免费 SSL 证书）
- ✅ 自动 CDN 加速
- ✅ 每次 `git push` 自动部署预览
- ✅ 合并到 main 分支自动部署生产
- ✅ Serverless 函数自动扩缩容
- ✅ 自定义域名绑定

### 绑定自定义域名

```text
Vercel Dashboard → 项目 → Domains → 输入你的域名
→ 在 DNS 管理后台添加 CNAME 记录指向 cname.vercel-dns.com
```

---

## 关键命令速查

```bash
# 创建新项目
npx create-next-app@latest my-app

# 安装依赖
pnpm install

# 本地开发（默认 http://localhost:3000）
pnpm dev

# 构建
pnpm build

# 生产模式启动
pnpm start

# 代码检查
pnpm lint
```

---

## 学到了什么？

完成本节课后，你应该能回答：

1. Next.js 是什么？它解决了什么问题？
2. App Router 和 Pages Router 选哪个？
3. `page.tsx`、`layout.tsx`、`route.ts` 各有什么作用？
4. SSR、SSG、CSR 的区别是什么？如何选择？
5. 如何创建 API 路由？
6. 如何管理环境变量？
7. 如何部署到 Vercel？

---

> **相关课程**：[第05课：前后端与Next.js](lessons/0005-qian-hou-duan-yu-next-js.md) — 前端/后端概念、代码结构、渲染模式