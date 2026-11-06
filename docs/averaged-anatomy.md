# Averaged anatomy from open CT scans

How `/models/averaged-jaw` was made, why it is built this way, and what it must not be used for.
Code: `tools/segment/` (see its README for the commands). Sources are numbered as on the page
(`app/models/averaged-jaw/sources.ts`).

## Why an average

Vivatheca shows every condition beside normal anatomy. A single healthy person's CT would be the simplest
"normal", but a real scan is one person's anatomy, is identifiable in principle, and carries that person's
quirks. A mean shape of several de-identified public scans has neither problem: no surface comes from one
person, and the result is a typical adult jaw rather than a particular one. Statistical shape models of the
mandible are used the same way in reconstruction planning [7].

## Data

Only CT series released under Creative Commons Attribution licences (CC BY 3.0 / 4.0, never NC or ND) from the
NCI Imaging Data Commons / The Cancer Imaging Archive [3], found and downloaded with `idc-index`. The collections
are cancer cohorts, so the scans are of adults treated for cancers outside the jaw (lung, thyroid, melanoma,
NCI-MATCH trial). Head and neck cancer cohorts were deliberately not used, because tumour, surgery or
radiotherapy there changes the jaw. Every scan used is listed in `provenance.json` with collection, DOI,
licence, scan ID, age and sex as released, voxel size, segmented mandible volume and its fit to the reference.

Scans were kept only when the mandible was complete: its label did not touch the edge of the field of view
and, after cleaning, its volume was at least 60 % of the median of the set (this is relative to the set, not a
number chosen by hand; it catches scans where the rami were labelled as skull or the condyles were cut off).

## Method

1. DICOM to NIfTI with dicom2nifti; uneven slice spacing is resampled rather than refused. Whole-body scans are
   cropped to their top 300 mm so the model does not spend its time on the chest and abdomen.
2. TotalSegmentator 2.18, task `craniofacial_structures` (mandible, lower teeth, upper teeth, skull, head,
   maxillary and frontal sinuses) [1]. The task is Apache-2.0, needs no licence key, and follows the open dental
   segmentation work of Dot et al. [2]. CPU inference, 5–20 min per scan.
3. Labels resampled to 0.7 mm isotropic voxels in RAS orientation; each part reduced to its largest connected
   component.
4. Rigid alignment of each mandible to the reference (the scan with the median mandible volume): centroid
   translation, then iterative closest point on 4000 surface points [4]. The same transform is applied to the
   scan's teeth so they keep their place on the jaw. No scaling: the average reflects the sizes in
   the set. (A PCA frame was tried as the initial pose, but its axis signs flip between scans on a near-symmetric
   mandible and ICP cannot recover; centroid + ICP is robust because all scans are supine, head first.)
5. Aligned binary masks are averaged into a per-part probability map and smoothed with a 0.7 mm Gaussian
   (with six scans the raw mean is quantised, 3/6 = 0.5 exactly, which leaves pits and one-voxel needles from
   thick-slice scans); the model surface is the 0.5 iso-surface (bone or tooth in at least half the scans),
   extracted with marching cubes [5], smoothed with 10 Taubin iterations (no shrinkage) [6] and decimated to
   30 000 faces. Only the mandible and lower teeth are exported: the skull and upper teeth averages were patchy
   shells, because neck scans stop at different levels and several people had few upper teeth.
6. Export as one GLB in metres, Y-up, patient right at −x, one material per part so the site's take-apart
   tools work; finished with `tools/glb/finish.mjs` (weld, Draco). The mandible is also exported as STL in mm.

## Limits (also on the page)

- Averaging blurs thin and variable features (coronoid tips, alveolar crests, interdental shape).
- Older cancer patients with mixed dentition; missing teeth in several scans thin or remove teeth in the mean.
- Segmentation errors near the skull base and metal artefacts are reduced by the largest-component rule and the
  edge check, not eliminated.
- Small n and rigid-only alignment; no skull or upper teeth; the lower teeth are thin because teeth that only some
  people had do not reach the half-way threshold.
- Not clinically reviewed. Reference shape only, not for diagnosis, planning or fitting anything to a patient.

## Licence

Scans: CC BY (credit the collection DOIs listed in `provenance.json` and on the page). Derived model: CC BY-SA 4.0
like the rest of the collection. Code: MIT.
