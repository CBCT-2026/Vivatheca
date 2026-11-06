// Worker entry: optional shared-password gate in front of the vinext app.
// Set the SITE_PASSWORD secret in Cloudflare to turn the gate on.
// Remove the secret to make the site public.
import app from 'vinext/server/app-router-entry';
import { LOCALE_COOKIE, locales } from '../app/i18n/config';
import { handleStoreApi, type StoreEnv } from './store';

// The Durable Object class must be exported from the Worker entry (binding STORE in vite.config.ts).
export { VivathecaStore } from './store';

interface Env extends StoreEnv {
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
  SITE_USERNAME?: string;
  SITE_PASSWORD?: string;
}

const REALM = 'Vivatheca preview';

const LANGS = locales;

// Browser tab icons stay public so the tab shows the Vivatheca logo even on the password prompt.
const PUBLIC_ICON_PATHS = new Set([
  '/favicon.ico',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/apple-touch-icon-precomposed.png',
  '/icon-192.png',
  '/icon-512.png',
  '/site.webmanifest',
]);

export function safeEqual(a: string, b: string): boolean {
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
export function sameSitePath(url: URL): string {
  return '/' + url.pathname.replace(/^[/\\]+/, '') + url.search + url.hash;
}

// Low-risk headers added to every response. /admin may not be framed by any site;
// other pages stay embeddable because model embeds (?embed=1) are a feature.
function withSecurityHeaders(response: Response, pathname: string): Response {
  const res = new Response(response.body, response);
  res.headers.set('X-Content-Type-Options', 'nosniff');
  if (!res.headers.has('Referrer-Policy')) res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('Content-Security-Policy', "frame-ancestors 'none'");
  }
  return res;
}

const worker = {
  async fetch(request: Request, workerEnv: Env | undefined, ctx: unknown): Promise<Response> {
    const response = await handle(request, workerEnv, ctx);
    // WebSocket upgrades (local dev) cannot be re-wrapped.
    if (response.status === 101) return response;
    return withSecurityHeaders(response, new URL(request.url).pathname);
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
      return new Response('This preview of Vivatheca is password protected.', {
        status: 401,
        headers: {
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
