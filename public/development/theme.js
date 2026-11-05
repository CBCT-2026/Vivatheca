// Light/dark toggle. Pages open in light mode unless the visitor chose dark; the choice is
// remembered in localStorage ('vivatheca-theme') and shared with the rest of the site.
// The button text names the mode it switches to, so it has no aria-pressed.
const themeBtn = document.getElementById('theme');
const isDark = () => document.documentElement.dataset.theme === 'dark';
const showTheme = () => {
  const k = isDark() ? 'light' : 'dark';
  const en = themeBtn.dataset[k], ja = themeBtn.dataset[k + 'Ja'];
  themeBtn.textContent = en;
  if (ja) { const s = document.createElement('span'); s.lang = 'ja'; s.textContent = ja; themeBtn.append(' / ', s); }
};
themeBtn.addEventListener('click', () => {
  const t = isDark() ? 'light' : 'dark';
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('vivatheca-theme', t); } catch (e) {}
  showTheme();
});
showTheme();
