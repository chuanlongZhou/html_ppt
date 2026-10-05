/**
 * Layout recipes：每个 recipe 定义一组命名 slot。slot 的矩形在这里由代码算出，
 * slot 内的对象交给 CSS 纵向排版（flex column）。`free` 没有 slot，对象必须写 frame。
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
export type Justify = 'start' | 'center' | 'end';
export interface Slot extends Rect {
  justify: Justify;
  align: 'stretch' | 'center';
}

export interface LayoutSpec {
  type: LayoutName;
  ratio?: number;
  cols?: number;
  align?: 'left' | 'center';
  cellHeight?: number;
}

export const LAYOUTS = {
  free: { label: '自由布局', desc: '没有 slot，每个对象用 frame: [x, y, w, h] 定位（1920×1080 坐标）。用于导入 PPT 或特殊构图', slots: [] as string[], params: '' },
  hero: { label: '主视觉', desc: '内容在舞台中纵向居中堆叠：kicker / title / subtitle；meta 在底部。用于封面、章节页、结尾', slots: ['main', 'meta'], params: 'align: left | center（默认 left）' },
  'title-body': { label: '标题 + 正文', desc: '顶部标题区，下方正文区（可放多个对象，纵向堆叠）', slots: ['title', 'body'], params: '' },
  split: { label: '左右分栏', desc: '顶部标题区，下方左右两栏', slots: ['title', 'left', 'right'], params: 'ratio: 左栏百分比（默认 50）' },
  grid: { label: '网格', desc: '顶部标题区，下方等分网格；slot: cell 的对象按顺序各占一格', slots: ['title', 'cell'], params: 'cols: 列数（默认 = 对象数，最多 3）；cellHeight: 单元最大高度' },
  center: { label: '居中', desc: '内容在舞台正中（大数字、金句、引用）；可选顶部 title 与底部 caption', slots: ['title', 'main', 'caption'], params: '' },
} as const;
export type LayoutName = keyof typeof LAYOUTS;
export const LAYOUT_NAMES = Object.keys(LAYOUTS) as LayoutName[];

/** 未写 slot 时，按 role 选择默认 slot */
export function defaultSlot(layout: LayoutName, role: string | undefined): string | undefined {
  const titleish = role === 'title' || role === 'kicker' || role === 'subtitle';
  switch (layout) {
    case 'free':
      return undefined;
    case 'hero':
      return role === 'meta' || role === 'caption' ? 'meta' : 'main';
    case 'title-body':
      return titleish ? 'title' : 'body';
    case 'split':
      return titleish ? 'title' : undefined;
    case 'grid':
      return titleish ? 'title' : 'cell';
    case 'center':
      return role === 'title' || role === 'kicker' ? 'title' : role === 'caption' ? 'caption' : 'main';
  }
}

export interface ResolvedLayout {
  type: LayoutName;
  align: 'left' | 'center';
  slots: Record<string, Slot>;
  /** grid：按顺序分配的格子 slot 名 cell-1..cell-n */
  cells: string[];
}

/**
 * @param used 本 State 中实际被用到的 slot 名（决定标题区是否保留）
 * @param cellCount grid 中 slot: cell 的可见对象个数
 */
export function resolveLayout(spec: LayoutSpec, stage: { w: number; h: number }, used: Set<string>, cellCount: number): ResolvedLayout {
  const mx = 120;
  const top = 84;
  const bottom = stage.h - 96;
  const W = stage.w - 2 * mx;
  const titleH = 150;
  const gap = 96;
  const hasTitle = used.has('title');
  const bodyY = hasTitle ? top + titleH + 36 : top;
  const body: Rect = { x: mx, y: bodyY, w: W, h: bottom - bodyY };
  const slots: Record<string, Slot> = {};
  const cells: string[] = [];
  const S = (r: Rect, justify: Justify = 'start', align: Slot['align'] = 'stretch'): Slot => ({ ...round(r), justify, align });
  const title = S({ x: mx, y: top, w: W, h: titleH }, 'end');

  switch (spec.type) {
    case 'free':
      break;
    case 'hero': {
      const hasMeta = used.has('meta');
      slots.main = S({ x: mx, y: top, w: W, h: (hasMeta ? bottom - 110 : bottom) - top }, 'center', spec.align === 'center' ? 'center' : 'stretch');
      slots.meta = S({ x: mx, y: bottom - 90, w: W, h: 90 }, 'end', spec.align === 'center' ? 'center' : 'stretch');
      break;
    }
    case 'title-body':
      slots.title = title;
      slots.body = S(body);
      break;
    case 'split': {
      const ratio = clamp(spec.ratio ?? 50, 20, 80) / 100;
      const lw = (W - gap) * ratio;
      slots.title = title;
      slots.left = S({ x: mx, y: body.y, w: lw, h: body.h });
      slots.right = S({ x: mx + lw + gap, y: body.y, w: W - gap - lw, h: body.h });
      break;
    }
    case 'grid': {
      slots.title = title;
      const n = Math.max(cellCount, 1);
      const cols = clamp(spec.cols ?? Math.min(n, 3), 1, 6);
      const rows = Math.ceil(n / cols);
      const g = 40;
      const cw = (W - (cols - 1) * g) / cols;
      let ch = (body.h - (rows - 1) * g) / rows;
      if (spec.cellHeight) ch = Math.min(ch, spec.cellHeight);
      for (let i = 0; i < n; i++) {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const name = `cell-${i + 1}`;
        slots[name] = S({ x: mx + c * (cw + g), y: body.y + r * (ch + g), w: cw, h: ch });
        cells.push(name);
      }
      break;
    }
    case 'center': {
      const hasCaption = used.has('caption');
      slots.title = { ...title, align: 'center' };
      const y0 = hasTitle ? body.y : top;
      const y1 = hasCaption ? bottom - 130 : bottom;
      slots.main = S({ x: mx, y: y0, w: W, h: y1 - y0 }, 'center', 'center');
      slots.caption = S({ x: mx, y: bottom - 110, w: W, h: 110 }, 'start', 'center');
      break;
    }
  }
  return { type: spec.type, align: spec.align ?? (spec.type === 'center' ? 'center' : 'left'), slots, cells };
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
function round(r: Rect): Rect {
  return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h) };
}
