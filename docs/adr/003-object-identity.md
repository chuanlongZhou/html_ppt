# ADR-003 对象身份

- 状态：已采纳（M0）
- 背景：c1 建议区分 semantic / instance / motion 三种 ID。M0 只需要稳定的 morph 身份。
- 决定：
  - 对象在 Scene 的对象池中用 key 定义一次；所有 State 用 key 引用它。
  - 编译器生成 `data-id="<scene>.<key>"`，天然唯一，且跨 State 稳定。
  - runtime 使用自定义 matcher，只按 data-id 匹配；Reveal 默认的"按文字内容、图片 src 匹配"会造成嵌套重复动画，因此关闭。
  - 预留 `ref` 字段，作为语义 ID（如 `city.delhi`），供 M3/M4 的数据绑定与联动视图使用。
- 后果：AI 只需保证"同一事物用同一 key"；身份不依赖对象树结构。
