'use client';

import { useState } from 'react';
import { catalogue } from '../models/catalogue';
import { useI18n } from '../i18n/context';
import { dictionaries } from '../i18n/dictionaries';
import { plain, Ruby } from '../i18n/ruby';

// The email itself is always written in English (the inbox language); the form shows the visitor's language.
const en = dictionaries.en.report;

export function ReportForm({ initialModel }: { initialModel?: string }) {
  const { t } = useI18n();
  const r = t.report;
  const [model, setModel] = useState(initialModel && catalogue.some((item) => item.slug === initialModel) ? initialModel : catalogue[0].slug);
  const [issue, setIssue] = useState(0);
  const [role, setRole] = useState(-1);
  const [details, setDetails] = useState('');
  const [source, setSource] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const modelTitle = plain(dictionaries.en.library.items[model]?.title ?? model);
  const body = [
    `Model: ${modelTitle}`,
    `Issue: ${en.issues[issue]}`,
    role >= 0 ? `My role: ${en.roles[role]}` : '',
    '',
    'What is wrong and where:',
    details,
    '',
    source ? `Supporting source: ${source}` : '',
  ].filter((line, index, all) => line !== '' || (all[index - 1] ?? '') !== '').join('\n');

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (details.trim().length < 10) {
      setError(plain(r.tooShort));
      return;
    }
    setError('');
    const subject = `Inaccuracy report: ${modelTitle}`;
    const url = `mailto:hello@vivatheca.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\n/g, '\r\n'))}`;
    if (url.length > 1900) {
      setError(plain(r.tooLong));
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
      <label><Ruby text={r.model} />
        <select value={model} onChange={(event) => setModel(event.target.value)}>
          {catalogue.map((item) => <option key={item.slug} value={item.slug}>{plain(t.library.items[item.slug].title)}</option>)}
        </select>
      </label>
      <label><Ruby text={r.issue} />
        <select value={issue} onChange={(event) => setIssue(Number(event.target.value))}>
          {r.issues.map((item, index) => <option key={item} value={index}>{plain(item)}</option>)}
        </select>
      </label>
      <label><Ruby text={r.role} />
        <select value={role} onChange={(event) => setRole(Number(event.target.value))}>
          <option value={-1}>{plain(r.preferNot)}</option>
          {r.roles.map((item, index) => <option key={item} value={index}>{plain(item)}</option>)}
        </select>
      </label>
      <p className="report-privacy" id="report-privacy"><strong><Ruby text={r.privacyLead} /></strong> <Ruby text={r.privacy} /></p>
      <label><Ruby text={r.details} />
        <textarea rows={6} maxLength={1500} value={details} onChange={(event) => setDetails(event.target.value)} aria-invalid={error ? true : undefined} aria-describedby={error ? 'report-privacy report-error' : 'report-privacy'} placeholder={plain(r.detailsPlaceholder)} />
      </label>
      {error ? <p className="form-error" id="report-error" role="alert">{error}</p> : null}
      <label><Ruby text={r.source} />
        <input type="text" value={source} onChange={(event) => setSource(event.target.value)} placeholder={plain(r.sourcePlaceholder)} />
      </label>
      <div className="form-actions">
        <button className="button" type="submit"><Ruby text={r.open} /></button>
        <button className="button button-secondary" type="button" onClick={copy}><Ruby text={copied ? r.copied : r.copy} /></button>
      </div>
      <span className="visually-hidden" aria-live="polite">{copied ? plain(r.copiedLive) : ''}</span>
    </form>
  );
}
