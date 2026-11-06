import type { Metadata } from 'next';
import { getI18n } from '../i18n/server';
import { InfoShell } from '../info-shell';
import { ImpactTable } from './table';

// Usage counts per model (idea from Unsplash creator stats and MorphoSource download reports).
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.impact.title, description: t.impact.description, alternates: { canonical: '/impact' } };
}

export default async function ImpactPage() {
  const { t } = await getI18n();
  return (
    <InfoShell eyebrow={t.impact.eyebrow} heading={t.impact.heading} intro={t.impact.intro}>
      <ImpactTable />
    </InfoShell>
  );
}
