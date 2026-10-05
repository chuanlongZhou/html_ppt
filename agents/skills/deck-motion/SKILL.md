---
name: deck-motion
description: 为 html_ppt 演示设计动画：页内点击构建（steps）、同一画面的多个 State 与 morph 平滑过渡、focus 聚焦、时长与节奏。用于"加动画""逐条出现""平滑过渡/magic move/morph""放大某一项""让这个对象移过去"等需求。
---

# deck-motion：动画是信息的状态变化

## 两级动画

| 层级 | 写法 | 编译为 | 对应 PowerPoint |
|---|---|---|---|
| State 内 | `steps:`，每一项是一次点击 | Reveal fragments | 自定义动画 |
| State 间 | `states:`，同一 key 的对象自动插值 | Reveal Auto-Animate | 平滑（Morph）切换 |
| Scene 间 | 换一个 scene | 翻页（`transition: fade / slide / …`） | 普通切换 |

- 同一个画面、只有部分对象变化 → 同一 Scene 的多个 State。
- 在当前画面上逐步加内容 → steps。
- 内容没有视觉连续性 → 新 Scene。不要用 morph 硬连两个无关画面。

## steps（点击构建）

```yaml
steps:
  - { enter: card, effect: fade-up }                      # 一次点击
  - [{ enter: a1, effect: draw },                          # 同一次点击中的两个效果
     { enter: b2, effect: pop, after: true }]              # after：等上一个结束
  - { enter: [c1, c2, c3], effect: fade-up, stagger: 150 } # 一次点击，依次开始
  - { enter: list, by: paragraph, effect: fade-up }        # 文字每段一次点击
  - [{ emphasis: s1, effect: dim }, { enter: s2 }]         # 讲过的变暗
  - { exit: tip, effect: fade-out }
```

| 想表达 | preset |
|---|---|
| 内容出现（默认首选） | `fade-up`；克制场合用 `fade` |
| 节点、图标、数字 | `pop` |
| 箭头、连线 | `draw`（只对 `geom: line` 有效） |
| 条形、进度、时间轴 | `wipe` + `from: left` |
| 对照的两方 | `fly-in` + `from: left / right` |
| 讲到关键句 | `emphasis` + `highlight` |
| 讲过的项 | `emphasis` + `dim` |

完整 preset 表见 `engine/CATALOG.md` §4。

## states（morph）

```yaml
objects: { card: {...}, detail: {...} }
states:
  - show: [card]                         # 第一个 State：只显示 card
  - add: [detail]                        # 在上一 State 基础上增加
    override:                            # 属性覆盖，累积到后续 State
      card: { frame: [120, 270, 560, 560], fill: accent-3 }
    transition: { duration: 900, stagger: 60 }
  - layout: { type: grid, cols: 4 }      # 换布局，对象 morph 到新位置
  - transition: { intent: focus, target: card }   # 其他对象变暗
```

**规则**

- 同一个 key 就是同一个对象，它会 morph：位置、尺寸、颜色、字号、透明度、圆角都会插值。
- 文字对齐方式（`align`）不会插值，会在开始时跳变。morph 前后保持同样的 align。
- 精确控制位置的 morph 用 `frame`（绝对坐标）；recipe 中每个 slot 只放一个对象时也能平滑 morph。
- 被移除的对象：有 frame 或独占 slot 时会淡出，否则直接消失。
- 新出现的对象会淡入。
- 文字内容改变不会逐字过渡，而是直接替换。

## 图片：放大与标注（位图操作）

```yaml
objects:
  shot: { type: image, src: assets/ui.png, frame: [120, 230, 1120, 700] }
  ring: { type: shape, geom: ellipse, fill: transparent, stroke: accent-2, strokeWidth: 6, on: shot, box: [0.58, 0.1, 0.2, 0.16] }
  tip:  { type: shape, geom: line, on: shot, from: [1.04, 0.3], to: [0.9, 0.08], arrow: end, stroke: accent-2 }
  spot: { type: shape, geom: spotlight, on: shot, box: [0.16, 0.1, 0.83, 0.16] }   # 其余区域压暗
states:
  - show: [shot]
  - add: [ring]
    override: { shot: { zoom: { at: [0.68, 0.18], scale: 2.6 } } }   # 推镜头，ring 跟着移动并淡入
```

- `on` + `box` / `from` / `to` 用**图片坐标**（0–1，左上为 0,0；箭头起点可以在图片外，如 u = 1.04）。
- 换 `zoom.at` 即平移镜头；同一个标注改 `box` 会移动过去。
- 放大后标注落在可见区域外时会有 ANNOTATION_OUTSIDE 警告：在那个 State 中 remove 它。
- 前后对比：两张图叠放，上面一张 `wipe`；或同一张图在 State 间改 `filter`。

## 图表：数据变化写成 State

```yaml
objects:
  chart: { type: chart, kind: bar, categories: [...], series: { "2020": [...], "2024": [...] }, show: ["2020"], switch: true }
states:
  - {}
  - override: { chart: { show: ["2024"] } }       # 柱子从 2020 平滑长到 2024
  - override: { chart: { highlight: 电力 } }       # 其余变淡
```

- 讲述推进 = State；讲完后听众可以悬停、点击、切换（自由探索）；翻回本页自动复位到讲述状态。
- 同一页多张图写同一个 `link`，点击其中一张，另一张按同名分类 / 系列联动高亮。

## 节奏

- 时长：点击构建 400–700ms；morph 700–1000ms。不要超过 1200ms。
- 每个 State 的点击次数不超过 8（style rules 会给出 warning）。
- 一份 deck 只用 2–3 种进入方式；花哨的效果（`fly-in`、`blur-in`）全 deck 不超过两三处。
- 动画必须回答"这个变化说明了什么"。答不上来就不加。

## 验证

```bash
npm run check -- <deck> --scene <id> --film
```

- `qa/shots/*-k<n>.png`：第 n 次点击后的画面（k0 = 未点击）。
- `qa/film/<scene>-s<i>to<j>.png`：morph 的 0 / 25 / 50 / 75 / 100% 五帧，检查有没有变形、穿插、跳变。
- 有浏览器面板的工具：`npm run dev` 后亲自按方向键看一遍。
