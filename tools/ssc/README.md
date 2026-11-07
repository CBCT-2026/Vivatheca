# Stainless steel crown on a lower baby molar

Five 3D models of one lower second baby molar (FDI 75) in a sectional block of gum and bone, with the adult second premolar growing underneath: **healthy** (matched normal), **decay**, **filling** (large multi-surface filling, for comparison), **prepared** (decay removed, trimmed for a crown) and **crown** (stainless steel crown cemented). Web page: `public/stainless-steel-crown/` (served at `/stainless-steel-crown/`).

## Rebuild
Needs Python 3 with `trimesh`, `manifold3d`, `shapely`, `scipy`, `scikit-image`, `fast-simplification`, `rtree`, and `npx` for Draco.

1. Get `mandible_lower_teeth_only.stl` (Z-Anatomy lower teeth, extracted for the head and neck series; project files `head-neck-recon/z-anatomy-base/`).
2. `python3 generate.py mandible_lower_teeth_only.stl out`: one GLB per stage, 2x print STLs in `out/print/`, `build_report.json` (volumes, face counts, watertight checks).
3. `python3 finish_glb.py out public/stainless-steel-crown/models`: exact colours, then Draco.
4. Zip `out/print/*.stl` with `print-notes.txt` into `public/stainless-steel-crown/downloads/vivatheca-stainless-steel-crown-2x.zip`.

## Method and limits
- Baby molar: the Z-Anatomy permanent lower first molar (with its pulp) scaled to typical lower second primary molar size from Wheeler's dental anatomy (crown 9.9 mm mesiodistal, 8.7 mm buccolingual, crown height 5.5 mm, root 9.8 mm). The roots are first straightened (the source roots lean distally) and then flared (up to 3.5 mm at the apex) so the premolar fits between them. A permanent molar has thicker enamel and a relatively smaller pulp than a primary molar; this is not corrected.
- Enamel–cement junction: estimated as 38 % of the tooth length from the cusp tips (as in `tools/development`).
- Premolar: top 26 % of the Z-Anatomy second premolar (a partly formed crown, roughly as at 4 to 5 years), scaled 0.92, lowered until it no longer overlaps the roots, in a crypt 12 % larger than the crown.
- Gum and bone: a simple cross-section extruded front to back (teaching-block style), not anatomical shapes. Gum edge 1.0 mm above, bone crest 1.5 mm below the enamel–cement junction. Neighbouring teeth are left out.
- Decay: three joined rounded shapes (occlusal, mesial, distal). The script checks it stays at least 0.5 mm from the pulp, because this model shows a crown without pulp treatment.
- Preparation (illustrative, not from a guideline): 1.5 mm occlusal reduction following the cusps, 1.0 mm slice off the mesial and distal surfaces down to the crown edge, no buccal or lingual reduction. The trimming envelope is built from the intact tooth. Where decay was removed, the space is filled (purple, "filling material").
- Crown: outer surface = tooth surface offset 0.35 mm (signed distance field, Gaussian-smoothed, marching cubes), inner surface = original tooth surface, edge 0.5 mm below the enamel–cement junction (about 1.5 mm under the gum edge). Real crowns are thinner; 0.35 mm keeps the 2x print at 0.7 mm. Cement fills the gap between the crown and the trimmed tooth.
- Print parts: `crown-cement.stl` may report a few open edges in some checkers; slicers repair this automatically.
- All of the above needs clinical review before the model is shown as reviewed.

## Evidence used on the page
AAPD *Best Practices: Restorative Dentistry* (Reference Manual 2025:473-86) for indications and recommendations; Innes et al. Cochrane review 2015 (CD005512.pub3); Innes et al. J Dent Res 2011 (Hall Technique, 5 years); Seale, Pediatr Dent 2002; Randall et al., JADA 2000; Wu et al., Pediatr Dent 2021; Wheeler's dental anatomy for sizes. Full list on the page.

## Colours (linear RGB)
Bone (0.6724, 0.5972, 0.4969) and tooth (0.770, 0.718, 0.648), roughness 0.7: the wisdom tooth model's colours. Pulp: the wisdom tooth model's nerve red. Gum (0.62, 0.20, 0.22), decay (0.13, 0.065, 0.025), filling lilac (0.42, 0.32, 0.72), cement (0.93, 0.90, 0.80), steel (0.75, 0.75, 0.77) metallic 1, roughness 0.28.

## Licence
Derived from Z-Anatomy (CC BY-SA 4.0), which uses BodyParts3D (CC BY-SA 2.1 Japan). The models are CC BY-SA 4.0.

## Kids view (`/stainless-steel-crown/kids/`)
A child-friendly 4-step story (healthy, holes, getting ready, crown) for children and parents, built on AAPD basic behaviour guidance (tell-show-do, positive previsit imagery, stop signal, distraction, descriptive praise) with the 2023 AAPD guideline's very low certainty stated on the page. Guides: Ashley and Oscar the pangolin, original Vivatheca characters (inline SVG in the page); Ashley tells the visit as a peer (modelling).
- Page: edit `kids-src.html` (EN, JA with `{漢字|かな}` furigana, VI all inline), then `python3 gen.py kids-src.html ../../public/stainless-steel-crown/kids/index.html`. Story text and Ashley's lines: `public/stainless-steel-crown/kids/viewer.js`.
- Models: `python3 kids_glb.py public/stainless-steel-crown/models public/stainless-steel-crown/kids/models` copies 4 stage GLBs with only the colours changed (baby tooth blue, adult tooth yellow, as the development models).
- Paths in the kids page are absolute, because production may serve it without a trailing slash.
- Not yet tested with children or parents; Vietnamese is an unreviewed draft.
