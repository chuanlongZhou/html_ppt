# ADR-004 Source DSL 与 Canonical IR 分离

- 状态：已采纳（M0）
- 背景：适合 AI 写的格式（简写、默认值、slot、use 模板、intent）不等于适合机器处理的格式（全部显式）。
- 决定：
  - 作者写 `deck.yaml`（schema 见 `engine/src/schema.ts`）。
  - `normalize` 输出 IR：每个 State 的完整对象集合、绝对矩形或 slot、fragment 序号、具体 preset 与时长。
  - IR 只存在于内存中，`npm run build -- <deck> --ir` 可以导出 JSON 用于调试；不单独设计 IR 文件格式。
  - LLM 决定 what / why，代码决定 how：布局数值、ID、动画参数、QA 判定都由确定性代码完成。
- 后果：Markdown、PPTX 导入（M1）等新的输入格式都编译到同一个 IR。
