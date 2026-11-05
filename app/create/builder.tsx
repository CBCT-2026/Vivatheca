'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import qrcode from 'qrcode-generator';
import {
  audiences, buildRefinePrompt, buildUserPrompt, materialTypes, modelBriefs, systemPrompt,
  type Audience, type Brief, type MaterialType, type RefineAction,
} from './briefs';
import { checkMarkdown, findPossiblePatientDetails, limits, spokenSeconds, stripClinicianNotes } from './checker';
import { markdownTitle, markdownToHtml } from './markdown';

const STORAGE = {
  acknowledged: 'vivatheca:builder:acknowledged',
  brief: 'vivatheca:builder:brief',
  draft: 'vivatheca:builder:draft',
};

const verificationItems = [
  'I have checked every fact against current evidence and my own clinical knowledge.',
  'Every risk number has a source, and the sources are listed.',
  'All [CHECK] markers are resolved and the checker shows no errors, or I accept the remaining ones.',
  'The material contains no patient-identifying information.',
];

const DRAFT_NOTICE = 'DRAFT: AI-assisted, not clinically verified. May contain errors. Not medical advice.';

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
  topic: 'Having a lower wisdom tooth taken out',
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
    if (savedBrief) {
      try { setBrief({ ...emptyBrief, ...JSON.parse(savedBrief) }); } catch { /* ignore */ }
    }
    setDraft(readStorage(STORAGE.draft) ?? '');
    /* eslint-enable react-hooks/set-state-in-effect */
    fetch('/api/generate').then((r) => (r.ok ? (r.json() as Promise<{ enabled?: boolean }>) : null)).then((d) => setAiEnabled(Boolean(d?.enabled))).catch(() => setAiEnabled(false));
    import('@google/model-viewer').then(() => setViewerReady(true)).catch(() => undefined);
  }, []);

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

  function update<K extends keyof Brief>(key: K, value: Brief[K]) {
    setBrief((b) => ({ ...b, [key]: value }));
  }

  function acknowledge() {
    writeStorage(STORAGE.acknowledged, 'yes');
    setAcknowledged(true);
  }

  async function callAi(body: object, onText: (text: string) => void) {
    const response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok || !response.body) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? 'The AI request failed.');
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
    setStatus('Drafting with Claude. This can take up to a minute.');
    setReview('');
    try {
      await callAi({ action: 'draft', brief }, setDraft);
      setStatus('Draft ready. Check every fact before use.');
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
    setStatus(action === 'simplify' ? 'Simplifying the draft.' : 'Reviewing with PEMAT and the CDC Clear Communication Index.');
    try {
      if (action === 'simplify') await callAi({ action, draft, findings }, setDraft);
      else await callAi({ action, draft, findings }, setReview);
      setStatus('Done. Check the changes before use.');
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(`${label} copied. Paste it into your AI chat, then paste the answer into the draft box.`);
    } catch {
      setStatus('Copying is blocked in this browser. Select the prompt text and copy it by hand.');
    }
  }

  const draftPrompt = `${systemPrompt}\n\n---\n\n${buildUserPrompt(brief)}`;
  const simplifyPrompt = `${systemPrompt}\n\n---\n\n${buildRefinePrompt('simplify', draft, result.findings.map((f) => `${f.section}: ${f.message}`))}`;

  function captureView() {
    const viewer = viewerRef.current as (HTMLElement & { toDataURL?: (type?: string) => string }) | null;
    const url = viewer?.toDataURL?.('image/png');
    if (url) {
      setSnapshot(url);
      setStatus('Model view saved for the A4 sheet.');
    }
  }

  function exportHtml(): string {
    const title = markdownTitle(draft);
    const modelUrl = `${window.location.origin}/#collection`;
    const qr = qrcode(0, 'M');
    qr.addData(modelUrl);
    qr.make();
    const footer = allVerified
      ? `Checked by ${escapeHtml(signoff || 'the treating clinician')} on ${new Date().toLocaleDateString('en-AU')}. Drafted with AI assistance on Vivatheca. Talk to your dentist or doctor about your own situation.`
      : DRAFT_NOTICE;
    const figure = snapshot && model?.id !== 'none'
      ? `<figure><img src="${snapshot}" alt="3D model view: ${escapeHtml(model?.name ?? '')}"><figcaption>${escapeHtml(model?.labels.map((l) => l.plain).join(' · ') ?? '')}</figcaption></figure>`
      : '';
    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title>
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
<div class="qr">${qr.createSvgTag({ cellSize: 3, margin: 0, scalable: true })}<div>Scan to open the 3D model</div></div>
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
      setStatus('Pop-ups are blocked. Use "Download HTML" and print that file instead.');
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
        <h2 id="ack-title">Before you start</h2>
        <ul>
          <li><strong>Drafts are generated by AI and are not guaranteed to be accurate.</strong> AI can make mistakes, including invented facts, numbers or sources that look convincing.</li>
          <li>Nothing here is medical advice, and Vivatheca does not review or verify what you create. Read the <a href="/disclaimer" target="_blank" rel="noreferrer">full disclaimer</a>.</li>
          <li><strong>You are responsible</strong> for checking every fact, number and source before giving the material to patients, and for following your local consent and governance rules.</li>
          <li><strong>Do not enter patient information.</strong> Use general facts only. Briefs and drafts stay in this browser; AI requests are sent to Anthropic for processing and are not stored by Vivatheca.</li>
          <li>The readability checker is a first filter, not proof of quality. Test materials with people from the intended audience.</li>
        </ul>
        <label className="builder-check"><input type="checkbox" checked={ackTicked} onChange={(e) => setAckTicked(e.target.checked)} /> I understand and accept these limits.</label>
        <button className="button" type="button" disabled={!ackTicked} onClick={acknowledge}>Continue to the builder</button>
      </section>
    );
  }

  return (
    <div className="builder">
      <p className="builder-banner" role="note"><strong>AI can make mistakes.</strong> Every draft is unverified until you check it. Do not enter patient information.</p>

      <section className="builder-panel" aria-labelledby="brief-title">
        <h2 id="brief-title"><span className="builder-step">1</span> Brief</h2>
        <div className="builder-grid">
          <label>Vivatheca model
            <select value={brief.modelId} onChange={(e) => update('modelId', e.target.value)}>
              {modelBriefs.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </label>
          <label>What to make
            <select value={brief.material} onChange={(e) => update('material', e.target.value as MaterialType)}>
              {Object.entries(materialTypes).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </label>
          <label>Audience
            <select value={brief.audience} onChange={(e) => update('audience', e.target.value as Audience)}>
              {Object.entries(audiences).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label>Topic
            <input value={brief.topic} onChange={(e) => update('topic', e.target.value)} />
          </label>
        </div>
        <label>Key points to cover <span className="builder-hint">One per line. General facts only.</span>
          <textarea rows={4} value={brief.keyPoints} onChange={(e) => update('keyPoints', e.target.value)} placeholder="e.g. Why the tooth may need to come out; what happens on the day; how long recovery takes" />
        </label>
        <label>Risk numbers <span className="builder-hint">Only numbers you can source, with the source number. The AI is told not to invent any.</span>
          <textarea rows={3} value={brief.riskNumbers} onChange={(e) => update('riskNumbers', e.target.value)} placeholder="e.g. Lasting lip or chin numbness: about 1 in 100 when the roots are close to the nerve [1]" />
        </label>
        <label>Sources <span className="builder-hint">Numbered, as they should appear in the reference list.</span>
          <textarea rows={3} value={brief.sources} onChange={(e) => update('sources', e.target.value)} placeholder="[1] Author, Title, Journal, Year. DOI" />
        </label>
        {briefDetails.length ? <p className="builder-alert" role="alert">This may contain patient details ({briefDetails.join(', ')}). Remove them before continuing.</p> : null}
        <div className="builder-actions">
          {aiEnabled ? (
            <button className="button" type="button" onClick={generate} disabled={Boolean(busy) || briefDetails.length > 0}>{busy === 'draft' ? 'Drafting…' : 'Draft with AI'}</button>
          ) : null}
          <button className={aiEnabled ? 'button button-secondary' : 'button'} type="button" onClick={() => copy(draftPrompt, 'Prompt')} disabled={briefDetails.length > 0}>Copy prompt for your own AI chat</button>
        </div>
        {!aiEnabled ? <p className="builder-hint">One-click AI drafting is not switched on yet. Copy the prompt into any AI chat you already use (for example Claude or ChatGPT), then paste the answer into the draft below.</p> : null}
        <details className="builder-prompt"><summary>Show the full prompt</summary><pre>{draftPrompt}</pre></details>
      </section>

      <section className="builder-panel" aria-labelledby="draft-title">
        <h2 id="draft-title"><span className="builder-step">2</span> Draft and refine</h2>
        <div className="builder-editor">
          <label className="builder-draft">Draft (Markdown)
            <textarea rows={22} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Your draft appears here. You can also paste or write text yourself." />
          </label>
          <aside className="builder-checks" aria-labelledby="checks-title" aria-live="polite">
            <h3 id="checks-title">Checker</h3>
            <dl className="builder-scores">
              <div><dt>Reading grade</dt><dd className={result.scores.fkgl !== null && result.scores.fkgl > limits.maxFkgl ? 'over' : ''}>{result.scores.fkgl ?? '–'} <small>target ≤ {limits.maxFkgl}</small></dd></div>
              <div><dt>SMOG</dt><dd className={result.scores.smog !== null && result.scores.smog > limits.maxSmog ? 'over' : ''}>{result.scores.smog ?? '–'} <small>target ≤ {limits.maxSmog}</small></dd></div>
              <div><dt>Reading ease</dt><dd className={result.scores.fre !== null && result.scores.fre < limits.minFre ? 'over' : ''}>{result.scores.fre ?? '–'} <small>target ≥ {limits.minFre}</small></dd></div>
              <div><dt>Words</dt><dd>{result.scores.words}{brief.material === 'narration' ? <small> ≈ {spokenSeconds(draft)} s spoken</small> : null}</dd></div>
            </dl>
            <p className="builder-count"><strong>{errors.length}</strong> to fix · <strong>{warnings.length}</strong> to consider</p>
            {draftDetails.length ? <p className="builder-alert" role="alert">Possible patient details: {draftDetails.join(', ')}.</p> : null}
            <ul className="builder-findings">
              {[...errors, ...warnings].slice(0, 60).map((f, i) => (
                <li key={i} className={f.severity}>
                  <span className="finding-section">{f.section}</span> {f.message}
                  {f.excerpt ? <q>{f.excerpt}</q> : null}
                </li>
              ))}
            </ul>
            <p className="builder-hint">Checks from the open-source patient-education-toolkit, based on the guidance listed below the builder (NHS, ISO 24495-1, CDC, PEMAT, IPDAS). Scores are estimates.</p>
          </aside>
        </div>
        <div className="builder-actions">
          {aiEnabled ? (
            <>
              <button className="button button-secondary" type="button" onClick={() => refine('simplify')} disabled={!draft || Boolean(busy) || draftDetails.length > 0}>{busy === 'simplify' ? 'Simplifying…' : 'Make it simpler (AI)'}</button>
              <button className="button button-secondary" type="button" onClick={() => refine('review')} disabled={!draft || Boolean(busy) || draftDetails.length > 0}>{busy === 'review' ? 'Reviewing…' : 'PEMAT and CDC review (AI)'}</button>
            </>
          ) : (
            <button className="button button-secondary" type="button" onClick={() => copy(simplifyPrompt, 'Simplify prompt')} disabled={!draft}>Copy a &ldquo;make it simpler&rdquo; prompt</button>
          )}
        </div>
        {review ? (
          <div className="builder-review">
            <h3>AI review <span className="builder-hint">Unverified. Use as suggestions only.</span></h3>
            <div dangerouslySetInnerHTML={{ __html: markdownToHtml(review) }} />
          </div>
        ) : null}
      </section>

      <section className="builder-panel" aria-labelledby="export-title">
        <h2 id="export-title"><span className="builder-step">3</span> Check and export</h2>
        {model?.glb && viewerReady ? (
          <div className="builder-model">
            {React.createElement('model-viewer', {
              ref: viewerRef,
              src: model.glb,
              alt: `3D model: ${model.name}`,
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
              <p>Turn the model to the view you want on the A4 sheet, then save it. The sheet also gets a QR code that opens the model.</p>
              <button className="button button-secondary" type="button" onClick={captureView}>Use this view on the sheet</button>
              {snapshot ? <img className="builder-snapshot" src={snapshot} alt="Saved model view for the sheet" /> : null}
            </div>
          </div>
        ) : null}
        <fieldset className="builder-verify">
          <legend>Clinician check</legend>
          <p className="builder-hint">Until every box is ticked, exports carry the notice &ldquo;{DRAFT_NOTICE}&rdquo;. Editing the draft clears the ticks.</p>
          {verificationItems.map((item, i) => (
            <label key={item} className="builder-check">
              <input type="checkbox" checked={verified[i]} onChange={(e) => tick(i, e.target.checked)} /> {item}
            </label>
          ))}
          <label>Checked by (name and role, optional)
            <input value={signoff} onChange={(e) => setSignoff(e.target.value)} placeholder="e.g. Dr A Smith, Oral and Maxillofacial Surgeon" />
          </label>
        </fieldset>
        <div className="builder-actions">
          <button className="button" type="button" disabled={!draft} onClick={printSheet}>Print or save A4 sheet as PDF</button>
          <button className="button button-secondary" type="button" disabled={!draft} onClick={() => download(`${slug()}.html`, exportHtml(), 'text/html')}>Download HTML</button>
          <button className="button button-secondary" type="button" disabled={!draft} onClick={() => download(`${slug()}.md`, markdownExport(), 'text/markdown')}>Download Markdown</button>
        </div>
        {draft ? (
          <div className="builder-preview" aria-label="Preview">
            <p className="builder-hint">Preview. &ldquo;Notes for the clinician&rdquo; are left out of exports.</p>
            <div dangerouslySetInnerHTML={{ __html: markdownToHtml(stripClinicianNotes(draft)) }} />
            <p className={allVerified ? 'builder-footer' : 'builder-footer draft'}>{allVerified ? `Checked by ${signoff || 'the treating clinician'}.` : DRAFT_NOTICE}</p>
          </div>
        ) : null}
      </section>
      <p className="builder-status" role="status" aria-live="polite">{status}</p>
    </div>
  );
}
