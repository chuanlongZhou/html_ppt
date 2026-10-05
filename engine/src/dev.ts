/** dev：构建全部 deck，起本地服务，源文件变化时自动重建并刷新浏览器（保留当前页位置） */
import fs from 'node:fs';
import path from 'node:path';
import type http from 'node:http';
import { buildDeck, type BuildResult } from './build.ts';
import { serveStatic } from './serve.ts';
import { formatIssue } from './report.ts';
import { DECKS, LIBRARY, OUTPUT, STYLES, RUNTIME, listDecks, resolveDeck } from './paths.ts';
import { escapeHtml } from './markup.ts';
import { buildGallery, galleryGridHtml, type GalleryItem } from './gallery.ts';

export async function dev(port = 5173) {
  const status = new Map<string, BuildResult>();
  const clients = new Set<http.ServerResponse>();

  const rebuild = (name: string) => {
    try {
      const d = resolveDeck(name);
      const b = buildDeck(d);
      status.set(name, b);
      const errs = b.issues.errors.length;
      const warns = b.issues.warnings.length;
      console.log(`${new Date().toLocaleTimeString()}  ${errs ? '✖' : '✔'} ${name}  errors=${errs} warnings=${warns}`);
      for (const i of b.issues.errors.slice(0, 5)) console.log('  ' + formatIssue(i).replace(/\n/g, '\n  '));
      for (const c of clients) c.write(`data: ${name}\n\n`);
    } catch (e: any) {
      console.log(`✖ ${name}: ${e.message}`);
    }
  };
  for (const n of listDecks()) rebuild(n);

  // 效果库浏览器：页面立即重建，缩略图在后台生成（完成后刷新首页）
  let gallery: GalleryItem[] = [];
  let thumbing = false;
  let thumbAgain = false;
  const rebuildGallery = async () => {
    try {
      gallery = (await buildGallery({ quiet: true })).items;
      for (const c of clients) c.write(`data: _gallery\n\n`);
      if (thumbing) return void (thumbAgain = true);
      thumbing = true;
      do {
        thumbAgain = false;
        gallery = (await buildGallery({ thumbs: true, quiet: true })).items;
      } while (thumbAgain);
      thumbing = false;
      console.log(`${new Date().toLocaleTimeString()}  ✔ 效果库缩略图（${gallery.length} 个条目）`);
      // 只通知首页刷新（正在查看的效果库页面不打断）
      for (const c of clients) c.write(`data: thumbs\n\n`);
    } catch (e: any) {
      thumbing = false;
      console.log(`✖ 效果库：${e.message}`);
    }
  };
  void rebuildGallery();

  const { port: p } = await serveStatic(
    OUTPUT,
    port,
    (req, res) => {
      if (req.url === '/__events') {
        res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' });
        res.write(': hi\n\n');
        clients.add(res);
        req.on('close', () => clients.delete(res));
        return true;
      }
      if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(indexPage(status, gallery));
        return true;
      }
      return false;
    },
    (html) => html.replace('</body>', `${banner(html, status)}${RELOAD}</body>`),
  );

  const timers = new Map<string, NodeJS.Timeout>();
  const later = (key: string, fn: () => void) => {
    clearTimeout(timers.get(key));
    timers.set(key, setTimeout(fn, 120));
  };
  watch(DECKS, (f) => {
    const name = f.split(/[\\/]/)[0];
    if (name && fs.existsSync(path.join(DECKS, name, 'deck.yaml'))) later(name, () => rebuild(name));
  });
  for (const dir of [LIBRARY, STYLES, RUNTIME])
    watch(dir, (f) => {
      if (f.endsWith('INDEX.md')) return;
      later('*', () => {
        listDecks().forEach(rebuild);
        void rebuildGallery();
      });
    });

  console.log(`\n预览：http://localhost:${p}/   （修改 decks/、engine/library/、engine/styles/ 会自动重建并刷新）\n`);
}

function watch(dir: string, cb: (file: string) => void) {
  if (!fs.existsSync(dir)) return;
  fs.watch(dir, { recursive: true }, (_e, f) => f && cb(String(f)));
}

const RELOAD = `<script>(function(){var lost=false,es=new EventSource('/__events');es.onmessage=function(e){if(location.pathname.indexOf('/'+e.data+'/')===0)location.reload()};es.onerror=function(){lost=true};es.onopen=function(){if(lost)location.reload()}})();</script>`;

function banner(html: string, status: Map<string, BuildResult>): string {
  const m = html.match(/<title>([^<]*)<\/title>/);
  for (const [name, b] of status) {
    if (b.ok || !m) continue;
    if (b.manifest?.title && b.manifest.title !== m[1]) continue;
    const items = b.issues.errors.slice(0, 8).map((i) => `<li>${escapeHtml(formatIssue(i))}</li>`).join('');
    return `<div style="position:fixed;z-index:9999;left:12px;right:12px;bottom:12px;max-height:45vh;overflow:auto;background:#2b0f12;color:#ffd7d7;font:13px/1.5 Consolas,monospace;padding:12px 16px;border-radius:8px;white-space:pre-wrap"><b>${escapeHtml(name)}：最新一次构建失败（显示的是上一次成功的版本）</b><ul style="margin:6px 0 0;padding-left:18px">${items}</ul></div>`;
  }
  return '';
}

function indexPage(status: Map<string, BuildResult>, gallery: GalleryItem[]): string {
  const rows = [...status]
    .map(([name, b]) => {
      const e = b.issues.errors.length;
      const w = b.issues.warnings.length;
      const n = b.manifest?.sections.length ?? 0;
      return `<li><a href="/${name}/site/index.html">${escapeHtml(b.manifest?.title ?? name)}</a> <code>${name}</code> <span>${n} 页</span> <span class="${e ? 'bad' : 'ok'}">${e ? `${e} error` : 'ok'}${w ? ` · ${w} warning` : ''}</span></li>`;
    })
    .join('');
  const lib = gallery.length ? galleryGridHtml(gallery) : '<p class="wait">效果库构建中…</p>';
  return `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>html_ppt dev</title><link rel="icon" href="data:,"><style>
    body{margin:0;background:#F6F5F1;color:#16181d;font:15px/1.5 "Segoe UI","Microsoft YaHei UI","Microsoft YaHei",sans-serif}
    .decks{max-width:1440px;margin:0 auto;padding:28px 32px 0}.decks h1{font-size:26px;margin:0 0 6px}
    .decks ul{margin:0;padding:0;display:flex;flex-wrap:wrap;gap:12px}.decks li{list-style:none;background:#fff;border:1px solid #E2DFD8;border-radius:12px;padding:12px 16px}
    .decks a{color:#2F5BEA;font-weight:700;text-decoration:none;font-size:17px}.decks code{color:#666;margin:0 6px}.decks span{color:#666;margin-left:6px}.bad{color:#d83a3a!important}.ok{color:#0f9f78!important}
    .wait{max-width:1440px;margin:24px auto;padding:0 32px;color:#666}hr{border:0;border-top:1px solid #E2DFD8;max-width:1376px;margin:28px auto 0}
    </style><div class="decks"><h1>html_ppt · 演示</h1><ul>${rows}</ul></div><hr>${lib}
    <script>new EventSource('/__events').onmessage=function(){location.reload()}</script></html>`;
}
