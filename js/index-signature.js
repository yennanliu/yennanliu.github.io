/*
 * INDEX — SIGNATURE LAYER
 *
 * Five behaviours, all additive: the page works without any of them.
 *
 *   1. a read-progress hairline across the top
 *   2. a pipeline rail down the left edge that tracks which section you
 *      are in, and jumps you to one when clicked
 *   3. the hero topology wired to the confidence bars underneath it, so
 *      taking a node tells you which layer it belongs to
 *   4. the layer stack: six plates you can take apart, as a tablist
 *   5. the trajectory chart: a scrubbable curve with a live packet
 *   6. a pointer spotlight on the hero grid
 *
 * Anything motion-driven is skipped outright when the reader has asked
 * for reduced motion.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  /* ── 1 + 2. progress hairline and pipeline rail ───────────────────── */

  var SECTIONS = [
    { id: 'hero',      label: 'Top' },
    { id: 'expertise', label: 'Layers' },
    { id: 'career',    label: 'Trajectory' },
    { id: 'terrain',   label: 'Terrain' },
    { id: 'projects',  label: 'Work' },
    { id: 'contact',   label: 'Contact' }
  ];

  function buildRail() {
    var bar = document.createElement('div');
    bar.id = 'sig-progress';
    document.body.appendChild(bar);

    var rail = document.createElement('ul');
    rail.id = 'sig-rail';
    rail.setAttribute('aria-label', 'Page sections');

    var stops = [];
    SECTIONS.forEach(function (s, i) {
      var el = document.getElementById(s.id);
      if (!el) return;

      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sig-stop';
      btn.innerHTML = '<i aria-hidden="true"></i><span>'
        + String(i + 1).padStart(2, '0') + ' ' + s.label + '</span>';
      btn.setAttribute('aria-label', 'Jump to ' + s.label);
      btn.addEventListener('click', function () {
        el.scrollIntoView({
          behavior: reduced ? 'auto' : 'smooth',
          block: 'start'
        });
      });
      li.appendChild(btn);
      rail.appendChild(li);
      stops.push({ btn: btn, el: el });
    });

    document.body.appendChild(rail);
    return { bar: bar, rail: rail, stops: stops };
  }

  var ui = buildRail();

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    raf(function () {
      ticking = false;

      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      ui.bar.style.setProperty('--sig-p', p.toFixed(4));

      // the stop whose top has most recently passed the reading line
      var line = window.scrollY + window.innerHeight * 0.35;
      var active = 0;
      ui.stops.forEach(function (s, i) {
        if (s.el.offsetTop <= line) active = i;
      });
      ui.stops.forEach(function (s, i) {
        s.btn.classList.toggle('on', i === active);
      });

      var denom = ui.stops.length - 1;
      ui.rail.style.setProperty(
        '--sig-rail-p', denom > 0 ? (active / denom).toFixed(3) : '0');
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ── 3. the card: five systems, one drawn at random ─────────────────── */
  /* Each system is read two ways: a topology on top (structure) and the
     trace of one run through it underneath (time). Every span names the
     node it runs on, so pointing at either drawing lights the other, and
     the replay lights whichever node is doing work.

     The markup ships the first system, complete. The script draws a
     random one over it and puts a switch in the title bar; without JS
     you get the first system with its waterfall finished.

     Five node slots and one edge vocabulary are shared by all five —
     a new system is data, not new drawing code. Figures are samples,
     which the title bar says. */

  var SLOT = { a: [48, 38], b: [180, 38], c: [312, 38], d: [102, 148], e: [246, 148] };

  var SYSTEMS = [
    { title: 'pipeline — ingest to serve', sub: 'one request, every layer',
      req: 'POST /ask', unit: 'ms', T: 412,
      nodes: { a: 'ingest', b: 'stream', c: 'model', d: 'store', e: 'serve' },
      edges: ['ab', 'bc', 'bd', 'ce', 'de'],
      spans: [
        ['serve',  'POST /ask',      0, 412, 0],
        ['store',  'retrieve',      22,  88, 1],
        ['model',  'generate',      92, 396, 1],
        ['stream', 'tokens out',   128, 404, 2],
        ['ingest', 'log → kafka',  398, 412, 1]
      ] },
    { title: 'agent — thought, action, observation', sub: 'one task, every turn',
      req: 'agent · triage', unit: 'ms', T: 2840,
      nodes: { a: 'query', b: 'agent', c: 'tools', d: 'memory', e: 'loop' },
      edges: ['ab', 'bc', 'bd', 'ce', 'de', 'eb~'],
      spans: [
        ['query',  'run task',        0, 2840, 0],
        ['agent',  'plan',           40,  620, 1],
        ['memory', 'recall',         80,  190, 2],
        ['tools',  'search · sql',  640, 1480, 1],
        ['loop',   'observe → retry', 1500, 2310, 1],
        ['agent',  'answer',       2330, 2800, 1]
      ] },
    { title: 'rag — the knowledge engine', sub: 'one index job, every stage',
      req: 'POST /index', unit: 's', T: 38,
      nodes: { a: 'docs', b: 'chunk', c: 'embed', d: 'rerank', e: 'vectors' },
      edges: ['ab', 'bc', 'ce', 'de'],
      spans: [
        ['docs',    'index job',       0, 38, 0],
        ['docs',    'parse pdf · web', 1,  6, 1],
        ['chunk',   'split semantic',  5, 11, 1],
        ['embed',   'batch × 24',     10, 29, 1],
        ['vectors', 'upsert',         26, 34, 1],
        ['rerank',  'eval recall@10', 33, 38, 1]
      ] },
    { title: 'deploy — the body and the scale', sub: 'one rollout, every hop',
      req: 'rollout · v2.4', unit: 's', T: 186,
      nodes: { a: 'image', b: 'registry', c: 'k8s', d: 'gpu', e: 'serve' },
      edges: ['ab', 'bc', 'ce', 'de', 'cd~'],
      spans: [
        ['k8s',      'rollout',        0, 186, 0],
        ['image',    'build · docker', 0,  64, 1],
        ['registry', 'push · ecr',    64,  82, 1],
        ['k8s',      'schedule pods', 82, 110, 1],
        ['gpu',      'warm · vllm',  104, 160, 2],
        ['serve',    'canary · 5%',  158, 186, 1]
      ] },
    { title: 'observe — health and performance', sub: 'one nightly run, every signal',
      req: 'eval run · nightly', unit: 's', T: 540,
      nodes: { a: 'traces', b: 'metrics', c: 'logs', d: 'evals', e: 'tune' },
      edges: ['ab', 'bc', 'bd', 'ce', 'de'],
      spans: [
        ['evals',   'nightly run',       0, 540, 0],
        ['traces',  'sample 2k',         0,  90, 1],
        ['metrics', 'p99 · cost',       80, 150, 1],
        ['logs',    'scan errors',     120, 230, 1],
        ['evals',   'judge · ragas',   220, 470, 1],
        ['tune',    'flag regressions', 470, 540, 1]
      ] }
  ];

  var SVGNS = 'http://www.w3.org/2000/svg';

  function edgePath(pair) {
    var p = SLOT[pair[0]], q = SLOT[pair[1]];
    if (p[1] === q[1]) {                       /* same row: box edge to box edge */
      var l = p[0] < q[0] ? p : q, r = p[0] < q[0] ? q : p;
      return 'M' + (l[0] + 42) + ',' + l[1] + ' H' + (r[0] - 42);
    }
    var top = p[1] < q[1] ? p : q, bot = p[1] < q[1] ? q : p;
    return 'M' + top[0] + ',54 C' + top[0] + ',98 ' + bot[0] + ',88 ' + bot[0] + ',132';
  }

  function drawTopology(svg, sys) {
    var html = '', flows = '', groups = '';
    sys.edges.forEach(function (e, i) {
      var d = edgePath(e), loop = e.charAt(2) === '~';
      html += '<path class="edge-base' + (loop ? ' edge-loop' : '') + '" d="' + d + '"></path>';
      flows += '<path class="edge-flow' + (i ? ' f' + (Math.min(i, 4) + 1) : '') + '" d="' + d + '"></path>';
    });
    Object.keys(SLOT).forEach(function (k) {
      var x = SLOT[k][0], y = SLOT[k][1], name = sys.nodes[k];
      groups += '<g class="node" data-node="' + name + '" role="button" tabindex="0" aria-label="' + name + ' layer">'
        + '<rect class="hitpad" x="' + (x - 48) + '" y="' + (y - 22) + '" width="96" height="44"></rect>'
        + '<rect class="node-box" x="' + (x - 42) + '" y="' + (y - 16) + '" width="84" height="32" rx="5"></rect>'
        + '<text class="node-txt" x="' + x + '" y="' + (y + 4) + '" text-anchor="middle">' + name + '</text></g>';
    });
    svg.innerHTML = html + flows + groups;
    svg.setAttribute('aria-label', 'System topology: ' + sys.title);
  }

  function fmt(v, unit) { return unit === 's' ? v + '&thinsp;s' : v + '&thinsp;ms'; }

  function drawTrace(trace, axis, sys) {
    trace.style.setProperty('--T', sys.T);
    trace.innerHTML = sys.spans.map(function (sp) {
      return '<div class="span" role="listitem" data-node="' + sp[0] + '" style="--s:' + sp[2] + ';--e:' + sp[3] + ';--d:' + sp[4] + '">'
        + '<span class="sp-name"><b>' + sp[0] + '</b> ' + sp[1] + '</span>'
        + '<span class="sp-track"><span class="sp-bar"></span></span>'
        + '<span class="sp-ms">' + (sp[3] - sp[2]) + '</span></div>';
    }).join('');
    trace.setAttribute('aria-label', 'Sample trace of ' + sys.req + ', ' + sys.T + ' ' + sys.unit + ' end to end');
    var mid = Math.round(sys.T / 2);          /* sits at the centre, so it must be T/2 */
    axis.innerHTML = '<span>0</span><span>' + mid + '</span><span>' + fmt(sys.T, sys.unit) + '</span>';
  }

  (function card() {
    var card = document.querySelector('.sys-card');
    if (!card) return;
    var svg = card.querySelector('.topo');
    var trace = card.querySelector('.trace');
    var axis = card.querySelector('.trace-axis');
    var next = card.querySelector('.tc-next');
    if (!svg || !trace || !axis) return;

    var current = 0, bounds = [], nodes = [], probing = false;

    function collect() {
      var T = parseFloat(trace.style.getPropertyValue('--T')) || 1;
      nodes = [].slice.call(svg.querySelectorAll('.node[data-node]'));
      bounds = [].slice.call(trace.querySelectorAll('.span')).map(function (el) {
        return { el: el, node: el.getAttribute('data-node'), T: T,
                 s: parseFloat(el.style.getPropertyValue('--s')),
                 e: parseFloat(el.style.getPropertyValue('--e')),
                 bar: el.querySelector('.sp-bar') };
      });
    }

    function show(i) {
      var sys = SYSTEMS[i];
      current = i;
      card.querySelector('.tc-title').textContent = sys.title;
      card.querySelector('.tc-sub').textContent = sys.sub;
      card.querySelector('.tc-path').textContent = 'sample trace · ' + sys.req;
      card.querySelector('.tc-total').innerHTML = fmt(sys.T, sys.unit);
      drawTopology(svg, sys);
      drawTrace(trace, axis, sys);
      if (next) next.textContent = '0' + (i + 1) + '/0' + SYSTEMS.length;
      collect();
      clear();
      trace.removeAttribute('data-at');
      tStart = null;
    }

    /* probing — delegated, so it survives a redraw */
    function clear() {
      probing = false;
      card.classList.remove('probing');
      nodes.forEach(function (n) { n.classList.remove('sel'); });
      bounds.forEach(function (b) { b.el.classList.remove('lit'); });
    }
    function probe(name) {
      if (!name) return;
      probing = true;
      card.classList.add('probing');
      nodes.forEach(function (n) { n.classList.toggle('sel', n.getAttribute('data-node') === name); });
      bounds.forEach(function (b) { b.el.classList.toggle('lit', b.node === name); });
    }
    function target(e) {
      var t = e.target.closest && e.target.closest('.node[data-node], .span[data-node]');
      return t && card.contains(t) ? t.getAttribute('data-node') : null;
    }
    card.addEventListener('mouseover', function (e) { var n = target(e); if (n) probe(n); });
    card.addEventListener('focusin', function (e) { var n = target(e); if (n) probe(n); });
    card.addEventListener('click', function (e) { var n = target(e); if (n) probe(n); });
    card.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var n = target(e);
      if (n) { e.preventDefault(); probe(n); }
    });
    card.addEventListener('mouseleave', clear);
    card.addEventListener('focusout', function (e) {
      if (!card.contains(e.relatedTarget)) clear();
    });

    /* the replay: 0..T over RUN ms, a beat at the end, again */
    var RUN = 4200, HOLD = 1600, tStart = null, visible = true, looping = false;

    function paint(t) {
      var on = {};
      trace.style.setProperty('--c', (bounds.length ? t / bounds[0].T : 1).toFixed(4));
      bounds.forEach(function (b) {
        var f = Math.max(0, Math.min(1, (t - b.s) / Math.max(1e-6, b.e - b.s)));
        b.bar.style.setProperty('--f', f.toFixed(3));
        var run = t >= b.s && t < b.e;
        b.el.classList.toggle('is-run', run);
        if (run && b.el.style.getPropertyValue('--d').trim() !== '0') on[b.node] = true;
      });
      nodes.forEach(function (n) { n.classList.toggle('is-run', !!on[n.getAttribute('data-node')]); });
    }
    function tick(ts) {
      if (!visible) { looping = false; return; }
      if (probing) { tStart = null; raf(tick); return; }   /* hold still while read */
      if (tStart === null) tStart = ts - (parseFloat(trace.getAttribute('data-at')) || 0);
      var el = (ts - tStart) % (RUN + HOLD);
      trace.setAttribute('data-at', el);
      paint(Math.min(el, RUN) / RUN * (bounds.length ? bounds[0].T : 1));
      trace.classList.toggle('is-playing', el < RUN);
      raf(tick);
    }
    function start() {
      if (looping || reduced) return;
      looping = true;
      tStart = null;
      raf(tick);
    }

    show(Math.floor(Math.random() * SYSTEMS.length));

    if (next) {
      next.hidden = false;
      next.addEventListener('click', function () {
        show((current + 1) % SYSTEMS.length);
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

  /* ── 3b. the headline: drafted, then shipped ──────────────────────── */
  /* The outline state is added here, not in CSS, and taken away once
     the fill has played — so a stalled clock leaves solid type. */

  (function draftToProduction() {
    var h1 = document.querySelector('.hero-h1');
    if (!h1 || reduced || !(window.CSS && CSS.supports('-webkit-text-stroke', '1px'))) return;
    var word = h1.querySelector('.line-blue');
    if (!word) return;
    h1.classList.add('is-draft');
    function done() { h1.classList.remove('is-draft', 'is-fill'); }
    setTimeout(function () {
      h1.classList.add('is-fill');
      h1.classList.remove('is-draft');
      setTimeout(done, 1400);           /* transitionend on a pseudo is unreliable */
    }, 1250);                            /* after the third line has risen */
  })();


  /* ── 4. THE STACK ─────────────────────────────────────────────────────
     Six plates, one open seam. A proper tablist: arrows and Home/End
     move between plates, the selected one is the only tab stop, and the
     panels carry hidden so assistive tech and the eye agree.

     Pointing at a plate opens it — there is nothing destructive behind
     it, so making you click would only add a step. */

  (function stack() {
    var root = document.getElementById('stack');
    if (!root) return;

    var plates = [].slice.call(root.querySelectorAll('.plate'));
    var seams = [].slice.call(root.querySelectorAll('.seam'));
    if (plates.length !== seams.length || !plates.length) return;

    plates.forEach(function (p, i) { p.style.setProperty('--i', i); });

    /* script is live, so it may now take responsibility for what shows */
    root.classList.add('arming');
    seams.forEach(function (sm, i) {
      sm.hidden = i !== 0;
      sm.classList.toggle('is-on', i === 0);
    });

    var current = 0;

    function open(i, moveFocus) {
      if (i === current) return;
      current = i;
      plates.forEach(function (p, k) {
        var on = k === i;
        p.classList.toggle('is-on', on);
        p.setAttribute('aria-selected', on ? 'true' : 'false');
        p.tabIndex = on ? 0 : -1;
      });
      seams.forEach(function (s, k) {
        var on = k === i;
        s.hidden = !on;
        s.classList.toggle('is-on', on);
      });
      wire(i);
      if (moveFocus) plates[i].focus();
    }

    /* line the connector up with the middle of the open plate, so the
       pair reads as wired together rather than merely adjacent */
    function wire(i) {
      var seam = seams[i];
      if (!seam || seam.hidden) return;
      var pr = plates[i].getBoundingClientRect();
      var sr = seam.getBoundingClientRect();
      if (!sr.height) return;
      seam.style.setProperty(
        '--seam-y', (pr.top + pr.height / 2 - sr.top).toFixed(1) + 'px');
    }

    window.addEventListener('resize', function () { wire(current); },
                            { passive: true });

    plates.forEach(function (p, i) {
      p.addEventListener('mouseenter', function () { open(i); });
      p.addEventListener('focus', function () { open(i); });
      p.addEventListener('click', function () { open(i); });

      p.addEventListener('keydown', function (e) {
        var k = e.key, next = null;
        if (k === 'ArrowDown' || k === 'ArrowRight') next = (i + 1) % plates.length;
        else if (k === 'ArrowUp' || k === 'ArrowLeft') next = (i - 1 + plates.length) % plates.length;
        else if (k === 'Home') next = 0;
        else if (k === 'End') next = plates.length - 1;
        if (next === null) return;
        e.preventDefault();
        open(next, true);
      });
    });

    /* the stack assembles itself once it is on screen */
    function build() {
      if (root.classList.contains('built')) return;
      root.classList.add('built');
      wire(current);
      /* once the entrance has played, drop the class that drives it, so
         the resting state carries no rule that could hide a plate */
      setTimeout(function () { root.classList.remove('arming'); }, 1200);
    }

    if (reduced || !('IntersectionObserver' in window)) {
      build();
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        build();
        obs.disconnect();
      });
    }, { threshold: 0.2 });
    obs.observe(root);

    /* a stack that is never scrolled to must still end up visible */
    setTimeout(build, 4000);
  })();


  /* ── 5. THE TRAJECTORY ────────────────────────────────────────────────
     The page already had a handler toggling .active on the stops and
     panels; this adds what that handler cannot know — where along the
     curve a given year actually sits.

     Everything below is measured off the path itself rather than
     hard-coded, so the numbers stay right if the curve is ever redrawn. */

  (function trajectory() {
    var box = document.querySelector('.trace-box');
    var path = document.getElementById('tracePath');
    if (!box || !path) return;

    var lead = box.querySelector('.traceLead');
    var clip = box.querySelector('.traceClipRect');
    var packet = box.querySelector('.tracePacket');
    var stops = [].slice.call(box.querySelectorAll('.stop'));
    var panels = [].slice.call(document.querySelectorAll('.era-panel'));
    if (!lead || !clip || !stops.length) return;

    var total = path.getTotalLength();
    lead.style.setProperty('--lead-len', total.toFixed(1));

    /* walk the path to find how far along it a given x falls */
    function lengthAtX(x) {
      var lo = 0, hi = total;
      for (var i = 0; i < 22; i++) {
        var mid = (lo + hi) / 2;
        if (path.getPointAtLength(mid).x < x) lo = mid; else hi = mid;
      }
      return (lo + hi) / 2;
    }

    var marks = stops.map(function (s) {
      var x = parseFloat(s.getAttribute('data-x'));
      return { el: s, era: s.getAttribute('data-era'), x: x, len: lengthAtX(x) };
    });

    /* the packet follows the real path, so the d string is never copied
       into the stylesheet where it could drift out of sync */
    if (packet && 'offsetPath' in packet.style) {
      packet.style.offsetPath = 'path("' + path.getAttribute('d') + '")';
    }

    function scrub(era) {
      var m = null;
      marks.forEach(function (k) { if (k.era === era) m = k; });
      if (!m) return;
      lead.style.strokeDashoffset = (total - m.len).toFixed(1);
      clip.setAttribute('width', m.x.toFixed(1));
    }

    /* ── the figures roll to their new values ── */

    function countUp(panel) {
      if (reduced) return;
      panel.querySelectorAll('.era-mv').forEach(function (el) {
        var raw = el.getAttribute('data-v') || el.textContent.trim();
        el.setAttribute('data-v', raw);
        var m = /^([\d.]+)(.*)$/.exec(raw);
        if (!m) return;
        var target = parseFloat(m[1]);
        var suffix = m[2];
        var decimals = (m[1].split('.')[1] || '').length;
        var t0 = 0;
        function step(now) {
          if (!t0) t0 = now;
          var p = Math.min(1, (now - t0) / 620);
          var e = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * e).toFixed(decimals) + suffix;
          if (p < 1) raf(step);
        }
        el.textContent = (0).toFixed(decimals) + suffix;
        raf(step);
      });
    }

    function activePanel() {
      var found = null;
      panels.forEach(function (p) {
        if (p.classList.contains('active')) found = p;
      });
      return found;
    }

    marks.forEach(function (m) {
      function take() {
        scrub(m.era);
        /* the page's own handler flips .active; read it back rather than
           duplicating that logic here */
        raf(function () {
          var p = activePanel();
          if (p && p.getAttribute('data-era') === m.era) countUp(p);
        });
      }
      m.el.addEventListener('click', take);
      m.el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') take();
      });
    });

    /* ── first draw, once the chart is on screen ── */

    function start() {
      if (box.classList.contains('running')) return;
      box.classList.add('running');

      /* collapse the scope without animating, so the first draw reads as
         filling up rather than retracting from full width */
      clip.style.transition = 'none';
      clip.setAttribute('width', '0');
      void clip.getBoundingClientRect();
      clip.style.transition = '';

      var on = marks[marks.length - 1];
      marks.forEach(function (k) {
        if (k.el.classList.contains('active')) on = k;
      });
      scrub(on.era);
      var p = activePanel();
      if (p) countUp(p);
      /* the years must survive a dropped transition */
      setTimeout(function () { box.classList.add('stops-lit'); }, 2800);
    }

    if (!('IntersectionObserver' in window)) { start(); return; }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        start();
        obs.disconnect();
      });
    }, { threshold: 0.25 });
    obs.observe(box);
    setTimeout(start, 4000);      /* never leave the chart undrawn */
  })();

  if (reduced) return;

  /* ── 6. pointer spotlight on the hero grid ────────────────────────── */

  (function spotlight() {
    var hero = document.getElementById('hero');
    if (!hero || !window.matchMedia('(hover: hover)').matches) return;

    var pending = false, mx = 42, my = 44;
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width) * 100;
      my = ((e.clientY - r.top) / r.height) * 100;
      if (pending) return;
      pending = true;
      raf(function () {
        pending = false;
        hero.style.setProperty('--sig-mx', mx.toFixed(2) + '%');
        hero.style.setProperty('--sig-my', my.toFixed(2) + '%');
      });
    }, { passive: true });
  })();
})();
