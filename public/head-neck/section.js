// Cross-section ("cut through") tool for the three.js head and neck viewers (deep-dive pick X2).
// A clipping plane moves through the model along one of the three standard planes (sagittal, coronal,
// axial), so the extent of a lesion, the resection and the graft can be seen inside the bone.
// Cut faces are drawn as flat, darker caps: each solid part gets a back-face copy in a plain colour,
// which is what shows through the cut. (three.js clipping planes; MIT. three-mesh-bvh/three-bvh-csg were
// not needed for a moving plane.)
// The viewer calls window.VTSection({ box, renderer, scene }) once; the controls are added under
// the page's view buttons. Toggle id `btn-section` keeps aria-pressed so share links and tours read it.
(function () {
  const I = window.VIVA_I18N || { lang: 'en', ruby: (s) => s, plain: (s) => s };
  const L = { ja: 1, vi: 2 }[I.lang] || 0;
  const W = {
    toggle: ['Cut through', '{断面|だんめん}を{見|み}る', 'Xem mặt cắt'],
    group: ['Cut direction', '{断面|だんめん}の{向|む}き', 'Hướng cắt'],
    x: ['Left to right (sagittal)', '{左右|さゆう}（{矢状断|しじょうだん}）', 'Trái sang phải (đứng dọc)'],
    z: ['Front to back (coronal)', '{前後|ぜんご}（{冠状断|かんじょうだん}）', 'Trước ra sau (đứng ngang)'],
    y: ['Top to bottom (axial)', '{上下|じょうげ}（{軸位断|じくいだん}）', 'Trên xuống dưới (ngang)'],
    pos: ['Cut position', '{断面|だんめん}の{位置|いち}', 'Vị trí mặt cắt'],
    flip: ['Show the other side', '{反対側|はんたいがわ}を{見|み}る', 'Xem phía bên kia'],
    note: ['The cut face is a flat colour. The model is solid inside, so it shows no marrow or other inner detail.',
      '{切|き}り{口|くち}は{一色|ひといろ}で{表|あらわ}しています。{模型|もけい}の{中|なか}は{詰|つ}まっているので、{骨髄|こつずい}などは{見|み}えません。',
      'Mặt cắt được tô một màu. Bên trong mô hình là khối đặc, nên không thấy tủy xương hay chi tiết bên trong.'],
  };
  const say = (k) => I.ruby(W[k][L]);
  const AXES = { x: new THREE.Vector3(1, 0, 0), z: new THREE.Vector3(0, 0, -1), y: new THREE.Vector3(0, -1, 0) };

  window.VTSection = function ({ box, renderer, scene }) {
    const plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
    const state = { on: false, axis: 'x', t: 0.5, flip: false };
    renderer.localClippingEnabled = true;

    // Controls, placed after the view buttons (or after the viewer).
    const anchor = document.querySelector('.row.views') || box;
    const wrap = document.createElement('div');
    wrap.className = 'row vt-section';
    wrap.innerHTML =
      '<button type="button" id="btn-section" aria-pressed="false">' + say('toggle') + '</button>' +
      '<div class="vt-section-more" hidden>' +
      '<div class="vt-section-axes" role="group" aria-label="' + I.plain(W.group[L]) + '">' +
      ['x', 'z', 'y'].map((a) => '<button type="button" data-axis="' + a + '" aria-pressed="' + (a === 'x') + '">' + say(a) + '</button>').join('') + '</div>' +
      '<label class="vt-section-pos"><span>' + say('pos') + '</span><input type="range" min="0" max="100" value="50" step="1"></label>' +
      '<button type="button" id="btn-section-flip" aria-pressed="false">' + say('flip') + '</button>' +
      '<p class="vt-section-note">' + say('note') + '</p></div>';
    anchor.after(wrap);
    const btn = wrap.querySelector('#btn-section'), more = wrap.querySelector('.vt-section-more');
    const range = wrap.querySelector('input'), flipBtn = wrap.querySelector('#btn-section-flip');

    // Solid parts get a cap: a back-face copy in a darker plain colour, child of the part (same moves and visibility).
    const solids = () => { const out = []; scene.traverse((o) => { if (o.isMesh && !o.userData.vtCap && o.material && !o.material.transparent && !o.material.wireframe) out.push(o); }); return out; };
    function caps() {
      solids().forEach((o) => {
        if (!o.userData.vtCapMesh) {
          const c = o.material.color ? o.material.color.clone().multiplyScalar(0.62) : new THREE.Color(0x888888);
          const cap = new THREE.Mesh(o.geometry, new THREE.MeshBasicMaterial({ color: c, side: THREE.BackSide, clippingPlanes: [plane] }));
          cap.userData.vtCap = true; cap.raycast = () => {};
          o.add(cap); o.userData.vtCapMesh = cap;
        }
        o.userData.vtCapMesh.visible = state.on;
        o.material.side = state.on ? THREE.FrontSide : THREE.DoubleSide;
      });
      scene.traverse((o) => {
        if (!o.isMesh || o.userData.vtCap || !o.material) return;
        o.material.clippingPlanes = state.on ? [plane] : null;
        o.material.needsUpdate = true;
      });
    }
    function bounds() {
      const b = new THREE.Box3();
      scene.traverse((o) => { if (o.isMesh && !o.userData.vtCap && o.visible) b.expandByObject(o); });
      return b;
    }
    function place() {
      const n = AXES[state.axis].clone();
      if (state.flip) n.negate();
      const b = bounds();
      if (b.isEmpty()) return;
      const k = state.axis;
      const lo = b.min[k], hi = b.max[k];
      // Slider 0 = the side the plane starts from; the kept half is on the positive side of the normal.
      const along = lo + (hi - lo) * state.t;
      plane.normal.copy(n);
      plane.constant = -n.getComponent(['x', 'y', 'z'].indexOf(k)) * along;
    }
    function update() {
      btn.setAttribute('aria-pressed', String(state.on));
      flipBtn.setAttribute('aria-pressed', String(state.flip));
      more.hidden = !state.on;
      wrap.querySelectorAll('[data-axis]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.axis === state.axis)));
      caps(); place();
    }
    btn.addEventListener('click', () => { state.on = !state.on; update(); });
    flipBtn.addEventListener('click', () => { state.flip = !state.flip; update(); });
    wrap.querySelectorAll('[data-axis]').forEach((b) => b.addEventListener('click', () => { state.axis = b.dataset.axis; update(); }));
    range.addEventListener('input', () => { state.t = range.value / 100; place(); });
    // Stage changes and model swaps (hub) announce themselves with vt-parts: new parts need caps.
    box.addEventListener('vt-parts', () => { if (state.on) update(); });
    box.vtSection = { state, update };
  };
})();
