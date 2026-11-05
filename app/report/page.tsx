import type { Metadata } from 'next';
import { PageHeader, SiteFooter } from '../site-chrome';
import { ReportForm } from './report-form';

export const metadata: Metadata = {
  title: 'Report an inaccuracy — Vivatheca',
  description: 'Tell Vivatheca about anatomy, labels or text that do not look right in a model.',
  alternates: { canonical: '/report' },
};

export default async function ReportPage({ searchParams }: { searchParams?: Promise<{ model?: string | string[] }> }) {
  const params = (await searchParams) ?? {};
  const initialModel = typeof params.model === 'string' ? params.model : undefined;
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <PageHeader />
      <main id="main-content" className="info-page prose-page">
        <div className="info-intro">
          <p className="eyebrow">Clinical accuracy</p>
          <h1>Report an inaccuracy</h1>
          <p>Seen anatomy, a label or a description that does not look right? Tell us what and where. Clinician reports are checked against published sources, and each fix is listed in the model’s change log.</p>
        </div>
        <ReportForm initialModel={initialModel} />
        <p className="detail-note">Please do not include patient details. Your report opens in your email app, addressed to hello@vivatheca.com, so you can check it before you send it.</p>
      </main>
      <SiteFooter />
    </>
  );
}
