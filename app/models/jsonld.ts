// Machine-readable page data (schema.org JSON-LD) for model pages, the collection and the homepage.
// Helps search engines, open educational resource catalogues and AI assistants find, describe and
// credit the models. Types follow schema.org (checked against google/schema-dts names).
// One source: catalogue.ts, semantics.ts, the English dictionary and disclaimer-text.ts.
// App pages render <JsonLd> (app/models/json-ld.tsx); static pages get the same block written into
// their <head> by `node tools/jsonld/build.mjs` (CI runs it with --check).
import { catalogue, licence } from './catalogue';
import { meshUrl, modelCodes, uberonUrl } from './semantics';
import { modelDisclaimer } from '../disclaimer-text';
import en from '../i18n/dictionaries/en';
import { listedLocales } from '../i18n/config';

export const SITE = 'https://vivatheca.com';
const ORG = { '@type': 'Organization', '@id': `${SITE}/#org`, name: 'Vivatheca', url: `${SITE}/`, email: 'vivatheca@gmail.com' };
const REVIEW_STATUS = 'Not yet clinically reviewed';

// Removes {漢字|かんじ} furigana markup (English text has none, but keep it safe).
const plainText = (s: string) => s.replace(/\{([^|}]+)\|[^}]+\}/g, '$1');
const abs = (href: string) => (href.startsWith('http') ? href : SITE + href);

type Item = { title: string; summary: string; specialty: string };

export function modelJsonLd(slug: string) {
  const m = catalogue.find((c) => c.slug === slug);
  if (!m) throw new Error(`No catalogue entry for ${slug}`);
  const item = (en.library.items as Record<string, Item>)[slug];
  const codes = modelCodes[slug];
  const url = abs(m.href);
  return {
    '@context': 'https://schema.org',
    '@type': ['3DModel', 'LearningResource'],
    '@id': `${url}#model`,
    name: plainText(item.title),
    description: plainText(item.summary),
    url,
    image: abs(m.image),
    version: m.version,
    dateModified: m.updated,
    inLanguage: [...listedLocales],
    isAccessibleForFree: true,
    license: licence.href,
    creator: ORG,
    publisher: ORG,
    learningResourceType: '3D model',
    educationalUse: 'patient education',
    audience: [
      { '@type': 'MedicalAudience', audienceType: 'Clinician' },
      { '@type': 'MedicalAudience', audienceType: 'MedicalStudent' },
    ],
    about: [
      ...(codes?.subjects ?? []).map((c) => ({
        '@type': 'DefinedTerm',
        name: c.label,
        termCode: c.id,
        url: meshUrl(c.id),
        inDefinedTermSet: 'https://www.nlm.nih.gov/mesh/',
      })),
      ...(codes?.anatomy ?? []).map((c) => ({
        '@type': 'AnatomicalStructure',
        name: c.label,
        identifier: c.id,
        sameAs: uberonUrl(c.id),
      })),
    ],
    citation: m.terms.map((t) => (t.href ? { '@type': 'CreativeWork', name: t.text, url: t.href } : { '@type': 'CreativeWork', name: t.text })),
    creativeWorkStatus: REVIEW_STATUS,
    disambiguatingDescription: modelDisclaimer,
    keywords: [item.specialty, ...(codes?.subjects ?? []).map((c) => c.label)].join(', '),
  };
}

export function collectionJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE}/models#collection`,
    name: plainText(en.library.title),
    url: `${SITE}/models`,
    publisher: ORG,
    license: licence.href,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: catalogue.map((m, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: abs(m.href),
        name: plainText((en.library.items as Record<string, Item>)[m.slug].title),
      })),
    },
  };
}

export function siteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { ...ORG, description: plainText(en.meta.description), logo: `${SITE}/icon-512.png` },
      { '@type': 'WebSite', '@id': `${SITE}/#site`, name: 'Vivatheca', url: `${SITE}/`, publisher: { '@id': `${SITE}/#org` }, inLanguage: [...listedLocales] },
    ],
  };
}

// Safe to put inside <script type="application/ld+json">: no "</script" can close the tag early.
export function serialise(data: unknown, indent = 0) {
  return JSON.stringify(data, null, indent).replace(/</g, '\\u003c');
}
