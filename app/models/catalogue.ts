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
};

export const licence = {
  name: 'CC BY-SA 4.0',
  href: 'https://creativecommons.org/licenses/by-sa/4.0/',
};

export const catalogue: CatalogueModel[] = [
  { slug: 'impacted-wisdom-tooth', href: '/models/impacted-wisdom-tooth', image: '/assets/renders/wisdom-tooth-compare.webp', version: '1.3', updated: '2026-11-06', icon: 'general-surgery' },
  { slug: 'dental-development', href: '/development/', image: '/assets/renders/dental-development.webp', version: '0.4', updated: '2026-11-05', icon: 'child-care' },
  { slug: 'periodontitis', href: '/periodontitis/', image: '/assets/renders/periodontitis.webp', version: '0.1', updated: '2026-11-05', icon: 'mouth' },
  { slug: 'oroantral', href: '/oroantral/', image: '/assets/renders/oroantral.webp', version: '0.2', updated: '2026-11-06', icon: 'general-surgery' },
  { slug: 'cracked-tooth', href: '/cracked-tooth/', image: '/assets/renders/cracked-tooth.webp', version: '0.2', updated: '2026-11-05', icon: 'tooth' },
  { slug: 'stainless-steel-crown', href: '/stainless-steel-crown/', image: '/assets/renders/stainless-steel-crown.webp', version: '0.2', updated: '2026-11-05', icon: 'child-care' },
  { slug: 'head-neck', href: '/head-neck/', image: '/assets/renders/head-neck.webp', version: '1.1', updated: '2026-11-06', icon: 'head' },
  { slug: 'head-neck-scc', href: '/head-neck/scc/', image: '/assets/renders/head-neck-scc.webp', version: '1.0', updated: '2026-11-06', icon: 'head' },
  { slug: 'head-neck-ameloblastoma', href: '/head-neck/ameloblastoma/', image: '/assets/renders/head-neck-ameloblastoma.webp', version: '1.0', updated: '2026-11-06', icon: 'head' },
  { slug: 'head-neck-okc', href: '/head-neck/okc/', image: '/assets/renders/head-neck-okc.webp', version: '1.0', updated: '2026-11-06', icon: 'head' },
  { slug: 'head-neck-mec', href: '/head-neck/mec/', image: '/assets/renders/head-neck-mec.webp', version: '1.0', updated: '2026-11-06', icon: 'head' },
  { slug: 'alveolar-bone-graft', href: '/models/alveolar-bone-graft', image: '/assets/renders/alveolar-bone-graft.webp', version: '0.1', updated: '2026-11-06', icon: 'general-surgery' },
  { slug: 'orthognathic', href: '/orthognathic/', image: '/assets/renders/orthognathic.webp', version: '0.2', updated: '2026-11-06', icon: 'braces' },
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
