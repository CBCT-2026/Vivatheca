import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader, SiteFooter } from '../site-chrome';
import { disclaimerHref, modelDisclaimer } from '../disclaimer-text';

export const metadata: Metadata = {
  title: 'About — Vivatheca',
  description: 'Why Vivatheca exists, who runs it and how it is governed as a not-for-profit.',
  alternates: { canonical: '/about' },
};

const principles = [
  { title: 'Always a matched normal', text: 'A condition is easier to understand next to healthy anatomy. Every pathology model ships with a normal built from the same base, so the only difference is the condition.' },
  { title: 'Published evidence only', text: 'Anatomy and condition details come from peer-reviewed literature and recognised clinical guidance. Each model lists its sources.' },
  { title: 'Open and free', text: 'Models are free to view, download, print and adapt under an open Creative Commons licence. There are no accounts, adverts or paywalls.' },
  { title: 'Honest about limits', text: 'Each model says what is simplified, its version and whether a clinician has reviewed it yet. Nothing is shown as reviewed until it has been.' },
];

export default function AboutPage() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <PageHeader />
      <main id="main-content" className="info-page prose-page">
        <div className="info-intro">
          <p className="eyebrow">About</p>
          <h1>Clear 3D models for the conversation in the chair.</h1>
          <p>Vivatheca is a free library of 3D dental and oral and maxillofacial models. Clinicians use them to explain a condition, show what treatment involves, and build their own patient education materials, on screen or as a 3D print.</p>
        </div>

        <section aria-labelledby="why-title">
          <h2 id="why-title">Why it exists</h2>
          <p>Patients often leave an appointment without a clear picture of what is happening in their mouth. Radiographs and diagrams are hard to read for most people. Studies of 3D models in consultations report better patient understanding and communication, but good models are expensive, hard to find, or locked to one product.</p>
          <p>Vivatheca makes those models open: one place to find a condition, see it beside normal anatomy, and download it for any use in patient education.</p>
        </section>

        <section aria-labelledby="principles-title">
          <h2 id="principles-title">How we work</h2>
          <ul className="principle-list">
            {principles.map((item) => <li key={item.title}><h3>{item.title}</h3><p>{item.text}</p></li>)}
          </ul>
          <p className="prototype-note"><strong>Review status:</strong> no model has been independently clinically reviewed yet. {modelDisclaimer} <Link href={disclaimerHref}>Full disclaimer</Link></p>
        </section>

        <section aria-labelledby="founder-title">
          <h2 id="founder-title">Who runs it</h2>
          <p><strong>Luke Seifert, Founder &amp; Director.</strong> Vivatheca was founded in Australia by Luke, a dental professional who models and 3D prints anatomy. He builds each model, checks it against published sources and tests prints on a desktop printer. It is currently a one-person project, supported by clinicians who review models and suggest new ones.</p>
          <p>Vivatheca has no commercial sponsor and earns no money from the models.</p>
        </section>

        <section aria-labelledby="governance-title">
          <h2 id="governance-title">Not-for-profit plan</h2>
          <p>Vivatheca is run as a not-for-profit project. The plan is to form Vivatheca Ltd, an Australian company limited by guarantee, and apply to register it as a charity with the Australian Charities and Not-for-profits Commission (ACNC). Neither step is complete yet. Any future funding will pay for model development, hosting and printed models for clinics, never for profit.</p>
          <p>This page will be updated with registration details once they exist.</p>
        </section>

        <section aria-labelledby="help-title">
          <h2 id="help-title">Get involved</h2>
          <ul className="plain-list">
            <li><Link href="/report">Report an inaccuracy</Link> in any model.</li>
            <li><a href="mailto:hello@vivatheca.com?subject=Join%20clinical%20review">Join clinical review</a> if you are a dentist, specialist or oral health professional.</li>
            <li><a href="mailto:hello@vivatheca.com?subject=Model%20request">Request a model</a> you would use with patients.</li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
