"""Diagrams for the /fixation/ page and the model pages that use plates and screws.

Writes SVG files to public/fixation/diagrams/. Like the head and neck diagrams, the drawings carry no
words, only numbered markers, so one file serves every language; each page explains the numbers in its
caption. Sizes are drawn to the proportions of the shared fixation component (tools/fixation/fixation.py).
Run: python3 tools/fixation/diagrams.py
"""
import math
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'head-neck'))
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'fixation', 'diagrams')
os.makedirs(OUT, exist_ok=True)

BONE, BONE_S, MARROW = '#ecdfc8', '#8a7a62', '#f6eedf'
TOOTH, TOOTH_S = '#f7f2e8', '#9b8f7a'
METAL, METAL_S, METAL_D = '#b4bbc2', '#5b636b', '#7d868f'
CUT, MARK, WATER = '#c0392b', '#1f3a5f', '#5aa9e6'
STYLE = 'font-family:Manrope,Arial,sans-serif'


def svg(w, h, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" style="{STYLE}">'
            f'<rect x="0" y="0" width="{w}" height="{h}" rx="16" fill="#ffffff"/>{body}</svg>')


def mark(x, y, n, lx=None, ly=None):
    s = ''
    if lx is not None:
        s += f'<line x1="{x}" y1="{y}" x2="{lx}" y2="{ly}" stroke="{MARK}" stroke-width="1.6"/><circle cx="{lx}" cy="{ly}" r="3" fill="{MARK}"/>'
    return s + (f'<circle cx="{x}" cy="{y}" r="13" fill="{MARK}"/>'
                f'<text x="{x}" y="{y + 5}" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">{n}</text>')


def letter(x, y, t):
    return f'<text x="{x}" y="{y}" font-size="20" font-weight="800" fill="{MARK}">{t}</text>'


def path(d, fill, stroke, w=2, extra=''):
    return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{w}" stroke-linejoin="round" {extra}/>'


def head(x, y, r):
    """Screw head seen from above: dome with a cross recess."""
    return (f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="{METAL}" stroke="{METAL_S}" stroke-width="1.4"/>'
            f'<path d="M{x - r * .55:.1f},{y:.1f} H{x + r * .55:.1f} M{x:.1f},{y - r * .55:.1f} V{y + r * .55:.1f}" stroke="{METAL_S}" stroke-width="{max(1.2, r * .22):.1f}" stroke-linecap="round"/>')


def hole(x, y, r):
    return f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="#ffffff" stroke="{METAL_S}" stroke-width="1.3"/><circle cx="{x:.1f}" cy="{y:.1f}" r="{r * .62:.1f}" fill="#d9d4cc" stroke="{METAL_S}" stroke-width="1"/>'


def miniplate(pts, lobe=11, bridge=8, screws=None, links=None, angle=0):
    """Top view of a plate: round lobes around holes joined by bridges. pts: hole centres."""
    links = links or [(i, i + 1) for i in range(len(pts) - 1)]
    s = ''
    for a, b in links:
        (x0, y0), (x1, y1) = pts[a], pts[b]
        s += f'<line x1="{x0}" y1="{y0}" x2="{x1}" y2="{y1}" stroke="{METAL_S}" stroke-width="{bridge + 2.6}" stroke-linecap="butt"/>'
    for x, y in pts:
        s += f'<circle cx="{x}" cy="{y}" r="{lobe + 1.3}" fill="{METAL_S}"/>'
    for a, b in links:
        (x0, y0), (x1, y1) = pts[a], pts[b]
        s += f'<line x1="{x0}" y1="{y0}" x2="{x1}" y2="{y1}" stroke="{METAL}" stroke-width="{bridge}" stroke-linecap="butt"/>'
    for i, (x, y) in enumerate(pts):
        s += f'<circle cx="{x}" cy="{y}" r="{lobe}" fill="{METAL}"/>'
        s += head(x, y, lobe * .62) if (screws is None or i in screws) else hole(x, y, lobe * .62)
    return s


# ---------- 1. Plate and screw: top view, then cross-sections (monocortical vs bicortical) ----------
def section(ox, oy, w, kind):
    """Cross-section of the mandibular body: outer cortex, marrow, inner cortex; plate on the outer side (left)."""
    h = 190
    s = path(f'M{ox},{oy} h{w} v{h} h-{w} Z', BONE, BONE_S, 2)
    s += path(f'M{ox + 16},{oy + 14} h{w - 32} v{h - 28} h-{w - 32} Z', MARROW, BONE_S, 1.2, 'stroke-dasharray="4 3"')
    # trabeculae
    for i in range(10):
        x = ox + 26 + (i * 37) % (w - 50); y = oy + 30 + (i * 53) % (h - 60)
        s += f'<ellipse cx="{x}" cy="{y}" rx="9" ry="5" fill="none" stroke="#d6c7ac" stroke-width="1.2"/>'
    if kind == 'mono':
        t, L, d = 8, 46, 14  # plate thickness, screw length, head width (drawing units)
    else:
        t, L, d = 18, w + 18, 16
    px = ox - t
    s += f'<rect x="{px}" y="{oy + 60}" width="{t}" height="70" rx="3" fill="{METAL}" stroke="{METAL_S}" stroke-width="1.4"/>'
    y = oy + 95
    # screw: head in the countersink, threaded shank into the bone
    s += path(f'M{px - 7},{y - d / 2} Q{px - 11},{y} {px - 7},{y + d / 2} L{px + t * .55},{y + 4} L{px + t * .55},{y - 4} Z', METAL, METAL_S, 1.3)
    x0 = px + t * .55
    s += f'<rect x="{x0:.1f}" y="{y - 4}" width="{L - t * .55:.1f}" height="8" fill="{METAL_D}" stroke="{METAL_S}" stroke-width="1"/>'
    for k in range(int((L - t) / 7)):
        xx = x0 + 4 + k * 7
        s += f'<path d="M{xx:.1f},{y - 6} L{xx + 3.5:.1f},{y + 6}" stroke="{METAL_S}" stroke-width="1.2"/>'
    s += path(f'M{px + L:.1f},{y - 4} L{px + L + 7:.1f},{y} L{px + L:.1f},{y + 4} Z', METAL_D, METAL_S, 1)
    return s, (ox, oy, w, h, px, t, L, y)


def anatomy_svg():
    b = letter(24, 34, 'A') + letter(434, 34, 'B') + letter(624, 34, 'C')
    # A: top view of a 4-hole extended miniplate across a cut, on bone
    b += path('M30,70 h360 v210 h-360 Z', BONE, BONE_S, 2)
    b += f'<path d="M206,64 L214,286" stroke="{CUT}" stroke-width="3" stroke-dasharray="7 4"/>'
    pts = [(80, 176), (130, 176), (290, 178), (340, 178)]
    b += miniplate(pts, lobe=16, bridge=11, screws={0, 1, 3})
    b += mark(80, 112, 1, 108, 176) + mark(250, 236, 2, 290, 182) + mark(132, 236, 3, 130, 176) + mark(214, 112, 4, 210, 150)
    # B: monocortical (miniplate); C: bicortical (reconstruction plate)
    s, g = section(470, 70, 120, 'mono'); b += s
    ox, oy, w, h, px, t, L, y = g
    b += mark(ox + 60, oy + h + 30, 5, ox + 8, oy + h - 20) + mark(ox + w + 2, oy + h + 30, 6, ox + w - 50, oy + h - 40)
    b += mark(ox + w - 10, oy - 18, 7, ox + w - 8, oy + 30) + mark(px - 10, oy - 18, 8, px + L - 8, y)
    s, g = section(660, 70, 120, 'bi'); b += s
    ox, oy, w, h, px, t, L, y = g
    b += mark(px + 9, oy + h + 30, 9, px + t / 2, oy + 128) + mark(ox + w + 2, oy - 18, 10, px + L - 4, y)
    return svg(800, 300, b)


# ---------- 2. Placing a plate: six steps (side view of bone across a cut) ----------
def step_panel(ox, oy, k):
    w, h = 230, 150
    s = path(f'M{ox},{oy + 30} h{w} v{h - 30} h-{w} Z', BONE, BONE_S, 2)
    cx = ox + w / 2
    s += f'<path d="M{cx},{oy + 26} L{cx + 4},{oy + h + 4}" stroke="{CUT}" stroke-width="2.6" stroke-dasharray="6 4"/>'
    pts = [(cx - 78, oy + 92), (cx - 46, oy + 92), (cx + 46, oy + 93), (cx + 78, oy + 93)]
    if k == 1:  # line up the pieces: arrows bring the back piece into contact
        s = path(f'M{ox},{oy + 30} h{w / 2} v{h - 30} h-{w / 2} Z', BONE, BONE_S, 2)
        s += path(f'M{cx + 16},{oy + 40} h{w / 2 - 16} v{h - 30} h-{w / 2 - 16} Z', BONE, BONE_S, 2)
        s += f'<path d="M{cx + 70},{oy + 20} L{cx + 24},{oy + 20}" stroke="{MARK}" stroke-width="3" marker-end="url(#ar)"/>'
        s += f'<path d="M{cx + 70},{oy + 112} L{cx + 70},{oy + 96}" stroke="{MARK}" stroke-width="3" marker-end="url(#ar)"/>'
        return s
    if k == 2:  # bending template, then the plate bent to match
        s += f'<path d="M{cx - 96},{oy + 66} q96,-14 192,2" fill="none" stroke="#c9a227" stroke-width="5" stroke-dasharray="2 4" stroke-linecap="round"/>'
        s += miniplate(pts, lobe=12, bridge=8, screws=set())
        s += f'<path d="M{cx - 96},{oy + 128} q-10,-22 2,-38" fill="none" stroke="{MARK}" stroke-width="2.4" marker-end="url(#ar)"/>'
        return s
    s += miniplate(pts, lobe=12, bridge=8, screws=set() if k < 5 else ({1} if k == 5 else {0, 1, 2, 3}))
    hx, hy = pts[1]
    if k == 3:  # drill at a right angle to the plate, with cooling water
        s += f'<rect x="{hx - 3}" y="{oy - 4}" width="6" height="{hy - oy + 2}" fill="{METAL_D}" stroke="{METAL_S}" stroke-width="1"/>'
        s += f'<rect x="{hx - 9}" y="{oy - 20}" width="18" height="18" rx="3" fill="#6b7680"/>'
        for i in range(4):
            s += f'<path d="M{hx + 16 + i * 7},{oy + 18 + i * 9} q3,5 0,8 q-3,-3 0,-8 Z" fill="{WATER}"/>'
        s += f'<path d="M{hx - 26},{hy - 26} h12 M{hx - 26},{hy - 26} v12" stroke="{MARK}" stroke-width="2"/>'
    if k == 4:  # depth gauge measures the hole
        s += f'<rect x="{hx - 2}" y="{oy - 6}" width="4" height="{hy - oy + 6}" fill="{MARK}"/>'
        s += f'<rect x="{hx - 10}" y="{oy - 18}" width="20" height="14" rx="2" fill="#ffffff" stroke="{MARK}" stroke-width="2"/>'
        for i in range(4):
            s += f'<line x1="{hx - 7 + i * 5}" y1="{oy - 16}" x2="{hx - 7 + i * 5}" y2="{oy - 10}" stroke="{MARK}" stroke-width="1.2"/>'
    if k == 5:  # screwdriver turns the first screw
        s += f'<rect x="{hx - 4}" y="{oy - 18}" width="8" height="{hy - oy + 4}" rx="3" fill="#6b7680"/>'
        s += f'<path d="M{hx - 18},{oy + 2} a18,8 0 1,0 36,0" fill="none" stroke="{MARK}" stroke-width="2.4" marker-end="url(#ar)"/>'
    return s


def steps_svg():
    b = (f'<defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">'
         f'<path d="M0,0 L10,5 L0,10 Z" fill="{MARK}"/></marker></defs>')
    for k in range(1, 7):
        ox = 30 + ((k - 1) % 3) * 256; oy = 46 + ((k - 1) // 3) * 210
        b += step_panel(ox, oy, k) + mark(ox + 14, oy - 18, k)
    return svg(800, 450, b)


# ---------- 3. Where the plates go in jaw surgery (front of the face and side of the lower jaw) ----------
def ortho_svg():
    b = letter(24, 34, 'A') + letter(470, 34, 'B')
    # A: front view, upper jaw and chin
    b += path('M60,70 C70,40 380,40 390,70 L400,170 C380,200 70,200 50,170 Z', BONE, BONE_S, 2)  # maxilla / midface band
    b += path('M196,70 C180,96 176,132 190,150 L260,150 C274,132 270,96 254,70 Z', '#ffffff', BONE_S, 2)  # piriform aperture
    b += f'<path d="M58,160 C150,166 300,166 392,160" stroke="{CUT}" stroke-width="3" stroke-dasharray="8 5" fill="none"/>'  # Le Fort I
    for x0 in (95, 136, 177, 218, 259, 300, 341):
        b += f'<rect x="{x0 - 2}" y="176" width="36" height="36" rx="8" fill="{TOOTH}" stroke="{TOOTH_S}" stroke-width="1.5"/>'
    b += path('M50,214 h350 L400,236 C330,330 120,330 50,236 Z', BONE, BONE_S, 2)  # lower jaw, front
    for x0 in (113, 152, 191, 230, 269, 308):
        b += f'<rect x="{x0 - 2}" y="214" width="34" height="30" rx="7" fill="{TOOTH}" stroke="{TOOTH_S}" stroke-width="1.5"/>'
    b += f'<path d="M140,290 C190,300 260,300 310,290" stroke="{CUT}" stroke-width="3" stroke-dasharray="8 5" fill="none"/>'  # genioplasty
    # L-plates: piriform rims (beside the nose) and zygomatic buttresses
    for sx, foot in ((178, -18), (272, 18)):
        b += miniplate([(sx, 112), (sx, 136), (sx, 176), (sx + foot, 176)], lobe=7, bridge=5)
    for sx, foot in ((86, 18), (364, -18)):
        b += miniplate([(sx, 116), (sx, 138), (sx, 176), (sx + foot, 176)], lobe=7, bridge=5)
    b += miniplate([(213, 276), (237, 276), (225, 288), (225, 296), (213, 310), (237, 310)], lobe=6.5, bridge=4.5,
                   screws={0, 1, 4, 5}, links=[(0, 2), (1, 2), (2, 3), (3, 4), (3, 5)])
    b += mark(150, 92, 1, 178, 118) + mark(56, 100, 2, 86, 124) + mark(420, 160, 3, 392, 160) + mark(330, 318, 4, 238, 296) + mark(110, 300, 5, 140, 290)
    # B: side view of the lower jaw (patient's right, face to the left): BSSO plate across the buccal step
    b += path('M490,190 C500,250 540,290 610,292 L720,290 C746,288 756,270 752,240 L742,96 C740,74 724,70 716,90 L700,150 C690,170 672,180 650,180 L520,186 Z',
              BONE, BONE_S, 2)
    for i in range(6):
        b += f'<rect x="{512 + i * 26}" y="{158 - (i % 2)}" width="24" height="28" rx="6" fill="{TOOTH}" stroke="{TOOTH_S}" stroke-width="1.5"/>'
    b += f'<path d="M708,140 C690,166 672,176 660,180 L662,290" stroke="{CUT}" stroke-width="3" stroke-dasharray="8 5" fill="none"/>'  # split along the ridge, then the buccal cut down to the lower border
    b += miniplate([(612, 222), (636, 222), (684, 222), (708, 222)], lobe=8, bridge=6)
    b += mark(640, 270, 6, 661, 250) + mark(600, 260, 7, 612, 224) + mark(760, 300, 8, 720, 290)
    return svg(800, 340, b)


for name, fn in (('plate-and-screw', anatomy_svg), ('placing-steps', steps_svg), ('orthognathic-plates', ortho_svg)):
    open(os.path.join(OUT, name + '.svg'), 'w').write(fn())
    print('wrote', name)
