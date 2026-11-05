'use client';

import React, { useState } from 'react';
import { FURIGANA_COOKIE, LOCALE_COOKIE, localeNames, locales, localeTags, type Locale } from './config';
import { useI18n } from './context';
import { plain } from './ruby';

const YEAR = 60 * 60 * 24 * 365;

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${YEAR}; samesite=lax`;
}

// Language choice plus, in Japanese, a furigana on/off switch. Changing language reloads the
// page so every server-rendered string, the metadata and <html lang> change together.
export function LanguageSwitcher({ furigana: initialFurigana, className = '' }: { furigana: boolean; className?: string }) {
  const { locale, t } = useI18n();
  const [furigana, setFurigana] = useState(initialFurigana);

  function choose(next: Locale) {
    if (next === locale) return;
    setCookie(LOCALE_COOKIE, next);
    window.location.reload();
  }

  function toggleFurigana() {
    const next = !furigana;
    setCookie(FURIGANA_COOKIE, next ? 'on' : 'off');
    // CSS hides the readings, so no reload is needed.
    document.documentElement.dataset.furigana = next ? 'on' : 'off';
    setFurigana(next);
  }

  return (
    <div className={`language-switcher ${className}`.trim()} role="group" aria-label={plain(t.language.label)}>
      <img aria-hidden="true" className="ui-icon" src="/icons/language.svg" width={20} height={20} alt="" />
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          lang={localeTags[code].html}
          aria-pressed={code === locale}
          onClick={() => choose(code)}
        >
          {localeNames[code]}
        </button>
      ))}
      {locale === 'ja' ? (
        <button type="button" className="furigana-toggle" aria-pressed={furigana} onClick={toggleFurigana} title={plain(t.language.furiganaHint)}>
          {t.language.furigana}
        </button>
      ) : null}
    </div>
  );
}
