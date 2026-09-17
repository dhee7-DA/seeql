"use client";

// Module 4 lesson figures (lessons 25–28) — subqueries & CTEs:
// nested-value gates, IN pipelines, EXISTS probes, correlated loops,
// derived-table two-stage plans and CTE staging areas. Same drawing kit
// as diagrams.tsx; registry merged there. All numbers seed-verified
// (scripts/facts-m456.ts + gen-expected).

import { motion } from "framer-motion";
import type { FigureId } from "@/lib/curriculum/types";
import { Label, Arrow, Pipe, Panel, XMark, fade } from "./diagrams-kit";

/* ---------- lesson 25 intro — the nested value: a query feeds a comparison ---------- */

function Q1Nested() {
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="A scalar subquery computes the average price 71.78 first, then the outer WHERE compares every product against it">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>SELECT name, price FROM products WHERE price &gt; (SELECT AVG(price) FROM products)</Label>
      </motion.g>
      {/* inner query panel */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={44} w={230} h={78} cls="fill-zinc-900 stroke-teal-400/60" />
        <Label x={42} y={64} cls="fill-teal-300" size={10}>inner · runs first, once</Label>
        <Label x={42} y={84} cls="fill-zinc-300" size={10}>(SELECT AVG(price)</Label>
        <Label x={42} y={102} cls="fill-zinc-300" size={10}> FROM products) → 71.78</Label>
      </motion.g>
      <motion.g {...fade(0.5)}>
        <Pipe pts={[[256, 83], [306, 83]]} cls="stroke-teal-400" arrowAng={0} arrowCls="stroke-teal-400" />
        <Label x={268} y={72} cls="fill-teal-300" size={9}>one value</Label>
      </motion.g>
      {/* outer gate */}
      <motion.g {...fade(0.65)}>
        <Panel x={310} y={44} w={150} h={78} cls="fill-zinc-900 stroke-amber-400/60" />
        <Label x={326} y={66} cls="fill-amber-300" size={10}>outer gate</Label>
        <Label x={326} y={86} cls="fill-zinc-200" size={11}>price &gt; 71.78</Label>
        <Label x={326} y={106} cls="fill-zinc-500" size={9}>comparison, per row</Label>
      </motion.g>
      {/* product dots in / out */}
      <motion.g {...fade(0.85)}>
        <Label x={496} y={40} cls="fill-zinc-400" size={10}>16 products → 6 survive</Label>
        {Array.from({ length: 16 }).map((_, i) => {
          const cx = 504 + (i % 8) * 24;
          const cy = 58 + Math.floor(i / 8) * 26;
          const pass = i < 6;
          return pass ? (
            <circle key={i} cx={cx} cy={cy} r={7} className="fill-emerald-400/80" />
          ) : (
            <g key={i}><XMark x={cx} y={cy} cls="stroke-zinc-600" s={5} delay={0.9 + i * 0.02} /></g>
          );
        })}
        <Label x={496} y={116} cls="fill-emerald-300" size={9}>Smart Watch S · Fitness Band X2</Label>
        <Label x={496} y={131} cls="fill-emerald-300" size={9}>4K Webcam Pro · Studio Desktop Mic</Label>
        <Label x={496} y={146} cls="fill-emerald-300" size={9}>Mechanical Keyboard K1</Label>
        <Label x={496} y={161} cls="fill-emerald-300" size={9}>Noise-Canceling Headset</Label>
      </motion.g>
      {/* footer */}
      <motion.g {...fade(1.1)}>
        <line x1={26} y1={236} x2={694} y2={236} className="stroke-zinc-800" />
        <Label x={26} y={258} cls="fill-zinc-400" size={10}>The inner query collapses 16 prices into one number — the outer query never knows a query was there.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 25 deep — IN (SELECT …) pipeline: the cancelled list ---------- */

function Q5InPipeline() {
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="The IN subquery emits the list of customers with a cancelled order: ids 1, 5, 11, 13, and the outer query keeps exactly those customers">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = &apos;cancelled&apos;)</Label>
      </motion.g>
      {/* stage 1: inner emits list */}
      <motion.g {...fade(0.2)}>
        <Label x={26} y={44} cls="fill-zinc-400" size={10}>inner — 7 cancelled orders, DISTINCT ids</Label>
        <Panel x={26} y={54} w={190} h={104} />
        {["1", "5", "11", "13"].map((v, i) => (
          <Label key={v} x={46} y={78 + i * 22} cls="fill-teal-300" size={11}>{v}</Label>
        ))}
        <Label x={120} y={78} cls="fill-zinc-500" size={9}>← Alice Chen</Label>
        <Label x={120} y={100} cls="fill-zinc-500" size={9}>← Emma Wilson</Label>
        <Label x={120} y={122} cls="fill-zinc-500" size={9}>← Keiko Sato</Label>
        <Label x={120} y={144} cls="fill-zinc-500" size={9}>← Maya Patel</Label>
      </motion.g>
      <motion.g {...fade(0.45)}>
        <Pipe pts={[[216, 106], [266, 106]]} cls="stroke-teal-400" arrowAng={0} arrowCls="stroke-teal-400" />
        <Label x={241} y={94} anchor="middle" cls="fill-teal-300" size={9}>the list</Label>
      </motion.g>
      {/* stage 2: outer rows checked against list */}
      <motion.g {...fade(0.6)}>
        <Label x={270} y={44} cls="fill-zinc-400" size={10}>outer — each customer&apos;s id checked</Label>
        <Panel x={270} y={54} w={420} h={104} />
        {[1, 2, 3, 4, 5, 11, 13, 16].map((id, i) => {
          const hit = [1, 5, 11, 13].includes(id);
          const cx = 300 + i * 47;
          return (
            <g key={id}>
              <Label x={cx} y={84} anchor="middle" cls={hit ? "fill-teal-300" : "fill-zinc-500"} size={11}>{id}</Label>
              {hit
                ? <circle cx={cx} cy={108} r={7} className="fill-emerald-400/80" />
                : <XMark x={cx} y={108} cls="stroke-zinc-600" s={5} delay={0.8 + i * 0.04} />}
              <Label x={cx} y={132} anchor="middle" cls="fill-zinc-600" size={8}>{hit ? "in" : "out"}</Label>
            </g>
          );
        })}
        <Label x={300} y={174} cls="fill-zinc-500" size={9}>showing 8 of 16 customer rows — ids 1, 5, 11, 13 match</Label>
      </motion.g>
      {/* footer */}
      <motion.g {...fade(1.05)}>
        <line x1={26} y1={236} x2={694} y2={236} className="stroke-zinc-800" />
        <Label x={26} y={258} cls="fill-zinc-400" size={10}>The inner query returns a column of ids; IN turns it into a membership test. 4 customers survive.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 26 intro — the EXISTS probe: stop at the first match ---------- */

function Q2Probe() {
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="EXISTS runs the inner query once per outer row and stops at the first match: Alice probes yes, Bruno probes no">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = &apos;shipped&apos;)</Label>
      </motion.g>
      {/* probe 1: Alice — match */}
      <motion.g {...fade(0.2)}>
        <Label x={26} y={48} cls="fill-zinc-400" size={10}>probe 1 — Alice Chen (id 1)</Label>
        <Panel x={26} y={58} w={280} h={64} cls="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={42} y={80} cls="fill-zinc-300" size={10}>scan her orders for status = &apos;shipped&apos;</Label>
        <Label x={42} y={104} cls="fill-emerald-300" size={11}>found one → stop → TRUE</Label>
      </motion.g>
      <motion.g {...fade(0.5)}>
        <circle cx={370} cy={90} r={8} className="fill-emerald-400/80" />
        <Label x={388} y={94} cls="fill-emerald-300" size={10}>kept</Label>
      </motion.g>
      {/* probe 2: Bruno — no match */}
      <motion.g {...fade(0.65)}>
        <Label x={26} y={148} cls="fill-zinc-400" size={10}>probe 2 — Bruno Silva (id 2)</Label>
        <Panel x={26} y={158} w={280} h={64} cls="fill-zinc-900 stroke-rose-400/60" />
        <Label x={42} y={180} cls="fill-zinc-300" size={10}>scan his orders for status = &apos;shipped&apos;</Label>
        <Label x={42} y={204} cls="fill-rose-300" size={11}>ran out of orders → FALSE</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <XMark x={370} y={190} cls="stroke-rose-400" s={8} />
        <Label x={388} y={194} cls="fill-rose-300" size={10}>dropped</Label>
      </motion.g>
      {/* verdict tally */}
      <motion.g {...fade(1.05)}>
        <Panel x={480} y={148} w={214} h={74} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={496} y={170} cls="fill-zinc-400" size={10}>on this store</Label>
        <Label x={496} y={190} cls="fill-emerald-300" size={10}>EXISTS shipped → 10 customers</Label>
        <Label x={496} y={210} cls="fill-rose-300" size={10}>NOT EXISTS → 6 customers</Label>
      </motion.g>
      {/* footer */}
      <motion.g {...fade(1.2)}>
        <line x1={26} y1={236} x2={694} y2={236} className="stroke-zinc-800" />
        <Label x={26} y={258} cls="fill-zinc-400" size={10}>EXISTS never returns data — just a verdict per outer row, and it can stop at the first match.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 26 deep — the correlated loop: orders above their own customer's average ---------- */

function Q6Correlated() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="A correlated subquery re-runs the average for every outer row: order 74 compares against Farid's own 486.32 average, order 43 against Chloe's 533.59 — 45 of 103 orders survive">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>SELECT o.id, o.total FROM orders o WHERE o.total &gt; (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)</Label>
      </motion.g>
      {/* loop visualization */}
      <motion.g {...fade(0.2)}>
        <Label x={26} y={48} cls="fill-zinc-400" size={10}>outer row → recompute that customer&apos;s average → compare</Label>
        <Panel x={26} y={58} w={400} h={70} cls="fill-zinc-900 stroke-teal-400/60" />
        <Label x={42} y={80} cls="fill-zinc-200" size={10}>order #74 · Farid Nasser · 1088.44</Label>
        <Label x={42} y={102} cls="fill-teal-300" size={10}>inner: AVG of Farid&apos;s 3 orders → 486.32</Label>
        <Label x={300} y={102} cls="fill-emerald-300" size={11}>1088.44 &gt; 486.32 ✓</Label>
      </motion.g>
      <motion.g {...fade(0.45)}>
        <Panel x={26} y={138} w={400} h={70} cls="fill-zinc-900 stroke-teal-400/60" />
        <Label x={42} y={160} cls="fill-zinc-200" size={10}>order #43 · Chloe Dubois · 945.21</Label>
        <Label x={42} y={182} cls="fill-teal-300" size={10}>inner: AVG of Chloe&apos;s 5 orders → 533.59</Label>
        <Label x={300} y={182} cls="fill-emerald-300" size={11}>945.21 &gt; 533.59 ✓</Label>
      </motion.g>
      <motion.g {...fade(0.6)}>
        <Panel x={26} y={218} w={400} h={52} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={240} cls="fill-zinc-300" size={10}>order #57 · Emma Wilson · 785.79</Label>
        <Label x={42} y={258} cls="fill-zinc-500" size={9}>inner: AVG of Emma&apos;s 17 orders → 390.62 → 785.79 &gt; 390.62 ✓</Label>
      </motion.g>
      {/* loop arrow */}
      <motion.g {...fade(1.1)}>
        <line x1={480} y1={48} x2={480} y2={210} className="stroke-zinc-800" />
        <Label x={496} y={58} cls="fill-amber-300" size={9}>the loop: inner re-runs</Label>
        <Label x={496} y={74} cls="fill-amber-300" size={9}>for EVERY row</Label>
        <Label x={496} y={98} cls="fill-zinc-500" size={9}>not one average — 16 personal ones:</Label>
        <Label x={496} y={118} cls="fill-zinc-300" size={9}>Alice 302.60</Label>
        <Label x={496} y={134} cls="fill-zinc-300" size={9}>Emma 390.62</Label>
        <Label x={496} y={150} cls="fill-zinc-300" size={9}>Chloe 533.59</Label>
        <Label x={496} y={166} cls="fill-zinc-300" size={9}>Pedro 421.54</Label>
        <Label x={496} y={182} cls="fill-zinc-500" size={9}>… 12 more</Label>
      </motion.g>
      {/* loop arrow */}
      <motion.g {...fade(0.8)}>
        <Pipe pts={[[440, 93], [466, 93], [466, 173], [440, 173]]} cls="stroke-amber-400" dash="4 3" arrowAng={Math.PI} arrowCls="stroke-amber-400" />
      </motion.g>
      {/* tally */}
      <motion.g {...fade(1)}>
        <Panel x={480} y={218} w={214} h={52} cls="fill-zinc-900 stroke-emerald-400/50" />
        <Label x={496} y={238} cls="fill-zinc-400" size={9}>103 outer rows probed</Label>
        <Label x={496} y={258} cls="fill-emerald-300" size={11}>45 beat their own average</Label>
      </motion.g>
      {/* footer */}
      <motion.g {...fade(1.2)}>
        <line x1={26} y1={282} x2={694} y2={282} className="stroke-zinc-800" />
        <Label x={26} y={296} cls="fill-zinc-400" size={9}>Correlation = the inner query reads a column of the outer row. That is the whole trick — and the whole cost.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 27 intro — the two-stage plan: group first, join second ---------- */

function Q3TwoStage() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Stage one aggregates 103 orders into 16 per-customer spend rows; stage two joins that 1:1 to customers and filters spend above 1000, keeping 8">
      <motion.g {...fade(0)}>
        <Label x={26} y={18} cls="fill-zinc-500" size={9}>SELECT c.name, d.spend FROM customers c JOIN (SELECT customer_id, SUM(total) AS spend</Label>
        <Label x={26} y={32} cls="fill-zinc-500" size={9}>FROM orders GROUP BY customer_id) d ON d.customer_id = c.id WHERE d.spend &gt; 1000</Label>
      </motion.g>
      {/* stage 1 */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={48} w={280} h={150} cls="fill-zinc-900 stroke-teal-400/60" />
        <Label x={42} y={68} cls="fill-teal-300" size={10}>stage 1 — the derived table</Label>
        <Label x={42} y={86} cls="fill-zinc-400" size={9}>GROUP BY customer_id · 103 → 16 rows</Label>
        {[
          ["1", "7262.35"],
          ["5", "6640.56"],
          ["7", "4574.23"],
          ["13", "3644.56"],
        ].map(([id, spend], i) => (
          <g key={id}>
            <Label x={58} y={110 + i * 20} cls="fill-zinc-500" size={9}>customer {id}</Label>
            <Label x={168} y={110 + i * 20} cls="fill-zinc-200" size={9}>{spend}</Label>
          </g>
        ))}
        <Label x={58} y={190} cls="fill-zinc-600" size={9}>… 12 more one-row-per-customer</Label>
      </motion.g>
      <motion.g {...fade(0.5)}>
        <Pipe pts={[[306, 123], [356, 123]]} cls="stroke-teal-400" arrowAng={0} arrowCls="stroke-teal-400" />
        <Label x={300} y={112} cls="fill-teal-300" size={9}>16 → 16</Label>
        <Label x={296} y={140} cls="fill-zinc-500" size={8}>1:1, no fanout</Label>
      </motion.g>
      {/* stage 2 */}
      <motion.g {...fade(0.65)}>
        <Panel x={360} y={48} w={334} h={150} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={376} y={68} cls="fill-zinc-300" size={10}>stage 2 — join + filter</Label>
        <Label x={376} y={86} cls="fill-zinc-500" size={9}>JOIN customers · WHERE d.spend &gt; 1000</Label>
        {[
          ["Alice Chen", "7262.35"],
          ["Emma Wilson", "6640.56"],
          ["Grace Kim", "4574.23"],
          ["Maya Patel", "3644.56"],
        ].map(([name, spend], i) => (
          <g key={name}>
            <Label x={392} y={110 + i * 20} cls="fill-zinc-200" size={9}>{name}</Label>
            <Label x={600} y={110 + i * 20} cls="fill-emerald-300" size={9}>{spend}</Label>
          </g>
        ))}
        <Label x={392} y={190} cls="fill-zinc-600" size={9}>… 4 more — 8 customers clear the bar</Label>
      </motion.g>
      {/* footer */}
      <motion.g {...fade(0.9)}>
        <line x1={26} y1={252} x2={694} y2={252} className="stroke-zinc-800" />
        <Label x={26} y={274} cls="fill-zinc-400" size={10}>Aggregate first, join second: the derived table shrinks the fanout before it can happen.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 27 deep — why not just GROUP BY on the joined rows? fanout safety ---------- */

function Q7FanoutSafe() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Grouping after a join is safe here because every customer has orders, but the derived table groups before joining, so the aggregate never sees duplicated rows">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-400" size={10}>route A — join, then group</Label>
        <Panel x={26} y={34} w={300} h={100} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={56} cls="fill-zinc-300" size={9}>customers 16 → join orders 103 rows</Label>
        <Label x={42} y={76} cls="fill-zinc-300" size={9}>GROUP BY c.id → still 16 groups</Label>
        <Label x={42} y={100} cls="fill-amber-300" size={9}>works here — every customer ordered</Label>
        <Label x={42} y={118} cls="fill-zinc-500" size={8}>join rows carry duplicated columns into the mix</Label>
      </motion.g>
      <motion.g {...fade(0.3)}>
        <Label x={394} y={22} cls="fill-zinc-400" size={10}>route B — group, then join (derived)</Label>
        <Panel x={394} y={34} w={300} h={100} cls="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={410} y={56} cls="fill-zinc-300" size={9}>orders → GROUP BY customer_id → 16 rows</Label>
        <Label x={410} y={76} cls="fill-zinc-300" size={9}>JOIN customers ON id = customer_id</Label>
        <Label x={410} y={100} cls="fill-emerald-300" size={9}>16 in, 16 out — aggregate saw clean rows</Label>
        <Label x={410} y={118} cls="fill-zinc-500" size={8}>safe even when outer columns multiply</Label>
      </motion.g>
      {/* the danger case */}
      <motion.g {...fade(0.55)}>
        <Label x={26} y={170} cls="fill-rose-300" size={10}>where route A bites: join order_items too, and every SUM multiplies</Label>
        <Panel x={26} y={182} w={668} h={66} cls="fill-zinc-900 stroke-rose-400/50" />
        <Label x={42} y={204} cls="fill-zinc-300" size={9}>SUM(o.total) over orders joined to order_items = 103,244.55 — the 3× ghost (true revenue 34,833.28)</Label>
        <Label x={42} y={228} cls="fill-zinc-400" size={9}>route B pre-aggregates per order or per customer first — the duplicates never reach the SUM</Label>
      </motion.g>
      {/* footer */}
      <motion.g {...fade(0.85)}>
        <line x1={26} y1={266} x2={694} y2={266} className="stroke-zinc-800" />
        <Label x={26} y={288} cls="fill-zinc-400" size={10}>Derived tables let you choose WHERE the aggregation happens — before the join, where fanout cannot reach it.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 28 intro — WITH: a named staging area ---------- */

function Q4Staging() {
  return (
    <svg viewBox="0 0 720 290" className="w-full" role="img" aria-label="WITH names the inner query region_spend, builds it top-down, and the main query reads it like a table">
      <motion.g {...fade(0)}>
        <Label x={26} y={18} cls="fill-zinc-500" size={9}>WITH region_spend AS (SELECT c.region, SUM(o.total) AS spend</Label>
        <Label x={26} y={32} cls="fill-zinc-500" size={9}>FROM … GROUP BY c.region) SELECT * FROM region_spend ORDER BY spend DESC</Label>
      </motion.g>
      {/* named box */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={46} w={380} h={120} cls="fill-zinc-900 stroke-teal-400/60" />
        <Label x={42} y={68} cls="fill-teal-300" size={11}>region_spend</Label>
        <Label x={42} y={88} cls="fill-zinc-400" size={9}>— a subquery with a name and a home</Label>
        <Label x={42} y={110} cls="fill-zinc-300" size={9}>SELECT c.region, SUM(o.total) AS spend</Label>
        <Label x={42} y={128} cls="fill-zinc-300" size={9}>FROM orders o JOIN customers c …</Label>
        <Label x={42} y={146} cls="fill-zinc-300" size={9}>GROUP BY c.region        → 4 rows</Label>
      </motion.g>
      {/* main query */}
      <motion.g {...fade(0.5)}>
        <Panel x={460} y={46} w={234} h={120} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={476} y={68} cls="fill-zinc-300" size={10}>main query</Label>
        <Label x={476} y={88} cls="fill-zinc-400" size={9}>reads the name</Label>
        <Label x={476} y={110} cls="fill-zinc-200" size={9}>SELECT * FROM region_spend</Label>
        <Label x={476} y={128} cls="fill-zinc-200" size={9}>ORDER BY spend DESC</Label>
        <Label x={476} y={146} cls="fill-zinc-500" size={9}>as if it were a table</Label>
      </motion.g>
      <motion.g {...fade(0.4)}>
        <Pipe pts={[[406, 106], [460, 106]]} cls="stroke-teal-400" arrowAng={0} arrowCls="stroke-teal-400" />
        <Label x={408} y={94} cls="fill-teal-300" size={9}>feeds</Label>
      </motion.g>
      {/* result rows */}
      <motion.g {...fade(0.7)}>
        <Panel x={26} y={186} w={668} h={62} cls="fill-zinc-900 stroke-zinc-700" />
        {[
          ["EU", "15089.23"],
          ["APAC", "11605.45"],
          ["US", "7286.16"],
          ["LATAM", "852.44"],
        ].map(([r, s], i) => (
          <g key={r}>
            <Label x={60 + i * 170} y={212} cls="fill-zinc-200" size={10}>{r}</Label>
            <Label x={60 + i * 170} y={232} cls="fill-emerald-300" size={10}>{s}</Label>
          </g>
        ))}
      </motion.g>
      {/* footer */}
      <motion.g {...fade(0.95)}>
        <line x1={26} y1={258} x2={694} y2={258} className="stroke-zinc-800" />
        <Label x={26} y={278} cls="fill-zinc-400" size={10}>WITH declares the inner query FIRST — the reader meets the data before the question, not halfway through it.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 28 deep — CTE chains: each stage filters the last ---------- */

function Q8CteChain() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="A chain of two CTEs: spend per customer 16 rows, big spenders above 2000 leaves 5, then join to names for the final answer">
      <motion.g {...fade(0)}>
        <Label x={26} y={16} cls="fill-zinc-500" size={8.5}>WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id), big AS (SELECT * FROM spend WHERE s &gt; 2000)</Label>
        <Label x={26} y={31} cls="fill-zinc-500" size={9}>SELECT c.name, b.s FROM big b JOIN customers c ON c.id = b.customer_id ORDER BY b.s DESC</Label>
      </motion.g>
      {/* stage boxes */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={44} w={200} h={140} cls="fill-zinc-900 stroke-teal-400/60" />
        <Label x={42} y={66} cls="fill-teal-300" size={10}>spend</Label>
        <Label x={42} y={86} cls="fill-zinc-400" size={9}>16 customers</Label>
        <Label x={42} y={106} cls="fill-zinc-300" size={9}>Alice 7262.35</Label>
        <Label x={42} y={122} cls="fill-zinc-300" size={9}>Emma 6640.56</Label>
        <Label x={42} y={138} cls="fill-zinc-300" size={9}>Grace 4574.23</Label>
        <Label x={42} y={154} cls="fill-zinc-300" size={9}>Maya 3644.56</Label>
        <Label x={42} y={170} cls="fill-zinc-600" size={8}>… 12 smaller</Label>
      </motion.g>
      <motion.g {...fade(0.4)}>
        <Arrow x1={226} y1={114} x2={252} y2={114} cls="stroke-teal-400" />
      </motion.g>
      <motion.g {...fade(0.55)}>
        <Panel x={256} y={44} w={200} h={140} cls="fill-zinc-900 stroke-amber-400/60" />
        <Label x={272} y={66} cls="fill-amber-300" size={10}>big</Label>
        <Label x={272} y={86} cls="fill-zinc-400" size={9}>5 customers · kept WHERE s &gt; 2000</Label>
        <Label x={272} y={106} cls="fill-zinc-300" size={9}>Alice 7262.35</Label>
        <Label x={272} y={122} cls="fill-zinc-300" size={9}>Emma 6640.56</Label>
        <Label x={272} y={138} cls="fill-zinc-300" size={9}>Grace 4574.23</Label>
        <Label x={272} y={154} cls="fill-zinc-300" size={9}>Maya 3644.56</Label>
        <Label x={272} y={170} cls="fill-zinc-300" size={9}>Chloe 2667.93</Label>
      </motion.g>
      <motion.g {...fade(0.7)}>
        <Arrow x1={456} y1={114} x2={482} y2={114} cls="stroke-teal-400" />
      </motion.g>
      <motion.g {...fade(0.85)}>
        <Panel x={486} y={44} w={208} h={140} cls="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={502} y={66} cls="fill-emerald-300" size={10}>final answer</Label>
        <Label x={502} y={86} cls="fill-zinc-400" size={9}>5 names, joined to customers</Label>
        <Label x={502} y={106} cls="fill-zinc-200" size={9}>Alice Chen</Label>
        <Label x={502} y={122} cls="fill-zinc-200" size={9}>Emma Wilson</Label>
        <Label x={502} y={138} cls="fill-zinc-200" size={9}>Grace Kim</Label>
        <Label x={502} y={154} cls="fill-zinc-200" size={9}>Maya Patel</Label>
        <Label x={502} y={170} cls="fill-zinc-200" size={9}>Chloe Dubois</Label>
      </motion.g>
      {/* footer */}
      <motion.g {...fade(1)}>
        <line x1={26} y1={244} x2={694} y2={244} className="stroke-zinc-800" />
        <Label x={26} y={266} cls="fill-zinc-400" size={10}>Each CTE narrows the world for the next one — 16 customers to 5 names, one readable step at a time.</Label>
        <Label x={26} y={284} cls="fill-zinc-500" size={9}>A later CTE may reference an earlier one — never the reverse. Chains flow downward.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- registry ---------------- */

export const FIGURES_M4: Partial<Record<FigureId, () => React.JSX.Element>> = {
  "q1-nested": Q1Nested,
  "q2-probe": Q2Probe,
  "q3-two-stage": Q3TwoStage,
  "q4-staging": Q4Staging,
  "q5-in-pipeline": Q5InPipeline,
  "q6-correlated": Q6Correlated,
  "q7-fanout-safe": Q7FanoutSafe,
  "q8-cte-chain": Q8CteChain,
};
