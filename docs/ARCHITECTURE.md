# 架构（M0）

## 流水线

```text
decks/<deck>/deck.yaml ──┐   engine/library/**/*.yaml（use: / library: 引用）
                         ▼
 1 parse + validate   issues.ts · schema.ts         yaml（带行号）+ zod（中文报错）
 2 normalize          normalize.ts · layout.ts       Scene/State 展开、属性覆盖累积、slot → 矩形 → Canonical IR（ir.ts）
 3 motion compile     normalize.ts · motion.ts       steps → 点击序号/延迟/preset；ghost（淡出）；focus；stagger
 4 render             runtime/reveal/render.ts       IR → <section> × State；.obj[data-id]；.fx.fragment 包装
 5 qa                 qa/check.ts                    Playwright + Edge：逐步截图、DOM 检查、contact sheet、film
                         ▼
output/<deck>/site/（离线可放映） · qa/report.json · qa/shots · qa/contact*.png · qa/film
```

## 文件地图

| 路径 | 职责 |
|---|---|
| `engine/src/cli.ts` | 命令入口；退出码 0 / 1 / 2 |
| `engine/src/schema.ts` | Source DSL 的 zod schema（"AI 写什么"） |
| `engine/src/normalize.ts` | Source → IR：可见集合、override、`use:` 继承、布局、steps 编译、设计规则检查 |
| `engine/src/ir.ts` | Canonical IR 类型（与运行时无关） |
| `engine/src/layout.ts` | 布局 recipe 与 slot 矩形计算 |
| `engine/src/motion.ts` | Motion Grammar v0：preset 表、intent、默认时长 |
| `engine/src/components/` | 组件：schema + render + motion 声明（text、shape、image、metric、html） |
| `engine/src/runtime/reveal/` | **唯一的 Reveal 适配层**：render.ts、runtime.js（初始化 + data-id matcher + 页面元素 chrome + 主题预览消息）、runtime.css、fx.css |
| `engine/src/style.ts` · `engine/styles/<name>/` | 风格：tokens（颜色、字体、字号）+ rules（QA 读取）+ style.css |
| `engine/src/library.ts` · `engine/library/` | 效果库：条目加载、匹配；`assets/` 为条目素材 |
| `engine/src/qa/check.ts` | 截图、DOM QA、contact sheet、morph 帧 |
| `engine/src/catalog.ts` | 生成 `engine/CATALOG.md` 与 `engine/library/INDEX.md` |
| `engine/src/components/chart.ts` · `runtime/reveal/charts.js` | 交互图表：编译期输出数据规格，浏览器端渲染、交互、联动、State 间数据过渡（ADR-007） |
| `engine/src/imagesize.ts` | 图片原始尺寸与 fit / zoom 几何；图片坐标标注（ADR-008） |
| `engine/src/captions.ts` | 校验 deck 引用的图注 JSON，按图片路径与 show 开关生成普通 text IR 对象；位置、可见性与动画跟随图片。标准见 `docs/IMAGE_CAPTIONS.md` |
| `engine/src/gallery.ts` | 效果库浏览器 `output/_gallery/`：每个条目一个迷你 deck、缩略图、条目预览页；另含主题预览 deck |
| `engine/src/home.ts` · `engine/src/home/` | 主页（dev 的 `/` 与静态 `_gallery/index.html` 共用）：我的演示、主题与页面元素工作台、页面结构、动画与交互；`home.css` / `home.js` / `studio.js` 是真实文件 |
| `engine/src/theme.ts` · `theme-derive.js` · `engine/themes/` | 主题：预设（种子色）与项目 `theme.yaml`；`theme-derive.js` 由种子色推导全部 token，引擎与主页共用（ADR-009） |
| `engine/src/dev.ts` · `serve.ts` | 实时预览服务器（SSE 自动刷新；主页局部刷新；`POST /__new` 从主页新建演示） |
| `engine/src/scaffold.ts` | `new`、`agents-sync` |

## 核心模型

- **Scene** = 对象池（`objects`，key 即身份）+ State 序列。Scene 之间翻页，State 之间 morph。
- **独立页**：`kind: opening / closing` 或 `section: false` 不归入 part；封面/结尾模板和常用 id 自动识别，`kind: content` 可覆盖。章节归属在 normalize 决定，底部导航只定位正文入口（ADR-010）。
- **State** = 可见对象集合（`show / add / remove`）+ 累积的属性覆盖（`override`）+ 可选的布局切换 + 页内点击构建（`steps`）。
- **两级动画**：steps → Reveal fragments；State → Reveal Auto-Animate（同一 Scene 共享 `data-auto-animate-id`）。
- **身份**：`data-id = <scene>.<key>`；runtime.js 只按 data-id 匹配（不按文字或图片 src）。

## 不变量

1. IR 与 Reveal 无关；替换运行时只需新写一个 `runtime/<name>/`。
2. 坐标、ID、fragment 序号、动画参数由代码决定；相同输入，输出稳定。
3. 视觉样式在 `.obj[data-id]` 上，定位与 fragment 包装在外层。
4. 生成文件（CATALOG.md、INDEX.md、.claude/skills、.claude/agents、output/）不手改。

## 为未来保留的接口

| 未来能力 | 已预留 |
|---|---|
| 交互可视化、探索模式（c2） | 已有第一部分：chart 组件（讲述驱动 + 自由探索 + 复位 + 联动，ADR-007）；通用的三层状态合成仍待 M3 |
| 联动视图 / 数据绑定 | 对象的 `ref` 字段（语义 ID） |
| PPTX 导入（M1） | `layout: free` + `frame` + 精确 preset 参数；两级动画与 PowerPoint 一一对应 |
| 其他运行时 / 导出 | IR 不含 Reveal 概念 |
| 多风格 | `deck.style` + `engine/styles/<name>/` |
| 主题 / 页面元素 | `deck.theme`（预设或 theme.yaml）+ `deck.chrome` + scene 的 `chrome` / `section`（ADR-009） |
| 其他 AI 工具 | AGENTS.md + agents/ 为唯一来源；CLI 是通用接口 |
