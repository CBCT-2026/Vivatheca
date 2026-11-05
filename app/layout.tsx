import type { Metadata } from 'next';
import '@fontsource-variable/manrope';
import './globals.css';
import { themeInitScript } from './theme';

export const metadata: Metadata = {
  metadataBase: new URL('https://vivatheca.com'),
  title: 'Vivatheca — Medical models made clear',
  description: 'Free 3D dental and oral surgery models, each with a matched normal, for clinicians making patient education materials. View, download and print.',
  alternates: { canonical: '/' },
  icons: { icon: '/favicon.svg' },
  openGraph: {
    siteName: 'Vivatheca',
    url: '/',
    images: ['/assets/og-image.jpg'],
  },
  twitter: { card: 'summary_large_image' },
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <span hidden aria-hidden="true" dangerouslySetInnerHTML={{ __html: `<!-- ${designContract.replaceAll('--', '—')} -->` }} />
        {children}
      </body>
    </html>
  );
}
