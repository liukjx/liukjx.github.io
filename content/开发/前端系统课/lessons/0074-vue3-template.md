---
title: 第74课：模板语法
description: 插值语法、条件渲染、列表渲染、事件处理、表单绑定、修饰符
date: 2026-08-06
tags:
  - vue3
  - template
  - directives
  - javascript
---

# 模板语法

## 学习目标

- 掌握 Mustache 插值语法和 JavaScript 表达式
- 掌握 `v-once`、`v-text`、`v-html`、`v-pre`、`v-cloak` 等指令
- 掌握 `v-bind` 绑定 class 和 style 的多种方式
- 掌握 `v-on` 事件处理及修饰符
- 掌握条件渲染 `v-if` / `v-else-if` / `v-else` 和 `v-show`
- 掌握列表渲染 `v-for` 及 `key` 的作用
- 掌握表单绑定 `v-model` 及修饰符

---

## 1. 插值语法

### 1.1 Mustache 语法

双大括号 `{{ }}` 用于将数据绑定到模板：

```html
<!-- 基本使用 -->
<span>{{ message }}</span>

<!-- JavaScript 表达式 -->
<span>{{ message + " 追加内容" }}</span>
<span>{{ count * 2 }}</span>
<span>{{ info.name }}</span>
<span>{{ age >= 18 ? "成年" : "未成年" }}</span>
<span>{{ message.split("").reverse().join("") }}</span>
```

> [!WARNING]
> Mustache 中只能写**单个表达式**，不能写语句（如 `if`、`for`）。

### 1.2 其他插值指令

| 指令 | 描述 | 示例 |
|------|------|------|
| `v-once` | 仅渲染一次，不会响应后续更新 | `<p v-once>{{ message }}</p>` |
| `v-text` | 相当于 `textContent` | `<p v-text="message"></p>` |
| `v-html` | 输出 HTML（有 XSS 风险） | `<p v-html="htmlContent"></p>` |
| `v-pre` | 跳过编译，显示原始 Mustache | `<p v-pre>{{ 不编译 }}</p>` |
| `v-cloak` | 配合 CSS 解决插值闪烁 | `<p v-cloak>{{ message }}</p>` |

```html
<style>
  [v-cloak] { display: none; }
</style>

<div v-cloak>
  <h2 v-once>{{ onceMessage }}</h2>
  <h2 v-text="message"></h2>
  <div v-html="richContent"></div>
  <pre v-pre>{{ 原始内容 }}</pre>
</div>
```

> [!WARNING]
> 永远不要将 `v-html` 用于用户提交的内容，这极易导致 XSS 攻击。

### 1.3 v-memo 指令（Vue3.2+）

`v-memo` 接受一个依赖数组，当依赖变化时才重新渲染该元素及其子元素：

```html
<div v-memo="[name, age]">
  <!-- 只有当 name 或 age 改变时才重新渲染 -->
  <span>{{ name }}</span>
  <span>{{ age }}</span>
</div>
```

## 2. v-bind 指令

### 2.1 绑定基本属性

```html
<!-- 完整写法 -->
<img v-bind:src="imgUrl" alt="">
<a v-bind:href="link">链接</a>
<input v-bind:placeholder="placeholderText">

<!-- 缩写 -->
<img :src="imgUrl" alt="">
<a :href="link">链接</a>
<input :placeholder="placeholderText">
```

### 2.2 绑定 class

**对象语法**：

```html
<!-- 单个类名动态控制 -->
<div :class="{ active: isActive }"></div>

<!-- 多个类名 -->
<div :class="{ active: isActive, 'text-danger': hasError }"></div>

<!-- 混合静态 class -->
<div class="static" :class="{ active: isActive }"></div>
```

**数组语法**：

```html
<div :class="['default-class', activeClass, errorClass]"></div>
<div :class="[isActive ? 'active' : '', 'static-class']"></div>
<div :class="[{ active: isActive }, 'static-class']"></div>
```

### 2.3 绑定 style

**对象语法**：

```html
<div :style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
```

**数组语法**：

```html
<div :style="[baseStyle, overridingStyle]"></div>
```

### 2.4 动态绑定属性名

```html
<!-- 属性名由变量决定 -->
<div :[attributeName]="attributeValue"></div>
<!-- 如果 attributeName = "title"，等效于 -->
<div :title="attributeValue"></div>
```

### 2.5 绑定多个属性

```html
<!-- 将对象中所有键值对绑定为属性 -->
<div v-bind="attrs"></div>

<script>
const attrs = {
  id: "app",
  class: "container",
  title: "Hello"
}
</script>
```

## 3. v-on 指令

### 3.1 基本语法

```html
<!-- 完整写法 -->
<button v-on:click="handler">点击</button>

<!-- 缩写 -->
<button @click="handler">点击</button>

<!-- 内联语句 -->
<button @click="count++">+1</button>
```

### 3.2 参数传递

```html
<!-- 不传参 -->
<button @click="increment">+1</button>

<!-- 传参 -->
<button @click="addCount(10)">+10</button>

<!-- 同时需要事件对象 -->
<button @click="handleClick($event, 'param')">点击</button>
```

### 3.3 事件修饰符

```html
<!-- 阻止冒泡 -->
<button @click.stop="handler">点击</button>

<!-- 阻止默认行为 -->
<form @submit.prevent="onSubmit">...</form>

<!-- 只触发一次 -->
<button @click.once="handler">只执行一次</button>

<!-- 按键修饰符 -->
<input @keyup.enter="submit">
<input @keyup.esc="clear">

<!-- 组合修饰符 -->
<button @click.ctrl.exact="handler">Ctrl + 点击</button>

<!-- 事件捕获模式 -->
<div @click.capture="handler">...</div>

<!-- 仅当自身触发（不冒泡） -->
<div @click.self="handler">...</div>

<!-- 修饰符可串联 -->
<a @click.stop.prevent="handler">链接</a>
```

## 4. 条件渲染

### 4.1 v-if / v-else-if / v-else

```html
<div v-if="type === 'A'">类型 A</div>
<div v-else-if="type === 'B'">类型 B</div>
<div v-else-if="type === 'C'">类型 C</div>
<div v-else>其他类型</div>
```

### 4.2 template 上的条件渲染

```html
<template v-if="isLoggedIn">
  <h2>欢迎回来</h2>
  <p>用户名: {{ username }}</p>
</template>

<template v-else>
  <h2>请登录</h2>
  <a href="/login">登录</a>
</template>
```

> [!NOTE]
> `template` 是一个不可见的包装元素，渲染时不会生成额外的 DOM 节点。

### 4.3 v-show

```html
<h2 v-show="isShow">可见内容</h2>
```

**v-if vs v-show 对比**：

| 特性 | v-if | v-show |
|------|------|--------|
| 渲染方式 | 条件为 false 时不渲染 DOM | 始终渲染，通过 `display:none` 控制 |
| 切换开销 | 有更高的切换开销 | 有更高的初始渲染开销 |
| 适用场景 | 运行时条件很少改变 | 需要频繁切换显示状态 |

## 5. 列表渲染

### 5.1 v-for 遍历数组

```html
<!-- 完整语法 -->
<ul>
  <li v-for="(item, index) in items" :key="item.id">
    {{ index }} - {{ item.name }}
  </li>
</ul>
```

### 5.2 v-for 遍历对象

```html
<!-- 遍历对象 -->
<div v-for="(value, key, index) in obj" :key="key">
  {{ index }}. {{ key }}: {{ value }}
</div>
```

### 5.3 template 上的 v-for

```html
<template v-for="(item, index) in items" :key="item.id">
  <h2>{{ item.title }}</h2>
  <p>{{ item.description }}</p>
</template>
```

### 5.4 key 的作用

`key` 用于给 Vue 的虚拟 DOM diff 算法提供提示，以便高效地复用和重新排序现有元素。

```html
<!-- 始终为 v-for 提供 key -->
<li v-for="item in items" :key="item.id">{{ item.name }}</li>
```

```mermaid
graph LR
    subgraph 无key
    A1[A] --> B1[B]
    B1 --> C1[C]
    C1 --> D1[插入D]
    D1 --> E1[D->A, A->B, B->C]
    end

    subgraph 有key
    A2[A(1)] --> B2[B(2)]
    B2 --> C2[C(3)]
    C2 --> D2[插入D(4)]
    D2 --> E2[仅创建D, 其余复用]
    end
```

> [!TIP]
> `key` 应使用唯一标识（如 `id`），**不要使用索引**（`index`）作为 key，否则可能导致列表更新时的渲染错误。

### 5.5 数组变化侦测

Vue 能侦测到响应式数组的变更方法：

| 会触发更新 | 不会触发更新 |
|------------|-------------|
| `push()` | `filter()` |
| `pop()` | `concat()` |
| `shift()` | `slice()` |
| `unshift()` | 直接通过索引设置值 |
| `splice()` | 修改数组长度 |
| `sort()` | |
| `reverse()` | |

对于不会触发更新的操作，需要使用新数组替换：

```javascript
// 直接通过索引修改 --- 不会触发更新
items[0] = newItem
// 正确方式
items.splice(0, 1, newItem)
// 或使用 reactive 或 ref 的方式重新赋值
items.value = [...items.value]
```

## 6. 表单绑定 v-model

### 6.1 基本使用

```html
<!-- 文本输入 -->
<input v-model="message" />
<p>{{ message }}</p>

<!-- 多行文本 -->
<textarea v-model="content"></textarea>

<!-- 复选框 -->
<input type="checkbox" v-model="isChecked" />
<input type="checkbox" v-model="checkedNames" value="A">
<input type="checkbox" v-model="checkedNames" value="B">

<!-- 单选按钮 -->
<input type="radio" v-model="gender" value="male">
<input type="radio" v-model="gender" value="female">

<!-- 选择框 -->
<select v-model="selected">
  <option disabled value="">请选择</option>
  <option value="A">选项A</option>
  <option value="B">选项B</option>
</select>
```

### 6.2 修饰符

```html
<!-- .lazy: 在 change 事件后同步，而非 input -->
<input v-model.lazy="message" />

<!-- .number: 自动转为数字 -->
<input v-model.number="age" />

<!-- .trim: 去除首尾空格 -->
<input v-model.trim="username" />
```

## 自测题

1. `v-if` 和 `v-show` 的区别是什么？如何选择？
2. 为什么 `v-for` 中需要使用 `key`？为什么不能用 `index` 作为 `key`？
3. `v-model` 的本质是什么？
4. `v-bind` 绑定 class 有哪几种方式？
5. 列举 3 个常用的事件修饰符并说明作用。

<details>
<summary>查看答案</summary>

1. `v-if` 条件为 false 时不渲染 DOM，适合切换频率低的场景；`v-show` 始终渲染，通过 `display:none` 控制，适合频繁切换。
2. `key` 帮助 Vue 识别节点，实现高效复用。用 `index` 作为 key 在列表顺序变化或插入/删除时会导致错误的状态复用。
3. `v-model` 本质是 `:value` + `@input` 的语法糖（不同输入元素略有差异）。
4. 对象语法 `{ className: boolean }` 和数组语法 `[class1, class2]`。
5. `.stop` 阻止冒泡、`.prevent` 阻止默认行为、`.once` 只触发一次、`.enter` 按键修饰符等。

</details>