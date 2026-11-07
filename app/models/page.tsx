import type { Metadata } from 'next';
import { JsonLd } from './json-ld';
import { collectionJsonLd } from './jsonld';
import { PageHeader, SiteFooter } from '../site-chrome';
import { catalogue, licence } from './catalogue';
import { sortBySpecialty } from './sort';
import { disclaimerHref } from '../disclaimer-text';
import { format } from '../i18n/dictionaries';
import { getI18n } from '../i18n/server';
import { plain, Ruby } from '../i18n/ruby';
import { videos } from '../videos';
import { TermSources } from './terms';
import { currentReview } from './reviews';
import { FavouriteStar, MyModels } from '../show/quick';
import { disciplineHref, disciplines, isDiscipline, modelDisciplines } from './disciplines';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.library.title,
    description: t.library.description,
    alternates: { canonical: '/models' },
    openGraph: { url: '/models', images: ['/assets/og-image.jpg'] },
  };
}

// Static pages under public/ need their trailing slash, which next/link removes.
function CardLink({ href, children }: { href: string; children: React.ReactNode }) {
  return href.endsWith('/') ? <a href={href} className="library-card-link">{children}</a> : <a href={href} className="library-card-link">{children}</a>;
}

export default async function ModelsPage({ searchParams }: { searchParams?: Promise<{ discipline?: string | string[] }> }) {
  const { t, locale } = await getI18n();
  const l = t.library;
  const d = t.footer.disciplines;
  const params = (await searchParams) ?? {};
  const requested = Array.isArray(params.discipline) ? params.discipline[0] : params.discipline;
  const active = isDiscipline(requested) ? requested : null;
  const shown = active ? catalogue.filter((m) => modelDisciplines[m.slug]?.includes(active)) : catalogue;
  return (
    <>
      <JsonLd data={collectionJsonLd()} />
      <a className="skip-link" href="#main-content"><Ruby text={t.common.skip} /></a>
      <PageHeader current="/models" />
      <main id="main-content" className="info-page">
        <div className="info-intro">
          <p className="eyebrow"><Ruby text={l.eyebrow} /></p>
          <h1><Ruby text={l.heading} /></h1>
          <p><Ruby text={l.intro} /> <a href={licence.href} target="_blank" rel="noreferrer">{licence.name}</a>. <Ruby text={l.licenceOther} /></p>
          <p className="prototype-note"><strong><Ruby text={l.reviewLead} /></strong> <Ruby text={t.disclaimer.model} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a></p>
        </div>

        <MyModels />
        <p className="quick-more"><a className="text-link" href="/show"><Ruby text={t.show.homeHeading} /> <img aria-hidden="true" className="ui-icon" src="/icons/arrow_forward.svg" width="20" height="20" alt="" /></a></p>

        <nav className="discipline-filter" aria-label={plain(d.label)}>
          <ul>
            <li><a href="/models" aria-current={active ? undefined : 'page'}><Ruby text={d.all} /></a></li>
            {disciplines.map((key) => <li key={key}><a href={disciplineHref(key)} aria-current={active === key ? 'page' : undefined}><Ruby text={d.items[key]} /></a></li>)}
          </ul>
        </nav>
        {active ? <p className="discipline-showing" role="status"><Ruby text={format(d.showing, { name: d.items[active] })} /></p> : null}

        <ul className="library-grid" aria-label={plain(l.listLabel)}>
          {sortBySpecialty(shown, l.items, locale).map((model) => {
            const item = l.items[model.slug];
            const reviewed = currentReview(model.slug);
            const video = videos[model.slug]?.[locale === 'ja' ? 'ja' : 'en'];
            return (
              <li key={model.slug} className="library-card">
                <CardLink href={model.href}>
                  <span className="library-card-media">
                    <img src={model.image} alt="" width="1200" height="800" loading="lazy" />
                    {video ? <span className="library-video-badge"><Ruby text={l.videoBadge} /> · {video.seconds}s</span> : null}
                  </span>
                  <div className="library-card-body">
                    <p className="library-meta"><span className="spec-icon" aria-hidden="true" style={{ ['--icon' as string]: `url(/icons/health/${model.icon}.svg)` }} /><Ruby text={item.specialty} /></p>
                    <h2><Ruby text={item.title} /></h2>
                    <p><Ruby text={item.summary} /></p>
                    <ul className="library-tags" aria-label={plain(l.factsLabel)}>
                      <li><Ruby text={item.pairing} /></li>
                      <li>{format(l.version, { v: model.version })}</li>
                      <li>{reviewed ? <Ruby text={format(t.review.reviewed, { name: reviewed.reviewer, credentials: reviewed.credentials, date: reviewed.date })} /> : <Ruby text={l.notReviewed} />}</li>
                      <li lang="en">{(model.licence ?? licence).name}</li>
                    </ul>
                  </div>
                </CardLink>
                <FavouriteStar slug={model.slug} />
                <TermSources label={l.termsLabel} terms={model.terms} />
                {video ? <a className="library-video-link" href={`${model.href}#video`}><Ruby text={format(l.watchVideo, { s: String(video.seconds) })} /><span className="visually-hidden">: {plain(item.title)}</span></a> : null}
              </li>
            );
          })}
        </ul>

        <section className="library-next" aria-labelledby="next-title">
          <h2 id="next-title"><Ruby text={l.nextHeading} /></h2>
          <p><Ruby text={l.nextText} /></p>
          <p><Ruby text={l.askText} />{l.askGap}<a href="/contribute"><Ruby text={l.askLink} /></a>{l.askEnd}</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
