/**
 * html_ppt CLI —— 所有命令都是非交互的；退出码 0=通过、1=deck 有 error、2=工具故障。
 *   new <deck> [--theme <预设名|theme.yaml>] · build <deck> [--ir] · check <deck> [--scene id] [--film] [--no-shots]
 *   export <deck> [--out file.html] [--verify [--no-shots]]   导出单文件 HTML（可双击离线打开）
 *   dev [--port n] · gallery · site [deck…] · catalog · agents-sync
 */
import path from 'node:path';
import { resolveDeck, rel, UsageError } from './paths.ts';
import { buildDeck } from './build.ts';
import { printIssues } from './report.ts';

const [cmd, ...rest] = process.argv.slice(2);
const flags = new Map<string, string | true>();
const pos: string[] = [];
for (let i = 0; i < rest.length; i++) {
  const a = rest[i];
  if (a.startsWith('--')) {
    const [k, v] = a.slice(2).split('=');
    if (v !== undefined) flags.set(k, v);
    else if (rest[i + 1] && !rest[i + 1].startsWith('--') && ['scene', 'port', 'theme', 'out'].includes(k)) flags.set(k, rest[++i]);
    else flags.set(k, true);
  } else pos.push(a);
}
const flag = (k: string) => (typeof flags.get(k) === 'string' ? (flags.get(k) as string) : undefined);

async function main(): Promise<number> {
  switch (cmd) {
    case 'build': {
      const d = resolveDeck(pos[0]);
      const b = buildDeck(d, { ir: flags.has('ir') });
      const errs = b.issues.errors.length;
      console.log(`${b.ok ? '✔' : '✖'} build ${d.name}  sections=${b.manifest?.sections.length ?? 0}  errors=${errs}  warnings=${b.issues.warnings.length}`);
      printIssues(b.issues.list);
      if (b.ok) console.log(`site: ${rel(path.join(d.site, 'index.html'))}${flags.has('ir') ? `\nir: ${rel(path.join(d.out, 'ir.json'))}` : ''}`);
      return b.ok ? 0 : 1;
    }
    case 'check': {
      const { checkDeck } = await import('./qa/check.ts');
      return checkDeck(resolveDeck(pos[0]), { scene: flag('scene'), film: flags.has('film'), shots: !flags.has('no-shots') });
    }
    case 'export': {
      const { exportCli } = await import('./export.ts');
      return exportCli(resolveDeck(pos[0]), { out: flag('out'), verify: flags.has('verify'), shots: !flags.has('no-shots') });
    }
    case 'dev': {
      const { dev } = await import('./dev.ts');
      await dev(Number(flag('port') ?? 5173));
      return -1;
    }
    case 'gallery': {
      const { galleryCli } = await import('./gallery.ts');
      return galleryCli();
    }
    case 'site': {
      const { siteCli } = await import('./site.ts');
      return siteCli(pos);
    }
    case 'catalog': {
      const { catalog } = await import('./catalog.ts');
      return catalog();
    }
    case 'new': {
      const { newDeck } = await import('./scaffold.ts');
      return newDeck(pos[0], { themeRef: flag('theme') });
    }
    case 'agents-sync': {
      const { agentsSync } = await import('./scaffold.ts');
      return agentsSync();
    }
    default:
      console.log('用法：npm run <new|build|check|export|dev|site|catalog|agents:sync> -- [deck] [选项]\n详见 AGENTS.md');
      return cmd ? 2 : 0;
  }
}

main()
  .then((code) => {
    if (code >= 0) process.exit(code);
  })
  .catch((e) => {
    if (e instanceof UsageError) {
      console.error('✖ ' + e.message);
      process.exit(2);
    }
    console.error(e);
    process.exit(2);
  });
