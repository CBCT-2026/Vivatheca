// Light/dark toggle. Pages open in light mode unless the visitor chose dark; the choice is
// remembered in localStorage ('vivatheca-theme') and shared with the rest of the site.
// The button text names the mode it switches to, so it has no aria-pressed.
const themeBtn = document.getElementById('theme');
const isDark = () => document.documentElement.dataset.theme === 'dark';
const showTheme = () => {
  const k = isDark() ? 'light' : 'dark';
  // In Japanese (i18n.js sets <html lang="ja">) the button shows the Japanese label.
  const ja = themeBtn.dataset[k + 'Ja'];
  themeBtn.textContent = document.documentElement.lang === 'ja' && ja ? ja : themeBtn.dataset[k];
};
themeBtn.addEventListener('click', () => {
  const t = isDark() ? 'light' : 'dark';
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('vivatheca-theme', t); } catch (e) {}
  showTheme();
});
showTheme();
