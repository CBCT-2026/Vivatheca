import type { Metadata } from 'next';
import { PageHeader, SiteFooter } from '../site-chrome';

export const metadata: Metadata = {
  title: 'Privacy — Vivatheca',
  description: 'What Vivatheca collects when you use the site, and what it does not.',
  alternates: { canonical: '/privacy' },
  openGraph: { url: '/privacy', images: ['/assets/og-image.jpg'] },
};

export default function PrivacyPage() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <PageHeader />
      <main id="main-content" className="info-page prose-page">
        <div className="info-intro">
          <p className="eyebrow">Privacy</p>
          <h1>Privacy</h1>
          <p>Last updated 5 November 2026. Vivatheca is built to need as little information about you as possible.</p>
        </div>

        <section aria-labelledby="no-accounts">
          <h2 id="no-accounts">No accounts, no tracking cookies</h2>
          <p>You do not need an account to view or download models. The site does not use advertising or tracking cookies.</p>
        </section>

        <section aria-labelledby="analytics">
          <h2 id="analytics">Visitor counts</h2>
          <p>We may use Cloudflare Web Analytics to count page visits. It does not use cookies, does not collect personal information and does not follow you across other sites. We use it only to see which models are useful.</p>
        </section>

        <section aria-labelledby="hosting">
          <h2 id="hosting">Hosting</h2>
          <p>The site is hosted by Cloudflare. Like any web server, Cloudflare processes your IP address and browser details to deliver pages and protect the site from abuse. See <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">Cloudflare’s privacy policy</a>.</p>
        </section>

        <section aria-labelledby="on-device">
          <h2 id="on-device">Stored on your device only</h2>
          <p>Saved favourites and drafts in the patient information builder are kept in your own browser and never sent to us. Clearing your browser data removes them.</p>
        </section>

        <section aria-labelledby="builder">
          <h2 id="builder">Patient information builder</h2>
          <p>If you use the AI drafting option, the brief you type is sent to Anthropic (United States) to write the draft. Anthropic may keep it for a limited time under its own terms; Vivatheca does not store it. Never enter a patient’s name, date of birth or other identifying details.</p>
        </section>

        <section aria-labelledby="email">
          <h2 id="email">When you email us</h2>
          <p>Reports and messages arrive by email. We keep them only to answer you and fix the model, and never share them. Ask us at any time to delete your messages.</p>
        </section>

        <section aria-labelledby="contact">
          <h2 id="contact">Contact</h2>
          <p>Privacy questions: <a href="mailto:hello@vivatheca.com?subject=Privacy%20question">hello@vivatheca.com</a>.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
