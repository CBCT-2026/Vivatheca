// "Take the model apart" panel for the static model pages (the same tools as the CBCT-2026/ABG viewer).
// For every <model-viewer> it adds, under the page's own controls:
// - a soft tissue button (gum or lining slides away: it fades out, and comes back the same way);
// - a button for each removable part (braces, crowns, plates, baby teeth, bone ...), to hide or show it.
// The three.js head and neck viewers (#viewer) take part through an adapter they set on the element
// (el.vtParts = { names(), hide(name, hidden), soft: [names] }) and a 'vt-parts' event after each change.
// Parts are found by material (model-viewer) or node (three.js) name; only the names listed in PARTS get a
// button, so parts that a page already controls (x-ray, margins, removed bone, ghosts) stay with the page.
(function () {
  const doc = document;
  const cookie = (name) => (doc.cookie.match('(?:^|; )' + name + '=([^;]*)') || [])[1];
  const JA = cookie('vivatheca-lang') === 'ja';
  const VI = cookie('vivatheca-lang') === 'vi';
  const ruby = (s) => s.replace(/\{([^{}|]+)\|([^{}]+)\}/g, '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');
  const plain = (s) => s.replace(/\{([^{}|]+)\|[^{}]+\}/g, '$1');
  const say = (pair) => ruby(JA ? pair[1] : VI ? pair[2] : pair[0]);

  const TEXT = {
    heading: ['Take the model apart', '{模型|もけい}を{分|わ}けて{見|み}る', 'Tách các phần của mô hình'],
    hint: ['Tap a part to hide it. Tap it again to put it back.', '{部分|ぶぶん}を{押|お}すと{消|き}えます。もう{一度|いちど}{押|お}すと{戻|もど}ります。', 'Chạm vào một phần để ẩn nó. Chạm lần nữa để hiện lại.'],
    group: ['Parts of the model', '{模型|もけい}の{部分|ぶぶん}', 'Các phần của mô hình'],
    all: ['Show all parts', 'すべて{表示|ひょうじ}', 'Hiện tất cả các phần'],
    gumOff: ['Take off the gum', '{歯|は}ぐきを{外|はず}す', 'Ẩn lợi'],
    gumOn: ['Put the gum back', '{歯|は}ぐきを{戻|もど}す', 'Hiện lại lợi'],
    softOff: ['Take off the soft tissue', 'やわらかい{組織|そしき}を{外|はず}す', 'Ẩn mô mềm'],
    softOn: ['Put the soft tissue back', 'やわらかい{組織|そしき}を{戻|もど}す', 'Hiện lại mô mềm'],
    liningOff: ['Take off the lining', '{粘膜|ねんまく}を{外|はず}す', 'Ẩn niêm mạc'],
    liningOn: ['Put the lining back', '{粘膜|ねんまく}を{戻|もど}す', 'Hiện lại niêm mạc'],
  };
  // Soft tissue: one button takes all of it off. Order decides the button's words.
  const SOFT = [[/^gum$/, 'gum'], [/^(mucosa|mucosa_kept)$/, 'lining'], [/^soft$/, 'soft']];
  // Removable parts: [name pattern, English, Japanese, Vietnamese]. Names not listed here get no button.
  const PARTS = [
    [/^braces$/, 'Braces', '{矯正|きょうせい}{装置|そうち}', 'Mắc cài'],
    [/^steel$/, 'Steel crown', '{金属|きんぞく}のかぶせ{物|もの}', 'Mão thép'],
    [/^cement$/, 'Cement (glue)', 'セメント（{接着材|せっちゃくざい}）', 'Xi măng (keo dán)'],
    [/^crown$/, 'Crown', 'かぶせ{物|もの}', 'Mão răng'],
    [/^filling$/, 'Filling', '{詰|つ}め{物|もの}', 'Miếng trám'],
    [/^(plate|titanium)$/, 'Titanium plate and screws', 'チタンのプレートとネジ', 'Nẹp và vít titan'],
    [/^screw$/, 'Screws', 'ネジ', 'Vít'],
    [/^fibula$/, 'Fibula (leg bone graft)', 'ひ{骨|こつ}（すねの{骨|ほね}の{移植|いしょく}）', 'Xương mác (mảnh ghép xương cẳng chân)'],
    [/^free_flap$/, 'Free flap', '{遊離|ゆうり}{皮弁|ひべん}', 'Vạt tự do'],
    [/^prf$/, 'PRF (from the patient’s own blood)', 'PRF（{自分|じぶん}の{血液|けつえき}から{作|つく}る）', 'PRF (từ máu của chính bệnh nhân)'],
    [/^cover_plate$/, 'Clear cover plate', '{透明|とうめい}な{保護|ほご}{板|ばん}', 'Tấm che trong suốt'],
    [/^dressing$/, 'Dressing paste', '{傷|きず}を{守|まも}るパック', 'Băng phủ vết thương'],
    [/^flap$/, 'Flap', '{弁|べん}', 'Vạt'],
    [/^fat$/, 'Cheek fat pad', '{頬|ほお}の{脂肪|しぼう}', 'Khối mỡ má'],
    [/^clot$/, 'Blood clot', '{血|ち}のかたまり', 'Cục máu đông'],
    [/^decay$/, 'Decay', 'むし{歯|ば}', 'Sâu răng'],
    [/^baby-teeth$/, 'Baby teeth', '{乳歯|にゅうし}', 'Răng sữa'],
    [/^premolar$/, 'Adult tooth growing below', '{下|した}で{育|そだ}つ{大人|おとな}の{歯|は}', 'Răng vĩnh viễn đang mọc bên dưới'],
    [/^teeth$/, 'Teeth', '{歯|は}', 'Răng'],
    [/^pulp$/, 'Nerve (pulp)', '{歯|は}の{神経|しんけい}', 'Tủy răng (dây thần kinh)'],
    [/^sinus$/, 'Sinus', '{上顎洞|じょうがくどう}', 'Xoang'],
    [/^denture$/, 'Denture', '{入|い}れ{歯|ば}', 'Hàm giả'],
    [/^implant$/, 'Implants', 'インプラント', 'Trụ implant'],
    [/^tract$/, 'Drainage channel (sinus tract)', 'うみの{出口|でぐち}', 'Đường rò'],
    [/^lesion$/, 'Disease', '{病変|びょうへん}', 'Tổn thương'],
    [/^masseter$/, 'Masseter (cheek chewing muscle)', '{咬筋|こうきん}（ほおのかむ{筋肉|きんにく}）', 'Cơ cắn (cơ nhai ở má)'],
    [/^temporalis$/, 'Temporalis (temple chewing muscle)', '{側頭筋|そくとうきん}（こめかみの{筋肉|きんにく}）', 'Cơ thái dương'],
    [/^lateral_pterygoid$/, 'Lateral pterygoid (pulls the jaw forward)', '{外側翼突筋|がいそくよくとつきん}（あごを{前|まえ}に{引|ひ}く）', 'Cơ chân bướm ngoài (kéo hàm ra trước)'],
    [/^medial_pterygoid$/, 'Medial pterygoid (inner chewing muscle)', '{内側翼突筋|ないそくよくとつきん}（{内側|うちがわ}のかむ{筋肉|きんにく}）', 'Cơ chân bướm trong (cơ nhai phía trong)'],
    [/^disc$/, 'Jaw joint disc', '{関節円板|かんせつえんばん}', 'Đĩa khớp hàm'],
    [/^skull$/, 'Skull', '{頭|ず}{蓋|がい}{骨|こつ}', 'Hộp sọ'],
    [/^bone$/, 'Bone', '{骨|ほね}', 'Xương'],
  ];
  const base = (n) => (n || '').replace(/[._]\d+$/, '');
  const softKind = (n) => { const s = SOFT.find(([re]) => re.test(n)); return s ? s[1] : null; };
  const partOf = (n) => PARTS.find(([re]) => re.test(n));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const style = doc.createElement('style');
  style.textContent = [
    '.vt-parts{margin:14px 0 0;padding:12px 14px;border:1px solid var(--line,#cfe1e7);border-radius:14px;text-align:left}',
    '.vt-parts h2{margin:0 0 4px;font-size:16px;color:var(--heading,#00244d)}',
    '.vt-parts p{margin:0 0 8px;font-size:14px;color:var(--muted,var(--text,#4b5d6b))}',
    '.vt-parts .vt-row{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 0}',
    '.vt-parts button{min-height:44px;padding:8px 14px;border-radius:999px;border:1px solid var(--line,#cfe1e7);background:var(--bg,#fff);color:var(--text,#06233f);font:inherit;font-size:15px;cursor:pointer;display:inline-flex;align-items:center;gap:8px}',
    '.vt-parts button[aria-pressed="true"]{border-color:var(--accent,#007f8b);color:var(--accent,#007f8b);font-weight:600}',
    '.vt-parts button.vt-part[aria-pressed="false"]{opacity:.65;text-decoration:line-through}',
    '.vt-parts button:focus-visible{outline:3px solid var(--accent,#007f8b);outline-offset:2px}',
    '.vt-parts button:disabled{opacity:.5;cursor:default}',
    '.vt-parts .vt-dot{width:12px;height:12px;border-radius:50%;border:1px solid rgba(0,0,0,.25);flex:none}',
    '.vt-parts .vt-soft{border-color:var(--accent,#007f8b)}',
    '.vt-parts .vt-label{font-size:13px;font-weight:600;color:var(--muted,#4b5d6b);margin:10px 0 0;width:100%}',
  ].join('');
  doc.head.appendChild(style);

  // Where the panel goes: after the viewer's own button groups, so the page's main choices stay first.
  function place(viewer, panel) {
    let after = viewer;
    let next = viewer.nextElementSibling;
    while (next && (next.matches('.controls, .stages, .choose, .ages, .phase, .stages-head, p.small, p.status, .legend, #legend, .hint') || next.getAttribute('role') === 'group')) {
      after = next; next = next.nextElementSibling;
    }
    after.insertAdjacentElement('afterend', panel);
  }

  function build(viewer, adapter) {
    const panel = doc.createElement('section');
    panel.className = 'vt-parts';
    panel.setAttribute('aria-label', plain(JA ? TEXT.heading[1] : TEXT.heading[0]));
    place(viewer, panel);
    const hidden = new Set();
    let softOff = false;
    let busy = false;

    function render() {
      const names = adapter.names();
      const soft = names.filter(softKind);
      const parts = [];
      names.forEach((n) => { const p = partOf(n); if (p && !softKind(n) && !parts.some((q) => q[0] === p)) parts.push(p); });
      panel.hidden = !soft.length && !parts.length;
      if (panel.hidden) { panel.innerHTML = ''; return; }
      let html = '<h2>' + say(TEXT.heading) + '</h2><p>' + say(TEXT.hint) + '</p>';
      if (soft.length) {
        const kind = softKind(soft[0]);
        const words = kind === 'gum' ? [TEXT.gumOff, TEXT.gumOn] : kind === 'lining' ? [TEXT.liningOff, TEXT.liningOn] : [TEXT.softOff, TEXT.softOn];
        html += '<div class="vt-row"><button type="button" class="vt-soft" aria-pressed="' + softOff + '">' + say(softOff ? words[1] : words[0]) + '</button></div>';
      }
      if (parts.length) {
        html += '<div class="vt-row" role="group" aria-label="' + plain(JA ? TEXT.group[1] : VI ? TEXT.group[2] : TEXT.group[0]) + '">' +
          parts.map((p) => {
            const key = p[0].source;
            const on = !hidden.has(key);
            const colour = adapter.colour ? adapter.colour(names.find((n) => p[0].test(n))) : '';
            return '<button type="button" class="vt-part" data-key="' + key.replace(/"/g, '&quot;') + '" aria-pressed="' + on + '">' +
              (colour ? '<span class="vt-dot" aria-hidden="true" style="background:' + colour + '"></span>' : '') + ruby(JA ? p[2] : VI ? p[3] : p[1]) + '</button>';
          }).join('') +
          (hidden.size ? '<button type="button" class="vt-all">' + say(TEXT.all) + '</button>' : '') + '</div>';
      }
      panel.innerHTML = html;
      const softBtn = panel.querySelector('.vt-soft');
      if (softBtn) softBtn.addEventListener('click', async () => {
        if (busy) return; busy = true; softBtn.disabled = true;
        softOff = !softOff;
        await adapter.hide(soft, softOff, true);
        busy = false; render(); const b = panel.querySelector('.vt-soft'); if (b) b.focus();
      });
      panel.querySelectorAll('.vt-part').forEach((b) => b.addEventListener('click', async () => {
        const key = b.dataset.key, re = new RegExp(key);
        const off = !hidden.has(key);
        if (off) hidden.add(key); else hidden.delete(key);
        await adapter.hide(adapter.names().filter((n) => re.test(n)), off, false);
        render(); const again = panel.querySelector('.vt-part[data-key="' + CSS.escape(key) + '"]'); if (again) again.focus();
      }));
      const all = panel.querySelector('.vt-all');
      if (all) all.addEventListener('click', async () => {
        const names = adapter.names().filter((n) => [...hidden].some((k) => new RegExp(k).test(n)));
        hidden.clear();
        await adapter.hide(names, false, false);
        render(); const first = panel.querySelector('.vt-part'); if (first) first.focus();
      });
    }
    // What should be hidden right now (used after the page swaps or changes the model).
    adapter.isHidden = (n) => (softOff && !!softKind(n)) || [...hidden].some((k) => new RegExp(k).test(n));
    // For links to a view (/share-tools.js): read and rebuild which parts are off.
    viewer.vtPartsState = {
      get: () => ({ h: [...hidden], s: softOff }),
      set: async (st) => {
        const want = new Set(st.h || []);
        for (const key of [...hidden]) if (!want.has(key)) { const b = panel.querySelector('.vt-part[data-key="' + CSS.escape(key) + '"]'); if (b) { b.click(); await new Promise((r) => setTimeout(r, 40)); } }
        for (const key of want) if (!hidden.has(key)) { const b = panel.querySelector('.vt-part[data-key="' + CSS.escape(key) + '"]'); if (b) { b.click(); await new Promise((r) => setTimeout(r, 40)); } }
        if (!!st.s !== softOff) { const b = panel.querySelector('.vt-soft'); if (b) { b.click(); await new Promise((r) => setTimeout(r, 600)); } }
      },
    };
    return { render };
  }

  // model-viewer: parts are materials. Hiding sets the material's alpha to 0 (as in CBCT-2026/ABG site.js)
  // and remembers the alpha the page had set, so an x-ray or see-through view comes back as it was.
  function modelViewer(mv) {
    const saved = new Map();
    const mats = () => (mv.model ? mv.model.materials : []);
    const byName = (n) => mats().filter((m) => base(m.name) === n);
    const alphaOf = (m) => m.pbrMetallicRoughness.baseColorFactor[3];
    const setAlpha = (m, a, mode) => { const c = m.pbrMetallicRoughness.baseColorFactor.slice(0, 3); m.setAlphaMode(mode); m.pbrMetallicRoughness.setBaseColorFactor([...c, a]); };
    const adapter = {
      names: () => [...new Set(mats().map((m) => base(m.name)))],
      colour: (n) => {
        const m = byName(n)[0]; if (!m) return '';
        const c = m.pbrMetallicRoughness.baseColorFactor.slice(0, 3).map((v) => Math.round(255 * Math.pow(Math.max(0, Math.min(1, v)), 1 / 2.2)));
        return 'rgb(' + c.join(',') + ')';
      },
      hide(names, off, animate) {
        const list = names.flatMap(byName);
        if (!off) {
          return fade(list, (m) => (saved.get(m) || { a: 1 }).a, animate).then(() => list.forEach((m) => { const s = saved.get(m) || { a: 1, mode: 'OPAQUE' }; setAlpha(m, s.a, s.mode); saved.delete(m); }));
        }
        list.forEach((m) => { if (!saved.has(m) || alphaOf(m) > 0) saved.set(m, { a: alphaOf(m) || 1, mode: m.getAlphaMode ? m.getAlphaMode() : (alphaOf(m) < 1 ? 'BLEND' : 'OPAQUE') }); });
        return fade(list, () => 0, animate);
      },
    };
    function fade(list, to, animate) {
      if (!list.length) return Promise.resolve();
      const from = list.map(alphaOf), goal = list.map(to);
      list.forEach((m, i) => setAlpha(m, from[i], 'BLEND'));
      const ms = animate && !reduce ? 450 : 1;
      return new Promise((res) => { const t0 = performance.now();
        (function step(now) { const k = Math.min(1, (now - t0) / ms);
          list.forEach((m, i) => setAlpha(m, from[i] + (goal[i] - from[i]) * k, 'BLEND'));
          if (k < 1) requestAnimationFrame(step); else res(); })(t0); });
    }
    const ui = build(mv, adapter);
    // Re-apply hidden parts after a new model loads and after the page's own buttons change materials.
    const reapply = () => {
      if (!adapter.isHidden) return;
      saved.forEach((_, m) => { if (!mats().includes(m)) saved.delete(m); });
      mats().forEach((m) => {
        if (!adapter.isHidden(base(m.name))) return;
        if (alphaOf(m) > 0) saved.set(m, { a: alphaOf(m), mode: m.getAlphaMode ? m.getAlphaMode() : 'OPAQUE' });
        setAlpha(m, 0, 'BLEND');
      });
    };
    mv.addEventListener('load', () => { saved.clear(); setTimeout(() => { reapply(); ui.render(); }, 60); });
    doc.addEventListener('click', (e) => {
      const b = e.target.closest && e.target.closest('button');
      if (!b || b.closest('.vt-parts')) return;
      setTimeout(reapply, 30); setTimeout(reapply, 700);
    });
    if (mv.loaded) ui.render();
  }

  // three.js viewers set el.vtParts and fire 'vt-parts' whenever the parts on show change.
  function threeViewer(el) {
    const a = el.vtParts;
    const ui = build(el, {
      names: a.names, colour: a.colour,
      hide: (names, off) => { names.forEach((n) => a.hide(n, off)); return Promise.resolve(); },
    });
    el.addEventListener('vt-parts', ui.render);
    ui.render();
  }

  function init() {
    doc.querySelectorAll('model-viewer').forEach(modelViewer);
    const three = doc.getElementById('viewer');
    if (three) {
      if (three.vtParts) threeViewer(three);
      else three.addEventListener('vt-parts', function once() { three.removeEventListener('vt-parts', once); if (!three.dataset.vtParts) { three.dataset.vtParts = '1'; threeViewer(three); } });
    }
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();
