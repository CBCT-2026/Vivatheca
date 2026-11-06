"""Add README.txt (review status, model disclaimer, parts, licence) to each development print zip.

Usage: python3 tools/development/add_zip_readme.py public/development/downloads/*.zip
Wording of the disclaimer is copied verbatim from app/disclaimer-text.ts.
"""
import re
import sys
import zipfile

TEXT = """Vivatheca dental development series: right side of a child's upper and lower jaw at {age} years, 1.5 times life size, millimetres.

Not yet clinically reviewed.
Educational model only. It shows typical anatomy or disease, not any real patient, and is simplified and may contain errors. Not for diagnosis, treatment planning, surgical guides or use in or on the body.
Full disclaimer: https://vivatheca.com/disclaimer

Parts: bone, adult teeth and any remaining baby teeth for each jaw as separate STL files, so you can print them in different colours (baby teeth blue, adult teeth yellow on the web model). The parts overlap; load them together as one object in your slicer. 1.5 times life size because a child's teeth are small; life-size (1.0x) files are available on request.
Tooth timings, jaw growth data and sources: https://vivatheca.com/development/

3D model made by Vivatheca from Z-Anatomy (the libre 3D atlas of anatomy, CC BY-SA 4.0), which uses BodyParts3D (The Database Center for Life Science, CC BY-SA 2.1 Japan). Changed: teeth and jaw shapes extracted, resized, moved and cut away for each age. Licence: CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/).
"""

for path in sys.argv[1:]:
    m = re.search(r'age-(\d+)-5', path)
    age = f'{m.group(1)}.5'
    with zipfile.ZipFile(path) as z:
        if 'README.txt' in z.namelist():
            print(f'{path}: already has README.txt')
            continue
    with zipfile.ZipFile(path, 'a', compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr('README.txt', TEXT.format(age=age))
    print(f'{path}: added README.txt')
