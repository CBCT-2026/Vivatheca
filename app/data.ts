import { disciplineHref, disciplines } from './models/disciplines';
import type { Dictionary } from './i18n/dictionaries';
import { mailto } from './contact';

// Links and icons stay here; their words come from the dictionary for the visitor's language.

export function footerGroups(t: Dictionary) {
  const f = t.footer;
  return [
    {
      // Disciplines only (Luke, 2026-11-07): one link per discipline, so this list stays as short as its neighbours.
      label: f.explore.label,
      links: disciplines.map((d) => ({ label: f.disciplines.items[d], href: disciplineHref(d) })),
    },
    {
      label: f.use,
      links: [
        { label: f.library, href: '/models' },
        { label: t.show.eyebrow, href: '/show' },
        { label: t.nav.createInfo, href: '/create' },
        { label: f.explore.students, href: '/learn' },
        { label: f.explore.templates, href: '/templates' },
        { label: f.explore.print, href: '/print' },
        { label: f.explore.impact, href: '/impact' },
      ],
    },
    {
      label: f.participate.label,
      links: [
        { label: f.report, href: '/report' },
        { label: f.participate.request, href: '/requests' },
        { label: f.participate.used, href: '/used' },
        { label: f.participate.survey, href: '/survey' },
        { label: f.participate.review, href: '/review' },
        { label: f.participate.contribute, href: '/contribute' },
        { label: f.participate.volunteer, href: '/standards#editors' },
        { label: f.participate.sponsor, href: '/#sponsor' },
      ],
    },
    {
      label: f.aboutGroup.label,
      links: [
        { label: f.aboutGroup.about, href: '/about' },
        { label: f.aboutGroup.standards, href: '/standards' },
        { label: f.aboutGroup.privacy, href: '/privacy' },
        { label: f.aboutGroup.contact, href: mailto() },
      ],
    },
  ];
}

export function understandingPaths(t: Dictionary) {
  const u = t.understanding;
  return [
    { icon: '3d_rotation', ...u.explore },
    { icon: 'menu_book', ...u.explain },
    { icon: 'print', ...u.further },
  ];
}

export function trustItems(t: Dictionary) {
  const r = t.trust;
  return [r.checkable, r.status, r.focus, r.corrections, r.sources];
}

export function publications(t: Dictionary) {
  const p = t.publications;
  // Article titles stay in English, the language they were published in.
  return [
    {
      title: 'Impact of 3D-Printed Anatomical Models on Doctor-Patient Communication in Orthopedic Consultations',
      authors: 'Sanchez AU, Dos Anjos GQ, de Oliveira DGC, et al.',
      doi: '10.7759/cureus.70822', // Cureus. 2024;16(10):e70822 (year shown via t.publications.orthopedic.journal)
      ...p.orthopedic,
      href: 'https://pubmed.ncbi.nlm.nih.gov/39493008/',
    },
    {
      title: 'The use of 3-dimensionally printed models to optimize patient education and alleviate perioperative anxiety in Mohs surgery',
      authors: 'Biro M, Kim I, Huynh A, Fu P, Mann M, Popkin DL.',
      doi: '10.1016/j.jaad.2019.05.085',
      ...p.mohs,
      href: 'https://pubmed.ncbi.nlm.nih.gov/31163232/',
    },
    {
      title: 'Impact of a Virtual Three-Dimensional Thyroid Model on Patient Communication in Thyroid Surgery',
      authors: 'Cao Z, Zhang Q, Yan S, Qian Z, Xu X, Liu Z.',
      doi: '10.3390/cancers18020241', // Cancers. 2026;18(2):241 (year shown via t.publications.thyroid.journal)
      ...p.thyroid,
      href: 'https://pubmed.ncbi.nlm.nih.gov/41595161/',
    },
  ];
}

export function contributionPaths(t: Dictionary) {
  const c = t.contribute;
  return [
    { icon: 'health_and_safety', ...c.report, href: '/report' },
    { icon: 'school', ...c.join, href: '/review' },
    { icon: '3d_rotation', ...c.request, href: '/contribute' },
  ];
}

// Real radiographs and scans shown on the wisdom tooth model page.
// Licences and consent reasoning: assets/clinical-images/manifest.json and docs/image-licensing.md.
// Credits stay in English, the language the sources were published in.
export const clinicalImages = [
  {
    key: 'opgLow',
    src: '/images/clinical/wisdom-tooth/opg-low-impacted-lower-third-molar.jpg',
    width: 750,
    height: 480,
    credit: 'Kudo Y, Asoda S, Muraoka W, et al. Trigeminal neuropathic pain with complicated pathophysiology caused by a low-level impacted mandibular third molar: a case report. Cureus. 2025;17(5):e84308, Figure 1.',
    href: 'https://doi.org/10.7759/cureus.84308',
    licence: { name: 'CC BY 4.0', href: 'https://creativecommons.org/licenses/by/4.0/' },
    changes: 'None.',
  },
  {
    key: 'ctCanal',
    src: '/images/clinical/wisdom-tooth/ct-third-molar-canal.jpg',
    width: 750,
    height: 428,
    credit: 'Same article as Image 1, Figure 2.',
    href: 'https://doi.org/10.7759/cureus.84308',
    licence: { name: 'CC BY 4.0', href: 'https://creativecommons.org/licenses/by/4.0/' },
    changes: 'None.',
  },
  {
    key: 'cbctNerve',
    src: '/images/clinical/wisdom-tooth/cbct-nerve-between-roots.jpg',
    width: 732,
    height: 985,
    credit: 'Pellegrino G, Tayeb S, Vignudelli E, et al. Dynamic navigation-assisted coronectomy of a deeply impacted mandibular third molar: a 5-year case follow-up. Case Rep Dent. 2025;2025:7010729, Figure 1. The article records the patient’s consent to publication of the images.',
    href: 'https://doi.org/10.1155/crid/7010729',
    licence: { name: 'CC BY 4.0', href: 'https://creativecommons.org/licenses/by/4.0/' },
    changes: 'None.',
  },
] as const;

// Alveolar bone graft page: the cleft before grafting (left side, mixed dentition), as in stage 1.
export const abgClinicalImages = [
  {
    key: 'abgOcclusal',
    src: '/images/clinical/alveolar-bone-graft/left-alveolar-cleft-occlusal.jpg',
    width: 394,
    height: 276,
    credit: 'Kaiser J, Kamble R, Atole S. Comprehensive cleft care in a nine-year-old with unilateral cleft lip and palate using Coffin spring expansion and surgical intervention. Cureus. 2024;16(7):e64939, Figure 3B (pre-treatment maxillary occlusal radiograph, cleft on the left side). The journal states that consent was obtained or waived.',
    href: 'https://doi.org/10.7759/cureus.64939',
    licence: { name: 'CC BY 4.0', href: 'https://creativecommons.org/licenses/by/4.0/' },
    changes: 'Cropped to panel B; the arrow and arch line were drawn by the authors.',
  },
] as const;