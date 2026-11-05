// Cracked tooth viewer: tooth state, bite animation, cut in half, see-through crown, preset views,
// language (English / Japanese with furigana) and theme.
const mv = document.getElementById('mv');
const html = document.documentElement;
const LANG = () => (html.lang === 'ja' ? 'ja' : 'en');
// {漢字|かな} -> furigana
const ruby = s => s.replace(/\{([^{}|]+)\|([^{}|]+)\}/g,
  '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');
const plain = s => s.replace(/\{([^{}|]+)\|([^{}|]+)\}/g, '$1');

const STATES = {
  healthy: {
    en: {
      title: 'Healthy tooth',
      alt: '3D model of a healthy lower back tooth (first molar) with two roots.',
      text: 'A healthy back tooth from the lower jaw (first molar). Ridges at the front and back join the cusps. When you bite, the whole tooth takes the force together. Compare the other models with this one.',
      bite: 'When you bite, the tooth takes the force as one piece. Nothing opens.',
    },
    ja: {
      title: '{健康|けんこう}な{歯|は}',
      alt: '{健康|けんこう}な{下|した}の{奥歯|おくば}（{第一大臼歯|だいいちだいきゅうし}）の3Dモデル。',
      text: '{健康|けんこう}な{下|した}の{奥歯|おくば}（{第一大臼歯|だいいちだいきゅうし}）です。{前後|ぜんご}の{辺縁隆線|へんえんりゅうせん}がこうとうどうしをつないでいます。かむと、{歯|は}{全体|ぜんたい}でいっしょに{力|ちから}を{受|う}けます。ほかのモデルと{比|くら}べてください。',
      bite: 'かんでも、{歯|は}は1つのかたまりとして{力|ちから}を{受|う}け、どこも{開|ひら}きません。',
    },
  },
  cracked: {
    en: {
      title: 'Cracked tooth, not treated',
      alt: '3D model of a lower back tooth with a dark crack running from front to back across the biting surface and down the sides of the crown.',
      text: 'A crack runs from front to back across the top of the tooth. It goes through both edge ridges and down into the tooth. It stops above the gum and does not reach the pulp (nerve).',
      bite: 'When you bite, the two halves of the tooth bend apart and the crack opens. We made this much bigger so you can see it. Each bite can make the crack grow.',
    },
    ja: {
      title: 'ひびの{入|はい}った{歯|は}（{治療|ちりょう}なし）',
      alt: 'かむ{面|めん}を{前|まえ}から{後|うし}ろへ{横切|よこぎ}り、{歯冠|しかん}の{側面|そくめん}まで{続|つづ}く{黒|くろ}いひびのある{下|した}の{奥歯|おくば}の3Dモデル。',
      text: 'ひびが{歯|は}の{上|うえ}を{前|まえ}から{後|うし}ろへ{横切|よこぎ}り、{両方|りょうほう}の{辺縁隆線|へんえんりゅうせん}を{通|とお}って{歯|は}の{中|なか}へ{入|はい}っています。ひびは{歯|は}ぐきより{上|うえ}で{止|と}まり、{歯髄|しずい}（{神経|しんけい}）には{届|とど}いていません。',
      bite: 'かむと{歯|は}の{左右|さゆう}の{半分|はんぶん}が{外|そと}へたわみ、ひびが{開|ひら}きます（{見|み}やすいように{大|おお}きく{誇張|こちょう}しています）。かむたびにひびが{広|ひろ}がることがあります。',
    },
  },
  composite: {
    en: {
      title: 'Cracked tooth with a filling',
      alt: '3D model of the cracked tooth with a blue filling across the biting surface and through both edge ridges. The crack continues under the filling.',
      text: 'The dentist took away the top of the crack. Then they put in a tooth-coloured filling (shown blue) across the tooth. The filling sits inside the tooth. The rest of the crack is still under the filling.',
      bite: 'The filling does not hold the cusps together. When you bite, the cusps can still bend apart. The crack under the filling opens. We made this much bigger so you can see it.',
    },
    ja: {
      title: '{詰|つ}め{物|もの}をした{亀裂歯|きれつし}',
      alt: 'かむ{面|めん}を{横切|よこぎ}り{両方|りょうほう}の{辺縁隆線|へんえんりゅうせん}を{通|とお}る{青|あお}い{詰|つ}め{物|もの}のある{亀裂歯|きれつし}の3Dモデル。ひびは{詰|つ}め{物|もの}の{下|した}に{続|つづ}いています。',
      text: '{歯科医師|しかいし}がひびの{上|うえ}の{部分|ぶぶん}を{削|けず}り、{歯|は}を{横切|よこぎ}るように{歯|は}の{色|いろ}のコンポジットレジン（{青|あお}で{表示|ひょうじ}）を{詰|つ}めました。{詰|つ}め{物|もの}は{歯|は}の{内側|うちがわ}に{入|はい}っています。{残|のこ}りのひびは{詰|つ}め{物|もの}の{下|した}にあります。',
      bite: '{詰|つ}め{物|もの}はこうとうどうしを{支|ささ}えません。かむとこうとうは{外|そと}へたわみ、{詰|つ}め{物|もの}の{下|した}のひびが{開|ひら}きます（{大|おお}きく{誇張|こちょう}しています）。',
    },
  },
  crown: {
    en: {
      title: 'Cracked tooth with a crown',
      alt: '3D model of the cracked tooth covered by a grey crown that wraps over all the cusps down to just above the gum line.',
      text: 'The dentist shaped the tooth and covered it with a crown (shown grey). The crown wraps over all the cusps. The crack is still inside the tooth, under the crown. Tap <b>See-through crown</b> to see it.',
      bite: 'The crown wraps around the cusps and holds them together (blue-green arrows). So the crack cannot open when you bite.',
    },
    ja: {
      title: 'クラウンをかぶせた{亀裂歯|きれつし}',
      alt: '{歯|は}ぐきのすぐ{上|うえ}まですべてのこうとうをおおう{灰色|はいいろ}のクラウンをかぶせた{亀裂歯|きれつし}の3Dモデル。',
      text: '{歯科医師|しかいし}が{歯|は}の{形|かたち}を{整|ととの}え、クラウン（{灰色|はいいろ}で{表示|ひょうじ}）をかぶせました。クラウンはすべてのこうとうをおおっています。ひびはクラウンの{下|した}の{歯|は}の{中|なか}に{残|のこ}っています。<b>クラウンを{透|す}かす</b>で{見|み}られます。',
      bite: 'クラウンがこうとうを{包|つつ}んで{支|ささ}えるので（{青緑|あおみどり}の{矢印|やじるし}）、かんでもひびは{開|ひら}きません。',
    },
  },
};
const CUT_ALT = {
  en: 'The tooth is cut in half from cheek to tongue to show the enamel, dentine and pulp inside.',
  ja: '{頬側|きょうそく}から{舌側|ぜっそく}へ{半分|はんぶん}に{切|き}り、エナメル{質|しつ}・{象牙質|ぞうげしつ}・{歯髄|しずい}を{見|み}せています。',
};

const stateButtons = document.querySelectorAll('[data-state]');
const caption = document.getElementById('stage');
const biteBtn = document.getElementById('bite');
const cutBtn = document.getElementById('cut');
const seeBtn = document.getElementById('seethrough');
const faceView = document.getElementById('faceview');
const viewButtons = document.querySelectorAll('[data-orbit]');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (still) mv.setAttribute('interaction-prompt', 'none');
let state = 'healthy';
const on = (b) => b.getAttribute('aria-pressed') === 'true';

// Text and legend only (no model change), so a language switch does not reload the model.
function render() {
  const s = STATES[state][LANG()];
  const cut = on(cutBtn);
  mv.alt = plain(s.alt) + (cut ? ' ' + plain(CUT_ALT[LANG()]) : '');
  caption.innerHTML = '<h2>' + ruby(s.title) + '</h2><p>' + ruby(s.text) + (on(biteBtn) ? ' ' + ruby(s.bite) : '') + '</p>';
  stateButtons.forEach(b => b.setAttribute('aria-pressed', b.dataset.state === state));
  seeBtn.hidden = state !== 'crown';
  document.querySelectorAll('.legend li').forEach(li => {
    let vis = true;
    if (li.dataset.show) vis = li.dataset.show.split(' ').includes(state);
    if ('cut' in li.dataset) vis = vis && cut;
    if ('bite' in li.dataset) vis = vis && on(biteBtn);
    li.hidden = !vis;
  });
}
function show() {
  mv.src = 'models/' + state + '-' + (on(cutBtn) ? 'cut' : 'whole') + '.glb';
  render();
  try { history.replaceState(null, '', '#' + state); } catch { /* ignore */ }
}

function setAlpha(name, a) {
  for (const m of mv.model.materials) {
    if (m.name !== name) continue;
    const c = m.pbrMetallicRoughness.baseColorFactor;
    m.setAlphaMode(a < 1 ? 'BLEND' : 'OPAQUE');
    m.pbrMetallicRoughness.setBaseColorFactor([c[0], c[1], c[2], a]);
  }
}

// Arrows are part of each model; they show only while biting. The bite loops, or with
// reduced motion set, the model jumps to the bitten position and stays there.
function apply() {
  if (!mv.model) return;
  const biting = on(biteBtn);
  setAlpha('force', biting ? 1 : 0);
  setAlpha('hold', biting ? 1 : 0);
  setAlpha('crown', state === 'crown' && on(seeBtn) ? 0.3 : 1);
  if (biting && !still) { mv.play(); }
  else { mv.pause(); mv.currentTime = biting ? 0.8 : 0; }
}
mv.addEventListener('load', apply);

stateButtons.forEach(b => b.addEventListener('click', () => { state = b.dataset.state; show(); }));
biteBtn.addEventListener('click', () => { biteBtn.setAttribute('aria-pressed', !on(biteBtn)); render(); apply(); });
seeBtn.addEventListener('click', () => { seeBtn.setAttribute('aria-pressed', !on(seeBtn)); apply(); });
cutBtn.addEventListener('click', () => {
  cutBtn.setAttribute('aria-pressed', !on(cutBtn));
  show();
  if (on(cutBtn)) { faceView.click(); mv.addEventListener('load', () => faceView.click(), { once: true }); }
});

viewButtons.forEach(b => b.addEventListener('click', () => {
  mv.cameraOrbit = b.dataset.orbit;
  mv.cameraTarget = 'auto auto auto';
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
const THEME = { en: { dark: 'Dark mode', light: 'Light mode' }, ja: { dark: 'ダークモード', light: 'ライトモード' } };
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
if (STATES[start]) state = start;
buildLangs();
showTheme();
show();
