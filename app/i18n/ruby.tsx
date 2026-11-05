import React from 'react';

// Translations mark furigana inline as {漢字|かんじ}. <Ruby> renders them as HTML ruby;
// readings are aria-hidden so screen readers and accessible names use the kanji once;
// plain() strips the readings for places that cannot hold markup (alt, aria-label, metadata).
const RUBY = /\{([^{}|]+)\|([^{}]+)\}/g;

export function plain(text: string): string {
  return text.replace(RUBY, '$1');
}

export function hasRuby(text: string): boolean {
  RUBY.lastIndex = 0;
  return RUBY.test(text);
}

export function rubyNodes(text: string): React.ReactNode {
  if (!text.includes('{')) return text;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(RUBY)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));
    nodes.push(<ruby key={key++}>{match[1]}<rp aria-hidden="true">(</rp><rt aria-hidden="true">{match[2]}</rt><rp aria-hidden="true">)</rp></ruby>);
    last = index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

// Wrapped in one <span> so flex containers (buttons, links with icons) treat the
// sentence as a single item instead of spacing out each ruby word.
export function Ruby({ text }: { text: string }) {
  const nodes = rubyNodes(text);
  return typeof nodes === 'string' ? <>{nodes}</> : <span className="ruby-text">{nodes}</span>;
}

// Renders **bold** segments as <strong>, with furigana inside either part.
export function RichText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return <span className="ruby-text">{parts.map((part, i) => (i % 2 ? <strong key={i}>{rubyNodes(part)}</strong> : <React.Fragment key={i}>{rubyNodes(part)}</React.Fragment>))}</span>;
}

// Readings joined into one string, for an HTML ruby string outside React (static pages, exports).
export function rubyHtml(text: string, escape: (s: string) => string = (s) => s): string {
  let out = '';
  let last = 0;
  for (const match of text.matchAll(RUBY)) {
    const index = match.index ?? 0;
    out += escape(text.slice(last, index));
    out += `<ruby>${escape(match[1])}<rp aria-hidden="true">(</rp><rt aria-hidden="true">${escape(match[2])}</rt><rp aria-hidden="true">)</rp></ruby>`;
    last = index + match[0].length;
  }
  return out + escape(text.slice(last));
}
