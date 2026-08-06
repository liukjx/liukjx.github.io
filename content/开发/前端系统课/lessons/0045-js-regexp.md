---
title: "第45课：正则表达式"
description: "正则表达式创建方式、修饰符、元字符、字符类、分组捕获、贪婪模式、前瞻断言"
date: 2026-08-06
tags:
  - JavaScript
  - 正则表达式
  - RegExp
  - 字符串匹配
---

# 第45课：正则表达式

> [!NOTE]
> 学习目标：掌握 JavaScript 中正则表达式的创建和常用方法，理解元字符、字符类、分组、量词等核心概念，能够使用正则解决常见字符串匹配问题。

---

## 一、创建正则表达式

### 1.1 两种创建方式

```js
// 方式一：字面量（推荐，性能更好）
const regex1 = /hello/

// 方式二：构造函数（适用于动态模式）
const pattern = 'hello'
const regex2 = new RegExp(pattern, 'gi')
```

---

## 二、修饰符

| 修饰符 | 含义 | 说明 |
|--------|------|------|
| `g` | global | 全局匹配（查找所有匹配而非找到第一个就停） |
| `i` | ignore case | 忽略大小写 |
| `m` | multiline | 多行模式（`^` 和 `$` 匹配每行的开头和结尾） |
| `s` | dotAll | 点号匹配所有字符（包括换行符） |
| `u` | unicode | 正确处理 Unicode 字符 |
| `y` | sticky | 粘性匹配（从 lastIndex 位置开始匹配） |

```js
const str = 'Hello HELLO hello'

// 不加 g：只匹配第一个
console.log(str.match(/hello/i)) // ["Hello"]

// 加 g：匹配所有
console.log(str.match(/hello/gi)) // ["Hello", "HELLO", "hello"]

// 多行模式
const multiline = 'Line 1\nLine 2\nLine 3'
console.log(multiline.match(/^\w+/gm)) // ["Line", "Line", "Line"]
```

---

## 三、常用方法

### 3.1 正则实例方法

```js
const regex = /\d+/g
const str = '12 apples, 34 oranges'

// exec —— 逐条匹配（配合 g 修饰符使用）
let match
while ((match = regex.exec(str)) !== null) {
  console.log(`找到: ${match[0]}, 位置: ${match.index}`)
}
// 找到: 12, 位置: 0
// 找到: 34, 位置: 11

// test —— 是否匹配（返回布尔值）
console.log(/\d/.test('abc123')) // true
console.log(/\d/.test('abc'))    // false
```

### 3.2 字符串方法

```js
const str = 'Hello 123 World 456'

// match —— 匹配结果数组
console.log(str.match(/\d+/g))   // ["123", "456"]

// matchAll —— 返回迭代器（ES10）
const matches = str.matchAll(/(\d+)/g)
for (const m of matches) {
  console.log(m[0]) // 123, 456
}

// search —— 返回匹配位置（类似 indexOf）
console.log(str.search(/\d+/)) // 6

// replace —— 替换
console.log(str.replace(/\d+/g, '***')) // "Hello *** World ***"

// replaceAll —— 全部替换（ES12）
console.log('hello hello'.replaceAll('hello', 'hi')) // "hi hi"

// split —— 分割
console.log('a,b,c'.split(/,/)) // ["a", "b", "c"]
```

---

## 四、元字符和字符类

### 4.1 基本元字符

| 元字符 | 含义 |
|--------|------|
| `.` | 匹配除换行符外的任意字符（s 修饰符下也匹配换行符） |
| `\d` | 匹配数字（等价于 `[0-9]`） |
| `\D` | 匹配非数字 |
| `\w` | 匹配字母、数字、下划线（等价于 `[a-zA-Z0-9_]`） |
| `\W` | 匹配非单词字符 |
| `\s` | 匹配空白字符（空格、制表符 `\t`、换行符 `\n` 等） |
| `\S` | 匹配非空白字符 |

```js
// . 匹配任意字符
console.log(/h.t/.test('hat'))    // true
console.log(/h.t/.test('h\nt'))   // false（默认不匹配换行符）

// s 修饰符让 . 匹配换行符
console.log(/h.t/s.test('h\nt'))  // true

// 手机号验证
console.log(/\d{11}/.test('13800138000')) // true
```

### 4.2 字符集合

```js
// [abc] —— 匹配 a 或 b 或 c
console.log(/[aeiou]/.test('hello')) // true（匹配到 e）

// [a-z] —— 范围
console.log(/[0-9]/.test('abc'))     // false

// [^abc] —— 排除（取反）
console.log(/[^0-9]/.test('123'))    // false（纯数字不匹配）
console.log(/[^0-9]/.test('a123'))   // true（有非数字字符）
```

### 4.3 边界匹配

```js
// ^ —— 开头
console.log(/^Hello/.test('Hello World')) // true

// $ —— 结尾
console.log(/World$/.test('Hello World')) // true

// 精确匹配
console.log(/^Hello World$/.test('Hello World')) // true

// \b —— 单词边界
console.log(/\bword\b/.test('a word b'))   // true
console.log(/\bword\b/.test('swordsman'))  // false（word 不是独立单词）
```

---

## 五、量词

| 量词 | 含义 |
|-------|------|
| `*` | 0 次或多次 |
| `+` | 1 次或多次 |
| `?` | 0 次或 1 次 |
| `{n}` | 恰好 n 次 |
| `{n,}` | 至少 n 次 |
| `{n,m}` | n 到 m 次 |

```js
// 基本使用
console.log(/\d*/.exec('abc'))       // ['']（0 个数字也可以匹配）
console.log(/\d+/.exec('abc'))       // null（至少需要 1 个数字）
console.log(/\d?/.exec('abc'))       // ['']（0 个数字）

// 手机号验证（1 开头的 11 位数字）
console.log(/^1[3-9]\d{9}$/.test('13800138000')) // true
console.log(/^1[3-9]\d{9}$/.test('12345678901')) // false（第二位是 2，不在 3-9 范围）

// 邮箱验证（简版）
console.log(/^[\w.-]+@[\w.-]+\.\w+$/.test('test@example.com')) // true
```

---

## 六、分组和捕获

### 6.1 捕获组

```js
const regex = /(\d{4})-(\d{2})-(\d{2})/
const result = regex.exec('2023-12-25')
console.log(result[0])  // "2023-12-25"（完整匹配）
console.log(result[1])  // "2023"（年）
console.log(result[2])  // "12"（月）
console.log(result[3])  // "25"（日）

// 命名捕获组（ES9）
const regex2 = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/
const result2 = regex2.exec('2023-12-25')
console.log(result2.groups.year)  // "2023"
console.log(result2.groups.month) // "12"
```

### 6.2 非捕获组

```js
// (?:...) —— 只分组不捕获（不占用内存）
const regex = /(?:https?):\/\/(\w+\.\w+)/
const result = regex.exec('https://example.com')
console.log(result[1]) // "example.com"（https 组未被捕获）
```

### 6.3 反向引用

```js
// \1 引用第一个捕获组
console.log(/(\w+)\s+\1/.test('hello hello')) // true（重复单词）
console.log(/(\w+)\s+\1/.test('hello world')) // false

// HTML 标签匹配
console.log(/<(\w+)>.*<\/\1>/.test('<div>content</div>')) // true
```

---

## 七、贪婪模式与懒惰模式

| 模式 | 写法 | 行为 |
|-------|------|------|
| 贪婪 | `*`, `+`, `{2,5}` | 尽可能多匹配 |
| 懒惰 | `*?`, `+?`, `{2,5}?` | 尽可能少匹配 |

```js
const str = '<div><p>text</p></div>'

// 贪婪模式 —— 匹配最外层
console.log(str.match(/<.+>/))   // ["<div><p>text</p></div>"]

// 懒惰模式 —— 匹配最小单元
console.log(str.match(/<.+?>/))  // ["<div>"]

// HTML 标签提取
const html = '<h1>Title</h1><p>paragraph</p>'
console.log(html.match(/<[^>]+>/g))
// ["<h1>", "</h1>", "<p>", "</p>"]
```

---

## 八、前瞻断言与后顾断言

| 断言 | 写法 | 含义 |
|-------|------|------|
| 正向前瞻 | `(?=...)` | 后面跟着指定模式 |
| 负向前瞻 | `(?!...)` | 后面不跟着指定模式 |
| 正向后顾 | `(?<=...)` | 前面是指定模式（ES9） |
| 负向后顾 | `(?<!...)` | 前面不是指定模式（ES9） |

```js
// 正向前瞻 —— 匹配后面跟着 "px" 的数字
console.log('width: 100px'.match(/\d+(?=px)/)) // ["100"]

// 负向前瞻 —— 匹配后面不跟 "px" 的数字
console.log('width: 100%'.match(/\d+(?!px)/))  // ["10"]

// 正向后顾 —— 匹配前面是 "$" 的数字（ES9）
console.log('price: $100'.match(/(?<=\$)\d+/)) // ["100"]

// 负向后顾 —— 匹配前面不是 "$" 的数字（ES9）
console.log('price: 100元'.match(/(?<!\$)\d+/)) // ["100"]
```

> [!NOTE]
> 断言只检查位置，不消耗字符。匹配结果中不包含断言匹配的部分。

---

## 九、实战案例

### 9.1 歌词时间解析

```js
const lrc = `
[00:00.00] 作词：林夕
[00:04.50] 作曲：陈辉阳
[00:08.00] 十年 - 陈奕迅
[00:23.20] 如果那两个字没有颤抖
[00:28.80] 我不会发现我难受
[00:34.60] 怎么说出口
[00:40.00] 也不过是分手
`

const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2})\]/
const lines = lrc.trim().split('\n')
const parsed = lines.map(line => {
  const match = line.match(timeRegex)
  if (match) {
    const minutes = parseInt(match[1])
    const seconds = parseInt(match[2])
    const centiseconds = parseInt(match[3])
    const time = minutes * 60 + seconds + centiseconds / 100
    const text = line.replace(timeRegex, '').trim()
    return { time, text }
  }
}).filter(Boolean)

console.log(parsed)
```

### 9.2 时间格式化

```js
function formatTime(template, date = new Date()) {
  const replacements = {
    'yyyy': date.getFullYear(),
    'yy': String(date.getFullYear()).slice(-2),
    'MM': String(date.getMonth() + 1).padStart(2, '0'),
    'dd': String(date.getDate()).padStart(2, '0'),
    'HH': String(date.getHours()).padStart(2, '0'),
    'mm': String(date.getMinutes()).padStart(2, '0'),
    'ss': String(date.getSeconds()).padStart(2, '0')
  }

  return template.replace(/\w+/g, match => {
    return replacements[match] || match
  })
}

console.log(formatTime('yyyy-MM-dd HH:mm:ss'))
// 例如: "2026-08-06 14:30:00"
```

### 9.3 书籍信息提取

```js
const bookText = `1. 深入理解JavaScript —— $39.00
2. JavaScript高级程序设计 —— $45.00
3. 你不知道的JavaScript —— $29.00`

const bookRegex = /^\d+\.\s(.+?)\s——\s\$(\d+\.\d{2})/gm
let bookMatch
while ((bookMatch = bookRegex.exec(bookText)) !== null) {
  console.log(`书名: ${bookMatch[1]}, 价格: $${bookMatch[2]}`)
}
```

---

## 十、正则表达式速查表

| 模式 | 含义 | 匹配示例 |
|------|------|---------|
| `/^\d+$/` | 纯数字 | "123" |
| `/^1[3-9]\d{9}$/` | 手机号 | "13800138000" |
| `/^[\w.-]+@[\w.-]+\.\w+$/` | 邮箱（简版） | "a@b.com" |
| `/(https?):\/\/[\w./?=&-]+/` | URL | "https://example.com" |
| `/^[1-9]\d{5}(18\|19\|20)?\d{2}(0[1-9]\|1[0-2])(0[1-9]\|[12]\d\|3[01])\d{3}[\dX]$/` | 身份证号 | 18 位 |
| `/^[\u4e00-\u9fa5]+$/` | 纯中文 | "你好" |
| `/(?<=@)\w+\.\w+/` | 提取邮箱域名 | "admin@example.com" -> "example.com" |

---

## 自测问题

<details>
<summary>1. 什么是捕获组和非捕获组？如何命名捕获组？</summary>

捕获组用 `()` 包裹，匹配的内容存储在内存中，可通过 `\1`（正则中）、`$1`（替换时）、`match[1]`（JS 中）引用。非捕获组用 `(?:)` 包裹，只分组不存储。命名捕获组用 `(?<name>...)` 语法（ES9），通过 `match.groups.name` 访问。
</details>

<details>
<summary>2. 贪婪模式和懒惰模式的区别是什么？</summary>

贪婪模式（默认）尽可能多匹配。懒惰模式在量词后加 `?`，尽可能少匹配。例如 `<.+>` 匹配 `<div><p>text</p></div>` 整个字符串，而 `<.+?>` 只匹配 `<div>`。
</details>

<details>
<summary>3. 前瞻断言和后顾断言有什么区别？各有什么语法？</summary>

前瞻断言检查当前位置后面的字符：`(?=...)` 肯定、`(?!...)` 否定。后顾断言检查前面的字符：`(?<=...)` 肯定、`(?<!...)` 否定。断言不消耗字符，只检查位置。
</details>

<details>
<summary>4. 如何使用正则验证手机号和邮箱？</summary>

手机号：`/^1[3-9]\d{9}$/`（1 开头，第二位 3-9，共 11 位）。邮箱（简版）：`/^[\w.-]+@[\w.-]+\.\w+$/`（用户名@域名.后缀）。
</details>

---

> 下一课：[[0046-js-advanced-summary]] —— JS 高级总结