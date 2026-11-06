'use client';

import { useEffect, useState } from 'react';
import { catalogue, formatDate } from '../models/catalogue';
import { useI18n } from '../i18n/context';
import { format } from '../i18n/dictionaries';
import { localeTags } from '../i18n/config';
import { Ruby } from '../i18n/ruby';

const KINDS = ['view', 'download', 'share', 'image', 'steps', 'tour', 'embed', 'credit', 'print'] as const;

export function ImpactTable() {
  const { t, locale } = useI18n();
  const i = t.impact;
  const [data, setData] = useState<{ since: string | null; models: Record<string, Record<string, number>> } | null>(null);
  const [off, setOff] = useState(false);
  useEffect(() => {
    fetch('/api/stats').then((r) => (r.ok ? (r.json() as Promise<never>) : Promise.reject(r.status))).then(setData).catch(() => setOff(true));
  }, []);
  if (off) return <p className="detail-note" role="status"><Ruby text={i.unavailable} /></p>;
  if (!data) return <p role="status"><Ruby text={i.loading} /></p>;
  const n = (slug: string, k: string) => data.models[slug]?.[k] ?? 0;
  const total = (k: string) => catalogue.reduce((s, m) => s + n(m.slug, k), 0);
  return (
    <>
      {data.since ? <p><Ruby text={format(i.since, { date: formatDate(data.since, localeTags[locale].intl) })} /></p> : null}
      <div className="table-scroll" tabIndex={0} role="region" aria-label={i.heading.replace(/\{([^{}|]+)\|[^{}]+\}/g, '$1')}>
        <table className="impact-table">
          <thead><tr><th scope="col"><Ruby text={i.model} /></th>{KINDS.map((k) => <th key={k} scope="col"><Ruby text={i.kinds[k]} /></th>)}</tr></thead>
          <tbody>
            {catalogue.map((m) => (
              <tr key={m.slug}><th scope="row"><a href={m.href}><Ruby text={t.library.items[m.slug as keyof typeof t.library.items].title} /></a></th>{KINDS.map((k) => <td key={k}>{n(m.slug, k).toLocaleString(localeTags[locale].intl)}</td>)}</tr>
            ))}
          </tbody>
          <tfoot><tr><th scope="row"><Ruby text={i.total} /></th>{KINDS.map((k) => <td key={k}>{total(k).toLocaleString(localeTags[locale].intl)}</td>)}</tr></tfoot>
        </table>
      </div>
      <p className="detail-note"><Ruby text={i.method} /></p>
    </>
  );
}
