/** shape 组件：几何形状（含 spotlight）、形状内文字与自适应内边距 */
import { z } from 'zod';
import { base, textStyle, TextContent, ROLES, Color, Point, textStyleCss, valignClass, autoPadding, type RenderCtx, type Rendered } from './common.ts';
import { renderText } from './text.ts';
import { splitParas } from '../markup.ts';

export const GEOMS = ['rect', 'roundRect', 'pill', 'ellipse', 'triangle', 'diamond', 'arrow', 'chevron', 'pentagon', 'line', 'spotlight'] as const;

export const schema = z.strictObject({
  type: z.literal('shape'),
  geom: z.enum(GEOMS).optional().describe('形状（默认 roundRect）：' + GEOMS.join(' / ')),
  fill: Color.optional().describe('填充色（默认 surface；line 无填充；spotlight 为遮罩色）'),
  stroke: Color.optional().describe('描边色；line 的线条颜色（默认 ink）'),
  strokeWidth: z.number().optional().describe('描边/线宽 px'),
  dash: z.boolean().optional().describe('虚线'),
  radius: z.number().optional().describe('圆角 px（roundRect 默认 24）'),
  shadow: z.boolean().optional().describe('投影'),
  from: Point.optional().describe('line：起点 [x, y]（舞台坐标）'),
  to: Point.optional().describe('line：终点 [x, y]'),
  points: z.array(Point).min(2).optional().describe('line：折线顶点 [[x, y], …]（舞台坐标；转折处为直角时就是"肘形连接线"）；arrow 作用在最后一段'),
  ports: z.boolean().optional().describe('line：两端画小圆点（端口）'),
  arrow: z.enum(['none', 'end', 'start', 'both']).optional().describe('line：箭头位置（默认 none）'),
  text: TextContent.optional().describe('形状内文字（卡片、标签、流程框）'),
  role: z.enum(ROLES).optional().describe('形状内文字的语义角色（默认 body）'),
  padding: z.number().optional().describe('内边距 px（默认 40）'),
  ...textStyle,
  ...base,
});
export type ShapeProps = z.infer<typeof schema> & { _line?: { x1: number; y1: number; x2: number; y2: number }; _pts?: [number, number][] };

const CLIP: Record<string, string> = {
  triangle: 'polygon(50% 0, 100% 100%, 0 100%)',
  diamond: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
  arrow: 'polygon(0 28%, 68% 28%, 68% 0, 100% 50%, 68% 100%, 68% 72%, 0 72%)',
  chevron: 'polygon(0 0, 84% 0, 100% 50%, 84% 100%, 0 100%, 16% 50%)',
  pentagon: 'polygon(0 0, 86% 0, 100% 50%, 86% 100%, 0 100%)',
};

export const shape = {
  name: 'shape',
  label: '形状',
  desc: '矩形/圆角卡片/胶囊/圆/三角/菱形/箭头/折角/线条。带 text 即为卡片、标签、流程框',
  schema,
  motion: ['位置', '尺寸', '填充色', '圆角', '透明度', '描线（draw，仅 line）'],
  interaction: [] as string[],
  paragraphs: (p: ShapeProps) => (p.text ? splitParas(p.text).length : 0),
  /** line 用 from/to 时，换算出 frame 与局部坐标 */
  prepare(p: ShapeProps): ShapeProps {
    if (p.geom !== 'line') return p;
    const pad = Math.max(24, (p.strokeWidth ?? 4) * 4);
    if (p.points) {
      const xs = p.points.map((q) => q[0]);
      const ys = p.points.map((q) => q[1]);
      const x = Math.min(...xs) - pad;
      const y = Math.min(...ys) - pad;
      return { ...p, frame: [x, y, Math.max(...xs) - Math.min(...xs) + 2 * pad, Math.max(...ys) - Math.min(...ys) + 2 * pad], _pts: p.points.map((q) => [q[0] - x, q[1] - y] as [number, number]) };
    }
    if (p.from && p.to) {
      const [x1, y1] = p.from;
      const [x2, y2] = p.to;
      const x = Math.min(x1, x2) - pad;
      const y = Math.min(y1, y2) - pad;
      const w = Math.abs(x2 - x1) + 2 * pad;
      const h = Math.abs(y2 - y1) + 2 * pad;
      return { ...p, frame: [x, y, w, h], _line: { x1: x1 - x, y1: y1 - y, x2: x2 - x, y2: y2 - y } };
    }
    if (p.frame) {
      const [, , w, h] = p.frame;
      return { ...p, _line: { x1: 0, y1: h / 2, x2: w, y2: h / 2 } };
    }
    return p;
  },
  render(p: ShapeProps, ctx: RenderCtx): Rendered {
    const geom = p.geom ?? 'roundRect';
    if (geom === 'line') return renderLine(p, ctx);
    if (geom === 'spotlight') {
      // 聚光：透明洞 + 巨大的外扩阴影压暗其余区域；fill 为遮罩颜色
      const shade = ctx.color(p.fill ?? 'rgba(10,12,20,.62)');
      return {
        cls: ['o-shape', 'g-spotlight'],
        style: { 'border-radius': `${p.radius ?? 24}px`, 'box-shadow': `0 0 0 4000px ${shade}`, border: p.stroke ? `${p.strokeWidth ?? 3}px solid ${ctx.color(p.stroke)}` : undefined },
        html: '',
      };
    }
    const radius = geom === 'pill' ? '9999px' : geom === 'ellipse' ? '50%' : geom === 'roundRect' ? `${p.radius ?? 24}px` : p.radius !== undefined ? `${p.radius}px` : '0';
    const fill = ctx.color(p.fill ?? 'surface') ?? '';
    const style: Rendered['style'] = {
      ...textStyleCss(p, ctx),
      // 渐变填充（linear-gradient(...)）走 background，纯色走 background-color（可 morph）
      ...(/gradient\(/.test(fill) ? { background: fill } : { 'background-color': fill }),
      'border-radius': radius,
      'clip-path': CLIP[geom],
      border: p.stroke ? `${p.strokeWidth ?? 2}px ${p.dash ? 'dashed' : 'solid'} ${ctx.color(p.stroke)}` : undefined,
      padding: p.text !== undefined ? (p.padding !== undefined ? `${p.padding}px` : autoPadding(ctx.rect)) : undefined,
    };
    const cls = ['o-shape', `g-${geom}`, p.shadow ? 'shadow' : '', p.text !== undefined ? `role-${p.role ?? 'body'}` : '', valignClass(p.valign)].filter(Boolean) as string[];
    const html = p.text !== undefined ? `<div class="tx">${renderText(p.text, p.role ?? 'body', ctx)}</div>` : '';
    return { cls, style, html };
  },
};

function renderLine(p: ShapeProps, ctx: RenderCtx): Rendered {
  if (p._pts) return renderPolyline(p, ctx);
  const l = p._line ?? { x1: 0, y1: 0, x2: 100, y2: 0 };
  const [, , w, h] = p.frame ?? [0, 0, 100, 1];
  const sw = p.strokeWidth ?? 4;
  const color = ctx.color(p.stroke ?? 'ink');
  const arrow = p.arrow ?? 'none';
  const L = Math.max(16, sw * 4.5);
  const heads: string[] = [];
  let { x1, y1, x2, y2 } = l;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const head = (tx: number, ty: number, dx: number, dy: number) => {
    const bx = tx - dx * L;
    const by = ty - dy * L;
    const nx = -dy * L * 0.42;
    const ny = dx * L * 0.42;
    return `${f(tx)},${f(ty)} ${f(bx + nx)},${f(by + ny)} ${f(bx - nx)},${f(by - ny)}`;
  };
  if (arrow === 'end' || arrow === 'both') {
    heads.push(head(x2, y2, ux, uy));
    x2 -= ux * L * 0.8;
    y2 -= uy * L * 0.8;
  }
  if (arrow === 'start' || arrow === 'both') {
    heads.push(head(x1, y1, -ux, -uy));
    x1 += ux * L * 0.8;
    y1 += uy * L * 0.8;
  }
  const dash = p.dash ? `stroke-dasharray:${sw * 2.5} ${sw * 2}` : '';
  const svg =
    `<svg class="shape-svg" viewBox="0 0 ${f(w)} ${f(h)}" preserveAspectRatio="none">` +
    `<line class="stroke${p.dash ? ' dashed' : ''}" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" pathLength="1" style="stroke:${color};stroke-width:${sw}px;${dash}"/>` +
    heads.map((pts) => `<polygon class="head" points="${pts}" style="fill:${color}"/>`).join('') +
    `</svg>`;
  return { cls: ['o-shape', 'g-line'], style: {}, html: svg };
}

/** 折线 / 肘形连接线：沿顶点连线，最后一段可带箭头；ports 在两端画小圆点 */
function renderPolyline(p: ShapeProps, ctx: RenderCtx): Rendered {
  const pts = p._pts!.map((q) => [...q] as [number, number]);
  const [, , w, h] = p.frame ?? [0, 0, 100, 1];
  const sw = p.strokeWidth ?? 4;
  const color = ctx.color(p.stroke ?? 'ink');
  const L = Math.max(14, sw * 4.5);
  let head = '';
  if (p.arrow === 'end' || p.arrow === 'both') {
    const [x2, y2] = pts[pts.length - 1];
    const [x1, y1] = pts[pts.length - 2];
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const ux = (x2 - x1) / len;
    const uy = (y2 - y1) / len;
    const bx = x2 - ux * L;
    const by = y2 - uy * L;
    head = `<polygon class="head" points="${f(x2)},${f(y2)} ${f(bx - uy * L * 0.42)},${f(by + ux * L * 0.42)} ${f(bx + uy * L * 0.42)},${f(by - ux * L * 0.42)}" style="fill:${color}"/>`;
    pts[pts.length - 1] = [x2 - ux * L * 0.8, y2 - uy * L * 0.8];
  }
  const r = Math.max(5, sw * 1.9);
  const ports = p.ports
    ? [p._pts![0], p._pts![p._pts!.length - 1]].map((q) => `<circle class="port" cx="${f(q[0])}" cy="${f(q[1])}" r="${f(r)}" style="fill:#fff;stroke:${color};stroke-width:${sw}px"/>`).join('')
    : '';
  const svg =
    `<svg class="shape-svg" viewBox="0 0 ${f(w)} ${f(h)}" preserveAspectRatio="none">` +
    `<polyline class="stroke" points="${pts.map((q) => f(q[0]) + ',' + f(q[1])).join(' ')}" pathLength="1" style="fill:none;stroke:${color};stroke-width:${sw}px;stroke-linejoin:round"/>` +
    head +
    ports +
    `</svg>`;
  return { cls: ['o-shape', 'g-line'], style: {}, html: svg };
}

function f(n: number) {
  return Math.round(n * 10) / 10;
}
