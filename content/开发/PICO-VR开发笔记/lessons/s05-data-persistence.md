---
title: "补充课5：Android 数据持久化 — SharedPreferences 与 Room"
description: "介绍 Android 最常用的两种持久化方式：SharedPreferences 轻量键值对存储与 Room 结构化数据库，以及在 PICO 应用中的实践场景。"
---

# Android 数据持久化 — SharedPreferences 与 Room

PICO Demo 中所有状态都存在内存里（ViewModel + StateFlow），没有使用任何持久化方案。但真实应用几乎总是需要存储数据——用户设置、锚点持久化、收藏列表等。本课介绍 Android 最常用的两种持久化方式。

> [!NOTE]
> **核心认知**
>
> PICO Demo 不做持久化是因为它们是 Demo——每次启动都是全新状态。但你的真实应用需要记住用户的设置、上次的位置、收藏的锚点。本课的知识在 Demo 代码中看不到，但一定会用上。

## 1. SharedPreferences — 轻量键值对存储

`SharedPreferences` 是 Android 最简单的持久化方案，适合存储少量简单数据（设置、开关、字符串）。

### 基本用法

```kotlin
// 写入数据
val prefs = context.getSharedPreferences("app_settings", Context.MODE_PRIVATE)
prefs.edit()
    .putString("username", "alice")
    .putBoolean("dark_mode", true)
    .putInt("launch_count", 5)
    .apply()  // 异步提交 —— 推荐
    // 或 .commit()  // 同步提交，返回 boolean 表示成功与否

// 读取数据
val username = prefs.getString("username", "")  // 第二个参数是默认值
val darkMode = prefs.getBoolean("dark_mode", false)
val launchCount = prefs.getInt("launch_count", 0)
```

### ViewMode l 中使用

```kotlin
class SettingsViewModel(context: Context) : ViewModel() {

    private val prefs = context.getSharedPreferences("app_settings", Context.MODE_PRIVATE)

    private val _darkMode = MutableStateFlow(
        prefs.getBoolean("dark_mode", false)
    )
    val darkMode: StateFlow<Boolean> = _darkMode.asStateFlow()

    fun toggleDarkMode() {
        val newValue = !_darkMode.value
        _darkMode.value = newValue
        // 持久化
        prefs.edit().putBoolean("dark_mode", newValue).apply()
    }
}

// 在 Compose 中收集
@Composable
fun SettingsScreen(viewModel: SettingsViewModel) {
    val isDarkMode by viewModel.darkMode.collectAsStateWithLifecycle()
    // UI 自动响应状态变化
}
```

> [!TIP]
> **apply() vs commit()**<br>
> `apply()`：异步写入，不阻塞 UI 线程。推荐在绝大多数场景使用。<br>
> `commit()`：同步写入，返回 `Boolean`。只在需要知道写入是否成功时使用（如"保存后立即退出"）。<br><br>
> Android 内部会定期将 apply 的写入 flush 到磁盘，Activity 销毁时也会 flush。

### SharedPreferences 的局限

| 局限 | 说明 |
| --- | --- |
| 只能存简单类型 | String, Int, Boolean, Float, Long, Set\<String\> |
| 不适合大量数据 | 整个文件读入内存，数据多时会卡 |
| 不支持结构化查询 | 不能按条件查询、排序、聚合 |
| 类型不安全 | getString 返回 String?，需要处理 null |

> [!NOTE]
> **Android 14+ 新选择：DataStore**<br>
> Google 推荐用 `DataStore`（基于 Flow）替代 SharedPreferences。它支持异步读取、类型安全、且基于协程。但 PICO 开发中 SharedPreferences 仍然广泛使用且足够简单，这里先介绍 SharedPreferences，你遇到 DataStore 时再深入。

## 2. Room — 结构化数据库

Room 是 Android 官方的 SQLite 抽象层，提供编译时 SQL 验证和 Kotlin 协程 Flow 支持。

### Room 三要素

```kotlin
// 1. Entity —— 数据表定义
@Entity(tableName = "artworks")
data class ArtworkEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "title") val title: String,
    @ColumnInfo(name = "artist") val artist: String,
    @ColumnInfo(name = "model_path") val modelPath: String,
    @ColumnInfo(name = "created_at") val createdAt: Long = System.currentTimeMillis()
)

// 2. DAO —— 数据访问对象（用接口或抽象类）
@Dao
interface ArtworkDao {
    @Query("SELECT * FROM artworks ORDER BY created_at DESC")
    fun getAllArtworks(): Flow<List<ArtworkEntity>>  // Flow 响应式查询

    @Query("SELECT * FROM artworks WHERE id = :id")
    suspend fun getArtworkById(id: String): ArtworkEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertArtwork(artwork: ArtworkEntity)

    @Delete
    suspend fun deleteArtwork(artwork: ArtworkEntity)

    @Query("DELETE FROM artworks")
    suspend fun deleteAll()
}

// 3. Database —— 数据库类
@Database(entities = [ArtworkEntity::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun artworkDao(): ArtworkDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "gallery_database"
                ).build().also { INSTANCE = it }
            }
        }
    }
}
```

### 依赖配置

```kotlin
// libs.versions.toml
[versions]
room = "2.6.1"
ksp = "2.1.0-1.0.29"

[libraries]
room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }

[plugins]
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }

// app/build.gradle.kts
plugins {
    alias(libs.plugins.ksp)  // 添加 KSP 插件
}
android {
    // ...
}
dependencies {
    implementation(libs.room.runtime)
    implementation(libs.room.ktx)
    ksp(libs.room.compiler)  // 用 ksp 替代 annotationProcessor
}
```

### ViewModel + Room + Flow 完整链路

```kotlin
// Repository 层
class ArtworkRepository(private val artworkDao: ArtworkDao) {
    val allArtworks: Flow<List<ArtworkEntity>> = artworkDao.getAllArtworks()

    suspend fun addArtwork(artwork: ArtworkEntity) = artworkDao.insertArtwork(artwork)
    suspend fun removeArtwork(artwork: ArtworkEntity) = artworkDao.deleteArtwork(artwork)
}

// ViewModel 层
class GalleryViewModel(
    private val repository: ArtworkRepository
) : ViewModel() {

    // Room + Flow 天然集成——数据库变化自动推送
    val artworks: StateFlow<List<ArtworkEntity>> =
        repository.allArtworks.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    fun saveArtwork(artwork: ArtworkEntity) {
        viewModelScope.launch {
            repository.addArtwork(artwork)
        }
    }
}

// Compose 层
@Composable
fun GalleryScreen(viewModel: GalleryViewModel) {
    val artworks by viewModel.artworks.collectAsStateWithLifecycle()
    LazyColumn {
        items(artworks) { artwork ->
            Text("${artwork.title} — ${artwork.artist}")
        }
    }
}
```

> [!NOTE]
> **Room 的 Flow 查询为什么强大？**<br>
> Room 的 DAO 支持返回 `Flow<T>`。每当数据库表发生变化，Room 自动重新执行查询并发射新结果。这意味着：**你不需要手动刷新数据**。在 ViewModel 中改数据库 → Compose UI 自动更新——这是典型的响应式数据流。

## 3. PICO 场景：持久化锚点位置

在第 10 课中学过 `WorldAnchor` 可以持久化。在实际应用中，你可能需要保存锚点的语义信息（"这个锚点对应哪个虚拟物体"）：

```kotlin
// 锚点 + 业务数据的关联存储
@Entity(tableName = "saved_anchors")
data class SavedAnchor(
    @PrimaryKey val uuid: String,          // WorldAnchor 的 UUID
    @ColumnInfo val label: String,         // 用户给这个位置的名称
    @ColumnInfo val modelPath: String,     // 放在这个位置的模型路径
    @ColumnInfo val scale: Float,          // 缩放比例
    @ColumnInfo val savedAt: Long          // 保存时间
)

@Dao
interface AnchorDao {
    @Query("SELECT * FROM saved_anchors ORDER BY savedAt DESC")
    fun getAllAnchors(): Flow<List<SavedAnchor>>

    @Insert
    suspend fun saveAnchor(anchor: SavedAnchor)

    @Query("DELETE FROM saved_anchors WHERE uuid = :uuid")
    suspend fun deleteAnchor(uuid: String)
}

// 恢复已保存的锚点
class AnchorRestoreManager(
    private val anchorDao: AnchorDao,
    private val worldTrackingManager: WorldTrackingManager
) {
    suspend fun restoreAllAnchors(): List<SavedAnchor> {
        val savedAnchors = anchorDao.getAllAnchors().first()
        // 遍历保存的锚点，尝试在世界中恢复
        savedAnchors.forEach { saved ->
            val worldAnchor = worldTrackingManager.getAnchor(saved.uuid)
            if (worldAnchor != null) {
                // 锚点还在，恢复虚拟物体
                placeVirtualObject(worldAnchor, saved.modelPath, saved.scale)
            } else {
                // 锚点已丢失（空间数据清除）
                anchorDao.deleteAnchor(saved.uuid)
            }
        }
        return savedAnchors
    }
}
```

## 4. 持久化方案选择

| 需求 | 方案 | 原因 |
| --- | --- | --- |
| 用户偏好设置（暗色模式、音量） | SharedPreferences | 少量键值对，简单快速 |
| 收藏锚点列表（10-100 条） | Room | 结构化数据，支持查询 |
| 缓存网络响应 | Room 或 DataStore | 结构化或序列化 JSON |
| 3D 模型文件 | 文件系统（保存到 app 私有目录） | 二进制大文件，不适用数据库 |
| 用户登录凭证 | EncryptedSharedPreferences | 需要加密存储 |

## 5. PICO Demo 中的"伪持久化"

虽然 Demo 没有用持久化框架，但它们展示了**从何处获取初始化数据**——这些数据源将来可以用持久化替代：

```kotlin
// spatialmesh/MeshScanManager.kt
// 当前：每次启动全新扫描
// 将来：可以将扫描到的锚点 UUID 存入 Room，下次启动时恢复

// spatialui/FeedsPage.kt
// 当前：硬编码的演示数据
// 将来：可以从 Room 加载用户收藏的内容列表

// animation/AnimationPlayView.kt
// 当前：每次重置到默认状态
// 将来：可以从 SharedPreferences 读取用户的动画偏好设置
```

## 快速练习

1. 用 Room 设计一个表结构来保存 PICO 应用的"用户书签"——包含锚点位置、模型路径、书签名称
2. 如果要在 PICO 应用启动时恢复上次保存的锚点，流程图应该是怎样的？
3. SharedPreferences 的 apply() 和 commit() 有什么区别？在协程环境下应该用哪个？

<details>
  <summary>点击查看提示</summary>
  <ol>
    <li><code>SavedAnchor(uuid, label, modelPath, scale, savedAt)</code> — 参考第 3 节的 Entity 定义</li>
    <li>启动 → 检查 Room 中保存的锚点列表 → 逐个调用 <code>worldTrackingManager.getAnchor(uuid)</code> → 若存在则恢复虚拟物体，若不存在则删除记录</li>
    <li><code>apply()</code> 异步写入不阻塞线程，推荐；<code>commit()</code> 同步写入可能阻塞 UI 线程。在协程中如果有 <code>Dispatchers.IO</code> 上下文，<code>commit()</code> 也可以接受，但 <code>apply()</code> 始终是安全选择。</li>
  </ol>
</details>

> [!INFO]
> **参考资料**<br>
> • [SharedPreferences 官方指南](https://developer.android.com/training/data-storage/shared-preferences)<br>
> • [Room 官方指南](https://developer.android.com/training/data-storage/room)<br>
> • [Hilt 依赖注入官方指南](https://developer.android.com/training/dependency-injection/hilt-android)（用于注入 Room DAO 到 ViewModel）

---
**上一课**: [[s04-android-permissions|补充课4：Android 权限系统与PICO空间权限]] | **下一课**: [[s06-networking-retrofit|补充课6：Android 网络请求 — Retrofit]]