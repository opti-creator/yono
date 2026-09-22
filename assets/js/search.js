/* Instant search overlay.
   The index is fetched on first open, not at page load, so it costs nothing
   on a first paint over a slow Android connection. */
(function () {
  'use strict';

  var overlay = document.getElementById('searchOverlay');
  if (!overlay) return;

  var field = overlay.querySelector('[data-search-field]');
  var results = overlay.querySelector('[data-search-results]');
  var hint = overlay.querySelector('[data-search-hint]');
  var index = null;
  var loading = false;
  var lastFocus = null;
  var RECENT = 'recentSearches';

  function ls(k, v) {
    try { return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v); }
    catch (e) { return null; }
  }

  function skeletons(n) {
    var h = '';
    for (var i = 0; i < n; i++) {
      h += '<div class="search-result"><div class="skeleton" style="width:40px;height:40px;' +
           'border-radius:8px;flex:0 0 40px"></div><div style="flex:1">' +
           '<div class="skeleton skeleton--line" style="width:58%"></div>' +
           '<div class="skeleton skeleton--line is-short"></div></div></div>';
    }
    return h;
  }

  function loadIndex() {
    if (index || loading) return Promise.resolve(index);
    loading = true;
    results.innerHTML = skeletons(6);
    return fetch('/assets/data/search-index.json')
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) { index = d; loading = false; return d; })
      .catch(function () {
        loading = false;
        results.innerHTML = '<p class="search-overlay__hint">Search is unavailable right now. ' +
          '<a href="/games/">Browse all games</a> instead.</p>';
        return null;
      });
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function highlight(name, q) {
    if (!q) return esc(name);
    var i = name.toLowerCase().indexOf(q);
    if (i < 0) return esc(name);
    return esc(name.slice(0, i)) + '<mark>' + esc(name.slice(i, i + q.length)) +
           '</mark>' + esc(name.slice(i + q.length));
  }

  function render(list, q) {
    if (!list.length) {
      results.innerHTML = '<p class="search-overlay__hint">No games match &ldquo;' + esc(q) +
        '&rdquo;. <a href="/games/">Browse all games</a>.</p>';
      return;
    }
    results.innerHTML = list.map(function (g) {
      var img = g.t
        ? '<img src="' + g.t + '" alt="" width="40" height="40" loading="lazy">'
        : '<span class="skeleton" style="width:40px;height:40px;border-radius:8px;flex:0 0 40px"></span>';
      return '<a class="search-result" href="' + g.u + '" data-name="' + esc(g.n) + '">' + img +
        '<span><span class="search-result__name">' + highlight(g.n, q) + '</span><br>' +
        '<span class="search-result__cat">' + esc(g.c) + '</span></span></a>';
    }).join('');
  }

  function popular() {
    var recent = (ls(RECENT) || '').split('|').filter(Boolean).slice(0, 5);
    if (recent.length && index) {
      var byName = {};
      index.forEach(function (g) { byName[g.n] = g; });
      var hits = recent.map(function (n) { return byName[n]; }).filter(Boolean);
      if (hits.length) { hint.textContent = 'Recent'; render(hits, ''); return; }
    }
    hint.textContent = 'Browse by category';
    results.innerHTML = (window.__CATEGORIES || []).map(function (c) {
      return '<a class="search-result" href="' + c.u + '"><span>' +
        '<span class="search-result__name">' + esc(c.l) + '</span><br>' +
        '<span class="search-result__cat">' + c.n + ' titles</span></span></a>';
    }).join('');
  }

  function run() {
    var q = field.value.trim().toLowerCase();
    if (!index) return;
    if (!q) { popular(); return; }
    hint.textContent = 'Results';
    var starts = [], contains = [];
    for (var i = 0; i < index.length; i++) {
      var n = index[i].n.toLowerCase();
      if (n.indexOf(q) === 0) starts.push(index[i]);
      else if (n.indexOf(q) > 0) contains.push(index[i]);
      if (starts.length + contains.length > 40) break;
    }
    render(starts.concat(contains).slice(0, 20), q);
  }

  var timer = null;
  function open() {
    lastFocus = document.activeElement;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    field.value = '';
    loadIndex().then(function () { popular(); });
    setTimeout(function () { field.focus(); }, 60);
  }
  function close() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-search-open]')) { e.preventDefault(); open(); }
    else if (e.target.closest('[data-search-close]')) { e.preventDefault(); close(); }
    var hit = e.target.closest('.search-result[data-name]');
    if (hit) {
      var prev = (ls(RECENT) || '').split('|').filter(Boolean);
      prev.unshift(hit.getAttribute('data-name'));
      ls(RECENT, prev.filter(function (v, i, a) { return a.indexOf(v) === i; }).slice(0, 5).join('|'));
    }
  });

  field.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(run, 140);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) { close(); return; }
    // "/" opens search, unless the visitor is typing into a field.
    if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
      e.preventDefault(); open();
    }
  });

  // Arrow-key navigation through results.
  overlay.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    var items = Array.prototype.slice.call(results.querySelectorAll('.search-result'));
    if (!items.length) return;
    e.preventDefault();
    var i = items.indexOf(document.activeElement);
    var next = e.key === 'ArrowDown' ? i + 1 : i - 1;
    if (next < 0) { field.focus(); return; }
    (items[next] || items[items.length - 1]).focus();
  });
})();
