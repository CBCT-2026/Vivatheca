// Small shared store for the features that need to remember things between visitors:
// - usage counters per model (views, downloads, shared links, pictures, embeds, tours, prints);
// - the model request board (suggestions and votes);
// - the "used it" gallery (how clinicians and teachers used a model);
// - the clinician survey (/survey): anonymous ratings, read only at /admin as a summary and CSV.
// It is one SQLite-backed Durable Object (no account set-up needed: Cloudflare creates it from the
// migration in vite.config.ts). New suggestions and gallery posts wait for approval at /admin.
// No IP addresses, names of patients or e-mail addresses are stored. Voters are told apart by a
// random cookie (vt-voter) that is stored only as a hash.
import { catalogue } from '../app/models/catalogue';
import { seededRequests } from '../app/requests/seed';

export interface StoreEnv {
  STORE?: DurableObjectNamespace;
  ADMIN_TOKEN?: string;
}

export const COUNT_KINDS = ['view', 'download', 'share', 'image', 'embed', 'tour', 'print', 'steps', 'credit'] as const;
type CountKind = (typeof COUNT_KINDS)[number];
const MODELS = new Set(catalogue.map((m) => m.slug));
const SEEDS = new Set<string>(seededRequests.map((r) => r.id));

export const SURVEY_ITEMS = ['accurate', 'normal', 'use', 'sources', 'easy'] as const;
type SurveyAnswer = { role: string; country: string; model: string; accurate: number; normal: number; use: number; sources: number; easy: number; better: string; next: string; lang: string };

type Pending = { kind: 'request' | 'used'; id: string; created: string; fields: Record<string, string> };

// A plain class with fetch() (not `extends DurableObject`), so this file has no static import of
// 'cloudflare:workers' and still loads under `vinext start` in Node, where the tests run without bindings.
export class VivathecaStore {
  sql: SqlStorage;
  constructor(ctx: DurableObjectState) {
    this.sql = ctx.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS counts (model TEXT, kind TEXT, day TEXT, n INTEGER, PRIMARY KEY (model, kind, day));
      CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, title TEXT, detail TEXT, specialty TEXT, role TEXT, lang TEXT, status TEXT, created TEXT);
      CREATE TABLE IF NOT EXISTS votes (request TEXT, voter TEXT, PRIMARY KEY (request, voter));
      CREATE TABLE IF NOT EXISTS used (id TEXT PRIMARY KEY, model TEXT, role TEXT, how TEXT, link TEXT, name TEXT, country TEXT, lang TEXT, status TEXT, created TEXT);
      CREATE TABLE IF NOT EXISTS survey (id TEXT PRIMARY KEY, role TEXT, country TEXT, model TEXT, accurate INTEGER, normal INTEGER, use INTEGER, sources INTEGER, easy INTEGER, better TEXT, next TEXT, lang TEXT, created TEXT);`);
  }

  hit(model: string, kind: CountKind) {
    const day = new Date().toISOString().slice(0, 10);
    this.sql.exec('INSERT INTO counts (model, kind, day, n) VALUES (?, ?, ?, 1) ON CONFLICT (model, kind, day) DO UPDATE SET n = n + 1', model, kind, day);
  }

  stats() {
    const rows = this.sql.exec<{ model: string; kind: string; n: number }>('SELECT model, kind, SUM(n) AS n FROM counts GROUP BY model, kind').toArray();
    const first = this.sql.exec<{ day: string | null }>('SELECT MIN(day) AS day FROM counts').toArray()[0]?.day ?? null;
    const models: Record<string, Record<string, number>> = {};
    rows.forEach((r) => { (models[r.model] ??= {})[r.kind] = Number(r.n); });
    return { since: first, models };
  }

  requests(voter: string) {
    const votes = this.sql.exec<{ request: string; n: number }>('SELECT request, COUNT(*) AS n FROM votes GROUP BY request').toArray();
    const mine = new Set(this.sql.exec<{ request: string }>('SELECT request FROM votes WHERE voter = ?', voter).toArray().map((r) => r.request));
    const count = new Map(votes.map((v) => [v.request, Number(v.n)]));
    const submitted = this.sql.exec<{ id: string; title: string; detail: string; specialty: string; created: string }>("SELECT id, title, detail, specialty, created FROM requests WHERE status = 'approved' ORDER BY created").toArray();
    return {
      seeded: seededRequests.map((r) => ({ id: r.id, votes: count.get(r.id) ?? 0, voted: mine.has(r.id) })),
      submitted: submitted.map((r) => ({ ...r, votes: count.get(r.id) ?? 0, voted: mine.has(r.id) })),
    };
  }

  vote(id: string, voter: string) {
    const known = SEEDS.has(id) || this.sql.exec("SELECT 1 FROM requests WHERE id = ? AND status = 'approved'", id).toArray().length > 0;
    if (!known) return false;
    this.sql.exec('INSERT OR IGNORE INTO votes (request, voter) VALUES (?, ?)', id, voter);
    return true;
  }

  suggest(f: { title: string; detail: string; specialty: string; role: string; lang: string }) {
    const id = 'r-' + crypto.randomUUID().slice(0, 8);
    this.sql.exec("INSERT INTO requests (id, title, detail, specialty, role, lang, status, created) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)", id, f.title, f.detail, f.specialty, f.role, f.lang, new Date().toISOString());
    return id;
  }

  used(model: string | null) {
    const rows = model
      ? this.sql.exec("SELECT id, model, role, how, link, name, country, created FROM used WHERE status = 'approved' AND model = ? ORDER BY created DESC", model).toArray()
      : this.sql.exec("SELECT id, model, role, how, link, name, country, created FROM used WHERE status = 'approved' ORDER BY created DESC").toArray();
    return { items: rows };
  }

  share(f: { model: string; role: string; how: string; link: string; name: string; country: string; lang: string }) {
    const id = 'u-' + crypto.randomUUID().slice(0, 8);
    this.sql.exec("INSERT INTO used (id, model, role, how, link, name, country, lang, status, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)", id, f.model, f.role, f.how, f.link, f.name, f.country, f.lang, new Date().toISOString());
    return id;
  }

  answer(f: SurveyAnswer) {
    const id = 's-' + crypto.randomUUID().slice(0, 8);
    this.sql.exec('INSERT INTO survey (id, role, country, model, accurate, normal, use, sources, easy, better, next, lang, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      id, f.role, f.country, f.model, f.accurate, f.normal, f.use, f.sources, f.easy, f.better, f.next, f.lang, new Date().toISOString());
    return id;
  }

  survey() {
    return { rows: this.sql.exec<Record<string, string | number>>('SELECT * FROM survey ORDER BY created').toArray() };
  }

  removeAnswer(id: string) {
    this.sql.exec('DELETE FROM survey WHERE id = ?', id);
    return true;
  }

  pending(): Pending[] {
    const req = this.sql.exec<Record<string, string>>("SELECT * FROM requests WHERE status = 'pending' ORDER BY created").toArray();
    const use = this.sql.exec<Record<string, string>>("SELECT * FROM used WHERE status = 'pending' ORDER BY created").toArray();
    return [
      ...req.map((r) => ({ kind: 'request' as const, id: r.id, created: r.created, fields: r })),
      ...use.map((r) => ({ kind: 'used' as const, id: r.id, created: r.created, fields: r })),
    ];
  }

  moderate(kind: 'request' | 'used', id: string, approve: boolean) {
    const table = kind === 'request' ? 'requests' : 'used';
    if (approve) this.sql.exec(`UPDATE ${table} SET status = 'approved' WHERE id = ?`, id);
    else this.sql.exec(`DELETE FROM ${table} WHERE id = ?`, id);
    if (!approve && kind === 'request') this.sql.exec('DELETE FROM votes WHERE request = ?', id);
    return true;
  }

  // Internal calls from the Worker: POST /<method> with a JSON array of arguments.
  async fetch(request: Request) {
    const op = new URL(request.url).pathname.slice(1);
    const args = (await request.json()) as unknown[];
    const ops: Record<string, (...a: never[]) => unknown> = {
      hit: this.hit, stats: this.stats, requests: this.requests, vote: this.vote, suggest: this.suggest,
      used: this.used, share: this.share, pending: this.pending, moderate: this.moderate,
      answer: this.answer, survey: this.survey, removeAnswer: this.removeAnswer,
    };
    const fn = ops[op];
    if (!fn) return new Response('not found', { status: 404 });
    return Response.json({ result: (fn as (...a: unknown[]) => unknown).apply(this, args) ?? null });
  }
}

type StoreCall = {
  hit(model: string, kind: CountKind): Promise<void>;
  stats(): Promise<ReturnType<VivathecaStore['stats']>>;
  requests(voter: string): Promise<ReturnType<VivathecaStore['requests']>>;
  vote(id: string, voter: string): Promise<boolean>;
  suggest(f: Parameters<VivathecaStore['suggest']>[0]): Promise<string>;
  used(model: string | null): Promise<ReturnType<VivathecaStore['used']>>;
  share(f: Parameters<VivathecaStore['share']>[0]): Promise<string>;
  pending(): Promise<Pending[]>;
  moderate(kind: 'request' | 'used', id: string, approve: boolean): Promise<boolean>;
  answer(f: SurveyAnswer): Promise<string>;
  survey(): Promise<ReturnType<VivathecaStore['survey']>>;
  removeAnswer(id: string): Promise<boolean>;
};

function client(ns: DurableObjectNamespace): StoreCall {
  const stub = ns.get(ns.idFromName('main'));
  return new Proxy({}, {
    get: (_, op: string) => async (...args: unknown[]) => {
      const res = await stub.fetch('https://store/' + op, { method: 'POST', body: JSON.stringify(args) });
      if (!res.ok) throw new Error('store ' + op + ' ' + res.status);
      return ((await res.json()) as { result: unknown }).result;
    },
  }) as StoreCall;
}

// ---- HTTP side (runs in the Worker, in front of the app) ----

const LIMIT = new Map<string, { minute: number; n: number }>();
// A brake on floods from one address, kept in memory only (never stored).
function allowed(request: Request, perMinute: number) {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'local';
  const minute = Math.floor(Date.now() / 60000);
  const e = LIMIT.get(ip);
  if (!e || e.minute !== minute) { LIMIT.set(ip, { minute, n: 1 }); if (LIMIT.size > 5000) LIMIT.clear(); return true; }
  e.n += 1;
  return e.n <= perMinute;
}

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra } });
}

// Compares in constant time for equal lengths, so response timing does not reveal the token.
function sameSecret(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max) : '');

async function hash(text: string) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('vivatheca-voter:' + text));
  return [...new Uint8Array(d)].slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function voterCookie(request: Request) {
  const m = (request.headers.get('Cookie') ?? '').match(/(?:^|;\s*)vt-voter=([a-f0-9-]{36})/);
  return m ? { id: m[1], set: '' } : (() => { const id = crypto.randomUUID(); return { id, set: `vt-voter=${id}; Path=/; Max-Age=63072000; SameSite=Lax; Secure; HttpOnly` }; })();
}

async function body(request: Request): Promise<Record<string, unknown>> {
  try {
    const text = await request.text();
    if (text.length > 8000) return {};
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch { return {}; }
}

// Free-text posts with a link or patient-looking details are refused; reviewers still read every post.
const PATIENT_HINT = /\b(\d{2}[/.-]\d{2}[/.-]\d{2,4}|medicare|mrn|patient name|dob)\b/i;

function safeLink(v: string) {
  if (!v) return '';
  try { const u = new URL(v); return u.protocol === 'https:' ? u.toString().slice(0, 300) : ''; } catch { return ''; }
}

export async function handleStoreApi(request: Request, env: StoreEnv): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;
  if (!path.startsWith('/api/stats') && !path.startsWith('/api/requests') && !path.startsWith('/api/used') && !path.startsWith('/api/admin') && !path.startsWith('/api/survey')) return null;
  if (!env.STORE) return json({ error: 'unavailable' }, 503);
  const store = client(env.STORE);
  const method = request.method;
  // Writes must come from Vivatheca's own pages.
  if (method === 'POST') {
    const origin = request.headers.get('Origin');
    if (origin && origin !== url.origin) return json({ error: 'origin' }, 403);
  }

  if (path === '/api/stats' && method === 'GET') return json(await store.stats());
  if (path === '/api/stats/hit' && method === 'POST') {
    if (!allowed(request, 120)) return json({ ok: false }, 429);
    const b = await body(request);
    const model = clip(b.model, 60), kind = clip(b.kind, 20) as CountKind;
    if (!MODELS.has(model) || !COUNT_KINDS.includes(kind)) return json({ error: 'bad' }, 400);
    await store.hit(model, kind);
    return json({ ok: true });
  }

  if (path === '/api/requests' && method === 'GET') {
    const voter = voterCookie(request);
    const data = await store.requests(await hash(voter.id));
    return json(data, 200, voter.set ? { 'Set-Cookie': voter.set } : {});
  }
  if (path === '/api/requests/vote' && method === 'POST') {
    if (!allowed(request, 30)) return json({ ok: false }, 429);
    const voter = voterCookie(request);
    const b = await body(request);
    const ok = await store.vote(clip(b.id, 40), await hash(voter.id));
    return json({ ok }, ok ? 200 : 404, voter.set ? { 'Set-Cookie': voter.set } : {});
  }
  if (path === '/api/requests' && method === 'POST') {
    if (!allowed(request, 5)) return json({ ok: false }, 429);
    const b = await body(request);
    if (clip(b.website, 10)) return json({ ok: true }); // honeypot: bots fill every field
    const f = { title: clip(b.title, 120), detail: clip(b.detail, 1000), specialty: clip(b.specialty, 80), role: clip(b.role, 80), lang: clip(b.lang, 5) };
    if (f.title.length < 4) return json({ error: 'title' }, 400);
    if (PATIENT_HINT.test(f.title + ' ' + f.detail)) return json({ error: 'patient' }, 400);
    return json({ ok: true, id: await store.suggest(f) });
  }

  if (path === '/api/used' && method === 'GET') {
    const model = url.searchParams.get('model');
    return json(await store.used(model && MODELS.has(model) ? model : null));
  }
  if (path === '/api/used' && method === 'POST') {
    if (!allowed(request, 5)) return json({ ok: false }, 429);
    const b = await body(request);
    if (clip(b.website, 10)) return json({ ok: true });
    if (b.noPatient !== true) return json({ error: 'consent' }, 400);
    const f = { model: clip(b.model, 60), role: clip(b.role, 80), how: clip(b.how, 1200), link: safeLink(clip(b.link, 300)), name: clip(b.name, 80), country: clip(b.country, 60), lang: clip(b.lang, 5) };
    if (!MODELS.has(f.model) || f.how.length < 10) return json({ error: 'fields' }, 400);
    if (PATIENT_HINT.test(f.how)) return json({ error: 'patient' }, 400);
    return json({ ok: true, id: await store.share(f) });
  }

  if (path === '/api/survey' && method === 'POST') {
    if (!allowed(request, 5)) return json({ ok: false }, 429);
    const b = await body(request);
    if (clip(b.website, 10)) return json({ ok: true }); // honeypot
    if (b.noPatient !== true || b.consent !== true) return json({ error: 'consent' }, 400);
    const score = (v: unknown) => (Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 5 ? (v as number) : 0);
    const model = clip(b.model, 60);
    const f: SurveyAnswer = {
      role: clip(b.role, 80), country: clip(b.country, 60), model: MODELS.has(model) ? model : '',
      accurate: score(b.accurate), normal: score(b.normal), use: score(b.use), sources: score(b.sources), easy: score(b.easy),
      better: clip(b.better, 1000), next: clip(b.next, 300), lang: clip(b.lang, 8),
    };
    if (!f.role) return json({ error: 'role' }, 400);
    if (SURVEY_ITEMS.some((k) => !f[k])) return json({ error: 'items' }, 400);
    if (PATIENT_HINT.test(f.better + ' ' + f.next)) return json({ error: 'patient' }, 400);
    return json({ ok: true, id: await store.answer(f) });
  }

  if (path.startsWith('/api/admin')) {
    if (!env.ADMIN_TOKEN) return json({ error: 'admin-off' }, 503);
    // The token comes in X-Admin-Token, because the site password gate (worker/index.ts) uses the
    // Authorization header while it is on. A Bearer header still works when the gate is off.
    const bearer = request.headers.get('Authorization') ?? '';
    const token = request.headers.get('X-Admin-Token') ?? (bearer.startsWith('Bearer ') ? bearer.slice(7) : '');
    if (!allowed(request, 30) || !sameSecret(token, env.ADMIN_TOKEN)) return json({ error: 'auth' }, 401);
    if (path === '/api/admin/pending' && method === 'GET') return json({ items: await store.pending() });
    if (path === '/api/admin/survey' && method === 'GET') return json(await store.survey());
    if (path === '/api/admin/survey/remove' && method === 'POST') {
      const b = await body(request);
      await store.removeAnswer(clip(b.id, 40));
      return json({ ok: true });
    }
    if (path === '/api/admin/moderate' && method === 'POST') {
      const b = await body(request);
      const kind = b.kind === 'request' ? 'request' : b.kind === 'used' ? 'used' : null;
      if (!kind) return json({ error: 'bad' }, 400);
      await store.moderate(kind, clip(b.id, 40), b.action === 'approve');
      return json({ ok: true });
    }
  }
  return json({ error: 'not found' }, 404);
}
