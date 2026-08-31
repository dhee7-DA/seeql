"use client";

// Module 2 lesson figures (lessons 09–16) — second, concept-deep diagram per
// lesson. Same drawing kit as diagrams.tsx; registry merged there.

import type { FigureId } from "@/lib/curriculum/types";

export const FIGURES_M2: Partial<Record<FigureId, () => React.JSX.Element>> = {};
