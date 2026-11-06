"""Pack each wisdom tooth STL with a README (review status, model disclaimer, scale, licence).

Writes public/models/vivatheca-wisdom-tooth-impacted-stl.zip and -normal-stl.zip.
The disclaimer wording is copied verbatim from app/disclaimer-text.ts.
Usage: python3 tools/wisdom-tooth/make_print_zips.py
"""
import zipfile

README = """Vivatheca: {what}. Left half of the lower jaw with the inferior alveolar nerve.
STL in millimetres at about 1.7 times life size (166 mm long), so the roots and nerve are easier to see. Scale it to about 60% in your slicer for life size. It is not checked as a closed solid, so repair it in your slicer before printing.

Not yet clinically reviewed.
Educational model only. It shows typical anatomy or disease, not any real patient, and is simplified and may contain errors. Not for diagnosis, treatment planning, surgical guides or use in or on the body.
Full disclaimer: https://vivatheca.com/disclaimer

What the model shows, what is simplified, and its sources: https://vivatheca.com/models/impacted-wisdom-tooth

Modelled by Luke Seifert, Vivatheca. Licence: CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/).
How to credit: Seifert L. Vivatheca: Impacted lower wisdom tooth and matched normal, version 1.2. 2026. https://vivatheca.com/models/impacted-wisdom-tooth. Licensed under CC BY-SA 4.0. Accessed [date].
"""

for key, stl, what in [('impacted', 'impacted-molar.stl', 'impacted lower wisdom tooth (mesioangular, tooth 38)'),
                       ('normal', 'wisdom-tooth-normal.stl', 'matched normal: the same jaw with the wisdom tooth erupted')]:
    out = f'public/models/vivatheca-wisdom-tooth-{key}-stl.zip'
    with zipfile.ZipFile(out, 'w', compression=zipfile.ZIP_DEFLATED) as z:
        z.write(f'public/models/{stl}', stl)
        z.writestr('README.txt', README.format(what=what))
    print(out)
