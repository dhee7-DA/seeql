"use client";

// Module 16 figures — the dialect map, the type ladders, the playbook.
// Same kit language: 720-wide viewBox, Tailwind palette, fade choreography.

import { motion } from "framer-motion";
import type { FigureId } from "@/lib/curriculum/types";
import {
  fade,
  Label,
  Panel,
} from "./diagrams-kit";

/* ---------- lesson 76 — the dialect map ---------- */

function L76DialectMap() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="The dialect map: five portable ideas — date difference, concatenation, missing values, row limits, quoting — with SQLite spelling in the center and the engine forks listed beside each">
      <motion.g {...fade(0)}>
        <Label x={26} y={18} cls="fill-zinc-500" size={9}>the dialect map — five ideas, one course engine, ~15 spellings</Label>
      </motion.g>
      {[
        ["date difference", "julianday(a) - julianday(b)", "DATE_DIFF · DATEDIFF · AGE"],
        ["concatenate", "a || b", "MySQL CONCAT (and || means OR!)"],
        ["missing value", "IFNULL / COALESCE", "NVL · ISNULL"],
        ["row limit", "LIMIT n OFFSET m", "TOP n · FETCH FIRST"],
        ["quoting", "\"x\"", "`x` · [x] — MySQL's \"x\" is a string"],
      ].map(([idea, local, forks], i) => (
        <motion.g key={i} {...fade(0.12 + i * 0.12)}>
          <Panel x={26} y={34 + i * 50} w={190} h={42} cls="fill-zinc-900 stroke-zinc-700" />
          <Label x={38} y={52 + i * 50} cls="fill-zinc-200" size={9} bold>{idea}</Label>
          <Label x={38} y={68 + i * 50} cls="fill-zinc-500" size={8}>the portable idea</Label>
          <Panel x={224} y={34 + i * 50} w={224} h={42} cls="fill-zinc-900 stroke-emerald-400/60" />
          <Label x={234} y={52 + i * 50} cls="fill-emerald-300" size={8} bold>{local}</Label>
          <Label x={234} y={68 + i * 50} cls="fill-zinc-500" size={8}>SQLite — this course</Label>
          <Panel x={456} y={34 + i * 50} w={238} h={42} cls="fill-zinc-900 stroke-amber-400/60" />
          <Label x={466} y={52 + i * 50} cls="fill-amber-300" size={8} bold>{forks}</Label>
          <Label x={466} y={68 + i * 50} cls="fill-zinc-500" size={8}>the forks you&apos;ll meet</Label>
        </motion.g>
      ))}
      <motion.g {...fade(0.8)}>
        <Panel x={26} y={262} w={668} h={26} cls="fill-zinc-900 stroke-violet-400/50" />
        <Label x={42} y={279} cls="fill-violet-300" size={9}>the skill: identify the engine → extract the meaning → write the local spelling → verify against known data</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 77 — the type ladders ---------- */

function L77TypeLadders() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Type and NULL ladders: five expressions with SQLite's verdict and the engine forks — integer division, division by zero, forgiving casts, silent zeros, cross-type equality — plus the guard-cast-substitute pattern">
      <motion.g {...fade(0)}>
        <Label x={26} y={18} cls="fill-zinc-500" size={9}>quiet forks — same query, different answers; guard, don&apos;t guess</Label>
      </motion.g>
      {[
        ["1/2", "0 — integer division", "Postgres/MySQL/Oracle: also 0 · BigQuery literals differ"],
        ["1/0", "NULL — no error", "Postgres/MySQL/BigQuery: ERROR — loud is portable"],
        ["CAST('129.90' AS INTEGER)", "129 — truncate", "Postgres/BigQuery: error — route through REAL"],
        ["CAST('abc' AS INTEGER)", "0 — silent zero", "SAFE_CAST/TRY_CAST: NULL · Postgres: error"],
        ["1 = '1'", "FALSE — storage classes", "MySQL: TRUE (coerces) · Postgres: type error"],
      ].map(([expr, here, forks], i) => (
        <motion.g key={i} {...fade(0.12 + i * 0.12)}>
          <Panel x={26} y={34 + i * 44} w={218} h={36} cls="fill-zinc-900 stroke-zinc-700" />
          <Label x={36} y={50 + i * 44} cls="fill-zinc-200" size={8} bold>{expr}</Label>
          <Panel x={252} y={34 + i * 44} w={196} h={36} cls="fill-zinc-900 stroke-emerald-400/60" />
          <Label x={262} y={50 + i * 44} cls="fill-emerald-300" size={8} bold>{here}</Label>
          <Panel x={456} y={34 + i * 44} w={238} h={36} cls="fill-zinc-900 stroke-amber-400/60" />
          <Label x={466} y={50 + i * 44} cls="fill-amber-300" size={8}>{forks}</Label>
        </motion.g>
      ))}
      <motion.g {...fade(0.8)}>
        <Panel x={26} y={258} w={668} h={30} cls="fill-zinc-900 stroke-sky-400/50" />
        <Label x={42} y={270} cls="fill-sky-300" size={9} bold>the portable pattern: guard → cast → substitute</Label>
        <Label x={42} y={284} cls="fill-zinc-400" size={8}>GLOB decides who converts · CAST converts · COALESCE substitutes — three steps, every engine, no silent divergence</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 78 — the portable playbook ---------- */

function L78PortablePlaybook() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="The portability playbook: a wide portable core, a care layer, and isolated seams — QUALIFY becomes a CTE, arrays become json shims, INTERVAL becomes modifier strings, NULLS LAST becomes a boolean key">
      <motion.g {...fade(0)}>
        <Label x={26} y={18} cls="fill-zinc-500" size={9}>the playbook — core by default, seams at the edges, prove every translation</Label>
      </motion.g>
      <motion.g {...fade(0.15)}>
        <Panel x={26} y={36} w={208} h={150} cls="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={130} y={56} anchor="middle" cls="fill-emerald-300" size={10} bold>the portable core</Label>
        <Label x={38} y={76} cls="fill-zinc-400" size={8}>SELECT / WHERE / GROUP BY</Label>
        <Label x={38} y={92} cls="fill-zinc-400" size={8}>standard joins · set ops</Label>
        <Label x={38} y={108} cls="fill-zinc-400" size={8}>ORDER BY · paging · CTEs</Label>
        <Label x={38} y={124} cls="fill-zinc-400" size={8}>window functions</Label>
        <Label x={38} y={148} cls="fill-zinc-500" size={8}>~90% of business queries</Label>
        <Label x={38} y={164} cls="fill-zinc-500" size={8}>never leave this column</Label>
      </motion.g>
      <motion.g {...fade(0.3)}>
        <Panel x={258} y={36} w={208} h={150} cls="fill-zinc-900 stroke-amber-400/60" />
        <Label x={362} y={56} anchor="middle" cls="fill-amber-300" size={10} bold>care + test both</Label>
        <Label x={270} y={76} cls="fill-zinc-400" size={8}>SUBSTR spellings</Label>
        <Label x={270} y={92} cls="fill-zinc-400" size={8}>COALESCE family</Label>
        <Label x={270} y={108} cls="fill-zinc-400" size={8}>CASE ladders · ROUND</Label>
        <Label x={270} y={124} cls="fill-zinc-400" size={8}>boolean ORDER BY keys</Label>
        <Label x={270} y={148} cls="fill-zinc-500" size={8}>same idea, small forks —</Label>
        <Label x={270} y={164} cls="fill-zinc-500" size={8}>test the result, not the syntax</Label>
      </motion.g>
      <motion.g {...fade(0.45)}>
        <Panel x={490} y={36} w={204} h={150} cls="fill-zinc-900 stroke-violet-400/60" />
        <Label x={592} y={56} anchor="middle" cls="fill-violet-300" size={10} bold>isolate the seams</Label>
        <Label x={502} y={76} cls="fill-zinc-400" size={8}>QUALIFY → CTE + WHERE</Label>
        <Label x={502} y={92} cls="fill-zinc-400" size={8}>ARRAY/STRUCT → json_*</Label>
        <Label x={502} y={108} cls="fill-zinc-400" size={8}>INTERVAL → modifiers</Label>
        <Label x={502} y={124} cls="fill-zinc-400" size={8}>month math → the 1st</Label>
        <Label x={502} y={148} cls="fill-zinc-500" size={8}>one seam, one contract,</Label>
        <Label x={502} y={164} cls="fill-zinc-500" size={8}>tested against two engines</Label>
      </motion.g>
      <motion.g {...fade(0.6)}>
        <Panel x={26} y={200} w={668} h={60} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={220} cls="fill-zinc-200" size={9} bold>the proof discipline — every translation verified output-identical</Label>
        <Label x={42} y={238} cls="fill-zinc-400" size={8}>16 latest orders either way · 230 two-item carts either way · 52/30/14/7 either way — a rewrite that changes the answer changed the meaning</Label>
        <Label x={42} y={254} cls="fill-zinc-500" size={8}>ties (ROW_NUMBER vs MAX) · NULLs (three states in JSON) · boundaries (the month clamp) — where compilers lie</Label>
      </motion.g>
      <motion.g {...fade(0.8)}>
        <Panel x={26} y={270} w={668} h={20} cls="fill-zinc-900 stroke-zinc-800" />
        <Label x={42} y={284} cls="fill-zinc-500" size={8}>identify → extract → rewrite → verify — the method that makes engine migrations survivable</Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- registry ---------------- */

export const FIGURES_M16: Partial<Record<FigureId, () => React.JSX.Element>> = {
  "l76-dialect-map": L76DialectMap,
  "l77-type-ladders": L77TypeLadders,
  "l78-portable-playbook": L78PortablePlaybook,
};
