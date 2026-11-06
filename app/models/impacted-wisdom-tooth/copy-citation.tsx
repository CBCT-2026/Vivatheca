'use client';

import { useState } from 'react';
import { useI18n } from '../../i18n/context';
import { plain } from '../../i18n/ruby';

export function CopyCitation({ text }: { text: string }) {
  const { t } = useI18n();
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
      <p lang="en">{text}</p>
      <button type="button" className="text-button" onClick={copy}>{plain(copied ? t.wisdom.copied : t.wisdom.copyCitation)}</button>
      <span className="visually-hidden" aria-live="polite">{copied ? plain(t.wisdom.citationCopied) : ''}</span>
    </div>
  );
}
