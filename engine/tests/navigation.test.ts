import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { stringify } from 'yaml';
import { compileDeck } from '../src/normalize.ts';
import { buildDeck } from '../src/build.ts';
import { launch, openDeck, goTo } from '../src/qa/check.ts';
import { serveStatic } from '../src/serve.ts';

function fixture(scenes: any[]) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'html-ppt-navigation-'));
  const out = path.join(dir, 'generated');
  const file = path.join(dir, 'deck.yaml');
  fs.writeFileSync(file, stringify({ deck: { title: 'Navigation regression', chrome: { sections: true, pageNumber: true } }, scenes }));
  return { name: 'navigation', dir, file, out, site: path.join(out, 'site'), qa: path.join(out, 'qa') };
}
function removeFixture(dir: string) {
  assert.equal(path.dirname(dir), path.resolve(os.tmpdir()));
  assert(path.basename(dir).startsWith('html-ppt-navigation-'));
  fs.rmSync(dir, { recursive: true, force: true });
}
function scene(id: string, extra: any = {}) {
  return { id, purpose: 'Navigation regression', layout: 'center', objects: { title: { type: 'text', role: 'title', text: id } }, ...extra };
}

test('independent pages, inherited parts, template detection and explicit overrides', () => {
  const d = fixture([
    scene('opening', { section: 'Part A' }), scene('body-a'),
    scene('interlude', { section: false }), scene('body-b'),
    { id: 'custom-cover', use: 'page.cover', section: 'Part A', objects: {} },
    { id: 'custom-end', use: 'page.closing', section: 'Part B', objects: {} },
    scene('cover', { kind: 'content', section: 'Part B' }),
    scene('custom-thanks', { kind: 'closing' }), scene('thanks'),
  ]);
  try {
    const compiled = compileDeck(d.file);
    assert.equal(compiled.issues.errors.length, 0);
    assert.deepEqual(compiled.ir!.scenes.map(s => s.chrome.section), [undefined, 'Part A', undefined, 'Part A', undefined, undefined, 'Part B', undefined, undefined]);
  } finally { removeFixture(d.dir); }
});

test('automatic builds pause in overview and resume when returning', async () => {
  const d = fixture([scene('auto-page', {
    objects: { title: { type: 'text', role: 'title', text: 'Automatic build' }, detail: { type: 'text', text: 'Automatic detail' } },
    steps: [{ enter: 'detail', effect: 'fade-up', auto: true, delay: 1200, duration: 200 }],
  })]);
  assert(buildDeck(d).ok);
  const { server, port } = await serveStatic(d.out, 0);
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await openDeck(page, `http://127.0.0.1:${port}/site/index.html`);
    const before = await page.evaluate(() => (window as any).Reveal.getIndices());
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1400);
    assert.deepEqual(await page.evaluate(() => (window as any).Reveal.getIndices()), before);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => (window as any).Reveal.getIndices().f === 0, null, { timeout: 2500 });
  } finally { await browser.close(); server.close(); removeFixture(d.dir); }
});

test('Esc matrix scroll, selection, part navigation and unchanged fragment progress', async () => {
  const bodies = Array.from({ length: 30 }, (_, i) => scene('body-' + i, {
    ...(i === 15 ? { section: 'Part B' } : {}),
    objects: {
      title: { type: 'text', role: 'title', text: 'Page ' + i },
      detail: { type: 'text', text: 'Click to reveal this detail' },
    },
    steps: [{ enter: 'detail', effect: 'fade-up' }],
  }));
  const d = fixture([scene('opening', { section: 'Part A' }), ...bodies, { id: 'final-card', use: 'page.closing', objects: {} }]);
  const built = buildDeck(d);
  assert(built.ok);
  const { server, port } = await serveStatic(d.out, 0);
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await openDeck(page, `http://127.0.0.1:${port}/site/index.html?qa`);
    assert.equal(await page.locator('section[data-scene="opening"] .ch-nav').count(), 0);
    assert.equal(await page.locator('section[data-scene="final-card"] .ch-nav').count(), 0);
    await goTo(page, 1, -1);
    const before = await page.evaluate(() => (window as any).Reveal.getIndices());
    await page.keyboard.press('Escape');
    const layout = await page.evaluate(() => {
      const slides = document.querySelector('.slides')!;
      const boxes = Array.from(slides.querySelectorAll(':scope > section')).map(s => s.getBoundingClientRect());
      return { active: (window as any).Reveal.isOverview(), first: { x: boxes[0].x, y: boxes[0].y }, second: { x: boxes[1].x, y: boxes[1].y }, lastY: boxes.at(-1)!.y, scroll: slides.scrollHeight > slides.clientHeight };
    });
    assert(layout.active && layout.scroll);
    assert(layout.second.x > layout.first.x);
    assert.equal(layout.second.y, layout.first.y);
    assert(layout.lastY > layout.first.y);
    assert.equal(await page.locator('section[data-scene="body-0"] .fx').evaluate(el => getComputedStyle(el).visibility), 'visible');
    await page.keyboard.press('Escape');
    assert.deepEqual(await page.evaluate(() => (window as any).Reveal.getIndices()), before);
    assert.equal(await page.locator('section[data-scene="body-0"] .fx').evaluate(el => getComputedStyle(el).visibility), 'hidden');
    await page.locator('section.present .ch-tab').nth(1).click();
    assert.equal(await page.evaluate(() => (window as any).Reveal.getCurrentSlide().dataset.scene), 'body-15');
    await page.locator('section.present .ch-tab').nth(0).click();
    assert.equal(await page.evaluate(() => (window as any).Reveal.getCurrentSlide().dataset.scene), 'body-0');
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => (window as any).Reveal.isOverview()), true);
    await page.mouse.move(640, 480);
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(200);
    assert(await page.locator('.slides').evaluate(el => el.scrollTop > 0));
    await page.locator('section[data-scene="final-card"]').click();
    assert.equal(await page.evaluate(() => (window as any).Reveal.getCurrentSlide().dataset.scene), 'final-card');
    assert.equal(await page.evaluate(() => (window as any).Reveal.isOverview()), false);
    await page.keyboard.press('Escape');
    await page.setViewportSize({ width: 500, height: 720 });
    await page.waitForTimeout(100);
    assert(await page.locator('.slides').evaluate(el => el.scrollWidth <= el.clientWidth));
    await page.locator('.overview-close').click();
    assert.equal(await page.evaluate(() => (window as any).Reveal.isOverview()), false);
  } finally { await browser.close(); server.close(); removeFixture(d.dir); }
});
