import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '../ui';
import { format } from '../i18n/dictionaries';
import { getI18n } from '../i18n/server';
import { plain, Ruby } from '../i18n/ruby';
import { LanguageSwitcher } from '../i18n/switcher';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: plain(t.disclaimer.title),
    description: plain(t.disclaimer.description),
    alternates: { canonical: '/disclaimer' },
  };
}

export default async function DisclaimerPage() {
  const { t, furigana } = await getI18n();
  const d = t.disclaimer;
  return (
    <>
      <a className="skip-link" href="#main-content"><Ruby text={t.common.skip} /></a>
      <header className="site-header builder-header">
        <Link className="brand" href="/" aria-label={plain(t.common.home)}><img src="/brand/vivatheca-logo-primary.svg" alt="Vivatheca" width="181" height="136" /></Link>
        <span />
        <div className="header-actions">
          <LanguageSwitcher furigana={furigana} className="always" />
          <ThemeToggle />
          <Link className="button button-secondary button-compact builder-back" href="/"><Ruby text={t.create.back} /></Link>
        </div>
      </header>
      <main id="main-content" className="disclaimer-page">
        <p className="eyebrow"><Ruby text={format(d.updated, { date: d.date })} /></p>
        <h1><Ruby text={d.heading} /></h1>
        <p className="disclaimer-lead"><Ruby text={d.site} /></p>
        {d.reviewNote ? <p className="evidence-note"><Ruby text={d.reviewNote} /></p> : null}
        {d.sections.map((section) => (
          <section key={section.heading}>
            <h2><Ruby text={section.heading} /></h2>
            {section.paragraphs.map((text) => <p key={text}><Ruby text={text} /></p>)}
          </section>
        ))}
      </main>
    </>
  );
}
