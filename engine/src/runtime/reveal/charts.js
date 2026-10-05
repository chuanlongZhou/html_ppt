/* html_ppt 交互图表运行时（与 components/chart.ts 配套）
 * 数据规格由编译器写在 <script class="ch-spec">；这里负责：SVG 渲染、几何过渡（CSS transition）、
 * 悬停提示、点击高亮、图例开关、切换按钮、同页联动（link），以及进入页面时复位 / 从上一 State 过渡。 */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var instances = [];
  var measureCtx = document.createElement('canvas').getContext('2d');

  function svgEl(tag, parent, cls) {
    var e = document.createElementNS(NS, tag);
    if (cls) e.setAttribute('class', cls);
    if (parent) parent.appendChild(e);
    return e;
  }
  function parse(root, sel) {
    var n = root.querySelector(sel);
    return n ? JSON.parse(n.textContent) : null;
  }
  function fmt(v) {
    var r = Math.round(v * 100) / 100;
    return Math.abs(r) >= 1000 ? r.toLocaleString('zh-CN') : String(r);
  }
  function niceMax(v) {
    if (v <= 0) return 1;
    v = v * 1.08; // 留一点顶部空间给数值标签
    var p = Math.pow(10, Math.floor(Math.log10(v)));
    var n = v / p;
    var steps = [1, 1.2, 1.6, 2, 2.4, 3, 4, 5, 6, 8, 10];
    for (var i = 0; i < steps.length; i++) if (n <= steps[i]) return steps[i] * p;
    return 10 * p;
  }
  function authored(spec) {
    return { show: spec.show.slice(), highlight: spec.highlight };
  }

  function Chart(root) {
    this.root = root;
    this.spec = parse(root, '.ch-spec');
    this.prevSpec = parse(root, '.ch-prev');
    this.svg = root.querySelector('.ch-svg');
    this.barEl = root.querySelector('.ch-bar');
    this.tip = root.querySelector('.ch-tip');
    this.detailEl = root.querySelector('.ch-detail');
    this.marks = {};
    this.gAxis = svgEl('g', this.svg, 'ch-axis');
    this.gMarks = svgEl('g', this.svg, 'ch-marks');
    this.gLabels = svgEl('g', this.svg, 'ch-labels');
    this.state = authored(this.spec);
    this.draw(this.spec, this.state, false);
    if (this.spec.interactive) this.bind();
  }

  Chart.prototype.mark = function (key, tag, parent) {
    var m = this.marks[key];
    if (!m) {
      m = svgEl(tag, parent || this.gMarks, 'm');
      m.dataset.key = key;
      this.marks[key] = m;
    }
    m.dataset.live = '1';
    return m;
  };

  /** 计算几何并更新所有标记；animate=false 时先禁用过渡 */
  Chart.prototype.draw = function (spec, state, animate) {
    var self = this;
    var root = this.root;
    if (!animate) root.classList.add('ch-still');
    var size = spec.size;
    var hasBar = spec.switch || spec.legend;
    var W = spec.w;
    var H = spec.h - (hasBar ? 64 : 0) - (spec.source ? 44 : 0);
    this.svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    this.svg.setAttribute('width', W);
    this.svg.setAttribute('height', H);
    this.svg.style.height = H + 'px';
    for (var k in this.marks) this.marks[k].dataset.live = '';

    var kind = spec.kind;
    var cats = spec.categories;
    var series = spec.series;
    var visible = series.filter(function (s) { return state.show.indexOf(s.name) >= 0; });
    var all = [];
    series.forEach(function (s) { all = all.concat(s.values); });
    var vmin = spec.min;
    var vmax = spec.max != null ? spec.max : niceMax(Math.max.apply(null, all.concat([vmin + 1])));
    var hl = state.highlight;
    var labelsOn = spec.labels != null ? spec.labels : kind !== 'line' && cats.length * Math.max(visible.length, 1) <= 16;
    var font = getComputedStyle(root).fontFamily;
    measureCtx.font = size + 'px ' + font;
    var catW = Math.max.apply(null, cats.map(function (c) { return measureCtx.measureText(c).width; }));
    var m = kind === 'hbar' ? { l: Math.min(360, catW + 28), r: 70, t: 16, b: 44 } : { l: 84, r: 24, t: labelsOn ? 44 : 20, b: 56 };
    var pw = W - m.l - m.r;
    var ph = H - m.t - m.b;
    var val = function (v) { return (Math.max(vmin, Math.min(vmax, v)) - vmin) / (vmax - vmin || 1); };
    var dimOf = function (cat, sname) {
      if (hl == null) return 1;
      return hl === cat || hl === sname ? 1 : 0.22;
    };

    // 坐标轴与网格（直接重绘）
    this.gAxis.textContent = '';
    for (var i = 0; i <= 4; i++) {
      var t = vmin + ((vmax - vmin) * i) / 4;
      if (kind === 'hbar') {
        var gx = m.l + (pw * i) / 4;
        line(this.gAxis, gx, m.t, gx, m.t + ph, 'ch-grid');
        text(this.gAxis, fmt(t), gx, m.t + ph + 32, 'middle', 'ch-tick');
      } else {
        var gy = m.t + ph - (ph * i) / 4;
        line(this.gAxis, m.l, gy, m.l + pw, gy, i === 0 ? 'ch-base' : 'ch-grid');
        text(this.gAxis, fmt(t), m.l - 14, gy + size * 0.35, 'end', 'ch-tick');
      }
    }

    var band = (kind === 'hbar' ? ph : pw) / cats.length;
    cats.forEach(function (c, ci) {
      // 分类标签
      var cl = self.mark('c|' + ci, 'text', self.gLabels);
      cl.setAttribute('class', 'm ch-cat' + (hl === c ? ' on' : ''));
      cl.textContent = c;
      if (kind === 'hbar') {
        cl.setAttribute('text-anchor', 'end');
        cl.style.transform = 'translate(' + (m.l - 14) + 'px,' + (m.t + ci * band + band / 2 + size * 0.35) + 'px)';
      } else {
        cl.setAttribute('text-anchor', 'middle');
        cl.style.transform = 'translate(' + (m.l + ci * band + band / 2) + 'px,' + (m.t + ph + 38) + 'px)';
      }
      cl.dataset.cat = c;
    });

    if (kind === 'line') {
      series.forEach(function (s) {
        var on = visible.indexOf(s) >= 0;
        var pts = s.values.map(function (v, ci) { return [m.l + ci * band + band / 2, m.t + ph - val(v) * ph]; });
        var p = self.mark('p|' + s.name, 'path');
        p.setAttribute('class', 'm ch-line');
        p.style.d = 'path("' + pts.map(function (q, j) { return (j ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join(' ') + '")';
        p.style.stroke = s.color;
        p.style.opacity = on ? (hl == null || hl === s.name || cats.indexOf(hl) >= 0 ? 1 : 0.18) : 0;
        p.style.pointerEvents = on ? '' : 'none';
        p.style.strokeWidth = hl === s.name ? 6 : 4;
        p.dataset.series = s.name;
        s.values.forEach(function (v, ci) {
          var c = self.mark('d|' + s.name + '|' + ci, 'circle');
          c.setAttribute('class', 'm ch-dot');
          c.style.cx = pts[ci][0] + 'px';
          c.style.cy = pts[ci][1] + 'px';
          var big = hl === s.name || hl === cats[ci];
          c.style.r = big ? '9px' : '6px';
          c.style.fill = s.color;
          c.style.opacity = on ? (hl == null || hl === s.name || hl === cats[ci] ? 1 : 0.18) : 0;
          c.style.pointerEvents = on ? '' : 'none';
          c.dataset.series = s.name;
          c.dataset.cat = cats[ci];
          c.dataset.value = v;
          var lb = self.mark('v|' + s.name + '|' + ci, 'text', self.gLabels);
          lb.setAttribute('class', 'm ch-val');
          lb.setAttribute('text-anchor', 'middle');
          lb.textContent = fmt(v);
          lb.style.transform = 'translate(' + pts[ci][0] + 'px,' + (pts[ci][1] - 18) + 'px)';
          lb.style.opacity = on && (labelsOn || hl === s.name || hl === cats[ci]) ? 1 : 0;
        });
      });
    } else {
      var inner = band * 0.72;
      var bw = inner / Math.max(visible.length, 1);
      cats.forEach(function (c, ci) {
        series.forEach(function (s) {
          var idx = visible.indexOf(s);
          var on = idx >= 0;
          var v = s.values[ci];
          var r = self.mark('b|' + ci + '|' + s.name, 'rect');
          var lb = self.mark('v|' + ci + '|' + s.name, 'text', self.gLabels);
          r.setAttribute('class', 'm ch-rect');
          lb.setAttribute('class', 'm ch-val' + (hl === c || hl === s.name ? ' on' : ''));
          var x, y, w, h, lx, ly, anchor;
          var start = band * ci + (band - inner) / 2;
          if (kind === 'hbar') {
            h = on ? bw * 0.86 : 0;
            w = on ? val(v) * pw : 0;
            x = m.l;
            y = m.t + start + (on ? idx * bw + bw * 0.07 : inner / 2);
            lx = x + w + 10;
            ly = y + h / 2 + size * 0.35;
            anchor = 'start';
          } else {
            w = on ? bw * 0.86 : 0;
            h = on ? val(v) * ph : 0;
            x = m.l + start + (on ? idx * bw + bw * 0.07 : inner / 2);
            y = m.t + ph - h;
            lx = x + w / 2;
            ly = y - 12;
            anchor = 'middle';
          }
          r.style.x = x + 'px';
          r.style.y = y + 'px';
          r.style.width = Math.max(w, 0) + 'px';
          r.style.height = Math.max(h, 0) + 'px';
          r.style.fill = s.color;
          r.style.opacity = on ? dimOf(c, s.name) : 0;
          r.style.pointerEvents = on ? '' : 'none';
          r.dataset.cat = c;
          r.dataset.series = s.name;
          r.dataset.value = v;
          lb.setAttribute('text-anchor', anchor);
          lb.textContent = fmt(v);
          lb.style.transform = 'translate(' + lx + 'px,' + ly + 'px)';
          lb.style.opacity = on && (labelsOn || hl === c) ? dimOf(c, s.name) : 0;
        });
      });
    }
    // 不再使用的标记（例如分类数变化）
    for (var key in this.marks) if (!this.marks[key].dataset.live) this.marks[key].style.opacity = 0;

    this.renderBar(spec, state);
    this.renderDetail(spec, state);
    if (!animate) {
      root.getBoundingClientRect();
      requestAnimationFrame(function () { root.classList.remove('ch-still'); });
    }
  };

  function line(g, x1, y1, x2, y2, cls) {
    var l = svgEl('line', g, cls);
    l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2);
    return l;
  }
  function text(g, s, x, y, anchor, cls) {
    var t = svgEl('text', g, cls);
    t.setAttribute('x', x); t.setAttribute('y', y); t.setAttribute('text-anchor', anchor);
    t.textContent = s;
    return t;
  }

  Chart.prototype.renderBar = function (spec, state) {
    var self = this;
    var bar = this.barEl;
    bar.textContent = '';
    if (!spec.switch && !spec.legend) { bar.style.display = 'none'; return; }
    bar.style.display = '';
    spec.series.forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      if (spec.switch) {
        b.className = 'ch-sw' + (state.show.length === 1 && state.show[0] === s.name ? ' on' : '');
        b.textContent = s.name;
      } else {
        b.className = 'ch-lg' + (state.show.indexOf(s.name) >= 0 ? '' : ' off');
        b.innerHTML = '<i></i>';
        b.querySelector('i').style.background = s.color;
        b.appendChild(document.createTextNode(s.name));
      }
      b.dataset.series = s.name;
      if (!spec.interactive) b.disabled = true;
      bar.appendChild(b);
    });
  };

  Chart.prototype.renderDetail = function (spec, state) {
    var d = this.detailEl;
    var hl = state.highlight;
    if (!spec.detail || hl == null) { d.classList.remove('on'); return; }
    var unit = spec.unit ? ' ' + spec.unit : '';
    var ci = spec.categories.indexOf(hl);
    var rows = [];
    spec.series.forEach(function (s) {
      if (state.show.indexOf(s.name) < 0) return;
      if (ci >= 0) rows.push('<div><i style="background:' + s.color + '"></i>' + s.name + '<b>' + fmt(s.values[ci]) + unit + '</b></div>');
      else if (s.name === hl) {
        var last = s.values[s.values.length - 1];
        rows.push('<div>最新（' + spec.categories[spec.categories.length - 1] + '）<b>' + fmt(last) + unit + '</b></div>');
        rows.push('<div>最大<b>' + fmt(Math.max.apply(null, s.values)) + unit + '</b></div>');
      }
    });
    d.innerHTML = '<div class="ch-dt">' + hl + '</div>' + rows.join('');
    d.classList.add('on');
  };

  Chart.prototype.update = function (patch, fromLink) {
    for (var k in patch) this.state[k] = patch[k];
    this.draw(this.spec, this.state, true);
    if ('highlight' in patch && !fromLink && this.spec.link) {
      var sec = this.root.closest('section');
      var self = this;
      instances.forEach(function (o) {
        if (o !== self && o.spec.link === self.spec.link && sec && sec.contains(o.root)) o.update({ highlight: patch.highlight }, true);
      });
    }
  };

  Chart.prototype.bind = function () {
    var self = this;
    var plot = this.root.querySelector('.ch-plot');
    var unit = function () { return self.spec.unit ? ' ' + self.spec.unit : ''; };
    this.svg.addEventListener('mousemove', function (e) {
      var t = e.target;
      if (!t.dataset || t.dataset.value === undefined) { self.tip.classList.remove('on'); return; }
      var r = plot.getBoundingClientRect();
      var k = plot.offsetWidth / r.width;
      self.tip.innerHTML = '<b>' + t.dataset.cat + '</b> · ' + t.dataset.series + '：' + fmt(Number(t.dataset.value)) + unit();
      self.tip.style.left = (e.clientX - r.left) * k + 16 + 'px';
      self.tip.style.top = (e.clientY - r.top) * k - 12 + 'px';
      self.tip.classList.add('on');
    });
    this.svg.addEventListener('mouseleave', function () { self.tip.classList.remove('on'); });
    this.svg.addEventListener('click', function (e) {
      var t = e.target;
      var key = null;
      if (t.dataset && t.dataset.cat !== undefined && self.spec.kind !== 'line') key = t.dataset.cat;
      else if (t.dataset && t.dataset.series !== undefined && self.spec.kind === 'line') key = t.dataset.series;
      else if (t.dataset && t.dataset.cat !== undefined) key = t.dataset.cat;
      self.update({ highlight: key === null || key === self.state.highlight ? null : key });
    });
    this.barEl.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var name = b.dataset.series;
      if (self.spec.switch) self.update({ show: [name] });
      else {
        var show = self.state.show.slice();
        var i = show.indexOf(name);
        if (i >= 0 && show.length > 1) show.splice(i, 1);
        else if (i < 0) show.push(name);
        self.update({ show: show });
      }
    });
  };

  /** 进入页面：复位到讲述状态；若从同一 Scene 的上一个 State 前进而来，则从上一状态过渡 */
  Chart.prototype.enter = function (forward) {
    var self = this;
    this.state = authored(this.spec);
    this.tip.classList.remove('on');
    var qa = document.documentElement.classList.contains('qa');
    if (forward && this.prevSpec && !qa) {
      // 上一状态的数据，但用当前尺寸绘制（容器本身的移动由 Auto-Animate 负责）
      var from = Object.assign({}, this.prevSpec, { w: this.spec.w, h: this.spec.h });
      this.draw(from, authored(from), false);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { self.draw(self.spec, self.state, true); });
      });
    } else this.draw(this.spec, this.state, false);
  };

  window.HtmlPptCharts = {
    init: function () {
      document.querySelectorAll('.reveal .o-chart').forEach(function (r) {
        try { instances.push(new Chart(r)); } catch (e) { console.error('chart', e); }
      });
    },
    enter: function (cur, prev) {
      if (!cur) return;
      var forward = !!(prev && prev.dataset.scene === cur.dataset.scene && Number(prev.dataset.state) === Number(cur.dataset.state) - 1);
      instances.forEach(function (c) { if (cur.contains(c.root)) c.enter(forward); });
    },
  };
})();
