# Homepage hero render

Renders `public/assets/renders/wisdom-tooth-hero.webp` from `public/models/impacted-molar.glb` with model-viewer in headless Chromium.

```
pnpm install   # CHROMIUM_PATH optional: set it if Playwright cannot find its own browser
CHROMIUM_PATH=/path/to/chromium node tools/wisdom-tooth/hero/render.cjs '[["hero","camera-orbit=78deg 72deg 85%&shadow-intensity=0.8&shadow-softness=1&rough=0.9"]]'
python3 -c "from PIL import Image; Image.open('hero.png').convert('RGB').save('public/assets/renders/wisdom-tooth-hero.webp','WEBP',quality=86,method=6)"
```

The angle (78deg, slightly from above and in front) and matte finish (roughness 0.9, render only; the GLB keeps 0.7) keep the bone surface smooth with fewer stray highlights. Colours come from the GLB unchanged.
