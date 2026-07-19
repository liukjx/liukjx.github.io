---
title: 第18课：空间应用性能诊断与优化
description: 掌握 PICO 空间应用的性能分析方法和优化技术，能够独立诊断卡顿、丢帧等问题，并知道从何处入手优化。
---

# 空间应用性能诊断与优化

**本课目标**：掌握 PICO 空间应用的性能分析方法和优化技术，能够独立诊断卡顿、丢帧等问题，并知道从何处入手优化。

> [!WARNING] **🎯 性能目标**：PICO 空间应用的目标是 **90fps**（约 11.1ms/帧）。超过这个预算就会丢帧，导致用户眩晕、体验下降。

## 1. 性能基础概念

### 1.1 核心术语

| 术语 | 含义 | 参考值 |
| --- | --- | --- |
| FPS | 每秒帧数 | 目标 90 |
| 帧时间 | 每帧渲染耗时 | 目标 ≤ 11.1ms |
| Jank | 卡顿/丢帧 | 帧时间 > 16.7ms |
| DrawCall | CPU 向 GPU 发起的绘制命令 | 建议 ≤ 200 |
| Triangle | 每帧渲染的三角形数 | 建议 ≤ 300K |
| SPR | PICO Spatial Runtime（空间运行时） | 系统进程 |
| Eng-Render | 引擎渲染线程 | SPR 的子线程 |

### 1.2 统一渲染管线

每一帧在 PICO 系统中经历的完整路径：

App 生产（`beginSpatialFrame`）→ App→SPR 交接（`Handoff`）→ SPR 消费（`Spatial_Main` 消费）→ Eng-Render 提交（引擎渲染）→ OpenXR/合成器（`Compositor`）

任何一个阶段超预算都会导致整帧超时。诊断时要用这个管线思路排查"第一个晚了的环节"。

## 2. 性能诊断工具

### 2.1 pico-cli perf 实时诊断

```bash
# 运行实时性能诊断（推荐 30 秒以上）
pico-cli perf monitor run \
  --app com.pico.spatial.sample.welcomespace \
  --duration 30 \
  --output ./perf_analyze/report.json
```

输出包含：**jankReports**（卡顿窗口）、**diagnosis.status**（normal/warning/abnormal）、**diagnosis.category**、**diagnosis.rule**。

### 2.2 Perfetto Trace 捕获

```bash
# 检查 Perf 环境
pico-cli perf doctor install

# 启动 Perf Daemon
pico-cli perf daemon start

# 捕获 Trace（与 monitor 同时运行，用相同的 duration）
pico-cli perf trace record \
  --duration 30 \
  -o ./perf_analyze/trace.perfetto-trace

# 加载 Trace 进行分析
pico-cli perf trace load \
  ./perf_analyze/trace.perfetto-trace

# 查询 Trace 中的特定数据
pico-cli perf trace query \
  --input ./perf_analyze/trace.perfetto-trace \
  --query "SELECT * FROM slice WHERE name LIKE '%Choreographer%'"
```

> [!NOTE] **💡 同时收集**：pico-cli perf monitor 和 perf trace record 应该**同时**运行，使用相同的 duration。monitor 给出宏观诊断，trace 给出微观细节。

## 3. 7 步诊断工作流

### 步骤 1：确认参数（Gate 1）

在采集之前确认：

- **package**：目标应用包名
- **duration**：采集时长（≥30 秒）
- **app_type**：release 或 debuggable（debuggable 的性能数据不能代表正式发布）
- **device_type**：模拟器数据不可靠，优先使用真机

### 步骤 2：执行采集（Gate 2 → 采集）

```bash
# 并行运行两个采集
pico-cli perf monitor run --app <pkg> --duration 30 -o report.json
pico-cli perf trace record --duration 30 -o trace.perfetto-trace
```

### 步骤 3：加载数据

```bash
pico-cli perf daemon status
pico-cli perf daemon start
pico-cli perf trace load ./trace.perfetto-trace
```

### 步骤 4：数据总览

查看：帧率概况、SPR 异常帧分布、CPU/GPU 总体负载、资源复杂度。

### 步骤 5：数据验证

检查：Trace 时长 ≥3s、关键线程存在（app 主线程、RenderThread、Spatial_Main、Eng-Render、XR_Wait、gpu_frame_end）、时间对齐、`has_perf_issue` 判断。

### 步骤 6：窗口钻取分析

选择 P0（Top 3 最重要的卡顿窗口）和 P1（接下来 10 个辅助窗口），对每个窗口：

1. 选定关键线程
2. 检查 CPU 状态分布（Running / Runnable / Sleeping / Blocked）
3. 检查 Top 耗时切片
4. 检查等待/锁/GC
5. 选出 Top-10 最差帧，逐帧钻取到叶原因
6. 映射到统一渲染管线，找到"第一个晚了的环节"

### 步骤 7：根因总结

允许的根因分类：

| 根因 | 含义 |
| --- | --- |
| `app_main_cpu_hotspot` | 应用主线程 CPU 热点 |
| `app_render_thread_blocked` | 应用渲染线程阻塞 |
| `app_content_pressure_on_spr` | 应用内容对 SPR 造成压力 |
| `spr_cpu_pipeline_pressure` | 空间运行时 CPU 管线压力 |
| `spr_gpu_pipeline_pressure` | 空间运行时 GPU 管线压力 |
| `app_spr_interlock` | App 和 SPR 互相等待 |
| `gpu_pressure` | GPU 压力 |
| `system_pressure` | 系统级压力（追踪等） |
| `xr_runtime_or_compositor_pressure` | XR 运行时/合成器压力 |

## 4. 性能预算

| 指标 | 目标值 |
| --- | --- |
| 目标 FPS | 90 |
| 每帧预算 | ≤ 11.1ms |
| DrawCall | ≤ 200 |
| Triangle | ≤ 300K |
| 动态光源 | ≤ 6 |
| 透明物体 | ≤ 30 |

## 5. 常见优化策略

### 5.1 资源加载优化

```kotlin
// ❌ 错误：在主线程同步加载
Entity.load("asset://large_model.glb")

// ✅ 正确：使用异步加载
val model = Entity.loadSuspend("asset://large_model.glb")
// 或在 IO 线程加载
val model = withContext(Dispatchers.IO) { Entity.load("asset://large_model.glb") }
```

### 5.2 Foveated Rendering（注视点渲染）

注视点渲染是 XR 设备的关键性能优化技术：

- **原理**：人眼只在注视点中心有高分辨率，边缘区域降低渲染分辨率
- **效果**：可降低 30-50% 的 GPU 负载，几乎不影响视觉体验
- **PICO 设备**：默认启用固定注视点渲染
- **模拟器**：不支持注视点渲染（性能数据不可靠的原因之一）

SDK 提供了配置界面（通过 SDK 正式 API 控制）：

```kotlin
// 启用/配置注视点渲染（通过系统设置）
// 在设备开发者选项中可配置注视点渲染级别
// Level 0 = 关闭, Level 1 = 低, Level 2 = 中, Level 3 = 高

// 代码中检查是否支持
val foveationLevel = device?.props?.get("pico.foveation.level")
// 返回值: "0" = 关闭, "1"/"2"/"3" = 不同强度
```

> [!NOTE] **💡 建议**：一般情况下保持系统默认设置。只有在需要极致性能时（如复杂场景），才通过系统 API 调整注视点渲染级别。注意模拟器不支持此功能。

### 5.2 性能 Checklist

开发阶段的每日检查项：

| 检查项 | 标准 | 验证方式 |
| --- | --- | --- |
| 主线程不要阻塞 | 无 > 5ms 的同步操作 | Perfetto Timeline |
| 动画 API 在主线程调用 | @MainThread | 代码审查 |
| 资源加载使用异步 | loadSuspend / IO dispatcher | 代码审查 |
| 每帧 DrawCall | ≤ 200 | pico-cli perf monitor |
| 每帧三角形数 | ≤ 300K | Perfetto 资源表 |
| 碰撞体使用简单形状 | 盒/球/胶囊，而非 Mesh | 代码审查 |
| 物理世界共享 | 交互物体在同一 PhysicsWorldComponent 下 | 代码审查 |
| SpatialView 销毁时清理实体 | onDispose 或 CompositionDisposable | 代码审查 |
| AnimationPlaybackController 用完释放 | controller.close() | 代码审查 |
| 光照数量 | 动态光 ≤ 6 | 场景审查 |
| 透明物体 | ≤ 30 个 | 场景审查 |

### 5.3 常见性能陷阱

| 陷阱 | 表现 | 解决 |
| --- | --- | --- |
| 主线程同步加载模型 | 掉帧、卡死 | 使用 loadSuspend |
| 每帧重建 ECS System | GC 频繁 | 复用 System 对象 |
| 过多透明物体 | Overdraw 高 | 减少或合并透明物体 |
| 复杂 Mesh 碰撞体 | 物理计算量大 | 用简单形状替代 |
| 每帧大量 new 对象 | GC 卡顿 | 对象池复用 |
| 未关闭的 AnimationController | 资源泄漏 | lifecycleScope 中 close() |
| Stage 无 Skybox/IBL | 场景全黑 | 配置自定义 skybox |

## 6. 真机 vs 模拟器

> [!WARNING] **⚠️ 重要约束**：性能诊断工具的目标是真机（物理 PICO 设备）。**模拟器上的性能数据不可靠**——GPU 行为、帧率、SPR 行为都与真机不同。如果只能用模拟器，需要明确标注这是"非权威分析"。

## 7. 快速诊断流程（5 分钟版）

当你只是想知道"是否卡顿"而不做深入分析时：

```bash
# 1. 启动应用
pico-cli app launch com.pico.spatial.sample.welcomespace

# 2. 运行 10 秒快速诊断
pico-cli perf monitor run \
  --app com.pico.spatial.sample.welcomespace \
  --duration 10 \
  --output ./quick-check.json

# 3. 查看结果
# diagnosis.status = "normal" → 没问题
# diagnosis.status = "warning/abnormal" → 需要深入分析
---

📅 PICO Spatial SDK 0.13.3 · 参考 demo：`PICOProject/performance-profiling-0.13.3/` · [[0017-pico-cli-toolchain|← 第17课：CLI 工具链]] · [[0019-scene-asset-workflow|→ 第19课：场景资产工作流]]

---

**上一课**: [[0017-pico-cli-toolchain]] | **下一课**: [[0019-scene-asset-workflow]]