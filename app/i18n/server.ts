import { cookies } from 'next/headers';
import { defaultLocale, FURIGANA_COOKIE, isLocale, LOCALE_COOKIE, type Locale } from './config';
import { dictionaries } from './dictionaries';

export async function getLocale(): Promise<Locale> {
  try {
    const value = (await cookies()).get(LOCALE_COOKIE)?.value;
    return isLocale(value) ? value : defaultLocale;
  } catch {
    return defaultLocale;
  }
}

export async function getFurigana(): Promise<boolean> {
  try {
    return (await cookies()).get(FURIGANA_COOKIE)?.value !== 'off';
  } catch {
    return true;
  }
}

export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale], furigana: await getFurigana() };
}
