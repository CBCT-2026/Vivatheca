"""Add README.txt (review status, model disclaimer, licence and credit) to every
dental development print zip in public/development/downloads/.

Run from the repository root:  python3 tools/development/add_print_readme.py
Re-run after rebuilding the zips. The disclaimer wording is copied verbatim from
app/disclaimer-text.ts; change it there first.
"""
import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DOWNLOADS = ROOT / 'public' / 'development' / 'downloads'
MODEL_DISCLAIMER = re.search(r"modelDisclaimer =\s*'([^']+)'", (ROOT / 'app' / 'disclaimer-text.ts').read_text()).group(1)

TEMPLATE = """Vivatheca dental development series: age {age} years, 1.5 times life size, STL in millimetres.

Not yet clinically reviewed.
{disclaimer}
Printed models are not sterile and must not be put in the mouth. Small parts are a choking hazard.
Full disclaimer: https://vivatheca.com/disclaimer

Parts: upper and lower jaw, each as bone, adult teeth (print yellow) and baby teeth (print blue), so you can print them in different colours. The parts overlap; load them together as one object in your slicer.
Tooth timings are typical ages, not a standard for any one child. Sources and how the model was made: https://vivatheca.com/development/

3D model made by Vivatheca from Z-Anatomy (the libre 3D atlas of anatomy, CC BY-SA 4.0), which uses BodyParts3D (The Database Center for Life Science, CC BY-SA 2.1 Japan). Changed: teeth and jaw shapes extracted, resized, moved and cut away for each age. Licence: CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/).
"""

for path in sorted(DOWNLOADS.glob('vivatheca-dental-development-age-*.zip')):
    age = re.search(r'age-(\d+)-(\d+)', path.name).group(0)[4:].replace('-', '.')
    with zipfile.ZipFile(path) as z:
        items = [(i, z.read(i.filename)) for i in z.infolist() if i.filename != 'README.txt']
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as z:
        for info, data in items:
            z.writestr(info, data)
        z.writestr('README.txt', TEMPLATE.format(age=age, disclaimer=MODEL_DISCLAIMER))
    print(path.name, 'README.txt added')
