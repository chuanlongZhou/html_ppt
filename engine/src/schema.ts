/**
 * Source DSL（deck.yaml）的 schema。Canonical IR 见 ir.ts，由 normalize.ts 生成。
 * 修改这里等于修改"AI 写什么"。改动后运行 `npm run catalog` 更新文档。
 */
import { z } from 'zod';
import { LAYOUT_NAMES } from './layout.ts';
import { INTENTS, SCENE_TRANSITIONS, DIRS } from './motion.ts';

z.config(z.locales.zhCN());

export const Key = z.string().regex(/^[A-Za-z_][\w-]*$/, '对象 key 只能用字母、数字、_、-，且不能以数字开头');
const Keys = z.union([Key, z.array(Key).min(1)]);
const Id = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'id 只能用小写字母、数字、-');

export const LayoutRef = z
  .union([
    z.enum(LAYOUT_NAMES as [string, ...string[]]),
    z.strictObject({
      type: z.enum(LAYOUT_NAMES as [string, ...string[]]),
      ratio: z.number().optional().describe('split：左栏百分比'),
      cols: z.number().int().optional().describe('grid：列数'),
      align: z.enum(['left', 'center']).optional().describe('hero/center：对齐'),
      cellHeight: z.number().optional().describe('grid：单元最大高度'),
    }),
  ])
  .describe('布局：名字，或 { type, ...参数 }');

export const Effect = z
  .strictObject({
    enter: Keys.optional().describe('进入的对象 key（可多个）'),
    exit: Keys.optional().describe('退出的对象 key'),
    emphasis: Keys.optional().describe('强调的对象 key'),
    effect: z.string().optional().describe('preset 名（见 CATALOG 的动画表）；默认 enter=fade、exit=fade-out、emphasis=pulse'),
    from: z.enum(DIRS as [string, ...string[]]).optional().describe('fly-in / wipe 的来向'),
    to: z.enum(DIRS as [string, ...string[]]).optional().describe('fly-out 的去向'),
    by: z.enum(['object', 'paragraph']).optional().describe('paragraph：文字对象每段一次点击（逐条出现）'),
    stagger: z.number().optional().describe('ms。多个对象/段落在同一次点击内依次开始的间隔'),
    after: z.boolean().optional().describe('在同一次点击中，等上一个效果结束后再开始'),
    delay: z.number().optional().describe('ms，额外延迟'),
    duration: z.number().optional().describe('ms，覆盖 preset 默认时长'),
    easing: z.string().optional(),
    auto: z.boolean().optional().describe('进入本 State 后自动播放，无需点击；只能写在 steps 最前面的连续几项，各项按顺序间隔播放'),
  })
  .refine((e) => [e.enter, e.exit, e.emphasis].filter((x) => x !== undefined).length === 1, {
    message: '每个效果必须且只能写 enter / exit / emphasis 其中之一',
  });
export type EffectSrc = z.infer<typeof Effect>;

/** 一次点击：一个效果，或同一次点击里的一组效果 */
export const Step = z.union([Effect, z.array(Effect).min(1)]);
export type StepSrc = z.infer<typeof Step>;

export const StateTransition = z.strictObject({
  intent: z.enum(Object.keys(INTENTS) as [string, ...string[]]).optional().describe('morph（默认）/ focus / fade / none'),
  target: Keys.optional().describe('focus 的目标对象'),
  duration: z.number().optional().describe('ms（默认 800）'),
  easing: z.string().optional(),
  stagger: z.number().optional().describe('ms，各移动对象依次开始的间隔'),
});

export const State = z.strictObject({
  show: z.array(Key).optional().describe('本 State 可见的对象（完整列表）；不写则沿用上一个 State（第一个 State 默认全部）'),
  add: z.array(Key).optional().describe('在上一 State 基础上增加的对象'),
  remove: z.array(Key).optional().describe('在上一 State 基础上移除的对象'),
  override: z.record(Key, z.record(z.string(), z.any())).optional().describe('本 State 起对象属性的覆盖（累积到后续 State）'),
  layout: LayoutRef.optional().describe('本 State 起切换布局（对象会 morph 到新位置）'),
  steps: z.array(Step).optional().describe('本 State 内的点击构建'),
  transition: StateTransition.optional().describe('从上一个 State 进入本 State 的方式'),
  notes: z.string().optional().describe('演讲者备注'),
});
export type StateSrc = z.infer<typeof State>;

/* ---------------- 页面元素（chrome）：每页都有的 Logo、页眉页脚、页码、进度 ---------------- */

export const CHROME_AT = ['header-left', 'header-center', 'header-right', 'footer-left', 'footer-center', 'footer-right'] as const;
const ChromeBand = z.strictObject({
  left: z.string().optional(),
  center: z.string().optional(),
  right: z.string().optional(),
});

/** 页面元素配置。文字里可用占位符 {n} {N} {title} {subtitle} {author} {date} {section}；n 与 N 按 Scene 计数 */
export const Chrome = z.strictObject({
  logo: z
    .strictObject({
      src: z.string().optional().describe('图片路径（相对 deck 目录）；与 text 二选一'),
      text: z.string().optional().describe('文字 Logo（字标）'),
      at: z.enum(CHROME_AT).optional().describe('位置（默认 header-right）'),
      height: z.number().optional().describe('图片高度 px（默认 40）'),
    })
    .optional()
    .describe('每页相同的 Logo'),
  header: ChromeBand.optional().describe('页眉：left / center / right 三段文字'),
  footer: ChromeBand.optional().describe('页脚：left / center / right 三段文字'),
  pageNumber: z
    .union([z.boolean(), z.strictObject({ format: z.string().optional().describe('默认 "{n} / {N}"'), at: z.enum(CHROME_AT).optional().describe('默认 footer-right') })])
    .optional()
    .describe('页码（按 Scene 计数）。true = 右下角 "n / N"'),
  sections: z
    .union([z.boolean(), z.strictObject({ at: z.enum(['header', 'footer']).optional().describe('默认 footer') })])
    .optional()
    .describe('章节导航：一排章节标签，当前章节高亮，翻到新章节时高亮块滑动过去。章节名来自 scene 的 section（至少两个不同的 section）；占用页脚（或页眉）的中间'),
  progress: z.enum(['none', 'bar', 'dots']).optional().describe('进度：bar 底部细条 / dots 页脚圆点'),
  rule: z
    .union([
      z.boolean(),
      z.strictObject({
        header: z.boolean().optional().describe('页眉下方的细分隔线；省略时关闭'),
        footer: z.boolean().optional().describe('页脚上方的细分隔线；省略时关闭'),
      }),
    ])
    .optional()
    .describe('页眉页脚分隔线：true / false 同时控制两处，或 { header: true, footer: false } 分别控制'),
  caps: z.boolean().optional().describe('页眉页脚文字全部大写；文字里的 **强调** 显示为主色加粗（如项目名）'),
  hideOn: z.array(z.string()).optional().describe('不显示的 scene id；first / last 代表第一页 / 最后一页（封面、结尾）'),
});
export type ChromeSrc = z.infer<typeof Chrome>;

export const Scene = z.strictObject({
  id: Id.describe('scene id（全 deck 唯一）'),
  use: z.string().optional().describe('以效果库条目为模板（如 page.cards-3）：继承其 layout / objects / states，本 scene 写出的字段覆盖模板，objects 按 key 合并属性'),
  purpose: z.string().optional().describe('这一页为什么存在（语义 QA 会检查）'),
  layout: LayoutRef.optional(),
  theme: z.enum(['light', 'dark']).optional(),
  background: z.string().optional().describe('背景色 token 或 CSS 颜色'),
  transition: z.enum(SCENE_TRANSITIONS).optional().describe('从上一个 Scene 翻到本 Scene 的方式'),
  objects: z.record(Key, z.record(z.string(), z.any())).describe('对象池：key → 对象。key 就是跨 State 的身份'),
  states: z.array(State).min(1).optional().describe('State 序列；不写 = 单 State'),
  steps: z.array(Step).optional().describe('单 State 时的点击构建（等价于 states[0].steps）'),
  notes: z.string().optional(),
  patterns: z.array(z.string()).optional().describe('本页使用的效果库条目 id（showPatterns 时显示在页角）'),
  continues: z.boolean().optional().describe('与上一个 Scene 共享对象身份：两页里同名 key 的对象在翻页时 morph（上一页的卡片直接移动到本页的位置）；其余对象淡入淡出'),
  kind: z.enum(['content', 'opening', 'closing']).optional().describe('页面类型。opening / closing 独立于 part；默认从封面/结尾模板或 opening、cover、closing、thanks 等 id 识别，content 可显式覆盖'),
  section: z.union([z.string(), z.literal(false)]).optional().describe('所属章节名（页眉里的 {section}）；后续正文沿用。false = 本页独立于 part；opening / closing 始终不归入 part'),
  chrome: z.union([z.literal(false), Chrome]).optional().describe('false = 本页不显示页面元素；对象 = 只覆盖写出的项'),
});
export type SceneSrc = z.infer<typeof Scene>;

export const LibraryInclude = z.strictObject({
  library: z.string().describe('插入效果库演示页：条目 id 或通配，如 "*"、"page.*"、"morph.focus"'),
  caption: z.boolean().optional().describe('是否显示底部说明条（默认 true）'),
});

export const DeckMeta = z.strictObject({
  title: z.string(),
  subtitle: z.string().optional(),
  author: z.string().optional(),
  date: z.string().optional(),
  stage: z.tuple([z.number(), z.number()]).optional().describe('舞台尺寸，默认 [1920, 1080]'),
  style: z.string().optional().describe('engine/styles 下的风格名（默认 default）'),
  theme: z.string().optional().describe('主题：engine/themes/ 下的预设名（ocean、forest …），或相对 deck 目录的主题文件（theme.yaml；可在主页「主题与页面元素」配置并下载）'),
  tokens: z.record(z.string(), z.string()).optional().describe('覆盖浅色 token，如 { accent: "#E8590C" }（优先于 theme）'),
  tokensDark: z.record(z.string(), z.string()).optional().describe('覆盖深色 token（theme: dark 的页面）'),
  chrome: Chrome.optional().describe('页面元素：Logo、页眉页脚、页码、进度（优先于 theme 中的 chrome）'),
  transition: z.enum(SCENE_TRANSITIONS).optional().describe('Scene 之间默认翻页方式（默认 fade）'),
  story: z
    .strictObject({ thesis: z.string().optional(), audience: z.string().optional(), duration: z.string().optional(), goal: z.string().optional() })
    .optional()
    .describe('叙事信息：核心论点、受众、时长、目标'),
  showPatterns: z.boolean().optional().describe('在页角显示本页用到的效果库条目'),
  slideNumber: z.boolean().optional().describe('显示页码（默认 true）'),
});

/** 顶层只检查形状；scenes 中每一项在 load.ts 里按类型逐个校验，以得到更精确的报错 */
export const DeckShape = z.strictObject({
  deck: DeckMeta,
  scenes: z.array(z.record(z.string(), z.any())).min(1),
});

/* ---------------- 效果库条目（engine/library/<category>/<name>.yaml） ---------------- */

/** 效果库分类：类别 → 分组。新增分组在这里登记；条目的 group 必须是所属类别的分组之一 */
export const LIB_CATEGORIES = {
  page: { label: '页面结构', desc: '常用页面的版式与配色：封面、目录、章节、要点、对比、数据、时间线、总结', groups: { structure: '结构页', text: '文字页', visual: '图文与对比', data: '数据页', diagram: '流程与框架' } },
  build: { label: '页内动画', desc: '一页之内逐次点击：出现、强调、搭建', groups: { reveal: '出现', emphasis: '强调', diagram: '结构搭建' } },
  morph: { label: '状态切换', desc: '同一画面在多个 State 之间平滑变化', groups: { layout: '版面变化', focus: '聚焦', data: '数据与进度' } },
  interact: { label: '交互数据', desc: '可悬停、点击、切换的图表与数据面板；讲述推进和自由探索共用同一套状态', groups: { chart: '交互图表', linked: '联动与面板', narrative: '讲述 + 探索' } },
  image: { label: '位图操作', desc: '对截图、照片等位图做局部放大、标注、聚光与对比', groups: { focus: '放大与聚光', annotate: '标注', compare: '对比' } },
} as const;
export type LibCategory = keyof typeof LIB_CATEGORIES;

export const LibraryEntry = z.strictObject({
  id: z.string().regex(/^(page|build|morph|interact|image)\.[a-z0-9-]+$/, 'id 格式为 <category>.<name>，category 为 page / build / morph / interact / image'),
  group: z.string().describe('所属分组（见 schema.ts 的 LIB_CATEGORIES）'),
  title: z.string().describe('中文名'),
  prompts: z.array(z.string()).min(1).describe('用户可能怎么说（触发词）'),
  use_when: z.string().describe('适合什么情况'),
  avoid_when: z.string().optional().describe('不适合什么情况'),
  tags: z.array(z.string()).optional(),
  order: z.number().optional().describe('同类条目中的排序（小的在前）'),
  demo: z.record(z.string(), z.any()).describe('一个可直接复制进 deck.yaml 的 scene（不含 id）'),
});
export type LibraryEntrySrc = z.infer<typeof LibraryEntry>;
