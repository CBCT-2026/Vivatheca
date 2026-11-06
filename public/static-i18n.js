// Language for static model pages under /public (same idea as public/development/i18n.js).
// It reads the same cookies as the rest of the site ('vivatheca-lang', 'vivatheca-furigana',
// see app/i18n/config.ts). English is the text in index.html. Each page loads its own ja.js
// first, which sets window.VT_JA = { key: 'Japanese with {漢字|かんじ} furigana', ... }, and its vi.js,
// which sets window.VT_VI (Vietnamese, same keys, an unreviewed AI draft).
// In Japanese or Vietnamese, every [data-i18n] element's content, [data-i18n-aria] aria-label and
// [data-i18n-alt] alt text is replaced. Page scripts can call window.vtT(key, english).
(function () {
  const YEAR = 60 * 60 * 24 * 365;
  const html = document.documentElement;
  const cookie = (name) => (document.cookie.match('(?:^|; )' + name + '=([^;]*)') || [])[1];
  const chosen = cookie('vivatheca-lang');
  const lang = chosen === 'ja' || chosen === 'vi' ? chosen : 'en';
  const furigana = cookie('vivatheca-furigana') !== 'off';
  const ja = (lang === 'ja' ? window.VT_JA : lang === 'vi' ? window.VT_VI : null) || {};
  const ruby = (s) => s.replace(/\{([^{}|]+)\|([^{}]+)\}/g,
    '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');
  const plain = (s) => s.replace(/\{([^{}|]+)\|([^{}]+)\}/g, '$1').replace(/<[^>]+>/g, '');
  window.vtRuby = ruby;
  window.vtPlain = plain;
  // The page language's text (as HTML, with furigana in Japanese) when a translation exists.
  window.vtT = (key, english) => (lang !== 'en' && ja[key] ? ruby(ja[key]) : english);
  window.vtTPlain = (key, english) => (lang !== 'en' && ja[key] ? plain(ja[key]) : english);

  html.dataset.furigana = furigana ? 'on' : 'off';
  if (lang !== 'en') {
    html.lang = lang;
    if (ja.title) document.title = plain(ja.title);
    const meta = document.querySelector('meta[name="description"]');
    if (meta && ja.description) meta.content = plain(ja.description);
    document.querySelectorAll('[data-i18n]').forEach((el) => { const s = ja[el.dataset.i18n]; if (s) el.innerHTML = ruby(s); });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => { const s = ja[el.dataset.i18nAria]; if (s) el.setAttribute('aria-label', plain(s)); });
    document.querySelectorAll('[data-i18n-alt]').forEach((el) => { const s = ja[el.dataset.i18nAlt]; if (s) el.setAttribute('alt', plain(s)); });
  }

  // Language switcher in the top bar (an empty <div class="langs" id="langs">).
  const box = document.getElementById('langs');
  if (!box) return;
  box.setAttribute('aria-label', { ja: '言語', vi: 'Ngôn ngữ' }[lang] || 'Language');
  const set = (name, value) => { document.cookie = name + '=' + value + '; path=/; max-age=' + YEAR + '; samesite=lax'; };
  [['en', 'English'], ['ja', '日本語'], ['vi', 'Tiếng Việt']].forEach(([code, name]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.lang = code;
    b.textContent = name;
    b.setAttribute('aria-pressed', String(code === lang));
    b.addEventListener('click', () => { if (code !== lang) { set('vivatheca-lang', code); location.reload(); } });
    box.append(b);
  });
  if (lang === 'ja') {
    const f = document.createElement('button');
    f.type = 'button';
    f.textContent = 'ふりがな';
    f.title = '漢字の読みを表示・非表示';
    f.setAttribute('aria-pressed', String(furigana));
    f.addEventListener('click', () => {
      const on = f.getAttribute('aria-pressed') !== 'true';
      set('vivatheca-furigana', on ? 'on' : 'off');
      html.dataset.furigana = on ? 'on' : 'off';
      f.setAttribute('aria-pressed', String(on));
    });
    box.append(f);
  }
})();
