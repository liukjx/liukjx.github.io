---
title: SQL 速查表
description: PostgreSQL 常用 SQL 命令速查
tags:
  - SQL
  - PostgreSQL
  - 数据库
  - 参考
draft: false
---

# SQL 速查表

> PostgreSQL 常用操作速查。适合在 AI 编程过程中快速查阅。

---

## 数据类型

| 类型 | 说明 | 示例 |
|:----|:----|:----|
| `SERIAL` | 自增整数，通常用作主键 | `id SERIAL PRIMARY KEY` |
| `INTEGER` / `INT` | 整数 | `age INT` |
| `BIGINT` | 大整数 | `views BIGINT` |
| `VARCHAR(n)` | 可变长度字符串 | `name VARCHAR(100)` |
| `TEXT` | 不限长度文本 | `content TEXT` |
| `BOOLEAN` | 布尔值 | `is_active BOOLEAN` |
| `TIMESTAMP` | 日期+时间 | `created_at TIMESTAMP DEFAULT NOW()` |
| `DATE` | 日期 | `birthday DATE` |
| `NUMERIC(p,s)` | 精确小数 | `price NUMERIC(10,2)` |
| `JSONB` | 二进制 JSON | `metadata JSONB` |
| `UUID` | 通用唯一标识符 | `id UUID DEFAULT gen_random_uuid()` |

---

## CREATE TABLE — 创建表

```sql
-- 基础用法
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 带外键
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    total NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## INSERT — 插入数据

```sql
-- 插入单条
INSERT INTO users (name, email, age) VALUES ('张三', 'zhangsan@example.com', 25);

-- 插入多条
INSERT INTO users (name, email, age) VALUES
    ('李四', 'lisi@example.com', 30),
    ('王五', 'wangwu@example.com', 28);

-- 插入并返回数据
INSERT INTO users (name, email) VALUES ('赵六', 'zhaoliu@example.com') RETURNING *;
```

---

## SELECT — 查询数据

```sql
-- 查询全部
SELECT * FROM users;

-- 查询特定列
SELECT name, email FROM users;

-- WHERE 条件
SELECT * FROM users WHERE age > 18;

-- 多条件
SELECT * FROM users WHERE age > 18 AND name LIKE '张%';

-- 排序
SELECT * FROM users ORDER BY created_at DESC;

-- 限制条数
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;

-- 分页（跳过前 20 条）
SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 20;

-- 聚合
SELECT COUNT(*) FROM users;
SELECT status, COUNT(*) FROM orders GROUP BY status;
```

---

## UPDATE — 更新数据

```sql
-- 更新特定记录
UPDATE users SET age = 26 WHERE name = '张三';

-- 更新多条
UPDATE users SET age = age + 1 WHERE age > 0;

-- 更新并返回
UPDATE users SET name = '新名字' WHERE id = 1 RETURNING *;
```

---

## DELETE — 删除数据

```sql
-- 删除特定记录
DELETE FROM users WHERE id = 1;

-- 删除全部（慎用）
DELETE FROM users;

-- 删除并返回
DELETE FROM users WHERE id = 1 RETURNING *;
```

---

## JOIN — 表连接

```sql
-- INNER JOIN（两表交集）
SELECT users.name, orders.total
FROM users
INNER JOIN orders ON users.id = orders.user_id;

-- LEFT JOIN（左表全部 + 右表匹配）
SELECT users.name, orders.total
FROM users
LEFT JOIN orders ON users.id = orders.user_id;

-- RIGHT JOIN（右表全部 + 左表匹配）
SELECT users.name, orders.total
FROM users
RIGHT JOIN orders ON users.id = orders.user_id;

-- FULL OUTER JOIN（两表并集）
SELECT users.name, orders.total
FROM users
FULL OUTER JOIN orders ON users.id = orders.user_id;
```

### JOIN 类型速查

| JOIN 类型 | 结果 |
|:---------|:-----|
| `INNER JOIN` | 只在两表都有匹配时返回 |
| `LEFT JOIN` | 返回左表所有行，右表无匹配则为 NULL |
| `RIGHT JOIN` | 返回右表所有行，左表无匹配则为 NULL |
| `FULL OUTER JOIN` | 返回两表所有行，无匹配则为 NULL |

---

## 索引

```sql
-- 单列索引
CREATE INDEX idx_users_email ON users(email);

-- 联合索引
CREATE INDEX idx_users_name_age ON users(name, age);

-- 唯一索引
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- 查看表的索引
SELECT * FROM pg_indexes WHERE tablename = 'users';

-- 删除索引
DROP INDEX idx_users_email;
```

> **索引原则**：为经常出现在 `WHERE`、`ORDER BY`、`JOIN` 条件的列建立索引。不要过度索引——写操作会变慢。

---

## Migration（数据库迁移）

迁移是**版本控制数据库结构**的方式。每次变更对应一个迁移文件，可以回滚。

```sql
-- 示例：新增一个列
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- 修改列类型
ALTER TABLE users ALTER COLUMN phone TYPE VARCHAR(30);

-- 重命名列
ALTER TABLE users RENAME COLUMN phone TO phone_number;

-- 删除列
ALTER TABLE users DROP COLUMN phone_number;

-- 重命名表
ALTER TABLE users RENAME TO customers;
```

在 Next.js + Drizzle ORM 中的迁移示例：

```bash
# 生成迁移
npx drizzle-kit generate

# 执行迁移
npx drizzle-kit migrate

# 查看迁移状态
npx drizzle-kit check
```

---

## 常见模式

### 软删除（不真删，标记删除）

```sql
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;

-- 查询时过滤
SELECT * FROM users WHERE deleted_at IS NULL;

-- "删除"操作
UPDATE users SET deleted_at = NOW() WHERE id = 1;
```

### 时间戳自动管理

```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建自动更新 updated_at 的函数
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 绑定触发器
CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
```

---

> **相关课程**：[第06课：数据库进阶](lessons/0006-shu-ju-ku-jin-jie.md) — PostgreSQL、Neon、SQL 基础、数据库设计