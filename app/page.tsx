import Link from 'next/link';
import { trustItems, understandingPaths } from './data';
import { SiteFooter } from './site-chrome';
import { MobileNavigation, ModelExperience, ThemeToggle } from './ui';

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return <img aria-hidden="true" className="ui-icon" src={`/icons/${name}.svg`} width={size} height={size} alt="" />;
}

const publications = [
  {
    title: 'Impact of 3D-Printed Anatomical Models on Doctor-Patient Communication in Orthopedic Consultations',
    journal: 'Cureus · 2024 · Randomized clinical trial',
    finding: 'The trial compared consultations with and without 3D anatomical models and reported stronger patient knowledge and communication measures in the model group.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/39493008/',
  },
  {
    title: 'The use of 3-dimensionally printed models to optimize patient education and alleviate perioperative anxiety in Mohs surgery',
    journal: 'Journal of the American Academy of Dermatology · 2019 · Randomized controlled trial',
    finding: 'The study evaluated a printed procedural model alongside standardized education for patient understanding and perioperative anxiety.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/31163232/',
  },
  {
    title: 'Impact of a Virtual Three-Dimensional Thyroid Model on Patient Communication in Thyroid Surgery',
    journal: 'Cancers · 2026 · Randomized controlled trial',
    finding: 'Patients using a virtual 3D thyroid model showed improved comprehension of selected anatomy, surgical procedures and complications.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/41595161/',
  },
];

const contributionPaths = [
  { icon: 'health_and_safety', title: 'Report an inaccuracy', text: 'Seen anatomy or a label that does not look right? Tell us what and where, with a source if you have one.', href: '/report' },
  { icon: 'school', title: 'Join clinical review', text: 'Dentists, specialists and oral health professionals can check a model against their practice and the literature.', href: 'mailto:hello@vivatheca.com?subject=Join%20clinical%20review' },
  { icon: '3d_rotation', title: 'Request or submit a model', text: 'Tell us which condition you would use with patients, or share a model with its sources.', href: 'mailto:hello@vivatheca.com?subject=Model%20request' },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Vivatheca home"><img src="/brand/vivatheca-logo-primary.svg" alt="Vivatheca" width="181" height="136" /></a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/models">Models</Link><a href="#how-it-works">How it works</a><a href="#publications">Evidence</a><Link href="/create">Create</Link><Link href="/about">About</Link>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <a className="button button-compact" href="#sponsor">Sponsor a model</a>
          <MobileNavigation />
        </div>
      </header>

      <main id="main-content">
        <section className="hero" id="top">
          <div className="hero-copy">
            <h1 className="hero-title"><span className="hero-line">Medical models</span><span className="hero-line">made clear.</span></h1>
            <p className="hero-lede">A free, not-for-profit library of 3D dental and oral surgery models. Each condition comes with a matched normal, so clinicians can show patients what is different, on screen or as a 3D print.</p>
            <div className="hero-actions">
              <Link className="button" href="/models">Browse the models <Icon name="arrow_forward" /></Link>
              <a className="button button-secondary" href="#collection">Try the 3D viewer</a>
            </div>
            <ul className="access-list" aria-label="Access commitments"><li>Free to use</li><li>Open access</li><li>View digitally or print</li><li>Matched normal</li></ul>
          </div>
          <figure className="hero-visual">
            <img src="/assets/renders/wisdom-tooth-hero.webp" alt="3D model of a lower left jaw with an impacted wisdom tooth tilted against the second molar, its roots close to the nerve shown in red." width="1536" height="1024" fetchPriority="high" />
            <figcaption>Impacted lower wisdom tooth, with the nerve in red. Screenshot of the Vivatheca model.</figcaption>
          </figure>
        </section>

        <aside className="origin-band" aria-label="Australian origin">
          <a href="https://www.pmc.gov.au/resources/flag-images-and-template-files-download" target="_blank" rel="noreferrer" aria-label="Australian National Flag — official Australian Government image source">
            <img src="/assets/australian-national-flag.jpg" alt="Australian National Flag" width="120" height="60" />
          </a>
          <p>Founded and operated in Australia.</p>
        </aside>

        <section className="mission-band" aria-label="Vivatheca mission">
          <p>Open 3D models for clearer conversations.</p>
          <div className="mission-links"><span>View in 3D</span><span>Share by link</span><span>Print where possible</span></div>
        </section>

        <section className="collection-section" id="collection">
          <div className="section-heading split-heading">
            <div><h2>See the explanation from every angle.</h2><p>Rotate the impacted wisdom tooth, follow a short tour and switch between plain language and clinician detail. <Link href="/models/impacted-wisdom-tooth">Compare it with the matched normal</Link>.</p></div>
            <div className="section-label"><Icon name="3d_rotation" size={24} />Interactive model</div>
          </div>
          <ModelExperience />
        </section>

        <section className="understanding-section" id="how-it-works">
          <div className="section-heading compact-heading"><h2>One model. More ways to understand.</h2><p>The Vivatheca platform connects the moment of explanation with everything that may come after it.</p></div>
          <div className="understanding-paths">
            {understandingPaths.map((path, index) => (
              <article key={path.title}><span className="path-number">{String(index + 1).padStart(2, '0')}</span><Icon name={path.icon} size={30} /><h3>{path.title}</h3><p>{path.text}</p></article>
            ))}
          </div>
        </section>

        <section className="print-section">
          <figure><img src="/assets/renders/wisdom-tooth-compare.webp" alt="The impacted wisdom tooth model beside its matched normal, where the wisdom tooth stands upright in line with the other molars." width="1200" height="800" /><figcaption className="ai-disclaimer">Screenshot of the impacted and matched normal models.</figcaption></figure>
          <div className="print-copy"><h2>From the screen to something you can hold.</h2><p>Every model comes with a free STL file, scaled in millimetres, that you can print on a desktop 3D printer, so the explanation can move from the screen to the patient’s hands.</p><Link className="text-link" href="/models/impacted-wisdom-tooth">Download both STL files <Icon name="download" /></Link></div>
        </section>

        <section className="trust-section" id="trust">
          <div className="trust-intro"><Icon name="health_and_safety" size={36} /><h2>Trust should be visible, not implied.</h2><p>Every model lists its published sources, what is simplified, its version and change log, and whether a clinician has reviewed it yet. <Link href="/report">Report an inaccuracy</Link> and the fix is recorded in the change log.</p></div>
          <ul>{trustItems.map((item) => <li key={item.title}><span aria-hidden="true">✓</span><div><h3>{item.title}</h3><p>{item.text}</p></div></li>)}</ul>
          <p className="trust-warning"><strong>Review status today:</strong> no model has been independently reviewed yet, and each model page says so. Reviewers are being invited now.</p>
        </section>

        <section className="publications-section" id="publications">
          <div className="publications-intro">
            <h2>Evidence for seeing and holding anatomy.</h2>
            <p>Independent, peer-reviewed research has tested how physical and virtual 3D models can support patient knowledge, communication and understanding. Findings depend on the clinical setting and should not be treated as universal proof.</p>
            <p className="evidence-note">These articles are independent evidence and are not connected to Vivatheca.</p>
          </div>
          <div className="publication-list">
            {publications.map((publication) => (
              <article key={publication.href}>
                <div className="publication-copy">
                  <h3>{publication.title}</h3>
                  <p className="publication-journal">{publication.journal}</p>
                  <p>{publication.finding}</p>
                  <a className="text-link" href={publication.href} target="_blank" rel="noreferrer">Read the peer-reviewed article <Icon name="arrow_forward" /></a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="contribute-section" id="contribute">
          <div className="contribute-copy"><h2>Help build the collection.</h2><p>Clinicians keep the library accurate and decide what gets built next.</p><div className="contribution-paths">{contributionPaths.map((path) => <article key={path.title}><Icon name={path.icon} size={26} /><div><h3>{path.title}</h3><p>{path.text}</p><a className="text-link" href={path.href}>{path.href.startsWith('/') ? 'Open the form' : 'Email us'} <Icon name="arrow_forward" /></a></div></article>)}</div></div>
          <figure><img src="/assets/renders/dental-development.webp" alt="Dental development model at 9.5 years: right upper and lower jaw with blue baby teeth and yellow adult teeth forming beneath them." width="1200" height="800" /><figcaption className="ai-disclaimer">Screenshot of the dental development series, age 9.5. <a href="/development/">Open the series</a>.</figcaption></figure>
        </section>

        <section className="sponsor-section" id="sponsor">
          <div className="sponsor-intro"><div><h2>Help a model travel further.</h2><p>Sponsorship can support model development and future physical distribution to clinics that cannot print locally.</p></div><a className="button button-light" href="mailto:hello@vivatheca.com?subject=Sponsor%20a%20Vivatheca%20model">Start a sponsorship conversation <Icon name="arrow_forward" /></a></div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
