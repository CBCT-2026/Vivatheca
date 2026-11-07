import { disclaimerHref } from './disclaimer-text';
import { format } from './i18n/dictionaries';
import { getI18n } from './i18n/server';
import { plain, Ruby } from './i18n/ruby';
import { videoFiles, videos } from './videos';

// Narrated video (at most 45 seconds) for an app model page, the same as public/video-embed.js
// does for the static pages: the video, what it says (with citations), the review status, the
// model disclaimer, a link to /disclaimer and the video's sources.
export async function VideoSection({ slug }: { slug: string }) {
  const { t, locale } = await getI18n();
  const video = videos[slug];
  if (!video) return null;
  // Videos exist in English and Japanese; other site languages show the English video.
  const lang = locale === 'ja' ? 'ja' : 'en';
  const v = video[lang];
  const files = videoFiles(slug, lang);
  const s = t.video;
  return (
    <section className="detail-block video-block" id="video" aria-labelledby="video-title" lang={locale === lang ? undefined : lang}>
      <h2 id="video-title"><span className="video-badge"><Ruby text={s.badge} /></span> <Ruby text={s.heading} /></h2>
      <p className="video-meta"><Ruby text={v.title} /> · <Ruby text={format(s.meta, { s: String(v.seconds) })} /></p>
      <video controls playsInline preload="none" poster={files.poster} aria-label={plain(s.label + v.title)}>
        <source src={files.mp4} type="video/mp4" />
        <track kind="captions" srcLang={lang} label={lang === 'ja' ? '日本語' : 'English'} src={files.vtt} />
        <p><Ruby text={s.noVideo} /> <a href={files.mp4}>MP4</a></p>
      </video>
      <h3><Ruby text={s.says} /></h3>
      <p>
        {v.lines.map((line, i) => (
          <span key={i}>
            <Ruby text={line.text} />
            {line.cite.map((n) => <sup key={n} className="cite"><a href={`#vsrc-${n}`}>{n}</a></sup>)}{' '}
          </span>
        ))}
      </p>
      {lang === 'ja' && s.english ? <p className="detail-note"><a href={videoFiles(slug, 'en').mp4} lang="en">{s.english}</a></p> : null}
      <p className="vt-video-review"><strong><Ruby text={t.disclaimer.notReviewed} /></strong> <Ruby text={t.disclaimer.model} /> <a href={disclaimerHref}><Ruby text={t.disclaimer.full} /></a></p>
      <p className="detail-note"><Ruby text={s.voice} /></p>
      <details className="vt-video-refs">
        <summary><h3><Ruby text={s.sources} /></h3></summary>
        <ol>
          {video.sources.map((src, i) => {
            const url = src.match(/https?:\/\/\S+$/)?.[0];
            return <li key={i} id={`vsrc-${i + 1}`}>{url ? <>{src.slice(0, -url.length)}<a className="url" href={url}>{url.replace(/^https?:\/\//, '')}</a></> : src}</li>;
          })}
        </ol>
      </details>
    </section>
  );
}
