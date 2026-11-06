// Head and neck hub: the two typical palate cases (pleomorphic adenoma, adenoid cystic carcinoma). three.js viewer, case text (English and Japanese) and sources.
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
      choice: ['Our choices for the model: tumour 17 × 19 × 12 mm; the nerve path is drawn from typical anatomy, not traced from a scan. The flap’s shape and the path of its artery and vein are simplified. The sphenoid bone, which carries the pterygoid plates, is not shown: its simplified 3D shape broke into specks.',
        '{当方|とうほう}の{設定|せってい}：がんは17×19×12mm。{神経|しんけい}の{通|とお}り{道|みち}は{一般的|いっぱんてき}な{解剖|かいぼう}から{描|えが}いたもので、{画像|がぞう}からたどったものではありません。{皮弁|ひべん}の{形|かたち}と、その{動脈|どうみゃく}・{静脈|じょうみゃく}の{通|とお}り{道|みち}は{簡略化|かんりゃくか}しています。{翼状|よくじょう}{突起|とっき}がある{蝶形骨|ちょうけいこつ}は{表示|ひょうじ}していません（{簡略化|かんりゃくか}した3Dの{形|かたち}が{細|こま}かく{割|わ}れたため）。'] },
  };
  const L = (pair) => (JA ? I.ruby(pair[1]) : pair[0]);
  const LEGEND = [
    [/^bone$/, 'Bone', '{骨|ほね}'], [/^teeth$/, 'Teeth', '{歯|は}'], [/^lesion/, 'Disease', '{病変|びょうへん}'], [/^margin/, 'Safety margin', '{安全|あんぜん}{域|いき}'],
    [/^extracted/, 'Tooth taken out at the cut', '{切|き}り{口|くち}で{抜|ぬ}く{歯|は}'], [/^nerve/, 'Nerve canal', '{神経|しんけい}の{通|とお}り{道|みち}'],
    [/^excised/, 'Lining and periosteum removed', '{取|と}る{粘膜|ねんまく}と{骨膜|こつまく}'], [/^removed/, 'Bone removed', '{取|と}る{骨|ほね}'],
    [/^obturator$/, 'Obturator', '{顎|がく}{義歯|ぎし}'], [/^obturator_teeth/, 'Obturator teeth', '{顎|がく}{義歯|ぎし}の{歯|は}'], [/^free_flap$/, 'Free flap', '{遊離|ゆうり}{皮弁|ひべん}'], [/^free_flap_artery/, 'Flap artery', '{皮弁|ひべん}の{動脈|どうみゃく}'], [/^free_flap_vein/, 'Flap vein', '{皮弁|ひべん}の{静脈|じょうみゃく}'],
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
  // Screen readers get a text label for the 3D view (the page heading, without furigana readings).
  (function labelCanvas() {
    const h = document.querySelector('h1'); if (!h) return;
    const c = h.cloneNode(true); c.querySelectorAll('rt, rp').forEach((r) => r.remove());
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', (document.documentElement.lang === 'ja' ? '3Dモデル: ' : '3D model: ') + c.textContent.trim());
  })();
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
  // For links to a view and saved pictures (/share-tools.js): camera position and target, and a fresh frame.
  box.vtView = {
    get: () => ({ p: camera.position.toArray().map((n) => +n.toFixed(4)), t: controls.target.toArray().map((n) => +n.toFixed(4)) }),
    set: (v) => { if (!v || !v.p) return; camera.position.fromArray(v.p); controls.target.fromArray(v.t || [0, 0, 0]); controls.update(); },
    capture: () => { controls.update(); renderer.render(scene, camera); return renderer.domElement; },
  };

  const cache = {}; let cur = null, root = null, offset = 0, target = 0, token = 0;
  const state = { stage: 'pre', margin: false, xray: false };
  const loader = new THREE.GLTFLoader();
  if (THREE.DRACOLoader) loader.setDRACOLoader(new THREE.DRACOLoader().setDecoderPath('/head-neck/vendor/draco/'));
  const MOVE = /^(specimen|extracted|lesion|nerve|removed|excised|margin)/;
  const baseName = (n) => n.replace(/[._]\d+$/, '');

  // "Take the model apart" panel (/model-parts.js): the parts on show in this stage, each can be hidden.
  const hiddenParts = new Set();
  const partGroup = (n) => n.replace(/^screws$/, 'plate').replace(/^free_flap_(artery|vein)$/, 'free_flap');
  function announceParts() {
    box.vtParts = {
      names: () => [...new Set((cur ? cur.parts : []).filter((o) => o.userData.stageVis).map((o) => partGroup(o.userData.n)))],
      colour: (g) => { const o = (cur ? cur.parts : []).find((p) => partGroup(p.userData.n) === g); return o ? '#' + o.material.color.clone().convertLinearToSRGB().getHexString() : ''; },
      hide: (g, off) => { if (off) hiddenParts.add(g); else hiddenParts.delete(g); (cur ? cur.parts : []).forEach((o) => { o.visible = o.userData.stageVis && !hiddenParts.has(partGroup(o.userData.n)); }); },
    };
    box.dispatchEvent(new Event('vt-parts'));
  }

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
      o.userData.stageVis = vis; o.visible = vis && !hiddenParts.has(partGroup(n));
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
    announceParts();
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
  // The lower jaw cases and the mucoepidermoid carcinoma moved to their own pages.
  if (['scc', 'ameloblastoma', 'okc', 'mec'].includes(first)) { location.replace('/head-neck/' + first + '/'); return; }
  pick(CASES[first] ? first : 'pa');
})();
