---
title: 第123课：TS 基础类型
description: TypeScript 类型注解、数组、元组、枚举、any、void、never、联合类型
date: 2026-08-06
tags:
  - TypeScript
  - 类型注解
  - 枚举
  - 元组
  - 联合类型
---

# TS 基础类型

## 学习目标

- 掌握 TypeScript 的基础类型系统
- 掌握类型注解和类型推导
- 理解枚举、元组、联合类型等高级类型
- 掌握类型断言和类型守卫

---

## 类型注解

```typescript
// 基础类型注解
let name: string = 'Alice';
let age: number = 25;
let isActive: boolean = true;
let id: number | string = 'abc123';  // 联合类型

// 类型推导
let message = 'Hello';  // 自动推导为 string 类型
let count = 42;         // number
let flag = true;        // boolean
```

### 基本数据类型

```typescript
// string
let str1: string = 'Hello';
let str2: string = `Template ${str1}`;
let str3: string = new String('Hello').toString();

// number
let int: number = 42;
let float: number = 3.14;
let hex: number = 0xff;
let binary: number = 0b1010;
let octal: number = 0o744;
let big: bigint = 100n;

// boolean
let bool: boolean = true;
let falsy: boolean = Boolean(0);

// null 和 undefined
let n: null = null;
let u: undefined = undefined;
```

---

## Array 和 Tuple

### 数组

```typescript
// 两种声明方式
let arr1: number[] = [1, 2, 3];
let arr2: Array<string> = ['a', 'b', 'c'];

// 多维数组
let matrix: number[][] = [[1, 2], [3, 4]];
let cube: number[][][] = [[[1]]];

// 联合类型数组
let mixed: (number | string)[] = [1, 'two', 3];

// 只读数组
let readonlyArr: readonly number[] = [1, 2, 3];
let immutableArr: ReadonlyArray<string> = ['a', 'b'];

// 元组数组
let tupleArr: [string, number][] = [
  ['Alice', 25],
  ['Bob', 30]
];
```

### 元组

```typescript
// 元组：固定长度和类型的数组
let tuple: [string, number, boolean] = ['Alice', 25, true];

// 可选元素
let optionalTuple: [string, number?] = ['Alice'];
optionalTuple = ['Bob', 30];

// 剩余元素
let restTuple: [string, ...number[]] = ['Alice', 1, 2, 3];

// 命名元组 (TypeScript 4.0+)
type Point = [x: number, y: number, z?: number];
function createPoint(x: number, y: number): Point {
  return [x, y];
}

// 元组解构
const [name, age, isActive] = tuple;
```

---

## Enum

### 数字枚举

```typescript
// 默认从 0 开始
enum Direction {
  Up,      // 0
  Down,    // 1
  Left,    // 2
  Right    // 3
}

// 自定义起始值
enum StatusCode {
  Success = 200,
  NotFound = 404,
  ServerError = 500
}

// 反向映射
console.log(Direction[0]);  // 'Up'
console.log(Direction.Up);  // 0
```

### 字符串枚举

```typescript
enum Colors {
  Red = '#FF0000',
  Green = '#00FF00',
  Blue = '#0000FF'
}

// 混合枚举（不推荐）
enum Mixed {
  Yes = 'YES',
  No = 0
}
```

### 常量枚举

```typescript
// 常量枚举会在编译时内联，不会生成反向映射
const enum Size {
  Small = 'S',
  Medium = 'M',
  Large = 'L'
}

let mySize = Size.Medium;  // 编译后直接替换为 'M'
```

---

## any、unknown、void、never

### any

```typescript
// any：跳过类型检查
let value: any = 42;
value = 'Hello';
value = true;
value.doSomething();  // 编译时不会报错

// 不推荐使用 any，它会失去 TypeScript 的类型保护
```

### unknown

```typescript
// unknown：类型安全的 any
let value: unknown = 42;

// 不能直接操作，需要类型收窄
if (typeof value === 'string') {
  console.log(value.toUpperCase());
}

if (typeof value === 'number') {
  console.log(value.toFixed(2));
}
```

### void

```typescript
// void：表示没有返回值
function log(message: string): void {
  console.log(message);
  // 可以不写 return
}

// void 类型的变量只能赋值为 undefined 或 null
let unusable: void = undefined;
```

### never

```typescript
// never：永远不会发生的值
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {
    // 无限循环
  }
}

// never 在 exhaustive check 中的使用
type Shape = Circle | Square;
function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.side ** 2;
    default:
      // 当所有类型都被处理时，这里不会执行
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}
```

---

## 类型守卫

```typescript
// typeof 守卫
function process(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}

// instanceof 守卫
class Dog { bark() {} }
class Cat { meow() {} }

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark();
  } else {
    animal.meow();
  }
}

// in 守卫
interface Bird { fly(): void }
interface Fish { swim(): void }

function move(animal: Bird | Fish) {
  if ('fly' in animal) {
    animal.fly();
  } else {
    animal.swim();
  }
}
```

---

## 自测题

### 问题 1
any 和 unknown 的区别是什么？

<details>
<summary>查看答案</summary>
any 完全跳过类型检查，可以对 any 类型变量执行任何操作（调用方法、访问属性），无法获得类型保护。unknown 是类型安全的 any，不能直接对 unknown 类型变量执行任何操作，必须通过类型收窄（typeof、instanceof、类型断言等）才能使用。推荐在不确定类型时使用 unknown 而非 any。
</details>

### 问题 2
枚举（enum）和联合类型（union type）各自的适用场景？

<details>
<summary>查看答案</summary>
枚举适合：定义一组命名常量（状态码、方向、颜色），有反向映射需求，需要运行时存在。联合类型适合：组合少量明确的值，类型简单且不需要运行时值，API 返回值类型。TypeScript 团队更推荐优先使用联合类型，因为枚举有额外的运行时开销，而联合类型只在编译时存在。
</details>

### 问题 3
never 类型的实际用途是什么？

<details>
<summary>查看答案</summary>
never 的实用场景：1）总是抛出异常的函数返回值；2）无限循环的函数返回值；3）exhaustive check（穷举检查）：在 switch 语句的 default 分支中，将变量赋值为 never 类型，如果未来添加了新的联合类型成员但忘记处理，TypeScript 会报错，从而保证所有情况都被处理。这是类型安全的重要实践。
</details>