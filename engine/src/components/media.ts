/** 媒体类组件：image（fit / zoom / filter / 图片坐标标注）、metric（大数字）、html（自定义片段） */
import { z } from 'zod';
import { base, Color, textStyleCss, type RenderCtx, type Rendered } from './common.ts';
import { escapeHtml, inline } from '../markup.ts';
import { imageGeom } from '../imagesize.ts';

/* ---------------- image ---------------- */

export const imageSchema = z.strictObject({
  type: z.literal('image'),
  src: z.string().describe('图片路径：相对 deck 目录（如 assets/map.png），或 @lib/xxx 引用效果库素材'),
  fit: z.enum(['cover', 'contain']).optional().describe('填充方式（默认 cover）'),
  position: z.string().optional().describe('裁剪焦点，如 "50% 30%"（未写 zoom 时生效）'),
  zoom: z
    .strictObject({
      at: z.tuple([z.number(), z.number()]).describe('焦点，图片坐标 [u, v]（0–1，左上为 0,0）'),
      scale: z.number().min(1).optional().describe('放大倍数（相对 fit 后的尺寸，默认 2）'),
    })
    .optional()
    .describe('局部放大：在 frame 内放大图片的某一处。不同 State 写不同的 zoom 即可平滑推镜头'),
  filter: z.string().optional().describe('CSS filter，如 "grayscale(1)"、"blur(6px)"、"brightness(.6)"；可在 State 间过渡'),
  radius: z.number().optional().describe('圆角 px'),
  shadow: z.boolean().optional(),
  alt: z.string().optional(),
  ...base,
});
export type ImageProps = z.infer<typeof imageSchema> & { _src?: string; _size?: { w: number; h: number } };

/** 焦点：zoom.at 优先，其次 position（"x% y%"），默认居中 */
export function imageFocus(p: ImageProps): { at: [number, number]; scale: number } {
  if (p.zoom) return { at: p.zoom.at, scale: p.zoom.scale ?? 2 };
  const m = p.position?.match(/([\d.]+)%\s+([\d.]+)%/);
  return { at: m ? [Number(m[1]) / 100, Number(m[2]) / 100] : [0.5, 0.5], scale: 1 };
}

export const image = {
  name: 'image',
  label: '图片',
  desc: '位图或 SVG 图片；支持局部放大（zoom）与滤镜（filter）。配合 on/box 可在图片坐标上加标注',
  schema: imageSchema,
  motion: ['位置', '尺寸', '圆角', '透明度', '局部放大（zoom）', '滤镜（filter）'],
  interaction: [] as string[],
  paragraphs: () => 0,
  render(p: ImageProps, ctx: RenderCtx): Rendered {
    const src = escapeHtml(p._src ?? p.src);
    const alt = escapeHtml(p.alt ?? '');
    const filter = p.filter ? `filter:${p.filter};` : '';
    const cls = ['o-image', p.shadow ? 'shadow' : ''].filter(Boolean);
    const style = { 'border-radius': p.radius !== undefined ? `${p.radius}px` : undefined };
    if (!p._size) {
      return { cls, style, html: `<img src="${src}" alt="${alt}" style="object-fit:${p.fit ?? 'cover'};${p.position ? `object-position:${p.position};` : ''}${filter}">` };
    }
    // 已知原始尺寸：由引擎算出图片矩形（绝对定位），这样 zoom 在 State 之间可以平滑插值
    const f = imageFocus(p);
    const g = imageGeom({ w: ctx.rect.w, h: ctx.rect.h }, p._size, p.fit ?? 'cover', f.at, f.scale);
    const r = (n: number) => Math.round(n * 10) / 10;
    return {
      cls: [...cls, 'geom'],
      style,
      html: `<img class="img-z" data-id="${ctx.dataId}.img" src="${src}" alt="${alt}" style="left:${r(g.x)}px;top:${r(g.y)}px;width:${r(g.w)}px;height:${r(g.h)}px;${filter}">`,
    };
  },
};

/* ---------------- metric ---------------- */

export const metricSchema = z.strictObject({
  type: z.literal('metric'),
  value: z.union([z.string(), z.number()]).describe('数值（字符串可带格式，如 "3.1"）'),
  unit: z.string().optional().describe('单位，显示在数值右侧'),
  label: z.string().optional().describe('说明，显示在数值下方'),
  delta: z.string().optional().describe('变化量，如 "-12%"'),
  tone: z.enum(['up', 'down', 'neutral']).optional().describe('delta 的语义色：up 绿 / down 红 / neutral 灰'),
  color: Color.optional().describe('数值颜色（默认 accent）'),
  size: z.number().optional().describe('数值字号 px（默认 160）；单位、说明按比例缩放'),
  align: z.enum(['left', 'center', 'right']).optional(),
  source: z.string().optional().describe('数据来源（Evidence QA 会检查）'),
  ...base,
});
export type MetricProps = z.infer<typeof metricSchema>;

export const metric = {
  name: 'metric',
  label: '指标',
  desc: '大数字 + 单位 + 说明 + 变化量。用于"一个数字说明问题"的页面或指标卡',
  schema: metricSchema,
  motion: ['位置', '字号（整体缩放）', '颜色', '透明度'],
  interaction: [] as string[],
  paragraphs: () => 0,
  render(p: MetricProps, ctx: RenderCtx): Rendered {
    const tone = p.tone ?? 'neutral';
    const html =
      `<div class="m-value"><span class="m-num">${escapeHtml(String(p.value))}</span>${p.unit ? `<span class="m-unit">${escapeHtml(p.unit)}</span>` : ''}</div>` +
      (p.label ? `<div class="m-label">${inline(p.label)}</div>` : '') +
      (p.delta ? `<div class="m-delta tone-${tone}">${escapeHtml(p.delta)}</div>` : '') +
      (p.source ? `<div class="m-source">${inline(p.source)}</div>` : '');
    return {
      cls: ['o-metric', `al-${p.align ?? 'left'}`],
      style: { 'font-size': `${p.size ?? 160}px`, '--m-color': ctx.color(p.color ?? 'accent') },
      html,
    };
  },
};

/* ---------------- html（逃生口） ---------------- */

export const htmlSchema = z.strictObject({
  type: z.literal('html'),
  html: z.string().describe('原始 HTML（逃生口：组件表达不了时才用，并考虑把它沉淀成新组件）'),
  ...base,
  ...{ color: Color.optional(), size: z.number().optional() },
});
export type HtmlProps = z.infer<typeof htmlSchema>;

export const html = {
  name: 'html',
  label: '原始 HTML',
  desc: '逃生口。能用语义组件表达时不要用；用了两次以上的结构应沉淀为组件',
  schema: htmlSchema,
  motion: ['位置', '尺寸', '透明度'],
  interaction: [] as string[],
  paragraphs: () => 0,
  render(p: HtmlProps, ctx: RenderCtx): Rendered {
    return { cls: ['o-html'], style: textStyleCss(p, ctx), html: p.html };
  },
};
