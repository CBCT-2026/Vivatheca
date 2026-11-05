'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { THEME_KEY } from './theme';
import { disclaimerHref } from './disclaimer-text';
import { useI18n } from './i18n/context';
import { format } from './i18n/dictionaries';
import { plain, Ruby } from './i18n/ruby';
import { LanguageSwitcher } from './i18n/switcher';

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return <img aria-hidden="true" className="ui-icon" src={`/icons/${name}.svg`} width={size} height={size} alt="" />;
}

export function MobileNavigation({ furigana }: { furigana: boolean }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <div className="mobile-nav">
      <button className="icon-button" type="button" aria-label={plain(open ? t.nav.close : t.nav.open)} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <Icon name={open ? 'close' : 'menu'} size={24} />
      </button>
      {open ? (
        <nav className="mobile-nav-panel" aria-label={plain(t.nav.mobile)}>
          <a href="#collection" onClick={() => setOpen(false)}><Ruby text={t.nav.browseCollection} /></a>
          <a href="#how-it-works" onClick={() => setOpen(false)}><Ruby text={t.nav.howItWorks} /></a>
          <a href="#publications" onClick={() => setOpen(false)}><Ruby text={t.nav.publications} /></a>
          <a href="#contribute" onClick={() => setOpen(false)}><Ruby text={t.nav.contribute} /></a>
          <a href="#sponsor" onClick={() => setOpen(false)}><Ruby text={t.nav.sponsor} /></a>
          <a href="/create"><Ruby text={t.nav.createInfo} /></a>
          <LanguageSwitcher furigana={furigana} className="in-menu" />
        </nav>
      ) : null}
    </div>
  );
}

// Sources (numbers in modelSources) supporting each tour step, plain and clinician text.
const tourCites = [
  { plain: [1], clinical: [1] },
  { plain: [2], clinical: [2, 3] },
  { plain: [] as number[], clinical: [] as number[] },
];

// Visible sources for the wisdom tooth model. Checked on PubMed, 5 November 2026.
// Citations stay in English, the language they were published in.
export const modelSources = [
  { id: 1, text: 'Winter GB. Principles of exodontia as applied to the impacted mandibular third molar. St Louis: American Medical Book Co; 1926. (Origin of the angulation terms used here.)' },
  { id: 2, text: 'Renton T. Oral surgery: part 4. Minimising and managing nerve injuries and other complications. Br Dent J. 2013;215(8):393-399.', href: 'https://doi.org/10.1038/sj.bdj.2013.993' },
  { id: 3, text: 'Reia VCB, de Toledo Telles-Araujo G, Peralta-Mamani M, et al. Diagnostic accuracy of CBCT compared to panoramic radiography in predicting IAN exposure: a systematic review and meta-analysis. Clin Oral Investig. 2021;25(8):4721-4733.', href: 'https://doi.org/10.1007/s00784-021-03942-4' },
];

function Cites({ ids, label }: { ids: number[]; label: string }) {
  return <>{ids.map((id) => <sup key={id} className="cite"><a href={`#model-ref-${id}`} aria-label={plain(format(label, { n: id }))} onClick={() => document.querySelector('.model-sources')?.setAttribute('open', '')}>{id}</a></sup>)}</>;
}

export const modelLicence = { name: 'CC BY-SA 4.0', href: 'https://creativecommons.org/licenses/by-sa/4.0/' };

export function ModelExperience() {
  const { t } = useI18n();
  const m = t.model;
  const tourSteps = m.tour;
  const [ready, setReady] = useState(false);
  const [favourite, setFavourite] = useState(false);
  const [step, setStep] = useState(0);
  const [detail, setDetail] = useState<'plain' | 'clinical'>('plain');
  const [rotationEnabled, setRotationEnabled] = useState(true);
  const viewerFrame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    import('@google/model-viewer').then(() => {
      if (active) {
        setReady(true);
        setFavourite(window.localStorage.getItem('vivatheca:favourite:impacted-molar') === 'true');
      }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const respectMotionPreference = (event: MediaQueryList | MediaQueryListEvent) => {
      if (event.matches) setRotationEnabled(false);
    };
    respectMotionPreference(motionPreference);
    motionPreference.addEventListener('change', respectMotionPreference);
    return () => motionPreference.removeEventListener('change', respectMotionPreference);
  }, []);

  function toggleFavourite() {
    const next = !favourite;
    setFavourite(next);
    window.localStorage.setItem('vivatheca:favourite:impacted-molar', String(next));
  }

  async function enterFullscreen() {
    await viewerFrame.current?.requestFullscreen?.();
  }

  const modelViewer = React.createElement('model-viewer', {
    src: '/models/impacted-molar.glb',
    alt: plain(m.alt),
    'camera-controls': true,
    'touch-action': 'pan-y',
    'auto-rotate': rotationEnabled || undefined,
    'auto-rotate-delay': '0',
    'rotation-per-second': '18deg',
    'shadow-intensity': '0.7',
    'environment-image': 'neutral',
    'camera-orbit': '90deg 80deg auto',
    'field-of-view': '30deg',
    reveal: 'auto',
    'interaction-prompt': 'none',
    ar: true,
    'ar-modes': 'webxr scene-viewer quick-look',
    className: 'model-viewer',
  });

  return (
    <div className="model-experience">
      <div className="model-stage" ref={viewerFrame}>
        <div className="model-stage-topline">
          <span className="status-chip"><span className="status-dot" /><Ruby text={m.status} /></span>
          <div className="model-actions">
            <button type="button" className="rotation-button" onClick={() => setRotationEnabled((value) => !value)} aria-pressed={rotationEnabled}>
              <Ruby text={rotationEnabled ? m.pause : m.resume} />
            </button>
            <button type="button" className="icon-button on-dark" onClick={toggleFavourite} aria-pressed={favourite} aria-label={plain(favourite ? m.favouriteRemove : m.favouriteAdd)}>
              <Icon name={favourite ? 'favorite' : 'favorite_border'} size={22} />
            </button>
            <button type="button" className="icon-button on-dark" onClick={enterFullscreen} aria-label={plain(m.fullscreen)}><Icon name="fullscreen" size={22} /></button>
          </div>
        </div>
        {ready ? modelViewer : <div className="model-loading" role="status"><Ruby text={m.loading} /></div>}
        <p className="model-help"><Ruby text={m.help} /></p>
      </div>
      <div className="model-copy">
        <div className="segmented" aria-label={plain(m.level)}>
          <button type="button" aria-pressed={detail === 'plain'} onClick={() => setDetail('plain')}><Ruby text={m.plain} /></button>
          <button type="button" aria-pressed={detail === 'clinical'} onClick={() => setDetail('clinical')}><Ruby text={m.clinical} /></button>
        </div>
        <h3><Ruby text={tourSteps[step].title} /></h3>
        <p className="model-index"><Ruby text={format(m.stepOf, { label: tourSteps[step].label, n: step + 1, total: tourSteps.length })} /></p>
        <p><Ruby text={detail === 'plain' ? tourSteps[step].text : tourSteps[step].clinical} /><Cites ids={tourCites[step][detail]} label={m.sourceLabel} /></p>
        <div className="tour-controls">
          <button type="button" className="text-button" disabled={step === 0} onClick={() => setStep((value) => value - 1)}><Ruby text={m.previous} /></button>
          <div className="tour-dots" aria-label={format(m.tourStep, { n: step + 1, total: tourSteps.length })}>{tourSteps.map((item, index) => <span key={item.label} className={index === step ? 'active' : ''} />)}</div>
          <button type="button" className="text-button" disabled={step === tourSteps.length - 1} onClick={() => setStep((value) => value + 1)}><Ruby text={m.next} /></button>
        </div>
        <div className="model-links">
          <a href="/models/impacted-molar.glb" download><Icon name="download" /><Ruby text={m.downloadGlb} /></a>
          <a href="/models/impacted-molar.stl" download><Icon name="print" /><Ruby text={m.downloadStl} /></a>
        </div>
        <p className="licence-note"><Ruby text={m.licence} /> <a href={modelLicence.href} target="_blank" rel="noreferrer">{modelLicence.name}</a>. <Ruby text={m.licenceNote} /></p>
        <details className="model-sources">
          <summary><Ruby text={m.sources} /></summary>
          <p><Ruby text={m.sourcesIntro} /></p>
          <ol lang="en">{modelSources.map((source) => <li key={source.id} id={`model-ref-${source.id}`}>{source.text}{source.href ? <> <a href={source.href} target="_blank" rel="noreferrer">{source.href.replace('https://', '')}</a></> : null}</li>)}</ol>
        </details>
        <p className="prototype-note"><strong><Ruby text={t.disclaimer.notReviewed} /></strong> <Ruby text={t.disclaimer.model} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a></p>
      </div>
    </div>
  );
}

// Site-wide light/dark switch (see theme.ts). The label names the mode it switches to.

const themeLabels = {
  en: { dark: 'Dark mode', light: 'Light mode' },
  ja: { dark: 'ダークモード', light: 'ライトモード' },
} as const;

// Reads the <html> data-theme and lang attributes, re-rendering when either changes.
function subscribeToRoot(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'lang'] });
  return () => observer.disconnect();
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToRoot, () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'), () => 'light');
  const lang = useSyncExternalStore(subscribeToRoot, () => (document.documentElement.lang.startsWith('ja') ? 'ja' : 'en'), () => 'en') as keyof typeof themeLabels;
  const next = theme === 'dark' ? 'light' : 'dark';
  const label = themeLabels[lang][next];
  const toggle = () => {
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch { /* storage blocked: the choice lasts for this page only */ }
  };
  return (
    <button className="theme-toggle" type="button" onClick={toggle} title={label}>
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24">
        {next === 'dark'
          ? <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 0 1-4.4 2.26 5.4 5.4 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
          : <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM2 13h2a1 1 0 0 0 0-2H2a1 1 0 0 0 0 2zm18 0h2a1 1 0 0 0 0-2h-2a1 1 0 0 0 0 2zM11 2v2a1 1 0 0 0 2 0V2a1 1 0 0 0-2 0zm0 18v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-2 0zM5.99 4.58a1 1 0 0 0-1.41 1.41l1.06 1.06a1 1 0 0 0 1.41-1.41L5.99 4.58zm12.37 12.37a1 1 0 0 0-1.41 1.41l1.06 1.06a1 1 0 0 0 1.41-1.41l-1.06-1.06zm1.06-10.96a1 1 0 0 0-1.41-1.41l-1.06 1.06a1 1 0 0 0 1.41 1.41l1.06-1.06zM7.05 18.36a1 1 0 0 0-1.41-1.41l-1.06 1.06a1 1 0 0 0 1.41 1.41l1.06-1.06z" />}
      </svg>
      <span className="theme-toggle-label" lang={lang}>{label}</span>
    </button>
  );
}
