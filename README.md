# Vivatheca

Free, browser-based 3D medical models for clearer clinical conversations. Live at https://vivatheca.com.

## Run locally

```sh
pnpm install
pnpm dev        # development server
pnpm build      # production build into dist/
npx wrangler dev   # serve the production build locally (after pnpm build)
```

## Deploy (Cloudflare Workers, connected to this GitHub repo)

In the Cloudflare dashboard: **Workers & Pages → Create → Import a repository → CBCT-2026/Vivatheca**, then use:

| Setting | Value |
| --- | --- |
| Project name | `vivatheca` |
| Production branch | `main` |
| Build command | `pnpm build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` |
| Environment variable | `NODE_VERSION` = `22` |

Every push to `main` then redeploys automatically. Add `vivatheca.com` under the project's **Settings → Domains & Routes → Custom domain**.

## Password protection

The site can be locked behind one shared username and password (HTTP Basic Auth), handled in `worker/index.ts`.

- **Turn on:** in Cloudflare, open the `vivatheca` Worker → **Settings → Variables and Secrets → Add**, type **Secret**, name `SITE_PASSWORD`, value = your password. Deploy.
- **Username:** `vivatheca` (change it by adding a `SITE_USERNAME` variable).
- **Turn off (make public):** delete the `SITE_PASSWORD` secret.

## Patient information builder (`/create`)

Clinicians draft, check and export patient education materials that match a Vivatheca model. Code: `app/create/` (page, brief and prompt text, in-browser checker) and `app/api/generate/route.ts` (server call to Claude).

- **Free mode (default):** with no API key, the page shows the full prompt to copy into any AI chat, and the checker scores whatever is pasted back.
- **One-click AI drafts:** add a Cloudflare secret `ANTHROPIC_API_KEY` (Workers & Pages → vivatheca → Settings → Variables and Secrets → Add → type *Secret*). The key comes from https://console.anthropic.com → API keys; usage is billed to that Anthropic account's prepaid credits. Set a monthly spend limit there (Settings → Limits). Model: `claude-opus-5-5`.
- Optional variable `AI_DAILY_LIMIT_PER_VISITOR` (default 30). It is counted per Worker instance, so it is a brake, not a hard cap; the Console spend limit is the hard cap.
- Checks are a TypeScript port of [patient-education-toolkit](https://github.com/CBCT-2026/patient-education-toolkit) (MIT). Exports carry a red "DRAFT: AI-assisted, not clinically verified" notice until the clinician ticks every item of the check list. No briefs or drafts are stored on the server.

More project context: `PRODUCT.md`, `DESIGN.md`, `AGENTS.md`, `docs/`.

## Visitor analytics (Cloudflare Web Analytics)

The privacy page says the site uses Cloudflare Web Analytics (cookie-free). To switch it on, open the Cloudflare dashboard → **Analytics & Logs → Web Analytics → Add a site**, choose **vivatheca.com**, and pick **Automatic setup** (enable JS snippet installation). No code change is needed because the domain is proxied by Cloudflare; the Content Security Policy in `worker/index.ts` already allows the beacon (`static.cloudflareinsights.com`, `cloudflareinsights.com`). Check the Web Analytics dashboard shows visits a day after switching it on.

## Contributors

Vivatheca credits everyone who helps, by role, using the [all-contributors](https://allcontributors.org) specification (`.all-contributorsrc`). Roles used here: clinical review (`review`), translation (`translation`), clinical images (`content`), 3D models (`design`), code (`code`), ideas (`ideas`). Clinical reviewers are listed only with the details they agree to share (see AGENTS.md, Security & Clinical Content).

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| Contributor | Roles |
| --- | --- |
| Luke Seifert ([CBCT-2026](https://github.com/CBCT-2026)) | 3D models, code, content, ideas |
<!-- ALL-CONTRIBUTORS-LIST:END -->

To add someone, comment on a pull request or issue: `@all-contributors please add <github-name> for review` (needs the free [all-contributors app](https://github.com/apps/allcontributors) installed on this repository), or edit `.all-contributorsrc` and this table by hand.
