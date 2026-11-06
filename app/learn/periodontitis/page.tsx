import type { Metadata } from 'next';
import { getI18n } from '../../i18n/server';
import { plain, Ruby } from '../../i18n/ruby';
import { disclaimerHref } from '../../disclaimer-text';
import { Cited, LearnFooter, LearnHeader, SourceList } from '../chrome';
import { perioSources } from '../sources';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: plain(t.learnPerio.metaTitle),
    description: plain(t.learnPerio.metaDescription),
    alternates: { canonical: '/learn/periodontitis' },
  };
}

export default async function PeriodontitisGuide() {
  const { t, furigana } = await getI18n();
  const d = t.learnPerio;
  const cite = t.learn.citeLabel;
  return (
    <>
      <LearnHeader t={t} furigana={furigana} />
      <main id="main-content" className="learn-page">
        <p className="eyebrow"><a href="/learn"><Ruby text={t.learn.forStudents} /></a> · <Ruby text={d.eyebrow} /></p>
        <h1><Ruby text={d.heading} /></h1>
        <p className="learn-lead"><Ruby text={d.lead} /></p>

        <div className="learn-model-box">
          <p className="learn-review"><strong><Ruby text={t.learn.statusLabel} /></strong> <Ruby text={t.disclaimer.notReviewed} /></p>
          <p><Ruby text={t.disclaimer.model} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a></p>
          <div className="learn-actions">
            <a className="button" href="/periodontitis/"><Ruby text={d.openModel} /></a>
          </div>
        </div>

        <section aria-labelledby="objectives-heading">
          <h2 id="objectives-heading"><Ruby text={d.objectivesHeading} /></h2>
          <ul className="learn-list">{d.objectives.map((item) => <li key={item}><Ruby text={item} /></li>)}</ul>
        </section>

        <section aria-labelledby="terms-heading">
          <h2 id="terms-heading"><Ruby text={d.termsHeading} /></h2>
          <dl className="learn-terms">
            {d.terms.map((term) => (
              <div key={term.term}><dt><Ruby text={term.term} /></dt><dd><Cited text={term.text} label={cite} /></dd></div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="mechanics-heading">
          <h2 id="mechanics-heading"><Ruby text={d.mechanicsHeading} /></h2>
          {d.mechanics.map((text) => <p key={text}><Cited text={text} label={cite} /></p>)}
        </section>

        <section aria-labelledby="evidence-heading">
          <h2 id="evidence-heading"><Ruby text={d.evidenceHeading} /></h2>
          <div className="learn-table-wrap">
            <table className="learn-table">
              <thead><tr>{d.evidenceColumns.map((column) => <th key={column} scope="col"><Ruby text={column} /></th>)}</tr></thead>
              <tbody>
                {d.evidence.map((row) => (
                  <tr key={row.study}>
                    <th scope="row"><Cited text={row.study} label={cite} /></th>
                    <td><Ruby text={row.design} /></td>
                    <td><Cited text={row.finding} label={cite} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="uncertain-heading" className="learn-uncertain">
          <h2 id="uncertain-heading"><Ruby text={d.uncertainHeading} /></h2>
          {d.uncertain.map((text) => <p key={text}><Cited text={text} label={cite} /></p>)}
        </section>

        <section aria-labelledby="simplify-heading">
          <h2 id="simplify-heading"><Ruby text={d.simplifyHeading} /></h2>
          <ul className="learn-list">{d.simplify.map((text) => <li key={text}><Cited text={text} label={cite} /></li>)}</ul>
        </section>

        <section aria-labelledby="questions-heading">
          <h2 id="questions-heading"><Ruby text={d.questionsHeading} /></h2>
          {d.questions.map((item) => (
            <details key={item.q} className="learn-question">
              <summary><Ruby text={item.q} /></summary>
              <p><Cited text={item.a} label={cite} /></p>
            </details>
          ))}
        </section>

        <SourceList sources={perioSources} heading={t.learn.sourcesHeading} />
      </main>
      <LearnFooter t={t} />
    </>
  );
}
