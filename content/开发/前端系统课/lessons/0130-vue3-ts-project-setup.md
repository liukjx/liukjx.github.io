---
title: 第130课：Vue3+TS 项目搭建
description: Vue3 + TypeScript + Vite + Element Plus 后台管理系统搭建
date: 2026-08-06
tags:
  - Vue3
  - TypeScript
  - Vite
  - Element Plus
  - 项目搭建
---

# Vue3+TS 项目搭建

## 学习目标

- 掌握使用 Vite 创建 Vue3+TS 项目
- 掌握 Element Plus 的集成
- 理解项目的目录结构和规范

---

## 项目创建

### 使用 Vite 创建

```bash
npm create vite@latest admin-system -- --template vue-ts
cd admin-system
npm install
```

### 安装 Element Plus

```bash
npm install element-plus @element-plus/icons-vue
```

### 集成 Element Plus

```typescript
// src/main.ts
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

import App from './App.vue';
import router from './router';
import store from './store';

const app = createApp(App);

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(ElementPlus, { locale: zhCn });
app.use(router);
app.use(store);
app.mount('#app');
```

---

## 目录结构

```
src/
├── api/              # API 接口
├── assets/           # 静态资源
├── components/       # 公共组件
│   ├── breadcrumb/   # 面包屑
│   ├── sidebar/      # 侧边栏
│   └── svg-icon/     # 图标
├── hooks/            # 组合式函数
├── layouts/          # 布局组件
├── router/           # 路由配置
├── store/            # Pinia 状态
├── styles/           # 全局样式
├── types/            # TypeScript 类型
├── utils/            # 工具函数
├── views/            # 页面组件
├── App.vue
└── main.ts
```

---

## TypeScript 配置

```typescript
// src/types/global.d.ts
declare global {
  interface PaginationParams {
    page: number;
    pageSize: number;
  }

  interface ApiResponse<T = any> {
    code: number;
    data: T;
    message: string;
  }

  interface PaginatedData<T> {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
  }
}

// src/types/user.ts
export interface User {
  id: number;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'disabled';
  createTime: string;
  updateTime?: string;
}

export interface UserQuery extends PaginationParams {
  username?: string;
  status?: string;
  role?: string;
}
```

---

## Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'vendor': ['vue', 'vue-router', 'pinia']
        }
      }
    }
  }
});
```

---

## ESLint + Prettier

```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

---

## 自测题

### 问题 1
Vite 相比 Vue CLI 的优势是什么？

<details>
<summary>查看答案</summary>
1）极速冷启动：基于 ES Module，无需打包即可启动开发服务器；2）HMR 速度快：模块热替换不受项目大小影响；3）按需编译：只编译当前需要的模块；4）开箱即用：内置 TypeScript、JSX、CSS 预处理器支持；5）优化的构建：底层使用 Rollup，打包体积更小。Vite 已经成为 Vue 官方推荐的构建工具。
</details>

### 问题 2
Element Plus 按需引入和全量引入的区别是什么？

<details>
<summary>查看答案</summary>
全量引入：在 main.ts 中直接 import ElementPlus，简单方便但会打包所有组件，增加 bundle 体积（约 500KB+）。按需引入：使用 unplugin-vue-components 和 unplugin-auto-import 插件自动按需引入组件和样式，打包体积更小，但需要额外配置。生产环境推荐按需引入。
</details>

### 问题 3
项目中为什么要配置路径别名（@ -> src）？

<details>
<summary>查看答案</summary>
路径别名解决了相对路径引用的问题。如果不配置，深层目录的 import 路径会变成 '../../../components/xxx'，难以维护。配置 @ 别名后可以使用 '@/components/xxx'，路径更简洁清晰。同时需要在 tsconfig.json 中配置 paths 选项，让 TypeScript 也能正确解析别名路径。
</details>