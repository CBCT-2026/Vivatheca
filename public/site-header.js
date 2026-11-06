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
  const furigana = cookie('vivatheca-furigana') !== 'off';
  // {漢字|かな} marks furigana, as in the dictionaries.
  const ruby = (s) => s.replace(/\{([^|}]+)\|([^}]+)\}/g, (_, k, r) => (furigana ? '<ruby>' + k + '<rp aria-hidden="true">(</rp><rt aria-hidden="true">' + r + '</rt><rp aria-hidden="true">)</rp></ruby>' : k));
  const L = ja
    ? { howItWorks: '{使|つか}い{方|かた}', models: '{模型|もけい}コレクション', evidence: '{根拠|こんきょ}', create: '{資料|しりょう}{作成|さくせい}', students: '{学生|がくせい}の{方|かた}へ', about: 'Vivathecaについて', search: '検索', tryViewer: '3Dビューアーを{試|ため}す', report: '{誤|あやま}りを{報告|ほうこく}', contact: 'お{問|と}い{合|あ}わせ', primary: 'メインナビゲーション', open: 'メニューを開く', close: 'メニューを閉じる', crumbs: '現在地' }
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

  // Short EN / 日本語 labels on phones, as on the rest of the site. The page fills #langs later.
  document.addEventListener('DOMContentLoaded', () => {
    const en = langs && langs.querySelector('button[lang="en"]');
    if (en && !en.querySelector('.vt-short')) en.innerHTML = '<span class="vt-full">English</span><span class="vt-short" aria-hidden="true">EN</span>';
  });
})();
