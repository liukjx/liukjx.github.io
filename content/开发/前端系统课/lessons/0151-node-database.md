---
title: 第151课：数据库操作
description: Node.js 中的 MySQL、MongoDB 操作和 ORM 框架
date: 2026-08-06
tags:
  - Node.js
  - MySQL
  - MongoDB
  - ORM
  - Sequelize
  - 数据库
---

# 数据库操作

## 学习目标

- 掌握 Node.js 操作 MySQL
- 掌握 Node.js 操作 MongoDB
- 理解 ORM 框架的使用

---

## MySQL 操作

```javascript
const mysql = require('mysql2');

// 创建连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'my_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Promise 方式
const promisePool = pool.promise();

// 查询
const [rows] = await promisePool.query(
  'SELECT * FROM users WHERE age > ?',
  [18]
);

// 插入
const [result] = await promisePool.query(
  'INSERT INTO users (name, age) VALUES (?, ?)',
  ['Alice', 25]
);
console.log(result.insertId);
```

---

## Sequelize ORM

```javascript
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

// 定义模型
const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  age: { type: DataTypes.INTEGER },
  email: { type: DataTypes.STRING, unique: true }
});

// 关联
User.hasMany(Post);
Post.belongsTo(User);

// CRUD
const user = await User.create({ name: 'Alice', age: 25 });
const users = await User.findAll({ where: { age: { [Op.gt]: 18 } } });
const user = await User.findByPk(1);
await User.update({ age: 26 }, { where: { id: 1 } });
await User.destroy({ where: { id: 1 } });
```

---

## MongoDB + Mongoose

```javascript
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/myapp');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, min: 0 },
  email: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// CRUD
const user = await User.create({ name: 'Alice', age: 25 });
const users = await User.find({ age: { $gte: 18 } });
const user = await User.findById('id123');
await User.findByIdAndUpdate('id123', { age: 26 });
await User.findByIdAndDelete('id123');
```

---

## 自测题

### 问题 1
ORM 相比于直接写 SQL 有什么优缺点？

<details>
<summary>查看答案</summary>
优点：1）使用面向对象方式操作数据库，开发效率高；2）自动处理 SQL 注入；3）自动迁移（schema 同步）；4）数据库无关性（切换数据库只需改配置）。缺点：1）复杂查询性能差；2）学习曲线（需要学习 ORM 的 API）；3）难优化（生成的 SQL 不一定最优）；4）不适合大数据量的批量操作。
</details>

### 问题 2
数据库连接池的作用是什么？

<details>
<summary>查看答案</summary>
连接池维护一组数据库连接，复用连接避免了频繁创建和关闭连接的开销。当请求到来时，从池中获取一个可用连接；使用完毕后归还到池中。连接池还控制并发连接数，防止过载。常见的配置参数：connectionLimit（最大连接数）、waitForConnections（连接耗尽时是否等待）。
</details>