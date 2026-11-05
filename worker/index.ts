// Worker entry: optional shared-password gate in front of the vinext app.
// Set the SITE_PASSWORD secret in Cloudflare to turn the gate on.
// Remove the secret to make the site public.
import app from 'vinext/server/app-router-entry';
import { LOCALE_COOKIE, locales } from '../app/i18n/config';

interface Env {
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
  SITE_USERNAME?: string;
  SITE_PASSWORD?: string;
}

const REALM = 'Vivatheca preview';

const LANGS = locales;

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

export default {
  async fetch(request: Request, workerEnv: Env | undefined, ctx: unknown): Promise<Response> {
    // `vinext start` (Node, used by the Playwright tests) calls this without bindings.
    const env: Env = workerEnv ?? {};
    if (env.SITE_PASSWORD && !isAuthorised(request, env)) {
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
          Location: url.pathname + url.search + url.hash,
          'Set-Cookie': `${LOCALE_COOKIE}=${lang}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // Static files (images, 3D models) are served from the assets binding.
    if (env.ASSETS && (request.method === 'GET' || request.method === 'HEAD')) {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return asset;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return app.fetch(request, env as any, ctx as any);
  },
};
