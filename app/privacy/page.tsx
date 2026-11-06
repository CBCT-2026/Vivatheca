import type { Metadata } from 'next';
import { PageHeader, SiteFooter } from '../site-chrome';
import { getI18n } from '../i18n/server';
import { Ruby } from '../i18n/ruby';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.privacy.title,
    description: t.privacy.description,
    alternates: { canonical: '/privacy' },
    openGraph: { url: '/privacy', images: ['/assets/og-image.jpg'] },
  };
}

export default async function PrivacyPage() {
  const { t } = await getI18n();
  const p = t.privacy;
  return (
    <>
      <a className="skip-link" href="#main-content"><Ruby text={t.common.skip} /></a>
      <PageHeader />
      <main id="main-content" className="info-page prose-page">
        <div className="info-intro">
          <p className="eyebrow"><Ruby text={p.eyebrow} /></p>
          <h1><Ruby text={p.heading} /></h1>
          <p><Ruby text={p.intro} /></p>
        </div>

        {p.sections.map((section) => (
          <section key={section.id} aria-labelledby={section.id}>
            <h2 id={section.id}><Ruby text={section.heading} /></h2>
            <p>
              <Ruby text={section.text} />
              {section.id === 'hosting' ? <> <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer"><Ruby text={p.cloudflarePolicy} /></a>.</> : null}
            </p>
          </section>
        ))}

        <section aria-labelledby="contact">
          <h2 id="contact"><Ruby text={p.contactHeading} /></h2>
          <p><Ruby text={p.contact} /> <a href="mailto:hello@vivatheca.com?subject=Privacy%20question">hello@vivatheca.com</a>.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
