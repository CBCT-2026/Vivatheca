'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { THEME_KEY } from './theme';
import { primaryLinks } from './nav';
import { disclaimerHref } from './disclaimer-text';
import { abgOptions, abgSources, abgStages, abgViews } from './abg';
import { fadePart, materialsNamed, PartsPanel, playClip, showPart, type ModelViewerElement } from './model-parts';
import { useI18n } from './i18n/context';
import { format } from './i18n/dictionaries';
import { plain, Ruby } from './i18n/ruby';
import { LanguageSwitcher } from './i18n/switcher';

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return <img aria-hidden="true" className="ui-icon" src={`/icons/${name}.svg`} width={size} height={size} alt="" />;
}

// Phone menu. On the homepage the section links stay as #anchors; elsewhere they point back to the homepage.
export function MobileNavigation({ furigana, onHome = true }: { furigana: boolean; onHome?: boolean }) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const home = onHome ? '' : '/';
  const close = () => setOpen(false);
  return (
    <div className="mobile-nav">
      <button className="icon-button" type="button" aria-label={plain(open ? t.nav.close : t.nav.open)} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <Icon name={open ? 'close' : 'menu'} size={24} />
      </button>
      {open ? (
        <nav className="mobile-nav-panel" aria-label={plain(t.nav.mobile)}>
          {/* Same labels as the desktop bar (app/nav.ts). */}
          {primaryLinks(t, onHome).map((link) => <a key={link.href} href={link.href} onClick={close}><Ruby text={link.label} /></a>)}
          <a href={`${home}#collection`} onClick={close}><Ruby text={t.nav.tryViewer} /></a>
          <a href="/report"><Ruby text={t.nav.report} /></a>
          <a href="#contact" onClick={close}><Ruby text={t.contact.heading} /></a>
          {locale === 'ja' ? <LanguageSwitcher furigana={furigana} className="in-menu" furiganaOnly /> : null}
        </nav>
      ) : null}
    </div>
  );
}

function Cites({ ids, label }: { ids: number[]; label: string }) {
  return <>{ids.map((id, i) => <sup key={id} className={i ? 'cite cite-more' : 'cite'}><a href={`#model-ref-${id}`} aria-label={plain(format(label, { n: id }))} onClick={() => document.querySelector('.model-sources')?.setAttribute('open', '')}>{id}</a></sup>)}</>;
}

// Homepage interactive section: the alveolar bone graft series, three stages (models from CBCT-2026/ABG).
// Viewer tools follow the CBCT-2026/ABG pages: preset views, labels on the model, the gum part slides off
// (its own 'remove' clip) and fades out, braces come off in stage 2, and stage 3 shows the ways to fill the gap
// (one option part at a time, or a second model for moving the eye tooth). Other parts can be hidden too.
const abgPartNames = ['bone', 'teeth', 'canine', 'graft'];

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
  const [busy, setBusy] = useState(false);
  const [bracesOn, setBracesOn] = useState(true);
  const [hasBraces, setHasBraces] = useState(false);
  const [option, setOption] = useState('option-none');
  const [labels, setLabels] = useState(true);
  const [view, setView] = useState<string | null>('whole');
  const [loads, setLoads] = useState(0);
  const viewerFrame = useRef<HTMLDivElement>(null);
  const viewer = useRef<ModelViewerElement>(null);

  useEffect(() => {
    let active = true;
    // Draco-compressed models: use the decoder this site serves, so no request goes to gstatic.com (blocked in mainland China).
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

  const current = abgStages[stage];
  const chosen = abgOptions.find((item) => item.id === option)!;
  const substitution = stage === 2 && Boolean(chosen.src);
  const src = substitution ? chosen.src! : current.src;
  const poster = substitution ? chosen.poster! : current.poster;

  // Stage 3 option parts: only the chosen one shows (CBCT-2026/ABG site.js).
  const applyOption = (picked: string) => {
    abgOptions.forEach((item) => { if (!item.src) showPart(viewer.current, item.id, item.id === picked); });
  };

  useEffect(() => {
    const element = viewer.current;
    if (!ready || !element) return;
    const onLoad = () => {
      setHasGum(materialsNamed(element, 'gum').length > 0);
      setHasBraces(materialsNamed(element, 'braces').length > 0);
      setGumOff(false);
      setBracesOn(true);
      applyOption(option);
      setLoads((n) => n + 1);
    };
    element.addEventListener('load', onLoad);
    return () => element.removeEventListener('load', onLoad);
  });

  // The gum slides down off the jaw (clip "remove"), then fades out; it comes back the other way.
  async function toggleGum() {
    if (busy) return;
    setBusy(true);
    if (!gumOff) {
      await playClip(viewer.current, 'remove');
      await fadePart(viewer.current, 'gum', 1, 0, 450);
      setGumOff(true);
    } else {
      setGumOff(false);
      await fadePart(viewer.current, 'gum', 0, 1, 300);
      await playClip(viewer.current, 'replace');
    }
    setBusy(false);
  }

  function toggleBraces() {
    showPart(viewer.current, 'braces', !bracesOn);
    setBracesOn(!bracesOn);
  }

  function chooseOption(id: string) {
    if (busy || id === option) return;
    const next = abgOptions.find((item) => item.id === id)!;
    const swaps = Boolean(next.src) !== Boolean(chosen.src);
    setOption(id);
    if (swaps) { setHasGum(false); setGumOff(false); } else applyOption(id);
  }

  function chooseView(key: string) {
    const preset = abgViews.find((item) => item.key === key)!;
    const element = viewer.current;
    if (!element) return;
    setRotationEnabled(false);
    element.resetTurntableRotation?.(0);
    element.cameraOrbit = preset.orbit;
    element.cameraTarget = preset.target;
    setView(key);
  }

  useEffect(() => {
    const element = viewer.current;
    if (!ready || !element) return;
    // Labels face the way their normal points; hide the ones on the far side of the model. (model-viewer 4's own
    // data-visible test reported every label as hidden for these models, so the check is done here.)
    const faceLabels = () => {
      const orbit = element.getCameraOrbit();
      // Auto-rotate turns the model itself (turntable), so the camera's angle to the model is theta minus that turn.
      const theta = orbit.theta - (element.turntableRotation ?? 0);
      const view = [Math.sin(orbit.phi) * Math.sin(theta), Math.cos(orbit.phi), Math.sin(orbit.phi) * Math.cos(theta)];
      element.querySelectorAll<HTMLElement>('.hotspot').forEach((spot) => {
        const normal = (spot.dataset.normal ?? '0 0 1').split(' ').map(Number);
        spot.dataset.facing = String(normal[0] * view[0] + normal[1] * view[1] + normal[2] * view[2] > 0.05);
      });
    };
    const onCamera = (event: Event) => {
      faceLabels();
      if ((event as CustomEvent<{ source: string }>).detail?.source === 'user-interaction') setView(null);
    };
    element.addEventListener('camera-change', onCamera);
    element.addEventListener('load', faceLabels);
    // Auto-rotate and turntable resets do not fire camera-change, so check the labels a few times a second.
    const timer = window.setInterval(faceLabels, 250);
    return () => { element.removeEventListener('camera-change', onCamera); element.removeEventListener('load', faceLabels); window.clearInterval(timer); };
  }, [ready]);

  function chooseStage(index: number) {
    if (index === stage || busy) return;
    setHasGum(false);
    setHasBraces(false);
    setGumOff(false);
    setOption('option-none');
    setStage(index);
  }

  async function enterFullscreen() {
    await viewerFrame.current?.requestFullscreen?.();
  }

  const text = a.stages[stage];
  const optionIndex = abgOptions.findIndex((item) => item.id === option);
  const shown = (show?: string) => {
    if (show === 'gum') return !gumOff;
    if (show === 'bone') return gumOff;
    if (show === 'braces') return bracesOn;
    if (show === 'main') return !substitution;
    if (show === 'sub') return substitution;
    return true;
  };
  const hotspots = labels && hasGum ? current.hotspots.filter((spot) => shown(spot.show)).map((spot) => {
    const [name, note] = a.hotspots[spot.key];
    return (
      <div key={`${stage}-${spot.key}`} className="hotspot" slot={`hotspot-${spot.key}`} data-position={spot.position} data-normal={spot.normal} data-facing="true" data-side={spot.side} style={{ '--len': `${spot.len}px` } as React.CSSProperties}>
        <span className="hotspot-label"><Ruby text={name} /><small><Ruby text={note} /></small></span>
      </div>
    );
  }) : null;
  const modelViewer = React.createElement('model-viewer', {
    ref: viewer,
    src,
    poster,
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
  }, hotspots);

  return (
    <div className="model-experience">
      <div className="model-stage" ref={viewerFrame}>
        <div className="model-stage-topline">
          <span className="status-chip"><Ruby text={a.status} /></span>
          <div className="model-actions">
            <button type="button" className="rotation-button" onClick={() => setRotationEnabled((value) => !value)} aria-pressed={rotationEnabled}>
              <Ruby text={rotationEnabled ? m.pause : m.resume} />
            </button>
            <button type="button" className="icon-button on-dark" onClick={enterFullscreen} aria-label={plain(m.fullscreen)}><Icon name="fullscreen" size={22} /></button>
          </div>
        </div>
        {ready ? modelViewer : <div className="model-loading" role="status"><Ruby text={m.loading} /></div>}
        <div className="model-tools">
          <div className="chip-row" role="group" aria-label={plain(a.viewsLabel)}>
            {abgViews.map((preset) => (
              <button key={preset.key} type="button" className="chip" aria-pressed={view === preset.key} onClick={() => chooseView(preset.key)}><Ruby text={a.views[preset.key]} /></button>
            ))}
            <button type="button" className="chip" aria-pressed={labels} onClick={() => setLabels((value) => !value)}><Ruby text={labels ? a.labelsHide : a.labelsShow} /></button>
            {hasGum ? (
              <button type="button" className="chip chip-strong" aria-pressed={gumOff} disabled={busy} onClick={toggleGum}><Ruby text={gumOff ? a.gumOn : a.gumOff} /></button>
            ) : null}
            {hasBraces ? (
              <button type="button" className="chip chip-strong" aria-pressed={!bracesOn} onClick={toggleBraces}><Ruby text={bracesOn ? a.bracesOff : a.bracesOn} /></button>
            ) : null}
          </div>
          {stage === 2 ? (
            <div className="chip-row" role="group" aria-label={plain(a.optionsLabel)}>
              <span className="chip-row-label"><Ruby text={a.optionsLabel} /></span>
              {abgOptions.map((item, index) => (
                <button key={item.id} type="button" className="chip" aria-pressed={option === item.id} disabled={busy} onClick={() => chooseOption(item.id)}><Ruby text={a.options[index].label} /></button>
              ))}
            </div>
          ) : null}
          <PartsPanel getViewers={() => [viewer.current]} names={abgPartNames} version={loads} />
          <p className="model-help"><Ruby text={m.help} /></p>
        </div>
      </div>
      <div className="model-copy">
        <div className="segmented segmented-stages" role="group" aria-label={plain(a.stagesLabel)}>
          {a.stages.map((item, index) => (
            <button key={item.label} type="button" data-stage-index={index} aria-pressed={stage === index} onClick={() => chooseStage(index)}><Ruby text={item.label} /></button>
          ))}
        </div>
        <div className="segmented" role="group" aria-label={plain(m.level)}>
          <button type="button" aria-pressed={detail === 'plain'} onClick={() => setDetail('plain')}><Ruby text={m.plain} /></button>
          <button type="button" aria-pressed={detail === 'clinical'} onClick={() => setDetail('clinical')}><Ruby text={m.clinical} /></button>
        </div>
        <p className="model-index"><Ruby text={format(m.stepOf, { label: text.when, n: stage + 1, total: abgStages.length })} /></p>
        <h3><Ruby text={text.title} /></h3>
        <p><Ruby text={detail === 'plain' ? text.text : text.clinical} /><Cites ids={current.cites[detail]} label={m.sourceLabel} /></p>
        {stage === 2 ? (
          <p className="option-note" aria-live="polite"><strong><Ruby text={a.options[optionIndex].label} />:</strong> <Ruby text={a.options[optionIndex].text} /><Cites ids={abgOptions[optionIndex].cites} label={m.sourceLabel} /></p>
        ) : null}
        <p className="licence-note"><Ruby text={a.made} /> <a href="/models/alveolar-bone-graft#downloads"><Ruby text={a.downloadsLink} /></a></p>
        <details className="model-sources">
          <summary><Ruby text={m.sources} /></summary>
          <p><Ruby text={a.simplified} /></p>
          <ol lang="en">{abgSources.map((source) => <li key={source.id} id={`model-ref-${source.id}`}>{source.text} <a className="url" href={source.href} target="_blank" rel="noreferrer">{source.href.replace('https://', '')}</a></li>)}</ol>
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
  vi: { dark: 'Chế độ tối', light: 'Chế độ sáng' },
} as const;

// Reads the <html> data-theme and lang attributes, re-rendering when either changes.
function subscribeToRoot(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'lang'] });
  return () => observer.disconnect();
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToRoot, () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'), () => 'light');
  const lang = useSyncExternalStore(subscribeToRoot, () => { const l = document.documentElement.lang.slice(0, 2); return l in themeLabels ? l : 'en'; }, () => 'en') as keyof typeof themeLabels;
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
