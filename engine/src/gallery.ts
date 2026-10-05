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
import { LIB_CATEGORIES } from './schema.ts';
import { ENGINE, OUTPUT, rel, type DeckPaths } from './paths.ts';
import { homeHtml } from './home.ts';
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
    file: rel(e.file),
    use: `- { id: my-${name}, use: ${e.id} }`,
    yaml: stringify([{ id: `my-${name}`, ...e.demo }], { lineWidth: 0 }).trim(),
    states: clicks.length,
    clicks,
    ok,
    errors,
  };
}

async function thumbnails(items: GalleryItem[], dir: string) {
  const { launch, openDeck, goTo } = await import('./qa/check.ts');
  const { serveStatic } = await import('./serve.ts');
  const { server, port } = await serveStatic(GALLERY, 0);
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 1 });
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
  const data = JSON.stringify({ items, categories: LIB_CATEGORIES }).replace(/</g, '\\u003c');
  fs.writeFileSync(path.join(GALLERY, 'index.html'), homeHtml({ items, decks: [], dev: false, base: '' }));
  fs.writeFileSync(path.join(GALLERY, 'view.html'), page('效果库 · 预览', VIEW_CSS, `<script>window.GALLERY=${data};</script>${VIEW_BODY}`));
}

function page(title: string, css: string, body: string) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><link rel="icon" href="data:,"><style>${BASE_CSS}${css}</style></head><body>${body}</body></html>`;
}

const BASE_CSS = `
:root{--bg:#F6F5F1;--card:#fff;--ink:#16181D;--muted:#5E6571;--line:#E2DFD8;--accent:#2F5BEA;--soft:#DEE6FF}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 "Segoe UI","Microsoft YaHei UI","Microsoft YaHei","PingFang SC",sans-serif}
a{color:inherit;text-decoration:none}code,.mono{font-family:"Cascadia Code",Consolas,monospace}
button{font:inherit;cursor:pointer}
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
.vw-side h1{font-size:24px;margin:0}.vw-side .id{color:var(--muted);font-size:13px}
.vw-side h3{font-size:13px;color:var(--muted);margin:18px 0 6px;letter-spacing:.04em}
.vw-pr{display:flex;flex-wrap:wrap;gap:6px}.vw-pr span{background:var(--soft);color:var(--accent);padding:3px 10px;border-radius:8px;font-size:13px}
.vw-side p{margin:0}
.code{position:relative;background:#16181D;color:#E9E7E0;border-radius:10px;padding:12px 14px;font:12.5px/1.55 "Cascadia Code",Consolas,monospace;white-space:pre;overflow:auto;max-height:340px}
.code button{position:absolute;right:8px;top:8px;border:0;border-radius:6px;padding:3px 10px;background:#2F5BEA;color:#fff;font-size:12px}
.vw-err{background:#FDECEC;color:#B42318;border-radius:10px;padding:10px 12px;font-size:13px;margin-top:12px}
@media (max-width:1100px){.vw{grid-template-columns:1fr}.vw-side{position:static;max-height:none}}
`;

const VIEW_BODY = `<div class="vw"><div class="vw-top"><a class="back" id="vw-back" href="index.html">← 返回主页</a><span class="crumb" id="vw-crumb"></span><span class="sp"></span><button id="vw-prevE">上一个条目</button><button id="vw-nextE">下一个条目</button></div>
<div><div class="vw-stage"><iframe id="vw-frame" title="预览"></iframe></div>
<div class="vw-ctl"><button id="vw-replay">⟲ 重播</button><button id="vw-prev">◀ 上一步</button><button id="vw-next" class="pri">下一步 ▶</button><span class="prog" id="vw-prog"></span><span class="hint">方向键 ← → 也可以；图表类条目可直接在预览中点击、悬停</span></div><div id="vw-err"></div></div>
<aside class="vw-side" id="vw-side"></aside></div>
<script>(function(){var G=window.GALLERY;var frame=document.getElementById('vw-frame'),side=document.getElementById('vw-side');var cur=null,idx={h:0,f:-1};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function post(method,args){frame.contentWindow&&frame.contentWindow.postMessage(JSON.stringify({method:method,args:args||[]}),'*')}
function prog(){if(!cur)return;var c=cur.clicks[idx.h]||0;document.getElementById('vw-prog').textContent=(cur.states>1?'State '+(idx.h+1)+' / '+cur.states:'单个 State')+(c?' · 点击 '+(idx.f+1)+' / '+c:'')}
function copyBtn(id){return '<button data-copy="'+id+'">复制</button>'}
function load(){var id=decodeURIComponent(location.hash.slice(1))||G.items[0].id;cur=G.items.find(function(i){return i.id===id})||G.items[0];idx={h:0,f:-1};
var home=location.protocol==='file:'?'index.html':'/';document.getElementById('vw-back').href=home+'#'+(cur.category==='page'?'pages':'effects');var C=G.categories[cur.category];document.getElementById('vw-crumb').textContent=C.label+' › '+C.groups[cur.group];document.title=cur.title+' · 效果库';
frame.src='e/'+cur.id+'/site/index.html';
side.innerHTML='<h1>'+esc(cur.title)+'</h1><div class="id mono">'+esc(cur.id)+'</div>'+
'<h3>提示词（这样说就能调用）</h3><div class="vw-pr">'+cur.prompts.map(function(p){return '<span>'+esc(p)+'</span>'}).join('')+'</div>'+
'<h3>适合</h3><p>'+esc(cur.use_when)+'</p>'+(cur.avoid_when?'<h3>不适合</h3><p>'+esc(cur.avoid_when)+'</p>':'')+
'<h3>一行调用（继承后改文字）</h3><div class="code" id="c-use">'+copyBtn('c-use')+esc(cur.use)+'</div>'+
'<h3>完整 YAML（复制到 deck.yaml 的 scenes:）</h3><div class="code" id="c-yaml">'+copyBtn('c-yaml')+esc(cur.yaml)+'</div>'+
'<h3>源文件</h3><p class="mono" style="font-size:13px">'+esc(cur.file)+'</p>';
document.getElementById('vw-err').innerHTML=cur.ok?'':'<div class="vw-err">此条目构建失败：'+esc(cur.errors.join('；'))+'</div>';prog()}
side.onclick=function(e){var b=e.target.closest('button[data-copy]');if(!b)return;var el=document.getElementById(b.dataset.copy);var t=el.textContent.replace(/^复制|^已复制/,'');navigator.clipboard&&navigator.clipboard.writeText(t).then(function(){b.textContent='已复制';setTimeout(function(){b.textContent='复制'},1200)})};
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
