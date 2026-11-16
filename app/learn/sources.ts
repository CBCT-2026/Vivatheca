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
  { id: 10, text: 'Nelson SJ. Wheeler’s Dental Anatomy, Physiology and Occlusion. 11th ed. St Louis: Elsevier; 2020. (Mandibular first molar crown length, 7.5 mm.)' },
  { id: 11, text: 'Ruan C, Wang L. Long-term survival of endodontically treated cracked teeth: a systematic review and meta-analysis. J Endod. 2026. (Lack of definitive cuspal coverage was a risk indicator; certainty of evidence very low.)', href: 'https://doi.org/10.1016/j.joen.2026.10.002' },
];

// Sources for the student guide to periodontitis staging (/learn/periodontitis).
// Numbers match the [n] markers in t.learnPerio. The same sources are cited on /periodontitis/.

export const perioSources: Source[] = [
  { id: 1, text: 'Tonetti MS, Greenwell H, Kornman KS. Staging and grading of periodontitis: framework and proposal of a new classification and case definition. J Periodontol. 2018;89 Suppl 1:S159-S172. Corrigendum: J Periodontol. 2018;89(12):1475, doi:10.1002/jper.10239.', href: 'https://doi.org/10.1002/JPER.18-0006' },
  { id: 2, text: 'Papapanou PN, Sanz M, Buduneli N, et al. Periodontitis: consensus report of workgroup 2 of the 2017 World Workshop on the Classification of Periodontal and Peri-Implant Diseases and Conditions. J Periodontol. 2018;89 Suppl 1:S173-S182.', href: 'https://doi.org/10.1002/JPER.17-0721' },
  { id: 3, text: 'Caton JG, Armitage G, Berglundh T, et al. A new classification scheme for periodontal and peri-implant diseases and conditions: introduction and key changes from the 1999 classification. J Clin Periodontol. 2018;45 Suppl 20:S1-S8.', href: 'https://doi.org/10.1111/jcpe.12935' },
  { id: 4, text: 'Sanz M, Herrera D, Kebschull M, et al. Treatment of stage I–III periodontitis: the EFP S3 level clinical practice guideline. J Clin Periodontol. 2020;47 Suppl 22:4-60. Corrigendum (author name; Tables 7 and 8 restated to match the 2018 staging and grading tables): J Clin Periodontol. 2021;48(1):163, doi:10.1111/jcpe.13403.', href: 'https://doi.org/10.1111/jcpe.13290' },
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

// Sources for the student guide to oroantral communication and fistula (/learn/oroantral).
// Numbers match the [n] markers in t.learnOac and the sources on /oroantral/.

export const oroantralSources: Source[] = [
  { id: 1, text: 'Parvini P, Obreja K, Begic A, Schwarz F, Becker J, Sader R, Salti L. Decision-making in closure of oroantral communication and fistula. Int J Implant Dent. 2019;5(1):13.', href: 'https://doi.org/10.1186/s40729-019-0165-7' },
  { id: 2, text: 'Khandelwal P, Hajira N. Management of oro-antral communication and fistula: various surgical options. World J Plast Surg. 2017;6(1):3-8.', href: 'https://pubmed.ncbi.nlm.nih.gov/28289607/' },
  { id: 3, text: 'Dipalma G, Inchingolo AM, Trilli I, et al. Management of oro-antral communication: a systemic review of diagnostic and therapeutic strategies. Diagnostics (Basel). 2025;15(2):194.', href: 'https://doi.org/10.3390/diagnostics15020194' },
  { id: 4, text: 'Oliva S, Lorusso F, Scarano A, D’Amario M, Murmura G. The treatment and management of oroantral communications and fistulas: a systematic review and network metanalysis. Dent J (Basel). 2024;12(5):147.', href: 'https://doi.org/10.3390/dj12050147' },
  { id: 5, text: 'Egyedi P. Utilization of the buccal fat pad for closure of oro-antral and/or oro-nasal communications. J Maxillofac Surg. 1977;5(4):241-244.', href: 'https://doi.org/10.1016/s0301-0503(77)80117-3' },
  { id: 6, text: 'Eberhardt JA, Torabinejad M, Christiansen EL. A computed tomographic study of the distances between the maxillary sinus floor and the apices of the maxillary posterior teeth. Oral Surg Oral Med Oral Pathol. 1992;73(3):345-346.', href: 'https://doi.org/10.1016/0030-4220(92)90133-b' },
  { id: 7, text: 'Kwak HH, Park HD, Yoon HR, Kang MK, Koh KS, Kim HJ. Topographic anatomy of the inferior wall of the maxillary sinus in Koreans. Int J Oral Maxillofac Surg. 2004;33(4):382-388.', href: 'https://doi.org/10.1016/j.ijom.2003.10.012' },
  { id: 8, text: 'Estrela C, Nunes CA, Guedes OA, et al. Study of anatomical relationship between posterior teeth and maxillary sinus floor in a subpopulation of the Brazilian central region using cone-beam computed tomography, part 2. Braz Dent J. 2016;27(1):9-15.', href: 'https://doi.org/10.1590/0103-6440201600679' },
  { id: 9, text: 'Hernando J, Gallego L, Junquera L, Villarreal P. Oroantral communications: a retrospective analysis. Med Oral Patol Oral Cir Bucal. 2010;15(3):e499-503.', href: 'https://doi.org/10.4317/medoral.15.e499' },
  { id: 10, text: 'Pourmand PP, Sigron GR, Mache B, Stadlinger B, Locher MC. The most common complications after wisdom-tooth removal: part 2: a retrospective study of 1,562 cases in the maxilla. Swiss Dent J. 2014;124(10):1047-1051.', href: 'https://doi.org/10.61872/sdj-2014-10-02' },
  { id: 11, text: 'Amani R, Noroozi M, Ashrafi MMS. Assessment of the relationships between posterior root apices and the maxillary sinus floor: a comparison of panoramic radiography and cone beam computed tomography. Gen Dent. 2023;71(5):58-63.', href: 'https://pubmed.ncbi.nlm.nih.gov/37595085/' },
];

// Sources for the student guide to preformed metal crowns (/learn/steel-crown).
// Numbers match the [n] markers in t.learnSsc and the sources on /stainless-steel-crown/.

export const steelCrownSources: Source[] = [
  { id: 1, text: 'American Academy of Pediatric Dentistry. Pediatric restorative dentistry (Best Practices: Restorative Dentistry). The Reference Manual of Pediatric Dentistry. Chicago, IL: American Academy of Pediatric Dentistry; 2025:473-86.', href: 'https://www.aapd.org/media/policies_guidelines/bp_restorativedent.pdf' },
  { id: 2, text: 'Innes NPT, Ricketts D, Chong LY, Keightley AJ, Lamont T, Santamaria RM. Preformed crowns for decayed primary molar teeth. Cochrane Database Syst Rev. 2015;(12):CD005512.', href: 'https://doi.org/10.1002/14651858.CD005512.pub3' },
  { id: 3, text: 'Innes NPT, Evans DJP, Stirrups DR. Sealing caries in primary molars: randomized control trial, 5-year results. J Dent Res. 2011;90(12):1405-1410.', href: 'https://doi.org/10.1177/0022034511422064' },
  { id: 4, text: 'Seale NS. The use of stainless steel crowns. Pediatr Dent. 2002;24(5):501-505.', href: 'https://pubmed.ncbi.nlm.nih.gov/12412965/' },
  { id: 5, text: 'Randall RC, Vrijhoef MM, Wilson NH. Efficacy of preformed metal crowns vs. amalgam restorations in primary molars: a systematic review. J Am Dent Assoc. 2000;131(3):337-343.', href: 'https://doi.org/10.14219/jada.archive.2000.0177' },
  { id: 6, text: 'Wu E, Yang YJ, Munz SM, Hsiao CC, Boynton JR. Restorations versus stainless steel crowns in primary molars: a retrospective split-mouth study. Pediatr Dent. 2021;43(4):290-295.', href: 'https://pubmed.ncbi.nlm.nih.gov/34467846/' },
  { id: 7, text: 'Nelson SJ. Wheeler’s Dental Anatomy, Physiology and Occlusion. 11th ed. St Louis: Elsevier; 2020. (Primary tooth measurements, after G. V. Black.)' },
];

// Sources for the student guide to the head and neck cases (/learn/head-neck).
// Numbers match the [n] markers in t.learnHn; all are cited on the /head-neck/ case pages.

export const headNeckSources: Source[] = [
  { id: 1, text: 'Vergier V, Czarny K, Brau J-J, Le Pelletier F, Taihi I. Proliferative verrucous leukoplakia presenting as a ring around the collar and cancer: a case report. Cureus. 2024;16(3):e56077.', href: 'https://doi.org/10.7759/cureus.56077' },
  { id: 2, text: 'Hidalgo DA. Fibula free flap: a new method of mandible reconstruction. Plast Reconstr Surg. 1989;84(1):71-79.', href: 'https://pubmed.ncbi.nlm.nih.gov/2734406/' },
  { id: 3, text: 'Brown JS, Barry C, Ho M, Shaw R. A new classification for mandibular defects after oncological resection. Lancet Oncol. 2016;17(1):e23-e30.', href: 'https://doi.org/10.1016/S1470-2045(15)00310-1' },
  { id: 4, text: 'Soutar DS, Scheker LR, Tanner NS, McGregor IA. The radial forearm flap: a versatile method for intra-oral reconstruction. Br J Plast Surg. 1983;36(1):1-8.', href: 'https://doi.org/10.1016/0007-1226(83)90002-4' },
  { id: 5, text: 'Sikri N, Eid S, Mohamed S, Ghosh A. Management of mandibular ameloblastoma: a case report from a Bahrain Government Hospital. Cureus. 2026;18(2):e104441.', href: 'https://doi.org/10.7759/cureus.104441' },
  { id: 6, text: 'Almeida RAC, Andrade ESS, Barbalho JC, Vajgel A, Vasconcelos BCE. Recurrence rate following treatment for primary multicystic ameloblastoma: systematic review and meta-analysis. Int J Oral Maxillofac Surg. 2016;45(3):359-367.', href: 'https://doi.org/10.1016/j.ijom.2015.12.016' },
  { id: 7, text: 'Abdelfadil E, Alsharif M, Alsharif AT, Mourad S. Management of a mandibular odontogenic keratocyst with enucleation, piezotome-assisted peripheral ostectomy, and platelet-rich fibrin: a case report. Dent J (Basel). 2025;13(11):536.', href: 'https://doi.org/10.3390/dj13110536' },
  { id: 8, text: 'Al-Moraissi EA, Dahan AA, Alwadeai MS, et al. What surgical treatment has the lowest recurrence rate following the management of keratocystic odontogenic tumor?: A large systematic review and meta-analysis. J Craniomaxillofac Surg. 2017;45(1):131-144.', href: 'https://doi.org/10.1016/j.jcms.2016.10.013' },
  { id: 9, text: 'Chrcanovic BR, Gomez RS. Recurrence probability for keratocystic odontogenic tumors: an analysis of 6427 cases. J Craniomaxillofac Surg. 2017;45(2):244-251.', href: 'https://doi.org/10.1016/j.jcms.2016.11.010' },
  { id: 10, text: 'Jacobs D, et al. 5-Fluorouracil versus modified Carnoy’s solution for odontogenic keratocysts. J Oral Maxillofac Surg. 2024;82:1433-1440.', href: 'https://doi.org/10.1016/j.joms.2024.06.181' },
  { id: 11, text: 'Ellam M, et al. Mucoepidermoid carcinoma of the hard palate: a case illustrating grading uncertainty and bone-sparing surgical management. Cureus. 2026;18(8):e115250.', href: 'https://doi.org/10.7759/cureus.115250' },
];

// Sources for the virtual CBCT slice viewer (/learn/slices). Numbers match [n] in t.learnSlices.
export const slicesSources: Source[] = [
  { id: 1, text: 'Pauwels R, Jacobs R, Singer SR, Mupparapu M. CBCT-based bone quality assessment: are Hounsfield units applicable? Dentomaxillofac Radiol. 2015;44(1):20140238.', href: 'https://doi.org/10.1259/dmfr.20140238' },
  { id: 2, text: 'Schneider U, Pedroni E, Lomax A. The calibration of CT Hounsfield units for radiotherapy treatment planning. Phys Med Biol. 1996;41(1):111-124.', href: 'https://doi.org/10.1088/0031-9155/41/1/009' },
  { id: 3, text: 'Scarfe WC, Farman AG. What is cone-beam CT and how does it work? Dent Clin North Am. 2008;52(4):707-730.', href: 'https://doi.org/10.1016/j.cden.2008.05.005' },
  { id: 4, text: 'Schulze R, Heil U, Gross D, et al. Artefacts in CBCT: a review. Dentomaxillofac Radiol. 2011;40(5):265-273.', href: 'https://doi.org/10.1259/dmfr/30642039' },
  { id: 5, text: 'NiiVue contributors. NiiVue: a WebGL2 medical image viewer. Version 0.69.0, BSD-2-Clause licence. GitHub repository.', href: 'https://github.com/niivue/niivue' },
  { id: 6, text: 'Vivatheca. tools/cbct/voxelize.py: how each virtual scan is made from the model mesh (voxel size, tissue values).', href: 'https://github.com/CBCT-2026/Vivatheca/blob/main/tools/cbct/voxelize.py' },
];

// Sources for the student guide to CBCT reports (/learn/cbct-report). Numbers match [n] in t.learnCbct.
// Checked on PubMed, 10 November 2026. The guide uses no text or data from any patient dataset.
export const cbctReportSources: Source[] = [
  { id: 1, text: 'Carter L, Farman AG, Geist J, et al. American Academy of Oral and Maxillofacial Radiology executive opinion statement on performing and interpreting diagnostic cone beam computed tomography. Oral Surg Oral Med Oral Pathol Oral Radiol Endod. 2008;106(4):561-562.', href: 'https://doi.org/10.1016/j.tripleo.2008.07.007' },
  { id: 2, text: 'American Dental Association Council on Scientific Affairs. The use of cone-beam computed tomography in dentistry: an advisory statement. J Am Dent Assoc. 2012;143(8):899-902.', href: 'https://doi.org/10.14219/jada.archive.2012.0295' },
  { id: 3, text: 'Tyndall DA, Price JB, Tetradis S, et al. Position statement of the American Academy of Oral and Maxillofacial Radiology on selection criteria for the use of radiology in dental implantology with emphasis on cone beam computed tomography. Oral Surg Oral Med Oral Pathol Oral Radiol. 2012;113(6):817-826.', href: 'https://doi.org/10.1016/j.oooo.2012.03.005' },
  { id: 4, text: 'Matzen LH, Wenzel A. Efficacy of CBCT for assessment of impacted mandibular third molars: a review, based on a hierarchical model of evidence. Dentomaxillofac Radiol. 2015;44(1):20140189.', href: 'https://doi.org/10.1259/dmfr.20140189' },
  { id: 5, text: 'Patel S, Brown J, Semper M, Abella F, Mannocci F. European Society of Endodontology position statement: use of cone beam computed tomography in endodontics. Int Endod J. 2019;52(12):1675-1678.', href: 'https://doi.org/10.1111/iej.13187' },
  { id: 6, text: 'Price JB, Thaw KL, Tyndall DA, Ludlow JB, Padilla RJ. Incidental findings from cone beam computed tomography of the maxillofacial region: a descriptive retrospective study. Clin Oral Implants Res. 2012;23(11):1261-1268.', href: 'https://doi.org/10.1111/j.1600-0501.2011.02299.x' },
  { id: 7, text: 'Edwards R, Altalibi M, Flores-Mir C. The frequency and nature of incidental findings in cone-beam computed tomographic scans of the head and neck region: a systematic review. J Am Dent Assoc. 2013;144(2):161-170.', href: 'https://doi.org/10.14219/jada.archive.2013.0095' },
  { id: 8, text: 'Schulze R, Heil U, Gross D, et al. Artefacts in CBCT: a review. Dentomaxillofac Radiol. 2011;40(5):265-273.', href: 'https://doi.org/10.1259/dmfr/30642039' },
  { id: 9, text: 'Scarfe WC, Farman AG. What is cone-beam CT and how does it work? Dent Clin North Am. 2008;52(4):707-730.', href: 'https://doi.org/10.1016/j.cden.2008.05.005' },
  { id: 10, text: 'Pauwels R, Jacobs R, Singer SR, Mupparapu M. CBCT-based bone quality assessment: are Hounsfield units applicable? Dentomaxillofac Radiol. 2015;44(1):20140238.', href: 'https://doi.org/10.1259/dmfr.20140238' },
];
