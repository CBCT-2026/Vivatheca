# Large downloads from Cloudflare R2

Cloudflare Workers serve each static file up to **25 MiB** (Cloudflare Workers limits, "Individual
Static Asset file size", checked 6 Nov 2026). Full-resolution models (the head and neck case models are
about 100 MB each) and large print sets must therefore come from **R2**, Cloudflare's file storage
(free tier 10 GB, no fees for downloads).

The Worker already serves `https://vivatheca.com/files/<name>` from an R2 bucket bound as `DOWNLOADS`
(`worker/index.ts`, `serveDownload`). It sits behind the site password like every other page,
supports resumable (range) downloads and sends the file as an attachment. Until the bucket is
bound, `/files/...` answers 404.

## One-time set-up (Luke, in the Cloudflare dashboard)

1. Cloudflare dashboard → **R2 Object Storage** → **Create bucket** → name `vivatheca-downloads`,
   location Automatic. (R2 may ask to add a payment method even for the free tier.)
2. In `vite.config.ts`, uncomment the `r2_buckets` line in `localBindingConfig`, commit and merge.
   Deploying with that line but without the bucket fails, so do step 1 first.

## Adding a file

Upload in the dashboard (bucket → **Upload**), or with Wrangler:

```sh
npx wrangler r2 object put vivatheca-downloads/head-neck/case_scc_full.glb \
  --file case_scc.glb --content-type model/gltf-binary --remote
```

Then link to `/files/head-neck/case_scc_full.glb` from the model page, with its size, licence
(CC BY-SA 4.0), review status, the model disclaimer and a link to `/disclaimer`, as for every download.
Record the file in the model's entry in `app/models/catalogue.ts` like other files.
