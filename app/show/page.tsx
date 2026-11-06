import type { Metadata } from 'next';
import { PageHeader, SiteFooter } from '../site-chrome';
import { disclaimerHref } from '../disclaimer-text';
import { getI18n } from '../i18n/server';
import { Ruby } from '../i18n/ruby';
import { catalogue } from '../models/catalogue';
import { showSpecs } from './models';
import { MyModels, QuickPick } from './quick';
import { ShowViewer } from './viewer';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.show.title, description: t.show.description, alternates: { canonical: '/show' } };
}

const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

// /show: every model as a one-tap tile. /show?model=<slug>[&view=<id>]: that model full screen.
export default async function ShowPage({ searchParams }: { searchParams?: Promise<{ model?: string | string[]; view?: string | string[] }> }) {
  const { t } = await getI18n();
  const params = (await searchParams) ?? {};
  const slug = one(params.model);
  const model = slug ? catalogue.find((m) => m.slug === slug) : undefined;
  const spec = slug ? showSpecs[slug] : undefined;
  if (model && spec) {
    return (
      <main id="main-content" className="show-page">
        <ShowViewer slug={model.slug} spec={spec} pageHref={model.href} initialView={one(params.view)} />
      </main>
    );
  }
  const s = t.show;
  return (
    <>
      <a className="skip-link" href="#main-content"><Ruby text={t.common.skip} /></a>
      <PageHeader current="/show" />
      <main id="main-content" className="info-page quick-page">
        <div className="info-intro">
          <p className="eyebrow"><Ruby text={s.eyebrow} /></p>
          <h1><Ruby text={s.heading} /></h1>
          <p><Ruby text={s.intro} /></p>
          <p className="prototype-note"><strong><Ruby text={t.library.reviewLead} /></strong> <Ruby text={t.disclaimer.model} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a></p>
        </div>
        <MyModels empty />
        <QuickPick />
        <p className="quick-more"><a className="text-link" href="/models"><Ruby text={t.collection.allModels} /> <img aria-hidden="true" className="ui-icon" src="/icons/arrow_forward.svg" width="20" height="20" alt="" /></a></p>
      </main>
      <SiteFooter />
    </>
  );
}
