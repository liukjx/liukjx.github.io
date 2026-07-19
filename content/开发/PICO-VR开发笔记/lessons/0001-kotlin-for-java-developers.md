---
title: "第1课：Kotlin for Java Developers — 30 分钟速览"
description: "你已有 5 年 Java 经验，那 Kotlin 对你来说大部分都是\"熟悉的陌生人\"。本课不讲基础语法（循环、条件、类定义这些你扫一眼就会了），而是聚焦 Java 里有但写法不同、以及 Java 里完全没有的核心概念。"
---

# Kotlin for Java Developers

你已有 5 年 Java 经验，那 Kotlin 对你来说大部分都是"熟悉的陌生人"。本课不讲基础语法（循环、条件、类定义这些你扫一眼就会了），而是聚焦 **Java 里有但写法不同**、以及 **Java 里完全没有** 的核心概念。

> [!NOTE]
> **目标**
> 学完本课，你能读懂 PICO Demo 项目中 90% 的 Kotlin 代码结构，知道哪些是语法糖、哪些是全新概念。

## 1. 变量声明：val vs var

这是你遇到的第一个差异——但也是最简单的：

| Java | Kotlin |
|------|--------|
| `final String name = "PICO";` | `val name: String = "PICO"` |
| `int count = 0;` | `var count: Int = 0` |

- **val** (value) = 不可变引用 → Java 的 `final`
- **var** (variable) = 可变引用 → Java 的非 final

类型写在变量名**后面**，用冒号分隔。但大多数情况下可以省略——Kotlin 会类型推断：

```kotlin
val name = "PICO"       // 自动推断为 String
var count = 0           // 自动推断为 Int
```

> [!TIP]
> **🔑 PICO Demo 实战**
> 在 `AnimationModels.kt` 中，大量使用了 val 和 data class：
> `val duration: Float = 1.0F` — 不可变属性
> `var baseColor: Color4 = Color4.WHITE` — 可变属性

## 2. 函数声明：fun 关键字

Java 的方法用 `返回值 方法名(参数)`，Kotlin 用 `fun`：

**☕ Java:**

```java
public String asTitle(String word) {
    return word.substring(0, 1).toUpperCase()
         + word.substring(1).toLowerCase();
}
```

**Kotlin:**

```kotlin
fun String.asTitle(): String {
    return this.replaceFirstChar {
        it.titlecase()
    }
}
```

关键差异：

- 关键字 `fun` — 不是 `public String method()`
- 返回值类型在参数**后面**，用冒号分隔
- `public` 是 Kotlin 的**默认**可见性，所以可以省略
- 表达式函数体可以省略 `{ return ... }` 用 `=`：

```kotlin
// 单表达式函数 (PICO Demo 中大量使用)
fun String.asTitle(): String =
    split('_').joinToString(" ") { word ->
        word.lowercase().replaceFirstChar { it.titlecase() }
    }

// 甚至更短——返回值类型也可以推断：
fun String.asTitle() =
    split('_').joinToString(" ") { word ->
        word.lowercase().replaceFirstChar { it.titlecase() }
    }
```

> [!TIP]
> **🔑 PICO Demo 实战**
> 看 `Extensions.kt` 第 22 行：
> `fun String.asTitle(): String =` — 这是 Kotlin 的**扩展函数**，下一节会讲。

## 3. 扩展函数 — Java 没有的神器

扩展函数让你能**给已有类添加新方法**，不需要继承，不需要装饰器模式。

```kotlin
// 给 String 类添加一个 asTitle() 方法
fun String.asTitle(): String =
    split('_').joinToString(" ") { word ->
        word.lowercase().replaceFirstChar { it.titlecase() }
    }

// 然后可以这样调用：
val title = "hello_world".asTitle()  // → "Hello World"
```

从 Java 视角理解："看起来像是 String 的方法，实际上是 Kotlin 编译器帮你做了静态工具函数的调用转换。"

> [!NOTE]
> **PICO Demo 中的扩展函数**
> 在 `Extensions.kt` 中还有另一个例子：
> `fun EaseType.toDisplayName(): String` — 给 SDK 的枚举类型添加了显示名称转换方法。

## 4. 数据类 — 告别 POJO/JavaBean

Java 中一个"数据载体类"需要：字段 + getter + setter + equals + hashCode + toString。Kotlin 一句话搞定：

**☕ Java (约 40 行):**

```java
public class TweenAnimationControl {
    private float duration = 1.0f;
    private float speed = 1.0f;

    public float getDuration() { return duration; }
    public void setDuration(float v) { this.duration = v; }
    public float getSpeed() { return speed; }
    public void setSpeed(float v) { this.speed = v; }

    @Override
    public boolean equals(Object o) { ... }
    @Override
    public int hashCode() { ... }
    @Override
    public String toString() { ... }
}
```

**Kotlin (1 行):**

```kotlin
data class TweenAnimationControl(
    val duration: Float = 1.0F,
    val speed: Float = 1.0F,
)
```

`data class` 自动生成：`equals()`、`hashCode()`、`toString()`、`copy()`、解构函数。

> [!TIP]
> **🔑 PICO Demo 实战**
> 看 `AnimationModels.kt` 第 46-52 行：
> `data class MaterialProperties(var baseColor: Color4 = Color4.WHITE, ...)`
> 这就是 PICO SDK 中定义数据模型的典型方式。

## 5. 空安全 — NullPointerException 的终结

Java 中最常见的崩溃来源，Kotlin 在类型系统层面解决了它：

| Java | Kotlin | 含义 |
|------|--------|------|
| `String name` | `val name: String` | 永远不为 null（编译期保证） |
| `String name = null` | `val name: String?` | 可为 null，用 `?` 标记 |

```kotlin
// 安全调用运算符 ?.
val length: Int? = str?.length  // str 为 null 时返回 null，不崩溃

// Elvis 运算符 ?:
val len = str?.length ?: 0      // str 为 null 时用 0

// 非空断言 !!.
val len = str!!.length          // 告诉编译器"我保证不为 null"，但真的 null 时会抛异常（少用）
```

> [!WARNING]
> **Java 开发者常见陷阱**
> Kotlin 调用 Java 代码时，Java 的所有返回值都变成**平台类型**（可空或不可空未知），你需要自己决定用 `?` 还是不用。PICO SDK 是 Kotlin 原生写的，所以不会有这个问题。

## 6. when 表达式 — 增强版 switch

Kotlin 没有 `switch`，用更强大的 `when`：

**☕ Java switch:**

```java
String name;
switch (type) {
    case LINEAR:      name = "linear"; break;
    case EASE_IN:     name = "ease-in"; break;
    default:          throw new IllegalArgumentException();
}
```

**Kotlin when:**

```kotlin
val name = when (type) {
    EaseType.LINEAR      -> "linear"
    EaseType.EASE_IN     -> "ease-in"
    EaseType.EASE_OUT    -> "ease-out"
    else -> throw IllegalArgumentException()
}
```

`when` 是**表达式**（有返回值），不需要 `break`，模式匹配更强大。

> [!TIP]
> **🔑 PICO Demo 实战**
> 看 `Extensions.kt` 第 27-37 行：
> `fun EaseType.toDisplayName(): String = when (this) { ... }`

## 7. 枚举 + Companion Object = 静态成员

Kotlin 的枚举可以带属性和方法，比 Java 更简洁：

```kotlin
// PICO Demo 中的枚举 (AnimationModels.kt)
enum class NavigationState(val value: Int, val icon: Int) {
    SKELETAL(0, R.drawable.ic_skeletal_animation),
    TWEEN(1, R.drawable.ic_tween_animation);

    companion object {
        fun getList(): List<NavigationState> =
            NavigationState.entries.toList()
    }
}
```

`companion object` 是 Kotlin 中实现"静态方法"的方式。Java 中用 `static` 关键字，Kotlin 中没有 `static`，取而代之的是伴生对象。

## 8. 命名参数 & 默认参数

这是 Kotlin 减少重载方法的关键特性：

```kotlin
// 定义时指定默认值
data class TweenAnimationControl(
    val duration: Float = 1.0F,
    val speed: Float = 1.0F,
    val repeatCount: Int = -1
)

// 调用时可以只传想改的参数——用参数名指定
val control = TweenAnimationControl(
    duration = 2.0F,
    repeatCount = 3
)
// speed 保持默认值 1.0F
```

在 Java 中你需要写 N 个重载构造器。Kotlin 只需要一个。

## 9. copy() — data class 的不可变更新

Kotlin 的 `data class` 自动生成 `copy()` 方法，让你基于已有实例创建修改部分字段的新实例：

```kotlin
// PICO Demo 中的用法 (AnimationModels.kt)
fun copyWith(property: TweenAnimationProperties, value: Any): TweenAnimationControl {
    return when (property) {
        TweenAnimationProperties.DURATION -> copy(duration = value as Float)
        TweenAnimationProperties.SPEED    -> copy(speed = value as Float)
        // ...
    }
}
```

这让你可以优雅地使用不可变对象（`val`），但仍然能"修改"数据。

## 10. 高阶函数 & Lambda

这是 Kotlin 最强大的特性之一。函数可以像变量一样传递：

```kotlin
// 高阶函数：参数是一个函数
fun calculate(a: Int, b: Int, operation: (Int, Int) -> Int): Int {
    return operation(a, b)
}

// 调用时传 lambda
val sum = calculate(3, 5) { x, y -> x + y }       // → 8
val product = calculate(3, 5) { x, y -> x * y }   // → 15
```

Lambda 的语法规则：`{ 参数 -> 函数体 }`。

如果 lambda 是函数的**最后一个参数**，可以写在括号外面（拖尾 lambda）：

```kotlin
compose { ... }  // 实际上就是 compose({ ... }) 的语法糖
```

这在 Jetpack Compose 中无处不在——PICO 的 Spatial UI 也采用相同风格。

## 11. inline + reified — 泛型不擦除

Java 的泛型在运行时被擦除（`List<String>` 在运行时只是 `List`），Kotlin 的 `inline` 函数可以用 `reified` 关键字保留泛型类型信息：

**Java：** 无法判断 T 的类型

```java
public <T> T create(Class<T> clazz) { ... }
// 调用时必须手动传 Class 参数
User user = create(User.class);
```

**Kotlin：** reified 让 T 在运行时保留

```kotlin
inline fun <reified T> create(): T {
    return T::class.java.getDeclaredConstructor().newInstance()
}
// 调用时不需要传 Class 参数
val user = create<User>()
```

`reified` 必须和 `inline` 配合使用。原理是编译器在调用处把代码内联展开，所以泛型类型在展开时是已知的。

> [!TIP]
> **💡 PICO Demo 实战 — cachedEnumValues()**
> 看 `animation-0.13.3/ktx/Extensions.kt` 第 57-59 行：

```kotlin
// PICO 用 reified 实现了类型安全的枚举缓存
inline fun <reified T : Enum<T>> cachedEnumValues(): Array<T> {
    return EnumValuesCache.instance.getValues(T::class)
    //                                    ↑ 这里用了 T::class
    //                                      没有 reified 做不到
}

// 使用时传入泛型参数，无需传 Class
val animations = cachedEnumValues<SkeletalAnimationState>()
// T 被推断为 SkeletalAnimationState，自动获取其所有枚举值
```

没有 `reified`，你拿不到 `T::class`（Java 中要用 `T.class` 但是不允许）。没有 `inline`，`reified` 无法工作——两者是绑定的。

> [!WARNING]
> **Java 开发者理解**
> `inline` 就像 C 的宏展开——编译器把函数体直接复制到调用处。
> `reified` 相当于把 `T` 替换成了具体的 `SkeletalAnimationState`，运行时自然就不会擦除了。
> 代价：inline 函数不能太长（否则字节码膨胀）且不能是 private 或虚函数。

## 12. operator fun — 运算符重载

Kotlin 允许你为自定义类型重载运算符（`+`, `-`, `[]`, `in` 等），让代码更自然：

| 运算符 | 对应的函数名 | 用法 |
|--------|-------------|------|
| `+` | `plus` | `a + b` → `a.plus(b)` |
| `-` | `minus` | `a - b` → `a.minus(b)` |
| `[]` | `get` | `a[b]` → `a.get(b)` |
| `()` | `invoke` | `a()` → `a.invoke()` |
| `in` | `contains` | `b in a` → `a.contains(b)` |
| `==` | `equals` | `a == b` → `a.equals(b)` |
| `+=` | `plusAssign` | `a += b` → `a.plusAssign(b)` |

> [!TIP]
> **💡 PICO Demo 实战 — 下标运算符 []**
> 看 `AnimationModels.kt` 第 61-69 行，`TweenAnimationControl` 重载了 `get` 运算符：

```kotlin
data class TweenAnimationControl(
    val duration: Float = 1.0F,
    val speed: Float = 1.0F,
    // ...
) {
    // operator fun 重载 [] 运算符
    operator fun get(property: TweenAnimationProperties): Any {
        return when (property) {
            TweenAnimationProperties.DURATION -> duration
            TweenAnimationProperties.SPEED -> speed
            TweenAnimationProperties.REPEAT_COUNT -> repeatCount
            TweenAnimationProperties.REPEAT_MODE -> repeatMode
            TweenAnimationProperties.EASE_TYPE -> easeType
        }
    }
}

// 使用：用 [] 下标访问属性
val control = TweenAnimationControl(duration = 2.0F)
val dur = control[TweenAnimationProperties.DURATION]  // → 2.0F
val spd = control[TweenAnimationProperties.SPEED]      // → 1.0F

// 如果没有 operator get，你需要写：
val dur = control.getProperty(TweenAnimationProperties.DURATION)
```

在 PICO SDK 中，运算符重载常用于 **Vector3/Color4** 等数学类型：

```kotlin
// SDK 中的数学运算符（示例，非逐字代码）
val v1 = Vector3(1f, 2f, 3f)
val v2 = Vector3(4f, 5f, 6f)
val sum = v1 + v2        // plus 运算符重载 → Vector3(5, 7, 9)
val scaled = v1 * 2f     // times 运算符重载 → Vector3(2, 4, 6)

// Color4 也支持运算符
val blended = color1 * 0.5f + color2 * 0.5f
```

> [!NOTE]
> **实现规则**
> `operator` 关键字告诉编译器"这个函数是运算符重载"。对应的函数名是固定的（如上表）。不能自己发明新的运算符——只能重载已有的。

## 13. by lazy — 延迟初始化委托

`by lazy` 是 Kotlin 中最常用的委托属性之一。它让属性在**首次访问时**才初始化，之后缓存结果。适合创建开销大的对象（如数据库连接、缓存、HttpClient）。

```kotlin
// 基本语法
val myService: MyService by lazy {
    MyService()  // 仅在首次访问 myService 时执行
}
// 之后每次访问 myService 都返回缓存的结果
```

> [!TIP]
> **💡 PICO Demo 实战**
> 看 `ktx/Extensions.kt` 第 52 行，`EnumValuesCache` 使用 `by lazy` 实现单例：

```kotlin
class EnumValuesCache {
    private val cache = mutableMapOf<KClass<out Enum<*>>, Array<out Enum<*>>>()

    companion object {
        // by lazy 确保 instance 只在首次访问时创建
        val instance: EnumValuesCache by lazy { EnumValuesCache() }
    }
}

// 调用方式——首次访问时触发初始化
val cache = EnumValuesCache.instance
```

`by lazy` 等价于 Java 的"双重检查锁定单例"（double-checked locking），但 Kotlin 帮你处理了所有线程安全细节。

#### lazy 的三种模式

| 模式 | 线程安全 | 适用场景 |
|------|---------|---------|
| `LazyThreadSafetyMode.SYNCHRONIZED` | ✅ 默认，多线程安全 | 全局单例、可能有多个线程访问 |
| `LazyThreadSafetyMode.PUBLICATION` | ⚠️ 允许并发初始化，取第一个结果 | 多线程但初始化可重复 |
| `LazyThreadSafetyMode.NONE` | ❌ 不保证线程安全 | 仅在单线程访问（如 Compose 的 remember） |

```kotlin
// 指定模式
val singleton by lazy(LazyThreadSafetyMode.SYNCHRONIZED) { HeavyService() }

// by lazy 在 Compose 中的对应
// Compose 中用的 remember { } 也是延迟初始化，但 remember 在重组时保持值
// by lazy 在类属性层级，remember 在 Composable 函数层级
```

> [!NOTE]
> **by 关键字的含义**
> `by` 是 Kotlin 的**委托**关键字。`val x by lazy { ... }` 的意思是"属性 x 的 getter 委托给 lazy 的 lambda"。
> 除了 `by lazy`，还有 `by Delegates.observable()`（观察属性变化）、`by map`（从 Map 读属性）等委托模式。

## 现在，让我们把学到的知识综合起来

现在，让我们把学到的知识综合起来，看一段 PICO Demo 的真实代码。以下就是 `SpatialApplication.kt` 的完整内容：

```kotlin
package com.pico.spatial.sample.animation.platform

import android.app.Application
import com.pico.spatial.sample.animation.mainApp
import com.pico.spatial.ui.foundation.dsl.launch

// 继承：冒号代替 extends
class SpatialApplication : Application() {
    // override 是关键字，不是注解
    override fun onCreate() {
        super.onCreate()
        // 函数引用 ::mainApp — 把函数当参数传递
        launch(::mainApp)
    }
}
```

而 `mainApp` 是这样定义的：

```kotlin
fun mainApp(scope: SpatialAppScope) =
    with(scope) {
        DefaultWindowContainer {
            PicoTheme {
                Box {
                    AnimationTypeTabBar()
                    HomePage()
                }
            }
        }
    }
```

这段代码展示了 Kotlin 的多个特性在"实战"中如何协同：

- **单表达式函数**：`=` 代替了 `{ return ... }`
- **`with(scope)`**：作用域函数，让你直接调用 scope 的方法而不需要 scope.xxx
- **拖尾 lambda**：`DefaultWindowContainer { ... }` 实际上是 `DefaultWindowContainer({ ... })`
- **DSL 风格**：嵌套的 lambda 构建了一棵 UI 树——这是 Jetpack Compose / Spatial UI 的核心模式

## 快速练习

试试将下面这段 Java 代码"翻译"成 Kotlin（答案在下方）：

```java
// Java
public class User {
    private String name;
    private int age;

    public User(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() { return name; }
    public int getAge() { return age; }

    public String toString() {
        return "User(" + name + ", " + age + ")";
    }
}
```

<details>
<summary>点击查看答案</summary>

```kotlin
// Kotlin
data class User(val name: String, val age: Int)
```

</details>

> [!INFO]
> **参考资料**
> - [Kotlin for Java Developers (官方)](https://kotlinlang.org/docs/java-to-kotlin-idioms-1.html)
> - [Kotlin 官方文档](https://kotlinlang.org/docs/home.html)
> - 本地 Demo 项目：`D:\学习\其他学习\Android\PICOProject\animation-0.13.3\`
>
> **有疑问？** 随时在对话中问我，我会用 Java 的概念给你类比讲解。

---
**上一课**: — | **下一课**: [[0002-kotlin-coroutines|第2课：Kotlin 协程基础]]