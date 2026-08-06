---
title: 第136课：React 项目架构
description: React 18 + TypeScript 网易云音乐项目搭建
date: 2026-08-06
tags:
  - React 18
  - TypeScript
  - 项目架构
  - 网易云音乐
---

# React 项目架构

## 学习目标

- 掌握 React 18 + TypeScript 项目的搭建
- 掌握项目的目录结构和配置
- 理解项目的分层架构

---

## 项目创建

```bash
npm create vite@latest netease-music -- --template react-ts
cd netease-music
npm install
npm install react-router-dom @reduxjs/toolkit react-redux axios
```

## 目录结构

```
src/
├── assets/          # 静态资源
├── components/      # 公共组件
│   ├── AppHeader/
│   ├── AppFooter/
│   └── Loading/
├── pages/           # 页面组件
│   ├── Home/
│   ├── Discover/
│   ├── Playlist/
│   └── Player/
├── router/          # 路由配置
├── store/           # Redux Toolkit
│   ├── modules/
│   │   ├── playerSlice.ts
│   │   ├── discoverSlice.ts
│   │   └── userSlice.ts
│   └── index.ts
├── services/        # API 服务
├── hooks/           # 自定义 Hooks
├── utils/           # 工具函数
├── types/           # 类型定义
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

---

## 路由配置

```typescript
// src/router/index.tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Discover = lazy(() => import('@/pages/Discover'));
const Playlist = lazy(() => import('@/pages/Playlist'));
const Player = lazy(() => import('@/pages/Player'));
const Search = lazy(() => import('@/pages/Search'));

export default function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Discover />} />
          <Route path="playlist/:id" element={<Playlist />} />
          <Route path="search" element={<Search />} />
        </Route>
      </Routes>
      {/* 全局播放器 */}
      <PlayerBar />
    </Suspense>
  );
}
```

---

## Redux Store

```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import playerReducer from './modules/playerSlice';
import discoverReducer from './modules/discoverSlice';

const store = configureStore({
  reducer: {
    player: playerReducer,
    discover: discoverReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 类型化的 hooks
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
```

---

## 自测题

### 问题 1
React 18 中 StrictMode 在开发环境的行为有什么特点？

<details>
<summary>查看答案</summary>
StrictMode 在开发环境会故意双重调用 useEffect、reducer、state initializer 等函数，以帮助检测副作用问题。这可能导致一些预期之外的行为（如 API 请求被调用两次），但不影响生产环境的运行。这是 React 18 为 Concurrent Mode 做准备，帮助开发者提前发现不纯的副作用。
</details>

### 问题 2
项目中为什么要把类型定义单独放在 types/ 目录？

<details>
<summary>查看答案</summary>
将类型定义集中管理可以提高类型的复用性和可维护性。面试场景下也表明对 TypeScript 的最佳实践有清晰认识。common types（通用类型）放在 types/，模块特有的类型可以放在对应的模块文件内。类型定义在项目中的位置应该遵循"就近原则"：公共类型集中管理，私有类型就近定义。
</details>