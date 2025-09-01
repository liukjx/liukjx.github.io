# ABC Notation Test

This is a test for ABC notation:

```abc
X:1
T:Test Tune
M:4/4
L:1/4
K:C
C D E F | G A B c |
```

## TikZ Test


```tikz
\begin{tikzpicture}
  \draw (0,0) circle[radius=1cm];
  \draw (0,0) -- (45:1cm); % 45°方向，长度1 cm
\end{tikzpicture}
```


```tikz

\begin{document}

\begin{tikzpicture}
  \draw (0,0) circle (1cm);
  \draw (0,0) -- (1,1);
\end{tikzpicture}

\end{document}
```



```tikz
\begin{tikzpicture}
  \draw (0,0) circle[radius=1cm];
  \draw (0,0) -- (45:1cm); % 45°方向，长度1 cm
\end{tikzpicture}
```


为什么上面三个tikz图只有中间那个正常渲染，第一个和第三个问题在哪里导致无法渲染

在 `tikz` 代码块中，**是否包含 `\begin{document}` 和 `\end{document}`** 是关键区别。

---

### ✅ **中间那个能渲染的原因：**
它用了完整的 LaTeX 文档结构：

```latex
\begin{document}
\begin{tikzpicture}
  ...
\end{tikzpicture}
\end{document}
```

很多渲染工具（如 Overleaf、某些 Markdown 渲染器）会将这种结构识别为**完整的 LaTeX 文档**，从而正常编译并渲染。

---

### ❌ **第一个和第三个不能渲染的原因：**
它们只有：

```latex
\begin{tikzpicture}
  ...
\end{tikzpicture}
```

这在某些渲染环境中被认为是**“裸 TikZ 代码”**，没有 `\documentclass`、`\begin{document}` 等完整结构，导致：

- **TeX 引擎无法识别为一个完整文档**，从而编译失败；
- 或者渲染器直接报错，比如“Missing \begin{document}”。

---

### ✅ 解决方案（通用写法）：
如果你想让 TikZ 图在任何地方都能渲染，**推荐使用完整文档结构**：

```tikz
\documentclass[tikz]{standalone}
\begin{document}
\begin{tikzpicture}
  \draw (0,0) circle[radius=1cm];
  \draw (0,0) -- (45:1cm);
\end{tikzpicture}
\end{document}
```

> 注意：`standalone` 类是专门用于 TikZ 图的，能避免多余空白页。

---

### 总结一句话：
> **中间那个能渲染，是因为它包含了完整的 LaTeX 文档结构，而第一和第三个没有。**