---
title: 第57课：Node 核心模块
description: Node.js 内置核心模块（path、fs、http、url、Buffer）的使用
date: 2026-08-06
tags:
  - Node.js
  - path
  - fs
  - http
  - Buffer
---

# 第57课：Node 核心模块

## 学习目标

- 掌握 path 模块的常用方法（extname、basename、dirname、join、resolve）
- 了解 fs 模块的文件读写操作
- 了解 http 模块创建服务器
- 了解 url 模块和 Buffer 的基本使用

---

## 一、path 模块

`path` 模块用于处理文件和目录的路径。

### 1.1 获取路径基本信息

```javascript
const path = require('path')

const filepath = '/Users/abc/cba/nba.txt'

// 获取文件扩展名
console.log(path.extname(filepath))  // ".txt"

// 获取文件名（含扩展名）
console.log(path.basename(filepath)) // "nba.txt"

// 获取目录路径
console.log(path.dirname(filepath))  // "/Users/abc/cba"
```

### 1.2 路径拼接

```javascript
// join：将多个路径片段拼接成一个路径
const path1 = '/abc/cba'
const path2 = '../why/kobe/james.txt'
console.log(path.join(path1, path2))
// 输出："/abc/why/kobe/james.txt"
```

### 1.3 获取绝对路径（resolve）

```javascript
// resolve：将一个或多个路径片段解析为一个绝对路径
console.log(path.resolve('./abc/cba', '../why/kobe', './abc.txt'))
// 输出：当前工作目录 + "/abc/why/kobe/abc.txt"

// 不传参数时，返回当前工作目录的绝对路径
console.log(path.resolve())
// 输出：/Users/current/project

// 在 webpack 配置中经常使用
const path = require('path')
module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './build')
  }
}
```

> [!TIP] join vs resolve 的区别
> `join` 直接将路径片段拼接，不生成绝对路径。`resolve` 会解析为绝对路径（从当前工作目录或 `/` 开始解析），且 `..` 会向上级目录跳转。在 webpack、vite 等构建工具的配置中，`path.resolve(__dirname, 'dist')` 是标准用法。

---

## 二、fs 模块

`fs`（File System）模块用于对文件系统进行读写操作。

### 2.1 文件读取

```javascript
const fs = require('fs')

// 同步读取
const content = fs.readFileSync('./test.txt', { encoding: 'utf-8' })
console.log(content)

// 异步读取（回调版本）
fs.readFile('./test.txt', { encoding: 'utf-8' }, (err, data) => {
  if (err) {
    console.error('读取失败:', err)
    return
  }
  console.log(data)
})
```

### 2.2 文件写入

```javascript
// 同步写入
fs.writeFileSync('./output.txt', 'Hello Node.js', { encoding: 'utf-8' })

// 异步写入
fs.writeFile('./output.txt', 'Hello Node.js', { encoding: 'utf-8' }, (err) => {
  if (err) {
    console.error('写入失败:', err)
    return
  }
  console.log('写入成功')
})
```

### 2.3 常用方法

| 方法 | 说明 |
|------|------|
| `fs.readFileSync()` | 同步读取文件 |
| `fs.readFile()` | 异步读取文件 |
| `fs.writeFileSync()` | 同步写入文件 |
| `fs.writeFile()` | 异步写入文件 |
| `fs.mkdirSync()` | 同步创建目录 |
| `fs.existsSync()` | 同步检查文件/目录是否存在 |
| `fs.stat()` | 获取文件/目录信息 |
| `fs.unlink()` | 删除文件 |

---

## 三、http 模块

`http` 模块用于创建 HTTP 服务器和客户端。

### 3.1 创建基础服务器

```javascript
const http = require('http')

// 创建服务器
const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain;charset=utf-8')
  res.end('Hello Node.js Server')
})

// 监听端口
server.listen(3000, () => {
  console.log('服务器已启动: http://localhost:3000')
})
```

### 3.2 处理不同路由

```javascript
const server = http.createServer((req, res) => {
  const { url, method } = req

  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (url === '/api/users' && method === 'GET') {
    res.end(JSON.stringify({ name: 'why', age: 18 }))
  } else if (url === '/api/login' && method === 'POST') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      console.log('请求体:', body)
      res.end(JSON.stringify({ message: '登录成功' }))
    })
  } else {
    res.statusCode = 404
    res.end('Not Found')
  }
})
```

---

## 四、url 模块

`url` 模块用于解析 URL 字符串。

```javascript
const url = require('url')

const urlString = 'https://www.example.com:8080/path/name?query=string&page=1#hash'

// 解析 URL
const parsedUrl = new URL(urlString)
console.log(parsedUrl.protocol)    // "https:"
console.log(parsedUrl.hostname)    // "www.example.com"
console.log(parsedUrl.port)        // "8080"
console.log(parsedUrl.pathname)    // "/path/name"
console.log(parsedUrl.search)      // "?query=string&page=1"
console.log(parsedUrl.hash)        // "#hash"

// 获取查询参数
console.log(parsedUrl.searchParams.get('query'))  // "string"
console.log(parsedUrl.searchParams.get('page'))   // "1"
```

---

## 五、Buffer

`Buffer` 用于在 Node.js 中处理二进制数据（如文件、网络流等）。

```javascript
// 创建 Buffer
const buf1 = Buffer.alloc(10)               // 创建一个长度为 10 的零填充 Buffer
const buf2 = Buffer.from('Hello')            // 从字符串创建
const buf3 = Buffer.from([0x68, 0x65, 0x6c]) // 从字节数组创建

// Buffer 与字符串转换
const str = buf2.toString('utf-8')           // "Hello"
const hex = buf2.toString('hex')             // "48656c6c6f"

// 操作 Buffer
console.log(buf2.length)       // 5（字节长度）
console.log(buf2[0])           // 72（ASCII 码 'H'）
buf2[0] = 0x68                // 修改为 'h'
```

---

## 自测问题

<details>
<summary>1. path.join() 和 path.resolve() 有什么区别？</summary>

`path.join()` 只是拼接路径片段，不会生成绝对路径。`path.resolve()` 会解析出绝对路径：从右到左处理路径片段，遇到 `/` 开头的路径则以此为根，否则拼接到当前工作目录之前。
</details>

<details>
<summary>2. fs.readFile() 的同步和异步版本有什么区别？</summary>

`fs.readFileSync()` 会阻塞后续代码执行直到文件读取完成，直接返回文件内容。`fs.readFile()` 是异步的，不会阻塞后续代码，文件读取完成后通过回调函数处理结果。生产环境中优先使用异步版本。
</details>

<details>
<summary>3. 如何用 http 模块创建一个简单的 API 服务器？</summary>

使用 `http.createServer()` 创建服务器，在回调函数中根据 `req.url` 和 `req.method` 处理不同路由，通过 `res.end()` 返回响应数据。调用 `server.listen(port)` 启动服务器监听端口。
</details>

<details>
<summary>4. Buffer 的作用是什么？</summary>

Buffer 用于处理二进制数据流，在文件读写、网络通信（TCP/HTTP）等场景中频繁使用。因为 JavaScript 原生不支持二进制数据，Node.js 提供了 Buffer 类来处理这类数据。
</details>