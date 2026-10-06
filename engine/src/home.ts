/**
 * 主页：用户使用本项目的入口。dev 的 `/` 与 `npm run gallery` 生成的 output/_gallery/index.html 共用这一份。
 * 结构：顶部导航 → 概览（三步上手）→ 我的演示 → 主题与页面元素（工作台）→ 页面结构 → 动画与交互。
 * 页面逻辑在 engine/src/home/{home.css,home.js,studio.js}（真实文件，便于编辑）；这里只负责拼装与内嵌数据。
 */
import fs from 'node:fs';
import path from 'node:path';
import { ENGINE } from './paths.ts';
import { DERIVE_JS, listPresets } from './theme.ts';
import { LIB_CATEGORIES } from './schema.ts';
import type { GalleryItem } from './gallery.ts';

export const HOME_DIR = path.join(ENGINE, 'src', 'home');

export interface DeckCard {
  name: string;
  title: string;
  pages: number;
  errors: number;
  warnings: number;
  /** decks 或 proj：卡片上显示来源目录 */
  where: string;
}

export interface HomeData {
  items: GalleryItem[];
  decks: DeckCard[];
  /** dev 服务器：支持新建演示与局部刷新 */
  dev: boolean;
  /** 效果库浏览器的相对根（dev：/_gallery/；静态页：空） */
  base: string;
}

export interface PresetData {
  id: string;
  label: string;
  desc?: string;
  seeds: Record<string, string>;
}

const read = (f: string) => fs.readFileSync(path.join(HOME_DIR, f), 'utf8');

export function presetData(): PresetData[] {
  return listPresets()
    .filter((p) => p.seeds)
    .map((p) => ({ id: p.id, label: p.label, desc: p.desc, seeds: p.seeds as Record<string, string> }));
}

/** 嵌进 <script> 的 JSON：转义 < 避免出现 </script> */
export const scriptJson = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c');

export function homeData(d: HomeData) {
  return { items: d.items, decks: d.decks, categories: LIB_CATEGORIES, presets: presetData(), dev: d.dev, base: d.base, deckBase: d.dev ? '/{name}/site/index.html' : '#' };
}

export function homeHtml(d: HomeData): string {
  const nPages = d.items.filter((i) => i.category === 'page').length;
  const nFx = d.items.length - nPages;
  const newCard = d.dev
    ? `<form class="card new" id="new-form"><h4>＋ 新建演示</h4><p>在 decks/ 下创建骨架（deck.yaml + brief.md）。</p><input id="new-name" placeholder="名称，如 my-talk" pattern="[a-z0-9][a-z0-9\\-]*" required><label class="toggle" style="padding:2px 0;font-weight:500;font-size:13px"><input type="checkbox" id="new-theme">套用下方「主题与页面元素」的当前配置</label><button class="btn dark" type="submit">创建</button></form>`
    : `<div class="card new"><h4>新建演示</h4><p>在项目目录运行：</p><button class="btn mono" data-cmd="npm run new -- my-talk" style="text-align:left">npm run new -- my-talk</button><p>带主题：<code>--theme theme.yaml</code></p></div>`;
  const decksSec = !d.dev ? '' : `<section id="decks" class="sec"><div class="wrap">
    <div class="sec-h"><h2>我的演示</h2><p>decks/ 与 proj/ 下的 deck；点击放映，改 deck.yaml 会自动刷新。</p><span class="n" id="deck-n"></span></div>
    <div class="grid"><span id="deck-cards" style="display:contents"></span>${newCard}</div></div></section>`;
  const studio = `<section id="theme" class="sec"><div class="wrap">
    <div class="sec-h"><h2>主题与页面元素</h2><p>选配色、设置每页都有的页码 / Logo / 页脚，右侧实时预览；满意后下载配置，用于新项目。</p></div>
    <div class="studio">
      <div class="panel"><div class="ptabs" id="studio-tabs"><button data-t="color" class="on">配色</button><button data-t="chrome">页面元素</button></div><div class="pane" id="studio-pane"></div></div>
      <div class="stage">
        <div class="preview"><iframe id="studio-frame" title="主题预览" loading="lazy"></iframe></div>
        <div class="pager" id="studio-pager"></div>
        <div class="actions"><button class="btn pri" id="dl-theme">下载 theme.yaml</button><button class="btn" id="cp-theme">复制内容</button><button class="btn" id="cp-snip">复制 deck 片段</button><span class="sp"></span><button class="btn" id="reset-theme">重置</button></div>
        <div class="use" id="studio-use"></div>
      </div>
    </div></div></section>`;
  const pages = `<section id="pages" class="sec"><div class="wrap">
    <div class="sec-h"><h2>页面结构</h2><p>封面、目录、章节、要点、对比、数据、时间线、总结……点卡片预览，「复制调用」一行即用。</p><span class="n" id="pages-n"></span></div>
    <div id="pages-list"></div></div></section>`;
  const effects = `<section id="effects" class="sec"><div class="wrap">
    <div class="sec-h"><h2>动画与交互</h2><p>页内逐步出现、状态切换（morph）、可交互图表、图片标注。</p><span class="n" id="fx-n"></span></div>
    <div class="tabs" id="fx-tabs"></div><div id="fx-list"></div></div></section>`;
  const hero = `<section class="hero"><div class="wrap">
    <h1>把演示当作源代码</h1>
    <p>用 <code>deck.yaml</code> 写内容，引擎负责版式、动画与检查。先定主题与页面元素，再从下面挑页面和效果，一行 <code>use:</code> 复用。</p>
    <div class="steps">
      <a class="step" href="#theme"><i>1</i><div><b>定主题</b><span>配色 · 页码 · Logo · 页脚，下载 theme.yaml</span></div></a>
      <a class="step" href="${d.dev ? '#decks' : '#theme'}"><i>2</i><div><b>新建演示</b><span>npm run new -- &lt;名称&gt; --theme theme.yaml</span></div></a>
      <a class="step" href="#pages"><i>3</i><div><b>挑页面结构</b><span>${nPages} 个页面，复制一行 use: 即用</span></div></a>
      <a class="step" href="#effects"><i>4</i><div><b>加动画与交互</b><span>${nFx} 个效果：逐步出现、morph、图表</span></div></a>
    </div></div></section>`;
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>html_ppt</title><link rel="icon" href="data:,"><style>${read('home.css')}</style></head><body id="top">
<header class="top"><div class="wrap top-in"><a class="brand" href="#top"><b>html_ppt</b><span>演示即代码</span></a>
<nav class="nav">${d.dev ? '<a href="#decks">演示</a>' : ''}<a href="#theme">主题与页面元素</a><a href="#pages">页面结构</a><a href="#effects">动画与交互</a></nav>
<input class="search" id="q" placeholder="搜索页面与效果：「逐条出现」「时间线」…"></div></header>
<main>${hero}${decksSec}${studio}${pages}${effects}</main>
<div class="wrap foot">用 <code>npm run dev</code> 打开本页；效果库条目在 <code>engine/library/</code>，主题预设在 <code>engine/themes/</code>。</div>
<div class="toast" id="toast"></div>
<script>window.HOME=${scriptJson(homeData(d))};</script>
<script>${fs.readFileSync(DERIVE_JS, 'utf8')}</script>
<script>${read('home.js')}</script>
<script>${read('studio.js')}</script>
</body></html>`;
  return html;
}
