// Vivatheca's contact details: the ONE place to change them. Used by the contact section in
// every page footer (app/contact-section.tsx), the mailto links in app/data.ts and app/page.tsx,
// and copied by hand into public/development/index.html (static page, search "CONTACT").
//
// PLACEHOLDERS: Luke has not given the real Instagram and X handles yet, and the email is the
// address the site already used before this change. Fill them in here. An empty handle shows
// "Coming soon" instead of a link, so the site never points at someone else's account.
export const contact = {
  /** PLACEHOLDER: confirm this is the address Vivatheca should be contacted on. */
  email: 'hello@vivatheca.com',
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
