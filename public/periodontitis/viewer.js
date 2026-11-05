// Stage buttons, preset views, lost-bone toggle and download link for the periodontitis models.
// Stage criteria are from Tonetti, Greenwell and Kornman 2018 (source 1), the 2017 World Workshop case definition.
const mv = document.getElementById('mv');
const STAGES = {
  'healthy': {
    title: 'Healthy',
    text: 'The bone reaches up to about 1.5 mm below the line where the enamel of the crown ends (the <b>cemento-enamel junction</b>, CEJ). In healthy people this gap is usually 0.4 to 1.9 mm on X-rays.<sup class="cite"><a href="#ref-5">5</a></sup> Between the teeth the bone sits higher, because the CEJ curves up there.<sup class="cite"><a href="#ref-6">6</a></sup>',
    model: 'Bone crest 1.5 mm below the CEJ around every tooth. 14 teeth (no wisdom teeth).',
  },
  'stage-1': {
    title: 'Stage I: initial periodontitis',
    text: 'A small amount of the bone and gum attachment around the teeth is lost. On X-rays, bone loss is in the top third of the root (less than 15%). Attachment loss between the teeth is 1 to 2 mm, pockets are 4 mm deep or less, bone loss is mostly horizontal and no teeth have been lost because of gum disease.<sup class="cite"><a href="#ref-1">1</a></sup>',
    model: 'Bone lowered evenly by 10% of the root length around every tooth.',
  },
  'stage-2': {
    title: 'Stage II: moderate periodontitis',
    text: 'More bone is lost, but still within the top third of the root (15% to 33%). Attachment loss between the teeth is 3 to 4 mm, pockets are 5 mm deep or less, bone loss is mostly horizontal and no teeth have been lost because of gum disease.<sup class="cite"><a href="#ref-1">1</a></sup>',
    model: 'Bone lowered evenly by 25% of the root length.',
  },
  'stage-3': {
    title: 'Stage III: severe periodontitis, with risk of losing teeth',
    text: 'Bone loss reaches the middle third of the root or further. Attachment loss between the teeth is 5 mm or more, and up to 4 teeth may have been lost because of gum disease. Treatment is more complex: pockets are 6 mm deep or more, and there may be vertical (angular) bone loss of 3 mm or more, bone loss between the roots of molars (<b>furcation involvement</b>, class II or III) and moderate ridge defects.<sup class="cite"><a href="#ref-1">1</a></sup>',
    model: 'Bone lowered by 40% of the root length, which opens the space between the roots of the lower molars (furcation). Two vertical defects, about 4 mm deeper than the bone around them: in front of the right lower first molar and behind the left lower canine.',
  },
  'stage-4': {
    title: 'Stage IV: advanced periodontitis, with risk of losing the dentition',
    text: 'Bone loss reaches the middle third of the root or further, and 5 or more teeth have been lost because of gum disease. On top of Stage III problems, there is a need for complex rehabilitation because of chewing problems, loose teeth (mobility degree 2 or more), severe ridge defects, bite collapse, teeth drifting or flaring, or fewer than 20 teeth left (10 opposing pairs).<sup class="cite"><a href="#ref-1">1</a></sup>',
    model: 'Bone lowered by 60% of the root length. Four teeth missing in this jaw (both first molars, the left second molar and a lower front tooth), with the ridge lower where they were. The right second molar has tipped forward into the gap. Two vertical defects. Teeth lost from the upper jaw are not shown.',
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
const download = document.getElementById('download');
function showStage(id) {
  const s = STAGES[id];
  mv.src = 'models/' + id + '.glb';
  mv.alt = '3D model of a lower jaw with teeth: ' + s.title + '. ' + s.model;
  caption.innerHTML = '<h2>' + s.title + '</h2><p>' + s.text + '</p><p class="small"><b>What this model shows:</b> ' + s.model + '</p>';
  download.href = 'downloads/vivatheca-periodontitis-' + id + '-1.0x.zip';
  download.textContent = 'Download 3D print files: ' + s.title.split(':')[0] + ' (STL, life size)';
  stageButtons.forEach(b => b.setAttribute('aria-pressed', b.dataset.stage === id));
  try { history.replaceState(null, '', '#' + id); } catch (e) {}
}
stageButtons.forEach(b => b.addEventListener('click', () => showStage(b.dataset.stage)));
const start = location.hash.slice(1);
showStage(STAGES[start] ? start : 'healthy');

// Lost bone: the bone a healthy jaw would have here, shown see-through in red.
const lost = document.getElementById('lost');
function applyLost() {
  if (!mv.model) return;
  const on = lost.getAttribute('aria-pressed') === 'true';
  for (const m of mv.model.materials) {
    if (m.name !== 'lost-bone') continue;
    const c = m.pbrMetallicRoughness.baseColorFactor;
    m.pbrMetallicRoughness.setBaseColorFactor([c[0], c[1], c[2], on ? 0.35 : 0]);
  }
}
lost.addEventListener('click', () => {
  lost.setAttribute('aria-pressed', lost.getAttribute('aria-pressed') !== 'true');
  applyLost();
});
mv.addEventListener('load', applyLost);

// Preset camera views. With reduced motion set, the camera jumps instead of moving.
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (still) mv.setAttribute('interaction-prompt', 'none');
const viewButtons = document.querySelectorAll('[data-orbit]');
viewButtons.forEach(b => b.addEventListener('click', () => {
  mv.cameraOrbit = b.dataset.orbit;
  mv.cameraTarget = b.dataset.target || 'auto auto auto';
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
// (Delegated, because the stage text is replaced on every stage change.)
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('.cite a');
  if (a) { const d = document.querySelector('.refs details'); if (d) d.open = true; }
});
