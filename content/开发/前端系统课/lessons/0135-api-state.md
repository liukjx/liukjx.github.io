---
title: 第135课：API 和状态
description: Axios 封装、Pinia 状态管理、API 模块化
date: 2026-08-06
tags:
  - Vue3
  - Axios
  - Pinia
  - API
  - 状态管理
---

# API 和状态

## 学习目标

- 掌握 Axios 的二次封装
- 掌握 Pinia 状态管理
- 掌握 API 模块化组织

---

## Axios 封装

```typescript
// src/utils/request.ts
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getToken, removeToken } from './auth';

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// 请求拦截
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截
service.interceptors.response.use(
  (response) => {
    const res = response.data;

    if (res.code === 0) {
      return res.data;
    }

    // token 过期
    if (res.code === 401) {
      removeToken();
      ElMessageBox.confirm('登录已过期，请重新登录', '提示', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.location.href = '/login';
      });
      return Promise.reject(new Error(res.message));
    }

    ElMessage.error(res.message || '请求失败');
    return Promise.reject(new Error(res.message));
  },
  (error) => {
    let message = error.message;
    if (error.response) {
      switch (error.response.status) {
        case 400: message = '请求参数错误'; break;
        case 403: message = '没有权限'; break;
        case 404: message = '资源不存在'; break;
        case 500: message = '服务器错误'; break;
        default: message = `请求失败(${error.response.status})`;
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时';
    } else if (!navigator.onLine) {
      message = '网络异常';
    }
    ElMessage.error(message);
    return Promise.reject(error);
  }
);

export default service;
```

---

## API 模块化

```typescript
// src/api/user.ts
import request from '@/utils/request';
import type { User, UserQuery } from '@/types/user';

// 用户管理 API
export function getUserList(params: UserQuery) {
  return request.get<PaginatedData<User>>('/users', { params });
}

export function getUserById(id: number) {
  return request.get<User>(`/users/${id}`);
}

export function createUser(data: Partial<User>) {
  return request.post<User>('/users', data);
}

export function updateUser(id: number, data: Partial<User>) {
  return request.put<User>(`/users/${id}`, data);
}

export function deleteUser(id: number) {
  return request.delete(`/users/${id}`);
}

export function batchDeleteUser(ids: number[]) {
  return request.post('/users/batch-delete', { ids });
}

export function updateUserStatus(id: number, status: string) {
  return request.patch(`/users/${id}/status`, { status });
}
```

---

## Pinia 状态管理

```typescript
// src/store/app.ts
import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    sidebarOpened: true,
    device: 'desktop',
    size: 'default'
  }),

  actions: {
    toggleSidebar() {
      this.sidebarOpened = !this.sidebarOpened;
    },
    closeSidebar() {
      this.sidebarOpened = false;
    },
    openSidebar() {
      this.sidebarOpened = true;
    }
  }
});

// 组合式 API 风格
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);

  function increment() {
    count.value++;
  }

  return { count, doubleCount, increment };
});

// 在组件中使用
// const appStore = useAppStore();
// appStore.toggleSidebar();
// appStore.$patch({ sidebarOpened: true });
```

---

## 自测题

### 问题 1
Axios 响应拦截器中如何处理业务错误码和 HTTP 状态码？

<details>
<summary>查看答案</summary>
HTTP 状态码由 axios 自身处理：2xx 进入 then，非 2xx 进入 catch 中的 error.response。业务错误码在响应拦截器中解析：成功时（如 code === 0）直接返回数据；失败时（如 code === 401 token 过期）执行特定逻辑（跳转登录）；其他错误码统一提示错误信息。响应拦截器将业务数据统一处理后返回，组件层无需关心 HTTP 和业务的区分。
</details>

### 问题 2
Pinia 相比 Vuex 的优势是什么？

<details>
<summary>查看答案</summary>
1）更简洁的 API：没有了 mutations，状态直接修改；2）完整的 TypeScript 支持；3）支持两种风格：Options API 风格和 Composition API（setup）风格；4）更好的模块化：不需要使用 namespaced；5）更轻量：代码体积更小；6）支持 devtools 调试。Pinia 已经是 Vue3 官方推荐的状态管理库。
</details>

### 问题 3
如何合理组织 API 模块的文件结构？

<details>
<summary>查看答案</summary>
按业务模块拆分 API 文件：如 user.ts、product.ts、order.ts 等。每个文件导出的函数对应具体的 API 接口。函数命名清晰表达操作含义（getUserList、createUser、updateUserStatus）。API 函数的参数和返回值都带有 TypeScript 类型。这样代码组织结构清晰，便于维护和查找。
</details>