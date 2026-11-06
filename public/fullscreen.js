// Full-screen button for the 3D viewers on the static model pages.
// Adds a button to every <model-viewer> and to the head and neck viewer (#viewer).
// Hidden where the browser cannot show an element full screen (for example iPhone Safari).
(function () {
  const doc = document;
  const enabled = doc.fullscreenEnabled || doc.webkitFullscreenEnabled;
  if (!enabled) return;
  const current = () => doc.fullscreenElement || doc.webkitFullscreenElement;
  const label = (on) => {
    const ja = (doc.documentElement.lang || '').startsWith('ja');
    if (on) return ja ? '全画面表示を終了' : 'Exit full screen';
    return ja ? '模型を全画面で表示' : 'View model full screen';
  };
  const ICON_OPEN = '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';
  const ICON_CLOSE = '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>';

  const style = doc.createElement('style');
  style.textContent = [
    '.vt-fs{position:absolute;right:10px;bottom:10px;z-index:5;width:40px;height:40px;display:grid;place-items:center;border-radius:10px;',
    'border:1px solid var(--line,#cfe3e5);background:var(--bg,#fff);color:var(--heading,#0b2340);cursor:pointer;padding:0}',
    '.vt-fs svg{fill:currentColor}',
    '.vt-fs:focus-visible{outline:3px solid var(--accent,#0a7c86);outline-offset:2px}',
    'model-viewer:fullscreen,.viewer:fullscreen{width:100vw!important;height:100vh!important;max-height:none!important;border-radius:0!important;background:var(--card,#eefafa)}',
    'model-viewer:-webkit-full-screen,.viewer:-webkit-full-screen{width:100vw!important;height:100vh!important;max-height:none!important;border-radius:0!important;background:var(--card,#eefafa)}',
  ].join('');
  doc.head.appendChild(style);

  const buttons = [];
  function add(target) {
    if (!target || target.querySelector(':scope > .vt-fs')) return;
    if (getComputedStyle(target).position === 'static') target.style.position = 'relative';
    const b = doc.createElement('button');
    b.type = 'button'; b.className = 'vt-fs';
    b.addEventListener('click', () => {
      if (current()) (doc.exitFullscreen || doc.webkitExitFullscreen).call(doc);
      else (target.requestFullscreen || target.webkitRequestFullscreen).call(target);
    });
    target.appendChild(b); buttons.push([b, target]);
  }
  function refresh() {
    buttons.forEach(([b, t]) => {
      const on = current() === t;
      b.innerHTML = on ? ICON_CLOSE : ICON_OPEN;
      b.setAttribute('aria-label', label(on)); b.title = label(on);
    });
  }
  function init() {
    doc.querySelectorAll('model-viewer, #viewer').forEach(add);
    refresh();
  }
  doc.addEventListener('fullscreenchange', refresh);
  doc.addEventListener('webkitfullscreenchange', refresh);
  new MutationObserver(refresh).observe(doc.documentElement, { attributes: true, attributeFilter: ['lang'] });
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();
