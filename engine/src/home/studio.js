/* 主题与页面元素工作台：选配色 / 自定义颜色 / 配置页码、Logo、页眉页脚、进度 → 右侧用真实引擎渲染的示例 deck 实时预览
 * → 下载 theme.yaml（放进项目，deck.yaml 写 `theme: theme.yaml` 即可）。
 * 颜色推导与引擎共用 theme-derive.js（deriveTheme / contrast，由主页内嵌）。预览通过 postMessage 驱动（见 runtime.js）。 */
(function () {
  const H = window.HOME;
  const U = window.HomeUI;
  const $ = (s, r) => (r || document).querySelector(s);
  const KEY = 'htmlppt.studio.v1';

  const COLORS = [
    ['accent', '主色', '标题强调、卡片、图表主系列'],
    ['accent2', '辅色 1', '对比、第二系列'],
    ['accent3', '辅色 2', '正向指标、第三系列'],
    ['accent4', '辅色 3', '第四系列、点缀'],
    ['bg', '页面背景', '浅色页的底色'],
    ['ink', '文字', '标题与正文'],
  ];
  const AT = [['header-left', '页眉 · 左'], ['header-center', '页眉 · 中'], ['header-right', '页眉 · 右'], ['footer-left', '页脚 · 左'], ['footer-center', '页脚 · 中'], ['footer-right', '页脚 · 右']];
  const SLIDES = ['封面', '目录', '卡片', '数据', '图表', '章节（深色）', '结尾'];
  const DEF_CHROME = { logoMode: 'none', logoText: 'LOGO', logoAt: 'header-right', logoH: 40, hL: '', hC: '', hR: '', fL: '', fC: '', fR: '', pn: false, pnFormat: '{n} / {N}', pnAt: 'footer-right', progress: 'none', sections: 'none', rule: false, hideFirst: true, hideLast: false };
  const COMBOS = [
    ['无', {}],
    ['极简页码', { pn: true }],
    ['页码 + 进度条', { pn: true, progress: 'bar' }],
    ['标准页眉页脚', { hL: '{title}', hR: '{section}', fL: '{author}', pn: true, rule: true }],
    ['品牌：Logo + 进度', { logoMode: 'text', logoAt: 'header-left', pn: true, progress: 'bar' }],
    ['章节导航 + 页码', { sections: 'footer', pn: true }],
    ['汇报：内部资料', { fL: '{title} · 内部资料', fR: '{date}', pn: true, rule: true }],
  ];

  const presets = H.presets;
  let S = load() || { preset: presets[0].id, seeds: { ...presets[0].seeds }, chrome: { ...DEF_CHROME }, dirty: false };
  let tab = 'color';
  let logo = { data: null, ext: 'png' };
  let frame, ready = false;

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.seeds && s.chrome && presets.some((p) => p.id === s.preset || s.preset === 'custom')) return { ...s, chrome: { ...DEF_CHROME, ...s.chrome } };
    } catch (e) { /* 无痕模式等：忽略 */ }
    return null;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }

  /* ---------- 由状态得到配置 ---------- */
  const tokens = () => deriveTheme(S.seeds);
  function chromeCfg() {
    const c = S.chrome;
    const o = {};
    const band = (l, m, r) => { const b = {}; if (l) b.left = l; if (m) b.center = m; if (r) b.right = r; return Object.keys(b).length ? b : undefined; };
    if (c.logoMode === 'text' && c.logoText) o.logo = { text: c.logoText, at: c.logoAt };
    if (c.logoMode === 'image') o.logo = { src: logo.data || 'assets/logo.' + logo.ext, at: c.logoAt, height: c.logoH };
    const h = band(c.hL, c.hC, c.hR); if (h) o.header = h;
    const f = band(c.fL, c.fC, c.fR); if (f) o.footer = f;
    if (c.pn) o.pageNumber = { format: c.pnFormat || '{n} / {N}', at: c.pnAt };
    if (c.sections !== 'none') o.sections = { at: c.sections };
    if (c.progress !== 'none') o.progress = c.progress;
    if (c.rule) o.rule = true;
    if (!Object.keys(o).length) return null;
    const hide = [c.hideFirst && 'first', c.hideLast && 'last'].filter(Boolean);
    if (hide.length) o.hideOn = hide;
    return o;
  }

  /* ---------- 导出 ---------- */
  const q = (s) => JSON.stringify(s);
  function themeYaml() {
    const t = tokens();
    const p = presets.find((x) => x.id === S.preset);
    const L = [
      '# html_ppt 主题配置 —— 由主页「主题与页面元素」生成',
      '# 用法：放进 decks/<name>/，并在 deck.yaml 的 deck: 下加一行   theme: theme.yaml',
      '# 或用命令新建：npm run new -- <name> --theme theme.yaml',
      '# 种子色  主色 ' + S.seeds.accent + ' · 辅色 ' + S.seeds.accent2 + ' / ' + S.seeds.accent3 + ' / ' + S.seeds.accent4 + ' · 背景 ' + S.seeds.bg + ' · 文字 ' + S.seeds.ink,
      'label: ' + q(p ? p.label : '自定义'),
      'tokens:',
    ];
    Object.keys(t.light).forEach((k) => L.push('  ' + k + ': ' + q(t.light[k])));
    L.push('tokensDark:');
    Object.keys(t.dark).forEach((k) => L.push('  ' + k + ': ' + q(t.dark[k])));
    const c = chromeCfg();
    if (c) {
      L.push('chrome:');
      if (c.logo) L.push('  logo: { ' + (c.logo.text ? 'text: ' + q(c.logo.text) : 'src: ' + q('assets/logo.' + logo.ext) + ', height: ' + c.logo.height) + ', at: ' + c.logo.at + ' }');
      ['header', 'footer'].forEach((b) => c[b] && L.push('  ' + b + ': { ' + Object.keys(c[b]).map((k) => k + ': ' + q(c[b][k])).join(', ') + ' }'));
      if (c.pageNumber) L.push('  pageNumber: { format: ' + q(c.pageNumber.format) + ', at: ' + c.pageNumber.at + ' }');
      if (c.sections) L.push('  sections: { at: ' + c.sections.at + ' }');
      if (c.progress) L.push('  progress: ' + c.progress);
      if (c.rule) L.push('  rule: true');
      if (c.hideOn) L.push('  hideOn: [' + c.hideOn.join(', ') + ']');
    }
    return L.join('\n') + '\n';
  }
  function download(name, text, type) {
    const blob = text instanceof Blob ? text : new Blob([text], { type: type || 'text/yaml;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /* ---------- 预览同步 ---------- */
  function post(msg) { try { frame.contentWindow.postMessage(msg, '*'); } catch (e) { /* 尚未加载 */ } }
  function sync() {
    post({ htmlppt: 'theme', tokens: tokens() });
    post({ htmlppt: 'chrome', chrome: chromeCfg() });
  }
  function slide(i) { try { frame.contentWindow.postMessage(JSON.stringify({ method: 'slide', args: [i] }), '*'); } catch (e) { /* ignore */ } }

  /* ---------- 渲染 ---------- */
  const esc = U.esc;
  function swatch(seeds) {
    const t = deriveTheme(seeds).light;
    return '<div class="sw">' + [t.bg, t.accent, t['accent-2'], t['accent-3'], t['accent-4']].map((c) => '<i style="background:' + c + '"></i>').join('') + '</div>';
  }
  function chip(label, ratio, good, ok) {
    const cls = ratio >= good ? 'ok' : ratio >= ok ? '' : 'warn';
    return '<span class="chip ' + cls + '"><i>' + (ratio >= ok ? '✓' : '!') + '</i>' + label + ' ' + ratio.toFixed(1) + ':1</span>';
  }
  function renderColors() {
    const s = S.seeds;
    return '<h4>配色方案</h4><div class="presets">' + presets.map((p) => '<button class="preset' + (S.preset === p.id ? ' on' : '') + '" data-preset="' + p.id + '" title="' + esc(p.desc || '') + '">' + swatch(p.seeds) + '<span>' + esc(p.label) + '</span></button>').join('') + '</div>' +
      '<h4>自定义颜色' + (S.preset === 'custom' ? '（已改动）' : '') + '</h4><div class="colors">' + COLORS.map((c) => '<div class="crow"><label>' + c[1] + '<small>' + c[2] + '</small></label><input type="color" data-seed="' + c[0] + '" value="' + s[c[0]] + '"><input type="text" data-seedtx="' + c[0] + '" value="' + s[c[0]] + '" maxlength="7" spellcheck="false"></div>').join('') + '</div>' +
      '<h4>可读性</h4><div class="chk">' + chip('文字 / 背景', contrast(s.ink, s.bg), 7, 4.5) + chip('主色 / 背景', contrast(s.accent, s.bg), 4.5, 3) + chip('白字 / 主色', contrast('#FFFFFF', s.accent), 4.5, 3) + '</div>' +
      '<p class="hint">深色页（如章节页）的颜色由这几个颜色自动推导：保持色相，提亮强调色，背景压暗。</p>';
  }
  function sel(id, val, opts) { return '<select id="' + id + '">' + opts.map((o) => '<option value="' + o[0] + '"' + (o[0] === val ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select>'; }
  function renderChrome() {
    const c = S.chrome;
    return '<h4>常用组合</h4><div class="combos">' + COMBOS.map((x, i) => '<button data-combo="' + i + '">' + x[0] + '</button>').join('') + '</div>' +
      '<h4>页码</h4><label class="toggle"><input type="checkbox" data-c="pn"' + (c.pn ? ' checked' : '') + '>显示页码（按页计数，不是按动画步骤）</label>' +
      (c.pn ? '<div class="field"><span>格式</span><input type="text" data-c="pnFormat" value="' + esc(c.pnFormat) + '"></div><div class="field"><span>位置</span>' + sel('pnAt', c.pnAt, AT) + '</div>' : '') +
      '<h4>Logo（每页相同）</h4><div class="field"><span>类型</span>' + sel('logoMode', c.logoMode, [['none', '无'], ['text', '文字 Logo'], ['image', '图片 Logo']]) + '</div>' +
      (c.logoMode === 'text' ? '<div class="field"><span>文字</span><input type="text" data-c="logoText" value="' + esc(c.logoText) + '"></div>' : '') +
      (c.logoMode === 'image' ? '<div class="field"><span>图片</span><input type="file" id="logoFile" accept="image/*"></div><div class="field"><span>高度</span><input type="text" data-c="logoH" value="' + c.logoH + '"></div>' + (logo.data ? '<p class="hint">导出的 theme.yaml 引用 <code>assets/logo.' + logo.ext + '</code>，请把这张图放进项目的 assets/（<a href="#" id="dlLogo" style="color:var(--accent)">下载 logo 文件</a>）。</p>' : '<p class="hint">选一张 PNG / SVG；预览立即生效。</p>') : '') +
      (c.logoMode !== 'none' ? '<div class="field"><span>位置</span>' + sel('logoAt', c.logoAt, AT) + '</div>' : '') +
      '<h4>页眉 / 页脚文字</h4><p class="hint" style="margin:0 0 8px">可用：<code>{title}</code> <code>{subtitle}</code> <code>{author}</code> <code>{date}</code> <code>{section}</code> <code>{n}</code> <code>{N}</code></p>' +
      '<div class="field"><span>页眉</span><div class="three"><input type="text" data-c="hL" placeholder="左" value="' + esc(c.hL) + '"><input type="text" data-c="hC" placeholder="中" value="' + esc(c.hC) + '"><input type="text" data-c="hR" placeholder="右" value="' + esc(c.hR) + '"></div></div>' +
      '<div class="field"><span>页脚</span><div class="three"><input type="text" data-c="fL" placeholder="左" value="' + esc(c.fL) + '"><input type="text" data-c="fC" placeholder="中" value="' + esc(c.fC) + '"><input type="text" data-c="fR" placeholder="右" value="' + esc(c.fR) + '"></div></div>' +
      '<h4>章节导航</h4><div class="field"><span>位置</span>' + sel('sections', c.sections, [['none', '无'], ['footer', '页脚（推荐）'], ['header', '页眉']]) + '</div><p class="hint">一排章节标签，当前章节高亮，换章节时高亮块滑动过去；点标签可跳到该章。章节名取自各 scene 的 <code>section:</code>（至少两个）。</p>' +
      '<h4>进度与细节</h4><div class="field"><span>进度</span>' + sel('progress', c.progress, [['none', '无'], ['bar', '底部进度条'], ['dots', '页脚圆点（占用页脚中间）']]) + '</div>' +
      '<label class="toggle"><input type="checkbox" data-c="rule"' + (c.rule ? ' checked' : '') + '>页眉页脚分隔细线</label>' +
      '<label class="toggle"><input type="checkbox" data-c="hideFirst"' + (c.hideFirst ? ' checked' : '') + '>封面不显示</label>' +
      '<label class="toggle"><input type="checkbox" data-c="hideLast"' + (c.hideLast ? ' checked' : '') + '>结尾页不显示</label>';
  }
  function render(keepFocus) {
    const pane = $('#studio-pane');
    const active = keepFocus && document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.c || document.activeElement.dataset.seedtx : null;
    const pos = pane.scrollTop;
    pane.innerHTML = tab === 'color' ? renderColors() : renderChrome();
    pane.scrollTop = pos;
    document.querySelectorAll('#studio-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === tab));
    if (active) {
      const el = pane.querySelector('[data-c="' + active + '"],[data-seedtx="' + active + '"]');
      if (el) { el.focus(); try { el.setSelectionRange(el.value.length, el.value.length); } catch (e) { /* color 等 */ } }
    }
    $('#studio-use').innerHTML = '<b>deck.yaml</b>\ndeck:\n  theme: theme.yaml   # 下载的文件放在同一目录';
  }
  function changed() { S.dirty = true; save(); sync(); }

  /* ---------- 事件 ---------- */
  const pane = $('#studio-pane');
  $('#studio-tabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; tab = b.dataset.t; render(); });
  pane.addEventListener('click', (e) => {
    const p = e.target.closest('[data-preset]');
    if (p) {
      const pr = presets.find((x) => x.id === p.dataset.preset);
      S.preset = pr.id; S.seeds = { ...pr.seeds };
      changed(); render();
      return;
    }
    const cb = e.target.closest('[data-combo]');
    if (cb) { S.chrome = { ...DEF_CHROME, logoText: S.chrome.logoText, ...COMBOS[+cb.dataset.combo][1] }; changed(); render(); return; }
    if (e.target.id === 'dlLogo') { e.preventDefault(); fetch(logo.data).then((r) => r.blob()).then((b) => download('logo.' + logo.ext, b)); }
  });
  pane.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.seed) {
      S.seeds[t.dataset.seed] = t.value.toUpperCase(); S.preset = 'custom';
      const tx = pane.querySelector('[data-seedtx="' + t.dataset.seed + '"]'); if (tx) tx.value = t.value.toUpperCase();
      changed();
    } else if (t.dataset.seedtx) {
      let v = t.value.trim(); if (v && v[0] !== '#') v = '#' + v;
      if (/^#[0-9a-fA-F]{6}$/.test(v)) {
        S.seeds[t.dataset.seedtx] = v.toUpperCase(); S.preset = 'custom';
        const cp = pane.querySelector('[data-seed="' + t.dataset.seedtx + '"]'); if (cp) cp.value = v;
        changed();
      }
    } else if (t.dataset.c) {
      const k = t.dataset.c;
      S.chrome[k] = t.type === 'checkbox' ? t.checked : k === 'logoH' ? Math.max(16, Math.min(120, Number(t.value) || 40)) : t.value;
      changed();
      if (t.type === 'checkbox' && k === 'pn') render();
    }
  });
  pane.addEventListener('change', (e) => {
    const t = e.target;
    if (t.id === 'logoFile' && t.files[0]) {
      const f = t.files[0];
      logo.ext = (f.name.split('.').pop() || 'png').toLowerCase();
      const r = new FileReader();
      r.onload = () => { logo.data = r.result; changed(); render(); };
      r.readAsDataURL(f);
    } else if (t.tagName === 'SELECT') {
      const map = { pnAt: 'pnAt', logoMode: 'logoMode', logoAt: 'logoAt', progress: 'progress', sections: 'sections' };
      if (map[t.id]) { S.chrome[map[t.id]] = t.value; changed(); if (t.id === 'logoMode') render(); }
    }
  });
  $('#studio-pager').innerHTML = SLIDES.map((s, i) => '<button data-i="' + i + '"' + (i === 0 ? ' class="on"' : '') + '>' + s + '</button>').join('');
  $('#studio-pager').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) slide(+b.dataset.i); });
  window.addEventListener('message', (e) => {
    let d = e.data; if (typeof d === 'string') { try { d = JSON.parse(d); } catch (x) { return; } }
    if (!d || d.namespace !== 'reveal' || !d.state) return;
    document.querySelectorAll('#studio-pager button').forEach((b) => b.classList.toggle('on', +b.dataset.i === d.state.indexh));
  });
  $('#dl-theme').addEventListener('click', () => { download('theme.yaml', themeYaml()); U.toast('已下载 theme.yaml'); });
  $('#cp-theme').addEventListener('click', () => U.copyText(themeYaml(), () => U.toast('已复制 theme.yaml 内容')));
  $('#cp-snip').addEventListener('click', () => U.copyText('deck:\n  title: 我的演示\n  theme: theme.yaml\n', () => U.toast('已复制 deck.yaml 片段')));
  $('#reset-theme').addEventListener('click', () => { S = { preset: presets[0].id, seeds: { ...presets[0].seeds }, chrome: { ...DEF_CHROME }, dirty: false }; logo = { data: null, ext: 'png' }; save(); sync(); render(); });

  frame = $('#studio-frame');
  frame.addEventListener('load', () => { sync(); setTimeout(sync, 300); });
  frame.src = H.base + 'theme-preview/site/index.html?embed';
  window.Studio = { yaml: themeYaml, dirty: () => S.dirty };
  if (S.dirty && $('#new-theme')) $('#new-theme').checked = true;
  render();
})();
