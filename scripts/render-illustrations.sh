#!/usr/bin/env bash
# Rasterizes assets/illustrations/*.svg into transparent @3x PNGs in assets/images/illustrations/.
# React Native's <Image> can't render SVG on native, so the app ships PNGs; edit the SVG and re-run.
# Requires Google Chrome (used headless as the renderer).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/assets/illustrations"
OUT="$ROOT/assets/images/illustrations"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
SCALE=3
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"

for svg in "$SRC"/*.svg; do
  name="$(basename "$svg" .svg)"
  w=$(sed -nE 's/.*<svg[^>]* width="([0-9]+)".*/\1/p' "$svg" | head -1)
  h=$(sed -nE 's/.*<svg[^>]* height="([0-9]+)".*/\1/p' "$svg" | head -1)
  pw=$((w * SCALE)); ph=$((h * SCALE))
  cp "$svg" "$TMP/$name.svg"
  cat > "$TMP/$name.html" <<HTML
<html><body style="margin:0;background:transparent"><img src="$name.svg" style="display:block;width:${pw}px;height:${ph}px"></body></html>
HTML
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 \
    --window-size="$pw,$ph" --screenshot="$OUT/$name.png" "file://$TMP/$name.html" >/dev/null 2>&1
  echo "$name.png (${pw}x${ph})"
done
