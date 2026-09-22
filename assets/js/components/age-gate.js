/* 18+ confirmation, shown once per browser. Focus-trapped while open. */
(function () {
  'use strict';

  var gate = document.getElementById('ageGate');
  if (!gate) return;

  function read(key) {
    try { return localStorage.getItem(key); } catch (err) { return null; }
  }
  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (err) { /* private mode */ }
  }

  if (read('ageVerified') === '1') { gate.remove(); return; }

  var previouslyFocused = document.activeElement;
  gate.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  var focusable = gate.querySelectorAll('button, [href]');
  var first = focusable[0];
  var last = focusable[focusable.length - 1];
  if (first) first.focus();

  // Trap focus inside the dialog; there is no dismiss-without-answering path.
  gate.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || focusable.length === 0) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  var confirm = document.getElementById('ageConfirm');
  if (confirm) {
    confirm.addEventListener('click', function () {
      store('ageVerified', '1');
      gate.remove();
      document.body.style.overflow = '';
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    });
  }
})();
