# ADR-001 Reveal.js 作为可替换的运行时

- 状态：已采纳（M0）
- 背景：Reveal 提供翻页、fragments、Auto-Animate、演讲者模式、PDF，可以直接复用；但如果数据模型跟着 Reveal 走，项目就会退化成一个 Reveal 包装器。
- 决定：IR（`engine/src/ir.ts`）中不出现任何 Reveal 概念；只有 `engine/src/runtime/reveal/` 把 IR 翻译成 `<section>`、`.fragment`、`data-auto-animate`。锁定 reveal.js 6.0.2；暂不系统参考官方文档，依据源码与类型定义开发，同类 bug 反复出现时再系统查阅文档。
- 后果：新增运行时（例如 M3 的 live 交互渲染）只需新增一个适配层；Reveal 升级的影响也限制在适配层内。
