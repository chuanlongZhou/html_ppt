/** build：compile（normalize）→ render → 写出可离线放映的 output/<deck>/site/ */
import fs from 'node:fs';
import path from 'node:path';
import { compileDeck } from './normalize.ts';
import { renderDeck, type Manifest } from './runtime/reveal/render.ts';
import { tokensCss } from './style.ts';
import { REVEAL_DIST, RUNTIME, STYLES, type DeckPaths } from './paths.ts';
import type { Issues } from './issues.ts';
import type { IRDeck } from './ir.ts';

export interface BuildResult {
  ok: boolean;
  issues: Issues;
  manifest?: Manifest;
  files: string[];
  ir?: IRDeck;
}

/** opts.libBase：使用共享的 Reveal 资源目录（效果库浏览器的迷你 deck 用），此时不再逐个拷贝 */
export function buildDeck(d: DeckPaths, opts: { ir?: boolean; libBase?: string } = {}): BuildResult {
  const t0 = Date.now();
  const { ir, issues, files } = compileDeck(d.file);
  if (!ir) return { ok: false, issues, files };
  const { html, manifest } = renderDeck(ir, opts.libBase);

  fs.mkdirSync(d.site, { recursive: true });
  // Windows 上并发构建（dev 与 check 同时运行）时目录可能短暂被占用，带重试
  for (const sub of ['assets', '_lib']) fs.rmSync(path.join(d.site, sub), { recursive: true, force: true, maxRetries: 8, retryDelay: 60 });
  write(path.join(d.site, 'index.html'), html);
  write(path.join(d.site, 'deck.css'), [read(path.join(RUNTIME, 'runtime.css')), read(path.join(RUNTIME, 'fx.css')), tokensCss(ir.style), ir.style.css].join('\n'));
  write(path.join(d.site, 'runtime.js'), read(path.join(RUNTIME, 'runtime.js')));
  write(path.join(d.site, 'charts.js'), read(path.join(RUNTIME, 'charts.js')));
  write(path.join(d.site, 'manifest.json'), JSON.stringify(manifest, null, 2));
  if (!opts.libBase) copyReveal(path.join(d.site, 'lib', 'reveal'));
  for (const [pub, src] of ir.assets) {
    fs.mkdirSync(path.dirname(path.join(d.site, pub)), { recursive: true });
    fs.copyFileSync(src, path.join(d.site, pub));
  }
  if (opts.ir) write(path.join(d.out, 'ir.json'), JSON.stringify(ir, irReplacer, 2));
  files.push(path.join(STYLES, ir.style.name, 'style.yaml'), path.join(STYLES, ir.style.name, 'style.css'));
  (manifest as any).buildMs = Date.now() - t0;
  return { ok: true, issues, manifest, files, ir };
}

export function copyReveal(dest: string) {
  const marker = path.join(dest, '.version');
  const version = JSON.parse(read(path.join(REVEAL_DIST, '..', 'package.json'))).version;
  if (fs.existsSync(marker) && read(marker) === version) return;
  fs.mkdirSync(path.join(dest, 'plugin'), { recursive: true });
  for (const f of ['reset.css', 'reveal.css', 'reveal.js']) fs.copyFileSync(path.join(REVEAL_DIST, f), path.join(dest, f));
  fs.copyFileSync(path.join(REVEAL_DIST, 'plugin', 'notes.js'), path.join(dest, 'plugin', 'notes.js'));
  write(marker, version);
}

function irReplacer(key: string, value: any) {
  if (value instanceof Map) return Object.fromEntries(value);
  if (key === 'style') return value?.name;
  return value;
}

const read = (f: string) => fs.readFileSync(f, 'utf8');
const write = (f: string, s: string) => {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, s);
};
