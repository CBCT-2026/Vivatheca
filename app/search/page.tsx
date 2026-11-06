import type { Metadata } from 'next';
import { PageHeader, SiteFooter } from '../site-chrome';
import { getI18n } from '../i18n/server';
import { Ruby, plain } from '../i18n/ruby';
import { SearchUI } from './search-ui';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: plain(t.search.title),
    description: plain(t.search.description),
    alternates: { canonical: '/search' },
    robots: { index: false },
  };
}

export default async function SearchPage() {
  const { t, locale } = await getI18n();
  const s = t.search;
  const translations = {
    placeholder: plain(s.placeholder), clear_search: plain(s.clear), load_more: plain(s.more),
    search_label: plain(s.heading), filters_label: '', zero_results: plain(s.zero), many_results: plain(s.many),
    one_result: plain(s.one), alt_search: '', search_suggestion: '', searching: plain(s.searching),
  };
  return (
    <>
      <a className="skip-link" href="#main-content"><Ruby text={t.common.skip} /></a>
      <PageHeader current="/search" />
      <main id="main-content" className="info-page prose-page search-page">
        <div className="info-intro">
          <h1><Ruby text={s.heading} /></h1>
          <p><Ruby text={s.intro} /></p>
        </div>
        <SearchUI locale={locale} translations={translations} />
        <p className="search-note"><Ruby text={s.note} /></p>
      </main>
      <SiteFooter />
    </>
  );
}
