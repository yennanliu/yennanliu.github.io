/*
 * INDEX — SIGNATURE LAYER
 *
 * Five behaviours, all additive: the page works without any of them.
 *
 *   1. a read-progress hairline across the top
 *   2. a pipeline rail down the left edge that tracks which section you
 *      are in, and jumps you to one when clicked
 *   3. the hero topology wired to the legend underneath it, so taking a
 *      stage lights the pipes feeding it and says what runs there
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

  /* ── 3. the topology, wired to the legend ─────────────────────────── */
  /* Take a stage and the card answers three ways: the box fills, the pipes
     feeding it carry traffic, and the legend swaps to that stage. Every
     panel ships rendered; this hides the four it is not showing, so the
     markup still reads in order with the script gone. */

  (function wireTopology() {
    var card = document.querySelector('.sys-card');
    if (!card) return;

    var nodes = [].slice.call(card.querySelectorAll('.topo .node[data-rd]'));
    var reads = [].slice.call(card.querySelectorAll('.tc-read .tc-rd'));
    var edges = [].slice.call(card.querySelectorAll('.topo .edge-flow[data-e]'));
    if (!nodes.length || !reads.length) return;

    // Start from whichever stage the markup marked selected.
    var current = nodes.filter(function (n) {
      return n.getAttribute('aria-selected') === 'true';
    })[0] || nodes[0];

    // `engage` marks a choice the reader actually made. Until one happens
    // the diagram reads at full strength; only then do the stages not
    // taken step back. Setting up must not look like being used.
    function take(node, moveFocus, engage) {
      var i = parseInt(node.getAttribute('data-rd'), 10);
      if (isNaN(i) || !reads[i]) return;
      current = node;
      if (engage) card.classList.add('probing');

      var lit = (node.getAttribute('data-path') || '').split(/\s+/).filter(Boolean);
      edges.forEach(function (e) {
        e.classList.toggle('lit', lit.indexOf(e.getAttribute('data-e')) !== -1);
      });

      nodes.forEach(function (n) {
        var on = n === node;
        n.classList.toggle('sel', on);
        n.setAttribute('aria-selected', on ? 'true' : 'false');
        n.setAttribute('tabindex', on ? '0' : '-1');
        n.querySelectorAll('.node-box, .node-txt').forEach(function (el) {
          el.classList.toggle('on', on);
        });
      });

      reads.forEach(function (r, k) {
        if (k === i) { r.removeAttribute('hidden'); }
        else { r.setAttribute('hidden', ''); }
      });

      if (moveFocus) node.focus();
    }

    nodes.forEach(function (node) {
      node.addEventListener('mouseenter', function () { take(node, false, true); });
      node.addEventListener('click', function () { take(node, false, true); });
      node.addEventListener('focus', function () { take(node, false, true); });
      node.addEventListener('keydown', function (e) {
        var i = nodes.indexOf(node), to = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = nodes[(i + 1) % nodes.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = nodes[(i - 1 + nodes.length) % nodes.length];
        else if (e.key === 'Home') to = nodes[0];
        else if (e.key === 'End') to = nodes[nodes.length - 1];
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); take(node, false, true); return; }
        if (to) { e.preventDefault(); take(to, true, true); }
      });
    });

    // The pointer leaving does not undo a choice — it returns to the one
    // the reader last took, which is the stage the markup opened on.
    card.addEventListener('mouseleave', function () { take(current, false, false); });

    take(current, false, false);
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
