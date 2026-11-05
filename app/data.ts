export const footerGroups = [
  {
    label: 'Explore',
    links: [
      { label: 'Model library', href: '/models' },
      { label: 'Impacted wisdom tooth', href: '/models/impacted-wisdom-tooth' },
      { label: 'Dental development, ages 6 to 12', href: '/development/' },
      { label: 'Create patient information', href: '/create' },
    ],
  },
  {
    label: 'Participate',
    links: [
      { label: 'Report an inaccuracy', href: '/report' },
      { label: 'Join clinical review', href: 'mailto:hello@vivatheca.com?subject=Join%20clinical%20review' },
      { label: 'Contribute a model', href: 'mailto:hello@vivatheca.com?subject=Contribute%20a%20model' },
      { label: 'Sponsor a model', href: '/#sponsor' },
    ],
  },
  {
    label: 'About',
    links: [
      { label: 'About Vivatheca', href: '/about' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Contact', href: 'mailto:hello@vivatheca.com' },
    ],
  },
];

export const understandingPaths = [
  { icon: '3d_rotation', title: 'Explore it in 3D', text: 'Rotate, zoom and follow a captioned tour with keyboard and touch controls.' },
  { icon: 'menu_book', title: 'Explain it clearly', text: 'Switch between plain-language guidance and deeper clinical detail.' },
  { icon: 'print', title: 'Take it further', text: 'Share the model, view it in AR on your phone, or download the STL to print it.' },
];

export const trustItems = [
  {
    title: 'A review status visitors can read',
    text: 'Each model record is designed to show whether it is approved, rejected or awaiting clinical review, its model rating, and whether it has been recommended for review by clinicians.',
  },
  {
    title: 'Private verification, limited public attribution',
    text: 'A clinician’s identity and eligibility to review are verified privately. The public record is limited to the reviewer’s title, initials, occupation and country of practice.',
  },
  {
    title: 'A focused educational assessment',
    text: 'Reviewers are not asked to provide medical or health advice, or information about the procedure or condition. Their role is only to approve or reject whether the model reflects the named condition or procedure well enough for patient education.',
  },
  {
    title: 'Public information with a traceable source',
    text: 'Condition and procedure information is drawn from appropriately licensed public government health-service information, with source attribution and directions showing where to access further information.',
  },
];
