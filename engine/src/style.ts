/** 风格 = tokens（颜色/字体/字号）+ rules（QA 读取的设计约束）+ style.css */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { STYLES } from './paths.ts';

export interface StyleRules {
  maxCharsPerState: number;
  maxClicksPerState: number;
  maxObjectsPerState: number;
  minFontSize: number;
}

export interface Style {
  name: string;
  label: string;
  colors: { light: Record<string, string>; dark: Record<string, string> };
  fonts: Record<string, string>;
  sizes: Record<string, number>;
  radius: number;
  shadow: string;
  rules: StyleRules;
  css: string;
}

/** overrides：主题与 deck.tokens 合并后的 token 覆盖（light 覆盖浅色；dark 只覆盖深色） */
export function loadStyle(name: string, overrides?: { light?: Record<string, string>; dark?: Record<string, string> }): Style {
  const dir = path.join(STYLES, name);
  const file = path.join(dir, 'style.yaml');
  if (!fs.existsSync(file)) throw new Error(`风格不存在：${name}（engine/styles/${name}/style.yaml）`);
  const y = parse(fs.readFileSync(file, 'utf8'));
  const css = fs.existsSync(path.join(dir, 'style.css')) ? fs.readFileSync(path.join(dir, 'style.css'), 'utf8') : '';
  const light = { ...y.colors.light, ...overrides?.light };
  // 深色：先继承浅色（未单独定义的 token 如 success），再用风格的深色值，最后才是显式覆盖
  const dark = { ...light, ...y.colors.dark, ...overrides?.dark };
  return { name, label: y.label, colors: { light, dark }, fonts: y.fonts, sizes: y.sizes, radius: y.radius, shadow: y.shadow, rules: y.rules, css };
}

export function isToken(style: Style, c: string) {
  return Object.prototype.hasOwnProperty.call(style.colors.light, c);
}

/** 渲染期：token → CSS 变量 */
export function colorVar(style: Style, c: string | undefined): string | undefined {
  if (c === undefined) return undefined;
  return isToken(style, c) ? `var(--c-${c})` : c;
}

/** 编译期：token → 具体颜色（Reveal 的 data-background-color 需要真实值） */
export function colorValue(style: Style, c: string, theme: 'light' | 'dark'): string {
  return isToken(style, c) ? style.colors[theme][c] : c;
}

export function tokensCss(style: Style): string {
  const vars = (o: Record<string, string>) =>
    Object.entries(o)
      .map(([k, v]) => `--c-${k}:${v};`)
      .join('');
  const fonts = Object.entries(style.fonts)
    .map(([k, v]) => `--font-${k}:${v};`)
    .join('');
  const sizes = Object.entries(style.sizes)
    .map(([k, v]) => `--fs-${k}:${v}px;`)
    .join('');
  return (
    `.reveal{${vars(style.colors.light)}${fonts}${sizes}--radius:${style.radius}px;--shadow:${style.shadow};}\n` +
    `.reveal .sc.theme-dark{${vars(style.colors.dark)}}\n`
  );
}
