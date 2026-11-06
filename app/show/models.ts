import { catalogue } from '../models/catalogue';

// Show mode (/show?model=<slug>): one model full screen with simple controls, for showing a
// patient in clinic. Each catalogue model lists the views a clinician switches between (the
// same GLBs its full page uses). Labels are t.show.views[key], or "Age {n}" / "Step {n}".
// hide: materials made invisible on load (overlays the full page only shows on request).
// Models whose viewer needs its own code (the three.js head and neck cases) have no entry
// and open their full page at the viewer instead (quickHref).
export type ShowView = { id: string; glb: string; label: string; age?: string; step?: number; hide?: string[] };
export type ShowSpec = { orbit?: string; target?: string; views: ShowView[] };

const d = '/development/models/';
const ortho = '/orthognathic/models/';
const abgOptions = ['option-implant', 'option-bridge', 'option-denture'];

export const showSpecs: Record<string, ShowSpec> = {
  'impacted-wisdom-tooth': { views: [
    { id: 'impacted', glb: '/models/impacted-molar.glb', label: 'impacted' },
    { id: 'normal', glb: '/models/wisdom-tooth-normal.glb', label: 'normal' },
  ] },
  'dental-development': { orbit: '-90deg 80deg auto', views: ['6.5', '7.5', '8.5', '9.5', '10.5', '11.5', '12.5'].map((age) => ({ id: `age-${age}`, glb: `${d}age-${age.replace('.', '-')}.glb`, label: '', age })) },
  periodontitis: { orbit: '-35deg 75deg auto', views: [
    { id: 'healthy', glb: '/periodontitis/models/healthy.glb', label: 'healthy' },
    ...[1, 2, 3, 4].map((n) => ({ id: `stage-${n}`, glb: `/periodontitis/models/stage-${n}.glb`, label: `stage${n}`, hide: ['lost-bone'] })),
  ] },
  oroantral: { orbit: '0deg 85deg auto', views: [
    ['normal', 'normal'], ['risk', 'risk'], ['oac', 'oac'], ['oaf', 'oaf'], ['clot', 'clot'], ['flap', 'buccalFlap'], ['bfp', 'fatPad'], ['palatal', 'palatalFlap'],
  ].map(([id, label]) => ({ id, glb: `/oroantral/models/${id}.glb`, label })) },
  'cracked-tooth': { orbit: '25deg 65deg auto', views: [
    ['healthy', 'healthy'], ['cracked', 'cracked'], ['composite', 'filling'], ['crown', 'crown'],
  ].map(([id, label]) => ({ id, glb: `/cracked-tooth/models/${id}-whole.glb`, label, hide: ['force', 'hold'] })) },
  endodontic: { orbit: '20deg 70deg auto', views: [
    { id: 'sound', glb: '/endodontic/models/sound-whole.glb', label: 'sound' },
    { id: 'abscess', glb: '/endodontic/models/abscess-whole.glb', label: 'abscess' },
    { id: 'sound-cut', glb: '/endodontic/models/sound-cut.glb', label: 'soundCut' },
    { id: 'abscess-cut', glb: '/endodontic/models/abscess-cut.glb', label: 'abscessCut' },
  ] },
  'stainless-steel-crown': { orbit: '-30deg 68deg 46mm', target: '0mm -1mm 0mm', views: [
    ['healthy', 'healthy'], ['decay', 'decay'], ['filling', 'filling'], ['prepared', 'shaped'], ['crown', 'steelCrown'],
  ].map(([id, label]) => ({ id, glb: `/stainless-steel-crown/models/${id}.glb`, label })) },
  'alveolar-bone-graft': { views: [
    { id: 'before', glb: '/models/abg/abg-1-pre-op.glb', label: 'abgBefore' },
    { id: 'graft', glb: '/models/abg/abg-2-during-braces.glb', label: 'abgGraft' },
    { id: 'later', glb: '/models/abg/abg-3-long-term.glb', label: 'abgLater', hide: abgOptions },
  ] },
  'averaged-jaw': { views: [{ id: 'average', glb: '/models/averaged-jaw/averaged-jaw.glb', label: 'average' }] },
  orthognathic: { orbit: '40deg 88deg 0.19m', target: '0m -0.012m 0.02m', views: [
    ['normal', 'normal'], ['class2-before', 'class2Before'], ['class2-after', 'class2After'], ['class2-after-genio', 'class2Genio'],
    ['class3-before', 'class3Before'], ['class3-after', 'class3After'], ['class3-after-genio', 'class3Genio'],
  ].map(([id, label]) => ({ id, glb: `${ortho}${id}.glb`, label, hide: ['before'] })) },
  fixation: { orbit: '70deg 80deg 0.12m', target: '0m 0m 0m', views: ['1-cut', '2-lined-up', '3-plate', '4-drill', '5-first-screw', '6-all-screws', '7-see-through'].map((id, i) => ({ id, glb: `/fixation/models/${id}.glb`, label: '', step: i + 1 })) },
};

// Where a quick-pick tile goes: the show mode, or the full page's viewer.
export function quickHref(slug: string) {
  if (showSpecs[slug]) return `/show?model=${slug}`;
  const model = catalogue.find((m) => m.slug === slug);
  // The jaw exercises (tmd) are animations on one model, so they open on their own page's viewer (#mv).
  const anchor = slug === 'tmd' ? '#mv' : '#viewer';
  return model ? `${model.href}${anchor}` : '/models';
}
