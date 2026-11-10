import type { Metadata } from 'next';
import { getI18n } from '../../i18n/server';
import { plain, Ruby } from '../../i18n/ruby';
import { disclaimerHref } from '../../disclaimer-text';
import { Cited, LearnFooter, LearnHeader, SourceList } from '../chrome';
import { cbctReportSources } from '../sources';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: plain(t.learnCbct.metaTitle),
    description: plain(t.learnCbct.metaDescription),
    alternates: { canonical: '/learn/cbct-report' },
  };
}

// Student guide: what a dental CBCT report covers. Written from guidelines and position statements only.
export default async function CbctReportGuide() {
  const { t, furigana } = await getI18n();
  const d = t.learnCbct;
  const cite = t.learn.citeLabel;
  return (
    <>
      <LearnHeader t={t} furigana={furigana} />
      <main id="main-content" className="learn-page">
        <p className="eyebrow"><a href="/learn"><Ruby text={t.learn.forStudents} /></a> · <Ruby text={d.eyebrow} /></p>
        <h1><Ruby text={d.heading} /></h1>
        <p className="learn-lead"><Cited text={d.lead} label={cite} /></p>

        <div className="learn-model-box">
          <p className="learn-review"><strong><Ruby text={t.learn.statusLabel} /></strong> <Ruby text={t.disclaimer.notReviewed} /></p>
          <p><Ruby text={d.notForUse} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a></p>
          <div className="learn-actions">
            <a className="button" href="/learn/slices"><Ruby text={d.openSlices} /></a>
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

        <section aria-labelledby="parts-heading">
          <h2 id="parts-heading"><Ruby text={d.partsHeading} /></h2>
          <p><Cited text={d.partsIntro} label={cite} /></p>
          <ol className="learn-list">
            {d.parts.map((part) => (
              <li key={part.title}><strong><Ruby text={part.title} /></strong> <Cited text={part.text} label={cite} /></li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="questions-by-heading">
          <h2 id="questions-by-heading"><Ruby text={d.byQuestionHeading} /></h2>
          <div className="learn-table-wrap">
            <table className="learn-table">
              <thead><tr>{d.byQuestionColumns.map((column) => <th key={column} scope="col"><Ruby text={column} /></th>)}</tr></thead>
              <tbody>
                {d.byQuestion.map((row) => (
                  <tr key={row.question}>
                    <th scope="row"><Ruby text={row.question} /></th>
                    <td><Cited text={row.when} label={cite} /></td>
                    <td><Cited text={row.covers} label={cite} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

        <section aria-labelledby="explain-heading">
          <h2 id="explain-heading"><Ruby text={d.explainHeading} /></h2>
          <ul className="learn-list">{d.explain.map((text) => <li key={text}><Cited text={text} label={cite} /></li>)}</ul>
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

        <SourceList sources={cbctReportSources} heading={t.learn.sourcesHeading} />
      </main>
      <LearnFooter t={t} />
    </>
  );
}
