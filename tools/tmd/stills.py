"""Convert the stills from tools/tmd/render.mjs (build/tmd/*.png) to WebP for the site.

Usage: python3 tools/tmd/stills.py
- public/assets/renders/tmd.webp: collection card, 1200x800, jaw closed (left) and open wide (right).
- public/tmd/sheet/img/<exercise>.webp: one picture per exercise for the patient sheet, 640x480.
"""
import os
from PIL import Image

root = os.path.join(os.path.dirname(__file__), '..', '..')
b = os.path.join(root, 'build', 'tmd')
card = Image.new('RGB', (1200, 800), 'white')
for i, name in enumerate(['card-closed', 'card-open']):
    card.paste(Image.open(os.path.join(b, name + '.png')).convert('RGB').resize((600, 800), Image.LANCZOS), (600 * i, 0))
card.save(os.path.join(root, 'public', 'assets', 'renders', 'tmd.webp'), quality=82)
out = os.path.join(root, 'public', 'tmd', 'sheet', 'img')
os.makedirs(out, exist_ok=True)
for name in ['rest', 'tongue-up-opening', 'opening-stretch', 'side-to-side', 'forward']:
    im = Image.open(os.path.join(b, 'ex-' + name + '.png')).convert('RGB').resize((640, 480), Image.LANCZOS)
    im.save(os.path.join(out, name + '.webp'), quality=80)
print('ok')
