# AGENTS.md — html_ppt

> 所有 AI 编码工具（Claude Code、Codex、其他能读文件、能跑命令的工具）共用这一份规则。`CLAUDE.md` 只是引用本文件。

## 这是什么

把演示文稿当作源代码：`decks/<name>/deck.yaml` → 引擎编译 → `output/<name>/site/index.html`（Reveal.js，离线可放映）。`check` 命令会对每个 State、每次点击截图，并检查溢出、越界、重叠、缺图、动画对象。

## 目录

| 目录 | 内容 | 规则 |
|---|---|---|
| `engine/` | 框架源码：编译器、组件、布局、动画、QA、**效果库** `engine/library/`、**主题预设** `engine/themes/`、主页 `engine/src/home/` | 改动后跑测试（见下） |
| `decks/` | 演示源文件，每个 deck 自包含；`deck.yaml` 是唯一 source of truth | |
| `proj/` | 正式项目（如复刻的真实演示），结构同 `decks/`，用名字寻址（同名时 `decks/` 优先） | |
| `output/` | 命令生成的产物（网页、截图、报告） | **不要手改**，可删除重建 |
| `archive/` | 归档与参考；待复刻的 PPTX 放 `archive/reference/` | **只读** |
| `agents/` | 本文件引用的 skill 与角色（纯 Markdown，工具中立） | 改后运行 `npm run agents:sync` |
| `docs/` | `PLAN.md` 计划、`ARCHITECTURE.md` 架构、`adr/` 架构决策 | |

## 命令

全部非交互；退出码 `0` 通过、`1` deck 有 error、`2` 工具故障。deck 用名字寻址（`intro` = `decks/intro/deck.yaml`）。

| 命令 | 作用 |
|---|---|
| `npm run new -- <deck> [--theme <预设名\|theme.yaml>]` | 新建 deck 骨架（可带主题：颜色 + 页码 / Logo / 页脚） |
| `npm run check -- <deck> [--scene <id>] [--film] [--no-shots]` | 构建 + 逐步截图 + QA → `output/<deck>/qa/` |
| `npm run build -- <deck> [--ir]` | 只构建（`--ir` 另存 `output/<deck>/ir.json`） |
| `npm run export -- <deck> [--out <文件.html>] [--verify [--no-shots]]` | 导出**单个 HTML**（CSS / JS / Reveal / 图片全部内嵌，可直接双击离线打开、发给别人）→ `output/<deck>/<deck>.html`；`--verify` 在 `file://` 下实测（零外部请求、无报错、图片全加载、逐步翻完并截图到 `output/<deck>/<deck>-export-verify/`） |
| `npm run dev` | 实时预览：http://localhost:5173 主页 = 我的演示 · 主题与页面元素（选配色、配页码 / Logo / 页脚，下载 theme.yaml）· 页面结构 · 动画与交互（缩略图、搜索、逐条预览），改源文件自动刷新 |
| `npm run gallery` | 生成效果库浏览器 `output/_gallery/`（含缩略图，可离线双击打开） |
| `npm run catalog` | 重新生成 `engine/CATALOG.md` 与 `engine/library/INDEX.md` |
| `npm run agents:sync` | 由 `agents/` 生成 `.claude/`（Claude Code 的 skills 与 subagent） |
| `npm run typecheck` | 引擎类型检查 |

## 标准工作循环

1. 修改 `decks/<deck>/deck.yaml`
2. `npm run check -- <deck>`
3. 有 error：按 `@ 文件:行号` 定位、按 `→` 提示修复，回到第 2 步
4. 查看 `output/<deck>/qa/contact*.png`（每个 State 的总览）与变化 scene 的 `qa/shots/`；动画用 `--film` 查看 `qa/film/*.png`（morph 0–100% 五帧）
5. 改动较大时做一次独立评审（`agents/roles/deck-reviewer.md`）

**交付给别人**：`npm run export -- <deck> --verify`，把 `output/<deck>/<deck>.html` 发出去即可（单文件，无需服务器）。

**不能查看图片的工具**：以 `output/<deck>/qa/report.json` 为准，跳过第 4 步，并在交付时说明未做视觉检查。

**完成标准**：`check` 退出码为 0；变化过的 scene 截图已查看；warning 都有判断。

## 任务 → 先读哪个文件

| 任务 | 文件 |
|---|---|
| 做一份演示、改页面内容或版式；主题色、页码、Logo、页眉页脚、进度 | `agents/skills/deck-author/SKILL.md` |
| 设计动画：点击构建、State、morph | `agents/skills/deck-motion/SKILL.md` |
| 新增或修改效果库条目 | `agents/skills/library-curate/SKILL.md` |
| 修改引擎：组件、布局、preset、QA | `agents/skills/engine-dev/SKILL.md` |
| 独立评审一份 deck | `agents/roles/deck-reviewer.md` |

参考资料（按需查阅，不必通读）：

- `engine/library/INDEX.md`：**效果库**。提示词 → 条目 → 可复制的 YAML（生成文件）。五个类别：页面版式（page）、页内动画（build）、状态切换（morph）、交互数据（interact）、位图操作（image）
- `engine/CATALOG.md`：全部字段、组件、布局、动画 preset、颜色 token（生成文件）
- `docs/ARCHITECTURE.md`：引擎结构与不变量；`docs/adr/`：架构决策

## 规则

- 用户描述了某种页面或效果时，先查 `engine/library/INDEX.md` 的「提示词速查」，优先 `use: <条目 id>` 复用。
- 优先使用 layout recipe 与语义组件；`layout: free` + `frame` 只用于精确构图或导入的 PPT。
- 不手写关键帧或坐标动画：页内动画用 `steps` + preset，页面变化用 State 的 `override`。
- 配色与每页都有的元素（页码、Logo、页脚、进度）用 `deck.theme` / `deck.chrome` 配置，不要逐页复制对象。
- 数据用 `chart` 组件（可交互），不要用一堆 shape 拼图表；数据变化写成 State。
- 在截图 / 照片上标注时用 `on: <图片 key>` + `box`（图片坐标 0–1），不要手算舞台坐标；放大用图片的 `zoom`。
- 每个 scene 写 `purpose`；标题写结论。
- 新组件、新 preset 必须由真实 deck 的需求驱动；好的新设计应沉淀为效果库条目。
- 修改架构原则前，先在 `docs/adr/` 写 ADR。
- 修改 `engine/` 后必须通过：`npm run typecheck`、`npm run check -- intro`、`npm run check -- library`。
- 不修改 `archive/`；不手改 `output/`、`.claude/skills/`、`.claude/agents/`、`engine/CATALOG.md`、`engine/library/INDEX.md`（都是生成的）。
