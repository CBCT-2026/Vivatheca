import Link from 'next/link';
import { Fragment } from 'react';
import { ThemeToggle } from '../ui';
import { disclaimerHref } from '../disclaimer-text';
import type { Dictionary } from '../i18n/dictionaries';
import { plain, Ruby } from '../i18n/ruby';
import { LanguageSwitcher } from '../i18n/switcher';
import type { Source } from './sources';

// Shared header, footer and citation helpers for the student pages (/learn).

export function LearnHeader({ t, furigana }: { t: Dictionary; furigana: boolean }) {
  return (
    <>
      <a className="skip-link" href="#main-content"><Ruby text={t.common.skip} /></a>
      <header className="site-header builder-header">
        <Link className="brand" href="/" aria-label={plain(t.common.home)}><img src="/brand/vivatheca-logo-primary.svg" alt="Vivatheca" width="181" height="136" /></Link>
        <nav className="learn-crumbs" aria-label={plain(t.learn.sectionNav)}>
          <Link href="/"><Ruby text={t.learn.forClinicians} /></Link>
          <Link href="/learn" aria-current="page"><Ruby text={t.learn.forStudents} /></Link>
        </nav>
        <div className="header-actions">
          <LanguageSwitcher furigana={furigana} className="always" />
          <ThemeToggle />
        </div>
      </header>
    </>
  );
}

export function LearnFooter({ t }: { t: Dictionary }) {
  return (
    <footer className="learn-footer">
      <p className="disclaimer"><Ruby text={t.disclaimer.site} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a></p>
      <p>© 2026 Vivatheca</p>
    </footer>
  );
}

// Renders text with [n] markers as numbered superscript links to #src-n.
export function Cited({ text, label }: { text: string; label: string }) {
  const parts = text.split(/(\[\d+\])/);
  return (
    <>
      {parts.map((part, index) => {
        const match = /^\[(\d+)\]$/.exec(part);
        if (!match) return part ? <Fragment key={index}><Ruby text={part} /></Fragment> : null;
        const n = match[1];
        return <sup key={index} className="cite"><a href={`#src-${n}`} aria-label={plain(label.replace('{n}', n))}>{n}</a></sup>;
      })}
    </>
  );
}

export function SourceList({ sources, heading }: { sources: Source[]; heading: string }) {
  return (
    <section className="learn-sources" aria-labelledby="sources-heading">
      <h2 id="sources-heading"><Ruby text={heading} /></h2>
      <ol lang="en">
        {sources.map((source) => (
          <li key={source.id} id={`src-${source.id}`}>
            {source.text}{source.href ? <> <a href={source.href} target="_blank" rel="noreferrer">{source.href.replace(/^https:\/\//, '')}</a></> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
