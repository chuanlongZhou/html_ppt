/** 读取图片的原始尺寸（png / jpg / gif / webp / svg），用于在编译期计算裁剪、放大与标注坐标 */
import fs from 'node:fs';

export interface Size {
  w: number;
  h: number;
}

export function imageSize(file: string): Size | undefined {
  const buf = fs.readFileSync(file);
  const ext = file.toLowerCase().split('.').pop();
  try {
    if (buf.readUInt32BE(0) === 0x89504e47) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    if (buf.toString('ascii', 0, 3) === 'GIF') return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
    if (buf[0] === 0xff && buf[1] === 0xd8) return jpeg(buf);
    if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return webp(buf);
    if (ext === 'svg') return svg(buf.toString('utf8'));
  } catch {
    return undefined;
  }
  return undefined;
}

function jpeg(b: Buffer): Size | undefined {
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) return undefined;
    const marker = b[i + 1];
    const len = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  return undefined;
}

function webp(b: Buffer): Size | undefined {
  const kind = b.toString('ascii', 12, 16);
  if (kind === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  if (kind === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (kind === 'VP8L') {
    const bits = b.readUInt32LE(21);
    return { w: 1 + (bits & 0x3fff), h: 1 + ((bits >> 14) & 0x3fff) };
  }
  return undefined;
}

function svg(t: string): Size | undefined {
  const tag = t.match(/<svg\b[^>]*>/i)?.[0] ?? '';
  const vb = tag.match(/viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  const w = tag.match(/\swidth\s*=\s*["']([\d.]+)(px)?["']/i);
  const h = tag.match(/\sheight\s*=\s*["']([\d.]+)(px)?["']/i);
  if (w && h) return { w: Number(w[1]), h: Number(h[1]) };
  if (vb) return { w: Number(vb[1]), h: Number(vb[2]) };
  return undefined;
}

/**
 * 图片在其容器（frame）中的实际矩形（相对容器左上角）。
 * fit: cover | contain；zoom.at 为焦点（图片坐标 0–1），zoom.scale ≥ 1 为相对 fit 尺寸的放大倍数。
 */
export function imageGeom(frame: Size, natural: Size, fit: 'cover' | 'contain' = 'cover', at: [number, number] = [0.5, 0.5], scale = 1) {
  const s0 = fit === 'cover' ? Math.max(frame.w / natural.w, frame.h / natural.h) : Math.min(frame.w / natural.w, frame.h / natural.h);
  const w = natural.w * s0 * scale;
  const h = natural.h * s0 * scale;
  const place = (W: number, size: number, f: number) => (size >= W ? Math.min(0, Math.max(W - size, W / 2 - f * size)) : (W - size) / 2);
  return { x: place(frame.w, w, at[0]), y: place(frame.h, h, at[1]), w, h };
}
