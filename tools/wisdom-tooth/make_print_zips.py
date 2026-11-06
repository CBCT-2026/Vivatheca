"""Package the wisdom tooth STL files with a README (review status, model
disclaimer, licence and print notes), as the other models' downloads are.

Run from the repository root:  python3 tools/wisdom-tooth/make_print_zips.py
Re-run whenever public/models/*.stl or the disclaimer wording changes.
"""
import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MODEL_DISCLAIMER = re.search(r"modelDisclaimer =\s*'([^']+)'", (ROOT / 'app' / 'disclaimer-text.ts').read_text()).group(1)

README = """Vivatheca: {title}, version 1.1 (5 November 2026). STL in millimetres.

Not yet clinically reviewed.
{disclaimer}
Printed models are not sterile and must not be put in the mouth. Small parts are a choking hazard.
Full disclaimer: https://vivatheca.com/disclaimer

Size: about 1.7 times life size (166 mm long), so the roots and the nerve are easier to see. Scale to about 60% in your slicer for life size.
The file is not checked as a closed solid; repair it in your slicer before printing. Print the nerve in red if your printer can change colour.
{note}
Sources, what is simplified and how the model was made: https://vivatheca.com/models/impacted-wisdom-tooth

3D model by Luke Seifert for Vivatheca. Licence: CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). Credit: Seifert L. Vivatheca: Impacted lower wisdom tooth and matched normal, version 1.1. 2026. https://vivatheca.com/models/impacted-wisdom-tooth
"""

MODELS = [
    ('impacted-molar.stl', 'vivatheca-impacted-wisdom-tooth-stl.zip', 'impacted lower wisdom tooth',
     'Shows a lower left wisdom tooth tilted forward against the second molar, with its roots around the nerve. This is a less common, higher-risk arrangement.'),
    ('wisdom-tooth-normal.stl', 'vivatheca-wisdom-tooth-normal-stl.zip', 'matched normal (wisdom tooth erupted upright)',
     'The same jaw, teeth and nerve as the impacted model; only the wisdom tooth differs.'),
]

for stl, zip_name, title, note in MODELS:
    out = ROOT / 'public' / 'models' / 'downloads' / zip_name
    out.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        z.write(ROOT / 'public' / 'models' / stl, stl)
        z.writestr('README.txt', README.format(title=title, disclaimer=MODEL_DISCLAIMER, note=note))
    print(out.relative_to(ROOT), f'{out.stat().st_size / 1e6:.1f} MB')
