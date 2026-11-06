// One-case 3D viewer for the head and neck condition pages (/head-neck/<condition>/).
// The page sets the model on #viewer: data-model (GLB path) and data-jaw ('mandible' or 'maxilla').
// Stage captions live in #stage as <p data-for="pre|op|post|recon">; the matching one is shown.
// Node names in the GLB decide when each part shows (see SHOW below).
(function () {
  const I = window.VIVA_I18N || { lang: 'en', text: () => null, ruby: (s) => s, plain: (s) => s };
  const JA = I.lang === 'ja';
  const T = (key, en) => { const s = I.text(key); return s ? I.ruby(s) : en; };
  const box = document.getElementById('viewer'), status = document.getElementById('status');
  const JAW = box.dataset.jaw || 'mandible';

  const LEGEND = [
    [/^bone$/, 'Bone', '{骨|ほね}'], [/^teeth$/, 'Teeth', '{歯|は}'], [/^lesion/, 'Disease', '{病変|びょうへん}'], [/^margin/, 'Safety margin', '{安全|あんぜん}{域|いき}'],
    [/^specimen_bone/, 'Bone removed', '{取|と}る{骨|ほね}'], [/^specimen_teeth/, 'Teeth removed with the bone', '{骨|ほね}と{一緒|いっしょ}に{取|と}る{歯|は}'],
    [/^removed/, 'Bone removed', '{取|と}る{骨|ほね}'], [/^root_tips/, 'Root tips cut off', '{切|き}り{取|と}る{根|ね}の{先|さき}'],
    [/^mucosa$/, 'Palate lining', '{口|くち}の{天井|てんじょう}の{粘膜|ねんまく}'], [/^excised/, 'Lining removed', '{取|と}る{粘膜|ねんまく}'],
    [/^fibula/, 'Fibula (leg bone)', 'ひ{骨|こつ}（すねの{骨|ほね}）'], [/^plate$/, 'Titanium plate and screws', 'チタンのプレートとネジ'],
    [/^prf/, 'PRF (made from the patient’s own blood)', 'PRF（{自分|じぶん}の{血液|けつえき}から{作|つく}る）'],
    [/^cover_plate/, 'Clear cover plate', '{透明|とうめい}な{保護|ほご}{板|ばん}'], [/^dressing/, 'Dressing paste', '{傷|きず}を{守|まも}るパック'],
  ];
  const RECON = /^(fibula|plate|screws|prf|cover_plate|dressing)/;
  const MOVE = /^(specimen|extracted|lesion|removed|excised|margin|root_tips)/;

  const say = (key, en) => { status.style.display = ''; status.innerHTML = T(key, en); };
  const stageText = (s) => document.querySelectorAll('#stage [data-for]').forEach((p) => { p.hidden = p.dataset.for !== s; });
  const state = { stage: 'pre', margin: false, xray: false };
  const pressed = () => {
    document.querySelectorAll('[data-stage]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.stage === state.stage)));
    const m = document.getElementById('btn-margin'), x = document.getElementById('btn-xray');
    if (m) m.setAttribute('aria-pressed', String(state.margin));
    if (x) x.setAttribute('aria-pressed', String(state.xray));
    stageText(state.stage);
  };
  document.querySelectorAll('[data-stage]').forEach((b) => b.addEventListener('click', () => { state.stage = b.dataset.stage; pressed(); apply(); }));
  pressed();

  if (!window.THREE || !(() => { try { const cv = document.createElement('canvas'); return !!(cv.getContext('webgl2') || cv.getContext('webgl')); } catch (e) { return false; } })()) {
    say('noWebgl', 'This browser cannot show 3D (WebGL is off). Turn on hardware acceleration in your browser settings, or open the page in another browser.');
    return;
  }
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.outputEncoding = THREE.sRGBEncoding;
  box.prepend(renderer.domElement);
  // Screen readers get a text label for the 3D view (the page heading, without furigana readings).
  (function labelCanvas() {
    const h = document.querySelector('h1'); if (!h) return;
    const c = h.cloneNode(true); c.querySelectorAll('rt, rp').forEach((r) => r.remove());
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', (document.documentElement.lang === 'ja' ? '3Dモデル: ' : '3D model: ') + c.textContent.trim());
  })();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 4 / 3, 0.005, 5);
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.minDistance = 0.06; controls.maxDistance = 0.7;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8478, 0.75));
  const k1 = new THREE.DirectionalLight(0xffffff, 0.8); k1.position.set(-0.3, 0.5, 0.4); scene.add(k1);
  const k2 = new THREE.DirectionalLight(0xffffff, 0.4); k2.position.set(0.4, -0.4, 0.3); scene.add(k2);
  const resize = () => { const w = box.clientWidth, h = box.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  new ResizeObserver(resize).observe(box); resize();

  // glTF axes: +Z is the front of the face, -X is the patient's right, +Y is up.
  const VIEWS = { front: [0, 0.01, 0.27], right: [-0.27, 0.02, 0.02], left: [0.27, 0.02, 0.02], under: [0, -0.27, 0.06], above: [0, 0.27, 0.05] };
  const START = { mandible: (box.dataset.side === 'left' ? [0.19, 0.08, 0.17] : [-0.19, 0.08, 0.17]), maxilla: [-0.05, -0.2, 0.12] };
  const setView = (v) => { camera.position.set(...v); controls.target.set(0, 0, 0); controls.update(); };
  document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => setView(VIEWS[b.dataset.view])));

  let parts = [], offset = 0, target = 0;
  const baseName = (n) => n.replace(/[._]\d+$/, '');
  function apply() {
    if (!parts.length) return;
    const s = state.stage;
    parts.forEach((o) => {
      const n = o.userData.n; let vis = true;
      if (/^margin/.test(n)) vis = state.margin && (s === 'pre' || s === 'op');
      else if (/^excised/.test(n)) vis = s === 'op';
      else if (RECON.test(n)) vis = s === 'recon';
      else if (MOVE.test(n) && (s === 'post' || s === 'recon')) vis = false;
      o.visible = vis;
      const xr = state.xray && /^(bone|sphenoid|specimen_bone|mucosa)/.test(n);
      o.material.transparent = xr || o.userData.tr; o.material.opacity = xr ? 0.28 : o.userData.op;
      o.material.depthWrite = !o.material.transparent; o.material.needsUpdate = true;
    });
    target = s === 'op' ? (JAW === 'mandible' ? 0.03 : -0.025) : 0;
    const vis = parts.filter((o) => o.visible);
    document.getElementById('legend').innerHTML = LEGEND.map(([re, en, ja]) => {
      const o = vis.find((p) => re.test(p.userData.n));
      if (!o) return '';
      const col = '#' + o.material.color.clone().convertLinearToSRGB().getHexString();
      return '<li><span class="dot" style="background:' + col + '"></span>' + (JA ? I.ruby(ja) : en) + '</li>';
    }).join('');
  }
  const m = document.getElementById('btn-margin'), x = document.getElementById('btn-xray');
  if (m) m.addEventListener('click', () => { state.margin = !state.margin; pressed(); apply(); });
  if (x) x.addEventListener('click', () => { state.xray = !state.xray; pressed(); apply(); });

  say('loading', 'Loading model…');
  new THREE.GLTFLoader().load(box.dataset.model, (gltf) => {
    const g = gltf.scene;
    g.traverse((o) => {
      if (!o.isMesh) return;
      const n = baseName(o.name || '');
      o.geometry.computeVertexNormals();
      const mt = o.material.clone(); mt.flatShading = false; mt.side = THREE.DoubleSide;
      if (/^margin/.test(n)) { mt.transparent = true; mt.opacity = 0.18; mt.depthWrite = false; }
      if (/^(excised|mucosa)/.test(n)) { mt.transparent = true; mt.opacity = /^mucosa/.test(n) ? 0.4 : 0.55; mt.depthWrite = false; }
      if (/^cover_plate/.test(n)) { mt.transparent = true; mt.opacity = 0.45; mt.depthWrite = false; }
      if (/^fibula/.test(n)) mt.color.setHex(0xc8a47a).convertSRGBToLinear(); // graft bone: a darker shade than the jaw so it reads as a separate piece
      o.material = mt; o.userData = { n, op: mt.opacity, tr: mt.transparent, y0: o.position.y }; parts.push(o);
    });
    g.position.sub(new THREE.Box3().setFromObject(g).getCenter(new THREE.Vector3()));
    scene.add(g); status.style.display = 'none';
    apply(); setView(START[JAW]);
  }, undefined, () => say('loadFailed', 'The 3D model could not load. Reload the page to try again.'));

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  (function loop() {
    requestAnimationFrame(loop);
    offset += (target - offset) * (reduce ? 1 : 0.12);
    parts.forEach((o) => { if (MOVE.test(o.userData.n)) o.position.y = o.userData.y0 + offset; });
    controls.update(); renderer.render(scene, camera);
  })();
})();
