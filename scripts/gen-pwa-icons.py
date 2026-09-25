#!/usr/bin/env python3
"""Generate PWA icons for SeeQL from the 3D clay db icon.

Design: flat zinc-950 rounded-square canvas, the clay db icon centered at
74% (cy 0.488 — the project's framing convention). Variants:
  - pwa-192.png / pwa-512.png        any-purpose install icons
  - pwa-maskable-512.png             maskable safe zone (icon at 62%)
  - apple-touch-icon.png             180px, opaque (iOS flattens alpha)
"""
from PIL import Image, ImageDraw

SRC = "public/icons3d/db.png"
OUT = "public/icons"

BG = (9, 9, 11, 255)  # zinc-950

src = Image.open(SRC).convert("RGBA")


def canvas(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), BG)
    # subtle emerald ring inset — the brand accent, hairline
    d = ImageDraw.Draw(img)
    inset = max(2, size // 170)
    d.rounded_rectangle(
        [inset, inset, size - inset, size - inset],
        radius=size // 5,
        outline=(52, 211, 153, 60),  # emerald-400 @ ~24%
        width=max(2, size // 128),
    )
    return img


def place(img: Image.Image, icon_pct: float, cy: float = 0.488) -> Image.Image:
    size = img.size[0]
    icon = src.resize((int(size * icon_pct), int(size * icon_pct)), Image.LANCZOS)
    x = (size - icon.size[0]) // 2
    y = int(size * cy) - icon.size[1] // 2
    img.alpha_composite(icon, (x, y))
    return img


import os

os.makedirs(OUT, exist_ok=True)

# any-purpose icons: rounded square, icon at 74%
for s in (192, 512):
    place(canvas(s), 0.74).convert("RGB").save(f"{OUT}/pwa-{s}.png")

# maskable: full-bleed square bg (mask crops to circle/rounded), icon inside
# the 80% safe zone -> icon at 62% keeps clay edges clear of the crop
place(canvas(512), 0.62, cy=0.5).save(f"{OUT}/pwa-maskable-512.png")

# apple touch icon: 180px, fully opaque
place(canvas(180), 0.74).convert("RGB").save(f"{OUT}/apple-touch-icon.png")

print("wrote:", sorted(os.listdir(OUT)))
