---
title: 第124课：TypeScript 接口
description: interface 定义、可选属性、只读属性、函数接口、索引签名、接口继承
date: 2026-08-06
tags:
  - TypeScript
  - 接口
  - interface
  - 类型
  - 继承
---

# TypeScript 接口

## 学习目标

- 掌握 interface 的声明和使用
- 掌握可选、只读、函数类型接口
- 理解索引签名
- 掌握接口继承

---

## 接口基础

```typescript
// 定义接口
interface User {
  name: string;
  age: number;
  email: string;
}

// 使用接口
function register(user: User): void {
  console.log(`${user.name} registered`);
}

const user: User = {
  name: 'Alice',
  age: 25,
  email: 'alice@example.com'
};
```

---

## 接口属性

### 可选属性和只读属性

```typescript
interface UserProfile {
  readonly id: number;      // 只读，初始化后不能修改
  name: string;
  age?: number;             // 可选属性
  email?: string;
  readonly createdAt: Date; // 只读
}

const profile: UserProfile = {
  id: 1,
  name: 'Alice',
  createdAt: new Date()
};

// profile.id = 2;  // Error: 无法分配到只读属性
profile.name = 'Bob';  // OK
```

### 函数类型接口

```typescript
// 定义函数类型
interface SearchFunc {
  (source: string, subString: string): boolean;
}

const mySearch: SearchFunc = (src, sub) => {
  return src.includes(sub);
};

// 重载函数接口
interface CreateElement {
  (tag: 'div'): HTMLDivElement;
  (tag: 'span'): HTMLSpanElement;
  (tag: string): HTMLElement;
}
```

### 索引签名

```typescript
// 字符串索引签名
interface StringDictionary {
  [key: string]: string;
}

const dict: StringDictionary = {
  name: 'Alice',
  role: 'admin'
};

// 数字索引签名
interface NumberDictionary {
  [index: number]: string;
}

const arr: NumberDictionary = ['a', 'b', 'c'];

// 混合索引签名
interface Dictionary {
  [key: string]: string | number;
  length: number;       // 必须兼容索引签名类型
  name: string;
}
```

---

## 接口继承

```typescript
// 单继承
interface Base {
  id: number;
}

interface User extends Base {
  name: string;
}

// 多继承
interface Timestamp {
  createdAt: Date;
  updatedAt: Date;
}

interface SoftDeletable {
  deletedAt?: Date;
}

interface Entity extends Base, Timestamp, SoftDeletable {
  // 继承所有父接口的属性
}

// 接口继承类
class CreateUserDto {
  name: string;
  age: number;
}

interface UserResponse extends CreateUserDto {
  id: number;
  createdAt: Date;
}
```

### 接口合并

```typescript
// 同名接口自动合并
interface Box {
  height: number;
  width: number;
}

interface Box {
  scale: number;  // 合并后 Box 有 height、width、scale
}

const box: Box = {
  height: 100,
  width: 200,
  scale: 1.5
};
```

---

## interface vs type

```typescript
// interface
interface Point {
  x: number;
  y: number;
}

// type alias
type PointType = {
  x: number;
  y: number;
};

// 区别

// 1. interface 可以合并，type 不能
interface Foo { a: string }
interface Foo { b: number }  // 合并

// 2. type 可以定义联合类型、交叉类型
type StringOrNumber = string | number;
type Container<T> = { value: T };

// 3. interface 只能定义对象类型
// 4. type 支持映射类型
type Readonly<T> = { readonly [P in keyof T]: T[P] };

// 5. interface 优先被考虑（实现/继承语义更清晰）
```

---

## 自测题

### 问题 1
interface 和 type 的核心区别是什么？

<details>
<summary>查看答案</summary>
1）声明合并：interface 可以多次声明自动合并，type 不能重复声明；2）表达能力：type 可以定义联合类型、交叉类型、映射类型等，interface 只能声明对象类型；3）继承方式：interface 使用 extends，type 使用 &；4）使用场景：interface 适合定义对象的形状（特别是公共 API 的类型），type 适合需要类型别名、联合类型、条件类型等场景。官方推荐优先使用 interface。
</details>

### 问题 2
接口中的只读属性（readonly）和 const 有什么区别？

<details>
<summary>查看答案</summary>
readonly 用于接口或类的属性，表示该属性在初始化后不能重新赋值，但引用的对象内部属性仍可修改。const 用于声明常量变量，表示变量引用不能改变。readonly 在编译时检查，const 在运行时也有保护。在对象属性场景下使用 readonly，在变量声明场景下使用 const。
</details>

### 问题 3
索引签名（index signature）的应用场景和注意事项是什么？

<details>
<summary>查看答案</summary>
索引签名用于定义具有动态属性名称的对象类型。应用场景：1）字典/映射对象；2）配置对象；3）从 API 返回的动态键值对。注意事项：1）所有显式声明的属性必须兼容索引签名类型；2）可选的索引签名使用 [key: string]?: type；3）数字索引签名必须从字符串索引签名派生（如果同时存在）；4）使用 Readonly 或 Record 工具类型可替代部分场景的索引签名。
</details>