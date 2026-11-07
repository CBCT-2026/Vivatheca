// Shared extras for the static model pages under /public (review 2026-11-06):
// - a skip link to the main content (the app pages already have one);
// - a "make patient information" link that opens /create with this model chosen;
// - 24 px tap targets for citation numbers;
// - a star that adds the model to "My models" and, where the model has one, a "Show to a patient"
//   link to its full-screen show mode (/show?model=<slug>). Favourites live in this browser only,
//   in localStorage 'vivatheca-favourites' (a JSON list of catalogue slugs), shared with app/favourites.ts.
// Model ids match modelBriefs in app/create/briefs.ts.
(function () {
  const models = {
    '/development/': 'development',
    '/periodontitis/': 'periodontitis',
    '/orthognathic/': 'orthognathic',
    '/oroantral/': 'oroantral',
    '/cracked-tooth/': 'cracked-tooth',
    '/stainless-steel-crown/': 'stainless-steel-crown',
    '/endodontic/': 'endodontic',
    '/vpi/': 'vpi',
    '/prosthodontic/': 'prosthodontic',
    '/tmd/': 'tmd',
    '/dentigerous-cyst/': 'dentigerous-cyst',
    '/head-neck/scc/': 'head-neck-scc',
    '/head-neck/ameloblastoma/': 'head-neck-ameloblastoma',
    '/head-neck/okc/': 'head-neck-okc',
    '/head-neck/mec/': 'head-neck-mec',
  };
  // Catalogue slugs (app/models/catalogue.ts) for the star; true = has a show mode (app/show/models.ts).
  const slugs = {
    '/development/': ['dental-development', true], '/periodontitis/': ['periodontitis', true], '/orthognathic/': ['orthognathic', true],
    '/oroantral/': ['oroantral', true], '/cracked-tooth/': ['cracked-tooth', true], '/stainless-steel-crown/': ['stainless-steel-crown', true],
    '/endodontic/': ['endodontic', true], '/fixation/': ['fixation', true], '/head-neck/': ['head-neck', false],
    '/head-neck/scc/': ['head-neck-scc', false], '/head-neck/ameloblastoma/': ['head-neck-ameloblastoma', false],
    '/head-neck/okc/': ['head-neck-okc', false], '/head-neck/mec/': ['head-neck-mec', false],
    '/tmd/': ['tmd', false], '/prosthodontic/': ['prosthodontic', true],
  };
  const FAV_KEY = 'vivatheca-favourites';
  // Pages with a student guide under /learn get a link to it if they do not have one yet.
  const guides = { '/periodontitis/': '/learn/periodontitis', '/cracked-tooth/': '/learn/cracked-tooth', '/development/': '/learn/development', '/orthognathic/': '/learn/orthognathic', '/oroantral/': '/learn/oroantral', '/stainless-steel-crown/': '/learn/steel-crown',
    '/head-neck/': '/learn/head-neck', '/head-neck/scc/': '/learn/head-neck', '/head-neck/ameloblastoma/': '/learn/head-neck', '/head-neck/okc/': '/learn/head-neck', '/head-neck/mec/': '/learn/head-neck' };
  const text = {
    en: { student: 'Studying dentistry or medicine?', guide: 'Read the student guide', skip: 'Skip to main content', lead: 'Making patient information?', link: 'Draft a leaflet or A4 sheet that uses this model’s labels', show: 'Show to a patient', add: 'Add to My models', remove: 'Remove from My models' },
    ja: { student: '{歯学|しがく}・{医学|いがく}を{学|まな}んでいますか？', guide: '{学生|がくせい}{向|む}けガイドを{読|よ}む', skip: '{本文|ほんぶん}へ{移動|いどう}', lead: '{患者|かんじゃ}さん{向|む}けの{資料|しりょう}を{作|つく}りますか？', link: 'この{模型|もけい}のラベルに{合|あ}わせたリーフレットやA4{資料|しりょう}を{作|つく}る', show: '{患者|かんじゃ}さんに{見|み}せる', add: 'マイモデルに{追加|ついか}', remove: 'マイモデルから{外|はず}す' },
    vi: { student: 'Bạn đang học nha khoa hoặc y khoa?', guide: 'Đọc hướng dẫn cho sinh viên', skip: 'Chuyển đến nội dung chính', lead: 'Bạn đang soạn thông tin cho bệnh nhân?', link: 'Soạn tờ thông tin hoặc tờ A4 dùng nhãn của mô hình này', show: 'Cho bệnh nhân xem', add: 'Thêm vào Mô hình của tôi', remove: 'Bỏ khỏi Mô hình của tôi' },
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
      '.vt-show{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin:12px 0 16px}' +
      '.vt-show a{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:999px;background:var(--accent,#007f8b);color:var(--bg,#fff);font-weight:700;text-decoration:none}' +
      '.vt-show a:focus-visible,.vt-fav:focus-visible{outline:3px solid var(--accent,#007f8b);outline-offset:2px}' +
      '.vt-fav{display:inline-grid;place-items:center;width:44px;height:44px;border:1px solid var(--line,#cfe1e7);border-radius:50%;background:var(--card,#fff);color:var(--muted,#4d6378);cursor:pointer}' +
      '.vt-fav svg{fill:none;stroke:currentColor;stroke-width:1.8;stroke-linejoin:round}' +
      '.vt-fav[aria-pressed="true"]{border-color:#e4aa2b;color:#e4aa2b}.vt-fav[aria-pressed="true"] svg{fill:currentColor}' +
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

    const fav = slugs[path];
    if (fav && h1 && !document.querySelector('.vt-show')) {
      const read = () => { try { const l = JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; } };
      const box = document.createElement('div');
      box.className = 'vt-show';
      if (fav[1]) {
        const a = document.createElement('a');
        a.href = '/show?model=' + fav[0];
        a.innerHTML = ruby(t.show);
        box.appendChild(a);
      }
      const star = document.createElement('button');
      star.type = 'button';
      star.className = 'vt-fav';
      star.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>';
      const sync = () => {
        const on = read().includes(fav[0]);
        // A short name (not the model title), so it never clashes with the page's own stage buttons.
        const label = plain(on ? t.remove : t.add);
        star.setAttribute('aria-pressed', String(on));
        star.setAttribute('aria-label', label);
        star.title = label;
      };
      star.addEventListener('click', () => {
        const list = read();
        const next = list.includes(fav[0]) ? list.filter((x) => x !== fav[0]) : [fav[0]].concat(list);
        try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch (e) { /* private mode */ }
        sync();
      });
      window.addEventListener('storage', (e) => { if (e.key === FAV_KEY) sync(); });
      sync();
      box.appendChild(star);
      h1.insertAdjacentElement('afterend', box);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();
