/* html_ppt 浏览器端运行时：初始化 Reveal，并提供只按 data-id 匹配的 morph 规则。 */
(function () {
  // Reveal 默认还会按文字内容、图片 src 自动匹配，容易造成嵌套重复匹配；这里只认 data-id。
  // 尺寸用 width/height 插值（而不是 scale），文字在 morph 中会重新排版而不是被拉伸。
  var STYLES = ['opacity', 'color', 'background-color', 'padding', 'font-size', 'line-height', 'letter-spacing',
    'border-width', 'border-color', 'border-radius', 'outline', 'outline-offset', 'width', 'height'];

  // 图片内部的 zoom（.img-z）：相对父容器插值 left/top/尺寸，而不是用屏幕坐标做 FLIP，
  // 这样父容器同时移动时不会叠加两次位移。
  var NESTED = { translate: false, scale: false, styles: ['left', 'top', 'width', 'height', 'opacity', 'filter'] };

  function matcher(from, to) {
    var map = {};
    var pairs = [];
    from.querySelectorAll('[data-id]').forEach(function (el) { map[el.getAttribute('data-id')] = el; });
    to.querySelectorAll('[data-id]').forEach(function (el) {
      var f = map[el.getAttribute('data-id')];
      if (!f || f.nodeName !== el.nodeName) return;
      pairs.push({ from: f, to: el, options: el.classList.contains('img-z') ? NESTED : { scale: false, styles: STYLES } });
    });
    return pairs;
  }


  /* ---------------- 页面元素（chrome）：Logo、页眉页脚、页码、进度 ----------------
   * 配置来自 deck.chrome / theme.chrome（见 schema.ts 的 Chrome）；每个 section 在 .stage 里放一个 .chrome。
   * .chrome 带 data-id，同一 Scene 内 State 之间按 data-id 配对，不会闪动。 */
  var embedded = false;
  var CHROME_AT = ['header-left', 'header-center', 'header-right', 'footer-left', 'footer-center', 'footer-right'];

  function fmt(tpl, sec, cfg) {
    return String(tpl).replace(/\{(n|N|title|subtitle|author|date|section)\}/g, function (_, k) {
      if (k === 'n') return sec.getAttribute('data-n') || '';
      if (k === 'N') return String(cfg.total || '');
      if (k === 'section') return sec.getAttribute('data-section') || '';
      return (cfg.meta && cfg.meta[k]) || '';
    });
  }

  function chromeFor(sec, cfg) {
    var flag = sec.getAttribute('data-chrome');
    if (!cfg.chrome || flag === 'off') return null;
    var hide = cfg.chrome.hideOn || [];
    var n = Number(sec.getAttribute('data-n')) || 0;
    if (hide.indexOf(sec.getAttribute('data-scene')) >= 0 || (hide.indexOf('first') >= 0 && n === 1) || (hide.indexOf('last') >= 0 && n === Number(cfg.total))) return null;
    var c = {};
    Object.keys(cfg.chrome).forEach(function (k) { c[k] = cfg.chrome[k]; });
    if (flag) {
      var o = JSON.parse(flag);
      Object.keys(o).forEach(function (k) { c[k] = (k === 'header' || k === 'footer') ? Object.assign({}, c[k], o[k]) : o[k]; });
    }
    return c;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  /** 页眉页脚文字：**强调** 渲染为主色加粗（用 DOM 构造，不经 innerHTML） */
  function rich(node, text) {
    String(text).split(/(\*\*[^*]+\*\*)/).forEach(function (part) {
      if (!part) return;
      if (/^\*\*[^*]+\*\*$/.test(part)) node.appendChild(el('strong', 'ch-em', part.slice(2, -2)));
      else node.appendChild(document.createTextNode(part));
    });
    return node;
  }

  function buildChrome(sec, cfg) {
    var stage = sec.querySelector('.stage');
    if (!stage) return;
    var old = stage.querySelector(':scope > .chrome');
    if (old) old.remove();
    var c = chromeFor(sec, cfg);
    if (!c) return;
    var cells = {};
    CHROME_AT.forEach(function (a) { cells[a] = []; });
    ['header', 'footer'].forEach(function (band) {
      ['left', 'center', 'right'].forEach(function (pos) {
        var t = c[band] && c[band][pos];
        if (t) cells[band + '-' + pos].push(rich(el('span', 'ch-it ch-tx'), fmt(t, sec, cfg)));
      });
    });
    var pn = c.pageNumber;
    if (pn) {
      var po = pn === true ? {} : pn;
      cells[po.at || 'footer-right'].push(el('span', 'ch-it ch-tx ch-pn', fmt(po.format || '{n} / {N}', sec, cfg)));
    }
    var lg = c.logo;
    if (lg && (lg.src || lg.text)) {
      var at = lg.at || 'header-right';
      var node;
      if (lg.src) {
        node = el('img', 'ch-it ch-logo');
        node.src = lg.src;
        node.alt = '';
        node.style.height = (lg.height || 40) + 'px';
      } else node = el('span', 'ch-it ch-wm', lg.text);
      if (/left$/.test(at)) cells[at].unshift(node); else cells[at].push(node);
    }
    var navAt = null;
    var names = sectionNames();
    if (c.sections && names.length > 1) {
      navAt = (c.sections === true || !c.sections.at) ? 'footer' : c.sections.at;
      var nav = el('div', 'ch-it ch-nav ch-still');
      nav.setAttribute('data-active', names.indexOf(sec.getAttribute('data-section') || ''));
      nav.appendChild(el('i', 'ch-pill'));
      names.forEach(function (nm, i) {
        var t = el('span', 'ch-tab', nm);
        t.setAttribute('data-i', i);
        nav.appendChild(t);
      });
      cells[navAt + '-center'] = [nav];
    }
    var total = Number(cfg.total) || 0, n = Number(sec.getAttribute('data-n')) || 1;
    var prog = c.progress;
    if (prog === 'dots' && (cells['footer-center'].length || total > 30 || total < 2)) prog = 'bar';
    if (prog === 'dots') {
      var dots = el('span', 'ch-it ch-dots');
      for (var i = 1; i <= total; i++) dots.appendChild(el('i', i === n ? 'on' : i < n ? 'done' : ''));
      cells['footer-center'].push(dots);
    }

    var root = el('div', 'chrome' + (c.caps ? ' ch-caps' : ''));
    root.setAttribute('data-id', (sec.getAttribute('data-scene') || '') + '.__chrome');
    root.setAttribute('aria-hidden', 'true');
    ['header', 'footer'].forEach(function (band) {
      var parts = ['left', 'center', 'right'].map(function (p) { return cells[band + '-' + p]; });
      if (!parts[0].length && !parts[1].length && !parts[2].length) return;
      var b = el('div', 'ch-band ch-' + band + (c.rule ? ' ch-rule' : '') + (navAt === band ? ' ch-hasnav' : ''));
      parts.forEach(function (items, i) {
        var cell = el('div', 'ch-cell ch-' + ['l', 'c', 'r'][i]);
        items.forEach(function (it) { cell.appendChild(it); });
        b.appendChild(cell);
      });
      root.appendChild(b);
    });
    if (prog === 'bar' && total > 0) {
      var bar = el('div', 'ch-bar');
      var fill = el('i');
      fill.style.width = (n / total * 100) + '%';
      bar.appendChild(fill);
      root.appendChild(bar);
    }
    stage.insertBefore(root, stage.firstChild);
  }

  /* 章节导航：章节名按出现顺序取自各 section 的 data-section；高亮块从上一章滑到当前章 */
  function sectionNames() {
    var out = [];
    document.querySelectorAll('.reveal .slides section.sc').forEach(function (sec) {
      var s = sec.getAttribute('data-section');
      if (s && out.indexOf(s) < 0) out.push(s);
    });
    return out;
  }
  function setNav(nav, idx, animate) {
    nav.classList.toggle('ch-still', !animate);
    var tabs = nav.querySelectorAll('.ch-tab'), pill = nav.querySelector('.ch-pill');
    tabs.forEach(function (t, i) { t.classList.toggle('on', i === idx); });
    var t = tabs[idx];
    if (!t) { pill.style.opacity = 0; return; }
    pill.style.cssText = 'opacity:1;left:' + t.offsetLeft + 'px;top:' + t.offsetTop + 'px;width:' + t.offsetWidth + 'px;height:' + t.offsetHeight + 'px';
  }
  function syncNav(cur, prev) {
    var nav = cur && cur.querySelector('.ch-nav');
    if (!nav) return;
    var to = Number(nav.getAttribute('data-active'));
    var pn = prev && prev !== cur && prev.querySelector('.ch-nav');
    var from = pn ? Number(pn.getAttribute('data-active')) : to;
    setNav(nav, from, false);
    void nav.offsetWidth;
    setNav(nav, to, true);
  }
  function wireNav() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('.ch-tab');
      if (!t) return;
      var name = t.textContent;
      var first = [].filter.call(document.querySelectorAll('.reveal .slides section.sc'), function (s) { return s.getAttribute('data-section') === name; })[0];
      if (first) window.Reveal.slide(window.Reveal.getIndices(first).h);
    });
  }

  function buildAllChrome(cfg) {
    document.querySelectorAll('.reveal .slides section.sc').forEach(function (sec) { buildChrome(sec, cfg); });
  }

  /* ---------------- 换主题预览：主页的「主题与页面元素」通过 postMessage 驱动 ---------------- */
  function tokenCss(map) {
    return Object.keys(map).map(function (k) { return '--c-' + k + ':' + map[k] + ';'; }).join('');
  }
  function applyTheme(tokens) {
    var st = document.getElementById('htmlppt-theme');
    if (!st) { st = document.createElement('style'); st.id = 'htmlppt-theme'; document.head.appendChild(st); }
    var dark = Object.assign({}, tokens.light, tokens.dark);
    st.textContent = '.reveal{' + tokenCss(tokens.light) + '}\n.reveal .sc.theme-dark{' + tokenCss(dark) + '}';
    document.querySelectorAll('.reveal .slides section.sc').forEach(function (sec) {
      var map = sec.classList.contains('theme-dark') ? dark : tokens.light;
      var key = sec.getAttribute('data-bg') || 'bg';
      var color = map[key] || key;
      sec.setAttribute('data-background-color', color);
      var bgEl = window.Reveal && Reveal.getSlideBackground && Reveal.getSlideBackground(sec);
      if (bgEl) bgEl.style.backgroundColor = color;
    });
  }

  function onMessage(cfg) {
    window.addEventListener('message', function (e) {
      var d = e.data;
      if (typeof d === 'string') { try { d = JSON.parse(d); } catch (x) { return; } }
      if (!d || !d.htmlppt) return;
      if (d.htmlppt === 'theme') applyTheme(d.tokens);
      else if (d.htmlppt === 'chrome') {
        cfg.chrome = d.chrome || undefined;
        // 自带页码 / 进度与 Reveal 的不同时显示
        window.Reveal.configure({
          slideNumber: cfg.slideNumber && !(cfg.chrome && cfg.chrome.pageNumber) ? 'c/t' : false,
          progress: !embedded && !(cfg.chrome && cfg.chrome.progress && cfg.chrome.progress !== 'none')
        });
        buildAllChrome(cfg);
        syncNav(window.Reveal.getCurrentSlide(), null);
      }
    });
  }

  function init(cfg) {
    var params = new URLSearchParams(location.search);
    var qa = params.has('qa');
    var opts = {
      width: cfg.stage.w,
      height: cfg.stage.h,
      margin: 0,
      minScale: 0.05,
      maxScale: 4,
      center: true,
      hash: true,
      controls: true,
      controlsTutorial: false,
      progress: !(cfg.chrome && cfg.chrome.progress && cfg.chrome.progress !== 'none'),
      // 启用了自己的页码 / 进度时，关掉 Reveal 自带的（它按 State 计数，与"第几页"对不上）
      slideNumber: cfg.slideNumber && !(cfg.chrome && cfg.chrome.pageNumber) ? 'c/t' : false,
      transition: 'fade',
      backgroundTransition: 'fade',
      autoAnimateMatcher: matcher,
      autoAnimateUnmatched: true,
      pdfSeparateFragments: true,
      // 允许外层页面（效果库浏览器）通过 postMessage 控制翻页并接收进度事件
      postMessage: true,
      postMessageEvents: true,
      plugins: window.RevealNotes ? [window.RevealNotes] : []
    };
    if (qa) {
      Object.assign(opts, { controls: false, progress: false, slideNumber: false, transition: 'none', backgroundTransition: 'none', hash: false });
      if (!params.has('motion')) {
        opts.autoAnimate = false;
        document.documentElement.classList.add('qa');
      }
    }
    buildAllChrome(cfg);
    onMessage(cfg);
    // ?embed：被主页的预览框嵌入——不显示 Reveal 自带的箭头与进度条（进度由 chrome 负责）
    if (params.has('embed')) { opts.controls = false; opts.progress = false; embedded = true; }
    window.__htmlppt = { ready: false, cfg: cfg };
    // steps 里 auto: true 的前几次点击：进入该 State 后按时间表自动播放（只在向前翻页、尚无片段显示时；QA 截图模式不触发）
    var autoTimers = [];
    function playAuto(slide) {
      autoTimers.forEach(clearTimeout);
      autoTimers = [];
      var at = slide && slide.getAttribute('data-auto-at');
      if (!at || qa) return;
      var idx = Reveal.getIndices();
      if (idx.f !== undefined && idx.f >= 0) return;
      at.split(',').forEach(function (t) {
        autoTimers.push(setTimeout(function () {
          if (Reveal.getCurrentSlide() === slide) Reveal.nextFragment();
        }, Number(t)));
      });
    }
    Reveal.initialize(opts).then(function () {
      syncNav(Reveal.getCurrentSlide(), null);
      playAuto(Reveal.getCurrentSlide());
      Reveal.on('slidechanged', function (e) { syncNav(e.currentSlide, e.previousSlide); playAuto(e.currentSlide); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { syncNav(Reveal.getCurrentSlide(), null); });
      wireNav();
      if (window.HtmlPptCharts) {
        window.HtmlPptCharts.init();
        window.HtmlPptCharts.enter(Reveal.getCurrentSlide(), null);
        Reveal.on('slidechanged', function (e) { window.HtmlPptCharts.enter(e.currentSlide, e.previousSlide); });
      }
      window.__htmlppt.ready = true;
    });
  }

  window.HtmlPpt = { init: init };
})();
