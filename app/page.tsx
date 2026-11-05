import Link from 'next/link';
import { contributionPaths, publications, trustItems, understandingPaths } from './data';
import { SiteFooter } from './site-chrome';
import { getI18n } from './i18n/server';
import { plain, Ruby } from './i18n/ruby';
import { LanguageSwitcher } from './i18n/switcher';
import { MobileNavigation, ModelExperience, ThemeToggle } from './ui';

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return <img aria-hidden="true" className="ui-icon" src={`/icons/${name}.svg`} width={size} height={size} alt="" />;
}

export default async function Home() {
  const { t, furigana } = await getI18n();
  return (
    <>
      <a className="skip-link" href="#main-content"><Ruby text={t.common.skip} /></a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label={plain(t.common.home)}><img src="/brand/vivatheca-logo-primary.svg" alt="Vivatheca" width="181" height="136" /></a>
        <nav className="desktop-nav" aria-label={plain(t.nav.primary)}>
          <Link href="/models"><Ruby text={t.nav.models} /></Link><a href="#how-it-works"><Ruby text={t.nav.howItWorks} /></a><a href="#publications"><Ruby text={t.nav.evidence} /></a><Link href="/create"><Ruby text={t.nav.create} /></Link><Link href="/about"><Ruby text={t.nav.about} /></Link>
        </nav>
        <div className="header-actions">
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
              <Link className="button" href="/models"><Ruby text={t.hero.explore} /> <Icon name="arrow_forward" /></Link>
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

        <section className="mission-band" aria-label={plain(t.mission.label)}>
          <p><Ruby text={t.mission.text} /></p>
          <div className="mission-links">{t.mission.links.map((item) => <span key={item}><Ruby text={item} /></span>)}</div>
        </section>

        <section className="collection-section" id="collection">
          <div className="section-heading split-heading">
            <div><h2><Ruby text={t.collection.heading} /></h2><p><Ruby text={t.collection.text} /> <Link href="/models/impacted-wisdom-tooth"><Ruby text={t.collection.compare} /></Link></p></div>
            <div className="section-label"><Icon name="3d_rotation" size={24} /><Ruby text={t.collection.label} /></div>
          </div>
          <ModelExperience />
        </section>

        <section className="understanding-section" id="how-it-works">
          <div className="section-heading compact-heading"><h2><Ruby text={t.understanding.heading} /></h2><p><Ruby text={t.understanding.text} /></p></div>
          <div className="understanding-paths">
            {understandingPaths(t).map((path, index) => (
              <article key={path.icon}><span className="path-number">{String(index + 1).padStart(2, '0')}</span><Icon name={path.icon} size={30} /><h3><Ruby text={path.title} /></h3><p><Ruby text={path.text} /></p></article>
            ))}
          </div>
        </section>

        <section className="print-section">
          <figure><img src="/assets/renders/wisdom-tooth-compare.webp" alt={plain(t.print.imageAlt)} width="1200" height="800" /><figcaption className="figure-note"><Ruby text={t.print.caption} /></figcaption></figure>
          <div className="print-copy"><h2><Ruby text={t.print.heading} /></h2><p><Ruby text={t.print.text} /></p><Link className="text-link" href="/models/impacted-wisdom-tooth"><Ruby text={t.print.download} /> <Icon name="download" /></Link></div>
        </section>

        <section className="trust-section" id="trust">
          <div className="trust-intro"><Icon name="health_and_safety" size={36} /><h2><Ruby text={t.trust.heading} /></h2><p><Ruby text={t.trust.text} /> <Link href="/report"><Ruby text={t.trust.report} /></Link> <Ruby text={t.trust.reportAfter} /></p></div>
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
          <div className="sponsor-intro"><div><h2><Ruby text={t.sponsor.heading} /></h2><p><Ruby text={t.sponsor.text} /></p></div><a className="button button-light" href="mailto:hello@vivatheca.com?subject=Sponsor%20a%20Vivatheca%20model"><Ruby text={t.sponsor.cta} /> <Icon name="arrow_forward" /></a></div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
