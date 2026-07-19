---
title: "第14课：从零搭建 PICO 应用"
description: "本节课综合运用前面 13 课的知识，从零开始搭建一个 PICO 空间应用的完整流程。创建一个'虚拟画廊'应用——在空间中展示 3D 模型，支持平面检测和手部交互。"
---

# 从零搭建 PICO 应用

本节课综合运用前面 13 课的知识，从零开始搭建一个 PICO 空间应用的完整流程。我们将创建一个"虚拟画廊"应用——在空间中展示 3D 模型，支持平面检测和手部交互。

> [!NOTE]
> **前置条件**
> 需要安装 Android Studio 2025.1.x + PICO Spatial Plugin。参考 `downloads/spatial-sdk/markdown/004-setup.md` 配置环境。

## 1. 应用设计

虚拟画廊功能：

- Planar 窗口：展示作品列表和简介
- Volumetric 窗口：3D 作品展示
- 平面检测：将虚拟作品放置在现实桌面上
- 手部交互：旋转、缩放作品

## 2. 项目创建（模板方式）

最快的方式是使用 Android Studio 的 PICO 模板：

```
File → New → New Project → PICO Spatial → Planar Window Container
```

自动生成的项目结构：

```
VirtualGallery/
├── app/
│   ├── build.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/example/virtualgallery/
│       │   ├── Main.kt
│       │   ├── platform/
│       │   │   ├── SpatialApplication.kt
│       │   │   └── LaunchActivity.kt
│       │   └── ui/
│       │       └── HomePage.kt
│       └── res/...
└── editor-asset/
    └── src/main/res3d/  # 3D 资源
```

## 3. 从纯手动搭建

如果你想从空白项目逐一手动搭建，按以下步骤：

### 步骤 1：settings.gradle.kts

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
        google(); mavenCentral()
        maven { url = uri("https://artifact.bytedance.com/repository/Volcengine") }
    }
}
rootProject.name = "VirtualGallery"
include(":app")
```

### 步骤 2：libs.versions.toml

```toml
[versions]
spatial-bom = "0.13.3"
agp = "8.7.3"
kotlin = "2.1.0"
compose-bom = "2024.12.01"
lifecycle = "2.8.7"

[libraries]
spatial-bom = { group = "com.pico.spatial", name = "spatial-bom", version.ref = "spatial-bom" }
spatial-core = { group = "com.pico.spatial", name = "spatial-core" }
spatial-foundation = { group = "com.pico.spatial", name = "spatial-foundation" }
spatial-sense = { group = "com.pico.spatial", name = "spatial-sense" }
spatial-ui-foundation = { group = "com.pico.spatial.ui", name = "spatial-ui-foundation" }
spatial-ui-design = { group = "com.pico.spatial.ui", name = "spatial-ui-design" }
spatial-ui-platform = { group = "com.pico.spatial.ui", name = "spatial-ui-platform" }
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version = "1.15.0" }
lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycle" }
activity-compose = { group = "androidx.activity", name = "activity-compose", version = "1.9.3" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
compose-compiler = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
```

### 步骤 3：app/build.gradle.kts

```kotlin
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.compose.compiler)
}

android {
    namespace = "com.example.virtualgallery"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.virtualgallery"
        minSdk = 26
        targetSdk = 35
        ndk { abiFilters.add("arm64-v8a") }
    }
    buildFeatures { compose = true }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions { jvmTarget = "11" }
}

dependencies {
    implementation(platform(libs.spatial.bom))
    implementation(libs.spatial.core)
    implementation(libs.spatial.foundation)
    implementation(libs.spatial.sense)
    implementation(libs.spatial.ui.foundation)
    implementation(libs.spatial.ui.design)
    implementation(libs.spatial.ui.platform)
    implementation(libs.androidx.core.ktx)
    implementation(libs.lifecycle.runtime.ktx)
    implementation(libs.activity.compose)
}
```

### 步骤 4：AndroidManifest.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="com.pico.permission.SPATIAL_ANCHOR" />

    <application
        android:name=".platform.SpatialApplication"
        android:allowBackup="true"
        android:label="VirtualGallery"
        android:theme="@style/Theme.Pico">

        <meta-data
            android:name="pico.spatial.windowcontainer.id"
            android:value="mainWindow"/>

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

### 步骤 5：SpatialApplication.kt + LaunchActivity.kt

```kotlin
package com.example.virtualgallery.platform

import android.app.Application
import com.pico.spatial.ui.foundation.dsl.launch
import com.example.virtualgallery.mainApp

class SpatialApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        launch(::mainApp)
    }
}

// LaunchActivity.kt
class LaunchActivity : SpatialLaunchActivity()  // 空的！
```

### 步骤 6：Main.kt — 应用入口

```kotlin
package com.example.virtualgallery

import com.pico.spatial.ui.design.PicoTheme
import com.pico.spatial.ui.foundation.dsl.DefaultWindowContainer
import com.pico.spatial.ui.foundation.dsl.SpatialAppScope
import com.pico.spatial.ui.foundation.dsl.WindowContainer
import com.pico.spatial.ui.foundation.dsl.Form
import com.pico.spatial.ui.foundation.layout.Size
import com.example.virtualgallery.ui.HomePage
import com.example.virtualgallery.ui.GalleryVolume

fun mainApp(scope: SpatialAppScope) =
    with(scope) {
        // 平面窗口：列表和描述
        DefaultWindowContainer {
            PicoTheme {
                HomePage()
            }
        }
        // 体积窗口：3D 作品展示
        WindowContainer(
            id = "galleryDisplay",
            form = Form.Volumetric,
            defaultSize = Size(600f, 400f, 600f)
        ) {
            PicoTheme {
                GalleryVolume()
            }
        }
    }
```

### 步骤 7：数据模型

```kotlin
package com.example.virtualgallery.data

import androidx.annotation.DrawableRes
import com.pico.spatial.core.math.Color4

data class Artwork(
    val id: String,
    val title: String,
    val artist: String,
    val modelPath: String,   // 3D 模型路径
    val accentColor: Color4  // 展示边框颜色
)

// 示例数据
object ArtworkRepository {
    val artworks = listOf(
        Artwork(
            id = "001",
            title = "古代花瓶",
            artist = "虚拟艺术家",
            modelPath = "models/vase.usdz",
            accentColor = Color4(1f, 0.5f, 0f, 1f)
        ),
        Artwork(
            id = "002",
            title = "现代雕塑",
            artist = "数字创作者",
            modelPath = "models/sculpture.usdz",
            accentColor = Color4(0f, 0.6f, 1f, 1f)
        )
    )
}
```

### 步骤 8：ViewModel

```kotlin
package com.example.virtualgallery.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.virtualgallery.data.Artwork
import com.example.virtualgallery.data.ArtworkRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class GalleryUiState(
    val artworks: List<Artwork> = emptyList(),
    val selectedArtwork: Artwork? = null,
    val isLoading: Boolean = true
)

class GalleryViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(GalleryUiState())
    val uiState: StateFlow<GalleryUiState> = _uiState.asStateFlow()

    init {
        // 模拟加载数据
        viewModelScope.launch {
            _uiState.value = GalleryUiState(
                artworks = ArtworkRepository.artworks,
                isLoading = false
            )
        }
    }

    fun selectArtwork(artwork: Artwork) {
        _uiState.value = _uiState.value.copy(
            selectedArtwork = artwork
        )
    }
}
```

### 步骤 9：UI 组件

```kotlin
// ui/HomePage.kt
package com.example.virtualgallery.ui

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsStateWithLifecycle
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.pico.spatial.ui.design.*
import com.pico.spatial.ui.design.tokens.Color

@Composable
fun HomePage(viewModel: GalleryViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Column(modifier = Modifier.padding(24.dp)) {
        Text(
            text = "虚拟画廊",
            style = PicoTheme.typography.Display
        )

        Spacer(Modifier.height(16.dp))

        if (uiState.isLoading) {
            ProgressIndicator()
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(uiState.artworks) { artwork ->
                    ArtworkCard(
                        artwork = artwork,
                        onClick = { viewModel.selectArtwork(artwork) }
                    )
                }
            }
        }
    }
}

@Composable
fun ArtworkCard(
    artwork: com.example.virtualgallery.data.Artwork,
    onClick: () -> Unit
) {
    Button(onClick = onClick) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(artwork.title, style = PicoTheme.typography.Title)
                Text(artwork.artist, style = PicoTheme.typography.Body)
            }
        }
    }
}
```

### 步骤 10：3D 展示体积窗口

```kotlin
// ui/GalleryVolume.kt
package com.example.virtualgallery.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.pico.spatial.core.ecs.Entity
import com.pico.spatial.core.ecs.ModelComponent
import com.pico.spatial.core.ecs.ModelEntity
import com.pico.spatial.core.ecs.TransformComponent
import com.pico.spatial.core.math.Vector3
import com.pico.spatial.ui.foundation.content.SpatialView
import com.pico.spatial.ui.foundation.content.SpatialViewContent
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@Composable
fun GalleryVolume() {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    SpatialView(
        modifier = Modifier.fillMaxSize(),
        initial = { content: SpatialViewContent ->
            uiState.selectedArtwork?.let { artwork ->
                // 加载并展示 3D 模型
                val entity = createArtworkEntity(content, artwork.modelPath)
                content.addEntity(entity)
            }
        }
    )
}

suspend fun createArtworkEntity(
    content: SpatialViewContent,
    modelPath: String
): Entity = withContext(Dispatchers.IO) {
    Entity().apply {
        components.set(TransformComponent(
            position = Vector3(0f, 0f, -0.5f)
        ))
        components.set(ModelComponent(
            model = ModelEntity(
                resource = content.loadModelResource(modelPath)
            )
        ))
    }
}
```

## 4. 打包 & 部署到真机

代码写完后，需要在 PICO 设备上运行才能看到效果。以下是完整的打包部署流程。

### 4.1 开发者模式开启

1. 在 PICO 设备上进入 **设置 → 通用 → 关于本机**，连续点击"软件版本号"直到提示"已进入开发者模式"
2. 返回 **设置 → 通用 → 开发者选项**，开启 **USB 调试**
3. 用 USB 数据线将 PICO 连接到电脑
4. 在设备上弹窗确认"允许 USB 调试？"，勾选"一律允许"，点击"确定"

### 4.2 编译安装

```bash
# 1. 确认设备已连接
adb devices
# 输出示例：
# List of devices attached
# 192.168.0.101:5555 device    # 无线连接
# 2GB23Z807N device            # USB 连接

# 2. 编译 Debug APK 并安装
./gradlew installDebug
# 或指定模块
./gradlew app:installDebug

# 3. 查看实时日志
adb logcat -s "YourAppTag"    # 按 TAG 过滤
adb logcat | grep -i "error\|exception"  # 只看异常

# 4. Release 构建（发布用）
./gradlew assembleRelease
# APK 位置：app/build/outputs/apk/release/app-release.apk
```

### 4.3 无线调试（USB 不便时）

```bash
# 首次需要 USB 连接来配对
# 1. USB 连接后执行：
adb tcpip 5555
# 2. 拔掉 USB，使用设备的 IP 连接：
adb connect 192.168.1.100:5555   # 替换成 PICO 的实际 IP
# 3. 确认连接成功
adb devices

# 4. 现在可以无线安装
./gradlew app:installDebug

# 断开无线连接
adb disconnect
```

### 4.4 PICO 模拟器（无设备时）

如果没有 PICO 真机，可以使用 PICO 官方提供的 Android 模拟器镜像：

```bash
# 1. 通过 sdkmanager 安装 PICO 系统镜像
sdkmanager "system-images;android-35;pico_spatial;release"

# 2. 创建 AVD（Android Virtual Device）
avdmanager create avd \
    --name "PICO_Device" \
    --package "system-images;android-35;pico_spatial;release" \
    --device "pico_spatial"

# 3. 启动模拟器
emulator -avd PICO_Device -wipe-data

# 4. 安装 APK
adb install app/build/outputs/apk/debug/app-debug.apk
```

### 4.5 常见问题排查

| 现象 | 原因 | 解决 |
|------|------|------|
| `adb: device unauthorized` | 设备未授权 USB 调试 | 在 PICO 上确认授权弹窗，或重新插拔 USB 线 |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | 已安装签名不同的版本 | 先卸载：`adb uninstall com.yourapp.package` |
| 安装成功但打开闪退 | 编译 SDK 版本或 ABI 不匹配 | 确认 `ndk { abiFilters "arm64-v8a" }` 已配置 |
| 3D 模型不显示 | 资源未打包到 APK | 确认 `noCompress += listOf("glb", "bundle")` 和 `editor-asset` 模块已添加 |
| 追踪功能不工作 | Manifest 缺少权限 | 检查 `spatial.permission.HAND_TRACKING` / `SPATIAL_ANCHOR` 等权限 |
| `adb: command not found` | adb 不在 PATH | 在 Android Studio 的 Terminal 中运行，或把 `$ANDROID_HOME/platform-tools` 加入 PATH |

> [!TIP]
> **💡 开发效率技巧**
>
> - 使用 `./gradlew app:installDebug` 一步完成编译+安装，比 Android Studio 的 Run 按钮更快
> - 配合 `adb logcat -s YourTag` 实时看日志，比等 Run 面板输出快得多
> - 修改代码后只需要 `./gradlew app:installDebug`，PICO 设备不会自动启动应用——手动在设备上打开或加一步 `adb shell monkey -p com.yourapp.package 1`
> - 无线调试下第一次安装较慢（~10MB/s），增量编译后安装通常只需几秒

## 5. 后续扩展方向

应用基础搭建完成后，可以按需添加更多功能：

| 扩展功能 | 涉及模块 | 参考知识点 |
|----------|----------|------------|
| 平面检测，放置在桌面上 | spatial-sense | PlaneTrackingManager（第10课） |
| 手部拖拽旋转模型 | spatial-ui-foundation | detectSpatialDragGesture（第11课） |
| 空间音频背景音 | spatial-core | AmbientAudioComponent（第13课） |
| 补间动画切换效果 | spatial-core | TweenAnimation（第13课） |
| 保存锚点位置 | spatial-sense | WorldAnchor + WorldTrackingManager（第10课） |
| 全空间沉浸式展厅 | spatial-ui-foundation | Stage + Full Space（第8课） |

## 6. 知识体系总回顾

| 阶段 | 课程 | 核心收获 |
|------|------|----------|
| **Kotlin** | 1. 语法速览 | val/var、fun、data class、扩展函数、when、空安全 |
| | 2. 协程 | launch/async、suspend、Dispatchers、scope、withContext |
| | 3. 集合+函数式 | let/apply/run/with/also、集合操作链 |
| | 4. Demo 代码分析 | 综合阅读能力、8 个 Demo 的架构模式 |
| **Android** | 5. 项目结构 | Gradle 配置、Manifest、依赖管理、BOM |
| | 6. Compose | 声明式 UI、@Composable、Modifier、状态与重组 |
| | 7. 生命周期+MVVM | Activity 生命周期、ViewModel、StateFlow、架构模式 |
| **PICO SDK** | 8. SDK 架构 | 模块全景、6 大模块职责、依赖配置 |
| | 9. Core & ECS | Entity/Component/System、3D 模型、碰撞物理 |
| | 10. Sense | Anchor 体系、Mesh/Plane 检测、世界锚点 |
| | 11. Tracking | 手/眼/控制器/HMD 追踪、DataProvider 模式 |
| | 12. Spatial UI | PicoTheme、WindowContainer、SpatialView、组件库 |
| | 13. 其他模块 | 动画、音频、视频、物理、ML |
| **实践** | 14. 从零搭建 | 完整项目全流程、各模块集成 |

## 下一步方向

主课程全部完成后，你有以下几个进阶方向：

1. **精读 SDK 文档** — `downloads/spatial-sdk/markdown/` 中有 132 篇 SDK 文档，按需深入学习特定主题
2. **精读 API 文档** — 打开 `pico-sdk-0.13.3-mirror/spatial-api/0.13.3/index.html` 了解每个类的完整 API
3. **深入研究一个 Demo** — 选择一个与你目标最相关的 Demo，逐行理解每一行代码
4. **动手写一个自己的应用** — 从简单的功能开始，逐步增加复杂度
5. **加入 PICO 开发者社区** — 在遇到实际开发问题时寻求帮助

## 附：构建与部署工作流

完成代码编写后，使用 [[0017-pico-cli-toolchain|PICO CLI]] 进行构建、部署和验证：

```bash
# 1. 构建
cd VirtualGallery/
./gradlew assembleDebug

# 2. 确保设备就绪
pico-cli emulator doctor --format json
pico-cli device list --format json

# 3. 安装 APK
pico-cli app install app/build/outputs/apk/debug/app-debug.apk

# 4. 启动应用
pico-cli app launch com.example.virtualgallery

# 5. 收集运行证据
adb logcat -c
pico-cli app launch com.example.virtualgallery
adb logcat -b crash -d
pico-cli app logcat --lines 300 --level E
pico-cli capture screenshot --out ./screenshots/gallery-home.png
```

更详细的开发工作流见 [[0022-dev-workflow-and-debugging|第22课：开发工作流与调试]]。

---

> [!NOTE]
> **课程完结**
>
> 14 课的学习路径完成了从 Kotlin 入门到 PICO 应用开发的全过程。但这只是开始——真正的掌握来自动手实践。记住：SDK 文档和 Demo 代码会是你最忠实的参考伙伴。
>
> **随时回来问我问题**，我可以帮你理解特定代码、排查问题、或设计应用架构。

---

> [!INFO]
> **所有课程列表**
>
> - [[0001-kotlin-for-java-developers|第1课：Kotlin for Java Developers 速览]]
> - [[0002-kotlin-coroutines|第2课：Kotlin 协程基础]]
> - [[0003-kotlin-collections-functional|第3课：Kotlin 集合与函数式编程]]
> - [[0004-pico-demo-code-analysis|第4课：深入解读 PICO Demo 代码]]
> - [[0005-android-project-structure|第5课：Android 项目结构与构建]]
> - [[0006-jetpack-compose-intro|第6课：Jetpack Compose 声明式 UI]]
> - [[0007-android-lifecycle-mvvm|第7课：Android 生命周期与 MVVM]]
> - [[0008-pico-sdk-architecture|第8课：PICO SDK 总体架构]]
> - [[0009-spatial-core-ecs|第9课：Spatial Core & ECS]]
> - [[0010-spatial-sense|第10课：Spatial Sense 空间感知]]
> - [[0011-spatial-tracking|第11课：Spatial Tracking 空间追踪]]
> - [[0012-spatial-ui|第12课：Spatial UI 空间界面]]
> - [[0013-remaining-modules|第13课：其他模块]]
> - [[0014-building-from-scratch|第14课：从零搭建 PICO 应用]]

---
**上一课**: [[0013-remaining-modules|第13课：其他模块]] | **下一课**: [[0015-koin-navigation-tools|第15课：Koin 依赖注入 + Compose 导航 + 工具库]]
