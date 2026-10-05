/**
 * 组件注册表。新增组件：在本目录写一个模块（schema + render + motion 声明），加到 COMPONENTS，
 * 写 fx/样式，然后 `npm run catalog` 更新 engine/CATALOG.md。
 */
import { z } from 'zod';
import { text } from './text.ts';
import { shape } from './shape.ts';
import { image, metric, html } from './media.ts';
import { chart } from './chart.ts';
import type { RenderCtx, Rendered } from './common.ts';

export interface ComponentDef {
  name: string;
  label: string;
  desc: string;
  schema: z.ZodType<any>;
  motion: string[];
  interaction: string[];
  paragraphs(p: any): number;
  prepare?(p: any): any;
  render(p: any, ctx: RenderCtx): Rendered;
}

export const COMPONENTS: Record<string, ComponentDef> = { text, shape, image, metric, chart, html };

export const ObjectSchema = z.discriminatedUnion('type', [text.schema, shape.schema, image.schema, metric.schema, chart.schema, html.schema]);
