// Adds a "free full text" note beside each DOI link that has a legal free copy, from
// /oa-links.json (built by tools/citations/oa-links.mjs from Unpaywall). The DOI link stays the
// citation. When the free copy is the publisher's own page, the note just says it is free to read;
// otherwise it links to the copy (PubMed Central or a repository) and says which version it is.
// Loaded on every page: static pages via /model-page.js, app pages via app/layout.tsx.
(function () {
  if (window.__vtOaLinks) return;
  window.__vtOaLinks = true;
  const WORDS = {
    en: { free: 'free to read', full: 'free full text', accepted: 'accepted manuscript', title: 'Legal free copy found by Unpaywall' },
    ja: { free: '{無料|むりょう}で{読|よ}めます', full: '{無料|むりょう}の{全文|ぜんぶん}', accepted: '{採択|さいたく}{原稿|げんこう}', title: 'Unpaywallで{見|み}つかった{合法|ごうほう}な{無料|むりょう}{版|ばん}' },
  };
  const lang = (document.documentElement.lang || 'en').toLowerCase().startsWith('ja') ? 'ja' : 'en';
  const w = WORDS[lang];
  const ruby = (s) => s.replace(/\{([^{}|]+)\|([^{}]+)\}/g, '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');
  const plain = (s) => s.replace(/\{([^{}|]+)\|[^{}]+\}/g, '$1');
  const doiOf = (href) => {
    const m = /doi\.org\/(10\.\d{4,9}\/.+)$/i.exec(href || '');
    if (!m) return null;
    try { return decodeURIComponent(m[1]).replace(/[.,;:]+$/, '').toLowerCase(); } catch { return null; }
  };

  function apply(links) {
    for (const a of document.querySelectorAll('a[href*="doi.org/10."]')) {
      if (a.dataset.vtOa) continue;
      a.dataset.vtOa = '1';
      const doi = doiOf(a.getAttribute('href'));
      const hit = doi && links[doi];
      if (!hit) continue;
      const span = document.createElement('span');
      span.className = 'vt-oa';
      span.lang = lang === 'ja' ? 'ja' : 'en';
      const sameAsDoi = doiOf(hit.url) === doi;
      const label = sameAsDoi ? w.free : w.full + (hit.version === 'accepted' ? ', ' + w.accepted : '');
      if (sameAsDoi) {
        span.innerHTML = ' (' + ruby(label) + ')';
        span.title = plain(w.title);
      } else {
        const link = document.createElement('a');
        link.href = hit.url;
        link.rel = 'noopener';
        link.target = '_blank';
        link.title = plain(w.title);
        link.innerHTML = ruby(label);
        span.append(' (', link, ')');
      }
      a.after(span);
    }
  }

  let links = null;
  const run = () => links && apply(links);
  fetch('/oa-links.json', { credentials: 'same-origin' })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      links = (d && d.links) || {};
      run();
      // Sources lists that render later (tabs, language switches) get the note too.
      new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
    })
    .catch(() => {});
})();
