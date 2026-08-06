---
title: 第79课：Vue3 生态系统
description: Element Plus、Vite 配置、Composables 模式、Axios 网络请求、工具链
date: 2026-08-06
tags:
  - vue3
  - ecosystem
  - element-plus
  - vite
  - axios
  - composables
---

# Vue3 生态系统

## 学习目标

- 掌握 Element Plus 的集成和使用
- 掌握 Vite 的常见配置
- 理解 Composables（组合式函数）的设计模式
- 掌握 Axios 的完整封装方案
- 了解 Vue3 工具链（ESLint、Prettier、TypeScript）

---

## 1. Element Plus

### 1.1 安装

```bash
npm install element-plus
```

### 1.2 完整引入

```javascript
// main.js
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
```

### 1.3 按需引入（推荐）

```bash
npm install element-plus
npm install -D unplugin-vue-components unplugin-auto-import
```

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ]
})
```

按需引入后无需手动 import，直接在模板中使用：

```vue
<template>
  <el-button type="primary">主要按钮</el-button>
  <el-input v-model="input" placeholder="请输入内容" />
  <el-table :data="tableData" stripe style="width: 100%">
    <el-table-column prop="name" label="姓名" />
    <el-table-column prop="age" label="年龄" />
  </el-table>
</template>
```

### 1.4 常用组件

```vue
<template>
  <!-- 布局 -->
  <el-row :gutter="20">
    <el-col :span="8">列 1</el-col>
    <el-col :span="8">列 2</el-col>
    <el-col :span="8">列 3</el-col>
  </el-row>

  <!-- 表单 -->
  <el-form :model="form" :rules="rules" ref="formRef">
    <el-form-item label="用户名" prop="username">
      <el-input v-model="form.username" />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input v-model="form.password" type="password" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm">提交</el-button>
    </el-form-item>
  </el-form>

  <!-- 对话框 -->
  <el-dialog v-model="dialogVisible" title="提示" width="30%">
    <p>对话框内容</p>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirm">确认</el-button>
    </template>
  </el-dialog>

  <!-- 消息提示 -->
  <el-button @click="showMessage">消息</el-button>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const form = reactive({
  username: '',
  password: ''
})

const rules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
})

function showMessage() {
  ElMessage.success('操作成功')
  ElMessage.warning('警告信息')
  ElMessage.error('错误信息')
}
</script>
```

### 1.5 主题定制

```scss
// 方式一：CSS 变量覆盖
:root {
  --el-color-primary: #409eff;
  --el-border-radius-base: 4px;
}

// 方式二：SCSS 变量（需配置）
// 在 vite.config.js 中配置 scss 额外数据
```

```javascript
// vite.config.js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/element-variables.scss" as *;`
      }
    }
  }
})
```

## 2. Vite 配置

### 2.1 基础配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],

  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components')
    }
  },

  // CSS 预处理器
  css: {
    preprocessorOptions: {
      less: {
        additionalData: `@import "@/styles/variables.less";`
      },
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *;`
      }
    }
  },

  // 开发服务器
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  }
})
```

### 2.2 环境变量

```bash
# .env.development
VITE_APP_TITLE=开发环境
VITE_API_BASE_URL=http://localhost:8080/api

# .env.production
VITE_APP_TITLE=生产环境
VITE_API_BASE_URL=https://api.example.com
```

```javascript
// 在代码中使用
console.log(import.meta.env.VITE_APP_TITLE)
console.log(import.meta.env.VITE_API_BASE_URL)
```

> [!NOTE]
> Vite 的环境变量必须以 `VITE_` 开头才能暴露给客户端。

## 3. Composables 设计模式

Composables 是利用 Vue3 Composition API 封装的**有状态函数**，用于抽离和复用逻辑。

### 3.1 设计原则

- 命名：以 `use` 开头（如 `useCounter`、`useScroll`、`useTitle`）
- 输入：接收参数（可选）
- 输出：返回响应式状态和函数
- 副作用：在 `onMounted` / `onUnmounted` 中管理

### 3.2 useTitle

```javascript
// hooks/useTitle.js
import { ref, watchEffect } from 'vue'

export default function useTitle(titleValue) {
  const title = ref(titleValue)

  watchEffect(() => {
    document.title = title.value
  })

  return { title }
}
```

### 3.3 useScrollPosition

```javascript
// hooks/useScrollPosition.js
import { reactive, onMounted, onUnmounted } from 'vue'

export default function useScrollPosition() {
  const scrollPosition = reactive({ x: 0, y: 0 })

  function updatePosition() {
    scrollPosition.x = window.scrollX
    scrollPosition.y = window.scrollY
  }

  onMounted(() => {
    document.addEventListener("scroll", updatePosition)
  })

  onUnmounted(() => {
    document.removeEventListener("scroll", updatePosition)
  })

  return { scrollPosition }
}
```

### 3.4 组合使用

```vue
<script setup>
import useCounter from './hooks/useCounter'
import useScrollPosition from './hooks/useScrollPosition'
import useTitle from './hooks/useTitle'

const { counter, increment, decrement } = useCounter()
const { scrollPosition } = useScrollPosition()
const { title } = useTitle("我的应用")
</script>
```

## 4. Axios 网络请求

### 4.1 基本使用

```javascript
import axios from 'axios'

// GET 请求
axios.get("https://api.example.com/lyric", {
  params: { id: 500665346 }
}).then(res => {
  console.log(res.data)
})

// POST 请求
axios.post("https://api.example.com/login", {
  name: "coderwhy",
  password: 123456
}).then(res => {
  console.log(res.data)
})

// 并发请求
axios.all([
  axios.get("/api/data1"),
  axios.get("/api/data2")
]).then(axios.spread((res1, res2) => {
  console.log(res1, res2)
}))
```

### 4.2 创建实例

```javascript
// service/config.js
export const BASE_URL = "https://api.example.com/api"
export const TIMEOUT = 10000

// service/index.js
import axios from 'axios'
import { BASE_URL, TIMEOUT } from './config'

const service = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT
})

export default service
```

### 4.3 拦截器

```javascript
// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 1. 显示 loading
    // 2. 添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // 3. 参数处理
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 1. 关闭 loading
    // 2. 统一处理数据
    return response.data
  },
  (error) => {
    // 统一处理错误
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未登录，跳转登录页
          break
        case 404:
          console.error('请求资源不存在')
          break
        case 500:
          console.error('服务器错误')
          break
      }
    }
    return Promise.reject(error)
  }
)
```

### 4.4 完整封装

```javascript
// service/request.js
import axios from 'axios'

class Request {
  constructor(config) {
    this.instance = axios.create(config)
    this.setupInterceptors()
  }

  setupInterceptors() {
    this.instance.interceptors.request.use(/* ... */)
    this.instance.interceptors.response.use(/* ... */)
  }

  request(config) {
    return this.instance.request(config)
  }

  get(config) {
    return this.request({ ...config, method: 'GET' })
  }

  post(config) {
    return this.request({ ...config, method: 'POST' })
  }
}

export default Request
```

## 5. 工具链

### 5.1 ESLint + Prettier

```bash
npm install -D eslint prettier eslint-plugin-vue
```

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'prettier'
  ],
  rules: {
    'vue/multi-word-component-names': 'off'
  }
}
```

### 5.2 TypeScript 支持

```bash
npm install -D typescript @vue/tsconfig
```

TypeScript 在 Vue3 中的优势：

- 类型推断（ref、reactive、computed 自动推断）
- Props 类型验证
- 更好的 IDE 提示

```typescript
import { ref, computed } from 'vue'

interface User {
  name: string
  age: number
}

const user = ref<User>({ name: "why", age: 18 })

const doubleAge = computed(() => user.value.age * 2)
```

### 5.3 开发建议

| 方面 | 建议 |
|------|------|
| 代码规范 | ESLint + Prettier + Husky |
| 包管理 | pnpm（速度快、省磁盘） |
| 组件库 | Element Plus（PC）/ Vant（移动端） |
| 请求封装 | Axios + 类封装 + 拦截器 |
| 状态管理 | Pinia（推荐）/ Vuex |
| 构建工具 | Vite |
| CSS 方案 | Less/SCSS + CSS Modules + Tailwind |

## 自测题

1. 按需引入 Element Plus 相比完整引入有什么好处？
2. Vite 中环境变量的命名规范和访问方式是什么？
3. Composables（组合式函数）的设计原则有哪些？
4. Axios 拦截器的常见使用场景有哪些？

<details>
<summary>查看答案</summary>

1. 减少打包体积（只引入使用的组件）、加快编译速度、自动引入无需手动 import。
2. 以 `VITE_` 开头，通过 `import.meta.env.VITE_xxx` 访问，在不同 `.env` 文件中定义不同环境的值。
3. 以 `use` 开头命名、接收必要参数、返回响应式状态和函数、在生命周期钩子中管理副作用。
4. 请求拦截器：添加 token/loading/参数处理；响应拦截器：统一数据提取/错误处理/登录超时跳转。

</details>