"use client";

// Figure registry: curriculum theory blocks reference a diagram by id,
// the renderer looks it up here. Unknown ids render a safe fallback so a
// typo can never crash a lesson.

import type { ComponentType } from "react";
import {
  L1Anatomy,
  L1Nulls,
  L1PkFk,
  L1Relations,
} from "./figures-l1";
import { L2Expressions, L2Projection, L2ResultSet, L2Star } from "./figures-l2";
import {
  L3Funnel,
  L3Like,
  L3Operators,
  L3Precedence,
  L3Venn,
} from "./figures-l3";
import {
  L4AggNull,
  L4BlackHole,
  L4Coalesce,
  L4Contagion,
  L4IsNull,
  L4Truth,
} from "./figures-l4";
import { L5Direction, L5Limit, L5Sort } from "./figures-l5";
import { L6Dedupe, L6Multi } from "./figures-l6";
import { L7Collapse, L7Counts, L7EmptySet, L7Mix } from "./figures-l7";
import {
  L8Alias,
  L8Buckets,
  L8Gates,
  L8MultiBuckets,
  L8Pitfall,
  L8Pipeline,
  L8WhereHaving,
} from "./figures-l8";

export const FIGURES: Record<string, ComponentType> = {
  "l1-anatomy": L1Anatomy,
  "l1-relations": L1Relations,
  "l1-pkfk": L1PkFk,
  "l1-nulls": L1Nulls,
  "l2-projection": L2Projection,
  "l2-star": L2Star,
  "l2-expressions": L2Expressions,
  "l2-resultset": L2ResultSet,
  "l3-funnel": L3Funnel,
  "l3-venn": L3Venn,
  "l3-operators": L3Operators,
  "l3-precedence": L3Precedence,
  "l3-like": L3Like,
  "l4-truth": L4Truth,
  "l4-blackhole": L4BlackHole,
  "l4-isnull": L4IsNull,
  "l4-aggnull": L4AggNull,
  "l4-contagion": L4Contagion,
  "l4-coalesce": L4Coalesce,
  "l5-sort": L5Sort,
  "l5-direction": L5Direction,
  "l5-limit": L5Limit,
  "l6-dedupe": L6Dedupe,
  "l6-multi": L6Multi,
  "l7-collapse": L7Collapse,
  "l7-counts": L7Counts,
  "l7-mix": L7Mix,
  "l7-emptyset": L7EmptySet,
  "l8-buckets": L8Buckets,
  "l8-gates": L8Gates,
  "l8-pipeline": L8Pipeline,
  "l8-alias": L8Alias,
  "l8-pitfall": L8Pitfall,
  "l8-multibuckets": L8MultiBuckets,
  "l8-wherehaving": L8WhereHaving,
};

export function Diagram({ figure }: { figure: string }) {
  const Cmp = FIGURES[figure];
  if (!Cmp) {
    return (
      <div className="my-4 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-xs text-amber-200">
        Unknown diagram: <code className="font-mono">{figure}</code>
      </div>
    );
  }
  return <Cmp />;
}
