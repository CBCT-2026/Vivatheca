// Language for this static page. It reads the same cookie as the rest of the site
// ('vivatheca-lang', see app/i18n/config.ts), so a visitor's choice carries over.
// English is the text in index.html; Japanese replaces every [data-i18n] element.
// {漢字|かんじ} marks furigana, shown as ruby above the kanji (hidden when 'vivatheca-furigana' is off).
(function () {
  const YEAR = 60 * 60 * 24 * 365;
  const cookie = (name) => (document.cookie.match('(?:^|; )' + name + '=([^;]*)') || [])[1];
  const lang = cookie('vivatheca-lang') === 'ja' ? 'ja' : 'en';
  const furigana = cookie('vivatheca-furigana') !== 'off';
  const ruby = (s) => s.replace(/\{([^{}|]+)\|([^{}]+)\}/g,
    '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');
  const plain = (s) => s.replace(/\{([^{}|]+)\|([^{}]+)\}/g, '$1');
  const cite = (n) => '<sup class="cite"><a href="#ref-' + n + '">' + n + '</a></sup>';

  const ja = {
    title: 'あごと{口蓋|こうがい}の{手術|しゅじゅつ}：{何|なに}を{取|と}るのか、なぜ{病気|びょうき}で{違|ちが}うのか | Vivatheca',
    description: 'あごと{口蓋|こうがい}の6つの{病気|びょうき}で、{骨|ほね}・{歯|は}・{粘膜|ねんまく}をどれだけ{取|と}るのか、{欠損|けっそん}をどう{閉|と}じるのかを{示|しめ}す3D{症例|しょうれい}。{切|き}り{方|かた}はすべて{公表|こうひょう}された{指針|ししん}にもとづきます。',
    home: 'Vivathecaホーム',
    allModels: '{模型|もけい}{一覧|いちらん}',
    h1: 'あごと{口蓋|こうがい}の{手術|しゅじゅつ}：{何|なに}を{取|と}るのか、なぜ{病気|びょうき}によって{違|ちが}うのか',
    lede: '{同|おな}じ{大人|おとな}のあごを{使|つか}った、{実物|じつぶつ}{大|だい}の6つの{症例|しょうれい}です。{下|した}あごが3つ、{口蓋|こうがい}（{上|うわ}あご）が3つあります。それぞれ、{病変|びょうへん}、{安全|あんぜん}{域|いき}（マージン）、{外科医|げかい}が{取|と}るもの（{骨|ほね}・{歯|は}・{粘膜|ねんまく}）、{残|のこ}る{欠損|けっそん}、そして{欠損|けっそん}の{閉|と}じ{方|かた}を{示|しめ}します。',
    viewOnly: '<b>{現在|げんざい}は3D{表示|ひょうじ}のみです。</b>3Dプリント{用|よう}ファイルは{模型|もけい}の{完成|かんせい}{後|ご}に{公開|こうかい}する{予定|よてい}ですが、まだ{用意|ようい}していません。',
    groupLower: '{下|した}あご',
    groupPalate: '{口蓋|こうがい}（{上|うわ}あご）',
    c_scc: 'へんぺい{上皮|じょうひ}がん',
    c_ameloblastoma: 'エナメル{上皮腫|じょうひしゅ}',
    c_okc: '{歯原性|しげんせい}{角化|かくか}のう{胞|ほう}',
    c_pa: '{多形|たけい}{腺腫|せんしゅ}',
    c_mec: '{粘表皮|ねんひょうひ}がん',
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
    compareH: '{医療者向|いりょうしゃむ}け：6つの{症例|しょうれい}の{比較|ひかく}',
    thead: '<tr><th>{病気|びょうき}</th><th>{手術|しゅじゅつ}</th><th>{模型|もけい}の{安全|あんぜん}{域|いき}</th><th>{取|と}る{歯|は}</th><th>{取|と}る{粘膜|ねんまく}</th><th>{欠損|けっそん}の{閉|と}じ{方|かた}</th></tr>',
    tbody: '<tr><td>へんぺい{上皮|じょうひ}がん（がん）</td><td>{下|した}あごの{区域|くいき}{切除|せつじょ}</td><td>{骨|ほね}10mm{以上|いじょう}</td><td>44〜47は{骨|ほね}と{一緒|いっしょ}に、43は{切|き}り{口|くち}で</td><td>がんの{周|まわ}り1〜1.5cmの{歯|は}ぐきと{粘膜|ねんまく}</td><td>ひ{骨|こつ}{皮弁|ひべん}（{模型|もけい}あり）</td></tr>'
      + '<tr><td>エナメル{上皮腫|じょうひしゅ}（{良性|りょうせい}だが{広|ひろ}がる）</td><td>{区域|くいき}{切除|せつじょ}</td><td>{骨|ほね}15mm{以上|いじょう}</td><td>44〜47は{骨|ほね}と{一緒|いっしょ}に、43は{切|き}り{口|くち}で</td><td>{腫瘍|しゅよう}の{上|うえ}の{歯|は}ぐき</td><td>ひ{骨|こつ}{皮弁|ひべん}（{模型|もけい}あり）</td></tr>'
      + '<tr><td>{歯原性|しげんせい}{角化|かくか}のう{胞|ほう}（のう{胞|ほう}）</td><td>{摘出|てきしゅつ}と{辺縁|へんえん}{骨|こつ}{切除|せつじょ}</td><td>{骨|ほね}を1.5mm{削|けず}る</td><td>なし（47は{残|のこ}して{確認|かくにん}）</td><td>のう{胞|ほう}が{破|やぶ}れているところだけ</td><td>{自然|しぜん}に{治|なお}る</td></tr>'
      + '<tr><td>{多形|たけい}{腺腫|せんしゅ}（{良性|りょうせい}）</td><td>{広|ひろ}めの{局所|きょくしょ}{切除|せつじょ}</td><td>{正常|せいじょう}{粘膜|ねんまく}と{骨膜|こつまく}を{付|つ}ける</td><td>なし</td><td>{口蓋|こうがい}の{粘膜|ねんまく}と{骨膜|こつまく}</td><td>{自然|しぜん}に{治|なお}る、または{近|ちか}くの{皮弁|ひべん}</td></tr>'
      + '<tr><td>{粘表皮|ねんひょうひ}がん</td><td>{上顎|じょうがく}{部分|ぶぶん}{切除|せつじょ}（{下|した}の{部分|ぶぶん}）</td><td>10mm{以上|いじょう}</td><td>15〜17は{骨|ほね}と{一緒|いっしょ}に、14は{切|き}り{口|くち}で</td><td>{口蓋|こうがい}、{歯|は}ぐき、{上顎洞|じょうがくどう}の{底|そこ}</td><td>{顎|がく}{義歯|ぎし}（{模型|もけい}あり）または{皮弁|ひべん}</td></tr>'
      + '<tr><td>{腺様|せんよう}のう{胞|ほう}がん</td><td>{翼状|よくじょう}{突起|とっき}を{含|ふく}む{上顎|じょうがく}{切除|せつじょ}</td><td>10mm{以上|いじょう}、{神経|しんけい}に{沿|そ}って{上|うえ}に20mm</td><td>16〜17は{骨|ほね}と{一緒|いっしょ}に、15は{切|き}り{口|くち}で</td><td>{口蓋|こうがい}、{歯|は}ぐき、{上顎洞|じょうがくどう}の{底|そこ}</td><td>{遊離|ゆうり}{皮弁|ひべん}（{模型|もけい}あり）または{顎|がく}{義歯|ぎし}</td></tr>',
    aboutH: 'これらの{模型|もけい}について',
    about1: '<strong>{臨床|りんしょう}レビュー{未実施|みじっし}。</strong>{教育用|きょういくよう}の{模型|もけい}です。{特定|とくてい}の{患者|かんじゃ}ではなく{一般的|いっぱんてき}な{解剖|かいぼう}や{疾患|しっかん}を{示|しめ}したもので、{簡略化|かんりゃくか}されており{誤|あやま}りを{含|ふく}む{可能性|かのうせい}があります。{診断|しんだん}、{治療|ちりょう}{計画|けいかく}、{手術|しゅじゅつ}ガイド、{体内|たいない}・{体表|たいひょう}での{使用|しよう}には{用|もち}いないでください。<a href="/disclaimer">{免責|めんせき}{事項|じこう}の{全文|ぜんぶん}</a>',
    about2: '{試作版|しさくばん}です。{病変|びょうへん}は{単純|たんじゅん}な{形|かたち}で、{大|おお}きさは{引用|いんよう}した{症例|しょうれい}{報告|ほうこく}にもとづきます。{歯|は}ぐき、{口蓋|こうがい}の{粘膜|ねんまく}、{筋肉|きんにく}は、{取|と}る{部分|ぶぶん}{以外|いがい}は{模型|もけい}にしていません。がんの{治療|ちりょう}では{首|くび}の{手術|しゅじゅつ}も{行|おこな}うことが{多|おお}いですが、{首|くび}は{示|しめ}していません。{頭蓋骨|ずがいこつ}の{模型|もけい}には{親知|おやし}らずがありません。{指針|ししん}に{数字|すうじ}がないところは、{症例|しょうれい}の{説明|せつめい}に{当方|とうほう}の{設定|せってい}として{書|か}いています。',
    credit: '3D{模型|もけい}：Z-Anatomy（{自由|じゆう}に{使|つか}える3D{解剖|かいぼう}アトラス、CC BY-SA 4.0）をもとにVivathecaが{作成|さくせい}しました。Z-AnatomyはBodyParts3D（ライフサイエンス{統合|とうごう}データベースセンター、CC BY-SA 2.1 {日本|にほん}）を{使用|しよう}しています。{変更|へんこう}{点|てん}：メッシュの{作|つく}り{直|なお}し、{切断|せつだん}、{病変|びょうへん}と{補綴|ほてつ}{物|ぶつ}の{追加|ついか}、{色|いろ}の{変更|へんこう}。これらの{模型|もけい}は<a href="https://creativecommons.org/licenses/by-sa/4.0/deed.ja">CC BY-SA 4.0</a>でライセンスされています。3Dビューア：three.js（MITライセンス）。フォント：Manrope（SIL Open Font License）。',
    sourcesH: '{出典|しゅってん}（{英語|えいご}）',
    version: 'バージョン0.2、2026{年|ねん}11{月|がつ}5{日|か}。',
    noWebgl: 'このブラウザでは3Dを{表示|ひょうじ}できません（WebGLがオフです）。ブラウザの{設定|せってい}でハードウェアアクセラレーションをオンにするか、{別|べつ}のブラウザで{開|ひら}いてください。',
    loadFailed: '3D{模型|もけい}を{読|よ}み{込|こ}めませんでした。ページを{再読|さいよ}み{込|こ}みしてください。',
  };

  const ui = { en: { label: 'Language', furigana: 'Furigana' }, ja: { label: '言語', furigana: 'ふりがな' } };

  window.VIVA_I18N = {
    lang,
    // Text for a key in the visitor's language, or null to keep the English in the page.
    text: (key, values) => {
      if (lang !== 'ja' || !(key in ja)) return null;
      let s = ja[key];
      for (const k in values || {}) s = s.replace('{' + k + '}', values[k]);
      return s;
    },
    ruby,
    plain,
  };

  if (lang === 'ja') {
    document.documentElement.lang = 'ja';
    document.title = plain(ja.title);
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = plain(ja.description);
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const s = ja[el.dataset.i18n];
      if (s) el.innerHTML = ruby(s);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const s = ja[el.dataset.i18nAria];
      if (s) el.setAttribute('aria-label', plain(s));
    });
  }
  document.documentElement.dataset.furigana = furigana ? 'on' : 'off';

  // Language switcher in the top bar.
  const box = document.getElementById('langs');
  if (!box) return;
  box.setAttribute('aria-label', ui[lang].label);
  const set = (name, value) => { document.cookie = name + '=' + value + '; path=/; max-age=' + YEAR + '; samesite=lax'; };
  [['en', 'English'], ['ja', '日本語']].forEach(([code, name]) => {
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
