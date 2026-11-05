import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader, SiteFooter } from '../../site-chrome';
import { catalogue, licence, wisdomTooth } from '../catalogue';
import { CompareViewer } from '../compare';
import { CopyCitation } from './copy-citation';
import { disclaimerHref, modelDisclaimer } from '../../disclaimer-text';

const model = catalogue.find((item) => item.slug === 'impacted-wisdom-tooth')!;

export const metadata: Metadata = {
  title: 'Impacted lower wisdom tooth and matched normal — Vivatheca',
  description: 'Free 3D model of an impacted lower wisdom tooth near the inferior alveolar nerve, with a matched normal jaw. GLB and STL downloads, sources and licence.',
  alternates: { canonical: '/models/impacted-wisdom-tooth' },
  openGraph: { url: '/models/impacted-wisdom-tooth', images: ['/assets/renders/wisdom-tooth-compare.webp'] },
};

export default function WisdomToothPage() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <PageHeader current="/models" />
      <main id="main-content" className="info-page model-page">
        <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/models">Model library</Link><span aria-hidden="true">/</span><span aria-current="page">{model.title}</span></nav>
        <div className="info-intro">
          <p className="eyebrow">{model.specialty}</p>
          <h1>{model.title}</h1>
          <p>{model.summary}</p>
        </div>

        <CompareViewer impacted={wisdomTooth.impacted} normal={wisdomTooth.normal} />
        <p className="prototype-note model-disclaimer"><strong>Not yet clinically reviewed.</strong> {modelDisclaimer} <Link href={disclaimerHref}>Full disclaimer</Link></p>

        <div className="model-details">
          <section aria-labelledby="downloads-title" className="detail-block detail-downloads">
            <h2 id="downloads-title">Download</h2>
            <ul className="file-list">
              {wisdomTooth.files.map((file) => (
                <li key={file.href}><a href={file.href} download><img aria-hidden="true" src="/icons/download.svg" width="20" height="20" alt="" />{file.label}</a><span>{file.size}</span></li>
              ))}
            </ul>
            <p className="prototype-note"><strong>Not yet clinically reviewed.</strong> {modelDisclaimer} <Link href={disclaimerHref}>Full disclaimer</Link></p>
            <p className="detail-note">Licence: <a href={licence.href} target="_blank" rel="noreferrer">{licence.name}</a>. You may use, adapt and print these models, including in your own patient materials, if you credit Vivatheca. If you change the model, or images of it, share your changed version under CC BY-SA 4.0.</p>
            <Link className="button button-compact" href="/create">Make patient information for this model</Link>
          </section>

          <section aria-labelledby="details-title" className="detail-block">
            <h2 id="details-title">Model details</h2>
            <dl className="fact-list">
              <div><dt>Version</dt><dd>{model.version}, updated {model.updated}</dd></div>
              <div><dt>Review status</dt><dd>{model.status}. No independent clinician has checked it yet.</dd></div>
              <div><dt>Pair</dt><dd>{model.pairing}</dd></div>
            </dl>

            <h3>What it shows</h3>
            <ul className="plain-list">{wisdomTooth.shows.map((item) => <li key={item}>{item}</li>)}</ul>

            <h3>How the normal was made</h3>
            <p>{wisdomTooth.normalMethod}</p>

            <h3>What is simplified</h3>
            <ul className="plain-list">{wisdomTooth.simplifications.map((item) => <li key={item}>{item}</li>)}</ul>

            <h3>Published sources</h3>
            <ol className="source-list">{wisdomTooth.sources.map((source) => <li key={source.href}>{source.text} <a href={source.href} target="_blank" rel="noreferrer">{source.href.replace('https://', '')}</a></li>)}</ol>

            <h3>Change log</h3>
            <ul className="plain-list">{wisdomTooth.changelog.map((entry) => <li key={entry.version}><strong>{entry.version}</strong> ({entry.date}): {entry.text}</li>)}</ul>

            <h3>How to credit</h3>
            <CopyCitation text={wisdomTooth.citation} />
          </section>
        </div>

        <aside className="report-band" aria-labelledby="report-title">
          <div>
            <h2 id="report-title">Spotted something wrong?</h2>
            <p>If anything in this model does not match the anatomy or the condition, please tell us. Every report is read and the change log above records each fix.</p>
          </div>
          <Link className="button button-light" href="/report?model=impacted-wisdom-tooth">Report an inaccuracy</Link>
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}
