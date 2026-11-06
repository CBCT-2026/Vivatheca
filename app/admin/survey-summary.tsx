'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/context';
import { plain, Ruby } from '../i18n/ruby';

// Clinician survey results for /admin: counts, averages, agreement share, written answers and a CSV.
// Rows come from /api/admin/survey (worker/store.ts); nothing here is shown to the public.
const ITEMS = ['accurate', 'normal', 'use', 'sources', 'easy'] as const;
const COLUMNS = ['id', 'created', 'role', 'country', 'model', ...ITEMS, 'better', 'next', 'lang'] as const;
type Row = Record<string, string | number>;

export function summarise(rows: Row[]) {
  const items = ITEMS.map((k) => {
    const v = rows.map((r) => Number(r[k])).filter((n) => n >= 1 && n <= 5);
    const mean = v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
    const agree = v.length ? v.filter((n) => n >= 4).length / v.length : 0;
    return { key: k, mean, agree };
  });
  const roles = new Map<string, number>();
  for (const r of rows) roles.set(String(r.role || '—'), (roles.get(String(r.role || '—')) ?? 0) + 1);
  return { items, roles: [...roles.entries()].sort((a, b) => b[1] - a[1]) };
}

export function toCsv(rows: Row[]) {
  // Quote every cell; a leading = + - @ is prefixed with ' so spreadsheets do not run it as a formula.
  const cell = (v: unknown) => {
    let s = v == null ? '' : String(v);
    if (/^[=+\-@]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  };
  return [COLUMNS.join(','), ...rows.map((r) => COLUMNS.map((c) => cell(r[c])).join(','))].join('\r\n') + '\r\n';
}

export function SurveySummary({ adminKey }: { adminKey: string }) {
  const { t } = useI18n();
  const a = t.admin.survey;
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    let live = true;
    fetch('/api/admin/survey', { headers: { 'X-Admin-Token': adminKey } })
      .then((r) => (r.ok ? (r.json() as Promise<{ rows?: Row[] }>) : { rows: [] }))
      .then((d: { rows?: Row[] }) => { if (live) setRows(d.rows ?? []); })
      .catch(() => { if (live) setRows([]); });
    return () => { live = false; };
  }, [adminKey]);

  async function remove(id: string) {
    await fetch('/api/admin/survey/remove', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminKey }, body: JSON.stringify({ id }) });
    setRows((list) => (list ?? []).filter((r) => r.id !== id));
  }

  function download() {
    const blob = new Blob(['﻿' + toCsv(rows ?? [])], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'vivatheca-survey-' + new Date().toISOString().slice(0, 10) + '.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  if (!rows) return null;
  const s = summarise(rows);
  const written = rows.filter((r) => r.better || r.next);
  return (
    <section className="survey-summary" aria-labelledby="survey-summary-heading">
      <h2 id="survey-summary-heading"><Ruby text={a.heading} /></h2>
      {!rows.length ? <p><Ruby text={a.none} /></p> : (
        <>
          <p><Ruby text={a.count.replace('{n}', String(rows.length))} /></p>
          <p className="detail-note"><Ruby text={a.note} /></p>
          <div className="table-scroll">
            <table className="survey-table">
              <thead><tr><th scope="col"><Ruby text={a.item} /></th><th scope="col"><Ruby text={a.mean} /></th><th scope="col"><Ruby text={a.agree} /></th></tr></thead>
              <tbody>
                {s.items.map((i) => (
                  <tr key={i.key}><th scope="row"><Ruby text={t.survey.items[i.key]} /></th><td>{i.mean.toFixed(1)}</td><td>{Math.round(i.agree * 100)}%</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3><Ruby text={a.roles} /></h3>
          <ul>{s.roles.map(([role, n]) => <li key={role}>{role}: {n}</li>)}</ul>
          {written.length ? (
            <>
              <h3><Ruby text={a.comments} /></h3>
              <ul className="used-list">
                {written.map((r) => (
                  <li key={String(r.id)} className="used-item">
                    <p className="request-meta">{String(r.created).slice(0, 16).replace('T', ' ')} · {String(r.role)}{r.model ? ' · ' + String(r.model) : ''}</p>
                    {r.better ? <p>{String(r.better)}</p> : null}
                    {r.next ? <p>→ {String(r.next)}</p> : null}
                    <button className="button button-secondary" type="button" onClick={() => remove(String(r.id))}>{plain(a.remove)}</button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          <div className="form-actions"><button className="button" type="button" onClick={download}><Ruby text={a.csv} /></button></div>
        </>
      )}
    </section>
  );
}
