---
name: deck-author
description: 制作或修改 html_ppt 演示（decks/<name>/deck.yaml）。用于"做一份关于…的演示/PPT"、"改第 N 页"、"把这页换成卡片/大数字/逐条出现"等任何演示内容、版式与页面结构的工作。
---

# deck-author：从需求到一份可放映的 deck

## 0. 先查

- `engine/library/INDEX.md` 的「提示词速查」：把用户的描述（"三个卡片""逐条出现""放大其中一项""数据面板""在截图上加箭头"）对应到条目 id。用户想自己挑时，让他打开 `npm run dev` 首页的效果库浏览。
- `engine/CATALOG.md`：字段、组件、布局、preset。只在不确定时查。

## 能力速览

| 需求 | 用什么 |
|---|---|
| 版式（封面、目录、要点、卡片、对比、大数字、四指标、时间线、四象限、团队、表格、总结…） | `page.*` 条目 / layout recipe |
| 主题色、每页都有的页码 / Logo / 页眉页脚 / 进度 | `deck.theme` + `deck.chrome`（见下方「主题与页面元素」） |
| 页内逐步出现、强调 | steps（deck-motion skill） |
| 同一画面变化、聚焦、布局切换 | states + morph（deck-motion skill） |
| 数据图表（可悬停、点击、切换、联动） | `chart` 组件；`interact.*` 条目 |
| 截图 / 照片：放大、箭头、圈、聚光、前后对比 | image 的 `zoom` / `filter` + 标注 `on`/`box`；`image.*` 条目 |

## 1. Brief（唯一的人工检查点）

- 新 deck：`npm run new -- <name>`，把需求写进 `decks/<name>/brief.md`。
- 缺少**目标 / 受众 / 时长**中的任一项：先问用户，不要猜。
- 写好 `deck.story`（thesis、audience、duration）后，把大纲发给用户确认。大纲每个 scene 一行：`id · purpose · 计划使用的条目`。确认后再写完整 deck。
- 修改已有 deck、或用户已经给了完整大纲时，跳过确认。

## 2. Build

**优先继承效果库条目**，只覆盖需要改的字段：

```yaml
- id: problems
  use: page.cards-3            # 继承布局、对象、states、steps
  purpose: 说明三个结构性问题
  objects:                     # 按 key 合并：只写要改的属性
    title: { text: AI 做 PPT，卡在三个问题上 }
    c1: { text: ["# GUI 对象模型", "PPTX 为人工拖拽设计"] }
```

- 用 `objects: { key: null }` 删除模板里的对象；写了 `states` / `steps` 会整体替换模板的。
- 没有合适条目时：选 layout recipe（hero / title-body / split / grid / center）+ 组件。仍然不够，才用 `layout: free` + `frame`。
- 标题写结论；一页一个观点；超过风格的字数上限时，拆成多个 State 或拆页。
- 颜色用 token（`accent`、`muted`、`surface`…），不要写死十六进制（白字 `#FFFFFF` 除外）。
- 需要动画时，读 `agents/skills/deck-motion/SKILL.md`。
- 每个 scene 都写 `purpose`。

## 主题与页面元素

用户说"换个配色""加页码""每页放 logo""底部写上…""显示进度"时，不要逐页改，在 deck 级别配置：

```yaml
deck:
  theme: ocean            # 预设名（engine/themes/*.yaml）或 theme.yaml（主页「主题与页面元素」下载）
  chrome:                 # 页面元素；也可以写在 theme.yaml 里，deck.chrome 逐项覆盖
    logo: { src: assets/logo.png, at: header-right, height: 40 }   # 或 { text: ACME }
    header: { left: "{title}", right: "{section}" }
    footer: { left: "{author} · 内部资料" }
    pageNumber: { format: "{n} / {N}", at: footer-right }          # true = 右下角 "n / N"
    sections: { at: footer }   # 章节导航：页脚一排章节标签，当前章节高亮，换章时高亮块滑动（章节名取自各 scene 的 section）
    progress: bar           # none | bar | dots
    rule: true
    hideOn: [first, last]   # first / last / scene id
```

- 占位符：`{n}` `{N}`（按 Scene 计数）`{title}` `{subtitle}` `{author}` `{date}` `{section}`。`section` 写在 scene 上，往后沿用到下一个；章节导航至少需要两个不同的 section，点标签可跳到该章。
- 单页覆盖：`chrome: false`（关掉）或 `chrome: { footer: { left: … } }`（只改写出的项）。
- 页面元素占上下边距（页眉 y<64、页脚 y>1016），内容留在 y≈84–984 之内；压到会有 `CHROME_OVERLAP` 警告。
- 颜色微调：`deck.tokens`（浅色）/ `deck.tokensDark`（深色页）逐项覆盖主题。用户想"挑颜色"时，让他打开 `npm run dev` 首页的「主题与页面元素」，选好后下载 `theme.yaml`，放进 deck 目录并写 `theme: theme.yaml`；或 `npm run new -- <name> --theme <预设名|theme.yaml>`。

## 3. Check

```bash
npm run check -- <name>
```

- 有 error：按 `@ 文件:行号` 和 `→` 提示修复，直到退出码为 0。
- warning 逐条判断：DENSE_TEXT（太密）、MORPH_NOTHING_SHARED（morph 无意义）、SMALL_FONT 等通常都该处理。
- 看 `output/<name>/qa/contact*.png`；改过的 scene 再看 `qa/shots/<NN>-<scene>-s<state>-k<click>.png`。

| code | 常见处理 |
|---|---|
| TEXT_OVERFLOW / SLOT_OVERFLOW | 删字、拆 State、加大 frame、减小 size |
| OUT_OF_STAGE | 调整 frame；有意出血时加 `allowBleed: true` |
| MISSING_FRAME | free 布局的对象需要 frame，或改用 recipe |
| SLOT_REQUIRED / UNKNOWN_SLOT | split 写 `slot: left / right`；可用 slot 见 hint |
| UNKNOWN_OBJECT | key 拼写错误；hint 中列出了可用 key |
| BAD_PRESET | 改用 hint 中列出的 preset |
| TEXT_OVERLAP | 调整位置；水印类对象设 opacity < 0.5 |

## 4. Review

新 deck，或一次改动 3 页以上时，做一次独立评审：

- Claude Code：调用 subagent `deck-reviewer`。
- 其他工具：新开一个会话，按 `agents/roles/deck-reviewer.md` 执行。

修复 critical 与 major，minor 酌情处理，然后交付。交付时说明：deck 路径、`output/<name>/site/index.html`、页数、未解决的 warning。

## 修改已有 deck

- 按 scene id 定位（`grep -n "id: <scene>" decks/<name>/deck.yaml`），只改对应的 scene 块。
- 全局换色用 `deck.tokens`（如 `{ accent: "#E8590C" }`）；不要逐页改。
- 改完只需检查受影响的 scene：`npm run check -- <name> --scene <id>`。交付前再跑一次全量 check。
