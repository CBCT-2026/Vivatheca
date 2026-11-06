import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === 'seatbelt';

const localBindingConfig = {
  name: 'vivatheca',
  main: './worker/index.ts',
  compatibility_flags: ['nodejs_compat'],
  // Run the Worker before static files so the optional password gate covers everything.
  assets: { binding: 'ASSETS', run_worker_first: true },
  // Shared store for usage counters, the model request board and the "used it" gallery
  // (worker/store.ts). SQLite-backed Durable Objects need no set-up in the Cloudflare account.
  durable_objects: { bindings: [{ name: 'STORE', class_name: 'VivathecaStore' }] },
  migrations: [{ tag: 'v1', new_sqlite_classes: ['VivathecaStore'] }],
  // Large downloads (over the 25 MiB static-file limit) are served from Cloudflare R2 at /files/<name>
  // (worker/index.ts). Create the bucket first (docs/hosting/r2-downloads.md), then uncomment this:
  // deploying with the binding but no bucket fails.
  // r2_buckets: [{ binding: 'DOWNLOADS', bucket_name: 'vivatheca-downloads' }],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= 'false';
  process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
  process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import('@cloudflare/vite-plugin');

  return {
    css: { postcss: { plugins: [tailwindcss()] } },
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
        config: localBindingConfig,
      }),
    ],
  };
});
