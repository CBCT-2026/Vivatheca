// Vietnamese for the static pages that keep English and Japanese side by side in the HTML
// (<span lang="en">…</span><span lang="ja">…</span>: cracked tooth, oroantral, stainless steel crown).
// When the page is in Vietnamese (<html lang="vi">, set from the 'vivatheca-lang' cookie), each
// lang="en" element whose English is in the page's vi.js (window.VT_VI_PAGE.html) is replaced with
// the Vietnamese and marked lang="vi". Elements without a translation stay in English.
(function () {
  const page = window.VT_VI_PAGE;
  if (!page || document.documentElement.lang !== 'vi') return;
  if (page.title) document.title = page.title;
  const meta = document.querySelector('meta[name="description"]');
  if (meta && page.description) meta.content = page.description;
  const map = page.html || {};
  document.querySelectorAll('body [lang="en"]').forEach((el) => {
    if (el.closest('#langs')) return;
    const vi = map[el.innerHTML.trim()];
    if (vi) { el.innerHTML = vi; el.lang = 'vi'; }
  });
})();
