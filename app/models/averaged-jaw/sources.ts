// Sources for the averaged jaw page (/models/averaged-jaw). Numbers match the [n] markers in t.averagedJaw.
// DOIs resolved on 6 November 2026 (Crossref for the articles, DataCite for the TCIA collections).
import type { Source } from '../../learn/sources';

export const averagedJawSources: Source[] = [
  { id: 1, text: 'Wasserthal J, Breit HC, Meyer MT, et al. TotalSegmentator: robust segmentation of 104 anatomic structures in CT images. Radiol Artif Intell. 2023;5(5):e230024. (Version 2.18, task craniofacial_structures, Apache-2.0.)', href: 'https://doi.org/10.1148/ryai.230024' },
  { id: 2, text: 'Dot G, Chaurasia A, Dubois G, et al. DentalSegmentator: robust open source deep learning-based CT and CBCT image segmentation. J Dent. 2024;147:105130.', href: 'https://doi.org/10.1016/j.jdent.2024.105130' },
  { id: 3, text: 'Fedorov A, Longabaugh WJR, Pot D, et al. National Cancer Institute Imaging Data Commons: toward transparency, reproducibility, and scalability in imaging artificial intelligence. Radiographics. 2023;43(12):e230180.', href: 'https://doi.org/10.1148/rg.230180' },
  { id: 4, text: 'Besl PJ, McKay ND. A method for registration of 3-D shapes. IEEE Trans Pattern Anal Mach Intell. 1992;14(2):239-256. (Iterative closest point.)', href: 'https://doi.org/10.1109/34.121791' },
  { id: 5, text: 'Lewiner T, Lopes H, Vieira AW, Tavares G. Efficient implementation of marching cubes’ cases with topological guarantees. J Graph Tools. 2003;8(2):1-15. (The iso-surface step, as implemented in scikit-image.)', href: 'https://doi.org/10.1080/10867651.2003.10487582' },
  { id: 6, text: 'Taubin G. A signal processing approach to fair surface design. In: SIGGRAPH ’95. 1995:351-358. (Mesh smoothing without shrinkage.)', href: 'https://doi.org/10.1145/218380.218473' },
  { id: 7, text: 'Raith S, Wolff S, Steiner T, et al. Planning of mandibular reconstructions based on statistical shape models. Int J Comput Assist Radiol Surg. 2017;12(1):99-112.', href: 'https://doi.org/10.1007/s11548-016-1451-y' },
  { id: 8, text: 'Vivatheca. tools/segment/segment.py and average.py: how the scans were segmented, aligned and averaged; provenance.json lists every scan.', href: 'https://github.com/CBCT-2026/Vivatheca/tree/main/tools/segment' },
];

// Open CT collections the scans came from (National Cancer Institute Imaging Data Commons / The Cancer Imaging Archive).
export const collections: Record<string, { name: string; doi: string; licence: string }> = {
  eay131: { name: 'NCI-MATCH (EAY131)', doi: '10.7937/c5ke-yx42', licence: 'CC BY 4.0' },
  cmb_mel: { name: 'Cancer Moonshot Biobank – Melanoma (CMB-MEL)', doi: '10.7937/gwsp-wh72', licence: 'CC BY 4.0' },
  tcga_thca: { name: 'TCGA-THCA (thyroid carcinoma)', doi: '10.7937/k9/tcia.2016.9zfrvf1b', licence: 'CC BY 3.0' },
  cptac_luad: { name: 'CPTAC-LUAD (lung adenocarcinoma)', doi: '10.7937/k9/tcia.2018.pat12tbs', licence: 'CC BY 4.0' },
  varepop_apollo: { name: 'VA-REPOP APOLLO', doi: '10.7937/ghkn-md15', licence: 'CC BY 4.0' },
};
