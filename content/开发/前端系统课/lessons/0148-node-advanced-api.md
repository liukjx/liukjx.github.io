---
title: 第148课：Node 高级 API
description: Node.js 高级 API：fs、Stream、Buffer、EventEmitter、Cluster
date: 2026-08-06
tags:
  - Node.js
  - Stream
  - Buffer
  - EventEmitter
  - Cluster
  - fs
---

# Node 高级 API

## 学习目标

- 掌握 fs 模块的文件和目录操作
- 掌握 Stream 流的原理和应用
- 掌握 Buffer 的使用
- 理解 EventEmitter 和 Cluster

---

## fs 模块

### 文件操作

```javascript
const fs = require('fs');
const fsPromises = require('fs/promises');

// 读取文件
const syncData = fs.readFileSync('file.txt', 'utf-8');

async function readAsync() {
  const asyncData = await fsPromises.readFile('file.txt', 'utf-8');
  return asyncData;
}

// 写入文件
fs.writeFileSync('output.txt', 'Hello', 'utf-8');
fsPromises.writeFile('output.txt', 'Hello', 'utf-8');

// 追加
fs.appendFileSync('log.txt', 'new line\n');

// 文件信息
const stats = fs.statSync('file.txt');
stats.isFile();    // true
stats.isDirectory(); // false
stats.size;        // 文件大小
stats.birthtime;   // 创建时间
```

### 目录操作

```javascript
// 创建目录
fs.mkdirSync('dir/subdir', { recursive: true });

// 读取目录
const files = fs.readdirSync('dir');

// 监视文件变化
fs.watch('file.txt', (event, filename) => {
  console.log(`${filename} changed: ${event}`);
});
```

---

## Stream

```javascript
const { Readable, Writable, Transform, pipeline } = require('stream');

// 可读流
const readStream = fs.createReadStream('source.txt', {
  highWaterMark: 64 * 1024, // 每次读取 64KB
  encoding: 'utf-8'
});

readStream.on('data', chunk => {
  console.log('Received chunk:', chunk);
});
readStream.on('end', () => console.log('读取完成'));

// 可写流
const writeStream = fs.createWriteStream('output.txt');
writeStream.write('Hello');
writeStream.end('World');
writeStream.on('finish', () => console.log('写入完成'));

// 管道
const read = fs.createReadStream('source.txt');
const write = fs.createWriteStream('dest.txt');
read.pipe(write);

// pipeline（推荐，自动处理错误）
pipeline(
  fs.createReadStream('source.txt'),
  new Transform({
    transform(chunk, encoding, callback) {
      this.push(chunk.toString().toUpperCase());
      callback();
    }
  }),
  fs.createWriteStream('dest.txt'),
  (err) => {
    if (err) console.error('Pipeline failed', err);
    else console.log('Pipeline succeeded');
  }
);
```

---

## Buffer

```javascript
// 创建 Buffer
const buf1 = Buffer.alloc(10);           // 分配 10 字节，初始化为 0
const buf2 = Buffer.from('Hello');       // 从字符串创建
const buf3 = Buffer.from([0x48, 0x65]);  // 从数组创建

// 操作
buf1.write('Hello', 0, 5);
const str = buf1.toString('utf-8');
const slice = buf1.slice(0, 3);

// 编码转换
const base64 = buf2.toString('base64');
const hex = buf2.toString('hex');
```

---

## EventEmitter

```javascript
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {
  constructor() {
    super();
  }
}

const emitter = new MyEmitter();

emitter.on('event', (data) => {
  console.log('Event received:', data);
});

emitter.once('once', () => {
  console.log('This runs only once');
});

emitter.emit('event', { key: 'value' });
emitter.removeAllListeners('event');
```

---

## Cluster

```javascript
const cluster = require('cluster');
const http = require('http');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // 自动重启
  });
} else {
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`Handled by worker ${process.pid}`);
  }).listen(8000);

  console.log(`Worker ${process.pid} started`);
}
```

---

## 自测题

### 问题 1
Stream 相对于一次性读取文件的优势是什么？

<details>
<summary>查看答案</summary>
Stream 可以分块处理数据，不需要将整个文件加载到内存中。当处理大文件时，一次性读取（readFile）会将整个文件内容放入内存，可能导致内存溢出。Stream 每次只处理一小块数据（默认 64KB），内存占用恒定，适合处理大文件、视频流、日志等场景。
</details>

### 问题 2
pipeline 和 pipe 方法有什么区别？

<details>
<summary>查看答案</summary>
pipeline 是 Node.js 10+ 提供的替代 pipe 的方法。pipe 的缺点：源流的错误不会自动传播到目标流，可能导致内存泄漏。pipeline 自动处理错误传播和流清理，并在所有流完成时调用回调函数。官方推荐使用 pipeline 替代 pipe。
</details>

### 问题 3
Cluster 模块如何实现多进程？

<details>
<summary>查看答案</summary>
Cluster 模块通过 fork 子进程利用多核 CPU。主进程（master）负责管理和分发请求，工作进程（worker）处理实际请求。主进程监听端口并将请求分发到工作进程（默认使用 round-robin 算法）。当工作进程崩溃时，主进程可以自动重启新进程，提高了应用的可用性。
</details>
