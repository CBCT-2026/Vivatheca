'use client';

import { useState } from 'react';
import { catalogue } from '../models/catalogue';
import { useI18n } from '../i18n/context';
import { plain, Ruby } from '../i18n/ruby';

const ITEMS = ['accurate', 'normal', 'use', 'sources', 'easy'] as const;
type Item = (typeof ITEMS)[number];

export function SurveyForm({ initialModel }: { initialModel: string }) {
  const { t, locale } = useI18n();
  const s = t.survey;
  const [role, setRole] = useState('');
  const [country, setCountry] = useState('');
  const [model, setModel] = useState(catalogue.some((m) => m.slug === initialModel) ? initialModel : '');
  const [scores, setScores] = useState<Partial<Record<Item, number>>>({});
  const [better, setBetter] = useState('');
  const [next, setNext] = useState('');
  const [noPatient, setNoPatient] = useState(false);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const title = (slug: string) => t.library.items[slug as keyof typeof t.library.items]?.title ?? slug;

  async function send(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (!role) { setError(plain(s.needRole)); return; }
    if (ITEMS.some((k) => !scores[k])) { setError(plain(s.needAll)); return; }
    if (!noPatient || !consent) { setError(plain(s.needConsent)); return; }
    setSending(true);
    try {
      const res = await fetch('/api/survey', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role, country, model, ...scores, better, next, noPatient, consent, website, lang: locale }) });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) setDone(true);
      else setError(plain(data.error === 'patient' ? s.patient : res.status === 429 ? s.busy : res.status === 503 ? s.unavailable : s.failed));
    } catch { setError(plain(s.failed)); }
    setSending(false);
  }

  if (done) return <p className="form-ok" role="status"><Ruby text={s.thanks} /></p>;

  return (
    <>
      <p className="detail-note"><Ruby text={s.method} /></p>
      <form className="report-form survey-form" onSubmit={send} noValidate>
        <label><Ruby text={s.role} />
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="">{plain(s.rolePick)}</option>
            {t.report.roles.map((item) => <option key={item} value={plain(item)}>{plain(item)}</option>)}
          </select>
        </label>
        <label><Ruby text={s.country} /><input maxLength={60} value={country} onChange={(e) => setCountry(e.target.value)} /></label>
        <label><Ruby text={s.model} />
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="">{plain(s.modelAny)}</option>
            {catalogue.map((m) => <option key={m.slug} value={m.slug}>{plain(title(m.slug))}</option>)}
          </select>
        </label>
        <p className="survey-legend"><strong><Ruby text={s.scaleLegend} /></strong></p>
        {ITEMS.map((k) => (
          <fieldset key={k} className="survey-item">
            <legend><Ruby text={s.items[k]} /></legend>
            <div className="survey-scale">
              {s.scale.map((label, i) => (
                <label key={i}>
                  <input type="radio" name={k} value={i + 1} checked={scores[k] === i + 1} onChange={() => setScores((v) => ({ ...v, [k]: i + 1 }))} />
                  <span><Ruby text={label} /></span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <label><Ruby text={s.better} /><textarea rows={3} maxLength={1000} value={better} onChange={(e) => setBetter(e.target.value)} /></label>
        <label><Ruby text={s.next} /><input maxLength={300} value={next} onChange={(e) => setNext(e.target.value)} /></label>
        <label className="visually-hidden" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
        <label className="check-row"><input type="checkbox" checked={noPatient} onChange={(e) => setNoPatient(e.target.checked)} /> <span><Ruby text={s.noPatient} /></span></label>
        <label className="check-row"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> <span><Ruby text={s.consent} /></span></label>
        <p className="detail-note"><Ruby text={s.privacy} /></p>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <div className="form-actions"><button className="button" type="submit" disabled={sending}><Ruby text={sending ? s.sending : s.submit} /></button></div>
      </form>
    </>
  );
}
