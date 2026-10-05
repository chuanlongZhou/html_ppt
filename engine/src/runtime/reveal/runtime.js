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
      progress: true,
      slideNumber: cfg.slideNumber ? 'c/t' : false,
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
    window.__htmlppt = { ready: false, cfg: cfg };
    Reveal.initialize(opts).then(function () {
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
