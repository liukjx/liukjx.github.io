---
title: "第34课：函数高级"
description: "深入理解闭包、高阶函数、函数柯里化和组合函数"
date: 2026-08-06
tags:
  - JavaScript
  - 函数
  - 闭包
  - 柯里化
  - 高阶函数
---

# 第34课：函数高级

> [!NOTE]
> 学习目标：掌握闭包的原理与内存管理，理解高阶函数、纯函数、柯里化和组合函数的设计思想，能够手写柯里化函数和组合函数。

---

## 一、函数对象的属性

JavaScript 中函数也是对象，拥有自己的属性和方法。

### 1.1 name 属性

函数的 `name` 属性返回函数名称：

```js
function foo() {}
console.log(foo.name) // "foo"

const bar = function() {}
console.log(bar.name) // "bar"

const baz = () => {}
console.log(baz.name) // "baz"
```

### 1.2 length 属性

`length` 属性返回函数**形参个数**（不包含剩余参数和默认参数）：

```js
function fn1(a, b, c) {}
console.log(fn1.length) // 3

function fn2(a, b, ...args) {}
console.log(fn2.length) // 2

function fn3(a = 1, b) {}
console.log(fn3.length) // 0（默认参数后的参数不计入）
```

---

## 二、arguments 详解

`arguments` 是函数内部的一个类数组对象，包含所有传入的实参。

### 2.1 基本使用

```js
function sum() {
  console.log(arguments) // Arguments(3) [1, 2, 3]
  let total = 0
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i]
  }
  return total
}
sum(1, 2, 3) // 6
```

### 2.2 转数组的三种方式

```js
function foo() {
  // 方式一：Array.prototype.slice
  const arr1 = Array.prototype.slice.call(arguments)

  // 方式二：Array.from
  const arr2 = Array.from(arguments)

  // 方式三：展开运算符
  const arr3 = [...arguments]
}
```

> [!WARNING]
> 箭头函数**没有** `arguments`，在箭头函数中访问 `arguments` 会沿作用域链向上查找。

### 2.3 剩余参数 rest parameters

ES6 引入 `...args` 语法，替代 `arguments`：

```js
function foo(a, b, ...args) {
  console.log(a)    // 1
  console.log(b)    // 2
  console.log(args) // [3, 4, 5]
}
foo(1, 2, 3, 4, 5)
```

剩余参数是**真数组**，可以直接使用数组方法。

---

## 三、纯函数

### 3.1 概念

纯函数需要满足两个条件：

1. **确定的输入产生确定的输出**（相同的参数永远返回相同的结果）
2. **执行过程中没有副作用**（不修改外部变量、不进行 I/O 操作等）

```js
// 纯函数
function add(a, b) {
  return a + b
}

// 非纯函数 - 依赖外部变量
let c = 10
function addWithC(a, b) {
  return a + b + c
}

// 非纯函数 - 修改外部变量
let total = 0
function addToTotal(a) {
  total += a
  return total
}
```

### 3.2 应用场景

- **React/Redux** 中的 reducer 必须是纯函数
- **函数式编程** 的核心基石
- 便于**测试**和**调试**

> [!TIP]
> 没必要所有函数都写成纯函数，在合理的场景使用即可。副作用也不一定是坏的，程序本身就是副作用的总和。

---

## 四、函数柯里化

### 4.1 什么是柯里化

柯里化是将一个接收**多个参数**的函数，转换为依次接收**单个参数**的**函数序列**的过程。

```js
// 普通函数
function add(a, b, c) {
  return a + b + c
}

// 柯里化版本
function curriedAdd(a) {
  return function(b) {
    return function(c) {
      return a + b + c
    }
  }
}
console.log(curriedAdd(10)(20)(30)) // 60
```

### 4.2 柯里化的优势

**职责单一**：每个函数只处理一个参数

```js
// 日志函数案例
function log(level) {
  return function(message) {
    console.log(`[${level}] ${message}`)
  }
}

const info = log('INFO')
const warn = log('WARN')
const error = log('ERROR')

info('系统启动') // [INFO] 系统启动
warn('内存不足') // [WARN] 内存不足
error('连接失败') // [ERROR] 连接失败
```

**参数复用**：

```js
function makeAdder(count) {
  return function(num) {
    return count + num
  }
}

const add5 = makeAdder(5)
console.log(add5(10)) // 15
console.log(add5(20)) // 25
```

### 4.3 自动柯里化函数

手写一个自动柯里化的工具函数：

```js
function hyCurrying(fn) {
  function curried(...args) {
    // 当参数数量 >= 原函数参数数量时，直接执行
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    } else {
      // 否则继续返回函数接收剩余参数
      return function(...newArgs) {
        return curried.apply(this, args.concat(newArgs))
      }
    }
  }
  return curried
}

// 使用
function foo(a, b, c) {
  return a + b + c
}

const fooCurry = hyCurrying(foo)
console.log(fooCurry(10)(20)(30)) // 60
console.log(fooCurry(10, 20)(30)) // 60
console.log(fooCurry(10, 20, 30)) // 60
```

---

## 五、组合函数

### 5.1 什么是组合函数

将多个函数组合成一个函数，数据依次经过每个函数处理，前一个函数的输出作为后一个函数的输入。

```js
// 两个独立的函数
function double(num) {
  return num * 2
}

function square(num) {
  return num ** 2
}

// 手动组合
const result = square(double(10)) // 400
```

### 5.2 封装 compose

```js
function compose(...fns) {
  // 校验参数
  const length = fns.length
  for (let i = 0; i < length; i++) {
    if (typeof fns[i] !== 'function') {
      throw new TypeError('Expected a function')
    }
  }

  // 返回组合后的函数
  return function(...args) {
    let index = 0
    let result = length ? fns[index].apply(this, args) : args

    while (++index < length) {
      result = fns[index].call(this, result)
    }
    return result
  }
}

// 使用
const composeFn = compose(double, square)
console.log(composeFn(10)) // 400 (double(10)=20, square(20)=400)
```

> [!NOTE]
> 组合函数是函数式编程的核心模式，在 Redux 中间件、Koa 中间件中都有应用。参见 [[0041-js-module]] 中关于模块化的内容。

---

## 六、立即执行函数 IIFE

### 6.1 基本语法

```js
// 常用写法
(function() {
  console.log('IIFE')
})()

// 也可以
(function() {
  console.log('IIFE')
}())

// 带参数
(function(msg) {
  console.log(msg)
})('Hello')
```

### 6.2 应用场景

- **创建独立作用域**（ES6 之前没有块级作用域）
- **模块化编程**的早期实现方案
- **避免变量污染全局**

```js
const moduleA = (function() {
  const privateVar = '私有变量'
  function privateFn() {}

  return {
    publicMethod() {
      console.log(privateVar)
    }
  }
})()

moduleA.publicMethod()
// 外部无法访问 privateVar
```

---

## 七、闭包

### 7.1 什么是闭包

> 闭包是指一个函数**捕获**其外部作用域中的变量，即使在外部函数执行完毕后，仍然可以访问这些变量。

```js
function createCounter() {
  let count = 0

  return function() {
    count++
    console.log(count)
  }
}

const counter = createCounter()
counter() // 1
counter() // 2
counter() // 3
```

### 7.2 闭包的内存模型

```mermaid
graph TB
    subgraph "全局作用域"
        GC[Global Context]
        CF[createCounter 函数]
        C1[counter 变量]
    end

    subgraph "闭包 [[scope]]"
        CL[Closure createCounter]
        CNT[count: 3]
    end

    subgraph "匿名函数"
        AF[function]
        SC[[[scope]] -> 闭包]
    end

    C1 --> AF
    AF --> CL
```

### 7.3 闭包的内存泄漏

闭包会导致外部函数的变量无法被 GC 回收，需要**手动释放**：

```js
function createBigData() {
  const bigData = new Array(1000000).fill('Hello')

  return function() {
    console.log(bigData.length)
  }
}

const fn = createBigData()
fn() // 使用闭包

// 不再需要时，置 null 释放
fn = null // bigData 变得可达性不可达
```

### 7.4 闭包的应用

- **防抖节流**（参见 [[0044-js-error-handling]]）
- **柯里化**
- **私有变量**
- **回调函数中的状态保持**

---

## 八、with 和 eval（了解）

### 8.1 with 语句

```js
const obj = { name: 'why', age: 18 }

with (obj) {
  console.log(name) // "why"
  console.log(age)  // 18
}
```

> [!WARNING]
> `with` 在严格模式下禁用，且会影响性能（JavaScript 引擎难以优化），**不推荐使用**。

### 8.2 eval 语句

```js
eval('const x = 10; console.log(x)') // 10
```

> [!WARNING]
> `eval` 存在**安全风险**（XSS 攻击），且会导致引擎无法优化，**不推荐使用**。

---

## 九、严格模式

### 9.1 开启方式

```js
// 文件级别开启
'use strict'

// 函数级别开启
function foo() {
  'use strict'
}
```

### 9.2 主要限制

| 限制项 | 说明 |
|-------|------|
| 禁止意外创建全局变量 | `name = 'why'` 会报错 |
| 禁止删除不可删除属性 | `delete` 不可配置属性报错 |
| 函数参数不能重名 | `function foo(a, a) {}` 报错 |
| 禁止八进制语法 | `0123` 报错 |
| with 语句禁用 | `with(obj){}` 报错 |
| eval 有独立作用域 | `eval` 内变量不会泄露到外部 |
| this 默认为 undefined | 普通函数 `this` 不再指向全局对象 |

---

## 自测问题

<details>
<summary>1. 什么是闭包？闭包的内存模型是怎样的？如何避免闭包内存泄漏？</summary>

闭包是一个函数捕获其外部作用域中的变量，即使外部函数执行完毕，内部函数仍然可以访问这些变量。内存模型中，闭包会保留对外部变量的引用，形成一个 "[[scope]]" 链。避免泄漏的方法：在不需要闭包时将引用置为 `null`，让 GC 可以回收。
</details>

<details>
<summary>2. 手写一个自动柯里化函数。胡萝卜法</summary>

```js
function hyCurrying(fn) {
  function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    } else {
      return function(...newArgs) {
        return curried.apply(this, args.concat(newArgs))
      }
    }
  }
  return curried
}
```
</details>

<details>
<summary>3. 纯函数需要满足哪两个条件？有什么实际应用？</summary>

1. 相同的输入永远得到相同的输出。2. 执行过程中没有副作用。应用：React/Redux reducer、函数式编程、便于测试。
</details>

<details>
<summary>4. 实现一个 compose 组合函数，将多个函数组合成一个。</summary>

```js
function compose(...fns) {
  return function(...args) {
    let index = 0
    let result = fns.length ? fns[index].apply(this, args) : args
    while (++index < fns.length) {
      result = fns[index].call(this, result)
    }
    return result
  }
}
```
</details>

---

> 下一课：[[0035-js-prototype]] —— 深入原型和原型链