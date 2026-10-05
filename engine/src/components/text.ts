/** text 组件：按语义角色排版的文字块（要点、编号、小标题、行内强调） */
import { z } from 'zod';
import { base, textStyle, TextContent, ROLES, textStyleCss, valignClass, type RenderCtx, type Rendered } from './common.ts';
import { parseParas, renderParas, escapeHtml, splitParas } from '../markup.ts';

export const schema = z.strictObject({
  type: z.literal('text'),
  text: TextContent,
  role: z.enum(ROLES).optional().describe('语义角色，决定默认字号/字重/颜色/默认 slot：' + ROLES.join(' / ')),
  ...textStyle,
  ...base,
});
export type TextProps = z.infer<typeof schema>;

export const text = {
  name: 'text',
  label: '文字',
  desc: '标题、正文、要点、引用、代码等一切文字。用 role 选语义样式，避免手调字号',
  schema,
  motion: ['位置', '尺寸', '字号', '颜色', '透明度', '逐段出现（by: paragraph）'],
  interaction: [] as string[],
  paragraphs: (p: TextProps) => splitParas(p.text).length,
  render(p: TextProps, ctx: RenderCtx): Rendered {
    const role = p.role ?? 'body';
    return {
      cls: ['o-text', `role-${role}`, valignClass(p.valign)].filter(Boolean) as string[],
      style: textStyleCss(p, ctx),
      html: `<div class="tx">${renderText(p.text, role, ctx)}</div>`,
    };
  },
};

export function renderText(t: string | string[], role: string, ctx: RenderCtx): string {
  if (role === 'code') {
    return splitParas(t)
      .map((line, j) => {
        const a = ctx.paraAttrs(j);
        return `<div class="p p-code${a ? ' ' + a.cls : ''}"${a?.style ? ` style="${a.style}"` : ''}${a ? ' ' + a.attrs : ''}>${highlightYaml(line) || '&nbsp;'}</div>`;
      })
      .join('');
  }
  return renderParas(parseParas(t, role === 'bullets'), (j) => ctx.paraAttrs(j));
}

/** role: code 的轻量高亮（YAML 风格：key、注释、字符串） */
function highlightYaml(line: string): string {
  let comment = '';
  const m = line.match(/^(.*?)(\s#.*|^#.*)$/);
  let body = line;
  if (m && !/["'][^"']*$/.test(m[1])) {
    body = m[1];
    comment = m[2];
  }
  let h = escapeHtml(body)
    .replace(/^(\s*(?:-\s+)?)([\w.@-]+)(:)(?=\s|$)/, '$1<span class="c-key">$2</span>$3')
    .replace(/(&quot;[^&]*?&quot;)/g, '<span class="c-str">$1</span>');
  if (comment) h += `<span class="c-cm">${escapeHtml(comment)}</span>`;
  return h;
}
