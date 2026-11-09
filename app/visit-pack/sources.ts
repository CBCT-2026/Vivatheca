import type { Source } from '../models/catalogue';

// Sources for the take-home text of each visit pack model (visitPack.models in the dictionaries).
// Numbers in the text ([1], [2]...) point into these lists, in order. The three questions (visitPack.questionsSource)
// cite the same study on every sheet, so it is added last to every list and the page fills in its number.
// Every DOI checked on Crossref and every URL opened (8 and 9 Nov 2026). Most are the sources the model's own page cites.
const threeQuestions: Source = { text: 'Shepherd HL, Barratt A, Trevena LJ, McGeechan K, Carey K, Epstein RM, et al. Three questions that patients can ask to improve the quality of information physicians give about treatment options: a cross-over trial. Patient Educ Couns. 2011;84(3):379-385. (The three questions, word for word in English; translated by Vivatheca.)', href: 'https://doi.org/10.1016/j.pec.2011.07.022' };

const lists: Record<string, Source[]> = {
  'impacted-wisdom-tooth': [
    { text: 'Juodzbalys G, Daugela P. Mandibular third molar impaction: review of literature and a proposal of a classification. J Oral Maxillofac Res. 2013;4(2):e1. (What an impacted wisdom tooth is.)', href: 'https://doi.org/10.5037/jomr.2013.4201' },
    { text: 'Juodzbalys G, Wang HL, Sabalys G. Anatomy of mandibular vital structures. Part I: mandibular canal and inferior alveolar neurovascular bundle in relation with dental implantology. J Oral Maxillofac Res. 2010;1(1):e2. (The inferior alveolar nerve runs in the jaw below the teeth; its mental branch gives feeling to the lower lip and chin.)', href: 'https://doi.org/10.5037/jomr.2010.1102' },
    { text: 'Rood JP, Shehab BA. The radiological prediction of inferior alveolar nerve injury during third molar surgery. Br J Oral Maxillofac Surg. 1990;28(1):20-25. (Signs on X-rays that the roots are close to the nerve.)', href: 'https://doi.org/10.1016/0266-4356(90)90005-6' },
    { text: 'National Institute for Clinical Excellence (NICE). Guidance on the extraction of wisdom teeth. Technology appraisal guidance TA1. London: NICE; 2000. (Impacted wisdom teeth without disease should not be taken out routinely.)', href: 'https://www.nice.org.uk/guidance/ta1' },
  ],
  'dental-development': [
    { text: 'American Dental Association. Eruption charts: primary teeth. MouthHealthy. (The 20 baby teeth and when they come through and fall out.)', href: 'https://www.mouthhealthy.org/-/media/project/ada-organization/ada/mouthhealthy/files/activity-sheets/adaprimarytoothdev_eng.pdf' },
    { text: 'American Dental Association. Eruption charts: permanent teeth. MouthHealthy. (When each adult tooth usually comes through, as an age range.)', href: 'https://www.mouthhealthy.org/-/media/project/ada-organization/ada/mouthhealthy/files/activity-sheets/adapermanentteethdev_eng.pdf' },
    { text: 'American Academy of Pediatric Dentistry. Dental growth and development (chronology of the human dentition, after Logan and Kronfeld 1933). (Ages for each tooth, as ranges.)', href: 'https://www.aapd.org/assets/1/7/RS_DentGrowthandDev.pdf' },
    { text: 'AlQahtani SJ, Hector MP, Liversidge HM. Brief communication: the London atlas of human tooth development and eruption. Am J Phys Anthropol. 2010;142(3):481-490. (How the teeth form and come through at each age.)', href: 'https://doi.org/10.1002/ajpa.21258' },
    { text: 'Harokopakis-Hajishengallis E. Physiologic root resorption in primary teeth: molecular and histological events. J Oral Sci. 2007;49(1):1-12. (The root of the baby tooth is taken away as the adult tooth moves up.)', href: 'https://doi.org/10.2334/josnusd.49.1' },
  ],
  periodontitis: [
    { text: 'Healthdirect Australia (Australian Government). Gum disease. Last reviewed February 2025. (Periodontitis: the bone that supports the teeth can be lost and teeth become loose; it can be controlled with professional care.)', href: 'https://www.healthdirect.gov.au/gum-disease' },
    { text: 'Papapanou PN, Sanz M, Buduneli N, et al. Periodontitis: consensus report of workgroup 2 of the 2017 World Workshop on the Classification of Periodontal and Peri-Implant Diseases and Conditions. J Periodontol. 2018;89 Suppl 1:S173-S182. (What periodontitis is.)', href: 'https://doi.org/10.1002/JPER.17-0721' },
    { text: 'Tonetti MS, Greenwell H, Kornman KS. Staging and grading of periodontitis: framework and proposal of a new classification and case definition. J Periodontol. 2018;89 Suppl 1:S159-S172. (Stages I to IV.)', href: 'https://doi.org/10.1002/JPER.18-0006' },
    { text: 'Sanz M, Herrera D, Kebschull M, et al. Treatment of stage I–III periodontitis: the EFP S3 level clinical practice guideline. J Clin Periodontol. 2020;47 Suppl 22:4-60. (The steps of treatment; lost bone is rebuilt only in some deep defects.)', href: 'https://doi.org/10.1111/jcpe.13290' },
  ],
  oroantral: [
    { text: 'Eberhardt JA, Torabinejad M, Christiansen EL. A computed tomographic study of the distances between the maxillary sinus floor and the apices of the maxillary posterior teeth. Oral Surg Oral Med Oral Pathol. 1992;73(3):345-346. (How close the roots of the upper back teeth are to the sinus.)', href: 'https://doi.org/10.1016/0030-4220(92)90133-b' },
    { text: 'Kwak HH, Park HD, Yoon HR, Kang MK, Koh KS, Kim HJ. Topographic anatomy of the inferior wall of the maxillary sinus in Koreans. Int J Oral Maxillofac Surg. 2004;33(4):382-388. (Some roots reach into the sinus.)', href: 'https://doi.org/10.1016/j.ijom.2003.10.012' },
    { text: 'Parvini P, Obreja K, Begic A, Schwarz F, Becker J, Sader R, Salti L. Decision-making in closure of oroantral communication and fistula. Int J Implant Dent. 2019;5(1):13. (What a communication and a fistula are; small openings can heal with a clot, larger or lasting ones are closed with surgery.)', href: 'https://doi.org/10.1186/s40729-019-0165-7' },
    { text: 'Khandelwal P, Hajira N. Management of oro-antral communication and fistula: various surgical options. World J Plast Surg. 2017;6(1):3-8. (The ways to close the opening.)', href: 'https://pubmed.ncbi.nlm.nih.gov/28289607/' },
  ],
  'cracked-tooth': [
    { text: 'Banerji S, Mehta SB, Millar BJ. Cracked tooth syndrome. Part 1: aetiology and diagnosis. Br Dent J. 2010;208(10):459-463. (A crack that starts on the chewing surface and runs towards the root, in a tooth that is still in one piece; pain on biting and with cold.)', href: 'https://doi.org/10.1038/sj.bdj.2010.449' },
    { text: 'American Association of Endodontists. Glossary of Endodontic Terms. 10th ed. 2020. (Cracked tooth.)', href: 'https://www.aae.org/specialty/clinical-resources/glossary-endodontic-terms/' },
    { text: 'Hilton TJ, Funkhouser E, Ferracane JL, et al. Recommended treatment of cracked teeth: results from the National Dental Practice-Based Research Network. J Prosthet Dent. 2020;123(1):71-78. (About 46 in 100 cracked back teeth caused pain, most often with cold, then on biting; dentists chose from several treatments, or watched.)', href: 'https://doi.org/10.1016/j.prosdent.2018.12.005' },
    { text: 'Zhang S, Xu Y, Ma Y, et al. The treatment outcomes of cracked teeth: a systematic review and meta-analysis. J Dent. 2024;142:104843. (The treatments compared and how the teeth did.)', href: 'https://doi.org/10.1016/j.jdent.2024.104843' },
  ],
  endodontic: [
    { text: 'American Association of Endodontists. Glossary of Endodontic Terms. 10th ed. 2020. (Pulp; pulp necrosis; chronic apical abscess: little or no pain, pus drains through a sinus tract.)', href: 'https://www.aae.org/specialty/clinical-resources/glossary-endodontic-terms/' },
    { text: 'Glickman GN. AAE Consensus Conference on Diagnostic Terminology: background and perspectives. J Endod. 2009;35(12):1619-1620. (The diagnostic terms used here.)', href: 'https://doi.org/10.1016/j.joen.2009.09.029' },
    { text: 'European Society of Endodontology. Quality guidelines for endodontic treatment: consensus report of the European Society of Endodontology. Int Endod J. 2006;39(12):921-930. (When root canal treatment is considered, and that extraction is the other choice.)', href: 'https://doi.org/10.1111/j.1365-2591.2006.01180.x' },
  ],
  vpi: [
    { text: 'Perry JL. Anatomy and physiology of the velopharyngeal mechanism. Semin Speech Lang. 2011;32(2):83-92. (How the soft palate lifts to close off the nose for speech.)', href: 'https://doi.org/10.1055/s-0031-1277712' },
    { text: 'Trost-Cardamone JE. Coming to terms with VPI: a response to Loney and Bloem. Cleft Palate J. 1989;26(1):68-70. (Velopharyngeal insufficiency: a structural cause.)', href: 'https://pubmed.ncbi.nlm.nih.gov/2645070/' },
    { text: 'American Speech-Language-Hearing Association. Practice Portal: Resonance Disorders. (Causes of velopharyngeal dysfunction, including a short palate after cleft repair; nasal speech and air escape.)', href: 'https://www.asha.org/practice-portal/clinical-topics/resonance-disorders/' },
    { text: 'American Cleft Palate-Craniofacial Association. Parameters for evaluation and treatment of patients with cleft lip/palate or other craniofacial differences. Cleft Palate Craniofac J. 2018;55(1):137-156. (Care by a cleft team; speech therapy and surgery, depending on the cause.)', href: 'https://doi.org/10.1177/1055665617739564' },
  ],
  prosthodontic: [
    { text: 'Atwood DA. Reduction of residual ridges: a major oral disease entity. J Prosthet Dent. 1971;26(3):266-279. (The ridge shrinks after teeth are lost and does not grow back; a flat ridge gives a denture little support.)', href: 'https://doi.org/10.1016/0022-3913(71)90069-2' },
    { text: 'Tallgren A. The continuing reduction of the residual alveolar ridges in complete denture wearers: a mixed-longitudinal study covering 25 years. J Prosthet Dent. 1972;27(2):120-132. (The shrinking goes on for years.)', href: 'https://doi.org/10.1016/0022-3913(72)90188-6' },
    { text: 'The Glossary of Prosthodontic Terms 2023: Tenth Edition. J Prosthet Dent. 2023;130(4 Suppl 1):e7-e126. (Complete denture; implant overdenture; dental implant.)', href: 'https://doi.org/10.1016/j.prosdent.2023.03.002' },
  ],
  tmd: [
    { text: 'National Institute of Dental and Craniofacial Research (US National Institutes of Health). TMD (Temporomandibular Disorders). (The jaw joints sit in front of the ears; TMDs cause pain and problems in the jaw joint and the muscles that move the jaw; many last only a short time and go away on their own.)', href: 'https://www.nidcr.nih.gov/health-info/tmd' },
    { text: 'Schiffman E, Ohrbach R, Truelove E, et al. Diagnostic Criteria for Temporomandibular Disorders (DC/TMD) for Clinical and Research Applications: recommendations of the International RDC/TMD Consortium Network and Orofacial Pain Special Interest Group. J Oral Facial Pain Headache. 2014;28(1):6-27. (Pain in the jaw, temple or ear; clicking; limited opening.)', href: 'https://doi.org/10.11607/jop.1151' },
    { text: 'Busse JW, Casassus R, Carrasco-Labra A, et al. Management of chronic pain associated with temporomandibular disorders: a clinical practice guideline. BMJ. 2023;383:e076227. (The many treatments compared.)', href: 'https://doi.org/10.1136/bmj-2023-076227' },
  ],
  'ectopic-canine': [
    { text: 'Cobourne MT, Seehra J, Papageorgiou SN. The palatal displaced maxillary canine: early diagnosis and interceptive correction - a guideline for the general dental practitioner. Br Dent J. 2025;239(7):463-470. (When the canine comes through; feeling for it from about age 9 to 10; X-rays; the ways to help it come through.)', href: 'https://doi.org/10.1038/s41415-025-8892-z' },
    { text: 'Ericson S, Kurol J. Longitudinal study and analysis of clinical supervision of maxillary canine eruption. Community Dent Oral Epidemiol. 1986;14(3):172-176. (Feeling for the canine in the gum.)', href: 'https://doi.org/10.1111/j.1600-0528.1986.tb01526.x' },
    { text: 'Naoumova J, Kurol J, Kjellberg H. Extraction of the deciduous canine as an interceptive treatment in children with palatal displaced canines - part I: shall we extract the deciduous canine or not? Eur J Orthod. 2015;37(2):209-218. (One of the ways to help the canine come through, tested in a trial.)', href: 'https://doi.org/10.1093/ejo/cju040' },
  ],
  'dentigerous-cyst': [
    { text: 'Soluk-Tekkesin M, Wright JM. The World Health Organization classification of odontogenic lesions: a summary of the changes of the 2022 (5th) edition. Turk Patoloji Derg. 2022;38(2):168-184. (What a dentigerous cyst is; most often around a lower wisdom tooth.)', href: 'https://doi.org/10.5146/tjpath.2022.01573' },
    { text: 'Daley TD, Wysocki GP. The small dentigerous cyst. A diagnostic dilemma. Oral Surg Oral Med Oral Pathol Oral Radiol Endod. 1995;79(1):77-81. (The normal sac around an unerupted tooth, and telling it from a cyst.)', href: 'https://doi.org/10.1016/s1079-2104(05)80078-2' },
    { text: 'Telcioğlu NT, Muğlalı M, Çankaya RTA. Differentiation between dental follicle and dentigerous cyst in impacted mandibular third molars: a prospective cohort study. J Oral Maxillofac Surg. 2026;84(9):1487-1494. (Slow growth, often no pain, often found on an X-ray.)', href: 'https://doi.org/10.1016/j.joms.2026.04.008' },
    { text: 'Cobo-Vázquez C, Fernández-Gutiérrez L, Pérez-Fernández B, et al. Effectiveness of conservative treatment of dentigerous cyst in the pediatric patient: a systematic review. J Stomatol Oral Maxillofac Surg. 2025;126(4):102115. (The ways to treat it.)', href: 'https://doi.org/10.1016/j.jormas.2024.102115' },
  ],
  'stainless-steel-crown': [
    { text: 'American Academy of Pediatric Dentistry. Pediatric restorative dentistry (Best Practices: Restorative Dentistry). The Reference Manual of Pediatric Dentistry. Chicago, IL: American Academy of Pediatric Dentistry; 2025:473-86. (When a preformed crown is used on a baby back tooth.)', href: 'https://www.aapd.org/media/policies_guidelines/bp_restorativedent.pdf' },
    { text: 'Seale NS. The use of stainless steel crowns. Pediatr Dent. 2002;24(5):501-505. (What a preformed crown is and when it is used.)', href: 'https://pubmed.ncbi.nlm.nih.gov/12412965/' },
    { text: 'Innes NPT, Ricketts D, Chong LY, Keightley AJ, Lamont T, Santamaria RM. Preformed crowns for decayed primary molar teeth. Cochrane Database Syst Rev. 2015;(12):CD005512. (Crowns were less likely than fillings to fail badly or cause pain later; low-quality evidence.)', href: 'https://doi.org/10.1002/14651858.CD005512.pub3' },
  ],
  'head-neck': [
    { text: 'WHO Classification of Tumours Editorial Board. Head and Neck Tumours. WHO Classification of Tumours, 5th ed., vol. 9. Lyon: International Agency for Research on Cancer; 2022. (The kinds of growths of the jaws, mouth and salivary glands, benign and malignant.)', href: 'https://tumourclassification.iarc.who.int/' },
    { text: 'Brown JS, Barry C, Ho M, Shaw R. A new classification for mandibular defects after oncological resection. Lancet Oncol. 2016;17(1):e23-e30. (The gaps left in the lower jaw after removing a growth, and how they are rebuilt.)', href: 'https://doi.org/10.1016/S1470-2045(15)00310-1' },
    { text: 'Brown JS, Shaw RJ. Reconstruction of the maxilla and midface: introducing a new classification. Lancet Oncol. 2010;11(10):1001-1008. (The gaps left in the upper jaw and palate, and how they are closed.)', href: 'https://doi.org/10.1016/S1470-2045(10)70113-3' },
    { text: 'Geiger JL, Ismaila N, Beadle B, et al. Management of salivary gland malignancy: ASCO guideline. J Clin Oncol. 2021;39(17):1909-1941. (Surgery removes the growth with a margin of healthy tissue.)', href: 'https://doi.org/10.1200/JCO.21.00449' },
  ],
  'head-neck-scc': [
    { text: 'Muller S, Tilakaratne WM. Update from the 5th edition of the World Health Organization classification of head and neck tumors: tumours of the oral cavity and mobile tongue. Head Neck Pathol. 2022;16(1):54-62. (Squamous cell carcinoma of the mouth.)', href: 'https://doi.org/10.1007/s12105-021-01402-9' },
    { text: 'Mücke T, Hölzle F, Wagenpfeil S, Wolff KD, Kesting M. The role of tumor invasion into the mandible of oral squamous cell carcinoma. J Cancer Res Clin Oncol. 2011;137(1):165-171. (Mouth cancer can grow into the jaw bone.)', href: 'https://doi.org/10.1007/s00432-010-0870-3' },
    { text: 'Brown JS, Barry C, Ho M, Shaw R. A new classification for mandibular defects after oncological resection. Lancet Oncol. 2016;17(1):e23-e30. (Removing part of the jaw with a margin, and rebuilding it.)', href: 'https://doi.org/10.1016/S1470-2045(15)00310-1' },
    { text: 'Hidalgo DA. Fibula free flap: a new method of mandible reconstruction. Plast Reconstr Surg. 1989;84(1):71-79. (Rebuilding the jaw with bone from the lower leg.)', href: 'https://pubmed.ncbi.nlm.nih.gov/2734406/' },
    { text: 'Vergier V, Czarny K, Brau J-J, Le Pelletier F, Taihi I. Proliferative verrucous leukoplakia presenting as a ring around the collar and cancer: a case report. Cureus. 2024;16(3):e56077. (The published case the model follows.)', href: 'https://doi.org/10.7759/cureus.56077' },
  ],
  'head-neck-ameloblastoma': [
    { text: 'Vered M, Wright JM. Update from the 5th edition of the World Health Organization classification of head and neck tumors: odontogenic and maxillofacial bone tumours. Head Neck Pathol. 2022;16(1):63-75. (Ameloblastoma: a benign but locally invasive growth from tooth-forming cells.)', href: 'https://doi.org/10.1007/s12105-021-01404-7' },
    { text: 'Almeida RAC, Andrade ESS, Barbalho JC, Vajgel A, Vasconcelos BCE. Recurrence rate following treatment for primary multicystic ameloblastoma: systematic review and meta-analysis. Int J Oral Maxillofac Surg. 2016;45(3):359-367. (It can come back after treatment; the ways to remove it compared.)', href: 'https://doi.org/10.1016/j.ijom.2015.12.016' },
    { text: 'Sikri N, Eid S, Mohamed S, Ghosh A. Management of mandibular ameloblastoma: a case report from a Bahrain Government Hospital. Cureus. 2026;18(2):e104441. (The published case the model follows: the lower edge of the jaw kept and a plate added.)', href: 'https://doi.org/10.7759/cureus.104441' },
  ],
  'head-neck-okc': [
    { text: 'Vered M, Wright JM. Update from the 5th edition of the World Health Organization classification of head and neck tumors: odontogenic and maxillofacial bone tumours. Head Neck Pathol. 2022;16(1):63-75. (Odontogenic keratocyst.)', href: 'https://doi.org/10.1007/s12105-021-01404-7' },
    { text: 'Chrcanovic BR, Gomez RS. Recurrence probability for keratocystic odontogenic tumors: an analysis of 6427 cases. J Craniomaxillofac Surg. 2017;45(2):244-251. (How often it comes back.)', href: 'https://doi.org/10.1016/j.jcms.2016.11.010' },
    { text: 'Al-Moraissi EA, Dahan AA, Alwadeai MS, et al. What surgical treatment has the lowest recurrence rate following the management of keratocystic odontogenic tumor?: A large systematic review and meta-analysis. J Craniomaxillofac Surg. 2017;45(1):131-144. (The ways to treat it, and treating the bone wall to lower the chance of it coming back.)', href: 'https://doi.org/10.1016/j.jcms.2016.10.013' },
  ],
  'head-neck-mec': [
    { text: 'Skálová A, Hyrcza MD, Leivo I. Update from the 5th edition of the World Health Organization classification of head and neck tumors: salivary glands. Head Neck Pathol. 2022;16(1):40-53. (Mucoepidermoid carcinoma, a salivary gland cancer; minor salivary glands of the palate.)', href: 'https://doi.org/10.1007/s12105-022-01420-1' },
    { text: 'Geiger JL, Ismaila N, Beadle B, et al. Management of salivary gland malignancy: ASCO guideline. J Clin Oncol. 2021;39(17):1909-1941. (Surgery removes the growth with a margin of healthy tissue.)', href: 'https://doi.org/10.1200/JCO.21.00449' },
    { text: 'Ellam M, et al. Mucoepidermoid carcinoma of the hard palate: a case illustrating grading uncertainty and bone-sparing surgical management. Cureus. 2026;18(8):e115250. (The published case the model follows: the bone was kept.)', href: 'https://doi.org/10.7759/cureus.115250' },
  ],
  'alveolar-bone-graft': [
    { text: 'Lilja J. Alveolar bone grafting. Indian J Plast Surg. 2009;42:S110-S115. (The gap in the bone of the upper jaw in a cleft, and the graft that fills it.)', href: 'https://doi.org/10.1055/s-0039-1699383' },
    { text: 'Semb G. Alveolar bone grafting. Front Oral Biol. 2012;16:124-136. (Bone usually taken from the hip; timing before the canine comes through.)', href: 'https://doi.org/10.1159/000337666' },
    { text: 'Kaura AS, et al. Optimal timing of alveolar cleft bone grafting. J Craniofac Surg. 2018;29:1551-1557. (Usually at about 8 to 11 years, by the development of the canine.)', href: 'https://doi.org/10.1097/SCS.0000000000004680' },
    { text: 'Bergland O, Semb G, Abyholm FE. Elimination of the residual alveolar cleft by secondary bone grafting and subsequent orthodontic treatment. Cleft Palate J. 1986;23:175-205. (The canine comes through the grafted bone.)', href: 'https://pubmed.ncbi.nlm.nih.gov/3524905/' },
  ],
  'averaged-jaw': [
    { text: 'Raith S, Wolff S, Steiner T, et al. Planning of mandibular reconstructions based on statistical shape models. Int J Comput Assist Radiol Surg. 2017;12(1):99-112. (A mean mandible made from many scans; averaging smooths fine detail.)', href: 'https://doi.org/10.1007/s11548-016-1451-y' },
    { text: 'Wasserthal J, Breit HC, Meyer MT, et al. TotalSegmentator: robust segmentation of 104 anatomic structures in CT images. Radiol Artif Intell. 2023;5(5):e230024. (The tool that outlined the jaw and teeth in each scan.)', href: 'https://doi.org/10.1148/ryai.230024' },
    { text: 'Vivatheca. tools/segment/segment.py and average.py: how the scans were segmented, aligned and averaged; provenance.json lists every scan.', href: 'https://github.com/CBCT-2026/Vivatheca/tree/main/tools/segment' },
  ],
  orthognathic: [
    { text: 'Angle EH. Classification of malocclusion. Dental Cosmos. 1899;41:248-264, 350-357. (Molar classes I, II, III.)', href: '' },
    { text: 'Cambridge University Hospitals NHS Foundation Trust. Jaw or chin corrective surgery (orthognathic surgery): patient information and consent. (Braces with surgery; moving the upper jaw, lower jaw or both; plates and screws.)', href: 'https://www.cuh.nhs.uk/patient-information/patient-information-and-consent-to-jaw-or-chin-corrective-surgery-orthognathic-surgery/' },
    { text: 'NHS England (prepared by Public Health England). Interim clinical commissioning policy: orthognathic surgery (Armed Forces), N-SC/026. November 2013. (Braces alone cannot correct a jaw that is out of line; orthodontics before and after surgery.)', href: 'https://www.england.nhs.uk/commissioning/wp-content/uploads/sites/12/2014/03/nsc026-orthognathic-surg.pdf' },
    { text: 'Proffit WR, Turvey TA, Phillips C. The hierarchy of stability and predictability in orthognathic surgery with rigid fixation: an update and extension. Head Face Med. 2007;3:21. (Plates and screws hold the bone; how stable each move is.)', href: 'https://doi.org/10.1186/1746-160X-3-21' },
  ],
  fixation: [
    { text: 'Champy M, Loddé JP, Schmitt R, Jaeger JH, Muster D. Mandibular osteosynthesis by miniature screwed plates via a buccal approach. J Maxillofac Surg. 1978;6(1):14-21. (Small plates with short screws in the outer layer of bone, placed away from the tooth roots.)', href: 'https://doi.org/10.1016/s0301-0503(78)80062-9' },
    { text: 'Worthington P, Champy M. Monocortical miniplate osteosynthesis. Otolaryngol Clin North Am. 1987;20(3):607-620. (Holding the bone pieces still while they heal, after injury or surgery.)', href: 'https://pubmed.ncbi.nlm.nih.gov/3317206/' },
    { text: 'AO Foundation Technical Commission. Locking Reconstruction Plate 2.4 and Mini Plate 2.0 System. Approved solution, 2014. (Bending the plate to fit the bone; screws on each side of the cut.)', href: 'https://www.aofoundation.org/approved/approvedsolutionsfolder/2014/locking-reconstruction-plate-24-and-mini-plate-20-system' },
  ],
};

export const visitPackSources: Record<string, Source[]> = Object.fromEntries(Object.entries(lists).map(([slug, list]) => [slug, [...list, threeQuestions]]));
