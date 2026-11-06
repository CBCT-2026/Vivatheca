import { contactIconPaths } from './contact-icons';
import { contactLinks, mailto } from './contact';
import { disclaimerHref } from './disclaimer-text';
import { format, type Dictionary } from './i18n/dictionaries';
import { plain, Ruby } from './i18n/ruby';

// Official Instagram glyph and X logo, generic envelope for email (see app/contact-icons.ts for the brand rules).
const icons = contactIconPaths;

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
          const icon = <svg className={`contact-icon contact-icon-${link.id}`} aria-hidden="true" focusable="false" width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d={icons[link.id]} /></svg>;
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
