#!/usr/bin/env python3
"""Task 16 refactor: diagrams.tsx imports shared kit instead of defining helpers."""
import re, sys

P = "src/components/learn/diagrams.tsx"
src = open(P).read()

start = src.index("/* ---------------- shared bits ---------------- */")
end = src.index("/* ---------------- figures ---------------- */")

kit_import = """/* ---------------- shared bits ---------------- */

import {
  Arrow,
  ArrowHead,
  DotField,
  Label,
  Link,
  MONO,
  Panel,
  Pipe,
  XMark,
  drawIn,
  fade,
  rng,
} from "./diagrams-kit";

"""

src = src[:start] + kit_import + src[end:]

# registry: partial type + merge of module registries
src = src.replace(
    'const FIGURES: Record<FigureId, () => React.JSX.Element> = {',
    'const FIGURES: Partial<Record<FigureId, () => React.JSX.Element>> = {\n  ...FIGURES_M2,\n  ...FIGURES_M3,',
)
src = src.replace(
    'import type { FigureId } from "@/lib/curriculum/types";',
    'import type { FigureId } from "@/lib/curriculum/types";\nimport { FIGURES_M2 } from "./diagrams-m2";\nimport { FIGURES_M3 } from "./diagrams-m3";',
)
open(P, "w").write(src)

# report helper usage inside the remaining figure code
body = src[src.index("/* ---------------- figures ---------------- */"):]
for h in ["MONO", "Label", "ArrowHead", "Arrow(", "drawIn", "Link(", "Pipe(", "XMark", "Panel(", "fade(", "rng(", "DotField"]:
    n = len(re.findall(re.escape(h), body))
    print(f"{h}: {n}")
