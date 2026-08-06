---
title: 第138课：音乐播放器
description: 网易云音乐播放器、播放控制、进度条、歌词展示
date: 2026-08-06
tags:
  - React
  - 音乐播放器
  - 歌词
  - 音频
  - 网易云音乐
---

# 音乐播放器

## 学习目标

- 掌握音频播放的控制
- 掌握进度条组件实现
- 掌握歌词解析和同步

---

## 播放器状态管理

```typescript
// src/store/modules/playerSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSongUrl, getSongDetail, getLyric } from '@/services/api';
import { parseLyric } from '@/utils/lyric';

interface PlayerState {
  currentSong: Song | null;
  playList: Song[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playMode: 'loop' | 'one' | 'random' | 'order';
  lyrics: LyricLine[];
  currentLyricIndex: number;
}

const initialState: PlayerState = {
  currentSong: null,
  playList: [],
  currentIndex: -1,
  isPlaying: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  playMode: 'loop',
  lyrics: [],
  currentLyricIndex: -1
};

export const fetchSongUrl = createAsyncThunk(
  'player/fetchSongUrl',
  async (id: number) => {
    const { data } = await getSongUrl(id);
    return data[0]?.url;
  }
);

export const fetchLyric = createAsyncThunk(
  'player/fetchLyric',
  async (id: number) => {
    const result = await getLyric(id);
    return parseLyric(result.lrc?.lyric || '');
  }
);
```

---

## 歌词解析

```typescript
// src/utils/lyric.ts
interface LyricLine {
  time: number;
  text: string;
}

export function parseLyric(lrc: string): LyricLine[] {
  const lines = lrc.split('\n');
  const lyrics: LyricLine[] = [];

  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/

  lines.forEach(line => {
    const match = timeRegex.exec(line);
    if (!match) return;

    const minutes = parseInt(match[1]);
    const seconds = parseInt(match[2]);
    const milliseconds = parseInt(match[3].padEnd(3, '0'));
    const time = minutes * 60 + seconds + milliseconds / 1000;

    const text = line.replace(timeRegex, '').trim();
    if (text) {
      lyrics.push({ time, text });
    }
  });

  return lyrics;
}
```

---

## 播放器组件

```typescript
// PlayerBar 组件核心逻辑
const PlayerBar: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const dispatch = useAppDispatch();
  const { currentSong, isPlaying, volume, currentTime, duration, lyrics, currentLyricIndex } =
    useAppSelector(state => state.player);

  // 播放/暂停
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    dispatch(togglePlayStatus());
  };

  // 进度更新
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    dispatch(setCurrentTime(audio.currentTime));

    // 更新歌词索引
    const index = lyrics.findIndex(
      (line, i) =>
        audio.currentTime >= line.time &&
        (i === lyrics.length - 1 || audio.currentTime < lyrics[i + 1].time)
    );
    if (index !== currentLyricIndex) {
      dispatch(setCurrentLyricIndex(index));
    }
  };

  // 拖动进度条
  const handleProgressChange = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    dispatch(setCurrentTime(value));
  };

  return (
    <div className="player-bar">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => dispatch(setDuration(audioRef.current!.duration))}
        onEnded={handleNext}
      />
      {/* 进度条、控制按钮、音量、歌词展示 */}
    </div>
  );
};
```

---

## 自测题

### 问题 1
歌词解析的正则表达式 `\[(\d{2}):(\d{2})\.(\d{2,3})\]` 是如何工作的？

<details>
<summary>查看答案</summary>
正则匹配歌词时间标签格式如 [01:23.456]。(\d{2}) 匹配两位数的分钟和秒数，(\d{2,3}) 匹配两位或三位数的毫秒部分。通过 exec 捕获分组提取分钟、秒和毫秒，计算出总秒数（毫秒转换为秒的小数部分）。解析后的歌词数组按时间排序，用于在播放时高亮当前的歌词行。
</details>

### 问题 2
如何同步歌词的高亮显示？

<details>
<summary>查看答案</summary>
在音频的 onTimeUpdate 事件中获取 currentTime，遍历歌词数组找到当前时间对应的歌词索引。当索引变化时更新 Redux store 中的 currentLyricIndex。歌词组件根据该索引判断当前行，应用高亮样式（class 切换），并将歌词容器滚动到当前行位置（使用 scrollIntoView 或 scrollTop 计算）。
</details>

### 问题 3
播放器的播放模式（顺序、循环、单曲、随机）如何实现？

<details>
<summary>查看答案</summary>
定义播放模式枚举：loop（列表循环）、one（单曲循环）、random（随机播放）、order（顺序播放）。在音轨结束时根据当前模式决定下一首：loop 模式切到下一首（最后切到第一首）；one 模式重新播放当前曲目；random 模式随机选择列表中的一首；order 模式播放完最后一首后停止。模式切换通过 dispatch action 更新 store 中的 playMode 字段。
</details>