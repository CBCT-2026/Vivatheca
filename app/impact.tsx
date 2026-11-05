'use client';

import { useEffect, useState } from 'react';

const updates = [
  { place: 'Community hospital demonstration — Nairobi', model: 'Anatomical heart', time: '12 minutes ago' },
  { place: 'Regional clinic demonstration — Kathmandu', model: 'Impacted molar', time: '3 hours ago' },
  { place: 'Teaching hospital demonstration — Lima', model: 'Cranial anatomy', time: '1 day ago' },
];

const collaboratorTotals = [
  { role: 'Creators', total: 24, code: 'C', className: 'creator' },
  { role: 'Donors', total: 31, code: 'D', className: 'donor' },
  { role: 'Reviewers', total: 12, code: 'R', className: 'reviewer' },
  { role: 'Translators', total: 9, code: 'T', className: 'translator' },
];

const markers = [
  { label: 'Demonstration model delivery in Nairobi, Kenya', x: 55, y: 56, type: 'delivery' },
  { label: 'Demonstration model delivery in Kathmandu, Nepal', x: 72, y: 45, type: 'delivery' },
  { label: 'Demonstration model delivery in Lima, Peru', x: 29, y: 64, type: 'delivery' },
  { label: 'Creator demonstration location in Toronto, Canada', x: 24, y: 28, type: 'creator', code: 'C' },
  { label: 'Donor demonstration location in London, United Kingdom', x: 48, y: 27, type: 'donor', code: 'D' },
  { label: 'Reviewer demonstration location in Cape Town, South Africa', x: 52, y: 68, type: 'reviewer', code: 'R' },
  { label: 'Translator demonstration location in Kuala Lumpur, Malaysia', x: 78, y: 57, type: 'translator', code: 'T' },
];

const mapLocations = [
  'Model deliveries: Nairobi, Kathmandu and Lima',
  'Creator: Toronto',
  'Donor: London',
  'Reviewer: Cape Town',
  'Translator: Kuala Lumpur',
];

export function ImpactMap() {
  const [updateIndex, setUpdateIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setReducedMotion(motionPreference.matches);
    syncPreference();
    motionPreference.addEventListener('change', syncPreference);
    return () => motionPreference.removeEventListener('change', syncPreference);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = window.setInterval(() => setUpdateIndex((current) => (current + 1) % updates.length), 8000);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion]);

  const update = updates[updateIndex];

  return (
    <div className="impact-experience">
      <div className="impact-heading">
        <div>
          <h3>A global view of access and collaboration.</h3>
          <p>Built to show physical model access and the people making open clinical education possible as verified records become available.</p>
        </div>
        <p className="prototype-data-note">Illustrative prototype data — not verified delivery records.</p>
      </div>

      <div className="impact-layout">
        <div className="map-panel">
          <div className="world-map">
            <img src="/assets/global-access-map.png" alt="Detailed world map beneath demonstration model deliveries and collaborator locations" width="1776" height="887" />
            {markers.map((marker) => (
              <span
                className={`map-marker ${marker.type}`}
                key={marker.label}
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                aria-hidden="true"
              >
                {marker.code ?? <span aria-hidden="true" className="delivery-symbol" />}
              </span>
            ))}
          </div>
          <p className="ai-disclaimer map-disclaimer">AI-generated illustration.</p>

          <div className="map-legend" aria-label="Map legend">
            <span><i className="delivery" />Model delivery</span>
            {collaboratorTotals.map((item) => <span key={item.role}><i className={item.className}>{item.code}</i>{item.role}</span>)}
          </div>
          <div className="map-locations">
            <h4>Locations shown</h4>
            <ul>{mapLocations.map((location) => <li key={location}>{location}</li>)}</ul>
          </div>
        </div>

        <aside className="recent-update" aria-labelledby="recent-update-title">
          <div className="recent-update-topline">
            <h4 id="recent-update-title">Recent model access</h4>
            <span>Demonstration feed</span>
          </div>
          <div className="update-copy" aria-live="polite" aria-atomic="true">
            <strong>{update.place}</strong>
            <p>{update.model}</p>
            <time>{update.time}</time>
          </div>
          <div className="feed-controls">
            <button type="button" disabled={reducedMotion} onClick={() => setPaused((value) => !value)} aria-label={reducedMotion ? 'Automatic updates paused for reduced motion' : paused ? 'Resume demonstration updates' : 'Pause demonstration updates'}>
              {reducedMotion ? 'Updates paused' : paused ? 'Resume' : 'Pause'}
            </button>
            <button type="button" onClick={() => setUpdateIndex((current) => (current + 1) % updates.length)} aria-label="Show next demonstration update">
              Next update
            </button>
          </div>
          <p className="feed-note">The feed is live-ready; verified delivery records require a production data source.</p>
        </aside>
      </div>

      <div className="impact-summary">
        <div className="donation-total"><strong>18</strong><span>Demonstration donations</span></div>
        <div className="country-rankings">
          <h4>Top demonstration countries</h4>
          <ol><li>Kenya · 7</li><li>Nepal · 6</li><li>Peru · 5</li></ol>
        </div>
        <div className="collaborator-summary">
          {collaboratorTotals.map((item) => (
            <div key={item.role}><span className={`role-code ${item.className}`}>{item.code}</span><strong>{item.total}</strong><span>{item.role}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}
