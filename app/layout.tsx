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
        { url: '/favicon.ico?v=2', sizes: '48x48' },
        { url: '/favicon.svg?v=2', type: 'image/svg+xml' },
      ],
      apple: '/apple-touch-icon.png?v=2',
    },
    manifest: '/site.webmanifest?v=2',
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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { locale, furigana } = await getI18n();
  return (
    <html lang={localeTags[locale].html} data-furigana={furigana ? 'on' : 'off'} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <I18nProvider locale={locale}>{children}</I18nProvider>
        {/* Free full-text notes beside cited DOIs (public/oa-links.js). */}
        <AfterHydration src="/oa-links.js" />
        {/* Pause 3D auto-rotate while the page scrolls, so scrolling stays smooth (public/scroll-pause.js). */}
        <AfterHydration src="/scroll-pause.js" />
      </body>
    </html>
  );
}
