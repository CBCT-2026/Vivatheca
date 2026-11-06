'use client';

import { useState } from 'react';
import { useI18n } from '../i18n/context';
import { plain, Ruby } from '../i18n/ruby';

type Pending = { kind: 'request' | 'used'; id: string; created: string; fields: Record<string, string> };
const SHOW = ['title', 'detail', 'specialty', 'model', 'how', 'link', 'name', 'role', 'country', 'lang'];

export function Moderation() {
  const { t } = useI18n();
  const a = t.admin;
  const [key, setKey] = useState('');
  const [items, setItems] = useState<Pending[] | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'off' | 'wrong'>('idle');

  async function load(k: string) {
    setState('loading');
    const res = await fetch('/api/admin/pending', { headers: { 'X-Admin-Token': k } }).catch(() => null);
    if (!res || res.status === 503) { setState('off'); return; }
    if (!res.ok) { setState('wrong'); setItems(null); return; }
    setItems(((await res.json()) as { items: Pending[] }).items); setState('idle');
  }

  async function act(item: Pending, action: 'approve' | 'remove') {
    await fetch('/api/admin/moderate', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Token': key }, body: JSON.stringify({ kind: item.kind, id: item.id, action }) });
    setItems((list) => (list ?? []).filter((x) => x.id !== item.id));
  }

  return (
    <>
      <form className="report-form" onSubmit={(e) => { e.preventDefault(); void load(key); }}>
        <label><Ruby text={a.key} /><input type="password" autoComplete="current-password" value={key} onChange={(e) => setKey(e.target.value)} /></label>
        <div className="form-actions">
          <button className="button" type="submit"><Ruby text={a.signIn} /></button>
          <button className="button button-secondary" type="button" onClick={() => { setKey(''); setItems(null); }}><Ruby text={a.signOut} /></button>
        </div>
        {state === 'off' ? <p className="form-error" role="alert"><Ruby text={a.off} /></p> : null}
        {state === 'wrong' ? <p className="form-error" role="alert"><Ruby text={a.wrong} /></p> : null}
        {state === 'loading' ? <p role="status"><Ruby text={a.loading} /></p> : null}
      </form>
      {items ? (
        <section aria-live="polite">
          <p className="detail-note"><Ruby text={a.check} /></p>
          {!items.length ? <p><Ruby text={a.empty} /></p> : (
            <ul className="used-list">
              {items.map((item) => (
                <li key={item.id} className="used-item">
                  <p className="request-meta"><strong><Ruby text={item.kind === 'request' ? a.request : a.used} /></strong> · {item.created.slice(0, 16).replace('T', ' ')}</p>
                  <dl className="admin-fields">{SHOW.filter((k) => item.fields[k]).map((k) => <div key={k}><dt>{k}</dt><dd>{item.fields[k]}</dd></div>)}</dl>
                  <div className="form-actions">
                    <button className="button" type="button" onClick={() => act(item, 'approve')}>{plain(a.approve)}</button>
                    <button className="button button-secondary" type="button" onClick={() => act(item, 'remove')}>{plain(a.remove)}</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </>
  );
}
