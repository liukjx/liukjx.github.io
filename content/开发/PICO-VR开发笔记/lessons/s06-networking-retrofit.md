---
title: "补充课06：Android 网络请求 — Retrofit"
description: "从 HttpURLConnection 到 Retrofit 的声明式网络请求，涵盖基础配置、API 接口定义、ViewModel 集成、文件上传下载及 OkHttp 拦截器"
---

PICO Demo 中只有 `spatialml` 用到了网络——通过原始的 `HttpURLConnection` 调用 ARK API。在真实应用中，绝大多数 Android 项目使用 **Retrofit** 作为网络库，它提供声明式 API 定义、自动序列化/反序列化、协程集成等现代特性。

> [!NOTE] 核心认知
> Retrofit 本质上是一个"接口代理生成器"——你定义一个 Kotlin 接口（标注请求方法、路径、参数），Retrofit 在编译时自动生成实现代码。这比写 `HttpURLConnection` 的样板代码优雅得多。

## 1. 从 HttpURLConnection 到 Retrofit

先看 PICO Demo 中 spatialml 使用的 `HttpURLConnection` 方式，再对比 Retrofit：

```kotlin
// HttpURLConnection 方式（spatialml/VQAWrapper.kt）
suspend fun queryVQA(imageUrl: String, question: String): String =
    withContext(Dispatchers.IO) {
        val connection = URL("https://ark-cn-beijing.bytedance.net/api/v3/responses")
            .openConnection() as HttpURLConnection
        connection.apply {
            requestMethod = "POST"
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("Authorization", "Bearer $apiKey")
            doOutput = true
        }
        val body = json.encodeToString(VQARequest(imageUrl, question))
        connection.outputStream.write(body.toByteArray())

        val response = connection.inputStream.bufferedReader().readText()
        connection.disconnect()
        json.decodeFromString<VQAResponse>(response).result
    }

// Retrofit 方式——声明式，一目了然
interface ArkApi {
    @POST("api/v3/responses")
    suspend fun queryVQA(
        @Header("Authorization") token: String,
        @Body request: VQARequest
    ): VQAResponse
}

// 使用：
val response = api.queryVQA("Bearer $apiKey", VQARequest(imageUrl, question))
```

> [!NOTE] Retrofit 的优点
> 1. 声明式 API——一眼看出请求方法、路径、参数
> 2. 自动序列化——不需要手动写 `json.encodeToString` 和 `bufferedReader().readText()`
> 3. 协程集成——`suspend fun` 自动在 IO 线程执行
> 4. 错误处理——`HttpException` 统一封装非 2xx 响应
> 5. 可测试——接口可以用 Mock 替代

## 2. Retrofit 基础配置

### 依赖

```kotlin
// libs.versions.toml
[versions]
retrofit = "2.11.0"
okhttp = "4.12.0"
kotlinx-serialization = "1.7.3"

[libraries]
retrofit = { group = "com.squareup.retrofit2", name = "retrofit", version.ref = "retrofit" }
retrofit-kotlinx-serialization = { group = "com.squareup.retrofit2", name = "converter-kotlinx-serialization", version.ref = "retrofit" }
okhttp = { group = "com.squareup.okhttp3", name = "okhttp", version.ref = "okhttp" }
logging-interceptor = { group = "com.squareup.okhttp3", name = "logging-interceptor", version.ref = "okhttp" }
kotlinx-serialization-json = { group = "org.jetbrains.kotlinx", name = "kotlinx-serialization-json", version.ref = "kotlinx-serialization" }

[plugins]
kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }

// app/build.gradle.kts
plugins {
    alias(libs.plugins.kotlin.serialization)
}
dependencies {
    implementation(libs.retrofit)
    implementation(libs.retrofit.kotlinx.serialization)
    implementation(libs.okhttp)
    implementation(libs.logging.interceptor)
    implementation(libs.kotlinx.serialization.json)
}
```

### 构建 Retrofit 实例

```kotlin
// 单例模式 —— Retrofit 实例通常是全局共享的
object RetrofitClient {

    // OkHttp 客户端——可以添加拦截器
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY  // 调试用，发布时改为 BASIC 或 NONE
        })
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    // Retrofit 实例
    val instance: Retrofit = Retrofit.Builder()
        .baseUrl("https://ark-cn-beijing.bytedance.net/")  // 注意末尾的 /
        .client(okHttpClient)
        .addConverterFactory(JsonConverterFactory())  // 使用 kotlinx.serialization
        .build()
}

// 类型安全的 API 接口
inline fun <reified T> createApi(): T = RetrofitClient.instance.create(T::class.java)
```

## 3. 定义 API 接口

```kotlin
// 数据模型 —— 使用 @Serializable
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

// 通用网络结果封装
sealed class NetworkResult<out T> {
    data class Success<T>(val data: T) : NetworkResult<T>()
    data class Error(val message: String, val code: Int = -1) : NetworkResult<Nothing>()
}

// API 接口定义
interface ArkApi {
    @POST("api/v3/responses")
    suspend fun queryVQA(
        @Header("Authorization") authorization: String,
        @Body request: VQARequest
    ): VQAResponse
}

// 使用密封类封装结果
interface SafeArkApi {
    @POST("api/v3/responses")
    suspend fun queryVQA(
        @Header("Authorization") authorization: String,
        @Body request: VQARequest
    ): NetworkResult<VQAResponse>
}

// 在实际项目中可以用扩展函数统一包装
suspend fun <T> safeApiCall(call: suspend () -> T): NetworkResult<T> {
    return try {
        NetworkResult.Success(call())
    } catch (e: HttpException) {
        NetworkResult.Error("HTTP ${e.code()}: ${e.message()}", e.code())
    } catch (e: IOException) {
        NetworkResult.Error("网络不可用: ${e.message}")
    }
}
```

## 4. ViewModel 中使用 Retrofit

```kotlin
class VQAViewModel : ViewModel() {

    private val api = createApi<ArkApi>()

    private val _result = MutableStateFlow<NetworkResult<String>?>(null)
    val result: StateFlow<NetworkResult<String>?> = _result.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    fun query(imageUrl: String, question: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _result.value = safeApiCall {
                api.queryVQA("Bearer $apiKey", VQARequest(imageUrl, question))
            }.let { networkResult ->
                when (networkResult) {
                    is NetworkResult.Success -> NetworkResult.Success(networkResult.data.result)
                    is NetworkResult.Error -> networkResult
                }
            }
            _isLoading.value = false
        }
    }
}

// Composable 中使用
@Composable
fun VQAScreen(viewModel: VQAViewModel = viewModel()) {
    val isLoading by viewModel.isLoading.collectAsStateWithLifecycle()
    val result by viewModel.result.collectAsStateWithLifecycle()

    Column {
        if (isLoading) {
            LinearProgressIndicator()
        }

        when (val res = result) {
            is NetworkResult.Success -> {
                Text("结果: ${res.data}")
            }
            is NetworkResult.Error -> {
                Text("错误: ${res.message}", color = Color.Red)
                Button(onClick = { /* 重新请求 */ }) {
                    Text("重试")
                }
            }
            null -> { /* 初始状态，无内容 */ }
        }
    }
}
```

## 5. 常见 HTTP 注解

| 注解 | 用途 | 示例 |
|------|------|------|
| `@GET("path")` | GET 请求 | `@GET("users/{id}")` |
| `@POST("path")` | POST 请求 | `@POST("api/v3/responses")` |
| `@PUT("path")` | PUT 请求 | `@PUT("users/{id}")` |
| `@DELETE("path")` | DELETE 请求 | `@DELETE("users/{id}")` |
| `@Path("name")` | 路径参数替换 | `fun getUser(@Path("id") id: String)` |
| `@Query("name")` | 查询参数 | `fun search(@Query("q") query: String)` |
| `@Body` | 请求体（自动序列化） | `fun create(@Body user: User)` |
| `@Header("name")` | 请求头 | `fun get(@Header("Authorization") token: String)` |
| `@Field` | 表单字段（需配合 @FormUrlEncoded） | `@FormUrlEncoded @POST("login") fun login(@Field("name") name: String)` |

## 6. 文件上传与下载

spatialml 的 Demo 中上传图片到 ARK API 使用的是 `HttpURLConnection` 手动构建 multipart 请求。Retrofit 可以更简洁：

```kotlin
// 上传文件
interface FileApi {
    @Multipart
    @POST("api/v3/files")
    suspend fun uploadFile(
        @Header("Authorization") authorization: String,
        @Part file: MultipartBody.Part
    ): FileResponse
}

// ViewModel 中上传
fun uploadImage(uri: Uri, context: Context) {
    viewModelScope.launch {
        val inputStream = context.contentResolver.openInputStream(uri)
        val requestBody = inputStream?.readBytes()?.toRequestBody(
            "image/png".toMediaTypeOrNull()
        )
        val part = MultipartBody.Part.createFormData(
            "file", "image.png", requestBody!!
        )
        val response = api.uploadFile("Bearer $apiKey", part)
    }
}
```

## 7. OkHttp 拦截器 — 统一处理

OkHttp 拦截器是在请求发送前或响应返回后插入处理逻辑的机制，常用于统一添加 token、日志、重试等：

```kotlin
// Token 拦截器——自动添加认证头
class AuthInterceptor(private val tokenProvider: () -> String?) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val token = tokenProvider()
        val request = if (token != null) {
            original.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else original

        return chain.proceed(request)
    }
}

// 重试拦截器——网络失败时自动重试
class RetryInterceptor(private val maxRetries: Int = 3) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        var retryCount = 0
        while (true) {
            try {
                return chain.proceed(chain.request())
            } catch (e: IOException) {
                if (retryCount >= maxRetries) throw e
                retryCount++
                Thread.sleep(1000L * retryCount)  // 指数退避
            }
        }
    }
}

// 使用
val client = OkHttpClient.Builder()
    .addInterceptor(AuthInterceptor { sessionManager.getToken() })
    .addInterceptor(RetryInterceptor(2))
    .addInterceptor(HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.HEADERS
    })
    .build()
```

## 8. PICO 空间应用的网络策略

PICO VR 设备通常通过 Wi-Fi 连接网络，网络策略有几个特别注意事项：

| 场景 | 建议 | 原因 |
|------|------|------|
| 大文件下载（3D 模型） | 使用 `DownloadManager` 或分块下载 | 避免占用协程/UI 线程过久 |
| 实时数据（排行榜等） | 定期轮询 + 缓存到 Room | 减少网络请求频率，提升流畅度 |
| 配置/资源更新 | 启动时后台静默下载 | 用户戴上头显后立刻可用 |
| 网络状态变化 | 监听 `ConnectivityManager` | 用户可能在移动中断开 Wi-Fi |
| 用户数据上传 | 使用 `WorkManager` 延迟上传 | 不阻塞主流程，网络恢复后自动继续 |

## 快速练习

1. 对比 spatialml 中 VQAWrapper.kt 的 `HttpURLConnection` 实现，用 Retrofit 重写它会减少多少行代码？
2. 为一个 PICO 虚拟画廊应用设计 API 接口：获取作品列表、获取作品详情、上传用户截图
3. 如果用户在网络请求时切换到后台（PICO 用户摘下了头显），协程会怎样？应该怎么处理？

<details style="margin-top: 1rem; cursor: pointer;">
  <summary>点击查看提示</summary>
  <ol>
    <li>大约从 40+ 行减少到 10 行以内。HttpURLConnection 需要手动管理连接、流、编码、反序列化、线程调度——Retrofit 一行注解搞定。</li>
    <li>
```kotlin
interface GalleryApi {
    @GET("api/artworks")
    suspend fun getArtworks(): List<ArtworkResponse>

    @GET("api/artworks/{id}")
    suspend fun getArtworkDetail(@Path("id") id: String): ArtworkDetailResponse

    @Multipart
    @POST("api/artworks/{id}/screenshots")
    suspend fun uploadScreenshot(
        @Path("id") id: String,
        @Part screenshot: MultipartBody.Part
    ): UploadResponse
}
```
    </li>
    <li>如果协程在 <code>viewModelScope</code> 中启动，用户摘头显 → Activity 进入后台 → ViewModel 仍然存活（屏幕旋转等配置变化时）。但如果 Activity 被销毁（系统回收），<code>viewModelScope</code> 会被取消，网络请求会被取消。解决方案：使用 <code>withContext(NonCancellable)</code> 保护关键操作，或使用 <code>WorkManager</code> 处理需要保证完成的任务。</li>
  </ol>
</details>

> [!INFO] 参考资料
> - PICO Demo 参考：`spatialml-0.13.3/SuperResolutionApp/.../vm/VQAWrapper.kt` — HttpURLConnection 实际用法
> - [Retrofit 官方文档](https://square.github.io/retrofit/)
> - [OkHttp 官方文档](https://square.github.io/okhttp/)
> - [Android 网络状态监听](https://developer.android.com/training/connectivity/network-state)

---
**上一课**: [[s05-data-persistence|第S5课]] | **下一课**: [[s07-pico-sdk-supplement-api|第S7课]]