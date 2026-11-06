'use client';

import React, { useMemo, useState } from 'react';
import { toggleFavourite, useFavourites } from '../favourites';
import { useI18n } from '../i18n/context';
import { format } from '../i18n/dictionaries';
import { plain, Ruby } from '../i18n/ruby';
import { catalogue } from '../models/catalogue';
import { quickHref, showSpecs } from './models';

// Star button: adds a model to "My models" (this browser only, see app/favourites.ts).
export function FavouriteStar({ slug, className = '' }: { slug: string; className?: string }) {
  const { t } = useI18n();
  const { list, ready } = useFavourites();
  const on = list.includes(slug);
  const title = plain(t.library.items[slug]?.title ?? slug);
  const label = format(plain(on ? t.show.unfavourite : t.show.favourite), { title });
  return (
    <button type="button" className={`fav-star ${className}`.trim()} aria-pressed={on} aria-label={label} title={label} disabled={!ready} onClick={() => toggleFavourite(slug)}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" /></svg>
    </button>
  );
}

function QuickTile({ slug }: { slug: string }) {
  const { t } = useI18n();
  const model = catalogue.find((m) => m.slug === slug);
  const item = t.library.items[slug];
  if (!model || !item) return null;
  const direct = Boolean(showSpecs[slug]);
  return (
    <li className="quick-tile">
      <a href={quickHref(slug)} className="quick-tile-link">
        <img src={model.image} alt="" width="1200" height="800" loading="lazy" />
        <span className="quick-tile-text">
          <span className="quick-tile-title"><Ruby text={item.title} /></span>
          <span className="quick-tile-meta"><Ruby text={item.specialty} />{direct ? null : <span className="visually-hidden">. {plain(t.show.opensPage)}</span>}</span>
        </span>
      </a>
      <FavouriteStar slug={slug} />
    </li>
  );
}

// "My models": the visitor's starred models, newest first. Hidden until there is one,
// unless `empty` asks for the hint (the /show page).
export function MyModels({ empty = false }: { empty?: boolean }) {
  const { t } = useI18n();
  const { list, ready } = useFavourites();
  const slugs = list.filter((slug) => catalogue.some((m) => m.slug === slug));
  if (!ready || (!slugs.length && !empty)) return null;
  return (
    <section className="my-models" aria-labelledby="my-models-title">
      <div className="my-models-head">
        <h2 id="my-models-title"><Ruby text={t.show.myModels} /></h2>
        <p><Ruby text={t.show.myModelsNote} /></p>
      </div>
      {slugs.length ? <ul className="quick-grid quick-row">{slugs.map((slug) => <QuickTile key={slug} slug={slug} />)}</ul> : <p className="my-models-empty"><Ruby text={t.show.myModelsEmpty} /></p>}
    </section>
  );
}

// Every model as a one-tap tile, with a filter box. Used on the homepage and /show.
export function QuickPick({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const words = useMemo(() => catalogue.map((m) => {
    const item = t.library.items[m.slug];
    return { slug: m.slug, text: plain(`${item?.title ?? ''} ${item?.specialty ?? ''} ${item?.summary ?? ''} ${item?.pairing ?? ''}`).toLowerCase() };
  }), [t]);
  const q = query.trim().toLowerCase();
  const shown = q ? words.filter((w) => q.split(/\s+/).every((part) => w.text.includes(part))) : words;
  const Heading = `h${headingLevel}` as 'h2' | 'h3';
  return (
    <div className="quick-pick">
      <Heading className="visually-hidden">{plain(t.show.listLabel)}</Heading>
      <label className="quick-search">
        <span className="visually-hidden">{plain(t.show.searchLabel)}</span>
        <img aria-hidden="true" src="/icons/search.svg" alt="" width="22" height="22" />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={plain(t.show.searchPlaceholder)} autoComplete="off" />
      </label>
      {shown.length ? <ul className="quick-grid" aria-label={plain(t.show.listLabel)}>{shown.map((w) => <QuickTile key={w.slug} slug={w.slug} />)}</ul> : <p className="quick-empty" role="status"><Ruby text={t.show.noResults} /></p>}
    </div>
  );
}

// "Show to a patient" link and star, for the top of a model page.
export function ShowActions({ slug }: { slug: string }) {
  const { t } = useI18n();
  return (
    <div className="show-actions">
      <a className="button button-compact" href={quickHref(slug)}><Ruby text={t.show.showLink} /></a>
      <FavouriteStar slug={slug} className="fav-star-inline" />
    </div>
  );
}
