import type { Metadata } from 'next';
import { getI18n } from '../i18n/server';
import { InfoShell } from '../info-shell';
import { UsedGallery } from './gallery';

// "Used it" gallery (idea from Printables makes and Allrecipes "I made it"): how people used the models.
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.used.title, description: t.used.description, alternates: { canonical: '/used' } };
}

export default async function UsedPage({ searchParams }: { searchParams?: Promise<{ model?: string | string[] }> }) {
  const { t } = await getI18n();
  const params = (await searchParams) ?? {};
  return (
    <InfoShell eyebrow={t.used.eyebrow} heading={t.used.heading} intro={t.used.intro}>
      <UsedGallery initialModel={typeof params.model === 'string' ? params.model : ''} />
    </InfoShell>
  );
}
