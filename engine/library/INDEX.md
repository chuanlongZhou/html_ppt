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
| `page` 页面版式 | 常用页面的版式与配色 | 结构页（3） · 文字页（4） · 图文与对比（4） · 数据页（1） |
| `build` 页内动画 | 一页之内逐次点击：出现、强调、搭建 | 出现（4） · 强调（2） · 结构搭建（1） |
| `morph` 状态切换 | 同一画面在多个 State 之间平滑变化 | 版面变化（3） · 聚焦（1） · 数据与进度（2） |
| `interact` 交互数据 | 可悬停、点击、切换的图表与数据面板；讲述推进和自由探索共用同一套状态 | 交互图表（3） · 联动与面板（2） · 讲述 + 探索（1） |
| `image` 位图操作 | 对截图、照片等位图做局部放大、标注、聚光与对比 | 放大与聚光（2） · 标注（3） · 对比（1） |

## 提示词速查

| 提示词 | 条目 | 分类 |
|---|---|---|
| 「封面」 「标题页」 「开场页」 「第一页」 「cover slide」 | [`page.cover`](#pagecover) 封面 | 页面版式 · 结构页 |
| 「章节页」 「过渡页」 「分隔页」 「第几部分」 「section divider」 | [`page.section`](#pagesection) 章节页 | 页面版式 · 结构页 |
| 「结尾」 「谢谢」 「结束页」 「Q&A」 「联系方式」 「closing」 | [`page.closing`](#pageclosing) 结尾页 | 页面版式 · 结构页 |
| 「观点页」 「金句」 「一句话结论」 「大字报」 「强调一个观点」 「big statement」 | [`page.statement`](#pagestatement) 观点页 | 页面版式 · 文字页 |
| 「要点页」 「列表页」 「几条要点」 「bullet points」 「标题加正文」 | [`page.title-bullets`](#pagetitle-bullets) 标题 + 要点 | 页面版式 · 文字页 |
| 「引用」 「名言」 「用户原话」 「引述」 「quote」 | [`page.quote`](#pagequote) 引用 | 页面版式 · 文字页 |
| 「代码页」 「展示代码」 「配置示例」 「代码讲解」 「code」 | [`page.code`](#pagecode) 代码 + 讲解 | 页面版式 · 文字页 |
| 「左文右图」 「图文页」 「左边文字右边图」 「观点加证据」 「split」 | [`page.split`](#pagesplit) 左文右图 | 页面版式 · 图文与对比 |
| 「三个卡片」 「三栏」 「三个要点并列」 「卡片布局」 「三个特点」 「cards」 | [`page.cards-3`](#pagecards-3) 三卡片 | 页面版式 · 图文与对比 |
| 「对比」 「之前之后」 「before after」 「优缺点」 「两种方案对比」 「vs」 | [`page.comparison`](#pagecomparison) 左右对比 | 页面版式 · 图文与对比 |
| 「全屏图片」 「背景图」 「图片铺满」 「大图配标题」 「full bleed」 | [`page.full-bleed`](#pagefull-bleed) 全图背景 | 页面版式 · 图文与对比 |
| 「大数字」 「一个数字」 「关键指标」 「数据亮点」 「KPI」 「big number」 | [`page.big-number`](#pagebig-number) 大数字 | 页面版式 · 数据页 |
| 「逐条出现」 「一条一条显示」 「要点依次出现」 「点一下出一条」 「bullets one by one」 | [`build.bullets-one-by-one`](#buildbullets-one-by-one) 逐条出现 | 页内动画 · 出现 |
| 「卡片依次出现」 「依次浮现」 「错开出现」 「一个接一个」 「stagger」 | [`build.cards-stagger`](#buildcards-stagger) 卡片依次浮现 | 页内动画 · 出现 |
| 「条形图出现」 「擦除」 「从左往右出现」 「进度条」 「数据条依次出现」 「wipe」 | [`build.wipe-bars`](#buildwipe-bars) 条形图擦除出现 | 页内动画 · 出现 |
| 「飞入」 「从两边飞进来」 「左右飞入」 「从屏幕外进入」 「fly in」 | [`build.fly-in`](#buildfly-in) 两侧飞入 | 页内动画 · 出现 |
| 「重点高亮」 「荧光笔」 「划重点」 「强调这一句」 「highlight」 | [`build.highlight`](#buildhighlight) 荧光笔强调 | 页内动画 · 强调 |
| 「讲过的变暗」 「当前项高亮」 「逐项讲解」 「聚焦当前这一条」 「dim previous」 | [`build.dim-past`](#builddim-past) 讲过的变暗 | 页内动画 · 强调 |
| 「流程图」 「逐步搭建」 「箭头画出来」 「一步一步连起来」 「流程逐步出现」 「flow diagram」 | [`build.diagram-flow`](#builddiagram-flow) 流程图逐步搭建 | 页内动画 · 结构搭建 |
| 「标题上移」 「标题缩小到顶部」 「从标题过渡到内容」 「magic move 标题」 | [`morph.title-to-header`](#morphtitle-to-header) 标题上移，内容进场 | 状态切换 · 版面变化 |
| 「从概览到详情」 「移到一边展开」 「对象移动腾出空间」 「展开讲解」 「move aside」 | [`morph.overview-to-detail`](#morphoverview-to-detail) 从概览到详情 | 状态切换 · 版面变化 |
| 「列表变网格」 「重新排列」 「布局切换」 「横排变竖排」 「rearrange」 | [`morph.layout-switch`](#morphlayout-switch) 列表变网格 | 状态切换 · 版面变化 |
| 「放大其中一个」 「聚焦」 「突出某一项」 「其他变暗」 「zoom in」 「focus」 | [`morph.focus-zoom`](#morphfocus-zoom) 放大其中一项 | 状态切换 · 聚焦 |
| 「数据变化」 「柱子长高」 「柱状图动画」 「从去年到今年」 「数值增长」 「chart animation」 | [`morph.chart-grow`](#morphchart-grow) 柱状图数值变化 | 状态切换 · 数据与进度 |
| 「时间线」 「路线图」 「里程碑推进」 「进度往前走」 「roadmap」 「timeline」 | [`morph.timeline-progress`](#morphtimeline-progress) 时间线推进 | 状态切换 · 数据与进度 |
| 「交互图表」 「可交互柱状图」 「悬停看数值」 「点击高亮」 「切换年份」 「interactive bar chart」 | [`interact.bar-explore`](#interactbar-explore) 可交互柱状图 | 交互数据 · 交互图表 |
| 「折线图」 「趋势图」 「图例开关」 「显示隐藏某条线」 「多条趋势对比」 「interactive line chart」 | [`interact.line-legend`](#interactline-legend) 折线图 + 图例开关 | 交互数据 · 交互图表 |
| 「排行榜」 「横向条形图」 「排名」 「前十名」 「top 10」 「ranking」 | [`interact.hbar-ranking`](#interacthbar-ranking) 排行榜条形图 | 交互数据 · 交互图表 |
| 「联动图表」 「图表联动」 「点一个另一个跟着变」 「联动高亮」 「linked views」 「crossfilter」 | [`interact.linked-views`](#interactlinked-views) 联动视图 | 交互数据 · 联动与面板 |
| 「数据面板」 「仪表盘」 「dashboard」 「指标卡加图表」 「可交互的数据看板」 「数据大屏」 | [`interact.dashboard`](#interactdashboard) 数据面板 | 交互数据 · 联动与面板 |
| 「边讲边变的图表」 「讲述驱动图表」 「一步步讲数据」 「讲完再探索」 「数据故事」 「narrated chart」 | [`interact.narrated`](#interactnarrated) 讲述驱动 + 自由探索 | 交互数据 · 讲述 + 探索 |
| 「放大图片局部」 「截图放大」 「推镜头」 「放大看细节」 「zoom in on image」 「图片 zoom」 | [`image.zoom-region`](#imagezoom-region) 局部放大 | 位图操作 · 放大与聚光 |
| 「聚光灯」 「只亮这一块」 「其他区域变暗」 「高亮截图某个区域」 「spotlight」 | [`image.spotlight`](#imagespotlight) 聚光灯 | 位图操作 · 放大与聚光 |
| 「加箭头」 「箭头指向」 「在截图上标注」 「指给大家看」 「加说明文字」 「arrow annotation」 | [`image.arrow-label`](#imagearrow-label) 箭头 + 说明 | 位图操作 · 标注 |
| 「加圆圈」 「圈出来」 「圈重点」 「在照片上画圈」 「标记位置」 「circle」 | [`image.circle-mark`](#imagecircle-mark) 圈出重点 | 位图操作 · 标注 |
| 「强调截图里的文字」 「荧光笔标出」 「标出数字」 「划出这段」 「文字强调」 「mark text」 | [`image.text-emphasis`](#imagetext-emphasis) 截图文字强调 | 位图操作 · 标注 |
| 「前后对比」 「处理前处理后」 「对比两张图」 「修图前后」 「before after 图片」 | [`image.before-after`](#imagebefore-after) 前后对比 | 位图操作 · 对比 |

## page — 页面版式：常用页面的版式与配色

### 页面版式 · 结构页

#### page.cover

**封面** · 文件 `engine/library/page/cover.yaml`

- 提示词：「封面」 「标题页」 「开场页」 「第一页」 「cover slide」
- 适合：演示的第一页：主题、副标题、作者与日期
- 不适合：章节之间的过渡页（用 page.section）
- 调用：`- { id: <scene-id>, use: page.cover }`

```yaml
- id: cover
  layout: hero
  objects:
    kicker:
      type: text
      role: kicker
      text: 项目介绍 · 2026
    title:
      type: text
      role: title
      text: |-
        AI 原生的
        网页演示文稿
    subtitle:
      type: text
      role: subtitle
      text: 让 AI 像写代码一样制作、检查和维护演示
    meta:
      type: text
      role: meta
      text: 作者 · 日期 · 场合
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

**章节页** · 文件 `engine/library/page/section.yaml`

- 提示词：「章节页」 「过渡页」 「分隔页」 「第几部分」 「section divider」
- 适合：进入新的部分；深色背景让听众意识到"换话题了"
- 不适合：每两三页就插一个（太碎）
- 调用：`- { id: <scene-id>, use: page.section }`

```yaml
- id: section
  layout: hero
  theme: dark
  objects:
    kicker:
      type: text
      role: kicker
      text: 第 01 部分
    title:
      type: text
      role: title
      text: 核心模型
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
      size: 560
      weight: 800
      lineHeight: 1
      color: accent
      opacity: 0.22
      align: right
      valign: middle
      font: display
```

#### page.closing

**结尾页** · 文件 `engine/library/page/closing.yaml`

- 提示词：「结尾」 「谢谢」 「结束页」 「Q&A」 「联系方式」 「closing」
- 适合：最后一页：致谢、联系方式、下一步行动
- 不适合：用"谢谢"代替总结（结尾前应先有一页 takeaway）
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
      text: 谢谢
    subtitle:
      type: text
      role: subtitle
      text: 问题与讨论
    meta:
      type: text
      role: meta
      text: github.com/your/repo · you@example.com
```

### 页面版式 · 文字页

#### page.statement

**观点页** · 文件 `engine/library/page/statement.yaml`

- 提示词：「观点页」 「金句」 「一句话结论」 「大字报」 「强调一个观点」 「big statement」
- 适合：整场只想让听众记住的一句话；章节开头或结尾
- 不适合：需要证据支撑的论点（先给证据页）
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
        演示文稿是 ==结构化程序==，
        不是页面图片。
    caption:
      type: text
      role: caption
      text: 一页只放一句话；关键词用 ==强调色==
```

#### page.title-bullets

**标题 + 要点** · 文件 `engine/library/page/title-bullets.yaml`

- 提示词：「要点页」 「列表页」 「几条要点」 「bullet points」 「标题加正文」
- 适合：3–5 条并列要点；标题直接写结论
- 不适合：超过 6 条，或要点之间需要对比（用 page.comparison / page.cards-3）
- 调用：`- { id: <scene-id>, use: page.title-bullets }`

```yaml
- id: title-bullets
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: 标题写结论，而不是写主题
    points:
      type: text
      role: bullets
      text:
        - 每条只讲一件事，控制在一行半以内
        - 3–5 条最合适，再多就拆页
        - 关键词用 ==强调色==，不要整句加粗
        - + 子要点用 + 开头，会缩进并变浅
        - 段落前缀：- 要点，1. 编号，# 小标题
```

#### page.quote

**引用** · 文件 `engine/library/page/quote.yaml`

- 提示词：「引用」 「名言」 「用户原话」 「引述」 「quote」
- 适合：引用专家、用户或文献的原话，增加可信度
- 不适合：引文超过三行（摘要后再引用）
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
        演示文稿不是页面图片，
        而是一段可以被理解和修改的结构化程序。
    caption:
      type: text
      role: caption
      text: —— 项目设计原则
```

#### page.code

**代码 + 讲解** · 文件 `engine/library/page/code.yaml`

- 提示词：「代码页」 「展示代码」 「配置示例」 「代码讲解」 「code」
- 适合：展示一段代码或配置，并在旁边解释关键行
- 不适合：代码超过 15 行（只截取关键部分）
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
      text: 一段 YAML 就是一页演示
    code:
      type: text
      role: code
      slot: left
      text: |
        - id: india            # 一个 scene
          layout: split
          objects:             # 对象池：key 即身份
            map:   { type: image, src: map.svg }
            total: { type: metric, value: 3100 }
          states:              # State 之间 morph
            - show: [map]
            - add: [total]
    notes:
      type: text
      role: bullets
      slot: right
      text:
        - "**objects**：每个对象定义一次"
        - "**states**：同一画面的多个状态"
        - "**steps**：State 内的点击构建"
        - 坐标、动画参数由引擎计算
```

### 页面版式 · 图文与对比

#### page.split

**左文右图** · 文件 `engine/library/page/split.yaml`

- 提示词：「左文右图」 「图文页」 「左边文字右边图」 「观点加证据」 「split」
- 适合：一个结论 + 一张支撑它的图、截图或图表
- 不适合：图本身信息量很大（让图占满整页，用 page.full-bleed 或单独一页）
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
      text: 左边讲观点，右边给证据
    claim:
      type: text
      role: heading
      slot: left
      text: 一句话结论放在最上面
    body:
      type: text
      role: bullets
      slot: left
      text:
        - 左栏：结论 + 2–3 条支撑
        - 右栏：图、截图或图表
        - 比例用 ratio 调整（默认 50）
    visual:
      type: image
      src: "@lib/chart.svg"
      slot: right
      fit: contain
```

#### page.cards-3

**三卡片** · 文件 `engine/library/page/cards-3.yaml`

- 提示词：「三个卡片」 「三栏」 「三个要点并列」 「卡片布局」 「三个特点」 「cards」
- 适合：2–4 个并列、同等重要的概念或特点
- 不适合：有先后顺序（用 build.diagram-flow）或有主次（用 page.split）
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
      text: 并列的概念用卡片
    c1:
      type: shape
      fill: surface
      shadow: true
      text:
        - "# 结构化"
        - 演示是 YAML 源文件：可以 diff、复用、测试
    c2:
      type: shape
      fill: surface
      shadow: true
      text:
        - "# 可动画"
        - 同一对象跨 State 平滑变化，动画就是信息
    c3:
      type: shape
      fill: accent
      color: "#FFFFFF"
      shadow: true
      text:
        - "# 可检查"
        - 每次改动后自动截图、查溢出、查动画
```

#### page.comparison

**左右对比** · 文件 `engine/library/page/comparison.yaml`

- 提示词：「对比」 「之前之后」 「before after」 「优缺点」 「两种方案对比」 「vs」
- 适合：两种方案、新旧做法、优缺点的对照
- 不适合：超过两个对象（用 page.cards-3）
- 调用：`- { id: <scene-id>, use: page.comparison }`

```yaml
- id: comparison
  layout: split
  objects:
    title:
      type: text
      role: title
      text: 对比：两栏同结构，颜色区分立场
    a:
      type: shape
      slot: left
      fill: surface-2
      text:
        - "# 以前：AI 生成 PPTX"
        - "- 对象是零散的文本框"
        - "- 动画难以程序化"
        - "- 改一处，要重新生成"
    b:
      type: shape
      slot: right
      fill: accent-soft
      text:
        - "# 现在：AI 编写 deck.yaml"
        - "- 对象有语义和身份"
        - "- 动画是状态变化"
        - "- 改一处，只动一处"
```

#### page.full-bleed

**全图背景** · 文件 `engine/library/page/full-bleed.yaml`

- 提示词：「全屏图片」 「背景图」 「图片铺满」 「大图配标题」 「full bleed」
- 适合：用一张有冲击力的图片定调；文字压在图上
- 不适合：图片细节本身是要讲的内容（不要压字）
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
        - 560
        - 1300
        - 240
      valign: bottom
      text: 用一张图定调
    sub:
      type: text
      role: subtitle
      color: rgba(255,255,255,.85)
      frame:
        - 120
        - 820
        - 1300
        - 80
      text: 图片铺满舞台，叠一层半透明遮罩保证文字可读
```

### 页面版式 · 数据页

#### page.big-number

**大数字** · 文件 `engine/library/page/big-number.yaml`

- 提示词：「大数字」 「一个数字」 「关键指标」 「数据亮点」 「KPI」 「big number」
- 适合：一个数字就能说明问题；用 label 解释它，用 source 标明来源
- 不适合：需要比较多个数字（用 morph.chart-grow 或卡片）
- 调用：`- { id: <scene-id>, use: page.big-number }`

```yaml
- id: big-number
  layout: center
  objects:
    kicker:
      type: text
      role: kicker
      text: 一个数字说明问题
    n:
      type: metric
      value: "3.1"
      unit: Gt CO₂
      label: 2024 年城市排放总量（示例数据）
      delta: −12% vs 2019
      tone: up
      align: center
      size: 220
    caption:
      type: text
      role: caption
      text: 大数字 + 单位 + 一句解释；数据来源写在 source 字段
```

## build — 页内动画：一页之内逐次点击：出现、强调、搭建

### 页内动画 · 出现

#### build.bullets-one-by-one

**逐条出现** · 文件 `engine/library/build/bullets-one-by-one.yaml`

- 提示词：「逐条出现」 「一条一条显示」 「要点依次出现」 「点一下出一条」 「bullets one by one」
- 适合：讲解有先后的要点，希望听众跟着讲述节奏走
- 不适合：要点需要整体对比（一次全部显示更好）
- 调用：`- { id: <scene-id>, use: build.bullets-one-by-one }`

```yaml
- id: bullets-one-by-one
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: 每点击一次，出现一条
    points:
      type: text
      role: bullets
      text:
        - 第一条：by paragraph 让每一段占一次点击
        - 第二条：effect 选 fade-up，自下而上浮现
        - 第三条：想一次点击依次出现，加 stagger
  steps:
    - enter: points
      by: paragraph
      effect: fade-up
```

#### build.cards-stagger

**卡片依次浮现** · 文件 `engine/library/build/cards-stagger.yaml`

- 提示词：「卡片依次出现」 「依次浮现」 「错开出现」 「一个接一个」 「stagger」
- 适合：一次点击让一组并列对象有节奏地出现
- 不适合：每个对象都需要单独讲解（每个一次点击更好）
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
      text: 一次点击，三张卡片错开 150ms 浮现
    c1:
      type: shape
      fill: surface
      shadow: true
      text:
        - "# 01 解析"
        - YAML → 校验 → 行号
    c2:
      type: shape
      fill: surface
      shadow: true
      text:
        - "# 02 编译"
        - 布局、动画参数由代码算出
    c3:
      type: shape
      fill: surface
      shadow: true
      text:
        - "# 03 检查"
        - 截图、溢出、动画一致性
  steps:
    - enter:
        - c1
        - c2
        - c3
      effect: fade-up
      stagger: 150
```

#### build.wipe-bars

**条形图擦除出现** · 文件 `engine/library/build/wipe-bars.yaml`

- 提示词：「条形图出现」 「擦除」 「从左往右出现」 「进度条」 「数据条依次出现」 「wipe」
- 适合：横向条形、进度、时间轴等"有方向感"的元素
- 不适合：圆形、图标等没有方向的元素（用 fade 或 pop）
- 调用：`- { id: <scene-id>, use: build.wipe-bars }`

```yaml
- id: wipe-bars
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: 有方向的元素，用擦除让它"长"出来
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
      text: 交通
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
      text: 工业
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
      text: 建筑
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
      text: 其他
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

**两侧飞入** · 文件 `engine/library/build/fly-in.yaml`

- 提示词：「飞入」 「从两边飞进来」 「左右飞入」 「从屏幕外进入」 「fly in」
- 适合：两个对立 / 对照的对象分别从两侧进入，最后给出结论
- 不适合：正式、克制的场合（用 fade-up 更稳）
- 调用：`- { id: <scene-id>, use: build.fly-in }`

```yaml
- id: fly-in
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: 两个对象从两侧飞入，结论最后弹出
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
        - "# 人工制作"
        - 精细，但慢；难以批量修改
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
        - "# AI + 结构化源文件"
        - 快，且每次修改都可检查
    concl:
      type: shape
      geom: pill
      fill: accent
      color: "#FFFFFF"
      frame:
        - 560
        - 760
        - 800
        - 110
      align: center
      valign: middle
      weight: 700
      text: 结论：让 AI 改源文件，而不是改像素
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

**荧光笔强调** · 文件 `engine/library/build/highlight.yaml`

- 提示词：「重点高亮」 「荧光笔」 「划重点」 「强调这一句」 「highlight」
- 适合：讲到关键句时，在它背后扫出一条底色
- 不适合：同一页强调超过两处（重点就不再是重点）
- 调用：`- { id: <scene-id>, use: build.highlight }`

```yaml
- id: highlight
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: 讲到关键句时再强调它
    intro:
      type: text
      role: body
      text: 先正常展示内容，讲到那一句时点击一次，底色从左向右扫出。
    key:
      type: text
      role: callout
      frame:
        - 120
        - 470
        - 760
        - 90
      valign: middle
      text: 动画应该服务于信息，而不是装饰
    note:
      type: text
      role: caption
      frame:
        - 120
        - 620
        - 1300
        - 60
      text: "emphasis: key, effect: highlight —— 之后可以再接一个 fade-up 补充说明"
  steps:
    - emphasis: key
      effect: highlight
    - enter: note
      effect: fade-up
```

#### build.dim-past

**讲过的变暗** · 文件 `engine/library/build/dim-past.yaml`

- 提示词：「讲过的变暗」 「当前项高亮」 「逐项讲解」 「聚焦当前这一条」 「dim previous」
- 适合：按顺序讲解几个步骤，听众始终知道"现在讲到哪一条"
- 不适合：各项需要同时比较
- 调用：`- { id: <scene-id>, use: build.dim-past }`

```yaml
- id: dim-past
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: 讲到下一项时，上一项变暗
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
        - "# ① 理解需求"
        - 目标、受众、时长、素材
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
        - "# ② 编写 deck"
        - 布局、组件、States 与 steps
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
        - "# ③ 检查与评审"
        - 截图 → 修复 → 独立评审
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

**流程图逐步搭建** · 文件 `engine/library/build/diagram-flow.yaml`

- 提示词：「流程图」 「逐步搭建」 「箭头画出来」 「一步一步连起来」 「流程逐步出现」 「flow diagram」
- 适合：讲一个有先后顺序的流程：节点弹出，箭头沿方向画出
- 不适合：节点超过 5 个（拆成两页，或用 morph 推进镜头）
- 调用：`- { id: <scene-id>, use: build.diagram-flow }`

```yaml
- id: diagram-flow
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: 节点弹出，箭头画出，下一节点接着出现
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
        - "# 解析"
        - YAML → 校验
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
        - "# 编译"
        - 布局 · 动画
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
        - "# 渲染"
        - Reveal.js 网页
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
        - 760
        - 1680
        - 60
      align: center
      text: "箭头用 effect: draw，下一个节点用 after: true 等箭头画完再弹出"
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

**标题上移，内容进场** · 文件 `engine/library/morph/title-to-header.yaml`

- 提示词：「标题上移」 「标题缩小到顶部」 「从标题过渡到内容」 「magic move 标题」
- 适合：先用大标题抛出问题，再让标题退到页眉、内容进场
- 不适合：每页都这样做（会显得拖沓）
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
        - 360
        - 1600
        - 150
      text: 什么是 Scene？
    sub:
      type: text
      role: subtitle
      align: center
      frame:
        - 160
        - 540
        - 1600
        - 70
      text: 同一个画面，在几个状态之间连续变化
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
        - "# 对象池"
        - 每个对象定义一次，key 就是它的身份
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
        - 可见对象 + 属性覆盖
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
        - 同一 key 在 State 之间自动插值
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
            - 84
            - 1600
            - 110
      transition:
        duration: 900
```

#### morph.overview-to-detail

**从概览到详情** · 文件 `engine/library/morph/overview-to-detail.yaml`

- 提示词：「从概览到详情」 「移到一边展开」 「对象移动腾出空间」 「展开讲解」 「move aside」
- 适合：先展示一个概念，再让它移到一侧、给细节腾出空间——听众始终看得到"在讲哪个"
- 不适合：概念与细节没有从属关系
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
        - 一组有连续性的 State
    head:
      type: text
      role: title
      frame:
        - 120
        - 84
        - 1680
        - 110
      text: Scene 的三个要素
    detail:
      type: text
      role: bullets
      frame:
        - 780
        - 270
        - 1020
        - 560
      text:
        - "**objects**：对象池，key 即身份"
        - "**states**：每个 State = 可见对象 + 属性覆盖"
        - "**transition**：State 之间默认 morph"
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

**列表变网格** · 文件 `engine/library/morph/layout-switch.yaml`

- 提示词：「列表变网格」 「重新排列」 「布局切换」 「横排变竖排」 「rearrange」
- 适合：同一组对象换一种组织方式：先逐行讲，再并排比较
- 不适合：对象数量在两种布局中不同
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
      text: 同一组对象，换一种排列
    i1:
      type: shape
      fill: surface
      shadow: true
      valign: middle
      size: 30
      text:
        - "# 封面"
        - page.cover
    i2:
      type: shape
      fill: surface
      shadow: true
      valign: middle
      size: 30
      text:
        - "# 要点"
        - page.title-bullets
    i3:
      type: shape
      fill: surface
      shadow: true
      valign: middle
      size: 30
      text:
        - "# 卡片"
        - page.cards-3
    i4:
      type: shape
      fill: accent
      color: "#FFFFFF"
      shadow: true
      valign: middle
      size: 30
      text:
        - "# 大数字"
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

### 状态切换 · 聚焦

#### morph.focus-zoom

**放大其中一项** · 文件 `engine/library/morph/focus-zoom.yaml`

- 提示词：「放大其中一个」 「聚焦」 「突出某一项」 「其他变暗」 「zoom in」 「focus」
- 适合：从几个并列项中挑一个深入讲：它放大，其他变暗但保留上下文
- 不适合：要连续深入每一项（考虑每项一个 scene）
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
        - 84
        - 1680
        - 110
      text: 四个子系统
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
        - "# 编译器"
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
        - "# 动画"
        - steps 与 morph
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
        - 截图与检查
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
        - "# 效果库"
        - 场景 ↔ 提示词
    d2:
      type: text
      role: body
      frame:
        - 480
        - 470
        - 960
        - 380
      z: 6
      text:
        - "- 点击构建：fragment，State 内"
        - "- 状态切换：morph，State 之间"
        - "- 一张 preset 表，代码实现"
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

**柱状图数值变化** · 文件 `engine/library/morph/chart-grow.yaml`

- 提示词：「数据变化」 「柱子长高」 「柱状图动画」 「从去年到今年」 「数值增长」 「chart animation」
- 适合：同一组数据在两个时间点 / 两种情景之间的变化
- 不适合：数据点超过 8 个（等 M2 的图表组件）
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
        - 84
        - 1300
        - 110
      text: 各部门排放：2020 → 2024
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
        - 250
        - 920
        - 200
        - 50
      text: 交通
    x2:
      type: text
      role: label
      size: 28
      align: center
      frame:
        - 550
        - 920
        - 200
        - 50
      text: 工业
    x3:
      type: text
      role: label
      size: 28
      align: center
      frame:
        - 850
        - 920
        - 200
        - 50
      text: 建筑
    x4:
      type: text
      role: label
      size: 28
      align: center
      frame:
        - 1150
        - 920
        - 200
        - 50
      text: 电力
    x5:
      type: text
      role: label
      size: 28
      align: center
      frame:
        - 1450
        - 920
        - 200
        - 50
      text: 其他
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

**时间线推进** · 文件 `engine/library/morph/timeline-progress.yaml`

- 提示词：「时间线」 「路线图」 「里程碑推进」 「进度往前走」 「roadmap」 「timeline」
- 适合：路线图、阶段计划、历史沿革：每次点击推进到下一个节点
- 不适合：节点超过 6 个（分段讲）
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
        - 84
        - 1680
        - 110
      text: 路线图
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
        - 420
        - 360
        - 80
      valign: bottom
      text: M0 骨架
    t2:
      type: text
      role: heading
      align: center
      color: muted
      frame:
        - 560
        - 420
        - 360
        - 80
      valign: bottom
      text: M1 复刻 PPT
    t3:
      type: text
      role: heading
      align: center
      color: muted
      frame:
        - 1000
        - 420
        - 360
        - 80
      valign: bottom
      text: M2 原生生成
    t4:
      type: text
      role: heading
      align: center
      color: muted
      frame:
        - 1440
        - 420
        - 360
        - 80
      valign: bottom
      text: M3 交互
    s1:
      type: text
      role: caption
      align: center
      frame:
        - 120
        - 630
        - 360
        - 160
      text: 编译器、效果库、截图 QA
    s2:
      type: text
      role: caption
      align: center
      frame:
        - 560
        - 630
        - 360
        - 160
      opacity: 0.45
      text: PPTX 导入、逐步对比
    s3:
      type: text
      role: caption
      align: center
      frame:
        - 1000
        - 630
        - 360
        - 160
      opacity: 0.45
      text: 三套 deck 验证泛化
    s4:
      type: text
      role: caption
      align: center
      frame:
        - 1440
        - 630
        - 360
        - 160
      opacity: 0.45
      text: 状态驱动的交互图表
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

**可交互柱状图** · 文件 `engine/library/interact/bar-explore.yaml`

- 提示词：「交互图表」 「可交互柱状图」 「悬停看数值」 「点击高亮」 「切换年份」 「interactive bar chart」
- 适合：讲完一组数据后，让听众或演讲者自己探索：悬停看数值、点击某一柱高亮并显示读数、按钮切换年份
- 不适合：只需要传达一个结论（用 page.big-number）
- 调用：`- { id: <scene-id>, use: interact.bar-explore }`

```yaml
- id: bar-explore
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: 悬停看数值，点击高亮，按钮切换年份
    chart:
      type: chart
      kind: bar
      categories:
        - 交通
        - 工业
        - 建筑
        - 电力
        - 其他
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
      source: 示例数据
```

#### interact.line-legend

**折线图 + 图例开关** · 文件 `engine/library/interact/line-legend.yaml`

- 提示词：「折线图」 「趋势图」 「图例开关」 「显示隐藏某条线」 「多条趋势对比」 「interactive line chart」
- 适合：多条时间趋势放在一起：点击图例开关某条线，点击线条高亮它，悬停看具体年份的数值
- 不适合：线条超过 6 条（先筛选，或拆成小多图）
- 调用：`- { id: <scene-id>, use: interact.line-legend }`

```yaml
- id: line-legend
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: 点击图例开关折线，点击线条高亮
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
        - name: 电力
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
        - name: 工业
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
        - name: 交通
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
        - name: 建筑
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
      source: 示例数据
```

#### interact.hbar-ranking

**排行榜条形图** · 文件 `engine/library/interact/hbar-ranking.yaml`

- 提示词：「排行榜」 「横向条形图」 「排名」 「前十名」 「top 10」 「ranking」
- 适合：名称较长、需要排序比较的一组数值（城市、产品、部门）；可预设高亮其中一项
- 不适合：有时间维度（用 interact.line-legend）
- 调用：`- { id: <scene-id>, use: interact.hbar-ranking }`

```yaml
- id: hbar-ranking
  layout: title-body
  objects:
    title:
      type: text
      role: title
      text: 排行榜：名称长也能读清
    chart:
      type: chart
      kind: hbar
      categories:
        - 城市 A
        - 城市 B
        - 城市 C
        - 城市 D
        - 城市 E
        - 城市 F
        - 城市 G
      series:
        排放量:
          - 612
          - 540
          - 498
          - 430
          - 377
          - 301
          - 254
      highlight: 城市 C
      unit: Mt
      source: 示例数据 · 点击条形切换高亮
```

### 交互数据 · 联动与面板

#### interact.linked-views

**联动视图** · 文件 `engine/library/interact/linked-views.yaml`

- 提示词：「联动图表」 「图表联动」 「点一个另一个跟着变」 「联动高亮」 「linked views」 「crossfilter」
- 适合：同一组对象有两种视角（构成 + 趋势）：在一张图里选中，另一张图同步高亮
- 不适合：两张图的分类 / 系列名不一致（联动按名字匹配）
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
      text: 点左边的柱子，右边的折线同步高亮
    bars:
      type: chart
      slot: left
      kind: bar
      categories:
        - 电力
        - 工业
        - 交通
        - 建筑
      series:
        "2024":
          - 600
          - 380
          - 280
          - 210
      link: sector
      unit: Mt
      source: 2024 年构成（示例数据）
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
        - name: 电力
          values:
            - 420
            - 470
            - 480
            - 560
            - 600
        - name: 工业
          values:
            - 330
            - 345
            - 300
            - 360
            - 380
        - name: 交通
          values:
            - 210
            - 235
            - 200
            - 255
            - 280
        - name: 建筑
          values:
            - 170
            - 180
            - 180
            - 200
            - 210
      legend: false
      link: sector
      unit: Mt
      source: 历年趋势（示例数据）
```

#### interact.dashboard

**数据面板** · 文件 `engine/library/interact/dashboard.yaml`

- 提示词：「数据面板」 「仪表盘」 「dashboard」 「指标卡加图表」 「可交互的数据看板」 「数据大屏」
- 适合：一页同时给出关键指标与可探索的明细：顶部指标卡，下方两张联动图表（可切换年份、点击高亮）
- 不适合：听众需要一步一步理解（拆成 interact.narrated 的多个 State）
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
        - 60
        - 1680
        - 110
      text: 城市排放数据面板
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
      label: 2024 年总排放
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
      label: 电力部门占比
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
      unit: 城市
      label: 纳入统计的城市
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
        - 电力
        - 工业
        - 交通
        - 建筑
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
        - name: 电力
          values:
            - 420
            - 470
            - 480
            - 560
            - 600
        - name: 工业
          values:
            - 330
            - 345
            - 300
            - 360
            - 380
        - name: 交通
          values:
            - 210
            - 235
            - 200
            - 255
            - 280
        - name: 建筑
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

**讲述驱动 + 自由探索** · 文件 `engine/library/interact/narrated.yaml`

- 提示词：「边讲边变的图表」 「讲述驱动图表」 「一步步讲数据」 「讲完再探索」 「数据故事」 「narrated chart」
- 适合：先按讲述顺序推进图表（换年份 → 高亮重点），讲完后听众可自由点击探索；翻回本页时自动复位到讲述状态
- 不适合：数据没有先后的叙事顺序（直接用 interact.bar-explore）
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
        - 70
        - 1680
        - 110
      text: 排放增长主要来自电力
    chart:
      type: chart
      frame:
        - 120
        - 220
        - 1180
        - 770
      kind: bar
      categories:
        - 交通
        - 工业
        - 建筑
        - 电力
        - 其他
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
        - "# ① 2020 年"
        - 五个部门大致相当
  states:
    - {}
    - override:
        chart:
          show:
            - "2024"
        note:
          text:
            - "# ② 2024 年"
            - 所有部门都在增长，柱子平滑长高
    - override:
        chart:
          highlight: 电力
        note:
          text:
            - "# ③ 重点：电力"
            - 从 320 到 600，几乎翻倍
            - 讲完后可以点击、切换年份自由探索；翻回本页会复位
```

## image — 位图操作：对截图、照片等位图做局部放大、标注、聚光与对比

### 位图操作 · 放大与聚光

#### image.zoom-region

**局部放大** · 文件 `engine/library/image/zoom-region.yaml`

- 提示词：「放大图片局部」 「截图放大」 「推镜头」 「放大看细节」 「zoom in on image」 「图片 zoom」
- 适合：截图或照片里只有一小块是重点：先看全局，再把镜头推到细节，标注框跟着图片一起移动
- 不适合：图片本身分辨率太低，放大后会糊（换高清图或截取局部）
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
        - 70
        - 1680
        - 110
      text: 先看全局，再推到细节
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
        - "# 全局"
        - 整张截图：听众先知道自己在看什么
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
            - "# 放大细节"
            - |-
              zoom: { at: [u, v], scale }
              标注用 on + box 写在图片坐标里，会跟着放大
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
            - "# 换一处"
            - 再写一个 zoom，镜头平移过去；同一个 ring 也会移动过去
```

#### image.spotlight

**聚光灯** · 文件 `engine/library/image/spotlight.yaml`

- 提示词：「聚光灯」 「只亮这一块」 「其他区域变暗」 「高亮截图某个区域」 「spotlight」
- 适合：讲解截图或界面的各个区域：当前区域保持明亮，其他压暗；每次点击移到下一个区域
- 不适合：区域很小（用 image.circle-mark 圈出来更清楚）
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
        - 70
        - 1680
        - 110
      z: 5
      text: 一次只看一个区域
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
        - "# 整体界面"
        - 先让听众看清整张截图
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
            - "# ① 核心指标"
            - 顶部四张指标卡
    - override:
        spot:
          box:
            - 0.161
            - 0.272
            - 0.535
            - 0.37
        note:
          text:
            - "# ② 趋势"
            - 每日活跃用户持续上升
    - override:
        spot:
          box:
            - 0.699
            - 0.272
            - 0.285
            - 0.37
        note:
          text:
            - "# ③ 渠道"
            - 搜索贡献了将近一半
```

### 位图操作 · 标注

#### image.arrow-label

**箭头 + 说明** · 文件 `engine/library/image/arrow-label.yaml`

- 提示词：「加箭头」 「箭头指向」 「在截图上标注」 「指给大家看」 「加说明文字」 「arrow annotation」
- 适合：在截图 / 照片上指出某个位置，并在旁边写一句说明；箭头画出后说明出现
- 不适合：需要指出的位置超过 3 处（拆成多个 State，或改用 image.spotlight）
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
        - 70
        - 1680
        - 110
      text: 箭头先画出来，说明再出现
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
        - 340
        - 500
        - 180
      valign: middle
      text:
        - "# 导出按钮"
        - 右上角，一键导出报告
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
        - 620
        - 500
        - 180
      valign: middle
      text:
        - "# 待处理订单"
        - 状态为「处理中」
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

**圈出重点** · 文件 `engine/library/image/circle-mark.yaml`

- 提示词：「加圆圈」 「圈出来」 「圈重点」 「在照片上画圈」 「标记位置」 「circle」
- 适合：在照片 / 地图 / 截图上圈出一两个关键位置，配一个短标签
- 不适合：圈出的对象需要详细解释（配合 image.arrow-label）
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
        - 70
        - 1680
        - 110
      text: 一次圈出一个重点
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
      size: 28
      weight: 700
      on: photo
      box:
        - 0.7
        - 0.07
        - 0.17
        - 0.08
      text: 信号塔
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
      size: 28
      weight: 700
      on: photo
      box:
        - 0.12
        - 0.33
        - 0.14
        - 0.08
      text: 落日
    note:
      type: text
      role: body
      frame:
        - 1300
        - 230
        - 500
        - 700
      text:
        - "# 圈 + 标签"
        - 圆圈用 ellipse + 透明填充 + 描边
        - "位置写在图片坐标里：on: photo, box: [u, v, w, h]"
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

**截图文字强调** · 文件 `engine/library/image/text-emphasis.yaml`

- 提示词：「强调截图里的文字」 「荧光笔标出」 「标出数字」 「划出这段」 「文字强调」 「mark text」
- 适合：截图里的某个数字或某句话就是论点：先用荧光框标出它，再弹出放大的结论
- 不适合：截图文字太小、投影看不清（先用 image.zoom-region 放大）
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
        - 70
        - 1680
        - 110
      text: 把截图里的关键数字"拎出来"
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
        - 300
        - 500
        - 300
      align: center
      valign: middle
      text:
        - "# +12.0%"
        - 月收入环比
      size: 44
    note:
      type: text
      role: caption
      frame:
        - 1300
        - 640
        - 500
        - 200
      text: 荧光框用半透明填充 + 描边，wipe 擦出；结论卡片 pop 弹出
  steps:
    - enter: mark
      effect: wipe
      from: left
    - enter: big
      effect: pop
```

### 位图操作 · 对比

#### image.before-after

**前后对比** · 文件 `engine/library/image/before-after.yaml`

- 提示词：「前后对比」 「处理前处理后」 「对比两张图」 「修图前后」 「before after 图片」
- 适合：同一画面的两个版本（处理前后、改版前后、两个时间点），叠放后用擦除揭示差异
- 不适合：两张图构图不同（并排放：page.comparison）
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
        - 70
        - 1680
        - 110
      text: 同一画面，从左往右擦出新版本
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
        - 160
        - 56
      z: 3
      text: 处理前
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
        - 1050
        - 260
        - 160
        - 56
      z: 3
      text: 处理后
    note:
      type: text
      role: body
      frame:
        - 1300
        - 230
        - 500
        - 700
      text:
        - "# 叠放 + 擦除"
        - 两张图同一个 frame；上面一张用 wipe 从左往右出现
        - "滤镜：filter: grayscale(1)"
  steps:
    - - enter: after
        effect: wipe
        from: left
        duration: 1400
      - enter: la
        effect: fade
        after: true
```

