// Shared top bar for the static model pages under /public, so they match the rest of the site
// (app/site-chrome.tsx PageHeader + app/nav.ts). Load it straight after </header class="bar">:
//   <link rel="stylesheet" href="/site-header.css">  (in <head>)
//   <script src="/site-header.js"></script>          (right after </header>)
// It keeps the page's own #theme button and #langs box (their scripts still find them by id)
// and turns the page's "Vivatheca home / All models / ..." links into a breadcrumb row.
// Keep the links and labels in step with app/nav.ts and app/i18n/dictionaries (nav.*).
(function () {
  const header = document.querySelector('header.bar');
  if (!header || header.classList.contains('vt-header')) return;
  const cookie = (n) => (document.cookie.match('(?:^|; )' + n + '=([^;]*)') || [])[1];
  const ja = cookie('vivatheca-lang') === 'ja';
  const vi = cookie('vivatheca-lang') === 'vi';
  const furigana = cookie('vivatheca-furigana') !== 'off';
  // {漢字|かな} marks furigana, as in the dictionaries.
  const ruby = (s) => s.replace(/\{([^|}]+)\|([^}]+)\}/g, (_, k, r) => (furigana ? '<ruby>' + k + '<rp aria-hidden="true">(</rp><rt aria-hidden="true">' + r + '</rt><rp aria-hidden="true">)</rp></ruby>' : k));
  const L = ja
    ? { howItWorks: '{使|つか}い{方|かた}', models: '{模型|もけい}コレクション', evidence: '{根拠|こんきょ}', create: '{資料|しりょう}{作成|さくせい}', students: '{学生|がくせい}の{方|かた}へ', about: 'Vivathecaについて', search: '検索', tryViewer: '3Dビューアーを{試|ため}す', report: '{誤|あやま}りを{報告|ほうこく}', contact: 'お{問|と}い{合|あ}わせ', primary: 'メインナビゲーション', open: 'メニューを開く', close: 'メニューを閉じる', crumbs: '現在地' }
    : vi ? { howItWorks: 'Cách sử dụng', models: 'Bộ sưu tập mô hình', evidence: 'Bằng chứng', create: 'Soạn', students: 'Sinh viên', about: 'Giới thiệu', search: 'Tìm kiếm', tryViewer: 'Dùng thử trình xem 3D', report: 'Báo lỗi', contact: 'Liên hệ', primary: 'Điều hướng chính', open: 'Mở menu', close: 'Đóng menu', crumbs: 'Vị trí hiện tại' }
    : { howItWorks: 'How it works', models: 'Model collection', evidence: 'Evidence', create: 'Create', students: 'Students', about: 'About', search: 'Search', tryViewer: 'Try the 3D viewer', report: 'Report an inaccuracy', contact: 'Contact us', primary: 'Primary navigation', open: 'Open navigation', close: 'Close navigation', crumbs: 'You are here' };
  const primary = [
    ['/#how-it-works', L.howItWorks], ['/models', L.models], ['/#publications', L.evidence],
    ['/create', L.create], ['/learn', L.students], ['/about', L.about],
  ];
  const link = ([href, label]) => '<a href="' + href + '">' + ruby(label) + '</a>';

  const brand = header.querySelector('.brand-home');
  const theme = document.getElementById('theme');
  const langs = document.getElementById('langs');
  const crumbLinks = [...header.querySelectorAll('.bar-left a.lang')];

  const nav = document.createElement('nav');
  nav.className = 'vt-nav';
  nav.setAttribute('aria-label', L.primary);
  nav.innerHTML = primary.map(link).join('');

  const actions = document.createElement('div');
  actions.className = 'vt-actions';
  const search = document.createElement('a');
  search.className = 'search-link'; search.href = '/search'; search.setAttribute('aria-label', L.search); search.title = L.search;
  search.innerHTML = '<img src="/icons/search.svg" alt="" width="22" height="22">';
  actions.append(search);
  if (langs) actions.append(langs);
  if (theme) actions.append(theme);

  const menu = document.createElement('div');
  menu.className = 'vt-menu';
  menu.innerHTML = '<button class="vt-menu-button" type="button" aria-expanded="false" aria-label="' + L.open + '"><img src="/icons/menu.svg" alt="" width="24" height="24"></button>'
    + '<nav class="vt-menu-panel" aria-label="' + L.primary + '" hidden>' + primary.map(link).join('')
    + link(['/#collection', L.tryViewer]) + link(['/report', L.report]) + link(['#contact', L.contact]) + '</nav>';
  actions.append(menu);
  const button = menu.querySelector('button');
  const panel = menu.querySelector('.vt-menu-panel');
  const setOpen = (open) => {
    panel.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? L.close : L.open);
    button.querySelector('img').src = open ? '/icons/close.svg' : '/icons/menu.svg';
  };
  button.addEventListener('click', () => setOpen(panel.hidden));
  panel.addEventListener('click', (e) => {
    if (!e.target.closest('a[href="#contact"]')) return;
    // The contact footer is added by /contact.js or copied by hand, so find it when clicked.
    const target = document.querySelector('#contact, footer.vt-contact, footer.contact');
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    setOpen(false);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { setOpen(false); button.focus(); } });

  // Breadcrumb: Vivatheca home › All models › (section), from the page's own links.
  const crumbs = document.createElement('nav');
  crumbs.className = 'vt-crumbs';
  crumbs.setAttribute('aria-label', L.crumbs);
  crumbLinks.forEach((a) => { a.classList.remove('lang'); crumbs.append(a); });

  header.className = 'bar vt-header';
  header.textContent = '';
  if (brand) {
    brand.removeAttribute('style');
    const img = brand.querySelector('img');
    if (img) { img.removeAttribute('style'); img.width = 181; img.height = 136; }
    header.append(brand);
  }
  header.append(nav, actions);
  if (crumbLinks.length) header.append(crumbs);

  // Language menu: a button showing the current language and its flag (only the flag on
  // phones) opens a list of every language in its own name followed by its flag, ordered
  // alphabetically by English name. The page's own script fills #langs with English / 日本語
  // buttons (and, in Japanese, a furigana switch); this moves them into the list, adds the
  // languages not translated yet, and runs again whenever a page rebuilds the box.
  // Keep in step with languageMenu in app/i18n/config.ts and LanguageSwitcher in app/i18n/switcher.tsx.
  const LANGUAGE_MENU = [
    { tag: 'zh-Hans', name: '中文', flag: 'cn' },
    { tag: 'en', name: 'English', flag: 'gb' },
    { tag: 'ja', name: '日本語', flag: 'jp' },
    { tag: 'vi', name: 'Tiếng Việt', flag: 'vn' },
  ];
  const flag = (code) => '<img class="vt-flag" src="/flags/' + code + '.svg" width="20" height="15" alt="" aria-hidden="true">';
  let closeMenu = () => {};
  const buildMenu = () => {
    const own = [...langs.children];
    const byLang = (tag) => own.find((b) => b.tagName === 'BUTTON' && b.lang === tag);
    if (!byLang('en')) return; // not filled yet, or already built
    const currentTag = (own.find((b) => b.lang && b.getAttribute('aria-pressed') === 'true') || byLang('en')).lang;
    const current = LANGUAGE_MENU.find((item) => item.tag === currentTag);
    // Some pages switch language without a reload, so take the labels from the current choice.
    const inJa = currentTag === 'ja';
    const inVi = currentTag === 'vi';
    const soon = inJa ? '準備中' : inVi ? 'Sắp ra mắt' : 'Coming soon';
    const langLabel = inJa ? '言語' : inVi ? 'Ngôn ngữ' : 'Language';
    const menu = document.createElement('div');
    menu.className = 'vt-lang-menu';
    menu.innerHTML = '<button type="button" class="vt-lang-trigger" aria-expanded="false" aria-controls="vt-lang-panel" aria-label="' + langLabel + ': ' + current.name + '">'
      + '<span class="vt-full" lang="' + current.tag + '">' + current.name + '</span>' + flag(current.flag) + '<span class="vt-chevron" aria-hidden="true"></span></button>'
      + '<ul class="vt-lang-panel" id="vt-lang-panel" hidden></ul>';
    const trigger = menu.querySelector('button');
    const panel = menu.querySelector('ul');
    LANGUAGE_MENU.forEach((item) => {
      let b = byLang(item.tag);
      if (b) {
        b.setAttribute('aria-label', item.name);
        b.removeAttribute('aria-pressed');
        if (item.tag === currentTag) b.setAttribute('aria-current', 'true');
        b.innerHTML = '<span class="vt-name">' + item.name + '</span>' + flag(item.flag);
        b.addEventListener('click', () => closeMenu());
      } else {
        // Not translated yet: listed so visitors know it is planned, but it does nothing.
        b = document.createElement('button');
        b.type = 'button'; b.lang = item.tag; b.className = 'vt-soon';
        b.setAttribute('aria-disabled', 'true');
        b.innerHTML = '<span class="vt-name">' + item.name + '</span>' + flag(item.flag) + '<span class="vt-soon-note" lang="' + (inJa ? 'ja' : inVi ? 'vi' : 'en') + '">' + (inJa ? ruby('{準備中|じゅんびちゅう}') : soon) + '</span>';
      }
      const li = document.createElement('li');
      li.append(b);
      panel.append(li);
    });
    const setMenu = (open) => { panel.hidden = !open; trigger.setAttribute('aria-expanded', String(open)); };
    closeMenu = () => setMenu(false);
    trigger.addEventListener('click', () => setMenu(panel.hidden));
    const rest = own.filter((b) => !LANGUAGE_MENU.some((item) => item.tag === b.lang)); // the furigana switch
    langs.replaceChildren(menu, ...rest);
  };
  if (langs) {
    new MutationObserver(buildMenu).observe(langs, { childList: true });
    buildMenu();
    document.addEventListener('pointerdown', (e) => { if (!e.target.closest('.vt-lang-menu')) closeMenu(); });
    document.addEventListener('keydown', (e) => {
      const trigger = langs.querySelector('.vt-lang-trigger');
      if (e.key === 'Escape' && trigger && trigger.getAttribute('aria-expanded') === 'true') { closeMenu(); trigger.focus(); }
    });
  }
})();
