<!-- 由 `npm run catalog` 生成，请勿手改。 -->

# 引擎目录（组件 · 布局 · 动画 · 字段）

写 deck.yaml 时查这里。坐标系为 1920×1080 舞台；颜色可用 token 名。效果库（场景 ↔ 提示词）见 `engine/library/INDEX.md`。

## 1. 结构

```text
deck.yaml
├─ deck: 元信息（标题、风格、story …）
└─ scenes: [ Scene | { library: "<id 或通配>" } ]
     Scene = 对象池 objects + State 序列 states（State 间 morph）
     State = 可见对象 + 属性覆盖 + steps（State 内点击构建）
```

**deck**

| 字段 | 类型 | 说明 |
|---|---|---|
| `title` * | string |  |
| `subtitle` | string |  |
| `author` | string |  |
| `date` | string |  |
| `stage` | [number, number] | 舞台尺寸，默认 [1920, 1080] |
| `style` | string | engine/styles 下的风格名（默认 default） |
| `theme` | string | 主题：engine/themes/ 下的预设名（ocean、forest …），或相对 deck 目录的主题文件（theme.yaml；可在主页「主题与页面元素」配置并下载） |
| `tokens` | object | 覆盖浅色 token，如 { accent: "#E8590C" }（优先于 theme） |
| `tokensDark` | object | 覆盖深色 token（theme: dark 的页面） |
| `chrome` | object | 页面元素：Logo、页眉页脚、页码、进度（优先于 theme 中的 chrome） |
| `transition` | `fade` \| `slide` \| `convex` \| `zoom` \| `none` | Scene 之间默认翻页方式（默认 fade） |
| `story` | object | 叙事信息：核心论点、受众、时长、目标 |
| `showPatterns` | boolean | 在页角显示本页用到的效果库条目 |
| `slideNumber` | boolean | 显示页码（默认 true） |

**scene**

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` * | string | scene id（全 deck 唯一） |
| `use` | string | 以效果库条目为模板（如 page.cards-3）：继承其 layout / objects / states，本 scene 写出的字段覆盖模板，objects 按 key 合并属性 |
| `purpose` | string | 这一页为什么存在（语义 QA 会检查） |
| `layout` | `free` \| `hero` \| `title-body` \| `split` \| `grid` \| `center` \| object | 布局：名字，或 { type, ...参数 } |
| `theme` | `light` \| `dark` |  |
| `background` | string | 背景色 token 或 CSS 颜色 |
| `transition` | `fade` \| `slide` \| `convex` \| `zoom` \| `none` | 从上一个 Scene 翻到本 Scene 的方式 |
| `objects` * | object | 对象池：key → 对象。key 就是跨 State 的身份 |
| `states` | object[] | State 序列；不写 = 单 State |
| `steps` | object \| object[][] | 单 State 时的点击构建（等价于 states[0].steps） |
| `notes` | string |  |
| `patterns` | string[] | 本页使用的效果库条目 id（showPatterns 时显示在页角） |
| `continues` | boolean | 与上一个 Scene 共享对象身份：两页里同名 key 的对象在翻页时 morph（上一页的卡片直接移动到本页的位置）；其余对象淡入淡出 |
| `kind` | `content` \| `opening` \| `closing` | 页面类型。opening / closing 独立于 part；默认从封面/结尾模板或 opening、cover、closing、thanks 等 id 识别，content 可显式覆盖 |
| `section` | string \| `false` | 所属章节名（页眉里的 {section}）；后续正文沿用。false = 本页独立于 part；opening / closing 始终不归入 part |
| `chrome` | `false` \| object | false = 本页不显示页面元素；对象 = 只覆盖写出的项 |

**states[i]**

| 字段 | 类型 | 说明 |
|---|---|---|
| `show` | string[] | 本 State 可见的对象（完整列表）；不写则沿用上一个 State（第一个 State 默认全部） |
| `add` | string[] | 在上一 State 基础上增加的对象 |
| `remove` | string[] | 在上一 State 基础上移除的对象 |
| `override` | object | 本 State 起对象属性的覆盖（累积到后续 State） |
| `layout` | `free` \| `hero` \| `title-body` \| `split` \| `grid` \| `center` \| object | 本 State 起切换布局（对象会 morph 到新位置） |
| `steps` | object \| object[][] | 本 State 内的点击构建 |
| `transition` | object | 从上一个 State 进入本 State 的方式 |
| `notes` | string | 演讲者备注 |

**states[i].transition**

| 字段 | 类型 | 说明 |
|---|---|---|
| `intent` | `morph` \| `focus` \| `fade` \| `none` | morph（默认）/ focus / fade / none |
| `target` | string \| string[] | focus 的目标对象 |
| `duration` | number | ms（默认 800） |
| `easing` | string |  |
| `stagger` | number | ms，各移动对象依次开始的间隔 |

**steps[k]（一个效果；数组 = 同一次点击里的多个效果）**

| 字段 | 类型 | 说明 |
|---|---|---|
| `enter` | string \| string[] | 进入的对象 key（可多个） |
| `exit` | string \| string[] | 退出的对象 key |
| `emphasis` | string \| string[] | 强调的对象 key |
| `effect` | string | preset 名（见 CATALOG 的动画表）；默认 enter=fade、exit=fade-out、emphasis=pulse |
| `from` | `left` \| `right` \| `top` \| `bottom` | fly-in / wipe 的来向 |
| `to` | `left` \| `right` \| `top` \| `bottom` | fly-out 的去向 |
| `by` | `object` \| `paragraph` | paragraph：文字对象每段一次点击（逐条出现） |
| `stagger` | number | ms。多个对象/段落在同一次点击内依次开始的间隔 |
| `after` | boolean | 在同一次点击中，等上一个效果结束后再开始 |
| `delay` | number | ms，额外延迟 |
| `duration` | number | ms，覆盖 preset 默认时长 |
| `easing` | string |  |
| `auto` | boolean | 进入本 State 后自动播放，无需点击；只能写在 steps 最前面的连续几项，各项按顺序间隔播放 |

## 2. 布局（layout）

| 名称 | 说明 | slot | 参数 |
|---|---|---|---|
| `free` | **自由布局**：没有 slot，每个对象用 frame: [x, y, w, h] 定位（1920×1080 坐标）。用于导入 PPT 或特殊构图 | — | — |
| `hero` | **主视觉**：内容在舞台中纵向居中堆叠：kicker / title / subtitle；meta 在底部。用于封面、章节页、结尾 | `main` `meta` | align: left \| center（默认 left） |
| `title-body` | **标题 + 正文**：顶部标题区，下方正文区（可放多个对象，纵向堆叠） | `title` `body` | — |
| `split` | **左右分栏**：顶部标题区，下方左右两栏 | `title` `left` `right` | ratio: 左栏百分比（默认 50） |
| `grid` | **网格**：顶部标题区，下方等分网格；slot: cell 的对象按顺序各占一格 | `title` `cell` | cols: 列数（默认 = 对象数，最多 3）；cellHeight: 单元最大高度 |
| `center` | **居中**：内容在舞台正中（大数字、金句、引用）；可选顶部 title 与底部 caption | `title` `main` `caption` | — |

未写 slot 时按 role 自动放置：title/kicker/subtitle → `title`（hero 中 → `main`）；其余 → `body` / `cell` / `main`。split 布局的非标题对象必须写 `slot: left | right`。

## 3. 组件（objects 中的 type）

通用字段：`slot` `frame` `z` `opacity` `rotate` `grow` `ref` `class` `allowBleed`（见下方各表）。文字 role：`title` `subtitle` `kicker` `heading` `body` `bullets` `callout` `label` `caption` `quote` `code` `meta`。

### `text` — 文字

标题、正文、要点、引用、代码等一切文字。用 role 选语义样式，避免手调字号

可 morph：位置、尺寸、字号、颜色、透明度、逐段出现（by: paragraph）

| 字段 | 类型 | 说明 |
|---|---|---|
| `text` * | string \| string[] | 文字。字符串按换行分段，数组每项一段。段首 "- " 要点、"1. " 编号、"# " 小标题；行内 **粗体** ==强调色== `代码` [[标签\|orange/green/blue]] |
| `role` | `title` \| `subtitle` \| `kicker` \| `heading` \| `body` \| `bullets` \| `callout` \| `label` \| `caption` \| `quote` \| `code` \| `meta` | 语义角色，决定默认字号/字重/颜色/默认 slot：title / subtitle / kicker / heading / body / bullets / callout / label / caption / quote / code / meta |
| `size` | number | 字号 px（以 1920 宽舞台计） |
| `weight` | number \| `normal` \| `bold` |  |
| `color` | string | 文字颜色 |
| `align` | `left` \| `center` \| `right` |  |
| `valign` | `top` \| `middle` \| `bottom` |  |
| `font` | `display` \| `body` \| `mono` |  |
| `lineHeight` | number |  |
| `tracking` | number | 字距（em） |
| `slot` | string | 放入 layout 的哪个 slot；不写则按 role 自动选择 |
| `frame` | [number, number, number, number] | [x, y, w, h]，舞台坐标（默认 1920×1080） |
| `z` | integer | 层级（越大越靠前） |
| `opacity` | number |  |
| `rotate` | number | 旋转角度（度） |
| `grow` | boolean | 在 slot 中占满剩余高度 |
| `ref` | string | 语义 ID（预留给数据绑定 / 联动视图） |
| `class` | string | 附加 CSS class |
| `allowBleed` | boolean | 允许超出舞台，关闭越界检查 |
| `on` | string | 依附的图片对象 key：box（以及 line 的 from / to）改用该图片的坐标 0–1，图片放大时标注跟着移动 |
| `box` | [number, number, number, number] | 配合 on：在图片坐标中的位置 [u, v, w, h]（0–1） |

### `shape` — 形状

矩形/圆角卡片/胶囊/圆/三角/菱形/箭头/折角/线条。带 text 即为卡片、标签、流程框

可 morph：位置、尺寸、填充色、圆角、透明度、描线（draw，仅 line）

| 字段 | 类型 | 说明 |
|---|---|---|
| `geom` | `rect` \| `roundRect` \| `pill` \| `ellipse` \| `triangle` \| `diamond` \| `arrow` \| `chevron` \| `pentagon` \| `line` \| `spotlight` | 形状（默认 roundRect）：rect / roundRect / pill / ellipse / triangle / diamond / arrow / chevron / pentagon / line / spotlight |
| `fill` | string | 填充色（默认 surface；line 无填充；spotlight 为遮罩色） |
| `stroke` | string | 描边色；line 的线条颜色（默认 ink） |
| `strokeWidth` | number | 描边/线宽 px |
| `dash` | boolean | 虚线 |
| `radius` | number | 圆角 px（roundRect 默认 24） |
| `shadow` | boolean | 投影 |
| `from` | [number, number] | line：起点 [x, y]（舞台坐标） |
| `to` | [number, number] | line：终点 [x, y] |
| `points` | [number, number][] | line：折线顶点 [[x, y], …]（舞台坐标；转折处为直角时就是"肘形连接线"）；arrow 作用在最后一段 |
| `ports` | boolean | line：两端画小圆点（端口） |
| `arrow` | `none` \| `end` \| `start` \| `both` | line：箭头位置（默认 none） |
| `text` | string \| string[] | 形状内文字（卡片、标签、流程框） |
| `role` | `title` \| `subtitle` \| `kicker` \| `heading` \| `body` \| `bullets` \| `callout` \| `label` \| `caption` \| `quote` \| `code` \| `meta` | 形状内文字的语义角色（默认 body） |
| `padding` | number | 内边距 px（默认 40） |
| `size` | number | 字号 px（以 1920 宽舞台计） |
| `weight` | number \| `normal` \| `bold` |  |
| `color` | string | 文字颜色 |
| `align` | `left` \| `center` \| `right` |  |
| `valign` | `top` \| `middle` \| `bottom` |  |
| `font` | `display` \| `body` \| `mono` |  |
| `lineHeight` | number |  |
| `tracking` | number | 字距（em） |
| `slot` | string | 放入 layout 的哪个 slot；不写则按 role 自动选择 |
| `frame` | [number, number, number, number] | [x, y, w, h]，舞台坐标（默认 1920×1080） |
| `z` | integer | 层级（越大越靠前） |
| `opacity` | number |  |
| `rotate` | number | 旋转角度（度） |
| `grow` | boolean | 在 slot 中占满剩余高度 |
| `ref` | string | 语义 ID（预留给数据绑定 / 联动视图） |
| `class` | string | 附加 CSS class |
| `allowBleed` | boolean | 允许超出舞台，关闭越界检查 |
| `on` | string | 依附的图片对象 key：box（以及 line 的 from / to）改用该图片的坐标 0–1，图片放大时标注跟着移动 |
| `box` | [number, number, number, number] | 配合 on：在图片坐标中的位置 [u, v, w, h]（0–1） |

### `image` — 图片

位图或 SVG 图片；支持局部放大（zoom）与滤镜（filter）。配合 on/box 可在图片坐标上加标注

可 morph：位置、尺寸、圆角、透明度、局部放大（zoom）、滤镜（filter）

| 字段 | 类型 | 说明 |
|---|---|---|
| `src` * | string | 图片路径：相对 deck 目录（如 assets/map.png），或 @lib/xxx 引用效果库素材 |
| `fit` | `cover` \| `contain` | 填充方式（默认 cover） |
| `position` | string | 裁剪焦点，如 "50% 30%"（未写 zoom 时生效） |
| `zoom` | object | 局部放大：在 frame 内放大图片的某一处。不同 State 写不同的 zoom 即可平滑推镜头 |
| `filter` | string | CSS filter，如 "grayscale(1)"、"blur(6px)"、"brightness(.6)"；可在 State 间过渡 |
| `radius` | number | 圆角 px |
| `shadow` | boolean |  |
| `alt` | string |  |
| `slot` | string | 放入 layout 的哪个 slot；不写则按 role 自动选择 |
| `frame` | [number, number, number, number] | [x, y, w, h]，舞台坐标（默认 1920×1080） |
| `z` | integer | 层级（越大越靠前） |
| `opacity` | number |  |
| `rotate` | number | 旋转角度（度） |
| `grow` | boolean | 在 slot 中占满剩余高度 |
| `ref` | string | 语义 ID（预留给数据绑定 / 联动视图） |
| `class` | string | 附加 CSS class |
| `allowBleed` | boolean | 允许超出舞台，关闭越界检查 |
| `on` | string | 依附的图片对象 key：box（以及 line 的 from / to）改用该图片的坐标 0–1，图片放大时标注跟着移动 |
| `box` | [number, number, number, number] | 配合 on：在图片坐标中的位置 [u, v, w, h]（0–1） |

### `metric` — 指标

大数字 + 单位 + 说明 + 变化量。用于"一个数字说明问题"的页面或指标卡

可 morph：位置、字号（整体缩放）、颜色、透明度

| 字段 | 类型 | 说明 |
|---|---|---|
| `value` * | string,number | 数值（字符串可带格式，如 "3.1"） |
| `unit` | string | 单位，显示在数值右侧 |
| `label` | string | 说明，显示在数值下方 |
| `delta` | string | 变化量，如 "-12%" |
| `tone` | `up` \| `down` \| `neutral` | delta 的语义色：up 绿 / down 红 / neutral 灰 |
| `color` | string | 数值颜色（默认 accent） |
| `size` | number | 数值字号 px（默认 160）；单位、说明按比例缩放 |
| `align` | `left` \| `center` \| `right` |  |
| `source` | string | 数据来源（Evidence QA 会检查） |
| `slot` | string | 放入 layout 的哪个 slot；不写则按 role 自动选择 |
| `frame` | [number, number, number, number] | [x, y, w, h]，舞台坐标（默认 1920×1080） |
| `z` | integer | 层级（越大越靠前） |
| `opacity` | number |  |
| `rotate` | number | 旋转角度（度） |
| `grow` | boolean | 在 slot 中占满剩余高度 |
| `ref` | string | 语义 ID（预留给数据绑定 / 联动视图） |
| `class` | string | 附加 CSS class |
| `allowBleed` | boolean | 允许超出舞台，关闭越界检查 |
| `on` | string | 依附的图片对象 key：box（以及 line 的 from / to）改用该图片的坐标 0–1，图片放大时标注跟着移动 |
| `box` | [number, number, number, number] | 配合 on：在图片坐标中的位置 [u, v, w, h]（0–1） |

### `chart` — 交互图表

柱状 / 横向条形 / 折线。讲述时由 State 驱动数据变化；放映中可悬停、点击高亮、开关系列、切换视图；同一页 link 相同的图表联动

可 morph：位置、尺寸、透明度、数据过渡（State 间 show / highlight / series 变化）

| 字段 | 类型 | 说明 |
|---|---|---|
| `kind` | `bar` \| `hbar` \| `line` | bar 柱状（默认）/ hbar 横向条形 / line 折线 |
| `categories` * | string,number[] | 分类（x 轴；hbar 为纵轴） |
| `series` * | object \| object[] | 数据系列：{ 名称: [数值…] }，或 [{ name, values, color }]；每个系列的长度等于 categories |
| `show` | string[] | 可见的系列（默认全部） |
| `highlight` | string,number,null | 高亮的分类或系列名，其余变淡 |
| `unit` | string | 数值单位（标签、悬停提示中使用） |
| `min` | number | 数值轴最小值（默认 0） |
| `max` | number | 数值轴最大值（默认取所有系列的最大值，切换系列时刻度保持不变） |
| `labels` | boolean | 显示数值标签（默认：数据点不多时显示） |
| `legend` | boolean | 图例；交互时可点击开关系列（默认：多于 1 个系列时显示） |
| `switch` | boolean | 切换按钮：一次只看一个系列（如年份） |
| `detail` | boolean | 读数面板：显示当前高亮项在各可见系列中的数值 |
| `interactive` | boolean | 悬停 / 点击 / 图例 / 切换（默认 true） |
| `link` | string | 联动组：同一页中 link 相同的图表共享高亮 |
| `colors` | string[] | 系列颜色（token 或 CSS 颜色） |
| `size` | number | 图表文字字号 px（默认 24） |
| `source` | string | 数据来源，显示在图表下方 |
| `slot` | string | 放入 layout 的哪个 slot；不写则按 role 自动选择 |
| `frame` | [number, number, number, number] | [x, y, w, h]，舞台坐标（默认 1920×1080） |
| `z` | integer | 层级（越大越靠前） |
| `opacity` | number |  |
| `rotate` | number | 旋转角度（度） |
| `grow` | boolean | 在 slot 中占满剩余高度 |
| `ref` | string | 语义 ID（预留给数据绑定 / 联动视图） |
| `class` | string | 附加 CSS class |
| `allowBleed` | boolean | 允许超出舞台，关闭越界检查 |
| `on` | string | 依附的图片对象 key：box（以及 line 的 from / to）改用该图片的坐标 0–1，图片放大时标注跟着移动 |
| `box` | [number, number, number, number] | 配合 on：在图片坐标中的位置 [u, v, w, h]（0–1） |

### `html` — 原始 HTML

逃生口。能用语义组件表达时不要用；用了两次以上的结构应沉淀为组件

可 morph：位置、尺寸、透明度

| 字段 | 类型 | 说明 |
|---|---|---|
| `html` * | string | 原始 HTML（逃生口：组件表达不了时才用，并考虑把它沉淀成新组件） |
| `slot` | string | 放入 layout 的哪个 slot；不写则按 role 自动选择 |
| `frame` | [number, number, number, number] | [x, y, w, h]，舞台坐标（默认 1920×1080） |
| `z` | integer | 层级（越大越靠前） |
| `opacity` | number |  |
| `rotate` | number | 旋转角度（度） |
| `grow` | boolean | 在 slot 中占满剩余高度 |
| `ref` | string | 语义 ID（预留给数据绑定 / 联动视图） |
| `class` | string | 附加 CSS class |
| `allowBleed` | boolean | 允许超出舞台，关闭越界检查 |
| `on` | string | 依附的图片对象 key：box（以及 line 的 from / to）改用该图片的坐标 0–1，图片放大时标注跟着移动 |
| `box` | [number, number, number, number] | 配合 on：在图片坐标中的位置 [u, v, w, h]（0–1） |
| `color` | string | 颜色 token（ink / muted / accent / accent-2 / surface …）或任意 CSS 颜色 |
| `size` | number |  |

## 4. 点击构建 preset（steps 的 effect）

| preset | 类型 | 名称 | 说明 | 默认时长 |
|---|---|---|---|---|
| `appear` | 进入 | 出现 | 立即出现，没有过渡 | 0ms |
| `fade` | 进入 | 淡入 | 原地淡入 | 500ms |
| `fade-up` | 进入 | 上浮淡入 | 从下方 48px 上浮并淡入；最常用的要点/卡片进入方式 | 550ms |
| `fade-down` | 进入 | 下落淡入 | 从上方 48px 落下并淡入 | 550ms |
| `fade-left` | 进入 | 左移淡入 | 从右侧 48px 向左移入并淡入 | 550ms |
| `fade-right` | 进入 | 右移淡入 | 从左侧 48px 向右移入并淡入 | 550ms |
| `fly-in` | 进入 | 飞入 | 从舞台外飞入，from: left/right/top/bottom（默认 bottom） | 700ms |
| `zoom-in` | 进入 | 放大进入 | 从 60% 放大并淡入 | 500ms |
| `pop` | 进入 | 弹出 | 带轻微回弹的放大出现；适合图标、徽标、数字 | 450ms |
| `wipe` | 进入 | 擦除 | 按方向逐渐显露，from: left/right/top/bottom（默认 left） | 700ms |
| `blur-in` | 进入 | 模糊进入 | 由模糊变清晰并淡入 | 600ms |
| `draw` | 进入 | 描线 | 线条/箭头沿路径画出；用在非线条对象上时等同 wipe | 800ms |
| `pulse` | 强调 | 脉冲 | 放大再回弹一次，提醒注意 | 600ms |
| `grow` | 强调 | 放大强调 | 放大到 108% 并保持 | 400ms |
| `highlight` | 强调 | 荧光笔 | 背后扫出一条强调色底纹 | 500ms |
| `dim` | 强调 | 变暗 | 降到 25% 不透明度；用于"讲过的变暗" | 400ms |
| `fade-out` | 退出 | 淡出 | 原地淡出 | 400ms |
| `fly-out` | 退出 | 飞出 | 飞出舞台，to: left/right/top/bottom（默认 bottom） | 600ms |
| `zoom-out` | 退出 | 缩小消失 | 缩小到 60% 并淡出 | 400ms |

时序：同一次点击中的效果默认同时开始；`after: true` 等上一个结束；`delay` 追加延迟；`stagger` 让多个对象/段落依次开始。

## 5. State 之间的过渡（transition.intent）

| intent | 说明 |
|---|---|
| `morph` | 默认。同一对象（同 key）在两个 State 间平滑插值位置、尺寸、颜色、字号、透明度；新对象淡入，消失的对象淡出 |
| `focus` | morph + 把 target 以外的可见对象变暗（opacity 0.18）；配合 override 放大 target 即"聚焦/放大细节" |
| `fade` | 不做 morph，整页淡入淡出（两个 State 内容无连续关系时用） |
| `none` | 直接切换，无动画 |

Scene 之间的翻页（scene.transition / deck.transition）：`fade` `slide` `convex` `zoom` `none`

## 6. 颜色 token（默认风格）

| token | 浅色 | 深色 |
|---|---|---|
| `bg` | #F6F5F1 | #101216 |
| `surface` | #FFFFFF | #1A1D23 |
| `surface-2` | #ECEAE4 | #252932 |
| `ink` | #16181D | #F3F2EE |
| `muted` | #5E6571 | #A1A8B3 |
| `line` | #D9D6CE | #353A45 |
| `accent` | #2F5BEA | #7D98FF |
| `accent-soft` | #DEE6FF | #26315A |
| `accent-2` | #EE6A2C | #FF8A50 |
| `accent-2-soft` | #FFE3D4 | #4A2A1C |
| `accent-3` | #0F9F78 | #3CCB9F |
| `accent-3-soft` | #D2F2E7 | #163E33 |
| `accent-4` | #7C5CE0 | #A890FF |
| `accent-4-soft` | #E7E0FB | #2F2650 |
| `success` | #0F9F78 | #0F9F78 |
| `danger` | #D83A3A | #D83A3A |
| `code-bg` | #16181D | #1A1D23 |
| `code-ink` | #E9E7E0 | #E9E7E0 |

字号 token（px）：hero=120、title=72、heading=46、quote=60、subtitle=40、body=38、small=30、label=26、code=28。设计约束：maxCharsPerState=260、maxClicksPerState=8、maxObjectsPerState=20、minFontSize=20。
