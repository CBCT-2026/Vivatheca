'use client';

import { useMemo, useSyncExternalStore } from 'react';

// Favourite models ("My models") are kept in this browser only, in localStorage under
// FAVOURITES_KEY, as a JSON list of catalogue slugs (newest first). No account or server:
// they do not follow a visitor to another device or browser. The static model pages
// (public/model-page.js) read and write the same key, and so can the planned app
// (audits/app-store-plan.md in the project files).
export const FAVOURITES_KEY = 'vivatheca-favourites';
const EVENT = 'vivatheca-favourites';

export function readFavourites(): string[] {
  try {
    const list = JSON.parse(localStorage.getItem(FAVOURITES_KEY) || '[]');
    return Array.isArray(list) ? list.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

function writeFavourites(list: string[]) {
  try { localStorage.setItem(FAVOURITES_KEY, JSON.stringify(list)); } catch { /* private mode: keep for this page only */ }
  window.dispatchEvent(new Event(EVENT));
}

export function toggleFavourite(slug: string) {
  const list = readFavourites();
  writeFavourites(list.includes(slug) ? list.filter((s) => s !== slug) : [slug, ...list]);
}

// The current list, kept in step across components, tabs and the static pages' script.
// `ready` is false on the server and during hydration, so server HTML and first paint match.
function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => { if (e.key === FAVOURITES_KEY) onChange(); };
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => { window.removeEventListener(EVENT, onChange); window.removeEventListener('storage', onStorage); };
}
function snapshot() {
  try { return localStorage.getItem(FAVOURITES_KEY) ?? '[]'; } catch { return '[]'; }
}

export function useFavourites() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  const list = useMemo(() => {
    if (raw === null) return [];
    try { const l = JSON.parse(raw); return Array.isArray(l) ? l.filter((s): s is string => typeof s === 'string') : []; } catch { return []; }
  }, [raw]);
  return { list, ready: raw !== null };
}
