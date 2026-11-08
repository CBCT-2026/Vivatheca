import type { Source } from '../learn/sources';

// Sources for the content standards and funding page (/standards).
// Numbers match the [n] markers in t.standards. Links checked 8 November 2026; the Wild 2005 DOI
// was checked on Crossref. Company and organisation pages (2 to 4) are examples of practice, not evidence.
// Citations stay in English, the language they were published in.
export const standardsSources: Source[] = [
  { id: 1, text: 'OCEBM Levels of Evidence Working Group. The Oxford 2011 Levels of Evidence. Oxford Centre for Evidence-Based Medicine; 2011.', href: 'https://www.cebm.ox.ac.uk/resources/levels-of-evidence/ocebm-levels-of-evidence' },
  { id: 2, text: 'BioDigital. Content standards and development process. (Company page: an example of industry practice, not evidence.)', href: 'https://www.biodigital.com/p/content-standards-and-development-process' },
  { id: 3, text: 'Radiopaedia. Editorial team; and Contributing to Radiopaedia.org (every edit is reviewed by the editorial board). (An example of practice, not evidence.)', href: 'https://radiopaedia.org/articles/editorial-team' },
  { id: 4, text: 'Khan Academy Help Center. Is Khan Academy available in other languages? (Volunteer translators and Language Advocates.) (An example of practice, not evidence.)', href: 'https://support.khanacademy.org/hc/en-us/articles/202483750-Is-Khan-Academy-available-in-other-languages' },
  { id: 5, text: 'Wild D, Grove A, Martin M, et al. Principles of good practice for the translation and cultural adaptation process for patient-reported outcomes (PRO) measures: report of the ISPOR Task Force for Translation and Cultural Adaptation. Value Health. 2005;8(2):94-104.', href: 'https://doi.org/10.1111/j.1524-4733.2005.04054.x' },
  { id: 6, text: 'Volunteering Australia. National Standards for Volunteer Involvement. Canberra: Volunteering Australia; 2015.', href: 'https://www.volunteering.com.au/resources-tools/the-national-standards/' },
  { id: 7, text: 'Australian Charities and Not-for-profits Commission (ACNC). Governance Standard 5: duties of Responsible People (including disclosing and managing conflicts of interest).', href: 'https://acnc.gov.au/for-charities/manage-your-charity/governance-hub/5-duties-responsible-people/duties-responsible-people' },
  { id: 8, text: 'International Committee of Medical Journal Editors (ICMJE). Recommendations: disclosure of financial and non-financial relationships and activities, and conflicts of interest.', href: 'https://www.icmje.org/recommendations/browse/roles-and-responsibilities/author-responsibilities--conflicts-of-interest.html' },
  { id: 9, text: 'National Health and Medical Research Council (NHMRC). Guidelines for Guidelines: identifying and managing conflicts of interest.', href: 'https://nhmrc.gov.au/guidelinesforguidelines/plan/identifying-and-managing-conflicts-interest' },
];
