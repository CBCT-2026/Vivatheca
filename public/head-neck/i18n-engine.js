// Language engine shared by the head and neck condition pages. Each page defines window.VIVA_JA (its Japanese text) first.
// It reads the same cookie as the rest of the site (vivatheca-lang, see app/i18n/config.ts).
// English is the text in index.html; Japanese replaces every [data-i18n] element.
// {漢字|かんじ} marks furigana; {cite:N} becomes a citation link to source N.
(function () {
  const YEAR = 60 * 60 * 24 * 365;
  const cookie = (name) => (document.cookie.match('(?:^|; )' + name + '=([^;]*)') || [])[1];
  const lang = cookie('vivatheca-lang') === 'ja' ? 'ja' : 'en';
  const furigana = cookie('vivatheca-furigana') !== 'off';
  const ruby = (s) => s.replace(/\{([^{}|]+)\|([^{}]+)\}/g,
    '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');
  const plain = (s) => s.replace(/\{([^{}|]+)\|([^{}]+)\}/g, '$1');
  const cite = (n) => '<sup class="cite"><a href="#ref-' + n + '">' + n + '</a></sup>';

  const ja = window.VIVA_JA || {};
  for (const k in ja) ja[k] = ja[k].replace(/\{cite:(\d+)\}/g, (_, n) => cite(n));

  const ui = { en: { label: 'Language', furigana: 'Furigana' }, ja: { label: '言語', furigana: 'ふりがな' } };

  window.VIVA_I18N = {
    lang,
    // Text for a key in the visitor's language, or null to keep the English in the page.
    text: (key, values) => {
      if (lang !== 'ja' || !(key in ja)) return null;
      let s = ja[key];
      for (const k in values || {}) s = s.replace('{' + k + '}', values[k]);
      return s;
    },
    ruby,
    plain,
  };

  if (lang === 'ja') {
    document.documentElement.lang = 'ja';
    document.title = plain(ja.title);
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = plain(ja.description);
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const s = ja[el.dataset.i18n];
      if (s) el.innerHTML = ruby(s);
    });
    document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
      const s = ja[el.dataset.i18nAlt];
      if (s) el.alt = plain(s);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const s = ja[el.dataset.i18nAria];
      if (s) el.setAttribute('aria-label', plain(s));
    });
  }
  document.documentElement.dataset.furigana = furigana ? 'on' : 'off';

  // Language switcher in the top bar.
  const box = document.getElementById('langs');
  if (!box) return;
  box.setAttribute('aria-label', ui[lang].label);
  const set = (name, value) => { document.cookie = name + '=' + value + '; path=/; max-age=' + YEAR + '; samesite=lax'; };
  [['en', 'English'], ['ja', '日本語']].forEach(([code, name]) => {
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
    f.textContent = ui.ja.furigana;
    f.setAttribute('aria-pressed', String(furigana));
    f.addEventListener('click', () => {
      const on = f.getAttribute('aria-pressed') !== 'true';
      set('vivatheca-furigana', on ? 'on' : 'off');
      document.documentElement.dataset.furigana = on ? 'on' : 'off';
      f.setAttribute('aria-pressed', String(on));
    });
    box.append(f);
  }
})();
