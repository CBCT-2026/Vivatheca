'use client';

import { useEffect } from 'react';

// Loads a plain script from /public after React has hydrated, so the script can fill an empty element
// that React rendered (the share panel on model pages, the /print tool) without a hydration mismatch.
export function AfterHydration({ src }: { src: string }) {
  useEffect(() => {
    if (document.querySelector(`script[src="${src}"]`)) return;
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    document.body.appendChild(s);
  }, [src]);
  return null;
}
