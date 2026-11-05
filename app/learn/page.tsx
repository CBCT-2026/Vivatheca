import type { Metadata } from 'next';
import Link from 'next/link';
import { getI18n } from '../i18n/server';
import { plain, Ruby } from '../i18n/ruby';
import { disclaimerHref } from '../disclaimer-text';
import { LearnFooter, LearnHeader } from './chrome';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: plain(t.learn.metaTitle),
    description: plain(t.learn.metaDescription),
    alternates: { canonical: '/learn' },
  };
}

const guideLinks = {
  development: { guide: '/learn/development', model: '/development/' },
  orthognathic: { guide: null, model: '/orthognathic/' },
  wisdom: { guide: null, model: '/#collection' },
} as const;

export default async function LearnPage() {
  const { t, furigana } = await getI18n();
  const l = t.learn;
  return (
    <>
      <LearnHeader t={t} furigana={furigana} />
      <main id="main-content" className="learn-page">
        <p className="eyebrow"><Ruby text={l.eyebrow} /></p>
        <h1><Ruby text={l.heading} /></h1>
        <p className="learn-lead"><Ruby text={l.lead} /></p>

        <section aria-labelledby="differ-heading">
          <h2 id="differ-heading"><Ruby text={l.differHeading} /></h2>
          <div className="learn-compare">
            {[l.patientPages, l.studentPages].map((item) => (
              <article key={item.title}><h3><Ruby text={item.title} /></h3><p><Ruby text={item.text} /></p></article>
            ))}
          </div>
          <p className="learn-note"><Ruby text={l.differNote} /></p>
        </section>

        <section aria-labelledby="audience-heading">
          <h2 id="audience-heading"><Ruby text={l.audienceHeading} /></h2>
          <ul className="learn-list">
            <li><Ruby text={l.dental} /></li>
            <li><Ruby text={l.medical} /></li>
          </ul>
        </section>

        <section aria-labelledby="guides-heading">
          <h2 id="guides-heading"><Ruby text={l.guidesHeading} /></h2>
          <div className="learn-guides">
            {(Object.keys(guideLinks) as (keyof typeof guideLinks)[]).map((key) => {
              const guide = l.guides[key];
              const links = guideLinks[key];
              return (
                <article key={key} className="learn-guide">
                  <p className="learn-status"><Ruby text={guide.status} /></p>
                  <h3><Ruby text={guide.title} /></h3>
                  <p><Ruby text={guide.text} /></p>
                  <p className="learn-review"><strong><Ruby text={l.statusLabel} /></strong> <Ruby text={t.disclaimer.notReviewed} /></p>
                  <div className="learn-actions">
                    {links.guide ? <Link className="button" href={links.guide}><Ruby text={l.openGuide} /></Link> : null}
                    <a className={links.guide ? 'button button-secondary' : 'button'} href={links.model}><Ruby text={l.openModel} /></a>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="learn-model-disclaimer"><Ruby text={t.disclaimer.model} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a></p>
        </section>

        <section aria-labelledby="using-heading">
          <h2 id="using-heading"><Ruby text={l.usingHeading} /></h2>
          <ul className="learn-list">{l.using.map((item) => <li key={item}><Ruby text={item} /></li>)}</ul>
        </section>

        <aside className="learn-switch" aria-labelledby="patients-heading">
          <h2 id="patients-heading"><Ruby text={l.patientsHeading} /></h2>
          <p><Ruby text={l.patientsText} /></p>
          <div className="learn-actions">
            <Link className="button button-secondary" href="/"><Ruby text={l.patientsLink} /></Link>
            <Link className="button button-secondary" href="/create"><Ruby text={t.nav.createInfo} /></Link>
          </div>
        </aside>
      </main>
      <LearnFooter t={t} />
    </>
  );
}
