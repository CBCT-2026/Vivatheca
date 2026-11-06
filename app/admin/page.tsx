import type { Metadata } from 'next';
import { getI18n } from '../i18n/server';
import { InfoShell } from '../info-shell';
import { Moderation } from './moderation';

// Moderation of model suggestions and "used it" posts. Needs the ADMIN_TOKEN Worker secret.
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.admin.title, description: t.admin.description, robots: { index: false, follow: false } };
}

export default async function AdminPage() {
  const { t } = await getI18n();
  return (
    <InfoShell heading={t.admin.heading} intro={t.admin.intro}>
      <Moderation />
    </InfoShell>
  );
}
