/*
 * SITE NAV + THEME
 *
 * One switch for the whole site.
 *
 * The pages grew three different dark mechanisms, because each was
 * written at a different time:
 *
 *   html[data-theme="dark"]   index, portfolios
 *   html[data-mode="ink"]     ai_builder
 *   body.dark-mode            the Bootstrap pages
 *
 * Rather than rewrite every page's CSS to agree, the applier sets all
 * three at once. Each page's existing rules then keep working, and the
 * choice is a single `theme` value in localStorage, so it follows the
 * reader from page to page.
 *
 * The pre-paint half of this lives inline in each page's <head> — it has
 * to run before the first paint or the page flashes light before turning
 * dark. This file only wires the controls.
 */
(function () {
  'use strict';

  var KEY = 'theme';
  var root = document.documentElement;

  function saved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function store(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* private mode */ }
  }

  function isDark() { return root.getAttribute('data-theme') === 'dark'; }

  /* set every mechanism the site has ever used, so one switch drives
     whichever one the current page's CSS happens to be written against */
  function apply(theme) {
    var dark = theme === 'dark';
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (dark) root.setAttribute('data-mode', 'ink');
    else root.removeAttribute('data-mode');
    if (document.body) document.body.classList.toggle('dark-mode', dark);

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#000000' : '#ffffff');

    document.querySelectorAll('.sn-theme').forEach(function (b) {
      b.setAttribute('aria-checked', dark ? 'true' : 'false');
      b.setAttribute('aria-label', dark ? 'Switch to light theme'
                                        : 'Switch to dark theme');
    });
  }

  function init() {
    /* the inline head script has already set the attribute; mirror it
       onto <body>, which did not exist when that script ran */
    apply(isDark() ? 'dark' : 'light');

    document.querySelectorAll('.sn-theme').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = isDark() ? 'light' : 'dark';
        apply(next);
        store(next);
      });
    });

    /* another tab changed it */
    window.addEventListener('storage', function (e) {
      if (e.key === KEY && e.newValue) apply(e.newValue);
    });

    /* ── burger ── */
    var nav = document.getElementById('site-nav');
    var burger = document.getElementById('sn-burger');
    if (!nav || !burger) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    burger.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('.sn-links a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        burger.focus();
      }
    });

    window.matchMedia('(min-width: 901px)').addEventListener('change', function (e) {
      if (e.matches) setOpen(false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
