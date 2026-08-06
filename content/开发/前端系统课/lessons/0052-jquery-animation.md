---
title: 第52课：jQuery 动画
description: jQuery 动画方法（show/hide、fadeIn/fadeOut、slideUp/slideDown、animate）、动画队列与控制
date: 2026-08-06
tags:
  - jQuery
  - 动画
  - animate
---

# 第52课：jQuery 动画

## 学习目标

- 掌握 `show/hide/toggle` 显示隐藏动画
- 掌握 `fadeIn/fadeOut/fadeToggle` 淡入淡出动画
- 掌握 `slideUp/slideDown/slideToggle` 滑动动画
- 深入理解 `animate()` 自定义动画的用法
- 理解动画队列机制和 `stop()` 的控制方法

---

## 一、基础显示与隐藏

`show()`、`hide()` 和 `toggle()` 是最基本的显示/隐藏动画方法。

```html
<button class="hide">隐藏</button>
<button class="show">显示</button>
<button class="toggle">切换</button>

<div class="box">box</div>
```

```javascript
$(function() {
  // 隐藏（带动画效果）
  $('.hide').click(function() {
    $('.box').hide('slow', function() {
      console.log('动画执行完成')
    })
  })

  // 显示
  $('.show').click(function() {
    $('.box').show('fast', function() {
      console.log('动画执行完成')
    })
  })

  // 切换显示/隐藏
  $('.toggle').click(function() {
    $('.box').toggle({
      duration: 3000,
      complete: function() {
        console.log('动画执行完成')
      }
    })
  })
})
```

### 参数形式

| 参数形式 | 示例 | 说明 |
|---------|------|------|
| 无需参数 | `hide()` | 立即隐藏，无动画 |
| 速度字符串 | `hide('slow')` | 预定义速度：`slow`、`fast` |
| 毫秒数 | `hide(2000)` | 以毫秒为单位指定时长 |
| 对象参数 | `hide({ duration: 2000, complete: fn })` | 完整的配置对象 |

---

## 二、淡入淡出动画

| 方法 | 说明 |
|------|------|
| `fadeIn()` | 淡入（逐渐显示） |
| `fadeOut()` | 淡出（逐渐隐藏） |
| `fadeToggle()` | 切换淡入/淡出 |
| `fadeTo()` | 淡出到指定透明度 |

```javascript
// 淡入
$('.box').fadeIn('slow')

// 淡出
$('.box').fadeOut(1000)

// 切换
$('.box').fadeToggle()

// 淡出到指定透明度（0.5 = 50% 透明度）
$('.box').fadeTo(1000, 0.5)
```

---

## 三、滑动动画

| 方法 | 说明 |
|------|------|
| `slideUp()` | 向上收缩（隐藏） |
| `slideDown()` | 向下展开（显示） |
| `slideToggle()` | 切换收缩/展开 |

```javascript
// 向上收缩
$('.box').slideUp('slow')

// 向下展开
$('.box').slideDown(1000)

// 切换
$('.box').slideToggle({
  duration: 2000,
  easing: 'swing'
})
```

---

## 四、自定义动画 animate()

`animate()` 是 jQuery 中最强大的动画方法，可以实现任意 CSS 属性的过渡动画。

### 4.1 基础语法

```javascript
animate(properties [, duration] [, easing] [, complete])
animate(properties [, options])
```

### 4.2 参数说明

| 参数 | 说明 |
|------|------|
| `properties` | 动画要改变的 CSS 属性对象 |
| `duration` | 动画持续时间（毫秒或 `slow`/`fast`） |
| `easing` | 缓动函数（`swing` 或 `linear`） |
| `complete` | 动画完成后的回调函数 |

### 4.3 使用示例

```javascript
$(function() {
  var $box = $('.box')

  // 隐藏动画
  $('.hide').click(function() {
    $box.animate({
      height: 0,     // 100px -> 0px
      width: 0,      // 200px -> 0px
      opacity: 0     // 1 -> 0
    }, 2000, 'swing', function() {
      console.log('动画执行完毕')
    })
  })

  // 显示动画
  $('.show').click(function() {
    $box.animate({
      height: 100,
      width: 200,
      opacity: 1
    }, function() {
      console.log('动画执行完毕')
    })
  })
})
```

### 4.4 对象参数形式

```javascript
$('.box').animate({
  height: 100,
  width: 200,
  opacity: 1
}, {
  duration: 'slow',    // 持续时间
  easing: 'swing',      // 缓动函数
  complete: function() {  // 完成回调
    console.log('动画执行完毕')
  },
  step: function(now, fx) {  // 每一步的回调
    console.log(fx.prop + ': ' + now)
  }
})
```

### 4.5 可动画的 CSS 属性

| 类别 | 属性 |
|------|------|
| 尺寸 | `width`、`height`、`padding`、`margin` |
| 位置 | `top`、`left`、`right`、`bottom` |
| 边框 | `borderWidth` |
| 字体 | `fontSize`、`letterSpacing` |
| 透明 | `opacity` |
| 颜色 | `color`、`backgroundColor`（需插件支持） |

---

## 五、动画队列

jQuery 的动画是**排队执行**的。当在一个元素上连续调用多个动画时，它们会依次加入动画队列（fx 队列），按顺序执行。

```javascript
$(function() {
  var $box = $('.box')

  $('.start').click(function() {
    // 四个动画依次执行（排队）
    $box.animate({ top: 100 }, 5000)   // 1. 向下移动
    $box.animate({ left: 100 }, 5000)  // 2. 向右移动
    $box.animate({ top: 0 }, 5000)     // 3. 向上移动
    $box.animate({ left: 0 }, 5000)    // 4. 向左移动
  })

  // 查看动画队列
  $('.queue').click(function() {
    console.log($box.queue())  // 查看 fx 动画队列
  })
})
```

---

## 六、停止动画 stop()

`stop()` 用于控制动画的执行。

```javascript
// stop() 的语法
stop([clearQueue] [, jumpToEnd])

// 参数说明：
// clearQueue: 是否清空动画队列（默认为 false）
// jumpToEnd:  是否立即跳到动画的最终状态（默认为 false）
```

| 调用方式 | 效果 |
|---------|------|
| `stop()` | 停止当前动画，执行下一个排队的动画 |
| `stop(true)` | 清空动画队列，停止所有动画 |
| `stop(true, true)` | 清空队列，并立即完成当前动画（跳到最终状态） |

```javascript
$('.stop').click(function() {
  // 默认：只停止当前执行的动画，后续动画继续执行
  $box.stop()

  // 清空动画队列（所有排队的动画都不执行了）
  $box.stop(true)

  // 清空队列 + 立即完成当前动画
  $box.stop(true, true)
})
```

> [!TIP] stop() 的使用场景
> 在鼠标移入移出的动画中（如导航下拉菜单），如果不使用 `stop()` 清除队列，快速多次触发会导致动画排队执行很久。通常使用 `stop(true)` 来避免这种问题。

---

## 七、案例：侧边栏广告

利用动画实现侧边栏广告的隐藏效果：

```javascript
$(function() {
  // 点击关闭按钮，侧边栏向上滑出并隐藏
  $('.close-btn').on('click', function() {
    $('.sidebar-ad').slideUp(1000, function() {
      // 动画完成后从 DOM 中移除
      $(this).remove()
    })
  })
})
```

---

## 自测问题

<details>
<summary>1. animate() 支持哪些 CSS 属性？不支持哪些？</summary>

支持数值类型的 CSS 属性：width、height、top、left、opacity、padding、margin、fontSize 等。不支持非数值属性：display、background-color（默认不支持，需插件）、transform 等。颜色动画需要 jQuery Color 插件。
</details>

<details>
<summary>2. 什么是 jQuery 的动画队列？</summary>

当在一个元素上连续调用多个动画方法时，它们会被依次加入一个名为 "fx" 的队列中，按照先进先出的顺序逐个执行。前面的动画完成后才会开始下一个。
</details>

<details>
<summary>3. stop(true, true) 和 stop() 有什么区别？</summary>

`stop()` 只停止当前正在执行的动画，动画队列中后续的动画继续执行。`stop(true)` 清空整个动画队列，停止所有排队的动画。`stop(true, true)` 清空队列的同时，立即将当前动画跳到最终状态。
</details>

<details>
<summary>4. show/hide 与 fadeIn/fadeOut/slideUp 动画的区别是什么？</summary>

`show/hide` 同时改变元素的宽、高和透明度；`fadeIn/fadeOut` 只改变透明度；`slideUp/slideDown` 只改变高度。可根据需要选择合适的效果。
</details>