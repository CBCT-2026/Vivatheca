// Child-friendly stainless steel crown viewer (/stainless-steel-crown/kids/): a 4-step story
// (tell-show-do), Back/Next, see-inside mode, preset views, language (English / Japanese with
// furigana / Vietnamese, all written in the page) and theme. Models: kids/models (blue baby tooth,
// yellow adult tooth; tools/ssc/kids_glb.py).
const mv = document.getElementById('mv');
const html = document.documentElement;
const LANG = () => (html.lang === 'ja' || html.lang === 'vi' ? html.lang : 'en');
// {漢字|かな} -> furigana
const ruby = s => s.replace(/\{([^{}|]+)\|([^{}|]+)\}/g,
  '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');
const plain = s => s.replace(/\{([^{}|]+)\|([^{}|]+)\}/g, '$1');
const cite = (...n) => n.map(i => '<sup class="cite"><a href="#ref-' + i + '">' + i + '</a></sup>').join('');

const LEGEND = {
  baby: { en: 'Baby tooth', ja: '{乳歯|にゅうし}', vi: 'Răng sữa' },
  adult: { en: 'Adult tooth', ja: '{大人|おとな}の{歯|は}', vi: 'Răng người lớn' },
  decay: { en: 'Holes (decay)', ja: 'むし{歯|ば}', vi: 'Lỗ sâu' },
  filling: { en: 'Filling', ja: '{詰|つ}め{物|もの}', vi: 'Chất trám' },
  steel: { en: 'Crown', ja: 'かぶせ{物|もの}', vi: 'Mão răng' },
  cement: { en: 'Glue', ja: 'のり（セメント）', vi: 'Keo gắn' },
  gum: { en: 'Gum', ja: '{歯|は}ぐき', vi: 'Nướu' },
  bone: { en: 'Bone', ja: '{骨|ほね}', vi: 'Xương' },
  pulp: { en: 'Soft middle (nerve)', ja: 'やわらかい{中心|ちゅうしん}（{神経|しんけい}）', vi: 'Phần mềm ở giữa (tủy)' },
};
const ORDER = ['healthy', 'decay', 'prepared', 'crown'];
const STAGES = {
  healthy: {
    legend: ['baby', 'adult', 'gum', 'bone', 'pulp'],
    en: {
      title: 'A healthy baby tooth',
      alt: 'a healthy baby back tooth (blue)',
      text: 'This is a back tooth in the lower jaw. It is a baby tooth (blue). Under it, a big adult tooth (yellow) is growing.' + cite(7) + ' One day it will push the baby tooth out.' + cite(7),
    },
    ja: {
      title: '{元気|げんき}な{乳歯|にゅうし}',
      alt: '{元気|げんき}な{乳歯|にゅうし}の{奥歯|おくば}（{青|あお}）',
      text: '{下|した}のあごの{奥歯|おくば}です。{青|あお}いのが{乳歯|にゅうし}です。その{下|した}で、{黄色|きいろ}い{大人|おとな}の{歯|は}が{育|そだ}っています。' + cite(7) + 'いつか、この{歯|は}が{乳歯|にゅうし}を{押|お}し{出|だ}します。' + cite(7),
    },
    vi: {
      title: 'Một chiếc răng sữa khỏe mạnh',
      alt: 'một răng hàm sữa khỏe mạnh (màu xanh dương)',
      text: 'Đây là một răng hàm ở hàm dưới. Đây là răng sữa (màu xanh dương). Bên dưới, một chiếc răng người lớn (màu vàng) đang lớn lên.' + cite(7) + ' Một ngày nào đó, nó sẽ đẩy răng sữa ra.' + cite(7),
    },
  },
  decay: {
    legend: ['baby', 'decay', 'adult', 'gum', 'bone', 'pulp'],
    en: {
      title: 'A tooth with holes',
      alt: 'a baby back tooth with big holes from decay',
      text: 'Germs in the mouth eat sugar. They make acid, and acid can make holes in teeth (decay).' + cite(6) + ' This tooth has big holes (dark brown). Big holes can let germs get deep inside the tooth.' + cite(1),
    },
    ja: {
      title: 'むし{歯|ば}の{穴|あな}',
      alt: '{大|おお}きなむし{歯|ば}の{穴|あな}がある{乳歯|にゅうし}の{奥歯|おくば}',
      text: '{口|くち}の{中|なか}のばいきんは、{砂糖|さとう}を{食|た}べて{酸|さん}を{出|だ}します。{酸|さん}は{歯|は}に{穴|あな}をあけます（むし{歯|ば}）。' + cite(6) + 'この{歯|は}には{大|おお}きな{穴|あな}（こげ{茶色|ちゃいろ}）があります。{穴|あな}が{大|おお}きいと、ばいきんが{歯|は}の{奥|おく}まで{入|はい}ることがあります。' + cite(1),
    },
    vi: {
      title: 'Chiếc răng bị sâu',
      alt: 'một răng hàm sữa có lỗ sâu lớn',
      text: 'Vi khuẩn trong miệng ăn đường. Chúng tạo ra axit, và axit có thể làm thủng răng (sâu răng).' + cite(6) + ' Chiếc răng này có lỗ sâu lớn (màu nâu sẫm). Lỗ lớn có thể để vi khuẩn đi sâu vào trong răng.' + cite(1),
    },
  },
  prepared: {
    legend: ['baby', 'filling', 'adult', 'gum', 'bone', 'pulp'],
    en: {
      title: 'Getting the tooth ready',
      alt: 'a baby back tooth with the holes cleaned and filled, made a little smaller for the crown',
      text: 'First, the dentist puts gel on your gum. Then a medicine makes the tooth numb (sleepy), so you do not feel pain.' + cite(5) + ' The dentist cleans out the holes and fills them (purple). Then they make the tooth a little smaller, so the crown fits.' + cite(2),
    },
    ja: {
      title: '{歯|は}の{準備|じゅんび}',
      alt: 'むし{歯|ば}を{取|と}って{詰|つ}め、{少|すこ}し{小|ちい}さくした{乳歯|にゅうし}の{奥歯|おくば}',
      text: 'はじめに、{歯|は}ぐきにぬり{薬|ぐすり}をぬります。それから{薬|くすり}で{歯|は}をねむらせます（{麻酔|ますい}）。{痛|いた}みを{感|かん}じにくくなります。' + cite(5) + 'むし{歯|ば}を{取|と}って、{穴|あな}をうめます（{紫|むらさき}）。かぶせ{物|もの}が{入|はい}るように、{歯|は}を{少|すこ}し{小|ちい}さくします。' + cite(2),
    },
    vi: {
      title: 'Chuẩn bị răng',
      alt: 'một răng hàm sữa đã được làm sạch lỗ sâu, trám lại và mài nhỏ một chút để gắn mão',
      text: 'Đầu tiên, nha sĩ bôi gel lên nướu. Sau đó, thuốc làm tê răng (cho răng “ngủ”), để con không thấy đau.' + cite(5) + ' Nha sĩ làm sạch lỗ sâu và trám lại (màu tím). Rồi nha sĩ làm răng nhỏ đi một chút để mão vừa.' + cite(2),
    },
  },
  crown: {
    legend: ['steel', 'cement', 'baby', 'filling', 'adult', 'gum', 'bone', 'pulp'],
    en: {
      title: 'A shiny new crown',
      alt: 'a baby back tooth covered by a shiny steel crown',
      text: 'The dentist puts a silver crown over the whole tooth. A special glue holds it on.' + cite(1) + ' The crown keeps the tooth strong until it falls out by itself.' + cite(1, 2, 7),
    },
    ja: {
      title: 'ぴかぴかのかぶせ{物|もの}',
      alt: 'ぴかぴかの{金属|きんぞく}のかぶせ{物|もの}をつけた{乳歯|にゅうし}の{奥歯|おくば}',
      text: '{銀色|ぎんいろ}のかぶせ{物|もの}を、{歯|は}{全体|ぜんたい}にかぶせます。とくべつなのりでつけます。' + cite(1) + 'かぶせ{物|もの}は、{乳歯|にゅうし}が{自然|しぜん}に{抜|ぬ}けるまで{歯|は}を{守|まも}ります。' + cite(1, 2, 7),
    },
    vi: {
      title: 'Mão răng mới sáng bóng',
      alt: 'một răng hàm sữa được bọc bằng mão thép sáng bóng',
      text: 'Nha sĩ đặt một mão răng màu bạc trùm lên cả chiếc răng. Một loại keo đặc biệt giữ mão lại.' + cite(1) + ' Mão răng giữ cho răng chắc khỏe đến khi răng tự rụng.' + cite(1, 2, 7),
    },
  },
};
// What Ashley (the guide character, original to Vivatheca) says at each step: a peer telling their own
// visit (modelling), showing the stop signal, tell-show-do and descriptive praise (AAPD behaviour guidance).
const SAY = {
  healthy: {
    en: 'Hi, I\'m Ashley! This is Oscar, my pangolin friend. Oscar has tough scales, like armour.',
    ja: 'こんにちは、アシュリーです！こっちは、センザンコウのオスカー。かたいうろこが、よろいみたいなんだ。',
    vi: 'Chào bạn, mình là Ashley! Đây là Oscar, bạn tê tê của mình. Oscar có lớp vảy cứng như áo giáp.',
  },
  decay: {
    en: 'My dentist used a little mirror to show me the holes in my tooth. Oscar saw them too.',
    ja: '{歯医者|はいしゃ}さんが{小|ちい}さなかがみで、{歯|は}の{穴|あな}を{見|み}せてくれたよ。オスカーも{見|み}たよ。',
    vi: 'Nha sĩ dùng một chiếc gương nhỏ để cho mình xem lỗ sâu trên răng. Oscar cũng xem nữa.',
  },
  prepared: {
    en: 'I lifted my hand once, and my dentist stopped for a rest, just like we agreed. I held Oscar tight.',
    ja: '{一回|いっかい}{手|て}をあげたら、{約束|やくそく}どおり{歯医者|はいしゃ}さんが{止|と}まってくれたよ。オスカーをぎゅっとだっこしてたんだ。',
    vi: 'Mình giơ tay một lần, và nha sĩ dừng lại nghỉ, đúng như đã hẹn. Mình ôm chặt Oscar.',
  },
  crown: {
    en: 'Now my tooth has a shiny crown, like Oscar\'s armour! My dentist said, “Thank you for sitting so still.”',
    ja: '{歯|は}にぴかぴかのかぶせ{物|もの}がついたよ。オスカーのよろいみたい！「じっとしてくれてありがとう」って{言|い}われたよ。',
    vi: 'Giờ răng mình có mão sáng bóng, giống áo giáp của Oscar! Nha sĩ nói: “Cảm ơn con đã ngồi yên.”',
  },
};
const ASHLEY = { en: 'Ashley says', ja: 'アシュリーより', vi: 'Ashley kể' };
const STEP = { en: 'Step {n} of 4', ja: '4つのうち{n}つめ', vi: 'Bước {n} / 4' };
const ALT = {
  en: s => '3D model of ' + s + ', in a block of gum and bone, with the adult tooth (yellow) growing under it.',
  ja: s => s + 'の3Dモデル。{歯|は}ぐきと{骨|ほね}のブロックの{中|なか}にあり、{下|した}で{大人|おとな}の{歯|は}（{黄色|きいろ}）が{育|そだ}っています。',
  vi: s => 'Mô hình 3D của ' + s + ', trong một khối nướu và xương, với răng người lớn (màu vàng) đang lớn lên bên dưới.',
};

const stageButtons = document.querySelectorAll('[data-stage]');
const caption = document.getElementById('stage');
const legend = document.getElementById('legend');
const xray = document.getElementById('xray');
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const viewButtons = document.querySelectorAll('[data-orbit]');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (still) mv.setAttribute('interaction-prompt', 'none');
let stage = 'healthy';

// Text and legend only (no model change), so a language switch does not reload the model.
function render() {
  const l = LANG();
  const s = STAGES[stage][l];
  const n = ORDER.indexOf(stage) + 1;
  mv.setAttribute('alt', plain(ALT[l](s.alt)));
  caption.innerHTML = '<svg class="pic" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><use href="#pic-' + stage + '"/></svg>'
    + '<div><p class="count">' + STEP[l].replace('{n}', n) + '</p><h2>' + ruby(s.title) + '</h2><p>' + ruby(s.text) + '</p>'
    + '<div class="speech"><svg viewBox="36 14 76 76" role="img" aria-label="' + ASHLEY[l] + '"><use href="#ashley-head"/></svg><p>' + ruby(SAY[stage][l]) + '</p></div></div>';
  legend.innerHTML = STAGES[stage].legend.map(k => '<li><span class="dot ' + k + '"></span>' + ruby(LEGEND[k][l]) + '</li>').join('');
  stageButtons.forEach(b => b.setAttribute('aria-pressed', b.dataset.stage === stage));
  prev.disabled = n === 1;
  next.disabled = n === ORDER.length;
}
function show() {
  mv.setAttribute('src', '/stainless-steel-crown/kids/models/' + stage + '.glb'); // absolute: the page may be served without a trailing slash
  render();
  try { history.replaceState(null, '', '#' + stage); } catch { /* ignore */ }
}
stageButtons.forEach(b => b.addEventListener('click', () => { stage = b.dataset.stage; show(); }));
const step = d => { const i = ORDER.indexOf(stage) + d; if (ORDER[i]) { stage = ORDER[i]; show(); } };
prev.addEventListener('click', () => step(-1));
next.addEventListener('click', () => step(1));

// See inside: outer layers become faint so the nerve, the filling and the adult tooth show.
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
// All three languages are in the page, so switching only changes <html lang> and re-renders the story;
// the page reloads so the shared top bar and footer follow the new language too.
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
const PROBLEM = {
  webgl: { en: 'This browser cannot show 3D (WebGL is off). Turn on hardware acceleration in the browser settings, or open the page in another browser.', ja: 'このブラウザーでは3Dを表示できません（WebGLがオフです）。ブラウザーの設定でハードウェアアクセラレーションをオンにするか、別のブラウザーで開いてください。', vi: 'Trình duyệt này không hiển thị được 3D (WebGL đang tắt). Hãy bật tăng tốc phần cứng trong cài đặt trình duyệt, hoặc mở trang bằng trình duyệt khác.' },
  load: { en: 'The 3D model could not load. Please reload the page.', ja: '3Dモデルを読み込めませんでした。ページを再読み込みしてください。', vi: 'Không tải được mô hình 3D. Vui lòng tải lại trang.' },
};
function showProblem(k) {
  let box = mv.querySelector('.problem');
  if (!box) { box = document.createElement('div'); box.className = 'problem'; mv.appendChild(box); }
  box.textContent = PROBLEM[k][LANG()];
}
const canvas = document.createElement('canvas');
if (!(canvas.getContext('webgl2') || canvas.getContext('webgl'))) showProblem('webgl');
mv.addEventListener('error', () => showProblem('load'));
setTimeout(() => { if (!customElements.get('model-viewer')) showProblem('load'); }, 10000);

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
