# GLB tools

Shared steps for every web model on the site.

| Script | What it does | Run |
| --- | --- | --- |
| `finish.mjs` | Last step of a model build: dedup, prune, weld, Draco-compress, then validate. Used by every `tools/*/finish*.py` and `finish.sh`. | `node tools/glb/finish.mjs build/*.glb --out public/<model>/models` |
| `validate.mjs` | Khronos glTF-Validator on every GLB under `public/`, with a 6 MB limit. Runs in CI (`models-and-licences.yml`). | `pnpm check:glb` |

Both use the glTF-Transform and validator versions pinned in `package.json`, so a build no longer fetches `@gltf-transform/cli` through `npx` at run time.

## Why Draco, not meshopt (measured 6 Nov 2026)

`gltf-transform optimize` was run on five current models with `--compress draco` and `--compress meshopt` (weld and prune on, no simplification or texture changes):

| Model | Current (Draco) | Draco again | meshopt |
| --- | --- | --- | --- |
| orthognathic class3-after | 1.26 MB | 1.27 MB | 2.37 MB |
| cracked-tooth composite-cut | 1.84 MB | 1.84 MB | 0.56 MB |
| head-neck acc | 0.29 MB | 0.22 MB | 0.39 MB |
| abg-3-long-term | 0.46 MB | 0.46 MB | 0.71 MB |
| periodontitis stage-3 | 0.31 MB | 0.31 MB | 0.58 MB |

Draco is smaller on four of five, every viewer on the site already ships the Draco decoder, and re-encoding an already compressed file is lossy for no gain, so the current files are left as they are. The cracked-tooth cut models are the one case where meshopt (or a lower Draco normal quantisation) would help; revisit if a model goes over the 6 MB limit.
