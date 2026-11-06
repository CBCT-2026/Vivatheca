import type React from 'react';
import { PageHeader, SiteFooter } from './site-chrome';
import { getI18n } from './i18n/server';
import { Ruby } from './i18n/ruby';

// Shared frame for the plain info pages added on 6 Nov 2026 (requests, used, impact, templates, print, admin).
export async function InfoShell({ eyebrow, heading, intro, children }: { eyebrow?: string; heading: string; intro: string; children: React.ReactNode }) {
  const { t } = await getI18n();
  return (
    <>
      <a className="skip-link" href="#main-content"><Ruby text={t.common.skip} /></a>
      <PageHeader />
      <main id="main-content" className="info-page prose-page">
        <div className="info-intro">
          {eyebrow ? <p className="eyebrow"><Ruby text={eyebrow} /></p> : null}
          <h1><Ruby text={heading} /></h1>
          <p><Ruby text={intro} /></p>
        </div>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
