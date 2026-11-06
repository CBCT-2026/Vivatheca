'use client';
import { useEffect, useRef, useState } from 'react';

// NiiVue (BSD-2-Clause, public/vendor/niivue) shows a virtual CBCT of a Vivatheca model as three
// orthogonal slices plus a volume render. Volumes come from tools/cbct/voxelize.py (public/slices/*.nvol:
// gzipped NIfTI under a neutral extension, because the server treats *.gz as precompressed copies).

type Volume = { id: string; file: string; model: string; label: string };
type Props = {
  volumes: Volume[];
  views: Record<string, string>;
  windows: Record<string, string>;
  labels: Record<string, string>;
};

// Window presets as (centre, width) in the model's Hounsfield-style values.
const WINDOWS: Record<string, [number, number]> = { bone: [700, 3000], soft: [100, 700], metal: [2000, 4000] };
const VIEWS = ['multiplanar', 'axial', 'coronal', 'sagittal', 'render'] as const;

type NiiVue = {
  attachToCanvas: (c: HTMLCanvasElement) => Promise<void>;
  loadVolumes: (v: { url: string; name?: string; colormap?: string; cal_min?: number; cal_max?: number }[]) => Promise<void>;
  setSliceType: (t: number) => void;
  setInterpolation: (nearest: boolean) => void;
  sliceTypeAxial: number; sliceTypeCoronal: number; sliceTypeSagittal: number; sliceTypeMultiplanar: number; sliceTypeRender: number;
  volumes: { cal_min: number; cal_max: number }[];
  updateGLVolume: () => void;
  opts: { multiplanarForceRender: boolean; isRadiologicalConvention: boolean };
  onLocationChange: (cb: (d: { mm?: number[]; values?: { value: number }[] }) => void) => void;
  setRadiologicalConvention: (b: boolean) => void;
};

declare global {
  interface Window { niivue?: { Niivue: new (opts: Record<string, unknown>) => NiiVue } }
}

export function SlicesUI({ volumes, views, windows, labels }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const nvRef = useRef<NiiVue | null>(null);
  const [nv, setNv] = useState<NiiVue | null>(null);
  const [volume, setVolume] = useState(volumes[0].id);
  const [view, setView] = useState<(typeof VIEWS)[number]>('multiplanar');
  const [windowName, setWindowName] = useState('bone');
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [position, setPosition] = useState('');

  const applyView = (nv: NiiVue, v: typeof view) => {
    const map = { axial: nv.sliceTypeAxial, coronal: nv.sliceTypeCoronal, sagittal: nv.sliceTypeSagittal, multiplanar: nv.sliceTypeMultiplanar, render: nv.sliceTypeRender };
    nv.opts.multiplanarForceRender = v === 'multiplanar';
    nv.setSliceType(map[v]);
  };
  const applyWindow = (nv: NiiVue, name: string) => {
    const [centre, width] = WINDOWS[name];
    if (!nv.volumes[0]) return;
    nv.volumes[0].cal_min = centre - width / 2;
    nv.volumes[0].cal_max = centre + width / 2;
    nv.updateGLVolume();
  };

  // Load the viewer script once, then the chosen volume.
  useEffect(() => {
    let cancelled = false;
    const ready = () => {
      if (cancelled || !canvas.current || !window.niivue) return;
      const dark = document.documentElement.dataset.theme === 'dark';
      const nv = new window.niivue.Niivue({
        backColor: dark ? [0.06, 0.09, 0.13, 1] : [0.02, 0.05, 0.1, 1],
        crosshairColor: [0, 0.8, 0.9, 1],
        isRadiologicalConvention: true, // patient's right on the left of the screen, as in clinical software
        multiplanarEqualSize: true,
        showLegend: false,
        dragAndDropEnabled: false,
        logLevel: 'error',
      });
      nvRef.current = nv;
      nv.attachToCanvas(canvas.current).then(() => {
        setNv(nv);
        nv.onLocationChange((d) => {
          const mm = d.mm ? d.mm.slice(0, 3).map((n) => n.toFixed(1)).join(', ') : '';
          const hu = d.values && d.values[0] ? Math.round(d.values[0].value) : null;
          setPosition(hu === null ? mm : `${mm} · ${hu} HU`);
        });
      }).catch((e) => { console.error(e); setStatus('failed'); });
    };
    if (window.niivue) ready();
    else {
      const script = document.createElement('script');
      script.src = '/vendor/niivue/niivue.umd.js';
      script.onload = ready;
      script.onerror = () => setStatus('failed');
      document.head.append(script);
    }
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!nv) return;
    const chosen = volumes.find((v) => v.id === volume) || volumes[0];
    const [centre, width] = WINDOWS[windowName];
    setStatus('loading');
    nv.loadVolumes([{ url: chosen.file, name: `${chosen.id}.nii.gz`, colormap: 'gray', cal_min: centre - width / 2, cal_max: centre + width / 2 }])
      .then(() => { nv.setInterpolation(false); applyView(nv, view); setStatus('ready'); })
      .catch((e) => { console.error(e); setStatus('failed'); });
    // view and window are applied by their own handlers after the first load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume, nv]);

  const chosen = volumes.find((v) => v.id === volume) || volumes[0];
  return (
    <section className="slices" aria-label={labels.view}>
      <div className="slices-controls">
        <label>
          <span>{labels.volume}</span>
          <select value={volume} onChange={(e) => setVolume(e.target.value)}>
            {volumes.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
        </label>
        <div className="slices-group" role="group" aria-label={labels.view}>
          <span>{labels.view}</span>
          {VIEWS.map((v) => (
            <button key={v} type="button" className={view === v ? 'is-active' : ''} aria-pressed={view === v} onClick={() => { setView(v); if (nvRef.current) applyView(nvRef.current, v); }}>{views[v]}</button>
          ))}
        </div>
        <div className="slices-group" role="group" aria-label={labels.window}>
          <span>{labels.window}</span>
          {Object.keys(WINDOWS).map((w) => (
            <button key={w} type="button" className={windowName === w ? 'is-active' : ''} aria-pressed={windowName === w} onClick={() => { setWindowName(w); if (nvRef.current) applyWindow(nvRef.current, w); }}>{windows[w]}</button>
          ))}
        </div>
      </div>
      <div className="slices-canvas" data-status={status}>
        <canvas ref={canvas} aria-label={`${chosen.label}: ${views[view]}`} />
        {status !== 'ready' ? <p className="slices-status" role="status">{status === 'failed' ? labels.failed : labels.loading}</p> : null}
      </div>
      <p className="slices-position"><span>{labels.position}</span> <output aria-live="off">{position || '—'}</output> · <a href={chosen.model}>{labels.openModel}</a></p>
    </section>
  );
}
