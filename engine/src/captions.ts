/** Project image captions become ordinary text IR objects, sharing image visibility and motion. */
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import type { IRDeck, IRItem } from './ir.ts';
import { Issues, type Issue } from './issues.ts';
import { rel } from './paths.ts';

const Manifest = z.strictObject({
  version: z.literal(1),
  language: z.string().optional(),
  defaults: z.strictObject({
    show: z.boolean().optional(),
    size: z.number().positive().optional(),
    gap: z.number().nonnegative().optional(),
    height: z.number().positive().optional(),
    color: z.string().optional(),
  }).optional(),
  images: z.array(z.strictObject({
    src: z.string().min(1),
    caption: z.string().trim().min(1),
    show: z.boolean().optional(),
  })),
});
type CaptionManifest = z.infer<typeof Manifest>;
interface Captions {
  defaults: NonNullable<CaptionManifest['defaults']>;
  entries: Map<string, CaptionManifest['images'][number]>;
}
const imagePath = (dir: string, src: string) => path.normalize(path.resolve(dir, src));

export function loadCaptions(src: string, dir: string, issues: Issues, files: string[], loc: Partial<Issue>): Captions | undefined {
  const file = path.resolve(dir, src);
  files.push(file);
  try {
    const result = Manifest.safeParse(JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')));
    if (!result.success) {
      for (const e of result.error.issues) issues.error('CAPTION_SCHEMA', `${e.path.join('.')}: ${e.message}`, { file: rel(file), hint: '格式见 docs/IMAGE_CAPTIONS.md' });
      return;
    }
    const entries: Captions['entries'] = new Map();
    for (const entry of result.data.images) {
      const key = imagePath(dir, entry.src);
      if (entries.has(key)) issues.error('CAPTION_DUPLICATE', `图注图片路径重复：${entry.src}`, { file: rel(file) });
      if (!fs.existsSync(key)) issues.error('CAPTION_IMAGE_MISSING', `图注对应图片不存在：${entry.src}`, { file: rel(file) });
      entries.set(key, entry);
    }
    return { defaults: result.data.defaults ?? {}, entries };
  } catch (e: any) {
    issues.error('CAPTION_FILE', `无法读取图注 JSON：${e.message}`, { ...loc, hint: '检查 deck.captionFile 路径及 JSON 语法' });
  }
}

export function appendCaptions(ir: IRDeck, config: Captions | undefined, dir: string, issues: Issues) {
  const defaults = config?.defaults ?? {};
  for (const scene of ir.scenes) {
    let previous: IRItem[] = [];
    for (const state of scene.states) {
      const captions: IRItem[] = [];
      for (const image of state.items.filter(i => i.type === 'image')) {
        const p = image.props;
        const asset = p._src ? ir.assets.get(p._src) : undefined;
        const entry = config?.entries.get(asset ? path.normalize(asset) : imagePath(dir, p.src));
        const text = typeof p.caption === 'string' ? p.caption : entry?.caption;
        const show = p.caption === false ? false : p.caption === true ? true
          : entry ? (entry.show ?? defaults.show ?? false) : typeof p.caption === 'string';
        if (!show) continue;
        if (!text) {
          if (p.caption === true) issues.error('CAPTION_MISSING', `图片 "${image.key}" 要求显示图注，但 JSON 中没有对应的 caption`, { file: scene.file, line: scene.line, scene: scene.id, object: image.key });
          continue;
        }
        const key = `${image.key}__caption`;
        if (state.items.some(i => i.key === key)) {
          issues.error('CAPTION_KEY_CONFLICT', `自动图注 key "${key}" 与现有对象冲突`, { file: scene.file, line: scene.line, scene: scene.id });
          continue;
        }
        // A flex slot may divide its space among objects: don't assume the image owns the whole slot.
        const slot = image.place.kind === 'slot' ? image.place.slot : undefined;
        const siblings = slot ? state.items.filter(i => !i.ghost && i.place.kind === 'slot' && i.place.slot === slot) : [];
        const slotRect = slot ? state.layout.slots[slot] : undefined;
        const rect = image.place.kind === 'abs' ? image.place.frame
          : siblings.length === 1 && slotRect?.justify === 'start' && !p.grow ? slotRect : undefined;
        if (!rect) {
          issues.error('CAPTION_PLACEMENT', `图片 "${image.key}" 的 flex slot 无法确定图注位置`, { file: scene.file, line: scene.line, scene: scene.id, hint: '给图片配置 frame，或放在独立、顶部对齐且不使用 grow 的 slot' });
          continue;
        }
        captions.push({
          key, dataId: `${image.dataId}__caption`, type: 'text',
          props: { type: 'text', role: 'caption', text, size: defaults.size ?? 22, color: defaults.color ?? 'muted', align: 'center', valign: 'top', lineHeight: 1.2, class: 'image-caption', opacity: p.opacity, z: p.z },
          place: { kind: 'abs', frame: { x: rect.x, y: rect.y + rect.h + (defaults.gap ?? 8), w: rect.w, h: defaults.height ?? 60 } },
          fx: image.fx.map(f => ({ ...f })), paraFx: new Map(), ghost: image.ghost, dim: image.dim, morphDelay: image.morphDelay, src: image.src,
        });
      }
      // A State can disable/change the caption while retaining the same image.
      if (state.transition.intent === 'morph' || state.transition.intent === 'focus') {
        for (const before of previous) if (!before.ghost && !captions.some(c => c.key === before.key)) captions.push({ ...before, ghost: true, fx: [], paraFx: new Map() });
      }
      state.items.push(...captions);
      previous = captions;
    }
  }
}
