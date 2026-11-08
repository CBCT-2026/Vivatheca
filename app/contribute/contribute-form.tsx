'use client';

import { useState } from 'react';
import { useI18n } from '../i18n/context';
import { dictionaries } from '../i18n/dictionaries';
import { plain, Ruby } from '../i18n/ruby';
import { contact } from '../contact';

// Builds an email to the Vivatheca inbox (same pattern as /report). Nothing is uploaded or stored:
// files travel as a share link. The email is always written in English, the inbox language.
const en = dictionaries.en.submitModel;

export function ContributeForm({ initialKind = 0 }: { initialKind?: number }) {
  const { t } = useI18n();
  const c = t.submitModel;
  const [kind, setKind] = useState(initialKind);
  const [name, setName] = useState('');
  const [role, setRole] = useState(-1);
  const [condition, setCondition] = useState('');
  const [files, setFiles] = useState('');
  const [normal, setNormal] = useState(0);
  const [sources, setSources] = useState('');
  const [simplified, setSimplified] = useState('');
  const [why, setWhy] = useState('');
  const [confirms, setConfirms] = useState([false, false, false]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const submitting = kind === 0;

  const subject = `${submitting ? 'Model submission' : 'Model request'}: ${condition.trim() || 'untitled'}`;
  const body = [
    `Type: ${en.kinds[kind]}`,
    `Condition or anatomy: ${condition.trim()}`,
    name.trim() ? `Name for credit: ${name.trim()}` : '',
    role >= 0 ? `My role: ${en.roles[role]}` : '',
    submitting ? `Files: ${files.trim()}` : '',
    submitting ? `Matched normal model: ${en.normals[normal]}` : '',
    '',
    sources.trim() ? `Sources:\n${sources.trim()}` : '',
    '',
    submitting && simplified.trim() ? `What the model simplifies:\n${simplified.trim()}` : '',
    '',
    why.trim() ? `How I would use it with patients:\n${why.trim()}` : '',
    '',
    submitting ? ['I confirm:', ...en.confirms.map((line) => `- ${line}`)].join('\n') : '',
  ].filter((line, index, all) => line !== '' || (all[index - 1] ?? '') !== '').join('\n').trim();

  function check() {
    if (condition.trim().length < 3) return plain(c.needCondition);
    if (submitting && !/^https?:\/\/\S+/i.test(files.trim())) return plain(c.needFiles);
    if (submitting && sources.trim().length < 5) return plain(c.needSources);
    if (submitting && !confirms.every(Boolean)) return plain(c.needConfirm);
    return '';
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const problem = check();
    if (problem) {
      setError(problem);
      return;
    }
    const url = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\n/g, '\r\n'))}`;
    if (url.length > 1900) {
      setError(plain(c.tooLong));
      return;
    }
    setError('');
    window.location.href = url;
    // Many clinic computers have no email app, so the mailto link silently does nothing: say what to do.
    setSent(true);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(`To: ${contact.email}\nSubject: ${subject}\n\n${body}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const described = error ? 'contribute-privacy contribute-error' : 'contribute-privacy';

  return (
    <form className="report-form contribute-form" onSubmit={submit} noValidate>
      <fieldset className="contribute-kind">
        <legend><Ruby text={c.kind} /></legend>
        {c.kinds.map((label, index) => (
          <label key={label} className="contribute-choice">
            <input type="radio" name="kind" value={index} checked={kind === index} onChange={() => { setKind(index); setError(''); }} />
            <span><Ruby text={label} /></span>
          </label>
        ))}
      </fieldset>
      <p className="report-privacy" id="contribute-privacy"><strong><Ruby text={c.privacyLead} /></strong> <Ruby text={c.privacy} /></p>
      <label><Ruby text={c.condition} />
        <input type="text" maxLength={160} value={condition} onChange={(event) => setCondition(event.target.value)} placeholder={plain(c.conditionPlaceholder)} aria-describedby={described} />
      </label>
      {submitting ? (
        <>
          <label><Ruby text={c.files} />
            <input type="url" maxLength={400} value={files} onChange={(event) => setFiles(event.target.value)} placeholder={plain(c.filesPlaceholder)} aria-describedby="contribute-files-help" />
            <span className="field-help" id="contribute-files-help"><Ruby text={c.filesHelp} /></span>
          </label>
          <label><Ruby text={c.normal} />
            <select value={normal} onChange={(event) => setNormal(Number(event.target.value))}>
              {c.normals.map((item, index) => <option key={item} value={index}>{plain(item)}</option>)}
            </select>
          </label>
        </>
      ) : null}
      <label><Ruby text={submitting ? c.sources : c.sourcesRequest} />
        <textarea rows={4} maxLength={800} value={sources} onChange={(event) => setSources(event.target.value)} placeholder={plain(c.sourcesPlaceholder)} />
      </label>
      {submitting ? (
        <label><Ruby text={c.simplified} />
          <textarea rows={3} maxLength={500} value={simplified} onChange={(event) => setSimplified(event.target.value)} placeholder={plain(c.simplifiedPlaceholder)} />
        </label>
      ) : null}
      <label><Ruby text={c.why} />
        <textarea rows={3} maxLength={500} value={why} onChange={(event) => setWhy(event.target.value)} placeholder={plain(c.whyPlaceholder)} />
      </label>
      <label><Ruby text={c.name} />
        <input type="text" maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder={plain(c.namePlaceholder)} />
      </label>
      <label><Ruby text={c.role} />
        <select value={role} onChange={(event) => setRole(Number(event.target.value))}>
          <option value={-1}>{plain(c.preferNot)}</option>
          {c.roles.map((item, index) => <option key={item} value={index}>{plain(item)}</option>)}
        </select>
      </label>
      {submitting ? (
        <fieldset className="contribute-confirm">
          <legend><Ruby text={c.confirmHeading} /></legend>
          {c.confirms.map((label, index) => (
            <label key={label} className="contribute-choice">
              <input type="checkbox" checked={confirms[index]} onChange={(event) => setConfirms(confirms.map((value, i) => (i === index ? event.target.checked : value)))} />
              <span><Ruby text={label} /></span>
            </label>
          ))}
        </fieldset>
      ) : null}
      {error ? <p className="form-error" id="contribute-error" role="alert">{error}</p> : null}
      <div className="form-actions">
        <button className="button" type="submit"><Ruby text={c.open} /></button>
        <button className="button button-secondary" type="button" onClick={copy}><Ruby text={copied ? c.copied : c.copy} /></button>
      </div>
      {sent ? <p className="form-note" role="status"><Ruby text={c.mailHint} /></p> : null}
      <span className="visually-hidden" aria-live="polite">{copied ? plain(c.copiedLive) : ''}</span>
    </form>
  );
}
