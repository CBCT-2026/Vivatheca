// Disciplines used to group the collection (footer "Explore" list and the filter on /models).
// The words live in the dictionaries (footer.disciplines.items). A model can sit in more than one.
export const disciplines = ['oral-surgery', 'head-neck', 'cleft', 'orthodontics', 'paediatric', 'endodontics', 'periodontics', 'prosthodontics'] as const;
export type Discipline = (typeof disciplines)[number];

export const modelDisciplines: Record<string, Discipline[]> = {
  'impacted-wisdom-tooth': ['oral-surgery'],
  'dental-development': ['orthodontics', 'paediatric'],
  periodontitis: ['periodontics'],
  oroantral: ['oral-surgery'],
  'cracked-tooth': ['endodontics', 'prosthodontics'],
  endodontic: ['endodontics'],
  vpi: ['cleft'],
  prosthodontic: ['prosthodontics'],
  tmd: ['oral-surgery'],
  'ectopic-canine': ['orthodontics'],
  'dentigerous-cyst': ['oral-surgery'],
  'stainless-steel-crown': ['paediatric'],
  'head-neck': ['head-neck'],
  'head-neck-scc': ['head-neck'],
  'head-neck-ameloblastoma': ['head-neck'],
  'head-neck-okc': ['head-neck'],
  'head-neck-mec': ['head-neck'],
  'alveolar-bone-graft': ['cleft'],
  'averaged-jaw': ['oral-surgery'],
  orthognathic: ['orthodontics', 'oral-surgery'],
  fixation: ['oral-surgery'],
};

export function isDiscipline(value: unknown): value is Discipline {
  return typeof value === 'string' && (disciplines as readonly string[]).includes(value);
}

export function disciplineHref(d: Discipline) {
  return `/models?discipline=${d}`;
}
