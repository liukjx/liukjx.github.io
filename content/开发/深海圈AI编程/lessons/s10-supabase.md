---
title: "补充课10：Supabase"
description: "Supabase是什么、核心功能（数据库/认证/存储/实时/Edge Functions）、注册创建项目、表编辑器、Row Level Security、Next.js集成、与Cursor配合使用"
tags: [supabase, baas, postgresql, 认证, 存储, 实时数据库, rls, nextjs]
date: 2026-08-03
draft: false
---

# 补充课10：Supabase

> **3分钟拥有一个生产数据库。Supabase = Firebase 的开源替代 + PostgreSQL 的全部能力。**

前几课我们学习了 PostgreSQL 数据库和 SQL。但你真的需要自己搭建数据库服务器吗？不需要。**Supabase** 就是"数据库即服务"的答案。

---

## 1. Supabase 是什么？

Supabase 是一个 **BaaS（后端即服务）** 平台，被广泛认为是 **Firebase 的开源替代**。

| | Firebase (Google) | Supabase (开源) |
|---|-------------------|-----------------|
| **数据库** | Firestore（NoSQL 文档型） | PostgreSQL（关系型） |
| **认证** | 邮箱/手机/OAuth | 邮箱/手机/OAuth |
| **存储** | 文件存储 | S3 兼容存储 |
| **实时** | Realtime Database | PostgreSQL Realtime |
| **服务端函数** | Cloud Functions | Edge Functions (Deno) |
| **数据归属** | 闭源，供应商锁定 | 开源，可自托管 |
| **AI 编程友好度** | 中等 | **极高**（SQL 标准） |

### 一句话理解 Supabase

> **Supabase = PostgreSQL（数据库）+ Auth（认证）+ Storage（存储）+ Realtime（实时）+ Edge Functions（服务端函数）**，全部打包成一个产品，Web 界面管理，几行代码接入。

---

## 2. 核心功能详解

### 数据库 (Database)

Supabase 直接提供托管的 **PostgreSQL 16** 数据库。

- 自带 Web 管理界面：**表编辑器、SQL 编辑器、数据库备份**
- 每个项目自动创建一个 PostgreSQL 实例
- 免费套餐：500MB 数据库空间，够个人项目使用
- 支持 pgvector 扩展（用于 AI 向量搜索）

```mermaid
graph TD
    subgraph Supabase项目
        A[PostgreSQL数据库] --> B[表编辑器]
        A --> C[SQL编辑器]
        A --> D[自动API]
        A --> E[备份恢复]
    end
    B --> F[可视化建表]
    C --> G[手写SQL]
    D --> H[REST API自动生成]
    D --> I[Realtime订阅]
```

### 认证 (Authentication)

一行代码集成多种登录方式：

| 认证方式 | 配置难度 | 使用场景 |
|----------|---------|---------|
| **邮箱+密码** | 零配置 | 标准用户系统 |
| **Magic Link** | 零配置 | 免密码登录 |
| **Google 登录** | 5分钟 | 社交登录 |
| **GitHub 登录** | 5分钟 | 开发者工具 |
| **手机验证码** | 需短信服务 | 移动端 |
| **Apple/微信等** | 需配置 | 特定平台 |

### 存储 (Storage)

文件/图片上传和管理：

- 自动 CDN 加速
- 基于文件夹的组织
- 行级安全策略（RLS）
- 支持图片压缩和格式转换

### 实时 (Realtime)

基于 PostgreSQL 的 Replication 实现：

- 数据库变化自动推送
- 可用于聊天、通知、协作编辑
- 前端通过 WebSocket 订阅

```typescript
// 实时订阅数据库变化
const channel = supabase
    .channel('messages')
    .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => console.log('新消息:', payload.new)
    )
    .subscribe();
```

### Edge Functions

服务端函数，运行在 Deno 运行时：

- 全球边缘节点部署
- 自动扩展
- 可处理 Webhook、数据处理等
- 类似 Cloudflare Workers

---

## 3. 一句话总结核心价值

> **"3分钟拥有一个生产数据库"**

传统流程：
```
注册云服务 → 配置网络 → 安装数据库 → 设置用户 → 开放端口 → 配置备份 → ...（半天过去）
```

Supabase 流程：
```
注册 Supabase → 创建项目 → 复制连接字符串 → 搞定！（3分钟）
```

---

## 4. 注册和创建项目

### 步骤

1. 打开 [supabase.com](https://supabase.com)
2. 点击 **Start your project**
3. 用 GitHub 账号登录（推荐）
4. 点击 **New project**
5. 填写项目信息：
   - **Name**: 项目名称（如 `my-shop`）
   - **Database Password**: 数据库密码（保存好！）
   - **Region**: 选择离你用户最近的区域
6. 等待 1-2 分钟，项目创建完成

### 获取连接信息

项目创建后，在 **Project Settings > Database** 中找到：

```
# 连接字符串
postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres

# 项目 URL（API 调用用）
https://xxxxx.supabase.co

# anon key（前端用）
eyJhbGciOiJIUzI1NiIs...
```

> [!WARNING]
> 有两个 key 要区分清楚：
> - **anon key**（公共）：可在前端使用，配合 RLS 策略控制权限
> - **service_role key**（私密）：拥有管理员权限，**绝不能暴露在前端**

---

## 5. 表编辑器 (Table Editor)

Supabase 的 Web 界面自带表编辑器，让不会 SQL 的人也能操作数据库。

### 可视化建表

1. 进入 **Table Editor**
2. 点击 **New Table**
3. 填写表名和字段：
   - 字段名、类型、默认值
   - 是否必填、是否唯一
   - 是否为主键
4. 点击保存，表就创建好了

### SQL 编辑器

Supabase 也提供 SQL 编辑器，适合直接运行 SQL 语句：

```sql
-- 在 Supabase SQL 编辑器中直接运行
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

> [!TIP]
> 对初学者来说，**先用表编辑器可视化建表**，熟悉后再用 SQL 编辑器。两种方式都是操作数据库，选你顺手的方式即可。

---

## 6. Row Level Security (RLS)

**RLS（行级安全）** 是 Supabase 最强大的功能之一。它让你在数据库层面控制"谁能看/改哪些数据"。

### 没有 RLS 的问题

```sql
-- 用户 A 登录后，如果不小心暴露了 API，可以查任何人的数据
SELECT * FROM users;  -- 看到了所有人的信息！
```

### 有了 RLS 之后

```sql
-- 用户 A 登录后，只能看到自己的数据
-- 数据库自动过滤：WHERE id = auth.uid()
SELECT * FROM users;
-- 只能看到自己的信息，其他人的数据不可见
```

### 启用 RLS

在 Supabase 表编辑器中，每个表都有一个 **Enable RLS** 开关。开启后，需要在 **Policies** 中定义策略。

### 典型的 RLS 策略

```sql
-- 策略：用户只能看自己的待办事项
CREATE POLICY "用户可以查看自己的待办"
ON todos FOR SELECT
USING (auth.uid() = user_id);

-- 策略：用户只能插入自己的待办
CREATE POLICY "用户可以创建待办"
ON todos FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 策略：用户只能更新自己的待办
CREATE POLICY "用户可以更新自己的待办"
ON todos FOR UPDATE
USING (auth.uid() = user_id);

-- 策略：用户只能删除自己的待办
CREATE POLICY "用户可以删除自己的待办"
ON todos FOR DELETE
USING (auth.uid() = user_id);
```

> [!NOTE]
> RLS 策略还可以更复杂：
>
> ```sql
> -- 管理员可以看所有数据
> CREATE POLICY "管理员全部权限"
> ON todos FOR ALL
> USING (auth.email() = 'admin@example.com');
>
> -- 用户可以看公开数据
> CREATE POLICY "公开数据"
> ON todos FOR SELECT
> USING (is_public = true);
> ```

### RLS 的核心思维

| 思路 | 说明 |
|------|------|
| **默认拒绝** | 开启 RLS 后，默认所有操作都被拒绝 |
| **白名单策略** | 明确写出"谁能做什么" |
| **基于用户** | 策略中通过 `auth.uid()` 获取当前用户 |
| **基于角色** | 可以结合数据库角色做更精细控制 |

> [!TIP]
> **你不需要一开始就精通 RLS。** 在 AI 编程中，你只需要告诉 AI："帮我给 todos 表加上 RLS，用户只能看自己的数据。"AI 就会自动生成策略。

---

## 7. 在 Next.js 中集成 Supabase

### 安装

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

### 配置客户端

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
```

### 在页面中使用

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function TodosPage() {
    const [todos, setTodos] = useState<any[]>([]);
    const supabase = createClient();

    useEffect(() => {
        async function loadTodos() {
            const { data } = await supabase
                .from('todos')
                .select('*')
                .order('created_at', { ascending: false });
            if (data) setTodos(data);
        }
        loadTodos();
    }, []);

    return (
        <ul>
            {todos.map(todo => (
                <li key={todo.id}>{todo.title}</li>
            ))}
        </ul>
    );
}
```

### 认证集成

```typescript
// 登录
const { data, error } = await supabase.auth.signInWithPassword({
    email: 'user@example.com',
    password: 'password123',
});

// 注册
const { data, error } = await supabase.auth.signUp({
    email: 'user@example.com',
    password: 'password123',
});

// Google 登录
const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
});

// 获取当前用户
const { data: { user } } = await supabase.auth.getUser();

// 退出
await supabase.auth.signOut();
```

### 环境变量

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

---

## 8. 与 Cursor 配合使用

在 AI 编程时代，Supabase 和 AI 的组合堪称完美。

### 告诉 AI 用 Supabase

在 Cursor/TRAE 中，你只需要说：

> "用 Supabase 创建一个待办事项应用，用户登录后可以管理自己的待办事项。"

AI 会自动完成：
1. 安装 `@supabase/supabase-js` 和 `@supabase/ssr`
2. 创建 Supabase 客户端
3. 配置认证组件
4. 创建 RLS 策略
5. 实现 CRUD 操作

### 常用 Prompt 示例

| 你的需求 | 对 AI 说的话 |
|----------|-------------|
| **建表** | "在 Supabase 中创建一个 products 表，包含 name, price, stock 字段" |
| **认证** | "添加 GitHub 登录按钮" |
| **RLS** | "给 orders 表加上 RLS，用户只能看到自己的订单" |
| **存储** | "实现用户头像上传功能，存在 Supabase Storage 中" |
| **实时** | "用 Supabase Realtime 实现实时聊天" |
| **查询** | "用 Supabase 客户端查询最近10个订单，包含用户名和商品" |

> [!TIP]
> 在 Cursor 中使用 **Composer (Ctrl/Cmd+I)**，直接粘贴 Supabase 官方文档链接，AI 会学习最新的 API 用法。这种方式比让 AI 从训练数据中回忆更准确。

---

## 9. 费用与套餐

| 套餐 | 价格 | 适用场景 |
|------|------|---------|
| **Free** | $0/月 | 学习、个人项目原型 |
| **Pro** | $25/月 | 商业项目 |
| **Team** | $75/月 | 团队协作 |
| **Enterprise** | 定制 | 大规模 |

**Free 套餐足够你学完整套课程**：
- 500MB 数据库空间
- 50,000 月活用户
- 5GB 带宽
- 1GB 文件存储
- 预构建的认证 UI

---

## 10. Supabase 官方教程推荐

### 新手必看

1. **[Supabase 快速开始](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)** —— 15分钟搭建第一个 Next.js + Supabase 应用
2. **[Supabase Auth 入门](https://supabase.com/docs/guides/auth)** —— 完整的认证体系教程
3. **[RLS 策略指南](https://supabase.com/docs/guides/database/postgres/row-level-security)** —— 行级安全的完整教程

### AI 编程推荐

4. **[Supabase + Cursor 最佳实践](https://supabase.com/blog/cursor-ide-integration)** —— 如何在 AI 编程工具中高效使用 Supabase

### 进阶

5. **[Supabase Realtime 教程](https://supabase.com/docs/guides/realtime)** —— 实时功能的深入使用
6. **[Edge Functions 文档](https://supabase.com/docs/guides/functions) —— 服务端函数开发
7. **[Supabase + Next.js 全栈教程](https://supabase.com/blog/nextjs-supabase-tutorial)** —— 完整的全栈应用开发流程

---

## 作业与自测

> [!QUESTION] 动手任务
>
> 1. **注册**：在 [supabase.com](https://supabase.com) 注册账号，创建一个新项目。
> 2. **建表**：使用表编辑器创建一个 `messages` 表（id, content, created_at）。
> 3. **SQL**：在 SQL 编辑器中执行 INSERT 和 SELECT 操作。
> 4. **集成**：将 Supabase 集成到你的 Next.js 项目中，读取 messages 表的数据并显示在页面上。
> 5. **认证**：添加邮箱登录功能，让用户登录后能看到"我的消息"。
> 6. **RLS**：给 messages 表启用 RLS，让用户只能看到自己发的消息。

<details>
<summary>Supabase RLS 策略参考</summary>

```sql
-- 给 messages 表添加 user_id 字段
ALTER TABLE messages ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- RLS 策略：用户只能看自己的消息
CREATE POLICY "用户查看自己的消息"
ON messages FOR SELECT
USING (auth.uid() = user_id);

-- RLS 策略：用户只能发自己的消息
CREATE POLICY "用户创建消息"
ON messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 启用 RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

</details>

---

## 下一步

学习 [补充课11：小测验 →](s11-xiao-ce-yan.md) —— 用选择题检验内功篇所有知识点。