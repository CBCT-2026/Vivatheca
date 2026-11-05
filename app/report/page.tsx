import type { Metadata } from 'next';
import { PageHeader, SiteFooter } from '../site-chrome';
import { getI18n } from '../i18n/server';
import { Ruby } from '../i18n/ruby';
import { ReportForm } from './report-form';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.report.title,
    description: t.report.description,
    alternates: { canonical: '/report' },
    openGraph: { url: '/report', images: ['/assets/og-image.jpg'] },
  };
}

export default async function ReportPage({ searchParams }: { searchParams?: Promise<{ model?: string | string[] }> }) {
  const { t } = await getI18n();
  const r = t.report;
  const params = (await searchParams) ?? {};
  const initialModel = typeof params.model === 'string' ? params.model : undefined;
  return (
    <>
      <a className="skip-link" href="#main-content"><Ruby text={t.common.skip} /></a>
      <PageHeader current="/report" />
      <main id="main-content" className="info-page prose-page">
        <div className="info-intro">
          <p className="eyebrow"><Ruby text={r.eyebrow} /></p>
          <h1><Ruby text={r.heading} /></h1>
          <p><Ruby text={r.intro} /></p>
        </div>
        <ReportForm initialModel={initialModel} />
        <p className="detail-note"><Ruby text={r.emailNote} /></p>
      </main>
      <SiteFooter />
    </>
  );
}
