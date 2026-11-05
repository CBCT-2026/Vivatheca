import type { Dictionary } from './i18n/dictionaries';

// Links and icons stay here; their words come from the dictionary for the visitor's language.

export function footerGroups(t: Dictionary) {
  const f = t.footer;
  return [
    {
      label: f.explore.label,
      links: [
        { label: f.library, href: '/models' },
        { label: f.wisdomTooth, href: '/models/impacted-wisdom-tooth' },
        { label: f.development, href: '/development/' },
        { label: f.orthognathic, href: '/orthognathic/' },
        { label: t.nav.createInfo, href: '/create' },
      ],
    },
    {
      label: f.participate.label,
      links: [
        { label: f.report, href: '/report' },
        { label: f.participate.review, href: 'mailto:hello@vivatheca.com?subject=Join%20clinical%20review' },
        { label: f.participate.contribute, href: 'mailto:hello@vivatheca.com?subject=Contribute%20a%20model' },
        { label: f.participate.sponsor, href: '/#sponsor' },
      ],
    },
    {
      label: f.aboutGroup.label,
      links: [
        { label: f.aboutGroup.about, href: '/about' },
        { label: f.aboutGroup.privacy, href: '/privacy' },
        { label: f.aboutGroup.contact, href: 'mailto:hello@vivatheca.com' },
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
    { icon: 'school', ...c.join, href: 'mailto:hello@vivatheca.com?subject=Join%20clinical%20review' },
    { icon: '3d_rotation', ...c.request, href: 'mailto:hello@vivatheca.com?subject=Model%20request' },
  ];
}
