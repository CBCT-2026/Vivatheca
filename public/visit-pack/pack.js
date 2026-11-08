// Visit pack page (/visit-pack, app/visit-pack/page.tsx). Lays out the views saved by public/share-tools.js
// ("Add view to visit pack" and the chairside pen) from sessionStorage, which only this browser tab can read
// and which is deleted when the tab closes. Nothing is sent anywhere. Shows the take-home text, QR code and
// disclaimers for each model in the pack, and prints the sheet (or saves it as a PDF) with the browser.
(function () {
  const root = document.getElementById('vt-visit-pack');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = '1';
  const KEY = 'vivatheca-visit-pack';
  const MAX = Number(root.dataset.max) || 4;
  const words = JSON.parse(root.dataset.text || '{}');
  const titles = JSON.parse(root.dataset.titles || '{}');
  const fill = (s, v) => s.replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
  const read = () => { try { const v = JSON.parse(sessionStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v.filter((x) => x && titles[x.slug] && /^data:image\/jpeg;base64,/.test(x.img)) : []; } catch (e) { return []; } };
  const save = (pack) => { try { if (pack.length) sessionStorage.setItem(KEY, JSON.stringify(pack)); else sessionStorage.removeItem(KEY); } catch (e) { /* storage blocked */ } };
  const sheet = root.querySelector('.vp-sheet');
  const list = root.querySelector('.vp-pictures');
  let qrReady = null;
  const qrLib = () => (qrReady ||= new Promise((res, rej) => { const s = document.createElement('script'); s.src = '/vendor/qrcode-generator/qrcode.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); }));

  function render() {
    const pack = read().slice(0, MAX);
    const has = pack.length > 0;
    root.querySelector('.vp-empty').hidden = has;
    root.querySelector('.vp-controls').hidden = !has;
    sheet.hidden = !has;
    root.querySelector('.vp-count').textContent = fill(words.count, { n: pack.length, max: MAX });
    list.className = 'vp-pictures vp-n' + pack.length;
    list.replaceChildren(...pack.map((item, i) => {
      const li = document.createElement('li');
      const img = document.createElement('img');
      img.src = item.img;
      img.alt = '';
      const cap = document.createElement('p');
      cap.className = 'vp-caption';
      cap.textContent = (i + 1) + '. ' + (item.label || titles[item.slug]) + (item.drawn ? ' · ' + words.drawn : '');
      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'vp-remove';
      rm.textContent = fill(words.remove, { n: i + 1 });
      rm.onclick = () => { const p = read(); p.splice(i, 1); save(p); render(); const next = root.querySelector('.vp-remove') || root.querySelector('.vp-empty a'); if (next) next.focus(); };
      li.append(img, cap, rm);
      return li;
    }));
    const slugs = [...new Set(pack.map((x) => x.slug))];
    root.querySelectorAll('[data-vp-model]').forEach((s) => { s.hidden = !slugs.includes(s.dataset.vpModel); });
    // QR code to the model page on this site (vivatheca.com in production).
    if (has) qrLib().then(() => {
      slugs.forEach((slug) => {
        const box = root.querySelector('[data-vp-qr="' + slug + '"] .vp-qr-code');
        const item = pack.find((x) => x.slug === slug);
        if (!box || !item || box.dataset.done) return;
        const qr = window.qrcode(0, 'M'); qr.addData(location.origin + item.href); qr.make();
        box.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true, alt: words.qrAlt });
        box.dataset.done = '1';
      });
    }).catch(() => {});
  }

  root.querySelector('.vp-print').onclick = () => window.print();
  root.querySelector('.vp-clear').onclick = () => { save([]); render(); root.querySelector('.vp-empty a').focus(); };
  render();
})();
