// Head and neck resection cases: three.js viewer, case text (English and Japanese) and sources.
// Models: models/<case>.glb, built from Z-Anatomy (see the build scripts in the project files).
// Node names in each GLB: bone, teeth, sphenoid, lesion, margin, specimen_*, extracted_teeth,
// removed_bone, excised_mucoperiosteum, nerve_path, obturator, obturator_teeth, free_flap.
(function () {
  const I = window.VIVA_I18N || { lang: 'en', text: () => null, ruby: (s) => s, plain: (s) => s };
  const JA = I.lang === 'ja';
  const T = (key, en) => { const s = I.text(key); return s ? I.ruby(s) : en; };
  const c = (...n) => n.map((i) => '<sup class="cite"><a href="#ref-' + i + '">' + i + '</a></sup>').join('');

  const REFS = [
    ['Brown JS, Barry C, Ho M, Shaw R. A new classification for mandibular defects after oncological resection. Lancet Oncol. 2016;17(1):e23-e30.', '10.1016/S1470-2045(15)00310-1'],
    ['Sauerbier S, Gutwald R, Schmelzeisen R, et al. Resection of oral cancer involving the mandible. In: Advanced Craniomaxillofacial Surgery. Thieme.', '10.1055/b-0040-178440'],
    ['Mücke T, Hölzle F, Wagenpfeil S, Wolff KD, Kesting M. The role of tumor invasion into the mandible of oral squamous cell carcinoma. J Cancer Res Clin Oncol. 2011;137(1):165-171.', '10.1007/s00432-010-0870-3'],
    ['Key strategies for determining surgical resection margins in oral squamous cell carcinoma (letter). Int J Surg. 2025.', '10.1097/JS9.0000000000002704'],
    ['Lajolo C, et al. Pulp vitality of teeth adjacent to jaw osteotomies. BMC Oral Health. 2023.', '10.1186/s12903-023-03050-7'],
    ['Neagu D, Escuder-de la Torre O, Vázquez-Mahía I, et al. Surgical management of ameloblastoma. Review of literature. J Clin Exp Dent. 2019;11(1):e70-e75.', '10.4317/jced.55452'],
    ['Kalaiselvan S, et al. Ameloblastoma: surgical margins. J Pharm Bioallied Sci. 2016.', '10.4103/0975-7406.191940'],
    ['Kaczmarzyk T, Mojsa I, Stypulkowska J. A systematic review of the recurrence rate for keratocystic odontogenic tumour in relation to treatment modalities. Int J Oral Maxillofac Surg. 2012.', '10.1016/j.ijom.2012.02.008'],
    ['Borrás-Ferreres J, et al. Odontogenic keratocyst: review of treatment. J Clin Exp Dent. 2024.', '10.4317/jced.62032'],
    ['Dioguardi M, Quarta C, Sovereto D, et al. Factors and management techniques in odontogenic keratocysts: a systematic review. Eur J Med Res. 2024;29(1):287.', '10.1186/s40001-024-01854-z'],
    ['Zar K, Tabib R, Rushinek H, et al. The correlation between histopathological pattern and surgical treatment for palatal pleomorphic adenoma. J Craniomaxillofac Surg. 2024;52(12):1469-1475.', '10.1016/j.jcms.2024.08.015'],
    ['Moon SY. Surgical management of the palatal pleomorphic adenoma. J Craniofac Surg. 2019;30(6):e580-e582.', '10.1097/SCS.0000000000005608'],
    ['Kostares E, Diamantopoulou S, Schoinohoriti O, et al. Recurrent pleomorphic adenoma of the palate: a case report. Clin Pract. 2026;16(9):168.', '10.3390/clinpract16090168'],
    ['Geiger JL, Ismaila N, Beadle B, et al. Management of salivary gland malignancy: ASCO guideline. J Clin Oncol. 2021;39(17):1909-1941.', '10.1200/JCO.21.00449'],
    ['Brown JS, Shaw RJ. Reconstruction of the maxilla and midface: introducing a new classification. Lancet Oncol. 2010;11(10):1001-1008.', '10.1016/S1470-2045(10)70113-3'],
    ['Okay DJ, Genden E, Buchbinder D, Urken M. Prosthodontic guidelines for surgical reconstruction of the maxilla: a classification system of defects. J Prosthet Dent. 2001;86(4):352-363.', '10.1067/mpr.2001.119524'],
    ['Breeze J, Rennie A, Morrison A, et al. Health-related quality of life after maxillectomy: obturator rehabilitation compared with flap reconstruction. Br J Oral Maxillofac Surg. 2016;54(8):857-862.', '10.1016/j.bjoms.2016.05.024'],
    ['Zhou B, Huang ZS, Chen WL, et al. Outcomes of patients with mucoepidermoid carcinoma of minor salivary gland in palate undergoing radical resection followed by submental flap reconstruction. Asian J Surg. 2022;45(6):1225-1230.', '10.1016/j.asjsur.2021.08.039'],
    ['Ju WT, Zhao TC, Liu Y, et al. Computed tomographic features of adenoid cystic carcinoma in the palate. Cancer Imaging. 2019;19(1):3.', '10.1186/s40644-019-0190-z'],
    ['Bakst RL, Glastonbury CM, Parvathaneni U, et al. Perineural invasion and perineural tumor spread in head and neck cancer. Int J Radiat Oncol Biol Phys. 2019;103(5):1109-1124.', '10.1016/j.ijrobp.2018.12.009'],
    ['Wang F, Huang W, Zhang C, et al. Functional outcome and quality of life after a maxillectomy: a comparison between an implant supported obturator and implant supported fixed prostheses in a free vascularized flap. Clin Oral Implants Res. 2017;28(2):137-143.', '10.1111/clr.12771'],
    ['Hidalgo DA. Fibula free flap: a new method of mandible reconstruction. Plast Reconstr Surg. 1989;84(1):71-79. PubMed 2734406.', 'https://pubmed.ncbi.nlm.nih.gov/2734406/'],
  ];
  document.getElementById('refs').innerHTML = REFS.map((r, i) =>
    '<li id="ref-' + (i + 1) + '">' + r[0] + ' ' + (r[1].startsWith('http') ? '<a href="' + r[1] + '">' + r[1].replace('https://', '') + '</a>' : '<a href="https://doi.org/' + r[1] + '">doi.org/' + r[1] + '</a>') + '</li>').join('');

  // Case text. Each field is [English, Japanese]; Japanese uses {漢字|かんじ} for furigana.
  const CASES = {
    scc: { jaw: 'mandible', recon: true,
      title: ['Squamous cell carcinoma, right lower gum', 'へんぺい{上皮|じょうひ}がん（{右|みぎ}の{下|した}の{歯|は}ぐき）'],
      sum: ['A mouth cancer on the gum beside the first big back tooth (46) that has grown into the jaw bone. Once cancer is inside the bone, a full-thickness block of jaw is removed (segmental mandibulectomy) rather than a rim.' + c(2, 3),
        '{第一|だいいち}{大臼歯|だいきゅうし}の{横|よこ}の{歯|は}ぐきにできて、あごの{骨|ほね}の{中|なか}まで{広|ひろ}がった{口|くち}のがんです。がんが{骨|ほね}の{中|なか}に{入|はい}っているときは、{骨|ほね}のふちだけでなく、あごの{骨|ほね}を{上|うえ}から{下|した}まで{切|き}り{取|と}ります（{下|した}あごの{区域|くいき}{切除|せつじょ}）。' + c(2, 3)],
      why: [
        ['Bone margin of at least 10 mm beyond the tumour at both cuts.' + c(2, 4) + ' In the model: 12.6 mm at the front cut and 10.4 mm at the back cut.',
          '{両方|りょうほう}の{切|き}り{口|くち}で、がんから10mm{以上|いじょう}{離|はな}して{骨|ほね}を{切|き}ります。' + c(2, 4) + '{模型|もけい}では{前|まえ}12.6mm、{後|うし}ろ10.4mmです。'],
        ['Teeth standing in the removed block (44–47) come out with the bone.' + c(2),
          '{切|き}り{取|と}る{骨|ほね}の{中|なか}の{歯|は}（44〜47）は、{別|べつ}に{抜|ぬ}かずに{骨|ほね}と{一緒|いっしょ}に{取|と}り{除|のぞ}きます。' + c(2)],
        ['The front cut runs through the socket of the canine (43), which is taken out during surgery, so the next tooth (42) is not cut.' + c(5),
          '{前|まえ}の{切|き}り{口|くち}は、{手術|しゅじゅつ}のときに{抜|ぬ}く{犬歯|けんし}（43）の{穴|あな}を{通|とお}るので、となりの{歯|は}（42）は{切|き}りません。' + c(5)],
        ['The gum and lining are cut 1–1.5 cm around the tumour you can see.' + c(2),
          '{歯|は}ぐきと{口|くち}の{粘膜|ねんまく}は、{見|み}えているがんの{周|まわ}り1〜1.5cmで{切|き}ります。' + c(2)],
        ['Taking only a rim of bone is an option when the cancer has not got into the bone and enough height is left. In one study, the cancer had got into the bone in 85 of 100 jaws taken out this way.' + c(3),
          'がんが{骨|ほね}の{中|なか}に{入|はい}っておらず、{十分|じゅうぶん}な{高|たか}さの{骨|ほね}が{残|のこ}るときは、{骨|ほね}のふちだけを{切|き}る{方法|ほうほう}もあります。ある{研究|けんきゅう}では、{区域|くいき}{切除|せつじょ}した{骨|ほね}の85%にがんが{入|はい}っていました。' + c(3)],
      ],
      stats: [['Bone removed', '8.6 cm³', '{取|と}る{骨|ほね}', '8.6 cm³'], ['Teeth', '44–47 with the bone; 43 at the cut', '{歯|は}', '44〜47は{骨|ほね}と{一緒|いっしょ}に、43は{切|き}り{口|くち}で{抜|ぬ}く'], ['Gap', '43 mm, canine socket to behind 47', '{欠損|けっそん}', '43mm（{犬歯|けんし}の{穴|あな}から47の{後|うし}ろまで）']],
      reconNote: ['Shown: a fibula free flap. A 47.5 mm piece of the lower-leg bone (fibula), with its blood supply, fills the gap and is held with a titanium plate and 8 screws. The fibula is shorter in height than the jaw it replaces, which is part of why the face and bite change later.' + c(22, 1),
        '{模型|もけい}ではひ{骨|こつ}{皮弁|ひべん}を{示|しめ}しています。{血管|けっかん}ごと{移|うつ}したすねの{骨|ほね}（ひ{骨|こつ}）47.5mmで{欠損|けっそん}を{埋|う}め、チタンのプレートとネジ8{本|ほん}で{固定|こてい}します。ひ{骨|こつ}はもとのあごより{高|たか}さが{低|ひく}いため、{手術|しゅじゅつ}{後|ご}に{顔|かお}の{形|かたち}やかみ{合|あ}わせが{変|か}わる{理由|りゆう}の1つになります。' + c(22, 1)],
      choice: ['Our choices for the model: tumour 18 × 15 × 16 mm; the back cut is angled up into the ramus so the angle of the jaw is kept.',
        '{当方|とうほう}の{設定|せってい}：がんの{大|おお}きさは18×15×16mm。{後|うし}ろの{切|き}り{口|くち}はあごの{後|うし}ろの{縦|たて}の{部分|ぶぶん}に{向|む}けて{斜|なな}めにし、あごの{角|かど}を{残|のこ}しています。'] },
    ameloblastoma: { jaw: 'mandible', recon: true,
      title: ['Ameloblastoma, right body and angle of the jaw', 'エナメル{上皮腫|じょうひしゅ}（{右|みぎ}のあごの{体|からだ}と{角|かど}）'],
      sum: ['A growth that is not cancer but spreads into nearby bone. It grows from tooth-forming tissue. Solid and multicystic types often come back if they are only scooped out, so they are cut out with a wide bone margin.' + c(6, 7),
        '{歯|は}をつくる{組織|そしき}からできる{良性|りょうせい}の{腫瘍|しゅよう}ですが、まわりに{入|い}りこんで{広|ひろ}がります。{充実|じゅうじつ}{型|がた}や{多|た}のう{胞|ほう}{型|がた}はかき{出|だ}すだけでは{再発|さいはつ}しやすいため、{骨|ほね}を{広|ひろ}く{付|つ}けて{切|き}り{取|と}ります。' + c(6, 7)],
      why: [
        ['Bone margin of 1–1.5 cm, because tumour cells can lie about 8 mm beyond what the X-ray shows.' + c(6, 7) + ' In the model: 16.0 mm front and 15.2 mm back.',
          'レントゲンで{見|み}える{範囲|はんい}より8mmほど{外|そと}にも{腫瘍|しゅよう}{細胞|さいぼう}があるため、{骨|ほね}を1〜1.5cm{離|はな}して{切|き}ります。' + c(6, 7) + '{模型|もけい}では{前|まえ}16.0mm、{後|うし}ろ15.2mmです。'],
        ['In a review it came back in 60–80% after scooping out alone, against 0–10% after resection.' + c(6),
          'ある{総説|そうせつ}では、かき{出|だ}すだけだと60〜80%、{切除|せつじょ}すると0〜10%で{再発|さいはつ}しました。' + c(6)],
        ['The gum over the tumour is removed with the bone.' + c(6), '{腫瘍|しゅよう}の{上|うえ}の{歯|は}ぐきも{骨|ほね}と{一緒|いっしょ}に{取|と}ります。' + c(6)],
        ['As in the cancer case, the front cut goes through the socket of the canine (43), taken out during surgery, so 42 is not cut.',
          'がんの{例|れい}と{同|おな}じく、{前|まえ}の{切|き}り{口|くち}は{手術|しゅじゅつ}で{抜|ぬ}く{犬歯|けんし}（43）の{穴|あな}を{通|とお}るので、42は{切|き}りません。'],
      ],
      stats: [['Bone removed', '15.7 cm³', '{取|と}る{骨|ほね}', '15.7 cm³'], ['Teeth', '44–47 with the bone; 43 at the cut', '{歯|は}', '44〜47は{骨|ほね}と{一緒|いっしょ}に、43は{切|き}り{口|くち}で{抜|ぬ}く'], ['Gap', '68 mm, includes the angle of the jaw', '{欠損|けっそん}', '68mm（あごの{角|かど}を{含|ふく}む）']],
      reconNote: ['Shown: a fibula free flap in two pieces (55.5 mm along the body and 13.5 mm up the ramus), joined at a new angle of the jaw and held with a titanium plate and 10 screws. Longer gaps that include a corner of the jaw need more bone cuts in the fibula. The joint (condyle) and upper ramus are kept.' + c(22, 1),
        '{模型|もけい}では2つに{分|わ}けたひ{骨|こつ}{皮弁|ひべん}（あごの{体|からだ}に{沿|そ}って55.5mm、あごの{後|うし}ろの{縦|たて}の{部分|ぶぶん}に{沿|そ}って13.5mm）を{示|しめ}しています。{新|あたら}しいあごの{角|かど}でつなぎ、チタンのプレートとネジ10{本|ほん}で{固定|こてい}します。あごの{角|かど}を{含|ふく}む{長|なが}い{欠損|けっそん}では、ひ{骨|こつ}を{切|き}る{回数|かいすう}が{増|ふ}えます。{関節|かんせつ}とあごの{後|うし}ろの{縦|たて}の{部分|ぶぶん}の{上|うえ}の{部分|ぶぶん}は{残|のこ}します。' + c(22, 1)],
      choice: ['Our choices for the model: four joined lobes, 26 × 12 × 12 mm overall.', '{当方|とうほう}の{設定|せってい}：4つの{塊|かたまり}がつながった{形|かたち}で、{全体|ぜんたい}26×12×12mm。'] },
    okc: { jaw: 'mandible', recon: false,
      title: ['Odontogenic keratocyst, right angle of the jaw', '{歯原性|しげんせい}{角化|かくか}のう{胞|ほう}（{右|みぎ}のあごの{角|かど}）'],
      sum: ['A fluid-filled cyst with a lining that tends to come back. The surgeon takes it out through a small window in the bone and shaves the wall of the hollow; the jaw stays in one piece.' + c(9, 10),
        '{中|なか}に{液体|えきたい}がたまる「のう{胞|ほう}」で、{内側|うちがわ}の{膜|まく}が{再発|さいはつ}しやすいものです。{骨|ほね}に{小|ちい}さな{窓|まど}をあけて{取|と}り{出|だ}し、{空洞|くうどう}の{壁|かべ}を{薄|うす}く{削|けず}ります。あごの{骨|ほね}はつながったままです。' + c(9, 10)],
      why: [
        ['Shaving the wall (peripheral ostectomy) takes off 1–2 mm of bone around the hollow.' + c(9) + ' In the model: 1.5 mm.',
          '{空洞|くうどう}のまわりの{骨|ほね}を1〜2mm{削|けず}ります（{辺縁|へんえん}{骨|こつ}{切除|せつじょ}）。' + c(9) + '{模型|もけい}では1.5mmです。'],
        ['How often it came back, from a review of many studies: 26% after removal alone, 18% with shaving, 0% with shaving plus Carnoy’s liquid, and 0% after cutting out a block of jaw.' + c(8),
          'システマティックレビューでの{再発|さいはつ}{率|りつ}：{摘出|てきしゅつ}だけで26%、{骨|ほね}を{削|けず}ると18%、{削|けず}ってカルノア{液|えき}を{使|つか}うと0%、{切除|せつじょ}で0%。' + c(8)],
        ['Cutting out a block of jaw is kept for cysts that come back or rare cancer change, because it causes more harm.' + c(9, 10),
          'あごの{骨|ほね}ごと{切|き}り{取|と}る{方法|ほうほう}は{体|からだ}への{負担|ふたん}が{大|おお}きいので、{再発|さいはつ}したときやまれながん{化|か}のときに{限|かぎ}ります。' + c(9, 10)],
        ['Teeth are often pushed aside but most stay alive. The dentist keeps 47, which borders the hollow, and checks it.' + c(9),
          '{歯|は}は{押|お}されて{動|うご}くことが{多|おお}いですが、たいていは{生|い}きたままです。{空洞|くうどう}に{接|せっ}する47は{残|のこ}して{経過|けいか}を{見|み}ます。' + c(9)],
      ],
      stats: [['Bone removed', '2.65 cm³ (window and shaved wall)', '{取|と}る{骨|ほね}', '2.65 cm³（{窓|まど}と{削|けず}った{壁|かべ}）'], ['Teeth', 'None', '{歯|は}', 'なし'], ['Jaw', 'Stays in one piece', 'あご', 'つながったまま']],
      reconNote: ['No repair is needed: the hollow heals by itself, with X-ray checks for years.' + c(9),
        '{再建|さいけん}は{必要|ひつよう}ありません。{空洞|くうどう}は{自然|しぜん}に{治|なお}るのを{待|ま}ち、{何年|なんねん}もレントゲンで{確認|かくにん}します。' + c(9)],
      choice: ['Our choices for the model: cyst 22 × 7 × 18 mm, sized to fit the jaw at this level.', '{当方|とうほう}の{設定|せってい}：のう{胞|ほう}は22×7×18mm。この{位置|いち}のあごの{幅|はば}に{合|あ}わせました。'] },
    pa: { jaw: 'maxilla', recon: false,
      title: ['Pleomorphic adenoma, right hard palate', '{多形|たけい}{腺腫|せんしゅ}（{右|みぎ}の{硬口蓋|こうこうがい}）'],
      sum: ['The most common salivary gland growth on the palate that is not cancer. The surgeon takes it out with the lining over it and the thin layer on the bone (periosteum) under it; teeth and bone most often stay.' + c(11, 12, 13),
        '{口蓋|こうがい}（{上|うわ}あご）にできる{唾液腺|だえきせん}{腫瘍|しゅよう}で、もっとも{多|おお}い{良性|りょうせい}のものです。{上|うえ}の{粘膜|ねんまく}と、{下|した}の{骨|ほね}をおおう{薄|うす}い{膜|まく}（{骨膜|こつまく}）と{一緒|いっしょ}に{取|と}ります。{歯|は}と{骨|ほね}はふつう{残|のこ}ります。' + c(11, 12, 13)],
      why: [
        ['The thin layer on the bone comes out with the tumour. There is no proof that always taking bone, or cutting right through the palate, helps.' + c(11),
          '{骨膜|こつまく}は{腫瘍|しゅよう}と{一緒|いっしょ}に{取|と}ります。{骨|ほね}をいつも{削|けず}ったり、{口蓋|こうがい}を{貫|つらぬ}いて{切|き}ったりすることに{効果|こうか}があるという{根拠|こんきょ}はありません。' + c(11)],
        ['Bone is only taken where the tumour has worn it away. Breaking the tumour during surgery raises the chance it comes back.' + c(12),
          '{骨|ほね}は、{腫瘍|しゅよう}で{骨|ほね}がすり{減|へ}っているところだけ{取|と}ります。{手術|しゅじゅつ}{中|ちゅう}に{腫瘍|しゅよう}が{破|やぶ}れると{再発|さいはつ}しやすくなります。' + c(12)],
        ['No teeth are removed.', '{歯|は}は{抜|ぬ}きません。'],
      ],
      stats: [['Removed', 'Tumour, lining and the thin layer on the bone', '{取|と}るもの', '{腫瘍|しゅよう}、{粘膜|ねんまく}、{骨膜|こつまく}'], ['Teeth', 'None', '{歯|は}', 'なし'], ['Bone', 'Kept', '{骨|ほね}', '{残|のこ}す']],
      reconNote: ['The bare palate heals over in a few weeks under a plate that guards it, or is covered with a flap of nearby tissue, such as a FAMM flap.' + c(13),
        '{骨|ほね}が{出|で}た{口蓋|こうがい}は、{保護|ほご}{床|しょう}の{下|した}で{数週間|すうしゅうかん}かけて{治|なお}るか、FAMM{皮弁|ひべん}など{近|ちか}くの{組織|そしき}でおおいます。' + c(13)],
      choice: ['Our choices for the model: tumour 19 × 21 × 14 mm, sized from the cited case report; a 5 mm cuff of normal lining around it.',
        '{当方|とうほう}の{設定|せってい}：{腫瘍|しゅよう}は19×21×14mm（{引用|いんよう}した{症例|しょうれい}{報告|ほうこく}にもとづく）。まわりに5mmの{正常|せいじょう}な{粘膜|ねんまく}を{付|つ}けています。'] },
    mec: { jaw: 'maxilla', recon: true,
      title: ['Mucoepidermoid carcinoma, right palate', '{粘表皮|ねんひょうひ}がん（{右|みぎ}の{口蓋|こうがい}）'],
      sum: ['The most common salivary gland cancer of the palate. When it reaches the bone, the surgeon takes out the low part of the upper jaw with the teeth in it (low maxillectomy). This opens the mouth into the sinus and nose.' + c(14, 18),
        '{口蓋|こうがい}にできる{唾液腺|だえきせん}がんで、もっとも{多|おお}いものです。{骨|ほね}まで{広|ひろ}がっているときは、{上|うわ}あごの{下|した}の{部分|ぶぶん}を{歯|は}ごと{取|と}ります（{上顎|じょうがく}{部分|ぶぶん}{切除|せつじょ}）。そのため、{口|くち}と{上顎洞|じょうがくどう}・{鼻|はな}がつながります。' + c(14, 18)],
      why: [
        ['Removal with wide margins; neck treatment and radiotherapy for high-grade cancers.' + c(14, 18) + ' In the model: 10.3 mm front, 10.0 mm on the middle side and 10.0 mm upwards.',
          '{広|ひろ}い{範囲|はんい}をつけて{取|と}ります。{悪性度|あくせいど}が{高|たか}いときは{首|くび}の{治療|ちりょう}と{放射線|ほうしゃせん}{治療|ちりょう}も{行|おこな}います。' + c(14, 18) + '{模型|もけい}では{前|まえ}10.3mm、{内側|うちがわ}10.0mm、{上|うえ}10.0mmです。'],
        ['Teeth 15–17 come out in the block; the front cut goes through the socket of 14, taken out during surgery, so 13 is not cut.',
          '15〜17は{骨|ほね}と{一緒|いっしょ}に{取|と}ります。{前|まえ}の{切|き}り{口|くち}は{手術|しゅじゅつ}で{抜|ぬ}く14の{穴|あな}を{通|とお}るので、13は{切|き}りません。'],
        ['The gap is a Brown class 2b defect: the low part of the upper jaw, up to half of the palate on one side.' + c(15, 16),
          'この{欠損|けっそん}はBrown{分類|ぶんるい}の2bです（{上|うわ}あごの{下|した}の{部分|ぶぶん}で、{片側|かたがわ}の{口蓋|こうがい}の{半分|はんぶん}まで）。' + c(15, 16)],
      ],
      stats: [['Bone removed', '11.4 cm³', '{取|と}る{骨|ほね}', '11.4 cm³'], ['Teeth', '15–17 with the bone; 14 at the cut', '{歯|は}', '15〜17は{骨|ほね}と{一緒|いっしょ}に、14は{切|き}り{口|くち}で{抜|ぬ}く'], ['Midline', 'Cut 2.5 mm past it', '{正中|せいちゅう}', '2.5mm{越|こ}えて{切|き}る']],
      reconNote: ['Shown: an obturator. This is a plate with teeth that you can take out, with a bulb that plugs the hole. Low gaps often do well with one. In one study, people rated their daily life about the same as with a flap.' + c(15, 17) + ' The other choice is a flap of nearby tissue or tissue moved from elsewhere.' + c(18),
        '{模型|もけい}では{顎|がく}{義歯|ぎし}（オブチュレーター）を{示|しめ}しています。{歯|は}の{付|つ}いた{取|と}り{外|はず}せる{入|い}れ{歯|ば}で、{出|で}っぱった{部分|ぶぶん}が{穴|あな}をふさぎます。{低|ひく}い{位置|いち}の{欠損|けっそん}ではうまくいくことが{多|おお}く、ある{研究|けんきゅう}では{皮弁|ひべん}で{閉|と}じた{場合|ばあい}と{生活|せいかつ}の{質|しつ}は{同|おな}じくらいでした。' + c(15, 17) + '{近|ちか}くや{体|からだ}の{別|べつ}の{場所|ばしょ}の{組織|そしき}で{閉|と}じる{方法|ほうほう}もあります。' + c(18)],
      choice: ['Our choices for the model: tumour 17 × 20 × 13 mm. We used a 10 mm margin, the usual standard for mouth cancer, because salivary cancer guidance gives no number.',
        '{当方|とうほう}の{設定|せってい}：がんは17×20×13mm。{唾液腺|だえきせん}がんの{指針|ししん}には{数字|すうじ}がないため、{口|くち}のがんで{一般的|いっぱんてき}な10mmを{使|つか}いました。'] },
    acc: { jaw: 'maxilla', recon: true,
      title: ['Adenoid cystic carcinoma, back of the right palate', '{腺様|せんよう}のう{胞|ほう}がん（{右|みぎ}の{口蓋|こうがい}の{奥|おく}）'],
      sum: ['A slow cancer that creeps along nerves. On the palate it follows the greater palatine nerve up towards the base of the skull, so the surgery goes further back and higher than for other palate cancers.' + c(19, 20),
        'ゆっくり{進|すす}み、{神経|しんけい}に{沿|そ}って{広|ひろ}がるがんです。{口蓋|こうがい}では{大口蓋|だいこうがい}{神経|しんけい}に{沿|そ}って{頭|あたま}の{奥|おく}の{方|ほう}へ{進|すす}むため、ほかの{口蓋|こうがい}がんより{後|うし}ろ・{上|うえ}まで{取|と}ります。' + c(19, 20)],
      why: [
        ['On a detailed 3D X-ray scan, a widened nerve canal in the palate (greater palatine canal) points to this tumour.' + c(19), 'CTで{大口蓋|だいこうがい}{管|かん}が{広|ひろ}がっていると、このがんが{疑|うたが}われます。' + c(19)],
        ['Spread along nerves is treated with surgery plus radiotherapy that covers the nerve path.' + c(20, 14),
          '{神経|しんけい}に{沿|そ}った{広|ひろ}がりには、{手術|しゅじゅつ}と、{神経|しんけい}の{通|とお}り{道|みち}までふくめた{放射線|ほうしゃせん}{治療|ちりょう}を{行|おこな}います。' + c(20, 14)],
        ['In the model: margins 11.0 mm front, 10.0 mm on the middle side and 20.0 mm upwards, and the pterygoid plates behind the palate are removed too. The yellow line marks the nerve canal (about 29 mm).',
          '{模型|もけい}では{前|まえ}11.0mm、{内側|うちがわ}10.0mm、{上|うえ}20.0mmで、{口蓋|こうがい}の{後|うし}ろの{翼状|よくじょう}{突起|とっき}も{取|と}ります。{黄色|きいろ}の{線|せん}は{神経|しんけい}の{通|とお}り{道|みち}（{約|やく}29mm）です。'],
        ['Teeth 16–17 come out in the block; 15 is taken out at the cut so 14 is kept.',
          '16〜17は{骨|ほね}と{一緒|いっしょ}に{取|と}ります。15は{切|き}り{口|くち}で{抜|ぬ}くので、14は{残|のこ}ります。'],
      ],
      stats: [['Bone removed', '15.4 cm³, with the pterygoid plates', '{取|と}る{骨|ほね}', '15.4 cm³（{翼状|よくじょう}{突起|とっき}を{含|ふく}む）'], ['Teeth', '16–17 with the bone; 15 at the cut', '{歯|は}', '16〜17は{骨|ほね}と{一緒|いっしょ}に、15は{切|き}り{口|くち}で{抜|ぬ}く'], ['Midline', 'Cut 5.5 mm past it', '{正中|せいちゅう}', '5.5mm{越|こ}えて{切|き}る']],
      reconNote: ['Shown: a free flap of soft tissue moved from elsewhere in the body and sewn into the opening. An obturator is the other option; the choice depends on the size of the gap, radiotherapy and what the patient prefers.' + c(15, 16, 17, 21),
        '{模型|もけい}では、{体|からだ}の{別|べつ}の{場所|ばしょ}から{移|うつ}した{柔|やわ}らかい{組織|そしき}（{遊離|ゆうり}{皮弁|ひべん}）で{穴|あな}を{閉|と}じています。{顎|がく}{義歯|ぎし}を{使|つか}う{方法|ほうほう}もあり、{欠損|けっそん}の{大|おお}きさ、{放射線|ほうしゃせん}{治療|ちりょう}、{患者|かんじゃ}さんの{希望|きぼう}で{選|えら}びます。' + c(15, 16, 17, 21)],
      choice: ['Our choices for the model: tumour 17 × 19 × 12 mm; the nerve path is drawn from typical anatomy, not traced from a scan.',
        '{当方|とうほう}の{設定|せってい}：がんは17×19×12mm。{神経|しんけい}の{通|とお}り{道|みち}は{一般的|いっぱんてき}な{解剖|かいぼう}から{描|えが}いたもので、{画像|がぞう}からたどったものではありません。'] },
  };
  const L = (pair) => (JA ? I.ruby(pair[1]) : pair[0]);
  const LEGEND = [
    [/^bone$/, 'Bone', '{骨|ほね}'], [/^teeth$/, 'Teeth', '{歯|は}'], [/^lesion/, 'Disease', '{病変|びょうへん}'], [/^margin/, 'Safety margin', '{安全|あんぜん}{域|いき}'],
    [/^extracted/, 'Tooth taken out at the cut', '{切|き}り{口|くち}で{抜|ぬ}く{歯|は}'], [/^nerve/, 'Nerve canal', '{神経|しんけい}の{通|とお}り{道|みち}'],
    [/^excised/, 'Lining and periosteum removed', '{取|と}る{粘膜|ねんまく}と{骨膜|こつまく}'], [/^removed/, 'Bone removed', '{取|と}る{骨|ほね}'],
    [/^obturator$/, 'Obturator', '{顎|がく}{義歯|ぎし}'], [/^obturator_teeth/, 'Obturator teeth', '{顎|がく}{義歯|ぎし}の{歯|は}'], [/^free_flap/, 'Free flap', '{遊離|ゆうり}{皮弁|ひべん}'],
    [/^fibula/, 'Fibula (leg bone)', 'ひ{骨|こつ}（{足|あし}の{骨|ほね}）'], [/^plate/, 'Titanium plate and screws', 'チタンのプレートとネジ'],
  ];

  const box = document.getElementById('viewer'), status = document.getElementById('status');
  const say = (key, en) => { status.style.display = ''; status.innerHTML = T(key, en); };
  if (!window.THREE || !(() => { try { const cv = document.createElement('canvas'); return !!(cv.getContext('webgl2') || cv.getContext('webgl')); } catch (e) { return false; } })()) {
    say('noWebgl', 'This browser cannot show 3D (WebGL is off). Turn on hardware acceleration in your browser settings, or open the page in another browser.');
    return;
  }
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.outputEncoding = THREE.sRGBEncoding;
  box.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 4 / 3, 0.005, 5);
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.minDistance = 0.06; controls.maxDistance = 0.7;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8478, 0.75));
  const k1 = new THREE.DirectionalLight(0xffffff, 0.8); k1.position.set(-0.3, 0.5, 0.4); scene.add(k1);
  const k2 = new THREE.DirectionalLight(0xffffff, 0.4); k2.position.set(0.4, -0.4, 0.3); scene.add(k2);
  const resize = () => { const w = box.clientWidth, h = box.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  new ResizeObserver(resize).observe(box); resize();

  // glTF axes: +Z is the front of the face, -X is the patient's right, +Y is up.
  const VIEWS = { front: [0, 0.01, 0.27], side: [-0.27, 0.02, 0.02], under: [-0.02, -0.27, 0.06], above: [-0.02, 0.27, 0.05] };
  const START = { mandible: [-0.19, 0.08, 0.17], maxilla: [-0.16, -0.14, 0.15] };
  const setView = (v) => { camera.position.set(...v); controls.target.set(0, 0, 0); controls.update(); };

  const cache = {}; let cur = null, root = null, offset = 0, target = 0, token = 0;
  const state = { stage: 'pre', margin: false, xray: false };
  const loader = new THREE.GLTFLoader();
  const MOVE = /^(specimen|extracted|lesion|nerve|removed|excised|margin)/;
  const baseName = (n) => n.replace(/[._]\d+$/, '');

  function load(key) {
    if (cache[key]) return Promise.resolve(cache[key]);
    return new Promise((res, rej) => loader.load('models/' + key + '.glb', res, undefined, rej)).then((gltf) => {
      const g = gltf.scene, parts = [];
      g.traverse((o) => {
        if (!o.isMesh) return;
        const n = baseName(o.name || '');
        o.geometry.computeVertexNormals();
        const m = o.material.clone(); m.flatShading = false; m.side = THREE.DoubleSide;
        if (/^margin/.test(n)) { m.transparent = true; m.opacity = 0.18; m.depthWrite = false; }
        if (/^excised/.test(n)) { m.transparent = true; m.opacity = 0.5; m.depthWrite = false; }
        o.material = m; o.userData = { n, op: m.opacity, tr: m.transparent, y0: o.position.y }; parts.push(o);
      });
      const centre = new THREE.Box3().setFromObject(g).getCenter(new THREE.Vector3());
      g.position.sub(centre);
      return (cache[key] = { g, parts });
    });
  }

  function apply() {
    if (!cur) return;
    const C = CASES[cur.key], s = state.stage;
    cur.parts.forEach((o) => {
      const n = o.userData.n; let vis = true;
      if (/^margin/.test(n)) vis = state.margin && (s === 'pre' || s === 'op');
      else if (/^excised/.test(n)) vis = s === 'op';
      else if (/^(obturator|free_flap|fibula|plate|screws)/.test(n)) vis = s === 'recon';
      else if (MOVE.test(n) && (s === 'post' || s === 'recon')) vis = false;
      o.visible = vis;
      const xr = state.xray && /^(bone|sphenoid|specimen_bone|specimen_sph)/.test(n);
      o.material.transparent = xr || o.userData.tr; o.material.opacity = xr ? 0.28 : o.userData.op;
      o.material.depthWrite = !o.material.transparent; o.material.needsUpdate = true;
    });
    target = s === 'op' ? (C.jaw === 'mandible' ? 0.03 : -0.03) : 0;
    document.querySelectorAll('[data-stage]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.stage === s)));
    document.getElementById('btn-margin').setAttribute('aria-pressed', String(state.margin));
    document.getElementById('btn-xray').setAttribute('aria-pressed', String(state.xray));
    const vis = cur.parts.filter((o) => o.visible);
    document.getElementById('legend').innerHTML = LEGEND.map(([re, en, ja]) => {
      const o = vis.find((p) => re.test(p.userData.n));
      if (!o) return '';
      const col = '#' + o.material.color.clone().convertLinearToSRGB().getHexString();
      return '<li><span class="dot" style="background:' + col + '"></span>' + (JA ? I.ruby(ja) : en) + '</li>';
    }).join('');
  }

  function info(key) {
    const C = CASES[key];
    const lab = JA ? ['この{模型|もけい}の{切|き}り{方|かた}の{理由|りゆう}', '{欠損|けっそん}を{閉|と}じる'] : ['Why the model is cut this way', 'Closing the gap'];
    document.getElementById('info').innerHTML =
      '<h2>' + L(C.title) + '</h2><p>' + L(C.sum) + '</p>' +
      '<h3>' + (JA ? I.ruby(lab[0]) : lab[0]) + '</h3><ul>' + C.why.map((w) => '<li>' + L(w) + '</li>').join('') + '</ul>' +
      '<dl>' + C.stats.map((s) => '<dt>' + (JA ? I.ruby(s[2]) : s[0]) + '</dt><dd>' + (JA ? I.ruby(s[3]) : s[1]) + '</dd>').join('') + '</dl>' +
      '<h3>' + (JA ? I.ruby(lab[1]) : lab[1]) + '</h3><p>' + L(C.reconNote) + '</p><p class="choice">' + L(C.choice) + '</p>';
    const rb = document.getElementById('btn-recon');
    rb.disabled = !C.recon;
    rb.title = C.recon ? '' : (JA ? I.plain('この{症例|しょうれい}ではまだ{作|つく}っていません') : 'Not built yet for this case');
  }

  function pick(key) {
    const my = ++token;
    document.querySelectorAll('[data-case]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.case === key)));
    info(key);
    if (root) scene.remove(root);
    cur = null; say('loading', 'Loading model…');
    load(key).then((m) => {
      if (my !== token) return;
      cur = { key, parts: m.parts }; root = m.g; scene.add(root); status.style.display = 'none';
      if (state.stage === 'recon' && !CASES[key].recon) state.stage = 'post';
      apply(); setView(START[CASES[key].jaw]);
    }).catch(() => { if (my === token) say('loadFailed', 'The 3D model could not load. Reload the page to try again.'); });
  }

  document.querySelectorAll('[data-case]').forEach((b) => b.addEventListener('click', () => pick(b.dataset.case)));
  document.querySelectorAll('[data-stage]').forEach((b) => b.addEventListener('click', () => { state.stage = b.dataset.stage; apply(); }));
  document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => setView(VIEWS[b.dataset.view])));
  document.getElementById('btn-margin').addEventListener('click', () => { state.margin = !state.margin; apply(); });
  document.getElementById('btn-xray').addEventListener('click', () => { state.xray = !state.xray; apply(); });

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  (function loop() {
    requestAnimationFrame(loop);
    offset += (target - offset) * (reduce ? 1 : 0.12);
    if (cur) cur.parts.forEach((o) => { if (MOVE.test(o.userData.n)) o.position.y = o.userData.y0 + offset; });
    controls.update(); renderer.render(scene, camera);
  })();
  const first = new URLSearchParams(location.search).get('case');
  pick(CASES[first] ? first : 'scc');
})();
