# html_ppt 执行计划 v1.1

> **状态**：执行基线。本文取代立项文档 v0.1，成为开发依据。v0.1 与评审意见 c1、c2 归档在 `archive/proposal-v0.1/`，作为长期愿景参考。
> **日期**：2026-10-05（v1.0）；v1.1 同日更新，M0 已完成

## v1.2 变更（M0.5：根据 M0 验收反馈）

| 变更 | 说明 |
|---|---|
| 效果库**分类**：5 个类别 × 分组（页面版式、页内动画、状态切换、交互数据、位图操作），条目必须声明 `group` | INDEX.md、浏览器、演示说明条都按分类组织 |
| 效果库**浏览器**：dev 首页列出全部条目（缩略图、搜索、分类标签），点开可逐步预览、复制 `use:` 一行或完整 YAML；`npm run gallery` 生成离线版 | `engine/src/gallery.ts` |
| **交互数据**（从 M3 提前第一部分）：`chart` 组件，讲述驱动 + 自由探索 + 进页复位 + 同页联动；6 个条目 | ADR-007；剩余部分仍在 M3 |
| **位图操作**：图片 `zoom` / `filter`、图片坐标标注（`on` + `box`）、`spotlight`；6 个条目，以及两张示例位图 | ADR-008 |
| **居中问题修复**：shape 默认内边距随尺寸自适应；QA 改为检查文字块是否落在扣除内边距后的内容区内（原 scrollHeight 检查漏掉了这类问题） | 修复了 6 处文字挤压 |
| 效果库条目：25 → 37 | page 12 · build 7 · morph 6 · interact 6 · image 6 |

## v1.1 变更（M0 完成后）

| 变更 | 原因 | 影响 |
|---|---|---|
| 新增**效果库**：`engine/library/`，每个条目 = 提示词 + 适用场景 + 可用的 scene；`use:` 继承、`{library: …}` 演示；`INDEX.md` 自动生成 | 用户需求：场景/效果 ↔ 提示词配对，长期维护、持续扩充 | ADR-005；M0 交付 25 个条目（12 页面设计、7 页内动画、6 状态切换） |
| 规则与 skill **工具中立**：`AGENTS.md` + `agents/` 是唯一来源，`CLAUDE.md` 引用它，`.claude/` 由 `npm run agents:sync` 生成 | 用户需求：兼容 Codex、DeepSeek 等一般 AI 工具 | ADR-006；§8.1 的文件布局相应调整 |
| Skill 从 4 个调整为 5 个：deck-author、deck-motion、library-curate、engine-dev（M0），pptx-import（M1） | 效果库需要独立的维护流程 | §3.1 上限改为 5 |
| Reveal.js 官方文档：暂不系统参考，依据 6.0.2 源码与类型定义开发；同类 bug 反复出现时再系统查阅 | 用户决定 | ADR-001、engine-dev skill |
| M0 提前交付 `--film`（morph 中间帧）与 `use:` 模板继承 | 验证 morph 必须看中间帧；效果库需要"一句话调用" | 原计划放在 M1 |

---

## 0. 结论

1. **项目可行。** 核心技术链路已在本机实测（见 §2.1）：Reveal.js 6.0.2 仍提供 Auto-Animate（包括自定义匹配器 `autoAnimateMatcher`）和 Fragments；PowerPoint 16 可以通过 COM 无窗口导出 1920×1080 PNG 和 MP4 视频；PPTX 里的动画时间轴 XML 可以直接解析。
2. **最大的风险是范围太大，而不是技术做不到。** v0.1、c1、c2 合在一起是一个平台级愿景，包括演示语言、组件市场、交互分析、可视化编辑器和 PPTX 双向转换。本计划把第一阶段压缩成两样东西：**一个确定性编译器，加一套 Claude Code 原生工作流**。
3. **MVP 定位**：把演示文稿变成 Claude Code 可以编译、检查、截图、修改的源代码项目。
4. **第一个硬验收是复刻你提供的带动画 PPT（M1）。** 它验证的是运行时、动画和 QA 这三层。组件、布局、叙事这一语义层，由 M2 的 3 套原生 deck 来验证。两者分开验收，避免互相掩盖问题。
5. **规模上限**（到 M2 为止）：引擎代码不超过 6k 行 TypeScript，依赖不超过 12 个，Skill 4 个，Subagent 1 个（详见 §3）。

---

## 1. 三份文档怎么取舍

| 来源 | 主张 | 决定 | 落点 |
|---|---|---|---|
| v0.1 | Reveal.js 作为运行时，IR 独立于 Reveal | 采纳 | D8 |
| v0.1 | 演示文稿是结构化程序，语义组件优先 | 采纳 | D6 D7 |
| v0.1 | 4 个独立 Agent + 10 个 Skill | 收缩为 1 个主会话 + 1 个独立评审 subagent + 4 个 Skill | §8 |
| v0.1 | 15 种布局、30 多个组件、地图 | 收缩为 `free` + 5 个 recipe、7 个组件；地图延后 | §3 |
| v0.1 | 10 步生成流程 | 合并为 4 步：Brief → Build → Check → Review | §10 |
| v0.1 | QA 从第一天开始做 | 采纳，确定性 QA 是 M0 的交付物 | §9 |
| v0.1 | PPTX 导入/导出放在 P2 | **导入（解析 + 复刻）提前到 M1**，对应你的测试；导出仍然延后 | §7 |
| c1 | Source DSL 和 Canonical IR 分离 | 采纳为代码边界（由 normalizer 负责），不做两种文件格式 | D1 |
| c1 | Scene/State 是一等公民 | 采纳；Slide 就是只有一个 State 的 Scene | D2 |
| c1 | Parser → Normalizer → Layout → Motion Compiler → Renderer | 采纳，压缩成 5 个阶段 | §5 |
| c1 | Agent 是职责而不是进程 | 采纳 | D11 |
| c1 | 用动画意图（motion intent）代替属性动画 | 采纳：intent 映射到 preset 表，用代码实现 | D5 |
| c1 | semantic / instance / motion 三种 ID | 简化：Scene 内的 key 就是身份，`ref` 字段预留给语义 ID | D4 |
| c1 | 组件契约（含动画能力声明） | 采纳；MVP 只实现 schema / render / motion / size 四项 | D7 |
| c1 | 布局基元（primitive）+ 布局配方（recipe） | MVP 只开放 recipe 和 `free`；primitive 只在内部使用 | D6 |
| c1 | 运行时能力模型 | 采纳最小版：一张静态表，用于降级 | D8 |
| c1 | 语义 QA | 纳入 reviewer 检查清单；`purpose` 字段必填 | §9 |
| c1 | Baseline 对比 + 修改局部性（edit locality）指标 | 采纳，放在 M2 | §12 |
| c1 | MVP 用 3 套不同类型的 deck 验证泛化 | 采纳，放在 M2 | §11 |
| c1 | Style Pack 描述设计行为，而不只是 CSS | 采纳最小版：tokens + rules（QA 可读取） | §6 |
| c1 | 引擎与演示项目分离 | 先做目录级分离（engine/ 与 decks/），拆包延后 | §14 |
| c1 | ADR、文档拆分 | 采纳 | docs/ |
| c2 | 交互式可视化是核心差异化 | 认同方向，**M3 实现**；MVP 只在数据模型上预留 | D9 |
| c2 | 讲述推进、用户交互、AI 分析统一为状态转换 | 采纳为架构原则（State 是纯数据），从 M0 起生效 | D2 D9 |
| c2 | 讲述 / 探索双模式，authored state 与 exploration state 分离，可回到讲述 | 写入 ADR，M3 实现 | §13 |
| c2 | 联动视图、自然语言驱动图表 | M4 之后 | §13 |

**为什么 c2 不进 MVP：** Reveal Auto-Animate 的实现方式是"每个 State 一份 DOM 快照，再用 FLIP 插值"，即每个 State 对应一个独立的 `<section>`。交互可视化需要的则是"同一份 DOM，由状态驱动更新"。两者是不同的渲染策略。MVP 先把 State 定义成与渲染策略无关的纯数据；M3 再增加 `strategy: live` 渲染器，复用同一份 State 数据，不需要改数据模型。

---

## 2. 可行性分析

### 2.1 本机实测（2026-10-05）

| 项目 | 结果 | 对方案的影响 |
|---|---|---|
| Node.js | v22.20.0 | 引擎使用 TypeScript，由 `tsx` 直接运行，不需要编译步骤 |
| Python | 3.7.6（过旧，新版 python-pptx 不支持） | **不引入 Python**。PPTX 解析用 Node（jszip + XML 解析），全项目单一技术栈 |
| Reveal.js | npm 最新版 6.0.2。已确认包含 `autoAnimate`、`autoAnimateMatcher`、`autoAnimateStyles`、fragments、`pdfSeparateFragments`、scroll view | 运行时能力满足 MVP |
| PowerPoint | 16.0，COM 可用。实测流程：无窗口新建 → 导出 1920×1080 PNG ✓ → 导出 MP4 ✓ | 可以作为 PPTX 复刻的"真值"渲染器 |
| PPTX 动画 XML | `p:timing` 中的 presetID、presetClass、nodeType（click / with / after）、delay、dur、spTgt 都可以读到；切换效果放在 `mc:AlternateContent` 中（p14/p15/p159 命名空间） | 导入器必须处理 AlternateContent |
| COM 枚举 | 用 COM 设置 Morph 切换不可靠：实测设置 3953，保存结果却是 origami | 导入器**只读 XML**，不依赖 COM 枚举 |
| 浏览器 | 已安装 Edge，未安装 Chrome | Playwright 使用 `channel: 'msedge'`，不需要另外下载浏览器 |
| ffmpeg | 未安装 | 用 `ffmpeg-static`（npm 包）抽取 PPT 视频帧 |
| git | 2.27；当前目录还不是仓库 | M0 执行 `git init`（修改局部性指标依赖 git diff） |

### 2.2 各子系统可行性

| 子系统 | 难度 | 判断 |
|---|---|---|
| DSL + schema + 校验（报错带 YAML 行号） | 低 | 用 zod + yaml 直接实现 |
| 布局（slot 计算 + `free` 绝对坐标） | 低 | slot 矩形在 TS 里计算，slot 内部内容交给 CSS 排版 |
| 构建动画（fragment presets） | 低-中 | Reveal fragment + 自定义 CSS class。同一对象有多个效果时需要嵌套 wrapper，由编译器自动生成 |
| State 之间的 Morph | 中 | Auto-Animate 够用。已知限制：嵌套元素同时匹配、SVG 内部元素、逐字 morph。用编译规则和降级处理。简单形状（矩形、圆角矩形、椭圆）用 div 渲染，可以插值尺寸、圆角和颜色；复杂形状用 SVG，只做位置和缩放 morph |
| 截图：逐步截图、过渡中间帧 | 中 | 用 Playwright 驱动 Reveal API。中间帧通过 `document.getAnimations()` 暂停动画并定位到指定时间；不成功时退回慢放截图 |
| DOM QA（溢出、越界、重叠、缺图、字体回退） | 低-中 | 在浏览器内运行检查脚本 |
| PPTX 解析 → deck 草稿 | **中-高**（M1 最大的工作量） | 只覆盖形状、文本、图片、组合、主题、占位符继承的常见子集。长尾内容（SmartArt、图表、3D、视频）退化为图片 |
| PPT 动画映射 | 中 | 精确映射最常用的约 15 种 preset，其余近似处理，并写进映射报告 |
| PDF 导出 | 低 | Reveal print-pdf 模式 + Playwright |
| 交互可视化（c2） | 高 | 需要 live 运行时，放到 M3 |
| PPTX 导出、可视化编辑器 | 高 | 延后 |

### 2.3 主要风险与对策

| # | 风险 | 对策 |
|---|---|---|
| R1 | 为了复刻 PPTX，系统被拉回绝对坐标思维 | 分两段：**faithful**（`free` 布局，追求还原度）和 **semanticize**（Claude 改写成 recipe/组件，用 compare 检查是否退化）。两段分别验收 |
| R2 | 文字排版与 PowerPoint 有差异（行高、字距、自动缩放、字体） | 使用同名系统字体；映射 `normAutofit` 的 fontScale 和 lnSpcReduction；compare 对文字区域放宽阈值 |
| R3 | 母版、版式、占位符的继承关系复杂 | 只解析位置、文本样式级联（master → layout → slide）和背景，其余用真值图校验 |
| R4 | 动画效果种类太多（PowerPoint 有上百种 preset） | 精确实现常用的约 15 种，其余降级为 fade，并在 import 报告中标注。**优先实现测试 PPT 实际用到的效果** |
| R5 | Claude 做视觉评审时截图消耗 token 太多 | 先看 contact sheet 总览；按内容哈希只重拍发生变化的 scene |
| R6 | 范围蔓延 | 遵守 §3 的数字上限。新组件和新 preset 必须由真实 deck 的需求驱动，不预先做"可能用得上"的组件 |
| R7 | PowerPoint 只能在 Windows 上运行 | 只在导入时用它生成真值，引擎本身跨平台 |

---

## 3. 范围约束

### 3.1 规模上限（到 M2 结束）

| 维度 | 上限 |
|---|---|
| Schema 核心概念 | 6 个：deck / scene / state / step / object / style |
| 布局 | `free` + 5 个 recipe：hero、title-body、split、grid、full-bleed |
| 组件 | 7 个：text、shape、image、group、table、metric、chart（bar/line），另加一个 `html` 原始 HTML 出口 |
| 动画 | 不超过 25 个 preset（进入 / 强调 / 退出），加 3 个 State 意图：morph、focus、camera |
| 风格 | 1 套内置 style，加上导入 deck 时自动生成的 theme |
| Skill / Subagent | 5 / 1（v1.1：新增 library-curate） |
| CLI 命令 | 不超过 8 个 |
| npm 依赖 | 不超过 12 个 |
| 引擎代码 | 不超过 6k 行 TS |

### 3.2 到 M2 为止明确不做

GUI 编辑器；PPTX 导出；视频导出（QA 用的录屏除外）；实时协作；地图组件和 GeoJSON；交互式图表和探索模式；D3/ECharts 集成；风格市场；多运行时；SVG 路径 morph；3D/WebGL；PPT 触发器、超链接动作、音视频。

动作路径（motion path）是否在 M1 实现，看测试 PPT 有没有用到。

---

## 4. 核心设计决策

这些决策会在 M0/M1 中写成 ADR，放在 `docs/adr/`。

**D1 作者写 Source，机器处理 IR。** Claude 写 `deck.yaml`，允许简写、默认值、slot 和 intent。`normalize` 阶段输出 Canonical IR，所有信息都是显式的：每个 State 的完整对象集合、绝对 frame、fragment 序号、具体 preset。IR 只是内存中的 TS 类型，可以用 `build --ir` 输出 JSON 用于调试，不单独设计文件格式。
*为未来保留*：Markdown、PPTX 导入等其他输入格式，都编译到同一个 IR。

**D2 Scene 是一等公民。** Canonical IR 里只有 Scene。Scene 是一组有视觉连续性的 State：State 之间默认 morph，Scene 之间不 morph（需要连续就合并成同一个 Scene）。源文件里写 `slide`（不写 states）时，等价于只有一个 State 的 Scene。State 是"可见对象集合 + 属性覆盖"的纯数据。

**D3 两级动画。** State 内部的点击构建（steps）编译为 Reveal fragments；State 之间的变化编译为 Auto-Animate 的一对 section。这与 PowerPoint 的"自定义动画 + 平滑切换（Morph）"一一对应，**这是 PPT 复刻可行的关键**。

**D4 对象身份。** 对象在 Scene 的对象池里用 key 定义一次，所有 State 通过 key 引用它。编译器生成 `data-id="<scene>.<key>"`，天然唯一，且跨 State 保持稳定。另预留 `ref:` 字段存放语义 ID（例如 `city.delhi`），供 M3 的数据绑定和联动视图使用。

**D5 动画写语义，不写关键帧。** 作者写 `effect: fade-up` 或 `transition: { intent: focus, target: map }`。preset 表和 intent 的展开规则用 TS 实现（Motion Grammar v0），AI 不写 keyframes。例外：导入的 deck 允许写精确参数以保证还原度，例如 `effect: { preset: fly-in, from: left, duration: 500, delay: 200 }`。

**D6 布局。** recipe 定义一组命名 slot，slot 的矩形由 TS 根据 stage 尺寸和间距 token 计算，slot 内的内容由 CSS 排版。`layout: free` 时每个对象必须带 `frame: [x, y, w, h]`，坐标系是 1920×1080。导入的 deck 默认使用 free。recipe 内部用 Stack/Grid/Overlay 等 primitive 实现，但 primitive 暂不暴露给 DSL。

**D7 组件契约。** 组件定义形如 `defineComponent({ name, schema, render(props, state, ctx), motion: [...], interaction: [], size })`：schema 用 zod，render 返回 HTML 字符串，`interaction` 暂时留空。组件目录 `engine/CATALOG.md` 由 schema 自动生成，Claude 读这份目录，而不是读组件源码。

**D8 运行时适配层。** IR 中不出现任何 Reveal 概念。`runtime/reveal/` 是唯一知道 `<section>`、`data-auto-animate`、`fragment` 的地方。`capabilities.ts` 用一张静态表声明支持程度（例如 `pathMorph: false` 时降级为交叉淡化），编译器据此降级，并把降级记录到报告里。

**D9 以 State 为先，为交互做好准备。** State 是纯数据，渲染策略可以替换。MVP 只有 `sections` 策略：每个 State 一个 section，加 Auto-Animate。M3 增加 `live` 策略：单份 DOM，组件订阅 state；fragment 事件、用户交互、AI 指令都只是在写 state。实际渲染用的状态按三层合成：effective = base + presentation + interaction。这一规则先写进 ADR，M3 实现。

**D10 LLM 决定 what/why，代码决定 how。** 布局数值、ID、fragment 序号、动画参数、PPT 坐标换算、QA 判定，全部由确定性代码完成。Claude 负责叙事、组件选择、修复决策和视觉评审。

**D11 Agent 是职责，不是进程。** 主会话依次承担 Architect、Engineer、Motion 三种职责，通过 Skill 加载对应知识。只有 Reviewer 是独立 subagent：独立上下文可以避免自我确认偏差。

---

## 5. 架构

```text
   Claude Code 主会话（skills: deck-author · deck-motion · pptx-import · engine-dev）
        │ 写源文件                                       ▲ 读 report.json / PNG / IR
        ▼                                               │
  decks/<name>/deck.yaml ◄── import ◄── archive/reference/*.pptx
        │
        ▼  engine（全部为确定性代码）
  ┌───────────────────────────────────────────────────────────────┐
  │ 1 parse + validate     yaml + zod，报错带行号                 │
  │ 2 normalize + resolve  填默认值、slot → frame、style tokens  → IR │
  │ 3 motion compile       steps → fragment 序号、intent → preset、跨 State 匹配 │
  │ 4 render               runtime adapter（reveal）→ site/index.html │
  │ 5 qa                   Playwright + Edge：逐步截图、DOM/动画检查、contact sheet │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  output/<name>/  site/（可离线放映）  qa/  compare/  export/
        ▲
  deck-reviewer subagent（只读：截图 + 报告 + 源文件 → critical / major / minor）
```

---

## 6. Deck 源格式（草案，在 M0 定稿）

```yaml
deck:
  title: 印度城市排放
  stage: [1920, 1080]
  style: default                  # engine/styles/default：tokens + rules
  story:                          # Architect 职责的产出，留在源文件里，便于长期维护和语义 QA
    thesis: 排放高度集中在少数城市，电力部门主导增长
    audience: 城市政策研究者
    duration: 20min

scenes:
  - id: cover                     # 不写 states = 单 State（普通 slide）
    purpose: 开场，给出结论
    layout: hero
    objects:
      title: { type: text, role: title, text: 印度城市排放高度集中 }
      sub:   { type: text, role: subtitle, text: 2024 城市清单 }

  - id: india                     # 多 State 的 Scene：State 之间 morph
    purpose: 从全国尺度聚焦到 Delhi
    layout: split
    objects:                      # 对象池：key 就是跨 State 的身份
      title: { type: text, role: title, slot: top, text: 排放集中在少数城市 }
      map:   { type: image, src: assets/india.svg, slot: right }
      total: { type: metric, slot: left, value: 3100, unit: MtCO2, label: 年排放, source: "EDGAR 2024" }
      delhi: { type: text, role: callout, frame: [1280, 400, 360, 120], text: Delhi 占 8% }
    states:
      - show: [title, map]
        steps:                    # 每一项是一次点击
          - { enter: total, effect: fade-up }
      - show: [title, map, total, delhi]
        transition: { intent: focus, target: map, duration: 800 }
        override:
          map:   { frame: [560, 0, 1360, 1080] }
          title: { text: Delhi 是最大的单体排放城市 }
        notes: 这里停顿，等听众看清 Delhi 的位置

  - id: s07                       # 导入 deck 的典型写法：free 布局 + 精确参数
    layout: free
    objects:
      card: { type: shape, geom: roundRect, frame: [120, 300, 520, 360], fill: accent1 }
      t1:   { type: text, frame: [160, 340, 440, 80], text: 第一点, style: { size: 40, weight: 700 } }
      t2:   { type: text, frame: [160, 440, 440, 160], text: 说明文字 }
    states:
      - steps:
          - { enter: card, effect: { preset: fly-in, from: bottom, duration: 500 } }
          - - { enter: t1, effect: fade }                          # 第 2 次点击：t1、t2 一组
            - { enter: t2, effect: fade, after: true, delay: 200 } # t2 在 t1 结束 200ms 后出现
```

Style 由两部分组成：`tokens.css`（颜色、字号、间距、圆角）和 `rules.yaml`（例如每个 State 最多多少字、每个 Scene 最多几个动画、标题是否左对齐）。QA 会读取 rules。

---

## 7. PPTX 复刻管线（M1，对应你的测试）

### 7.1 流程

```text
archive/reference/x.pptx
  │  npm run import -- archive/reference/x.pptx --name x
  ├─► output/_import/x/dump.json    结构化提取：形状、文本、主题、动画时间轴、切换效果
  ├─► output/_import/x/ref/         PowerPoint 真值：每页 PNG、每次点击后的 PNG、MP4、关键帧
  ├─► output/_import/x/report.md    映射报告：精确 / 近似 / 不支持 / 退化为图片
  └─► decks/x/deck.yaml + assets/ + theme.css     确定性代码生成的草稿（free 布局）
  │
  │  npm run check -- x       截图 + DOM / 动画 QA
  │  npm run compare -- x     output/x/compare/：左 PPT、右 Web 的逐步对比图 + 差异热图 + 分数
  ▼
Claude（pptx-import skill）：处理报告里的近似项和不支持项 → 修改 deck.yaml → 循环
  ▼  （可选的第二段）semanticize：把 free 改写为 recipe 和组件，compare 结果不能退化
```

**每次点击后的真值怎么得到：** 复制一份 PPTX，按动画时间轴把第 k 次点击时还没进入、或已经退出的形状设为隐藏，然后导出 PNG。这样不需要录屏，就能得到准确的逐步静态真值。动画过程中的样子，参考 MP4 抽出的帧。

**草稿由代码生成，而不是由 Claude 手抄坐标。** 抄写几百个坐标正是 LLM 不擅长、代码擅长的事情（D10）。Claude 的工作是处理报告里标出的问题，并做视觉判断。

### 7.2 PowerPoint → Web 映射

| PowerPoint | Web 实现 | M1 |
|---|---|---|
| 16:9 页面（12192000×6858000 EMU） | stage 1920×1080；1px = 6350 EMU，1pt = 2px | ✓ |
| 4:3 等其他页面尺寸 | stage 高度固定 1080，宽度按比例 | ✓ |
| 文本框和占位符（含 master → layout → slide 继承） | text 对象（free frame，带段落和 run 样式） | ✓ |
| 常用预设形状、连接线、自由曲线 | shape：简单形状用 div，其余用 SVG | ✓ |
| 图片（含裁剪）、图片填充 | image | ✓ |
| 组合 | group（递归，保留子对象身份） | ✓ |
| 表格 | table | 基础 |
| 主题颜色和字体、背景 | theme.css tokens、scene 背景 | ✓ |
| 图表、SmartArt、公式、3D、音视频 | 导出为图片（失败时从真值图裁剪），在报告中标注 | 降级 |
| 单击时 / 与上一动画同时 / 上一动画之后 + 延迟 | 新的 fragment 序号 / 同一序号 / 同一序号 + transition-delay | ✓ |
| 进入：出现、淡化、飞入、擦除、缩放、浮入、切入、展开等 | fragment presets（CSS），精确实现约 10 种 | ✓ |
| 强调：脉冲、放大/缩小、变色、透明 | emphasis presets，约 4 种 | ✓ |
| 退出：与进入对称 | exit presets | ✓ |
| 按段落 / 按字 出现 | 拆成段落级子对象分别做 fragment；按字近似为按段 | ✓ / 近似 |
| 动作路径 | CSS keyframes（offset-path） | 看测试 PPT |
| 平滑切换（Morph） | 同一 Scene 的相邻 State + Auto-Animate。对象匹配顺序：`!!` 前缀名称 → 同名 → 相同文本或图片 | ✓ 核心 |
| 其他切换（淡出、推入、擦除、缩放等） | 选最接近的 Reveal transition | 近似 |
| 触发器、超链接动作、排练计时 | 不支持，写进报告 | ✗ |

### 7.3 复刻验收（用你的测试 PPT）

**硬指标（自动检查）**

- H1 页数和 State 数一致（每页 PPT 对应 1 个 State；用 Morph 相连的页归入同一个 Scene）
- H2 PPT 中的每一段文字都出现在输出中（文字覆盖率 100%）
- H3 每一页的点击次数等于 PPT 的点击次数
- H4 Morph 匹配上的对象对数，等于按 PowerPoint 规则（名称或内容）可以匹配的对数
- H5 `check` 报 0 个 error（无溢出、无缺失资源）
- H6 每个动画效果都在报告里归入"精确 / 近似 / 不支持"三类之一；常用效果中"不支持"为 0

**软指标（Reviewer 和你一起判断）**

- S1 逐步对比图中，位置、颜色、字体基本一致
- S2 动画的顺序一致，风格和节奏相近（对比 film 帧和 PPT 视频帧）
- S3 在 Edge 中可以离线打开，支持键盘翻页、全屏和演讲者备注

**记录但不作为门槛**：每页的像素差异比例。

---

## 8. 与 Claude Code 的衔接

### 8.1 文件

v1.1：规则与 skill 改为工具中立，`agents/` 是唯一来源（ADR-006）。

```text
AGENTS.md                        全局规则 + 任务 → skill 路由表（所有 AI 工具共用）
CLAUDE.md                        @AGENTS.md + Claude 专用说明
agents/skills/deck-author/       从需求到 deck：叙事结构、布局/组件/效果库选择、check 循环
agents/skills/deck-motion/       Motion Grammar：何时 morph、何时用点击构建、preset 表、时长与节奏
agents/skills/library-curate/    维护效果库：新增条目、补提示词、从 deck 沉淀
agents/skills/engine-dev/        扩展引擎：新增组件/布局/preset 的契约、测试、已知坑
agents/skills/pptx-import/       （M1）复刻 PPTX：import → check → compare → 修复循环
agents/roles/deck-reviewer.md    独立评审（只读）：内容与语义、视觉、动画、技术四类问题
.claude/skills/ · .claude/agents/ 由 npm run agents:sync 生成
.claude/launch.json              浏览器面板预览：preview_start "deck-dev"
```

### 8.2 CLI 契约：命令就是 Claude 使用的 API

| 命令 | 作用 | 产物 |
|---|---|---|
| `npm run new -- <deck>` | 新建 deck 骨架 | `decks/<deck>/` |
| `npm run build -- <deck> [--ir]` | 校验 + 编译 | `output/<deck>/site/` |
| `npm run check -- <deck> [--scene id] [--film]` | build + 逐步截图 + DOM/动画 QA | `output/<deck>/qa/`：`report.json`、`shots/`、`contact.png`、`film/` |
| `npm run dev` | 所有 deck 的实时预览（源文件改动后自动重建并刷新） | http://localhost:5173 |
| `npm run import -- <pptx> --name <deck>` | PPTX → dump + 真值 + 草稿 | `output/_import/<deck>/`、`decks/<deck>/` |
| `npm run compare -- <deck>` | 与 PPT 真值逐步对比 | `output/<deck>/compare/` |
| `npm run pdf -- <deck>` | 导出 PDF | `output/<deck>/export/deck.pdf` |
| `npm run catalog` | 根据 schema 重新生成组件目录 | `engine/CATALOG.md` |

**约定**

- 命令都是非交互的、幂等的，用 deck 名寻址。
- stdout 只输出不超过 30 行的摘要，完整结果写入 JSON。
- 退出码：0 表示通过，1 表示存在 error，2 表示工具本身故障。
- 每条问题都包含 `code`、位置（`deck.yaml:行号`，以及 scene / state / step / object）和 `hint`（怎么修）。
- 截图路径固定且可预测：`qa/shots/<scene>-s<state>-k<step>.png`。
- 增量执行：只重拍源文件有变化的 scene。

### 8.3 Claude 的标准循环（写入 CLAUDE.md）

```text
改 deck.yaml → npm run check -- <deck> → 读摘要（有 error 先修）
→ 看 contact.png 和相关截图 → 动画看 film 帧，或在浏览器面板里逐步翻页
→ 改动较大时调用 deck-reviewer
```

**完成标准**：`check` 退出码为 0；变化过的 scene 的截图都已查看；导入的 deck 额外要求 compare 不退化。

---

## 9. QA 体系

| 层 | 检查内容 | 实现方式 | 阶段 |
|---|---|---|---|
| Structural | schema、ID 唯一、引用存在、资源文件存在、slot 合法、`purpose` 必填 | 确定性检查，不需要浏览器 | M0 |
| Geometric | 文本溢出、超出 stage、文本互相重叠、图片加载失败、字体回退 | 浏览器 DOM 脚本 | M0 |
| Motion | fragment 数等于源文件 steps 数；morph 匹配对数；同一 section 内 data-id 重复；两个 State 没有共享对象时提示改用普通切换 | 编译期 + DOM | M0 / M1 |
| Fidelity（导入专用） | 文字覆盖率、点击次数、morph 对数、像素差异 | compare | M1 |
| Visual | 构图、层级、信息密度、对齐、一致性 | deck-reviewer 查看 contact sheet | M2 |
| Semantic / Evidence | 标题是否表达论点、视觉是否支撑论点、数字是否有出处 | deck-reviewer 检查清单 + `source` 字段 | M2 |

---

## 10. 精简后的工作流

**原生 deck：4 步，只有 1 个人工检查点**

1. **Brief**：你给出目标、受众、时长和素材。Claude 写入 `decks/<d>/brief.md`，并在 `deck.yaml` 的 `story` 里写下 thesis 和每个 scene 的 purpose。**大纲先给你确认**，这是唯一的中间人工检查点。
2. **Build**：Claude 一次写完 `deck.yaml`：布局、组件、states、steps。
3. **Check**：运行 `npm run check`，Claude 自主修复所有 error。
4. **Review**：deck-reviewer 独立评审，Claude 修复 critical 和 major 问题后交付。

**导入 deck**：Import → Check + Compare → Fix →（可选）Semanticize

（v0.1 的 10 步中，validate、render、visual QA 三步合并成一个 `check` 命令；Story 和 Visual Planning 合并进 Brief 和 Build。）

---

## 11. 里程碑

以下会话数是估计值。

### M0 骨架与最小闭环 ✅ 已完成（2026-10-05）

**实际交付**：

- 引擎五个阶段；5 个组件（text、shape、image、metric、html）；`free` + 5 个 recipe；19 个动画 preset；4 个 State 意图。
- 命令：new、build、check（含 `--film`）、dev、catalog、agents:sync、typecheck。
- 效果库 25 个条目，`decks/library` 用于浏览，`decks/intro` 是项目介绍。
- 文档：AGENTS.md、5 个 agent 文件、ARCHITECTURE.md、ADR-001 到 ADR-006。
- 验收：两套 deck 的 `check` 均为 0 error / 0 warning；写错 key、preset、slot、资源路径时，报告给出行号和修复提示；morph 中间帧已人工核对。

以下为原计划，保留作对照。

- **交付**：`git init`；`package.json`；引擎 5 个阶段的骨架；schema v0；布局 `free` + `title-body`；组件 text / shape / image；preset fade、fade-up、appear；Auto-Animate morph；`build`、`check`、`dev` 命令；示例 deck `decks/_hello`（1 个 3-State 的 morph scene，加 1 个点击构建页）；完整版 CLAUDE.md；`launch.json`；ADR-001 到 ADR-004。
- **验收**：
  - 在全新环境中执行 `npm install`，然后 `npm run check -- _hello` 退出码为 0。
  - 截图覆盖每个 State 和每次点击。
  - 在浏览器面板中 morph 表现正常。
  - 故意写错一个对象 key，报告能给出 `deck.yaml` 行号和修复提示。

### M1 PPTX 复刻（约 2–3 个会话，用你的测试 PPT 验收）

- **交付**：`import` 命令（dump、PNG/MP4/逐步真值、草稿生成、映射报告）；shape 预设子集；group 和 table；主题与继承解析；动画映射（按测试 PPT 实际用到的效果排优先级，至少 15 个 preset）；Morph 匹配；`compare` 命令；`check --film`；pptx-import skill。
- **验收**：§7.3。

### M2 原生生成与泛化（约 3–4 个会话）

- **交付**：
  - 补齐 5 个 recipe；metric 和 chart 组件；focus 和 camera 两个 intent；style rules。
  - deck-author、deck-motion、engine-dev 三个 skill；deck-reviewer subagent；PDF 导出；CATALOG 自动生成。
  - 3 套差异明显的 deck：科研报告、咨询策略、概念教学。
  - Baseline A：给 LLM 同样的输入，让它直接手写 Reveal HTML，作为对照。
- **验收**：3 套 deck 的 `check` 全部通过；按 §12 评分高于 Baseline A；修改局部性测试全部通过。

### M3 状态驱动交互（c2 的第一步）

- **交付**：`strategy: live` 渲染器；chart 组件 state 化（fragment 推进 = 写 state）；探索模式开关，以及"回到讲述"（reset/resume）；两个组件之间的联动选中。
- **验收**：同一份 State 数据，既能由讲述推进，也能由用户点击驱动。

### M4 之后

见 §13。

---

## 12. 评估指标

**修改局部性**：每项用 `git diff --stat` 统计改动的文件数和行数，并用截图 diff 自动发现意外变化的页面。

| 测试 | 通过条件 |
|---|---|
| E1 "所有卡片改成圆角" | 只改 style 或一处组件默认值，最多改 1 个文件；其他 scene 截图没有意外变化 |
| E2 "把某个 scene 移到前面" | 只移动一个 YAML 块，不需要重新生成其他 scene |
| E3 "给某个 scene 加一个 zoom 过渡" | 只改该 scene 的 `transition` |
| E4 "换一套主题色" | 只改 tokens |

**质量评分**：沿用 v0.1 §23 的 100 分制：Story 20 / Visual 20 / Density 10 / Dataviz 10 / Motion 15 / Consistency 10 / Technical 10 / Evidence 5。评分时由 deck-reviewer 盲评（不告诉它作品来自哪个系统），再由你复核。从 M2 起，每次都和 Baseline A 对比。

**工程指标**：20 页 deck 的 `check` 耗时少于 60 秒；`check` 发现的 error，Claude 自主修复的成功率。

---

## 13. 保留的未来目标

| 目标 | 来源 | 已预留的接口 | 阶段 |
|---|---|---|---|
| 交互式可视化、探索模式、回到讲述 | c2 | State 是纯数据（D9）、组件的 `interaction` 字段、能力表 | M3 |
| 联动视图 / crossfilter、用自然语言改图表状态 | c2 | `ref` 语义 ID（D4）、state 三层合成 ADR | M4 |
| 地图、D3/ECharts、Sankey 等组件 | v0.1 | 组件契约（D7） | M3 之后，按需 |
| SVG 路径 morph、逐字 morph、自定义 easing | v0.1 | 能力降级表（D8） | M3 之后 |
| 把布局基元开放给 DSL | c1 | recipe 内部已经在用 primitive | M3 |
| Style packs（academic-clean 等） | v0.1 / c1 | style = tokens + rules | M3 |
| 科研叙事、引用证据 skill | v0.1 | `purpose`、`source` 字段 | M3 |
| 引擎拆包（`packages/` + 独立 CLI） | c1 | engine/ 不引用 decks/ | M3 |
| Codex 等其他 agent（AGENTS.md） | v0.1 | CLI 是通用接口；skill 是纯 markdown | M2 末 |
| PPTX 导出、视频导出 | v0.1 | IR 与运行时无关 | M4 之后 |
| Web UI、可视化编辑、协作 | v0.1 | git 已经提供版本历史 | P2 |
| 自动评估、不同模型/skill 对比 | v0.1 / c1 | §12 的指标和评分表 | 从 M2 起积累 |

---

## 14. 目录结构

```text
html_ppt/
├── AGENTS.md                 所有 AI 工具共用的规则（唯一来源）
├── CLAUDE.md                 @AGENTS.md + Claude 专用说明
├── agents/                   工具中立的 skills/ 与 roles/（纯 Markdown）
├── docs/                     活文档：PLAN.md（本文）、ARCHITECTURE.md、adr/
├── engine/                   【项目源文件】框架源码：编译器、QA、导入器
│   ├── src/                  schema · normalize · layout · motion · components/ · runtime/reveal/ · qa/
│   ├── styles/default/       tokens + rules + style.css
│   ├── library/              效果库：page/ build/ morph/ assets/ + INDEX.md（生成）
│   └── CATALOG.md            由 schema 自动生成
├── decks/                    【演示源文件】每个 deck 一个目录，自包含
│   └── <name>/  deck.yaml  brief.md  assets/  data/
├── output/                   【应用输出】全部由命令生成，可以随时删除重建，不进 git
│   ├── <name>/  site/  qa/  compare/  export/
│   └── _import/<name>/       PPTX 解析结果和 PowerPoint 真值
├── archive/                  【归档 / 参考】只读
│   ├── proposal-v0.1/        立项文档 v0.1、c1、c2 原件
│   └── reference/            外部参考：待复刻的 PPTX、参考图、资料
├── .claude/                  skills/、agents/、launch.json（M0 创建）
└── package.json              工具链入口（M0 创建；node_modules/ 不进 git）
```

**规则**

- Claude 不修改 `archive/`。
- `output/` 不手工修改，只由命令生成。
- deck 用到的所有资源都必须放在 `decks/<name>/` 里面。
- engine 不能引用 decks 里的任何东西。

---

## 15. 下一步

1. 你确认本计划，或者指出要改的取舍。
2. 我实施 M0。
3. 你把带动画的 PPT 放进 `archive/reference/`。**越早越好**：M1 的动画映射会按它实际用到的效果排优先级。
4. M1 完成后，按 §7.3 验收。
