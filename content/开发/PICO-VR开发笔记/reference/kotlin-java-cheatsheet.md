---
title: "Kotlin ↔ Java 速查表"
description: "面向 Java 开发者的 Kotlin 快速参考——左侧是熟悉的 Java，右侧是等价的 Kotlin。"
---

# Kotlin ↔ Java 速查表

面向 Java 开发者的 Kotlin 快速参考。左侧是你熟悉的 Java，右侧是等价的 Kotlin。

## 基础语法

| Java | Kotlin |
|------|--------|
| `final String name = "PICO";` | `val name = "PICO"` |
| `int count = 0;` | `var count = 0` |
| `String text = null;` | `val text: String? = null` |
| `if (x != null) { use(x); }` | `x?.let { use(it) }` |
| `str != null ? str.length() : 0` | `str?.length ?: 0` |
| `public int add(int a, int b) { return a + b; }` | `fun add(a: Int, b: Int) = a + b` |
| `switch(x) { case 1: break; default: }` | `when (x) { 1 -> ...; else -> ... }` |
| `for (String s : list) { }` | `for (s in list) { }` |
| `list.stream().map(...).collect(...)` | `list.map { ... }.toList()` |
| `String.format("x=%d", x)` | `"x=$x"  // 字符串模板` |

## 类与对象

| Java | Kotlin |
|------|--------|
| `class Foo extends Bar implements Baz` | `class Foo : Bar(), Baz` |
| `@Override public void do() { }` | `override fun do() { }` |
| `class Singleton { static Singleton get() { } }` | `object Singleton { }` |
| `public static void util() { }` | `companion object { fun util() { } }` |
| `new ArrayList<String>()` | `mutableListOf<String>()` |
| `instanceof` | `is`（且智能转换为该类型） |
| `(Foo) obj` | `obj as Foo` |

## PICO SDK 常见模式

| 模式 | Kotlin 写法 | 说明 |
|------|-------------|------|
| Data Model | `data class X(val a: A, val b: B)` | 自动生成 equals/hashCode/toString/copy |
| 枚举带属性 | `enum class X(val id: Int) { A(1), B(2) }` | 枚举可以直接携带数据 |
| 扩展函数 | `fun String.asTitle(): String` | 给已有类添加方法 |
| 作用域函数 | `with(scope) { ... }` | 在对象上下文中执行代码 |
| 拖尾 Lambda | `composable { ... }` | 最后一个 lambda 参数可写在括号外 |
| 函数引用 | `launch(::mainApp)` | `::` 把函数作为值传递 |
| Compose UI | `@Composable fun X() { ... }` | 声明式 UI 构建 |