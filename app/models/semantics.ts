// Standard codes for each model (deep-dive picks X5 and X6, 6 Nov 2026).
// - subjects: MeSH descriptors (US National Library of Medicine) for the condition, procedure or topic.
// - anatomy: UBERON anatomy IDs (Uberon ontology, CC BY 3.0) for the main structures the model shows,
//   with the matching FMA ID where Uberon lists one.
// Every ID was looked up on 6 Nov 2026 (MeSH: id.nlm.nih.gov lookup API; UBERON and FMA: EBI OLS4) and
// `node tools/jsonld/build.mjs --verify` checks each one against those services again (label must match).
// Never add an ID from memory: look it up and run --verify.
// ICD-11 is not used: the WHO ICD API needs a registered account, and MeSH covers what the pages need.
// These codes are used in the JSON-LD on every model page (app/models/jsonld.ts) and shown in the
// "Credit and citation" panel (public/share-tools.js, through /api/models).

export type Code = { id: string; label: string; note?: string };
export type ModelCodes = { subjects: Code[]; anatomy: Code[] };

export const meshUrl = (id: string) => `https://meshb.nlm.nih.gov/record/ui?ui=${id}`;
export const uberonUrl = (id: string) => `http://purl.obolibrary.org/obo/${id.replace(':', '_')}`;

const A = {
  mandible: { id: 'UBERON:0001684', label: 'mandible' },
  maxilla: { id: 'UBERON:0002397', label: 'maxilla' },
  lowerThirdMolar: { id: 'UBERON:0018580', label: 'lower third secondary molar tooth' },
  ian: { id: 'UBERON:0018405', label: 'inferior alveolar nerve' },
  mandibularCanal: { id: 'UBERON:0006673', label: 'mandibular canal' },
  mentalForamen: { id: 'UBERON:0006812', label: 'mental foramen' },
  deciduousTooth: { id: 'UBERON:0007115', label: 'deciduous tooth' },
  secondaryDentition: { id: 'UBERON:0007774', label: 'secondary dentition' },
  periodontium: { id: 'UBERON:0001758', label: 'periodontium' },
  pdl: { id: 'UBERON:0008266', label: 'periodontal ligament' },
  gingiva: { id: 'UBERON:0001828', label: 'gingiva' },
  cementum: { id: 'UBERON:0001753', label: 'cementum' },
  maxillarySinus: { id: 'UBERON:0001764', label: 'maxillary sinus' },
  maxillaryAlveolus: { id: 'UBERON:0004527', label: 'alveolar process of maxilla' },
  molar: { id: 'UBERON:0003655', label: 'molar tooth' },
  enamel: { id: 'UBERON:0001752', label: 'enamel' },
  dentine: { id: 'UBERON:0001751', label: 'dentine' },
  pulp: { id: 'UBERON:0001754', label: 'dental pulp' },
  fibula: { id: 'UBERON:0001446', label: 'fibula' },
  hardPalate: { id: 'UBERON:0003216', label: 'hard palate' },
  minorSalivary: { id: 'UBERON:0001830', label: 'minor salivary gland' },
  lowerTeeth: { id: 'UBERON:0003268', label: 'tooth of lower jaw' },
  chin: { id: 'UBERON:0008199', label: 'chin' },
} satisfies Record<string, Code>;

const M = {
  impacted: { id: 'D014095', label: 'Tooth, Impacted' },
  thirdMolar: { id: 'D008964', label: 'Molar, Third' },
  eruption: { id: 'D014078', label: 'Tooth Eruption' },
  odontogenesis: { id: 'D009805', label: 'Odontogenesis' },
  mixedDentition: { id: 'D003818', label: 'Dentition, Mixed' },
  periodontitis: { id: 'D010518', label: 'Periodontitis' },
  oroantral: { id: 'D009957', label: 'Oroantral Fistula' },
  cracked: { id: 'D003387', label: 'Cracked Tooth Syndrome' },
  crowns: { id: 'D003442', label: 'Crowns' },
  caries: { id: 'D003731', label: 'Dental Caries' },
  deciduous: { id: 'D014094', label: 'Tooth, Deciduous' },
  hnNeoplasms: { id: 'D006258', label: 'Head and Neck Neoplasms' },
  hnscc: { id: 'D000077195', label: 'Squamous Cell Carcinoma of Head and Neck' },
  mouthNeoplasms: { id: 'D009062', label: 'Mouth Neoplasms' },
  mandibularNeoplasms: { id: 'D008339', label: 'Mandibular Neoplasms' },
  mandibularRecon: { id: 'D063175', label: 'Mandibular Reconstruction' },
  freeFlaps: { id: 'D058752', label: 'Free Tissue Flaps' },
  ameloblastoma: { id: 'D000564', label: 'Ameloblastoma' },
  odontogenicCysts: { id: 'D009807', label: 'Odontogenic Cysts', note: 'MeSH has no separate heading for odontogenic keratocyst; "Keratocysts" is an entry term of this heading.' },
  mec: { id: 'D018277', label: 'Carcinoma, Mucoepidermoid' },
  palatalNeoplasms: { id: 'D010157', label: 'Palatal Neoplasms' },
  salivaryNeoplasms: { id: 'D012468', label: 'Salivary Gland Neoplasms' },
  cleftPalate: { id: 'D002972', label: 'Cleft Palate' },
  abg: { id: 'D064728', label: 'Alveolar Bone Grafting' },
  mandible: { id: 'D008334', label: 'Mandible' },
  classII: { id: 'D008312', label: 'Malocclusion, Angle Class II' },
  classIII: { id: 'D008313', label: 'Malocclusion, Angle Class III' },
  orthognathic: { id: 'D056948', label: 'Orthognathic Surgical Procedures' },
  leFort: { id: 'D019340', label: 'Osteotomy, Le Fort' },
  bsso: { id: 'D059229', label: 'Osteotomy, Sagittal Split Ramus' },
  genioplasty: { id: 'D063172', label: 'Genioplasty' },
  bonePlates: { id: 'D001860', label: 'Bone Plates' },
  internalFixation: { id: 'D005593', label: 'Fracture Fixation, Internal' },
} satisfies Record<string, Code>;

export const modelCodes: Record<string, ModelCodes> = {
  'impacted-wisdom-tooth': { subjects: [M.impacted, M.thirdMolar], anatomy: [A.mandible, A.lowerThirdMolar, A.ian, A.mandibularCanal, A.mentalForamen] },
  'dental-development': { subjects: [M.eruption, M.odontogenesis, M.mixedDentition], anatomy: [A.deciduousTooth, A.secondaryDentition, A.maxilla, A.mandible] },
  periodontitis: { subjects: [M.periodontitis], anatomy: [A.periodontium, A.gingiva, A.pdl, A.cementum] },
  oroantral: { subjects: [M.oroantral], anatomy: [A.maxillarySinus, A.maxilla, A.maxillaryAlveolus] },
  'cracked-tooth': { subjects: [M.cracked, M.crowns], anatomy: [A.molar, A.enamel, A.dentine, A.pulp] },
  'stainless-steel-crown': { subjects: [M.caries, M.crowns, M.deciduous], anatomy: [A.deciduousTooth, A.pulp] },
  'head-neck': { subjects: [M.hnNeoplasms, M.mandibularRecon, M.freeFlaps], anatomy: [A.mandible, A.fibula, A.hardPalate] },
  'head-neck-scc': { subjects: [M.hnscc, M.mouthNeoplasms, M.mandibularRecon, M.freeFlaps], anatomy: [A.mandible, A.fibula] },
  'head-neck-ameloblastoma': { subjects: [M.ameloblastoma, M.mandibularNeoplasms, M.mandibularRecon], anatomy: [A.mandible] },
  'head-neck-okc': { subjects: [M.odontogenicCysts], anatomy: [A.mandible] },
  'head-neck-mec': { subjects: [M.mec, M.palatalNeoplasms, M.salivaryNeoplasms], anatomy: [A.hardPalate, A.minorSalivary, A.maxilla] },
  'alveolar-bone-graft': { subjects: [M.abg, M.cleftPalate], anatomy: [A.maxillaryAlveolus, A.maxilla, A.deciduousTooth, A.secondaryDentition] },
  'averaged-jaw': { subjects: [M.mandible], anatomy: [A.mandible, A.lowerTeeth] },
  orthognathic: { subjects: [M.classII, M.classIII, M.orthognathic, M.leFort, M.bsso, M.genioplasty], anatomy: [A.maxilla, A.mandible, A.chin] },
  fixation: { subjects: [M.bonePlates, M.internalFixation], anatomy: [A.mandible] },
};
