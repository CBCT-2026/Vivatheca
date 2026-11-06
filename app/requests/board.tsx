'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/context';
import { format } from '../i18n/dictionaries';
import { plain, Ruby } from '../i18n/ruby';
import { seededRequests } from './seed';

type Item = { id: string; votes: number; voted: boolean; title?: string; detail?: string; specialty?: string };

export function RequestBoard() {
  const { t, locale } = useI18n();
  const r = t.requests;
  const [state, setState] = useState<'loading' | 'ready' | 'off'>('loading');
  const [seeded, setSeeded] = useState<Item[]>(seededRequests.map((s) => ({ id: s.id, votes: 0, voted: false })));
  const [submitted, setSubmitted] = useState<Item[]>([]);
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [role, setRole] = useState('');
  const [website, setWebsite] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch('/api/requests').then((res) => (res.ok ? (res.json() as Promise<never>) : Promise.reject(res.status))).then((data: { seeded: Item[]; submitted: Item[] }) => {
      setSeeded(data.seeded); setSubmitted(data.submitted); setState('ready');
    }).catch(() => setState('off'));
  }, []);

  async function vote(id: string) {
    const bump = (list: Item[]) => list.map((i) => (i.id === id && !i.voted ? { ...i, votes: i.votes + 1, voted: true } : i));
    setSeeded(bump); setSubmitted(bump);
    try { await fetch('/api/requests/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); } catch { /* the count catches up on reload */ }
  }

  async function suggest(event: React.FormEvent) {
    event.preventDefault();
    setMessage(''); setError('');
    if (title.trim().length < 4) { setError(plain(r.tooShort)); return; }
    setSending(true);
    try {
      const res = await fetch('/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, detail, specialty, role, website, lang: locale }) });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) { setMessage(plain(r.thanks)); setTitle(''); setDetail(''); setSpecialty(''); setRole(''); }
      else setError(plain(data.error === 'patient' ? r.patient : res.status === 429 ? r.busy : r.failed));
    } catch { setError(plain(r.failed)); }
    setSending(false);
  }

  const count = (n: number) => (n === 0 ? r.noSupport : n === 1 ? r.supporter : format(r.supporters, { n }));
  const row = (item: Item, words: { title: string; specialty?: string; detail?: string }, own: boolean) => (
    <li key={item.id} className="request-item">
      <div>
        <h3>{own ? words.title : <Ruby text={words.title} />}</h3>
        {words.specialty ? <p className="request-meta">{own ? words.specialty : <Ruby text={words.specialty} />}</p> : null}
        {words.detail ? <p>{words.detail}</p> : null}
      </div>
      <div className="request-vote">
        <span className="request-count">{state === 'ready' ? <Ruby text={count(item.votes)} /> : null}</span>
        {state === 'ready' ? (
          <button type="button" className="button button-secondary" aria-pressed={item.voted} disabled={item.voted} onClick={() => vote(item.id)}>
            <Ruby text={item.voted ? r.supported : r.support} />
          </button>
        ) : null}
      </div>
    </li>
  );

  return (
    <>
      {state === 'loading' ? <p role="status"><Ruby text={r.loading} /></p> : null}
      {state === 'off' ? <p className="detail-note" role="status"><Ruby text={r.unavailable} /></p> : null}
      <section aria-labelledby="req-list">
        <h2 id="req-list"><Ruby text={r.listHeading} /></h2>
        <ul className="request-list">
          {[...seeded].sort((a, b) => b.votes - a.votes).map((item) => row(item, r.seeds[item.id as keyof typeof r.seeds], false))}
        </ul>
      </section>
      {submitted.length ? (
        <section aria-labelledby="req-submitted">
          <h2 id="req-submitted"><Ruby text={r.submittedHeading} /></h2>
          <ul className="request-list">{[...submitted].sort((a, b) => b.votes - a.votes).map((item) => row(item, { title: item.title ?? '', specialty: item.specialty, detail: item.detail }, true))}</ul>
        </section>
      ) : null}
      <section aria-labelledby="req-suggest">
        <h2 id="req-suggest"><Ruby text={r.suggestHeading} /></h2>
        <p><Ruby text={r.suggestIntro} /></p>
        <form className="report-form" onSubmit={suggest} noValidate>
          <label><Ruby text={r.fieldTitle} />
            <input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder={plain(r.fieldTitlePlaceholder)} required />
          </label>
          <label><Ruby text={r.fieldDetail} />
            <textarea rows={3} value={detail} maxLength={1000} onChange={(e) => setDetail(e.target.value)} placeholder={plain(r.fieldDetailPlaceholder)} />
          </label>
          <label><Ruby text={r.fieldSpecialty} />
            <input value={specialty} maxLength={80} onChange={(e) => setSpecialty(e.target.value)} />
          </label>
          <label><Ruby text={r.fieldRole} />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">{plain(t.report.preferNot)}</option>
              {t.report.roles.map((item) => <option key={item} value={plain(item)}>{plain(item)}</option>)}
            </select>
          </label>
          {/* Left empty by people; bots that fill every field are ignored. */}
          <label className="visually-hidden" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
          <p className="report-privacy"><strong><Ruby text={r.privacyLead} /></strong> <Ruby text={r.privacy} /></p>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          {message ? <p className="form-ok" role="status">{message}</p> : null}
          <div className="form-actions"><button className="button" type="submit" disabled={sending || state === 'off'}><Ruby text={sending ? r.sending : r.submit} /></button></div>
        </form>
        <p className="detail-note"><Ruby text={r.makeIt} /> <a href="/contribute"><Ruby text={r.makeItLink} /> →</a></p>
      </section>
    </>
  );
}
