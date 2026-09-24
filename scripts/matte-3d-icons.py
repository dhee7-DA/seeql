# Matte the generated 3D icon stills into transparent RGBA masters.
#
# Faithful still-image port of github.com/samyost1/3dicon (MIT) iconloop/matte.py:
#   - alpha from the isnet-general-use matting model (rembg)
#   - foreground colour SOLVED exactly, not guessed:
#       F = a*C + (1-a)*BG  =>  C = (F - (1-a)*BG) / a
#     with BG measured from the frame corners (the model drifts a level or two)
#   - framing normalised the same way: square canvas, object at ~74% with a
#     little headroom below centre (cy 0.488), mastered at 512px.
#
# Usage:
#   python3 scripts/matte-3d-icons.py test   # first icon only
#   python3 scripts/matte-3d-icons.py all    # every still not yet matted

import sys
from pathlib import Path

import numpy as np
from PIL import Image

STILLS = Path("scripts/3dicon-ref/stills")
OUT = Path("public/icons3d")

# isnet-general-use, benchmarked against ground-truth alpha on 3D icon art
# in the original repo: 0.0043 MAE at a fraction of birefnet's cost.
MODEL = "isnet-general-use"
MASTER = 512


def matte_one(path: Path) -> None:
    from rembg import new_session, remove

    im = Image.open(path).convert("RGB")
    F = np.asarray(im, dtype=np.float32)

    # Measure the backing from the corners rather than trusting the constant:
    # generated renders drift a level or two across the frame.
    bg = np.concatenate(
        [
            F[:14, :14].reshape(-1, 3),
            F[:14, -14:].reshape(-1, 3),
            F[-14:, :14].reshape(-1, 3),
            F[-14:, -14:].reshape(-1, 3),
        ]
    ).mean(0)

    a = np.asarray(remove(im, session=SESSION), dtype=np.float32)[..., 3] / 255.0

    safe = np.maximum(a, 1e-3)[..., None]
    col = np.clip((F - (1 - a[..., None]) * bg) / safe, 0, 255)
    col = np.where(a[..., None] > 0.004, col, bg)

    rgba = np.dstack([col.astype(np.uint8), (a * 255).clip(0, 255).astype(np.uint8)])
    src = Image.fromarray(rgba, "RGBA")

    # Normalise framing: object at ~74% of the canvas, centred, slight
    # headroom below centre so it sits well above a label.
    tw, th, tcx, tcy = 0.74, 0.74, 0.5, 0.488
    ys, xs = np.nonzero(a > 0.5)
    if len(xs) == 0:
        raise SystemExit(f"no foreground found in {path}")
    ow = xs.max() - xs.min() + 1
    oh = ys.max() - ys.min() + 1
    ocx = (xs.max() + xs.min()) / 2
    ocy = (ys.max() + ys.min()) / 2
    canvas = max(ow / tw, oh / th)
    x0, y0 = ocx - tcx * canvas, ocy - tcy * canvas

    side = int(np.ceil(canvas))
    pad = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    pad.paste(src, (int(round(-x0)), int(round(-y0))))
    pad.resize((MASTER, MASTER), Image.LANCZOS).save(OUT / f"{path.stem}.png")
    print(f"+ {path.stem} -> {OUT / (path.stem + '.png')}  bg={bg.round(1)}")


def main() -> None:
    mode = sys.argv[1] if len(sys.argv) > 1 else "test"
    OUT.mkdir(parents=True, exist_ok=True)
    paths = sorted(p for p in STILLS.glob("*.png"))
    if mode == "test":
        paths = paths[:1]
    todo = [
        p
        for p in paths
        if not (OUT / f"{p.stem}.png").exists()
        or (OUT / f"{p.stem}.png").stat().st_mtime < p.stat().st_mtime
    ]
    if not todo:
        print("nothing to matte")
        return

    global SESSION
    from rembg import new_session

    SESSION = new_session(MODEL)  # first run downloads the ~170MB model
    for p in todo:
        matte_one(p)
    print(f"done — matted {len(todo)} icon(s)")


if __name__ == "__main__":
    main()
