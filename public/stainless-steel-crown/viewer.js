// Stainless steel crown viewer: stage buttons, preset views, see-through mode,
// language (English / Japanese with furigana) and theme.
const mv = document.getElementById('mv');
const html = document.documentElement;
const LANG = () => (html.lang === 'ja' || html.lang === 'vi' ? html.lang : 'en');
const VI_PAGE = window.VT_VI_PAGE || {}; // Vietnamese from vi.js (unreviewed AI draft)
// {漢字|かな} -> furigana
const ruby = s => s.replace(/\{([^{}|]+)\|([^{}|]+)\}/g,
  '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');
const plain = s => s.replace(/\{([^{}|]+)\|([^{}|]+)\}/g, '$1');
const cite = (...n) => n.map(i => '<sup class="cite"><a href="#ref-' + i + '">' + i + '</a></sup>').join('');

const LEGEND = {
  tooth: { en: 'Baby tooth', ja: '{乳歯|にゅうし}' },
  decay: { en: 'Decay', ja: 'むし{歯|ば}' },
  filling: { en: 'Filling', ja: '{詰|つ}め{物|もの}' },
  steel: { en: 'Steel crown', ja: '{金属|きんぞく}のかぶせ{物|もの}' },
  cement: { en: 'Cement (glue)', ja: 'セメント（{接着材|せっちゃくざい}）' },
  gum: { en: 'Gum', ja: '{歯|は}ぐき' },
  bone: { en: 'Bone', ja: '{骨|ほね}' },
  pulp: { en: 'Nerve', ja: '{神経|しんけい}' },
};
const STAGES = {
  healthy: {
    legend: ['tooth', 'gum', 'bone', 'pulp'],
    en: {
      title: 'Healthy baby back tooth',
      alt: 'a healthy baby back tooth',
      text: 'A healthy back tooth in a child\'s lower jaw. This is a baby tooth. Under it, the adult tooth that will take its place is growing in the bone. Tap <b>See-through</b> to see it, and the nerve inside the tooth (red).',
    },
    ja: {
      title: '{健康|けんこう}な{乳歯|にゅうし}の{奥歯|おくば}',
      alt: '{健康|けんこう}な{乳歯|にゅうし}の{奥歯|おくば}',
      text: '{子|こ}どもの{下|した}の{奥歯|おくば}で、{乳歯|にゅうし}です。その{下|した}の{骨|ほね}の{中|なか}で、つぎに{生|は}えてくる{大人|おとな}の{歯|は}が{育|そだ}っています。「{透|す}かして{見|み}る」を{押|お}すと、その{歯|は}と、{歯|は}の{中|なか}の{神経|しんけい}（{赤|あか}）が{見|み}えます。',
    },
  },
  decay: {
    legend: ['tooth', 'decay', 'gum', 'bone', 'pulp'],
    en: {
      title: 'Large holes from decay',
      alt: 'a baby back tooth with large holes from decay on the top and both sides',
      text: 'Decay (dark brown) has made holes in the top of the tooth. It has also made holes in both sides that touch the next teeth. For a child who is likely to get more decay, dentists advise a crown when holes are this large.' + cite(1),
    },
    ja: {
      title: 'むし{歯|ば}の{大|おお}きな{穴|あな}',
      alt: '{上|うえ}と{両側|りょうがわ}に{大|おお}きなむし{歯|ば}の{穴|あな}がある{乳歯|にゅうし}の{奥歯|おくば}',
      text: 'むし{歯|ば}（こげ{茶色|ちゃいろ}）で、{歯|は}の{上|うえ}と、{隣|となり}の{歯|は}にふれる{両側|りょうがわ}に{穴|あな}があいています。むし{歯|ば}になりやすい{子|こ}どもで{穴|あな}がここまで{大|おお}きいときは、かぶせ{物|もの}がすすめられています。' + cite(1),
    },
  },
  filling: {
    legend: ['tooth', 'filling', 'gum', 'bone', 'pulp'],
    en: {
      title: 'Large filling',
      alt: 'a baby back tooth with a large filling across the top and both sides',
      text: 'The same holes filled with a filling (purple in this model). The filling only replaces the lost part, and the walls of tooth left around it are thin. Large fillings in baby back teeth fail more often than crowns.' + cite(2, 6),
    },
    ja: {
      title: '{大|おお}きな{詰|つ}め{物|もの}',
      alt: '{上|うえ}と{両側|りょうがわ}に{大|おお}きな{詰|つ}め{物|もの}をした{乳歯|にゅうし}の{奥歯|おくば}',
      text: '{同|おな}じ{穴|あな}を{詰|つ}め{物|もの}（このモデルでは{紫|むらさき}）でふさいでいます。{詰|つ}め{物|もの}はなくなった{部分|ぶぶん}だけを{補|おぎな}うので、まわりの{歯|は}の{壁|かべ}はうすいままです。{乳歯|にゅうし}の{奥歯|おくば}の{大|おお}きな{詰|つ}め{物|もの}は、かぶせ{物|もの}より{失敗|しっぱい}が{多|おお}いとされています。' + cite(2, 6),
    },
  },
  prepared: {
    legend: ['tooth', 'filling', 'gum', 'bone', 'pulp'],
    en: {
      title: 'Shaped for a crown',
      alt: 'a baby back tooth with the decay taken out and the top and sides trimmed for a crown',
      text: 'The usual way: the dentist numbs the tooth and takes out the decay. Then they trim a little off the top and the two sides that touch the next teeth. This lets the crown fit.' + cite(2) + ' Filling material (purple) fills where the decay was.',
    },
    ja: {
      title: 'かぶせる{前|まえ}に{形|かたち}を{整|ととの}える',
      alt: 'むし{歯|ば}を{取|と}り、{上|うえ}と{両側|りょうがわ}を{少|すこ}し{削|けず}った{乳歯|にゅうし}の{奥歯|おくば}',
      text: 'ふつうの{方法|ほうほう}です。{麻酔|ますい}をして、むし{歯|ば}を{取|と}ります。かぶせ{物|もの}が{入|はい}るように、{歯|は}の{上|うえ}と、{隣|となり}の{歯|は}にふれる{両側|りょうがわ}を{少|すこ}し{削|けず}ります。' + cite(2) + 'むし{歯|ば}があったところは{詰|つ}め{物|もの}（{紫|むらさき}）で{埋|う}めています。',
    },
  },
  crown: {
    legend: ['steel', 'cement', 'tooth', 'filling', 'gum', 'bone', 'pulp'],
    en: {
      title: 'Steel crown',
      alt: 'a baby back tooth covered by a steel crown that ends just under the gum',
      text: 'The dentist glues a ready-made steel cap over the whole tooth. Its edge hugs the tooth just under the gum. It covers every side, so there are no edges where new decay can start.' + cite(1) + ' Tap <b>See-through</b> to see the tooth and glue inside.',
    },
    ja: {
      title: '{金属|きんぞく}のかぶせ{物|もの}',
      alt: '{歯|は}ぐきのすぐ{下|した}までおおう{金属|きんぞく}のかぶせ{物|もの}をした{乳歯|にゅうし}の{奥歯|おくば}',
      text: '{既製|きせい}の{金属|きんぞく}のキャップを{歯|は}{全体|ぜんたい}にかぶせてつけます。ふちは{歯|は}ぐきのすぐ{下|した}で{歯|は}にぴったり{合|あ}わせます。すべての{面|めん}をおおうので、むし{歯|ば}が{新|あたら}しくできやすいすき{間|ま}が{残|のこ}りません。' + cite(1) + '「{透|す}かして{見|み}る」を{押|お}すと、{中|なか}の{歯|は}とセメントが{見|み}えます。',
    },
  },
};

const VI_X = VI_PAGE.extra || {};
for (const k in STAGES) STAGES[k].vi = (VI_PAGE.states || {})[k] || STAGES[k].en;
for (const k in LEGEND) LEGEND[k].vi = (VI_X.legend || {})[k] || LEGEND[k].en;

const stageButtons = document.querySelectorAll('[data-stage]');
const caption = document.getElementById('stage');
const legend = document.getElementById('legend');
const xray = document.getElementById('xray');
const viewButtons = document.querySelectorAll('[data-orbit]');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (still) mv.setAttribute('interaction-prompt', 'none');
let stage = 'healthy';

// Text and legend only (no model change), so a language switch does not reload the model.
function render() {
  const s = STATES_TEXT();
  mv.setAttribute('alt', plain(s.altText));
  caption.innerHTML = '<h2>' + ruby(s.title) + '</h2><p>' + ruby(s.text) + '</p>';
  legend.innerHTML = STAGES[stage].legend.map(k => '<li><span class="dot ' + k + '"></span>' + ruby(LEGEND[k][LANG()]) + '</li>').join('');
  stageButtons.forEach(b => b.setAttribute('aria-pressed', b.dataset.stage === stage));
}
function STATES_TEXT() {
  const s = STAGES[stage][LANG()];
  const altText = LANG() === 'vi' && VI_X.altPrefix ? VI_X.altPrefix + s.alt + VI_X.altSuffix
    : LANG() === 'ja'
    ? s.alt + 'の3Dモデル。{歯|は}ぐきと{骨|ほね}のブロックの{中|なか}にあり、{下|した}で{大人|おとな}の{歯|は}が{育|そだ}っています。'
    : '3D model of ' + s.alt + ', in a block of gum and bone, with the adult tooth growing under it.';
  return { ...s, altText };
}
function show() {
  mv.setAttribute('src', 'models/' + stage + '.glb');
  render();
  try { history.replaceState(null, '', '#' + stage); } catch { /* ignore */ }
}
stageButtons.forEach(b => b.addEventListener('click', () => { stage = b.dataset.stage; show(); }));

// See-through: outer layers become faint so the nerve, the shaped tooth and the adult tooth show.
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
viewButtons.forEach(b => b.addEventListener('click', () => {
  mv.cameraOrbit = b.dataset.orbit;
  mv.cameraTarget = '0mm -1mm 0mm';
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

// Light/dark toggle, remembered site-wide (localStorage 'vivatheca-theme'). The label names the mode it switches to.
const THEME = { en: { dark: 'Dark mode', light: 'Light mode' }, ja: { dark: 'ダークモード', light: 'ライトモード' }, vi: { dark: 'Chế độ tối', light: 'Chế độ sáng' } };
const themeBtn = document.getElementById('theme');
const isDark = () => html.dataset.theme === 'dark';
const showTheme = () => { themeBtn.textContent = THEME[LANG()][isDark() ? 'light' : 'dark']; };
themeBtn.addEventListener('click', () => {
  const t = isDark() ? 'light' : 'dark';
  html.dataset.theme = t;
  try { localStorage.setItem('vivatheca-theme', t); } catch { /* ignore */ }
  showTheme();
});

// Language switcher: same cookies as the rest of the site ('vivatheca-lang', 'vivatheca-furigana').
const YEAR = 60 * 60 * 24 * 365;
const setCookie = (n, v) => { document.cookie = n + '=' + v + '; path=/; max-age=' + YEAR + '; samesite=lax'; };
const langs = document.getElementById('langs');
function buildLangs() {
  const l = LANG();
  langs.replaceChildren();
  langs.setAttribute('aria-label', { ja: '言語', vi: 'Ngôn ngữ' }[l] || 'Language');
  [['en', 'English'], ['ja', '日本語'], ['vi', 'Tiếng Việt']].forEach(([code, name]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.lang = code; b.textContent = name;
    b.setAttribute('aria-pressed', String(code === l));
    b.addEventListener('click', () => {
      if (code === LANG()) return;
      setCookie('vivatheca-lang', code);
      // Vietnamese replaces the English in the page, so switching to or from it reloads.
      if (code === 'vi' || LANG() === 'vi') { location.reload(); return; }
      html.lang = code;
      buildLangs(); showTheme(); render();
    });
    langs.append(b);
  });
  if (l === 'ja') {
    const f = document.createElement('button');
    f.type = 'button'; f.textContent = 'ふりがな';
    f.setAttribute('aria-pressed', String(html.dataset.furigana !== 'off'));
    f.addEventListener('click', () => {
      const turnOn = html.dataset.furigana === 'off';
      html.dataset.furigana = turnOn ? 'on' : 'off'; setCookie('vivatheca-furigana', turnOn ? 'on' : 'off');
      f.setAttribute('aria-pressed', String(turnOn));
    });
    langs.append(f);
  }
}

// Show a plain message in the viewer box if 3D cannot be shown, instead of an empty box.
function showProblem(text) {
  let box = mv.querySelector('.problem');
  if (!box) { box = document.createElement('div'); box.className = 'problem'; mv.appendChild(box); }
  box.textContent = text;
}
const canvas = document.createElement('canvas');
if (!(canvas.getContext('webgl2') || canvas.getContext('webgl'))) showProblem(LANG() === 'vi' ? 'Trình duyệt này không hiển thị được 3D (WebGL đang tắt). Hãy bật tăng tốc phần cứng trong cài đặt trình duyệt, hoặc mở trang bằng trình duyệt khác.' : 'This browser cannot show 3D (WebGL is off). Turn on hardware acceleration in the browser settings, or open the page in another browser.');
mv.addEventListener('error', () => showProblem(LANG() === 'vi' ? 'Không tải được mô hình 3D. Vui lòng tải lại trang.' : 'The 3D model could not load. Please reload the page.'));
setTimeout(() => { if (!customElements.get('model-viewer')) showProblem(LANG() === 'vi' ? 'Không tải được mô hình 3D. Vui lòng tải lại trang.' : 'The 3D model could not load. Please reload the page.'); }, 10000);

// A tap on a source number opens the closed list of sources first.
document.addEventListener('click', e => {
  if (!e.target.closest('.cite a')) return;
  const d = document.querySelector('.refs details');
  if (d) d.open = true;
});

const start = location.hash.slice(1);
if (STAGES[start]) stage = start;
buildLangs();
showTheme();
show();
