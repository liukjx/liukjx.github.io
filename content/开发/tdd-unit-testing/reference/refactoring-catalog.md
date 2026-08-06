---
title: "重构手法目录"
description: "重构手法完整目录 — 课程中涉及的所有重构技巧索引"
tags: [reference, refactoring, catalog]
draft: false
---

# 重构手法目录

## 课程涵盖手法一览

| # | 手法 | 课程 | 类型 | 难度 |
|---|------|------|------|------|
| 1 | 提炼函数 (Extract Function) | 第04课 | 基础 | ⭐ |
| 2 | 把函数组装成类 (Assemble Methods to Class) | 第08课 | 基础 | ⭐ |
| 3 | 用查询来替代变量 (Replace Variable with Query) | 第09课 | 基础 | ⭐ |
| 4 | 去除原始类型偏执 (Remove Primitive Obsession) | 第20课 | 中级 | ⭐⭐ |
| 5 | 用查询来替代函数参数 (Replace Parameter with Query) | 第21课 | 中级 | ⭐⭐ |
| 6 | 用管道来替代循环 (Replace Loop with Pipeline) | 第22课 | 中级 | ⭐⭐ |
| 7 | 用函数进行表达 (Express Intent with Functions) | 第23课 | 中级 | ⭐⭐ |
| 8 | 用多态取代条件 (Replace Conditional with Polymorphism) | 第24课 | 高级 | ⭐⭐⭐ |
| 9 | 变量作用域上移 (Move to Higher Scope) | 第20课 | 基础 | ⭐ |

## 按目标分类

### 提升可读性
- 提炼函数
- 用函数进行表达
- 用管道替代循环

### 提升可维护性
- 去除原始类型偏执
- 用查询替代变量
- 用查询替代参数

### 消除条件逻辑
- 用多态取代条件
- 用枚举替代字符串比较

### 代码组织
- 把函数组装成类
- 变量作用域上移

## 重构安全守则

1. **先有测试，再重构** — 没有测试的重构是危险的
2. **小步提交** — 每做一步改动就运行测试
3. **一次只做一种重构** — 不要混合多种手法
4. **保持行为不变** — 重构不改变外部行为，只改善内部结构
5. **善用 IDE** — 现代 IDE 提供自动化重构工具