import type { Metadata } from 'next';
import { getI18n } from '../i18n/server';
import { InfoShell } from '../info-shell';
import { Ruby } from '../i18n/ruby';
import { disclaimerHref } from '../disclaimer-text';
import { catalogue } from '../models/catalogue';
import { AfterHydration } from '../script-mount';

// 3MF files and a print customiser (ideas from MakerWorld print profiles and the Thingiverse Customizer).
// The tool itself is public/print/printer.js; it reads the STL zips listed in public/print/sets.json.
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.printing.title, description: t.printing.description, alternates: { canonical: '/print' } };
}

export default async function PrintPage() {
  const { t, locale } = await getI18n();
  const p = t.printing;
  const titles = Object.fromEntries(catalogue.map((m) => [m.slug, t.library.items[m.slug as keyof typeof t.library.items].title]));
  const plainText = (s: string) => s.replace(/\{([^{}|]+)\|[^{}]+\}/g, '$1');
  return (
    <InfoShell eyebrow={p.eyebrow} heading={p.heading} intro={p.intro}>
      <p className="prototype-note"><strong><Ruby text={t.disclaimer.notReviewed} /></strong> <Ruby text={t.disclaimer.model} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a></p>
      <p className="detail-note"><strong><Ruby text={p.notTested} /></strong> <Ruby text={p.safety} /></p>
      <div id="vt-printer" className="printer" data-lang={locale} data-text={JSON.stringify(p)} data-titles={JSON.stringify(titles)}
        data-status={plainText(t.disclaimer.notReviewed)} data-disclaimer={plainText(t.disclaimer.model)} />
      <AfterHydration src="/print/printer.js" />
      <section aria-labelledby="print-settings">
        <h2 id="print-settings"><Ruby text={p.settingsHeading} /></h2>
        <ul>{p.settings.map((s) => <li key={s}><Ruby text={s} /></li>)}</ul>
      </section>
    </InfoShell>
  );
}
