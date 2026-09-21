/* Site-wide behaviour: nav toggle + cookie notice. */
(function () {
  'use strict';

  // --- Mobile nav ---
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('navMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
    });
    // Close on Escape, returning focus to the toggle.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // --- Cookie notice ---
  var banner = document.getElementById('cookieBanner');
  if (!banner) return;

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (err) { /* private mode */ }
  }
  function read(key) {
    try { return localStorage.getItem(key); } catch (err) { return null; }
  }

  if (read('cookieConsent')) { banner.remove(); return; }
  banner.style.display = 'flex';

  banner.addEventListener('click', function (e) {
    var action = e.target.getAttribute && e.target.getAttribute('data-consent');
    if (!action) return;
    store('cookieConsent', action);
    banner.remove();
  });
})();
