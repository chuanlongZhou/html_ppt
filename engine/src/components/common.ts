/** 组件共享：公共 schema 片段（frame、颜色、文字内容）、语义角色、文字样式到 CSS 的转换 */
import { z } from 'zod';

export const Frame = z
  .tuple([z.number(), z.number(), z.number(), z.number()])
  .describe('[x, y, w, h]，舞台坐标（默认 1920×1080）');
export const Point = z.tuple([z.number(), z.number()]);
export const Color = z.string().describe('颜色 token（ink / muted / accent / accent-2 / surface …）或任意 CSS 颜色');
export const TextContent = z
  .union([z.string(), z.array(z.string())])
  .describe('文字。字符串按换行分段，数组每项一段。段首 "- " 要点、"1. " 编号、"# " 小标题；行内 **粗体** ==强调色== `代码` [[标签|orange/green/blue]] ^^译文（另起一行、缩小，用于双语）^^');

export const ROLES = ['title', 'subtitle', 'kicker', 'heading', 'body', 'bullets', 'callout', 'label', 'caption', 'quote', 'code', 'meta'] as const;

export const base = {
  slot: z.string().optional().describe('放入 layout 的哪个 slot；不写则按 role 自动选择'),
  frame: Frame.optional(),
  z: z.number().int().optional().describe('层级（越大越靠前）'),
  opacity: z.number().min(0).max(1).optional(),
  rotate: z.number().optional().describe('旋转角度（度）'),
  grow: z.boolean().optional().describe('在 slot 中占满剩余高度'),
  ref: z.string().optional().describe('语义 ID（预留给数据绑定 / 联动视图）'),
  class: z.string().optional().describe('附加 CSS class'),
  allowBleed: z.boolean().optional().describe('允许超出舞台，关闭越界检查'),
  on: z.string().optional().describe('依附的图片对象 key：box（以及 line 的 from / to）改用该图片的坐标 0–1，图片放大时标注跟着移动'),
  box: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional().describe('配合 on：在图片坐标中的位置 [u, v, w, h]（0–1）'),
};

export const textStyle = {
  size: z.number().optional().describe('字号 px（以 1920 宽舞台计）'),
  weight: z.union([z.number(), z.enum(['normal', 'bold'])]).optional(),
  color: Color.optional().describe('文字颜色'),
  align: z.enum(['left', 'center', 'right']).optional(),
  valign: z.enum(['top', 'middle', 'bottom']).optional(),
  font: z.enum(['display', 'body', 'mono']).optional(),
  lineHeight: z.number().optional(),
  tracking: z.number().optional().describe('字距（em）'),
};

export interface RenderCtx {
  /** token 名 → var(--c-x)，否则原样返回 */
  color(c: string | undefined): string | undefined;
  /** 段落 j 需要附加的 fragment 属性（class 与 style），用于"逐段出现" */
  paraAttrs(j: number): ParaAttrs | undefined;
  /** 当前对象的唯一 DOM 前缀 */
  uid: string;
  /** 对象的 data-id（<scene>.<key>），子元素需要独立 morph 时用作前缀 */
  dataId: string;
  /** 对象所在矩形（frame 或 slot），用于自适应内边距等 */
  rect: { x: number; y: number; w: number; h: number };
  /** 上一个 State 中同一对象的属性（用于图表等组件做数据过渡） */
  prev?: any;
}

/** 默认内边距随容器大小缩放（上下、左右分别计算）：小卡片、胶囊标签不会因为固定 40px 内边距而挤掉文字 */
export function autoPadding(rect: { w: number; h: number }): string {
  const clamp = (v: number, a: number, b: number) => Math.round(Math.max(a, Math.min(b, v)));
  const m = Math.min(rect.w, rect.h) * 0.12;
  return `${clamp(Math.min(m, rect.h * 0.12), 4, 40)}px ${clamp(m, 16, 40)}px`;
}

export interface ParaAttrs {
  cls: string;
  style: string;
  attrs: string;
}

export interface Rendered {
  cls: string[];
  style: Record<string, string | number | undefined>;
  html: string;
}

export function textStyleCss(p: any, ctx: RenderCtx): Record<string, string | number | undefined> {
  return {
    'font-size': p.size !== undefined ? `${p.size}px` : undefined,
    'font-weight': p.weight,
    color: ctx.color(p.color),
    'text-align': p.align,
    'line-height': p.lineHeight,
    'letter-spacing': p.tracking !== undefined ? `${p.tracking}em` : undefined,
    'font-family': p.font ? `var(--font-${p.font})` : undefined,
  };
}

export function valignClass(v: string | undefined): string | undefined {
  return v ? `va-${v}` : undefined;
}
