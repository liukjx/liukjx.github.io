---
title: "补充课4：Android 权限系统与 PICO 空间权限"
description: "Android 权限系统演变、运行时权限标准流程、PICO 空间权限体系以及 Android 14/15 权限新变化"
---

Android 的权限系统经历了多次演变——从安装时授权到运行时授权，再到 Android 14/15 新增的**运行时权限撤回**和**部分媒体访问**。PICO 空间 SDK 在此基础上增加了自己的**空间权限体系**，用于控制对 AR 核心功能的访问。

> [!NOTE]
> **核心认知**
> 权限不是"清单里声明就能用"的——Android 10+ 对敏感权限要求在代码中运行时请求，PICO 的某些空间权限同样如此。理解权限的**声明 → 请求 → 检查 → 处理拒绝**完整链路是开发的基础。

## 1. Android 权限分类

| 类型 | 行为 | 举例 |
|------|------|------|
| **普通权限 (Normal)** | 清单声明即授权，用户无感知 | `INTERNET`、`POST_NOTIFICATIONS` |
| **运行时权限 (Dangerous)** | 清单声明 + 代码中请求，用户弹窗确认 | `CAMERA`、`RECORD_AUDIO`、`ACCESS_FINE_LOCATION` |
| **特殊权限 (Special)** | 需要从系统设置页面授予 | `SYSTEM_ALERT_WINDOW`、`REQUEST_INSTALL_PACKAGES` |
| **PICO 空间权限** | 通过 SDK API 请求，PICO 系统处理 | `SPATIAL_ANCHOR`、`SPATIAL_MESH`、`HAND_TRACKING` |

> [!TIP]
> **PICO 声明提醒**
> 即使 PICO 空间权限由 SDK 处理，你仍然需要在 `AndroidManifest.xml` 中声明 `<uses-permission>`——这是 Android 系统的硬性要求。

## 2. 运行时权限标准流程

PICO Demo 中 `spatialml/SuperResolutionSpatialView.kt` 展示了完整的运行时权限流程：

```kotlin
// SuperResolutionSpatialView.kt
@Composable
fun SuperResolutionSpatialView(
    srViewModel: SRViewModel,
    context: Context = LocalContext.current
) {
    // 1. 检查权限状态
    val hasCameraPermission = remember {
        ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED
    }

    // 2. 注册权限结果回调
    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            srViewModel.init(context, 4.0f)  // 授权后初始化
        } else {
            // 用户拒绝——处理降级逻辑
            Log.w(TAG, "Camera permission denied")
        }
    }

    // 3. 触发请求（在适当时机）
    LaunchedEffect(hasCameraPermission) {
        if (!hasCameraPermission && appMode == MR_CONFIRMED) {
            launcher.launch(Manifest.permission.CAMERA)
        } else {
            srViewModel.init(context, 4.0f)
        }
    }
}
```

### 关键 API 说明

| API | 作用 |
|-----|------|
| `ContextCompat.checkSelfPermission()` | 检查当前是否已有权限 |
| `ActivityResultContracts.RequestPermission()` | 请求单个权限的合约 |
| `ActivityResultContracts.RequestMultiplePermissions()` | 请求多个权限的合约 |
| `rememberLauncherForActivityResult()` | Compose 中注册权限回调 |

> [!WARNING]
> **关键原则：权限请求必须在用户触发的上下文中**
> 你不能在 Composable 渲染时直接调用 `launcher.launch()`——Android 要求权限弹窗必须由用户操作触发（按钮点击等），或者在 PICO 的场景中，在进入 MR 模式时用 `LaunchedEffect` 触发（如上例）。如果时机不对，`launch()` 调用会被静默忽略。

## 3. 多个权限处理

某些功能需要同时请求多个权限。使用 `RequestMultiplePermissions`：

```kotlin
// 请求多个权限
val multiplePermissionLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.RequestMultiplePermissions()
) { permissions: Map<String, Boolean> ->
    val allGranted = permissions.values.all { it }
    if (allGranted) {
        startRecording()  // 所有权限都授予
    } else {
        // 检查哪些被拒绝
        permissions.forEach { (perm, granted) ->
            if (!granted) Log.w(TAG, "$perm 被拒绝")
        }
    }
}

// 触发请求
multiplePermissionLauncher.launch(
    arrayOf(
        Manifest.permission.CAMERA,
        Manifest.permission.RECORD_AUDIO
    )
)
```

## 4. PICO 空间权限体系

PICO Spatial SDK 定义了自己的权限集，控制对空间感知功能的访问。与标准 Android 权限不同，这些权限由 PICO 系统服务管理，通过 SDK 的 API 触发请求。

| 权限常量 | 控制的功能 | SDK 触发方式 |
|----------|-----------|-------------|
| `com.pico.permission.SPATIAL_ANCHOR` | 创建/持久化世界锚点 | 调用 `WorldAnchor` 相关 API 时自动触发 |
| `com.pico.permission.SPATIAL_MESH` | 扫描空间网格 | 启动 `MeshTrackingManager` 时自动触发 |
| `com.pico.permission.SPATIAL_PLANE` | 检测平面 | 启动 `PlaneTrackingManager` 时自动触发 |
| `com.pico.permission.HAND_TRACKING` | 手部追踪 | 启动 `HandTrackingProvider` 时自动触发 |
| `com.pico.permission.EYE_TRACKING` | 眼球追踪 | 启动 `EyeTrackingProvider` 时自动触发 |
| `com.pico.permission.FACE_TRACKING` | 面部追踪 | 启动 `FaceTrackingProvider` 时自动触发 |
| `com.pico.permission.BODY_TRACKING` | 身体追踪 | 启动 `BodyTrackingProvider` 时自动触发 |

> [!NOTE]
> **PICO 权限不需要 ActivityResultContracts**
> 与标准 Android 运行时权限不同，PICO 空间权限不需要（也不支持）使用 `ActivityResultContracts.RequestPermission()`。PICO 系统会在 SDK 首次尝试使用相关功能时自动弹出授权对话框。你的代码只需要关心：**在清单中声明权限**，和**检查权限是否已授予**。

### 完整的 PICO 权限处理

结合前面的知识，一个使用 `PlaneTrackingManager` 并处理权限的正确方式：

```kotlin
// Step 1: AndroidManifest.xml 中声明
// <uses-permission android:name="com.pico.permission.SPATIAL_PLANE" />
// <uses-permission android:name="com.pico.permission.SPATIAL_ANCHOR" />

// Step 2: 使用 SDK 功能，权限由 SDK 内部处理
class ARSceneManager(private val content: SpatialViewContent) {

    private val planeTrackingManager = PlaneTrackingManager()
    private val worldTrackingManager = WorldTrackingManager()

    fun startPlaneDetection() {
        // SDK 内部会检查并请求 SPATIAL_PLANE 权限
        // 如果用户拒绝，onError 回调会收到 PermissionDenied 错误
        planeTrackingManager.start(
            onPlaneDetected = { plane -> addPlaneToScene(plane) },
            onError = { error ->
                when (error) {
                    is PermissionDenied -> {
                        // 提示用户去设置中授权
                        showPermissionSettingsDialog()
                    }
                    else -> Log.e(TAG, "Plane error: $error")
                }
            }
        )
    }
}
```

## 5. Android 14/15 权限新变化

如果你的应用要上架 Google Play 或被 sideload 到较新的设备上，这些变化需要注意：

| Android 版本 | 变化 | 影响 |
|-------------|------|------|
| Android 14 (API 34) | 运行时权限可被系统自动撤回（如果用户长时间不使用应用） | 每次使用敏感权限前都应检查 `checkSelfPermission` |
| Android 14 (API 34) | 后台媒体访问限制 | `ACCESS_BACKGROUND_LOCATION` 弹窗更严格 |
| Android 15 (API 35) | 权限撤回通知 | 用户会收到"XX 应用的 XX 权限已被撤回"的通知 |
| Android 15 (API 35) | 屏幕录制权限细化 | `MEDIA_PROJECTION` 需要更详细的用户确认 |

## 6. 权限最佳实践

```kotlin
// PICO 空间应用权限检查封装
class PermissionManager(private val context: Context) {

    // 标准 Android 权限（需要 ActivityResultContracts）
    fun checkStandardPermission(permission: String): Boolean =
        ContextCompat.checkSelfPermission(context, permission)
            == PackageManager.PERMISSION_GRANTED

    // PICO 空间权限——SDK 内部处理
    // 只需要在 Manifest 中声明即可

    // 显示权限说明（如果用户第一次拒绝）
    fun showPermissionRationale(
        activity: Activity,
        permission: String,
        onShowRationale: () -> Unit
    ) {
        if (ActivityCompat.shouldShowRequestPermissionRationale(
                activity, permission
            )
        ) {
            onShowRationale()  // 显示为什么要这个权限
        }
    }

    // 引导用户去设置页面（如果用户选择了"不再询问"）
    fun openAppSettings() {
        Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
            data = Uri.fromParts("package", context.packageName, null)
            context.startActivity(this)
        }
    }
}
```

## 7. 权限处理速查表

| 场景 | 处理方式 |
|------|---------|
| 普通权限 (INTERNET 等) | 仅清单声明 |
| 运行时权限 (CAMERA 等) | 清单 + ActivityResultContracts.RequestPermission |
| PICO 空间权限 | 清单 + SDK 内部处理 + 错误回调中处理拒绝 |
| 用户第一次拒绝 | 用 `shouldShowRequestPermissionRationale()` 判断，显示说明后再次请求 |
| 用户选择"不再询问" | 只能引导去系统设置页面 |
| Android 14+ 自动撤回 | 每次使用前 `checkSelfPermission()`，不要缓存权限状态 |

## 快速练习

在 `PICOProject/spatialml-0.13.3` 中：

1. 找到 `SuperResolutionSpatialView.kt` 中完整的权限请求流程
2. 检查 `spatialvideo-0.13.3` 的 AndroidManifest.xml 中声明了哪些权限
3. 为什么 `spatialmesh` 项目没有在 Manifest 中声明 `SPATIAL_MESH` 权限也能正常工作？（提示：插件模板的默认配置）

<details style="cursor: pointer;">
  <summary>点击查看提示</summary>
  <ol>
    <li><code>SuperResolutionSpatialView.kt:108-126</code> — checkSelfPermission + rememberLauncherForActivityResult + LaunchedEffect 三段式</li>
    <li><code>spatialvideo-0.13.3/app/src/main/AndroidManifest.xml</code> — 仅声明了 <code>INTERNET</code>（用于视频流加载）</li>
    <li>PICO 模板项目可能已经在 <code>AndroidManifest.xml</code> 中通过插件/gradle 自动注入了空间权限，或者 PICO 系统默认授予了某些权限。实际开发中<strong>始终应显式声明</strong>你需要的权限。</li>
  </ol>
</details>

> [!INFO]
> **参考资料**
> - PICO Demo 参考：`spatialml-0.13.3/SuperResolutionApp/.../view/SuperResolutionSpatialView.kt`
> - 权限最佳实践 Demo：`PICOProject/spatialmesh-0.13.3/` 中的 Anchor 使用
> - [Android 权限请求官方指南](https://developer.android.com/training/permissions/requesting)
> - [Android 14 权限行为变更](https://developer.android.com/about/versions/14/changes/behavior-changes-all)

---
**上一课**: [[s03-coroutine-exception-handling|第3课：协程异常处理]] | **下一课**: [[s05-data-persistence|第5课：数据持久化]]