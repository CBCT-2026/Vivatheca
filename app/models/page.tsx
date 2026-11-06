import type { Metadata } from 'next';
import { PageHeader, SiteFooter } from '../site-chrome';
import { catalogue, licence } from './catalogue';
import { disclaimerHref } from '../disclaimer-text';
import { format } from '../i18n/dictionaries';
import { getI18n } from '../i18n/server';
import { plain, Ruby } from '../i18n/ruby';
import { videos } from '../videos';

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

export default async function ModelsPage() {
  const { t, locale } = await getI18n();
  const l = t.library;
  return (
    <>
      <a className="skip-link" href="#main-content"><Ruby text={t.common.skip} /></a>
      <PageHeader current="/models" />
      <main id="main-content" className="info-page">
        <div className="info-intro">
          <p className="eyebrow"><Ruby text={l.eyebrow} /></p>
          <h1><Ruby text={l.heading} /></h1>
          <p><Ruby text={l.intro} /> <a href={licence.href} target="_blank" rel="noreferrer">{licence.name}</a>.</p>
          <p className="prototype-note"><strong><Ruby text={l.reviewLead} /></strong> <Ruby text={t.disclaimer.model} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a></p>
        </div>

        <ul className="library-grid" aria-label={plain(l.listLabel)}>
          {catalogue.map((model) => {
            const item = l.items[model.slug];
            const video = videos[model.slug]?.[locale === 'ja' ? 'ja' : 'en'];
            return (
              <li key={model.slug} className="library-card">
                <CardLink href={model.href}>
                  <span className="library-card-media">
                    <img src={model.image} alt="" width="1200" height="800" loading="lazy" />
                    {video ? <span className="library-video-badge"><Ruby text={l.videoBadge} /> · {video.seconds}s</span> : null}
                  </span>
                  <div className="library-card-body">
                    <p className="library-meta"><Ruby text={item.specialty} /></p>
                    <h2><Ruby text={item.title} /></h2>
                    <p><Ruby text={item.summary} /></p>
                    <ul className="library-tags" aria-label={plain(l.factsLabel)}>
                      <li><Ruby text={item.pairing} /></li>
                      <li>{format(l.version, { v: model.version })}</li>
                      <li><Ruby text={l.notReviewed} /></li>
                    </ul>
                  </div>
                </CardLink>
                {video ? <a className="library-video-link" href={`${model.href}#video`} aria-label={`${plain(format(l.watchVideo, { s: String(video.seconds) }))}: ${plain(item.title)}`}><Ruby text={format(l.watchVideo, { s: String(video.seconds) })} /></a> : null}
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
