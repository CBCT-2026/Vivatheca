// Content briefs for the material builder. Shared by the browser (copy-prompt mode)
// and the server route that calls Claude, so both send the same instructions.

export interface ModelBrief {
  id: string;
  name: string;
  glb?: string;
  // The model's page on Vivatheca; the A4 sheet's QR code opens it.
  page?: string;
  condition: string;
  // Label names used on the 3D model. Drafts reuse them so text, sheet and model match.
  labels: { plain: string; medical?: string }[];
  normalComparison?: string;
}

export const modelBriefs: ModelBrief[] = [
  {
    id: 'impacted-molar',
    page: '/models/impacted-wisdom-tooth',
    name: 'Mesioangular impacted mandibular third molar',
    glb: '/models/impacted-molar.glb',
    condition: 'An impacted lower third molar (wisdom tooth) angled forward against the second molar, with roots close to the inferior alveolar nerve.',
    labels: [
      { plain: 'Wisdom tooth', medical: 'third molar' },
      { plain: 'Roots' },
      { plain: 'Molars' },
      { plain: 'Premolars' },
      { plain: 'Jaw bone', medical: 'mandible' },
      { plain: 'Jaw nerve', medical: 'inferior alveolar nerve' },
      { plain: 'Chin nerve', medical: 'mental nerve' },
    ],
    normalComparison: 'The same lower jaw with the wisdom tooth fully through and upright (matched normal model, shown side by side on the model page).',
  },
  {
    id: 'oroantral',
    page: '/oroantral/',
    name: 'Oroantral communication and oroantral fistula after maxillary molar extraction',
    glb: '/oroantral/models/oac.glb',
    condition: 'Upper first molar roots reaching into the maxillary sinus; removal leaves an oroantral communication (OAC, a fresh opening). If it stays open it becomes an oroantral fistula (OAF, an epithelium-lined tunnel). Repairs shown: blood clot (small openings), buccal advancement flap, buccal fat pad flap, palatal rotation flap.',
    labels: [
      { plain: 'Sinus', medical: 'maxillary sinus' },
      { plain: 'Bone layer' },
      { plain: 'Root tip' },
      { plain: 'Roots in sinus' },
      { plain: 'Gum', medical: 'gingiva' },
      { plain: 'Opening to sinus', medical: 'oroantral communication' },
      { plain: 'Empty socket' },
      { plain: 'Lined tunnel', medical: 'oroantral fistula' },
      { plain: 'Swollen lining', medical: 'thickened sinus mucosa' },
      { plain: 'Blood clot' },
      { plain: 'Flap', medical: 'buccal advancement flap' },
      { plain: 'Fat pad', medical: 'buccal fat pad' },
      { plain: 'Palate flap', medical: 'palatal rotation flap' },
      { plain: 'Bare bone', medical: 'exposed palatal bone (donor site)' },
    ],
    normalComparison: 'Stage 1 of the same model: a healthy upper jaw with 3 mm of bone between the first molar root tips and the sinus.',
  },
  {
    id: 'periodontitis',
    page: '/periodontitis/',
    name: 'Periodontitis, Stages I to IV (2017 AAP/EFP classification)',
    glb: '/periodontitis/models/healthy.glb',
    condition: 'A lower jaw showing the 2017 AAP/EFP periodontitis stages: healthy, then Stage I (initial), II (moderate), III (severe) and IV (advanced), with bone height falling further below the enamel edge of the teeth at each stage.',
    labels: [
      { plain: 'Teeth' },
      { plain: 'Bone' },
      { plain: 'Bone lost (compared with the healthy model)', medical: 'alveolar bone loss' },
    ],
    normalComparison: 'The healthy stage of the same jaw, with bone about 1.5 mm below the enamel edge.',
  },
  {
    id: 'development',
    page: '/development/',
    name: 'Mixed dentition: development and eruption of the permanent teeth, 6.5 to 12.5 years',
    glb: '/development/models/age-6-5.glb',
    condition: 'A child\'s upper and lower jaws at each year from 6 to 12, showing baby teeth being lost and adult teeth growing inside the jaw and coming through. This is normal development, not a disease.',
    labels: [
      { plain: 'Baby teeth', medical: 'primary teeth (shown blue)' },
      { plain: 'Adult teeth', medical: 'permanent teeth (shown yellow)' },
      { plain: 'Bone' },
    ],
  },
  {
    id: 'orthognathic',
    page: '/orthognathic/',
    name: 'Skeletal Class II and Class III malocclusion: orthognathic surgery (Le Fort I osteotomy, BSSO and genioplasty)',
    glb: '/orthognathic/models/normal.glb',
    condition: 'Upper and lower jaws with a normal bite (Class I), a lower jaw set back (Class II) and a lower jaw set forward (Class III), each shown before and after jaw surgery that moves the bone and holds it with titanium plates and screws.',
    labels: [
      { plain: 'Bone' },
      { plain: 'Teeth' },
      { plain: 'Cut bone', medical: 'osteotomy' },
      { plain: 'Titanium plates and screws' },
      { plain: 'Moved bone' },
    ],
    normalComparison: 'The Class I model: upper and lower jaws in balance, with the back teeth fitting together.',
  },
  {
    id: 'cracked-tooth',
    page: '/cracked-tooth/',
    name: 'Cracked mandibular first molar: direct restoration versus cuspal-coverage crown',
    glb: '/cracked-tooth/models/cracked-whole.glb',
    condition: 'A lower first molar with a crack, shown untreated, with a large composite resin filling, and with a crown that covers the cusps, beside a healthy tooth. Biting force can open the crack; a crown holds the cusps together.',
    labels: [
      { plain: 'Tooth' },
      { plain: 'Crack' },
      { plain: 'Filling', medical: 'composite resin restoration' },
      { plain: 'Crown', medical: 'full-coverage crown' },
      { plain: 'Enamel' },
      { plain: 'Dentine' },
      { plain: 'Pulp (nerve)', medical: 'dental pulp' },
      { plain: 'Biting force' },
    ],
    normalComparison: 'A healthy lower first molar with no crack.',
  },
  {
    id: 'prosthodontic',
    page: '/prosthodontic/',
    name: 'Atrophic edentulous mandible (Cawood and Howell class V) with a dentate mandible, and complete denture or two-implant overdenture',
    glb: '/prosthodontic/models/denture-whole.glb',
    condition: 'A lower jaw years after all its teeth were lost. The bone that held the teeth (the ridge) has shrunk to a low, flat base, most of all at the back, so a lower denture has little to hold on to. Shown beside the same jaw with its teeth. Options shown: a complete denture resting on the gum, or a denture held by two implants in the front of the jaw (two-implant overdenture).',
    labels: [
      { plain: 'Jaw bone', medical: 'mandible' },
      { plain: 'Ridge', medical: 'residual alveolar ridge' },
      { plain: 'Gum', medical: 'oral mucosa' },
      { plain: 'Teeth' },
      { plain: 'Denture', medical: 'complete denture' },
      { plain: 'Implants', medical: 'dental implants' },
    ],
    normalComparison: 'The same lower jaw with all 14 adult teeth (no wisdom teeth) and a full-height ridge.',
  },
  {
    id: 'endodontic',
    page: '/endodontic/',
    name: 'Pulp necrosis with chronic apical abscess in a mandibular first molar, with a sound tooth',
    glb: '/endodontic/models/abscess-whole.glb',
    condition: 'A lower first molar in its bone. Deep decay has reached the pulp and the pulp has died; infection has spread out of the root tips, the bone around them has worn away (a periapical lesion), and a sinus tract drains pus to the gum. Shown beside the same tooth when sound. Main treatments: root canal treatment (usually followed by a crown) or extraction.',
    labels: [
      { plain: 'Tooth' },
      { plain: 'Jaw bone', medical: 'mandible' },
      { plain: 'Pulp (nerve)', medical: 'dental pulp' },
      { plain: 'Decay', medical: 'caries' },
      { plain: 'Infection at the root tips', medical: 'periapical lesion' },
      { plain: 'Drainage channel', medical: 'sinus tract' },
    ],
    normalComparison: 'The same lower first molar, sound, with a living pulp and whole bone around the root tips.',
  },
  {
    id: 'stainless-steel-crown',
    page: '/stainless-steel-crown/',
    name: 'Preformed metal (stainless steel) crown on a mandibular second primary molar',
    glb: '/stainless-steel-crown/models/crown.glb',
    condition: 'A baby back tooth in a child\'s lower jaw, shown healthy, with large decay, with a large filling, shaped for a crown, and with a preformed stainless steel crown. The adult tooth grows in the bone underneath.',
    labels: [
      { plain: 'Baby tooth', medical: 'primary molar' },
      { plain: 'Gum' },
      { plain: 'Bone' },
      { plain: 'Nerve', medical: 'dental pulp' },
    ],
    normalComparison: 'The healthy baby tooth, with the adult tooth growing underneath.',
  },
  {
    id: 'head-neck-scc',
    page: '/head-neck/scc/',
    name: 'Squamous cell carcinoma of the mandibular gingiva: segmental mandibulectomy and fibula free flap reconstruction',
    glb: '/head-neck/models/scc-case.glb',
    condition: 'Based on one published case: a squamous cell carcinoma of the right lower gum that had grown into the bone. The right side of the lower jaw was removed with a safety margin and rebuilt with bone from the leg (fibula free flap).',
    labels: [
      { plain: 'Bone' },
      { plain: 'Teeth' },
      { plain: 'Disease', medical: 'squamous cell carcinoma' },
      { plain: 'Bone removed', medical: 'segmental mandibulectomy' },
      { plain: 'Teeth removed with the bone' },
      { plain: 'Safety margin', medical: 'resection margin' },
    ],
  },
  {
    id: 'head-neck-ameloblastoma',
    page: '/head-neck/ameloblastoma/',
    name: 'Ameloblastoma of the mandible: marginal mandibulectomy',
    glb: '/head-neck/models/ameloblastoma-case.glb',
    condition: 'Based on one published case: an ameloblastoma (a growth that is not cancer but grows into bone) in the front of the left lower jaw. The top part of the jaw was removed with four teeth, keeping the lower edge, and a metal plate keeps the thin edge strong.',
    labels: [
      { plain: 'Bone' },
      { plain: 'Teeth' },
      { plain: 'Disease', medical: 'ameloblastoma' },
      { plain: 'Bone removed', medical: 'marginal mandibulectomy' },
      { plain: 'Teeth removed with the bone' },
      { plain: 'Safety margin', medical: 'resection margin' },
    ],
  },
  {
    id: 'head-neck-okc',
    page: '/head-neck/okc/',
    name: 'Odontogenic keratocyst of the mandible: enucleation and peripheral ostectomy',
    glb: '/head-neck/models/okc-case.glb',
    condition: 'Based on one published case: an odontogenic keratocyst (a fluid-filled sac in the jaw that is not cancer but often comes back) at the root tips of two lower left premolars. The sac was removed, the bone wall shaved and the teeth kept.',
    labels: [
      { plain: 'Bone' },
      { plain: 'Teeth' },
      { plain: 'Disease', medical: 'odontogenic keratocyst' },
      { plain: 'Bone removed', medical: 'peripheral ostectomy' },
      { plain: 'Root tips cut off', medical: 'apicectomy' },
    ],
  },
  {
    id: 'head-neck-mec',
    page: '/head-neck/mec/',
    name: 'Low-grade mucoepidermoid carcinoma of the hard palate: wide local excision',
    glb: '/head-neck/models/mec-case.glb',
    condition: 'Based on one published case: a slow-growing mucoepidermoid carcinoma of a minor salivary gland on the right side of the palate. The lump was removed with a cuff of normal lining, the bone above it kept, and the raw area healed under a cover plate.',
    labels: [
      { plain: 'Bone' },
      { plain: 'Teeth' },
      { plain: 'Disease', medical: 'mucoepidermoid carcinoma' },
      { plain: 'Palate lining', medical: 'palatal mucosa' },
      { plain: 'Safety margin', medical: 'resection margin' },
    ],
  },
  {
    id: 'none',
    name: 'Other topic (no Vivatheca model yet)',
    condition: '',
    labels: [],
  },
];

export const materialTypes = {
  leaflet: {
    label: 'Patient information page or leaflet',
    instructions: 'Write a patient information page. Start with what the page is for and who it is for. Use question headings such as "What is it?", "Why might I need treatment?", "What are the risks?", "What are my options?", "What happens next?". Aim for 400 to 700 words.',
  },
  sheet: {
    label: 'One-page A4 information sheet',
    instructions: 'Write a one-page A4 information sheet to print beside the 3D model. Keep it to 250 to 350 words. Use 4 to 6 short question headings and short lists. Include a line telling the reader they can scan the QR code to open the 3D model.',
  },
  consent: {
    label: 'Risks and options section (consent aid)',
    instructions: 'Write the risks and options section of a consent aid for a dental or oral surgery procedure. Cover, as headings: why it is offered, material risks with numbers (who they apply to and the time frame), what each risk feels like and what to do, alternatives including monitoring and no treatment, risks of waiting, factors that change the risk, and a next step (talk it through with the clinician). Follow the Royal College of Surgeons of England guide Consent: Supported Decision-Making and the Dental Board of Australia Code of conduct on informed consent.',
  },
  narration: {
    label: 'Narration script for a 3D print or video',
    instructions: 'Write a spoken narration script that plays while the patient looks at the 3D model or print. Point to parts by their label names, colour and position. Keep it to 45 seconds when read aloud (about 110 words). One short sentence per line. No headings other than a title.',
  },
} as const;

export type MaterialType = keyof typeof materialTypes;

export const audiences = {
  adult: 'Adults having the treatment',
  carer: 'Parents or carers of a child having the treatment',
  teen: 'Teenagers (12 to 17 years) having the treatment',
} as const;

export type Audience = keyof typeof audiences;

export interface Brief {
  modelId: string;
  topic: string;
  material: MaterialType;
  audience: Audience;
  keyPoints: string;
  riskNumbers: string;
  sources: string;
}

// System prompt condensed from the patient-education-toolkit skills
// (plain-language-rewrite, risk-communication, dental-consent-content, pemat-review,
// clear-communication-index). Kept stable so the API can cache it.
export const systemPrompt = `You help clinicians draft patient education materials for Vivatheca, a non-profit library of 3D medical models. A clinician will check, edit and take responsibility for everything you write. You are drafting, not advising patients.

Accuracy rules (most important):
- Use only the facts, risk numbers and sources the clinician gives you, plus well-established general anatomy. Never invent numbers, studies, guideline names, URLs or quotes.
- If something important is missing (for example a risk without a number or source), write the sentence with a placeholder such as "about [CHECK: number] in 100" and mark it [CHECK: what is needed]. Do not guess.
- Keep each source the clinician gives as a numbered reference, and cite it in the text as [1], [2] next to the fact it supports.
- Do not give individual medical advice. Tell the reader to talk to their dentist or doctor about their own situation.
- Never include patient names, dates of birth or other identifying details, even if they appear in the brief.

Plain language (NHS content guide, ISO 24495-1, CDC Clear Communication Index):
- Speak to the reader as "you". Use active voice: say who does what.
- Sentences of 20 words or fewer; paragraphs of 3 sentences or fewer; one idea per sentence.
- Aim for a reading grade of 6 or below (reading age 9 to 11).
- Plain word first, medical word in brackets, explained once: "jaw nerve (inferior alveolar nerve)". Keep a medical term only if the reader will hear it from their clinician or need it to search.
- Headings that say what the section answers, ideally as questions. Lists for 3 or more items.
- Put the main message at the top. Say what the reader should do (actionability, PEMAT).
- No metaphors, idioms, double negatives or capitals for emphasis. Name symptoms precisely ("numb, tingling or painful lip").

Risk communication (IPDAS, NHS numbers guide):
- Give risks as natural frequencies: "about 7 in 100 people", not percentages or decimals.
- Use the same denominator throughout ("in 100"), unless a risk is too rare; then say why.
- Say who the number applies to and over what time. Give absolute numbers with any relative risk.
- Use words like "rare" or "common" only next to a number. Say if studies disagree. Give the benefit or reason next to the risks, and the options including monitoring or no treatment.

3D model link:
- When a Vivatheca model is named, use its label names exactly as given, so the text matches the labels on the model.

Output format:
- Markdown only. Start with a level-1 heading (the title). Use level-2 headings for sections.
- End with a "## Sources" section listing the numbered references exactly as the clinician gave them (or "[CHECK: add sources]" if none were given).
- After the sources, add "## Notes for the clinician": a short list of every [CHECK] item and anything you were unsure about.
- Do not add any other commentary before or after the Markdown.`;

// Languages a draft can be written in; matches the site languages.
export const draftLanguages = { en: 'English', ja: 'Japanese' } as const;
export type DraftLanguage = keyof typeof draftLanguages;

const languageNotes: Partial<Record<DraftLanguage, string>> = {
  ja: 'Write in natural, polite Japanese (です・ます) for patients in Japan. Use everyday words first with the dental term in brackets, for example 親知らず（智歯）, 下あごの神経（下歯槽神経）. Give risks as "100人に約7人". Keep the headings "## Sources" and "## Notes for the clinician" in English so the builder can find them.',
};

export function buildUserPrompt(brief: Brief, language: DraftLanguage = 'en'): string {
  const model = modelBriefs.find((m) => m.id === brief.modelId);
  const material = materialTypes[brief.material];
  const lines = [
    `Material: ${material.label}.`,
    material.instructions,
    `Audience: ${audiences[brief.audience]}. Language: ${draftLanguages[language] ?? 'English'}.`,
    `Topic: ${brief.topic.trim() || model?.name || '[not given]'}.`,
  ];
  if (model && model.id !== 'none') {
    lines.push(`Vivatheca 3D model: ${model.name}. ${model.condition}`);
    lines.push(`Model label names (use these exactly): ${model.labels.map((l) => (l.medical ? `${l.plain} (${l.medical})` : l.plain)).join('; ')}.`);
    if (model.normalComparison) lines.push(`Normal comparison: ${model.normalComparison}`);
  }
  lines.push(`Key points the clinician wants covered:\n${brief.keyPoints.trim() || '[none given]'}`);
  lines.push(`Risk numbers to use (only these):\n${brief.riskNumbers.trim() || '[none given: use [CHECK] placeholders for any risk]'}`);
  lines.push(`Sources:\n${brief.sources.trim() || '[none given]'}`);
  const note = languageNotes[language];
  if (note) lines.push(note);
  return lines.join('\n\n');
}

export const refineActions = {
  simplify: 'Rewrite the draft below to be easier to read. Keep every fact, number, [n] citation, [CHECK] marker and heading. Fix the checker findings listed. Return the whole draft in the same Markdown format.',
  review: 'Review the draft below as a patient education expert. Score it with PEMAT-P (understandability and actionability, as percentages) and the CDC Clear Communication Index (score out of 100, target 90+), giving a short reason for each item marked "no". Then list the 5 most useful edits, quoting the original sentence and a suggested replacement. Do not rewrite the whole draft. Reply in Markdown.',
} as const;

export type RefineAction = keyof typeof refineActions;

export function buildRefinePrompt(action: RefineAction, draft: string, findings: string[]): string {
  const issues = findings.length ? `\n\nChecker findings:\n${findings.map((f) => `- ${f}`).join('\n')}` : '';
  return `${refineActions[action]}${issues}\n\n--- DRAFT ---\n${draft}`;
}
