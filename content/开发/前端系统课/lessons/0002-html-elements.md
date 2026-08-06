---
title: 第02课：HTML 常见元素
description: HTML文档结构、h1-h6/p/a/img/div/span/列表/表格/表单、语义化
date: 2026-08-06
tags:
  - html
  - course
  - web
---

# 第02课：HTML 常见元素

## 学习目标

- 掌握 HTML 文档结构（文档声明、html、head、body）
- 熟练使用 h1~h6、p、img、a、div、span 等常用元素
- 理解元素语义化的概念和意义
- 掌握全局属性（id、class、style、title）
- 了解字符实体和 URL 的基本概念

---

## 一、HTML 文档结构

### 1.1 文档声明 `<!DOCTYPE html>`

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>网页标题</title>
</head>
<body>
  <!-- 页面可见内容 -->
</body>
</html>
```

- `<!DOCTYPE html>`：声明文档类型为 HTML5，帮助浏览器正确渲染
- `<html lang="zh-CN">`：`lang` 属性指定页面语言（有利于 SEO 和屏幕阅读器）
- `<head>`：存放元数据（配置信息），不会直接显示
- `<body>`：存放页面可见内容

### 1.2 head 中的常见元素

| 元素 | 作用 |
|------|------|
| `<meta charset="UTF-8">` | 设置字符编码为 UTF-8 |
| `<title>` | 网页标题，显示在浏览器标签栏 |
| `<link>` | 链接外部资源（CSS 样式表、网站图标） |
| `<style>` | 定义内部样式 |

---

## 二、body 常见元素

### 2.1 标题元素 h1~h6

```html
<h1>一级标题</h1>
<h2>二级标题</h2>
<h3>三级标题</h3>
<h4>四级标题</h4>
<h5>五级标题</h5>
<h6>六级标题</h6>
```

- `h1` 最重要，每个页面通常只用一个 `h1`（SEO 优化）
- `h1` ~ `h6` 重要性递减，字号也递减
- 标题元素默认加粗，有上下外边距

> [!WARNING]
> 不要为了改变字号而使用标题元素，这是语义化错误。要改变字号应使用 CSS 的 `font-size`。

### 2.2 段落元素 p

```html
<p>这是一个段落。段落之间默认有垂直间距。</p>
<p>这是第二个段落。</p>
```

- `p` 元素定义段落
- 段落之间默认有上下外边距（margin）
- `p` 是块级元素，独占一行

### 2.3 图片元素 img

```html
<img src="https://example.com/image.jpg" alt="图片描述" />
```

**属性**：

| 属性 | 说明 | 是否必须 |
|------|------|---------|
| `src` | 图片路径（URL 或本地路径） | 是 |
| `alt` | 图片无法显示时的替代文本 | 推荐 |

**路径类型**：

- **网络地址**：完整的 URL，如 `https://example.com/logo.png`
- **本地地址**：
  - 绝对路径：`/Users/name/image.png` 或 `C:\image.png`
  - 相对路径：`./images/logo.png`、`../assets/photo.jpg`

> [!TIP]
> 相对路径中：
> - `./` 表示当前目录
> - `../` 表示上一级目录
> - `../../` 表示上两级目录

### 2.4 链接元素 a

```html
<a href="https://www.example.com" target="_blank">打开示例网站</a>
```

**属性**：

| 属性 | 说明 |
|------|------|
| `href` | 链接目标 URL |
| `target` | 在哪里打开链接 |

**target 取值**：

| 值 | 说明 |
|----|------|
| `_self` | 在当前窗口打开（默认） |
| `_blank` | 在新窗口/新标签页打开 |
| `_parent` | 在父框架中打开 |
| `_top` | 在顶层框架中打开 |

**锚点链接**：

```html
<!-- 跳转到页面中 id 为 section2 的位置 -->
<a href="#section2">跳转到第二部分</a>

<!-- 目标位置 -->
<h2 id="section2">第二部分</h2>
```

**a 元素和 img 元素结合**：

```html
<a href="https://example.com" target="_blank">
  <img src="logo.png" alt="logo" />
</a>
```

### 2.5 div 和 span

- **`div`**：块级元素，独占一行，常用于布局容器
- **`span`**：行内级元素，与其他元素在同一行，常用于包裹小段文本

```html
<div>
  <h2>文章标题</h2>
  <p>文章内容...</p>
  <span>标签1</span>
  <span>标签2</span>
</div>
```

### 2.6 列表元素

**无序列表 ul**（最常用）：

```html
<ul>
  <li>苹果</li>
  <li>香蕉</li>
  <li>橙子</li>
</ul>
```

**有序列表 ol**：

```html
<ol>
  <li>第一步：打开冰箱</li>
  <li>第二步：放入大象</li>
  <li>第三步：关上冰箱</li>
</ol>
```

**定义列表 dl**：

```html
<dl>
  <dt>HTML</dt>
  <dd>超文本标记语言</dd>
  <dt>CSS</dt>
  <dd>层叠样式表</dd>
</dl>
```

### 2.7 表格元素 table

```html
<table>
  <tr>
    <th>姓名</th>
    <th>年龄</th>
  </tr>
  <tr>
    <td>张三</td>
    <td>18</td>
  </tr>
  <tr>
    <td>李四</td>
    <td>20</td>
  </tr>
</table>
```

| 元素 | 说明 |
|------|------|
| `<table>` | 表格 |
| `<tr>` | 行 |
| `<td>` | 单元格 |
| `<th>` | 表头单元格（加粗居中） |
| `<thead>` | 表头区域 |
| `<tbody>` | 表格主体区域 |
| `<tfoot>` | 表格底部区域 |
| `<caption>` | 表格标题 |

**单元格合并**：

```html
<td colspan="2">合并两列</td>
<td rowspan="3">合并三行</td>
```

### 2.8 表单元素 form/input

```html
<form action="/search" method="GET">
  <label for="username">用户名：</label>
  <input type="text" id="username" name="username" />
  
  <label for="pwd">密码：</label>
  <input type="password" id="pwd" name="pwd" />
  
  <input type="submit" value="登录" />
</form>
```

**input 的 type 类型**：

| type | 说明 |
|------|------|
| `text` | 文本输入框 |
| `password` | 密码输入框 |
| `radio` | 单选框 |
| `checkbox` | 复选框 |
| `submit` | 提交按钮 |
| `reset` | 重置按钮 |
| `button` | 普通按钮 |

**常用属性**：

```html
<input type="text" disabled />     <!-- 禁用 -->
<input type="text" readonly />     <!-- 只读 -->
<input type="text" autofocus />    <!-- 自动聚焦 -->
<input type="text" value="默认值" />
```

**单选和复选框**：

```html
<!-- 单选：name 相同为一组 -->
<input type="radio" name="gender" value="male" /> 男
<input type="radio" name="gender" value="female" /> 女

<!-- 复选框 -->
<input type="checkbox" name="hobby" value="reading" /> 阅读
<input type="checkbox" name="hobby" value="music" /> 音乐
```

**下拉菜单 select**：

```html
<select name="city">
  <option value="beijing">北京</option>
  <option value="shanghai">上海</option>
  <option value="shenzhen">深圳</option>
</select>
```

**文本域 textarea**：

```html
<textarea rows="4" cols="30">请输入内容...</textarea>
```

**form 表单属性**：

| 属性 | 说明 |
|------|------|
| `action` | 表单提交的服务器地址 |
| `method` | GET 或 POST |
| `target` | 提交后在哪里显示响应 |

### 2.9 不常用但有用的元素

```html
<strong>重要文本</strong>   <!-- 加粗，有语义 -->
<i>斜体</i>                 <!-- 斜体 -->
<code>console.log()</code>  <!-- 代码样式 -->
<br />                      <!-- 换行 -->
<hr />                      <!-- 水平分割线 -->
<small>免责声明</small>      <!-- 小号文本 -->
```

---

## 三、元素语义化

### 什么是语义化

用**正确的元素做正确的事情**。例如：

- 标题用 `h1`~`h6`，不用 `div` 加粗
- 段落用 `p`，不用 `div`
- 强调用 `strong`，不用 `b`

### 语义化的好处

1. **可访问性**：屏幕阅读器等辅助设备能正确理解内容
2. **SEO 优化**：搜索引擎能理解页面结构，提高排名
3. **代码可维护性**：开发者能快速理解代码含义
4. **未来兼容性**：浏览器对语义化元素的支持更好

```html
<!-- 不推荐 -->
<div class="header">
  <div class="nav">导航</div>
</div>
<div class="main">主要内容</div>
<div class="footer">页脚</div>

<!-- 推荐（HTML5 语义化） -->
<header>
  <nav>导航</nav>
</header>
<main>主要内容</main>
<footer>页脚</footer>
```

---

## 四、全局属性

全局属性是所有 HTML 元素共有的属性。

| 属性 | 说明 | 示例 |
|------|------|------|
| `id` | 唯一标识符，页面中唯一 | `<div id="header">` |
| `class` | 类名，可重复，用于 CSS/JS | `<p class="highlight">` |
| `style` | 内联样式 | `<span style="color:red">` |
| `title` | 鼠标悬停时显示的提示文本 | `<abbr title="World Wide Web">WWW</abbr>` |
| `lang` | 语言设置 | `<html lang="zh-CN">` |
| `data-*` | 自定义数据属性 | `<div data-user-id="123">` |

---

## 自测问题

<details>
<summary>1. `h1` 到 `h6` 的语义是什么？每个页面应该有几个 `h1`？</summary>

`h1`~`h6` 表示六级标题，重要性递减。每个页面通常只有一个 `h1`，用于 SEO 优化。
</details>

<details>
<summary>2. `a` 元素的 `target="_blank"` 有什么作用？</summary>

在新窗口或新标签页中打开链接。
</details>

<details>
<summary>3. 什么是元素语义化？有什么好处？</summary>

使用正确的元素做正确的事情。好处包括：提高可访问性、优化 SEO、增强代码可维护性、保证未来兼容性。
</details>

<details>
<summary>4. 写一个包含单选按钮的表单，提交方式为 GET。</summary>

```html
<form action="/submit" method="GET">
  <input type="radio" name="gender" value="male" id="male" />
  <label for="male">男</label>
  <input type="radio" name="gender" value="female" id="female" />
  <label for="female">女</label>
  <input type="submit" value="提交" />
</form>
```

</details>

<details>
<summary>5. 全局属性有哪些？`id` 和 `class` 有什么区别？</summary>

常见全局属性：`id`、`class`、`style`、`title`、`lang`、`data-*`。`id` 在页面中必须唯一，`class` 可以重复使用。
</details>

---

> 下一课：[[0003-html-extra|第03课：HTML 额外知识补充]]