'use client';

import { useState } from 'react';
import { catalogue } from '../models/catalogue';

const issueTypes = ['Anatomy is wrong', 'Condition is not shown accurately', 'Label or text is wrong', 'Download or print problem', 'Other'];
const roles = ['Dentist', 'Dental specialist', 'Oral health therapist or hygienist', 'Dental therapist', 'Dental prosthetist', 'Medical doctor', 'Student', 'Patient or carer', 'Other'];

export function ReportForm({ initialModel }: { initialModel?: string }) {
  const [model, setModel] = useState(initialModel && catalogue.some((item) => item.slug === initialModel) ? initialModel : catalogue[0].slug);
  const [issue, setIssue] = useState(issueTypes[0]);
  const [role, setRole] = useState('');
  const [details, setDetails] = useState('');
  const [source, setSource] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const modelTitle = catalogue.find((item) => item.slug === model)?.title ?? model;
  const body = [
    `Model: ${modelTitle}`,
    `Issue: ${issue}`,
    role ? `My role: ${role}` : '',
    '',
    'What is wrong and where:',
    details,
    '',
    source ? `Supporting source: ${source}` : '',
  ].filter((line, index, all) => line !== '' || (all[index - 1] ?? '') !== '').join('\n');

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (details.trim().length < 10) {
      setError('Please describe what is wrong and where (at least a sentence).');
      return;
    }
    setError('');
    const subject = `Inaccuracy report: ${modelTitle}`;
    const url = `mailto:hello@vivatheca.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\n/g, '\r\n'))}`;
    if (url.length > 1900) {
      setError('This report is too long for an email link. Use “Copy report text” and paste it into an email to hello@vivatheca.com.');
      return;
    }
    window.location.href = url;
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(`To: hello@vivatheca.com\nSubject: Inaccuracy report: ${modelTitle}\n\n${body}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <form className="report-form" onSubmit={submit} noValidate>
      <label>Model
        <select value={model} onChange={(event) => setModel(event.target.value)}>
          {catalogue.map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}
        </select>
      </label>
      <label>What kind of problem?
        <select value={issue} onChange={(event) => setIssue(event.target.value)}>
          {issueTypes.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label>Your role (optional)
        <select value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="">Prefer not to say</option>
          {roles.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <p className="report-privacy" id="report-privacy"><strong>Do not include patient details</strong> such as names, dates of birth or images from a patient record.</p>
      <label>What is wrong and where?
        <textarea rows={6} maxLength={1500} value={details} onChange={(event) => setDetails(event.target.value)} aria-invalid={error ? true : undefined} aria-describedby={error ? 'report-privacy report-error' : 'report-privacy'} placeholder="For example: the nerve should run below the second molar roots, not between them." />
      </label>
      {error ? <p className="form-error" id="report-error" role="alert">{error}</p> : null}
      <label>Supporting source (optional)
        <input type="text" value={source} onChange={(event) => setSource(event.target.value)} placeholder="DOI, link or reference" />
      </label>
      <div className="form-actions">
        <button className="button" type="submit">Open in my email app</button>
        <button className="button button-secondary" type="button" onClick={copy}>{copied ? 'Copied' : 'Copy report text'}</button>
      </div>
      <span className="visually-hidden" aria-live="polite">{copied ? 'Report text copied' : ''}</span>
    </form>
  );
}
