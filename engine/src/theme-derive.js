/*
 * 主题推导：由少量"种子色"生成完整的颜色 token（浅色 + 深色）。
 * 引擎（theme.ts 以文本方式加载）与主页的主题工作台共用这一份，保证"所见即所得"。
 * 纯函数、无依赖、非模块脚本：只定义 deriveTheme / contrast 两个全局函数。
 */
function deriveTheme(seeds) {
  var S = seeds || {};
  var hex = function (c, d) { return /^#[0-9a-f]{6}$/i.test(c || '') ? c.toUpperCase() : d; };
  var bg = hex(S.bg, '#F6F5F1');
  var ink = hex(S.ink, '#16181D');
  var accent = hex(S.accent, '#2F5BEA');
  var accent2 = hex(S.accent2, '#EE6A2C');
  var accent3 = hex(S.accent3, '#0F9F78');
  var accent4 = hex(S.accent4, '#7C5CE0');
  var white = '#FFFFFF';

  function rgb(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
  function toHex(v) {
    return '#' + v.map(function (x) { var n = Math.max(0, Math.min(255, Math.round(x))); return (n < 16 ? '0' : '') + n.toString(16); }).join('').toUpperCase();
  }
  // mix(a, b, t)：a 与 b 按 t（0–1，b 的占比）混合
  function mix(a, b, t) { var x = rgb(a), y = rgb(b); return toHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); }
  function toHsl(c) {
    var v = rgb(c).map(function (x) { return x / 255; });
    var mx = Math.max(v[0], v[1], v[2]), mn = Math.min(v[0], v[1], v[2]), l = (mx + mn) / 2, h = 0, s = 0;
    if (mx !== mn) {
      var d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === v[0] ? (v[1] - v[2]) / d + (v[1] < v[2] ? 6 : 0) : mx === v[1] ? (v[2] - v[0]) / d + 2 : (v[0] - v[1]) / d + 4;
      h /= 6;
    }
    return [h, s, l];
  }
  function fromHsl(h, s, l) {
    function f(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }
    if (s === 0) return toHex([l * 255, l * 255, l * 255]);
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    return toHex([f(p, q, h + 1 / 3) * 255, f(p, q, h) * 255, f(p, q, h - 1 / 3) * 255]);
  }
  // 深色背景上的强调色：保持色相与饱和度，把明度向上抬
  function lift(c) { var x = toHsl(c); return fromHsl(x[0], x[1], Math.max(x[2], x[2] + (1 - x[2]) * 0.35)); }
  function soft(c, base) { return mix(base, c, 0.16); }

  var light = {
    bg: bg,
    surface: white,
    'surface-2': mix(bg, ink, 0.05),
    ink: ink,
    muted: mix(ink, bg, 0.3),
    line: mix(bg, ink, 0.12),
    accent: accent,
    'accent-soft': mix(accent, white, 0.85),
    'accent-2': accent2,
    'accent-2-soft': mix(accent2, white, 0.85),
    'accent-3': accent3,
    'accent-3-soft': mix(accent3, white, 0.85),
    'accent-4': accent4,
    'accent-4-soft': mix(accent4, white, 0.85),
    success: '#0F9F78',
    danger: '#D83A3A',
    'code-bg': ink,
    'code-ink': bg
  };

  var dbg = hex(S.darkBg, mix(mix(ink, '#000000', 0.2), accent, 0.07));
  var dink = mix(bg, white, 0.35);
  var da = lift(accent), da2 = lift(accent2), da3 = lift(accent3), da4 = lift(accent4);
  var dark = {
    bg: dbg,
    surface: mix(dbg, white, 0.05),
    'surface-2': mix(dbg, white, 0.09),
    ink: dink,
    muted: mix(dink, dbg, 0.35),
    line: mix(dbg, dink, 0.16),
    accent: da,
    'accent-soft': soft(da, dbg),
    'accent-2': da2,
    'accent-2-soft': soft(da2, dbg),
    'accent-3': da3,
    'accent-3-soft': soft(da3, dbg),
    'accent-4': da4,
    'accent-4-soft': soft(da4, dbg),
    'code-bg': mix(dbg, white, 0.05)
  };
  return { light: light, dark: dark };
}

/* WCAG 对比度（1–21）：文字 ≥ 4.5 为佳，大字 ≥ 3 */
function contrast(a, b) {
  function lum(c) {
    return [1, 3, 5].map(function (i) { var v = parseInt(c.slice(i, i + 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); })
      .reduce(function (s, v, i) { return s + v * [0.2126, 0.7152, 0.0722][i]; }, 0);
  }
  var x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
