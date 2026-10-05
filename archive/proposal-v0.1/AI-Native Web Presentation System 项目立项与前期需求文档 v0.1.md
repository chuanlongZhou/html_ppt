# AI-Native Web Presentation System
## 项目立项与前期需求文档 v0.1

---

## 1. 项目背景

现有 AI 制作演示文稿的主流路径，仍以“AI 生成 PowerPoint 文件”为核心。该模式适合快速生成传统幻灯片，但存在以下结构性问题：

1. PPTX 的对象模型主要为人工 GUI 编辑设计，并非为 AI 程序化生成和维护设计。
2. AI 很难稳定地操作复杂动画、Morph、对象跨页持续关系和多阶段视觉叙事。
3. 页面通常由大量独立 text box、shape、image 组成，缺少高层语义结构。
4. 跨页面的统一设计风格难以通过组件化方式维护。
5. AI 修改已有页面时，往往需要操作具体对象，而不是“修改一个组件或设计规则”。
6. PPTX 不适合 Git diff、自动验证、自动测试和 Agent 驱动的长期迭代。
7. 高级数据可视化、交互式图表、SVG 动画、动态数据和 Web 能力无法充分利用。

另一方面，Reveal.js、SVG、HTML/CSS、JavaScript、D3/ECharts、Web Animation API 等 Web 技术已经具备成熟的 presentation 和动画基础。

Reveal.js 尤其提供了：

- Slide runtime
- Speaker mode
- Keyboard navigation
- PDF export
- Plugin architecture
- Fragment animation
- Auto-Animate
- 跨页面对象匹配
- HTML / CSS / SVG 原生支持

因此，本项目计划建立一个：

> **以 Reveal.js 为 presentation runtime，以结构化 Presentation IR、组件系统、动画系统和 AI Agent/Skill 体系为上层架构的 AI-native Web Presentation System。**

系统的主要使用方式不是人工拖拽制作页面，而是：

> 用户表达演示目标 → AI 规划故事结构 → AI 选择组件和布局 → AI 生成结构化演示 → 动画设计 → 自动渲染 → 自动 QA → AI 修正。

---

# 2. 项目目标

## 2.1 核心目标

建立一个面向 Claude Code、Codex 等 coding agent 的 AI-native presentation framework，使 AI 能够：

1. 从自然语言、文档、研究材料或数据生成完整 presentation。
2. 自动规划演示逻辑和叙事结构。
3. 使用预定义的视觉组件、布局和设计系统生成高质量页面。
4. 大量使用 Reveal.js Auto-Animate 或自定义 Morph 机制进行跨页连续动画。
5. 使用 SVG、HTML 和数据可视化组件表达复杂信息。
6. 后续通过自然语言持续修改 presentation。
7. 保持整个演示的视觉一致性、对象身份和动画一致性。
8. 自动检测布局、overflow、资源、动画 ID 等错误。
9. 支持 Git/version control。
10. 最终输出可直接浏览器演示的静态 Web presentation。

---

## 2.2 长期目标

长期希望系统从：

> AI 帮助写 Reveal.js

发展为：

> AI 操作一个完整的结构化 Presentation Language。

最终形成：

```text
User Intent
    ↓
Presentation Planner
    ↓
Presentation IR
    ↓
Component / Layout / Motion System
    ↓
Renderer
    ↓
Reveal.js / Web
```

Reveal.js 应被视为可替换的底层 runtime，而不是整个项目的数据模型。

---

# 3. 项目不解决的问题

第一阶段明确不追求：

### 3.1 不做完整 PowerPoint 替代品

第一阶段不开发类似 PowerPoint 的完整拖拽式 GUI 编辑器。

用户的主要编辑方式为：

- 自然语言
- Claude Code
- Codex
- YAML / JSON
- Markdown
- source code

---

### 3.2 不以 PPTX 为主格式

项目 source of truth 不使用 `.pptx`。

未来可以开发：

```text
Presentation IR
    ↓
PPTX exporter
```

但 PPTX 仅作为交付格式之一。

---

### 3.3 第一阶段不追求所有动画类型

主要优先实现：

- Fade
- Reveal
- Progressive disclosure
- Object persistence
- Position morph
- Scale morph
- Opacity morph
- Color morph
- SVG morph
- Camera/zoom
- Chart progressive animation

复杂 motion path、3D/WebGL 等作为后续能力。

---

# 4. 核心设计原则

## 4.1 Presentation 是结构化程序，而不是页面图片

系统不把演示理解为：

```text
Slide 1
Slide 2
Slide 3
```

而理解为：

```text
Presentation
├── Story
├── Sections
├── Scenes
├── Objects
├── Components
├── States
├── Data
├── Motion
└── Theme
```

---

## 4.2 优先语义，避免低层对象操作

AI 应优先生成：

```yaml
component: MetricCard
value: 120
unit: MtCO2
```

而不是：

```text
rectangle
textbox
textbox
line
```

控制层级优先级：

```text
Semantic component
        ↓
Layout primitive
        ↓
SVG / HTML
        ↓
absolute-position element
```

越往下层，使用频率应越低。

---

# 5. Presentation IR

Presentation IR 是整个项目最关键的数据层。

它应独立于 Reveal.js。

示例：

```yaml
deck:
  title: Indian Urban CO2 Emissions
  theme: research-light

sections:
  - id: context
    title: Urban transition

slides:

  - id: india-emissions

    purpose: establish-scale

    layout: split-40-60

    title:
      text: India's urban emissions are highly concentrated

    elements:

      - id: india-map
        component: IndiaMap
        position: right

        data:
          src: data/cities.geojson

        highlight:
          - Delhi
          - Mumbai

      - id: emission-total
        component: MetricCard

        value: 3100
        unit: MtCO2

        emphasis: primary

    transition:
      type: morph
      duration: 800
```

Renderer 将其转换成：

```text
Presentation IR
      ↓
Reveal Renderer
      ↓
HTML + CSS + SVG
```

---

# 6. Slide 与 Scene 模型

系统应支持两种概念：

### Slide

传统独立页面。

### Scene

多个连续状态组成的视觉叙事。

例如：

```text
Scene: India Emission

State 1
India overview

↓ Morph

State 2
Zoom into Delhi

↓ Morph

State 3
Show emission sectors

↓ Morph

State 4
Show time series
```

对应 Reveal：

```html
<section data-auto-animate>
...
</section>

<section data-auto-animate>
...
</section>
```

这些页面实际上属于同一个 Scene。

---

# 7. Persistent Object Identity

所有跨页持续存在的对象必须具有稳定 ID。

例如：

```text
map.india
map.delhi
metric.total-emission
chart.power
label.population
```

Reveal 中：

```html
data-id="map.india"
```

Presentation IR 中：

```yaml
id: map.india
```

对象 ID 是 Morph 系统的核心。

---

# 8. Morph / Motion 设计模型

动画不应被理解为视觉装饰，而应被理解为：

> 信息状态变化。

每次 transition 至少区分：

```text
persistent
enter
exit
transform
```

例如：

```yaml
motion:

  persistent:
    - map.india

  enter:
    - map.delhi-boundary

  exit:
    - label.country

  transform:

    map.india:
      scale: 2.4
      translate:
        x: -220
        y: 40
```

系统应优先使用：

```text
same semantic object
→
same ID
→
state interpolation
```

而不是手工写 animation timeline。

---

# 9. 系统总体架构

```text
                         USER
                           │
                           ▼
                 Claude Code / Codex
                           │
                    Main Orchestrator
                           │
             ┌─────────────┼──────────────┐
             │             │              │
             ▼             ▼              ▼
       Deck Architect   Slide Engineer   Reviewer
                             │
                       Motion Director
                             │
                ┌────────────┼────────────┐
                │            │            │
              Skills      Components     Tools
                │
                ▼
                  Presentation IR
                         │
                         ▼
                     Renderer
                         │
                         ▼
                     Reveal.js
                         │
               HTML + CSS + SVG
                         │
                         ▼
                      Browser
```

---

# 10. Agent 体系

第一阶段设置 4 个核心 Agent。

---

## 10.1 Deck Architect

### 职责

负责 presentation 的信息结构和叙事结构。

回答：

> 为什么需要这一页？

而不是：

> 这一页应该放在哪个坐标？

输入：

- 用户目标
- audience
- presentation duration
- source material
- key message
- expected outcome

输出：

```yaml
thesis:

sections:

slides:

  - id:
    purpose:
    core_message:
    evidence:
    visual_role:
```

主要关注：

- Story arc
- Slide purpose
- Argument sequence
- Evidence ordering
- Section structure
- Presentation pacing

---

# 10.2 Slide Engineer

主要生产 Agent。

负责：

```text
Presentation plan
      ↓
Presentation IR
      ↓
components/layout
```

主要任务：

- 选择 layout
- 选择 component
- 编写 Presentation IR
- 创建 SVG
- 创建 chart
- 管理 data/assets
- 编译页面
- 修复 QA 问题

---

# 10.3 Motion Director

负责所有：

- Morph
- Auto-Animate
- Progressive disclosure
- State transition
- Object persistence
- Animation timing
- SVG animation

核心任务不是：

> 给页面加动画。

而是：

> 判断信息应该如何通过状态变化被理解。

---

# 10.4 Deck Reviewer

独立于 Builder。

负责检查：

### 内容

- story coherence
- redundancy
- evidence
- slide purpose

### 视觉

- visual hierarchy
- alignment
- density
- whitespace
- consistency

### 动画

- persistent object correctness
- animation usefulness
- timing
- unnecessary effects

### 技术

- overflow
- clipping
- duplicate IDs
- asset errors
- schema errors

输出：

```yaml
critical:

major:

minor:
```

---

# 11. Skill 系统

Agent 负责判断和协调。

Skill 负责具体工作流程。

第一阶段建立以下 Skills。

---

## 11.1 reveal-core

负责 Reveal.js 基础机制：

- section
- vertical slides
- fragments
- notes
- plugins
- config
- lifecycle
- navigation
- PDF export
- Auto-Animate

---

## 11.2 slide-layout

提供标准 Layout Library。

第一阶段至少支持：

```text
hero
section
title-body
split
split-40-60
split-60-40
comparison
three-column
full-bleed
metric-grid
chart-main
chart-commentary
map-story
timeline
quote
closing
```

原则：

> AI 优先选择已有 layout，而不是自由计算位置。

---

## 11.3 visual-system

定义完整 design system：

### Typography

- title
- heading
- body
- label
- caption
- annotation

### Color

- background
- primary text
- secondary text
- accent
- categorical palette
- semantic colors

### Geometry

- border
- radius
- line weight
- spacing
- grid

### Design tokens

例如：

```css
--font-display
--font-body

--text-xl
--text-lg
--text-md

--space-1
--space-2
--space-3

--accent
--background
```

---

# 11.4 morph-motion

负责：

- Auto-Animate
- persistent ID
- transition grouping
- easing
- duration
- morph state
- enter/exit behavior

必须规定：

### 应该使用 Morph 的情况

同一个语义对象发生：

- position
- size
- scale
- emphasis
- context
- state

变化。

### 不应该使用 Morph

完全切换主题或语义对象无连续关系。

---

# 11.5 svg-graphics

负责生成：

- diagram
- flow
- architecture
- map
- annotation
- arrows
- icons
- geometric illustration

原则：

> 可结构化图形优先使用 SVG，而不是 raster image。

---

# 11.6 data-viz

负责：

- line
- area
- bar
- scatter
- histogram
- map
- timeline
- Sankey
- matrix
- network

Renderer 可使用：

- SVG
- D3
- ECharts

Presentation IR 不直接保存复杂绘图代码，而保存 chart specification。

---

# 11.7 asset-manager

负责：

```text
images/
icons/
svg/
fonts/
video/
data/
```

包括：

- naming
- file organization
- relative path
- image crop
- aspect ratio
- transparent background
- asset deduplication

---

# 11.8 visual-qa

负责自动 QA。

检查：

- text overflow
- object overflow
- overlap
- clipping
- invalid IDs
- duplicated IDs
- missing assets
- invalid layout
- extreme text density
- inconsistent font
- invalid Morph references

---

# 11.9 scientific-storytelling

科研 presentation 专用。

要求每个主要 slide 明确：

```text
claim
evidence
mechanism
uncertainty
implication
```

避免简单复制：

```text
Introduction
Methods
Results
Discussion
```

论文结构。

---

# 11.10 citation-evidence

负责：

- citation
- DOI
- source
- figure attribution
- footnote
- data source

保证科研 presentation 的 evidence traceability。

---

# 12. Component Registry

Component Library 是系统的重要长期资产。

第一阶段建议建立：

### Text

```text
HeroTitle
SectionTitle
BodyText
Callout
Quote
Caption
```

### Metrics

```text
MetricCard
BigNumber
MetricComparison
```

### Figures

```text
ResearchFigure
ImagePanel
BeforeAfter
```

### Charts

```text
LineChart
AreaChart
BarChart
ScatterPlot
Sankey
```

### Maps

```text
WorldMap
CountryMap
CityMap
Choropleth
LocationMap
```

### Structure

```text
Timeline
ProcessFlow
ComparisonPanel
ConceptDiagram
ArchitectureDiagram
```

每个 component 必须定义：

```text
semantic inputs
style defaults
layout behavior
animation behavior
```

例如：

```yaml
component: MetricCard

value: 3.1

unit: Gt CO2

label: Annual emissions

trend:
  value: -12
  direction: down
```

---

# 13. Style Pack

视觉风格不应该主要由 Agent 临时生成。

应建立 Style Pack。

例如：

```text
styles/

academic-clean/
minimal-data/
dark-technical/
editorial/
consulting/
handdrawn/
```

每个 style 包括：

```text
tokens.json
theme.css
layouts/
components/
examples/
STYLE.md
```

AI 可以直接：

```text
Use style: academic-clean
```

---

# 14. 项目文件结构

初步建议：

```text
reveal-ai/
│
├── AGENTS.md
├── CLAUDE.md
│
├── presentation/
│   ├── deck.yaml
│   └── slides/
│       ├── 001.yaml
│       ├── 002.yaml
│       └── ...
│
├── src/
│
│   ├── renderer/
│
│   ├── components/
│
│   ├── layouts/
│
│   ├── motion/
│
│   ├── theme/
│
│   └── runtime/
│
├── styles/
│
├── skills/
│   ├── reveal-core/
│   ├── slide-layout/
│   ├── visual-system/
│   ├── morph-motion/
│   ├── svg-graphics/
│   ├── data-viz/
│   ├── asset-manager/
│   ├── visual-qa/
│   ├── scientific-storytelling/
│   └── citation-evidence/
│
├── .claude/
│   ├── agents/
│   │   ├── deck-architect.md
│   │   ├── slide-engineer.md
│   │   ├── motion-director.md
│   │   └── deck-reviewer.md
│   │
│   └── skills/
│
├── data/
│
├── assets/
│
└── scripts/
    ├── build.ts
    ├── validate.ts
    ├── render.ts
    ├── screenshot.ts
    └── qa.ts
```

---

# 15. Claude Code / Codex 接入原则

系统应同时兼容：

- Claude Code
- Codex
- 未来其他 coding agents

因此 Agent/Skill 内容应尽量：

> framework-independent。

---

## 15.1 AGENTS.md / CLAUDE.md

只保存全局约束。

例如：

```text
Reveal.js is the presentation runtime.

Presentation YAML is the source of truth.

Prefer semantic components over raw HTML.

Prefer SVG over raster graphics when graphics are structured.

All persistent objects must use stable IDs.

Always run validation and visual QA after major changes.
```

不存储具体实现教程。

---

## 15.2 Skill

存放：

> 如何完成某种具体工作。

例如：

```text
morph-motion
```

描述：

> Create and modify Reveal Auto-Animate transitions, persistent object IDs, state changes and motion timing.

Agent 根据 description 判断什么时候调用。

---

# 16. 标准 Presentation 生成流程

系统默认工作流程：

---

## Step 1 — Requirement Understanding

输入：

- topic
- audience
- duration
- source material
- presentation purpose
- visual style
- constraints

---

## Step 2 — Story Architecture

Deck Architect 输出：

```text
thesis
sections
slide sequence
slide purpose
key evidence
```

---

## Step 3 — Visual Planning

为每个 slide 决定：

```text
visual role
layout
primary component
secondary component
```

例如：

```text
Slide 5

purpose:
show spatial concentration

visual:
map-driven

layout:
full-bleed-map
```

---

## Step 4 — Motion Planning

Motion Director 找出：

```text
Scene groups
persistent objects
Morph sequences
enter/exit objects
```

---

## Step 5 — Build

Slide Engineer：

```text
Presentation IR
↓
components
↓
SVG / chart
↓
Reveal
```

---

## Step 6 — Deterministic Validation

执行：

```text
npm run validate
```

检查结构问题。

---

## Step 7 — Render

自动生成所有页面 screenshot。

```text
npm run render
```

---

## Step 8 — Visual QA

Reviewer 检查：

```text
layout
hierarchy
overflow
animation
consistency
story
```

---

## Step 9 — Revision

Slide Engineer 根据 Reviewer 问题修改。

---

## Step 10 — Final Export

输出：

```text
Static Web
PDF
Screenshots
```

后续可增加：

```text
PPTX
Video
GIF
```

---

# 17. 自动 QA 要求

项目必须从一开始就具备 QA，而不是后期增加。

---

## 17.1 Structural QA

检查：

```text
schema validation
unique slide ID
unique object ID
valid component
valid layout
valid data references
```

---

## 17.2 DOM QA

检查：

```text
text overflow
bounding box overflow
object collisions
missing assets
broken SVG
```

---

## 17.3 Motion QA

检查：

```text
duplicate morph IDs
missing morph target
orphan persistent object
invalid scene transition
```

---

## 17.4 Visual QA

由 vision / AI reviewer 检查：

```text
composition
hierarchy
density
alignment
consistency
legibility
```

---

# 18. 第一阶段功能需求

## P0 — 必须

### Presentation

- Reveal.js runtime
- horizontal slides
- Auto-Animate
- speaker notes
- fullscreen
- PDF export

### IR

- YAML / JSON schema
- slide
- scene
- element
- component
- layout
- transition

### Components

至少：

```text
Title
Text
Image
Metric
SVG
Chart
Map
Quote
```

### Layout

至少 10–15 种。

### Motion

- persistent object
- fade
- move
- scale
- opacity
- Reveal Auto-Animate

### AI

- Claude Code
- Codex
- Agent instructions
- Skill routing

### QA

- schema validation
- overflow detection
- screenshot rendering
- visual inspection

---

# 19. P1 功能

项目稳定后增加：

```text
SVG path morph
animated chart
diagram animation
camera zoom
component-level animation presets
custom easing
responsive presentation
multiple aspect ratios
```

以及：

```text
style packs
template library
component marketplace
```

---

# 20. P2 功能

长期能力：

```text
visual editor
drag and drop
AI chat editing
PPTX import
PPTX export
video export
real-time collaboration
version history
presentation web app
```

---

# 21. MVP 定义

第一版不应该尝试做完整产品。

MVP 应回答一个问题：

> AI 是否能通过 Agent + Skill + Component + Morph 系统，稳定生成一套明显优于普通 AI PPT 的高质量 animated Web presentation？

---

## MVP 规模

建议：

```text
10–15 slides
```

主题使用一个真实科研项目。

包含：

- title
- section
- map
- metric
- chart
- comparison
- process
- conclusion

至少：

```text
3 个完整 Morph scenes
```

每个 scene 包括：

```text
2–4 states
```

---

# 22. MVP 验收指标

## Content

- 所有 slide 有明确 purpose。
- 无明显重复。
- 叙事逻辑连续。

## Visual

- 无 overflow。
- 无对象遮挡。
- 字体层级统一。
- spacing 一致。
- 视觉风格统一。

## Motion

- Morph 对象 identity 正确。
- 不出现无意义动画。
- Morph 有助于信息理解。

## Engineering

Presentation 必须可以：

```text
git clone
npm install
npm run dev
```

运行。

必须支持：

```text
npm run validate
npm run render
```

---

# 23. 评价系统

未来应建立标准评分：

```text
Story                20
Visual design        20
Information density  10
Data visualization   10
Motion               15
Consistency          10
Technical quality    10
Evidence              5

Total                100
```

这样可以比较：

```text
不同 Agent
不同模型
不同 Skills
不同 Prompt
```

生成 presentation 的质量。

---

# 24. 主要技术风险

## Risk 1

AI 自由度过高。

结果：

```text
每页都设计得不一样
```

解决：

> Layout + Component + Design Token 约束。

---

## Risk 2

AI 过度使用动画。

解决：

> Motion Director + motion semantics。

动画必须服务信息关系。

---

## Risk 3

Presentation IR 设计过度复杂。

解决：

第一版只抽象：

```text
slide
scene
layout
element
component
motion
```

后续再扩展。

---

## Risk 4

Reveal.js 逐渐成为架构限制。

解决：

Renderer isolation。

```text
Presentation IR
       ↓
renderer adapter
       ↓
Reveal
```

IR 不应包含 Reveal-specific details。

---

## Risk 5

Agent 数量过多导致 orchestration 成本上升。

解决：

第一阶段只保持：

```text
4 Agents
8–10 Skills
```

---

## Risk 6

视觉 QA 太依赖模型主观判断。

解决：

结合：

```text
deterministic QA
+
visual AI review
```

而不是单纯依赖 AI。

---

# 25. 项目的核心差异化

现有 AI PPT 产品大多解决：

> 根据 Prompt 生成 slides。

本项目要解决：

> 如何让 AI 长期设计、维护和演进一个 presentation system。

差异不在于：

```text
生成速度
```

而在于：

```text
结构化
可复用
可维护
可动画
可测试
可版本控制
```

---

# 26. 项目核心资产

长期真正有价值的不是 Reveal.js。

Reveal.js 是开源 runtime。

项目真正积累的资产是：

### 1. Presentation IR

演示语言。

### 2. Component Registry

视觉语言。

### 3. Motion Grammar

动画语言。

### 4. Layout Library

空间语言。

### 5. Skill Library

AI 工作知识。

### 6. Agent Workflow

制作流程。

### 7. QA System

质量控制体系。

### 8. Style Packs

设计语言。

最终这些共同构成：

> AI Presentation Operating System。

---

# 27. 建议开发阶段

## Phase 0 — Prototype

目标：

验证：

```text
Reveal
+
IR
+
Morph
```

只实现：

- 5 components
- 5 layouts
- 1 style
- basic Auto-Animate

---

## Phase 1 — MVP

加入：

- 4 agents
- 8 skills
- 10–15 components
- 10–15 layouts
- visual QA
- screenshot pipeline

完成一套真实 presentation。

---

## Phase 2 — Systemization

增加：

- style packs
- richer components
- chart library
- SVG system
- scientific presentation skills
- automated evaluation

---

## Phase 3 — Productization

增加：

- Web UI
- natural-language editing
- preview
- visual editor
- presentation project manager
- export system

---

# 28. 最终产品愿景

最终系统的使用体验应接近：

用户：

> 给我制作一份关于印度城市排放的 20 分钟报告。  
> Audience 是城市政策研究者。  
> 强调空间变化和能源结构。  
> 风格使用 academic-clean。  
> 前三部分尽量使用连续 Morph，不要大量文字。

系统内部：

```text
Deck Architect
      ↓
story

Slide Engineer
      ↓
components/layout

Motion Director
      ↓
scenes/morph

Renderer
      ↓
Reveal

Reviewer
      ↓
QA

Slide Engineer
      ↓
fix
```

最终得到：

```text
presentation/
```

而不是单纯：

```text
presentation.pptx
```

以后用户可以继续说：

> 把 2022 能源危机提前到第二部分。

或者：

> 所有地图改成深色背景。

或者：

> Delhi 那一段增加一个从全国到城市的 zoom transition。

系统都应该通过修改结构化 source 完成，而不是重新生成整套演示。

---

# 29. 项目一句话定义

> **一个以 Reveal.js 为渲染运行时，以 Presentation IR、组件系统、Morph 动画语法和 Agent/Skill 工作流为核心的 AI-native Web Presentation Framework。**

---

# 30. 第一阶段成功标准

第一阶段项目可以被认为成功，当：

1. 用户只提供内容和目标，不需要手动写 HTML。
2. AI 能独立生成完整 presentation。
3. 视觉布局具有明显的一致性。
4. AI 不需要逐像素控制所有对象。
5. Morph 能形成连续视觉叙事。
6. presentation 可以长期通过自然语言维护。
7. 新的 Style/Component/Skill 可以逐渐积累。
8. 不同 Claude/Codex Agent 可以使用同一项目规范。
9. 自动 QA 能发现多数常见页面错误。
10. 最终质量显著高于“LLM 直接生成 Reveal.js HTML”。

项目本质上不是：

> **AI 写 PPT。**

而是：

> **建立一个 AI 可以理解和操作的演示文稿编程环境。**