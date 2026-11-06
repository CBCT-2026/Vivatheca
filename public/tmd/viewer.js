// TMD viewer: the jaw joints and chewing muscles, five animated jaw exercises, play/pause, slow, preset
// views, language (English / Japanese with furigana / Vietnamese) and theme. Same pattern as
// public/endodontic/viewer.js. Animations are in models/tmd.glb (built by tools/tmd/build.py).
const mv = document.getElementById('mv');
const html = document.documentElement;
const LANG = () => (html.lang === 'ja' || html.lang === 'vi' ? html.lang : 'en');
const ruby = s => s.replace(/\{([^{}|]+)\|([^{}|]+)\}/g,
  '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');
const plain = s => s.replace(/\{([^{}|]+)\|([^{}|]+)\}/g, '$1').replace(/<[^>]+>/g, '');
const cite = (...n) => n.map(i => '<sup class="cite"><a href="#ref-' + i + '">' + i + '</a></sup>').join('');

// Each stage: the glTF animation to play (anatomy shows the jaw at rest, still), and for each language a
// title, steps and an evidence note. Vietnamese is an unreviewed draft; English prevails.
const STAGES = {
  anatomy: {
    anim: 'rest', still: true,
    en: {
      title: 'The jaw and its muscles',
      text: 'Each jaw joint sits just in front of the ear. A small disc (blue) lies between the bone of the jaw and the skull. Four muscles on each side move the jaw. Two you can feel: one in the cheek and one in the temple. Two lie deeper, inside the jaw.' + cite(19),
      steps: ['Under “Take the model apart”, tap the skull or a muscle to hide it. Then you can see the deep muscles and the disc.', 'Tap a move to see it on the model.'],
    },
    ja: {
      title: 'あごと{筋肉|きんにく}',
      text: 'あごの{関節|かんせつ}は{耳|みみ}のすぐ{前|まえ}にあります。あごの{骨|ほね}と{頭|あたま}の{骨|ほね}の{間|あいだ}に、{小|ちい}さな{円板|えんばん}（{青|あお}）があります。あごは{左右|さゆう}それぞれ4つの{筋肉|きんにく}で{動|うご}きます。ほおとこめかみの{筋肉|きんにく}は{触|さわ}ってわかります。ほかの2つはあごの{内側|うちがわ}の{奥|おく}にあります。' + cite(19),
      steps: ['「{模型|もけい}を{分|わ}けて{見|み}る」で{頭|あたま}の{骨|ほね}や{筋肉|きんにく}を{消|け}すと、{奥|おく}の{筋肉|きんにく}と{円板|えんばん}が{見|み}えます。', '{運動|うんどう}を{押|お}すと{動|うご}きが{見|み}られます。'],
    },
    vi: {
      title: 'Hàm và các cơ',
      text: 'Mỗi khớp hàm nằm ngay trước tai. Một đĩa nhỏ (màu xanh) nằm giữa xương hàm và hộp sọ. Bốn cơ ở mỗi bên làm hàm cử động. Hai cơ bạn sờ thấy được: một ở má và một ở thái dương. Hai cơ nằm sâu hơn, phía trong hàm.' + cite(19),
      steps: ['Ở mục “Tách các phần của mô hình”, chạm vào hộp sọ hoặc một cơ để ẩn nó và xem các cơ sâu và đĩa khớp.', 'Chạm vào một bài tập để xem cử động.'],
    },
  },
  rest: {
    anim: 'rest',
    en: {
      title: '1. Resting jaw',
      text: 'Most of the day, your teeth should not touch. Let your jaw hang loose.' + cite(1, 9),
      steps: ['Close your lips gently.', 'Keep your teeth slightly apart.', 'Rest your tongue softly on the roof of your mouth.', 'Check this often during the day, such as when you notice you are clenching.'],
      evidence: 'Learning about TMD and caring for your jaw at home is strongly advised.' + cite(1) + ' Small trials found it helps; adding jaw moves may help a little more.' + cite(9, 10, 11),
    },
    ja: {
      title: '1. あごを{休|やす}める',
      text: '{一日|いちにち}の{大半|たいはん}は、{上|うえ}と{下|した}の{歯|は}は{触|ふ}れていないのが{普通|ふつう}です。あごの{力|ちから}を{抜|ぬ}きましょう。' + cite(1, 9),
      steps: ['{唇|くちびる}を{軽|かる}く{閉|と}じます。', '{上|うえ}と{下|した}の{歯|は}を{少|すこ}し{離|はな}します。', '{舌|した}を{上|うわ}あごに{軽|かる}くつけます。', '{歯|は}をかみしめていると{気|き}づいたときなど、{一日|いちにち}に{何度|なんど}も{確|たし}かめます。'],
      evidence: '{顎関節症|がくかんせつしょう}について{知|し}り、{家|いえ}であごをいたわることは{強|つよ}く{勧|すす}められています。' + cite(1) + '{小|ちい}さな{試験|しけん}で{効果|こうか}が{見|み}られ、{運動|うんどう}を{加|くわ}えるとさらに{少|すこ}し{役立|やくだ}つ{可能性|かのうせい}があります。' + cite(9, 10, 11),
    },
    vi: {
      title: '1. Hàm nghỉ',
      text: 'Phần lớn thời gian trong ngày, răng trên và răng dưới không nên chạm nhau. Hãy để hàm thả lỏng.' + cite(1, 9),
      steps: ['Khép môi nhẹ nhàng.', 'Để hai hàm răng hơi hở.', 'Đặt lưỡi nhẹ lên vòm miệng.', 'Kiểm tra điều này nhiều lần trong ngày, ví dụ khi bạn nhận ra mình đang nghiến chặt răng.'],
      evidence: 'Hiểu về TMD và tự chăm sóc hàm tại nhà được khuyến cáo mạnh.' + cite(1) + ' Các thử nghiệm nhỏ cho thấy có ích; thêm bài tập có thể giúp thêm một chút.' + cite(9, 10, 11),
    },
  },
  'tongue-up-opening': {
    anim: 'tongue-up-opening',
    en: {
      title: '2. Tongue-up opening',
      text: 'This move trains your jaw to open smoothly and in a straight line.' + cite(7),
      steps: ['Put the tip of your tongue on the roof of your mouth, just behind your top front teeth.', 'Keep it there and open your mouth slowly, as far as you can without pain.', 'Close slowly.', 'You can use a mirror to check that your jaw opens straight.'],
      evidence: 'We are not very sure. A review found 5 small trials where moves like this helped pain and movement.' + cite(7) + ' Your dentist or physio will tell you how many times to do it.',
    },
    ja: {
      title: '2. {舌|した}を{上|うえ}にして{開|あ}ける',
      text: 'あごがまっすぐ、なめらかに{開|ひら}くように{練習|れんしゅう}する{運動|うんどう}です。' + cite(7),
      steps: ['{舌|した}の{先|さき}を、{上|うえ}の{前歯|まえば}のすぐ{後|うし}ろの{上|うわ}あごにつけます。', 'そのまま、{痛|いた}くないところまで、ゆっくり{口|くち}を{開|あ}けます。', 'ゆっくり{閉|と}じます。', '{鏡|かがみ}を{見|み}て、あごがまっすぐ{開|ひら}くか{確|たし}かめてもよいでしょう。'],
      evidence: '{根拠|こんきょ}は{弱|よわ}いです。5つの{小|ちい}さな{試験|しけん}で、このような{運動|うんどう}が{痛|いた}みと{動|うご}きに{役立|やくだ}ちました。' + cite(7) + '{回数|かいすう}は{歯科医師|しかいし}や{理学療法士|りがくりょうほうし}が{教|おし}えます。',
    },
    vi: {
      title: '2. Há miệng lưỡi chạm vòm',
      text: 'Bài tập này giúp hàm há ra êm và thẳng.' + cite(7),
      steps: ['Đặt đầu lưỡi lên vòm miệng, ngay sau răng cửa trên.', 'Giữ lưỡi ở đó và há miệng từ từ, đến mức không đau.', 'Ngậm lại từ từ.', 'Bạn có thể nhìn gương để xem hàm có há thẳng không.'],
      evidence: 'Bằng chứng còn yếu: một tổng quan tìm thấy 5 thử nghiệm nhỏ, trong đó các bài tập như thế này giúp giảm đau và cử động tốt hơn.' + cite(7) + ' Nha sĩ hoặc nhà vật lý trị liệu sẽ cho bạn biết tập bao nhiêu lần.',
    },
  },
  'opening-stretch': {
    anim: 'opening-stretch',
    en: {
      title: '3. Opening stretch',
      text: 'This stretch helps the chewing muscles relax and lets you open wider. Watch the jaw joint slide forward as the mouth opens wide.' + cite(1, 4, 12),
      steps: ['Sit up straight and relax your shoulders.', 'Open your mouth slowly until you feel a gentle stretch in your cheeks.', 'Hold for a few seconds, then close slowly.', 'Stop if the pain gets sharp or worse.'],
      evidence: 'Jaw moves and stretches, taught by a dentist or physio, are strongly advised.' + cite(1, 2) + ' In 16 trials, jaw moves eased pain and helped people open wider. Most trials were small, so we cannot be sure how much.' + cite(4, 5),
    },
    ja: {
      title: '3. {口|くち}を{開|あ}けるストレッチ',
      text: 'かむ{筋肉|きんにく}の{緊張|きんちょう}をほぐし、{口|くち}を{大|おお}きく{開|あ}けやすくするストレッチです。{大|おお}きく{開|あ}けると、あごの{関節|かんせつ}が{前|まえ}へすべる{様子|ようす}が{見|み}えます。' + cite(1, 4, 12),
      steps: ['{背|せ}すじを{伸|の}ばし、{肩|かた}の{力|ちから}を{抜|ぬ}きます。', 'ほおが{軽|かる}く{伸|の}びると{感|かん}じるところまで、ゆっくり{口|くち}を{開|あ}けます。', '{数秒|すうびょう}{止|と}めてから、ゆっくり{閉|と}じます。', '{痛|いた}みが{鋭|するど}くなったり{強|つよ}くなったりしたら、やめます。'],
      evidence: '{歯科医師|しかいし}や{理学療法士|りがくりょうほうし}が{教|おし}えるあごの{運動|うんどう}とストレッチは、{強|つよ}く{勧|すす}められています。' + cite(1, 2) + '16の{試験|しけん}で、{運動|うんどう}により{痛|いた}みが{和|やわ}らぎ、{口|くち}が{大|おお}きく{開|あ}くようになりました。{小|ちい}さな{試験|しけん}が{多|おお}く、どのくらい{効|き}くかははっきりしません。' + cite(4, 5),
    },
    vi: {
      title: '3. Há miệng kéo giãn',
      text: 'Bài kéo giãn này giúp cơ nhai thư giãn và giúp bạn há miệng rộng hơn. Hãy xem khớp hàm trượt ra trước khi há miệng rộng.' + cite(1, 4, 12),
      steps: ['Ngồi thẳng và thả lỏng vai.', 'Há miệng từ từ đến khi thấy má căng nhẹ.', 'Giữ vài giây, rồi ngậm lại từ từ.', 'Dừng lại nếu đau nhói hoặc đau hơn.'],
      evidence: 'Bài tập và kéo giãn hàm do nha sĩ hoặc nhà vật lý trị liệu hướng dẫn được khuyến cáo mạnh.' + cite(1, 2) + ' Trong 16 thử nghiệm, bài tập giúp giảm đau và há miệng rộng hơn. Phần lớn thử nghiệm nhỏ, nên chưa chắc chắn giúp được bao nhiêu.' + cite(4, 5),
    },
  },
  'side-to-side': {
    anim: 'side-to-side',
    en: {
      title: '4. Side to side',
      text: 'This move takes the jaw gently to each side.' + cite(7, 8),
      steps: ['Let your teeth part a little.', 'Slide your lower jaw slowly to one side, as far as feels OK.', 'Come back to the middle, then slide to the other side.'],
      evidence: 'We are not very sure. This move is part of plans that helped in small trials. No trial has tested it on its own.' + cite(7, 8),
    },
    ja: {
      title: '4. {左右|さゆう}に{動|うご}かす',
      text: 'あごをやさしく{左右|さゆう}に{動|うご}かす{運動|うんどう}です。' + cite(7, 8),
      steps: ['{上|うえ}と{下|した}の{歯|は}を{少|すこ}し{離|はな}します。', '{楽|らく}なところまで、{下|した}あごをゆっくり{片側|かたがわ}へずらします。', '{真|ま}ん{中|なか}に{戻|もど}し、{反対側|はんたいがわ}へずらします。'],
      evidence: '{根拠|こんきょ}は{弱|よわ}いです。{小|ちい}さな{試験|しけん}で{役立|やくだ}った{運動|うんどう}の{一部|いちぶ}ですが、この{動|うご}きだけを{調|しら}べた{試験|しけん}はありません。' + cite(7, 8),
    },
    vi: {
      title: '4. Sang hai bên',
      text: 'Bài tập này đưa hàm nhẹ nhàng sang từng bên.' + cite(7, 8),
      steps: ['Để hai hàm răng hở một chút.', 'Trượt hàm dưới từ từ sang một bên, đến mức thấy thoải mái.', 'Đưa về giữa, rồi trượt sang bên kia.'],
      evidence: 'Bằng chứng còn yếu: cử động này là một phần của các chương trình tập đã giúp ích trong các thử nghiệm nhỏ, nhưng chưa có thử nghiệm nào kiểm tra riêng nó.' + cite(7, 8),
    },
  },
  forward: {
    anim: 'forward',
    en: {
      title: '5. Jaw forward',
      text: 'This move slides the lower jaw gently forward.' + cite(7, 8),
      steps: ['Let your teeth part a little.', 'Slide your lower jaw slowly forward, as far as feels OK.', 'Slide it back slowly.'],
      evidence: 'We are not very sure. This move is part of plans that helped in small trials. No trial has tested it on its own.' + cite(7, 8),
    },
    ja: {
      title: '5. あごを{前|まえ}へ',
      text: '{下|した}あごをやさしく{前|まえ}へずらす{運動|うんどう}です。' + cite(7, 8),
      steps: ['{上|うえ}と{下|した}の{歯|は}を{少|すこ}し{離|はな}します。', '{楽|らく}なところまで、{下|した}あごをゆっくり{前|まえ}へずらします。', 'ゆっくり{元|もと}に{戻|もど}します。'],
      evidence: '{根拠|こんきょ}は{弱|よわ}いです。{小|ちい}さな{試験|しけん}で{役立|やくだ}った{運動|うんどう}の{一部|いちぶ}ですが、この{動|うご}きだけを{調|しら}べた{試験|しけん}はありません。' + cite(7, 8),
    },
    vi: {
      title: '5. Đưa hàm ra trước',
      text: 'Bài tập này trượt hàm dưới nhẹ nhàng ra trước.' + cite(7, 8),
      steps: ['Để hai hàm răng hở một chút.', 'Trượt hàm dưới từ từ ra trước, đến mức thấy thoải mái.', 'Trượt về lại từ từ.'],
      evidence: 'Bằng chứng còn yếu: cử động này là một phần của các chương trình tập đã giúp ích trong các thử nghiệm nhỏ, nhưng chưa có thử nghiệm nào kiểm tra riêng nó.' + cite(7, 8),
    },
  },
};
const UI = {
  en: { how: 'How to do it', evidence: 'How sure are we?', pause: 'Pause', play: 'Play', alt: 'Animated 3D model of the skull and lower jaw with the jaw joints and chewing muscles: ' },
  ja: { how: 'やり{方|かた}', evidence: '{根拠|こんきょ}はどのくらい{確|たし}かですか', pause: '{一時停止|いちじていし}', play: '{再生|さいせい}', alt: 'あごの{関節|かんせつ}とかむ{筋肉|きんにく}がついた{頭|あたま}の{骨|ほね}と{下|した}あごの3Dモデル：' },
  vi: { how: 'Cách tập', evidence: 'Bằng chứng tốt đến mức nào?', pause: 'Tạm dừng', play: 'Phát', alt: 'Mô hình 3D có hoạt hình của hộp sọ và hàm dưới với khớp hàm và cơ nhai: ' },
};

const stageButtons = document.querySelectorAll('[data-stage]');
const caption = document.getElementById('stage');
const playBtn = document.getElementById('play');
const slowBtn = document.getElementById('slow');
const viewButtons = document.querySelectorAll('[data-orbit]');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (still) mv.setAttribute('interaction-prompt', 'none');
let stage = 'anatomy';
const on = b => b.getAttribute('aria-pressed') === 'true';
// People who ask for less motion start paused; they can press Play.
if (still) playBtn.setAttribute('aria-pressed', 'false');

function render() {
  const s = STAGES[stage][LANG()];
  const ui = UI[LANG()];
  mv.alt = plain(ui.alt + s.title + '. ' + s.text);
  let h = '<h2>' + ruby(s.title) + '</h2><p>' + ruby(s.text) + '</p>';
  if (s.steps) h += (STAGES[stage].still ? '<ul>' : '<h3>' + ruby(ui.how) + '</h3><ol>') + s.steps.map(t => '<li>' + ruby(t) + '</li>').join('') + (STAGES[stage].still ? '</ul>' : '</ol>');
  if (s.evidence) h += '<p class="evidence"><b>' + ruby(ui.evidence) + '</b> ' + ruby(s.evidence) + '</p>';
  caption.innerHTML = h;
  stageButtons.forEach(b => b.setAttribute('aria-pressed', b.dataset.stage === stage));
  playBtn.innerHTML = ruby(on(playBtn) ? ui.pause : ui.play);
  playBtn.hidden = !!STAGES[stage].still;
  slowBtn.hidden = !!STAGES[stage].still;
}
function playState() {
  if (!mv.loaded) return;
  const st = STAGES[stage];
  if (mv.animationName !== st.anim) { mv.animationName = st.anim; mv.currentTime = 0; }
  mv.timeScale = on(slowBtn) ? 0.5 : 1;
  if (st.still || !on(playBtn)) { mv.pause(); if (st.still) mv.currentTime = 0; } else mv.play();
}
function show() {
  render();
  playState();
  try { history.replaceState(null, '', stage === 'anatomy' ? location.pathname : '#' + stage); } catch { /* ignore */ }
}
mv.addEventListener('load', playState);

stageButtons.forEach(b => b.addEventListener('click', () => { stage = b.dataset.stage; mv.currentTime = 0; show(); }));
playBtn.addEventListener('click', () => { playBtn.setAttribute('aria-pressed', !on(playBtn)); render(); playState(); });
slowBtn.addEventListener('click', () => { slowBtn.setAttribute('aria-pressed', !on(slowBtn)); playState(); });

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
if (STAGES[start]) stage = start;
buildLangs();
showTheme();
show();
