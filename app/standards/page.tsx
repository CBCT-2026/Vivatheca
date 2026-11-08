import type { Metadata } from 'next';
import { getI18n } from '../i18n/server';
import { InfoShell } from '../info-shell';
import { Ruby } from '../i18n/ruby';
import { format } from '../i18n/dictionaries';
import { Cited, SourceList } from '../learn/chrome';
import { disclaimerHref } from '../disclaimer-text';
import { mailto } from '../contact';
import { disciplines } from '../models/disciplines';
import { standardsSources } from './sources';
import { editorialBoard, languageLeads, sectionEditors, type Volunteer } from './roles';

// Content standards and funding (anatomy apps and nonprofits review #3, #9 and #10, Luke 2026-11-08):
// minimum sources, how figures are chosen, who reviews, what the review status means, volunteer
// section editors and language leads (unpaid), and the funding and conflict-of-interest policy.
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.standards.title, description: t.standards.description, alternates: { canonical: '/standards' } };
}

export default async function StandardsPage() {
  const { t } = await getI18n();
  const s = t.standards;
  const cite = s.citeLabel;
  const person = (v: Volunteer | null, empty: string) => (v ? format(s.named, { name: v.name, credentials: v.credentials, since: v.since }) : empty);
  return (
    <InfoShell eyebrow={s.eyebrow} heading={s.heading} intro={s.intro}>
      <p className="detail-note"><Ruby text={s.updated} /></p>

      <section className="detail-block" id="sources">
        <h2><Ruby text={s.sourcesHeading} /></h2>
        {s.sources.map((p) => <p key={p}><Cited text={p} label={cite} /></p>)}
      </section>

      <section className="detail-block" id="figures">
        <h2><Ruby text={s.figuresHeading} /></h2>
        {s.figures.map((p) => <p key={p}><Cited text={p} label={cite} /></p>)}
      </section>

      <section className="detail-block" id="review">
        <h2><Ruby text={s.reviewHeading} /></h2>
        <ol className="standards-list">{s.reviewSteps.map((p) => <li key={p}><Cited text={p} label={cite} /></li>)}</ol>
        <h3><Ruby text={s.statusHeading} /></h3>
        <p><Ruby text={s.status} /> <a href="/review"><Ruby text={s.reviewLink} /></a></p>
        <p className="prototype-note"><Ruby text={t.disclaimer.model} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a></p>
      </section>

      <section className="detail-block" id="editors">
        <h2><Ruby text={s.editorsHeading} /></h2>
        <p><Cited text={s.editorsIntro} label={cite} /></p>
        <div className="table-scroll" tabIndex={0}>
          <table className="review-table">
            <thead><tr><th scope="col"><Ruby text={s.sectionCol} /></th><th scope="col"><Ruby text={s.editorCol} /></th></tr></thead>
            <tbody>
              {disciplines.map((d) => (
                <tr key={d}><th scope="row"><a href={`/models?discipline=${d}`}><Ruby text={t.footer.disciplines.items[d]} /></a></th><td><Ruby text={person(sectionEditors[d], s.pending)} /></td></tr>
              ))}
              <tr><th scope="row"><Ruby text={s.boardLabel} /></th><td><Ruby text={editorialBoard.length ? editorialBoard.map((v) => person(v, '')).join('; ') : s.pending} /></td></tr>
            </tbody>
          </table>
        </div>
        <h3><Ruby text={s.dutiesHeading} /></h3>
        <ul className="standards-list">{s.editorDuties.map((p) => <li key={p}><Ruby text={p} /></li>)}</ul>
        <p><a className="button" href={mailto('Volunteer: section editor')}><Ruby text={s.editorsJoin} /></a></p>
      </section>

      <section className="detail-block" id="language-leads">
        <h2><Ruby text={s.leadsHeading} /></h2>
        <p><Cited text={s.leadsIntro} label={cite} /></p>
        <div className="table-scroll" tabIndex={0}>
          <table className="review-table">
            <thead><tr><th scope="col"><Ruby text={s.languageCol} /></th><th scope="col"><Ruby text={s.leadCol} /></th></tr></thead>
            <tbody>
              {languageLeads.map((l) => (
                <tr key={l.lang}><th scope="row"><Ruby text={s.languages[l.lang]} /></th><td><Ruby text={person(l.lead, l.later ? s.later : s.open)} /></td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3><Ruby text={s.dutiesHeading} /></h3>
        <ul className="standards-list">{s.leadDuties.map((p) => <li key={p}><Cited text={p} label={cite} /></li>)}</ul>
        <p><a className="button" href={mailto('Volunteer: language lead')}><Ruby text={s.leadsJoin} /></a></p>
      </section>

      <section className="detail-block" id="volunteering">
        <h2><Ruby text={s.volunteerHeading} /></h2>
        {s.volunteer.map((p) => <p key={p}><Cited text={p} label={cite} /></p>)}
      </section>

      <section className="detail-block" id="funding">
        <h2><Ruby text={s.fundingHeading} /></h2>
        <p><Ruby text={s.fundingNow} /></p>
        <ul className="standards-list">{s.policy.map((p) => <li key={p}><Cited text={p} label={cite} /></li>)}</ul>
        <h3><Ruby text={s.supportersHeading} /></h3>
        <p><Ruby text={s.supporters} /></p>
        <h3 id="interests"><Ruby text={s.interestsHeading} /></h3>
        <p><Cited text={s.interests} label={cite} /></p>
        <p><Ruby text={s.founderInterest} /></p>
        <p className="detail-note"><Ruby text={s.draft} /></p>
        <p><a href="/#sponsor"><Ruby text={s.sponsorLink} /></a></p>
      </section>

      <SourceList sources={standardsSources} heading={s.sourcesListHeading} />
    </InfoShell>
  );
}
