---
title: 第157课：Webpack 高级配置
description: Webpack 高级配置：多入口、代码分割、懒加载
date: 2026-08-06
tags:
  - Webpack
  - 多入口
  - 代码分割
  - 懒加载
  - 构建工具
---

# Webpack 高级配置

## 学习目标

- 掌握多入口配置
- 掌握代码分割和懒加载
- 理解 SplitChunks 策略

---

## 多入口配置

```javascript
module.exports = {
  entry: {
    main: './src/index.js',
    admin: './src/admin.js',
    vendor: ['react', 'react-dom']
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  }
};
```

---

## 代码分割

```javascript
// SplitChunks 配置
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        common: {
          minChunks: 2,
          priority: -10,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

---

## 懒加载

```javascript
// 使用 import() 语法
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

// Webpack 会自动分割代码
const loadModule = () => {
  import('./module').then(module => {
    module.doSomething();
  });
};
```

---

## 自测题

### 问题 1
Webpack 的 SplitChunks 是如何工作的？

<details>
<summary>查看答案</summary>
SplitChunks 根据配置的规则自动拆分代码到独立的 chunk。chunks: 'all' 同时对同步和异步模块生效。cacheGroups 定义拆分规则：node_modules 中的模块打包到 vendors，被多个入口引用的模块打包到 common。minChunks 指定模块被引用多少次才被拆分。Webpack 会在满足所有条件时创建一个新的 chunk。
</details>

### 问题 2
contenthash 和 hash 的区别是什么？

<details>
<summary>查看答案</summary>
hash：每次构建生成一个唯一的哈希值，所有文件的 hash 相同。contenthash：根据文件内容生成哈希，内容不变则 hash 不变。使用 contenthash 可以实现长效缓存：只有修改过的文件 hash 变化，未修改的文件继续使用缓存。通常 output 文件名使用 contenthash。
</details>