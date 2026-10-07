# 图片 caption 标准

项目在 deck 目录保存 `captions.json`，通过 `deck.captionFile: captions.json` 显式启用。它是 `deck.yaml` 引用的图片元数据源；不修改原图。适用于 `decks/` 和 `proj/`，CHETNA 是完整示例。

```json
{
  "version": 1,
  "language": "en",
  "defaults": { "show": false, "size": 22, "gap": 8, "height": 60, "color": "muted" },
  "images": [
    { "src": "assets/part4/s1/1.png", "caption": "CHETNA-Road emission inventory workflow", "show": true }
  ]
}
```

- `src`：相对 **deck 目录** 的图片路径，建议使用 `/`；每张原图只登记一次。可以登记尚未加入幻灯片的图片。
- `caption`：简短图注，英文建议 5–10 个词；描述图中内容，不引入没有依据的结论。
- `show`：当前图片是否显示图注。省略时使用 `defaults.show`；后者省略则为 `false`。用户可以自行选择要显示图注的图片。
- `language`：图注语言说明，不执行翻译。
- `size`、`gap`、`height`：舞台 px，默认 22 / 8 / 60；`color` 默认 `muted`，支持主题 token。

图注使用已有 `text` 组件，自动置于图片框下方，宽度与图片框一致；随图片同步进入、退出、变暗和移动，接受常规 QA 检查。请在图片下方留出 `gap + height` 空间，避免压住页脚。图片需要显式 `frame`，或独占一个顶部对齐且未使用 `grow` 的 slot；其他 flex slot 无法确定实际几何时会报错。图注 key 自动生成为 `<图片key>__caption`，不要使用同名对象。

同一图片复用时，默认使用相同图注。图片对象或 State `override` 可设置 `caption: false` 单独关闭、`caption: true` 强制显示 JSON 中的图注，或使用字符串改写该次使用的图注。已登记图片的字符串改写仍遵循 JSON 的 `show`，所以用户只改 JSON 就能关闭该图片的全部常规实例；`caption: true` 是显式强制显示的例外。未登记图片的字符串图注直接显示，也可用于没有 JSON 的项目。裁剪/放大后若图注不再准确，应改写或关闭：

```yaml
deck:
  title: Example
  captionFile: captions.json
scenes:
  - id: example
    purpose: 展示工作流程及其局部
    layout: free
    objects:
      figure: { type: image, src: assets/part4/s1/1.png, frame: [120, 140, 1180, 730] }
    states:
      - show: [figure]
      - override:
          figure: { zoom: { at: [0.5, 0.5], scale: 2 }, caption: "Emission modelling detail" }
```

修改 JSON 后运行 `npm run check -- <deck>`；dev 会自动重建。无效 JSON、未知字段、重复图片路径、缺失图片、强制显示但没有图注均报告 error。未启用 `captionFile` 且没有图片 `caption` 字段的旧 deck 不变。
