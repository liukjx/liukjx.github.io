---
title: 第158课：Webpack 优化
description: Webpack 构建优化、压缩、缓存、Tree Shaking
date: 2026-08-06
tags:
  - Webpack
  - 性能优化
  - Tree Shaking
  - 缓存
  - 压缩
---

# Webpack 优化

## 学习目标

- 掌握 Webpack 构建性能优化
- 掌握 Tree Shaking 原理
- 掌握缓存策略

---

## 构建优化

```javascript
const path = require('path');

module.exports = {
  // 1. 缩小文件搜索范围
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },

  // 2. 使用 thread-loader 多线程构建
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: ['thread-loader', 'babel-loader']
    }]
  },

  // 3. 缓存
  cache: {
    type: 'filesystem', // 文件系统缓存
    cacheDirectory: path.resolve(__dirname, '.temp_cache'),
    buildDependencies: {
      config: [__filename]
    }
  },

  // 4. exclude/include
  module: {
    rules: [{
      test: /\.js$/,
      include: path.resolve(__dirname, 'src'),
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  }
};
```

---

## Tree Shaking

```javascript
// 条件 1：使用 ES Module（静态导入/导出）
// 条件 2：设置 sideEffects

// package.json
{
  "sideEffects": [
    "*.css",
    "*.global.js"
  ]
}

// Webpack 配置
module.exports = {
  mode: 'production',  // 生产模式自动启用 Tree Shaking
  optimization: {
    usedExports: true,  // 标记未使用的导出
    minimize: true      // 压缩时移除未使用的代码
  }
};
```

---

## 压缩优化

```javascript
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: { drop_console: true }, // 移除 console
          output: { comments: false }       // 移除注释
        }
      }),
      new CssMinimizerPlugin()
    ]
  }
};
```

---

## 自测题

### 问题 1
Webpack 中 Tree Shaking 的原理是什么？

<details>
<summary>查看答案</summary>
Tree Shaking 依赖 ES Module 的静态结构（import/export 在编译时确定，而非运行时）。Webpack 在打包时通过 usedExports 标记哪些导出被使用，未被使用的导出在压缩（minimize）时被移除（dead code elimination）。条件：1）使用 ES Module；2）设置 sideEffects（标识哪些文件有副作用，不应被移除）；3）生产模式。
</details>

### 问题 2
文件系统缓存（filesystem cache）如何提升构建速度？

<details>
<summary>查看答案</summary>
Webpack 5 的持久化缓存将构建中间结果缓存到硬盘。第二次构建时，如果模块内容未变，直接使用缓存结果跳过编译过程。缓存会检测配置文件、依赖包等变化自动失效。首次构建稍慢（需要写入缓存），后续构建速度提升显著。
</details>