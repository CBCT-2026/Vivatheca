// Languages the platform is translated into. Add a locale here, add its dictionary in
// ./dictionaries and register it in ./dictionaries/index.ts; everything else picks it up.
export const locales = ['en', 'ja'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

// The chosen language is kept in a cookie so server-rendered pages and the static
// pages under /public read the same choice. `?lang=ja` on any URL sets it (see worker/index.ts).
export const LOCALE_COOKIE = 'vivatheca-lang';
// Furigana (reading aids above kanji) are on by default in Japanese; visitors can hide them.
export const FURIGANA_COOKIE = 'vivatheca-furigana';

// Each language is named in its own script so visitors can find it.
export const localeNames: Record<Locale, string> = { en: 'English', ja: '日本語' };
// Shorter names for the phone header, where space is tight.
export const localeShortNames: Record<Locale, string> = { en: 'EN', ja: '日本語' };
// Used for <html lang>, Intl formatting and Open Graph.
export const localeTags: Record<Locale, { html: string; intl: string; og: string }> = {
  en: { html: 'en', intl: 'en-AU', og: 'en_AU' },
  ja: { html: 'ja', intl: 'ja-JP', og: 'ja_JP' },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}
