"use client";

// Module 1 figure wave (batch 9-b): lessons 4–6 — NULL, ORDER BY/LIMIT,
// DISTINCT theory expansion. Same contract as every module file: 720-wide
// viewBox, kit primitives only, Tailwind palette classes, framer-motion fade
// reveals, every number painted is real — verified against the seeded
// storefront (103 orders, 16 customers, region split 8/5/2/1).

import { motion } from "framer-motion";
import type { FigureId } from "@/lib/curriculum/types";
import { Arrow, Label, Panel, Pipe, XMark, fade } from "./diagrams-kit";

/* ---------------- figures (9-b owns everything below) ---------------- */

function L43vlTable() {
  const lanes: Array<{ test: string; verdict: string; keep: boolean; note: string }> = [
    { test: "total = 1088.44", verdict: "TRUE", keep: true, note: "row #74 — kept" },
    { test: "total = 1088.44", verdict: "FALSE", keep: false, note: "row #43 (945.21) — dropped" },
    { test: "total = 1088.44", verdict: "UNKNOWN", keep: false, note: "total is NULL — dropped" },
  ];
  return (
    <svg viewBox="0 0 720 230" className="w-full" role="img" aria-label="Three-valued logic: WHERE keeps only rows where the predicate is TRUE; FALSE and UNKNOWN are both dropped">
      <motion.g {...fade(0)}>
        <Label x={30} y={34} cls="fill-zinc-300">WHERE total = 1088.44 — three possible verdicts per row</Label>
      </motion.g>
      {lanes.map((lane, i) => {
        const y = 52 + i * 52;
        const keep = lane.keep;
        return (
          <motion.g key={lane.verdict} {...fade(0.15 * i + 0.1)}>
            <Panel x={30} y={y} w={430} h={40} cls={keep ? "fill-zinc-900 stroke-emerald-700/60" : "fill-zinc-900 stroke-zinc-800"} />
            <Label x={46} y={y + 25} cls="fill-zinc-300">{lane.test}</Label>
            <Label x={300} y={y + 25} cls={lane.verdict === "TRUE" ? "fill-emerald-400" : lane.verdict === "FALSE" ? "fill-rose-400" : "fill-amber-400"}>{lane.verdict}</Label>
            <Arrow x1={466} y1={y + 20} x2={keep ? 530 : 530} y2={keep ? y + 20 : y + 20} cls={keep ? "stroke-emerald-600" : "stroke-zinc-700"} />
            <Panel x={540} y={y} w={150} h={40} cls={keep ? "fill-emerald-950/50 stroke-emerald-700/60" : "fill-zinc-950 stroke-zinc-800"} />
            <Label x={615} y={y + 25} anchor="middle" cls={keep ? "fill-emerald-300" : "fill-zinc-600"}>{keep ? "in result" : "discarded"}</Label>
            <Label x={46} y={y + 50} cls="fill-zinc-500" size={10}>{lane.note}</Label>
          </motion.g>
        );
      })}
      <motion.g {...fade(0.8)}>
        <Label x={360} y={222} anchor="middle" cls="fill-zinc-500">WHERE keeps TRUE only — FALSE and UNKNOWN get identical treatment, which is why NULL rows quietly vanish</Label>
      </motion.g>
    </svg>
  );
}

/* --- lesson 4: NULL rows slide out of WHERE with the FALSE rows, silently --- */

function L4NullDropped() {
  const rows: Array<{ city: string | null; verdict: "TRUE" | "FALSE" | "UNKNOWN" }> = [
    { city: "Berlin", verdict: "TRUE" },
    { city: "São Paulo", verdict: "FALSE" },
    { city: "Lyon", verdict: "FALSE" },
    { city: null, verdict: "UNKNOWN" },
    { city: "Tallinn", verdict: "FALSE" },
    { city: "Austin", verdict: "FALSE" },
    { city: null, verdict: "UNKNOWN" },
    { city: "Dubai", verdict: "FALSE" },
  ];
  return (
    <svg viewBox="0 0 720 258" className="w-full" role="img" aria-label="WHERE city = 'Berlin': the TRUE row survives; FALSE rows and NULL rows are dropped together, silently — no error, no warning">
      <motion.g {...fade(0)}>
        <Label x={30} y={24} cls="fill-zinc-300">WHERE city = 'Berlin' — an 8-row slice; suppose two customers have no city on file</Label>
      </motion.g>
      <motion.g {...fade(0.05)}>
        <Label x={30} y={46} cls="fill-zinc-500" size={10}>customer rows</Label>
        <Label x={190} y={46} cls="fill-zinc-500" size={10}>verdict</Label>
        <Label x={430} y={46} anchor="middle" cls="fill-zinc-500" size={10}>gate</Label>
        <Label x={560} y={46} cls="fill-zinc-500" size={10}>result</Label>
      </motion.g>
      {rows.map((row, i) => {
        const y = 56 + i * 21;
        const isTrue = row.verdict === "TRUE";
        const isNull = row.city === null;
        const panelCls = isTrue
          ? "fill-emerald-950/50 stroke-emerald-700/60"
          : isNull
            ? "fill-amber-950/30 stroke-amber-700/50"
            : "fill-zinc-900 stroke-zinc-800";
        const verdictCls = isTrue ? "fill-emerald-400" : isNull ? "fill-amber-400" : "fill-rose-400";
        return (
          <motion.g key={i} {...fade(0.1 + i * 0.06)}>
            <Panel x={30} y={y} w={150} h={17} cls={panelCls} />
            <Label x={40} y={y + 13} cls={isNull ? "fill-amber-400" : "fill-zinc-300"} size={10}>{row.city ?? "NULL"}</Label>
            <Label x={190} y={y + 13} cls={verdictCls} size={10}>{row.verdict}</Label>
          </motion.g>
        );
      })}
      <motion.g {...fade(0.65)}>
        <Arrow x1={246} y1={128} x2={364} y2={128} cls="stroke-zinc-600" />
        <Panel x={370} y={100} w={120} h={56} cls="fill-zinc-900 stroke-sky-700/60" />
        <Label x={430} y={122} anchor="middle" cls="fill-sky-300" size={10}>WHERE</Label>
        <Label x={430} y={139} anchor="middle" cls="fill-zinc-200" size={10}>city = 'Berlin'</Label>
      </motion.g>
      <motion.g {...fade(0.85)}>
        <Arrow x1={494} y1={112} x2={554} y2={92} cls="stroke-emerald-600" />
        <Arrow x1={494} y1={144} x2={554} y2={166} cls="stroke-zinc-600" />
      </motion.g>
      <motion.g {...fade(0.95)}>
        <Panel x={560} y={66} w={130} h={44} cls="fill-emerald-950/50 stroke-emerald-700/60" />
        <Label x={625} y={86} anchor="middle" cls="fill-emerald-300">Berlin</Label>
        <Label x={625} y={101} anchor="middle" cls="fill-emerald-400" size={10}>1 row kept</Label>
      </motion.g>
      <motion.g {...fade(1.05)}>
        <Panel x={560} y={148} w={130} h={66} cls="fill-zinc-950 stroke-rose-900/60" />
        <Label x={568} y={166} cls="fill-rose-300" size={10}>7 rows dropped</Label>
        <Label x={568} y={182} cls="fill-zinc-500" size={10}>5 × FALSE</Label>
        <Label x={568} y={196} cls="fill-amber-400" size={10}>2 × UNKNOWN</Label>
        <XMark x={676} y={162} cls="stroke-rose-500" delay={1.15} />
        <XMark x={676} y={192} cls="stroke-rose-500" delay={1.2} />
      </motion.g>
      <motion.g {...fade(1.25)}>
        <Label x={360} y={246} anchor="middle" cls="fill-zinc-500">FALSE and UNKNOWN sink together — no error, no warning; that silence is how NULL bugs survive testing</Label>
      </motion.g>
    </svg>
  );
}

/* --- lesson 5: the real top-3 podium --- */

function L5TopN() {
  return (
    <svg viewBox="0 0 720 248" className="w-full" role="img" aria-label="Podium of the three biggest orders: number 74 with 1088.44 first, number 43 with 945.21 second, number 39 with 845.92 third">
      <motion.g {...fade(0)}>
        <Label x={30} y={24} cls="fill-zinc-300">SELECT id, total FROM orders ORDER BY total DESC LIMIT 3</Label>
      </motion.g>
      <motion.g {...fade(0.1)}>
        <Label x={30} y={42} cls="fill-zinc-500" size={10}>sort all 103 orders by total, descending — then keep the first three rows</Label>
      </motion.g>
      <motion.g {...fade(0.15)}>
        <Arrow x1={370} y1={64} x2={370} y2={78} cls="stroke-zinc-600" />
        <Label x={382} y={74} cls="fill-zinc-500" size={10}>total DESC</Label>
      </motion.g>
      <motion.g {...fade(0.2)}>
        <Panel x={100} y={210} w={540} h={8} cls="fill-zinc-900 stroke-zinc-800" />
      </motion.g>
      <motion.g {...fade(0.3)}>
        <Panel x={460} y={175} w={160} h={35} cls="fill-zinc-900 stroke-zinc-800" />
        <Label x={540} y={197} anchor="middle" cls="fill-zinc-500">3rd</Label>
      </motion.g>
      <motion.g {...fade(0.42)}>
        <Label x={540} y={163} anchor="middle" cls="fill-zinc-300" size={12}>#39 — 845.92</Label>
      </motion.g>
      <motion.g {...fade(0.55)}>
        <Panel x={120} y={150} w={160} h={60} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={200} y={186} anchor="middle" cls="fill-zinc-400">2nd</Label>
      </motion.g>
      <motion.g {...fade(0.67)}>
        <Label x={200} y={138} anchor="middle" cls="fill-zinc-200" size={12}>#43 — 945.21</Label>
      </motion.g>
      <motion.g {...fade(0.8)}>
        <Panel x={290} y={110} w={160} h={100} cls="fill-emerald-950/50 stroke-emerald-700/60" />
        <Label x={370} y={170} anchor="middle" cls="fill-emerald-400">1st</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <Label x={370} y={96} anchor="middle" cls="fill-emerald-300" size={13}>#74 — 1088.44</Label>
      </motion.g>
      <motion.g {...fade(1.25)}>
        <Label x={360} y={238} anchor="middle" cls="fill-zinc-500">LIMIT has no meaning until ORDER BY fixes an order — sort first, then slice off the head</Label>
      </motion.g>
    </svg>
  );
}

/* --- lesson 5: OFFSET pages over the sorted list --- */

function L5OffsetPages() {
  const bars: Array<{ id: number; total: number }> = [
    { id: 74, total: 1088.44 },
    { id: 43, total: 945.21 },
    { id: 39, total: 845.92 },
    { id: 15, total: 826.03 },
    { id: 57, total: 785.79 },
    { id: 3, total: 767.64 },
    { id: 6, total: 752.96 },
    { id: 5, total: 725.34 },
    { id: 20, total: 705.39 },
    { id: 14, total: 705.23 },
    { id: 89, total: 684.53 },
    { id: 71, total: 668.45 },
  ];
  return (
    <svg viewBox="0 0 720 268" className="w-full" role="img" aria-label="Twelve orders sorted by total descending, split into pages: OFFSET 10 skips rows 1 to 10 and LIMIT 5 opens the page 3 window on rows 11 onward">
      <motion.g {...fade(0)}>
        <Label x={30} y={24} cls="fill-zinc-300">Sort first, then slice — page 3 of the 103 orders, sorted by total DESC (top 12 shown)</Label>
      </motion.g>
      <motion.g {...fade(0.05)}>
        <Label x={30} y={46} cls="fill-rose-300" size={10}>OFFSET 10 skips rows 1–10</Label>
      </motion.g>
      {bars.map((bar, i) => {
        const y = 54 + i * 15;
        const w = Math.round((bar.total / 1088.44) * 220) + 6;
        const win = i >= 10;
        return (
          <motion.g key={bar.id} {...fade(0.1 + i * 0.05)}>
            <Label x={204} y={y + 10} anchor="end" cls={win ? "fill-emerald-300" : "fill-zinc-400"} size={10}>{`#${bar.id} · ${bar.total.toFixed(2)}`}</Label>
            <Panel x={210} y={y} w={w} h={11} cls={win ? "fill-emerald-900/60 stroke-emerald-600" : "fill-zinc-800 stroke-zinc-700"} />
          </motion.g>
        );
      })}
      <motion.g {...fade(0.75)}>
        <Pipe pts={[[36, 54], [26, 54], [26, 200], [36, 200]]} cls="stroke-rose-700" delay={0.75} />
      </motion.g>
      <motion.g {...fade(0.8)}>
        <Pipe pts={[[450, 54], [462, 54], [462, 125], [450, 125]]} cls="stroke-zinc-600" delay={0.8} />
        <Label x={472} y={93} cls="fill-zinc-400" size={10}>page 1 · rows 1–5</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <Pipe pts={[[450, 129], [462, 129], [462, 200], [450, 200]]} cls="stroke-zinc-600" delay={0.9} />
        <Label x={472} y={168} cls="fill-zinc-400" size={10}>page 2 · rows 6–10</Label>
      </motion.g>
      <motion.g {...fade(1.0)}>
        <Pipe pts={[[450, 204], [462, 204], [462, 230], [450, 230]]} cls="stroke-emerald-600" delay={1.0} />
        <Label x={472} y={213} cls="fill-emerald-300" size={11}>page 3</Label>
        <Label x={472} y={227} cls="fill-zinc-500" size={10}>LIMIT 5 OFFSET 10</Label>
        <Label x={472} y={241} cls="fill-zinc-500" size={10}>→ rows 11–15 · stack stops at 12</Label>
      </motion.g>
      <motion.g {...fade(1.2)}>
        <Label x={360} y={260} anchor="middle" cls="fill-zinc-500">page 3 of a 5-per-page pager = LIMIT 5 OFFSET 10 — sort the list, skip ten, keep five</Label>
      </motion.g>
    </svg>
  );
}

/* --- lesson 6: one table, two lenses (city vs region variety) --- */

function L6CityVsRegion() {
  const cities = [
    "Austin", "Berlin", "Chicago", "Cork",
    "Dubai", "Hamburg", "London", "Lyon",
    "Madrid", "Milan", "Mumbai", "Nagoya",
    "Osaka", "Seoul", "São Paulo", "Tallinn",
  ];
  const regions: Array<{ name: string; n: number }> = [
    { name: "EU", n: 8 },
    { name: "APAC", n: 5 },
    { name: "US", n: 2 },
    { name: "LATAM", n: 1 },
  ];
  return (
    <svg viewBox="0 0 720 260" className="w-full" role="img" aria-label="The same 16 customers through two lenses: DISTINCT city keeps 16 rows because every city is unique, while DISTINCT region folds them into 4 rows with counts 8, 5, 2 and 1">
      <motion.g {...fade(0)}>
        <Label x={30} y={24} cls="fill-zinc-300">One table, two lenses — DISTINCT measures the variety of the column you select</Label>
      </motion.g>
      <motion.g {...fade(0.1)}>
        <Panel x={30} y={40} w={300} h={178} cls="fill-zinc-900 stroke-zinc-800" />
        <Label x={44} y={60} cls="fill-zinc-300" size={10}>SELECT DISTINCT city → 16 rows</Label>
      </motion.g>
      {cities.map((city, i) => {
        const cx = 44 + (i % 4) * 72;
        const cy = 72 + Math.floor(i / 4) * 30;
        return (
          <motion.g key={city} {...fade(0.2 + i * 0.035)}>
            <Panel x={cx} y={cy} w={66} h={24} cls="fill-zinc-800 stroke-zinc-700" />
            <Label x={cx + 33} y={cy + 16} anchor="middle" cls="fill-zinc-300" size={10}>{city}</Label>
          </motion.g>
        );
      })}
      <motion.g {...fade(0.75)}>
        <Label x={44} y={204} cls="fill-zinc-500" size={10}>every city unique — nothing to dedupe</Label>
      </motion.g>
      <motion.g {...fade(0.85)}>
        <Arrow x1={336} y1={129} x2={394} y2={129} cls="stroke-zinc-600" />
        <Label x={365} y={117} anchor="middle" cls="fill-zinc-500" size={10}>same rows</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <Panel x={400} y={40} w={290} h={178} cls="fill-zinc-900 stroke-zinc-800" />
        <Label x={414} y={60} cls="fill-zinc-300" size={10}>SELECT DISTINCT region → 4 rows</Label>
      </motion.g>
      {regions.map((region, i) => {
        const ry = 74 + i * 34;
        const bw = region.n * 13;
        return (
          <motion.g key={region.name} {...fade(1.05 + i * 0.1)}>
            <Panel x={414} y={ry} w={96} h={26} cls="fill-sky-950/40 stroke-sky-700/60" />
            <Label x={424} y={ry + 17} cls="fill-sky-200">{region.name}</Label>
            <Panel x={520} y={ry + 5} w={bw} h={16} cls="fill-sky-800/60 stroke-sky-600/70" />
            <Label x={520 + bw + 8} y={ry + 17} cls="fill-sky-300" size={10}>{`×${region.n}`}</Label>
          </motion.g>
        );
      })}
      <motion.g {...fade(1.5)}>
        <Label x={360} y={246} anchor="middle" cls="fill-zinc-500">city passes through untouched; region folds 16 rows into 4 — same table, different variety</Label>
      </motion.g>
    </svg>
  );
}

/* --- lesson 6: two-column DISTINCT keeps unique combinations --- */

function L6PairDistinct() {
  const raw: string[] = [
    "EU · 1", "EU · 1", "APAC · 1", "EU · 1",
    "US · 1", "EU · 0", "APAC · 1", "EU · 1",
    "LATAM · 1", "EU · 1", "APAC · 0", "EU · 1",
    "US · 1", "APAC · 1", "EU · 1", "APAC · 1",
  ];
  const pairs: Array<{ label: string }> = [
    { label: "EU · 1 — ×7" },
    { label: "APAC · 1 — ×4" },
    { label: "US · 1 — ×2" },
    { label: "EU · 0 — ×1" },
    { label: "APAC · 0 — ×1" },
    { label: "LATAM · 1 — ×1" },
  ];
  return (
    <svg viewBox="0 0 720 262" className="w-full" role="img" aria-label="DISTINCT region and active: 16 raw output rows collapse to 6 unique pairs, EU and APAC appearing both active and churned, US and LATAM only active">
      <motion.g {...fade(0)}>
        <Label x={30} y={24} cls="fill-zinc-300">SELECT DISTINCT region, active FROM customers — 16 rows in, 6 unique pairs out</Label>
      </motion.g>
      <motion.g {...fade(0.05)}>
        <Label x={40} y={46} cls="fill-zinc-500" size={10}>16 output rows (region · active)</Label>
      </motion.g>
      {raw.map((label, i) => {
        const px = i % 2 === 0 ? 40 : 134;
        const py = 52 + Math.floor(i / 2) * 22;
        return (
          <motion.g key={i} {...fade(0.1 + i * 0.03)}>
            <Panel x={px} y={py} w={86} h={18} cls="fill-zinc-800 stroke-zinc-700" />
            <Label x={px + 43} y={py + 13} anchor="middle" cls="fill-zinc-300" size={10}>{label}</Label>
          </motion.g>
        );
      })}
      <motion.g {...fade(0.65)}>
        <Arrow x1={232} y1={132} x2={306} y2={132} cls="stroke-zinc-600" />
        <Label x={269} y={120} anchor="middle" cls="fill-zinc-500" size={10}>whole rows</Label>
      </motion.g>
      <motion.g {...fade(0.75)}>
        <Panel x={316} y={40} w={374} h={194} cls="fill-zinc-900 stroke-zinc-800" />
        <Label x={330} y={60} cls="fill-emerald-300" size={11}>6 unique pairs survive</Label>
      </motion.g>
      {pairs.map((pair, i) => {
        const qx = i % 2 === 0 ? 330 : 512;
        const qy = 74 + Math.floor(i / 2) * 38;
        return (
          <motion.g key={pair.label} {...fade(0.85 + i * 0.08)}>
            <Panel x={qx} y={qy} w={168} h={30} cls="fill-emerald-950/50 stroke-emerald-700/60" />
            <Label x={qx + 84} y={qy + 19} anchor="middle" cls="fill-emerald-200">{pair.label}</Label>
          </motion.g>
        );
      })}
      <motion.g {...fade(1.3)}>
        <Label x={330} y={206} cls="fill-zinc-500" size={10}>churned (active = 0) exists only in EU and APAC</Label>
      </motion.g>
      <motion.g {...fade(1.45)}>
        <Label x={360} y={252} anchor="middle" cls="fill-zinc-500">DISTINCT judges whole output rows — with two columns it's the combination that must be new</Label>
      </motion.g>
    </svg>
  );
}

export const FIGURES_M1B: Partial<Record<FigureId, () => React.JSX.Element>> = {
  "l4-3vl-table": L43vlTable,
  "l4-null-dropped": L4NullDropped,
  "l5-top-n": L5TopN,
  "l5-offset-pages": L5OffsetPages,
  "l6-city-vs-region": L6CityVsRegion,
  "l6-pair-distinct": L6PairDistinct,
};
