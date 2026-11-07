export type Source = { text: string; href: string };
export type ModelFile = { href: string; size: string };

// Titles, summaries and other words live in the dictionaries (library.items[slug]).
export type CatalogueModel = {
  slug: string;
  href: string;
  image: string;
  version: string;
  updated: string; // ISO date
  icon: string; // specialty icon in public/icons/health/ (Health Icons, CC0)
  terms: Source[]; // sources for the formal clinical name in the title (classification or consensus term)
  licence?: { name: string; href: string }; // only when not the site licence (BodyParts3D-based models are CC BY 4.0)
};

export const licence = {
  name: 'CC BY-SA 4.0',
  href: 'https://creativecommons.org/licenses/by-sa/4.0/',
};

// The licence of one model: the site licence unless the model names its own.
export function licenceOf(slug: string) {
  return catalogue.find((m) => m.slug === slug)?.licence ?? licence;
}

export const catalogue: CatalogueModel[] = [
  { slug: 'impacted-wisdom-tooth', href: '/models/impacted-wisdom-tooth', image: '/assets/renders/wisdom-tooth-compare.webp', version: '1.3', updated: '2026-11-06', icon: 'general-surgery', terms: [{ text: 'Juodzbalys G, Daugela P. Mandibular third molar impaction: review of literature and a proposal of a classification. J Oral Maxillofac Res. 2013;4(2):e1. (Winter angulation: mesioangular.)', href: 'https://doi.org/10.5037/jomr.2013.4201' }] },
  { slug: 'dental-development', href: '/development/', image: '/assets/renders/dental-development.webp', version: '0.4', updated: '2026-11-05', icon: 'child-care', terms: [{ text: 'AlQahtani SJ, Hector MP, Liversidge HM. Brief communication: the London atlas of human tooth development and eruption. Am J Phys Anthropol. 2010;142(3):481-490.', href: 'https://doi.org/10.1002/ajpa.21258' }] },
  { slug: 'periodontitis', href: '/periodontitis/', image: '/assets/renders/periodontitis.webp', version: '0.1', updated: '2026-11-05', icon: 'mouth', terms: [{ text: 'Papapanou PN, Sanz M, Buduneli N, et al. Periodontitis: consensus report of workgroup 2 of the 2017 World Workshop on the Classification of Periodontal and Peri-Implant Diseases and Conditions. J Periodontol. 2018;89 Suppl 1:S173-S182.', href: 'https://doi.org/10.1002/JPER.17-0721' }] },
  { slug: 'oroantral', href: '/oroantral/', image: '/assets/renders/oroantral.webp', version: '0.2', updated: '2026-11-06', icon: 'general-surgery', terms: [{ text: 'Parvini P, Obreja K, Begic A, et al. Decision-making in closure of oroantral communication and fistula. Int J Implant Dent. 2019;5(1):13.', href: 'https://doi.org/10.1186/s40729-019-0165-7' }] },
  { slug: 'cracked-tooth', href: '/cracked-tooth/', image: '/assets/renders/cracked-tooth.webp', version: '0.2', updated: '2026-11-05', icon: 'tooth', terms: [{ text: 'American Association of Endodontists. Glossary of Endodontic Terms. 10th ed. 2020. (Cracked tooth.)', href: 'https://www.aae.org/specialty/clinical-resources/glossary-endodontic-terms/' }] },
  { slug: 'endodontic', href: '/endodontic/', image: '/assets/renders/endodontic.webp', version: '0.1', updated: '2026-11-06', icon: 'tooth', licence: { name: 'CC BY 4.0', href: 'https://creativecommons.org/licenses/by/4.0/' }, terms: [{ text: 'American Association of Endodontists. Glossary of Endodontic Terms. 10th ed. 2020. (Pulp necrosis; chronic apical abscess.)', href: 'https://www.aae.org/specialty/clinical-resources/glossary-endodontic-terms/' }, { text: 'Glickman GN. AAE Consensus Conference on Diagnostic Terminology: background and perspectives. J Endod. 2009;35(12):1619-1620.', href: 'https://doi.org/10.1016/j.joen.2009.09.029' }] },
  { slug: 'prosthodontic', href: '/prosthodontic/', image: '/assets/renders/prosthodontic.webp', version: '0.1', updated: '2026-11-06', icon: 'tooth', licence: { name: 'CC BY 4.0', href: 'https://creativecommons.org/licenses/by/4.0/' }, terms: [{ text: 'The Glossary of Prosthodontic Terms 2023: Tenth Edition. J Prosthet Dent. 2023;130(4 Suppl 1):e7-e126. (Complete denture; overdenture.)', href: 'https://doi.org/10.1016/j.prosdent.2023.03.002' }, { text: 'Cawood JI, Howell RA. A classification of the edentulous jaws. Int J Oral Maxillofac Surg. 1988;17(4):232-236. (Class V: flat ridge.)', href: 'https://doi.org/10.1016/s0901-5027(88)80047-x' }] },
  { slug: 'tmd', href: '/tmd/', image: '/assets/renders/tmd.webp', version: '0.1', updated: '2026-11-06', icon: 'head', licence: { name: 'CC BY 4.0', href: 'https://creativecommons.org/licenses/by/4.0/' }, terms: [{ text: 'Schiffman E, Ohrbach R, Truelove E, et al. Diagnostic Criteria for Temporomandibular Disorders (DC/TMD) for Clinical and Research Applications. J Oral Facial Pain Headache. 2014;28(1):6-27. (Myalgia; arthralgia.)', href: 'https://doi.org/10.11607/jop.1151' }] },
  { slug: 'ectopic-canine', href: '/ectopic-canine/', image: '/assets/renders/ectopic-canine.webp', version: '0.1', updated: '2026-11-06', icon: 'braces', terms: [{ text: 'Cobourne MT, Seehra J, Papageorgiou SN. The palatal displaced maxillary canine: early diagnosis and interceptive correction - a guideline for the general dental practitioner. Br Dent J. 2025;239(7):463-470. (Palatally displaced canine.)', href: 'https://doi.org/10.1038/s41415-025-8892-z' }] },
  { slug: 'stainless-steel-crown', href: '/stainless-steel-crown/', image: '/assets/renders/stainless-steel-crown.webp', version: '0.2', updated: '2026-11-05', icon: 'child-care', terms: [{ text: 'Innes NPT, Ricketts D, Chong LY, Keightley AJ, Lamont T, Santamaria RM. Preformed crowns for decayed primary molar teeth. Cochrane Database Syst Rev. 2015;(12):CD005512.', href: 'https://doi.org/10.1002/14651858.CD005512.pub3' }] },
  { slug: 'head-neck', href: '/head-neck/', image: '/assets/renders/head-neck.webp', version: '1.1', updated: '2026-11-06', icon: 'head', terms: [{ text: 'WHO Classification of Tumours Editorial Board. Head and Neck Tumours. WHO Classification of Tumours, 5th ed., vol. 9. Lyon: International Agency for Research on Cancer; 2022.', href: 'https://tumourclassification.iarc.who.int/' }] },
  { slug: 'head-neck-scc', href: '/head-neck/scc/', image: '/assets/renders/head-neck-scc.webp', version: '1.0', updated: '2026-11-06', icon: 'head', terms: [{ text: 'Muller S, Tilakaratne WM. Update from the 5th edition of the World Health Organization classification of head and neck tumors: tumours of the oral cavity and mobile tongue. Head Neck Pathol. 2022;16(1):54-62.', href: 'https://doi.org/10.1007/s12105-021-01402-9' }, { text: 'Brown JS, Barry C, Ho M, Shaw R. A new classification for mandibular defects after oncological resection. Lancet Oncol. 2016;17(1):e23-e30.', href: 'https://doi.org/10.1016/S1470-2045(15)00310-1' }] },
  { slug: 'head-neck-ameloblastoma', href: '/head-neck/ameloblastoma/', image: '/assets/renders/head-neck-ameloblastoma.webp', version: '1.0', updated: '2026-11-06', icon: 'head', terms: [{ text: 'Vered M, Wright JM. Update from the 5th edition of the World Health Organization classification of head and neck tumors: odontogenic and maxillofacial bone tumours. Head Neck Pathol. 2022;16(1):63-75.', href: 'https://doi.org/10.1007/s12105-021-01404-7' }, { text: 'Brown JS, Barry C, Ho M, Shaw R. A new classification for mandibular defects after oncological resection. Lancet Oncol. 2016;17(1):e23-e30.', href: 'https://doi.org/10.1016/S1470-2045(15)00310-1' }] },
  { slug: 'head-neck-okc', href: '/head-neck/okc/', image: '/assets/renders/head-neck-okc.webp', version: '1.0', updated: '2026-11-06', icon: 'head', terms: [{ text: 'Vered M, Wright JM. Update from the 5th edition of the World Health Organization classification of head and neck tumors: odontogenic and maxillofacial bone tumours. Head Neck Pathol. 2022;16(1):63-75.', href: 'https://doi.org/10.1007/s12105-021-01404-7' }] },
  { slug: 'head-neck-mec', href: '/head-neck/mec/', image: '/assets/renders/head-neck-mec.webp', version: '1.0', updated: '2026-11-06', icon: 'head', terms: [{ text: 'Skálová A, Hyrcza MD, Leivo I. Update from the 5th edition of the World Health Organization classification of head and neck tumors: salivary glands. Head Neck Pathol. 2022;16(1):40-53.', href: 'https://doi.org/10.1007/s12105-022-01420-1' }] },
  { slug: 'alveolar-bone-graft', href: '/models/alveolar-bone-graft', image: '/assets/renders/alveolar-bone-graft.webp', version: '0.1', updated: '2026-11-06', icon: 'general-surgery', terms: [{ text: 'Boyne PJ, Sands NR. Secondary bone grafting of residual alveolar and palatal clefts. J Oral Surg. 1972;30(2):87-92.', href: 'https://pubmed.ncbi.nlm.nih.gov/4550446/' }] },
  { slug: 'averaged-jaw', href: '/models/averaged-jaw', image: '/assets/renders/averaged-jaw.webp', version: '0.1', updated: '2026-11-06', icon: 'general-surgery', terms: [{ text: 'Raith S, Wolff S, Steiner T, et al. Planning of mandibular reconstructions based on statistical shape models. Int J Comput Assist Radiol Surg. 2017;12(1):99-112. (Mean mandible from a statistical shape model.)', href: 'https://doi.org/10.1007/s11548-016-1451-y' }] },
  { slug: 'orthognathic', href: '/orthognathic/', image: '/assets/renders/orthognathic.webp', version: '0.3', updated: '2026-11-06', icon: 'braces', terms: [{ text: 'Angle EH. Classification of malocclusion. Dental Cosmos. 1899;41:248-264, 350-357.', href: '' }] },
  { slug: 'fixation', href: '/fixation/', image: '/assets/renders/fixation.webp', version: '0.1', updated: '2026-11-06', icon: 'general-surgery', terms: [{ text: 'Champy M, Loddé JP, Schmitt R, Jaeger JH, Muster D. Mandibular osteosynthesis by miniature screwed plates via a buccal approach. J Maxillofac Surg. 1978;6(1):14-21.', href: 'https://pubmed.ncbi.nlm.nih.gov/274501/' }] },
];

export function formatDate(iso: string, intl: string) {
  return new Intl.DateTimeFormat(intl, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
}

export const wisdomTooth = {
  impacted: {
    glb: '/models/impacted-molar.glb',
    stl: '/models/impacted-molar.stl',
  },
  normal: {
    glb: '/models/wisdom-tooth-normal.glb',
    stl: '/models/wisdom-tooth-normal.stl',
  },
  // Labels for these files are wisdom.files in the dictionaries, in the same order.
  files: [
    { href: '/models/impacted-molar.glb', size: '0.6 MB' },
    { href: '/models/vivatheca-wisdom-tooth-impacted-stl.zip', size: '0.6 MB' },
    { href: '/models/wisdom-tooth-normal.glb', size: '0.6 MB' },
    { href: '/models/vivatheca-wisdom-tooth-normal-stl.zip', size: '0.6 MB' },
  ] satisfies ModelFile[],
  sources: [
    { text: 'Juodzbalys G, Daugela P. Mandibular third molar impaction: review of literature and a proposal of a classification. J Oral Maxillofac Res. 2013;4(2):e1.', href: 'https://doi.org/10.5037/jomr.2013.4201' },
    { text: 'Juodzbalys G, Wang HL, Sabalys G. Anatomy of mandibular vital structures. Part I: mandibular canal and inferior alveolar neurovascular bundle in relation with dental implantology. J Oral Maxillofac Res. 2010;1(1):e2.', href: 'https://doi.org/10.5037/jomr.2010.1102' },
    { text: 'Rood JP, Shehab BA. The radiological prediction of inferior alveolar nerve injury during third molar surgery. Br J Oral Maxillofac Surg. 1990;28(1):20-25.', href: 'https://doi.org/10.1016/0266-4356(90)90005-6' },
    { text: 'Hsu KJ, Lee HN, Chen CM. Morphological investigation of mandibular lingula: a literature review. J Pers Med. 2022;12(6):1015.', href: 'https://doi.org/10.3390/jpm12061015' },
    { text: 'Reia VCB, de Toledo Telles-Araujo G, Peralta-Mamani M, Biancardi MR, Rubira CMF, Rubira-Bullen IRF. Diagnostic accuracy of CBCT compared to panoramic radiography in predicting IAN exposure: a systematic review and meta-analysis. Clin Oral Investig. 2021;25(8):4721-4733.', href: 'https://doi.org/10.1007/s00784-021-03942-4' },
    { text: 'Marquez Rocco V, Thor A, Hashim AA, Bellerud D. Root migration after coronectomy of a mandibular third molar with the inferior alveolar nerve passing between the roots: a case report. Clin Case Rep. 2026;14(10):e73673.', href: 'https://doi.org/10.1002/ccr3.73673' },
    { text: 'Sorooshzadeh M, Hoseyni Y, Goudarzi F, Jamali A. Key factors in mandibular third molar surgery: a comprehensive view of their prevalence and interrelationships. Saudi Dent J. 2025;37(7-9):53. (526 CBCT scans: the canal lay below the tooth in 78.9%; basis for "more often below the roots".)', href: 'https://doi.org/10.1007/s44445-025-00061-8' },
    { text: 'Jun SH, Kim CH, Ahn JS, Padwa BL, Kwon JJ. Anatomical differences in lower third molars visualized by 2D and 3D X-ray imaging: clinical outcomes after extraction. Int J Oral Maxillofac Surg. 2013;42(4):489-496. (Complications were mostly in roots inside or touching the canal; basis for "higher-risk".)', href: 'https://doi.org/10.1016/j.ijom.2012.12.005' },
    { text: 'Ghaeminia H, Gerlach NL, Hoppenreijs TJM, et al. Clinical relevance of cone beam computed tomography in mandibular third molar removal: a multicentre, randomised, controlled trial. J Craniomaxillofac Surg. 2015;43(10):2158-2167. (Conflicting evidence: CBCT before removal did not reduce nerve injury compared with panoramic radiography.)', href: 'https://doi.org/10.1016/j.jcms.2015.10.009' },
    { text: 'Nelson SJ. Wheeler’s Dental Anatomy, Physiology and Occlusion. 11th ed. St Louis: Elsevier; 2020. Chapter on the permanent mandibular molars. (Third molars: smaller than second molars, variable crowns, often fused roots; basis for the note on how the normal was made.)', href: '' },
  ] satisfies Source[],
  changelogDates: { '1.3': '2026-11-06', '1.2': '2026-11-06', '1.1': '2026-11-05', '1.0': '2026-11-05' } as Record<string, string>,
  citation: 'Seifert L. Vivatheca: Impacted lower wisdom tooth and matched normal, version 1.3. 2026. https://vivatheca.com/models/impacted-wisdom-tooth. Licensed under CC BY-SA 4.0. Accessed [date].',
};
