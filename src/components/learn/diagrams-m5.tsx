"use client";

// Module 5 lesson figures (lessons 29–32) — the scalar & window toolkit:
// text/NULL reshaping pipelines, date bucketing, ranking without collapsing,
// LAG/LEAD offsets and running totals. Same drawing kit as diagrams.tsx;
// registry merged there. All numbers seed-verified (scripts/facts-m456.ts).

import { motion } from "framer-motion";
import type { FigureId } from "@/lib/curriculum/types";
import { Label, Arrow, Pipe, Panel, XMark, fade } from "./diagrams-kit";

/* ---------- lesson 29 intro — the text pipeline: one row, many reshape ---------- */

function T1TextPipeline() {
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="One customer row flows through text functions: UPPER shouts the name, LENGTH counts it, SUBSTR plus INSTR extracts the email handle">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>SELECT UPPER(name), LENGTH(name), SUBSTR(email, 1, INSTR(email, &apos;@&apos;) - 1) FROM customers WHERE id = 1</Label>
      </motion.g>
      {/* source row */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={46} w={180} h={92} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={68} cls="fill-zinc-400" size={9}>customers · row 1</Label>
        <Label x={42} y={90} cls="fill-zinc-200" size={10}>Alice Chen</Label>
        <Label x={42} y={110} cls="fill-zinc-300" size={9}>alice.chen@example.com</Label>
        <Label x={42} y={128} cls="fill-zinc-500" size={8}>raw values in…</Label>
      </motion.g>
      {/* three function lanes */}
      <motion.g {...fade(0.4)}>
        <Pipe pts={[[206, 72], [252, 72]]} cls="stroke-teal-400" arrowAng={0} arrowCls="stroke-teal-400" />
        <Panel x={256} y={44} w={214} h={48} cls="fill-zinc-900 stroke-teal-400/60" />
        <Label x={272} y={64} cls="fill-teal-300" size={9}>UPPER(name)</Label>
        <Label x={272} y={82} cls="fill-zinc-100" size={10}>ALICE CHEN</Label>
      </motion.g>
      <motion.g {...fade(0.55)}>
        <Pipe pts={[[206, 92], [252, 92]]} cls="stroke-teal-400" arrowAng={0} arrowCls="stroke-teal-400" />
        <Panel x={256} y={104} w={214} h={48} cls="fill-zinc-900 stroke-teal-400/60" />
        <Label x={272} y={124} cls="fill-teal-300" size={9}>LENGTH(name)</Label>
        <Label x={272} y={142} cls="fill-zinc-100" size={10}>10 characters</Label>
      </motion.g>
      <motion.g {...fade(0.7)}>
        <Pipe pts={[[206, 112], [252, 112]]} cls="stroke-teal-400" arrowAng={0} arrowCls="stroke-teal-400" />
        <Panel x={256} y={164} w={214} h={62} cls="fill-zinc-900 stroke-teal-400/60" />
        <Label x={272} y={184} cls="fill-teal-300" size={9}>SUBSTR + INSTR</Label>
        <Label x={272} y={202} cls="fill-zinc-100" size={10}>alice.chen</Label>
        <Label x={272} y={218} cls="fill-zinc-500" size={8}>slice up to the @</Label>
      </motion.g>
      {/* facts strip */}
      <motion.g {...fade(0.85)}>
        <Panel x={500} y={44} w={194} h={182} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={516} y={66} cls="fill-zinc-400" size={10}>on this store</Label>
        <Label x={516} y={88} cls="fill-zinc-300" size={9}>names: 9–14 chars</Label>
        <Label x={516} y={108} cls="fill-zinc-300" size={9}>product names: 13–23</Label>
        <Label x={516} y={128} cls="fill-zinc-300" size={9}>emails: 19–24 chars</Label>
        <Label x={516} y={148} cls="fill-zinc-500" size={8}>every handle ends</Label>
        <Label x={516} y={164} cls="fill-zinc-500" size={8}>before the @ —</Label>
        <Label x={516} y={180} cls="fill-zinc-500" size={8}>INSTR finds it,</Label>
        <Label x={516} y={196} cls="fill-zinc-500" size={8}>SUBSTR keeps 1..pos-1</Label>
      </motion.g>
      <motion.g {...fade(1)}>
        <line x1={26} y1={244} x2={694} y2={244} className="stroke-zinc-800" />
        <Label x={26} y={262} cls="fill-zinc-400" size={10}>Scalar functions reshape one value at a time — every row flows through the same pipes.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 29 deep — NULL damage control: COALESCE on shipped_at ---------- */

function T5NullCoalesce() {
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="COALESCE walks its arguments left to right and returns the first non-NULL: 82 shipping dates pass through, 21 NULLs become awaiting">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>SELECT COALESCE(shipped_at, &apos;awaiting&apos;) FROM orders</Label>
      </motion.g>
      {/* coalesce gate */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={44} w={300} h={110} cls="fill-zinc-900 stroke-teal-400/60" />
        <Label x={42} y={66} cls="fill-teal-300" size={10}>COALESCE(shipped_at, &apos;awaiting&apos;)</Label>
        <Label x={42} y={88} cls="fill-zinc-300" size={9}>walk left → right, return the</Label>
        <Label x={42} y={104} cls="fill-zinc-300" size={9}>first argument that isn&apos;t NULL</Label>
        <Label x={42} y={128} cls="fill-zinc-500" size={8}>all-NULL arguments → NULL out</Label>
      </motion.g>
      {/* rows in */}
      <motion.g {...fade(0.4)}>
        <Label x={370} y={52} cls="fill-zinc-400" size={10}>103 orders enter:</Label>
        {Array.from({ length: 30 }).map((_, i) => {
          const cx = 380 + (i % 15) * 21;
          const cy = 70 + Math.floor(i / 15) * 22;
          const isNull = i >= 24;
          return isNull
            ? <circle key={i} cx={cx} cy={cy} r={6} className="fill-amber-400/70" />
            : <circle key={i} cx={cx} cy={cy} r={6} className="fill-zinc-500" />;
        })}
        <Label x={380} y={120} cls="fill-zinc-300" size={9}>82 carry a date — pass through untouched</Label>
        <Label x={380} y={140} cls="fill-amber-300" size={9}>21 NULLs (pending / cancelled) — swapped for &apos;awaiting&apos;</Label>
      </motion.g>
      {/* IFNULL / NULLIF cousins */}
      <motion.g {...fade(0.6)}>
        <Panel x={26} y={170} w={300} h={78} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={192} cls="fill-zinc-300" size={9}>IFNULL(x, y) — the two-argument cousin</Label>
        <Label x={42} y={212} cls="fill-zinc-300" size={9}>NULLIF(a, b) — NULL when a = b</Label>
        <Label x={42} y={232} cls="fill-zinc-500" size={8}>the guard: AVG(NULLIF(total, 0)) skips fake zeros</Label>
      </motion.g>
      <motion.g {...fade(0.75)}>
        <Panel x={370} y={170} w={324} h={78} cls="fill-zinc-900 stroke-amber-400/50" />
        <Label x={386} y={192} cls="fill-amber-300" size={9}>lesson 4&apos;s promise, kept</Label>
        <Label x={386} y={212} cls="fill-zinc-300" size={9}>&quot;treat missing as zero&quot; is now one function call —</Label>
        <Label x={386} y={232} cls="fill-zinc-300" size={9}>and lesson 25&apos;s NOT IN landmine has a fix: COALESCE</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <line x1={26} y1={252} x2={694} y2={252} className="stroke-zinc-800" />
        <Label x={26} y={270} cls="fill-zinc-400" size={10}>NULLs don&apos;t disappear under coercion — COALESCE is the explicit decision to replace them.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 30 intro — the calendar bucket: strftime slices created_at ---------- */

function T2Calendar() {
  return (
    <svg viewBox="0 0 720 290" className="w-full" role="img" aria-label="strftime slices the ISO date into month buckets: 103 orders across 14 months, each bucket 6 to 9 orders">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>SELECT strftime(&apos;%Y-%m&apos;, created_at) AS mon, COUNT(*) FROM orders GROUP BY mon</Label>
      </motion.g>
      {/* raw dates */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={44} w={220} h={120} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={66} cls="fill-zinc-400" size={9}>orders.created_at (TEXT)</Label>
        <Label x={42} y={88} cls="fill-zinc-200" size={10}>2024-01-06</Label>
        <Label x={42} y={106} cls="fill-zinc-200" size={10}>2024-01-21</Label>
        <Label x={42} y={124} cls="fill-zinc-200" size={10}>2024-02-03</Label>
        <Label x={42} y={142} cls="fill-zinc-200" size={10}>2024-02-17</Label>
        <Label x={42} y={158} cls="fill-zinc-500" size={8}>… ISO strings, zero-padded</Label>
      </motion.g>
      <motion.g {...fade(0.4)}>
        <Pipe pts={[[246, 104], [292, 104]]} cls="stroke-teal-400" arrowAng={0} arrowCls="stroke-teal-400" />
        <Label x={236} y={92} cls="fill-teal-300" size={9}>strftime(&apos;%Y-%m&apos;)</Label>
      </motion.g>
      {/* buckets */}
      <motion.g {...fade(0.55)}>
        <Panel x={296} y={44} w={398} h={120} cls="fill-zinc-900 stroke-teal-400/60" />
        <Label x={312} y={66} cls="fill-teal-300" size={10}>14 month buckets · 103 orders</Label>
        {[
          ["2024-01", 8], ["2024-02", 9], ["2024-03", 8], ["2024-04", 7],
          ["2024-05", 8], ["2024-06", 6], ["2024-07", 8],
        ].map(([mon, n], i) => (
          <g key={mon as string}>
            <Label x={316 + i * 54} y={92} anchor="middle" cls="fill-zinc-500" size={7}>{(mon as string).slice(5)}</Label>
            <rect x={306 + i * 54} y={112 - ((n as number) - 5) * 6} width={30} height={(n as number) * 4.2} rx={3} className="fill-teal-400/25 stroke-teal-400/60" />
            <Label x={321 + i * 54} y={156} anchor="middle" cls="fill-zinc-300" size={8}>{n}</Label>
          </g>
        ))}
        <Label x={312} y={158} cls="fill-zinc-500" size={7}>… 7 more months, 6–9 each</Label>
      </motion.g>
      {/* takeaway strip */}
      <motion.g {...fade(0.8)}>
        <Panel x={26} y={182} w={668} h={56} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={204} cls="fill-zinc-300" size={9}>The alias trick: GROUP BY mon works in SQLite — but the portable spelling repeats the expression: GROUP BY strftime(&apos;%Y-%m&apos;, created_at)</Label>
        <Label x={42} y={224} cls="fill-zinc-500" size={8}>buckets + COUNT is the skeleton of every time-series report; the next two lessons add ranks and deltas on top</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <line x1={26} y1={252} x2={694} y2={252} className="stroke-zinc-800" />
        <Label x={26} y={270} cls="fill-zinc-400" size={10}>A date is really a formatted string here — slice it with the right format code and GROUP BY does the rest.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 30 deep — month revenue buckets + the year split ---------- */

function T6MonthBuckets() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Monthly revenue bars from 3731.97 in January down to 1193.86 in July, and the year split: 2024 took 90 orders for 30773.25, 2025 took 13 for 4060.03">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-400" size={10}>Revenue per month — SUM(total) grouped by strftime(&apos;%Y-%m&apos;, created_at)</Label>
      </motion.g>
      {/* bars */}
      {[
        ["01", 3731.97], ["02", 3609.64], ["03", 2617.08], ["04", 2468.91],
        ["05", 2910.31], ["06", 2047.43], ["07", 1193.86], ["08", 2352.07],
        ["09", 3116.04], ["10", 2975.67], ["11", 1648.8], ["12", 2101.47],
      ].map(([mon, rev], i) => {
        const h = ((rev as number) / 3731.97) * 120;
        const x = 34 + i * 46;
        return (
          <motion.g key={mon as string} {...fade(0.15 + i * 0.04)}>
            <rect x={x} y={176 - h} width={30} height={h} rx={3} className="fill-teal-400/20 stroke-teal-400/60" />
            <Label x={x + 15} y={190} anchor="middle" cls="fill-zinc-500" size={8}>{mon}</Label>
          </motion.g>
        );
      })}
      <motion.g {...fade(0.6)}>
        <line x1={26} y1={176} x2={590} y2={176} className="stroke-zinc-700" />
        <Label x={34} y={54} cls="fill-zinc-500" size={8}>peak 3731.97</Label>
        <Label x={200} y={166} cls="fill-amber-300" size={8}>July dip: 1193.86</Label>
        <Label x={26} y={212} cls="fill-zinc-500" size={8}>2024 months only — 2025 continues on the next shelf</Label>
      </motion.g>
      {/* year split panel */}
      <motion.g {...fade(0.75)}>
        <Panel x={608} y={44} w={86} h={200} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={651} y={64} anchor="middle" cls="fill-zinc-300" size={9}>2024</Label>
        <rect x={630} y={74} width={42} height={110} rx={4} className="fill-emerald-400/25 stroke-emerald-400/60" />
        <Label x={651} y={200} anchor="middle" cls="fill-emerald-300" size={9}>90 orders</Label>
        <Label x={651} y={216} anchor="middle" cls="fill-emerald-300" size={8}>30773.25</Label>
      </motion.g>
      <motion.g {...fade(0.85)}>
        <Panel x={608} y={252} w={86} h={34} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={651} y={266} anchor="middle" cls="fill-zinc-400" size={8}>2025: 13 orders</Label>
        <Label x={651} y={280} anchor="middle" cls="fill-zinc-400" size={8}>4060.03</Label>
      </motion.g>
      <motion.g {...fade(1)}>
        <line x1={26} y1={292} x2={694} y2={292} className="stroke-zinc-800" />
        <Label x={26} y={296} cls="fill-zinc-400" size={9}> </Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 31 intro — rank without collapsing: the spend leaderboard ---------- */

function T3Ranked() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="RANK() OVER orders customers by spend but keeps every row: Alice 7262.35 is rank 1, Olivia 444.80 is rank 16 — 16 rows in, 16 rows out">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>SELECT c.name, SUM(o.total) AS spend, RANK() OVER (ORDER BY SUM(o.total) DESC) AS rk FROM customers c JOIN orders o … GROUP BY c.id</Label>
      </motion.g>
      {/* leaderboard */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={40} w={430} h={204} cls="fill-zinc-900 stroke-teal-400/60" />
        <Label x={42} y={60} cls="fill-teal-300" size={9}>rk</Label>
        <Label x={82} y={60} cls="fill-teal-300" size={9}>name</Label>
        <Label x={330} y={60} cls="fill-teal-300" size={9}>spend</Label>
        <line x1={26} y1={68} x2={456} y2={68} className="stroke-zinc-800" />
        {[
          ["1", "Alice Chen", "7262.35"],
          ["2", "Emma Wilson", "6640.56"],
          ["3", "Grace Kim", "4574.23"],
          ["4", "Maya Patel", "3644.56"],
          ["5", "Chloe Dubois", "2667.93"],
          ["6", "Pedro Alvarez", "1686.17"],
          ["7", "Farid Nasser", "1458.97"],
        ].map(([rk, name, spend], i) => (
          <g key={rk}>
            <Label x={42} y={86 + i * 22} cls="fill-amber-300" size={10}>{rk}</Label>
            <Label x={82} y={86 + i * 22} cls="fill-zinc-200" size={10}>{name}</Label>
            <Label x={330} y={86 + i * 22} cls="fill-zinc-300" size={10}>{spend}</Label>
          </g>
        ))}
        <Label x={82} y={240} cls="fill-zinc-600" size={8}>… ranks 8–16 down to Olivia Brown 444.80</Label>
      </motion.g>
      {/* vs GROUP BY panel */}
      <motion.g {...fade(0.55)}>
        <Panel x={486} y={40} w={208} h={92} cls="fill-zinc-900 stroke-rose-400/50" />
        <Label x={502} y={62} cls="fill-rose-300" size={9}>GROUP BY would give</Label>
        <Label x={502} y={82} cls="fill-zinc-300" size={9}>1 summary row,</Label>
        <Label x={502} y={100} cls="fill-zinc-300" size={9}>16 names erased</Label>
        <Label x={502} y={120} cls="fill-zinc-500" size={8}>aggregates collapse</Label>
      </motion.g>
      <motion.g {...fade(0.7)}>
        <Panel x={486} y={144} w={208} h={100} cls="fill-zinc-900 stroke-emerald-400/50" />
        <Label x={502} y={166} cls="fill-emerald-300" size={9}>RANK() OVER gives</Label>
        <Label x={502} y={186} cls="fill-zinc-300" size={9}>16 rows, order +</Label>
        <Label x={502} y={204} cls="fill-zinc-300" size={9}>position preserved</Label>
        <Label x={502} y={226} cls="fill-zinc-500" size={8}>windows compute across,</Label>
        <Label x={502} y={240} cls="fill-zinc-500" size={8}>never collapse down</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <line x1={26} y1={262} x2={694} y2={262} className="stroke-zinc-800" />
        <Label x={26} y={282} cls="fill-zinc-400" size={10}>The window looks at all 16 spends to place each customer — but every row walks out alive.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 31 deep — ties: RANK vs DENSE_RANK on region ---------- */

function T7PartitionRank() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Five APAC customers tie at rank 1; the next tie group lands on rank 6 with RANK but rank 2 with DENSE_RANK">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>RANK() OVER (ORDER BY region) vs DENSE_RANK() OVER (ORDER BY region)</Label>
      </motion.g>
      {/* APAC block */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={40} w={300} h={150} cls="fill-zinc-900 stroke-amber-400/60" />
        <Label x={42} y={62} cls="fill-amber-300" size={10}>APAC — 5-way tie</Label>
        {["Farid Nasser", "Grace Kim", "Hiro Tanaka", "Keiko Sato", "Maya Patel"].map((name, i) => (
          <g key={name}>
            <Label x={42} y={86 + i * 20} cls="fill-zinc-200" size={9}>{name}</Label>
            <Label x={210} y={86 + i * 20} cls="fill-amber-300" size={9}>RANK 1</Label>
            <Label x={280} y={86 + i * 20} cls="fill-teal-300" size={9}>DENSE 1</Label>
          </g>
        ))}
      </motion.g>
      {/* EU block */}
      <motion.g {...fade(0.5)}>
        <Panel x={356} y={40} w={338} h={150} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={372} y={62} cls="fill-zinc-300" size={10}>EU — the next 8 rows</Label>
        {["Alice Chen", "Chloe Dubois", "Dmitri Volkov", "Isabella Rossi", "Liam O'Brien", "Noah Meyer", "Olivia Brown"].slice(0, 5).map((name, i) => (
          <g key={name}>
            <Label x={372} y={86 + i * 20} cls="fill-zinc-200" size={9}>{name}</Label>
            <Label x={560} y={86 + i * 20} cls="fill-rose-300" size={9}>RANK 6</Label>
            <Label x={640} y={86 + i * 20} cls="fill-teal-300" size={9}>DENSE 2</Label>
          </g>
        ))}
        <Label x={372} y={186} cls="fill-zinc-500" size={8}>… all eight EU rows share the same two numbers</Label>
      </motion.g>
      {/* the rule */}
      <motion.g {...fade(0.7)}>
        <Panel x={26} y={204} w={668} h={54} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={226} cls="fill-zinc-300" size={9}>RANK skips: 1, 1, 1, 1, 1 → 6 (five people tied ahead, so position jumps)</Label>
        <Label x={42} y={246} cls="fill-zinc-300" size={9}>DENSE_RANK packs: 1, 1, 1, 1, 1 → 2 (no gaps — always the tie group&apos;s count + 1)</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <line x1={26} y1={270} x2={694} y2={270} className="stroke-zinc-800" />
        <Label x={26} y={290} cls="fill-zinc-400" size={10}>Same data, same window — the only difference is what a tie does to the row AFTER it.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 32 intro — LAG: each month meets its predecessor ---------- */

function T4Window() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="LAG reads the previous month's order count: February sees 8 and scores a plus one, June sees 8 and drops two — the first month has no predecessor and gets NULL">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>SELECT mon, n, LAG(n) OVER (ORDER BY mon) AS prev, n - LAG(n) OVER (ORDER BY mon) AS delta FROM monthly</Label>
      </motion.g>
      {/* row chain */}
      <motion.g {...fade(0.2)}>
        {[
          ["2024-01", "8", "—", null],
          ["2024-02", "9", "8", "+1"],
          ["2024-03", "8", "9", "-1"],
          ["2024-04", "7", "8", "-1"],
          ["2024-05", "8", "7", "+1"],
          ["2024-06", "6", "8", "-2"],
        ].map(([mon, n, prev, delta], i) => (
          <motion.g key={mon as string} {...fade(0.2 + i * 0.1)}>
            <Panel x={26 + i * 108} y={52} w={96} h={104} cls={i === 0 ? "fill-zinc-900 stroke-amber-400/60" : "fill-zinc-900 stroke-zinc-700"} />
            <Label x={74 + i * 108} y={74} anchor="middle" cls="fill-zinc-400" size={9}>{mon}</Label>
            <Label x={74 + i * 108} y={98} anchor="middle" cls="fill-zinc-100" size={13}>{n} orders</Label>
            <Label x={74 + i * 108} y={122} anchor="middle" cls="fill-zinc-500" size={9}>prev: {prev}</Label>
            <Label x={74 + i * 108} y={144} anchor="middle" cls={delta === null ? "fill-amber-300" : (String(delta).startsWith("+") ? "fill-emerald-300" : "fill-rose-300")} size={10}>{delta === null ? "delta NULL" : `delta ${delta}`}</Label>
          </motion.g>
        ))}
      </motion.g>
      {/* arrows between */}
      <motion.g {...fade(0.7)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Arrow key={i} x1={26 + (i - 1) * 108 + 96} y1={104} x2={26 + i * 108} y2={104} cls="stroke-zinc-600" />
        ))}
        <Label x={26} y={182} cls="fill-amber-300" size={9}>2024-01 has no predecessor — LAG returns NULL, and the delta arithmetic inherits it.</Label>
      </motion.g>
      {/* the two directions */}
      <motion.g {...fade(0.85)}>
        <Panel x={26} y={198} w={320} h={62} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={220} cls="fill-zinc-300" size={9}>LAG(n) — look one row BACK</Label>
        <Label x={42} y={240} cls="fill-zinc-300" size={9}>LEAD(n) — look one row AHEAD (last row → NULL)</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <Panel x={376} y={198} w={318} h={62} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={392} y={220} cls="fill-zinc-300" size={9}>full ledger: deltas +1, -1, -1, +1, -2, +2 …</Label>
        <Label x={392} y={240} cls="fill-zinc-500" size={8}>the month-over-month story, one window call deep</Label>
      </motion.g>
      <motion.g {...fade(1)}>
        <line x1={26} y1={274} x2={694} y2={274} className="stroke-zinc-800" />
        <Label x={26} y={292} cls="fill-zinc-400" size={10}>LAG is a row offset — which means the window NEEDS an ORDER BY, or &apos;previous&apos; means nothing.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 32 deep — the running total: SUM OVER walks the ledger ---------- */

function T8RunningTotal() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="SUM(rev) OVER accumulates monthly revenue: 3731.97, 7341.61, 9958.69 down the ledger to 34833.28 at 2025-02">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>SELECT mon, rev, SUM(rev) OVER (ORDER BY mon) AS running FROM monthly</Label>
      </motion.g>
      {/* ledger */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={40} w={400} h={186} cls="fill-zinc-900 stroke-teal-400/60" />
        <Label x={42} y={62} cls="fill-teal-300" size={9}>mon</Label>
        <Label x={140} y={62} cls="fill-teal-300" size={9}>rev</Label>
        <Label x={260} y={62} cls="fill-teal-300" size={9}>running</Label>
        <line x1={26} y1={70} x2={426} y2={70} className="stroke-zinc-800" />
        {[
          ["2024-01", "3731.97", "3731.97"],
          ["2024-02", "3609.64", "7341.61"],
          ["2024-03", "2617.08", "9958.69"],
          ["2024-04", "2468.91", "12427.60"],
          ["2024-05", "2910.31", "15337.91"],
          ["2024-07", "1193.86", "18579.20"],
        ].map(([mon, rev, run], i) => (
          <g key={mon}>
            <Label x={42} y={90 + i * 22} cls="fill-zinc-300" size={9}>{mon}</Label>
            <Label x={140} y={90 + i * 22} cls="fill-zinc-200" size={9}>{rev}</Label>
            <Label x={260} y={90 + i * 22} cls="fill-emerald-300" size={9}>{run}</Label>
          </g>
        ))}
        <Label x={42} y={222} cls="fill-zinc-600" size={8}>… 8 more months, each row adding its own rev to the pile</Label>
      </motion.g>
      {/* final tally */}
      <motion.g {...fade(0.6)}>
        <Panel x={456} y={40} w={238} h={92} cls="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={472} y={64} cls="fill-zinc-400" size={9}>last row&apos;s running total</Label>
        <Label x={472} y={92} cls="fill-emerald-300" size={14}>34833.28</Label>
        <Label x={472} y={116} cls="fill-zinc-500" size={8}>= storewide SUM(total) — no GROUP BY needed</Label>
      </motion.g>
      {/* frames */}
      <motion.g {...fade(0.8)}>
        <Panel x={456} y={146} w={238} h={80} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={472} y={168} cls="fill-zinc-300" size={9}>frames change the window:</Label>
        <Label x={472} y={188} cls="fill-zinc-400" size={8}>default: everything up to now</Label>
        <Label x={472} y={206} cls="fill-zinc-400" size={8}>ROWS BETWEEN 2 PRECEDING</Label>
        <Label x={472} y={220} cls="fill-zinc-400" size={8}>AND CURRENT ROW → moving avg</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <line x1={26} y1={244} x2={694} y2={244} className="stroke-zinc-800" />
        <Label x={26} y={264} cls="fill-zinc-400" size={10}>Every row keeps its own identity AND carries the accumulated story of all rows before it.</Label>
        <Label x={26} y={282} cls="fill-zinc-500" size={9}>Running total at the last row equals the plain SUM — two tools, one truth, different shapes.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- registry ---------------- */

export const FIGURES_M5: Partial<Record<FigureId, () => React.JSX.Element>> = {
  "t1-text-pipeline": T1TextPipeline,
  "t2-calendar": T2Calendar,
  "t3-ranked": T3Ranked,
  "t4-window": T4Window,
  "t5-null-coalesce": T5NullCoalesce,
  "t6-month-buckets": T6MonthBuckets,
  "t7-partition-rank": T7PartitionRank,
  "t8-running-total": T8RunningTotal,
};
