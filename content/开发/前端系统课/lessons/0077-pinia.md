---
title: 第77课：Pinia 状态管理
description: defineStore、State、Getter、Action、模块化、Plugins、Vuex 对比
date: 2026-08-06
tags:
  - vue3
  - pinia
  - state-management
  - javascript
---

# Pinia 状态管理

## 学习目标

- 理解 Pinia 的核心概念和设计理念
- 掌握 `defineStore` 的定义和使用
- 掌握 State 的读写和重置
- 掌握 Getter 的定义和参数传递
- 掌握 Action 的定义和异步操作
- 掌握 Store 的模块化组织
- 理解 Pinia 与 Vuex 的主要区别

---

## 1. Pinia 概述

Pinia 是 Vue 的**官方状态管理库**，是 Vuex 的替代方案。

### 1.1 Pinia vs Vuex

| 特性 | Pinia | Vuex 4 |
|------|-------|--------|
| TypeScript 支持 | 原生支持，类型推断完整 | 需额外配置 |
| 代码体积 | ~1KB | 较大 |
| Mutation | 无（直接修改 State） | 需要 Mutation |
| DevTools | 支持 | 支持 |
| 模块化 | 不需要嵌套模块，每个 Store 独立 | 需配置 modules |
| 插件系统 | 支持 | 支持 |

> [!NOTE]
> Pinia 的核心理念是**简化**：移除了 Mutation（只有 State、Getter、Action），使用 Composition API 风格定义 Store，天然支持 TypeScript。

## 2. 安装与配置

```bash
npm install pinia
```

```javascript
// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

## 3. 定义 Store

### 3.1 Options Store 风格

与 Vuex 类似的选项式写法：

```javascript
// src/stores/counter.js
import { defineStore } from 'pinia'

const useCounter = defineStore("counter", {
  state: () => ({
    count: 99,
    friends: [
      { id: 111, name: "why" },
      { id: 112, name: "kobe" },
      { id: 113, name: "james" }
    ]
  }),
  getters: {
    doubleCount(state) {
      return state.count * 2
    },
    doubleCountAddOne() {
      // 通过 this 访问其他 getter
      return this.doubleCount + 1
    },
    getFriendById(state) {
      // 返回函数支持传参
      return (id) => {
        return state.friends.find(friend => friend.id === id)
      }
    }
  },
  actions: {
    increment() {
      this.count++
    },
    incrementNum(num) {
      this.count += num
    }
  }
})

export default useCounter
```

### 3.2 Setup Store 风格

与 Composition API 一致的写法：

```javascript
// src/stores/home.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const useHome = defineStore("home", () => {
  // state
  const banners = ref([])
  const recommends = ref([])

  // getters
  const bannerCount = computed(() => banners.value.length)

  // actions
  async function fetchHomeData() {
    const res = await fetch("/api/home")
    const data = await res.json()
    banners.value = data.banners
    recommends.value = data.recommends
  }

  return {
    banners,
    recommends,
    bannerCount,
    fetchHomeData
  }
})

export default useHome
```

## 4. 使用 Store

```vue
<script setup>
import { toRefs } from 'vue'
import { storeToRefs } from 'pinia'
import useCounter from '@/stores/counter'

const counterStore = useCounter()

// 直接解构会丢失响应式
// const { count } = counterStore // 错误！

// 正确方式一：storeToRefs
const { count, friends } = storeToRefs(counterStore)

// 正确方式二：toRefs
const { count } = toRefs(counterStore)

// Action 直接解构（函数没有响应式问题）
const { increment } = counterStore
</script>

<template>
  <h2>count: {{ count }}</h2>
  <h2>count: {{ counterStore.count }}</h2>
  <button @click="counterStore.increment()">count+1</button>
  <button @click="counterStore.count++">直接修改</button>
</template>
```

> [!TIP]
> 使用 `storeToRefs` 解构 state 和 getter 可保持响应式，Action 直接解构即可。

## 5. State

### 5.1 读取和修改

```javascript
const store = useCounter()

// 读取
console.log(store.count)

// 直接修改
store.count++

// 批量修改
store.$patch({
  count: store.count + 10
})

// 批量修改（函数形式）
store.$patch((state) => {
  state.count++
  state.friends.push({ id: 114, name: "curry" })
})

// 重置 state 到初始值
store.$reset()
```

### 5.2 监听 State 变化

```javascript
// 方式一：$subscribe
store.$subscribe((mutation, state) => {
  console.log("mutation:", mutation)
  console.log("state:", state)
})

// 方式二：watch
import { watch } from 'vue'
watch(() => store.count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} -> ${newVal}`)
})
```

## 6. Getter

### 6.1 基本用法

```javascript
getters: {
  // 1. 基本使用
  doubleCount(state) {
    return state.count * 2
  },

  // 2. 一个 getter 引入另一个 getter
  doubleCountAddOne() {
    return this.doubleCount + 1
  },

  // 3. 返回函数（支持传参）
  getFriendById(state) {
    return (id) => {
      return state.friends.find(f => f.id === id)
    }
  }
}
```

### 6.2 跨 Store 使用

```javascript
import useUser from './user'

getters: {
  showMessage(state) {
    const userStore = useUser()
    return `name:${userStore.name} - count:${state.count}`
  }
}
```

## 7. Action

### 7.1 基本用法

```javascript
actions: {
  // 同步
  increment() {
    this.count++
  },

  // 异步
  async fetchUserData() {
    this.loading = true
    try {
      const res = await fetch("/api/user")
      this.user = await res.json()
    } finally {
      this.loading = false
    }
  },

  // 调用其他 action
  complexAction() {
    this.increment()
    this.fetchUserData()
  },

  // 调用其他 store 的 action
  crossStoreAction() {
    const userStore = useUser()
    userStore.updateUser({ name: "new name" })
  }
}
```

### 7.2 在组件中使用 Action

```vue
<script setup>
import useCounter from '@/stores/counter'

const counterStore = useCounter()

// 直接调用
counterStore.increment()

// 解构调用
const { increment } = counterStore
</script>
```

## 8. Store 模块化

Pinia 采用**扁平化 Store 结构**，每个 Store 独立定义，通过文件名组织：

```
src/stores/
  index.js      # 创建 pinia 实例
  counter.js    # 计数器 store
  home.js       # 首页 store
  user.js       # 用户 store
```

```javascript
// 每个 store 独立文件，无需嵌套
// stores/counter.js
export const useCounter = defineStore("counter", { ... })

// stores/home.js
export const useHome = defineStore("home", { ... })

// 组件中使用
import { useCounter } from '@/stores/counter'
import { useHome } from '@/stores/home'
```

> [!NOTE]
> Pinia 不需要像 Vuex 那样嵌套 modules，每个 `defineStore` 调用创建独立的 store。`defineStore` 的第一个参数是 store 的唯一 ID，用于 DevTools 识别。

## 9. 在组件外使用 Store

```javascript
// src/router/index.js
import { useUserStore } from '@/stores/user'

router.beforeEach((to, from) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return '/login'
  }
})
```

> [!WARNING]
> 在组件外使用 Store 时，需确保 Pinia 已经被安装（`app.use(pinia)`）且在 `setup` 函数的上下文中。否则需要在调用处传入 Pinia 实例。

## 自测题

1. Pinia 相比 Vuex 做了哪些简化？
2. Options Store 和 Setup Store 两种风格的区别？
3. 为什么直接解构 Store（`const { count } = store`）会丢失响应式？
4. `$patch` 的作用是什么？什么时候使用？

<details>
<summary>查看答案</summary>

1. 移除了 Mutation（直接在 Action 中修改 State）、更好的 TypeScript 支持、更小的体积、无嵌套 modules。
2. Options Store 类似 Vuex 选项式，用 state/getters/actions 对象；Setup Store 使用 Composition API（ref/computed/函数）定义。
3. 解构会断开响应式连接，需要使用 `storeToRefs` 保持响应式。
4. `$patch` 用于批量修改 state，可以传入对象或函数，减少 DevTools 中的 mutation 记录数量。

</details>