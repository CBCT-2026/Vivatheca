import type { Metadata } from 'next';
import { getI18n } from '../i18n/server';
import { InfoShell } from '../info-shell';
import { format } from '../i18n/dictionaries';
import { plain, Ruby } from '../i18n/ruby';
import { disclaimerHref } from '../disclaimer-text';
import { catalogue, licence } from '../models/catalogue';
import manifest from '../../public/templates/manifest.json';

// Editable handout and slide templates (idea from Canva templates and Figma Community files).
// Built by tools/templates/build.py into public/templates/.
type Files = Record<'en' | 'ja', { href: string; size: string }>;
const files = manifest as Record<string, { image: string; handout: Files; slide: Files }>;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.templates.title, description: t.templates.description, alternates: { canonical: '/templates' } };
}

export default async function TemplatesPage() {
  const { t, locale } = await getI18n();
  const p = t.templates;
  const langs = locale === 'ja' ? (['ja', 'en'] as const) : (['en', 'ja'] as const);
  return (
    <InfoShell eyebrow={p.eyebrow} heading={p.heading} intro={p.intro}>
      <p><a href="/create"><Ruby text={p.builder} /> →</a></p>
      <section aria-labelledby="tpl-tips" className="detail-block">
        <h2 id="tpl-tips"><Ruby text={p.tipsHeading} /></h2>
        <ul>{p.tips.map((tip) => <li key={tip}><Ruby text={tip} /></li>)}</ul>
      </section>
      <ul className="template-list">
        {catalogue.filter((m) => files[m.slug]).map((m) => {
          const f = files[m.slug];
          const title = t.library.items[m.slug as keyof typeof t.library.items].title;
          return (
            <li key={m.slug} id={m.slug} className="template-item">
              <img src={m.image} alt={plain(p.picture) + ': ' + plain(title)} width="240" height="160" loading="lazy" />
              <div>
                <h2><a href={m.href}><Ruby text={title} /></a></h2>
                <ul className="file-list">
                  {(['handout', 'slide'] as const).flatMap((kind) => langs.map((lang) => (
                    <li key={kind + lang}><a href={f[kind][lang].href} download><Ruby text={format(p.download, { format: kind === 'handout' ? p.handout : p.slide, lang: p.langs[lang], size: f[kind][lang].size })} /></a></li>
                  )))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="detail-note"><Ruby text={p.licence} /> <a href={licence.href} target="_blank" rel="noreferrer">{licence.name}</a></p>
      <p className="prototype-note"><strong><Ruby text={t.disclaimer.notReviewed} /></strong> <Ruby text={t.disclaimer.model} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a></p>
    </InfoShell>
  );
}
