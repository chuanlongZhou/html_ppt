/** dev：构建全部 deck，起本地服务，源文件变化时自动重建并刷新浏览器（保留当前页位置） */
import fs from 'node:fs';
import path from 'node:path';
import type http from 'node:http';
import { buildDeck, type BuildResult } from './build.ts';
import { serveStatic } from './serve.ts';
import { formatIssue } from './report.ts';
import { DECKS, PROJ, LIBRARY, OUTPUT, STYLES, RUNTIME, listDecks, resolveDeck } from './paths.ts';
import { THEMES } from './theme.ts';
import { escapeHtml } from './markup.ts';
import { buildGallery, deckThumbnails, type GalleryItem } from './gallery.ts';
import { homeHtml, homeData, HOME_DIR, type DeckCard } from './home.ts';
import { newDeck } from './scaffold.ts';

export async function dev(port = 5173) {
  const status = new Map<string, BuildResult>();
  const clients = new Set<http.ServerResponse>();
  const notify = (msg: string) => {
    for (const c of clients) c.write(`data: ${msg}\n\n`);
  };

  const rebuild = (name: string) => {
    try {
      const d = resolveDeck(name);
      const b = buildDeck(d);
      status.set(name, b);
      const errs = b.issues.errors.length;
      const warns = b.issues.warnings.length;
      console.log(`${new Date().toLocaleTimeString()}  ${errs ? '✖' : '✔'} ${name}  errors=${errs} warnings=${warns}`);
      for (const i of b.issues.errors.slice(0, 5)) console.log('  ' + formatIssue(i).replace(/\n/g, '\n  '));
      notify(name);
      thumbDeck(name);
    } catch (e: any) {
      console.log(`✖ ${name}: ${e.message}`);
    }
  };

  // 「我的演示」缩略图：串行、去抖，后台生成；完成后通知主页局部刷新
  const thumbQueue = new Set<string>();
  let thumbDecking = false;
  let thumbDeckTimer: NodeJS.Timeout | undefined;
  const thumbDeck = (name: string) => {
    thumbQueue.add(name);
    clearTimeout(thumbDeckTimer);
    thumbDeckTimer = setTimeout(async () => {
      if (thumbDecking) return thumbDeck(name);
      thumbDecking = true;
      const names = [...thumbQueue];
      thumbQueue.clear();
      try {
        await deckThumbnails(names.filter((n) => status.get(n)?.ok));
        notify('thumbs');
      } catch (e: any) {
        console.log(`✖ 演示缩略图：${e.message}`);
      }
      thumbDecking = false;
    }, 1500);
  };
  for (const n of listDecks()) rebuild(n);

  // 效果库浏览器：页面立即重建，缩略图在后台生成（完成后通知主页）
  let gallery: GalleryItem[] = [];
  let thumbing = false;
  let thumbAgain = false;
  const rebuildGallery = async () => {
    try {
      gallery = (await buildGallery({ quiet: true })).items;
      notify('_gallery');
      if (thumbing) return void (thumbAgain = true);
      thumbing = true;
      do {
        thumbAgain = false;
        gallery = (await buildGallery({ thumbs: true, quiet: true })).items;
      } while (thumbAgain);
      thumbing = false;
      console.log(`${new Date().toLocaleTimeString()}  ✔ 效果库缩略图（${gallery.length} 个条目）`);
      notify('thumbs');
    } catch (e: any) {
      thumbing = false;
      console.log(`✖ 效果库：${e.message}`);
    }
  };
  void rebuildGallery();

  const deckCards = (): DeckCard[] =>
    [...status].map(([name, b]) => ({
      name,
      title: b.manifest?.title ?? name,
      pages: b.manifest?.sections.length ?? 0,
      errors: b.issues.errors.length,
      warnings: b.issues.warnings.length,
      where: path.basename(path.dirname(resolveDeck(name).dir)),
    }));

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
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
        res.end(homeHtml({ items: gallery, decks: deckCards(), dev: true, base: '/_gallery/' }));
        return true;
      }
      if (req.url === '/__home.json') {
        const { items, decks } = homeData({ items: gallery, decks: deckCards(), dev: true, base: '/_gallery/' });
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
        res.end(JSON.stringify({ items, decks }));
        return true;
      }
      if (req.url === '/__new' && req.method === 'POST') {
        handleNew(req, res, rebuild);
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
  for (const root of [DECKS, PROJ])
    watch(root, (f) => {
      const name = f.split(/[\\/]/)[0];
      if (name && fs.existsSync(path.join(root, name, 'deck.yaml'))) later(name, () => rebuild(name));
    });
  for (const dir of [LIBRARY, STYLES, RUNTIME, THEMES, HOME_DIR])
    watch(dir, (f) => {
      if (f.endsWith('INDEX.md')) return;
      later('*', () => {
        listDecks().forEach(rebuild);
        void rebuildGallery();
      });
    });

  console.log(`\n预览：http://localhost:${p}/   （修改 decks/、engine/library/、engine/styles/、engine/themes/ 会自动重建并刷新）\n`);
}

/** 主页「新建演示」：POST /__new { name, theme? }。只接受本机页面发起的请求 */
function handleNew(req: http.IncomingMessage, res: http.ServerResponse, rebuild: (name: string) => void) {
  const reply = (code: number, body: object) => {
    res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
  };
  const origin = req.headers.origin;
  const host = String(req.headers.host ?? '');
  if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host) || (origin && new URL(origin).host !== host)) return reply(403, { ok: false, error: '只允许从本机主页创建' });
  let body = '';
  req.on('data', (c) => {
    body += c;
    if (body.length > 1e6) req.destroy();
  });
  req.on('end', () => {
    try {
      const { name, theme } = JSON.parse(body || '{}');
      newDeck(name, { themeText: typeof theme === 'string' ? theme : undefined, quiet: true });
      rebuild(name);
      reply(200, { ok: true, name });
    } catch (e: any) {
      reply(400, { ok: false, error: String(e?.message ?? e) });
    }
  });
}

function watch(dir: string, cb: (file: string) => void) {
  if (!fs.existsSync(dir)) return;
  fs.watch(dir, { recursive: true }, (_e, f) => f && cb(String(f)));
}

/** 放映页自动刷新；主页（/）自己局部刷新，不在这里注入 */
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
