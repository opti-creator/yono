#!/usr/bin/env python3
"""Generate responsive, compressed variants of the supplied game logos.

Sources vary from 148px to 1254px square and are rendered at 96-120 CSS px.
This emits 96/192/256 WebP so the browser can pick per DPR instead of pulling a
1254px original for a thumbnail. Originals are left untouched.

Run: python3 tools/optimize-images.py
"""
import os, glob, json
from PIL import Image

SRC = "assets/img/games"
OUT = os.path.join(SRC, "opt")
WIDTHS = [96, 192, 256]
os.makedirs(OUT, exist_ok=True)

before = after = 0
made = {}
for path in sorted(glob.glob(os.path.join(SRC, "*"))):
    name = os.path.basename(path)
    if name.startswith(("_", ".")) or os.path.isdir(path):
        continue
    if not name.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
        continue
    slug = os.path.splitext(name)[0]
    before += os.path.getsize(path)
    im = Image.open(path)
    # Flatten onto the surface colour: several sources carry alpha that would
    # otherwise composite against white in some Android WebView builds.
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGBA", im.size, (16, 32, 24, 255))   # --color-surface
        im = Image.alpha_composite(bg, im).convert("RGB")
    else:
        im = im.convert("RGB")

    # square-crop centred so every card has an identical aspect ratio
    w, h = im.size
    if w != h:
        s = min(w, h)
        im = im.crop(((w - s) // 2, (h - s) // 2, (w + s) // 2, (h + s) // 2))

    sizes = []
    for width in WIDTHS:
        if width > im.size[0] * 2:      # never upscale beyond 2x the source
            continue
        r = im.resize((width, width), Image.LANCZOS)
        dst = os.path.join(OUT, f"{slug}-{width}.webp")
        r.save(dst, "WEBP", quality=82, method=6)
        after += os.path.getsize(dst)
        sizes.append(width)
    made[slug] = sizes

with open(os.path.join(OUT, "manifest.json"), "w") as f:
    json.dump(made, f, indent=1, sort_keys=True)

print(f"logos processed : {len(made)}")
print(f"variants written: {sum(len(v) for v in made.values())}")
print(f"originals       : {before//1024} KB")
print(f"optimised set   : {after//1024} KB")
largest = max((os.path.getsize(p), p) for p in glob.glob(os.path.join(OUT, "*.webp")))
print(f"largest variant : {largest[0]//1024} KB  {os.path.basename(largest[1])}")
