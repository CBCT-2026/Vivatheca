import type { Metadata } from 'next';
import { getI18n } from '../../i18n/server';
import { plain, Ruby } from '../../i18n/ruby';
import { disclaimerHref } from '../../disclaimer-text';
import { Cited, LearnFooter, LearnHeader, SourceList } from '../chrome';
import { slicesSources } from '../sources';
import { SlicesUI } from './slices-ui';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: plain(t.learnSlices.metaTitle),
    description: plain(t.learnSlices.metaDescription),
    alternates: { canonical: '/learn/slices' },
  };
}

// Virtual scans in public/slices/, made by tools/cbct/voxelize.py from the site's own GLB models.
const volumes = [
  { id: 'wisdom-tooth', file: '/slices/wisdom-tooth.nvol', model: '/models/impacted-wisdom-tooth' },
  { id: 'scc-before', file: '/slices/scc-before.nvol', model: '/head-neck/scc/' },
  { id: 'scc-after', file: '/slices/scc-after.nvol', model: '/head-neck/scc/' },
] as const;

export default async function SlicesPage() {
  const { t, furigana } = await getI18n();
  const d = t.learnSlices;
  const cite = t.learn.citeLabel;
  const ui = {
    volumes: volumes.map((v) => ({ ...v, label: plain(d.volumes[v.id].label) })),
    views: Object.fromEntries(Object.entries(d.views).map(([k, v]) => [k, plain(v)])),
    windows: Object.fromEntries(Object.entries(d.windows).map(([k, v]) => [k, plain(v)])),
    labels: { volume: plain(d.volumeLabel), view: plain(d.viewLabel), window: plain(d.windowLabel), loading: plain(d.loading), failed: plain(d.failed), position: plain(d.position), openModel: plain(t.learn.openModel) },
  };
  return (
    <>
      <LearnHeader t={t} furigana={furigana} />
      <main id="main-content" className="learn-page learn-slices">
        <p className="eyebrow"><a href="/learn"><Ruby text={t.learn.forStudents} /></a> · <Ruby text={d.eyebrow} /></p>
        <h1><Ruby text={d.heading} /></h1>
        <p className="learn-lead"><Cited text={d.lead} label={cite} /></p>

        <div className="learn-model-box">
          <p className="learn-review"><strong><Ruby text={t.learn.statusLabel} /></strong> <Ruby text={t.disclaimer.notReviewed} /></p>
          <p><Ruby text={d.notPatient} /></p>
          <p><Ruby text={t.disclaimer.model} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a></p>
        </div>

        <SlicesUI {...ui} />

        <section aria-labelledby="reading-heading">
          <h2 id="reading-heading"><Ruby text={d.readingHeading} /></h2>
          <ul className="learn-list">
            {d.reading.map((item) => <li key={item}><Cited text={item} label={cite} /></li>)}
          </ul>
        </section>

        <section aria-labelledby="values-heading">
          <h2 id="values-heading"><Ruby text={d.valuesHeading} /></h2>
          <p><Cited text={d.valuesIntro} label={cite} /></p>
          <div className="learn-table-wrap" tabIndex={0}>
            <table className="learn-table">
              <thead><tr><th scope="col"><Ruby text={d.valuesPart} /></th><th scope="col"><Ruby text={d.valuesHu} /></th></tr></thead>
              <tbody>
                {d.values.map((row) => <tr key={row.part}><th scope="row"><Ruby text={row.part} /></th><td>{row.hu}</td></tr>)}
              </tbody>
            </table>
          </div>
          <p className="learn-note"><Cited text={d.valuesNote} label={cite} /></p>
        </section>

        <section aria-labelledby="simplify-heading" className="learn-uncertain">
          <h2 id="simplify-heading"><Ruby text={d.simplifyHeading} /></h2>
          <ul className="learn-list">
            {d.simplify.map((item) => <li key={item}><Cited text={item} label={cite} /></li>)}
          </ul>
        </section>

        <section aria-labelledby="how-heading">
          <h2 id="how-heading"><Ruby text={d.howHeading} /></h2>
          <p><Cited text={d.how} label={cite} /></p>
        </section>

        <SourceList sources={slicesSources} heading={plain(t.learn.sourcesHeading)} />
      </main>
      <LearnFooter t={t} />
    </>
  );
}
