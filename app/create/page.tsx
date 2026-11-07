import type { Metadata } from 'next';
import { PageHeader, SiteFooter } from '../site-chrome';
import { getI18n } from '../i18n/server';
import { plain, Ruby } from '../i18n/ruby';
import { Builder } from './builder';

// Visible sources for the builder's rules and checks (see briefs.ts and checker.ts).
const guidanceSources = [
  { text: 'NHS England. NHS digital service manual: content style guide and health literacy.', href: 'https://service-manual.nhs.uk/content/health-literacy' },
  { text: 'International Organization for Standardization. ISO 24495-1:2023 Plain language — Part 1: Governing principles and guidelines.', href: 'https://www.iso.org/standard/78907.html' },
  { text: 'Centers for Disease Control and Prevention. CDC Clear Communication Index: user guide.', href: 'https://www.cdc.gov/ccindex/tool' },
  { text: 'Shoemaker SJ, Wolf MS, Brach C. Development of the Patient Education Materials Assessment Tool (PEMAT). Patient Educ Couns. 2014;96(3):395-403.', href: 'https://doi.org/10.1016/j.pec.2014.05.027' },
  { text: 'Trevena LJ, Zikmund-Fisher BJ, Edwards A, et al. Presenting quantitative information about decision outcomes: a risk communication primer for patient decision aid developers (IPDAS). BMC Med Inform Decis Mak. 2013;13(Suppl 2):S7.', href: 'https://doi.org/10.1186/1472-6947-13-S2-S7' },
  { text: 'Royal College of Surgeons of England. Consent: Supported Decision-Making. A good practice guide.', href: 'https://www.rcseng.ac.uk/standards-and-research/standards-and-guidance/good-practice-guides/consent' },
  { text: 'Dental Board of Australia. Code of conduct (shared Code of conduct, 2022), section on informed consent.', href: 'https://www.dentalboard.gov.au/codes-guidelines/policies-codes-guidelines/code-of-conduct.aspx' },
];

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.meta.createTitle,
    description: t.meta.createDescription,
    alternates: { canonical: '/create' },
    openGraph: { url: '/create', images: ['/assets/og-image.jpg'] },
    robots: { index: false },
  };
}

export default async function CreatePage() {
  const { t } = await getI18n();
  return (
    <>
      <a className="skip-link" href="#main-content"><Ruby text={t.common.skip} /></a>
      <PageHeader current={'/create'} />
      <main id="main-content" className="builder-page">
        <div className="builder-intro">
          <p className="eyebrow"><Ruby text={t.create.eyebrow} /></p>
          <h1><Ruby text={t.create.heading} /></h1>
          <p><Ruby text={t.create.intro} /></p>
        </div>
        <Builder />
        <section className="builder-sources" aria-labelledby="builder-sources-title">
          <h2 id="builder-sources-title"><Ruby text={t.create.guidanceHeading} /></h2>
          <p><Ruby text={t.create.guidanceIntro} /></p>
          <ol lang="en">
            {guidanceSources.map((source) => <li key={source.href}>{source.text} <a className="url" href={source.href} target="_blank" rel="noreferrer">{source.href.replace('https://', '')}</a></li>)}
          </ol>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
