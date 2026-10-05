/**
 * Motion Grammar v0：点击构建（steps → fragments）的 preset 表，以及 State 之间的过渡意图。
 * 新增 preset：在 PRESETS 加一项，在 runtime/reveal/fx.css 写对应样式，然后 `npm run catalog`。
 */

export type FxKind = 'enter' | 'exit' | 'emphasis';
export type Dir = 'left' | 'right' | 'top' | 'bottom';
export const DIRS: Dir[] = ['left', 'right', 'top', 'bottom'];

export interface Preset {
  kind: FxKind;
  label: string;
  desc: string;
  duration: number;
  easing?: string;
  /** 支持方向参数（from / to） */
  dir?: Dir;
}

export const PRESETS: Record<string, Preset> = {
  // 进入
  appear: { kind: 'enter', label: '出现', desc: '立即出现，没有过渡', duration: 0 },
  fade: { kind: 'enter', label: '淡入', desc: '原地淡入', duration: 500 },
  'fade-up': { kind: 'enter', label: '上浮淡入', desc: '从下方 48px 上浮并淡入；最常用的要点/卡片进入方式', duration: 550 },
  'fade-down': { kind: 'enter', label: '下落淡入', desc: '从上方 48px 落下并淡入', duration: 550 },
  'fade-left': { kind: 'enter', label: '左移淡入', desc: '从右侧 48px 向左移入并淡入', duration: 550 },
  'fade-right': { kind: 'enter', label: '右移淡入', desc: '从左侧 48px 向右移入并淡入', duration: 550 },
  'fly-in': { kind: 'enter', label: '飞入', desc: '从舞台外飞入，from: left/right/top/bottom（默认 bottom）', duration: 700, dir: 'bottom' },
  'zoom-in': { kind: 'enter', label: '放大进入', desc: '从 60% 放大并淡入', duration: 500 },
  pop: { kind: 'enter', label: '弹出', desc: '带轻微回弹的放大出现；适合图标、徽标、数字', duration: 450, easing: 'cubic-bezier(.34,1.56,.64,1)' },
  wipe: { kind: 'enter', label: '擦除', desc: '按方向逐渐显露，from: left/right/top/bottom（默认 left）', duration: 700, easing: 'cubic-bezier(.65,0,.35,1)', dir: 'left' },
  'blur-in': { kind: 'enter', label: '模糊进入', desc: '由模糊变清晰并淡入', duration: 600 },
  draw: { kind: 'enter', label: '描线', desc: '线条/箭头沿路径画出；用在非线条对象上时等同 wipe', duration: 800, easing: 'cubic-bezier(.65,0,.35,1)' },
  // 强调
  pulse: { kind: 'emphasis', label: '脉冲', desc: '放大再回弹一次，提醒注意', duration: 600 },
  grow: { kind: 'emphasis', label: '放大强调', desc: '放大到 108% 并保持', duration: 400 },
  highlight: { kind: 'emphasis', label: '荧光笔', desc: '背后扫出一条强调色底纹', duration: 500, easing: 'cubic-bezier(.65,0,.35,1)' },
  dim: { kind: 'emphasis', label: '变暗', desc: '降到 25% 不透明度；用于"讲过的变暗"', duration: 400 },
  // 退出
  'fade-out': { kind: 'exit', label: '淡出', desc: '原地淡出', duration: 400 },
  'fly-out': { kind: 'exit', label: '飞出', desc: '飞出舞台，to: left/right/top/bottom（默认 bottom）', duration: 600, dir: 'bottom' },
  'zoom-out': { kind: 'exit', label: '缩小消失', desc: '缩小到 60% 并淡出', duration: 400 },
};

export const DEFAULT_PRESET: Record<FxKind, string> = { enter: 'fade', exit: 'fade-out', emphasis: 'pulse' };
export const DEFAULT_EASING = 'cubic-bezier(.2,.7,.2,1)';

export function presetsOf(kind: FxKind): string[] {
  return Object.keys(PRESETS).filter((k) => PRESETS[k].kind === kind);
}

/** State 之间的过渡意图 */
export const INTENTS = {
  morph: '默认。同一对象（同 key）在两个 State 间平滑插值位置、尺寸、颜色、字号、透明度；新对象淡入，消失的对象淡出',
  focus: 'morph + 把 target 以外的可见对象变暗（opacity 0.18）；配合 override 放大 target 即"聚焦/放大细节"',
  fade: '不做 morph，整页淡入淡出（两个 State 内容无连续关系时用）',
  none: '直接切换，无动画',
} as const;
export type Intent = keyof typeof INTENTS;
export const MORPH_DEFAULTS = { duration: 800, easing: 'cubic-bezier(.45,0,.2,1)' };
export const FOCUS_DIM = 0.18;

/** 场景之间（不同 Scene）的翻页方式，对应 Reveal transition */
export const SCENE_TRANSITIONS = ['fade', 'slide', 'convex', 'zoom', 'none'] as const;
export type SceneTransition = (typeof SCENE_TRANSITIONS)[number];

/** fly-in / fly-out 的离场位移：让对象恰好位于舞台之外 */
export function flyOffset(dir: Dir, f: { x: number; y: number; w: number; h: number }, stage: { w: number; h: number }) {
  const pad = 40;
  switch (dir) {
    case 'left':
      return { x: -(f.x + f.w) - pad, y: 0 };
    case 'right':
      return { x: stage.w - f.x + pad, y: 0 };
    case 'top':
      return { x: 0, y: -(f.y + f.h) - pad };
    case 'bottom':
      return { x: 0, y: stage.h - f.y + pad };
  }
}
