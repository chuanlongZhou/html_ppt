# 部署到 Netlify

仓库根目录的 [`netlify.toml`](../netlify.toml) 是**整站**配置：Netlify 拉取仓库后执行 `npm ci && npm run site`，发布 `output/_site/`。无需在 Netlify 后台手填构建命令。

## 整站包含什么

`npm run site [deck…]` 把整个项目组装成静态站点 `output/_site/`：

- `/`：项目主页（主题与页面元素、页面结构、动画与交互、「我的演示」卡片）
- `/<deck>/`：每个 deck 的放映页（默认 `decks/` 与 `proj/` 下全部；`npm run site -- CHETNA intro` 只含指定的）
- `/view.html#<id>`：效果库条目预览

缩略图要用浏览器截图：`netlify.toml` 的构建命令先执行 `npx playwright-core install --only-shell chromium` 再 `npm run site`。如果 Chromium 装不上或启动失败，构建照常完成，只是没有 PNG 缩略图：主页的效果卡片会自动改用实时预览（滚动到时才加载的缩小 iframe，停在最终画面），演示卡片显示标题。也可以本地运行 `npm run site` 后用 CLI 上传：`npx netlify deploy --dir output/_site --prod`。

缩略图截图时会自动注入 devDependency `@fontsource/noto-sans-sc` 的中文字体（Netlify 的 Linux 构建机没有中文字体，否则中文会被画成方块并烤进 PNG）；运行时的放映页仍用访客自己的字体，不受影响。

主页与效果库预览页的界面默认英文，右上角可切换中文（记在浏览器 localStorage）；效果库条目的标题、提示词、说明始终中英双语显示。

## 首次部署

1. Netlify → **Add new site → Import an existing project**，选择 GitHub 与本仓库。
2. 选择要部署的分支，构建设置自动读取 `netlify.toml`，直接 Deploy。
3. 之后每次推送该分支都会重新构建、部署；PR 会生成 Deploy Preview。

## 只部署 CHETNA

[`netlify.chetna.toml`](../netlify.chetna.toml) 只构建并发布 `proj/CHETNA`（`npm run build -- CHETNA` → `output/CHETNA/site/`）。Netlify 只自动读取 `netlify.toml`，所以：

- 用 CLI：`npx netlify deploy --build --prod --config netlify.chetna.toml`；或
- 新建一个分支（如 `deploy/chetna`），把 `netlify.chetna.toml` 的内容放进该分支的 `netlify.toml`，在 Netlify 开启该分支的分支部署或设为某站点的生产分支。更新时把 `main` 合并进去，冲突时保留该分支自己的 `netlify.toml`。

换成别的演示：把配置里的 `CHETNA` 改成 deck 名（`decks/<name>` 或 `proj/<name>`）。

## 本地验证（与 Netlify 同样的步骤）

```bash
npm ci
npm run site          # 整站 → output/_site/
npx serve output/_site
```

## 注意

- `output/` 被 `.gitignore` 忽略，产物始终由 Netlify 构建，不要提交。
- 线上内容完全来自已提交的源文件：`proj/CHETNA/deck.yaml`、`theme.yaml`、`captions.json`、`assets/`。未提交的修改不会出现在线上。
- 站点是公开的：页面内嵌的演讲者备注（`<aside class="notes">`）可通过查看源码读到；如不想公开，请给站点设置访问密码。
- 图片总量约 40 MB，加载慢时优先压缩 `proj/CHETNA/assets/`。
- 需要发给别人单个文件时，用 `npm run export -- <deck> --verify` 导出离线单文件 HTML，不必部署。
