// Fixation demo viewer: seven steps of placing a miniplate and screws.
const mv = document.getElementById('mv');
const STEPS = {
  '1-cut': ['70deg 80deg 0.12m', 'Left side of a lower jaw, cut between two back teeth. The back piece sits out of place.'],
  '2-lined-up': ['70deg 80deg 0.12m', 'The two pieces of the lower jaw lined up again.'],
  '3-plate': ['70deg 80deg 0.11m', 'A titanium plate with four round holes lies across the cut, bent to the shape of the bone.'],
  '4-drill': ['60deg 80deg 0.12m', 'A drill goes straight into the bone through the plate hole next to the cut.'],
  '5-first-screw': ['70deg 80deg 0.11m', 'The first screw is in the plate, next to the cut.'],
  '6-all-screws': ['70deg 80deg 0.11m', 'All four screws are in, two on each side of the cut.'],
  '7-see-through': ['20deg 60deg 0.11m', 'See-through bone showing four short screws in the outer layer of the jaw.'],
};
const ORDER = Object.keys(STEPS);
const buttons = document.querySelectorAll('[data-stage]');
const captions = document.querySelectorAll('#stage [data-for]');
let cur = 0;
function show(i) {
  cur = Math.max(0, Math.min(ORDER.length - 1, i));
  const k = ORDER[cur], TP = window.vtTPlain || ((_, en) => en);
  mv.src = 'models/' + k + '.glb';
  mv.cameraOrbit = STEPS[k][0];
  mv.cameraTarget = '0m 0m 0m';
  mv.alt = TP('alt' + (cur + 1), STEPS[k][1]);
  buttons.forEach(b => b.setAttribute('aria-pressed', b.dataset.stage === k));
  captions.forEach(c => { c.hidden = c.dataset.for !== k; });
  document.getElementById('prev').disabled = cur === 0;
  document.getElementById('next').disabled = cur === ORDER.length - 1;
}
buttons.forEach(b => b.addEventListener('click', () => show(ORDER.indexOf(b.dataset.stage))));
document.getElementById('prev').addEventListener('click', () => show(cur - 1));
document.getElementById('next').addEventListener('click', () => show(cur + 1));
show(0);
