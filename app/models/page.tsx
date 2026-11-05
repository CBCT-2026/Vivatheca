import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader, SiteFooter } from '../site-chrome';
import { catalogue, licence } from './catalogue';
import { disclaimerHref, modelDisclaimer } from '../disclaimer-text';

export const metadata: Metadata = {
  title: 'Model library — Vivatheca',
  description: 'Free 3D models of dental and oral and maxillofacial conditions, each paired with normal anatomy, with GLB and STL downloads.',
  alternates: { canonical: '/models' },
};

// Static pages under public/ need their trailing slash, which next/link removes.
function CardLink({ href, children }: { href: string; children: React.ReactNode }) {
  return href.endsWith('/') ? <a href={href} className="library-card-link">{children}</a> : <Link href={href} className="library-card-link">{children}</Link>;
}

export default function ModelsPage() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <PageHeader />
      <main id="main-content" className="info-page">
        <div className="info-intro">
          <p className="eyebrow">Model library</p>
          <h1>Models with a normal to compare.</h1>
          <p>Every condition comes with matching normal anatomy, so you can show a patient what is different and why it matters. All models are free to view, download, print and adapt under <a href={licence.href} target="_blank" rel="noreferrer">{licence.name}</a>.</p>
          <p className="prototype-note"><strong>Review status is shown on each model.</strong> {modelDisclaimer} <Link href={disclaimerHref}>Full disclaimer</Link></p>
        </div>

        <ul className="library-grid" aria-label="Models">
          {catalogue.map((model) => (
            <li key={model.slug} className="library-card">
              <CardLink href={model.href}>
                <img src={model.image} alt={model.imageAlt} width="1200" height="800" loading="lazy" />
                <div className="library-card-body">
                  <p className="library-meta">{model.specialty}</p>
                  <h2>{model.title}</h2>
                  <p>{model.summary}</p>
                  <ul className="library-tags" aria-label="Model facts">
                    <li>{model.pairing}</li>
                    <li>Version {model.version}</li>
                    <li>{model.status}</li>
                  </ul>
                </div>
              </CardLink>
            </li>
          ))}
        </ul>

        <section className="library-next" aria-labelledby="next-title">
          <h2 id="next-title">Coming next</h2>
          <p>The library is growing to cover each dental specialty, plus oral and maxillofacial surgery, always with a matched normal. Next in line: periodontitis, a periapical abscess, an atrophic jaw without teeth, a jaw cyst and orthodontic bite classes.</p>
          <p>Want a particular model, or able to check one for accuracy? <Link href="/report">Tell us</Link>.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
