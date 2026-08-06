---
title: "补充课11：小测验"
description: "内功篇知识点自测，包含HTML、CSS、JavaScript、TypeScript、Next.js、Tailwind、shadcn/ui、数据库、Supabase等20道选择题，附答案与解析"
tags: [测验, 复习, html, css, javascript, typescript, nextjs, tailwind, shadcn, 数据库, supabase]
date: 2026-08-03
draft: false
---

# 补充课11：小测验

> **检验学习成果的最好方式。20道选择题，覆盖内功篇全部知识点。**

这份测验涵盖从第01课到补充课10的所有核心内容。每道题都附有详细解析（点击展开）。

---

## 测验说明

| 项目 | 说明 |
|------|------|
| **题量** | 20 道选择题 |
| **题型** | 单选/多选 |
| **难度** | 从易到难 |
| **建议用时** | 30 分钟 |
| **及格线** | 14/20（70%） |
| **满分** | 20/20（大神！） |

每题答对得 1 分，答错不扣分。

---

## 第一部分：AI编程基础与工具（第01-03课）

### 第1题

AI 编程六个阶段中，"能改代码"对应哪个阶段？

A. 阶段1  
B. 阶段2  
C. 阶段3  
D. 阶段4

<details>
<summary>点击查看答案与解析</summary>

**正确答案：D. 阶段4**

**解析**：AI 编程六阶段模型：
- 阶段0：纯小白
- 阶段1：扣子编程
- 阶段2：本地AI编程
- 阶段3：能读代码
- 阶段4：能改代码  ← 本题答案
- 阶段5：能写代码

能改代码意味着你不是完全依赖AI，而是能理解AI生成的代码并手动调整它。

</details>

---

### 第2题

以下哪个不是本地开发环境的必要组件？

A. Node.js  
B. 一个IDE（Cursor/TRAE等）  
C. Docker Desktop  
D. 包管理器（pnpm/npm）

<details>
<summary>点击查看答案与解析</summary>

**正确答案：C. Docker Desktop**

**解析**：本地开发环境最简配置只需要：
- Node.js（运行JavaScript）
- IDE（写代码）
- 包管理器（管理依赖）

Docker 是容器化工具，在进阶部署时有用，但并非本地开发初期的必需品。别被工具链吓到——**开始写代码只需要三样东西**。

</details>

---

### 第3题

"扣子编程"最大的局限性是什么？

A. 不能生成AI聊天功能  
B. 数据不真正属于你，无法迁移到自定义方案  
C. 界面不够美观  
D. 只能免费使用30天

<details>
<summary>点击查看答案与解析</summary>

**正确答案：B. 数据不真正属于你，无法迁移到自定义方案**

**解析**：扣子编程（Coze）的核心问题在于**平台锁定**——你的应用逻辑、数据、配置都在扣子的生态里，无法导出到自己的服务器。当你的产品需要自定义功能、复杂后端逻辑或规模化时，扣子就成了天花板。

本地开发+自有数据库的方案，虽然前期需要更多学习，但数据真正属于你。

</details>

---

## 第二部分：前后端与Next.js（第04-05课）

### 第4题

以下哪个是 Next.js App Router 中负责定义页面 UI 的文件？

A. `layout.tsx`  
B. `page.tsx`  
C. `route.ts`  
D. `globals.css`

<details>
<summary>点击查看答案与解析</summary>

**正确答案：B. `page.tsx`**

**解析**：
- `page.tsx` → 页面内容（UI）
- `layout.tsx` → 页面布局（导航栏、页脚等包裹层）
- `route.ts` → API 接口（后端）
- `globals.css` → 全局样式

在 `src/app/about/page.tsx` 中写的内容，会显示在 `/about` 路径下。

</details>

---

### 第5题

SSG（Static Site Generation）和 SSR（Server Side Rendering）的核心区别是什么？

A. SSG 用 React，SSR 用 Vue  
B. SSG 在构建时生成 HTML，SSR 在每个请求时生成 HTML  
C. SSG 更快但 SEO 差，SSR 更慢但 SEO 好  
D. 两者没有本质区别

<details>
<summary>点击查看答案与解析</summary>

**正确答案：B. SSG 在构建时生成 HTML，SSR 在每个请求时生成 HTML**

**解析**：
- **SSG**：`npm run build` 时就生成好所有页面的 HTML，用户请求时直接返回静态文件。适合博客、文档等变化不频繁的内容。
- **SSR**：每次用户请求时，服务器实时渲染 HTML 返回。适合需要实时数据的页面（如用户个人中心）。

两者 SEO 都好。选择依据是**内容更新频率**——内容变化少用 SSG，变化频繁用 SSR。

</details>

---

### 第6题

在 Next.js 项目结构中，`src/app/api/chat/route.ts` 文件的作用是什么？

A. 定义聊天的前端 UI 组件  
B. 定义 `/api/chat` 接口的后端逻辑  
C. 配置 Chat 页面的路由  
D. 存储聊天记录的数据库文件

<details>
<summary>点击查看答案与解析</summary>

**正确答案：B. 定义 `/api/chat` 接口的后端逻辑**

**解析**：在 Next.js App Router 中，`src/app/api/.../route.ts` 文件是**后端 API 路由**文件，用于处理 HTTP 请求（GET/POST/PUT/DELETE）。它不会直接渲染页面，而是返回 JSON 数据给前端使用。

```typescript
// 示例
export async function POST(request: Request) {
    const body = await request.json();
    // 处理聊天逻辑
    return Response.json({ reply: "你好！" });
}
```

</details>

---

## 第三部分：CSS与样式（第06-07课相关）

### 第7题

Tailwind CSS 中，`className="flex items-center justify-between p-4"` 的作用是什么？

A. 用 Flexbox 布局，垂直居中，两端对齐，内边距 4 像素  
B. 用 Flexbox 布局，垂直居中，水平平分，内边距 4 单位（1rem）  
C. 创建一个表单，垂直排列，间距 4 像素  
D. 创建一个表格，居中显示，间距 4

<details>
<summary>点击查看答案与解析</summary>

**正确答案：B. 用 Flexbox 布局，垂直居中，水平平分，内边距 4 单位（1rem）**

**解析**：Tailwind 的类名直接对应 CSS 属性：
- `flex` → `display: flex`
- `items-center` → `align-items: center`（垂直居中）
- `justify-between` → `justify-content: space-between`（水平两端对齐）
- `p-4` → `padding: 1rem`（4 个 Tailwind 单位 = 1rem）

Tailwind 的优势是**不用写自定义 CSS**，直接组合原子类名完成布局。

</details>

---

### 第8题

shadcn/ui 是什么？

A. 一个类似于 Bootstrap 的完整 UI 框架  
B. 一个组件集合，代码直接复制到你的项目中，完全可定制  
C. 一个仅支持深色主题的组件库  
D. 一个收费的 UI 模板

<details>
<summary>点击查看答案与解析</summary>

**正确答案：B. 一个组件集合，代码直接复制到你的项目中，完全可定制**

**解析**：shadcn/ui 不同于传统的 UI 库（如 Material UI）。它不是 npm 包，而是**代码生成器**——把组件源码复制到你的项目中作为本地文件。这意味着：
- 你可以直接修改任何组件的代码
- 不受库作者更新节奏的限制
- 只引入你需要的组件，不增加包体积

安装方式：`npx shadcn@latest add button`

</details>

---

### 第9题

以下 Tailwind CSS 的响应式前缀中，代表"≥1024px 屏幕宽度"的是？

A. `sm:`  
B. `md:`  
C. `lg:`  
D. `xl:`

<details>
<summary>点击查看答案与解析</summary>

**正确答案：C. `lg:`**

**解析**：Tailwind 的断点体系：
- `sm:` → 640px
- `md:` → 768px
- `lg:` → 1024px  ← 本题答案
- `xl:` → 1280px
- `2xl:` → 1536px

使用示例：`className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"` 表示在手机上1列、平板上2列、桌面端3列。

</details>

---

## 第四部分：JavaScript/TypeScript（第03-04课相关）

### 第10题

以下 TypeScript 代码中 `?:` 的含义是什么？

```typescript
function greet(name?: string) {
    return `你好，${name ?? '朋友'}`;
}
```

A. name 参数是必需的  
B. name 参数是可选的，可以不传  
C. name 参数的值总是 undefined  
D. name 参数只能接收可选类型的字符串

<details>
<summary>点击查看答案与解析</summary>

**正确答案：B. name 参数是可选的，可以不传**

**解析**：`?:` 表示**可选参数**。调用 `greet()` 不会报错，此时 `name` 的值为 `undefined`。`??` 是空值合并运算符，当左侧为 `null` 或 `undefined` 时使用右侧默认值。

- `greet()` → "你好，朋友"
- `greet('张三')` → "你好，张三"

TypeScript 的可选类型让代码更安全，不会因为忘记传参而崩溃。

</details>

---

### 第11题

以下哪个不是 JavaScript 的基本数据类型？

A. string  
B. number  
C. object  
D. array

<details>
<summary>点击查看答案与解析</summary>

**正确答案：D. array**

**解析**：JavaScript 有 7 种基本数据类型：string, number, boolean, null, undefined, symbol, bigint。

`array` 实际上属于 `object` 类型。可以通过 `Array.isArray(arr)` 判断是否为数组。

```javascript
typeof [1, 2, 3]  // → "object"，不是 "array"
```

</details>

---

### 第12题

React 中 `useEffect` 的作用是什么？

A. 声明一个状态变量  
B. 在组件渲染后执行副作用（如数据请求）  
C. 创建一个全局变量  
D. 定义组件的样式

<details>
<summary>点击查看答案与解析</summary>

**正确答案：B. 在组件渲染后执行副作用（如数据请求）**

**解析**：`useEffect` 是 React 的副作用钩子：
- `useState` → 声明状态变量
- `useEffect` → 处理副作用（数据请求、DOM操作、订阅等）

```typescript
useEffect(() => {
    // 组件挂载时执行一次（[] 依赖数组）
    fetchData();
}, []);  // 空数组 = 只在组件挂载时执行一次
```

</details>

---

### 第13题

以下 TypeScript 代码的含义是什么？

```typescript
interface User {
    id: number;
    name: string;
    email?: string;
}
```

A. 定义了一个名为 User 的 JavaScript 函数  
B. 定义了一个名为 User 的 TypeScript 接口，描述对象的形状  
C. 定义了一个名为 User 的 CSS 类  
D. 定义了一个名为 User 的 SQL 表结构

<details>
<summary>点击查看答案与解析</summary>

**正确答案：B. 定义了一个名为 User 的 TypeScript 接口，描述对象的形状**

**解析**：`interface` 是 TypeScript 的核心概念，用于定义对象的类型结构。`email?: string` 表示 email 是可选字段。

```typescript
const user: User = { id: 1, name: '张三' };  // 正确（email 可选）
const user2: User = { id: 2, name: '李四', email: 'li@e.com' };  // 正确
const user3: User = { id: 3 };  // 错误（缺少 name）
```

接口的好处：编辑器有**代码提示**，编译器能**检查错误**。

</details>

---

## 第五部分：数据库（第06课 + 补充课09）

### 第14题

以下哪个 SQL 语句是正确的 JOIN 用法？

A. `SELECT * FROM users JOIN orders ON user_id = id`  
B. `SELECT * FROM users JOIN orders ON users.id = orders.user_id`  
C. `SELECT * FROM users JOIN orders WHERE users.id = orders.user_id`  
D. `SELECT * FROM users, orders`

<details>
<summary>点击查看答案与解析</summary>

**正确答案：B. `SELECT * FROM users JOIN orders ON users.id = orders.user_id`**

**解析**：JOIN 的正确语法是 `表A JOIN 表B ON 表A.字段 = 表B.字段`。
- A：缺少表名前缀，不明确是哪个 `id`
- C：JOIN 后面应该跟 `ON` 而不是 `WHERE`（`WHERE` 用于条件过滤）
- D：这是笛卡尔积（所有组合），不是有意义的 JOIN

建议写 JOIN 时总是用 **表名.字段名** 的形式，避免歧义。

</details>

---

### 第15题

为什么永远不应该在 SQL 中拼接用户输入？

A. 会导致语法错误  
B. 会降低查询性能  
C. 会导致 SQL 注入攻击  
D. 会使数据库变慢

<details>
<summary>点击查看答案与解析</summary>

**正确答案：C. 会导致 SQL 注入攻击**

**解析**：SQL 注入是最危险的 Web 安全漏洞之一。当用户输入直接拼接到 SQL 字符串中时，攻击者可以输入恶意 SQL 代码来操纵数据库。

```sql
-- 危险！
"SELECT * FROM users WHERE name = '" + userInput + "'"
-- 如果 userInput 输入：' OR '1'='1
-- SQL 变成：SELECT * FROM users WHERE name = '' OR '1'='1'
-- 这会返回所有用户数据！
```

**解决方案**：使用参数化查询或 ORM，它们会自动转义用户输入。

</details>

---

### 第16题

数据库事务（Transaction）的核心特性 ACID 中，"A"代表什么？

A. Automatic（自动化）  
B. Atomicity（原子性）  
C. Availability（可用性）  
D. Alignment（对齐）

<details>
<summary>点击查看答案与解析</summary>

**正确答案：B. Atomicity（原子性）**

**解析**：ACID 四大特性：
- **A**tomicity（原子性）—— 事务中的操作要么全部成功，要么全部失败
- **C**onsistency（一致性）—— 事务前后数据状态一致
- **I**solation（隔离性）—— 并发事务互不干扰
- **D**urability（持久性）—— 提交后的数据永久保存

转账是最经典的例子：扣款和加款必须同时成功或同时回滚。

</details>

---

### 第17题

ORM 的主要好处是什么？

A. 让数据库运行更快  
B. 让你用编程语言的类型安全方式操作数据库，不用手写 SQL  
C. 自动备份数据库  
D. 生成漂亮的数据库界面

<details>
<summary>点击查看答案与解析</summary>

**正确答案：B. 让你用编程语言的类型安全方式操作数据库，不用手写 SQL**

**解析**：ORM（如 Drizzle ORM、Prisma）的主要优势：
- **类型安全**：编译期就能发现字段名错误
- **代码提示**：编辑器自动补全表名和字段名
- **迁移管理**：代码化管理数据库结构变更
- **防 SQL 注入**：自动使用参数化查询

```typescript
// ORM 写法（有类型检查）
await db.insert(users).values({ name: '张三', email: 'z@e.com' });

// 手写 SQL（字符串拼错不报错）
await sql`INSERT INTO users (name, email) VALUES ('张三', 'z@e.com')`;
```

</details>

---

## 第六部分：Supabase（补充课10）

### 第18题

Supabase 的 RLS（Row Level Security）是什么？

A. 一种数据库加密技术  
B. 一种在数据库行级别控制访问权限的安全策略  
C. 一种数据库备份方案  
D. 一种查询优化技术

<details>
<summary>点击查看答案与解析</summary>

**正确答案：B. 一种在数据库行级别控制访问权限的安全策略**

**解析**：RLS 是 Supabase 最核心的安全机制。它允许你在数据库层面定义"谁能访问哪些数据行"。

```sql
-- 用户只能看自己的数据
CREATE POLICY "用户查看自己的数据"
ON todos FOR SELECT
USING (auth.uid() = user_id);
```

启用 RLS 后，即使 API key 泄露，攻击者也只能访问他们自己的数据。

</details>

---

### 第19题

Supabase 与 Firebase 最根本的区别是什么？

A. Supabase 更贵  
B. Supabase 使用 PostgreSQL（关系型数据库），Firebase 使用 Firestore（NoSQL）  
C. Supabase 没有认证功能  
D. Supabase 只能用在 Node.js 项目

<details>
<summary>点击查看答案与解析</summary>

**正确答案：B. Supabase 使用 PostgreSQL（关系型数据库），Firebase 使用 Firestore（NoSQL）**

**解析**：两者最大的区别是**数据模型**：
- **Supabase**：基于 PostgreSQL（关系型），支持 JOIN、事务、复杂查询
- **Firebase**：基于 Firestore（文档型 NoSQL），适合简单 CRUD

对于 AI 编程来说，Supabase 更友好——因为 AI 对 SQL 的理解非常成熟，可以准确生成复杂的查询和 RLS 策略。而且 PostgreSQL 的标准特性意味着你的知识可以应用到任何其他使用 PostgreSQL 的场景。

</details>

---

### 第20题

在 Supabase 项目中，以下哪个 Key 可以在前端代码中安全使用？

A. anon key  
B. service_role key  
C. 数据库密码  
D. 以上都不安全

<details>
<summary>点击查看答案与解析</summary>

**正确答案：A. anon key**

**解析**：
- **anon key**（公共）：可以在前端使用，配合 RLS 策略控制权限
- **service_role key**（私密）：拥有管理员权限，**绝不能暴露在前端**
- **数据库密码**（私密）：直接操作数据库的密码，绝不能暴露

关键原则：**anon key 是公开的，但 RLS 是安全防线。** 前端暴露 anon key 是设计上的预期行为，只要正确配置了 RLS，数据就是安全的。

</details>

---

## 评分结果

### 计分表

| 题号 | 知识点 | 得分 |
|------|--------|------|
| 1-3 | AI编程基础与工具 | /3 |
| 4-6 | 前后端与Next.js | /3 |
| 7-9 | CSS与样式 | /3 |
| 10-13 | JavaScript/TypeScript | /4 |
| 14-17 | 数据库 | /4 |
| 18-20 | Supabase | /3 |
| **总分** | **(满分20)** | **/20** |

### 复习建议

| 得分 | 评价 | 建议 |
|------|------|------|
| **18-20** | 大神！ | 可以自信进入实战篇 |
| **14-17** | 良好 | 回顾错题对应章节，巩固薄弱点 |
| **10-13** | 需要复习 | 建议重看对应课程再做一次测验 |
| **0-9** | 别灰心 | 回到第01课，跟着AI边做边学。编程不是背出来的，是练出来的 |

> [!TIP]
> **分数不重要，重要的是知道自己哪里不会。** 建议把做错的题对应的课程章节标记出来，花15分钟重新看一下。内功篇的所有知识在后面的实战篇中都会反复用到——你会越用越熟的。

---

## 总结

这份测验覆盖了内功篇的全部核心知识点：

```
第01-03课 → AI编程基础 + 工具
第04-05课 → 前后端 + Next.js
第06-07课 → CSS + Tailwind + shadcn/ui
第03-04课 → JavaScript + TypeScript
第06课 + 补充09 → 数据库
补充10课 → Supabase
```

所有知识点都是**理解即可**，不需要死记硬背。在实战篇中，你会反复用到这些概念，每一次使用都是最好的复习。

---

## 下一步

查看 [社群直播与作业航海图 →](s12-she-qun-zhi-bo-hang-hai-tu.md) 了解如何利用社群资源和作业体系继续进阶。