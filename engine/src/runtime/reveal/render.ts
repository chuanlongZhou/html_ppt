/**
 * Runtime adapter：IR → Reveal.js DOM。全项目只有这里知道 <section>、fragment、data-auto-animate。
 * 约定：
 *  - 每个 State 一个 <section>；同一 Scene 的 section 共享 data-auto-animate-id → State 之间 morph
 *  - 对象元素 .obj 带 data-id（= scene.key），视觉样式都在它上面，便于 Auto-Animate 插值
 *  - 点击构建 = 包在 .obj 外面的 .fx.fragment 层；定位放在最外层
 */
import type { IRDeck, IRScene, IRState, IRItem, IRFx } from '../../ir.ts';
import type { Rect } from '../../layout.ts';
import { COMPONENTS } from '../../components/index.ts';
import { colorVar } from '../../style.ts';
import { FOCUS_DIM, flyOffset } from '../../motion.ts';
import { escapeHtml } from '../../markup.ts';

export interface ManifestSection {
  index: number;
  scene: string;
  state: number;
  clicks: number;
  file: string;
  line?: number;
  library?: string;
  /** 对象 key → 源位置 file:line */
  objects: Record<string, string>;
}
export interface Manifest {
  title: string;
  stage: { w: number; h: number };
  sections: ManifestSection[];
}

type Css = Record<string, string | number | undefined>;

/** @param libBase Reveal 资源所在目录（相对 index.html），默认 lib/ */
export function renderDeck(ir: IRDeck, libBase = 'lib/'): { html: string; manifest: Manifest } {
  const sections: string[] = [];
  const manifest: Manifest = { title: ir.title, stage: ir.stage, sections: [] };
  let n = 0;
  for (const scene of ir.scenes) {
    scene.states.forEach((st, si) => {
      sections.push(renderState(ir, scene, st, si, n));
      manifest.sections.push({ index: n, scene: scene.id, state: si, clicks: st.clicks, file: scene.file, line: scene.line, library: scene.caption?.id, objects: Object.fromEntries(st.items.filter((i) => !i.ghost).map((i) => [i.key, i.src ?? ""])) });
      n++;
    });
  }
  const config = { stage: ir.stage, slideNumber: ir.slideNumber, chrome: ir.chrome, total: ir.scenes.length, meta: ir.meta };
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="data:,">
<title>${escapeHtml(ir.title)}</title>
<link rel="stylesheet" href="${libBase}reveal/reset.css">
<link rel="stylesheet" href="${libBase}reveal/reveal.css">
<link rel="stylesheet" href="deck.css">
</head>
<body>
<div class="reveal"><div class="slides">
${sections.join('\n')}
</div></div>
<script src="${libBase}reveal/reveal.js"></script>
<script src="${libBase}reveal/plugin/notes.js"></script>
<script src="charts.js"></script>
<script src="runtime.js"></script>
<script>HtmlPpt.init(${JSON.stringify(config).replace(/</g, '\\u003c')});</script>
</body>
</html>
`;
  return { html, manifest };
}

function renderState(ir: IRDeck, scene: IRScene, st: IRState, si: number, sectionIdx: number): string {
  const intent = st.transition.intent;
  const attrs: Css = {
    'data-auto-animate': '',
    'data-auto-animate-id': scene.id,
    'data-auto-animate-duration': st.transition.duration / 1000,
    'data-auto-animate-easing': st.transition.easing,
    'data-transition': si === 0 ? scene.transition : intent === 'none' ? 'none' : 'fade',
    'data-background-color': scene.background,
    // 页面元素与"换主题预览"需要的信息：页码、章节、背景 token、是否隐藏 / 覆盖
    'data-bg': scene.bgToken,
    'data-n': scene.chrome.n,
    'data-section': scene.chrome.section,
    'data-chrome': scene.chrome.off ? 'off' : scene.chrome.override ? JSON.stringify(scene.chrome.override) : undefined,
    'data-scene': scene.id,
    'data-state': si,
  };
  if (si > 0 && (intent === 'fade' || intent === 'none')) attrs['data-auto-animate-restart'] = '';
  const cls = ['sc', `theme-${scene.theme}`, `layout-${st.layout.type}`, `align-${st.layout.align}`];

  // slot 容器（按 slot 分组），以及绝对定位对象
  const bySlot = new Map<string, IRItem[]>();
  const abs: IRItem[] = [];
  for (const it of st.items) {
    if (it.place.kind === 'abs') abs.push(it);
    else bySlot.set(it.place.slot, [...(bySlot.get(it.place.slot) ?? []), it]);
  }
  let inner = '';
  for (const [name, items] of bySlot) {
    const slot = st.layout.slots[name];
    const base = name.startsWith('cell') ? 'cell' : name;
    // slot 中只有一个对象且顶部对齐：对象直接以绝对定位占满 slot 矩形。
    // 不用 flex-grow 填充——flex 会覆盖 Auto-Animate 插值中的 height，导致 morph 变形。
    if (items.length === 1 && slot.justify === 'start' && !items[0].props.grow) {
      inner += renderItem(ir, items[0], slot, true, sectionIdx);
      continue;
    }
    inner +=
      `<div class="slot slot-${base} j-${slot.justify} a-${slot.align}" data-slot="${name}" style="${css(rectCss(slot))}">` +
      items.map((it) => renderItem(ir, it, slot, false, sectionIdx)).join('') +
      `</div>`;
  }
  inner += abs.map((it) => renderItem(ir, it, (it.place as any).frame, true, sectionIdx)).join('');
  inner += renderOverlays(ir, scene);
  const notes = st.notes ? `<aside class="notes">${escapeHtml(st.notes).replace(/\n/g, '<br>')}</aside>` : '';
  return `<section class="${cls.join(' ')}" ${attrStr(attrs)}><div class="stage">${inner}</div>${notes}</section>`;
}

function renderItem(ir: IRDeck, it: IRItem, rect: Rect, abs: boolean, sectionIdx: number): string {
  const comp = COMPONENTS[it.type];
  const r = comp.render(it.props, {
    color: (c) => colorVar(ir.style, c),
    paraAttrs: (j) => {
      const list = it.paraFx.get(j);
      if (!list?.length) return undefined;
      // 段落只承载一层 fragment；同一段落的多个效果取第一个（其余忽略，normalize 已保证常见用法只有一个）
      const f = list[0];
      return { cls: 'fx fragment custom ' + fxClass(f, it), style: fxVars(f, rect, ir.stage), attrs: 'data-fragment-index="' + f.click + '"' };
    },
    uid: `s${sectionIdx}-${it.key}`,
    rect,
    dataId: it.dataId,
    prev: it.prev,
  });
  const objStyle: Css = { ...r.style };
  if (it.ghost) objStyle.opacity = 0;
  else if (it.dim) objStyle.opacity = FOCUS_DIM;
  else if (it.props.opacity !== undefined) objStyle.opacity = it.props.opacity;
  if (it.props.rotate) objStyle.rotate = `${it.props.rotate}deg`;

  const outer: Css = {};
  if (abs) Object.assign(outer, { position: 'absolute', ...rectCss(rect) });
  if (it.props.z !== undefined) outer['z-index'] = it.props.z;
  const outerCls = [it.props.grow ? 'fill' : ''];

  const objAttrs: Css = { 'data-id': it.dataId, 'data-key': it.key, 'data-type': it.type };
  if (it.morphDelay) objAttrs['data-auto-animate-delay'] = it.morphDelay / 1000;
  if (it.ghost) objAttrs['aria-hidden'] = 'true';
  if (it.props.allowBleed) objAttrs['data-bleed'] = '';
  const objCls = ['obj', ...r.cls, it.props.class, it.ghost ? 'ghost' : ''].filter(Boolean);

  if (!it.fx.length) {
    return `<div class="${[...objCls, ...outerCls].filter(Boolean).join(' ')}" ${attrStr(objAttrs)} style="${css({ ...outer, ...objStyle })}">${r.html}</div>`;
  }
  let el = `<div class="${objCls.join(' ')}" ${attrStr(objAttrs)} style="${css(objStyle)}">${r.html}</div>`;
  const fx = [...it.fx];
  for (let i = fx.length - 1; i >= 0; i--) {
    const f = fx[i];
    const isOuter = i === 0;
    const style = fxVars(f, rect, ir.stage) + (isOuter ? css(outer) : '');
    el = `<div class="fx fragment custom ${fxClass(f, it)}${isOuter ? ' ' + outerCls.join(' ') : ''}" data-fragment-index="${f.click}" style="${style}">${el}</div>`;
  }
  return el;
}

function fxClass(f: IRFx, it: IRItem): string {
  let preset = f.preset;
  let dir = f.dir;
  // draw 只对线条有意义；其他对象退化为 wipe
  if (preset === 'draw' && !(it.type === 'shape' && it.props.geom === 'line')) {
    preset = 'wipe';
    dir = dir ?? 'left';
  }
  return `fx-${preset}${dir ? ' d-' + dir : ''}`;
}

function fxVars(f: IRFx, rect: Rect, stage: { w: number; h: number }): string {
  const v: Css = { '--fx-dur': `${f.duration}ms`, '--fx-delay': `${f.delay}ms`, '--fx-ease': f.easing };
  if ((f.preset === 'fly-in' || f.preset === 'fly-out') && f.dir && rect) {
    const o = flyOffset(f.dir, rect, stage);
    v['--fly-x'] = `${Math.round(o.x)}px`;
    v['--fly-y'] = `${Math.round(o.y)}px`;
  }
  return css(v);
}

function renderOverlays(ir: IRDeck, scene: IRScene): string {
  if (scene.caption) {
    const c = scene.caption;
    return (
      `<div class="lib-caption" data-id="${scene.id}.__caption">` +
      `<span class="lc-tag">${escapeHtml(c.category)} · ${escapeHtml(c.group)}</span><span class="lc-title">${escapeHtml(c.title)}</span><span class="lc-id">${escapeHtml(c.id)}</span>` +
      `<span class="lc-prompts"><span class="lc-k">提示词</span>${c.prompts.slice(0, 4).map((p) => `<q>${escapeHtml(p)}</q>`).join('')}</span>` +
      `</div>`
    );
  }
  if (ir.showPatterns && scene.patterns.length) {
    return `<div class="pat-chips" data-id="${scene.id}.__patterns"><span class="lc-k">本页效果</span>${scene.patterns.map((p) => `<span class="pc">${escapeHtml(p)}</span>`).join('')}</div>`;
  }
  return '';
}

/* ---------------- helpers ---------------- */

function rectCss(r: Rect): Css {
  return { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` };
}

function css(o: Css): string {
  return Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}:${String(v).replace(/"/g, '&quot;')}`)
    .join(';') + (Object.keys(o).length ? ';' : '');
}

function attrStr(o: Css): string {
  return Object.entries(o)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => (v === '' ? k : `${k}="${escapeHtml(String(v))}"`))
    .join(' ');
}
