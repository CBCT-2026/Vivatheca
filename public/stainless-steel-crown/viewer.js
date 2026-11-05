// Stage buttons, preset views and see-through mode for the stainless steel crown models.
const mv = document.getElementById('mv');
const LEGEND = {
  tooth: 'Baby tooth', decay: 'Decay', filling: 'Filling', steel: 'Steel crown', cement: 'Cement',
  gum: 'Gum', bone: 'Bone', pulp: 'Nerve (pulp)',
};
const STAGES = {
  healthy: {
    title: 'Healthy baby molar',
    alt: 'a healthy lower baby back tooth',
    legend: ['tooth', 'gum', 'bone', 'pulp'],
    text: 'A healthy lower second baby molar. The crown (the part you see) has a thin layer of enamel, and the nerve inside (the <b>pulp</b>) is large and close to the surface, as in all baby molars. Below it, the crown of the adult <b>second premolar</b> is growing in the bone. Tap <b>See-through</b> to see them.',
  },
  decay: {
    title: 'Large decay',
    alt: 'a lower baby back tooth with large decay on the top and both sides',
    legend: ['tooth', 'decay', 'gum', 'bone', 'pulp'],
    text: 'Decay (dark brown) has made holes in the biting surface and in both sides that touch the next teeth. When decay spreads across several surfaces like this, the American Academy of Pediatric Dentistry recommends a crown for children at high risk of decay.<sup class="cite"><a href="#ref-1">1</a></sup>',
  },
  filling: {
    title: 'Large filling (for comparison)',
    alt: 'a lower baby back tooth with a large filling across the top and both sides',
    legend: ['tooth', 'filling', 'gum', 'bone', 'pulp'],
    text: 'The same decay replaced by a large filling (purple in this model). Only the lost part is replaced, and the remaining walls of tooth are thin. Large fillings that cover several surfaces of a baby molar fail more often than crowns.<sup class="cite"><a href="#ref-2">2</a></sup><sup class="cite"><a href="#ref-6">6</a></sup>',
  },
  prepared: {
    title: 'Trimmed for a crown',
    alt: 'a lower baby back tooth with the decay removed and the top and sides trimmed for a crown',
    legend: ['tooth', 'filling', 'gum', 'bone', 'pulp'],
    text: 'The usual method: the tooth is numbed, the decay is removed, and the top and the two sides that touch the next teeth are trimmed so the crown can fit.<sup class="cite"><a href="#ref-2">2</a></sup> Filling material (purple) fills where the decay was.',
  },
  crown: {
    title: 'Stainless steel crown',
    alt: 'a lower baby back tooth covered by a stainless steel crown that ends just under the gum',
    legend: ['steel', 'cement', 'tooth', 'filling', 'gum', 'bone', 'pulp'],
    text: 'The ready-made steel crown is cemented over the whole tooth. Its edge is pressed in to hug the neck of the tooth just under the gum. It covers every surface, so there are no filling edges where new decay can start.<sup class="cite"><a href="#ref-1">1</a></sup> Tap <b>See-through</b> to see the trimmed tooth and cement inside.',
  },
};

mv.addEventListener('progress', e => {
  const bar = mv.querySelector('.progress');
  bar.classList.remove('done');
  bar.querySelector('.progress-fill').style.width = (e.detail.totalProgress * 100) + '%';
  if (e.detail.totalProgress === 1) bar.classList.add('done');
});

const stageButtons = document.querySelectorAll('[data-stage]');
const caption = document.getElementById('stage');
const legend = document.getElementById('legend');
function showStage(name) {
  const s = STAGES[name];
  mv.setAttribute('src', 'models/' + name + '.glb');
  mv.setAttribute('alt', '3D model of ' + s.alt + ', in a block of gum and bone, with the adult tooth growing underneath.');
  caption.innerHTML = '<h2>' + s.title + '</h2><p>' + s.text + '</p>';
  legend.innerHTML = s.legend.map(k => '<li><span class="dot ' + k + '"></span>' + LEGEND[k] + '</li>').join('');
  stageButtons.forEach(b => b.setAttribute('aria-pressed', b.dataset.stage === name));
  caption.querySelectorAll('.cite a').forEach(openRefs);
  try { history.replaceState(null, '', '#' + name); } catch (e) {}
}
stageButtons.forEach(b => b.addEventListener('click', () => showStage(b.dataset.stage)));

// See-through: outer layers become faint so the pulp, the trimmed tooth and the adult tooth show.
const xray = document.getElementById('xray');
const FAINT = { gum: 0.18, bone: 0.18, steel: 0.3, cement: 0.45, teeth: 0.4, decay: 0.6, filling: 0.55 };
function applyXray() {
  if (!mv.model) return;
  const on = xray.getAttribute('aria-pressed') === 'true';
  for (const m of mv.model.materials) {
    if (!(m.name in FAINT)) continue;
    const c = m.pbrMetallicRoughness.baseColorFactor;
    m.setAlphaMode(on ? 'BLEND' : 'OPAQUE');
    m.pbrMetallicRoughness.setBaseColorFactor([c[0], c[1], c[2], on ? FAINT[m.name] : 1]);
  }
}
xray.addEventListener('click', () => {
  xray.setAttribute('aria-pressed', xray.getAttribute('aria-pressed') !== 'true');
  applyXray();
});
mv.addEventListener('load', applyXray);

// Preset camera views. With reduced motion set, the camera jumps instead of moving.
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (still) mv.setAttribute('interaction-prompt', 'none');
const viewButtons = document.querySelectorAll('[data-orbit]');
viewButtons.forEach(b => b.addEventListener('click', () => {
  mv.cameraOrbit = b.dataset.orbit;
  mv.cameraTarget = '0mm -1mm 0mm';
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
if (!(canvas.getContext('webgl2') || canvas.getContext('webgl'))) showProblem('This browser cannot show 3D (WebGL is off). Turn on hardware acceleration in the browser settings, or open the page in another browser.');
mv.addEventListener('error', () => showProblem('The 3D model could not load. Please reload the page.'));
setTimeout(() => { if (!customElements.get('model-viewer')) showProblem('The 3D model could not load. Please reload the page.'); }, 10000);

// A tap on a source number opens the closed list of sources first.
function openRefs(a) {
  a.addEventListener('click', () => { const d = document.querySelector('.refs details'); if (d) d.open = true; });
}
document.querySelectorAll('main > section .cite a').forEach(openRefs);

const start = location.hash.slice(1);
showStage(STAGES[start] ? start : 'healthy');
