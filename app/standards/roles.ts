import { disciplines, type Discipline } from '../models/disciplines';

// Volunteer roles shown on /standards (anatomy apps and nonprofits review #9 and #10, Luke 2026-11-08).
// All roles are unpaid, with no financial reimbursement. Recruiting and sign-off steps: docs/volunteer-roles.md.
// Add a person only after they agree in writing to be named, with the name and credentials they want shown,
// and after their declaration of interests is received. Leave `name` empty while the role is open.
export type Volunteer = { name: string; credentials: string; since: string; interests: string };

// One section editor per discipline (the same list as the collection filter).
export const sectionEditors: Record<Discipline, Volunteer | null> = Object.fromEntries(disciplines.map((d) => [d, null])) as Record<Discipline, Volunteer | null>;

// The editorial board that oversees the section editors. Empty until specialists join.
export const editorialBoard: Volunteer[] = [];

// One language lead per language: Japanese and Vietnamese first; Chinese later (Luke, 2026-11-06).
export const languageLeads: { lang: 'ja' | 'vi' | 'zh'; later?: boolean; lead: Volunteer | null }[] = [
  { lang: 'ja', lead: null },
  { lang: 'vi', lead: null },
  { lang: 'zh', later: true, lead: null },
];
