---
name: library-curate
description: 维护 html_ppt 效果库（engine/library/）：新增或修改"场景/效果 ↔ 提示词"条目，给已有条目补充提示词，调整分类，把某个 deck 中的好设计沉淀为可复用条目。用于"把这页做成模板/加到效果库""效果库里加一个…效果""这个说法应该能找到…"等需求。
---

# library-curate：效果库是长期资产

一个条目 = **提示词**（用户怎么说）+ **适用场景** + **一个可直接使用的 scene**。条目会自动出现在：

- `engine/library/INDEX.md`：给 AI 查的提示词速查（`npm run catalog` 生成）
- 效果库浏览器：`npm run dev` 首页 / `npm run gallery` → `output/_gallery/`（给人看：缩略图、逐步预览、复制 YAML）
- `decks/library`（全部条目的演示 deck）与 `decks/intro` 的效果库部分

## 分类（类别 → 分组）

定义在 `engine/src/schema.ts` 的 `LIB_CATEGORIES`；条目的 `group` 必须属于其类别。

| 类别（目录） | 分组 |
|---|---|
| `page` 页面结构 | structure 结构页 · text 文字页 · visual 图文与对比 · data 数据页 · diagram 流程与框架 |
| `build` 页内动画 | reveal 出现 · emphasis 强调 · diagram 结构搭建 |
| `morph` 状态切换 | layout 版面变化 · focus 聚焦 · data 数据与进度 |
| `interact` 交互数据 | chart 交互图表 · linked 联动与面板 · narrative 讲述 + 探索 |
| `image` 位图操作 | focus 放大与聚光 · annotate 标注 · compare 对比 |

需要新分组时：先在 `LIB_CATEGORIES` 中登记（写清中文名），再使用。不要为一个条目开一个分组。

## 新增之前

1. 在 INDEX.md 的提示词速查里搜索相近条目。只是说法不同时，给已有条目补 `prompts`，不要新建。
2. 判断类别：静态版式 → page；页内点击 → build；State 之间的变化 → morph；需要交互或真实数据 → interact；对截图 / 照片做操作 → image。

## 条目文件

`engine/library/<类别>/<name>.yaml`，文件名即 name：

```yaml
id: build.my-effect            # <类别>.<name>，与路径一致
group: emphasis                # 所属分组
title: 中文名
order: 8                       # 同组中的排序
prompts: [说法一, 说法二, 说法三, english phrase]   # 3–6 个，写用户真实的说法
use_when: 适合什么情况（一句话）
avoid_when: 不适合什么情况（一句话，指出替代条目）
en:                            # 英文说明：主页与效果库中英双语显示，英文请求也能查到
  title: English name
  prompts: [english phrase, another phrase]
  use_when: When to use it (one sentence)
  avoid_when: When not to (one sentence, name the alternative)
demo:                          # 一个完整 scene，不写 id
  layout: title-body
  objects: { ... }
  steps: [ ... ]               # 或 states
```

**demo 的要求**

- **自解释**：文字讲的就是这个效果本身（"每点击一次，出现一条"），放进任何介绍 deck 都成立。
- **中英双语**：英文在前，中文用 `^^译文^^` 另起一行（自动缩小、减淡）：`"One click, one point ^^每点击一次，出现一条^^"`；短标签写 `English · 中文`。图表分类写 `Power · 电力`，竖向柱状图会自动分两行。改完确认没有溢出。
- 颜色用 token；文字用 role，少写 size。
- 底部 64px 留给说明条：对象的 y + h ≤ 1010。
- 素材放 `engine/library/assets/`，用 `src: "@lib/<文件名>"` 引用。现有位图：`sample-ui.png`（仪表盘截图，1600×1000）、`sample-city.png`（城市照片风格，1600×1000）。
- 位图标注一律用 `on: <图片 key>` + `box` / `from` / `to`（图片坐标 0–1），这样 `zoom` 改变时标注会跟随。
- 交互数据用 `chart` 组件；数据写"示例数据"，并在 `source` 中注明。
- key 命名稳定（title、c1、c2…），让 `use:` 继承后只改文字就能用。

## 验证

```bash
npm run catalog
npm run check -- library --scene lib-<类别>-<name> --film
npm run check -- library
npm run gallery
```

- 查看截图与 film 帧，确认动画确实表达了 `use_when` 中的意图。
- 交互条目：在 `npm run dev` 的效果库预览中实际悬停、点击一遍。
- 修改已有条目会影响所有 `use:` 它的 deck，改完再跑一次 `npm run check -- intro`。

## 从 deck 中沉淀

某个 deck 里出现了第二次相同的结构，或者用户说"这个效果以后还要用"：

1. 把该 scene 复制成 demo，把文字改为自解释的。
2. 补上 group、prompts、use_when、avoid_when 与 en。
3. 让原 deck 改为 `use:` 新条目，然后 check 原 deck。
