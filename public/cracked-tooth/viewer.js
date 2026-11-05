// Cracked tooth viewer: tooth state, bite animation, cut in half, see-through crown and preset views.
const mv = document.getElementById('mv');
const STATES = {
  healthy: {
    title: 'Healthy tooth',
    alt: '3D model of a healthy lower back tooth (first molar) with two roots.',
    text: 'A healthy lower back tooth (first molar). The cusps are joined by ridges of tooth at the front and back. When you bite, the whole tooth takes the force together. This is the comparison model for the others.',
    bite: 'When you bite, the tooth takes the force as one piece. Nothing opens.',
  },
  cracked: {
    title: 'Cracked tooth, not treated',
    alt: '3D model of a lower back tooth with a dark crack running from front to back across the biting surface and down the sides of the crown.',
    text: 'A crack runs from front to back across the biting surface, through both edge ridges, and down into the crown. It stops above the gum line and does not reach the pulp.',
    bite: 'When you bite, the two halves of the tooth bend apart and the crack opens (made much bigger here so you can see it). Each bite can make the crack longer.',
  },
  composite: {
    title: 'Cracked tooth with a filling',
    alt: '3D model of the cracked tooth with a blue filling across the biting surface and through both edge ridges. The crack continues under the filling.',
    text: 'The dentist has removed the top of the crack and placed a tooth-coloured composite resin filling (shown blue) across the tooth. The filling sits inside the tooth. The rest of the crack is still there, under the filling.',
    bite: 'The filling does not hold the cusps together. When you bite, the cusps can still bend apart and the crack under the filling opens (made much bigger here so you can see it).',
  },
  crown: {
    title: 'Cracked tooth with a crown',
    alt: '3D model of the cracked tooth covered by a grey crown that wraps over all the cusps down to just above the gum line.',
    text: 'The tooth has been shaped and covered with a crown (shown grey) that wraps over all the cusps. The crack is still inside the tooth, under the crown. Tap <b>See-through crown</b> to see it.',
    bite: 'The crown wraps around the cusps and holds them together (blue-green arrows), so the crack cannot open when you bite.',
  },
};

const stateButtons = document.querySelectorAll('[data-state]');
const caption = document.getElementById('stage');
const biteBtn = document.getElementById('bite');
const cutBtn = document.getElementById('cut');
const seeBtn = document.getElementById('seethrough');
const faceView = document.getElementById('faceview');
const viewButtons = document.querySelectorAll('[data-orbit]');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (still) mv.setAttribute('interaction-prompt', 'none');
let state = 'healthy';
const on = (b) => b.getAttribute('aria-pressed') === 'true';

function show() {
  const s = STATES[state];
  const cut = on(cutBtn);
  mv.src = 'models/' + state + '-' + (cut ? 'cut' : 'whole') + '.glb';
  mv.alt = s.alt + (cut ? ' The tooth is cut in half from cheek to tongue to show the enamel, dentine and pulp inside.' : '');
  caption.innerHTML = '<h2>' + s.title + '</h2><p>' + s.text + (on(biteBtn) ? ' ' + s.bite : '') + '</p>';
  stateButtons.forEach(b => b.setAttribute('aria-pressed', b.dataset.state === state));
  seeBtn.hidden = state !== 'crown';
  document.querySelectorAll('.legend li').forEach(li => {
    let vis = true;
    if (li.dataset.show) vis = li.dataset.show.split(' ').includes(state);
    if ('cut' in li.dataset) vis = vis && cut;
    if ('bite' in li.dataset) vis = vis && on(biteBtn);
    li.hidden = !vis;
  });
  try { history.replaceState(null, '', '#' + state); } catch { /* ignore */ }
}

function setAlpha(name, a) {
  for (const m of mv.model.materials) {
    if (m.name !== name) continue;
    const c = m.pbrMetallicRoughness.baseColorFactor;
    m.setAlphaMode(a < 1 ? 'BLEND' : 'OPAQUE');
    m.pbrMetallicRoughness.setBaseColorFactor([c[0], c[1], c[2], a]);
  }
}

// Arrows are part of each model; they show only while biting. The bite loops, or with
// reduced motion set, the model jumps to the bitten position and stays there.
function apply() {
  if (!mv.model) return;
  const biting = on(biteBtn);
  setAlpha('force', biting ? 1 : 0);
  setAlpha('hold', biting ? 1 : 0);
  setAlpha('crown', state === 'crown' && on(seeBtn) ? 0.3 : 1);
  if (biting && !still) { mv.play(); }
  else { mv.pause(); mv.currentTime = biting ? 0.8 : 0; }
}
mv.addEventListener('load', apply);

stateButtons.forEach(b => b.addEventListener('click', () => { state = b.dataset.state; show(); }));
biteBtn.addEventListener('click', () => { biteBtn.setAttribute('aria-pressed', !on(biteBtn)); show(); apply(); });
seeBtn.addEventListener('click', () => { seeBtn.setAttribute('aria-pressed', !on(seeBtn)); apply(); });
cutBtn.addEventListener('click', () => {
  cutBtn.setAttribute('aria-pressed', !on(cutBtn));
  show();
  if (on(cutBtn)) { faceView.click(); mv.addEventListener('load', () => faceView.click(), { once: true }); }
});

const start = location.hash.slice(1);
if (STATES[start]) state = start;
show();

viewButtons.forEach(b => b.addEventListener('click', () => {
  mv.cameraOrbit = b.dataset.orbit;
  mv.cameraTarget = 'auto auto auto';
  if (still && mv.jumpCameraToGoal) mv.jumpCameraToGoal();
  viewButtons.forEach(o => o.setAttribute('aria-pressed', o === b));
}));
mv.addEventListener('camera-change', e => {
  if (e.detail && e.detail.source === 'user-interaction') viewButtons.forEach(o => o.setAttribute('aria-pressed', 'false'));
});

mv.addEventListener('progress', e => {
  const bar = mv.querySelector('.progress');
  bar.classList.remove('done');
  bar.querySelector('.progress-fill').style.width = (e.detail.totalProgress * 100) + '%';
  if (e.detail.totalProgress === 1) bar.classList.add('done');
});

// Show a plain message in the viewer box if 3D cannot be shown, instead of an empty box.
function showProblem(text) {
  let box = mv.querySelector('.problem');
  if (!box) { box = document.createElement('div'); box.className = 'problem'; mv.appendChild(box); }
  box.textContent = text;
}
const canvas = document.createElement('canvas');
if (!(canvas.getContext('webgl2') || canvas.getContext('webgl'))) showProblem('This browser cannot show 3D (WebGL is off). Turn on hardware acceleration in the browser settings, or open the page in another browser.');
mv.addEventListener('error', () => showProblem('The 3D model could not load. Please reload the page.'));
setTimeout(() => { if (!customElements.get('model-viewer')) showProblem('The 3D model could not load. Please reload the page.'); }, 10000);

// A tap on a source number opens the closed list of sources first.
document.querySelectorAll('.cite a').forEach(a => a.addEventListener('click', () => {
  const d = document.querySelector('.refs details');
  if (d) d.open = true;
}));
