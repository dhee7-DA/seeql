"use client";

// Module 15 figures — the million-row firehose, its indexes, its anti-patterns.
// Same kit language: 720-wide viewBox, Tailwind palette classes, fade
// choreography. All numbers are live-verified (scripts/l74-probe.ts,
// scripts/l75-probe.ts): 1,010,317 rows · 10,317 excess · 198 matches for
// user 4321 · 49,075 phantom comparisons · 402 dirty money rows.

import { motion } from "framer-motion";
import type { FigureId } from "@/lib/curriculum/types";
import {
  Arrow,
  fade,
  Label,
  Panel,
} from "./diagrams-kit";

/* ---------- lesson 73 — the firehose, composed and priced ---------- */

function L73FirehoseScale() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="The million-row firehose: 1,000,000 generated rows plus 10,310 replays plus a 7-copy burst make 1,010,317 rows carrying six dirt classes, with three measured costs — 13 ms to count, 45 ms to filter, 470 ms to fold">
      <motion.g {...fade(0)}>
        <Label x={26} y={18} cls="fill-zinc-500" size={9}>the firehose — deterministic dirt at ×1,600 dose, every number re-queryable</Label>
      </motion.g>
      <motion.g {...fade(0.15)}>
        <Panel x={26} y={34} w={430} h={64} cls="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={42} y={56} cls="fill-emerald-300" size={11} bold>1,010,317 rows</Label>
        <Label x={42} y={74} cls="fill-zinc-400" size={9}>= 1,000,000 generated + 10,310 replay copies + one 7-copy burst</Label>
        <Label x={42} y={90} cls="fill-zinc-500" size={8}>one recursive-CTE INSERT, arithmetic on the row index — same output everywhere</Label>
      </motion.g>
      <motion.g {...fade(0.3)}>
        {[
          ["10,311 dup groups", "10,317 excess rows"],
          ["10,310 NULL users", "9,901 bot orphans"],
          ["43,926 drifted ts", "91,847 padded pages"],
          ["402 dirty strings", "5,000 real users"],
        ].map(([a, b], i) => (
          <g key={i}>
            <Panel x={26 + (i % 2) * 218} y={112 + Math.floor(i / 2) * 46} w={206} h={38} cls="fill-zinc-900 stroke-zinc-700" />
            <Label x={40 + (i % 2) * 218} y={127 + Math.floor(i / 2) * 46} cls="fill-amber-300" size={9} bold>{a}</Label>
            <Label x={40 + (i % 2) * 218} y={142 + Math.floor(i / 2) * 46} cls="fill-zinc-400" size={9}>{b}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.55)}>
        <Panel x={496} y={34} w={198} h={162} cls="fill-zinc-900 stroke-sky-400/60" />
        <Label x={595} y={54} anchor="middle" cls="fill-sky-300" size={10} bold>measured, unindexed</Label>
        <Label x={510} y={76} cls="fill-zinc-300" size={9}>COUNT(*) · 13 ms</Label>
        <Label x={510} y={94} cls="fill-zinc-300" size={9}>point filter · 45 ms</Label>
        <Label x={510} y={112} cls="fill-zinc-300" size={9}>canonical fold · ~470 ms</Label>
        <Label x={510} y={136} cls="fill-zinc-500" size={8}>every cost linear in N —</Label>
        <Label x={510} y={150} cls="fill-zinc-500" size={8}>the plan names the shape,</Label>
        <Label x={510} y={164} cls="fill-zinc-500" size={8}>the minimum of three names</Label>
        <Label x={510} y={178} cls="fill-zinc-500" size={8}>the price</Label>
      </motion.g>
      <motion.g {...fade(0.75)}>
        <Panel x={26} y={216} w={668} h={70} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={236} cls="fill-zinc-200" size={10} bold>the contract: same six dirt classes as the 627-row log, same canonical forms, same fingerprint</Label>
        <Label x={42} y={254} cls="fill-zinc-400" size={9}>1,000,000 distinct fingerprints — the clean set is the generator's promise, provable in one query</Label>
        <Label x={42} y={272} cls="fill-zinc-500" size={8}>money stays TEXT by design: 1,482,453,292 trusted cents behind GLOB '[0-9]*' + CAST, 402 rejects counted</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 74 — the index economics ---------- */

function L74IndexEconomics() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Index economics: the plan flips from SCAN to SEARCH USING COVERING INDEX after one CREATE INDEX, five tree shapes serve five query shapes, and every tree pays a write tax on every insert">
      <motion.g {...fade(0)}>
        <Label x={26} y={18} cls="fill-zinc-500" size={9}>index economics — the flip, the shapes, the standing tax</Label>
      </motion.g>
      <motion.g {...fade(0.15)}>
        <Panel x={26} y={34} w={314} h={56} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={56} cls="fill-zinc-300" size={10} bold>before: SCAN events_scale</Label>
        <Label x={42} y={74} cls="fill-zinc-500" size={8}>1,010,317 row visits for 198 matches · ~45 ms</Label>
        <Panel x={380} y={34} w={314} h={56} cls="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={396} y={56} cls="fill-emerald-300" size={10} bold>after: SEARCH … COVERING INDEX (user_id=?)</Label>
        <Label x={396} y={74} cls="fill-zinc-500" size={8}>descent + 198 entries · table untouched</Label>
        <Arrow x1={340} y1={62} x2={380} y2={62} cls="stroke-emerald-400/60" />
      </motion.g>
      <motion.g {...fade(0.35)}>
        {[
          ["point filter", "(user_id) — or the composite", "SEARCH (user_id=?)"],
          ["filter + sort", "(user_id, event_ts) — equality first", "no temp b-tree"],
          ["canonical census", "expression: LOWER(TRIM(action))", "ordered walk = the GROUP BY"],
          ["bot slice (1%)", "partial: WHERE user_id >= 9000", "SEARCH (user_id>?)"],
          ["humans (complement)", "none — the partial tree holds only bots", "honest SCAN"],
        ].map(([shape, tree, plan], i) => (
          <g key={i}>
            <Panel x={26} y={106 + i * 30} w={200} h={26} cls="fill-zinc-900 stroke-zinc-700" />
            <Label x={34} y={123 + i * 30} cls="fill-zinc-300" size={8} bold>{shape}</Label>
            <Panel x={230} y={106 + i * 30} w={268} h={26} cls="fill-zinc-900 stroke-zinc-700" />
            <Label x={238} y={123 + i * 30} cls="fill-sky-300" size={8}>{tree}</Label>
            <Panel x={502} y={106 + i * 30} w={192} h={26} cls="fill-zinc-900 stroke-zinc-700" />
            <Label x={510} y={123 + i * 30} cls="fill-emerald-300" size={8}>{plan}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.8)}>
        <Panel x={26} y={262} w={668} h={26} cls="fill-zinc-900 stroke-amber-400/50" />
        <Label x={42} y={279} cls="fill-amber-300" size={9}>the standing tax: every tree is maintained on EVERY INSERT — two indexes means three trees per row; a full build reads and sorts all 1,010,317 rows once</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 75 — the four anti-patterns, with receipts ---------- */

function L75AntiPatterns() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Four anti-patterns with million-row receipts: text comparison counts 49,075 phantom rows, SUBSTR forecloses every tree, SELECT star ships six columns nobody reads, raw SUM silently zeroes 402 rows — each with its rewrite">
      <motion.g {...fade(0)}>
        <Label x={26} y={18} cls="fill-zinc-500" size={9}>the four, with receipts — invisible at 103 rows, measurable at 1,010,317</Label>
      </motion.g>
      {[
        ["TEXT as magnitude", "amount_cents > '1500' → 362,311", "GLOB + CAST → 313,236 true"],
        ["function on the column", "SUBSTR(event_ts,1,7) — SCAN forever", "bare half-open range — same 84,482"],
        ["SELECT * at scale", "6 TEXT columns × 1,010,317 rows shipped", "name the columns — covering becomes possible"],
        ["raw SUM over mixed TEXT", "402 rows silently zeroed — no error", "GLOB guard + CAST, exclusions counted"],
      ].map(([name, wrong, right], i) => (
        <motion.g key={i} {...fade(0.12 + i * 0.12)}>
          <Panel x={26} y={34 + i * 50} w={210} h={42} cls="fill-zinc-900 stroke-zinc-700" />
          <Label x={38} y={52 + i * 50} cls="fill-zinc-200" size={9} bold>{name}</Label>
          <Label x={38} y={68 + i * 50} cls="fill-zinc-500" size={8}>the habit from small data</Label>
          <Panel x={244} y={34 + i * 50} w={224} h={42} cls="fill-zinc-900 stroke-amber-400/60" />
          <Label x={254} y={52 + i * 50} cls="fill-amber-300" size={8} bold>{wrong}</Label>
          <Label x={254} y={68 + i * 50} cls="fill-zinc-500" size={8}>what it costs here</Label>
          <Panel x={476} y={34 + i * 50} w={218} h={42} cls="fill-zinc-900 stroke-emerald-400/60" />
          <Label x={486} y={52 + i * 50} cls="fill-emerald-300" size={8} bold>{right}</Label>
          <Label x={486} y={68 + i * 50} cls="fill-zinc-500" size={8}>the rewrite, outputs identical</Label>
          <Arrow x1={468} y1={55 + i * 50} x2={476} y2={55 + i * 50} cls="stroke-emerald-400/60" />
        </motion.g>
      ))}
      <motion.g {...fade(0.7)}>
        <Panel x={26} y={240} w={668} h={46} cls="fill-zinc-900 stroke-violet-400/50" />
        <Label x={42} y={258} cls="fill-violet-300" size={9} bold>the invariant that makes speed safe: outputs identical, always</Label>
        <Label x={42} y={276} cls="fill-zinc-400" size={8}>84,482 = 84,482 · 202,069 = 202,069 · 1,000,000 fingerprints either way — compare counts explicitly, then believe the clock</Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- registry ---------------- */

export const FIGURES_M15: Partial<Record<FigureId, () => React.JSX.Element>> = {
  "l73-firehose-scale": L73FirehoseScale,
  "l74-index-economics": L74IndexEconomics,
  "l75-anti-patterns": L75AntiPatterns,
};
