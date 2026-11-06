import { AfterHydration } from '../../script-mount';
import type { Metadata } from 'next';
import { PageHeader, SiteFooter } from '../../site-chrome';
import { catalogue, formatDate, licence, wisdomTooth } from '../catalogue';
import { Cited } from '../../learn/chrome';
import { CompareViewer } from '../compare';
import { CopyCitation } from './copy-citation';
import { disclaimerHref } from '../../disclaimer-text';
import { localeTags } from '../../i18n/config';
import { format } from '../../i18n/dictionaries';
import { getI18n } from '../../i18n/server';
import { plain, Ruby } from '../../i18n/ruby';
import { VideoSection } from '../../video-section';

const model = catalogue.find((item) => item.slug === 'impacted-wisdom-tooth')!;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.wisdom.title,
    description: t.wisdom.description,
    alternates: { canonical: '/models/impacted-wisdom-tooth' },
    openGraph: { url: '/models/impacted-wisdom-tooth', images: ['/assets/renders/wisdom-tooth-compare.webp'] },
  };
}

export default async function WisdomToothPage() {
  const { t, locale } = await getI18n();
  const w = t.wisdom;
  const item = t.library.items[model.slug];
  const date = (iso: string) => formatDate(iso, localeTags[locale].intl);
  const reviewNote = <p className="prototype-note"><strong><Ruby text={t.disclaimer.notReviewed} /></strong> <Ruby text={t.disclaimer.model} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a></p>;
  return (
    <>
      <a className="skip-link" href="#main-content"><Ruby text={t.common.skip} /></a>
      <PageHeader current="/models" />
      <main id="main-content" className="info-page model-page">
        <nav className="breadcrumb" aria-label={plain(w.breadcrumb)}><a href="/models"><Ruby text={t.library.eyebrow} /></a><span aria-hidden="true">/</span><span aria-current="page"><Ruby text={item.title} /></span></nav>
        <div className="info-intro">
          <p className="eyebrow"><Ruby text={item.specialty} /></p>
          <h1><Ruby text={item.title} /></h1>
          <p><Ruby text={item.summary} /></p>
        </div>

        <CompareViewer impacted={{ glb: wisdomTooth.impacted.glb, alt: plain(w.impactedAlt) }} normal={{ glb: wisdomTooth.normal.glb, alt: plain(w.normalAlt) }} />
        {/* "Use this model" panel: links to a view, pictures, credit, embed (public/share-tools.js). */}
        <div data-vt-share="" data-vt-scope=".compare" />
        <AfterHydration src="/share-tools.js" />
        <div className="model-disclaimer">{reviewNote}</div>
        <VideoSection slug="impacted-wisdom-tooth" />

        <div className="model-details">
          <section aria-labelledby="downloads-title" className="detail-block detail-downloads">
            <h2 id="downloads-title"><Ruby text={w.download} /></h2>
            <ul className="file-list">
              {wisdomTooth.files.map((file, index) => (
                <li key={file.href}><a href={file.href} download><img aria-hidden="true" src="/icons/download.svg" width="20" height="20" alt="" /><Ruby text={w.files[index]} /></a><span>{file.size}</span></li>
              ))}
            </ul>
            {reviewNote}
            <p className="detail-note"><Ruby text={w.licence} /> <a href={licence.href} target="_blank" rel="noreferrer">{licence.name}</a>. <Ruby text={w.licenceText} /></p>
            <a className="button button-compact" href="/create?model=impacted-molar"><Ruby text={w.makeInfo} /></a>
          </section>

          <section aria-labelledby="details-title" className="detail-block">
            <h2 id="details-title"><Ruby text={w.details} /></h2>
            <dl className="fact-list">
              <div><dt><Ruby text={w.versionLabel} /></dt><dd><Ruby text={format(w.versionValue, { v: model.version, date: date(model.updated) })} /></dd></div>
              <div><dt><Ruby text={w.statusLabel} /></dt><dd><Ruby text={w.statusValue} /></dd></div>
              <div><dt><Ruby text={w.pairLabel} /></dt><dd><Ruby text={item.pairing} /></dd></div>
            </dl>

            <h3><Ruby text={w.showsHeading} /></h3>
            <ul className="plain-list">{w.shows.map((text) => <li key={text}><Cited text={text} label={w.citeLabel} /></li>)}</ul>

            <h3><Ruby text={w.normalHeading} /></h3>
            <p><Cited text={w.normalMethod} label={w.citeLabel} /></p>

            <h3><Ruby text={w.simplifiedHeading} /></h3>
            <ul className="plain-list">{w.simplifications.map((text) => <li key={text}><Cited text={text} label={w.citeLabel} /></li>)}</ul>

            <h3><Ruby text={w.sourcesHeading} /></h3>
            {w.sourcesNote ? <p className="detail-note"><Ruby text={w.sourcesNote} /></p> : null}
            <ol className="source-list" lang="en">{wisdomTooth.sources.map((source, index) => <li key={source.text} id={`src-${index + 1}`}>{source.text}{source.href ? <> <a href={source.href} target="_blank" rel="noreferrer">{source.href.replace('https://', '')}</a></> : null}</li>)}</ol>

            <h3><Ruby text={w.changelogHeading} /></h3>
            <ul className="plain-list">{w.changelog.map((entry) => <li key={entry.version}><strong>{entry.version}</strong> ({date(wisdomTooth.changelogDates[entry.version])}): <Ruby text={entry.text} /></li>)}</ul>

            <h3><Ruby text={w.creditHeading} /></h3>
            <CopyCitation text={wisdomTooth.citation} />
          </section>
        </div>

        <aside className="report-band" aria-labelledby="report-title">
          <div>
            <h2 id="report-title"><Ruby text={w.reportHeading} /></h2>
            <p><Ruby text={w.reportText} /></p>
          </div>
          <a className="button button-light" href="/report?model=impacted-wisdom-tooth"><Ruby text={t.nav.report} /></a>
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}
