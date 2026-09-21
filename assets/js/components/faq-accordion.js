/* FAQ disclosure. Answers stay in the DOM so they remain crawlable. */
(function () {
  'use strict';
  var faq = document.querySelector('.faq');
  if (!faq) return;

  faq.addEventListener('click', function (e) {
    var btn = e.target.closest('.faq__q');
    if (!btn) return;
    var answer = document.getElementById(btn.getAttribute('aria-controls'));
    if (!answer) return;
    var open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    answer.hidden = open;
  });
})();
