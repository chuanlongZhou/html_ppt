---
name: engine-dev
description: 修改 html_ppt 引擎（engine/src、engine/styles）：新增或修改组件、布局 recipe、动画 preset、QA 检查、CLI 命令，或修复渲染/动画 bug。用于"加一个图表组件""新增一种布局""morph 出现变形""check 漏报/误报"等引擎层工作。
---

# engine-dev：扩展引擎

先读 `docs/ARCHITECTURE.md`（流水线、文件地图、不变量）。

## 不变量（不要破坏）

1. **IR 中没有 Reveal 概念。** 只有 `engine/src/runtime/reveal/` 知道 `<section>`、fragment、`data-auto-animate`。
2. **代码决定 how。** 坐标、ID、fragment 序号、动画参数都在 normalize 中确定；渲染结果对相同输入稳定。
3. **视觉样式放在带 `data-id` 的 `.obj` 元素上**（颜色、字号、圆角、透明度），这样 Auto-Animate 才能插值。定位与 fragment 包装放在外层。
4. 文字、尺寸用 1920×1080 舞台的 px；颜色走 token（`var(--c-*)`）。

## 常见任务

**新增组件**

1. 新建 `engine/src/components/<name>.ts`：zod `schema`（每个字段写 `.describe()`）+ `render(props, ctx)` + `motion` / `interaction` 声明 + `paragraphs()`。
2. 在 `components/index.ts` 中注册，并加入 `ObjectSchema`。
3. 样式：与风格无关的结构写在 `runtime/reveal/runtime.css`，视觉写在 `engine/styles/default/style.css`。
4. 在效果库中至少加一个使用它的条目（library-curate skill）。

**新增布局 recipe**：在 `layout.ts` 的 `LAYOUTS` 与 `resolveLayout` 中添加；在 `defaultSlot` 中补 role 映射。

**新增动画 preset**：在 `motion.ts` 的 `PRESETS` 中添加，在 `runtime/reveal/fx.css` 中写 `.fx.fx-<name>`（进入类写未 `.visible` 时的隐藏态，退出/强调类写 `.visible` 态）。

**新增 QA 检查**：编译期检查写在 `normalize.ts`（带行号）；需要布局结果的写在 `qa/check.ts` 的 `domQa`（在浏览器中运行，不能引用外部变量）。

## 测试（每次修改引擎后必须全部通过）

```bash
npm run typecheck
npm run check -- intro
npm run check -- library
npm run catalog          # schema / preset / 布局有变化时
```

动画相关的修改，额外用 `--film` 查看 morph 帧。

**交互图表**：`components/chart.ts` 只输出数据规格（JSON，含尺寸 w/h），`runtime/reveal/charts.js` 在浏览器中渲染 SVG、处理交互；几何属性用 CSS（x / y / width / height / d / cx / cy）以便 transition。

**位图**：`imagesize.ts` 读取原始尺寸，`imageGeom()` 计算 fit + zoom 后的图片矩形；图片标注在 `normalize.ts` 的 5b 步骤中按图片坐标换算（`placeAnnotation`），新出现的标注会在上一 State 放一个透明幽灵以便随 zoom 移动。

**效果库浏览器**：`gallery.ts` 为每个条目构建迷你 deck（共享 `output/_gallery/lib/`），生成 index / view 页面和缩略图；dev 首页复用 `galleryGridHtml`。

## 已知坑

- **flex 与 morph**：Auto-Animate 用 !important 锁定 width/height 做插值，而 flex-grow 会覆盖 height，造成变形。因此 slot 中只有一个对象时，渲染为绝对定位（`render.ts`）。
- **只按 data-id 匹配**：Reveal 默认还会按文字和图片 src 自动匹配，嵌套时会重复动画。`runtime.js` 中提供了自定义 matcher。
- **字号插值**：font-size 放在 `.obj` 上，内部用 em，整体缩放才会连续。
- **fragment 样式**：自定义效果需要 `.fragment.custom`，否则 Reveal 默认的隐藏样式会生效。
- **中文字形**：CJK 字形框比 line-height 高，溢出检查留了 0.35em 容差。
- **tsx 注入 `__name`**：传给 `page.evaluate` 的函数里会出现 `__name`，`openDeck` 中做了兼容处理。
- **内边距与居中**：文字块 + 内边距超过容器时，`safe center` 会退化为顶部对齐（看起来"没居中"）。shape 默认内边距随尺寸自适应（`autoPadding`），QA 按"文字块是否落在内容区内"检查。
- **嵌套 morph**：图片内部的 `.img-z` 与外层 `.obj` 同时匹配时，内层用相对父容器的 left/top/尺寸插值（runtime.js 的 NESTED 选项），否则父容器移动会叠加两次。
- **图表的指针事件**：数值标签、隐藏的标记必须 `pointer-events: none`，否则会挡住悬停 / 点击。
- **隐藏的浏览器面板不渲染**：CSS 过渡与 rAF 不推进，验证动画要用 `check --film` 或无头浏览器脚本，不要依赖面板截图。
- **dev 热重启**：端口先在原端口重试几秒再顺延；Windows 上删除目录带重试（并发构建时目录可能被占用）。

## Reveal.js 文档策略

目前依据 Reveal 6.0.2 的源码和类型定义（`node_modules/reveal.js/dist/*.d.ts`）开发。**同一类 Reveal 行为 bug 反复出现时**，再系统地参考官方文档（revealjs.com：auto-animate、fragments、config、API），并把结论写进 `docs/adr/`。

## 改了架构原则

先写 `docs/adr/NNN-<主题>.md`：背景、决定、后果、为未来保留了什么。
