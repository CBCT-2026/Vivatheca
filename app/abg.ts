// Alveolar bone graft (ABG) models shown in the homepage interactive section.
// Models from CBCT-2026/ABG (commit f3cb41e, models/), made by Vivatheca's founder for a patient
// education study. They keep their own colours (project rule). Draco-compressed: the decoder is
// served from /development/vendor/draco/.
// Words for each stage live in the dictionaries (abg.stages), in the same order.

export const abgStages = [
  { src: '/models/abg/abg-1-pre-op.glb', poster: '/models/abg/abg-1-pre-op-poster.webp', cites: { plain: [1], clinical: [1, 2, 3, 4, 5] } },
  { src: '/models/abg/abg-2-during-braces.glb', poster: '/models/abg/abg-2-during-braces-poster.webp', cites: { plain: [4, 6], clinical: [7, 8, 4, 6, 9] } },
  { src: '/models/abg/abg-3b-substitution.glb', poster: '/models/abg/abg-3b-substitution-poster.webp', cites: { plain: [10, 11, 12], clinical: [13, 10, 11, 12, 14, 15] } },
];

// Checked against CBCT-2026/ABG content/references.json (the study's checked source list), 6 November 2026.
// Citations stay in English, the language they were published in.
export const abgSources = [
  { id: 1, text: 'Lilja J. Alveolar bone grafting. Indian J Plast Surg. 2009;42:S110-S115.', href: 'https://doi.org/10.1055/s-0039-1699383' },
  { id: 2, text: 'Knüppe AL, et al. Developmental characteristics of the permanent upper lateral incisor in unilateral cleft lip and palate. Oral Maxillofac Surg. 2024;28:909-917.', href: 'https://doi.org/10.1007/s10006-024-01226-1' },
  { id: 3, text: 'Kadi H, et al. CBCT assessment of canine eruption and development following alveolar bone grafting in unilateral cleft lip and palate. Cleft Palate Craniofac J. 2023;60:386-394.', href: 'https://doi.org/10.1177/10556656211064477' },
  { id: 4, text: 'Bergland O, Semb G, Abyholm FE. Elimination of the residual alveolar cleft by secondary bone grafting and subsequent orthodontic treatment. Cleft Palate J. 1986;23:175-205.', href: 'https://pubmed.ncbi.nlm.nih.gov/3524905/' },
  { id: 5, text: 'Kaura AS, et al. Optimal timing of alveolar cleft bone grafting. J Craniofac Surg. 2018;29:1551-1557.', href: 'https://doi.org/10.1097/SCS.0000000000004680' },
  { id: 6, text: 'Semb G. Alveolar bone grafting. Front Oral Biol. 2012;16:124-136.', href: 'https://doi.org/10.1159/000337666' },
  { id: 7, text: 'Boyne PJ, Sands NR. Secondary bone grafting of residual alveolar and palatal clefts. J Oral Surg. 1972;30:87-92.', href: 'https://pubmed.ncbi.nlm.nih.gov/4550446/' },
  { id: 8, text: 'Pan W, et al. Secondary alveolar bone grafting and iliac cancellous bone harvesting. J Craniofac Surg. 2016;27:883-891.', href: 'https://doi.org/10.1097/SCS.0000000000002603' },
  { id: 9, text: 'Rivers J, et al. A clinical index scale for secondary alveolar bone graft success based on canine eruption. Eur J Orthod. 2025;47:cjae065.', href: 'https://doi.org/10.1093/ejo/cjae065' },
  { id: 10, text: 'Kokich VO Jr, Kinzer GA. Managing congenitally missing lateral incisors. Part I: canine substitution. J Esthet Restor Dent. 2005;17:5-10.', href: 'https://doi.org/10.1111/j.1708-8240.2005.tb00076.x' },
  { id: 11, text: 'Zachrisson BU, Rosa M, Toreskog S. Congenitally missing maxillary lateral incisors: canine substitution. Am J Orthod Dentofacial Orthop. 2011;139:434-438.', href: 'https://doi.org/10.1016/j.ajodo.2011.02.003' },
  { id: 12, text: 'Clerc MM, et al. Replacement of missing lateral incisors for patients with cleft lip and palate: a decision-making tree based on a systematic review. J Prosthet Dent. 2025;134:50-60.', href: 'https://doi.org/10.1016/j.prosdent.2023.07.023' },
  { id: 13, text: 'Lee A, et al. Dental rehabilitation of the unilateral cleft dental gap: long-term follow-up. J Craniofac Surg. 2024;35:199-202.', href: 'https://doi.org/10.1097/SCS.0000000000009802' },
  { id: 14, text: 'Knobloch LA, et al. Narrow diameter implants for a missing lateral incisor in cleft palate patients: five-year results. J Prosthet Dent. 2025;134:1738-1747.', href: 'https://doi.org/10.1016/j.prosdent.2024.07.048' },
  { id: 15, text: 'Jahanbin A, et al. Long-term stability of alveolar bone graft in cleft lip and palate: a systematic review and meta-analysis. J Craniofac Surg. 2022;33:e194-e200.', href: 'https://doi.org/10.1097/SCS.0000000000008254' },
];

