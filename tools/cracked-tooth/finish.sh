#!/bin/sh
# Draco-compress the GLBs from build.py into the site folder and copy the print zips.
# Usage: sh finish.sh <build out dir> <repo>/public/cracked-tooth
set -e
src=$1; dst=$2
mkdir -p "$dst/models" "$dst/downloads"
for f in "$src"/*-whole.glb "$src"/*-cut.glb; do
  node "$(dirname "$0")/../glb/finish.mjs" "$f" --out "$dst/models/$(basename "$f")"
done
cp "$src"/vivatheca-cracked-tooth-*-3x.zip "$dst/downloads/"
