import Link from 'next/link';
import { footerGroups } from './data';
import { disclaimerHref, siteDisclaimer } from './disclaimer-text';
import { ThemeToggle } from './ui';

export const primaryLinks = [
  { label: 'Models', href: '/models' },
  { label: 'Create', href: '/create' },
  { label: 'About', href: '/about' },
  { label: 'Report an issue', href: '/report' },
];

export function PageHeader() {
  return (
    <header className="site-header page-header">
      <Link className="brand" href="/" aria-label="Vivatheca home"><img src="/brand/vivatheca-logo-primary.svg" alt="Vivatheca" width="181" height="136" /></Link>
      <nav className="page-nav" aria-label="Primary navigation">
        {primaryLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
      </nav>
      <div className="page-header-actions"><ThemeToggle /></div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-about">
          <Link className="brand footer-brand" href="/" aria-label="Vivatheca home"><img src="/brand/vivatheca-logo-primary.svg" alt="" width="181" height="136" /></Link>
          <p>Free 3D models of dental and oral and maxillofacial conditions, each with a matched normal, for clinicians making patient education materials.</p>
          <span className="footer-badge">Not-for-profit · Open licence</span>
        </div>
        <div className="footer-links">
          {footerGroups.map((group) => (
            <nav key={group.label} aria-label={group.label} className="footer-nav">
              <h2>{group.label}</h2>
              <ul>{group.links.map((link) => <li key={link.label}><a href={link.href}>{link.label}</a></li>)}</ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="footer-legal">
        <p>© 2026 Vivatheca</p>
        <p className="disclaimer">{siteDisclaimer} <Link href={disclaimerHref}>Full disclaimer</Link></p>
        <nav aria-label="Legal and accessibility"><Link href={disclaimerHref}>Disclaimer</Link><Link href="/privacy">Privacy</Link><Link href="/report">Report an inaccuracy</Link><a href="mailto:hello@vivatheca.com?subject=Accessibility%20feedback">Accessibility feedback</a></nav>
      </div>
    </footer>
  );
}
