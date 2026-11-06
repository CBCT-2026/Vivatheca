'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { disclaimerHref } from '../disclaimer-text';
import { useI18n } from '../i18n/context';
import { format } from '../i18n/dictionaries';
import { plain, Ruby } from '../i18n/ruby';
import { showPart, type ModelViewerElement } from '../model-parts';
import { currentReview } from '../models/reviews';
import { FavouriteStar } from './quick';
import type { ShowSpec, ShowView } from './models';

// Show mode: one model filling the screen, with only what is needed while a patient watches:
// the views to switch between, reset, full screen, a star, and a link to the full page.
// The review status and model disclaimer stay on screen.
export function ShowViewer({ slug, spec, pageHref, initialView }: { slug: string; spec: ShowSpec; pageHref: string; initialView?: string }) {
  const { t } = useI18n();
  const s = t.show;
  const item = t.library.items[slug];
  const reviewed = currentReview(slug);
  const frame = useRef<HTMLDivElement>(null);
  const viewer = useRef<ModelViewerElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [full, setFull] = useState(false);
  const [canFull, setCanFull] = useState(false);
  const start = Math.max(0, spec.views.findIndex((v) => v.id === initialView));
  const [index, setIndex] = useState(start);
  const view = spec.views[index];

  const labelOf = useCallback((v: ShowView) => {
    if (v.age) return format(s.age, { n: v.age.replace('.5', '½') });
    if (v.step) return format(s.step, { n: v.step });
    return (s.views as Record<string, string>)[v.label] ?? v.label;
  }, [s]);

  useEffect(() => {
    let active = true;
    // Draco-compressed models: the decoder is served from this site (as in app/ui.tsx).
    (self as unknown as { ModelViewerElement?: object }).ModelViewerElement = { dracoDecoderLocation: '/development/vendor/draco/' };
    import('@google/model-viewer').then(() => { if (active) { setReady(true); setCanFull(Boolean(document.fullscreenEnabled)); } }).catch(() => { if (active) setFailed(true); });
    const onFull = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFull);
    return () => { active = false; document.removeEventListener('fullscreenchange', onFull); };
  }, []);

  // Hide the overlays the full page only shows on request, each time a model loads.
  useEffect(() => {
    const el = viewer.current;
    if (!el || !ready) return;
    const onLoad = () => { (view.hide ?? []).forEach((name) => showPart(el, name, false)); setLoading(false); setFailed(false); };
    const onError = () => { setLoading(false); setFailed(true); };
    el.addEventListener('load', onLoad);
    el.addEventListener('error', onError);
    if (el.loaded) onLoad();
    return () => { el.removeEventListener('load', onLoad); el.removeEventListener('error', onError); };
  }, [ready, view]);

  // Keep the chosen view in the address, so a bookmark or shared link opens on it.
  const choose = useCallback((i: number) => {
    const next = (i + spec.views.length) % spec.views.length;
    if (next === index) return;
    setLoading(true);
    setIndex(next);
    try { history.replaceState(null, '', `/show?model=${slug}&view=${spec.views[next].id}`); } catch { /* ignore */ }
  }, [index, slug, spec.views]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, model-viewer')) return;
      if (e.key === 'ArrowRight') choose(index + 1);
      if (e.key === 'ArrowLeft') choose(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choose, index]);

  const reset = () => {
    const el = viewer.current;
    if (!el) return;
    el.cameraOrbit = spec.orbit ?? '0deg 75deg auto';
    el.cameraTarget = spec.target ?? 'auto auto auto';
  };
  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frame.current?.requestFullscreen?.();
  };

  const title = plain(item?.title ?? slug);
  const modelViewer = React.createElement('model-viewer', {
    ref: viewer,
    src: view.glb,
    alt: `${title}: ${plain(labelOf(view))}`,
    'camera-controls': true,
    'touch-action': 'none',
    'camera-orbit': spec.orbit ?? '0deg 75deg auto',
    'camera-target': spec.target,
    'shadow-intensity': '0.7',
    'environment-image': 'neutral',
    'interaction-prompt': 'none',
    className: 'show-model',
  });

  return (
    <div className="show-frame" ref={frame}>
      <header className="show-bar">
        <a className="show-brand" href="/" aria-label={plain(t.common.home)}><img src="/brand/vivatheca-logo-primary.svg" alt="Vivatheca" width="53" height="40" /></a>
        <h1 className="show-title"><Ruby text={item?.title ?? slug} /></h1>
        <div className="show-bar-actions">
          <FavouriteStar slug={slug} />
          {canFull ? <button type="button" className="show-button" onClick={toggleFull} aria-pressed={full}><img aria-hidden="true" src="/icons/fullscreen.svg" width="20" height="20" alt="" /><span><Ruby text={full ? s.exitFullscreen : s.fullscreen} /></span></button> : null}
          <a className="show-button" href={pageHref} title={plain(s.detailsLong)}><span><Ruby text={s.details} /></span></a>
          <a className="show-button" href="/show"><img aria-hidden="true" src="/icons/close.svg" width="20" height="20" alt="" /><span><Ruby text={s.close} /></span></a>
        </div>
      </header>

      <div className="show-stage">
        {ready && !failed ? modelViewer : null}
        {failed ? <p className="show-status" role="alert"><Ruby text={s.failed} /> <a href={pageHref}><Ruby text={s.details} /></a></p> : loading ? <p className="show-status" role="status"><Ruby text={s.loading} /></p> : null}
        <button type="button" className="show-button show-reset" onClick={reset}><Ruby text={s.reset} /></button>
      </div>

      <div className="show-controls">
        {spec.views.length > 1 ? (
          <div className="show-views" role="group" aria-label={plain(s.viewsLabel)}>
            {spec.views.map((v, i) => <button key={v.id} type="button" aria-pressed={i === index} onClick={() => choose(i)}><Ruby text={labelOf(v)} /></button>)}
          </div>
        ) : null}
        <p className="show-hint"><Ruby text={s.hint} /></p>
        <p className="show-disclaimer"><strong>{reviewed ? <Ruby text={format(t.review.reviewed, { name: reviewed.reviewer, credentials: reviewed.credentials, date: reviewed.date })} /> : <Ruby text={t.disclaimer.notReviewed} />}</strong> <Ruby text={t.disclaimer.model} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a>{t.disclaimer.translationNote ? <> <Ruby text={t.disclaimer.translationNote} /></> : null}</p>
      </div>
    </div>
  );
}
