"use client";

// Module 10 figures — the windows masterclass (lessons 58–64) + query
// performance. Same kit language as every bank: 720-wide viewBox, Tailwind
// palette classes so the theme engine re-skins each figure, fade choreography.
// All numbers are real storefront data (103 orders, 16 customers, 14 months).

import { motion } from "framer-motion";
import type { FigureId } from "@/lib/curriculum/types";
import {
  Arrow,
  fade,
  Label,
  Panel,
  rng,
} from "./diagrams-kit";

/* ---------- lesson 58 — where the window pass sits in the pipeline ---------- */

function L58EvalOrder() {
  const stages: Array<[string, string, string]> = [
    ["FROM / JOIN", "rows gathered", "stroke-zinc-700"],
    ["WHERE", "filter rows", "stroke-zinc-700"],
    ["GROUP BY", "collapse groups", "stroke-zinc-700"],
    ["WINDOW PASS", "OVER(…) computed", "stroke-emerald-400/70"],
    ["ORDER BY", "final sort", "stroke-zinc-700"],
  ];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="SQL evaluation order with the window pass as stage four: WHERE cannot see window aliases, ORDER BY can, and filtering on a rank needs a CTE wrapper">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>the five passes — every OVER(…) call waits for stage 4</Label>
      </motion.g>
      <motion.g {...fade(0.2)}>
        {stages.map(([name, sub, border], i) => (
          <g key={name}>
            <Panel x={26 + i * 138} y={44} w={118} h={58} cls={`fill-zinc-900 ${border}`} />
            <Label x={85 + i * 138} y={68} anchor="middle" cls={i === 3 ? "fill-emerald-300" : "fill-zinc-200"} size={10} bold>{name}</Label>
            <Label x={85 + i * 138} y={86} anchor="middle" cls="fill-zinc-500" size={8}>{sub}</Label>
            {i < 4 && <Arrow x1={144 + i * 138} y1={73} x2={164 + i * 138} y2={73} cls="stroke-zinc-600" />}
          </g>
        ))}
        <rect x={570} y={40} width={130} height={66} rx={8} className="fill-emerald-400/10 stroke-emerald-400/60" strokeWidth={1} />
      </motion.g>
      {/* visibility rules */}
      <motion.g {...fade(0.5)}>
        <Panel x={26} y={128} w={318} h={70} cls="fill-zinc-900 stroke-rose-400/60" />
        <Label x={42} y={150} cls="fill-rose-300" size={9}>WHERE — window aliases DO NOT exist yet</Label>
        <Label x={42} y={170} cls="fill-zinc-400" size={8}>WHERE rk = 1 → parse-time error: no such column</Label>
        <Label x={42} y={188} cls="fill-zinc-500" size={8}>stage 2 runs long before stage 4 computes rk</Label>
      </motion.g>
      <motion.g {...fade(0.7)}>
        <Panel x={376} y={128} w={318} h={70} cls="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={392} y={150} cls="fill-emerald-300" size={9}>ORDER BY — CAN see window aliases (stage 5 &gt; 4)</Label>
        <Label x={392} y={170} cls="fill-zinc-400" size={8}>ORDER BY rk → works, no wrapper needed</Label>
        <Label x={392} y={188} cls="fill-zinc-500" size={8}>the final presentation pass reads everything</Label>
      </motion.g>
      {/* the fix */}
      <motion.g {...fade(0.85)}>
        <Panel x={26} y={214} w={668} h={44} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={232} cls="fill-zinc-300" size={9}>need to FILTER on a rank? wrap it: WITH ranked AS (SELECT … RANK() OVER (…) AS rk …) SELECT * FROM ranked WHERE rk = 1</Label>
        <Label x={42} y={250} cls="fill-zinc-500" size={8}>the outer SELECT&apos;s WHERE runs after the inner window pass — the CTE is the time machine</Label>
      </motion.g>
      <motion.g {...fade(1)}>
        <line x1={26} y1={272} x2={694} y2={272} className="stroke-zinc-800" />
        <Label x={26} y={290} cls="fill-zinc-400" size={10}>Windows run late — after filter and group, before the final sort. That timing explains every &quot;weird&quot; result.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 58 — one function, four scopes ---------- */

function L58FourShapes() {
  const shapes: Array<{ title: string; sql: string; rows: string; what: string; border: string; fg: string; rowsIn: string; rowsOut: string }> = [
    { title: "GROUP BY", sql: "SUM(total) GROUP BY customer_id", rows: "103 → 16", what: "one total per customer, rows collapsed", border: "stroke-rose-400/60", fg: "fill-rose-300", rowsIn: "103 in", rowsOut: "16 out" },
    { title: "OVER ()", sql: "SUM(total) OVER ()", rows: "103 → 103", what: "the grand total stamped on every row", border: "stroke-emerald-400/60", fg: "fill-emerald-300", rowsIn: "103 in", rowsOut: "103 out" },
    { title: "PARTITION", sql: "SUM(total) OVER (PARTITION BY customer_id)", rows: "103 → 103", what: "the owner's total, stamped on their rows", border: "stroke-sky-400/60", fg: "fill-sky-300", rowsIn: "103 in", rowsOut: "103 out" },
    { title: "ORDER BY", sql: "SUM(total) OVER (ORDER BY created_at)", rows: "103 → 103", what: "running total up to each row's position", border: "stroke-violet-400/60", fg: "fill-violet-300", rowsIn: "103 in", rowsOut: "103 out" },
  ];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="One SUM function under four scopes: GROUP BY collapses 103 rows to 16, the three OVER forms keep all 103 rows and stamp grand, per-group, or running totals on them">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>same function, same data — the scope sentence is the whole difference</Label>
      </motion.g>
      <motion.g {...fade(0.2)}>
        {shapes.slice(0, 2).map((s, i) => (
          <g key={s.title}>
            <Panel x={26 + i * 344} y={40} w={324} h={100} cls={`fill-zinc-900 ${s.border}`} />
            <Label x={42 + i * 344} y={62} cls={s.fg} size={10} bold>{s.title}</Label>
            <Label x={42 + i * 344} y={80} cls="fill-zinc-300" size={8.5}>{s.sql.replace("&apos;", "'")}</Label>
            <Label x={42 + i * 344} y={102} cls="fill-zinc-100" size={12}>{s.rows} rows</Label>
            <Label x={150 + i * 344} y={102} cls="fill-zinc-500" size={8}>{s.what}</Label>
            <Label x={42 + i * 344} y={124} cls="fill-zinc-500" size={8}>{s.rowsIn} → {s.rowsOut}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.5)}>
        {shapes.slice(2).map((s, i) => (
          <g key={s.title}>
            <Panel x={26 + i * 344} y={154} w={324} h={100} cls={`fill-zinc-900 ${s.border}`} />
            <Label x={42 + i * 344} y={176} cls={s.fg} size={10} bold>{s.title}</Label>
            <Label x={42 + i * 344} y={194} cls="fill-zinc-300" size={8.5}>{s.sql.replace("&apos;", "'")}</Label>
            <Label x={42 + i * 344} y={216} cls="fill-zinc-100" size={12}>{s.rows} rows</Label>
            <Label x={150 + i * 344} y={216} cls="fill-zinc-500" size={8}>{s.what}</Label>
            <Label x={42 + i * 344} y={238} cls="fill-zinc-500" size={8}>{s.rowsIn} → {s.rowsOut}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.8)}>
        <Label x={370} y={270} anchor="middle" cls="fill-zinc-600" size={8}>rows-in → rows-out</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <line x1={26} y1={272} x2={694} y2={272} className="stroke-zinc-800" />
        <Label x={26} y={290} cls="fill-zinc-400" size={10}>GROUP BY collapses (16 rows survive); a window stamps (all 103 survive, summary rides along as a column).</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 58 — windows meet GROUP BY: rank the folded months ---------- */

function L58GroupRank() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="GROUP BY folds 103 orders into 14 monthly rows, then RANK() OVER (ORDER BY SUM(total) DESC) ranks the 14 groups: 2024-01 is rank 1 at 3731.97">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>SELECT month, SUM(total) AS revenue, RANK() OVER (ORDER BY SUM(total) DESC) AS rk … GROUP BY month</Label>
      </motion.g>
      {/* stage 1: raw rows */}
      <motion.g {...fade(0.15)}>
        <Panel x={26} y={44} w={170} h={196} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={64} cls="fill-zinc-300" size={9}>orders (raw)</Label>
        {Array.from({ length: 36 }, (_, i) => (
          <circle key={i} cx={46 + (i % 9) * 17} cy={82 + Math.floor(i / 9) * 17} r={4} className="fill-zinc-600" />
        ))}
        <Label x={42} y={228} cls="fill-zinc-500" size={9}>103 rows</Label>
      </motion.g>
      {/* fold arrow */}
      <motion.g {...fade(0.4)}>
        <Arrow x1={206} y1={142} x2={252} y2={142} cls="stroke-zinc-500" />
        <Label x={229} y={128} anchor="middle" cls="fill-zinc-400" size={9}>GROUP BY</Label>
        <Label x={229} y={158} anchor="middle" cls="fill-zinc-500" size={8}>fold</Label>
      </motion.g>
      {/* stage 2: 14 grouped rows */}
      <motion.g {...fade(0.55)}>
        <Panel x={262} y={44} w={200} h={196} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={278} y={64} cls="fill-zinc-300" size={9}>monthly groups</Label>
        {["2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06"].map((m, i) => (
          <g key={m}>
            <Label x={278} y={86 + i * 20} cls="fill-zinc-300" size={9}>{m}</Label>
            <Label x={442} y={86 + i * 20} anchor="end" cls="fill-zinc-200" size={9}>{["3731.97", "3609.64", "2617.08", "2468.91", "2910.31", "2047.43"][i]}</Label>
          </g>
        ))}
        <Label x={278} y={210} cls="fill-zinc-500" size={8}>… 8 more months</Label>
        <Label x={278} y={228} cls="fill-zinc-500" size={9}>14 rows at window time</Label>
      </motion.g>
      {/* stage 3: rank stamped */}
      <motion.g {...fade(0.75)}>
        <Arrow x1={472} y1={142} x2={500} y2={142} cls="stroke-emerald-400/80" />
        <Label x={486} y={128} anchor="middle" cls="fill-emerald-300" size={8}>RANK</Label>
        <Panel x={510} y={44} w={184} h={196} cls="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={526} y={64} cls="fill-emerald-300" size={9}>ranked months</Label>
        {[
          ["1", "2024-01", "3731.97"],
          ["2", "2024-05", "2910.31"],
          ["3", "2024-02", "3609.64"],
          ["4", "2024-03", "2617.08"],
        ].map(([rk, m, rev], i) => (
          <g key={rk}>
            <rect x={520} y={76 + i * 22} width={22} height={16} rx={4} className={i === 0 ? "fill-emerald-400/25" : "fill-zinc-800"} />
            <Label x={531} y={88 + i * 22} anchor="middle" cls={i === 0 ? "fill-emerald-200" : "fill-zinc-400"} size={9}>{rk}</Label>
            <Label x={550} y={88 + i * 22} cls="fill-zinc-300" size={9}>{m}</Label>
            <Label x={684} y={88 + i * 22} anchor="end" cls="fill-zinc-200" size={9}>{rev}</Label>
          </g>
        ))}
        <Label x={526} y={186} cls="fill-zinc-500" size={8}>window sees the 14 GROUPS,</Label>
        <Label x={526} y={202} cls="fill-zinc-500" size={8}>not the 103 raw rows —</Label>
        <Label x={526} y={218} cls="fill-zinc-500" size={8}>SUM(total) is already computed</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <line x1={26} y1={258} x2={694} y2={258} className="stroke-zinc-800" />
        <Label x={26} y={278} cls="fill-zinc-400" size={10}>&quot;Rank my aggregates&quot;: fold in GROUP BY, rank in OVER — leaderboard and data share one result set.</Label>
        <Label x={26} y={294} cls="fill-zinc-500" size={9}>Window expressions must be GROUP-BY-legal: only grouping keys and aggregates may appear inside OVER.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 59 — the three numberings on one tie ---------- */

function L59ThreeRanks() {
  const rows: Array<{ name: string; n: number }> = [
    { name: "Alice Chen", n: 9 },
    { name: "Bruno Silva", n: 8 },
    { name: "Chloe Dubois", n: 8 },
    { name: "Dmitri Volkov", n: 6 },
    { name: "Elif Yilmaz", n: 6 },
    { name: "Farid Nasser", n: 6 },
  ];
  const rn = [1, 2, 3, 4, 5, 6];
  const rank = [1, 1, 3, 4, 4, 4];
  const dense = [1, 1, 2, 3, 3, 3];
  // tie groups: indices 1-2 (n=8), 3-5 (n=6)
  const tieCls = (i: number) => (i === 1 || i === 2 ? "fill-amber-400/12" : i >= 3 ? "fill-sky-400/12" : "fill-transparent");
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Six customers ranked by order count with ties at 8 and 6: ROW_NUMBER gives 1-6, RANK gives 1,1,3,4,4,4, DENSE_RANK gives 1,1,2,3,3,3">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>ROW_NUMBER() vs RANK() vs DENSE_RANK() OVER (ORDER BY n DESC) — two tie groups, three verdicts</Label>
      </motion.g>
      {/* header row */}
      <motion.g {...fade(0.1)}>
        <Label x={60} y={48} cls="fill-zinc-400" size={9}>customer</Label>
        <Label x={250} y={48} anchor="middle" cls="fill-zinc-400" size={9}>n</Label>
        <Label x={330} y={48} anchor="middle" cls="fill-zinc-300" size={9}>ROW_NUMBER</Label>
        <Label x={452} y={48} anchor="middle" cls="fill-amber-300" size={9}>RANK</Label>
        <Label x={574} y={48} anchor="middle" cls="fill-sky-300" size={9}>DENSE_RANK</Label>
      </motion.g>
      <motion.g {...fade(0.2)}>
        {rows.map((r, i) => (
          <g key={r.name}>
            <rect x={26} y={58 + i * 26} width={640} height={22} rx={4} className={tieCls(i)} />
            <Label x={60} y={73 + i * 26} cls="fill-zinc-200" size={9}>{r.name}</Label>
            <Label x={250} y={73 + i * 26} anchor="middle" cls={i === 1 || i === 2 ? "fill-amber-200" : i >= 3 ? "fill-sky-200" : "fill-zinc-200"} size={10} bold>{r.n}</Label>
            <Label x={330} y={73 + i * 26} anchor="middle" cls="fill-zinc-300" size={10}>{rn[i]}</Label>
            <Label x={452} y={73 + i * 26} anchor="middle" cls="fill-amber-300" size={10}>{rank[i]}</Label>
            <Label x={574} y={73 + i * 26} anchor="middle" cls="fill-sky-300" size={10}>{dense[i]}</Label>
          </g>
        ))}
      </motion.g>
      {/* tie annotations */}
      <motion.g {...fade(0.55)}>
        <Bracket x={676} y={84} h={48} cls="stroke-amber-400/70" />
        <Label x={714} y={106} anchor="end" cls="fill-amber-300" size={8}>tie at 8</Label>
        <Label x={714} y={120} anchor="end" cls="fill-zinc-400" size={8}>2 rows</Label>
        <Bracket x={676} y={136} h={74} cls="stroke-sky-400/70" />
        <Label x={714} y={168} anchor="end" cls="fill-sky-300" size={8}>tie at 6</Label>
        <Label x={714} y={182} anchor="end" cls="fill-zinc-400" size={8}>3 rows</Label>
      </motion.g>
      {/* the rule */}
      <motion.g {...fade(0.8)}>
        <Panel x={26} y={222} w={668} h={40} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={239} cls="fill-amber-300" size={9}>RANK counts the rows ahead: after two co-1s the next row is 3 — positions 2 is skipped.</Label>
        <Label x={42} y={255} cls="fill-sky-300" size={9}>DENSE_RANK counts the tie groups ahead: after two groups the next is 3 — never a gap.</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <line x1={26} y1={272} x2={694} y2={272} className="stroke-zinc-800" />
        <Label x={26} y={290} cls="fill-zinc-400" size={10}>ROW_NUMBER is always 1..n, no repeats — why dedupe and top-N use it, and why it needs your tiebreaker.</Label>
      </motion.g>
    </svg>
  );
}

/** small square bracket used to mark tie groups */
function Bracket({ x, y, h, cls }: { x: number; y: number; h: number; cls: string }) {
  return (
    <path d={`M ${x + 5} ${y} h -5 v ${h} h 5`} fill="none" className={cls} strokeWidth={1.4} />
  );
}

/* ---------- lesson 59 — top-N per group: rank inside, filter outside ---------- */

function L59TopNPerGroup() {
  const lanes: Array<{ name: string; orders: number[] }> = [
    { name: "Alice Chen", orders: [412.9, 390.45, 288.1, 240.0, 154.3, 120.75] },
    { name: "Bruno Silva", orders: [388.2, 301.6, 265.9, 199.99, 84.5] },
    { name: "Chloe Dubois", orders: [356.75, 310.2, 245.1, 172.4, 133.0, 90.25, 61.1] },
  ];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="ROW_NUMBER stamped per customer partition, then rn <= 2 filtered in an outer query: the top-2 orders per customer survive, the rest fall away">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC) — then keep rn ≤ 2 OUTSIDE</Label>
      </motion.g>
      {/* lanes */}
      <motion.g {...fade(0.2)}>
        {lanes.map((ln, li) => (
          <g key={ln.name}>
            <Label x={26} y={56 + li * 56} cls="fill-zinc-300" size={9}>{ln.name}</Label>
            {ln.orders.map((t, oi) => {
              const keep = oi < 2;
              return (
                <g key={oi}>
                  <rect
                    x={128 + oi * 74}
                    y={42 + li * 56}
                    width={66}
                    height={26}
                    rx={5}
                    className={keep ? "fill-emerald-400/15 stroke-emerald-400/60" : "fill-zinc-900 stroke-zinc-800"}
                    strokeWidth={1}
                  />
                  <Label x={161 + oi * 74} y={59 + li * 56} anchor="middle" cls={keep ? "fill-emerald-200" : "fill-zinc-500"} size={8}>{t.toFixed(2)}</Label>
                  <Label x={161 + oi * 74} y={78 + li * 56} anchor="middle" cls={keep ? "fill-emerald-300" : "fill-zinc-600"} size={8}>rn {oi + 1}</Label>
                </g>
              );
            })}
          </g>
        ))}
        <Label x={128} y={216} cls="fill-zinc-500" size={8}>each partition restarts at rn 1 — the stamp is per-lane, not global</Label>
      </motion.g>
      {/* wrong vs right */}
      <motion.g {...fade(0.5)}>
        <Panel x={26} y={228} w={318} h={44} cls="fill-zinc-900 stroke-rose-400/60" />
        <Label x={42} y={246} cls="fill-rose-300" size={9}>✗ WHERE rn &lt;= 2 (same SELECT)</Label>
        <Label x={42} y={263} cls="fill-zinc-500" size={8}>rn does not exist at WHERE time — error</Label>
      </motion.g>
      <motion.g {...fade(0.65)}>
        <Panel x={376} y={228} w={318} h={44} cls="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={392} y={246} cls="fill-emerald-300" size={9}>✓ WITH ranked AS (…) SELECT … WHERE rn &lt;= 2</Label>
        <Label x={392} y={263} cls="fill-zinc-500" size={8}>outer layer filters after the window pass</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <line x1={26} y1={282} x2={694} y2={282} className="stroke-zinc-800" />
        <Label x={26} y={296} cls="fill-zinc-400" size={9}>Top-N per group = stamp inside, filter outside. Six customers × 2 = 12 survivor rows out of 103.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 60 — LAG & LEAD: the two directions and the edges ---------- */

function L60LagLeadEdges() {
  const months: Array<[string, number]> = [
    ["2024-01", 3731.97], ["2024-02", 3609.64], ["2024-03", 2617.08],
    ["2024-04", 2468.91], ["2024-05", 2910.31], ["2024-06", 2047.43],
  ];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Six monthly totals with LEAD arrows above pointing forward and LAG arrows below pointing back; the first month's LAG and the last month's LEAD are NULL">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>LAG(rev) OVER (ORDER BY mon) · LEAD(rev) OVER (ORDER BY mon) — both directions at once</Label>
      </motion.g>
      {/* month panels */}
      <motion.g {...fade(0.15)}>
        {months.map(([m, v], i) => (
          <g key={m}>
            <Panel x={26 + i * 116} y={78} w={100} h={72} cls={i === 0 || i === months.length - 1 ? "fill-zinc-900 stroke-amber-400/60" : "fill-zinc-900 stroke-zinc-700"} />
            <Label x={76 + i * 116} y={96} anchor="middle" cls="fill-zinc-400" size={8.5}>{m}</Label>
            <Label x={76 + i * 116} y={116} anchor="middle" cls="fill-zinc-100" size={10.5}>{v.toFixed(2)}</Label>
            <Label x={76 + i * 116} y={136} anchor="middle" cls={i === 0 ? "fill-amber-300" : "fill-zinc-500"} size={7.5}>
              {i === 0 ? "LAG → NULL" : `LAG ${months[i - 1][1].toFixed(2)}`}
            </Label>
          </g>
        ))}
        <Label x={714} y={164} anchor="end" cls="fill-amber-300" size={8}>last LEAD → NULL</Label>
      </motion.g>
      {/* LEAD arrows above */}
      <motion.g {...fade(0.45)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={`lead${i}`}>
            <Arrow x1={26 + i * 116 + 100} y1={62} x2={26 + (i + 1) * 116} y2={62} cls="stroke-sky-400/70" />
            <Label x={26 + i * 116 + 108} y={54} anchor="middle" cls="fill-sky-300" size={7.5}>LEAD</Label>
          </g>
        ))}
      </motion.g>
      {/* LAG arrows below */}
      <motion.g {...fade(0.6)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={`lag${i}`}>
            <Arrow x1={26 + (i + 1) * 116} y1={164} x2={26 + i * 116 + 100} y2={164} cls="stroke-violet-400/70" />
            <Label x={26 + i * 116 + 108} y={180} anchor="middle" cls="fill-violet-300" size={7.5}>LAG</Label>
          </g>
        ))}
      </motion.g>
      {/* offsets panel */}
      <motion.g {...fade(0.8)}>
        <Panel x={26} y={200} w={668} h={56} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={220} cls="fill-zinc-300" size={9}>offsets are yours to choose: LAG(rev, 12) OVER (ORDER BY mon) = &quot;same month last year&quot;</Label>
        <Label x={42} y={238} cls="fill-zinc-400" size={8}>LAG(rev, 2) skips one row · LAG(rev, 3, 0) supplies 0 when no row exists — the third argument is the NULL-buster</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <line x1={26} y1={268} x2={694} y2={268} className="stroke-zinc-800" />
        <Label x={26} y={286} cls="fill-zinc-400" size={10}>LAG looks back, LEAD looks ahead — edges have no neighbor and hand back NULL. Offsets need an ORDER BY.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 60 — the month-over-month bridge ---------- */

function L60MomBridge() {
  const rows: Array<[string, number, number | null]> = [
    ["2024-01", 3731.97, null],
    ["2024-02", 3609.64, -122.33],
    ["2024-03", 2617.08, -992.56],
    ["2024-04", 2468.91, -148.17],
    ["2024-05", 2910.31, 441.4],
    ["2024-06", 2047.43, -862.88],
    ["2024-07", 1193.86, -853.57],
  ];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Month-over-month bridge: each month's revenue beside its LAG previous value, absolute delta and percent change — May is the only green month at plus 441.40, July falls 41.7 percent">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>mon · rev · LAG(rev) OVER (ORDER BY mon) AS prev · rev - prev AS delta · ROUND(delta*100.0/prev,1) AS pct</Label>
      </motion.g>
      {/* header */}
      <motion.g {...fade(0.1)}>
        <Label x={56} y={48} cls="fill-zinc-400" size={9}>mon</Label>
        <Label x={160} y={48} anchor="end" cls="fill-zinc-400" size={9}>rev</Label>
        <Label x={280} y={48} anchor="end" cls="fill-zinc-400" size={9}>prev</Label>
        <Label x={400} y={48} anchor="end" cls="fill-zinc-400" size={9}>delta</Label>
        <Label x={520} y={48} anchor="end" cls="fill-zinc-400" size={9}>pct</Label>
        <Label x={688} y={48} anchor="end" cls="fill-zinc-400" size={9}>the month&apos;s story</Label>
      </motion.g>
      {/* rows */}
      <motion.g {...fade(0.25)}>
        {rows.map(([m, v, d], i) => {
          const pct = d === null ? null : +((d / rows[i - 1][1]) * 100).toFixed(1);
          return (
            <g key={m}>
              {i % 2 === 1 && <rect x={26} y={58 + i * 26} width={668} height={24} rx={4} className="fill-zinc-900/60" />}
              <Label x={56} y={74 + i * 26} cls="fill-zinc-300" size={9}>{m}</Label>
              <Label x={160} y={74 + i * 26} anchor="end" cls="fill-zinc-100" size={9.5}>{v.toFixed(2)}</Label>
              <Label x={280} y={74 + i * 26} anchor="end" cls={d === null ? "fill-amber-300 italic" : "fill-zinc-400"} size={9}>{d === null ? "NULL" : rows[i - 1][1].toFixed(2)}</Label>
              <Label x={400} y={74 + i * 26} anchor="end" cls={d === null ? "fill-amber-300 italic" : d > 0 ? "fill-emerald-300" : "fill-rose-300"} size={9.5}>{d === null ? "NULL" : `${d > 0 ? "+" : ""}${d.toFixed(2)}`}</Label>
              <Label x={520} y={74 + i * 26} anchor="end" cls={pct === null ? "fill-amber-300 italic" : pct > 0 ? "fill-emerald-300" : "fill-rose-300"} size={9.5}>{pct === null ? "NULL" : `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`}</Label>
              <Label x={688} y={74 + i * 26} anchor="end" cls="fill-zinc-500" size={8}>
                {d === null ? "no predecessor" : i === 4 ? "the one up month" : i === 6 ? "deepest fall: −41.7%" : d > 0 ? "recovery" : "slide"}
              </Label>
            </g>
          );
        })}
      </motion.g>
      {/* takeaway */}
      <motion.g {...fade(0.85)}>
        <Panel x={26} y={246} w={668} h={34} cls="fill-zinc-900 stroke-emerald-400/50" />
        <Label x={42} y={267} cls="fill-zinc-300" size={9}>one LAG call powers three columns — prev, delta, pct. May&apos;s +441.40 (+17.9%) is the only green in the half-year.</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <line x1={26} y1={284} x2={694} y2={284} className="stroke-zinc-800" />
        <Label x={26} y={296} cls="fill-zinc-400" size={8}>first-row NULLs are honest — guard with LAG(rev, 1, rev) to self-substitute, or filter them in the outer layer.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 61 — ROWS vs RANGE: where duplicates split them ---------- */

function L61RowsVsRange() {
  // daily totals with a duplicate: 8, 9, 9, 6
  const days: Array<[string, number]> = [["day 1", 8], ["day 2", 9], ["day 3", 9], ["day 4", 6]];
  const rowsRun = [8, 17, 26, 32]; // ROWS mode running sums
  const rangeRun = [8, 26, 26, 32]; // RANGE mode running sums
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Running SUM over daily counts 8, 9, 9, 6: ROWS mode gives 8, 17, 26, 32 but RANGE mode gives 8, 26, 26, 32 because the two tied days are peers and enter the frame together">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>SUM(n) OVER (ORDER BY d) — same query, two frame modes, two answers. The data: 8, 9, 9, 6.</Label>
      </motion.g>
      {/* ROWS panel */}
      <motion.g {...fade(0.15)}>
        <Panel x={26} y={40} w={318} h={190} cls="fill-zinc-900 stroke-violet-400/60" />
        <Label x={42} y={60} cls="fill-violet-300" size={10} bold>ROWS — physical rows</Label>
        {days.map(([d, v], i) => (
          <g key={d}>
            <rect x={42} y={72 + i * 34} width={130} height={28} rx={5} className="fill-zinc-800" />
            <Label x={107} y={90 + i * 34} anchor="middle" cls="fill-zinc-300" size={9}>{d}: {v}</Label>
            {i > 0 && <rect x={42} y={72 + i * 34} width={130} height={28} rx={5} className="fill-violet-400/10" />}
            <Label x={286} y={90 + i * 34} anchor="end" cls="fill-zinc-100" size={11}>{rowsRun[i]}</Label>
            <Label x={196} y={90 + i * 34} cls="fill-zinc-600" size={7.5}>{i === 0 ? "frame: row 1" : `frame: rows 1–${i + 1}`}</Label>
          </g>
        ))}
        <Label x={42} y={216} cls="fill-zinc-400" size={8}>every row joins the frame one at a time, in order</Label>
      </motion.g>
      {/* RANGE panel */}
      <motion.g {...fade(0.45)}>
        <Panel x={376} y={40} w={318} h={190} cls="fill-zinc-900 stroke-sky-400/60" />
        <Label x={392} y={60} cls="fill-sky-300" size={10} bold>RANGE — value peers</Label>
        {days.map(([d, v], i) => {
          const peer = i === 1 || i === 2;
          return (
            <g key={d}>
              <rect x={392} y={72 + i * 34} width={130} height={28} rx={5} className={peer ? "fill-sky-400/15 stroke-sky-400/60" : "fill-zinc-800"} strokeWidth={1} />
              <Label x={457} y={90 + i * 34} anchor="middle" cls={peer ? "fill-sky-200" : "fill-zinc-300"} size={9}>{d}: {v}</Label>
              <Label x={636} y={90 + i * 34} anchor="end" cls={peer ? "fill-sky-200" : "fill-zinc-100"} size={11}>{rangeRun[i]}</Label>
              <Label x={546} y={90 + i * 34} cls="fill-zinc-600" size={7.5}>{peer ? "peers: both 9s" : i === 0 ? "frame: value ≤ 8" : "frame: all ≤ 6"}</Label>
            </g>
          );
        })}
        <Label x={392} y={216} cls="fill-zinc-400" size={8}>tied values are peers — they cross the frame border together</Label>
      </motion.g>
      {/* divergence callout */}
      <motion.g {...fade(0.7)}>
        <Panel x={26} y={240} w={668} h={30} cls="fill-zinc-900 stroke-amber-400/50" />
        <Label x={42} y={259} cls="fill-amber-300" size={9}>day 2 vs day 3: ROWS says 17 then 26 · RANGE says 26 then 26 — the duplicates collapse the running story</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <line x1={26} y1={278} x2={694} y2={278} className="stroke-zinc-800" />
        <Label x={26} y={294} cls="fill-zinc-400" size={9}>With a UNIQUE order key, ROWS and RANGE agree. Ties are where they diverge — and SQLite&apos;s default is RANGE.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 61 — the frame vocabulary ---------- */

function L61FrameZoo() {
  const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
  const vals = [3731.97, 3609.64, 2617.08, 2468.91, 2910.31, 2047.43, 1193.86, 2504.12, 2211.45, 2538.11];
  const mov3At4 = +((vals[2] + vals[3] + vals[4]) / 3).toFixed(2); // 2665.43
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Three frame policies over a ten-month strip: default RANGE UNBOUNDED PRECEDING gives running totals, ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING gives the moving three-month average, UNBOUNDED both sides gives the grand total">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>the row strip (10 months) — every frame policy is a border drawn on it</Label>
      </motion.g>
      {/* month strip */}
      <motion.g {...fade(0.1)}>
        {months.map((m, i) => (
          <g key={m}>
            <rect x={30 + i * 68} y={44} width={60} height={30} rx={5} className={i === 4 ? "fill-zinc-800 stroke-emerald-400/70" : "fill-zinc-900 stroke-zinc-800"} strokeWidth={1} />
            <Label x={60 + i * 68} y={56} anchor="middle" cls="fill-zinc-400" size={7.5}>{m}</Label>
            <Label x={60 + i * 68} y={68} anchor="middle" cls="fill-zinc-200" size={7}>{(vals[i] / 1000).toFixed(1)}k</Label>
          </g>
        ))}
        <Label x={60 + 4 * 68} y={90} anchor="middle" cls="fill-emerald-300" size={8}>CURRENT ROW = 2024-05</Label>
      </motion.g>
      {/* frame 1: default */}
      <motion.g {...fade(0.35)}>
        <rect x={30} y={104} width={4 * 68 + 60} height={22} rx={6} className="fill-violet-400/12 stroke-violet-400/60" strokeWidth={1} />
        <Label x={30} y={140} cls="fill-violet-300" size={8.5}>default (RANGE UNBOUNDED PRECEDING): rows 1→5 → running 15337.91</Label>
      </motion.g>
      {/* frame 2: moving */}
      <motion.g {...fade(0.55)}>
        <rect x={30 + 3 * 68} y={150} width={2 * 68 + 60} height={22} rx={6} className="fill-sky-400/12 stroke-sky-400/60" strokeWidth={1} />
        <Label x={30} y={186} cls="fill-sky-300" size={8.5}>ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING: months 3,4,5 → moving avg {mov3At4.toFixed(2)}</Label>
      </motion.g>
      {/* frame 3: grand */}
      <motion.g {...fade(0.7)}>
        <rect x={30} y={196} width={9 * 68 + 60} height={22} rx={6} className="fill-emerald-400/10 stroke-emerald-400/50" strokeWidth={1} />
        <Label x={30} y={232} cls="fill-emerald-300" size={8.5}>RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING: the whole strip → the grand total, same on every row</Label>
      </motion.g>
      {/* why rows mode matters */}
      <motion.g {...fade(0.85)}>
        <Panel x={26} y={244} w={668} h={32} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={264} cls="fill-zinc-300" size={9}>spell it when you mean ROWS: SQLite and Postgres default to RANGE — with duplicate keys the policies disagree.</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <line x1={26} y1={282} x2={694} y2={282} className="stroke-zinc-800" />
        <Label x={26} y={296} cls="fill-zinc-400" size={8}>Frame = the window&apos;s border policy. Three spellings cover 95% of reports: running, moving, grand.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 62 — NTILE: equal-width bands ---------- */

function L62NtileQuartiles() {
  // 12 orders sorted desc, NTILE(4) → 3 per tile
  const orders = [590.6, 512.4, 478.9, 445.2, 412.9, 390.45, 356.75, 340.1, 301.6, 288.1, 265.9, 240.0];
  const tiles: Array<{ label: string; cls: string; fg: string; range: string }> = [
    { label: "TILE 1 — top quartile", cls: "stroke-emerald-400/60", fg: "fill-emerald-300", range: "590.60 – 445.20" },
    { label: "TILE 2 — second quartile", cls: "stroke-sky-400/60", fg: "fill-sky-300", range: "412.90 – 356.75" },
    { label: "TILE 3 — third quartile", cls: "stroke-violet-400/60", fg: "fill-violet-300", range: "340.10 – 288.10" },
    { label: "TILE 4 — bottom quartile", cls: "stroke-zinc-600", fg: "fill-zinc-400", range: "265.90 – 240.00" },
  ];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Twelve orders sorted by total cut by NTILE(4) into four tiles of three, with a percent scale showing each tile's position from 0 to 1">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>NTILE(4) OVER (ORDER BY total DESC) — 12 orders ÷ 4 tiles = exactly 3 each</Label>
      </motion.g>
      <motion.g {...fade(0.15)}>
        {tiles.map((t, ti) => (
          <g key={t.label}>
            <Panel x={26} y={38 + ti * 46} w={470} h={40} cls={`fill-zinc-900 ${t.cls}`} />
            <Label x={42} y={56 + ti * 46} cls={t.fg} size={8.5} bold>{t.label}</Label>
            <Label x={42} y={70 + ti * 46} cls="fill-zinc-500" size={7.5}>{t.range}</Label>
            {orders.slice(ti * 3, ti * 3 + 3).map((v, oi) => (
              <g key={oi}>
                <rect x={300 + oi * 62} y={46 + ti * 46} width={54} height={24} rx={5} className={ti === 0 ? "fill-emerald-400/15" : "fill-zinc-800"} />
                <Label x={327 + oi * 62} y={61 + ti * 46} anchor="middle" cls={ti === 0 ? "fill-emerald-200" : "fill-zinc-300"} size={7.5}>{v.toFixed(2)}</Label>
              </g>
            ))}
          </g>
        ))}
      </motion.g>
      {/* percent scale */}
      <motion.g {...fade(0.6)}>
        <line x1={536} y1={48} x2={536} y2={214} className="stroke-zinc-700" />
        <Label x={548} y={40} cls="fill-zinc-400" size={8}>PERCENT_RANK()</Label>
        {[
          ["0.0", 48], ["0.25", 87], ["0.5", 126], ["0.75", 165], ["1.0", 204],
        ].map(([lab, y]) => (
          <g key={lab as string}>
            <line x1={532} y1={y as number} x2={540} y2={y as number} className="stroke-zinc-500" />
            <Label x={548} y={(y as number) + 3} cls="fill-zinc-500" size={7.5}>{lab}</Label>
          </g>
        ))}
        <Label x={548} y={110} cls="fill-emerald-300" size={7.5}>tile 1 → 0.00–0.18</Label>
        <Label x={548} y={186} cls="fill-zinc-400" size={7.5}>tile 4 → 0.75–1.00</Label>
      </motion.g>
      {/* remainder rule */}
      <motion.g {...fade(0.8)}>
        <Panel x={26} y={228} w={668} h={32} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={248} cls="fill-zinc-300" size={9}>remainders go to the FRONT tiles: NTILE(4) over 10 rows → 3, 3, 2, 2 — never 2, 3, 3, 2.</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <line x1={26} y1={270} x2={694} y2={270} className="stroke-zinc-800" />
        <Label x={26} y={288} cls="fill-zinc-400" size={9}>NTILE cuts the sorted line into equal-width bands — &quot;my top-quartile customers&quot; is NTILE(4) = 1, no PERCENTILE wizardry.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 62 — share of total: the grand stamp at work ---------- */

function L62ShareOfTotal() {
  const bars: Array<[string, number]> = [
    ["2024-01", 3731.97], ["2024-02", 3609.64], ["2024-05", 2910.31],
    ["2024-03", 2617.08], ["2024-04", 2468.91],
  ];
  const grand = 34833.28;
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Share of total: SUM(total) OVER () stamps 34833.28 on every row, and each month's percentage is division against that stamp — January holds 10.7 percent of all revenue">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>ROUND(rev * 100.0 / SUM(rev) OVER (), 1) AS pct_of_year — the empty OVER is the whole trick</Label>
      </motion.g>
      {/* grand stamp */}
      <motion.g {...fade(0.15)}>
        <Panel x={26} y={44} w={190} h={130} cls="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={42} y={66} cls="fill-zinc-400" size={8.5}>SUM(rev) OVER ()</Label>
        <Label x={42} y={94} cls="fill-emerald-300" size={15}>{grand.toFixed(2)}</Label>
        <Label x={42} y={114} cls="fill-zinc-500" size={7.5}>stamped on ALL 14 rows —</Label>
        <Label x={42} y={128} cls="fill-zinc-500" size={7.5}>every row carries the year</Label>
        <Label x={42} y={152} cls="fill-zinc-600" size={7.5}>no CTE, no self-join,</Label>
        <Label x={42} y={164} cls="fill-zinc-600" size={7.5}>one window call</Label>
      </motion.g>
      {/* bars */}
      <motion.g {...fade(0.4)}>
        {bars.map(([m, v], i) => {
          const pct = +((v / grand) * 100).toFixed(1);
          const w = (pct / 12) * 330; // scale: labels never collide with values
          return (
            <g key={m}>
              <Label x={240} y={62 + i * 30} cls="fill-zinc-300" size={9}>{m}</Label>
              <rect x={300} y={50 + i * 30} width={w} height={18} rx={4} className={i === 0 ? "fill-emerald-400/40" : "fill-sky-400/25"} />
              <Label x={306 + w} y={63 + i * 30} cls={i === 0 ? "fill-emerald-300" : "fill-sky-300"} size={8.5}>{pct.toFixed(1)}%</Label>
              <Label x={690} y={63 + i * 30} anchor="end" cls="fill-zinc-500" size={8}>{v.toFixed(2)}</Label>
            </g>
          );
        })}
        <Label x={240} y={216} cls="fill-zinc-500" size={8}>top 5 of 14 months shown — together 44.0% of the year (15337.91 of 34833.28)</Label>
      </motion.g>
      {/* guard */}
      <motion.g {...fade(0.7)}>
        <Panel x={26} y={232} w={668} h={34} cls="fill-zinc-900 stroke-amber-400/50" />
        <Label x={42} y={253} cls="fill-amber-300" size={9}>guard the base: shares of a FILTERED set need the filter in a CTE first — OVER () only sees survivors of WHERE.</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <line x1={26} y1={276} x2={694} y2={276} className="stroke-zinc-800" />
        <Label x={26} y={292} cls="fill-zinc-400" size={9}>The share column is division against the stamp — why &quot;percent of total&quot; is the canonical empty-OVER query.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 63 — the pattern library: six shapes cover the field ---------- */

function L63PatternMap() {
  const cards: Array<{ name: string; call: string; shape: string; cls: string; fg: string }> = [
    { name: "MoM growth", call: "LAG(rev) OVER (ORDER BY mon)", shape: "rev − prev AS delta", cls: "stroke-emerald-400/60", fg: "fill-emerald-300" },
    { name: "Top-N per group", call: "ROW_NUMBER() OVER (PARTITION BY … ORDER BY …)", shape: "stamp inside, WHERE rn ≤ N outside", cls: "stroke-sky-400/60", fg: "fill-sky-300" },
    { name: "Dedupe", call: "ROW_NUMBER() OVER (PARTITION BY email ORDER BY id)", shape: "keep rn = 1", cls: "stroke-violet-400/60", fg: "fill-violet-300" },
    { name: "Running share", call: "SUM(x) OVER ()", shape: "x * 100.0 / grand", cls: "stroke-amber-400/60", fg: "fill-amber-300" },
    { name: "Moving average", call: "AVG(rev) OVER (ORDER BY mon ROWS 1 PREC… 1 FOLL…)", shape: "frame of 3", cls: "stroke-teal-400/60", fg: "fill-teal-300" },
    { name: "Gap finder", call: "created_at − LAG(created_at) OVER (ORDER BY id)", shape: "distance since previous event", cls: "stroke-rose-400/60", fg: "fill-rose-300" },
  ];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="The window pattern library as six cards: MoM growth, top-N per group, dedupe, running share, moving average and gap finder, each with its signature OVER call">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>nine lessons of windows → six reusable shapes. Every report you&apos;ll write is one of these wearing different clothes.</Label>
      </motion.g>
      <motion.g {...fade(0.15)}>
        {cards.slice(0, 3).map((cd, i) => (
          <g key={cd.name}>
            <Panel x={26 + i * 232} y={40} w={212} h={104} cls={`fill-zinc-900 ${cd.cls}`} />
            <Label x={42 + i * 232} y={62} cls={cd.fg} size={10} bold>{cd.name}</Label>
            <Label x={42 + i * 232} y={84} cls="fill-zinc-300" size={7}>{cd.call.length > 38 ? cd.call.slice(0, 37) + "…" : cd.call}</Label>
            <Label x={42 + i * 232} y={108} cls="fill-zinc-500" size={7.5}>{cd.shape}</Label>
            <Label x={42 + i * 232} y={130} cls="fill-zinc-600" size={7}>L{[60, 59, 63][i]} · verified pattern</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.4)}>
        {cards.slice(3).map((cd, i) => (
          <g key={cd.name}>
            <Panel x={26 + i * 232} y={158} w={212} h={96} cls={`fill-zinc-900 ${cd.cls}`} />
            <Label x={42 + i * 232} y={178} cls={cd.fg} size={10} bold>{cd.name}</Label>
            <Label x={42 + i * 232} y={198} cls="fill-zinc-300" size={7}>{cd.call.length > 38 ? cd.call.slice(0, 37) + "…" : cd.call}</Label>
            <Label x={42 + i * 232} y={220} cls="fill-zinc-500" size={7.5}>{cd.shape}</Label>
            <Label x={42 + i * 232} y={242} cls="fill-zinc-600" size={7}>L{[62, 61, 60][i]} · verified pattern</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.7)}>
        <Panel x={26} y={262} w={668} h={26} cls="fill-zinc-900 stroke-emerald-400/50" />
        <Label x={42} y={279} cls="fill-zinc-300" size={9}>choose by QUESTION: &quot;vs last time&quot; → LAG · &quot;best per group&quot; → partition rank · &quot;part of whole&quot; → empty OVER.</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <Label x={26} y={297} cls="fill-zinc-400" size={8}>combos get powerful: top-N per group + running share = &quot;each customer&apos;s biggest order, and its share of their spend.&quot;</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 63 — the dedupe pattern ---------- */

function L63DedupeRn() {
  // 7 signup rows, two emails duplicated
  const rows: Array<[string, number, string]> = [
    ["mia@postbox.dev", 1, "2024-01-03"],
    ["leo@fastmail.io", 1, "2024-01-05"],
    ["mia@postbox.dev", 2, "2024-01-09"],
    ["ana@inboxhub.net", 1, "2024-01-11"],
    ["leo@fastmail.io", 2, "2024-01-14"],
    ["sam@quickmail.co", 1, "2024-01-18"],
    ["mia@postbox.dev", 3, "2024-01-22"],
  ];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Dedupe: ROW_NUMBER stamped per email partition over seven signups, the three duplicates crossed out, four survivor rows kept by rn equals 1">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at, id) — keep rn = 1, everything else is a re-signup</Label>
      </motion.g>
      {/* signup ledger */}
      <motion.g {...fade(0.15)}>
        <Panel x={26} y={40} w={400} h={196} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={60} cls="fill-zinc-400" size={8}>email</Label>
        <Label x={220} y={60} anchor="middle" cls="fill-zinc-400" size={8}>rn</Label>
        <Label x={300} y={60} anchor="middle" cls="fill-zinc-400" size={8}>created_at</Label>
        <Label x={398} y={60} anchor="end" cls="fill-zinc-400" size={8}>verdict</Label>
        <line x1={26} y1={68} x2={426} y2={68} className="stroke-zinc-800" />
        {rows.map(([em, rn, dt], i) => {
          const keep = rn === 1;
          return (
            <g key={`${em}-${rn}`}>
              <Label x={42} y={86 + i * 20} cls={keep ? "fill-zinc-200" : "fill-zinc-500"} size={8.5}>{em}</Label>
              <Label x={220} y={86 + i * 20} anchor="middle" cls={keep ? "fill-emerald-300" : "fill-rose-300"} size={9} bold>{rn}</Label>
              <Label x={300} y={86 + i * 20} anchor="middle" cls="fill-zinc-400" size={8.5}>{dt}</Label>
              {keep ? (
                <Label x={398} y={86 + i * 20} anchor="end" cls="fill-emerald-300" size={8}>keep</Label>
              ) : (
                <g>
                  <Label x={398} y={86 + i * 20} anchor="end" cls="fill-rose-300" size={8}>ghost</Label>
                </g>
              )}
            </g>
          );
        })}
        <Label x={42} y={228} cls="fill-zinc-500" size={7.5}>tiebreak on id makes the survivor deterministic — the EARLIEST signup always wins</Label>
      </motion.g>
      {/* survivors */}
      <motion.g {...fade(0.5)}>
        <Arrow x1={436} y1={138} x2={470} y2={138} cls="stroke-emerald-400/80" />
        <Label x={453} y={124} anchor="middle" cls="fill-emerald-300" size={8}>rn = 1</Label>
        <Panel x={480} y={40} w={214} h={196} cls="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={496} y={62} cls="fill-emerald-300" size={9}>survivors — 4 of 7</Label>
        {["mia@postbox.dev", "leo@fastmail.io", "ana@inboxhub.net", "sam@quickmail.co"].map((em, i) => (
          <g key={em}>
            <rect x={496} y={74 + i * 26} width={182} height={20} rx={4} className="fill-emerald-400/10" />
            <Label x={504} y={88 + i * 26} cls="fill-zinc-200" size={8.5}>{em}</Label>
          </g>
        ))}
        <Label x={496} y={186} cls="fill-zinc-500" size={7.5}>mia signed up 3× · leo 2×</Label>
        <Label x={496} y={202} cls="fill-zinc-500" size={7.5}>the ghosts never reach the report</Label>
        <Label x={496} y={224} cls="fill-rose-300" size={7.5}>3 rows crossed out</Label>
      </motion.g>
      {/* the two jobs */}
      <motion.g {...fade(0.75)}>
        <Panel x={26} y={246} w={668} h={30} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={265} cls="fill-zinc-300" size={9}>FROM (… rn …) WHERE rn = 1 — same shape as top-N; the question changes: &quot;which row IS the customer?&quot;</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <line x1={26} y1={282} x2={694} y2={282} className="stroke-zinc-800" />
        <Label x={26} y={296} cls="fill-zinc-400" size={8}>One natural key, one ROW_NUMBER, one tiebreaker — dedupe is deterministic exactly when the tiebreak is. Without it, &quot;the survivor&quot; changes per run.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 64 — reading the plan tree ---------- */

function L64PlanTree() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="EXPLAIN QUERY PLAN tree for a join and group-by: SCAN orders with a filter, SEARCH customers by primary key, and a temporary b-tree for GROUP BY, each node with its rows-touched cost">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={7.5}>EXPLAIN QUERY PLAN SELECT c.name, COUNT(*) FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = &apos;delivered&apos; GROUP BY c.name;</Label>
      </motion.g>
      {/* plan nodes */}
      <motion.g {...fade(0.15)}>
        {/* root */}
        <Panel x={250} y={44} w={220} h={54} cls="fill-zinc-900 stroke-violet-400/60" />
        <Label x={360} y={64} anchor="middle" cls="fill-violet-300" size={9.5} bold>GROUP (temp b-tree)</Label>
        <Label x={360} y={82} anchor="middle" cls="fill-zinc-500" size={8}>sorts 16 name-groups before aggregating</Label>
        {/* left node: scan orders */}
        <Panel x={40} y={150} w={280} h={54} cls="fill-zinc-900 stroke-rose-400/60" />
        <Label x={180} y={170} anchor="middle" cls="fill-rose-300" size={9.5} bold>SCAN o + FILTER status=?</Label>
        <Label x={180} y={188} anchor="middle" cls="fill-zinc-500" size={8}>reads ALL 103 orders, keeps 52 delivered</Label>
        {/* right node: search customers */}
        <Panel x={400} y={150} w={280} h={54} cls="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={540} y={170} anchor="middle" cls="fill-emerald-300" size={9.5} bold>SEARCH c USING INTEGER PRIMARY KEY</Label>
        <Label x={540} y={188} anchor="middle" cls="fill-zinc-500" size={8}>rowid=? — one direct hop per order</Label>
        {/* connectors */}
        <Arrow x1={180} y1={150} x2={300} y2={98} cls="stroke-zinc-600" />
        <Arrow x1={540} y1={150} x2={420} y2={98} cls="stroke-zinc-600" />
      </motion.g>
      {/* cost ledger */}
      <motion.g {...fade(0.55)}>
        <Panel x={26} y={222} w={668} h={38} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={238} cls="fill-zinc-300" size={9}>cost ledger: 103 row reads (SCAN) + 52 index hops (SEARCH) + 1 sort — the plan prints SQLite&apos;s real work order</Label>
        <Label x={42} y={254} cls="fill-zinc-500" size={8}>read TOP-DOWN: inner loop first — the SCAN of orders drives the loop, customers are looked up per surviving row</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <line x1={26} y1={272} x2={694} y2={272} className="stroke-zinc-800" />
        <Label x={26} y={290} cls="fill-zinc-400" size={10}>The plan is the receipt: SCAN touches everything, SEARCH hops a sorted structure. Read it before optimizing.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 64 — seek vs scan: what an index buys ---------- */

function L64SeekVsScan() {
  const rand = rng(11);
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Full scan touches all 103 rows versus a B-tree seek that touches three index pages and one row: 103 reads against 3, the logarithm an index buys">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>WHERE id = 47 — two strategies, one question: touch everything, or hop a sorted tree?</Label>
      </motion.g>
      {/* scan panel */}
      <motion.g {...fade(0.15)}>
        <Panel x={26} y={40} w={318} h={150} cls="fill-zinc-900 stroke-rose-400/60" />
        <Label x={42} y={60} cls="fill-rose-300" size={9.5} bold>SCAN — every row, every time</Label>
        {Array.from({ length: 42 }, (_, i) => (
          <circle
            key={i}
            cx={44 + (i % 14) * 21 + rand() * 3}
            cy={76 + Math.floor(i / 14) * 21 + rand() * 3}
            r={5}
            className="fill-rose-400/50"
          />
        ))}
        <Label x={42} y={152} cls="fill-zinc-300" size={8}>103/103 rows read · O(n) — grows with the table</Label>
        <Label x={42} y={170} cls="fill-zinc-500" size={8}>doubles when the table doubles — no ceiling</Label>
      </motion.g>
      {/* seek panel */}
      <motion.g {...fade(0.45)}>
        <Panel x={376} y={40} w={318} h={150} cls="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={392} y={60} cls="fill-emerald-300" size={9.5} bold>SEARCH — B-tree probe</Label>
        {/* tree hops */}
        {[
          ["root", 462, 78], ["branch", 540, 78], ["leaf", 618, 78],
        ].map(([lab, x], i) => (
          <g key={lab as string}>
            <rect x={(x as number) - 26} y={70} width={52} height={26} rx={6} className="fill-emerald-400/15 stroke-emerald-400/60" strokeWidth={1} />
            <Label x={x as number} y={87} anchor="middle" cls="fill-emerald-200" size={8}>{lab}</Label>
            {i < 2 && <Arrow x1={(x as number) + 26} y1={83} x2={(x as number) + 52} y2={83} cls="stroke-emerald-400/70" />}
          </g>
        ))}
        <Arrow x1={618} y1={96} x2={618} y2={114} cls="stroke-emerald-400/70" />
        <rect x={572} y={116} width={92} height={24} rx={6} className="fill-emerald-400/25" />
        <Label x={618} y={132} anchor="middle" cls="fill-emerald-100" size={8.5}>row 47</Label>
        <Label x={392} y={152} cls="fill-zinc-300" size={8}>3 index pages + 1 row · O(log n) — flat forever</Label>
        <Label x={392} y={170} cls="fill-zinc-500" size={8}>a million-row table costs ~20 hops, not a million reads</Label>
      </motion.g>
      {/* cost bars */}
      <motion.g {...fade(0.7)}>
        <Label x={26} y={216} cls="fill-zinc-400" size={9}>rows touched</Label>
        <rect x={130} y={206} width={540 * (103 / 104)} height={14} rx={4} className="fill-rose-400/45" />
        <Label x={690} y={217} cls="fill-rose-300" size={9} anchor="end">SCAN 103</Label>
        <rect x={130} y={230} width={540 * (3 / 104)} height={14} rx={4} className="fill-emerald-400/45" />
        <Label x={148} y={241} cls="fill-emerald-300" size={9}>SEARCH 3</Label>
      </motion.g>
      {/* the catch */}
      <motion.g {...fade(0.85)}>
        <Panel x={26} y={252} w={668} h={28} cls="fill-zinc-900 stroke-amber-400/50" />
        <Label x={42} y={270} cls="fill-amber-300" size={9}>the catch: the index must be SARGABLE — WHERE SUBSTR(name,1,1) = &apos;A&apos; can&apos;t use an index on name; the function hides the column.</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <line x1={26} y1={286} x2={694} y2={286} className="stroke-zinc-800" />
        <Label x={26} y={297} cls="fill-zinc-400" size={8}>An index buys you a logarithm — but only for predicates the planner can match. Check the plan, not the folklore.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- registry ---------------- */

export const FIGURES_M10: Partial<Record<FigureId, () => React.JSX.Element>> = {
  "l58-eval-order": L58EvalOrder,
  "l58-four-shapes": L58FourShapes,
  "l58-group-rank": L58GroupRank,
  "l59-three-ranks": L59ThreeRanks,
  "l59-topn-per-group": L59TopNPerGroup,
  "l60-lag-lead-edges": L60LagLeadEdges,
  "l60-mom-bridge": L60MomBridge,
  "l61-rows-vs-range": L61RowsVsRange,
  "l61-frame-zoo": L61FrameZoo,
  "l62-ntile-quartiles": L62NtileQuartiles,
  "l62-share-of-total": L62ShareOfTotal,
  "l63-pattern-map": L63PatternMap,
  "l63-dedupe-rn": L63DedupeRn,
  "l64-plan-tree": L64PlanTree,
  "l64-seek-vs-scan": L64SeekVsScan,
};
