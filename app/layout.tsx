import type { Metadata } from 'next';
import '@fontsource-variable/manrope';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://vivatheca.com'),
  title: 'Vivatheca — Medical models made clear',
  description: 'Free, browser-based 3D medical models for clearer clinical conversations, learning, sharing and printing.',
  alternates: { canonical: '/' },
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Vivatheca — Medical models made clear',
    description: 'Explore free, browser-based 3D medical models designed for clearer clinical conversations.',
    url: '/',
    images: ['/assets/consultation-hero.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vivatheca — Medical models made clear',
    description: 'Explore free, browser-based 3D medical models designed for clearer clinical conversations.',
    images: ['/assets/consultation-hero.webp'],
  },
};

const designContract = `
THESIS: Put a working clinical teaching model at the centre and refuse the generic medical charity brochure.
OWN-WORLD: Deep navy consultation-light-table surfaces, cyan illuminated anatomy, warm paper fields, coral only for affected anatomy, Manrope, fine rules and layered teaching-film imagery.
STORY: Understand the model, trust its limits and review state, then explore, share, print or contribute.
FIRST VIEWPORT: Plain-language promise and two actions on the left; a human consultation illustration occupies the right and leads directly into the working 3D model.
FORM: Consultation light table, grounded direction five, seed a6eca7a4.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <span hidden aria-hidden="true" dangerouslySetInnerHTML={{ __html: `<!-- ${designContract.replaceAll('--', '—')} -->` }} />
        {children}
      </body>
    </html>
  );
}
