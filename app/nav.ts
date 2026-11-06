import type { Dictionary } from './i18n/dictionaries';

// One list for the top bar on every page (homepage, inner pages and the phone menu).
// Order (Luke, 2026-11-06): How it works, Model collection, then the rest, with Students before About.
// On the homepage, section links stay as #anchors; elsewhere they point back to the homepage section.
export function primaryLinks(t: Dictionary, onHome = false) {
  const home = onHome ? '' : '/';
  return [
    { label: t.nav.howItWorks, href: `${home}#how-it-works` },
    { label: t.nav.models, href: '/models' },
    { label: t.nav.evidence, href: `${home}#publications` },
    { label: t.nav.create, href: '/create' },
    { label: t.nav.students, href: '/learn' },
    { label: t.nav.about, href: '/about' },
  ];
}

// The logo always goes to the homepage. Every page header must use this.
export const homeHref = '/';
