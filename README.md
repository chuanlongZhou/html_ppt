# html_ppt

**把演示文稿当作源代码。** 用一份 `deck.yaml` 描述内容、版式与动画，引擎编译成基于 [Reveal.js](https://revealjs.com/) 的离线网页演示，并对每个 State、每次点击自动截图与 QA（溢出、越界、重叠、缺图、动画对象）。为 AI 编码工具（Claude Code、Codex 等）设计：全部命令非交互、退出码明确、产物可被模型直接读取。

```text
decks/<name>/deck.yaml ──► 引擎编译 ──► output/<name>/site/index.html   （离线可放映）
                                   └──► output/<name>/qa/              （截图、contact sheet、report.json）
```

## 快速开始

需要 Node.js ≥ 20，以及本机已安装 Microsoft Edge（QA 截图通过 Playwright 驱动 Edge）。

```bash
npm install
npm run new -- my-talk      # 新建 decks/my-talk/deck.yaml 骨架
npm run check -- my-talk    # 构建 + 逐步截图 + QA
npm run dev                 # 实时预览 http://localhost:5173（含效果库浏览器）
```

## 命令

退出码：`0` 通过，`1` deck 有 error，`2` 工具故障。deck 用名字寻址（`intro` = `decks/intro/deck.yaml`）。

| 命令 | 作用 |
|---|---|
| `npm run new -- <deck> [--theme <预设名\|theme.yaml>]` | 新建 deck 骨架（可带主题） |
| `npm run check -- <deck> [--scene <id>] [--film] [--no-shots]` | 构建 + 逐步截图 + QA → `output/<deck>/qa/` |
| `npm run build -- <deck> [--ir]` | 只构建（`--ir` 另存 `ir.json`） |
| `npm run export -- <deck> [--out <文件.html>] [--verify [--no-shots]]` | 导出**单个 HTML**（CSS / JS / Reveal / 图片全部内嵌，可直接双击离线打开、发给别人）→ `output/<deck>/<deck>.html`；`--verify` 在 `file://` 下实测（零外部请求、无报错、图片全加载、逐步翻完并截图到 `output/<deck>/<deck>-export-verify/`） |
| `npm run dev` | 实时预览主页：演示、主题与页面元素（选配色、配页码 / Logo / 页脚，下载 theme.yaml）、页面结构、动画与交互 |
| `npm run site -- [deck…]` | 组装可部署的整站 `output/_site/`（主页 + 各 deck），见 [docs/DEPLOY.md](docs/DEPLOY.md) |
| `npm run gallery` | 生成离线效果库浏览器 `output/_gallery/` |
| `npm run catalog` | 重新生成 `engine/CATALOG.md` 与 `engine/library/INDEX.md` |
| `npm run agents:sync` | 由 `agents/` 生成 `.claude/` 的 skills 与 subagent |
| `npm test` | 运行 `engine/tests/` 下的单元测试（导航、图注） |
| `npm run typecheck` | 引擎类型检查 |

部署到 Netlify：见 [docs/DEPLOY.md](docs/DEPLOY.md) 与根目录 `netlify.toml`（构建并发布整站：主页 + 所有演示）。

图片图注：在 deck 目录放 `captions.json`，用 `deck.captionFile` 启用，见 [docs/IMAGE_CAPTIONS.md](docs/IMAGE_CAPTIONS.md)。

## 核心概念

- **Scene / State**：Scene 是一页，内含对象池与一串 State；Scene 之间翻页，State 之间 morph 平滑过渡。
- **两级动画**：页内点击构建（`steps` + preset → Reveal fragments）；页面变化（State `override` → Reveal Auto-Animate）。不手写关键帧。
- **语义组件**：`text`、`shape`、`image`、`metric`、`chart`（可交互）、`html`；版式用 layout recipe，精确构图才用 `layout: free` + `frame`。
- **效果库**：`engine/library/` 收录 45 个「提示词 ↔ 可复制 YAML」条目（页面结构、页内动画、状态切换、交互数据、位图操作），用 `use: <条目 id>` 一行复用。
- **主题与页面元素**：`deck.theme`（`engine/themes/` 的 9 套配色预设，或主页下载的 `theme.yaml`）+ `deck.chrome`（页码、Logo、页眉页脚、进度，每页相同）。

## 目录

| 目录 | 内容 |
|---|---|
| `engine/` | 框架源码：编译器、组件、布局、动画、QA、效果库 |
| `decks/` | 演示源文件，每个 deck 自包含 |
| `proj/` | 正式项目（如复刻的真实演示），结构同 `decks/`；`npm run check -- <name>` 同样可寻址 |
| `output/` | 生成产物（已 gitignore，可删除重建） |
| `agents/` | 工具中立的 skill 与角色（Markdown） |
| `docs/` | 计划、架构（[ARCHITECTURE](docs/ARCHITECTURE.md)）与 ADR（`docs/adr/`） |
| `archive/` | 立项文档与参考资料（只读） |

## 面向 AI 工具

规则的唯一来源是 [AGENTS.md](AGENTS.md)（`CLAUDE.md` 只是引用它）。`.claude/skills` 与 `.claude/agents` 由 `npm run agents:sync` 从 `agents/` 生成，请修改源文件而不是生成物。

标准循环：改 `deck.yaml` → `npm run check -- <deck>` → 按报告里的 `@ 文件:行号` 修复 → 查看 `output/<deck>/qa/contact*.png`。

## 贡献

修改 `engine/` 后须通过：

```bash
npm run typecheck
npm run check -- intro
npm run check -- library
```

架构原则的改动先在 `docs/adr/` 写 ADR。详见 [AGENTS.md](AGENTS.md)。
