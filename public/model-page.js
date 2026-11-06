// Shared extras for the static model pages under /public (review 2026-11-06):
// - a skip link to the main content (the app pages already have one);
// - a "make patient information" link that opens /create with this model chosen;
// - 24 px tap targets for citation numbers.
// Model ids match modelBriefs in app/create/briefs.ts.
(function () {
  const models = {
    '/development/': 'development',
    '/periodontitis/': 'periodontitis',
    '/orthognathic/': 'orthognathic',
    '/oroantral/': 'oroantral',
    '/cracked-tooth/': 'cracked-tooth',
    '/stainless-steel-crown/': 'stainless-steel-crown',
    '/head-neck/scc/': 'head-neck-scc',
    '/head-neck/ameloblastoma/': 'head-neck-ameloblastoma',
    '/head-neck/okc/': 'head-neck-okc',
    '/head-neck/mec/': 'head-neck-mec',
  };
  // Pages with a student guide under /learn get a link to it if they do not have one yet.
  const guides = { '/periodontitis/': '/learn/periodontitis', '/cracked-tooth/': '/learn/cracked-tooth', '/development/': '/learn/development', '/orthognathic/': '/learn/orthognathic', '/oroantral/': '/learn/oroantral', '/stainless-steel-crown/': '/learn/steel-crown',
    '/head-neck/': '/learn/head-neck', '/head-neck/scc/': '/learn/head-neck', '/head-neck/ameloblastoma/': '/learn/head-neck', '/head-neck/okc/': '/learn/head-neck', '/head-neck/mec/': '/learn/head-neck' };
  const text = {
    en: { student: 'Studying dentistry or medicine?', guide: 'Read the student guide', skip: 'Skip to main content', lead: 'Making patient information?', link: 'Draft a leaflet or A4 sheet that uses this model’s labels' },
    ja: { student: '{歯学|しがく}・{医学|いがく}を{学|まな}んでいますか？', guide: '{学生|がくせい}{向|む}けガイドを{読|よ}む', skip: '{本文|ほんぶん}へ{移動|いどう}', lead: '{患者|かんじゃ}さん{向|む}けの{資料|しりょう}を{作|つく}りますか？', link: 'この{模型|もけい}のラベルに{合|あ}わせたリーフレットやA4{資料|しりょう}を{作|つく}る' },
    vi: { student: 'Bạn đang học nha khoa hoặc y khoa?', guide: 'Đọc hướng dẫn cho sinh viên', skip: 'Chuyển đến nội dung chính', lead: 'Bạn đang soạn thông tin cho bệnh nhân?', link: 'Soạn tờ thông tin hoặc tờ A4 dùng nhãn của mô hình này' },
  };
  const ruby = (s) => s.replace(/\{([^{}|]+)\|([^{}]+)\}/g, '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');
  const plain = (s) => s.replace(/\{([^{}|]+)\|[^{}]+\}/g, '$1');

  function render() {
    const t = text[document.documentElement.lang.slice(0, 2)] || text.en;
    const main = document.querySelector('main');
    const style = document.createElement('style');
    style.textContent =
      '.vt-skip{position:fixed;left:8px;top:-60px;z-index:10000;padding:10px 14px;border-radius:8px;background:#00244d;color:#fff;text-decoration:none;font-weight:600}' +
      // Fixed navy, not var(--heading): --heading is white in dark mode, which made the link white on white.
      '.vt-skip:focus{top:8px;outline:3px solid #14c9d7;outline-offset:2px}' +
      '.vt-create,.vt-guide{margin:12px 0 16px;padding:10px 14px;border:1px solid var(--line,#cfe1e7);border-radius:12px;font-size:15px;color:var(--text,#06233f)}' +
      // Inline (not inline-block) so justified text does not stretch the words before a wrapped link.
      '.vt-create a,.vt-guide a{color:var(--accent,#007f8b);font-weight:600;padding:3px 0}' +
      // Citation numbers were about 12 x 20 px on phones; give them a 24 x 24 px target (WCAG 2.5.8) without changing line spacing.
      'main sup{line-height:0}main sup a{display:inline-block;min-width:24px;min-height:24px;line-height:24px;text-align:center;vertical-align:middle}';
    document.head.appendChild(style);

    if (main && !document.querySelector('[class*="skip"]')) {
      if (!main.id) main.id = 'main-content';
      const skip = document.createElement('a');
      skip.className = 'vt-skip';
      skip.href = '#' + main.id;
      skip.textContent = plain(t.skip);
      document.body.prepend(skip);
    }

    const path = location.pathname.replace(/index\.html$/, '').replace(/\/?$/, '/');
    const guide = guides[path];
    if (guide && main && !main.querySelector('a[href^="/learn/"]')) {
      const g = document.createElement('p');
      g.className = 'vt-guide';
      g.innerHTML = ruby(t.student) + ' <a href="' + guide + '">' + ruby(t.guide) + ' \u2192</a>';
      const h = main.querySelector('h1');
      if (h) h.insertAdjacentElement('afterend', g);
    }

    const id = models[location.pathname.replace(/index\.html$/, '').replace(/\/?$/, '/')];
    const h1 = main && main.querySelector('h1');
    if (id && h1 && !document.querySelector('.vt-create')) {
      const p = document.createElement('p');
      p.className = 'vt-create';
      p.innerHTML = ruby(t.lead) + ' <a href="/create?model=' + id + '">' + ruby(t.link) + ' →</a>';
      // After the opening paragraph when there is one, so the page still starts with what the model shows.
      let after = h1;
      while (after.nextElementSibling && after.nextElementSibling.classList.contains('vt-guide')) after = after.nextElementSibling;
      const next = after.nextElementSibling;
      if (next && next.tagName === 'P') after = next;
      after.insertAdjacentElement('afterend', p);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();
