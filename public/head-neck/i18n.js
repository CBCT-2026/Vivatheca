// Language for this static page. It reads the same cookie as the rest of the site
// ('vivatheca-lang', see app/i18n/config.ts), so a visitor's choice carries over.
// English is the text in index.html; Japanese replaces every [data-i18n] element.
// {漢字|かんじ} marks furigana, shown as ruby above the kanji (hidden when 'vivatheca-furigana' is off).
(function () {
  const YEAR = 60 * 60 * 24 * 365;
  const cookie = (name) => (document.cookie.match('(?:^|; )' + name + '=([^;]*)') || [])[1];
  const chosen = cookie('vivatheca-lang');
  const lang = chosen === 'ja' || chosen === 'vi' ? chosen : 'en';
  const furigana = cookie('vivatheca-furigana') !== 'off';
  const ruby = (s) => s.replace(/\{([^{}|]+)\|([^{}]+)\}/g,
    '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');
  const plain = (s) => s.replace(/\{([^{}|]+)\|([^{}]+)\}/g, '$1');
  const cite = (n) => '<sup class="cite"><a href="#ref-' + n + '">' + n + '</a></sup>';

  const ja = {
    title: '{頭頸部|とうけいぶ}：{公開|こうかい}{症例|しょうれい}の3D{模型|もけい} | Vivatheca',
    description: '{頭|あたま}と{首|くび}の{模型|もけい}：{公開|こうかい}された4つの{症例|しょうれい}（{口|くち}のがん、エナメル{上皮腫|じょうひしゅ}、{角化|かくか}のう{胞|ほう}、{口|くち}の{天井|てんじょう}のだ{液|えき}{腺|せん}のがん）を3Dで{再現|さいげん}し、{実際|じっさい}のX{線|せん}{写真|しゃしん}や{写真|しゃしん}と{一緒|いっしょ}に{示|しめ}します。{一般的|いっぱんてき}な{口蓋|こうがい}の{模型|もけい}も2つあります。',
    home: 'Vivathecaホーム',
    allModels: '{模型|もけい}{一覧|いちらん}',
    h1: '<span class="pitk-skip">{頭頸部|とうけいぶ}</span>',
    termsLabel: '{名称|めいしょう}と{分類|ぶんるい}：',
    lede: 'あごと{口|くち}の{病気|びょうき}を3Dで{示|しめ}します。4つの{症例|しょうれい}ページは、それぞれ{論文|ろんぶん}で{公開|こうかい}された1{人|り}の{患者|かんじゃ}さんに{合|あ}わせています。3D{模型|もけい}はその{人|ひと}のX{線|せん}{写真|しゃしん}や{写真|しゃしん}と{同|おな}じで、{外科医|げかい}が{何|なに}を{取|と}り、すき{間|ま}をどう{閉|と}じたか、その{理由|りゆう}を{説明|せつめい}します。',
    viewOnly: '<b>{現在|げんざい}は3D{表示|ひょうじ}のみです。</b>3Dプリント{用|よう}ファイルは{模型|もけい}の{完成|かんせい}{後|ご}に{公開|こうかい}する{予定|よてい}ですが、まだ{用意|ようい}していません。',
    groupPalate: '{口蓋|こうがい}（{上|うわ}あご）',
    c_pa: '{多形|たけい}{腺腫|せんしゅ}',
    c_acc: '{腺様|せんよう}のう{胞|ほう}がん',
    loading: '{模型|もけい}を{読|よ}み{込|こ}み{中|ちゅう}…',
    hint: 'ドラッグで{回転|かいてん}・ピンチやスクロールで{拡大|かくだい}',
    stage: '{段階|だんかい}',
    s_pre: '1・{手術|しゅじゅつ}の{前|まえ}',
    s_op: '2・{取|と}るもの',
    s_post: '3・{残|のこ}る{欠損|けっそん}',
    s_recon: '4・{欠損|けっそん}を{閉|と}じる',
    t_margin: '{安全|あんぜん}{域|いき}',
    t_xray: '{骨|ほね}を{透|す}かす',
    view: '{見|み}る{向|む}き',
    v_front: '{正面|しょうめん}',
    v_side: '{右側|みぎがわ}',
    v_under: '{下|した}から',
    v_above: '{上|うえ}から',
    rulesH: 'すべての{症例|しょうれい}に{共通|きょうつう}するルール',
    rule1: '{口|くち}に{残|のこ}る{歯|は}は{切|き}りません。{骨|ほね}の{切|き}り{口|くち}は、{手術|しゅじゅつ}のときに{抜|ぬ}く{歯|は}の{穴|あな}を{通|とお}します。{取|と}る{骨|ほね}の{中|なか}の{歯|は}は{骨|ほね}と{一緒|いっしょ}に{取|と}ります。' + cite(2),
    rule2: '{安全|あんぜん}{域|いき}は{描|か}いたものではなく{測|はか}ったものです。{病変|びょうへん}から{切|き}り{口|くち}までの{距離|きょり}が、{引用|いんよう}した{指針|ししん}の{目標|もくひょう}に{達|たっ}するまで{切|き}り{口|くち}を{動|うご}かしました。',
    rule3: '{骨|ほね}の{切|き}り{口|くち}のとなりの{歯|は}は{残|のこ}しますが、{神経|しんけい}が{弱|よわ}ることがあるので、{手術|しゅじゅつ}の{後|あと}に{確認|かくにん}します。' + cite(5),
    compareH: '{医療者向|いりょうしゃむ}け：6つの{模型|もけい}の{比較|ひかく}',
    thead: '<tr><th>{病気|びょうき}</th><th>{手術|しゅじゅつ}</th><th>{模型|もけい}の{安全|あんぜん}{域|いき}</th><th>{取|と}る{歯|は}</th><th>{取|と}る{粘膜|ねんまく}</th><th>{欠損|けっそん}の{閉|と}じ{方|かた}</th></tr>',
    tbody: '<tr><td>へんぺい{上皮|じょうひ}がん（がん）</td><td>{下|した}あごの{区域|くいき}{切除|せつじょ}、{右|みぎ}の{関節|かんせつ}{突起|とっき}から31/32まで（{症例|しょうれい}のX{線|せん}{写真|しゃしん}から）</td><td>{前|まえ}の{切|き}り{口|くち}で{約|やく}1cm（{模型|もけい}では8.5mm）</td><td>41〜47と31</td><td>がんのまわりの{歯|は}ぐきと{粘膜|ねんまく}</td><td>3つに{分|わ}けたひ{骨|こつ}{皮弁|ひべん}（{模型|もけい}あり）</td></tr><tr><td>エナメル{上皮腫|じょうひしゅ}（がんではないが{広|ひろ}がる）</td><td>32〜35の{辺縁|へんえん}{切除|せつじょ}</td><td>{記載|きさい}なし。{下|した}のふち{約|やく}6mmを{残|のこ}す</td><td>32〜35</td><td>{病変|びょうへん}の{上|うえ}の{歯|は}ぐき</td><td>{下|した}のふちに{沿|そ}ったプレート（{模型|もけい}あり）</td></tr><tr><td>{歯原性|しげんせい}{角化|かくか}のう{胞|ほう}（のう{胞|ほう}）</td><td>{摘出|てきしゅつ}、{周辺|しゅうへん}{骨|こつ}{削除|さくじょ}、34と35の{歯根端|しこんたん}{切除|せつじょ}</td><td>{骨|ほね}を1.5mm{削|けず}る</td><td>なし（34と35の{根|ね}の{先|さき}を{切|き}る）</td><td>{窓|まど}の{部分|ぶぶん}だけ</td><td>PRF、{自然|しぜん}に{治|なお}る</td></tr><tr><td>{粘表皮|ねんひょうひ}がん（{低悪性度|ていあくせいど}）</td><td>{広|ひろ}めの{局所|きょくしょ}{切除|せつじょ}、{骨|ほね}は{残|のこ}す</td><td>{粘膜|ねんまく}5mm、{深|ふか}い{側|がわ}は{骨膜|こつまく}</td><td>なし</td><td>{口蓋|こうがい}の{粘膜|ねんまく}と{骨膜|こつまく}</td><td>{保護|ほご}{床|しょう}とパック、{自然|しぜん}に{治|なお}る（{模型|もけい}あり）</td></tr><tr><td>{多形|たけい}{腺腫|せんしゅ}（{良性|りょうせい}）</td><td>{広|ひろ}めの{局所|きょくしょ}{切除|せつじょ}</td><td>{正常|せいじょう}{粘膜|ねんまく}と{骨膜|こつまく}を{付|つ}ける</td><td>なし</td><td>{口蓋|こうがい}の{粘膜|ねんまく}と{骨膜|こつまく}</td><td>{自然|しぜん}に{治|なお}る、または{近|ちか}くの{皮弁|ひべん}</td></tr><tr><td>{腺様|せんよう}のう{胞|ほう}がん</td><td>{翼状|よくじょう}{突起|とっき}を{含|ふく}む{上顎|じょうがく}{切除|せつじょ}</td><td>10mm{以上|いじょう}、{神経|しんけい}に{沿|そ}って{上|うえ}に20mm</td><td>16〜17は{骨|ほね}と{一緒|いっしょ}に、15は{切|き}り{口|くち}で</td><td>{口蓋|こうがい}、{歯|は}ぐき、{上顎洞|じょうがくどう}の{底|そこ}</td><td>{遊離|ゆうり}{皮弁|ひべん}（{模型|もけい}あり）または{顎|がく}{義歯|ぎし}</td></tr>',
    casesH: '4つの{実際|じっさい}の{症例|しょうれい}',
    card_scc: '<span class="pitk-skip">{下顎|かがく}{歯肉|しにく}{扁平|へんぺい}{上皮|じょうひ}{癌|がん}：{下顎骨|かがくこつ}{区域|くいき}{切除|せつじょ}と{遊離|ゆうり}{腓骨|ひこつ}{皮弁|ひべん}による{再建|さいけん}</span>',
    card_scc_d: '72{歳|さい}の{女性|じょせい}の{症例|しょうれい}。{下|した}あごの{右側|みぎがわ}を{取|と}り、{足|あし}の{骨|ほね}（ひ{骨|こつ}）で{作|つく}り{直|なお}しました。',
    card_ameloblastoma: '<span class="pitk-skip">{下顎|かがく}エナメル{上皮腫|じょうひしゅ}：{下顎骨|かがくこつ}{辺縁|へんえん}{切除|せつじょ}</span>',
    card_ameloblastoma_d: '4{本|ほん}の{歯|は}と{一緒|いっしょ}に{左下|ひだりした}のあごの{上|うえ}の{部分|ぶぶん}を{取|と}り、{薄|うす}いふちをプレートで{支|ささ}えます。',
    card_okc: '<span class="pitk-skip">{下顎|かがく}の{歯原性|しげんせい}{角化|かくか}{嚢胞|のうほう}：{摘出|てきしゅつ}と{周囲|しゅうい}{骨|こつ}{削除|さくじょ}</span>',
    card_okc_d: '2{本|ほん}の{根|ね}の{先|さき}の{袋|ふくろ}を{取|と}り、{骨|ほね}の{壁|かべ}を{削|けず}りました。8つの{治療|ちりょう}{方法|ほうほう}と{再発|さいはつ}の{割合|わりあい}も{示|しめ}します。',
    card_mec: '<span class="pitk-skip">{硬口蓋|こうこうがい}の{低悪性度|ていあくせいど}{粘表皮癌|ねんぴょうひがん}：{広範|こうはん}{局所|きょくしょ}{切除|せつじょ}</span>',
    card_mec_d: 'まわりの{粘膜|ねんまく}と{一緒|いっしょ}にしこりを{取|と}り、{骨|ほね}は{残|のこ}して、{保護|ほご}{板|ばん}の{下|した}で{治|なお}りました。',
    typicalH: '{口蓋|こうがい}の{模型|もけい}をあと2つ',
    typicalP: 'この2つは、1{人|り}の{患者|かんじゃ}さんではなく、{公開|こうかい}された{指針|ししん}にもとづく{一般的|いっぱんてき}な{症例|しょうれい}です。',
    aboutH: 'これらの{模型|もけい}について',
    about1: '<strong>{臨床|りんしょう}レビュー{未実施|みじっし}。</strong>{教育用|きょういくよう}の{模型|もけい}です。{特定|とくてい}の{患者|かんじゃ}ではなく{一般的|いっぱんてき}な{解剖|かいぼう}や{疾患|しっかん}を{示|しめ}したもので、{簡略化|かんりゃくか}されており{誤|あやま}りを{含|ふく}む{可能性|かのうせい}があります。{診断|しんだん}、{治療|ちりょう}{計画|けいかく}、{手術|しゅじゅつ}ガイド、{体内|たいない}・{体表|たいひょう}での{使用|しよう}には{用|もち}いないでください。<a href="/disclaimer">{免責|めんせき}{事項|じこう}の{全文|ぜんぶん}</a>',
    about2: '{試作版|しさくばん}です。{病変|びょうへん}は{単純|たんじゅん}な{形|かたち}で、{大|おお}きさは{引用|いんよう}した{症例|しょうれい}{報告|ほうこく}にもとづきます。{歯|は}ぐき、{口蓋|こうがい}の{粘膜|ねんまく}、{筋肉|きんにく}は、{取|と}る{部分|ぶぶん}{以外|いがい}は{模型|もけい}にしていません。がんの{治療|ちりょう}では{首|くび}の{手術|しゅじゅつ}も{行|おこな}うことが{多|おお}いですが、{首|くび}は{示|しめ}していません。{頭蓋骨|ずがいこつ}の{模型|もけい}には{親知|おやし}らずがありません。{指針|ししん}に{数字|すうじ}がないところは、{症例|しょうれい}の{説明|せつめい}に{当方|とうほう}の{設定|せってい}として{書|か}いています。',
    credit: '3D{模型|もけい}：Z-Anatomy（{自由|じゆう}に{使|つか}える3D{解剖|かいぼう}アトラス、CC BY-SA 4.0）をもとにVivathecaが{作成|さくせい}しました。Z-AnatomyはBodyParts3D（ライフサイエンス{統合|とうごう}データベースセンター、CC BY-SA 2.1 {日本|にほん}）を{使用|しよう}しています。{変更|へんこう}{点|てん}：メッシュの{作|つく}り{直|なお}し、{切断|せつだん}、{病変|びょうへん}と{補綴|ほてつ}{物|ぶつ}の{追加|ついか}、{色|いろ}の{変更|へんこう}。これらの{模型|もけい}は<a href="https://creativecommons.org/licenses/by-sa/4.0/deed.ja">CC BY-SA 4.0</a>でライセンスされています。3Dビューア：three.js（MITライセンス）。フォント：Manrope（SIL Open Font License）。',
    sourcesH: '{出典|しゅってん}（{英語|えいご}）',
    version: 'バージョン1.1、2026{年|ねん}11{月|がつ}6{日|か}。',
    noWebgl: 'このブラウザでは3Dを{表示|ひょうじ}できません（WebGLがオフです）。ブラウザの{設定|せってい}でハードウェアアクセラレーションをオンにするか、{別|べつ}のブラウザで{開|ひら}いてください。',
    loadFailed: '3D{模型|もけい}を{読|よ}み{込|こ}めませんでした。ページを{再読|さいよ}み{込|こ}みしてください。',
  };
  // Vietnamese (unreviewed AI draft; English prevails) comes from vi.js (window.VIVA_VI), with the same keys.
  const tr = lang === 'vi' ? (window.VIVA_VI || {}) : ja; // active translation (Japanese above, or Vietnamese from vi.js)

  const ui = { en: { label: 'Language', furigana: 'Furigana' }, ja: { label: '言語', furigana: 'ふりがな' }, vi: { label: 'Ngôn ngữ' } };

  window.VIVA_I18N = {
    lang,
    // Text for a key in the visitor's language, or null to keep the English in the page.
    text: (key, values) => {
      if (lang === 'en' || !(key in tr)) return null;
      let s = tr[key];
      for (const k in values || {}) s = s.replace('{' + k + '}', values[k]);
      return s;
    },
    ruby,
    plain,
  };

  if (lang !== 'en') {
    document.documentElement.lang = lang;
    document.title = plain(tr.title);
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = plain(tr.description);
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const s = tr[el.dataset.i18n];
      if (s) el.innerHTML = ruby(s);
    });
    document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
      const s = tr[el.dataset.i18nAlt];
      if (s) el.alt = plain(s);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const s = tr[el.dataset.i18nAria];
      if (s) el.setAttribute('aria-label', plain(s));
    });
  }
  document.documentElement.dataset.furigana = furigana ? 'on' : 'off';

  // Language switcher in the top bar.
  const box = document.getElementById('langs');
  if (!box) return;
  box.setAttribute('aria-label', ui[lang].label);
  const set = (name, value) => { document.cookie = name + '=' + value + '; path=/; max-age=' + YEAR + '; samesite=lax'; };
  [['en', 'English'], ['ja', '日本語'], ['vi', 'Tiếng Việt']].forEach(([code, name]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.lang = code;
    b.textContent = name;
    b.setAttribute('aria-pressed', String(code === lang));
    b.addEventListener('click', () => { if (code !== lang) { set('vivatheca-lang', code); location.reload(); } });
    box.append(b);
  });
  if (lang === 'ja') {
    const f = document.createElement('button');
    f.type = 'button';
    f.textContent = ui.ja.furigana;
    f.setAttribute('aria-pressed', String(furigana));
    f.addEventListener('click', () => {
      const on = f.getAttribute('aria-pressed') !== 'true';
      set('vivatheca-furigana', on ? 'on' : 'off');
      document.documentElement.dataset.furigana = on ? 'on' : 'off';
      f.setAttribute('aria-pressed', String(on));
    });
    box.append(f);
  }
})();
