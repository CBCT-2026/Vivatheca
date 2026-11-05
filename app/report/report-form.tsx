'use client';

import { useEffect, useState } from 'react';
import { catalogue } from '../models/catalogue';

const issueTypes = ['Anatomy is wrong', 'Condition is not shown accurately', 'Label or text is wrong', 'Download or print problem', 'Other'];
const roles = ['Dentist', 'Dental specialist', 'Oral health therapist or hygienist', 'Medical doctor', 'Student', 'Patient or carer', 'Other'];

export function ReportForm() {
  const [model, setModel] = useState(catalogue[0].slug);
  const [issue, setIssue] = useState(issueTypes[0]);
  const [role, setRole] = useState('');
  const [details, setDetails] = useState('');
  const [source, setSource] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('model');
    if (requested && catalogue.some((item) => item.slug === requested)) setModel(requested);
  }, []);

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
    window.location.href = `mailto:hello@vivatheca.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(`To: hello@vivatheca.com\nSubject: Inaccuracy report: ${modelTitle}\n\n${body}`);
      setCopied(true);
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
      <label>What is wrong and where?
        <textarea rows={6} value={details} onChange={(event) => setDetails(event.target.value)} aria-invalid={error ? true : undefined} aria-describedby={error ? 'report-error' : undefined} placeholder="For example: the nerve should run below the second molar roots, not between them." />
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
