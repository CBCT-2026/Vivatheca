import type { Locale } from '../config';
import en, { type Dictionary } from './en';
import ja from './ja';

export type { Dictionary };
export { format } from './en';

export const dictionaries: Record<Locale, Dictionary> = { en, ja };
