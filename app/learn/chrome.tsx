import { Fragment } from 'react';
import { ThemeToggle } from '../ui';
import { homeHref } from '../nav';
import { CompactFooter } from '../contact-section';
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
        <a className="brand" href={homeHref} aria-label={plain(t.common.home)}><img src="/brand/vivatheca-logo-primary.svg" alt="Vivatheca" width="181" height="136" /></a>
        <nav className="learn-crumbs" aria-label={plain(t.learn.sectionNav)}>
          <a href="/"><Ruby text={t.learn.forClinicians} /></a>
          <a href="/learn" aria-current="page"><Ruby text={t.learn.forStudents} /></a>
        </nav>
        <div className="header-actions">
          <LanguageSwitcher furigana={furigana} className="always" />
          <ThemeToggle />
        </div>
      </header>
    </>
  );
}

// Same footer as the other inner pages: contact band, site disclaimer and legal links.
export function LearnFooter({ t }: { t: Dictionary }) {
  return <CompactFooter t={t} />;
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
