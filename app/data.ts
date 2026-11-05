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
    title: 'Sources you can check',
    text: 'Each model lists the peer-reviewed sources it was checked against, with links, plus what is simplified and a change log of every fix.',
  },
  {
    title: 'A review status visitors can read',
    text: 'Each model shows whether it has been clinically reviewed. When review starts, approved models will show the reviewer’s title, initials, occupation and country of practice; identity checks stay private.',
  },
  {
    title: 'A focused educational assessment',
    text: 'Reviewers will not be asked for medical or health advice. Their role is only to check whether the model shows the named condition well enough for patient education.',
  },
  {
    title: 'Corrections in the open',
    text: 'Anyone can report an inaccuracy. Reports are checked against published sources, and fixes are recorded in the model’s change log.',
  },
  {
    title: 'Public information with a traceable source',
    text: 'Condition and procedure information is drawn only from peer-reviewed research, specialty society guidelines and appropriately licensed public government health-service information. Every statement shows its source (author, year, organisation and link), and pages say where a model simplifies the evidence or where evidence is uncertain.',
  },
];
