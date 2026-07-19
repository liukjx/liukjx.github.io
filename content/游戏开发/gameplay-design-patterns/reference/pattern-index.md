---
title: "游戏设计模式分类索引"
description: "623个游戏设计模式的系统分类与快速定位"
date: 2026-07-19
tags:
  - course
  - gameplay-design-patterns
  - reference
draft: false
---

# 游戏设计模式分类索引

> Gameplay Design Patterns (GDP3) v3 模式索引速查表。
> 623 个模式按 6 大阶段分类，每类下细分模式集群。

## 如何使用

每个模式条目格式：**模式名称（英文）** — 一句话定义

当你设计游戏时，可以按阶段浏览模式集群，选择适合目标体验的模式组合。

---

## Phase 1: 元模式（Meta Patterns）

### 目标系统 (Goal Systems)

| 模式 | 定义 |
|------|------|
| **目标 (Goals)** | 玩家在游戏中追求的结果，一切游戏行为的驱动力 |
| **子目标 (Subgoals)** | 将大目标分解为更小、更易管理的步骤 |
| **长期目标 (Long-term Goals)** | 跨越多个游戏会话的持续性目标 |
| **短期目标 (Short-term Goals)** | 在单次游戏会话中可快速完成的目标 |
| **复合目标 (Compound Goals)** | 需要同时满足多个条件才能完成的目标 |
| **可选目标 (Optional Goals)** | 玩家可选择追求或忽略的非强制目标 |
| **对抗性目标 (Conflicting Goals)** | 玩家必须在互斥目标间做出选择 |
| **动态目标 (Dynamic Goals)** | 根据游戏状态变化而调整的目标 |

### 障碍系统 (Obstacle Systems)

| 模式 | 定义 |
|------|------|
| **障碍 (Obstacles)** | 阻止或延缓玩家达成目标的设计元素 |
| **敌人 (Enemies)** | 具有敌对意图、主动阻碍玩家的AI实体 |
| **屏障 (Barriers)** | 限制通行的物理或逻辑边界 |
| **谜题 (Puzzles)** | 需要思考、推理才能克服的认知型障碍 |
| **陷阱 (Traps)** | 隐藏的、触发后造成负面效果的障碍 |
| **Boss (Bosses)** | 极具挑战性的强大敌人，通常标记重要节点 |
| **守卫 (Guards)** | 监视特定区域、在发现玩家后采取行动的敌人 |
| **锁与钥匙 (Lock and Key)** | 需要特定道具才能通过的限制机制 |

### 奖励系统 (Reward Systems)

| 模式 | 定义 |
|------|------|
| **奖励 (Rewards)** | 玩家达成目标后获得的回报，强化特定行为 |
| **进度奖励 (Rewards for Progress)** | 随游戏进程自动解锁的奖励 |
| **可解锁内容 (Unlockable Content)** | 达成条件后开放的新内容访问权 |
| **收集奖励 (Collection Rewards)** | 收集全套物品后获得的特殊奖励 |
| **技能奖励 (Ability Rewards)** | 奖励新能力而非数值提升 |
| **信息奖励 (Information Rewards)** | 奖励故事片段或世界观信息 |
| **情感奖励 (Emotional Rewards)** | 叙事或视听带来的情感满足 |

### 资源系统 (Resource Systems)

| 模式 | 定义 |
|------|------|
| **资源 (Resources)** | 玩家可用于达成目标的有价值的游戏资产 |
| **资源管理 (Resource Management)** | 在获取与消耗之间维持平衡的决策过程 |
| **可再生资源 (Renewable Resources)** | 随时间或行动可恢复的资源 |
| **有限资源 (Limited Resources)** | 总量固定、不可再生的资源 |
| **资源转换 (Resource Conversion)** | 将一种资源转化为另一种资源的机制 |
| **资源损失 (Loss of Resources)** | 资源被消耗、移除或破坏的设计 |
| **稀缺性 (Scarcity)** | 资源供不应求产生的设计约束 |

### 反馈系统 (Feedback Systems)

| 模式 | 定义 |
|------|------|
| **反馈循环 (Feedback Loops)** | 系统输出影响后续输入的自增强或自平衡循环 |
| **正反馈 (Positive Feedback)** | 优势方获得更多优势，放大初始差距 |
| **负反馈 (Negative Feedback)** | 劣势方获得补偿，缩小差距 |
| **平衡循环 (Balancing Loops)** | 维持游戏系统稳定性的反馈机制 |
| **滚雪球效应 (Snowball Effect)** | 正反馈导致优势持续放大的极端情况 |
| **追赶机制 (Catch-up Mechanisms)** | 帮助落后玩家恢复到有竞争力的状态 |
| **军备竞赛 (Arms Race)** | 玩家间互相强化的正反馈竞争 |

---

## Phase 2: 玩家表现模式（Player Performance）

### 角色与化身 (Characters & Avatars)

| 模式 | 定义 |
|------|------|
| **角色 (Characters)** | 游戏中具有人格、背景和动机的实体 |
| **化身 (Avatars)** | 玩家在游戏世界中的具身代表 |
| **玩家角色 (Player Character)** | 由玩家直接控制的角色 |
| **非玩家角色 (NPCs)** | 由AI控制、与玩家互动的角色 |
| **角色发展 (Character Development)** | 角色随游戏进程在能力或人格上的变化 |
| **自定义 (Customization)** | 允许玩家个性化外观或能力 |
| **纸娃娃系统 (Paper Doll)** | 通过装备改变角色外观的系统 |

### 能力与技能系统 (Abilities & Skills)

| 模式 | 定义 |
|------|------|
| **能力 (Abilities)** | 角色可执行的特有动作或效果 |
| **技能 (Skills)** | 通过练习和应用获得的能力提升 |
| **技能树 (Skill Trees)** | 技能按层级和分支组织的发展结构 |
| **职业 (Character Classes)** | 预设的能力组合模板 |
| **冷却 (Cooldown)** | 限制能力使用频率的时间机制 |
| **充能 (Charge-Up)** | 需要蓄力才能释放的能力机制 |
| **组合技 (Combos)** | 多个能力按顺序触发产生额外效果 |
| **资源消耗 (Resource Consumption)** | 使用能力需要消耗特定资源 |

### 成长与难度系统 (Progression & Difficulty)

| 模式 | 定义 |
|------|------|
| **成长 (Progression)** | 玩家能力的量化增长过程 |
| **等级 (Levels)** | 角色能力的数字化阶段划分 |
| **经验值 (Experience Points)** | 通过行动获得的成长货币 |
| **升级 (Upgrades)** | 单项能力数值或效果的提升 |
| **难度曲线 (Difficulty Curve)** | 挑战强度随游戏进程的设计变化 |
| **动态难度调整 (Dynamic Difficulty)** | 系统根据玩家表现实时调整挑战水平 |
| **心流 (Flow)** | 挑战与技能平衡的最优体验状态 |
| **学习曲线 (Learning Curve)** | 掌握游戏所需的时间和认知投入 |

---

## Phase 3: 社交模式（Social Patterns）

| 模式 | 定义 |
|------|------|
| **合作 (Cooperation)** | 多玩家共同行动以达成共享目标 |
| **竞争 (Competition)** | 玩家之间争夺有限资源或更高排名 |
| **团队合作 (Team Play)** | 在正式分组框架下的协同行动 |
| **联盟 (Alliances)** | 玩家之间临时或永久的合作关系 |
| **背叛 (Betrayal)** | 破坏已有合作关系以获取个人利益 |
| **社交困境 (Social Dilemmas)** | 个人利益与集体利益冲突的设计情境 |
| **交易 (Trading)** | 玩家之间的资源或服务交换 |
| **赠予 (Gifting)** | 无偿向其他玩家提供资源的行为 |

| 模式 | 定义 |
|------|------|
| **交流渠道 (Communication Channels)** | 玩家之间传递信息的通道 |
| **聊天系统 (Chat Systems)** | 基于文本的交流功能 |
| **语音交流 (Voice Communication)** | 基于实时语音的交流 |
| **标记系统 (Ping Systems)** | 非语言的快速信息传递 |
| **表情/手势 (Emotes/Gestures)** | 通过角色动画表达简单信息 |
| **团队 (Teams)** | 为共同目标组织起来的正式群体 |
| **阵营 (Factions)** | 基于立场、意识形态的大规模持久分组 |
| **团队角色 (Roles within Teams)** | 团队内部的分工与专业化 |
| **共享资源 (Shared Resources)** | 团队共用的资源池 |

---

## Phase 4: 叙事模式（Narrative Patterns）

| 模式 | 定义 |
|------|------|
| **任务 (Quests)** | 游戏赋予玩家的结构化目标序列 |
| **主线任务 (Main Quests)** | 推动核心剧情进展的任务链 |
| **支线任务 (Side Quests)** | 扩充世界观的可选任务 |
| **故事讲述 (Storytelling)** | 游戏向玩家传递叙事的各种方法 |
| **过场动画 (Cutscenes)** | 玩家无法操控的预渲染叙事片段 |
| **叙事结构 (Narrative Structures)** | 故事内容的组织方式（线性/分支/开放） |
| **玩家驱动叙事 (Player-Driven Narrative)** | 玩家选择影响故事走向的叙事方式 |
| **多结局 (Multiple Endings)** | 基于玩家不同选择产生的不同结局 |

| 模式 | 定义 |
|------|------|
| **环境叙事 (Environmental Storytelling)** | 通过场景视觉元素暗示叙事信息 |
| **对话树 (Dialog Trees)** | 分支对话结构，玩家选择影响发展 |
| **世界内叙事 (Diegetic Narration)** | 存在于游戏世界内的叙事来源 |
| **非世界内叙事 (Non-Diegetic Narration)** | 外部视角的旁白或文字 |
| **叙事碎片 (Collectible Story Fragments)** | 分散在关卡中的故事信息片段 |
| **风味文本 (Flavor Text)** | 增加世界氛围和深度的描述性文本 |
| **背景故事 (Backstory)** | 游戏主要事件发生之前的历史设定 |

---

## Phase 5: 系统模式（System Patterns）

| 模式 | 定义 |
|------|------|
| **战斗 (Combat)** | 玩家与敌人之间的冲突解决机制 |
| **回合制战斗 (Turn-based Combat)** | 分时轮流行动的战斗系统 |
| **实时战斗 (Real-time Combat)** | 所有单位同时行动的战斗系统 |
| **潜行 (Stealth)** | 避免被敌人发现的替代性冲突解决方式 |
| **伤害类型 (Damage Types)** | 不同机制和效果的伤害分类 |
| **状态效果 (Status Effects)** | 暂时改变单位状态的附加效果 |
| **暴击 (Critical Hits)** | 概率触发的额外伤害效果 |

| 模式 | 定义 |
|------|------|
| **制造 (Crafting)** | 从原材料制作新物品的系统 |
| **配方 (Recipes)** | 制造特定物品所需的条件组合 |
| **武器 (Weapons)** | 用于战斗的工具或装备 |
| **护甲 (Armor)** | 提供伤害减免的防护装备 |
| **消耗品 (Consumables)** | 一次性使用后消失的物品 |
| **装备 (Equipment)** | 可穿戴并提供增益的物品 |

| 模式 | 定义 |
|------|------|
| **游戏经济 (Game Economy)** | 资源生产、分配与消费的完整系统 |
| **货币 (Currency)** | 交易和估值的中介 |
| **通胀控制 (Inflation Control)** | 防止经济系统失衡的机制 |
| **关卡设计 (Level Design)** | 游戏空间布局与挑战序列的编排 |
| **关卡布局 (Level Layout)** | 空间结构与路径网络的规划 |
| **检查点 (Checkpoints)** | 记录游戏进度、失败后可重返的位置 |
| **安全区 (Safe Havens)** | 无威胁的休整和准备区域 |
| **秘密区域 (Secret Areas)** | 隐藏的可探索空间，通常包含额外奖励 |

---

## Phase 6: 元游戏模式（Meta-game Patterns）

| 模式 | 定义 |
|------|------|
| **元游戏 (Meta Games)** | 超越主要游戏系统的上层设计框架 |
| **成就 (Achievements)** | 记录和奖励玩家达成特定条件 |
| **排行榜 (Leaderboards)** | 玩家间比较分数的排名系统 |
| **新游戏+ (New Game+)** | 继承前次游戏进度重新开始 |
| **多结局 (Multiple Endings)** | 基于玩家选择的不同故事结局 |
| **速通 (Speedrunning)** | 以最快速度完成游戏的玩法 |
| **收集品 (Collectibles)** | 分布在游戏各处的可收集元素 |

| 模式 | 定义 |
|------|------|
| **跨游戏信息 (Trans-Game Information)** | 跨越不同游戏会话的信息传递 |
| **玩家档案 (Player Profile)** | 记录玩家身份和历史的元数据 |
| **数据追踪 (Stat Tracking)** | 记录和展示玩家行为统计数据 |
| **模组 (Modding)** | 玩家修改或扩展游戏内容的能力 |
| **用户生成内容 (User-Generated Content)** | 玩家创建、分享的游戏内容 |
| **内置编辑器 (Built-in Editor)** | 游戏提供的关卡或内容编辑工具 |
| **分享与展示 (Share & Showcase)** | 玩家展示自己创作内容的渠道 |

---

## 模式选择快速参考

当你想实现以下体验，关注对应的模式集群：

| 你想让玩家体验 | 查看模式集群 |
|---------------|-------------|
| 有明确的努力方向 | 目标系统、任务系统 |
| 克服困难后的成就感 | 障碍系统、Boss设计 |
| 持续的动力和期待 | 奖励系统、进度系统 |
| 做决定要有代价 | 资源管理、经济系统 |
| 越玩越刺激 vs 公平 | 反馈循环、动态难度 |
| 代入另一个身份 | 角色与化身、自定义 |
| 变强的快感 | 能力、技能树、成长系统 |
| 和朋友一起玩 | 合作、团队、交流系统 |
| 沉浸在一个世界中 | 环境叙事、对话系统 |
| 不断有新内容 | 制造、收集品、成就系统 |