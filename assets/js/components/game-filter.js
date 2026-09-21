/* Directory search + category filter.
   Enhancement only: all 90 cards are in the HTML already, so crawlers and
   no-JS visitors see the complete list. This just hides non-matches. */
(function () {
  'use strict';

  var root = document.querySelector('[data-filter-root]');
  if (!root) return;

  var input = root.querySelector('[data-filter-search]');
  var pills = root.querySelectorAll('[data-filter-cat]');
  var cards = Array.prototype.slice.call(root.querySelectorAll('[data-game]'));
  var blocks = Array.prototype.slice.call(root.querySelectorAll('[data-cat-block]'));
  var count = root.querySelector('[data-filter-count]');
  var empty = root.querySelector('[data-filter-empty]');
  var total = cards.length;

  var activeCat = 'all';
  var query = '';

  function apply() {
    var shown = 0;
    cards.forEach(function (card) {
      var matchCat = activeCat === 'all' || card.getAttribute('data-cat') === activeCat;
      var matchText = query === '' || card.getAttribute('data-name').indexOf(query) !== -1;
      var visible = matchCat && matchText;
      card.hidden = !visible;
      if (visible) shown++;
    });

    // Hide a category heading when nothing under it survives the filter.
    blocks.forEach(function (block) {
      var any = block.querySelector('[data-game]:not([hidden])');
      block.hidden = !any;
    });

    if (count) {
      count.textContent = shown === total
        ? 'Showing all ' + total + ' games'
        : 'Showing ' + shown + ' of ' + total + ' games';
    }
    if (empty) empty.hidden = shown !== 0;
  }

  // Debounce typing so we are not filtering on every keystroke.
  var timer = null;
  if (input) {
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        query = input.value.trim().toLowerCase();
        apply();
      }, 150);
    });
  }

  Array.prototype.forEach.call(pills, function (pill) {
    pill.addEventListener('click', function () {
      activeCat = pill.getAttribute('data-filter-cat');
      Array.prototype.forEach.call(pills, function (p) {
        p.setAttribute('aria-pressed', String(p === pill));
      });
      apply();
    });
  });

  apply();
})();
