# ADR-009 主题与页面元素（chrome）

- 状态：已采纳
- 背景：用户需要（1）在界面里挑选配色并带到新项目；（2）每页都一样的页码、Logo、页脚信息、进度。此前只能逐项写 `deck.tokens`，没有"每页相同"的概念，重复的对象会被 QA 当作普通内容。
- 决定：
  - **主题**：`deck.theme` 引用 `engine/themes/<id>.yaml`（预设，只写种子色）或 deck 目录里的 `theme.yaml`（可写完整 `tokens` / `tokensDark` / `chrome`）。合并顺序：风格 → 主题 → `deck.tokens` / `deck.tokensDark`。
  - **种子色 → token** 由 `engine/src/theme-derive.js` 推导。这是一份非模块的纯函数脚本，**引擎（文本加载后求值）与主页工作台共用同一份**，保证预览与编译结果一致；下载的 `theme.yaml` 写出完整 token，不依赖将来推导算法的变化。
  - **页面元素**：`deck.chrome`（Logo、页眉、页脚、页码、进度、分隔线、`hideOn`）与 scene 的 `chrome`（`false` 或局部覆盖）、`section`。编译期只确定页码 `n`、总数 `N`、章节与 Logo 资源；**渲染在 runtime.js**（每个 section 的 `.stage` 里放一个带 `data-id` 的 `.chrome`），因此主页可以通过 `postMessage` 实时改主题与页面元素。
  - **章节导航**（`chrome.sections`）：章节名由运行时按 `data-section` 的出现顺序收集；每页各渲染一份导航，换页时用上一页的高亮位置作起点、再过渡到当前章节，所以高亮块是滑过去的（QA 模式关闭过渡，截图为最终状态）。
  - 页面元素占用上下边距（页眉 y<64、页脚 y>1016），不属于 `.obj`，不参与 slot / 重叠检查；QA 新增 `CHROME_OVERLAP` 警告。
  - 页码按 **Scene** 计数（Reveal 自带的页码按 State 计数）；启用 `chrome.pageNumber` / `progress` 时关闭 Reveal 自带的同类控件。
- 取舍：
  - 不把 chrome 做成"母版对象池"：它不需要 morph、不需要身份，配置化比对象化更省。
  - `fade` 翻页时 chrome 随 section 一起淡入淡出，同一位置的相同元素会有轻微的透明度起伏；换成全局叠层可避免，但会失去"每页主题/覆盖"与 QA 截图的一致性，暂不做。
- 后果：新增 `engine/themes/`、`theme.ts`、`theme-derive.js`；主页（`home.ts` + `engine/src/home/`）成为用户的主要入口；`npm run new -- <name> --theme <预设|文件>` 把主题复制进新 deck。
