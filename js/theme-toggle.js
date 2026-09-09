/*
 * FinLab theme toggle.
 *
 * For the pages that never had a dark switch of their own. It shares the
 * `theme` key with the rest of the site, so a choice made here follows
 * the reader onto every other page, and it injects its own control so
 * the page markup does not have to carry one.
 *
 * Light is the ground state; only an explicit choice turns it dark.
 */
(function () {
  'use strict';

  var KEY = 'theme';

  function saved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function apply(theme) {
    document.body.classList.toggle('dark-mode', theme === 'dark');
    var btn = document.getElementById('fl-theme-toggle');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀' : '☽';
      btn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0a0b' : '#ffffff');
  }

  function current() {
    return document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  }

  function init() {
    var btn = document.createElement('button');
    btn.id = 'fl-theme-toggle';
    btn.type = 'button';
    btn.className = 'fl-theme-toggle';
    document.body.appendChild(btn);

    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem(KEY, next); } catch (e) { /* private mode */ }
    });

    apply(saved() === 'dark' ? 'dark' : 'light');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
