// Lists the 3D print zips per model for /print (public/print/sets.json).
// Run after adding or changing print zips: node tools/print/build-sets.mjs
import { execFileSync } from 'node:child_process';
import { readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SOURCES = [
  { slug: 'impacted-wisdom-tooth', dir: 'public/models', match: /^vivatheca-wisdom-tooth-(.+)-stl\.zip$/, scale: 1 },
  { slug: 'dental-development', dir: 'public/development/downloads', match: /^vivatheca-dental-development-(.+)-([\d.]+)x\.zip$/ },
  { slug: 'periodontitis', dir: 'public/periodontitis/downloads', match: /^vivatheca-periodontitis-(.+)-([\d.]+)x\.zip$/ },
  { slug: 'oroantral', dir: 'public/oroantral/downloads', match: /^vivatheca-oroantral-(.+)-([\d.]+)x\.zip$/ },
  { slug: 'cracked-tooth', dir: 'public/cracked-tooth/downloads', match: /^vivatheca-cracked-tooth-(.+)-([\d.]+)x\.zip$/ },
  { slug: 'stainless-steel-crown', dir: 'public/stainless-steel-crown/downloads', match: /^vivatheca-stainless-steel-crown-([\d.]+)x\.zip$/, single: true },
  { slug: 'alveolar-bone-graft', dir: 'public/models/abg', match: /^vivatheca-abg-(.+)-stl\.zip$/, scale: 1 },
];
const ORDER = ['normal', 'healthy', 'risk', 'oac', 'oaf', 'clot', 'flap', 'bfp', 'palatal', 'stage-1', 'stage-2', 'stage-3', 'stage-4', 'cracked', 'composite', 'crown', 'impacted'];
const label = (id) => id.replace(/^age-(\d+)-(\d)$/, 'Age $1.$2').replace(/^stage-(\d)$/, 'Stage $1').replace(/^(\d)b?-/, (m) => m.toUpperCase().replace('-', '. ')).replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
// Names for each set, as on the model pages (Japanese with furigana).
const NAMES = {
  normal: ['Normal', '{正常|せいじょう}'], healthy: ['Healthy', '{健康|けんこう}'], impacted: ['Impacted', '{埋伏|まいふく}'],
  risk: ['Roots close to the sinus', '{上顎洞|じょうがくどう}に{近|ちか}い{歯根|しこん}'], oac: ['Opening to the sinus (OAC)', '{上顎洞|じょうがくどう}への{穿孔|せんこう}（OAC）'], oaf: ['Lasting tract (OAF)', '{口腔|こうくう}{上顎洞|じょうがくどう}{瘻|ろう}（OAF）'],
  clot: ['Blood clot', '{血|ち}のかたまり'], flap: ['Cheek-side flap', '{頬側|きょうそく}の{弁|べん}'], bfp: ['Cheek fat pad', '{頬|ほお}の{脂肪|しぼう}'], palatal: ['Palate-side flap', '{口蓋|こうがい}{側|がわ}の{弁|べん}'],
  'stage-1': ['Stage I', 'ステージI'], 'stage-2': ['Stage II', 'ステージII'], 'stage-3': ['Stage III', 'ステージIII'], 'stage-4': ['Stage IV', 'ステージIV'],
  cracked: ['Cracked tooth', 'ひびの{入|はい}った{歯|は}'], composite: ['Filling', '{詰|つ}め{物|もの}'], crown: ['Crown', 'かぶせ{物|もの}'],
  '1-pre-op': ['1. Before surgery', '1. {手術|しゅじゅつ}{前|まえ}'], '2-during-braces': ['2. During braces', '2. {矯正|きょうせい}{中|ちゅう}'], '3-long-term': ['3. Long term', '3. {長期|ちょうき}'], '3b-substitution': ['3B. Canine moved into the gap', '3B. {犬歯|けんし}で{隙間|すきま}を{埋|う}める'],
  all: ['All stages', 'すべての{段階|だんかい}'],
};
const names = (id) => { const a = id.match(/^age-(\d+)-(\d)$/); if (a) return [`Age ${a[1]}.${a[2]}`, `${a[1]}.${a[2]}{歳|さい}`]; return NAMES[id] || [label(id), label(id)]; };
const order = (id) => { const i = ORDER.indexOf(id); return i < 0 ? 50 : i; };

const out = {};
for (const s of SOURCES) {
  if (!existsSync(s.dir)) continue;
  const sets = [];
  for (const f of readdirSync(s.dir).sort()) {
    const m = f.match(s.match);
    if (!m) continue;
    const files = execFileSync('unzip', ['-Z1', join(s.dir, f)]).toString().split('\n').filter((n) => n.endsWith('.stl'));
    const id = s.single ? 'all' : m[1];
    const scale = s.scale ?? Number(s.single ? m[1] : m[2]);
    const [en, ja] = names(id);
    sets.push({ id, label: { en, ja }, zip: '/' + join(s.dir, f).replace(/^public\//, ''), scale, files });
  }
  sets.sort((a, b) => order(a.id) - order(b.id) || a.id.localeCompare(b.id, 'en', { numeric: true }));
  out[s.slug] = sets;
}
writeFileSync('public/print/sets.json', JSON.stringify(out, null, 1) + '\n');
console.log(Object.entries(out).map(([k, v]) => k + ': ' + v.length).join('\n'));
