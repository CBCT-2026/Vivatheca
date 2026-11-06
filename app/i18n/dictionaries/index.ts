import type { Locale } from '../config';
import en, { type Dictionary } from './en';
import ja from './ja';
import vi from './vi';
import zhHans from './zh-Hans';
import zhHant from './zh-Hant';

export type { Dictionary };
export { format } from './en';

export const dictionaries: Record<Locale, Dictionary> = { en, ja, 'zh-Hans': zhHans, 'zh-Hant': zhHant, vi };
