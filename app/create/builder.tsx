'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import qrcode from 'qrcode-generator';
import {
  audiences, buildRefinePrompt, buildUserPrompt, materialTypes, modelBriefs, systemPrompt,
  type Audience, type Brief, type MaterialType, type RefineAction,
} from './briefs';
import { checkMarkdown, findPossiblePatientDetails, limits, spokenSeconds, stripClinicianNotes } from './checker';
import { markdownTitle, markdownToHtml } from './markdown';
import { disclaimerHref } from '../disclaimer-text';
import { localeTags } from '../i18n/config';
import { useI18n } from '../i18n/context';
import { format } from '../i18n/dictionaries';
import { plain, RichText, Ruby } from '../i18n/ruby';

const STORAGE = {
  acknowledged: 'vivatheca:builder:acknowledged',
  brief: 'vivatheca:builder:brief',
  draft: 'vivatheca:builder:draft',
};

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode); the builder still works without it.
  }
}

const emptyBrief: Brief = {
  modelId: 'impacted-molar',
  topic: '',
  material: 'leaflet',
  audience: 'adult',
  keyPoints: '',
  riskNumbers: '',
  sources: '',
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function Builder() {
  const { locale, t } = useI18n();
  const b = t.builder;
  const verificationItems = b.verification;
  const DRAFT_NOTICE = plain(b.draftNotice);
  const [acknowledged, setAcknowledged] = useState(false);
  const [ackTicked, setAckTicked] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [brief, setBrief] = useState<Brief>(emptyBrief);
  const [draft, setDraft] = useState('');
  const [review, setReview] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  // Ticks apply only to the exact draft they were given for; any edit clears them.
  const [verification, setVerification] = useState<{ draft: string; ticks: boolean[] }>({ draft: '', ticks: verificationItems.map(() => false) });
  const [signoff, setSignoff] = useState('');
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const viewerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Restore saved state after hydration; the server render has no access to localStorage.
    /* eslint-disable react-hooks/set-state-in-effect */
    setAcknowledged(readStorage(STORAGE.acknowledged) === 'yes');
    const savedBrief = readStorage(STORAGE.brief);
    const startBrief = { ...emptyBrief, topic: plain(b.defaultTopic) };
    setBrief(startBrief);
    let restored = startBrief;
    if (savedBrief) {
      try { restored = { ...startBrief, ...JSON.parse(savedBrief) }; } catch { /* ignore */ }
    }
    // A model page links here as /create?model=<id>: preselect that model and drop a topic written for another one.
    const linked = new URLSearchParams(window.location.search).get('model');
    if (linked && linked !== restored.modelId && modelBriefs.some((m) => m.id === linked)) {
      restored = { ...restored, modelId: linked, topic: '' };
    }
    setBrief(restored);
    setDraft(readStorage(STORAGE.draft) ?? '');
    /* eslint-enable react-hooks/set-state-in-effect */
    fetch('/api/generate').then((r) => (r.ok ? (r.json() as Promise<{ enabled?: boolean }>) : null)).then((d) => setAiEnabled(Boolean(d?.enabled))).catch(() => setAiEnabled(false));
    import('@google/model-viewer').then(() => setViewerReady(true)).catch(() => undefined);
  }, [b.defaultTopic]);

  useEffect(() => { writeStorage(STORAGE.brief, JSON.stringify(brief)); }, [brief]);
  useEffect(() => { writeStorage(STORAGE.draft, draft); }, [draft]);
  const verified = verification.draft === draft ? verification.ticks : verificationItems.map(() => false);
  function tick(index: number, value: boolean) {
    setVerification({ draft, ticks: verified.map((x, j) => (j === index ? value : x)) });
  }

  const result = useMemo(() => checkMarkdown(draft, { address: 'you' }), [draft]);
  const errors = result.findings.filter((f) => f.severity === 'error');
  const warnings = result.findings.filter((f) => f.severity === 'warn');
  const allVerified = Boolean(draft) && verified.every(Boolean);
  const model = modelBriefs.find((m) => m.id === brief.modelId);
  const briefDetails = findPossiblePatientDetails([brief.topic, brief.keyPoints, brief.riskNumbers].join('\n'));
  const draftDetails = findPossiblePatientDetails(draft);
  // Exports stay blocked while the draft looks like it holds patient details.
  const exportBlocked = !draft || draftDetails.length > 0;

  function update<K extends keyof Brief>(key: K, value: Brief[K]) {
    setBrief((b) => ({ ...b, [key]: value }));
  }

  // The default topic is about the wisdom tooth; clear it when another model is picked.
  function changeModel(modelId: string) {
    setBrief((current) => ({ ...current, modelId, topic: current.topic === plain(b.defaultTopic) && modelId !== 'impacted-molar' ? '' : current.topic }));
  }

  function acknowledge() {
    writeStorage(STORAGE.acknowledged, 'yes');
    setAcknowledged(true);
  }

  async function callAi(body: object, onText: (text: string) => void) {
    const response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok || !response.body) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? b.status.failed);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let text = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      onText(text);
    }
    return text;
  }

  async function generate() {
    if (briefDetails.length) return;
    setBusy('draft');
    setStatus(b.status.drafting);
    setReview('');
    try {
      await callAi({ action: 'draft', brief, language: locale }, setDraft);
      setStatus(b.status.draftReady);
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function refine(action: RefineAction) {
    if (draftDetails.length) return;
    const findings = result.findings.map((f) => `${f.section}: ${f.message}${f.excerpt ? ` ("${f.excerpt}")` : ''}`);
    setBusy(action);
    setStatus(action === 'simplify' ? b.status.simplifying : b.status.reviewing);
    try {
      if (action === 'simplify') await callAi({ action, draft, findings }, setDraft);
      else await callAi({ action, draft, findings }, setReview);
      setStatus(b.status.done);
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(format(b.status.copied, { label }));
    } catch {
      setStatus(b.status.copyBlocked);
    }
  }

  const draftPrompt = `${systemPrompt}\n\n---\n\n${buildUserPrompt(brief, locale)}`;
  const simplifyPrompt = `${systemPrompt}\n\n---\n\n${buildRefinePrompt('simplify', draft, result.findings.map((f) => `${f.section}: ${f.message}`))}`;

  function captureView() {
    const viewer = viewerRef.current as (HTMLElement & { toDataURL?: (type?: string) => string }) | null;
    const url = viewer?.toDataURL?.('image/png');
    if (url) {
      setSnapshot(url);
      setStatus(b.status.viewSaved);
    }
  }

  function exportHtml(): string {
    const title = markdownTitle(draft);
    const modelUrl = `${window.location.origin}${model?.page ?? '/models'}`;
    const qr = qrcode(0, 'M');
    qr.addData(modelUrl);
    qr.make();
    const footer = allVerified
      ? escapeHtml(plain(format(b.exportFooter, { name: signoff || plain(b.treatingClinician), date: new Date().toLocaleDateString(localeTags[locale].intl) })))
      : escapeHtml(DRAFT_NOTICE);
    const modelName = plain(b.models[model?.id ?? ''] ?? model?.name ?? '');
    const figure = snapshot && model?.id !== 'none'
      ? `<figure><img src="${snapshot}" alt="${escapeHtml(plain(format(b.modelView, { name: modelName })))}"><figcaption>${escapeHtml(model?.labels.map((l) => l.plain).join(' · ') ?? '')}</figcaption></figure>`
      : '';
    return `<!doctype html>
<html lang="${localeTags[locale].html}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title>
<style>
@page { size: A4; margin: 14mm; }
body { font-family: Manrope, "Segoe UI", Arial, sans-serif; color: #06233f; line-height: 1.5; font-size: 11.5pt; max-width: 180mm; margin: 0 auto; padding: 8mm 0; }
h1 { font-size: 20pt; margin: 0 0 6pt; color: #00244d; } h2 { font-size: 13pt; margin: 12pt 0 4pt; color: #00244d; }
p, li { margin: 0 0 5pt; } ul, ol { padding-left: 18pt; margin: 0 0 6pt; }
figure { float: right; width: 62mm; margin: 0 0 6pt 8pt; } figure img { width: 100%; border: 1px solid #cfe1e7; border-radius: 6px; } figcaption { font-size: 8.5pt; color: #4d6378; }
.check-mark { background: #ffe9a8; }
.qr { float: right; width: 26mm; text-align: center; font-size: 8pt; color: #4d6378; margin-left: 8pt; } .qr svg { width: 26mm; height: 26mm; }
footer { clear: both; margin-top: 10pt; border-top: 1px solid #cfe1e7; padding-top: 5pt; font-size: 8.5pt; color: ${allVerified ? '#4d6378' : '#b3261e'}; font-weight: ${allVerified ? 400 : 700}; }
</style></head><body>
<div class="qr">${qr.createSvgTag({ cellSize: 3, margin: 0, scalable: true })}<div>${escapeHtml(plain(b.scanQr))}</div></div>
${figure}
${markdownToHtml(stripClinicianNotes(draft))}
<footer>${footer}</footer>
</body></html>`;
  }

  function download(name: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  function slug(): string {
    return markdownTitle(draft).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'patient-information';
  }

  function printSheet() {
    const win = window.open('', '_blank');
    if (!win) {
      setStatus(b.status.popupBlocked);
      return;
    }
    win.document.write(exportHtml());
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  }

  function markdownExport(): string {
    const notice = allVerified ? '' : `> ${DRAFT_NOTICE}\n\n`;
    return `${notice}${stripClinicianNotes(draft)}`;
  }

  if (!acknowledged) {
    return (
      <section className="builder-ack" aria-labelledby="ack-title">
        <h2 id="ack-title"><Ruby text={b.ack.heading} /></h2>
        <ul>
          {b.ack.items.map((item, i) => <li key={item}><RichText text={item} />{i === 1 ? <> <a href={disclaimerHref} target="_blank" rel="noreferrer"><Ruby text={t.disclaimer.readFull} /></a></> : null}</li>)}
        </ul>
        <label className="builder-check"><input type="checkbox" checked={ackTicked} onChange={(e) => setAckTicked(e.target.checked)} /> <Ruby text={b.ack.accept} /></label>
        <button className="button" type="button" disabled={!ackTicked} onClick={acknowledge}><Ruby text={b.ack.continue} /></button>
      </section>
    );
  }

  return (
    <div className="builder">
      <p className="builder-banner" role="note"><strong><Ruby text={b.bannerStrong} /></strong> <Ruby text={b.banner} /></p>

      <section className="builder-panel" aria-labelledby="brief-title">
        <h2 id="brief-title"><span className="builder-step">1</span> <Ruby text={b.brief} /></h2>
        <div className="builder-grid">
          <label><Ruby text={b.model} />
            <select value={brief.modelId} onChange={(e) => changeModel(e.target.value)}>
              {modelBriefs.map((m) => <option key={m.id} value={m.id}>{plain(b.models[m.id] ?? m.name)}</option>)}
            </select>
          </label>
          <label><Ruby text={b.material} />
            <select value={brief.material} onChange={(e) => update('material', e.target.value as MaterialType)}>
              {Object.keys(materialTypes).map((k) => <option key={k} value={k}>{plain(b.materials[k as MaterialType])}</option>)}
            </select>
          </label>
          <label><Ruby text={b.audience} />
            <select value={brief.audience} onChange={(e) => update('audience', e.target.value as Audience)}>
              {Object.keys(audiences).map((k) => <option key={k} value={k}>{plain(b.audiences[k as Audience])}</option>)}
            </select>
          </label>
          <label><Ruby text={b.topic} />
            <input value={brief.topic} onChange={(e) => update('topic', e.target.value)} />
          </label>
        </div>
        <label><Ruby text={b.keyPoints} /> <span className="builder-hint"><Ruby text={b.keyPointsHint} /></span>
          <textarea rows={4} value={brief.keyPoints} onChange={(e) => update('keyPoints', e.target.value)} placeholder={plain(b.keyPointsPlaceholder)} />
        </label>
        <label><Ruby text={b.riskNumbers} /> <span className="builder-hint"><Ruby text={b.riskNumbersHint} /></span>
          <textarea rows={3} value={brief.riskNumbers} onChange={(e) => update('riskNumbers', e.target.value)} placeholder={plain(b.riskNumbersPlaceholder)} />
        </label>
        <label><Ruby text={b.sources} /> <span className="builder-hint"><Ruby text={b.sourcesHint} /></span>
          <textarea rows={3} value={brief.sources} onChange={(e) => update('sources', e.target.value)} placeholder={plain(b.sourcesPlaceholder)} />
        </label>
        {briefDetails.length ? <p className="builder-alert" role="alert"><Ruby text={format(b.patientDetails, { details: briefDetails.join(', ') })} /></p> : null}
        <div className="builder-actions">
          {aiEnabled ? (
            <button className="button" type="button" onClick={generate} disabled={Boolean(busy) || briefDetails.length > 0}><Ruby text={busy === 'draft' ? b.drafting : b.draftWithAi} /></button>
          ) : null}
          <button className={aiEnabled ? 'button button-secondary' : 'button'} type="button" onClick={() => copy(draftPrompt, plain(b.status.prompt))} disabled={briefDetails.length > 0}><Ruby text={b.copyPrompt} /></button>
        </div>
        {!aiEnabled ? <p className="builder-hint"><Ruby text={b.aiOff} /></p> : null}
        <details className="builder-prompt"><summary><Ruby text={b.showPrompt} /></summary><pre>{draftPrompt}</pre></details>
      </section>

      <section className="builder-panel" aria-labelledby="draft-title">
        <h2 id="draft-title"><span className="builder-step">2</span> <Ruby text={b.draftAndRefine} /></h2>
        <div className="builder-editor">
          <label className="builder-draft"><Ruby text={b.draftLabel} />
            <textarea rows={22} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={plain(b.draftPlaceholder)} />
          </label>
          <aside className="builder-checks" aria-labelledby="checks-title" aria-live="polite">
            <h3 id="checks-title"><Ruby text={b.checker} /></h3>
            {b.checkerEnglishOnly ? <p className="builder-hint"><Ruby text={b.checkerEnglishOnly} /></p> : null}
            <dl className="builder-scores">
              <div><dt><Ruby text={b.readingGrade} /></dt><dd className={result.scores.fkgl !== null && result.scores.fkgl > limits.maxFkgl ? 'over' : ''}>{result.scores.fkgl ?? '–'} <small><Ruby text={b.target} /> ≤ {limits.maxFkgl}</small></dd></div>
              <div><dt><Ruby text={b.smog} /></dt><dd className={result.scores.smog !== null && result.scores.smog > limits.maxSmog ? 'over' : ''}>{result.scores.smog ?? '–'} <small><Ruby text={b.target} /> ≤ {limits.maxSmog}</small></dd></div>
              <div><dt><Ruby text={b.readingEase} /></dt><dd className={result.scores.fre !== null && result.scores.fre < limits.minFre ? 'over' : ''}>{result.scores.fre ?? '–'} <small><Ruby text={b.target} /> ≥ {limits.minFre}</small></dd></div>
              <div><dt><Ruby text={b.words} /></dt><dd>{result.scores.words}{brief.material === 'narration' ? <small> <Ruby text={format(b.spoken, { seconds: spokenSeconds(draft) })} /></small> : null}</dd></div>
            </dl>
            <p className="builder-count"><strong>{errors.length}</strong> <Ruby text={b.toFix} /> · <strong>{warnings.length}</strong> <Ruby text={b.toConsider} /></p>
            {draftDetails.length ? <p className="builder-alert" role="alert"><Ruby text={format(b.possibleDetails, { details: draftDetails.join(', ') })} /></p> : null}
            <ul className="builder-findings">
              {[...errors, ...warnings].slice(0, 60).map((f, i) => (
                <li key={i} className={f.severity}>
                  <span className="finding-section">{f.section}</span> {f.message}
                  {f.excerpt ? <q>{f.excerpt}</q> : null}
                </li>
              ))}
            </ul>
            <p className="builder-hint"><Ruby text={b.checksSource} /></p>
          </aside>
        </div>
        <div className="builder-actions">
          {aiEnabled ? (
            <>
              <button className="button button-secondary" type="button" onClick={() => refine('simplify')} disabled={!draft || Boolean(busy) || draftDetails.length > 0}><Ruby text={busy === 'simplify' ? b.simplifying : b.simplify} /></button>
              <button className="button button-secondary" type="button" onClick={() => refine('review')} disabled={!draft || Boolean(busy) || draftDetails.length > 0}><Ruby text={busy === 'review' ? b.reviewing : b.review} /></button>
            </>
          ) : (
            <button className="button button-secondary" type="button" onClick={() => copy(simplifyPrompt, plain(b.status.simplifyPrompt))} disabled={!draft}><Ruby text={b.copySimplify} /></button>
          )}
        </div>
        {review ? (
          <div className="builder-review">
            <h3><Ruby text={b.aiReview} /> <span className="builder-hint"><Ruby text={b.aiReviewHint} /></span></h3>
            <div dangerouslySetInnerHTML={{ __html: markdownToHtml(review) }} />
          </div>
        ) : null}
      </section>

      <section className="builder-panel" aria-labelledby="export-title">
        <h2 id="export-title"><span className="builder-step">3</span> <Ruby text={b.checkAndExport} /></h2>
        {model?.glb && viewerReady ? (
          <div className="builder-model">
            {React.createElement('model-viewer', {
              ref: viewerRef,
              src: model.glb,
              alt: plain(format(b.modelAlt, { name: b.models[model.id] ?? model.name })),
              'camera-controls': true,
              'touch-action': 'pan-y',
              'camera-orbit': '8deg 78deg 74%',
              'field-of-view': '28deg',
              'environment-image': 'neutral',
              'shadow-intensity': '0.7',
              'interaction-prompt': 'none',
              className: 'builder-viewer',
            })}
            <div>
              <p><Ruby text={b.viewHelp} /></p>
              <button className="button button-secondary" type="button" onClick={captureView}><Ruby text={b.useView} /></button>
              {snapshot ? <img className="builder-snapshot" src={snapshot} alt={plain(b.savedView)} /> : null}
            </div>
          </div>
        ) : null}
        <fieldset className="builder-verify">
          <legend><Ruby text={b.clinicianCheck} /></legend>
          <p className="builder-hint"><Ruby text={format(b.verifyHint, { notice: b.draftNotice })} /></p>
          {verificationItems.map((item, i) => (
            <label key={item} className="builder-check">
              <input type="checkbox" checked={verified[i]} onChange={(e) => tick(i, e.target.checked)} /> <Ruby text={item} />
            </label>
          ))}
          <label><Ruby text={b.checkedBy} />
            <input value={signoff} onChange={(e) => setSignoff(e.target.value)} placeholder={plain(b.checkedByPlaceholder)} />
          </label>
        </fieldset>
        <div className="builder-actions">
          <button className="button" type="button" disabled={exportBlocked} onClick={printSheet}><Ruby text={b.print} /></button>
          <button className="button button-secondary" type="button" disabled={exportBlocked} onClick={() => download(`${slug()}.html`, exportHtml(), 'text/html')}><Ruby text={b.downloadHtml} /></button>
          <button className="button button-secondary" type="button" disabled={exportBlocked} onClick={() => download(`${slug()}.md`, markdownExport(), 'text/markdown')}><Ruby text={b.downloadMarkdown} /></button>
        </div>
        {draftDetails.length ? <p className="builder-alert" role="alert"><Ruby text={format(b.exportBlocked, { details: draftDetails.join(', ') })} /></p> : null}
        {draft ? (
          <div className="builder-preview" aria-label={plain(b.preview)}>
            <p className="builder-hint"><Ruby text={b.previewHint} /></p>
            <div dangerouslySetInnerHTML={{ __html: markdownToHtml(stripClinicianNotes(draft)) }} />
            <p className={allVerified ? 'builder-footer' : 'builder-footer draft'}><Ruby text={allVerified ? format(b.checkedByFooter, { name: signoff || b.treatingClinician }) : b.draftNotice} /></p>
          </div>
        ) : null}
      </section>
      <p className="builder-status" role="status" aria-live="polite">{status}</p>
    </div>
  );
}
