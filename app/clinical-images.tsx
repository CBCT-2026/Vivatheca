import { abgClinicalImages, clinicalImages } from './data';
import type { Dictionary } from './i18n/dictionaries';
import { plain, Ruby } from './i18n/ruby';

type Image = { key: string; src: string; width: number; height: number; credit: string; href: string; licence: { name: string; href: string }; changes: string };

// Real radiographs and scans shown on app model pages, with full credit, licence and changes.
// Licences and consent reasoning: assets/clinical-images/manifest.json and docs/image-licensing.md.
function ClinicalImages({ t, images, heading, note }: { t: Dictionary; images: readonly Image[]; heading: string; note: string }) {
  return (
    <section className="clinical-images" id="clinical-images" aria-labelledby="clinical-images-title">
      <h2 id="clinical-images-title"><Ruby text={heading} /></h2>
      <p className="clinical-note"><Ruby text={note} /></p>
      <div className="clinical-grid">
        {images.map((image, index) => {
          const text = t.clinical.images[image.key as keyof Dictionary['clinical']['images']];
          return (
            <figure key={image.key} className="clinical-figure" id={`img-${index + 1}`}>
              <img src={image.src} width={image.width} height={image.height} loading="lazy" alt={plain(text.alt)} />
              <figcaption>
                <Ruby text={text.caption} />
                <span className="clinical-credit">{plain(t.clinical.credit)}: <span lang="en">{image.credit} <a className="url" href={image.href} target="_blank" rel="noreferrer">{image.href.replace('https://', '')}</a>.</span> {plain(t.clinical.licence)}: <a href={image.licence.href} target="_blank" rel="noreferrer" lang="en">{image.licence.name}</a>. {plain(t.clinical.changes)}: <span lang="en">{image.changes}</span></span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

export function WisdomClinicalImages({ t }: { t: Dictionary }) {
  return <ClinicalImages t={t} images={clinicalImages} heading={t.clinical.heading} note={t.clinical.note} />;
}

export function AbgClinicalImages({ t }: { t: Dictionary }) {
  return <ClinicalImages t={t} images={abgClinicalImages} heading={t.clinical.abgHeading} note={t.clinical.abgNote} />;
}
