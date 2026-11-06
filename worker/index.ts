// Worker entry: optional shared-password gate in front of the vinext app.
// Set the SITE_PASSWORD secret in Cloudflare to turn the gate on.
// Remove the secret to make the site public.
import app from 'vinext/server/app-router-entry';
import { LOCALE_COOKIE, locales } from '../app/i18n/config';
import { handleStoreApi, type StoreEnv } from './store';

// The Durable Object class must be exported from the Worker entry (binding STORE in vite.config.ts).
export { VivathecaStore } from './store';

// Minimal R2 types (the bucket binding is optional; see serveDownload).
interface R2ObjectLike {
  body: ReadableStream;
  size: number;
  httpEtag: string;
  httpMetadata?: { contentType?: string };
  range?: { offset?: number; length?: number };
}
interface R2BucketLike {
  get(key: string, options?: { range?: Headers | { offset?: number; length?: number; suffix?: number } }): Promise<R2ObjectLike | null>;
  head(key: string): Promise<Omit<R2ObjectLike, 'body'> | null>;
}

interface Env extends StoreEnv {
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
  DOWNLOADS?: R2BucketLike;
  SITE_USERNAME?: string;
  SITE_PASSWORD?: string;
}

const REALM = 'Vivatheca preview';

const LANGS = locales;

// Browser tab icons stay public so the tab shows the Vivatheca logo even on the password prompt.
// The password prompt is a small HTML page that names the icons. Safari (especially on iPhone)
// fetches a site's icon without the password and reads the <head> of whatever page it gets, so
// without these links it shows a blank tile for vivatheca.com in suggestions and favourites.
const GATE_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vivatheca</title>
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
</head>
<body><p>This preview of Vivatheca is password protected.</p></body>
</html>
`;

const PUBLIC_ICON_PATHS = new Set([
  '/favicon.ico',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/apple-touch-icon-precomposed.png',
  '/icon-192.png',
  '/icon-512.png',
  '/site.webmanifest',
]);

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function isAuthorised(request: Request, env: Env): boolean {
  const header = request.headers.get('Authorization') ?? '';
  if (!header.startsWith('Basic ')) return false;
  let decoded = '';
  try {
    decoded = atob(header.slice(6));
  } catch {
    return false;
  }
  const separator = decoded.indexOf(':');
  if (separator < 0) return false;
  const username = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);
  const expectedUser = env.SITE_USERNAME || 'vivatheca';
  return safeEqual(username, expectedUser) && safeEqual(password, env.SITE_PASSWORD ?? '');
}

// Failed password attempts per address per minute, kept in memory only (a brake on guessing).
const FAILED = new Map<string, { minute: number; n: number }>();
const MAX_FAILED_PER_MINUTE = 20;
function tooManyFailures(request: Request): boolean {
  const e = FAILED.get(request.headers.get('CF-Connecting-IP') ?? 'local');
  return Boolean(e && e.minute === Math.floor(Date.now() / 60000) && e.n >= MAX_FAILED_PER_MINUTE);
}
function noteFailure(request: Request) {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'local';
  const minute = Math.floor(Date.now() / 60000);
  const e = FAILED.get(ip);
  if (!e || e.minute !== minute) {
    if (FAILED.size > 5000) FAILED.clear();
    FAILED.set(ip, { minute, n: 1 });
  } else e.n += 1;
}

// Path for a same-site redirect. Collapses leading slashes so `//other.site/` cannot
// turn into a redirect to another site.
function sameSitePath(url: URL): string {
  return '/' + url.pathname.replace(/^[/\\]+/, '') + url.search + url.hash;
}

// Content Security Policy: everything the site loads is its own (models, Draco/three.js
// decoders in public/*/vendor, fonts, videos), so only this origin is allowed.
// - 'unsafe-inline' scripts: the theme script, vinext hydration and the static pages use inline scripts.
// - 'wasm-unsafe-eval' and blob: workers: the Draco decoder runs as WebAssembly, in workers.
// - frame-ancestors is left open on purpose so model embeds (?embed=1) keep working;
//   /admin adds frame-ancestors 'none'.
// - Cloudflare Web Analytics (cookie-free, see /privacy and README): its beacon script comes from
//   static.cloudflareinsights.com and reports to cloudflareinsights.com (or this site's /cdn-cgi/rum).
// Before loading anything from another site, add its host here and check every page for CSP errors (see AGENTS.md).
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob: https://static.cloudflareinsights.com",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  "connect-src 'self' data: blob: https://cloudflareinsights.com",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

// Headers added to every response. /admin may not be framed by any site;
// other pages stay embeddable because model embeds (?embed=1) are a feature.
function withSecurityHeaders(response: Response, pathname: string, secure: boolean): Response {
  const res = new Response(response.body, response);
  res.headers.set('X-Content-Type-Options', 'nosniff');
  if (!res.headers.has('Referrer-Policy')) res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'microphone=(), geolocation=(), payment=(), usb=()');
  // One year, this host only (no includeSubDomains, no preload list), so it is easy to back out.
  if (secure) res.headers.set('Strict-Transport-Security', 'max-age=31536000');
  const contentType = res.headers.get('Content-Type') ?? '';
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
  if (contentType.includes('text/html') || isAdmin || response.status === 401) {
    res.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY + (isAdmin ? "; frame-ancestors 'none'" : ''));
  }
  if (isAdmin) res.headers.set('X-Frame-Options', 'DENY');
  return res;
}

// Large downloads (full-resolution models, big print sets) live in Cloudflare R2 because static files
// are limited to 25 MiB each. /files/<name> streams them from the DOWNLOADS bucket, with range
// requests for resumable downloads. Set-up: docs/hosting/r2-downloads.md.
async function serveDownload(request: Request, env: Env, pathname: string): Promise<Response> {
  let key = '';
  try { key = decodeURIComponent(pathname.slice('/files/'.length)); } catch { key = ''; }
  const notFound = () => new Response('File not found.', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  if (!env.DOWNLOADS || !key || key.includes('..')) return notFound();
  const isHead = request.method === 'HEAD';
  const rangeHeader = request.headers.get('Range');
  const object = isHead ? await env.DOWNLOADS.head(key) : await env.DOWNLOADS.get(key, rangeHeader ? { range: request.headers } : undefined);
  if (!object) return notFound();
  const headers = new Headers({
    'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${(key.split('/').pop() ?? 'download').replace(/"/g, '')}"`,
    'Cache-Control': 'public, max-age=86400',
    'Accept-Ranges': 'bytes',
    ETag: object.httpEtag,
  });
  const full = object as R2ObjectLike;
  const range = full.range;
  if (!isHead && rangeHeader && range && range.offset !== undefined && range.length !== undefined) {
    headers.set('Content-Range', `bytes ${range.offset}-${range.offset + range.length - 1}/${object.size}`);
    headers.set('Content-Length', String(range.length));
    return new Response(full.body, { status: 206, headers });
  }
  headers.set('Content-Length', String(object.size));
  return new Response(isHead ? null : full.body, { status: 200, headers });
}

const worker = {
  async fetch(request: Request, workerEnv: Env | undefined, ctx: unknown): Promise<Response> {
    const response = await handle(request, workerEnv, ctx);
    // WebSocket upgrades (local dev) cannot be re-wrapped.
    if (response.status === 101) return response;
    const url = new URL(request.url);
    return withSecurityHeaders(response, url.pathname, url.protocol === 'https:');
  },
};
export default worker;

async function handle(request: Request, workerEnv: Env | undefined, ctx: unknown): Promise<Response> {
    // `vinext start` (Node, used by the Playwright tests) calls this without bindings.
    const env: Env = workerEnv ?? {};
    const isPublicIcon = PUBLIC_ICON_PATHS.has(new URL(request.url).pathname);
    if (env.SITE_PASSWORD && !isPublicIcon && tooManyFailures(request)) {
      return new Response('Too many password attempts. Try again in a minute.', {
        status: 429,
        headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' },
      });
    }
    if (env.SITE_PASSWORD && !isPublicIcon && !isAuthorised(request, env)) {
      if (request.headers.has('Authorization')) noteFailure(request);
      return new Response(GATE_PAGE, {
        status: 401,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // `?lang=en` or `?lang=ja` on any page sets the language cookie, then redirects to the
    // clean URL. This makes language-specific links shareable (see app/i18n/config.ts).
    const url = new URL(request.url);
    const lang = url.searchParams.get('lang');
    if (lang && (LANGS as readonly string[]).includes(lang) && request.method === 'GET') {
      url.searchParams.delete('lang');
      return new Response(null, {
        status: 302,
        headers: {
          Location: sameSitePath(url),
          'Set-Cookie': `${LOCALE_COOKIE}=${lang}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`,
          'Cache-Control': 'no-store',
        },
      });
    }

    if (url.pathname.startsWith('/files/') && (request.method === 'GET' || request.method === 'HEAD')) {
      return serveDownload(request, env, url.pathname);
    }

    // Counters, the model request board, the "used it" gallery and their moderation (worker/store.ts).
    const api = await handleStoreApi(request, env);
    if (api) return api;

    // Static files (images, 3D models) are served from the assets binding.
    if (env.ASSETS && (request.method === 'GET' || request.method === 'HEAD')) {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return asset;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return app.fetch(request, env as any, ctx as any);
}
