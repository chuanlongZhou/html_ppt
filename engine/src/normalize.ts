/**
 * compile 的前半段：parse + validate → normalize + resolve（布局、动画）→ Canonical IR。
 * 所有坐标、fragment 序号、动画参数都在这里确定（"代码决定 how"）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { Issues, readYaml, zodIssues, at, type SrcDoc } from './issues.ts';
import { Scene, LibraryInclude, DeckShape, type StateSrc, type StepSrc, type EffectSrc, type ChromeSrc } from './schema.ts';
import { COMPONENTS, ObjectSchema } from './components/index.ts';
import { resolveLayout, defaultSlot, LAYOUTS, type LayoutSpec, type Rect, type LayoutName, type ResolvedLayout } from './layout.ts';
import { PRESETS, DEFAULT_PRESET, DEFAULT_EASING, presetsOf, MORPH_DEFAULTS, type FxKind, type Intent, type Dir } from './motion.ts';
import { loadStyle, colorValue, type Style } from './style.ts';
import { resolveTheme, type Theme } from './theme.ts';
import { loadLibrary, matchLibrary, libSceneId, type LibEntry } from './library.ts';
import { LIBRARY, rel } from './paths.ts';
import type { IRDeck, IRScene, IRState, IRItem, IRFx, Placement } from './ir.ts';
import { imageSize, imageGeom } from './imagesize.ts';
import { imageFocus } from './components/media.ts';
import { chartProblems } from './components/chart.ts';
import { loadCaptions, appendCaptions } from './captions.ts';

export interface CompileResult {
  ir?: IRDeck;
  issues: Issues;
  /** 参与编译的源文件（dev 监听用） */
  files: string[];
}

interface Ctx {
  issues: Issues;
  style: Style;
  stage: { w: number; h: number };
  ir: IRDeck;
  ids: Set<string>;
  /** 当前章节名（scene.section 沿用到下一个 section） */
  section?: string;
  /** 上一个 Scene 的 morph 分组 */
  group?: string;
}

interface Origin {
  src: SrcDoc;
  base: (string | number)[];
  assetDir: string;
  caption?: IRScene['caption'];
  library?: boolean;
  template?: string;
}

/** use: 模板继承。scene 字段覆盖模板；objects 按 key 浅合并；states/steps 写了就整体替换 */
function inherit(demo: Record<string, any>, scene: Record<string, any>) {
  const { use: _use, objects, ...rest } = scene;
  const merged: Record<string, any> = { ...demo, ...rest };
  // 写了 steps 就替换模板的 states（反之亦然），避免两者同时存在
  if ('steps' in rest && !('states' in rest)) delete merged.states;
  if ('states' in rest && !('steps' in rest)) delete merged.steps;
  const objs: Record<string, any> = { ...(demo.objects ?? {}) };
  for (const [k, v] of Object.entries(objects ?? {})) objs[k] = v === null ? undefined : { ...(objs[k] ?? {}), ...(v as object) };
  for (const k of Object.keys(objs)) if (objs[k] === undefined) delete objs[k];
  merged.objects = objs;
  return merged;
}

export function compileDeck(file: string): CompileResult {
  const issues = new Issues();
  const files = [file];
  const src = readYaml(file, issues);
  if (!src) return { issues, files };
  const shape = DeckShape.safeParse(src.data);
  if (!shape.success) {
    zodIssues(shape.error, src, [], issues);
    return { issues, files };
  }
  const meta = shape.data.deck;
  const deckDir = path.dirname(file);
  let theme: Theme | undefined;
  if (meta.theme) {
    try {
      theme = resolveTheme(meta.theme, deckDir);
      files.push(theme.file);
    } catch (e: any) {
      issues.error('THEME', e.message, at(src, ['deck', 'theme']));
      return { issues, files };
    }
  }
  let style: Style;
  try {
    style = loadStyle(meta.style ?? 'default', { light: { ...theme?.light, ...meta.tokens }, dark: { ...theme?.dark, ...meta.tokensDark } });
  } catch (e: any) {
    issues.error('STYLE', e.message, at(src, ['deck', 'style']));
    return { issues, files };
  }
  const stage = { w: meta.stage?.[0] ?? 1920, h: meta.stage?.[1] ?? 1080 };
  const ir: IRDeck = {
    title: meta.title,
    stage,
    style,
    slideNumber: meta.slideNumber ?? true,
    showPatterns: meta.showPatterns ?? false,
    meta: { title: meta.title, subtitle: meta.subtitle, author: meta.author, date: meta.date },
    scenes: [],
    assets: new Map(),
  };
  const ctx: Ctx = { issues, style, stage, ir, ids: new Set() };
  const captions = meta.captionFile ? loadCaptions(meta.captionFile, deckDir, issues, files, at(src, ['deck', 'captionFile'])) : undefined;
  const defaultTransition = meta.transition ?? 'fade';
  // 页面元素：主题的 chrome 为底，deck.chrome 逐项覆盖；Logo 图片按各自所在目录解析
  const chromeBase = theme?.chrome ? withLogo(theme.chrome, theme.dir) : undefined;
  const chromeDeck = meta.chrome ? withLogo(meta.chrome, deckDir) : undefined;
  const chromeCfg = mergeChrome(chromeBase, chromeDeck);
  let lib: LibEntry[] | undefined;

  shape.data.scenes.forEach((item: any, i: number) => {
    const base = ['scenes', i];
    if (item && 'library' in item) {
      const r = LibraryInclude.safeParse(item);
      if (!r.success) return zodIssues(r.error, src, base, issues);
      lib ??= loadLibrary(issues);
      const matched = matchLibrary(lib, r.data.library);
      if (!matched.length) {
        issues.error('LIB_NO_MATCH', `效果库中没有匹配 "${r.data.library}" 的条目`, { ...at(src, [...base, 'library']), hint: '查看 engine/library/INDEX.md' });
      }
      for (const e of matched) {
        files.push(e.file);
        const sceneData = { id: libSceneId(e.id), purpose: `效果库演示：${e.title}`, ...e.demo };
        const caption = r.data.caption === false ? undefined : { id: e.id, title: e.title, prompts: e.prompts, category: e.categoryLabel, group: e.groupLabel };
        normScene(sceneData, { src: e.src, base: ['demo'], assetDir: path.join(LIBRARY, 'assets'), caption, library: true, template: e.id }, ctx, defaultTransition);
      }
    } else if (item && typeof item.use === 'string') {
      lib ??= loadLibrary(issues);
      const e = lib.find((x) => x.id === item.use);
      if (!e) {
        issues.error('LIB_NO_MATCH', `use: 效果库中没有条目 "${item.use}"`, { ...at(src, [...base, 'use']), hint: '条目 id 见 engine/library/INDEX.md' });
        return;
      }
      files.push(e.file);
      normScene(inherit(e.demo, item), { src, base, assetDir: deckDir, template: e.id }, ctx, defaultTransition);
    } else {
      normScene(item, { src, base, assetDir: deckDir }, ctx, defaultTransition);
    }
  });

  appendCaptions(ir, captions, deckDir, issues);
  if (chromeCfg) finishChrome(chromeCfg, ctx, issues, src);
  return { ir: issues.errors.length ? undefined : ir, issues, files };
}

/** logo.src 换成绝对路径（相对声明它的文件所在目录） */
function withLogo(c: ChromeSrc, dir: string): ChromeSrc {
  return c.logo?.src ? { ...c, logo: { ...c.logo, src: path.resolve(dir, c.logo.src) } } : c;
}

function mergeChrome(base?: ChromeSrc, over?: ChromeSrc): ChromeSrc | undefined {
  if (!base && !over) return undefined;
  const out: Record<string, any> = { ...base };
  for (const [k, v] of Object.entries(over ?? {})) out[k] = k === 'header' || k === 'footer' ? { ...out[k], ...(v as object) } : v;
  return out as ChromeSrc;
}

/** 所有 scene 都编译完才能检查 hideOn；同时登记 Logo 资源、写入 IR */
function finishChrome(cfg: ChromeSrc, ctx: Ctx, issues: Issues, src: SrcDoc) {
  const scenes = ctx.ir.scenes;
  // hideOn 交给运行时解析（first / last / scene id），这样主页预览里改它也能立刻生效；这里只检查 id 是否存在
  for (const id of cfg.hideOn ?? []) {
    if (id !== 'first' && id !== 'last' && !scenes.some((x) => x.id === id))
      issues.warn('CHROME_HIDE_UNKNOWN', `chrome.hideOn 中的 scene "${id}" 不存在`, { ...at(src, ['deck', 'chrome', 'hideOn']), hint: `可用：first、last 或 ${scenes.slice(0, 6).map((x) => x.id).join('、')}…` });
  }
  const out: ChromeSrc = { ...cfg };
  if (out.logo?.src) {
    const a = registerAsset(out.logo.src, '', ctx, at(src, ['deck', 'chrome', 'logo']));
    out.logo = { ...out.logo, src: a?.pub };
  }
  ctx.ir.chrome = out;
}

/* ------------------------------------------------------------------ */

function normScene(data: any, o: Origin, ctx: Ctx, defaultTransition: string) {
  const { issues, style, stage } = ctx;
  const r = Scene.safeParse(data);
  if (!r.success) return zodIssues(r.error, o.src, o.base, issues, { scene: data?.id });
  const s = r.data;
  const where = (p: (string | number)[], extra: Record<string, unknown> = {}) => ({ ...at(o.src, [...o.base, ...p]), scene: s.id, ...extra });

  if (ctx.ids.has(s.id)) issues.error('DUP_SCENE', `scene id 重复：${s.id}`, { ...where(['id']), hint: '每个 scene 的 id 必须在 deck 内唯一' });
  ctx.ids.add(s.id);
  if (!s.purpose && !o.library) issues.warn('PURPOSE_MISSING', '缺少 purpose：这一页为什么存在？', { ...where([]), hint: '写一句 purpose，例如"证明排放集中在少数城市"' });

  // 对象池（基础属性）
  const pool = new Map<string, Record<string, any>>();
  for (const [k, v] of Object.entries(s.objects)) {
    const rr = ObjectSchema.safeParse(v);
    if (!rr.success) {
      zodIssues(rr.error, o.src, [...o.base, 'objects', k], issues, { scene: s.id, object: k });
      continue;
    }
    pool.set(k, v);
  }
  const allKeys = Object.keys(s.objects);
  const checkKeys = (keys: string[], p: (string | number)[], extra = {}) => {
    const bad = keys.filter((k) => !(k in s.objects));
    for (const k of bad) issues.error('UNKNOWN_OBJECT', `对象 "${k}" 不在 objects 中`, { ...where(p, extra), hint: `可用对象：${allKeys.join(', ')}` });
    return bad.length === 0;
  };

  if (s.states && s.steps) issues.error('STEPS_CONFLICT', '同时写了 states 和 steps', { ...where(['steps']), hint: '多 State 时把 steps 写进对应的 states[i].steps' });
  const statesSrc: { st: StateSrc; p: (string | number)[]; stepsP: (string | number)[] }[] = s.states
    ? s.states.map((st, i) => ({ st, p: ['states', i], stepsP: ['states', i, 'steps'] }))
    : [{ st: { steps: s.steps, notes: s.notes }, p: [], stepsP: ['steps'] }];

  const theme = s.theme ?? 'light';
  let chromeOverride = s.chrome === false ? undefined : s.chrome;
  if (chromeOverride?.logo?.src) {
    const a = registerAsset(chromeOverride.logo.src, o.assetDir, ctx, where(['chrome', 'logo', 'src']));
    chromeOverride = { ...chromeOverride, logo: { ...chromeOverride.logo, src: a?.pub } };
  }
  const group = s.continues && ctx.group ? ctx.group : s.id;
  ctx.group = group;
  const template = o.template;
  const kind = s.kind ?? (template === 'page.cover' || ['opening', 'cover'].includes(s.id) ? 'opening'
    : template === 'page.closing' || ['closing', 'thanks', 'thank-you', 'thankyou', 'acknowledgements', 'acknowledgments'].includes(s.id) ? 'closing' : 'content');
  if (typeof s.section === 'string') ctx.section = s.section;
  const section = kind !== 'content' || s.section === false ? undefined : ctx.section;
  const scene: IRScene = {
    id: s.id,
    group,
    purpose: s.purpose,
    theme,
    background: colorValue(style, s.background ?? 'bg', theme),
    bgToken: s.background ?? 'bg',
    chrome: { off: s.chrome === false, n: ctx.ir.scenes.length + 1, section, override: chromeOverride },
    transition: (s.transition ?? defaultTransition) as IRScene['transition'],
    states: [],
    file: rel(o.src.file),
    line: at(o.src, o.base).line,
    caption: o.caption,
    patterns: s.patterns ?? [],
  };

  let visible: string[] = [];
  const overrides: Record<string, Record<string, any>> = {};
  const overridePath: Record<string, (string | number)[]> = {};
  let spec: LayoutSpec = toSpec(s.layout ?? 'free');
  let prev: IRState | undefined;
  let prevFinal = new Set<string>();

  statesSrc.forEach(({ st, p, stepsP }, si) => {
    // 1. 可见集合
    if (st.show) {
      if (checkKeys(st.show, [...p, 'show'], { state: si })) visible = [...st.show];
    } else if (si === 0) visible = [...allKeys];
    if (st.add && checkKeys(st.add, [...p, 'add'], { state: si })) for (const k of st.add) if (!visible.includes(k)) visible.push(k);
    if (st.remove && checkKeys(st.remove, [...p, 'remove'], { state: si })) visible = visible.filter((k) => !st.remove!.includes(k));
    // 2. 布局与属性覆盖（累积）
    if (st.layout) spec = toSpec(st.layout);
    for (const [k, v] of Object.entries(st.override ?? {})) {
      if (!checkKeys([k], [...p, 'override', k], { state: si })) continue;
      overrides[k] = { ...overrides[k], ...v };
      overridePath[k] = [...p, 'override', k];
    }
    const merged = (k: string) => ({ ...pool.get(k), ...overrides[k] });

    // 3. 点击构建
    const steps = compileSteps(st.steps ?? [], stepsP, { s, where, checkKeys, merged, visible, si, issues });
    for (const k of steps.enters) if (!visible.includes(k)) visible.push(k);

    // 4. 合并属性并校验
    const order = allKeys.filter((k) => visible.includes(k) && pool.has(k));
    const items: IRItem[] = [];
    for (const key of order) {
      const raw = merged(key);
      const rr = ObjectSchema.safeParse(raw);
      if (!rr.success) {
        zodIssues(rr.error, o.src, [...o.base, ...(overridePath[key] ?? ['objects', key])], issues, { scene: s.id, state: si, object: key });
        continue;
      }
      const comp = COMPONENTS[rr.data.type];
      let props = comp.prepare ? comp.prepare(rr.data) : rr.data;
      if (props.type === 'chart') for (const m of chartProblems(props)) issues.error('CHART_DATA', `"${key}" ${m}`, { ...where(overridePath[key] ?? ['objects', key], { state: si, object: key }), hint: '检查 categories / series / show / highlight' });
      if (props.type === 'image') props = resolveImage(props, o, ctx, where(overridePath[key] ?? ['objects', key, 'src'], { object: key }));
      const sl = at(o.src, [...o.base, ...(overridePath[key] ?? ['objects', key])]);
      items.push({ key, dataId: `${scene.group}.${key}`, type: props.type, props, place: { kind: 'slot', slot: '' }, fx: steps.fx.get(key) ?? [], paraFx: steps.paraFx.get(key) ?? new Map(), src: `${sl.file}:${sl.line}`, prev: prev?.items.find((x) => x.key === key && !x.ghost)?.props });
    }

    // 5. 布局：先决定 slot，再算矩形
    const used = new Set<string>();
    let cellCount = 0;
    for (const it of items) {
      const loc = where(overridePath[it.key] ?? ['objects', it.key], { state: si, object: it.key });
      if (it.props.on) continue; // 图片标注：布局完成后按图片坐标定位（见 5b）
      if (it.props.frame) {
        const [x, y, w, h] = it.props.frame;
        it.place = { kind: 'abs', frame: { x, y, w, h } };
        continue;
      }
      if (spec.type === 'free') {
        issues.error('MISSING_FRAME', `free 布局中的对象必须有 frame`, { ...loc, hint: '加 frame: [x, y, w, h]，或改用 layout: title-body / split / grid 等 recipe' });
        continue;
      }
      const slot = it.props.slot ?? defaultSlot(spec.type, it.props.role);
      if (!slot) {
        issues.error('SLOT_REQUIRED', `${spec.type} 布局中需要指定 slot`, { ...loc, hint: `可用 slot：${LAYOUTS[spec.type].slots.join(' / ')}` });
        continue;
      }
      const slotBase = slot.startsWith('cell') ? 'cell' : slot;
      if (!(LAYOUTS[spec.type].slots as readonly string[]).includes(slotBase)) {
        issues.error('UNKNOWN_SLOT', `${spec.type} 布局没有 slot "${slot}"`, { ...loc, hint: `可用 slot：${LAYOUTS[spec.type].slots.join(' / ')}` });
        continue;
      }
      used.add(slotBase);
      if (slotBase === 'cell') cellCount++;
      it.place = { kind: 'slot', slot };
    }
    const layout = resolveLayout(spec, stage, used, cellCount);
    let ci = 0;
    for (const it of items) if (it.place.kind === 'slot' && it.place.slot.startsWith('cell')) it.place = { kind: 'slot', slot: it.place.slot === 'cell' ? layout.cells[ci++] : it.place.slot };

    // 5b. 图片标注（on: 图片 key）：图片坐标 → 舞台坐标；图片 zoom 变化时标注随之移动
    for (const it of items) {
      if (!it.props.on) continue;
      const loc = where(overridePath[it.key] ?? ['objects', it.key], { state: si, object: it.key });
      const res = placeAnnotation(it.props, items, layout);
      if ('error' in res) {
        if (res.error === 'NO_IMAGE') issues.error('ANNOTATION_NO_IMAGE', `on: "${it.props.on}" 不是本 State 中可见的图片对象`, { ...loc, hint: '让该图片在本 State 可见，或改 on 指向正确的图片 key' });
        if (res.error === 'NO_SIZE') issues.error('ANNOTATION_NO_SIZE', `无法读取图片 "${it.props.on}" 的尺寸，不能按图片坐标标注`, { ...loc, hint: '使用本地 png / jpg / gif / webp / svg 文件' });
        if (res.error === 'NO_BOX') issues.error('ANNOTATION_NO_BOX', '使用 on 时需要 box: [u, v, w, h]（line 用 from / to）', { ...loc, hint: '坐标是图片坐标 0–1，例如 box: [0.6, 0.3, 0.2, 0.15]' });
        continue;
      }
      it.annot = it.props;
      it.props = res.props;
      it.place = { kind: 'abs', frame: res.frame };
      // 箭头可以从图片外引入，只要求箭头所指的终点在图片内；其他标注要求中心在图片内
      const { fr } = res;
      const [cx, cy] = res.props.geom === 'line' && res.props.to ? res.props.to : [res.frame.x + res.frame.w / 2, res.frame.y + res.frame.h / 2];
      if (cx < fr.x || cx > fr.x + fr.w || cy < fr.y || cy > fr.y + fr.h) issues.warn('ANNOTATION_OUTSIDE', `"${it.key}" 落在图片 "${it.props.on}" 的可见区域之外（图片放大后被裁掉了）`, { ...loc, hint: '在这个 State 中 remove 它，或调整 box / zoom.at' });
    }

    // 6. 过渡
    const tr = st.transition ?? {};
    const intent = (tr.intent ?? 'morph') as Intent;
    const transition = { intent, duration: tr.duration ?? MORPH_DEFAULTS.duration, easing: tr.easing ?? MORPH_DEFAULTS.easing };
    if (intent === 'focus') {
      const targets = arr(tr.target);
      if (!targets.length) issues.error('FOCUS_TARGET', 'focus 需要 target', where([...p, 'transition'], { state: si }));
      checkKeys(targets, [...p, 'transition', 'target'], { state: si });
      for (const it of items) if (!targets.includes(it.key) && st.override?.[it.key]?.opacity === undefined) it.dim = true;
    }
    if (si > 0 && (intent === 'morph' || intent === 'focus') && prev) {
      // 消失的对象：留一个透明"幽灵"，让它在 morph 中淡出
      for (const k of prevFinal) {
        if (visible.includes(k)) continue;
        const pi = prev.items.find((x) => x.key === k && !x.ghost);
        if (!pi) continue;
        const frame = pi.place.kind === 'abs' ? pi.place.frame : soleSlotRect(prev, pi);
        if (frame) items.push({ ...pi, ghost: true, dim: false, fx: [], paraFx: new Map(), place: { kind: 'abs', frame } });
      }
      if (tr.stagger) {
        let n = 0;
        for (const it of items) if (!it.ghost && prev.items.some((x) => x.key === it.key)) it.morphDelay = n++ * tr.stagger;
      }
      const shared = items.filter((it) => !it.ghost && prev!.items.some((x) => x.key === it.key && !x.ghost));
      if (!shared.length) issues.warn('MORPH_NOTHING_SHARED', `State ${si} 与上一个 State 没有共享对象，morph 没有意义`, { ...where(p, { state: si }), hint: '改用 transition: { intent: fade }，或让两个 State 复用同一批对象 key' });
    }

    // 7. 设计规则（来自 style rules）
    densityChecks(items, steps.clicks, style, (code, msg, hint, key) => issues.warn(code, msg, { ...where(key ? overridePath[key] ?? ['objects', key] : p, { state: si, object: key }), hint }));

    const state: IRState = { index: si, layout, items, clicks: steps.clicks, autoAt: steps.autoGaps.length ? steps.autoGaps.map((g) => g + transition.duration + 150) : undefined, transition, notes: st.notes ?? (si === 0 ? s.notes : undefined) };
    scene.states.push(state);
    prev = state;
    prevFinal = new Set(visible.filter((k) => !steps.exits.has(k)));
    visible = visible.filter((k) => !steps.exits.has(k));
  });

  // 新出现的图片标注：在上一个 State 中按当时的图片几何放一个透明幽灵，
  // 这样它会随图片的 zoom 一起移动并淡入，而不是先出现在终点位置
  for (let i = 1; i < scene.states.length; i++) {
    const cur = scene.states[i];
    const before = scene.states[i - 1];
    if (cur.transition.intent !== 'morph' && cur.transition.intent !== 'focus') continue;
    for (const it of cur.items) {
      if (!it.annot || it.ghost || before.items.some((x) => x.key === it.key)) continue;
      const res = placeAnnotation(it.annot, before.items, before.layout);
      if ('error' in res) continue;
      before.items.push({ ...it, props: res.props, place: { kind: 'abs', frame: res.frame }, ghost: true, dim: false, fx: [], paraFx: new Map() });
    }
  }

  ctx.ir.scenes.push(scene);
}

/** 把图片坐标（on + box / from / to）换算成舞台坐标 */
function placeAnnotation(raw: any, items: IRItem[], layout: ResolvedLayout): { props: any; frame: Rect; fr: Rect } | { error: 'NO_IMAGE' | 'NO_SIZE' | 'NO_BOX' } {
  const img = items.find((x) => x.key === raw.on && !x.ghost);
  if (!img || img.type !== 'image') return { error: 'NO_IMAGE' };
  if (!img.props._size) return { error: 'NO_SIZE' };
  const fr = img.place.kind === 'abs' ? img.place.frame : layout.slots[img.place.slot];
  if (!fr) return { error: 'NO_IMAGE' };
  const f = imageFocus(img.props);
  const g = imageGeom({ w: fr.w, h: fr.h }, img.props._size, img.props.fit ?? 'cover', f.at, f.scale);
  const toStage = (u: number, v: number): [number, number] => [fr.x + g.x + u * g.w, fr.y + g.y + v * g.h];
  let pp: any = { ...raw };
  if (pp.box) {
    const [u, v, w, h] = pp.box;
    const [x, y] = toStage(u, v);
    pp.frame = [x, y, w * g.w, h * g.h];
  } else if (pp.type === 'shape' && pp.geom === 'line' && pp.from && pp.to) {
    pp.from = toStage(pp.from[0], pp.from[1]);
    pp.to = toStage(pp.to[0], pp.to[1]);
    pp = COMPONENTS.shape.prepare!(pp);
  } else return { error: 'NO_BOX' };
  if (pp.z === undefined) pp.z = (img.props.z ?? 0) + 1;
  const [x, y, w, h] = pp.frame;
  return { props: pp, frame: { x, y, w, h }, fr };
}

/* ------------------------------------------------------------------ */

interface StepCtx {
  s: { id: string };
  where: (p: (string | number)[], extra?: Record<string, unknown>) => any;
  checkKeys: (keys: string[], p: (string | number)[], extra?: Record<string, unknown>) => boolean;
  merged: (k: string) => Record<string, any>;
  visible: string[];
  si: number;
  issues: Issues;
}

function compileSteps(steps: StepSrc[], base: (string | number)[], c: StepCtx) {
  const fx = new Map<string, IRFx[]>();
  const paraFx = new Map<string, Map<number, IRFx[]>>();
  const enters = new Set<string>();
  const exits = new Set<string>();
  const add = (k: string, f: IRFx, para?: number) => {
    if (para === undefined) fx.set(k, [...(fx.get(k) ?? []), f]);
    else {
      const m = paraFx.get(k) ?? new Map<number, IRFx[]>();
      m.set(para, [...(m.get(para) ?? []), f]);
      paraFx.set(k, m);
    }
  };
  let click = 0;
  const clickEnd: number[] = [];
  let autoClicks = 0;
  let autoOpen = true;
  steps.forEach((step, si) => {
    const group: EffectSrc[] = Array.isArray(step) ? step : [step];
    const isAuto = group.some((e) => e.auto);
    if (isAuto && !autoOpen) c.issues.error('AUTO_NOT_FIRST', 'auto 步骤必须排在 steps 最前面，不能出现在需要点击的步骤之后', { ...c.where(Array.isArray(step) ? [...base, si, 0] : [...base, si], { state: c.si, step: si }), hint: '把 auto: true 的步骤移到 steps 开头' });
    if (!isAuto) autoOpen = false;
    let prevStart = 0;
    let prevEnd = 0;
    let consumed = 1;
    group.forEach((e, gi) => {
      const p = Array.isArray(step) ? [...base, si, gi] : [...base, si];
      const loc = c.where(p, { state: c.si, step: si });
      const kind: FxKind = e.enter !== undefined ? 'enter' : e.exit !== undefined ? 'exit' : 'emphasis';
      const targets = arr(e[kind]);
      if (!c.checkKeys(targets, p, { state: c.si, step: si })) return;
      const preset = e.effect ?? DEFAULT_PRESET[kind];
      if (!PRESETS[preset] || PRESETS[preset].kind !== kind) {
        c.issues.error('BAD_PRESET', `"${preset}" 不是可用的 ${kind} 效果`, { ...loc, hint: `${kind} 可用：${presetsOf(kind).join(' / ')}` });
        return;
      }
      for (const t of targets) {
        if (kind === 'enter') enters.add(t);
        else if (!c.visible.includes(t) && !enters.has(t)) c.issues.error('NOT_VISIBLE', `"${t}" 在本 State 不可见，不能 ${kind}`, { ...loc, hint: '先在 show/add 中加入它，或用 enter 让它出现' });
        if (kind === 'exit') exits.add(t);
      }
      const P = PRESETS[preset];
      const dir = (e.from ?? e.to ?? P.dir) as Dir | undefined;
      const duration = e.duration ?? P.duration;
      const easing = e.easing ?? P.easing ?? DEFAULT_EASING;
      const start = (gi > 0 && e.after ? prevEnd : prevStart) + (e.delay ?? 0);
      let end = start + duration;
      if (e.by === 'paragraph') {
        for (const t of targets) {
          const comp = COMPONENTS[c.merged(t).type];
          const n = comp ? comp.paragraphs(c.merged(t)) : 0;
          if (!n) {
            c.issues.error('NO_PARAGRAPHS', `"${t}" 没有可逐段出现的文字`, { ...loc, hint: 'by: paragraph 只能用于 text，或带 text 的 shape' });
            continue;
          }
          if (e.stagger !== undefined) {
            for (let j = 0; j < n; j++) add(t, { kind, preset, dir, click, delay: start + j * e.stagger, duration, easing }, j);
            end = Math.max(end, start + (n - 1) * e.stagger + duration);
          } else {
            if (group.length > 1) c.issues.error('PARAGRAPH_IN_GROUP', 'by: paragraph（每段一次点击）不能和其他效果放在同一次点击里', { ...loc, hint: '把它单独作为一个 step，或加 stagger 让各段在同一次点击内依次出现' });
            for (let j = 0; j < n; j++) add(t, { kind, preset, dir, click: click + j, delay: 0, duration, easing }, j);
            consumed = Math.max(consumed, n);
          }
        }
      } else {
        targets.forEach((t, m) => {
          const d = start + m * (e.stagger ?? 0);
          add(t, { kind, preset, dir, click, delay: d, duration, easing });
          end = Math.max(end, d + duration);
        });
      }
      prevStart = start;
      prevEnd = end;
    });
    clickEnd[click] = Math.max(prevEnd, clickEnd[click] ?? 0);
    if (isAuto && autoOpen) autoClicks += consumed;
    click += consumed;
  });
  const autoGaps: number[] = [];
  let t = 0;
  for (let i = 0; i < autoClicks; i++) {
    autoGaps.push(t);
    t += (clickEnd[i] ?? 0) + 150;
  }
  return { fx, paraFx, enters, exits, clicks: click, autoGaps };
}

/* ------------------------------------------------------------------ */

function toSpec(l: any): LayoutSpec {
  return typeof l === 'string' ? { type: l as LayoutName } : { ...l };
}

function arr<T>(v: T | T[] | undefined): T[] {
  return v === undefined ? [] : Array.isArray(v) ? v : [v];
}

function soleSlotRect(state: IRState, it: IRItem): Rect | undefined {
  if (it.place.kind !== 'slot') return undefined;
  const slot = it.place.slot;
  const same = state.items.filter((x) => !x.ghost && x.place.kind === 'slot' && x.place.slot === slot);
  return same.length === 1 ? state.layout.slots[slot] : undefined;
}

function resolveImage(props: any, o: Origin, ctx: Ctx, loc: any) {
  const src: string = props.src;
  if (/^(https?:|data:)/.test(src)) {
    if (src.startsWith('http')) ctx.issues.warn('REMOTE_ASSET', `远程图片在离线放映时无法显示：${src}`, { ...loc, hint: '下载到 deck 的 assets/ 目录' });
    return props;
  }
  const a = registerAsset(src, o.assetDir, ctx, loc);
  return a ? { ...props, _src: a.pub, _size: imageSize(a.file) } : props;
}

/** 登记要拷进 site 的资源，返回发布路径；找不到文件时报错并返回 undefined。src 可以是绝对路径 */
function registerAsset(src: string, assetDir: string, ctx: Ctx, loc: any): { pub: string; file: string } | undefined {
  let file: string;
  let pub: string;
  if (src.startsWith('@lib/')) {
    file = path.join(LIBRARY, 'assets', src.slice(5));
    pub = '_lib/' + src.slice(5);
  } else if (path.isAbsolute(src)) {
    file = src;
    pub = 'assets/_chrome/' + path.basename(src);
  } else {
    file = path.resolve(assetDir, src);
    pub = src.replace(/^\.?\//, '');
  }
  if (!fs.existsSync(file)) {
    ctx.issues.error('ASSET_MISSING', `找不到图片：${path.isAbsolute(src) ? rel(src) : src}`, { ...loc, hint: `应位于 ${rel(file)}` });
    return undefined;
  }
  ctx.ir.assets.set(pub, file);
  return { pub, file };
}

function plain(s: unknown): string {
  if (Array.isArray(s)) return s.map(plain).join('');
  return typeof s === 'string' ? s.replace(/[*=`#\-\s]/g, '') : s === undefined ? '' : String(s);
}

function densityChecks(items: IRItem[], clicks: number, style: Style, warn: (code: string, msg: string, hint: string, key?: string) => void) {
  const R = style.rules;
  const live = items.filter((i) => !i.ghost);
  const chars = live.reduce((n, i) => n + plain(i.props.text) .length + plain(i.props.label).length, 0);
  if (chars > R.maxCharsPerState) warn('DENSE_TEXT', `本页文字约 ${chars} 字，超过风格建议的 ${R.maxCharsPerState} 字`, '拆成多页 / 多个 State，或把细节放进 notes');
  if (clicks > R.maxClicksPerState) warn('MANY_CLICKS', `本页需要点击 ${clicks} 次，超过建议的 ${R.maxClicksPerState} 次`, '合并同组效果（同一次点击 + stagger），或拆页');
  if (live.length > R.maxObjectsPerState) warn('MANY_OBJECTS', `本页有 ${live.length} 个对象，超过建议的 ${R.maxObjectsPerState} 个`, '考虑合并为卡片，或拆页');
  for (const i of live) if (i.props.size !== undefined && i.props.size < R.minFontSize && i.type !== 'metric') warn('SMALL_FONT', `"${i.key}" 字号 ${i.props.size}px 小于 ${R.minFontSize}px，投影时难以看清`, '加大字号，或删减文字', i.key);
}
