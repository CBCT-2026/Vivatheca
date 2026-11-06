# Labelled, zoomable clinical images

Any clinical image can get an "Explore with labels" button that opens a zoomable viewer with numbered
labels that can be switched off. It is built on [OpenSeadragon](https://github.com/openseadragon/openseadragon)
(BSD-3) and [Annotorious](https://github.com/annotorious/annotorious) (BSD-3), vendored in `public/vendor/`,
and loaded only when a visitor opens the viewer.

## Add labels to an image

1. Put `<name>.labels.json` beside the image, e.g. `public/images/clinical/head-neck/scc/scc-after-fibula.labels.json`:

```json
{ "labels": [
  { "id": "ramus-segment", "rect": [50, 105, 70, 190],
    "en": "Fibula segment up the right side of the jaw.",
    "ja": "{右|みぎ}のあごの{縦|たて}の{部分|ぶぶん}に{入|はい}ったひ{骨|こつ}。",
    "source": "Figure 3A legend" } ] }
```

   `rect` is `[x, y, width, height]` in image pixels. `ja` uses the site's `{漢字|かんじ}` furigana markup.
2. Head and neck pages: run `python3 tools/head-neck/pages.py`; the generator adds `data-labels` when the JSON exists.
   Other static pages: add `data-labels="/images/.../name.labels.json"` to the `<img>`, plus
   `<link rel="stylesheet" href="/clinical-zoom.css">` and `<script src="/clinical-zoom.js"></script>`.

## Rules (same as the rest of the site)

- Every label must come from the source figure legend or the cited article, and `source` says which. No diagnosis
  or anatomy the authors did not state.
- The image licence shown under the figure covers the zoom view too; labels are Vivatheca text (CC BY-SA 4.0).
- `tests/clinical-labels.spec.ts` checks the SCC page in English and Japanese.
