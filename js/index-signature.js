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

  /* ── 3. the topology, wired to the trace ──────────────────────────── */
  /* Each node is a span in the waterfall under it: the same request,
     drawn as structure and as time. The replay walks a cursor along the
     time axis and lights whichever node is doing work; pointing at a
     node or a row pauses it and shows the pair. No new labels. */

  (function wireTrace() {
    var card = document.querySelector('.sys-card');
    if (!card) return;
    var trace = card.querySelector('.trace');
    var nodes = [].slice.call(card.querySelectorAll('.topo .node[data-span]'));
    var spans = [].slice.call(card.querySelectorAll('.trace .span'));
    if (!trace || !spans.length) return;

    var T = parseFloat(getComputedStyle(trace).getPropertyValue('--T')) || 1;
    var bounds = spans.map(function (el) {
      var cs = el.style;
      return { el: el, s: parseFloat(cs.getPropertyValue('--s')), e: parseFloat(cs.getPropertyValue('--e')),
               bar: el.querySelector('.sp-bar') };
    });
    function nodeFor(i) {
      for (var k = 0; k < nodes.length; k++) {
        if (+nodes[k].getAttribute('data-span') === i) return nodes[k];
      }
      return null;
    }

    var probing = false;

    function clear() {
      probing = false;
      card.classList.remove('probing');
      nodes.forEach(function (n) { n.classList.remove('sel'); });
      spans.forEach(function (s) { s.classList.remove('lit'); });
    }
    function probe(i) {
      if (isNaN(i) || !spans[i]) return;
      probing = true;
      card.classList.add('probing');
      nodes.forEach(function (n) { n.classList.toggle('sel', +n.getAttribute('data-span') === i); });
      spans.forEach(function (s, k) { s.classList.toggle('lit', k === i); });
    }

    nodes.forEach(function (node) {
      var i = parseInt(node.getAttribute('data-span'), 10);
      node.addEventListener('mouseenter', function () { probe(i); });
      node.addEventListener('focus', function () { probe(i); });
      node.addEventListener('click', function () { probe(i); });
      node.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); probe(i); }
      });
    });
    spans.forEach(function (s, i) {
      s.addEventListener('mouseenter', function () { probe(i); });
    });
    card.addEventListener('mouseleave', clear);
    card.addEventListener('focusout', function (e) {
      if (!card.contains(e.relatedTarget)) clear();
    });

    if (reduced) return;          /* the finished waterfall is the static state */

    // the replay: 0..T over RUN ms, a beat at the end, again
    var RUN = 4200, HOLD = 1600, t0 = null, visible = true, looping = false;

    function paint(ms) {
      trace.style.setProperty('--c', (ms / T).toFixed(4));
      bounds.forEach(function (b, i) {
        var f = Math.max(0, Math.min(1, (ms - b.s) / Math.max(1, b.e - b.s)));
        b.bar.style.setProperty('--f', f.toFixed(3));
        var run = ms >= b.s && ms < b.e;
        b.el.classList.toggle('is-run', run);
        var n = nodeFor(i);
        if (n) n.classList.toggle('is-run', run);
      });
    }
    function tick(ts) {
      if (!visible) { looping = false; return; }
      if (probing) { t0 = null; raf(tick); return; }   /* hold still while read */
      if (t0 === null) t0 = ts - (parseFloat(trace.getAttribute('data-at')) || 0);
      var el = (ts - t0) % (RUN + HOLD);
      trace.setAttribute('data-at', el);
      paint(Math.min(el, RUN) / RUN * T);
      trace.classList.toggle('is-playing', el < RUN);
      raf(tick);
    }
    function start() {
      if (looping) return;
      looping = true;
      t0 = null;
      raf(tick);
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
