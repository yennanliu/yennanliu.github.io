/*
 * INDEX — SIGNATURE LAYER
 *
 * Four behaviours, all additive: the page works without any of them.
 *
 *   1. a read-progress hairline across the top
 *   2. a pipeline rail down the left edge that tracks which section you
 *      are in, and jumps you to one when clicked
 *   3. the hero topology wired to the confidence bars underneath it, so
 *      taking a node tells you which layer it belongs to
 *   4. the layer stack: six plates you can take apart, as a tablist
 *   5. a pointer spotlight on the hero grid
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

  if (reduced) return;

  /* ── 5. pointer spotlight on the hero grid ────────────────────────── */

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
