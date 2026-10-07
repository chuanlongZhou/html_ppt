/* html_ppt 主页逻辑：演示列表、页面结构与动画交互（效果库）、搜索、导航高亮、语言切换。主题工作台见 studio.js。
 * 数据来自 window.HOME（由 engine/src/home.ts 内嵌）；dev 模式下通过 /__home.json 与 SSE 局部刷新，不整页重载。
 * 语言：界面默认英文，可切到中文（存 localStorage）；静态文字由 CSS 按 data-lang 切换，脚本生成的文字用 t(en, zh) 并在切换时重绘。
 * 效果库条目（标题、提示词）始终中英同时显示。 */
(function () {
  const H = window.HOME;
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let v = Date.now() % 1e6;
  let query = '';
  let fxCat = 'all';

  /* ---------- 语言 ---------- */
  let lang = document.documentElement.getAttribute('data-lang') === 'zh' ? 'zh' : 'en';
  const t = (en, zh) => (lang === 'zh' ? zh : en);
  const cat = (c) => (lang === 'zh' || !H.categoriesEn ? H.categories[c] : H.categoriesEn[c]);
  function setLang(l) {
    lang = l;
    document.documentElement.setAttribute('data-lang', l);
    document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en';
    try { localStorage.setItem('htmlppt.lang', l); } catch (e) { /* 无痕模式：忽略 */ }
    applyAttrs();
    renderDecks();
    renderLib();
    document.dispatchEvent(new CustomEvent('htmlppt:lang'));
  }
  function applyAttrs() {
    $('#q').placeholder = t('Search layouts & effects: “bullets”, “timeline”…', '搜索页面与效果：「逐条出现」「时间线」…');
  }
  /** 效果库条目的中文提示词（英文另在 en.prompts 里） */
  const zhPrompts = (i) => i.prompts.filter((p) => /[^\x00-\x7F]/.test(p));

  /* ---------- 小工具 ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('on'), 1800);
  }
  function copyText(text, done) {
    const ok = () => done && done();
    if (navigator.clipboard && window.isSecureContext !== false) navigator.clipboard.writeText(text).then(ok, fallback);
    else fallback();
    function fallback() {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); ok(); } catch (e) { toast(t('Copy failed — please select manually', '复制失败，请手动选择')); }
      ta.remove();
    }
  }
  window.HomeUI = { toast, copyText, esc, t, lang: () => lang };

  /* ---------- 演示卡片 ---------- */
  function deckCard(d) {
    const bad = d.errors > 0;
    const stat = bad ? `<span class="st bad">${t(d.errors + ' errors', d.errors + ' 个错误')}</span>` : `<span class="st ok">${t('Passed', '通过')}</span>`;
    // 没有缩略图时（如线上构建没有浏览器）显示标题，而不是一块灰底
    const ph = H.dev ? t('Rendering thumbnail…', '缩略图生成中…') : `<span class="ph-title">${esc(d.title)}</span>`;
    return `<a class="card" href="${esc(H.deckBase.replace('{name}', d.name))}">
      <div class="thumb" style="background-image:url(${H.base}thumbs/deck-${esc(d.name)}.png?v=${v})"><div class="ph">${ph}</div><span class="badge">${t(d.pages + ' slides', d.pages + ' 页')}</span>${bad ? `<span class="badge bad">${t('Build failed', '构建失败')}</span>` : ''}</div>
      <div class="meta"><b>${esc(d.title)}</b><span class="id mono">${esc(d.where)}/${esc(d.name)}</span><div>${stat}${d.warnings ? ` <span class="st" style="color:var(--faint)">· ${t(d.warnings + ' warnings', d.warnings + ' 个提示')}</span>` : ''}</div></div></a>`;
  }
  function renderDecks() {
    const box = $('#deck-cards');
    if (!box) return;
    box.innerHTML = H.decks.map(deckCard).join('');
    probeThumbs(box);
    const n = $('#deck-n');
    if (n) n.textContent = t(H.decks.length + ' decks', H.decks.length + ' 个演示');
  }

  /* ---------- 效果库卡片 ---------- */
  function libCard(i) {
    const clicks = i.clicks.reduce((a, b) => a + b, 0);
    const badge = (i.states > 1 ? t(i.states + ' States', i.states + ' 个 State') : '') + (clicks ? (i.states > 1 ? ' · ' : '') + t(clicks + (clicks > 1 ? ' clicks' : ' click'), clicks + ' 次点击') : '');
    const last = i.states - 1;
    const live = `${H.base}e/${i.id}/site/index.html?qa&embed&at=${last},${(i.clicks[last] || 0) - 1}`;
    const tags = i.en ? i.en.prompts.slice(0, 2).concat(zhPrompts(i).slice(0, 2)) : i.prompts.slice(0, 3);
    return `<div class="card"><a href="${H.base}view.html#${i.id}" aria-label="${esc(i.en ? i.en.title : i.title)}">
      <div class="thumb" data-live="${esc(live)}" style="background-image:url(${H.base}thumbs/${i.id}.png?v=${v})"><div class="ph">${H.dev ? t('Rendering thumbnail…', '缩略图生成中…') : ''}</div>${badge ? `<span class="badge">${badge}</span>` : ''}${i.ok ? '' : `<span class="badge bad">${t('Build failed', '构建失败')}</span>`}</div>
      <div class="meta"><b>${esc(i.en ? i.en.title : i.title)}</b>${i.en ? `<span class="zh">${esc(i.title)}</span>` : ''}<span class="id mono">${esc(i.id)}</span><div class="tags">${tags.map((p) => `<span>${esc(p)}</span>`).join('')}</div></div></a>
      <button class="copy" data-use="${esc(i.use)}" title="${t('Copy a one-line call; paste it under scenes: in deck.yaml', '复制一行调用，粘贴到 deck.yaml 的 scenes: 下')}">${t('Copy', '复制调用')}</button></div>`;
  }
  /* 缩略图：PNG 能加载就用它；没有 PNG（线上构建没有浏览器截图）时，静态站点改用实时预览——
   * 进入视口才加载的 iframe，按卡片宽度缩放，直接停在最后一个 State 的最终画面（?at=h,f）。 */
  const io = window.IntersectionObserver ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); mountLive(e.target); } }), { rootMargin: '300px' }) : null;
  const ro = window.ResizeObserver ? new ResizeObserver((es) => es.forEach((e) => fitLive(e.target))) : null;
  function fitLive(th) {
    const f = th.querySelector('iframe.live');
    if (f) f.style.transform = 'scale(' + th.clientWidth / 960 + ')';
  }
  function mountLive(th) {
    if (th.querySelector('iframe.live')) return;
    const f = document.createElement('iframe');
    f.className = 'live';
    f.tabIndex = -1;
    f.setAttribute('aria-hidden', 'true');
    f.setAttribute('scrolling', 'no');
    f.src = th.dataset.live;
    f.onload = () => th.querySelector('.ph') && th.querySelector('.ph').remove();
    th.insertBefore(f, th.firstChild);
    fitLive(th);
    if (ro) ro.observe(th);
  }
  function probeThumbs(root) {
    root.querySelectorAll('.thumb').forEach((th) => {
      const m = /url\((.*)\)/.exec(th.getAttribute('style') || '');
      if (!m) return;
      const img = new Image();
      img.onload = () => th.querySelector('.ph') && th.querySelector('.ph').remove();
      img.onerror = () => { if (!H.dev && th.dataset.live) io ? io.observe(th) : mountLive(th); };
      img.src = m[1].replace(/^["']|["']$/g, '');
    });
  }
  const match = (i) => !query || [i.title, i.id, i.prompts.join(' '), i.use_when, i.en ? i.en.title + ' ' + i.en.prompts.join(' ') + ' ' + i.en.use_when : ''].join(' ').toLowerCase().includes(query);

  function renderGroups(cats, items) {
    let html = '';
    cats.forEach((c) => {
      const C = cat(c);
      const ci = items.filter((i) => i.category === c);
      if (!ci.length) return;
      if (cats.length > 1) html += `<div class="grp" style="font-size:15px;color:var(--ink)">${esc(C.label)} <span style="font-weight:400;color:var(--faint)">${esc(C.desc)}</span></div>`;
      Object.keys(C.groups).forEach((g) => {
        const gi = ci.filter((i) => i.group === g);
        if (!gi.length) return;
        html += `<div class="grp">${esc(C.groups[g])}</div><div class="grid">${gi.map(libCard).join('')}</div>`;
      });
    });
    return html || `<div class="empty">${t('No matching entries', '没有匹配的条目')}</div>`;
  }
  function renderLib() {
    const items = H.items.filter(match);
    $('#pages-list').innerHTML = renderGroups(['page'], items);
    const fxCats = Object.keys(H.categories).filter((c) => c !== 'page');
    const tabs = $('#fx-tabs');
    tabs.innerHTML = ['<button data-c="all"' + (fxCat === 'all' ? ' class="on"' : '') + '>' + t('All', '全部') + '</button>']
      .concat(fxCats.map((c) => `<button data-c="${c}"${fxCat === c ? ' class="on"' : ''}>${esc(cat(c).label)} ${H.items.filter((i) => i.category === c).length}</button>`)).join('');
    $('#fx-list').innerHTML = renderGroups(fxCat === 'all' ? fxCats : [fxCat], items);
    const np = items.filter((i) => i.category === 'page').length;
    const nf = items.length - np;
    $('#pages-n').textContent = t(np + ' layouts', np + ' 个页面');
    $('#fx-n').textContent = t(nf + ' effects', nf + ' 个效果');
    probeThumbs($('#pages-list'));
    probeThumbs($('#fx-list'));
  }

  /* ---------- 事件 ---------- */
  $('#fx-tabs').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    fxCat = b.dataset.c;
    renderLib();
  });
  $('#q').addEventListener('input', (e) => {
    query = e.target.value.trim().toLowerCase();
    renderLib();
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-use]');
    if (!b) return;
    e.preventDefault();
    copyText(b.dataset.use, () => {
      b.textContent = t('Copied', '已复制');
      b.classList.add('done');
      setTimeout(() => { b.textContent = t('Copy', '复制调用'); b.classList.remove('done'); }, 1300);
    });
  });
  document.querySelectorAll('[data-cmd]').forEach((el) => el.addEventListener('click', () => copyText(el.dataset.cmd, () => toast(t('Copied: ', '已复制：') + el.dataset.cmd))));
  $('#lang').addEventListener('click', () => setLang(lang === 'zh' ? 'en' : 'zh'));

  /* 导航高亮：当前滚动位置所在的区块 */
  const links = [...document.querySelectorAll('.nav a')];
  const secs = [...document.querySelectorAll('main section[id]')];
  let raf;
  function spy() {
    raf = 0;
    let cur = null;
    secs.forEach((s) => { if (s.getBoundingClientRect().top <= 140) cur = s.id; });
    links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + cur));
  }
  window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(spy); }, { passive: true });
  spy();

  /* ---------- 新建演示（仅 dev） ---------- */
  const nf = $('#new-form');
  if (nf) {
    nf.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = $('#new-name').value.trim();
      const withTheme = $('#new-theme').checked && window.Studio;
      const btn = nf.querySelector('button');
      btn.disabled = true;
      try {
        const r = await fetch('/__new', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, theme: withTheme ? window.Studio.yaml() : undefined }) });
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || t('Create failed', '创建失败'));
        toast(t('Created decks/' + name + ', loading…', '已创建 decks/' + name + '，正在加载…'));
        $('#new-name').value = '';
        refresh();
      } catch (err) {
        toast(String(err.message || err));
      }
      btn.disabled = false;
    });
  }

  /* ---------- dev：局部刷新 ---------- */
  let timer;
  async function refresh() {
    try {
      const j = await (await fetch('/__home.json', { cache: 'no-store' })).json();
      H.decks = j.decks;
      H.items = j.items;
      v = Date.now() % 1e6;
      renderDecks();
      renderLib();
    } catch (e) { /* 服务器重启中：忽略 */ }
  }
  if (H.dev && window.EventSource) {
    const es = new EventSource('/__events');
    es.onmessage = () => { clearTimeout(timer); timer = setTimeout(refresh, 250); };
  }

  applyAttrs();
  renderDecks();
  renderLib();
  try { if (location.hash.length > 1 && $(location.hash)) $(location.hash).scrollIntoView(); } catch (e) { /* 非法 hash */ }
})();
