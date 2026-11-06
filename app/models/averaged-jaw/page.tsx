import type { Metadata } from 'next';
import { JsonLd } from '../json-ld';
import { modelJsonLd } from '../jsonld';
import { AfterHydration } from '../../script-mount';
import { PageHeader, SiteFooter } from '../../site-chrome';
import { catalogue, formatDate, licence } from '../catalogue';
import { Cited, SourceList } from '../../learn/chrome';
import { CopyCitation } from '../impacted-wisdom-tooth/copy-citation';
import { disclaimerHref } from '../../disclaimer-text';
import { localeTags } from '../../i18n/config';
import { VideoSection } from '../../video-section';
import { format } from '../../i18n/dictionaries';
import { ShowActions } from '../../show/quick';
import { getI18n } from '../../i18n/server';
import { plain, Ruby } from '../../i18n/ruby';
import { averagedJawSources, collections } from './sources';
import { TermSources } from '../terms';
import { AveragedJawViewer } from './viewer';
import provenanceJson from './provenance.json';

type Scan = { scan: string; collection_id: string; PatientID: string; PatientAge?: string | null; PatientSex?: string | null; SeriesDescription?: string | null; source_DOI?: string | null; license_short_name?: string | null; voxel_mm: number[]; mandible_cm3: number; icp_mean_mm: number };
type Provenance = { n: number; pitch_mm: number; scans_used: Scan[]; parts: Record<string, { faces: number; volume_cm3: number }>; files: { glb: string; stl: string } };
const provenance = provenanceJson as Provenance;

// Averaged jaw: the mean mandible, teeth and skull base of several open CT scans (tools/segment). No single person.
const model = catalogue.find((item) => item.slug === 'averaged-jaw')!;
export const averagedJawFiles = {
  glb: { href: '/models/averaged-jaw/averaged-jaw.glb', size: provenance.files.glb },
  stl: { href: '/models/averaged-jaw/averaged-jaw-mandible.stl', size: provenance.files.stl },
  provenance: { href: '/models/averaged-jaw/provenance.json' },
};
export const averagedJawCitation = `Seifert L. Vivatheca: Mean adult mandible and mandibular dentition (statistical average of open CT scans), version ${model.version}. 2026. https://vivatheca.com/models/averaged-jaw. Licensed under CC BY-SA 4.0. Accessed [date].`;

const scanRow = (s: Scan) => {
  const c = collections[s.collection_id] ?? { name: s.collection_id, doi: '', licence: s.license_short_name ?? '' };
  return { ...s, collection: c.name, doi: c.doi, licence: c.licence };
};

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  const item = t.library.items[model.slug];
  return {
    title: `${plain(item.title)} — Vivatheca`,
    description: plain(item.summary),
    alternates: { canonical: model.href },
    openGraph: { url: model.href, images: [model.image] },
  };
}

export default async function AveragedJawPage() {
  const { t, locale } = await getI18n();
  const item = t.library.items[model.slug];
  const d = t.averagedJaw;
  const cite = t.learn.citeLabel;
  const rows = provenance.scans_used.map(scanRow);
  const usedCollections = Object.entries(collections).filter(([id]) => rows.some((r) => r.collection_id === id));
  return (
    <>
      <JsonLd data={modelJsonLd('averaged-jaw')} />
      <a className="skip-link" href="#main-content"><Ruby text={t.common.skip} /></a>
      <PageHeader current="/models" />
      <main id="main-content" className="info-page model-page averaged-jaw-page">
        <nav className="breadcrumb" aria-label={plain(t.wisdom.breadcrumb)}><a href="/models"><Ruby text={t.library.eyebrow} /></a><span aria-hidden="true">/</span><span aria-current="page"><Ruby text={item.title} /></span></nav>
        <div className="info-intro">
          <p className="eyebrow"><Ruby text={item.specialty} /></p>
          <h1><Ruby text={item.title} /></h1>
          <TermSources label={t.library.termsLabel} terms={model.terms} />
          <ShowActions slug="averaged-jaw" />
          <p><Cited text={d.lead} label={cite} /></p>
        </div>

        <div className="learn-model-box">
          <p className="learn-review"><strong><Ruby text={t.learn.statusLabel} /></strong> <Ruby text={t.disclaimer.notReviewed} /></p>
          <p><Ruby text={format(d.notPerson, { n: provenance.n })} /></p>
          <p><Ruby text={t.disclaimer.model} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a></p>
        </div>

        <AveragedJawViewer src={averagedJawFiles.glb.href} alt={plain(d.alt)} />
        <div data-vt-share="" data-vt-scope=".averaged-jaw-experience" />
        <AfterHydration src="/share-tools.js" />
        <VideoSection slug="averaged-jaw" />

        <section aria-labelledby="what-heading" className="detail-block">
          <h2 id="what-heading"><Ruby text={d.whatHeading} /></h2>
          <ul className="learn-list">
            {d.what.map((line) => <li key={line}><Cited text={line} label={cite} /></li>)}
          </ul>
        </section>

        <section aria-labelledby="scans-heading" className="detail-block">
          <h2 id="scans-heading"><Ruby text={format(d.scansHeading, { n: provenance.n })} /></h2>
          <p><Cited text={d.scansIntro} label={cite} /></p>
          <div className="learn-table-wrap" tabIndex={0}>
            <table className="learn-table averaged-jaw-table">
              <thead>
                <tr>
                  <th scope="col"><Ruby text={d.colCollection} /></th>
                  <th scope="col"><Ruby text={d.colPatient} /></th>
                  <th scope="col"><Ruby text={d.colAgeSex} /></th>
                  <th scope="col"><Ruby text={d.colVoxel} /></th>
                  <th scope="col"><Ruby text={d.colMandible} /></th>
                  <th scope="col"><Ruby text={d.colFit} /></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.scan}>
                    <th scope="row">{r.collection}</th>
                    <td>{r.PatientID}</td>
                    <td>{[r.PatientAge?.replace(/^0+/, '').replace(/Y$/, '') || '–', r.PatientSex || '–'].join(' / ')}</td>
                    <td>{r.voxel_mm.map((v) => v.toFixed(2)).join(' × ')}</td>
                    <td>{r.mandible_cm3.toFixed(1)}</td>
                    <td>{r.icp_mean_mm.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="learn-note"><Ruby text={d.scansNote} /></p>
          <h3><Ruby text={d.collectionsHeading} /></h3>
          <ul className="learn-list">
            {usedCollections.map(([id, c]) => (
              <li key={id}>{c.name} · <a href={`https://doi.org/${c.doi}`} target="_blank" rel="noreferrer">doi:{c.doi}</a> · {c.licence}</li>
            ))}
          </ul>
          <p className="learn-note"><Cited text={d.collectionsNote} label={cite} /></p>
        </section>

        <section aria-labelledby="method-heading" className="detail-block">
          <h2 id="method-heading"><Ruby text={d.methodHeading} /></h2>
          <ol className="learn-list">
            {d.method.map((line) => <li key={line}><Cited text={line} label={cite} /></li>)}
          </ol>
        </section>

        <section aria-labelledby="limits-heading" className="detail-block learn-uncertain">
          <h2 id="limits-heading"><Ruby text={d.limitsHeading} /></h2>
          <ul className="learn-list">
            {d.limits.map((line) => <li key={line}><Cited text={line} label={cite} /></li>)}
          </ul>
        </section>

        <div className="model-details model-details-single">
          <section id="downloads" aria-labelledby="downloads-title" className="detail-block detail-downloads">
            <h2 id="downloads-title"><Ruby text={d.downloadsTitle} /></h2>
            <ul className="file-list">
              <li><a href={averagedJawFiles.glb.href} download><img aria-hidden="true" src="/icons/download.svg" width="20" height="20" alt="" /><Ruby text={d.glb} /></a><span>{averagedJawFiles.glb.size}</span></li>
              <li><a href={averagedJawFiles.stl.href} download><img aria-hidden="true" src="/icons/download.svg" width="20" height="20" alt="" /><Ruby text={d.stl} /></a><span>{averagedJawFiles.stl.size}</span></li>
              <li><a href={averagedJawFiles.provenance.href} download><img aria-hidden="true" src="/icons/download.svg" width="20" height="20" alt="" /><Ruby text={d.provenanceFile} /></a><span>JSON</span></li>
            </ul>
            <p className="detail-note"><Ruby text={format(t.library.version, { v: model.version })} /> · {formatDate(model.updated, localeTags[locale].intl)}</p>
            <p className="prototype-note"><strong><Ruby text={t.disclaimer.notReviewed} /></strong> <Ruby text={t.disclaimer.model} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a></p>
            <p className="detail-note"><Ruby text={d.licenceText} /> <a href={licence.href} target="_blank" rel="noreferrer">{licence.name}</a>. <Ruby text={d.attribution} /></p>
            <h3><Ruby text={d.citeHeading} /></h3>
            <CopyCitation text={averagedJawCitation} />
          </section>
        </div>

        <SourceList sources={averagedJawSources} heading={plain(t.learn.sourcesHeading)} />
      </main>
      <SiteFooter />
    </>
  );
}
