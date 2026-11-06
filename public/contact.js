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
    vi: { h: 'Liên hệ', intro: 'Bạn có câu hỏi, góp ý sửa lỗi hoặc ý tưởng cho một mô hình? Hãy theo dõi Vivatheca hoặc liên hệ với chúng tôi.', email: 'Email',
      site: 'Vivatheca chỉ nhằm mục đích giáo dục chung. Đây không phải lời khuyên y khoa và không được dùng để chẩn đoán, lập kế hoạch điều trị hoặc hướng dẫn phẫu thuật. Hãy trao đổi với nhân viên y tế có chuyên môn về sức khỏe của chính bạn.', full: 'Toàn văn tuyên bố miễn trừ trách nhiệm' },
  };
  // Icons: copy of app/contact-icons.ts (official Instagram glyph, official X logo in black/white only,
  // generic envelope for email because Google does not allow the Gmail logo without permission).
  const iconPaths = {
    instagram: 'M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077',
    x: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
    email: 'M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 2v.4l8 5 8-5V7H4zm16 2.75-7.47 4.67a1 1 0 0 1-1.06 0L4 9.75V17h16V9.75z',
  };
  const icon = (id) => '<svg class="vt-ic vt-ic-' + id + '" aria-hidden="true" focusable="false" width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="' + iconPaths[id] + '"/></svg>';
  const ruby = (s) => s.replace(/\{([^{}|]+)\|([^{}]+)\}/g, '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');

  // Instagram glyph: one solid colour, clear space of half its size. X: black or white only.
  const iconCss =
    '.vt-ic{flex:none;width:30px;height:30px;margin-right:8px;color:#000}' +
    ':root[data-theme="dark"] .vt-ic{color:#fff}' +
    '.vt-ic-email{color:var(--accent,#007f8b)}:root[data-theme="dark"] .vt-ic-email{color:var(--accent,#14c9d7)}' +
    'footer.contact li>a{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px}';

  function render() {
    const style = document.createElement('style');
    style.textContent = iconCss;
    document.head.appendChild(style);
    // Pages with a hand-copied contact footer (Instagram, X, email in that order): add the icons only.
    const copied = document.querySelector('footer.contact');
    if (copied) {
      ['instagram', 'x', 'email'].forEach((id, i) => {
        const a = copied.querySelectorAll('ul > li > a')[i];
        if (a && !a.querySelector('.vt-ic')) a.insertAdjacentHTML('afterbegin', icon(id));
      });
      return;
    }
    if (document.querySelector('footer.vt-contact')) return;
    const t = text[document.documentElement.lang.slice(0, 2)] || text.en;
    const item = (id, name, handle, href) => href
      ? '<li><a href="' + href + '"' + (href.startsWith('mailto:') ? '' : ' target="_blank" rel="noreferrer"') + '>' + icon(id) + '<b>' + name + '</b> <span>' + handle + '</span></a></li>'
      : '<li><a class="vt-pending" role="link" aria-disabled="true">' + icon(id) + '<b>' + name + '</b></a></li>';
    const footer = document.createElement('footer');
    footer.className = 'vt-contact';
    footer.setAttribute('aria-labelledby', 'vt-contact-h');
    footer.innerHTML =
      '<h2 id="vt-contact-h">' + ruby(t.h) + '</h2><p>' + ruby(t.intro) + '</p><ul>' +
      item('instagram', 'Instagram', '@' + contact.instagram, contact.instagram && 'https://www.instagram.com/' + contact.instagram + '/') +
      item('x', 'X', '@' + contact.x, contact.x && 'https://x.com/' + contact.x) +
      item('email', ruby(t.email), contact.email, contact.email && 'mailto:' + contact.email) +
      '</ul><p class="vt-site">' + ruby(t.site) + ' <a href="/disclaimer">' + ruby(t.full) + '</a></p>';
    style.textContent += 
      '.vt-contact{max-width:720px;margin:0 auto;padding:24px 16px 40px;border-top:1px solid var(--line,#cfe1e7);color:var(--text,#06233f)}' +
      '.vt-contact h2{color:var(--heading,#00244d);font-size:1.15rem;margin:0 0 6px}' +
      '.vt-contact ul{list-style:none;margin:12px 0;padding:0;display:grid;gap:8px}' +
      '.vt-contact li>*{display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;min-height:48px;padding:8px 14px;border:1px solid var(--line,#cfe1e7);border-radius:12px;color:var(--accent,#007f8b);text-decoration:none}' +
      '.vt-contact b{color:var(--heading,#00244d)}' +
      '.vt-contact .vt-pending{cursor:default}' +
      '.vt-contact .vt-site{font-size:14px;color:var(--muted,#4d6378)}.vt-contact .vt-site a{color:var(--accent,#007f8b)}';
    document.body.appendChild(footer);
  }
  // Japanese and Vietnamese pages: say the translation is not yet reviewed (shown only in that language).
  const viNote = 'Bản tiếng Việt này là bản nháp do AI soạn và chưa được nhân viên y tế nói tiếng Việt thẩm định. Nếu có khác biệt, bản tiếng Anh là bản chính thức.';
  const jaNote = 'この{日本語|にほんご}{訳|やく}は、まだ{日本語|にほんご}を{話|はな}す{歯科|しか}{医師|いし}の{確認|かくにん}を{受|う}けていません。{内容|ないよう}が{違|ちが}うときは、{英語|えいご}{版|ばん}が{正|ただ}しいものとします。';
  function translationNote(lang, note) {
    const p = document.createElement('p');
    p.className = 'vt-translation-note';
    p.lang = lang;
    p.innerHTML = ruby(note);
    p.style.cssText = 'max-width:720px;margin:0 auto;padding:0 16px 32px;font-size:14px;color:var(--muted,#4d6378)';
    const sync = () => { p.hidden = !document.documentElement.lang.startsWith(lang); };
    sync();
    new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    document.body.appendChild(p);
  }
  function start() { render(); translationNote('ja', jaNote); translationNote('vi', viNote); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
