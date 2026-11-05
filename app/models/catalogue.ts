export type Source = { text: string; href: string };
export type ModelFile = { label: string; href: string; size: string };
export type ChangeLogEntry = { version: string; date: string; text: string };

export type CatalogueModel = {
  slug: string;
  href: string;
  title: string;
  specialty: string;
  summary: string;
  image: string;
  imageAlt: string;
  pairing: string;
  status: string;
  version: string;
  updated: string;
};

export const licence = {
  name: 'CC BY-SA 4.0',
  href: 'https://creativecommons.org/licenses/by-sa/4.0/',
};

export const catalogue: CatalogueModel[] = [
  {
    slug: 'impacted-wisdom-tooth',
    href: '/models/impacted-wisdom-tooth',
    title: 'Impacted lower wisdom tooth',
    specialty: 'Oral and maxillofacial surgery',
    summary: 'A lower left wisdom tooth tilted forward against the second molar, with its roots close to the inferior alveolar nerve. Compare it with the same jaw where the wisdom tooth has come through normally.',
    image: '/assets/renders/wisdom-tooth-compare.webp',
    imageAlt: 'Two lower left jaws side by side: on the left the wisdom tooth is tilted and stuck against the second molar, on the right it stands upright in line with the other teeth. The nerve is red in both.',
    pairing: 'Pathology + matched normal',
    status: 'Awaiting clinical review',
    version: '1.1',
    updated: '5 November 2026',
  },
  {
    slug: 'dental-development',
    href: '/development/',
    title: 'Dental development, ages 6 to 12',
    specialty: 'Orthodontics and paediatric dentistry',
    summary: 'Seven stages, one per year from 6.5 to 12.5 years, showing baby teeth (blue) being replaced by adult teeth (yellow) in the right upper and lower jaw.',
    image: '/assets/renders/dental-development.webp',
    imageAlt: 'Right upper and lower jaw of a nine-year-old with the cheek-side bone cut away, showing blue baby teeth above yellow adult teeth still forming.',
    pairing: 'Normal development series',
    status: 'Awaiting clinical review',
    version: '1.0',
    updated: '5 November 2026',
  },
];

export const wisdomTooth = {
  impacted: {
    glb: '/models/impacted-molar.glb',
    stl: '/models/impacted-molar.stl',
    alt: 'Lower left jaw with an impacted wisdom tooth tilted forward against the second molar. Its roots lie close to the inferior alveolar nerve, shown in red.',
  },
  normal: {
    glb: '/models/wisdom-tooth-normal.glb',
    stl: '/models/wisdom-tooth-normal.stl',
    alt: 'The same lower left jaw with the wisdom tooth upright and fully through the gum, in line with the other molars. The inferior alveolar nerve is shown in red below the roots.',
  },
  files: [
    { label: 'Impacted · GLB (web and AR)', href: '/models/impacted-molar.glb', size: '0.6 MB' },
    { label: 'Impacted · STL (printing, mm)', href: '/models/impacted-molar.stl', size: '1.5 MB' },
    { label: 'Normal · GLB (web and AR)', href: '/models/wisdom-tooth-normal.glb', size: '0.6 MB' },
    { label: 'Normal · STL (printing, mm)', href: '/models/wisdom-tooth-normal.stl', size: '1.5 MB' },
  ] satisfies ModelFile[],
  shows: [
    'Left half of the lower jaw, with cheek-side bone cut away so the tooth roots and the nerve can be seen.',
    'A mesioangular impacted third molar against the distal surface of the second molar.',
    'The inferior alveolar nerve (red) running in the mandibular canal and close to the third molar roots.',
  ],
  normalMethod: 'The matched normal is the same jaw, teeth and nerve. Only the wisdom tooth is changed: it is replaced by an upright third molar in line with the second molar, at the same biting level. Its shape is the second molar scaled to 92%, with roots 20% shorter, so the roots stay at least 1.5 mm from the nerve.',
  simplifications: [
    'One typical jaw, not a patient scan. Real jaws, roots and nerve paths vary a lot.',
    'Gum, lingual nerve, blood vessels and the upper jaw are not shown.',
    'Bone is solid. The mandibular canal and tooth sockets are not hollowed out.',
    'The STL is life size in millimetres but is not checked as a closed solid. Repair it in your slicer before printing.',
  ],
  sources: [
    { text: 'Juodzbalys G, Daugela P. Mandibular third molar impaction: review of literature and a proposal of a classification. J Oral Maxillofac Res. 2013;4(2):e1.', href: 'https://doi.org/10.5037/jomr.2013.4201' },
    { text: 'Juodzbalys G, Wang HL, Sabalys G. Anatomy of mandibular vital structures. Part I: mandibular canal and inferior alveolar neurovascular bundle in relation with dental implantology. J Oral Maxillofac Res. 2010;1(1):e2.', href: 'https://doi.org/10.5037/jomr.2010.1102' },
    { text: 'Rood JP, Shehab BA. The radiological prediction of inferior alveolar nerve injury during third molar surgery. Br J Oral Maxillofac Surg. 1990;28(1):20-25.', href: 'https://doi.org/10.1016/0266-4356(90)90005-6' },
    { text: 'Hsu KJ, Lee HN, Chen CM. Morphological investigation of mandibular lingula: a literature review. J Pers Med. 2022;12(6):1015.', href: 'https://doi.org/10.3390/jpm12061015' },
    { text: 'Marquez Rocco V, Thor A, Hashim AA, Bellerud D. Root migration after coronectomy of a mandibular third molar with the inferior alveolar nerve passing between the roots: a case report. Clin Case Rep. 2026;14(10):e73673.', href: 'https://doi.org/10.1002/ccr3.73673' },
  ] satisfies Source[],
  changelog: [
    { version: '1.1', date: '5 November 2026', text: 'Added the matched normal jaw and STL files for both models.' },
    { version: '1.0', date: '5 November 2026', text: 'Updated to the coloured model with the nerve in red, from the wisdom tooth patient information study.' },
  ] satisfies ChangeLogEntry[],
  citation: 'Vivatheca. Impacted lower wisdom tooth and matched normal, version 1.1. 2026. https://vivatheca.com/models/impacted-wisdom-tooth. Licensed under CC BY-SA 4.0.',
};
