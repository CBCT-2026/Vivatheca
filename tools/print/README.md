# Print-file helpers

`manifold_tools.py` wraps [manifold3d](https://github.com/elalish/manifold) (Apache-2.0) so that print
files are always closed, watertight meshes: fragment removal, magnet pockets (6 x 2 mm, 0.2 mm
clearance, as in mandible-modular-v0), plane splits for modular parts, and scale presets.

```
pip install manifold3d trimesh numpy
python3 tools/print/manifold_tools.py   # self-test
```

Use it from a model's build script (see the docstring for each function). The stainless steel crown
generator (`tools/ssc/generate.py`) already uses manifold3d directly for its booleans; the head and neck
print files (planned) should use these helpers for the magnet pockets and segment cuts.
