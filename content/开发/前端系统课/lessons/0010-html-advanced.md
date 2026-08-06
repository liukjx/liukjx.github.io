---
title: 第10课：HTML 高级元素
description: 表格高级用法、表单高级用法、列表、HTML5语义化元素、video/audio/input新类型、data-*全局属性
date: 2026-08-06
tags:
  - html
  - css
  - course
  - web
---

# 第10课：HTML 高级元素

## 学习目标

- 掌握表格的高级语义元素（thead/tbody/tfoot/caption/th）
- 掌握单元格合并（colspan/rowspan）
- 掌握表单的高级用法（form 完整属性、label 绑定）
- 了解 HTML5 新增的语义化元素
- 掌握 video/audio 元素的使用
- 了解 input 新增的类型和属性

---

## 一、表格高级用法

### 1.1 表格语义元素

```html
<table>
  <caption>学生成绩表</caption>
  <thead>
    <tr>
      <th>姓名</th>
      <th>语文</th>
      <th>数学</th>
      <th>英语</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>张三</td>
      <td>85</td>
      <td>92</td>
      <td>78</td>
    </tr>
    <tr>
      <td>李四</td>
      <td>90</td>
      <td>88</td>
      <td>95</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td>平均分</td>
      <td>87.5</td>
      <td>90</td>
      <td>86.5</td>
    </tr>
  </tfoot>
</table>
```

| 元素 | 语义 |
|------|------|
| `<table>` | 表格容器 |
| `<caption>` | 表格标题 |
| `<thead>` | 表头区域 |
| `<tbody>` | 表格主体区域 |
| `<tfoot>` | 表格底部区域 |
| `<tr>` | 行 |
| `<th>` | 表头单元格（加粗居中） |
| `<td>` | 普通单元格 |

### 1.2 表格样式

```css
table {
  width: 100%;
  border-collapse: collapse;  /* 合并相邻边框（重要） */
}

th, td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: center;
}

thead {
  background-color: #f5f5f5;
}

tbody tr:hover {
  background-color: #f0f8ff;  /* 鼠标悬停高亮 */
}
```

> [!NOTE]
> `border-collapse: collapse` 是表格样式中最重要的属性，它会合并相邻单元格的边框，避免出现双线效果。

### 1.3 单元格合并

```html
<!-- colspan：横向合并（占多列） -->
<table>
  <tr>
    <td colspan="2">合并两列</td>
    <td>第三列</td>
  </tr>
  <tr>
    <td>1</td>
    <td>2</td>
    <td>3</td>
  </tr>
</table>

<!-- rowspan：纵向合并（占多行） -->
<table>
  <tr>
    <td rowspan="2">合并两行</td>
    <td>第一行第二列</td>
  </tr>
  <tr>
    <td>第二行第二列</td>
  </tr>
</table>
```

---

## 二、列表元素回顾

### 2.1 三种列表

```html
<!-- 无序列表（最常用） -->
<ul>
  <li>新闻一</li>
  <li>新闻二</li>
  <li>新闻三</li>
</ul>

<!-- 有序列表 -->
<ol>
  <li>第一步</li>
  <li>第二步</li>
  <li>第三步</li>
</ol>

<!-- 定义列表 -->
<dl>
  <dt>HTML</dt>
  <dd>超文本标记语言，用于描述网页结构</dd>
  <dt>CSS</dt>
  <dd>层叠样式表，用于美化网页</dd>
</dl>
```

### 2.2 去除列表默认样式

```css
ul, ol {
  list-style: none;   /* 去除列表前的圆点/数字 */
  padding: 0;
  margin: 0;
}
```

---

## 三、表单高级用法

### 3.1 form 元素完整属性

```html
<form action="/search" method="GET" target="_blank" enctype="application/x-www-form-urlencoded">
  <!-- 表单内容 -->
  <input type="text" name="keyword" />
  <input type="submit" value="搜索" />
</form>
```

| 属性 | 说明 |
|------|------|
| `action` | 表单提交的服务器地址 |
| `method` | `GET`（数据显示在 URL）/ `POST`（数据在请求体） |
| `target` | 提交后响应在哪打开（`_self`/`_blank`） |
| `enctype` | 编码类型（文件上传时需改为 `multipart/form-data`） |

### 3.2 input 和 label 绑定

**方式一：label 包裹 input**：

```html
<label>
  用户名：
  <input type="text" name="username" />
</label>
```

**方式二：label 的 for 指向 input 的 id（推荐）**：

```html
<label for="email">邮箱：</label>
<input type="email" id="email" name="email" />

<label for="agree">
  <input type="checkbox" id="agree" name="agree" /> 同意用户协议
</label>
```

> [!TIP]
> 点击 label 的文字时，关联的 input 会自动获取焦点或切换选中状态。这对提升表单可用性非常重要。

### 3.3 input 常用属性

```html
<input type="text" placeholder="请输入用户名" />   <!-- 占位提示 -->
<input type="text" value="默认值" />              <!-- 默认值 -->
<input type="text" disabled />                     <!-- 禁用 -->
<input type="text" readonly />                     <!-- 只读 -->
<input type="text" autofocus />                    <!-- 自动聚焦 -->
<input type="text" maxlength="10" />               <!-- 最大字符数 -->
<input type="text" required />                     <!-- 必填 -->
```

### 3.4 按钮

```html
<!-- input 按钮 -->
<input type="submit" value="提交" />
<input type="reset" value="重置" />
<input type="button" value="普通按钮" />

<!-- button 元素（推荐） -->
<button type="submit">提交</button>
<button type="reset">重置</button>
<button type="button">普通按钮</button>
```

### 3.5 单选和复选框

```html
<!-- 单选：相同 name 为一组 -->
<label><input type="radio" name="gender" value="male" checked /> 男</label>
<label><input type="radio" name="gender" value="female" /> 女</label>

<!-- 复选框 -->
<label><input type="checkbox" name="hobby" value="reading" checked /> 阅读</label>
<label><input type="checkbox" name="hobby" value="music" /> 音乐</label>
<label><input type="checkbox" name="hobby" value="sports" /> 运动</label>
```

### 3.6 select/textarea

```html
<select name="city">
  <option value="">请选择城市</option>
  <option value="beijing">北京</option>
  <option value="shanghai">上海</option>
  <option value="shenzhen" selected>深圳</option>
</select>

<textarea name="intro" rows="5" cols="30" placeholder="请输入个人简介..."></textarea>
```

---

## 四、HTML5 新增语义化元素

```html
<body>
  <header>网站头部</header>
  <nav>导航栏</nav>

  <main>
    <article>
      <section>
        <h2>章节标题</h2>
        <p>章节内容</p>
      </section>
    </article>
    <aside>侧边栏</aside>
  </main>

  <footer>网站底部</footer>
</body>
```

| HTML5 元素 | 语义 |
|-----------|------|
| `<header>` | 页眉 / 头部 |
| `<nav>` | 导航区域 |
| `<main>` | 页面主要内容（每个页面只有一个） |
| `<article>` | 独立的文章 / 内容块 |
| `<section>` | 页面中的区域 / 章节 |
| `<aside>` | 侧边栏 / 旁注内容 |
| `<footer>` | 页脚 / 底部 |

> [!NOTE]
> HTML5 语义化元素默认都是块级元素（`display: block`），可放心使用。它们的主要价值在于提高可访问性和 SEO。

---

## 五、video 和 audio

### 5.1 video 元素

```html
<video src="movie.mp4" controls width="640" height="360">
  您的浏览器不支持视频播放
</video>
```

**重要属性**：

| 属性 | 说明 |
|------|------|
| `src` | 视频文件路径 |
| `controls` | 显示播放控件 |
| `width` / `height` | 视频尺寸 |
| `autoplay` | 自动播放（通常需要同时设置 muted） |
| `muted` | 静音 |
| `loop` | 循环播放 |
| `preload` | 预加载（none / metadata / auto） |
| `poster` | 视频封面图 |

**多源兼容**：

```html
<video controls width="640">
  <source src="movie.mp4" type="video/mp4" />
  <source src="movie.webm" type="video/webm" />
  <source src="movie.ogv" type="video/ogg" />
  <p>您的浏览器不支持视频播放</p>
</video>
```

### 5.2 audio 元素

```html
<audio src="music.mp3" controls autoplay muted loop>
  您的浏览器不支持音频播放
</audio>
```

```html
<audio controls>
  <source src="music.mp3" type="audio/mpeg" />
  <source src="music.ogg" type="audio/ogg" />
  <p>您的浏览器不支持音频播放</p>
</audio>
```

---

## 六、input 新增类型和属性

### 6.1 新增 type

```html
<input type="color" />          <!-- 颜色选择器 -->
<input type="date" />           <!-- 日期选择 -->
<input type="time" />           <!-- 时间选择 -->
<input type="email" />          <!-- 邮箱（移动端显示不同键盘） -->
<input type="tel" />            <!-- 电话（移动端显示数字键盘） -->
<input type="url" />            <!-- URL -->
<input type="number" />         <!-- 数字 -->
<input type="range" />          <!-- 滑块 -->
<input type="search" />         <!-- 搜索框 -->
```

### 6.2 新增属性

```html
<input type="text" placeholder="占位文字" />    <!-- 占位提示 -->
<input type="text" required />                  <!-- 必填验证 -->
<input type="email" multiple />                 <!-- 多个值 -->
<input type="text" autocomplete="off" />        <!-- 关闭自动补全 -->
<input type="text" pattern="[0-9]{11}" />       <!-- 正则验证 -->
```

---

## 七、data-* 全局属性

```html
<div data-id="1001" data-type="product" data-price="99.9">
  商品名称
</div>
```

`data-*` 属性用于在 HTML 元素上存储自定义数据，可通过 JavaScript 读取：

```javascript
// JS 中读取 data 属性
const div = document.querySelector('div');
console.log(div.dataset.id);      // "1001"
console.log(div.dataset.type);    // "product"
console.log(div.dataset.price);   // "99.9"
```

---

## 自测问题

<details>
<summary>1. `<thead>`、`<tbody>`、`<tfoot>` 的作用是什么？</summary>

分别定义表格的表头区域、主体区域和底部区域。提高表格的语义化和可访问性。
</details>

<details>
<summary>2. `colspan` 和 `rowspan` 用于什么场景？</summary>

`colspan` 横向合并单元格（占多列），`rowspan` 纵向合并单元格（占多行）。
</details>

<details>
<summary>3. 列举 5 个 HTML5 新增的语义化元素。</summary>

`<header>`、`<nav>`、`<main>`、`<article>`、`<section>`、`<aside>`、`<footer>` 等。
</details>

<details>
<summary>4. `video` 元素中 `autoplay` 为什么经常需要配合 `muted` 使用？</summary>

浏览器隐私政策限制，不允许带声音的自动播放。`muted` 静音后可以自动播放。
</details>

<details>
<summary>5. label 的两种绑定 input 的方式是什么？</summary>

方式一：label 包裹 input；方式二：label 的 `for` 属性指向 input 的 `id`。
</details>

---

> 下一课：[[0011-emmet-pseudo|第11课：Emmet 和结构伪类]]