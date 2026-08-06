---
title: 第23课：对象基础
description: 'JavaScript 对象的创建、属性操作、方法、遍历方式、内存分配和 this 指向'
date: 2026-08-06
tags:
  - javascript
  - course
  - basics
---

# 第23课：对象基础

## 学习目标

- 掌握对象的创建和属性操作
- 理解点符号和方括号的区别
- 掌握对象的遍历方法
- 理解 JavaScript 的内存分配机制
- 理解值传递和引用传递的区别
- 掌握 this 的指向规则

---

## 一. 认识对象

对象是 JavaScript 中的引用数据类型，用于存储键值对的集合。

```javascript
// 创建一个对象（对象字面量）
var person = {
  name: '张三',
  age: 18,
  height: 1.75,
  isStudent: true
}
```

---

## 二. 对象的创建和操作

### 2.1 创建对象的三种方式

```javascript
// 方式一：字面量（推荐）
var obj1 = {
  name: '张三',
  age: 18
}

// 方式二：new Object()
var obj2 = new Object()
obj2.name = '李四'
obj2.age = 20

// 方式三：使用构造函数（后续课程讲解）
function Person(name, age) {
  this.name = name
  this.age = age
}
var obj3 = new Person('王五', 22)
```

### 2.2 属性操作

```javascript
var person = {
  name: '张三',
  age: 18
}

// 1. 获取属性
console.log(person.name)      // "张三"（点符号）
console.log(person['age'])    // 18（方括号）

// 2. 修改属性
person.age = 20
console.log(person.age)       // 20

// 3. 新增属性
person.height = 1.75
console.log(person.height)    // 1.75

// 4. 删除属性
delete person.height
console.log(person.height)    // undefined
```

### 2.3 点符号 vs 方括号

```javascript
var person = {
  name: '张三',
  'my-friend': '李四',
  '123': '数字键'
}

// 点符号：只能操作合法的标识符
console.log(person.name)   // 可以
// console.log(person.my-friend) // 语法错误
// console.log(person.123)       // 语法错误

// 方括号：可以操作任意字符串
console.log(person['my-friend']) // "李四"
console.log(person['123'])       // "数字键"

// 方括号支持变量作为键名
var key = 'name'
console.log(person[key]) // "张三"
```

### 2.4 对象中的方法

```javascript
var person = {
  name: '张三',
  age: 18,
  
  // 方法：对象中的函数
  sayHello: function() {
    console.log('你好，我是' + this.name)
  },
  
  // 简写方式（ES6）
  greeting() {
    console.log('Hello!')
  }
}

person.sayHello()  // "你好，我是张三"
person.greeting()  // "Hello!"
```

---

## 三. 对象的遍历

```javascript
var person = {
  name: '张三',
  age: 18,
  height: 1.75
}

// 方法一：for...in 循环（遍历所有可枚举属性）
for (var key in person) {
  console.log(key, ':', person[key])
}
// 输出：
// name : 张三
// age : 18
// height : 1.75

// 方法二：Object.keys()（获取所有键）
var keys = Object.keys(person)
console.log(keys) // ["name", "age", "height"]

// 方法三：Object.values()（获取所有值）
var values = Object.values(person)
console.log(values) // ["张三", 18, 1.75]
```

---

## 四. JavaScript 内存分配

```mermaid
graph TD
    subgraph 栈内存 Stack
        A[name: "张三"]
        B[age: 18]
        C[person: 引用 →]
    end
    subgraph 堆内存 Heap
        D[{ name: "张三", age: 18 }]
    end
    C --> D
```

JavaScript 的内存分配机制：

- **栈内存**：存储基本数据类型（String、Number、Boolean、Null、Undefined）
- **堆内存**：存储引用数据类型（Object、Array、Function）

```javascript
// 值传递（基本类型）
var a = 10
var b = a
b = 20
console.log(a) // 10（a 不受影响）

// 引用传递（对象类型）
var obj1 = { name: '张三' }
var obj2 = obj1
obj2.name = '李四'
console.log(obj1.name) // "李四"（obj1 也被修改了）

// 两个对象比较：比较的是引用地址
var o1 = { name: '张三' }
var o2 = { name: '张三' }
var o3 = o1

console.log(o1 === o2) // false（不同地址）
console.log(o1 === o3) // true（同一地址）
```

---

## 五. 理解 this 指向

### 5.1 this 的指向规则

```javascript
// 1. 普通函数调用：this → window（严格模式下为 undefined）
function foo() {
  console.log(this) // window
}
foo()

// 2. 对象方法调用：this → 调用该方法的对象
var person = {
  name: '张三',
  sayHello: function() {
    console.log(this.name) // "张三"
  }
}
person.sayHello()

// 3. 构造函数调用：this → 新创建的对象
function Person(name) {
  this.name = name
}
var p = new Person('张三')
console.log(p.name) // "张三"
```

> [!NOTE]
> this 的指向不是在函数定义时确定的，而是在函数**调用时**确定的。this 总是指向函数的调用者。

### 5.2 this 的应用

```javascript
// 在对象中访问其他属性
var calculator = {
  num1: 10,
  num2: 20,
  
  add: function() {
    return this.num1 + this.num2
  },
  
  subtract: function() {
    return this.num1 - this.num2
  }
}

console.log(calculator.add())      // 30
console.log(calculator.subtract()) // -10
```

---

## 六. 创建一系列对象的方式

### 6.1 工厂函数

```javascript
function createPerson(name, age, height) {
  return {
    name: name,
    age: age,
    height: height,
    running: function() {
      console.log(this.name + '在跑步')
    }
  }
}

var p1 = createPerson('张三', 18, 1.75)
var p2 = createPerson('李四', 20, 1.80)
```

### 6.2 构造函数

```javascript
function Person(name, age, height) {
  this.name = name
  this.age = age
  this.height = height
  this.running = function() {
    console.log(this.name + '在跑步')
  }
}

var p1 = new Person('张三', 18, 1.75)
var p2 = new Person('李四', 20, 1.80)
```

构造函数的详细内容将在 [[0026-js-oop|面向对象基础]] 中深入讲解。

---

## 自测问题

<details>
<summary>1. 基本类型和引用类型在内存中的存储方式有什么不同？</summary>

**答案**：基本类型直接存储在栈内存中，保存的是值本身；引用类型的数据存储在堆内存中，栈内存中保存的是对象的引用地址。
</details>

<details>
<summary>2. 点符号和方括号获取属性的主要区别是什么？</summary>

**答案**：点符号只能操作合法的标识符（不能有空格、连字符等）；方括号可以使用任意字符串，也支持变量作为键名。
</details>

<details>
<summary>3. 如何判断两个对象是否相等？</summary>

**答案**：`===` 比较的是两个对象的引用地址是否相同，而不是内容。要比较内容需要逐个属性对比或使用深比较工具。
</details>

<details>
<summary>4. 在对象方法中，如何访问对象的其他属性？</summary>

**答案**：使用 `this` 关键字，如 `this.name`、`this.age`。this 指向调用该方法的对象。
</details>

<details>
<summary>5. 什么是工厂函数？它和构造函数有什么区别？</summary>

**答案**：工厂函数是普通函数，内部手动创建对象并返回；构造函数使用 `new` 关键字调用，自动创建对象并返回，this 指向新对象。
</details>

---

## 参考资源

- 上节课：[[0022-js-functions|函数基础]]
- 下节课：[[0024-js-array|数组详解]]