---
title: 第149课：Express 框架
description: Express 框架、路由、中间件、静态文件
date: 2026-08-06
tags:
  - Node.js
  - Express
  - 路由
  - 中间件
  - 后端
---

# Express 框架

## 学习目标

- 掌握 Express 的安装和基本使用
- 掌握路由定义和参数获取
- 理解中间件的执行机制
- 掌握静态文件服务

---

## 创建服务器

```javascript
const express = require('express');
const app = express();
const port = 3000;

// 解析请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

---

## 路由

```javascript
// 基本路由
app.get('/users', (req, res) => {
  res.json({ users: [...] });
});

app.post('/users', (req, res) => {
  res.status(201).json({ id: 1 });
});

// 路由参数
app.get('/users/:id', (req, res) => {
  console.log(req.params.id);   // 路径参数
  console.log(req.query.page);   // 查询参数
});

// 链式路由
app.route('/articles')
  .get((req, res) => {})
  .post((req, res) => {})
  .put((req, res) => {});

// 路由模块化
const router = express.Router();
router.get('/', handler);
app.use('/api/users', router);
```

---

## 中间件

```javascript
// 应用级中间件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 路由级中间件
const authMiddleware = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
app.get('/protected', authMiddleware, handler);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});
```

---

## 静态文件

```javascript
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
```

---

## 自测题

### 问题 1
Express 中间件的执行顺序是如何确定的？

<details>
<summary>查看答案</summary>
中间件按照注册顺序依次执行，通过 next() 函数控制流程。如果中间件不调用 next()，请求会被挂起。路由匹配也遵循这个规则：匹配到第一个路由后，如果不调用 next('route') 则不再匹配后续路由。错误处理中间件（四个参数）只在错误发生时被调用。
</details>

### 问题 2
Express 中如何获取不同类型的请求参数？

<details>
<summary>查看答案</summary>
三种参数获取方式：1）路径参数（:id）：req.params.id；2）查询参数（?page=1）：req.query.page；3）请求体参数：req.body（需要 body-parser 解析）。分别对应 URL 路径中的动态段、URL 问号后的键值对、POST/PUT 请求体中的数据。
</details>