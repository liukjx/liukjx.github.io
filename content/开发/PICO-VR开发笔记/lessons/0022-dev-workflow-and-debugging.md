---
title: "第22课：空间应用开发工作流与调试"
description: "掌握 PICO 空间应用的标准化开发工作流，从需求到验证的完整闭环，以及常见问题的调试方法。"
---

# 第22课：空间应用开发工作流与调试

**本课目标**：掌握 PICO 空间应用的标准化开发工作流，从需求到验证的完整闭环，以及常见问题的调试方法。

## 1. 开发节奏

空间应用的开发遵循固定的节奏：

📋 需求分析 → 💻 实现 → 🔨 构建 → 📲 安装 → ▶️ 启动 → 👀 观察 → 🐛 修复 → 📋 验证

每次只做一个功能点，从需求到验证完整跑通一个周期，再进入下一个。

## 2. 实现前准备工作

在修改代码之前，先明确：

- **目标**：用户可见的行为变化是什么？
- **影响范围**：哪些文件会受影响？
- **验收标准**：怎么证明功能正常工作？
- **风险**：可能导致崩溃/构建失败的场景？

## 3. 构建与自检

```bash
# 1. 编译检查
./gradlew assembleDebug

# 2. 如果有单元测试
./gradlew testDebugUnitTest

# 3. 如果有 instrument 测试
./gradlew connectedAndroidTest
```

> [!WARNING] ⚠️ 错误处理原则
> 编译错误自己排查修复。读取第一个错误信息 → 修复 → 重新运行，直到通过。不要问用户。

## 4. 部署到目标设备

确保目标设备就绪：

```bash
# 检查设备
pico-cli device list --format json
pico-cli emulator status --format json

# 安装
pico-cli app install app/build/outputs/apk/debug/app-debug.apk

# 启动
pico-cli app launch com.pico.spatial.sample.animation \
  --activity .platform.LaunchActivity
```

## 5. 收集运行证据

每次启动后立刻收集：

| 证据类型 | 适用场景 | 命令/方法 |
|---|---|---|
| 截屏 | 静态 UI / 模型 / 状态 | `pico-cli capture screenshot --out ./artifacts/screen.png` |
| 日志 | 交互 / 动画 / 物理 / 崩溃 | `pico-cli app logcat --lines 300 --level E` |
| 崩溃缓冲 | 所有场景 | `adb logcat -b crash -d` |
| 性能数据 | 帧率 / 卡顿 | `pico-cli perf monitor run --app <pkg>` |

## 6. 崩溃修复循环

### 🔴 应用崩溃

1. 清除日志：`adb logcat -c`
2. 停止应用：`pico-cli app stop <pkg>`
3. 重新启动：`pico-cli app launch <pkg>`
4. 获取崩溃：`adb logcat -b crash -d`
5. 获取错误：`pico-cli app logcat --lines 500 --level E`

### 🟡 场景黑屏

1. Stage 没有 Skybox/IBL？
2. 实体没有添加到场景？
3. 坐标超出视野？
4. 材质/光照问题？
5. 检查 transform 的单位（米 vs 厘米）

### 🟡 模型不显示

1. `asset://` 路径是否正确？
2. Gradle 中 noCompress 配置了吗？
3. 加载完成后 addEntity 了吗？
4. 模型格式是否支持？

### 🟡 交互无响应

1. 有 CollisionComponent 吗？
2. 有 InteractableComponent 吗？
3. 同一个 pointerInput 有多个手势？
4. 触摸目标够大吗？

### 🔴 构建失败

1. 读第一个错误，不要看最后一个
2. 检查 Gradle 版本兼容性
3. 检查依赖版本冲突
4. 检查 Kotlin/AGP 版本匹配

### 🔴 启动闪退

1. 检查 Manifest 的 Activity 声明
2. 检查 metadata 配置（windowcontainer vs stage）
3. 检查 Application 类是否声明
4. 检查依赖排除是否完整

## 7. 常见问题快速诊断表

| 症状 | 最可能的原因 | 快速检查 | 参考 |
|---|---|---|---|
| Stage 场景全黑 | 没有设置 Skybox/IBL | 检查初始化代码 | [[0014-building-from-scratch|第14课]] |
| 模型看不到 | 坐标/缩放不对 | 检查 transform | [[0019-scene-asset-workflow|第19课]] |
| 手势不触发 | 缺 CollisionComponent | 检查组件的添加 | [[0012-spatial-ui|第12课]] |
| 动画不动 | 没调用 playAnimation | 检查 AnimationPlaybackController | [[0013-remaining-modules|第13课]] |
| APK 安装失败 | abiFilter 未配置 | 检查 build.gradle.kts | [[0005-android-project-structure|第5课]] |
| 编译报 compose 冲突 | 缺少 resolutionStrategy exclude | 检查 gradle 配置 | [[0021-porting-android-app|第21课]] |
| 帧率低/卡顿 | 主线程阻塞 | 检查 loadSuspend 使用 | [[0018-performance-diagnosis|第18课]] |
| 日志无输出 | 设备未连接 | pico-cli device list | [[0017-pico-cli-toolchain|第17课]] |

## 8. 文档更新

每个功能验证通过后，更新项目文档：

- **AGENTS.md**：当前行为、关键文件、构建/运行命令、验证记录
- 保持简洁：不是教程，而是导航指南
- 保存截图到 `artifacts/` 便于后续参考

## 9. 完整工作流命令速查

```bash
# ===== 构建 =====
./gradlew assembleDebug

# ===== 设备准备 =====
pico-cli emulator doctor --format json
pico-cli device list --format json
pico-cli emulator start --avd <name> --wait-timeout 180 -y

# ===== 部署 =====
pico-cli app install app/build/outputs/apk/debug/app-debug.apk

# ===== 启动 + 收集证据 =====
adb logcat -c
pico-cli app stop <package>
pico-cli app launch <package> --activity .platform.LaunchActivity
adb logcat -b crash -d
pico-cli app logcat --lines 300 --level E
pico-cli capture screenshot --out ./artifacts/feature-xxx-screen.png
```

## 10. 发布准备：Experimental API 与 PICO Store 上架限制

> [!WARNING] 🔴 重要：这直接影响你能否发布应用

PICO Spatial SDK 中有部分 API 标记为 **Experimental（实验性）**，使用这些 API 需要显式声明，且会阻止应用上架 PICO Store。

### 10.1 什么是 Experimental API

Experimental API 是指尚未正式发布、仍在快速迭代中的接口：

- 功能可能不稳定或有缺陷
- **不保证向后兼容**——升级 SDK 后需要修改代码
- 可能在未来版本中被**大幅修改或直接移除**

### 10.2 启用 Experimental API

在 AndroidManifest.xml 的 `<application>` 标签中添加：

```xml
<meta-data
    android:name="pico.spatial.use_experimental_api"
    android:value="1" />
```

不带此标记时调用 Experimental API 会抛出异常。

### 10.3 PICO Store 上架限制

> [!WARNING] 🚫 使用 Experimental API 的应用无法上架 PICO Store！

- PICO Store 审核系统会检测 `pico.spatial.use_experimental_api` 标记
- 检测到该标记的应用**直接拒绝上架**
- Experimental API **仅可用于开发、测试和原型验证**
- 正式发布版本**不得**启用此标记

因此，在开发初期使用 Experimental API 快速验证概念是可行的，但在准备发布前必须确保：

1. 移除 Manifest 中的 `pico.spatial.use_experimental_api` 标记
2. 将使用了 Experimental API 的代码替换为正式 API 或自行实现
3. 完整测试替换后的功能

## 11. 开发原则总结

1. **一个需求一个周期**：不要同时改多个功能
2. **先构建，再运行验证**：不要跳过构建
3. **自动修复编译错误**：不要问用户
4. **每次验证都要收集证据**：截屏+日志
5. **崩溃后至少自我修复一次**：再问用户
6. **保持文档更新**：AGENTS.md 是关键

> [!TIP] 🎉 恭喜完成全部课程！
> 你已经完成了 PICO 空间应用开发的完整学习路径。从 Kotlin 入门 → Android 基础 → PICO SDK 核心 → 综合实践 → 工具链与实战，涵盖了所有 22 课。
>
> 现在你具备了独立开发 PICO VR 空间应用的能力。需要开始做一个完整的项目练手吗？

> [!INFO]
> 📅 PICO Spatial SDK 0.13.3

---
**上一课**: [[0021-porting-android-app|第21课：应用移植]] | **下一课**: [[0016-capability-map|能力地图]]