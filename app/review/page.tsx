import type { Metadata } from 'next';
import { getI18n } from '../i18n/server';
import { InfoShell } from '../info-shell';
import { Ruby } from '../i18n/ruby';
import { format } from '../i18n/dictionaries';
import { catalogue } from '../models/catalogue';
import { currentReview, reviewsOf } from '../models/reviews';
import { mailto } from '../contact';

// Clinical review (unbuilt-features #6): how sign-off works, the checklist, and the sign-off record
// for every catalogue model (records in app/models/reviews.ts; procedure in docs/clinical-review.md).
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.review.title, description: t.review.description, alternates: { canonical: '/review' } };
}

export default async function ReviewPage() {
  const { t } = await getI18n();
  const r = t.review;
  const items = t.library.items as Record<string, { title: string }>;
  // Copied from the full disclaimer (app/disclaimer-text.ts), not reworded.
  const limit = t.disclaimer.sections[1]?.paragraphs[1] ?? '';
  return (
    <InfoShell eyebrow={r.eyebrow} heading={r.heading} intro={r.intro}>
      <section className="detail-block">
        <h2><Ruby text={r.howHeading} /></h2>
        <ol>{r.steps.map((s, i) => <li key={i}><Ruby text={s} /></li>)}</ol>
      </section>
      <section className="detail-block">
        <h2><Ruby text={r.checksHeading} /></h2>
        <ul>{Object.entries(r.checks).map(([k, v]) => <li key={k}><Ruby text={v} /></li>)}</ul>
      </section>
      <section className="detail-block" id="record">
        <h2><Ruby text={r.recordHeading} /></h2>
        <div className="table-scroll" tabIndex={0}>
          <table className="review-table">
            <thead><tr><th scope="col"><Ruby text={r.model} /></th><th scope="col"><Ruby text={r.version} /></th><th scope="col"><Ruby text={r.statusCol} /></th></tr></thead>
            <tbody>
              {catalogue.map((m) => {
                const now = currentReview(m.slug);
                const older = reviewsOf(m.slug).filter((x) => x !== now);
                return (
                  <tr key={m.slug} id={`review-${m.slug}`}>
                    <th scope="row"><a href={m.href}><Ruby text={items[m.slug]?.title ?? m.slug} /></a></th>
                    <td>{m.version}</td>
                    <td>
                      {now ? <Ruby text={format(r.reviewed, { name: now.reviewer, credentials: now.credentials, date: now.date })} /> : <Ruby text={r.none} />}
                      {older.map((x) => <div key={x.version + x.date} className="detail-note"><Ruby text={x.outcome === 'approved' ? format(r.older, { v: x.version, date: x.date }) : r.changes + ` (${x.version}, ${x.date})`} /></div>)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="detail-block">
        <h2><Ruby text={r.limitHeading} /></h2>
        <p><Ruby text={limit} /></p>
      </section>
      <section className="detail-block">
        <h2><Ruby text={r.joinHeading} /></h2>
        <p><Ruby text={r.joinText} /></p>
        <p><a className="button" href={mailto('Join clinical review')}><Ruby text={r.joinLink} /></a></p>
      </section>
    </InfoShell>
  );
}
