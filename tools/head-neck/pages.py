"""Builds the four head and neck condition pages: public/head-neck/<slug>/index.html and ja.js.

Each page follows one published, openly licensed case. English is written into index.html;
Japanese goes into ja.js (window.VIVA_JA), which ../i18n-engine.js swaps in by data-i18n key.
Japanese text uses {漢字|かんじ} for furigana and {cite:N} for a citation.
Run: python3 tools/head-neck/pages.py   (after editing the text below)
"""
import html
import json
import os

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
PUB = os.path.join(ROOT, 'public', 'head-neck')
VERSION_EN = 'Version 1.0, 6 November 2026.'
VERSION_JA = 'バージョン1.0、2026{年|ねん}11{月|がつ}6{日|か}。'
CCBY = '<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>'


def cite(*n):
    return ''.join(f'<sup class="cite"><a href="#ref-{i}">{i}</a></sup>' for i in n)


def jcite(*n):
    return ''.join('{cite:%d}' % i for i in n)


COMMON_JA = {
    'home': 'Vivathecaホーム',
    'allModels': '{模型|もけい}{一覧|いちらん}',
    'hub': '{頭頸部|とうけいぶ}の{一覧|いちらん}'.replace('{頭頸部|とうけいぶ}', '{頭|あたま}と{首|くび}'),
    'viewOnly': '<b>{現在|げんざい}は3D{表示|ひょうじ}のみです。</b>3Dプリント{用|よう}ファイルはまだ{用意|ようい}していません。',
    'loading': '{模型|もけい}を{読|よ}み{込|こ}み{中|ちゅう}…',
    'hint': 'ドラッグで{回転|かいてん}・ピンチやスクロールで{拡大|かくだい}',
    'stage': '{段階|だんかい}',
    'view': '{見|み}る{向|む}き',
    't_margin': '{安全|あんぜん}{域|いき}',
    't_xray': '{骨|ほね}を{透|す}かす',
    'v_front': '{正面|しょうめん}', 'v_right': '{右側|みぎがわ}', 'v_left': '{左側|ひだりがわ}', 'v_under': '{下|した}から', 'v_above': '{上|うえ}から',
    'clinNote': 'これらは{実際|じっさい}の{患者|かんじゃ}さんの{画像|がぞう}で、{著者|ちょしゃ}が{公開|こうかい}したものです。{画像|がぞう}ごとのライセンスは{下|した}に{書|か}いてあり、{模型|もけい}のライセンスとは{別|べつ}です。',
    'surgShow': '{手術中|しゅじゅつちゅう}の{写真|しゃしん}を{見|み}る（{血|ち}が{写|うつ}っています）',
    'aboutH': 'この{模型|もけい}について',
    'about1': '<strong>{臨床|りんしょう}レビュー{未実施|みじっし}。</strong>{教育用|きょういくよう}の{模型|もけい}です。{特定|とくてい}の{患者|かんじゃ}ではなく{一般的|いっぱんてき}な{解剖|かいぼう}や{疾患|しっかん}を{示|しめ}したもので、{簡略化|かんりゃくか}されており{誤|あやま}りを{含|ふく}む{可能性|かのうせい}があります。{診断|しんだん}、{治療|ちりょう}{計画|けいかく}、{手術|しゅじゅつ}ガイド、{体内|たいない}・{体表|たいひょう}での{使用|しよう}には{用|もち}いないでください。<a href="/disclaimer">{免責|めんせき}{事項|じこう}の{全文|ぜんぶん}</a>',
    'about2': '{試作版|しさくばん}です。{模型|もけい}は{公開|こうかい}された1つの{症例|しょうれい}に{合|あ}わせて{作|つく}りましたが、{同|おな}じ{人|ひと}のあごではありません。{病変|びょうへん}は{単純|たんじゅん}な{形|かたち}です。{論文|ろんぶん}に{数字|すうじ}がないところは、「{医療者向|いりょうしゃむ}け」の{欄|らん}に{当方|とうほう}の{設定|せってい}として{書|か}いています。',
    'credit': '3D{模型|もけい}：Z-Anatomy（CC BY-SA 4.0）をもとにVivathecaが{作成|さくせい}しました。Z-AnatomyはBodyParts3D（ライフサイエンス{統合|とうごう}データベースセンター、CC BY-SA 2.1 {日本|にほん}）を{使用|しよう}しています。{変更|へんこう}{点|てん}：メッシュの{作|つく}り{直|なお}し、{切断|せつだん}、{病変|びょうへん}と{金属|きんぞく}などの{追加|ついか}、{色|いろ}の{変更|へんこう}。これらの{模型|もけい}は<a href="https://creativecommons.org/licenses/by-sa/4.0/deed.ja">CC BY-SA 4.0</a>でライセンスされています。{図|ず}もVivathecaの{作成|さくせい}で、{同|おな}じライセンスです。3Dビューア：three.js（MITライセンス）。フォント：Manrope（SIL Open Font License）。',
    'sourcesH': '{出典|しゅってん}（{英語|えいご}）',
    'version': VERSION_JA,
    'noWebgl': 'このブラウザでは3Dを{表示|ひょうじ}できません（WebGLがオフです）。ブラウザの{設定|せってい}でハードウェアアクセラレーションをオンにするか、{別|べつ}のブラウザで{開|ひら}いてください。',
    'loadFailed': '3D{模型|もけい}を{読|よ}み{込|こ}めませんでした。ページを{再読|さいよ}み{込|こ}みしてください。',
}
COMMON_JA['hub'] = '{頭|あたま}と{首|くび}の{一覧|いちらん}'

ABOUT2_EN = ('Prototype. The model was made to match one published case, but it is not that person’s jaw. '
             'The disease is a simple shape. Where the article gives no number, our modelling choice is stated under “For clinicians”.')
CREDIT_EN = ('3D models: made by Vivatheca from Z-Anatomy (the libre 3D atlas of anatomy, CC BY-SA 4.0), which uses BodyParts3D '
             '(The Database Center for Life Science, CC BY-SA 2.1 Japan). Changed: remeshed, cut, disease and metalwork added, recoloured. '
             'These models are licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. '
             'Diagrams: made by Vivatheca, same licence. 3D viewer: three.js (MIT licence). Font: Manrope (SIL Open Font Licence).')


def credit(article, fig, doi, changes, consent):
    return (f'<span class="credit">{article}, {fig}. <a href="https://doi.org/{doi}">doi.org/{doi}</a>. '
            f'Licence: {CCBY}. Changes: {changes} {consent}</span>')


# ---------------------------------------------------------------------------------------------
PAGES = {}

# ============================== SCC ==============================
VERG = 'Vergier V, Czarny K, Brau J-J, Le Pelletier F, Taihi I. Proliferative verrucous leukoplakia presenting as a ring around the collar and cancer: a case report. Cureus. 2024;16(3):e56077'
VERG_CONSENT = 'The journal states that consent was obtained or waived.'
PAGES['scc'] = dict(
    model='/head-neck/models/scc-case.glb', jaw='mandible', side='right', margin=True,
    title=('Mouth cancer in the lower jaw: part of the jaw rebuilt with leg bone | Vivatheca',
           '{下|した}あごの{口|くち}のがん：あごの{一部|いちぶ}を{足|あし}の{骨|ほね}で{作|つく}り{直|なお}す | Vivatheca'),
    description=('A 3D model that follows one published case of mouth cancer on the right lower gum: what was removed and how the jaw was rebuilt with a fibula flap.',
                 '{右下|みぎした}の{歯|は}ぐきにできた{口|くち}のがんの{公開|こうかい}{症例|しょうれい}に{合|あ}わせた3D{模型|もけい}です。{何|なに}を{取|と}り、ひ{骨|こつ}{皮弁|ひべん}であごをどう{作|つく}り{直|なお}したかを{示|しめ}します。'),
    h1=('Mouth cancer in the lower jaw <span class="pitk-skip">(squamous cell carcinoma)</span>',
        '{下|した}あごの{口|くち}のがん<span class="pitk-skip">（へんぺい{上皮|じょうひ}がん）</span>'),
    lede=('This 3D model follows one real, published case. A woman aged 72 had a cancer on the gum of her right lower jaw, and it had grown into the bone. '
          'Surgeons took out the right side of her lower jaw and rebuilt it with bone from her leg.' + cite(1),
          'この3D{模型|もけい}は、{論文|ろんぶん}で{公開|こうかい}された{実際|じっさい}の{症例|しょうれい}に{合|あ}わせて{作|つく}りました。72{歳|さい}の{女性|じょせい}の{右下|みぎした}の{歯|は}ぐきにがんができ、あごの{骨|ほね}の{中|なか}まで{広|ひろ}がっていました。{外科医|げかい}は{下|した}あごの{右側|みぎがわ}を{取|と}り、{足|あし}の{骨|ほね}で{作|つく}り{直|なお}しました。' + jcite(1)),
    stages=[
        ('pre', ('1 · Before surgery', '1・{手術|しゅじゅつ}の{前|まえ}'),
         ('<b>Before surgery.</b> The cancer (dark red) sits on the gum beside the right back teeth and has grown into the bone. '
          'A second, small patch sits on the inner side of the gum near the right front teeth.',
          '<b>{手術|しゅじゅつ}の{前|まえ}。</b>がん（{濃|こ}い{赤|あか}）は{右|みぎ}の{奥歯|おくば}の{横|よこ}の{歯|は}ぐきにあり、{骨|ほね}の{中|なか}まで{広|ひろ}がっています。{右|みぎ}の{前歯|まえば}の{近|ちか}くの{歯|は}ぐきの{内側|うちがわ}にも、{小|ちい}さながんがもう1つあります。')),
        ('op', ('2 · What is removed', '2・{取|と}るもの'),
         ('<b>What is removed.</b> The right side of the lower jaw, from the jaw joint to the front teeth, comes out in one piece with its 8 teeth. '
          'The front cut is about 1 cm from the cancer.',
          '<b>{取|と}るもの。</b>{下|した}あごの{右側|みぎがわ}を、あごの{関節|かんせつ}から{前歯|まえば}まで、8{本|ほん}の{歯|は}と{一緒|いっしょ}に1つのかたまりで{取|と}ります。{前|まえ}の{切|き}り{口|くち}は、がんから{約|やく}1cm{離|はな}れています。')),
        ('post', ('3 · The gap', '3・{残|のこ}るすき{間|ま}'),
         ('<b>The gap.</b> Without its right side, the jaw cannot keep its shape. The chin would move to the right, and eating and speaking would be hard.',
          '<b>{残|のこ}るすき{間|ま}。</b>{右側|みぎがわ}がないと、あごは{形|かたち}を{保|たも}てません。あご{先|さき}が{右|みぎ}にずれて、{食|た}べることや{話|はな}すことが{難|むずか}しくなります。')),
        ('recon', ('4 · Rebuilding the jaw', '4・あごを{作|つく}り{直|なお}す'),
         ('<b>Rebuilding the jaw.</b> A piece of bone from the lower leg (fibula) is cut into three parts and shaped like the missing jaw. '
          'Small titanium plates hold the parts. Its blood vessels are joined to vessels in the neck, so the bone stays alive.',
          '<b>あごを{作|つく}り{直|なお}す。</b>すねの{細|ほそ}い{骨|ほね}（ひ{骨|こつ}）を3つに{切|き}り、なくなったあごの{形|かたち}に{合|あ}わせます。{小|ちい}さなチタンのプレートでつなぎます。{骨|ほね}の{血管|けっかん}を{首|くび}の{血管|けっかん}につなぐので、{骨|ほね}は{生|い}きたままです。')),
    ],
    case_h=('The real case', '{実際|じっさい}の{症例|しょうれい}'),
    case=[
        ('In 2019 a woman aged 72 saw a surgeon about white patches on her gums. Over 18 months the patches spread, and part of them turned into cancer. '
         'In 2020 the gum beside her right back teeth was swollen. A small piece of tissue (biopsy) showed cancer, and a scan showed it had grown into the jaw bone.' + cite(1),
         '2019{年|ねん}、72{歳|さい}の{女性|じょせい}が{歯|は}ぐきの{白|しろ}い{斑点|はんてん}のことで{外科医|げかい}を{受診|じゅしん}しました。18か{月|げつ}で{斑点|はんてん}は{広|ひろ}がり、その{一部|いちぶ}ががんになりました。2020{年|ねん}、{右|みぎ}の{奥歯|おくば}の{横|よこ}の{歯|は}ぐきがはれました。{組織|そしき}を{少|すこ}し{取|と}る{検査|けんさ}（{生検|せいけん}）でがんとわかり、{画像|がぞう}{検査|けんさ}で{骨|ほね}の{中|なか}まで{広|ひろ}がっていることがわかりました。' + jcite(1)),
        ('The team took out the right side of her lower jaw. They rebuilt it with bone from her left leg, and she had radiotherapy after surgery. '
         'Nine months later the new bone had taken well, and she could drink by mouth.' + cite(1),
         'チームは{下|した}あごの{右側|みぎがわ}を{取|と}り、{左足|ひだりあし}の{骨|ほね}で{作|つく}り{直|なお}しました。{手術|しゅじゅつ}の{後|あと}に{放射線|ほうしゃせん}{治療|ちりょう}も{受|う}けました。9か{月|げつ}{後|ご}には{新|あたら}しい{骨|ほね}がよくつき、{口|くち}から{飲|の}めるようになりました。' + jcite(1)),
        ('Two years later a new cancer grew on the left side of her gum, and she needed another operation. '
         'This is why people who have had mouth cancer need regular checks for many years.' + cite(1),
         '2{年|ねん}{後|ご}、{歯|は}ぐきの{左側|ひだりがわ}に{新|あたら}しいがんができ、もう{一度|いちど}{手術|しゅじゅつ}が{必要|ひつよう}になりました。{口|くち}のがんの{治療|ちりょう}を{受|う}けた{人|ひと}は、{何年|なんねん}も{定期的|ていきてき}に{検査|けんさ}を{受|う}ける{必要|ひつよう}があります。' + jcite(1)),
    ],
    images=[
        dict(src='scc/scc-vergier-fig2-scc-right-posterior-mandible.jpg', out='scc/scc-before-surgery.jpg', id='scc-vergier-fig2',
             alt=('Five panels: two photos inside the mouth showing swollen gum beside the right lower back teeth and a patch inside the right front gum, two microscope pictures, and a scan slice with a bright spot in the right side of the jaw.',
                  '5つの{画像|がぞう}。{右下|みぎした}の{奥歯|おくば}の{横|よこ}のはれた{歯|は}ぐきと、{右|みぎ}の{前歯|まえば}の{内側|うちがわ}の{歯|は}ぐきの{写真|しゃしん}2{枚|まい}、{顕微鏡|けんびきょう}の{画像|がぞう}2{枚|まい}、あごの{右側|みぎがわ}が{明|あか}るく{光|ひか}る{画像|がぞう}{検査|けんさ}1{枚|まい}。'),
             cap=('<b>Image 1. The cancer before surgery.</b> (A) Swollen gum beside the right lower back teeth (45 to 47). (B) A second patch on the inner side of the gum between 42 and 43. '
                  '(C, D) Tissue samples under a microscope. (E) A scan (PET) shows the cancer in the right side of the jaw bone.',
                  '<b>{画像|がぞう}1. {手術|しゅじゅつ}の{前|まえ}のがん。</b>（A）{右下|みぎした}の{奥歯|おくば}（45〜47）の{横|よこ}のはれた{歯|は}ぐき。（B）42と43の{間|あいだ}の{歯|は}ぐきの{内側|うちがわ}にある2つ{目|め}のがん。（C、D）{顕微鏡|けんびきょう}で{見|み}た{組織|そしき}。（E）{画像|がぞう}{検査|けんさ}（PET）で、あごの{骨|ほね}の{右側|みぎがわ}にがんが{見|み}えます。'),
             credit=credit(VERG, 'Figure 2', '10.7759/cureus.56077', 'none.', VERG_CONSENT)),
        dict(src='scc/scc-vergier-fig3-postop-opg-fibula.jpg', out='scc/scc-after-fibula.jpg', id='scc-vergier-fig3',
             alt=('An X-ray of the whole mouth after surgery: a straight strip of leg bone runs up the right side of the jaw and along to the front teeth, held by small metal plates. Below, two photos inside the mouth nine months later.',
                  '{手術|しゅじゅつ}の{後|あと}の{口|くち}{全体|ぜんたい}のX{線|せん}{写真|しゃしん}。まっすぐな{足|あし}の{骨|ほね}が、あごの{右側|みぎがわ}を{上|うえ}に{向|む}かって、また{前歯|まえば}まで{並|なら}び、{小|ちい}さな{金属|きんぞく}のプレートで{止|と}めてあります。{下|した}は9か{月|げつ}{後|ご}の{口|くち}の{中|なか}の{写真|しゃしん}2{枚|まい}。'),
             cap=('<b>Image 2. After surgery.</b> (A) An X-ray of the whole mouth one month after surgery. The leg bone runs from the right jaw joint along the jaw to the front teeth, '
                  'in three pieces held by small metal plates. The 3D model copies this. (B, C) Inside the mouth nine months later.',
                  '<b>{画像|がぞう}2. {手術|しゅじゅつ}の{後|あと}。</b>（A）{手術|しゅじゅつ}の1か{月|げつ}{後|ご}の{口|くち}{全体|ぜんたい}のX{線|せん}{写真|しゃしん}。{足|あし}の{骨|ほね}が{右|みぎ}のあごの{関節|かんせつ}から{前歯|まえば}まで3つに{分|わ}かれて{並|なら}び、{小|ちい}さな{金属|きんぞく}のプレートで{止|と}めてあります。3D{模型|もけい}はこれに{合|あ}わせました。（B、C）9か{月|げつ}{後|ご}の{口|くち}の{中|なか}。'),
             credit=credit(VERG, 'Figure 3', '10.7759/cureus.56077', 'none.', VERG_CONSENT)),
    ],
    recon_h=('How the jaw is rebuilt', 'あごの{作|つく}り{直|なお}し{方|かた}'),
    recon=[
        ('When part of the jaw bone is removed, it is best replaced with living bone. Bone from the lower leg with its own blood supply (a fibula free flap) is the most common choice.' + cite(2, 3) +
         ' The fibula is the thin bone on the outer side of the lower leg. People can walk without its middle part, because the big leg bone (tibia) carries the weight.' + cite(2),
         'あごの{骨|ほね}の{一部|いちぶ}を{取|と}ったときは、{生|い}きた{骨|ほね}で{補|おぎな}うのがよい{方法|ほうほう}です。{血管|けっかん}ごと{移|うつ}すすねの{骨|ほね}（ひ{骨|こつ}{皮弁|ひべん}）が{最|もっと}もよく{使|つか}われます。' + jcite(2, 3) +
         'ひ{骨|こつ}はすねの{外側|そとがわ}にある{細|ほそ}い{骨|ほね}です。{体重|たいじゅう}は{太|ふと}い{骨|ほね}（けい{骨|こつ}）が{支|ささ}えるので、ひ{骨|こつ}の{真|ま}ん{中|なか}がなくても{歩|ある}けます。' + jcite(2)),
    ],
    diagrams=[
        dict(file='fibula-flap.svg', w=800, h=420,
             alt=('Diagram. Left: a lower leg with the middle of the fibula marked for removal with its artery and vein and an oval of skin. Right: the lower jaw drawn like an X-ray, with three pieces of fibula replacing the right side, held by small plates, and vessels running to the neck.',
                  '{図|ず}。{左|ひだり}：ひ{骨|こつ}の{真|ま}ん{中|なか}と{血管|けっかん}、だ{円|えん}{形|けい}の{皮膚|ひふ}に{印|しるし}をつけたすね。{右|みぎ}：X{線|せん}{写真|しゃしん}のように{描|か}いた{下|した}あご。{右側|みぎがわ}を3つのひ{骨|こつ}が{置|お}きかえ、{小|ちい}さなプレートで{止|と}めてあり、{血管|けっかん}が{首|くび}へのびています。'),
             cap=('<b>Diagram 1. Fibula free flap.</b> (A) The leg. 1 The middle part of the fibula is taken. 2 Its artery and veins come with it. 3 The top of the fibula stays, near the knee. '
                  '4 The bottom stays, near the ankle. 5 Skin over the bone can come too. (B) The jaw after rebuilding, drawn like the X-ray in Image 2 (patient’s right on the left). '
                  '1 Three pieces of fibula. 2 Small titanium plates and screws. 3 The vessels are joined to vessels in the neck. 4 The left teeth stay. 5 The skin lines the inside of the mouth. '
                  '6 The dashed line shows the jaw that was removed.',
                  '<b>{図|ず}1. ひ{骨|こつ}{皮弁|ひべん}。</b>（A）すね。1 ひ{骨|こつ}の{真|ま}ん{中|なか}を{取|と}ります。2 {動脈|どうみゃく}と{静脈|じょうみゃく}も{一緒|いっしょ}に{取|と}ります。3 ひざ{側|がわ}は{残|のこ}します。4 {足首|あしくび}{側|がわ}も{残|のこ}します。5 {骨|ほね}の{上|うえ}の{皮膚|ひふ}も{一緒|いっしょ}に{取|と}れます。'
                  '（B）{作|つく}り{直|なお}した{後|あと}のあご。{画像|がぞう}2のX{線|せん}{写真|しゃしん}と{同|おな}じ{向|む}きです（{患者|かんじゃ}さんの{右|みぎ}が{左|ひだり}）。1 3つのひ{骨|こつ}。2 {小|ちい}さなチタンのプレートとネジ。3 {血管|けっかん}を{首|くび}の{血管|けっかん}につなぎます。4 {左|ひだり}の{歯|は}は{残|のこ}ります。5 {皮膚|ひふ}が{口|くち}の{中|なか}をおおいます。6 {点線|てんせん}は{取|と}ったあごです。')),
    ],
    recon2=[
        ('When the jaw bone stays and only soft tissue is removed (gum, cheek lining, floor of the mouth or tongue), a thin flap of skin from the forearm (radial forearm free flap) is often used instead.' + cite(4, 5),
         'あごの{骨|ほね}は{残|のこ}り、{歯|は}ぐき、ほおの{内側|うちがわ}、{舌|した}などのやわらかい{部分|ぶぶん}だけを{取|と}ったときは、{代|か}わりに{腕|うで}の{薄|うす}い{皮膚|ひふ}（とう{骨|こつ}{前腕|ぜんわん}{皮弁|ひべん}）がよく{使|つか}われます。' + jcite(4, 5)),
    ],
    diagrams2=[
        dict(file='radial-forearm-flap.svg', w=800, h=420,
             alt=('Diagram. Left: a forearm, palm up, with an oval of skin marked near the wrist over an artery and veins. Right: the roof of the mouth seen from below, with a skin flap stitched into a gap and its vessels running back towards the neck.',
                  '{図|ず}。{左|ひだり}：{手|て}のひらを{上|うえ}にした{腕|うで}。{手首|てくび}の{近|ちか}くの{動脈|どうみゃく}と{静脈|じょうみゃく}の{上|うえ}に、だ{円|えん}{形|けい}の{皮膚|ひふ}の{印|しるし}。{右|みぎ}：{下|した}から{見|み}た{口|くち}の{天井|てんじょう}。すき{間|ま}に{皮膚|ひふ}が{縫|ぬ}いつけられ、{血管|けっかん}が{首|くび}の{方|ほう}へのびています。'),
             cap=('<b>Diagram 2. Radial forearm free flap (soft tissue only).</b> (A) The forearm, palm up. 1 An oval of thin skin is taken from the wrist side. 2 The artery and veins that feed it come with it. '
                  '3 A skin vein can also be used. (B) One example: the flap stitched into a gap in the roof of the mouth, seen from below with the front teeth at the bottom. 4 The flap. 5 Its vessels run back to the neck.',
                  '<b>{図|ず}2. とう{骨|こつ}{前腕|ぜんわん}{皮弁|ひべん}（やわらかい{部分|ぶぶん}だけ）。</b>（A）{手|て}のひらを{上|うえ}にした{腕|うで}。1 {手首|てくび}{側|がわ}の{薄|うす}い{皮膚|ひふ}をだ{円|えん}{形|けい}に{取|と}ります。2 それを{養|やしな}う{動脈|どうみゃく}と{静脈|じょうみゃく}も{一緒|いっしょ}に{取|と}ります。3 {皮膚|ひふ}の{下|した}の{静脈|じょうみゃく}も{使|つか}えます。'
                  '（B）{例|れい}：{口|くち}の{天井|てんじょう}のすき{間|ま}に{縫|ぬ}いつけた{皮弁|ひべん}。{下|した}から{見|み}て、{前歯|まえば}が{下|した}です。4 {皮弁|ひべん}。5 {血管|けっかん}は{首|くび}へのびます。')),
    ],
    clin_h=('For clinicians: how this model was built', '{医療者向|いりょうしゃむ}け：この{模型|もけい}の{作|つく}り{方|かた}'),
    clin=[
        ('Case: gingival proliferative verrucous leukoplakia with malignant transformation. SCC of the right buccal gingiva 45–47 with a second focus on the lingual gingiva 42–43; PET showed mandibular invasion; right submandibular node. Right segmental mandibulectomy, left fibula free flap, adjuvant radiotherapy.' + cite(1),
         '{症例|しょうれい}：{歯肉|しにく}の{増殖性|ぞうしょくせい}{疣贅性|ゆうぜいせい}{白板症|はくばんしょう}からのがん{化|か}。{右|みぎ}の{頬側|きょうそく}{歯肉|しにく}45〜47のSCCと、42〜43{舌側|ぜっそく}{歯肉|しにく}の{第|だい}2{病変|びょうへん}。PETで{下顎骨|かがくこつ}{浸潤|しんじゅん}、{右|みぎ}{顎下|がくか}リンパ{節|せつ}{腫大|しゅだい}。{右|みぎ}{下顎|かがく}{区域|くいき}{切除|せつじょ}、{左|ひだり}ひ{骨|こつ}{皮弁|ひべん}、{術後|じゅつご}{放射線|ほうしゃせん}{治療|ちりょう}。' + jcite(1)),
        ('Extent is taken from the one-month OPG (Image 2A), because the article gives no operative detail. The fibula runs from the right condylar region to the left incisor region in three segments: ramus, body and parasymphysis. There is no fixation at the upper end, which suggests disarticulation with the condyle removed; we modelled it that way. Brown class IIc.' + cite(1, 3),
         '{論文|ろんぶん}に{手術|しゅじゅつ}の{詳細|しょうさい}がないため、{範囲|はんい}は{術後|じゅつご}1か{月|げつ}のパノラマX{線|せん}（{画像|がぞう}2A）から{決|き}めました。ひ{骨|こつ}は{右|みぎ}の{関節|かんせつ}{突起|とっき}{部|ぶ}から{左|ひだり}{切歯|せっし}{部|ぶ}まで、{下顎枝|かがくし}・{体部|たいぶ}・{正中|せいちゅう}{付近|ふきん}の3{分節|ぶんせつ}です。{上端|じょうたん}に{固定|こてい}がないため、{関節|かんせつ}{突起|とっき}ごと{切除|せつじょ}したと{考|かんが}え、{模型|もけい}もそうしました。Brown{分類|ぶんるい}IIc。' + jcite(1, 3)),
        ('Model: cut between 31 and 32; teeth removed 41–47 and 31. Specimen 21.7 cm³; 106 mm from condyle to the anterior cut. Fibula segments 21.7, 56.7 and 41.2 mm. Miniplates as on the OPG: two at the native bone junction, one between the anterior and body segments, an L-plate at the angle (25 screws).',
         '{模型|もけい}：31と32の{間|あいだ}で{切断|せつだん}。{除去|じょきょ}{歯|し}は41〜47と31。{切除|せつじょ}{骨|こつ}21.7cm³、{関節|かんせつ}{突起|とっき}から{前方|ぜんぽう}{切断|せつだん}{面|めん}まで106mm。ひ{骨|こつ}{分節|ぶんせつ}21.7、56.7、41.2mm。パノラマX{線|せん}と{同|おな}じく、{残存|ざんぞん}{骨|こつ}との{接合|せつごう}{部|ぶ}に2{枚|まい}、{前方|ぜんぽう}と{体部|たいぶ}{分節|ぶんせつ}の{間|あいだ}に1{枚|まい}、{下顎角|かがくかく}にL{字|じ}プレート（ネジ25{本|ほん}）。'),
        ('Our choices: tumour 24 × 14 × 18 mm at 45–47 and 10 × 6 × 8 mm at 42–43 (sizes not published). The model leaves 8.5 mm of bone between the 42–43 focus and the anterior cut. The case used a left fibula; the model uses a right fibula mesh.',
         '{当方|とうほう}の{設定|せってい}：{腫瘍|しゅよう}は45〜47で24×14×18mm、42〜43で10×6×8mm（{大|おお}きさは{未公表|みこうひょう}）。42〜43の{病変|びょうへん}から{前方|ぜんぽう}{切断|せつだん}{面|めん}までの{骨|ほね}は8.5mm。{症例|しょうれい}では{左|ひだり}のひ{骨|こつ}、{模型|もけい}では{右|みぎ}のひ{骨|こつ}のメッシュを{使用|しよう}。'),
    ],
    refs=[
        (VERG + '.', '10.7759/cureus.56077'),
        ('Hidalgo DA. Fibula free flap: a new method of mandible reconstruction. Plast Reconstr Surg. 1989;84(1):71-79.', 'https://pubmed.ncbi.nlm.nih.gov/2734406/'),
        ('Brown JS, Barry C, Ho M, Shaw R. A new classification for mandibular defects after oncological resection. Lancet Oncol. 2016;17(1):e23-e30.', '10.1016/S1470-2045(15)00310-1'),
        ('Soutar DS, Scheker LR, Tanner NS, McGregor IA. The radial forearm flap: a versatile method for intra-oral reconstruction. Br J Plast Surg. 1983;36(1):1-8.', '10.1016/0007-1226(83)90002-4'),
        ('Soutar DS, McGregor IA. The radial forearm flap in intraoral reconstruction: the experience of 60 consecutive cases. Plast Reconstr Surg. 1986;78(1):1-8.', '10.1097/00006534-198607000-00001'),
    ],
)

# ============================== AMELOBLASTOMA ==============================
SIK = 'Sikri N, Eid S, Mohamed S, Ghosh A. Management of mandibular ameloblastoma: a case report from a Bahrain Government Hospital. Cureus. 2026;18(2):e104441'
SIK_CONSENT = 'The article records the patient’s informed consent.'
PAGES['ameloblastoma'] = dict(
    model='/head-neck/models/ameloblastoma-case.glb', jaw='mandible', side='left', margin=True,
    title=('Ameloblastoma in the lower jaw: removing the top of the jaw and adding a plate | Vivatheca',
           '{下|した}あごのエナメル{上皮腫|じょうひしゅ}：あごの{上|うえ}の{部分|ぶぶん}を{取|と}り、プレートで{支|ささ}える | Vivatheca'),
    description=('A 3D model that follows one published case of ameloblastoma in the left lower jaw: rim resection of the jaw with four teeth, and a titanium plate.',
                 '{左下|ひだりした}のあごのエナメル{上皮腫|じょうひしゅ}の{公開|こうかい}{症例|しょうれい}に{合|あ}わせた3D{模型|もけい}です。4{本|ほん}の{歯|は}と{一緒|いっしょ}にあごの{上|うえ}の{部分|ぶぶん}を{取|と}り、チタンのプレートで{支|ささ}えます。'),
    h1=('Ameloblastoma in the lower jaw', '{下|した}あごのエナメル{上皮腫|じょうひしゅ}'),
    lede=('This 3D model follows one real, published case. A man aged 32 had an ameloblastoma in the front of his left lower jaw. '
          'It is a growth that is not cancer, but it keeps growing into bone. Surgeons took out the top part of the jaw with four teeth and kept the lower edge. A metal plate keeps the thin edge strong.' + cite(1),
          'この3D{模型|もけい}は、{論文|ろんぶん}で{公開|こうかい}された{実際|じっさい}の{症例|しょうれい}に{合|あ}わせて{作|つく}りました。32{歳|さい}の{男性|だんせい}の{左下|ひだりした}のあごの{前|まえ}の{方|ほう}に、エナメル{上皮腫|じょうひしゅ}ができました。がんではありませんが、{骨|ほね}の{中|なか}で{大|おお}きくなり{続|つづ}けます。{外科医|げかい}は4{本|ほん}の{歯|は}と{一緒|いっしょ}にあごの{上|うえ}の{部分|ぶぶん}を{取|と}り、{下|した}のふちを{残|のこ}しました。{薄|うす}いふちは{金属|きんぞく}のプレートで{支|ささ}えます。' + jcite(1)),
    stages=[
        ('pre', ('1 · Before surgery', '1・{手術|しゅじゅつ}の{前|まえ}'),
         ('<b>Before surgery.</b> The growth (purple) is made of several bubbles. It sits in the bone between the left canine (33) and the first small back tooth (34), under four teeth (32 to 35).',
          '<b>{手術|しゅじゅつ}の{前|まえ}。</b>{病変|びょうへん}（{紫|むらさき}）はいくつかの{泡|あわ}のような{形|かたち}です。{左|ひだり}の{犬歯|けんし}（33）と{小|ちい}さな{奥歯|おくば}（34）の{間|あいだ}の{骨|ほね}にあり、4{本|ほん}の{歯|は}（32〜35）の{下|した}に{広|ひろ}がっています。')),
        ('op', ('2 · What is removed', '2・{取|と}るもの'),
         ('<b>What is removed.</b> The top part of the jaw comes out with four teeth (32 to 35) and the growth inside. The lower edge of the jaw is kept, so the jaw stays in one piece.',
          '<b>{取|と}るもの。</b>あごの{上|うえ}の{部分|ぶぶん}を、4{本|ほん}の{歯|は}（32〜35）と{中|なか}の{病変|びょうへん}と{一緒|いっしょ}に{取|と}ります。あごの{下|した}のふちは{残|のこ}すので、あごは1つにつながったままです。')),
        ('post', ('3 · What is left', '3・{残|のこ}る{骨|ほね}'),
         ('<b>What is left.</b> Only about 6 mm of bone is left under the gap. That is thin, and it could break when chewing.',
          '<b>{残|のこ}る{骨|ほね}。</b>すき{間|ま}の{下|した}に{残|のこ}る{骨|ほね}は{約|やく}6mmだけです。{薄|うす}いので、かむときに{折|お}れるおそれがあります。')),
        ('recon', ('4 · Making it strong', '4・{骨|ほね}を{支|ささ}える'),
         ('<b>Making it strong.</b> A titanium plate with 9 holes runs along the lower edge of the jaw, held by 6 screws. Later, the missing teeth can be replaced.',
          '<b>{骨|ほね}を{支|ささ}える。</b>9つの{穴|あな}があるチタンのプレートを、あごの{下|した}のふちに{沿|そ}って6{本|ほん}のネジで{止|と}めます。なくなった{歯|は}は{後|あと}で{補|おぎな}えます。')),
    ],
    case_h=('The real case', '{実際|じっさい}の{症例|しょうれい}'),
    case=[
        ('A man aged 32 had a slow swelling in the front of his left lower jaw. An X-ray showed a dark patch made of bubbles between the left canine and the first small back tooth. '
         'A 3D X-ray showed that the outer wall of the jaw was pushed out. A biopsy showed ameloblastoma.' + cite(1),
         '32{歳|さい}の{男性|だんせい}の{左下|ひだりした}のあごの{前|まえ}の{方|ほう}が、ゆっくりはれてきました。X{線|せん}{写真|しゃしん}では、{左|ひだり}の{犬歯|けんし}と{小|ちい}さな{奥歯|おくば}の{間|あいだ}に、{泡|あわ}のような{黒|くろ}い{影|かげ}がありました。3DのX{線|せん}{写真|しゃしん}では、あごの{外側|そとがわ}の{壁|かべ}が{押|お}し{出|だ}されていました。{生検|せいけん}でエナメル{上皮腫|じょうひしゅ}とわかりました。' + jcite(1)),
        ('The surgeons worked through the mouth and through a cut under the jaw. They took out the growth with four teeth and the top of the jaw, and kept the lower edge. '
         'Only about 6 mm of height was left, so they added a plate. Three months later he was healing well.' + cite(1),
         '{外科医|げかい}は{口|くち}の{中|なか}と、あごの{下|した}の{皮膚|ひふ}の{切開|せっかい}から{手術|しゅじゅつ}しました。4{本|ほん}の{歯|は}とあごの{上|うえ}の{部分|ぶぶん}と{一緒|いっしょ}に{病変|びょうへん}を{取|と}り、{下|した}のふちを{残|のこ}しました。{残|のこ}った{高|たか}さは{約|やく}6mmだったので、プレートを{加|くわ}えました。3か{月|げつ}{後|ご}、{傷|きず}はよく{治|なお}っていました。' + jcite(1)),
        ('Ameloblastoma can come back if some is left behind. It comes back more often after smaller operations, so people need X-ray checks for many years.' + cite(2),
         'エナメル{上皮腫|じょうひしゅ}は、{少|すこ}しでも{残|のこ}ると{再発|さいはつ}することがあります。{小|ちい}さな{手術|しゅじゅつ}ほど{再発|さいはつ}しやすいので、{何年|なんねん}もX{線|せん}{写真|しゃしん}で{確|たし}かめる{必要|ひつよう}があります。' + jcite(2)),
    ],
    images=[
        dict(src='ameloblastoma/amelo-sikri-fig1-preop-opg.jpg', out='ameloblastoma/amelo-before-xray.jpg', id='amelo-sikri-fig1',
             alt=('An X-ray of the whole mouth. An arrow points to a dark area with several bubbles in the lower jaw, between the left canine and the first small back tooth.',
                  '{口|くち}{全体|ぜんたい}のX{線|せん}{写真|しゃしん}。{矢印|やじるし}が、{下|した}あごの{左|ひだり}の{犬歯|けんし}と{小|ちい}さな{奥歯|おくば}の{間|あいだ}の、{泡|あわ}のような{黒|くろ}い{部分|ぶぶん}を{指|さ}しています。'),
             cap=('<b>Image 1. Before surgery.</b> An X-ray of the whole mouth. The arrow shows a dark patch made of bubbles between the left canine (33) and the first small back tooth (34). The model puts the growth in the same place.',
                  '<b>{画像|がぞう}1. {手術|しゅじゅつ}の{前|まえ}。</b>{口|くち}{全体|ぜんたい}のX{線|せん}{写真|しゃしん}。{矢印|やじるし}は、{左|ひだり}の{犬歯|けんし}（33）と{小|ちい}さな{奥歯|おくば}（34）の{間|あいだ}の、{泡|あわ}のような{黒|くろ}い{影|かげ}です。{模型|もけい}も{同|おな}じ{場所|ばしょ}にしました。'),
             credit=credit(SIK, 'Figure 1', '10.7759/cureus.104441', 'none.', SIK_CONSENT)),
        dict(src='ameloblastoma/amelo-sikri-fig2-cbct-cross-section.jpg', out='ameloblastoma/amelo-3d-xray.jpg', id='amelo-sikri-fig2',
             alt=('Slices from a 3D X-ray of the left lower jaw, showing a dark, bubbly area and an outer bone wall that bulges outwards.',
                  '{左下|ひだりした}のあごの3DのX{線|せん}{写真|しゃしん}の{断面|だんめん}。{泡|あわ}のような{黒|くろ}い{部分|ぶぶん}と、{外|そと}にふくらんだ{骨|ほね}の{壁|かべ}が{見|み}えます。'),
             cap=('<b>Image 2. 3D X-ray before surgery.</b> Slices through the jaw. The growth has bubbles inside and pushes the outer bone wall out.',
                  '<b>{画像|がぞう}2. {手術|しゅじゅつ}の{前|まえ}の3DのX{線|せん}{写真|しゃしん}。</b>あごの{断面|だんめん}です。{病変|びょうへん}の{中|なか}に{泡|あわ}があり、{外側|そとがわ}の{骨|ほね}の{壁|かべ}を{押|お}し{出|だ}しています。'),
             credit=credit(SIK, 'Figure 2', '10.7759/cureus.104441', 'none.', SIK_CONSENT)),
        dict(src='ameloblastoma/amelo-sikri-fig3-surgery.jpg', out='ameloblastoma/amelo-surgery.jpg', id='amelo-sikri-fig3', surgical=True,
             alt=('Six photos from the operation: the cut under the jaw, the exposed jaw bone, the removed piece of bone with teeth, and the titanium plate screwed along the lower edge of the jaw. Only the chin and neck skin are shown.',
                  '{手術|しゅじゅつ}の{写真|しゃしん}6{枚|まい}。あごの{下|した}の{切開|せっかい}、{見|み}えているあごの{骨|ほね}、{歯|は}がついた{取|と}った{骨|ほね}、あごの{下|した}のふちにネジで{止|と}めたチタンのプレート。あごと{首|くび}の{皮膚|ひふ}だけが{写|うつ}っています。'),
             cap=('<b>Image 3. During surgery.</b> The removed piece of jaw with its teeth, and the plate screwed along the lower edge of the jaw.',
                  '<b>{画像|がぞう}3. {手術中|しゅじゅつちゅう}。</b>{歯|は}がついた{取|と}ったあごの{骨|ほね}と、あごの{下|した}のふちにネジで{止|と}めたプレート。'),
             credit=credit(SIK, 'Figure 3', '10.7759/cureus.104441', 'none.', SIK_CONSENT + ' Lower face and neck only; no eyes.')),
        dict(src='ameloblastoma/amelo-sikri-fig5-3-months-opg.jpg', out='ameloblastoma/amelo-after-xray.jpg', id='amelo-sikri-fig5',
             alt=('An X-ray of the whole mouth three months after surgery. A metal plate held by screws runs along the lower edge of the left lower jaw, under a gap where four teeth are missing.',
                  '{手術|しゅじゅつ}の3か{月|げつ}{後|ご}の{口|くち}{全体|ぜんたい}のX{線|せん}{写真|しゃしん}。4{本|ほん}の{歯|は}がないすき{間|ま}の{下|した}で、ネジで{止|と}めた{金属|きんぞく}のプレートが{左下|ひだりした}のあごの{下|した}のふちに{沿|そ}っています。'),
             cap=('<b>Image 4. Three months after surgery.</b> The plate runs along the lower edge of the left lower jaw, under the gap. The model shows the same plate.',
                  '<b>{画像|がぞう}4. {手術|しゅじゅつ}の3か{月|げつ}{後|ご}。</b>すき{間|ま}の{下|した}で、プレートが{左下|ひだりした}のあごの{下|した}のふちに{沿|そ}っています。{模型|もけい}も{同|おな}じプレートです。'),
             credit=credit(SIK, 'Figure 5', '10.7759/cureus.104441', 'none.', SIK_CONSENT)),
    ],
    recon_h=('How the jaw is kept strong', 'あごを{支|ささ}える{方法|ほうほう}'),
    recon=[
        ('When the lower edge of the jaw can be kept, the surgeon removes only the top part (a rim resection). If the edge left behind is thin, a titanium plate along it stops it breaking.' + cite(1),
         'あごの{下|した}のふちを{残|のこ}せるときは、{上|うえ}の{部分|ぶぶん}だけを{取|と}ります（{辺縁|へんえん}{切除|せつじょ}）。{残|のこ}ったふちが{薄|うす}いときは、チタンのプレートを{沿|そ}わせて{折|お}れないようにします。' + jcite(1)),
    ],
    diagrams=[
        dict(file='ameloblastoma-plate.svg', w=800, h=400,
             alt=('Diagram of the left lower jaw from the side, front of the face on the right. Left: a bubbly growth under four teeth with a dashed box around the part to remove. Right: that part removed, and a long plate with 9 holes and 6 screws along the lower edge.',
                  '{横|よこ}から{見|み}た{左下|ひだりした}のあごの{図|ず}（{顔|かお}の{前|まえ}が{右|みぎ}）。{左|ひだり}：4{本|ほん}の{歯|は}の{下|した}の{泡|あわ}のような{病変|びょうへん}と、{取|と}る{部分|ぶぶん}を{囲|かこ}む{点線|てんせん}。{右|みぎ}：その{部分|ぶぶん}を{取|と}った{後|あと}、{下|した}のふちに{沿|そ}った9{穴|あな}・ネジ6{本|ほん}のプレート。'),
             cap=('<b>Diagram 1. Rim resection and plate</b> (left lower jaw from the side, front of the face on the right). (A) 1 The growth. 2 The cut: the top of the jaw with four teeth. '
                  '3 The lower edge is kept. (B) 4 The gap after surgery. 5 A plate with 9 holes along the lower edge. 6 Six screws hold it; the middle holes, over the thinnest bone, are left empty.',
                  '<b>{図|ず}1. {辺縁|へんえん}{切除|せつじょ}とプレート</b>（{横|よこ}から{見|み}た{左下|ひだりした}のあご、{顔|かお}の{前|まえ}が{右|みぎ}）。（A）1 {病変|びょうへん}。2 {切|き}る{線|せん}：4{本|ほん}の{歯|は}とあごの{上|うえ}の{部分|ぶぶん}。3 {下|した}のふちは{残|のこ}します。'
                  '（B）4 {手術|しゅじゅつ}の{後|あと}のすき{間|ま}。5 {下|した}のふちに{沿|そ}った9{穴|あな}のプレート。6 ネジ6{本|ほん}で{止|と}めます。いちばん{薄|うす}い{骨|ほね}の{上|うえ}の{真|ま}ん{中|なか}の{穴|あな}は{空|あ}けておきます。')),
    ],
    recon2=[
        ('If the growth had reached the lower edge, the full height of the jaw would be removed. The authors planned bone from the hip for a gap shorter than 5 cm, or a fibula from the leg for a longer gap.' + cite(1) +
         ' See the <a href="/head-neck/scc/">mouth cancer page</a> for a diagram of the fibula flap.',
         'もし{病変|びょうへん}が{下|した}のふちまで{届|とど}いていたら、あごの{高|たか}さ{全部|ぜんぶ}を{取|と}ることになります。{著者|ちょしゃ}は、すき{間|ま}が5cmより{短|みじか}ければ{腰|こし}の{骨|ほね}、{長|なが}ければ{足|あし}のひ{骨|こつ}を{使|つか}う{計画|けいかく}でした。' + jcite(1) +
         'ひ{骨|こつ}{皮弁|ひべん}の{図|ず}は<a href="/head-neck/scc/">{口|くち}のがんのページ</a>にあります。'),
    ],
    clin_h=('For clinicians: how this model was built', '{医療者向|いりょうしゃむ}け：この{模型|もけい}の{作|つく}り{方|かた}'),
    clin=[
        ('Case: 32-year-old man; multilocular radiolucency between 33 and 34, clinically 32–35 (about 2 × 3 cm) with buccal expansion; plexiform-follicular ameloblastoma. Marginal (rim) mandibulectomy 32–35 by combined intraoral and submandibular approach. About 6 mm residual height, reinforced with a 2.0 mm, 9-hole titanium reconstruction plate.' + cite(1),
         '{症例|しょうれい}：32{歳|さい}{男性|だんせい}。33と34の{間|あいだ}の{多房性|たぼうせい}{透過像|とうかぞう}、{臨床|りんしょう}{的|てき}には32〜35（{約|やく}2×3cm）で{頬側|きょうそく}{膨隆|ぼうりゅう}。{叢状|そうじょう}・{濾胞型|ろほうがた}エナメル{上皮腫|じょうひしゅ}。{口内|こうない}と{顎下|がくか}からの{併用|へいよう}アプローチで32〜35の{辺縁|へんえん}{切除|せつじょ}。{残存|ざんぞん}{高|こう}{約|やく}6mmのため、2.0mm・9{穴|あな}のチタン{再建|さいけん}プレートで{補強|ほきょう}。' + jcite(1)),
        ('Context: for solid/multicystic ameloblastoma, recurrence is about 3 times higher after conservative treatment than after resection.' + cite(2) + ' Marginal resection keeps continuity when an adequate inferior border can be preserved; the article does not report margin widths.',
         '{背景|はいけい}：{充実性|じゅうじつせい}・{多嚢胞性|たのうほうせい}エナメル{上皮腫|じょうひしゅ}では、{保存的|ほぞんてき}{治療|ちりょう}の{再発|さいはつ}{率|りつ}は{切除|せつじょ}の{約|やく}3{倍|ばい}です。'.replace('{多嚢胞性|たのうほうせい}', '{多房性|たぼうせい}') + jcite(2) + '{下縁|かえん}を{十分|じゅうぶん}{残|のこ}せるときは{辺縁|へんえん}{切除|せつじょ}で{連続性|れんぞくせい}を{保|たも}てます。{論文|ろんぶん}に{切除|せつじょ}{縁|えん}の{幅|はば}の{記載|きさい}はありません。'),
        ('Model: vertical cuts at the 31/32 and 35/36 contacts; horizontal floor leaving 6.0–8.4 mm of bone across 32–35 (6.0 mm at 35). Specimen 2.8 cm³. Plate 58 mm, 9 holes at 6.5 mm pitch, 3.2 mm above the lower border; screws in the three end holes on each side.',
         '{模型|もけい}：31/32と35/36の{接触点|せっしょくてん}で{垂直|すいちょく}に{切断|せつだん}。{水平|すいへい}の{底面|ていめん}で32〜35に6.0〜8.4mmの{骨|ほね}を{残|のこ}す（35で6.0mm）。{切除|せつじょ}{骨|こつ}2.8cm³。プレートは58mm、9{穴|あな}（6.5mm{間隔|かんかく}）、{下縁|かえん}から3.2mm。ネジは{両端|りょうたん}の3{穴|あな}ずつ。'),
        ('Our choices: the growth is four lobules, 15 × 19 × 16 mm in total, kept 2 mm above the floor of the cut. This is smaller than the clinical 2 × 3 cm swelling because the swelling includes the expanded cortex. Screw positions are not published.',
         '{当方|とうほう}の{設定|せってい}：{病変|びょうへん}は4つの{小葉|しょうよう}で{全体|ぜんたい}15×19×16mm、{切断|せつだん}{底面|ていめん}から2mm{上|うえ}。{臨床|りんしょう}{的|てき}な2×3cmのはれは{膨隆|ぼうりゅう}した{皮質|ひしつ}を{含|ふく}むため、それより{小|ちい}さくしました。ネジの{位置|いち}は{未公表|みこうひょう}です。'),
    ],
    refs=[
        (SIK + '.', '10.7759/cureus.104441'),
        ('Almeida RAC, Andrade ESS, Barbalho JC, Vajgel A, Vasconcelos BCE. Recurrence rate following treatment for primary multicystic ameloblastoma: systematic review and meta-analysis. Int J Oral Maxillofac Surg. 2016;45(3):359-367.', '10.1016/j.ijom.2015.12.016'),
    ],
)

# ============================== OKC ==============================
ABD = 'Abdelfadil E, Alsharif M, Alsharif AT, Mourad S. Management of a mandibular odontogenic keratocyst with enucleation, piezotome-assisted peripheral ostectomy, and platelet-rich fibrin: a case report. Dent J (Basel). 2025;13(11):536'
ABD_CONSENT = 'The article records the patient’s written consent.'
PAGES['okc'] = dict(
    model='/head-neck/models/okc-case.glb', jaw='mandible', side='left', margin=False,
    title=('Keratocyst in the lower jaw: ways to treat it | Vivatheca',
           '{下|した}あごの{角化|かくか}のう{胞|ほう}：{治療|ちりょう}の{方法|ほうほう} | Vivatheca'),
    description=('A 3D model that follows one published case of odontogenic keratocyst at the roots of two lower left teeth, with diagrams of eight treatment options and how often each comes back.',
                 '{左下|ひだりした}の2{本|ほん}の{歯|は}の{根|ね}の{先|さき}にできた{歯原性|しげんせい}{角化|かくか}のう{胞|ほう}の{公開|こうかい}{症例|しょうれい}に{合|あ}わせた3D{模型|もけい}と、8つの{治療|ちりょう}{方法|ほうほう}の{図|ず}、{再発|さいはつ}の{割合|わりあい}です。'),
    h1=('Keratocyst in the lower jaw <span class="pitk-skip">(odontogenic keratocyst)</span>',
        '{下|した}あごの{角化|かくか}のう{胞|ほう}<span class="pitk-skip">（{歯原性|しげんせい}{角化|かくか}のう{胞|ほう}）</span>'),
    lede=('This 3D model follows one real, published case. A man aged 54 had a keratocyst at the root tips of two lower left teeth (34 and 35). '
          'A keratocyst is a sac in the jaw, filled with thick fluid. It is not cancer, but it often comes back. The surgeon took out the sac, shaved the bone wall and kept the teeth.' + cite(1),
          'この3D{模型|もけい}は、{論文|ろんぶん}で{公開|こうかい}された{実際|じっさい}の{症例|しょうれい}に{合|あ}わせて{作|つく}りました。54{歳|さい}の{男性|だんせい}の{左下|ひだりした}の2{本|ほん}の{歯|は}（34と35）の{根|ね}の{先|さき}に、{角化|かくか}のう{胞|ほう}がありました。{角化|かくか}のう{胞|ほう}は、あごの{中|なか}にできる、{濃|こ}い{液|えき}が{入|はい}った{袋|ふくろ}です。がんではありませんが、よく{再発|さいはつ}します。{外科医|げかい}は{袋|ふくろ}を{取|と}り、{骨|ほね}の{壁|かべ}を{削|けず}って、{歯|は}は{残|のこ}しました。' + jcite(1)),
    stages=[
        ('pre', ('1 · Before surgery', '1・{手術|しゅじゅつ}の{前|まえ}'),
         ('<b>Before surgery.</b> The cyst (yellow) sits around the root tips of 34 and 35, close to the nerve that gives feeling to the lower lip. It has made a small hole in the outer bone wall. Turn on “See-through bone” to see it.',
          '<b>{手術|しゅじゅつ}の{前|まえ}。</b>のう{胞|ほう}（{黄色|きいろ}）は34と35の{根|ね}の{先|さき}のまわりにあり、{下|した}くちびるの{感覚|かんかく}を{伝|つた}える{神経|しんけい}の{近|ちか}くです。{外側|そとがわ}の{骨|ほね}の{壁|かべ}に{小|ちい}さな{穴|あな}をあけています。「{骨|ほね}を{透|す}かす」をオンにすると{見|み}えます。')),
        ('op', ('2 · What is removed', '2・{取|と}るもの'),
         ('<b>What is removed.</b> The surgeon opens a small window in the bone between 34 and 35, lifts out the whole sac and shaves about 1.5 mm off the bone wall. '
          'The tips of the two roots are cut off (3 mm each). The teeth had root canal treatment first, so they can stay.',
          '<b>{取|と}るもの。</b>34と35の{間|あいだ}の{骨|ほね}に{小|ちい}さな{窓|まど}をあけ、{袋|ふくろ}を{丸|まる}ごと{取|と}り{出|だ}し、{骨|ほね}の{壁|かべ}を{約|やく}1.5mm{削|けず}ります。2{本|ほん}の{根|ね}の{先|さき}を3mmずつ{切|き}り{取|と}ります。{歯|は}は{先|さき}に{根|ね}の{治療|ちりょう}をしてあるので{残|のこ}せます。')),
        ('post', ('3 · The space left', '3・{残|のこ}る{空|あ}き{間|ま}'),
         ('<b>The space left.</b> The hollow in the bone is about the size of a large grape. The teeth stay in place.',
          '<b>{残|のこ}る{空|あ}き{間|ま}。</b>{骨|ほね}の{中|なか}の{空|あ}き{間|ま}は、{大|おお}きなぶどう1つぶくらいです。{歯|は}はそのまま{残|のこ}ります。')),
        ('recon', ('4 · Healing', '4・{治|なお}る'),
         ('<b>Healing.</b> The space is filled with a gel made from the patient’s own blood (PRF). New bone fills the space over months. On X-rays, it had healed by 3 years.',
          '<b>{治|なお}る。</b>{空|あ}き{間|ま}に、{自分|じぶん}の{血液|けつえき}から{作|つく}ったゲル（PRF）を{入|い}れます。{何|なん}か{月|げつ}もかけて{新|あたら}しい{骨|ほね}が{空|あ}き{間|ま}をうめます。X{線|せん}{写真|しゃしん}では、3{年|ねん}で{治|なお}っていました。')),
    ],
    case_h=('The real case', '{実際|じっさい}の{症例|しょうれい}'),
    case=[
        ('A man aged 54 had a dull ache in his lower left jaw near the small back teeth. The gum between 34 and 35 was a little swollen. '
         'A 3D X-ray showed a hollow of 1.5 × 1.7 × 0.9 cm close to the nerve for the lip. Fluid taken with a needle was thick and yellow, and tests showed a keratocyst.' + cite(1),
         '54{歳|さい}の{男性|だんせい}は、{左下|ひだりした}の{小|ちい}さな{奥歯|おくば}のあたりに{鈍|にぶ}い{痛|いた}みがありました。34と35の{間|あいだ}の{歯|は}ぐきが{少|すこ}しはれていました。3DのX{線|せん}{写真|しゃしん}で、くちびるの{神経|しんけい}の{近|ちか}くに1.5×1.7×0.9cmの{空|あ}き{間|ま}が{見|み}つかりました。{針|はり}で{取|と}った{液|えき}は{濃|こ}い{黄色|きいろ}で、{検査|けんさ}で{角化|かくか}のう{胞|ほう}とわかりました。' + jcite(1)),
        ('He chose to keep his teeth. 34 and 35 had root canal treatment first. Then the surgeon took out the cyst through a window in the bone, cut off the root tips and shaved the bone wall with an ultrasonic tool. The space was filled with PRF.' + cite(1),
         '{本人|ほんにん}は{歯|は}を{残|のこ}すことを{選|えら}びました。まず34と35の{根|ね}の{治療|ちりょう}をしました。そのあと{骨|ほね}の{窓|まど}からのう{胞|ほう}を{取|と}り、{根|ね}の{先|さき}を{切|き}り、{超音波|ちょうおんぱ}の{器具|きぐ}で{骨|ほね}の{壁|かべ}を{削|けず}りました。{空|あ}き{間|ま}にはPRFを{入|い}れました。' + jcite(1)),
        ('He had no numb lip. Three years later the bone had healed and the cyst had not come back. Keratocysts can come back late, so checks go on for at least 10 years.' + cite(1),
         'くちびるのしびれはありませんでした。3{年|ねん}{後|ご}、{骨|ほね}は{治|なお}り、のう{胞|ほう}は{再発|さいはつ}していませんでした。{角化|かくか}のう{胞|ほう}は{遅|おそ}れて{再発|さいはつ}することがあるので、10{年|ねん}{以上|いじょう}{検査|けんさ}を{続|つづ}けます。' + jcite(1)),
    ],
    images=[
        dict(src='okc/okc-abdelfadil-fig1-preop-photos-cbct.jpg', out='okc/okc-before.jpg', id='okc-abdelfadil-fig1', resize=900,
             alt=('Two photos inside the mouth with arrows at a slight swelling of the gum between the lower left small back teeth, and three slices from a 3D X-ray showing a dark, smooth-edged hollow at their roots.',
                  '{口|くち}の{中|なか}の{写真|しゃしん}2{枚|まい}。{矢印|やじるし}は{左下|ひだりした}の{小|ちい}さな{奥歯|おくば}の{間|あいだ}の{歯|は}ぐきの{少|すこ}しのはれを{指|さ}しています。3DのX{線|せん}{写真|しゃしん}の{断面|だんめん}3{枚|まい}では、{根|ね}の{先|さき}にふちのなめらかな{黒|くろ}い{空|あ}き{間|ま}が{見|み}えます。'),
             cap=('<b>Image 1. Before surgery.</b> (a, b) The arrows show a slight swelling of the gum between 34 and 35. (c–e) Slices from a 3D X-ray: the dark, smooth-edged patch at the root tips is the cyst.',
                  '<b>{画像|がぞう}1. {手術|しゅじゅつ}の{前|まえ}。</b>（a、b）{矢印|やじるし}は34と35の{間|あいだ}の{歯|は}ぐきの{少|すこ}しのはれです。（c〜e）3DのX{線|せん}{写真|しゃしん}の{断面|だんめん}。{根|ね}の{先|さき}のふちのなめらかな{黒|くろ}い{影|かげ}がのう{胞|ほう}です。'),
             credit=credit(ABD, 'Figure 1', '10.3390/dj13110536', 'resized to 900 px wide.', ABD_CONSENT)),
        dict(src='okc/okc-abdelfadil-fig2-surgery-prf.jpg', out='okc/okc-surgery.jpg', id='okc-abdelfadil-fig2', surgical=True, resize=900,
             alt=('Seven photos from the operation: the gum folded back over a small hole in the bone, the sac being lifted out, the hollow in the bone, the yellow PRF gel, and the gum stitched closed.',
                  '{手術|しゅじゅつ}の{写真|しゃしん}7{枚|まい}。{骨|ほね}の{小|ちい}さな{穴|あな}の{上|うえ}でめくった{歯|は}ぐき、{取|と}り{出|だ}している{袋|ふくろ}、{骨|ほね}の{空|あ}き{間|ま}、{黄色|きいろ}のPRFのゲル、{縫|ぬ}って{閉|と}じた{歯|は}ぐき。'),
             cap=('<b>Image 2. During surgery.</b> (a) A small hole in the bone between 34 and 35. (b, c) The sac is lifted out and the root tips are cut. (d, e) PRF made from the patient’s blood. (f, g) PRF in the hollow and the gum stitched closed.',
                  '<b>{画像|がぞう}2. {手術中|しゅじゅつちゅう}。</b>（a）34と35の{間|あいだ}の{骨|ほね}の{小|ちい}さな{穴|あな}。（b、c）{袋|ふくろ}を{取|と}り{出|だ}し、{根|ね}の{先|さき}を{切|き}ります。（d、e）{血液|けつえき}から{作|つく}ったPRF。（f、g）{空|あ}き{間|ま}にPRFを{入|い}れ、{歯|は}ぐきを{縫|ぬ}って{閉|と}じます。'),
             credit=credit(ABD, 'Figure 2', '10.3390/dj13110536', 'resized to 900 px wide.', ABD_CONSENT)),
        dict(src='okc/okc-abdelfadil-fig4-followup-opg-cbct.jpg', out='okc/okc-healed.jpg', id='okc-abdelfadil-fig4', resize=900,
             alt=('An X-ray of the whole mouth at 18 months and two slices from a 3D X-ray at 3 years. The bone around the lower left small back teeth looks filled in.',
                  '18か{月|げつ}{後|ご}の{口|くち}{全体|ぜんたい}のX{線|せん}{写真|しゃしん}と、3{年|ねん}{後|ご}の3DのX{線|せん}{写真|しゃしん}の{断面|だんめん}2{枚|まい}。{左下|ひだりした}の{小|ちい}さな{奥歯|おくば}のまわりの{骨|ほね}がうまっています。'),
             cap=('<b>Image 3. Healing.</b> (a) X-ray of the whole mouth at 18 months. (b, c) 3D X-ray slices at 3 years: the hollow has filled with bone and the teeth are still there.',
                  '<b>{画像|がぞう}3. {治|なお}った{後|あと}。</b>（a）18か{月|げつ}{後|ご}の{口|くち}{全体|ぜんたい}のX{線|せん}{写真|しゃしん}。（b、c）3{年|ねん}{後|ご}の3DのX{線|せん}{写真|しゃしん}：{空|あ}き{間|ま}は{骨|ほね}でうまり、{歯|は}も{残|のこ}っています。'),
             credit=credit(ABD, 'Figure 4', '10.3390/dj13110536', 'resized to 900 px wide.', ABD_CONSENT)),
    ],
    recon_h=('Ways to treat a keratocyst', '{角化|かくか}のう{胞|ほう}の{治療|ちりょう}{方法|ほうほう}'),
    recon=[
        ('There is no single best way. Surgeons choose by the size of the cyst, how close it is to nerves and teeth, whether it has come back before and what the patient prefers.' + cite(1, 2) +
         ' The diagram shows the jaw cut across, with a tooth on top and the cyst in yellow.',
         'いちばんよい{方法|ほうほう}は1つではありません。のう{胞|ほう}の{大|おお}きさ、{神経|しんけい}や{歯|は}との{近|ちか}さ、{再発|さいはつ}したことがあるか、{本人|ほんにん}の{希望|きぼう}で{選|えら}びます。' + jcite(1, 2) +
         '{図|ず}はあごを{横|よこ}に{切|き}った{断面|だんめん}で、{上|うえ}に{歯|は}、{黄色|きいろ}がのう{胞|ほう}です。'),
    ],
    diagrams=[
        dict(file='okc-treatments.svg', w=800, h=580,
             alt=('Eight small drawings of the jaw cut across, each with a tooth on top, showing eight ways to treat a keratocyst.',
                  '{上|うえ}に{歯|は}がある、あごの{断面|だんめん}の{小|ちい}さな{図|ず}8つ。{角化|かくか}のう{胞|ほう}の8つの{治療|ちりょう}{方法|ほうほう}を{示|しめ}しています。'),
             cap=('<b>Diagram 1. Eight ways to treat a keratocyst.</b> The numbers match the list below.',
                  '<b>{図|ず}1. {角化|かくか}のう{胞|ほう}の8つの{治療|ちりょう}{方法|ほうほう}。</b>{番号|ばんごう}は{下|した}の{一覧|いちらん}と{同|おな}じです。')),
    ],
    options=[
        ('<b>1 Removing the sac (enucleation).</b> The whole sac is lifted out in one piece. The hollow fills with new bone over months.',
         '<b>1 {袋|ふくろ}を{取|と}る（{摘出|てきしゅつ}）。</b>{袋|ふくろ}を1つのまま{丸|まる}ごと{取|と}り{出|だ}します。{空|あ}き{間|ま}は{何|なん}か{月|げつ}もかけて{新|あたら}しい{骨|ほね}でうまります。'),
        ('<b>2 Opening the cyst into the mouth (marsupialisation).</b> A window is cut and the sac lining is stitched to the mouth lining. The cyst drains and slowly shrinks. Used for big cysts.',
         '<b>2 のう{胞|ほう}を{口|くち}に{開|ひら}く（{開窓|かいそう}）。</b>{窓|まど}をあけ、{袋|ふくろ}の{内側|うちがわ}を{口|くち}の{粘膜|ねんまく}に{縫|ぬ}いつけます。{液|えき}が{出|で}て、のう{胞|ほう}はゆっくり{小|ちい}さくなります。{大|おお}きなのう{胞|ほう}に{使|つか}います。'),
        ('<b>3 Draining with a small tube (decompression).</b> A tube keeps the cyst open so it shrinks. Months later, the smaller cyst is taken out.',
         '<b>3 {細|ほそ}い{管|くだ}で{液|えき}を{出|だ}す（{減圧|げんあつ}）。</b>{管|くだ}でのう{胞|ほう}を{開|ひら}いたままにして{小|ちい}さくします。{何|なん}か{月|げつ}か{後|ご}に、{小|ちい}さくなったのう{胞|ほう}を{取|と}ります。'),
        ('<b>4 Shaving the bone wall (peripheral ostectomy).</b> After the sac is out, a thin layer of the bone wall (1 to 2 mm) is shaved off with a drill or an ultrasonic tool. This was done in this case.',
         '<b>4 {骨|ほね}の{壁|かべ}を{削|けず}る（{周辺|しゅうへん}{骨|こつ}{削除|さくじょ}）。</b>{袋|ふくろ}を{取|と}った{後|あと}、{骨|ほね}の{壁|かべ}の{薄|うす}い{層|そう}（1〜2mm）をドリルや{超音波|ちょうおんぱ}の{器具|きぐ}で{削|けず}ります。この{症例|しょうれい}ではこの{方法|ほうほう}でした。'),
        ('<b>5 Carnoy’s solution.</b> A strong liquid is put on the bone wall for a few minutes to kill cells left behind. A newer form (modified Carnoy’s) leaves out one of its chemicals.',
         '<b>5 カルノア{液|えき}。</b>{強|つよ}い{薬|くすり}の{液|えき}を{数分|すうふん}、{骨|ほね}の{壁|かべ}につけて、{残|のこ}った{細胞|さいぼう}をこわします。{新|あたら}しい{形|かたち}（{変法|へんぽう}カルノア{液|えき}）は、{成分|せいぶん}の1つを{除|のぞ}いています。'),
        ('<b>6 Freezing (cryotherapy).</b> The bone wall is frozen with liquid nitrogen. This kills cells about 1.5 mm deep. The bone is weaker for a few weeks.',
         '<b>6 {凍|こお}らせる（{凍結|とうけつ}{療法|りょうほう}）。</b>{液体|えきたい}{窒素|ちっそ}で{骨|ほね}の{壁|かべ}を{凍|こお}らせ、{深|ふか}さ{約|やく}1.5mmまでの{細胞|さいぼう}をこわします。{数週間|すうしゅうかん}は{骨|ほね}が{弱|よわ}くなります。'),
        ('<b>7 A cream called 5-FU.</b> A cream that is also used for some skin cancers is put into the hollow on a gauze strip, then taken out.',
         '<b>7 5-FUというクリーム。</b>{皮膚|ひふ}のがんにも{使|つか}うクリームを、ガーゼにつけて{空|あ}き{間|ま}に{入|い}れ、{後|あと}で{取|と}り{出|だ}します。'),
        ('<b>8 Removing part of the jaw (resection).</b> The piece of jaw that holds the cyst is removed. It is kept for very large cysts, or ones that keep coming back, because it is a much bigger operation.',
         '<b>8 あごの{一部|いちぶ}を{取|と}る（{切除|せつじょ}）。</b>のう{胞|ほう}のあるあごの{骨|ほね}ごと{取|と}ります。ずっと{大|おお}きな{手術|しゅじゅつ}なので、とても{大|おお}きなのう{胞|ほう}や、{何度|なんど}も{再発|さいはつ}するときに{使|つか}います。'),
    ],
    options_after=('How often does it come back? In large reviews, it came back in about 1 in 3 people after opening the cyst alone, and in about 1 in 5 after removing the sac alone. '
                   'Treating the bone wall as well lowered this. Removing part of the jaw had the lowest rate, but it is a much bigger operation.' + cite(2, 3),
                   'どのくらい{再発|さいはつ}するのでしょうか。{大|おお}きな{研究|けんきゅう}のまとめでは、のう{胞|ほう}を{開|ひら}くだけだと{約|やく}3{人|にん}に1{人|り}、{袋|ふくろ}を{取|と}るだけだと{約|やく}5{人|にん}に1{人|り}で{再発|さいはつ}しました。{骨|ほね}の{壁|かべ}も{治療|ちりょう}すると{減|へ}りました。あごの{一部|いちぶ}を{取|と}ると{最|もっと}も{少|すく}なくなりますが、ずっと{大|おお}きな{手術|しゅじゅつ}です。' + jcite(2, 3)),
    clin_h=('For clinicians: recurrence by treatment', '{医療者向|いりょうしゃむ}け：{治療|ちりょう}{別|べつ}の{再発|さいはつ}{率|りつ}'),
    table=dict(
        head=('<tr><th>Treatment</th><th>Al-Moraissi 2017 (meta-analysis)</th><th>Chrcanovic 2017 (6,427 cases)</th><th>Other evidence</th></tr>',
              '<tr><th>{治療|ちりょう}</th><th>Al-Moraissi 2017（メタ{解析|かいせき}）</th><th>Chrcanovic 2017（6,427{例|れい}）</th><th>その{他|た}の{根拠|こんきょ}</th></tr>'),
        rows=[
            ('Enucleation alone', '23.1%', '22.5%', 'de Castro 2018: 20.8%' + cite(4), '{摘出|てきしゅつ}のみ', 'de Castro 2018：20.8%' + jcite(4)),
            ('Enucleation + curettage', '17.4%', '—', '', '{摘出|てきしゅつ}＋{掻爬|そうは}'.replace('{掻爬|そうは}', 'そうは'), ''),
            ('Enucleation + peripheral ostectomy', '—', '18.6%', 'This case: none at 3 years' + cite(1), '{摘出|てきしゅつ}＋{周辺|しゅうへん}{骨|こつ}{削除|さくじょ}', 'この{症例|しょうれい}：3{年|ねん}で{再発|さいはつ}なし' + jcite(1)),
            ('Enucleation + Carnoy’s', '11.5%', '5.3%', 'Modified Carnoy’s: 27/114 recurred (Jacobs 2024)' + cite(5), '{摘出|てきしゅつ}＋カルノア{液|えき}', '{変法|へんぽう}カルノア{液|えき}：114{例|れい}{中|ちゅう}27{例|れい}{再発|さいはつ}（Jacobs 2024）' + jcite(5)),
            ('Enucleation + cryotherapy', '14.5%', '20.9%', 'RCT vs 5-FU: 8.3% each (Shelke 2025)' + cite(6), '{摘出|てきしゅつ}＋{凍結|とうけつ}{療法|りょうほう}', '5-FUとのRCT：{各|かく}8.3%（Shelke 2025）' + jcite(6)),
            ('Enucleation + 5-FU', '—', '—', '0/99 recurred; nerve deficit 7% vs 18% with modified Carnoy’s (Jacobs 2024)' + cite(5) + '; ranked best with ostectomy in a network meta-analysis (Al-Moraissi 2022)' + cite(7),
             '{摘出|てきしゅつ}＋5-FU', '99{例|れい}{中|ちゅう}{再発|さいはつ}0。{神経|しんけい}{障害|しょうがい}7%（{変法|へんぽう}カルノア{液|えき}は18%）（Jacobs 2024）' + jcite(5) + '。ネットワークメタ{解析|かいせき}で{骨|こつ}{削除|さくじょ}{併用|へいよう}が{最上位|さいじょうい}（Al-Moraissi 2022）' + jcite(7)),
            ('Marsupialisation alone', '32.3%', '28.7%*', '', '{開窓|かいそう}のみ', ''),
            ('Decompression then enucleation', '14.6%', '18.6%', 'de Castro 2018: 11.9%' + cite(4), '{減圧|げんあつ}{後|ご}に{摘出|てきしゅつ}', 'de Castro 2018：11.9%' + jcite(4)),
            ('Resection', '8.4%', '2.2%', 'Highest morbidity', '{切除|せつじょ}', '{侵襲|しんしゅう}が{最|もっと}も{大|おお}きい'),
        ],
        note=('Rates are pooled from studies of different size, follow-up and case mix, so compare them with care. Al-Moraissi 2017' + cite(2) + '; Chrcanovic and Gomez 2017.' + cite(3) + ' *Marsupialisation and decompression counted together.',
              '{率|りつ}は{規模|きぼ}、{追跡|ついせき}{期間|きかん}、{対象|たいしょう}の{異|こと}なる{研究|けんきゅう}をまとめたものなので、{比|くら}べるときは{注意|ちゅうい}が{必要|ひつよう}です。Al-Moraissi 2017' + jcite(2) + '、Chrcanovic and Gomez 2017。' + jcite(3) + ' *{開窓|かいそう}と{減圧|げんあつ}を{合|あ}わせた{数字|すうじ}。'),
    ),
    clin2_h=('For clinicians: how this model was built', '{医療者向|いりょうしゃむ}け：この{模型|もけい}の{作|つく}り{方|かた}'),
    clin=[
        ('Case: 54-year-old man; unilocular radiolucency at the roots of 34 and 35, 1.5 × 1.7 × 0.9 cm on CBCT, close to the mental nerve, with a crestal cortical perforation between 34 and 35. Aspiration: thick keratinous fluid. Pre-operative endodontics on 34 and 35; enucleation through an enlarged crestal window, apicectomy of 34 and 35, piezo peripheral ostectomy, PRF; teeth kept. No recurrence or paraesthesia at 36 months.' + cite(1),
         '{症例|しょうれい}：54{歳|さい}{男性|だんせい}。34と35の{根尖|こんせん}{部|ぶ}の{単房性|たんぼうせい}{透過像|とうかぞう}、CBCTで1.5×1.7×0.9cm、オトガイ{神経|しんけい}に{近接|きんせつ}、34と35の{間|あいだ}の{歯槽頂|しそうちょう}に{皮質|ひしつ}{穿孔|せんこう}。{穿刺|せんし}で{濃|のう}い{角化物|かくかぶつ}。34・35の{術前|じゅつぜん}{根管|こんかん}{治療|ちりょう}、{歯槽頂|しそうちょう}の{窓|まど}を{広|ひろ}げて{摘出|てきしゅつ}、34・35の{歯根端|しこんたん}{切除|せつじょ}、ピエゾによる{周辺|しゅうへん}{骨|こつ}{削除|さくじょ}、PRF、{歯|は}は{保存|ほぞん}。36か{月|げつ}で{再発|さいはつ}・{知覚|ちかく}{異常|いじょう}なし。' + jcite(1)),
        ('Model: cyst 17 × 9 × 13 mm, centred between the apices of 34 and 35 and kept 4.6 mm above the lower border. Cavity after 1.5 mm peripheral ostectomy; crestal window 4.4 × 5.6 mm between 34 and 35. Apicectomy 3 mm on each root. Bone removed 1.8 cm³. The mesial root of 36 touches the cavity edge in the model.',
         '{模型|もけい}：のう{胞|ほう}17×9×13mm、34と35の{根尖|こんせん}の{間|あいだ}を{中心|ちゅうしん}に、{下縁|かえん}から4.6mm{上|うえ}。1.5mmの{周辺|しゅうへん}{骨|こつ}{削除|さくじょ}{後|ご}の{空洞|くうどう}、34と35の{間|あいだ}に4.4×5.6mmの{窓|まど}。{歯根端|しこんたん}{切除|せつじょ}は{各|かく}3mm。{除去|じょきょ}{骨|こつ}1.8cm³。{模型|もけい}では36の{近心根|きんしんこん}が{空洞|くうどう}の{縁|ふち}に{接|せっ}します。'),
        ('Our choices: which dimension is vertical is not stated; we used 1.7 cm mesiodistal, 1.3 cm vertical and 0.9 cm buccolingual so the cyst fits the jaw height. Root canal fillings are not modelled.',
         '{当方|とうほう}の{設定|せってい}：どの{寸法|すんぽう}が{垂直|すいちょく}かは{記載|きさい}がないため、あごの{高|たか}さに{収|おさ}まるよう{近遠心|きんえんしん}1.7cm、{垂直|すいちょく}1.3cm、{頬舌|きょうぜつ}0.9cmとしました。{根管|こんかん}{充填|じゅうてん}は{模型|もけい}にしていません。'),
    ],
    refs=[
        (ABD + '.', '10.3390/dj13110536'),
        ('Al-Moraissi EA, Dahan AA, Alwadeai MS, et al. What surgical treatment has the lowest recurrence rate following the management of keratocystic odontogenic tumor?: A large systematic review and meta-analysis. J Craniomaxillofac Surg. 2017;45(1):131-144.', '10.1016/j.jcms.2016.10.013'),
        ('Chrcanovic BR, Gomez RS. Recurrence probability for keratocystic odontogenic tumors: an analysis of 6427 cases. J Craniomaxillofac Surg. 2017;45(2):244-251.', '10.1016/j.jcms.2016.11.010'),
        ('de Castro MS, Caixeta CA, de Carli ML, et al. Conservative surgical treatments for nonsyndromic odontogenic keratocysts: a systematic review and meta-analysis. Clin Oral Investig. 2018;22(5):2089-2101.', '10.1007/s00784-017-2315-8'),
        ('Jacobs D, et al. 5-Fluorouracil versus modified Carnoy’s solution for odontogenic keratocysts. J Oral Maxillofac Surg. 2024;82:1433-1440.', '10.1016/j.joms.2024.06.181'),
        ('Shelke P, et al. Topical 5-fluorouracil versus cryotherapy after enucleation of odontogenic keratocyst: a randomised controlled trial. J Maxillofac Oral Surg. 2025.', '10.1007/s12663-025-02855-z'),
        ('Al-Moraissi EA, et al. Adjuvant therapies after enucleation of odontogenic keratocyst: a network meta-analysis. Int J Oral Maxillofac Surg. 2023;52(1):32-43.', '10.1016/j.ijom.2022.09.004'),
    ],
)

# ============================== MEC ==============================
ELL = 'Ellam M, et al. Mucoepidermoid carcinoma of the hard palate: a case illustrating grading uncertainty and bone-sparing surgical management. Cureus. 2026;18(8):e115250'
ELL_CONSENT = 'The journal states that consent was obtained or waived. Mouth and lips only; no eyes.'
PAGES['mec'] = dict(
    model='/head-neck/models/mec-case.glb', jaw='maxilla', side='right', margin=True,
    title=('Cancer of a small spit gland in the roof of the mouth | Vivatheca',
           '{口|くち}の{天井|てんじょう}の{小|ちい}さなだ{液|えき}{腺|せん}のがん | Vivatheca'),
    description=('A 3D model that follows one published case of low-grade mucoepidermoid carcinoma of the hard palate, removed with a cuff of lining while keeping the bone.',
                 '{口|くち}の{天井|てんじょう}にできた{低悪性度|ていあくせいど}の{粘表皮|ねんひょうひ}がんの{公開|こうかい}{症例|しょうれい}に{合|あ}わせた3D{模型|もけい}です。{骨|ほね}を{残|のこ}し、まわりの{粘膜|ねんまく}と{一緒|いっしょ}に{取|と}りました。'),
    h1=('Cancer of a small spit gland in the roof of the mouth <span class="pitk-skip">(mucoepidermoid carcinoma)</span>',
        '{口|くち}の{天井|てんじょう}の{小|ちい}さなだ{液|えき}{腺|せん}のがん<span class="pitk-skip">（{粘表皮|ねんひょうひ}がん）</span>'),
    lede=('This 3D model follows one real, published case. A man aged 42 had a slow-growing lump on the right side of the roof of his mouth. '
          'It was a slow type of cancer that starts in a small spit gland. The surgeon took out the lump with a cuff of normal lining and kept the bone above it.' + cite(1),
          'この3D{模型|もけい}は、{論文|ろんぶん}で{公開|こうかい}された{実際|じっさい}の{症例|しょうれい}に{合|あ}わせて{作|つく}りました。42{歳|さい}の{男性|だんせい}の{口|くち}の{天井|てんじょう}の{右側|みぎがわ}に、ゆっくり{大|おお}きくなるしこりがありました。{小|ちい}さなだ{液|えき}{腺|せん}にできる、{進|すす}みの{遅|おそ}いがんでした。{外科医|げかい}は、まわりの{正常|せいじょう}な{粘膜|ねんまく}と{一緒|いっしょ}にしこりを{取|と}り、{上|うえ}の{骨|ほね}は{残|のこ}しました。' + jcite(1)),
    stages=[
        ('pre', ('1 · Before surgery', '1・{手術|しゅじゅつ}の{前|まえ}'),
         ('<b>Before surgery.</b> The cancer (dark red) is a soft lump in the lining of the roof of the mouth, just right of the middle. It is 1 to 1.5 cm across. The bone above it is thin but not broken.',
          '<b>{手術|しゅじゅつ}の{前|まえ}。</b>がん（{濃|こ}い{赤|あか}）は、{口|くち}の{天井|てんじょう}の{粘膜|ねんまく}にあるやわらかいしこりで、{真|ま}ん{中|なか}の{少|すこ}し{右|みぎ}です。{大|おお}きさは1〜1.5cmです。{上|うえ}の{骨|ほね}は{薄|うす}くなっていますが、{穴|あな}はあいていません。')),
        ('op', ('2 · What is removed', '2・{取|と}るもの'),
         ('<b>What is removed.</b> The lump comes out with about 5 mm of normal lining around it and the thin layer that covers the bone. The bone is kept.',
          '<b>{取|と}るもの。</b>しこりを、まわりの{正常|せいじょう}な{粘膜|ねんまく}{約|やく}5mmと、{骨|ほね}をおおう{薄|うす}い{膜|まく}と{一緒|いっしょ}に{取|と}ります。{骨|ほね}は{残|のこ}します。')),
        ('post', ('3 · The raw area', '3・{傷|きず}の{部分|ぶぶん}'),
         ('<b>The raw area.</b> The bone is bare where the lining was. No teeth are lost, and there is no hole into the nose.',
          '<b>{傷|きず}の{部分|ぶぶん}。</b>{粘膜|ねんまく}があったところは{骨|ほね}が{出|で}ています。{歯|は}はなくならず、{鼻|はな}への{穴|あな}もありません。')),
        ('recon', ('4 · Healing', '4・{治|なお}る'),
         ('<b>Healing.</b> A clear plastic plate clips onto the teeth. It holds a soft dressing paste over the raw area and protects it while new lining grows. By 4 months the roof of the mouth had healed.',
          '<b>{治|なお}る。</b>{透明|とうめい}なプラスチックの{板|いた}を{歯|は}に{留|と}めます。{傷|きず}の{上|うえ}にやわらかいパックを{押|お}さえ、{新|あたら}しい{粘膜|ねんまく}ができるまで{守|まも}ります。4か{月|げつ}で{口|くち}の{天井|てんじょう}は{治|なお}りました。')),
    ],
    case_h=('The real case', '{実際|じっさい}の{症例|しょうれい}'),
    case=[
        ('A man aged 42 had a painless lump on the roof of his mouth for about a year. His dentist found it at a check-up. A small piece of tissue showed this cancer. '
         'Scans showed a lump of 15 × 12 × 5 mm. The bone above it was thin but not broken, and the cancer had not spread.' + cite(1),
         '42{歳|さい}の{男性|だんせい}は、{口|くち}の{天井|てんじょう}に{痛|いた}みのないしこりが1{年|ねん}ほどありました。{歯科|しか}の{検診|けんしん}で{見|み}つかりました。{組織|そしき}を{少|すこ}し{取|と}る{検査|けんさ}で、このがんとわかりました。{画像|がぞう}{検査|けんさ}では15×12×5mmのしこりでした。{上|うえ}の{骨|ほね}は{薄|うす}くなっていましたが{穴|あな}はなく、がんは{広|ひろ}がっていませんでした。' + jcite(1)),
        ('The team chose to take out the lump with a cuff of normal lining and keep the bone. During surgery the layer on the bone looked healthy, so the bone stayed. A plate with dressing paste covered the area.' + cite(1),
         'チームは、まわりの{正常|せいじょう}な{粘膜|ねんまく}と{一緒|いっしょ}にしこりを{取|と}り、{骨|ほね}を{残|のこ}すことにしました。{手術中|しゅじゅつちゅう}、{骨|ほね}の{上|うえ}の{膜|まく}は{健康|けんこう}に{見|み}えたので、{骨|ほね}は{残|のこ}しました。パックと{板|いた}で{傷|きず}をおおいました。' + jcite(1)),
        ('Tests on the removed tissue showed clear edges. No more treatment was needed, only regular checks. He healed with no hole into the nose.' + cite(1),
         '{取|と}った{組織|そしき}の{検査|けんさ}で、ふちにがんはありませんでした。{追加|ついか}の{治療|ちりょう}は{必要|ひつよう}なく、{定期的|ていきてき}な{検査|けんさ}だけになりました。{鼻|はな}への{穴|あな}もなく{治|なお}りました。' + jcite(1)),
    ],
    images=[
        dict(src='mec/mec-ellam-fig1-preop-palate.jpg', out='mec/mec-before.jpg', id='mec-ellam-fig1', resize=640,
             alt=('Photo looking up into an open mouth at the roof of the mouth. An arrow points to a red, slightly raised lump just right of the middle, level with the small back teeth.',
                  '{開|ひら}いた{口|くち}の{天井|てんじょう}を{見|み}上|あ}げた{写真|しゃしん}。{矢印|やじるし}は、{真|ま}ん{中|なか}の{少|すこ}し{右|みぎ}、{小|ちい}さな{奥歯|おくば}の{高|たか}さにある、{赤|あか}く{少|すこ}しもり{上|あ}がったしこりを{指|さ}しています。'.replace('{見|み}上|あ}げた', '{見|み}{上|あ}げた')),
             cap=('<b>Image 1. Before surgery.</b> The arrow shows the red lump, 10 to 12 mm across, just right of the middle (on the left of the photo). The model puts it in the same place.',
                  '<b>{画像|がぞう}1. {手術|しゅじゅつ}の{前|まえ}。</b>{矢印|やじるし}は、{真|ま}ん{中|なか}の{少|すこ}し{右|みぎ}（{写真|しゃしん}では{左|ひだり}）にある10〜12mmの{赤|あか}いしこりです。{模型|もけい}も{同|おな}じ{場所|ばしょ}にしました。'),
             credit=credit(ELL, 'Figure 1', '10.7759/cureus.115250', 'resized to 640 px wide.', ELL_CONSENT)),
        dict(src='mec/mec-ellam-fig3-mri-sagittal.jpg', out='mec/mec-mri.jpg', id='mec-ellam-fig3', resize=640,
             alt=('A side-on slice of the head from a magnetic scan, showing a small bright lump under the bony roof of the mouth.',
                  '{横|よこ}から{見|み}た{頭|あたま}の{磁気|じき}の{画像|がぞう}{検査|けんさ}の{断面|だんめん}。{口|くち}の{天井|てんじょう}の{骨|ほね}の{下|した}に、{小|ちい}さな{明|あか}るいしこりが{見|み}えます。'),
             cap=('<b>Image 2. A magnetic scan (MRI).</b> A side-on slice. The lump sits under the bony roof of the mouth and has not gone through the bone.',
                  '<b>{画像|がぞう}2. {磁気|じき}の{画像|がぞう}{検査|けんさ}（MRI）。</b>{横|よこ}から{見|み}た{断面|だんめん}です。しこりは{口|くち}の{天井|てんじょう}の{骨|ほね}の{下|した}にあり、{骨|ほね}を{通|とお}りぬけていません。'),
             credit=credit(ELL, 'Figure 3', '10.7759/cureus.115250', 'resized to 640 px wide.', 'The journal states that consent was obtained or waived.')),
        dict(src='mec/mec-ellam-fig4-immediate-postop.jpg', out='mec/mec-after-surgery.jpg', id='mec-ellam-fig4', surgical=True, resize=640,
             alt=('Photo looking up at the roof of the mouth right after surgery. An oval raw area, darker red, sits just right of the middle where the lump was.',
                  '{手術|しゅじゅつ}の{直後|ちょくご}に{口|くち}の{天井|てんじょう}を{見|み}{上|あ}げた{写真|しゃしん}。しこりがあった{真|ま}ん{中|なか}の{少|すこ}し{右|みぎ}に、{濃|こ}い{赤|あか}のだ{円|えん}{形|けい}の{傷|きず}があります。'),
             cap=('<b>Image 3. Right after surgery.</b> The raw area where the lump and its cuff of lining were removed. The bone underneath was kept.',
                  '<b>{画像|がぞう}3. {手術|しゅじゅつ}の{直後|ちょくご}。</b>しこりとまわりの{粘膜|ねんまく}を{取|と}った{傷|きず}です。{下|した}の{骨|ほね}は{残|のこ}しました。'),
             credit=credit(ELL, 'Figure 4', '10.7759/cureus.115250', 'resized to 640 px wide.', ELL_CONSENT)),
        dict(src='mec/mec-ellam-fig6-4-months.jpg', out='mec/mec-healed.jpg', id='mec-ellam-fig6', resize=640,
             alt=('Photo looking up at the roof of the mouth four months after surgery. The area is covered with smooth pink lining again.',
                  '{手術|しゅじゅつ}の4か{月|げつ}{後|ご}に{口|くち}の{天井|てんじょう}を{見|み}{上|あ}げた{写真|しゃしん}。なめらかなピンクの{粘膜|ねんまく}でまたおおわれています。'),
             cap=('<b>Image 4. Four months later.</b> New lining has grown over the area, and the shape of the roof of the mouth is kept.',
                  '<b>{画像|がぞう}4. 4か{月|げつ}{後|ご}。</b>{新|あたら}しい{粘膜|ねんまく}が{傷|きず}をおおい、{口|くち}の{天井|てんじょう}の{形|かたち}も{保|たも}たれています。'),
             credit=credit(ELL, 'Figure 6', '10.7759/cureus.115250', 'resized to 640 px wide.', ELL_CONSENT)),
    ],
    recon_h=('How the roof of the mouth heals', '{口|くち}の{天井|てんじょう}の{治|なお}り{方|かた}'),
    recon=[
        ('When the bone is kept, the raw area heals by itself under a protective plate, as in this case.' + cite(1),
         '{骨|ほね}を{残|のこ}したときは、この{症例|しょうれい}のように、{保護|ほご}の{板|いた}の{下|した}で{傷|きず}は{自然|しぜん}に{治|なお}ります。' + jcite(1)),
    ],
    diagrams=[
        dict(file='palate-cover-plate.svg', w=800, h=320,
             alt=('Diagram of the roof of the mouth cut across, seen from the front. Left: a lump in the pink lining under the bone, with a dashed cut line around it. Right: after surgery, orange dressing paste on the bare bone and a clear plate below, clipped to the teeth.',
                  '{正面|しょうめん}から{見|み}た{口|くち}の{天井|てんじょう}の{断面|だんめん}の{図|ず}。{左|ひだり}：{骨|ほね}の{下|した}のピンクの{粘膜|ねんまく}にあるしこりと、そのまわりの{点線|てんせん}。{右|みぎ}：{手術|しゅじゅつ}の{後|あと}、{出|で}ている{骨|ほね}の{上|うえ}のオレンジのパックと、{歯|は}に{留|と}めた{下|した}の{透明|とうめい}な{板|いた}。'),
             cap=('<b>Diagram 1. Keeping the bone</b> (roof of the mouth cut across, seen from the front; the patient’s right is on the left). (A) 1 The cancer in the lining. '
                  '2 The cut line, with normal lining around the cancer. 3 The bone, which is kept. (B) 4 The bare bone. 5 Dressing paste. 6 A clear plate clipped to the teeth.',
                  '<b>{図|ず}1. {骨|ほね}を{残|のこ}す</b>（{正面|しょうめん}から{見|み}た{口|くち}の{天井|てんじょう}の{断面|だんめん}。{患者|かんじゃ}さんの{右|みぎ}が{左|ひだり}）。（A）1 {粘膜|ねんまく}のがん。2 {切|き}る{線|せん}：がんのまわりの{正常|せいじょう}な{粘膜|ねんまく}を{含|ふく}めます。3 {骨|ほね}は{残|のこ}します。'
                  '（B）4 {出|で}ている{骨|ほね}。5 パック。6 {歯|は}に{留|と}めた{透明|とうめい}な{板|いた}。')),
    ],
    recon2=[
        ('Other ways to close a gap in the roof of the mouth: a flap of nearby palate lining can be turned to cover it. A large soft-tissue gap can be closed with a thin skin flap from the forearm (Diagram 2).' + cite(2) +
         ' If the cancer has grown into the bone, the bone is removed too. That leaves a hole into the nose or sinus, which is closed with a plate that carries teeth (obturator) or with a flap.' + cite(3),
         '{口|くち}の{天井|てんじょう}のすき{間|ま}を{閉|と}じるほかの{方法|ほうほう}：{近|ちか}くの{粘膜|ねんまく}を{回|まわ}してかぶせることがあります。やわらかい{部分|ぶぶん}の{大|おお}きなすき{間|ま}は、{腕|うで}の{薄|うす}い{皮膚|ひふ}で{閉|と}じることができます（{図|ず}2）。' + jcite(2) +
         'がんが{骨|ほね}の{中|なか}に{広|ひろ}がっていれば、{骨|ほね}も{取|と}ります。{鼻|はな}や{上顎洞|じょうがくどう}への{穴|あな}が{残|のこ}るので、{歯|は}のついた{板|いた}（{顎|がく}{義歯|ぎし}）か{皮弁|ひべん}で{閉|と}じます。' + jcite(3)),
    ],
    diagrams2=[
        dict(file='radial-forearm-flap.svg', w=800, h=420,
             alt=('Diagram. Left: a forearm, palm up, with an oval of skin marked near the wrist over an artery and veins. Right: the roof of the mouth seen from below, with a skin flap stitched into a gap and its vessels running back towards the neck.',
                  '{図|ず}。{左|ひだり}：{手|て}のひらを{上|うえ}にした{腕|うで}。{手首|てくび}の{近|ちか}くの{動脈|どうみゃく}と{静脈|じょうみゃく}の{上|うえ}に、だ{円|えん}{形|けい}の{皮膚|ひふ}の{印|しるし}。{右|みぎ}：{下|した}から{見|み}た{口|くち}の{天井|てんじょう}。すき{間|ま}に{皮膚|ひふ}が{縫|ぬ}いつけられ、{血管|けっかん}が{首|くび}の{方|ほう}へのびています。'),
             cap=('<b>Diagram 2. Radial forearm free flap (soft tissue only).</b> Not needed in this case. (A) The forearm, palm up. 1 An oval of thin skin is taken from the wrist side. 2 The artery and veins that feed it come with it. '
                  '3 A skin vein can also be used. (B) The flap stitched into a larger gap in the roof of the mouth, seen from below with the front teeth at the bottom. 4 The flap. 5 Its vessels run back to the neck.',
                  '<b>{図|ず}2. とう{骨|こつ}{前腕|ぜんわん}{皮弁|ひべん}（やわらかい{部分|ぶぶん}だけ）。</b>この{症例|しょうれい}では{必要|ひつよう}ありませんでした。（A）{手|て}のひらを{上|うえ}にした{腕|うで}。1 {手首|てくび}{側|がわ}の{薄|うす}い{皮膚|ひふ}をだ{円|えん}{形|けい}に{取|と}ります。2 それを{養|やしな}う{動脈|どうみゃく}と{静脈|じょうみゃく}も{一緒|いっしょ}に{取|と}ります。3 {皮膚|ひふ}の{下|した}の{静脈|じょうみゃく}も{使|つか}えます。'
                  '（B）{口|くち}の{天井|てんじょう}の{大|おお}きなすき{間|ま}に{縫|ぬ}いつけた{皮弁|ひべん}。{下|した}から{見|み}て、{前歯|まえば}が{下|した}です。4 {皮弁|ひべん}。5 {血管|けっかん}は{首|くび}へのびます。')),
    ],
    clin_h=('For clinicians: how this model was built', '{医療者向|いりょうしゃむ}け：この{模型|もけい}の{作|つく}り{方|かた}'),
    clin=[
        ('Case: 42-year-old man; right paramedian hard palate swelling, 10–12 mm clinically, 15 × 12 × 5 mm on MRI with cortical thinning but no breach. Wide local excision with periosteum; periosteum uninvolved intra-operatively, so no bone resection; palatal cover plate with Coe-Pak. Histology: 6 mm MEC, AFIP low grade, Brandwein intermediate grade; peripheral margins over 5 mm, deep margin 0.2 mm with a clear periosteal layer, no bone invasion. MDT: surveillance only.' + cite(1),
         '{症例|しょうれい}：42{歳|さい}{男性|だんせい}。{右|みぎ}{傍正中|ぼうせいちゅう}の{硬口蓋|こうこうがい}の{腫脹|しゅちょう}、{臨床|りんしょう}{的|てき}に10〜12mm、MRIで15×12×5mm、{皮質|ひしつ}の{菲薄化|ひはくか}はあるが{破綻|はたん}なし。{骨膜|こつまく}を{含|ふく}む{広範|こうはん}{局所|きょくしょ}{切除|せつじょ}。{術中|じゅっちゅう}に{骨膜|こつまく}{浸潤|しんじゅん}がなく{骨|こつ}{切除|せつじょ}なし。Coe-Pak{付|つ}きの{口蓋|こうがい}{被覆|ひふく}{床|しょう}。{病理|びょうり}：6mmのMEC、AFIPで{低|てい}{悪性度|あくせいど}、Brandweinで{中|ちゅう}{悪性度|あくせいど}。{周囲|しゅうい}{断端|だんたん}5mm{超|ちょう}、{深部|しんぶ}{断端|だんたん}0.2mm（{骨膜|こつまく}{層|そう}は{陰性|いんせい}）、{骨|こつ}{浸潤|しんじゅん}なし。MDTで{経過|けいか}{観察|かんさつ}のみ。' + jcite(1)),
        ('The authors cite Ord et al.: in low-grade palatal MEC without radiological bone invasion, mucosal excision alone gave no rise in local recurrence over 5 years. Grade, stage and margin status matter more than routine bone removal.' + cite(1),
         '{著者|ちょしゃ}はOrdらを{引用|いんよう}しています：{画像|がぞう}で{骨|こつ}{浸潤|しんじゅん}のない{低|てい}{悪性度|あくせいど}の{口蓋|こうがい}MECでは、{粘膜|ねんまく}{切除|せつじょ}のみでも5{年|ねん}{以上|いじょう}{局所|きょくしょ}{再発|さいはつ}は{増|ふ}えませんでした。{悪性度|あくせいど}、{病期|びょうき}、{断端|だんたん}は、{骨|ほね}を{決|き}まって{切除|せつじょ}するかどうかより{重要|じゅうよう}です。' + jcite(1)),
        ('Model: lesion 12 × 15 × 5 mm, centred 7.5 mm right of the midline at the 14/15 level (from Image 1); excision 22 × 25 mm (5 mm cuff), crossing the midline by 3.5 mm; bone and teeth unchanged. Clear cover plate 2 mm thick over the whole palate, with dressing in the defect.',
         '{模型|もけい}：{病変|びょうへん}12×15×5mm、{画像|がぞう}1をもとに14/15の{高|たか}さで{正中|せいちゅう}から{右|みぎ}へ7.5mm。{切除|せつじょ}{範囲|はんい}22×25mm（5mmの{縁|ふち}）、{正中|せいちゅう}を3.5mm{越|こ}えます。{骨|ほね}と{歯|は}はそのまま。{口蓋|こうがい}{全体|ぜんたい}をおおう2mmの{透明|とうめい}な{被覆|ひふく}{床|しょう}、{欠損|けっそん}{部|ぶ}にパック。'),
    ],
    refs=[
        (ELL + '.', '10.7759/cureus.115250'),
        ('Soutar DS, McGregor IA. The radial forearm flap in intraoral reconstruction: the experience of 60 consecutive cases. Plast Reconstr Surg. 1986;78(1):1-8.', '10.1097/00006534-198607000-00001'),
        ('Wang F, Huang W, Zhang C, et al. Functional outcome and quality of life after a maxillectomy: a comparison between an implant supported obturator and implant supported fixed prostheses in a free vascularized flap. Clin Oral Implants Res. 2017;28(2):137-143.', '10.1111/clr.12771'),
    ],
)


# ---------------------------------------------------------------------------------------------
def esc(s):
    return html.escape(s, quote=True)


def plain(s):
    import re
    return re.sub(r'\{([^{}|]+)\|([^{}]+)\}', r'\1', s)


def build(slug, P):
    ja = dict(COMMON_JA)
    out = []
    w = out.append

    def t(key, en, jtext, tag='p', attrs=''):
        ja[key] = jtext
        w(f'<{tag}{attrs} data-i18n="{key}">{en}</{tag}>')

    ja['title'] = P['title'][1]
    ja['description'] = P['description'][1]
    w('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">')
    w(f'<title>{esc(P["title"][0])}</title>')
    w(f'<meta name="description" content="{esc(P["description"][0])}">\n<meta name="robots" content="noindex">')
    w("<script>\ntry { if (localStorage.getItem('vivatheca-theme') === 'dark') document.documentElement.dataset.theme = 'dark'; } catch (e) {}\n</script>")
    w('<link rel="preload" href="/head-neck/fonts/manrope-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>')
    w('<link rel="stylesheet" href="/head-neck/style.css">\n<link rel="stylesheet" href="/head-neck/condition.css">\n</head>\n<body>')
    w('<header class="bar">\n  <div class="bar-left">\n    <a class="lang" href="/" data-i18n="home">Vivatheca home</a>\n    <a class="lang" href="/models" data-i18n="allModels">All models</a>\n'
      '    <a class="lang" href="/head-neck/" data-i18n="hub">Head and neck</a>\n'
      '    <button class="theme" id="theme" type="button" data-dark="Dark mode" data-light="Light mode" data-dark-ja="ダークモード" data-light-ja="ライトモード">Dark mode</button>\n'
      '  </div>\n  <div class="langs" id="langs" role="group" aria-label="Language"></div>\n</header>\n\n<main>')
    t('h1', P['h1'][0], P['h1'][1], 'h1')
    t('lede', P['lede'][0], P['lede'][1], 'p', ' class="lede"')
    w('<div class="note"><p data-i18n="viewOnly"><b>3D viewing only for now.</b> Print files are not available yet.</p></div>')
    side = P.get('side', 'right')
    w(f'<div class="viewer" id="viewer" data-model="{P["model"]}" data-jaw="{P["jaw"]}" data-side="{side}">\n'
      '  <div class="problem" id="status" data-i18n="loading">Loading model…</div>\n  <ul class="vlegend" id="legend" aria-live="polite"></ul>\n'
      '  <span class="hint" data-i18n="hint">Drag to rotate · pinch or scroll to zoom</span>\n</div>')
    w('<div class="row stages" role="group" aria-label="Stage" data-i18n-aria="stage">')
    for i, (key, lab, _) in enumerate(P['stages']):
        ja['s_' + key] = lab[1]
        w(f'  <button type="button" data-stage="{key}" aria-pressed="{"true" if i == 0 else "false"}" data-i18n="s_{key}">{lab[0]}</button>')
    w('</div>\n<div class="row toggles">')
    if P.get('margin'):
        w('  <button type="button" id="btn-margin" aria-pressed="false" data-i18n="t_margin">Safety margin</button>')
    w('  <button type="button" id="btn-xray" aria-pressed="false" data-i18n="t_xray">See-through bone</button>\n</div>')
    views = [('front', 'Front'), ('right', 'Right side'), ('left', 'Left side'), ('under', 'From below'), ('above', 'From above')]
    w('<div class="row views" role="group" aria-label="View" data-i18n-aria="view">' + ''.join(
        f'\n  <button type="button" data-view="{k}" data-i18n="v_{k}">{v}</button>' for k, v in views) + '\n</div>')
    w('<div class="stage-text" id="stage" aria-live="polite">')
    for i, (key, _, txt) in enumerate(P['stages']):
        ja['st_' + key] = txt[1]
        w(f'  <p data-for="{key}"{"" if i == 0 else " hidden"} data-i18n="st_{key}">{txt[0]}</p>')
    w('</div>')

    # real case
    w('\n<section id="case">')
    t('caseH', P['case_h'][0], P['case_h'][1], 'h2')
    for i, (en, jt) in enumerate(P['case']):
        t(f'case{i + 1}', en, jt)
    w('</section>')

    # images
    w('\n<section id="clinical-images">')
    t('clinH', 'Real photos, X-rays and scans from this case', 'この{症例|しょうれい}の{実際|じっさい}の{写真|しゃしん}、X{線|せん}{写真|しゃしん}、{画像|がぞう}{検査|けんさ}', 'h2')
    w('<p class="clinical-note" data-i18n="clinNote">These images are from the real patient. The authors published them openly. Each image keeps its own licence, given under it; it is not covered by the model licence.</p>')
    for n, im in enumerate(P['images'], 1):
        key = f'img{n}'
        ja[key + 'Alt'] = im['alt'][1]
        ja[key] = im['cap'][1]
        fig = (f'<figure class="clin-fig" id="img-{n}">\n  <img src="/images/clinical/head-neck/{im["out"]}" width="{im["w"]}" height="{im["h"]}" loading="lazy" alt="{esc(im["alt"][0])}" data-i18n-alt="{key}Alt">\n'
               f'  <figcaption><span data-i18n="{key}">{im["cap"][0]}</span>\n    {im["credit"]}</figcaption>\n</figure>')
        if im.get('surgical'):
            fig = ('<details class="surgical">\n  <summary data-i18n="surgShow">Show surgery photo (shows blood)</summary>\n' + fig + '\n</details>')
        w(fig)
    w('</section>')

    # reconstruction / treatment
    w('\n<section id="treatment">')
    t('reconH', P['recon_h'][0], P['recon_h'][1], 'h2')
    for i, (en, jt) in enumerate(P['recon']):
        t(f'recon{i + 1}', en, jt)

    def diagrams(lst, base):
        for j, d in enumerate(lst, 1):
            key = f'{base}{j}'
            ja[key + 'Alt'] = d['alt'][1]
            ja[key] = d['cap'][1]
            w(f'<figure class="diagram">\n  <img src="/head-neck/diagrams/{d["file"]}" width="{d["w"]}" height="{d["h"]}" loading="lazy" alt="{esc(d["alt"][0])}" data-i18n-alt="{key}Alt">\n'
              f'  <figcaption data-i18n="{key}">{d["cap"][0]}</figcaption>\n</figure>')
    diagrams(P.get('diagrams', []), 'dg')
    if 'options' in P:
        w('<ol class="options">')
        for i, (en, jt) in enumerate(P['options'], 1):
            ja[f'opt{i}'] = jt
            w(f'  <li data-i18n="opt{i}">{en}</li>')
        w('</ol>')
        t('optAfter', P['options_after'][0], P['options_after'][1])
    for i, (en, jt) in enumerate(P.get('recon2', []), 1):
        t(f'reconB{i}', en, jt)
    diagrams(P.get('diagrams2', []), 'dgb')
    w('</section>')

    # clinicians
    if 'table' in P:
        T = P['table']
        w('\n<section class="clin">')
        t('tableH', P['clin_h'][0], P['clin_h'][1], 'h2')
        ja['thead'] = T['head'][1]
        body_en = ''.join(f'<tr><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>' for r in T['rows'])
        body_ja = ''.join(f'<tr><td>{r[4]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[5]}</td></tr>' for r in T['rows'])
        ja['tbody'] = body_ja
        w(f'<div class="tablewrap"><table>\n  <thead data-i18n="thead">{T["head"][0]}</thead>\n  <tbody data-i18n="tbody">{body_en}</tbody>\n</table></div>')
        t('tableNote', T['note'][0], T['note'][1], 'p', ' class="small"')
        w('</section>')
        clin_h = P['clin2_h']
    else:
        clin_h = P['clin_h']
    w('\n<section class="clin">')
    t('clinicH', clin_h[0], clin_h[1], 'h2')
    w('<ul>')
    for i, (en, jt) in enumerate(P['clin'], 1):
        ja[f'cl{i}'] = jt
        w(f'  <li data-i18n="cl{i}">{en}</li>')
    w('</ul>\n</section>')

    w('\n<section class="disclaimer">')
    w('  <h2 data-i18n="aboutH">About this model</h2>')
    w('  <p data-i18n="about1"><strong>Not yet clinically reviewed.</strong> Educational model only. It shows typical anatomy or disease, not any real patient, and is simplified and may contain errors. Not for diagnosis, treatment planning, surgical guides or use in or on the body. <a href="/disclaimer">Full disclaimer</a></p>')
    w(f'  <p class="small" data-i18n="about2">{ABOUT2_EN}</p>')
    w(f'  <p class="small credit" data-i18n="credit">{CREDIT_EN}</p>\n</section>')
    w('\n<section class="refs">\n<details>\n  <summary><h2 data-i18n="sourcesH">Sources</h2></summary>\n  <ol id="refs">')
    for i, (txt, link) in enumerate(P['refs'], 1):
        href = link if link.startswith('http') else 'https://doi.org/' + link
        shown = link.replace('https://', '') if link.startswith('http') else 'doi.org/' + link
        w(f'    <li id="ref-{i}">{txt} <a href="{href}">{shown}</a></li>')
    w('  </ol>\n</details>\n</section>')
    w(f'\n<p class="small" data-i18n="version">{VERSION_EN}</p>\n</main>')
    w('<script src="ja.js"></script>\n<script src="/head-neck/i18n-engine.js"></script>\n<script src="/head-neck/theme.js"></script>')
    w('<script src="/head-neck/vendor/three/three.min.js"></script>\n<script src="/head-neck/vendor/three/GLTFLoader.js"></script>\n<script src="/head-neck/vendor/three/OrbitControls.js"></script>')
    w('<script src="/head-neck/case-viewer.js"></script>\n<script src="/contact.js"></script>\n</body>\n</html>\n')
    d = os.path.join(PUB, slug)
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.html'), 'w').write('\n'.join(out))
    open(os.path.join(d, 'ja.js'), 'w').write(
        '// Japanese text for this page (generated by tools/head-neck/pages.py; edit there).\n'
        'window.VIVA_JA = ' + json.dumps(ja, ensure_ascii=False, indent=1) + ';\n')


def images():
    """Copy the case figures into public/images/clinical/head-neck/<case>/ (resized where stated)."""
    from PIL import Image
    src_root = os.environ.get('CASE_IMAGES', '/mnt/project-files/head-neck-recon/case-images')
    dst_root = os.path.join(ROOT, 'public', 'images', 'clinical', 'head-neck')
    for P in PAGES.values():
        for im in P['images']:
            dst = os.path.join(dst_root, im['out'])
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            if not os.path.exists(dst) and not im.get('resize'):
                import shutil
                shutil.copyfile(os.path.join(src_root, im['src']), dst)
            elif not os.path.exists(dst):
                img = Image.open(os.path.join(src_root, im['src'])).convert('RGB')
                if img.width > im['resize']:
                    img = img.resize((im['resize'], round(img.height * im['resize'] / img.width)), Image.LANCZOS)
                img.save(dst, quality=84, optimize=True)
            im['w'], im['h'] = Image.open(dst).size


if __name__ == '__main__':
    images()
    for slug, P in PAGES.items():
        build(slug, P)
        print('built', slug)
