---
title: 第105课：React Router
description: React Router 路由配置、嵌套路由、路由守卫、懒加载
date: 2026-08-06
tags:
  - React
  - React Router
  - 路由
  - SPA
  - 前端路由
---

# React Router

## 学习目标

- 掌握 React Router v6 的核心概念
- 掌握路由配置的多种方式
- 理解嵌套路由和路由守卫
- 掌握路由懒加载的实现

---

## React Router v6

### 安装

```bash
npm install react-router-dom
```

### 路由模式

```jsx
import { BrowserRouter, HashRouter } from 'react-router-dom';

// BrowserRouter：使用 HTML5 History API（需要服务器支持）
// URL 示例：http://example.com/users/123

// HashRouter：使用 URL 的 hash 部分
// URL 示例：http://example.com/#/users/123

function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}
```

---

## 路由配置

### 基本路由

```jsx
import { Routes, Route } from 'react-router-dom';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/users" element={<Users />} />
      <Route path="/users/:id" element={<UserDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

### 导航

```jsx
import { Link, NavLink, useNavigate } from 'react-router-dom';

function Navigation() {
  const navigate = useNavigate();

  return (
    <nav>
      {/* Link：声明式导航 */}
      <Link to="/">首页</Link>

      {/* NavLink：支持 active 样式 */}
      <NavLink
        to="/about"
        className={({ isActive }) =>
          isActive ? 'nav-link active' : 'nav-link'
        }
        style={({ isActive }) => ({
          fontWeight: isActive ? 'bold' : 'normal'
        })}
      >
        关于
      </NavLink>

      {/* 命令式导航 */}
      <button onClick={() => navigate('/users')}>
        用户列表
      </button>
      <button onClick={() => navigate(-1)}>
        后退
      </button>
      <button onClick={() => navigate('/users', { replace: true })}>
        替换当前页
      </button>
      <button onClick={() => navigate('/users/123', { state: { from: 'home' } })}>
        带状态导航
      </button>
    </nav>
  );
}
```

---

## 嵌套路由

### 路由嵌套

```jsx
// 方式 1：在路由配置中嵌套
<Routes>
  <Route path="/dashboard" element={<DashboardLayout />}>
    {/* index 路由：默认子路由 */}
    <Route index element={<DashboardHome />} />
    <Route path="analytics" element={<Analytics />} />
    <Route path="settings" element={<Settings />} />
    <Route path="users" element={<Users />}>
      {/* 三级嵌套 */}
      <Route path=":id" element={<UserDetail />} />
      <Route path=":id/edit" element={<UserEdit />} />
    </Route>
  </Route>
</Routes>
```

### Outlet：子路由出口

```jsx
import { Outlet, useParams } from 'react-router-dom';

// 父组件 - 提供布局
function DashboardLayout() {
  return (
    <div className="dashboard">
      <Sidebar />
      <main className="dashboard-content">
        {/* 子路由组件在这里渲染 */}
        <Outlet />
      </main>
    </div>
  );
}

// 子组件
function DashboardHome() {
  return <h1>仪表盘首页</h1>;
}

function UserDetail() {
  // 获取路由参数
  const { id } = useParams();
  return <h1>用户详情: {id}</h1>;
}
```

---

## 路由参数和查询

```jsx
import { useParams, useSearchParams, useLocation } from 'react-router-dom';

function ProductPage() {
  // 路径参数：/products/:category/:id
  const { category, id } = useParams();

  // 查询参数：/products?sort=price&page=1
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = searchParams.get('sort');
  const page = searchParams.get('page') || '1';

  // 当前 location 信息
  const location = useLocation();
  // location.pathname:  当前路径
  // location.search:    查询字符串
  // location.state:     导航时传递的状态

  const updateSort = (newSort) => {
    setSearchParams({ sort: newSort, page: '1' });
  };

  return (
    <div>
      <p>分类: {category}</p>
      <p>商品ID: {id}</p>
      <p>排序: {sort}</p>
      <p>页码: {page}</p>
      <button onClick={() => updateSort('price')}>按价格排序</button>
    </div>
  );
}
```

---

## 路由守卫

### 认证守卫

```jsx
import { Navigate, useLocation } from 'react-router-dom';

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // 重定向到登录页，记录来源页面
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async () => {
    await login();
    // 登录成功后跳转回来源页
    const from = location.state?.from?.pathname || '/';
    navigate(from, { replace: true });
  };
}

// 使用路由守卫
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/dashboard" element={
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  } />
</Routes>
```

### 角色守卫

```jsx
function RequireRole({ children, roles }) {
  const { user } = useAuth();

  if (!roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}

// 使用
<Route path="/admin" element={
  <RequireRole roles={['admin', 'superadmin']}>
    <AdminPanel />
  </RequireRole>
} />
```

---

## 路由懒加载

### React.lazy + Suspense

```jsx
import { lazy, Suspense } from 'react';

// 代码分割：每个页面单独打包
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Users = lazy(() => import('./pages/Users'));
const UserDetail = lazy(() => import('./pages/UserDetail'));

function App() {
  return (
    <Suspense fallback={
      <div className="page-loading">
        <Spinner />
      </div>
    }>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<UserDetail />} />
      </Routes>
    </Suspense>
  );
}
```

---

## 完整路由示例

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// 页面组件（懒加载）
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));

// 布局组件
const MainLayout = lazy(() => import('./layouts/MainLayout'));
const AuthLayout = lazy(() => import('./layouts/AuthLayout'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* 主布局 */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />

            {/* 认证路由 */}
            <Route element={<RequireAuth />}>
              <Route path="cart" element={<Cart />} />
              <Route path="orders" element={<Orders />} />
            </Route>
          </Route>

          {/* 登录页（无布局） */}
          <Route path="/login" element={<Login />} />

          {/* 404 */}
          <Route path="/404" element={<NotFound />} />

          {/* 兜底重定向 */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

---

## 自测题

### 问题 1
BrowserRouter 和 HashRouter 有什么区别？

<details>
<summary>查看答案</summary>
BrowserRouter 使用 HTML5 History API（pushState/replaceState/popstate），URL 美观（无 #），但需要服务器配置支持（所有路径返回 index.html）。HashRouter 使用 URL 的 hash 部分（/#/path），兼容性更好，不需要服务器配置，但 URL 包含 # 不够美观。生产环境通常使用 BrowserRouter。
</details>

### 问题 2
React Router v6 中 Outlet 组件的作用是什么？

<details>
<summary>查看答案</summary>
Outlet 是嵌套路由中父组件渲染子路由组件的占位符。父组件定义布局结构（侧边栏、页头、页脚等），Outlet 所在位置就是子路由组件渲染的位置。这实现了布局组件的复用，避免了在每个子页面中重复编写相同的布局代码。
</details>

### 问题 3
如何实现页面切换时的权限控制？

<details>
<summary>查看答案</summary>
创建路由守卫组件（RequireAuth），在组件内检查用户认证状态和角色权限。如果未认证，使用 `<Navigate to="/login" state={{ from: location }} />` 重定向到登录页，同时记录来源页面。登录成功后读取 state.from 跳转回原页面。如果需要角色控制，检查用户角色是否在允许列表中。
</details>