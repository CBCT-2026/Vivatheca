// Contact footer for the static model pages under /public. Keep in step with app/contact.ts
// (the app's single config). When the Instagram/X handles are known, fill them in below:
// an empty handle shows a button with no destination yet (Luke, 2026-11-06).
(function () {
  const contact = { email: 'vivatheca@gmail.com', instagram: '', x: '' };

  const text = {
    en: { h: 'Contact us', intro: 'Questions, corrections or ideas for a model? Follow Vivatheca or get in touch.', email: 'Email',
      site: 'Vivatheca is for general education only. It is not medical advice and must not be used for diagnosis, treatment planning or surgical guidance. Talk to a qualified health professional about your own health.', full: 'Full disclaimer' },
    ja: { h: 'お{問|と}い{合|あ}わせ', intro: '{模型|もけい}についてのご{質問|しつもん}、{誤|あやま}りのご{指摘|してき}、アイデアをお{待|ま}ちしています。Vivathecaをフォローするか、お{気軽|きがる}にご{連絡|れんらく}ください。', email: 'メール',
      site: 'Vivathecaは{一般的|いっぱんてき}な{教育|きょういく}のみを{目的|もくてき}としています。{医療上|いりょうじょう}の{助言|じょげん}ではなく、{診断|しんだん}、{治療|ちりょう}{計画|けいかく}、{手術|しゅじゅつ}ガイドには{使用|しよう}できません。ご{自身|じしん}の{健康|けんこう}については、{資格|しかく}のある{医療|いりょう}{専門家|せんもんか}にご{相談|そうだん}ください。', full: '{免責|めんせき}{事項|じこう}の{全文|ぜんぶん}' },
  };
  const ruby = (s) => s.replace(/\{([^{}|]+)\|([^{}]+)\}/g, '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');

  function render() {
    // Skip pages that already carry a hand-copied contact footer.
    if (document.querySelector('footer.vt-contact, footer.contact')) return;
    const t = text[document.documentElement.lang.startsWith('ja') ? 'ja' : 'en'];
    const item = (name, handle, href) => href
      ? '<li><a href="' + href + '"' + (href.startsWith('mailto:') ? '' : ' target="_blank" rel="noreferrer"') + '><b>' + name + '</b> <span>' + handle + '</span></a></li>'
      : '<li><a class="vt-pending" role="link" aria-disabled="true"><b>' + name + '</b></a></li>';
    const footer = document.createElement('footer');
    footer.className = 'vt-contact';
    footer.setAttribute('aria-labelledby', 'vt-contact-h');
    footer.innerHTML =
      '<h2 id="vt-contact-h">' + ruby(t.h) + '</h2><p>' + ruby(t.intro) + '</p><ul>' +
      item('Instagram', '@' + contact.instagram, contact.instagram && 'https://www.instagram.com/' + contact.instagram + '/') +
      item('X', '@' + contact.x, contact.x && 'https://x.com/' + contact.x) +
      item(ruby(t.email), contact.email, contact.email && 'mailto:' + contact.email) +
      '</ul><p class="vt-site">' + ruby(t.site) + ' <a href="/disclaimer">' + ruby(t.full) + '</a></p>';
    const style = document.createElement('style');
    style.textContent =
      '.vt-contact{max-width:720px;margin:0 auto;padding:24px 16px 40px;border-top:1px solid var(--line,#cfe1e7);color:var(--text,#06233f)}' +
      '.vt-contact h2{color:var(--heading,#00244d);font-size:1.15rem;margin:0 0 6px}' +
      '.vt-contact ul{list-style:none;margin:12px 0;padding:0;display:grid;gap:8px}' +
      '.vt-contact li>*{display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;min-height:48px;padding:8px 14px;border:1px solid var(--line,#cfe1e7);border-radius:12px;color:var(--accent,#007f8b);text-decoration:none}' +
      '.vt-contact b{color:var(--heading,#00244d)}' +
      '.vt-contact .vt-pending{cursor:default}' +
      '.vt-contact .vt-site{font-size:14px;color:var(--muted,#4d6378)}.vt-contact .vt-site a{color:var(--accent,#007f8b)}';
    document.head.appendChild(style);
    document.body.appendChild(footer);
  }
  // Japanese pages: say the translation is not yet reviewed (shown only while the page is in Japanese).
  const jaNote = 'この{日本語|にほんご}{訳|やく}は、まだ{日本語|にほんご}を{話|はな}す{歯科|しか}{医師|いし}の{確認|かくにん}を{受|う}けていません。{内容|ないよう}が{違|ちが}うときは、{英語|えいご}{版|ばん}が{正|ただ}しいものとします。';
  function translationNote() {
    const p = document.createElement('p');
    p.className = 'vt-translation-note';
    p.lang = 'ja';
    p.innerHTML = ruby(jaNote);
    p.style.cssText = 'max-width:720px;margin:0 auto;padding:0 16px 32px;font-size:14px;color:var(--muted,#4d6378)';
    const sync = () => { p.hidden = !document.documentElement.lang.startsWith('ja'); };
    sync();
    new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    document.body.appendChild(p);
  }
  function start() { render(); translationNote(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
