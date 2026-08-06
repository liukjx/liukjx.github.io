---
title: 第129课：TS 高级专题
description: TypeScript 声明文件、模块系统、命名空间、tsconfig 高级配置
date: 2026-08-06
tags:
  - TypeScript
  - 声明文件
  - 模块
  - 命名空间
  - d.ts
---

# TS 高级专题

## 学习目标

- 掌握声明文件（.d.ts）的编写
- 理解模块系统和解析策略
- 了解命名空间的使用
- 掌握高级配置技巧

---

## 声明文件

### 声明文件的作用

声明文件（.d.ts）为 JavaScript 库提供类型信息，使 TypeScript 可以理解非 TypeScript 代码的类型。

```typescript
// globals.d.ts - 全局变量声明
declare const API_BASE_URL: string;
declare const APP_VERSION: string;

// functions.d.ts - 函数声明
declare function formatDate(date: Date, format?: string): string;
declare function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void;
```

### 模块声明

```typescript
// 第三方库声明
declare module 'my-library' {
  export interface Options {
    timeout?: number;
    retries?: number;
  }

  export function initialize(options?: Options): void;
  export class Client {
    constructor(apiKey: string);
    request<T>(path: string): Promise<T>;
  }
}

// 非 JS 模块声明
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.svg' {
  const content: string;
  export default content;
}
```

### 全局类型扩展

```typescript
// 扩展全局 Window
interface Window {
  __INITIAL_STATE__: Record<string, any>;
  gtag: (command: string, ...args: any[]) => void;
}

// 扩展 Array
interface Array<T> {
  // 确保不与已有方法冲突
  removeFirst(predicate: (item: T) => boolean): T | undefined;
}

// 使用声明合并扩展第三方库
import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    showLoading?: boolean;
    showError?: boolean;
  }
}
```

---

## 模块系统

### ES Modules vs CommonJS

```typescript
// ES Module 语法
import { something } from './module';
export { something };

// CommonJS 模块声明
declare module 'commonjs-module' {
  export = {
    method1(): void;
    method2(): string;
  };
}

// 混合模块
import moment from 'moment';
// 配置：esModuleInterop: true 允许默认导入 CommonJS 模块
```

### 模块解析策略

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    // "node"     - Node.js 风格解析
    // "classic"  - TypeScript 旧风格
    // "bundler"  - 打包工具风格（Vite、Webpack）

    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    },

    "rootDirs": ["src", "generated"]
  }
}
```

---

## 命名空间

```typescript
// 命名空间（旧称内部模块）
namespace Validation {
  export interface StringValidator {
    isValid(s: string): boolean;
  }

  const lettersRegexp = /^[A-Za-z]+$/;
  const numberRegexp = /^[0-9]+$/;

  export class LettersOnlyValidator implements StringValidator {
    isValid(s: string): boolean {
      return lettersRegexp.test(s);
    }
  }

  export class ZipCodeValidator implements StringValidator {
    isValid(s: string): boolean {
      return s.length === 5 && numberRegexp.test(s);
    }
  }
}

// 使用
const validators: Validation.StringValidator[] = [
  new Validation.LettersOnlyValidator(),
  new Validation.ZipCodeValidator()
];
```

---

## 三斜线指令

```typescript
/// <reference path="./types.d.ts" />
/// <reference types="node" />
/// <reference lib="es2017.string" />

// path: 引用其他文件
// types: 引用 @types 包
// lib: 引用内置类型库
```

---

## 自测题

### 问题 1
声明文件（.d.ts）中 declare 关键字的作用是什么？

<details>
<summary>查看答案</summary>
declare 关键字告诉 TypeScript 编译器某个变量、函数、类或模块存在，但不需要提供具体实现。它只用于类型声明，不会生成任何 JavaScript 代码。在编写声明文件时，declare 是核心关键字，用于描述 JavaScript 库的公共 API 的类型信息。
</details>

### 问题 2
模块解析策略中的 paths 配置有什么作用？

<details>
<summary>查看答案</summary>
paths 配置用于创建模块路径的别名映射。配合 baseUrl 使用，可以将复杂的相对路径映射为简洁的别名路径。例如 "@/*" 映射到 "src/*"，这样 import User from '@/models/User' 比 import User from '../../../models/User' 更简洁。paths 需要在构建工具（Webpack/Vite）中配置同名解析规则才能同时保证编译和运行时正确。
</details>

### 问题 3
命名空间（namespace）和 ES Module 在 TypeScript 中分别适用于什么场景？

<details>
<summary>查看答案</summary>
ES Module 是推荐的方式，适用于大多数现代 TypeScript 项目，有良好的 Tree Shaking、作用域隔离和依赖管理。命名空间是 TypeScript 早期提供的模块化方案，主要用于：1）旧项目的迁移过渡；2）全局脚本（没有使用模块加载器）；3）声明文件中组织类型。新项目中应优先使用 ES Module。
</details>