---
title: 第53课：jQuery Ajax
description: jQuery 的 Ajax 封装（$.ajax、$.get、$.post）、错误处理、超时控制、Promise 链和全局事件
date: 2026-08-06
tags:
  - jQuery
  - Ajax
  - HTTP
  - 异步请求
---

# 第53课：jQuery Ajax

## 学习目标

- 掌握 `$.ajax()` 的核心配置参数
- 理解 GET、POST、PUT、DELETE 四种请求方式
- 掌握错误处理和超时控制
- 学会 `$.get()` 和 `$.post()` 等简写方法
- 了解 Ajax 的 Promise 链式调用

---

## 一、$.ajax() 核心方法

`$.ajax()` 是 jQuery 中所有 Ajax 操作的核心方法，它统一了不同请求方式的调用接口。

### 1.1 GET 请求

```javascript
$.ajax({
  url: 'http://httpbin.org/get',
  type: 'GET',           // 请求方式（也可以用 method: 'GET'）
  success: function(res) {
    console.log('请求成功', res)
  },
  error: function(error) {
    console.log('请求失败', error)
  }
})
```

### 1.2 POST 请求

```javascript
$.ajax({
  url: 'http://httpbin.org/post',
  method: 'POST',
  data: {
    username: 'admin',
    password: '123456'
  },
  success: function(res) {
    console.log('请求成功', res)
  }
})
```

### 1.3 PUT 请求（更新资源）

```javascript
$.ajax({
  url: 'http://httpbin.org/put',
  method: 'PUT',
  data: { id: 1, name: '新名称' },
  success: function(res) {
    console.log('更新成功', res)
  }
})
```

### 1.4 DELETE 请求（删除资源）

```javascript
$.ajax({
  url: 'http://httpbin.org/delete',
  method: 'DELETE',
  success: function(res) {
    console.log('删除成功', res)
  }
})
```

### 1.5 核心配置参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `url` | 请求地址 | 当前页面地址 |
| `method` / `type` | 请求方式 | `'GET'` |
| `data` | 发送到服务器的数据 | 对象或字符串 |
| `dataType` | 期望的响应数据类型 | 自动推断 |
| `headers` | 自定义请求头 | `{}` |
| `timeout` | 超时时间（毫秒） | `0`（不超时） |
| `async` | 是否异步 | `true` |
| `success` | 请求成功回调 | - |
| `error` | 请求失败回调 | - |
| `complete` | 请求完成回调（成功/失败都执行） | - |

---

## 二、GET 请求参数传递

```javascript
// 方式一：直接在 URL 中拼接查询字符串
$.ajax({
  url: 'http://httpbin.org/get?cityId=404100&keyWord=天河公园',
  method: 'GET',
  success: function(res) {
    console.log(res)
  }
})

// 方式二：使用 data 参数（推荐）
$.ajax({
  url: 'http://httpbin.org/get',
  method: 'GET',
  data: {
    cityId: '504100',
    keyWord: '小蛮腰'
  },
  success: function(res) {
    console.log(res)
  }
})

// 方式三：添加自定义请求头
$.ajax({
  url: 'http://httpbin.org/get',
  method: 'GET',
  data: {
    cityId: '504100',
    keyWord: '小蛮腰'
  },
  headers: {
    accessToken: 'aaaaabbbbbcccccc'  // 身份认证 token
  },
  success: function(res) {
    console.log(res)
  }
})
```

> [!TIP] data 参数的优势
> jQuery 会自动将 data 对象转换为查询字符串（GET）或请求体（POST），并对中文进行 URL 编码（相当于 `encodeURIComponent`）。

---

## 三、错误处理

jQuery Ajax 通过 `error` 回调处理各种 HTTP 错误状态码。

```javascript
// 常见的 HTTP 错误状态码
$.ajax({
  url: 'http://httpbin.org/status/500',  // 服务器内部错误
  method: 'POST',
  success: function() {
    console.log('success')
  },
  error: function(error) {
    console.log('错误信息:', error)
    console.log('状态码:', error.status)  // 500
    console.log('状态文本:', error.statusText) // "Internal Server Error"
  }
})

// 其他常见错误状态码
// 403 —— 没有权限获取资源
// 404 —— 资源路径错误
// 500 —— 服务器内部异常
// 503 —— 服务器维护中
```

---

## 四、超时控制与取消请求

### 4.1 超时设置

```javascript
$.ajax({
  url: 'http://httpbin.org/delay/7',  // 服务器 7 秒后才返回
  method: 'POST',
  timeout: 5000,  // 5 秒超时
  success: function(res) {
    console.log(res)
  },
  error: function(error) {
    console.log('请求超时或被取消', error)
  }
})
```

### 4.2 手动取消请求

```javascript
var jqXHR = $.ajax({
  url: 'http://httpbin.org/delay/7',
  method: 'POST',
  timeout: 5000,
  success: function(res) {
    console.log(res)
  },
  error: function(error) {
    console.log(error)
  }
})

// 手动取消请求
$('button').click(function() {
  jqXHR.abort()  // 调用 abort() 取消请求
})
```

---

## 五、简写方法

jQuery 为最常用的 GET 和 POST 请求提供了简写方法。

### 5.1 $.get()

```javascript
// 简写形式
$.get('http://httpbin.org/get')

// 携带参数
$.get('http://httpbin.org/get', {
  cityId: '504100',
  keyWord: '小蛮腰'
})
```

### 5.2 $.post()

```javascript
// 简写形式
$.post('http://httpbin.org/post', {
  username: 'admin',
  password: '123456'
})
```

### 5.3 Promise 风格的链式调用

从 jQuery 1.8 开始，`$.ajax` 返回的 jqXHR 对象实现了 Promise 接口，支持链式调用。

```javascript
$.get('http://httpbin.org/get')
  .then(function(res) {
    // 请求成功（相当于 done）
    console.log(res)
  })
  .catch(function(error) {
    // 请求失败（相当于 fail）
    console.log('catch', error)
  })
  .always(function() {
    // 无论成功/失败都会执行（相当于 finally）
    console.log('always')
  })

// 传统回调方式
$.get('http://httpbin.org/get')
  .done(function(res) { console.log(res) })
  .fail(function(error) { console.log(error) })
  .always(function() { console.log('complete') })
```

---

## 六、项目实践：请求封装

在实际项目中，通常会对 `$.ajax` 进行二次封装，统一配置 baseURL、超时时间、错误处理等。

```javascript
// 公共请求封装
;(function(window, $) {
  function request(config = {}) {
    return $.ajax({
      url: config.url || '',
      method: config.method || 'GET',
      timeout: config.timeout || 5000,
      data: config.data || {}
    })
  }

  // GET 简写
  function get(url, data) {
    return request({ url, method: 'GET', data })
  }

  // POST 简写
  function post(url, data) {
    return request({ url, method: 'POST', data })
  }

  window.HYReq = { request, get, post }
})(window, jQuery)

// 使用封装的请求
HYReq.get('http://123.207.32.32:9060/beike/api/homePageInfo')
  .then(function(res) {
    console.log('首页数据:', res)
  })
```

### API 配置管理

```javascript
// config.js —— 统一管理 API 地址
const BASE_URL = 'http://123.207.32.32:9060/beike/api'

const HYAPI = {
  HOME_PAGE_INFO: BASE_URL + '/homePageInfo',
  HOT_RECOMMEND: BASE_URL + '/site/rent',
  HOME_SEARCH: BASE_URL + '/sug/headerSearch'
}
```

---

## 自测问题

<details>
<summary>1. $.ajax() 中 error 回调通常在哪些情况下触发？</summary>

当 HTTP 请求返回错误状态码时触发，如 403（权限不足）、404（资源未找到）、500（服务器内部错误）、503（服务不可用）等。网络断开、跨域失败等情况也会触发 error 回调。
</details>

<details>
<summary>2. 如何设置请求超时并手动取消一个 Ajax 请求？</summary>

在 `$.ajax()` 的配置中设置 `timeout` 属性（毫秒）即可开启超时控制。`$.ajax()` 返回的 jqXHR 对象有 `abort()` 方法，调用后可手动取消请求。
</details>

<details>
<summary>3. $.get() 和 $.ajax({method:'GET'}) 有什么区别？</summary>

`$.get()` 是 `$.ajax({method:'GET'})` 的语法糖，两者功能完全相同。`$.get()` 写法更简洁，适合简单场景；`$.ajax()` 配置更完整，适合需要精细控制的场景。
</details>

<details>
<summary>4. jQuery 的 Ajax 支持 Promise 风格吗？</summary>

支持。从 jQuery 1.8 开始，`$.ajax()` 返回的 jqXHR 对象实现了 Promise 接口，支持 `.then()/.catch()/.always()` 链式调用。同时也保留了 `.done()/.fail()/.always()` 的回调方式。
</details>