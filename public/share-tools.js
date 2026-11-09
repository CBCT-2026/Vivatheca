// "Use this model" panel for every model viewer (ideas borrowed from other services, 6 Nov 2026:
// audits/ideas-from-other-industries-2026-11-06.md in the project files).
// - Link to this view (BioDigital share links): the camera, the stage and the hidden parts go in ?view=,
//   with a QR code to print on a handout.
// - Save picture (BioDigital / Sketchfab screenshots): a PNG with the credit, licence, review status and
//   model disclaimer drawn under the model, so reuse carries them along.
// - Picture steps (IKEA's wordless instructions): every stage as a numbered picture, no words on the pictures.
// - Guided tour (Smithsonian Voyager tours, Sketchfab annotation autopilot): steps through the page's own
//   stages with Back and Next. It shows the page's own captions, so it adds no new health text.
// - Credit and citation (Wikimedia Commons attribution generator; Zenodo/Figshare "Cite as"): CC BY-SA 4.0 credit in
//   plain text, HTML or short form, and a citation of the exact version in Vancouver, APA, BibTeX or RIS.
// - Embed (Sketchfab / BioDigital embeds): ?embed=1 shows only the viewer, with the review status,
//   model disclaimer, licence and a link back. Works once the site has no password.
// - Counts views, downloads and uses per model for /impact (no cookies, nothing about the visitor).
// Static pages load this after /model-parts.js. React pages add <div data-vt-share data-vt-scope="selector">.
(function () {
  if (window.vtShareTools) return;
  window.vtShareTools = true;
  const doc = document;
  const cookie = (name) => (doc.cookie.match('(?:^|; )' + name + '=([^;]*)') || [])[1];
  const JA = (doc.documentElement.lang || '').startsWith('ja') || cookie('vivatheca-lang') === 'ja';
  const VI = !JA && ((doc.documentElement.lang || '').startsWith('vi') || cookie('vivatheca-lang') === 'vi');
  const ruby = (s) => s.replace(/\{([^{}|]+)\|([^{}]+)\}/g, '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');
  const plain = (s) => (s || '').replace(/\{([^{}|]+)\|[^{}]+\}/g, '$1');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const T = {
    heading: ['Use this model', 'この{模型|もけい}を{使|つか}う', 'Dùng mô hình này'],
    lead: ['Share this exact view, save a picture for a handout, or show it step by step. The credit and disclaimer go with it.', 'この{見|み}え{方|かた}を{共有|きょうゆう}したり、{資料|しりょう}{用|よう}の{画像|がぞう}を{保存|ほぞん}したり、{順番|じゅんばん}に{見|み}せたりできます。クレジットと{免責|めんせき}{事項|じこう}も{一緒|いっしょ}に{付|つ}きます。', 'Chia sẻ đúng góc nhìn này, lưu ảnh cho tờ hướng dẫn, hoặc trình bày từng bước. Ghi công và tuyên bố miễn trừ trách nhiệm đi kèm.'],
    link: ['Copy link to this view', 'この{表示|ひょうじ}へのリンクをコピー', 'Sao chép đường dẫn đến góc nhìn này'],
    linked: ['Link copied. It opens the same stage, angle and hidden parts.', 'リンクをコピーしました。{同|おな}じ{段階|だんかい}・{角度|かくど}・{隠|かく}した{部分|ぶぶん}で{開|ひら}きます。', 'Đã sao chép đường dẫn. Nó mở đúng giai đoạn, góc nhìn và các phần đã ẩn.'],
    linkShown: ['Copy this link:', 'このリンクをコピーしてください：', 'Sao chép đường dẫn này:'],
    qr: ['QR code', 'QRコード', 'Mã QR'],
    qrHide: ['Hide QR code', 'QRコードを{隠|かく}す', 'Ẩn mã QR'],
    qrSave: ['Save QR code (SVG)', 'QRコードを{保存|ほぞん}（SVG）', 'Lưu mã QR (SVG)'],
    qrAlt: ['QR code that opens this view of the model', 'この{模型|もけい}の{表示|ひょうじ}を{開|ひら}くQRコード', 'Mã QR mở góc nhìn này của mô hình'],
    picture: ['Save picture (PNG)', '{画像|がぞう}を{保存|ほぞん}（PNG）', 'Lưu ảnh (PNG)'],
    offline: ['Save for offline', 'オフライン{用|よう}に{保存|ほぞん}', 'Lưu để dùng ngoại tuyến'],
    offlineBusy: ['Saving this model on this device…', 'この{端末|たんまつ}に{保存|ほぞん}しています…', 'Đang lưu mô hình này trên thiết bị…'],
    offlineDone: ['Saved on this device. This page and its model now open without internet. Nothing is sent to Vivatheca.', 'この{端末|たんまつ}に{保存|ほぞん}しました。インターネットがなくても、このページと{模型|もけい}を{開|ひら}けます。Vivathecaには{何|なに}も{送|おく}られません。', 'Đã lưu trên thiết bị này. Trang này và mô hình của nó giờ mở được khi không có internet. Không có gì được gửi đến Vivatheca.'],
    offlineNo: ['This browser cannot save pages for offline use.', 'このブラウザはオフライン{保存|ほぞん}に{対応|たいおう}していません。', 'Trình duyệt này không lưu được trang để dùng ngoại tuyến.'],
    pictureDone: ['Picture saved. The credit and disclaimer are printed under the model.', '{画像|がぞう}を{保存|ほぞん}しました。{模型|もけい}の{下|した}にクレジットと{免責|めんせき}{事項|じこう}が{入|はい}っています。', 'Đã lưu ảnh. Ghi công và tuyên bố miễn trừ trách nhiệm được in bên dưới mô hình.'],
    steps: ['Picture steps (no words)', '{絵|え}だけの{手順|てじゅん}{図|ず}', 'Ảnh từng bước (không có chữ)'],
    stepsBusy: ['Making the picture steps: {n} of {total}…', '{手順|てじゅん}{図|ず}を{作成中|さくせいちゅう}：{total}{枚|まい}{中|ちゅう}{n}{枚目|まいめ}…', 'Đang tạo ảnh từng bước: {n} trên {total}…'],
    stepsDone: ['Picture steps saved. Each stage is a numbered picture with no words, so it works in any language.', '{手順|てじゅん}{図|ず}を{保存|ほぞん}しました。{各|かく}{段階|だんかい}が{番号|ばんごう}{付|つ}きの{絵|え}で、{文字|もじ}がないので、どの{言語|げんご}でも{使|つか}えます。', 'Đã lưu ảnh từng bước. Mỗi giai đoạn là một ảnh đánh số, không có chữ, nên dùng được với mọi ngôn ngữ.'],
    tour: ['Guided tour', 'ガイド{付|つ}きツアー', 'Hướng dẫn từng bước'],
    tourStep: ['Step {n} of {total}', '{total}{中|ちゅう}{n}', 'Bước {n} trên {total}'],
    back: ['Back', '{戻|もど}る', 'Quay lại'],
    next: ['Next', '{次|つぎ}へ', 'Tiếp'],
    stop: ['End tour', 'ツアーを{終|お}える', 'Kết thúc hướng dẫn'],
    credit: ['Credit and citation', 'クレジット・{引用|いんよう}', 'Ghi công và trích dẫn'],
    creditHeading: ['Credit for reuse ({lic})', '{再利用|さいりよう}{時|じ}のクレジット（{lic}）', 'Ghi công khi sử dụng lại ({lic})'],
    creditHelp: ['Paste this wherever you use the model or a picture of it. If you change the model, say what you changed. Things you make from it must use the same licence.', '{模型|もけい}やその{画像|がぞう}を{使|つか}う{場所|ばしょ}に{貼|は}り{付|つ}けてください。{模型|もけい}を{変|か}えたときは、{何|なに}を{変|か}えたかを{書|か}いてください。これをもとに{作|つく}ったものは、{同|おな}じライセンスにしてください。', 'Dán nội dung này ở bất cứ đâu bạn dùng mô hình hoặc ảnh của nó. Nếu bạn thay đổi mô hình, hãy ghi rõ bạn đã thay đổi gì. Những gì bạn làm từ nó phải dùng cùng giấy phép.'],
    creditHelpBy: ['Paste this wherever you use the model or a picture of it. If you change the model, say what you changed.', '{模型|もけい}やその{画像|がぞう}を{使|つか}う{場所|ばしょ}に{貼|は}り{付|つ}けてください。{模型|もけい}を{変|か}えたときは、{何|なに}を{変|か}えたかを{書|か}いてください。', 'Dán nội dung này ở bất cứ đâu bạn dùng mô hình hoặc ảnh của nó. Nếu bạn thay đổi mô hình, hãy ghi rõ bạn đã thay đổi gì.'],
    fmtPlain: ['Plain text', 'テキスト', 'Văn bản thường'],
    fmtHtml: ['HTML (web page)', 'HTML（ウェブページ）', 'HTML (trang web)'],
    fmtShort: ['Short (slides, posters)', '{短|みじか}い{形|かたち}（スライド・ポスター）', 'Ngắn (trang chiếu, áp phích)'],
    fmtVancouver: ['Cite: Vancouver', '{引用|いんよう}：バンクーバー', 'Trích dẫn: Vancouver'],
    fmtApa: ['Cite: APA', '{引用|いんよう}：APA', 'Trích dẫn: APA'],
    fmtBibtex: ['BibTeX', 'BibTeX', 'BibTeX'],
    fmtRis: ['RIS (EndNote, Zotero)', 'RIS（EndNote・Zotero）', 'RIS (EndNote, Zotero)'],
    codesHeading: ['Subject headings and anatomy codes', '{件名|けんめい}{標目|ひょうもく}と{解剖|かいぼう}コード', 'Tiêu đề chủ đề và mã giải phẫu'],
    codesHelp: ['For literature searches and catalogues: MeSH (US National Library of Medicine) and UBERON anatomy IDs.', '{文献|ぶんけん}{検索|けんさく}や{目録|もくろく}に{使|つか}えます。MeSH（{米国|べいこく}{国立|こくりつ}{医学|いがく}{図書館|としょかん}）とUBERONの{解剖|かいぼう}IDです。', 'Dùng cho tìm kiếm tài liệu và danh mục: MeSH (Thư viện Y khoa Quốc gia Hoa Kỳ) và mã giải phẫu UBERON.'],
    citeHelp: ['For papers, theses and course notes: cite the version you used.', '{論文|ろんぶん}・{授業|じゅぎょう}{資料|しりょう}では、{使|つか}ったバージョンを{引用|いんよう}してください。', 'Cho bài báo, luận văn và tài liệu học tập: hãy trích dẫn phiên bản bạn đã dùng.'],
    copy: ['Copy', 'コピー', 'Sao chép'],
    copied: ['Copied.', 'コピーしました。', 'Đã sao chép.'],
    embed: ['Embed on a website', 'ウェブサイトに{埋|う}め{込|こ}む', 'Nhúng vào trang web'],
    embedHelp: ['Paste this code into a clinic website, blog or course page. The viewer keeps the review status, disclaimer and credit. Embeds work once Vivatheca leaves its private preview.', 'このコードを{医院|いいん}のサイトや{授業|じゅぎょう}ページに{貼|は}り{付|つ}けてください。{審査|しんさ}の{状況|じょうきょう}・{免責|めんせき}{事項|じこう}・クレジットも{表示|ひょうじ}されます。Vivathecaの{限定|げんてい}{公開|こうかい}が{終|お}わると{使|つか}えます。', 'Dán mã này vào trang web của phòng khám, blog hoặc trang khóa học. Trình xem giữ nguyên tình trạng thẩm định, tuyên bố miễn trừ trách nhiệm và ghi công. Chức năng nhúng sẽ hoạt động khi Vivatheca kết thúc giai đoạn xem trước riêng tư.'],
    more: ['More ways to use it', 'ほかの{使|つか}い{方|かた}', 'Các cách dùng khác'],
    print: ['3D print: 3MF file or custom print', '3D{印刷|いんさつ}：3MFファイル・カスタム{印刷|いんさつ}', 'In 3D: tệp 3MF hoặc bản in tùy chỉnh'],
    templates: ['Handout and slide templates', '{配布|はいふ}{資料|しりょう}とスライドのテンプレート', 'Mẫu tờ hướng dẫn và trang chiếu'],
    used: ['Tell us how you used it', '{使|つか}い{方|かた}を{教|おし}えてください', 'Cho chúng tôi biết bạn đã dùng thế nào'],
    survey: ['Clinicians: rate the models (2 minutes)', '{臨床|りんしょう}{医|い}の{方|かた}へ：{模型|もけい}を{評価|ひょうか}する（2{分|ふん}）', 'Dành cho nhân viên y tế: đánh giá mô hình (2 phút)'],
    request: ['Ask for a new model', '{新|あたら}しい{模型|もけい}をリクエスト', 'Đề xuất mô hình mới'],
    embedOpen: ['Open on Vivatheca', 'Vivathecaで{開|ひら}く', 'Mở trên Vivatheca'],
    embedTitle: ['3D model from Vivatheca', 'Vivathecaの3D{模型|もけい}', 'Mô hình 3D từ Vivatheca'],
    failed: ['Sorry, that did not work in this browser.', 'このブラウザではうまくいきませんでした。', 'Rất tiếc, thao tác này không thực hiện được trên trình duyệt này.'],
    version: ['version', 'バージョン', 'phiên bản'],
    licensed: ['Licensed under', 'ライセンス：', 'Cấp phép theo'],
    changes: ['Changes: none (or describe your changes).', '{変更|へんこう}：なし（{変更|へんこう}した{場合|ばあい}はその{内容|ないよう}）。', 'Thay đổi: không có (hoặc mô tả các thay đổi của bạn).'],
    model: ['Model', '{模型|もけい}', 'Mô hình'],
    // Chairside pen and visit pack (anatomy apps review #7 and #8, 8 Nov 2026). Models: PEN_PACK.
    pen: ['Draw on it', '{書|か}き{込|こ}む', 'Vẽ lên hình'],
    penTitle: ['Draw on the model', '{模型|もけい}に{書|か}き{込|こ}む', 'Vẽ lên mô hình'],
    penHelp: ['Draw with a finger, stylus or mouse on a still picture of this view. Do not write anything that could identify the patient.', 'この{表示|ひょうじ}の{静止|せいし}{画|が}に、{指|ゆび}・ペン・マウスで{書|か}き{込|こ}めます。{患者|かんじゃ}さんがわかることは{書|か}かないでください。', 'Vẽ bằng ngón tay, bút cảm ứng hoặc chuột lên ảnh tĩnh của góc nhìn này. Không viết bất cứ điều gì có thể nhận ra bệnh nhân.'],
    penTools: ['Drawing tool', '{書|か}き{込|こ}みの{道具|どうぐ}', 'Công cụ vẽ'],
    penFree: ['Pen', 'ペン', 'Bút'],
    penArrow: ['Arrow', '{矢印|やじるし}', 'Mũi tên'],
    penCircle: ['Circle', '{丸|まる}', 'Vòng tròn'],
    penColours: ['Colour', '{色|いろ}', 'Màu'],
    red: ['Red', '{赤|あか}', 'Đỏ'],
    blue: ['Blue', '{青|あお}', 'Xanh dương'],
    black: ['Black', '{黒|くろ}', 'Đen'],
    undo: ['Undo', '{一|ひと}つ{戻|もど}す', 'Hoàn tác'],
    clearPen: ['Clear drawing', '{書|か}き{込|こ}みを{消|け}す', 'Xóa nét vẽ'],
    close: ['Close', '{閉|と}じる', 'Đóng'],
    penCanvas: ['Picture of the model to draw on', '{書|か}き{込|こ}み{用|よう}の{模型|もけい}の{画像|がぞう}', 'Ảnh mô hình để vẽ lên'],
    packAdd: ['Add view to visit pack', 'この{表示|ひょうじ}をお{持|も}ち{帰|かえ}り{資料|しりょう}に{追加|ついか}', 'Thêm góc nhìn vào tài liệu mang về'],
    packAddDrawing: ['Add to visit pack', 'お{持|も}ち{帰|かえ}り{資料|しりょう}に{追加|ついか}', 'Thêm vào tài liệu mang về'],
    packAdded: ['Added to the visit pack ({n} of {max}).', 'お{持|も}ち{帰|かえ}り{資料|しりょう}に{追加|ついか}しました（{max}{枚|まい}{中|ちゅう}{n}{枚|まい}）。', 'Đã thêm vào tài liệu mang về ({n} trên {max}).'],
    packFull: ['The visit pack already has {max} views. Open it to remove one.', 'お{持|も}ち{帰|かえ}り{資料|しりょう}はもう{max}{枚|まい}です。{開|ひら}いて1{枚|まい}{外|はず}してください。', 'Tài liệu mang về đã có {max} góc nhìn. Hãy mở và bỏ bớt một.'],
    packNoStore: ['This browser cannot keep the visit pack. Private browsing or blocked site data can stop it.', 'このブラウザではお{持|も}ち{帰|かえ}り{資料|しりょう}を{保存|ほぞん}できません。プライベートモードなどが{原因|げんいん}かもしれません。', 'Trình duyệt này không giữ được tài liệu mang về. Chế độ duyệt riêng tư hoặc chặn dữ liệu trang có thể là nguyên nhân.'],
    packOpen: ['Open visit pack ({n})', 'お{持|も}ち{帰|かえ}り{資料|しりょう}を{開|ひら}く（{n}）', 'Mở tài liệu mang về ({n})'],
    drawn: ['with drawing', '{書|か}き{込|こ}みあり', 'có hình vẽ'],
  };
  const say = (k) => ruby(T[k][JA ? 1 : VI ? 2 : 0]);
  const sayPlain = (k) => plain(T[k][JA ? 1 : VI ? 2 : 0]);
  const fill = (s, v) => s.replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const norm = (p) => p.replace(/index\.html$/, '').replace(/\/?$/, '/');
  const PATH = norm(location.pathname);
  const params = new URLSearchParams(location.search);
  const EMBED = params.get('embed') === '1';

  // ---- model facts (title, version, licence, review status, disclaimer) ----
  let metaPromise = null;
  // A model may have its own licence (BodyParts3D-based models are CC BY 4.0); otherwise the site licence.
  const meta = () => (metaPromise ||= fetch('/api/models').then((r) => r.json()).then((m) => { const model = m.models.find((x) => norm(x.href) === PATH) || null; return { ...m, model, licence: (model && model.licence) || m.licence }; }).catch(() => null));
  const lang = JA ? 'ja' : VI ? 'vi' : 'en';

  // ---- usage counts (/impact) ----
  // sendBeacon is made for fire-and-forget counts: the browser sends it in the background and drops
  // the reply. A fetch whose reply is never read stays "in flight" in Chromium, which stops pages
  // from ever reaching network idle (it hung the local Playwright tests), so the fallback cancels it.
  function sendHit(model, kind) {
    const data = JSON.stringify({ model, kind });
    try {
      if (navigator.sendBeacon && navigator.sendBeacon('/api/stats/hit', new Blob([data], { type: 'text/plain' }))) return;
    } catch (e) { /* fall back to fetch */ }
    try { fetch('/api/stats/hit', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'text/plain' }, body: data }).then((r) => r.body && r.body.cancel()).catch(() => {}); } catch (e) { /* counting is optional */ }
  }
  function count(kind) {
    meta().then((m) => {
      if (!m || !m.model) return;
      sendHit(m.model.slug, kind);
    });
  }
  window.vtCount = count;

  // ---- what the page shows right now (stage, toggles, parts, camera) ----
  // Choice buttons in the order they must be pressed to rebuild a view.
  const CHOICE = ['data-case', 'data-class', 'data-phase', 'data-stage', 'data-state', 'data-age', 'data-stage-index'];
  const TOGGLES = ['xray', 'lost', 'labels', 'bite', 'cut', 'seethrough', 'ghost', 'moved', 'btn-margin', 'btn-xray', 'btn-recon', 'btn-section', 'above'];
  const outside = (el) => !el.closest('.vt-share, .vt-parts, .vt-tourbar, header, nav, footer');
  const choiceButtons = (scope, attr) => [...(scope || doc).querySelectorAll('button[' + attr + ']')].filter((b) => outside(b) && !b.hidden && !b.disabled && b.offsetParent !== null);

  function readState(group) {
    const s = [];
    CHOICE.forEach((attr) => { const b = choiceButtons(group.scope, attr).find((x) => x.getAttribute('aria-pressed') === 'true'); if (b) s.push([attr, b.getAttribute(attr)]); });
    const g = TOGGLES.filter((id) => { const b = doc.getElementById(id); return b && outside(b) && b.getAttribute('aria-pressed') === 'true'; });
    const p = group.parts() ? group.parts().get() : null;
    return { s, g, p, c: group.views().map((v) => v.get()) };
  }

  async function applyState(group, st, keepCamera) {
    for (const [attr, val] of st.s || []) {
      const b = choiceButtons(group.scope, attr).find((x) => x.getAttribute(attr) === val);
      if (b && b.getAttribute('aria-pressed') !== 'true') { b.click(); await group.settled(); }
    }
    for (const id of TOGGLES) {
      const b = doc.getElementById(id);
      if (!b || !outside(b) || b.disabled) continue;
      const want = (st.g || []).includes(id);
      if ((b.getAttribute('aria-pressed') === 'true') !== want) { b.click(); await sleep(60); }
    }
    if (st.p && group.parts()) await group.parts().set(st.p);
    if (!keepCamera && st.c) group.views().forEach((v, i) => { if (st.c[i]) v.set(st.c[i]); });
  }

  const enc = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const dec = (s) => { try { return JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))))); } catch (e) { return null; } };

  // ---- viewers: <model-viewer> or the three.js head and neck viewer (#viewer with vtView) ----
  function mvView(mv) {
    return {
      el: mv,
      get: () => {
        const o = mv.getCameraOrbit(), t = mv.getCameraTarget(), d = (r) => (r * 180 / Math.PI).toFixed(1) + 'deg', m = (n) => +n.toFixed(4) + 'm';
        return { o: d(o.theta) + ' ' + d(o.phi) + ' ' + m(o.radius), t: m(t.x) + ' ' + m(t.y) + ' ' + m(t.z), f: mv.getFieldOfView().toFixed(1) + 'deg' };
      },
      set: (v) => { mv.cameraOrbit = v.o; mv.cameraTarget = v.t; if (v.f) mv.fieldOfView = v.f; if (mv.jumpCameraToGoal) mv.jumpCameraToGoal(); },
      visible: () => mv.offsetParent !== null && !mv.closest('[hidden]'),
      capture: async () => {
        // On a slow device model-viewer lowers its render scale (a static on the element class), and toBlob
        // then returns a cropped, off-centre picture. Render at full scale for the capture, then restore it.
        const C = mv.constructor, scale = C.minimumRenderScale;
        if (scale !== 1) { C.minimumRenderScale = 1; if (mv.jumpCameraToGoal) mv.jumpCameraToGoal(); await sleep(400); }
        const blob = await mv.toBlob({ mimeType: 'image/png', idealAspect: false }).finally(() => { if (scale === undefined) delete C.minimumRenderScale; else C.minimumRenderScale = scale; });
        return await createImageBitmap(blob);
      },
    };
  }
  function threeView(box) {
    const a = () => box.vtView;
    return {
      el: box,
      get: () => (a() ? a().get() : null),
      set: (v) => { if (a() && v) a().set(v); },
      visible: () => true,
      capture: async () => createImageBitmap(await new Promise((r) => a().capture().toBlob(r, 'image/png'))),
    };
  }

  function makeGroup(scope, mount) {
    const group = {
      scope, mount,
      views() {
        const mvs = [...scope.querySelectorAll('model-viewer')];
        if (mvs.length) return mvs.map(mvView);
        const box = scope.querySelector('#viewer');
        return box ? [threeView(box)] : [];
      },
      parts() { const v = group.views()[0]; return v && v.el.vtPartsState ? v.el.vtPartsState : null; },
      // Wait for a model swap after a button press (model-viewer fires load; three.js swaps are quick).
      async settled() {
        const mvs = [...scope.querySelectorAll('model-viewer')];
        await sleep(80);
        await Promise.all(mvs.map((mv) => (mv.loaded ? Promise.resolve() : new Promise((r) => { const done = () => { mv.removeEventListener('load', done); r(); }; mv.addEventListener('load', done); setTimeout(done, 6000); }))));
        await sleep(mvs.length ? 250 : 500);
      },
    };
    return group;
  }

  // ---- tours: step through the page's own stages ----
  // Overrides for pages whose stages need two buttons; otherwise the first choice group with 2+ buttons is used.
  const TOURS = {
    '/orthognathic/': [[['data-class', 'normal']], [['data-class', 'class2'], ['data-phase', 'before']], [['data-class', 'class2'], ['data-phase', 'after']], [['data-class', 'class3'], ['data-phase', 'before']], [['data-class', 'class3'], ['data-phase', 'after']]],
  };
  function tourSteps(group) {
    if (TOURS[PATH]) return TOURS[PATH].map((s) => ({ press: s }));
    for (const attr of ['data-stage', 'data-state', 'data-age', 'data-stage-index']) {
      const bs = choiceButtons(group.scope, attr);
      if (bs.length >= 2) return bs.map((b) => ({ press: [[attr, b.getAttribute(attr)]] }));
    }
    return [];
  }
  async function goStep(group, step) {
    for (const [attr, val] of step.press) {
      const b = choiceButtons(group.scope, attr).find((x) => x.getAttribute(attr) === val) || [...group.scope.querySelectorAll('button[' + attr + '="' + val + '"]')][0];
      if (b && b.getAttribute('aria-pressed') !== 'true') { b.click(); await group.settled(); }
    }
  }
  function stepTitle(group, step) {
    const last = step.press[step.press.length - 1];
    const b = [...group.scope.querySelectorAll('button[' + last[0] + '="' + last[1] + '"]')][0];
    const cap = doc.querySelector('#stage h2, #stage h3, .model-copy h3');
    const text = (el) => { if (!el) return ''; const c = el.cloneNode(true); c.querySelectorAll('rt, rp').forEach((r) => r.remove()); return c.textContent.replace(/\s+/g, ' ').trim(); };
    return text(cap) || text(b);
  }

  function startTour(group, panel) {
    const steps = tourSteps(group);
    if (!steps.length) return;
    const view = group.views()[0];
    if (!view) return;
    const host = view.el;
    const old = host.querySelector('.vt-tourbar'); if (old) old.remove();
    const bar = doc.createElement('div');
    bar.className = 'vt-tourbar';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', sayPlain('tour'));
    host.appendChild(bar);
    let i = 0;
    count('tour');
    async function show() {
      bar.innerHTML = '<p class="vt-tour-count" aria-live="polite"></p><div class="vt-tour-buttons">' +
        '<button type="button" class="vt-tour-back"' + (i === 0 ? ' disabled' : '') + '>' + say('back') + '</button>' +
        '<button type="button" class="vt-tour-next"' + (i === steps.length - 1 ? ' disabled' : '') + '>' + say('next') + '</button>' +
        '<button type="button" class="vt-tour-stop">' + say('stop') + '</button></div>';
      bar.querySelector('.vt-tour-back').onclick = () => { i = Math.max(0, i - 1); show(); };
      bar.querySelector('.vt-tour-next').onclick = () => { i = Math.min(steps.length - 1, i + 1); show(); };
      bar.querySelector('.vt-tour-stop').onclick = () => { bar.remove(); const t = panel.querySelector('.vt-tour'); if (t) t.focus(); };
      await goStep(group, steps[i]);
      bar.querySelector('.vt-tour-count').innerHTML = esc(fill(sayPlain('tourStep'), { n: i + 1, total: steps.length })) + ': <b>' + esc(stepTitle(group, steps[i])) + '</b>';
      const focus = bar.querySelector(i === steps.length - 1 ? '.vt-tour-stop' : '.vt-tour-next'); if (focus) focus.focus({ preventScroll: true });
    }
    host.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    show();
  }

  // ---- pictures ----
  function wrapLines(ctx, text, width) {
    const out = []; let line = '';
    const words = JA ? [...text] : text.split(' ');
    words.forEach((w) => { const t = line ? line + (JA ? '' : ' ') + w : w; if (ctx.measureText(t).width > width && line) { out.push(line); line = w; } else line = t; });
    if (line) out.push(line);
    return out;
  }
  // Review status for this model: a signed-off review of the current version (app/models/reviews.ts)
  // replaces "Not yet clinically reviewed". m.reviewedStatus has {name}, {credentials}, {date}, {v}.
  function reviewText(m) {
    const r = m.model && m.model.review;
    if (!r || !m.reviewedStatus) return m.reviewStatus[lang];
    return m.reviewedStatus[lang].replace('{name}', r.reviewer).replace('{credentials}', r.credentials).replace('{date}', r.date).replace('{v}', r.version);
  }
  function creditLines(m) {
    const title = plain(m.model.title[lang]);
    const url = 'https://vivatheca.com' + m.model.href;
    return {
      title: title + ' · ' + sayPlain('version') + ' ' + m.model.version,
      credit: '© Vivatheca · ' + url + ' · ' + m.licence.name,
      status: plain(reviewText(m)) + ' ' + plain(m.modelDisclaimer[lang]) + ' vivatheca.com' + m.disclaimerHref,
    };
  }
  // Readable fonts for saved pictures (public/fonts/readable/readable.css, SIL OFL 1.1): Atkinson
  // Hyperlegible for Latin text and BIZ UDPGothic (universal-design) for Japanese. Loaded on first use.
  let readableReady = null;
  function readableFonts(sample) {
    if (!readableReady) {
      readableReady = new Promise((res) => {
        if (doc.querySelector('link[href="/fonts/readable/readable.css"]')) return res();
        const l = doc.createElement('link'); l.rel = 'stylesheet'; l.href = '/fonts/readable/readable.css';
        l.onload = l.onerror = () => res(); doc.head.appendChild(l);
      });
    }
    return readableReady.then(() => Promise.all(['400', '700'].flatMap((w) => [
      doc.fonts.load(w + ' 20px "Atkinson Hyperlegible"', sample),
      doc.fonts.load(w + ' 20px "BIZ UDPGothic"', sample),
    ])).catch(() => {}));
  }

  // Draws pictures in a grid (numbered when there are several) with the credit and disclaimer underneath.
  function compose(images, m, numbered) {
    const cols = images.length <= 1 ? 1 : images.length <= 4 ? Math.min(images.length, 2) : 3;
    const rows = Math.ceil(images.length / cols);
    const cell = Math.min(1600 / cols, images[0].width);
    const ch = cell * images[0].height / images[0].width;
    const W = Math.round(cell * cols), pad = Math.round(W / 60) + 8;
    const c = doc.createElement('canvas');
    const ctx = c.getContext('2d');
    const font = (px, bold) => (bold ? '700 ' : '') + px + 'px "Atkinson Hyperlegible", "BIZ UDPGothic", system-ui, -apple-system, "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif';
    const fs = Math.max(14, Math.round(W / 70));
    ctx.font = font(fs);
    const L = creditLines(m);
    const lines = [[L.title, true], [L.credit, false], ...wrapLines(ctx, L.status, W - 2 * pad).map((l) => [l, false])];
    const footer = pad * 2 + lines.length * fs * 1.45;
    c.width = W; c.height = Math.round(rows * ch + footer);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height);
    images.forEach((img, k) => {
      const x = (k % cols) * cell, y = Math.floor(k / cols) * ch;
      ctx.drawImage(img, x, y, cell, ch);
      if (numbered) {
        const r = Math.max(18, cell / 14);
        ctx.fillStyle = '#00244d'; ctx.beginPath(); ctx.arc(x + r + 10, y + r + 10, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.font = font(Math.round(r * 1.1), true); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(k + 1), x + r + 10, y + r + 11);
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        if (k < images.length - 1 && (k % cols) < cols - 1) { ctx.fillStyle = '#007f8b'; ctx.font = font(Math.round(r * 1.4), true); ctx.fillText('→', x + cell - r * 1.6, y + ch / 2); }
      }
    });
    ctx.fillStyle = '#e5eef1'; ctx.fillRect(0, rows * ch, W, 2);
    let y = rows * ch + pad + fs;
    lines.forEach(([text, bold]) => { ctx.fillStyle = bold ? '#00244d' : '#33475b'; ctx.font = font(fs, bold); ctx.fillText(text, pad, y); y += fs * 1.45; });
    return c;
  }
  function download(canvas, name) {
    return new Promise((res) => canvas.toBlob((b) => {
      const a = doc.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; doc.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000); res();
    }, 'image/png'));
  }
  async function captureVisible(group) {
    const imgs = [];
    for (const v of group.views().filter((x) => x.visible())) imgs.push(await v.capture());
    if (imgs.length < 2) return imgs[0];
    // Side by side (the wisdom tooth comparison): one picture.
    const h = Math.max(...imgs.map((i) => i.height));
    const c = doc.createElement('canvas'); c.width = imgs.reduce((s, i) => s + i.width, 0); c.height = h;
    let x = 0; const ctx = c.getContext('2d'); imgs.forEach((i) => { ctx.drawImage(i, x, 0); x += i.width; });
    return c;
  }

  // ---- visit pack (sessionStorage, this tab only; nothing about the patient) ----
  // Models with the chairside pen and visit pack: every catalogue model (Luke, 8 Nov 2026: wisdom tooth first; 9 Nov 2026: all of
  // them). A model listed here also needs visitPack.models text in the dictionaries and sources in app/visit-pack/sources.ts.
  const PEN_PACK = ['impacted-wisdom-tooth', 'dental-development', 'periodontitis', 'oroantral', 'cracked-tooth', 'endodontic', 'vpi', 'prosthodontic', 'tmd',
    'ectopic-canine', 'dentigerous-cyst', 'stainless-steel-crown', 'head-neck', 'head-neck-scc', 'head-neck-ameloblastoma', 'head-neck-okc', 'head-neck-mec',
    'alveolar-bone-graft', 'averaged-jaw', 'orthognathic', 'fixation'];
  const PACK_KEY = 'vivatheca-visit-pack', PACK_MAX = 4;
  const readPack = () => { try { const v = JSON.parse(sessionStorage.getItem(PACK_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  // Label for a saved view: the pressed button of the viewer's first choice group (e.g. "Both").
  function viewLabel(group) {
    const b = [...group.scope.querySelectorAll('[role="group"] button[aria-pressed="true"]')].find(outside);
    if (!b) return '';
    const c = b.cloneNode(true); c.querySelectorAll('rt, rp').forEach((r) => r.remove());
    return c.textContent.replace(/\s+/g, ' ').trim();
  }
  // Stores a JPEG copy (at most 1200 px wide) with the link to the view. Returns the new count, 0 when full, -1 on failure.
  function addToPack(src, item) {
    const pack = readPack();
    if (pack.length >= PACK_MAX) return 0;
    const k = Math.min(1, 1200 / src.width);
    const c = doc.createElement('canvas'); c.width = Math.round(src.width * k); c.height = Math.round(src.height * k);
    const ctx = c.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(src, 0, 0, c.width, c.height);
    pack.push({ ...item, img: c.toDataURL('image/jpeg', 0.85), added: Date.now() });
    try { sessionStorage.setItem(PACK_KEY, JSON.stringify(pack)); } catch (e) { return -1; }
    return pack.length;
  }

  // ---- chairside pen: draw arrows, circles and free lines on a still of the current view ----
  const PEN_COLOURS = [['red', '#d1002a'], ['blue', '#0057b8'], ['black', '#111111']];
  async function openPen(group, m, opener, after) {
    const shot = await captureVisible(group);
    const k = Math.min(1, 1600 / shot.width);
    const base = doc.createElement('canvas'); base.width = Math.round(shot.width * k); base.height = Math.round(shot.height * k);
    const bctx = base.getContext('2d'); bctx.fillStyle = '#ffffff'; bctx.fillRect(0, 0, base.width, base.height); bctx.drawImage(shot, 0, 0, base.width, base.height);
    const label = viewLabel(group);
    const view = after.viewUrl();
    const box = doc.createElement('div');
    box.className = 'vt-pen';
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'vt-pen-title');
    const tools = [['free', 'penFree'], ['arrow', 'penArrow'], ['circle', 'penCircle']];
    box.innerHTML = '<div class="vt-pen-inner"><h2 id="vt-pen-title">' + say('penTitle') + '</h2><p>' + say('penHelp') + '</p>' +
      '<div class="vt-row"><div class="vt-tabs" role="group" aria-label="' + esc(sayPlain('penTools')) + '">' + tools.map(([id, w], i) => '<button type="button" data-tool="' + id + '" aria-pressed="' + (i === 0) + '">' + say(w) + '</button>').join('') + '</div>' +
      '<div class="vt-tabs" role="group" aria-label="' + esc(sayPlain('penColours')) + '">' + PEN_COLOURS.map(([id, hex], i) => '<button type="button" data-colour="' + hex + '" aria-pressed="' + (i === 0) + '"><span class="vt-swatch" style="background:' + hex + '" aria-hidden="true"></span>' + say(id) + '</button>').join('') + '</div></div>' +
      '<div class="vt-pen-stage"><canvas role="img" aria-label="' + esc(sayPlain('penCanvas')) + '"></canvas></div>' +
      '<div class="vt-row"><button type="button" class="vt-pen-undo">' + say('undo') + '</button><button type="button" class="vt-pen-clear">' + say('clearPen') + '</button>' +
      '<button type="button" class="vt-pen-save">' + say('picture') + '</button><button type="button" class="vt-pen-pack">' + say('packAddDrawing') + '</button>' +
      '<button type="button" class="vt-pen-close">' + say('close') + '</button></div><p class="vt-status" role="status" aria-live="polite"></p></div>';
    doc.body.appendChild(box);
    const canvas = box.querySelector('canvas');
    canvas.width = base.width; canvas.height = base.height;
    const ctx = canvas.getContext('2d');
    const status = box.querySelector('.vt-status');
    const lw = Math.max(4, Math.round(base.width / 220));
    let tool = 'free', colour = PEN_COLOURS[0][1], cur = null;
    const shapes = [];
    function draw(sh) {
      ctx.strokeStyle = sh.colour; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const [a, b] = [sh.pts[0], sh.pts[sh.pts.length - 1]];
      ctx.beginPath();
      if (sh.tool === 'free') { sh.pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); if (sh.pts.length === 1) ctx.lineTo(a[0] + 0.1, a[1]); }
      else if (sh.tool === 'arrow') {
        const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), h = lw * 5;
        ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
        ctx.moveTo(b[0] - h * Math.cos(ang - 0.45), b[1] - h * Math.sin(ang - 0.45)); ctx.lineTo(b[0], b[1]); ctx.lineTo(b[0] - h * Math.cos(ang + 0.45), b[1] - h * Math.sin(ang + 0.45));
      } else ctx.ellipse((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.max(1, Math.abs(b[0] - a[0]) / 2), Math.max(1, Math.abs(b[1] - a[1]) / 2), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    const redraw = () => { ctx.drawImage(base, 0, 0); shapes.forEach(draw); if (cur) draw(cur); };
    redraw();
    const at = (e) => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) * canvas.width / r.width, (e.clientY - r.top) * canvas.height / r.height]; };
    canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); canvas.setPointerCapture(e.pointerId); cur = { tool, colour, pts: [at(e)] }; redraw(); });
    canvas.addEventListener('pointermove', (e) => { if (!cur) return; const p = at(e); if (cur.tool === 'free') cur.pts.push(p); else cur.pts[1] = p; redraw(); });
    const end = () => { if (!cur) return; if (cur.tool === 'free' || cur.pts.length > 1) shapes.push(cur); cur = null; redraw(); };
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    const press = (sel, attr, set) => box.querySelectorAll(sel).forEach((x) => { x.onclick = () => { box.querySelectorAll(sel).forEach((y) => y.setAttribute('aria-pressed', String(y === x))); set(x.getAttribute(attr)); }; });
    press('[data-tool]', 'data-tool', (v) => { tool = v; });
    press('[data-colour]', 'data-colour', (v) => { colour = v; });
    box.querySelector('.vt-pen-undo').onclick = () => { shapes.pop(); redraw(); };
    box.querySelector('.vt-pen-clear').onclick = () => { shapes.length = 0; redraw(); };
    box.querySelector('.vt-pen-save').onclick = async () => {
      try { await readableFonts(Object.values(creditLines(m)).join(' ')); await download(compose([canvas], m, false), 'vivatheca-' + m.model.slug + '-drawing.png'); status.innerHTML = say('pictureDone'); count('image'); } catch (err) { status.innerHTML = say('failed'); }
    };
    box.querySelector('.vt-pen-pack').onclick = () => {
      const n = addToPack(canvas, { slug: m.model.slug, href: m.model.href, view, label, drawn: shapes.length > 0 });
      status.textContent = n > 0 ? fill(sayPlain('packAdded'), { n, max: PACK_MAX }) : fill(sayPlain(n === 0 ? 'packFull' : 'packNoStore'), { max: PACK_MAX });
      if (n > 0) { count('share'); after.refresh(); }
    };
    const close = () => { box.remove(); doc.removeEventListener('keydown', onKey, true); opener.focus(); };
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      const f = [...box.querySelectorAll('button')]; const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    doc.addEventListener('keydown', onKey, true);
    box.querySelector('.vt-pen-close').onclick = close;
    box.querySelector('[data-tool]').focus();
  }

  // ---- the panel ----
  const style = doc.createElement('style');
  style.textContent = [
    '.vt-share{margin:14px 0 0;padding:12px 14px;border:1px solid var(--line,#cfe1e7);border-radius:14px;text-align:left}',
    '.vt-share h2{margin:0 0 4px;font-size:16px;color:var(--heading,#00244d)}',
    '.vt-share p{margin:0 0 8px;font-size:14px;color:var(--muted,var(--text,#4b5d6b))}',
    '.vt-share .vt-row{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 0}',
    '.vt-share button,.vt-tourbar button{min-height:44px;padding:8px 14px;border-radius:999px;border:1px solid var(--line,#cfe1e7);background:var(--bg,var(--surface,#fff));color:var(--text,var(--text-strong,#06233f));font:inherit;font-size:15px;cursor:pointer}',
    '.vt-share button[aria-expanded="true"]{border-color:var(--accent,#007f8b);color:var(--accent,#007f8b);font-weight:600}',
    '.vt-share button:focus-visible,.vt-tourbar button:focus-visible,.vt-share a:focus-visible{outline:3px solid var(--accent,#007f8b);outline-offset:2px}',
    '.vt-share button:disabled,.vt-tourbar button:disabled{opacity:.5;cursor:default}',
    '.vt-share .vt-box{margin:10px 0 0;padding:10px 12px;border-radius:10px;background:var(--surface-alt,rgba(0,127,139,.06))}',
    '.vt-share textarea{width:100%;box-sizing:border-box;min-height:84px;font:13px/1.45 ui-monospace,Menlo,Consolas,monospace;padding:8px;border-radius:8px;border:1px solid var(--line,#cfe1e7);background:var(--bg,var(--surface,#fff));color:var(--text,var(--text-strong,#06233f))}',
    '.vt-share .vt-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px}',
    '.vt-share .vt-tabs button{min-height:36px;padding:4px 12px;font-size:14px}',
    '.vt-share .vt-tabs button[aria-pressed="true"]{border-color:var(--accent,#007f8b);color:var(--accent,#007f8b);font-weight:600}',
    '.vt-share .vt-qr svg{width:180px;height:180px;background:#fff;border-radius:8px;display:block;margin:8px 0}',
    '.vt-share .vt-links{display:flex;flex-wrap:wrap;gap:6px 18px;margin:10px 0 0;padding:0;list-style:none;font-size:15px}',
    '.vt-share .vt-links a{color:var(--accent,#007f8b);font-weight:600;display:inline-block;min-height:24px}',
    '.vt-share .vt-status{min-height:1.2em;margin:8px 0 0;font-size:14px;color:var(--accent,#007f8b)}',
    '.vt-tourbar{position:absolute;left:8px;right:8px;bottom:8px;z-index:5;display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;padding:8px 10px;border-radius:12px;background:rgba(0,36,77,.92);color:#fff;text-align:left}',
    '.vt-tourbar p{margin:0;flex:1 1 200px;font-size:14px;color:#fff}',
    '.vt-tourbar .vt-tour-buttons{display:flex;gap:6px;flex-wrap:wrap}',
    '.vt-tourbar button{min-height:40px;padding:6px 12px;background:#fff;color:#00244d;border-color:#fff}',
    // Chairside pen (full-screen dialog over the page).
    '.vt-pen{position:fixed;inset:0;z-index:1000;overflow:auto;padding:12px;background:rgba(0,20,40,.72);text-align:left}',
    '.vt-pen-inner{max-width:1200px;margin:0 auto;padding:14px;border-radius:14px;background:var(--surface,#fff);color:var(--text,#06233f)}',
    '.vt-pen h2{margin:0 0 4px;font-size:18px;color:var(--heading,#00244d)}',
    '.vt-pen p{margin:0 0 8px;font-size:14px;text-align:justify;hyphens:auto}',
    '.vt-pen .vt-row{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}',
    '.vt-pen button{min-height:44px;padding:8px 14px;border-radius:999px;border:1px solid var(--line,#cfe1e7);background:var(--bg,var(--surface,#fff));color:var(--text,#06233f);font:inherit;font-size:15px;cursor:pointer}',
    '.vt-pen .vt-tabs{display:flex;flex-wrap:wrap;gap:6px}',
    '.vt-pen button[aria-pressed="true"]{border-color:var(--accent,#007f8b);color:var(--accent,#007f8b);font-weight:700;box-shadow:inset 0 0 0 1px var(--accent,#007f8b)}',
    '.vt-pen button:focus-visible{outline:3px solid var(--accent,#007f8b);outline-offset:2px}',
    '.vt-pen .vt-swatch{display:inline-block;width:14px;height:14px;margin-right:6px;border-radius:50%;vertical-align:-2px}',
    '.vt-pen-stage{display:flex;justify-content:center;background:#fff;border-radius:10px;border:1px solid var(--line,#cfe1e7)}',
    '.vt-pen canvas{display:block;max-width:100%;max-height:calc(100vh - 260px);height:auto;touch-action:none;cursor:crosshair}',
    '.vt-pen .vt-status{min-height:1.2em;margin:4px 0 0;color:var(--accent,#007f8b)}',
    '.vt-share .vt-pack-open[hidden]{display:none}',
    // Embedded view (?embed=1): only the viewer, its controls and a bar with the credit and disclaimer.
    'html.vt-embed [data-vt-embed="hide"]{display:none!important}',
    'html.vt-embed body{padding-bottom:0;margin:0}',
    'html.vt-embed main{padding-top:8px!important;margin-top:0!important}',
    '.vt-embedbar{position:sticky;bottom:0;z-index:20;padding:8px 12px;background:var(--surface,#fff);border-top:1px solid var(--line,#cfe1e7);font-size:13px;line-height:1.45;color:var(--text,#06233f);text-align:left}',
    '.vt-embedbar a{color:var(--accent,#007f8b);font-weight:600}',
    '.vt-embedbar strong{color:var(--heading,#00244d)}',
  ].join('');
  doc.head.appendChild(style);

  function placePanel(group, panel) {
    if (group.mount) { group.mount.appendChild(panel); return; }
    const view = group.views()[0];
    const parts = doc.querySelector('.vt-parts');
    let after = parts && parts.isConnected ? parts : view.el;
    if (after === view.el) {
      let next = after.nextElementSibling;
      while (next && (next.matches('.controls, .stages, .choose, .ages, .phase, .stages-head, p.small, p.status, .legend, #legend, .hint') || next.getAttribute('role') === 'group')) { after = next; next = next.nextElementSibling; }
    }
    after.insertAdjacentElement('afterend', panel);
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { return false; }
  }

  function credits(m) {
    const title = plain(m.model.title[lang]);
    const url = 'https://vivatheca.com' + m.model.href;
    const v = m.model.version;
    const l = m.licence;
    return {
      plain: (JA ? sayPlain('model') + '：「' + title + '」' : sayPlain('model') + ': "' + title + '"') + ' (' + sayPlain('version') + ' ' + v + '), Vivatheca, ' + url + '. ' + sayPlain('licensed') + ' ' + l.name + ' (' + l.href + '). ' + sayPlain('changes') + ' ' + plain(m.modelDisclaimer[lang]),
      html: '<p>' + esc(sayPlain('model')) + (JA ? '：「' : ': “') + '<a href="' + url + '">' + esc(title) + '</a>' + (JA ? '」' : '”') + ' (' + esc(sayPlain('version')) + ' ' + esc(v) + '), <a href="https://vivatheca.com">Vivatheca</a>. ' + esc(sayPlain('licensed')) + ' <a href="' + l.href + '">' + esc(l.name) + '</a>. ' + esc(sayPlain('changes')) + '</p>\n<p><small>' + esc(plain(reviewText(m))) + ' ' + esc(plain(m.modelDisclaimer[lang])) + ' <a href="https://vivatheca.com' + m.disclaimerHref + '">vivatheca.com' + m.disclaimerHref + '</a></small></p>',
      short: '3D model: Vivatheca, vivatheca.com' + m.model.href + ' · ' + l.name,
      ...citations(m, title, url),
    };
  }

  // MeSH subject headings and UBERON anatomy IDs (app/models/semantics.ts), linked to their records.
  function codesHtml(codes) {
    if (!codes || !(codes.subjects.length + codes.anatomy.length)) return '';
    const link = (href, text) => '<a href="' + href + '" target="_blank" rel="noreferrer">' + esc(text) + '</a>';
    const mesh = codes.subjects.map((c) => link('https://meshb.nlm.nih.gov/record/ui?ui=' + c.id, c.label + ' (' + c.id + ')')).join('; ');
    const anat = codes.anatomy.map((c) => link('http://purl.obolibrary.org/obo/' + c.id.replace(':', '_'), c.label + ' (' + c.id + ')')).join('; ');
    return '<p class="vt-codes"><strong>' + say('codesHeading') + '</strong><br>' + say('codesHelp') + '<br><span lang="en">MeSH: ' + mesh + '<br>UBERON: ' + anat + '</span></p>';
  }

  // "Cite this model": one record, four styles. The author is Vivatheca (organisation); the version and
  // date make the citation point at a fixed model. Accessed date is today, as Vancouver and APA ask.
  function citations(m, title, url) {
    const v = m.model.version;
    const [y, mo, d] = (m.model.updated || '').split('-').map(Number);
    const now = new Date();
    const mon = (i) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i - 1];
    const monthLong = (i) => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][i - 1];
    const iso = (dt) => dt.toISOString().slice(0, 10);
    const key = 'vivatheca_' + m.model.slug.replace(/[^a-z0-9]+/gi, '_') + '_' + y;
    return {
      vancouver: 'Vivatheca. ' + title + ' [3D model on the Internet]. Version ' + v + '. Australia: Vivatheca; ' + y + ' [updated ' + y + ' ' + mon(mo) + ' ' + d + '; cited ' + now.getUTCFullYear() + ' ' + mon(now.getUTCMonth() + 1) + ' ' + now.getUTCDate() + ']. Available from: ' + url,
      apa: 'Vivatheca. (' + y + ', ' + monthLong(mo) + ' ' + d + '). ' + title + ' (Version ' + v + ') [3D model]. ' + url,
      bibtex: '@misc{' + key + ',\n  author = {{Vivatheca}},\n  title = {' + title.replace(/[{}]/g, '') + '},\n  year = {' + y + '},\n  version = {' + v + '},\n  howpublished = {3D model},\n  url = {' + url + '},\n  note = {Licence ' + m.licence.name + '. Accessed ' + iso(now) + '}\n}',
      ris: ['TY  - DATA', 'AU  - Vivatheca', 'TI  - ' + title, 'PY  - ' + y, 'DA  - ' + (m.model.updated || '').replace(/-/g, '/'), 'ET  - ' + v, 'M3  - 3D model', 'PB  - Vivatheca', 'UR  - ' + url, 'Y2  - ' + iso(now).replace(/-/g, '/'), 'N1  - Licence ' + m.licence.name, 'ER  - '].join('\n'),
    };
  }

  function buildPanel(group) {
    const panel = doc.createElement('section');
    panel.className = 'vt-share';
    panel.setAttribute('aria-label', sayPlain('heading'));
    placePanel(group, panel);
    meta().then((m) => {
      if (!m || !m.model) { panel.remove(); return; }
      const slug = m.model.slug;
      const hasTour = tourSteps(group).length >= 2;
      const penPack = PEN_PACK.includes(slug);
      panel.innerHTML = '<h2>' + say('heading') + '</h2><p>' + say('lead') + '</p>' +
        '<div class="vt-row">' +
        '<button type="button" class="vt-link">' + say('link') + '</button>' +
        '<button type="button" class="vt-qr-btn" aria-expanded="false">' + say('qr') + '</button>' +
        '<button type="button" class="vt-pic">' + say('picture') + '</button>' +
        '<button type="button" class="vt-offline">' + say('offline') + '</button>' +
        (hasTour ? '<button type="button" class="vt-tour">' + say('tour') + '</button><button type="button" class="vt-steps">' + say('steps') + '</button>' : '') +
        '<button type="button" class="vt-credit-btn" aria-expanded="false">' + say('credit') + '</button>' +
        '<button type="button" class="vt-embed-btn" aria-expanded="false">' + say('embed') + '</button>' +
        (penPack ? '<button type="button" class="vt-pen-btn">' + say('pen') + '</button><button type="button" class="vt-pack-add">' + say('packAdd') + '</button><a class="vt-pack-open" href="/visit-pack" hidden></a>' : '') +
        '</div><div class="vt-box vt-qr" hidden></div><div class="vt-box vt-credit" hidden></div><div class="vt-box vt-embedbox" hidden></div>' +
        '<p class="vt-status" role="status" aria-live="polite"></p>' +
        '<ul class="vt-links" aria-label="' + esc(sayPlain('more')) + '">' +
        '<li class="vt-print-link" hidden><a href="/print?model=' + slug + '">' + say('print') + ' →</a></li>' +
        '<li><a href="/templates#' + slug + '">' + say('templates') + ' →</a></li>' +
        '<li><a href="/used?model=' + slug + '">' + say('used') + ' →</a></li>' +
        '<li><a href="/requests">' + say('request') + ' →</a></li>' +
        '<li><a href="/survey?model=' + slug + '">' + say('survey') + ' →</a></li></ul>';
      // Offer the 3D print link only for models that have print files (public/print/sets.json).
      fetch('/print/sets.json').then((r) => r.json()).then((sets) => { if (sets[slug]) panel.querySelector('.vt-print-link').hidden = false; }).catch(() => {});
      const status = panel.querySelector('.vt-status');
      const tell = (k, v) => { status.innerHTML = v ? esc(fill(sayPlain(k), v)) : say(k); };
      const viewUrl = () => { const u = new URL(location.href); u.hash = ''; u.searchParams.delete('embed'); u.searchParams.set('view', enc(readState(group))); return u.toString(); };

      panel.querySelector('.vt-link').onclick = async () => {
        const url = viewUrl();
        count('share');
        if (await copyText(url)) tell('linked');
        else status.innerHTML = say('linkShown') + ' <input readonly size="40" value="' + esc(url) + '" aria-label="' + esc(sayPlain('link')) + '">';
      };
      const qrBox = panel.querySelector('.vt-qr');
      const qrBtn = panel.querySelector('.vt-qr-btn');
      qrBtn.onclick = async () => {
        const open = qrBtn.getAttribute('aria-expanded') !== 'true';
        qrBtn.setAttribute('aria-expanded', String(open)); qrBtn.innerHTML = say(open ? 'qrHide' : 'qr');
        qrBox.hidden = !open;
        if (!open) return;
        await loadScript('/vendor/qrcode-generator/qrcode.js');
        const url = viewUrl();
        const qr = window.qrcode(0, 'M'); qr.addData(url); qr.make();
        const svg = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true, alt: sayPlain('qrAlt') });
        qrBox.innerHTML = svg + '<button type="button" class="vt-qr-save">' + say('qrSave') + '</button>';
        count('share');
        qrBox.querySelector('.vt-qr-save').onclick = () => {
          const a = doc.createElement('a'); a.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })); a.download = 'vivatheca-' + slug + '-qr.svg'; doc.body.appendChild(a); a.click(); a.remove();
        };
      };
      // Save for offline (public/sw.js, built by tools/offline/build-sw.mjs with Workbox). The service
      // worker is registered only here, on request; it then keeps copies of what this device loads.
      panel.querySelector('.vt-offline').onclick = async (e) => {
        const b = e.currentTarget;
        if (!('serviceWorker' in navigator) || !window.caches) { tell('offlineNo'); return; }
        b.disabled = true; tell('offlineBusy');
        try {
          await navigator.serviceWorker.register('/sw.js');
          await navigator.serviceWorker.ready;
          if (!navigator.serviceWorker.controller) {
            await new Promise((r) => { navigator.serviceWorker.addEventListener('controllerchange', r, { once: true }); setTimeout(r, 4000); });
          }
          const urls = new Set();
          for (const entry of performance.getEntriesByType('resource')) {
            try { const u = new URL(entry.name); if (u.origin === location.origin && !u.pathname.startsWith('/api/')) urls.add(u.pathname + u.search); } catch (err) { /* skip */ }
          }
          const page = new URL(location.href); page.hash = '';
          await (await caches.open('vt-pages')).add(new Request(page.toString(), { credentials: 'same-origin' }));
          await Promise.all([...urls].map((u) => fetch(u, { credentials: 'same-origin' }).catch(() => {})));
          tell('offlineDone');
        } catch (err) { tell('failed'); }
        b.disabled = false;
      };
      panel.querySelector('.vt-pic').onclick = async (e) => {
        const b = e.currentTarget; b.disabled = true;
        try { const img = await captureVisible(group); await readableFonts(Object.values(creditLines(m)).join(' ')); await download(compose([img], m, false), 'vivatheca-' + slug + '.png'); tell('pictureDone'); count('image'); } catch (err) { tell('failed'); }
        b.disabled = false;
      };
      if (hasTour) {
        panel.querySelector('.vt-tour').onclick = () => startTour(group, panel);
        panel.querySelector('.vt-steps').onclick = async (e) => {
          const b = e.currentTarget; b.disabled = true;
          const before = readState(group);
          const steps = tourSteps(group);
          const imgs = [];
          try {
            for (let k = 0; k < steps.length; k++) {
              tell('stepsBusy', { n: k + 1, total: steps.length });
              await goStep(group, steps[k]);
              group.views().forEach((v, i) => { if (before.c[i]) v.set(before.c[i]); });
              await sleep(250);
              imgs.push(await captureVisible(group));
            }
            await readableFonts(Object.values(creditLines(m)).join(' '));
            await download(compose(imgs, m, true), 'vivatheca-' + slug + '-steps.png');
            tell('stepsDone'); count('steps');
          } catch (err) { tell('failed'); }
          await applyState(group, before);
          b.disabled = false;
        };
      }
      if (penPack) {
        const openLink = panel.querySelector('.vt-pack-open');
        const refresh = () => { const n = readPack().length; openLink.hidden = n === 0; openLink.innerHTML = esc(fill(sayPlain('packOpen'), { n })) + ' →'; };
        refresh();
        panel.querySelector('.vt-pen-btn').onclick = async (e) => {
          const b = e.currentTarget; b.disabled = true;
          try { await openPen(group, m, b, { viewUrl, refresh }); } catch (err) { tell('failed'); }
          b.disabled = false;
        };
        panel.querySelector('.vt-pack-add').onclick = async (e) => {
          const b = e.currentTarget; b.disabled = true;
          try {
            const n = addToPack(await captureVisible(group), { slug, href: m.model.href, view: viewUrl(), label: viewLabel(group), drawn: false });
            if (n > 0) { tell('packAdded', { n, max: PACK_MAX }); count('share'); } else tell(n === 0 ? 'packFull' : 'packNoStore', { max: PACK_MAX });
            refresh();
          } catch (err) { tell('failed'); }
          b.disabled = false;
        };
      }
      // Credit in three formats.
      const cBtn = panel.querySelector('.vt-credit-btn'), cBox = panel.querySelector('.vt-credit');
      cBtn.onclick = () => {
        const open = cBtn.getAttribute('aria-expanded') !== 'true';
        cBtn.setAttribute('aria-expanded', String(open)); cBox.hidden = !open;
        if (!open) return;
        const c = credits(m);
        let fmt = 'plain';
        const draw = () => {
          cBox.innerHTML = '<p><strong>' + say('creditHeading').replace('{lic}', esc(m.licence.name)) + '</strong><br>' + say(/BY-SA/.test(m.licence.name) ? 'creditHelp' : 'creditHelpBy') + ' ' + say('citeHelp') + '</p>' +
            '<div class="vt-tabs" role="group">' + [['plain', 'fmtPlain'], ['html', 'fmtHtml'], ['short', 'fmtShort'], ['vancouver', 'fmtVancouver'], ['apa', 'fmtApa'], ['bibtex', 'fmtBibtex'], ['ris', 'fmtRis']].map(([k, w]) => '<button type="button" data-fmt="' + k + '" aria-pressed="' + (fmt === k) + '">' + say(w) + '</button>').join('') + '</div>' +
            '<textarea readonly aria-label="' + esc(sayPlain('creditHeading').replace('{lic}', m.licence.name)) + '">' + esc(c[fmt]) + '</textarea><div class="vt-row"><button type="button" class="vt-copy">' + say('copy') + '</button></div>' + codesHtml(m.model.codes);
          cBox.querySelectorAll('[data-fmt]').forEach((x) => { x.onclick = () => { fmt = x.dataset.fmt; draw(); cBox.querySelector('[data-fmt="' + fmt + '"]').focus(); }; });
          cBox.querySelector('.vt-copy').onclick = async () => { const ok = await copyText(c[fmt]); if (!ok) cBox.querySelector('textarea').select(); tell(ok ? 'copied' : 'linkShown'); count('credit'); };
        };
        draw();
      };
      // Embed code.
      const eBtn = panel.querySelector('.vt-embed-btn'), eBox = panel.querySelector('.vt-embedbox');
      eBtn.onclick = () => {
        const open = eBtn.getAttribute('aria-expanded') !== 'true';
        eBtn.setAttribute('aria-expanded', String(open)); eBox.hidden = !open;
        if (!open) return;
        const u = new URL(viewUrl()); u.searchParams.set('embed', '1'); if (JA || VI) u.searchParams.set('lang', lang);
        const code = '<iframe src="' + esc(u.toString()) + '" title="' + esc(plain(m.model.title[lang]) + ' – Vivatheca') + '" width="100%" height="640" style="border:0;max-width:960px" loading="lazy" allow="fullscreen; xr-spatial-tracking" referrerpolicy="strict-origin-when-cross-origin"></iframe>';
        eBox.innerHTML = '<p>' + say('embedHelp') + '</p><textarea readonly aria-label="' + esc(sayPlain('embed')) + '">' + esc(code) + '</textarea><div class="vt-row"><button type="button" class="vt-copy">' + say('copy') + '</button></div>';
        eBox.querySelector('.vt-copy').onclick = async () => { const ok = await copyText(code); if (!ok) eBox.querySelector('textarea').select(); tell(ok ? 'copied' : 'linkShown'); };
      };
    });
    return panel;
  }

  function loadScript(src) {
    return new Promise((res, rej) => { if (doc.querySelector('script[src="' + src + '"]')) return res(); const s = doc.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; doc.head.appendChild(s); });
  }

  // ---- embed mode: hide everything but the viewer, its controls and the stage caption ----
  function embed(group) {
    doc.documentElement.classList.add('vt-embed');
    const view = group.views()[0];
    const keep = new Set();
    const wrap = group.mount ? group.scope : view.el;
    keep.add(wrap);
    const add = (el) => { if (el && !wrap.contains(el) && !el.closest('header, footer')) keep.add(el); };
    add(doc.querySelector('.vt-parts'));
    add(doc.getElementById('stage'));
    add(doc.getElementById('legend') || doc.querySelector('.legend'));
    // Page controls that sit beside the viewer (stage buttons, views and toggles).
    const controls = [...CHOICE, 'data-orbit', 'data-view'].map((a) => 'button[' + a + ']').concat(TOGGLES.map((id) => '#' + id)).join(',');
    doc.querySelectorAll(controls).forEach((b) => add(b.closest('[role="group"], .controls, .stages, .ages, .choose, .phase, .views') || b.parentElement));
    const path = new Set();
    keep.forEach((el) => { for (let p = el; p && p !== doc.body; p = p.parentElement) path.add(p); });
    path.forEach((p) => {
      if (keep.has(p)) return;
      [...p.children].forEach((c) => { if (!path.has(c) && !/^(SCRIPT|STYLE|LINK)$/.test(c.tagName)) c.setAttribute('data-vt-embed', 'hide'); });
    });
    [...doc.body.children].forEach((c) => { if (!path.has(c) && !/^(SCRIPT|STYLE|LINK)$/.test(c.tagName)) c.setAttribute('data-vt-embed', 'hide'); });
    count('embed');
    meta().then((m) => {
      const bar = doc.createElement('div');
      bar.className = 'vt-embedbar';
      const back = new URL(location.href); back.searchParams.delete('embed');
      bar.innerHTML = m && m.model
        ? '<strong>' + ruby(m.model.title[lang]) + '</strong> · ' + say('embedTitle') + ' · <a href="' + esc(back.toString()) + '" target="_blank" rel="noopener">' + say('embedOpen') + ' ↗</a><br>' +
          '<strong>' + ruby(reviewText(m)) + '</strong> ' + ruby(m.modelDisclaimer[lang]) + ' <a href="' + m.disclaimerHref + '" target="_blank" rel="noopener">vivatheca.com' + m.disclaimerHref + '</a> · © Vivatheca · <a href="' + m.licence.href + '" target="_blank" rel="noopener">' + m.licence.name + '</a>'
        : '<a href="' + esc(back.toString()) + '" target="_blank" rel="noopener">' + say('embedOpen') + '</a>';
      doc.body.appendChild(bar);
    });
  }

  // ---- start ----
  function groups() {
    const mounts = [...doc.querySelectorAll('[data-vt-share]')];
    if (mounts.length) return mounts.map((mt) => makeGroup(doc.querySelector(mt.dataset.vtScope) || mt.parentElement, mt));
    const main = doc.querySelector('main') || doc.body;
    return main.querySelector('model-viewer, #viewer') ? [makeGroup(main, null)] : [];
  }

  async function start() {
    // React pages render their viewers after loading model-viewer: wait for them.
    let gs = groups();
    for (let k = 0; k < 40 && gs.length && gs.some((g) => !g.views().length); k++) { await sleep(150); gs = groups(); }
    gs = gs.filter((g) => g.views().length);
    if (!gs.length) return;
    if (!sessionStorage.getItem('vt-view:' + PATH)) { try { sessionStorage.setItem('vt-view:' + PATH, '1'); } catch (e) { /* private mode */ } count('view'); }
    gs.forEach((g, i) => {
      if (EMBED && i === 0) embed(g);
      else if (!EMBED) buildPanel(g);
    });
    // Count file downloads (3D print files, models, templates).
    doc.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (a && /\.(zip|stl|glb|3mf|pptx|obj)(\?|$)/i.test(a.getAttribute('href'))) count('download');
    });
    // A shared link (?view=...) rebuilds the view once the first model has loaded.
    const v = params.get('view');
    const st = v && dec(v);
    if (st) {
      const g = gs[0];
      for (let k = 0; k < 60 && !g.views().every((x) => (x.el.tagName === 'MODEL-VIEWER' ? x.el.loaded : x.el.vtView)); k++) await sleep(200);
      await sleep(300);
      try { await applyState(g, st); } catch (e) { /* an old or broken link: keep the default view */ }
    }
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start); else start();
})();
