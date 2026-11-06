// Patient sheet: theme, language switcher (same cookies as the site) and print. Shares its code with viewer.js.
const html = document.documentElement;
const LANG = () => (html.lang === 'ja' || html.lang === 'vi' ? html.lang : 'en');
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
      buildLangs(); showTheme();
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

document.getElementById('print').addEventListener('click', () => window.print());
buildLangs();
showTheme();
