---
title: 第11课：Spatial Tracking — 空间追踪
description: Spatial Tracking 模块管理所有用户输入方式：手部追踪、眼部追踪、控制器输入、身体动捕等。它使用统一的 DataProvider 接口模式。
---

# Spatial Tracking — 空间追踪

Spatial Tracking 模块管理所有用户输入方式：手部追踪、眼部追踪、控制器输入、身体动捕等。它使用统一的 `DataProvider<T>` 接口模式。

> [!NOTE]
> **理解 DataProvider 模式**
> 所有追踪数据都通过 DataProvider 接口访问：注册监听器 → 获取最新数据 → 处理输入。类似后端中"消息队列 + 消费者"的模式。

## 1. 模块结构

| 包 | 数据提供者 | 数据类 | 用途 |
|---|---|---|---|
| `tracking.hand` | `HandTrackingProvider` | `HandTrackingData`, `HandPose` | 手部 26 个关节点追踪 |
| `tracking.eye` | `EyeTrackingProvider` | `EyeTrackingData`, `EyePose` | 眼球注视方向追踪 |
| `tracking.body` | `BodyTrackingProvider` | `BodyTrackingData`, `BodyPose` | 全身 24 个关节点追踪 |
| `tracking.controller` | `ControllerTrackingProvider` | `ControllerTrackingData`, `ControllerAction` | 左右手控制器输入 |
| `tracking.hmd` | `HMDTrackingProvider` | `HMDTrackingData`, `HMDPose` | 头显位置和朝向 |
| `tracking.motion` | `MotionTrackingProvider` | `MotionTrackingData` | 全身动捕附件 |

## 2. DataProvider 统一接口

```kotlin
interface DataProvider<T> {
    val latestData: T?                // 获取最新数据

    fun registerDataListener(listener: DataListener<T>): Cancellable
    // 注册数据监听，返回 Cancellable 用于取消
}

// 所有追踪类型都遵循这个接口：
HandTrackingProvider.latestData?.handPose
EyeTrackingProvider.latestData?.eyePose
HMDTrackingProvider.latestData?.hmdPose
ControllerTrackingProvider.latestData?.controllerActionData

// DataProvider 的 Flow 模式（Kotlin 协程集成）
// 除了 registerDataListener 回调，追踪数据也可以通过 Flow 订阅
// 需要在协程作用域中 collect

// 示例：在 ViewModel 中使用 flow
class TrackingViewModel : ViewModel() {
    val handDataFlow = HandTrackingProvider.dataFlow
        .catch { e -> Log.e(TAG, "追踪数据流错误", e) }
        .stateIn(viewModelScope, SharingStarted.Eagerly, null)

    val hmdPoseFlow = HMDTrackingProvider.dataFlow
        .map { it?.hmdPose }
        .stateIn(viewModelScope, SharingStarted.Eagerly, null)
}

// 在 Composable 中收集
@Composable
fun HandTrackingDisplay(viewModel: TrackingViewModel = viewModel()) {
    val handData by viewModel.handDataFlow.collectAsStateWithLifecycle()

    handData?.let { data ->
        val rightIndex = data.rightHandPose?.joints?.get(HandJoint.Type.INDEX_TIP)
        // 使用指尖位置
    }
}

// registerDataListener vs dataFlow 对比
// registerDataListener: 回调模式，适合命令式处理
// dataFlow:             响应式模式，适合与 Compose / ViewModel 集成
```

## 3. 手部追踪

双手各有 26 个关节点：

```kotlin
// 获取手部数据
val handData = HandTrackingProvider.latestData
if (handData != null) {
    val leftHand: HandPose? = handData.leftHandPose
    val rightHand: HandPose? = handData.rightHandPose

    // 获取指尖位置
    val indexTip = rightHand?.joints?.get(HandJoint.Type.INDEX_TIP)
    val thumbTip = rightHand?.joints?.get(HandJoint.Type.THUMB_TIP)

    // 每个关节有位置和旋转
    val position = indexTip?.position
    val rotation = indexTip?.rotation
}

// 订阅数据更新
val cancellable = HandTrackingProvider.registerDataListener { data ->
    val pose = data.rightHandPose
    // 每帧处理手势
}
```

## 4. 眼球追踪

```kotlin
// 获取眼动数据
val eyeData = EyeTrackingProvider.latestData
val eyePose = eyeData?.eyePose

// 获取注视方向和位置
val gazeDirection: Vector3? = eyePose?.direction
val gazeOrigin: Vector3? = eyePose?.origin

// 组合注视和交互：注视一个物体然后捏合
// 在 Compose 中通过 PICO Spatial UI 的手势系统处理
```

## 5. 控制器输入

控制器数据包含按键状态和摇杆值：

```kotlin
// 获取控制器数据
val controllerData = ControllerTrackingProvider.latestData

// 获取左右手控制器
val leftAction: ControllerAction? = controllerData?.controllerActionData?.left
val rightAction: ControllerAction? = controllerData?.controllerActionData?.right

// 按键状态
leftAction?.home     // Home 键是否按下
rightAction?.trigger // 扳机键压力值 (0-1)
rightAction?.grab    // 握持键是否按下

// 摇杆
val thumbstick: ThumbstickValue? = rightAction?.thumbstick
thumbstick?.x  // 水平 (-1 到 1)
thumbstick?.y  // 垂直 (-1 到 1)

// 控制器位置
val rightPose: ControllerPose? = controllerData?.rightControllerPose
rightPose?.position  // 控制器在空间中的位置
rightPose?.rotation  // 控制器的旋转
```

## 6. HMD 头显追踪

```kotlin
// spatialmesh Demo 中使用 HMD 追踪实现"注视瞄准"
class ShooterComponent : Component() {
    var shootCooldown = 0f

    // 获取 HMD 的头部位姿，用于计算射击方向
    val hmdPose: HMDPose? = HMDTrackingProvider.latestData?.hmdPose

    // 获取注视射线
    val position = hmdPose?.position     // 头部位置（射击起点）
    val rotation = hmdPose?.rotation     // 头部旋转（射击方向）
}
```

## 7. 全身动捕 + MotionTrackingProvider 深度 API

```kotlin
// 身体追踪 - 24 个关节点
val bodyData = BodyTrackingProvider.latestData
val bodyPose: BodyPose? = bodyData?.bodyPose

// 获取特定关节
val head = bodyPose?.getJoint(BodyJoint.Type.HEAD)
val leftElbow = bodyPose?.getJoint(BodyJoint.Type.LEFT_ELBOW)
val rightFoot = bodyPose?.getJoint(BodyJoint.Type.RIGHT_FOOT)

// 动捕附件追踪
val motionData = MotionTrackingProvider.latestData
motionData?.trackers?.forEach { tracker ->
    tracker.pose      // 动捕设备的位置和旋转
    tracker.status    // 连接状态
    tracker.battery   // 电池信息
}
```

### 7.1 监听手柄电池与连接状态

```kotlin
import com.pico.spatial.tracking.motion.MotionTrackingProvider
import com.pico.spatial.tracking.TrackingNode

// 监听手柄电池电量
MotionTrackingProvider.listenBatteryLevel(
    node = TrackingNode.RIGHT_HAND
) { level: Int ->
    // level: 0-100
    when {
        level < 10 -> showUrgentBatteryWarning()
        level < 20 -> showLowBatteryIndicator()
    }
}

// 监听连接状态
MotionTrackingProvider.listenConnectionState(
    node = TrackingNode.RIGHT_HAND
) { connected: Boolean ->
    if (!connected) {
        showControllerDisconnectedMessage()
        pauseGame()
    } else {
        resumeGame()
    }
}

// 监听左/右手同时
MotionTrackingProvider.listenConnectionState(
    node = TrackingNode.LEFT_HAND
) { connected -> /* ... */ }

// 释放监听
MotionTrackingProvider.unregisterAll()
```

### 7.2 监听按键事件

```kotlin
// 监听手柄按键事件（不只是状态轮询）
MotionTrackingProvider.listenKeyEvent(
    node = TrackingNode.RIGHT_HAND
) { event: MotionTrackingProvider.KeyEvent ->
    when (event.key) {
        MotionTrackingProvider.Key.TRIGGER -> {
            // 扳机键 — 射击/确认
            if (event.isPressed) onTriggerPressed()
        }
        MotionTrackingProvider.Key.GRIP -> {
            // 握持键 — 抓取物体
            if (event.isPressed) onGripPressed()
        }
        MotionTrackingProvider.Key.MENU -> {
            // Menu 键 — 打开菜单
            toggleMenu()
        }
        MotionTrackingProvider.Key.JOYSTICK -> {
            // 摇杆 — 移动/视角
            handleJoystick(event.axisX, event.axisY)
        }
        MotionTrackingProvider.Key.A_BUTTON -> {
            // A 键（右手）/ X 键（左手）
        }
        MotionTrackingProvider.Key.B_BUTTON -> {
            // B 键（右手）/ Y 键（左手）
        }
    }
}

// 与 ControllerTrackingProvider 的对比
// ControllerTrackingProvider.latestData → 每帧轮询当前按键状态
// MotionTrackingProvider.listenKeyEvent → 按键事件回调（按下/释放时触发一次）
```

### 7.3 组合使用：手势识别示例

```kotlin
// 结合手部追踪和按键事件做交互切换
class ShooterComponent : Component() {
    var shootCooldown = 0f
    private var isHandTrackingActive = false

    fun setup() {
        // 1. 启动手部追踪
        HandTrackingProvider.registerDataListener { data ->
            if (!isHandTrackingActive) return@registerDataListener

            val rightHand = data.rightHandPose ?: return@registerDataListener
            val indexTip = rightHand.joints[HandJoint.Type.INDEX_TIP]
            val thumbTip = rightHand.joints[HandJoint.Type.THUMB_TIP]

            // 检测捏合手势（指尖距离 < 2cm）
            val distance = (indexTip.position - thumbTip.position).length()
            if (distance < 0.02f) {
                onPinchDetected(indexTip.position)
            }
        }

        // 2. 同时监听控制器按键（支持交互方式切换）
        MotionTrackingProvider.listenKeyEvent(
            node = TrackingNode.RIGHT_HAND
        ) { event ->
            when (event.key) {
                MotionTrackingProvider.Key.TRIGGER -> {
                    if (event.isPressed) onControllerShoot()
                }
                MotionTrackingProvider.Key.GRIP -> {
                    if (event.isPressed) toggleHandTrackingMode()
                }
            }
        }

        // 3. 监听连接状态，自动切换交互方式
        MotionTrackingProvider.listenConnectionState(
            node = TrackingNode.RIGHT_HAND
        ) { connected ->
            isHandTrackingActive = !connected
            // 没连手柄 → 用手；连了手柄 → 用控制器
            showInteractionModeHint(
                if (connected) "使用控制器" else "使用手部追踪"
            )
        }
    }
}
```

## 8. 交互方式选择指南

| 交互方式 | 适合场景 | PICO 设备支持 |
|---|---|---|
| **眼动 + 手部捏合** | 菜单选择、远距离交互（最常用） | ✅ PICO 4/4U/Pro |
| **手部直接触摸** | 近距离 UI（近场手势） | ✅ 所有型号 |
| **控制器** | 精准操作、游戏射击 | ✅ 支持控制器型号 |
| **全身动捕** | 全身虚拟化身、运动类应用 | ✅ 需要动捕附件 |

## 9. 在 Compose UI 中集成追踪

```kotlin
// PICO Spatial UI 会自动处理眼动+手部交互
// 你只需要使用标准的 Modifier

@Composable
fun MyButton() {
    Button(
        onClick = { /* 眼动注视按钮 + 捏合手指触发 */ }
    ) {
        Text("确认")
    }
}

// 对于自定义交互，使用手势 API
val scope = rememberCoroutineScope()
Modifier.detectSpatialDragGesture { change, offset ->
    // 处理空间拖拽
}

// 手柄震动反馈
import com.pico.spatial.ui.foundation.haptic.controllerHapticFeedback

@Composable
fun FeedbackButton() {
    val haptic = rememberSpatialHapticFeedback()

    Button(onClick = {
        // 短促震动（按钮点击反馈）
        haptic.controllerHapticFeedback(
            amplitude = 0.8f,    // 0.0 ~ 1.0
            durationMs = 50      // 毫秒
        )
    }) {
        Text("震动按钮")
    }
}

// 不同场景推荐震动参数
// 按钮点击:   amplitude=0.5f, duration=30ms
// 拾取物体:   amplitude=0.6f, duration=80ms
// 确认操作:   amplitude=1.0f, duration=100ms
// 错误提示:   amplitude=0.8f, duration=150ms (两次短震)
// 连续反馈:   repeat 模式，每次 amplitude=0.3f, duration=10ms
```

## 10. 上肢可见性控制

当使用手部追踪时，系统默认会渲染虚拟手臂（从肩膀到手的骨骼）。你可以控制其显示行为：

```kotlin
// 控制上肢渲染模式
import com.pico.spatial.core.ecs.UpperLimbVisibilityComponent

entity.components.set(UpperLimbVisibilityComponent(
    mode = UpperLimbVisibilityMode.FULL    // 完整手臂显示
))

// 可用的渲染模式
UpperLimbVisibilityMode.FULL          // 显示完整手臂（默认）
UpperLimbVisibilityMode.ELBOW_ONLY    // 只显示肘部以下
UpperLimbVisibilityMode.HAND_ONLY     // 只显示手部
UpperLimbVisibilityMode.NONE          // 完全隐藏手臂

// 动态切换示例：根据应用场景隐藏/显示手臂
class ArmVisibilityController {
    private var currentMode = UpperLimbVisibilityMode.FULL

    fun enterUITask() {
        // 做 UI 交互时只显示手部
        currentMode = UpperLimbVisibilityMode.HAND_ONLY
    }

    fun enterFullBodyExperience() {
        // 全身体验时显示完整手臂
        currentMode = UpperLimbVisibilityMode.FULL
    }
}

// 适用场景建议
// FULL:      社交应用、全身 Avatar、沉浸式游戏
// HAND_ONLY: 生产力工具、UI 密集应用
// NONE:      需要最大沉浸感（恐怖游戏、过场动画）
```

## 11. 快速练习

1. 在手部追踪开启时，如何检测用户是否在做"捏合"手势（拇指尖和食指尖靠近）？写出关键的关节判断逻辑
2. 在 `spatialmesh-0.13.3` 的 `ShooterComponent.kt` 中，找出它使用了哪个 TrackingProvider 来计算射击方向——为什么选择这个而不是其他？
3. 实现一个交互切换逻辑：当控制器连接时使用控制器输入，断开时自动切换到**眼动+手部捏合**交互。涉及哪几个 TrackingProvider？

<details>
  <summary>点击查看答案</summary>
  <ol>
    <li>获取 <code>HandTrackingProvider.latestData</code> → 取 <code>rightHandPose.joints[HandJoint.Type.INDEX_TIP]</code> 和 <code>THUMB_TIP</code> → 计算 <code>(indexTip.position - thumbTip.position).length()</code> → 小于阈值（约 0.02m）时判定为捏合</li>
    <li><code>ShooterComponent.kt</code> 使用 <code>HMDTrackingProvider.latestData?.hmdPose</code> 获取头部位置和旋转作为射击方向和起点——因为射击游戏使用"注视瞄准"（gaze-based aiming），玩家看哪就打哪，而不是用手柄瞄准</li>
    <li>涉及 3 个：<code>HandTrackingProvider</code>（手部关节数据）、<code>EyeTrackingProvider</code>（注视方向）、<code>MotionTrackingProvider</code>（监听连接状态和按键事件）。用 <code>listenConnectionState</code> 检测控制器连接变化，切换激活不同的 Provider</li>
  </ol>
</details>

> [!INFO]
> **参考资料**
> - 本地 API 文档：`pico-sdk-0.13.3-mirror/spatial-api/0.13.3/trackingpack/tracking/`
> - 官方 SDK 文档：`downloads/spatial-sdk/markdown/065-tracking-overview.md`
> - Demo 参考：`PICOProject/spatialmesh-0.13.3/ecs/components/ShooterComponent.kt`

---
**上一课**: [[0010-spatial-sense|第10课]] | **下一课**: [[0012-spatial-ui|第12课]]