---
title: 第25课：字符串和 Math/Date
description: 'JavaScript 字符串的常用方法、包装类型机制、Math 对象和 Date 日期对象的使用'
date: 2026-08-06
tags:
  - javascript
  - course
  - basics
---

# 第25课：字符串和 Math/Date

## 学习目标

- 掌握字符串的常用方法
- 理解包装类型机制的原理
- 掌握 Math 对象常用方法
- 掌握 Date 对象的创建和操作

---

## 一. 包装类型

### 1.1 为什么基本类型可以调用方法？

```javascript
var str = 'hello'
console.log(str.length) // 5（基本类型为什么有属性？）
```

**包装类型的原理**：

```mermaid
graph LR
    A[原始字符串 'hello'] --> B[访问 str.length]
    B --> C[JS 创建临时 String 包装对象]
    C --> D[读取 length 属性]
    D --> E[销毁临时对象]
    E --> F[返回结果 5]
```

当访问基本类型的方法或属性时，JavaScript 会临时创建一个对应的包装类型对象（String/Number/Boolean），操作完成后立即销毁。

### 1.2 包装类型

```javascript
// String 包装类型
var str = new String('hello')
console.log(typeof str) // "object"
console.log(str.length) // 5

// Number 包装类型
var num = new Number(123)

// Boolean 包装类型
var bool = new Boolean(true)

// 不推荐手动使用 new 创建包装类型
```

> [!WARNING]
> 建议避免使用 `new String()`、`new Number()`、`new Boolean()` 创建包装对象，直接使用字面量即可。

---

## 二. 字符串的常用方法

### 2.1 查找方法

```javascript
var str = 'Hello World'

// indexOf：查找子串位置
console.log(str.indexOf('World'))  // 6
console.log(str.indexOf('world'))  // -1（区分大小写）

// includes：是否包含
console.log(str.includes('Hello')) // true

// startsWith：是否以...开头
console.log(str.startsWith('He'))  // true

// endsWith：是否以...结尾
console.log(str.endsWith('ld'))    // true
```

### 2.2 截取方法

```javascript
var str = 'Hello World'

// slice(start, end)：截取子串（不包含 end）
console.log(str.slice(0, 5))   // "Hello"
console.log(str.slice(6))      // "World"（省略 end 到末尾）
console.log(str.slice(-5))     // "World"（支持负数）

// substring(start, end)：类似 slice 但不支持负数
console.log(str.substring(0, 5)) // "Hello"

// substr(start, length)：从 start 取 length 个
console.log(str.substr(6, 3)) // "Wor"
```

### 2.3 转换方法

```javascript
var str = 'Hello World'

// toUpperCase：转大写
console.log(str.toUpperCase()) // "HELLO WORLD"

// toLowerCase：转小写
console.log(str.toLowerCase()) // "hello world"

// split：分割为数组
console.log(str.split(' '))    // ["Hello", "World"]
console.log('a,b,c'.split(',')) // ["a", "b", "c"]
```

### 2.4 其他方法

```javascript
var str = '  Hello World  '

// trim：去除两端空格
console.log(str.trim())       // "Hello World"

// replace：替换
console.log(str.replace('World', 'JavaScript')) // "  Hello JavaScript  "

// charAt：获取指定位置的字符
console.log(str.charAt(2))    // "H"
console.log(str[2])           // "H"（支持方括号访问）

// concat：拼接
console.log('Hello'.concat(' ', 'World')) // "Hello World"
```

---

## 三. Math 对象

Math 是 JavaScript 内置的工具对象，提供数学相关的方法。

```javascript
// 常量
console.log(Math.PI)   // 3.141592653589793

// 取整
console.log(Math.floor(3.7)) // 3（向下取整）
console.log(Math.ceil(3.2))  // 4（向上取整）
console.log(Math.round(3.5)) // 4（四舍五入）

// 最大值和最小值
console.log(Math.max(1, 5, 3, 9, 2)) // 9
console.log(Math.min(1, 5, 3, 9, 2)) // 1

// 幂运算和平方根
console.log(Math.pow(2, 3)) // 8（2 的 3 次方）
console.log(Math.sqrt(16))  // 4

// 绝对值
console.log(Math.abs(-10))  // 10
```

### 随机数

```javascript
// Math.random()：生成 [0, 1) 之间的随机小数

// 生成 [1, 100] 之间的随机整数
var random = Math.floor(Math.random() * 100) + 1
console.log(random)

// 生成 [min, max] 之间的随机整数
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

console.log(randomInt(10, 20)) // 10~20 之间的随机整数
```

---

## 四. Date 对象

Date 用于处理日期和时间。

### 4.1 创建 Date 对象

```javascript
// 当前时间
var now = new Date()
console.log(now) // 当前日期和时间

// 指定时间：字符串
var date1 = new Date('2023-01-01')
console.log(date1)

// 指定时间：年、月、日、时、分、秒
var date2 = new Date(2023, 0, 1, 10, 30, 0) // 注意：月份从 0 开始
console.log(date2)

// 指定时间：时间戳（毫秒）
var date3 = new Date(1672531200000)
```

> [!NOTE]
> Date 的月份从 0 开始（0=一月，11=十二月）。

### 4.2 获取日期信息

```javascript
var date = new Date(2023, 5, 15, 10, 30, 45)

console.log(date.getFullYear())  // 2023
console.log(date.getMonth())     // 5（六月）
console.log(date.getDate())      // 15
console.log(date.getDay())       // 4（周几，0=周日）
console.log(date.getHours())     // 10
console.log(date.getMinutes())   // 30
console.log(date.getSeconds())   // 45
console.log(date.getTime())      // 时间戳（毫秒）
```

### 4.3 设置日期信息

```javascript
var date = new Date()

date.setFullYear(2024)
date.setMonth(11)      // 十二月
date.setDate(25)
date.setHours(8)
date.setMinutes(0)
date.setSeconds(0)

console.log(date)
```

### 4.4 日期格式化

```javascript
var now = new Date()

// 转换为字符串
console.log(now.toString())       // "Mon Aug 06 2026 14:30:00 GMT+0800"
console.log(now.toLocaleString()) // "2026/8/6 14:30:00"（本地格式）
console.log(now.toLocaleDateString()) // "2026/8/6"
console.log(now.toLocaleTimeString()) // "14:30:00"

// 自定义格式化函数
function formatDate(date) {
  var year = date.getFullYear()
  var month = (date.getMonth() + 1).toString().padStart(2, '0')
  var day = date.getDate().toString().padStart(2, '0')
  return year + '-' + month + '-' + day
}

console.log(formatDate(new Date())) // "2026-08-06"
```

### 4.5 日期计算

```javascript
var now = new Date()
var future = new Date(2026, 11, 31)

// 时间戳计算（毫秒）
var diff = future.getTime() - now.getTime()
var daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24))
console.log('距离年底还有 ' + daysLeft + ' 天')
```

---

## 自测问题

<details>
<summary>1. 什么是包装类型？为什么基本类型可以调用方法？</summary>

**答案**：当访问基本类型的方法或属性时，JavaScript 会临时创建对应的包装类型对象（String/Number/Boolean），操作完成后立即销毁。这就是基本类型可以调用方法的原因。
</details>

<details>
<summary>2. `Math.floor()`、`Math.ceil()`、`Math.round()` 的区别？</summary>

**答案**：floor 向下取整（3.7→3），ceil 向上取整（3.2→4），round 四舍五入（3.5→4）。
</details>

<details>
<summary>3. 如何生成 [1, 100] 之间的随机整数？</summary>

**答案**：`Math.floor(Math.random() * 100) + 1`
</details>

<details>
<summary>4. Date 对象的月份从几开始？</summary>

**答案**：从 0 开始，0 表示一月，11 表示十二月。
</details>

<details>
<summary>5. 获取当前时间戳的两种方式？</summary>

**答案**：① `new Date().getTime()`；② `Date.now()`（ES5 新增，更简洁）。
</details>

---

## 参考资源

- 上节课：[[0024-js-array|数组详解]]
- 下节课：[[0026-js-oop|面向对象基础]]