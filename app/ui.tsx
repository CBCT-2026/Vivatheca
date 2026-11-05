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
          <a href="#how-it-works" onClick={() => setOpen(false)}>How it works</a>
          <a href="#publications" onClick={() => setOpen(false)}>Publications</a>
          <a href="#contribute" onClick={() => setOpen(false)}>Contribute</a>
          <a href="#sponsor" onClick={() => setOpen(false)}>Sponsor a model</a>
          <a href="/create">Create patient information</a>
        </nav>
      ) : null}
    </div>
  );
}

const tourSteps = [
  { label: 'Start here', title: 'The wisdom tooth is stuck under the gum', text: 'This lower left wisdom tooth is tilted forward and does not have room to come through.' },
  { label: 'Look closer', title: 'The red line is a nerve', text: 'This nerve gives feeling to the lower lip and chin. Turn the model to see how close the tooth roots sit to it.' },
  { label: 'Discuss next steps', title: 'Use the model as a conversation aid', text: 'A clinician can connect this view to symptoms, imaging and treatment options for an individual patient.' },
];

export const modelLicence = { name: 'CC BY-SA 4.0', href: 'https://creativecommons.org/licenses/by-sa/4.0/' };

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
    alt: 'Interactive 3D model of a lower left jaw with an impacted wisdom tooth whose roots lie close to the inferior alveolar nerve, shown in red',
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

  const clinicalText = step === 0
    ? 'The model depicts a mesioangularly impacted left mandibular third molar against the distal surface of the second molar.'
    : step === 1
      ? 'The inferior alveolar nerve (red) runs close to the third molar roots. Individual root–canal relationships must be assessed with appropriate imaging such as CBCT.'
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
          <a href="/models/impacted-molar.stl" download><Icon name="print" />Download STL (for printing)</a>
        </div>
        <p className="licence-note">Model licence: <a href={modelLicence.href} target="_blank" rel="noreferrer">{modelLicence.name}</a>. Free to use, adapt and print with attribution to Vivatheca.</p>
        <p className="prototype-note"><strong>Not yet clinically reviewed.</strong> Educational aid only, not a diagnostic record.</p>
      </div>
    </div>
  );
}
