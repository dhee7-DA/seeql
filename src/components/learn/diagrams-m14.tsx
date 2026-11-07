"use client";

// Module 14 figures — dimensional modeling, the messy intake and the mart.
// Same kit language as every bank: 720-wide viewBox, Tailwind palette
// classes so the theme engine re-skins each figure, fade choreography.
// All numbers are the live-verified warehouse facts (scripts/warehouse-facts.ts,
// scripts/scale-probe.ts): fact_sales 239 lines · dim_date 425 · dim_customer
// 21 versions over 16 buyers · fact_returns 14 · events_dirty 627 = 584+26+17.

import { motion } from "framer-motion";
import type { FigureId } from "@/lib/curriculum/types";
import {
  Arrow,
  fade,
  Label,
  Panel,
} from "./diagrams-kit";

/* ---------- lesson 66 — the star: one fact, four conformed dims ---------- */

function M14StarMap() {
  const dims: Array<[string, string, string, number, number]> = [
    // label, sub, accent, x, y
    ["dim_date", "425 days · 2024-01-01 → 2025-02-28", "text-sky-300", 26, 34],
    ["dim_product", "16 products → Tech / Lifestyle rollup", "text-emerald-300", 470, 34],
    ["dim_customer", "SCD 2 — 21 versions over 16 buyers", "text-amber-300", 26, 216],
    ["dim_store", "4 locations · Berlin → São Paulo", "text-violet-300", 470, 216],
  ];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Star schema: fact_sales at the center holding 239 sale lines keyed by four surrogate keys, surrounded by the four dimension tables it shares with fact_returns">
      <motion.g {...fade(0)}>
        <Label x={26} y={18} cls="fill-zinc-500" size={9}>the star — one fact at the center, every spoke a surrogate key (239 sale lines)</Label>
      </motion.g>
      {dims.map(([name, sub, accent, x, y], i) => (
        <motion.g key={name} {...fade(0.15 + i * 0.12)}>
          <Panel x={x} y={y} w={224} h={52} cls="fill-zinc-900 stroke-zinc-700" />
          <Label x={x + 12} y={y + 20} cls={accent} size={11} bold>{name}</Label>
          <Label x={x + 12} y={y + 38} cls="fill-zinc-500" size={8}>{sub}</Label>
        </motion.g>
      ))}
      <motion.g {...fade(0.7)}>
        <Panel x={248} y={112} w={224} h={72} cls="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={360} y={134} anchor="middle" cls="fill-emerald-300" size={12} bold>fact_sales</Label>
        <Label x={360} y={152} anchor="middle" cls="fill-zinc-400" size={8}>one row per order LINE of a non-cancelled order</Label>
        <Label x={360} y={168} anchor="middle" cls="fill-zinc-500" size={8}>date_key · customer_key · product_key · store_key</Label>
      </motion.g>
      {[[138, 86, 316, 112], [582, 86, 404, 112], [138, 216, 316, 184], [582, 216, 404, 184]].map(([x1, y1, x2, y2], i) => (
        <motion.g key={i} {...fade(0.8 + i * 0.05)}>
          <Arrow x1={x1} y1={y1} x2={x2} y2={y2} cls="stroke-zinc-600" />
        </motion.g>
      ))}
      <motion.g {...fade(0.95)}>
        <Panel x={248} y={240} w={224} h={40} cls="fill-zinc-900 stroke-zinc-700" dash="3 3" />
        <Label x={360} y={256} anchor="middle" cls="fill-zinc-300" size={9} bold>fact_returns — 14 lines</Label>
        <Label x={360} y={270} anchor="middle" cls="fill-zinc-500" size={8}>re-uses the SAME four dimensions (conformance)</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 67 — SCD Type 2: Bruno's two versions ---------- */

function M14ScdTimeline() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="SCD Type 2 timeline for buyer 2: version 3 holds LATAM from 1900-01-01 until 2024-08-01, version 4 holds US from 2024-08-01 to the open end; a sale on 2024-09-15 resolves to the US version">
      <motion.g {...fade(0)}>
        <Label x={26} y={18} cls="fill-zinc-500" size={9}>SCD Type 2 — buyer 2 (Bruno) moved US-ward on 2024-08-01; two rows, half-open [from, to)</Label>
      </motion.g>
      <motion.g {...fade(0.15)}>
        <line x1={46} y1={140} x2={694} y2={140} className="stroke-zinc-700" />
        {["1900-01-01", "2024-08-01", "9999-12-31"].map((t, i) => (
          <g key={t}>
            <line x1={i === 0 ? 46 : i === 1 ? 360 : 674} y1={134} x2={i === 0 ? 46 : i === 1 ? 360 : 674} y2={146} className="stroke-zinc-500" />
            <Label x={i === 0 ? 46 : i === 1 ? 360 : 674} y={162} anchor="middle" cls="fill-zinc-400" size={9}>{t}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.3)}>
        <Panel x={46} y={60} w={314} h={44} cls="fill-zinc-900 stroke-amber-400/60" />
        <Label x={60} y={78} cls="fill-amber-300" size={10} bold>sk 3 · LATAM · is_current 0</Label>
        <Label x={60} y={94} cls="fill-zinc-500" size={8}>valid_from 1900-01-01 · valid_to 2024-08-01</Label>
      </motion.g>
      <motion.g {...fade(0.45)}>
        <Panel x={360} y={60} w={314} h={44} cls="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={374} y={78} cls="fill-emerald-300" size={10} bold>sk 4 · US · is_current 1</Label>
        <Label x={374} y={94} cls="fill-zinc-500" size={8}>valid_from 2024-08-01 · valid_to 9999-12-31 (open end)</Label>
      </motion.g>
      <motion.g {...fade(0.6)}>
        <Panel x={250} y={196} w={220} h={58} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={360} y={216} anchor="middle" cls="fill-zinc-200" size={9} bold>sale on 2024-09-15 — which region?</Label>
        <Label x={360} y={234} anchor="middle" cls="fill-emerald-300" size={9}>as-of probe picks sk 4 → US</Label>
      </motion.g>
      <motion.g {...fade(0.75)}>
        <Arrow x1={360} y1={196} x2={430} y2={106} cls="stroke-emerald-400/60" />
        <Label x={26} y={216} cls="fill-zinc-500" size={8}>16 buyers → 21 versions</Label>
        <Label x={26} y={230} cls="fill-zinc-500" size={8}>5 movers, 11 unchanged</Label>
        <Label x={26} y={244} cls="fill-zinc-500" size={8}>every fact row carries the sk,</Label>
        <Label x={26} y={258} cls="fill-zinc-500" size={8}>never the business id</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <Label x={26} y={284} cls="fill-zinc-500" size={8}>Type 1 would have overwritten LATAM → US and erased the question; Type 2 keeps both answers, each true in its window.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 71 — the conformed bus: two facts, one vocabulary ---------- */

function M14ConformedBus() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Bus matrix: fact_sales and fact_returns both keyed by the same four conformed dimensions; joining the two facts directly at row level would multiply refunds — they meet only at the dimension grain">
      <motion.g {...fade(0)}>
        <Label x={26} y={18} cls="fill-zinc-500" size={9}>the bus matrix — every fact row shares the same dimension handle</Label>
      </motion.g>
      <motion.g {...fade(0.15)}>
        <Panel x={26} y={38} w={200} h={54} cls="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={126} y={60} anchor="middle" cls="fill-emerald-300" size={11} bold>fact_sales</Label>
        <Label x={126} y={78} anchor="middle" cls="fill-zinc-500" size={8}>239 sale lines</Label>
        <Panel x={26} y={196} w={200} h={54} cls="fill-zinc-900 stroke-amber-400/60" />
        <Label x={126} y={218} anchor="middle" cls="fill-amber-300" size={11} bold>fact_returns</Label>
        <Label x={126} y={236} anchor="middle" cls="fill-zinc-500" size={8}>14 return lines</Label>
      </motion.g>
      <motion.g {...fade(0.35)}>
        {[
          ["dim_date", "sale date vs return date", 40],
          ["dim_product", "same 16 products", 104],
          ["dim_customer", "re-resolved at RETURN date", 168],
          ["dim_store", "same 4 stores", 232],
        ].map(([name, note, y], i) => (
          <g key={i}>
            <Panel x={306} y={y as number} w={388} h={50} cls="fill-zinc-900 stroke-zinc-700" />
            <Label x={320} y={(y as number) + 20} cls="fill-sky-300" size={10} bold>{name}</Label>
            <Label x={320} y={(y as number) + 37} cls="fill-zinc-500" size={8}>{note}</Label>
            <motion.g {...fade(0.5 + i * 0.08)}>
              <Arrow x1={226} y1={i < 2 ? 65 : 223} x2={306} y2={(y as number) + 25} cls="stroke-emerald-400/50" />
              <Arrow x1={226} y1={i < 2 ? 223 : 65} x2={306} y2={(y as number) + 25} cls="stroke-amber-400/50" />
            </motion.g>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.9)}>
        <Panel x={26} y={260} w={668} h={28} cls="fill-zinc-900 stroke-amber-400/50" />
        <Label x={42} y={278} cls="fill-amber-300" size={9}>the one fan-out left: fact JOIN fact — 227 Tech sale lines × 12 Tech returns would price every refund twelve-fold. Meet at the grain, not the rows.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 72 — the mart stack and its three gates ---------- */

function M14MartLayers() {
  const layers: Array<[string, string, string, string]> = [
    ["sources", "storefront · books · logs — row-level truth", "stroke-zinc-700", "fill-zinc-400"],
    ["staging", "triage + fingerprint clean (lesson 70)", "stroke-zinc-700", "fill-zinc-300"],
    ["star", "fact_sales 239 · fact_returns 14 · four dims (65–67)", "stroke-emerald-400/60", "fill-emerald-300"],
    ["grammar", "rollups · drill-downs · pivots · ratios (68)", "stroke-zinc-700", "fill-zinc-300"],
    ["mart", "mart_department_quarter — 8 cells, materialized", "stroke-violet-400/60", "fill-violet-300"],
  ];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="The warehouse stack: sources feed staging, the star, the grammar and finally the metrics mart, which passes three quality gates before dashboards read it">
      <motion.g {...fade(0)}>
        <Label x={26} y={18} cls="fill-zinc-500" size={9}>the one-pager pipeline — every layer derived from the one below, every number countable</Label>
      </motion.g>
      {layers.map(([name, sub, border, accent], i) => (
        <motion.g key={name} {...fade(0.12 + i * 0.1)}>
          <Panel x={26} y={32 + i * 44} w={430} h={38} cls={`fill-zinc-900 ${border}`} />
          <Label x={42} y={50 + i * 44} cls={accent} size={10} bold>{name}</Label>
          <Label x={130} y={50 + i * 44} cls="fill-zinc-500" size={8}>{sub}</Label>
          {i < 4 && <Arrow x1={241} y1={70 + i * 44} x2={241} y2={76 + i * 44} cls="stroke-zinc-600" />}
        </motion.g>
      ))}
      <motion.g {...fade(0.7)}>
        <Panel x={496} y={164} w={198} h={128} cls="fill-zinc-900 stroke-amber-400/60" />
        <Label x={595} y={184} anchor="middle" cls="fill-amber-300" size={10} bold>three gates</Label>
        <Label x={510} y={206} cls="fill-zinc-300" size={8}>1 · grain — 8 rows = 8 cells</Label>
        <Label x={510} y={224} cls="fill-zinc-300" size={8}>2 · reconciliation — cents = cents</Label>
        <Label x={510} y={242} cls="fill-zinc-300" size={8}>3 · shares — 100 ± 0.1 / quarter</Label>
        <Label x={510} y={266} cls="fill-zinc-500" size={8}>a failing gate never publishes</Label>
      </motion.g>
      <motion.g {...fade(0.85)}>
        <Arrow x1={456} y1={201} x2={496} y2={210} cls="stroke-amber-400/60" />
        <Arrow x1={694} y1={228} x2={456} y2={228} cls="stroke-zinc-600" />
        <Label x={560} y={278} anchor="middle" cls="fill-zinc-500" size={8}>dashboards read the mart blind — the gates make that safe</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 69 — the dirty log's census ---------- */

function L69DirtyCensus() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Triage census of the 627-row event log: 584 known users, 26 anonymous, 17 bot orphans; 89 drifted timestamps, 163 whitespace pages, 9 action spellings folding to 4, 8 pages folding to 6, 5 broken money rows">
      <motion.g {...fade(0)}>
        <Label x={26} y={18} cls="fill-zinc-500" size={9}>the hand-me-down log — 627 rows, January 2025, six planted dirt classes (all countable)</Label>
      </motion.g>
      <motion.g {...fade(0.15)}>
        <Panel x={26} y={36} w={668} h={54} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={58} cls="fill-zinc-200" size={10} bold>who sent it?</Label>
        <Label x={42} y={76} cls="fill-zinc-400" size={9}>584 known users · 26 anonymous (user_id NULL) · 17 bot orphans (ids 901+)</Label>
      </motion.g>
      <motion.g {...fade(0.35)}>
        {[
          ["drifted timestamps", "89", "space instead of T — text sorts break"],
          ["whitespace pages", "163", "' home' vs 'home' — a trim away"],
          ["action spellings", "9 → 4", "case + padding variants of four verbs"],
          ["page spellings", "8 → 6", "two variants fold into their canonical"],
          ["broken money", "5", "'12,500' · 'n/a' · '—' — text in a number column"],
        ].map(([cls, n, note], i) => (
          <g key={i}>
            <Panel x={26 + (i % 3) * 227} y={112 + Math.floor(i / 3) * 74} w={214} h={62} cls="fill-zinc-900 stroke-zinc-700" />
            <Label x={40 + (i % 3) * 227} y={132 + Math.floor(i / 3) * 74} cls="fill-amber-300" size={10} bold>{cls} — {n}</Label>
            <Label x={40 + (i % 3) * 227} y={150 + Math.floor(i / 3) * 74} cls="fill-zinc-500" size={8}>{note}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.7)}>
        <Panel x={26} y={258} w={668} h={28} cls="fill-zinc-900 stroke-emerald-400/50" />
        <Label x={42} y={276} cls="fill-emerald-300" size={9}>the contract that survives: numeric money sums to exactly $32,171.47 — 582 clean rows vs 45 quarantine-able copies. Triage before cleaning.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 70 — the staging pipeline ---------- */

function L70CleanPipeline() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="The staging pattern: 627 raw rows flow through the fingerprint dedupe into 582 clean rows and a 45-row quarantine — 38 replay pairs plus one 8-copy burst — and the publish gate reconciles money on both sides">
      <motion.g {...fade(0)}>
        <Label x={26} y={18} cls="fill-zinc-500" size={9}>the staging pattern — read the raw log, fingerprint it, land clean rows, gate the publish</Label>
      </motion.g>
      <motion.g {...fade(0.15)}>
        <Panel x={26} y={52} w={180} h={72} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={116} y={78} anchor="middle" cls="fill-zinc-200" size={11} bold>raw log</Label>
        <Label x={116} y={96} anchor="middle" cls="fill-zinc-500" size={9}>627 rows · as delivered</Label>
        <Label x={116} y={112} anchor="middle" cls="fill-zinc-500" size={8}>dirt included, by design</Label>
      </motion.g>
      <motion.g {...fade(0.3)}>
        <Panel x={266} y={52} w={188} h={72} cls="fill-zinc-900 stroke-sky-400/60" />
        <Label x={360} y={74} anchor="middle" cls="fill-sky-300" size={10} bold>fingerprint</Label>
        <Label x={360} y={92} anchor="middle" cls="fill-zinc-500" size={8}>(ts, user, lower(action),</Label>
        <Label x={360} y={106} anchor="middle" cls="fill-zinc-500" size={8}>trim(page), amount)</Label>
      </motion.g>
      <motion.g {...fade(0.45)}>
        <Arrow x1={206} y1={88} x2={266} y2={88} cls="stroke-zinc-600" />
      </motion.g>
      <motion.g {...fade(0.55)}>
        <Panel x={514} y={30} w={180} h={54} cls="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={604} y={50} anchor="middle" cls="fill-emerald-300" size={10} bold>clean · 582</Label>
        <Label x={604} y={68} anchor="middle" cls="fill-zinc-500" size={8}>classes 584 / 26 / 17</Label>
        <Panel x={514} y={96} w={180} h={54} cls="fill-zinc-900 stroke-amber-400/60" />
        <Label x={604} y={116} anchor="middle" cls="fill-amber-300" size={10} bold>quarantine · 45</Label>
        <Label x={604} y={134} anchor="middle" cls="fill-zinc-500" size={8}>38 replay pairs + burst of 8</Label>
      </motion.g>
      <motion.g {...fade(0.7)}>
        <Arrow x1={454} y1={78} x2={514} y2={57} cls="stroke-emerald-400/60" />
        <Arrow x1={454} y1={98} x2={514} y2={123} cls="stroke-amber-400/60" />
      </motion.g>
      <motion.g {...fade(0.8)}>
        <Panel x={26} y={172} w={668} h={54} cls="fill-zinc-900 stroke-violet-400/50" />
        <Label x={42} y={192} cls="fill-violet-300" size={10} bold>publish gate — reconciliation on BOTH sides</Label>
        <Label x={42} y={210} cls="fill-zinc-400" size={9}>money $32,171.47 clean == $32,171.47 raw-numeric · classes 539/26/17 · user 5: 145 → 138 (burst copies gone)</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <Panel x={26} y={240} w={668} h={46} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={258} cls="fill-zinc-300" size={9} bold>why a table, not a view</Label>
        <Label x={42} y={276} cls="fill-zinc-500" size={8}>the clean set is derived ONCE, deterministically — dashboards read the landed rows; the raw log stays untouched as the receipt trail</Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- registry ---------------- */

export const FIGURES_M14: Partial<Record<FigureId, () => React.JSX.Element>> = {
  "m14-star-map": M14StarMap,
  "m14-scd-timeline": M14ScdTimeline,
  "m14-conformed-bus": M14ConformedBus,
  "m14-mart-layers": M14MartLayers,
  "l69-dirty-census": L69DirtyCensus,
  "l70-clean-pipeline": L70CleanPipeline,
};
