import type { Metadata } from 'next';
import { getI18n } from '../i18n/server';
import { InfoShell } from '../info-shell';
import { RequestBoard } from './board';

// Model request board (idea from LEGO Ideas: support decides the order, then a review decides).
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.requests.title, description: t.requests.description, alternates: { canonical: '/requests' } };
}

export default async function RequestsPage() {
  const { t } = await getI18n();
  const r = t.requests;
  return (
    <InfoShell eyebrow={r.eyebrow} heading={r.heading} intro={r.intro}>
      <RequestBoard />
    </InfoShell>
  );
}
