import type { Metadata } from 'next';
import { PageHeader, SiteFooter } from '../site-chrome';
import { disclaimerUpdated, fullDisclaimer, siteDisclaimer } from '../disclaimer-text';

export const metadata: Metadata = {
  title: 'Disclaimer — Vivatheca',
  description: 'Vivatheca models and information are for general education only and are not medical advice.',
  alternates: { canonical: '/disclaimer' },
  openGraph: { url: '/disclaimer', images: ['/assets/og-image.jpg'] },
};

export default function DisclaimerPage() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <PageHeader />
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
      <SiteFooter />
    </>
  );
}
