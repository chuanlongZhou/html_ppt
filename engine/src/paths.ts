/** 仓库内各目录的绝对路径、相对路径显示，以及 CLI 用法错误类型 */
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.resolve(here, '..', '..');
export const ENGINE = path.join(ROOT, 'engine');
export const DECKS = path.join(ROOT, 'decks');
export const PROJ = path.join(ROOT, 'proj');
export const OUTPUT = path.join(ROOT, 'output');
export const LIBRARY = path.join(ENGINE, 'library');
export const STYLES = path.join(ENGINE, 'styles');
export const RUNTIME = path.join(ENGINE, 'src', 'runtime', 'reveal');
export const REVEAL_DIST = path.join(ROOT, 'node_modules', 'reveal.js', 'dist');

export interface DeckPaths {
  name: string;
  dir: string;
  file: string;
  out: string;
  site: string;
  qa: string;
}

/** 解析 deck 名或路径：`intro`、`decks/intro`、`decks/intro/deck.yaml` 都可以；也可寻址 `proj/<name>`（正式复刻项目）。 */
export function resolveDeck(arg: string | undefined): DeckPaths {
  if (!arg) throw new UsageError('缺少 deck 名。用法：npm run <cmd> -- <deck>（可用：' + listDecks().join(', ') + '）');
  let dir = arg.endsWith('.yaml') ? path.dirname(path.resolve(ROOT, arg)) : path.resolve(DECKS, path.basename(arg));
  if (!fs.existsSync(path.join(dir, 'deck.yaml')) && !arg.endsWith('.yaml')) {
    const p = path.resolve(PROJ, path.basename(arg));
    if (fs.existsSync(path.join(p, 'deck.yaml'))) dir = p;
  }
  if (!fs.existsSync(path.join(dir, 'deck.yaml'))) {
    const alt = path.resolve(ROOT, arg);
    if (fs.existsSync(path.join(alt, 'deck.yaml'))) dir = alt;
    else throw new UsageError(`找不到 deck：${arg}（可用：${listDecks().join(', ') || '无'}）`);
  }
  const name = path.basename(dir);
  const out = path.join(OUTPUT, name);
  return { name, dir, file: path.join(dir, 'deck.yaml'), out, site: path.join(out, 'site'), qa: path.join(out, 'qa') };
}

/** decks/ 与 proj/ 下含 deck.yaml 的目录名（同名时 decks/ 优先） */
export function listDecks(): string[] {
  const names = new Set<string>();
  for (const root of [DECKS, PROJ]) {
    if (!fs.existsSync(root)) continue;
    for (const d of fs.readdirSync(root, { withFileTypes: true }))
      if (d.isDirectory() && fs.existsSync(path.join(root, d.name, 'deck.yaml'))) names.add(d.name);
  }
  return [...names].sort();
}

export function rel(p: string): string {
  return path.relative(ROOT, p).split(path.sep).join('/');
}

export class UsageError extends Error {}
