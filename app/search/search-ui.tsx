'use client';
import { useEffect, useRef } from 'react';

// Pagefind UI (MIT) over the index in public/pagefind/ (built by tools/search/build-index.mjs).
// The index has one bundle per language; Pagefind picks it from <html lang>. Pages were indexed
// under /en/... and /ja/..., so result links are rewritten back to the real URL, with ?lang=ja
// for Japanese results (the worker turns ?lang= into the language cookie).

declare global {
  interface Window { PagefindUI?: new (options: Record<string, unknown>) => unknown }
}

export function SearchUI({ locale, translations }: { locale: string; translations: Record<string, string> }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let cancelled = false;
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/pagefind/pagefind-ui.css';
    document.head.append(css);
    const script = document.createElement('script');
    script.src = '/pagefind/pagefind-ui.js';
    script.onload = () => {
      if (cancelled || !window.PagefindUI) return;
      element.replaceChildren();
      new window.PagefindUI({
        element,
        showSubResults: true,
        showImages: false,
        resetStyles: false,
        translations,
        processResult: (result: { url: string; sub_results?: { url: string }[] }) => {
          // /en/models/ -> /models/ ; /ja/head-neck/scc/#x -> /head-neck/scc/?lang=ja#x
          const fix = (url: string) => {
            const match = url.match(/^\/(en|ja)(\/[^#]*)(#.*)?$/);
            return match ? `${match[2]}${match[1] === 'ja' ? '?lang=ja' : ''}${match[3] || ''}` : url;
          };
          result.url = fix(result.url);
          for (const sub of result.sub_results || []) sub.url = fix(sub.url);
          return result;
        },
      });
      const input = element.querySelector('input');
      if (input) input.focus();
    };
    document.head.append(script);
    return () => { cancelled = true; script.remove(); css.remove(); };
  }, [locale, translations]);
  return <div ref={ref} className="search-ui" lang={locale === 'ja' ? 'ja' : 'en'} />;
}
