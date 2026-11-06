import type { Metadata } from 'next';
import { getI18n } from '../i18n/server';
import { InfoShell } from '../info-shell';
import { SurveyForm } from './form';

// Clinician survey (deep-dive pick X8): anonymous ratings stored in the shared store (worker/store.ts),
// read only at /admin. Plain form with the site's own words in every language (SurveyJS was not needed).
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.survey.title, description: t.survey.description, alternates: { canonical: '/survey' } };
}

export default async function SurveyPage({ searchParams }: { searchParams?: Promise<{ model?: string | string[] }> }) {
  const { t } = await getI18n();
  const params = (await searchParams) ?? {};
  return (
    <InfoShell eyebrow={t.survey.eyebrow} heading={t.survey.heading} intro={t.survey.intro}>
      <SurveyForm initialModel={typeof params.model === 'string' ? params.model : ''} />
    </InfoShell>
  );
}
