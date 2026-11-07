# Averaged jaw from open CT scans

Makes `/models/averaged-jaw`: the mean mandible, teeth and skull base of several de-identified public CT scans,
so the site has a "typical adult jaw" that is no one person. Method, sources and limits are on the page and in
`docs/averaged-anatomy.md`.

## Pipeline

1. **Fetch** CC BY (not NC) CT series that cover the whole mandible from the NCI Imaging Data Commons with
   [idc-index](https://github.com/ImagingDataCommons/idc-index) (`pip install idc-index`). Neck CTs of patients
   treated for cancers outside the jaw are the best source; whole-body "Super D" series usually start below the
   mandible and are wasted effort. Record each series in `selection.json` (collection, PatientID, SeriesDescription,
   source_DOI, license_short_name, PatientAge, PatientSex).
2. **Segment**: `python3 tools/segment/segment.py <dicom-root> <seg-dir>` converts each series (dicom2nifti, uneven
   slice spacing resampled), crops whole-body scans to the top 300 mm, runs
   `TotalSegmentator -ta craniofacial_structures` (Apache-2.0, no licence key; ~5–20 min per scan on 4 CPU cores)
   and writes `coverage.json` (per-part voxels, cm³, whether the part touches the volume edge).
3. **Average**: `python3 tools/segment/average.py <seg-dir> tools/segment/out --selection selection.json`
   keeps scans with a complete mandible, drops stray islands, aligns every mandible to the median-volume reference
   (centroid + ICP), averages the masks, extracts the 0.5 iso-surface, smooths and decimates, writes
   `averaged-jaw.glb` (finished by `tools/glb/finish.mjs`), `averaged-jaw-mandible.stl`, `*-probability.nii.gz`
   and `provenance.json`.
4. Copy `averaged-jaw.glb`, the STL and `provenance.json` to `public/models/averaged-jaw/` and `provenance.json`
   to `app/models/averaged-jaw/` (the page renders the scan table from it), then render
   `public/assets/renders/averaged-jaw.webp` on the light card background with `node tools/segment/render-card.mjs`.

Requirements: `python3 -m pip install TotalSegmentator dicom2nifti idc-index nibabel trimesh scikit-image scipy`
(TotalSegmentator installs CPU PyTorch; the model weights download on first run).

Licence: the scans are CC BY 4.0 / CC BY 3.0 (credit their DOIs); the derived model is CC BY-SA 4.0 like the
rest of the collection. Never use a single patient's scan as a site model.
