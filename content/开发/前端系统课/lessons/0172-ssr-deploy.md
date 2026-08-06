---
title: 第172课：SSR 部署
description: SSR 项目构建、部署、环境变量、Nuxt3 和 Next.js 部署
date: 2026-08-06
tags:
  - SSR
  - 部署
  - Nuxt3
  - Next.js
  - Node.js
---

# SSR 部署

## 学习目标

- 掌握 SSR 项目的构建和部署
- 掌握环境变量的配置
- 理解 SSR 部署的特殊性

---

## Nuxt3 部署

```bash
# 构建
npm run build

# 输出目录
# .output/public/   - 静态资源
# .output/server/   - 服务端代码

# 使用 PM2 部署
pm2 start .output/server/index.mjs --name my-nuxt-app
```

### 环境变量

```bash
# .env
NUXT_PUBLIC_API_BASE=https://api.example.com
NUXT_SECRET_KEY=my-secret-key
DATABASE_URL=mysql://localhost:3306/myapp
```

---

## Next.js 部署

```bash
# 构建
npm run build

# 启动
npm start

# 使用 Docker 部署
pm2 start node_modules/.bin/next --name my-next-app
```

### 环境变量

```bash
# .env.local - 本地环境
# .env.production - 生产环境
# .env - 所有环境

NEXT_PUBLIC_API_URL=https://api.example.com
DATABASE_URL=mysql://localhost:3306/myapp
```

---

## 部署平台

| 平台 | 适合框架 | 特点 |
|-----|---------|------|
| Vercel | Next.js | 原生支持，零配置 |
| Netlify | Nuxt3 | 自动部署 |
| Railway | 通用 | 简单部署 |
| Docker | 通用 | 灵活可控 |

---

## 自测题

### 问题 1
SSR 应用部署时需要注意哪些关键点？

<details>
<summary>查看答案</summary>
1）Node.js 运行时环境：需要 Node.js 18+；2）内存管理：SSR 服务比静态服务消耗更多内存；3）环境变量：区分 NUXT_PUBLIC_ 前缀（客户端可访问）和私密变量；4）负载均衡：多实例部署时需要配置 Session 共享；5）日志和监控：记录服务端渲染的错误；6）CDN 配置：静态资源缓存策略。
</details>

### 问题 2
Next.js 中 NEXT_PUBLIC_ 前缀的作用是什么？

<details>
<summary>查看答案</summary>
NEXT_PUBLIC_ 前缀的环境变量会在构建时被内联到客户端 JavaScript 包中，客户端代码可以读取。没有该前缀的变量仅存在于服务端（Node.js 环境）中。这保护了敏感信息（API 密钥、数据库密码）不被暴露到客户端。Nuxt3 中类似的机制是 NUXT_PUBLIC_ 前缀。
</details>