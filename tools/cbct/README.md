# Virtual CBCT (tools/cbct)

`voxelize.py` turns a site GLB model into a NIfTI volume with CT-like values per part, for the slice viewer at `/learn/slices` (NiiVue, `public/vendor/niivue/`, BSD-2-Clause). The scans are of the **models**, never of a person.

```
pnpm slices:build      # rebuilds public/slices/*.nvol (see package.json for the exact commands)
```

`*.nvol` files are ordinary gzipped NIfTI (`.nii.gz`) renamed, because the static server treats `*.gz` as a precompressed copy of another file and refuses to serve it; the viewer passes the real name to NiiVue. Rename to `.nii.gz` to open one in 3D Slicer or ITK-SNAP.

Values per tissue are in `DEFAULT_HU` (air −1000, soft tissue 40–60, nerve 150, bone 1100–1200, teeth 2200, titanium 3000); override with `--hu lesion=80`. Parts are matched by node name (`--only`, `--skip`). Output is RAS in millimetres; glTF is Y-up so axes are remapped in the script.

Volumes are CC BY-SA 4.0 like the models they come from (REUSE.toml covers `public/**/*.nvol`).
