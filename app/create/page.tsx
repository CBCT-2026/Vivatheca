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
      </main>
    </>
  );
}
