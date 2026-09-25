"""Contact sheet of the matted 3D icons on a dark + light split background,
to check edge quality, halos and framing at a glance."""

from pathlib import Path

from PIL import Image

ICONS = Path("public/icons3d")
COLS, CELL = 7, 140

names = sorted(p.stem for p in ICONS.glob("*.png") if p.stem != "timer-3d")
rows = (len(names) + COLS - 1) // COLS

sheet = Image.new("RGB", (COLS * CELL, rows * CELL * 2), (24, 24, 27))
light = Image.new("RGB", (COLS * CELL, rows * CELL), (244, 244, 245))

for i, name in enumerate(names):
    im = Image.open(ICONS / f"{name}.png").convert("RGBA").resize((96, 96), Image.LANCZOS)
    x = (i % COLS) * CELL + (CELL - 96) // 2
    y1 = (i // COLS) * CELL + (CELL - 96) // 2
    y2 = y1 + rows * CELL
    sheet.paste(im, (x, y1), im)
    light.paste(im, (x, y2 - rows * CELL), im) if False else light.paste(im, (x, (i // COLS) * CELL + (CELL - 96) // 2), im)

combo = Image.new("RGB", (COLS * CELL, rows * CELL * 3), (24, 24, 27))
combo.paste(sheet, (0, 0))
combo.paste(light, (0, rows * CELL * 2 - rows * CELL))
# simpler: stack dark band then light band
combo = Image.new("RGB", (COLS * CELL, rows * CELL * 2), (0, 0, 0))
combo.paste(sheet.crop((0, 0, COLS * CELL, rows * CELL)), (0, 0))
combo.paste(light, (0, rows * CELL))
combo.save("qa-shots/icons3d-contact.png")
print(f"{len(names)} icons -> qa-shots/icons3d-contact.png")
