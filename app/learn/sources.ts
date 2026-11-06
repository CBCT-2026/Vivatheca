// Sources for the student guide to dental development (/learn/development).
// Numbers match the [n] markers in the dictionary text (t.learnDev).
// Checked on PubMed, 5 November 2026, except the books and the 1941 and 1960 articles,
// which PubMed does not index (cited from the original publication details).
// Citations stay in English, the language they were published in.

export type Source = { id: number; text: string; href?: string };

export const developmentSources: Source[] = [
  { id: 1, text: 'AlQahtani SJ, Hector MP, Liversidge HM. Brief communication: the London atlas of human tooth development and eruption. Am J Phys Anthropol. 2010;142(3):481-490.', href: 'https://doi.org/10.1002/ajpa.21258' },
  { id: 2, text: 'Schour I, Massler M. The development of the human dentition. J Am Dent Assoc. 1941;28:1153-1160.' },
  { id: 3, text: 'Moorrees CFA, Fanning EA, Hunt EE. Age variation of formation stages for ten permanent teeth. J Dent Res. 1963;42(6):1490-1502.', href: 'https://doi.org/10.1177/00220345630420062701' },
  { id: 4, text: 'Nolla CM. The development of the permanent teeth. J Dent Child. 1960;27:254-266.' },
  { id: 5, text: 'Demirjian A, Goldstein H, Tanner JM. A new system of dental age assessment. Hum Biol. 1973;45(2):211-227.', href: 'https://pubmed.ncbi.nlm.nih.gov/4714564/' },
  { id: 6, text: 'Hostiuc S, Edison SE, Diaconescu I, Negoi I, Isaila OM. Accuracy of the Demirjian’s method for assessing the age in children, from 1973 to 2020. A meta-analysis. Leg Med (Tokyo). 2021;52:101901.', href: 'https://doi.org/10.1016/j.legalmed.2021.101901' },
  { id: 7, text: 'Esan TA, Yengopal V, Schepartz LA. The Demirjian versus the Willems method for dental age estimation in different populations: a meta-analysis of published studies. PLoS One. 2017;12(11):e0186682.', href: 'https://doi.org/10.1371/journal.pone.0186682' },
  { id: 8, text: 'American Academy of Pediatric Dentistry. Dental growth and development (chronology of the human dentition, after Logan and Kronfeld 1933).', href: 'https://www.aapd.org/assets/1/7/RS_DentGrowthandDev.pdf' },
  { id: 9, text: 'American Dental Association. Eruption charts: primary teeth and permanent teeth. MouthHealthy.', href: 'https://www.mouthhealthy.org/-/media/project/ada-organization/ada/mouthhealthy/files/activity-sheets/adapermanentteethdev_eng.pdf' },
  { id: 10, text: 'Harokopakis-Hajishengallis E. Physiologic root resorption in primary teeth: molecular and histological events. J Oral Sci. 2007;49(1):1-12.', href: 'https://doi.org/10.2334/josnusd.49.1' },
  { id: 11, text: 'Suri L, Gagari E, Vastardis H. Delayed tooth eruption: pathogenesis, diagnosis, and treatment. A literature review. Am J Orthod Dentofacial Orthop. 2004;126(4):432-445.', href: 'https://doi.org/10.1016/j.ajodo.2003.10.031' },
  { id: 12, text: 'Kelly MP, Vorperian HK, Wang Y, et al. Characterizing mandibular growth using three-dimensional imaging techniques and anatomic landmarks. Arch Oral Biol. 2017;77:27-38.', href: 'https://doi.org/10.1016/j.archoralbio.2017.01.018' },
  { id: 13, text: 'Nguyen A, Caplin J, Avenetti D, et al. A longitudinal assessment of sex differences in the growth of the mandibular retromolar space. Arch Oral Biol. 2022;143:105547.', href: 'https://doi.org/10.1016/j.archoralbio.2022.105547' },
  { id: 14, text: 'Riolo ML, Moyers RE, McNamara JA, Hunter WS. An Atlas of Craniofacial Growth. Craniofacial Growth Series, Monograph 2. Ann Arbor: Center for Human Growth and Development, University of Michigan; 1974.', href: 'https://hdl.handle.net/2027.42/146700' },
  { id: 15, text: 'West KS, McNamara JA. Changes in the craniofacial complex from adolescence to midadulthood: a cephalometric study. Am J Orthod Dentofacial Orthop. 1999;115(5):521-532.', href: 'https://doi.org/10.1016/s0889-5406(99)70274-x' },
  { id: 16, text: 'Nelson SJ. Wheeler’s Dental Anatomy, Physiology and Occlusion. 11th ed. St Louis: Elsevier; 2020. (Average crown and root dimensions of primary and permanent teeth.)' },
];

// Sources for the student guide to cracked teeth (/learn/cracked-tooth).
// Numbers match the [n] markers in t.learnCracked and the sources on /cracked-tooth/.
// Checked on PubMed, 5 November 2026, except the AAE pages and the textbook.

export const crackedSources: Source[] = [
  { id: 1, text: 'American Association of Endodontists. Cracked teeth (patient information). (Accessed 5 November 2026.)', href: 'https://www.aae.org/patients/dental-symptoms/cracked-teeth/' },
  { id: 2, text: 'American Association of Endodontists. Glossary of Endodontic Terms. 10th ed. 2020.', href: 'https://www.aae.org/specialty/clinical-resources/glossary-endodontic-terms/' },
  { id: 3, text: 'Hilton TJ, Funkhouser E, Ferracane JL, et al. Recommended treatment of cracked teeth: results from the National Dental Practice-Based Research Network. J Prosthet Dent. 2020;123(1):71-78.', href: 'https://doi.org/10.1016/j.prosdent.2018.12.005' },
  { id: 4, text: 'Reeh ES, Messer HH, Douglas WH. Reduction in tooth stiffness as a result of endodontic and restorative procedures. J Endod. 1989;15(11):512-516. (Laboratory study on extracted upper premolars.)', href: 'https://doi.org/10.1016/S0099-2399(89)80191-8' },
  { id: 5, text: 'Banerji S, Mehta SB, Millar BJ. Cracked tooth syndrome. Part 2: restorative options for the management of cracked tooth syndrome. Br Dent J. 2010;208(11):503-514.', href: 'https://doi.org/10.1038/sj.bdj.2010.496' },
  { id: 6, text: 'Zhang S, Xu Y, Ma Y, et al. The treatment outcomes of cracked teeth: a systematic review and meta-analysis. J Dent. 2024;142:104843.', href: 'https://doi.org/10.1016/j.jdent.2024.104843' },
  { id: 7, text: 'Wu S, Lew HP, Chen NN. Incidence of pulpal complications after diagnosis of vital cracked teeth. J Endod. 2019;45(5):521-525.', href: 'https://doi.org/10.1016/j.joen.2019.02.003' },
  { id: 8, text: 'Krell KV, Rivera EM. A six year evaluation of cracked teeth diagnosed with reversible pulpitis: treatment and prognosis. J Endod. 2007;33(12):1405-1407.', href: 'https://doi.org/10.1016/j.joen.2007.08.015' },
  { id: 9, text: 'Olivieri JG, Elmsmari F, Miró Q, et al. Outcome and survival of endodontically treated cracked posterior permanent teeth: a systematic review and meta-analysis. J Endod. 2020;46(4):455-463.', href: 'https://doi.org/10.1016/j.joen.2020.01.006' },
  { id: 10, text: 'Nelson SJ. Wheeler’s Dental Anatomy, Physiology and Occlusion. 10th ed. St Louis: Elsevier; 2015. (Mandibular first molar crown length, 7.5 mm.)' },
  { id: 11, text: 'Ruan C, Wang L. Long-term survival of endodontically treated cracked teeth: a systematic review and meta-analysis. J Endod. 2026. (Lack of definitive cuspal coverage was a risk indicator; certainty of evidence very low.)', href: 'https://doi.org/10.1016/j.joen.2026.10.002' },
];

// Sources for the student guide to periodontitis staging (/learn/periodontitis).
// Numbers match the [n] markers in t.learnPerio. The same sources are cited on /periodontitis/.

export const perioSources: Source[] = [
  { id: 1, text: 'Tonetti MS, Greenwell H, Kornman KS. Staging and grading of periodontitis: framework and proposal of a new classification and case definition. J Periodontol. 2018;89 Suppl 1:S159-S172.', href: 'https://doi.org/10.1002/JPER.18-0006' },
  { id: 2, text: 'Papapanou PN, Sanz M, Buduneli N, et al. Periodontitis: consensus report of workgroup 2 of the 2017 World Workshop on the Classification of Periodontal and Peri-Implant Diseases and Conditions. J Periodontol. 2018;89 Suppl 1:S173-S182.', href: 'https://doi.org/10.1002/JPER.17-0721' },
  { id: 3, text: 'Caton JG, Armitage G, Berglundh T, et al. A new classification scheme for periodontal and peri-implant diseases and conditions: introduction and key changes from the 1999 classification. J Clin Periodontol. 2018;45 Suppl 20:S1-S8.', href: 'https://doi.org/10.1111/jcpe.12935' },
  { id: 4, text: 'Sanz M, Herrera D, Kebschull M, et al. Treatment of stage I–III periodontitis: the EFP S3 level clinical practice guideline. J Clin Periodontol. 2020;47 Suppl 22:4-60.', href: 'https://doi.org/10.1111/jcpe.13290' },
  { id: 5, text: 'Hausmann E, Allen K, Clerehugh V. What alveolar crest level on a bite-wing radiograph represents bone loss? J Periodontol. 1991;62(9):570-572.', href: 'https://doi.org/10.1902/jop.1991.62.9.570' },
  { id: 6, text: 'Nelson SJ. Wheeler’s Dental Anatomy, Physiology and Occlusion. 11th ed. St Louis: Elsevier; 2020. (Crown and root lengths and the cervical line of the mandibular teeth.)' },
  { id: 7, text: 'American Academy of Periodontology. Staging and grading periodontitis (chart of Tables 2 and 3 from source 1).', href: 'https://www.perio.org/wp-content/uploads/2019/08/Staging-and-Grading-Periodontitis.pdf' },
];

// Sources for the student guide to orthognathic surgery (/learn/orthognathic).
// Numbers match the [n] markers in t.learnOrtho and the sources on /orthognathic/.
// Proffit 2007 and Ireland 2014 checked in full text (PubMed Central), 6 November 2026.

export const orthoSources: Source[] = [
  { id: 1, text: 'Angle EH. Classification of malocclusion. Dental Cosmos. 1899;41:248-264, 350-357.' },
  { id: 2, text: 'Steiner CC. Cephalometrics for you and me. Am J Orthod. 1953;39(10):729-755.', href: 'https://doi.org/10.1016/0002-9416(53)90082-7' },
  { id: 3, text: 'Trauner R, Obwegeser H. The surgical correction of mandibular prognathism and retrognathia with consideration of genioplasty. I. Oral Surg Oral Med Oral Pathol. 1957;10(7):677-689.', href: 'https://doi.org/10.1016/s0030-4220(57)80063-2' },
  { id: 4, text: 'Dal Pont G. Retromolar osteotomy for the correction of prognathism. J Oral Surg Anesth Hosp Dent Serv. 1961;19:42-47.', href: 'https://pubmed.ncbi.nlm.nih.gov/13719390/' },
  { id: 5, text: 'Hunsuck EE. A modified intraoral sagittal splitting technic for correction of mandibular prognathism. J Oral Surg. 1968;26(4):250-253.', href: 'https://pubmed.ncbi.nlm.nih.gov/5237786/' },
  { id: 6, text: 'Bell WH. Le Fort I osteotomy for correction of maxillary deformities. J Oral Surg. 1975;33(6):412-426.', href: 'https://pubmed.ncbi.nlm.nih.gov/1055202/' },
  { id: 7, text: 'Proffit WR, Turvey TA, Phillips C. The hierarchy of stability and predictability in orthognathic surgery with rigid fixation: an update and extension. Head Face Med. 2007;3:21.', href: 'https://doi.org/10.1186/1746-160X-3-21' },
  { id: 8, text: 'NHS England (prepared by Public Health England). Interim clinical commissioning policy: orthognathic surgery (Armed Forces), N-SC/026. November 2013.', href: 'https://www.england.nhs.uk/commissioning/wp-content/uploads/sites/12/2014/03/nsc026-orthognathic-surg.pdf' },
  { id: 9, text: 'Australian Society of Orthodontists (Orthodontics Australia). Jaw surgery and braces. (Accessed 5 November 2026.)', href: 'https://orthodonticsaustralia.org.au/jaw-surgery-braces' },
  { id: 10, text: 'Ireland AJ, Cunningham SJ, Petrie A, et al. An index of orthognathic functional treatment need (IOFTN). J Orthod. 2014;41(2):77-83.', href: 'https://doi.org/10.1179/1465313314Y.0000000100' },
  { id: 11, text: 'Cambridge University Hospitals NHS Foundation Trust. Jaw or chin corrective surgery (orthognathic surgery): patient information and consent. (Accessed 5 November 2026.)', href: 'https://www.cuh.nhs.uk/patient-information/patient-information-and-consent-to-jaw-or-chin-corrective-surgery-orthognathic-surgery/' },
];
