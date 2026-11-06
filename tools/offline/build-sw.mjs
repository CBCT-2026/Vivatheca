// Builds public/sw.js, the service worker behind "Save for offline" (Workbox, MIT).
// The worker is registered only when a visitor presses "Save for offline" on a model page
// (public/share-tools.js), so nothing changes for other visitors. Once registered it keeps
// copies of what this device has loaded, so saved models open without internet:
//   - pages: network first (always fresh when online), cached copy when offline;
//   - scripts, styles and app chunks: cached copy at once, refreshed in the background;
//   - 3D models, pictures, fonts, decoders and data: cached copy first (they change with a new
//     file name or version), up to 300 files for 60 days.
// Nothing leaves the device. Run: pnpm offline:sw
import { generateSW } from 'workbox-build';

const { warnings } = await generateSW({
  swDest: 'public/sw.js',
  // No precache list: files are cached as this device loads them, so sw.js never needs
  // rebuilding when site files change.
  globDirectory: 'public',
  globPatterns: [],
  inlineWorkboxRuntime: true,
  sourcemap: false,
  mode: 'production',
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  // Never cache the admin page or the counters and boards API.
  runtimeCaching: [
    {
      urlPattern: ({ request, url }) => request.mode === 'navigate' && !url.pathname.startsWith('/admin'),
      handler: 'NetworkFirst',
      options: { cacheName: 'vt-pages', networkTimeoutSeconds: 5, expiration: { maxEntries: 80 } },
    },
    {
      urlPattern: ({ url, sameOrigin }) => sameOrigin && !url.pathname.startsWith('/api/') && /\.(js|css|mjs)$/.test(url.pathname),
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'vt-code', expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 60 } },
    },
    {
      urlPattern: ({ url, sameOrigin }) => sameOrigin && /\.(glb|gltf|bin|wasm|webp|png|jpg|jpeg|svg|woff2|json|nvol|vtt|mp4|webm|hdr)$/.test(url.pathname),
      handler: 'CacheFirst',
      options: {
        cacheName: 'vt-files',
        expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 60, purgeOnQuotaError: true },
        cacheableResponse: { statuses: [200] },
        rangeRequests: true,
      },
    },
  ],
});
for (const w of warnings) console.warn(w);
console.log('public/sw.js written');
