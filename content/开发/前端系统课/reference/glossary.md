---
title: "前端术语表 Glossary"
description: "coderwhy 2023 前端系统课核心术语速查表"
date: 2026-08-06
tags:
  - reference
  - glossary
draft: false
---

# 前端术语表

## HTML / CSS

| 术语 | 英文 | 说明 |
|------|------|------|
| 语义化标签 | Semantic HTML | 使用有意义的标签（header/nav/main/section）描述内容结构 |
| 盒子模型 | Box Model | 每个元素由 content + padding + border + margin 组成 |
| 选择器 | Selector | CSS 用于匹配 HTML 元素的模式（类、ID、属性等） |
| 层叠 | Cascade | 多个 CSS 规则冲突时按优先级（来源/权重/顺序）决定生效规则 |
| Flexbox | Flexbox | 一维布局模型，用于分配空间和对齐内容 |
| Grid | Grid | 二维布局模型，同时控制行和列 |
| 响应式 | Responsive | 页面在不同屏幕尺寸下自适应显示 |
| 媒体查询 | Media Query | 根据设备特性（宽度/分辨率）应用不同 CSS |

## JavaScript

| 术语 | 英文 | 说明 |
|------|------|------|
| DOM | Document Object Model | 浏览器将 HTML 解析为树形结构，JS 通过 DOM API 操作页面 |
| BOM | Browser Object Model | 浏览器对象模型（window/navigator/location） |
| 闭包 | Closure | 函数 + 词法作用域的组合，内层函数可访问外层函数的变量 |
| 原型链 | Prototype Chain | JS 通过对象的 `__proto__` 串联实现继承的机制 |
| 事件委托 | Event Delegation | 利用事件冒泡，在父元素上统一处理子元素事件 |
| 异步 | Async | 不阻塞主线程的操作（回调/Promise/async-await） |
| Promise | Promise | 表示异步操作最终完成或失败的对象 |
| 模块化 | Module | 将代码拆分为独立的文件，通过 import/export 管理依赖 |

## Vue

| 术语 | 英文 | 说明 |
|------|------|------|
| 组件 | Component | 可复用的 Vue 实例，封装 HTML/JS/CSS |
| 响应式 | Reactivity | Vue 自动追踪数据变化并更新 DOM |
| Composition API | Composition API | Vue3 用 setup/ref/reactive 组织逻辑的新方式 |
| 指令 | Directive | 模板中的特殊属性（v-if/v-for/v-model） |
| 路由 | Router | 管理 SPA 中 URL 和组件的映射关系 |
| 状态管理 | State Management | Pinia/Vuex 统一管理全局状态 |

## React

| 术语 | 英文 | 说明 |
|------|------|------|
| JSX | JSX | JavaScript 的语法扩展，在 JS 中写类似 HTML 的标记 |
| Hooks | Hooks | React 16.8+ 在函数组件中使用状态和生命周期的函数 |
| 虚拟 DOM | Virtual DOM | React 在内存中维护的轻量 DOM 树副本 |
| Redux | Redux | 可预测的状态管理容器 |
| 单向数据流 | One-way Data Flow | 数据从父组件流向子组件 |

## 工程化

| 术语 | 英文 | 说明 |
|------|------|------|
| 包管理器 | Package Manager | NPM/Yarn 管理项目依赖的工具 |
| Loader | Loader | Webpack 中处理非 JS 文件（CSS/图片/字体）的转换器 |
| Plugin | Plugin | Webpack 中执行更广泛任务（HTML 生成/代码压缩）的插件 |
| HMR | Hot Module Replacement | 开发时模块热替换，不刷新页面更新代码 |
| 构建 | Build | 将源代码转换为生产代码的过程（编译/压缩/打包） |

## TypeScript

| 术语 | 英文 | 说明 |
|------|------|------|
| 类型注解 | Type Annotation | 为变量/函数参数/返回值指定类型的语法 |
| 接口 | Interface | 定义对象形状的结构化类型 |
| 泛型 | Generics | 创建可复用类型组件的工具，可适用于多种类型 |
| 类型推导 | Type Inference | TS 自动推断变量类型的能力 |

## 其他

| 术语 | 英文 | 说明 |
|------|------|------|
| SSR | Server-Side Rendering | 在服务器端渲染 HTML 发送到客户端 |
| SPA | Single Page Application | 单页应用，页面切换不刷新整个页面 |
| 跨平台 | Cross-platform | 一套代码运行在多个平台（Web/小程序/App） |
| Canvas | Canvas | HTML5 的 2D 绘图 API |
| SVG | Scalable Vector Graphics | 可缩放矢量图形格式 |
| Git | Git | 分布式版本控制系统 |