import { disciplines, footerGroups, trustItems, understandingPaths } from './data';
import { ImpactMap } from './impact';
import { MobileNavigation, ModelExperience } from './ui';

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return <img aria-hidden="true" className="ui-icon" src={`/icons/${name}.svg`} width={size} height={size} alt="" />;
}

const publications = [
  {
    title: 'Impact of 3D-Printed Anatomical Models on Doctor-Patient Communication in Orthopedic Consultations',
    journal: 'Cureus · 2024 · Randomized clinical trial',
    finding: 'The trial compared consultations with and without 3D anatomical models and reported stronger patient knowledge and communication measures in the model group.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/39493008/',
    image: '/assets/research-orthopedic-communication.png',
    alt: 'A clinician and patient use a three-dimensional knee model during an orthopedic consultation.',
  },
  {
    title: 'The use of 3-dimensionally printed models to optimize patient education and alleviate perioperative anxiety in Mohs surgery',
    journal: 'Journal of the American Academy of Dermatology · 2019 · Randomized controlled trial',
    finding: 'The study evaluated a printed procedural model alongside standardized education for patient understanding and perioperative anxiety.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/31163232/',
    image: '/assets/research-mohs-education.png',
    alt: 'A dermatologist and patient discuss a layered, non-graphic three-dimensional skin model.',
  },
  {
    title: 'Impact of a Virtual Three-Dimensional Thyroid Model on Patient Communication in Thyroid Surgery',
    journal: 'Cancers · 2026 · Randomized controlled trial',
    finding: 'Patients using a virtual 3D thyroid model showed improved comprehension of selected anatomy, surgical procedures and complications.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/41595161/',
    image: '/assets/research-virtual-thyroid.png',
    alt: 'A clinician and patient explore an interactive three-dimensional thyroid model on a tablet.',
  },
];

const contributionPaths = [
  { icon: '3d_rotation', title: 'Submit a model', text: 'Share browser-ready anatomy, documentation and source details for review.', href: 'mailto:hello@vivatheca.com?subject=Submit%20a%20model' },
  { icon: 'volunteer_activism', title: 'Donate a printed model', text: 'Support printing and delivery for a clinic or hospital without local printing capability.', href: '#sponsor' },
  { icon: 'print', title: 'Donate 3D printing resources', text: 'Contribute filament, printing hardware or related equipment that can expand responsible model production and access.', href: 'mailto:hello@vivatheca.com?subject=Donate%203D%20printing%20resources' },
  { icon: 'health_and_safety', title: 'Review clinical accuracy', text: 'Clinicians can assess anatomy, limitations and usefulness for patient education.', href: 'mailto:hello@vivatheca.com?subject=Review%20clinical%20accuracy' },
  { icon: 'language', title: 'Translate health content', text: 'Health-area experts can adapt plain-language and clinical explanations for another language.', href: 'mailto:hello@vivatheca.com?subject=Translate%20health%20content' },
];

const translationAims = [
  { name: 'Arabic', native: 'العربية', lang: 'ar', direction: 'rtl' as const, flag: 'eg', flagLabel: 'Egypt' },
  { name: 'Bengali', native: 'বাংলা', lang: 'bn', flag: 'bd', flagLabel: 'Bangladesh' },
  { name: 'Cantonese Chinese', native: '粵語', lang: 'yue-Hant', flag: 'hk', flagLabel: 'Hong Kong' },
  { name: 'Dutch', native: 'Nederlands', lang: 'nl', flag: 'nl', flagLabel: 'Netherlands' },
  { name: 'English', native: 'English', lang: 'en-GB', flag: 'gb', flagLabel: 'United Kingdom' },
  { name: 'Farsi', native: 'فارسی', lang: 'fa', direction: 'rtl' as const, flag: 'ir', flagLabel: 'Iran' },
  { name: 'French', native: 'Français', lang: 'fr', flag: 'fr', flagLabel: 'France' },
  { name: 'German', native: 'Deutsch', lang: 'de', flag: 'de', flagLabel: 'Germany' },
  { name: 'Hindi', native: 'हिन्दी', lang: 'hi', flag: 'in', flagLabel: 'India' },
  { name: 'Italian', native: 'Italiano', lang: 'it', flag: 'it', flagLabel: 'Italy' },
  { name: 'Japanese', native: '日本語', lang: 'ja', flag: 'jp', flagLabel: 'Japan' },
  { name: 'Javanese', native: 'Basa Jawa', lang: 'jv', flag: 'id', flagLabel: 'Indonesia' },
  { name: 'Korean', native: '한국어', lang: 'ko', flag: 'kr', flagLabel: 'South Korea' },
  { name: 'Mandarin Chinese', native: '普通话', lang: 'zh-Hans', flag: 'cn', flagLabel: 'China' },
  { name: 'Portuguese', native: 'Português', lang: 'pt-PT', flag: 'pt', flagLabel: 'Portugal' },
  { name: 'Punjabi', native: 'پنجابی', lang: 'pa-Arab-PK', direction: 'rtl' as const, flag: 'pk', flagLabel: 'Pakistan' },
  { name: 'Russian', native: 'Русский', lang: 'ru', flag: 'ru', flagLabel: 'Russia' },
  { name: 'Spanish', native: 'Español', lang: 'es', flag: 'mx', flagLabel: 'Mexico' },
  { name: 'Swahili', native: 'Kiswahili', lang: 'sw', flag: 'tz', flagLabel: 'Tanzania' },
  { name: 'Tamil', native: 'தமிழ்', lang: 'ta', flag: 'in', flagLabel: 'India' },
  { name: 'Telugu', native: 'తెలుగు', lang: 'te', flag: 'in', flagLabel: 'India' },
  { name: 'Turkish', native: 'Türkçe', lang: 'tr', flag: 'tr', flagLabel: 'Türkiye' },
  { name: 'Urdu', native: 'اردو', lang: 'ur', direction: 'rtl' as const, flag: 'pk', flagLabel: 'Pakistan' },
  { name: 'Vietnamese', native: 'Tiếng Việt', lang: 'vi', flag: 'vn', flagLabel: 'Vietnam' },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Vivatheca home"><img src="/brand/vivatheca-logo-primary.svg" alt="Vivatheca" width="181" height="136" /></a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#collection">Browse</a><a href="#disciplines">Disciplines</a><a href="#how-it-works">How it works</a><a href="#publications">Publications</a><a href="#contribute">Contribute</a>
        </nav>
        <div className="header-actions">
          <button className="language-button" type="button" aria-label="Choose language" aria-describedby="language-status" disabled><Icon name="language" />English</button>
          <span className="visually-hidden" id="language-status">Additional languages are not yet available.</span>
          <a className="button button-compact" href="#sponsor">Sponsor a model</a>
          <MobileNavigation />
        </div>
      </header>

      <main id="main-content">
        <section className="hero" id="top">
          <div className="hero-copy">
            <h1 className="hero-title"><span className="hero-line">Medical models</span><span className="hero-line">made clear.</span></h1>
            <p className="hero-lede">The Vivatheca platform is a non-profit, open-source library for exploring, explaining, sharing and printing medical models. Browser-based access keeps the first step simple; transparent review and known limitations keep trust visible.</p>
            <div className="hero-actions">
              <a className="button" href="#collection">Explore the collection <Icon name="arrow_forward" /></a>
              <a className="button button-secondary" href="#how-it-works">See how it works</a>
            </div>
            <ul className="access-list" aria-label="Access commitments"><li>Free to use</li><li>Open access</li><li>View digitally or print</li></ul>
          </div>
          <figure className="hero-visual">
            <img src="/assets/consultation-hero.webp" alt="A clinician and patient examine a three-dimensional lower jaw model showing an impacted wisdom tooth." width="1536" height="1024" fetchPriority="high" />
            <figcaption>Visual explanation designed for the conversation, not just the classroom.</figcaption>
            <p className="ai-disclaimer">AI-generated illustration.</p>
          </figure>
        </section>

        <aside className="origin-band" aria-label="Australian origin">
          <a href="https://www.pmc.gov.au/resources/flag-images-and-template-files-download" target="_blank" rel="noreferrer" aria-label="Australian National Flag — official Australian Government image source">
            <img src="/assets/australian-national-flag.jpg" alt="Australian National Flag" width="120" height="60" />
          </a>
          <p>Founded and operated in Australia.</p>
        </aside>

        <section className="mission-band" aria-label="Vivatheca mission">
          <p>Open-source medical education for clearer conversations.</p>
          <div className="mission-links"><span>View in 3D</span><span>Share by link</span><span>Print where possible</span></div>
        </section>

        <section className="collection-section" id="collection">
          <div className="section-heading split-heading">
            <div><h2>See the explanation from every angle.</h2><p>The impacted wisdom tooth is the Vivatheca platform’s working demonstration. Rotate it, follow a short tour and switch the level of detail.</p></div>
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
          <figure><img src="/assets/screen-to-print.webp" alt="A jaw model moves from an interactive screen through a 3D printer to a physical teaching model held by a clinician." width="1536" height="1024" /><figcaption className="ai-disclaimer">AI-generated illustration.</figcaption></figure>
          <div className="print-copy"><h2>From the screen to something you can hold.</h2><p>Printable records can carry material, orientation, supports, build-volume guidance and estimated print time—so the model can move from explanation to hands-on learning.</p><a className="text-link" href="#sponsor">Learn about physical access <Icon name="arrow_forward" /></a></div>
        </section>

        <section className="trust-section" id="trust">
          <div className="trust-intro"><Icon name="health_and_safety" size={36} /><h2>Trust should be visible, not implied.</h2><p>The planned review record makes clinical approval, reviewer privacy and the source of supporting health information visible without asking clinicians to give medical advice.</p></div>
          <ul>{trustItems.map((item) => <li key={item.title}><span aria-hidden="true">✓</span><div><h3>{item.title}</h3><p>{item.text}</p></div></li>)}</ul>
          <figure className="review-record-demo" role="group" aria-label="Illustrative impacted molar clinical review record">
            <div className="review-demo-frame">
              <img src="/assets/impacted-molar-review-interface-v2.png" alt="Impacted lower wisdom tooth model with the left inferior alveolar nerve in a clinical review interface." width="1536" height="1024" />
              <div className="review-demo-copy">
                <p className="review-demo-status">Illustrative prototype data</p>
                <div className="review-latest"><span>Most recent review</span><strong>Dr AB, Oral &amp; Maxillofacial Surgeon, Australia</strong><b><Icon name="health_and_safety" size={18} />Approved</b></div>
                <dl className="review-summary"><div><dt>Reviews</dt><dd>23 reviews</dd></div><div><dt>Approval</dt><dd>96% approval</dd></div><div><dt>Negative</dt><dd>1 negative review</dd></div></dl>
                <div className="reviewer-stack" aria-label="Other illustrative reviewers"><span>CD</span><span>EF</span><span>GH</span><strong>+19 other reviewers</strong></div>
              </div>
            </div>
            <figcaption className="ai-disclaimer">AI-generated illustration.</figcaption>
          </figure>
          <p className="trust-warning"><strong>Prototype governance:</strong> these safeguards describe the intended review workflow. No reviewer record or approval is presented as verified until the process is operating and complete.</p>
        </section>

        <section className="publications-section" id="publications">
          <div className="publications-intro">
            <h2>Evidence for seeing and holding anatomy.</h2>
            <p>Independent, peer-reviewed research has tested how physical and virtual 3D models can support patient knowledge, communication and understanding. Findings depend on the clinical setting and should not be treated as universal proof.</p>
            <p className="evidence-note">These articles are independent evidence. Publication records connected to the Vivatheca platform will be added only after authorship and journal details are verified. The accompanying visuals are interpretive, not figures from the papers.</p>
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
                <figure className="publication-visual">
                  <img src={publication.image} alt={publication.alt} width="1024" height="1024" />
                  <figcaption className="ai-disclaimer">AI-generated illustration.</figcaption>
                </figure>
              </article>
            ))}
          </div>
        </section>

        <section className="disciplines-section" id="disciplines">
          <div className="section-heading"><h2>Built to grow across disciplines.</h2><p>The collection is planned around nineteen clinical disciplines. These are the first paths visitors will be able to explore.</p></div>
          <div className="discipline-list">{disciplines.map((discipline) => <a key={discipline} href="#collection">{discipline}<Icon name="arrow_forward" /></a>)}</div>
        </section>

        <section className="contribute-section" id="contribute">
          <div className="contribute-copy"><h2>Five ways to move a model forward.</h2><p>Contributions can strengthen the collection, extend physical access, verify anatomy and make explanations useful across languages.</p><div className="contribution-paths">{contributionPaths.map((path) => <article key={path.title}><Icon name={path.icon} size={26} /><div><h3>{path.title}</h3><p>{path.text}</p><a className="text-link" href={path.href}>Learn how <Icon name="arrow_forward" /></a></div></article>)}</div></div>
          <figure><img src="/assets/open-review-network-v2.png" alt="Experienced clinicians, biomedical engineers, model creators and translators use digital anatomy tools around a heart encased in clear resin." width="1536" height="1024" /><figcaption className="ai-disclaimer">AI-generated illustration.</figcaption></figure>
          <aside className="language-aims" role="group" aria-label="Initial translation aims"><div><h3>Initial translation aims</h3><p>All current translation targets are shown alphabetically. Expert review is required before any translation is published.</p></div><ul>{translationAims.map((language) => <li key={language.name} aria-label={`${language.name} ${language.native}`}><img className="language-flag" src={`/flags/${language.flag}.svg`} alt="" aria-hidden="true" width="32" height="24" /><span className="language-name">{language.name}</span><bdi className="language-native" lang={language.lang} dir={language.direction}>{language.native}</bdi></li>)}</ul></aside>
        </section>

        <section className="sponsor-section" id="sponsor">
          <div className="sponsor-intro"><div><h2>Help a model travel further.</h2><p>Sponsorship can support model development and future physical distribution to clinics that cannot print locally.</p></div><a className="button button-light" href="mailto:hello@vivatheca.com?subject=Sponsor%20a%20Vivatheca%20model">Start a sponsorship conversation <Icon name="arrow_forward" /></a></div>
          <ImpactMap />
          <section className="sustainability-commitment" aria-labelledby="sustainability-title">
            <div className="sustainability-lead">
              <h2 id="sustainability-title">Sustainability for physical models.</h2>
              <figure><img src="/assets/sustainable-printing.png" alt="Gloved hands sorting retired anatomical teaching prints, supports and empty spools beside filament recovery equipment." width="1456" height="1092" /><figcaption className="ai-disclaimer">AI-generated illustration.</figcaption></figure>
            </div>
            <div className="sustainability-copy">
              <p>The Vivatheca platform is exploring lower-waste pathways for physical models as printing grows. Current investigation includes recycling retired or failed prints and finding useful destinations for supports, prime towers, purge material and empty filament spools.</p>
              <ul>
                <li><strong>Prints</strong><span>Retired, failed or superseded models</span></li>
                <li><strong>Process waste</strong><span>Supports, prime towers and purge material</span></li>
                <li><strong>Consumables</strong><span>Empty filament spools and packaging</span></li>
              </ul>
              <p className="exploratory-note"><strong>Exploratory commitment:</strong> no verified recycling programme or recovery partner is currently presented.</p>
            </div>
          </section>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-about">
            <a className="brand footer-brand" href="#top" aria-label="Back to the top of Vivatheca"><img src="/brand/vivatheca-logo-primary.svg" alt="" width="181" height="136" /></a>
            <p>The Vivatheca platform offers open 3D health information for clearer conversations. Free, browser-based and built for everyone.</p>
            <span className="footer-badge">Non-profit · Open source</span>
          </div>
          <div className="footer-links">
            {footerGroups.map((group) => (
              <nav key={group.label} aria-label={group.label} className="footer-nav">
                <h2>{group.label}</h2>
                <ul>{group.links.map((link) => <li key={link.label}><a href={link.href}>{link.label}</a></li>)}</ul>
                {group.label === 'Connect' ? <div className="social-group"><div className="social-badges" aria-label="Social profiles" aria-describedby="social-profile-status"><span className="social-badge" aria-disabled="true"><img src="/icons/instagram.svg" alt="" aria-hidden="true" width="20" height="20" />Instagram</span><span className="social-badge" aria-disabled="true"><img src="/icons/facebook.svg" alt="" aria-hidden="true" width="20" height="20" />Facebook</span></div><p className="social-status" id="social-profile-status">Verified profile links pending.</p></div> : null}
              </nav>
            ))}
          </div>
        </div>

        <details className="footer-disciplines">
          <summary><span>Featured clinical disciplines</span><Icon name="arrow_forward" size={18} /></summary>
          <ul aria-label="Clinical disciplines">{disciplines.map((discipline) => <li key={discipline}><a href="#collection">{discipline}</a></li>)}</ul>
        </details>

        <div className="footer-legal">
          <p>© 2026 Vivatheca</p>
          <p className="disclaimer">Educational information only—not a substitute for professional medical advice.</p>
          <nav aria-label="Legal and accessibility"><a href="mailto:hello@vivatheca.com?subject=Privacy%20question">Privacy questions</a><a href="mailto:hello@vivatheca.com?subject=Accessibility%20feedback">Accessibility feedback</a></nav>
        </div>
      </footer>
    </>
  );
}
