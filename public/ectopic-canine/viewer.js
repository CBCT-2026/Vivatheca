// Ectopic canine viewer: the right upper jaw at 10.5 years with the adult canine on its normal path, displaced
// towards the palate, and after extraction of the baby canine. See-through bone, preset views, language
// (English / Japanese with furigana / Vietnamese) and theme.
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
      title: 'Adult canine on its normal path',
      alt: '3D model of the right side of a child’s upper jaw at about 10 and a half years. Baby teeth are blue and adult teeth are yellow. The adult canine is high in the jaw above the baby canine, on the cheek side.',
      text: 'The adult canine is high in the jaw, above the baby canine. It moves down on the cheek side. When the baby canine falls out, the adult canine takes its place.',
    },
    ja: {
      title: '{正常|せいじょう}な{道|みち}を{進|すす}む{大人|おとな}の{犬歯|けんし}',
      alt: '10{歳|さい}{半|はん}ごろの{子|こ}どもの{上|うえ}あごの{右側|みぎがわ}の3Dモデル。{乳歯|にゅうし}は{青|あお}、{大人|おとな}の{歯|は}は{黄色|きいろ}です。{大人|おとな}の{犬歯|けんし}は、{乳歯|にゅうし}の{犬歯|けんし}の{上|うえ}、ほお{側|がわ}の{高|たか}いところにあります。',
      text: '{大人|おとな}の{犬歯|けんし}は、{乳歯|にゅうし}の{犬歯|けんし}の{上|うえ}の{高|たか}いところにあり、ほお{側|がわ}を{下|した}へ{進|すす}みます。{乳歯|にゅうし}が{抜|ぬ}けると、そこに{生|は}えてきます。',
    },
    vi: {
      title: 'Răng nanh vĩnh viễn trên đường mọc bình thường',
      alt: 'Mô hình 3D bên phải hàm trên của một trẻ khoảng 10 tuổi rưỡi. Răng sữa màu xanh, răng vĩnh viễn màu vàng. Răng nanh vĩnh viễn nằm cao trong xương, phía trên răng nanh sữa, về phía má.',
      text: 'Răng nanh vĩnh viễn nằm cao trong xương hàm, phía trên răng nanh sữa. Răng di chuyển xuống ở phía má. Khi răng nanh sữa rụng, răng nanh vĩnh viễn mọc vào chỗ đó.',
    },
  },
  palatal: {
    en: {
      title: 'Canine growing towards the palate',
      alt: 'The same jaw. The adult canine is tilted towards the middle and lies on the palate side, behind the roots of the front teeth. The baby canine is still in place.',
      text: 'Here the adult canine has grown towards the palate, behind the roots of the front teeth. The baby canine is still in place. A canine like this often cannot come through by itself.',
    },
    ja: {
      title: '{上|うわ}あご{側|がわ}へ{育|そだ}った{犬歯|けんし}',
      alt: '{同|おな}じあご。{大人|おとな}の{犬歯|けんし}が{真|ま}ん{中|なか}の{方|ほう}へ{傾|かたむ}き、{前歯|まえば}の{根|ね}の{後|うし}ろ、{上|うわ}あご{側|がわ}にあります。{乳歯|にゅうし}の{犬歯|けんし}は{残|のこ}っています。',
      text: 'ここでは{大人|おとな}の{犬歯|けんし}が、{前歯|まえば}の{根|ね}の{後|うし}ろ、{上|うわ}あご{側|がわ}へ{育|そだ}っています。{乳歯|にゅうし}の{犬歯|けんし}はまだ{残|のこ}っています。このような{犬歯|けんし}は、{自然|しぜん}には{生|は}えてこないことがよくあります。',
    },
    vi: {
      title: 'Răng nanh mọc lệch về phía vòm miệng',
      alt: 'Cùng hàm đó. Răng nanh vĩnh viễn nghiêng về phía giữa và nằm ở phía vòm miệng, sau chân các răng cửa. Răng nanh sữa vẫn còn.',
      text: 'Ở đây răng nanh vĩnh viễn đã phát triển về phía vòm miệng, sau chân các răng cửa. Răng nanh sữa vẫn còn. Răng nanh như vậy thường không tự mọc được.',
    },
  },
  extracted: {
    en: {
      title: 'Baby canine taken out',
      alt: 'The same jaw with the canine on the palate side. The baby canine has been taken out, leaving a space in the row of teeth.',
      text: 'One option between about 10 and 13 years is to take out the baby canine. This gives the adult canine a better chance to come through. The dentist checks it for about 12 months.',
    },
    ja: {
      title: '{乳歯|にゅうし}の{犬歯|けんし}を{抜|ぬ}いたところ',
      alt: '{上|うわ}あご{側|がわ}に{犬歯|けんし}がある{同|おな}じあご。{乳歯|にゅうし}の{犬歯|けんし}を{抜|ぬ}き、{歯|は}ならびにすき{間|ま}があります。',
      text: '10{歳|さい}から13{歳|さい}ごろに、{乳歯|にゅうし}の{犬歯|けんし}を{抜|ぬ}く{方法|ほうほう}があります。{大人|おとな}の{犬歯|けんし}が{生|は}えてきやすくなります。その{後|あと}{約|やく}12か{月|げつ}{様子|ようす}を{見|み}ます。',
    },
    vi: {
      title: 'Đã nhổ răng nanh sữa',
      alt: 'Cùng hàm có răng nanh lệch về phía vòm miệng. Răng nanh sữa đã được nhổ, để lại một khoảng trống trên cung răng.',
      text: 'Một cách điều trị trong khoảng 10 đến 13 tuổi là nhổ răng nanh sữa. Điều này giúp răng nanh vĩnh viễn có cơ hội mọc tốt hơn. Nha sĩ theo dõi khoảng 12 tháng.',
    },
  },
};
const XRAY_ALT = {
  en: 'The bone is shown see-through.',
  ja: '{骨|ほね}を{透|す}かして{表示|ひょうじ}しています。',
  vi: 'Xương được hiển thị trong suốt.',
};

const stateButtons = document.querySelectorAll('[data-state]');
const caption = document.getElementById('stage');
const xrayBtn = document.getElementById('xray');
const viewButtons = document.querySelectorAll('[data-orbit]');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (still) mv.setAttribute('interaction-prompt', 'none');
let state = 'normal';
const on = (b) => b.getAttribute('aria-pressed') === 'true';

// Text and legend only (no model change), so a language switch does not reload the model.
function render() {
  const s = STATES[state][LANG()];
  mv.alt = plain(s.alt) + (on(xrayBtn) ? ' ' + plain(XRAY_ALT[LANG()]) : '');
  caption.innerHTML = '<h2>' + ruby(s.title) + '</h2><p>' + ruby(s.text) + '</p>';
  stateButtons.forEach(b => b.setAttribute('aria-pressed', b.dataset.state === state));
  document.querySelectorAll('.legend li').forEach(li => {
    li.hidden = !!li.dataset.show && !li.dataset.show.split(' ').includes(state);
  });
}
function show() {
  mv.src = 'models/' + state + '.glb';
  render();
  try { history.replaceState(null, '', '#' + state); } catch { /* ignore */ }
}

stateButtons.forEach(b => b.addEventListener('click', () => { state = b.dataset.state; show(); }));
// See-through bone: the canine sits inside the bone, so the bone is see-through unless switched off.
function xray() {
  const bone = mv.model && mv.model.materials.find(m => m.name === 'bone');
  if (!bone) return;
  const c = bone.pbrMetallicRoughness.baseColorFactor;
  bone.setAlphaMode(on(xrayBtn) ? 'BLEND' : 'OPAQUE');
  bone.pbrMetallicRoughness.setBaseColorFactor([c[0], c[1], c[2], on(xrayBtn) ? 0.3 : 1]);
}
mv.addEventListener('load', xray);
xrayBtn.addEventListener('click', () => {
  xrayBtn.setAttribute('aria-pressed', !on(xrayBtn));
  xray();
  render();
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
