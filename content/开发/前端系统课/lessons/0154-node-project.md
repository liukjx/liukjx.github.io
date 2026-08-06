---
title: 第154课：Node 项目实战
description: Node.js 综合项目实战、项目架构、RESTful API 设计
date: 2026-08-06
tags:
  - Node.js
  - 项目实战
  - RESTful
  - API
  - Koa
---

# Node 项目实战

## 学习目标

- 掌握 Node.js 项目的完整开发流程
- 掌握 RESTful API 设计规范
- 掌握项目架构分层

---

## 项目架构 coderhub

```
project/
├── src/
│   ├── app/
│   │   ├── index.js          # 应用入口
│   │   ├── app.js            # Koa 配置
│   │   └── database.js       # 数据库连接
│   ├── controller/           # 控制器
│   ├── service/              # 业务逻辑
│   ├── middleware/           # 中间件
│   ├── router/               # 路由
│   ├── model/                # 数据模型
│   ├── utils/                # 工具函数
│   └── config/               # 配置
├── uploads/                  # 上传文件
├── package.json
└── .env                      # 环境变量
```

---

## 分层架构

```javascript
// controller - 处理请求和响应
class UserController {
  async create(ctx, next) {
    const { name, password } = ctx.request.body;
    const result = await userService.create(name, password);
    ctx.body = { code: 0, data: result };
  }

  async list(ctx, next) {
    const { page = 1, size = 10 } = ctx.query;
    const result = await userService.getList(page, size);
    ctx.body = { code: 0, data: result };
  }
}

// service - 业务逻辑
class UserService {
  async create(name, password) {
    const hashedPwd = await bcrypt.hash(password, 10);
    const statement = 'INSERT INTO users (name, password) VALUES (?, ?)';
    const [result] = await connection.execute(statement, [name, hashedPwd]);
    return result;
  }
}

// router - 路由定义
router.post('/users', verifyUser, handlePassword, userController.create);
router.get('/users', verifyAuth, userController.list);
```

---

## 自测题

### 问题 1
为什么 Node.js 项目要采用分层架构（Controller-Service-Dao）？

<details>
<summary>查看答案</summary>
分层架构将不同职责的代码分离：Controller 处理 HTTP 请求和响应；Service 处理业务逻辑；Dao/Model 处理数据库操作。好处是职责单一、易于测试（可以分别测试各层）、易于维护（修改数据库不影响业务层）、代码复用（Service 可被多个 Controller 使用）。
</details>

### 问题 2
RESTful API 设计中的资源命名规范是什么？

<details>
<summary>查看答案</summary>
使用名词复数形式表示资源集合：GET /users（获取用户列表）、POST /users（创建用户）、GET /users/:id（获取单个用户）、PUT /users/:id（更新用户）、DELETE /users/:id（删除用户）。使用子资源表示关联关系：GET/users/:id/posts。使用查询参数进行过滤和排序：GET /users?role=admin&page=1&sort=createdAt。
</details>