// Labels on the 3D models: a dot on each part and a leader line out to the part's name, which sits in the empty
// space around the model (never on another label), as on the CBCT-2026/ABG pages. On narrow viewers (phones) a
// label shows the short term; tap it for the full term and plain words. Works on every <model-viewer> on the site
// (static pages and app pages) and on the three.js head and neck viewers (#viewer, which set box.vtLabels; see public/head-neck/case-viewer.js).
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
    bergland: ['Bergland O, Semb G, Abyholm FE. Elimination of the residual alveolar cleft by secondary bone grafting and subsequent orthodontic treatment. Cleft Palate J. 1986;23(3):175-205.', 'https://pubmed.ncbi.nlm.nih.gov/3524905/'],
    parvini: ['Parvini P, Obreja K, Begic A, et al. Decision-making in closure of oroantral communication and fistula. Int J Implant Dent. 2019;5(1):13.', 'https://doi.org/10.1186/s40729-019-0165-7'],
    egyedi: ['Egyedi P. Utilization of the buccal fat pad for closure of oro-antral and/or oro-nasal communications. J Maxillofac Surg. 1977;5(4):241-244.', 'https://doi.org/10.1016/s0301-0503(77)80117-3'],
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
    // Show mode (/show) only: the ABG and oroantral pages keep their own hand-placed labels (OWN below).
    cleftMaxilla: T(['Maxilla with alveolar cleft', '{顎裂|がくれつ}のある{上顎骨|じょうがくこつ}', 'Xương hàm trên có khe hở xương ổ răng'], ['Upper jaw bone with a gap from the cleft', '{裂|さ}け{目|め}によるすき{間|ま}がある{上|うわ}あごの{骨|ほね}', 'Xương hàm trên có khe hở do tật khe hở'], ['ta2', 'taj', 'bergland']),
    abgGraft: T(['Secondary alveolar bone graft', '{二次的|にじてき}{顎裂部骨移植|がくれつぶこついしょく}', 'Ghép xương ổ răng thì hai'], ['New bone placed in the cleft gap', '{裂|さ}け{目|め}のすき{間|ま}に{入|い}れた{骨|ほね}', 'Xương mới đặt vào khe hở'], ['bergland', 'acpa']),
    braces: T(['Fixed orthodontic appliance', '{固定式|こていしき}{矯正装置|きょうせいそうち}', 'Khí cụ chỉnh nha cố định'], ['Braces', '{歯|は}の{矯正装置|きょうせいそうち}', 'Mắc cài niềng răng'], ['mesh', 'bergland']),
    sinusMax: T(['Maxillary sinus', '{上顎洞|じょうがくどう}', 'Xoang hàm trên'], ['Air space above the upper back teeth', '{上|うえ}の{奥歯|おくば}の{上|うえ}にある{空気|くうき}の{部屋|へや}', 'Khoang khí phía trên răng hàm trên'], ANAT),
    sinusMucosa: T(['Maxillary sinus mucosa (thickened)', '{上顎洞粘膜|じょうがくどうねんまく}（{肥厚|ひこう}）', 'Niêm mạc xoang hàm trên (dày lên)'], ['Swollen lining of the sinus', '{腫|は}れた{上顎洞|じょうがくどう}の{粘膜|ねんまく}', 'Lớp niêm mạc xoang bị sưng'], ['ta2', 'taj', 'parvini']),
    oafTract: T(['Oroantral fistula', '{口腔上顎洞瘻|こうくうじょうがくどうろう}', 'Rò miệng - xoang'], ['Lined tunnel between mouth and sinus', '{口|くち}と{上顎洞|じょうがくどう}をつなぐトンネル', 'Đường hầm có lót niêm mạc giữa miệng và xoang'], ['parvini', 'mesh']),
    clot: T(['Blood clot in the socket', '{抜歯窩|ばっしか}の{血餅|けっぺい}', 'Cục máu đông trong ổ răng'], ['Clot that seals a small opening', '{小|ちい}さな{穴|あな}をふさぐ{血|ち}のかたまり', 'Cục máu đông bịt lỗ nhỏ'], ['parvini']),
    buccalFlap: T(['Buccal advancement flap', '{頬側|きょうそく}{前進|ぜんしん}{弁|べん}', 'Vạt trượt phía má'], ['Gum tissue from the cheek side stretched over the opening', 'ほお{側|がわ}の{歯|は}ぐきをのばして{穴|あな}をおおう', 'Mô lợi phía má được kéo phủ lên lỗ'], ['parvini']),
    palatalFlap: T(['Palatal rotation flap', '{口蓋|こうがい}{回転|かいてん}{弁|べん}', 'Vạt xoay khẩu cái'], ['Roof-of-mouth tissue turned over the opening', '{上|うわ}あごの{粘膜|ねんまく}を{回|まわ}して{穴|あな}をおおう', 'Mô vòm miệng được xoay phủ lên lỗ'], ['parvini']),
    bfp: T(['Buccal fat pad flap', '{頬脂肪体|きょうしぼうたい}{弁|べん}', 'Vạt mỡ má'], ['Fat from inside the cheek moved over the opening', 'ほおの{中|なか}の{脂肪|しぼう}を{移|うつ}して{穴|あな}をおおう', 'Mỡ trong má được chuyển phủ lên lỗ'], ['ta2', 'egyedi', 'parvini']),
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
    [/^\/models\/abg\/abg-1/, { canine: 'canineMax', bone: 'cleftMaxilla', gum: 'gingiva', teeth: 'teethUpper' }],
    [/^\/models\/abg\//, { graft: 'abgGraft', braces: 'braces', bone: 'maxilla', gum: 'gingiva', teeth: 'teethUpper' }],
    [/^\/oroantral\/models\/palatal/, { flap: 'palatalFlap', clot: 'clot', sinus: 'sinusMax', bone: 'maxilla', teeth: 'teethUpper' }],
    [/^\/oroantral\//, { tract: 'oafTract', lining: 'sinusMucosa', fat: 'bfp', flap: 'buccalFlap', clot: 'clot', sinus: 'sinusMax', bone: 'maxilla', teeth: 'teethUpper', gum: 'gingiva' }],
  ];
  // Viewers that already have their own labels (homepage and /models/alveolar-bone-graft, /oroantral/).
  // Show mode (/show) has no hand-placed labels, so these models get the sets above there.
  const OWN = /^\/(models\/abg|oroantral)\//;
  const ownLabels = (path, el) => OWN.test(path) && !el.closest('.show-frame');
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
    // The dots on the model are invisible probes (model-viewer hotspots, or points on the three.js layer): the
    // visible dot, leader line and label are drawn on one layer (.vt-callouts) so they never fight over the
    // stacking order. Label colours stay light in both themes: they sit on the 3D view.
    '.vt-hotspot{position:absolute;width:2px;height:2px;padding:0;margin:0;border:0;opacity:0;pointer-events:none}',
    'model-viewer .vt-hotspot{position:relative}',
    '.vt-label-layer .vt-hotspot{transform:translate(-50%,-50%)}',
    '.vt-callouts{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:4}',
    '.vt-leaders{position:absolute;inset:0;width:100%;height:100%;overflow:visible}',
    '.vt-leaders .halo{stroke:rgba(0,0,0,.45);stroke-width:3.5;fill:none}',
    '.vt-leaders .line{stroke:#fff;stroke-width:1.5;fill:none}',
    '.vt-leaders circle{fill:#1b1d21;stroke:#fff;stroke-width:2}',
    '.vt-callout{position:absolute;left:0;top:0;width:max-content;max-width:220px;margin:0;padding:.2rem .5rem;border:0;border-radius:6px;background:rgba(255,255,255,.95);color:#1b1d21;font:700 12px/1.25 system-ui,sans-serif;text-align:left;white-space:normal;box-shadow:0 1px 3px rgba(0,0,0,.3);pointer-events:auto;cursor:default}',
    '.vt-callout[data-side="right"]{text-align:right}',
    '.vt-callout small{display:block;font-size:11px;font-weight:500}',
    '.vt-callout rt{font-size:.6em;font-weight:500}',
    '.vt-callout .vt-short{display:none}',
    '.vt-callout:focus-visible{outline:3px solid var(--accent,#0a7c86);outline-offset:2px}',
    // Narrow viewers (phones): the short term only; tap a label for the full term and plain words.
    '.vt-compact .vt-callout{cursor:pointer;font-size:11.5px;padding:.15rem .4rem}',
    '.vt-compact .vt-callout:not(.open) .vt-term,.vt-compact .vt-callout:not(.open) small{display:none}',
    '.vt-compact .vt-callout:not(.open) .vt-short{display:inline}',
    '.vt-labels-off .vt-hotspot,.vt-labels-off .vt-callouts{display:none}',
    '.vt-label-layer{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:3}',
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

  // Short term for narrow viewers: the formal term without its bracketed qualifier ("Mandibular third molar").
  const short = (t) => t.replace(/\s*[（(][^（）()]*[）)]\s*$/, '') || t;
  function labelHtml(key) {
    const term = TERMS[key], t = term.t[lang()] || term.t[0];
    return '<span class="vt-term">' + ruby(t) + '</span><span class="vt-short">' + ruby(short(t)) + '</span><small>' + say(term.n) + '</small>';
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

  // ---- Callouts: each label is placed, one by one in priority order, where it covers the least of the model
  // (from the model's outline samples, projected to the screen), never on another label or the viewer's buttons,
  // and joined to its spot by a leader line that avoids crossing other labels and lines. Labels keep their place
  // while the model turns unless a much better place opens up, so they do not jump about.
  const NS = 'http://www.w3.org/2000/svg';
  function board(host) {
    const layer = doc.createElement('div');
    layer.className = 'vt-callouts';
    const svg = doc.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'vt-leaders'); svg.setAttribute('aria-hidden', 'true');
    layer.appendChild(svg);
    host.appendChild(layer);
    return { host, layer, svg, items: [], pts: [] };
  }
  function addCallout(b, key, dot, prio) {
    const c = doc.createElement('button');
    c.type = 'button'; c.className = 'vt-callout'; c.dataset.key = key;
    c.innerHTML = labelHtml(key);
    c.addEventListener('click', () => {
      if (!b.layer.classList.contains('vt-compact')) return;
      const open = !c.classList.contains('open');
      b.items.forEach((it) => { it.c.classList.remove('open'); it.c.setAttribute('aria-expanded', 'false'); });
      c.classList.toggle('open', open); c.setAttribute('aria-expanded', String(open));
    });
    // A tap on a label is not a drag of the model.
    c.addEventListener('pointerdown', (e) => e.stopPropagation());
    const g = doc.createElementNS(NS, 'g');
    g.innerHTML = '<polyline class="halo"/><polyline class="line"/><circle r="4"/>';
    b.svg.appendChild(g); b.layer.appendChild(c);
    b.items.push({ c, g, dot, prio, off: null });
  }
  function clearBoard(b) { b.items.forEach((it) => { it.c.remove(); it.g.remove(); }); b.items = []; b.pts = []; }
  const hideItem = (it) => { it.c.style.display = 'none'; it.g.style.display = 'none'; it.off = null; };
  const hit = (a, r, m) => a.x < r.x + r.w + m && a.x + a.w > r.x - m && a.y < r.y + r.h + m && a.y + a.h > r.y - m;
  // Nearest point of a rectangle to (x, y): where the leader line meets the label.
  const near = (r, x, y) => [Math.max(r.x, Math.min(r.x + r.w, x)), Math.max(r.y, Math.min(r.y + r.h, y))];
  const ccw = (a, b, c) => (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0]);
  const cross2 = (a, b, c, d) => ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
  const segRect = (a, b, r) => {
    const q = [[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]];
    return q.some((p, k) => cross2(a, b, p, q[(k + 1) % 4]));
  };
  const ANG = Array.from({ length: 16 }, (_, k) => [Math.cos(k * Math.PI / 8), Math.sin(k * Math.PI / 8)]);
  const DIST = [36, 60, 90, 125, 165, 210];

  function layout(b) {
    const host = b.host, W = host.clientWidth, H = host.clientHeight;
    if (!W || !H || off) return;
    const R = host.getBoundingClientRect();
    if (R.bottom < 0 || R.top > innerHeight) return; // off screen
    const compact = W < 480;
    b.layer.classList.toggle('vt-compact', compact);
    const pad = 6;
    const colW = compact ? Math.max(90, Math.min(150, W * 0.4)) : Math.min(230, W * 0.32);
    // The viewer's own controls (Labels and full screen buttons, captions laid over the view) are kept clear.
    const blocks = [];
    const rel = (r) => ({ x: r.left - R.left, y: r.top - R.top, w: r.width, h: r.height });
    host.querySelectorAll(':scope > button:not(.vt-callout), :scope > .vt-fs, :scope > [class*="hint"]').forEach((e) => { const r = e.getBoundingClientRect(); if (r.width) blocks.push(rel(r)); });
    [...(host.parentElement ? host.parentElement.children : [])].forEach((e) => {
      if (e === host || !/absolute|fixed/.test(getComputedStyle(e).position)) return;
      const r = e.getBoundingClientRect(); if (r.width && hit(rel(r), { x: 0, y: 0, w: W, h: H }, 0)) blocks.push(rel(r));
    });
    // Where the model is on screen: a grid of 10 px cells, filled around each outline sample.
    const S = 10, gw = Math.ceil(W / S), gh = Math.ceil(H / S), occ = new Uint8Array(gw * gh);
    b.pts.forEach(([x, y]) => {
      const cx = Math.floor(x / S), cy = Math.floor(y / S);
      for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
        const gx = cx + i, gy = cy + j; if (gx >= 0 && gy >= 0 && gx < gw && gy < gh && i * i + j * j <= 5) occ[gy * gw + gx] = 1;
      }
    });
    const cover = (r) => {
      let n = 0, t = 0;
      for (let gy = Math.max(0, Math.floor(r.y / S)); gy <= Math.min(gh - 1, Math.floor((r.y + r.h) / S)); gy++)
        for (let gx = Math.max(0, Math.floor(r.x / S)); gx <= Math.min(gw - 1, Math.floor((r.x + r.w) / S)); gx++) { t++; n += occ[gy * gw + gx]; }
      return t ? n / t : 0;
    };
    const live = [];
    b.items.forEach((it) => {
      if (it.dot.dataset.show === 'false' || !it.dot.isConnected) { hideItem(it); return; }
      const d = it.dot.getBoundingClientRect();
      it.x = d.left + d.width / 2 - R.left; it.y = d.top + d.height / 2 - R.top;
      if (it.x < 2 || it.x > W - 2 || it.y < 2 || it.y > H - 2) { hideItem(it); return; }
      it.c.style.maxWidth = (it.c.classList.contains('open') ? Math.min(W - 2 * pad, Math.max(colW, 240)) : colW) + 'px';
      live.push(it);
    });
    // Nothing moved since last time: leave the labels where they are.
    const sig = W + ',' + H + ',' + lang() + ',' + b.pts.length + ';' + live.map((it) => Math.round(it.x) + ',' + Math.round(it.y) + (it.c.classList.contains('open') ? 'o' : '')).join(';');
    if (sig === b.sig) return;
    b.sig = sig;
    live.forEach((it) => { it.c.style.display = ''; it.g.style.display = ''; });
    live.forEach((it) => { it.w = it.c.offsetWidth; it.h = it.c.offsetHeight; });
    // An opened label (tapped on a phone) is placed first, so it gets the room it needs.
    const rank = (it) => (it.c.classList.contains('open') ? -1 : it.prio);
    live.sort((a, c) => rank(a) - rank(c));
    const placed = [], lines = [];
    live.forEach((it) => {
      const { x, y, w, h } = it;
      const cands = [];
      ANG.forEach(([dx, dy]) => DIST.forEach((dist) => {
        const qx = x + dx * dist, qy = y + dy * dist;
        if (dx > 0.38) cands.push({ x: qx, y: qy - h / 2 });
        else if (dx < -0.38) cands.push({ x: qx - w, y: qy - h / 2 });
        else cands.push({ x: qx - w / 2, y: dy < 0 ? qy - h : qy });
      }));
      // Columns along both sides, as a fallback when the space around the spot is taken.
      for (let cy = pad; cy + h <= H - pad; cy += 12) { cands.push({ x: pad, y: cy }); cands.push({ x: W - pad - w, y: cy }); }
      let best = null;
      cands.forEach((r) => {
        r.w = w; r.h = h;
        if (r.x < pad || r.y < pad || r.x + w > W - pad || r.y + h > H - pad) return;
        if (blocks.some((o) => hit(r, o, 4)) || placed.some((o) => hit(r, o, 4))) return;
        const a = [x, y], e = near(r, x, y);
        const len = Math.hypot(e[0] - x, e[1] - y);
        if (len < 24) return;
        let cost = cover(r) * 400 + len * 0.35;
        live.forEach((o) => { if (o !== it && o.x > r.x - 4 && o.x < r.x + w + 4 && o.y > r.y - 4 && o.y < r.y + h + 4) cost += 300; });
        placed.forEach((o) => { if (segRect(a, e, o)) cost += 250; });
        lines.forEach(([p, q]) => { if (cross2(a, e, p, q)) cost += 120; });
        // Stay near the last place (relative to the spot) unless somewhere is clearly better.
        if (it.off) cost += Math.min(80, Math.hypot(r.x - x - it.off[0], r.y - y - it.off[1]) * 0.6);
        if (!best || cost < best.cost) best = { r, e, cost };
      });
      if (!best) { hideItem(it); return; }
      const { r, e } = best;
      it.off = [r.x - x, r.y - y];
      placed.push(r); lines.push([[x, y], e]);
      it.c.dataset.side = r.x + w / 2 < x ? 'left' : 'right';
      it.c.style.transform = 'translate(' + Math.round(r.x) + 'px,' + Math.round(r.y) + 'px)';
      const pts = e[0] + ',' + e[1] + ' ' + x + ',' + y;
      it.g.children[0].setAttribute('points', pts); it.g.children[1].setAttribute('points', pts);
      it.g.children[2].setAttribute('cx', x); it.g.children[2].setAttribute('cy', y);
    });
  }

  // ---- model-viewer
  const base = (n) => (n || '').replace(/[._]\d+$/, '');
  function pathOf(src) { try { return new URL(src, location.href).pathname; } catch { return ''; } }

  function setupModelViewer(mv) {
    if (mv.dataset.vtLabels) return;
    mv.dataset.vtLabels = '1';
    let spots = [], current = null, b = null;
    const alpha = (name) => {
      const mats = (mv.model && mv.model.materials) || [];
      const own = mats.filter((m) => base(m.name) === name);
      return own.length ? Math.max(...own.map((m) => m.pbrMetallicRoughness.baseColorFactor[3])) : 1;
    };
    // The outline samples on screen. model-viewer does not give its camera matrix, so the samples are put in camera
    // space from the orbit and target, and the screen scale and centre are fitted to where model-viewer drew the
    // label spots (whose 3D places are known).
    function project() {
      if (!current || !current.shape || !spots.length) return [];
      let o, t;
      try { o = mv.getCameraOrbit(); t = mv.getCameraTarget(); } catch { return []; }
      const th = o.theta - (mv.turntableRotation || 0), ph = o.phi;
      const z = [Math.sin(ph) * Math.sin(th), Math.cos(ph), Math.sin(ph) * Math.cos(th)];
      const xl = Math.hypot(z[2], z[0]) || 1, xv = [z[2] / xl, 0, -z[0] / xl];
      const yv = [z[1] * xv[2] - z[2] * xv[1], z[2] * xv[0] - z[0] * xv[2], z[0] * xv[1] - z[1] * xv[0]];
      const uv = (x, y, zz) => {
        const r = [x - t.x, y - t.y, zz - t.z], d = o.radius - (r[0] * z[0] + r[1] * z[1] + r[2] * z[2]);
        return d > 1e-6 ? [(r[0] * xv[0] + r[1] * xv[1] + r[2] * xv[2]) / d, (r[0] * yv[0] + r[1] * yv[1] + r[2] * yv[2]) / d] : null;
      };
      const R = mv.getBoundingClientRect();
      const obs = [];
      spots.forEach((h) => {
        const r = h.getBoundingClientRect(); if (!r.width && !r.height && !r.left) return;
        const p = h.dataset.position.split(' ').map(parseFloat), q = uv(p[0], p[1], p[2]);
        if (q) obs.push([q[0], q[1], r.left + r.width / 2 - R.left, r.top + r.height / 2 - R.top]);
      });
      if (!obs.length) return [];
      const n = obs.length, sum = (f) => obs.reduce((a, x) => a + f(x), 0);
      const su = sum((x) => x[0]), sv = sum((x) => x[1]), sX = sum((x) => x[2]), sY = sum((x) => x[3]);
      const den = sum((x) => x[0] * x[0] + x[1] * x[1]) - (su * su + sv * sv) / n;
      let f = den > 1e-9 ? (sum((x) => x[0] * x[2] - x[1] * x[3]) - sX * su / n + sY * sv / n) / den : 0;
      if (!(f > 0)) { let fov = 30; try { fov = mv.getFieldOfView(); } catch { /* default */ } f = R.height / 2 / Math.tan(fov * Math.PI / 360); }
      const cx = (sX - f * su) / n, cy = (sY + f * sv) / n;
      const out = [], sh = current.shape, hidden = current.mats.map((m) => alpha(m) <= 0.02);
      for (let i = 0; i < sh.length; i += 4) {
        if (hidden[sh[i + 3]]) continue;
        const q = uv(sh[i], sh[i + 1], sh[i + 2]); if (q) out.push([cx + f * q[0], cy - f * q[1]]);
      }
      return out;
    }
    async function render() {
      spots.forEach((h) => h.remove()); spots = []; current = null;
      if (b) clearBoard(b);
      const path = pathOf(mv.src || mv.getAttribute('src') || '');
      if (!path || ownLabels(path, mv)) return;
      const set = setFor(path); if (!set) return;
      const file = await anchors(path); if (!file) return;
      if (pathOf(mv.src || mv.getAttribute('src') || '') !== path) return; // the model changed while loading
      current = file;
      const at = file.parts;
      addToggle(mv);
      if (!b) b = board(mv);
      Object.entries(set).forEach(([part, key], i) => {
        const a = at[part]; if (!a || !TERMS[key]) return;
        const h = doc.createElement('div');
        h.className = 'vt-hotspot'; h.slot = 'hotspot-vt-' + i;
        h.dataset.position = a.at[0].p.map((v) => v + 'm').join(' ');
        h.dataset.normal = a.at[0].n.join(' ');
        h.dataset.spot = '0';
        h.dataset.mat = a.m; h.dataset.part = part; h.dataset.show = 'true';
        h.dataset.key = key;
        mv.appendChild(h); spots.push(h); used.add(key);
        addCallout(b, key, h, i);
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
    }
    mv.addEventListener('load', render);
    mv.addEventListener('camera-change', tick);
    // Auto-rotate and turntable resets do not fire camera-change, so check a few times a second.
    setInterval(tick, 250);
    // The labels follow their spots every other frame (model-viewer moves the spots itself).
    let n = 0;
    const follow = () => { requestAnimationFrame(follow); if (b && b.items.length && !off && ++n % 2 === 0) { b.pts = project(); layout(b); } };
    requestAnimationFrame(follow);
    if (mv.loaded) render();
  }

  // ---- three.js head and neck viewers: box.vtLabels = { THREE, camera, root(), parts(), path() } and a 'vt-labels' event.
  function setupThree(box) {
    if (box.dataset.vtLabels) return;
    box.dataset.vtLabels = '1';
    const layer = doc.createElement('div');
    layer.className = 'vt-label-layer';
    box.appendChild(layer);
    const b = board(box);
    let spots = [], counter = 0, current = null;
    async function render() {
      const api = box.vtLabels; if (!api) return;
      const path = api.path(); const set = setFor(path);
      const file = set ? await anchors(path) : null;
      if (api !== box.vtLabels) return; // another case was picked while loading
      layer.innerHTML = ''; spots = []; current = file; clearBoard(b);
      if (!file) return;
      addToggle(box);
      const at = file.parts;
      Object.entries(set).forEach(([part, key], i) => {
        const a = at[part]; if (!a || !TERMS[key]) return;
        const h = doc.createElement('div');
        h.className = 'vt-hotspot'; h.dataset.show = 'false'; h.dataset.key = key;
        layer.appendChild(h); used.add(key);
        spots.push({ h, a, part });
        addCallout(b, key, h, i);
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
      // The outline samples on screen (parts the viewer has hidden are left out).
      b.pts = [];
      const sh = current && current.shape;
      if (sh) {
        const hidden = current.mats.map((m) => { const ms = parts.filter((o) => base(o.material && o.material.name) === m); return ms.length > 0 && ms.every((o) => !o.visible); });
        const v = new THREE.Vector3();
        for (let i = 0; i < sh.length; i += 4) {
          if (hidden[sh[i + 3]]) continue;
          root.localToWorld(v.set(sh[i], sh[i + 1], sh[i + 2])).project(cam);
          if (v.z < 1) b.pts.push([(v.x + 1) / 2 * w, (1 - v.y) / 2 * hgt]);
        }
      }
      layout(b);
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
    doc.querySelectorAll('.vt-callout').forEach((c) => { if (TERMS[c.dataset.key]) c.innerHTML = labelHtml(c.dataset.key); });
    paintToggles(); paintSources();
  }).observe(doc.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
