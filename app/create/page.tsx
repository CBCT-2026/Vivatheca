import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '../ui';
import { Builder } from './builder';

export const metadata: Metadata = {
  title: 'Create patient information — Vivatheca',
  description: 'Draft, check and refine patient education materials that match Vivatheca 3D models.',
  alternates: { canonical: '/create' },
  robots: { index: false },
};

// Visible sources for the builder's rules and checks (see briefs.ts and checker.ts).
const guidanceSources = [
  { text: 'NHS England. NHS digital service manual: content style guide and health literacy.', href: 'https://service-manual.nhs.uk/content/health-literacy' },
  { text: 'International Organization for Standardization. ISO 24495-1:2023 Plain language — Part 1: Governing principles and guidelines.', href: 'https://www.iso.org/standard/78907.html' },
  { text: 'Centers for Disease Control and Prevention. CDC Clear Communication Index: user guide.', href: 'https://www.cdc.gov/ccindex/tool' },
  { text: 'Shoemaker SJ, Wolf MS, Brach C. Development of the Patient Education Materials Assessment Tool (PEMAT). Patient Educ Couns. 2014;96(3):395-403.', href: 'https://doi.org/10.1016/j.pec.2014.05.027' },
  { text: 'Trevena LJ, Zikmund-Fisher BJ, Edwards A, et al. Presenting quantitative information about decision outcomes: a risk communication primer for patient decision aid developers (IPDAS). BMC Med Inform Decis Mak. 2013;13(Suppl 2):S7.', href: 'https://doi.org/10.1186/1472-6947-13-S2-S7' },
  { text: 'Royal College of Surgeons of England. Consent: Supported Decision-Making. A good practice guide.', href: 'https://www.rcseng.ac.uk/standards-and-research/standards-and-guidance/good-practice-guides/consent' },
  { text: 'Australian Dental Association. Policy Statement 5.15: Consent to Treatment.', href: 'https://ada.org.au/policy-statement-5-15-consent-to-treatment' },
];

export default function CreatePage() {
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
      <main id="main-content" className="builder-page">
        <div className="builder-intro">
          <p className="eyebrow">Prototype · For clinicians</p>
          <h1>Create patient information</h1>
          <p>Draft a leaflet, A4 sheet, consent section or narration script that matches a Vivatheca model. Check it against plain-language and risk-communication guidance, refine it, and export it for print.</p>
        </div>
        <Builder />
        <section className="builder-sources" aria-labelledby="builder-sources-title">
          <h2 id="builder-sources-title">Guidance this builder follows</h2>
          <p>The drafting rules and checks are based on these published sources. The reading-grade and sentence-length limits are common targets drawn from this guidance, not validated cut-offs, and readability formulas only estimate how easy a text is to read.</p>
          <ol>
            {guidanceSources.map((source) => <li key={source.href}>{source.text} <a href={source.href} target="_blank" rel="noreferrer">{source.href.replace('https://', '')}</a></li>)}
          </ol>
        </section>
      </main>
    </>
  );
}
