/**
 * catalog：从代码与 schema 生成两份给 AI 读的文档（不要手改）：
 *  - engine/CATALOG.md        组件 / 布局 / 动画 preset / 字段说明
 *  - engine/library/INDEX.md  效果库：提示词 → 条目 → 可复制的 YAML 片段
 */
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { stringify } from 'yaml';
import { COMPONENTS } from './components/index.ts';
import { ROLES } from './components/common.ts';
import { LAYOUTS } from './layout.ts';
import { PRESETS, INTENTS, SCENE_TRANSITIONS } from './motion.ts';
import { DeckMeta, Scene, State, Effect, StateTransition, LIB_CATEGORIES } from './schema.ts';
import { loadLibrary } from './library.ts';
import { loadStyle } from './style.ts';
import { Issues } from './issues.ts';
import { ENGINE, LIBRARY, rel } from './paths.ts';
import { printIssues } from './report.ts';

const HEADER = '<!-- 由 `npm run catalog` 生成，请勿手改。 -->\n\n';

export function catalog(): number {
  const issues = new Issues();
  const lib = loadLibrary(issues);
  fs.writeFileSync(path.join(ENGINE, 'CATALOG.md'), catalogMd());
  fs.writeFileSync(path.join(LIBRARY, 'INDEX.md'), indexMd(lib));
  console.log(`✔ ${rel(path.join(ENGINE, 'CATALOG.md'))}`);
  console.log(`✔ ${rel(path.join(LIBRARY, 'INDEX.md'))}  （${lib.length} 个条目）`);
  printIssues(issues.list);
  return issues.errors.length ? 1 : 0;
}

/* ---------------- CATALOG.md ---------------- */

function catalogMd(): string {
  const style = loadStyle('default');
  let md = HEADER + '# 引擎目录（组件 · 布局 · 动画 · 字段）\n\n';
  md += '写 deck.yaml 时查这里。坐标系为 1920×1080 舞台；颜色可用 token 名。效果库（场景 ↔ 提示词）见 `engine/library/INDEX.md`。\n\n';

  md += '## 1. 结构\n\n```text\ndeck.yaml\n├─ deck: 元信息（标题、风格、story …）\n└─ scenes: [ Scene | { library: "<id 或通配>" } ]\n     Scene = 对象池 objects + State 序列 states（State 间 morph）\n     State = 可见对象 + 属性覆盖 + steps（State 内点击构建）\n```\n\n';
  md += table('deck', DeckMeta);
  md += table('scene', Scene);
  md += table('states[i]', State);
  md += table('states[i].transition', StateTransition);
  md += table('steps[k]（一个效果；数组 = 同一次点击里的多个效果）', (Effect as any).in ?? Effect);

  md += '## 2. 布局（layout）\n\n| 名称 | 说明 | slot | 参数 |\n|---|---|---|---|\n';
  for (const [k, v] of Object.entries(LAYOUTS)) md += `| \`${k}\` | **${v.label}**：${v.desc} | ${v.slots.map((s) => '`' + s + '`').join(' ') || '—'} | ${(v.params || '—').replace(/\|/g, '\\|')} |\n`;
  md += '\n未写 slot 时按 role 自动放置：title/kicker/subtitle → `title`（hero 中 → `main`）；其余 → `body` / `cell` / `main`。split 布局的非标题对象必须写 `slot: left | right`。\n\n';

  md += '## 3. 组件（objects 中的 type）\n\n';
  md += `通用字段：\`slot\` \`frame\` \`z\` \`opacity\` \`rotate\` \`grow\` \`ref\` \`class\` \`allowBleed\`（见下方各表）。文字 role：${ROLES.map((r) => '`' + r + '`').join(' ')}。\n\n`;
  for (const c of Object.values(COMPONENTS)) {
    md += `### \`${c.name}\` — ${c.label}\n\n${c.desc}\n\n可 morph：${c.motion.join('、')}\n\n`;
    md += propsTable(c.schema, ['type']);
  }

  md += '## 4. 点击构建 preset（steps 的 effect）\n\n| preset | 类型 | 名称 | 说明 | 默认时长 |\n|---|---|---|---|---|\n';
  const kind = { enter: '进入', exit: '退出', emphasis: '强调' } as const;
  for (const [k, p] of Object.entries(PRESETS)) md += `| \`${k}\` | ${kind[p.kind]} | ${p.label} | ${p.desc} | ${p.duration}ms |\n`;
  md += '\n时序：同一次点击中的效果默认同时开始；`after: true` 等上一个结束；`delay` 追加延迟；`stagger` 让多个对象/段落依次开始。\n\n';

  md += '## 5. State 之间的过渡（transition.intent）\n\n| intent | 说明 |\n|---|---|\n';
  for (const [k, v] of Object.entries(INTENTS)) md += `| \`${k}\` | ${v} |\n`;
  md += `\nScene 之间的翻页（scene.transition / deck.transition）：${SCENE_TRANSITIONS.map((t) => '`' + t + '`').join(' ')}\n\n`;

  md += '## 6. 颜色 token（默认风格）\n\n| token | 浅色 | 深色 |\n|---|---|---|\n';
  for (const [k, v] of Object.entries(style.colors.light)) md += `| \`${k}\` | ${v} | ${style.colors.dark[k] ?? v} |\n`;
  md += `\n字号 token（px）：${Object.entries(style.sizes).map(([k, v]) => `${k}=${v}`).join('、')}。设计约束：${Object.entries(style.rules).map(([k, v]) => `${k}=${v}`).join('、')}。\n`;
  return md;
}

function table(title: string, schema: z.ZodType<any>): string {
  return `**${title}**\n\n` + propsTable(schema, []);
}

function propsTable(schema: z.ZodType<any>, skip: string[]): string {
  const js: any = z.toJSONSchema(schema, { unrepresentable: 'any', io: 'input' });
  const req = new Set<string>(js.required ?? []);
  let md = '| 字段 | 类型 | 说明 |\n|---|---|---|\n';
  for (const [k, p] of Object.entries<any>(js.properties ?? {})) {
    if (skip.includes(k)) continue;
    md += `| \`${k}\`${req.has(k) ? ' *' : ''} | ${typeStr(p)} | ${(p.description ?? '').replace(/\|/g, '\\|')} |\n`;
  }
  return md + '\n';
}

function typeStr(p: any): string {
  if (!p) return '';
  if (p.enum) return p.enum.map((v: any) => '`' + v + '`').join(' \\| ');
  if (p.const !== undefined) return '`' + p.const + '`';
  if (p.anyOf) return p.anyOf.map(typeStr).join(' \\| ');
  if (p.type === 'array') return p.prefixItems ? `[${p.prefixItems.map(typeStr).join(', ')}]` : `${typeStr(p.items)}[]`;
  if (p.type === 'object') return 'object';
  return p.type ?? 'any';
}

/* ---------------- library/INDEX.md ---------------- */

function indexMd(lib: ReturnType<typeof loadLibrary>): string {
  let md = HEADER + '# 效果库索引（场景 / 效果 ↔ 提示词）\n\n';
  md += '每个条目 = 一个可复用的页面设计或动画，带"用户可能怎么说"的提示词和可直接复制的 YAML。可视化浏览：`npm run dev` 首页的效果库，或 `npm run gallery` 生成的 `output/_gallery/index.html`。\n\n';
  md += '**三种用法**\n\n1. 继承（推荐）：`- { id: my-page, use: page.cards-3, objects: { c1: { text: "…" } } }` —— 继承条目的布局、对象和 States，只覆盖写出来的字段。\n2. 复制：把条目的 YAML 复制进 deck.yaml 的 `scenes:`，补一个 `id`，改文字。\n3. 演示：`- { library: "build.*" }` 把条目原样插入为演示页（带底部说明条）。\n\n';
  md += '## 分类\n\n| 类别 | 说明 | 分组（条目数） |\n|---|---|---|\n';
  for (const [cat, c] of Object.entries(LIB_CATEGORIES)) {
    const groups = Object.entries(c.groups as Record<string, string>).map(([g, label]) => `${label}（${lib.filter((e) => e.category === cat && e.group === g).length}）`);
    md += `| \`${cat}\` ${c.label} | ${c.desc} | ${groups.join(' · ')} |\n`;
  }
  md += '\n## 提示词速查\n\n| 提示词 | 条目 | 分类 |\n|---|---|---|\n';
  for (const e of lib) md += `| ${e.prompts.map((p) => '「' + p + '」').join(' ')} | [\`${e.id}\`](#${anchor(e.id)}) ${e.title} | ${e.categoryLabel} · ${e.groupLabel} |\n`;
  md += '\n';
  for (const [cat, c] of Object.entries(LIB_CATEGORIES)) {
    const list = lib.filter((e) => e.category === cat);
    if (!list.length) continue;
    md += `## ${cat} — ${c.label}：${c.desc}\n\n`;
    for (const [g, glabel] of Object.entries(c.groups as Record<string, string>)) {
      const items = list.filter((e) => e.group === g);
      if (!items.length) continue;
      md += `### ${c.label} · ${glabel}\n\n`;
      for (const e of items) {
        md += `#### ${e.id}\n\n**${e.title}** · 文件 \`${rel(e.file)}\`\n\n- 提示词：${e.prompts.map((p) => '「' + p + '」').join(' ')}\n- 适合：${e.use_when}\n`;
        if (e.avoid_when) md += `- 不适合：${e.avoid_when}\n`;
        md += `- 调用：\`- { id: <scene-id>, use: ${e.id} }\`\n`;
        md += '\n```yaml\n' + stringify([{ id: e.id.split('.')[1], ...e.demo }], { lineWidth: 0 }).trim() + '\n```\n\n';
      }
    }
  }
  return md;
}

function anchor(id: string) {
  return id.replace(/\./g, '').toLowerCase();
}
