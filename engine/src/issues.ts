import { LineCounter, parseDocument, type Document } from 'yaml';
import fs from 'node:fs';
import { rel } from './paths.ts';

export interface Issue {
  level: 'error' | 'warning';
  code: string;
  message: string;
  hint?: string;
  file?: string;
  line?: number;
  scene?: string;
  state?: number;
  step?: number;
  object?: string;
}

export class Issues {
  list: Issue[] = [];
  error(code: string, message: string, extra: Partial<Issue> = {}) {
    this.list.push({ level: 'error', code, message, ...extra });
  }
  warn(code: string, message: string, extra: Partial<Issue> = {}) {
    this.list.push({ level: 'warning', code, message, ...extra });
  }
  get errors() {
    return this.list.filter((i) => i.level === 'error');
  }
  get warnings() {
    return this.list.filter((i) => i.level === 'warning');
  }
}

/** 带行号信息的 YAML 源文件 */
export interface SrcDoc {
  file: string;
  doc: Document;
  lc: LineCounter;
  data: any;
}

export function readYaml(file: string, issues: Issues): SrcDoc | undefined {
  const text = fs.readFileSync(file, 'utf8');
  const lc = new LineCounter();
  const doc = parseDocument(text, { lineCounter: lc, prettyErrors: false, uniqueKeys: true });
  if (doc.errors.length) {
    for (const e of doc.errors) {
      const line = e.pos ? lc.linePos(e.pos[0]).line : undefined;
      issues.error('YAML_SYNTAX', e.message.split('\n')[0], { file: rel(file), line, hint: '检查缩进（用空格，不用 Tab）、冒号后的空格、引号是否成对' });
    }
    return undefined;
  }
  return { file, doc, lc, data: doc.toJS() };
}

/** 给定数据路径，找到最近的 YAML 节点所在行 */
export function lineOf(src: SrcDoc, path: (string | number)[]): number | undefined {
  for (let n = path.length; n >= 0; n--) {
    const node = src.doc.getIn(path.slice(0, n), true) as any;
    if (node && node.range) return src.lc.linePos(node.range[0]).line;
  }
  return undefined;
}

export function at(src: SrcDoc, path: (string | number)[]): Pick<Issue, 'file' | 'line'> {
  return { file: rel(src.file), line: lineOf(src, path) };
}

/** 把 zod 错误转成 Issues，路径映射回 YAML 行号 */
export function zodIssues(err: { issues: any[] }, src: SrcDoc, base: (string | number)[], issues: Issues, extra: Partial<Issue> = {}) {
  for (const zi of err.issues) {
    const path = [...base, ...(zi.path ?? [])];
    let message = zi.message as string;
    let hint: string | undefined;
    if (zi.code === 'unrecognized_keys') {
      message = `未知字段：${zi.keys.join(', ')}`;
      hint = '字段名拼写？可用字段见 engine/CATALOG.md';
    } else if (zi.code === 'invalid_union' && zi.discriminator) {
      hint = '对象 type 必须是 text / shape / image / metric / html 之一';
    } else if (zi.code === 'invalid_value' && zi.values) {
      hint = `可选值：${zi.values.join(' / ')}`;
    }
    const where = (zi.path ?? []).join('.');
    issues.error('SCHEMA', where ? `${where}：${message}` : message, { ...at(src, path), hint, ...extra });
  }
}
