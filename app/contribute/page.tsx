import type { Metadata } from 'next';
import { PageHeader, SiteFooter } from '../site-chrome';
import { disclaimerHref } from '../disclaimer-text';
import { licence } from '../models/catalogue';
import { getI18n } from '../i18n/server';
import { plain, Ruby } from '../i18n/ruby';
import { ContributeForm } from './contribute-form';

// Submit or request a model. Submissions arrive by email (no uploads, no server storage);
// the review steps are in docs/model-submissions.md.

const schwarz = {
  text: 'Schwarz CG, Kremers WK, Therneau TM, et al. Identification of anonymous MRI research participants with face-recognition software. N Engl J Med. 2019;381(17):1684-1686.',
  href: 'https://doi.org/10.1056/NEJMc1908881',
  doi: 'doi:10.1056/NEJMc1908881',
};

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.submitModel.title,
    description: t.submitModel.description,
    alternates: { canonical: '/contribute' },
    openGraph: { url: '/contribute', images: ['/assets/og-image.jpg'] },
  };
}

export default async function ContributePage({ searchParams }: { searchParams?: Promise<{ kind?: string | string[] }> }) {
  const { t } = await getI18n();
  const c = t.submitModel;
  const params = (await searchParams) ?? {};
  const initialKind = params.kind === 'request' ? 1 : 0;
  return (
    <>
      <a className="skip-link" href="#main-content"><Ruby text={t.common.skip} /></a>
      <PageHeader current="/contribute" />
      <main id="main-content" className="info-page prose-page contribute-page">
        <div className="info-intro">
          <p className="eyebrow"><Ruby text={c.eyebrow} /></p>
          <h1><Ruby text={c.heading} /></h1>
          <p><Ruby text={c.intro} /></p>
          <p className="prototype-note"><strong><Ruby text={c.reviewLead} /></strong> <Ruby text={t.disclaimer.model} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a></p>
        </div>

        <section aria-labelledby="accept-title">
          <h2 id="accept-title"><Ruby text={c.acceptHeading} /></h2>
          <ul>{c.accept.map((item) => <li key={item}><Ruby text={item} /></li>)}</ul>
        </section>

        <section aria-labelledby="cannot-title">
          <h2 id="cannot-title"><Ruby text={c.cannotHeading} /></h2>
          <ul>
            {c.cannot.map((item, index) => (
              <li key={item}><Ruby text={item} />{index === 0 ? <sup><a href="#src-1" aria-label={`${plain(c.sourcesHeading)} 1`}>[1]</a></sup> : null}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="steps-title">
          <h2 id="steps-title"><Ruby text={c.stepsHeading} /></h2>
          <ol>{c.steps.map((item) => <li key={item}><Ruby text={item} /></li>)}</ol>
        </section>

        <section aria-labelledby="licence-title">
          <h2 id="licence-title"><Ruby text={c.licenceHeading} /></h2>
          <p><Ruby text={c.licenceText} /> <a href={licence.href} target="_blank" rel="noreferrer"><Ruby text={c.licenceLink} /></a></p>
        </section>

        <section aria-labelledby="form-title">
          <h2 id="form-title"><Ruby text={c.formHeading} /></h2>
          <p><Ruby text={c.board} /> <a href="/requests"><Ruby text={c.boardLink} /> →</a></p>
          <ContributeForm initialKind={initialKind} />
          <p className="detail-note"><Ruby text={c.emailNote} /></p>
        </section>

        <section aria-labelledby="sources-title">
          <h2 id="sources-title"><Ruby text={c.sourcesHeading} /></h2>
          <ol>
            <li id="src-1" lang="en">{schwarz.text} <a href={schwarz.href} target="_blank" rel="noreferrer">{schwarz.doi}</a></li>
          </ol>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
