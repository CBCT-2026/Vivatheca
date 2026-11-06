import type { Metadata } from 'next';
import { PageHeader, SiteFooter } from './site-chrome';
import { getI18n } from './i18n/server';
import { Ruby } from './i18n/ruby';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.notFound.title, robots: { index: false } };
}

// Shown for any unknown URL, so visitors keep the site header, the disclaimer footer and a way back.
export default async function NotFound() {
  const { t } = await getI18n();
  const n = t.notFound;
  return (
    <>
      <a className="skip-link" href="#main-content"><Ruby text={t.common.skip} /></a>
      <PageHeader />
      <main id="main-content" className="info-page prose-page">
        <div className="info-intro">
          <p className="eyebrow"><Ruby text={n.eyebrow} /></p>
          <h1><Ruby text={n.heading} /></h1>
          <p><Ruby text={n.intro} /></p>
          <p><a href="/models"><Ruby text={n.models} /></a> · <a href="/"><Ruby text={n.home} /></a></p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
