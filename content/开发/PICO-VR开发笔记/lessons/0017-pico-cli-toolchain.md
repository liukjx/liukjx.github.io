---
title: "第17课：PICO CLI 工具链完全指南"
description: "掌握 pico-cli 命令行工具的完整用法，能够高效管理模拟器、设备、应用安装、日志收集、截屏和性能分析。"
---

# PICO CLI 工具链完全指南

**本课目标**：掌握 `pico-cli` 命令行工具的完整用法，能够高效管理模拟器、设备、应用安装、日志收集、截屏和性能分析。

> [!WARNING] 为什么学这个
> 空间应用开发离不开 CLI 工具。无论是启动模拟器、安装 APK、查看崩溃日志还是截屏取证，pico-cli 是中心入口。掌握它将你的开发效率提升 10 倍。

## 1. 环境检查

在开始任何操作之前，先检查环境是否就绪：

```bash
# 一站式环境诊断
pico-cli emulator doctor --format json

# 查看已有模拟器列表
pico-cli emulator list --managed-only --format json

# 查看连接的设备
pico-cli device list --format json
```

> [!NOTE] 命令输出格式
> 所有 pico-cli 命令都支持 `--format json` / `--format plain`，建议脚本解析用 JSON，人工阅读用 plain。

## 2. 模拟器生命周期

PICO 模拟器是在没有真机时的核心测试手段。

### 2.1 创建模拟器

```bash
# 创建一个 PICO 模拟器
pico-cli emulator create --avd Pico_Emulator_0_13 --source auto -y
```

### 2.2 启动模拟器

```bash
# 启动已有模拟器（等待最多 180 秒）
pico-cli emulator start --avd Pico_Emulator_0_13 --wait-timeout 180 -y

# 查看启动状态
pico-cli emulator status --format json
```

### 2.3 停止和删除

```bash
# 停止模拟器
pico-cli emulator stop

# 删除 CLI 创建的模拟器（不会删除手动创建的）
pico-cli emulator delete --avd Pico_Emulator_0_13 -y

# ⚠️ 删除下载的模拟器镜像（破坏性操作，仅当明确需要时）
pico-cli emulator delete-image -y  # 需要用户确认
```

> [!WARNING] 下载耐心
> 首次启动模拟器可能需要下载镜像，10 分钟以上是正常的。不要因为"跑太久"就判断失败，只有在 CLI 返回明确错误时才算失败。

### 2.4 故障排查

```bash
# 收集模拟器日志
pico-cli emulator dump-logs --out ./emulator-logs/
```

## 3. 设备管理

```bash
# 列出所有设备
pico-cli device list --format json

# 查看设备详细信息
pico-cli device info --format json

# 查看电池状态
pico-cli device battery --format json

# 查看设备属性（过滤 PICO 相关）
pico-cli device props --filter pico --format plain

# 单独查询某个属性
pico-cli shell getprop ro.product.model
```

**设备选择优先级**：

1. 显式指定：`--device <序列号>`
2. 环境变量：`PICO_CLI_DEVICE` 或 `ADB_SERIAL`
3. CLI 自动选择

当多个设备连接时，**务必**使用 `--device <id>` 显式指定目标。

## 4. 应用操作

这是最常用的操作组：

### 4.1 安装 APK

```bash
pico-cli app install app/build/outputs/apk/debug/app-debug.apk
```

### 4.2 查询已安装应用

```bash
# 列出所有应用
pico-cli app list

# 查看指定应用信息
pico-cli app info com.pico.spatial.sample.welcomespace --format json
```

### 4.3 启动应用

```bash
# 按包名启动（自动解析入口 Activity）
pico-cli app launch com.pico.spatial.sample.welcomespace

# 如果失败，显式指定 Activity
pico-cli app launch com.pico.spatial.sample.welcomespace \
  --activity .platform.LaunchActivity
```

### 4.4 停止和卸载

```bash
pico-cli app stop com.pico.spatial.sample.welcomespace
pico-cli app uninstall com.pico.spatial.sample.welcomespace
```

### 4.5 日志收集

三种日志收集方式，应对不同场景：

```bash
# 方式 1：查看应用日志（推荐）
pico-cli app logcat --lines 300 --level E

# 方式 2：查看系统日志（带标签过滤）
pico-cli log --lines 200 --tag AndroidRuntime --level E

# 方式 3：监视崩溃（持续观察）
pico-cli app watch-crash com.pico.spatial.sample.welcomespace --start --interval 2
```

## 5. 屏幕截取

```bash
# 截取屏幕
pico-cli capture screenshot --out ./artifacts/screen.png

# 多设备时指定设备
pico-cli capture screenshot --device <id> --out ./artifacts/screen.png
```

> [!WARNING] 空间容器限制
> pico-cli capture 截图基于 adb screencap，对于空间窗口（Volumetric/Stage），可能返回黑屏。这是平台限制，不是工具问题。

## 6. 文件管理

```bash
# 推送文件到设备
pico-cli files push ./local.png /sdcard/Download/demo-assets/

# 从设备拉取文件
pico-cli files pull /sdcard/Download/demo-assets/local.png ./

# 列出设备上的文件
pico-cli files ls /sdcard/Download/demo-assets/ -l

# 查看文件信息
pico-cli files stat /sdcard/Download/demo-assets/local.png --format json

# 创建目录 / 删除文件
pico-cli files mkdir /sdcard/Download/new-folder/
pico-cli files rm /sdcard/Download/temp.log
```

## 7. 命令行操作（adb 回退）

```bash
# 执行任意 adb shell 命令
pico-cli shell ls /sdcard/
pico-cli shell dumpsys activity activities
```

> [!WARNING] 不要用 shell input tap 操作空间窗口
> `pico-cli shell input tap x y` 只注入 2D 屏幕坐标，**无法**可靠地与空间窗口/Stage 中的 3D 内容交互。

## 8. 实战场景速查

### 场景 A：环境就绪检查

```bash
pico-cli emulator doctor --format json
pico-cli emulator list --managed-only --format json
pico-cli device list --format json
```

然后判断缺少什么：缺 SDK → 运行 emulator setup；缺设备 → 创建并启动模拟器。

### 场景 B：构建并部署到模拟器

```bash
cd PICOProject/animation-0.13.3/
./gradlew assembleDebug

pico-cli app install app/build/outputs/apk/debug/app-debug.apk
pico-cli app launch com.pico.spatial.sample.animation
pico-cli app logcat --lines 200 --level E
```

### 场景 C：应用崩溃后取证

```bash
# 1. 清除旧日志
adb logcat -c

# 2. 重新启动
pico-cli app stop com.pico.spatial.sample.animation
pico-cli app launch com.pico.spatial.sample.animation

# 3. 收集崩溃证据
adb logcat -b crash -d
pico-cli app logcat --lines 500 --level E
pico-cli capture screenshot --out ./artifacts/crash-screen.png
```

### 场景 D：一键验证工作流

每次实现新功能后的标准验证序列：

```bash
./gradlew assembleDebug
pico-cli device list --format json
pico-cli emulator status --format json

pico-cli app install app/build/outputs/apk/debug/app-debug.apk

adb logcat -c
pico-cli app stop <package>
pico-cli app launch <package> --activity <activity>

adb logcat -b crash -d
pico-cli app logcat --lines 300 --level E
pico-cli capture screenshot --out ./artifacts/feature-xxx-screen.png
```

## 9. 安全注意事项

| 命令 | 风险等级 | 说明 |
|------|----------|------|
| `emulator delete` | ⚠️ 中 | 删除 CLI 创建的模拟器，不删除手动创建的 |
| `emulator delete-image` | 🔴 高 | 删除下载的镜像文件，需要重新下载。Windows 上可能因 adb.exe 文件锁失败 |
| `files rm` | ⚠️ 中 | 删除设备上的文件，不可恢复 |
| `app uninstall` | ⚠️ 中 | 卸载应用 |
| `emulator start --wipe-data` | ⚠️ 中 | 会清除模拟器数据 |

## 10. pico-cli 命令全景图

```
pico-cli
├── emulator          # 模拟器生命周期
│   ├── doctor        # 环境诊断
│   ├── setup         # 安装向导
│   ├── create        # 创建 AVD
│   ├── start         # 启动模拟器
│   ├── stop          # 停止模拟器
│   ├── status        # 查看状态
│   ├── list          # 列出 AVD
│   ├── delete        # 删除 AVD
│   ├── dump-logs     # 收集日志
│   └── delete-image  # 删除镜像（破坏性）
├── device            # 设备管理
│   ├── list          # 列出设备
│   ├── connect       # 连接设备
│   ├── disconnect    # 断开设备
│   ├── info          # 设备信息
│   ├── battery       # 电池状态
│   └── props         # 设备属性
├── app               # 应用管理
│   ├── install       # 安装 APK
│   ├── list          # 列出应用
│   ├── info          # 应用信息
│   ├── launch        # 启动应用
│   ├── stop          # 停止应用
│   ├── uninstall     # 卸载应用
│   ├── logcat        # 查看日志
│   └── watch-crash   # 监视崩溃
├── capture           # 采集
│   └── screenshot    # 截屏
├── files             # 文件管理
│   ├── push          # 推送文件
│   ├── pull          # 拉取文件
│   ├── ls            # 列出文件
│   ├── mkdir         # 创建目录
│   ├── rm            # 删除文件
│   ├── cat           # 查看内容
│   └── stat          # 文件属性
├── log               # 系统日志
├── shell             # Adb Shell
└── perf              # 性能分析（见第18课）
```

---

**上一课**: [[0016-capability-map|第16课：能力地图]] | **下一课**: [[0018-performance-diagnosis|第18课：性能诊断]]
