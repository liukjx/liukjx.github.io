---
title: "第42课：Proxy 和 Reflect"
description: "Proxy 拦截操作、Reflect 元编程、Object.defineProperty vs Proxy、响应式原理基础"
date: 2026-08-06
tags:
  - JavaScript
  - Proxy
  - Reflect
  - 元编程
  - 响应式
---

# 第42课：Proxy 和 Reflect

> [!NOTE]
> 学习目标：掌握 Proxy 的拦截机制，理解 Reflect 的作用，能够使用 Proxy + Reflect 实现数据拦截。了解 Object.defineProperty 与 Proxy 的区别。

---

## 一、Object.defineProperty 回顾

### 1.1 数据属性描述符

```js
const obj = {}

Object.defineProperty(obj, 'name', {
  configurable: true,  // 是否可以删除/重新定义
  enumerable: true,    // 是否可以枚举
  writable: true,      // 是否可以修改
  value: 'why'         // 属性值
})
```

### 1.2 存储属性描述符（访问器）

```js
const obj = {
  _name: 'why'
}

Object.defineProperty(obj, 'name', {
  configurable: true,
  enumerable: true,
  get() {
    return this._name
  },
  set(value) {
    this._name = value
  }
})
```

### 1.3 defineProperty 的局限性

- 只能拦截**已有属性**的读写（新增属性需要重新 defineProperty）
- 需要使用**递归**遍历深层对象
- 无法拦截数组的**push/pop**等变更方法（Vue2 需特殊处理）
- 语法较繁琐

---

## 二、Proxy

### 2.1 基本使用

```js
const target = {
  name: 'why',
  age: 18
}

const handler = {
  // 拦截读取
  get(target, key, receiver) {
    console.log(`GET ${key}`)
    return target[key]
  },
  // 拦截设置
  set(target, key, value, receiver) {
    console.log(`SET ${key} = ${value}`)
    target[key] = value
    return true // 表示设置成功
  }
}

const proxy = new Proxy(target, handler)
console.log(proxy.name) // GET name -> "why"
proxy.name = 'kobe'     // SET name = kobe
```

> [!NOTE]
> Proxy 可以代理**整个对象**，包括新增属性、数组索引等，而不需要像 defineProperty 那样逐个定义。参见 [[0037-js-oop-advanced]]。

### 2.2 常用捕获器

```js
const handler = {
  // 属性读取
  get(target, key, receiver) {
    console.log(`读取 ${key}`)
    return Reflect.get(target, key, receiver)
  },

  // 属性设置
  set(target, key, value, receiver) {
    console.log(`设置 ${key} = ${value}`)
    return Reflect.set(target, key, value, receiver)
  },

  // 拦截 in 操作符
  has(target, key) {
    console.log(`检查 ${key}`)
    return key in target
  },

  // 拦截 delete
  deleteProperty(target, key) {
    console.log(`删除 ${key}`)
    return delete target[key]
  },

  // 拦截 for...in
  ownKeys(target) {
    console.log('获取所有 key')
    return Reflect.ownKeys(target)
  },

  // 拦截函数调用
  apply(target, thisArg, args) {
    console.log(`调用函数: ${target.name}`)
    return target.apply(thisArg, args)
  },

  // 拦截 new 操作符
  construct(target, args, newTarget) {
    console.log(`new 实例化`)
    return new target(...args)
  }
}
```

### 2.3 完整示例

```js
const obj = {
  name: 'why',
  age: 18,
  _password: '123456'
}

const proxy = new Proxy(obj, {
  get(target, key) {
    if (key.startsWith('_')) {
      throw new Error('禁止访问私有属性')
    }
    return target[key]
  },

  set(target, key, value) {
    if (key === 'age') {
      if (value < 0 || value > 150) {
        throw new Error('年龄不合法')
      }
    }
    target[key] = value
    return true
  },

  has(target, key) {
    if (key === '_password') return false
    return key in target
  },

  deleteProperty(target, key) {
    if (key.startsWith('_')) {
      throw new Error('禁止删除私有属性')
    }
    delete target[key]
    return true
  }
})

console.log(proxy.name)        // "why"
// console.log(proxy._password) // Error: 禁止访问
proxy.age = 20                 // OK
// proxy.age = 200             // Error: 年龄不合法
// console.log('_password' in proxy) // false
// delete proxy._password       // Error
```

### 2.4 代理数组

```js
const arr = [1, 2, 3]

const proxyArr = new Proxy(arr, {
  get(target, key) {
    console.log(`读取 arr[${key}]`)
    return target[key]
  },
  set(target, key, value) {
    console.log(`设置 arr[${key}] = ${value}`)
    target[key] = value
    return true
  }
})

proxyArr[0]      // 读取 arr[0]
proxyArr[3] = 4  // 设置 arr[3] = 4
proxyArr.push(5) // 会触发多次 set（长度变化 + 元素设置）
```

---

## 三、Reflect

### 3.1 Object 方法的问题

```js
const obj = {}

// 直接使用 Object.defineProperty 在严格模式下会抛出异常
try {
  Object.defineProperty(obj, 'name', { value: 'why' })
  Object.defineProperty(obj, 'name', { value: 'kobe' }) // 可能抛出异常
} catch (err) {
  // 需要 try/catch 捕获
}

// Reflect 有返回值，避免 try/catch
const success = Reflect.defineProperty(obj, 'name', { value: 'why' })
console.log(success) // true/false
```

### 3.2 Reflect 的静态方法

```js
const obj = { name: 'why', age: 18 }

// 读取
Reflect.get(obj, 'name')       // "why"
// 设置（返回布尔值）
Reflect.set(obj, 'name', 'kobe') // true
// 检查
Reflect.has(obj, 'name')       // true
// 删除
Reflect.deleteProperty(obj, 'name') // true
// 获取原型
Reflect.getPrototypeOf(obj)    // Object.prototype
// 设置原型
Reflect.setPrototypeOf(obj, null) // true
// 定义属性
Reflect.defineProperty(obj, 'name', { value: 'why' }) // true

// ownKeys
Reflect.ownKeys(obj)           // ["name", "age"]

// 构造
class Person {}
const p = Reflect.construct(Person, [])
```

### 3.3 Proxy + Reflect 配合使用

```js
const obj = {
  _name: 'why',
  get name() {
    return this._name
  },
  set name(value) {
    this._name = value
  }
}

const proxy = new Proxy(obj, {
  get(target, key, receiver) {
    // 使用 Reflect.get 并传入 receiver
    // receiver 保证了访问器中的 this 指向 proxy 而非 target
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    return Reflect.set(target, key, value, receiver)
  }
})
```

**为什么需要 receiver？**

```js
const parent = {
  _name: 'parent',
  get name() {
    return this._name // 这里 this 需要指向正确的对象
  }
}

const child = {
  _name: 'child'
}

// 设置 child 的原型为 parent
Reflect.setPrototypeOf(child, parent)

// 直接获取
console.log(child.name) // "child"（this 指向 child）

// 通过 Proxy
const proxyChild = new Proxy(child, {
  get(target, key, receiver) {
    // 如果不传 receiver，访问 name 时 this 指向 target（即 child）
    // 传了 receiver，this 指向 proxyChild
    return Reflect.get(target, key, receiver)
  }
})
console.log(proxyChild.name) // "child"
```

---

## 四、Object.defineProperty vs Proxy

| 特性 | Object.defineProperty | Proxy |
|------|----------------------|-------|
| 拦截范围 | 只能拦截已有属性 | 整个对象的操作（增删改查） |
| 新增属性 | 需要重新监听 | 自动拦截 |
| 数组 | 需要特殊处理 | 原生支持 |
| 语法 | 逐个定义 | 统一 handler |
| 性能 | 较好 | 稍弱但功能更强 |
| 兼容性 | IE9+ | IE 不支持 |

---

## 五、响应式原理基础

基于 Proxy + Reflect 可以构建简单的响应式系统：

```js
// 依赖收集
let activeEffect = null
const targetMap = new WeakMap()

function track(target, key) {
  if (!activeEffect) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let deps = depsMap.get(key)
  if (!deps) {
    deps = new Set()
    depsMap.set(key, deps)
  }

  deps.add(activeEffect)
}

function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const deps = depsMap.get(key)
  if (deps) {
    deps.forEach(effect => effect())
  }
}

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key)
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver)
      trigger(target, key)
      return result
    }
  })
}

// 使用
const state = reactive({ count: 0 })

effect(() => {
  console.log(`count 变化了: ${state.count}`)
})

state.count++ // 触发 effect 重新执行
```

> [!NOTE]
> 这个原理是 Vue3 响应式系统的核心基础。更深入的内容会在框架课程中讲解。

---

## 自测问题

<details>
<summary>1. Proxy 相比于 Object.defineProperty 有哪些优势？</summary>

Proxy 可以代理整个对象（含新增属性），原生支持数组操作拦截，语法统一简洁。Object.defineProperty 只能拦截已有属性，数组需要特殊处理。
</details>

<details>
<summary>2. Reflect 的作用是什么？为什么要在 Proxy 中使用 Reflect？</summary>

Reflect 提供操作对象的统一 API，有返回值（不抛异常）。在 Proxy 中使用 Reflect 的 get/set 并传入 receiver，可以确保访问器属性中的 this 正确指向 Proxy 而非原始对象。
</details>

<details>
<summary>3. 手写一个简单的 reactive 函数。</summary>

```js
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key)  // 依赖收集
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver)
      trigger(target, key) // 触发更新
      return result
    }
  })
}
```
</details>

---

> 下一课：[[0043-js-data-structures]] —— 数据结构基础