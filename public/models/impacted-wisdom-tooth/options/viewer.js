// Wisdom tooth treatment options: one 3D viewer per option, each with its own step buttons.
// Each <section class="option"> holds a <model-viewer>, buttons with data-src (the GLB for that step) and one
// .step block per button (data-step = the button's index) with the caption and the alt text (.alt) in every
// language. Vietnamese is swapped into the lang="en" elements by /inline-vi.js before this runs.
(function () {
  const html = document.documentElement;
  const isJa = () => html.lang === 'ja';
  document.querySelectorAll('.option').forEach((opt) => {
    const mv = opt.querySelector('model-viewer');
    const buttons = [...opt.querySelectorAll('[data-src]')];
    const steps = [...opt.querySelectorAll('.step')];
    function show(i, load) {
      buttons.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
      steps.forEach((s) => { s.hidden = s.dataset.step !== String(i); });
      const step = steps.find((s) => s.dataset.step === String(i));
      const alt = step && (isJa() ? step.querySelector('.alt[lang="ja"]') : step.querySelector('.alt:not([lang="ja"])'));
      if (alt) mv.alt = alt.textContent.trim();
      if (load && mv.getAttribute('src') !== buttons[i].dataset.src) mv.setAttribute('src', buttons[i].dataset.src);
    }
    buttons.forEach((b, i) => b.addEventListener('click', () => show(i, true)));
    // Keyboard: arrow keys move between the steps of this option.
    opt.querySelector('.steps').addEventListener('keydown', (e) => {
      const i = buttons.indexOf(document.activeElement);
      if (i < 0 || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
      const n = (i + (e.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length;
      buttons[n].focus();
      show(n, true);
      e.preventDefault();
    });
    show(0, false);
  });
  // Preset views apply to both viewers, so the two options can be compared from the same side.
  const views = document.querySelectorAll('[data-orbit]');
  views.forEach((b) => b.addEventListener('click', () => {
    views.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    document.querySelectorAll('.option model-viewer').forEach((mv) => { mv.cameraOrbit = b.dataset.orbit; });
  }));
})();
