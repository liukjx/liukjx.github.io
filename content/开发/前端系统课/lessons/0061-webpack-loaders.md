---
title: 第61课：Webpack Loader
description: Webpack Loader 配置详解（css-loader、style-loader、less-loader、postcss-loader、babel-loader、vue-loader）
date: 2026-08-06
tags:
  - Webpack
  - Loader
  - CSS
  - Babel
  - Vue
---

# 第61课：Webpack Loader

## 学习目标

- 理解 Loader 的执行顺序和配置方式
- 掌握 CSS 相关 Loader 的配置（css-loader、style-loader、less-loader、postcss-loader）
- 掌握 JS 相关 Loader 的配置（babel-loader）
- 掌握 Vue 单文件组件 Loader（vue-loader）
- 理解 postcss 的自动处理能力

---

## 一、Loader 概述

### 1.1 Loader 的作用

Webpack 默认只认识 JS 和 JSON 文件。Loader 让 Webpack 能够处理其他类型的文件（CSS、LESS、图片、Vue 组件等），将它们转换为有效的模块。

### 1.2 Loader 执行顺序

Loader 的执行顺序是**从右到左，从下到上**。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',  // ② 将 CSS 注入到 DOM 的 <style> 标签
          'css-loader',    // ① 解析 CSS 中的 import、url 等
        ]
      }
    ]
  }
}
```

> [!NOTE] 执行顺序
> 为什么从右到左？每个 loader 的输入是上一个 loader 的输出。`css-loader` 先把 CSS 解析为 JS 模块，然后 `style-loader` 把这个模块的内容插入到页面中。

---

## 二、CSS Loader 配置

### 2.1 安装

```bash
npm install style-loader css-loader --save-dev
```

### 2.2 基本配置

```javascript
// wk.config.js
module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './build')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        // use 中多个 loader 的使用顺序是从后往前
        use: [
          { loader: 'style-loader' },  // 完整写法
          { loader: 'css-loader' }
        ]

        // 简写一：只有一个 loader 时
        // loader: 'css-loader'

        // 简写二：多个 loader 不需要其他配置时
        // use: [ 'style-loader', 'css-loader' ]
      }
    ]
  }
}
```

### 2.3 style-loader 与 css-loader 的分工

| Loader | 作用 |
|--------|------|
| `css-loader` | 解析 `@import`、`url()` 等 CSS 语法，将 CSS 作为 JS 模块导出 |
| `style-loader` | 将 css-loader 处理后的 CSS 通过 `<style>` 标签注入到 HTML 页面中 |

---

## 三、LESS Loader 配置

### 3.1 安装

```bash
npm install less less-loader --save-dev
```

### 3.2 配置

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',   // ③ 注入到 DOM
          'css-loader',     // ② 解析 CSS
          'less-loader'     // ① LESS -> CSS
        ]
      }
    ]
  }
}
```

---

## 四、PostCSS Loader

PostCSS 是一个用 JavaScript 转换 CSS 的工具，它的 autoprefixer 插件可以自动添加浏览器前缀。

### 4.1 安装

```bash
npm install postcss-loader postcss autoprefixer --save-dev
```

### 4.2 配置方式一：在 webpack 配置中直接设置

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  'autoprefixer'  // 自动添加浏览器前缀
                ]
              }
            }
          }
        ]
      }
    ]
  }
}
```

### 4.3 配置方式二：独立的 postcss.config.js（推荐）

```javascript
// postcss.config.js —— 独立配置文件
module.exports = {
  plugins: [
    'postcss-preset-env'  // 包含 autoprefixer 和其他 CSS 新特性
  ]
}

// 使用 postcss-preset-env 后，webpack 配置更简洁
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader', 'postcss-loader' ]
      },
      {
        test: /\.less$/,
        use: [ 'style-loader', 'css-loader', 'less-loader', 'postcss-loader' ]
      }
    ]
  }
}
```

> [!TIP] px 自动转 rem/vw
> postcss 的插件生态还可以实现 px 自动转换为 rem 或 vw（如 `postcss-pxtorem`、`postcss-px-to-viewport`），实现移动端适配。

---

## 五、Babel Loader

### 5.1 安装

```bash
npm install babel-loader @babel/core @babel/preset-env --save-dev
```

### 5.2 配置

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            // 方式一：直接在 webpack 配置中指定
            // options: {
            //   plugins: [
            //     "@babel/plugin-transform-arrow-functions",
            //     "@babel/plugin-transform-block-scoping"
            //   ]
            // }
          }
        ]
      }
    ]
  }
}
```

### 5.3 Babel 独立配置文件

```javascript
// babel.config.js —— 推荐方式
module.exports = {
  // plugins: [
  //   "@babel/plugin-transform-arrow-functions",
  //   "@babel/plugin-transform-block-scoping"
  // ]

  // 使用预设（preset）代替逐个配置插件
  presets: [
    '@babel/preset-env'  // 根据目标环境自动配置所需插件
  ]
}
```

> [!NOTE] Babel Preset 的作用
> `@babel/preset-env` 是一个智能预设，它会根据配置的目标浏览器环境（如 `browserslist`）自动确定需要转换哪些语法特性，无需手动配置一个个插件。

---

## 六、Vue Loader

### 6.1 安装

```bash
npm install vue-loader vue-template-compiler --save-dev
```

### 6.2 配置

```javascript
const { VueLoaderPlugin } = require('vue-loader/dist/index')

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  plugins: [
    // Vue Loader 必须配合此插件使用
    new VueLoaderPlugin()
  ]
}
```

### 6.3 完成配置示例

```javascript
// 完整的 wk.config.js —— 合并了以上所有 Loader
const path = require('path')
const { VueLoaderPlugin } = require('vue-loader/dist/index')

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './build')
  },
  resolve: {
    extensions: ['.js', '.json', '.vue', '.jsx', '.ts', '.tsx'],
    alias: {
      utils: path.resolve(__dirname, './src/utils')
    }
  },
  module: {
    rules: [
      { test: /\.css$/, use: [ 'style-loader', 'css-loader', 'postcss-loader' ] },
      { test: /\.less$/, use: [ 'style-loader', 'css-loader', 'less-loader', 'postcss-loader' ] },
      {
        test: /\.(png|jpe?g|svg|gif)$/,
        type: 'asset',
        parser: { dataUrlCondition: { maxSize: 60 * 1024 } },
        generator: { filename: 'img/[name]_[hash:8][ext]' }
      },
      { test: /\.js$/, use: [ 'babel-loader' ] },
      { test: /\.vue$/, loader: 'vue-loader' }
    ]
  },
  plugins: [ new VueLoaderPlugin() ]
}
```

---

## 自测问题

<details>
<summary>1. Webpack 中 loader 的执行顺序是什么？</summary>

从右到左，从下到上。例如 `use: ['style-loader', 'css-loader']` 中，先执行 `css-loader`（解析 CSS 语法），再执行 `style-loader`（注入到 DOM）。
</details>

<details>
<summary>2. css-loader 和 style-loader 各有什么作用？</summary>

`css-loader` 解析 CSS 文件中的 `@import`、`url()` 等语法，将 CSS 转换为 JS 可用的模块。`style-loader` 将 css-loader 处理后的样式通过 `<style>` 标签动态注入到 HTML 页面中。
</details>

<details>
<summary>3. PostCSS 的 autoprefixer 插件有什么用？</summary>

autoprefixer 根据配置的浏览器兼容范围（通过 `browserslist` 指定），自动为 CSS 属性添加浏览器私有前缀，如 `-webkit-`、`-moz-`、`-ms-` 等，避免手动编写兼容代码。
</details>

<details>
<summary>4. babel-loader 和 @babel/preset-env 的关系是什么？</summary>

`babel-loader` 是 Webpack 和 Babel 之间的桥梁，让 Webpack 在打包 JS 文件时可以调用 Babel 进行编译。`@babel/preset-env` 是 Babel 的预设，根据目标环境自动决定需要转换哪些 JS 语法（如箭头函数、const/let 等），无需手动配置一个个插件。
</details>