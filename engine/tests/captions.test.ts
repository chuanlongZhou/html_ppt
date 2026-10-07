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

function fixture(states?: any[]) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'html-ppt-captions-'));
  const file = path.join(dir, 'deck.yaml');
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="blue"/></svg>';
  fs.writeFileSync(path.join(dir, 'a.svg'), svg);
  fs.writeFileSync(path.join(dir, 'b.svg'), svg);
  const manifest = { version: 1, defaults: { show: false }, images: [
    { src: 'a.svg', caption: 'First figure', show: true },
    { src: 'b.svg', caption: 'Second figure', show: false },
  ] };
  const deck: any = { deck: { title: 'Captions regression', captionFile: 'captions.json' }, scenes: [{
    id: 'figures', purpose: 'Caption selection and animation', layout: 'free',
    objects: { img: { type: 'image', src: 'a.svg', frame: [120, 140, 800, 400] } },
    states: states ?? [{ show: ['img'] }],
  }] };
  fs.writeFileSync(path.join(dir, 'captions.json'), JSON.stringify(manifest));
  fs.writeFileSync(file, stringify(deck));
  const out = path.join(dir, 'generated');
  return { dir, file, deck, manifest, paths: { name: 'captions', dir, file, out, site: path.join(out, 'site'), qa: path.join(out, 'qa') } };
}
function cleanup(dir: string) {
  assert.equal(path.dirname(dir), path.resolve(os.tmpdir()));
  assert(path.basename(dir).startsWith('html-ppt-captions-'));
  fs.rmSync(dir, { recursive: true, force: true });
}

test('caption selection, source swaps, State override and disappearing images', () => {
  const d = fixture([
    { show: ['img'], steps: [{ enter: 'img', effect: 'fade' }] },
    { override: { img: { src: 'b.svg' } } },
    { override: { img: { caption: true } } },
    { override: { img: { src: 'a.svg', caption: 'Cropped detail', frame: [500, 100, 400, 200] } } },
    { override: { img: { caption: false } } },
    { override: { img: { caption: true } } },
    { show: [] },
  ]);
  try {
    const c = compileDeck(d.file);
    assert.deepEqual(c.issues.errors, []);
    assert(c.files.includes(path.join(d.dir, 'captions.json')));
    const states = c.ir!.scenes[0].states;
    const caption = (i: number) => states[i].items.find(x => x.key === 'img__caption');
    assert.equal(caption(0)!.props.text, 'First figure');
    assert.deepEqual(caption(0)!.fx, states[0].items.find(x => x.key === 'img')!.fx);
    assert(caption(1)!.ghost);
    assert.equal(caption(2)!.props.text, 'Second figure');
    assert.equal(caption(3)!.props.text, 'Cropped detail');
    assert.deepEqual(caption(3)!.place, { kind: 'abs', frame: { x: 500, y: 308, w: 400, h: 60 } });
    assert(caption(4)!.ghost);
    assert.equal(caption(5)!.props.text, 'First figure');
    assert(caption(6)!.ghost);
    d.manifest.images[0].show = false;
    fs.writeFileSync(path.join(d.dir, 'captions.json'), JSON.stringify(d.manifest));
    // JSON selection also controls cropped instances with custom wording.
    assert(!compileDeck(d.file).ir!.scenes[0].states[3].items.some(i => i.key === 'img__caption' && !i.ghost));
  } finally { cleanup(d.dir); }
});

test('old decks remain unchanged; inline captions work without a manifest', () => {
  const d = fixture();
  try {
    delete d.deck.deck.captionFile;
    fs.writeFileSync(d.file, stringify(d.deck));
    assert.equal(compileDeck(d.file).ir!.scenes[0].states[0].items.length, 1);
    d.deck.scenes[0].objects.img.caption = 'Local caption';
    fs.writeFileSync(d.file, stringify(d.deck));
    assert.equal(compileDeck(d.file).ir!.scenes[0].states[0].items[1].props.text, 'Local caption');
  } finally { cleanup(d.dir); }
});

test('invalid manifests, missing entries and ambiguous placement produce actionable errors', () => {
  const d = fixture();
  try {
    const manifestFile = path.join(d.dir, 'captions.json');
    fs.writeFileSync(manifestFile, '{');
    assert(compileDeck(d.file).issues.errors.some(i => i.code === 'CAPTION_FILE'));
    fs.writeFileSync(manifestFile, JSON.stringify({ ...d.manifest, images: [d.manifest.images[0], d.manifest.images[0]] }));
    assert(compileDeck(d.file).issues.errors.some(i => i.code === 'CAPTION_DUPLICATE'));
    fs.writeFileSync(manifestFile, JSON.stringify({ version: 1, images: [{ src: 'missing.svg', caption: 'Missing', show: 'yes' }] }));
    assert(compileDeck(d.file).issues.errors.some(i => i.code === 'CAPTION_SCHEMA'));
    fs.writeFileSync(manifestFile, JSON.stringify({ version: 1, images: [{ src: 'missing.svg', caption: 'Missing' }] }));
    assert(compileDeck(d.file).issues.errors.some(i => i.code === 'CAPTION_IMAGE_MISSING'));
    fs.writeFileSync(manifestFile, JSON.stringify({ version: 1, images: [] }));
    d.deck.scenes[0].objects.img.caption = true;
    fs.writeFileSync(d.file, stringify(d.deck));
    assert(compileDeck(d.file).issues.errors.some(i => i.code === 'CAPTION_MISSING'));
    d.deck.scenes[0].objects.img.caption = 'Visible';
    delete d.deck.scenes[0].objects.img.frame;
    d.deck.scenes[0].layout = 'center';
    d.deck.scenes[0].objects.other = { type: 'text', text: 'Other object' };
    d.deck.scenes[0].states = [{ show: ['img', 'other'] }];
    fs.writeFileSync(d.file, stringify(d.deck));
    assert(compileDeck(d.file).issues.errors.some(i => i.code === 'CAPTION_PLACEMENT'));
    // A lone centered flex image doesn't occupy the entire slot either.
    d.deck.scenes[0].states = [{ show: ['img'] }];
    fs.writeFileSync(d.file, stringify(d.deck));
    assert(compileDeck(d.file).issues.errors.some(i => i.code === 'CAPTION_PLACEMENT'));
    d.deck.scenes[0].layout = 'split';
    d.deck.scenes[0].objects.img.slot = 'left';
    fs.writeFileSync(d.file, stringify(d.deck));
    assert.deepEqual(compileDeck(d.file).issues.errors, []);
  } finally { cleanup(d.dir); }
});

test('captions appear and exit on the same clicks as their image in the browser', async () => {
  const d = fixture([{ show: ['img'], steps: [{ enter: 'img', effect: 'fade' }, { exit: 'img', effect: 'fade-out' }] }]);
  assert(buildDeck(d.paths).ok);
  const { server, port } = await serveStatic(d.paths.out, 0);
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await openDeck(page, `http://127.0.0.1:${port}/site/index.html?qa`);
    const visible = () => page.locator('.image-caption').evaluate(el => {
      let opacity = 1;
      for (let p: Element | null = el; p; p = p.parentElement) {
        const css = getComputedStyle(p);
        if (css.visibility === 'hidden' || css.display === 'none') return false;
        opacity *= Number(css.opacity);
      }
      return opacity > 0.5;
    });
    await goTo(page, 0, -1);
    assert.equal(await visible(), false);
    await goTo(page, 0, 0);
    assert.equal(await visible(), true);
    await goTo(page, 0, 1);
    assert.equal(await visible(), false);
  } finally { await browser.close(); server.close(); cleanup(d.dir); }
});
