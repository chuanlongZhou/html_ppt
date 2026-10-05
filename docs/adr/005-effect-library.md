# ADR-005 效果库：场景/效果 ↔ 提示词

- 状态：已采纳（M0，用户需求）
- 背景：用户希望常用的页面设计与动画可以"一句话调用"，并作为长期维护、持续扩充的库。
- 决定：
  - 一个条目 = 一个 YAML 文件（`engine/library/<page|build|morph>/<name>.yaml`），包含 prompts（用户怎么说）、use_when / avoid_when、一个可直接使用的 demo scene。
  - 三种调用方式：`use: <id>` 继承并覆盖；复制 INDEX.md 中的片段；`{ library: "<通配>" }` 原样插入演示页（带提示词说明条）。
  - `engine/library/INDEX.md` 由代码生成，包含"提示词速查"表，供任何 AI 工具查阅。
  - `decks/library` 自动包含全部条目，方便人浏览；`decks/intro` 也引用它们。
- 后果：效果库与引擎一起演进；修改条目会影响所有 `use:` 它的 deck，所以修改后需要重新 check 相关 deck。
