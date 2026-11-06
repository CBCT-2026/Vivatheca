// Endodontic pair viewer: sound tooth or abscess, cut open, preset views, language (English / Japanese with
// furigana / Vietnamese) and theme. Same pattern as public/cracked-tooth/viewer.js.
const mv = document.getElementById('mv');
const html = document.documentElement;
const LANG = () => (html.lang === 'ja' || html.lang === 'vi' ? html.lang : 'en');
// {漢字|かな} -> furigana
const ruby = s => s.replace(/\{([^{}|]+)\|([^{}|]+)\}/g,
  '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');
const plain = s => s.replace(/\{([^{}|]+)\|([^{}|]+)\}/g, '$1');

// Vietnamese is an unreviewed draft; English prevails.
const STATES = {
  sound: {
    en: {
      title: 'Sound tooth',
      alt: '3D model of a sound lower back tooth (first molar) in its bone, with the teeth on each side.',
      text: 'A healthy back tooth from the lower jaw (first molar), in its bone. The pulp (nerve) is alive. The bone around the root tips is whole. Compare the abscess with this one.',
      cut: 'Cut open, you can see the pulp in the middle of the tooth and the thin canals running down each root.',
    },
    ja: {
      title: '{健康|けんこう}な{歯|は}',
      alt: '{骨|ほね}に{入|はい}った{健康|けんこう}な{下|した}の{奥歯|おくば}（{第一大臼歯|だいいちだいきゅうし}）と{両隣|りょうどなり}の{歯|は}の3Dモデル。',
      text: '{骨|ほね}に{入|はい}った{健康|けんこう}な{下|した}の{奥歯|おくば}（{第一大臼歯|だいいちだいきゅうし}）です。{歯髄|しずい}（{神経|しんけい}）は{生|い}きていて、{根|ね}の{先|さき}のまわりの{骨|ほね}もそろっています。のうようと{比|くら}べてください。',
      cut: '{切|き}って{開|ひら}くと、{歯|は}の{中心|ちゅうしん}の{歯髄|しずい}と、{根|ね}の{中|なか}を{下|した}へ{続|つづ}く{細|ほそ}い{根管|こんかん}が{見|み}えます。',
    },
    vi: {
      title: 'Răng lành',
      alt: 'Mô hình 3D của một răng sau hàm dưới lành (răng cối lớn thứ nhất) nằm trong xương, cùng các răng hai bên.',
      text: 'Một răng sau khỏe mạnh ở hàm dưới (răng cối lớn thứ nhất), nằm trong xương. Tủy răng (dây thần kinh) còn sống. Xương quanh chóp chân răng còn nguyên. Hãy so sánh răng áp xe với răng này.',
      cut: 'Khi cắt mở, bạn thấy tủy ở giữa răng và các ống tủy nhỏ chạy xuống mỗi chân răng.',
    },
  },
  abscess: {
    en: {
      title: 'Tooth with an abscess',
      alt: '3D model of the same tooth with a dark hole of decay on top, yellow areas of infection around the root tips, and a thin channel through the bone towards the gum on the cheek side.',
      text: 'Decay (dark brown) has reached the pulp, and the pulp has died (brown). Germs have spread out of the root tips. The bone there has worn away (yellow). A thin channel (red) lets pus drain to the gum.',
      cut: 'Cut open, you can see the decay reaching the pulp, the dead pulp down the canals, and the infection around both root tips.',
    },
    ja: {
      title: 'のうようのある{歯|は}',
      alt: '{上|うえ}に{黒|くろ}いむし{歯|ば}の{穴|あな}、{根|ね}の{先|さき}のまわりに{黄色|きいろ}い{感染|かんせん}の{部分|ぶぶん}、{骨|ほね}を{通|とお}って{頬側|きょうそく}の{歯|は}ぐきへ{向|む}かう{細|ほそ}い{通|とお}り{道|みち}がある{同|おな}じ{歯|は}の3Dモデル。',
      text: 'むし{歯|ば}（{濃|こ}い{茶色|ちゃいろ}）が{歯髄|しずい}に{届|とど}き、{歯髄|しずい}が{死|し}んでいます（{茶色|ちゃいろ}）。{細菌|さいきん}が{根|ね}の{先|さき}から{広|ひろ}がり、そこの{骨|ほね}がなくなっています（{黄色|きいろ}）。{細|ほそ}い{通|とお}り{道|みち}（{赤|あか}）からうみが{歯|は}ぐきへ{出|で}ます。',
      cut: '{切|き}って{開|ひら}くと、{歯髄|しずい}に{届|とど}いたむし{歯|ば}、{根管|こんかん}の{中|なか}の{死|し}んだ{歯髄|しずい}、{両方|りょうほう}の{根|ね}の{先|さき}のまわりの{感染|かんせん}が{見|み}えます。',
    },
    vi: {
      title: 'Răng có áp xe',
      alt: 'Mô hình 3D của cùng răng đó với một lỗ sâu sẫm màu ở mặt trên, các vùng nhiễm trùng màu vàng quanh chóp chân răng, và một đường nhỏ xuyên qua xương về phía lợi bên má.',
      text: 'Sâu răng (nâu sẫm) đã lan đến tủy, và tủy đã chết (màu nâu). Vi khuẩn đã lan ra khỏi chóp chân răng. Xương ở đó bị tiêu đi (màu vàng). Một đường nhỏ (màu đỏ) cho mủ thoát ra lợi.',
      cut: 'Khi cắt mở, bạn thấy sâu răng lan đến tủy, tủy chết trong các ống tủy, và vùng nhiễm trùng quanh cả hai chóp chân răng.',
    },
  },
};
const CUT_ALT = {
  en: 'The tooth and bone are cut open from the cheek side along the root canals.',
  ja: '{歯|は}と{骨|ほね}を{頬側|きょうそく}から{根管|こんかん}に{沿|そ}って{切|き}り{開|ひら}いています。',
  vi: 'Răng và xương được cắt mở từ phía má dọc theo các ống tủy.',
};

const stateButtons = document.querySelectorAll('[data-state]');
const caption = document.getElementById('stage');
const cutBtn = document.getElementById('cut');
const faceView = document.getElementById('faceview');
const viewButtons = document.querySelectorAll('[data-orbit]');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (still) mv.setAttribute('interaction-prompt', 'none');
let state = 'sound';
const on = (b) => b.getAttribute('aria-pressed') === 'true';

// Text and legend only (no model change), so a language switch does not reload the model.
function render() {
  const s = STATES[state][LANG()];
  const cut = on(cutBtn);
  mv.alt = plain(s.alt) + (cut ? ' ' + plain(CUT_ALT[LANG()]) : '');
  caption.innerHTML = '<h2>' + ruby(s.title) + '</h2><p>' + ruby(s.text) + (cut ? ' ' + ruby(s.cut) : '') + '</p>';
  stateButtons.forEach(b => b.setAttribute('aria-pressed', b.dataset.state === state));
  document.querySelectorAll('.legend li').forEach(li => {
    li.hidden = !!li.dataset.show && !li.dataset.show.split(' ').includes(state);
  });
}
function show() {
  mv.src = 'models/' + state + '-' + (on(cutBtn) ? 'cut' : 'whole') + '.glb';
  render();
  try { history.replaceState(null, '', '#' + state); } catch { /* ignore */ }
}

stateButtons.forEach(b => b.addEventListener('click', () => { state = b.dataset.state; show(); }));
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
const NO_GL = { en: 'This browser cannot show 3D (WebGL is off). Turn on hardware acceleration in the browser settings, or open the page in another browser.', ja: 'このブラウザでは3Dを表示できません（WebGLがオフです）。ブラウザの設定でハードウェアアクセラレーションをオンにするか、別のブラウザで開いてください。', vi: 'Trình duyệt này không hiển thị được 3D (WebGL đang tắt). Hãy bật tăng tốc phần cứng trong cài đặt trình duyệt, hoặc mở trang bằng trình duyệt khác.' };
const NO_LOAD = { en: 'The 3D model could not load. Please reload the page.', ja: '3Dモデルを読み込めませんでした。ページを再読み込みしてください。', vi: 'Không tải được mô hình 3D. Vui lòng tải lại trang.' };
const canvas = document.createElement('canvas');
if (!(canvas.getContext('webgl2') || canvas.getContext('webgl'))) showProblem(NO_GL[LANG()]);
mv.addEventListener('error', () => showProblem(NO_LOAD[LANG()]));
setTimeout(() => { if (!customElements.get('model-viewer')) showProblem(NO_LOAD[LANG()]); }, 10000);

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
