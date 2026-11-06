'use client';

import React, { useState } from 'react';
import { FURIGANA_COOKIE, LOCALE_COOKIE, localeNames, localeShortNames, locales, localeTags, type Locale } from './config';
import { useI18n } from './context';
import { plain } from './ruby';

const YEAR = 60 * 60 * 24 * 365;

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${YEAR}; samesite=lax`;
}

// Language choice plus, in Japanese, a furigana on/off switch. It stays in the header on
// phones too (short labels there); the mobile menu repeats only the furigana switch. Changing language reloads the
// page so every server-rendered string, the metadata and <html lang> change together.
export function LanguageSwitcher({ furigana: initialFurigana, className = '', furiganaOnly = false }: { furigana: boolean; className?: string; furiganaOnly?: boolean }) {
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
      {furiganaOnly ? null : locales.map((code) => (
        <button
          key={code}
          type="button"
          lang={localeTags[code].html}
          aria-pressed={code === locale}
          // Phones show only the short name, so the label carries both (axe label-content-name-mismatch).
          aria-label={`${localeShortNames[code]} ${localeNames[code]}`}
          onClick={() => choose(code)}
        >
          <span className="lang-full">{localeNames[code]}</span>
          <span className="lang-short" aria-hidden="true">{localeShortNames[code]}</span>
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
