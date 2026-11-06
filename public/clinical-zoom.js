// Zoomable clinical images with labels you can switch on and off.
// Any <img data-labels="/path/to/labels.json"> inside a figure gets an "Explore with labels" button.
// The button opens a dialog with an OpenSeadragon viewer (BSD-3) and Annotorious (BSD-3) shapes
// drawn from the JSON; the vendor scripts load only when the dialog is first opened.
//
// labels.json: { "labels": [ { "id": "fibula", "rect": [x, y, w, h] (image pixels),
//                              "en": "text", "ja": "{漢字|かんじ} text", "source": "where this label comes from" } ] }
// Every label must come from the source figure's legend or the cited article, never from guesswork.
(function () {
  const cookie = (name) => (document.cookie.match('(?:^|; )' + name + '=([^;]*)') || [])[1];
  const lang = ['ja', 'vi'].includes(cookie('vivatheca-lang')) ? cookie('vivatheca-lang') : 'en';
  const furigana = cookie('vivatheca-furigana') !== 'off';
  const ruby = (s) => furigana
    ? s.replace(/\{([^{}|]+)\|([^{}]+)\}/g, '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>')
    : s.replace(/\{([^{}|]+)\|([^{}]+)\}/g, '$1');
  const UI = {
    en: { open: 'Explore with labels', close: 'Close', labels: 'Labels', show: 'Show labels', zoomIn: 'Zoom in', zoomOut: 'Zoom out', reset: 'Fit to screen', hint: 'Drag to move, scroll or pinch to zoom. Click a label to go to it.', source: 'Label source' },
    ja: { open: '{拡大|かくだい}して{説明|せつめい}を{見|み}る', close: '{閉|と}じる', labels: '{説明|せつめい}', show: '{説明|せつめい}を{表示|ひょうじ}', zoomIn: '{拡大|かくだい}', zoomOut: '{縮小|しゅくしょう}', reset: '{全体|ぜんたい}を{表示|ひょうじ}', hint: 'ドラッグで{移動|いどう}、スクロールやピンチで{拡大|かくだい}。{説明|せつめい}をクリックするとその{場所|ばしょ}に{移動|いどう}します。', source: '{説明|せつめい}の{出典|しゅってん}' },
    vi: { open: 'Phóng to và xem nhãn', close: 'Đóng', labels: 'Nhãn', show: 'Hiện nhãn', zoomIn: 'Phóng to', zoomOut: 'Thu nhỏ', reset: 'Vừa màn hình', hint: 'Kéo để di chuyển, cuộn hoặc chụm để phóng to. Bấm vào một nhãn để đến vị trí đó.', source: 'Nguồn của nhãn' },
  }[lang];
  const t = (k) => ruby(UI[k]);

  let vendorReady = null;
  const loadVendor = () => vendorReady || (vendorReady = new Promise((resolve, reject) => {
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = '/vendor/annotorious/annotorious-openseadragon.css'; document.head.append(css);
    const add = (src) => new Promise((ok, fail) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = fail; document.head.append(s); });
    add('/vendor/openseadragon/openseadragon.min.js').then(() => add('/vendor/annotorious/annotorious-openseadragon.js')).then(resolve, reject);
  }));

  async function open(img) {
    const data = await fetch(img.dataset.labels).then((r) => r.json());
    await loadVendor();
    const dialog = document.createElement('dialog');
    dialog.className = 'clinical-zoom';
    dialog.innerHTML = `
      <div class="cz-head"><strong class="cz-title"></strong>
        <label class="cz-toggle"><input type="checkbox" checked> ${t('show')}</label>
        <button type="button" class="cz-close">${t('close')}</button></div>
      <div class="cz-body">
        <div class="cz-viewer" role="img"></div>
        <aside class="cz-side"><h3>${t('labels')}</h3><ol class="cz-list"></ol><p class="cz-hint">${t('hint')}</p>
          <div class="cz-zoom"><button type="button" data-zoom="in" aria-label="${UI.zoomIn.replace(/\{([^{}|]+)\|[^{}]+\}/g, '$1')}">+</button><button type="button" data-zoom="out" aria-label="${UI.zoomOut.replace(/\{([^{}|]+)\|[^{}]+\}/g, '$1')}">−</button><button type="button" data-zoom="reset">${t('reset')}</button></div></aside>
      </div>`;
    dialog.querySelector('.cz-title').textContent = img.closest('figure')?.querySelector('figcaption b, figcaption strong')?.textContent || img.alt;
    document.body.append(dialog);
    dialog.showModal();

    const viewer = OpenSeadragon({
      element: dialog.querySelector('.cz-viewer'),
      tileSources: { type: 'image', url: img.currentSrc || img.src },
      showNavigationControl: false, gestureSettingsMouse: { clickToZoom: false }, gestureSettingsTouch: { clickToZoom: false },
      minZoomImageRatio: 0.8, maxZoomPixelRatio: 4, visibilityRatio: 0.6, animationTime: 0.6,
    });
    const anno = AnnotoriousOSD.createOSDAnnotator(viewer, {
      drawingEnabled: false,
      style: { fill: '#14c9d7', fillOpacity: 0.12, stroke: '#14c9d7', strokeOpacity: 1, strokeWidth: 2 },
    });
    const W = img.naturalWidth || Number(img.getAttribute('width'));
    // Annotorious v3 internal format (a rectangle in image pixels with its bounds).
    const annotations = data.labels.map((l) => {
      const [x, y, w, h] = l.rect;
      return {
        id: l.id,
        bodies: [{ id: l.id + '-body', annotation: l.id, purpose: 'commenting', value: l[lang] || l.en }],
        target: { annotation: l.id, selector: { type: 'RECTANGLE', geometry: { x, y, w, h, bounds: { minX: x, minY: y, maxX: x + w, maxY: y + h } } } },
      };
    });
    viewer.addOnceHandler('open', () => {
      anno.setAnnotations(annotations);
      // Numbered badges at the top-left corner of each shape, so the list and the image match.
      data.labels.forEach((l, i) => {
        const el = document.createElement('span'); el.className = 'cz-badge'; el.textContent = String(i + 1);
        viewer.addOverlay({ element: el, location: new OpenSeadragon.Point(l.rect[0] / W, l.rect[1] / W), placement: 'BOTTOM_LEFT' });
      });
    });
    const list = dialog.querySelector('.cz-list');
    data.labels.forEach((l, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<button type="button"><span class="cz-badge">${i + 1}</span> ${ruby(l[lang] || l.en)}</button>` + (l.source ? `<small>${t('source')}: ${ruby(l.source)}</small>` : '');
      li.querySelector('button').addEventListener('click', () => {
        const [x, y, w, h] = l.rect;
        viewer.viewport.fitBounds(new OpenSeadragon.Rect((x - w * 0.5) / W, (y - h * 0.5) / W, (w * 2) / W, (h * 2) / W));
        anno.setSelected(l.id);
        list.querySelectorAll('li').forEach((n) => n.classList.toggle('active', n === li));
      });
      list.append(li);
    });
    anno.on('clickAnnotation', (a) => { list.querySelectorAll('li').forEach((n, i) => n.classList.toggle('active', data.labels[i].id === a.id)); });
    const setVisible = (on) => { anno.setVisible(on); dialog.querySelectorAll('.cz-viewer .cz-badge').forEach((b) => { b.style.display = on ? '' : 'none'; }); };
    dialog.querySelector('.cz-toggle input').addEventListener('change', (e) => setVisible(e.target.checked));
    dialog.querySelector('[data-zoom="in"]').addEventListener('click', () => viewer.viewport.zoomBy(1.5));
    dialog.querySelector('[data-zoom="out"]').addEventListener('click', () => viewer.viewport.zoomBy(1 / 1.5));
    dialog.querySelector('[data-zoom="reset"]').addEventListener('click', () => viewer.viewport.goHome());
    const close = () => { dialog.close(); };
    dialog.querySelector('.cz-close').addEventListener('click', close);
    dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
    dialog.vivaAnno = anno; dialog.vivaViewer = viewer; // for tests and debugging
    dialog.addEventListener('close', () => { anno.destroy(); viewer.destroy(); dialog.remove(); });
  }

  document.querySelectorAll('img[data-labels]').forEach((img) => {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'cz-open'; btn.innerHTML = t('open');
    btn.addEventListener('click', () => open(img).catch((err) => { console.error(err); btn.disabled = true; }));
    (img.closest('figure') || img.parentElement).insertBefore(btn, img.nextSibling);
  });
})();
