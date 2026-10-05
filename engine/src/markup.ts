/** 极简文字标记：段落前缀 + 行内标记。保持足够小，便于 AI 记忆与书写。 */

export interface Para {
  kind: 'p' | 'li' | 'sub' | 'num' | 'h';
  n?: number;
  html: string;
}

export function splitParas(text: string | string[]): string[] {
  if (Array.isArray(text)) return text.map(String);
  return String(text).replace(/\r\n/g, '\n').replace(/\n+$/, '').split('\n');
}

export function parseParas(text: string | string[], bullets = false): Para[] {
  let num = 0;
  return splitParas(text).map((raw) => {
    let m: RegExpMatchArray | null;
    if ((m = raw.match(/^#\s+(.*)$/s))) return { kind: 'h', html: inline(m[1]) };
    if ((m = raw.match(/^\s{2,}[-•]\s+(.*)$/s)) || (m = raw.match(/^\+\s+(.*)$/s))) return { kind: 'sub', html: inline(m[1]) };
    if ((m = raw.match(/^[-•]\s+(.*)$/s))) return { kind: 'li', html: inline(m[1]) };
    if ((m = raw.match(/^(\d+)[.)、]\s+(.*)$/s))) {
      num = Number(m[1]);
      return { kind: 'num', n: num, html: inline(m[2]) };
    }
    return { kind: bullets && raw.trim() ? 'li' : 'p', html: inline(raw) };
  });
}

export function paraCount(text: string | string[]): number {
  return splitParas(text).length;
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function inline(s: string): string {
  const codes: string[] = [];
  let out = escapeHtml(s).replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `\u0000${codes.length - 1}\u0000`;
  });
  out = out
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/==(.+?)==/g, '<mark>$1</mark>')
    .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/\\n/g, '<br>')
    .replace(/\n/g, '<br>');
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[Number(i)]}</code>`);
}

export function renderParas(paras: Para[], attrs?: (j: number) => { cls: string; style: string; attrs: string } | undefined): string {
  return paras
    .map((p, j) => {
      const a = attrs?.(j);
      const cls = ['p', `p-${p.kind}`, a?.cls].filter(Boolean).join(' ');
      const style = a?.style ? ` style="${a.style}"` : '';
      const n = p.kind === 'num' ? ` data-n="${p.n}"` : '';
      const body = p.html === '' ? '&nbsp;' : p.html;
      return `<div class="${cls}"${n}${style}${a?.attrs ? " " + a.attrs : ""}>${body}</div>`;
    })
    .join('');
}
