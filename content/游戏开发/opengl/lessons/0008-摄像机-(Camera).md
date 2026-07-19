---
title: 第 8 课：摄像机 (Camera) — 图形世界的入口
description: 到这一课为止，你将从"上帝视角观察"变为"置身其中"——像游戏一样自由移动。
tags: [opengl, 图形学, 摄像机]
date: 2025-01-01
---

# 摄像机 (Camera) — 用你的双眼漫游 3D 世界


*到这一课为止，你将从"上帝视角观察"变为"置身其中"——像游戏一样自由移动。*


## 这堂课在 mission 中的位置

前几课你学会了用 MVP 矩阵将 3D 顶点变换到屏幕坐标。但有一个问题：**摄像机是固定的**——我们始终从 (0,0,3) 看向原点。真实的应用中，摄像机需要像人的眼睛一样自由移动和旋转。这一课将解决"如何让摄像机动起来"。


> **最终目标连接** Unity/Unreal/Godot 编辑器中的 Scene 视图、游戏中的第一人称/第三人称视角、甚至 VR 头盔的头部追踪——**本质都是这一课的内容**。


对应的源文件：


- `src/1.getting_started/7.1.camera_circle/camera_circle.cpp` — 摄像机绕场景旋转（自动动画）
- `src/1.getting_started/7.2.camera_keyboard_dt/camera_keyboard_dt.cpp` — 键盘 WASD 移动 + deltaTime
- `src/1.getting_started/7.3.camera_mouse_zoom/camera_mouse_zoom.cpp` — 鼠标控制视角 + 滚轮缩放
- `src/1.getting_started/7.4.camera_class/camera_class.cpp` — 使用 camera.h 封装的最终版本
- `includes/learnopengl/camera.h` — Camera 类的完整实现


## 摄像机的本质：视图矩阵 (View Matrix)

在 3D 图形中，**没有真正的"摄像机"**。所谓"摄像机视角"实际上是一个反向的变换：


1. 把整个世界移动到摄像机位置的反方向（平移）
2. 把整个世界旋转到与摄像机朝向相反的方向（旋转）


这就是 **View 矩阵** 的本质：它是把摄像机变换到标准位置（原点、朝 -Z 看）的 **逆矩阵**。由于我们只使用平移和旋转（没有缩放），它的逆矩阵就是它的转置加上反向平移——但我们不手动推导，直接用 `glm::lookAt`。


> [!INFO]
> **一句话理解** View 矩阵不是"摄像机在哪里"，而是"如何把世界变换到从摄像机看到的样子"。


## lookAt 矩阵的数学构成

GLM 的 `glm::lookAt(eye, center, up)` 接受三个参数：


- **eye** — 摄像机位置
- **center** — 目标点（摄像机看向哪里）
- **up** — 世界向上方向（通常是 (0,1,0)）


它通过向量运算构建一个正交基（一组互相垂直的轴）：


```cpp
// 1. 方向向量（摄像机指向目标）—— 这是摄像机的"前方向"的反向
glm::vec3 direction = glm::normalize(eye - center); // 指向摄像机后方！

// 2. 右向量 —— 前方向与上向量叉乘
glm::vec3 right = glm::normalize(glm::cross(up, direction));

// 3. 上向量 —— 右向量与前方向叉乘（重新正交化）
glm::vec3 cameraUp = glm::cross(direction, right);
```


然后用这三个向量和位置构造 **LookAt 矩阵**：


```
LookAt = [ right.x    right.y    right.z   -dot(right, eye)    ]
         [ up.x       up.y       up.z      -dot(up, eye)       ]
         [ front.x    front.y    front.z   -dot(front, eye)    ]
         [ 0          0          0          1                  ]
```


其中 `front = -direction`（即摄像机真正的前方）。左上角 3x3 是旋转矩阵（世界到摄像机空间），最后一列是平移分量。


> **源码观察** 在 `camera_circle.cpp` 的第 227 行，使用 `glm::lookAt` 让摄像机沿半径为 10 的圆形轨迹围绕场景旋转：`glm::lookAt(glm::vec3(camX, 0.0f, camZ), glm::vec3(0.0f, 0.0f, 0.0f), glm::vec3(0.0f, 1.0f, 0.0f))`。


## 欧拉角：控制摄像机朝向

`lookAt` 需要三个互相垂直的向量，但人类直觉上更习惯用 **角度** 来控制方向。这就是欧拉角：


| 名称 | 英文 | 含义 | 类比 |
| --- | --- | --- | --- |
| 偏航 (Yaw) | Yaw | 左右摇头 | 水平环顾 |
| 俯仰 (Pitch) | Pitch | 上下点头 | 抬头/低头看 |
| 滚转 (Roll) | Roll | 歪头 | 第一人称通常不用 |


从欧拉角到方向向量的计算（`camera_mouse_zoom.cpp` 第 344-348 行和 `camera.h` 第 117-122 行）：


```cpp
glm::vec3 front;
front.x = cos(glm::radians(Yaw)) * cos(glm::radians(Pitch));
front.y = sin(glm::radians(Pitch));
front.z = sin(glm::radians(Yaw)) * cos(glm::radians(Pitch));
Front = glm::normalize(front);
```


本质上是球坐标系到笛卡尔坐标系的转换：Yaw 绕 Y 轴旋转，Pitch 绕 X 轴旋转。结果是一个单位方向向量。


> [!WARNING]
> **为什么 Yaw 初始值是 -90°？** 因为当 Yaw = 0 时，方向向量指向 +X（右侧），而我们希望初始看向 -Z（屏幕里）。-90° 的偏航让方向指向 -Z。这是初学者最容易困惑的地方。


有了 Front 向量后，再用两个叉乘算出 Right 和 Up：


```cpp
Right = glm::normalize(glm::cross(Front, WorldUp));
Up    = glm::normalize(glm::cross(Right, Front));
```


这三个向量 (Front, Right, Up) 恰好就是 lookAt 需要的正交基。

## DeltaTime：帧率无关的移动速度

在不同性能的机器上，帧率可能从 30fps 到 144fps 不等。如果每帧移动固定距离，高帧率的机器上物体会移动**更快**（因为每秒执行的帧数更多）。

**解决方案**：用 `deltaTime`（两帧之间的时间差）乘以速度：


```
// camera_keyboard_dt.cpp 第 215-217 行
float currentFrame = static_cast<float>(glfwGetTime());
deltaTime = currentFrame - lastFrame;
lastFrame = currentFrame;

// 第 279 行 — 速度乘以 deltaTime
float cameraSpeed = static_cast<float>(2.5 * deltaTime);
```


如果 `deltaTime = 0.016s`（60fps），每帧移动 `2.5 * 0.016 = 0.04` 单位；如果 `deltaTime = 0.033s`（30fps），每帧移动 `0.0825` 单位。每秒的总移动距离始终是 `2.5` 单位。

## WASD 移动：前/后/左/右

在 `camera_keyboard_dt.cpp` 的第 279-287 行：


```cpp
float cameraSpeed = static_cast<float>(2.5 * deltaTime);
if (glfwGetKey(window, GLFW_KEY_W) == GLFW_PRESS)
    cameraPos += cameraSpeed * cameraFront;    // 向前
if (glfwGetKey(window, GLFW_KEY_S) == GLFW_PRESS)
    cameraPos -= cameraSpeed * cameraFront;    // 向后
if (glfwGetKey(window, GLFW_KEY_A) == GLFW_PRESS)
    cameraPos -= glm::normalize(glm::cross(cameraFront, cameraUp)) * cameraSpeed;  // 向左
if (glfwGetKey(window, GLFW_KEY_D) == GLFW_PRESS)
    cameraPos += glm::normalize(glm::cross(cameraFront, cameraUp)) * cameraSpeed;  // 向右
```


左右移动使用 `cameraFront` 和 `cameraUp` 的叉积，得到垂直于前方向和上方向的 **右方向**。注意先 normalize 再乘速度，否则当俯仰接近 ±90° 时，叉积的长度趋近于 0，导致移动变慢。

## 鼠标输入控制视角

让鼠标控制视角分三步（`camera_mouse_zoom.cpp` 第 63-67 行、第 314-348 行）：

### 1. 隐藏并捕获鼠标


```
glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);
```


这会隐藏光标并将它锁定在窗口中，让你可以无限滑动鼠标（不会撞到屏幕边缘）。

### 2. 注册鼠标回调


```
glfwSetCursorPosCallback(window, mouse_callback);
```


### 3. 计算鼠标偏移量 → 更新欧拉角


```cpp
void mouse_callback(GLFWwindow* window, double xposIn, double yposIn)
{
    float xoffset = xpos - lastX;
    float yoffset = lastY - ypos; // Y 坐标反转！屏幕 Y 向下，3D 坐标 Y 向上

    xoffset *= sensitivity;  // 灵敏度
    yoffset *= sensitivity;

    yaw += xoffset;     // 水平移动 → 偏航变化
    pitch += yoffset;   // 垂直移动 → 俯仰变化

    // 限制俯仰范围，避免翻转
    if (pitch > 89.0f) pitch = 89.0f;
    if (pitch < -89.0f) pitch = -89.0f;

    // 重新计算方向向量
    glm::vec3 front;
    front.x = cos(glm::radians(yaw)) * cos(glm::radians(pitch));
    front.y = sin(glm::radians(pitch));
    front.z = sin(glm::radians(yaw)) * cos(glm::radians(pitch));
    cameraFront = glm::normalize(front);
}
```


关键细节：


- **Y 轴反转**：屏幕坐标系 Y 向下，3D 世界 Y 向上，所以鼠标向上移动（y offset 为负）对应俯仰增加
- **firstMouse 标志**：第一次进入时跳过偏移计算，防止鼠标突然跳转到场景中心
- **俯仰限制 ±89°**：防止万向锁（Gimbal Lock）和视角翻转——当俯仰为 ±90° 时，方向向量与上向量平行，叉积为 0，无法计算右向量


## 滚轮控制缩放

缩放不是移动摄像机，而是改变 **FOV（视场角，Field of View）**：


```cpp
// camera_mouse_zoom.cpp 第 353-359 行
void scroll_callback(GLFWwindow* window, double xoffset, double yoffset)
{
    fov -= (float)yoffset;
    if (fov < 1.0f)  fov = 1.0f;
    if (fov > 45.0f) fov = 45.0f;
}

// 渲染循环中重新计算投影矩阵
glm::mat4 projection = glm::perspective(glm::radians(fov), (float)SCR_WIDTH / (float)SCR_HEIGHT, 0.1f, 100.0f);
```


**原理**：透视投影矩阵的 FOV 参数控制了视锥体的张角。FOV 越小，视野范围越窄，物体显得越大（拉近效果）；FOV 越大，视野越宽广，物体显得越小（拉远效果）。


> **物理类比** 相机的"变焦"镜头——改变焦距（FOV），而不是改变相机位置。


## camera.h 封装

经过四个版本的迭代，最终将所有摄像机逻辑封装到 `includes/learnopengl/camera.h` 中：


```cpp
class Camera {
public:
    // === 属性 ===
    glm::vec3 Position;      // 位置
    glm::vec3 Front;         // 前方向
    glm::vec3 Up;            // 上方向
    glm::vec3 Right;         // 右方向
    glm::vec3 WorldUp;       // 世界上方向（通常 (0,1,0)）
    float Yaw;               // 偏航角度
    float Pitch;             // 俯仰角度
    float MovementSpeed;     // 移动速度 (默认 2.5)
    float MouseSensitivity;  // 鼠标灵敏度 (默认 0.1)
    float Zoom;              // 缩放/FOV (默认 45.0)

    // === 核心方法 ===
    glm::mat4 GetViewMatrix();                      // 返回 lookAt 矩阵
    void ProcessKeyboard(direction, deltaTime);     // WASD 移动
    void ProcessMouseMovement(xoffset, yoffset);    // 鼠标控制视角
    void ProcessMouseScroll(yoffset);               // 滚轮缩放

private:
    void updateCameraVectors();  // 从 Yaw/Pitch 重新计算 Front/Right/Up
};
```


在 `camera_class.cpp` 中，使用封装后的代码变得极其简洁：


```cpp
Camera camera(glm::vec3(0.0f, 0.0f, 3.0f));

// 渲染循环中：
glm::mat4 view = camera.GetViewMatrix();                     // 获取视图矩阵
camera.ProcessKeyboard(FORWARD, deltaTime);                  // WASD 移动
camera.ProcessMouseMovement(xoffset, yoffset);               // 鼠标控制
camera.ProcessMouseScroll(static_cast<float>(yoffset));      // 滚轮缩放

// 投影矩阵使用 camera.Zoom:
glm::mat4 projection = glm::perspective(glm::radians(camera.Zoom), ...);
```

> [!INFO]
> **封装的价值** 在 7.1 ~ 7.3 中，摄像机数据是全局变量、逻辑散落在各处。到了 7.4，所有摄像机功能集中在一个类中，代码复用性大幅提升。这就是你看到的所有 3D 引擎中 Camera 组件的雏形。


## 引擎连接：Unity/Unreal/Godot 的 Camera

现在你已经完全理解了 3D 引擎中 Camera 组件的底层原理：


| OpenGL 概念 | Unity 组件 | 对应关系 |
| --- | --- | --- |
| View 矩阵 | Camera.transform 的逆矩阵 | 摄像机的位置和旋转共同决定了 View 矩阵 |
| Projection 矩阵 | Camera.projectionMatrix | 由 Field of View、Near、Far 决定 |
| 欧拉角 (Yaw/Pitch) | Camera.transform.eulerAngles | Unity 用 Vector3(x, y, z) 表示欧拉角 |
| 鼠标控制旋转 | Mouse Look 脚本 | 同样的原理：鼠标偏移 → 欧拉角 → 方向向量 |
| 滚轮缩放 | Camera.fieldOfView | 直接修改 FOV 属性 |
| WASD 移动 | Character Controller / Transform.Translate | 沿 Front/Right 方向移动 |
| deltaTime | Time.deltaTime | 帧率无关的移动——完全相同的概念 |

> **关键洞察** 你在 OpenGL 中手写的 200 行摄像机代码，在 Unity 中是一个内置的 Camera 组件 + 几行 C# 脚本。但你现在知道了它**内部是如何工作的**——这正是学习 OpenGL 的意义。


## 四个版本的演进路线

回顾这四版代码的演进，它展示了优秀的工程设计思维：


| 版本 | 新增能力 | 核心代码行 |
| --- | --- | --- |
| 7.1 camera_circle | 自动环绕旋转（演示 View 矩阵效果） | sin/cos 计算位置 + lookAt |
| 7.2 camera_keyboard_dt | WASD 交互控制 + 帧率无关 | deltaTime 计算 + 键盘响应 + 方向移动 |
| 7.3 camera_mouse_zoom | 鼠标视角 + 滚轮缩放 | 欧拉角计算 + 鼠标回调 + FOV 修改 |
| 7.4 camera_class | 封装为可复用的 Camera 类 | 引入 camera.h，主程序仅 10 行摄像机逻辑 |


## 练习


1. **WASD 移动**：在 `camera_circle.cpp` 的基础上，移除自动环绕（删除 sin/cos），改为键盘 WASD 控制摄像机在 XZ 平面上移动。提示：需要定义 cameraPos、cameraFront、cameraUp 三个向量，在 processInput 中修改 cameraPos。
2. **鼠标视角旋转**：在练习 1 的基础上，加入鼠标控制朝向。注册 `glfwSetCursorPosCallback`，隐藏光标，用鼠标偏移更新 Yaw/Pitch，重新计算方向向量。
3. **滚轮缩放**：在练习 2 的基础上，注册 `glfwSetScrollCallback`，修改 FOV，并在每帧重新计算投影矩阵。
4. **增加上下移动**：添加 Q（下降）/ E（上升）键，沿 WorldUp 方向移动摄像机。提示：`cameraPos += cameraSpeed * cameraUp` 和 `cameraPos -= cameraSpeed * cameraUp`。
5. **速度加速**：按住 Shift 时移动速度加倍（不修改 MovementSpeed 默认值，而是在 processInput 中临时调整）。
