"use client";

// Module 1 figure wave (batch 9-c): lessons 7, 8 + 35 — aggregates,
// GROUP BY/HAVING, case study. Same contract: 720-wide viewBox, kit
// primitives only, Tailwind palette classes, framer-motion fades, every
// number painted is real — verified against the seeded storefront
// (103 orders → delivered 52 / shipped 30 / pending 14 / cancelled 7).

import { motion } from "framer-motion";
import type { FigureId } from "@/lib/curriculum/types";
import { Arrow, DotField, Label, Panel, XMark, fade } from "./diagrams-kit";

/* ---------------- figures (9-c owns everything below) ---------------- */

function L8StatusBuckets() {
  const buckets: Array<{ status: string; n: number; color: string }> = [
    { status: "delivered", n: 52, color: "stroke-emerald-700/60" },
    { status: "shipped", n: 30, color: "stroke-sky-700/60" },
    { status: "pending", n: 14, color: "stroke-amber-700/60" },
    { status: "cancelled", n: 7, color: "stroke-rose-700/60" },
  ];
  return (
    <svg viewBox="0 0 720 260" className="w-full" role="img" aria-label="GROUP BY status: 103 order rows fall into four buckets, one result row per bucket">
      <motion.g {...fade(0)}>
        <Panel x={24} y={40} w={150} h={180} />
        <Label x={99} y={28} anchor="middle" cls="fill-zinc-300">orders — 103 rows</Label>
        {[70, 94, 118, 142].map((y, i) => (
          <Label key={y} x={99} y={y} anchor="middle" cls="fill-zinc-500" size={10}>
            {["shipped", "delivered", "pending", "cancelled", "delivered"][i]}
          </Label>
        ))}
        <Label x={99} y={170} anchor="middle" cls="fill-zinc-600" size={10}>… 99 more rows</Label>
      </motion.g>
      {buckets.map((b, i) => {
        const y = 40 + i * 48;
        return (
          <motion.g key={b.status} {...fade(0.15 * i + 0.3)}>
            <Arrow x1={180} y1={130} x2={252} y2={y + 20} cls="stroke-zinc-600" />
            <Panel x={260} y={y} w={210} h={40} cls={`fill-zinc-900 ${b.color}`} />
            <Label x={276} y={y + 25} cls="fill-zinc-200">{b.status}</Label>
            <Label x={452} y={y + 25} anchor="end" cls="fill-zinc-400">COUNT(*) = {b.n}</Label>
          </motion.g>
        );
      })}
      <motion.g {...fade(0.9)}>
        <Arrow x1={478} y1={128} x2={528} y2={128} cls="stroke-zinc-600" />
        <Panel x={536} y={96} w={160} h={64} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={616} y={120} anchor="middle" cls="fill-zinc-300">4 result rows</Label>
        <Label x={616} y={140} anchor="middle" cls="fill-zinc-500" size={10}>one per bucket</Label>
        <Label x={360} y={248} anchor="middle" cls="fill-zinc-500">52 + 30 + 14 + 7 = 103 — every row lands in exactly one bucket; nothing is lost, nothing doubled</Label>
      </motion.g>
    </svg>
  );
}

/* --- L7: five aggregates, one column in → one number out each --- */

function L7AggCollapse() {
  const lenses: Array<{ fn: string; note: string; value: string }> = [
    { fn: "COUNT(*)", note: "rows tallied", value: "103" },
    { fn: "SUM(total)", note: "money added up", value: "34833.28" },
    { fn: "AVG(total)", note: "the mean", value: "338.19" },
    { fn: "MIN(total)", note: "cheapest order", value: "25.47" },
    { fn: "MAX(total)", note: "priciest order", value: "1088.44" },
  ];
  return (
    <svg viewBox="0 0 720 260" className="w-full" role="img" aria-label="Five aggregates over the same orders.total column: 103 values collapse into one number per function">
      <motion.g {...fade(0)}>
        <Label x={24} y={24} cls="fill-zinc-300">orders.total — 103 values</Label>
        <Panel x={24} y={34} w={176} h={196} />
        <DotField n={103} cols={11} x0={40} y0={52} gap={15} r={3.5} />
        <Label x={112} y={218} anchor="middle" cls="fill-zinc-500" size={10}>one column in</Label>
      </motion.g>
      {lenses.map((l, i) => {
        const y = 34 + i * 41;
        return (
          <motion.g key={l.fn} {...fade(0.2 * i + 0.25)}>
            <Arrow x1={206} y1={132} x2={310} y2={y + 16} cls="stroke-zinc-600" />
            <Panel x={320} y={y} w={376} h={32} />
            <Label x={336} y={y + 20} cls="fill-zinc-200">{l.fn}</Label>
            <Label x={470} y={y + 20} cls="fill-zinc-500" size={10}>{l.note}</Label>
            <Label x={680} y={y + 20} anchor="end" cls="fill-emerald-400">{l.value}</Label>
          </motion.g>
        );
      })}
      <motion.g {...fade(1.25)}>
        <Label x={360} y={252} anchor="middle" cls="fill-zinc-500">Five lenses over the same 103 rows — one number out per function, the table itself never shrinks</Label>
      </motion.g>
    </svg>
  );
}

/* --- L7: COUNT(*) vs COUNT(shipped_at) — the 21 NULL holes --- */

function L7CountHoles() {
  // 103 dots / 26 per rank → 4 ranks; the 21 holes (indices 82..102) sit in
  // the last rank, cols 4..24. Rings use un-jittered centers; DotField's
  // jitter is ±2px so an r=8.5 ring always encloses its r=4.5 dot.
  const holes: Array<{ cx: number; cy: number }> = [];
  for (let i = 82; i < 103; i++) holes.push({ cx: 60 + (i % 26) * 20, cy: 44 + Math.floor(i / 26) * 20 });
  return (
    <svg viewBox="0 0 720 250" className="w-full" role="img" aria-label="103 order dots; 21 ringed dots have no shipped_at — COUNT(*) counts 103 rows, COUNT(shipped_at) counts 82 values">
      <motion.g {...fade(0)}>
        <Label x={60} y={22} cls="fill-zinc-300">orders — one dot per row</Label>
        <DotField n={103} cols={26} x0={60} y0={44} gap={20} r={4.5} passFrom={82} />
      </motion.g>
      <motion.g {...fade(0.4)}>
        {holes.map((h, i) => (
          <circle key={i} cx={h.cx} cy={h.cy} r={8.5} fill="none" strokeWidth={1.4} className="stroke-rose-500/80" />
        ))}
      </motion.g>
      <motion.g {...fade(0.55)}>
        <Arrow x1={214} y1={126} x2={152} y2={114} cls="stroke-rose-500/70" />
        <Label x={300} y={138} anchor="middle" cls="fill-rose-400" size={10}>21 holes — shipped_at IS NULL: 14 pending + 7 cancelled</Label>
      </motion.g>
      <motion.g {...fade(0.75)}>
        <Panel x={60} y={156} w={296} h={36} />
        <Label x={76} y={179} cls="fill-zinc-200">COUNT(*) = 103</Label>
        <Label x={340} y={179} anchor="end" cls="fill-zinc-500" size={10}>every row</Label>
        <Panel x={396} y={156} w={264} h={36} cls="fill-zinc-900 stroke-emerald-700/60" />
        <Label x={412} y={179} cls="fill-emerald-300">COUNT(shipped_at) = 82</Label>
        <Label x={644} y={179} anchor="end" cls="fill-zinc-500" size={10}>values only</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <Label x={360} y={224} anchor="middle" cls="fill-zinc-500">103 − 82 = 21 — the gap between the two COUNTs is the unshipped backlog</Label>
      </motion.g>
    </svg>
  );
}

/* --- L8: WHERE vs HAVING — the two gates at their pipeline stages --- */

function L8HavingPosition() {
  const buckets: Array<{ status: string; n: number; color: string }> = [
    { status: "delivered", n: 52, color: "stroke-emerald-700/60" },
    { status: "shipped", n: 30, color: "stroke-sky-700/60" },
    { status: "pending", n: 14, color: "stroke-amber-700/60" },
    { status: "cancelled", n: 7, color: "stroke-rose-700/60" },
  ];
  const fates: Array<{ t: string; cls: string }> = [
    { t: "kept", cls: "fill-emerald-400" },
    { t: "kept", cls: "fill-emerald-400" },
    { t: "kept", cls: "fill-emerald-400" },
    { t: "dropped", cls: "fill-rose-400" },
  ];
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="Grouped-query pipeline: FROM 103 rows, WHERE the row gate, GROUP BY builds four status buckets 52/30/14/7, HAVING drops cancelled, SELECT leaves three result rows">
      <motion.g {...fade(0)}>
        <Label x={24} y={56} cls="fill-zinc-300">FROM</Label>
        <Panel x={120} y={36} w={576} h={30} />
        <Label x={136} y={56} cls="fill-zinc-400">orders — 103 rows</Label>
      </motion.g>
      <motion.g {...fade(0.15)}>
        <Arrow x1={408} y1={68} x2={408} y2={78} cls="stroke-zinc-600" />
        <Label x={24} y={100} cls="fill-zinc-300">WHERE</Label>
        <Panel x={120} y={80} w={576} h={30} />
        <Label x={136} y={100} cls="fill-zinc-400">the row gate — each row passes or dies before any bucket exists</Label>
        <XMark x={668} y={95} cls="stroke-rose-500/80" />
      </motion.g>
      <motion.g {...fade(0.3)}>
        <Arrow x1={408} y1={112} x2={408} y2={122} cls="stroke-zinc-600" />
        <Label x={24} y={144} cls="fill-zinc-300">GROUP BY</Label>
        {buckets.map((b, i) => (
          <g key={b.status}>
            <Panel x={120 + i * 148} y={124} w={132} h={30} cls={`fill-zinc-900 ${b.color}`} />
            <Label x={132 + i * 148} y={144} cls="fill-zinc-200">{b.status}</Label>
            <Label x={240 + i * 148} y={144} anchor="end" cls="fill-zinc-400">{b.n}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.45)}>
        <Arrow x1={408} y1={156} x2={408} y2={166} cls="stroke-zinc-600" />
        <Label x={24} y={190} cls="fill-zinc-300">HAVING</Label>
        <Panel x={120} y={168} w={576} h={36} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={408} y={186} anchor="middle" cls="fill-zinc-300">{"COUNT(*) >= 14 — the bucket gate"}</Label>
        {fates.map((f, i) => (
          <Label key={f.t + i} x={186 + i * 148} y={199} anchor="middle" cls={f.cls} size={10}>{f.t}</Label>
        ))}
      </motion.g>
      <motion.g {...fade(0.6)}>
        <Arrow x1={408} y1={206} x2={408} y2={216} cls="stroke-zinc-600" />
        <Label x={24} y={238} cls="fill-zinc-300">SELECT</Label>
        <Panel x={120} y={218} w={576} h={30} cls="fill-zinc-900 stroke-emerald-700/60" />
        <Label x={136} y={238} cls="fill-zinc-200">3 result rows</Label>
        <Label x={680} y={238} anchor="end" cls="fill-zinc-400">delivered 52 · shipped 30 · pending 14</Label>
      </motion.g>
      <motion.g {...fade(0.8)}>
        <Label x={360} y={270} anchor="middle" cls="fill-zinc-500">WHERE is the row gate before the buckets; HAVING is the bucket gate after them</Label>
      </motion.g>
    </svg>
  );
}

/* --- L35: the founder's six asks decode into five reusable shapes --- */

function L35ReportAnatomy() {
  const shapes: Array<{ name: string; ask: string[]; sql: string[]; result: string }> = [
    { name: "FILTER", ask: ["marketing-ready", "customers in the EU"], sql: ["WHERE region = 'EU'", "AND active = 1"], result: "→ 7 rows" },
    { name: "DEDUPE", ask: ["cities we serve"], sql: ["COUNT(DISTINCT city)"], result: "→ 16 cities" },
    { name: "COLLAPSE", ask: ["budget shelf &", "warehouse depth"], sql: ["COUNT(*) + WHERE", "SUM(stock)"], result: "→ 8 · 2,845 units" },
    { name: "TOP-N", ask: ["the premium five"], sql: ["ORDER BY price DESC", "LIMIT 5"], result: "→ 5 names" },
    { name: "BUCKET + GATE", ask: ["crowded categories"], sql: ["GROUP BY category", "HAVING COUNT(*) > 2"], result: "→ 3 categories" },
  ];
  return (
    <svg viewBox="0 0 720 260" className="w-full" role="img" aria-label="The founder's six asks decode into five shapes: filter, dedupe, collapse, top-N, bucket plus gate — each panel shows the ask, its SQL spine and its live result">
      <motion.g {...fade(0)}>
        <Label x={360} y={26} anchor="middle" cls="fill-zinc-300">The founder's brief, decoded — six asks, five shapes</Label>
      </motion.g>
      {shapes.map((s, i) => {
        const x = 20 + i * 138;
        const c = x + 64;
        return (
          <motion.g key={s.name} {...fade(0.15 * i + 0.2)}>
            <Panel x={x} y={44} w={128} h={172} />
            <Label x={c} y={64} anchor="middle" cls="fill-zinc-100">{s.name}</Label>
            {s.ask.map((line, j) => (
              <Label key={`a${j}`} x={c} y={84 + j * 12} anchor="middle" cls="fill-zinc-500" size={9}>{line}</Label>
            ))}
            {s.sql.map((line, j) => (
              <Label key={`s${j}`} x={c} y={122 + j * 14} anchor="middle" cls="fill-sky-300" size={9}>{line}</Label>
            ))}
            <Label x={c} y={192} anchor="middle" cls="fill-emerald-400" size={10}>{s.result}</Label>
          </motion.g>
        );
      })}
      <motion.g {...fade(1.0)}>
        <Label x={360} y={244} anchor="middle" cls="fill-zinc-500">Recognize the shape first — then the SQL writes itself</Label>
      </motion.g>
    </svg>
  );
}

export const FIGURES_M1C: Partial<Record<FigureId, () => React.JSX.Element>> = {
  "l7-agg-collapse": L7AggCollapse,
  "l7-count-holes": L7CountHoles,
  "l8-status-buckets": L8StatusBuckets,
  "l8-having-position": L8HavingPosition,
  "l35-report-anatomy": L35ReportAnatomy,
};
