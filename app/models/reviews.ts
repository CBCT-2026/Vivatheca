// Clinical review sign-off records (unbuilt-features #6). One record per review of one model version.
// A model counts as clinically reviewed only while a record with outcome 'approved' matches its
// current catalogue version: a new version needs a new review. Shown on /review, on each collection
// card, in the "Use this model" credit (via /api/models) and in the JSON-LD.
// How to add a record: docs/clinical-review.md. Never add a record without the reviewer's written
// agreement to be named, and never add patient details.
import { catalogue } from './catalogue';

export type ReviewRecord = {
  model: string; // catalogue slug
  version: string; // catalogue version that was reviewed
  date: string; // YYYY-MM-DD the reviewer signed off
  reviewer: string; // name as the reviewer wants it shown
  credentials: string; // e.g. 'BDS, FRACDS (OMS), oral and maxillofacial surgeon'
  country: string;
  checked: Array<'anatomy' | 'condition' | 'treatment' | 'text' | 'sources' | 'translation'>;
  outcome: 'approved' | 'changes-requested';
  notes?: string; // what was changed or left as a stated simplification
};

export const reviews: ReviewRecord[] = [];

export function currentReview(slug: string) {
  const m = catalogue.find((c) => c.slug === slug);
  if (!m) return null;
  return reviews.filter((r) => r.model === slug && r.version === m.version && r.outcome === 'approved').sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
}

export function reviewsOf(slug: string) {
  return reviews.filter((r) => r.model === slug).sort((a, b) => b.date.localeCompare(a.date));
}
