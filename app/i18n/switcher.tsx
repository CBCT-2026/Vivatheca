'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { FURIGANA_COOKIE, LOCALE_COOKIE, languageMenu, type Locale } from './config';
import { useI18n } from './context';
import { plain, Ruby } from './ruby';

const YEAR = 60 * 60 * 24 * 365;

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${YEAR}; samesite=lax`;
}

// Language menu plus, in Japanese, a furigana on/off switch. The button shows the current
// language and its flag (only the flag on phones); the menu lists every language in its own
// name with its flag, including those not translated yet. The mobile menu repeats only the
// furigana switch. Changing language reloads the page so every server-rendered string, the
// metadata and <html lang> change together.
export function LanguageSwitcher({ furigana: initialFurigana, className = '', furiganaOnly = false }: { furigana: boolean; className?: string; furiganaOnly?: boolean }) {
  const { locale, t } = useI18n();
  const [furigana, setFurigana] = useState(initialFurigana);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => { if (!menuRef.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); } };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onPointer); document.removeEventListener('keydown', onKey); };
  }, [open]);

  function choose(next: Locale) {
    setOpen(false);
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

  const label = plain(t.language.label);
  const soon = plain(t.language.comingSoon);
  const current = languageMenu.find((item) => item.locale === locale) ?? languageMenu[0];
  const flag = (code: string) => <img aria-hidden="true" className="lang-flag" src={`/flags/${code}.svg`} width={20} height={15} alt="" />;

  return (
    <div className={`language-switcher ${className}`.trim()} role="group" aria-label={label}>
      {furiganaOnly ? null : (
        <div className="lang-menu" ref={menuRef}>
          <button
            ref={triggerRef}
            type="button"
            className="lang-trigger"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={`${label}: ${current.name}`}
            onClick={() => setOpen(!open)}
          >
            <img aria-hidden="true" className="ui-icon" src="/icons/language.svg" width={20} height={20} alt="" />
            <span className="lang-full" lang={current.tag}>{current.name}</span>
            {flag(current.flag)}
            <span className="lang-chevron" aria-hidden="true" />
          </button>
          <ul className="lang-panel" id={panelId} hidden={!open}>
            {languageMenu.map((item) => (
              <li key={item.tag}>
                {item.locale ? (
                  <button type="button" lang={item.tag} aria-current={item.locale === locale ? 'true' : undefined} onClick={() => choose(item.locale as Locale)}>
                    <span className="lang-name">{item.name}</span>
                    {flag(item.flag)}
                  </button>
                ) : (
                  // Not translated yet: listed so visitors know it is planned, but it does nothing.
                  <button type="button" lang={item.tag} className="lang-soon" aria-disabled="true" aria-label={`${item.name} (${soon})`}>
                    <span className="lang-name">{item.name}</span>
                    {flag(item.flag)}
                    <span className="lang-soon-note" lang={locale}><Ruby text={t.language.comingSoon} /></span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {locale === 'ja' ? (
        <button type="button" className="furigana-toggle" aria-pressed={furigana} onClick={toggleFurigana} title={plain(t.language.furiganaHint)}>
          {t.language.furigana}
        </button>
      ) : null}
    </div>
  );
}
