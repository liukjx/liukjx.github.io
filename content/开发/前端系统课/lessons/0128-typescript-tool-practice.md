---
title: 第128课：TS 工具封装
description: TypeScript 工具函数封装、类型安全工具库、axios 封装
date: 2026-08-06
tags:
  - TypeScript
  - 工具封装
  - 类型安全
  - axios
  - 工具函数
---

# TS 工具封装

## 学习目标

- 掌握类型安全的工具函数封装
- 掌握 axios 请求的 TypeScript 封装
- 掌握泛型工具的实际应用

---

## 类型安全工具函数

### 深拷贝

```typescript
type DeepCopy<T> = T extends (infer U)[]
  ? DeepCopy<U>[]
  : T extends object
  ? { [K in keyof T]: DeepCopy<T[K]> }
  : T;

function deepClone<T>(obj: T): DeepCopy<T> {
  if (obj === null || typeof obj !== 'object') {
    return obj as DeepCopy<T>;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as DeepCopy<T>;
  }

  const cloned: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone((obj as any)[key]);
    }
  }

  return cloned as DeepCopy<T>;
}
```

### 类型安全的 EventBus

```typescript
type EventMap = Record<string, any[]>;

class TypedEventBus<T extends EventMap> {
  private listeners: {
    [K in keyof T]?: Set<(...args: T[K]) => void>;
  } = {};

  on<K extends keyof T>(event: K, callback: (...args: T[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event]!.add(callback);
  }

  emit<K extends keyof T>(event: K, ...args: T[K]): void {
    this.listeners[event]?.forEach(cb => cb(...args));
  }

  off<K extends keyof T>(event: K, callback: (...args: T[K]) => void): void {
    this.listeners[event]?.delete(callback);
  }

  once<K extends keyof T>(event: K, callback: (...args: T[K]) => void): void {
    const wrapper = (...args: T[K]) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  clear(): void {
    this.listeners = {};
  }
}

// 使用
interface AppEvents {
  userLogin: [userId: string, timestamp: number];
  userLogout: [userId: string];
  dataUpdate: [data: { id: string; value: number }];
  error: [message: string, code?: number];
}

const bus = new TypedEventBus<AppEvents>();
bus.on('userLogin', (userId, timestamp) => {
  console.log(`User ${userId} logged in at ${timestamp}`);
});
bus.emit('userLogin', 'abc', Date.now());
```

---

## Axios 封装

```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 基础响应类型
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 分页响应
interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 请求配置
interface RequestConfig<T = any> extends AxiosRequestConfig {
  // 是否显示 loading
  showLoading?: boolean;
  // 是否显示错误提示
  showError?: boolean;
  // 自定义错误处理
  errorHandler?: (error: any) => void;
  // 响应数据转换
  transform?: (data: any) => T;
}

class HttpClient {
  private instance: AxiosInstance;
  private loadingCount: number = 0;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // 请求拦截
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截
    this.instance.interceptors.response.use(
      (response) => {
        const { code, message } = response.data;

        if (code === 0) {
          return response.data.data;
        }

        // 统一错误处理
        if (code === 401) {
          this.redirectToLogin();
        }

        return Promise.reject(new Error(message || '请求失败'));
      },
      (error) => {
        if (error.code === 'ECONNABORTED') {
          console.error('请求超时');
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private redirectToLogin(): void {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.post(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.put(url, data, config);
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.instance.delete(url, config);
  }
}

export const http = new HttpClient(import.meta.env.VITE_API_BASE_URL);
```

---

## 自测题

### 问题 1
为什么在 EventBus 中使用 `T extends Record<string, any[]>` 来约束泛型？

<details>
<summary>查看答案</summary>
Record<string, any[]> 约束泛型参数为键是字符串类型、值是数组类型的对象。数组类型代表事件回调函数的参数列表元组。这样通过泛型映射，在 emit 和 on 方法中可以实现参数的类型推导和类型检查。例如 on('userLogin', (userId, timestamp) => {}) 中，userId 和 timestamp 的类型会根据 EventMap 定义自动推导。
</details>

### 问题 2
axios 请求封装中响应拦截器如何处理业务状态码和 HTTP 状态码的区别？

<details>
<summary>查看答案</summary>
HTTP 状态码（200/401/500 等）由 axios 的响应拦截器处理，非 2xx 状态码会进入错误回调。业务状态码（如 code: 0 成功、code: 401 未登录）是在 HTTP 200 的响应体中，需要在响应拦截器中解析。通常约定：code 为 0 表示成功，直接返回 data；非 0 表示业务错误，统一处理（如提示错误或跳转登录）。
</details>

### 问题 3
深拷贝函数的递归类型 DeepCopy 是如何工作的？

<details>
<summary>查看答案</summary>
DeepCopy 是一个递归条件类型：1）如果是数组类型（T extends (infer U)[]），对元素类型递归调用 DeepCopy；2）如果是对象类型，使用映射类型将每个属性递归复制；3）如果是基本类型，直接返回。这个类型保证了深拷贝后的对象类型与原始类型的结构一致，包括嵌套的数组和对象的类型信息都能保留。
</details>