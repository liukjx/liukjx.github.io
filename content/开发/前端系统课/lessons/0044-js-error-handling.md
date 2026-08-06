---
title: "第44课：错误处理"
description: "try-catch、throw、Error 类型、异常处理最佳实践、Chrome 调试技巧"
date: 2026-08-06
tags:
  - JavaScript
  - 错误处理
  - 调试
  - try-catch
  - Error
---

# 第44课：错误处理

> [!NOTE]
> 学习目标：掌握 try-catch-finally 的用法，理解 throw 抛出的错误类型，学会 Chrome DevTools 的调试技巧。

---

## 一、错误类型

### 1.1 JavaScript 内置错误

| 错误类型 | 说明 | 常见场景 |
|---------|------|---------|
| `Error` | 通用错误 | 基类，其他错误继承自它 |
| `SyntaxError` | 语法错误 | 代码不符合语法规则 |
| `TypeError` | 类型错误 | 变量或参数类型不对 |
| `ReferenceError` | 引用错误 | 访问不存在的变量 |
| `RangeError` | 范围错误 | 数值超出有效范围 |
| `URIError` | URI 处理错误 | `decodeURI()` 等函数参数无效 |

```js
// SyntaxError
// const 1name = 'why' // 语法错误，代码无法运行

// ReferenceError
console.log(notDefinedVariable) // ReferenceError

// TypeError
const obj = null
obj.name // TypeError: Cannot read properties of null

// RangeError
new Array(-1) // RangeError: Invalid array length
```

---

## 二、throw 抛出错误

### 2.1 基本用法

```js
function divide(a, b) {
  if (b === 0) {
    throw new Error('除数不能为 0')
  }
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('参数必须是数字')
  }
  return a / b
}

// throw 可以是任何值
throw 123           // 抛出数字
throw '出错了'      // 抛出字符串
throw true          // 抛出布尔值
throw { id: 1 }     // 抛出对象
throw new Error()   // 推荐：抛出 Error 对象
```

> [!TIP]
> 推荐总是 `throw new Error(message)`，因为 Error 对象包含**堆栈追踪信息（stack trace）**，便于调试。

### 2.2 自定义错误类型

```js
class HttpError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.name = 'HttpError'
    this.statusCode = statusCode
  }
}

class ValidationError extends Error {
  constructor(message, field) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

// 使用
function request(url) {
  if (!url) {
    throw new ValidationError('URL 不能为空', 'url')
  }
  // ...
}

try {
  request('')
} catch (err) {
  if (err instanceof ValidationError) {
    console.error(`校验失败: ${err.field} - ${err.message}`)
  } else {
    console.error('其他错误:', err.message)
  }
}
```

---

## 三、try-catch-finally

### 3.1 基本语法

```js
try {
  // 可能出错的代码
  const result = riskyOperation()
  console.log(result)
} catch (error) {
  // 出错时执行
  console.error('捕获到错误:', error.message)
  console.error('堆栈:', error.stack)
} finally {
  // 无论如何都会执行（即使 try 中有 return）
  console.log('清理工作')
}
```

### 3.2 finally 的特殊性

```js
function test() {
  try {
    console.log('try')
    return 'from try'
  } catch (error) {
    console.log('catch')
    return 'from catch'
  } finally {
    console.log('finally')
    // finally 中的 return 会覆盖 try/catch 的 return
    // return 'from finally'
  }
}

console.log(test())
// 输出：
// try
// finally
// from try
```

### 3.3 嵌套 try-catch

```js
try {
  try {
    throw new Error('内部错误')
  } catch (innerErr) {
    console.log('内部 catch:', innerErr.message)
    throw innerErr // 重新抛出，由外部 catch 处理
  }
} catch (outerErr) {
  console.log('外部 catch:', outerErr.message)
}
```

---

## 四、Promise 的错误处理

```js
// Promise 链中，错误会向下传播
new Promise((resolve, reject) => {
  reject('出错了')
})
  .then(value => console.log(value))
  .catch(err => console.error('捕获:', err))

// async/await 错误处理
async function getData() {
  try {
    const result = await fetch('/api/data')
    return result
  } catch (err) {
    console.error('请求失败:', err)
    throw new Error('数据获取失败')
  }
}

// 全局未捕获 Promise 错误
window.addEventListener('unhandledrejection', event => {
  console.error('未处理的 Promise 错误:', event.reason)
  event.preventDefault() // 阻止默认处理
})
```

> 参见 [[0040-js-async]] 了解更多 Promise 错误处理细节。

---

## 五、防抖和节流（实用工具）

### 5.1 防抖（Debounce）

防抖：在事件被触发 n 秒后执行，如果在 n 秒内再次触发，则重新计时。

```js
function debounce(fn, delay, immediate = false) {
  let timer = null
  let isInvoke = false

  const _debounce = function(...args) {
    // 取消上一次定时器
    if (timer) clearTimeout(timer)

    // 立即执行
    if (immediate && !isInvoke) {
      fn.apply(this, args)
      isInvoke = true
    }

    // 延迟执行
    timer = setTimeout(() => {
      fn.apply(this, args)
      isInvoke = false
      timer = null
    }, delay)
  }

  // 取消功能
  _debounce.cancel = function() {
    if (timer) clearTimeout(timer)
    timer = null
    isInvoke = false
  }

  return _debounce
}

// 使用
const handler = debounce(() => {
  console.log('搜索请求发送')
}, 500)

// 用户输入
input.addEventListener('input', handler)

// 组件销毁时取消
// handler.cancel()
```

### 5.2 节流（Throttle）

节流：在 n 秒内只执行一次事件处理函数。

```js
function throttle(fn, interval, options = { leading: true, trailing: false }) {
  let lastTime = 0
  let timer = null

  const _throttle = function(...args) {
    const nowTime = new Date().getTime()

    // leading 为 false 时，首次不触发
    if (!lastTime && options.leading === false) {
      lastTime = nowTime
    }

    const remainTime = interval - (nowTime - lastTime)
    if (remainTime <= 0) {
      // 时间到了，执行
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      fn.apply(this, args)
      lastTime = nowTime
    } else if (options.trailing && !timer) {
      // 尾部执行
      timer = setTimeout(() => {
        fn.apply(this, args)
        lastTime = options.leading ? new Date().getTime() : 0
        timer = null
      }, remainTime)
    }
  }

  // 取消
  _throttle.cancel = function() {
    if (timer) clearTimeout(timer)
    timer = null
    lastTime = 0
  }

  return _throttle
}

// 使用
const handler = throttle(() => {
  console.log('滚动事件处理')
}, 200)

window.addEventListener('scroll', handler)
```

### 5.3 防抖 vs 节流

| 特性 | 防抖（Debounce） | 节流（Throttle） |
|------|-----------------|-----------------|
| 逻辑 | 连续触发只执行最后一次 | 固定频率执行 |
| 场景 | 搜索输入框、窗口 resize | 滚动加载、按钮点击 |
| 效果 | 停止操作后执行 | 间隔固定时间执行 |

---

## 六、深拷贝实现

```js
function deepClone(value, weakMap = new WeakMap()) {
  // 基本类型直接返回
  if (value === null || typeof value !== 'object') return value

  // 处理循环引用
  if (weakMap.has(value)) return weakMap.get(value)

  // 处理特殊对象
  if (value instanceof Set) {
    const newSet = new Set()
    value.forEach(item => newSet.add(deepClone(item, weakMap)))
    return newSet
  }

  if (value instanceof Map) {
    const newMap = new Map()
    value.forEach((val, key) => newMap.set(deepClone(key, weakMap), deepClone(val, weakMap)))
    return newMap
  }

  if (value instanceof Date) return new Date(value)
  if (value instanceof RegExp) return new RegExp(value)

  // 处理 Symbol key
  const newObj = Array.isArray(value) ? [] : {}
  weakMap.set(value, newObj)

  // 复制普通 key
  for (const key in value) {
    if (value.hasOwnProperty(key)) {
      newObj[key] = deepClone(value[key], weakMap)
    }
  }

  // 复制 Symbol key
  const symbolKeys = Object.getOwnPropertySymbols(value)
  for (const sKey of symbolKeys) {
    newObj[sKey] = deepClone(value[sKey], weakMap)
  }

  return newObj
}
```

---

## 七、事件总线

```js
class HYEventBus {
  constructor() {
    this.eventMap = new Map()
  }

  on(eventName, fn) {
    let fns = this.eventMap.get(eventName)
    if (!fns) {
      fns = []
      this.eventMap.set(eventName, fns)
    }
    fns.push(fn)
  }

  emit(eventName, ...args) {
    const fns = this.eventMap.get(eventName)
    if (fns) {
      fns.forEach(fn => fn(...args))
    }
  }

  off(eventName, fn) {
    const fns = this.eventMap.get(eventName)
    if (!fns) return
    if (!fn) {
      // 没有传 fn，移除所有
      this.eventMap.delete(eventName)
    } else {
      const index = fns.indexOf(fn)
      if (index !== -1) fns.splice(index, 1)
    }
  }
}

// 使用
const bus = new HYEventBus()
const handler = (data) => console.log('收到:', data)
bus.on('message', handler)
bus.emit('message', 'Hello') // 收到: Hello
bus.off('message', handler)
```

---

## 八、Chrome 调试技巧

### 8.1 断点类型

| 断点类型 | 说明 |
|---------|------|
| 行断点 | 单击行号设置，代码执行到该行暂停 |
| 条件断点 | 右键行号设置，满足条件才暂停 |
| DOM 断点 | 元素面板中设置，监听 DOM 变化 |
| XHR 断点 | Sources 面板中设置，监听 AJAX 请求 |
| 事件断点 | 监听特定事件触发 |

### 8.2 常用技巧

- **`debugger`** 语句：在代码中插入断点
- **Watch** 面板：监视变量变化
- **Call Stack**：查看函数调用栈
- **Scope**：查看当前作用域的变量
- **Console 中查看变量**：暂停时可直接在 Console 中操作

```js
// 使用 debugger 语句
function complexFunction(data) {
  debugger // 执行到这里自动暂停
  const result = data.map(item => item.value)
  return result
}
```

---

## 自测问题

<details>
<summary>1. try-catch-finally 中 finally 的作用是什么？如果 try 中有 return，finally 还会执行吗？</summary>

finally 无论是否出错都会执行，用于清理工作（关闭连接、释放资源等）。即使 try 中有 return，finally 也会在 return 之前执行。注意：如果 finally 中也有 return，会覆盖 try 的返回值。
</details>

<details>
<summary>2. 防抖和节流有什么区别？各自适用于什么场景？</summary>

防抖：连续触发只执行最后一次，适用于搜索输入框（用户停止输入后发送请求）、窗口 resize。节流：固定频率执行，适用于滚动加载（每隔 200ms 检查一次）、按钮点击防重复提交。
</details>

<details>
<summary>3. Promise 链中如何正确捕获错误？全局未捕获 Promise 错误如何处理？</summary>

Promise 链中的错误会向下传播到最近的 catch。每个 then 可指定 onRejected，或最后加一个 catch 统一捕获。全局未捕获的 Promise 错误可以通过 `window.addEventListener('unhandledrejection', handler)` 监听。
</details>

---

> 下一课：[[0045-js-regexp]] —— 正则表达式