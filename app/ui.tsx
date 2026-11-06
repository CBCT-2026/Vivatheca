'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { THEME_KEY } from './theme';
import { primaryLinks } from './nav';
import { disclaimerHref } from './disclaimer-text';
import { abgSources, abgStages } from './abg';
import { useI18n } from './i18n/context';
import { format } from './i18n/dictionaries';
import { plain, Ruby } from './i18n/ruby';
import { LanguageSwitcher } from './i18n/switcher';

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return <img aria-hidden="true" className="ui-icon" src={`/icons/${name}.svg`} width={size} height={size} alt="" />;
}

export function MobileNavigation({ furigana }: { furigana: boolean }) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <div className="mobile-nav">
      <button className="icon-button" type="button" aria-label={plain(open ? t.nav.close : t.nav.open)} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <Icon name={open ? 'close' : 'menu'} size={24} />
      </button>
      {open ? (
        <nav className="mobile-nav-panel" aria-label={plain(t.nav.mobile)}>
          {primaryLinks(t, true).map((link) => <a key={link.href} href={link.href} onClick={link.href.startsWith('#') ? () => setOpen(false) : undefined}><Ruby text={link.href === '/create' ? t.nav.createInfo : link.href === '/learn' ? t.nav.studentsMobile : link.label} /></a>)}
          <a href="#collection" onClick={() => setOpen(false)}><Ruby text={t.nav.tryViewer} /></a>
          <a href="/report"><Ruby text={t.nav.report} /></a>
          <a href="#contact" onClick={() => setOpen(false)}><Ruby text={t.contact.heading} /></a>
          {locale === 'ja' ? <LanguageSwitcher furigana={furigana} className="in-menu" furiganaOnly /> : null}
        </nav>
      ) : null}
    </div>
  );
}

function Cites({ ids, label }: { ids: number[]; label: string }) {
  return <>{ids.map((id) => <sup key={id} className="cite"><a href={`#model-ref-${id}`} aria-label={plain(format(label, { n: id }))} onClick={() => document.querySelector('.model-sources')?.setAttribute('open', '')}>{id}</a></sup>)}</>;
}

type ModelViewerElement = HTMLElement & { model?: { materials: { name: string; setAlphaMode: (mode: string) => void; pbrMetallicRoughness: { baseColorFactor: number[]; setBaseColorFactor: (c: number[]) => void } }[] } };

// Homepage interactive section: the alveolar bone graft series, three stages (models from CBCT-2026/ABG).
export function ModelExperience() {
  const { t } = useI18n();
  const m = t.model;
  const a = t.abg;
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState(0);
  const [detail, setDetail] = useState<'plain' | 'clinical'>('plain');
  const [rotationEnabled, setRotationEnabled] = useState(true);
  const [gumOff, setGumOff] = useState(false);
  const [hasGum, setHasGum] = useState(false);
  const viewerFrame = useRef<HTMLDivElement>(null);
  const viewer = useRef<ModelViewerElement>(null);

  useEffect(() => {
    let active = true;
    // The ABG models are Draco-compressed; use the decoder this site already serves (no outside requests).
    (self as unknown as { ModelViewerElement?: object }).ModelViewerElement = { dracoDecoderLocation: '/development/vendor/draco/' };
    import('@google/model-viewer').then(() => { if (active) setReady(true); });
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

  // The gum part is the material named "gum" (CBCT-2026/ABG docs/model-spec.md). Hiding it shows the bone.
  const gumMaterial = () => viewer.current?.model?.materials.find((material) => material.name.replace(/\.\d+$/, '') === 'gum');
  function setGum(off: boolean) {
    const material = gumMaterial();
    if (!material) return;
    const colour = material.pbrMetallicRoughness.baseColorFactor.slice(0, 3);
    material.setAlphaMode(off ? 'BLEND' : 'OPAQUE');
    material.pbrMetallicRoughness.setBaseColorFactor([...colour, off ? 0 : 1]);
    setGumOff(off);
  }

  useEffect(() => {
    const element = viewer.current;
    if (!ready || !element) return;
    const onLoad = () => { setHasGum(Boolean(gumMaterial())); setGumOff(false); };
    element.addEventListener('load', onLoad);
    return () => element.removeEventListener('load', onLoad);
  }, [ready]);

  function chooseStage(index: number) {
    if (index === stage) return;
    setHasGum(false);
    setGumOff(false);
    setStage(index);
  }

  async function enterFullscreen() {
    await viewerFrame.current?.requestFullscreen?.();
  }

  const current = abgStages[stage];
  const text = a.stages[stage];
  const modelViewer = React.createElement('model-viewer', {
    ref: viewer,
    src: current.src,
    poster: current.poster,
    alt: plain(text.alt),
    'camera-controls': true,
    'touch-action': 'pan-y',
    'auto-rotate': rotationEnabled || undefined,
    'auto-rotate-delay': '0',
    'rotation-per-second': '18deg',
    'shadow-intensity': '0.7',
    'environment-image': 'neutral',
    'camera-orbit': '0deg 75deg auto',
    'field-of-view': '30deg',
    reveal: 'auto',
    'interaction-prompt': 'none',
    ar: true,
    'ar-modes': 'webxr scene-viewer',
    className: 'model-viewer',
  });

  return (
    <div className="model-experience">
      <div className="model-stage" ref={viewerFrame}>
        <div className="model-stage-topline">
          <span className="status-chip"><span className="status-dot" /><Ruby text={a.status} /></span>
          <div className="model-actions">
            <button type="button" className="rotation-button" onClick={() => setRotationEnabled((value) => !value)} aria-pressed={rotationEnabled}>
              <Ruby text={rotationEnabled ? m.pause : m.resume} />
            </button>
            {hasGum ? (
              <button type="button" className="rotation-button" onClick={() => setGum(!gumOff)} aria-pressed={gumOff}>
                <Ruby text={gumOff ? a.gumOn : a.gumOff} />
              </button>
            ) : null}
            <button type="button" className="icon-button on-dark" onClick={enterFullscreen} aria-label={plain(m.fullscreen)}><Icon name="fullscreen" size={22} /></button>
          </div>
        </div>
        {ready ? modelViewer : <div className="model-loading" role="status"><Ruby text={m.loading} /></div>}
        <p className="model-help"><Ruby text={m.help} /></p>
      </div>
      <div className="model-copy">
        <div className="segmented segmented-stages" role="group" aria-label={plain(a.stagesLabel)}>
          {a.stages.map((item, index) => (
            <button key={item.label} type="button" aria-pressed={stage === index} onClick={() => chooseStage(index)}><Ruby text={item.label} /></button>
          ))}
        </div>
        <div className="segmented" role="group" aria-label={plain(m.level)}>
          <button type="button" aria-pressed={detail === 'plain'} onClick={() => setDetail('plain')}><Ruby text={m.plain} /></button>
          <button type="button" aria-pressed={detail === 'clinical'} onClick={() => setDetail('clinical')}><Ruby text={m.clinical} /></button>
        </div>
        <p className="model-index"><Ruby text={format(m.stepOf, { label: text.when, n: stage + 1, total: abgStages.length })} /></p>
        <h3><Ruby text={text.title} /></h3>
        <p><Ruby text={detail === 'plain' ? text.text : text.clinical} /><Cites ids={current.cites[detail]} label={m.sourceLabel} /></p>
        <p className="licence-note"><Ruby text={a.made} /></p>
        <details className="model-sources">
          <summary><Ruby text={m.sources} /></summary>
          <p><Ruby text={a.simplified} /></p>
          <ol lang="en">{abgSources.map((source) => <li key={source.id} id={`model-ref-${source.id}`}>{source.text} <a href={source.href} target="_blank" rel="noreferrer">{source.href.replace('https://', '')}</a></li>)}</ol>
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
