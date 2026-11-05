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

More project context: `PRODUCT.md`, `DESIGN.md`, `AGENTS.md`, `docs/`.
