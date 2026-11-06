import type { Metadata } from 'next';
import { PageHeader, SiteFooter } from '../../site-chrome';
import { catalogue } from '../catalogue';
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
      </main>
      <SiteFooter />
    </>
  );
}
