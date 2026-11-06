'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/context';
import { Ruby } from '../../i18n/ruby';
import { type ModelViewerElement, PartsPanel } from '../../model-parts';

// The averaged jaw in model-viewer, with the shared take-apart tools (one material per part in the GLB).
export const averagedJawParts = ['mandible', 'teeth_lower'];

export function AveragedJawViewer({ src, alt }: { src: string; alt: string }) {
  const { t } = useI18n();
  const m = t.model;
  const [ready, setReady] = useState(false);
  const [loads, setLoads] = useState(0);
  const [rotationEnabled, setRotationEnabled] = useState(true);
  const viewer = useRef<ModelViewerElement>(null);

  useEffect(() => {
    let active = true;
    (self as unknown as { ModelViewerElement?: object }).ModelViewerElement = { dracoDecoderLocation: '/development/vendor/draco/' };
    import('@google/model-viewer').then(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = (event: MediaQueryList | MediaQueryListEvent) => { if (event.matches) setRotationEnabled(false); };
    apply(motion);
    motion.addEventListener('change', apply);
    return () => motion.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const element = viewer.current;
    if (!element) return;
    const onLoad = () => setLoads((n) => n + 1);
    element.addEventListener('load', onLoad);
    return () => element.removeEventListener('load', onLoad);
  }, [ready]);

  const modelViewer = React.createElement('model-viewer', {
    ref: viewer,
    src,
    alt,
    'camera-controls': true,
    'touch-action': 'pan-y',
    'auto-rotate': rotationEnabled || undefined,
    'auto-rotate-delay': '0',
    'rotation-per-second': '14deg',
    'shadow-intensity': '0.7',
    'environment-image': 'neutral',
    'camera-orbit': '20deg 80deg auto',
    'field-of-view': '30deg',
    reveal: 'auto',
    'interaction-prompt': 'none',
    ar: true,
    'ar-modes': 'webxr scene-viewer quick-look',
    className: 'model-viewer',
  });

  return (
    <div className="model-experience averaged-jaw-experience">
      <div className="model-stage">
        <div className="model-stage-topline">
          <span className="status-chip"><span className="status-dot" /><Ruby text={t.disclaimer.notReviewed} /></span>
          <div className="model-actions">
            <button type="button" className="rotation-button" onClick={() => setRotationEnabled((value) => !value)} aria-pressed={rotationEnabled}>
              <Ruby text={rotationEnabled ? m.pause : m.resume} />
            </button>
          </div>
        </div>
        {ready ? modelViewer : <div className="model-loading" role="status"><Ruby text={m.loading} /></div>}
        <div className="model-tools">
          <PartsPanel getViewers={() => [viewer.current]} names={averagedJawParts} version={loads} />
          <p className="model-help"><Ruby text={m.help} /></p>
        </div>
      </div>
    </div>
  );
}
