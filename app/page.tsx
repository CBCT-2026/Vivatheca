import { contributionPaths, footerGroups, publications, trustItems, understandingPaths } from './data';
import { getI18n } from './i18n/server';
import { plain, Ruby } from './i18n/ruby';
import { LanguageSwitcher } from './i18n/switcher';
import { MobileNavigation, ModelExperience, ThemeToggle } from './ui';
import { disclaimerHref } from './disclaimer-text';
import { mailto } from './contact';
import { ContactSection } from './contact-section';

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
          <a href="#collection"><Ruby text={t.nav.browse} /></a><a href="#how-it-works"><Ruby text={t.nav.howItWorks} /></a><a href="#publications"><Ruby text={t.nav.publications} /></a><a href="#contribute"><Ruby text={t.nav.contribute} /></a><a href="/create"><Ruby text={t.nav.create} /></a><a href="/learn"><Ruby text={t.nav.students} /></a>
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
              <a className="button" href="#collection"><Ruby text={t.hero.explore} /> <Icon name="arrow_forward" /></a>
              <a className="button button-secondary" href="#how-it-works"><Ruby text={t.hero.how} /></a>
            </div>
            <ul className="access-list" aria-label={plain(t.hero.accessLabel)}>{t.hero.access.map((item) => <li key={item}><Ruby text={item} /></li>)}</ul>
          </div>
          <figure className="hero-visual">
            <img src="/assets/consultation-hero.webp" alt={plain(t.hero.imageAlt)} width="1536" height="1024" fetchPriority="high" />
            <figcaption><Ruby text={t.hero.caption} /></figcaption>
            <p className="ai-disclaimer"><Ruby text={t.common.aiIllustration} /></p>
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

        <section className="audience-section" id="audiences" aria-label={plain(t.audiences.label)}>
          <h2><Ruby text={t.audiences.heading} /></h2>
          <div className="audience-paths">
            <article>
              <p className="eyebrow"><Ruby text={t.audiences.clinicians.eyebrow} /></p>
              <h3><Ruby text={t.audiences.clinicians.title} /></h3>
              <p><Ruby text={t.audiences.clinicians.text} /></p>
              <div className="audience-actions">
                <a className="button" href="#collection"><Ruby text={t.audiences.clinicians.primary} /></a>
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

        <section className="understanding-section" id="how-it-works">
          <div className="section-heading compact-heading"><h2><Ruby text={t.understanding.heading} /></h2><p><Ruby text={t.understanding.text} /></p></div>
          <div className="understanding-paths">
            {understandingPaths(t).map((path, index) => (
              <article key={path.icon}><span className="path-number">{String(index + 1).padStart(2, '0')}</span><Icon name={path.icon} size={30} /><h3><Ruby text={path.title} /></h3><p><Ruby text={path.text} /></p></article>
            ))}
          </div>
        </section>

        <section className="print-section">
          <figure><img src="/assets/screen-to-print.webp" alt={plain(t.print.imageAlt)} width="1536" height="1024" /><figcaption className="ai-disclaimer"><Ruby text={t.common.aiIllustration} /></figcaption></figure>
          <div className="print-copy"><h2><Ruby text={t.print.heading} /></h2><p><Ruby text={t.print.text} /></p><a className="text-link" href="/models/impacted-molar.stl" download><Ruby text={t.print.download} /> <Icon name="download" /></a></div>
        </section>

        <section className="trust-section" id="trust">
          <div className="trust-intro"><Icon name="health_and_safety" size={36} /><h2><Ruby text={t.trust.heading} /></h2><p><Ruby text={t.trust.text} /></p></div>
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
                <figure className="publication-visual">
                  <img src={publication.image} alt={plain(publication.alt)} width="1024" height="1024" />
                  <figcaption className="ai-disclaimer"><Ruby text={t.common.aiIllustration} /></figcaption>
                </figure>
              </article>
            ))}
          </div>
        </section>

        <section className="contribute-section" id="contribute">
          <div className="contribute-copy"><h2><Ruby text={t.contribute.heading} /></h2><p><Ruby text={t.contribute.text} /></p><div className="contribution-paths">{contributionPaths(t).map((path) => <article key={path.icon}><Icon name={path.icon} size={26} /><div><h3><Ruby text={path.title} /></h3><p><Ruby text={path.text} /></p><a className="text-link" href={path.href}><Ruby text={t.contribute.learn} /> <Icon name="arrow_forward" /></a></div></article>)}</div></div>
          <figure><img src="/assets/open-review-network-v2.webp" alt={plain(t.contribute.imageAlt)} width="1536" height="1024" /><figcaption className="ai-disclaimer"><Ruby text={t.common.aiIllustration} /></figcaption></figure>
        </section>

        <section className="sponsor-section" id="sponsor">
          <div className="sponsor-intro"><div><h2><Ruby text={t.sponsor.heading} /></h2><p><Ruby text={t.sponsor.text} /></p></div><a className="button button-light" href={mailto('Sponsor a Vivatheca model')}><Ruby text={t.sponsor.cta} /> <Icon name="arrow_forward" /></a></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-about">
            <a className="brand footer-brand" href="#top" aria-label={plain(t.footer.backToTop)}><img src="/brand/vivatheca-logo-primary.svg" alt="" width="181" height="136" /></a>
            <p><Ruby text={t.footer.about} /></p>
            <span className="footer-badge"><Ruby text={t.footer.badge} /></span>
          </div>
          <div className="footer-links">
            {footerGroups(t).map((group) => (
              <nav key={group.label} aria-label={plain(group.label)} className="footer-nav">
                <h2><Ruby text={group.label} /></h2>
                <ul>{group.links.map((link) => <li key={link.href}><a href={link.href}><Ruby text={link.label} /></a></li>)}</ul>
              </nav>
            ))}
          </div>
        </div>

        <ContactSection t={t} />

        <div className="footer-legal">
          <p>© 2026 Vivatheca</p>
          <p className="disclaimer"><Ruby text={t.disclaimer.site} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a></p>
          <nav aria-label={plain(t.footer.legal)}><a href={disclaimerHref}><Ruby text={t.disclaimer.nav} /></a><a href={mailto('Privacy question')}><Ruby text={t.footer.privacy} /></a><a href={mailto('Accessibility feedback')}><Ruby text={t.footer.accessibility} /></a></nav>
        </div>
      </footer>
    </>
  );
}
