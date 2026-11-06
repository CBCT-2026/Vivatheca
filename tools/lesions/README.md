# Lesion shapes (signed distance functions)

`sdf_lesion.py` makes smooth cyst and tumour shapes for models: one smooth ellipsoid
(`unilocular`), or a main body with smaller locules blended onto it (`multilocular`, the
"soap bubble" outline). The finished shape is scaled to the sourced length, width and height and
exported as STL + GLB with a report. Subtract it from bone in the model's own build script
(manifold3d helpers from the head and neck tools).

Idea from [fogleman/sdf](https://github.com/fogleman/sdf) (MIT); written with numpy and scikit-image
so it needs only the libraries the other model tools already use (`numpy`, `scikit-image`, `trimesh`).

## Evidence rule

Every size in the spec needs a `source` (author, year, title, DOI or link) from published research,
for example a case report with CT measurements or a case series. A value without a source must be
marked `"estimate": true` with a `reason`; the tool then refuses to write under `public/` and the
report says "UNVERIFIED". `blend_mm` (how soft the joins are) is a drawing choice and the report says
so. Say on the model page where the shape simplifies the published description.

`examples/demo-multilocular.json` shows the format only. Every value in it is a demo estimate.

```sh
python3 tools/lesions/sdf_lesion.py tools/lesions/examples/demo-multilocular.json /tmp/lesion
```
