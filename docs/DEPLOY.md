# 部署到 Netlify

以 CHETNA 为例：Netlify 拉取本仓库，执行 `npm run build -- CHETNA`，发布 `output/CHETNA/site/`（Reveal.js 纯静态站点，离线可放映，无外部依赖）。

配置在仓库根目录 [`netlify.toml`](../netlify.toml)，无需在 Netlify 后台手填构建命令。

## 首次部署

1. Netlify → **Add new site → Import an existing project**，选择 GitHub 与本仓库。
2. 选择要部署的分支（需包含 `proj/CHETNA/`）。
3. 构建设置会自动读取 `netlify.toml`，直接 Deploy。

之后每次推送该分支都会自动重新构建、部署；PR 会生成 Deploy Preview。

## 本地验证（与 Netlify 同样的步骤）

```bash
npm ci
npm run build -- CHETNA
# 打开 output/CHETNA/site/index.html，或：npx serve output/CHETNA/site
```

## 部署其他演示

把 `netlify.toml` 中的 `CHETNA` 改成 deck 名（`decks/<name>` 或 `proj/<name>` 均可）。同一仓库想部署多个站点，可在 Netlify 建多个 site，并分别用 `netlify.toml` 的 context 或各自后台设置覆盖 build command 与 publish。

## 注意

- `output/` 被 `.gitignore` 忽略，产物始终由 Netlify 构建，不要提交。
- 部署内容完全来自已提交的源文件：`proj/CHETNA/deck.yaml`、`theme.yaml`、`assets/`。未提交的修改不会出现在线上。
- 图片总量约 40 MB，加载慢时优先压缩 `proj/CHETNA/assets/`。
- 站点是公开的：页面内嵌的演讲者备注（`<aside class="notes">`）可通过查看源码读到；如不想公开，请给 Netlify 站点设置访问密码或使用私有仓库 + 受限站点。
