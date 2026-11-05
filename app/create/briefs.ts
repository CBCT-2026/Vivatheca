// Content briefs for the material builder. Shared by the browser (copy-prompt mode)
// and the server route that calls Claude, so both send the same instructions.

export interface ModelBrief {
  id: string;
  name: string;
  glb?: string;
  condition: string;
  // Label names used on the 3D model. Drafts reuse them so text, sheet and model match.
  labels: { plain: string; medical?: string }[];
  normalComparison?: string;
}

export const modelBriefs: ModelBrief[] = [
  {
    id: 'impacted-molar',
    name: 'Impacted lower wisdom tooth',
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
    normalComparison: 'A lower jaw where the wisdom tooth has come through fully upright (model planned).',
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
    instructions: 'Write the risks and options section of a consent aid for a dental or oral surgery procedure. Cover, as headings: why it is offered, material risks with numbers (who they apply to and the time frame), what each risk feels like and what to do, alternatives including monitoring and no treatment, risks of waiting, factors that change the risk, and a next step (talk it through with the clinician). Follow RCS England 2020 and Australian Dental Association 2020 consent guidance.',
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

export function buildUserPrompt(brief: Brief): string {
  const model = modelBriefs.find((m) => m.id === brief.modelId);
  const material = materialTypes[brief.material];
  const lines = [
    `Material: ${material.label}.`,
    material.instructions,
    `Audience: ${audiences[brief.audience]}. Language: English.`,
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
