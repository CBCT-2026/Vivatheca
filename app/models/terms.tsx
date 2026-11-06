import type { Source } from './catalogue';
import { Ruby } from '../i18n/ruby';

// Cites where a model's formal clinical name comes from (classification system or consensus term).
export function TermSources({ label, terms }: { label: string; terms: Source[] }) {
  return (
    <p className="term-sources">
      <Ruby text={label} />{' '}
      {terms.map((s, i) => (
        <span key={s.text}>
          {i > 0 ? ' ' : null}
          {s.href ? <a href={s.href} target="_blank" rel="noreferrer">{s.text}</a> : s.text}
        </span>
      ))}
    </p>
  );
}
