/**
 * 效果库浏览器：output/_gallery/
 *  - e/<id>/site/      每个条目一个迷你 deck（共享 lib/reveal）
 *  - thumbs/<id>.png   缩略图（Playwright 截取最后一个 State 的最终画面）
 *  - theme-preview/    主页「主题与页面元素」用的示例 deck（颜色与页面元素由 postMessage 驱动）
 *  - index.html        主页（home.ts）：演示、主题与页面元素、页面结构、动画与交互
 *  - view.html#<id>    单条目查看：实时预览 + 逐步控制 + 提示词 + 可复制的 YAML
 * 页面数据内嵌在 HTML 中，直接双击打开（file://）也能用。
 */
import fs from 'node:fs';
import path from 'node:path';
import { stringify } from 'yaml';
import { loadLibrary, type LibEntry } from './library.ts';
import { buildDeck, copyReveal } from './build.ts';
import { Issues } from './issues.ts';
import { LIB_CATEGORIES, LIB_CATEGORIES_EN } from './schema.ts';
import { ENGINE, OUTPUT, ROOT, rel, type DeckPaths } from './paths.ts';
import { homeHtml, LANG_BOOT } from './home.ts';
import { escapeHtml } from './markup.ts';
import { printIssues } from './report.ts';

export const GALLERY = path.join(OUTPUT, '_gallery');

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  group: string;
  groupLabel: string;
  prompts: string[];
  use_when: string;
  avoid_when?: string;
  /** 英文说明（有则中英双语显示） */
  en?: { title: string; prompts: string[]; use_when: string; avoid_when?: string };
  file: string;
  use: string;
  yaml: string;
  states: number;
  clicks: number[];
  ok: boolean;
  errors: string[];
}

/** 构建全部迷你 deck 与页面（快）；thumbs=true 时再用浏览器截缩略图（慢，约每条 0.3s） */
export async function buildGallery(opts: { thumbs?: boolean; quiet?: boolean } = {}): Promise<{ items: GalleryItem[]; issues: Issues }> {
  const issues = new Issues();
  const lib = loadLibrary(issues);
  fs.mkdirSync(path.join(GALLERY, 'e'), { recursive: true });
  copyReveal(path.join(GALLERY, 'lib', 'reveal'));
  const items: GalleryItem[] = [];
  for (const e of lib) {
    const dir = path.join(GALLERY, 'e', e.id);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, 'deck.yaml');
    fs.writeFileSync(file, `deck:\n  title: ${JSON.stringify(e.title)}\n  slideNumber: false\n  transition: none\nscenes:\n  - { library: ${JSON.stringify(e.id)}, caption: false }\n`);
    const d: DeckPaths = { name: e.id, dir, file, out: dir, site: path.join(dir, 'site'), qa: path.join(dir, 'qa') };
    const b = buildDeck(d, { libBase: '../../../lib/' });
    items.push(item(e, b.manifest?.sections.map((s) => s.clicks) ?? [], b.ok, b.issues.errors.map((i) => i.message)));
  }
  buildThemePreview(issues);
  const thumbsDir = path.join(GALLERY, 'thumbs');
  fs.mkdirSync(thumbsDir, { recursive: true });
  writePages(items);
  if (opts.thumbs) await thumbnails(items, thumbsDir);
  if (!opts.quiet) {
    console.log(`✔ 效果库浏览器：${rel(path.join(GALLERY, 'index.html'))}（${items.length} 个条目${opts.thumbs ? '，含缩略图' : ''}）`);
    printIssues(issues.list);
  }
  return { items, issues };
}

/** 主页工作台的预览 deck：engine/themes/preview/deck.yaml → output/_gallery/theme-preview/site/ */
function buildThemePreview(issues: Issues) {
  const dir = path.join(GALLERY, 'theme-preview');
  const file = path.join(ENGINE, 'themes', 'preview', 'deck.yaml');
  const d: DeckPaths = { name: 'theme-preview', dir, file, out: dir, site: path.join(dir, 'site'), qa: path.join(dir, 'qa') };
  const b = buildDeck(d, { libBase: '../../lib/' });
  for (const i of b.issues.errors) issues.error(i.code, `主题预览 deck：${i.message}`, i);
}

function item(e: LibEntry, clicks: number[], ok: boolean, errors: string[]): GalleryItem {
  const name = e.id.split('.')[1];
  return {
    id: e.id,
    title: e.title,
    category: e.category,
    categoryLabel: e.categoryLabel,
    group: e.group,
    groupLabel: e.groupLabel,
    prompts: e.prompts,
    use_when: e.use_when,
    avoid_when: e.avoid_when,
    en: e.en,
    file: rel(e.file),
    use: `- { id: my-${name}, use: ${e.id} }`,
    yaml: stringify([{ id: `my-${name}`, ...e.demo }], { lineWidth: 0 }).trim(),
    states: clicks.length,
    clicks,
    ok,
    errors,
  };
}

/**
 * 缩略图在构建机（如 Netlify 的 Linux）上截图，那里没有中文字体，中文会被画成方块并烤进 PNG。
 * 这里把 devDependency @fontsource/noto-sans-sc 的中文子集（按 unicode-range 只下载用到的）注入页面：
 * 它以 'Noto Sans SC' 命名，正好是风格字体栈的最后一项，所以只补中文字形，拉丁字母不变。
 */
export async function withCjkFonts(page: import('playwright-core').Page) {
  const dir = path.join(ROOT, 'node_modules', '@fontsource', 'noto-sans-sc');
  if (!fs.existsSync(dir)) return;
  const css = [400, 700]
    .map((w) => path.join(dir, `chinese-simplified-${w}.css`))
    .filter((f) => fs.existsSync(f))
    .map((f) => fs.readFileSync(f, 'utf8').replace(/url\(\.\/files\//g, 'url(/__cjkfont/'))
    .join('\n');
  await page.route('**/__cjkfont/*', (route) => {
    const file = path.join(dir, 'files', path.basename(new URL(route.request().url()).pathname));
    if (!file.startsWith(path.join(dir, 'files')) || !fs.existsSync(file)) return route.fulfill({ status: 404 });
    return route.fulfill({ path: file, headers: { 'access-control-allow-origin': '*' } });
  });
  // 用字符串而不是函数：tsx/esbuild 会给函数注入 __name，序列化到浏览器里会报 ReferenceError
  await page.addInitScript(
    `(function(){var c=${JSON.stringify(css)};function add(){var st=document.createElement('style');st.textContent=c;document.head.appendChild(st)}if(document.head)add();else document.addEventListener('DOMContentLoaded',add)})();`,
  );
}

async function thumbnails(items: GalleryItem[], dir: string) {
  const { launch, openDeck, goTo } = await import('./qa/check.ts');
  const { serveStatic } = await import('./serve.ts');
  const { server, port } = await serveStatic(GALLERY, 0);
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 1 });
    await withCjkFonts(page);
    for (const it of items) {
      if (!it.ok) continue;
      await openDeck(page, `http://127.0.0.1:${port}/e/${it.id}/site/index.html?qa`);
      const last = it.states - 1;
      await goTo(page, last, it.clicks[last] - 1);
      await page.screenshot({ path: path.join(dir, `${it.id}.png`) });
    }
  } finally {
    await browser.close();
    server.close();
  }
}

/** 「我的演示」卡片的缩略图：每个 deck 的第一页（需要 dev 服务器已构建过 output/<deck>/site） */
export async function deckThumbnails(names: string[]) {
  const dir = path.join(GALLERY, 'thumbs');
  fs.mkdirSync(dir, { recursive: true });
  const { launch, openDeck, goTo } = await import('./qa/check.ts');
  const { serveStatic } = await import('./serve.ts');
  const { server, port } = await serveStatic(OUTPUT, 0);
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 1 });
    await withCjkFonts(page);
    for (const name of names) {
      if (!fs.existsSync(path.join(OUTPUT, name, 'site', 'index.html'))) continue;
      try {
        await openDeck(page, `http://127.0.0.1:${port}/${name}/site/index.html?qa`);
        await goTo(page, 0, -1);
        await page.screenshot({ path: path.join(dir, `deck-${name}.png`) });
      } catch {
        /* 单个 deck 失败不影响其他 */
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
}

/* ---------------- 页面 ---------------- */

function writePages(items: GalleryItem[]) {
  const data = JSON.stringify({ items, categories: LIB_CATEGORIES, categoriesEn: LIB_CATEGORIES_EN }).replace(/</g, '\\u003c');
  fs.writeFileSync(path.join(GALLERY, 'index.html'), homeHtml({ items, decks: [], dev: false, base: '' }));
  fs.writeFileSync(path.join(GALLERY, 'view.html'), page('Library · html_ppt', VIEW_CSS, `<script>window.GALLERY=${data};</script>${VIEW_BODY}`));
}

function page(title: string, css: string, body: string) {
  return `<!doctype html><html lang="en" data-lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><link rel="icon" href="data:,"><script>${LANG_BOOT}</script><style>${BASE_CSS}${css}</style></head><body>${body}</body></html>`;
}

const BASE_CSS = `
:root{--bg:#F6F5F1;--card:#fff;--ink:#16181D;--muted:#5E6571;--line:#E2DFD8;--accent:#2F5BEA;--soft:#DEE6FF}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 "Segoe UI","Microsoft YaHei UI","Microsoft YaHei","PingFang SC",sans-serif}
a{color:inherit;text-decoration:none}code,.mono{font-family:"Cascadia Code",Consolas,monospace}
button{font:inherit;cursor:pointer}
html[data-lang="en"] [data-l="zh"],html[data-lang="zh"] [data-l="en"]{display:none!important}
`;

const VIEW_CSS = `
.vw{display:grid;grid-template-columns:minmax(0,1fr) 420px;gap:24px;padding:18px 24px;max-width:1720px;margin:0 auto}
.vw-top{grid-column:1/-1;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.vw-top a.back{font-weight:700;color:var(--accent)}.vw-top .crumb{color:var(--muted)}.vw-top .sp{flex:1}
.vw-top button,.vw-ctl button{border:0;box-shadow:0 1px 2px rgba(22,24,29,.06),0 1px 3px rgba(22,24,29,.07);background:#fff;border-radius:10px;padding:7px 14px}
.vw-stage{background:#1d1f24;border-radius:16px;box-shadow:0 4px 8px rgba(22,24,29,.06),0 20px 44px rgba(22,24,29,.16);overflow:hidden;aspect-ratio:16/9;position:relative}
.vw-stage iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.vw-ctl{display:flex;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap}
.vw-ctl .prog{color:var(--muted);margin-left:6px}.vw-ctl .hint{margin-left:auto;color:var(--muted);font-size:13px}
.vw-ctl button.pri{background:var(--ink);color:#fff;border-color:var(--ink)}
.vw-side{background:#fff;box-shadow:0 2px 4px rgba(22,24,29,.05),0 8px 22px rgba(22,24,29,.09);border-radius:16px;padding:22px;align-self:start;position:sticky;top:18px;max-height:calc(100vh - 36px);overflow:auto}
.vw-side h1{font-size:24px;margin:0}.vw-side .zh{font-size:17px;color:var(--muted);font-weight:600}.vw-side .id{color:var(--muted);font-size:13px}
.vw-side .p2{color:var(--muted);margin-top:4px}
.vw-side h3{font-size:13px;color:var(--muted);margin:18px 0 6px;letter-spacing:.04em}
.vw-pr{display:flex;flex-wrap:wrap;gap:6px}.vw-pr span{background:var(--soft);color:var(--accent);padding:3px 10px;border-radius:8px;font-size:13px}
.vw-side p{margin:0}
.code{position:relative;background:#16181D;color:#E9E7E0;border-radius:10px;padding:12px 14px;font:12.5px/1.55 "Cascadia Code",Consolas,monospace;white-space:pre;overflow:auto;max-height:340px}
.code button{position:absolute;right:8px;top:8px;border:0;border-radius:6px;padding:3px 10px;background:#2F5BEA;color:#fff;font-size:12px}
.vw-err{background:#FDECEC;color:#B42318;border-radius:10px;padding:10px 12px;font-size:13px;margin-top:12px}
@media (max-width:1100px){.vw{grid-template-columns:1fr}.vw-side{position:static;max-height:none}}
`;

/** 界面文字中英各一份（由 data-lang 切换）；条目内容（标题、提示词、适用场景）有英文时中英同时显示 */
const L = (en: string, zh: string) => `<span data-l="en">${en}</span><span data-l="zh">${zh}</span>`;

const VIEW_BODY = `<div class="vw"><div class="vw-top"><a class="back" id="vw-back" href="index.html">${L('← Home', '← 返回主页')}</a><span class="crumb" id="vw-crumb"></span><span class="sp"></span><button id="vw-prevE">${L('Previous entry', '上一个条目')}</button><button id="vw-nextE">${L('Next entry', '下一个条目')}</button><button id="vw-lang" title="Language / 语言">${L('中文', 'EN')}</button></div>
<div><div class="vw-stage"><iframe id="vw-frame" title="Preview"></iframe></div>
<div class="vw-ctl"><button id="vw-replay">${L('⟲ Replay', '⟲ 重播')}</button><button id="vw-prev">${L('◀ Back', '◀ 上一步')}</button><button id="vw-next" class="pri">${L('Next ▶', '下一步 ▶')}</button><span class="prog" id="vw-prog"></span><span class="hint">${L('Arrow keys work too; charts respond to clicks and hover in the preview', '方向键 ← → 也可以；图表类条目可直接在预览中点击、悬停')}</span></div><div id="vw-err"></div></div>
<aside class="vw-side" id="vw-side"></aside></div>
<script>(function(){var G=window.GALLERY;var frame=document.getElementById('vw-frame'),side=document.getElementById('vw-side');var cur=null,idx={h:0,f:-1};
var lang=document.documentElement.getAttribute('data-lang')==='zh'?'zh':'en';function t(en,zh){return lang==='zh'?zh:en}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function post(method,args){frame.contentWindow&&frame.contentWindow.postMessage(JSON.stringify({method:method,args:args||[]}),'*')}
function prog(){if(!cur)return;var c=cur.clicks[idx.h]||0;document.getElementById('vw-prog').textContent=(cur.states>1?'State '+(idx.h+1)+' / '+cur.states:t('Single State','单个 State'))+(c?t(' · click ',' · 点击 ')+(idx.f+1)+' / '+c:'')}
function copyBtn(id){return '<button data-copy="'+id+'">'+t('Copy','复制')+'</button>'}
function both(en,zh){return en?'<p>'+esc(en)+'</p><p class="p2">'+esc(zh)+'</p>':'<p>'+esc(zh)+'</p>'}
function crumb(){var C=lang==='zh'||!G.categoriesEn?G.categories[cur.category]:G.categoriesEn[cur.category];document.getElementById('vw-crumb').textContent=C.label+' › '+C.groups[cur.group]}
function renderSide(){var E=cur.en||{};var zhP=cur.prompts.filter(function(p){return /[^\\x00-\\x7F]/.test(p)});var prompts=cur.en?E.prompts.concat(zhP):cur.prompts;
side.innerHTML='<h1>'+esc(E.title||cur.title)+'</h1>'+(cur.en?'<div class="zh">'+esc(cur.title)+'</div>':'')+'<div class="id mono">'+esc(cur.id)+'</div>'+
'<h3>'+t('Prompts — say this to call it','提示词（这样说就能调用）')+'</h3><div class="vw-pr">'+prompts.map(function(p){return '<span>'+esc(p)+'</span>'}).join('')+'</div>'+
'<h3>'+t('Use when','适合')+'</h3>'+both(E.use_when,cur.use_when)+(cur.avoid_when?'<h3>'+t('Avoid when','不适合')+'</h3>'+both(E.avoid_when,cur.avoid_when):'')+
'<h3>'+t('One-line call (inherit, then change the text)','一行调用（继承后改文字）')+'</h3><div class="code" id="c-use">'+copyBtn('c-use')+esc(cur.use)+'</div>'+
'<h3>'+t('Full YAML (paste under scenes: in deck.yaml)','完整 YAML（复制到 deck.yaml 的 scenes:）')+'</h3><div class="code" id="c-yaml">'+copyBtn('c-yaml')+esc(cur.yaml)+'</div>'+
'<h3>'+t('Source file','源文件')+'</h3><p class="mono" style="font-size:13px">'+esc(cur.file)+'</p>';
document.getElementById('vw-err').innerHTML=cur.ok?'':'<div class="vw-err">'+t('This entry failed to build: ','此条目构建失败：')+esc(cur.errors.join('；'))+'</div>';crumb();prog()}
function load(){var id=decodeURIComponent(location.hash.slice(1))||G.items[0].id;cur=G.items.find(function(i){return i.id===id})||G.items[0];idx={h:0,f:-1};
var home=location.protocol==='file:'?'index.html':'/';document.getElementById('vw-back').href=home+'#'+(cur.category==='page'?'pages':'effects');document.title=(cur.en?cur.en.title+' · ':'')+cur.title+' · html_ppt';
frame.src='e/'+cur.id+'/site/index.html';renderSide()}
document.getElementById('vw-lang').onclick=function(){lang=lang==='zh'?'en':'zh';document.documentElement.setAttribute('data-lang',lang);document.documentElement.lang=lang==='zh'?'zh-CN':'en';try{localStorage.setItem('htmlppt.lang',lang)}catch(e){}renderSide()};
side.onclick=function(e){var b=e.target.closest('button[data-copy]');if(!b)return;var el=document.getElementById(b.dataset.copy);var t0=el.textContent.slice(b.textContent.length);navigator.clipboard&&navigator.clipboard.writeText(t0).then(function(){b.textContent=t('Copied','已复制');setTimeout(function(){b.textContent=t('Copy','复制')},1200)})};
function step(d){var i=G.items.indexOf(cur);var n=G.items[(i+d+G.items.length)%G.items.length];location.hash=n.id}
document.getElementById('vw-prevE').onclick=function(){step(-1)};document.getElementById('vw-nextE').onclick=function(){step(1)};
document.getElementById('vw-next').onclick=function(){post('next')};document.getElementById('vw-prev').onclick=function(){post('prev')};
document.getElementById('vw-replay').onclick=function(){post('slide',[0,0,-1])};
window.addEventListener('message',function(e){var d;try{d=typeof e.data==='string'?JSON.parse(e.data):e.data}catch(x){return}if(!d||d.namespace!=='reveal'||!d.state)return;idx={h:d.state.indexh,f:d.state.indexf==null?-1:d.state.indexf};prog()});
document.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key===' '){post('next');e.preventDefault()}else if(e.key==='ArrowLeft'){post('prev');e.preventDefault()}});
window.addEventListener('hashchange',load);load()})();</script>`;

/* ---------------- CLI ---------------- */

export async function galleryCli(): Promise<number> {
  const { items } = await buildGallery({ thumbs: true });
  return items.every((i) => i.ok) ? 0 : 1;
}
