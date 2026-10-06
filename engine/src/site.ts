/**
 * site：把整个项目组装成一个可部署的静态站点 output/_site/（Netlify 等）
 *  - /                 主页（主题与页面元素、页面结构、动画与交互）+ 「我的演示」卡片
 *  - /<deck>/          每个 deck 的放映页（output/<deck>/site）
 *  - /view.html#<id>   效果库条目预览
 * 缩略图需要本机浏览器；拿不到就跳过（卡片显示灰底），不影响部署。
 */
import fs from 'node:fs';
import path from 'node:path';
import { buildDeck } from './build.ts';
import { buildGallery, deckThumbnails, GALLERY } from './gallery.ts';
import { homeHtml, type DeckCard } from './home.ts';
import { printIssues } from './report.ts';
import { OUTPUT, listDecks, resolveDeck, rel } from './paths.ts';

export const SITE = path.join(OUTPUT, '_site');
const RESERVED = new Set(['e', 'lib', 'thumbs', 'theme-preview']);

export async function siteCli(names: string[]): Promise<number> {
  const decks = names.length ? names : listDecks();
  const cards: DeckCard[] = [];
  let failed = 0;
  for (const name of decks) {
    if (RESERVED.has(name)) {
      console.log(`✖ ${name}：与站点保留目录同名，跳过`);
      failed++;
      continue;
    }
    const d = resolveDeck(name);
    const b = buildDeck(d);
    console.log(`${b.ok ? '✔' : '✖'} ${name}  errors=${b.issues.errors.length}  warnings=${b.issues.warnings.length}`);
    if (!b.ok) {
      printIssues(b.issues.errors);
      failed++;
      continue;
    }
    cards.push({ name, title: b.manifest?.title ?? name, pages: b.manifest?.sections.length ?? 0, errors: 0, warnings: b.issues.warnings.length, where: path.basename(path.dirname(d.dir)) });
  }

  const { items } = await buildGallery({ quiet: true });
  try {
    await deckThumbnails(cards.map((c) => c.name));
    await buildGallery({ thumbs: true, quiet: true });
  } catch (e: any) {
    console.log(`· 跳过缩略图（${String(e?.message ?? e).split('\n')[0]}）`);
  }

  fs.rmSync(SITE, { recursive: true, force: true });
  fs.cpSync(GALLERY, SITE, { recursive: true });
  for (const c of cards) fs.cpSync(path.join(OUTPUT, c.name, 'site'), path.join(SITE, c.name), { recursive: true });
  fs.writeFileSync(path.join(SITE, 'index.html'), homeHtml({ items, decks: cards, dev: false, base: '' }));
  console.log(`✔ 站点：${rel(path.join(SITE, 'index.html'))}（${cards.length} 个演示，${items.length} 个效果库条目）`);
  return failed ? 1 : 0;
}
