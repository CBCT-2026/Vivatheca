'use client';

import { useEffect, useState } from 'react';
import { catalogue, formatDate } from '../models/catalogue';
import { useI18n } from '../i18n/context';
import { format } from '../i18n/dictionaries';
import { localeTags } from '../i18n/config';
import { plain, Ruby } from '../i18n/ruby';

type Post = { id: string; model: string; role: string; how: string; link: string; name: string; country: string; created: string };

export function UsedGallery({ initialModel }: { initialModel: string }) {
  const { t, locale } = useI18n();
  const u = t.used;
  const known = catalogue.some((m) => m.slug === initialModel);
  const [filter, setFilter] = useState(known ? initialModel : '');
  const [posts, setPosts] = useState<Post[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'off'>('loading');
  const [model, setModel] = useState(known ? initialModel : catalogue[0].slug);
  const [role, setRole] = useState('');
  const [how, setHow] = useState('');
  const [link, setLink] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [noPatient, setNoPatient] = useState(false);
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch('/api/used' + (filter ? '?model=' + filter : '')).then((r) => (r.ok ? (r.json() as Promise<never>) : Promise.reject(r.status))).then((d: { items: Post[] }) => { setPosts(d.items); setState('ready'); }).catch(() => setState('off'));
  }, [filter]);

  const title = (slug: string) => t.library.items[slug as keyof typeof t.library.items]?.title ?? slug;

  async function send(event: React.FormEvent) {
    event.preventDefault();
    setError(''); setMessage('');
    if (how.trim().length < 10) { setError(plain(u.tooShort)); return; }
    if (!noPatient) { setError(plain(u.needConsent)); return; }
    setSending(true);
    try {
      const res = await fetch('/api/used', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model, role, how, link, name, country, noPatient, website, lang: locale }) });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) { setMessage(plain(u.thanks)); setHow(''); setLink(''); setNoPatient(false); }
      else setError(plain(data.error === 'patient' ? u.patient : res.status === 429 ? u.busy : u.failed));
    } catch { setError(plain(u.failed)); }
    setSending(false);
  }

  return (
    <>
      <p className="detail-note"><Ruby text={u.note} /></p>
      <label className="used-filter"><Ruby text={u.filter} />
        <select value={filter} onChange={(e) => { setState('loading'); setFilter(e.target.value); }}>
          <option value="">{plain(u.all)}</option>
          {catalogue.map((m) => <option key={m.slug} value={m.slug}>{plain(title(m.slug))}</option>)}
        </select>
      </label>
      <div aria-live="polite">
        {state === 'loading' ? <p><Ruby text={u.loading} /></p> : null}
        {state === 'off' ? <p className="detail-note"><Ruby text={u.unavailable} /></p> : null}
        {state === 'ready' && !posts.length ? <p><Ruby text={u.empty} /></p> : null}
        {posts.length ? (
          <ul className="used-list">
            {posts.map((p) => (
              <li key={p.id} className="used-item">
                <p className="request-meta"><a href={catalogue.find((m) => m.slug === p.model)?.href ?? '/models'}><Ruby text={title(p.model)} /></a></p>
                <p className="used-how">{p.how}</p>
                <p className="request-meta">
                  <Ruby text={format(u.by, { who: [p.name, p.role, p.country].filter(Boolean).join(', ') || plain(u.someone) })} />{' '}
                  <Ruby text={format(u.on, { date: formatDate(p.created.slice(0, 10), localeTags[locale].intl) })} />
                  {p.link ? <> · <a href={p.link} target="_blank" rel="noopener noreferrer nofollow ugc"><Ruby text={u.see} /></a></> : null}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <section aria-labelledby="used-form">
        <h2 id="used-form"><Ruby text={u.formHeading} /></h2>
        <form className="report-form" onSubmit={send} noValidate>
          <label><Ruby text={u.model} />
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              {catalogue.map((m) => <option key={m.slug} value={m.slug}>{plain(title(m.slug))}</option>)}
            </select>
          </label>
          <label><Ruby text={u.role} />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">{plain(t.report.preferNot)}</option>
              {t.report.roles.map((item) => <option key={item} value={plain(item)}>{plain(item)}</option>)}
            </select>
          </label>
          <label><Ruby text={u.how} />
            <textarea rows={4} maxLength={1200} value={how} onChange={(e) => setHow(e.target.value)} placeholder={plain(u.howPlaceholder)} />
          </label>
          <label><Ruby text={u.link} /><input type="url" inputMode="url" maxLength={300} value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" /></label>
          <label><Ruby text={u.name} /><input maxLength={80} value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label><Ruby text={u.country} /><input maxLength={60} value={country} onChange={(e) => setCountry(e.target.value)} /></label>
          <label className="visually-hidden" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
          <label className="check-row"><input type="checkbox" checked={noPatient} onChange={(e) => setNoPatient(e.target.checked)} /> <span><Ruby text={u.noPatient} /></span></label>
          <p className="detail-note"><Ruby text={u.privacy} /></p>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          {message ? <p className="form-ok" role="status">{message}</p> : null}
          <div className="form-actions"><button className="button" type="submit" disabled={sending || state === 'off'}><Ruby text={sending ? u.sending : u.submit} /></button></div>
        </form>
      </section>
    </>
  );
}
