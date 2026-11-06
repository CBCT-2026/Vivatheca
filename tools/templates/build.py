"""Editable handout and slide templates for every model (idea from Canva templates and Figma Community).

Each model gets an A4 portrait handout and a 16:9 slide, in English and Japanese (PPTX, opens in
PowerPoint, Keynote, Google Slides and Canva). The model picture, credit line, licence, review status
and model disclaimer are filled in; the clinician's own words go in the marked boxes. No health claims
are written here: the text boxes only say what to write.

Usage (with the site running, e.g. `pnpm start`, for the model titles and disclaimer from /api/models):
  python3 tools/templates/build.py [http://127.0.0.1:3000]
Writes public/templates/<slug>-<handout|slide>-<en|ja>.pptx and public/templates/manifest.json.
"""
import io
import json
import os
import re
import sys
import urllib.request

from PIL import Image
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.util import Mm, Pt

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:3000'
OUT = 'public/templates'
NAVY, TEAL, GREY, LINE = RGBColor(0x00, 0x24, 0x4D), RGBColor(0x00, 0x7F, 0x8B), RGBColor(0x4B, 0x5D, 0x6B), RGBColor(0xCF, 0xE1, 0xE7)

meta = json.load(urllib.request.urlopen(BASE + '/api/models'))
plain = lambda s: re.sub(r'\{([^{}|]+)\|[^{}]+\}', r'\1', s)

WORDS = {
    'en': {
        'brand': 'Vivatheca · 3D model',
        'boxes': [('What this model shows', '[Describe what the patient can see, in plain words. Short sentences, everyday words first.]'),
                  ('What it means for you', '[Explain what it means for this patient. Give risks as “X in 100”. Cite your sources.]'),
                  ('Questions to ask', '[List questions the patient may want to ask you.]')],
        'clinic': '[Your clinic name and contact details]',
        'slide_title_hint': '[Your slide title]',
        'slide_points': '[Your key points: one idea per line]',
        'credit': 'Model: “{title}” (version {v}), Vivatheca, {url}. Licensed under CC BY-SA 4.0 (creativecommons.org/licenses/by-sa/4.0). Changes: [none, or describe your changes].',
        'builder': 'Draft plain-language text at vivatheca.com/create',
    },
    'ja': {
        'brand': 'Vivatheca・3D模型',
        'boxes': [('この模型でわかること', '［患者さんに見えるものを、やさしい言葉で書いてください。短い文で。］'),
                  ('あなたにとっての意味', '［この患者さんにとっての意味を書いてください。リスクは「100人中何人」で。出典も示してください。］'),
                  ('質問したいこと', '［患者さんが聞きたいことを書いてください。］')],
        'clinic': '［医院名と連絡先］',
        'slide_title_hint': '［スライドのタイトル］',
        'slide_points': '［伝えたいこと：1行に1つ］',
        'credit': '模型：「{title}」（バージョン{v}）、Vivatheca、{url}。ライセンス：CC BY-SA 4.0（creativecommons.org/licenses/by-sa/4.0）。変更：［なし、または変更内容］。',
        'builder': 'やさしい文章の下書きは vivatheca.com/create で作れます',
    },
}


def text(slide, x, y, w, h, s, size=12, bold=False, colour=NAVY, wrap=True):
    box = slide.shapes.add_textbox(x, y, w, h)
    tf = box.text_frame
    tf.word_wrap = wrap
    lines = s.split('\n')
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        r = p.add_run()
        r.text = line
        r.font.size = Pt(size)
        r.font.bold = bold
        r.font.color.rgb = colour
    return box


def framed(slide, x, y, w, h, heading, hint, lang):
    shape = slide.shapes.add_shape(1, x, y, w, h)
    shape.fill.background()
    shape.line.color.rgb = LINE
    shape.shadow.inherit = False
    tf = shape.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = Mm(4)
    tf.margin_top = Mm(3)
    tf.vertical_anchor = 1  # top
    p = tf.paragraphs[0]
    r = p.add_run(); r.text = heading; r.font.size = Pt(14); r.font.bold = True; r.font.color.rgb = NAVY
    p2 = tf.add_paragraph(); r2 = p2.add_run(); r2.text = hint; r2.font.size = Pt(11); r2.font.color.rgb = GREY
    p.alignment = p2.alignment = 1


def picture(slug, image):
    path = 'public' + image
    im = Image.open(path).convert('RGB')
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=88, optimize=True)
    buf.seek(0)
    return buf, im.size


def footer(slide, x, y, w, m, lang, size=8):
    W = WORDS[lang]
    title = plain(m['title'][lang])
    credit = W['credit'].format(title=title, v=m['version'], url='https://vivatheca.com' + m['href'])
    status = plain(meta['reviewStatus'][lang]) + ' ' + plain(meta['modelDisclaimer'][lang]) + ' vivatheca.com/disclaimer'
    text(slide, x, y, w, Mm(22), credit + '\n' + status, size=size, colour=GREY)


def handout(m, lang):
    W = WORDS[lang]
    prs = Presentation()
    prs.slide_width, prs.slide_height = Mm(210), Mm(297)
    s = prs.slides.add_slide(prs.slide_layouts[6])
    text(s, Mm(15), Mm(10), Mm(180), Mm(8), W['brand'], size=10, colour=TEAL, bold=True)
    text(s, Mm(15), Mm(17), Mm(180), Mm(16), plain(m['title'][lang]), size=22, bold=True)
    img, (iw, ih) = picture(m['slug'], m['image'])
    h = Mm(180) * ih // iw
    s.shapes.add_picture(img, Mm(15), Mm(36), Mm(180), h)
    y = Mm(36) + h + Mm(6)
    box_h = (Mm(297) - Mm(48) - y - Mm(10)) // 3
    for i, (head, hint) in enumerate(W['boxes']):
        framed(s, Mm(15), y + i * (box_h + Mm(3)), Mm(180), box_h, head, hint, lang)
    text(s, Mm(15), Mm(297) - Mm(46), Mm(180), Mm(8), W['clinic'], size=10, colour=GREY)
    footer(s, Mm(15), Mm(297) - Mm(38), Mm(180), m, lang)
    return prs


def slide(m, lang):
    W = WORDS[lang]
    prs = Presentation()
    prs.slide_width, prs.slide_height = Mm(338.7), Mm(190.5)
    s = prs.slides.add_slide(prs.slide_layouts[6])
    text(s, Mm(14), Mm(8), Mm(310), Mm(8), W['brand'], size=11, colour=TEAL, bold=True)
    text(s, Mm(14), Mm(15), Mm(310), Mm(16), plain(m['title'][lang]), size=28, bold=True)
    img, (iw, ih) = picture(m['slug'], m['image'])
    w = Mm(175)
    s.shapes.add_picture(img, Mm(14), Mm(36), w, w * ih // iw)
    framed(s, Mm(196), Mm(36), Mm(128), Mm(110), W['slide_title_hint'], W['slide_points'], lang)
    footer(s, Mm(14), Mm(190.5) - Mm(26), Mm(310), m, lang, size=9)
    return prs


def size(path):
    n = os.path.getsize(path)
    return f'{n / 1e6:.1f} MB' if n > 1e6 else f'{round(n / 1e3)} KB'


os.makedirs(OUT, exist_ok=True)
manifest = {}
for m in meta['models']:
    entry = manifest.setdefault(m['slug'], {'image': m['image']})
    for kind, make in (('handout', handout), ('slide', slide)):
        for lang in ('en', 'ja'):
            name = f"{m['slug']}-{kind}-{lang}.pptx"
            prs = make(m, lang)
            prs.core_properties.author = 'Vivatheca'
            prs.core_properties.title = plain(m['title'][lang])
            prs.core_properties.comments = 'CC BY-SA 4.0. vivatheca.com'
            path = os.path.join(OUT, name)
            prs.save(path)
            entry.setdefault(kind, {})[lang] = {'href': '/templates/' + name, 'size': size(path)}
with open(os.path.join(OUT, 'manifest.json'), 'w') as f:
    json.dump(manifest, f, indent=1, ensure_ascii=False)
    f.write('\n')
print(len(manifest), 'models')
