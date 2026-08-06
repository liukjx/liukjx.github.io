---
title: 第55课：Node.js 基础
description: Node.js 运行时介绍、全局对象、模块系统（CommonJS）、输入输出
date: 2026-08-06
tags:
  - Node.js
  - 运行时
  - 模块化
  - CommonJS
---

# 第55课：Node.js 基础

## 学习目标

- 理解 Node.js 是什么以及它与浏览器环境的区别
- 掌握 Node.js 的全局对象（global、__dirname、__filename）
- 理解 CommonJS 模块系统的 require/exports 机制
- 了解 ESModule 的基本语法

---

## 一、Node.js 概述

Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时环境，让 JavaScript 可以脱离浏览器在服务器端运行。

### 浏览器 vs Node.js

| 特性 | 浏览器 | Node.js |
|------|--------|---------|
| 全局对象 | `window` | `global` |
| DOM API | 有 | 无 |
| BOM API | 有 | 无 |
| 模块系统 | ESModule | CommonJS（默认） |
| 文件系统 | 无（安全限制） | 有（`fs` 模块） |
| 用途 | 用户界面 | 服务器端开发 |

---

## 二、Node.js 输入与输出

```javascript
// 1. 输出内容
console.log('Hello World')

const num1 = 100
const num2 = 200
console.log(num1 + num2)

// 2. 接收命令行参数
// 执行：node app.js env=development
const arg1 = process.argv[2]  // "env=development"
const arg2 = process.argv[3]

// 3. 高级控制台方法
console.clear()     // 清空控制台
console.trace()     // 打印当前调用栈
```

---

## 三、Node.js 中的全局对象

### 3.1 类似 window 的全局对象

```javascript
console.log(global)
console.log(globalThis)          // ES2020 引入的统一全局对象
console.log(global === globalThis)  // true（Node.js 中）
```

### 3.2 特殊的全局对象

```javascript
// __dirname —— 当前文件所在目录的绝对路径（重要）
console.log(__dirname)
// 输出：/Users/xxx/project/src

// __filename —— 当前文件的绝对路径（包含文件名）
console.log(__filename)
// 输出：/Users/xxx/project/src/main.js
```

> [!WARNING] 注意
> `__dirname` 和 `__filename` 并不是 `global` 上的属性，而是每个模块作用域内的变量，在 CommonJS 中由模块包装器注入。

### 3.3 模块系统中的全局对象

```javascript
// 这些会在模块化章节详细了解
console.log(module)   // 当前模块对象
console.log(exports)  // 导出对象（module.exports 的引用）
console.log(require)  // 导入函数
```

### 3.4 process 对象

```javascript
console.log(process)
console.log(process.argv)  // 命令行参数数组

// process.nextTick() —— 微任务，在下一轮事件循环开始前执行
process.nextTick(() => {
  console.log('nextTick')
})
```

### 3.5 定时器方法

```javascript
setTimeout(() => {
  console.log('setTimeout')
}, 2000)

setInterval(() => {
  console.log('setInterval')
}, 3000)

// setImmediate —— 在事件循环的 check 阶段执行
setImmediate(() => {
  console.log('setImmediate')
})
```

> [!NOTE] 执行顺序
> `process.nextTick` > 微任务(Promise) > `setTimeout/Interval` > `setImmediate`

---

## 四、CommonJS 模块系统

### 4.1 为什么需要模块化

在没有模块化时，多个 script 标签引入的 JS 文件会共享全局作用域，容易造成变量冲突。

```html
<!-- 传统方式：所有变量都在全局作用域 -->
<script src="./util.js"></script>
<script src="./aaa.js"></script>
<script src="./bbb.js"></script>
```

### 4.2 exports 导出

```javascript
// util.js —— 导出
const UTIL_NAME = '工具模块'

function formatCount() {
  return '200万'
}

function formatDate() {
  return '2022-11-11'
}

// 方式一：直接给 exports 添加属性
exports.UTIL_NAME = UTIL_NAME
exports.formatCount = formatCount
exports.formatDate = formatDate
```

### 4.3 require 导入

```javascript
// main.js —— 导入
// 方式一：获取导出的整个对象，从中取属性
const util = require('./util.js')
console.log(util.UTIL_NAME)       // "工具模块"
console.log(util.formatCount())   // "200万"

// 方式二：解构赋值（推荐）
const { UTIL_NAME, formatCount, formatDate } = require('./util.js')
console.log(UTIL_NAME)
```

### 4.4 require 的加载机制

```javascript
// bar.js —— 导出一个变量
let name = 'bar'
exports.name = name

// 2 秒后修改
setTimeout(() => {
  exports.name = 'why'
}, 2000)

// 4 秒后查看
setTimeout(() => {
  console.log(exports.name)  // "why"
}, 4000)

// main.js —— require 导入
const bar = require('./bar.js')
console.log(bar.name)  // "bar"

// 2 秒后通过 main 修改 bar 的 name
setTimeout(() => {
  bar.name = 'kobe'   // 这会修改 bar.js 中的 exports.name
}, 2000)
```

> [!IMPORTANT] CommonJS 的重要特性
> 1. **输出的是值的引用**：导出的是值的引用，导入方和导出方共享同一个对象
> 2. **模块缓存**：模块第一次 `require` 时会被执行并缓存，后续 `require` 直接返回缓存的结果
> 3. **同步加载**：`require` 是同步的，模块代码会在当前 tick 执行完毕

### 4.5 模块查找规则

```javascript
// 情况一：路径以 ./ 或 ../ 开头 —— 查找自己编写的模块
const utils = require('./utils')

// 情况二：非路径且非内置模块 —— 查找 node_modules
// 会依次向上级目录查找 node_modules
const axios = require('axios')
const why = require('why')

// 情况三：Node.js 内置模块
const path = require('path')
const http = require('http')
```

---

## 五、ESModule

ESModule 是 ECMAScript 官方的模块系统，使用 `import`/`export` 语法。

```javascript
// foo.js —— 导出
const name = 'why'
const age = 18

function sayHello() {
  console.log('sayHello')
}

export {
  name,
  age,
  sayHello
}

// main.js —— 导入
import { name, age, sayHello } from './foo.js'
console.log(name)
console.log(age)
sayHello()
```

> [!NOTE] ESModule 注意事项
> 在浏览器中直接使用 ESModule 时，必须在文件名后面加上 `.js` 后缀（如 `'./foo.js'`），且需要通过 `type="module"` 声明。

### 5.1 统一导出（barrel 导出）

```javascript
// utils/index.js —— 统一导出
import { formatCount, formatDate } from './format.js'
import { parseLyric } from './parse.js'

// 重新导出
export {
  formatCount,
  formatDate,
  parseLyric
}

// 或者使用优化语法
export { formatCount, formatDate } from './format.js'
export { parseLyric } from './parse.js'

// 或者批量导出
export * from './format.js'
export * from './parse.js'
```

---

## 自测问题

<details>
<summary>1. Node.js 中 __dirname 和 __filename 有什么区别？</summary>

`__dirname` 返回当前文件所在目录的绝对路径，`__filename` 返回当前文件的绝对路径（包含文件名）。两者都是模块作用域内的变量，不是 `global` 上的属性。
</details>

<details>
<summary>2. CommonJS 和 ESModule 的主要区别？</summary>

CommonJS 使用 `require`/`exports`，同步加载，输出的是值的引用，运行时加载。ESModule 使用 `import`/`export`，异步加载（浏览器中），输出的是值的只读引用，编译时加载。
</details>

<details>
<summary>3. module.exports 和 exports 有什么关系？</summary>

`exports` 是 `module.exports` 的引用（即 `exports === module.exports` 为 true）。给 `exports` 添加属性等效于给 `module.exports` 添加属性。但直接给 `exports` 赋值会切断引用关系，不生效。
</details>

<details>
<summary>4. Node.js 中查找模块的顺序是什么？</summary>

先判断是否是内置模块；再判断是否是路径形式（`./` 或 `../`）；最后查找 `node_modules` 目录，从当前目录逐级向上查找，直到根目录。
</details>