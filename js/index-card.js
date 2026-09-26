/* ==========================================================================
   INDEX — THE HERO CARD
   Five systems, five kinds of chart, one drawn at random on each load.

   The infographic version of an AI stack draws every layer as the same
   box-and-arrow row. These are the same layers drawn the way each one is
   actually read by someone operating it:

     01 serve    a sequence diagram — time runs down the page
     02 agent    an orbit — thought, action, observation, one lap a turn
     03 rag      an embedding space — top-k grows, then a reranker reorders
     04 deploy   capacity stepping under a traffic curve
     05 observe  a latency heatmap — the tail moves, the median doesn't

   One vocabulary across all five: hairlines, dashed guides, the one blue
   in four tints, mono for every label and figure. Each chart is a pure
   `build()` that returns SVG and a `frame(u)` that poses it at progress
   u ∈ [0, 1] and returns the three readout figures. u = 1 is the
   finished state, which is what reduced motion gets and what the markup
   ships (chart 01, pre-rendered from this same builder).

   Every figure is a sample, and the title bar says so.
   ========================================================================== */

(function () {
  'use strict';

  var card = document.getElementById('hero-card');
  if (!card) return;
  var body = card.querySelector('.tc-body');
  var next = card.querySelector('.tc-next');
  if (!body) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  /* ── helpers ─────────────────────────────────────────────────────── */

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ease(u) { return u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; }
  function f1(v) { return Math.round(v * 10) / 10; }
  function attrs(o) {
    var s = '';
    for (var k in o) if (o[k] !== undefined && o[k] !== null) s += ' ' + k + '="' + o[k] + '"';
    return s;
  }
  function tag(n, o, inner) { return '<' + n + attrs(o) + (inner === undefined ? '/>' : '>' + inner + '</' + n + '>'); }
  function txt(x, y, s, cls, anchor) {
    return tag('text', { x: f1(x), y: f1(y), 'class': cls || 'cv-lbl', 'text-anchor': anchor }, s);
  }
  function rng(seed) {                       /* mulberry32: same drawing every load */
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function gauss(r) { return Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r()); }
  function $(root, sel) { return root.querySelector(sel); }
  function $$(root, sel) { return [].slice.call(root.querySelectorAll(sel)); }

  /* ── 01 serve: a sequence diagram ────────────────────────────────── */

  var SEQ = (function () {
    var X = { client: 30, api: 102, vector: 178, llm: 254, kafka: 330 };
    var MSG = [
      ['client', 'api',    48,  'POST /ask',    'call'],
      ['api',    'vector', 72,  'retrieve k=8', 'call'],
      ['vector', 'api',    94,  '8 chunks',     'ret'],
      ['api',    'llm',    118, 'generate',     'call'],
      ['llm',    'client', 142, 'tokens',       'ret'],
      ['llm',    'client', 154, '',             'ret'],
      ['llm',    'client', 166, '',             'ret'],
      ['api',    'client', 192, '200 · 412 ms', 'ret'],
      ['api',    'kafka',  214, 'log event',    'async']
    ];
    var ACT = [['api', 44, 196], ['vector', 68, 98], ['llm', 114, 170]];
    var Y0 = 40, Y1 = 224, T0 = 48, T1 = 194;

    function arrow(m) {
      var x1 = X[m[0]], x2 = X[m[1]], y = m[2], d = x2 > x1 ? 1 : -1;
      var a = x1 + d * 3, b = x2 - d * 3;
      var line = tag('line', { x1: a, y1: y, x2: b, y2: y, 'class': 'cv-msg cv-' + m[4] });
      var head = m[4] === 'call'
        ? tag('path', { d: 'M' + b + ',' + y + ' l' + (-d * 6) + ',-3 v6 z', 'class': 'cv-head' })
        : tag('path', { d: 'M' + (b - d * 6) + ',' + (y - 3) + ' L' + b + ',' + y + ' L' + (b - d * 6) + ',' + (y + 3), 'class': 'cv-chev' });
      var label = m[3] ? txt((x1 + x2) / 2, y - 4, m[3], 'cv-lbl', 'middle') : '';
      return line + head + label;
    }

    return {
      key: 'serve', title: 'serve — one request, in order',
      path: 'sample · POST /ask', total: '412&thinsp;ms',
      figs: ['elapsed ms', 'chunks', 'tokens'],
      note: 'Time runs down the page. Only the log is async — nobody waits on kafka.',
      run: 4200, hold: 1800,
      build: function () {
        var s = '';
        Object.keys(X).forEach(function (k) {
          s += tag('line', { x1: X[k], y1: 22, x2: X[k], y2: 236, 'class': 'cv-guide' });
          s += tag('rect', { x: X[k] - 28, y: 2, width: 56, height: 18, rx: 4, 'class': 'cv-box' });
          s += txt(X[k], 14.5, k, 'cv-lbl cv-ink', 'middle');
        });
        var g = '';
        ACT.forEach(function (a) {
          g += tag('rect', { x: X[a[0]] - 3, y: a[1], width: 6, height: a[2] - a[1], 'class': 'cv-act' });
        });
        MSG.forEach(function (m) { g += arrow(m); });
        s += tag('defs', {}, tag('clipPath', { id: 'cvc-seq' },
          tag('rect', { x: 0, y: 0, width: 360, height: Y1 + 6, 'class': 'cv-clip' })));
        s += tag('g', { 'clip-path': 'url(#cvc-seq)' }, g);
        s += tag('line', { x1: 0, y1: Y1, x2: 360, y2: Y1, 'class': 'cv-cur' });
        s += txt(358, Y1 - 3, '412 ms', 'cv-lbl cv-blue cv-curt', 'end');
        return s;
      },
      frame: function (root, u) {
        var y = Y0 + ease(u) * (Y1 - Y0);
        $(root, '.cv-clip').setAttribute('height', f1(y + 1));
        var cur = $(root, '.cv-cur');
        cur.setAttribute('y1', f1(y)); cur.setAttribute('y2', f1(y));
        cur.style.opacity = u >= 1 ? 0 : '';
        var ms = Math.round(clamp((y - T0) / (T1 - T0), 0, 1) * 412);
        var t = $(root, '.cv-curt');
        t.setAttribute('y', f1(y - 3)); t.textContent = ms + ' ms';
        t.style.opacity = u >= 1 ? 0 : '';
        return [ms, y >= 94 ? 8 : 0, Math.round(clamp((y - 142) / 24, 0, 1) * 512)];
      }
    };
  })();

  /* ── 02 agent: the loop as an orbit ──────────────────────────────── */

  var ORBIT = (function () {
    var CX = 116, CY = 120, R = 72, C = 2 * Math.PI * R;
    var LAP = 0.22, LAPS = 4;
    var TOOLS = ['search', 'sql', 'python'];
    var USE = ['search', 'sql', 'search', 'python'];
    var CTX = [0.04, 0.16, 0.33, 0.52, 0.71];
    function at(deg, r) {
      var a = deg * Math.PI / 180;
      return [CX + (r || R) * Math.cos(a), CY + (r || R) * Math.sin(a)];
    }
    var ST = [['thought', -90], ['action', 30], ['observe', 150]];

    return {
      key: 'agent', title: 'agent — thought, action, observation',
      path: 'sample · agent run', total: '4&thinsp;turns',
      figs: ['turn', 'tool calls', 'context'],
      note: 'Each lap spends context. The bar, not the model, is what bounds the loop.',
      run: 7200, hold: 1800,
      build: function () {
        var s = '';
        s += tag('circle', { cx: CX, cy: CY, r: R, 'class': 'cv-ring' });
        s += tag('circle', { cx: CX, cy: CY, r: R, 'class': 'cv-arc',
          'stroke-dasharray': f1(C), 'stroke-dashoffset': f1(C),
          transform: 'rotate(-90 ' + CX + ' ' + CY + ')' });
        [-30, 90, 210].forEach(function (deg) {        /* direction of travel */
          var a = deg * Math.PI / 180, p = at(deg);
          var tx = -Math.sin(a), ty = Math.cos(a), nx = Math.cos(a), ny = Math.sin(a);
          s += tag('path', { 'class': 'cv-chev', d:
            'M' + f1(p[0] - tx * 3 + nx * 3) + ',' + f1(p[1] - ty * 3 + ny * 3)
            + ' L' + f1(p[0] + tx * 3) + ',' + f1(p[1] + ty * 3)
            + ' L' + f1(p[0] - tx * 3 - nx * 3) + ',' + f1(p[1] - ty * 3 - ny * 3) });
        });
        // links out to the tools and the memory
        var ac = at(30);
        TOOLS.forEach(function (t, i) {
          var y = 52 + i * 32;
          s += tag('path', { 'class': 'cv-link', 'data-tool': t,
            d: 'M' + f1(ac[0]) + ',' + f1(ac[1]) + ' C' + f1(ac[0] + 40) + ',' + f1(ac[1]) + ' 224,' + (y + 10) + ' 258,' + (y + 10) });
          s += tag('rect', { x: 258, y: y, width: 94, height: 20, rx: 4, 'class': 'cv-box', 'data-tool': t });
          s += txt(305, y + 13.5, t, 'cv-lbl', 'middle');
        });
        var th = at(-90);
        s += tag('path', { 'class': 'cv-link', 'data-tool': 'memory',
          d: 'M' + th[0] + ',' + th[1] + ' C' + th[0] + ',22 96,12 64,12' });
        s += tag('rect', { x: 2, y: 2, width: 62, height: 20, rx: 4, 'class': 'cv-box', 'data-tool': 'memory' });
        s += txt(33, 15.5, 'memory', 'cv-lbl', 'middle');
        s += txt(305, 40, 'tools', 'cv-lbl cv-dim', 'middle');

        ST.forEach(function (st) {
          var p = at(st[1]);
          s += tag('circle', { cx: f1(p[0]), cy: f1(p[1]), r: 4.5, 'class': 'cv-st' });
          var l = at(st[1], R + 14);
          s += txt(l[0], l[1] + 3, st[0], 'cv-lbl cv-ink', st[1] === -90 ? 'middle' : st[1] === 30 ? 'start' : 'end');
        });
        s += tag('circle', { cx: CX, cy: CY - R, r: 3.5, 'class': 'cv-pkt' });
        s += txt(CX, CY - 8, 'turn', 'cv-lbl cv-dim cv-turnk', 'middle');
        s += txt(CX, CY + 18, '4', 'cv-big cv-turn', 'middle');

        // context window
        s += txt(0, 219, 'context', 'cv-lbl cv-dim');
        s += tag('rect', { x: 56, y: 212, width: 296, height: 6, rx: 3, 'class': 'cv-track' });
        s += tag('rect', { x: 56, y: 212, width: 0, height: 6, rx: 3, 'class': 'cv-fill cv-ctx' });
        var lx = 56 + 296 * 0.8;
        s += tag('line', { x1: lx, y1: 206, x2: lx, y2: 224, 'class': 'cv-limit' });
        s += txt(lx, 202, 'limit', 'cv-lbl cv-dim', 'middle');
        return s;
      },
      frame: function (root, u) {
        var done = u >= LAP * LAPS;
        var lap = done ? LAPS - 1 : Math.floor(u / LAP);
        var f = done ? 1 : (u - lap * LAP) / LAP;
        var arc = $(root, '.cv-arc');
        arc.setAttribute('stroke-dashoffset', f1(C * (1 - f)));
        var p = at(-90 + 360 * f);
        var pk = $(root, '.cv-pkt');
        pk.setAttribute('cx', f1(p[0])); pk.setAttribute('cy', f1(p[1]));
        pk.style.opacity = done ? 0 : '';

        var tool = !done && f >= 1 / 3 && f < 2 / 3 ? USE[lap] : null;
        var mem = !done && f < 0.14;
        $$(root, '[data-tool]').forEach(function (el) {
          var k = el.getAttribute('data-tool');
          el.classList.toggle('on', k === tool || (k === 'memory' && mem));
        });
        var ctx = done ? CTX[LAPS] : CTX[lap] + (CTX[lap + 1] - CTX[lap]) * f;
        $(root, '.cv-ctx').setAttribute('width', f1(296 * ctx));
        $(root, '.cv-turn').textContent = done ? '✓' : String(lap + 1);
        $(root, '.cv-turnk').textContent = done ? 'answered' : 'turn';
        var calls = done ? LAPS : lap + (f >= 2 / 3 ? 1 : 0);
        return [(lap + 1) + '/8', calls, Math.round(ctx * 100) + '%'];
      }
    };
  })();

  /* ── 03 rag: retrieval in an embedding space ─────────────────────── */

  var SPACE = (function () {
    var r = rng(11), P = [];
    [[64, 58], [150, 158], [178, 70]].forEach(function (c) {
      for (var i = 0; i < 20; i++) {
        P.push([clamp(c[0] + gauss(r) * 20, 10, 228), clamp(c[1] + gauss(r) * 18, 14, 200)]);
      }
    });
    for (var i = 0; i < 12; i++) P.push([10 + r() * 218, 14 + r() * 186]);
    var Q = [150, 92];
    var D = P.map(function (p, i) { return { i: i, d: Math.hypot(p[0] - Q[0], p[1] - Q[1]) }; })
      .sort(function (a, b) { return a.d - b.d; });
    var K = 8, RK = D[K - 1].d + 3;
    var TOP = D.slice(0, 5);
    // the reranker's view of the same five: close is not the same as relevant
    var RER = [0.64, 0.93, 0.71, 0.88, 0.52];
    var ORDER = [0, 1, 2, 3, 4].sort(function (a, b) { return RER[b] - RER[a]; });
    var NEWPOS = []; ORDER.forEach(function (d, pos) { NEWPOS[d] = pos; });
    var SIM = TOP.map(function (t) { return 0.9 - 0.22 * (t.d / RK); });
    var MOVES = NEWPOS.filter(function (p, d) { return p !== d; }).length;
    function rowY(pos) { return 36 + pos * 34; }

    return {
      key: 'rag', title: 'rag — what retrieval actually finds',
      path: 'sample · top-k = 8', total: 'k&thinsp;=&thinsp;8',
      figs: ['retrieved', 'reranked', 'top score'],
      note: 'Nearest is not most relevant: the reranker reorders what distance found.',
      run: 5200, hold: 2200,
      build: function () {
        var s = '';
        s += tag('rect', { x: 2, y: 4, width: 232, height: 204, rx: 6, 'class': 'cv-frame' });
        s += tag('circle', { cx: Q[0], cy: Q[1], r: f1(RK), 'class': 'cv-rad' });
        D.slice(0, K).forEach(function (t) {
          var p = P[t.i];
          s += tag('line', { x1: Q[0], y1: Q[1], x2: f1(p[0]), y2: f1(p[1]), 'class': 'cv-spoke', 'data-i': t.i });
        });
        P.forEach(function (p, i) {
          s += tag('circle', { cx: f1(p[0]), cy: f1(p[1]), r: 2.6, 'class': 'cv-pt', 'data-i': i });
        });
        s += tag('path', { d: 'M' + (Q[0] - 5) + ',' + Q[1] + ' h10 M' + Q[0] + ',' + (Q[1] - 5) + ' v10', 'class': 'cv-q' });
        s += txt(Q[0] + 8, Q[1] - 6, 'query', 'cv-lbl cv-blue');
        s += txt(4, 224, 'chunks, projected to 2-d', 'cv-lbl cv-dim');

        s += txt(246, 18, 'rerank', 'cv-lbl cv-ink');
        s += txt(358, 18, 'top 5', 'cv-lbl cv-dim', 'end');
        TOP.forEach(function (t, d) {
          s += tag('g', { 'class': 'cv-row', 'data-d': d, style: 'transform:translate(246px,' + rowY(NEWPOS[d]) + 'px)' },
            txt(0, 9, 'chunk ' + String(t.i).padStart(2, '0'), 'cv-lbl cv-ink')
            + txt(112, 9, RER[d].toFixed(2), 'cv-lbl cv-blue cv-score', 'end')
            + tag('rect', { x: 0, y: 15, width: 112, height: 4, rx: 2, 'class': 'cv-track' })
            + tag('rect', { x: 0, y: 15, width: f1(112 * RER[d]), height: 4, rx: 2, 'class': 'cv-fill cv-sbar' }));
        });
        return s;
      },
      frame: function (root, u) {
        var rad = RK * ease(clamp(u / 0.45, 0, 1));
        $(root, '.cv-rad').setAttribute('r', f1(Math.max(0.1, rad)));
        var hit = {}, n = 0;
        D.slice(0, K).forEach(function (t) { if (t.d <= rad) { hit[t.i] = 1; n++; } });
        $$(root, '.cv-pt, .cv-spoke').forEach(function (el) {
          el.classList.toggle('on', !!hit[el.getAttribute('data-i')]);
        });
        var rr = u >= 0.62;
        $$(root, '.cv-row').forEach(function (g) {
          var d = +g.getAttribute('data-d');
          var shown = !!hit[TOP[d].i];
          g.style.opacity = shown ? '' : 0;
          g.style.transform = 'translate(246px,' + rowY(rr ? NEWPOS[d] : d) + 'px)';
          var sc = rr ? RER[d] : SIM[d];
          $(g, '.cv-score').textContent = sc.toFixed(2);
          $(g, '.cv-sbar').setAttribute('width', f1(112 * sc));
          g.classList.toggle('lead', rr && NEWPOS[d] === 0);
        });
        return [n + '/' + K, rr ? MOVES + ' moved' : '—', (rr ? RER[ORDER[0]] : SIM[0]).toFixed(2)];
      }
    };
  })();

  /* ── 04 deploy: capacity chasing traffic ─────────────────────────── */

  var SCALE = (function () {
    var X0 = 34, X1 = 352, BASE = 150, H = 118, POD = 0.1;
    function x(t) { return X0 + t / 24 * (X1 - X0); }
    function y(v) { return BASE - v * H; }
    function traffic(t) {
      return 0.2 + 0.58 * Math.exp(-Math.pow((t - 14.5) / 3.6, 2))
        + 0.14 * Math.exp(-Math.pow((t - 8.5) / 1.4, 2))
        + 0.02 * Math.sin(t * 2.3);
    }
    // the autoscaler: 45 min behind, 25% headroom target, 90 min cooldown
    var DT = 0.25, STEPS = 24 / DT, NEED = [], REP = [];
    for (var k = 0; k <= STEPS; k++) {
      NEED[k] = clamp(Math.ceil(traffic(Math.max(0, k * DT - 0.75)) * 1.25 / POD), 3, 12);
    }
    for (k = 0; k <= STEPS; k++) {
      var m = 0;
      for (var j = Math.max(0, k - 6); j <= k; j++) m = Math.max(m, NEED[j]);
      REP[k] = m;
    }
    function rep(t) { return REP[clamp(Math.floor(t / DT), 0, STEPS)]; }

    return {
      key: 'deploy', title: 'deploy — capacity chasing traffic',
      path: 'sample · 24 h, autoscaled', total: '3–12&thinsp;pods',
      figs: ['pods', 'traffic', 'headroom'],
      note: 'Capacity steps, traffic curves. The band between them is the headroom you pay for.',
      run: 6400, hold: 1800,
      build: function () {
        var s = '';
        [0.25, 0.5, 0.75, 1].forEach(function (v, i) {
          s += tag('line', { x1: X0, y1: f1(y(v)), x2: X1, y2: f1(y(v)), 'class': 'cv-guide' });
          s += txt(X0 - 4, y(v) + 3, (3 * (i + 1)) + 'k', 'cv-lbl cv-dim', 'end');
        });
        s += tag('line', { x1: X0, y1: BASE, x2: X1, y2: BASE, 'class': 'cv-axis' });
        [0, 6, 12, 18, 24].forEach(function (t) {
          s += txt(x(t), BASE + 12, String(t).padStart(2, '0'), 'cv-lbl cv-dim', 'middle');
        });

        var cap = 'M' + X0 + ',' + BASE, prev = null;
        for (var k = 0; k <= STEPS; k++) {
          var cy = f1(y(REP[k] * POD));
          if (prev === null) cap += ' V' + cy;
          else if (cy !== prev) cap += ' H' + f1(x(k * DT)) + ' V' + cy;
          prev = cy;
        }
        var capLine = cap.replace('M' + X0 + ',' + BASE + ' V', 'M' + X0 + ',') + ' H' + X1;
        cap += ' H' + X1 + ' V' + BASE + ' Z';
        var tr = 'M' + X0 + ',' + BASE, trLine = '';
        for (var i = 0; i <= 96; i++) {
          var t = i / 4, pt = f1(x(t)) + ',' + f1(y(traffic(t)));
          tr += ' L' + pt; trLine += (i ? ' L' : 'M') + pt;
        }
        tr += ' L' + X1 + ',' + BASE + ' Z';

        var g = tag('path', { d: cap, 'class': 'cv-t1' })
          + tag('path', { d: tr, 'class': 'cv-t3' })
          + tag('path', { d: trLine, 'class': 'cv-line-ink' })
          + tag('path', { d: capLine, 'class': 'cv-line' });
        s += tag('defs', {}, tag('clipPath', { id: 'cvc-scale' },
          tag('rect', { x: 0, y: 0, width: X1 + 2, height: BASE + 2, 'class': 'cv-clip' })));
        s += tag('g', { 'clip-path': 'url(#cvc-scale)' }, g);
        s += tag('line', { x1: X1, y1: 10, x2: X1, y2: BASE, 'class': 'cv-cur' });
        s += tag('circle', { cx: X1, cy: f1(y(traffic(24))), r: 3.2, 'class': 'cv-pkt' });

        s += txt(0, 191, 'pods', 'cv-lbl cv-dim');
        for (var p = 0; p < 12; p++) {
          s += tag('rect', { x: f1(X0 + p * 26.5), y: 181, width: 22, height: 14, rx: 3, 'class': 'cv-pod' });
        }
        s += tag('rect', { x: X0, y: 214, width: 10, height: 6, 'class': 'cv-t3' });
        s += txt(X0 + 14, 220, 'traffic', 'cv-lbl cv-dim');
        s += tag('line', { x1: X0 + 70, y1: 217, x2: X0 + 80, y2: 217, 'class': 'cv-line' });
        s += txt(X0 + 84, 220, 'capacity', 'cv-lbl cv-dim');
        s += tag('rect', { x: X0 + 146, y: 214, width: 10, height: 6, 'class': 'cv-t1' });
        s += txt(X0 + 160, 220, 'headroom', 'cv-lbl cv-dim');
        return s;
      },
      frame: function (root, u) {
        var t = ease(u) * 24, cx = x(t);
        $(root, '.cv-clip').setAttribute('width', f1(cx + 1));
        var cur = $(root, '.cv-cur');
        cur.setAttribute('x1', f1(cx)); cur.setAttribute('x2', f1(cx));
        var pk = $(root, '.cv-pkt');
        pk.setAttribute('cx', f1(cx)); pk.setAttribute('cy', f1(y(traffic(t))));
        var n = rep(t);
        $$(root, '.cv-pod').forEach(function (el, i) { el.classList.toggle('on', i < n); });
        var tv = traffic(t), capv = n * POD;
        return [n, (tv * 12).toFixed(1) + 'k rps', Math.round((capv - tv) / capv * 100) + '%'];
      }
    };
  })();

  /* ── 05 observe: a latency heatmap ───────────────────────────────── */

  var HEAT = (function () {
    var COLS = 30, ROWS = 12, X0 = 34, X1 = 352, TOP = 10, BOT = 166;
    var CW = (X1 - X0) / COLS, RH = (BOT - TOP) / ROWS;
    var DEPLOY = 18, ROLLBACK = 23;
    var r = rng(5), GRID = [], P50 = [], P99 = [], ERR = [];
    function ms(row) { return 10 * Math.pow(10, row * 0.2); }
    function nd(x, m, s) { return Math.exp(-0.5 * Math.pow((x - m) / s, 2)); }
    for (var c = 0; c < COLS; c++) {
      var bad = c >= DEPLOY && c < ROLLBACK;
      var col = [], tot = 0;
      for (var rw = 0; rw < ROWS; rw++) {
        var v = 100 * nd(rw, bad ? 3.2 : 2.9, 1.05) + (bad ? 34 * nd(rw, 8.6, 0.9) : 1.2 * nd(rw, 7, 1.4));
        v *= 0.85 + r() * 0.3;
        col.push(v); tot += v;
      }
      GRID.push(col);
      [0.5, 0.99].forEach(function (q, qi) {
        var acc = 0, target = tot * q, pos = ROWS - 1;
        for (var k = 0; k < ROWS; k++) {
          if (acc + col[k] >= target) { pos = k + (target - acc) / col[k]; break; }
          acc += col[k];
        }
        (qi ? P99 : P50).push(pos);
      });
      ERR.push(bad ? 2.1 + r() * 0.8 : 0.08 + r() * 0.08);
    }
    var MAX = 0;
    GRID.forEach(function (col) { col.forEach(function (v) { MAX = Math.max(MAX, v); }); });
    function level(v) {
      var q = v / MAX;
      return q > 0.62 ? 4 : q > 0.3 ? 3 : q > 0.1 ? 2 : q > 0.04 ? 1 : 0;
    }
    function ry(pos) { return BOT - pos * RH; }

    return {
      key: 'observe', title: 'observe — the tail, not the average',
      path: 'sample · last 60 min', total: 'p50&thinsp;·&thinsp;p99',
      figs: ['p50', 'p99', 'errors'],
      note: 'The median barely moves at v2.4; the tail jumps. An average would have hidden it.',
      run: 6000, hold: 2000,
      build: function () {
        var cells = '';
        GRID.forEach(function (col, c) {
          col.forEach(function (v, rw) {
            var l = level(v);
            if (!l) return;
            cells += tag('rect', { x: f1(X0 + c * CW + 0.5), y: f1(BOT - (rw + 1) * RH + 0.5),
              width: f1(CW - 1), height: f1(RH - 1), 'class': 'cv-h' + l });
          });
        });
        var p50 = '', p99 = '';
        for (var c = 0; c < COLS; c++) {
          var xx = f1(X0 + (c + 0.5) * CW);
          p50 += (c ? ' L' : 'M') + xx + ',' + f1(ry(P50[c]));
          p99 += (c ? ' L' : 'M') + xx + ',' + f1(ry(P99[c]));
        }
        var s = '';
        [[0, '10ms'], [5, '100ms'], [10, '1s']].forEach(function (a) {
          s += txt(X0 - 4, ry(a[0]) + 3, a[1], 'cv-lbl cv-dim', 'end');
          s += tag('line', { x1: X0, y1: f1(ry(a[0])), x2: X1, y2: f1(ry(a[0])), 'class': 'cv-guide' });
        });
        var g = cells
          + tag('path', { d: p50, 'class': 'cv-halo' }) + tag('path', { d: p50, 'class': 'cv-line-ink' })
          + tag('path', { d: p99, 'class': 'cv-halo' }) + tag('path', { d: p99, 'class': 'cv-line' });
        s += tag('defs', {}, tag('clipPath', { id: 'cvc-heat' },
          tag('rect', { x: 0, y: 0, width: X1 + 2, height: BOT + 2, 'class': 'cv-clip' })));
        s += tag('g', { 'clip-path': 'url(#cvc-heat)' }, g);
        [[DEPLOY, 'v2.4'], [ROLLBACK, 'rollback']].forEach(function (m) {
          var xx = f1(X0 + m[0] * CW);
          s += tag('line', { x1: xx, y1: TOP - 2, x2: xx, y2: BOT, 'class': 'cv-mark', 'data-col': m[0] });
          s += txt(xx + 3, TOP + 6, m[1], 'cv-lbl cv-ink cv-markt', 'start');
        });
        s += tag('line', { x1: X0, y1: BOT, x2: X1, y2: BOT, 'class': 'cv-axis' });
        s += txt(X0, BOT + 12, '−60m', 'cv-lbl cv-dim');
        s += txt(X1, BOT + 12, 'now', 'cv-lbl cv-dim', 'end');

        s += tag('line', { x1: X0, y1: 199, x2: X0 + 12, y2: 199, 'class': 'cv-line-ink' });
        s += txt(X0 + 16, 202, 'p50', 'cv-lbl cv-dim');
        s += tag('line', { x1: X0 + 46, y1: 199, x2: X0 + 58, y2: 199, 'class': 'cv-line' });
        s += txt(X0 + 62, 202, 'p99', 'cv-lbl cv-dim');
        s += txt(X1 - 64, 202, 'fewer', 'cv-lbl cv-dim', 'end');
        for (var l = 1; l <= 4; l++) {
          s += tag('rect', { x: X1 - 60 + (l - 1) * 11, y: 195, width: 9, height: 8, 'class': 'cv-h' + l });
        }
        s += txt(X1, 214, 'more', 'cv-lbl cv-dim', 'end');
        return s;
      },
      frame: function (root, u) {
        var n = Math.max(1, Math.ceil(u * COLS));
        $(root, '.cv-clip').setAttribute('width', f1(X0 + n * CW + 1));
        $$(root, '.cv-mark').forEach(function (el) {
          el.classList.toggle('on', n > +el.getAttribute('data-col'));
        });
        var c = n - 1;
        return [Math.round(ms(P50[c])) + ' ms', Math.round(ms(P99[c])) + ' ms', ERR[c].toFixed(1) + '%'];
      }
    };
  })();

  var CHARTS = [SEQ, ORBIT, SPACE, SCALE, HEAT];

  /* ── the card ─────────────────────────────────────────────────────── */

  var current = -1, svg = null, figs = [], t0 = null, visible = true, looping = false;

  function show(i, restart) {
    var ch = CHARTS[i];
    current = i;
    body.innerHTML =
        '<span class="tc-label">' + ch.title + '</span>'
      + '<svg class="cv-svg" viewBox="0 0 360 240" role="img" aria-label="' + ch.title + ' — sample data">'
      + ch.build() + '</svg>'
      + '<div class="cv-read">' + ch.figs.map(function (k) {
          return '<div><div class="cv-v">—</div><div class="cv-k">' + k + '</div></div>';
        }).join('') + '</div>'
      + '<div class="cv-note">' + ch.note + '</div>';
    card.setAttribute('data-chart', ch.key);
    card.querySelector('.tc-path').textContent = ch.path.replace(/&thinsp;/g, ' ');
    card.querySelector('.tc-total').innerHTML = ch.total;
    if (next) next.textContent = '0' + (i + 1) + '/0' + CHARTS.length;
    svg = body.querySelector('.cv-svg');
    figs = [].slice.call(body.querySelectorAll('.cv-v'));
    pose(reduced ? 1 : 0);
    if (restart) t0 = null;
  }

  function pose(u) {
    var v = CHARTS[current].frame(svg, u);
    figs.forEach(function (el, k) { el.textContent = v[k]; });
  }

  function tick(ts) {
    if (!visible) { looping = false; return; }
    var ch = CHARTS[current];
    if (t0 === null) t0 = ts;
    var el = (ts - t0) % (ch.run + ch.hold);
    pose(Math.min(1, el / ch.run));
    raf(tick);
  }
  function start() {
    if (looping || reduced) return;
    looping = true;
    raf(tick);
  }

  show(Math.floor(Math.random() * CHARTS.length), true);

  if (next) {
    next.hidden = false;
    next.addEventListener('click', function () {
      show((current + 1) % CHARTS.length, true);
      card.classList.remove('is-swap');
      void card.offsetWidth;
      card.classList.add('is-swap');
    });
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) start();
    }).observe(card);
  } else start();

})();
