import { contactLinks, mailto } from './contact';
import { disclaimerHref } from './disclaimer-text';
import { format, type Dictionary } from './i18n/dictionaries';
import { plain, Ruby } from './i18n/ruby';

// Brand marks drawn inline so they follow the footer text colour.
const icons: Record<(typeof contactLinks)[number]['id'], React.ReactNode> = {
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.5" cy="6.5" r="1.2" /></>,
  x: <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43z" />,
  email: <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 2v.4l8 5 8-5V7H4zm16 2.75-7.47 4.67a1 1 0 0 1-1.06 0L4 9.75V17h16V9.75z" />,
};

// Contact band at the bottom of every page: Instagram, X and email. Details live in app/contact.ts.
export function ContactSection({ t }: { t: Dictionary }) {
  const c = t.contact;
  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-heading">
      <div className="contact-copy">
        <h2 id="contact-heading"><Ruby text={c.heading} /></h2>
        <p><Ruby text={c.intro} /></p>
      </div>
      <ul className="contact-links">
        {contactLinks.map((link) => {
          const name = link.id === 'email' ? c.email : link.name;
          const icon = <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">{icons[link.id]}</svg>;
          return (
            <li key={link.id}>
              {link.href ? (
                <a href={link.href} {...(link.id === 'email' ? {} : { target: '_blank', rel: 'noreferrer' })} title={plain(format(c.linkLabel, { name: plain(name) }))}>
                  {icon}
                  <span className="contact-name"><Ruby text={name} /></span>
                  <span className="contact-handle">{link.id === 'email' ? link.handle : `@${link.handle}`}</span>
                </a>
              ) : (
                // No destination yet (Luke, 2026-11-06): shown as a button, not a link.
                <a className="contact-pending" role="link" aria-disabled="true">
                  {icon}
                  <span className="contact-name"><Ruby text={name} /></span>
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// Footer for sub-pages (/create, /disclaimer): contact band plus the site disclaimer.
export function CompactFooter({ t }: { t: Dictionary }) {
  return (
    <footer className="site-footer site-footer-compact">
      <ContactSection t={t} />
      <div className="footer-legal">
        <p>© 2026 Vivatheca</p>
        <p className="disclaimer"><Ruby text={t.disclaimer.site} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a>{t.disclaimer.translationNote && <> <Ruby text={t.disclaimer.translationNote} /></>}</p>
        <nav aria-label={plain(t.footer.legal)}><a href={disclaimerHref}><Ruby text={t.disclaimer.nav} /></a><a href="/privacy"><Ruby text={t.footer.privacy} /></a><a href="/report"><Ruby text={t.footer.report} /></a><a href={mailto('Accessibility feedback')}><Ruby text={t.footer.accessibility} /></a></nav>
      </div>
    </footer>
  );
}
