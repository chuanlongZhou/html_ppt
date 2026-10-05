import { z } from 'zod';
import { base, Color, type RenderCtx, type Rendered } from './common.ts';

/**
 * 交互图表：编译期只输出数据规格（JSON），由浏览器端 runtime/reveal/charts.js 渲染 SVG 并处理交互。
 * - 讲述驱动：不同 State 写不同的 show / highlight / series，进入 State 时数据平滑过渡
 * - 自由探索：悬停看数值、点击高亮、图例开关、切换按钮；回到这一页时复位到讲述状态
 * - 联动：同一页中 link 相同的图表共享高亮
 */
const Series = z.union([
  z.record(z.string(), z.array(z.number())),
  z.array(z.strictObject({ name: z.string(), values: z.array(z.number()), color: Color.optional() })),
]);

export const chartSchema = z.strictObject({
  type: z.literal('chart'),
  kind: z.enum(['bar', 'hbar', 'line']).optional().describe('bar 柱状（默认）/ hbar 横向条形 / line 折线'),
  categories: z.array(z.union([z.string(), z.number()])).min(1).describe('分类（x 轴；hbar 为纵轴）'),
  series: Series.describe('数据系列：{ 名称: [数值…] }，或 [{ name, values, color }]；每个系列的长度等于 categories'),
  show: z.array(z.string()).optional().describe('可见的系列（默认全部）'),
  highlight: z.union([z.string(), z.number(), z.null()]).optional().describe('高亮的分类或系列名，其余变淡'),
  unit: z.string().optional().describe('数值单位（标签、悬停提示中使用）'),
  min: z.number().optional().describe('数值轴最小值（默认 0）'),
  max: z.number().optional().describe('数值轴最大值（默认取所有系列的最大值，切换系列时刻度保持不变）'),
  labels: z.boolean().optional().describe('显示数值标签（默认：数据点不多时显示）'),
  legend: z.boolean().optional().describe('图例；交互时可点击开关系列（默认：多于 1 个系列时显示）'),
  switch: z.boolean().optional().describe('切换按钮：一次只看一个系列（如年份）'),
  detail: z.boolean().optional().describe('读数面板：显示当前高亮项在各可见系列中的数值'),
  interactive: z.boolean().optional().describe('悬停 / 点击 / 图例 / 切换（默认 true）'),
  link: z.string().optional().describe('联动组：同一页中 link 相同的图表共享高亮'),
  colors: z.array(Color).optional().describe('系列颜色（token 或 CSS 颜色）'),
  size: z.number().optional().describe('图表文字字号 px（默认 24）'),
  source: z.string().optional().describe('数据来源，显示在图表下方'),
  ...base,
});
export type ChartProps = z.infer<typeof chartSchema>;

const PALETTE = ['accent', 'accent-2', 'accent-3', 'accent-4', 'muted'];

export function seriesList(p: Pick<ChartProps, 'series'>): { name: string; values: number[]; color?: string }[] {
  return Array.isArray(p.series) ? p.series : Object.entries(p.series).map(([name, values]) => ({ name, values }));
}

/** 编译期校验：长度一致、show / highlight 的名字存在 */
export function chartProblems(p: ChartProps): string[] {
  const out: string[] = [];
  const list = seriesList(p);
  const n = p.categories.length;
  for (const s of list) if (s.values.length !== n) out.push(`系列 "${s.name}" 有 ${s.values.length} 个数值，但 categories 有 ${n} 个`);
  const names = list.map((s) => s.name);
  for (const s of p.show ?? []) if (!names.includes(s)) out.push(`show 中的 "${s}" 不是系列名（可用：${names.join(', ')}）`);
  if (p.highlight !== undefined && p.highlight !== null && !names.includes(String(p.highlight)) && !p.categories.map(String).includes(String(p.highlight))) {
    out.push(`highlight "${p.highlight}" 既不是分类也不是系列名`);
  }
  return out;
}

function spec(p: ChartProps, ctx: RenderCtx) {
  const list = seriesList(p);
  return {
    kind: p.kind ?? 'bar',
    categories: p.categories.map(String),
    series: list.map((s, i) => ({ name: s.name, values: s.values, color: ctx.color(s.color ?? p.colors?.[i] ?? PALETTE[i % PALETTE.length]) })),
    show: p.show ?? list.map((s) => s.name),
    highlight: p.highlight === undefined || p.highlight === null ? null : String(p.highlight),
    unit: p.unit ?? '',
    min: p.min ?? 0,
    max: p.max ?? null,
    labels: p.labels ?? null,
    legend: p.legend ?? list.length > 1,
    switch: p.switch ?? false,
    detail: p.detail ?? false,
    interactive: p.interactive ?? true,
    link: p.link ?? null,
    size: p.size ?? 24,
    source: p.source ?? null,
    w: Math.round(ctx.rect.w),
    h: Math.round(ctx.rect.h),
  };
}

const json = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c');

export const chart = {
  name: 'chart',
  label: '交互图表',
  desc: '柱状 / 横向条形 / 折线。讲述时由 State 驱动数据变化；放映中可悬停、点击高亮、开关系列、切换视图；同一页 link 相同的图表联动',
  schema: chartSchema,
  motion: ['位置', '尺寸', '透明度', '数据过渡（State 间 show / highlight / series 变化）'],
  interaction: ['hover 提示', 'click 高亮', '图例开关', '切换按钮', '联动高亮（link）', '回到本页时复位'],
  paragraphs: () => 0,
  render(p: ChartProps, ctx: RenderCtx): Rendered {
    const s = spec(p, ctx);
    const prev = ctx.prev && ctx.prev.type === 'chart' ? spec(ctx.prev as ChartProps, ctx) : null;
    const html =
      `<div class="ch-bar"></div><div class="ch-plot"><svg class="ch-svg"></svg><div class="ch-detail"></div><div class="ch-tip"></div></div>` +
      (s.source ? `<div class="ch-source">${s.source.replace(/</g, '&lt;')}</div>` : '') +
      `<script type="application/json" class="ch-spec">${json(s)}</script>` +
      (prev ? `<script type="application/json" class="ch-prev">${json(prev)}</script>` : '');
    return {
      cls: ['o-chart', s.interactive ? 'interactive' : ''].filter(Boolean),
      style: { '--ch-size': `${s.size}px` },
      html,
    };
  },
};
