import type { Source } from '../models/catalogue';

// Sources for the take-home text of each visit pack model (visitPack.models in the dictionaries).
// Numbers in the text ([1], [2]...) point into these lists, in order. Every DOI checked on Crossref (8 Nov 2026).
export const visitPackSources: Record<string, Source[]> = {
  'impacted-wisdom-tooth': [
    { text: 'Juodzbalys G, Daugela P. Mandibular third molar impaction: review of literature and a proposal of a classification. J Oral Maxillofac Res. 2013;4(2):e1. (What an impacted wisdom tooth is.)', href: 'https://doi.org/10.5037/jomr.2013.4201' },
    { text: 'Juodzbalys G, Wang HL, Sabalys G. Anatomy of mandibular vital structures. Part I: mandibular canal and inferior alveolar neurovascular bundle in relation with dental implantology. J Oral Maxillofac Res. 2010;1(1):e2. (The inferior alveolar nerve runs in the jaw below the teeth; its mental branch gives feeling to the lower lip and chin.)', href: 'https://doi.org/10.5037/jomr.2010.1102' },
    { text: 'Rood JP, Shehab BA. The radiological prediction of inferior alveolar nerve injury during third molar surgery. Br J Oral Maxillofac Surg. 1990;28(1):20-25. (Signs on X-rays that the roots are close to the nerve.)', href: 'https://doi.org/10.1016/0266-4356(90)90005-6' },
    { text: 'National Institute for Clinical Excellence (NICE). Guidance on the extraction of wisdom teeth. Technology appraisal guidance TA1. London: NICE; 2000. (Impacted wisdom teeth without disease should not be taken out routinely.)', href: 'https://www.nice.org.uk/guidance/ta1' },
    { text: 'Shepherd HL, Barratt A, Trevena LJ, McGeechan K, Carey K, Epstein RM, et al. Three questions that patients can ask to improve the quality of information physicians give about treatment options: a cross-over trial. Patient Educ Couns. 2011;84(3):379-385. (The three questions, word for word in English; translated by Vivatheca.)', href: 'https://doi.org/10.1016/j.pec.2011.07.022' },
  ],
};
