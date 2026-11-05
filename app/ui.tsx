'use client';

import React, { useEffect, useRef, useState } from 'react';

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return <img aria-hidden="true" className="ui-icon" src={`/icons/${name}.svg`} width={size} height={size} alt="" />;
}

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mobile-nav">
      <button className="icon-button" type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <Icon name={open ? 'close' : 'menu'} size={24} />
      </button>
      {open ? (
        <nav className="mobile-nav-panel" aria-label="Mobile navigation">
          <a href="#collection" onClick={() => setOpen(false)}>Browse the collection</a>
          <a href="#disciplines" onClick={() => setOpen(false)}>Disciplines</a>
          <a href="#how-it-works" onClick={() => setOpen(false)}>How it works</a>
          <a href="#publications" onClick={() => setOpen(false)}>Publications</a>
          <a href="#contribute" onClick={() => setOpen(false)}>Contribute</a>
          <a href="#sponsor" onClick={() => setOpen(false)}>Sponsor a model</a>
        </nav>
      ) : null}
    </div>
  );
}

const tourSteps = [
  { label: 'Start here', title: 'The wisdom tooth is angled forward', text: 'The supplied model shows a lower third molar that does not have a clear path to erupt normally.' },
  { label: 'Look closer', title: 'It meets the tooth in front', text: 'Rotate the model to inspect how the impacted tooth sits against the adjacent molar.' },
  { label: 'Discuss next steps', title: 'Use the model as a conversation aid', text: 'A clinician can connect this view to symptoms, imaging and treatment options for an individual patient.' },
];

export function ModelExperience() {
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
    alt: 'Interactive 3D model of a lower jaw with an impacted wisdom tooth',
    'camera-controls': true,
    'touch-action': 'pan-y',
    'auto-rotate': rotationEnabled || undefined,
    'auto-rotate-delay': '0',
    'rotation-per-second': '18deg',
    'shadow-intensity': '0.7',
    'environment-image': 'neutral',
    'camera-orbit': '8deg 78deg 74%',
    'field-of-view': '28deg',
    reveal: 'auto',
    'interaction-prompt': 'none',
    ar: true,
    'ar-modes': 'webxr scene-viewer quick-look',
    className: 'model-viewer',
  });

  const clinicalText = step === 0
    ? 'The demonstration model depicts a mesioangularly impacted mandibular third molar. This description is prototype content and requires clinical review.'
    : step === 1
      ? 'Inspect the distal aspect of the adjacent second molar and the relationship of the third molar crown. Individual anatomy must be assessed using appropriate imaging.'
      : 'Use this visualisation alongside clinical findings and imaging. It is an educational aid, not a diagnostic record or treatment recommendation.';

  return (
    <div className="model-experience">
      <div className="model-stage" ref={viewerFrame}>
        <div className="model-stage-topline">
          <span className="status-chip"><span className="status-dot" />Interactive Example</span>
          <div className="model-actions">
            <button type="button" className="rotation-button" onClick={() => setRotationEnabled((value) => !value)} aria-pressed={rotationEnabled}>
              {rotationEnabled ? 'Pause rotation' : 'Resume rotation'}
            </button>
            <button type="button" className="icon-button on-dark" onClick={toggleFavourite} aria-pressed={favourite} aria-label={favourite ? 'Remove impacted wisdom tooth from favourites' : 'Save impacted wisdom tooth to favourites'}>
              <Icon name={favourite ? 'favorite' : 'favorite_border'} size={22} />
            </button>
            <button type="button" className="icon-button on-dark" onClick={enterFullscreen} aria-label="View model full screen"><Icon name="fullscreen" size={22} /></button>
          </div>
        </div>
        {ready ? modelViewer : <div className="model-loading" role="status">Loading interactive model…</div>}
        <p className="model-help">Drag to rotate · Scroll or pinch to zoom · Use arrow keys after focusing the model</p>
      </div>
      <div className="model-copy">
        <div className="segmented" aria-label="Explanation level">
          <button type="button" aria-pressed={detail === 'plain'} onClick={() => setDetail('plain')}>Plain language</button>
          <button type="button" aria-pressed={detail === 'clinical'} onClick={() => setDetail('clinical')}>Clinician detail</button>
        </div>
        <h3>{tourSteps[step].title}</h3>
        <p className="model-index">{tourSteps[step].label} · {step + 1} of {tourSteps.length}</p>
        <p>{detail === 'plain' ? tourSteps[step].text : clinicalText}</p>
        <div className="tour-controls">
          <button type="button" className="text-button" disabled={step === 0} onClick={() => setStep((value) => value - 1)}>Previous</button>
          <div className="tour-dots" aria-label={`Tour step ${step + 1} of ${tourSteps.length}`}>{tourSteps.map((item, index) => <span key={item.label} className={index === step ? 'active' : ''} />)}</div>
          <button type="button" className="text-button" disabled={step === tourSteps.length - 1} onClick={() => setStep((value) => value + 1)}>Next</button>
        </div>
        <div className="model-links">
          <a href="/models/impacted-molar.glb" download><Icon name="download" />Download GLB</a>
          <span aria-disabled="true"><Icon name="view_in_ar" />AR where supported</span>
        </div>
        <p className="prototype-note"><strong>Prototype notice:</strong> reviewer, licence, DOI and medical copy are not yet verified for production.</p>
      </div>
    </div>
  );
}
