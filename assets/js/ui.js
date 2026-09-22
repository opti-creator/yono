/* Page widgets: carousel, directory filter, FAQ, read-more. */
(function () {
  'use strict';

  /* ---- Carousel -------------------------------------------------------- */
  document.querySelectorAll('[data-carousel]').forEach(function (car) {
    var track = car.querySelector('[data-carousel-track]');
    var prev = car.querySelector('[data-carousel-prev]');
    var next = car.querySelector('[data-carousel-next]');
    if (!track || !prev || !next) return;

    function page() { return Math.max(track.clientWidth * 0.8, 200); }
    function sync() {
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -page(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: page(), behavior: 'smooth' }); });
    track.addEventListener('scroll', function () { requestAnimationFrame(sync); }, { passive: true });
    addEventListener('resize', sync, { passive: true });
    sync();
  });

  /* ---- Directory filter ------------------------------------------------
     Progressive enhancement only: every card is already in the HTML, so
     crawlers and no-JS visitors see the full list. This hides non-matches. */
  var root = document.querySelector('[data-filter-root]');
  if (root) {
    var input = root.querySelector('[data-filter-search]');
    var chips = root.querySelectorAll('[data-filter-cat]');
    var cards = [].slice.call(root.querySelectorAll('[data-game]'));
    var blocks = [].slice.call(root.querySelectorAll('[data-cat-block]'));
    var count = root.querySelector('[data-filter-count]');
    var empty = root.querySelector('[data-filter-empty]');
    var total = cards.length;
    var cat = 'all', q = '';

    function apply() {
      var shown = 0;
      cards.forEach(function (c) {
        var ok = (cat === 'all' || c.getAttribute('data-cat') === cat) &&
                 (q === '' || c.getAttribute('data-name').indexOf(q) !== -1);
        c.hidden = !ok;
        if (ok) shown++;
      });
      blocks.forEach(function (b) { b.hidden = !b.querySelector('[data-game]:not([hidden])'); });
      if (count) {
        count.textContent = shown === total
          ? 'Showing all ' + total + ' games'
          : 'Showing ' + shown + ' of ' + total + ' games';
      }
      if (empty) empty.hidden = shown !== 0;
    }

    var t = null;
    if (input) {
      input.addEventListener('input', function () {
        clearTimeout(t);
        t = setTimeout(function () { q = input.value.trim().toLowerCase(); apply(); }, 140);
      });
    }
    [].forEach.call(chips, function (chip) {
      chip.addEventListener('click', function () {
        cat = chip.getAttribute('data-filter-cat');
        [].forEach.call(chips, function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        apply();
      });
    });
    apply();
  }

  /* ---- FAQ ------------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    var q = e.target.closest('.faq__q');
    if (!q) return;
    var a = document.getElementById(q.getAttribute('aria-controls'));
    if (!a) return;
    var open = q.getAttribute('aria-expanded') === 'true';
    q.setAttribute('aria-expanded', String(!open));
    a.hidden = open;
  });

  /* ---- Read-more --------------------------------------------------------
     Collapses with max-height only. The text stays in the DOM and stays
     visible to crawlers - never display:none (SEO requirement). */
  document.querySelectorAll('[data-readmore]').forEach(function (box) {
    var content = box.querySelector('.readmore__content');
    var btn = box.querySelector('.readmore__btn');
    if (!content || !btn) return;
    // Only collapse when there is genuinely more to reveal.
    if (content.scrollHeight <= 190) { btn.hidden = true; box.removeAttribute('data-collapsed'); return; }
    box.setAttribute('data-collapsed', 'true');
    btn.hidden = false;
    btn.addEventListener('click', function () {
      var collapsed = box.getAttribute('data-collapsed') === 'true';
      box.setAttribute('data-collapsed', String(!collapsed));
      btn.textContent = collapsed ? 'Show less' : 'Read more';
      btn.setAttribute('aria-expanded', String(collapsed));
    });
  });
})();
