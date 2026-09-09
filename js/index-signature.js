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
 *   4. the layer belts: scroll-momentum marquee, a torch that lifts what
 *      is under the cursor, and a beam round the card you are on
 *   5. a pointer spotlight on the hero grid, and a two-degree tilt on the
 *      layer plates
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

  /* ── 3. the topology, wired to the confidence bars ────────────────── */
  /* Each node already corresponds to a layer the card lists underneath;
     this only makes that correspondence visible. No new labels. */

  (function wireTopology() {
    var card = document.querySelector('.sys-card');
    if (!card) return;

    var nodes = card.querySelectorAll('.topo .node[data-skill]');
    var skills = card.querySelectorAll('.tc-skill');
    if (!nodes.length || !skills.length) return;

    function clear() {
      card.classList.remove('probing');
      nodes.forEach(function (n) { n.classList.remove('sel'); });
      skills.forEach(function (s) { s.classList.remove('lit'); });
    }

    function probe(node) {
      var i = parseInt(node.getAttribute('data-skill'), 10);
      if (isNaN(i) || !skills[i]) return;
      card.classList.add('probing');
      nodes.forEach(function (n) { n.classList.toggle('sel', n === node); });
      skills.forEach(function (s, k) { s.classList.toggle('lit', k === i); });
    }

    nodes.forEach(function (node) {
      node.addEventListener('mouseenter', function () { probe(node); });
      node.addEventListener('focus', function () { probe(node); });
      node.addEventListener('click', function () { probe(node); });
      node.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); probe(node); }
      });
    });

    card.addEventListener('mouseleave', clear);
    card.addEventListener('focusout', function (e) {
      if (!card.contains(e.relatedTarget)) clear();
    });
  })();

  /* ── 4. THE LAYER BELTS ───────────────────────────────────────────────
     Two conveyor belts carrying the six layers.

     Taking them off CSS keyframes and onto a frame loop buys three
     things the keyframes could not do: they carry the momentum of your
     scroll, they ease down when you reach for a card instead of
     stopping dead, and they stay in step when the tab is backgrounded.

     Everything degrades: under reduced motion the belts are left alone
     as a pair of ordinary scrollable rows. */

  (function belts() {
    var outer = document.querySelector('.exp-marquee-outer');
    if (!outer || reduced) return;

    var tracks = [].slice.call(outer.querySelectorAll('.exp-mq-track'));
    if (!tracks.length) return;

    outer.classList.add('js');

    /* The row duplicates its cards for a seamless loop, so one cycle is
       half the content — but scrollWidth counts the gaps *between* cards
       and there is one fewer gap than card. Half of scrollWidth is
       therefore half a gap short, which is what makes a naive -50%
       marquee drift into a visible seam. Add the gap back before
       halving. */
    function cycle(el) {
      var gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      return (el.scrollWidth + gap) / 2;
    }

    var belts = tracks.map(function (el) {
      var span = cycle(el);
      var right = el.classList.contains('track-r');
      return {
        el: el,
        span: span,
        dir: right ? 1 : -1,
        base: right ? 26 : 30,          // px per second
        x: right ? -span : 0
      };
    });

    function remeasure() {
      belts.forEach(function (b) {
        b.span = cycle(b.el);
        if (b.x < -b.span) b.x = -b.span;
      });
    }
    window.addEventListener('resize', remeasure, { passive: true });
    window.addEventListener('load', remeasure);   // fonts settle the widths

    /* momentum picked up from the page scroll, decaying every frame */
    var boost = 0, lastY = window.scrollY;
    window.addEventListener('scroll', function () {
      var dy = window.scrollY - lastY;
      lastY = window.scrollY;
      boost += dy * 0.9;
      if (boost > 900) boost = 900;
      if (boost < -900) boost = -900;
    }, { passive: true });

    /* reaching for a card slows the belt rather than freezing it */
    var slow = 1;
    outer.addEventListener('mouseenter', function () { slow = 0.12; });
    outer.addEventListener('mouseleave', function () { slow = 1; });

    var last = 0;
    function frame(now) {
      var dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      boost *= 0.94;

      belts.forEach(function (b) {
        if (!b.span) { b.span = cycle(b.el); return; }
        b.x += b.dir * (b.base * slow + Math.abs(boost) * 0.35) * dt;
        // wrap on the duplicated half so the seam never shows
        if (b.x <= -b.span) b.x += b.span;
        if (b.x >= 0) b.x -= b.span;
        b.el.style.transform = 'translate3d(' + b.x.toFixed(2) + 'px,0,0)';
      });

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    /* ── the torch ── */
    if (!window.matchMedia('(hover: hover)').matches) return;

    var torch = document.createElement('div');
    torch.className = 'exp-torch';
    outer.appendChild(torch);

    var pending = false, tx = 50, ty = 50;
    outer.addEventListener('mousemove', function (e) {
      var r = outer.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 100;
      ty = ((e.clientY - r.top) / r.height) * 100;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        torch.style.setProperty('--sig-tx', tx.toFixed(2) + '%');
        torch.style.setProperty('--sig-ty', ty.toFixed(2) + '%');
      });
    }, { passive: true });

    outer.addEventListener('mouseenter', function () { outer.classList.add('lit'); });
    outer.addEventListener('mouseleave', function () { outer.classList.remove('lit'); });
  })();

  if (reduced) return;

  /* ── 5a. pointer spotlight on the hero grid ───────────────────────── */

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

  /* ── 5b. two degrees of tilt on the layer plates ──────────────────── */

  (function tilt() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    var MAX = 2;   // degrees; the whole effect

    document.querySelectorAll('.exp-mcard').forEach(function (card) {
      var pending = false, rx = 0, ry = 0;

      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        ry = (((e.clientX - r.left) / r.width) - 0.5) * (MAX * 2);
        rx = (0.5 - ((e.clientY - r.top) / r.height)) * (MAX * 2);
        if (pending) return;
        pending = true;
        raf(function () {
          pending = false;
          card.style.setProperty('--sig-ry', ry.toFixed(2) + 'deg');
          card.style.setProperty('--sig-rx', rx.toFixed(2) + 'deg');
          card.classList.add('tilt');
        });
      }, { passive: true });

      card.addEventListener('mouseleave', function () {
        card.classList.remove('tilt');
        card.style.removeProperty('--sig-rx');
        card.style.removeProperty('--sig-ry');
      });
    });
  })();
})();
