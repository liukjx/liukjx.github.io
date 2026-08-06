---
title: 第126课：TypeScript 泛型
description: 泛型函数、泛型接口、泛型类、泛型约束、条件类型
date: 2026-08-06
tags:
  - TypeScript
  - 泛型
  - 泛型约束
  - 条件类型
  - 类型安全
---

# TypeScript 泛型

## 学习目标

- 掌握泛型函数和泛型接口的声明
- 掌握泛型约束（extends）
- 理解条件类型
- 掌握 infer 关键字

---

## 泛型基础

泛型允许在定义函数、接口或类时不指定具体类型，而在使用时才指定：

```typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg;
}

// 使用类型参数
const result1 = identity<string>('Hello');
const result2 = identity(42);  // 类型推断
```

### 多个类型参数

```typescript
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const p1 = pair<string, number>('age', 25);
const p2 = pair('name', 'Alice');
```

---

## 泛型接口

```typescript
// 泛型接口
interface Repository<T> {
  getById(id: string): Promise<T | null>;
  getAll(): Promise<T[]>;
  create(item: T): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

// 实现泛型接口
class UserRepository implements Repository<User> {
  async getById(id: string): Promise<User | null> {
    // 实现
    return null;
  }
  async getAll(): Promise<User[]> {
    return [];
  }
  // ...
}

// 泛型接口函数类型
interface Transformer<T, U> {
  (input: T): U;
}

const toString: Transformer<number, string> = (n) => n.toString();
```

---

## 泛型约束

```typescript
// 基本约束
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength('Hello');      // string 有 length
logLength([1, 2, 3]);   // array 有 length
// logLength(123);       // Error: number 没有 length

// keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'Alice', age: 25, email: 'alice@test.com' };
getProperty(user, 'name');  // string
getProperty(user, 'age');   // number
// getProperty(user, 'invalid');  // Error

// 类型参数之间的约束
function copyFields<T extends U, U>(target: T, source: U): T {
  Object.assign(target, source);
  return target;
}
```

---

## 条件类型

```typescript
// 基础条件类型
type IsString<T> = T extends string ? true : false;
type A = IsString<'hello'>;  // true
type B = IsString<42>;       // false

// 分布式条件类型
type ToArray<T> = T extends any ? T[] : never;
type StrNumArr = ToArray<string | number>;  // string[] | number[]

// 过滤类型
type FilterString<T> = T extends string ? never : T;
type WithoutStrings = FilterString<string | number | boolean>;  // number | boolean

// infer 关键字
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type Fn = (x: number) => string;
type FnReturn = ReturnType<Fn>;  // string

// 数组元素类型
type ArrayItem<T> = T extends (infer U)[] ? U : never;
type Item = ArrayItem<string[]>;  // string

// Promise 类型
type Unwrap<T> = T extends Promise<infer U> ? U : T;
type Result = Unwrap<Promise<string>>;  // string
```

---

## 内置工具类型实现

```typescript
// Partial 的实现
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

// Required 的实现
type MyRequired<T> = {
  [P in keyof T]-?: T[P];
};

// Readonly 的实现
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Pick 的实现
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Record 的实现
type MyRecord<K extends keyof any, T> = {
  [P in K]: T;
};
```

---

## 自测题

### 问题 1
泛型约束中的 extends 关键字有什么作用？

<details>
<summary>查看答案</summary>
extends 关键字在泛型约束中用于限制类型参数的范围。例如 <T extends HasLength> 表示 T 必须具有 length 属性。extends 还用于条件类型中，如 T extends U ? X : Y，表示如果 T 可赋值给 U 则类型为 X 否则为 Y。keyof T 配合 extends 可以限制类型参数为对象的属性名集合。
</details>

### 问题 2
条件类型中的 infer 关键字有什么用途？

<details>
<summary>查看答案</summary>
infer 用于在条件类型中声明一个待推断的类型变量。它只能在条件类型的 extends 子句中使用。常见用途：1）提取函数的返回值类型（ReturnType）；2）提取 Promise 的泛型参数类型（Unwrap）；3）提取数组元素类型；4）提取构造函数参数类型（ConstructorParameters）。infer 让 TypeScript 的类型系统具备了模式匹配能力。
</details>

### 问题 3
分布式条件类型（Distributive Conditional Types）是什么？

<details>
<summary>查看答案</summary>
当条件类型作用于一个裸类型参数（naked type parameter）时，它会被自动分配（distribute）到联合类型的每个成员。例如 type ToArray<T> = T extends any ? T[] : never，当 T = string | number 时，结果会被拆解为 string[] | number[]。如果想要避免分布式行为，可以用方括号包裹类型参数：[T] extends [any]。
</details>