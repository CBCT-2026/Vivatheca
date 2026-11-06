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
// The language switch, ordered alphabetically by English name (Chinese, English, Japanese,
// Vietnamese). Each shows its own name, then its flag (SVGs in /public/flags from flag-icons,
// MIT; flag emoji do not render on Windows). Entries without `locale` are not translated yet
// and show as "coming soon": they need translation and clinician review, not machine translation.
// Keep in step with LANGUAGE_MENU in public/site-header.js (the static pages).
export type LanguageOption = { tag: string; name: string; flag: string; locale?: Locale };
export const languageMenu: readonly LanguageOption[] = [
  { tag: 'zh-Hans', name: '中文', flag: 'cn' },
  { tag: 'en', name: 'English', flag: 'gb', locale: 'en' },
  { tag: 'ja', name: '日本語', flag: 'jp', locale: 'ja' },
  { tag: 'vi', name: 'Tiếng Việt', flag: 'vn' },
];
// Used for <html lang>, Intl formatting and Open Graph.
export const localeTags: Record<Locale, { html: string; intl: string; og: string }> = {
  en: { html: 'en', intl: 'en-AU', og: 'en_AU' },
  ja: { html: 'ja', intl: 'ja-JP', og: 'ja_JP' },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}
