# ADR-010 矩阵概览与独立页面

- 状态：已采纳
- 背景：Esc 概览需要多列矩阵和上下滚动；封面、opening 与致谢页不应成为 part 导航入口。这些行为应适用于所有项目。
- 决定：
  - 保留 Reveal 的 overview API、Esc / O、点击跳转和状态事件。运行时将 overview 排成响应式 CSS Grid，单独缩放舞台并支持纵向滚动；退出后恢复普通放映。概览展示每个 State 的最终构建，不改变原页面的 fragment 进度。
  - Scene 增加 `kind: content | opening | closing`。未指定时，封面 / 结尾模板和常用 opening、cover、closing、thanks 等 id 自动识别为独立页；显式 `kind: content` 可以覆盖识别。
  - `section: false` 可让任意页面独立于 part；省略 section 的普通内容仍沿用上一个章节。独立页没有 IR 章节，也不渲染章节导航，不参与跳转目标收集。
  - 独立页中的字符串 section 仍可声明后续内容沿用的章节名，兼容旧项目在 opening 上声明第一章的写法。章节归属在 normalize 中决定，IR 不引入 Reveal 概念。
- 后果：重新构建既有项目即可获得新行为；正常前后翻页和概览仍能访问 opening 与致谢页。章节导航保持只跳到正文入口。
