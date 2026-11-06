import type { Dictionary } from './en';

// A partial translation: any key left out falls back to English. Used for languages
// whose translation is still an unreviewed draft covering only part of the site.
type DeepPartial<T> = T extends string ? string : T extends readonly (infer U)[] ? U[] : { [K in keyof T]?: DeepPartial<T[K]> };
export type PartialDictionary = DeepPartial<Dictionary>;

function merge(base: unknown, over: unknown): unknown {
  if (over === undefined) return base;
  if (typeof base === 'string' || Array.isArray(base) || base === null || typeof base !== 'object') return over;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(over as Record<string, unknown>)) out[key] = merge(out[key], value);
  return out;
}

export function withFallback(base: Dictionary, over: PartialDictionary): Dictionary {
  return merge(base, over) as Dictionary;
}
