import { clinicalImages, contributionPaths, publications, trustItems, understandingPaths } from './data';
import { JsonLd } from './models/json-ld';
import { siteJsonLd } from './models/jsonld';
import { SiteFooter } from './site-chrome';
import { homeHref, primaryLinks } from './nav';
import { mailto } from './contact';
import { catalogue } from './models/catalogue';
import { disclaimerHref } from './disclaimer-text';
import { getI18n } from './i18n/server';
import { plain, Ruby } from './i18n/ruby';
import { LanguageSwitcher } from './i18n/switcher';
import { MobileNavigation, ModelExperience, ThemeToggle } from './ui';

// A mix of other models (app/models/catalogue.ts). The wisdom tooth is the hero; the bone graft series is the interactive section.
const showcaseSlugs = ['dental-development', 'orthognathic', 'periodontitis', 'head-neck', 'oroantral', 'cracked-tooth'];
const showcase = showcaseSlugs.map((slug) => catalogue.find((model) => model.slug === slug)).filter((model) => model !== undefined);

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return <img aria-hidden="true" className="ui-icon" src={`/icons/${name}.svg`} width={size} height={size} alt="" />;
}

export default async function Home() {
  const { t, furigana } = await getI18n();
  return (
    <>
      <JsonLd data={siteJsonLd()} />
      <a className="skip-link" href="#main-content"><Ruby text={t.common.skip} /></a>
      <header className="site-header">
        <a className="brand" href={homeHref} aria-label={plain(t.common.home)}><img src="/brand/vivatheca-logo-primary.svg" alt="Vivatheca" width="181" height="136" /></a>
        <nav className="desktop-nav" aria-label={plain(t.nav.primary)}>
          {primaryLinks(t, true).map((link) => <a key={link.href} href={link.href}><Ruby text={link.label} /></a>)}
        </nav>
        <div className="header-actions">
          <a className="search-link" href="/search" aria-label={plain(t.nav.search)} title={plain(t.nav.search)}><img src="/icons/search.svg" alt="" width="22" height="22" /></a>
          <LanguageSwitcher furigana={furigana} />
          <ThemeToggle />
          <a className="button button-compact" href="#sponsor"><Ruby text={t.nav.sponsor} /></a>
          <MobileNavigation furigana={furigana} />
        </div>
      </header>

      <main id="main-content">
        <section className="hero" id="top">
          <div className="hero-copy">
            <h1 className="hero-title"><span className="hero-line"><Ruby text={t.hero.line1} /></span><span className="hero-line"><Ruby text={t.hero.line2} /></span></h1>
            <p className="hero-lede"><Ruby text={t.hero.lede} /></p>
            <div className="hero-actions">
              <a className="button" href="/models"><Ruby text={t.hero.explore} /> <Icon name="arrow_forward" /></a>
              <a className="button button-secondary" href="#collection"><Ruby text={t.hero.how} /></a>
            </div>
            <ul className="access-list" aria-label={plain(t.hero.accessLabel)}>{t.hero.access.map((item) => <li key={item}><Ruby text={item} /></li>)}</ul>
          </div>
          <figure className="hero-visual">
            <img src="/assets/renders/wisdom-tooth-hero.webp" alt={plain(t.hero.imageAlt)} width="1536" height="1024" fetchPriority="high" />
            <figcaption><Ruby text={t.hero.caption} /></figcaption>
          </figure>
        </section>

        <aside className="origin-band" aria-label={plain(t.origin.label)}>
          <a href="https://www.pmc.gov.au/resources/flag-images-and-template-files-download" target="_blank" rel="noreferrer" aria-label={plain(t.origin.flagLink)}>
            <img src="/assets/australian-national-flag.jpg" alt={plain(t.origin.flagAlt)} width="120" height="60" />
          </a>
          <p><Ruby text={t.origin.text} /></p>
        </aside>


        <section className="audience-section" id="audiences" aria-label={plain(t.audiences.label)}>
          <h2><Ruby text={t.audiences.heading} /></h2>
          <div className="audience-paths">
            <article>
              <p className="eyebrow"><Ruby text={t.audiences.clinicians.eyebrow} /></p>
              <h3><Ruby text={t.audiences.clinicians.title} /></h3>
              <p><Ruby text={t.audiences.clinicians.text} /></p>
              <div className="audience-actions">
                <a className="button" href="/models"><Ruby text={t.audiences.clinicians.primary} /></a>
                <a className="button button-secondary" href="/create"><Ruby text={t.audiences.clinicians.secondary} /></a>
              </div>
            </article>
            <article>
              <p className="eyebrow"><Ruby text={t.audiences.students.eyebrow} /></p>
              <h3><Ruby text={t.audiences.students.title} /></h3>
              <p><Ruby text={t.audiences.students.text} /></p>
              <div className="audience-actions">
                <a className="button" href="/learn"><Ruby text={t.audiences.students.primary} /> <Icon name="arrow_forward" /></a>
              </div>
            </article>
          </div>
          <p className="audience-note"><Ruby text={t.audiences.note} /></p>
        </section>

        <section className="collection-section" id="collection">
          <div className="section-heading split-heading">
            <div><h2><Ruby text={t.collection.heading} /></h2><p><Ruby text={t.collection.text} /></p></div>
            <div className="section-label"><Icon name="3d_rotation" size={24} /><Ruby text={t.collection.label} /></div>
          </div>
          <ModelExperience />
        </section>

        <section className="showcase-section" id="showcase" aria-labelledby="showcase-title">
          <div className="section-heading split-heading">
            <div><h2 id="showcase-title"><Ruby text={t.showcase.heading} /></h2><p><Ruby text={t.showcase.text} /></p></div>
            <div className="section-label"><Icon name="3d_rotation" size={24} /><Ruby text={t.showcase.label} /></div>
          </div>
          <ul className="library-grid showcase-grid" aria-label={plain(t.showcase.label)}>
            {showcase.map((model) => {
              const item = t.library.items[model.slug];
              return (
                <li key={model.slug} className="library-card">
                  <a href={model.href} className="library-card-link">
                    <img src={model.image} alt="" width="1200" height="800" loading="lazy" />
                    <div className="library-card-body">
                      <p className="library-meta"><Ruby text={item.specialty} /></p>
                      <h3><Ruby text={item.title} /></h3>
                      <p><Ruby text={item.summary} /></p>
                      <ul className="library-tags" aria-label={plain(t.library.factsLabel)}>
                        <li><Ruby text={item.pairing} /></li>
                        <li><Ruby text={t.library.notReviewed} /></li>
                      </ul>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="prototype-note"><strong><Ruby text={t.disclaimer.notReviewed} /></strong> <Ruby text={t.disclaimer.model} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a></p>
          <div className="prototype-links">
            <h3><Ruby text={t.collection.moreHeading} /></h3>
            <a className="text-link" href="/head-neck/"><Ruby text={t.collection.moreHeadNeck} /> <Icon name="arrow_forward" /></a>
            <a className="text-link" href="/models"><Ruby text={t.collection.allModels} /> <Icon name="arrow_forward" /></a>
          </div>
        </section>

        <section className="understanding-section" id="how-it-works">
          <div className="section-heading compact-heading"><h2><Ruby text={t.understanding.heading} /></h2><p><Ruby text={t.understanding.text} /></p></div>
          <div className="understanding-paths">
            {understandingPaths(t).map((path) => (
              <article key={path.icon}><Icon name={path.icon} size={30} /><h3><Ruby text={path.title} /></h3><p><Ruby text={path.text} /></p></article>
            ))}
          </div>
        </section>

        <section className="print-section">
          <figure className="print-compare"><div className="print-compare-images"><img src="/assets/renders/wisdom-tooth-print-buccal.webp" alt={plain(t.print.imageAlt)} width="1616" height="500" /><img src="/assets/renders/wisdom-tooth-print-lingual.webp" alt={plain(t.print.imageAltLingual)} width="1616" height="500" loading="lazy" /></div><figcaption className="figure-note"><Ruby text={t.print.caption} /></figcaption></figure>
          <div className="print-copy"><h2><Ruby text={t.print.heading} /></h2><p><Ruby text={t.print.text} /></p><a className="text-link" href="/models/impacted-wisdom-tooth"><Ruby text={t.print.download} /> <Icon name="download" /></a></div>
        </section>

        <section className="wisdom-cases">
          <div className="clinical-images" id="clinical-images">
            <h3><Ruby text={t.clinical.heading} /></h3>
            <p className="clinical-note"><Ruby text={t.clinical.note} /></p>
            <div className="clinical-grid">
              {clinicalImages.map((image, index) => {
                const text = t.clinical.images[image.key];
                return (
                  <figure key={image.key} className="clinical-figure" id={`img-${index + 1}`}>
                    <img src={image.src} width={image.width} height={image.height} loading="lazy" alt={plain(text.alt)} />
                    <figcaption>
                      <Ruby text={text.caption} />
                      <span className="clinical-credit">{plain(t.clinical.credit)}: <span lang="en">{image.credit} <a href={image.href} target="_blank" rel="noreferrer">{image.href.replace('https://', '')}</a>.</span> {plain(t.clinical.licence)}: <a href={image.licence.href} target="_blank" rel="noreferrer" lang="en">{image.licence.name}</a>. {plain(t.clinical.changes)}: <span lang="en">{image.changes}</span></span>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        </section>

        <section className="trust-section" id="trust">
          <div className="trust-intro"><Icon name="health_and_safety" size={36} /><h2><Ruby text={t.trust.heading} /></h2><p><Ruby text={t.trust.text} /> <a href="/report"><Ruby text={t.trust.report} /></a> <Ruby text={t.trust.reportAfter} /></p></div>
          <ul>{trustItems(t).map((item) => <li key={item.title}><span aria-hidden="true">✓</span><div><h3><Ruby text={item.title} /></h3><p><Ruby text={item.text} /></p></div></li>)}</ul>
          <p className="trust-warning"><strong><Ruby text={t.trust.warningLabel} /></strong> <Ruby text={t.trust.warning} /></p>
        </section>

        <section className="publications-section" id="publications">
          <div className="publications-intro">
            <h2><Ruby text={t.publications.heading} /></h2>
            <p><Ruby text={t.publications.text} /></p>
            <p className="evidence-note"><Ruby text={t.publications.note} /></p>
          </div>
          <div className="publication-list">
            {publications(t).map((publication) => (
              <article key={publication.href}>
                <div className="publication-copy">
                  <h3 lang="en">{publication.title}</h3>
                  <p className="publication-journal"><span lang="en">{publication.authors}</span> <Ruby text={publication.journal} /> · <a href={`https://doi.org/${publication.doi}`} target="_blank" rel="noreferrer">doi:{publication.doi}</a></p>
                  <p><Ruby text={publication.finding} /></p>
                  <a className="text-link" href={publication.href} target="_blank" rel="noreferrer"><Ruby text={t.publications.read} /> <Icon name="arrow_forward" /></a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="contribute-section" id="contribute">
          <div className="contribute-copy"><h2><Ruby text={t.contribute.heading} /></h2><p><Ruby text={t.contribute.text} /></p><div className="contribution-paths">{contributionPaths(t).map((path) => <article key={path.icon}><Icon name={path.icon} size={26} /><div><h3><Ruby text={path.title} /></h3><p><Ruby text={path.text} /></p><a className="text-link" href={path.href}><Ruby text={path.href.startsWith('/') ? t.contribute.openForm : t.contribute.emailUs} /> <Icon name="arrow_forward" /></a></div></article>)}</div></div>
          <figure><img src="/assets/renders/dental-development.webp" alt={plain(t.contribute.imageAlt)} width="1200" height="800" /><figcaption className="figure-note"><Ruby text={t.contribute.caption} /> <a href="/development/"><Ruby text={t.contribute.openSeries} /></a></figcaption></figure>
        </section>

        <section className="sponsor-section" id="sponsor">
          <div className="sponsor-intro"><div><h2><Ruby text={t.sponsor.heading} /></h2><p><Ruby text={t.sponsor.text} /></p></div><a className="button button-light" href={mailto('Sponsor a Vivatheca model')}><Ruby text={t.sponsor.cta} /> <Icon name="arrow_forward" /></a></div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
