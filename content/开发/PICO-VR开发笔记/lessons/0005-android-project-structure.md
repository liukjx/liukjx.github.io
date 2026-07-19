---
title: "第5课：Android 项目结构与 Gradle 构建"
description: 学习 Android 项目的目录结构、Gradle 构建配置、AndroidManifest.xml 以及 PICO SDK 特有的构建设置。
---

# Android 项目结构与 Gradle 构建

作为 Java 后端开发者，你对 Gradle/Maven 构建不陌生。但 Android 项目的构建与后端项目有多项关键差异：Android Gradle Plugin、NDK、资源系统、Manifest 声明等。

> [!NOTE]
> **新概念提醒**
> Android 项目 = 标准 Kotlin/Java 代码 + Android 特定组件（Activity、资源、Manifest） + 针对 arm64 的交叉编译。

## 1. Android 项目的目录结构

以 PICO Demo 项目 `animation-0.13.3` 为例：

```
animation-0.13.3/
├── build.gradle.kts                 # 1️⃣ 项目级构建配置
├── settings.gradle.kts              # 2️⃣ 项目设置（仓库、模块）
├── gradle.properties                # 3️⃣ Gradle 属性
├── gradle/
│   └── libs.versions.toml           # 4️⃣ 版本目录（推荐方式）
├── gradlew                          # 5️⃣ Gradle Wrapper (Linux/Mac)
├── gradlew.bat                      # 6️⃣ Gradle Wrapper (Windows)
└── app/                             # 7️⃣ 应用模块
    ├── build.gradle.kts             # 8️⃣ 模块级构建配置
    └── src/
        ├── main/
        │   ├── AndroidManifest.xml   # 9️⃣ 应用清单
        │   ├── java/                 # Kotlin/Java 源文件
        │   ├── res/                  # 资源文件
        │   └── assets/               # 原生资源
        └── test/                     # 单元测试
```

## 2. settings.gradle.kts — 项目入口

PICO Demo 的 settings.gradle.kts（以 animation 为例）：

```kotlin
pluginManagement {
    repositories {
        google { content { includeGroupByRegex("com\\.android.*") } }
        mavenCentral()
        gradlePluginPortal()
        maven { url = uri("https://artifact.bytedance.com/repository/Volcengine") }
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://artifact.bytedance.com/repository/Volcengine") }
    }
}

rootProject.name = "Animation"
include(":app")           // 引用 app 模块
```

> [!TIP]
> **注意 PICO 特有的 Maven 仓库**
> `https://artifact.bytedance.com/repository/Volcengine` — 这是字节跳动的 Maven 仓库，PICO Spatial SDK 托管在此。你的项目也必须添加这个仓库才能引入 SDK。

## 3. libs.versions.toml — 版本目录

这是 Gradle 7+ 推荐的依赖管理方式，取代了传统的 `ext` 块。PICO 项目使用它来统一管理所有依赖版本：

```toml
[versions]
spatial-bom = "0.13.3"            # PICO SDK BOM 版本
agp = "8.7.3"                     # Android Gradle Plugin
kotlin = "2.1.0"                  # Kotlin 版本
compose-bom = "2024.12.01"        # Compose BOM
lifecycle = "2.8.7"               # Lifecycle 组件
activity-compose = "1.9.3"

[libraries]
# PICO Spatial SDK（BOM 管理版本）
spatial-bom = { group = "com.pico.spatial", name = "spatial-bom", version.ref = "spatial-bom" }
spatial-core = { group = "com.pico.spatial", name = "spatial-core" }
spatial-foundation = { group = "com.pico.spatial", name = "spatial-foundation" }
spatial-tracking = { group = "com.pico.spatial", name = "spatial-tracking" }
spatial-sense = { group = "com.pico.spatial", name = "spatial-sense" }
spatial-ui-foundation = { group = "com.pico.spatial.ui", name = "spatial-ui-foundation" }
spatial-ui-platform = { group = "com.pico.spatial.ui", name = "spatial-ui-platform" }
spatial-ui-design = { group = "com.pico.spatial.ui", name = "spatial-ui-design" }

# AndroidX
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "core-ktx" }
lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx" }
activity-compose = { group = "androidx.activity", name = "activity-compose" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
compose-compiler = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
```

> [!WARNING]
> **BOM 的重要性**
> PICO SDK 使用 BOM（Bill of Materials）统一版本。你只需要在 `spatial-bom` 指定一个版本号，所有 SDK 模块会自动对齐版本，不会出现依赖冲突。

## 4. app/build.gradle.kts — 模块构建配置

```kotlin
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.compose.compiler)
}

android {
    namespace = "com.pico.spatial.sample.animation"
    compileSdk = 35                    // 使用 Android 35 SDK 编译

    defaultConfig {
        applicationId = "com.pico.spatial.sample.animation"
        minSdk = 26                    // 最低支持 Android 8.0
        targetSdk = 35                 // 目标 SDK 版本
        versionCode = 1
        versionName = libs.versions.spatialBom.get()
        ndk { abiFilters.add("arm64-v8a") }  // 仅编译 arm64 架构
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions { jvmTarget = "11" }
    buildFeatures { compose = true }   // 启用 Jetpack Compose
    // 不压缩 3D 模型文件
    androidResources { noCompress += listOf(".usdz", ".glb") }
}

dependencies {
    // PICO Spatial SDK（BOM 版本自动对齐）
    implementation(platform(libs.spatial.bom))
    implementation(libs.spatial.core)
    implementation(libs.spatial.foundation)
    implementation(libs.spatial.tracking)
    implementation(libs.spatial.sense)
    implementation(libs.spatial.ui.foundation)
    implementation(libs.spatial.ui.platform)
    implementation(libs.spatial.ui.design)

    // AndroidX
    implementation(libs.androidx.core.ktx)
    implementation(libs.lifecycle.runtime.ktx)
    implementation(libs.activity.compose)
    // ...
}
```

### 关键配置说明

| 配置项 | 值 | 含义 |
| --- | --- | --- |
| `compileSdk` | 35 | 编译使用的 Android API 版本（最新） |
| `minSdk` | 26 | 最低支持 Android 8.0 (Oreo) |
| `abiFilters` | "arm64-v8a" | PICO 设备是 arm64 架构 |
| `noCompress` | ".usdz", ".glb" | 3D 模型文件不压缩 |
| `compose = true` | — | 启用 Jetpack Compose |
| `jvmTarget` | "11" | Java 11 字节码 |

> [!NOTE]
> **Java 开发者常见问题**
> `compileSdk` ≠ `minSdk` ≠ `targetSdk`。compileSdk 是你编译时能用的 API 版本；minSdk 是最低兼容版本；targetSdk 表示你已在哪个版本上做过充分测试。

## 5. AndroidManifest.xml

PICO 应用的 Manifest 有一些独特的配置：

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:name=".platform.SpatialApplication"
        android:allowBackup="true"
        android:label="Animation"
        android:supportsRtl="true"
        android:theme="@style/Theme.Pico">

        <!-- PICO 窗口容器元数据 -->
        <meta-data
            android:name="pico.spatial.windowcontainer.id"
            android:value="mainWindowContainer"/>

        <!-- LaunchActivity 是启动入口 -->
        <activity
            android:name=".platform.LaunchActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

PICO 特有的 `<meta-data>` 标签：

| Meta-data 键 | 作用 |
| --- | --- |
| `pico.spatial.windowcontainer.id` | 默认窗口容器的 ID |
| `pico.spatial.windowcontainer.style` | 窗口样式（如全透明背景） |
| `pico.spatial.windowcontainer.defaultsize` | 默认窗口尺寸 |
| `pico.spatial.stage.immersion` | Stage 沉浸度（0-100） |

## 6. Android 四大组件 vs 后端项目

| Android 组件 | 类比后端 | 说明 |
| --- | --- | --- |
| `Activity` | Controller / 路由入口 | 每个"页面/屏幕"对应一个 Activity。PICO 中通常只需要一个 `SpatialLaunchActivity` |
| `Service` | 后台任务 / Worker | 后台长时间运行的任务（PICO 中较少直接使用） |
| `BroadcastReceiver` | 消息队列监听器 | 接收系统广播（如插拔、网络变化） |
| `ContentProvider` | DAO / Repository | 跨应用数据共享（通常用不到） |

> [!TIP]
> **PICO 的特殊性**
> 在 PICO XR 应用中，Activity 的作用被大幅简化——所有 UI 由 PICO 的空间 UI 框架管理。LaunchActivity 通常是空实现：
> `class LaunchActivity : SpatialLaunchActivity()`

## 7. Gradle Wrapper 的使用

Android 项目使用 Gradle Wrapper 确保所有开发者使用相同的 Gradle 版本：

```bash
# Windows (在你的机器上用这个)
gradlew.bat assembleDebug

# 常用命令
gradlew.bat assembleDebug          # 编译 Debug 包
gradlew.bat assembleRelease        # 编译 Release 包
gradlew.bat installDebug           # 安装到设备
gradlew.bat lint                   # 代码静态检查
```

> [!NOTE]
> **小知识**
> `gradle.properties` 中的 `android.useAndroidX=true` 会启用 AndroidX（Android 官方的扩展库）。所有 PICO Demo 都使用 AndroidX。

## 快速练习

尝试回答以下问题：

1. 为什么 PICO 应用需要配置 `abiFilters.add("arm64-v8a")`？
2. `compileSdk = 35` 和 `minSdk = 26` 的区别是什么？
3. PICO Spatial SDK 的 Maven 仓库地址是什么？

<details style="margin-top: 1rem; cursor: pointer;">
<summary>点击查看答案</summary>

1. 因为 PICO 头显采用 ARM64 架构的芯片，不需要为 x86 等架构编译原生代码，缩小 APK 体积。
2. `compileSdk` 是编译时能用的最新 API；`minSdk` 是支持的最低 Android 版本。
3. `https://artifact.bytedance.com/repository/Volcengine`

</details>

> [!INFO]
> **参考资料**
> - [Android 构建配置官方文档](https://developer.android.com/build)
> - 本地 Demo 的构建文件：`PICOProject/*/build.gradle.kts` 和 `gradle/libs.versions.toml`
>
> **有疑问？** 随时问我。

---
**上一课**: [[0004-pico-demo-code-analysis|第4课：深入解读 PICO Demo 中的 Kotlin 代码]] | **下一课**: [[0006-jetpack-compose-intro|第6课：Jetpack Compose 声明式 UI]]
