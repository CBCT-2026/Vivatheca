import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader, SiteFooter } from '../site-chrome';
import { catalogue, licence } from './catalogue';
import { disclaimerHref } from '../disclaimer-text';
import { format } from '../i18n/dictionaries';
import { getI18n } from '../i18n/server';
import { plain, Ruby } from '../i18n/ruby';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.library.title,
    description: t.library.description,
    alternates: { canonical: '/models' },
    openGraph: { url: '/models', images: ['/assets/og-image.jpg'] },
  };
}

// Static pages under public/ need their trailing slash, which next/link removes.
function CardLink({ href, children }: { href: string; children: React.ReactNode }) {
  return href.endsWith('/') ? <a href={href} className="library-card-link">{children}</a> : <Link href={href} className="library-card-link">{children}</Link>;
}

export default async function ModelsPage() {
  const { t } = await getI18n();
  const l = t.library;
  return (
    <>
      <a className="skip-link" href="#main-content"><Ruby text={t.common.skip} /></a>
      <PageHeader current="/models" />
      <main id="main-content" className="info-page">
        <div className="info-intro">
          <p className="eyebrow"><Ruby text={l.eyebrow} /></p>
          <h1><Ruby text={l.heading} /></h1>
          <p><Ruby text={l.intro} /> <a href={licence.href} target="_blank" rel="noreferrer">{licence.name}</a>.</p>
          <p className="prototype-note"><strong><Ruby text={l.reviewLead} /></strong> <Ruby text={t.disclaimer.model} /> <Link href={disclaimerHref}><Ruby text={t.disclaimer.full} /></Link></p>
        </div>

        <ul className="library-grid" aria-label={plain(l.listLabel)}>
          {catalogue.map((model) => {
            const item = l.items[model.slug];
            return (
              <li key={model.slug} className="library-card">
                <CardLink href={model.href}>
                  <img src={model.image} alt="" width="1200" height="800" loading="lazy" />
                  <div className="library-card-body">
                    <p className="library-meta"><Ruby text={item.specialty} /></p>
                    <h2><Ruby text={item.title} /></h2>
                    <p><Ruby text={item.summary} /></p>
                    <ul className="library-tags" aria-label={plain(l.factsLabel)}>
                      <li><Ruby text={item.pairing} /></li>
                      <li>{format(l.version, { v: model.version })}</li>
                      <li><Ruby text={l.notReviewed} /></li>
                    </ul>
                  </div>
                </CardLink>
              </li>
            );
          })}
        </ul>

        <section className="library-next" aria-labelledby="next-title">
          <h2 id="next-title"><Ruby text={l.nextHeading} /></h2>
          <p><Ruby text={l.nextText} /></p>
          <p><Ruby text={l.askText} /> <Link href="/report"><Ruby text={l.askLink} /></Link>.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
