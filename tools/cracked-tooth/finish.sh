#!/bin/sh
# Draco-compress the GLBs from build.py into the site folder and copy the print zips.
# Usage: sh finish.sh <build out dir> <repo>/public/cracked-tooth
set -e
src=$1; dst=$2
mkdir -p "$dst/models" "$dst/downloads"
for f in "$src"/*-whole.glb "$src"/*-cut.glb; do
  npx -y @gltf-transform/cli@4.1.1 draco "$f" "$dst/models/$(basename "$f")"
done
cp "$src"/vivatheca-cracked-tooth-*-3x.zip "$dst/downloads/"
