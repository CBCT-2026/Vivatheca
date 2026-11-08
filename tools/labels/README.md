# Labels on the 3D models

Every 3D viewer on the site shows labels pinned to the model's parts (a dot, a short line and the part's
name), on by default with a "Labels" button to turn them off. One script does it for all viewers:
`public/model-labels.js`.

- **Static model pages** load `<script src="/model-labels.js"></script>` after `/model-parts.js`.
- **App pages** (`app/models/compare.tsx`, `app/models/averaged-jaw/viewer.tsx`, `app/show/viewer.tsx`) render
  `<AfterHydration src="/model-labels.js" />`.
- **three.js head and neck viewers** set `box.vtLabels = { THREE, camera, root(), parts(), path(), skip?(part) }`
  and fire a `vt-labels` event after each model load (`public/head-neck/case-viewer.js`, `viewer.js`).
- The homepage / `/models/alveolar-bone-graft` viewer and `/oroantral/` keep their own hand-placed labels.

## What a label says

`TERMS` in `public/model-labels.js`: the formal anatomical or clinical term and plain words underneath, in
English, Japanese (with furigana) and Vietnamese (draft), plus the sources for the term (`SOURCES`).
Anatomy comes from Terminologia Anatomica 2 (FIPAT 2019) with the Japanese terms from the Japanese
Association of Anatomists' 解剖学用語 (13th ed.); disease and treatment terms come from the same
classification or glossary the model page already cites (WHO 2022, AAE glossary, GPT-10, 2017 World Workshop,
DC/TMD, ACPA, MeSH). Every page lists the terms it shows and their sources under the viewer ("Where the label
names come from").

`SETS` says which parts get a label on which GLB (by path; the first match wins). The order of a set is
the priority when labels overlap.

## Where a label sits

`node tools/labels/anchors.mjs` reads every GLB under `public/` and writes `public/model-labels/<same path>.json`:
for each node and material, up to three spots on its surface with their normals, and for 48 view directions
whether each spot can be seen (`-1` faces away, `0` clear, else a bitmask of the materials in the way). The
script shows a label at the first of its spots that can be seen from the current camera; a spot behind
another part shows only when the page hides that part or makes it see-through (x-ray, gum off, cut view).
Spots are placed by the script from the model's shape, not by a clinician.

**After changing or adding a GLB, run `node tools/labels/anchors.mjs` and commit `public/model-labels/`.**
For a new model page, add its parts to `SETS` (and any new words to `TERMS`, with sources) and load the script.
