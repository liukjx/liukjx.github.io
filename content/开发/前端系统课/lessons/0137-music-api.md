---
title: 第137课：API 集成
description: 网易云音乐 API 封装、请求拦截、数据类型定义
date: 2026-08-06
tags:
  - React
  - API
  - 网易云音乐
  - Axios
  - 请求封装
---

# API 集成

## 学习目标

- 掌握 API 请求封装
- 掌握接口数据的类型定义
- 掌握请求 Hook 封装

---

## 基础请求封装

```typescript
// src/services/request.ts
import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',
  timeout: 10000
});

instance.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err)
);

export default instance;
```

### 数据类型定义

```typescript
// src/types/music.ts
export interface Song {
  id: number;
  name: string;
  artists: Artist[];
  album: Album;
  duration: number;
  mvId?: number;
}

export interface Artist {
  id: number;
  name: string;
  picUrl?: string;
}

export interface Album {
  id: number;
  name: string;
  picUrl: string;
}

export interface Playlist {
  id: number;
  name: string;
  coverImgUrl: string;
  creator: { nickname: string };
  trackCount: number;
  playCount: number;
  description?: string;
  tracks: Song[];
}

export interface LyricLine {
  time: number;
  text: string;
}
```

### API 模块

```typescript
// src/services/api.ts
import request from './request';

export const getBanners = () =>
  request.get('/banner', { params: { type: 2 } });

export const getPlaylistDetail = (id: number) =>
  request.get('/playlist/detail', { params: { id } });

export const getSongDetail = (ids: string) =>
  request.get('/song/detail', { params: { ids } });

export const getSongUrl = (id: number) =>
  request.get('/song/url', { params: { id, level: 'standard' } });

export const getLyric = (id: number) =>
  request.get('/lyric', { params: { id } });

export const searchSuggest = (keywords: string) =>
  request.get('/search/suggest', { params: { keywords } });
```

---

## 自测题

### 问题 1
为什么要对 axios 进行二次封装？

<details>
<summary>查看答案</summary>
二次封装的目的是统一处理请求和响应的通用逻辑：1）统一 baseURL 和超时时间；2）统一添加请求头（如 token）；3）统一处理响应数据格式（如解构 data）；4）统一错误处理（HTTP 状态码和业务错误码）；5）统一 loading 控制；6）统一请求取消逻辑。这样业务代码中只需要关心具体的数据获取，不需要关注底层的网络请求细节。
</details>

### 问题 2
如何处理 API 接口的数据结构和前端展示需要的结构的差异？

<details>
<summary>查看答案</summary>
在 service 层做数据转换（adapter 模式）。API 返回的原始数据在 service 中转换为前端需要的格式。也可以使用 selectors（如 Redux 中的 selector）在获取 store 数据时进行转换。这样转换逻辑集中管理，组件层只需要使用已格式化的数据，保持组件清爽。
</details>