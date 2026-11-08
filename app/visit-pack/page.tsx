import type { Metadata } from 'next';
import { getI18n } from '../i18n/server';
import { InfoShell } from '../info-shell';
import { plain, Ruby } from '../i18n/ruby';
import { disclaimerHref } from '../disclaimer-text';
import { catalogue, licence } from '../models/catalogue';
import { Cited } from '../learn/chrome';
import { AfterHydration } from '../script-mount';
import { visitPackSources } from './sources';

// Visit pack (anatomy apps review #8, 8 Nov 2026): the clinician saves two to four views of a model
// ("Add view to visit pack" or the chairside pen in public/share-tools.js) and gets one short page with
// pitk-checked take-home text, a QR code to the model, the credit and the disclaimers. The pictures live
// in sessionStorage (this tab only); public/visit-pack/pack.js lays them out. Nothing about the patient is stored.
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: plain(t.visitPack.title), description: plain(t.visitPack.description), alternates: { canonical: '/visit-pack' } };
}

export default async function VisitPackPage() {
  const { t } = await getI18n();
  const v = t.visitPack;
  const slugs = Object.keys(v.models) as (keyof typeof v.models)[];
  const items = t.library.items as Record<string, { title: string }>;
  const words = { count: plain(v.count), remove: plain(v.remove), drawn: plain(v.drawn), qrAlt: plain(v.qrAlt) };
  const titles = Object.fromEntries(slugs.map((slug) => [slug, plain(items[slug].title)]));
  const licences = Object.fromEntries(slugs.map((slug) => {
    const l = (catalogue.find((m) => m.slug === slug) as { licence?: { name: string; href: string } } | undefined)?.licence || licence;
    return [slug, l];
  }));
  return (
    <InfoShell eyebrow={v.eyebrow} heading={v.heading} intro={v.intro}>
      <section className="vp-how" aria-labelledby="vp-how-title">
        <h2 id="vp-how-title"><Ruby text={v.howHeading} /></h2>
        <ol>{v.how.map((s) => <li key={s}><Ruby text={s} /></li>)}</ol>
        <p className="detail-note"><Ruby text={v.privacy} /></p>
        <p className="detail-note"><Ruby text={v.preview} /></p>
      </section>

      <div id="vt-visit-pack" className="vp" data-max="4" data-text={JSON.stringify(words)} data-titles={JSON.stringify(titles)}>
        <div className="vp-empty">
          <p><Ruby text={v.empty} /></p>
          <a className="button button-compact" href="/models/impacted-wisdom-tooth"><Ruby text={v.emptyLink} /></a>
        </div>
        <div className="vp-controls" hidden>
          <p className="vp-count" aria-live="polite" />
          <button type="button" className="button button-compact vp-print"><Ruby text={v.print} /></button>
          <button type="button" className="button button-compact button-secondary vp-clear"><Ruby text={v.clear} /></button>
        </div>

        <article className="vp-sheet" hidden aria-label={plain(v.heading)}>
          <p className="vp-brand">Vivatheca</p>
          <section aria-labelledby="vp-pictures-title">
            <h2 id="vp-pictures-title"><Ruby text={v.picturesHeading} /></h2>
            <ol className="vp-pictures" />
          </section>
          {slugs.map((slug) => {
            const mt = v.models[slug];
            return (
              <section key={slug} className="vp-model" data-vp-model={slug} hidden aria-labelledby={`vp-${slug}`}>
                <h2 id={`vp-${slug}`}><Ruby text={mt.heading} /></h2>
                {mt.text.map((p) => <p key={p}><Cited text={p} label={v.citeLabel} /></p>)}
                <p className="vp-note"><Ruby text={mt.note} /></p>
                <h3><Ruby text={mt.questionsHeading} /></h3>
                <ul className="plain-list">{mt.questions.map((q) => <li key={q}><Ruby text={q} /></li>)}</ul>
                <p><Cited text={mt.questionsSource} label={v.citeLabel} /></p>
                <div className="vp-qr" data-vp-qr={slug}>
                  <div className="vp-qr-code" />
                  <div>
                    <h3><Ruby text={v.qrHeading} /></h3>
                    <p><Ruby text={v.qrText} /></p>
                    <p className="vp-url" lang="en">vivatheca.com{catalogue.find((m) => m.slug === slug)?.href}</p>
                  </div>
                </div>
                {/* Disclaimers before the sources, so they stay on the first printed page. */}
                <p className="vp-legal"><strong><Ruby text={t.disclaimer.notReviewed} /></strong> <Ruby text={t.disclaimer.model} /> <Ruby text={t.disclaimer.site} /> <a href={disclaimerHref}>vivatheca.com{disclaimerHref}</a></p>
                <p className="vp-legal">© Vivatheca · {titles[slug]} · <a href={licences[slug].href}>{licences[slug].name}</a> · <Ruby text={v.madeWith} /></p>
                <h3><Ruby text={v.sourcesHeading} /></h3>
                <ol className="source-list vp-sources" lang="en">{visitPackSources[slug].map((s, i) => <li key={s.text} id={`src-${i + 1}`}>{s.text}{s.href ? <> <a className="url" href={s.href} target="_blank" rel="noreferrer">{s.href.replace('https://', '')}</a></> : null}</li>)}</ol>
              </section>
            );
          })}
        </article>
      </div>
      <AfterHydration src="/visit-pack/pack.js" />
    </InfoShell>
  );
}
