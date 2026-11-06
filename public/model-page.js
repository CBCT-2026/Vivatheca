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
  const text = {
    en: { skip: 'Skip to main content', lead: 'Making patient information?', link: 'Draft a leaflet or A4 sheet that uses this model’s labels' },
    ja: { skip: '{本文|ほんぶん}へ{移動|いどう}', lead: '{患者|かんじゃ}さん{向|む}けの{資料|しりょう}を{作|つく}りますか？', link: 'この{模型|もけい}のラベルに{合|あ}わせたリーフレットやA4{資料|しりょう}を{作|つく}る' },
  };
  const ruby = (s) => s.replace(/\{([^{}|]+)\|([^{}]+)\}/g, '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');
  const plain = (s) => s.replace(/\{([^{}|]+)\|[^{}]+\}/g, '$1');

  function render() {
    const t = text[document.documentElement.lang.startsWith('ja') ? 'ja' : 'en'];
    const main = document.querySelector('main');
    const style = document.createElement('style');
    style.textContent =
      '.vt-skip{position:absolute;left:8px;top:-60px;z-index:100;padding:10px 14px;border-radius:8px;background:var(--heading,#00244d);color:#fff;text-decoration:none}' +
      '.vt-skip:focus{top:8px}' +
      '.vt-create{margin:12px 0 16px;padding:10px 14px;border:1px solid var(--line,#cfe1e7);border-radius:12px;font-size:15px;color:var(--text,#06233f);text-align:left}' +
      '.vt-create a{color:var(--accent,#007f8b);font-weight:600;display:inline-block;min-height:24px}' +
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

    const id = models[location.pathname.replace(/index\.html$/, '').replace(/\/?$/, '/')];
    const h1 = main && main.querySelector('h1');
    if (id && h1 && !document.querySelector('.vt-create')) {
      const p = document.createElement('p');
      p.className = 'vt-create';
      p.innerHTML = ruby(t.lead) + ' <a href="/create?model=' + id + '">' + ruby(t.link) + ' →</a>';
      // After the opening paragraph when there is one, so the page still starts with what the model shows.
      let after = h1;
      const next = h1.nextElementSibling;
      if (next && next.tagName === 'P') after = next;
      after.insertAdjacentElement('afterend', p);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();
