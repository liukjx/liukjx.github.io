---
title: "前端速查表 Cheatsheet"
description: "coderwhy 2023 前端系统课常用代码速查"
date: 2026-08-06
tags:
  - reference
  - cheatsheet
draft: false
---

# 前端速查表

## HTML 基础结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>页面标题</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <script src="app.js"></script>
</body>
</html>
```

## CSS 常用选择器

```css
/* 元素选择器 */
div { }
/* 类选择器 */
.class { }
/* ID 选择器 */
#id { }
/* 属性选择器 */
[type="text"] { }
/* 后代选择器 */
div p { }
/* 子代选择器 */
div > p { }
/* 相邻兄弟 */
div + p { }
/* 伪类 */
a:hover { }
li:first-child { }
/* 伪元素 */
p::before { }
p::after { }
```

## Flexbox 速查

```css
.container {
  display: flex;
  flex-direction: row | row-reverse | column | column-reverse;
  flex-wrap: wrap | nowrap | wrap-reverse;
  justify-content: flex-start | flex-end | center | space-between | space-around;
  align-items: stretch | flex-start | flex-end | center | baseline;
  gap: 10px;  /* 间距 */
}
.item {
  flex: 1;              /* 简写: flex-grow flex-shrink flex-basis */
  align-self: center;   /* 单独对齐 */
  order: -1;            /* 排序 */
}
```

## CSS Grid 速查

```css
.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;  /* 三列等宽 */
  grid-template-rows: auto;
  gap: 20px;
}
.item {
  grid-column: 1 / 3;   /* 跨列 */
  grid-row: 1 / 2;      /* 跨行 */
}
```

## JavaScript 数组方法

```javascript
arr.forEach((item, index) => {})      // 遍历
arr.map((item) => item * 2)              // 映射新数组
arr.filter((item) => item > 10)          // 过滤
arr.find((item) => item.id === 1)        // 查找第一个匹配
arr.findIndex((item) => item.id === 1)   // 查找索引
arr.some((item) => item > 10)            // 是否有满足项
arr.every((item) => item > 10)           // 是否全部满足
arr.reduce((acc, cur) => acc + cur, 0)   // 归约
arr.includes(5)                          // 是否包含
arr.sort((a, b) => a - b)               // 排序
```

## Promise 和 async/await

```javascript
// Promise
const p = new Promise((resolve, reject) => {
  setTimeout(() => resolve('完成'), 1000);
});
p.then(res => console.log(res)).catch(err => console.error(err));

// async/await
async function fetchData() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('请求失败:', err);
  }
}
```

## Vue3 Composition API

```javascript
import { ref, reactive, computed, watch, onMounted } from 'vue'

const count = ref(0)               // 基础响应式
const state = reactive({           // 对象响应式
  name: 'Vue',
  version: 3
})
const double = computed(() => count.value * 2)  // 计算属性

watch(count, (newVal, oldVal) => {  // 侦听器
  console.log(`count: ${oldVal} → ${newVal}`)
})

onMounted(() => {                  // 生命周期
  console.log('组件已挂载')
})
```

## React Hooks

```jsx
import { useState, useEffect, useCallback, useMemo } from 'react'

function MyComponent({ prop }) {
  const [state, setState] = useState(initialValue)

  useEffect(() => {
    // 副作用: 数据获取/订阅/DOM操作
    return () => { /* 清理 */ }
  }, [dependencies])

  const handleClick = useCallback(() => {
    // 记忆化回调
  }, [dependencies])

  const computedValue = useMemo(() => {
    // 记忆化计算
    return expensiveCalculation(state)
  }, [state])

  return <div>{state}</div>
}
```

## TypeScript 基础

```typescript
// 基础类型
const str: string = 'hello'
const num: number = 42
const bool: boolean = true
const arr: number[] = [1, 2, 3]
const tuple: [string, number] = ['age', 25]

// 接口
interface User {
  id: number
  name: string
  email?: string           // 可选
  readonly createdAt: Date // 只读
}

// 泛型
function identity<T>(arg: T): T {
  return arg
}
```

## Git 常用命令

```bash
git init                    # 初始化仓库
git add .                   # 暂存所有文件
git commit -m "消息"        # 提交
git branch feature-x        # 创建分支
git checkout feature-x      # 切换分支
git merge feature-x         # 合并分支
git pull origin main        # 拉取远程
git push origin main        # 推送远程
git log --oneline           # 查看提交历史
git status                  # 查看状态
```

## NPM 常用命令

```bash
npm init -y                 # 初始化项目
npm install <package>       # 安装依赖
npm install -D <package>    # 安装开发依赖
npm uninstall <package>     # 卸载依赖
npm run <script>            # 运行脚本
npx <command>               # 直接执行命令
```