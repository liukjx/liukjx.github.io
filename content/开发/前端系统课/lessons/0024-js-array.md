---
title: 第24课：数组详解
description: 'JavaScript 数组的创建、索引、常用方法、遍历、排序、过滤和展开运算'
date: 2026-08-06
tags:
  - javascript
  - course
  - basics
---

# 第24课：数组详解

## 学习目标

- 掌握数组的创建和基本操作
- 掌握数组的增删改查方法
- 理解数组的遍历方式
- 掌握数组的排序和过滤
- 了解展开运算符的使用

---

## 一. 认识数组

数组是 JavaScript 中用于存储有序集合的引用数据类型。

```javascript
// 数组的特点：
// 1. 有序存储
// 2. 可以存放任意类型的数据
// 3. 长度动态变化
```

---

## 二. 创建数组

```javascript
// 方式一：字面量（推荐）
var arr1 = [1, 2, 3, 4, 5]
var arr2 = ['张三', '李四', '王五']
var arr3 = [1, 'hello', true, null, { name: '对象' }] // 混合类型

// 方式二：new Array()
var arr4 = new Array(1, 2, 3)     // [1, 2, 3]
var arr5 = new Array(5)           // 注意：创建长度为 5 的空数组
```

---

## 三. 数组的索引和长度

```javascript
var arr = ['a', 'b', 'c', 'd', 'e']

// 获取元素（索引从 0 开始）
console.log(arr[0])  // "a"
console.log(arr[2])  // "c"
console.log(arr[4])  // "e"

// 修改元素
arr[0] = 'A'
console.log(arr)     // ["A", "b", "c", "d", "e"]

// 获取数组长度
console.log(arr.length) // 5

// 最后一个元素的索引
console.log(arr[arr.length - 1]) // "e"

// 追加元素
arr[arr.length] = 'f'
console.log(arr)     // ["A", "b", "c", "d", "e", "f"]
```

---

## 四. 数组的常用方法

### 4.1 增删操作

```javascript
var arr = ['a', 'b', 'c']

// push：在末尾添加（返回新长度）
console.log(arr.push('d', 'e')) // 5
console.log(arr)                // ["a", "b", "c", "d", "e"]

// pop：删除末尾（返回删除的元素）
console.log(arr.pop())          // "e"
console.log(arr)                // ["a", "b", "c", "d"]

// unshift：在开头添加（返回新长度）
console.log(arr.unshift('x'))   // 5
console.log(arr)                // ["x", "a", "b", "c", "d"]

// shift：删除开头（返回删除的元素）
console.log(arr.shift())        // "x"
console.log(arr)                // ["a", "b", "c", "d"]
```

### 4.2 splice：万能方法

```javascript
var arr = ['a', 'b', 'c', 'd', 'e']

// 删除：splice(起始索引, 删除数量)
var deleted = arr.splice(1, 2)   // 从索引1开始删2个
console.log(deleted)             // ["b", "c"]
console.log(arr)                 // ["a", "d", "e"]

// 插入：splice(起始索引, 0, 要插入的元素)
arr.splice(1, 0, 'x', 'y')
console.log(arr)                 // ["a", "x", "y", "d", "e"]

// 替换：splice(起始索引, 删除数量, 要插入的元素)
arr.splice(1, 2, 'm', 'n')
console.log(arr)                 // ["a", "m", "n", "d", "e"]
```

### 4.3 查找和判断

```javascript
var arr = [10, 20, 30, 40, 30]

// indexOf：查找元素索引（从左到右）
console.log(arr.indexOf(30))     // 2
console.log(arr.indexOf(100))    // -1（找不到返回-1）

// lastIndexOf：查找元素索引（从右到左）
console.log(arr.lastIndexOf(30)) // 4

// includes：判断是否包含
console.log(arr.includes(20))    // true
console.log(arr.includes(100))   // false
```

### 4.4 其他常用方法

```javascript
var arr = [3, 1, 4, 1, 5, 9, 2, 6]

// concat：合并数组（不修改原数组）
var arr2 = arr.concat([7, 8])
console.log(arr2)                // [3, 1, 4, 1, 5, 9, 2, 6, 7, 8]

// join：用指定连接符转换为字符串
console.log(arr.join('-'))       // "3-1-4-1-5-9-2-6"

// reverse：反转数组（修改原数组）
arr.reverse()
console.log(arr)                 // [6, 2, 9, 5, 1, 4, 1, 3]

// slice：截取子数组（不修改原数组）
var sub = arr.slice(1, 4)
console.log(sub)                 // [2, 9, 5]
```

---

## 五. 数组的排序

```javascript
var arr = [3, 15, 1, 8, 22]

// sort()：默认按字符串排序，结果可能不符合预期
arr.sort()
console.log(arr) // [1, 15, 22, 3, 8]（字符串排序）

// 自定义排序规则
arr.sort(function(a, b) {
  return a - b  // 升序
})
console.log(arr) // [1, 3, 8, 15, 22]

// 降序
arr.sort(function(a, b) {
  return b - a
})
console.log(arr) // [22, 15, 8, 3, 1]
```

> [!WARNING]
> `sort()` 默认按字符串 Unicode 编码排序，对数字排序时必须传入比较函数。

---

## 六. 数组的遍历

### 6.1 for 循环遍历

```javascript
var arr = ['a', 'b', 'c', 'd', 'e']

for (var i = 0; i < arr.length; i++) {
  console.log(i, arr[i])
}
// 0 "a"
// 1 "b"
// 2 "c"
// 3 "d"
// 4 "e"
```

### 6.2 for...in 循环

```javascript
for (var index in arr) {
  console.log(index, arr[index])
}
```

### 6.3 forEach 方法

```javascript
arr.forEach(function(item, index, array) {
  console.log(index, item)
})
```

---

## 七. 数组的过滤和映射

### 7.1 filter：过滤

```javascript
var numbers = [1, 2, 3, 4, 5, 6]

// 过滤出所有偶数
var evens = numbers.filter(function(num) {
  return num % 2 === 0
})
console.log(evens) // [2, 4, 6]
```

### 7.2 map：映射

```javascript
var numbers = [1, 2, 3, 4, 5]

// 每个元素乘以 2
var doubled = numbers.map(function(num) {
  return num * 2
})
console.log(doubled) // [2, 4, 6, 8, 10]

// 提取对象中的某个属性
var persons = [
  { name: '张三', age: 18 },
  { name: '李四', age: 20 },
  { name: '王五', age: 22 }
]
var names = persons.map(function(person) {
  return person.name
})
console.log(names) // ["张三", "李四", "王五"]
```

### 7.3 reduce：归约

```javascript
var numbers = [1, 2, 3, 4, 5]

// 求和
var sum = numbers.reduce(function(prev, current) {
  return prev + current
}, 0)
console.log(sum) // 15
```

---

## 八. 展开运算符（ES6）

```javascript
// 合并数组
var arr1 = [1, 2, 3]
var arr2 = [4, 5, 6]
var merged = [...arr1, ...arr2]
console.log(merged) // [1, 2, 3, 4, 5, 6]

// 复制数组（浅拷贝）
var copy = [...arr1]
console.log(copy) // [1, 2, 3]

// 在函数参数中使用
function sum(a, b, c) {
  return a + b + c
}
var numbers = [1, 2, 3]
console.log(sum(...numbers)) // 6
```

---

## 自测问题

<details>
<summary>1. `push`、`pop`、`unshift`、`shift` 的区别是什么？</summary>

**答案**：push 在末尾添加，pop 删除末尾，unshift 在开头添加，shift 删除开头。push/unshift 返回新长度，pop/shift 返回被删除的元素。
</details>

<details>
<summary>2. splice 方法有哪三种用法？</summary>

**答案**：① `splice(start, deleteCount)` 删除；② `splice(start, 0, items)` 插入；③ `splice(start, deleteCount, items)` 替换。
</details>

<details>
<summary>3. `indexOf` 和 `includes` 的区别？</summary>

**答案**：indexOf 返回元素的索引（找不到返回 -1），includes 返回布尔值（true/false）。
</details>

<details>
<summary>4. `sort()` 为什么需要对数字传入比较函数？</summary>

**答案**：sort() 默认按字符串 Unicode 编码排序，所以 `[3, 15, 1, 8, 22]` 排序后是 `[1, 15, 22, 3, 8]`。需要传入 `function(a, b) { return a - b }` 来实现正确的数字排序。
</details>

<details>
<summary>5. `map` 和 `filter` 的区别是什么？</summary>

**答案**：map 对每个元素执行操作并返回新数组（长度与原数组相同）；filter 根据条件过滤元素（返回的新数组长度可能小于原数组）。
</details>

---

## 参考资源

- 上节课：[[0023-js-objects|对象基础]]
- 下节课：[[0025-js-string-math-date|字符串和 Math/Date]]