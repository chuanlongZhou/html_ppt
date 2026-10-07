/**
 * export：把 build 出的 site/ 打包成单个可直接双击打开的 HTML（离线、无外部依赖）。
 *  - <link rel=stylesheet> / <script src> 内联（含 Reveal.js）
 *  - assets/ 里的图片等资源只嵌入一份 base64，启动时回填到 <img data-asset> 与初始化配置（同一张图在多个 State 里出现也不重复）
 *  - CSS 里的 url(assets/…) 改为 :root 里的 --asset-N 变量
 * verify：用无头浏览器在 file:// 下实测——零外部请求、无报错、图片全部加载、逐步翻完所有 State 与点击，并截图。
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildDeck } from './build.ts';
import { printIssues } from './report.ts';
import { rel, type DeckPaths } from './paths.ts';
import { escapeHtml } from './markup.ts';

const MIME: Record<string, string> = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.json': 'application/json',
};

/** build 往 site/ 里放用户资源的目录：deck 自己的 assets/，以及效果库素材 _lib/（@lib/…） */
const ASSET_DIRS = ['assets', '_lib'];
const ASSET_REF = ASSET_DIRS.join('|');

export interface ExportResult {
  file: string;
  bytes: number;
  assets: { path: string; bytes: number }[];
  /** 没能自包含的引用（仍指向外部文件 / 网络） */
  external: string[];
  warnings: string[];
}

/** 把已构建的 site 目录打包成单个 HTML 字符串 */
export function inlineSite(site: string): { html: string; assets: ExportResult['assets']; external: string[]; warnings: string[] } {
  const warnings: string[] = [];
  const read = (f: string) => fs.readFileSync(path.join(site, f), 'utf8');

  // 1. assets → data URI（以 index.html 中使用的相对路径为键）
  const dataUri = new Map<string, string>();
  const assets: ExportResult['assets'] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else {
        const key = path.relative(site, full).split(path.sep).join('/');
        const ext = path.extname(e.name).toLowerCase();
        if (!MIME[ext]) warnings.push(`未知的资源类型 ${key}，按 application/octet-stream 嵌入`);
        const buf = fs.readFileSync(full);
        dataUri.set(key, `data:${MIME[ext] ?? 'application/octet-stream'};base64,${buf.toString('base64')}`);
        assets.push({ path: key, bytes: buf.length });
      }
    }
  };
  for (const dir of ASSET_DIRS) if (fs.existsSync(path.join(site, dir))) walk(path.join(site, dir));

  let html = read('index.html');

  // 2. 样式：内联，CSS 里的 url(assets/…) → 变量
  const cssVars = new Map<string, string>();
  html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (_m, href: string) => {
    let css = read(href);
    css = css.replace(new RegExp(`url\\(\\s*(["']?)((?:\\.\\/)?(?:${ASSET_REF})\\/[^)"']+)\\1\\s*\\)`, 'g'), (_u, _q, p: string) => {
      const key = p.replace(/^\.\//, '');
      if (!dataUri.has(key)) return _u;
      if (!cssVars.has(key)) cssVars.set(key, `--asset-${cssVars.size}`);
      return `var(${cssVars.get(key)})`;
    });
    return `<style>\n${css}\n</style>`;
  });
  if (cssVars.size)
    html = html.replace('</head>', `<style>:root{${[...cssVars].map(([k, v]) => `${v}:url("${dataUri.get(k)}")`).join(';')}}</style>\n</head>`);

  // 3. <img src="assets/x"> → <img data-asset="assets/x">（真正的数据只在 __ASSETS 里存一份）
  const used = new Set<string>();
  html = html.replace(new RegExp(`(<img\\b[^>]*?)\\ssrc="((?:\\.\\/)?(?:${ASSET_REF})\\/[^"]+)"`, 'g'), (m, pre: string, p: string) => {
    const key = p.replace(/^\.\//, '');
    if (!dataUri.has(key)) return m;
    used.add(key);
    return `${pre} data-asset="${key}"`;
  });

  // 4. 脚本：内联；其后的初始化调用前插入资源回填
  const bootstrap = (keys: string[]) =>
    `<script>(function(){var A={${keys.map((k) => `${JSON.stringify(k)}:${JSON.stringify(dataUri.get(k))}`).join(',')}};` +
    `function r(v){if(typeof v==='string')return Object.prototype.hasOwnProperty.call(A,v)?A[v]:v;if(Array.isArray(v))return v.map(r);` +
    `if(v&&typeof v==='object'){var o={};for(var k in v)o[k]=r(v[k]);return o}return v}` +
    `window.__ASSETS=A;window.__asset=r;` +
    `Array.prototype.forEach.call(document.querySelectorAll('img[data-asset]'),function(e){e.src=A[e.getAttribute('data-asset')];e.removeAttribute('data-asset')});})();</script>`;
  const wrapInit = `<script>(function(i){HtmlPpt.init=function(c){return i.call(this,window.__asset(c))}})(HtmlPpt.init);</script>`;

  // 配置 JSON 里引用的资源（如页面 chrome 的 logo）也要带上
  const cfg = /HtmlPpt\.init\((\{.*\})\);/s.exec(html)?.[1] ?? '';
  const overrides = [...html.matchAll(/\bdata-chrome="([^"]*)"/g)].map(m => m[1]);
  for (const k of dataUri.keys())
    if (cfg.includes(JSON.stringify(k)) || overrides.some(o => o.includes(escapeHtml(JSON.stringify(k))))) used.add(k);

  let first = true;
  html = html.replace(/<script src="([^"]+)"><\/script>/g, (_m, src: string) => {
    const js = read(src).replace(/\n\/\/# sourceMappingURL=.*$/gm, '').replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
    const pre = first ? bootstrap([...used]) + '\n' : '';
    first = false;
    return `${pre}<script>\n${js}\n</script>`;
  });
  html = html.replace(/<script>HtmlPpt\.init\(/, `${wrapInit}\n<script>HtmlPpt.init(`);

  // 5. 自包含检查：还有哪些引用没被内联
  const external = new Set<string>();
  const markup = html.replace(/<script>[\s\S]*?<\/script>/g, ''); // 只扫 HTML 与 CSS，不扫 JS 源码（里面的 url( 等是代码）
  for (const m of markup.matchAll(/\s(?:src|href|poster)="([^"]+)"/g)) if (!/^(data:|#|javascript:)/.test(m[1])) external.add(m[1]);
  for (const m of markup.matchAll(/url\(\s*["']?(?!data:|#)([^)"']+)/g)) external.add(m[1]);
  for (const m of markup.matchAll(/@import\s+(?:url\()?["']?([^"');]+)/g)) external.add(m[1]);

  return { html, assets: assets.filter((a) => used.has(a.path)), external: [...external], warnings };
}

export function exportDeck(d: DeckPaths, opts: { out?: string } = {}): ExportResult & { ok: boolean } {
  const b = buildDeck(d);
  printIssues(b.issues.list);
  if (!b.ok) return { ok: false, file: '', bytes: 0, assets: [], external: [], warnings: [] };
  const { html, assets, external, warnings } = inlineSite(d.site);
  const file = path.resolve(opts.out ?? path.join(d.out, `${d.name}.html`));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  return { ok: true, file, bytes: Buffer.byteLength(html), assets, external, warnings };
}

export interface VerifyReport {
  ok: boolean;
  sections: number;
  steps: number;
  images: { total: number; broken: string[] };
  requests: { total: number; external: string[] };
  errors: string[];
  shots: string[];
}

/** 在 file:// 下实测导出的 HTML：外部请求、控制台错误、图片、逐步翻页；shotsDir 非空时每步截图 */
export async function verifyStandalone(file: string, shotsDir?: string): Promise<VerifyReport> {
  const { launch, openDeck } = await import('./qa/check.ts');
  const browser = await launch();
  const rep: VerifyReport = { ok: true, sections: 0, steps: 0, images: { total: 0, broken: [] }, requests: { total: 0, external: [] }, errors: [], shots: [] };
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    const url = pathToFileURL(file).href;
    page.on('request', (r) => {
      rep.requests.total++;
      const u = r.url();
      if (!u.startsWith('data:') && u !== url && !u.startsWith('blob:') && !u.startsWith('about:')) rep.requests.external.push(u);
    });
    page.on('console', (m) => m.type() === 'error' && rep.errors.push('console: ' + m.text()));
    page.on('pageerror', (e) => rep.errors.push('pageerror: ' + e.message));
    await openDeck(page, url);
    rep.sections = await page.evaluate(() => (window as any).Reveal.getSlides().length);
    if (shotsDir) fs.mkdirSync(shotsDir, { recursive: true });
    // 与放映时一样：反复按"下一步"（Reveal.next 先走点击再换页），直到最后一页最后一次点击
    for (let i = 0; i < 500; i++) {
      const pos = await page.evaluate(() => {
        const R = (window as any).Reveal;
        const ix = R.getIndices();
        return { h: ix.h, f: ix.f ?? -1, last: R.isLastSlide() && !R.availableFragments().next, n: R.getSlides().length };
      });
      rep.steps++;
      if (shotsDir) {
        await page.waitForTimeout(1300); // 等 morph / 动画结束
        const f = path.join(shotsDir, `${String(rep.steps).padStart(2, '0')}-s${pos.h}-c${pos.f + 1}.png`);
        await page.screenshot({ path: f });
        rep.shots.push(f);
      }
      if (pos.last) break;
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(shotsDir ? 50 : 150);
    }
    const imgs = await page.evaluate(() =>
      Array.from(document.images).map((i) => ({ key: i.getAttribute('data-id') || i.alt || i.src.slice(0, 30), ok: i.complete && i.naturalWidth > 0 })),
    );
    rep.images.total = imgs.length;
    rep.images.broken = imgs.filter((i) => !i.ok).map((i) => i.key);
  } finally {
    await browser.close();
  }
  rep.ok = !rep.requests.external.length && !rep.errors.length && !rep.images.broken.length;
  return rep;
}

export async function exportCli(d: DeckPaths, opts: { out?: string; verify: boolean; shots: boolean }): Promise<number> {
  const r = exportDeck(d, { out: opts.out });
  if (!r.ok) {
    console.log(`✖ export ${d.name}：deck 有 error，未导出`);
    return 1;
  }
  const mb = (n: number) => (n / 1048576).toFixed(2) + ' MB';
  console.log(`✔ export ${d.name}  ${mb(r.bytes)}  内嵌资源 ${r.assets.length} 个（${mb(r.assets.reduce((s, a) => s + a.bytes, 0))} 原始大小）`);
  console.log(`file: ${rel(r.file)}`);
  for (const w of r.warnings) console.log('▲ ' + w);
  for (const e of r.external) console.log(`▲ [NOT_SELF_CONTAINED] 仍有外部引用：${e}`);
  if (r.bytes > 50 * 1048576) console.log('▲ 文件超过 50 MB，浏览器打开可能很慢；考虑压缩图片');
  let code = r.external.length ? 1 : 0;

  if (opts.verify) {
    const dir = path.join(path.dirname(r.file), `${d.name}-export-verify`);
    if (opts.shots) fs.rmSync(dir, { recursive: true, force: true });
    const v = await verifyStandalone(r.file, opts.shots ? dir : undefined);
    console.log(`${v.ok ? '✔' : '✖'} verify (file://)  页面 ${v.sections}  步骤 ${v.steps}  图片 ${v.images.total - v.images.broken.length}/${v.images.total}  请求 ${v.requests.total}（外部 ${v.requests.external.length}）  报错 ${v.errors.length}`);
    for (const u of v.requests.external) console.log('  ✖ 外部请求：' + u);
    for (const k of v.images.broken) console.log('  ✖ 图片未加载：' + k);
    for (const e of v.errors) console.log('  ✖ ' + e);
    if (opts.shots) console.log(`shots: ${rel(dir)}/（${v.shots.length} 张）`);
    if (!v.ok) code = 1;
  }
  return code;
}
