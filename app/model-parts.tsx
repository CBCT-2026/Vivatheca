'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from './i18n/context';
import { plain, Ruby } from './i18n/ruby';

// Shared "take the model apart" tools for the React model viewers (homepage ABG viewer, wisdom tooth compare).
// Same approach as the CBCT-2026/ABG site and public/model-parts.js on the static pages: each part is a
// material in the GLB, hidden or shown by its alpha.

export type Material = {
  name: string;
  setAlphaMode: (mode: string) => void;
  pbrMetallicRoughness: { baseColorFactor: number[]; setBaseColorFactor: (c: number[]) => void };
};
export type ModelViewerElement = HTMLElement & {
  model?: { materials: Material[] };
  loaded?: boolean;
  cameraOrbit: string;
  cameraTarget: string;
  autoRotate?: boolean;
  turntableRotation?: number;
  resetTurntableRotation?: (theta?: number) => void;
  getCameraOrbit: () => { theta: number; phi: number; radius: number; toString: () => string };
  animationName?: string;
  animationCrossfadeDuration?: number;
  availableAnimations?: string[];
  currentTime?: number;
  play?: () => void;
  pause?: () => void;
  updateComplete?: Promise<unknown>;
};

export const baseName = (name: string) => name.replace(/\.\d+$/, '');
export const materialsNamed = (viewer: ModelViewerElement | null | undefined, name: string) =>
  (viewer?.model?.materials ?? []).filter((m) => baseName(m.name) === name);

export function setAlpha(material: Material, alpha: number) {
  const colour = material.pbrMetallicRoughness.baseColorFactor.slice(0, 3);
  material.setAlphaMode(alpha >= 1 ? 'OPAQUE' : 'BLEND');
  material.pbrMetallicRoughness.setBaseColorFactor([...colour, alpha]);
}

export function showPart(viewer: ModelViewerElement | null | undefined, name: string, on: boolean) {
  materialsNamed(viewer, name).forEach((m) => setAlpha(m, on ? 1 : 0));
}

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Fade a part in or out over a short time (instant when the visitor prefers reduced motion).
export function fadePart(viewer: ModelViewerElement | null | undefined, name: string, from: number, to: number, ms: number) {
  const list = materialsNamed(viewer, name);
  if (!list.length) return Promise.resolve();
  const time = reduceMotion() ? 1 : ms;
  return new Promise<void>((resolve) => {
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / time);
      list.forEach((m) => setAlpha(m, from + (to - from) * k));
      if (k < 1) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  });
}

// Plays one of the model's own animation clips ('remove' or 'replace' in the ABG models) and stops at its end.
// The clips move the part over 1.4 s and then hold, so pausing at 1.5 s leaves it exactly in place (CBCT-2026/ABG site.js).
export function playClip(viewer: ModelViewerElement | null | undefined, name: string) {
  if (!viewer || reduceMotion() || !viewer.availableAnimations?.includes(name)) return Promise.resolve();
  return new Promise<void>((resolve) => {
    viewer.animationCrossfadeDuration = 0;
    viewer.animationName = name;
    Promise.resolve(viewer.updateComplete).then(() => {
      viewer.currentTime = 0;
      viewer.play?.();
      window.setTimeout(() => { viewer.pause?.(); resolve(); }, 1500);
    });
  });
}

const colourOf = (material?: Material) => {
  if (!material) return '';
  const [r, g, b] = material.pbrMetallicRoughness.baseColorFactor.slice(0, 3).map((v) => Math.round(255 * Math.pow(Math.max(0, Math.min(1, v)), 1 / 2.2)));
  return `rgb(${r},${g},${b})`;
};

// Buttons to hide or show each named part on one or more viewers (side-by-side viewers share the choice).
// `names` lists the parts that get a button, in order; parts missing from the current model are left out.
export function PartsPanel({ getViewers, names, version }: { getViewers: () => (ModelViewerElement | null)[]; names: string[]; version: number }) {
  const { t } = useI18n();
  const p = t.parts;
  const [hidden, setHidden] = useState<string[]>([]);
  const [present, setPresent] = useState<{ name: string; colour: string }[]>([]);

  // Viewers and names are read through a ref, so a new array from the parent on each render does not re-run the effect.
  const current = useRef({ getViewers, names });
  useEffect(() => { current.current = { getViewers, names }; });
  const reapply = (list: string[]) => {
    const { getViewers: get, names: ns } = current.current;
    const vs = get();
    vs.forEach((viewer) => ns.forEach((name) => showPart(viewer, name, !list.includes(name))));
  };

  // After each model load (version changes), list the parts this model has and keep hidden parts hidden.
  useEffect(() => {
    const { getViewers: get, names: ns } = current.current;
    const vs = get();
    const first = vs.find((v) => v?.model);
    setPresent(ns.filter((name) => vs.some((v) => materialsNamed(v, name).length)).map((name) => ({ name, colour: colourOf(materialsNamed(first, name)[0]) })));
    setHidden((list) => {
      vs.forEach((viewer) => ns.forEach((name) => { if (list.includes(name)) showPart(viewer, name, false); }));
      return list;
    });
  }, [version]);

  if (!present.length) return null;
  const toggle = (name: string) => {
    const next = hidden.includes(name) ? hidden.filter((n) => n !== name) : [...hidden, name];
    setHidden(next);
    reapply(next);
  };
  const showAll = () => { setHidden([]); reapply([]); };
  return (
    <div className="parts-panel">
      <p className="parts-hint"><strong><Ruby text={p.heading} /></strong> <Ruby text={p.hint} /></p>
      <div className="chip-row" role="group" aria-label={plain(p.group)}>
        {present.map(({ name, colour }) => (
          <button key={name} type="button" className="chip chip-part" aria-pressed={!hidden.includes(name)} onClick={() => toggle(name)}>
            {colour ? <span className="chip-dot" aria-hidden="true" style={{ background: colour }} /> : null}
            <Ruby text={p.names[name] ?? name} />
          </button>
        ))}
        {hidden.length ? <button type="button" className="chip" onClick={showAll}><Ruby text={p.all} /></button> : null}
      </div>
    </div>
  );
}
