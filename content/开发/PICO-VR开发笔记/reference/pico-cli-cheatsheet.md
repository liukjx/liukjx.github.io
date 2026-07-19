---
title: "PICO CLI 命令速查表"
description: "PICO CLI 命令行工具的常用命令快速参考，涵盖环境、模拟器、应用管理、文件操作、性能诊断与设备控制。"
---

# PICO CLI 命令速查表

快速参考 —— [[0017-pico-cli-toolchain|第17课详情]]

## 环境

| 操作 | 命令 |
|------|------|
| 环境诊断 | `pico-cli emulator doctor --format json` |
| 列出模拟器 | `pico-cli emulator list --managed-only` |
| 列出设备 | `pico-cli device list --format json` |

## 模拟器

| 操作 | 命令 |
|------|------|
| 创建 AVD | `pico-cli emulator create --avd <name> --source auto -y` |
| 启动 | `pico-cli emulator start --avd <name> --wait-timeout 180 -y` |
| 查看状态 | `pico-cli emulator status --format json` |
| 停止 | `pico-cli emulator stop` |
| 删除 AVD | `pico-cli emulator delete --avd <name> -y` |
| 导出日志 | `pico-cli emulator dump-logs --out ./logs/` |

## 应用

| 操作 | 命令 |
|------|------|
| 安装 APK | `pico-cli app install app/build/outputs/apk/debug/app-debug.apk` |
| 查询信息 | `pico-cli app info <pkg> --format json` |
| 启动 | `pico-cli app launch <pkg> --activity <activity>` |
| 停止 | `pico-cli app stop <pkg>` |
| 卸载 | `pico-cli app uninstall <pkg>` |
| 查看日志 | `pico-cli app logcat --lines 300 --level E` |
| 监视崩溃 | `pico-cli app watch-crash <pkg> --start --interval 2` |

## 截图 & 文件

| 操作 | 命令 |
|------|------|
| 截屏 | `pico-cli capture screenshot --out ./artifacts/screen.png` |
| 推送文件 | `pico-cli files push <local> <remote>` |
| 拉取文件 | `pico-cli files pull <remote> [local]` |
| 查看文件 | `pico-cli files cat <remote>` |
| 删除文件 | `pico-cli files rm <remote>` |

## 性能

| 操作 | 命令 |
|------|------|
| 实时诊断 | `pico-cli perf monitor run --app <pkg> --duration 30 -o report.json` |
| Trace 捕获 | `pico-cli perf trace record --duration 30 -o trace.perfetto-trace` |
| Trace 加载 | `pico-cli perf trace load ./trace.perfetto-trace` |
| daemon 状态 | `pico-cli perf daemon status` |

## 设备

| 操作 | 命令 |
|------|------|
| 设备信息 | `pico-cli device info --format json` |
| 电池状态 | `pico-cli device battery --format json` |
| 设备属性 | `pico-cli device props --filter pico` |
| Shell 命令 | `pico-cli shell <cmd>` |
| 系统日志 | `pico-cli log --lines 150 --tag AndroidRuntime --level E` |

---
**上一课**: [[0016-capability-map|能力地图]] | **下一课**: [[0018-performance-diagnosis|第18课：空间应用性能诊断与优化]]