---
title: 第125课：TypeScript 类
description: TypeScript 类的访问修饰符、抽象类、静态成员、泛型类
date: 2026-08-06
tags:
  - TypeScript
  - 类
  - 访问修饰符
  - 抽象类
  - 面向对象
---

# TypeScript 类

## 学习目标

- 掌握类的访问修饰符（public/private/protected/readonly）
- 掌握抽象类的使用
- 掌握静态成员和属性装饰
- 理解 implements 和 extends

---

## 类的基本语法

```typescript
class Person {
  // 属性声明
  name: string;
  age: number;

  // 构造函数
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  // 方法
  greet(): string {
    return `Hello, I'm ${this.name}`;
  }
}
```

### 属性简写

```typescript
// 构造函数参数直接声明属性
class Person {
  constructor(
    public name: string,
    public age: number,
    private id: string
  ) {}
}
```

---

## 访问修饰符

```typescript
class Employee {
  // public：默认，任何地方都可访问
  public name: string;

  // private：只能在类内部访问
  private salary: number;

  // protected：在类内部和子类中访问
  protected department: string;

  // readonly：只读属性
  readonly employeeId: string;

  // 静态属性：通过类名访问
  static companyName: string = 'Tech Corp';

  // 私有静态
  private static totalEmployees: number = 0;

  constructor(name: string, salary: number, dept: string) {
    this.name = name;
    this.salary = salary;
    this.department = dept;
    this.employeeId = `EMP${++Employee.totalEmployees}`;
  }

  // 私有方法
  private calculateTax(): number {
    return this.salary * 0.2;
  }

  // 公共方法
  getSalaryInfo(): string {
    return `${this.name}: $${this.salary - this.calculateTax()}`;
  }
}

// JavaScript 私有字段（ES2020+）
class ModernClass {
  #privateField: string;  // 真正的运行时私有

  constructor(value: string) {
    this.#privateField = value;
  }

  getValue(): string {
    return this.#privateField;
  }
}
```

---

## 抽象类

```typescript
abstract class Shape {
  abstract getArea(): number;
  abstract getPerimeter(): number;

  // 可以有具体实现
  describe(): string {
    return `Area: ${this.getArea()}, Perimeter: ${this.getPerimeter()}`;
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }

  getArea(): number {
    return Math.PI * this.radius ** 2;
  }

  getPerimeter(): number {
    return 2 * Math.PI * this.radius;
  }
}

class Rectangle extends Shape {
  constructor(
    private width: number,
    private height: number
  ) {
    super();
  }

  getArea(): number {
    return this.width * this.height;
  }

  getPerimeter(): number {
    return 2 * (this.width + this.height);
  }
}

// 不能实例化抽象类
// const shape = new Shape();  // Error

const shapes: Shape[] = [new Circle(5), new Rectangle(3, 4)];
shapes.forEach(s => console.log(s.describe()));
```

---

## 继承

```typescript
class Animal {
  constructor(public name: string) {}

  makeSound(): string {
    return 'Some sound';
  }
}

class Dog extends Animal {
  constructor(
    name: string,
    public breed: string
  ) {
    super(name);
  }

  // 方法重写
  makeSound(): string {
    return 'Woof! Woof!';
  }

  // 调用父类方法
  introduce(): string {
    return `${super.makeSound()} - I'm a ${this.breed}`;
  }
}

// 实现多个接口
interface Flyable {
  fly(): void;
}

interface Swimmable {
  swim(): void;
}

class Duck extends Animal implements Flyable, Swimmable {
  constructor(name: string) {
    super(name);
  }

  fly(): void {
    console.log(`${this.name} is flying`);
  }

  swim(): void {
    console.log(`${this.name} is swimming`);
  }
}
```

---

## 泛型类

```typescript
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

// 使用
const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);

const stringStack = new Stack<string>();
stringStack.push('hello');
```

---

## 自测题

### 问题 1
private 关键字和 JavaScript 的 # 私有字段有什么区别？

<details>
<summary>查看答案</summary>
private 是 TypeScript 的类型系统特性，只在编译时检查，编译后的 JavaScript 中不保留，可以通过类型断言绕过。而 # 私有字段是 ECMAScript 的运行时特性，在 JavaScript 运行时有真正的私有性保证，无法通过任何方式在外部访问。如果用 TypeScript 编译到 ES2020+ 目标，private 关键字编译为普通属性，# 字段会被保留为真正的私有字段。
</details>

### 问题 2
抽象类和接口有什么区别？

<details>
<summary>查看答案</summary>
抽象类：可以包含方法和属性的具体实现，使用 abstract 关键字，子类使用 extends 继承。接口：只定义形状（结构），不能包含实现，使用 implements 实现。一个类只能继承一个抽象类，但可以实现多个接口。抽象类适合有共同实现逻辑的基类场景，接口适合定义契约和能力。
</details>

### 问题 3
什么时候应该使用抽象类而不是接口？

<details>
<summary>查看答案</summary>
当基类需要提供共享的实现逻辑时使用抽象类（如模板方法模式）。例如：多个子类有共同的初始化逻辑、通用方法实现、受保护的共享状态等。当只需要定义类型契约时使用接口。经验法则：如果可能，优先使用接口定义类型契约，只在需要共享实现时才使用抽象类。
</details>