/**
 * check：build → 在 Edge（Playwright）里逐 State、逐次点击截图 → DOM QA → contact sheet → report.json
 * 产物：output/<deck>/qa/{report.json, shots/*.png, contact*.png, film/*.png}
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';
import { buildDeck } from '../build.ts';
import { serveStatic } from '../serve.ts';
import { printIssues } from '../report.ts';
import { rel, type DeckPaths } from '../paths.ts';
import type { Issue } from '../issues.ts';
import type { Manifest, ManifestSection } from '../runtime/reveal/render.ts';

export interface CheckOpts {
  scene?: string;
  film?: boolean;
  shots?: boolean;
}

export async function checkDeck(d: DeckPaths, opts: CheckOpts = {}): Promise<number> {
  const t0 = Date.now();
  const b = buildDeck(d);
  const issues: Issue[] = [...b.issues.list];
  const report: any = { deck: d.name, ok: false, site: rel(path.join(d.site, 'index.html')), issues, sections: [], contact: [], film: [] };
  const finish = (code: number) => {
    report.ok = code === 0;
    report.ms = Date.now() - t0;
    fs.mkdirSync(d.qa, { recursive: true });
    fs.writeFileSync(path.join(d.qa, 'report.json'), JSON.stringify(report, null, 2));
    summary(d, report, issues);
    return code;
  };
  if (!b.ok || !b.manifest) return finish(1);
  const manifest = b.manifest;
  const sections = manifest.sections.filter((s) => !opts.scene || s.scene === opts.scene);
  if (opts.scene && !sections.length) {
    issues.push({ level: 'error', code: 'NO_SCENE', message: `没有 scene "${opts.scene}"`, hint: `可用：${[...new Set(manifest.sections.map((s) => s.scene))].join(', ')}` });
    return finish(1);
  }

  const { server, port } = await serveStatic(d.out, 0);
  let browser: Browser | undefined;
  try {
    browser = await launch();
    const page = await browser.newPage({ viewport: { width: manifest.stage.w, height: manifest.stage.h }, deviceScaleFactor: 1 });
    const consoleErrors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
    page.on('pageerror', (e) => consoleErrors.push(String(e)));
    await openDeck(page, `http://127.0.0.1:${port}/site/index.html?qa`);

    const shotsDir = path.join(d.qa, 'shots');
    if (!opts.scene) fs.rmSync(shotsDir, { recursive: true, force: true });
    fs.mkdirSync(shotsDir, { recursive: true });
    const finals: { file: string; s: ManifestSection }[] = [];

    for (const s of sections) {
      const shots: string[] = [];
      if (opts.shots !== false) {
        for (let f = -1; f < s.clicks; f++) {
          await goTo(page, s.index, f);
          const file = path.join(shotsDir, `${pad(s.index + 1)}-${s.scene}-s${s.state}-k${f + 1}.png`);
          await page.screenshot({ path: file });
          shots.push(rel(file));
        }
        finals.push({ file: path.join(shotsDir, `${pad(s.index + 1)}-${s.scene}-s${s.state}-k${s.clicks}.png`), s });
      } else await goTo(page, s.index, s.clicks - 1);
      const dom = (await page.evaluate(domQa, s.index)) as DomIssue[];
      for (const di of dom) {
        const loc = di.key ? s.objects[di.key] : undefined;
        const [file, line] = loc ? [loc.slice(0, loc.lastIndexOf(':')), Number(loc.slice(loc.lastIndexOf(':') + 1))] : [s.file, s.line];
        issues.push({ level: di.level, code: di.code, message: di.message, hint: di.hint, file, line, scene: s.scene, state: s.state, object: di.key });
      }
      report.sections.push({ index: s.index, scene: s.scene, state: s.state, clicks: s.clicks, shots });
    }
    for (const e of consoleErrors) issues.push({ level: 'error', code: 'CONSOLE_ERROR', message: e.slice(0, 300), hint: '浏览器控制台报错：通常是资源路径或 html 对象中的脚本问题' });

    if (finals.length) report.contact = await contactSheets(page, port, d, finals, opts.scene);
    if (opts.film) report.film = await filmstrips(browser, port, d, manifest, sections);
  } catch (e: any) {
    issues.push({ level: 'error', code: 'TOOL', message: String(e?.message ?? e).split('\n')[0], hint: '工具故障（不是 deck 的问题）。确认已安装 Microsoft Edge，或运行 npx playwright install chromium' });
    await browser?.close();
    server.close();
    finish(2);
    return 2;
  }
  await browser?.close();
  server.close();
  return finish(issues.some((i) => i.level === 'error') ? 1 : 0);
}

/* ---------------- browser helpers ---------------- */

export async function launch(): Promise<Browser> {
  try {
    return await chromium.launch({ channel: 'msedge' });
  } catch {
    try {
      return await chromium.launch({ channel: 'chrome' });
    } catch {
      return await chromium.launch();
    }
  }
}

export async function openDeck(page: Page, url: string) {
  // tsx/esbuild 会给函数注入 __name(...)；序列化到浏览器里执行时需要一个空实现
  await page.addInitScript('window.__name = function (f) { return f; };');
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => (window as any).__htmlppt?.ready === true, null, { timeout: 15000 });
  await page.evaluate(() => (document as any).fonts.ready);
}

export async function goTo(page: Page, h: number, f: number) {
  await page.evaluate(
    ([h, f]) =>
      new Promise<void>((resolve) => {
        (window as any).Reveal.slide(h, 0, f);
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
    [h, f],
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

/* ---------------- DOM QA（在页面内执行） ---------------- */

interface DomIssue {
  level: 'error' | 'warning';
  code: string;
  message: string;
  hint?: string;
  key?: string;
}

function domQa(idx: number): DomIssue[] {
  const R = (window as any).Reveal;
  const sec: HTMLElement = R.getSlides()[idx];
  const out: DomIssue[] = [];
  const stage = sec.querySelector('.stage') as HTMLElement;
  const scale = R.getScale();
  const sr = stage.getBoundingClientRect();
  const W = stage.offsetWidth;
  const H = stage.offsetHeight;
  const box = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { x: (r.left - sr.left) / scale, y: (r.top - sr.top) / scale, w: r.width / scale, h: r.height / scale };
  };
  const hidden = (el: Element) => getComputedStyle(el).visibility === 'hidden';
  const texts: { key: string; b: ReturnType<typeof box> }[] = [];
  // 页面元素（Logo、页眉页脚、页码）占用的矩形：内容不应压在上面
  const chromeBoxes = [...sec.querySelectorAll('.chrome .ch-it')].map(box);

  sec.querySelectorAll<HTMLElement>('.obj:not(.ghost)').forEach((el) => {
    const key = el.dataset.key!;
    if (hidden(el)) return;
    const b = box(el);
    if (!el.hasAttribute('data-bleed') && (b.x < -2 || b.y < -2 || b.x + b.w > W + 2 || b.y + b.h > H + 2)) {
      out.push({ level: 'error', code: 'OUT_OF_STAGE', message: `"${key}" 超出舞台（x=${Math.round(b.x)}, y=${Math.round(b.y)}, w=${Math.round(b.w)}, h=${Math.round(b.h)}）`, hint: '调整 frame，或设 allowBleed: true（有意出血时）', key });
    }
    const tx = el.querySelector<HTMLElement>('.tx');
    if (tx) {
      // 文字块（行框之和）必须落在容器的内容区（扣除内边距）之内。
      // 超出时 safe center 会退化为顶部对齐，表现为"文字没有居中"；比 scrollHeight 更准（后者不计底部内边距）。
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const t = tx.getBoundingClientRect();
      const pad = (s: string) => parseFloat(cs.getPropertyValue(`padding-${s}`)) + parseFloat(cs.getPropertyValue(`border-${s}-width`));
      const overY = Math.max(pad('top') - (t.top - r.top) / scale, pad('bottom') - (r.bottom - t.bottom) / scale, 0);
      const overX = Math.max(pad('left') - (t.left - r.left) / scale, pad('right') - (r.right - t.right) / scale, tx.scrollWidth - tx.clientWidth, 0);
      if (overY > 3 || overX > 3) {
        out.push({ level: 'error', code: 'TEXT_OVERFLOW', message: `"${key}" 文字超出容器内容区 ${Math.round(Math.max(overY, overX))}px（文字块 ${Math.round(t.width / scale)}×${Math.round(t.height / scale)}，容器 ${el.clientWidth}×${el.clientHeight}，含内边距）`, hint: '删减文字 / 加大 frame / 调小 size 或 padding，或拆分到下一个 State', key });
      }
    }
    el.querySelectorAll('img').forEach((img) => {
      if (!img.complete || img.naturalWidth === 0) out.push({ level: 'error', code: 'IMAGE_BROKEN', message: `"${key}" 图片加载失败：${img.getAttribute('src')}`, hint: '检查路径；资源应放在 deck 的 assets/ 中', key });
    });
    if (chromeBoxes.length && b.w * b.h < W * H * 0.7) {
      const cb = tx ? box(tx) : b;
      const hit = chromeBoxes.some((c) => Math.min(cb.x + cb.w, c.x + c.w) - Math.max(cb.x, c.x) > 2 && Math.min(cb.y + cb.h, c.y + c.h) - Math.max(cb.y, c.y) > 2);
      if (hit && (tx || el.querySelector('img'))) out.push({ level: 'warning', code: 'CHROME_OVERLAP', message: `"${key}" 压在页面元素（Logo / 页眉页脚 / 页码）上`, hint: '内容留在上下边距之内（y 约 84–984），或用 chrome: false / chrome.hideOn 关掉本页的页面元素', key });
    }
    // 半透明对象（水印、focus 中被压暗的对象）不参与重叠检查
    if (tx && !hidden(tx) && parseFloat(getComputedStyle(el).opacity) >= 0.5) texts.push({ key, b: box(tx) });
  });

  sec.querySelectorAll<HTMLElement>('.slot').forEach((el) => {
    if (el.scrollHeight > el.clientHeight + 14) {
      const keys = [...el.querySelectorAll<HTMLElement>('.obj')].map((o) => o.dataset.key);
      out.push({ level: 'error', code: 'SLOT_OVERFLOW', message: `slot "${el.dataset.slot}" 内容高度 ${el.scrollHeight}px 超过 ${el.clientHeight}px（${keys.join(', ')}）`, hint: '减少该 slot 中的内容，或换成 split / grid 布局', key: keys[0] });
    }
  });

  for (let i = 0; i < texts.length; i++)
    for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i].b;
      const c = texts[j].b;
      const ix = Math.max(0, Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x));
      const iy = Math.max(0, Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y));
      const small = Math.min(a.w * a.h, c.w * c.h) || 1;
      if ((ix * iy) / small > 0.06) out.push({ level: 'warning', code: 'TEXT_OVERLAP', message: `"${texts[i].key}" 与 "${texts[j].key}" 的文字区域重叠`, hint: '调整 frame 或 slot，避免文字互相遮挡', key: texts[i].key });
    }
  return out;
}

/* ---------------- contact sheet ---------------- */

async function contactSheets(page: Page, port: number, d: DeckPaths, finals: { file: string; s: ManifestSection }[], scene?: string): Promise<string[]> {
  const perSheet = 24;
  const out: string[] = [];
  for (let k = 0; k * perSheet < finals.length; k++) {
    const chunk = finals.slice(k * perSheet, (k + 1) * perSheet);
    const cells = chunk
      .map(({ file, s }) => {
        const src = '/qa/shots/' + path.basename(file);
        const tag = s.library ? `<b class="lib">库</b>` : '';
        return `<figure><img src="${src}"><figcaption>${tag}#${s.index + 1} ${s.scene} · s${s.state}${s.clicks ? ` · ${s.clicks} 次点击` : ''}</figcaption></figure>`;
      })
      .join('');
    const html = `<!doctype html><meta charset="utf-8"><style>
      body{margin:0;padding:24px;background:#2a2d33;font:16px "Segoe UI","Microsoft YaHei",sans-serif;color:#ddd;width:1872px}
      main{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
      figure{margin:0} img{width:100%;display:block;border-radius:4px;background:#fff}
      figcaption{padding:6px 2px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      b.lib{background:#2F5BEA;color:#fff;border-radius:4px;padding:0 6px;margin-right:6px;font-weight:600}
      h1{font-size:20px;margin:0 0 16px;font-weight:600}</style>
      <h1>${d.name} · contact sheet ${k + 1}（每个 State 的最终画面）</h1><main>${cells}</main>`;
    const prefix = scene ? `contact-${scene}` : 'contact';
    const name = finals.length > perSheet ? `${prefix}-${k + 1}` : prefix;
    fs.writeFileSync(path.join(d.qa, `${name}.html`), html);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`http://127.0.0.1:${port}/qa/${name}.html`, { waitUntil: 'load' });
    const file = path.join(d.qa, `${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    out.push(rel(file));
  }
  return out;
}

/* ---------------- filmstrip：State 之间 morph 的中间帧 ---------------- */

async function filmstrips(browser: Browser, port: number, d: DeckPaths, m: Manifest, sections: ManifestSection[]): Promise<string[]> {
  const page = await browser.newPage({ viewport: { width: m.stage.w, height: m.stage.h }, deviceScaleFactor: 1 });
  await openDeck(page, `http://127.0.0.1:${port}/site/index.html?qa&motion`);
  const dir = path.join(d.qa, 'film');
  fs.mkdirSync(dir, { recursive: true });
  const out: string[] = [];
  const fractions = [0, 0.25, 0.5, 0.75, 1];
  for (const s of sections) {
    if (s.state === 0) continue;
    const prev = m.sections[s.index - 1];
    await goTo(page, prev.index, prev.clicks - 1);
    const frames: string[] = [];
    const dur: number = await page.evaluate((idx) => {
      const R = (window as any).Reveal;
      R.slide(idx, 0, -1);
      return parseFloat(R.getSlides()[idx].dataset.autoAnimateDuration || '1') * 1000;
    }, s.index);
    // 等 Auto-Animate 把过渡挂上，再暂停并逐帧定位
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    for (const fr of fractions) {
      await page.evaluate((t) => {
        document.getAnimations().forEach((a) => {
          a.pause();
          a.currentTime = t;
        });
      }, fr * dur + (fr === 1 ? 2000 : 0));
      const file = path.join(dir, `${s.scene}-s${prev.state}to${s.state}-${Math.round(fr * 100)}.png`);
      await page.screenshot({ path: file });
      frames.push('/qa/film/' + path.basename(file));
    }
    const strip = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#2a2d33;display:flex;gap:8px;padding:8px;width:${5 * 480 + 6 * 8}px;font:14px sans-serif;color:#ccc}figure{margin:0}img{width:480px;display:block}</style>${frames
      .map((f, i) => `<figure><img src="${f}"><figcaption>${Math.round(fractions[i] * 100)}%</figcaption></figure>`)
      .join('')}`;
    const html = path.join(dir, `${s.scene}-s${prev.state}to${s.state}.html`);
    fs.writeFileSync(html, strip);
    await page.goto(`http://127.0.0.1:${port}/qa/film/${path.basename(html)}`);
    const file = path.join(dir, `${s.scene}-s${prev.state}to${s.state}.png`);
    await page.screenshot({ path: file, fullPage: true });
    out.push(rel(file));
    await openDeck(page, `http://127.0.0.1:${port}/site/index.html?qa&motion`);
  }
  await page.close();
  return out;
}

/* ---------------- summary ---------------- */

function summary(d: DeckPaths, report: any, issues: Issue[]) {
  const errs = issues.filter((i) => i.level === 'error').length;
  const warns = issues.length - errs;
  const shots = report.sections.reduce((n: number, s: any) => n + s.shots.length, 0);
  console.log(`\n${errs ? '✖ FAIL' : '✔ PASS'}  deck=${d.name}  sections=${report.sections.length}  shots=${shots}  errors=${errs}  warnings=${warns}  (${((report.ms ?? 0) / 1000).toFixed(1)}s)`);
  printIssues(issues);
  console.log(`report: ${rel(path.join(d.qa, 'report.json'))}`);
  if (report.contact?.length) console.log(`contact: ${report.contact.join(', ')}`);
  if (report.film?.length) console.log(`film: ${report.film.length} 条 → ${rel(path.join(d.qa, 'film'))}/`);
  if (report.sections.length) console.log(`site: ${report.site}`);
}
