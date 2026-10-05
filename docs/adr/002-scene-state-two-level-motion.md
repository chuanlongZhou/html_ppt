# ADR-002 Scene / State 模型与两级动画

- 状态：已采纳（M0）
- 背景：评审意见 c1 要求把 Scene/State 作为一等公民，而不是 slide 的分组元数据；c2 要求讲述推进、用户交互、AI 分析最终统一为状态转换。
- 决定：
  - Canonical IR 只有 Scene；不写 states 的 scene 等价于只有一个 State。
  - State = 可见对象集合 + 累积的属性覆盖 + 可选布局，是纯数据。
  - 动画分两级：State 内用 steps（编译为 fragments），State 间用 morph（编译为 Auto-Animate）。这与 PowerPoint 的"自定义动画 + 平滑切换"一一对应，是 M1 复刻 PPTX 的基础。
  - Scene 之间不做 morph；需要连续就合并成同一个 Scene。
- 后果：M3 的交互可视化可以复用同一份 State 数据，只需替换渲染策略（单 DOM、状态驱动）。
