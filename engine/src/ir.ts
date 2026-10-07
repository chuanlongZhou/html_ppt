/**
 * Canonical IR：normalize 之后的显式结构。这里没有任何 Reveal 概念；
 * runtime/reveal/render.ts 是唯一把 IR 翻译成 Reveal DOM 的地方。
 */
import type { Rect, ResolvedLayout } from './layout.ts';
import type { Dir, FxKind, Intent, SceneTransition } from './motion.ts';
import type { Style } from './style.ts';
import type { ChromeSrc } from './schema.ts';

export interface IRFx {
  kind: FxKind;
  preset: string;
  dir?: Dir;
  /** 第几次点击（0 起） */
  click: number;
  /** 相对点击时刻的开始时间 ms */
  delay: number;
  duration: number;
  easing: string;
}

export type Placement = { kind: 'abs'; frame: Rect } | { kind: 'slot'; slot: string };

export interface IRItem {
  key: string;
  dataId: string;
  type: string;
  props: any;
  place: Placement;
  fx: IRFx[];
  paraFx: Map<number, IRFx[]>;
  /** 上一 State 中存在、本 State 已移除的对象：以透明形态保留，让 morph 淡出 */
  ghost?: boolean;
  /** focus 意图下被压暗 */
  dim?: boolean;
  morphDelay?: number;
  /** 图片标注的原始属性（图片坐标），用于在其他 State 重新换算 */
  annot?: any;
  /** 上一个 State 中同一对象的属性（不含 ghost） */
  prev?: any;
  /** 源位置 file:line（定义或最近一次 override） */
  src?: string;
}

export interface IRState {
  index: number;
  layout: ResolvedLayout;
  items: IRItem[];
  clicks: number;
  /** 进入本 State 后自动播放的前几次点击的开始时间（ms，相对于进入时刻；已含 morph 时长） */
  autoAt?: number[];
  transition: { intent: Intent; duration: number; easing: string };
  notes?: string;
}

export interface IRScene {
  id: string;
  /** morph 分组：continues 的 Scene 沿用上一个 Scene 的分组，同组同名 key 的对象会跨页 morph */
  group: string;
  purpose?: string;
  theme: 'light' | 'dark';
  background: string;
  /** 背景的 token 名或 CSS 颜色（主页预览换主题时重新取色） */
  bgToken: string;
  /** 页面元素：本页是否隐藏、第几页、所属章节、仅本页的覆盖 */
  chrome: { off: boolean; n: number; section?: string; override?: ChromeSrc };
  transition: SceneTransition;
  states: IRState[];
  file: string;
  line?: number;
  caption?: { id: string; title: string; prompts: string[]; category: string; group: string; en?: { title: string; prompts: string[]; category: string; group: string } };
  patterns: string[];
}

export interface IRDeck {
  title: string;
  stage: { w: number; h: number };
  style: Style;
  slideNumber: boolean;
  showPatterns: boolean;
  /** 页面元素（主题与 deck.chrome 合并后；logo.src 已换成发布路径）；没有则不渲染 */
  chrome?: ChromeSrc;
  meta: { title: string; subtitle?: string; author?: string; date?: string };
  scenes: IRScene[];
  /** 需要拷贝进 site 的资源：发布路径 → 源文件 */
  assets: Map<string, string>;
}
