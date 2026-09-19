"use client";

// Module 6 lesson figures (lessons 33–34) — the expert clinic:
// string aggregation, the UNION-ALL grand-total stack, every outer-join
// shape and the non-equi range band. Same drawing kit as diagrams.tsx;
// registry merged there. All numbers seed-verified (scripts/facts-m456.ts).

import { motion } from "framer-motion";
import type { FigureId } from "@/lib/curriculum/types";
import { Label, Arrow, Pipe, Panel, XMark, fade } from "./diagrams-kit";

/* ---------- lesson 33 intro — GROUP_CONCAT: many rows, one cell ---------- */

function X1StringAgg() {
  return (
    <svg viewBox="0 0 720 290" className="w-full" role="img" aria-label="GROUP_CONCAT folds many rows into one comma-joined cell: Alice's four statuses become one string; three customers own all four statuses">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>SELECT c.name, GROUP_CONCAT(DISTINCT o.status) AS statuses FROM … GROUP BY c.id</Label>
      </motion.g>
      {/* rows in */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={44} w={230} h={170} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={66} cls="fill-zinc-400" size={9}>Alice&apos;s order statuses (24 rows)</Label>
        {["delivered", "shipped", "pending", "cancelled", "delivered", "shipped", "… 18 more"].map((s, i) => (
          <Label key={`${s}-${i}`} x={42} y={88 + i * 20} cls={i === 6 ? "fill-zinc-600" : "fill-zinc-300"} size={9}>{s}</Label>
        ))}
      </motion.g>
      <motion.g {...fade(0.4)}>
        <Pipe pts={[[256, 130], [302, 130]]} cls="stroke-teal-400" arrowAng={0} arrowCls="stroke-teal-400" />
        <Label x={244} y={118} cls="fill-teal-300" size={9}>fold</Label>
      </motion.g>
      {/* cell out */}
      <motion.g {...fade(0.55)}>
        <Panel x={306} y={96} w={388} h={68} cls="fill-zinc-900 stroke-teal-400/60" />
        <Label x={322} y={118} cls="fill-teal-300" size={9}>one cell per customer</Label>
        <Label x={322} y={142} cls="fill-zinc-100" size={10}>shipped,cancelled,delivered,pending</Label>
      </motion.g>
      {/* the trio */}
      <motion.g {...fade(0.75)}>
        <Panel x={306} y={180} w={388} h={70} cls="fill-zinc-900 stroke-emerald-400/50" />
        <Label x={322} y={202} cls="fill-emerald-300" size={9}>exactly 3 customers own ALL FOUR statuses:</Label>
        <Label x={322} y={226} cls="fill-zinc-200" size={10}>Alice Chen · Emma Wilson · Maya Patel</Label>
        <Label x={322} y={242} cls="fill-zinc-500" size={8}>the full-lifecycle shoppers — found by counting the DISTINCT fold</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <line x1={26} y1={258} x2={694} y2={258} className="stroke-zinc-800" />
        <Label x={26} y={276} cls="fill-zinc-400" size={10}>The aggregate that returns TEXT: every row in the group is folded into one comma-joined string.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 33 deep — the grand-total stack: UNION ALL adds the total row ---------- */

function X3TotalStack() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="The report is two UNION ALL arms: per-region rows with a literal label, then one total row — SQLite has no ROLLUP, so the ledger is spelled by hand">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>SELECT region, spend FROM … GROUP BY region UNION ALL SELECT &apos;TOTAL&apos;, SUM(total) FROM orders</Label>
      </motion.g>
      {/* arm 1 */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={44} w={300} h={140} cls="fill-zinc-900 stroke-teal-400/60" />
        <Label x={42} y={66} cls="fill-teal-300" size={10}>arm 1 — the detail rows</Label>
        <Label x={42} y={88} cls="fill-zinc-400" size={9}>GROUP BY region → 4 rows</Label>
        {[
          ["EU", "15089.23"],
          ["APAC", "11605.45"],
          ["US", "7286.16"],
        ].map(([r, s], i) => (
          <g key={r}>
            <Label x={58} y={112 + i * 20} cls="fill-zinc-200" size={9}>{r}</Label>
            <Label x={200} y={112 + i * 20} cls="fill-zinc-300" size={9}>{s}</Label>
          </g>
        ))}
        <Label x={58} y={176} cls="fill-zinc-600" size={8}>+ LATAM 852.44</Label>
      </motion.g>
      {/* arm 2 */}
      <motion.g {...fade(0.45)}>
        <Panel x={380} y={44} w={314} h={90} cls="fill-zinc-900 stroke-amber-400/60" />
        <Label x={396} y={66} cls="fill-amber-300" size={10}>arm 2 — the grand total</Label>
        <Label x={396} y={88} cls="fill-zinc-300" size={9}>SELECT &apos;TOTAL&apos;, SUM(total) FROM orders</Label>
        <Label x={396} y={112} cls="fill-zinc-100" size={10}>TOTAL · 34833.28</Label>
      </motion.g>
      <motion.g {...fade(0.35)}>
        <Label x={334} y={80} cls="fill-zinc-500" size={14}>⇒</Label>
      </motion.g>
      {/* the stack */}
      <motion.g {...fade(0.65)}>
        <Panel x={26} y={200} w={668} h={58} cls="fill-zinc-900 stroke-emerald-400/50" />
        {[
          ["EU", "15089.23"],
          ["APAC", "11605.45"],
          ["US", "7286.16"],
          ["LATAM", "852.44"],
          ["TOTAL", "34833.28"],
        ].map(([r, s], i) => (
          <g key={r}>
            <Label x={56 + i * 136} y={222} cls={r === "TOTAL" ? "fill-emerald-300" : "fill-zinc-200"} size={9}>{r}</Label>
            <Label x={56 + i * 136} y={242} cls={r === "TOTAL" ? "fill-emerald-300" : "fill-zinc-400"} size={9}>{s}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.85)}>
        <line x1={26} y1={268} x2={694} y2={268} className="stroke-zinc-800" />
        <Label x={26} y={288} cls="fill-zinc-400" size={9}>Postgres and MySQL 8 write this as GROUP BY ROLLUP — SQLite spells it with UNION ALL, and the skill transfers.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 34 intro — the join atlas: LEFT keeps, RIGHT keeps the other side, FULL keeps both ---------- */

function X2JoinAtlas() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="The three outer shapes over customers and cancelled orders: LEFT keeps all 16 customers, RIGHT keeps all 7 cancelled orders plus their customers at 19 rows, FULL keeps everything at 115 rows">
      <motion.g {...fade(0)}>
        <Label x={26} y={20} cls="fill-zinc-400" size={10}>orders o (103) ⋈ customers c (16) — with AND o.status = &apos;cancelled&apos; in ON</Label>
      </motion.g>
      {/* LEFT */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={40} w={210} h={150} cls="fill-zinc-900 stroke-teal-400/60" />
        <Label x={42} y={62} cls="fill-teal-300" size={10}>LEFT JOIN</Label>
        <Label x={42} y={84} cls="fill-zinc-300" size={9}>keeps every customer</Label>
        <Label x={42} y={104} cls="fill-zinc-100" size={11}>16 rows</Label>
        <Label x={42} y={126} cls="fill-zinc-500" size={8}>4 match a cancelled order,</Label>
        <Label x={42} y={142} cls="fill-zinc-500" size={8}>12 ride with NULLs</Label>
        <Label x={42} y={162} cls="fill-zinc-500" size={8}>the anti-join workhorse</Label>
      </motion.g>
      {/* RIGHT */}
      <motion.g {...fade(0.4)}>
        <Panel x={256} y={40} w={210} h={150} cls="fill-zinc-900 stroke-amber-400/60" />
        <Label x={272} y={62} cls="fill-amber-300" size={10}>RIGHT JOIN</Label>
        <Label x={272} y={84} cls="fill-zinc-300" size={9}>keeps every customer…</Label>
        <Label x={272} y={104} cls="fill-zinc-100" size={11}>19 rows</Label>
        <Label x={272} y={126} cls="fill-zinc-500" size={8}>7 cancelled pairs +</Label>
        <Label x={272} y={142} cls="fill-zinc-500" size={8}>12 NULL-filled customers</Label>
        <Label x={272} y={162} cls="fill-zinc-500" size={8}>LEFT with the tables flipped</Label>
      </motion.g>
      {/* FULL */}
      <motion.g {...fade(0.6)}>
        <Panel x={486} y={40} w={208} h={150} cls="fill-zinc-900 stroke-rose-400/60" />
        <Label x={502} y={62} cls="fill-rose-300" size={10}>FULL OUTER JOIN</Label>
        <Label x={502} y={84} cls="fill-zinc-300" size={9}>keeps EVERYTHING</Label>
        <Label x={502} y={104} cls="fill-zinc-100" size={11}>115 rows</Label>
        <Label x={502} y={126} cls="fill-zinc-500" size={8}>all 103 orders (96 unmatched</Label>
        <Label x={502} y={142} cls="fill-zinc-500" size={8}>kept!) + 12 gap customers</Label>
        <Label x={502} y={162} cls="fill-zinc-500" size={8}>the audit-the-world join</Label>
      </motion.g>
      {/* rule strip */}
      <motion.g {...fade(0.8)}>
        <Panel x={26} y={206} w={668} h={52} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={228} cls="fill-zinc-300" size={9}>The outer sides never shrink the kept table — unmatched rows survive with NULLs. INNER is the only join that can lose rows.</Label>
        <Label x={42} y={248} cls="fill-zinc-500" size={8}>same ON, three row counts: 16 · 19 · 115 — the AND-in-ON caveat is what makes FULL explode</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <line x1={26} y1={270} x2={694} y2={270} className="stroke-zinc-800" />
        <Label x={26} y={290} cls="fill-zinc-400" size={9}>SQLite runs all three since 3.39 (2022) — this app&apos;s engine included; MySQL still ships no FULL OUTER JOIN.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 34 deep — the non-equi band: orders land in price bands ---------- */

function X4RangeJoin() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="A non-equi join: the band table has no foreign key — each order matches every band its total falls between, landing 8 small, 30 medium, 40 large, 25 jumbo">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>FROM orders o JOIN bands b ON o.total &gt;= b.lo AND o.total &lt; b.hi</Label>
      </motion.g>
      {/* bands table */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={44} w={280} h={160} cls="fill-zinc-900 stroke-teal-400/60" />
        <Label x={42} y={66} cls="fill-teal-300" size={10}>bands — a CTE of (lo, hi, label)</Label>
        {[
          ["0 – 49.99", "small"],
          ["50 – 199.99", "medium"],
          ["200 – 499.99", "large"],
          ["500 – ∞", "jumbo"],
        ].map(([range, label], i) => (
          <g key={label}>
            <Label x={42} y={92 + i * 24} cls="fill-zinc-400" size={9}>{range}</Label>
            <Label x={200} y={92 + i * 24} cls="fill-zinc-200" size={9}>{label}</Label>
          </g>
        ))}
        <Label x={42} y={192} cls="fill-zinc-500" size={8}>no foreign key connects these —</Label>
        <Label x={42} y={206} cls="fill-zinc-500" size={8}>only a BETWEEN predicate does</Label>
      </motion.g>
      {/* order landing */}
      <motion.g {...fade(0.5)}>
        <Panel x={360} y={44} w={334} h={160} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={376} y={66} cls="fill-zinc-300" size={10}>each order lands in exactly one band</Label>
        {[
          ["order #12 · 148.28", "medium"],
          ["order #1 · 576.54", "jumbo"],
          ["order #9 · 46.67", "small"],
        ].map(([o, band], i) => (
          <g key={o}>
            <Label x={376} y={92 + i * 24} cls="fill-zinc-300" size={9}>{o}</Label>
            <Arrow x1={520} y1={88 + i * 24} x2={548} y2={88 + i * 24} cls="stroke-teal-400" />
            <Label x={556} y={92 + i * 24} cls="fill-teal-300" size={9}>{band}</Label>
          </g>
        ))}
        <Label x={376} y={166} cls="fill-zinc-500" size={8}>order #12 also beats the small band&apos;s lo = 0 — the hi bound</Label>
        <Label x={376} y={182} cls="fill-zinc-500" size={8}>is what stops it from matching every band</Label>
      </motion.g>
      {/* tally */}
      <motion.g {...fade(0.7)}>
        <Panel x={26} y={222} w={668} h={44} />
        {[
          ["small", "8"],
          ["medium", "30"],
          ["large", "40"],
          ["jumbo", "25"],
        ].map(([b, n], i) => (
          <g key={b}>
            <Label x={70 + i * 170} y={240} cls="fill-zinc-300" size={9}>{b}</Label>
            <Label x={70 + i * 170} y={256} cls="fill-emerald-300" size={10}>{n} orders</Label>
          </g>
        ))}
        <Label x={680} y={248} anchor="end" cls="fill-zinc-500" size={9}>= 103 ✓</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <line x1={26} y1={276} x2={694} y2={276} className="stroke-zinc-800" />
        <Label x={26} y={294} cls="fill-zinc-400" size={9}>No equality at all — the join predicate is a range. Fanout math: one order × 4 bands, the bounds keep exactly one match.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- registry ---------------- */

export const FIGURES_M6: Partial<Record<FigureId, () => React.JSX.Element>> = {
  "x1-string-agg": X1StringAgg,
  "x2-join-atlas": X2JoinAtlas,
  "x3-total-stack": X3TotalStack,
  "x4-range-join": X4RangeJoin,
};
