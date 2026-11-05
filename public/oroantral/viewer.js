// Stage buttons, labels, preset views, see-through bone, language and theme for the OAC / OAF model.
const mv = document.getElementById('mv');
const html = document.documentElement;
// {漢字|かな} -> furigana
const ruby = s => s.replace(/\{([^{}|]+)\|([^{}|]+)\}/g,
  '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');
// Each group of source numbers is wrapped, so separate groups in one text are not joined by a comma.
const cite = (...n) => '<span>' + n.map(i => '<sup class="cite"><a href="#ref-' + i + '">' + i + '</a></sup>').join('') + '</span>';

// Label anchor points (glTF metres), from tools/oroantral/build.py (labels.json).
const P = {
  sinus: '0.0016 0.0021 0.0043', rootN: '0.0025 -0.0108 0.0114', floorN: '0.0025 -0.0068 0.0110',
  opening: '0.0045 -0.0116 0.0105', socket: '0.0025 -0.0204 0.0113', flap: '0.0029 -0.0249 0.0098',
  flapB: '-0.0079 -0.0181 0.0089', fat: '-0.0147 -0.0076 -0.0034', fatC: '0.0026 -0.0248 0.0099',
  tract: '0.0005 -0.0194 0.0113', lining: '-0.0082 -0.0040 0.0084', gum: '-0.0082 -0.0175 0.0084',
};

const STAGES = {
  normal: {
    parts: ['bone', 'teeth', 'gum', 'sinus'],
    en: ['Normal (for comparison)', 'This is a healthy upper jaw. The roots of the big upper back tooth (first molar) sit in bone. A layer of bone lies between the root tips and the <b>sinus</b> (an air space above the teeth). Here the layer is 3 mm. In real people it can be a few mm thick, or not there at all.' + cite(6, 8)],
    ja: ['{正常|せいじょう}（{比較用|ひかくよう}）', '{健康|けんこう}な{上|うわ}あごです。{第一大臼歯|だいいちだいきゅうし}の{根|ね}は{骨|ほね}の{中|なか}にあり、{根|ね}の{先|さき}と<b>{上顎洞|じょうがくどう}</b>の{間|あいだ}には{骨|ほね}（ここでは3 mm）があります。{実際|じっさい}の{厚|あつ}さは{人|ひと}によって{数|すう}mmから0までさまざまです。' + cite(6, 8)],
    labels: [['sinus', 'up', 'Sinus (air space)', '{上顎洞|じょうがくどう}'], ['floorN', 'right', 'Bone layer', '{骨|ほね}の{層|そう}'], ['rootN', 'left', 'Root tip', '{根|ね}の{先|さき}'], ['gum', 'left', 'Gum', '{歯|は}ぐき']],
  },
  risk: {
    parts: ['bone', 'teeth', 'gum', 'sinus'],
    en: ['At risk: roots reaching into the sinus', 'Here the floor of the sinus dips down between the roots. The root tips poke about 4 mm up into the sinus. Only a thin shell of bone and the sinus lining cover them. This is common over the upper back teeth.' + cite(7, 8) + ' If the dentist takes out such a tooth, the thin bone can come away with it.' + cite(1)],
    ja: ['{要注意|ようちゅうい}：{根|ね}が{上顎洞|じょうがくどう}に{入|はい}りこんでいる', '{上顎洞|じょうがくどう}の{底|そこ}が{根|ね}の{間|あいだ}まで{下|さ}がり、{根|ね}の{先|さき}が{洞|どう}の{中|なか}に{約|やく}4 mm{入|はい}っています。{根|ね}をおおうのは{薄|うす}い{骨|ほね}と{洞|どう}の{粘膜|ねんまく}だけです。{上|うえ}の{大臼歯|だいきゅうし}ではよく{見|み}られます。' + cite(7, 8) + 'このような{歯|は}を{抜|ぬ}くと、{薄|うす}い{骨|ほね}も{一緒|いっしょ}に{取|と}れることがあります。' + cite(1)],
    labels: [['sinus', 'up', 'Sinus', '{上顎洞|じょうがくどう}'], ['rootN', 'left', 'Roots in sinus', '{洞内|どうない}の{根|ね}']],
  },
  oac: {
    parts: ['bone', 'teeth', 'gum', 'sinus'],
    en: ['A new hole into the sinus (OAC)', 'The dentist has taken out the big back tooth (first molar). The thin bone over its roots came away too. Now the empty socket opens straight into the sinus. This new, raw hole is an <b>OAC</b> (a hole between the mouth and the sinus). Germs from the mouth can get into the sinus through it. So it is best to close it soon, within 24 to 48 hours.' + cite(1)],
    ja: ['{上顎洞|じょうがくどう}への{新|あたら}しい{穴|あな}（OAC）', '{第一大臼歯|だいいちだいきゅうし}を{抜|ぬ}きました。{根|ね}の{上|うえ}の{薄|うす}い{骨|ほね}も{取|と}れたため、{抜|ぬ}いたあとの{穴|あな}が{上顎洞|じょうがくどう}に{直接|ちょくせつ}つながっています。この{新|あたら}しい{傷|きず}の{穴|あな}が<b>OAC</b>です。{口|くち}の{細菌|さいきん}が{洞|どう}に{入|はい}るのを{防|ふせ}ぐため、なるべく{早|はや}く（24〜48{時間|じかん}{以内|いない}）{閉|と}じるのがよいとされます。' + cite(1)],
    labels: [['opening', 'up', 'Opening to sinus', '{洞|どう}への{穴|あな}'], ['socket', 'left', 'Empty socket', '{歯|は}を{抜|ぬ}いた{穴|あな}']],
  },
  oaf: {
    parts: ['bone', 'teeth', 'gum', 'sinus', 'tract', 'lining'],
    en: ['A lasting, lined tunnel (OAF)', 'In this stage, nobody closed the hole. Weeks later, the socket has filled in around a narrow tunnel. Skin-like lining (epithelium) now covers the inside of the tunnel (dark red). This lined tunnel is an <b>OAF</b>. It will not close by itself. The sinus is often infected, and its lining swells (orange). To fix it, the surgeon treats the infection and cuts out the lined tunnel. Then they close the hole with a flap.' + cite(1)],
    ja: ['{長|なが}く{続|つづ}くトンネル（OAF）', '{数週間後|すうしゅうかんご}、{穴|あな}は{閉|と}じられないままでした。{歯|は}を{抜|ぬ}いた{穴|あな}は{細|ほそ}いトンネルを{残|のこ}して{埋|う}まり、トンネルの{内側|うちがわ}は{皮膚|ひふ}のような{上皮|じょうひ}（{暗|くら}い{赤|あか}）でおおわれています。これが<b>OAF</b>で、{自然|しぜん}には{閉|と}じません。{上顎洞|じょうがくどう}は{感染|かんせん}し、{粘膜|ねんまく}が{腫|は}れていることが{多|おお}い（オレンジ）。{治療|ちりょう}では{感染|かんせん}を{治|なお}し、{上皮|じょうひ}のトンネルを{切|き}り{取|と}ってから{弁|べん}で{閉|と}じます。' + cite(1)],
    labels: [['tract', 'right', 'Lined tunnel', 'トンネル'], ['lining', 'up', 'Swollen lining', '{腫|は}れた{粘膜|ねんまく}']],
  },
  clot: {
    parts: ['bone', 'teeth', 'gum', 'sinus', 'clot'],
    en: ['Small hole: a blood clot seals it', 'A small hole may heal by itself. This works best if it is under about 2 mm, with no infection and no lining. A blood clot fills the socket and seals the hole. The dentist may protect the clot with a dressing and stitches. Holes over 5 mm, or open for over 3 weeks, rarely heal on their own.' + cite(1, 2) + ' (The model uses the same socket in every stage, so you can compare them.)'],
    ja: ['{小|ちい}さい{穴|あな}：{血餅|けっぺい}がふさぐ', '{小|ちい}さく（{約|やく}2 mm{未満|みまん}）、{感染|かんせん}も{上皮|じょうひ}もない{穴|あな}は、{血|ち}のかたまり（{血餅|けっぺい}）が{穴|あな}を{満|み}たすと{自然|しぜん}に{治|なお}ることがあります。{歯科医師|しかいし}は{血餅|けっぺい}を{守|まも}るために{材料|ざいりょう}を{入|い}れたり{縫|ぬ}ったりします。5 mmを{超|こ}える{穴|あな}や3{週間|しゅうかん}{以上|いじょう}{続|つづ}く{穴|あな}は、{自然|しぜん}にはほとんど{治|なお}りません。' + cite(1, 2) + '（{比較|ひかく}しやすいよう、どの{段階|だんかい}も{同|おな}じ{穴|あな}で{示|しめ}しています。）'],
    labels: [['socket', 'left', 'Blood clot', '{血餅|けっぺい}']],
  },
  flap: {
    parts: ['bone', 'teeth', 'gum', 'sinus', 'clot', 'flap'],
    en: ['Repair: cheek-side gum flap (buccal advancement flap)', 'The surgeon frees the gum on the cheek side. They stretch it over the socket and stitch it to the gum on the palate side. The stitches should sit on firm bone, with no pulling. Surgeons often use this flap for small and medium holes. The downside: the groove between cheek and gum gets shallower. This can make a denture harder to wear later.' + cite(1, 9)],
    ja: ['{閉鎖|へいさ}：ほお{側|がわ}の{歯|は}ぐきの{弁|べん}（ほお{側|がわ}{前進弁|ぜんしんべん}）', 'ほお{側|がわ}の{歯|は}ぐきをはがして{穴|あな}の{上|うえ}まで{伸|の}ばし、{口蓋側|こうがいそく}の{歯|は}ぐきに{縫|ぬ}いつけます。{縫|ぬ}い{目|め}は、ひっぱられずにしっかりした{骨|ほね}の{上|うえ}に{来|く}るようにします。{簡単|かんたん}で、{小|ちい}さい〜{中|ちゅう}くらいの{穴|あな}によく{使|つか}われます。{欠点|けってん}はほおと{歯|は}ぐきの{間|あいだ}の{溝|みぞ}が{浅|あさ}くなり、{将来|しょうらい}{入|い}れ{歯|ば}が{合|あ}いにくくなることです。' + cite(1, 9)],
    labels: [['flap', 'right', 'Flap', '{弁|べん}'], ['flapB', 'left', 'From cheek', 'ほお{側|がわ}から']],
  },
  bfp: {
    parts: ['bone', 'teeth', 'gum', 'sinus', 'clot', 'fat'],
    en: ['Repair: cheek fat pad flap (buccal fat pad)', 'There is a pad of fat (the buccal fat pad) in the cheek, behind the upper jaw. The surgeon gently draws it forward. It stays joined to its blood supply. They spread it over the socket and stitch it to the gum on the palate side. It suits holes at the back of the mouth. Surgeons can also add a cheek flap on top.' + cite(1, 5) + ' A review of 9 trials compared the main repairs. Holes closed more often with the fat pad than with the cheek flap or a palate flap. They also came back less often.' + cite(4)],
    ja: ['{閉鎖|へいさ}：ほおの{脂肪|しぼう}のかたまりでふさぐ', 'ほおの{奥|おく}、{上|うわ}あごの{後|うし}ろにある{脂肪|しぼう}のかたまりを、{血流|けつりゅう}をつけたまま{前|まえ}に{引|ひ}き{出|だ}し、{穴|あな}の{上|うえ}に{広|ひろ}げて{口蓋|こうがい}の{歯|は}ぐきに{縫|ぬ}いつけます。{奥|おく}の{方|ほう}の{穴|あな}に{向|む}いており、ほお{側|がわ}の{弁|べん}と{組|く}み{合|あ}わせることもあります。' + cite(1, 5) + 'ランダム{化|か}{試験|しけん}9{件|けん}のネットワークメタアナリシスでは、ほおの{脂肪|しぼう}のかたまりはほお{側|がわ}の{弁|べん}や{口蓋弁|こうがいべん}より{確実|かくじつ}に{閉|と}じ、{再発|さいはつ}が{少|すく}なかったと{報告|ほうこく}されています。' + cite(4)],
    labels: [['fat', 'up', 'Fat pad stalk', 'ほおの{脂肪|しぼう}のかたまり'], ['fatC', 'right', 'Fat pad', '{脂肪|しぼう}']],
  },
};
const LANG = () => (html.lang === 'ja' ? 'ja' : 'en');
let current = 'normal';

mv.addEventListener('progress', e => {
  const bar = mv.querySelector('.progress');
  bar.classList.remove('done');
  bar.querySelector('.progress-fill').style.width = (e.detail.totalProgress * 100) + '%';
  if (e.detail.totalProgress === 1) bar.classList.add('done');
});

const stageButtons = document.querySelectorAll('[data-stage]');
const caption = document.getElementById('stage');
const legend = document.querySelectorAll('#legend li');
function render() {
  const s = STAGES[current], l = LANG();
  const [title, text] = s[l];
  caption.innerHTML = '<h2>' + ruby(title) + '</h2><p>' + ruby(text) + '</p>';
  mv.alt = (l === 'ja' ? '3Dモデル：' : '3D model: ') + title.replace(/\{([^{}|]+)\|[^{}|]+\}/g, '$1') +
    (l === 'ja' ? '。右の上顎を第一大臼歯の中央で切った断面。' : '. Right upper jaw cut through the first molar.');
  mv.querySelectorAll('.hotspot').forEach(h => h.remove());
  s.labels.forEach(([key, side, en, ja], i) => {
    const b = document.createElement('div');
    b.className = 'hotspot'; b.slot = 'hotspot-' + i; b.dataset.position = P[key]; b.dataset.side = side;
    b.dataset.normal = key === 'fat' ? '-1 0 0' : '0 0 1'; b.dataset.visibilityAttribute = 'visible';
    b.setAttribute('aria-hidden', 'true');
    b.innerHTML = '<span class="label">' + (l === 'ja' ? ruby(ja) : en) + '</span>';
    mv.appendChild(b);
  });
  legend.forEach(li => { li.hidden = !s.parts.includes(li.dataset.k); });
}
function showStage(k) {
  current = k;
  mv.src = 'models/' + k + '.glb';
  stageButtons.forEach(b => b.setAttribute('aria-pressed', b.dataset.stage === k));
  render();
  try { history.replaceState(null, '', '#' + k); } catch (e) {}
}
stageButtons.forEach(b => b.addEventListener('click', () => showStage(b.dataset.stage)));

// Labels on/off.
const labelsBtn = document.getElementById('labels');
labelsBtn.addEventListener('click', () => {
  const on = labelsBtn.getAttribute('aria-pressed') !== 'true';
  labelsBtn.setAttribute('aria-pressed', on);
  mv.classList.toggle('labels-off', !on);
});

// See-through bone and gum.
const xray = document.getElementById('xray');
function applyBone() {
  if (!mv.model) return;
  const on = xray.getAttribute('aria-pressed') === 'true';
  for (const m of mv.model.materials) {
    if (m.name !== 'bone' && m.name !== 'gum') continue;
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

// Light/dark toggle (light by default; choice shared site-wide in localStorage 'vivatheca-theme').
const themeBtn = document.getElementById('theme');
const isDark = () => html.dataset.theme === 'dark';
const THEME = { en: { dark: 'Dark mode', light: 'Light mode' }, ja: { dark: 'ダークモード', light: 'ライトモード' } };
const showTheme = () => { themeBtn.textContent = THEME[LANG()][isDark() ? 'light' : 'dark']; };
themeBtn.addEventListener('click', () => {
  const t = isDark() ? 'light' : 'dark';
  html.dataset.theme = t;
  try { localStorage.setItem('vivatheca-theme', t); } catch (e) {}
  showTheme();
});

// Language switcher: same cookies as the rest of the site ('vivatheca-lang', 'vivatheca-furigana').
const YEAR = 60 * 60 * 24 * 365;
const setCookie = (n, v) => { document.cookie = n + '=' + v + '; path=/; max-age=' + YEAR + '; samesite=lax'; };
const langs = document.getElementById('langs');
function buildLangs() {
  const l = LANG();
  langs.replaceChildren();
  langs.setAttribute('aria-label', l === 'ja' ? '言語' : 'Language');
  [['en', 'English'], ['ja', '日本語']].forEach(([code, name]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.lang = code; b.textContent = name;
    b.setAttribute('aria-pressed', String(code === l));
    b.addEventListener('click', () => {
      if (code === LANG()) return;
      setCookie('vivatheca-lang', code); html.lang = code;
      buildLangs(); showTheme(); render();
    });
    langs.append(b);
  });
  if (l === 'ja') {
    const f = document.createElement('button');
    f.type = 'button'; f.textContent = 'ふりがな';
    f.setAttribute('aria-pressed', String(html.dataset.furigana !== 'off'));
    f.addEventListener('click', () => {
      const on = html.dataset.furigana === 'off';
      html.dataset.furigana = on ? 'on' : 'off'; setCookie('vivatheca-furigana', on ? 'on' : 'off');
      f.setAttribute('aria-pressed', String(on));
    });
    langs.append(f);
  }
}
buildLangs();

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
document.addEventListener('click', e => {
  if (!e.target.closest('.cite a')) return;
  const d = document.querySelector('.refs details');
  if (d) d.open = true;
});

const start = location.hash.slice(1);
showTheme();
showStage(STAGES[start] ? start : 'normal');
