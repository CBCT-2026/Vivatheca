// Stage buttons, preset views, lost-bone toggle and download link for the periodontitis models.
// Stage criteria are from Tonetti, Greenwell and Kornman 2018 (source 1), the 2017 World Workshop case definition.
const mv = document.getElementById('mv');
const STAGES = {
  'healthy': {
    title: 'Healthy',
    text: '<b>The bone holds each tooth up to just below the crown.</b> The bone reaches up to just below the line where the enamel of the crown ends (the <b>cemento-enamel junction</b>, CEJ). In teenagers with no attachment loss, this distance was 0.4 to 1.9 mm on bite-wing X-rays of the back teeth.<sup class="cite"><a href="#ref-5">5</a></sup> Between the teeth the bone sits higher, because the CEJ curves up there.<sup class="cite"><a href="#ref-6">6</a></sup>',
    model: 'Bone crest 1.5 mm below the CEJ around every tooth. 14 teeth (no wisdom teeth).',
  },
  'stage-1': {
    title: 'Stage I: initial periodontitis',
    text: '<b>A little of the bone that holds each tooth is gone.</b> A small amount of the bone and gum attachment around the teeth is lost. On X-rays, bone loss is in the top third of the root (less than 15%). Attachment loss between the teeth is 1 to 2 mm, pockets are 4 mm deep or less, bone loss is mostly horizontal and no teeth have been lost because of gum disease.<sup class="cite"><a href="#ref-1">1</a></sup>',
    model: 'Bone lowered evenly by 10% of the root length (measured from the normal crest level to the root tip).',
  },
  'stage-2': {
    title: 'Stage II: moderate periodontitis',
    text: '<b>Up to a third of the bone that holds each tooth is gone.</b> More bone is lost, but still within the top third of the root (15% to 33%). Attachment loss between the teeth is 3 to 4 mm, pockets are 5 mm deep or less, bone loss is mostly horizontal and no teeth have been lost because of gum disease.<sup class="cite"><a href="#ref-1">1</a></sup>',
    model: 'Bone lowered by 25% of the root length around the front teeth and premolars, and by 15% around the molars, so the space between the molar roots (furcation) stays closed. An open furcation of class II or III is a Stage III feature.<sup class="cite"><a href="#ref-1">1</a></sup>',
  },
  'stage-3': {
    title: 'Stage III: severe periodontitis with potential for additional tooth loss',
    text: '<b>Bone is lost down to the middle of the roots, and more teeth may be lost.</b> Bone loss reaches the middle third of the root or further. Attachment loss between the teeth is 5 mm or more, and up to 4 teeth may have been lost because of gum disease. Treatment is more complex. There may be pockets 6 mm or deeper, vertical (angular) bone loss of 3 mm or more, bone loss between the roots of molars (<b>furcation involvement</b>, class II or III) and moderate ridge defects.<sup class="cite"><a href="#ref-1">1</a></sup><sup class="cite"><a href="#ref-2">2</a></sup>',
    model: 'Bone lowered by 40% of the root length, which exposes the furcation of the lower molars right through (class III: through and through).<sup class="cite"><a href="#ref-10">10</a></sup> Two vertical defects, about 4 mm deeper than the bone around them (Stage III lists vertical bone loss of 3 mm or more<sup class="cite"><a href="#ref-1">1</a></sup>): in front of the right lower first molar and behind the left lower canine.',
  },
  'stage-4': {
    title: 'Stage IV: severe periodontitis with potential for loss of the dentition',
    text: '<b>Most of the bone is gone and many or all teeth are at risk.</b> Bone loss reaches the middle third of the root or further. Stage IV applies if 5 or more teeth have been lost because of gum disease, or if Stage IV complexity factors are present: a need for complex rehabilitation because of chewing problems, loose teeth (mobility degree 2 or more), severe ridge defects, bite collapse, teeth drifting or flaring, or fewer than 20 teeth left (10 opposing pairs).<sup class="cite"><a href="#ref-1">1</a></sup><sup class="cite"><a href="#ref-2">2</a></sup><sup class="cite"><a href="#ref-11">11</a></sup>',
    model: 'This jaw shows 4 lost teeth; the 5th is assumed to be in the upper jaw (not shown). Bone lowered by 60% of the root length. Four lower teeth missing (both first molars, the left second molar and a lower front tooth), with the ridge lower where they were. The right second molar has tipped forward into the gap; drifting like this is itself a Stage IV complexity factor.<sup class="cite"><a href="#ref-1">1</a></sup> Two vertical defects. The model cannot show why teeth were lost; only teeth lost because of periodontitis count.',
  },
};

mv.addEventListener('progress', e => {
  const bar = mv.querySelector('.progress');
  bar.classList.remove('done');
  bar.querySelector('.progress-fill').style.width = (e.detail.totalProgress * 100) + '%';
  if (e.detail.totalProgress === 1) bar.classList.add('done');
});

const stageButtons = document.querySelectorAll('[data-stage]');
const lost = document.getElementById('lost');
// A comma goes only between citation numbers that touch (the shared CSS would also add one after text).
function markPairs() {
  document.querySelectorAll('.cite').forEach(c => c.classList.toggle('pair', !!c.previousSibling && c.previousSibling.nodeType === 1 && c.previousSibling.classList.contains('cite')));
}
const caption = document.getElementById('stage');
const download = document.getElementById('download');
function showStage(id, keepHash) {
  const s = STAGES[id];
  mv.src = 'models/' + id + '.glb';
  mv.alt = '3D model of a lower jaw with teeth: ' + s.title + '. ' + s.model;
  caption.innerHTML = '<h2>' + s.title + '</h2><p>' + s.text + '</p><p class="small"><b>What this model shows:</b> ' + s.model + '</p>';
  download.href = 'downloads/vivatheca-periodontitis-' + id + '-1.0x.zip';
  download.textContent = 'Download 3D print files: ' + s.title.split(':')[0] + ' (STL, life size)';
  stageButtons.forEach(b => b.setAttribute('aria-pressed', b.dataset.stage === id));
  if (!keepHash) { try { history.replaceState(null, '', '#' + id); } catch (e) { /* ignore */ } }
  lost.disabled = id === 'healthy';
  markPairs();
}
stageButtons.forEach(b => b.addEventListener('click', () => showStage(b.dataset.stage)));
const start = location.hash.slice(1);
showStage(STAGES[start] ? start : 'healthy', !STAGES[start] && start !== '');
if (/^ref-\d+$/.test(start)) { const d = document.querySelector('.refs details'); if (d) d.open = true; const r = document.getElementById(start); if (r) r.scrollIntoView(); }

// Lost bone: the bone a healthy jaw would have here, shown see-through in red.
function applyLost() {
  if (!mv.model) return;
  const on = lost.getAttribute('aria-pressed') === 'true';
  for (const m of mv.model.materials) {
    if (m.name !== 'lost-bone') continue;
    const c = m.pbrMetallicRoughness.baseColorFactor;
    // A fully transparent BLEND material still leaves a faint film, so cut it out with MASK when off.
    m.setAlphaMode(on ? 'BLEND' : 'MASK');
    if (!on) m.setAlphaCutoff(1);
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
  mv.setAttribute('interaction-prompt', 'none');
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
