---
title: 第162课：Rollup
description: Rollup 库打包、配置、插件、Tree Shaking
date: 2026-08-06
tags:
  - Rollup
  - 构建工具
  - 库打包
  - Tree Shaking
---

# Rollup

## 学习目标

- 理解 Rollup 的定位
- 掌握 Rollup 的配置
- 掌握 Rollup 插件使用

---

## Rollup 配置

```javascript
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
      exports: 'named'
    },
    {
      file: 'dist/bundle.esm.js',
      format: 'es'
    },
    {
      file: 'dist/bundle.umd.js',
      format: 'umd',
      name: 'MyLibrary'
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    babel({ babelHelpers: 'bundled' }),
    terser()
  ],
  external: ['react', 'lodash']
};
```

---

## 自测题

### 问题 1
Rollup 和 Webpack 的定位有什么区别？

<details>
<summary>查看答案</summary>
Rollup 专注于库打包（library bundler），生成更干净的输出代码（ES Module、CommonJS、UMD），Tree Shaking 更彻底。Webpack 专注于应用打包（application bundler），功能更全面（代码分割、HMR、资源处理等）。开发库时推荐 Rollup，开发应用时推荐 Webpack（或 Vite）。
</details>

### 问题 2
Rollup 的 output.format 有哪些选项？

<details>
<summary>查看答案</summary>
es：ES Module 格式，import/export 语法；cjs：CommonJS 格式，require/module.exports；umd：通用模块定义，兼容 AMD、CommonJS 和全局变量；iife：立即执行函数，适合浏览器直接引用；amd：异步模块定义。库打包通常同时提供 es 和 cjs 格式。
</details>