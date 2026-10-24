// Fill-in-the-blank drills, organized per module file. Each module file
// exports FILLS_BY_LESSON: Record<lessonNum, Fill[]> — lesson numbers are
// the single source of truth (no id parsing). Every fill's completed SQL
// is mechanically audited against the seed database by scripts/fill-audit.ts.
//
// XP: +8 per fill, +4 first-try bonus (gamification.XP). A miss anywhere
// enrolls the fill in the review deck (Leitner); recalls pay zero XP.

import type { Fill } from "../types";
import { FILLS_BY_LESSON as M1 } from "./m01";
import { FILLS_BY_LESSON as M2 } from "./m02";
import { FILLS_BY_LESSON as M3 } from "./m03";
import { FILLS_BY_LESSON as M4 } from "./m04";
import { FILLS_BY_LESSON as M5 } from "./m05";
import { FILLS_BY_LESSON as M6 } from "./m06";
import { FILLS_BY_LESSON as M7 } from "./m07";
import { FILLS_BY_LESSON as M8 } from "./m08";
import { FILLS_BY_LESSON as M9 } from "./m09";
import { FILLS_BY_LESSON as M10 } from "./m10";
import { FILLS_BY_LESSON as M11 } from "./m11";

const BY_LESSON: Array<Record<number, Fill[]>> = [M1, M2, M3, M4, M5, M6, M7, M8, M9, M10, M11];

const INDEX = new Map<number, Fill[]>();
for (const mod of BY_LESSON) {
  for (const [numStr, fills] of Object.entries(mod)) {
    const num = Number(numStr);
    const existing = INDEX.get(num) ?? [];
    INDEX.set(num, [...existing, ...fills]);
  }
}

/** All fills for one lesson, in authored order. */
export function fillsFor(lessonNum: number): Fill[] {
  return INDEX.get(lessonNum) ?? [];
}

/** Every fill in the course (audit + stats). */
export function allFills(): Fill[] {
  return [...INDEX.values()].flat();
}
