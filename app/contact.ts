// Vivatheca's contact details: the ONE place to change them. Used by the contact section in
// every page footer (app/contact-section.tsx), the mailto links in app/data.ts and app/page.tsx,
// and copied by hand into the static pages: public/contact.js (most model pages) and the
// "CONTACT" blocks in public/development/index.html and public/cracked-tooth/index.html.
//
// PLACEHOLDERS: Luke has not given the real Instagram and X handles yet. Fill them in here. An empty handle shows
// a button with no destination yet, so the site never points at someone else's account.
export const contact = {
  /** Confirmed by Luke, 2026-11-06. */
  email: 'vivatheca@gmail.com',
  /** PLACEHOLDER: Instagram handle without the @, e.g. 'vivatheca'. Empty = not live yet. */
  instagram: '',
  /** PLACEHOLDER: X (Twitter) handle without the @, e.g. 'vivatheca'. Empty = not live yet. */
  x: '',
};

export function mailto(subject?: string) {
  return `mailto:${contact.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
}

export const contactLinks = [
  { id: 'instagram', name: 'Instagram', handle: contact.instagram, href: contact.instagram ? `https://www.instagram.com/${contact.instagram}/` : '' },
  { id: 'x', name: 'X', handle: contact.x, href: contact.x ? `https://x.com/${contact.x}` : '' },
  { id: 'email', name: 'Email', handle: contact.email, href: contact.email ? mailto() : '' },
] as const;
