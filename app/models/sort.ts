import type { Locale } from '../i18n/config';

// Model lists (homepage showcase, /models collection) are ordered alphabetically by
// specialty, then by model title within each specialty, in the visitor's language.
// Japanese is ordered by reading (gojūon), so {漢字|かんじ} sorts by its furigana.
const RUBY = /\{([^{}|]+)\|([^{}]+)\}/g;

function sortKey(text: string, locale: Locale): string {
  return text.replace(RUBY, locale === 'ja' ? '$2' : '$1');
}

export function sortBySpecialty<T extends { slug: string }>(
  models: readonly T[],
  items: Record<string, { title: string; specialty: string }>,
  locale: Locale,
): T[] {
  const collator = new Intl.Collator(locale, { sensitivity: 'base', numeric: true, ignorePunctuation: true });
  const key = (m: T, field: 'specialty' | 'title') => sortKey(items[m.slug]?.[field] ?? m.slug, locale);
  return [...models].sort((a, b) => collator.compare(key(a, 'specialty'), key(b, 'specialty')) || collator.compare(key(a, 'title'), key(b, 'title')));
}
