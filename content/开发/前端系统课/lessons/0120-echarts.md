---
title: 第120课：ECharts 图表
description: ECharts 图表库的使用、常见图表类型、配置项、响应式适配
date: 2026-08-06
tags:
  - ECharts
  - 数据可视化
  - 图表
  - 响应式
  - 配置
---

# ECharts 图表

## 学习目标

- 掌握 ECharts 的安装和使用
- 掌握常见图表类型的配置
- 理解 ECharts 的响应式适配
- 能够实现复杂图表组合

---

## ECharts 简介

ECharts 是一个由百度开源的数据可视化库，提供丰富的图表类型和强大的交互能力。

### 安装

```bash
npm install echarts
# 或 CDN
# <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
```

### 基本使用

```javascript
import * as echarts from 'echarts';

// 1. 准备容器
// <div id="chart" style="width: 600px; height: 400px;"></div>

// 2. 初始化图表
const chart = echarts.init(document.getElementById('chart'));

// 3. 配置选项
const option = {
  title: { text: '示例图表' },
  xAxis: { data: ['A', 'B', 'C'] },
  yAxis: {},
  series: [{
    type: 'bar',
    data: [10, 20, 15]
  }]
};

// 4. 渲染图表
chart.setOption(option);

// 5. 响应式
window.addEventListener('resize', () => chart.resize());

// 6. 销毁
// chart.dispose();
```

---

## 常见图表类型

### 折线图

```javascript
const lineOption = {
  title: {
    text: '月销售额趋势',
    subtext: '2024年1-6月'
  },
  tooltip: {
    trigger: 'axis',
    formatter: '{b}: {c}万'
  },
  legend: {
    data: ['销售额', '利润'],
    top: 30
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月'],
    axisLabel: { fontSize: 12 }
  },
  yAxis: {
    type: 'value',
    name: '金额（万元）'
  },
  series: [
    {
      name: '销售额',
      type: 'line',
      data: [120, 132, 101, 134, 190, 230],
      smooth: true,         // 平滑曲线
      areaStyle: { opacity: 0.3 },  // 面积图
      markPoint: {
        data: [
          { type: 'max', name: '最大值' },
          { type: 'min', name: '最小值' }
        ]
      },
      markLine: {
        data: [{ type: 'average', name: '平均值' }]
      }
    },
    {
      name: '利润',
      type: 'line',
      data: [30, 45, 38, 52, 68, 85],
      smooth: true
    }
  ]
};
```

### 柱状图

```javascript
const barOption = {
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { data: ['实际收入', '预算收入'] },
  xAxis: {
    type: 'category',
    data: ['Q1', 'Q2', 'Q3', 'Q4']
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '实际收入',
      type: 'bar',
      data: [320, 480, 410, 560],
      itemStyle: {
        borderRadius: [8, 8, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#4ECDC4' },
          { offset: 1, color: '#45B7D1' }
        ])
      }
    },
    {
      name: '预算收入',
      type: 'bar',
      data: [300, 450, 400, 500],
      itemStyle: { borderRadius: [8, 8, 0, 0] }
    }
  ]
};
```

### 饼图

```javascript
const pieOption = {
  title: {
    text: '市场份额',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      type: 'pie',
      radius: ['35%', '60%'],  // 内径/外径（环形图）
      center: ['50%', '55%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%'
      },
      emphasis: {
        label: { fontSize: 16 },
        itemStyle: { shadowBlur: 10 }
      },
      data: [
        { value: 1048, name: '搜索引擎', itemStyle: { color: '#FF6B6B' } },
        { value: 735, name: '直接访问', itemStyle: { color: '#4ECDC4' } },
        { value: 580, name: '邮件营销', itemStyle: { color: '#45B7D1' } },
        { value: 484, name: '联盟广告', itemStyle: { color: '#FFE66D' } },
        { value: 300, name: '视频广告', itemStyle: { color: '#F38181' } }
      ]
    }
  ]
};
```

### 雷达图

```javascript
const radarOption = {
  title: { text: '能力评估' },
  radar: {
    indicator: [
      { name: '编程能力', max: 100 },
      { name: '设计能力', max: 100 },
      { name: '团队协作', max: 100 },
      { name: '沟通能力', max: 100 },
      { name: '学习能力', max: 100 },
      { name: '项目管理', max: 100 }
    ],
    shape: 'circle',
    center: ['50%', '55%'],
    radius: '60%'
  },
  series: [
    {
      type: 'radar',
      data: [
        {
          value: [90, 75, 85, 70, 95, 65],
          name: '当前能力',
          areaStyle: { opacity: 0.3 }
        }
      ]
    }
  ]
};
```

---

## 响应式适配

```javascript
// 基础响应式
window.addEventListener('resize', () => {
  chart.resize();
});

// ECharts 5 的响应式配置
const option = {
  // 基础配置
  series: [{ type: 'bar', data: [...] }],

  // 响应式断点
  media: [
    {
      query: { minWidth: 1200 },
      option: {
        grid: { left: '10%' },
        series: [{ barWidth: '40%' }]
      }
    },
    {
      query: { maxWidth: 768 },
      option: {
        grid: { left: '15%' },
        series: [{ barWidth: '60%' }]
      }
    }
  ]
};

// 容器尺寸自适应
function initResponsiveChart(containerId) {
  const container = document.getElementById(containerId);
  const chart = echarts.init(container);

  const resizeObserver = new ResizeObserver(() => {
    chart.resize();
  });
  resizeObserver.observe(container);

  return chart;
}
```

---

## 大屏适配

```javascript
// 基于 rem 或 vw 的适配
function adaptChartSize(baseWidth = 1920) {
  const scale = document.documentElement.clientWidth / baseWidth;
  return {
    fontSize: size => Math.round(size * scale),
    spacing: size => Math.round(size * scale)
  };
}

// ECharts 字体自适应
function getChartOption(baseWidth = 1920) {
  const scale = window.innerWidth / baseWidth;

  return {
    title: {
      textStyle: { fontSize: Math.round(18 * scale) }
    },
    xAxis: {
      axisLabel: { fontSize: Math.round(12 * scale) }
    },
    // ... 其他配置
  };
}
```

---

## 自测题

### 问题 1
ECharts 的 setOption 多次调用时，新旧配置是如何合并的？

<details>
<summary>查看答案</summary>
ECharts 的多次 setOption 调用会进行增量合并（merge），而不是完全替换。如果新配置中省略了某个配置项，该配置项会保留上次的值。这种行为与 setOption 的第二个参数有关：默认 merge（合并）模式，传入 { notMerge: true } 或 true 会替换全部配置。合并机制便于增量更新数据，而不需要每次都传入完整配置。
</details>

### 问题 2
ECharts 中如何实现数据的动态更新？

<details>
<summary>查看答案</summary>
通过定时器或 WebSocket 获取新数据后，调用 chart.setOption() 更新数据。对于数据变化，只需更新 series.data 字段即可，ECharts 会自动执行过渡动画（默认开启 animation）。也可以使用 dataset 配置将数据和配置分离，通过更新 dataset.source 实现数据驱动更新。频繁更新大数据时，建议关闭动画（animation: false）以提高性能。
</details>

### 问题 3
ECharts 在大屏项目中如何进行适配？

<details>
<summary>查看答案</summary>
大屏适配方案：1）监听 resize 事件重新适配；2）基于设计稿（通常 1920x1080）计算缩放比例，所有尺寸乘以缩放系数；3）使用基于 vw/vh 的容器尺寸；4）ECharts media 查询支持不同尺寸下的配置切换；5）使用 ResizeObserver 监听容器尺寸变化（比 window resize 更精确）；6）字号和间距等使用动态计算函数，根据屏幕比例调整。
</details>