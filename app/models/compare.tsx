'use client';

import React, { useEffect, useState } from 'react';

type Side = { glb: string; alt: string };
type Mode = 'both' | 'impacted' | 'normal';

type ModelViewerElement = HTMLElement & { cameraOrbit: string; getCameraOrbit: () => { toString: () => string } };

export function CompareViewer({ impacted, normal }: { impacted: Side; normal: Side }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [mode, setMode] = useState<Mode>('both');
  const [linked, setLinked] = useState(true);
  const [left, setLeft] = useState<ModelViewerElement | null>(null);
  const [right, setRight] = useState<ModelViewerElement | null>(null);

  useEffect(() => {
    let active = true;
    import('@google/model-viewer').then(() => { if (active) setReady(true); }).catch(() => { if (active) setFailed(true); });
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
    <div className="compare">
      <div className="compare-controls">
        <div className="segmented segmented-3" role="group" aria-label="Which model to show">
          <button type="button" aria-pressed={mode === 'both'} onClick={() => setMode('both')}>Side by side</button>
          <button type="button" aria-pressed={mode === 'impacted'} onClick={() => setMode('impacted')}>Impacted</button>
          <button type="button" aria-pressed={mode === 'normal'} onClick={() => setMode('normal')}>Normal</button>
        </div>
        {mode === 'both' ? (
          <label className="compare-link">
            <input type="checkbox" checked={linked} onChange={(event) => setLinked(event.target.checked)} />
            Turn both together
          </label>
        ) : null}
      </div>
      <p className="compare-diff"><strong>Only the wisdom tooth differs.</strong> Impacted: tilted forward against the second molar, roots around the nerve (red). Normal: upright and erupted, in line with the other molars.</p>
      <div className={`compare-stage compare-${mode}`}>
        {(['impacted', 'normal'] as const).map((key) => (
          <figure key={key} className="compare-pane" hidden={mode !== 'both' && mode !== key}>
            <figcaption><span className={`compare-dot ${key}`} aria-hidden="true" />{key === 'impacted' ? 'Impacted (mesioangular)' : 'Matched normal (erupted)'}</figcaption>
            {ready ? viewer(key === 'impacted' ? impacted : normal, key === 'impacted' ? setLeft : setRight) : <div className="compare-model compare-loading" role="status">{failed ? 'The 3D viewer could not load. Use the download links below to open the model.' : 'Loading 3D model…'}</div>}
          </figure>
        ))}
      </div>
      <p className="model-help compare-help">Drag to rotate · Scroll or pinch to zoom · On a phone, tap the AR icon to place the model on a table</p>
    </div>
  );
}
