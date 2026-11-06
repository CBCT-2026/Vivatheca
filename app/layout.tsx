import type { Metadata } from 'next';
import '@fontsource-variable/manrope';
import './globals.css';
import { themeInitScript } from './theme';
import { AfterHydration } from './script-mount';
import { localeTags } from './i18n/config';
import { I18nProvider } from './i18n/context';
import { getI18n } from './i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    metadataBase: new URL('https://vivatheca.com'),
    title: t.meta.title,
    description: t.meta.description,
    alternates: { canonical: '/' },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
      ],
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    openGraph: {
      siteName: 'Vivatheca',
      title: t.meta.title,
      description: t.meta.socialDescription,
      url: '/',
      locale: localeTags[locale].og,
      images: ['/assets/og-image.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.meta.title,
      description: t.meta.socialDescription,
      images: ['/assets/og-image.jpg'],
    },
  };
}

const designContract = `
THESIS: Put a working clinical teaching model at the centre and refuse the generic medical charity brochure.
OWN-WORLD: Deep navy consultation-light-table surfaces, cyan illuminated anatomy, warm paper fields, coral only for affected anatomy, Manrope, fine rules and layered teaching-film imagery.
STORY: Understand the model, trust its limits and review state, then explore, share, print or contribute.
FIRST VIEWPORT: Plain-language promise and two actions on the left; a human consultation illustration occupies the right and leads directly into the working 3D model.
FORM: Consultation light table, grounded direction five, seed a6eca7a4.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { locale, furigana } = await getI18n();
  return (
    <html lang={localeTags[locale].html} data-furigana={furigana ? 'on' : 'off'} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <span hidden aria-hidden="true" dangerouslySetInnerHTML={{ __html: `<!-- ${designContract.replaceAll('--', '—')} -->` }} />
        <I18nProvider locale={locale}>{children}</I18nProvider>
        {/* Free full-text notes beside cited DOIs (public/oa-links.js). */}
        <AfterHydration src="/oa-links.js" />
      </body>
    </html>
  );
}
