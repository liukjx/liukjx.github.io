---
title: 开发环境搭建指南 — LearnOpenGL
description: OpenGL 开发环境搭建指南 — LearnOpenGL
tags: [opengl, 图形学, 参考]
date: 2025-01-01
---

# 开发环境搭建指南


本文档记录如何从零搭建 **LearnOpenGL** 项目的开发环境。核心工具链：**VS Code + CMake + C++ 编译器**，跨 Windows / macOS 通用。


> [!INFO]
> **📌 核心思路**
>
> VS Code 是编辑器，CMake 是构建系统，C++ 编译器（g++ / clang）负责编译。这个组合在任何平台都可用，不依赖特定 IDE。


## 所需工具一览


| 工具 | 作用 | Windows | macOS |
| --- | --- | --- | --- |
| VS Code | 代码编辑器 | 官网下载 | 官网下载 |
| CMake | 跨平台构建系统 | 官网下载 | 官网下载 / brew |
| 编译器 | 将 C++ 转成可执行文件 | MinGW-w64 (g++) | Clang (来自 Xcode) |
| GLFW | 窗口 + OpenGL 上下文 + 输入 | CMake 从源码编译 | brew install glfw |

> [!WARNING]
> **⚠️ 关于 MSVC 编译器**
>
> **MSVC**（Microsoft Visual C++，即 `cl.exe`）是 Visual Studio 自带的 Windows 专属编译器。本项目 lib/ 目录下预编译的 .lib 文件是 MSVC 格式的。但本文档选择 **MinGW-w64**，因为你可以在任意 Windows 电脑上用，不需要装 VS。代价是 GLFW 等库需要从源码编译（CMake 自动完成）。
 ============================================================  WINDOWS SECTION  ============================================================

## Windows 安装步骤


### 1 安装 VS Code


下载地址：[code.visualstudio.com](https://code.visualstudio.com/)


安装时建议勾选：


- ☑️ 添加到 PATH（环境变量）
- ☑️ 添加到"打开方式"菜单

### 2 安装 VS Code 扩展（插件）


打开 VS Code，点击左侧扩展图标（或按 Ctrl+Shift+X），搜索并安装：


| 扩展名称 | ID | 作用 |
| --- | --- | --- |
| C/C++ | ms-vscode.cpptools | 语法高亮、智能提示、调试 |
| CMake Tools | ms-vscode.cmake-tools | CMake 图形化操作（一键配置/构建） |

### 3 安装 MinGW-w64（C++ 编译器）


**推荐方式：通过 MSYS2 安装**（最新版、维护活跃）


1. 下载 MSYS2 安装器：[msys2.org](https://www.msys2.org/) → 下载 `msys2-x86_64-*.exe`
2. 按默认路径安装（`C:\msys64`）
3. 打开 **MSYS2 UCRT64** 终端（开始菜单里有）
4. 执行以下命令安装 MinGW-w64 工具链：

pacman -Syu


等待更新完成后，继续：


pacman -S mingw-w64-ucrt-x86_64-toolchain cmake


这个命令会安装 g++、gdb（调试器）、make、cmake 等一系列工具。


安装后，将 `C:\msys64\ucrt64\bin` 添加到系统环境变量 PATH 中：


1. 按 Win + R → 输入 `sysdm.cpl` → 高级 → 环境变量
2. 在"系统变量"中找到 `Path` → 编辑 → 新建
3. 添加 `C:\msys64\ucrt64\bin`
4. 确定保存


验证安装成功：


g++ --version


应该输出类似 `g++ (UCRT64) 14.x.x` 的信息。

### 4 获取 GLFW 等依赖库


项目预编译的 `lib/` 库是 MSVC 格式，MinGW 不能用。所以我们需要从源码编译 GLFW（一次性的）：


**方法 A：让 CMake 自动下载编译（推荐）**


在项目根目录下创建一个 `CMakePresets.json` 或用 CMake Tools 配置，设置 `FETCHCONTENT` 让 CMake 自动下载 GLFW 源码编译。具体操作见下面的"构建项目"步骤。


**方法 B：手动编译 GLFW（备选）**


1. 下载 GLFW 源码：[glfw.org](https://www.glfw.org/download.md) → Source package
2. 解压到 `C:\glfw`
3. 在 VS Code 终端中：

cd C:\glfw && mkdir build && cd buildcmake .. -G "MinGW Makefiles"cmake --build .


编译后生成的 `libglfw3.a` 就在 `C:\glfw\build\src` 中。


> [!TIP]
> **💡 后续章节**
>
> 学到光照、模型加载等章节时，还需要 ASSIMP、GLM（GLM 是 header-only，无需编译）。到时候再统一处理。

### 5 VS Code 配置 CMake


在 VS Code 中打开项目文件夹：


code "D:\学习\其他学习\图形学\opengl\LearnOpenGL"


按 Ctrl+Shift+P 打开命令面板 → 搜索 **CMake: Select Configure Preset** → 选择配置。


如果没有预设，可以按 Ctrl+Shift+P → **CMake: Configure**，CMake Tools 会自动找到 MinGW 的 g++ 编译器。


你也可以在项目根目录下创建 `.vscode/settings.json`：


```
{
  "cmake.configureSettings": {
    "CMAKE_C_COMPILER": "gcc",
    "CMAKE_CXX_COMPILER": "g++"
  }
}
```

> [!INFO]
> **🔧 项目已有的配置**
>
> 当前项目的 CMakeLists.txt 已经适配了 Windows 和 macOS。在 Windows 上它默认查找 `lib/` 目录下的预编译库。但我们用 MinGW，所以需要让 CMake 跳过预编译库，改用源码编译 GLFW。
 ============================================================  MACOS SECTION  ============================================================

## macOS 安装步骤


> [!INFO]
> **🍎 macOS 更简单！**因为 Homebrew 生态完善，所有依赖一行命令搞定。

### 1 安装 Xcode Command Line Tools


打开终端，执行：


xcode-select --install


会弹窗提示安装，点击"安装"即可。这提供了 Clang 编译器（包括 clang++）和必要的系统工具。


验证：


clang++ --version

### 2 安装 Homebrew（如果还没有）


/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

### 3 安装 CMake 和所有依赖库


brew install cmake glfw assimp glm freetype


这行命令一次安装所有需要的库。macOS 上不需要从源码编译任何东西。

### 4 安装 VS Code 及扩展


下载 VS Code：[code.visualstudio.com](https://code.visualstudio.com/)


安装后同样安装 C/C++ 和 CMake Tools 扩展。

### 5 构建项目


在终端中（或 VS Code 内）：


cd /path/to/LearnOpenGLmkdir build && cd buildcmake ..cmake --build . -j$(sysctl -n hw.logicalcpu)


构建完成后，可执行文件在 `build/src/` 下对应章节目录中。
 ============================================================  BUILD & RUN  ============================================================

## 构建与运行项目


### 方法一：VS Code 图形化操作（推荐）


1. 在 VS Code 中打开 `LearnOpenGL` 文件夹
2. 点击底部状态栏的 **CMake: [配置名]** → 选择编译器（g++ 或 clang++）
3. 点击状态栏的 **Build** 按钮（或按 F7）
4. 构建完成后，在 VS Code 的 CMake 面板中选择目标程序，点击运行


### 方法二：命令行构建


cd /d/学习/其他学习/图形学/opengl/LearnOpenGLmkdir -p build && cd buildcmake .. -G "MinGW Makefiles"cmake --build .


构建成功后，可执行文件在 `build/src/1.getting_started/1.1.hello_window/` 下。


> [!WARNING]
> **⚠️ Windows 上 CMake 编译 GLFW**
>
> 如果在 Windows 上 MinGW 编译时找不到 GLFW，需要在 `CMakeLists.txt` 中或者通过 CMake 命令行添加 GLFW 源码路径。最简单的办法是：
>
>
> ```
> # 在 CMakeLists.txt 中找 find_package(GLFW3) 附近添加：
> set(GLFW_BUILD_DOCS OFF CACHE BOOL "" FORCE)
> set(GLFW_BUILD_TESTS OFF CACHE BOOL "" FORCE)
> set(GLFW_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
>
> # 或者在项目根目录下建一个 CMakeLists.txt 中引用的 glfw 目录
> # 详细方案见具体编译报错时的处理
> ```


### 运行第一个程序


构建成功后：


./build/src/1.getting_started/1.1.hello_window/hello_window.exe


你会看到一个 800x600 的灰色窗口！按 ESC 关闭。

 ============================================================  TROUBLESHOOTING  ============================================================

## 常见问题


### Q: 如何知道我有没有 MSVC 编译器？


打开终端，输入 `cl.exe`。如果输出类似 `Microsoft (R) C/C++ Optimizing Compiler`，则有 MSVC。如果显示 `command not found`，则没有。


另一种方法：在 VS Code 中按 Ctrl+Shift+P → **CMake: Select a Kit**，如果列表中显示 `Visual Studio Build Tools xxx` 或 `MSVC xxx`，则有 MSVC。


### Q: CMake 找不到 GLFW


**Windows + MinGW**：需要从源码编译 GLFW。下载 GLFW 源码，然后在 `CMakeLists.txt` 中设置 `set(GLFW_DIR 路径)` 或使用 `FetchContent` 让 CMake 自动下载。


**macOS**：确保执行了 `brew install glfw`。


### Q: 运行程序时提示缺少 DLL


某些 Windows 程序可能需要 `libstdc++-6.dll`。将该文件（在 `C:\msys64\ucrt64\bin\` 中）复制到可执行文件旁边，或者将该目录添加到 PATH 中。


### Q: 编译时出现乱码或中文注释报错


让 MinGW 编译器使用 UTF-8 编码：


在 `CMakeLists.txt` 中添加：


```
add_compile_options(-finput-charset=utf-8 -fexec-charset=utf-8)
```


### Q: VS Code 报 "No kit is configured"


按 Ctrl+Shift+P → **CMake: Select a Kit** → 选择你的编译器（GCC 或 Clang）。如果列表为空，检查编译器是否已添加到 PATH。

 ============================================================  SUMMARY  ============================================================

## 总结：Windows 上的最简步骤


如果你只想尽快跑起来，按这个精简版操作：


1. 下载安装 VS Code
2. 安装 C/C++ 和 CMake Tools 扩展
3. 下载 MSYS2 → 在 UCRT64 终端执行 `pacman -S mingw-w64-ucrt-x86_64-toolchain cmake`
4. 将 `C:\msys64\ucrt64\bin` 加入系统 PATH
5. 在 VS Code 中打开 LearnOpenGL 文件夹 → 按 F7 构建
