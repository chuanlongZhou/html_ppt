# ADR-006 工具中立的 Agent / Skill

- 状态：已采纳（M0，用户需求）
- 背景：项目要能被 Claude Code、Codex 以及其他 AI 工具（如 DeepSeek harness）使用。
- 决定：
  - 唯一来源：`AGENTS.md`（全局规则 + 任务 → skill 路由表）与 `agents/`（skills 与角色，纯 Markdown，SKILL.md 带 name / description 头）。
  - `CLAUDE.md` 只写 `@AGENTS.md` 和少量 Claude 专用说明；`.claude/skills`、`.claude/agents` 由 `npm run agents:sync` 生成。
  - 真正的接口是 npm 命令：非交互、退出码明确、报告为 JSON；能读文件、能跑命令的工具即可使用。
  - 不能查看图片的模型：以 report.json 为准，跳过视觉评审，并在交付时说明。
  - 只有 reviewer 是独立角色（独立上下文避免自我确认）；其他职责由主会话通过 skill 承担。
- 后果：新增一个工具的适配，只需要在 agents-sync 中加一个输出目标，不需要改 skill 内容。
