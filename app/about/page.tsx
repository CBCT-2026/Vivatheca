import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader, SiteFooter } from '../site-chrome';
import { disclaimerHref } from '../disclaimer-text';
import { getI18n } from '../i18n/server';
import { Ruby } from '../i18n/ruby';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.about.title,
    description: t.about.description,
    alternates: { canonical: '/about' },
    openGraph: { url: '/about', images: ['/assets/og-image.jpg'] },
  };
}

export default async function AboutPage() {
  const { t } = await getI18n();
  const a = t.about;
  return (
    <>
      <a className="skip-link" href="#main-content"><Ruby text={t.common.skip} /></a>
      <PageHeader current="/about" />
      <main id="main-content" className="info-page prose-page">
        <div className="info-intro">
          <p className="eyebrow"><Ruby text={a.eyebrow} /></p>
          <h1><Ruby text={a.heading} /></h1>
          <p><Ruby text={a.intro} /></p>
        </div>

        <section aria-labelledby="why-title">
          <h2 id="why-title"><Ruby text={a.whyHeading} /></h2>
          {a.why.map((text) => <p key={text}><Ruby text={text} /></p>)}
        </section>

        <section aria-labelledby="principles-title">
          <h2 id="principles-title"><Ruby text={a.principlesHeading} /></h2>
          <ul className="principle-list">
            {a.principles.map((item) => <li key={item.title}><h3><Ruby text={item.title} /></h3><p><Ruby text={item.text} /></p></li>)}
          </ul>
          <p className="prototype-note"><strong><Ruby text={a.reviewLabel} /></strong> <Ruby text={a.reviewText} /> <Ruby text={t.disclaimer.model} /> <Link href={disclaimerHref}><Ruby text={t.disclaimer.full} /></Link></p>
        </section>

        <section aria-labelledby="founder-title">
          <h2 id="founder-title"><Ruby text={a.founderHeading} /></h2>
          <p><strong><Ruby text={a.founderName} /></strong> <Ruby text={a.founder} /></p>
          <p><Ruby text={a.noSponsor} /></p>
        </section>

        <section aria-labelledby="governance-title">
          <h2 id="governance-title"><Ruby text={a.planHeading} /></h2>
          <p><Ruby text={a.plan} /></p>
          <p><Ruby text={a.planUpdate} /></p>
        </section>

        <section aria-labelledby="help-title">
          <h2 id="help-title"><Ruby text={a.helpHeading} /></h2>
          <ul className="plain-list">
            <li><Link href="/report"><Ruby text={a.helpReport} /></Link> <Ruby text={a.helpReportAfter} /></li>
            <li><a href="mailto:hello@vivatheca.com?subject=Join%20clinical%20review"><Ruby text={a.helpReview} /></a> <Ruby text={a.helpReviewAfter} /></li>
            <li><a href="mailto:hello@vivatheca.com?subject=Model%20request"><Ruby text={a.helpRequest} /></a> <Ruby text={a.helpRequestAfter} /></li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
