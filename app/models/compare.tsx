'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/context';
import { plain, Ruby } from '../i18n/ruby';
import { PartsPanel, type ModelViewerElement as PartsViewer } from '../model-parts';

type Side = { glb: string; alt: string };
type Mode = 'both' | 'impacted' | 'normal';

type ModelViewerElement = PartsViewer;

// Parts that can be hidden on both models at once (material names in the GLBs).
const partNames = ['bone', 'nerve red', 'wisdom tooth', 'teeth'];

export function CompareViewer({ impacted, normal }: { impacted: Side; normal: Side }) {
  const { t } = useI18n();
  const c = t.compare;
  const frame = useRef<HTMLDivElement>(null);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frame.current?.requestFullscreen?.();
  };
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [mode, setMode] = useState<Mode>('both');
  const [linked, setLinked] = useState(true);
  const [left, setLeft] = useState<ModelViewerElement | null>(null);
  const [right, setRight] = useState<ModelViewerElement | null>(null);
  const [loads, setLoads] = useState(0);

  // Count model loads so the parts buttons can list and re-apply the parts of both models.
  useEffect(() => {
    const viewers = [left, right].filter(Boolean) as ModelViewerElement[];
    const onLoad = () => setLoads((n) => n + 1);
    viewers.forEach((v) => v.addEventListener('load', onLoad));
    return () => viewers.forEach((v) => v.removeEventListener('load', onLoad));
  }, [left, right]);

  useEffect(() => {
    let active = true;
    // Draco-compressed models: use the decoder this site serves, so no request goes to gstatic.com (blocked in mainland China).
    (self as unknown as { ModelViewerElement?: object }).ModelViewerElement = { dracoDecoderLocation: '/development/vendor/draco/' };
    import('@google/model-viewer').then(() => { if (active) { setReady(true); setCanFullscreen(Boolean(document.fullscreenEnabled)); } }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ready || !linked) return;
    const a = left;
    const b = right;
    if (!a || !b) return;
    const follow = (from: ModelViewerElement, to: ModelViewerElement) => (event: Event) => {
      const detail = (event as CustomEvent<{ source: string }>).detail;
      if (detail?.source !== 'user-interaction') return;
      to.cameraOrbit = from.getCameraOrbit().toString();
    };
    const fromA = follow(a, b);
    const fromB = follow(b, a);
    a.addEventListener('camera-change', fromA);
    b.addEventListener('camera-change', fromB);
    return () => {
      a.removeEventListener('camera-change', fromA);
      b.removeEventListener('camera-change', fromB);
    };
  }, [ready, linked, left, right]);

  const viewer = (side: Side, ref: (element: ModelViewerElement | null) => void) => React.createElement('model-viewer', {
    ref,
    src: side.glb,
    alt: side.alt,
    'camera-controls': true,
    'touch-action': 'pan-y',
    'camera-orbit': '90deg 80deg auto',
    'field-of-view': '30deg',
    'shadow-intensity': '0.6',
    'environment-image': 'neutral',
    'interaction-prompt': 'none',
    ar: true,
    'ar-modes': 'webxr scene-viewer quick-look',
    className: 'compare-model',
  });

  return (
    <div className="compare" ref={frame}>
      <div className="compare-controls">
        <div className="segmented segmented-3" role="group" aria-label={plain(c.which)}>
          <button type="button" aria-pressed={mode === 'both'} onClick={() => setMode('both')}><Ruby text={c.both} /></button>
          <button type="button" aria-pressed={mode === 'impacted'} onClick={() => setMode('impacted')}><Ruby text={c.impacted} /></button>
          <button type="button" aria-pressed={mode === 'normal'} onClick={() => setMode('normal')}><Ruby text={c.normal} /></button>
        </div>
        {mode === 'both' ? (
          <label className="compare-link">
            <input type="checkbox" checked={linked} onChange={(event) => setLinked(event.target.checked)} />
            <Ruby text={c.together} />
          </label>
        ) : null}
        {canFullscreen ? (
          <button type="button" className="icon-button on-dark compare-fullscreen" onClick={toggleFullscreen} aria-label={plain(t.model.fullscreen)} title={plain(t.model.fullscreen)}>
            <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
          </button>
        ) : null}
      </div>
      <p className="compare-diff"><strong><Ruby text={c.diffLead} /></strong> <Ruby text={c.diff} /></p>
      <div className={`compare-stage compare-${mode}`}>
        {(['impacted', 'normal'] as const).map((key) => (
          <figure key={key} className="compare-pane" hidden={mode !== 'both' && mode !== key}>
            <figcaption><span className={`compare-dot ${key}`} aria-hidden="true" /><Ruby text={key === 'impacted' ? c.impactedCaption : c.normalCaption} /></figcaption>
            {ready ? viewer(key === 'impacted' ? impacted : normal, key === 'impacted' ? setLeft : setRight) : <div className="compare-model compare-loading" role="status"><Ruby text={failed ? c.failed : c.loading} /></div>}
          </figure>
        ))}
      </div>
      <div className="compare-parts"><PartsPanel getViewers={() => [left, right]} names={partNames} version={loads} /></div>
      <p className="model-help compare-help"><Ruby text={c.help} /></p>
    </div>
  );
}
