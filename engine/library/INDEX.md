<!-- 由 `npm run catalog` 生成，请勿手改。 -->

# 效果库索引（场景 / 效果 ↔ 提示词）

每个条目 = 一个可复用的页面设计或动画，带"用户可能怎么说"的提示词和可直接复制的 YAML。可视化浏览：`npm run dev` 首页的效果库，或 `npm run gallery` 生成的 `output/_gallery/index.html`。

**三种用法**

1. 继承（推荐）：`- { id: my-page, use: page.cards-3, objects: { c1: { text: "…" } } }` —— 继承条目的布局、对象和 States，只覆盖写出来的字段。
2. 复制：把条目的 YAML 复制进 deck.yaml 的 `scenes:`，补一个 `id`，改文字。
3. 演示：`- { library: "build.*" }` 把条目原样插入为演示页（带底部说明条）。

## 分类

| 类别 | 说明 | 分组（条目数） |
|---|---|---|
| `page` 页面结构 | 常用页面的版式与配色：封面、目录、章节、要点、对比、数据、时间线、总结 | 结构页（5） · 文字页（4） · 图文与对比（5） · 数据页（3） · 流程与框架（4） |
| `build` 页内动画 | 一页之内逐次点击：出现、强调、搭建 | 出现（4） · 强调（2） · 结构搭建（1） |
| `morph` 状态切换 | 同一画面在多个 State 之间平滑变化 | 版面变化（4） · 聚焦（1） · 数据与进度（2） |
| `interact` 交互数据 | 可悬停、点击、切换的图表与数据面板；讲述推进和自由探索共用同一套状态 | 交互图表（3） · 联动与面板（2） · 讲述 + 探索（1） |
| `image` 位图操作 | 对截图、照片等位图做局部放大、标注、聚光与对比 | 放大与聚光（2） · 标注（3） · 对比（1） |

## 提示词速查

| 提示词 | 条目 | 分类 |
|---|---|---|
| 「封面」 「标题页」 「开场页」 「第一页」 「cover slide」 「title slide」 「opening slide」 | [`page.cover`](#pagecover) 封面 · Cover | 页面结构 · 结构页 |
| 「章节页」 「过渡页」 「分隔页」 「第几部分」 「section divider」 「section slide」 「part 2」 「transition slide」 | [`page.section`](#pagesection) 章节页 · Section divider | 页面结构 · 结构页 |
| 「目录」 「议程」 「大纲页」 「今天讲什么」 「内容提纲」 「agenda」 「contents」 「outline」 「what we will cover」 | [`page.agenda`](#pageagenda) 目录页 · Agenda | 页面结构 · 结构页 |
| 「总结」 「小结」 「takeaway」 「要点回顾」 「带走什么」 「结论页」 「summary」 「takeaways」 「key points recap」 「conclusion slide」 | [`page.summary`](#pagesummary) 总结页 · Summary | 页面结构 · 结构页 |
| 「结尾」 「谢谢」 「结束页」 「Q&A」 「联系方式」 「closing」 「thank you」 「contact」 | [`page.closing`](#pageclosing) 结尾页 · Closing | 页面结构 · 结构页 |
| 「观点页」 「金句」 「一句话结论」 「大字报」 「强调一个观点」 「big statement」 「key message」 「one-line takeaway」 「emphasize one point」 | [`page.statement`](#pagestatement) 观点页 · Big statement | 页面结构 · 文字页 |
| 「要点页」 「列表页」 「几条要点」 「bullet points」 「标题加正文」 「list slide」 「key points」 「title and body」 | [`page.title-bullets`](#pagetitle-bullets) 标题 + 要点 · Title + bullets | 页面结构 · 文字页 |
| 「引用」 「名言」 「用户原话」 「引述」 「quote」 「quotation」 「customer words」 「testimonial」 | [`page.quote`](#pagequote) 引用 · Quote | 页面结构 · 文字页 |
| 「代码页」 「展示代码」 「配置示例」 「代码讲解」 「code」 「code slide」 「show code」 「config example」 「walk through code」 | [`page.code`](#pagecode) 代码 + 讲解 · Code + notes | 页面结构 · 文字页 |
| 「左文右图」 「图文页」 「左边文字右边图」 「观点加证据」 「split」 「text and image」 「claim with evidence」 「image on the right」 | [`page.split`](#pagesplit) 左文右图 · Text + image | 页面结构 · 图文与对比 |
| 「三个卡片」 「三栏」 「三个要点并列」 「卡片布局」 「三个特点」 「cards」 「three cards」 「three columns」 「side-by-side points」 「features」 | [`page.cards-3`](#pagecards-3) 三卡片 · Three cards | 页面结构 · 图文与对比 |
| 「对比」 「之前之后」 「before after」 「优缺点」 「两种方案对比」 「vs」 「comparison」 「before and after」 「pros and cons」 「A vs B」 | [`page.comparison`](#pagecomparison) 左右对比 · Side-by-side comparison | 页面结构 · 图文与对比 |
| 「团队介绍」 「人物介绍」 「我们的团队」 「核心成员」 「嘉宾介绍」 「team」 「讲者介绍」 「our team」 「speakers」 「people」 「core members」 | [`page.team`](#pageteam) 团队 / 人物介绍 · Team | 页面结构 · 图文与对比 |
| 「全屏图片」 「背景图」 「图片铺满」 「大图配标题」 「full bleed」 「background image」 「full-screen photo」 「big image with title」 | [`page.full-bleed`](#pagefull-bleed) 全图背景 · Full-bleed image | 页面结构 · 图文与对比 |
| 「大数字」 「一个数字」 「关键指标」 「数据亮点」 「KPI」 「big number」 「one key metric」 「headline figure」 | [`page.big-number`](#pagebig-number) 大数字 · Big number | 页面结构 · 数据页 |
| 「四个数字」 「关键指标」 「KPI 看板」 「指标卡片」 「数据概览」 「四个指标」 「dashboard」 「four metrics」 「KPI cards」 「key numbers」 「metrics overview」 | [`page.metrics-4`](#pagemetrics-4) 四个关键指标 · Four key metrics | 页面结构 · 数据页 |
| 「表格」 「数据表」 「对比表」 「参数表」 「方案对比表」 「table」 「价格表」 「data table」 「comparison table」 「pricing table」 「spec table」 | [`page.table`](#pagetable) 表格 · Table | 页面结构 · 数据页 |
| 「时间线」 「路线图」 「里程碑」 「发展历程」 「阶段计划」 「roadmap」 「timeline」 「五个阶段」 「milestones」 「project phases」 「history」 | [`page.timeline`](#pagetimeline) 时间线 / 路线图 · Timeline / roadmap | 页面结构 · 流程与框架 |
| 「流程链条加说明」 「左边步骤右边讲解」 「四步流程逐行解释」 「颜色逐渐变淡的步骤」 「关键词标签高亮」 「chain with notes」 「steps on the left」 「notes on the right」 「fading steps」 「keyword chips」 | [`page.chain-rows`](#pagechain-rows) 左侧渐变链条 + 右侧逐行讲解 · Step chain + notes | 页面结构 · 流程与框架 |
| 「四象限」 「矩阵」 「2x2」 「优先级矩阵」 「二维分类」 「波士顿矩阵」 「quadrant」 「2x2 matrix」 「priority matrix」 「value vs cost」 | [`page.matrix-2x2`](#pagematrix-2x2) 四象限矩阵 · 2×2 matrix | 页面结构 · 流程与框架 |
| 「方法论图」 「数据源到方法再到结果」 「多对多连线」 「肘形连接线」 「输入方法输出」 「技术路线图」 「method map」 「inputs to methods to outputs」 「elbow connectors」 「many-to-many links」 「technical roadmap」 | [`page.method-map`](#pagemethod-map) 数据源 → 方法 → 挑战（肘形连接线） · Sources → method → goal (elbow connectors) | 页面结构 · 流程与框架 |
| 「逐条出现」 「一条一条显示」 「要点依次出现」 「点一下出一条」 「bullets one by one」 「reveal points one at a time」 「one point per click」 | [`build.bullets-one-by-one`](#buildbullets-one-by-one) 逐条出现 · Bullets one by one | 页内动画 · 出现 |
| 「卡片依次出现」 「依次浮现」 「错开出现」 「一个接一个」 「stagger」 「cards one after another」 「cascade in」 「appear in sequence」 | [`build.cards-stagger`](#buildcards-stagger) 卡片依次浮现 · Staggered cards | 页内动画 · 出现 |
| 「条形图出现」 「擦除」 「从左往右出现」 「进度条」 「数据条依次出现」 「wipe」 「bars grow in」 「left to right reveal」 「progress bars」 | [`build.wipe-bars`](#buildwipe-bars) 条形图擦除出现 · Wipe-in bars | 页内动画 · 出现 |
| 「飞入」 「从两边飞进来」 「左右飞入」 「从屏幕外进入」 「fly in」 「enter from the sides」 「left and right fly-in」 「come in from off screen」 | [`build.fly-in`](#buildfly-in) 两侧飞入 · Fly in from both sides | 页内动画 · 出现 |
| 「重点高亮」 「荧光笔」 「划重点」 「强调这一句」 「highlight」 「highlighter」 「mark the key line」 「emphasize this sentence」 | [`build.highlight`](#buildhighlight) 荧光笔强调 · Highlighter | 页内动画 · 强调 |
| 「讲过的变暗」 「当前项高亮」 「逐项讲解」 「聚焦当前这一条」 「dim previous」 「highlight current item」 「walk through steps」 「focus on this one」 | [`build.dim-past`](#builddim-past) 讲过的变暗 · Dim what's done | 页内动画 · 强调 |
| 「流程图」 「逐步搭建」 「箭头画出来」 「一步一步连起来」 「流程逐步出现」 「flow diagram」 「build a process」 「draw arrows」 「connect step by step」 | [`build.diagram-flow`](#builddiagram-flow) 流程图逐步搭建 · Flow diagram, step by step | 页内动画 · 结构搭建 |
| 「标题上移」 「标题缩小到顶部」 「从标题过渡到内容」 「magic move 标题」 「magic move title」 「title shrinks to the top」 「title to content」 | [`morph.title-to-header`](#morphtitle-to-header) 标题上移，内容进场 · Title moves up, content enters | 状态切换 · 版面变化 |
| 「从概览到详情」 「移到一边展开」 「对象移动腾出空间」 「展开讲解」 「move aside」 「overview to detail」 「make room for details」 「expand on it」 | [`morph.overview-to-detail`](#morphoverview-to-detail) 从概览到详情 · Overview to detail | 状态切换 · 版面变化 |
| 「列表变网格」 「重新排列」 「布局切换」 「横排变竖排」 「rearrange」 「list to grid」 「switch layout」 「rows to columns」 | [`morph.layout-switch`](#morphlayout-switch) 列表变网格 · List to grid | 状态切换 · 版面变化 |
| 「首字母缩写」 「缩略词展开」 「项目全称收拢成名字」 「字母合并」 「开场 morph 成 logo 字」 「acronym」 「collapse to brand name」 「initials merge」 「opening morph to logo」 | [`morph.acronym-collapse`](#morphacronym-collapse) 缩略词收拢成品牌字 · Acronym collapse | 状态切换 · 版面变化 |
| 「放大其中一个」 「聚焦」 「突出某一项」 「其他变暗」 「zoom in」 「focus」 「focus on one」 「enlarge this item」 「dim the others」 | [`morph.focus-zoom`](#morphfocus-zoom) 放大其中一项 · Zoom into one item | 状态切换 · 聚焦 |
| 「数据变化」 「柱子长高」 「柱状图动画」 「从去年到今年」 「数值增长」 「chart animation」 「bars grow」 「this year vs last year」 「values change」 | [`morph.chart-grow`](#morphchart-grow) 柱状图数值变化 · Bars that grow | 状态切换 · 数据与进度 |
| 「时间线」 「路线图」 「里程碑推进」 「进度往前走」 「roadmap」 「timeline」 「advance milestones」 「move progress forward」 | [`morph.timeline-progress`](#morphtimeline-progress) 时间线推进 · Advancing timeline | 状态切换 · 数据与进度 |
| 「交互图表」 「可交互柱状图」 「悬停看数值」 「点击高亮」 「切换年份」 「interactive bar chart」 「hover for values」 「click to highlight」 「switch years」 | [`interact.bar-explore`](#interactbar-explore) 可交互柱状图 · Interactive bar chart | 交互数据 · 交互图表 |
| 「折线图」 「趋势图」 「图例开关」 「显示隐藏某条线」 「多条趋势对比」 「interactive line chart」 「trend chart」 「toggle lines in legend」 「compare trends」 | [`interact.line-legend`](#interactline-legend) 折线图 + 图例开关 · Line chart + legend toggles | 交互数据 · 交互图表 |
| 「排行榜」 「横向条形图」 「排名」 「前十名」 「top 10」 「ranking」 「horizontal bar chart」 「leaderboard」 | [`interact.hbar-ranking`](#interacthbar-ranking) 排行榜条形图 · Ranking bars | 交互数据 · 交互图表 |
| 「联动图表」 「图表联动」 「点一个另一个跟着变」 「联动高亮」 「linked views」 「crossfilter」 「linked highlight」 「click one chart to update the other」 | [`interact.linked-views`](#interactlinked-views) 联动视图 · Linked views | 交互数据 · 联动与面板 |
| 「数据面板」 「仪表盘」 「dashboard」 「指标卡加图表」 「可交互的数据看板」 「数据大屏」 「KPI cards with charts」 「interactive data panel」 | [`interact.dashboard`](#interactdashboard) 数据面板 · Dashboard | 交互数据 · 联动与面板 |
| 「边讲边变的图表」 「讲述驱动图表」 「一步步讲数据」 「讲完再探索」 「数据故事」 「narrated chart」 「data story」 「walk through the data」 「explore after the story」 | [`interact.narrated`](#interactnarrated) 讲述驱动 + 自由探索 · Narrate, then explore | 交互数据 · 讲述 + 探索 |
| 「放大图片局部」 「截图放大」 「推镜头」 「放大看细节」 「zoom in on image」 「图片 zoom」 「push in on a screenshot」 「enlarge a detail」 「image zoom」 | [`image.zoom-region`](#imagezoom-region) 局部放大 · Zoom into a region | 位图操作 · 放大与聚光 |
| 「聚光灯」 「只亮这一块」 「其他区域变暗」 「高亮截图某个区域」 「spotlight」 「light up one area」 「dim the rest」 「highlight part of a screenshot」 | [`image.spotlight`](#imagespotlight) 聚光灯 · Spotlight | 位图操作 · 放大与聚光 |
| 「加箭头」 「箭头指向」 「在截图上标注」 「指给大家看」 「加说明文字」 「arrow annotation」 「point at this」 「annotate a screenshot」 「callout with arrow」 | [`image.arrow-label`](#imagearrow-label) 箭头 + 说明 · Arrow + label | 位图操作 · 标注 |
| 「加圆圈」 「圈出来」 「圈重点」 「在照片上画圈」 「标记位置」 「circle」 「circle this spot」 「mark a location」 「ring on a photo」 | [`image.circle-mark`](#imagecircle-mark) 圈出重点 · Circle it | 位图操作 · 标注 |
| 「强调截图里的文字」 「荧光笔标出」 「标出数字」 「划出这段」 「文字强调」 「mark text」 「highlight a number in a screenshot」 「highlighter box」 「call out this figure」 | [`image.text-emphasis`](#imagetext-emphasis) 截图文字强调 · Mark text in a screenshot | 位图操作 · 标注 |
| 「前后对比」 「处理前处理后」 「对比两张图」 「修图前后」 「before after 图片」 「before after image」 「compare two versions」 「wipe to reveal」 「edited vs original」 | [`image.before-after`](#imagebefore-after) 前后对比 · Before / after | 位图操作 · 对比 |

## page — 页面结构：常用页面的版式与配色：封面、目录、章节、要点、对比、数据、时间线、总结

### 页面结构 · 结构页

#### page.cover

**封面** · Cover · 文件 `engine/library/page/cover.yaml`

- 提示词：「封面」 「标题页」 「开场页」 「第一页」 「cover slide」 「title slide」 「opening slide」
- 适合：演示的第一页：主题、副标题、作者与日期
- 不适合：章节之间的过渡页（用 page.section）
- Use when: The first slide — topic, subtitle, author and date
- Avoid when: Transitions between sections (use page.section)
- 调用：`- { id: <scene-id>, use: page.cover }`

```yaml
- id: cover
  layout: hero
  objects:
    kicker:
      type: text
      role: kicker
      text: Introduction · 2026
    title:
      type: text
      role: title
      text: AI-native\nweb slides ^^AI 原生的网页演示文稿^^
    subtitle:
      type: text
      role: subtitle
      text: Make, check and maintain slides like code ^^让 AI 像写代码一样制作、检查和维护演示^^
    meta:
      type: text
      role: meta
      text: Author · Date · Event ^^作者 · 日期 · 场合^^
    deco1:
      type: shape
      geom: ellipse
      fill: accent-soft
      frame:
        - 1180
        - 150
        - 600
        - 600
    deco2:
      type: shape
      geom: ellipse
      fill: accent
      frame:
        - 1530
        - 560
        - 270
        - 270
    deco3:
      type: shape
      geom: roundRect
      radius: 20
      fill: accent-2
      frame:
        - 1260
        - 610
        - 150
        - 150
```

#### page.section

**章节页** · Section divider · 文件 `engine/library/page/section.yaml`

- 提示词：「章节页」 「过渡页」 「分隔页」 「第几部分」 「section divider」 「section slide」 「part 2」 「transition slide」
- 适合：进入新的部分；深色背景让听众意识到"换话题了"
- 不适合：每两三页就插一个（太碎）
- Use when: Starting a new part; the dark background signals a change of topic
- Avoid when: Inserting one every two or three slides (too choppy)
- 调用：`- { id: <scene-id>, use: page.section }`

```yaml
- id: section
  layout: hero
  theme: dark
  objects:
    kicker:
      type: text
      role: kicker
      text: Part 01 · 第 01 部分
    title:
      type: text
      role: title
      text: Core model ^^核心模型^^
    subtitle:
      type: text
      role: subtitle
      text: Scene · State · Object
    num:
      type: text
      text: "01"
      frame:
        - 1100
        - 120
        - 700
        - 760
      size: 520
      weight: 800
      lineHeight: 1
      color: accent
      opacity: 0.22
      align: right
      valign: middle
      font: display
```

#### page.agenda

**目录页** · Agenda · 文件 `engine/library/page/agenda.yaml`

- 提示词：「目录」 「议程」 「大纲页」 「今天讲什么」 「内容提纲」 「agenda」 「contents」 「outline」 「what we will cover」
- 适合：封面之后，用 3–5 项告诉听众这次会讲什么、按什么顺序；左边一句话立场，右边编号列表
- 不适合：只有一两个部分的短演示（直接开讲）；超过 5 项（合并成 4–5 个部分）
- Use when: Right after the cover — 3–5 items saying what you will cover and in what order; a one-line stance on the left, a numbered list on the right
- Avoid when: Short talks with one or two parts (just start); more than 5 items (merge into 4–5 parts)
- 调用：`- { id: <scene-id>, use: page.agenda }`

```yaml
- id: agenda
  layout:
    type: split
    ratio: 36
  objects:
    title:
      type: text
      role: title
      text: Four things today ^^今天讲四件事^^
    lead:
      type: text
      role: subtitle
      slot: left
      text: Conclusion first, then evidence, then action ^^先给结论，再讲证据，最后落到行动^^
    items:
      type: text
      role: bullets
      slot: right
      text:
        - 1. **Context & problem** · 背景与问题
        - + Why now · 为什么现在做
        - 2. **Options & trade-offs** · 方案与取舍
        - + What we chose, what we dropped · 选了什么，放弃了什么
        - 3. **Results** · 结果与证据
        - + What the data says · 数据怎么说
        - 4. **Next steps** · 下一步
        - + Decisions we need from you · 需要你们做的决定
```

#### page.summary

**总结页** · Summary · 文件 `engine/library/page/summary.yaml`

- 提示词：「总结」 「小结」 「takeaway」 「要点回顾」 「带走什么」 「结论页」 「summary」 「takeaways」 「key points recap」 「conclusion slide」
- 适合：结尾之前的一页：把全篇收成 3 句话，再给出明确的下一步行动
- 不适合：把所有内容再复述一遍（只留 3 条，每条一句）
- Use when: The slide before the end — the whole talk in 3 sentences, then a clear next action
- Avoid when: Repeating everything (keep 3 points, one sentence each)
- 调用：`- { id: <scene-id>, use: page.summary }`

```yaml
- id: summary
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: Take away three things ^^带走这三件事^^
    points:
      type: text
      role: bullets
      text:
        - "1. **Lead with the conclusion**: titles state findings ^^结论先行：标题写结论，不写主题^^"
        - "2. **One idea per slide**: split the rest into States ^^一页一个意思：多了就拆成多个 State^^"
        - "3. **Let data speak**: enlarge key numbers, cite sources ^^数据说话：关键数字单独放大，并标明来源^^"
    next:
      type: text
      role: callout
      text: Next → confirm scope and owners this week ^^下一步 → 本周内确认范围与负责人^^
  steps:
    - enter: points
      by: paragraph
    - enter: next
      effect: fade
```

#### page.closing

**结尾页** · Closing · 文件 `engine/library/page/closing.yaml`

- 提示词：「结尾」 「谢谢」 「结束页」 「Q&A」 「联系方式」 「closing」 「thank you」 「contact」
- 适合：最后一页：致谢、联系方式、下一步行动
- 不适合：用"谢谢"代替总结（结尾前应先有一页 takeaway）
- Use when: The last slide — thanks, contact details, next action
- Avoid when: Using "thank you" in place of a summary (put a takeaway slide before it)
- 调用：`- { id: <scene-id>, use: page.closing }`

```yaml
- id: closing
  layout:
    type: hero
    align: center
  objects:
    title:
      type: text
      role: title
      text: Thank you ^^谢谢^^
    subtitle:
      type: text
      role: subtitle
      text: Questions & discussion · 问题与讨论
    meta:
      type: text
      role: meta
      text: github.com/your/repo · you@example.com
```

### 页面结构 · 文字页

#### page.statement

**观点页** · Big statement · 文件 `engine/library/page/statement.yaml`

- 提示词：「观点页」 「金句」 「一句话结论」 「大字报」 「强调一个观点」 「big statement」 「key message」 「one-line takeaway」 「emphasize one point」
- 适合：整场只想让听众记住的一句话；章节开头或结尾
- 不适合：需要证据支撑的论点（先给证据页）
- Use when: The one sentence the audience should remember; opening or closing a section
- Avoid when: Claims that need evidence (show the evidence first)
- 调用：`- { id: <scene-id>, use: page.statement }`

```yaml
- id: statement
  layout: center
  objects:
    main:
      type: text
      role: title
      slot: main
      size: 84
      align: center
      text: |-
        A deck is a ==structured program==,
        not a picture of pages. ^^演示文稿是结构化程序，不是页面图片。^^
    caption:
      type: text
      role: caption
      text: One sentence per slide; key words in ==accent== ^^一页只放一句话；关键词用强调色^^
```

#### page.title-bullets

**标题 + 要点** · Title + bullets · 文件 `engine/library/page/title-bullets.yaml`

- 提示词：「要点页」 「列表页」 「几条要点」 「bullet points」 「标题加正文」 「list slide」 「key points」 「title and body」
- 适合：3–5 条并列要点；标题直接写结论
- 不适合：超过 6 条，或要点之间需要对比（用 page.comparison / page.cards-3）
- Use when: 3–5 parallel points; the title states the conclusion
- Avoid when: More than 6 points, or points that need comparing (use page.comparison / page.cards-3)
- 调用：`- { id: <scene-id>, use: page.title-bullets }`

```yaml
- id: title-bullets
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: Titles state conclusions, not topics ^^标题写结论，而不是写主题^^
    points:
      type: text
      role: bullets
      text:
        - One idea per point, under a line and a half ^^每条只讲一件事，一行半以内^^
        - 3–5 points is best; more, split the slide ^^3–5 条最合适，再多就拆页^^
        - Mark ==key words==, don't bold whole lines ^^关键词用强调色，不要整句加粗^^
        - + Sub-points start with + and are indented ^^子要点用 + 开头，缩进并变浅^^
        - "Prefixes: - point, 1. number, # heading ^^段落前缀：- 要点，1. 编号，# 小标题^^"
```

#### page.quote

**引用** · Quote · 文件 `engine/library/page/quote.yaml`

- 提示词：「引用」 「名言」 「用户原话」 「引述」 「quote」 「quotation」 「customer words」 「testimonial」
- 适合：引用专家、用户或文献的原话，增加可信度
- 不适合：引文超过三行（摘要后再引用）
- Use when: Quote an expert, a user or a paper word for word to add credibility
- Avoid when: Quotes longer than three lines (summarize, then quote)
- 调用：`- { id: <scene-id>, use: page.quote }`

```yaml
- id: quote
  layout: center
  objects:
    q:
      type: text
      role: quote
      align: center
      text: |-
        A deck is not a picture of pages,
        but a structured program you can read and change. ^^演示文稿不是页面图片，而是一段可以被理解和修改的结构化程序。^^
    caption:
      type: text
      role: caption
      text: — Design principle · 项目设计原则
```

#### page.code

**代码 + 讲解** · Code + notes · 文件 `engine/library/page/code.yaml`

- 提示词：「代码页」 「展示代码」 「配置示例」 「代码讲解」 「code」 「code slide」 「show code」 「config example」 「walk through code」
- 适合：展示一段代码或配置，并在旁边解释关键行
- 不适合：代码超过 15 行（只截取关键部分）
- Use when: Show a snippet of code or config and explain the key lines beside it
- Avoid when: More than 15 lines of code (show only the key part)
- 调用：`- { id: <scene-id>, use: page.code }`

```yaml
- id: code
  layout:
    type: split
    ratio: 56
  objects:
    title:
      type: text
      role: title
      text: A few lines of YAML make a slide ^^一段 YAML 就是一页演示^^
    code:
      type: text
      role: code
      slot: left
      text: |
        - id: india            # one scene
          layout: split
          objects:             # key = identity
            map:   { type: image, src: map.svg }
            total: { type: metric, value: 3100 }
          states:              # morph between
            - show: [map]
            - add: [total]
    notes:
      type: text
      role: bullets
      slot: right
      text:
        - "**objects**: define each once ^^每个对象定义一次^^"
        - "**states**: views of one canvas ^^同一画面的多个状态^^"
        - "**steps**: clicks within a State ^^State 内的点击构建^^"
        - The engine does the math ^^坐标、动画参数由引擎计算^^
```

### 页面结构 · 图文与对比

#### page.split

**左文右图** · Text + image · 文件 `engine/library/page/split.yaml`

- 提示词：「左文右图」 「图文页」 「左边文字右边图」 「观点加证据」 「split」 「text and image」 「claim with evidence」 「image on the right」
- 适合：一个结论 + 一张支撑它的图、截图或图表
- 不适合：图本身信息量很大（让图占满整页，用 page.full-bleed 或单独一页）
- Use when: One conclusion plus an image, screenshot or chart that backs it up
- Avoid when: The image carries a lot of detail (give it the whole slide — page.full-bleed or its own page)
- 调用：`- { id: <scene-id>, use: page.split }`

```yaml
- id: split
  layout:
    type: split
    ratio: 45
  objects:
    title:
      type: text
      role: title
      text: Claim on the left, evidence on the right ^^左边讲观点，右边给证据^^
    claim:
      type: text
      role: heading
      slot: left
      text: Lead with a one-line conclusion ^^一句话结论放在最上面^^
    body:
      type: text
      role: bullets
      slot: left
      text:
        - "Left: claim + 2–3 points ^^左栏：结论 + 2–3 条支撑^^"
        - "Right: image or chart ^^右栏：图、截图或图表^^"
        - Adjust with ratio (default 50) ^^比例用 ratio 调整（默认 50）^^
    visual:
      type: image
      src: "@lib/chart.svg"
      slot: right
      fit: contain
```

#### page.cards-3

**三卡片** · Three cards · 文件 `engine/library/page/cards-3.yaml`

- 提示词：「三个卡片」 「三栏」 「三个要点并列」 「卡片布局」 「三个特点」 「cards」 「three cards」 「three columns」 「side-by-side points」 「features」
- 适合：2–4 个并列、同等重要的概念或特点
- 不适合：有先后顺序（用 build.diagram-flow）或有主次（用 page.split）
- Use when: 2–4 parallel ideas or features of equal weight
- Avoid when: Steps in sequence (use build.diagram-flow) or one main idea with support (use page.split)
- 调用：`- { id: <scene-id>, use: page.cards-3 }`

```yaml
- id: cards-3
  layout:
    type: grid
    cols: 3
    cellHeight: 460
  objects:
    title:
      type: text
      role: title
      text: Parallel ideas go in cards ^^并列的概念用卡片^^
    c1:
      type: shape
      fill: surface
      shadow: true
      text:
        - "# Structured ^^结构化^^"
        - "Slides are YAML: diff, reuse, test ^^演示是 YAML 源文件：可 diff、复用、测试^^"
    c2:
      type: shape
      fill: surface
      shadow: true
      text:
        - "# Animated ^^可动画^^"
        - Objects morph across States; motion carries meaning ^^同一对象跨 State 平滑变化，动画就是信息^^
    c3:
      type: shape
      fill: accent
      color: "#FFFFFF"
      shadow: true
      text:
        - "# Checked ^^可检查^^"
        - Every change is screenshotted and checked ^^每次改动后自动截图、查溢出^^
```

#### page.comparison

**左右对比** · Side-by-side comparison · 文件 `engine/library/page/comparison.yaml`

- 提示词：「对比」 「之前之后」 「before after」 「优缺点」 「两种方案对比」 「vs」 「comparison」 「before and after」 「pros and cons」 「A vs B」
- 适合：两种方案、新旧做法、优缺点的对照
- 不适合：超过两个对象（用 page.cards-3）
- Use when: Two options, old vs new, pros vs cons
- Avoid when: More than two things (use page.cards-3)
- 调用：`- { id: <scene-id>, use: page.comparison }`

```yaml
- id: comparison
  layout: split
  objects:
    title:
      type: text
      role: title
      text: Same structure, color shows the side ^^两栏同结构，颜色区分立场^^
    a:
      type: shape
      slot: left
      fill: surface-2
      text:
        - "# Before: AI writes PPTX ^^以前：AI 生成 PPTX^^"
        - "- Loose text boxes ^^对象是零散的文本框^^"
        - "- Animation is hard to script ^^动画难以程序化^^"
        - "- One fix, full regeneration ^^改一处，要重新生成^^"
    b:
      type: shape
      slot: right
      fill: accent-soft
      text:
        - "# Now: AI writes deck.yaml ^^现在：AI 编写 deck.yaml^^"
        - "- Objects have meaning and identity ^^对象有语义和身份^^"
        - "- Animation is state change ^^动画是状态变化^^"
        - "- One fix, one edit ^^改一处，只动一处^^"
```

#### page.team

**团队 / 人物介绍** · Team · 文件 `engine/library/page/team.yaml`

- 提示词：「团队介绍」 「人物介绍」 「我们的团队」 「核心成员」 「嘉宾介绍」 「team」 「讲者介绍」 「our team」 「speakers」 「people」 「core members」
- 适合：介绍 3–4 个人：头像、姓名、角色、一句话背景
- 不适合：超过 4 人（改成名单或只放 logo 墙）
- Use when: Introduce 3–4 people — avatar, name, role, one line of background
- Avoid when: More than 4 people (use a name list or a logo wall)
- 调用：`- { id: <scene-id>, use: page.team }`

```yaml
- id: team
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: A small, complete team ^^一支小而全的团队^^
    c1:
      type: shape
      fill: surface
      shadow: true
      frame:
        - 120
        - 290
        - 390
        - 580
    c2:
      type: shape
      fill: surface
      shadow: true
      frame:
        - 550
        - 290
        - 390
        - 580
    c3:
      type: shape
      fill: surface
      shadow: true
      frame:
        - 980
        - 290
        - 390
        - 580
    c4:
      type: shape
      fill: surface
      shadow: true
      frame:
        - 1410
        - 290
        - 390
        - 580
    a1:
      type: shape
      geom: ellipse
      fill: accent-soft
      color: accent
      size: 72
      weight: 800
      align: center
      valign: middle
      frame:
        - 235
        - 330
        - 160
        - 160
      text: Z
    a2:
      type: shape
      geom: ellipse
      fill: accent-2-soft
      color: accent-2
      size: 72
      weight: 800
      align: center
      valign: middle
      frame:
        - 665
        - 330
        - 160
        - 160
      text: L
    a3:
      type: shape
      geom: ellipse
      fill: accent-3-soft
      color: accent-3
      size: 72
      weight: 800
      align: center
      valign: middle
      frame:
        - 1095
        - 330
        - 160
        - 160
      text: W
    a4:
      type: shape
      geom: ellipse
      fill: accent-4-soft
      color: accent-4
      size: 72
      weight: 800
      align: center
      valign: middle
      frame:
        - 1525
        - 330
        - 160
        - 160
      text: C
    n1:
      type: text
      align: center
      size: 30
      frame:
        - 140
        - 520
        - 350
        - 120
      text:
        - "# Zhou Chuan"
        - Project lead · 项目负责人
    n2:
      type: text
      align: center
      size: 30
      frame:
        - 570
        - 520
        - 350
        - 120
      text:
        - "# Li Ming"
        - Engineering · 工程
    n3:
      type: text
      align: center
      size: 30
      frame:
        - 1000
        - 520
        - 350
        - 120
      text:
        - "# Wang Fang"
        - Design · 设计
    n4:
      type: text
      align: center
      size: 30
      frame:
        - 1430
        - 520
        - 350
        - 120
      text:
        - "# Chen Jing"
        - Data analysis · 数据分析
    b1:
      type: text
      role: caption
      align: center
      frame:
        - 150
        - 660
        - 330
        - 170
      text: "One line: past work, strengths ^^一句话背景：做过什么，擅长什么^^"
    b2:
      type: text
      role: caption
      align: center
      frame:
        - 580
        - 660
        - 330
        - 170
      text: "One line: past work, strengths ^^一句话背景：做过什么，擅长什么^^"
    b3:
      type: text
      role: caption
      align: center
      frame:
        - 1010
        - 660
        - 330
        - 170
      text: "One line: past work, strengths ^^一句话背景：做过什么，擅长什么^^"
    b4:
      type: text
      role: caption
      align: center
      frame:
        - 1440
        - 660
        - 330
        - 170
      text: "One line: past work, strengths ^^一句话背景：做过什么，擅长什么^^"
```

#### page.full-bleed

**全图背景** · Full-bleed image · 文件 `engine/library/page/full-bleed.yaml`

- 提示词：「全屏图片」 「背景图」 「图片铺满」 「大图配标题」 「full bleed」 「background image」 「full-screen photo」 「big image with title」
- 适合：用一张有冲击力的图片定调；文字压在图上
- 不适合：图片细节本身是要讲的内容（不要压字）
- Use when: Set the tone with one striking image; text sits on top
- Avoid when: The image details are the content (don't cover them with text)
- 调用：`- { id: <scene-id>, use: page.full-bleed }`

```yaml
- id: full-bleed
  layout: free
  theme: dark
  objects:
    bg:
      type: image
      src: "@lib/landscape.svg"
      frame:
        - 0
        - 0
        - 1920
        - 1080
    shade:
      type: shape
      geom: rect
      fill: rgba(10,12,30,.35)
      frame:
        - 0
        - 0
        - 1920
        - 1080
    title:
      type: text
      role: title
      size: 96
      color: "#FFFFFF"
      frame:
        - 120
        - 520
        - 1300
        - 280
      valign: bottom
      text: One image sets the tone ^^用一张图定调^^
    sub:
      type: text
      role: subtitle
      color: rgba(255,255,255,.85)
      frame:
        - 120
        - 820
        - 1500
        - 130
      text: Full-stage image with a translucent shade for legible text ^^图片铺满舞台，叠一层半透明遮罩保证文字可读^^
```

### 页面结构 · 数据页

#### page.big-number

**大数字** · Big number · 文件 `engine/library/page/big-number.yaml`

- 提示词：「大数字」 「一个数字」 「关键指标」 「数据亮点」 「KPI」 「big number」 「one key metric」 「headline figure」
- 适合：一个数字就能说明问题；用 label 解释它，用 source 标明来源
- 不适合：需要比较多个数字（用 morph.chart-grow 或卡片）
- Use when: One number makes the point; explain it with label, cite it with source
- Avoid when: Comparing several numbers (use morph.chart-grow or cards)
- 调用：`- { id: <scene-id>, use: page.big-number }`

```yaml
- id: big-number
  layout: center
  objects:
    kicker:
      type: text
      role: kicker
      text: One number tells the story · 一个数字说明问题
    n:
      type: metric
      value: "3.1"
      unit: Gt CO₂
      label: Urban emissions, 2024 (sample) · 2024 年城市排放总量（示例）
      delta: −12% vs 2019
      tone: up
      align: center
      size: 220
    caption:
      type: text
      role: caption
      text: Number + unit + one line of context; cite in source ^^大数字 + 单位 + 一句解释；来源写在 source 字段^^
```

#### page.metrics-4

**四个关键指标** · Four key metrics · 文件 `engine/library/page/metrics-4.yaml`

- 提示词：「四个数字」 「关键指标」 「KPI 看板」 「指标卡片」 「数据概览」 「四个指标」 「dashboard」 「four metrics」 「KPI cards」 「key numbers」 「metrics overview」
- 适合：一页同时交代 3–4 个并列的关键数字（规模、增速、占比…），每个配一句解释
- 不适合：只有一个重点数字（用 page.big-number）；需要看趋势（用 morph.chart-grow）
- Use when: 3–4 parallel key numbers on one slide (scale, growth, share…), each with one line of context
- Avoid when: Only one headline number (use page.big-number); showing a trend (use morph.chart-grow)
- 调用：`- { id: <scene-id>, use: page.metrics-4 }`

```yaml
- id: metrics-4
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: Last year in four numbers ^^过去一年的四个关键数字^^
    k1:
      type: shape
      fill: surface
      shadow: true
      frame:
        - 120
        - 300
        - 390
        - 360
    k2:
      type: shape
      fill: surface
      shadow: true
      frame:
        - 550
        - 300
        - 390
        - 360
    k3:
      type: shape
      fill: surface
      shadow: true
      frame:
        - 980
        - 300
        - 390
        - 360
    k4:
      type: shape
      fill: accent-soft
      frame:
        - 1410
        - 300
        - 390
        - 360
    m1:
      type: metric
      value: "128"
      unit: cities
      label: Cities covered · 覆盖城市
      size: 120
      frame:
        - 156
        - 340
        - 318
        - 290
      delta: +18 YoY
      tone: up
    m2:
      type: metric
      value: "3.1"
      unit: Gt
      label: Annual total · 年度总量
      size: 120
      frame:
        - 586
        - 340
        - 318
        - 290
      delta: −12%
      tone: up
    m3:
      type: metric
      value: "92"
      unit: "%"
      label: Data completeness · 数据完整率
      size: 120
      frame:
        - 1016
        - 340
        - 318
        - 290
      delta: Flat · 持平
      tone: neutral
    m4:
      type: metric
      value: "74"
      unit: k
      label: Monthly users · 月活用户
      size: 120
      frame:
        - 1446
        - 340
        - 318
        - 290
      delta: +31%
      tone: up
    source:
      type: text
      role: caption
      frame:
        - 120
        - 700
        - 1680
        - 50
      text: "Source: sample data — replace and cite yours · 来源：示例数据，使用时替换并标明出处"
```

#### page.table

**表格** · Table · 文件 `engine/library/page/table.yaml`

- 提示词：「表格」 「数据表」 「对比表」 「参数表」 「方案对比表」 「table」 「价格表」 「data table」 「comparison table」 「pricing table」 「spec table」
- 适合：3–5 列、不超过 6 行的结构化数据；高亮行用 class="hl"，数字列用 class="num" 右对齐
- 不适合：行列很多（挑重点，其余放附录）；要看趋势（用 chart 组件）
- Use when: Structured data with 3–5 columns and up to 6 rows; highlight a row with class="hl", right-align numbers with class="num"
- Avoid when: Many rows or columns (show the key ones, move the rest to an appendix); trends (use the chart component)
- 调用：`- { id: <scene-id>, use: page.table }`

```yaml
- id: table
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: Three options, differences at a glance ^^三个方案对比，一眼看出差别^^
    grid:
      type: html
      size: 34
      html: |
        <table class="tbl">
          <thead><tr><th>Option · 方案</th><th class="num">Cost · 成本</th><th class="num">Time · 周期</th><th>Risk · 风险</th></tr></thead>
          <tbody>
            <tr><td>A　Build · 自研</td><td class="num">$170k</td><td class="num">6 mo</td><td>Medium · 中</td></tr>
            <tr class="hl"><td>B　Buy + customize · 采购 + 定制</td><td class="num">$110k</td><td class="num">3 mo</td><td>Low · 低</td></tr>
            <tr><td>C　Outsource · 外包</td><td class="num">$85k</td><td class="num">4 mo</td><td>High · 高</td></tr>
          </tbody>
        </table>
```

### 页面结构 · 流程与框架

#### page.timeline

**时间线 / 路线图** · Timeline / roadmap · 文件 `engine/library/page/timeline.yaml`

- 提示词：「时间线」 「路线图」 「里程碑」 「发展历程」 「阶段计划」 「roadmap」 「timeline」 「五个阶段」 「milestones」 「project phases」 「history」
- 适合：按时间或阶段排列 3–5 个节点；每个节点一个时间、一句标题、一行说明；点击逐个出现
- 不适合：需要在同一画面里一步步推进进度（用 morph.timeline-progress）；超过 5 个节点（拆成两页）
- Use when: 3–5 nodes in time or phase order — a date, a title and one line each; nodes appear click by click
- Avoid when: Advancing progress on one canvas (use morph.timeline-progress); more than 5 nodes (split into two slides)
- 调用：`- { id: <scene-id>, use: page.timeline }`

```yaml
- id: timeline
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: Five phases, live in a year ^^五个阶段，一年落地^^
    line:
      type: shape
      geom: line
      from:
        - 150
        - 500
      to:
        - 1770
        - 500
      stroke: line
      strokeWidth: 6
    n1:
      type: shape
      geom: ellipse
      fill: accent
      frame:
        - 270
        - 482
        - 36
        - 36
    n2:
      type: shape
      geom: ellipse
      fill: accent
      frame:
        - 606
        - 482
        - 36
        - 36
    n3:
      type: shape
      geom: ellipse
      fill: accent
      frame:
        - 942
        - 482
        - 36
        - 36
    n4:
      type: shape
      geom: ellipse
      fill: accent
      frame:
        - 1278
        - 482
        - 36
        - 36
    n5:
      type: shape
      geom: ellipse
      fill: accent-2
      frame:
        - 1614
        - 482
        - 36
        - 36
    y1:
      type: text
      size: 46
      weight: 800
      color: accent
      align: center
      frame:
        - 138
        - 388
        - 300
        - 80
      text: Q1
    y2:
      type: text
      size: 46
      weight: 800
      color: accent
      align: center
      frame:
        - 474
        - 388
        - 300
        - 80
      text: Q2
    y3:
      type: text
      size: 46
      weight: 800
      color: accent
      align: center
      frame:
        - 810
        - 388
        - 300
        - 80
      text: Q3
    y4:
      type: text
      size: 46
      weight: 800
      color: accent
      align: center
      frame:
        - 1146
        - 388
        - 300
        - 80
      text: Q4
    y5:
      type: text
      size: 46
      weight: 800
      color: accent-2
      align: center
      frame:
        - 1482
        - 388
        - 300
        - 80
      text: Next year
    d1:
      type: text
      align: center
      size: 30
      frame:
        - 138
        - 548
        - 300
        - 240
      text:
        - "# Kickoff ^^立项^^"
        - Set goals and scope ^^明确目标与范围^^
    d2:
      type: text
      align: center
      size: 30
      frame:
        - 474
        - 548
        - 300
        - 240
      text:
        - "# Prototype ^^原型^^"
        - A minimal demo ^^做出可演示的最小版本^^
    d3:
      type: text
      align: center
      size: 30
      frame:
        - 810
        - 548
        - 300
        - 240
      text:
        - "# Pilot ^^试点^^"
        - Small-scale real use ^^小范围真实使用^^
    d4:
      type: text
      align: center
      size: 30
      frame:
        - 1146
        - 548
        - 300
        - 240
      text:
        - "# Launch ^^发布^^"
        - Go live ^^正式上线^^
    d5:
      type: text
      align: center
      size: 30
      frame:
        - 1482
        - 548
        - 300
        - 240
      text:
        - "# Roll out ^^推广^^"
        - Extend to all teams ^^扩大到全部团队^^
  steps:
    - - enter: n1
      - enter: y1
      - enter: d1
    - - enter: n2
      - enter: y2
      - enter: d2
    - - enter: n3
      - enter: y3
      - enter: d3
    - - enter: n4
      - enter: y4
      - enter: d4
    - - enter: n5
      - enter: y5
      - enter: d5
```

#### page.chain-rows

**左侧渐变链条 + 右侧逐行讲解** · Step chain + notes · 文件 `engine/library/page/chain-rows.yaml`

- 提示词：「流程链条加说明」 「左边步骤右边讲解」 「四步流程逐行解释」 「颜色逐渐变淡的步骤」 「关键词标签高亮」 「chain with notes」 「steps on the left」 「notes on the right」 「fading steps」 「keyword chips」
- 适合：3–4 个先后相连的步骤（颜色由深到浅），每一步在右侧有对应的一段说明；左侧自动一次性出现，右侧点击逐段出现；关键词可以用 [[词|orange|green|blue]] 做成行内标签
- 不适合：步骤超过 5 个，或每一步的说明超过三行（拆页）
- Use when: 3–4 linked steps (dark to light) with one note each on the right; the chain appears at once, notes appear click by click; mark keywords as inline chips with [[word|orange|green|blue]]
- Avoid when: More than 5 steps, or notes longer than three lines (split the slide)
- 调用：`- { id: <scene-id>, use: page.chain-rows }`

```yaml
- id: chain-rows
  layout: free
  objects:
    b1:
      type: shape
      fill: accent
      color: "#FFFFFF"
      size: 34
      weight: bold
      align: center
      valign: middle
      frame:
        - 120
        - 150
        - 420
        - 160
      text: Step 1 ^^第一步^^
    b2:
      type: shape
      fill: accent-3
      color: "#FFFFFF"
      size: 34
      weight: bold
      align: center
      valign: middle
      frame:
        - 120
        - 370
        - 420
        - 120
      text: Step 2 ^^第二步^^
    b3:
      type: shape
      fill: accent-3-soft
      color: accent-3
      size: 34
      weight: bold
      align: center
      valign: middle
      frame:
        - 120
        - 550
        - 420
        - 120
      text: Step 3 ^^第三步^^
    a1:
      type: shape
      geom: arrow
      fill: muted
      rotate: 90
      frame:
        - 300
        - 326
        - 60
        - 28
    a2:
      type: shape
      geom: arrow
      fill: muted
      rotate: 90
      frame:
        - 300
        - 506
        - 60
        - 28
    t1:
      type: text
      size: 32
      color: ink
      lineHeight: 1.5
      valign: middle
      frame:
        - 600
        - 150
        - 1200
        - 160
      text: Close the [[data gap|orange]] with [[high-resolution|blue]] data at [[low latency|green]] ^^以低延迟提供高分辨率数据，填补数据缺口^^
    t2:
      type: text
      size: 32
      color: ink
      lineHeight: 1.5
      valign: middle
      frame:
        - 600
        - 370
        - 1200
        - 120
      text: All data is **open** on the project site ^^所有数据在项目网站公开，供政策制定者与研究者使用^^
    t3:
      type: text
      size: 32
      color: ink
      lineHeight: 1.5
      valign: middle
      frame:
        - 600
        - 550
        - 1200
        - 120
      text: "**Analyze** scenarios, **assess** targets ^^分析减排情景，评估目标^^"
  steps:
    - enter:
        - b1
        - a1
        - b2
        - a2
        - b3
      effect: fade
      duration: 700
      auto: true
    - enter: t1
      effect: fade-up
    - enter: t2
      effect: fade-up
    - enter: t3
      effect: fade-up
```

#### page.matrix-2x2

**四象限矩阵** · 2×2 matrix · 文件 `engine/library/page/matrix-2x2.yaml`

- 提示词：「四象限」 「矩阵」 「2x2」 「优先级矩阵」 「二维分类」 「波士顿矩阵」 「quadrant」 「2x2 matrix」 「priority matrix」 「value vs cost」
- 适合：用两个维度（如价值 × 成本）把事物分成四类，每类一句话建议
- 不适合：维度不止两个；分类没有明确的"哪个象限更好"
- Use when: Sort things into four groups on two dimensions (e.g. value × cost), one line of advice each
- Avoid when: More than two dimensions; no quadrant is clearly better
- 调用：`- { id: <scene-id>, use: page.matrix-2x2 }`

```yaml
- id: matrix-2x2
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: High value, low cost first ^^先做高价值、低成本的事^^
    ylab_hi:
      type: text
      role: label
      align: center
      valign: middle
      frame:
        - 120
        - 270
        - 90
        - 310
      text: High value ^^价值高^^
    ylab_lo:
      type: text
      role: label
      align: center
      valign: middle
      frame:
        - 120
        - 600
        - 90
        - 310
      text: Low value ^^价值低^^
    q1:
      type: shape
      fill: accent-3-soft
      frame:
        - 230
        - 270
        - 780
        - 310
      text:
        - "# Do now ^^马上做^^"
        - High value · low cost ^^高价值 · 低成本^^
    q2:
      type: shape
      fill: accent-soft
      frame:
        - 1030
        - 270
        - 770
        - 310
      text:
        - "# Plan carefully ^^认真规划^^"
        - High value · high cost ^^高价值 · 高成本^^
    q3:
      type: shape
      fill: surface-2
      frame:
        - 230
        - 600
        - 780
        - 310
      text:
        - "# Do when easy ^^顺手做^^"
        - Low value · low cost ^^低价值 · 低成本^^
    q4:
      type: shape
      fill: surface-2
      frame:
        - 1030
        - 600
        - 770
        - 310
      text:
        - "# Skip for now ^^先不做^^"
        - Low value · high cost ^^低价值 · 高成本^^
    xlab:
      type: text
      role: label
      align: center
      frame:
        - 230
        - 924
        - 1570
        - 40
      text: ← Low cost · 成本低　　　　　　　　　　　　　　　　　　　　　　High cost · 成本高 →
  steps:
    - enter: q1
      effect: pop
    - enter: q2
      effect: pop
    - enter:
        - q3
        - q4
      effect: fade
```

#### page.method-map

**数据源 → 方法 → 挑战（肘形连接线）** · Sources → method → goal (elbow connectors) · 文件 `engine/library/page/method-map.yaml`

- 提示词：「方法论图」 「数据源到方法再到结果」 「多对多连线」 「肘形连接线」 「输入方法输出」 「技术路线图」 「method map」 「inputs to methods to outputs」 「elbow connectors」 「many-to-many links」 「technical roadmap」
- 适合：几个输入（数据源）经几种方法汇到几个目标（挑战 / 结果）；每个目标点击时依次展开对应的数据源、连线与方法
- 不适合：节点超过 10 个（拆页）；只是线性流程（用 page.chain-rows 或 build.diagram-flow）
- Use when: Several inputs (data sources) flow through methods to goals (challenges / results); each click unfolds the sources, links and method for one goal
- Avoid when: More than 10 nodes (split the slide); a purely linear flow (use page.chain-rows or build.diagram-flow)
- 调用：`- { id: <scene-id>, use: page.method-map }`

```yaml
- id: method-map
  layout: free
  objects:
    s1:
      type: shape
      fill: "#C04F15"
      stroke: "#662A07"
      strokeWidth: 4
      color: "#FFFFFF"
      size: 30
      align: center
      valign: middle
      padding: 0
      radius: 20
      frame:
        - 160
        - 220
        - 320
        - 120
      text: Data A ^^数据 A^^
    s2:
      type: shape
      fill: "#A02B92"
      stroke: "#460B41"
      strokeWidth: 4
      color: "#FFFFFF"
      size: 30
      align: center
      valign: middle
      padding: 0
      radius: 20
      frame:
        - 160
        - 460
        - 320
        - 120
      text: Data B ^^数据 B^^
    m1:
      type: shape
      fill: "#F2AA85"
      stroke: "#642D10"
      strokeWidth: 4
      color: "#333333"
      size: 30
      align: center
      valign: middle
      padding: 0
      radius: 20
      frame:
        - 760
        - 340
        - 360
        - 120
      text: Method ^^方法^^
    g1:
      type: shape
      fill: "#FF9901"
      stroke: "#B35A00"
      strokeWidth: 4
      color: "#B00300"
      size: 44
      weight: bold
      align: center
      valign: middle
      padding: 0
      radius: 16
      frame:
        - 1300
        - 340
        - 340
        - 120
      text: Goal ^^目标^^
    c1:
      type: shape
      geom: line
      points:
        - - 480
          - 260
        - - 620
          - 260
        - - 620
          - 380
        - - 760
          - 380
      stroke: "#C04F15"
      strokeWidth: 3
      arrow: end
      ports: true
      z: 5
    c2:
      type: shape
      geom: line
      points:
        - - 480
          - 520
        - - 620
          - 520
        - - 620
          - 420
        - - 760
          - 420
      stroke: "#7B2C7E"
      strokeWidth: 3
      arrow: end
      ports: true
      z: 5
    a1:
      type: shape
      geom: line
      points:
        - - 1130
          - 400
        - - 1300
          - 400
      stroke: "#000000"
      strokeWidth: 5
      arrow: end
  steps:
    - - enter:
          - s1
          - s2
        effect: fade-up
        stagger: 120
      - enter:
          - c1
          - c2
        effect: draw
        after: true
      - enter: m1
        effect: pop
        after: true
      - enter: a1
        effect: draw
        after: true
```

## build — 页内动画：一页之内逐次点击：出现、强调、搭建

### 页内动画 · 出现

#### build.bullets-one-by-one

**逐条出现** · Bullets one by one · 文件 `engine/library/build/bullets-one-by-one.yaml`

- 提示词：「逐条出现」 「一条一条显示」 「要点依次出现」 「点一下出一条」 「bullets one by one」 「reveal points one at a time」 「one point per click」
- 适合：讲解有先后的要点，希望听众跟着讲述节奏走
- 不适合：要点需要整体对比（一次全部显示更好）
- Use when: Points with an order, so the audience follows your pace
- Avoid when: Points meant to be compared together (show them all at once)
- 调用：`- { id: <scene-id>, use: build.bullets-one-by-one }`

```yaml
- id: bullets-one-by-one
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: One click, one point ^^每点击一次，出现一条^^
    points:
      type: text
      role: bullets
      text:
        - "First: `by: paragraph` gives each line a click ^^第一条：by paragraph 让每一段占一次点击^^"
        - "Second: `effect: fade-up` floats it in from below ^^第二条：effect 选 fade-up，自下而上浮现^^"
        - "Third: add `stagger` to cascade in one click ^^第三条：想一次点击依次出现，加 stagger^^"
  steps:
    - enter: points
      by: paragraph
      effect: fade-up
```

#### build.cards-stagger

**卡片依次浮现** · Staggered cards · 文件 `engine/library/build/cards-stagger.yaml`

- 提示词：「卡片依次出现」 「依次浮现」 「错开出现」 「一个接一个」 「stagger」 「cards one after another」 「cascade in」 「appear in sequence」
- 适合：一次点击让一组并列对象有节奏地出现
- 不适合：每个对象都需要单独讲解（每个一次点击更好）
- Use when: One click brings in a group of parallel objects with rhythm
- Avoid when: Each object needs its own explanation (one click each is better)
- 调用：`- { id: <scene-id>, use: build.cards-stagger }`

```yaml
- id: cards-stagger
  layout:
    type: grid
    cols: 3
    cellHeight: 460
  objects:
    title:
      type: text
      role: title
      text: One click, three cards, 150 ms apart ^^一次点击，三张卡片错开 150ms 浮现^^
    c1:
      type: shape
      fill: surface
      shadow: true
      text:
        - "# 01 Parse ^^解析^^"
        - YAML → validate → line numbers ^^YAML → 校验 → 行号^^
    c2:
      type: shape
      fill: surface
      shadow: true
      text:
        - "# 02 Compile ^^编译^^"
        - Layout and timing computed by code ^^布局、动画参数由代码算出^^
    c3:
      type: shape
      fill: surface
      shadow: true
      text:
        - "# 03 Check ^^检查^^"
        - Screenshots, overflow, motion ^^截图、溢出、动画一致性^^
  steps:
    - enter:
        - c1
        - c2
        - c3
      effect: fade-up
      stagger: 150
```

#### build.wipe-bars

**条形图擦除出现** · Wipe-in bars · 文件 `engine/library/build/wipe-bars.yaml`

- 提示词：「条形图出现」 「擦除」 「从左往右出现」 「进度条」 「数据条依次出现」 「wipe」 「bars grow in」 「left to right reveal」 「progress bars」
- 适合：横向条形、进度、时间轴等"有方向感"的元素
- 不适合：圆形、图标等没有方向的元素（用 fade 或 pop）
- Use when: Elements with a direction — horizontal bars, progress, time axes
- Avoid when: Directionless elements like circles or icons (use fade or pop)
- 调用：`- { id: <scene-id>, use: build.wipe-bars }`

```yaml
- id: wipe-bars
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: Directional shapes “grow” with a wipe ^^有方向的元素，用擦除让它“长”出来^^
    l1:
      type: text
      role: label
      size: 30
      frame:
        - 120
        - 320
        - 260
        - 80
      valign: middle
      text: Transport · 交通
    l2:
      type: text
      role: label
      size: 30
      frame:
        - 120
        - 440
        - 260
        - 80
      valign: middle
      text: Industry · 工业
    l3:
      type: text
      role: label
      size: 30
      frame:
        - 120
        - 560
        - 260
        - 80
      valign: middle
      text: Buildings · 建筑
    l4:
      type: text
      role: label
      size: 30
      frame:
        - 120
        - 680
        - 260
        - 80
      valign: middle
      text: Other · 其他
    b1:
      type: shape
      geom: roundRect
      radius: 12
      fill: accent
      color: "#FFFFFF"
      frame:
        - 400
        - 320
        - 1200
        - 80
      align: right
      valign: middle
      padding: 16
      size: 30
      weight: 700
      text: 92%
    b2:
      type: shape
      geom: roundRect
      radius: 12
      fill: accent
      color: "#FFFFFF"
      frame:
        - 400
        - 440
        - 960
        - 80
      align: right
      valign: middle
      padding: 16
      size: 30
      weight: 700
      text: 74%
    b3:
      type: shape
      geom: roundRect
      radius: 12
      fill: accent-soft
      color: accent
      frame:
        - 400
        - 560
        - 660
        - 80
      align: right
      valign: middle
      padding: 16
      size: 30
      weight: 700
      text: 51%
    b4:
      type: shape
      geom: roundRect
      radius: 12
      fill: accent-soft
      color: accent
      frame:
        - 400
        - 680
        - 430
        - 80
      align: right
      valign: middle
      padding: 16
      size: 30
      weight: 700
      text: 33%
  steps:
    - enter:
        - b1
        - b2
        - b3
        - b4
      effect: wipe
      from: left
      stagger: 180
```

#### build.fly-in

**两侧飞入** · Fly in from both sides · 文件 `engine/library/build/fly-in.yaml`

- 提示词：「飞入」 「从两边飞进来」 「左右飞入」 「从屏幕外进入」 「fly in」 「enter from the sides」 「left and right fly-in」 「come in from off screen」
- 适合：两个对立 / 对照的对象分别从两侧进入，最后给出结论
- 不适合：正式、克制的场合（用 fade-up 更稳）
- Use when: Two opposing or contrasting objects enter from each side, then the conclusion
- Avoid when: Formal, restrained settings (fade-up is safer)
- 调用：`- { id: <scene-id>, use: build.fly-in }`

```yaml
- id: fly-in
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: Two sides fly in, the verdict pops last ^^两个对象从两侧飞入，结论最后弹出^^
    left:
      type: shape
      fill: surface-2
      frame:
        - 120
        - 290
        - 780
        - 400
      valign: middle
      text:
        - "# By hand ^^人工制作^^"
        - Precise but slow; hard to change in bulk ^^精细，但慢；难以批量修改^^
    right:
      type: shape
      fill: accent-soft
      frame:
        - 1020
        - 290
        - 780
        - 400
      valign: middle
      text:
        - "# AI + structured source ^^AI + 结构化源文件^^"
        - Fast, and every change is checked ^^快，且每次修改都可检查^^
    concl:
      type: shape
      geom: pill
      fill: accent
      color: "#FFFFFF"
      frame:
        - 460
        - 740
        - 1000
        - 140
      align: center
      valign: middle
      weight: 700
      text: Let AI edit the source, not the pixels ^^让 AI 改源文件，而不是改像素^^
  steps:
    - enter: left
      effect: fly-in
      from: left
    - enter: right
      effect: fly-in
      from: right
    - enter: concl
      effect: pop
```

### 页内动画 · 强调

#### build.highlight

**荧光笔强调** · Highlighter · 文件 `engine/library/build/highlight.yaml`

- 提示词：「重点高亮」 「荧光笔」 「划重点」 「强调这一句」 「highlight」 「highlighter」 「mark the key line」 「emphasize this sentence」
- 适合：讲到关键句时，在它背后扫出一条底色
- 不适合：同一页强调超过两处（重点就不再是重点）
- Use when: Sweep a color band behind the key sentence when you reach it
- Avoid when: More than two highlights on one slide (nothing stands out any more)
- 调用：`- { id: <scene-id>, use: build.highlight }`

```yaml
- id: highlight
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: Emphasize the key line when you reach it ^^讲到关键句时再强调它^^
    intro:
      type: text
      role: body
      text: Show the content as usual; click when you reach the line, and a band sweeps in from the left. ^^先正常展示内容，讲到那一句时点击一次，底色从左向右扫出。^^
    key:
      type: text
      role: callout
      frame:
        - 120
        - 460
        - 1400
        - 140
      valign: middle
      text: Motion should serve the message, not decorate ^^动画应该服务于信息，而不是装饰^^
    note:
      type: text
      role: caption
      frame:
        - 120
        - 650
        - 1500
        - 100
      text: "`emphasis: key, effect: highlight` — then add a fade-up note ^^之后可以再接一个 fade-up 补充说明^^"
  steps:
    - emphasis: key
      effect: highlight
    - enter: note
      effect: fade-up
```

#### build.dim-past

**讲过的变暗** · Dim what's done · 文件 `engine/library/build/dim-past.yaml`

- 提示词：「讲过的变暗」 「当前项高亮」 「逐项讲解」 「聚焦当前这一条」 「dim previous」 「highlight current item」 「walk through steps」 「focus on this one」
- 适合：按顺序讲解几个步骤，听众始终知道"现在讲到哪一条"
- 不适合：各项需要同时比较
- Use when: Walking through steps in order so the audience always knows where you are
- Avoid when: Items that must be compared side by side
- 调用：`- { id: <scene-id>, use: build.dim-past }`

```yaml
- id: dim-past
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: Move on, and the last item dims ^^讲到下一项时，上一项变暗^^
    s1:
      type: shape
      fill: surface
      shadow: true
      frame:
        - 120
        - 290
        - 1680
        - 180
      valign: middle
      text:
        - "# ① Understand the brief · 理解需求"
        - Goal, audience, length, material · 目标、受众、时长、素材
    s2:
      type: shape
      fill: surface
      shadow: true
      frame:
        - 120
        - 500
        - 1680
        - 180
      valign: middle
      text:
        - "# ② Write the deck · 编写 deck"
        - Layout, components, States, steps · 布局、组件、State 与 steps
    s3:
      type: shape
      fill: surface
      shadow: true
      frame:
        - 120
        - 710
        - 1680
        - 180
      valign: middle
      text:
        - "# ③ Check and review · 检查与评审"
        - Screenshot → fix → independent review · 截图 → 修复 → 独立评审
  steps:
    - enter: s1
      effect: fade-up
    - - emphasis: s1
        effect: dim
      - enter: s2
        effect: fade-up
    - - emphasis: s2
        effect: dim
      - enter: s3
        effect: fade-up
```

### 页内动画 · 结构搭建

#### build.diagram-flow

**流程图逐步搭建** · Flow diagram, step by step · 文件 `engine/library/build/diagram-flow.yaml`

- 提示词：「流程图」 「逐步搭建」 「箭头画出来」 「一步一步连起来」 「流程逐步出现」 「flow diagram」 「build a process」 「draw arrows」 「connect step by step」
- 适合：讲一个有先后顺序的流程：节点弹出，箭头沿方向画出
- 不适合：节点超过 5 个（拆成两页，或用 morph 推进镜头）
- Use when: A process in order — nodes pop in, arrows draw along the direction
- Avoid when: More than 5 nodes (split into two slides, or move the camera with a morph)
- 调用：`- { id: <scene-id>, use: build.diagram-flow }`

```yaml
- id: diagram-flow
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: Node pops, arrow draws, next node follows ^^节点弹出，箭头画出，下一节点接着出现^^
    b1:
      type: shape
      fill: surface
      shadow: true
      frame:
        - 120
        - 420
        - 420
        - 240
      align: center
      valign: middle
      text:
        - "# Parse ^^解析^^"
        - YAML → validate
    b2:
      type: shape
      fill: surface
      shadow: true
      frame:
        - 750
        - 420
        - 420
        - 240
      align: center
      valign: middle
      text:
        - "# Compile ^^编译^^"
        - Layout · motion
    b3:
      type: shape
      fill: accent
      color: "#FFFFFF"
      shadow: true
      frame:
        - 1380
        - 420
        - 420
        - 240
      align: center
      valign: middle
      text:
        - "# Render ^^渲染^^"
        - Reveal.js page
    a1:
      type: shape
      geom: line
      from:
        - 560
        - 540
      to:
        - 730
        - 540
      arrow: end
      stroke: muted
      strokeWidth: 5
    a2:
      type: shape
      geom: line
      from:
        - 1190
        - 540
      to:
        - 1360
        - 540
      arrow: end
      stroke: muted
      strokeWidth: 5
    note:
      type: text
      role: caption
      frame:
        - 120
        - 740
        - 1680
        - 100
      align: center
      text: "Arrows use `effect: draw`; the next node waits with `after: true` ^^箭头用 effect: draw，下一个节点用 after: true 等箭头画完再弹出^^"
  steps:
    - enter: b1
      effect: pop
    - - enter: a1
        effect: draw
      - enter: b2
        effect: pop
        after: true
    - - enter: a2
        effect: draw
      - enter: b3
        effect: pop
        after: true
```

## morph — 状态切换：同一画面在多个 State 之间平滑变化

### 状态切换 · 版面变化

#### morph.title-to-header

**标题上移，内容进场** · Title moves up, content enters · 文件 `engine/library/morph/title-to-header.yaml`

- 提示词：「标题上移」 「标题缩小到顶部」 「从标题过渡到内容」 「magic move 标题」 「magic move title」 「title shrinks to the top」 「title to content」
- 适合：先用大标题抛出问题，再让标题退到页眉、内容进场
- 不适合：每页都这样做（会显得拖沓）
- Use when: Pose a question with a big title, then move it up to the header as content enters
- Avoid when: Doing it on every slide (feels slow)
- 调用：`- { id: <scene-id>, use: morph.title-to-header }`

```yaml
- id: title-to-header
  layout: free
  objects:
    title:
      type: text
      role: title
      size: 104
      align: center
      frame:
        - 160
        - 300
        - 1600
        - 220
      text: What is a Scene? ^^什么是 Scene？^^
    sub:
      type: text
      role: subtitle
      align: center
      frame:
        - 160
        - 540
        - 1600
        - 120
      text: One canvas, changing smoothly across a few States ^^同一个画面，在几个状态之间连续变化^^
    c1:
      type: shape
      fill: surface
      shadow: true
      frame:
        - 120
        - 300
        - 520
        - 520
      text:
        - "# Object pool ^^对象池^^"
        - Each object defined once; its key is its identity ^^每个对象定义一次，key 就是它的身份^^
    c2:
      type: shape
      fill: surface
      shadow: true
      frame:
        - 700
        - 300
        - 520
        - 520
      text:
        - "# State"
        - Visible objects + overrides ^^可见对象 + 属性覆盖^^
    c3:
      type: shape
      fill: accent
      color: "#FFFFFF"
      shadow: true
      frame:
        - 1280
        - 300
        - 520
        - 520
      text:
        - "# Morph"
        - Same key interpolates between States ^^同一 key 在 State 之间自动插值^^
  states:
    - show:
        - title
        - sub
    - show:
        - title
        - c1
        - c2
        - c3
      override:
        title:
          size: 64
          frame:
            - 160
            - 70
            - 1600
            - 150
      transition:
        duration: 900
```

#### morph.overview-to-detail

**从概览到详情** · Overview to detail · 文件 `engine/library/morph/overview-to-detail.yaml`

- 提示词：「从概览到详情」 「移到一边展开」 「对象移动腾出空间」 「展开讲解」 「move aside」 「overview to detail」 「make room for details」 「expand on it」
- 适合：先展示一个概念，再让它移到一侧、给细节腾出空间——听众始终看得到"在讲哪个"
- 不适合：概念与细节没有从属关系
- Use when: Show a concept, then move it aside to make room for details — the audience always sees what you are talking about
- Avoid when: The details don't belong to the concept
- 调用：`- { id: <scene-id>, use: morph.overview-to-detail }`

```yaml
- id: overview-to-detail
  layout: free
  objects:
    card:
      type: shape
      fill: accent
      color: "#FFFFFF"
      shadow: true
      frame:
        - 560
        - 290
        - 800
        - 440
      align: center
      valign: middle
      size: 40
      text:
        - "# Scene"
        - A continuous set of States ^^一组有连续性的 State^^
    head:
      type: text
      role: title
      frame:
        - 120
        - 70
        - 1680
        - 150
      text: Three parts of a Scene ^^Scene 的三个要素^^
    detail:
      type: text
      role: bullets
      frame:
        - 780
        - 270
        - 1020
        - 600
      text:
        - "**objects**: the object pool; key = identity ^^对象池，key 即身份^^"
        - "**states**: visible objects + overrides ^^每个 State = 可见对象 + 属性覆盖^^"
        - "**transition**: States morph by default ^^State 之间默认 morph^^"
  states:
    - show:
        - card
    - show:
        - card
        - head
        - detail
      override:
        card:
          frame:
            - 120
            - 270
            - 560
            - 560
          size: 34
```

#### morph.layout-switch

**列表变网格** · List to grid · 文件 `engine/library/morph/layout-switch.yaml`

- 提示词：「列表变网格」 「重新排列」 「布局切换」 「横排变竖排」 「rearrange」 「list to grid」 「switch layout」 「rows to columns」
- 适合：同一组对象换一种组织方式：先逐行讲，再并排比较
- 不适合：对象数量在两种布局中不同
- Use when: Reorganize the same objects — walk through them as rows, then compare side by side
- Avoid when: The number of objects differs between the two layouts
- 调用：`- { id: <scene-id>, use: morph.layout-switch }`

```yaml
- id: layout-switch
  layout:
    type: grid
    cols: 1
  objects:
    title:
      type: text
      role: title
      text: Same objects, new arrangement ^^同一组对象，换一种排列^^
    i1:
      type: shape
      fill: surface
      shadow: true
      valign: middle
      size: 30
      text:
        - "# Cover · 封面"
        - page.cover
    i2:
      type: shape
      fill: surface
      shadow: true
      valign: middle
      size: 30
      text:
        - "# Bullets · 要点"
        - page.title-bullets
    i3:
      type: shape
      fill: surface
      shadow: true
      valign: middle
      size: 30
      text:
        - "# Cards · 卡片"
        - page.cards-3
    i4:
      type: shape
      fill: accent
      color: "#FFFFFF"
      shadow: true
      valign: middle
      size: 30
      text:
        - "# Big number · 大数字"
        - page.big-number
  states:
    - {}
    - layout:
        type: grid
        cols: 4
        cellHeight: 520
      transition:
        stagger: 80
```

#### morph.acronym-collapse

**缩略词收拢成品牌字** · Acronym collapse · 文件 `engine/library/morph/acronym-collapse.yaml`

- 提示词：「首字母缩写」 「缩略词展开」 「项目全称收拢成名字」 「字母合并」 「开场 morph 成 logo 字」 「acronym」 「collapse to brand name」 「initials merge」 「opening morph to logo」
- 适合：开场先展开项目全称（大写首字母 + 小字），点击后首字母放大靠拢成品牌名，其余文字淡出、副标题与 logo 进场
- 不适合：首字母不在同一基线上，或全称很长、小字挤不下
- Use when: Open with the full project name (big initials + small words); on click the initials grow and close up into the brand name, the rest fades out and a tagline appears
- Avoid when: Initials not on one baseline, or a name too long for the small words
- 调用：`- { id: <scene-id>, use: morph.acronym-collapse }`

```yaml
- id: acronym-collapse
  layout: free
  theme: dark
  objects:
    shade:
      type: shape
      geom: rect
      fill: rgba(18,58,132,.9)
      frame:
        - 0
        - 0
        - 1920
        - 1080
    a:
      type: text
      size: 170
      weight: 900
      color: "#FFFFFF"
      lineHeight: 1
      align: center
      frame:
        - 300
        - 340
        - 140
        - 170
      text: A
    b:
      type: text
      size: 170
      weight: 900
      color: "#FFFFFF"
      lineHeight: 1
      align: center
      frame:
        - 820
        - 340
        - 140
        - 170
      text: B
    c:
      type: text
      size: 170
      weight: 900
      color: "#FFFFFF"
      lineHeight: 1
      align: center
      frame:
        - 1340
        - 340
        - 140
        - 170
      text: C
    wa:
      type: text
      size: 36
      color: "#FFFFFF"
      lineHeight: 1
      frame:
        - 430
        - 453
        - 330
        - 50
      text: lpha study
    wb:
      type: text
      size: 36
      color: "#FFFFFF"
      lineHeight: 1
      frame:
        - 950
        - 453
        - 330
        - 50
      text: road survey
    wc:
      type: text
      size: 36
      color: "#FFFFFF"
      lineHeight: 1
      frame:
        - 1470
        - 453
        - 330
        - 50
      text: ity analysis
    tag:
      type: text
      size: 50
      weight: bold
      color: "#FFFFFF"
      align: center
      frame:
        - 160
        - 630
        - 1600
        - 140
      text: The project in one line ^^一句话说明这个项目^^
  states:
    - show:
        - shade
        - a
        - b
        - c
        - wa
        - wb
        - wc
    - show:
        - shade
        - a
        - b
        - c
        - tag
      override:
        a:
          size: 250
          frame:
            - 640
            - 372
            - 220
            - 290
        b:
          size: 250
          frame:
            - 860
            - 372
            - 220
            - 290
        c:
          size: 250
          frame:
            - 1080
            - 372
            - 220
            - 290
      transition:
        duration: 1100
```

### 状态切换 · 聚焦

#### morph.focus-zoom

**放大其中一项** · Zoom into one item · 文件 `engine/library/morph/focus-zoom.yaml`

- 提示词：「放大其中一个」 「聚焦」 「突出某一项」 「其他变暗」 「zoom in」 「focus」 「focus on one」 「enlarge this item」 「dim the others」
- 适合：从几个并列项中挑一个深入讲：它放大，其他变暗但保留上下文
- 不适合：要连续深入每一项（考虑每项一个 scene）
- Use when: Pick one of several parallel items to go deeper — it grows, the others dim but stay in context
- Avoid when: Going deep into every item in turn (consider one scene per item)
- 调用：`- { id: <scene-id>, use: morph.focus-zoom }`

```yaml
- id: focus-zoom
  layout: free
  objects:
    title:
      type: text
      role: title
      frame:
        - 120
        - 70
        - 1680
        - 150
      text: Four subsystems ^^四个子系统^^
    c1:
      type: shape
      fill: surface
      shadow: true
      frame:
        - 120
        - 250
        - 820
        - 340
      valign: middle
      text:
        - "# Compiler ^^编译器^^"
        - YAML → IR
    c2:
      type: shape
      fill: surface
      shadow: true
      frame:
        - 980
        - 250
        - 820
        - 340
      valign: middle
      text:
        - "# Motion ^^动画^^"
        - steps & morph
    c3:
      type: shape
      fill: surface
      shadow: true
      frame:
        - 120
        - 630
        - 820
        - 340
      valign: middle
      text:
        - "# QA"
        - Screenshots & checks ^^截图与检查^^
    c4:
      type: shape
      fill: surface
      shadow: true
      frame:
        - 980
        - 630
        - 820
        - 340
      valign: middle
      text:
        - "# Library ^^效果库^^"
        - Scenes ↔ prompts
    d2:
      type: text
      role: body
      frame:
        - 480
        - 470
        - 960
        - 400
      z: 6
      text:
        - "- Builds: fragments, within a State ^^点击构建：fragment，State 内^^"
        - "- Morphs: between States ^^状态切换：morph，State 之间^^"
        - "- One preset table, in code ^^一张 preset 表，代码实现^^"
  states:
    - show:
        - title
        - c1
        - c2
        - c3
        - c4
    - add:
        - d2
      transition:
        intent: focus
        target:
          - c2
          - d2
      override:
        c2:
          frame:
            - 400
            - 230
            - 1120
            - 700
          z: 5
          valign: top
          size: 40
        title:
          opacity: 1
```

### 状态切换 · 数据与进度

#### morph.chart-grow

**柱状图数值变化** · Bars that grow · 文件 `engine/library/morph/chart-grow.yaml`

- 提示词：「数据变化」 「柱子长高」 「柱状图动画」 「从去年到今年」 「数值增长」 「chart animation」 「bars grow」 「this year vs last year」 「values change」
- 适合：同一组数据在两个时间点 / 两种情景之间的变化
- 不适合：数据点超过 8 个（等 M2 的图表组件）
- Use when: One data set changing between two points in time or two scenarios
- Avoid when: More than 8 data points (use the chart component)
- 调用：`- { id: <scene-id>, use: morph.chart-grow }`

```yaml
- id: chart-grow
  layout: free
  objects:
    title:
      type: text
      role: title
      frame:
        - 120
        - 70
        - 1300
        - 150
      text: "Emissions by sector: 2020 → 2024 ^^各部门排放：2020 → 2024^^"
    year:
      type: text
      frame:
        - 1400
        - 70
        - 400
        - 140
      size: 120
      weight: 800
      font: display
      color: accent
      align: right
      lineHeight: 1
      text: "2020"
    base:
      type: shape
      geom: line
      from:
        - 200
        - 900
      to:
        - 1720
        - 900
      stroke: line
      strokeWidth: 3
    b1:
      type: shape
      geom: roundRect
      radius: 10
      fill: accent-soft
      frame:
        - 260
        - 700
        - 180
        - 200
    b2:
      type: shape
      geom: roundRect
      radius: 10
      fill: accent-soft
      frame:
        - 560
        - 640
        - 180
        - 260
    b3:
      type: shape
      geom: roundRect
      radius: 10
      fill: accent-soft
      frame:
        - 860
        - 720
        - 180
        - 180
    b4:
      type: shape
      geom: roundRect
      radius: 10
      fill: accent-soft
      frame:
        - 1160
        - 580
        - 180
        - 320
    b5:
      type: shape
      geom: roundRect
      radius: 10
      fill: accent-soft
      frame:
        - 1460
        - 660
        - 180
        - 240
    v1:
      type: text
      role: label
      size: 30
      color: ink
      align: center
      frame:
        - 250
        - 640
        - 200
        - 50
      text: "200"
    v2:
      type: text
      role: label
      size: 30
      color: ink
      align: center
      frame:
        - 550
        - 580
        - 200
        - 50
      text: "260"
    v3:
      type: text
      role: label
      size: 30
      color: ink
      align: center
      frame:
        - 850
        - 660
        - 200
        - 50
      text: "180"
    v4:
      type: text
      role: label
      size: 30
      color: ink
      align: center
      frame:
        - 1150
        - 520
        - 200
        - 50
      text: "320"
    v5:
      type: text
      role: label
      size: 30
      color: ink
      align: center
      frame:
        - 1450
        - 600
        - 200
        - 50
      text: "240"
    x1:
      type: text
      role: label
      size: 28
      align: center
      frame:
        - 230
        - 915
        - 240
        - 90
      text: Transport ^^交通^^
    x2:
      type: text
      role: label
      size: 28
      align: center
      frame:
        - 530
        - 915
        - 240
        - 90
      text: Industry ^^工业^^
    x3:
      type: text
      role: label
      size: 28
      align: center
      frame:
        - 830
        - 915
        - 240
        - 90
      text: Buildings ^^建筑^^
    x4:
      type: text
      role: label
      size: 28
      align: center
      frame:
        - 1130
        - 915
        - 240
        - 90
      text: Power ^^电力^^
    x5:
      type: text
      role: label
      size: 28
      align: center
      frame:
        - 1430
        - 915
        - 240
        - 90
      text: Other ^^其他^^
  states:
    - {}
    - transition:
        duration: 1000
        stagger: 60
      override:
        year:
          text: "2024"
        b1:
          frame:
            - 260
            - 620
            - 180
            - 280
        b2:
          frame:
            - 560
            - 520
            - 180
            - 380
        b3:
          frame:
            - 860
            - 690
            - 180
            - 210
        b4:
          frame:
            - 1160
            - 300
            - 180
            - 600
          fill: accent-2
        b5:
          frame:
            - 1460
            - 560
            - 180
            - 340
        v1:
          frame:
            - 250
            - 560
            - 200
            - 50
          text: "280"
        v2:
          frame:
            - 550
            - 460
            - 200
            - 50
          text: "380"
        v3:
          frame:
            - 850
            - 630
            - 200
            - 50
          text: "210"
        v4:
          frame:
            - 1150
            - 240
            - 200
            - 50
          text: "600"
          color: accent-2
        v5:
          frame:
            - 1450
            - 500
            - 200
            - 50
          text: "340"
```

#### morph.timeline-progress

**时间线推进** · Advancing timeline · 文件 `engine/library/morph/timeline-progress.yaml`

- 提示词：「时间线」 「路线图」 「里程碑推进」 「进度往前走」 「roadmap」 「timeline」 「advance milestones」 「move progress forward」
- 适合：路线图、阶段计划、历史沿革：每次点击推进到下一个节点
- 不适合：节点超过 6 个（分段讲）
- Use when: Roadmaps, phase plans, histories — each click advances to the next node
- Avoid when: More than 6 nodes (present in segments)
- 调用：`- { id: <scene-id>, use: morph.timeline-progress }`

```yaml
- id: timeline-progress
  layout: free
  objects:
    title:
      type: text
      role: title
      frame:
        - 120
        - 70
        - 1680
        - 150
      text: Roadmap ^^路线图^^
    track:
      type: shape
      geom: rect
      fill: line
      frame:
        - 200
        - 556
        - 1520
        - 8
    prog:
      type: shape
      geom: rect
      fill: accent
      frame:
        - 200
        - 556
        - 100
        - 8
    d1:
      type: shape
      geom: ellipse
      fill: accent
      frame:
        - 282
        - 542
        - 36
        - 36
    d2:
      type: shape
      geom: ellipse
      fill: line
      frame:
        - 722
        - 542
        - 36
        - 36
    d3:
      type: shape
      geom: ellipse
      fill: line
      frame:
        - 1162
        - 542
        - 36
        - 36
    d4:
      type: shape
      geom: ellipse
      fill: line
      frame:
        - 1602
        - 542
        - 36
        - 36
    ring:
      type: shape
      geom: ellipse
      fill: transparent
      stroke: accent
      strokeWidth: 4
      frame:
        - 264
        - 524
        - 72
        - 72
    t1:
      type: text
      role: heading
      align: center
      frame:
        - 120
        - 380
        - 360
        - 120
      valign: bottom
      text: M0 Skeleton ^^骨架^^
    t2:
      type: text
      role: heading
      align: center
      color: muted
      frame:
        - 560
        - 380
        - 360
        - 120
      valign: bottom
      text: M1 Rebuild PPT ^^复刻 PPT^^
    t3:
      type: text
      role: heading
      align: center
      color: muted
      frame:
        - 1000
        - 380
        - 360
        - 120
      valign: bottom
      text: M2 Native ^^原生生成^^
    t4:
      type: text
      role: heading
      align: center
      color: muted
      frame:
        - 1440
        - 380
        - 360
        - 120
      valign: bottom
      text: M3 Interactive ^^交互^^
    s1:
      type: text
      role: caption
      align: center
      frame:
        - 120
        - 630
        - 360
        - 200
      text: Compiler, library, screenshot QA ^^编译器、效果库、截图 QA^^
    s2:
      type: text
      role: caption
      align: center
      frame:
        - 560
        - 630
        - 360
        - 200
      opacity: 0.45
      text: PPTX import, step-by-step diff ^^PPTX 导入、逐步对比^^
    s3:
      type: text
      role: caption
      align: center
      frame:
        - 1000
        - 630
        - 360
        - 200
      opacity: 0.45
      text: Three decks prove it generalizes ^^三套 deck 验证泛化^^
    s4:
      type: text
      role: caption
      align: center
      frame:
        - 1440
        - 630
        - 360
        - 200
      opacity: 0.45
      text: State-driven interactive charts ^^状态驱动的交互图表^^
  states:
    - {}
    - override:
        prog:
          frame:
            - 200
            - 556
            - 540
            - 8
        ring:
          frame:
            - 704
            - 524
            - 72
            - 72
        d2:
          fill: accent
        t2:
          color: ink
        s2:
          opacity: 1
    - override:
        prog:
          frame:
            - 200
            - 556
            - 980
            - 8
        ring:
          frame:
            - 1144
            - 524
            - 72
            - 72
        d3:
          fill: accent
        t3:
          color: ink
        s3:
          opacity: 1
    - override:
        prog:
          frame:
            - 200
            - 556
            - 1420
            - 8
        ring:
          frame:
            - 1584
            - 524
            - 72
            - 72
        d4:
          fill: accent
        t4:
          color: ink
        s4:
          opacity: 1
```

## interact — 交互数据：可悬停、点击、切换的图表与数据面板；讲述推进和自由探索共用同一套状态

### 交互数据 · 交互图表

#### interact.bar-explore

**可交互柱状图** · Interactive bar chart · 文件 `engine/library/interact/bar-explore.yaml`

- 提示词：「交互图表」 「可交互柱状图」 「悬停看数值」 「点击高亮」 「切换年份」 「interactive bar chart」 「hover for values」 「click to highlight」 「switch years」
- 适合：讲完一组数据后，让听众或演讲者自己探索：悬停看数值、点击某一柱高亮并显示读数、按钮切换年份
- 不适合：只需要传达一个结论（用 page.big-number）
- Use when: After presenting a data set, let the audience or presenter explore — hover for values, click a bar to highlight it, switch years with buttons
- Avoid when: You only need to land one conclusion (use page.big-number)
- 调用：`- { id: <scene-id>, use: interact.bar-explore }`

```yaml
- id: bar-explore
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: Hover for values, click to highlight, switch years ^^悬停看数值，点击高亮，按钮切换年份^^
    chart:
      type: chart
      kind: bar
      categories:
        - Transport · 交通
        - Industry · 工业
        - Buildings · 建筑
        - Power · 电力
        - Other · 其他
      series:
        "2020":
          - 200
          - 260
          - 180
          - 320
          - 240
        "2024":
          - 280
          - 380
          - 210
          - 600
          - 340
      show:
        - "2024"
      switch: true
      detail: true
      unit: Mt
      source: Sample data · 示例数据
```

#### interact.line-legend

**折线图 + 图例开关** · Line chart + legend toggles · 文件 `engine/library/interact/line-legend.yaml`

- 提示词：「折线图」 「趋势图」 「图例开关」 「显示隐藏某条线」 「多条趋势对比」 「interactive line chart」 「trend chart」 「toggle lines in legend」 「compare trends」
- 适合：多条时间趋势放在一起：点击图例开关某条线，点击线条高亮它，悬停看具体年份的数值
- 不适合：线条超过 6 条（先筛选，或拆成小多图）
- Use when: Several trends over time — click the legend to toggle a line, click a line to highlight it, hover for each year's value
- Avoid when: More than 6 lines (filter first, or use small multiples)
- 调用：`- { id: <scene-id>, use: interact.line-legend }`

```yaml
- id: line-legend
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: Click the legend to toggle, a line to highlight ^^点击图例开关折线，点击线条高亮^^
    chart:
      type: chart
      kind: line
      categories:
        - 2016
        - 2017
        - 2018
        - 2019
        - 2020
        - 2021
        - 2022
        - 2023
        - 2024
      series:
        - name: Power · 电力
          values:
            - 420
            - 440
            - 470
            - 500
            - 480
            - 520
            - 560
            - 580
            - 600
        - name: Industry · 工业
          values:
            - 330
            - 335
            - 345
            - 350
            - 300
            - 340
            - 360
            - 370
            - 380
        - name: Transport · 交通
          values:
            - 210
            - 220
            - 235
            - 245
            - 200
            - 230
            - 255
            - 268
            - 280
        - name: Buildings · 建筑
          values:
            - 170
            - 175
            - 180
            - 185
            - 180
            - 190
            - 200
            - 205
            - 210
      detail: true
      unit: Mt
      source: Sample data · 示例数据
```

#### interact.hbar-ranking

**排行榜条形图** · Ranking bars · 文件 `engine/library/interact/hbar-ranking.yaml`

- 提示词：「排行榜」 「横向条形图」 「排名」 「前十名」 「top 10」 「ranking」 「horizontal bar chart」 「leaderboard」
- 适合：名称较长、需要排序比较的一组数值（城市、产品、部门）；可预设高亮其中一项
- 不适合：有时间维度（用 interact.line-legend）
- Use when: Sorted values with long names (cities, products, teams); optionally pre-highlight one
- Avoid when: Data over time (use interact.line-legend)
- 调用：`- { id: <scene-id>, use: interact.hbar-ranking }`

```yaml
- id: hbar-ranking
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: Rankings stay readable with long names ^^排行榜：名称长也能读清^^
    chart:
      type: chart
      kind: hbar
      categories:
        - City A · 城市 A
        - City B · 城市 B
        - City C · 城市 C
        - City D · 城市 D
        - City E · 城市 E
        - City F · 城市 F
        - City G · 城市 G
      series:
        Emissions · 排放量:
          - 612
          - 540
          - 498
          - 430
          - 377
          - 301
          - 254
      highlight: City C · 城市 C
      unit: Mt
      source: Sample data · click a bar to highlight · 示例数据 · 点击条形切换高亮
```

### 交互数据 · 联动与面板

#### interact.linked-views

**联动视图** · Linked views · 文件 `engine/library/interact/linked-views.yaml`

- 提示词：「联动图表」 「图表联动」 「点一个另一个跟着变」 「联动高亮」 「linked views」 「crossfilter」 「linked highlight」 「click one chart to update the other」
- 适合：同一组对象有两种视角（构成 + 趋势）：在一张图里选中，另一张图同步高亮
- 不适合：两张图的分类 / 系列名不一致（联动按名字匹配）
- Use when: Two views of the same things (composition + trend) — select in one chart, the other highlights in sync
- Avoid when: Category / series names differ between the charts (linking matches by name)
- 调用：`- { id: <scene-id>, use: interact.linked-views }`

```yaml
- id: linked-views
  layout:
    type: split
    ratio: 48
  objects:
    title:
      type: text
      role: title
      text: Click a bar; the matching line lights up ^^点左边的柱子，右边的折线同步高亮^^
    bars:
      type: chart
      slot: left
      kind: bar
      categories:
        - Power · 电力
        - Industry · 工业
        - Transport · 交通
        - Buildings · 建筑
      series:
        "2024":
          - 600
          - 380
          - 280
          - 210
      link: sector
      unit: Mt
      source: Mix in 2024 (sample) · 2024 年构成（示例）
    lines:
      type: chart
      slot: right
      kind: line
      categories:
        - 2016
        - 2018
        - 2020
        - 2022
        - 2024
      series:
        - name: Power · 电力
          values:
            - 420
            - 470
            - 480
            - 560
            - 600
        - name: Industry · 工业
          values:
            - 330
            - 345
            - 300
            - 360
            - 380
        - name: Transport · 交通
          values:
            - 210
            - 235
            - 200
            - 255
            - 280
        - name: Buildings · 建筑
          values:
            - 170
            - 180
            - 180
            - 200
            - 210
      legend: false
      link: sector
      unit: Mt
      source: Trend (sample) · 历年趋势（示例）
```

#### interact.dashboard

**数据面板** · Dashboard · 文件 `engine/library/interact/dashboard.yaml`

- 提示词：「数据面板」 「仪表盘」 「dashboard」 「指标卡加图表」 「可交互的数据看板」 「数据大屏」 「KPI cards with charts」 「interactive data panel」
- 适合：一页同时给出关键指标与可探索的明细：顶部指标卡，下方两张联动图表（可切换年份、点击高亮）
- 不适合：听众需要一步一步理解（拆成 interact.narrated 的多个 State）
- Use when: Key metrics plus explorable detail on one slide — metric cards on top, two linked charts below (switch years, click to highlight)
- Avoid when: The audience needs to follow step by step (split into States with interact.narrated)
- 调用：`- { id: <scene-id>, use: interact.dashboard }`

```yaml
- id: dashboard
  layout: free
  objects:
    title:
      type: text
      role: title
      frame:
        - 120
        - 40
        - 1680
        - 150
      text: City emissions dashboard ^^城市排放数据面板^^
    k1bg:
      type: shape
      fill: surface
      shadow: true
      frame:
        - 120
        - 200
        - 540
        - 190
    k1:
      type: metric
      frame:
        - 160
        - 222
        - 460
        - 150
      value: "1.47"
      unit: Gt
      label: Total emissions 2024 · 2024 年总排放
      delta: +2.3%
      tone: down
      size: 76
    k2bg:
      type: shape
      fill: surface
      shadow: true
      frame:
        - 690
        - 200
        - 540
        - 190
    k2:
      type: metric
      frame:
        - 730
        - 222
        - 460
        - 150
      value: "41"
      unit: "%"
      label: Power sector share · 电力部门占比
      delta: +5 pt
      tone: neutral
      size: 76
      color: accent-2
    k3bg:
      type: shape
      fill: surface
      shadow: true
      frame:
        - 1260
        - 200
        - 540
        - 190
    k3:
      type: metric
      frame:
        - 1300
        - 222
        - 460
        - 150
      value: "28"
      unit: cities
      label: Cities included · 纳入统计的城市
      size: 76
      color: accent-3
    bars:
      type: chart
      frame:
        - 120
        - 430
        - 820
        - 570
      kind: bar
      categories:
        - Power · 电力
        - Industry · 工业
        - Transport · 交通
        - Buildings · 建筑
      series:
        "2020":
          - 480
          - 300
          - 200
          - 180
        "2024":
          - 600
          - 380
          - 280
          - 210
      show:
        - "2024"
      switch: true
      link: sector
      unit: Mt
      size: 22
    lines:
      type: chart
      frame:
        - 980
        - 430
        - 820
        - 570
      kind: line
      categories:
        - 2016
        - 2018
        - 2020
        - 2022
        - 2024
      series:
        - name: Power · 电力
          values:
            - 420
            - 470
            - 480
            - 560
            - 600
        - name: Industry · 工业
          values:
            - 330
            - 345
            - 300
            - 360
            - 380
        - name: Transport · 交通
          values:
            - 210
            - 235
            - 200
            - 255
            - 280
        - name: Buildings · 建筑
          values:
            - 170
            - 180
            - 180
            - 200
            - 210
      detail: true
      link: sector
      unit: Mt
      size: 22
```

### 交互数据 · 讲述 + 探索

#### interact.narrated

**讲述驱动 + 自由探索** · Narrate, then explore · 文件 `engine/library/interact/narrated.yaml`

- 提示词：「边讲边变的图表」 「讲述驱动图表」 「一步步讲数据」 「讲完再探索」 「数据故事」 「narrated chart」 「data story」 「walk through the data」 「explore after the story」
- 适合：先按讲述顺序推进图表（换年份 → 高亮重点），讲完后听众可自由点击探索；翻回本页时自动复位到讲述状态
- 不适合：数据没有先后的叙事顺序（直接用 interact.bar-explore）
- Use when: Advance the chart in story order (switch year → highlight the key bar); afterwards anyone can click to explore; returning to the slide resets the story
- Avoid when: The data has no narrative order (use interact.bar-explore)
- 调用：`- { id: <scene-id>, use: interact.narrated }`

```yaml
- id: narrated
  layout: free
  objects:
    title:
      type: text
      role: title
      frame:
        - 120
        - 50
        - 1680
        - 150
      text: Power drives the growth in emissions ^^排放增长主要来自电力^^
    chart:
      type: chart
      frame:
        - 120
        - 220
        - 1180
        - 770
      kind: bar
      categories:
        - Transport · 交通
        - Industry · 工业
        - Buildings · 建筑
        - Power · 电力
        - Other · 其他
      series:
        "2020":
          - 200
          - 260
          - 180
          - 320
          - 240
        "2024":
          - 280
          - 380
          - 210
          - 600
          - 340
      show:
        - "2020"
      switch: true
      detail: true
      unit: Mt
    note:
      type: text
      role: body
      frame:
        - 1360
        - 290
        - 440
        - 640
      text:
        - "# ① 2020"
        - Five sectors, roughly even ^^五个部门大致相当^^
  states:
    - {}
    - override:
        chart:
          show:
            - "2024"
        note:
          text:
            - "# ② 2024"
            - Every sector grew; bars rise smoothly ^^所有部门都在增长，柱子平滑长高^^
    - override:
        chart:
          highlight: Power · 电力
        note:
          text:
            - "# ③ Focus: power ^^重点：电力^^"
            - 320 → 600, nearly doubled ^^几乎翻倍^^
            - Then click and switch years freely ^^讲完可自由点击、切换年份^^
```

## image — 位图操作：对截图、照片等位图做局部放大、标注、聚光与对比

### 位图操作 · 放大与聚光

#### image.zoom-region

**局部放大** · Zoom into a region · 文件 `engine/library/image/zoom-region.yaml`

- 提示词：「放大图片局部」 「截图放大」 「推镜头」 「放大看细节」 「zoom in on image」 「图片 zoom」 「push in on a screenshot」 「enlarge a detail」 「image zoom」
- 适合：截图或照片里只有一小块是重点：先看全局，再把镜头推到细节，标注框跟着图片一起移动
- 不适合：图片本身分辨率太低，放大后会糊（换高清图或截取局部）
- Use when: Only a small part of a screenshot or photo matters — show the whole, then push the camera in; markers move with the image
- Avoid when: Low-resolution images that blur when enlarged (use a sharper image or a crop)
- 调用：`- { id: <scene-id>, use: image.zoom-region }`

```yaml
- id: zoom-region
  layout: free
  objects:
    title:
      type: text
      role: title
      frame:
        - 120
        - 50
        - 1680
        - 150
      text: Whole first, then the detail ^^先看全局，再推到细节^^
    shot:
      type: image
      src: "@lib/sample-ui.png"
      frame:
        - 120
        - 230
        - 1120
        - 700
      radius: 20
      shadow: true
    ring:
      type: shape
      geom: roundRect
      radius: 18
      fill: transparent
      stroke: accent-2
      strokeWidth: 6
      on: shot
      box:
        - 0.575
        - 0.1
        - 0.205
        - 0.16
    note:
      type: text
      role: body
      frame:
        - 1300
        - 230
        - 500
        - 700
      text:
        - "# Overview ^^全局^^"
        - "The whole screenshot: show what we're looking at ^^整张截图：听众先知道自己在看什么^^"
  states:
    - show:
        - title
        - shot
        - note
    - add:
        - ring
      override:
        shot:
          zoom:
            at:
              - 0.678
              - 0.18
            scale: 2.6
        note:
          text:
            - "# Zoom in ^^放大细节^^"
            - "`zoom: { at: [u, v], scale }`"
            - Markers use `on` + `box` in image coordinates and zoom along ^^标注写在图片坐标里，会跟着放大^^
    - override:
        shot:
          zoom:
            at:
              - 0.633
              - 0.42
            scale: 2.2
        ring:
          geom: ellipse
          box:
            - 0.6
            - 0.355
            - 0.066
            - 0.09
        note:
          text:
            - "# Another spot ^^换一处^^"
            - Add another zoom; the camera pans and the same ring follows ^^再写一个 zoom，镜头平移过去，ring 也跟着移动^^
```

#### image.spotlight

**聚光灯** · Spotlight · 文件 `engine/library/image/spotlight.yaml`

- 提示词：「聚光灯」 「只亮这一块」 「其他区域变暗」 「高亮截图某个区域」 「spotlight」 「light up one area」 「dim the rest」 「highlight part of a screenshot」
- 适合：讲解截图或界面的各个区域：当前区域保持明亮，其他压暗；每次点击移到下一个区域
- 不适合：区域很小（用 image.circle-mark 圈出来更清楚）
- Use when: Walk through areas of a screenshot or UI — the current area stays bright, the rest dims; each click moves to the next area
- Avoid when: Very small areas (circle them with image.circle-mark)
- 调用：`- { id: <scene-id>, use: image.spotlight }`

```yaml
- id: spotlight
  layout: free
  objects:
    title:
      type: text
      role: title
      frame:
        - 120
        - 50
        - 1680
        - 150
      z: 5
      text: One area at a time ^^一次只看一个区域^^
    shot:
      type: image
      src: "@lib/sample-ui.png"
      frame:
        - 120
        - 230
        - 1120
        - 700
      radius: 20
    spot:
      type: shape
      geom: spotlight
      radius: 16
      stroke: "#FFFFFF"
      strokeWidth: 3
      on: shot
      box:
        - 0.161
        - 0.1
        - 0.83
        - 0.16
    note:
      type: text
      role: body
      frame:
        - 1300
        - 230
        - 500
        - 700
      z: 5
      text:
        - "# Overview ^^整体界面^^"
        - Let the audience see the whole screen first ^^先让听众看清整张截图^^
  states:
    - show:
        - title
        - shot
        - note
    - add:
        - spot
      override:
        title:
          color: "#FFFFFF"
        note:
          color: "#FFFFFF"
          text:
            - "# ① Key metrics ^^核心指标^^"
            - Four cards across the top ^^顶部四张指标卡^^
    - override:
        spot:
          box:
            - 0.161
            - 0.272
            - 0.535
            - 0.37
        note:
          text:
            - "# ② Trend ^^趋势^^"
            - Daily active users keep rising ^^每日活跃用户持续上升^^
    - override:
        spot:
          box:
            - 0.699
            - 0.272
            - 0.285
            - 0.37
        note:
          text:
            - "# ③ Channels ^^渠道^^"
            - Search brings in almost half ^^搜索贡献了将近一半^^
```

### 位图操作 · 标注

#### image.arrow-label

**箭头 + 说明** · Arrow + label · 文件 `engine/library/image/arrow-label.yaml`

- 提示词：「加箭头」 「箭头指向」 「在截图上标注」 「指给大家看」 「加说明文字」 「arrow annotation」 「point at this」 「annotate a screenshot」 「callout with arrow」
- 适合：在截图 / 照片上指出某个位置，并在旁边写一句说明；箭头画出后说明出现
- 不适合：需要指出的位置超过 3 处（拆成多个 State，或改用 image.spotlight）
- Use when: Point at a spot in a screenshot or photo with a one-line note beside it; the arrow draws, then the note appears
- Avoid when: More than 3 spots (split into States, or use image.spotlight)
- 调用：`- { id: <scene-id>, use: image.arrow-label }`

```yaml
- id: arrow-label
  layout: free
  objects:
    title:
      type: text
      role: title
      frame:
        - 120
        - 50
        - 1680
        - 150
      text: Arrow draws first, then the note ^^箭头先画出来，说明再出现^^
    shot:
      type: image
      src: "@lib/sample-ui.png"
      frame:
        - 120
        - 230
        - 1120
        - 700
      radius: 20
      shadow: true
    a1:
      type: shape
      geom: line
      on: shot
      from:
        - 1.04
        - 0.286
      to:
        - 0.92
        - 0.075
      arrow: end
      stroke: accent-2
      strokeWidth: 6
    l1:
      type: shape
      geom: roundRect
      fill: accent-2
      color: "#FFFFFF"
      frame:
        - 1300
        - 290
        - 500
        - 280
      valign: middle
      text:
        - "# Export ^^导出按钮^^"
        - One-click report ^^一键导出报告^^
    a2:
      type: shape
      geom: line
      on: shot
      from:
        - 1.04
        - 0.686
      to:
        - 0.9
        - 0.825
      arrow: end
      stroke: accent
      strokeWidth: 6
    l2:
      type: shape
      geom: roundRect
      fill: accent
      color: "#FFFFFF"
      frame:
        - 1300
        - 600
        - 500
        - 280
      valign: middle
      text:
        - "# Pending order ^^待处理订单^^"
        - "Status: processing ^^状态：处理中^^"
  steps:
    - - enter: a1
        effect: draw
      - enter: l1
        effect: fade-left
        after: true
    - - enter: a2
        effect: draw
      - enter: l2
        effect: fade-left
        after: true
```

#### image.circle-mark

**圈出重点** · Circle it · 文件 `engine/library/image/circle-mark.yaml`

- 提示词：「加圆圈」 「圈出来」 「圈重点」 「在照片上画圈」 「标记位置」 「circle」 「circle this spot」 「mark a location」 「ring on a photo」
- 适合：在照片 / 地图 / 截图上圈出一两个关键位置，配一个短标签
- 不适合：圈出的对象需要详细解释（配合 image.arrow-label）
- Use when: Circle one or two key spots on a photo, map or screenshot, each with a short label
- Avoid when: The circled thing needs a detailed explanation (pair with image.arrow-label)
- 调用：`- { id: <scene-id>, use: image.circle-mark }`

```yaml
- id: circle-mark
  layout: free
  objects:
    title:
      type: text
      role: title
      frame:
        - 120
        - 50
        - 1680
        - 150
      text: Circle one point at a time ^^一次圈出一个重点^^
    photo:
      type: image
      src: "@lib/sample-city.png"
      frame:
        - 120
        - 230
        - 1120
        - 700
      radius: 20
      shadow: true
    r1:
      type: shape
      geom: ellipse
      fill: transparent
      stroke: "#FFD166"
      strokeWidth: 6
      on: photo
      box:
        - 0.585
        - 0.03
        - 0.1
        - 0.16
    t1:
      type: shape
      geom: pill
      fill: "#FFD166"
      color: ink
      align: center
      valign: middle
      size: 26
      weight: 700
      on: photo
      box:
        - 0.7
        - 0.07
        - 0.25
        - 0.08
      text: Tower · 信号塔
    r2:
      type: shape
      geom: ellipse
      fill: transparent
      stroke: "#FFFFFF"
      strokeWidth: 6
      on: photo
      box:
        - 0.13
        - 0.43
        - 0.22
        - 0.35
    t2:
      type: shape
      geom: pill
      fill: "#FFFFFF"
      color: ink
      align: center
      valign: middle
      size: 26
      weight: 700
      on: photo
      box:
        - 0.1
        - 0.33
        - 0.2
        - 0.08
      text: Sunset · 落日
    note:
      type: text
      role: body
      frame:
        - 1300
        - 230
        - 500
        - 700
      text:
        - "# Circle + label ^^圈 + 标签^^"
        - Ellipse, transparent fill, stroke ^^圆圈用 ellipse + 透明填充 + 描边^^
        - "Place it in image coordinates: `on: photo, box: [u, v, w, h]` ^^位置写在图片坐标里^^"
  steps:
    - - enter: r1
        effect: pop
      - enter: t1
        effect: fade-up
        after: true
    - - enter: r2
        effect: pop
      - enter: t2
        effect: fade-up
        after: true
```

#### image.text-emphasis

**截图文字强调** · Mark text in a screenshot · 文件 `engine/library/image/text-emphasis.yaml`

- 提示词：「强调截图里的文字」 「荧光笔标出」 「标出数字」 「划出这段」 「文字强调」 「mark text」 「highlight a number in a screenshot」 「highlighter box」 「call out this figure」
- 适合：截图里的某个数字或某句话就是论点：先用荧光框标出它，再弹出放大的结论
- 不适合：截图文字太小、投影看不清（先用 image.zoom-region 放大）
- Use when: A number or sentence in the screenshot is the point — mark it with a highlighter box, then pop up the enlarged takeaway
- Avoid when: Screenshot text too small to read when projected (zoom first with image.zoom-region)
- 调用：`- { id: <scene-id>, use: image.text-emphasis }`

```yaml
- id: text-emphasis
  layout: free
  objects:
    title:
      type: text
      role: title
      frame:
        - 120
        - 50
        - 1680
        - 150
      text: Pull the key number out of the screenshot ^^把截图里的关键数字“拎出来”^^
    shot:
      type: image
      src: "@lib/sample-ui.png"
      frame:
        - 120
        - 230
        - 1120
        - 700
      radius: 20
      shadow: true
    mark:
      type: shape
      geom: roundRect
      radius: 8
      fill: rgba(238,106,44,.22)
      stroke: accent-2
      strokeWidth: 3
      on: shot
      box:
        - 0.588
        - 0.2
        - 0.17
        - 0.05
    big:
      type: shape
      geom: roundRect
      fill: accent-2
      color: "#FFFFFF"
      shadow: true
      frame:
        - 1300
        - 260
        - 500
        - 360
      align: center
      valign: middle
      text:
        - "# +12.0%"
        - Monthly revenue, MoM ^^月收入环比^^
      size: 44
    note:
      type: text
      role: caption
      frame:
        - 1300
        - 650
        - 500
        - 260
      text: Translucent fill + stroke, wiped in; the takeaway card pops ^^荧光框用半透明填充 + 描边，wipe 擦出；结论卡片 pop 弹出^^
  steps:
    - enter: mark
      effect: wipe
      from: left
    - enter: big
      effect: pop
```

### 位图操作 · 对比

#### image.before-after

**前后对比** · Before / after · 文件 `engine/library/image/before-after.yaml`

- 提示词：「前后对比」 「处理前处理后」 「对比两张图」 「修图前后」 「before after 图片」 「before after image」 「compare two versions」 「wipe to reveal」 「edited vs original」
- 适合：同一画面的两个版本（处理前后、改版前后、两个时间点），叠放后用擦除揭示差异
- 不适合：两张图构图不同（并排放：page.comparison）
- Use when: Two versions of the same frame (before/after processing, redesign, two dates), stacked and revealed with a wipe
- Avoid when: The two images are framed differently (place side by side — page.comparison)
- 调用：`- { id: <scene-id>, use: image.before-after }`

```yaml
- id: before-after
  layout: free
  objects:
    title:
      type: text
      role: title
      frame:
        - 120
        - 50
        - 1680
        - 150
      text: Same frame, the new version wipes in ^^同一画面，从左往右擦出新版本^^
    before:
      type: image
      src: "@lib/sample-city.png"
      frame:
        - 120
        - 230
        - 1120
        - 700
      radius: 20
      filter: grayscale(1) brightness(.9)
    after:
      type: image
      src: "@lib/sample-city.png"
      frame:
        - 120
        - 230
        - 1120
        - 700
      radius: 20
    lb:
      type: shape
      geom: pill
      fill: rgba(0,0,0,.55)
      color: "#FFFFFF"
      align: center
      valign: middle
      size: 26
      weight: 700
      frame:
        - 150
        - 260
        - 220
        - 56
      z: 3
      text: Before · 处理前
    la:
      type: shape
      geom: pill
      fill: accent
      color: "#FFFFFF"
      align: center
      valign: middle
      size: 26
      weight: 700
      frame:
        - 990
        - 260
        - 220
        - 56
      z: 3
      text: After · 处理后
    note:
      type: text
      role: body
      frame:
        - 1300
        - 230
        - 500
        - 700
      text:
        - "# Stack + wipe ^^叠放 + 擦除^^"
        - Two images, one frame; the top one wipes in ^^两张图同一个 frame；上面一张用 wipe 出现^^
        - "Filter: `filter: grayscale(1)` ^^滤镜^^"
  steps:
    - - enter: after
        effect: wipe
        from: left
        duration: 1400
      - enter: la
        effect: fade
        after: true
```

