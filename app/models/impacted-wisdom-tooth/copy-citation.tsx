'use client';

import { useState } from 'react';

export function CopyCitation({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  return (
    <div className="citation">
      <p>{text}</p>
      <button type="button" className="text-button" onClick={copy}>{copied ? 'Copied' : 'Copy citation'}</button>
      <span className="visually-hidden" aria-live="polite">{copied ? 'Citation copied' : ''}</span>
    </div>
  );
}
