// Dentigerous cyst pair viewer: an unerupted lower wisdom tooth with a normal follicle, and the same tooth with a
// dentigerous cyst. Cut open, preset views, language (English / Japanese with furigana / Vietnamese) and theme.
// Same pattern as public/endodontic/viewer.js.
const mv = document.getElementById('mv');
const html = document.documentElement;
const LANG = () => (html.lang === 'ja' || html.lang === 'vi' ? html.lang : 'en');
// {漢字|かな} -> furigana
const ruby = s => s.replace(/\{([^{}|]+)\|([^{}|]+)\}/g,
  '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');
const plain = s => s.replace(/\{([^{}|]+)\|([^{}|]+)\}/g, '$1');

// Vietnamese is an unreviewed draft; English prevails.
const STATES = {
  normal: {
    en: {
      title: 'Wisdom tooth that has not come through',
      alt: '3D model of the back of a lower jaw with three back teeth and a wisdom tooth still inside the bone behind them. A thin pink sac covers the crown of the wisdom tooth.',
      text: 'A lower wisdom tooth that has not come through the gum. It sits in the bone behind the other back teeth. A thin soft sac covers its crown. This sac is normal.',
      cut: 'Cut open from the cheek side, you can see the thin sac between the crown and the bone.',
    },
    ja: {
      title: 'まだ{生|は}えていない{親知|おやし}らず',
      alt: '{下|した}あごの{奥|おく}の3Dモデル。{奥歯|おくば}が3{本|ぼん}あり、その{後|うし}ろの{骨|ほね}の{中|なか}に{親知|おやし}らずがあります。{親知|おやし}らずの{頭|あたま}を{薄|うす}いピンクの{袋|ふくろ}がおおっています。',
      text: '{歯|は}ぐきから{出|で}ていない{下|した}の{親知|おやし}らずです。ほかの{奥歯|おくば}の{後|うし}ろの{骨|ほね}の{中|なか}にあります。{歯|は}の{頭|あたま}を{薄|うす}くやわらかい{袋|ふくろ}がおおっています。この{袋|ふくろ}は{正常|せいじょう}なものです。',
      cut: 'ほお{側|がわ}から{切|き}って{開|ひら}くと、{歯|は}の{頭|あたま}と{骨|ほね}のあいだの{薄|うす}い{袋|ふくろ}が{見|み}えます。',
    },
    vi: {
      title: 'Răng khôn chưa mọc',
      alt: 'Mô hình 3D phần sau của hàm dưới với ba răng hàm và một răng khôn vẫn nằm trong xương phía sau. Một túi mỏng màu hồng bọc thân răng khôn.',
      text: 'Một răng khôn hàm dưới chưa mọc qua lợi. Răng nằm trong xương phía sau các răng hàm khác. Một túi mềm mỏng bọc thân răng. Túi này là bình thường.',
      cut: 'Khi cắt mở từ phía má, bạn thấy túi mỏng nằm giữa thân răng và xương.',
    },
  },
  cyst: {
    en: {
      title: 'Cyst around a wisdom tooth (dentigerous cyst)',
      alt: 'The same jaw with a large yellow cyst around the crown of the wisdom tooth. The cyst has pushed the bone outwards behind the back teeth.',
      text: 'Here the sac around the crown has filled with fluid and grown into a cyst. A cyst like this grows slowly and often causes no pain. It is often found on an X-ray.',
      cut: 'Cut open, you can see the crown of the wisdom tooth inside the cyst, and the thin bone left around it.',
    },
    ja: {
      title: '{親知|おやし}らずのまわりの{袋|ふくろ}の{病気|びょうき}（{含歯性|がんしせい}のう{胞|ほう}）',
      alt: '{同|おな}じあごで、{親知|おやし}らずの{頭|あたま}のまわりに{大|おお}きな{黄色|きいろ}ののう{胞|ほう}があります。のう{胞|ほう}が{奥歯|おくば}の{後|うし}ろの{骨|ほね}を{外|そと}へ{押|お}し{広|ひろ}げています。',
      text: 'ここでは{歯|は}の{頭|あたま}のまわりの{袋|ふくろ}に{液|えき}がたまり、{大|おお}きくなってのう{胞|ほう}になっています。このようなのう{胞|ほう}はゆっくり{大|おお}きくなり、{痛|いた}みがないことが{多|おお}いです。レントゲンで{見|み}つかることがよくあります。',
      cut: '{切|き}って{開|ひら}くと、のう{胞|ほう}の{中|なか}に{親知|おやし}らずの{頭|あたま}があり、まわりの{骨|ほね}が{薄|うす}くなっているのが{見|み}えます。',
    },
    vi: {
      title: 'Nang quanh răng khôn (nang thân răng)',
      alt: 'Cùng hàm đó với một nang lớn màu vàng bao quanh thân răng khôn. Nang đã đẩy xương phồng ra phía sau các răng hàm.',
      text: 'Ở đây túi quanh thân răng đã chứa đầy dịch và lớn lên thành nang. Nang như vậy lớn chậm và thường không đau. Nang thường được phát hiện trên phim X-quang.',
      cut: 'Khi cắt mở, bạn thấy thân răng khôn nằm trong nang, và lớp xương mỏng còn lại quanh nang.',
    },
  },
};
const CUT_ALT = {
  en: 'The jaw is cut front to back through the wisdom tooth and seen from the cheek side.',
  ja: 'あごを{親知|おやし}らずのところで{前後|ぜんご}に{切|き}り、ほお{側|がわ}から{見|み}ています。',
  vi: 'Hàm được cắt theo chiều trước sau qua răng khôn và nhìn từ phía má.',
};

const stateButtons = document.querySelectorAll('[data-state]');
const caption = document.getElementById('stage');
const cutBtn = document.getElementById('cut');
const faceView = document.getElementById('faceview');
const viewButtons = document.querySelectorAll('[data-orbit]');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (still) mv.setAttribute('interaction-prompt', 'none');
let state = 'normal';
const on = (b) => b.getAttribute('aria-pressed') === 'true';

// Text and legend only (no model change), so a language switch does not reload the model.
function render() {
  const s = STATES[state][LANG()];
  const cut = on(cutBtn);
  mv.alt = plain(s.alt) + (cut ? ' ' + plain(CUT_ALT[LANG()]) : '');
  caption.innerHTML = '<h2>' + ruby(s.title) + '</h2><p>' + ruby(s.text) + (cut ? ' ' + ruby(s.cut) : '') + '</p>';
  stateButtons.forEach(b => b.setAttribute('aria-pressed', b.dataset.state === state));
  document.querySelectorAll('.legend li').forEach(li => {
    li.hidden = (!!li.dataset.show && !li.dataset.show.split(' ').includes(state)) || ('cut' in li.dataset && !cut);
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
