// VPI viewer: normal soft palate at rest and in speech, velopharyngeal insufficiency (VPI) after cleft palate
// repair, and three operations. Side view (cut down the middle) or view from above (like a camera passed
// through the nose). Language (English / Japanese with furigana / Vietnamese) and theme. Same pattern as
// public/endodontic/viewer.js. Vietnamese is an unreviewed draft; English prevails.
const mv = document.getElementById('mv');
const html = document.documentElement;
const LANG = () => (html.lang === 'ja' || html.lang === 'vi' ? html.lang : 'en');
const ruby = s => s.replace(/\{([^{}|]+)\|([^{}|]+)\}/g,
  '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');
const plain = s => s.replace(/\{([^{}|]+)\|([^{}|]+)\}/g, '$1');

const STATES = {
  rest: {
    en: { title: 'Normal: breathing', alt: 'Side view of the nose, mouth and throat cut down the middle. The soft palate hangs down. A blue arrow shows air going up the throat and out through the nose.',
      text: 'When you breathe through your nose, the soft palate hangs down. Air passes behind it, between the nose and the throat.' },
    ja: { title: '{正常|せいじょう}：{息|いき}をするとき', alt: '{鼻|はな}・{口|くち}・のどを{真|ま}ん{中|なか}で{切|き}った{横|よこ}からの{図|ず}。やわらかい{上|うわ}あごが{下|さ}がり、{青|あお}い{矢印|やじるし}の{空気|くうき}がのどから{鼻|はな}へ{抜|ぬ}けます。',
      text: '{鼻|はな}で{息|いき}をするとき、やわらかい{上|うわ}あご（{軟口蓋|なんこうがい}）は{下|さ}がっています。{空気|くうき}はその{後|うし}ろを{通|とお}ります。' },
    vi: { title: 'Bình thường: khi thở', alt: 'Hình nhìn ngang mũi, miệng và họng, cắt dọc giữa. Vòm miệng mềm buông xuống. Mũi tên xanh cho thấy không khí đi lên họng và ra mũi.',
      text: 'Khi bạn thở bằng mũi, vòm miệng mềm buông xuống. Không khí đi qua phía sau nó, giữa mũi và họng.' },
  },
  speech: {
    en: { title: 'Normal: speaking', alt: 'The soft palate is lifted and touches the back of the throat. The blue arrow of air goes out through the mouth only.',
      text: 'For most speech sounds, a muscle sling lifts the soft palate. It presses against the back of the throat. This closes off the nose, so air and sound go out through the mouth.' },
    ja: { title: '{正常|せいじょう}：{話|はな}すとき', alt: 'やわらかい{上|うわ}あごが{上|あ}がり、のどの{奥|おく}の{壁|かべ}についています。{青|あお}い{矢印|やじるし}の{空気|くうき}は{口|くち}からだけ{出|で}ます。',
      text: '{多|おお}くの{音|おと}を{出|だ}すとき、{筋肉|きんにく}がやわらかい{上|うわ}あごを{持|も}ち{上|あ}げ、のどの{奥|おく}の{壁|かべ}につけます。{鼻|はな}への{道|みち}がふさがり、{空気|くうき}と{声|こえ}は{口|くち}から{出|で}ます。' },
    vi: { title: 'Bình thường: khi nói', alt: 'Vòm miệng mềm được nâng lên và chạm vào thành sau họng. Mũi tên xanh cho thấy không khí chỉ đi ra miệng.',
      text: 'Với hầu hết các âm, một dải cơ nâng vòm miệng mềm lên. Nó ép vào thành sau họng. Đường lên mũi được đóng lại, nên không khí và âm thanh đi ra miệng.' },
  },
  vpi: {
    en: { title: 'VPI: speaking', alt: 'A short soft palate lifts but does not reach the back of the throat. An orange arrow shows air escaping up through the gap and out through the nose.',
      text: 'Here the cleft palate was repaired, but the soft palate is short and its muscles are not joined in a sling. It cannot reach the back of the throat. Air leaks through the gap into the nose. Speech sounds nasal and weak.' },
    ja: { title: '{鼻咽|びいん}くう{閉鎖|へいさ}{不全|ふぜん}：{話|はな}すとき', alt: '{短|みじか}いやわらかい{上|うわ}あごが{上|あ}がっても、のどの{奥|おく}の{壁|かべ}に{届|とど}きません。オレンジの{矢印|やじるし}の{空気|くうき}がすき{間|ま}から{鼻|はな}へもれます。',
      text: '{口蓋裂|こうがいれつ}の{手術|しゅじゅつ}はしましたが、やわらかい{上|うわ}あごが{短|みじか}く、{筋肉|きんにく}がつながっていません。のどの{奥|おく}に{届|とど}かず、すき{間|ま}から{空気|くうき}が{鼻|はな}へもれます。{声|こえ}は{鼻|はな}にかかり、{弱|よわ}くなります。' },
    vi: { title: 'Thiểu năng vòm hầu (VPI): khi nói', alt: 'Vòm miệng mềm ngắn được nâng lên nhưng không chạm tới thành sau họng. Mũi tên cam cho thấy không khí thoát qua khe hở và ra mũi.',
      text: 'Ở đây khe hở vòm miệng đã được phẫu thuật, nhưng vòm miệng mềm ngắn và các cơ không nối thành dải. Nó không chạm được thành sau họng. Không khí thoát qua khe hở lên mũi. Giọng nói nghe giọng mũi và yếu.' },
  },
  furlow: {
    en: { title: 'Surgery: palate re-repair (Furlow)', alt: 'After re-repair, the longer soft palate lifts and touches the back of the throat. Air goes out through the mouth.',
      text: 'The surgeon opens the soft palate again. They join its muscles into a sling and make the palate longer with two Z-shaped cuts. Now it can reach the back of the throat.' },
    ja: { title: '{手術|しゅじゅつ}：{口蓋|こうがい}の{再|さい}{形成|けいせい}（ファーロー{法|ほう}）', alt: '{手術|しゅじゅつ}で{長|なが}くなったやわらかい{上|うわ}あごが{上|あ}がり、のどの{奥|おく}の{壁|かべ}につきます。{空気|くうき}は{口|くち}から{出|で}ます。',
      text: 'やわらかい{上|うわ}あごをもう{一度|いちど}{開|ひら}き、{筋肉|きんにく}を{輪|わ}のようにつなぎます。Z{字|じ}の{切|き}り{方|かた}で{上|うわ}あごを{長|なが}くし、のどの{奥|おく}に{届|とど}くようにします。' },
    vi: { title: 'Phẫu thuật: tạo hình lại vòm miệng (Furlow)', alt: 'Sau khi tạo hình lại, vòm miệng mềm dài hơn được nâng lên và chạm thành sau họng. Không khí đi ra miệng.',
      text: 'Bác sĩ phẫu thuật mở lại vòm miệng mềm. Họ nối các cơ thành một dải và làm vòm miệng dài hơn bằng hai đường cắt hình chữ Z. Giờ nó có thể chạm tới thành sau họng.' },
  },
  flap: {
    en: { title: 'Surgery: pharyngeal flap', alt: 'A dark red bridge of tissue joins the back of the throat to the soft palate. Air goes out through the mouth.',
      text: 'The surgeon lifts a strip of tissue from the back of the throat. They sew it to the soft palate, so it forms a bridge in the middle. Two small openings stay at the sides for breathing. When you speak, the side walls of the throat close them.' },
    ja: { title: '{手術|しゅじゅつ}：{咽頭弁|いんとうべん}', alt: 'のどの{奥|おく}の{壁|かべ}とやわらかい{上|うわ}あごが、{濃|こ}い{赤|あか}の{組織|そしき}の{橋|はし}でつながっています。{空気|くうき}は{口|くち}から{出|で}ます。',
      text: 'のどの{奥|おく}の{壁|かべ}から{細長|ほそなが}い{組織|そしき}を{起|お}こし、やわらかい{上|うわ}あごに{縫|ぬ}いつけて、{真|ま}ん{中|なか}に{橋|はし}を{作|つく}ります。{両側|りょうがわ}に{息|いき}のための{小|ちい}さな{穴|あな}が{残|のこ}ります。{話|はな}すときは、のどの{横|よこ}の{壁|かべ}がその{穴|あな}を{閉|と}じます。' },
    vi: { title: 'Phẫu thuật: vạt hầu', alt: 'Một cầu mô màu đỏ sẫm nối thành sau họng với vòm miệng mềm. Không khí đi ra miệng.',
      text: 'Bác sĩ phẫu thuật nâng một dải mô từ thành sau họng. Họ khâu nó vào vòm miệng mềm, tạo thành một cầu ở giữa. Hai lỗ nhỏ ở hai bên được giữ lại để thở. Khi bạn nói, thành bên của họng đóng chúng lại.' },
  },
  sphincter: {
    en: { title: 'Surgery: sphincter pharyngoplasty', alt: 'Tissue moved from the side walls makes a raised band on the back of the throat. The short soft palate now reaches it. Air goes out through the mouth.',
      text: 'The surgeon moves two flaps of tissue from the side walls of the throat. They sew them across the back wall. This makes a raised band and a smaller opening. The short soft palate can now close against it.' },
    ja: { title: '{手術|しゅじゅつ}：{咽頭|いんとう}{形成|けいせい}（スフィンクター{法|ほう}）', alt: 'のどの{横|よこ}の{壁|かべ}から{移|うつ}した{組織|そしき}が、{奥|おく}の{壁|かべ}にもり{上|あ}がった{帯|おび}を{作|つく}っています。{短|みじか}いやわらかい{上|うわ}あごがそこに{届|とど}きます。',
      text: 'のどの{横|よこ}の{壁|かべ}から{組織|そしき}を2つ{起|お}こし、{奥|おく}の{壁|かべ}に{横向|よこむ}きに{縫|ぬ}いつけます。もり{上|あ}がった{帯|おび}ができて{通|とお}り{道|みち}が{狭|せま}くなり、{短|みじか}いやわらかい{上|うわ}あごでも{閉|と}じられます。' },
    vi: { title: 'Phẫu thuật: tạo hình cơ thắt hầu', alt: 'Mô được chuyển từ thành bên họng tạo một gờ nổi trên thành sau họng. Vòm miệng mềm ngắn giờ chạm tới gờ này. Không khí đi ra miệng.',
      text: 'Bác sĩ phẫu thuật chuyển hai vạt mô từ thành bên của họng. Họ khâu chúng ngang qua thành sau. Việc này tạo một gờ nổi và một lỗ nhỏ hơn. Vòm miệng mềm ngắn giờ có thể đóng lại với gờ đó.' },
  },
};
const ABOVE_ALT = {
  en: 'Seen from above, as with a small camera passed through the nose: the soft palate at the front, the side walls and the back wall of the throat around the opening.',
  ja: '{鼻|はな}から{入|い}れた{小|ちい}さなカメラのように{上|うえ}から{見|み}た{図|ず}：{前|まえ}にやわらかい{上|うわ}あご、そのまわりにのどの{横|よこ}と{奥|おく}の{壁|かべ}があります。',
  vi: 'Nhìn từ trên xuống, như khi đưa một camera nhỏ qua mũi: vòm miệng mềm ở phía trước, thành bên và thành sau họng bao quanh lỗ mở.',
};

const stateButtons = document.querySelectorAll('[data-state]');
const caption = document.getElementById('stage');
const aboveBtn = document.getElementById('above');
const viewButtons = document.querySelectorAll('[data-orbit]');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (still) mv.setAttribute('interaction-prompt', 'none');
let state = 'speech';
const on = (b) => b.getAttribute('aria-pressed') === 'true';

function render() {
  const s = STATES[state][LANG()];
  const above = on(aboveBtn);
  mv.alt = plain(s.alt) + (above ? ' ' + plain(ABOVE_ALT[LANG()]) : '');
  caption.innerHTML = '<h2>' + ruby(s.title) + '</h2><p>' + ruby(s.text) + '</p>';
  stateButtons.forEach(b => b.setAttribute('aria-pressed', b.dataset.state === state));
  document.querySelectorAll('.legend li').forEach(li => {
    li.hidden = !!li.dataset.show && !li.dataset.show.split(' ').includes(state);
  });
}
function show() {
  mv.src = 'models/' + state + '-' + (on(aboveBtn) ? 'whole' : 'cut') + '.glb';
  render();
  try { history.replaceState(null, '', '#' + state); } catch { /* ignore */ }
}
function orbit(o) {
  mv.cameraOrbit = o;
  mv.cameraTarget = 'auto auto auto';
  if (still && mv.jumpCameraToGoal) mv.jumpCameraToGoal();
}

stateButtons.forEach(b => b.addEventListener('click', () => { state = b.dataset.state; show(); }));
aboveBtn.addEventListener('click', () => {
  aboveBtn.setAttribute('aria-pressed', !on(aboveBtn));
  show();
  const o = on(aboveBtn) ? '0deg 0.1deg auto' : '-90deg 85deg auto';
  viewButtons.forEach(v => v.setAttribute('aria-pressed', v.dataset.orbit === o));
  orbit(o); mv.addEventListener('load', () => orbit(o), { once: true });
});

viewButtons.forEach(b => b.addEventListener('click', () => {
  orbit(b.dataset.orbit);
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
