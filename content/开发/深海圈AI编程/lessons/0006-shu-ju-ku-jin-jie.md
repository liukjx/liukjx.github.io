---
title: "第06课：数据库进阶"
description: "为什么需要数据库、关系型vs非关系型、PostgreSQL介绍、Neon serverless数据库、SQL基础、数据库设计、Migration概念"
tags: [数据库, postgresql, neon, sql, 数据存储, migration]
date: 2026-08-03
draft: false
---

# 数据库进阶

> **数据库是应用的记忆。没有记忆的应用，每次启动都是新的一次。**

前几课我们搭建了本地环境，理解了前后端和 Next.js。但一个真正的应用还需要一个关键部分——**存数据**。

用户注册信息放哪？聊天记录放哪？订单记录放哪？这一课，我们聊数据库。

---

## 1. 为什么要数据库？

### 用 JSON/TXT 文件存数据的问题

很多初学者会想："数据不就是存文件吗？我用 JSON 文件存不就得了？"

确实可以——但只适合**玩具项目**。

```mermaid
graph TD
    subgraph ”用JSON文件的问题”
        A[并发冲突] --> D[两个用户同时写入<br/>文件会互相覆盖]
        B[查询效率低] --> E[1000条数据能遍历<br/>100万条就卡死]
        C[数据一致性] --> F[写入一半程序崩溃<br/>数据不完整]
    end
```

| 问题 | 用 JSON 文件 | 用数据库 |
|------|-------------|---------|
| **并发写入** | 两个请求同时写 → 文件覆盖，数据丢失 | 事务机制，保证原子性 |
| **查询 100 万条** | 要加载整个文件到内存，遍历查找 | 索引+B树，毫秒级查询 |
| **一致性** | 崩溃后数据可能半残 | WAL 日志，崩溃可恢复 |
| **关联查询** | 手动关联多个 JSON，麻烦易错 | JOIN 语句，一行搞定 |
| **权限控制** | 没有 | 行级安全、用户权限 |
| **数据量** | 受限于内存 | 可扩展到 TB 级 |

> [!WARNING]
> **你的第一个商业产品可能用 JSON 文件就够了**——因为数据量还很小。但你要知道，当产品成长时，数据库是必经之路。与其后面迁移，不如一开始就上数据库。

---

## 2. 关系型 vs 非关系型数据库

```mermaid
flowchart LR
    subgraph ”关系型 SQL”
        A[PostgreSQL] --> D[结构化数据<br/>表/行/列]
        B[MySQL] --> D
        C[SQLite] --> D
    end
    subgraph ”非关系型 NoSQL”
        E[MongoDB] --> H[文档型<br/>JSON-like]
        F[Redis] --> I[键值型<br/>内存缓存]
        G[Firebase] --> J[实时文档]
    end
```

| 特性 | 关系型 (SQL) | 非关系型 (NoSQL) |
|------|-------------|-----------------|
| **数据结构** | 严格定义的表结构 | 灵活的文档/键值 |
| **查询语言** | SQL（结构化查询语言） | 各平台自定 API |
| **关系支持** | 强，JOIN 关联查询 | 弱，需手动处理 |
| **一致性** | 强一致（ACID） | 最终一致（BASE） |
| **适用场景** | 业务系统、金融、电商 | 日志、缓存、物联网 |
| **典型代表** | PostgreSQL, MySQL | MongoDB, Redis |

### 选型建议

对于本课程的学员（做 Web 产品、SaaS、小程序）：

> **选 PostgreSQL。没有例外。**

为什么？
- 开源免费，社区庞大
- 功能最全，支持 JSON、全文搜索、地理空间
- Serverless 化成熟（Neon、Supabase）
- 扣子编程底层就是 PostgreSQL
- AI 对 PostgreSQL 的支持最好

---

## 3. PostgreSQL 介绍

**PostgreSQL**（简称 PG）是一个有 30 多年历史的开源关系型数据库。江湖人称"数据库界的瑞士军刀"。

```mermaid
graph TD
    A[PostgreSQL 核心特性] --> B[ACID 事务<br/>数据安全可靠]
    A --> C[丰富的数据类型<br/>JSON/数组/地理/网络]
    A --> D[扩展生态<br/>PostGIS/向量/pgvector]
    A --> E[性能优化<br/>索引/分区/并行查询]
    A --> F[开源免费<br/>社区活跃]
```

### 关键概念速览

| 概念 | 类比 Excel | 说明 |
|------|-----------|------|
| **Database** | 一个 Excel 文件 | 一个应用对应一个数据库 |
| **Table** | 一个 Sheet 工作表 | 一种类型的数据（用户表、订单表） |
| **Column** | 一列 | 数据的一个字段（姓名、年龄） |
| **Row** | 一行 | 一条完整的数据记录 |
| **Primary Key** | 行号 | 唯一标识每一行 |
| **Index** | 目录索引 | 加速查询的数据结构 |
| **Migration** | 版本管理 | 数据库结构的变更记录 |

---

## 4. Neon — Serverless PostgreSQL

### 为什么用 Neon？

传统数据库需要自己买服务器、安装、配置、维护——很麻烦。**Neon** 是一个 Serverless PostgreSQL 服务，让你：

- 不需要管服务器
- 有免费额度（入门够用）
- 自动备份和扩缩容
- 通过连接字符串直接使用

### 注册与使用

1. 打开 https://neon.tech
2. 用 GitHub 账号注册
3. 创建一个新项目
4. 获取连接字符串：

```
postgresql://user:password@ep-example-123456.us-east-2.aws.neon.tech/neondb
```

### 在 Next.js 中连接 Neon

```typescript
// src/lib/db.ts
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// 查询示例
export async function getUsers() {
  const users = await sql`SELECT * FROM users`;
  return users;
}

// 插入示例
export async function createUser(name: string, email: string) {
  await sql`
    INSERT INTO users (name, email)
    VALUES (${name}, ${email})
  `;
}
```

> [!NOTE]
> `DATABASE_URL` 这个环境变量需要在项目根目录的 `.env.local` 文件中配置：
> ```
> DATABASE_URL=postgresql://user:password@ep-example-123456.us-east-2.aws.neon.tech/neondb
> ```

---

## 5. SQL 基础

SQL（Structured Query Language）是与数据库对话的语言。你只需要掌握 5 个基本操作。

### CREATE TABLE — 创建表

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### INSERT — 插入数据

```sql
INSERT INTO users (name, email, age)
VALUES ('张三', 'zhangsan@example.com', 28);
```

### SELECT — 查询数据

```sql
-- 查询所有用户
SELECT * FROM users;

-- 条件查询
SELECT name, email FROM users WHERE age > 18;

-- 排序
SELECT * FROM users ORDER BY created_at DESC;

-- 限制数量
SELECT * FROM users LIMIT 10;
```

### UPDATE — 更新数据

```sql
UPDATE users SET age = 29 WHERE name = '张三';
```

### DELETE — 删除数据

```sql
DELETE FROM users WHERE email = 'zhangsan@example.com';
```

---

## 6. 常用数据类型

| 类型 | 用途 | 示例 |
|------|------|------|
| **`SERIAL`** | 自增整数，常用作主键 | `id SERIAL PRIMARY KEY` |
| **`INTEGER`** | 整数 | `age INTEGER` |
| **`VARCHAR(n)`** | 变长字符串 | `name VARCHAR(100)` |
| **`TEXT`** | 长文本 | `content TEXT` |
| **`TIMESTAMP`** | 日期时间 | `created_at TIMESTAMP DEFAULT NOW()` |
| **`BOOLEAN`** | 布尔值 | `is_active BOOLEAN DEFAULT true` |
| **`JSONB`** | 结构化 JSON 数据 | `metadata JSONB` |
| **`UUID`** | 全局唯一标识符 | `id UUID DEFAULT gen_random_uuid()` |

> [!TIP] JSONB 是 PG 的秘密武器
> 当你不知道某个字段的结构时，用 JSONB 可以灵活存储任意 JSON 数据。比如用户的自定义设置、AI 返回的复杂结构。你的应用既有关系型的严谨，又有 NoSQL 的灵活。

---

## 7. 数据库设计

### 表结构设计示例：哄哄模拟器

```mermaid
erDiagram
    users {
        int id PK
        varchar name
        varchar email
        timestamp created_at
    }
    conversations {
        int id PK
        int user_id FK
        text title
        timestamp created_at
        timestamp updated_at
    }
    messages {
        int id PK
        int conversation_id FK
        text role
        text content
        timestamp created_at
    }
    users ||--o{ conversations : ”has”
    conversations ||--o{ messages : ”contains”
```

```sql
-- 用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 对话表
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL DEFAULT '新对话',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 消息表
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id),
    role VARCHAR(20) NOT NULL, -- 'user' 或 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 索引：加速按用户查询对话
CREATE INDEX idx_conversations_user_id ON conversations(user_id);

-- 索引：加速按对话查询消息
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
```

### 关键设计原则

| 原则 | 说明 | 坏例子 | 好例子 |
|------|------|--------|--------|
| **主键** | 每张表都要有唯一主键 | 没有 id 列 | `id SERIAL PRIMARY KEY` |
| **外键** | 关联用外键约束 | 手动维护关系 | `REFERENCES users(id)` |
| **索引** | 频繁查询的字段加索引 | 每次全表扫描 | 在 user_id 上建索引 |
| **范式化** | 数据不要重复存 | 用户信息存在每条订单里 | 用户和订单分表关联 |

> [!WARNING] 初学者常见错误
> - 忘记加主键 → 数据无法唯一标识
> - 不设外键 → 数据不一致（用户删了，对话还在）
> - 用 VARCHAR 存 JSON → 无法查询 JSON 内部字段（应该用 JSONB）
> - 索引建太多 → 写入速度变慢（索引不是越多越好）

---

## 8. Migration 概念

**Migration（迁移）** 是数据库结构的"版本管理"。

### 没有 Migration 的问题

```
1. 开发时：我在本地表里加了 age 列
2. 同事：他的本地没有 age 列
3. 上线：生产数据库也没有 age 列
4. 结果：程序崩溃 → "column 'age' does not exist"
```

### 有 Migration 的方案

```mermaid
flowchart LR
    A[创建迁移文件<br/>20260803_add_age_to_users.sql] --> B[本地执行迁移]
    B --> C[提交迁移文件到Git]
    C --> D[同事拉取代码<br/>执行迁移]
    C --> E[生产环境<br/>部署时自动执行迁移]
```

```sql
-- 示例迁移文件: 20260803_add_age_to_users.sql
ALTER TABLE users ADD COLUMN age INTEGER;
```

### 常用 Migration 工具

| 工具 | 说明 | 适用场景 |
|------|------|---------|
| **Drizzle Kit** | TypeScript 原生，AI 友好 | 新项目推荐 |
| **Prisma Migrate** | 最流行，可视化 | 团队协作 |
| **Supabase CLI** | 集成 Supabase 生态 | 用 Supabase 的项目 |
| **纯 SQL** | 手动编写 SQL 文件 | 极致控制 |

> [!NOTE] 实际开发中
> 你不需要手动写 Migration。AI 会帮你生成。你只需要告诉 AI："我需要给 users 表加一个 age 字段"，AI 就会自动创建 Migration 文件并执行。

---

## 9. 扣子编程底层就是 PostgreSQL

有意思的是：**扣子编程背后的数据库就是 PostgreSQL。**

你在扣子平台上创建的表、存储的数据，底层实际上就是 PostgreSQL 数据库。只是平台帮你隐藏了所有 SQL 细节。

当你学会在本地使用 PostgreSQL + Neon 后，你会发现：

- 你能做的事情比扣子多得多（自定义查询、复杂关联、数据导出）
- 数据真正属于你（可以用任何 PostgreSQL 客户端连接、备份、迁移）
- 性能完全可控（可以优化索引、调整查询）

---

## 10. 一句话总结

```mermaid
graph LR
    A[JSON文件] -->|数据量小<br/>单用户| B[够用]
    A -->|数据量大<br/>多用户| C[问题重重]
    C --> D[上 PostgreSQL]
    D --> E[Neon 免费托管]
    D --> F[SQL 读写数据]
    D --> G[Migration 管理结构]
```

> **PostgreSQL 是 AI 编程时代最友好的数据库。它不是"一个选项"，而是"默认选择"。**

---

## 作业与自测

> [!QUESTION] 动手任务
>
> 1. **注册**：在 Neon 注册账号，创建一个数据库项目，获取连接字符串。
> 2. **连接**：用 Drizzle Studio 或 pgAdmin 连接你的 Neon 数据库，查看默认表。
> 3. **建表**：在数据库中创建一个 `todos` 表，包含 `id`, `title`, `completed`, `created_at` 四个字段。
> 4. **CRUD**：分别执行 INSERT、SELECT、UPDATE、DELETE 操作，体验完整的 SQL 生命周期。
> 5. **提问**：让 AI 帮你把 Neon 数据库集成到你的 Next.js 项目中，然后试着通过页面增删改查数据。

<details>
<summary>todos 表创建SQL参考答案</summary>

```sql
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 插入几条测试数据
INSERT INTO todos (title) VALUES ('学习数据库'), ('完成作业'), ('部署上线');

-- 查询所有待办
SELECT * FROM todos;

-- 标记第一个为已完成
UPDATE todos SET completed = true WHERE id = 1;

-- 删除已完成的
DELETE FROM todos WHERE completed = true;
```

</details>

---

## 下一步

学习 [第07课：产品设计与Bug调试 →](0007-chan-pin-she-ji-yu-bug-diao-shi.md) 学习如何设计友好的产品界面和高效调试。