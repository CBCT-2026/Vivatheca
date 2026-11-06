"""Reconstruction and treatment diagrams for the head and neck condition pages.

Writes SVG files to public/head-neck/diagrams/. The drawings carry no words, only numbered
markers, so the same file works in English and Japanese; each page explains the numbers
in its own caption. Run: python3 tools/head-neck/diagrams.py
"""
import math
import os

OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'head-neck', 'diagrams')
os.makedirs(OUT, exist_ok=True)

BONE, BONE_S = '#ecdfc8', '#8a7a62'
TOOTH, TOOTH_S = '#f7f2e8', '#9b8f7a'
FIB, FIB_S = '#d8bf96', '#7d6648'
SKIN, SKIN_S = '#f3cfb1', '#b07d5a'
MUC, MUC_S = '#e7a3a3', '#a65a5a'
ART, VEIN = '#c0392b', '#2e5e9e'
METAL, METAL_S = '#9aa3ab', '#5b636b'
LES, CYST, CYST_S = '#8a1f2b', '#ecd27a', '#9c7d1c'
MARK = '#1f3a5f'
STYLE = 'font-family:Manrope,Arial,sans-serif'


def svg(w, h, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" style="{STYLE}">'
            f'<rect x="0" y="0" width="{w}" height="{h}" rx="16" fill="#ffffff"/>{body}</svg>')


def mark(x, y, n, lx=None, ly=None):
    """Numbered marker, with an optional leader line to (lx, ly)."""
    s = ''
    if lx is not None:
        s += f'<line x1="{x}" y1="{y}" x2="{lx}" y2="{ly}" stroke="{MARK}" stroke-width="1.6"/><circle cx="{lx}" cy="{ly}" r="3" fill="{MARK}"/>'
    return s + (f'<circle cx="{x}" cy="{y}" r="13" fill="{MARK}"/>'
                f'<text x="{x}" y="{y + 5}" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">{n}</text>')


def letter(x, y, t):
    return f'<text x="{x}" y="{y}" font-size="20" font-weight="800" fill="{MARK}">{t}</text>'


def path(d, fill, stroke, w=2, extra=''):
    return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{w}" stroke-linejoin="round" {extra}/>'


def poly(pts):
    return 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + ' Z'


def teeth_row(x0, x1, y, h=34, n=7, gap=3):
    w = (x1 - x0 - gap * (n - 1)) / n
    s = ''
    for i in range(n):
        x = x0 + i * (w + gap)
        s += f'<rect x="{x:.1f}" y="{y - h:.1f}" width="{w:.1f}" height="{h}" rx="{min(6, w / 3):.1f}" fill="{TOOTH}" stroke="{TOOTH_S}" stroke-width="1.5"/>'
    return s


def screw(x, y, r=4.2):
    return (f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{METAL}" stroke="{METAL_S}" stroke-width="1.4"/>'
            f'<line x1="{x - r * 0.6:.1f}" y1="{y:.1f}" x2="{x + r * 0.6:.1f}" y2="{y:.1f}" stroke="{METAL_S}" stroke-width="1.2"/>')


def plate_line(pts, holes, screwed=None, w=9):
    d = 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    s = f'<path d="{d}" fill="none" stroke="{METAL_S}" stroke-width="{w + 2}" stroke-linecap="round" stroke-linejoin="round"/>'
    s += f'<path d="{d}" fill="none" stroke="{METAL}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'
    # holes evenly along the polyline
    L = [0.0]
    for i in range(1, len(pts)):
        L.append(L[-1] + math.dist(pts[i - 1], pts[i]))
    for k in range(holes):
        t = L[-1] * (k + 0.5) / holes
        i = max(j for j in range(len(L)) if L[j] <= t) if t < L[-1] else len(L) - 2
        i = min(i, len(pts) - 2)
        f = (t - L[i]) / max(1e-6, L[i + 1] - L[i])
        x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f
        y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f
        if screwed is None or k in screwed:
            s += screw(x, y, 3.6)
        else:
            s += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="2.8" fill="#ffffff" stroke="{METAL_S}" stroke-width="1.2"/>'
    return s


def seg(a, b, w, fill=FIB, stroke=FIB_S):
    (x0, y0), (x1, y1) = a, b
    dx, dy = x1 - x0, y1 - y0
    L = math.hypot(dx, dy)
    nx, ny = -dy / L * w / 2, dx / L * w / 2
    return path(poly([(x0 + nx, y0 + ny), (x1 + nx, y1 + ny), (x1 - nx, y1 - ny), (x0 - nx, y0 - ny)]), fill, stroke, 1.8)


# ---------- 1. Fibula free flap (SCC page) ----------
def leg(ox, oy):
    """Right lower leg seen from the outer side: knee at the top, ankle and foot at the bottom."""
    s = path(f'M{ox + 60},{oy} C{ox + 20},{oy + 60} {ox + 40},{oy + 120} {ox + 58},{oy + 170} C{ox + 70},{oy + 220} {ox + 62},{oy + 280} {ox + 70},{oy + 320} '
             f'L{ox + 60},{oy + 345} C{ox + 70},{oy + 362} {ox + 120},{oy + 366} {ox + 190},{oy + 362} L{ox + 192},{oy + 340} '
             f'C{ox + 160},{oy + 330} {ox + 140},{oy + 318} {ox + 132},{oy + 300} C{ox + 128},{oy + 240} {ox + 150},{oy + 160} {ox + 150},{oy + 100} '
             f'C{ox + 150},{oy + 60} {ox + 140},{oy + 25} {ox + 140},{oy} Z', SKIN, SKIN_S)
    # tibia (front, thick) and fibula (back/outer, thin)
    s += path(f'M{ox + 116},{oy + 6} C{ox + 128},{oy + 90} {ox + 118},{oy + 220} {ox + 116},{oy + 318} L{ox + 104},{oy + 320} C{ox + 104},{oy + 220} {ox + 110},{oy + 90} {ox + 94},{oy + 6} Z', BONE, BONE_S, 1.6)
    s += path(f'M{ox + 74},{oy + 28} C{ox + 70},{oy + 120} {ox + 84},{oy + 230} {ox + 86},{oy + 326} L{ox + 78},{oy + 328} C{ox + 74},{oy + 230} {ox + 62},{oy + 120} {ox + 66},{oy + 28} Z', FIB, FIB_S, 1.6)
    return s


def fibula_svg():
    b = letter(24, 36, 'A') + letter(400, 36, 'B')
    ox, oy = 110, 40
    b += leg(ox, oy)
    # removed middle part of the fibula (kept 6 cm at knee and ankle) shown highlighted
    b += f'<path d="M{ox + 66},{oy + 95} C{ox + 70},{oy + 160} {ox + 78},{oy + 220} {ox + 80},{oy + 262}" stroke="{ART}" stroke-width="2.4" fill="none"/>'
    b += f'<path d="M{ox + 62},{oy + 95} C{ox + 66},{oy + 160} {ox + 74},{oy + 220} {ox + 76},{oy + 262}" stroke="{VEIN}" stroke-width="2.4" fill="none"/>'
    for y in (95, 262):
        b += f'<line x1="{ox + 52}" y1="{oy + y}" x2="{ox + 96}" y2="{oy + y}" stroke="{MARK}" stroke-width="2.4" stroke-dasharray="5 4"/>'
    b += f'<ellipse cx="{ox + 64}" cy="{oy + 185}" rx="20" ry="46" fill="none" stroke="{MARK}" stroke-width="2" stroke-dasharray="6 4"/>'
    b += mark(60, 120, 1, ox + 70, oy + 150) + mark(60, 230, 2, ox + 66, oy + 200) + mark(300, 70, 3, ox + 120, oy + 50) + mark(300, 330, 4, ox + 84, oy + 300)
    b += mark(300, 200, 5, ox + 64, oy + 185)
    # B: the jaw after reconstruction, drawn like a panoramic X-ray (patient's right on the left)
    left = 'M604,206 L720,206 C728,200 732,160 738,118 L748,114 C752,128 758,138 764,140 C768,120 772,100 776,94 L790,96 C792,140 790,230 788,268 C782,292 766,306 740,316 C690,330 640,336 604,338 Z'
    ghost = 'M590,206 L474,206 C466,200 462,160 456,118 L446,114 C442,128 436,138 430,140 C426,120 422,100 418,94 L404,96 C402,140 404,230 406,268 C412,292 428,306 454,316 C504,330 554,336 590,338'
    b += path(ghost, 'none', BONE_S, 1.6, 'stroke-dasharray="5 5"')
    b += path(left, BONE, BONE_S)
    b += teeth_row(608, 716, 206, n=6)
    A, Bp, C, D = (606, 312), (522, 318), (436, 288), (420, 112)
    b += seg(D, C, 26) + seg(C, Bp, 28) + seg(Bp, A, 28)
    b += f'<path d="M462,288 Q530,282 596,296" stroke="{SKIN_S}" stroke-width="8" fill="none" stroke-linecap="round"/>'
    b += f'<path d="M462,288 Q530,282 596,296" stroke="{SKIN}" stroke-width="5" fill="none" stroke-linecap="round"/>'
    b += plate_line([(590, 304), (626, 304)], 4) + plate_line([(590, 324), (626, 324)], 4)
    b += plate_line([(500, 324), (546, 324)], 4) + plate_line([(426, 226), (432, 290), (470, 306)], 5)
    b += f'<path d="M500,334 C496,360 480,380 452,396" stroke="{ART}" stroke-width="3" fill="none"/><path d="M490,334 C486,356 470,374 444,388" stroke="{VEIN}" stroke-width="3" fill="none"/>'
    b += letter(404, 412, 'R') + letter(772, 412, 'L')
    b += mark(470, 60, 1, 426, 170) + mark(560, 390, 2, 523, 324) + mark(400, 370, 3, 448, 392) + mark(700, 150, 4, 680, 190) + mark(540, 240, 5, 530, 285) + mark(640, 80, 6, 452, 118)
    return svg(800, 420, b)


# ---------- 2. Radial forearm free flap (soft tissue only) ----------
def rfff_svg():
    b = letter(24, 36, 'A') + letter(420, 36, 'B')
    # forearm, palm up, wrist to the right
    b += path('M40,150 C120,120 240,118 330,130 C350,132 362,128 376,122 L392,128 C400,150 398,190 392,212 L374,218 C360,212 348,208 330,210 C240,222 120,222 40,196 Z', SKIN, SKIN_S)
    b += path('M376,122 C400,106 418,110 420,128 L420,214 C418,232 398,236 376,218 Z', SKIN, SKIN_S)
    b += '<path d="M60,186 C150,196 260,196 362,180" stroke="#c0392b" stroke-width="3" fill="none"/>'
    b += '<path d="M60,180 C150,190 260,190 362,174" stroke="#2e5e9e" stroke-width="2" fill="none"/>'
    b += '<path d="M60,140 C160,128 260,130 362,140" stroke="#2e5e9e" stroke-width="3" fill="none"/>'
    b += f'<ellipse cx="300" cy="176" rx="58" ry="32" fill="none" stroke="{MARK}" stroke-width="2.4" stroke-dasharray="7 5"/>'
    b += mark(300, 260, 1, 300, 205) + mark(140, 250, 2, 150, 192) + mark(140, 90, 3, 150, 132)
    # B: roof of the mouth seen from below (front at the bottom), thin flap stitched into the defect
    cx, cy = 600, 200
    b += path(f'M{cx - 150},{cy - 110} C{cx - 160},{cy + 20} {cx - 120},{cy + 140} {cx},{cy + 160} C{cx + 120},{cy + 140} {cx + 160},{cy + 20} {cx + 150},{cy - 110} Z', MUC, MUC_S)
    pts = []
    for i in range(14):
        u = i / 13
        ang = math.pi * (1 - u)
        x = cx + 140 * math.cos(ang)
        y = cy - 95 + 230 * math.sin(ang) ** 1.4 if 0 < ang < math.pi else cy - 95
        pts.append((x, y))
    for (x, y) in pts:
        b += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="15" fill="{TOOTH}" stroke="{TOOTH_S}" stroke-width="1.5"/>'
    b += path(f'M{cx - 70},{cy - 40} C{cx - 75},{cy + 10} {cx - 40},{cy + 50} {cx + 10},{cy + 40} C{cx + 30},{cy + 10} {cx + 20},{cy - 40} {cx - 10},{cy - 60} Z', SKIN, SKIN_S, 2.4)
    for k in range(14):
        t = k / 14 * 2 * math.pi
        x = cx - 30 + 46 * math.cos(t); y = cy - 5 + 48 * math.sin(t)
        b += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="2" fill="{MARK}"/>'
    b += f'<path d="M{cx - 40},{cy - 52} C{cx - 60},{cy - 100} {cx - 70},{cy - 140} {cx - 60},{cy - 175}" stroke="{ART}" stroke-width="3" fill="none"/>'
    b += f'<path d="M{cx - 48},{cy - 48} C{cx - 70},{cy - 98} {cx - 80},{cy - 140} {cx - 72},{cy - 175}" stroke="{VEIN}" stroke-width="3" fill="none"/>'
    b += mark(cx + 110, cy + 0, 4, cx - 10, cy + 0) + mark(cx + 60, cy - 150, 5, cx - 64, cy - 150)
    return svg(800, 420, b)


# ---------- 3. Ameloblastoma: rim (marginal) resection and plate ----------
def body_view(ox, oy, w=320, h=150):
    """Side view of the left lower jaw body (front of the face to the right)."""
    return path(f'M{ox},{oy + 20} C{ox + 60},{oy + 10} {ox + w - 60},{oy + 10} {ox + w},{oy + 30} L{ox + w + 10},{oy + h - 30} '
                f'C{ox + w - 10},{oy + h} {ox + 60},{oy + h + 6} {ox},{oy + h - 6} Z', BONE, BONE_S)


def roots(x, top, depth, w):
    return path(f'M{x},{top} L{x + w},{top} L{x + w * 0.7},{top + depth} L{x + w * 0.3},{top + depth} Z', TOOTH, TOOTH_S, 1.4)


def amelo_svg():
    b = letter(24, 36, 'A') + letter(424, 36, 'B')
    for k, (ox, oy) in enumerate(((40, 120), (440, 120))):
        b += body_view(ox, oy)
        xs = [ox + 14 + i * 44 for i in range(7)]
        for i, x in enumerate(xs):
            removed = k == 1 and 2 <= i <= 5
            if removed:
                continue
            b += roots(x + 4, oy + 18, 70 if i < 5 else 62, 30)
            b += f'<rect x="{x}" y="{oy - 26}" width="38" height="44" rx="9" fill="{TOOTH}" stroke="{TOOTH_S}" stroke-width="1.5"/>'
        if k == 0:
            for (cx, cy, rx, ry) in ((ox + 150, oy + 70, 28, 34), (ox + 195, oy + 66, 30, 36), (ox + 236, oy + 74, 22, 28), (ox + 175, oy + 40, 22, 18)):
                b += f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#6b4c8a" fill-opacity=".85" stroke="#3d2a52" stroke-width="1.5"/>'
            b += f'<path d="M{ox + 102},{oy - 4} L{ox + 102},{oy + 112} L{ox + 288},{oy + 112} L{ox + 288},{oy + 10}" fill="none" stroke="{MARK}" stroke-width="2.4" stroke-dasharray="7 5"/>'
            b += mark(ox + 190, oy - 70, 1, ox + 192, oy + 60) + mark(ox + 340, oy + 70, 2, ox + 288, oy + 100) + mark(ox + 30, oy + 210, 3, ox + 200, oy + 135)
        else:
            b += path(f'M{ox + 102},{oy + 4} L{ox + 102},{oy + 112} L{ox + 288},{oy + 112} L{ox + 288},{oy + 12} Z', '#ffffff', BONE_S, 2, 'stroke-dasharray="4 3"')
            b += plate_line([(ox + 30, oy + 132), (ox + 140, oy + 136), (ox + 250, oy + 136), (ox + 330, oy + 128)], 9, screwed={0, 1, 2, 6, 7, 8}, w=11)
            b += mark(ox + 190, oy - 60, 4, ox + 195, oy + 60) + mark(ox + 100, oy + 210, 5, ox + 150, oy + 136) + mark(ox + 300, oy + 210, 6, ox + 195, oy + 124)
    return svg(800, 400, b)


# ---------- 4. Palate cover plate (MEC page): cross-section front to back ----------
def mec_svg():
    b = letter(24, 36, 'A') + letter(424, 36, 'B')
    for k, ox in enumerate((40, 440)):
        oy = 90
        # palate bone (cross-section left to right of the patient, nose above)
        b += path(f'M{ox},{oy + 70} C{ox + 60},{oy - 10} {ox + 260},{oy - 10} {ox + 320},{oy + 70} L{ox + 320},{oy + 92} C{ox + 260},{oy + 20} {ox + 60},{oy + 20} {ox},{oy + 92} Z', BONE, BONE_S)
        # lining under the bone
        mx0, mx1 = (ox + 70, ox + 190)
        b += path(f'M{ox},{oy + 92} C{ox + 60},{oy + 20} {ox + 260},{oy + 20} {ox + 320},{oy + 92} L{ox + 320},{oy + 106} C{ox + 260},{oy + 36} {ox + 60},{oy + 36} {ox},{oy + 106} Z', MUC, MUC_S, 1.6)
        # teeth at both sides
        for tx in (ox - 6, ox + 296):
            b += f'<rect x="{tx}" y="{oy + 92}" width="30" height="52" rx="8" fill="{TOOTH}" stroke="{TOOTH_S}" stroke-width="1.5"/>'
        if k == 0:
            b += f'<ellipse cx="{ox + 120}" cy="{oy + 62}" rx="40" ry="17" fill="{LES}" stroke="#4d0f17" stroke-width="1.5"/>'
            b += f'<path d="M{ox + 66},{oy + 74} C{ox + 90},{oy + 40} {ox + 150},{oy + 40} {ox + 176},{oy + 74}" fill="none" stroke="{MARK}" stroke-width="2.4" stroke-dasharray="6 4"/>'
            b += mark(ox + 120, oy + 180, 1, ox + 120, oy + 70) + mark(ox + 220, oy + 180, 2, ox + 172, oy + 70) + mark(ox + 160, oy - 40, 3, ox + 160, oy + 15)
        else:
            # defect: lining removed, bone kept; dressing in the defect and clear plate below, clipped to teeth
            b += path(f'M{ox + 72},{oy + 60} C{ox + 100},{oy + 42} {ox + 150},{oy + 42} {ox + 178},{oy + 58} L{ox + 178},{oy + 78} C{ox + 150},{oy + 62} {ox + 100},{oy + 62} {ox + 72},{oy + 80} Z', '#f0a070', '#a5582c', 1.4)
            b += path(f'M{ox + 10},{oy + 112} C{ox + 60},{oy + 44} {ox + 260},{oy + 44} {ox + 310},{oy + 112} L{ox + 310},{oy + 124} C{ox + 260},{oy + 58} {ox + 60},{oy + 58} {ox + 10},{oy + 124} Z', '#cfe2ef', '#5d8aa8', 1.6, 'fill-opacity=".85"')
            for tx in (ox - 2, ox + 318):
                b += f'<path d="M{tx},{oy + 108} q-10,14 0,30" fill="none" stroke="{METAL_S}" stroke-width="3"/>'
            b += mark(ox + 120, oy - 40, 4, ox + 122, oy + 32) + mark(ox + 120, oy + 190, 5, ox + 120, oy + 70) + mark(ox + 250, oy + 190, 6, ox + 240, oy + 100)
    return svg(800, 320, b)


# ---------- 5. OKC treatment options: cross-sections of the lower jaw ----------
def okc_panel(ox, oy, kind):
    s = ''
    # jaw cross-section (tooth side up), cheek side to the left
    s += path(f'M{ox + 40},{oy + 30} C{ox + 20},{oy + 80} {ox + 20},{oy + 160} {ox + 50},{oy + 190} C{ox + 80},{oy + 205} {ox + 120},{oy + 205} {ox + 140},{oy + 185} '
              f'C{ox + 160},{oy + 150} {ox + 160},{oy + 80} {ox + 140},{oy + 30} Z', BONE, BONE_S)
    s += f'<rect x="{ox + 66}" y="{oy - 14}" width="48" height="48" rx="10" fill="{TOOTH}" stroke="{TOOTH_S}" stroke-width="1.5"/>'
    s += roots(ox + 74, oy + 32, 52, 32)
    cyst = f'<ellipse cx="{ox + 90}" cy="{oy + 128}" rx="44" ry="42" fill="{CYST}" stroke="{CYST_S}" stroke-width="2"/>'
    cavity = f'<ellipse cx="{ox + 90}" cy="{oy + 128}" rx="44" ry="42" fill="#ffffff" stroke="{BONE_S}" stroke-width="2"/>'
    shaved = f'<ellipse cx="{ox + 90}" cy="{oy + 128}" rx="51" ry="49" fill="none" stroke="#c96b1c" stroke-width="7" stroke-opacity=".55"/>'
    window = path(f'M{ox + 22},{oy + 106} L{ox + 50},{oy + 112} L{ox + 50},{oy + 146} L{ox + 22},{oy + 152} Z', '#ffffff', 'none', 0)
    if kind == 'enucleation':
        s += cavity + window
        s += f'<ellipse cx="{ox + 0}" cy="{oy + 80}" rx="22" ry="20" fill="{CYST}" stroke="{CYST_S}" stroke-width="2"/>'
        s += f'<path d="M{ox + 14},{oy + 96} L{ox + 36},{oy + 118}" stroke="{MARK}" stroke-width="2.4" marker-end="url(#ar)"/>'
    elif kind == 'marsupialisation':
        s += cyst + window
        s += f'<path d="M{ox + 22},{oy + 106} C{ox + 0},{oy + 98} {ox - 10},{oy + 88} {ox - 18},{oy + 74}" stroke="{MUC_S}" stroke-width="5" fill="none"/>'
        s += f'<path d="M{ox + 22},{oy + 152} C{ox + 0},{oy + 160} {ox - 10},{oy + 170} {ox - 18},{oy + 184}" stroke="{MUC_S}" stroke-width="5" fill="none"/>'
        s += f'<path d="M{ox + 50},{oy + 128} C{ox + 30},{oy + 128} {ox + 10},{oy + 128} {ox - 14},{oy + 128}" stroke="{MARK}" stroke-width="2" stroke-dasharray="4 4"/>'
    elif kind == 'decompression':
        s += f'<ellipse cx="{ox + 90}" cy="{oy + 136}" rx="32" ry="30" fill="{CYST}" stroke="{CYST_S}" stroke-width="2"/>'
        s += f'<ellipse cx="{ox + 90}" cy="{oy + 128}" rx="44" ry="42" fill="none" stroke="{CYST_S}" stroke-width="1.5" stroke-dasharray="4 4"/>'
        s += f'<rect x="{ox + 10}" y="{oy + 124}" width="62" height="10" rx="5" fill="#9ecbe0" stroke="#3c7d9c" stroke-width="1.5"/>'
    elif kind == 'ostectomy':
        s += cavity + window + shaved
    elif kind == 'carnoy':
        s += cavity + window + f'<ellipse cx="{ox + 90}" cy="{oy + 128}" rx="48" ry="46" fill="none" stroke="#2e8b57" stroke-width="7" stroke-opacity=".6"/>'
    elif kind == 'cryo':
        s += cavity + window + f'<ellipse cx="{ox + 90}" cy="{oy + 128}" rx="48" ry="46" fill="none" stroke="#5aa9e6" stroke-width="7" stroke-opacity=".7"/>'
        for a in range(0, 360, 45):
            x = ox + 90 + 30 * math.cos(math.radians(a)); y = oy + 128 + 30 * math.sin(math.radians(a))
            s += f'<path d="M{x - 4:.1f},{y:.1f} L{x + 4:.1f},{y:.1f} M{x:.1f},{y - 4:.1f} L{x:.1f},{y + 4:.1f}" stroke="#5aa9e6" stroke-width="2"/>'
    elif kind == 'fu':
        s += cavity + window + f'<ellipse cx="{ox + 90}" cy="{oy + 128}" rx="40" ry="38" fill="#fff3c4" stroke="#b8860b" stroke-width="2" stroke-dasharray="3 3"/>'
    elif kind == 'resection':
        s += cyst
        s += f'<path d="M{ox + 10},{oy - 20} L{ox + 170},{oy - 20} L{ox + 170},{oy + 215} L{ox + 10},{oy + 215} Z" fill="none" stroke="{MARK}" stroke-width="2.4" stroke-dasharray="7 5"/>'
    return s


def okc_svg():
    kinds = ['enucleation', 'marsupialisation', 'decompression', 'ostectomy', 'carnoy', 'cryo', 'fu', 'resection']
    b = (f'<defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">'
         f'<path d="M0,0 L10,5 L0,10 Z" fill="{MARK}"/></marker></defs>')
    for i, k in enumerate(kinds):
        ox = 40 + (i % 4) * 190; oy = 50 + (i // 4) * 270
        b += okc_panel(ox, oy, k) + mark(ox + 150, oy - 22, i + 1)
    return svg(800, 580, b)


for name, fn in (('fibula-flap', fibula_svg), ('radial-forearm-flap', rfff_svg), ('ameloblastoma-plate', amelo_svg), ('palate-cover-plate', mec_svg), ('okc-treatments', okc_svg)):
    open(os.path.join(OUT, name + '.svg'), 'w').write(fn())
    print('wrote', name)
