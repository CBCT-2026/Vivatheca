import { ContactSection } from './contact-section';
import { mailto } from './contact';
import { footerGroups } from './data';
import { disclaimerHref } from './disclaimer-text';
import type { Dictionary } from './i18n/dictionaries';
import { getI18n } from './i18n/server';
import { plain, Ruby } from './i18n/ruby';
import { LanguageSwitcher } from './i18n/switcher';
import { MobileNavigation, ThemeToggle } from './ui';
import { homeHref, primaryLinks } from './nav';

export async function PageHeader({ current }: { current?: string }) {
  const { t, furigana } = await getI18n();
  return (
    <header className="site-header page-header">
      <a className="brand" href={homeHref} aria-label={plain(t.common.home)}><img src="/brand/vivatheca-logo-primary.svg" alt="Vivatheca" width="181" height="136" /></a>
      <nav className="page-nav" aria-label={plain(t.nav.primary)}>
        {primaryLinks(t).map((link) => <a key={link.href} href={link.href} aria-current={current === link.href ? 'page' : undefined}><Ruby text={link.label} /></a>)}
      </nav>
      <div className="page-header-actions">
        <LanguageSwitcher furigana={furigana} className="always" />
        <ThemeToggle />
        <MobileNavigation furigana={furigana} onHome={false} />
      </div>
    </header>
  );
}

export async function SiteFooter() {
  const { t } = await getI18n();
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-about">
          <a className="brand footer-brand" href="/" aria-label={plain(t.common.home)}><img src="/brand/vivatheca-logo-primary.svg" alt="" width="181" height="136" /></a>
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
        <nav aria-label={plain(t.footer.legal)}><a href={disclaimerHref}><Ruby text={t.disclaimer.nav} /></a><a href="/privacy"><Ruby text={t.footer.privacy} /></a><a href="/report"><Ruby text={t.footer.report} /></a><a href={mailto('Accessibility feedback')}><Ruby text={t.footer.accessibility} /></a></nav>
      </div>
    </footer>
  );
}
