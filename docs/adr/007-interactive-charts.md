# ADR-007 交互图表：数据规格 + 浏览器渲染 + State 驱动

- 状态：已采纳（M0.5，从 M3 提前的第一部分；用户需求"可交互的数据面板"）
- 背景：评审意见 c2 指出，Web 演示相对 PPT 的结构性优势是图表本身可以有状态、可以交互。ADR-002 已把 State 定义为纯数据，为此留了接口。
- 决定：
  - `chart` 组件在编译期只输出数据规格（JSON，包括尺寸），由 `runtime/reveal/charts.js` 在浏览器中渲染 SVG。几何属性用 CSS，数据变化通过 transition 插值。
  - **讲述驱动**：不同 State 中对 `show` / `highlight` / `series` 的 override，就是讲述推进；进入下一 State 时，从上一 State 的数据过渡到新数据（编译器把上一 State 的规格写进 `.ch-prev`）。
  - **自由探索**：悬停提示、点击高亮、图例开关、切换按钮。交互只改变浏览器中的临时状态（exploration state），不写回源文件。
  - **复位**：每次进入一页都恢复为讲述状态（authored state），这就是 c2 所说的 reset / resume narrative 的最小实现。
  - **联动**：同一页中 `link` 相同的图表共享高亮，按分类名或系列名匹配（c2 中 linked views 的最小实现）。
- 尚未实现（仍属 M3/M4）：三层状态合成（base / presentation / interaction）的通用机制、交互后由演讲者继续推进时的"从当前探索状态过渡"、AI 自然语言改图表状态、筛选（filter）与刷选（brush）、地图组件。
- 后果：图表数据只需写一次；讲述、交互、联动共用同一份数据规格。静态截图（check）在 QA 模式下直接渲染最终状态。
