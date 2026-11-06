import { catalogue } from './models/catalogue';
import type { Dictionary } from './i18n/dictionaries';
import { mailto } from './contact';

// Links and icons stay here; their words come from the dictionary for the visitor's language.

export function footerGroups(t: Dictionary) {
  const f = t.footer;
  return [
    {
      label: f.explore.label,
      links: [
        { label: f.library, href: '/models' },
        // Every model in the catalogue (head and neck cases are reached from their hub page).
        ...catalogue.filter((m) => !m.slug.startsWith('head-neck-')).map((m) => ({ label: t.library.items[m.slug as keyof typeof t.library.items].title, href: m.href })),
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
        { label: f.participate.review, href: mailto('Join clinical review') },
        { label: f.participate.contribute, href: '/contribute' },
        { label: f.participate.sponsor, href: '/#sponsor' },
      ],
    },
    {
      label: f.aboutGroup.label,
      links: [
        { label: f.aboutGroup.about, href: '/about' },
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
      doi: '10.7759/cureus.70822',
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
      doi: '10.3390/cancers18020241',
      ...p.thyroid,
      href: 'https://pubmed.ncbi.nlm.nih.gov/41595161/',
    },
  ];
}

export function contributionPaths(t: Dictionary) {
  const c = t.contribute;
  return [
    { icon: 'health_and_safety', ...c.report, href: '/report' },
    { icon: 'school', ...c.join, href: 'mailto:vivatheca@gmail.com?subject=Join%20clinical%20review' },
    { icon: '3d_rotation', ...c.request, href: '/contribute' },
  ];
}

// Real radiographs and scans shown under the homepage wisdom tooth model.
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
