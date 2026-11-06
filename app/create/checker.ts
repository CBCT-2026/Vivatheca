// In-browser checks for English patient information written in Markdown.
// A TypeScript port of the deterministic checks in CBCT-2026/patient-education-toolkit
// (pitk/checks.py, MIT licence). Thresholds follow that toolkit's defaults and its
// docs/guidelines.md sources (NHS content guide, CDC Clear Communication Index, IPDAS).
// Syllables are counted with a heuristic, so grades can differ slightly from textstat.
// These checks are a first filter, not proof of quality.

import { jargonEn } from './jargon';

export type Severity = 'error' | 'warn';

export interface Finding {
  rule: string;
  severity: Severity;
  section: string;
  message: string;
  excerpt?: string;
}

export interface Scores {
  words: number;
  sentences: number;
  fkgl: number | null;
  smog: number | null;
  fre: number | null;
}

export interface CheckResult {
  findings: Finding[];
  scores: Scores;
  sectionGrades: { title: string; fkgl: number | null }[];
}

export const limits = { maxFkgl: 6, maxSmog: 6, minFre: 70, maxSentenceWords: 20 };

interface Section {
  title: string;
  units: string[];
}

// Citation markers such as [1], [1-3], [[key]] and {{note}} are ignored, as in pitk.
const CITE = /\[\d+(?:\s*[,–-]\s*\d+)*\]|\[\[[\w:.-]+\]\]|\{\{[^}]*\}\}/g;
const DEFINED = /((medical|other|full|proper|technical) name (is|for)|called|known as|means)\s+(the\s+|an?\s+)?([\w-]+\s+){0,3}$/i;

function stripMarkdown(line: string): string {
  return line
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>]/g, '')
    .replace(/^\s*([-+]|\d+[.)])\s+/, '')
    .trim();
}

export function parseSections(markdown: string): Section[] {
  const sections: Section[] = [];
  let current: Section = { title: '(start)', units: [] };
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) current.units.push(paragraph.join(' '));
    paragraph = [];
  };
  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trimEnd();
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      flush();
      if (current.units.length || current.title !== '(start)') sections.push(current);
      current = { title: stripMarkdown(heading[1]) || '(untitled)', units: [] };
      continue;
    }
    if (!line.trim()) {
      flush();
      continue;
    }
    if (/^\s*([-+*]|\d+[.)])\s+/.test(line)) {
      flush();
      paragraph.push(stripMarkdown(line));
      flush();
      continue;
    }
    paragraph.push(stripMarkdown(line));
  }
  flush();
  if (current.units.length || current.title !== '(start)') sections.push(current);
  return sections.map((s) => ({ ...s, units: s.units.map((u) => u.replace(CITE, '').replace(/\s+/g, ' ').trim()).filter(Boolean) }));
}

function words(text: string): string[] {
  return text.match(/[A-Za-z0-9][A-Za-z0-9'’-]*/g) ?? [];
}

export function syllables(word: string): number {
  let w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return /\d/.test(word) ? 1 : 0;
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|[^laeiouy]ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const groups = w.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

// Join units so headings and list items count as sentences, as pitk's join_units does.
function joinUnits(units: string[]): string {
  return units.map((u) => (/[.?!:]$/.test(u) ? u : `${u}.`)).join(' ');
}

function sentenceCount(text: string): number {
  return Math.max(1, (text.match(/[.!?:]+(\s|$)/g) ?? []).length);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function scoreText(text: string): Scores {
  const w = words(text);
  const sentences = sentenceCount(text);
  if (w.length < 10) return { words: w.length, sentences, fkgl: null, smog: null, fre: null };
  const syl = w.reduce((sum, x) => sum + syllables(x), 0);
  const poly = w.filter((x) => syllables(x) >= 3).length;
  const wps = w.length / sentences;
  const spw = syl / w.length;
  return {
    words: w.length,
    sentences,
    fkgl: round1(0.39 * wps + 11.8 * spw - 15.59),
    fre: round1(206.835 - 1.015 * wps - 84.6 * spw),
    // SMOG was built on samples of 30 sentences; pitk reports nothing below 3.
    smog: sentences >= 3 ? round1(1.043 * Math.sqrt(poly * (30 / sentences)) + 3.1291) : null,
  };
}

function cut(s: string, start: number, end: number, pad = 30): string {
  return (start > pad ? '…' : '') + s.slice(Math.max(0, start - pad), end + pad).trim() + (end + pad < s.length ? '…' : '');
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function explained(u: string, index: number, length: number): boolean {
  const before = u.slice(0, index);
  const after = u.slice(index + length);
  if (before.lastIndexOf('(') > before.lastIndexOf(')') && after.includes(')')) return true;
  return DEFINED.test(before.slice(-40));
}

const PASSIVE_OK = new Set(['tired', 'worried', 'interested', 'used', 'based', 'called', 'concerned', 'located', 'scared',
  'supposed', 'pleased', 'prepared', 'involved', 'married', 'needed', 'allowed', 'red', 'bored', 'surprised', 'excited',
  'shed', 'bed', 'seed', 'feed', 'need', 'speed', 'linked', 'related', 'numbed', 'asked', 'advised', 'limited', 'closed',
  'stuck', 'born', 'open', 'even', 'often', 'seven', 'eleven', 'given', 'when', 'then', 'ten', 'men', 'women', 'children',
  'hidden', 'swollen', 'golden', 'broken']);
const PASSIVE = /\b(am|is|are|was|were|be|been|being|get|gets|got)\s+(?:\w+ly\s+)?(\w+(?:ed|en)|done|made|seen|taken|shown|known|told|found|put|cut|hurt|felt|held|kept|left|lost|paid|sent|set|built|brought|caught|taught|thought)\b/gi;
const COMMON_ACRONYMS = new Set(['NHS', 'UK', 'US', 'USA', 'OK', 'TV', 'PhD', 'DNA', 'GP', 'PDF', 'QR', 'ID', 'EU', 'WHO', 'CDC',
  'AM', 'PM', 'FAQ', 'URL', 'BMJ', 'AR', 'CT', 'MRI', 'TODO', 'CHECK', 'DRAFT', 'AI']);

export const IGNORED_SECTIONS = /^(sources|references|notes for the clinician)$/i;

// Removes the "Notes for the clinician" section, which is for the author only.
export function stripClinicianNotes(markdown: string): string {
  return markdown.replace(/^##\s+Notes for the clinician\s*$[\s\S]*?(?=^#{1,2}\s|(?![\s\S]))/im, '').trimEnd() + '\n';
}

export interface CheckOptions {
  address: 'you' | 'neutral';
  allow?: string[];
}

export function checkMarkdown(markdown: string, options: CheckOptions = { address: 'you' }): CheckResult {
  const findings: Finding[] = [];
  const add = (rule: string, severity: Severity, section: string, message: string, excerpt?: string) =>
    findings.push({ rule, severity, section, message, excerpt });
  // Reference lists and the AI's notes to the clinician are not patient-facing text.
  const sections = parseSections(markdown).filter((s) => !IGNORED_SECTIONS.test(s.title));
  const allow = new Set((options.allow ?? []).map((a) => a.toLowerCase()));
  const jargon = Object.entries(jargonEn).filter(([k]) => !allow.has(k.toLowerCase()));
  const allUnits = sections.flatMap((s) => s.units);
  const fullText = allUnits.join(' ');
  const sectionGrades: CheckResult['sectionGrades'] = [];

  for (const s of sections) {
    const text = joinUnits(s.units);
    const sc = scoreText(text);
    sectionGrades.push({ title: s.title, fkgl: sc.fkgl });
    if (sc.fkgl !== null && sc.fkgl > limits.maxFkgl) {
      add('reading-grade', 'error', s.title, `Reading grade ${sc.fkgl} is above ${limits.maxFkgl}. Use shorter sentences and shorter words.`);
    }
    for (const u of s.units) {
      for (const sent of u.split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])/)) {
        const n = words(sent).length;
        if (n > limits.maxSentenceWords) {
          add('sentence-length', 'warn', s.title, `${n} words in one sentence (aim for ${limits.maxSentenceWords} or fewer).`, sent.length > 90 ? `${sent.slice(0, 90)}…` : sent);
        }
      }
      for (const [term, plain] of jargon) {
        const isAcronym = term === term.toUpperCase() && /[A-Z]/.test(term);
        const re = isAcronym ? new RegExp(`\\b${escapeRe(term)}s?\\b`) : new RegExp(`\\b${escapeRe(term)}\\b`, 'i');
        const m = re.exec(u);
        if (m && !explained(u, m.index, m[0].length)) {
          add('jargon', 'error', s.title, `"${m[0]}": try "${plain}", or explain it in brackets.`, cut(u, m.index, m.index + m[0].length));
        }
      }
      for (const m of u.matchAll(/\d+(?:\.\d+)?\s?(%|percent|per cent)/gi)) {
        add('percent', 'warn', s.title, 'Percentage: give the risk as "X in 100" (natural frequency).', cut(u, m.index!, m.index! + m[0].length));
      }
      if (options.address === 'you') {
        for (const m of u.matchAll(/\b(the patient|patients|the person|a person|people who|the reader|the individual|one should|anyone who|someone who)\b/gi)) {
          add('address-you', 'warn', s.title, `"${m[0]}": speak to the reader as "you" (NHS, CDC).`, cut(u, m.index!, m.index! + m[0].length));
        }
      } else {
        for (const m of u.matchAll(/\b(you|your|yours|yourself|you're|you'll)\b/gi)) {
          add('address-neutral', 'warn', s.title, `"${m[0]}": this material uses neutral wording.`, cut(u, m.index!, m.index! + m[0].length));
        }
      }
      for (const m of u.matchAll(PASSIVE)) {
        if (!PASSIVE_OK.has(m[2].toLowerCase())) {
          add('passive-voice', 'warn', s.title, `Possible passive voice "${m[0]}": say who does what.`, cut(u, m.index!, m.index! + m[0].length));
        }
      }
      // Word-only risk phrases ("rare", "a proportion of patients"): IPDAS asks for a number with a stated denominator.
      if (!/\d/.test(u)) {
        const m = /\b(rare|rarely|very rare|uncommon|very common|common|small risk|low risk|high risk|frequently|infrequently|occasionally|seldom|a (?:small )?proportion of|a small number of|a minority of|a small chance|in some cases|a few people|some people|some patients)\b/i.exec(u);
        if (m) add('verbal-risk', 'warn', s.title, `"${m[0]}" without a number: if this is a risk, add "about X in 100".`, cut(u, m.index, m.index + m[0].length));
      }
      const rel = /\b(times (more|less) likely|twice as likely|half as likely|(increases|reduces|lowers|raises|halves|doubles) (the |your )?(risk|chance)( by)?)\b/i.exec(u);
      if (rel) add('relative-risk', 'warn', s.title, 'Relative risk: also give the absolute numbers ("from X in 100 to Y in 100").', cut(u, rel.index, rel.index + rel[0].length));
      for (const m of u.matchAll(/\b(?:[A-Z]{3,}\s+)+[A-Z]{3,}\b/g)) {
        add('all-caps', 'warn', s.title, 'Words in capitals are harder to read: use bold instead.', cut(u, m.index!, m.index! + m[0].length));
      }
      for (const m of u.matchAll(/\b(not|n't|never)\s+(un\w+|impossible|without|uncommon|unlikely)\b/gi)) {
        add('double-negative', 'warn', s.title, `Double negative "${m[0]}": say it positively.`, cut(u, m.index!, m.index! + m[0].length));
      }
      for (const m of u.matchAll(/\[CHECK[^\]]*\]/gi)) {
        add('check-marker', 'error', s.title, 'A [CHECK] marker is still in the text: confirm or remove it.', cut(u, m.index!, m.index! + m[0].length));
      }
    }
  }

  // Acronyms must be spelled out once.
  const jargonAcronyms = new Set(Object.keys(jargonEn).filter((k) => k === k.toUpperCase()));
  const seen = new Set<string>();
  for (const s of sections) {
    for (const u of s.units) {
      for (const m of u.matchAll(/\b([A-Z]{2,6})s?\b/g)) {
        const a = m[1];
        if (seen.has(a) || COMMON_ACRONYMS.has(a) || jargonAcronyms.has(a) || allow.has(a.toLowerCase())) continue;
        seen.add(a);
        const spelled = new RegExp(`\\(\\s*${a}s?\\s*\\)|\\b${a}s?\\s*\\(`).test(fullText);
        if (!spelled) add('acronym', 'warn', s.title, `"${a}" is not spelled out the first time.`, cut(u, m.index!, m.index! + m[0].length));
      }
    }
  }

  if (options.address === 'you' && allUnits.length > 5 && !/\b(you|your)\b/i.test(fullText)) {
    add('address-you', 'warn', '(whole text)', 'The text never says "you". NHS and CDC guidance: speak to the reader.');
  }

  const denominators = new Set<string>();
  for (const m of fullText.matchAll(/\b\d[\d,]*\s+(?:in|out of)\s+(\d[\d,]*)\b/g)) denominators.add(m[1].replace(/,/g, ''));
  if (denominators.size > 1) {
    add('mixed-denominators', 'warn', '(whole text)', `Risks use different denominators (${[...denominators].map((d) => `"in ${d}"`).join(', ')}). Use the same one, e.g. "X in 100".`);
  }

  for (const m of markdown.matchAll(/!\[\s*\]\(/g)) {
    add('img-alt', 'error', '(images)', 'An image has no alt text.', cut(markdown, m.index!, m.index! + 4));
  }
  for (const m of markdown.matchAll(/\[(click here|here|more|read more|link|this link)\]\(/gi)) {
    add('link-text', 'warn', '(links)', `Link text "${m[1]}" does not say where it goes.`);
  }

  const scores = scoreText(joinUnits(allUnits));
  if (scores.smog !== null && scores.smog > limits.maxSmog) {
    add('smog', 'error', '(whole text)', `SMOG grade ${scores.smog} is above ${limits.maxSmog}. Use fewer words of 3 or more syllables.`);
  }
  if (scores.fre !== null && scores.fre < limits.minFre) {
    add('reading-ease', 'warn', '(whole text)', `Flesch Reading Ease ${scores.fre} is below ${limits.minFre} (higher is easier).`);
  }
  return { findings, scores, sectionGrades };
}

// Flags text that looks like patient-identifying information before anything is sent.
export function findPossiblePatientDetails(text: string): string[] {
  const hits: string[] = [];
  if (/\b(\d{1,2}[/.-]\d{1,2}[/.-](19|20)\d{2})\b/.test(text)) hits.push('a date that may be a date of birth');
  if (/\b(DOB|date of birth|born on)\b/i.test(text)) hits.push('a date of birth');
  if (/(\+?\d[\d\s-]{8,}\d)/.test(text)) hits.push('a phone or record number');
  if (/[\w.+-]+@[\w-]+\.[\w.]+/.test(text)) hits.push('an email address');
  if (/\b(MRN|UR number|URN|Medicare|NHS number|patient ID|hospital number)\b/i.test(text)) hits.push('a record or Medicare number');
  if (/\b(Mr|Mrs|Ms|Miss|Mx)\.?\s+[A-Z][a-z]+/.test(text)) hits.push('a person’s name');
  return hits;
}

// Estimated spoken length at 150 words a minute (pitk's English default).
export function spokenSeconds(text: string): number {
  return Math.round((words(text).length / 150) * 60);
}
