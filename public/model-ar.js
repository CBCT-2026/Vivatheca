// "View on your desk": phone augmented reality (AR) for every 3D viewer.
// - <model-viewer> (static model pages and the app pages): model-viewer's own AR, in this order:
//   WebXR in Chrome on Android (shows the model as it is on the page, with the disclaimer on screen),
//   Google Scene Viewer (Android, opens the 3D file itself), and Apple AR Quick Look (iPhone and iPad;
//   model-viewer turns the model into a USDZ file on the phone, nothing is uploaded).
// - three.js head and neck viewers (#viewer): the parts on show in this stage are saved as a GLB on the
//   phone (GLTFExporter, three r147) and opened in a hidden <model-viewer> (WebXR or Quick Look).
// The button shows only where the phone can open AR. Before the camera opens, a box shows the review
// status, the model disclaimer (verbatim from app/disclaimer-text.ts) and a link to /disclaimer.
// Models in millimetres (some GLBs) are scaled to metres for AR only, so they open at the file's size;
// Scene Viewer cannot be told the scale, so those models use WebXR or Quick Look only.
// Docs: https://modelviewer.dev/docs/#augmentedreality
(function () {
  const doc = document;
  if (window.__vtAR) return;
  window.__vtAR = true;
  const MV_SRC = '/development/vendor/model-viewer/model-viewer.min.js';
  const EXPORTER_SRC = '/head-neck/vendor/three/GLTFExporter.js';
  const lang = () => { const l = (doc.documentElement.lang || 'en').slice(0, 2); return l === 'ja' ? 1 : l === 'vi' ? 2 : 0; };
  const ruby = (s) => s.replace(/\{([^{}|]+)\|([^{}]+)\}/g, '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');
  const plain = (s) => s.replace(/\{([^{}|]+)\|[^{}]+\}/g, '$1');
  const say = (t) => ruby(t[lang()] || t[0]);

  const T = {
    button: ['View on your desk', '{机|つくえ}の{上|うえ}で{見|み}る', 'Xem trên bàn của bạn'],
    heading: ['See this model on your desk', 'この{模型|もけい}を{机|つくえ}の{上|うえ}で{見|み}る', 'Xem mô hình này trên bàn của bạn'],
    how: [
      'Your phone camera shows the 3D model in the room around you (augmented reality). It opens at the same size as the 3D file. Pinch to make it bigger or smaller, and walk around it to see it from every side.',
      'スマートフォンのカメラで、まわりの{部屋|へや}の{中|なか}に3D{模型|もけい}を{表示|ひょうじ}します（{拡張現実|かくちょうげんじつ}、AR）。3Dファイルと{同|おな}じ{大|おお}きさで{開|ひら}きます。2{本|ほん}の{指|ゆび}で{大|おお}きさを{変|か}えられ、まわりを{歩|ある}くといろいろな{向|む}きから{見|み}られます。',
      'Camera điện thoại sẽ hiển thị mô hình 3D trong căn phòng quanh bạn (thực tế tăng cường, AR). Mô hình mở ra với cùng kích thước như tệp 3D. Chụm hai ngón tay để phóng to hoặc thu nhỏ, và đi vòng quanh để xem từ mọi phía.',
    ],
    parts: [
      'Some phones open the whole model, so parts you hid on this page may show again.',
      '{機種|きしゅ}によっては{模型|もけい}{全体|ぜんたい}が{開|ひら}くため、このページで{隠|かく}した{部分|ぶぶん}がまた{表示|ひょうじ}されることがあります。',
      'Một số điện thoại mở toàn bộ mô hình, nên các phần bạn đã ẩn trên trang này có thể hiện lại.',
    ],
    review: ['Not yet clinically reviewed.', '{臨床|りんしょう}レビュー{未実施|みじっし}。', 'Chưa được thẩm định lâm sàng.'],
    disclaimer: [
      'Educational model only. It shows typical anatomy or disease, not any real patient, and is simplified and may contain errors. Not for diagnosis, treatment planning, surgical guides or use in or on the body.',
      '{教育用|きょういくよう}の{模型|もけい}です。{特定|とくてい}の{患者|かんじゃ}ではなく{一般的|いっぱんてき}な{解剖|かいぼう}や{疾患|しっかん}を{示|しめ}したもので、{簡略化|かんりゃくか}されており{誤|あやま}りを{含|ふく}む{可能性|かのうせい}があります。{診断|しんだん}、{治療|ちりょう}{計画|けいかく}、{手術|しゅじゅつ}ガイド、{体内|たいない}・{体表|たいひょう}での{使用|しよう}には{用|もち}いないでください。',
      'Mô hình chỉ dùng cho giáo dục. Mô hình thể hiện giải phẫu hoặc bệnh lý điển hình, không phải của bệnh nhân thật nào, đã được đơn giản hóa và có thể có sai sót. Không dùng để chẩn đoán, lập kế hoạch điều trị, làm máng hướng dẫn phẫu thuật hoặc dùng trong hay trên cơ thể.',
    ],
    full: ['Full disclaimer', '{免責|めんせき}{事項|じこう}の{全文|ぜんぶん}', 'Toàn văn tuyên bố miễn trừ trách nhiệm'],
    open: ['Open the camera', 'カメラを{開|ひら}く', 'Mở camera'],
    cancel: ['Cancel', 'キャンセル', 'Hủy'],
    preparing: ['Getting the model ready…', '{模型|もけい}を{準備|じゅんび}しています…', 'Đang chuẩn bị mô hình…'],
    failed: ['This phone could not open the model in AR.', 'このスマートフォンではARで{模型|もけい}を{開|ひら}けませんでした。', 'Điện thoại này không mở được mô hình ở chế độ AR.'],
  };

  const style = doc.createElement('style');
  style.textContent = [
    '.vt-ar-btn{position:absolute;right:58px;bottom:10px;z-index:5;min-height:40px;padding:0 12px;display:inline-flex;align-items:center;gap:6px;border-radius:10px;border:1px solid var(--line,#cfe3e5);background:var(--bg,var(--surface,#fff));color:var(--heading,#0b2340);font:600 14px/1 system-ui,sans-serif;cursor:pointer}',
    '.vt-ar-btn[hidden]{display:none}',
    '.vt-ar-btn.vt-ar-solo{right:10px}',
    // Viewers with a "Drag to rotate" line along the bottom (head and neck): sit above it.
    '.vt-ar-btn.vt-ar-up{bottom:34px}',
    '.vt-ar-btn svg{fill:currentColor;flex:none}',
    '.vt-ar-btn rt{font-size:8px}',
    '.vt-ar-btn:focus-visible,.vt-ar-dlg button:focus-visible,.vt-ar-dlg a:focus-visible{outline:3px solid var(--accent,#0a7c86);outline-offset:2px}',
    '.vt-ar-dlg{max-width:min(440px,calc(100vw - 32px));padding:20px;border:1px solid var(--line,#cfe3e5);border-radius:14px;background:var(--bg,var(--surface,#fff));color:var(--text,var(--ink,#1b2a3a));font:400 15px/1.5 system-ui,sans-serif}',
    '.vt-ar-dlg::backdrop{background:rgba(0,20,40,.55)}',
    '.vt-ar-dlg h2{margin:0 0 10px;font-size:19px;line-height:1.3;color:var(--heading,#0b2340)}',
    '.vt-ar-dlg p{margin:0 0 10px;text-align:justify}',
    '.vt-ar-dlg .vt-ar-disc{padding:10px 12px;border-radius:10px;border:1px solid var(--line,#cfe3e5);background:var(--card,#eefafa)}',
    '.vt-ar-dlg a{color:var(--accent,#0a7c86)}',
    '.vt-ar-dlg .vt-ar-row{display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end;margin-top:14px}',
    '.vt-ar-dlg .vt-ar-row button{min-height:44px;padding:0 16px;border-radius:10px;font:600 15px/1 system-ui,sans-serif;cursor:pointer;border:1px solid var(--line,#cfe3e5);background:transparent;color:var(--heading,#0b2340)}',
    '.vt-ar-dlg .vt-ar-row .vt-ar-go{background:var(--heading,#0b2340);color:var(--bg,#fff);border-color:transparent}',
    '.vt-ar-dlg .vt-ar-go[disabled]{opacity:.6;cursor:progress}',
    '.vt-ar-dlg .vt-ar-msg:empty{display:none}',
    // On screen during WebXR (Chrome on Android): model-viewer is the DOM overlay, so its children show.
    '.vt-ar-note{display:none}',
    'model-viewer[ar-status="session-started"] .vt-ar-note,model-viewer[ar-status="object-placed"] .vt-ar-note{display:block;position:absolute;left:8px;right:8px;top:8px;z-index:10;padding:8px 10px;border-radius:10px;background:rgba(0,36,77,.88);color:#fff;font:400 12px/1.4 system-ui,sans-serif;text-align:justify}',
    'model-viewer[ar-status="session-started"] .vt-ar-note a,model-viewer[ar-status="object-placed"] .vt-ar-note a{color:#fff}',
    '.vt-ar-hidden{position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none}',
    '.vt-ar-hidden[ar-status="session-started"],.vt-ar-hidden[ar-status="object-placed"]{width:100vw;height:100vh;opacity:1;pointer-events:auto}',
  ].join('');
  doc.head.appendChild(style);

  const ICON = '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M12 2 3 7v10l9 5 9-5V7l-9-5zm0 2.3 6.7 3.7L12 11.7 5.3 8 12 4.3zM5 9.7l6 3.3v6.6l-6-3.3V9.7zm8 9.9V13l6-3.3v6.6l-6 3.3z"/></svg>';
  const noteHtml = () => '<b>' + say(T.review) + '</b> ' + say(T.disclaimer) + ' <a href="/disclaimer">' + say(T.full) + '</a>';

  // ----- The box shown before the camera opens -----
  let dlg = null, pending = null;
  function dialog() {
    if (dlg) return dlg;
    dlg = doc.createElement('dialog');
    dlg.className = 'vt-ar-dlg';
    dlg.setAttribute('aria-labelledby', 'vt-ar-h');
    dlg.addEventListener('close', () => { pending = null; });
    doc.body.appendChild(dlg);
    return dlg;
  }
  function render() {
    const d = dialog();
    d.innerHTML = '<h2 id="vt-ar-h">' + say(T.heading) + '</h2>' +
      '<p>' + say(T.how) + '</p>' +
      (pending && pending.whole ? '<p>' + say(T.parts) + '</p>' : '') +
      '<p class="vt-ar-disc">' + noteHtml() + '</p>' +
      '<p class="vt-ar-msg" role="status"></p>' +
      '<div class="vt-ar-row"><button type="button" class="vt-ar-cancel">' + say(T.cancel) + '</button>' +
      '<button type="button" class="vt-ar-go">' + say(T.open) + '</button></div>';
    d.querySelector('.vt-ar-cancel').addEventListener('click', () => d.close());
    d.querySelector('.vt-ar-go').addEventListener('click', go);
  }
  function message(t) { const m = dlg && dlg.querySelector('.vt-ar-msg'); if (m) m.innerHTML = t ? say(t) : ''; }
  function ask(job) {
    pending = job;
    render();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    dlg.querySelector('.vt-ar-go').focus();
    if (job.prepare) {
      // Build the AR copy while the box is open, so "Open the camera" starts AR straight from the tap
      // (WebXR needs the tap to be recent).
      const go = dlg.querySelector('.vt-ar-go');
      go.disabled = true; message(T.preparing);
      job.ready = job.prepare().then((x) => { if (pending === job) { go.disabled = false; message(null); } return x; },
        (e) => { console.warn(e); if (pending === job) message(T.failed); throw e; });
    }
  }
  async function go() {
    const job = pending;
    if (!job) return;
    try {
      if (job.ready) await job.ready;
      dlg.close();
      await job.launch();
    } catch (e) {
      console.warn('AR could not start', e);
    }
  }

  // ----- <model-viewer> -----
  const MM = new WeakMap(); // true when the loaded file is in millimetres
  function modes(mv) { return MM.get(mv) ? 'webxr quick-look' : 'webxr scene-viewer quick-look'; }
  function measure(mv) {
    try {
      const d = mv.getDimensions && mv.getDimensions();
      // Biggest model on the site is a whole skull (~0.22 m); anything over 2 is millimetres.
      if (d) MM.set(mv, Math.max(d.x, d.y, d.z) > 2);
    } catch { /* not loaded yet */ }
    mv.setAttribute('ar-modes', modes(mv));
  }
  async function launchMv(mv) {
    const before = mv.getAttribute('scale');
    const mm = MM.get(mv);
    if (mm) { mv.setAttribute('scale', '0.001 0.001 0.001'); await mv.updateComplete; }
    const restore = () => { if (!mm) return; if (before == null) mv.removeAttribute('scale'); else mv.setAttribute('scale', before); };
    const onStatus = (e) => {
      const s = e.detail && e.detail.status;
      if (s === 'not-presenting' || s === 'failed') { mv.removeEventListener('ar-status', onStatus); restore(); }
    };
    mv.addEventListener('ar-status', onStatus);
    await mv.activateAR();
    // Quick Look and Scene Viewer have their own app: the page goes back to normal at once.
    if (mv.getAttribute('ar-status') !== 'session-started' && mv.getAttribute('ar-status') !== 'object-placed') {
      mv.removeEventListener('ar-status', onStatus); restore();
    }
  }
  function placeButton(b, host) {
    b.classList.toggle('vt-ar-solo', !host.querySelector(':scope > .vt-fs'));
    b.classList.toggle('vt-ar-up', !!host.querySelector(':scope > .hint'));
  }
  function addButton(host, onClick) {
    if (host.querySelector(':scope > .vt-ar-btn')) return host.querySelector(':scope > .vt-ar-btn');
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    const b = doc.createElement('button');
    b.type = 'button'; b.className = 'vt-ar-btn'; b.hidden = true;
    b.addEventListener('click', onClick);
    host.appendChild(b);
    label(b);
    placeButton(b, host);
    setTimeout(() => placeButton(b, host), 500);
    return b;
  }
  function label(b) {
    b.innerHTML = ICON + '<span>' + say(T.button) + '</span>';
    b.setAttribute('aria-label', plain(T.button[lang()] || T.button[0]));
  }
  function setupMv(mv) {
    if (mv.dataset.vtAr || mv.classList.contains('vt-ar-hidden')) return;
    mv.dataset.vtAr = '1';
    mv.setAttribute('ar', '');
    mv.setAttribute('ar-modes', modes(mv));
    // model-viewer's own AR button would skip the disclaimer: replace it with nothing.
    if (!mv.querySelector(':scope > [slot="ar-button"]')) {
      const none = doc.createElement('span'); none.slot = 'ar-button'; none.style.display = 'none'; mv.appendChild(none);
    }
    const note = doc.createElement('div'); note.className = 'vt-ar-note'; note.innerHTML = noteHtml(); mv.appendChild(note);
    const b = addButton(mv, () => ask({ whole: true, launch: () => launchMv(mv) }));
    const check = () => { measure(mv); setTimeout(() => { b.hidden = !mv.canActivateAR; placeButton(b, mv); }, 50); };
    mv.addEventListener('load', check);
    if (mv.loaded) check();
  }

  // ----- three.js head and neck viewers -----
  let supportP = null;
  function support() {
    if (supportP) return supportP;
    const a = doc.createElement('a');
    const quick = !!(a.relList && a.relList.supports && a.relList.supports('ar'));
    const xr = navigator.xr && navigator.xr.isSessionSupported ? navigator.xr.isSessionSupported('immersive-ar').catch(() => false) : Promise.resolve(false);
    supportP = xr.then((x) => quick || !!x);
    return supportP;
  }
  const loaded = {};
  function script(src) {
    return loaded[src] || (loaded[src] = new Promise((res, rej) => { const s = doc.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; doc.head.appendChild(s); }));
  }
  async function prepareThree(box) {
    const L = box.vtLabels;
    const THREE = (L && L.THREE) || window.THREE;
    const root = L && L.root && L.root();
    if (!THREE || !root) throw new Error('model not loaded');
    await Promise.all([script(EXPORTER_SRC), customElements.get('model-viewer') ? null : import(MV_SRC)]);
    // Only the parts on show (onlyVisible), with the page's colours. Position: as on the page, centred.
    const glb = await new Promise((res, rej) => new THREE.GLTFExporter().parse(root, res, rej, { binary: true, onlyVisible: true }));
    const url = URL.createObjectURL(new Blob([glb], { type: 'model/gltf-binary' }));
    let mv = box.__vtArMv;
    if (!mv) {
      mv = box.__vtArMv = doc.createElement('model-viewer');
      mv.className = 'vt-ar-hidden';
      mv.setAttribute('ar', ''); mv.setAttribute('ar-modes', 'webxr quick-look'); mv.setAttribute('loading', 'eager');
      mv.setAttribute('alt', box.getAttribute('aria-label') || '3D model');
      const none = doc.createElement('span'); none.slot = 'ar-button'; none.style.display = 'none'; mv.appendChild(none);
      const note = doc.createElement('div'); note.className = 'vt-ar-note'; note.innerHTML = noteHtml(); mv.appendChild(note);
      doc.body.appendChild(mv);
    }
    const old = mv.src;
    await new Promise((res, rej) => {
      const ok = () => { mv.removeEventListener('error', bad); res(); };
      const bad = (e) => { mv.removeEventListener('load', ok); rej(e); };
      mv.addEventListener('load', ok, { once: true }); mv.addEventListener('error', bad, { once: true });
      mv.src = url;
    });
    if (old && old.startsWith('blob:')) URL.revokeObjectURL(old);
    await new Promise((r) => setTimeout(r, 50));
    if (!mv.canActivateAR) throw new Error('AR not available');
    return mv;
  }
  function setupThree(box) {
    if (box.dataset.vtAr) return;
    box.dataset.vtAr = '1';
    support().then((ok) => {
      if (!ok) return;
      const b = addButton(box, () => {
        const job = { whole: false };
        job.prepare = () => prepareThree(box);
        job.launch = async () => { const mv = await job.ready; await mv.activateAR(); };
        ask(job);
      });
      b.hidden = false;
    });
  }

  function scan() {
    doc.querySelectorAll('model-viewer').forEach(setupMv);
    doc.querySelectorAll('#viewer').forEach((el) => { if (el.tagName !== 'MODEL-VIEWER') setupThree(el); });
  }
  function relabel() {
    doc.querySelectorAll('.vt-ar-btn').forEach(label);
    doc.querySelectorAll('.vt-ar-note').forEach((n) => { n.innerHTML = noteHtml(); });
    if (dlg && dlg.open) render();
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', scan); else scan();
  // App pages add their viewers after loading (React): look again when the page changes.
  let t = 0;
  new MutationObserver(() => { if (!t) t = setTimeout(() => { t = 0; scan(); }, 300); }).observe(doc.body || doc.documentElement, { childList: true, subtree: true });
  new MutationObserver(relabel).observe(doc.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
