// Orthognathic surgery viewer: bite type, before/after, preset views and overlays.
const mv = document.getElementById('mv');
const STATES = {
  'normal': {
    title: 'Normal bite (Class I)',
    alt: '3D model of a skull with a normal bite: the upper front teeth sit just in front of the lower front teeth.',
    text: 'The upper and lower jaws are in balance. The upper front teeth sit a little in front of the lower front teeth, and the back teeth fit together. This is the comparison model for the others.',
  },
  'class2-before': {
    title: 'Class II, before surgery: lower jaw too far back',
    alt: '3D model of a skull with a Class II bite: the lower jaw and lower teeth sit well behind the upper teeth.',
    text: 'The tooth-bearing part of the lower jaw sits 6 mm further back than in the normal model. There is a large gap between the upper and lower front teeth. The chin looks set back.',
  },
  'class2-after': {
    title: 'Class II, after surgery: lower jaw moved forward',
    alt: '3D model of a skull after a bilateral sagittal split osteotomy: the front part of the lower jaw has been moved forward and held with a titanium plate on each side.',
    text: 'A <b>lower jaw split</b> (BSSO) splits each side of the lower jaw along its length. The part with the teeth slides 6 mm forward, so the teeth meet as in the normal model. A small titanium plate on each side holds the pieces while the bone heals. Red shows cut bone.',
  },
  'class2-after-genio': {
    title: 'Class II, after surgery, with chin surgery (genioplasty)',
    alt: '3D model of a skull after a bilateral sagittal split osteotomy and an advancement genioplasty: the lower jaw and, separately, the tip of the chin have been moved forward and held with titanium plates.',
    text: 'The same <b>lower jaw split</b> (BSSO) moves the teeth 6 mm forward. In a <b>genioplasty</b>, the surgeon also cuts off the tip of the chin below the tooth roots and slides it 5 mm forward. A small plate holds the chin. This is for a chin that still looks set back once the teeth fit. Red shows cut bone.',
  },
  'class3-before': {
    title: 'Class III, before surgery: upper jaw back, lower jaw forward',
    alt: '3D model of a skull with a Class III bite: the lower front teeth sit in front of the upper front teeth. The mouth is shown slightly open.',
    text: 'The upper jaw sits 3 mm back and the tooth-bearing part of the lower jaw 5 mm forward. The lower front teeth are in front of the upper front teeth (a reverse bite). We show the mouth slightly open so the teeth do not pass through each other in the model.',
  },
  'class3-after': {
    title: 'Class III, after surgery: both jaws moved',
    alt: '3D model of a skull after a Le Fort I osteotomy and a bilateral sagittal split osteotomy, with titanium plates on the upper and lower jaw.',
    text: 'The surgeon operates on both jaws at once. An <b>upper jaw cut</b> (Le Fort I) above the tooth roots lets the upper jaw move 3 mm forward. A <b>lower jaw split</b> (BSSO) moves the lower teeth 5 mm back. Four plates hold the upper jaw and one plate on each side holds the lower jaw. Red shows cut bone.',
  },
  'class3-after-genio': {
    title: 'Class III, after surgery, with chin surgery (genioplasty)',
    alt: '3D model of a skull after a Le Fort I osteotomy, a bilateral sagittal split osteotomy and a reduction genioplasty: the tip of the chin has been moved back and held with a small titanium plate.',
    text: 'The same operations on both jaws, plus a <b>genioplasty</b>: the surgeon cuts off the tip of the chin below the tooth roots and slides it 4 mm back. A small plate holds the chin. This is for a chin that still looks too far forward once the teeth fit. Red shows cut bone.',
  },
};

const classButtons = document.querySelectorAll('[data-class]');
const phaseButtons = document.querySelectorAll('[data-phase]');
const phaseGroup = document.getElementById('phase');
const caption = document.getElementById('stage');
const ghost = document.getElementById('ghost');
const moved = document.getElementById('moved');
const afterTools = document.getElementById('after-tools');
const legendAfter = document.querySelectorAll('.after-only');
const genioGroup = document.getElementById('genio');
const genioButtons = document.querySelectorAll('[data-genio]');
let cls = 'normal', phase = 'before', genio = false;

function key() { return cls === 'normal' ? 'normal' : cls + '-' + phase + (phase === 'after' && genio ? '-genio' : ''); }
function show() {
  const k = key(), s = STATES[k], j = 's_' + k.replace(/-/g, '_') + '_';
  const T = window.vtT || ((_, en) => en), TP = window.vtTPlain || ((_, en) => en);
  mv.src = 'models/' + k + '.glb';
  mv.alt = TP(j + 'alt', s.alt);
  caption.innerHTML = '<h2>' + T(j + 'title', s.title) + '</h2><p>' + T(j + 'text', s.text) + '</p>';
  classButtons.forEach(b => b.setAttribute('aria-pressed', b.dataset.class === cls));
  phaseButtons.forEach(b => b.setAttribute('aria-pressed', b.dataset.phase === phase));
  phaseGroup.hidden = cls === 'normal';
  genioButtons.forEach(b => b.setAttribute('aria-pressed', (b.dataset.genio === 'with') === genio));
  const after = phase === 'after' && cls !== 'normal';
  genioGroup.hidden = !after;
  afterTools.hidden = !after;
  legendAfter.forEach(el => { el.hidden = !after; });
  try { history.replaceState(null, '', '#' + k); } catch { /* ignore */ }
}
classButtons.forEach(b => b.addEventListener('click', () => { cls = b.dataset.class; show(); }));
phaseButtons.forEach(b => b.addEventListener('click', () => { phase = b.dataset.phase; show(); }));
genioButtons.forEach(b => b.addEventListener('click', () => { genio = b.dataset.genio === 'with'; show(); }));
const start = location.hash.slice(1);
if (STATES[start]) { const p = start.split('-'); cls = p[0]; phase = p[1] || 'before'; genio = p[2] === 'genio'; }
show();

// Overlays on the after models: the bone as it was before surgery (see-through blue), and the moved bone tinted.
const BONE = [0.6724, 0.5972, 0.4969, 1], MOVED = [0.69, 0.32, 0.045, 1];
function applyOverlays() {
  if (!mv.model) return;
  for (const m of mv.model.materials) {
    const pbr = m.pbrMetallicRoughness;
    if (m.name === 'before') {
      const on = ghost.getAttribute('aria-pressed') === 'true';
      m.setAlphaMode('BLEND');
      pbr.setBaseColorFactor([0.12, 0.45, 0.85, on ? 0.35 : 0]);
    }
    if (m.name === 'moved') pbr.setBaseColorFactor(moved.getAttribute('aria-pressed') === 'true' ? MOVED : BONE);
  }
}
[ghost, moved].forEach(b => b.addEventListener('click', () => {
  b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true');
  applyOverlays();
}));
mv.addEventListener('load', applyOverlays);

mv.addEventListener('progress', e => {
  const bar = mv.querySelector('.progress');
  bar.classList.remove('done');
  bar.querySelector('.progress-fill').style.width = (e.detail.totalProgress * 100) + '%';
  if (e.detail.totalProgress === 1) bar.classList.add('done');
});

// Preset camera views. With reduced motion set, the camera jumps instead of moving.
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (still) mv.setAttribute('interaction-prompt', 'none');
const viewButtons = document.querySelectorAll('[data-orbit]');
viewButtons.forEach(b => b.addEventListener('click', () => {
  mv.cameraOrbit = b.dataset.orbit;
  mv.cameraTarget = '0m -0.012m 0.02m';
  if (still && mv.jumpCameraToGoal) mv.jumpCameraToGoal();
  viewButtons.forEach(o => o.setAttribute('aria-pressed', o === b));
}));
mv.addEventListener('camera-change', e => {
  if (e.detail && e.detail.source === 'user-interaction') viewButtons.forEach(o => o.setAttribute('aria-pressed', 'false'));
});

// Show a plain message in the viewer box if 3D cannot be shown, instead of an empty box.
function showProblem(text) {
  let box = mv.querySelector('.problem');
  if (!box) { box = document.createElement('div'); box.className = 'problem'; mv.appendChild(box); }
  box.textContent = text;
}
const canvas = document.createElement('canvas');
if (!(canvas.getContext('webgl2') || canvas.getContext('webgl'))) showProblem((window.vtTPlain || ((_, en) => en))('noWebgl', 'This browser cannot show 3D (WebGL is off). Turn on hardware acceleration in the browser settings, or open the page in another browser.'));
mv.addEventListener('error', () => showProblem((window.vtTPlain || ((_, en) => en))('loadFailed', 'The 3D model could not load. Please reload the page.')));
setTimeout(() => { if (!customElements.get('model-viewer')) showProblem((window.vtTPlain || ((_, en) => en))('loadFailed', 'The 3D model could not load. Please reload the page.')); }, 10000);

// A tap on a source number opens the closed list of sources first.
document.querySelectorAll('.cite a').forEach(a => a.addEventListener('click', () => {
  const d = document.querySelector('.refs details');
  if (d) d.open = true;
}));
