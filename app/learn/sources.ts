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
