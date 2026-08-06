---
title: 第127课：TypeScript 工具类型
description: Partial、Required、Pick、Omit、Record、ReturnType 等内置工具类型
date: 2026-08-06
tags:
  - TypeScript
  - 工具类型
  - Utility Types
  - 类型安全
  - 类型工具
---

# TypeScript 工具类型

## 学习目标

- 掌握 TypeScript 内置工具类型的用途和用法
- 理解工具类型的实现原理
- 能够组合使用工具类型
- 能够自定义工具类型

---

## 属性修饰工具类型

### Partial

```typescript
interface User {
  name: string;
  age: number;
  email: string;
}

// 所有属性变为可选
type PartialUser = Partial<User>;
// { name?: string; age?: number; email?: string; }

// 实现
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

// 使用场景：更新操作
function updateUser(id: string, changes: Partial<User>) {
  // 只更新传入的字段
}
```

### Required

```typescript
// 所有属性变为必填
type RequiredUser = Required<PartialUser>;
// { name: string; age: number; email: string; }

// 实现
type MyRequired<T> = {
  [P in keyof T]-?: T[P];
};
```

### Readonly

```typescript
// 所有属性变为只读
type ReadonlyUser = Readonly<User>;

// 实现
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

---

## 对象操作工具类型

### Pick

```typescript
interface User {
  name: string;
  age: number;
  email: string;
  address: string;
  phone: string;
}

// 选取指定属性
type UserBasic = Pick<User, 'name' | 'email'>;
// { name: string; email: string; }

// 实现
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 使用场景：API 响应精简
function getUserBasic(): Pick<User, 'name' | 'email'> {
  return { name: 'Alice', email: 'alice@test.com' };
}
```

### Omit

```typescript
// 排除指定属性
type UserWithoutPassword = Omit<User, 'password' | 'token'>;

// 实现
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

// 使用场景
function createUser(data: Omit<User, 'id' | 'createdAt'>) {
  // 不需要 id 和 createdAt
}
```

---

## 组合工具类型

### Record

```typescript
// 构造一个属性类型为 K，值类型为 T 的对象类型
type PageInfo = Record<string, string[]>;
// { [key: string]: string[] }

// 限制 key 的具体值
type Role = 'admin' | 'user' | 'guest';
type Permissions = Record<Role, string[]>;

const permissions: Permissions = {
  admin: ['read', 'write', 'delete'],
  user: ['read', 'write'],
  guest: ['read']
};

// 实现
type MyRecord<K extends keyof any, T> = {
  [P in K]: T;
};
```

### Exclude / Extract

```typescript
// Exclude：从联合类型中排除类型
type T0 = Exclude<'a' | 'b' | 'c', 'a'>;
// 'b' | 'c'

// Extract：从联合类型中提取类型
type T1 = Extract<'a' | 'b' | 'c', 'a' | 'c'>;
// 'a' | 'c'

// 实现
type MyExclude<T, U> = T extends U ? never : T;
type MyExtract<T, U> = T extends U ? T : never;
```

### NonNullable

```typescript
// 排除 null 和 undefined
type T0 = NonNullable<string | number | null | undefined>;
// string | number

type MyNonNullable<T> = T extends null | undefined ? never : T;
```

---

## 函数工具类型

### Parameters / ReturnType

```typescript
// Parameters：获取函数参数类型元组
type Fn = (name: string, age: number) => User;
type FnParams = Parameters<Fn>;
// [name: string, age: number]

// ReturnType：获取函数返回值类型
type FnReturn = ReturnType<Fn>;
// User

// 实现
type MyParameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;

type MyReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any;
```

### ConstructorParameters / InstanceType

```typescript
class MyClass {
  constructor(public name: string, public age: number) {}
}

// 构造函数参数类型
type CtorParams = ConstructorParameters<typeof MyClass>;
// [name: string, age: number]

// 实例类型
type Instance = InstanceType<typeof MyClass>;
// MyClass
```

---

## 字符串工具类型

```typescript
// TypeScript 4.1+ 模版字面量类型

type EventName = 'click' | 'focus' | 'blur';
type HandlerName = `on${Capitalize<EventName>}`;
// 'onClick' | 'onFocus' | 'onBlur'

// Uppercase / Lowercase / Capitalize / Uncapitalize
type Upper = Uppercase<'hello'>;    // 'HELLO'
type Lower = Lowercase<'HELLO'>;    // 'hello'
type Cap = Capitalize<'hello'>;      // 'Hello'
type Uncap = Uncapitalize<'Hello'>;  // 'hello'
```

---

## 组合使用示例

```typescript
// 创建不可变的 API 响应类型
type ApiResponse<T> = {
  readonly data: Readonly<T>;
  readonly status: number;
  readonly message: string;
};

// 创建可选字段的更新模型
type UpdateModel<T> = Partial<Omit<T, 'id' | 'createdAt'>>;

// 创建查询参数类型
type QueryParams<T> = Partial<Record<keyof T, string>>;

// 完整示例
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  createdAt: Date;
}

// 创建产品（不需要 id 和 createdAt）
type CreateProduct = Omit<Product, 'id' | 'createdAt'>;

// 更新产品（所有字段可选，排除 id 和 createdAt）
type UpdateProduct = Partial<Omit<Product, 'id' | 'createdAt'>>;

// 产品列表查询参数
type ProductQuery = Partial<Pick<Product, 'category' | 'name'>> & {
  page?: number;
  pageSize?: number;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
};
```

---

## 自测题

### 问题 1
Pick 和 Omit 的区别是什么？分别适用于什么场景？

<details>
<summary>查看答案</summary>
Pick 从类型中选取指定的属性（白名单），Omit 从类型中排除指定的属性（黑名单）。Pick 适用于：1）API 返回精简字段；2）创建只有部分字段的子类型。Omit 适用于：1）排除敏感字段（密码、token）；2）排除自动生成的字段（id、createdAt）；3）创建更新模型时排除不可修改字段。通常 Omit 更灵活，因为排除少量字段比选取大量字段更简洁。
</details>

### 问题 2
Record 类型的主要用途是什么？

<details>
<summary>查看答案</summary>
Record<K, T> 构造一个对象类型，属性名为 K 类型，属性值为 T 类型。主要用途：1）创建枚举映射：Record<Role, string[]>；2）创建字典：Record<string, User>；3）创建固定键的对象：Record<'prop1' | 'prop2', number>。相比索引签名，Record 可以让 key 类型限制为联合类型，提供更好的类型安全。
</details>

### 问题 3
ReturnType 配合 infer 的实现原理是什么？

<details>
<summary>查看答案</summary>
ReturnType 使用条件类型配合 infer 关键字从函数类型中提取返回值类型。实现：type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any。infer R 声明一个待推断的类型变量，当 T 匹配函数签名时，R 被推断为函数的返回值类型。这是 TypeScript 类型系统模式匹配能力的典型应用，也展示了条件类型的强大之处。
</details>