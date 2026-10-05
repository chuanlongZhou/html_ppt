@AGENTS.md

## Claude Code 专用

- Skills 与 subagent 位于 `.claude/`，由 `npm run agents:sync` 从 `agents/` 生成。要改就改 `agents/` 下的源文件。
- 独立评审：调用 subagent `deck-reviewer`（独立上下文，只读）。
- 预览：在浏览器面板 `preview_start "deck-dev"`（即 `npm run dev`，http://localhost:5173），可以逐页、逐次点击查看动画。
- 截图是 PNG，直接用 Read 查看；先看 `contact*.png`，再看具体的 `shots/`。
