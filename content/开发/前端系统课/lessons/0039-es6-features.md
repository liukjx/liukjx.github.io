---
title: "第39课：ES6+ 新特性"
description: "let/const、解构赋值、展开运算符、模板字符串、Set/Map、Symbol、ES7-ES13 新特性"
date: 2026-08-06
tags:
  - JavaScript
  - ES6
  - ES7
  - ES8
  - ES10
  - ES11
  - ES12
  - ES13
  - Symbol
  - Set
  - Map
---

# 第39课：ES6+ 新特性

> [!NOTE]
> 学习目标：系统掌握 ES6 到 ES13 的核心新特性，理解 Set/Map/WeakSet/WeakMap 的区别和用途，掌握 Symbol 的应用场景。

---

## 一、ES6 核心特性

### 1.1 let、const 和块级作用域

```js
// let —— 可变变量，块级作用域
let message = 'Hello'
message = 'World' // 可以重新赋值

// const —— 不可变变量（常量），块级作用域
const PI = 3.14159
PI = 3 // TypeError: Assignment to constant variable

// const 只是保证指针不可变，对象内容可变
const obj = { name: 'why' }
obj.name = 'kobe' // 可以修改属性
obj = {} // TypeError: 不能重新赋值
```

**和 var 的区别**：
| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 是（undefined） | TDZ | TDZ |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 修改值 | 允许 | 允许 | 不允许 |
| window 属性 | 会 | 不会 | 不会 |

### 1.2 模板字符串

```js
const name = 'why'
const age = 18

// 基本用法
const str = `My name is ${name}, I am ${age} years old.`

// 标签模板字符串
function foo(strings, ...values) {
  console.log(strings) // ["My name is ", ", I am ", " years old."]
  console.log(values)  // ["why", 18]
  return 'processed'
}

const result = foo`My name is ${name}, I am ${age} years old.`
```

### 1.3 解构赋值

```js
// 数组解构
const arr = [1, 2, 3, 4, 5]
const [a, b, ...rest] = arr
console.log(a)     // 1
console.log(b)     // 2
console.log(rest)  // [3, 4, 5]

// 默认值
const [x = 0, y = 0] = [1]
console.log(x, y) // 1, 0

// 交换变量
let m = 10, n = 20
;[m, n] = [n, m] // m=20, n=10

// 对象解构
const obj = { name: 'why', age: 18, height: 1.88 }
const { name, age } = obj
console.log(name, age) // "why", 18

// 重命名
const { name: userName, age: userAge } = obj
console.log(userName) // "why"

// 嵌套解构
const info = { friend: { name: 'kobe', age: 30 } }
const { friend: { name: friendName } } = info
console.log(friendName) // "kobe"
```

### 1.4 展开运算符

```js
// 数组展开
const arr1 = [1, 2, 3]
const arr2 = [4, 5, 6]
const combined = [...arr1, ...arr2] // [1, 2, 3, 4, 5, 6]

// 对象展开（ES2018）
const obj1 = { name: 'why', age: 18 }
const obj2 = { ...obj1, height: 1.88 }
// { name: "why", age: 18, height: 1.88 }

// 函数调用
function foo(a, b, c) {
  return a + b + c
}
foo(...[1, 2, 3]) // 6
```

### 1.5 函数默认参数

```js
function foo(name = 'default', age = 0) {
  console.log(name, age)
}

foo()         // "default", 0
foo('why')    // "why", 0
foo(undefined, 18) // "default", 18 （undefined 触发默认值）
```

---

## 二、Symbol

Symbol 创建**独一无二**的值，解决属性名冲突问题：

```js
// 创建
const s1 = Symbol()
const s2 = Symbol('description')
console.log(s1 === s2) // false

// Symbol.for —— 创建/获取全局 Symbol
const s3 = Symbol.for('uid')
const s4 = Symbol.for('uid')
console.log(s3 === s4) // true —— 相同 key 返回同一个 Symbol

// Symbol.keyFor
console.log(Symbol.keyFor(s3)) // "uid"

// 作为对象属性
const obj = {
  [Symbol('id')]: 12345,
  [Symbol('id')]: 67890  // 不会冲突
}
```

**内置 Symbol 值**：
- `Symbol.iterator` —— 定义对象的迭代器
- `Symbol.hasInstance` —— 自定义 instanceof 行为
- `Symbol.toPrimitive` —— 自定义类型转换

---

## 三、Set 和 WeakSet

### 3.1 Set

`Set` 是元素**不重复**的集合：

```js
// 创建
const set = new Set([1, 2, 3, 3, 2])
console.log(set) // Set(3) {1, 2, 3}

// 常用方法
set.add(4)         // 添加
set.has(1)         // true —— 是否存在
set.delete(2)      // 删除
set.clear()        // 清空
console.log(set.size) // 长度

// 去重
const arr = [1, 2, 3, 2, 1, 4]
const unique = [...new Set(arr)] // [1, 2, 3, 4]

// 遍历
set.forEach(item => console.log(item))
for (const item of set) {
  console.log(item)
}
```

### 3.2 WeakSet

```js
const weakSet = new WeakSet()

// 只能存放对象
weakSet.add({ name: 'why' })

// 方法：add, has, delete（没有 clear, 没有 size, 不可遍历）
```

> [!NOTE]
> WeakSet 中的对象是**弱引用**，如果没有其他引用指向该对象，GC 可以回收它。适用于 DOM 元素标记等场景。

---

## 四、Map 和 WeakMap

### 4.1 Map

`Map` 允许以**任意类型**（包括对象）作为键：

```js
const map = new Map()

// 添加
map.set('name', 'why')
map.set({ key: 1 }, 'object value')

// 获取
console.log(map.get('name')) // "why"

// 其他方法
map.has('name')    // true
map.delete('name') // 删除
map.clear()        // 清空
console.log(map.size) // 长度

// 遍历
for (const [key, value] of map) {
  console.log(key, value)
}
```

### 4.2 WeakMap

```js
const weakMap = new WeakMap()

// key 必须是对象
weakMap.set({ key: 1 }, 'value')

// 方法：set, get, has, delete（没有 clear, 没有 size, 不可遍历）
```

> [!NOTE]
> WeakMap 中的 key 是**弱引用**。应用场景：为对象存储额外数据而不影响 GC，如 Vue3 的响应式系统。

---

## 五、ES7 新特性

```js
// 1. Array.prototype.includes
const arr = [1, 2, 3]
console.log(arr.includes(2)) // true

// 2. 指数运算符 **
console.log(2 ** 10) // 1024（等价于 Math.pow(2, 10)）
```

---

## 六、ES8 新特性

```js
// 1. Object.values
const obj = { name: 'why', age: 18 }
console.log(Object.values(obj)) // ["why", 18]

// 2. Object.entries
console.log(Object.entries(obj)) // [["name", "why"], ["age", 18]]

// 3. String padding
'Hello'.padStart(10, '*') // "*****Hello"
'Hello'.padEnd(10, '*')   // "Hello*****"

// 用于身份证/手机号脱敏
const idCard = '440301199001011234'
const masked = idCard.slice(0, 4).padEnd(idCard.length, '*')
// "4403****************"

// 4. Trailing commas（尾后逗号）
function foo(a, b, c,) {}
const arr = [1, 2, 3,]
```

---

## 七、ES10 新特性

```js
// 1. flat / flatMap
const arr = [1, [2, [3]]]
console.log(arr.flat(2))  // [1, 2, 3]

const messages = ['Hello World', 'Hi there']
console.log(messages.flatMap(m => m.split(' ')))
// ["Hello", "World", "Hi", "there"]

// 2. Object.fromEntries（反向 Object.entries）
const entries = [['name', 'why'], ['age', 18]]
console.log(Object.fromEntries(entries)) // { name: "why", age: 18 }

// 3. trimStart / trimEnd
'  Hello  '.trimStart() // "Hello  "
'  Hello  '.trimEnd()   // "  Hello"
```

---

## 八、ES11 新特性

```js
// 1. BigInt
const bigInt = 9007199254740991n
console.log(bigInt + 10n)

// 2. 空值合并运算符 ??
const value = 0
console.log(value || 'default')  // "default"（0 被当做 falsy）
console.log(value ?? 'default')  // 0（?? 只看 null/undefined）

// 3. 可选链 ?.
const obj = { user: { address: null } }
console.log(obj?.user?.address?.city) // undefined（不会报错）

// 函数调用可选链
function foo(callback) {
  callback?.() // callback 存在才调用
}

// 4. 数字连接符 _
const num = 1_000_000_000 // 语义化大数字
```

---

## 九、ES12 新特性

```js
// 1. FinalizationRegistry —— 监听对象被 GC 回收
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`${heldValue} 被回收了`)
})

let obj = { name: 'why' }
registry.register(obj, 'obj1')
obj = null // GC 时会触发回调

// 2. WeakRef —— 创建弱引用
let objRef = new WeakRef({ name: 'why' })
console.log(objRef.deref()?.name) // "why"（deref 可能返回 undefined）

// 3. 逻辑赋值运算符
let a = 0
a ||= 10   // a = a || 10 -> 10
a &&= 20   // a = a && 20 -> 20
a ??= 30   // a = a ?? 30 -> 20

// 4. replaceAll
'Hello World'.replaceAll('l', 'L') // "HeLLo WorLd"
```

---

## 十、ES13 新特性

```js
// 1. at 方法（Array/String）
const arr = [1, 2, 3]
console.log(arr.at(-1)) // 3（支持负索引）
'Hello'.at(-1) // "o"

// 2. Object.hasOwn（替代 hasOwnProperty）
const obj = { name: 'why' }
console.log(Object.hasOwn(obj, 'name'))     // true
console.log(Object.hasOwn(obj, 'toString')) // false

// 3. class 新成员语法
class Person {
  // 公共实例字段（不需要 constructor 中定义）
  address = '中国'

  // 公共静态字段
  static totalCount = '70亿'

  // 私有实例字段
  #sex = 'male'

  // 私有静态字段
  static #maleCount = '10亿'

  // 静态代码块
  static {
    console.log('静态代码块执行')
  }

  constructor(name, age) {
    this.name = name
    this.age = age
  }

  printInfo() {
    console.log(this.address, this.#sex, Person.#maleCount)
  }
}

const p1 = new Person('why', 18)
console.log(Person.totalCount) // "70亿"
console.log(p1.address)        // "中国"
// console.log(p1.#sex)        // SyntaxError
p1.printInfo()                 // "中国", "male", "10亿"
```

---

## 自测问题

<details>
<summary>1. Set、WeakSet、Map、WeakMap 之间的区别是什么？</summary>

Set：元素不重复，可遍历，强引用。WeakSet：只能存对象，不可遍历，弱引用。
Map：key 可以是任意类型，可遍历，强引用。WeakMap：key 必须是对象，不可遍历，弱引用（key）。
弱引用的好处是不影响 GC 回收，防止内存泄漏。
</details>

<details>
<summary>2. `??` 和 `||` 有什么区别？</summary>

`||` 检查**所有 falsy 值**（0, '', false, null, undefined），`??` 只检查 **null 和 undefined**。因此 `0 ?? 'default'` 返回 0，而 `0 || 'default'` 返回 "default"。
</details>

<details>
<summary>3. ES13 class 新增的语法包括哪些？</summary>

公共实例字段（如 `address = '中国'`）、公共静态字段（`static totalCount`）、私有实例字段（`#sex`）、私有静态字段（`static #count`）、静态代码块（`static {}`）。
</details>

<details>
<summary>4. Symbol 的作用是什么？`Symbol.for` 和 `Symbol()` 的区别？</summary>

Symbol 创建独一无二的值，用于避免属性名冲突。`Symbol()` 每次创建全新值。`Symbol.for(key)` 在全局注册表中管理，相同 key 返回同一个 Symbol。
</details>

---

> 下一课：[[0040-js-async]] —— 异步编程