/** new：新建 deck 骨架；agents-sync：把中立的 agents/ 同步成 Claude Code 的 .claude/ */
import fs from 'node:fs';
import path from 'node:path';
import { DECKS, ROOT, rel, UsageError } from './paths.ts';
import { THEMES, validateThemeText } from './theme.ts';

/** themeText：写成 deck 目录里的 theme.yaml 并在 deck.yaml 引用；themeRef（CLI --theme）：预设名或主题文件路径 */
export function newDeck(name: string | undefined, opts: { themeText?: string; themeRef?: string; quiet?: boolean } = {}): number {
  if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) throw new UsageError('用法：npm run new -- <deck-name>（小写字母、数字、-）');
  const dir = path.join(DECKS, name);
  if (fs.existsSync(dir)) throw new UsageError(`已存在：${rel(dir)}`);
  let themeText = opts.themeText;
  if (opts.themeRef) {
    const preset = path.join(THEMES, `${opts.themeRef}.yaml`);
    const file = fs.existsSync(preset) ? preset : path.resolve(opts.themeRef);
    if (!fs.existsSync(file)) throw new UsageError(`找不到主题：${opts.themeRef}（预设名见 engine/themes/，或给一个 theme.yaml 的路径）`);
    themeText = fs.readFileSync(file, 'utf8');
  }
  if (themeText) {
    try {
      validateThemeText(themeText);
    } catch (e: any) {
      throw new UsageError(e.message);
    }
  }
  fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'assets', '.gitkeep'), '');
  if (themeText) fs.writeFileSync(path.join(dir, 'theme.yaml'), themeText);
  fs.writeFileSync(
    path.join(dir, 'brief.md'),
    `# ${name} · brief\n\n- 目标：\n- 受众：\n- 时长：\n- 核心论点（thesis）：\n- 素材：\n- 风格 / 约束：\n`,
  );
  fs.writeFileSync(
    path.join(dir, 'deck.yaml'),
    `# 字段与组件见 engine/CATALOG.md；可复用的页面与动画见 engine/library/INDEX.md
deck:
  title: ${name}${themeText ? THEME_LINE : ''}
  story:
    thesis: 一句话核心论点
    audience: 受众

scenes:
  - id: cover
    use: page.cover
    purpose: 开场，给出主题
    objects:
      title: { text: ${name} }
      subtitle: { text: 副标题 }

  - id: points
    use: build.bullets-one-by-one
    purpose: 列出要点
`,
  );
  if (!opts.quiet) console.log(`✔ 已创建 ${rel(dir)}/（deck.yaml、brief.md${themeText ? '、theme.yaml' : ''}、assets/）\n下一步：npm run check -- ${name}`);
  return 0;
}

const THEME_LINE = '\n  theme: theme.yaml   # 颜色与页面元素（页码、Logo、页脚…）；deck.tokens / deck.chrome 可逐项覆盖';

/* ---------------- agents-sync ---------------- */

const GEN = (src: string) => `<!-- 由 npm run agents:sync 从 ${src} 生成，请改源文件 -->\n`;

export function agentsSync(): number {
  const agents = path.join(ROOT, 'agents');
  const claude = path.join(ROOT, '.claude');
  let n = 0;
  const skillsDir = path.join(agents, 'skills');
  if (fs.existsSync(skillsDir)) {
    for (const name of fs.readdirSync(skillsDir)) {
      const src = path.join(skillsDir, name, 'SKILL.md');
      if (!fs.existsSync(src)) continue;
      const { fm, body } = frontmatter(fs.readFileSync(src, 'utf8'));
      const out = path.join(claude, 'skills', name, 'SKILL.md');
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, `---\nname: ${fm.name ?? name}\ndescription: ${fm.description ?? ''}\n---\n${GEN(rel(src))}${body}`);
      n++;
    }
  }
  const rolesDir = path.join(agents, 'roles');
  if (fs.existsSync(rolesDir)) {
    for (const f of fs.readdirSync(rolesDir).filter((f) => f.endsWith('.md'))) {
      const src = path.join(rolesDir, f);
      const { fm, body } = frontmatter(fs.readFileSync(src, 'utf8'));
      const name = fm.name ?? path.basename(f, '.md');
      const out = path.join(claude, 'agents', `${name}.md`);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      const tools = fm.claude_tools ? `tools: ${fm.claude_tools}\n` : '';
      fs.writeFileSync(out, `---\nname: ${name}\ndescription: ${fm.description ?? ''}\n${tools}---\n${GEN(rel(src))}${body}`);
      n++;
    }
  }
  console.log(`✔ 已同步 ${n} 个文件到 .claude/（源：agents/）`);
  return 0;
}

function frontmatter(text: string): { fm: Record<string, string>; body: string } {
  const m = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: text };
  const fm: Record<string, string> = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { fm, body: m[2] };
}
