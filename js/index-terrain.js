/* ==========================================================================
   INDEX — TERRAIN
   Paints #terrain-fig: a career drawn as a surface, with its contours
   projected onto the floor beneath it.

   The surface is a sum — three Gaussians (data, backend, AI) and one
   hollow (the seam between specialists). Because it is a sum, each stop's
   elevation includes whatever the earlier stops leave under it, and the
   panel's "carried" figure is exactly that share, read off the same
   function that draws the mesh. Nothing on the panel is typed in.

   Painter's algorithm on a 2D canvas: every quad and path segment is
   projected, sorted far to near, and filled flat. Tints are height bands
   of the one blue mixed into the ground, so the mesh is opaque and reads
   in either theme without a second palette.

   Script subtracts: the markup ships every panel visible and the stage
   hidden; this adds `.is-live`, which shows the canvas and hides the
   panels you did not pick.
   ========================================================================== */

(function () {
  'use strict';

  var fig = document.getElementById('terrain-fig');
  if (!fig) return;
  var stage = fig.querySelector('.terrain-stage');
  var cv = fig.querySelector('.terrain-cv');
  var ctx = cv && cv.getContext && cv.getContext('2d');
  if (!ctx) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  /* ── the model ───────────────────────────────────────────────────── */

  // Each stop is a bump; the backend one is a ridge stretched toward the
  // AI peak (sl along the ridge, ss across it) — that is the shoulder the
  // summit stands on.
  var STOPS = [
    { key: 'DATA',    sub: '1', x: -0.58, y:  0.42, a: 0.30, sl: 0.46, ss: 0.46 },
    { key: 'BACKEND', sub: '2', x:  0.00, y: -0.30, a: 0.46, sl: 0.50, ss: 0.19 },
    { key: 'AI',      sub: '3', x:  0.50, y:  0.26, a: 0.60, sl: 0.15, ss: 0.15 }
  ];
  var HOLLOW = { x: -0.36, y: -0.04, a: -0.30, s: 0.16 };

  // ridge direction: backend -> AI
  (function () {
    var b = STOPS[1], ai = STOPS[2];
    var dx = ai.x - b.x, dy = ai.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
    STOPS.forEach(function (s) { s.ux = dx / d; s.uy = dy / d; });
  })();

  function bump(s, x, y) {
    var dx = x - s.x, dy = y - s.y;
    var along = dx * s.ux + dy * s.uy;
    var across = -dx * s.uy + dy * s.ux;
    return s.a * Math.exp(-(along * along) / (2 * s.sl * s.sl)
                          - (across * across) / (2 * s.ss * s.ss));
  }
  function hollow(x, y) {
    var dx = x - HOLLOW.x, dy = y - HOLLOW.y;
    return HOLLOW.a * Math.exp(-(dx * dx + dy * dy) / (2 * HOLLOW.s * HOLLOW.s));
  }
  function f(x, y) {
    return bump(STOPS[0], x, y) + bump(STOPS[1], x, y) + bump(STOPS[2], x, y)
      + hollow(x, y) + 0.018 * Math.sin(3.1 * x + 1.2) * Math.cos(2.7 * y);
  }

  STOPS.forEach(function (s, i) {
    s.z = f(s.x, s.y);
    s.carried = 0;
    for (var j = 0; j < i; j++) s.carried += bump(STOPS[j], s.x, s.y);
  });

  // the height field, sampled once
  var N = 40, H = [], zMin = Infinity, zMax = -Infinity;
  for (var j = 0; j <= N; j++) {
    H[j] = [];
    for (var i = 0; i <= N; i++) {
      var z = f(-1 + 2 * i / N, -1 + 2 * j / N);
      H[j][i] = z;
      if (z < zMin) zMin = z;
      if (z > zMax) zMax = z;
    }
  }
  var FLOOR = zMin - 0.7;
  var BANDS = 8;

  // the route: off the plateau, down through the seam, up the ridge, to the summit
  var WAY = [
    [STOPS[0].x, STOPS[0].y], [-0.40, 0.16], [-0.16, -0.20],
    [STOPS[1].x, STOPS[1].y], [0.24, -0.06], [STOPS[2].x, STOPS[2].y]
  ];
  var WAY_STOP = [0, 3, 5];
  var PATH = [], STOP_AT = [];
  (function () {
    var P = [WAY[0]].concat(WAY, [WAY[WAY.length - 1]]);
    var per = 36;
    for (var k = 1; k < P.length - 2; k++) {
      if (WAY_STOP.indexOf(k - 1) >= 0) STOP_AT.push(PATH.length);
      for (var t = 0; t < per; t++) {
        var u = t / per, u2 = u * u, u3 = u2 * u;
        var p = [0, 1].map(function (c) {
          return 0.5 * ((2 * P[k][c]) + (-P[k - 1][c] + P[k + 1][c]) * u
            + (2 * P[k - 1][c] - 5 * P[k][c] + 4 * P[k + 1][c] - P[k + 2][c]) * u2
            + (-P[k - 1][c] + 3 * P[k][c] - 3 * P[k + 1][c] + P[k + 2][c]) * u3);
        });
        PATH.push([p[0], p[1], f(p[0], p[1]) + 0.012]);
      }
    }
    var L = WAY[WAY.length - 1];
    STOP_AT.push(PATH.length);
    PATH.push([L[0], L[1], f(L[0], L[1]) + 0.012]);
  })();

  /* ── colour, read off the tokens ─────────────────────────────────── */

  var C = {};
  function rgb(str) {
    ctx.fillStyle = '#000';
    ctx.fillStyle = str.trim() || '#000';
    var v = ctx.fillStyle;                       // normalised to #rrggbb
    if (v.charAt(0) === '#') {
      return [parseInt(v.substr(1, 2), 16), parseInt(v.substr(3, 2), 16), parseInt(v.substr(5, 2), 16)];
    }
    var m = v.match(/[\d.]+/g) || [0, 0, 0];
    return [+m[0], +m[1], +m[2]];
  }
  function mix(a, b, t) {
    return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * t) + ','
      + Math.round(a[1] + (b[1] - a[1]) * t) + ','
      + Math.round(a[2] + (b[2] - a[2]) * t) + ')';
  }
  function readColours() {
    var cs = getComputedStyle(fig);
    var g = function (n) { return cs.getPropertyValue(n); };
    var ground = rgb(g('--bg-alt')), blue = rgb(g('--blue'));
    C.ground = ground;
    C.blue = g('--blue').trim();
    C.ink = g('--ink').trim();
    C.dim = g('--ink-dim').trim();
    C.rule = g('--rule-strong').trim();
    C.bg = g('--bg-alt').trim();
    C.mono = g('--mono').trim() || 'monospace';
    C.band = [];
    C.bandHot = [];
    for (var b = 0; b < BANDS; b++) {
      C.band.push(mix(ground, blue, 0.05 + b * 0.075));
      C.bandHot.push(mix(ground, blue, 0.14 + b * 0.085));
    }
    C.mesh = mix(ground, rgb(g('--ink-3')), 0.22);
    C.meshHot = mix(ground, blue, 0.72);
  }

  /* ── camera ──────────────────────────────────────────────────────── */

  var cam = { az: 0.42, el: 0.52 };
  var W = 0, Hh = 0, S = 1, CX = 0, CY = 0, ZS = 1.1;
  var ca, sa, ce, se;

  function frameCam() {
    ca = Math.cos(cam.az); sa = Math.sin(cam.az);
    ce = Math.cos(cam.el); se = Math.sin(cam.el);
  }
  // world (x, y, z) -> [screenX, screenY, depth]; bigger depth = farther
  function P3(x, y, z) {
    var xr = x * ca - y * sa;
    var yr = x * sa + y * ca;
    var zz = (z - (zMax + FLOOR) / 2) * ZS;
    return [CX + S * xr, CY - S * (yr * se + zz * ce), yr * ce - zz * se];
  }

  function resize() {
    var r = stage.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; Hh = r.height;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(Hh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    S = Math.min(W / 3.2, Hh / 2.85);
    CX = W / 2;
    CY = Hh * 0.47;
    dirty = true;
  }

  /* ── state ───────────────────────────────────────────────────────── */

  var active = 2;
  var lead = STOP_AT[active];     // how far along PATH the accent reaches
  var packet = 0;                 // 0..1 along the lead
  var dirty = true;

  function hotness(x, y) {
    var s = STOPS[active];
    var dx = x - s.x, dy = y - s.y;
    return dx * dx + dy * dy < 0.075;
  }

  /* ── marching squares on the floor ───────────────────────────────── */

  var CONTOURS = [];
  (function () {
    var levels = 9;
    for (var l = 1; l <= levels; l++) {
      var iso = zMin + (zMax - zMin) * l / (levels + 1);
      for (var j = 0; j < N; j++) for (var i = 0; i < N; i++) {
        var v = [H[j][i], H[j][i + 1], H[j + 1][i + 1], H[j + 1][i]];
        var c = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
        var pts = [];
        for (var e = 0; e < 4; e++) {
          var a = v[e], b = v[(e + 1) % 4];
          if ((a < iso) !== (b < iso)) {
            var t = (iso - a) / (b - a);
            var p = c[e], q = c[(e + 1) % 4];
            pts.push([-1 + 2 * (p[0] + (q[0] - p[0]) * t) / N,
                      -1 + 2 * (p[1] + (q[1] - p[1]) * t) / N]);
          }
        }
        if (pts.length === 2) CONTOURS.push([pts[0], pts[1]]);
        else if (pts.length === 4) {
          CONTOURS.push([pts[0], pts[1]]);
          CONTOURS.push([pts[2], pts[3]]);
        }
      }
    }
  })();

  /* ── draw ────────────────────────────────────────────────────────── */

  function label(txt, x, y, colour, align) {
    ctx.textAlign = align || 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = C.bg;            // a halo of ground, so mesh never cuts a label
    ctx.strokeText(txt, x, y);
    ctx.fillStyle = colour;
    ctx.fillText(txt, x, y);
  }

  function draw() {
    frameCam();
    ctx.clearRect(0, 0, W, Hh);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.font = '12px ' + C.mono;

    // floor: frame, contours, stop crosses
    var fc = [P3(-1, -1, FLOOR), P3(1, -1, FLOOR), P3(1, 1, FLOOR), P3(-1, 1, FLOOR)];
    ctx.beginPath();
    ctx.moveTo(fc[0][0], fc[0][1]);
    for (var k = 1; k < 4; k++) ctx.lineTo(fc[k][0], fc[k][1]);
    ctx.closePath();
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.lineWidth = 1;
    for (var n = 0; n < CONTOURS.length; n++) {
      var sg = CONTOURS[n];
      var a = P3(sg[0][0], sg[0][1], FLOOR), b = P3(sg[1][0], sg[1][1], FLOOR);
      var hot = hotness((sg[0][0] + sg[1][0]) / 2, (sg[0][1] + sg[1][1]) / 2);
      ctx.strokeStyle = hot ? C.blue : C.dim;
      ctx.globalAlpha = hot ? 0.9 : 0.45;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    STOPS.forEach(function (s, i) {
      var p = P3(s.x, s.y, FLOOR);
      var on = i === active;
      ctx.strokeStyle = on ? C.blue : C.dim;
      ctx.beginPath();
      ctx.moveTo(p[0] - 4, p[1]); ctx.lineTo(p[0] + 4, p[1]);
      ctx.moveTo(p[0], p[1] - 4); ctx.lineTo(p[0], p[1] + 4);
      ctx.stroke();
      label('x' + s.sub, p[0] + 7, p[1] + 4, on ? C.blue : C.dim, 'left');
    });
    var hp = P3(HOLLOW.x, HOLLOW.y, FLOOR);
    label('seam', hp[0], hp[1] + 4, C.dim);

    // surface + path, one sort
    var items = [];
    for (var j = 0; j < N; j++) for (var i = 0; i < N; i++) {
      var x0 = -1 + 2 * i / N, x1 = -1 + 2 * (i + 1) / N;
      var y0 = -1 + 2 * j / N, y1 = -1 + 2 * (j + 1) / N;
      var q = [P3(x0, y0, H[j][i]), P3(x1, y0, H[j][i + 1]),
               P3(x1, y1, H[j + 1][i + 1]), P3(x0, y1, H[j + 1][i])];
      var zc = (H[j][i] + H[j][i + 1] + H[j + 1][i + 1] + H[j + 1][i]) / 4;
      var band = Math.min(BANDS - 1, Math.floor((zc - zMin) / (zMax - zMin) * BANDS));
      items.push({
        d: (q[0][2] + q[1][2] + q[2][2] + q[3][2]) / 4,
        q: q, band: band, hot: hotness((x0 + x1) / 2, (y0 + y1) / 2)
      });
    }
    var leadN = Math.round(lead);
    for (var m = 0; m < PATH.length - 1; m++) {
      var pa = P3(PATH[m][0], PATH[m][1], PATH[m][2]);
      var pb = P3(PATH[m + 1][0], PATH[m + 1][1], PATH[m + 1][2]);
      items.push({ d: (pa[2] + pb[2]) / 2 - 0.02, seg: [pa, pb], lit: m < leadN });
    }
    items.sort(function (u, v) { return v.d - u.d; });

    for (var t = 0; t < items.length; t++) {
      var it = items[t];
      if (it.q) {
        ctx.beginPath();
        ctx.moveTo(it.q[0][0], it.q[0][1]);
        ctx.lineTo(it.q[1][0], it.q[1][1]);
        ctx.lineTo(it.q[2][0], it.q[2][1]);
        ctx.lineTo(it.q[3][0], it.q[3][1]);
        ctx.closePath();
        ctx.fillStyle = it.hot ? C.bandHot[it.band] : C.band[it.band];
        ctx.fill();
        ctx.strokeStyle = it.hot ? C.meshHot : C.mesh;
        ctx.lineWidth = it.hot ? 0.9 : 0.6;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(it.seg[0][0], it.seg[0][1]);
        ctx.lineTo(it.seg[1][0], it.seg[1][1]);
        ctx.strokeStyle = it.lit ? C.blue : C.ink;
        ctx.globalAlpha = it.lit ? 1 : 0.35;
        ctx.lineWidth = it.lit ? 2.4 : 1.2;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // drop lines, floor to stop — drawn through the surface, as in any
    // textbook plot of this kind, so the correspondence is never hidden
    STOPS.forEach(function (s, i) {
      var a = P3(s.x, s.y, FLOOR), b = P3(s.x, s.y, s.z);
      ctx.strokeStyle = i === active ? C.blue : C.dim;
      ctx.globalAlpha = i === active ? 0.9 : 0.5;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    });

    // packet on the lead
    if (!reduced && lead > 1) {
      var fpos = packet * lead, k0 = Math.floor(fpos), k1 = Math.min(k0 + 1, PATH.length - 1);
      var tt = fpos - k0, A = PATH[k0], B = PATH[k1];
      var pk = P3(A[0] + (B[0] - A[0]) * tt, A[1] + (B[1] - A[1]) * tt, A[2] + (B[2] - A[2]) * tt);
      ctx.fillStyle = C.blue;
      ctx.beginPath();
      ctx.arc(pk[0], pk[1], 3.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // stop markers and labels, always on top
    STOPS.forEach(function (s, i) {
      var p = P3(s.x, s.y, s.z + 0.012);
      var on = i === active;
      ctx.beginPath();
      ctx.arc(p[0], p[1], on ? 5.5 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = on ? C.blue : C.bg;
      ctx.fill();
      ctx.strokeStyle = C.blue;
      ctx.lineWidth = 2;
      ctx.stroke();
      label('0' + (i + 1) + ' ' + s.key, p[0], p[1] - 14, on ? C.ink : C.dim);
    });

    dirty = false;
  }

  /* ── panels and tabs ─────────────────────────────────────────────── */

  var tabs = [].slice.call(fig.querySelectorAll('.terrain-tab'));
  var panels = [].slice.call(fig.querySelectorAll('.terrain-panel'));

  function tween(el, to) {
    var from = parseFloat(el.getAttribute('data-v')) || 0;
    el.setAttribute('data-v', to);
    if (reduced) { el.textContent = to.toFixed(2); return; }
    var t0 = null;
    raf(function step(ts) {
      if (t0 === null) t0 = ts;
      var u = Math.min(1, (ts - t0) / 700), e = 1 - Math.pow(1 - u, 3);
      el.textContent = (from + (to - from) * e).toFixed(2);
      if (u < 1) raf(step);
    });
  }

  function fillFigures(panel, i, animate) {
    var z = panel.querySelector('[data-z]'), c = panel.querySelector('[data-c]');
    if (!animate) {
      if (z) { z.textContent = STOPS[i].z.toFixed(2); z.setAttribute('data-v', STOPS[i].z); }
      if (c) { c.textContent = STOPS[i].carried.toFixed(2); c.setAttribute('data-v', STOPS[i].carried); }
      return;
    }
    if (z) { z.setAttribute('data-v', 0); tween(z, STOPS[i].z); }
    if (c) { c.setAttribute('data-v', 0); tween(c, STOPS[i].carried); }
  }

  function select(i, focus) {
    active = i;
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    panels.forEach(function (p, k) {
      var on = k === i;
      p.classList.toggle('is-on', on);
      p.classList.remove('is-entering');
      if (on) {
        void p.offsetWidth;
        p.classList.add('is-entering');
        fillFigures(p, k, true);
      }
    });
    if (reduced) lead = STOP_AT[i];
    packet = 0;
    dirty = true;
    kick();
  }

  tabs.forEach(function (t, k) {
    t.addEventListener('click', function () { select(k, false); });
    t.addEventListener('keydown', function (e) {
      var n = tabs.length, to = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = (k + 1) % n;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = (k - 1 + n) % n;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = n - 1;
      if (to === null) return;
      e.preventDefault();
      select(to, true);
    });
  });

  /* ── drag to turn ────────────────────────────────────────────────── */

  var drag = null, lastTouch = 0;
  stage.addEventListener('pointerdown', function (e) {
    drag = { x: e.clientX, y: e.clientY, az: cam.az, el: cam.el, touch: e.pointerType === 'touch' };
    stage.classList.add('is-drag', 'is-touched');
    if (stage.setPointerCapture) stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', function (e) {
    if (!drag) return;
    cam.az = drag.az + (e.clientX - drag.x) * 0.0085;
    if (!drag.touch) {
      cam.el = Math.max(0.22, Math.min(1.15, drag.el + (e.clientY - drag.y) * 0.004));
    }
    lastTouch = Date.now();
    dirty = true;
    kick();
  });
  function end() {
    drag = null;
    lastTouch = Date.now();
    stage.classList.remove('is-drag');
  }
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);

  /* ── loop: only while on screen ──────────────────────────────────── */

  var visible = false, running = false, last = 0;
  function frame(ts) {
    var dt = last ? Math.min(64, ts - last) : 16;
    last = ts;
    if (!reduced) {
      var target = STOP_AT[active];
      if (Math.abs(lead - target) > 0.5) { lead += (target - lead) * Math.min(1, dt / 160); }
      else lead = target;
      packet = (packet + dt / (1600 + lead * 12)) % 1;
      if (!drag && Date.now() - lastTouch > 3500) cam.az += dt * 0.00007;
      dirty = true;
    }
    if (dirty) draw();
    if (visible && !reduced) raf(frame);
    else { running = false; last = 0; }
  }
  function kick() {
    if (running) return;
    running = true;
    raf(frame);
  }

  /* ── boot ────────────────────────────────────────────────────────── */

  fig.classList.add('is-live');
  readColours();
  resize();
  select(active, false);
  panels.forEach(function (p, k) { if (k !== active) fillFigures(p, k, false); });

  if ('ResizeObserver' in window) new ResizeObserver(function () { resize(); kick(); }).observe(stage);
  else window.addEventListener('resize', function () { resize(); kick(); });

  new MutationObserver(function () { readColours(); dirty = true; kick(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-mode'] });
  new MutationObserver(function () { readColours(); dirty = true; kick(); })
    .observe(document.body, { attributes: true, attributeFilter: ['class'] });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) kick();
    }).observe(stage);
  } else {
    visible = true;
    kick();
  }
})();
