// Server route for the material builder. Calls Claude with the platform's own API key,
// stored as the ANTHROPIC_API_KEY Worker secret. Without the key, GET reports
// { enabled: false } and the builder stays in free copy-prompt mode.
import Anthropic from '@anthropic-ai/sdk';
import { buildRefinePrompt, buildUserPrompt, refineActions, systemPrompt, type Brief, type RefineAction } from '../../create/briefs';
import { findPossiblePatientDetails } from '../../create/checker';

const MODEL = 'claude-opus-5-5';
const MAX_INPUT_CHARS = 30_000;

interface BuilderEnv {
  ANTHROPIC_API_KEY?: string;
  AI_DAILY_LIMIT_PER_VISITOR?: string;
}

// Per-visitor daily cap. Counts live in this Worker instance only, so this is a
// brake, not a guarantee: the hard limit is the spend limit in the Anthropic Console.
const usage = new Map<string, { day: string; count: number }>();

function underCap(visitor: string, limit: number): boolean {
  const day = new Date().toISOString().slice(0, 10);
  const entry = usage.get(visitor);
  if (!entry || entry.day !== day) {
    usage.set(visitor, { day, count: 1 });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}

// On Cloudflare the key comes from the Worker's bindings. Under `vinext start`
// (Node, used for local tests) that module does not exist, so fall back to process.env.
async function config(): Promise<BuilderEnv> {
  try {
    const { env } = await import('cloudflare:workers');
    return env as unknown as BuilderEnv;
  } catch {
    return (globalThis.process?.env ?? {}) as BuilderEnv;
  }
}

export async function GET(): Promise<Response> {
  return json({ enabled: Boolean((await config()).ANTHROPIC_API_KEY), model: MODEL });
}

interface RequestBody {
  action?: 'draft' | RefineAction;
  brief?: Brief;
  draft?: string;
  findings?: string[];
}

export async function POST(request: Request): Promise<Response> {
  const { ANTHROPIC_API_KEY, AI_DAILY_LIMIT_PER_VISITOR } = await config();
  if (!ANTHROPIC_API_KEY) return json({ error: 'AI drafting is not set up yet. Use the copy-prompt option instead.' }, 503);

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  let prompt: string;
  if (body.action === 'draft' && body.brief) {
    prompt = buildUserPrompt(body.brief);
  } else if (body.action && body.action in refineActions && typeof body.draft === 'string') {
    prompt = buildRefinePrompt(body.action as RefineAction, body.draft, (body.findings ?? []).slice(0, 40).map(String));
  } else {
    return json({ error: 'Invalid request.' }, 400);
  }
  if (prompt.length > MAX_INPUT_CHARS) return json({ error: 'The text is too long. Shorten it and try again.' }, 413);

  const details = findPossiblePatientDetails(prompt);
  if (details.length) {
    return json({ error: `This looks like it may contain patient details (${details.join(', ')}). Remove them and try again.` }, 422);
  }

  const visitor = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const limit = Number(AI_DAILY_LIMIT_PER_VISITOR) || 30;
  if (!underCap(visitor, limit)) {
    return json({ error: `The daily limit of ${limit} AI requests has been reached. Use the copy-prompt option, or try again tomorrow.` }, 429);
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const response = client.beta.messages.stream({
          model: MODEL,
          max_tokens: 16000,
          output_config: { effort: 'medium' },
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
          system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
          messages: [{ role: 'user', content: prompt }],
        });
        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await response.finalMessage();
        if (final.stop_reason === 'refusal') {
          controller.enqueue(encoder.encode('\n\n[The AI declined this request. Try rewording the brief, or use the copy-prompt option.]'));
        } else if (final.stop_reason === 'max_tokens') {
          controller.enqueue(encoder.encode('\n\n[The draft was cut off because it was too long. Ask for a shorter material.]'));
        }
      } catch (error) {
        let message = 'The AI request failed. Try again, or use the copy-prompt option.';
        if (error instanceof Anthropic.RateLimitError) message = 'The AI service is busy. Try again in a minute.';
        else if (error instanceof Anthropic.AuthenticationError) message = 'The AI key is not valid. Ask the platform owner to check it.';
        else if (error instanceof Anthropic.BadRequestError) message = 'The AI request was rejected. This can happen when the platform\'s AI credits run out. Use the copy-prompt option for now.';
        controller.enqueue(encoder.encode(`\n\n[${message}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
}
