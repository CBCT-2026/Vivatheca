// Model facts for the shared "Use this model" panel on every model page (public/share-tools.js):
// title, version, page address, licence, review status and the model disclaimer, in each language.
// One source: app/models/catalogue.ts, the dictionaries and app/disclaimer-text.ts.
import { catalogue, licence } from '../../models/catalogue';
import { modelCodes } from '../../models/semantics';
import { currentReview } from '../../models/reviews';
import { dictionaries } from '../../i18n/dictionaries';
import { disclaimerHref } from '../../disclaimer-text';
import { listedLocales as locales } from '../../i18n/config';

function reviewSummary(slug: string) {
  const r = currentReview(slug);
  return r ? { reviewer: r.reviewer, credentials: r.credentials, date: r.date, version: r.version } : null;
}

export function GET() {
  const models = catalogue.map((m) => ({
    slug: m.slug,
    href: m.href,
    image: m.image,
    version: m.version,
    updated: m.updated,
    licence: m.licence ?? licence,
    review: reviewSummary(m.slug),
    codes: modelCodes[m.slug] ?? { subjects: [], anatomy: [] },
    title: Object.fromEntries(locales.map((l) => [l, (dictionaries[l].library.items as Record<string, { title: string }>)[m.slug]?.title ?? m.slug])),
  }));
  const body = {
    licence,
    disclaimerHref,
    reviewedStatus: Object.fromEntries(locales.map((l) => [l, dictionaries[l].review.status])),
    reviewStatus: Object.fromEntries(locales.map((l) => [l, dictionaries[l].disclaimer.notReviewed])),
    modelDisclaimer: Object.fromEntries(locales.map((l) => [l, dictionaries[l].disclaimer.model])),
    models,
  };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
}
