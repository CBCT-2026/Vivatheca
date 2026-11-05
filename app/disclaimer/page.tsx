import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '../ui';
import { disclaimerUpdated, fullDisclaimer, siteDisclaimer } from '../disclaimer-text';

export const metadata: Metadata = {
  title: 'Disclaimer — Vivatheca',
  description: 'Vivatheca models and information are for general education only and are not medical advice.',
  alternates: { canonical: '/disclaimer' },
};

export default function DisclaimerPage() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header builder-header">
        <Link className="brand" href="/" aria-label="Vivatheca home"><img src="/brand/vivatheca-logo-primary.svg" alt="Vivatheca" width="181" height="136" /></Link>
        <span />
        <div className="header-actions">
          <ThemeToggle />
          <Link className="button button-secondary button-compact builder-back" href="/">Back to models</Link>
        </div>
      </header>
      <main id="main-content" className="disclaimer-page">
        <p className="eyebrow">Last updated {disclaimerUpdated}</p>
        <h1>Disclaimer</h1>
        <p className="disclaimer-lead">{siteDisclaimer}</p>
        {fullDisclaimer.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((text) => <p key={text}>{text}</p>)}
          </section>
        ))}
      </main>
    </>
  );
}
