/* Core UI: perf mode, theme, header, drawer, footer accordion, cookie notice.
   No libraries. All animation is CSS; JS only toggles classes/attributes. */
(function () {
  'use strict';

  var root = document.documentElement;
  var ls = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---- Low-end device mode -------------------------------------------- */
  // Drops blur, shadows and shimmer on weak hardware. Cheap heuristic, applied
  // once at boot so it never causes a mid-session reflow.
  var mem = navigator.deviceMemory || 4;
  var cores = navigator.hardwareConcurrency || 4;
  var saveData = navigator.connection && navigator.connection.saveData;
  if (mem <= 2 || cores <= 4 || saveData) root.classList.add('perf-lite');

  /* ---- Theme ----------------------------------------------------------- */
  var stored = ls.get('theme');
  if (stored === 'light' || stored === 'dark') root.setAttribute('data-theme', stored);

  function currentTheme() {
    var attr = root.getAttribute('data-theme');
    if (attr) return attr;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  function syncThemeMeta() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content',
        getComputedStyle(root).getPropertyValue('--bg').trim() || '#070F0A');
    }
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      var light = currentTheme() === 'light';
      b.setAttribute('aria-pressed', String(light));
      b.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    });
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    var next = currentTheme() === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    ls.set('theme', next);
    syncThemeMeta();
  });
  syncThemeMeta();

  /* ---- Header scroll state --------------------------------------------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
        ticking = false;
      });
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Drawer ---------------------------------------------------------- */
  var drawer = document.getElementById('drawer');
  var scrim = document.getElementById('drawerScrim');
  var lastFocus = null;

  function openDrawer() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.classList.add('is-open');
    scrim.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    var first = drawer.querySelector('button, a');
    if (first) first.focus();
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    scrim.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-drawer-open]')) { e.preventDefault(); openDrawer(); }
    else if (e.target.closest('[data-drawer-close]')) { e.preventDefault(); closeDrawer(); }
  });
  if (scrim) scrim.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !drawer || !drawer.classList.contains('is-open')) return;
    closeDrawer();
  });
  // Focus trap while the drawer is open.
  if (drawer) {
    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = drawer.querySelectorAll('a[href], button:not(:disabled)');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---- Disclosure widgets (drawer groups, footer columns) -------------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[aria-controls][aria-expanded]');
    if (!btn || btn.hasAttribute('data-theme-toggle')) return;
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    var open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    panel.hidden = open;
  });

  /* ---- Cookie notice --------------------------------------------------- */
  var banner = document.getElementById('cookieBanner');
  if (banner) {
    if (ls.get('cookieConsent')) banner.remove();
    else {
      banner.style.display = 'flex';
      banner.addEventListener('click', function (e) {
        var v = e.target.getAttribute && e.target.getAttribute('data-consent');
        if (!v) return;
        ls.set('cookieConsent', v);
        banner.remove();
      });
    }
  }
})();
