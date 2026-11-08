// Smooth scrolling past 3D models. A <model-viewer> with auto-rotate redraws its WebGL scene every
// frame while it is on screen, which competes with scrolling on phones and laptops with weak graphics.
// While the page is scrolling, pause auto-rotate; resume it a moment after scrolling stops.
// The auto-rotate attribute stays the source of truth (pages and React set it), so a viewer the
// reader paused stays paused. Loaded by app/layout.tsx and public/site-header.js.
(function () {
  if (window.__vtScrollPause) return;
  window.__vtScrollPause = true;
  let paused = [];
  let timer = 0;
  const resume = () => {
    paused.forEach((mv) => { mv.autoRotate = mv.hasAttribute('auto-rotate'); });
    paused = [];
    timer = 0;
  };
  window.addEventListener('scroll', () => {
    if (!timer) {
      document.querySelectorAll('model-viewer[auto-rotate]').forEach((mv) => {
        if (mv.autoRotate) { mv.autoRotate = false; paused.push(mv); }
      });
    }
    clearTimeout(timer);
    timer = setTimeout(resume, 250);
  }, { passive: true, capture: true });
})();
