---
title: "第21课：Android 应用移植到 PICO 空间平台"
description: "掌握将现有标准 Android 应用迁移到 PICO 空间平台（PICO OS 6）的完整流程、注意事项和最佳实践。"
---

# 第21课：Android 应用移植到 PICO 空间平台

**本课目标**：掌握将现有标准 Android 应用迁移到 PICO 空间平台（PICO OS 6）的完整流程、注意事项和最佳实践。

> [!NOTE]
> **前置知识**：本课假设你已经掌握 [[0005-android-project-structure|第5课(项目结构)]] 和 [[0008-pico-sdk-architecture|第8课(SDK架构)]] 的内容。如果你是从零开始的新项目，请直接使用 [[0014-building-from-scratch|第14课(从零搭建)]] 的模板方式。

## 0. 前置条件评估

在开始移植之前，先评估现有应用：

| 问题 | 影响 |
|------|------|
| 是单 Activity 还是多 Activity？ | 单 Activity 需要拆分独立的容器 |
| 使用 Fragment 还是 Compose Navigation？ | 不能直接映射为多个空间容器 |
| 依赖哪些 Android 特有功能？ | 需要判断是否兼容空间平台 |
| 最低支持 SDK？ | 需要 ≥ 26（PICO OS 6 基线） |
| 使用 Gradle KTS 还是 Groovy？ | 推荐 KTS |
| 是否使用 Compose？ | 可能产生依赖冲突 |

> [!WARNING]
> **重要：不要直接将单 Activity 导航模型映射为多个空间容器**。Activity 在空间应用中不是屏幕容器——空间容器（WindowContainer/Stage）才是。需要先将紧耦合的屏幕拆分为独立的空间容器。

## 1. 升级 Android 构建工具链

**1 升级 Gradle 和相关插件**

PICO OS 6 开发需要 Android Studio 2025.1.x。

- 升级 Gradle → 对齐 AGP → 对齐 Kotlin
- 推荐 Kotlin 保持在 `2.0.0`（除非确认兼容性问题）
- 如果从低版本 AGP（<8.0）升级，注意 `BuildConfig`、`namespace`、R 文件行为变化

## 2. 架构评估与调整

**2 重构导航结构**

1. 识别哪些屏幕需要独立的空间容器所有权
2. 将紧耦合的屏幕解耦，使其可独立迁移
3. 在每个屏幕中添加明确的返回/关闭/退出控件
4. 去掉对手机系统返回键的依赖

## 3. 配置远程仓库

**3 添加 PICO Maven 仓库**

```groovy
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://artifact.bytedance.com/repository/Volcengine") }
    }
}
```

## 4. 注册 SDK 版本

**4 更新版本目录**

```groovy
// gradle/libs.versions.toml
[versions]
spatialBom = "0.11.7"     // 默认版本，可按需升级

[libraries]
spatial-bom = { group = "com.pico.spatial", name = "spatial-bom", version.ref = "spatialBom" }
spatial-core = { group = "com.pico.spatial.core", name = "core" }
spatial-ui-platform = { group = "com.pico.spatial.ui", name = "platform" }
spatial-ui-foundation = { group = "com.pico.spatial.ui", name = "foundation" }
spatial-ui-design = { group = "com.pico.spatial.ui", name = "design" }
spatial-ui-sense = { group = "com.pico.spatial.sense", name = "sense" }
spatial-ui-tracking = { group = "com.pico.spatial.tracking", name = "tracking" }
```

## 5. 添加依赖

**5 配置 app 模块依赖**

```groovy
dependencies {
    implementation(platform(libs.spatial.bom))
    implementation(libs.spatial.core)
    implementation(libs.spatial.ui.platform)
    implementation(libs.spatial.ui.foundation)
    implementation(libs.spatial.ui.design)
    implementation(libs.spatial.ui.sense)
    implementation(libs.spatial.ui.tracking)
}
```

## 6. 添加 Compose 依赖排除

**6 排除冲突的标准 Compose 依赖**

```groovy
configurations.all {
    resolutionStrategy {
        exclude group: 'androidx.compose.ui', module: 'ui'
        exclude group: 'androidx.compose.ui', module: 'ui-graphics'
        exclude group: 'androidx.compose.ui', module: 'ui-text'
        exclude group: 'androidx.compose.foundation', module: 'foundation'
    }
}
```

这是 PICO Spatial UI 替换标准 Compose UI 所必需的。因为 PICO 使用自己的空间 UI 组件替代了标准 Compose 的 UI 和 foundation 包。

## 7. 迁移入口到空间容器

**7 更新 AndroidManifest.xml**

将启动 Activity 配置为空间容器：

**方案 A：DefaultWindowContainer（共享空间）**

```xml
<activity android:name=".MainActivity" android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
    <meta-data android:name="pico.spatial.windowcontainer.id"
        android:value="MyAppHome" />
    <meta-data android:name="pico.spatial.windowcontainer.style"
        android:value="1" />
    <meta-data android:name="pico.spatial.windowcontainer.defaultsize"
        android:value="1080x720" />
    <meta-data android:name="pico.spatial.windowcontainer.defaultsize.unit"
        android:value="dp" />
    <meta-data android:name="pico.spatial.windowcontainer.materialbackground"
        android:value="1" />
</activity>
```

**方案 B：DefaultStage（全空间沉浸式）**

```xml
<activity android:name=".platform.LaunchActivity" android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
    <meta-data android:name="pico.spatial.stage.id"
        android:value="my_stage" />
    <meta-data android:name="pico.spatial.stage.style"
        android:value="1" />
</activity>
```

> [!WARNING]
> **注意 metadata 前缀不同**：WindowContainer 使用 `pico.spatial.windowcontainer.*`，Stage 使用 `pico.spatial.stage.*`。不要混用。

## 8. 从 Application 注册容器

**8 创建/更新 Application 类**

```kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        launch(::mainApp)  // 启动空间应用
    }
}

fun mainApp(scope: SpatialAppScope) = with(scope) {
    DefaultWindowContainer {
        PicoTheme {
            // 原有的 UI 内容迁移到这里
            HomeScreen()
        }
    }
}
```

务必在 AndroidManifest.xml 中声明此 Application 类：

```xml
<application android:name=".MyApplication" >
```

## 9. 将 UI 所有权移至空间内容

**9 从 Activity.setContent 改为空间内容**

**传统方式**（需要改造）：

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { Home() }  // ❌ 不适用于空间平台
    }
}
```

**空间方式**（目标模式）：

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // 使用 SpatialActivityDelegate 托管
        spatialDelegate.setSpatialContent()
    }
}

fun mainApp(scope: SpatialAppScope) = with(scope) {
    DefaultWindowContainer {
        PicoTheme { Home() }  // ✅ UI 在此定义
    }
}
```

## 10. 逐屏幕移植

**10 增量迁移**

1. 从启动屏幕开始——验证入口和渲染行为
2. 每次迁移一个屏幕
3. 每个被迁移的屏幕必须有明确的所有权
4. 每个屏幕必须有显式的退出/返回行为
5. 验证不依赖手机特有的导航假设

## 11. 适配 UI 和交互

**11 空间交互适配**

检查以下适配点：

- hover 行为——必须使用 `Modifier.spatialHoverEffect()`
- 焦点行为——空间中没有"焦点"概念，需要调整
- 点击目标大小——确保 ≥ 48dp
- 布局适配——确保在空间窗口中显示正常
- 标准 Material 组件——需要空间化处理

## 12. 添加高级空间能力

**12 按需启用空间特性**

在核心流程稳定后，逐步添加空间能力：

- 空间 UI 组件（Augment、Subwindow 等）
- 空间交互模式（手势、注视）
- 混合现实功能（MR、场景理解）
- 空间音频/视频
- 追踪（手势/眼球/面部）
- 机器学习功能

注意：MR 和追踪功能需要进入 Full Space 模式（Stage）。

## 13. 运行时平台保护

**13 共享 APK 的运行时保护**

如果 APK 需要在标准 Android 和空间平台都能运行：

```kotlin
if (SpatialBuild.isSpatialPlatform()) {
    // 调用空间平台 API
    DefaultWindowContainer { ... }
} else {
    // 保持标准 Android 行为
    setContent { ... }
}
```

只有确认运行时是空间平台才能调用空间 API。

## 移植完整流程一览

```
Step  1: 升级 Gradle/AGP/Kotlin
Step  2: 重构导航结构（解耦屏幕）
Step  3: 配置 Maven 仓库（Volcengine）
Step  4: 注册 SDK 版本（libs.versions.toml）
Step  5: 添加 SDK 依赖
Step  6: 排除标准 Compose 依赖 ← 关键步骤
Step  7: 更新 Manifest（容器 metadata）
Step  8: 创建 Application + mainApp()
Step  9: 将 UI 从 Activity 移至空间内容
Step 10: 逐屏幕增量迁移
Step 11: 适配 hover/焦点/交互
Step 12: 按需添加空间能力
Step 13: 添加运行时平台保护（共享 APK）
```

## 常见陷阱

| 陷阱 | 后果 | 避免方法 |
|------|------|----------|
| 直接映射单 Activity 导航到多容器 | 架构混乱 | 先解耦屏幕，再独立迁移 |
| 假设系统返回键存在 | 用户无法关闭窗口 | 显式添加返回/关闭控件 |
| 在标准 Android 上调用空间 API | 崩溃 | 使用 `SpatialBuild.isSpatialPlatform()` 保护 |
| 硬编码 SDK 版本在多个位置 | 升级困难 | 统一在 `libs.versions.toml` 管理 |
| 忘记排除 Compose 依赖 | 依赖冲突 | 在 `resolutionStrategy` 中排除 |
| 过早添加 MR/追踪功能 | 复杂度爆炸 | 核心导航稳定后再添加 |

---

**上一课**: [[0020-spatial-ui-design-guide|第20课]] | **下一课**: [[0022-dev-workflow-and-debugging|第22课]]