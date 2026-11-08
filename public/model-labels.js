// Labels on the 3D models: a dot on each part with a short leader line and the part's name, as on the
// CBCT-2026/ABG pages. Works on every <model-viewer> on the site (static pages and app pages) and on the
// three.js head and neck viewers (#viewer, which set box.vtLabels; see public/head-neck/case-viewer.js).
// - Where each label sits and where it can be seen from: public/model-labels/<GLB path>.json, made by
//   tools/labels/anchors.mjs from the GLB files.
// - What each label says: TERMS below (formal term + plain words, in English, Japanese with furigana and
//   Vietnamese draft), with the sources for each term listed under the viewer.
// - Which parts get a label on which model: SETS below (by GLB path; the first match wins).
// Labels are on by default; the "Labels" button on the viewer turns them off (remembered in localStorage).
// A label hides when its spot faces away from the camera, another part is in the way (unless the page has hidden
// that part or made it see-through), or the page hides the labelled part itself.
(function () {
  const doc = document;
  if (window.vtLabelsLoaded) return;
  window.vtLabelsLoaded = true;

  const lang = () => { const l = (doc.documentElement.lang || 'en').slice(0, 2); return l === 'ja' ? 1 : l === 'vi' ? 2 : 0; };
  const ruby = (s) => s.replace(/\{([^{}|]+)\|([^{}]+)\}/g, '<ruby>$1<rp aria-hidden="true">(</rp><rt aria-hidden="true">$2</rt><rp aria-hidden="true">)</rp></ruby>');
  const plain = (s) => s.replace(/\{([^{}|]+)\|[^{}]+\}/g, '$1');
  const say = (t) => ruby(t[lang()] || t[0]);

  // ---- Sources for the label terms (shown under the viewer).
  const SOURCES = {
    ta2: ['Federative International Programme for Anatomical Terminology (FIPAT). Terminologia Anatomica. 2nd ed. FIPAT.library.dal.ca; 2019.', 'https://fipat.library.dal.ca/ta2/'],
    taj: ['Japanese Association of Anatomists, editor. Kaibōgaku yōgo [Anatomical terminology]. 13th revised ed. Tokyo: Igaku-Shoin; 2007. (Japanese anatomical terms.)', ''],
    dentj: ['Ministry of Education and Japanese Association for Dental Science, editors. Gakujutsu yōgoshū: shigaku-hen [Japanese scientific terms: dentistry]. Enlarged ed. 1992. (Japanese dental terms.)', ''],
    mesh: ['National Library of Medicine. Medical Subject Headings (MeSH).', 'https://meshb.nlm.nih.gov/'],
    aae: ['American Association of Endodontists. Glossary of Endodontic Terms. 10th ed. 2020.', 'https://www.aae.org/specialty/clinical-resources/glossary-endodontic-terms/'],
    gpt: ['The Glossary of Prosthodontic Terms 2023: Tenth Edition. J Prosthet Dent. 2023;130(4 Suppl 1):e7-e126.', 'https://doi.org/10.1016/j.prosdent.2023.03.002'],
    pap: ['Papapanou PN, Sanz M, Buduneli N, et al. Periodontitis: consensus report of workgroup 2 of the 2017 World Workshop on the Classification of Periodontal and Peri-Implant Diseases and Conditions. J Periodontol. 2018;89 Suppl 1:S173-S182.', 'https://doi.org/10.1002/JPER.17-0721'],
    whoOdonto: ['Vered M, Wright JM. Update from the 5th edition of the World Health Organization classification of head and neck tumors: odontogenic and maxillofacial bone tumours. Head Neck Pathol. 2022;16(1):63-75.', 'https://doi.org/10.1007/s12105-021-01404-7'],
    whoDc: ['Soluk-Tekkesin M, Wright JM. The World Health Organization classification of odontogenic lesions: a summary of the changes of the 2022 (5th) edition. Turk Patoloji Derg. 2022;38(2):168-184.', 'https://doi.org/10.5146/tjpath.2022.01573'],
    whoOral: ['Muller S, Tilakaratne WM. Update from the 5th edition of the World Health Organization classification of head and neck tumors: tumours of the oral cavity and mobile tongue. Head Neck Pathol. 2022;16(1):54-62.', 'https://doi.org/10.1007/s12105-021-01402-9'],
    whoSal: ['Skálová A, Hyrcza MD, Leivo I. Update from the 5th edition of the World Health Organization classification of head and neck tumors: salivary glands. Head Neck Pathol. 2022;16(1):40-53.', 'https://doi.org/10.1007/s12105-022-01420-1'],
    champy: ['Champy M, Loddé JP, Schmitt R, Jaeger JH, Muster D. Mandibular osteosynthesis by miniature screwed plates via a buccal approach. J Maxillofac Surg. 1978;6(1):14-21.', 'https://pubmed.ncbi.nlm.nih.gov/274501/'],
    dctmd: ['Schiffman E, Ohrbach R, Truelove E, et al. Diagnostic Criteria for Temporomandibular Disorders (DC/TMD) for Clinical and Research Applications. J Oral Facial Pain Headache. 2014;28(1):6-27.', 'https://doi.org/10.11607/jop.1151'],
    acpa: ['American Cleft Palate-Craniofacial Association. Parameters for evaluation and treatment of patients with cleft lip/palate or other craniofacial differences. Cleft Palate Craniofac J. 2018;55(1):137-156.', 'https://doi.org/10.1177/1055665617739564'],
    innes: ['Innes NPT, Ricketts D, Chong LY, Keightley AJ, Lamont T, Santamaria RM. Preformed crowns for decayed primary molar teeth. Cochrane Database Syst Rev. 2015;(12):CD005512.', 'https://doi.org/10.1002/14651858.CD005512.pub3'],
    alq: ['AlQahtani SJ, Hector MP, Liversidge HM. Brief communication: the London atlas of human tooth development and eruption. Am J Phys Anthropol. 2010;142(3):481-490.', 'https://doi.org/10.1002/ajpa.21258'],
    cob: ['Cobourne MT, Seehra J, Papageorgiou SN. The palatal displaced maxillary canine: early diagnosis and interceptive correction - a guideline for the general dental practitioner. Br Dent J. 2025;239(7):463-470.', 'https://doi.org/10.1038/s41415-025-8892-z'],
    juod: ['Juodzbalys G, Daugela P. Mandibular third molar impaction: review of literature and a proposal of a classification. J Oral Maxillofac Res. 2013;4(2):e1.', 'https://doi.org/10.5037/jomr.2013.4201'],
    juodNerve: ['Juodzbalys G, Wang HL, Sabalys G. Anatomy of mandibular vital structures. Part I: mandibular canal and inferior alveolar neurovascular bundle in relation with dental implantology. J Oral Maxillofac Res. 2010;1(1):e2.', 'https://doi.org/10.5037/jomr.2010.1102'],
  };
  const ANAT = ['ta2', 'taj'];

  // ---- Label words: [term EN, JA, VI], [plain words EN, JA, VI], sources.
  const T = (t, n, s) => ({ t, n, s });
  const TERMS = {
    mandible: T(['Mandible', '{下顎骨|かがくこつ}', 'Xương hàm dưới'], ['Lower jaw bone', '{下|した}あごの{骨|ほね}', 'Xương của hàm dưới'], ANAT),
    maxilla: T(['Maxilla', '{上顎骨|じょうがくこつ}', 'Xương hàm trên'], ['Upper jaw bone', '{上|うわ}あごの{骨|ほね}', 'Xương của hàm trên'], ANAT),
    jaws: T(['Maxilla and mandible', '{上顎骨|じょうがくこつ}と{下顎骨|かがくこつ}', 'Xương hàm trên và xương hàm dưới'], ['Upper and lower jaw bones', '{上|うわ}あごと{下|した}あごの{骨|ほね}', 'Hai xương hàm'], ANAT),
    cranium: T(['Cranium', '{頭蓋|とうがい}', 'Hộp sọ'], ['Skull', '{頭|あたま}の{骨|ほね}', 'Xương sọ'], ANAT),
    alveolar: T(['Alveolar part of mandible', '{下顎骨|かがくこつ}{歯槽部|しそうぶ}', 'Phần xương ổ răng của xương hàm dưới'], ['Jaw bone that holds the teeth', '{歯|は}を{支|ささ}えるあごの{骨|ほね}', 'Xương hàm giữ răng'], ANAT),
    ridge: T(['Residual ridge (mandible)', '{顎堤|がくてい}（{下顎骨|かがくこつ}）', 'Sống hàm còn lại (xương hàm dưới)'], ['Jaw bone left after the teeth are lost', '{歯|は}を{失|うしな}ったあとに{残|のこ}るあごの{骨|ほね}', 'Xương hàm còn lại sau khi mất răng'], ['gpt', 'dentj']),
    gingiva: T(['Gingiva', '{歯肉|しにく}', 'Lợi (nướu)'], ['Gum', '{歯|は}ぐき', 'Lợi'], ANAT),
    ridgeMucosa: T(['Mucosa of the residual ridge', '{顎堤|がくてい}{粘膜|ねんまく}', 'Niêm mạc sống hàm'], ['Gum over the toothless jaw', '{歯|は}のないあごをおおう{歯|は}ぐき', 'Lợi phủ trên hàm mất răng'], ['gpt', 'dentj']),
    teeth: T(['Teeth', '{歯|は}', 'Răng'], ['Upper and lower teeth', '{上|うえ}と{下|した}の{歯|は}', 'Răng trên và răng dưới'], ANAT),
    teethLower: T(['Mandibular teeth', '{下顎|かがく}の{歯|は}', 'Răng hàm dưới'], ['Lower teeth', '{下|した}の{歯|は}', 'Răng dưới'], ANAT),
    teethUpper: T(['Maxillary teeth', '{上顎|じょうがく}の{歯|は}', 'Răng hàm trên'], ['Upper teeth', '{上|うえ}の{歯|は}', 'Răng trên'], ANAT),
    permDev: T(['Permanent teeth', '{永久歯|えいきゅうし}', 'Răng vĩnh viễn'], ['Adult teeth; some are still growing inside the jaw', '{大人|おとな}の{歯|は}。まだあごの{中|なか}で{育|そだ}っているものもある', 'Răng người lớn; một số còn đang lớn trong xương hàm'], ['ta2', 'taj', 'alq']),
    deciduous: T(['Deciduous teeth', '{乳歯|にゅうし}', 'Răng sữa'], ['Baby teeth', '{子|こ}どもの{歯|は}', 'Răng của trẻ nhỏ'], ['ta2', 'taj', 'alq']),
    canineMax: T(['Maxillary permanent canine', '{上顎|じょうがく}{犬歯|けんし}', 'Răng nanh vĩnh viễn hàm trên'], ['Adult eye tooth, still growing in the bone', 'まだ{骨|ほね}の{中|なか}で{育|そだ}っている{大人|おとな}の{犬歯|けんし}', 'Răng nanh người lớn, còn đang lớn trong xương'], ['ta2', 'taj', 'cob']),
    caninePdc: T(['Palatally displaced maxillary canine', '{口蓋側|こうがいそく}{転位|てんい}した{上顎|じょうがく}{犬歯|けんし}', 'Răng nanh hàm trên lệch về phía khẩu cái'], ['Adult eye tooth growing on the roof-of-mouth side', '{口|くち}の{天井|てんじょう}{側|がわ}にずれて{育|そだ}つ{大人|おとな}の{犬歯|けんし}', 'Răng nanh người lớn mọc lệch về phía vòm miệng'], ['cob', 'ta2']),
    babyCanine: T(['Maxillary deciduous canine', '{上顎|じょうがく}{乳犬歯|にゅうけんし}', 'Răng nanh sữa hàm trên'], ['Baby eye tooth', '{乳歯|にゅうし}の{犬歯|けんし}', 'Răng nanh sữa'], ['ta2', 'taj', 'cob']),
    ian: T(['Inferior alveolar nerve (in the mandibular canal)', '{下歯槽神経|かしそうしんけい}（{下顎管|かがくかん}の{中|なか}）', 'Dây thần kinh huyệt răng dưới (trong ống hàm dưới)'], ['Nerve for feeling in the lower teeth, lip and chin', '{下|した}の{歯|は}・くちびる・あごの{感覚|かんかく}の{神経|しんけい}', 'Dây thần kinh cảm giác của răng dưới, môi và cằm'], ['ta2', 'taj', 'juodNerve']),
    m3Impacted: T(['Mandibular third molar (impacted, mesioangular)', '{下顎|かがく}{第三大臼歯|だいさんだいきゅうし}（{埋伏|まいふく}・{近心傾斜|きんしんけいしゃ}）', 'Răng cối lớn thứ ba hàm dưới (mọc ngầm, nghiêng gần)'], ['Wisdom tooth stuck against the tooth in front', '{前|まえ}の{歯|は}にひっかかった{親知|おやし}らず', 'Răng khôn bị kẹt vào răng phía trước'], ['ta2', 'taj', 'juod']),
    m3Erupted: T(['Mandibular third molar (erupted)', '{下顎|かがく}{第三大臼歯|だいさんだいきゅうし}（{萌出|ほうしゅつ}）', 'Răng cối lớn thứ ba hàm dưới (đã mọc)'], ['Wisdom tooth that has come through normally', 'ふつうに{生|は}えた{親知|おやし}らず', 'Răng khôn đã mọc bình thường'], ['ta2', 'taj', 'juod']),
    boneLoss: T(['Alveolar bone loss', '{歯槽骨|しそうこつ}の{吸収|きゅうしゅう}', 'Tiêu xương ổ răng'], ['Bone lost around the teeth', '{歯|は}のまわりで{失|うしな}われた{骨|ほね}', 'Phần xương bị mất quanh răng'], ['pap']),
    pulp: T(['Dental pulp', '{歯髄|しずい}', 'Tủy răng'], ['Living nerve and blood vessels inside the tooth', '{歯|は}の{中|なか}の{神経|しんけい}と{血管|けっかん}', 'Dây thần kinh và mạch máu sống trong răng'], ['ta2', 'taj', 'aae']),
    necrosis: T(['Pulp necrosis', '{歯髄壊死|しずいえし}', 'Hoại tử tủy'], ['Dead nerve inside the tooth', '{死|し}んだ{歯|は}の{神経|しんけい}', 'Tủy răng đã chết'], ['aae', 'dentj']),
    abscess: T(['Chronic apical abscess', '{慢性根尖膿瘍|まんせいこんせんのうよう}', 'Áp xe quanh chóp mạn tính'], ['Infection at the root tips', '{根|ね}の{先|さき}の{感染|かんせん}', 'Nhiễm trùng ở chóp chân răng'], ['aae', 'dentj']),
    sinusTract: T(['Sinus tract', '{瘻孔|ろうこう}', 'Đường rò'], ['Channel that lets pus drain to the gum', 'うみが{歯|は}ぐきに{出|で}る{通|とお}り{道|みち}', 'Đường cho mủ thoát ra lợi'], ['aae', 'dentj']),
    caries: T(['Dental caries', 'う{蝕|しょく}', 'Sâu răng'], ['Tooth decay', 'むし{歯|ば}', 'Răng bị sâu'], ['aae', 'mesh', 'dentj']),
    follicle: T(['Dental follicle', '{歯小嚢|ししょうのう}', 'Túi răng'], ['Thin normal sac around the crown of a tooth still in the bone', '{骨|ほね}の{中|なか}の{歯|は}の{頭|あたま}を{包|つつ}むうすい{袋|ふくろ}', 'Túi mỏng bình thường quanh thân răng còn trong xương'], ['whoDc', 'dentj']),
    dentigerous: T(['Dentigerous cyst', '{含歯性|がんしせい}のう{胞|ほう}', 'Nang thân răng'], ['Fluid-filled sac around the crown of an unerupted tooth', '{生|は}えていない{歯|は}の{頭|あたま}を{包|つつ}む、{液|えき}のたまった{袋|ふくろ}', 'Túi chứa dịch quanh thân một răng chưa mọc'], ['whoDc']),
    m1: T(['Mandibular first molar', '{下顎|かがく}{第一大臼歯|だいいちだいきゅうし}', 'Răng cối lớn thứ nhất hàm dưới'], ['Lower back tooth', '{下|した}の{奥歯|おくば}', 'Răng hàm dưới phía sau'], ANAT),
    enamel: T(['Enamel', 'エナメル{質|しつ}', 'Men răng'], ['Hard outer layer of the crown', '{歯|は}の{頭|あたま}の{外側|そとがわ}のかたい{層|そう}', 'Lớp cứng bên ngoài thân răng'], ANAT),
    dentine: T(['Dentine', '{象牙質|ぞうげしつ}', 'Ngà răng'], ['Layer under the enamel', 'エナメル{質|しつ}の{下|した}の{層|そう}', 'Lớp nằm dưới men răng'], ANAT),
    cementum: T(['Cementum', 'セメント{質|しつ}', 'Xê măng răng'], ['Thin layer on the root', '{根|ね}の{表面|ひょうめん}のうすい{層|そう}', 'Lớp mỏng phủ chân răng'], ANAT),
    crack: T(['Crack (cracked tooth)', '{亀裂|きれつ}（{亀裂|きれつ}{歯|し}）', 'Vết nứt (răng nứt)'], ['Line where the tooth is splitting', '{歯|は}が{割|わ}れかけている{線|せん}', 'Đường răng đang bị nứt'], ['aae', 'dentj']),
    composite: T(['Direct composite restoration', 'コンポジットレジン{修復|しゅうふく}', 'Phục hồi trực tiếp bằng composite'], ['Tooth-coloured filling', '{歯|は}の{色|いろ}の{詰|つ}め{物|もの}', 'Miếng trám màu răng'], ['gpt', 'dentj']),
    cuspCrown: T(['Cuspal-coverage crown', '{咬頭|こうとう}{被覆|ひふく}{冠|かん}', 'Mão bọc múi răng'], ['Cap that covers the biting surface', 'かむ{面|めん}をおおうかぶせ{物|もの}', 'Mão phủ kín mặt nhai'], ['gpt', 'dentj']),
    biteForce: T(['Occlusal force', '{咬合力|こうごうりょく}', 'Lực cắn'], ['Arrows: where the bite pushes', '{矢印|やじるし}：かむ{力|ちから}がかかる{所|ところ}', 'Mũi tên: chỗ lực cắn đè xuống'], ['gpt', 'dentj']),
    hold: T(['Cuspal coverage', '{咬頭|こうとう}{被覆|ひふく}', 'Bọc múi răng'], ['Arrows: the crown holds the cusps together', '{矢印|やじるし}：クラウンが{咬頭|こうとう}をまとめて{支|ささ}える', 'Mũi tên: mão giữ các múi răng lại với nhau'], ['gpt', 'dentj']),
    e85: T(['Mandibular second deciduous molar', '{下顎|かがく}{第二乳臼歯|だいににゅうきゅうし}', 'Răng cối sữa thứ hai hàm dưới'], ['Baby back tooth', '{乳歯|にゅうし}の{奥歯|おくば}', 'Răng hàm sữa'], ['ta2', 'taj', 'innes']),
    pm2: T(['Mandibular second premolar (developing)', '{下顎|かがく}{第二小臼歯|だいにしょうきゅうし}（{発育中|はついくちゅう}）', 'Răng cối nhỏ thứ hai hàm dưới (đang phát triển)'], ['Adult tooth growing under the baby tooth', '{乳歯|にゅうし}の{下|した}で{育|そだ}つ{大人|おとな}の{歯|は}', 'Răng người lớn đang lớn dưới răng sữa'], ['ta2', 'taj', 'alq']),
    restoration: T(['Restoration (filling)', '{修復物|しゅうふくぶつ}（{詰|つ}め{物|もの}）', 'Phục hồi (miếng trám)'], ['Filling where the decay was removed', 'むし{歯|ば}を{取|と}った{所|ところ}の{詰|つ}め{物|もの}', 'Miếng trám ở chỗ đã lấy sâu răng'], ['gpt', 'dentj']),
    luting: T(['Luting cement', '{合着用|ごうちゃくよう}セメント', 'Xi măng gắn'], ['Glue that holds the crown on', 'クラウンを{付|つ}けるのり', 'Chất gắn giữ mão'], ['gpt', 'dentj']),
    pmc: T(['Preformed metal crown (stainless steel crown)', '{乳歯|にゅうし}{既製|きせい}{金属冠|きんぞくかん}', 'Mão kim loại làm sẵn (mão thép không gỉ)'], ['Ready-made steel cap for a baby tooth', '{乳歯|にゅうし}にかぶせる{既製|きせい}の{金属|きんぞく}のかぶせ{物|もの}', 'Mão thép làm sẵn cho răng sữa'], ['innes', 'dentj']),
    osteotomy: T(['Osteotomy', '{骨切|こつき}り', 'Cắt xương'], ['Where the bone is cut', '{骨|ほね}を{切|き}った{所|ところ}', 'Chỗ xương bị cắt'], ['mesh', 'dentj']),
    orthoCut: T(['Osteotomy lines (Le Fort I and sagittal split)', '{骨切|こつき}り{線|せん}（ルフォーI{型|がた}・{下顎枝矢状分割|かがくししじょうぶんかつ}）', 'Đường cắt xương (Le Fort I và chẻ dọc cành lên)'], ['Where the surgeon cuts the bone', '{手術|しゅじゅつ}で{骨|ほね}を{切|き}る{所|ところ}', 'Chỗ bác sĩ cắt xương'], ['mesh']),
    orthoCutG: T(['Osteotomy lines (Le Fort I, sagittal split, genioplasty)', '{骨切|こつき}り{線|せん}（ルフォーI{型|がた}・{下顎枝矢状分割|かがくししじょうぶんかつ}・オトガイ{形成術|けいせいじゅつ}）', 'Đường cắt xương (Le Fort I, chẻ dọc cành lên, tạo hình cằm)'], ['Where the surgeon cuts the bone', '{手術|しゅじゅつ}で{骨|ほね}を{切|き}る{所|ところ}', 'Chỗ bác sĩ cắt xương'], ['mesh']),
    moved: T(['Repositioned bone segments', '{移動|いどう}した{骨片|こっぺん}', 'Các đoạn xương đã dời chỗ'], ['Jaw pieces moved to the new position', '{新|あたら}しい{位置|いち}に{動|うご}かしたあごの{骨|ほね}', 'Phần xương hàm đã được dời sang vị trí mới'], ['mesh']),
    before: T(['Pre-operative position', '{術前|じゅつぜん}の{位置|いち}', 'Vị trí trước phẫu thuật'], ['See-through: where the jaw was before surgery', '{透明|とうめい}な{部分|ぶぶん}：{手術|しゅじゅつ}{前|まえ}のあごの{位置|いち}', 'Phần trong suốt: vị trí hàm trước phẫu thuật'], ['mesh']),
    miniplate: T(['Titanium miniplates and screws', 'チタン{製|せい}ミニプレートとスクリュー', 'Nẹp nhỏ và vít bằng titan'], ['Small plates that hold the bone pieces', '{骨|ほね}をつなぎ{止|と}める{小|ちい}さな{板|いた}', 'Nẹp nhỏ giữ các mảnh xương'], ['champy']),
    plateOne: T(['Titanium miniplate', 'チタン{製|せい}ミニプレート', 'Nẹp nhỏ bằng titan'], ['Small plate that holds the two pieces together', '2つの{骨|ほね}をつなぐ{小|ちい}さな{板|いた}', 'Nẹp nhỏ giữ hai mảnh xương với nhau'], ['champy']),
    screw: T(['Monocortical screws', 'モノコーティカルスクリュー', 'Vít một vỏ xương'], ['Screws that go into the outer layer of bone only', '{骨|ほね}の{外側|そとがわ}の{層|そう}だけに{入|はい}るネジ', 'Vít chỉ bắt vào lớp xương ngoài'], ['champy']),
    drill: T(['Drill', 'ドリル', 'Mũi khoan'], ['Makes the hole for each screw', 'ネジの{穴|あな}をあける', 'Khoan lỗ cho từng vít'], ['champy']),
    denture: T(['Complete denture', '{全部床義歯|ぜんぶしょうぎし}', 'Hàm giả toàn phần'], ['Removable plate that replaces the gum and teeth', '{歯|は}ぐきと{歯|は}の{代|か}わりになる{取|と}り{外|はず}せる{入|い}れ{歯|ば}', 'Hàm tháo lắp thay cho lợi và răng'], ['gpt', 'dentj']),
    overdenture: T(['Implant-retained overdenture', 'インプラントオーバーデンチャー', 'Hàm phủ giữ bằng implant'], ['Denture that clips onto implants', 'インプラントに{留|と}める{入|い}れ{歯|ば}', 'Hàm giả gài vào implant'], ['gpt']),
    dentureTeeth: T(['Artificial teeth', '{人工歯|じんこうし}', 'Răng giả'], ['Teeth of the denture', '{入|い}れ{歯|ば}の{歯|は}', 'Răng của hàm giả'], ['gpt', 'dentj']),
    implant: T(['Dental implants', '{歯科|しか}インプラント', 'Trụ implant nha khoa'], ['Titanium posts in the jaw that hold the denture', '{入|い}れ{歯|ば}を{支|ささ}える、あごの{中|なか}のチタンの{柱|はしら}', 'Trụ titan trong xương hàm giữ hàm giả'], ['gpt']),
    tmjDisc: T(['Articular disc of the temporomandibular joint', '{顎関節|がくかんせつ}の{関節円板|かんせつえんばん}', 'Đĩa khớp thái dương hàm'], ['Cushion inside the jaw joint', 'あごの{関節|かんせつ}の{中|なか}のクッション', 'Lớp đệm trong khớp hàm'], ['ta2', 'taj', 'dctmd']),
    masseter: T(['Masseter', '{咬筋|こうきん}', 'Cơ cắn'], ['Chewing muscle in the cheek', 'ほおのかむ{筋肉|きんにく}', 'Cơ nhai ở má'], ['ta2', 'taj', 'dctmd']),
    temporalis: T(['Temporalis', '{側頭筋|そくとうきん}', 'Cơ thái dương'], ['Chewing muscle at the temple', 'こめかみのかむ{筋肉|きんにく}', 'Cơ nhai ở thái dương'], ['ta2', 'taj', 'dctmd']),
    lpt: T(['Lateral pterygoid', '{外側翼突筋|がいそくよくとつきん}', 'Cơ chân bướm ngoài'], ['Pulls the jaw forward', 'あごを{前|まえ}に{引|ひ}く{筋肉|きんにく}', 'Kéo hàm ra trước'], ['ta2', 'taj', 'dctmd']),
    mpt: T(['Medial pterygoid', '{内側翼突筋|ないそくよくとつきん}', 'Cơ chân bướm trong'], ['Inner chewing muscle', '{内側|うちがわ}のかむ{筋肉|きんにく}', 'Cơ nhai phía trong'], ['ta2', 'taj', 'dctmd']),
    softPalate: T(['Soft palate', '{軟口蓋|なんこうがい}', 'Khẩu cái mềm'], ['Soft back part of the roof of the mouth', '{上|うわ}あごの{奥|おく}のやわらかい{所|ところ}', 'Phần mềm phía sau vòm miệng'], ['ta2', 'taj', 'acpa']),
    pharynxWall: T(['Pharyngeal wall', '{咽頭壁|いんとうへき}', 'Thành họng'], ['Walls of the throat', 'のどの{壁|かべ}', 'Các thành của họng'], ['ta2', 'taj']),
    levator: T(['Levator veli palatini', '{口蓋帆挙筋|こうがいはんきょきん}', 'Cơ nâng màn hầu'], ['Muscle that lifts the soft palate', '{軟口蓋|なんこうがい}を{持|も}ち{上|あ}げる{筋肉|きんにく}', 'Cơ nâng khẩu cái mềm'], ['ta2', 'taj', 'acpa']),
    tongue: T(['Tongue', '{舌|した}', 'Lưỡi'], ['Tongue', '{舌|した}', 'Lưỡi'], ANAT),
    airflow: T(['Oral airflow', '{口腔|こうくう}への{気流|きりゅう}', 'Luồng khí qua miệng'], ['Arrows: air going out through the mouth', '{矢印|やじるし}：{口|くち}から{出|で}る{空気|くうき}', 'Mũi tên: không khí đi ra qua miệng'], ['acpa']),
    nasalEmission: T(['Nasal air emission', '{呼気|こき}{鼻漏出|びろうしゅつ}', 'Thoát khí qua mũi'], ['Arrows: air escaping through the nose', '{矢印|やじるし}：{鼻|はな}からもれる{空気|くうき}', 'Mũi tên: không khí thoát ra mũi'], ['acpa']),
    pharyngealFlap: T(['Posterior pharyngeal flap', '{咽頭弁|いんとうべん}', 'Vạt thành sau họng'], ['Tissue from the back of the throat joined to the soft palate', 'のどの{奥|おく}の{組織|そしき}を{軟口蓋|なんこうがい}につなげたもの', 'Mô từ thành sau họng nối vào khẩu cái mềm'], ['acpa', 'mesh']),
    sphincterFlap: T(['Sphincter pharyngoplasty flaps', '{括約筋|かつやくきん}{咽頭形成術|いんとうけいせいじゅつ}の{弁|べん}', 'Vạt tạo hình họng kiểu cơ thắt'], ['Side walls of the throat moved to narrow the opening', 'のどの{横|よこ}の{壁|かべ}を{動|うご}かして{入|い}り{口|ぐち}を{狭|せま}くしたもの', 'Thành bên họng được dời để thu hẹp lối thông'], ['acpa']),
    scc: T(['Squamous cell carcinoma (mandibular gingiva)', '{扁平上皮|へんぺいじょうひ}がん（{下顎|かがく}{歯肉|しにく}）', 'Ung thư biểu mô tế bào vảy (lợi hàm dưới)'], ['Cancer of the gum, grown into the bone', '{骨|ほね}まで{広|ひろ}がった{歯|は}ぐきのがん', 'Ung thư lợi đã lan vào xương'], ['whoOral']),
    amelo: T(['Ameloblastoma', 'エナメル{上皮腫|じょうひしゅ}', 'U nguyên bào men'], ['Slow-growing tumour in the jaw bone', 'あごの{骨|ほね}にできる、ゆっくり{育|そだ}つ{腫瘍|しゅよう}', 'Khối u phát triển chậm trong xương hàm'], ['whoOdonto']),
    okc: T(['Odontogenic keratocyst', '{歯原性角化|しげんせいかくか}のう{胞|ほう}', 'Nang sừng do răng'], ['Jaw cyst that often comes back', '{再発|さいはつ}しやすいあごののう{胞|ほう}', 'Nang xương hàm hay tái phát'], ['whoOdonto']),
    mec: T(['Mucoepidermoid carcinoma (palate)', '{粘表皮|ねんひょうひ}がん（{口蓋|こうがい}）', 'Ung thư biểu mô nhầy bì (vòm miệng)'], ['Cancer of a small saliva gland in the palate', '{口蓋|こうがい}の{小|ちい}さな{唾液腺|だえきせん}のがん', 'Ung thư của tuyến nước bọt nhỏ ở vòm miệng'], ['whoSal']),
    pa: T(['Pleomorphic adenoma (palate)', '{多形腺腫|たけいせんしゅ}（{口蓋|こうがい}）', 'U tuyến đa hình (vòm miệng)'], ['Benign tumour of a small saliva gland', '{唾液腺|だえきせん}の{良性|りょうせい}の{腫瘍|しゅよう}', 'U lành của tuyến nước bọt nhỏ'], ['whoSal']),
    acc: T(['Adenoid cystic carcinoma (palate)', '{腺様|せんよう}のう{胞|ほう}がん（{口蓋|こうがい}）', 'Ung thư biểu mô dạng tuyến nang (vòm miệng)'], ['Slow cancer that spreads along nerves', '{神経|しんけい}に{沿|そ}って{広|ひろ}がる、ゆっくり{進|すす}むがん', 'Ung thư tiến triển chậm, lan theo dây thần kinh'], ['whoSal']),
    specimen: T(['Resection specimen', '{切除|せつじょ}{標本|ひょうほん}', 'Bệnh phẩm cắt bỏ'], ['Bone removed with the tumour', '{腫瘍|しゅよう}と{一緒|いっしょ}に{取|と}る{骨|ほね}', 'Xương được cắt bỏ cùng khối u'], ['mesh']),
    margin: T(['Surgical margin', '{切除|せつじょ}{安全域|あんぜんいき}', 'Rìa phẫu thuật'], ['Cuff of normal tissue removed around the tumour', '{腫瘍|しゅよう}のまわりにつけて{取|と}る{正常|せいじょう}な{組織|そしき}', 'Viền mô lành cắt bỏ quanh khối u'], ['mesh']),
    fibula: T(['Fibula free flap', '{遊離|ゆうり}{腓骨|ひこつ}{皮弁|ひべん}', 'Vạt xương mác tự do'], ['Leg bone moved to rebuild the jaw', 'あごを{作|つく}り{直|なお}すために{移|うつ}したすねの{骨|ほね}', 'Xương cẳng chân chuyển lên để tái tạo hàm'], ['ta2', 'mesh']),
    freeFlap: T(['Free flap', '{遊離|ゆうり}{皮弁|ひべん}', 'Vạt tự do'], ['Soft tissue moved from elsewhere to close the gap', 'ほかの{場所|ばしょ}から{移|うつ}して{穴|あな}をふさぐやわらかい{組織|そしき}', 'Mô mềm chuyển từ nơi khác đến để bịt lỗ hổng'], ['mesh']),
    removedBone: T(['Bone removed', '{除去|じょきょ}する{骨|ほね}', 'Phần xương được lấy bỏ'], ['Bone taken away to reach the cyst', 'のう{胞|ほう}に{届|とど}くために{取|と}る{骨|ほね}', 'Xương được lấy đi để tiếp cận nang'], ['mesh']),
    rootTips: T(['Root apices (resected)', '{切除|せつじょ}する{根尖|こんせん}', 'Chóp chân răng (được cắt bỏ)'], ['Root tips cut off', '{切|き}り{取|と}る{根|ね}の{先|さき}', 'Phần chóp chân răng bị cắt'], ['ta2', 'taj']),
    prf: T(['Platelet-rich fibrin (PRF)', '{多血小板|たけっしょうばん}フィブリン（PRF）', 'Fibrin giàu tiểu cầu (PRF)'], ['Gel made from the patient’s own blood', '{自分|じぶん}の{血液|けつえき}から{作|つく}るゲル', 'Gel làm từ máu của chính bệnh nhân'], ['mesh']),
    palMucosa: T(['Palatal mucosa', '{口蓋|こうがい}{粘膜|ねんまく}', 'Niêm mạc vòm miệng'], ['Lining of the roof of the mouth', '{口|くち}の{天井|てんじょう}の{粘膜|ねんまく}', 'Lớp niêm mạc vòm miệng'], ANAT),
    mucoperiosteum: T(['Excised mucoperiosteum', '{切除|せつじょ}する{粘膜骨膜|ねんまくこつまく}', 'Niêm mạc màng xương được cắt bỏ'], ['Lining and the thin layer on the bone, removed with the tumour', '{腫瘍|しゅよう}と{一緒|いっしょ}に{取|と}る{粘膜|ねんまく}と{骨膜|こつまく}', 'Niêm mạc và màng xương cắt bỏ cùng khối u'], ['ta2', 'mesh']),
    gpn: T(['Greater palatine nerve (path)', '{大口蓋神経|だいこうがいしんけい}（{走行|そうこう}）', 'Dây thần kinh khẩu cái lớn (đường đi)'], ['Nerve path the cancer can follow', 'がんが{沿|そ}って{広|ひろ}がりうる{神経|しんけい}の{通|とお}り{道|みち}', 'Đường dây thần kinh mà ung thư có thể lan theo'], ['ta2', 'taj', 'whoSal']),
  };

  // ---- Which parts get a label, by GLB path (node or material name -> term). Order = priority when labels overlap.
  const SETS = [
    [/^\/models\/impacted-molar\.glb$/, { 'wisdom tooth': 'm3Impacted', nerve: 'ian', 'mandible left': 'mandible', teeth: 'teethLower' }],
    [/^\/models\/wisdom-tooth-normal\.glb$/, { 'wisdom tooth (erupted)': 'm3Erupted', nerve: 'ian', 'mandible left': 'mandible', teeth: 'teethLower' }],
    [/^\/models\/averaged-jaw\//, { mandible: 'mandible', teeth_lower: 'teethLower' }],
    [/^\/development\//, { 'upper-baby-teeth': 'deciduous', 'lower-baby-teeth': 'deciduous', 'upper-adult-teeth': 'permDev', 'lower-adult-teeth': 'permDev', 'upper-bone': 'maxilla', 'lower-bone': 'mandible' }],
    [/^\/periodontitis\//, { lost: 'boneLoss', bone: 'alveolar', teeth: 'teethLower' }],
    [/^\/endodontic\/models\/abscess/, { lesion: 'abscess', tract: 'sinusTract', pulp: 'necrosis', decay: 'caries', gum: 'gingiva', bone: 'alveolar', teeth: 'teethLower' }],
    [/^\/endodontic\//, { pulp: 'pulp', gum: 'gingiva', bone: 'alveolar', teeth: 'teethLower' }],
    [/^\/dentigerous-cyst\//, { cyst: 'dentigerous', follicle: 'follicle', bone: 'mandible', teeth: 'teethLower' }],
    [/^\/cracked-tooth\//, { crack: 'crack', crown: 'cuspCrown', filling: 'composite', enamel: 'enamel', dentine: 'dentine', pulp: 'pulp', cementum: 'cementum', hold: 'hold', force: 'biteForce', tooth: 'm1' }],
    [/^\/stainless-steel-crown\//, { steel: 'pmc', cement: 'luting', decay: 'caries', filling: 'restoration', teeth: 'e85', premolar: 'pm2', pulp: 'pulp', gum: 'gingiva', bone: 'alveolar' }],
    [/^\/ectopic-canine\/models\/normal/, { canine: 'canineMax', 'baby-canine': 'babyCanine', 'baby-teeth': 'deciduous', teeth: 'teethUpper', bone: 'maxilla' }],
    [/^\/ectopic-canine\//, { canine: 'caninePdc', 'baby-canine': 'babyCanine', 'baby-teeth': 'deciduous', teeth: 'teethUpper', bone: 'maxilla' }],
    [/^\/fixation\//, { plate: 'plateOne', screw: 'screw', drill: 'drill', cut: 'osteotomy', bone: 'mandible', teeth: 'teethLower' }],
    [/^\/orthognathic\/models\/.*genio/, { cut: 'orthoCutG', moved: 'moved', plate: 'miniplate', before: 'before', bone: 'jaws', teeth: 'teeth' }],
    [/^\/orthognathic\//, { cut: 'orthoCut', moved: 'moved', plate: 'miniplate', before: 'before', bone: 'jaws', teeth: 'teeth' }],
    [/^\/prosthodontic\/models\/dentate/, { teeth: 'teethLower', gum: 'gingiva', bone: 'mandible' }],
    [/^\/prosthodontic\/models\/overdenture/, { implant: 'implant', denture: 'overdenture', denture_teeth: 'dentureTeeth', gum: 'ridgeMucosa', bone: 'ridge' }],
    [/^\/prosthodontic\//, { denture: 'denture', denture_teeth: 'dentureTeeth', gum: 'ridgeMucosa', bone: 'ridge' }],
    [/^\/tmd\//, { disc_right: 'tmjDisc', disc_left: 'tmjDisc', masseter_right: 'masseter', masseter_left: 'masseter', temporalis_right: 'temporalis', temporalis_left: 'temporalis', lateral_pterygoid_right: 'lpt', lateral_pterygoid_left: 'lpt', medial_pterygoid_right: 'mpt', medial_pterygoid_left: 'mpt', mandible: 'mandible', skull: 'cranium' }],
    [/^\/vpi\/models\/flap/, { flap: 'pharyngealFlap', muscle: 'levator', soft: 'softPalate', mucosa: 'pharynxWall', air: 'airflow', tongue: 'tongue' }],
    [/^\/vpi\/models\/sphincter/, { flap: 'sphincterFlap', muscle: 'levator', soft: 'softPalate', mucosa: 'pharynxWall', air: 'airflow', tongue: 'tongue' }],
    [/^\/vpi\//, { leak: 'nasalEmission', muscle: 'levator', soft: 'softPalate', mucosa: 'pharynxWall', air: 'airflow', tongue: 'tongue' }],
    [/^\/head-neck\/models\/scc/, { lesion: 'scc', margin: 'margin', specimen_bone: 'specimen', fibula: 'fibula', plate: 'miniplate', bone: 'mandible', teeth: 'teethLower' }],
    [/^\/head-neck\/models\/ameloblastoma/, { lesion: 'amelo', margin: 'margin', specimen_bone: 'specimen', plate: 'miniplate', bone: 'mandible', teeth: 'teethLower' }],
    [/^\/head-neck\/models\/okc/, { lesion: 'okc', removed_bone: 'removedBone', root_tips: 'rootTips', prf: 'prf', bone: 'mandible', teeth: 'teethLower' }],
    [/^\/head-neck\/models\/mec/, { lesion: 'mec', margin: 'margin', excised_mucoperiosteum: 'mucoperiosteum', mucosa: 'palMucosa', bone: 'maxilla', teeth: 'teethUpper' }],
    [/^\/head-neck\/models\/pa\b/, { lesion: 'pa', excised_mucoperiosteum: 'mucoperiosteum', bone: 'maxilla', teeth: 'teethUpper' }],
    [/^\/head-neck\/models\/acc/, { lesion: 'acc', nerve_path: 'gpn', margin: 'margin', specimen_bone: 'specimen', free_flap: 'freeFlap', bone: 'maxilla', teeth: 'teethUpper' }],
  ];
  // Viewers that already have their own labels (homepage and /models/alveolar-bone-graft, /oroantral/).
  const OWN = /^\/(models\/abg|oroantral)\//;
  const setFor = (path) => (SETS.find(([re]) => re.test(path)) || [])[1];

  const UI = {
    button: ['Labels', 'ラベル', 'Nhãn'],
    on: ['Hide labels on the model', '{模型|もけい}のラベルをかくす', 'Ẩn nhãn trên mô hình'],
    off: ['Show labels on the model', '{模型|もけい}のラベルを{出|だ}す', 'Hiện nhãn trên mô hình'],
    heading: ['Where the label names come from', 'ラベルの{名前|なまえ}の{出典|しゅってん}', 'Nguồn của tên trong nhãn'],
    intro: ['The labels on the model use formal anatomical and clinical terms, with plain words underneath. Each label points to one spot on the part; the part itself may be larger. The spots are placed by a script from the shape of each model (tools/labels/anchors.mjs), not by a clinician, and have not yet been clinically reviewed. Japanese and Vietnamese terms need review by a fluent clinician.',
      '{模型|もけい}のラベルには{正式|せいしき}な{解剖学|かいぼうがく}・{臨床|りんしょう}の{用語|ようご}を{使|つか}い、その{下|した}にやさしい{言葉|ことば}を{書|か}いています。ラベルは{部分|ぶぶん}の1か{所|しょ}を{指|さ}しています。{部分|ぶぶん}そのものはもっと{大|おお}きいことがあります。{位置|いち}は{模型|もけい}の{形|かたち}からプログラムで{決|き}めたもので（tools/labels/anchors.mjs）、{臨床|りんしょう}レビューはまだです。{日本語|にほんご}とベトナム{語|ご}の{用語|ようご}は、その{言語|げんご}が{堪能|たんのう}な{臨床家|りんしょうか}の{確認|かくにん}が{必要|ひつよう}です。',
      'Nhãn trên mô hình dùng thuật ngữ giải phẫu và lâm sàng chính thức, kèm lời giải thích đơn giản bên dưới. Mỗi nhãn chỉ vào một điểm trên bộ phận; bản thân bộ phận có thể lớn hơn. Vị trí được đặt tự động theo hình dạng mô hình (tools/labels/anchors.mjs), chưa được bác sĩ kiểm tra. Thuật ngữ tiếng Nhật và tiếng Việt cần người thông thạo kiểm tra.'],
    terms: ['Terms and their sources', '{用語|ようご}とその{出典|しゅってん}', 'Thuật ngữ và nguồn'],
    sources: ['Sources', '{出典|しゅってん}', 'Nguồn'],
  };

  let off = false;
  try { off = localStorage.getItem('vivatheca-labels') === 'off'; } catch { /* storage blocked: labels stay on */ }
  const toggles = new Set();
  const used = new Set(); // term keys shown on this page (for the sources list)

  const style = doc.createElement('style');
  style.textContent = [
    // Label colours stay light in both themes: they sit on the 3D view, like the homepage model's labels.
    '.vt-hotspot{--len:30px;position:absolute;width:9px;height:9px;padding:0;margin:0;border:2px solid #fff;border-radius:50%;background:#1b1d21;box-shadow:0 0 0 1px rgba(0,0,0,.35);pointer-events:none;transition:opacity .2s;box-sizing:border-box}',
    'model-viewer .vt-hotspot{position:relative}',
    '.vt-hotspot[data-show="false"]{opacity:0}',
    '.vt-hotspot::after{content:"";position:absolute;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.35)}',
    '.vt-hotspot-label{position:absolute;width:max-content;max-width:240px;padding:.2rem .5rem;border-radius:6px;background:rgba(255,255,255,.95);color:#1b1d21;font:700 12px/1.25 system-ui,sans-serif;text-align:center;white-space:normal;box-shadow:0 1px 3px rgba(0,0,0,.25)}',
    '.vt-hotspot-label small{display:block;font-size:11px;font-weight:500;white-space:normal}',
    '.vt-hotspot-label rt{font-size:.6em;font-weight:500}',
    '.vt-hotspot[data-side="left"]::after{right:100%;top:50%;height:1.5px;width:var(--len)}',
    '.vt-hotspot[data-side="left"] .vt-hotspot-label{right:calc(100% + var(--len));top:50%;transform:translateY(calc(-50% + var(--dy,0px)))}',
    '.vt-hotspot[data-side="right"]::after{left:100%;top:50%;height:1.5px;width:var(--len)}',
    '.vt-hotspot[data-side="right"] .vt-hotspot-label{left:calc(100% + var(--len));top:50%;transform:translateY(calc(-50% + var(--dy,0px)))}',
    '.vt-labels-off .vt-hotspot{display:none}',
    '.vt-label-layer{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:3}',
    '.vt-label-layer .vt-hotspot{transform:translate(-50%,-50%)}',
    // The head and neck viewers have their drag hint at the bottom left, so the button goes to the top left there.
    '#viewer > .vt-label-toggle{top:10px;bottom:auto}',
    '.vt-label-toggle{position:absolute;left:10px;bottom:10px;z-index:5;min-height:40px;padding:0 14px;display:inline-flex;align-items:center;gap:6px;border-radius:10px;border:1px solid var(--line,#cfe3e5);background:var(--bg,var(--surface,#fff));color:var(--heading,#0b2340);font:600 14px/1 system-ui,sans-serif;cursor:pointer}',
    '.vt-label-toggle[aria-pressed="false"]{opacity:.8}',
    '.vt-label-toggle[aria-pressed="false"] .vt-tag{text-decoration:line-through}',
    '.vt-label-toggle svg{fill:currentColor}',
    '.vt-label-toggle:focus-visible{outline:3px solid var(--accent,#0a7c86);outline-offset:2px}',
    '.vt-label-sources{margin:14px 0 0;padding:10px 14px;border:1px solid var(--line,#cfe1e7);border-radius:14px;font-size:14px}',
    '.vt-label-sources summary{cursor:pointer;font-weight:600;min-height:28px}',
    '.vt-label-sources p,.vt-label-sources li{text-align:justify;hyphens:auto}',
    '.vt-label-sources h3{font-size:15px;margin:10px 0 4px}',
    '.vt-label-sources ul,.vt-label-sources ol{margin:4px 0 0;padding-left:1.4em}',
    '.vt-label-sources a{color:var(--accent,inherit);overflow-wrap:anywhere}',
    '@media (max-width:560px){.vt-hotspot-label small{display:none}}',
  ].join('');
  doc.head.appendChild(style);

  const cache = {};
  const anchors = (path) => (cache[path] = cache[path] || fetch('/model-labels' + path.replace(/\.glb$/, '.json')).then((r) => (r.ok ? r.json() : null)).catch(() => null));
  // The same 48 view directions as tools/labels/anchors.mjs.
  const DIRS = Array.from({ length: 48 }, (_, i) => {
    const y = 1 - (2 * i + 1) / 48, r = Math.sqrt(1 - y * y), a = i * Math.PI * (3 - Math.sqrt(5));
    return [Math.cos(a) * r, y, Math.sin(a) * r];
  });
  // Can the spot be seen from direction d (unit vector from the spot towards the camera, model coordinates)?
  // clearMat(name) says whether a material is hidden or see-through right now.
  function seen(a, d, file, clearMat) {
    if (!a) return false;
    const v = a.vv || (a.vv = a.v.split(',').map(Number));
    let best = 0, bd = -2;
    DIRS.forEach((x, k) => { const t = x[0] * d[0] + x[1] * d[1] + x[2] * d[2]; if (t > bd) { bd = t; best = k; } });
    const m = v[best];
    if (m < 0) return false;
    if (m === 0) return true;
    return file.mats.every((name, i) => !(m & (1 << i)) || clearMat(name));
  }
  // The first of a part's spots (up to three) that can be seen from direction d, or -1.
  const pick = (part, d, file, clearMat) => part.at.findIndex((a) => seen(a, d, file, clearMat));

  const ICON = '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path d="M21.4 11.6l-9-9A2 2 0 0011 2H4a2 2 0 00-2 2v7c0 .55.22 1.05.59 1.42l9 9a2 2 0 002.82 0l7-7a2 2 0 000-2.82zM6.5 8A1.5 1.5 0 118 6.5 1.5 1.5 0 016.5 8z"/></svg>';
  function addToggle(host) {
    if (host.querySelector(':scope > .vt-label-toggle')) return;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    const b = doc.createElement('button');
    b.type = 'button'; b.className = 'vt-label-toggle';
    b.addEventListener('click', () => {
      off = !off;
      try { localStorage.setItem('vivatheca-labels', off ? 'off' : 'on'); } catch { /* not remembered */ }
      paintToggles();
    });
    host.appendChild(b); toggles.add([b, host]);
    paintToggles();
  }
  function paintToggles() {
    toggles.forEach(([b, host]) => {
      b.innerHTML = ICON + '<span class="vt-tag">' + say(UI.button) + '</span>';
      b.setAttribute('aria-pressed', String(!off));
      b.setAttribute('aria-label', plain(off ? UI.off[lang()] : UI.on[lang()]));
      b.title = plain(off ? UI.off[lang()] : UI.on[lang()]);
      host.classList.toggle('vt-labels-off', off);
    });
  }

  function labelHtml(key) {
    const term = TERMS[key];
    return '<span class="vt-hotspot-label"><span class="vt-term">' + say(term.t) + '</span><small>' + say(term.n) + '</small></span>';
  }

  // ---- Sources list under the first viewer: the terms shown on this page and where they come from.
  let sourcesBox = null;
  function placeSources(viewer) {
    // Show mode fills the screen and links to the full page, which has the list, so it gets none.
    if (sourcesBox || viewer.closest('.show-frame')) return;
    sourcesBox = doc.createElement('details');
    sourcesBox.className = 'vt-label-sources';
    // After the viewer's own controls (as /model-parts.js does), so the page's main choices stay first.
    // App pages: after the whole viewer block (the compare panel or the model stage), outside its dark frame.
    const block = viewer.closest('.compare, .model-experience');
    if (block) { block.insertAdjacentElement('afterend', sourcesBox); paintSources(); return; }
    let after = viewer.matches('model-viewer') && /^(DIV|SECTION)$/.test(viewer.parentElement.tagName) && viewer.parentElement.children.length <= 4 && !viewer.parentElement.matches('main, article, .wrap, .container') ? viewer.parentElement : viewer;
    let next = after.nextElementSibling;
    while (next && (next.matches('.controls, .stages, .choose, .ages, .phase, .stages-head, p.small, p.status, .legend, #legend, .hint, .vt-parts, .vt-share') || next.getAttribute('role') === 'group')) { after = next; next = next.nextElementSibling; }
    after.insertAdjacentElement('afterend', sourcesBox);
    paintSources();
  }
  function paintSources() {
    if (!sourcesBox) return;
    const wasOpen = sourcesBox.open;
    const keys = [...used];
    const ids = [];
    keys.forEach((k) => TERMS[k].s.forEach((s) => { if (!ids.includes(s)) ids.push(s); }));
    const num = (s) => ids.indexOf(s) + 1;
    sourcesBox.innerHTML = '<summary>' + say(UI.heading) + '</summary><p>' + say(UI.intro) + '</p>' +
      '<h3>' + say(UI.terms) + '</h3><ul>' + keys.map((k) => '<li><b>' + say(TERMS[k].t) + '</b> (' + say(TERMS[k].n) + '): ' +
        TERMS[k].s.map((s) => '<a href="#vt-label-src-' + num(s) + '">[' + num(s) + ']</a>').join(' ') + '</li>').join('') + '</ul>' +
      '<h3>' + say(UI.sources) + '</h3><ol>' + ids.map((s) => '<li id="vt-label-src-' + num(s) + '">' + SOURCES[s][0] +
        (SOURCES[s][1] ? ' <a href="' + SOURCES[s][1] + '">' + SOURCES[s][1].replace(/^https?:\/\//, '') + '</a>' : '') + '</li>').join('') + '</ol>';
    sourcesBox.open = wasOpen;
  }

  // Fit labels inside the viewer and spread overlapping ones: each label goes on the side of its dot with more room
  // (and wraps to fit); later (lower priority) labels move down, or hide if there is no room.
  function declutter(spots, frame) {
    const placed = [];
    spots.forEach((h) => {
      h.style.setProperty('--dy', '0px');
      if (h.dataset.show === 'false') return;
      const dot = h.getBoundingClientRect();
      const x = dot.left + dot.width / 2, y = dot.top + dot.height / 2;
      if (x < frame.left || x > frame.right || y < frame.top || y > frame.bottom) { h.dataset.show = 'false'; return; }
      const len = parseFloat(h.style.getPropertyValue('--len')) || 30;
      const roomL = x - frame.left - len - 10, roomR = frame.right - x - len - 10;
      h.dataset.side = roomL > roomR ? 'left' : 'right';
      const room = Math.min(240, Math.max(roomL, roomR));
      if (room < 80) { h.dataset.show = 'false'; return; }
      const label = h.querySelector('.vt-hotspot-label');
      label.style.maxWidth = room + 'px';
      let r = label.getBoundingClientRect();
      let dy = 0;
      for (let tries = 0; tries < 6; tries++) {
        const hit = placed.find((p) => r.left < p.right + 2 && r.right > p.left - 2 && r.top < p.bottom + 2 && r.bottom > p.top - 2);
        if (!hit) break;
        const move = hit.bottom + 4 - r.top;
        dy += move;
        r = { left: r.left, right: r.right, top: r.top + move, bottom: r.bottom + move };
      }
      const clash = placed.some((p) => r.left < p.right && r.right > p.left && r.top < p.bottom && r.bottom > p.top);
      if (clash || dy > 60 || r.bottom > frame.bottom - 4 || r.top < frame.top + 4) { h.dataset.show = 'false'; return; }
      h.style.setProperty('--dy', dy + 'px');
      placed.push(r);
    });
  }

  // ---- model-viewer
  const base = (n) => (n || '').replace(/[._]\d+$/, '');
  function pathOf(src) { try { return new URL(src, location.href).pathname; } catch { return ''; } }

  function setupModelViewer(mv) {
    if (mv.dataset.vtLabels) return;
    mv.dataset.vtLabels = '1';
    let spots = [], current = null;
    async function render() {
      spots.forEach((h) => h.remove()); spots = []; current = null;
      const path = pathOf(mv.src || mv.getAttribute('src') || '');
      if (!path || OWN.test(path)) return;
      const set = setFor(path); if (!set) return;
      const file = await anchors(path); if (!file) return;
      if (pathOf(mv.src || mv.getAttribute('src') || '') !== path) return; // the model changed while loading
      current = file;
      const at = file.parts;
      addToggle(mv);
      Object.entries(set).forEach(([part, key], i) => {
        const a = at[part]; if (!a || !TERMS[key]) return;
        const h = doc.createElement('div');
        h.className = 'vt-hotspot'; h.slot = 'hotspot-vt-' + i;
        h.dataset.position = a.at[0].p.map((v) => v + 'm').join(' ');
        h.dataset.normal = a.at[0].n.join(' ');
        h.dataset.spot = '0';
        h.dataset.mat = a.m; h.dataset.part = part; h.dataset.side = 'right'; h.dataset.show = 'true';
        h.dataset.key = key;
        h.style.setProperty('--len', (22 + (i % 3) * 12) + 'px');
        h.innerHTML = labelHtml(key);
        mv.appendChild(h); spots.push(h); used.add(key);
      });
      placeSources(mv); paintSources();
      tick();
    }
    function tick() {
      if (!spots.length || off) return;
      let orbit;
      try { orbit = mv.getCameraOrbit(); } catch { return; }
      // Auto-rotate turns the model (turntable), so the camera's angle to the model is theta minus that turn.
      const theta = orbit.theta - (mv.turntableRotation || 0);
      const view = [Math.sin(orbit.phi) * Math.sin(theta), Math.cos(orbit.phi), Math.sin(orbit.phi) * Math.cos(theta)];
      const mats = (mv.model && mv.model.materials) || [];
      const alpha = (name) => { const own = mats.filter((m) => base(m.name) === name); return own.length ? Math.max(...own.map((m) => m.pbrMetallicRoughness.baseColorFactor[3])) : 1; };
      const clearMat = (name) => alpha(name) < 0.6;
      spots.forEach((h) => {
        const a = current && current.parts[h.dataset.part];
        const k = a ? pick(a, view, current, clearMat) : -1;
        // Move the label to the spot that can be seen from here (model-viewer 1.9+: updateHotspot).
        if (k >= 0 && String(k) !== h.dataset.spot && mv.updateHotspot) {
          h.dataset.spot = String(k);
          mv.updateHotspot({ name: h.slot, position: a.at[k].p.map((v) => v + 'm').join(' '), normal: a.at[k].n.join(' ') });
        }
        h.dataset.show = String(k >= 0 && alpha(h.dataset.mat) > 0.02);
      });
      declutter(spots, mv.getBoundingClientRect());
    }
    mv.addEventListener('load', render);
    mv.addEventListener('camera-change', tick);
    // Auto-rotate and turntable resets do not fire camera-change, so check a few times a second.
    setInterval(tick, 250);
    if (mv.loaded) render();
  }

  // ---- three.js head and neck viewers: box.vtLabels = { THREE, camera, root(), parts(), path() } and a 'vt-labels' event.
  function setupThree(box) {
    if (box.dataset.vtLabels) return;
    box.dataset.vtLabels = '1';
    const layer = doc.createElement('div');
    layer.className = 'vt-label-layer';
    box.appendChild(layer);
    let spots = [], counter = 0, current = null;
    async function render() {
      const api = box.vtLabels; if (!api) return;
      const path = api.path(); const set = setFor(path);
      const file = set ? await anchors(path) : null;
      if (api !== box.vtLabels) return; // another case was picked while loading
      layer.innerHTML = ''; spots = []; current = file;
      if (!file) return;
      addToggle(box);
      const at = file.parts;
      Object.entries(set).forEach(([part, key], i) => {
        const a = at[part]; if (!a || !TERMS[key]) return;
        const h = doc.createElement('div');
        h.className = 'vt-hotspot'; h.dataset.side = 'right'; h.dataset.show = 'false'; h.dataset.key = key;
        h.style.setProperty('--len', (22 + (i % 3) * 12) + 'px');
        h.innerHTML = labelHtml(key);
        layer.appendChild(h); used.add(key);
        spots.push({ h, a, part });
      });
      placeSources(box); paintSources();
    }
    function frame() {
      requestAnimationFrame(frame);
      const api = box.vtLabels; if (!api || !spots.length || off) return;
      if (++counter % 2) return; // every other frame is enough
      const THREE = api.THREE, cam = api.camera, root = api.root(); if (!root) return;
      const w = box.clientWidth, hgt = box.clientHeight;
      const parts = api.parts();
      const clearMat = (name) => parts.filter((o) => base(o.material && o.material.name) === name).every((o) => !o.visible || (o.material.transparent && o.material.opacity < 0.6));
      spots.forEach(({ h, a, part }) => {
        const meshes = parts.filter((o) => o.userData.n === part || base(o.material && o.material.name) === part);
        const live = meshes.filter((o) => o.visible);
        // Parts that slide (removed bone, specimen) carry their offset in position.y - y0.
        const dy = live[0] && live[0].userData.y0 !== undefined ? live[0].position.y - live[0].userData.y0 : 0;
        const where = (spot) => root.localToWorld(new THREE.Vector3(spot.p[0], spot.p[1] + dy, spot.p[2]));
        // The model root is not rotated, so world directions are model directions.
        const dirTo = (p) => { const d = cam.position.clone().sub(p).normalize(); return [d.x, d.y, d.z]; };
        const k = a.at.findIndex((spot) => seen(spot, dirTo(where(spot)), current, clearMat));
        const p = where(a.at[Math.max(0, k)]);
        const s = p.clone().project(cam);
        const inView = s.z < 1 && Math.abs(s.x) < 1.05 && Math.abs(s.y) < 1.05;
        h.style.left = ((s.x + 1) / 2 * w) + 'px';
        h.style.top = ((1 - s.y) / 2 * hgt) + 'px';
        const skip = api.skip ? api.skip(part) : false;
        h.dataset.show = String(!skip && (!meshes.length || live.length > 0) && inView && k >= 0);
      });
      declutter(spots.map((x) => x.h), box.getBoundingClientRect());
    }
    box.addEventListener('vt-labels', render);
    if (box.vtLabels) render();
    requestAnimationFrame(frame);
  }

  function scan() {
    doc.querySelectorAll('model-viewer').forEach(setupModelViewer);
    const box = doc.getElementById('viewer');
    if (box && (box.vtLabels || box.dataset.model !== undefined || box.querySelector('canvas'))) setupThree(box);
  }
  scan();
  new MutationObserver(scan).observe(doc.body, { childList: true, subtree: true });

  // Language switch without a reload (static pages and the app): repaint the words.
  new MutationObserver(() => {
    doc.querySelectorAll('.vt-hotspot').forEach((h) => { if (TERMS[h.dataset.key]) h.innerHTML = labelHtml(h.dataset.key); });
    paintToggles(); paintSources();
  }).observe(doc.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
