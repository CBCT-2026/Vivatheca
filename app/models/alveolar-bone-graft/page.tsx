import type { Metadata } from 'next';
import { PageHeader, SiteFooter } from '../../site-chrome';
import { catalogue, licence } from '../catalogue';
import { abgCitation, abgFiles } from '../../abg';
import { disclaimerHref } from '../../disclaimer-text';
import { CopyCitation } from '../impacted-wisdom-tooth/copy-citation';
import { getI18n } from '../../i18n/server';
import { plain, Ruby } from '../../i18n/ruby';
import { ModelExperience } from '../../ui';

// Collection page for the alveolar bone graft series (the same viewer as the homepage interactive section).
const model = catalogue.find((item) => item.slug === 'alveolar-bone-graft')!;

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

export default async function AlveolarBoneGraftPage() {
  const { t } = await getI18n();
  const item = t.library.items[model.slug];
  const a = t.abg;
  return (
    <>
      <a className="skip-link" href="#main-content"><Ruby text={t.common.skip} /></a>
      <PageHeader current="/models" />
      <main id="main-content" className="info-page model-page">
        <nav className="breadcrumb" aria-label={plain(t.wisdom.breadcrumb)}><a href="/models"><Ruby text={t.library.eyebrow} /></a><span aria-hidden="true">/</span><span aria-current="page"><Ruby text={item.title} /></span></nav>
        <div className="info-intro">
          <p className="eyebrow"><Ruby text={item.specialty} /></p>
          <h1><Ruby text={item.title} /></h1>
          <p><Ruby text={item.summary} /></p>
        </div>
        <ModelExperience />

        <div className="model-details model-details-single">
          <section id="downloads" aria-labelledby="downloads-title" className="detail-block detail-downloads">
            <h2 id="downloads-title"><Ruby text={a.downloadsTitle} /></h2>
            <ul className="file-list">
              {abgFiles.flatMap((stage, index) => [
                <li key={stage.glb.href}><a href={stage.glb.href} download><img aria-hidden="true" src="/icons/download.svg" width="20" height="20" alt="" /><Ruby text={`${a.fileStages[index]} · ${a.glb}`} /></a><span>{stage.glb.size}</span></li>,
                <li key={stage.stl.href}><a href={stage.stl.href} download><img aria-hidden="true" src="/icons/download.svg" width="20" height="20" alt="" /><Ruby text={`${a.fileStages[index]} · ${a.stl}`} /></a><span>{stage.stl.size}</span></li>,
              ])}
            </ul>
            <p className="detail-note"><Ruby text={a.filesNote} /></p>
            <p className="prototype-note"><strong><Ruby text={t.disclaimer.notReviewed} /></strong> <Ruby text={t.disclaimer.model} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a></p>
            <p className="detail-note"><Ruby text={a.credit} /> <Ruby text={a.licence} /> <a href={licence.href} target="_blank" rel="noreferrer">{licence.name}</a>. <Ruby text={a.licenceText} /></p>
            <h3><Ruby text={a.citeHeading} /></h3>
            <CopyCitation text={abgCitation} />
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
