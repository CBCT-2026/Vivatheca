// Prosthodontic pair viewer: lower jaw with teeth, the same jaw without teeth (flat resorbed ridge), and two
// ways to replace the teeth (complete denture; denture held by two implants). Cut open, preset views,
// language (English / Japanese with furigana / Vietnamese) and theme. Same pattern as public/endodontic/viewer.js.
const mv = document.getElementById('mv');
const html = document.documentElement;
const LANG = () => (html.lang === 'ja' || html.lang === 'vi' ? html.lang : 'en');
// {漢字|かな} -> furigana
const ruby = s => s.replace(/\{([^{}|]+)\|([^{}|]+)\}/g,
  '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');
const plain = s => s.replace(/\{([^{}|]+)\|([^{}|]+)\}/g, '$1');

// Vietnamese is an unreviewed draft; English prevails.
const STATES = {
  dentate: {
    en: {
      title: 'Lower jaw with teeth',
      alt: '3D model of a lower jaw with all 14 adult teeth (no wisdom teeth), with the gum around their necks.',
      text: 'A lower jaw with its teeth. The bone around the roots holds each tooth. This bone is called the ridge. Compare the jaw without teeth with this one.',
      cut: 'Cut open at the big back tooth (first molar), you can see how tall the jaw is where the tooth stands.',
    },
    ja: {
      title: '{歯|は}のある{下|した}あご',
      alt: '{大人|おとな}の{歯|は}14{本|ほん}（{親知|おやし}らずなし）と{歯|は}ぐきがある{下|した}あごの3Dモデル。',
      text: '{歯|は}のある{下|した}あごです。{根|ね}のまわりの{骨|ほね}が{歯|は}を{支|ささ}えています。この{骨|ほね}の{部分|ぶぶん}を{土手|どて}（{顎堤|がくてい}）といいます。{歯|は}のないあごと{比|くら}べてください。',
      cut: '{大|おお}きな{奥歯|おくば}（{第一大臼歯|だいいちだいきゅうし}）のところで{切|き}ると、{歯|は}がある{場所|ばしょ}のあごの{高|たか}さが{見|み}えます。',
    },
    vi: {
      title: 'Hàm dưới còn răng',
      alt: 'Mô hình 3D hàm dưới có đủ 14 răng vĩnh viễn (không có răng khôn), cùng lợi quanh cổ răng.',
      text: 'Một hàm dưới còn răng. Xương quanh chân răng giữ chặt từng răng. Phần xương này gọi là sống hàm. Hãy so sánh hàm mất răng với hàm này.',
      cut: 'Khi cắt mở ở răng cối lớn thứ nhất, bạn thấy hàm cao bao nhiêu ở chỗ có răng.',
    },
  },
  edentulous: {
    en: {
      title: 'Lower jaw without teeth',
      alt: '3D model of the same lower jaw after all its teeth were lost. The ridge is low and flat, most of all at the back. A thin pink layer of gum covers it.',
      text: 'After the teeth are lost, the bone that held them slowly shrinks. Here the ridge has gone. Only the base of the jaw is left, low and flat at the back.',
      cut: 'Cut open at the same place, the jaw is about half as tall as with teeth.',
    },
    ja: {
      title: '{歯|は}のない{下|した}あご',
      alt: 'すべての{歯|は}を{失|うしな}ったあとの{同|おな}じ{下|した}あごの3Dモデル。{土手|どて}は{低|ひく}く{平|たい}らで、{特|とく}に{奥|おく}が{低|ひく}くなっています。{薄|うす}い{歯|は}ぐきがおおっています。',
      text: '{歯|は}を{失|うしな}うと、{歯|は}を{支|ささ}えていた{骨|ほね}は{少|すこ}しずつやせていきます。ここでは{土手|どて}がなくなり、あごの{土台|どだい}だけが{残|のこ}っています。{奥|おく}は{低|ひく}く{平|たい}らです。',
      cut: '{同|おな}じ{場所|ばしょ}で{切|き}ると、あごの{高|たか}さは{歯|は}があるときの{約半分|やくはんぶん}です。',
    },
    vi: {
      title: 'Hàm dưới mất hết răng',
      alt: 'Mô hình 3D của cùng hàm dưới sau khi mất hết răng. Sống hàm thấp và phẳng, nhất là ở phía sau. Một lớp lợi mỏng màu hồng phủ lên trên.',
      text: 'Sau khi mất răng, phần xương từng giữ răng teo dần. Ở đây sống hàm đã mất. Chỉ còn phần nền của hàm, thấp và phẳng ở phía sau.',
      cut: 'Khi cắt mở ở cùng vị trí, hàm chỉ cao khoảng một nửa so với khi còn răng.',
    },
  },
  denture: {
    en: {
      title: 'Complete denture',
      alt: 'The jaw without teeth with a lower denture on it: pink plastic resting on the gum, with white plastic teeth where the real teeth were.',
      text: 'A complete denture replaces all the lower teeth. It rests on the gum over the flat ridge. With little ridge left, a lower denture can move when you talk or eat.',
      cut: 'Cut open, you can see how thick the denture must be to fill the height the jaw has lost.',
    },
    ja: {
      title: '{総入れ歯|そういれば}',
      alt: '{歯|は}のないあごに{下|した}の{入|い}れ{歯|ば}をのせた{状態|じょうたい}。ピンクの{部分|ぶぶん}が{歯|は}ぐきの{上|うえ}にのり、{元|もと}の{歯|は}の{位置|いち}に{白|しろ}い{人工|じんこう}の{歯|は}があります。',
      text: '{総入れ歯|そういれば}は{下|した}の{歯|は}をすべて{補|おぎな}います。{平|たい}らになった{土手|どて}の{歯|は}ぐきの{上|うえ}にのります。{土手|どて}が{少|すく}ないと、{話|はな}すときや{食|た}べるときに{下|した}の{入|い}れ{歯|ば}が{動|うご}くことがあります。',
      cut: '{切|き}って{開|ひら}くと、あごが{失|うしな}った{高|たか}さを{埋|う}めるため、{入|い}れ{歯|ば}が{厚|あつ}くなっているのが{見|み}えます。',
    },
    vi: {
      title: 'Hàm giả toàn phần',
      alt: 'Hàm mất răng có đặt hàm giả dưới: phần nhựa hồng tựa trên lợi, với các răng nhựa trắng ở vị trí răng thật trước đây.',
      text: 'Hàm giả toàn phần thay cho tất cả các răng dưới. Hàm giả tựa trên lợi phủ sống hàm phẳng. Khi sống hàm còn ít, hàm giả dưới có thể xê dịch khi bạn nói hoặc ăn.',
      cut: 'Khi cắt mở, bạn thấy hàm giả phải dày thế nào để bù phần chiều cao hàm đã mất.',
    },
  },
  overdenture: {
    en: {
      title: 'Denture held by two implants',
      alt: 'The same denture held by two grey implants in the front of the jaw, one on each side, each with a small ball on top that pokes through the gum.',
      text: 'Two implants are placed in the front of the jaw, one on each side. The denture clips onto them, so it moves less. Experts agree this is a good first choice for a lower jaw without teeth.',
      cut: 'Cut open, you can see the base of the denture and the gum over the flat ridge.',
    },
    ja: {
      title: '2{本|ほん}のインプラントで{支|ささ}える{入|い}れ{歯|ば}',
      alt: 'あごの{前|まえ}の{左右|さゆう}に1{本|ぽん}ずつ{入|はい}った{灰色|はいいろ}のインプラントで{支|ささ}えた{同|おな}じ{入|い}れ{歯|ば}。インプラントの{上|うえ}の{小|ちい}さな{玉|たま}が{歯|は}ぐきから{出|で}ています。',
      text: 'あごの{前|まえ}の{左右|さゆう}に1{本|ぽん}ずつインプラントを{入|い}れます。{入|い}れ{歯|ば}がそこにはまるので、{動|うご}きにくくなります。{専門家|せんもんか}の{合意|ごうい}では、{歯|は}のない{下|した}あごの{最初|さいしょ}の{選択肢|せんたくし}として{勧|すす}められています。',
      cut: '{切|き}って{開|ひら}くと、{入|い}れ{歯|ば}の{土台|どだい}と、{平|たい}らな{土手|どて}の{上|うえ}の{歯|は}ぐきが{見|み}えます。',
    },
    vi: {
      title: 'Hàm giả giữ bằng hai trụ implant',
      alt: 'Cùng hàm giả đó được giữ bằng hai trụ implant màu xám ở phía trước hàm, mỗi bên một trụ, đầu mỗi trụ có một viên bi nhỏ nhô qua lợi.',
      text: 'Hai trụ implant được đặt ở phía trước hàm, mỗi bên một trụ. Hàm giả gắn khớp vào đó nên ít xê dịch hơn. Các chuyên gia đồng thuận đây là lựa chọn đầu tiên tốt cho hàm dưới mất hết răng.',
      cut: 'Khi cắt mở, bạn thấy phần nền hàm giả và lợi phủ sống hàm phẳng.',
    },
  },
};
const CUT_ALT = {
  en: 'The left side of the jaw is cut through at the first molar, so you can see its height from behind.',
  ja: 'あごの{左側|ひだりがわ}を{第一大臼歯|だいいちだいきゅうし}のところで{切|き}り、{後|うし}ろから{高|たか}さが{見|み}えるようにしています。',
  vi: 'Bên trái hàm được cắt ngang ở răng cối lớn thứ nhất để bạn thấy chiều cao của hàm từ phía sau.',
};

const stateButtons = document.querySelectorAll('[data-state]');
const caption = document.getElementById('stage');
const cutBtn = document.getElementById('cut');
const faceView = document.getElementById('faceview');
const viewButtons = document.querySelectorAll('[data-orbit]');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (still) mv.setAttribute('interaction-prompt', 'none');
let state = 'dentate';
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
