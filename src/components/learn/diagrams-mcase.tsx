"use client";

// Case-study lesson figures (L35–L40 capstones, L50–L51 schema case studies) —
// one bespoke evidence-board per lesson that had none. Every number is
// seed-verified via /api/query probes and the EXPECTED result sets the lessons
// grade against (scripts/caselesson-facts.ts receipt). Same drawing kit as the
// other diagram families; registry merged in diagrams.tsx.

import { motion } from "framer-motion";
import type { FigureId } from "@/lib/curriculum/types";
import { Label, Panel, Pipe, XMark, Arrow, fade, drawIn } from "./diagrams-kit";

/* ---------- L36: five briefs, five join instruments ---------- */

function L36JoinInstruments() {
  const rows: Array<{ ask: string; shape: string; ans1: string; ans2?: string; danger?: boolean }> = [
    { ask: "Who orders the most?", shape: "widen + GROUP BY", ans1: "Alice 24 · Emma 17 · Grace 14", ans2: "Maya 13 · Chloe 5 — the top five" },
    { ask: "No shipped order at all?", shape: "LEFT JOIN · ON status · IS NULL", ans1: "6 holdouts:", ans2: "Bruno · Chloe · Dmitri · Farid · Keiko · Olivia" },
    { ask: "Never a single delivery?", shape: "same anti-join, new status", ans1: "exactly one — Liam O'Brien" },
    { ask: "What is each category worth?", shape: "item walk oi → products", ans1: "Audio 11,744.01 … Fitness 863.91", ans2: "7 shelves — the items own the economics" },
    { ask: "Storewide revenue, honest?", shape: "sum the owning table", ans1: "34,833.28 true", ans2: "a join prints 103,244.55 — ×3 fan-out", danger: true },
  ];
  return (
    <svg viewBox="0 0 720 352" className="w-full" role="img" aria-label="Five cross-table briefs each pick a join instrument: widening join counts per customer (Alice 24 leads), LEFT JOIN with ON-filter and IS NULL finds the six never-shipped holdouts and the one never-delivered customer, the item-line walk prices the seven categories, and the honest total 34,833.28 comes from summing orders unjoined — joining would triple-count 103,244.55.">
      <motion.g {...fade(0)}>
        <Label x={24} y={22} cls="fill-zinc-500" size={9}>five briefs, five join instruments — every number seed-probed</Label>
      </motion.g>
      {rows.map((r, i) => {
        const y = 40 + i * 62;
        return (
          <motion.g key={r.ask} {...fade(0.15 + i * 0.14)}>
            <Panel x={24} y={y} w={672} h={54} cls="fill-zinc-900 stroke-zinc-800" />
            <Label x={40} y={y + 24} cls="fill-zinc-300" size={10}>{r.ask}</Label>
            <Panel x={252} y={y + 12} w={182} h={30} cls="fill-zinc-950 stroke-teal-800" />
            <Label x={343} y={y + 31} cls="fill-teal-300" size={8.5} anchor="middle">{r.shape}</Label>
            <Label x={452} y={r.ans2 ? y + 21 : y + 31} cls={r.danger ? "fill-amber-300" : "fill-amber-200"} size={9.5}>{r.ans1}</Label>
            {r.ans2 && (
              <Label x={452} y={y + 38} cls={r.danger ? "fill-rose-400" : "fill-zinc-500"} size={8.5}>
                {r.ans2}
              </Label>
            )}
          </motion.g>
        );
      })}
      <motion.g {...fade(0.9)}>
        <XMark x={664} y={40 + 4 * 62 + 38} cls="stroke-rose-500" s={5} delay={0.2} />
      </motion.g>
    </svg>
  );
}

/* ---------- L37: set arms in, pivot grid out ---------- */

function L37SetopPivot() {
  const grid = [
    { region: "APAC", vals: [5, 8, 21, 3] },
    { region: "EU", vals: [6, 12, 24, 3] },
    { region: "LATAM", vals: [0, 0, 2, 0] },
    { region: "US", vals: [3, 10, 5, 1] },
  ];
  const heads = ["pending", "shipped", "delivered", "cancelled"];
  const census = [
    { s: "delivered", v: "15,571.07" },
    { s: "shipped", v: "11,996.72" },
    { s: "pending", v: "6,113.00" },
    { s: "cancelled", v: "1,152.49" },
  ];
  return (
    <svg viewBox="0 0 720 352" className="w-full" role="img" aria-label="Module 3 on one page: UNION ALL stacks two labeled arms 44 in-flight plus 52 complete, INTERSECT finds six shared shelves, EXCEPT finds Alice's one exclusive category Fitness; the CASE pivot folds 103 orders into a region-by-status grid with LATAM's two delivered orders a finding; the value census sums 15,571.07 delivered, 11,996.72 shipped, 6,113 pending, 1,152.49 cancelled to the honest 34,833.28.">
      <motion.g {...fade(0)}>
        <Label x={24} y={22} cls="fill-zinc-500" size={9}>module 3 on one page — set arms in, pivot grid out, census across</Label>
      </motion.g>
      {/* set arms */}
      <motion.g {...fade(0.15)}>
        <Panel x={24} y={38} w={196} h={192} cls="fill-zinc-900 stroke-zinc-800" />
        <Label x={40} y={60} cls="fill-zinc-500" size={8.5}>the set arms</Label>
        <Label x={40} y={86} cls="fill-teal-300" size={9}>UNION ALL</Label>
        <Label x={40} y={102} cls="fill-zinc-300" size={9}>in_flight 44 + complete 52</Label>
        <Label x={40} y={136} cls="fill-violet-300" size={9}>INTERSECT</Label>
        <Label x={40} y={152} cls="fill-zinc-300" size={9}>Alice ∩ Emma shelves → 6</Label>
        <Label x={40} y={186} cls="fill-rose-300" size={9}>EXCEPT</Label>
        <Label x={40} y={202} cls="fill-zinc-300" size={9}>Alice − Emma → Fitness (1)</Label>
      </motion.g>
      {/* pivot grid */}
      <motion.g {...fade(0.35)}>
        <Panel x={246} y={38} w={450} h={192} cls="fill-zinc-900 stroke-zinc-800" />
        <Label x={262} y={58} cls="fill-zinc-500" size={8.5}>the CASE pivot — one row per region</Label>
        {heads.map((h, c) => (
          <Label key={h} x={356 + c * 86} y={80} cls="fill-zinc-500" size={8} anchor="middle">{h}</Label>
        ))}
        {grid.map((g, ri) => (
          <g key={g.region}>
            <Label x={262} y={104 + ri * 30} cls="fill-zinc-300" size={9.5}>{g.region}</Label>
            {g.vals.map((v, ci) => (
              <Label key={ci} x={356 + ci * 86} y={104 + ri * 30} cls={v === 0 ? "fill-zinc-600" : "fill-teal-200"} size={9.5} anchor="middle">
                {v}
              </Label>
            ))}
          </g>
        ))}
        <Label x={262} y={224} cls="fill-zinc-600" size={8}>LATAM&apos;s zero pending is a finding — both its orders delivered</Label>
      </motion.g>
      {/* value census strip */}
      <motion.g {...fade(0.6)}>
        <Panel x={24} y={252} w={672} h={80} cls="fill-zinc-900 stroke-zinc-800" />
        <Label x={40} y={274} cls="fill-zinc-500" size={8.5}>the value census — SUM(CASE …) per status, one pass</Label>
        {census.map((c, i) => (
          <g key={c.s}>
            <Label x={40 + i * 128} y={298} cls="fill-zinc-400" size={8}>{c.s}</Label>
            <Label x={40 + i * 128} y={314} cls="fill-teal-200" size={10}>{c.v}</Label>
          </g>
        ))}
        <Pipe pts={[[540, 306], [576, 306]]} cls="stroke-zinc-600" arrowAng={0} />
        <Label x={590} y={298} cls="fill-amber-300" size={8}>sums to</Label>
        <Label x={590} y={316} cls="fill-amber-300" size={11}>34,833.28</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- L38: the subquery inside the answer ---------- */

function L38NestedAsks() {
  const cards: Array<{ ask: string; inner: string; a1: string; a2: string }> = [
    { ask: "Who beats the household bar?", inner: "AVG(spend) over all 16 → 2,177.08", a1: "5 of 16 survive the bar", a2: "Alice 7,262.35 · Emma 6,640.56 · Grace 4,574.23" },
    { ask: "Who beats their OWN average?", inner: "correlated probe — per customer", a1: "45 orders beat the personal bar", a2: "only 42 beat the storewide one" },
    { ask: "Holding a pending order now?", inner: "EXISTS (a pending row?)", a1: "8 customers hold one", a2: "EXISTS is NULL-safe — no row drops" },
    { ask: "Who has seen all four statuses?", inner: "COUNT(DISTINCT status) = 4", a1: "the status veterans:", a2: "Alice · Emma · Maya" },
  ];
  return (
    <svg viewBox="0 0 720 340" className="w-full" role="img" aria-label="Four subquery instruments under one brief: a scalar average 2,177.08 that five spenders beat led by Alice 7,262.35; a correlated probe where 45 orders beat their own customer's average versus 42 against the storewide one; EXISTS finding eight customers with pending orders NULL-safely; and a distinct-status count naming the three veterans Alice, Emma and Maya.">
      <motion.g {...fade(0)}>
        <Label x={24} y={22} cls="fill-zinc-500" size={9}>the subquery inside the answer — outer asks, inner engines</Label>
      </motion.g>
      {cards.map((c, i) => {
        const y = 38 + i * 72;
        return (
          <motion.g key={c.ask} {...fade(0.12 + i * 0.16)}>
            <Panel x={24} y={y} w={672} h={64} cls="fill-zinc-900 stroke-zinc-800" />
            <Label x={40} y={y + 26} cls="fill-zinc-300" size={10}>{c.ask}</Label>
            <Panel x={252} y={y + 15} w={200} h={34} cls="fill-zinc-950 stroke-violet-900" />
            <motion.rect {...fade(0.3 + i * 0.16)} x={252} y={y + 15} width={200} height={34} rx={8} className="fill-none stroke-violet-700" strokeWidth={1} strokeDasharray="4 3" />
            <Label x={352} y={y + 36} cls="fill-violet-300" size={8} anchor="middle">{c.inner}</Label>
            <Label x={470} y={y + 26} cls="fill-amber-200" size={9.5}>{c.a1}</Label>
            <Label x={470} y={y + 43} cls="fill-zinc-500" size={8.5}>{c.a2}</Label>
          </motion.g>
        );
      })}
    </svg>
  );
}

/* ---------- L39: the ops calendar ---------- */

const L39_REVS = [3731.97, 3609.64, 2617.08, 2468.91, 2910.31, 2047.43, 1193.86, 2352.07, 3116.04, 2975.67, 1648.8, 2101.47, 1669.5, 2390.53];
const L39_RUNS = [3731.97, 7341.61, 9958.69, 12427.6, 15337.91, 17385.34, 18579.2, 20931.27, 24047.31, 27022.98, 28671.78, 30773.25, 32442.75, 34833.28];

function L39OpsCalendar() {
  const x0 = 52, pitch = 44, bw = 26, base = 250, maxH = 140;
  const hOf = (v: number) => (v / 3731.97) * maxH;
  const cx = (i: number) => x0 + i * pitch + bw / 2;
  const linePts = L39_RUNS.map((r, i) => `${cx(i)},${base - (r / 34833.28) * 165}`).join(" ");
  const months = ["24-01", "24-02", "24-03", "24-04", "24-05", "24-06", "24-07", "24-08", "24-09", "24-10", "24-11", "24-12", "25-01", "25-02"];
  return (
    <svg viewBox="0 0 720 332" className="w-full" role="img" aria-label="The ops calendar: fourteen monthly revenue bars from 3,731.97 in January 2024 down to the 1,193.86 July trough and back up, with the running total line climbing to 34,833.28; side chips carry shipping speed 2.98 days over 82 shipped orders, NTILE quartiles 26/26/26/25, and Alice's LAG gaps 20, 29, 5, 9, 13 days.">
      <motion.g {...fade(0)}>
        <Label x={24} y={20} cls="fill-zinc-500" size={9}>the ops calendar — 14 buckets, one honest running line</Label>
      </motion.g>
      <motion.g {...fade(0.1)}>
        <rect x={560} y={14} width={8} height={8} className="fill-teal-500" opacity={0.5} />
        <Label x={573} y={21} cls="fill-zinc-500" size={8}>monthly revenue</Label>
        <line x1={652} y1={18} x2={672} y2={18} className="stroke-amber-300" strokeWidth={1.5} />
        <Label x={676} y={21} cls="fill-zinc-500" size={8} anchor="end">running</Label>
      </motion.g>
      {/* bars */}
      {L39_REVS.map((v, i) => (
        <motion.g key={i} {...fade(0.15 + i * 0.035)}>
          <rect
            x={x0 + i * pitch} y={base - hOf(v)} width={bw} height={hOf(v)} rx={3}
            className={i === 6 ? "fill-rose-500/40 stroke-rose-400" : i === 0 ? "fill-amber-500/30 stroke-amber-400" : "fill-teal-500/30 stroke-teal-500"}
            strokeWidth={1}
          />
          <Label x={cx(i)} y={262} cls="fill-zinc-600" size={6.5} anchor="middle">{months[i]}</Label>
        </motion.g>
      ))}
      {/* peak + trough tags */}
      <motion.g {...fade(0.5)}>
        <Label x={cx(0)} y={base - hOf(L39_REVS[0]) - 6} cls="fill-amber-300" size={8} anchor="middle">3,731.97</Label>
        <Label x={cx(6)} y={base - hOf(L39_REVS[6]) - 6} cls="fill-rose-300" size={8} anchor="middle">1,193.86</Label>
      </motion.g>
      {/* running line */}
      <motion.polyline {...drawIn(0.4)} points={linePts} className="stroke-amber-300" strokeWidth={1.8} fill="none" />
      <motion.g {...fade(0.85)}>
        <Label x={cx(13) + 6} y={base - 165 - 4} cls="fill-amber-300" size={9} anchor="end">34,833.28</Label>
      </motion.g>
      <line x1={40} y1={base} x2={700} y2={base} className="stroke-zinc-800" strokeWidth={1} />
      {/* instrument chips */}
      <motion.g {...fade(0.9)}>
        <Panel x={24} y={278} w={672} h={42} cls="fill-zinc-900 stroke-zinc-800" />
        <Label x={40} y={296} cls="fill-zinc-400" size={8.5}>shipping speed: 82 shipped · avg 2.98d</Label>
        <Label x={40} y={310} cls="fill-zinc-600" size={7.5}>21 unshipped rows exit — AVG skips NULL</Label>
        <Label x={300} y={296} cls="fill-zinc-400" size={8.5}>NTILE(4) deals 103 orders</Label>
        <Label x={300} y={310} cls="fill-teal-200" size={8.5}>26 / 26 / 26 / 25</Label>
        <Label x={480} y={296} cls="fill-zinc-400" size={8.5}>LAG on Alice&apos;s 24 orders:</Label>
        <Label x={480} y={310} cls="fill-violet-200" size={8.5}>gaps 20 · 29 · 5 · 9 · 13 …</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- L40: the executive one-pager ---------- */

function L40ExecOnepager() {
  const tiles = [
    { s: "delivered", n: 52 },
    { s: "shipped", n: 30 },
    { s: "pending", n: 14 },
    { s: "cancelled", n: 7 },
  ];
  return (
    <svg viewBox="0 0 720 348" className="w-full" role="img" aria-label="The executive one-pager: four census tiles 52 delivered, 30 shipped, 14 pending, 7 cancelled from one FILTER scan; the grand-total stack led by 34,833.28; the half-open band ladder budget 8, mid 4, premium 4 summing to all 16 products; a deliberate cross join of six suppliers times four regions equals 24 rows; and GROUP_CONCAT folding the regions into APAC,EU,LATAM,US.">
      <motion.g {...fade(0)}>
        <Label x={24} y={22} cls="fill-zinc-500" size={9}>the one-pager — five artifacts, one board-meeting scan</Label>
      </motion.g>
      {/* census tiles */}
      {tiles.map((t, i) => (
        <motion.g key={t.s} {...fade(0.1 + i * 0.08)}>
          <Panel x={24 + i * 166} y={34} w={152} h={52} cls="fill-zinc-900 stroke-zinc-800" />
          <Label x={100 + i * 166} y={58} cls="fill-amber-300" size={15} anchor="middle">{t.n}</Label>
          <Label x={100 + i * 166} y={74} cls="fill-zinc-500" size={8} anchor="middle">{t.s}</Label>
        </motion.g>
      ))}
      <motion.g {...fade(0.4)}>
        <Label x={360} y={102} cls="fill-zinc-600" size={8} anchor="middle">COUNT(*) FILTER (WHERE …) — four numbers, one scan</Label>
      </motion.g>
      {/* grand-total stack */}
      <motion.g {...fade(0.45)}>
        <Panel x={24} y={116} w={330} h={118} cls="fill-zinc-900 stroke-zinc-800" />
        <Label x={40} y={136} cls="fill-zinc-500" size={8.5}>the grand-total stack — UNION ALL, wrapped</Label>
        <Label x={40} y={160} cls="fill-amber-300" size={10}>GRAND TOTAL · 34,833.28</Label>
        <Label x={40} y={182} cls="fill-zinc-300" size={9.5}>Audio · 11,744.01</Label>
        <Label x={40} y={202} cls="fill-zinc-300" size={9.5}>Wearables · 6,929.12</Label>
        <Label x={40} y={222} cls="fill-zinc-600" size={8.5}>… 5 more shelves · sort by VALUE, not the label</Label>
      </motion.g>
      {/* band ladder */}
      <motion.g {...fade(0.55)}>
        <Panel x={370} y={116} w={326} h={118} cls="fill-zinc-900 stroke-zinc-800" />
        <Label x={386} y={136} cls="fill-zinc-500" size={8.5}>band ladder — half-open [lo, hi)</Label>
        <Label x={386} y={160} cls="fill-zinc-300" size={9.5}>budget [0,50) · 8</Label>
        <Label x={386} y={180} cls="fill-zinc-300" size={9.5}>mid [50,100) · 4</Label>
        <Label x={386} y={200} cls="fill-zinc-300" size={9.5}>premium [100,∞) · 4</Label>
        <Label x={386} y={222} cls="fill-teal-200" size={8.5}>8 + 4 + 4 = 16 — seams clean, no doubles</Label>
      </motion.g>
      {/* cross join */}
      <motion.g {...fade(0.65)}>
        <Panel x={24} y={250} w={330} h={76} cls="fill-zinc-900 stroke-zinc-800" />
        <Label x={40} y={270} cls="fill-zinc-500" size={8.5}>the deliberate cross join</Label>
        {Array.from({ length: 24 }).map((_, i) => (
          <circle key={i} cx={52 + (i % 6) * 16} cy={288 + Math.floor(i / 6) * 12} r={3.5} className="fill-violet-400/70" />
        ))}
        <Label x={164} y={296} cls="fill-zinc-300" size={9}>6 suppliers × 4 regions = 24 rows</Label>
        <Label x={164} y={312} cls="fill-zinc-600" size={8}>coverage proof, chosen on purpose</Label>
      </motion.g>
      {/* group_concat */}
      <motion.g {...fade(0.75)}>
        <Panel x={370} y={250} w={326} h={76} cls="fill-zinc-900 stroke-zinc-800" />
        <Label x={386} y={270} cls="fill-zinc-500" size={8.5}>one string, one scan</Label>
        <Panel x={386} y={282} w={200} h={28} cls="fill-zinc-950 stroke-teal-800" />
        <Label x={486} y={300} cls="fill-teal-200" size={9} anchor="middle">APAC,EU,LATAM,US</Label>
        <Label x={386} y={322} cls="fill-zinc-600" size={7.5}>GROUP_CONCAT(DISTINCT region ORDER BY region)</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- L50: the data-fix ticket ---------- */

function D50FixTicket() {
  const steps: Array<{ n: string; ticket: string; verb: string; vcls: string; o1: string; o2: string }> = [
    { n: "1", ticket: "assess the damage", verb: "SELECT — read first", vcls: "stroke-teal-800 fill-teal-300", o1: "52 del · 30 shp · 14 pen · 7 can", o2: "the 'before' picture — how you'll know it worked" },
    { n: "2", ticket: "add the missing mic arm", verb: "INSERT + RETURNING", vcls: "stroke-amber-700 fill-amber-300", o1: "id 17 · Streaming Mic Arm", o2: "the skipped row is back, id in hand" },
    { n: "3", ticket: "repair the Wearables feed", verb: "UPDATE with CASE", vcls: "stroke-violet-700 fill-violet-300", o1: "ids 12 & 13 → 84.00 / 209.99", o2: "stale prices overwritten in one pass" },
    { n: "4", ticket: "purge the test line items", verb: "DELETE via subquery", vcls: "stroke-rose-700 fill-rose-300", o1: "the cancelled-test items, gone", o2: "0 rows left behind" },
    { n: "5", ticket: "reconcile the mouse stock", verb: "UPSERT · excluded", vcls: "stroke-teal-800 fill-teal-300", o1: "id 2 → stock 340", o2: "the feed value lands — no double write" },
  ];
  return (
    <svg viewBox="0 0 720 352" className="w-full" role="img" aria-label="The data-fix ticket in five verbs: read the census 52 delivered, 30 shipped, 14 pending, 7 cancelled first; INSERT with RETURNING hands back id 17 Streaming Mic Arm; UPDATE with CASE repairs ids 12 and 13 to 84.00 and 209.99; DELETE via subquery purges the test line items leaving zero rows; UPSERT with excluded reconciles mouse stock to 340.">
      <motion.g {...fade(0)}>
        <Label x={24} y={22} cls="fill-zinc-500" size={9}>read before you write — the incident ticket in five verbs</Label>
      </motion.g>
      {steps.map((s, i) => {
        const y = 38 + i * 56;
        return (
          <motion.g key={s.n} {...fade(0.12 + i * 0.14)}>
            <Panel x={24} y={y} w={672} h={48} cls="fill-zinc-900 stroke-zinc-800" />
            <circle cx={44} cy={y + 24} r={11} className="fill-zinc-800 stroke-zinc-600" strokeWidth={1} />
            <Label x={44} y={y + 28} cls="fill-zinc-400" size={10} anchor="middle">{s.n}</Label>
            <Label x={66} y={y + 28} cls="fill-zinc-300" size={10}>{s.ticket}</Label>
            <Panel x={252} y={y + 11} w={168} h={26} cls="fill-zinc-950 stroke-zinc-700" />
            <Label x={336} y={y + 28} cls={s.vcls.split(" ")[1]} size={8.5} anchor="middle">{s.verb}</Label>
            <Label x={440} y={y + 21} cls="fill-amber-200" size={9}>{s.o1}</Label>
            <Label x={440} y={y + 36} cls="fill-zinc-500" size={8}>{s.o2}</Label>
          </motion.g>
        );
      })}
      <motion.g {...fade(0.85)}>
        <Label x={24} y={338} cls="fill-zinc-600" size={8}>sandboxed — the store resets after every run; production wraps all five in one transaction</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- L51: the reporting layer ---------- */

function D51ReportingLayer() {
  const tables = ["customers", "orders", "order_items", "products", "suppliers", "expenses", "invoices", "ledger_entries", "payments"];
  return (
    <svg viewBox="0 0 720 348" className="w-full" role="img" aria-label="The reporting layer builds upward from nine base tables to a named view month_revenue holding fourteen buckets, a staged month_targets table for planning, and the idx_orders_created index for the calendar filter; the proof probe names 2024-07 with revenue 1,193.86 as the worst month on record and sqlite_master inventories everything the schema gained.">
      <motion.g {...fade(0)}>
        <Label x={24} y={22} cls="fill-zinc-500" size={9}>the reporting layer — build up, then prove it exists</Label>
      </motion.g>
      {/* layer stack */}
      <motion.g {...fade(0.15)}>
        <Panel x={24} y={38} w={430} h={52} cls="fill-zinc-900 stroke-amber-800" />
        <Label x={40} y={58} cls="fill-amber-300" size={9.5}>INDEX idx_orders_created</Label>
        <Label x={40} y={76} cls="fill-zinc-500" size={8}>the dashboard&apos;s calendar filter — CREATE INDEX</Label>
      </motion.g>
      <motion.g {...fade(0.3)}>
        <Panel x={24} y={102} w={430} h={52} cls="fill-zinc-900 stroke-violet-800" />
        <Label x={40} y={122} cls="fill-violet-300" size={9.5}>TABLE month_targets (month, target)</Label>
        <Label x={40} y={140} cls="fill-zinc-500" size={8}>planning stages here next sprint — CREATE TABLE + constraints</Label>
      </motion.g>
      <motion.g {...fade(0.45)}>
        <Panel x={24} y={166} w={430} h={52} cls="fill-zinc-900 stroke-teal-800" />
        <Label x={40} y={186} cls="fill-teal-300" size={9.5}>VIEW month_revenue</Label>
        <Label x={40} y={204} cls="fill-zinc-500" size={8}>one definition of monthly revenue — 14 buckets, never rewritten</Label>
      </motion.g>
      <motion.g {...fade(0.6)}>
        <Panel x={24} y={230} w={430} h={94} cls="fill-zinc-900 stroke-zinc-800" />
        <Label x={40} y={250} cls="fill-zinc-500" size={8.5}>the nine base tables — sqlite_master knows them all</Label>
        {tables.map((t, i) => (
          <g key={t}>
            <Panel x={40 + (i % 3) * 138} y={262 + Math.floor(i / 3) * 20} w={128} h={16} cls="fill-zinc-950 stroke-zinc-700" />
            <Label x={104 + (i % 3) * 138} y={274 + Math.floor(i / 3) * 20} cls="fill-zinc-400" size={7.5} anchor="middle">{t}</Label>
          </g>
        ))}
      </motion.g>
      {/* build-up arrows */}
      {[[239, 218], [203, 182], [167, 90]].map(([y1, y2], i) => (
        <motion.g key={i} {...fade(0.5 + i * 0.1)}>
          <Arrow x1={18} y1={y1} x2={18} y2={y2} cls="stroke-zinc-600" />
        </motion.g>
      ))}
      {/* proof probe */}
      <motion.g {...fade(0.7)}>
        <Panel x={474} y={38} w={222} h={286} cls="fill-zinc-900 stroke-zinc-800" />
        <Label x={490} y={60} cls="fill-zinc-500" size={8.5}>the proof probe</Label>
        <Label x={490} y={84} cls="fill-zinc-400" size={8.5}>WITH RECURSIVE builds the</Label>
        <Label x={490} y={98} cls="fill-zinc-400" size={8.5}>calendar; LEFT JOIN finds</Label>
        <Label x={490} y={112} cls="fill-zinc-400" size={8.5}>the month with no match:</Label>
        <Panel x={490} y={126} w={190} h={64} cls="fill-zinc-950 stroke-rose-800" />
        <Label x={585} y={152} cls="fill-rose-300" size={12} anchor="middle">2024-07</Label>
        <Label x={585} y={174} cls="fill-rose-200" size={11} anchor="middle">1,193.86</Label>
        <Label x={490} y={210} cls="fill-zinc-500" size={8}>the worst month on record —</Label>
        <Label x={490} y={224} cls="fill-zinc-500" size={8}>named once, not rewritten weekly</Label>
        <Label x={490} y={252} cls="fill-zinc-600" size={8}>sqlite_master then inventories</Label>
        <Label x={490} y={266} cls="fill-zinc-600" size={8}>the schema you stand on: 9 tables</Label>
        <Label x={490} y={280} cls="fill-zinc-600" size={8}>+ the view, the table, the index</Label>
        <Label x={490} y={300} cls="fill-zinc-600" size={8}>every artifact auditable by name</Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- registry ---------------- */

export const FIGURES_CASE: Partial<Record<FigureId, () => React.JSX.Element>> = {
  "l36-join-instruments": L36JoinInstruments,
  "l37-setop-pivot": L37SetopPivot,
  "l38-nested-asks": L38NestedAsks,
  "l39-ops-calendar": L39OpsCalendar,
  "l40-exec-onepager": L40ExecOnepager,
  "d50-fix-ticket": D50FixTicket,
  "d51-reporting-layer": D51ReportingLayer,
};
