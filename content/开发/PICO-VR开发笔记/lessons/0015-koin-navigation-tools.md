---
title: "第15课：Koin 依赖注入 + Compose 导航 + 工具库"
description: "本节课覆盖 PICO Demo 中使用的基础设施工具——依赖注入（Koin）、导航（Jetpack Navigation Compose + Spatial 容器导航）、图片加载（Coil）、序列化（kotlinx.serialization）以及 Gradle 高级配置。"
---

# Koin 依赖注入 + Compose 导航 + 工具库

本节课覆盖 PICO Demo 中使用的基础设施工具——依赖注入（Koin）、导航（Jetpack Navigation Compose + Spatial 容器导航）、图片加载（Coil）、序列化（kotlinx.serialization）以及 Gradle 高级配置。这些不是 PICO SDK 特有的，但 Demo 中大量使用，是 PICO 开发的基础。

> [!NOTE]
> **重要性**
> 5/8 的 PICO Demo 使用了 Koin 进行依赖注入，spatialui 使用了 NavHost 导航，spatialml 使用了 kotlinx.serialization 和 Coil。掌握这些工具让你能理解 Demo 的全部代码。

## 1. Koin 依赖注入

Koin 是一个 Kotlin 轻量级依赖注入框架，不需要注解处理器或代码生成。5/8 的 PICO Demo 使用了 Koin。

### 1.1 Koin vs Dagger/Hilt

| | Koin | Dagger / Hilt |
|---|---|---|
| 学习曲线 | 低——纯 Kotlin DSL | 高——注解 + APT 编译 |
| 编译速度 | 不影响 | 有影响（注解处理） |
| 运行时 | 运行时解析依赖 | 编译时生成代码 |
| 适用场景 | 中小型项目、Demo、快速原型 | 大型项目 |
| PICO 使用 | 5/8 Demo 使用 | 未使用 |

### 1.2 基本配置

```kotlin
// 1. 定义模块
val appModule = module {
    // 单例（应用全局唯一）
    single { HttpClient() }

    // 工厂（每次请求创建新实例）
    factory { JsonSerializer() }

    // ViewModel（专门用于 ViewModel）
    viewModel { VideoViewModel(get()) }

    // 命名作用域
    scope(named("user_session")) {
        scoped { UserSession() }
    }
}

// 2. 在 Application 中初始化
class SpatialApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidLogger(Level.DEBUG)    // 日志
            androidContext(this@SpatialApplication) // Android Context
            modules(appModule)            // 注册模块
        }

        launch(::mainApp)
    }
}

// 3. 在 ViewModel 中使用
class VideoViewModel(
    private val httpClient: HttpClient  // 由 Koin 注入
) : ViewModel() { ... }

// 4. 在 Composable 中使用
@Composable
fun VideoScreen() {
    val viewModel = koinViewModel<VideoViewModel>()
    // 或通过 getKoin().get()
    val client = getKoin().get<HttpClient>()
}
```

### 1.3 Koin 在 PICO Demo 中的实际用法

```kotlin
// spatialvideo-0.13.3 — 最典型的 Koin 用法
// Application.kt
startKoin {
    androidContext(this)
    modules(listOf(videoModule))
}

// videoModule 定义
val videoModule = module {
    // 命名作用域（每个 WindowContainer 一个作用域）
    scope(named("video_scope")) {
        scoped { VideoViewModel() }
        scoped { VideoManager(get()) }
    }
}

// Composable 中使用命名作用域获取
@Composable
fun VideoPage() {
    val koin = getKoin()
    val scope = koin.getOrCreateScope("video_main", named("video_scope"))

    // 方式 1：从 scope 获取
    val vm = scope.get<VideoViewModel>()

    // 方式 2：remember 缓存
    val viewModel = remember(scope) { scope.get<VideoViewModel>() }

    // 方式 3：使用 koinViewModel
    val vm: VideoViewModel = koinViewModel(
        scope = getKoin().getOrCreateScope("video_main", named("video_scope"))
    )

    DisposableEffect(Unit) {
        onDispose {
            // 清理作用域
            scope.close()
        }
    }
}

// 其他 Demo 中的 Koin 用法
// by inject() — 懒加载注入（在非 Compose 类中使用）
class PhysicsManager {
    private val eventBus: EventBus by inject()
}

// scopedOf — 简化 DSL（比 scoped { MyService() } 更简洁）
val module = module {
    scopedOf(::MyService)
    viewModelOf(::MyViewModel)
}
```

#### 1.3.1 welcomespace — Koin 的最佳实践参考

`welcomespace-0.13.3` 中的 Koin 使用最为完整和规范，推荐作为模板参考：

**模块定义**（`di/AppModule.kt`）：

```kotlin
// 按功能分模块，每个模块用命名作用域隔离
val furnitureLibraryModule = module {
    scope(named(FURNITURE_LIBRARY_SCOPE_ID)) {
        scopedOf(::FurnitureLibraryViewModel)
        scopedOf(::ItemDisplayViewModel)
    }
}

val decorateSpaceModule = module {
    scope(named(DECORATE_SPACE_SCOPE_ID)) {
        scopedOf(::DecorateSpaceViewModel)
        scopedOf(::FullSpaceRoomViewModel)
    }
}

val appModules = listOf(furnitureLibraryModule, decorateSpaceModule)
```

**作用域声明**（`di/KoinScopes.kt`）：

```kotlin
// 通过 KoinScopeComponent 接口管理作用域生命周期
class FurnitureLibraryScope : KoinScopeComponent {
    override val scope: Scope
        get() = getKoin().getOrCreateScope(
            FURNITURE_LIBRARY_SCOPE_ID,
            named(FURNITURE_LIBRARY_SCOPE_ID)
        )
}

class DecorateSpaceScope : KoinScopeComponent {
    override val scope: Scope
        get() = getKoin().getOrCreateScope(
            DECORATE_SPACE_SCOPE_ID,
            named(DECORATE_SPACE_SCOPE_ID)
        )
}

const val FURNITURE_LIBRARY_SCOPE_ID = "furniture_library"
const val DECORATE_SPACE_SCOPE_ID = "decorate_space"
```

**在 Composable 中使用作用域**（`ui/display/ItemDisplayVolume.kt`）：

```kotlin
@Composable
fun WindowContainerScope.ItemDisplayVolume(
    viewModel: ItemDisplayViewModel =
        koinViewModel(
            scope = getKoin()
                .getOrCreateScope(FURNITURE_LIBRARY_SCOPE_ID, named(FURNITURE_LIBRARY_SCOPE_ID))
        )
) { ... }
```

> [!NOTE]
> **welcomespace 的 Koin 设计亮点**
> - **按窗口容器划分作用域**——每个 Volumetric WindowContainer 有自己的 Koin scope，互不干扰
> - **scopedOf 代替 scoped**——利用 Kotlin 的构造器引用 `::`，比 `scoped { ViewModel() }` 更简洁
> - **KoinScopeComponent 封装**——将 scope 的获取/创建逻辑封装到单独类中，Composable 层只需引用 scope ID
> - **scope ID 常量集中管理**——所有 scope ID 定义在 `KoinScopes.kt` 中，避免字符串散落各处

### 1.4 Koin 最佳实践

```kotlin
// 1. 按功能模块组织 Module
val coreModule = module {
    single { ApiService() }
    single { Database(get()) }
}
val featureModule = module {
    viewModel { FeatureViewModel(get()) }
}

// 2. ViewModel 推荐用 viewModel { } 注册（生命周期感知）
// 3. WindowContainer/Stage 之间不共享 ViewModel —— 用 named scope 隔离
// 4. 清理 scope 避免内存泄漏（在 DisposableEffect onDispose 中 close()）
// 5. 使用 androidLogger() 调试注入问题
```

## 2. Jetpack Navigation Compose

`spatialui-0.13.3` 使用 Jetpack Navigation Compose 管理 UI 页面导航，结合 PICO 的空间窗口容器。

### 2.1 基本用法

```kotlin
// 依赖
// libs.versions.toml
[libraries]
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version = "2.8.5" }

// 定义路由
object Routes {
    const val HOME = "home"
    const val DETAIL = "detail/{itemId}"
    const val SEARCH = "search"
    fun detail(itemId: String) = "detail/$itemId"
}

// 设置 NavHost
@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = Routes.HOME
    ) {
        composable(Routes.HOME) {
            HomePage(navController)
        }
        composable(
            Routes.DETAIL,
            arguments = listOf(navArgument("itemId") { type = NavType.StringType })
        ) { backStackEntry ->
            val itemId = backStackEntry.arguments?.getString("itemId") ?: ""
            DetailPage(itemId, navController)
        }
        composable(Routes.SEARCH) {
            SearchPage(navController)
        }
    }
}

// 导航
fun HomePage(navController: NavController) {
    Button(onClick = {
        navController.navigate(Routes.detail("artwork_001"))
    }) {
        Text("查看详情")
    }
}

// 传参 + 动画
navController.navigate(Routes.detail(itemId)) {
    popUpTo(Routes.HOME) { saveState = true }
    launchSingleTop = true
    restoreState = true
}

// 返回
navController.popBackStack()

// 获取当前路由
val currentBackStackEntry by navController.currentBackStackEntryAsState()
val currentRoute = currentBackStackEntry?.destination?.route
```

### 2.2 PICO 中导航的特殊处理

```kotlin
// PICO 中 Compose 导航在 WindowContainer 内使用
// spatialui-0.13.3 的导航模式：

// 1. 在 Container 中注入 NavController（通过 CompositionLocal）
val LocalMainNavController = compositionLocalOf<NavHostController> {
    error("No NavController provided")
}

@Composable
fun HomePage() {
    val navController = rememberNavController()
    val scope = rememberCoroutineScope()

    CompositionLocalProvider(LocalMainNavController provides navController) {
        Column {
            // PICO TabBar 导航
            TabBar(followViewpoints = ViewPoint.FrontOnly) {
                item(selected = currentTab == 0,
                     mainContent = { Text("推荐") },
                     onClick = { navController.navigate(Routes.FEEDS) })
                item(selected = currentTab == 1,
                     mainContent = { Text("搜索") },
                     onClick = { navController.navigate(Routes.SEARCH) })
            }

            NavHost(navController, startDestination = Routes.FEEDS) {
                composable(Routes.FEEDS) { FeedsPage() }
                composable(Routes.SEARCH) { SearchPage() }
                composable(Routes.DETAIL) { DetailPage() }
            }
        }
    }
}

// 2. PICO 空间容器导航 vs Compose 导航的混合使用
// PICO 容器导航：打开/关闭 WindowContainer / Stage（跨窗口）
spatialNavigator.openWindowContainer("detail", "artwork_001")
// Compose 导航：在同一窗口内切换页面（Tab 切换）
navController.navigate(Routes.DETAIL)

// 3. spatialui 的实际架构
// Main.kt 入口 → DefaultWindowContainer → PicoTheme → HomePage
// HomePage → TabBar + NavHost → FeedsPage / SearchPage / DetailPage
// FeedsPage → 点击 → spatialNavigator.openWindowContainer("contentDetail", ...)
```

#### 2.2.1 welcomespace — 导航 + 空间容器协同

`welcomespace-0.13.3` 的 `MainNavHost.kt` 展示了 Compose 导航与 PICO 空间导航的混合使用：

```kotlin
@Composable
fun MainNavHost(modifier: Modifier = Modifier) {
    val navController = rememberNavController()
    val spatialNavigator = LocalSpatialNavigator.current  // PICO 空间导航器

    CompositionLocalProvider(LocalMainNavController provides navController) {
        NavHost(navController = navController, startDestination = "homepage") {
            composable("homepage") {
                HomePage(
                    onNavToDecorateSpace = {
                        navController.navigate("decorate_space")
                        // Compose 导航 + PICO 空间导航的组合：
                        coroutine.launch {
                            spatialNavigator.openStage(
                                id = "room", style = StageStyle.Full
                            )
                        }
                    }
                )
            }
            composable("decorate_space") {
                // 生命周期管理：返回时自动关闭 Stage 并清除返回栈
                DisposableEffect(lifecycleOwner) {
                    val observer = LifecycleEventObserver { _, event ->
                        if (event == Lifecycle.Event.ON_PAUSE) {
                            coroutine.launch {
                                closeStage()
                                navController.popBackStack("homepage", false)
                            }
                        }
                    }
                    lifecycleOwner.lifecycle.addObserver(observer)
                    onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
                }
                DecorateSpacePage()
            }
        }
    }
}
```

关键模式：

- **CompositionLocal 传递 NavController**——子页面通过 `LocalMainNavController.current` 获取导航控制器
- **Compose 导航 + PICO 空间导航协同**——`navController.navigate()` 切换 2D 页面，`spatialNavigator.openStage()` 打开 3D 空间
- **生命周期自动清理**——用户离开装饰空间页面时自动 `closeStage()` 并回到首页

## 3. Coil 图片加载

Coil 是 Kotlin 首选的图片加载库。仅有 `spatialui-0.13.3` 使用（用于加载网络图片和资源图片），但它是 Android 开发的标配。

```kotlin
// 依赖
// libs.versions.toml
[libraries]
coil-compose = { group = "io.coil-kt", name = "coil-compose", version = "2.7.0" }

// 1. 在 Application 中配置 ImageLoader
class App : Application(), ImageLoaderFactory {
    override fun newImageLoader(): ImageLoader {
        return ImageLoader.Builder(this)
            .crossfade(true)           // 淡入效果
            .okHttpClient { OkHttpClient.Builder().build() }
            .build()
    }
}

// 2. 在 Compose 中使用 AsyncImage
@Composable
fun ArtworkImage(url: String) {
    AsyncImage(
        model = url,                          // URL 或 URI
        contentDescription = "作品图片",
        modifier = Modifier.size(200.dp),
        contentScale = ContentScale.Crop       // 裁剪模式
    )
}

// 3. 加载资源图片
AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data(R.drawable.placeholder)
        .crossfade(true)
        .build(),
    contentDescription = null
)

// 4. 用 painter 方式
val painter = rememberAsyncImagePainter(
    model = ImageRequest.Builder(LocalContext.current)
        .data("https://example.com/image.jpg")
        .size(Size(256, 256))
        .build()
)
Image(
    painter = painter,
    contentDescription = null,
    modifier = Modifier.size(100.dp),
    contentScale = ContentScale.Crop
)

// 5. 加载状态处理
AsyncImage(
    model = url,
    contentDescription = null,
    onState = { state ->
        when (state) {
            is AsyncImagePainter.State.Loading -> { /* 加载中 */ }
            is AsyncImagePainter.State.Success -> { /* 加载成功 */ }
            is AsyncImagePainter.State.Error -> { /* 加载失败 */ }
        }
    }
)
```

## 4. kotlinx.serialization

`spatialml-0.13.3` 使用 kotlinx.serialization 进行 JSON 序列化（与 ARK API 通信）。

```kotlin
// 依赖
[plugins]
kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
[libraries]
kotlinx-serialization-json = { group = "org.jetbrains.kotlinx", name = "kotlinx-serialization-json", version = "1.7.3" }

// app/build.gradle.kts
plugins { alias(libs.plugins.kotlin.serialization) }
dependencies { implementation(libs.kotlinx.serialization.json) }

// 1. 定义可序列化数据类
@Serializable
data class VQARequest(
    val image_url: String,
    val question: String
)

@Serializable
data class VQAResponse(
    val result: String,
    val confidence: Float = 0f
)

// 2. JSON 配置
val json = Json {
    ignoreUnknownKeys = true          // 忽略未知字段
    prettyPrint = false               // 不格式化
    isLenient = true                  // 宽松解析
    encodeDefaults = true             // 序列化默认值
}

// 3. 序列化/反序列化
val request = VQARequest(imageUrl = "https://...", question = "这是什么？")
val jsonString = json.encodeToString(request)           // 对象 → JSON
val response = json.decodeFromString<VQAResponse>(jsonString)  // JSON → 对象

// 4. @SerialName 自定义字段名
@Serializable
data class ApiResponse(
    @SerialName("status_code") val statusCode: Int,
    @SerialName("error_msg") val errorMessage: String = ""
)

// 5. 高级：泛型序列化
inline fun <reified T> serialize(data: T): String =
    json.encodeToString(serializer<T>(), data)

inline fun <reified T> deserialize(jsonStr: String): T =
    json.decodeFromString(serializer<T>(), jsonStr)

// 6. spatialml 中的实际使用（与 HttpURLConnection 配合）
suspend fun queryVQA(imageUrl: String, question: String): VQAResponse =
    withContext(Dispatchers.IO) {
        val requestBody = json.encodeToString(VQARequest(imageUrl, question))
        val connection = URL("https://ark-cn-beijing.bytedance.net/api/v3/responses")
            .openConnection() as HttpURLConnection
        connection.apply {
            requestMethod = "POST"
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("Authorization", "Bearer $apiKey")
            doOutput = true
        }
        connection.outputStream.write(requestBody.toByteArray())
        val response = connection.inputStream.bufferedReader().readText()
        connection.disconnect()
        json.decodeFromString<VQAResponse>(response)
    }
```

## 5. Gradle 高级配置

PICO Demo 中使用的 Gradle 配置技巧：

```kotlin
// app/build.gradle.kts —— 完整配置
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.compose.compiler)
}

android {
    namespace = "com.example.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        // PICO 只支持 arm64
        ndk { abiFilters.add("arm64-v8a") }
    }

    buildFeatures { compose = true }

    // 不压缩 GLB/USDZ/Bundle 等资源
    androidResources {
        noCompress += listOf("usdz", "glb", "gltf", "bundle", "ktx", "bin")
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions { jvmTarget = "11" }

    // 依赖冲突解决
    configurations.all {
        resolutionStrategy {
            force("androidx.core:core-ktx:1.15.0")
            exclude(group = "com.intellij", module = "annotations")
        }
    }
}

// PICO 编辑器资产模块（editor-asset/build.gradle.kts）
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.pico.spatial.tools")  // PICO 编辑器资产插件
}
// 这个模块包含 3D 资源（res3d 目录）

// libs.versions.toml —— 版本目录最佳实践
[versions]
agp = "8.7.3"
kotlin = "2.1.0"
compose-bom = "2024.12.01"
lifecycle = "2.8.7"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version = "1.15.0" }
lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycle" }
lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycle" }
lifecycle-runtime-compose = { group = "androidx.lifecycle", name = "lifecycle-runtime-compose", version.ref = "lifecycle" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
compose-compiler = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }

// AndroidManifest.xml —— PICO 元数据配置
<application>
    <!-- 窗口容器配置 -->
    <meta-data android:name="pico.spatial.windowcontainer.id"
               android:value="mainWindow"/>
    <meta-data android:name="pico.spatial.windowcontainer.style"
               android:value="0"/>  <!-- 0=Planar, 1=Volumetric, 2=Volumetric -->
    <meta-data android:name="pico.spatial.windowcontainer.defaultsize"
               android:value="1520x700x600"/>
    <meta-data android:name="pico.spatial.windowcontainer.resizetype"
               android:value="0"/>  <!-- 0=NoResize, 1=ContentSize -->
    <meta-data android:name="pico.spatial.windowcontainer.worldscaletype"
               android:value="1"/>  <!-- 0=Free, 1=Dynamic, 2=Fixed -->
    <meta-data android:name="pico.spatial.windowcontainer.materialbackground"
               android:value="0"/>  <!-- 0=Off, 1=On -->

    <!-- 主题 -->
    <theme android:name="Theme.SpatialApp"/>

    <!-- 多语言 -->
    <meta-data android:name="android.localeConfig"
               android:resource="@xml/locales_config"/>
</application>
```

## 6. Demo 中各工具库的使用位置

| 工具 | 使用 Demo | 参考文件 |
|---|---|---|
| **Koin** | spatialvideo, spatialaudio, animation, physics, welcomespace | `xxx/platform/SpatialApplication.kt` — startKoin<br>`xxx/di/` — module 定义<br>`xxx/ui/*.kt` — getKoin().get()<br>**welcomespace/di/AppModule.kt** — scopedOf 最佳实践<br>**welcomespace/di/KoinScopes.kt** — KoinScopeComponent |
| **NavHost** | spatialui, welcomespace | `spatialui/ui/HomePage.kt` — NavHost + TabBar 组合<br>**welcomespace/ui/navigation/MainNavHost.kt** — NavHost + spatialNavigator 混合 |
| **Coil** | spatialui | `spatialui/platform/SpatialApplication.kt` — ImageLoaderFactory<br>`spatialui/ui/pages/*.kt` — AsyncImage |
| **kotlinx.serialization** | spatialml | `spatialml/vm/VQAWrapper.kt` — @Serializable + Json |

## 快速练习

1. 在 `spatialvideo-0.13.3` 中找到 Koin module 的定义位置和 ViewModel 的注入方式
2. 在 `spatialui-0.13.3` 的 HomePage.kt 中，找出 NavHost 和 TabBar 如何协同工作
3. 在 `spatialml-0.13.3` 的 VQAWrapper.kt 中，找出 @Serializable 和 Json 配置的代码
4. 在 `welcomespace-0.13.3` 的 KoinScopes.kt 中，KoinScopeComponent 的作用是什么？为什么需要使用命名作用域 `named(...)`？

<details style="margin-top: 1rem; cursor: pointer;">
  <summary>点击查看答案</summary>
  <ol>
    <li><code>spatialvideo/app/.../di/VideoModule.kt</code> 中定义了 <code>scope(named("video_scope")) { scoped { VideoViewModel() } }</code>，在 <code>SpatialVideoScreen.kt</code> 中用 <code>getKoin().getOrCreateScope(...).get&lt;VideoViewModel&gt;()</code> 获取</li>
    <li><code>HomePage.kt</code> 使用 <code>compositionLocalOf</code> 将 NavController 注入 CompositionLocal，TabBar 的 onClick 中调用 <code>navController.navigate()</code> 跳转</li>
    <li><code>VQAWrapper.kt</code> 定义了 <code>@Serializable data class VQARequest/Response</code>，并配置了 <code>Json { ignoreUnknownKeys = true }</code></li>
    <li><code>KoinScopeComponent</code> 提供了 <code>scope</code> 属性的标准实现，封装了 <code>getOrCreateScope</code> 的调用。<br>命名作用域 <code>named(...)</code> 用于区分不同的 WindowContainer——每个容器有自己的 ViewModel 实例。例如家具库和装饰空间的 ViewModel 互不干扰，因为它们的 scope ID 不同（<code>furniture_library</code> vs <code>decorate_space</code>）。</li>
  </ol>
</details>

---

> [!INFO]
> **参考资料**
> - Koin 官方文档：[insert-koin.io](https://insert-koin.io/docs/quickstart/android)
> - Coil 官方文档：[coil-kt.github.io](https://coil-kt.github.io/coil/compose/)
> - Kotlin 序列化文档：[kotlinlang.org](https://kotlinlang.org/docs/serialization.html)
> - Jetpack Navigation：[developer.android.com](https://developer.android.com/guide/navigation)
> - PICO Demo 参考：`PICOProject/spatialvideo-0.13.3/di/` — Koin 最佳实践
> - PICO Demo 参考：`PICOProject/spatialui-0.13.3/ui/HomePage.kt` — 导航最佳实践

---
**上一课**: [[0014-building-from-scratch|第14课：从零搭建 PICO 应用 — 综合实践]] | **下一课**: [[0016-capability-map|第16课：能力地图：PICO 空间应用开发 — 学完能做什么]]