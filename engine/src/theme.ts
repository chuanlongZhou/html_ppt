/**
 * 主题 = 颜色 token（浅色 + 深色）+ 页面元素（chrome）。
 *  - 预设：engine/themes/<id>.yaml，只写几个"种子色"，其余由 theme-derive.js 推导
 *  - 项目主题：deck 目录里的 theme.yaml（主页「主题与页面元素」下载的就是它），可写完整 tokens
 * deck.yaml 里 `theme: ocean` 或 `theme: theme.yaml` 引用；deck.tokens / deck.chrome 优先于主题。
 */
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { parse } from 'yaml';
import { ENGINE } from './paths.ts';
import { Chrome, type ChromeSrc } from './schema.ts';

export const THEMES = path.join(ENGINE, 'themes');
export const DERIVE_JS = path.join(ENGINE, 'src', 'theme-derive.js');

const Hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, '颜色写成 #RRGGBB');

export const ThemeFile = z.strictObject({
  label: z.string().optional(),
  desc: z.string().optional(),
  seeds: z
    .strictObject({
      accent: Hex.optional().describe('主色'),
      accent2: Hex.optional(),
      accent3: Hex.optional(),
      accent4: Hex.optional(),
      bg: Hex.optional().describe('浅色页面背景'),
      ink: Hex.optional().describe('文字色'),
      darkBg: Hex.optional().describe('深色页面背景（默认由 ink 与主色推导）'),
    })
    .optional()
    .describe('种子色：只写这几个，其余 token 自动推导'),
  tokens: z.record(z.string(), z.string()).optional().describe('浅色 token（覆盖推导结果）'),
  tokensDark: z.record(z.string(), z.string()).optional().describe('深色 token'),
  chrome: Chrome.optional(),
});
export type ThemeSrc = z.infer<typeof ThemeFile>;

export interface Theme {
  id: string;
  label: string;
  desc?: string;
  seeds?: Record<string, string>;
  /** 来源文件（报错与 dev 监听用） */
  file: string;
  light: Record<string, string>;
  dark: Record<string, string>;
  chrome?: ChromeSrc;
  /** 主题文件所在目录：chrome.logo.src 相对它解析 */
  dir: string;
}

type Derive = (seeds: Record<string, string>) => { light: Record<string, string>; dark: Record<string, string> };
let derive: Derive | undefined;
/** theme-derive.js 是浏览器与引擎共用的纯函数脚本：作为文本读入后求值 */
export function deriveTheme(seeds: Record<string, string>) {
  derive ??= new Function(fs.readFileSync(DERIVE_JS, 'utf8') + '\nreturn deriveTheme;')() as Derive;
  return derive(seeds);
}

export function themeFromSource(id: string, file: string, src: ThemeSrc): Theme {
  const d = src.seeds ? deriveTheme(src.seeds) : { light: {}, dark: {} };
  return {
    id,
    label: src.label ?? id,
    desc: src.desc,
    seeds: src.seeds,
    file,
    light: { ...d.light, ...src.tokens },
    dark: { ...d.dark, ...src.tokensDark },
    chrome: src.chrome,
    dir: path.dirname(file),
  };
}

/** 读取主题文件；格式错误时抛出带中文说明的 Error */
export function readThemeFile(file: string, id = path.basename(file, path.extname(file))): Theme {
  let data: unknown;
  try {
    data = parse(fs.readFileSync(file, 'utf8')) ?? {};
  } catch (e: any) {
    throw new Error(`主题文件无法解析：${e.message}`);
  }
  const r = ThemeFile.safeParse(data);
  if (!r.success) throw new Error(`主题文件格式错误（${file}）：` + r.error.issues.map((i) => `${i.path.join('.') || '(根)'}：${i.message}`).join('；'));
  return themeFromSource(id, file, r.data);
}

/** 校验主题文本（新建 deck 时写入 theme.yaml 之前）；格式错误抛 Error */
export function validateThemeText(text: string): void {
  let data: unknown;
  try {
    data = parse(text) ?? {};
  } catch (e: any) {
    throw new Error(`主题文件无法解析：${e.message}`);
  }
  const r = ThemeFile.safeParse(data);
  if (!r.success) throw new Error('主题文件格式错误：' + r.error.issues.map((i) => `${i.path.join('.') || '(根)'}：${i.message}`).join('；'));
}

/** `ocean`（预设）或 `theme.yaml`（相对 deck 目录） */
export function resolveTheme(ref: string, deckDir: string): Theme {
  const local = path.resolve(deckDir, ref);
  if (/\.ya?ml$/i.test(ref)) {
    if (!fs.existsSync(local)) throw new Error(`找不到主题文件：${ref}（应位于 ${local}）`);
    return readThemeFile(local);
  }
  const preset = path.join(THEMES, `${ref}.yaml`);
  if (!fs.existsSync(preset)) throw new Error(`没有名为 "${ref}" 的主题预设（可用：${listPresets().map((p) => p.id).join('、')}），或写 theme: theme.yaml`);
  return readThemeFile(preset, ref);
}

/** engine/themes/*.yaml，default 在前 */
export function listPresets(): Theme[] {
  if (!fs.existsSync(THEMES)) return [];
  return fs
    .readdirSync(THEMES)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => readThemeFile(path.join(THEMES, f), f.replace(/\.yaml$/, '')))
    .sort((a, b) => (a.id === 'default' ? -1 : b.id === 'default' ? 1 : a.id.localeCompare(b.id)));
}
