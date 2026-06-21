---
draft: "false"
---

<!-- 本文件使用 LaTeX 数学环境 ($$ ... $$) 来标注英语发音现象，规范见下。 -->

## 📖 发音标注规范

本笔记使用 LaTeX 数学模式 (`$$...$$`) 对英文听写句子的发音进行可视化标注。以下为本笔记统一的符号系统。

### 基本规则

| 现象 | LaTeX 写法 | 渲染效果 | 含义 |
|:---|:---|:---|:---|
| **连读** | `\underset{\smile}{s\ o}` | $s\underset{\smile}{o}$ | 两个单词之间连读（s 和 o 连起来读） |
| **音标注读** | `\underbrace{\text{for her}}_{\text{/fɚ‿ɚ/}}` | $\underbrace{\text{for her}}_{\text{/fɚ‿ɚ/}}$ | 单词的实际发音（IPA 国际音标） |
| **省音** | `\cancel{d}` | $\cancel{d}$ | 画叉的字母不发音 |
| **实际读法** | `\overset{[实际]}{\overline{书面}}` | $\overset{[juss]}{\overline{just}}$ | 上面方括号内是真实发音，下面是原词 |
| **T 变化** | `\overset{[d]}{\overline{to}}` | $\overset{[d]}{\overline{to}}$ | to → /d/，展示具体变音 |
| **沉默字母** | `\overset{×}{\overline{'t}}` | $\overset{×}{\overline{'t}}$ | × 表示这部分的发音被完全省略 |

### 标注优先级

一句话里不需要把所有现象都标满。为了保持听写笔记清晰，优先标这些：

$$
\boxed{\text{重音/弱读}}
\quad>\quad
\boxed{\text{省音/持阻}}
\quad>\quad
\boxed{\text{连读/同化}}
\quad>\quad
\boxed{\text{完整 IPA}}
$$

**原则**：先标最影响听懂的地方。完整 IPA 只在读法明显偏离拼写、或容易反复听错时使用。

### LaTeX 安全约定

- 数学块里的百分号写成 `\%`，否则会被当成注释。
- 长英文句子优先放进 `\text{...}`，不要把普通文本直接散在数学环境里。
- IPA 字符如果导致 KaTeX 报错，优先用普通文本说明，或简化成 `[held]`、`[juss]`、`[outta]` 这类听感标记。
- 一个公式块不要塞太长；句子太长时拆成多个 `$$...$$`，可读性和渲染都更稳。

### 核心发音规律

#### ① 取消矩阵 (Cancellation Matrix)

$$
\boxed{\textbf{S\ N\ L}} \quad\text{(强辅音)}\quad+\quad \boxed{\textbf{d\ t\ th}} \quad\text{(弱辅音)}
\quad\Longrightarrow\quad \text{弱辅音弱化/持阻/省略}
$$

**含义**：这是 Coach Shane 体系里的教学简化。快速口语中，当一个单词以 S、N、L 结尾，下一个单词以 d、t、th 开头时，后面的弱辅音常被**弱化、持阻、同化或省略**；听写时可先按“取消矩阵”捕捉听感，再按具体上下文细分。

| 例子 | 书面 | 实际读法 |
|:---|:---|:---|
| international | $\text{international}$ | $\text{in}\cancel{\text{t}}\text{ernational}$ |
| don't | $\text{don}'\cancel{\text{t}}$ | /doʊn/ |
| most | $\text{mos}\cancel{\text{t}}$ | /moʊs/ |
| and the | $\text{an}\cancel{\text{d}}\text{ the}$ | /ən‿nə/ |
| in the | $\text{in the}$ | /ɪn‿nə/（th 被取消） |

#### ② H 省略 (7 H's)

$$
\boxed{\text{He}}\quad\boxed{\text{His}}\quad\boxed{\text{Her}}\quad\boxed{\text{Him}}\quad
\boxed{\text{Had}}\quad\boxed{\text{Has}}\quad\boxed{\text{Have}}
$$

在非重读位置，这 7 个词的 h 经常不发音，与前面的词连读：
- `for her` → /fɚ‿ɚ/（如 001 课）
- `I have` → /aɪ‿əv/
- `tell him` → /tɛl‿ɪm/

#### ③ "to" 的多种发音

$$
\text{to} \longrightarrow
\begin{cases}
\text{/tə/} & \text{弱读（最常见）}\\
\text{/tʊ/} & \text{介于 /tə/ 和 /tu/ 之间}\\
\text{/t/}  & \text{仅保留 t 的发音动作}\\
\text{/də/} & \text{跟在元音后时浊化}\\
\text{/d/}  & \text{整个 to 弱化为一个 d 音}
\end{cases}
$$

#### ④ 常见缩约形式

| 口语缩约 | 来源 | 例 |
|:---|:---|:---|
| outta | out of | $\overset{[outta]}{\overline{out\ of}}$ |
| wanna | want to | want to → wanna |
| gonna | going to | going to → gonna |
| gotta | got to / have got to | got to → gotta |
| kinda | kind of | kind of → /kaɪndə/ |
| juss | just | $\overset{[juss]}{\overline{just}}$ |

#### ⑤ T 在 N 后省音

当 t 出现在 **n 之后、元音之前**时，t 经常不发音：

| 例词 | 实际 |
|:---|:---|
| twenty | $\text{twen}\cancel{\text{ty}}$ → /ˈtwɛni/ |
| wanted | $\text{wan}\cancel{\text{t}}\text{ed}$ → /ˈwɑnɪd/ |
| international | $\text{in}\cancel{\text{t}}\text{ernational}$ → /ɪnərˈnæʃənəl/（快读听感） |

#### ⑥ "of" 的 f 省音

"of" 的 f 在辅音前经常省略：
- `out of` → outta
- `kind of` → kinda
- `start of the` → star(t) a the

#### ⑦ 同化 (Palatalization)

$$
\begin{aligned}
\text{t + you} &\rightarrow \text{/tʃə/} \quad (\text{got you} \rightarrow \text{/gɑtʃə/})\\
\text{d + you} &\rightarrow \text{/dʒə/} \quad (\text{would you} \rightarrow \text{/wʊdʒə/})\\
\text{s + you} &\rightarrow \text{/ʃə/} \quad (\text{miss you} \rightarrow \text{/mɪʃə/})\\
\text{z + you} &\rightarrow \text{/ʒə/} \quad (\text{has your} \rightarrow \text{/hæʒər/})
\end{aligned}
$$

---

#### ⑧ 连读三大类型 (Linking Types)

连读不改变音阶（音节）总数量，只**重新分配**音阶的划分，使每个音阶都以辅音开头。

**类型一：辅音 + 元音 (C+V)**

前面单词以辅音结尾，后面以元音开头 → 辅音划给后一个音节：

$$
\begin{aligned}
\text{pick up} &\rightarrow \text{pi-ckup}\\
\text{look after} &\rightarrow \text{loo-kaf-ter}\\
\text{fit into} &\rightarrow \text{fi-tinto}\\
\text{laugh at} &\rightarrow \text{lau-ghat}
\end{aligned}
$$

**类型二：元音 + 元音 (V+V) → 添加连读**

两个元音相遇，口腔形状变化会"添加"一个辅音作为粘合剂：

| 前元音嘴型 | 后元音嘴型 | 添加音 | 例子 |
|:---|:---|:---:|:---|
| 咧嘴 → 居中 | /iː/ /eɪ/ /aɪ/ → /ə/ | $+[\text{j}]$ | see again → $\text{see}\overset{[j]}{\overline{\ }}\text{again}$ |
| 撅嘴 → 居中 | /uː/ /oʊ/ /aʊ/ → /ə/ | $+[\text{w}]$ | go away → $\text{go}\overset{[w]}{\overline{\ }}\text{away}$ |

更多例子：
- `see again` → /siː‿jəˈgɛn/
- `juicy orange` → /ˈdʒuːsi‿jˈɔrɪndʒ/
- `go away` → /goʊ‿wəˈweɪ/
- `to east` → /tuː‿wiːst/
- `bamboo umbrella` → /bæmˈbuː‿wʌmˈbrɛlə/

**类型三：辅音 + 辅音 (C+C)**

| 前辅音类型 | 后辅音 | 处理方式 | 例子 |
|:---|:---|:---|:---|
| 非爆破音（f/s/z/ʃ/ʒ等） | 任意辅音 | 正常读，无需改变 | teach me, kiss me |
| 相同辅音 | 相同辅音 | 合并为一个，拉长发音 | big game → bigame, hot tea → hottea |
| 相似辅音（同部位不同清浊） | d/t/p/b/k/g | 只读第二个 | like to → like_to, with ten |
| **爆破音（t/d/p/b/k/g）** + 辅音 | 任意辅音 | 爆破音变 **Held**（只做嘴型不爆破） | not for me → no(t) for me |
| 含 [θ]/[ð] 的音 | 任意辅音 | th 常在口腔内完成（舌尖不伸出） | with the → wi(th) the, in the → i(n) the |

---

#### ⑨ 持阻/不爆破 (Held Stops)

当爆破音 **t/d/p/b/k/g** 后面接另一个辅音，或出现在短暂停顿前时，常常只做到口型和舌位，**不把气流爆破释放出来**。这不是完全省音，和 `\cancel{t}` 要区分。

| 现象 | 推荐标记 | 含义 |
|:---|:---|:---|
| held t | `\overset{[held]}{\overline{t}}` | t 到位但不爆破 |
| held d | `\overset{[held]}{\overline{d}}` | d 到位但不爆破 |
| 完全省略 | `\cancel{t}` | 这个音在听感上基本消失 |

$$
\begin{aligned}
\text{not for me} &\rightarrow \text{no}\overset{[held]}{\overline{t}}\text{ for me}\\
\text{hit by} &\rightarrow \text{hi}\overset{[held]}{\overline{t}}\text{ by}\\
\text{bad news} &\rightarrow \text{ba}\overset{[held]}{\overline{d}}\text{ news}
\end{aligned}
$$

> 快速判断：还能感觉到舌位或停顿，用 `[held]`；完全听不到、也不影响节奏时，才用 `\cancel{}`。

---

#### ⑩ t/d 的六种变体 (Six T/D Allophones)

t 和 d 是英语中变化最丰富的辅音。以下按"释放程度从高到低"排列：

| # | 变体名称 | 发音方式 | 出现位置 | 例子 |
|:---:|:---|:---|:---|:---|
| 1 | **Full t/d**（完整爆破） | 舌尖抵齿龈→憋气→弹开 | 单词开头、重读音节 | $\text{/t/}$ top, today |
| 2 | **Held t/d**（持阻） | 舌尖到位，**但不爆破** | 爆破音 + 辅音/结尾 | no$\cancel{\text{t}}$ for me, ba$\cancel{\text{t}}$ |
| 3 | **Flap t/d**（闪音） | 舌尖快速弹过上颚（声带不停） | 两元音之间（非重读） | be→/ɾ/er, wa→/ɾ/er, ci→/ɾ/y |
| 4 | **Shift t/d**（偏移） | t/d + [θ]/[ð] → 舌位偏移不伸出口 | t/d 后接 th | ge→ /t̪/ here, le→ /d̪/ that |
| 5 | **Silent t/d**（完全省略） | 直接消失 | 辅音丛中（n后+元音前最常见） | in$\cancel{\text{ter}}$national, twen$\cancel{\text{ty}}$ |
| 6 | **Glottal t**（喉塞音） | 声门闭合替代 t 的爆破 | t 在 [n]/[l] 前、词尾 | mou→ /ʔ/ ain, button→ bu→/ʔ/on |

> **快速判断法**：
> - 在词首 → Full ✅
> - 在辅音前或词尾 → Held ✅
> - 在两元音之间非重读 → Flap ✅
> - t+th → Shift ✅
> - n 后面 + 元音 → Silent ✅
> - t + n/l 音节 → Glottal ✅

---

#### ⑪ 超高频词弱读表 (Function Word Reductions)

这些词在句子中**不重读**时，元音缩减为 Schwa (/ə/)，辅音也可能弱化或消失：

| 单词 | 完整读音 | 弱读形式 | 例 |
|:---|:---|:---|:---|
| **the** | /ðiː/ | /ðə/ → /ð̩/（元音消失，舌尖不移出口腔） | $\underbrace{\text{the}}_{\text{/ðə/}}\text{ man}$ |
| **of** | /ɒv/ | /əv/ → /ə/（f 在辅音前消失） | $\underbrace{\text{kind of}}_{\text{/kaɪndə/}}$ |
| **to** | /tuː/ | /tə/ → /t/ → /də/ → /ɾə/ | $\underbrace{\text{want to}}_{\text{/wɑnə/}}$ |
| **for** | /fɔːr/ | /fər/ → /fɚ/ | $\underbrace{\text{for the}}_{\text{/fɚ‿ðə/}}$ |
| **your** | /jɔːr/ | /jər/ → /jɚ/ | $\underbrace{\text{your book}}_{\text{/jɚ‿bʊk/}}$ |
| **or** | /ɔːr/ | /ər/ → /ɚ/ | $\underbrace{\text{or not}}_{\text{/ɚ‿nɑt/}}$ |
| **at** | /æt/ | /ət/ | $\underbrace{\text{look at}}_{\text{/lʊk‿ət/}}$ |
| **some** | /sʌm/ | /səm/ | $\underbrace{\text{some more}}_{\text{/səm‿mɔr/}}$ |
| **and** | /ænd/ | /ən/ → /n/（仅剩鼻音，与前面连读） | $\underbrace{\text{you and me}}_{\text{/ju‿n‿mi/}}$ |
| **can** | /kæn/ | /kən/ → /kn/ | $\underbrace{\text{I can do}}_{\text{/aɪ‿kən‿du/}}$ |
| **that** | /ðæt/ | /ðət/（在从句中） | $\underbrace{\text{the book that I}}_{\text{/ðə‿bʊk‿ðət‿aɪ/}}$ |

> 弱读的核心原则：**不重读就弱读**（Unstressed = Reduced）。元音几乎全部变为 Schwa (/ə/)，辅音以省力为优先。

---

#### ⑫ 常见弱读扩展

下面这些词在听写中出现频率很高，常常比字面拼写更弱：

| 词/组合 | 常见弱读 | 例 |
|:---|:---|:---|
| have / has / had | /əv/ /əz/ /əd/ | should have → should've /ʃʊdəv/ |
| do / does | /də/ /dəz/ | do you → /də‿jə/ |
| you | /jə/ | what do you → /wʌdəjə/ |
| them | /əm/ | tell them → /tɛl‿əm/ |
| him / her / his | /ɪm/ /ər/ /ɪz/ | tell him, for her, lost his |
| would / could / should | /wəd/ /kəd/ /ʃəd/ | could be → /kəd‿bi/ |

> 这些弱读是否发生，取决于句子重音。被强调时仍读完整形式。

---

#### ⑬ 鼻腔爆破 (Nasal Plosion)

当爆破音 **t/d** + 鼻音 **n** 连在一起时（同一单词内或跨单词），爆破气流从口腔转向**鼻腔**发出，形成独特的鼻腔爆破效果：

**发音方式**：舌尖抵住上齿龈（t/d 的持阻位置），软腭下降，气流从鼻腔冲出，t/d 原有的口腔爆破被鼻音代替。

| 单词 | 错误读法 | 正确读法（鼻腔爆破） |
|:---|:---|:---|
| certain | /ˈsɜːrtən/ ❌ | /ˈsɜːrtn/ 或 /ˈsɜːrʔn/ → cer·tain |
| hidden | /ˈhɪdən/ ❌ | /ˈhɪdn/ → hid·den |
| button | /ˈbʌtən/ ❌ | /ˈbʌtn/ 或 /ˈbʌʔn/ → bu·tton |
| garden | /ˈgɑːrdən/ ❌ | /ˈgɑːrdn/ → gar·den |
| written | /ˈrɪtən/ ❌ | /ˈrɪtn/ 或 /ˈrɪʔn/ → wri·tten |

> 听感上：t/d 似乎"消失"了，只剩鼻音节拍。严格区分时，t+n 可出现喉塞音 /ʔn/，d+n 更常是 d 的鼻腔释放。注意在 `\overset{}{}` 标注中可标记为 `bu\overset{[ʔn]}{\overline{tton}}`

---

#### ⑭ -ed 和 -s 结尾读音规则

**过去式/过去分词 -ed 的三条规则：**

| 动词结尾音 | -ed 发音 | 例 |
|:---|:---:|:---|
| 清辅音（p/k/f/s/ʃ/tʃ 等） | /t/ | jumped /dʒʌmpt/, walked /wɔːkt/ |
| 非清辅音（浊辅音/元音/鼻音等） | /d/ | robbed /rɑbd/, cleaned /kliːnd/ |
| t/d 结尾 | /ɪd/ | gifted /ˈgɪftɪd/, headed /ˈhɛdɪd/ |

**名词复数/动词单三 -s 的四条规则：**

| 单词结尾音 | -s 发音 | 例 |
|:---|:---:|:---|
| 清辅音（p/t/k/f/θ） | /s/ | books /bʊks/, laughs /læfs/ |
| 浊辅音/元音 | /z/ | feels /fiːlz/, lives /lɪvz/ |
| 咝音（s/z/ʃ/ʒ/tʃ/dʒ）+es | /ɪz/ | watches /ˈwɑtʃɪz/, roses /ˈroʊzɪz/ |
| 以 e 结尾的无声 e | 同以上规则 | makes /meɪks/（k 清→s），lives /lɪvz/（v 浊→z） |

> 在听写中遇到 -ed 或 -s 结尾时，**不要被拼写迷惑**，要用以上规则去判断实际读音。

---

#### ⑮ s 后清辅音不送气（听感近似浊化）

当单词以 **s + 清辅音（p/t/k）+ 元音** 开头时，p/t/k 通常**不送气**。它们严格来说仍是清辅音 /p t k/，但对中文母语者听起来常接近 b/d/g：

| 拼写 | 音标字面 | 实际读法 |
|:---|:---|:---:|
| stop | /stɒp/ | /stɒp/（t 不送气，听感近似 d） |
| school | /skuːl/ | /skuːl/（k 不送气，听感近似 g） |
| speak | /spiːk/ | /spiːk/（p 不送气，听感近似 b） |
| student | /ˈstuːdnt/ | /ˈstuːdnt/（t 不送气，听感近似 d） |

> 教学时可以用“听起来像 b/d/g”帮助入门，但正式 IPA 仍写 /sp st sk/，不改成 /sb sd sg/。

---

#### ⑯ 句子重音 (Sentence Stress)

在句子中，**实词（content words）** 重读，**虚词（function words）** 弱读：

| 重读（实词） | 弱读（虚词） |
|:---|:---|
| 名词（cat, book, idea） | 冠词（a, an, the） |
| 实义动词（run, eat, believe） | 代词（he, she, it, them） |
| 形容词（big, happy, beautiful） | 介词（at, in, for, of） |
| 副词（quickly, very, always） | 连词（and, but, or） |
| 否定词（not, never） | 助动词（can, do, have, will） |

**示例对比：**

> I **NEED** to **GO** to the **STORE** **NOW**.
> 人 can 去 到 the 商店 现在
> （只有 NEED/GO/STORE/NOW 重读，to/the 弱读）

> **标注方法**：在句子中用 `\textbf{重读}` 标注，或用大写字母表示句子重音位置。

---

### 补充笔记

- \> 引用块用于：词汇解释、知识点总结、发音规则说明
- 中文翻译紧随英文句子之后
- `[xxx]` 方括号在 `\overset{}{}` 中表示实际发音
- 音标采用 IPA（国际音标）

---

## Daily Dictation 001-100

### daily english dictation 001

$$
\text{Mother Teresa, who \textbf{received a} Nobel Peace Prize }
\underbrace{\text{\textbf{for her}}}_{\text{/fɚ‿ɚ/}}
\text{ work }
\underbrace{\text{\textbf{on behalf of}}}_{\text{/əˈn bɪˈhæf əv/}}
\text{ the poor, }
\underbrace{\text{dies in}}_{\text{/daɪz‿ɪn/}}
\text{ Calcutta, India.}
$$

$$
she\ was\ 87\ year\underset{\smile}{s\ o}ld
$$

### daily english dictation 002
$$
\text{Jerry, }
\underbrace{\text{\textbf{what time}}}_{\text{/wʌt‿taɪm/}}
\text{ }
\underbrace{\text{\textbf{do you}}}_{\text{/də‿jə/}}
\text{ }
\underbrace{\text{\textbf{have}}}_{\text{/həv/}}
\text{?}
$$

你知道现在几点了吗？

$$
\text{I }\underbrace{\text{\textbf{h}əv}}_{\text{weak: /həv/}}\text{ fi}
\underset{\smile}{\text{ve\ o}}\text{'clock}
\quad\Longrightarrow\quad
\text{I }\underbrace{\text{əv}}_{\text{weaker: /əv/}}\text{ fi}
\underset{\smile}{\text{ve\ o}}\text{'clock}
$$

### daily english dictation 003

$$
\underbrace{\text{\textbf{There're}}}_{\text{/ˈðɛr‿ər/}}\ \text{three things}\ 
\underbrace{\text{\textbf{they've}}}_{\text{/ðeɪv/}}\ \text{learned never}
\underbrace{\text{\textbf{to}}}_{\text{/tə/}}
\ \text{discuss with people: religion, politics,}\ 
\underbrace{\text{\textbf{and the}}}_{\text{/ən‿nə/}}\ \text{Great Pumpkin.}
$$

> There're = There are 的缩约
> they've = they have 的缩约
> learned never → learned 的 d 在 n 前省略
> and the → 取消矩阵（d 取消 + th 被 n 同化）→ /ən‿nə/


### daily english dictation 004
$$\grave Don\overset{×}{\overline{'t}}\underset{\smile}{\ e}ver\ le\underset{\smile}{\text{t\ a}}nybody\ \underset{\smile}{\text{tell\ you}}\ you\ can\overset{×}{\overline{'t}} do\ some\overset{[n]}{\overline{thing}}$$

>重音 + 弱音 省略弱音
>
> 重音 S N L
>
> 弱音 d t th
>
> tell you → /tɛl‿jə/（l 到 y 的自然过渡，舌位不离开上颚）
> let anybody → t 与 a 连读

### daily english dictation 005
$$I\ have\ come\ here\ \overset{d}{to}\ chew\ bubblegum\ an{\cancel d}\ kick\ ass\ a\overset{[a\ nahm]}{\overline{n{\cancel d}\ I\ 'm}}\underset{\smile}{\ a}l\underset{\smile}{l\ o}\overset{[outta]}{\overline{u\underset{\smile}{t\ o}f}} bubblegum$$

> t的发音
>
> to tah tuh t..dah duh d'
>
> kick ass 攻击,如果kick ass 后面跟的是test，说明是全力以赴
>
>be (all) out of 没有足够的

### daily english dictation 006
the secret of life is just to live every moment! 

$$The\ secre\underset{\smile}{\overset{To}{\overline{t\ o}}}f\ li\underset{\smile}{fe\ i}s\ \overset{[juss]}{just}\ \overset{[t']}{to}\ li\underset{\smile}{ve\ e}very\ moment!$$

### daily english dictation 007
Another rogue trader has cost a bank billions

$$Anothe\overset{\quad r}{\overline{r\ r}}ogue\ trader\ has\ cos\underset{\smile}{t\ a}\ bank\ billions\ [ of\ dollars]$$

> rogue adj. (人或事物)不寻常的，破坏性的
>
> cost 使...损失

### daily english dictation 008
German,Rolf Buchholz, is the man with the most piercings;he's got 453


$$German,Rolf\ Buchholz,\ \underset{\overline{[zuh]}}{is\ \overset{[ð]}{\overline{\cancel{th}e}}}\ man\ wi\overset{\quad th}{\overline{th\ th}}e\ \overset{[mos]}{\overline{mos\cancel{t}}}\ piercings;he's\ got\ 453$$

> German 德国人
>
> piercings〔在身体某个部位的〕（穿）孔
>
> he's got 453 = he has got 453
>
> 453 发音：
> 
> 正常人：four hundred fifty-three
>
> 美国人：four hundred and fifty-three
>
> hundred 的发音  hu-nerd

$$hun\cancel d\overset{[er]}{re}d$$

### daily english dictation 009
$$A\ satelli\overset{\quad t}{\overline{te\ th}}at\ was\ carrie\overset{\quad [t']}{\overline{d\ t}}o\ space\ aboar\overset{\quad [th]}{\overline{d\ th}}e\ shuttle\ Discovery\ 20\ year\underset{\smile}{s\ a}go$$

$$i\underset{\smile}{s\ a}bou\overset{\quad [t']}{\overline{t\ to}} fall\ \overset{[d]}{to} Earth,\ but\ nobody\ know\underset{\smile}{s\ w}here\ the\ \overset{[d-bree]}{debris}\ will\ hit.$$


> satellite 卫星
>
> shuttle 航天飞机
>
> was carried to 被送到
>
> aboard 在（船、飞机等）上
>
> shuttle Discover 发现者号
>
> 20发音twenty
>
> is about to 准备好做某事
>
> debris （被毁物的）残骸;碎片;垃圾
>
> 前面是个坏消息，but 表示还有更糟糕的消息

$$twen\cancel ty$$

### daily english dictation 010
$$
\overset{[I\ z]}{\overline{It's}}\ 
\underset{\smile}{\text{a\ lofty}},\
(\overset{[probly]}{\overline{probably}}\ impossible)\ goal！
$$

> lofty （房间）屋顶高的；高耸的
> probably → /ˈprɑbli/，中间的 b 弱化，三个音节缩为两个
> impossible goal → /ɪmˈpɑsəbəl‿goʊl/（l 与 g 连读）

### daily english dictation 011
$$New\ York\ swep\overset{\quad th}{\overline{t\ th}}e\ Tampa\ Bay\ Rays\ by\ \overset{[idenical]}{iden\cancel tical}\ 4-2\ scores\ in\ a\ day-night\ doubleheader\ Wednesday.$$

> swept 扫;掸;打扫;清扫
>
> Tampa
>
> identical 完全相同的;同样的
>
> day-night
>
> doubleheader (常指两个球队之间同一天进行的)连续两场比赛

### daily english dictation 012

$$
\text{Jim Henson, }
\underset{\smile}{\text{creator\ of}}\ \text{The Muppets——from Kermi}
\underset{\smile}{\text{t\ the}}\ \text{Frog to Sesame Street——}
\underset{\smile}{\text{is\ born}}\ \text{in Greenville, Mississippi!}
$$

> Muppets 特定的布偶角色
> 
> Kermit "Kermit"是指著名的绿色青蛙角色，他是《Muppets（木偶秀）》和《Sesame Street（芝麻街）》中的主要角色之一。Kermit the Frog通常由演员Jim Henson操作和配音，他是许多人心中的经典儿童电视角色之一
>
> Greenville n. 格林维尔（美国城市）
>
> 发音要点：
> - creator of → /kriˈeɪtər‿əv/（r 与 o 连读）
> - Kermit the → t 在 th 前省略（t → t̚）
> - is born → /ɪz‿bɔrn/（z 与 b 连读）




### daily english dictation 013

$$ \text{Asian tiger mosquitoes are }
\underbrace{\text{native to}}_{\text{/ˈneɪtɪv‿tə/}}
\text{ the tropics of Southeast Asia, but }
\underbrace{\text{in the}}_{\text{/ɪn‿nə/}}
\text{ past few years }
\underbrace{\text{they've spread}}_{\text{/ðeɪv‿sprɛd/}}
\text{ all across the southeastern United States.} $$


> mosquitoes → /məˈskiːtoʊz/（s 读 /z/，注意 sk 发音）
> but in the → /bʌt‿ɪn‿nə/（取消矩阵：th 被 n 同化）
> past few → /pæs‿fjuː/（取消矩阵：t 在 f 前省音）
> they've → /ðeɪv/（have 的缩约，'ve 读 /v/）
> native to → /ˈneɪtɪv‿tə/（v 与 t 之间自然过渡）


### daily english dictation 014

$$
\text{Cats reputedly have nine lives, and he }
\underbrace{\text{wanted to}}_{\text{/ˈwɑnɪd tə/ → /ˈwɑnə/}}
\text{ spend at least }
\underbrace{\text{one of them}}_{\text{/wʌn‿əv‿ðəm/}}
\text{ here in New York City.}
$$


> reputedly → /rɪˈpjuːtɪdli/（注意重音在第二音节）
> wanted 的 -ed 按规则读 /ɪd/；wanted to 在快读中可弱化为 /ˈwɑnɪdə/，甚至接近 /ˈwɑnə/
> he → /iː/（H 省略：he 在句中被弱化）
> at least → /ət‿liːst/
> one of → /wʌn‿əv/


### daily english dictation 015

$$
\text{The frantic pacing — scene changes every 11 seconds on average — }
\underbrace{\text{often leaves}}_{\text{/ˈɔːfən‿liːvz/}}
\text{ kids }
\underbrace{\text{zoned out}}_{\text{/zoʊnd‿aʊt/}}
\text{ and }
\underbrace{\text{spun up}}_{\text{/spʌn‿ʌp/}}
\text{; unable to concentrate.}
$$


> frantic → /ˈfræntɪk/（注意 n 后的 t → Silent t）
> often → /ˈɔːfən/（t 不发音）
> zoned out → /zoʊnd‿aʊt/（d 与 aʊ 连读；out 的 t 为 Held t）
> spun up → /spʌn‿ʌp/（取消矩阵：n + 元音）


### daily english dictation 016

$$
\underbrace{\text{Battered, soaked and flooded}}_{\text{/ˈbætərd, soʊkt‿ən‿ˈflʌdɪd/}}\text{; the Philippines }
\underbrace{\text{is being hit}}_{\text{/ɪz‿ˈbiːɪŋ‿hɪt/}}
\text{ by its 2nd typhoon in a week.}
$$


> Battered → /ˈbætərd/（tt 在非重读音节中 → Flap t /ɾ/）
> soaked → /soʊkt/（-ed 在清辅音后读 /t/）
> and → /ən/ → /n/（弱读，几乎只剩鼻音）
> Philippines is → /ˈfɪlɪpiːnz‿ɪz/（z 与 ɪ 连读）
> hit by → /hɪt‿baɪ/（Held t：t 在 b 前不爆破）


### daily english dictation 017

$$
\underbrace{\text{A few years ago}}_{\text{/ə‿fjuː‿jɪrz‿əˈgoʊ/}}
\text{ they were }
\underbrace{\text{thought to be}}_{\text{/θɔːt‿tə‿bi/}}
\text{ useless }
\underbrace{\text{past their}}_{\text{/pæs‿ðer/}}
\text{ prime — not now!}
$$


> few years → /fjuː‿jɪrz/（元音+元音，添加 [j] 连读）
> thought to → /θɔːt‿tə/（t 为 Held t），to 弱读为 /tə/
> past their → /pæs‿ðer/（取消矩阵：t 在 th 前省音）
> not now → /nɑt‿naʊ/（Held t）


### daily english dictation 018

$$
\text{If you }
\underbrace{\text{are breathing}}_{\text{/ɑr‿ˈbriːðɪŋ/}}\text{, }
\underbrace{\text{it is}}_{\text{/ɪt‿ɪz/}}
\text{ not too late. }
\underbrace{\text{Get up}}_{\text{/gɛt‿ʌp/}}
\text{ and }
\underbrace{\text{get going}}_{\text{/gɛt‿ˈgoʊɪŋ/}}\text{.}
$$


> it is → 这里读完整的 it is 以表强调，不同于缩约 it's
> Get up → /gɛt‿ʌp/（Flap t /ɾ/，两元音间非重读）
> and → /ən/（弱读为 Schwa）
> get going → /gɛt‿ˈgoʊɪŋ/（Held t）


### daily english dictation 019

$$
\text{A 67-year-old grandpa has been found alive after being }
\underbrace{\text{stuck for}}_{\text{/stʌk‿fɔr/}}
\text{ 6 days at the bottom of a ravine.}
$$


> 67-year-old → /ˈsɪksti‿sɛvən‿jɪr‿oʊld/（连读链）
> grandpa → /ˈɡrænpɑ/（d 在 p 前省略）→ gran‿pa
> stuck for → /stʌk‿fɔr/（k 在 f 前正常发音）
> at the → /ət‿ðə/
> ravine → /rəˈviːn/（沟壑；注意重音在第二音节）


### daily english dictation 020

$$
\text{Saturday, an ultralight plane }
\underbrace{\text{crashed into}}_{\text{/kræʃt‿ˈɪntu/}}
\text{ a Ferris wheel at a rural festival in Australia, }
$$
$$ \text{yet somehow }
\underbrace{\text{no one}}_{\text{/noʊ‿wʌn/}}
\text{ on the amusement ride }
\underbrace{\text{nor the}}_{\text{/nɔr‿ðə/}}
\text{ plane was hurt.} $$


> ultralight plane → /ˈʌltrəlaɪt‿pleɪn/（Held t）
> crashed into → /kræʃt‿ˈɪntu/（-ed 读 /t/；t 与 i 连读）
> rural → /ˈrʊrəl/（注意两个 r 的卷舌）
> no one → /noʊ‿wʌn/（元音+元音，添加 [w] 连读）
> Ferris wheel → /ˈfɛrɪs‿wiːl/


### daily english dictation 021

$$
\underbrace{\text{Heidi won}}_{\text{/ˈhaɪdi‿wʌn/}}
\text{ the world }
\underbrace{\text{over with}}_{\text{/ˈoʊvər‿wɪð/}}
\underbrace{\text{her}}_{\text{/ər/}}
\text{ forever cute but }
\underbrace{\text{slightly}}_{\text{/ˈslaɪ}\cancel{\text{t}}\text{li/}}
\text{ confused look.}
$$


> won the → /wʌn‿ðə/（取消矩阵：n + th）
> world over → /wɜrld‿ˈoʊvər/（d 与 oʊ 连读）
> her → /ər/（H 省略：此处不读 /hər/ 只读 /ər/）
> slightly → /ˈslaɪtli/ → Silent t（/ˈslaɪli/ 在快速口语中 t 省略）


### daily english dictation 022

$$
\text{The project }
\underbrace{\text{to put}}_{\text{/tə‿pʊt/}}
\underbrace{\text{them online}}_{\text{/ðəm‿ɑnˈlaɪn/}}
\text{ is expected to be }
\underbrace{\text{completed by}}_{\text{/kəmˈpliːtɪd‿baɪ/}}
\text{ 2016.}
$$


> project to → /ˈprɑdʒɛkt‿tə/（t 为 Held t；to 弱读 /tə/）
> put them → /pʊt‿ðəm/（Held t）
> expected to → /ɪkˈspɛktɪd‿tə/（-ed 读 /ɪd/）
> completed → /kəmˈpliːtɪd/（-ed 在 t 后读 /ɪd/）
> 2016 → twenty sixteen（年份分读）


### daily english dictation 023

$$
\underbrace{\text{An alleged}}_{\text{/æn‿əˈlɛdʒd/}}
\text{ SAT cheating scandal has been }
\underbrace{\text{uncovered at}}_{\text{/ʌnˈkʌvərd‿ət/}}
\text{ a prestigious Long Island high school.}
$$

$$ \text{This college student is }
\underbrace{\text{accused of}}_{\text{/əˈkjuːzd‿əv/}}
\text{ taking the entrance exam for at least 6 students.} $$


> An alleged → /æn‿əˈlɛdʒd/（n 与 ə 连读）
> uncovered at → /ʌnˈkʌvərd‿ət/（d 与 ə 连读）
> accused of → /əˈkjuːzd‿əv/（z 与 ə 连读）
> prestigious → /prɛˈstɪdʒəs/（注意 /stɪdʒ/ 的发音）
> Long Island → /lɔːŋ‿ˈaɪlənd/（ŋ 与 aɪ 之间添加 [g] 音）


### daily english dictation 024

$$
\underbrace{\text{St. Louis}}_{\text{/seɪnt‿ˈluːɪs/ → /sən(t)‿ˈluːɪs/}}
\text{ takes the World Series opener on a cool night.}
$$

$$ \text{It was 49 degrees at }
\underbrace{\text{the start of the}}_{\text{/ðə‿stɑrt‿ə}\cancel{\text{f}}\text{‿ðə/}}
\text{ game.} $$


> St. → /seɪnt/ → /sən(t)/（快速口语中弱化，t 可轻读或省略）
> start of the → /stɑrt‿ə‿ðə/（of 的 f 在辅音前省音）
> cool 与 cruel 区分：cool /kuːl/ → cruel /ˈkruːəl/
> opener → /ˈoʊpənər/（开幕赛）


### daily english dictation 025

$$
\text{They }
\underbrace{\text{searched for}}_{\text{/sɜrtʃt‿fɔr/}}
\text{ the missing throughout the night under generator-powered }
\underbrace{\text{flood lights}}_{\text{/flʌd‿laɪts/}}
\text{ as family members }
\underbrace{\text{waited by}}_{\text{/ˈweɪtɪd‿baɪ/}}
\text{ the }
\underbrace{\text{mounds of debris}}_{\text{/maʊndz‿əv‿dəˈbriː/}}
\text{ — some in tears.}
$$


> searched for → /sɜrtʃt‿fɔr/（-ed 在清辅音后读 /t/）
> throughout the → /θruːˈaʊt‿ðə/（Held t）
> flood lights → /flʌd‿laɪts/（d 在 l 前，正常发音）
> mounds of → /maʊndz‿əv/（复数 s 读 /z/，z 与 ə 连读）
> debris → /dəˈbriː/（碎片，注意 s 不发音）


### daily english dictation 026

$$
\underbrace{\text{It's the kind of}}_{\text{/ɪts‿ðə‿kaɪnd‿ə/ (kinda)}}
\text{ thing you look forward to instead of, you know,}
$$

$$ \text{some workouts you dread and you }
\underbrace{\text{think of it as}}_{\text{/θɪŋk‿əv‿ɪt‿æz/}}
\text{ work and this is just fun.}
$$


> kind of → /kaɪnd‿ə/（kind 的 d 与 of 的 o 连读；of 弱读为 /ə/ → kinda）
> look forward to → /lʊk‿ˈfɔrwərd‿tə/
> think of it as → /θɪŋk‿əv‿ɪt‿æz/（连读链：k-ə-vɪ-tæz）
> dread and → /drɛd‿ən/（d 与 ə 连读）


### daily english dictation 027

$$
\text{Superhero costumes, as usual, are big this year — especially }
\underbrace{\text{from recent movies}}_{\text{/frəm‿ˈriːsənt‿ˈmuːviz/}}\text{,}
$$

$$ \text{like Thor and the Green Lantern.}$$


> as usual → /æz‿ˈjuːʒuəl/（z + j → /ʒ/）
> this year → /ðɪs‿jɪr/（s + j → /ʃ/）→ /ðɪʃɪr/
> recent → /ˈriːsənt/（t 在 n 前 → Silent t）
> big this → /bɪg‿ðɪs/（g 在 th 前保持爆破）


### daily english dictation 028

$$
\underbrace{\text{It's a pain}}_{\text{/ɪts‿ə‿peɪn/}}
\underbrace{\text{'cause}}_{\text{/kəz/}}
\text{ my fridge is... I }
\underbrace{\text{dumped it today}}_{\text{/dʌmpt‿ɪt‿təˈdeɪ/}}
\text{, and the food's gone.}
$$


> 'cause → /kəz/（because 的缩约）
> dumped it → /dʌmpt‿ɪt/（-ed 读 /t/；t 与 ɪ 连读）
> dumped it today → 连读链：dump‿ti‿təday
> food's → /fuːdz/（-'s 在浊辅音后读 /z/）


### daily english dictation 029

$$
\text{He says he was simply }
\underbrace{\text{going by the book}}_{\text{/ˈgoʊɪŋ‿baɪ‿ðə‿bʊk/}}
\underbrace{\text{when it comes to}}_{\text{/wɛn‿ɪt‿kʌmz‿tə/}}
\underbrace{\text{landing without gear}}_{\text{/ˈlændɪŋ‿wɪˈðaʊt‿gɪr/}}\text{,}
$$

$$ \text{and that }
\underbrace{\text{he and his}}_{\text{/hi‿ən‿ɪz/}}
\text{ fellow pilots train for these }
\underbrace{\text{types of incidents}}_{\text{/taɪps‿əv‿ˈɪnsɪdənts/}}\text{.}
$$


> he and his → /hi‿ən‿ɪz/（and 弱读 /ən/；his 的 h 省略）
> going by the book → 按规矩办事（习语）
> without gear → /wɪˈðaʊt‿gɪr/（Held t）
> types of → /taɪps‿əv/（s 与 ə 连读）
> incident / accident 区分：incident = 事件；accident = 事故


### daily english dictation 030

$$
\text{It is the vegetable some }
\underbrace{\text{love to hate}}_{\text{/lʌv‿tə‿heɪt/}}\text{!}
$$

$$ \text{But now a new breed of broccoli, super broccoli, developed in Britain }
\underbrace{\text{may protect against}}_{\text{/meɪ‿prəˈtɛkt‿əˈgɛnst/}}
\text{ heart disease and even some }
\underbrace{\text{kinds of cancers}}_{\text{/kaɪndz‿əv‿ˈkænsərz/}}\text{.}
$$


> love to hate → /lʌv‿tə‿heɪt/（to 弱读 /tə/）
> protect against → /prəˈtɛkt‿əˈgɛnst/（t 为 Held t）
> kinds of → /kaɪndz‿əv/（of 弱读为 /əv/，听起来像 kinda）
> developed in → /dɪˈvɛləpt‿ɪn/（-ed 读 /t/）


### daily english dictation 031

$$
\underbrace{\text{Mayor Sam Adams}}_{\text{/ˈmeɪər‿sæm‿ˈædəmz/}}
\underbrace{\text{ordered that the}}_{\text{/ˈɔrdərd‿ðət‿ðə/}}
\text{ camp be }
\underbrace{\text{shut down}}_{\text{/ʃʌt‿daʊn/}}
\text{ Saturday }
\underbrace{\text{citing}}_{\text{/ˈsaɪtɪŋ/}}
\text{ unhealthy conditions and attraction of drug dealers and }
\underbrace{\text{thieves}}_{\text{/θiːvz/}}\text{.}
$$


> ordered that the → /ˈɔrdərd‿ðət‿ðə/（that 弱读 /ðət/；the 的 th 在 it 后省略）
> shut down → /ʃʌt‿daʊn/（Held t：t 在 d 前不爆破）
> citing → 陈述原因（不同，更正式）
> thieves → /θiːvz/（thief 的复数形式，f → v + es）


### daily english dictation 032

$$
\text{A }
\underbrace{\text{preliminary government report}}_{\text{/prɪˈlɪmɪnɛri‿ˈgʌvərnmənt‿rɪˈpɔrt/}}
\text{ predicts }
\underbrace{\text{it'll take}}_{\text{/ˈɪtəl‿teɪk/}}
\text{ 30 years or more to safely }
\underbrace{\text{decommission that facility}}_{\text{/ˌdiːkəˈmɪʃən‿ðæt‿fəˈsɪlɪti/}}
$$
$$ \text{and }
\underbrace{\text{it could be}}_{\text{/ɪt‿kʊd‿bi/}}
\text{ decades before nearby residents who were }
\underbrace{\text{forced to flee}}_{\text{/fɔrst‿tə‿fliː/}}
\text{ can return to the area.}
$$


> preliminary → /prɪˈlɪmɪnɛri/（注意重音在第二音节）
> it'll → /ˈɪtəl/（it will 的缩约）
> decommission → /ˌdiːkəˈmɪʃən/（正式停止使用）
> could → /kʊd/（在句中读得极轻，此处几乎听不到 d）


### daily english dictation 033

$$
\underbrace{\text{I was lifting}}_{\text{/aɪ‿wəz‿ˈlɪftɪŋ/}}\text{, you know, chairs out of the way, broken glass, uh,}
$$

$$ \text{other sanitary items }
\underbrace{\text{I don't want to get into}}_{\text{/aɪ‿doʊnt‿ˈwɑnə‿gɛt‿ˈɪntu/}}\text{,}
$$

$$ \text{but um it was, uh, horrific }
\underbrace{\text{to say the least}}_{\text{/tə‿seɪ‿ðə‿liːst/}}\text{.}
$$


> don't want to → /doʊnt‿ˈwɑnt‿tə/ → wanna（口语缩约）
> get into → /gɛt‿ˈɪntu/（t 为 Held t）
> to say the least → 毫不夸张地说（习语）
> I don't want to get into it → 我不想谈论它


### daily english dictation 034

$$
\text{Toyota is recalling more than a half million vehicles for problems that }
\underbrace{\text{could make}}_{\text{/kʊd‿meɪk/}}
\text{ them difficult to steer.}
$$


> recalling → /rɪˈkɔːlɪŋ/（召回；也指回忆）
> vehicles → /ˈviːɪkəlz/（车辆，注意 h 不发音）
> could → /kʊd/（在句中读得极轻，d 几乎消失）
> difficult to → /ˈdɪfɪkəlt‿tə/（t 为 Held t）


### daily english dictation 035

$$
\underbrace{\text{It's great. It's um, been a little bit nerve-wracking}}_{\text{/ɪts‿greɪt‿ɪts‿əm‿bɪn‿ə‿ˈlɪɾl‿bɪt‿ˈnɜrv‿rækɪŋ/}}
$$

$$ \text{um, and }
\underbrace{\text{it's been a long process to get here}}_{\text{/ɪts‿bɪn‿ə‿lɔːŋ‿ˈprɑsɛs‿tə‿gɛt‿hɪr/}}\text{.}
$$


> nerve-wracking → /ˈnɜrv‿rækɪŋ/（精神上痛苦的）
> little → /ˈlɪɾl/（Flap t：两元音间非重读 t）
> it's been → /ɪts‿bɪn/（have 的缩约）
> process to → /ˈprɑsɛs‿tə/


### daily english dictation 036

$$
\text{When the family left Vietnam by boat, }
\underbrace{\text{bound for Thailand}}_{\text{/baʊnd‿fər‿ˈtaɪlænd/}}\text{,}
$$

$$ \text{but the boat was }
\underbrace{\text{intercepted by pirates}}_{\text{/ˌɪntərˈsɛptɪd‿baɪ‿ˈpaɪrəts/}}\text{.}
$$

$$ \text{After years of trying, the father }
\underbrace{\text{located his son}}_{\text{/ˈloʊkeɪtɪd‿ɪz‿sʌn/}}
\text{ in Thailand.}
$$


> bound for → /baʊnd‿fər/（开往某地；交通工具的固定搭配）
> intercepted → /ˌɪntərˈsɛptɪd/（-ed 在 t 后读 /ɪd/）
> located his → /ˈloʊkeɪtɪd‿ɪz/（his 的 h 省略→ /ɪz/）


### daily english dictation 037

$$
\text{A gooey mess }
\underbrace{\text{snarls traffic}}_{\text{/snɑrlz‿ˈtræfɪk/}}
\text{ along the busy Pennsylvania Turnpike.}
$$

$$ \text{A leaking valve on a tanker spread driveway sealant across a 40-mile stretch of the eastbound side.}
$$


> gooey → /ˈguːi/（黏糊糊的；goo = 黏性物质）
> snarls → /snɑrlz/（阻碍交通；也指（动物）咆哮）
> valve → /vælv/（阀门；faucet 为水龙头）
> sealant → /ˈsiːlənt/（密封剂）
> eastbound → /ˈiːstbaʊnd/（东行方向）


### daily english dictation 038

$$
\text{The music is being played }
\underbrace{\text{at a church}}_{\text{/ət‿ə‿tʃɜrtʃ/}}
\text{ in Germany and, well, it really }
\underbrace{\text{lives up to its name}}_{\text{/lɪvz‿ʌp‿tə‿ɪts‿neɪm/}}\text{.}
$$

$$ \text{Since it started, }
\underbrace{\text{there have been}}_{\text{/ðər‿əv‿bɪn/}}
\text{ just 11 chord changes and the }
\underbrace{\text{next one isn't scheduled}}_{\text{/nɛkst‿wʌn‿ˈɪzənt‿ˈskɛdʒuːld/}}
\text{ until July 2012.}
$$


> there have been → /ðər‿əv‿bɪn/（连读链，容易听成 happen）
> lives up to → 名副其实（习语）
> chord → /kɔrd/（和弦；注意 ch 读 /k/）
> isn't scheduled → /ˈɪzənt‿ˈskɛdʒuːld/（t 为 Silent t）


### daily english dictation 039

$$
\text{Dozens of white rabbits were apparently dumped }
\underbrace{\text{along the side of the road}}_{\text{/əˈlɔːŋ‿ðə‿saɪd‿ə}\cancel{\text{f}}\text{‿ðə‿roʊd/}}
\text{ Sunday night.}
$$

$$ \text{More than 60 }
\underbrace{\text{bunnies}}_{\text{/ˈbʌniz/}}
\text{ were scattered on the shoulder.}
$$


> along the side of the → /əˈlɔːŋ‿ðə‿saɪd‿ə‿ðə/（of 的 f 在 th 前省音）
> side of → /saɪd‿ə/（f 省音，听起来像 side a）
> bunny → /ˈbʌni/（rabbit 的儿语/口语化表达）
> on the shoulder → 在路肩上（shoulder = 路肩）


### daily english dictation 040

$$
\underbrace{\text{There's a wonderful line}}_{\text{/ðərz‿ə‿ˈwʌndərfəl‿laɪn/}}
\text{ I came across: If }
\underbrace{\text{you've always done}}_{\text{/juv‿ˈɔːlweɪz‿dʌn/}}
\text{... or, if you always do what }
\underbrace{\text{you've always done}}_{\text{/juv‿ˈɔːlweɪz‿dʌn/}}\text{,}
$$
$$
\underbrace{\text{you'll always get}}_{\text{/jul‿ˈɔːlweɪz‿gɛt/}}
\underbrace{\text{you've always got}}_{\text{/juv‿ˈɔːlweɪz‿gɑt/}}\text{.}
\underbrace{\text{It's a brilliant line.}}_{\text{/ɪts‿ə‿ˈbrɪljənt‿laɪn/}}
$$


> There's a → /ðərz‿ə/（快速口语中几乎听成 /ðəz‿ə/）
> you've / you'll → 缩约形式在快速口语中极轻，靠时态判断
> came across → 偶然发现（习语）
> brilliant line → /ˈbrɪljənt‿laɪn/（t 在 l 前 → Silent t）


### daily english dictation 041

$$
\text{Her story }
\underbrace{\text{has inspired}}_{\text{/həz‿ɪnˈspaɪərd/}}
\text{ others from Montana to Indiana to pay off the bills of complete strangers}
$$

$$ \text{in these days before Christmas. Holiday shoppers }
\underbrace{\text{who've heard}}_{\text{/huːv‿hɜrd/}}
\text{ about the layaway Santas,}
$$

$$ \text{say the sweeping acts of kindness have }
\underbrace{\text{restored their faith in people.}}_{\text{/rɪˈstɔrd‿ðer‿feɪθ‿ɪn‿ˈpiːpəl/}}
$$


> has inspired → /həz‿ɪnˈspaɪərd/（has 弱读 /həz/；inspired 的 d 几乎听不到）
> who've heard → /huːv‿hɜrd/（have 的缩约）
> sweeping → /ˈswiːpɪŋ/（影响广泛的；大范围的）
> restored → /rɪˈstɔrd/（恢复；faith in → 对…的信任）


### daily english dictation 042

$$
\text{He }
\underbrace{\text{sprang to his sleigh}}_{\text{/spræŋ‿tə‿ɪz‿sleɪ/}}
\text{ to his team gave a whistle!}
$$

$$ \text{And }
\underbrace{\text{away they all flew}}_{\text{/əˈweɪ‿ðeɪ‿ɔːl‿fluː/}}
\text{ like a down of a thistle.}
$$

$$ \text{But I heard him exclaimed }
\underbrace{\text{as he drove out of sight}}_{\text{/æz‿i‿droʊv‿aʊt‿əv‿saɪt/}}
$$

$$ \text{"Happy Christmas to all, and to all a good night!"}
$$


> sprang → /spræŋ/（spring 的过去式：跳跃）
> sleigh → /sleɪ/（雪橇）
> to his → /tə‿ɪz/（his 的 h 省略）
> as he → /æz‿i/（he 的 h 省略）
> out of sight → /aʊt‿əv‿saɪt/（t 为 Held t）
> like a down of a thistle → 像蓟花的羽毛（比喻）


### daily english dictation 043

$$
\text{E: Hey George, you know, my friend goes to a }
\underbrace{\text{psychic}}_{\text{/ˈsaɪkɪk/}}\text{,}
$$

$$ \text{G: Really?}
$$

$$ \text{E: Uh-huh. We should go sometime.}
$$

$$ \text{G: I'd love to go. }
\underbrace{\text{Make an appointment.}}_{\text{/meɪk‿ən‿əˈpɔɪntmənt/}}
$$


> psychic → /ˈsaɪkɪk/（灵媒，算命师）
> sometime → /ˈsʌmtaɪm/（有机会/下次；≠ sometimes）
> make an appointment → /meɪk‿ən‿əˈpɔɪntmənt/（介词 n 与 元音连读；t 在 n 前 Silent t）
> appointment 与 reservation 区别：appointment → 咨询/预约人；reservation → 订座位/房间


### daily english dictation 044

$$
\text{R: }
\underbrace{\text{Dad, I beat you.}}_{\text{/dæd‿aɪ‿biːt‿ʃə/ (t+j→tʃ)}}
\underbrace{\text{Don't you remember}}_{\text{/doʊnt‿ʃə‿rɪˈmɛmbər/}}
\text{ the Raymond Spinball?}
$$

$$ \text{F: Ray, I learnt to play in Korea — from Koreans.}
$$

$$ \text{Do you think some }
\underbrace{\text{pun}k\text{ kid's gonna actually beat me?}}_{\text{/pʌŋk‿kɪdz‿ˈgɔnə‿ˈæktʃuəli‿biːt‿mi/}}
$$


> beat you → /biːt‿ʃə/（t + j → tʃ 同化）
> Don't you → /doʊnt‿ʃə/（t + j → tʃ同化）
> gonna → /ˈgɔnə/（going to 的口语缩约）
> actually → /ˈæktʃuəli/（注意 ct 的发音）


### daily english dictation 045

$$
\text{Hey, is it cold out?}
$$ 


> is it → /ɪz‿ɪt/
> cold out → /koʊld‿aʊt/（d 与 aʊ 连读，out 的 t 为 Held t）
> cold out = cold outside（询问外面冷不冷，常见口语表达）


### daily english dictation 046

$$
\text{For more than 3000 years, the power of the French king }
\underbrace{\text{was absolute}}_{\text{/wəz‿ˈæbsəluːt/}}\text{.}
$$

$$ \text{This }
\underbrace{\text{meant}}_{\text{/mɛnt/}}
\text{ that he }
\underbrace{\text{had the power}}_{\text{/hæd‿ðə‿ˈpaʊər/}}
\text{ to do anything.}
$$


> meant → /mɛnt/（注意：在这里实际读得接近 /mæn/，但语法上必须是 meant）
> was absolute → /wəz‿ˈæbsəluːt/（was 弱读为 /wəz/）
> had the → /hæd‿ðə/（d 在 th 前为 Held d）


### daily english dictation 047

$$
\text{What people will do these days for their pets...}
$$

$$ \underbrace{\text{A wash and a blowdry}}_{\text{/ə‿wɑʃ‿ən‿ə‿ˈbloʊdraɪ/}}\text{ — }
\underbrace{\text{that goes without saying}}_{\text{/ðæt‿goʊz‿wɪˈðaʊt‿ˈseɪɪŋ/}}\text{.}
$$

$$ \text{But the demanding dogs now }
\underbrace{\text{wants a limo}}_{\text{/wɑnts‿ə‿ˈlɪmoʊ/}}
\text{ along with other }
\underbrace{\text{creature comforts}}_{\text{/ˈkriːtʃər‿ˈkʌmfərts/}}
\text{ at a pet hotel and day spa!}
$$


> blowdry → /ˈbloʊdraɪ/（吹干）
> goes without saying → 不言而喻（习语）
> demanding → /dɪˈmændɪŋ/（要求高的，形容词）
> limo → /ˈlɪmoʊ/（limousine 的简写：豪华轿车）
> creature comforts → 物质享受（习语：creature comforts = material needs）


### daily english dictation 048

$$
\underbrace{\text{Buckingham Palace officials}}_{\text{/ˈbʌkɪŋəm‿ˈpælɪs‿əˈfɪʃəlz/}}
\text{ are }
\underbrace{\text{staying mum about}}_{\text{/ˈsteɪɪŋ‿mʌm‿əˈbaʊt/}}
\text{ the murder case,}
$$

$$ \text{and police are keeping }
\underbrace{\text{many details confidential}}_{\text{/ˈmɛni‿dɪˈteɪlz‿ˌkɑnfɪˈdɛnʃəl/}}
\text{ as they try to identify the victim}
$$

$$ \text{and figure out exactly what happened to her.}
$$


> Buckingham Palace → /ˈbʌkɪŋəm‿ˈpælɪs/（白金汉宫）
> staying mum → /ˈsteɪɪŋ‿mʌm/（保持沉默；习语）
> official / officer 区分：official = 官员；officer = 警员
> details → /dɪˈteɪlz/（注意重音在第二音节）


### daily english dictation 049

$$
\text{January 10th, 1863 — "All aboard, }
\underbrace{\text{but mind the gap"}}_{\text{/bʌt‿maɪnd‿ðə‿gæp/}}
\text{ as world's first underground passenger railway opens in London.}
$$


> All aboard → /ɔːl‿əˈbɔrd/（请上车/上船，乘务员用语）
> mind the gap → /maɪnd‿ðə‿gæp/（注意站台间隙，伦敦地铁标志性提示语）
> but → /bʌt/（此处 t 在 m 前为 Held t）


### daily english dictation 050

$$
\underbrace{\text{And why do you wanna go there?}}_{\text{/ənd‿waɪ‿də‿jə‿ˈwɑnə‿goʊ‿ðer/}}
$$

$$ \text{I know it's had a bad press recently but it's the place }
\underbrace{\text{that's taken my fancy.}}_{\text{/ðæts‿ˈteɪkən‿maɪ‿ˈfænsi/}}
$$


> wanna → /ˈwɑnə/（want to 的口语缩约）
> why do you → /waɪ‿də‿jə/（do 弱读为 /də/，you 弱读为 /jə/）
> had a bad press → /hæd‿ə‿bæd‿prɛs/（媒体负面报道）
> taken my fancy → /ˈteɪkən‿maɪ‿ˈfænsi/（吸引了我，英式口语）


### daily english dictation 051

$$
\text{There's people running and walking their dogs and having brunch on the patios.}
$$

> patio → /ˈpætioʊ/（露台/平台，有桌椅的户外区域）
> and → /ən/（弱读，几乎只剩鼻音）

### daily english dictation 052

$$
\text{Martin Luther King, Jr.'s rise as a civil rights leader}
\text{began in 1955 when he spearheaded the drive to desegregate}
\text{public buses in Montgomery, Alabama.}
$$

> when he → /wɛn‿i/（he 的 h 省略）
> spearheaded → /ˈspɪrhɛdɪd/（带头/率先发起）
> desegregate → /diːˈsɛgrɪgeɪt/（废除种族隔离）

### daily english dictation 053

$$
\text{Anti-piracy legislation under consideration in Washington}
\text{has made some websites in a tizzy.}
\text{Wikipedia, Boing Boing and Reddit say they will have none of it}
\text{and are blacking out their sites on Wednesday.}
$$

> in a tizzy → /ɪn‿ə‿ˈtɪzi/（慌乱/焦躁状态）
> blacking out → /ˈblækɪŋ‿aʊt/（屏蔽/变黑）
> Wednesday → /ˈwɛnzdeɪ/（d 在 n 后不发音）

### daily english dictation 054

$$
\text{There are usually about 3 shark attacks on people}
\text{in and around Australia all year.}
\text{In 2012, the country has seen 3 attacks already}
\text{and January isn't even finished yet.}
$$

> in and around → /ɪn‿ən‿əˈraʊnd/（在…里和周围）
> attacks → /əˈtæks/

### daily english dictation 055

$$
\text{A Georgia mother says she was arrested for allowing}
\text{her 10-year-old son to get a tattoo in memory of his late brother.}
\text{We hoped that they could find something that would sustain}
\text{them through that loss, but this is not the way.}
$$

> late brother → /leɪt‿ˈbrʌðər/（已故的兄弟；late 在此指已故）
> his → /ɪz/（H 省略）

### daily english dictation 056

$$
\underbrace{\text{You sold us a hair with a cake around it?}}_{\text{/ju‿soʊld‿ʌs‿ə‿hɛr‿wɪð‿ə‿keɪk‿əˈraʊnd‿ɪt/}}
$$

> sold us → /soʊld‿ʌs/（d 与 ʌ 连读）
> around it → /əˈraʊnd‿ɪt/（d 与 ɪ 连读）

### daily english dictation 057

$$
\text{It's surely in the running for one of the most expensive pile-ups in highway history.}
\text{These crumpled Ferraris were among 8 involved in the crash.}
\text{The airbags may have saved those inside from serious injury,}
\text{but oh what damages have been done to bruise the spirits}
\text{of these enthusiasts attached to their sleek sports cars.}
$$

> pile-ups → /ˈpaɪl‿ʌps/（连环追尾事故）
> crumpled → /ˈkrʌmpəld/（压皱的；车祸变形）
> bruise the spirits → 打击精神（拟人化表达）
> sleek → /sliːk/（线条流畅的）

### daily english dictation 058

$$
\text{Hey, Lilith, sorry for the holdup, but Frasier should be back}
\text{from the dentist any minute. Oh, all right.}
\text{That will give us a chance to visit.}
$$

> holdup → /ˈhoʊld‿ʌp/（耽搁/延误）
> dentist any → /ˈdɛntɪst‿ˈɛni/（t 与 ɛ 连读）

### daily english dictation 059

$$
\text{This iceberg here, there's outcroppings under the water.}
\text{And the sea ice, iceberg ice is very hard, so it's almost like,}
\text{it could be almost be like a can opener.}
\text{And probably the Titanic went by it,}
\text{it just sliced a hole in it like you would with a manual can opener!}
$$

> outcroppings → /ˈaʊtkrɑpɪŋz/（露出地面的岩层）
> can opener → /ˈkæn‿ˈoʊpənər/（开罐器）

### daily english dictation 060

$$
\text{It's snowing, it's beautiful, we're out in the middle of nowhere.}
\text{I'm freezing! And I'm about to be pulled by 8 dogs in a toboggan.}
\text{Um, really, it doesn't get much more Vermont than this.}
$$

> middle of nowhere → 荒郊野外（习语）
> much more Vermont than this → 这很佛蒙特（极具本地特色）

### daily english dictation 061

$$
\text{Feb 9th, 1964, Beatlemania hits prime time in the United States.}
$$

> Beatlemania → /ˌbeɪtəlˈmeɪniə/（披头士狂热）
> prime time → /ˈpraɪm‿taɪm/（黄金时段）

### daily english dictation 062

$$
\text{According to the CDC, 2 out of every 3 Americans are considered either overweight or obese,}
\text{and the trend towards unhealthy habits is starting even younger}
\text{with nearly 20\% of children between the age of 6 and 11 considered obese.}
$$

> CDC → 美国疾控中心
> obese → /oʊˈbiːs/（过度肥胖）；overweight（超重）

### daily english dictation 063

$$
\text{There are places I remember all my life, though some have changed}
\text{Some forever, not for better, some have gone, and some remain.}
\text{All these places had their moments with lovers and friends}
\text{I still can recall}
\text{Some are dead and some are living, in my life I've loved them all.}
$$

> 此歌为 Beatles 的 In My Life 歌词
> I've → I have 的缩约

### daily english dictation 064

$$
\text{Douglas, would you please pass the catsup?}
\text{The what? The catsup. You mean the ketchup?}
\text{Educated people pronounce it cat-sup.}
\underbrace{\text{Not if they want me to pass it to you.}}_{\text{/nɑt‿ɪf‿ðeɪ‿wɑnt‿mi‿tə‿pæs‿ɪt‿tə‿ju/}}
$$

> catsup / ketchup → /ˈkɛtʃəp/（番茄酱，两种拼写均可）
> want me to → /wɑnt‿mi‿tə/（连读链）

### daily english dictation 065

$$
\text{February 18th, 1885, Mark Twain's "The Adventures of Huckleberry Finn",}
\text{one of the greatest American novels, is first published in the United States.}
$$

> Mark Twain → 马克·吐温（塞缪尔·克莱门斯笔名）
> greatest → /ˈgreɪtɪst/（t 在 s 前为 Silent t）

### daily english dictation 066

$$
\text{86\% of all doctor visits and illnesses, statistically, are based on stress.}
$$

> statistically → /stəˈtɪstɪkli/
> based on → /beɪst‿ɑn/

### daily english dictation 067

$$
\text{History is amazing.}
\text{What took thousands of years to develop as a great civilization, took a flash to change.}
\text{When Hernando Cortes and 550 men landed on the Gulf of Mexico in 1519,}
\text{it took only a couple of years to forever change the land that is now Mexico.}
$$

> took a flash → 瞬间（flash = 极短时间）
> couple of → /ˈkʌpəl‿əv/ → /ˈkʌpələ/（弱读）

### daily english dictation 068

$$
\text{Stop it!}
\text{Stop what?}
\underbrace{\text{You're talking about me in the Morse code.}}_{\text{/jər‿ˈtɔːkɪŋ‿əˈbaʊt‿mi‿ɪn‿ðə‿mɔrs‿koʊd/}}
\text{But you know what? Joke's on you 'cuz I know Morse code. Ha!}
$$

> You're → /jər/（弱读）
> 'cuz → /kəz/（because 口语缩约）
> Morse code → 摩斯密码

### daily english dictation 069

$$
\text{American Electric Power is currently below its 50-day moving average of 40 dollars 28 cents}
\text{and below its 200-day moving average of 38 dollars 53 cents.}
$$

> moving average → 移动均线（股票术语）
> of → /əv/ → /ə/（弱读）

### daily english dictation 070

$$
\text{People born on February 29th on some previous leap years}
\text{— also known as "leaplings" —}
\text{they finally get to celebrate their real birthdays!}
$$

> leap years → /liːp‿jɪrz/（闰年）
> leaplings → /ˈliːplɪŋz/（闰日宝宝）
> also known as → AKA
> get to → 有机会做某事

### daily english dictation 071

$$
\text{You can essentially opt out of the new policy}
\text{by manually deleting your Google web history}
\text{or by simply not signing in to sites like Gmail when searching on Google.}
$$

> essentially → /ɪˈsɛnʃəli/（本质上）
> opt out of → /ɑpt‿aʊt‿əv/（选择退出）

### daily english dictation 072

$$
\text{Everyone who comes into our shop tells us}
\text{you have the perfect life and we say,}
\text{yeah, you know what, we do, we really do.}
\text{They go hand in hand — books and chocolate.}
$$

> go hand in hand → 密不可分（习语）
> comes into → /kʌmz‿ɪntu/

### daily english dictation 073

$$
\text{I have accomplished more in my life}
\underbrace{\text{than I've ever thought possible.}}_{\text{/ðən‿aɪv‿ˈɛvər‿θɔːt‿ˈpɑsəbəl/}}
$$

> than → /ðən/（注意不是 that；通过前面的 more 可推断出 than）
> I've → I have 的缩约

### daily english dictation 074

$$
\text{5.4 million children; children who are 8, 9 and 10 years of age}
\text{who are being used to mine with their bare hands}
\text{so you can text and play Angry Birds.}
$$

> used to → /juːzd‿tə/（注意 -ed 读 /d/ 而非 /t/）
> mine with → /maɪn‿wɪð/（用双手挖矿）
> text and → /tɛkst‿ən/（and 弱读）

### daily english dictation 075

$$
\text{See you at the Seahawks' 12k, 5k run or walk and Kids Dash April 1st.}
$$

> Seahawks → /ˈsiːhɔːks/（西雅图海鹰队，NFL 球队）
> 12k → 12公里赛跑

### daily english dictation 076

$$
\text{24-hour access to cupcakes?}
\text{It's a nightmare for dieters, but this vending concept}
\text{is an advantage for Sprinkles when it comes to cupcake competition.}
$$

> vending → /ˈvɛndɪŋ/（自动售货）
> Sprinkles → 美国著名杯子蛋糕店
> when it comes to → 说到/就…而言

### daily english dictation 077

$$
\text{Next we enter the White Desert where from a distance}
\text{the limestone looks like snow and rock piles like icebergs.}
$$

> from a distance → /frəm‿ə‿ˈdɪstəns/（从远处看）
> limestone → /ˈlaɪmstoʊn/（石灰岩）

### daily english dictation 078

$$
\text{Call Jeff and tell him about this.}
\text{No, wait, wait, what time is it?}
\text{It's 10:20. 10 o'clock is cut-off time.}
\text{You don't call people after 10:00.}
\text{No, no, no. The cut-off time is 10:30. No, it's 10:30!}
$$

> cut-off time → /ˈkʌt‿ɔːf‿taɪm/（截止时间）
> tell him → /tɛl‿ɪm/（h 省略）

### daily english dictation 079

$$
\underbrace{\text{Stand firm for what you believe in}}_{\text{/stænd‿fɜrm‿fɔr‿wʌt‿jə‿bɪˈliːv‿ɪn/}}
\text{until and unless logic and experience prove you wrong.}
\text{Remember, when the emperor looks naked, the emperor is naked.}
\text{The truth and a lie are not the same thing.}
$$

> Stand firm → /stænd‿fɜrm/（坚定立场）
> believe in → /bɪˈliːv‿ɪn/（连读，容易听成 believe then）
> the emperor is naked → 出自《皇帝的新装》典故

### daily english dictation 080

$$
\text{Olives are the gold in Andalucia.}
\text{Spain is the world's biggest olive oil producer.}
\text{Andalucia accounts for 80\% of Spanish oil.}
$$

> Andalucia → 安达卢西亚（西班牙南部橄榄产区）
> account for → /əˈkaʊnts‿fɔr/（占…比例）

### daily english dictation 081

$$
\text{Dr. Emoto has conducted an interesting experiment.}
\text{He places rice into 3 glass beakers and covers it with water.}
\text{And then every day for a month he said "thank you" to one beaker,}
\text{"you are an idiot" to the second}
\text{and the third one he completely ignored.}
$$

> beaker → /ˈbiːkər/（烧杯，实验室容器）
> completely → /kəmˈpliːtli/（t 在 l 前 → Silent t）

### daily english dictation 082

$$
\text{You know, most people think that the world is getting worse...}
\text{that the life of their children is gonna be less than they had.}
\text{But the fact of the matter is,}
\text{the world is getting better at an extraordinary rate.}
$$

> most people → /moʊst‿ˈpiːpəl/（取消矩阵：t 在 p 前省音）
> is gonna → going to 的口语缩约
> fact of the matter → 事实是（固定习语）

### daily english dictation 083

$$
\text{In a city full of showy sights,}
\text{these are more humble creations standing by until}
\text{that stretch in March and April when it is time to blossom.}
$$

> showy → /ˈʃoʊi/（华丽的；≠ shy）
> sights → /saɪts/（风景；≠ sites 场地）
> stretch → 一段时间

### daily english dictation 084

$$
\underbrace{\text{Trying is having the intention to fail.}}_{\text{/ˈtraɪɪŋ‿ɪz‿ˈhævɪŋ‿ði‿ɪnˈtɛnʃən‿tə‿feɪl/}}
\text{You gotta scrap the word from your vocab.}
\text{Say you're gonna do it, and you will.}
$$

> having the intention → 抱有…的意图
> gotta → /ˈgɑtə/（got to 的口语缩约）
> scrap → /skræp/（丢弃/废除）

### daily english dictation 085

$$
\text{Well, that, I think, is a real crux of this issue.}
$$

> Well, that → 口语常见转换语气词
> crux → /krʌks/（关键/核心）
> issue → /ˈɪʃuː/（注意不是 /ˈɪsjuː/）

### daily english dictation 086

$$
\text{Look, imagination feeds exploration.}
\text{You have to imagine the possible before you can go and do it.}
$$

> Look → /lʊk/（口语引入词，相当于"你看"）
> feeds → /fiːdz/（滋养/激发）

### daily english dictation 087

$$
\text{Go ahead. Yep, sure. There were a few...}
$$

> 这期是愚人节玩笑：Coach Shane 用极快英伦腔说话
> 本课重点复习了 S/N/L 取消矩阵
> in the car → in nuh car（th 被 n 同化）

### daily english dictation 088

$$
\text{These are not the dunes of the Sahara.}
\text{In fact, they are found beyond the Arctic Circle}
\text{in the permafrost of Russia's north.}
$$

> dunes → /duːnz/（沙丘）
> Arctic Circle → 北极圈
> permafrost → /ˈpɜrməfrɔːst/（永久冻土）

### daily english dictation 089

$$
\text{April 4th, the day to show compassion,}
\text{care and act for stray animals all around the world!}
$$

> show compassion → 展现同情心（反义词：apathy 漠不关心）
> stray animals → 流浪动物

### daily english dictation 090

$$
\text{1896, the first modern Olympic Games opened in Athens, Greece}
\text{— land of the ancient games — with athletes from 14 countries.}
$$

> Athens → /ˈæθɪnz/（雅典；注意 th 发音）
> athletes → /ˈæθliːts/（运动员）

### daily english dictation 091

$$
\text{My bad.}
\underbrace{\text{Tell me you have good insurance.}}_{\text{/tɛl‿mi‿jə‿hæv‿gʊd‿ɪnˈʃʊrəns/}}
\text{Yep, I got "Allstate". Really?}
$$

> My bad → /maɪ‿bæd/（我的错，口语习语）
> Tell me → 此处含义接近"你最好告诉我"
> Allstate → 好事达保险公司

### daily english dictation 092

$$
\text{The point is, you should get to know a person first, then judge them.}
\text{You should never judge a book by its cover.}
\underbrace{\text{Judge it by the amount of pages.}}_{\text{/dʒʌdʒ‿ɪt‿baɪ‿ðə‿əˈmaʊnt‿əv‿ˈpeɪdʒɪz/}}
$$

> judge a book by its cover → 以貌取人（习语）
> judge it → /dʒʌdʒ‿ɪt/（连读）

### daily english dictation 093

$$
\underbrace{\text{I had it in spades on both sides}}_{\text{/aɪ‿hæd‿ɪt‿ɪn‿speɪdz‿ɑn‿boʊθ‿saɪdz/}}\text{, it came really natural to me.}
$$

> in spades → 无疑地/非常（习语，来自纸牌游戏中黑桃♠最大）
> on both sides → 从父母双方都遗传到

### daily english dictation 094

$$
\text{It takes a lot of work. You have to work every day on it.}
\text{And that's not a downside. There isn't a downside, really.}
$$

> downside → /ˈdaʊnsaɪd/（缺点；反义词 upside）
> lot of → /lɑt‿əv/

### daily english dictation 095

$$
\underbrace{\text{Oh, gee, I can't talk right now.}}_{\text{/oʊ‿dʒiː‿aɪ‿kænt‿tɔːk‿raɪt‿naʊ/}}
\text{Why don't you give me your home number and I'll call you later.}
\underbrace{\text{Oh, I guess you don't want people calling you at home?}}_{\text{/oʊ‿aɪ‿gɛs‿jə‿doʊnt‿wɑnt‿ˈpiːpəl‿ˈkɔːlɪŋ‿jə‿æt‿hoʊm/}}
\text{Well, now you know how I feel.}
$$

> gee → /dʒiː/（表惊讶的口头禅）
> can't → 升调（can 降调 can't 升调，重要区别）
> give me → gimme（口语缩约）

### daily english dictation 096

$$
\text{Hey, you got anything to eat?}
\text{Yeah, try these. I don't eat that kids' stuff. Just try them.}
$$

> stuff → /stʌf/（口语词，泛指"东西"，不可数）
> kids' stuff → 小孩子的东西

### daily english dictation 097

$$
\underbrace{\text{We were supposed to meet today}}_{\text{/wi‿wər‿səˈpoʊzd‿tə‿miːt‿təˈdeɪ/}}\text{, but I missed our appointment. Sorry.}
$$

> supposed to → /səˈpoʊzd‿tə/（-ed 读 /d/；to 弱读 /tə/）
> meet today → /miːt‿təˈdeɪ/（相同 t 合并→mee today）

### daily english dictation 098

$$
\text{The cheetah excels at acceleration.}
\underbrace{\text{It's the sports car of the savannah.}}_{\text{/ɪts‿ðə‿spɔrts‿kɑr‿əv‿ðə‿səˈvænə/}}
$$

> excels at → /ɪkˈsɛlz‿æt/（擅长）
> savannah → /səˈvænə/（热带稀树草原）

### daily english dictation 099

$$
\text{It is only the mediocre pupil who does not surpass his master, Leonardo writes.}
\text{And legend has it, that Verrocchio,}
\text{after seeing Leonardo's angel, never painted again.}
$$

> mediocre → /ˌmiːdiˈoʊkər/（平庸的）
> Verrocchio → /vɛˈroʊkioʊ/（韦罗基奥，达芬奇的老师）

### daily english dictation 100

$$
\underbrace{\text{Whether they're new to the world of paddling or a seasoned veteran,}}_{\text{/ˈwɛðər‿ðer‿nuː‿tə‿ðə‿wɜrld‿əv‿ˈpædlɪŋ‿ɔr‿ə‿ˈsiːzənd‿ˈvɛtərən/}}
\underbrace{\text{you're sure to find this video guidebook helpful}}_{\text{/jər‿ʃʊr‿tə‿faɪnd‿ðɪs‿ˈvɪdioʊ‿ˈgaɪdbʊk‿ˈhɛlpfəl/}}
\underbrace{\text{in your quest to find new and exciting rivers to explore.}}_{\text{/ɪn‿jər‿kwɛst‿tə‿faɪnd‿nuː‿ən‿ɪkˈsaɪtɪŋ‿ˈrɪvərz‿tə‿ɪkˈsplɔr/}}
$$

> Whether → /ˈwɛðər/（是否；引出并列选择）
> seasoned veteran → 经验丰富的老手
> quest → /kwɛst/（探索/追求）


## Daily Dictation 101-200

### daily english dictation 101

$$
\underbrace{\text{Why not be safe?}}_{\text{/waɪ‿nɑt‿bi‿seɪf/}}
\quad
\underbrace{\text{Why take a chance?}}_{\text{/waɪ‿teɪk‿ə‿tʃæns/}}
$$

> not be → /nɑt‿bi/（t 在 b 前 → held t，不做爆破）
> take a → /teɪk‿ə/（C+V 连读）
> chance → /tʃæns/（注意 ch = /tʃ/，不是 /tʃɑns/）

### daily english dictation 102

$$
\underbrace{\text{That's right!}}_{\text{/ðæts‿raɪt/}}
\underbrace{\text{This weekend is Earth Day.}}_{\text{/ðɪs‿ˈwiːkɛnd‿ɪz‿ɜrθ‿deɪ/}}
\text{Not your birthday...}
\underbrace{\text{don't get it twisted.}}_{\text{/doʊnt‿gɛt‿ɪt‿ˈtwɪstɪd/}}
\text{Earth Day!}
$$

> That's right → /ðæts‿raɪt/（ts 与 r 连读）
> don't get it → don'(t) ge(t) i(t) → 三个 t 都省音或 held
> get it twisted → 别搞错了（口语习语）
> your → /jɚ/（弱读，非重读位置）

### daily english dictation 103

$$
\text{If people }
\underbrace{\text{fail a test,}}_{\text{/feɪl‿ə‿tɛst/}}
\text{you can do two things;}
\underbrace{\text{you can make the people smarter}}_{\text{/jə‿kən‿meɪk‿ðə‿ˈpiːpəl‿ˈsmɑrtər/}}
\text{or you can }
\underbrace{\text{make the test easier.}}_{\text{/meɪk‿ðə‿tɛst‿ˈiːziər/}}
$$

> fail a → /feɪl‿ə/（C+V 连读）
> can → /kən/（弱读；非重读时元音变 schwa）
> make the → /meɪk‿ðə/（the 弱读 /ðə/）

### daily english dictation 104

$$
\text{Okay, ready? I'm ready. 1-1-6-8... Okay, you know what?}
\text{How about a little phone number rhythm, huh? You know?}
\text{A little bum-bum-pa, bum-pa, bum-pa. Got it? I got it.}
\text{Okay. 1... Yeah. 6... Yup. Teen...}
\underbrace{\text{I already dialed a 6.}}_{\text{/aɪ‿ɔlˈrɛdi‿daɪəld‿ə‿sɪks/}}
\underbrace{\text{I can't go back in time and slip a 1 in.}}_{\text{/aɪ‿kænt‿goʊ‿bæk‿ɪn‿taɪm‿ən‿slɪp‿ə‿wʌn‿ɪn/}}
$$

> want to → wanna（口语中常见）
> got it → /gɑt‿ɪt/（flap t，两元音间）
> go back in → /goʊ‿bæk‿ɪn/（C+V 连读）
> slip a 1 in → slip‿a‿1‿in（全连读）

### daily english dictation 105

$$
\text{Alright, what's your name?}
\underbrace{\text{I'm Karl Fuentes.}}_{\text{/aɪm‿kɑrl‿ˈfwɛnteɪs/}}
\text{Karl. Karl with a "K", correct?}
\text{Yep, }
\underbrace{\text{Karl with a "k".}}_{\text{/kɑrl‿wɪð‿ə‿keɪ/}}
\text{Karl with a "k".}
\underbrace{\text{A bird in the hand is worth...?}}_{\text{/ə‿bɜrd‿ɪn‿ðə‿hænd‿ɪz‿wɜrθ/}}
\text{A million? No.}
$$

> what's your → /wʌts‿jɚ/（your 弱读）
> with a → /wɪð‿ə/（C+V 连读）
> bird in the → /bɜrd‿ɪn‿ðə/（取消矩阵：d 在 th 前 → held；th 同时弱化）
> A bird in the hand is worth two in the bush → 谚语"双鸟在林不如一鸟在手"

### daily english dictation 106

$$
\underbrace{\text{One of his first trips will be to the US}}_{\text{/wʌn‿əv‿ɪz‿fɜrst‿trɪps‿wɪl‿bi‿tə‿ðə‿juː‿ɛs/}}
\text{for a NATO summit where he will announce}
\underbrace{\text{that he is pulling French troops out of Afghanistan}}_{\text{/ðət‿i‿ɪz‿ˈpʊlɪŋ‿frɛntʃ‿truːps‿aʊtəv‿æfˈgænɪstæn/}}
\underbrace{\text{by the end of the year.}}_{\text{/baɪ‿ði‿ɛnd‿əv‿ðə‿jɪr/}}
$$

> One of his → /wʌn‿əv‿ɪz/（h 省略，his → /ɪz/）
> to the → /tə‿ðə/（to 弱读 /tə/，the 弱读 /ðə/）
> out of → /aʊtəv/ → outta（of → /əv/，f 在辅音前弱化）
> pulling → /ˈpʊlɪŋ/（≠ pooling /ˈpuːlɪŋ/）
> end of the → /ɛnd‿əv‿ðə/（取消矩阵：d 在 th 前 held）

### daily english dictation 107

$$
\underbrace{\text{When you can't smoke,}}_{\text{/wɛn‿jə‿kænt‿smoʊk/}}
\text{if you stand and stare}
\underbrace{\text{out of the window on your own,}}_{\text{/aʊtə‿ðə‿ˈwɪndoʊ‿ɑn‿jər‿oʊn/}}
\text{you're an anti-social, friendless, idiot.}
\text{If you stand and stare}
\underbrace{\text{out of the window on your own with a cigarette,}}_{\text{/aʊtə‿ðə‿ˈwɪndoʊ‿ɑn‿jər‿oʊn‿wɪð‿ə‿sɪgəˈrɛt/}}
\underbrace{\text{you're a f*ck*ng philosopher.}}_{\text{/jər‿ə‿ˈfʌkɪŋ‿fɪˈlɑsəfər/}}
$$

> can't → /kænt/（升调提示否定；can 降调 can't 升调）
> out of the → outta the（of → /ə/，f 完全消失）
> your own → /jər‿oʊn/（your 弱读 /jər/）
> with a → /wɪð‿ə/（C+V 连读）
> philosopher → /fɪˈlɑsəfər/（重音在第二音节）

### daily english dictation 108

$$
\underbrace{\text{Gonna eat that?}}_{\text{/ˈgʌnə‿iːt‿ðæt/}}
\underbrace{\text{Have at it.}}_{\text{/hæv‿æt‿ɪt/}}
\underbrace{\text{Did you just ask my permission}}_{\text{/dɪdʒə‿dʒʌst‿æsk‿maɪ‿pərˈmɪʃən/}}
\underbrace{\text{before you took my food?}}_{\text{/bɪˈfɔr‿jə‿tʊk‿maɪ‿fuːd/}}
$$

> Gonna → /ˈgʌnə/（going to 的口语缩约）
> eat that → /iːt‿ðæt/（t 在 th 前 → held t）
> Have at it → 请便/尽管用（口语习语）
> Did you → /dɪdʒə/（d + y → /dʒ/ 同化）
> just → /dʒʌst/（t 在 p 前 → held t）

### daily english dictation 109

$$
\underbrace{\text{One of Switzerland's predominant cities,}}_{\text{/wʌn‿əv‿ˈswɪtsərləndz‿prɪˈdɑmɪnənt‿ˈsɪtiz/}}
\underbrace{\text{Basel sits on the Swiss border of France and Germany.}}_{\text{/ˈbɑːzəl‿sɪts‿ɑn‿ðə‿swɪs‿ˈbɔrdər‿əv‿fræns‿ən‿ˈdʒɜrməni/}}
$$

> One of → /wʌn‿əv/（C+V 连读）
> Switzerland's → /ˈswɪtsərləndz/（注意 -s 读 /z/）
> predominant → /prɪˈdɑmɪnənt/（重音在第二音节）
> sits on → /sɪts‿ɑn/（C+V 连读）
> border of → /ˈbɔrdər‿əv/（r 与 o 连读）
> and Germany → /ən‿ˈdʒɜrməni/（and 弱读 /ən/，d 完全省略）

### daily english dictation 110

$$
\underbrace{\text{Even from very early on}}_{\text{/ˈiːvən‿frəm‿ˈvɛri‿ˈɜrli‿ɑn/}}
\text{when we were just building this thing}
\underbrace{\text{for, for one school,}}_{\text{/fər‿fər‿wʌn‿skuːl/}}
\underbrace{\text{there was this concept of what it could turn into.}}_{\text{/ðər‿wəz‿ðɪs‿ˈkɑnsɛpt‿əv‿wʌt‿ɪt‿kəd‿tɜrn‿ˈɪntu/}}
\underbrace{\text{We just weren't sure then}}_{\text{/wi‿dʒʌst‿wɜrnt‿ʃʊr‿ðɛn/}}
\underbrace{\text{that we would be the ones who did it.}}_{\text{/ðət‿wi‿wʊd‿bi‿ðə‿wʌnz‿hu‿dɪd‿ɪt/}}
$$

> from very → /frəm‿ˈvɛri/（from 弱读 /frəm/）
> for one → /fər‿wʌn/（for 弱读 /fər/）
> concept of → /ˈkɑnsɛpt‿əv/（t 与 of 连读）
> turn into → /tɜrn‿ˈɪntu/（r 与 in 连读）
> weren't sure then → /wɜrnt‿ʃʊr‿ðɛn/（取消矩阵：t 在 th 前 held）

### daily english dictation 111

$$
\underbrace{\text{Keeping future resources intact}}_{\text{/ˈkiːpɪŋ‿ˈfjuːtʃər‿ˈriːsɔrsɪz‿ɪnˈtækt/}}
\underbrace{\text{means keeping present consumption in check.}}_{\text{/miːnz‿ˈkiːpɪŋ‿ˈprɛzənt‿kənˈsʌmpʃən‿ɪn‿tʃɛk/}}
\underbrace{\text{And that's why we promoted green ways of living and working.}}_{\text{/ən‿ðæts‿waɪ‿wi‿prəˈmoʊtɪd‿griːn‿weɪz‿əv‿ˈlɪvɪŋ‿ən‿ˈwɜrkɪŋ/}}
$$

> Keeping → /ˈkiːpɪŋ/（keep + ing）
> resources intact → /ˈriːsɔrsɪz‿ɪnˈtækt/（保持资源完好）
> consumption in check → 控制消费
> promoted → /prəˈmoʊtɪd/（-ed 读 /ɪd/，因为 t 结尾）
> ways of → /weɪz‿əv/（C+V 连读）
> and working → /ən‿ˈwɜrkɪŋ/（and 弱读 /ən/）

### daily english dictation 112

$$
\underbrace{\text{It is maddening — texting while walking.}}_{\text{/ɪt‿ɪz‿ˈmædənɪŋ‿ˈtɛkstɪŋ‿waɪl‿ˈwɔːkɪŋ/}}
\underbrace{\text{One town is saying it's time to level fines}}_{\text{/wʌn‿taʊn‿ɪz‿ˈseɪɪŋ‿ɪts‿taɪm‿tə‿ˈlɛvəl‿faɪnz/}}
\underbrace{\text{against people who walk into the streets heads down —}}_{\text{/əˈgɛnst‿ˈpiːpəl‿hu‿wɔːk‿ˈɪntə‿ðə‿striːts‿hɛdz‿daʊn/}}
\underbrace{\text{everybody else trying to dodge them!}}_{\text{/ˈɛvribɑdi‿ɛls‿ˈtraɪɪŋ‿tə‿dɑdʒ‿ðəm/}}
$$

> maddening → /ˈmædənɪŋ/（令人抓狂的）
> texting → /ˈtɛkstɪŋ/（发短信；-ing 形式）
> to level fines → /tə‿ˈlɛvəl‿faɪnz/（to 弱读 /tə/；处以罚款）
> walk into → /wɔːk‿ˈɪntə/（C+V 连读）
> heads down → /hɛdz‿daʊn/（低着头）
> trying to → /ˈtraɪɪŋ‿tə/（to 弱读 /tə/）
> them → /ðəm/（弱读，非 /ðɛm/）

### daily english dictation 113

$$
\underbrace{\text{Post-It Super Sticky Notes hold on stronger and longer,}}_{\text{/poʊst‿ɪt‿ˈsuːpər‿ˈstɪki‿noʊts‿hoʊld‿ɑn‿ˈstrɔŋgər‿ən‿ˈlɔŋgər/}}
\underbrace{\text{but of course, remove cleanly.}}_{\text{/bʌt‿əv‿kɔrs‿rɪˈmuːv‿ˈkliːnli/}}
$$

> Post-It → 便利贴品牌名
> hold on → /hoʊld‿ɑn/（C+V 连读）
> stronger and longer → /ˈstrɔŋgər‿ən‿ˈlɔŋgər/（and 弱读 /ən/）
> but of course → /bʌt‿əv‿kɔrs/（of 弱读 /əv/）
> remove cleanly → /rɪˈmuːv‿ˈkliːnli/（干净地移除）

### daily english dictation 114

$$
\underbrace{\text{When it comes to figuring out feats of strength,}}_{\text{/wɛn‿ɪt‿kʌmz‿tə‿ˈfɪgjərɪŋ‿aʊt‿fiːts‿əv‿strɛŋkθ/}}
\underbrace{\text{it is all in the fingers here.}}_{\text{/ɪt‿ɪz‿ɔːl‿ɪn‿ðə‿ˈfɪŋgərz‿hɪr/}}
$$

> When it comes to → 当说到…（固定句式）
> figuring out → /ˈfɪgjərɪŋ‿aʊt/（弄明白）
> feats of strength → 力量的壮举（feat = 功绩；≠ feet）
> strength → /strɛŋkθ/（注意 kθ 组合发音）
> fingers → /ˈfɪŋgərz/（g 在 n 后通常发音）

### daily english dictation 115

$$
\underbrace{\text{I think I could use some black coffee.}}_{\text{/aɪ‿θɪŋk‿aɪ‿kəd‿juːz‿səm‿blæk‿ˈkɔːfi/}}
\text{What size would you like?}
\text{Um, }
\underbrace{\text{I've got a lot to ponder, so I think a large.}}_{\text{/aɪv‿gɑt‿ə‿lɑt‿tə‿ˈpɑndər‿soʊ‿aɪ‿θɪŋk‿ə‿lɑrdʒ/}}
\underbrace{\text{I'm afraid we don't have large, sir.}}_{\text{/aɪm‿əˈfreɪd‿wi‿doʊnt‿hæv‿lɑrdʒ‿sɜr/}}
\text{We have piccolo, macho mucho and mucho macho.}
$$

> could use → /kəd‿juːz/（could 弱读 /kəd/；委婉表达"想要"）
> some → /səm/（弱读，非 /sʌm/）
> got a lot to → /gɑt‿ə‿lɑt‿tə/（t 在 l 前 held；to 弱读 /tə/）
> ponder → /ˈpɑndər/（思考/琢磨）
> don't have → /doʊnt‿hæv/（t 在 h 前 held）
> piccolo → 小杯（意大利语借词）
> macho mucho → 大杯（西班牙语风格，幽默用法）

### daily english dictation 116

$$
\text{Mowgli: }
\underbrace{\text{I don't trust anyone anymore.}}_{\text{/aɪ‿doʊnt‿trʌst‿ˈɛniwʌn‿ɛniˈmɔr/}}
\text{Kaa: }
\underbrace{\text{I don't blame you.}}_{\text{/aɪ‿doʊnt‿bleɪm‿jə/}}
\underbrace{\text{I'm not like those so called fair-weather friends of yours.}}_{\text{/aɪm‿nɑt‿laɪk‿ðoʊz‿soʊ‿kɔːld‿fɛrˈwɛðər‿frɛndz‿əv‿jɚz/}}
\underbrace{\text{You can believe in me.}}_{\text{/jə‿kən‿bɪˈliːv‿ɪn‿mi/}}
$$

> trust anyone → /trʌst‿ˈɛniwʌn/（C+V 连读）
> blame you → /bleɪm‿jə/（you 弱读 /jə/）
> fair-weather friends → 酒肉朋友（只在顺境时才出现的朋友）
> of yours → /əv‿jɚz/（your 弱读 /jɚ/）
> believe in → /bɪˈliːv‿ɪn/（C+V 连读）

### daily english dictation 117

$$
\text{Ted, I just wanted to ask you,}
\underbrace{\text{do you believe in an afterlife?}}_{\text{/də‿jə‿bɪˈliːv‿ɪn‿ən‿ˈæftərlaɪf/}}
\text{Do I what?}
\text{Do you believe in an afterlife?}
\text{Well, Dougal, generally speaking,}
\underbrace{\text{priests tend to have a very strong belief in the afterlife.}}_{\text{/priːsts‿tɛnd‿tə‿hæv‿ə‿ˈvɛri‿strɔŋ‿bɪˈliːf‿ɪn‿ði‿ˈæftərlaɪf/}}
\underbrace{\text{Boy, I wish I had your faith, Ted!}}_{\text{/bɔɪ‿aɪ‿wɪʃ‿aɪ‿hæd‿jɚ‿feɪθ‿tɛd/}}
$$

> wanted to → /ˈwɑnɪd‿tə/（-ed 读 /ɪd/；to 弱读 /tə/）
> do you → /də‿jə/（do 和 you 都弱读）
> believe in an → /bɪˈliːv‿ɪn‿ən/（全连读）
> priests → /priːsts/（注意 -sts 辅音丛）
> tend to → /tɛnd‿tə/（d + t → held the d, release the t？不，d 到位后直接接 /tə/）
> your faith → /jɚ‿feɪθ/（your 弱读 /jɚ/）
> 本段出自英剧《Father Ted》，是一部爱尔兰喜剧

### daily english dictation 118

$$
\underbrace{\text{These young mountain bikers}}_{\text{/ðiːz‿jʌŋ‿ˈmaʊntən‿ˈbaɪkərz/}}
\underbrace{\text{are spending their afternoon racing on the trails.}}_{\text{/ər‿ˈspɛndɪŋ‿ðər‿æftərˈnuːn‿ˈreɪsɪŋ‿ɑn‿ðə‿treɪlz/}}
$$

> These young → /ðiːz‿jʌŋ/（C+V 连读）
> mountain → /ˈmaʊntən/（t 在 n 前 → glottal t /ʔ/ 或 silent t）
> bikers → /ˈbaɪkərz/
> are spending → /ər‿ˈspɛndɪŋ/（are 弱读 /ər/）
> their afternoon → /ðər‿æftərˈnuːn/（their 弱读 /ðər/）

### daily english dictation 119

$$
\underbrace{\text{It's a rainy day today,}}_{\text{/ɪts‿ə‿ˈreɪni‿deɪ‿təˈdeɪ/}}
\text{so I think I might do something}
\underbrace{\text{that's been needing to be done for a while.}}_{\text{/ðæts‿bɪn‿ˈniːdɪŋ‿tə‿bi‿dʌn‿fər‿ə‿waɪl/}}
$$

> It's a → /ɪts‿ə/（C+V 连读）
> rainy day → /ˈreɪni‿deɪ/
> needing to → /ˈniːdɪŋ‿tə/（to 弱读 /tə/）
> for a while → /fər‿ə‿waɪl/（for 弱读 /fər/）

### daily english dictation 120

$$
\underbrace{\text{Well, I guess I should remind you,}}_{\text{/wɛl‿aɪ‿gɛs‿aɪ‿ʃəd‿rɪˈmaɪnd‿jə/}}
\underbrace{\text{if you're freaking out right now,}}_{\text{/ɪf‿jər‿ˈfriːkɪŋ‿aʊt‿raɪt‿naʊ/}}
\underbrace{\text{that this hasn't happened...yet.}}_{\text{/ðət‿ðɪs‿ˈhæzənt‿ˈhæpənd‿jɛt/}}
$$

> guess I → /gɛs‿aɪ/（C+V 连读）
> should remind you → /ʃəd‿rɪˈmaɪnd‿jə/（should 弱读 /ʃəd/；you 弱读 /jə/）
> freaking out → 吓坏了/崩溃了（口语）
> hasn't happened yet → /ˈhæzənt‿ˈhæpənd‿jɛt/（t 在 y 前 → 几乎成 /tʃ/ 的同化）
### daily english dictation 121

$$
\text{Hey! Hey, }
\underbrace{\text{how come you're wearing a hat?}}_{\text{/haʊ‿kʌm‿jər‿ˈwɛrɪŋ‿ə‿hæt/}}
\text{I gotta haircut. Oh yeah?}
\underbrace{\text{Can I see it?}}_{\text{/kən‿aɪ‿siː‿ɪt/}}
\text{Eh, }
\underbrace{\text{there's nothing to see.}}_{\text{/ðɛrz‿ˈnʌθɪŋ‿tə‿siː/}}
\text{Come on! Let me see it.}
\underbrace{\text{Forget it!}}_{\text{/fərˈgɛt‿ɪt/}}
\text{Come on! All right...}
$$

> how come → /haʊ‿kʌm/（为什么，口语）
> gotta → /ˈgɑtə/（got to 的口语缩约）
> Can I → /kən‿aɪ/（can 弱读 /kən/）
> nothing to → /ˈnʌθɪŋ‿tə/（to 弱读 /tə/）
> Forget it → /fərˈgɛt‿ɪt/（算了吧）

### daily english dictation 122

$$
\underbrace{\text{The Amazon forest, which blankets 40\% of Brazil's territory,}}_{\text{/ði‿ˈæməzɑn‿ˈfɔrɪst‿wɪtʃ‿ˈblæŋkɪts‿ˈfɔrti‿pərˈsɛnt‿əv‿brəˈzɪlz‿ˈtɛrɪtɔri/}}
\underbrace{\text{is the home to more than 1800 species of birds}}_{\text{/ɪz‿ðə‿hoʊm‿tə‿mɔr‿ðən‿ˈeɪtiːn‿ˈhʌndrəd‿ˈspiːʃiːz‿əv‿bɜrdz/}}
\underbrace{\text{and several hundred species of mammals.}}_{\text{/ən‿ˈsɛvərəl‿ˈhʌndrəd‿ˈspiːʃiːz‿əv‿ˈmæməlz/}}
\underbrace{\text{And more than 1500 species of aquatic creatures}}_{\text{/ən‿mɔr‿ðən‿ˈfɪftiːn‿ˈhʌndrəd‿ˈspiːʃiːz‿əv‿əˈkwætɪk‿ˈkriːtʃərz/}}
\underbrace{\text{inhabit its countless miles of waterways.}}_{\text{/ɪnˈhæbɪt‿ɪts‿ˈkaʊntləs‿maɪlz‿əv‿ˈwɔtərweɪz/}}
$$

> Amazon → /ˈæməzɑn/（亚马逊）
> blankets → /ˈblæŋkɪts/（覆盖；动词）
> 40\% → 注意 LaTeX 中 \% 写法
> home to → 是…的家园/栖息地
> species of → /ˈspiːʃiːz‿əv/（C+V 连读）
> aquatic → /əˈkwætɪk/（水生的）
> countless → /ˈkaʊntləs/（无数的）

### daily english dictation 123

$$
\underbrace{\text{Usually we just hang out, you know,}}_{\text{/ˈjuːʒuəli‿wi‿dʒʌst‿hæŋ‿aʊt‿jə‿noʊ/}}
\underbrace{\text{maybe we'll go for a family hike or something.}}_{\text{/ˈmeɪbi‿wɪl‿goʊ‿fər‿ə‿ˈfæməli‿haɪk‿ɔr‿ˈsʌmθɪŋ/}}
\underbrace{\text{I don't know where, you know...}}_{\text{/aɪ‿doʊnt‿noʊ‿wɛr‿jə‿noʊ/}}
\underbrace{\text{we'll be in Iceland that day so we'll see what that does.}}_{\text{/wɪl‿bi‿ɪn‿ˈaɪslənd‿ðæt‿deɪ‿soʊ‿wɪl‿siː‿wʌt‿ðæt‿dʌz/}}
\underbrace{\text{We're gonna kick back on Sunday,}}_{\text{/wɪr‿ˈgʌnə‿kɪk‿bæk‿ɑn‿ˈsʌndeɪ/}}
\underbrace{\text{so I don't know what the plans are.}}_{\text{/soʊ‿aɪ‿doʊnt‿noʊ‿wʌt‿ðə‿plænz‿ɑr/}}
$$

> Usually → /ˈjuːʒuəli/（通常）
> hang out → /hæŋ‿aʊt/（闲逛）
> gonna → /ˈgʌnə/（going to 口语缩约）
> kick back → 放松/休息（口语）
> what the → /wʌt‿ðə/（the 弱读 /ðə/；t 在 th 前 → held t）

### daily english dictation 124

$$
\underbrace{\text{He was about 600 pounds at that point — 640 or so pounds.}}_{\text{/hi‿wəz‿əˈbaʊt‿sɪks‿ˈhʌndrəd‿paʊndz‿æt‿ðæt‿pɔɪnt/}}
\underbrace{\text{He got down to about 480 at one point.}}_{\text{/hi‿gɑt‿daʊn‿tə‿əˈbaʊt‿fɔr‿ˈeɪti‿æt‿wʌn‿pɔɪnt/}}
\underbrace{\text{And, um, he died at 1000 pounds.}}_{\text{/ən‿ʌm‿hi‿daɪd‿æt‿wʌn‿ˈθaʊzənd‿paʊndz/}}
$$

> about 600 → /əˈbaʊt‿sɪks‿ˈhʌndrəd/（t 在 s 前 → held t）
> at that point → /æt‿ðæt‿pɔɪnt/（t 在 th 前 held；那时）
> got down to → /gɑt‿daʊn‿tə/（减到；to 弱读 /tə/）
> died at → /daɪd‿æt/（C+V 连读）

### daily english dictation 125

$$
\underbrace{\text{Pre blessed food!}}_{\text{/priː‿blɛst‿fuːd/}}
\underbrace{\text{We pray for is so you don't have to!}}_{\text{/wi‿preɪ‿fər‿ɪz‿soʊ‿jə‿doʊnt‿hæf‿tə/}}
$$

> Pre blessed → 预先被祝福的（pre- 前缀）
> pray for → /preɪ‿fər/（for 弱读 /fər/）
> don't have to → /doʊnt‿hæf‿tə/（have to → hafta；v 清化为 f；to 弱读）
> 这是幽默广告语：食物已经被我们祈祷过了，你就不用祈祷了

### daily english dictation 126

$$
\underbrace{\text{A 68-year-old grandmother taunted by four children on a school bus —}}_{\text{/ə‿ˈsɪksti‿eɪt‿jɪr‿oʊld‿ˈgrændmʌðər‿ˈtɔːntɪd‿baɪ‿fɔr‿ˈtʃɪldrən‿ɑn‿ə‿skuːl‿bʌs/}}
\underbrace{\text{all of it caught on tape.}}_{\text{/ɔːl‿əv‿ɪt‿kɔːt‿ɑn‿teɪp/}}
$$

> 68-year-old → /ˈsɪksti‿eɪt‿jɪr‿oʊld/
> grandmother → /ˈgrændmʌðər/（注意 d 在 m 前 → held）
> taunted → /ˈtɔːntɪd/（嘲笑/奚落）
> children on a → /ˈtʃɪldrən‿ɑn‿ə/（C+V 全连读）
> caught on tape → /kɔːt‿ɑn‿teɪp/（被录下来了）

### daily english dictation 127

$$
\underbrace{\text{Tesla says the price ranges from just under 50,000}}_{\text{/ˈtɛslə‿sɛz‿ðə‿praɪs‿ˈreɪndʒɪz‿frəm‿dʒʌst‿ˈʌndər‿ˈfɪfti‿ˈθaʊzənd/}}
\underbrace{\text{to about \$100,000 depending on the battery size and options you choose.}}_{\text{/tə‿əˈbaʊt‿wʌn‿ˈhʌndrəd‿ˈθaʊzənd‿dɪˈpɛndɪŋ‿ɑn‿ðə‿ˈbætəri‿saɪz‿ən‿ˈɑpʃənz‿jə‿tʃuːz/}}
$$

> ranges from → /ˈreɪndʒɪz‿frəm/（from 弱读 /frəm/）
> just under → /dʒʌst‿ˈʌndər/（t 在元音前 → flap t /ɾ/）
> to about → /tə‿əˈbaʊt/（to 弱读 /tə/）
> depending on → /dɪˈpɛndɪŋ‿ɑn/（取决于）
> options → /ˈɑpʃənz/

### daily english dictation 128

$$
\underbrace{\text{One curious, 9-year old girl wrote McDonald's with that burning question.}}_{\text{/wʌn‿ˈkjʊriəs‿naɪn‿jɪr‿oʊld‿gɜrl‿roʊt‿məkˈdɑnəldz‿wɪð‿ðæt‿ˈbɜrnɪŋ‿ˈkwɛstʃən/}}
\underbrace{\text{"Why does your food look different in the advertising}}_{\text{/waɪ‿dəz‿jɚ‿fuːd‿lʊk‿ˈdɪfərənt‿ɪn‿ði‿ˈædvərtaɪzɪŋ/}}
\underbrace{\text{than what's in the store?"}}_{\text{/ðæn‿wʌts‿ɪn‿ðə‿stɔr/}}
$$

> curious → /ˈkjʊriəs/（好奇的）
> McDonald's → /məkˈdɑnəldz/
> burning question → 迫切的问题
> does your → /dəz‿jɚ/（your 弱读 /jɚ/）
> different in the → /ˈdɪfərənt‿ɪn‿ðə/（取消矩阵：t 在 th 前 held）
> than what's → /ðæn‿wʌts/

### daily english dictation 129

$$
\underbrace{\text{Respecting the dignity of a human being}}_{\text{/rɪˈspɛktɪŋ‿ðə‿ˈdɪgnɪti‿əv‿ə‿ˈhjuːmən‿ˈbiːɪŋ/}}
\underbrace{\text{is giving that person the freedom to choose.}}_{\text{/ɪz‿ˈgɪvɪŋ‿ðæt‿ˈpɜrsən‿ðə‿ˈfriːdəm‿tə‿tʃuːz/}}
$$

> Respecting → /rɪˈspɛktɪŋ/
> dignity → /ˈdɪgnɪti/（尊严）
> of a → /əv‿ə/（C+V 连读）
> human being → /ˈhjuːmən‿ˈbiːɪŋ/
> freedom to → /ˈfriːdəm‿tə/（to 弱读 /tə/）

### daily english dictation 130

$$
\underbrace{\text{Spain's talented midfielders}}_{\text{/speɪnz‿ˈtæləntɪd‿ˈmɪdfiːldərz/}}
\underbrace{\text{utilized their quick-touch passing strategy,}}_{\text{/ˈjuːtɪlaɪzd‿ðər‿kwɪk‿tʌtʃ‿ˈpæsɪŋ‿ˈstrætədʒi/}}
\underbrace{\text{known back home as "tiki toka",}}_{\text{/noʊn‿bæk‿hoʊm‿æz‿ˈtiːki‿ˈtoʊkə/}}
\underbrace{\text{to contribute to all 4 goals.}}_{\text{/tə‿kənˈtrɪbjuːt‿tə‿ɔːl‿fɔr‿goʊlz/}}
$$

> Spain's → /speɪnz/（注意 -s 读 /z/）
> talented → /ˈtæləntɪd/（-ed 读 /ɪd/）
> utilized → /ˈjuːtɪlaɪzd/（利用）
> quick-touch → 快速触球（足球术语）
> tiki toka → tiki-taka（西班牙足球的短传渗透风格）
> contribute to → /kənˈtrɪbjuːt‿tə/（to 弱读 /tə/）

### daily english dictation 131

$$
\text{There. See?}
\underbrace{\text{Piece of cake.}}_{\text{/piːs‿əv‿keɪk/}}
\underbrace{\text{How's everybody doing back there?}}_{\text{/haʊz‿ˈɛvribɑdi‿ˈduːɪŋ‿bæk‿ðɛr/}}
\text{PJ keeps poking me with his rib.}
\underbrace{\text{It's called breathing.}}_{\text{/ɪts‿kɔːld‿ˈbriːðɪŋ/}}
\text{Honey, Gabe doesn't have a seatbelt. Or a seat.}
\text{He'll be fine.}
\text{Hey, Charlie, are you comfortable? No.}
\text{Bob? Yes? New car? New car.}
$$

> Piece of cake → /piːs‿əv‿keɪk/（易如反掌；cake 变 /keɪk/）
> How's everybody → /haʊz‿ˈɛvribɑdi/
> poking me → /ˈpoʊkɪŋ‿mi/（戳我）
> It's called → /ɪts‿kɔːld/（这叫…）
> breathing → /ˈbriːðɪŋ/（呼吸；th 读 /ð/）
> doesn't have a → /ˈdʌzənt‿hæv‿ə/（t 在 h 前 held；h 省略则变 /ˈdʌzən‿æv‿ə/）

### daily english dictation 132

$$
\underbrace{\text{To spank or not to spank?}}_{\text{/tə‿spæŋk‿ɔr‿nɑt‿tə‿spæŋk/}}
\underbrace{\text{It's a controversy that creates a huge divide among parents.}}_{\text{/ɪts‿ə‿ˈkɑntrəvɜrsi‿ðət‿kriˈeɪts‿ə‿hjuːdʒ‿dɪˈvaɪd‿əˈmʌŋ‿ˈpɛrənts/}}
$$

> To spank → /tə‿spæŋk/（to 弱读 /tə/；打屁股）
> controversy → /ˈkɑntrəvɜrsi/（争议）
> creates a → /kriˈeɪts‿ə/（C+V 连读）
> huge divide → /hjuːdʒ‿dɪˈvaɪd/（巨大分歧）
> among → /əˈmʌŋ/（在…之中）

### daily english dictation 133

$$
\underbrace{\text{If you're a sufferer of fear of the number 13,}}_{\text{/ɪf‿jər‿ə‿ˈsʌfərər‿əv‿fɪr‿əv‿ðə‿ˈnʌmbər‿θɜrˈtiːn/}}
\underbrace{\text{you may find yourself going out of your way}}_{\text{/jə‿meɪ‿faɪnd‿jərˈsɛlf‿ˈgoʊɪŋ‿aʊtə‿jər‿weɪ/}}
\underbrace{\text{to be extra careful on Friday the 13th!}}_{\text{/tə‿bi‿ˈɛkstrə‿ˈkɛrfəl‿ɑn‿ˈfraɪdeɪ‿ðə‿θɜrˈtiːnθ/}}
$$

> sufferer → /ˈsʌfərər/（患者/承受者）
> fear of → /fɪr‿əv/（C+V 连读）
> out of your way → /aʊtə‿jər‿weɪ/（of → /ə/；故意/格外）
> extra careful → /ˈɛkstrə‿ˈkɛrfəl/
> Friday the 13th → 13号星期五（西方不吉利日）
> 13th → /θɜrˈtiːnθ/

### daily english dictation 134

$$
\underbrace{\text{Roy is the type of a friend you never introduce to your other friends}}_{\text{/rɔɪ‿ɪz‿ðə‿taɪp‿əv‿ə‿frɛnd‿jə‿ˈnɛvər‿ɪntrəˈduːs‿tə‿jər‿ˈʌðər‿frɛndz/}}
\underbrace{\text{or bring in to your family.}}_{\text{/ɔr‿brɪŋ‿ɪn‿tə‿jər‿ˈfæməli/}}
\text{He is... look at his eyes — brown — full of shit!}
\underbrace{\text{Always... just bullshit all the time!}}_{\text{/ˈɔːlweɪz‿dʒʌst‿ˈbʊlʃɪt‿ɔːl‿ðə‿taɪm/}}
$$

> type of a → /taɪp‿əv‿ə/（C+V 连读）
> introduce to → /ɪntrəˈduːs‿tə/（to 弱读 /tə/）
> bring in to → /brɪŋ‿ɪn‿tə/（带到…里）
> look at his → /lʊk‿æt‿ɪz/（h 省略，his → /ɪz/）
> full of shit → 满嘴跑火车（粗俗口语）
> bullshit → /ˈbʊlʃɪt/（胡说八道）

### daily english dictation 135

$$
\underbrace{\text{Again, rumbles of thunder,}}_{\text{/əˈgɛn‿ˈrʌmbəlz‿əv‿ˈθʌndər/}}
\underbrace{\text{we've got the dangerous cloud-to-ground lightning,}}_{\text{/wiv‿gɑt‿ðə‿ˈdeɪndʒərəs‿klaʊd‿tə‿graʊnd‿ˈlaɪtnɪŋ/}}
\underbrace{\text{brief heavy rain, gusty winds and even the chance of some hail.}}_{\text{/briːf‿ˈhɛvi‿reɪn‿ˈgʌsti‿wɪndz‿ən‿ˈiːvən‿ðə‿tʃæns‿əv‿sʌm‿heɪl/}}
$$

> rumbles of thunder → /ˈrʌmbəlz‿əv‿ˈθʌndər/（雷声隆隆）
> we've got → /wiv‿gɑt/（we have got 的缩约）
> cloud-to-ground lightning → 云对地闪电
> gusty winds → /ˈgʌsti‿wɪndz/（阵风）
> chance of → /tʃæns‿əv/（C+V 连读）
> hail → /heɪl/（冰雹）

### daily english dictation 136

$$
\underbrace{\text{Irish coffee — It's the only drink in the world}}_{\text{/ˈaɪrɪʃ‿ˈkɔːfi‿ɪts‿ði‿ˈoʊnli‿drɪŋk‿ɪn‿ðə‿wɜrld/}}
\underbrace{\text{that provides in a single glass all four essential food groups:}}_{\text{/ðət‿prəˈvaɪdz‿ɪn‿ə‿ˈsɪŋgəl‿glæs‿ɔːl‿fɔr‿ɪˈsɛnʃəl‿fuːd‿gruːps/}}
\underbrace{\text{alcohol, caffeine, sugar and fat.}}_{\text{/ˈælkəhɔːl‿kæˈfiːn‿ˈʃʊgər‿ən‿fæt/}}
$$

> Irish coffee → 爱尔兰咖啡（含威士忌+咖啡+奶油）
> only drink → /ˈoʊnli‿drɪŋk/
> provides in a → /prəˈvaɪdz‿ɪn‿ə/（C+V 连读）
> essential → /ɪˈsɛnʃəl/（必要的/基本的）
> food groups → /fuːd‿gruːps/
> and fat → /ən‿fæt/（and 弱读 /ən/）

### daily english dictation 137

$$
\underbrace{\text{If you were to wrap up everything — all your concepts — into one idea,}}_{\text{/ɪf‿jə‿wər‿tə‿ræp‿ʌp‿ˈɛvriθɪŋ‿ɔːl‿jɚ‿ˈkɑnsɛpts‿ˈɪntə‿wʌn‿aɪˈdiːə/}}
\underbrace{\text{what would that be?}}_{\text{/wʌt‿wʊd‿ðæt‿bi/}}
\underbrace{\text{Educate and obey your conscience.}}_{\text{/ˈɛdʒəkeɪt‿ən‿oʊˈbeɪ‿jɚ‿ˈkɑnʃəns/}}
$$

> wrap up → /ræp‿ʌp/（总结/打包）
> into one → /ˈɪntə‿wʌn/（C+V 连读）
> would that → /wʊd‿ðæt/（d 在 th 前 → held d）
> Educate and obey → /ˈɛdʒəkeɪt‿ən‿oʊˈbeɪ/（and 弱读 /ən/）
> conscience → /ˈkɑnʃəns/（良心）

### daily english dictation 138

$$
\text{Why are you laughing? Come on, tell me}
\underbrace{\text{what have I done?}}_{\text{/wʌt‿hæv‿aɪ‿dʌn/}}
\text{No. I like your accent.}
\underbrace{\text{Can you do an English accent?}}_{\text{/kən‿jə‿du‿ən‿ˈɪŋglɪʃ‿ˈæksɛnt/}}
\underbrace{\text{A nice, beautiful interview.}}_{\text{/ə‿naɪs‿ˈbjuːtɪfəl‿ˈɪntərvjuː/}}
$$

> Why are you → /waɪ‿ər‿jə/（are 和 you 都弱读）
> what have I → /wʌt‿hæv‿aɪ/（C+V 连读）
> Can you → /kən‿jə/（can 和 you 都弱读）
> an English → /ən‿ˈɪŋglɪʃ/（C+V 连读）
> accent → /ˈæksɛnt/（口音）
> interview → /ˈɪntərvjuː/

### daily english dictation 139

$$
\underbrace{\text{Gun sales in Colorado have surged.}}_{\text{/gʌn‿seɪlz‿ɪn‿kɑləˈrædoʊ‿hæv‿sɜrdʒd/}}
$$

> Gun sales → /gʌn‿seɪlz/（枪支销售）
> Colorado → /kɑləˈrædoʊ/
> have surged → /hæv‿sɜrdʒd/（激增；-ed 读 /d/，因 dʒ 是浊辅音）
> surged → /sɜrdʒd/（注意 dʒd 辅音丛）

### daily english dictation 140

$$
\underbrace{\text{There we are.}}_{\text{/ðɛr‿wi‿ɑr/}}
\underbrace{\text{Disaster averted.}}_{\text{/dɪˈzæstər‿əˈvɜrtɪd/}}
\text{Thank you.}
\underbrace{\text{You got a bit more TV there than you were expecting.}}_{\text{/jə‿gɑt‿ə‿bɪt‿mɔr‿tiː‿viː‿ðɛr‿ðən‿jə‿wər‿ɪkˈspɛktɪŋ/}}
$$

> There we are → /ðɛr‿wi‿ɑr/（好了/就这样）
> Disaster averted → /dɪˈzæstər‿əˈvɜrtɪd/（灾难避免了；-ed 读 /ɪd/）
> got a → /gɑt‿ə/（flap t → /ɾ/）
> bit more → /bɪt‿mɔr/（t 在 m 前 → held t）
> than you were → /ðən‿jə‿wər/（than 弱读 /ðən/；you 弱读 /jə/；were 弱读 /wər/）
### daily english dictation 141

$$
\underbrace{\text{It sort of turned from just a simple idea into what's now a phenomenon.}}_{\text{/ɪt‿sɔrt‿əv‿tɜrnd‿frəm‿dʒʌst‿ə‿ˈsɪmpəl‿aɪˈdiːə‿ˈɪntə‿wʌts‿naʊ‿ə‿fɪˈnɑmɪnən/}}
\underbrace{\text{And we kind of think that it's gonna spread around the country.}}_{\text{/ən‿wi‿kaɪnd‿əv‿θɪŋk‿ðət‿ɪts‿ˈgʌnə‿sprɛd‿əˈraʊnd‿ðə‿ˈkʌntri/}}
\text{Good, bad or otherwise!}
$$

> sort of → /sɔrt‿əv/ → sorta（口语缩约）
> turned from → /tɜrnd‿frəm/（from 弱读 /frəm/）
> kind of → /kaɪnd‿əv/ → kinda（口语缩约）
> gonna → /ˈgʌnə/（going to）
> spread around → /sprɛd‿əˈraʊnd/
> phenomenon → /fɪˈnɑmɪnən/

### daily english dictation 142

$$
\underbrace{\text{I want short back and sides.}}_{\text{/aɪ‿wɑnt‿ʃɔrt‿bæk‿ən‿saɪdz/}}
\underbrace{\text{But nothing off the top.}}_{\text{/bʌt‿ˈnʌθɪŋ‿ɔːf‿ðə‿tɑp/}}
\underbrace{\text{Whatever you do, don't touch the top.}}_{\text{/wʌtˈɛvər‿jə‿du‿doʊnt‿tʌtʃ‿ðə‿tɑp/}}
\underbrace{\text{And make it snappy.}}_{\text{/ən‿meɪk‿ɪt‿ˈsnæpi/}}
\underbrace{\text{I have a plane to catch.}}_{\text{/aɪ‿hæv‿ə‿pleɪn‿tə‿kætʃ/}}
$$

> short back and sides → 理发用语：两边和后脑勺剪短
> nothing off the top → 头顶不要剪
> make it snappy → 快点（口语）
> plane to catch → /pleɪn‿tə‿kætʃ/（赶飞机；to 弱读 /tə/）

### daily english dictation 143

$$
\underbrace{\text{What speed are you going on the motorway?}}_{\text{/wʌt‿spiːd‿ər‿jə‿ˈgoʊɪŋ‿ɑn‿ðə‿ˈmoʊtərweɪ/}}
\underbrace{\text{I'm going 75 miles an hour.}}_{\text{/aɪm‿ˈgoʊɪŋ‿ˈsɛvənti‿faɪv‿maɪlz‿ən‿aʊr/}}
$$

> What speed are you → /wʌt‿spiːd‿ər‿jə/（are 和 you 都弱读）
> motorway → /ˈmoʊtərweɪ/（英式：高速公路）
> miles an hour → /maɪlz‿ən‿aʊr/（an → /ən/ 弱读）

### daily english dictation 144

$$
\underbrace{\text{High inside the Arctic Circle in one of the most unforgiving environments on the planet}}_{\text{/haɪ‿ɪnˈsaɪd‿ði‿ˈɑrktɪk‿ˈsɜrkəl‿ɪn‿wʌn‿əv‿ðə‿moʊst‿ʌnfərˈgɪvɪŋ‿ɪnˈvaɪrənmənts‿ɑn‿ðə‿ˈplænɪt/}}
\underbrace{\text{two teams of paleontologists investigate a 70-million-year-old mystery.}}_{\text{/tuː‿tiːmz‿əv‿ˌpeɪliɑnˈtɑlədʒɪsts‿ɪnˈvɛstɪgeɪt‿ə‿ˈsɛvənti‿ˈmɪljən‿jɪr‿oʊld‿ˈmɪstəri/}}
\underbrace{\text{They've unearthed dozens of dinosaurs.}}_{\text{/ðeɪv‿ʌnˈɜrθt‿ˈdʌzənz‿əv‿ˈdaɪnəsɔrz/}}
$$

> Arctic Circle → /ˈɑrktɪk‿ˈsɜrkəl/（北极圈）
> unforgiving → /ʌnfərˈgɪvɪŋ/（无情的/恶劣的）
> paleontologists → /ˌpeɪliɑnˈtɑlədʒɪsts/（古生物学家）
> unearthed → /ʌnˈɜrθt/（发掘出土）
> dozens of → /ˈdʌzənz‿əv/

### daily english dictation 145

$$
\text{George: }
\underbrace{\text{I snapped. It was the last straw.}}_{\text{/aɪ‿snæpt‿ɪt‿wəz‿ðə‿læst‿strɔː/}}
\text{Jerry: }
\underbrace{\text{So, what are you gonna do now?}}_{\text{/soʊ‿wʌt‿ər‿jə‿ˈgʌnə‿du‿naʊ/}}
\underbrace{\text{You gonna look for something else in real estate?}}_{\text{/jə‿ˈgʌnə‿lʊk‿fər‿ˈsʌmθɪŋ‿ɛls‿ɪn‿riːl‿ɪˈsteɪt/}}
\text{George: }
\underbrace{\text{Nobody's hiring now. The market's terrible.}}_{\text{/ˈnoʊbɑdiz‿ˈhaɪərɪŋ‿naʊ‿ðə‿ˈmɑrkɪts‿ˈtɛrɪbəl/}}
$$

> I snapped → /aɪ‿snæpt/（我爆发了/失控了）
> the last straw → /ðə‿læst‿strɔː/（最后一根稻草；习语）
> what are you → /wʌt‿ər‿jə/（are 和 you 都弱读）
> gonna → /ˈgʌnə/
> look for → /lʊk‿fər/（for 弱读 /fər/）
> real estate → /riːl‿ɪˈsteɪt/（房地产）

### daily english dictation 146

$$
\underbrace{\text{Edmonton's a surprisingly diverse city —}}_{\text{/ˈɛdməntənz‿ə‿sərˈpraɪzɪŋli‿daɪˈvɜrs‿ˈsɪti/}}
\underbrace{\text{nearly one in five people here were born in another country.}}_{\text{/ˈnɪrli‿wʌn‿ɪn‿faɪv‿ˈpiːpəl‿hɪr‿wər‿bɔrn‿ɪn‿əˈnʌðər‿ˈkʌntri/}}
$$

> Edmonton's a → /ˈɛdməntənz‿ə/（Edmonton is 的缩约）
> surprisingly → /sərˈpraɪzɪŋli/（令人惊讶地）
> diverse → /daɪˈvɜrs/（多元的）
> one in five → /wʌn‿ɪn‿faɪv/（五分之一）
> were born → /wər‿bɔrn/（were 弱读 /wər/）

### daily english dictation 147

$$
\underbrace{\text{They're satisfyingly crunchy, chocolatey sweet, and gooeylicious!}}_{\text{/ðɛr‿ˈsætɪsfaɪɪŋli‿ˈkrʌntʃi‿ˈtʃɑklɪti‿swiːt‿ən‿guːiˈlɪʃəs/}}
$$

> satisfyingly → /ˈsætɪsfaɪɪŋli/（令人满足地）
> crunchy → /ˈkrʌntʃi/（嘎吱脆的）
> chocolatey → /ˈtʃɑklɪti/（巧克力味的）
> gooeylicious → /guːiˈlɪʃəs/（造词：gooey + delicious = 粘粘的好吃）

### daily english dictation 148

$$
\underbrace{\text{It shouldn't take too long.}}_{\text{/ɪt‿ˈʃʊdənt‿teɪk‿tuː‿lɔŋ/}}
\underbrace{\text{I'd say maybe oh... 4 hours.}}_{\text{/aɪd‿seɪ‿ˈmeɪbi‿oʊ‿fɔr‿aʊərz/}}
\underbrace{\text{Really, though, Jerry, there's not that much.}}_{\text{/ˈrɪəli‿ðoʊ‿ˈdʒɛri‿ðɛrz‿nɑt‿ðæt‿mʌtʃ/}}
$$

> shouldn't → /ˈʃʊdənt/（should not 缩约；d 在 n 前 silent）
> take too long → /teɪk‿tuː‿lɔŋ/（花太长时间）
> I'd say → /aɪd‿seɪ/（I would say 缩约）
> there's not that much → /ðɛrz‿nɑt‿ðæt‿mʌtʃ/（没那么多）

### daily english dictation 149

$$
\underbrace{\text{It's time to get your weekend back and turn your "To Do" list into a "To Done" list.}}_{\text{/ɪts‿taɪm‿tə‿gɛt‿jɚ‿ˈwiːkɛnd‿bæk‿ən‿tɜrn‿jɚ‿tə‿du‿lɪst‿ˈɪntə‿ə‿tə‿dʌn‿lɪst/}}
\underbrace{\text{Ace, the helpful place.}}_{\text{/eɪs‿ðə‿ˈhɛlpfəl‿pleɪs/}}
$$

> get your → /gɛt‿jɚ/（your 弱读 /jɚ/）
> and turn → /ən‿tɜrn/（and 弱读 /ən/）
> To Do → To Done（文字游戏）
> Ace → /eɪs/（王牌；Ace Hardware 是五金零售品牌）

### daily english dictation 150

$$
\underbrace{\text{People say that the word "orange" doesn't rhyme with anything.}}_{\text{/ˈpiːpəl‿seɪ‿ðət‿ðə‿wɜrd‿ˈɔrɪndʒ‿ˈdʌzənt‿raɪm‿wɪð‿ˈɛniθɪŋ/}}
\underbrace{\text{I can think of a lot of things that rhyme with "orange".}}_{\text{/aɪ‿kən‿θɪŋk‿əv‿ə‿lɑt‿əv‿θɪŋz‿ðət‿raɪm‿wɪð‿ˈɔrɪndʒ/}}
\text{What rhymes with orange?}
\underbrace{\text{I put my orange 4-inch door hinge in storage and ate porridge with George!}}_{\text{/aɪ‿pʊt‿maɪ‿ˈɔrɪndʒ‿fɔr‿ɪntʃ‿dɔr‿hɪndʒ‿ɪn‿ˈstɔrɪdʒ‿ən‿eɪt‿ˈpɔrɪdʒ‿wɪð‿dʒɔrdʒ/}}
$$

> doesn't rhyme with → /ˈdʌzənt‿raɪm‿wɪð/（和…不押韵）
> think of a → /θɪŋk‿əv‿ə/（C+V 连读）
> lot of → /lɑt‿əv/
> door hinge → /dɔr‿hɪndʒ/（门铰链）
> porridge → /ˈpɔrɪdʒ/（粥）
> orange / door hinge / storage / porridge / George → 幽默地展示伪押韵

### daily english dictation 151

$$
\underbrace{\text{What if every single person on earth jumped at the exact same time?}}_{\text{/wʌt‿ɪf‿ˈɛvri‿ˈsɪŋgəl‿ˈpɜrsən‿ɑn‿ɜrθ‿dʒʌmpt‿æt‿ði‿ɪgˈzækt‿seɪm‿taɪm/}}
\underbrace{\text{Could it cause an earthquake or would we not even be able to tell?}}_{\text{/kʊd‿ɪt‿kɔːz‿ən‿ˈɜrθkweɪk‿ɔr‿wʊd‿wi‿nɑt‿ˈiːvən‿bi‿ˈeɪbəl‿tə‿tɛl/}}
$$

> What if → /wʌt‿ɪf/（如果…会怎样）
> every single → /ˈɛvri‿ˈsɪŋgəl/
> jumped at the → /dʒʌmpt‿æt‿ðə/（jumped 的 -ed 读 /t/；t 在 th 前 held）
> cause an → /kɔːz‿ən/（C+V 连读）
> be able to → /bi‿ˈeɪbəl‿tə/（to 弱读 /tə/）

### daily english dictation 152

$$
\underbrace{\text{A search party of seven — mostly strangers — headed out.}}_{\text{/ə‿sɜrtʃ‿ˈpɑrti‿əv‿ˈsɛvən‿ˈmoʊstli‿ˈstreɪndʒərz‿ˈhɛdɪd‿aʊt/}}
\underbrace{\text{When they found Missy, she'd been marooned on the mountain for 8 days.}}_{\text{/wɛn‿ðeɪ‿faʊnd‿ˈmɪsi‿ʃid‿bɪn‿məˈruːnd‿ɑn‿ðə‿ˈmaʊntən‿fər‿eɪt‿deɪz/}}
$$

> search party → /sɜrtʃ‿ˈpɑrti/（搜救队）
> headed out → /ˈhɛdɪd‿aʊt/（出发；-ed 读 /ɪd/）
> she'd been → /ʃid‿bɪn/（she had been 缩约）
> marooned → /məˈruːnd/（被困/放逐）
> for 8 days → /fər‿eɪt‿deɪz/（for 弱读 /fər/）

### daily english dictation 153

$$
\underbrace{\text{There was a time where I was really obsessed with animals}}_{\text{/ðɛr‿wəz‿ə‿taɪm‿wɛr‿aɪ‿wəz‿ˈrɪəli‿əbˈsɛst‿wɪð‿ˈænɪməlz/}}
\underbrace{\text{and I wanted to be like a dolphin trainer.}}_{\text{/ən‿aɪ‿ˈwɑnɪd‿tə‿bi‿laɪk‿ə‿ˈdɑlfɪn‿ˈtreɪnər/}}
\underbrace{\text{But I don't know if I would have been able to do that}}_{\text{/bʌt‿aɪ‿doʊnt‿noʊ‿ɪf‿aɪ‿wʊd‿əv‿bɪn‿ˈeɪbəl‿tə‿du‿ðæt/}}
\underbrace{\text{'cuz I'm kind of scared of the water.}}_{\text{/kʌz‿aɪm‿kaɪnd‿əv‿skɛrd‿əv‿ðə‿ˈwɔtər/}}
$$

> obsessed with → /əbˈsɛst‿wɪð/（痴迷于…）
> wanted to → /ˈwɑnɪd‿tə/（t 在 n 后 → silent t；to 弱读 /tə/）
> dolphin → /ˈdɑlfɪn/
> would have been → /wʊd‿əv‿bɪn/（have → /əv/ 弱读）
> kind of → /kaɪnd‿əv/ → kinda
> scared of → /skɛrd‿əv/

### daily english dictation 154

$$
\underbrace{\text{Dreams don't have a one-size-fits-all meaning.}}_{\text{/driːmz‿doʊnt‿hæv‿ə‿wʌn‿saɪz‿fɪts‿ɔːl‿ˈmiːnɪŋ/}}
\underbrace{\text{But here are the most broad interpretations of the most common ones.}}_{\text{/bʌt‿hɪr‿ər‿ðə‿moʊst‿brɔːd‿ɪntɜrprɪˈteɪʃənz‿əv‿ðə‿moʊst‿ˈkɑmən‿wʌnz/}}
$$

> one-size-fits-all → 通用的/一刀切的
> broad → /brɔːd/（宽泛的；不是 abroad）
> interpretations of → /ɪntɜrprɪˈteɪʃənz‿əv/
> common ones → /ˈkɑmən‿wʌnz/

### daily english dictation 155

$$
\underbrace{\text{We are in the process of creating an extreme sport.}}_{\text{/wi‿ər‿ɪn‿ðə‿ˈprɑsɛs‿əv‿kriˈeɪtɪŋ‿ən‿ɪkˈstriːm‿spɔrt/}}
\underbrace{\text{And so these guys are flipping and flying in the air, doing stunts and grabs and flips and spins and tricks}}_{\text{/ən‿soʊ‿ðiːz‿gaɪz‿ər‿ˈflɪpɪŋ‿ən‿ˈflaɪɪŋ‿ɪn‿ði‿ɛr‿ˈduːɪŋ‿stʌnts‿ən‿græbz‿ən‿flɪps‿ən‿spɪnz‿ən‿trɪks/}}
\underbrace{\text{just like the skateboard or the bike or the surfboard or anything like that.}}_{\text{/dʒʌst‿laɪk‿ðə‿ˈskeɪtbɔrd‿ɔr‿ðə‿baɪk‿ɔr‿ðə‿ˈsɜrfbɔrd‿ɔr‿ˈɛniθɪŋ‿laɪk‿ðæt/}}
$$

> in the process of → /ɪn‿ðə‿ˈprɑsɛs‿əv/（正在…过程中）
> creating an → /kriˈeɪtɪŋ‿ən/（C+V 连读）
> extreme sport → /ɪkˈstriːm‿spɔrt/（极限运动）
> flips and spins → /flɪps‿ən‿spɪnz/（and 弱读 /ən/）
> anything like that → 之类的东西

### daily english dictation 156

$$
\underbrace{\text{Decide to develop the habit right now —}}_{\text{/dɪˈsaɪd‿tə‿dɪˈvɛləp‿ðə‿ˈhæbɪt‿raɪt‿naʊ/}}
\underbrace{\text{the habit of focusing on what's right in your world instead of what's wrong.}}_{\text{/ðə‿ˈhæbɪt‿əv‿ˈfoʊkəsɪŋ‿ɑn‿wʌts‿raɪt‿ɪn‿jɚ‿wɜrld‿ɪnˈstɛd‿əv‿wʌts‿rɔŋ/}}
\underbrace{\text{The habit of focusing on what you do have instead of what you don't have in a situation.}}_{\text{/ðə‿ˈhæbɪt‿əv‿ˈfoʊkəsɪŋ‿ɑn‿wʌt‿jə‿du‿hæv‿ɪnˈstɛd‿əv‿wʌt‿jə‿doʊnt‿hæv‿ɪn‿ə‿sɪtʃuˈeɪʃən/}}
$$

> Decide to → /dɪˈsaɪd‿tə/（to 弱读 /tə/）
> focusing on → /ˈfoʊkəsɪŋ‿ɑn/
> what's right in your → /wʌts‿raɪt‿ɪn‿jɚ/
> instead of → /ɪnˈstɛd‿əv/（of 弱读 /əv/）
> what you do have → /wʌt‿jə‿du‿hæv/（强调句中 do 重读）

### daily english dictation 157

$$
\underbrace{\text{Popsicle's a brand name, but it's also become a generic term}}_{\text{/ˈpɑpsɪkəlz‿ə‿brænd‿neɪm‿bʌt‿ɪts‿ˈɔːlsoʊ‿bɪˈkʌm‿ə‿dʒɪˈnɛrɪk‿tɜrm/}}
\underbrace{\text{for any frozen, sugar-filled deal on a stick!}}_{\text{/fər‿ˈɛni‿ˈfroʊzən‿ˈʃʊgər‿fɪld‿diːl‿ɑn‿ə‿stɪk/}}
$$

> Popsicle → /ˈpɑpsɪkəl/（冰棍品牌名，源自 pop + icicle）
> brand name → /brænd‿neɪm/
> generic term → /dʒɪˈnɛrɪk‿tɜrm/（通用术语）
> frozen, sugar-filled deal → 冷冻含糖食物（幽默表达）

### daily english dictation 158

$$
\underbrace{\text{But it's the first time we've really, on a global scale,}}_{\text{/bʌt‿ɪts‿ðə‿fɜrst‿taɪm‿wiv‿ˈrɪəli‿ɑn‿ə‿ˈgloʊbəl‿skeɪl/}}
\underbrace{\text{launched a product that was highly relevant to girls.}}_{\text{/lɔːntʃt‿ə‿ˈprɑdʌkt‿ðət‿wəz‿ˈhaɪli‿ˈrɛləvənt‿tə‿gɜrlz/}}
$$

> it's the first time → /ɪts‿ðə‿fɜrst‿taɪm/
> we've really → /wiv‿ˈrɪəli/
> on a global scale → 在全球范围内
> launched a → /lɔːntʃt‿ə/（-ed 读 /t/）
> relevant to → /ˈrɛləvənt‿tə/（to 弱读 /tə/）

### daily english dictation 159

$$
\underbrace{\text{1916: Clarence Saunders opens the first self-service grocery store,}}_{\text{/ˈnaɪntiːn‿sɪksˈtiːn‿ˈklærəns‿ˈsɔːndərz‿ˈoʊpənz‿ðə‿fɜrst‿sɛlf‿ˈsɜrvɪs‿ˈgroʊsəri‿stɔr/}}
\underbrace{\text{the Piggly Wiggly, in Memphis, Tennessee.}}_{\text{/ðə‿ˈpɪgli‿ˈwɪgli‿ɪn‿ˈmɛmfɪs‿tɛnɪˈsiː/}}
$$

> self-service → /sɛlf‿ˈsɜrvɪs/（自助）
> grocery store → /ˈgroʊsəri‿stɔr/（杂货店）
> Piggly Wiggly → /ˈpɪgli‿ˈwɪgli/（美国早期的自助超市连锁品牌）
> Tennessee → /tɛnɪˈsiː/

### daily english dictation 160

$$
\underbrace{\text{I roll on the floor laughing.}}_{\text{/aɪ‿roʊl‿ɑn‿ðə‿flɔr‿ˈlæfɪŋ/}}
\underbrace{\text{I say, "That's great. It's really funny, John. You're such a card."}}_{\text{/aɪ‿seɪ‿ðæts‿greɪt‿ɪts‿ˈrɪəli‿ˈfʌni‿dʒɑn‿jər‿sʌtʃ‿ə‿kɑrd/}}
$$

> roll on the floor laughing → ROFL（笑得在地上打滚）
> That's great → /ðæts‿greɪt/
> You're such a card → 你可真逗/真是个活宝（口语，card 指幽默的人）
### daily english dictation 161

$$
\text{Dude, I'm gonna go check out the view.}
\text{Hey! Look at this clown.}
\underbrace{\text{Oh, it's an actual clown.}}_{\text{/oʊ‿ɪts‿ən‿ˈæktʃuəl‿klaʊn/}}
\underbrace{\text{You're not still afraid of clowns, are you?}}_{\text{/jər‿nɑt‿stɪl‿əˈfreɪd‿əv‿klaʊnz‿ɑr‿jə/}}
\text{No.}
$$

> gonna → /ˈgʌnə/
> check out → /tʃɛk‿aʊt/（去看看）
> actual clown → /ˈæktʃuəl‿klaʊn/（真的是小丑）
> afraid of → /əˈfreɪd‿əv/（C+V 连读）
> are you → /ɑr‿jə/（you 弱读 /jə/）

### daily english dictation 162

$$
\underbrace{\text{Well, he throws down his bat, he comes racing up to the mound.}}_{\text{/wɛl‿hi‿θroʊz‿daʊn‿ɪz‿bæt‿hi‿kʌmz‿ˈreɪsɪŋ‿ʌp‿tə‿ðə‿maʊnd/}}
\underbrace{\text{Next thing, both benches are cleared, you know?}}_{\text{/nɛkst‿θɪŋ‿boʊθ‿ˈbɛntʃɪz‿ər‿klɪrd‿jə‿noʊ/}}
\underbrace{\text{A brouhaha breaks out between the guys in the camp, you know, and the old Yankee players.}}_{\text{/ə‿ˈbruːhɑːhɑː‿breɪks‿aʊt‿bɪˈtwiːn‿ðə‿gaɪz‿ɪn‿ðə‿kæmp‿ən‿ðə‿oʊld‿ˈjæŋki‿ˈpleɪərz/}}
\text{And as I'm trying to get Moose Skowron off of one of my teammates,}
\underbrace{\text{somebody pulls me from behind, you know, and I turned around and I popped him.}}_{\text{/ˈsʌmbɑdi‿pʊlz‿mi‿frəm‿bɪˈhaɪnd‿ən‿aɪ‿tɜrnd‿əˈraʊnd‿ən‿aɪ‿pɑpt‿ɪm/}}
\underbrace{\text{I looked down and — whoa, man! It's Mickey. I punched his lights out!}}_{\text{/aɪ‿lʊkt‿daʊn‿ən‿woʊ‿mæn‿ɪts‿ˈmɪki‿aɪ‿pʌntʃt‿ɪz‿laɪts‿aʊt/}}
$$

> throws down → /θroʊz‿daʊn/
> racing up to → /ˈreɪsɪŋ‿ʌp‿tə/（to 弱读 /tə/）
> brouhaha → /ˈbruːhɑːhɑː/（骚动/混乱）
> off of → /ɔːf‿əv/ → offa
> popped him → /pɑpt‿ɪm/（h 省略，him → /ɪm/）
> punched his lights out → 把他打晕了（习语；his → /ɪz/，h 省略）

### daily english dictation 163

$$
\underbrace{\text{Unbeaching a whale... this is hard.}}_{\text{/ʌnˈbiːtʃɪŋ‿ə‿weɪl‿ðɪs‿ɪz‿hɑrd/}}
\underbrace{\text{Setting up a tent... hard. Hard. Hard. Hard. Hard!}}_{\text{/ˈsɛtɪŋ‿ʌp‿ə‿tɛnt‿hɑrd/}}
$$

> Unbeaching → /ʌnˈbiːtʃɪŋ/（把鲸鱼从搁浅中解救出来）
> Setting up a tent → /ˈsɛtɪŋ‿ʌp‿ə‿tɛnt/（搭帐篷；flap t 在元音间）

### daily english dictation 164

$$
\underbrace{\text{Big Sur Highway is a stretch of Highway 1}}_{\text{/bɪg‿sɜr‿ˈhaɪweɪ‿ɪz‿ə‿strɛtʃ‿əv‿ˈhaɪweɪ‿wʌn/}}
\underbrace{\text{that encompasses some of the most breathtaking scenery in the world.}}_{\text{/ðət‿ɪnˈkʌmpəsɪz‿sʌm‿əv‿ðə‿moʊst‿ˈbrɛθteɪkɪŋ‿ˈsiːnəri‿ɪn‿ðə‿wɜrld/}}
$$

> Big Sur → /bɪg‿sɜr/（加州著名海岸公路）
> stretch of → /strɛtʃ‿əv/（一段）
> encompasses → /ɪnˈkʌmpəsɪz/（包含/囊括）
> breathtaking → /ˈbrɛθteɪkɪŋ/（令人叹为观止的）
> scenery → /ˈsiːnəri/

### daily english dictation 165

$$
\underbrace{\text{If I said to you, "I'm gonna shoot through to Maccers this arvo!", what would I be saying?}}_{\text{/ɪf‿aɪ‿sɛd‿tə‿jə‿aɪm‿ˈgʌnə‿ʃuːt‿θruː‿tə‿ˈmækərz‿ðɪs‿ˈɑrvoʊ‿wʌt‿wʊd‿aɪ‿bi‿ˈseɪɪŋ/}}
\underbrace{\text{I have no clue.}}_{\text{/aɪ‿hæv‿noʊ‿kluː/}}
$$

> shoot through → 走人/离开（澳洲俚语）
> Maccers → /ˈmækərz/（澳洲俚语：麦当劳 McDonald's）
> this arvo → 今天下午 this afternoon（澳洲俚语）
> no clue → /noʊ‿kluː/（完全不知道）

### daily english dictation 166

$$
\underbrace{\text{September 25, 1957. As hundreds of US Army troops stand guard,}}_{\text{/sɛpˈtɛmbər‿ˈtwɛnti‿fɪfθ‿ˈnaɪntiːn‿ˈfɪfti‿ˈsɛvən‿æz‿ˈhʌndrədz‿əv‿juː‿ɛs‿ˈɑrmi‿truːps‿stænd‿gɑrd/}}
\underbrace{\text{nine black students are escorted into Central High School in Little Rock, Arkansas.}}_{\text{/naɪn‿blæk‿ˈstuːdənts‿ər‿ɪˈskɔrtɪd‿ˈɪntə‿ˈsɛntrəl‿haɪ‿skuːl‿ɪn‿ˈlɪtəl‿rɑk‿ˈɑrkənsɔː/}}
\underbrace{\text{That happens two days after unruly white crowds forced the children}}_{\text{/ðæt‿ˈhæpənz‿tuː‿deɪz‿ˈæftər‿ʌnˈruːli‿waɪt‿kraʊdz‿fɔrst‿ðə‿ˈtʃɪldrən/}}
\underbrace{\text{to withdraw from trying to enter the all-white school.}}_{\text{/tə‿wɪðˈdrɔː‿frəm‿ˈtraɪɪŋ‿tə‿ˈɛntər‿ði‿ɔːl‿waɪt‿skuːl/}}
$$

> hundreds of → /ˈhʌndrədz‿əv/
> escorted into → /ɪˈskɔrtɪd‿ˈɪntə/（护送进入）
> Little Rock → /ˈlɪtəl‿rɑk/（小石城）
> unruly → /ʌnˈruːli/（不守规矩的/骚乱的）
> withdraw from → /wɪðˈdrɔː‿frəm/（退出；from 弱读 /frəm/）

### daily english dictation 167

$$
\underbrace{\text{I wasn't sure you got my message.}}_{\text{/aɪ‿ˈwʌzənt‿ʃʊr‿jə‿gɑt‿maɪ‿ˈmɛsɪdʒ/}}
\underbrace{\text{Well, I wasn't sure you called the right guy.}}_{\text{/wɛl‿aɪ‿ˈwʌzənt‿ʃʊr‿jə‿kɔːld‿ðə‿raɪt‿gaɪ/}}
\underbrace{\text{I think this is yours.}}_{\text{/aɪ‿θɪŋk‿ðɪs‿ɪz‿jɚz/}}
\underbrace{\text{Thank you, uh, I'm gonna frame this for my Wall of Shame.}}_{\text{/θæŋk‿jə‿ʌ‿aɪm‿ˈgʌnə‿freɪm‿ðɪs‿fər‿maɪ‿wɔːl‿əv‿ʃeɪm/}}
\text{Really? There's a wall?}
$$

> wasn't → /ˈwʌzənt/
> got my message → /gɑt‿maɪ‿ˈmɛsɪdʒ/
> called the right guy → 打对了电话（找对了人）
> gonna → /ˈgʌnə/
> frame this → /freɪm‿ðɪs/（把这个裱起来）
> Wall of Shame → /wɔːl‿əv‿ʃeɪm/（耻辱墙，反讽用法）

### daily english dictation 168

$$
\underbrace{\text{Be sure to watch Season Two of Enter the Dojo starting Tuesday, October 9, 2012.}}_{\text{/bi‿ʃʊr‿tə‿wɑtʃ‿ˈsiːzən‿tuː‿əv‿ˈɛntər‿ðə‿ˈdoʊdʒoʊ‿ˈstɑrtɪŋ‿ˈtuːzdeɪ‿ɑkˈtoʊbər‿naɪnθ‿ˈtwɛnti‿twɛlv/}}
\underbrace{\text{You never know what might happen...}}_{\text{/jə‿ˈnɛvər‿noʊ‿wʌt‿maɪt‿ˈhæpən/}}
$$

> Be sure to → /bi‿ʃʊr‿tə/（to 弱读 /tə/）
> Enter the Dojo → /ˈɛntər‿ðə‿ˈdoʊdʒoʊ/（网络剧名）
> starting → /ˈstɑrtɪŋ/（t 在元音间 → flap /ɾ/；但此处在词首附近保持/t/）
> October 9 → /ɑkˈtoʊbər‿naɪnθ/

### daily english dictation 169

$$
\underbrace{\text{Amid the bustle of Manhattan, Tim Doner blends in like any other teenager.}}_{\text{/əˈmɪd‿ðə‿ˈbʌsəl‿əv‿mænˈhætən‿tɪm‿ˈdoʊnər‿blɛndz‿ɪn‿laɪk‿ˈɛni‿ˈʌðər‿ˈtiːneɪdʒər/}}
\underbrace{\text{His time spent skateboarding, watching movies and keeping his iPod playlist up-to-date.}}_{\text{/ɪz‿taɪm‿spɛnt‿ˈskeɪtbɔrdɪŋ‿ˈwɑtʃɪŋ‿ˈmuːviz‿ən‿ˈkiːpɪŋ‿ɪz‿ˈaɪpɑd‿ˈpleɪlɪst‿ʌp‿tə‿deɪt/}}
$$

> Amid the bustle → /əˈmɪd‿ðə‿ˈbʌsəl/（在喧嚣之中）
> blends in → /blɛndz‿ɪn/（融入）
> his time spent → /ɪz‿taɪm‿spɛnt/（h 省略，his → /ɪz/）
> keeping his iPod → /ˈkiːpɪŋ‿ɪz‿ˈaɪpɑd/（his → /ɪz/）

### daily english dictation 170

$$
\underbrace{\text{It's just the movies Tim's watching happen to be in Farsi,}}_{\text{/ɪts‿dʒʌst‿ðə‿ˈmuːviz‿tɪmz‿ˈwɑtʃɪŋ‿ˈhæpən‿tə‿bi‿ɪn‿ˈfɑrsi/}}
\underbrace{\text{his comics are in Bengali, and his iPod features hits from Iran...}}_{\text{/ɪz‿ˈkɑmɪks‿ər‿ɪn‿bɛnˈgɔːli‿ən‿ɪz‿ˈaɪpɑd‿ˈfiːtʃərz‿hɪts‿frəm‿ɪˈræn/}}
\underbrace{\text{It is the life of the teenage hyper polyglot — perhaps one of the youngest in the world.}}_{\text{/ɪt‿ɪz‿ðə‿laɪf‿əv‿ðə‿ˈtiːneɪdʒ‿ˈhaɪpər‿ˈpɑliglɑt‿pərˈhæps‿wʌn‿əv‿ðə‿ˈjʌŋgɪst‿ɪn‿ðə‿wɜrld/}}
$$

> happen to be → /ˈhæpən‿tə‿bi/（碰巧是；to 弱读 /tə/）
> Farsi → /ˈfɑrsi/（波斯语）
> Bengali → /bɛnˈgɔːli/（孟加拉语）
> hyper polyglot → /ˈhaɪpər‿ˈpɑliglɑt/（超级多语者）
> one of the youngest → /wʌn‿əv‿ðə‿ˈjʌŋgɪst/

### daily english dictation 171

$$
\underbrace{\text{The problem with just copying the DNA is like taking a book}}_{\text{/ðə‿ˈprɑbləm‿wɪð‿dʒʌst‿ˈkɑpiɪŋ‿ðə‿diː‿ɛn‿eɪ‿ɪz‿laɪk‿ˈteɪkɪŋ‿ə‿bʊk/}}
\underbrace{\text{and all you copy are the letters in the book and you don't copy the spacing between the words or the punctuation.}}_{\text{/ən‿ɔːl‿jə‿ˈkɑpi‿ər‿ðə‿ˈlɛtərz‿ɪn‿ðə‿bʊk‿ən‿jə‿doʊnt‿ˈkɑpi‿ðə‿ˈspeɪsɪŋ‿bɪˈtwiːn‿ðə‿wɜrdz‿ɔr‿ðə‿pʌŋktʃuˈeɪʃən/}}
$$

> problem with → /ˈprɑbləm‿wɪð/
> copying the DNA → 复制 DNA
> letters in the → /ˈlɛtərz‿ɪn‿ðə/（取消矩阵：s 后的 th 可被同化）
> spacing between → /ˈspeɪsɪŋ‿bɪˈtwiːn/
> punctuation → /pʌŋktʃuˈeɪʃən/（标点符号）

### daily english dictation 172

$$
\underbrace{\text{The Norwegian Nobel committee applauded the EU's efforts to hold the union together}}_{\text{/ðə‿nɔrˈwiːdʒən‿noʊˈbɛl‿kəˈmɪti‿əˈplɔːdɪd‿ði‿iː‿juːz‿ˈɛfərts‿tə‿hoʊld‿ðə‿ˈjuːnjən‿təˈgɛðər/}}
\underbrace{\text{in the face of the debt crisis and its six decades of work to advance peace and reconciliation.}}_{\text{/ɪn‿ðə‿feɪs‿əv‿ðə‿dɛt‿ˈkraɪsɪs‿ən‿ɪts‿sɪks‿ˈdɛkeɪdz‿əv‿wɜrk‿tə‿ədˈvæns‿piːs‿ən‿rɛkənsɪliˈeɪʃən/}}
$$

> Norwegian → /nɔrˈwiːdʒən/（挪威的）
> applauded → /əˈplɔːdɪd/（赞扬；-ed 读 /ɪd/）
> hold the union together → 维持联盟的统一
> in the face of → 面对…
> reconciliation → /rɛkənsɪliˈeɪʃən/（和解）

### daily english dictation 173

$$
\underbrace{\text{We'll all be burning the midnight oil on this one.}}_{\text{/wɪl‿ɔːl‿bi‿ˈbɜrnɪŋ‿ðə‿ˈmɪdnaɪt‿ɔɪl‿ɑn‿ðɪs‿wʌn/}}
\underbrace{\text{That would be inadvisable.}}_{\text{/ðæt‿wʊd‿bi‿ɪnədˈvaɪzəbəl/}}
\text{Excuse me?}
\underbrace{\text{If you attempt to ignite a petroleum product on this ship at 0:00 hours,}}_{\text{/ɪf‿jə‿əˈtɛmpt‿tə‿ɪgˈnaɪt‿ə‿pɪˈtroʊliəm‿ˈprɑdʌkt‿ɑn‿ðɪs‿ʃɪp‿æt‿ˈzɪroʊ‿aʊərz/}}
\underbrace{\text{you will activate the fire suppression system.}}_{\text{/jə‿wɪl‿ˈæktɪveɪt‿ðə‿faɪr‿səˈprɛʃən‿ˈsɪstəm/}}
\underbrace{\text{That was just an expression. Expression of what? A figure of speech.}}_{\text{/ðæt‿wəz‿dʒʌst‿ən‿ɪkˈsprɛʃən‿ɪkˈsprɛʃən‿əv‿wʌt‿ə‿ˈfɪgjər‿əv‿spiːtʃ/}}
$$

> burning the midnight oil → 熬夜/开夜车（习语）
> inadvisable → /ɪnədˈvaɪzəbəl/（不明智的）
> attempt to → /əˈtɛmpt‿tə/（to 弱读 /tə/）
> ignite a petroleum → /ɪgˈnaɪt‿ə‿pɪˈtroʊliəm/（点燃石油制品）
> fire suppression → /faɪr‿səˈprɛʃən/（灭火系统）
> figure of speech → /ˈfɪgjər‿əv‿spiːtʃ/（修辞手法）

### daily english dictation 174

$$
\underbrace{\text{What a haul. A Picasso, a Matisse, two Monets, a Gauguin and more.}}_{\text{/wʌt‿ə‿hɔːl‿ə‿pɪˈkɑsoʊ‿ə‿məˈtiːs‿tuː‿moʊˈneɪz‿ə‿goʊˈgæn‿ən‿mɔr/}}
\underbrace{\text{As good as art gets. The value... more than a hundred million dollars.}}_{\text{/æz‿gʊd‿æz‿ɑrt‿gɛts‿ðə‿ˈvæljuː‿mɔr‿ðən‿ə‿ˈhʌndrəd‿ˈmɪljən‿ˈdɑlərz/}}
$$

> What a haul → /wʌt‿ə‿hɔːl/（收获真大！）
> Picasso → /pɪˈkɑsoʊ/；Matisse → /məˈtiːs/；Monet → /moʊˈneɪ/；Gauguin → /goʊˈgæn/
> As good as art gets → 艺术品中的极品
> a hundred million → /ə‿ˈhʌndrəd‿ˈmɪljən/

### daily english dictation 175

$$
\underbrace{\text{Big-name hotels reportedly bought millions of the faulty locks from a company called Onity.}}_{\text{/bɪg‿neɪm‿hoʊˈtɛlz‿rɪˈpɔrtɪdli‿bɔːt‿ˈmɪljənz‿əv‿ðə‿ˈfɔːlti‿lɑks‿frəm‿ə‿ˈkʌmpəni‿kɔːld‿ˈɑnɪti/}}
\underbrace{\text{I would say millions of people worldwide would be at risk every single day until this problem's fixed.}}_{\text{/aɪ‿wʊd‿seɪ‿ˈmɪljənz‿əv‿ˈpiːpəl‿ˈwɜrldwaɪd‿wʊd‿bi‿æt‿rɪsk‿ˈɛvri‿ˈsɪŋgəl‿deɪ‿ənˈtɪl‿ðɪs‿ˈprɑbləmz‿fɪkst/}}
$$

> reportedly → /rɪˈpɔrtɪdli/（据报道）
> bought → /bɔːt/（buy 的过去式）
> faulty locks → /ˈfɔːlti‿lɑks/（有问题的锁）
> at risk → /æt‿rɪsk/
> every single day → /ˈɛvri‿ˈsɪŋgəl‿deɪ/
> until this problem's fixed → /ənˈtɪl‿ðɪs‿ˈprɑbləmz‿fɪkst/

### daily english dictation 176

$$
\text{Whoa! What the hell is this?}
\underbrace{\text{It's a gas gun.}}_{\text{/ɪts‿ə‿gæs‿gʌn/}}
\text{A gas gun? Why not a gun-gun?}
\underbrace{\text{Our enemies have gun-guns!}}_{\text{/aʊr‿ˈɛnɪmiz‿hæv‿gʌn‿gʌnz/}}
\text{Are these paint balls?}
\text{No, these are knock-out gas.}
\underbrace{\text{That's insane.}}_{\text{/ðæts‿ɪnˈseɪn/}}
\underbrace{\text{It makes you look cool.}}_{\text{/ɪt‿meɪks‿jə‿lʊk‿kuːl/}}
\underbrace{\text{You said my outfit was pimp!}}_{\text{/jə‿sɛd‿maɪ‿ˈaʊtfɪt‿wəz‿pɪmp/}}
$$

> What the hell → /wʌt‿ðə‿hɛl/（到底；口语加强语气）
> gas gun → 气枪
> knock-out gas → 迷晕气体
> insane → /ɪnˈseɪn/（疯狂的）
> pimp → /pɪmp/（俚语：很酷/很潮）

### daily english dictation 177

$$
\underbrace{\text{Beer, true or false, helps strengthen your bones?}}_{\text{/bɪr‿truː‿ɔr‿fɔːls‿hɛlps‿ˈstrɛŋkθən‿jɚ‿boʊnz/}}
\underbrace{\text{For women in particular: Cholesterol... does drinking beer help your cholesterol levels?}}_{\text{/fər‿ˈwɪmɪn‿ɪn‿pərˈtɪkjələr‿kəˈlɛstərɔl‿dʌz‿ˈdrɪŋkɪŋ‿bɪr‿hɛlp‿jɚ‿kəˈlɛstərɔl‿ˈlɛvəlz/}}
$$

> true or false → /truː‿ɔr‿fɔːls/（对还是错）
> strengthen → /ˈstrɛŋkθən/（加强；注意 kθən 辅音丛）
> in particular → /ɪn‿pərˈtɪkjələr/（尤其；r 与 p 连读？不，in 和 particular 中间无 C+V）
> cholesterol → /kəˈlɛstərɔl/
> does drinking → /dʌz‿ˈdrɪŋkɪŋ/

### daily english dictation 178

$$
\underbrace{\text{I equate Persia with luxury, with rich tapestries and beautiful rugs,}}_{\text{/aɪ‿ɪˈkweɪt‿ˈpɜrʒə‿wɪð‿ˈlʌkʃəri‿wɪð‿rɪtʃ‿ˈtæpɪstriz‿ən‿ˈbjuːtɪfəl‿rʌgz/}}
\underbrace{\text{and my mother's fat, fuzzy Persian cat named Otis.}}_{\text{/ən‿maɪ‿ˈmʌðərz‿fæt‿ˈfʌzi‿ˈpɜrʒən‿kæt‿neɪmd‿ˈoʊtɪs/}}
\underbrace{\text{But I also think of a fantastic Persian king named Cyrus the Great}}_{\text{/bʌt‿aɪ‿ˈɔːlsoʊ‿θɪŋk‿əv‿ə‿fænˈtæstɪk‿ˈpɜrʒən‿kɪŋ‿neɪmd‿ˈsaɪrəs‿ðə‿greɪt/}}
\underbrace{\text{who believed in religious and cultural tolerance and who freed the Jews from Babylon to return to Israel.}}_{\text{/hu‿bɪˈliːvd‿ɪn‿rɪˈlɪdʒəs‿ən‿ˈkʌltʃərəl‿ˈtɑlərəns‿ən‿hu‿friːd‿ðə‿dʒuːz‿frəm‿ˈbæbɪlən‿tə‿rɪˈtɜrn‿tə‿ˈɪzreɪəl/}}
$$

> equate... with... → /ɪˈkweɪt‿wɪð/（把…等同于…）
> Persia → /ˈpɜrʒə/（波斯）
> tapestries → /ˈtæpɪstriz/（挂毯）
> fuzzy → /ˈfʌzi/（毛茸茸的）
> Cyrus the Great → /ˈsaɪrəs‿ðə‿greɪt/（居鲁士大帝）
> believed in → /bɪˈliːvd‿ɪn/（C+V 连读）
> tolerance → /ˈtɑlərəns/（宽容）
> freed the Jews from Babylon → 将犹太人从巴比伦解放

### daily english dictation 179

$$
\underbrace{\text{Do not drive. Let me repeat that, please, do not drive.}}_{\text{/du‿nɑt‿draɪv‿lɛt‿mi‿rɪˈpiːt‿ðæt‿pliːz‿du‿nɑt‿draɪv/}}
\underbrace{\text{We have now sent a message to all taxi and limo and livery drivers}}_{\text{/wi‿hæv‿naʊ‿sɛnt‿ə‿ˈmɛsɪdʒ‿tə‿ɔːl‿ˈtæksi‿ən‿ˈlɪmoʊ‿ən‿ˈlɪvəri‿ˈdraɪvərz/}}
\underbrace{\text{to get off the roads immediately.}}_{\text{/tə‿gɛt‿ɔːf‿ðə‿roʊdz‿ɪˈmiːdiətli/}}
$$

> Do not drive → /du‿nɑt‿draɪv/
> Let me repeat → /lɛt‿mi‿rɪˈpiːt/
> sent a message to → /sɛnt‿ə‿ˈmɛsɪdʒ‿tə/（to 弱读 /tə/）
> livery drivers → /ˈlɪvəri‿ˈdraɪvərz/（租车司机）
> get off the roads → /gɛt‿ɔːf‿ðə‿roʊdz/（离开道路）

### daily english dictation 180

$$
\underbrace{\text{With hundreds of styles that fit together beautifully, thousands of colors and ideas,}}_{\text{/wɪð‿ˈhʌndrədz‿əv‿staɪlz‿ðət‿fɪt‿təˈgɛðər‿ˈbjuːtɪfli‿ˈθaʊzəndz‿əv‿ˈkʌlərz‿ən‿aɪˈdiːəz/}}
\underbrace{\text{great ranges of kitchens, smart living spaces and lots of wonderful plants for any garden...}}_{\text{/greɪt‿ˈreɪndʒɪz‿əv‿ˈkɪtʃɪnz‿smɑrt‿ˈlɪvɪŋ‿ˈspeɪsɪz‿ən‿lɑts‿əv‿ˈwʌndərfəl‿plænts‿fər‿ˈɛni‿ˈgɑrdən/}}
\underbrace{\text{with a little inspiration, you can achieve anything. Homebase, make a house a home.}}_{\text{/wɪð‿ə‿ˈlɪtəl‿ɪnspɪˈreɪʃən‿jə‿kən‿əˈtʃiːv‿ˈɛniθɪŋ‿ˈhoʊmbeɪs‿meɪk‿ə‿haʊs‿ə‿hoʊm/}}
$$

> hundreds of → /ˈhʌndrədz‿əv/
> fit together → /fɪt‿təˈgɛðər/（搭配在一起）
> ranges of → /ˈreɪndʒɪz‿əv/
> lots of → /lɑts‿əv/
> inspiration → /ɪnspɪˈreɪʃən/（灵感）
> achieve → /əˈtʃiːv/（实现）
> Homebase → 英国家居装修零售品牌
> make a house a home → 把房子变成一个家（品牌标语）
### daily english dictation 181

$$
\underbrace{\text{According to the polls, Obama and Romney are still neck and neck.}}_{\text{/əˈkɔrdɪŋ‿tə‿ðə‿poʊlz‿oʊˈbɑmə‿ən‿ˈrɑmni‿ər‿stɪl‿nɛk‿ən‿nɛk/}}
\underbrace{\text{Romney has a very strong lead among white voters.}}_{\text{/ˈrɑmni‿hæz‿ə‿ˈvɛri‿strɔŋ‿liːd‿əˈmʌŋ‿waɪt‿ˈvoʊtərz/}}
$$

> According to → /əˈkɔrdɪŋ‿tə/（to 弱读 /tə/）
> the polls → /ðə‿poʊlz/（民意调查）
> neck and neck → /nɛk‿ən‿nɛk/（势均力敌；and 弱读 /ən/）
> lead among → /liːd‿əˈmʌŋ/（在…中领先）

### daily english dictation 182

$$
\underbrace{\text{What is it all about? This is really a guide to how to become world-class}}_{\text{/wʌt‿ɪz‿ɪt‿ɔːl‿əˈbaʊt‿ðɪs‿ɪz‿ˈrɪəli‿ə‿gaɪd‿tə‿haʊ‿tə‿bɪˈkʌm‿wɜrld‿klæs/}}
\underbrace{\text{in just about anything in 6 months or less.}}_{\text{/ɪn‿dʒʌst‿əˈbaʊt‿ˈɛniθɪŋ‿ɪn‿sɪks‿mʌnθs‿ɔr‿lɛs/}}
$$

> What is it all about? → 这到底是关于什么的？
> a guide to → /ə‿gaɪd‿tə/（to 弱读 /tə/）
> how to → /haʊ‿tə/（to 弱读 /tə/）
> world-class → /wɜrld‿klæs/（世界级的）
> in just about anything → 几乎任何事情

### daily english dictation 183

$$
\underbrace{\text{There's a lot more demand for people who want to just improve themselves}}_{\text{/ðɛrz‿ə‿lɑt‿mɔr‿dɪˈmænd‿fər‿ˈpiːpəl‿hu‿wɑnt‿tə‿dʒʌst‿ɪmˈpruːv‿ðəmˈsɛlvz/}}
\underbrace{\text{than anyone would have guessed.}}_{\text{/ðæn‿ˈɛniwʌn‿wʊd‿əv‿gɛst/}}
$$

> a lot more → /ə‿lɑt‿mɔr/
> demand for → /dɪˈmænd‿fər/（for 弱读 /fər/）
> want to → /wɑnt‿tə/ → wanna
> improve themselves → /ɪmˈpruːv‿ðəmˈsɛlvz/
> would have guessed → /wʊd‿əv‿gɛst/（have 弱读 /əv/；guessed 的 -ed 读 /t/）

### daily english dictation 184

$$
\text{What are you doing? What?}
\underbrace{\text{Did... did you just double-dip that chip?}}_{\text{/dɪd‿dɪdʒə‿dʒʌst‿ˈdʌbəl‿dɪp‿ðæt‿tʃɪp/}}
\text{Excuse me?}
\underbrace{\text{You double-dipped the chip.}}_{\text{/jə‿ˈdʌbəl‿dɪpt‿ðə‿tʃɪp/}}
\text{Double-dipped? What are you talking about?}
\underbrace{\text{You dipped the chip... You took a bite... and you dipped again.}}_{\text{/jə‿dɪpt‿ðə‿tʃɪp‿jə‿tʊk‿ə‿baɪt‿ən‿jə‿dɪpt‿əˈgɛn/}}
$$

> did you → /dɪdʒə/（d+y → /dʒ/）
> double-dip → /ˈdʌbəl‿dɪp/（蘸两次；指用咬过的薯片再次蘸酱）
> Excuse me? → /ɪkˈskjuːz‿mi/（升调表惊讶/不满）
> dipped the chip → /dɪpt‿ðə‿tʃɪp/（t 在 th 前 held）
> took a bite → /tʊk‿ə‿baɪt/

### daily english dictation 185

$$
\text{Alright, be careful with the car, babe.}
\text{Yeah, yeah.}
\underbrace{\text{And don't move the seat. I've got it right where I like it.}}_{\text{/ən‿doʊnt‿muːv‿ðə‿siːt‿aɪv‿gɑt‿ɪt‿raɪt‿wɛr‿aɪ‿laɪk‿ɪt/}}
\text{Goodbye!}
\text{2 and 10, babe. Okay.}
\underbrace{\text{Don't peel out. I won't.}}_{\text{/doʊnt‿piːl‿aʊt‿aɪ‿woʊnt/}}
$$

> be careful with → /bi‿ˈkɛrfəl‿wɪð/
> don't move the seat → /doʊnt‿muːv‿ðə‿siːt/（t 在 th 前 held）
> I've got it right → /aɪv‿gɑt‿ɪt‿raɪt/（flap t 在元音间）
> 2 and 10 → /tuː‿ən‿tɛn/（双手握方向盘的位置：2点和10点方向）
> peel out → /piːl‿aʊt/（猛踩油门/飞驰而去）

### daily english dictation 186

$$
\underbrace{\text{One of the things Alex doesn't have is a knee-jerk response}}_{\text{/wʌn‿əv‿ðə‿θɪŋz‿ˈælɪks‿ˈdʌzənt‿hæv‿ɪz‿ə‿niː‿dʒɜrk‿rɪˈspɑns/}}
\underbrace{\text{to the types of objects that you present him.}}_{\text{/tə‿ðə‿taɪps‿əv‿ˈɑbdʒɪkts‿ðət‿jə‿prɪˈzɛnt‿ɪm/}}
$$

> One of the → /wʌn‿əv‿ðə/
> doesn't have → /ˈdʌzənt‿hæv/
> knee-jerk response → /niː‿dʒɜrk‿rɪˈspɑns/（本能反应/不假思索的反应）
> types of → /taɪps‿əv/
> present him → /prɪˈzɛnt‿ɪm/（h 省略，him → /ɪm/）

### daily english dictation 187

$$
\underbrace{\text{The brand name alone and rectangular, calorie-laden, cream-filled, golden cake}}_{\text{/ðə‿brænd‿neɪm‿əˈloʊn‿ən‿rɛkˈtæŋgjələr‿ˈkæləri‿ˈleɪdən‿kriːm‿fɪld‿ˈgoʊldən‿keɪk/}}
\underbrace{\text{is blazed into American memories.}}_{\text{/ɪz‿bleɪzd‿ˈɪntə‿əˈmɛrɪkən‿ˈmɛməriz/}}
$$

> brand name alone → /brænd‿neɪm‿əˈloʊn/（光品牌名本身就…）
> rectangular → /rɛkˈtæŋgjələr/（长方形的）
> calorie-laden → /ˈkæləri‿ˈleɪdən/（充满卡路里的）
> cream-filled → /kriːm‿fɪld/
> blazed into → /bleɪzd‿ˈɪntə/（深深地烙印在…）
> 这指的是 Twinkie（奶油夹心蛋糕）——美国经典零食

### daily english dictation 188

$$
\underbrace{\text{Sears has a Toshiba 50-inch LED. It normally retails for \$799 —}}_{\text{/sɪrz‿hæz‿ə‿toʊˈʃiːbə‿ˈfɪfti‿ɪntʃ‿ɛl‿iː‿diː‿ɪt‿ˈnɔrməli‿ˈriːteɪlz‿fər‿ˈsɛvən‿ˈhʌndrəd‿ˈnaɪnti‿naɪn/}}
\underbrace{\text{it's marked down to \$299.}}_{\text{/ɪts‿mɑrkt‿daʊn‿tə‿tuː‿ˈhʌndrəd‿ˈnaɪnti‿naɪn/}}
$$

> Sears → /sɪrz/（美国连锁百货）
> Toshiba → /toʊˈʃiːbə/（东芝）
> retails for → /ˈriːteɪlz‿fər/（零售价为）
> marked down to → /mɑrkt‿daʊn‿tə/（降价至）

### daily english dictation 189

$$
\underbrace{\text{Imagine you've got a train and it's hurtling down a track.}}_{\text{/ɪˈmædʒɪn‿jəv‿gɑt‿ə‿treɪn‿ən‿ɪts‿ˈhɜrtlɪŋ‿daʊn‿ə‿træk/}}
\underbrace{\text{In its path 5 people are trapped on the line and cannot escape.}}_{\text{/ɪn‿ɪts‿pæθ‿faɪv‿ˈpiːpəl‿ər‿træpt‿ɑn‿ðə‿laɪn‿ən‿ˈkænɑt‿ɪˈskeɪp/}}
\underbrace{\text{Fortunately, you can flick a switch which diverts the train down a fork in that track}}_{\text{/ˈfɔrtʃənɪtli‿jə‿kən‿flɪk‿ə‿swɪtʃ‿wɪtʃ‿daɪˈvɜrts‿ðə‿treɪn‿daʊn‿ə‿fɔrk‿ɪn‿ðæt‿træk/}}
\underbrace{\text{away from those 5 people, but at a price.}}_{\text{/əˈweɪ‿frəm‿ðoʊz‿faɪv‿ˈpiːpəl‿bʌt‿æt‿ə‿praɪs/}}
\underbrace{\text{There is another person trapped down that fork, and the train will kill them instead.}}_{\text{/ðɛr‿ɪz‿əˈnʌðər‿ˈpɜrsən‿træpt‿daʊn‿ðæt‿fɔrk‿ən‿ðə‿treɪn‿wɪl‿kɪl‿ðəm‿ɪnˈstɛd/}}
\text{Question: Should you flick the switch?}
$$

> Imagine → /ɪˈmædʒɪn/
> you've got → /jəv‿gɑt/
> hurtling down → /ˈhɜrtlɪŋ‿daʊn/（飞速冲下）
> flick a switch → /flɪk‿ə‿swɪtʃ/（拨动开关）
> diverts → /daɪˈvɜrts/（使转向）
> at a price → /æt‿ə‿praɪs/（但有代价）
> This is the famous "Trolley Problem"（电车难题）伦理思想实验

### daily english dictation 190

$$
\underbrace{\text{Well, I'd pay off my bills and retire. Just like everybody else!}}_{\text{/wɛl‿aɪd‿peɪ‿ɔːf‿maɪ‿bɪlz‿ən‿rɪˈtaɪr‿dʒʌst‿laɪk‿ˈɛvribɑdi‿ɛls/}}
$$

> I'd → /aɪd/（I would 缩约）
> pay off → /peɪ‿ɔːf/（还清）
> bills → /bɪlz/（账单）
> retire → /rɪˈtaɪr/
> everybody else → /ˈɛvribɑdi‿ɛls/（其他人也一样）

### daily english dictation 191

$$
\underbrace{\text{Well, this is it. We're down South, Willie.}}_{\text{/wɛl‿ðɪs‿ɪz‿ɪt‿wɪr‿daʊn‿saʊθ‿ˈwɪli/}}
\underbrace{\text{How does it feel to be back in the land of cotton?}}_{\text{/haʊ‿dʌz‿ɪt‿fiːl‿tə‿bi‿bæk‿ɪn‿ðə‿lænd‿əv‿ˈkɑtən/}}
\underbrace{\text{Tennessee ain't bad, but she ain't a pretty piece like old home, Mississippi.}}_{\text{/tɛnɪˈsiː‿eɪnt‿bæd‿bʌt‿ʃi‿eɪnt‿ə‿ˈprɪti‿piːs‿laɪk‿oʊld‿hoʊm‿mɪsɪˈsɪpi/}}
$$

> this is it → /ðɪs‿ɪz‿ɪt/（到了/就是这样）
> down South → /daʊn‿saʊθ/（在南方）
> the land of cotton → 棉花之乡（指美国南方）
> ain't → /eɪnt/（is not / am not 的口语形式）
> a pretty piece → 漂亮的地方

### daily english dictation 192

$$
\underbrace{\text{Today we salute you, Mr. Giant Taco Salad Inventor.}}_{\text{/təˈdeɪ‿wi‿səˈluːt‿jə‿ˈmɪstər‿ˈdʒaɪənt‿ˈtɑkoʊ‿ˈsæləd‿ɪnˈvɛntər/}}
\underbrace{\text{Ground beef, refried beans, guacamole, cheese, sour cream}}_{\text{/graʊnd‿biːf‿ˈriːfraɪd‿biːnz‿gwɑkəˈmoʊli‿tʃiːz‿saʊr‿kriːm/}}
\underbrace{\text{and if there's any room left a few shreds of lettuce. I don't see no lettuce.}}_{\text{/ən‿ɪf‿ðɛrz‿ˈɛni‿ruːm‿lɛft‿ə‿fjuː‿ʃrɛdz‿əv‿ˈlɛtɪs‿aɪ‿doʊnt‿siː‿noʊ‿ˈlɛtɪs/}}
$$

> we salute you → /wi‿səˈluːt‿jə/（我们向你致敬）
> ground beef → /graʊnd‿biːf/（牛肉碎）
> guacamole → /gwɑkəˈmoʊli/（鳄梨酱）
> sour cream → /saʊr‿kriːm/（酸奶油）
> shreds of → /ʃrɛdz‿əv/
> I don't see no lettuce → 口语中双重否定表强调（我没看见什么生菜！）
> 这是对美国"巨塔可沙拉"发明者的幽默致敬广告

### daily english dictation 193

$$
\underbrace{\text{Yeah, I've lost so much weight that if I don't hold these up they'll fall,}}_{\text{/jɛə‿aɪv‿lɔːst‿soʊ‿mʌtʃ‿weɪt‿ðət‿ɪf‿aɪ‿doʊnt‿hoʊld‿ðiːz‿ʌp‿ðeɪl‿fɔːl/}}
\underbrace{\text{and I'm not gonna do that right now!}}_{\text{/ən‿aɪm‿nɑt‿ˈgʌnə‿du‿ðæt‿raɪt‿naʊ/}}
\underbrace{\text{But, uh, I'm really pleased with this... And I just wanna share this with everybody. Thanks a lot.}}_{\text{/bʌt‿ʌ‿aɪm‿ˈrɪəli‿pliːzd‿wɪð‿ðɪs‿ən‿aɪ‿dʒʌst‿ˈwʌnə‿ʃɛr‿ðɪs‿wɪð‿ˈɛvribɑdi‿θæŋks‿ə‿lɑt/}}
$$

> lost so much weight → /lɔːst‿soʊ‿mʌtʃ‿weɪt/（瘦了这么多）
> hold these up → /hoʊld‿ðiːz‿ʌp/（提着裤子）
> gonna → /ˈgʌnə/
> wanna → /ˈwʌnə/
> pleased with → /pliːzd‿wɪð/
> share this with → /ʃɛr‿ðɪs‿wɪð/

### daily english dictation 194

$$
\underbrace{\text{As you know, it was his nose that gave him away with every fib!}}_{\text{/æz‿jə‿noʊ‿ɪt‿wəz‿ɪz‿noʊz‿ðət‿geɪv‿ɪm‿əˈweɪ‿wɪð‿ˈɛvri‿fɪb/}}
$$

> As you know → /æz‿jə‿noʊ/（正如你所知）
> gave him away → /geɪv‿ɪm‿əˈweɪ/（h 省略，him → /ɪm/；暴露了他）
> fib → /fɪb/（小谎/无伤大雅的谎言）
> 出自《木偶奇遇记》Pinocchio——匹诺曹说谎鼻子会变长

### daily english dictation 195

$$
\underbrace{\text{Do you want a man who smells like he can bake you a gourmet cake}}_{\text{/də‿jə‿wɑnt‿ə‿mæn‿hu‿smɛlz‿laɪk‿hi‿kən‿beɪk‿jə‿ə‿gʊrˈmeɪ‿keɪk/}}
\underbrace{\text{in the dream kitchen he built for you with his own hands? Of course you do.}}_{\text{/ɪn‿ðə‿driːm‿ˈkɪtʃɪn‿hi‿bɪlt‿fər‿jə‿wɪð‿ɪz‿oʊn‿hændz‿əv‿kɔrs‿jə‿du/}}
$$

> Do you → /də‿jə/（do 和 you 都弱读）
> smells like → /smɛlz‿laɪk/
> gourmet → /gʊrˈmeɪ/（美食/高级料理）
> built for you → /bɪlt‿fər‿jə/（for 弱读 /fər/；you 弱读 /jə/）
> with his own hands → /wɪð‿ɪz‿oʊn‿hændz/（h 省略，his → /ɪz/）

### daily english dictation 196

$$
\underbrace{\text{Shiny as glass, these pigs are meant to be broken.}}_{\text{/ˈʃaɪni‿æz‿glæs‿ðiːz‿pɪgz‿ər‿mɛnt‿tə‿bi‿ˈbroʊkən/}}
\underbrace{\text{Just leave some for dad after Christmas dinner.}}_{\text{/dʒʌst‿liːv‿sʌm‿fər‿dæd‿ˈæftər‿ˈkrɪsməs‿ˈdɪnər/}}
\underbrace{\text{Now dad always got the first piece and that was traditionally the butt.}}_{\text{/naʊ‿dæd‿ˈɔːlweɪz‿gɑt‿ðə‿fɜrst‿piːs‿ən‿ðæt‿wəz‿trəˈdɪʃənəli‿ðə‿bʌt/}}
\underbrace{\text{The rest of the pieces passed around. The pleasing pig feast for good luck.}}_{\text{/ðə‿rɛst‿əv‿ðə‿ˈpiːsɪz‿pæst‿əˈraʊnd‿ðə‿ˈpliːzɪŋ‿pɪg‿fiːst‿fər‿gʊd‿lʌk/}}
$$

> Shiny as glass → /ˈʃaɪni‿æz‿glæs/（像玻璃一样闪亮）
> meant to be broken → /mɛnt‿tə‿bi‿ˈbroʊkən/（注定要被打破的；t 在 b 前 held）
> traditionally the butt → /trəˈdɪʃənəli‿ðə‿bʌt/（传统上猪屁股那块）
> passed around → /pæst‿əˈraʊnd/（传递）
> pleasing pig feast → 讨喜的猪形糖果盛宴（指圣诞节砸糖猪的传统）

### daily english dictation 197

$$
\underbrace{\text{Pirahã can be spoken, hummed, sung, even whistled.}}_{\text{/pɪrəˈhɑː‿kən‿bi‿ˈspoʊkən‿hʌmd‿sʌŋ‿ˈiːvən‿ˈwɪsəld/}}
\underbrace{\text{No words for colors. No past or future tense.}}_{\text{/noʊ‿wɜrdz‿fər‿ˈkʌlərz‿noʊ‿pæst‿ɔr‿ˈfjuːtʃər‿tɛns/}}
\underbrace{\text{And incredibly, no numbers. Because they don't need them.}}_{\text{/ən‿ɪnˈkrɛdəbli‿noʊ‿ˈnʌmbərz‿bɪˈkɔːz‿ðeɪ‿doʊnt‿niːd‿ðəm/}}
$$

> Pirahã → /pɪrəˈhɑː/（皮拉罕语，巴西亚马逊部落语言）
> hummed, sung, even whistled → 可哼唱、可唱、可吹口哨
> words for colors → /wɜrdz‿fər‿ˈkʌlərz/（表示颜色的词）
> incredibly → /ɪnˈkrɛdəbli/（令人难以置信地）
> don't need them → /doʊnt‿niːd‿ðəm/（them 弱读 /ðəm/）

### daily english dictation 198

$$
\underbrace{\text{She ate, slept even showered with her pet primate.}}_{\text{/ʃi‿eɪt‿slɛpt‿ˈiːvən‿ˈʃaʊərd‿wɪð‿ər‿pɛt‿ˈpraɪmeɪt/}}
\underbrace{\text{She calls little Darwin her son and says, "he needs his mother."}}_{\text{/ʃi‿kɔːlz‿ˈlɪtəl‿ˈdɑrwɪn‿ər‿sʌn‿ən‿sɛz‿hi‿niːdz‿ɪz‿ˈmʌðər/}}
$$

> slept even showered → /slɛpt‿ˈiːvən‿ˈʃaʊərd/（一起吃饭、睡觉甚至洗澡）
> pet primate → /pɛt‿ˈpraɪmeɪt/（宠物灵长类动物）
> calls... her son → /kɔːlz‿ər‿sʌn/（把…称作她的儿子）
> needs his mother → /niːdz‿ɪz‿ˈmʌðər/（h 省略，his → /ɪz/）

### daily english dictation 199

$$
\underbrace{\text{Make sure your belongings are hidden away in the compartments above or under the seat before you.}}_{\text{/meɪk‿ʃʊr‿jɚ‿bɪˈlɔŋɪŋz‿ər‿ˈhɪdən‿əˈweɪ‿ɪn‿ðə‿kəmˈpɑrtmənts‿əˈbʌv‿ɔr‿ˈʌndər‿ðə‿siːt‿bɪˈfɔr‿jə/}}
$$

> Make sure → /meɪk‿ʃʊr/
> your belongings → /jɚ‿bɪˈlɔŋɪŋz/（你的随身物品；your 弱读 /jɚ/）
> hidden away → /ˈhɪdən‿əˈweɪ/（藏好/收好）
> compartments above → /kəmˈpɑrtmənts‿əˈbʌv/（上方的行李舱）
> before you → /bɪˈfɔr‿jə/（you 弱读 /jə/）

### daily english dictation 200

$$
\underbrace{\text{Armageddon and how to survive it is currently trending.}}_{\text{/ɑrməˈgɛdən‿ən‿haʊ‿tə‿sərˈvaɪv‿ɪt‿ɪz‿ˈkɜrəntli‿ˈtrɛndɪŋ/}}
\underbrace{\text{A lot of people wanna know "how can they survive the events that lead up to the end of the world".}}_{\text{/ə‿lɑt‿əv‿ˈpiːpəl‿ˈwʌnə‿noʊ‿haʊ‿kən‿ðeɪ‿sərˈvaɪv‿ði‿ɪˈvɛnts‿ðət‿liːd‿ʌp‿tə‿ði‿ɛnd‿əv‿ðə‿wɜrld/}}
$$

> Armageddon → /ɑrməˈgɛdən/（世界末日/大决战）
> how to survive → /haʊ‿tə‿sərˈvaɪv/（to 弱读 /tə/）
> trending → /ˈtrɛndɪŋ/（成为热门话题）
> wanna → /ˈwʌnə/（want to）
> lead up to → /liːd‿ʌp‿tə/（导致；to 弱读 /tə/）
> the end of the world → /ði‿ɛnd‿əv‿ðə‿wɜrld/（世界末日）

## Daily Dictation 201-259

### daily english dictation 201

$$
\underbrace{\text{Oh, I've got lots of letters for Santa today.}}_{\text{/oʊ‿aɪv‿gɑt‿lɑts‿əv‿ˈlɛtərz‿fər‿ˈsæntə‿təˈdeɪ/}}
\underbrace{\text{And every year they're the same.}}_{\text{/ən‿ˈɛvri‿jɪr‿ðɛr‿ðə‿seɪm/}}
\underbrace{\text{Some ask for toys, but a lot ask questions.}}_{\text{/sʌm‿æsk‿fər‿tɔɪz‿bʌt‿ə‿lɑt‿æsk‿ˈkwɛstʃənz/}}
\underbrace{\text{Like, you take this one...}}_{\text{/laɪk‿jə‿teɪk‿ðɪs‿wʌn/}}
$$

> lots of → /lɑts‿əv/
> for Santa → /fər‿ˈsæntə/（for 弱读 /fər/）
> every year → /ˈɛvri‿jɪr/
> ask for → /æsk‿fər/（for 弱读 /fər/）
> a lot → /ə‿lɑt/

### daily english dictation 202

$$
\text{Step one. Worms.}
\text{Ew.}
\underbrace{\text{Okay, right there. "Ew" is one of the things you're not gonna wanna say}}_{\text{/oʊˈkeɪ‿raɪt‿ðɛr‿iːuː‿ɪz‿wʌn‿əv‿ðə‿θɪŋz‿jər‿nɑt‿ˈgʌnə‿ˈwʌnə‿seɪ/}}
\underbrace{\text{in front of your father-in-law.}}_{\text{/ɪn‿frʌnt‿əv‿jɚ‿ˈfɑðər‿ɪn‿lɔː/}}
\underbrace{\text{It's right up there with "icky" and "get it away". Now pick one up.}}_{\text{/ɪts‿raɪt‿ʌp‿ðɛr‿wɪð‿ˈɪki‿ən‿gɛt‿ɪt‿əˈweɪ‿naʊ‿pɪk‿wʌn‿ʌp/}}
\text{Really?}
\underbrace{\text{You're gonna have to do it when you're fishing.}}_{\text{/jər‿ˈgʌnə‿hæf‿tə‿du‿ɪt‿wɛn‿jər‿ˈfɪʃɪŋ/}}
$$

> Step one. Worms → 第一步：蚯蚓（钓鱼用）
> Ew → /iːuː/（表恶心的声音）
> gonna wanna → /ˈgʌnə‿ˈwʌnə/（going to want to 的双重缩约）
> father-in-law → /ˈfɑðər‿ɪn‿lɔː/（岳父/公公）
> icky → /ˈɪki/（恶心的）
> have to → /hæf‿tə/（hafta；v 清化为 f）
> pick one up → /pɪk‿wʌn‿ʌp/

### daily english dictation 203

$$
\underbrace{\text{You know, Ronnie, folks who save hundreds of dollars by switching to Geico sure are happy.}}_{\text{/jə‿noʊ‿ˈrɑni‿foʊks‿hu‿seɪv‿ˈhʌndrədz‿əv‿ˈdɑlərz‿baɪ‿ˈswɪtʃɪŋ‿tə‿ˈgaɪkoʊ‿ʃʊr‿ər‿ˈhæpi/}}
\underbrace{\text{How happy are they, Jimmy? I'd say happier than a body builder directing traffic.}}_{\text{/haʊ‿ˈhæpi‿ər‿ðeɪ‿ˈdʒɪmi‿aɪd‿seɪ‿ˈhæpiər‿ðən‿ə‿ˈbɑdi‿ˈbɪldər‿daɪˈrɛktɪŋ‿ˈtræfɪk/}}
\underbrace{\text{He does look happy!}}_{\text{/hi‿dʌz‿lʊk‿ˈhæpi/}}
$$

> folks who → /foʊks‿hu/
> hundreds of → /ˈhʌndrədz‿əv/
> switching to → /ˈswɪtʃɪŋ‿tə/（to 弱读 /tə/）
> Geico → /ˈgaɪkoʊ/（美国保险公司）
> happier than a body builder directing traffic → 比指挥交通的健美运动员还开心（幽默广告）
> He does look happy! → does 重读表强调

### daily english dictation 204

$$
\underbrace{\text{Hand the phone in to one of your parents promptly at 7:30 PM.}}_{\text{/hænd‿ðə‿foʊn‿ɪn‿tə‿wʌn‿əv‿jɚ‿ˈpɛrənts‿ˈprɑmptli‿æt‿ˈsɛvən‿ˈθɜrti‿piː‿ɛm/}}
\underbrace{\text{An 18-point contract littered with dos and don'ts.}}_{\text{/ən‿eɪˈtiːn‿pɔɪnt‿ˈkɑntrækt‿ˈlɪtərd‿wɪð‿duːz‿ən‿doʊnts/}}
\underbrace{\text{Don't take a zillion pictures and videos. Greg Hoffman's ticket to a brand new iPhone.}}_{\text{/doʊnt‿teɪk‿ə‿ˈzɪljən‿ˈpɪktʃərz‿ən‿ˈvɪdioʊz‿grɛg‿ˈhɑfmənz‿ˈtɪkɪt‿tə‿ə‿brænd‿nuː‿ˈaɪfoʊn/}}
$$

> Hand the phone in → /hænd‿ðə‿foʊn‿ɪn/（上交手机）
> promptly → /ˈprɑmptli/（准时地）
> littered with → /ˈlɪtərd‿wɪð/（遍布…）
> dos and don'ts → /duːz‿ən‿doʊnts/（行为准则）
> zillion → /ˈzɪljən/（极其多，口语夸张词）
> ticket to → /ˈtɪkɪt‿tə/（获得…的入场券）

### daily english dictation 205

$$
\underbrace{\text{A new study found that sleeping positions affect personality}}_{\text{/ə‿nuː‿ˈstʌdi‿faʊnd‿ðət‿ˈsliːpɪŋ‿pəˈzɪʃənz‿əˈfɛkt‿pɜrsəˈnælɪti/}}
\underbrace{\text{by determining how we feel when we wake up.}}_{\text{/baɪ‿dɪˈtɜrmɪnɪŋ‿haʊ‿wi‿fiːl‿wɛn‿wi‿weɪk‿ʌp/}}
$$

> study found that → /ˈstʌdi‿faʊnd‿ðət/（that 弱读 /ðət/）
> sleeping positions → /ˈsliːpɪŋ‿pəˈzɪʃənz/（睡姿）
> affect personality → /əˈfɛkt‿pɜrsəˈnælɪti/（影响性格）
> determining → /dɪˈtɜrmɪnɪŋ/
> wake up → /weɪk‿ʌp/

### daily english dictation 206

$$
\underbrace{\text{If I asked you, "what are the oldest man-made structures on Earth?"}}_{\text{/ɪf‿aɪ‿æskt‿jə‿wʌt‿ər‿ði‿ˈoʊldɪst‿mæn‿meɪd‿ˈstrʌktʃərz‿ɑn‿ɜrθ/}}
\underbrace{\text{what would probably come to mind are the Pyramids or Stonehenge}}_{\text{/wʌt‿wʊd‿ˈprɑbəbli‿kʌm‿tə‿maɪnd‿ər‿ðə‿ˈpɪrəmɪdz‿ɔr‿ˈstoʊnhɛndʒ/}}
\underbrace{\text{or one of the many other impressive, ancient stone ruins.}}_{\text{/ɔr‿wʌn‿əv‿ðə‿ˈmɛni‿ˈʌðər‿ɪmˈprɛsɪv‿ˈeɪnʃənt‿stoʊn‿ˈruːɪnz/}}
$$

> asked you → /æskt‿jə/（t+y → /tʃ/ 同化趋势）
> man-made → /mæn‿meɪd/（人造的）
> structures on Earth → /ˈstrʌktʃərz‿ɑn‿ɜrθ/
> come to mind → /kʌm‿tə‿maɪnd/（出现在脑海中；to 弱读 /tə/）
> Stonehenge → /ˈstoʊnhɛndʒ/（巨石阵）
> ancient stone ruins → /ˈeɪnʃənt‿stoʊn‿ˈruːɪnz/

### daily english dictation 207

$$
\underbrace{\text{MicroZap Incorporated thinks it's struck microwave gold —}}_{\text{/ˈmaɪkroʊzæp‿ɪnˈkɔrpəreɪtɪd‿θɪŋks‿ɪts‿strʌk‿ˈmaɪkroʊweɪv‿goʊld/}}
\underbrace{\text{a modified machine that keeps your bread from going bad.}}_{\text{/ə‿ˈmɑdɪfaɪd‿məˈʃiːn‿ðət‿kiːps‿jɚ‿brɛd‿frəm‿ˈgoʊɪŋ‿bæd/}}
$$

> MicroZap → /ˈmaɪkroʊzæp/（公司名）
> struck microwave gold → 发现了微波技术的金矿（比喻重大发现）
> modified → /ˈmɑdɪfaɪd/（改良的）
> keeps your bread from going bad → /kiːps‿jɚ‿brɛd‿frəm‿ˈgoʊɪŋ‿bæd/（防止面包变质；from 弱读 /frəm/）

### daily english dictation 208

$$
\text{What?}
\underbrace{\text{I've been thinking about what happened, and I hope this gift will make things better.}}_{\text{/aɪv‿bɪn‿ˈθɪŋkɪŋ‿əˈbaʊt‿wʌt‿ˈhæpənd‿ən‿aɪ‿hoʊp‿ðɪs‿gɪft‿wɪl‿meɪk‿θɪŋz‿ˈbɛtər/}}
\text{Star Trek DVDs? Why would I want this?}
\underbrace{\text{First of all, you're welcome.}}_{\text{/fɜrst‿əv‿ɔːl‿jər‿ˈwɛlkəm/}}
$$

> I've been thinking → /aɪv‿bɪn‿ˈθɪŋkɪŋ/
> about what happened → /əˈbaʊt‿wʌt‿ˈhæpənd/
> make things better → /meɪk‿θɪŋz‿ˈbɛtər/
> First of all, you're welcome → 先不说别的，不用谢。（讽刺幽默——对方还没感谢就先说"不客气"）

### daily english dictation 209

$$
\underbrace{\text{One of the classic Monopoly tokens will not be passing Go anymore.}}_{\text{/wʌn‿əv‿ðə‿ˈklæsɪk‿məˈnɑpəli‿ˈtoʊkənz‿wɪl‿nɑt‿bi‿ˈpæsɪŋ‿goʊ‿ɛniˈmɔr/}}
$$

> One of the classic → /wʌn‿əv‿ðə‿ˈklæsɪk/
> Monopoly tokens → /məˈnɑpəli‿ˈtoʊkənz/（大富翁游戏棋子）
> passing Go → /ˈpæsɪŋ‿goʊ/（经过 Go 格——大富翁中的关键格）
> anymore → /ɛniˈmɔr/

### daily english dictation 210

$$
\underbrace{\text{The Chinese are in the throes of what reporters are calling Air-Pocalypse.}}_{\text{/ðə‿tʃaɪˈniːz‿ər‿ɪn‿ðə‿θroʊz‿əv‿wʌt‿rɪˈpɔrtərz‿ər‿ˈkɔːlɪŋ‿ɛr‿ˈpɑkəlɪps/}}
\underbrace{\text{The sun was shining in Beijing today, but you wouldn't know it.}}_{\text{/ðə‿sʌn‿wəz‿ˈʃaɪnɪŋ‿ɪn‿beɪˈdʒɪŋ‿təˈdeɪ‿bʌt‿jə‿ˈwʊdənt‿noʊ‿ɪt/}}
\underbrace{\text{Just being outside can make eyes itch and throats burn.}}_{\text{/dʒʌst‿ˈbiːɪŋ‿aʊtˈsaɪd‿kən‿meɪk‿aɪz‿ɪtʃ‿ən‿θroʊts‿bɜrn/}}
$$

> in the throes of → /ɪn‿ðə‿θroʊz‿əv/（处于…的困境中）
> Air-Pocalypse → /ɛr‿ˈpɑkəlɪps/（空气末日；Air + Apocalypse 的合成词）
> you wouldn't know it → 你根本看不出来
> Just being outside → /dʒʌst‿ˈbiːɪŋ‿aʊtˈsaɪd/（仅仅待在室外）
> eyes itch and throats burn → /aɪz‿ɪtʃ‿ən‿θroʊts‿bɜrn/（眼睛发痒、喉咙灼烧）

### daily english dictation 211

$$
\underbrace{\text{You know, it is better without this big wallet. It's more comfortable.}}_{\text{/jə‿noʊ‿ɪt‿ɪz‿ˈbɛtər‿wɪˈðaʊt‿ðɪs‿bɪg‿ˈwɑlɪt‿ɪts‿mɔr‿ˈkʌmfərtəbəl/}}
\underbrace{\text{It doesn't matter if it's more comfortable. It's wrong. Why?}}_{\text{/ɪt‿ˈdʌzənt‿ˈmætər‿ɪf‿ɪts‿mɔr‿ˈkʌmfərtəbəl‿ɪts‿rɔŋ‿waɪ/}}
\underbrace{\text{Because important things go in a case. You got a skull for your brain,}}_{\text{/bɪˈkɔːz‿ɪmˈpɔrtənt‿θɪŋz‿goʊ‿ɪn‿ə‿keɪs‿jə‿gɑt‿ə‿skʌl‿fər‿jɚ‿breɪn/}}
\underbrace{\text{a plastic sleeve for your comb, and a wallet for your money.}}_{\text{/ə‿ˈplæstɪk‿sliːv‿fər‿jɚ‿koʊm‿ən‿ə‿ˈwɑlɪt‿fər‿jɚ‿ˈmʌni/}}
\underbrace{\text{Well, look at this thing. It's huge. You got more cow here than here. I need everything in there.}}_{\text{/wɛl‿lʊk‿æt‿ðɪs‿θɪŋ‿ɪts‿hjuːdʒ‿jə‿gɑt‿mɔr‿kaʊ‿hɪr‿ðæn‿hɪr‿aɪ‿niːd‿ˈɛvriθɪŋ‿ɪn‿ðɛr/}}
$$

> without this → /wɪˈðaʊt‿ðɪs/
> doesn't matter → /ˈdʌzənt‿ˈmætər/
> important things go in a case → 重要的东西要放在盒子里（来自 Seinfeld《宋飞正传》）
> skull for your brain → /skʌl‿fər‿jɚ‿breɪn/
> got more cow here than here → 钱包装了太多东西（cow 指牛皮，即钱包材质）
> 出自《宋飞正传》Seinfeld 经典台词

### daily english dictation 212

$$
\underbrace{\text{Across the EU it's lights out for the good-old incandescent bulb.}}_{\text{/əˈkrɔs‿ði‿iː‿juː‿ɪts‿laɪts‿aʊt‿fər‿ðə‿gʊd‿oʊld‿ɪnkænˈdɛsənt‿bʌlb/}}
$$

> Across the EU → /əˈkrɔs‿ði‿iː‿juː/（在整个欧盟）
> lights out for → /laɪts‿aʊt‿fər/（…要熄灭了/结束了）
> good-old → /gʊd‿oʊld/（老旧的/经典的）
> incandescent bulb → /ɪnkænˈdɛsənt‿bʌlb/（白炽灯泡）

### daily english dictation 213

$$
\underbrace{\text{Brooke is a climbing phenom. She's set all these precedents in rock-climbing}}_{\text{/brʊk‿ɪz‿ə‿ˈklaɪmɪŋ‿ˈfiːnɑm‿ʃiz‿sɛt‿ɔːl‿ðiːz‿ˈprɛsɪdənts‿ɪn‿rɑk‿ˈklaɪmɪŋ/}}
\underbrace{\text{that 10 years ago the top, elite climbers were having trouble doing.}}_{\text{/ðət‿tɛn‿jɪrz‿əˈgoʊ‿ðə‿tɑp‿ɪˈliːt‿ˈklaɪmərz‿wər‿ˈhævɪŋ‿ˈtrʌbəl‿ˈduːɪŋ/}}
$$

> phenom → /ˈfiːnɑm/（phenomenon 的简写，天才/杰出人物）
> set precedents → /sɛt‿ˈprɛsɪdənts/（开创先例）
> elite climbers → /ɪˈliːt‿ˈklaɪmərz/（顶尖攀岩者）
> were having trouble doing → /wər‿ˈhævɪŋ‿ˈtrʌbəl‿ˈduːɪŋ/

### daily english dictation 214

$$
\underbrace{\text{Gonzo and Poncho are lined up side-by-side, usually toward the back of the 8-member team.}}_{\text{/ˈgɑnzoʊ‿ən‿ˈpɑntʃoʊ‿ər‿laɪnd‿ʌp‿saɪd‿baɪ‿saɪd‿ˈjuːʒuəli‿tɔrd‿ðə‿bæk‿əv‿ði‿eɪt‿ˈmɛmbər‿tiːm/}}
$$

> Gonzo and Poncho → 两只狗的名字（来自雪橇犬队）
> lined up side-by-side → /laɪnd‿ʌp‿saɪd‿baɪ‿saɪd/（并排排列）
> toward the back → /tɔrd‿ðə‿bæk/（靠后位置）
> 8-member team → 8 只成员（狗）的队伍

### daily english dictation 215

$$
\underbrace{\text{We are all watching a miracle in the science of biology.}}_{\text{/wi‿ər‿ɔːl‿ˈwɑtʃɪŋ‿ə‿ˈmɪrəkəl‿ɪn‿ðə‿ˈsaɪəns‿əv‿baɪˈɑlədʒi/}}
\underbrace{\text{It is already 108 hours and he has not eaten anything, he has not drank a little drop of any kind of liquid,}}_{\text{/ɪt‿ɪz‿ɔlˈrɛdi‿wʌn‿ˈhʌndrəd‿ən‿eɪt‿aʊərz‿ən‿hi‿hæz‿nɑt‿ˈiːtən‿ˈɛniθɪŋ‿hi‿hæz‿nɑt‿dræŋk‿ə‿ˈlɪtəl‿drɑp‿əv‿ˈɛni‿kaɪnd‿əv‿ˈlɪkwɪd/}}
\underbrace{\text{he has not passed a drop of urine or stool.}}_{\text{/hi‿hæz‿nɑt‿pæst‿ə‿drɑp‿əv‿ˈjʊrɪn‿ɔr‿stuːl/}}
$$

> miracle → /ˈmɪrəkəl/（奇迹）
> science of biology → /ˈsaɪəns‿əv‿baɪˈɑlədʒi/
> drank → /dræŋk/（drink 的过去式；标准是 drank）
> a little drop of → /ə‿ˈlɪtəl‿drɑp‿əv/
> urine → /ˈjʊrɪn/（尿液）
> stool → /stuːl/（大便）

### daily english dictation 216

$$
\text{Hey! We're finished cleaning the bathroom. We're leaving.}
\underbrace{\text{See, that didn't take too long! Thank you girls.}}_{\text{/siː‿ðæt‿ˈdɪdənt‿teɪk‿tuː‿lɔŋ‿θæŋk‿jə‿gɜrlz/}}
\underbrace{\text{Now go on have a good time, all right? Bye!}}_{\text{/naʊ‿goʊ‿ɑn‿hæv‿ə‿gʊd‿taɪm‿ɔːl‿raɪt‿baɪ/}}
\underbrace{\text{Sweet and sour chicken!!! Girls, get back here right now!}}_{\text{/swiːt‿ən‿saʊr‿ˈtʃɪkɪn‿gɜrlz‿gɛt‿bæk‿hɪr‿raɪt‿naʊ/}}
$$

> finished cleaning → /ˈfɪnɪʃt‿ˈkliːnɪŋ/
> didn't take too long → /ˈdɪdənt‿teɪk‿tuː‿lɔŋ/
> go on have a good time → 去玩吧
> Sweet and sour chicken → 甜酸鸡（中餐菜名）
> get back here right now → 马上回来！（家长发现孩子偷吃时的反应）

### daily english dictation 217

$$
\underbrace{\text{Is she really sad, by the way, or is she pretty happy?}}_{\text{/ɪz‿ʃi‿ˈrɪəli‿sæd‿baɪ‿ðə‿weɪ‿ɔr‿ɪz‿ʃi‿ˈprɪti‿ˈhæpi/}}
\underbrace{\text{I think she's pretty happy. I mean, she meows a little bit in the car,}}_{\text{/aɪ‿θɪŋk‿ʃiz‿ˈprɪti‿ˈhæpi‿aɪ‿miːn‿ʃi‿miˈaʊz‿ə‿ˈlɪtəl‿bɪt‿ɪn‿ðə‿kɑr/}}
\underbrace{\text{but other than that she's got lots of food. She still has her momma kitty that comes and, you know,}}_{\text{/bʌt‿ˈʌðər‿ðæn‿ðæt‿ʃiz‿gɑt‿lɑts‿əv‿fuːd‿ʃi‿stɪl‿hæz‿ər‿ˈmɑmə‿ˈkɪti‿ðət‿kʌmz‿ən‿jə‿noʊ/}}
\underbrace{\text{gives her baths and whatnot. So, she's about as spoiled as can be.}}_{\text{/gɪvz‿ər‿bæθs‿ən‿ˈwʌtnɑt‿soʊ‿ʃiz‿əˈbaʊt‿æz‿spɔɪld‿æz‿kən‿bi/}}
$$

> by the way → /baɪ‿ðə‿weɪ/（顺便说一下）
> meows a little bit → /miˈaʊz‿ə‿ˈlɪtəl‿bɪt/（偶尔喵喵叫）
> other than that → /ˈʌðər‿ðæn‿ðæt/（除此之外）
> momma kitty → /ˈmɑmə‿ˈkɪti/（猫妈妈）
> and whatnot → /ən‿ˈwʌtnɑt/（等等/诸如此类）
> as spoiled as can be → /æz‿spɔɪld‿æz‿kən‿bi/（被宠到不能再宠了）

### daily english dictation 218

$$
\underbrace{\text{At 63 years old, this Chinese grandmother lives in a 50-sq.-ft. room with her two grandchildren.}}_{\text{/æt‿ˈsɪksti‿θriː‿jɪrz‿oʊld‿ðɪs‿tʃaɪˈniːz‿ˈgrændmʌðər‿lɪvz‿ɪn‿ə‿ˈfɪfti‿skwɛr‿fiːt‿ruːm‿wɪð‿ər‿tuː‿ˈgræntʃɪldrən/}}
\underbrace{\text{She pays 450 dollars a month for them to share bunk beds, eat and sleep in a home that's basically a metal cage.}}_{\text{/ʃi‿peɪz‿fɔr‿ˈfɪfti‿ˈdɑlərz‿ə‿mʌnθ‿fər‿ðəm‿tə‿ʃɛr‿bʌŋk‿bɛdz‿iːt‿ən‿sliːp‿ɪn‿ə‿hoʊm‿ðæts‿ˈbeɪsɪkli‿ə‿ˈmɛtəl‿keɪdʒ/}}
$$

> 50-sq.-ft. → 50 平方英尺（约 4.6 平方米）
> grandchildren → /ˈgræntʃɪldrən/
> pays 450 dollars a month → /peɪz‿fɔr‿ˈfɪfti‿ˈdɑlərz‿ə‿mʌnθ/
> bunk beds → /bʌŋk‿bɛdz/（上下铺）
> basically a metal cage → /ˈbeɪsɪkli‿ə‿ˈmɛtəl‿keɪdʒ/（基本上是个金属笼子）

### daily english dictation 219

$$
\underbrace{\text{Shocking news out of the Vatican on Monday, Pope Benedict is resigning at the end of the month.}}_{\text{/ˈʃɑkɪŋ‿nuːz‿aʊt‿əv‿ðə‿ˈvætɪkən‿ɑn‿ˈmʌndeɪ‿poʊp‿ˈbɛnədɪkt‿ɪz‿rɪˈzaɪnɪŋ‿æt‿ði‿ɛnd‿əv‿ðə‿mʌnθ/}}
\underbrace{\text{The announcement comes as a complete surprise. Pope Benedict is 85 years old.}}_{\text{/ði‿əˈnaʊnsmənt‿kʌmz‿æz‿ə‿kəmˈpliːt‿sərˈpraɪz‿poʊp‿ˈbɛnədɪkt‿ɪz‿ˈeɪti‿faɪv‿jɪrz‿oʊld/}}
$$

> Shocking news → /ˈʃɑkɪŋ‿nuːz/
> out of the Vatican → /aʊt‿əv‿ðə‿ˈvætɪkən/
> Pope Benedict → /poʊp‿ˈbɛnədɪkt/（教皇本笃十六世）
> resigning → /rɪˈzaɪnɪŋ/（辞职）
> at the end of → /æt‿ði‿ɛnd‿əv/
> complete surprise → /kəmˈpliːt‿sərˈpraɪz/

### daily english dictation 220

$$
\underbrace{\text{After a while the Emperor issued a verdict. Valentine was asked to agree with the emperor}}_{\text{/ˈæftər‿ə‿waɪl‿ði‿ˈɛmpərər‿ˈɪʃuːd‿ə‿ˈvɜrdɪkt‿ˈvæləntaɪn‿wəz‿æskt‿tə‿əˈgriː‿wɪð‿ði‿ˈɛmpərər/}}
\underbrace{\text{about the ban on marriage, thus giving up his religion. Valentine refused.}}_{\text{/əˈbaʊt‿ðə‿bæn‿ɑn‿ˈmɛrɪdʒ‿ðʌs‿ˈgɪvɪŋ‿ʌp‿ɪz‿rɪˈlɪdʒən‿ˈvæləntaɪn‿rɪˈfjuːzd/}}
\underbrace{\text{Just before his execution, Valentine asked for a pen and paper and signed a farewell message to his lover,}}_{\text{/dʒʌst‿bɪˈfɔr‿ɪz‿ɛksɪˈkjuːʃən‿ˈvæləntaɪn‿æskt‿fər‿ə‿pɛn‿ən‿ˈpeɪpər‿ən‿saɪnd‿ə‿fɛrˈwɛl‿ˈmɛsɪdʒ‿tə‿ɪz‿ˈlʌvər/}}
\underbrace{\text{"from your Valentine", a phrase that lived ever after.}}_{\text{/frəm‿jər‿ˈvæləntaɪn‿ə‿freɪz‿ðət‿lɪvd‿ˈɛvər‿ˈæftər/}}
$$

> issued a verdict → /ˈɪʃuːd‿ə‿ˈvɜrdɪkt/（发布了判决）
> was asked to → /wəz‿æskt‿tə/（to 弱读 /tə/）
> agree with → /əˈgriː‿wɪð/
> ban on marriage → /bæn‿ɑn‿ˈmɛrɪdʒ/（禁止婚姻）
> thus giving up his religion → /ðʌs‿ˈgɪvɪŋ‿ʌp‿ɪz‿rɪˈlɪdʒən/（从而放弃他的宗教信仰；his → /ɪz/）
> execution → /ɛksɪˈkjuːʃən/（处决）
> from your Valentine → /frəm‿jər‿ˈvæləntaɪn/（来自你的瓦伦丁）
> ever after → /ˈɛvər‿ˈæftər/（从此以后）
> 这是圣瓦伦丁节（情人节）的由来传说
### daily english dictation 221

$$
\underbrace{\text{The fraudulent cases of horse meat may be attributed to a law which banned horse-drawn carts}}_{\text{/ðə‿ˈfrɔːdʒələnt‿ˈkeɪsɪz‿əv‿hɔrs‿miːt‿meɪ‿bi‿əˈtrɪbjuːtɪd‿tə‿ə‿lɔː‿wɪtʃ‿bænd‿hɔrs‿drɔːn‿kɑrts/}}
\underbrace{\text{from traveling on Romanian roads. The ban also pertained to donkey-drawn carts.}}_{\text{/frəm‿ˈtrævəlɪŋ‿ɑn‿ruːˈmeɪniən‿roʊdz‿ðə‿bæn‿ˈɔːlsoʊ‿pərˈteɪnd‿tə‿ˈdɑŋki‿drɔːn‿kɑrts/}}
\underbrace{\text{But it is believed that hundreds of thousands of the animals were sent to the slaughterhouse}}_{\text{/bʌt‿ɪt‿ɪz‿bɪˈliːvd‿ðət‿ˈhʌndrədz‿əv‿ˈθaʊzəndz‿əv‿ði‿ˈænɪməlz‿wər‿sɛnt‿tə‿ðə‿ˈslɔːtərhaʊs/}}
\underbrace{\text{after the 6-year-old law recently enacted.}}_{\text{/ˈæftər‿ðə‿sɪks‿jɪr‿oʊld‿lɔː‿ˈriːsəntli‿ɪnˈæktɪd/}}
$$

> fraudulent → /ˈfrɔːdʒələnt/（欺诈的）
> horse meat → /hɔrs‿miːt/（马肉）
> attributed to → /əˈtrɪbjuːtɪd‿tə/（归因于；to 弱读 /tə/）
> horse-drawn carts → /hɔrs‿drɔːn‿kɑrts/（马车）
> pertained to → /pərˈteɪnd‿tə/（适用于）
> slaughterhouse → /ˈslɔːtərhaʊs/（屠宰场）
> enacted → /ɪnˈæktɪd/（通过/生效）

### daily english dictation 222

$$
\underbrace{\text{Here's a travel rule, any time you see a bar with a sign that says}}_{\text{/hɪrz‿ə‿ˈtrævəl‿ruːl‿ˈɛni‿taɪm‿jə‿siː‿ə‿bɑr‿wɪð‿ə‿saɪn‿ðət‿sɛz/}}
\underbrace{\text{"Stories, Beers \& Wood Burning Stoves", you go in.}}_{\text{/ˈstɔːriz‿bɪrz‿ən‿wʊd‿ˈbɜrnɪŋ‿stoʊvz‿jə‿goʊ‿ɪn/}}
\underbrace{\text{I'll give you the best souvenir that you'd ever get in Newfoundland, eh? What's that?}}_{\text{/aɪl‿gɪv‿jə‿ðə‿bɛst‿suːvəˈnɪr‿ðət‿jʊd‿ˈɛvər‿gɛt‿ɪn‿ˈnuːfəndlənd‿eɪ‿wʌts‿ðæt/}}
\underbrace{\text{That's a kiss off a Newfoundland-born! Thank you! That is... that... I got it!}}_{\text{/ðæts‿ə‿kɪs‿ɔːf‿ə‿ˈnuːfəndlənd‿bɔrn‿θæŋk‿jə‿ðæt‿ɪz‿ðæt‿aɪ‿gɑt‿ɪt/}}
$$

> travel rule → 旅行法则
> wood burning stoves → 烧木柴的炉子（暗示温馨的酒吧）
> souvenir → /suːvəˈnɪr/（纪念品）
> Newfoundland → /ˈnuːfəndlənd/（加拿大纽芬兰省）
> eh? → /eɪ/（加拿大特色语气词）
> Newfoundland-born → 纽芬兰出生的人

### daily english dictation 223

$$
\underbrace{\text{It's a question that has perplexed humanity from as early as the ancient Greeks}}_{\text{/ɪts‿ə‿ˈkwɛstʃən‿ðət‿hæz‿pərˈplɛkst‿hjuːˈmænɪti‿frəm‿æz‿ˈɜrli‿æz‿ði‿ˈeɪnʃənt‿griːks/}}
\underbrace{\text{all the way to the 21st Century. And we're still dying to know...}}_{\text{/ɔːl‿ðə‿weɪ‿tə‿ðə‿ˈtwɛnti‿fɜrst‿ˈsɛntʃəri‿ən‿wɪr‿stɪl‿ˈdaɪɪŋ‿tə‿noʊ/}}
\underbrace{\text{which came first, the chicken or the egg?}}_{\text{/wɪtʃ‿keɪm‿fɜrst‿ðə‿ˈtʃɪkɪn‿ɔr‿ði‿ɛg/}}
$$

> perplexed → /pərˈplɛkst/（困扰）
> humanity → /hjuːˈmænɪti/（人类）
> from as early as → /frəm‿æz‿ˈɜrli‿æz/
> ancient Greeks → /ˈeɪnʃənt‿griːks/
> all the way to → 一直到…
> dying to know → /ˈdaɪɪŋ‿tə‿noʊ/（极度想知道；to 弱读 /tə/）

### daily english dictation 224

$$
\underbrace{\text{I'm very excited about it, because it's all about love. It's all about you, your partner,}}_{\text{/aɪm‿ˈvɛri‿ɪkˈsaɪtɪd‿əˈbaʊt‿ɪt‿bɪˈkɔːz‿ɪts‿ɔːl‿əˈbaʊt‿lʌv‿ɪts‿ɔːl‿əˈbaʊt‿jə‿jɚ‿ˈpɑrtnər/}}
\underbrace{\text{Romeo and Juliet, Rose and Jack. When did you spend 5 days with your wife?}}_{\text{/ˈroʊmioʊ‿ən‿ˈdʒuːliɛt‿roʊz‿ən‿dʒæk‿wɛn‿dɪd‿jə‿spɛnd‿faɪv‿deɪz‿wɪð‿jɚ‿waɪf/}}
\underbrace{\text{You need to do it! Get on a cruise.}}_{\text{/jə‿niːd‿tə‿du‿ɪt‿gɛt‿ɑn‿ə‿kruːz/}}
$$

> excited about → /ɪkˈsaɪtɪd‿əˈbaʊt/
> Romeo and Juliet → /ˈroʊmioʊ‿ən‿ˈdʒuːliɛt/
> Rose and Jack → 《泰坦尼克号》主角
> When did you → /wɛn‿dɪd‿jə/
> Get on a cruise → /gɛt‿ɑn‿ə‿kruːz/（去坐游轮）

### daily english dictation 225

$$
\underbrace{\text{Hey! My parents are just as crazy as your parents!}}_{\text{/heɪ‿maɪ‿ˈpɛrənts‿ər‿dʒʌst‿æz‿ˈkreɪzi‿æz‿jɚ‿ˈpɛrənts/}}
\underbrace{\text{My father wears his sneakers in the pool! Sneakers!}}_{\text{/maɪ‿ˈfɑðər‿wɛrz‿ɪz‿ˈsniːkərz‿ɪn‿ðə‿puːl‿ˈsniːkərz/}}
$$

> just as crazy as → /dʒʌst‿æz‿ˈkreɪzi‿æz/
> your parents → /jɚ‿ˈpɛrənts/（your 弱读 /jɚ/）
> wears his sneakers → /wɛrz‿ɪz‿ˈsniːkərz/（h 省略，his → /ɪz/）
> in the pool → /ɪn‿ðə‿puːl/

### daily english dictation 226

$$
\underbrace{\text{It's bringing art, light, technology into the mix.}}_{\text{/ɪts‿ˈbrɪŋɪŋ‿ɑrt‿laɪt‿tɛkˈnɑlədʒi‿ˈɪntə‿ðə‿mɪks/}}
\underbrace{\text{But this is an abstract artwork. It's not a light show.}}_{\text{/bʌt‿ðɪs‿ɪz‿ən‿ˈæbstrækt‿ˈɑrtwɜrk‿ɪts‿nɑt‿ə‿laɪt‿ʃoʊ/}}
$$

> bringing...into the mix → 将…融合进来
> abstract artwork → /ˈæbstrækt‿ˈɑrtwɜrk/（抽象艺术作品）
> light show → /laɪt‿ʃoʊ/（灯光秀）

### daily english dictation 227

$$
\underbrace{\text{Barter Books was begun in 1991 by a couple, Stewart and Mary Manley.}}_{\text{/ˈbɑrtər‿bʊks‿wəz‿bɪˈgʌn‿ɪn‿ˈnaɪntiːn‿ˈnaɪnti‿wʌn‿baɪ‿ə‿ˈkʌpəl‿ˈstuːərt‿ən‿ˈmɛri‿ˈmænli/}}
\underbrace{\text{The building used to be an old, Victorian railway station.}}_{\text{/ðə‿ˈbɪldɪŋ‿juːst‿tə‿bi‿ən‿oʊld‿vɪkˈtɔːriən‿ˈreɪlweɪ‿ˈsteɪʃən/}}
\underbrace{\text{Huge rows of stack shelves now stand in the place where the tracks would have been.}}_{\text{/hjuːdʒ‿roʊz‿əv‿stæk‿ʃɛlvz‿naʊ‿stænd‿ɪn‿ðə‿pleɪs‿wɛr‿ðə‿træks‿wʊd‿əv‿bɪn/}}
$$

> Barter Books → /ˈbɑrtər‿bʊks/（英国著名二手书店）
> used to be → /juːst‿tə‿bi/（曾经是；used to 中 d 不发音）
> Victorian railway station → 维多利亚时代的火车站
> rows of → /roʊz‿əv/
> stack shelves → /stæk‿ʃɛlvz/（一排排书架）
> would have been → /wʊd‿əv‿bɪn/

### daily english dictation 228

$$
\underbrace{\text{I'm your dog... holding down the fort while you're out catching a movie.}}_{\text{/aɪm‿jɚ‿dɔːg‿ˈhoʊldɪŋ‿daʊn‿ðə‿fɔrt‿waɪl‿jər‿aʊt‿ˈkætʃɪŋ‿ə‿ˈmuːvi/}}
$$

> I'm your dog → /aɪm‿jɚ‿dɔːg/（我是你的狗——以狗的口吻叙述）
> holding down the fort → /ˈhoʊldɪŋ‿daʊn‿ðə‿fɔrt/（留守/看家；习语）
> out catching a movie → /aʊt‿ˈkætʃɪŋ‿ə‿ˈmuːvi/（外出看电影）

### daily english dictation 229

$$
\underbrace{\text{We built a wall. We built the pyramids. Math, science, history, unraveling the mystery}}_{\text{/wi‿bɪlt‿ə‿wɔːl‿wi‿bɪlt‿ðə‿ˈpɪrəmɪdz‿mæθ‿ˈsaɪəns‿ˈhɪstəri‿ʌnˈrævəlɪŋ‿ðə‿ˈmɪstəri/}}
\underbrace{\text{that all started with a big bang. Bang!}}_{\text{/ðət‿ɔːl‿ˈstɑrtɪd‿wɪð‿ə‿bɪg‿bæŋ‿bæŋ/}}
$$

> built a wall → /bɪlt‿ə‿wɔːl/
> unraveling → /ʌnˈrævəlɪŋ/（揭开/解开）
> the big bang → /ðə‿bɪg‿bæŋ/（宇宙大爆炸）
> 出自《生活大爆炸》The Big Bang Theory 主题曲

### daily english dictation 230

$$
\underbrace{\text{Eggs symbolize that whole emergence of new life and renewal.}}_{\text{/ɛgz‿ˈsɪmbəlaɪz‿ðæt‿hoʊl‿ɪˈmɜrdʒəns‿əv‿nuː‿laɪf‿ən‿rɪˈnuːəl/}}
\underbrace{\text{And so that tied in very nicely with the, uh, Russian Orthodox Christian Church and the whole Easter story.}}_{\text{/ən‿soʊ‿ðæt‿taɪd‿ɪn‿ˈvɛri‿ˈnaɪsli‿wɪð‿ðə‿ʌ‿ˈrʌʃən‿ˈɔrθədɑks‿ˈkrɪstʃən‿tʃɜrtʃ‿ən‿ðə‿hoʊl‿ˈiːstər‿ˈstɔːri/}}
$$

> symbolize → /ˈsɪmbəlaɪz/（象征）
> emergence → /ɪˈmɜrdʒəns/（出现/诞生）
> renewal → /rɪˈnuːəl/（更新/重生）
> tied in with → /taɪd‿ɪn‿wɪð/（与…很好地契合）
> Russian Orthodox Christian Church → 俄罗斯东正教教会
> Easter → /ˈiːstər/（复活节）

### daily english dictation 231

$$
\underbrace{\text{I'm at the health club, and while I'm in the pool some guy walks off with my glasses!}}_{\text{/aɪm‿æt‿ðə‿hɛlθ‿klʌb‿ən‿waɪl‿aɪm‿ɪn‿ðə‿puːl‿sʌm‿gaɪ‿wɔːks‿ɔːf‿wɪð‿maɪ‿ˈglæsɪz/}}
$$

> health club → /hɛlθ‿klʌb/（健身俱乐部）
> while I'm in → /waɪl‿aɪm‿ɪn/
> walks off with → /wɔːks‿ɔːf‿wɪð/（顺手拿走）
> glasses → /ˈglæsɪz/

### daily english dictation 232

$$
\underbrace{\text{A square mile of fertile soil contains more insects than the entire human population on Earth.}}_{\text{/ə‿skwɛr‿maɪl‿əv‿ˈfɜrtəl‿sɔɪl‿kənˈteɪnz‿mɔr‿ˈɪnsɛkts‿ðæn‿ði‿ɪnˈtaɪr‿ˈhjuːmən‿pɑpjuˈleɪʃən‿ɑn‿ɜrθ/}}
$$

> square mile → /skwɛr‿maɪl/（平方英里）
> fertile soil → /ˈfɜrtəl‿sɔɪl/（肥沃的土壤）
> contains more insects → /kənˈteɪnz‿mɔr‿ˈɪnsɛkts/
> entire human population → /ɪnˈtaɪr‿ˈhjuːmən‿pɑpjuˈleɪʃən/

### daily english dictation 233

$$
\underbrace{\text{1970. Millions of Americans concerned about the environment observe the first "Earth Day."}}_{\text{/ˈnaɪntiːn‿ˈsɛvənti‿ˈmɪljənz‿əv‿əˈmɛrɪkənz‿kənˈsɜrnd‿əˈbaʊt‿ði‿ɪnˈvaɪrənmənt‿əbˈzɜrv‿ðə‿fɜrst‿ɜrθ‿deɪ/}}
\underbrace{\text{The demonstration becomes an annual event that's now observed around the world.}}_{\text{/ðə‿dɛmənˈstreɪʃən‿bɪˈkʌmz‿ən‿ˈænjuəl‿ɪˈvɛnt‿ðæts‿naʊ‿əbˈzɜrvd‿əˈraʊnd‿ðə‿wɜrld/}}
$$

> Millions of → /ˈmɪljənz‿əv/
> concerned about → /kənˈsɜrnd‿əˈbaʊt/
> Earth Day → /ɜrθ‿deɪ/（地球日，4月22日）
> demonstration → /dɛmənˈstreɪʃən/
> annual event → /ˈænjuəl‿ɪˈvɛnt/（年度活动）
> observed around → /əbˈzɜrvd‿əˈraʊnd/

### daily english dictation 234

$$
\underbrace{\text{The school instituted the policy that red ink is upsetting to the students.}}_{\text{/ðə‿skuːl‿ˈɪnstɪtuːtɪd‿ðə‿ˈpɑləsi‿ðət‿rɛd‿ɪŋk‿ɪz‿ʌpˈsɛtɪŋ‿tə‿ðə‿ˈstuːdənts/}}
\underbrace{\text{Bob Blackman called it "Political correctness gone wild."}}_{\text{/bɑb‿ˈblækmən‿kɔːld‿ɪt‿pəˈlɪtɪkəl‿kəˈrɛktnəs‿gɔːn‿waɪld/}}
$$

> instituted → /ˈɪnstɪtuːtɪd/（实行/设立；-ed 读 /ɪd/）
> red ink → /rɛd‿ɪŋk/（红墨水）
> upsetting → /ʌpˈsɛtɪŋ/（令人不安的）
> Political correctness gone wild → 政治正确泛滥/走火入魔

### daily english dictation 235

$$
\underbrace{\text{An estimated 4,400 children are injured on roller coasters and carnival rides every year,}}_{\text{/ən‿ˈɛstɪmeɪtɪd‿fɔr‿ˈθaʊzənd‿fɔr‿ˈhʌndrəd‿ˈtʃɪldrən‿ər‿ˈɪndʒərd‿ɑn‿ˈroʊlər‿koʊstərz‿ən‿ˈkɑrnɪvəl‿raɪdz‿ˈɛvri‿jɪr/}}
\underbrace{\text{according to a recent study that includes 20 years worth of data.}}_{\text{/əˈkɔrdɪŋ‿tə‿ə‿ˈriːsənt‿ˈstʌdi‿ðət‿ɪnˈkluːdz‿ˈtwɛnti‿jɪrz‿wɜrθ‿əv‿ˈdeɪtə/}}
$$

> estimated → /ˈɛstɪmeɪtɪd/
> are injured → /ər‿ˈɪndʒərd/
> roller coasters → /ˈroʊlər‿koʊstərz/（过山车）
> carnival rides → /ˈkɑrnɪvəl‿raɪdz/（嘉年华游乐设施）
> 20 years worth of data → /ˈtwɛnti‿jɪrz‿wɜrθ‿əv‿ˈdeɪtə/

### daily english dictation 236

$$
\underbrace{\text{He says they're looking to maybe put somebody on, so I got you an interview next Friday with his boss.}}_{\text{/hi‿sɛz‿ðɛr‿ˈlʊkɪŋ‿tə‿ˈmeɪbi‿pʊt‿ˈsʌmbɑdi‿ɑn‿soʊ‿aɪ‿gɑt‿jə‿ən‿ˈɪntərvjuː‿nɛkst‿ˈfraɪdeɪ‿wɪð‿ɪz‿bɔːs/}}
$$

> looking to → /ˈlʊkɪŋ‿tə/（打算/想要；to 弱读 /tə/）
> put somebody on → /pʊt‿ˈsʌmbɑdi‿ɑn/（安排某人/雇佣某人）
> got you an interview → /gɑt‿jə‿ən‿ˈɪntərvjuː/
> with his boss → /wɪð‿ɪz‿bɔːs/（h 省略，his → /ɪz/）

### daily english dictation 237

$$
\underbrace{\text{This ain't your grandma's catfish!}}_{\text{/ðɪs‿eɪnt‿jɚ‿ˈgrænmɑz‿ˈkætfɪʃ/}}
$$

> ain't → /eɪnt/（is not 的口语形式）
> your grandma's → /jɚ‿ˈgrænmɑz/（your 弱读 /jɚ/）
> catfish → /ˈkætfɪʃ/（鲶鱼；这里指代一种食物）
> 意思：这可不是你奶奶做的那种老式鲶鱼！（更现代/更酷的版本）

### daily english dictation 238

$$
\underbrace{\text{I'll have a brewskie, Charlie. Well, there's nothing like a cold one after a long day, huh?}}_{\text{/aɪl‿hæv‿ə‿ˈbruːski‿ˈtʃɑrli‿wɛl‿ðɛrz‿ˈnʌθɪŋ‿laɪk‿ə‿koʊld‿wʌn‿ˈæftər‿ə‿lɔːŋ‿deɪ‿hʌ/}}
$$

> brewskie → /ˈbruːski/（俚语：啤酒 brew 的昵称变体）
> there's nothing like → /ðɛrz‿ˈnʌθɪŋ‿laɪk/（没什么比得上）
> a cold one → /ə‿koʊld‿wʌn/（一杯冰啤酒；one 指代 beer）
> after a long day → /ˈæftər‿ə‿lɔːŋ‿deɪ/

### daily english dictation 239

$$
\underbrace{\text{I wanna get a tattoo. I've always wanted to get a tattoo.}}_{\text{/aɪ‿ˈwʌnə‿gɛt‿ə‿tæˈtuː‿aɪv‿ˈɔːlweɪz‿ˈwɑnɪd‿tə‿gɛt‿ə‿tæˈtuː/}}
\underbrace{\text{The problem is I just don't know what to get.}}_{\text{/ðə‿ˈprɑbləm‿ɪz‿aɪ‿dʒʌst‿doʊnt‿noʊ‿wʌt‿tə‿gɛt/}}
\underbrace{\text{It's hard because my body is so perfect already.}}_{\text{/ɪts‿hɑrd‿bɪˈkɔːz‿maɪ‿ˈbɑdi‿ɪz‿soʊ‿ˈpɜrfɪkt‿ɔlˈrɛdi/}}
$$

> wanna → /ˈwʌnə/（want to）
> tattoo → /tæˈtuː/（纹身；注意重音在第二音节）
> always wanted to → /ˈɔːlweɪz‿ˈwɑnɪd‿tə/（wanted to → t 在 n 后 silent）
> what to get → /wʌt‿tə‿gɛt/（to 弱读 /tə/）
> so perfect already → 已经太完美了（幽默）

### daily english dictation 240

$$
\underbrace{\text{Is it a crunchy donut or a creamy croissant?}}_{\text{/ɪz‿ɪt‿ə‿ˈkrʌntʃi‿ˈdoʊnʌt‿ɔr‿ə‿ˈkriːmi‿krwɑˈsɑn/}}
\underbrace{\text{Actually, it's a cronut. And when it comes to foodies, it's the hottest item in New York City.}}_{\text{/ˈæktʃuəli‿ɪts‿ə‿ˈkroʊnʌt‿ən‿wɛn‿ɪt‿kʌmz‿tə‿ˈfuːdiz‿ɪts‿ðə‿ˈhɑtɪst‿ˈaɪtəm‿ɪn‿nuː‿jɔrk‿ˈsɪti/}}
$$

> crunchy → /ˈkrʌntʃi/（酥脆的）
> donut → /ˈdoʊnʌt/（甜甜圈）
> creamy croissant → /ˈkriːmi‿krwɑˈsɑn/（奶油可颂）
> cronut → /ˈkroʊnʌt/（可颂+甜甜圈的混合词，纽约网红甜品）
> foodies → /ˈfuːdiz/（美食爱好者）
> hottest item → /ˈhɑtɪst‿ˈaɪtəm/（最火热的单品）

### daily english dictation 241

$$
\underbrace{\text{Hi, Michael. My phone's still missing. Did someone turn it in yet?}}_{\text{/haɪ‿ˈmaɪkəl‿maɪ‿foʊnz‿stɪl‿ˈmɪsɪŋ‿dɪd‿ˈsʌmwʌn‿tɜrn‿ɪt‿ɪn‿jɛt/}}
\underbrace{\text{Is that a murse?}}_{\text{/ɪz‿ðæt‿ə‿mɜrs/}}
$$

> phone's still missing → /foʊnz‿stɪl‿ˈmɪsɪŋ/（手机还没找到）
> turn it in → /tɜrn‿ɪt‿ɪn/（上交/交还；flap t 在元音间）
> murse → /mɜrs/（man + purse = 男士手提包，合成词）
### daily english dictation 242
### daily english dictation 242 answers
### daily english dictation 243
### daily english dictation 243 answers
### daily english dictation 244
### daily english dictation 244 answers
### daily english dictation 245
### daily english dictation 245 answers
### daily english dictation 246
### daily english dictation 246 answer
### daily english dictation 247
### daily english dictation 247 answer
### daily english dictation 248
### daily english dictation 248 answer
### daily english dictation 249
### daily english dictation 249 answers
### daily english dictation 250
### daily english dictation 250 answers
### daily english dictation 251
### daily english dictation 251 answers
### daily english dictation 252
### daily english dictation 252 answers
### daily english dictation 253
### daily english dictation 253 answers
### daily english dictation 254
### daily english dictation 254 answers
### daily english dictation 255
### daily english dictation 255 answers
### daily english dictation 256
### daily english dictation 256 answers
### daily english dictation 257
### daily english dictation 257 answers
### daily english dictation 258
### daily english dictation 258 answers
### daily english dictation 259
### daily english dictation 259 answers

## Daily Dictation 259-328

### daily english dictation 259 answers
### DD 260 Challenge
### DD 260 Answers
### DD 261 Challenge
### DD 261 Answers
### DD 262 Challenge
### DD 262 Answers
### DD 263 Challenge
### DD 263 Answers
### DD 264 Challenge
### DD 264 Answers
### DD 265 Challenge
### DD 265 Answers
### DD 266 Challenge
### DD 266 Answers
### DD 267 Challenge
### DD 267 Answers
### DD 268 Challenge
### DD 268 Answers
### DD 269 Challenge
### DD 269 Answers
### DD 270 Challenge
### DD 270 Answers
### DD 271 Challenge
### DD 271 Answers
### DD 272 Challenge
### DD 272 Answers
### DD 273 Challenge
### DD 273 Answers
### DD 274 Challenge
### DD 274 Answers
### DD 275 Challenge
### DD 275 Answers
### DD 276 Challenge
### DD 276 Answers
### DD 277 Challenge
### DD 277 Answers
### DD 278 Challenge
### DD 278 Answers
### DD 279 Challenge
### DD 279 Answers
### DD 280 Challenge
### DD 280 Answers
### DD 281 Challenge
### DD 281 Answers
### DD 282 Challenge
### DD 282 Answers
### DD 283 Challenge
### DD 283 Answers
### DD 284 Challenge
### DD 284 Answers
### DD 285 Challenge
### DD 285 Answers
### DD 286 Challenge
### DD 286 Answers
### DD 287 Challenge
### DD 287 Answers
### DD 288 Challenge
### DD 288 Answers
### DD 289 Challenge
### DD 289 Answers
### DD 290 Challenge
### DD 290 Answers
### DD 291 Challenge
### DD 291 Answers
### DD 292 Challenge
### DD 292 Answers
### DD 293 Challenge
### DD 293 Answers
### DD 294 Challenge
### DD 294 Answers
### DD 295 Challenge
### DD 295 Answers
### DD 296 Challenge
### DD 296 Answers
### DD 297 Challenge
### DD 297 Answers
### DD 298 Challenge
### DD 298 Answers
### DD 299 Challenge
### DD 299 Answers
### DD 300 Challenge
### DD 300 Answers
### DD 301 Challenge
### DD 301 Answers
### DD 302 Challenge
### DD 302 Answers
### DD 303 Challenge
### DD 303 Answers
### DD 304 Challenge
### DD 304 Answers
### DD 305 Challenge
### DD 305 Answers
### DD 306 Challenge
### DD 306 Answers
### DD 307 Challenge
### DD 307 Answers
### DD 308 Challenge
### DD 308 Answers
### DD 309 Challenge
### DD 309 Answers
### DD 310 Challenge
### DD 310 Answers
### DD 311 Challenge
### DD 311 Answers
### DD 312 Challenge
### DD 312 Answers
### DD 313 Challenge
### DD 313 Answers
### DD 314 Challenge
### DD 314 Answers
### DD 315 Challenge
### DD 315 Answers
### DD 316 Challenge
### DD 316 Answers
### DD 317 Challenge
### DD 317 Answers
### DD 318 Challenge
### DD 318 Answers
### DD 319 Challenge
### DD 319 Answers
### DD 320 Challenge
### DD 320 Answers
### DD 321 Challenge
### DD 321 Answers
### DD 322 Challenge
### DD 322 Answers
### DD 323 Challenge
### DD 323 Answers
### DD 324 Challenge
### DD 324 Answers
### DD 325 Challenge
### DD 325 Answers
### DD 326 Challenge
### DD 326 Answers
### DD 327 Challenge
### DD 327 Answers
### DD 328 Challenge
### DD 328 Answers

## Daily Dictation 329-401

### DD 329 Challenge
### DD 329 Answers
### DD 330 Challenge
### DD 330 Answers
### DD 331 Challenge
### DD 331 Answers
### DD 332 Challenge
### DD 332 - You
### DD 333 Challenge
### DD 333 Answers
### DD 334 Challenge
### DD 334 Answers
### DD 335 Challenge
### DD 335 Answers
### DD 336 Challenge
### DD 336 Answers
### DD 337 Challenge
### DD 337 Answers
### DD 338 Challenge
### DD 338 Answers
### DD 339 Challenge
### DD 339 Answers
### DD 340 Challenge
### DD 340 Answers
### DD 341 Challenge
### DD 341 Answers
### DD 342 Challenge
### DD 342 Answers
### DD 343 Challenge
### DD 343 Answers
### DD 344 Challenge
### DD 344 Answers
### DD 345 Challenge
### DD 345 Answers
### DD 346 Challenge
### DD 346 Answers
### DD 347 Challenge
### DD 347 Answers
### DD 348 Challenge
### DD 348 Answers
### DD 349 Challenge
### DD 349 Answers
### DD 350 Challenge
### DD 350 Answers
### DD 351 Challenge
### DD 351 Answers
### DD 352 Challenge
### DD 352 Answers
### DD 353 Challenge
### DD 353 Answers
### DD 354 Challenge
### DD 354 Answers
### DD 355 Challenge
### DD 355 Answers
### DD 356 Challenge
### DD 356 Answers
### DD 357 Challenge
### DD 357 Answers
### DD 358 Challenge
### DD 358 Answers
### DD 359 Challenge
### DD 359 Answers
### DD 360 Challenge
### DD 360 Answers
### DD 361 Challenge
### DD 361 Answers
### DD 362 Challenge
### DD 362 Answers
### DD 363 Challenge
### DD 363 Answers
### DD 364 Challenge
### DD 364 Answers
### DD 365 Challenge
### DD 365 Answers
### DD 366 Challenge
### DD 366 Answers
### DD 367 Challenge
### DD 367 Answers
### DD 368 Challenge
### DD 368 Answers
### DD 369 Challenge
### DD 369 Answers
### DD 370 Challenge
### DD 370 Answers
### DD 371 Challenge
### DD 371 Answers
### DD 372 Challenge
### DD 372 Answers
### DD 373 Challenge
### DD 373 Answers
### DD 374 Challenge
### DD 374 Answers
### DD 375 Challenge
### DD 375 Answers
### DD 376 Challenge
### DD 376 Answers
### DD 377 Challenge
### DD 377 Answers
### DD 378 Challenge
### DD 378 Answers
### DD 379 Challenge
### DD 379 Answers
### DD 380 Challenge
### DD 380 Answers
### DD 381 Challenge
### DD 381 Answers
### DD 382 Challenge
### DD 382 Answers
### DD 383 Challenge
### DD 383 Answers
### DD 384 Challenge
### DD 384 Answers
### DD 385 Challenge
### DD 385 Answers
### DD 386 Challenge
### DD 386 Answers
### DD 387 Challenge
### DD 387 Answers
### DD 388 Challenge
### DD 388 Answers
### DD 389 Challenge
### DD 389 Answers
### DD 390 Challenge
### DD 390 Answers
### DD 391 Challenge
### DD 391 Answers
### DD 392 Challenge
### DD 392 Answers
### DD 393 Challenge
### DD 393 Answers
### DD 394 Challenge
### DD 394 Answers
### DD 395 Challenge
### DD 395 Answers
### DD 396 Challenge
### DD 396 Answers
### DD 397 Challenge
### DD 397 Answers
### DD 398 Challenge
### DD 398 Answers
### DD 399 Challenge
### DD 399 Answers
### DD 400 Challenge
### DD 400 Answers
### DD 401 Challenge
### DD 401 Answers + DDM 402 Challenge!
