// Age stepper, preset views, see-through bone and download link for the dental development models.
const mv = document.getElementById('mv');
const STAGES = {
  '6.5': {
    title: 'About 6 years old',
    text: 'All the baby teeth are still in, except the lower middle front teeth, which are often loose or gone. The first adult back teeth (<b>first molars</b>, the "6-year molars") are coming through behind the baby teeth. They do not replace any baby tooth. Many adult teeth are growing inside the jaw.',
  },
  '7.5': {
    title: 'About 7 years old',
    text: 'The lower front adult teeth are in. The upper middle front adult teeth are coming through, and the lower side front teeth are close behind. The first molars are now in use.',
  },
  '8.5': {
    title: 'About 8 years old',
    text: 'The upper side front adult teeth are coming in. Your child now has 8 adult front teeth and 4 first molars, with baby teeth in between.',
  },
  '9.5': {
    title: 'About 9 years old',
    text: 'A quiet time in the mouth. The baby eye teeth (<b>canines</b>) and baby back teeth (<b>baby molars</b>) are still in. Under them, the adult canines and <b>premolars</b> are growing their roots and moving up. The roots of the baby teeth above them are slowly melting away.',
  },
  '10.5': {
    title: 'About 10 years old',
    text: 'Baby teeth start to fall out again. The lower adult canines and the upper first premolars are coming through. Some baby molars are loose or gone.',
  },
  '11.5': {
    title: 'About 11 years old',
    text: 'The upper adult canines and the premolars are coming through. Most baby teeth are gone. The last baby back teeth (<b>second baby molars</b>) are often loose now. The second adult molars are close to the gum behind the first molars.',
  },
  '12.5': {
    title: 'About 12 years old',
    text: 'All the baby teeth are gone. The second molars (the "12-year molars") are coming through behind the first molars. The crowns of the <b>wisdom teeth</b> are starting to form deep in the jaw. Their roots will keep growing in the teen years.',
  },
};

// Japanese (or another language) from i18n.js, if the visitor chose one.
const I18N = window.VIVA_I18N || { text: () => null, stages: null, ruby: (s) => s, plain: (s) => s };
const stageText = (age) => (I18N.stages && I18N.stages[age]) || STAGES[age];

mv.addEventListener('progress', e => {
  const bar = mv.querySelector('.progress');
  bar.classList.remove('done');
  bar.querySelector('.progress-fill').style.width = (e.detail.totalProgress * 100) + '%';
  if (e.detail.totalProgress === 1) bar.classList.add('done');
});

// Age buttons swap the model and the text, and keep the camera where it is.
const ageButtons = document.querySelectorAll('[data-age]');
const caption = document.getElementById('stage');
const download = document.getElementById('download');
function showAge(age) {
  const tag = 'age-' + age.replace('.', '-');
  mv.src = 'models/' + tag + '.glb';
  const stage = stageText(age);
  const altJa = I18N.text('altAt', { age: I18N.plain(stage.title) });
  mv.alt = altJa ? I18N.plain(altJa) : '3D model of the right side of a child\'s upper and lower jaw at ' + stage.title.toLowerCase() +
    ', with the cheek side of the bone cut away to show baby teeth and growing adult teeth.';
  caption.innerHTML = '<h2>' + I18N.ruby(stage.title) + '</h2><p>' + I18N.ruby(stage.text) + '</p>';
  download.href = 'downloads/vivatheca-dental-development-' + tag + '-1.5x.zip';
  const downloadJa = I18N.text('download', { age: stage.title });
  if (downloadJa) download.innerHTML = I18N.ruby(downloadJa);
  else download.textContent = 'Download 3D print files: ' + stage.title.toLowerCase() + ' (STL, 1.5x life size)';
  ageButtons.forEach(b => b.setAttribute('aria-pressed', b.dataset.age === age));
  try { history.replaceState(null, '', '#age-' + age); } catch (e) {}
}
ageButtons.forEach(b => b.addEventListener('click', () => showAge(b.dataset.age)));
const start = (location.hash.match(/^#age-(\d+\.5)$/) || [])[1];
showAge(STAGES[start] ? start : '6.5');

// See-through bone: the growing teeth inside the jaw show through.
const xray = document.getElementById('xray');
function applyBone() {
  if (!mv.model) return;
  const on = xray.getAttribute('aria-pressed') === 'true';
  for (const m of mv.model.materials) {
    if (m.name !== 'bone') continue;
    const c = m.pbrMetallicRoughness.baseColorFactor;
    m.setAlphaMode(on ? 'BLEND' : 'OPAQUE');
    m.pbrMetallicRoughness.setBaseColorFactor([c[0], c[1], c[2], on ? 0.3 : 1]);
  }
}
xray.addEventListener('click', () => {
  xray.setAttribute('aria-pressed', xray.getAttribute('aria-pressed') !== 'true');
  applyBone();
});
mv.addEventListener('load', applyBone);

// Preset camera views. With reduced motion set, the camera jumps instead of moving.
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (still) mv.setAttribute('interaction-prompt', 'none');
const viewButtons = document.querySelectorAll('[data-orbit]');
viewButtons.forEach(b => b.addEventListener('click', () => {
  mv.cameraOrbit = b.dataset.orbit;
  mv.cameraTarget = 'auto auto auto';
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
  box.innerHTML = I18N.ruby(text);
}
const NO_WEBGL = I18N.text('noWebgl') || 'This browser cannot show 3D (WebGL is off). Turn on hardware acceleration in the browser settings, or open the page in another browser.';
const LOAD_FAILED = I18N.text('loadFailed') || 'The 3D model could not load. Please reload the page.';
const canvas = document.createElement('canvas');
if (!(canvas.getContext('webgl2') || canvas.getContext('webgl'))) showProblem(NO_WEBGL);
mv.addEventListener('error', () => showProblem(LOAD_FAILED));
setTimeout(() => { if (!customElements.get('model-viewer')) showProblem(LOAD_FAILED); }, 10000);

// A tap on a source number opens the closed list of sources first.
document.querySelectorAll('.cite a').forEach(a => a.addEventListener('click', () => {
  const d = document.querySelector('.refs details');
  if (d) d.open = true;
}));
