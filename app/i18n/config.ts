// Languages the platform is translated into. Add a locale here, add its dictionary in
// ./dictionaries and register it in ./dictionaries/index.ts; everything else picks it up.
export const locales = ['en', 'ja', 'zh-Hans', 'zh-Hant', 'vi'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

// Languages offered in the language menu and the public API. vi covers the whole app as an
// unreviewed AI draft (the disclaimer says so and that English prevails), listed at the
// founder's request so Vietnamese partners can use and review it. zh-Hans and zh-Hant are
// unreviewed drafts of the site frame and disclaimer only, reachable through `?lang=zh-Hans`
// etc. so clinical partners can review them.
export const listedLocales: readonly Locale[] = ['en', 'ja', 'vi'];

// The chosen language is kept in a cookie so server-rendered pages and the static
// pages under /public read the same choice. `?lang=ja` on any URL sets it (see worker/index.ts).
export const LOCALE_COOKIE = 'vivatheca-lang';
// Furigana (reading aids above kanji) are on by default in Japanese; visitors can hide them.
export const FURIGANA_COOKIE = 'vivatheca-furigana';

// Each language is named in its own script so visitors can find it.
export const localeNames: Record<Locale, string> = { en: 'English', ja: '日本語', 'zh-Hans': '简体中文', 'zh-Hant': '繁體中文', vi: 'Tiếng Việt' };

// The language switch, ordered alphabetically by English name (Chinese, English, Japanese,
// Vietnamese). Each shows its own name, then its flag (SVGs in /public/flags from flag-icons,
// MIT; flag emoji do not render on Windows). Entries without `locale` are not translated yet
// and show as "coming soon".
// Keep in step with LANGUAGE_MENU in public/site-header.js (the static pages).
export type LanguageOption = { tag: string; name: string; flag: string; locale?: Locale };
export const languageMenu: readonly LanguageOption[] = [
  { tag: 'zh-Hans', name: '中文', flag: 'cn' },
  { tag: 'en', name: 'English', flag: 'gb', locale: 'en' },
  { tag: 'ja', name: '日本語', flag: 'jp', locale: 'ja' },
  { tag: 'vi', name: 'Tiếng Việt', flag: 'vn', locale: 'vi' },
];
// Used for <html lang>, Intl formatting and Open Graph.
export const localeTags: Record<Locale, { html: string; intl: string; og: string }> = {
  en: { html: 'en', intl: 'en-AU', og: 'en_AU' },
  ja: { html: 'ja', intl: 'ja-JP', og: 'ja_JP' },
  'zh-Hans': { html: 'zh-Hans', intl: 'zh-CN', og: 'zh_CN' },
  'zh-Hant': { html: 'zh-Hant', intl: 'zh-TW', og: 'zh_TW' },
  vi: { html: 'vi', intl: 'vi-VN', og: 'vi_VN' },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}
