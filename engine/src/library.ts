/** 效果库：engine/library/<category>/*.yaml，每个文件一个"场景/效果 ↔ 提示词"条目 */
import fs from 'node:fs';
import path from 'node:path';
import { LIBRARY, rel } from './paths.ts';
import { Issues, readYaml, zodIssues, at, type SrcDoc } from './issues.ts';
import { LibraryEntry, LIB_CATEGORIES, type LibraryEntrySrc, type LibCategory } from './schema.ts';

export interface LibEntry extends LibraryEntrySrc {
  src: SrcDoc;
  file: string;
  category: LibCategory;
  categoryLabel: string;
  groupLabel: string;
}

export function loadLibrary(issues: Issues): LibEntry[] {
  const out: LibEntry[] = [];
  const seen = new Map<string, string>();
  for (const cat of Object.keys(LIB_CATEGORIES) as LibCategory[]) {
    const dir = path.join(LIBRARY, cat);
    if (!fs.existsSync(dir)) continue;
    const groups = LIB_CATEGORIES[cat].groups as Record<string, string>;
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.yaml')).sort()) {
      const file = path.join(dir, f);
      const src = readYaml(file, issues);
      if (!src) continue;
      const r = LibraryEntry.safeParse(src.data);
      if (!r.success) {
        zodIssues(r.error, src, [], issues);
        continue;
      }
      const e = r.data;
      if (!e.id.startsWith(cat + '.')) issues.error('LIB_ID', `条目 id ${e.id} 与所在目录 ${cat}/ 不一致`, at(src, ['id']));
      if (!(e.group in groups)) issues.error('LIB_GROUP', `分组 "${e.group}" 不属于 ${cat}`, { ...at(src, ['group']), hint: `可用分组：${Object.entries(groups).map(([k, v]) => `${k}（${v}）`).join(' / ')}；新增分组请改 engine/src/schema.ts 的 LIB_CATEGORIES` });
      if (seen.has(e.id)) issues.error('LIB_DUP', `条目 id 重复：${e.id}（另见 ${seen.get(e.id)}）`, at(src, ['id']));
      seen.set(e.id, rel(file));
      out.push({ ...e, src, file, category: cat, categoryLabel: LIB_CATEGORIES[cat].label, groupLabel: groups[e.group] ?? e.group });
    }
  }
  return out.sort((a, b) => catOrder(a) - catOrder(b) || groupOrder(a) - groupOrder(b) || (a.order ?? 999) - (b.order ?? 999) || a.id.localeCompare(b.id));
}

function catOrder(e: LibEntry) {
  return Object.keys(LIB_CATEGORIES).indexOf(e.category);
}
function groupOrder(e: LibEntry) {
  return Object.keys(LIB_CATEGORIES[e.category].groups).indexOf(e.group);
}

export function matchLibrary(entries: LibEntry[], pattern: string): LibEntry[] {
  const re = new RegExp('^' + pattern.split('*').map(escapeRe).join('.*') + '$');
  return entries.filter((e) => re.test(e.id));
}

function escapeRe(s: string) {
  return s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
}

export function libSceneId(id: string) {
  return 'lib-' + id.replace(/\./g, '-');
}
