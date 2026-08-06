---
title: 第139课：状态和路由
description: 网易云音乐项目的复杂状态管理和路由设计
date: 2026-08-06
tags:
  - React
  - Redux
  - 状态管理
  - 路由
  - 网易云音乐
---

# 状态和路由

## 学习目标

- 掌握复杂状态管理设计
- 掌握多层组件通信

---

## 播放器全局状态

播放器状态需要全局共享，因为播放控制器在页面底部固定，不随路由切换而变化：

```typescript
// store/modules/playerSlice.ts - 关键 actions
const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    // 播放指定歌曲
    playSong: (state, action: PayloadAction<Song>) => {
      state.currentSong = action.payload;
      state.isPlaying = true;
      // 如果不在播放列表，添加到列表
      if (!state.playList.find(s => s.id === action.payload.id)) {
        state.playList.push(action.payload);
        state.currentIndex = state.playList.length - 1;
      }
    },
    // 添加到播放列表
    addToPlayList: (state, action: PayloadAction<Song>) => {
      if (!state.playList.find(s => s.id === action.payload.id)) {
        state.playList.push(action.payload);
      }
    }
  }
});
```

---

## 路由状态管理

```typescript
// 路由变化时自动关闭弹窗等 UI 状态
const App: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // 路由变化时自动关闭弹窗
    dispatch(closeAllModals());
    // 暂停搜索等非必要操作
    dispatch(clearSearchResults());
  }, [location.pathname]);
};
```

---

## 自测题

### 问题 1
为什么播放器状态需要全局管理？

<details>
<summary>查看答案</summary>
播放器固定在页面底部，不随路由切换而变化。如果使用局部状态，当路由切换时播放器组件会被卸载重建，导致播放中断。全局状态让播放器与路由解耦，无论路由如何变化，播放器都能持续工作。
</details>

### 问题 2
如何避免路由切换时不必要的 API 请求？

<details>
<summary>查看答案</summary>
使用缓存机制：在 store 中缓存已加载的数据（如歌单详情），下次访问相同页面时直接从 store 读取，不重复请求。使用 RTK Query 的缓存自动管理功能。或者在组件中使用 useMemo 和依赖数组，确保只在参数变化时重新请求。
</details>