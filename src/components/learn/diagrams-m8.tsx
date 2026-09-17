"use client";

// Module 8 lesson figures (lessons 45–49) — schema & beyond:
// CREATE TABLE's constraint contract, ALTER/DROP paths, views as saved
// queries, index lookup vs scan, and the recursive CTE loop. Same drawing
// kit as every module; registry merged in diagrams.tsx. All numbers
// seed-verified (scripts/facts-m78.ts, facts-m78b.ts).

import { motion } from "framer-motion";
import type { FigureId } from "@/lib/curriculum/types";
import { Label, Pipe, Panel, fade } from "./diagrams-kit";

/* ---------- lesson 45 intro — CREATE TABLE: the constraint contract ---------- */

function D1TableAnatomy() {
  const lines = [
    { code: "id      INTEGER PRIMARY KEY", note: "rowid alias — assigns max(id)+1 on insert", cls: "fill-emerald-300" },
    { code: "body    TEXT NOT NULL", note: "every future INSERT must supply it", cls: "fill-teal-300" },
    { code: "done    INTEGER NOT NULL DEFAULT 0", note: "omitted columns get this value", cls: "fill-sky-300" },
    { code: "        CHECK (done IN (0, 1))", note: "the engine rejects anything else", cls: "fill-amber-300" },
    { code: "owner   INTEGER REFERENCES users(id)", note: "the lesson-43 fence, declared up front", cls: "fill-violet-300" },
  ];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="A CREATE TABLE statement is a stack of column lines, each carrying constraints the engine enforces on every future write: primary key, not null, default, check and references">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>CREATE TABLE tasks (   -- a contract signed before the first row exists</Label>
      </motion.g>
      {/* the column lines */}
      <motion.g {...fade(0.15)}>
        <Panel x={26} y={40} w={430} h={186} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={62} cls="fill-zinc-200" size={10}>column  type  constraints</Label>
        {lines.map((l, i) => (
          <g key={i}>
            <circle cx={46} cy={84 + i * 27} r={3} className={l.cls} />
            <Label x={58} y={88 + i * 27} cls="fill-zinc-100" size={9} >{l.code}</Label>
          </g>
        ))}
        <Label x={42} y={226} cls="fill-zinc-500" size={9}>);</Label>
      </motion.g>
      {/* what each promise buys */}
      <motion.g {...fade(0.4)}>
        <Panel x={486} y={40} w={208} h={186} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={502} y={62} cls="fill-zinc-400" size={9}>what each line promises</Label>
        <Label x={502} y={86} cls="fill-emerald-300" size={8}>PK: unique + fast lookups</Label>
        <Label x={502} y={108} cls="fill-teal-300" size={8}>NOT NULL: no holes</Label>
        <Label x={502} y={130} cls="fill-sky-300" size={8}>DEFAULT: safe omissions</Label>
        <Label x={502} y={152} cls="fill-amber-300" size={8}>CHECK: valid values only</Label>
        <Label x={502} y={174} cls="fill-violet-300" size={8}>REFERENCES: no orphans</Label>
        <Label x={502} y={200} cls="fill-zinc-500" size={8}>violations fail LOUDLY —</Label>
        <Label x={502} y={214} cls="fill-zinc-500" size={8}>that is the point</Label>
      </motion.g>
      {/* introspection */}
      <motion.g {...fade(0.7)}>
        <Panel x={26} y={238} w={668} h={44} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={256} cls="fill-zinc-300" size={8}>verify what you built:  pragma_table_info(&apos;tasks&apos;) → name, type, &quot;notnull&quot;, dflt_value  ·  sqlite_master lists every object your schema owns</Label>
        <Label x={42} y={272} cls="fill-zinc-400" size={8}>UNIQUE(email) makes duplicate sign-ups impossible — all 16 store emails are already distinct, exactly what UNIQUE guarantees.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 46 intro — ALTER & DROP: editing the contract ---------- */

function D2AlterPaths() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="ALTER TABLE branches into four operations on the suppliers table: add a phone column, rename it to contact_phone, rename the table itself, or drop a column; DROP TABLE removes the whole object and the sandbox brings it back">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>ALTER TABLE suppliers …   -- one operation per statement, instant (catalog edit, not row rewrite)</Label>
      </motion.g>
      {/* the table card */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={46} w={190} h={150} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={68} cls="fill-zinc-400" size={9}>suppliers</Label>
        {["id", "name", "region", "rating"].map((c, i) => (
          <Label key={c} x={58} y={90 + i * 22} cls="fill-zinc-200" size={9}>{c}</Label>
        ))}
        <Label x={42} y={184} cls="fill-zinc-500" size={8}>4 columns today</Label>
      </motion.g>
      {/* four operation paths */}
      {[
        { y: 52, cls: "stroke-emerald-400", t1: "ADD COLUMN phone TEXT", t2: "existing 6 rows backfill NULL (or the DEFAULT)" },
        { y: 112, cls: "stroke-sky-400", t1: "RENAME COLUMN phone TO contact_phone", t2: "names are metadata — instant, nothing rewrites" },
        { y: 172, cls: "stroke-violet-400", t1: "RENAME TABLE suppliers TO vendors", t2: "every view/index referencing it follows the rename" },
        { y: 232, cls: "stroke-rose-400", t1: "DROP COLUMN phone  ·  DROP TABLE vendors", t2: "gone is gone — the sandbox rolls it back; production needs a backup" },
      ].map((op, i) => (
        <motion.g key={i} {...fade(0.35 + i * 0.12)}>
          <Pipe pts={[[216, 110], [268, op.y + 14]]} cls={op.cls} arrowAng={0} arrowCls={op.cls} />
          <Panel x={272} y={op.y} w={422} h={44} cls="fill-zinc-900 stroke-zinc-700" />
          <Label x={288} y={op.y + 18} cls="fill-zinc-100" size={9}>{op.t1}</Label>
          <Label x={288} y={op.y + 34} cls="fill-zinc-500" size={8}>{op.t2}</Label>
        </motion.g>
      ))}
      <motion.g {...fade(0.85)}>
        <line x1={26} y1={280} x2={694} y2={280} className="stroke-zinc-800" />
        <Label x={26} y={296} cls="fill-zinc-400" size={9}>Schema evolves in place — each ALTER is one atomic catalog edit, which is why this lesson is short and the sandbox makes it fun.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 47 intro — VIEW: a saved query you can query ---------- */

function D3ViewLens() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="CREATE VIEW eu_customers stores a SELECT under a name: the base table holds 16 customers, the view lens passes the 8 EU rows, and a WHERE on the view pushes through to the base tables at query time">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>CREATE VIEW eu_customers AS SELECT id, name, city FROM customers WHERE region = &apos;EU&apos;;</Label>
      </motion.g>
      {/* base table */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={52} w={180} h={150} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={74} cls="fill-zinc-400" size={9}>customers — 16 rows</Label>
        {Array.from({ length: 16 }).map((_, i) => (
          <circle key={i} cx={54 + (i % 4) * 36} cy={98 + Math.floor(i / 4) * 24} r={6}
            className={i < 8 ? "fill-sky-400" : "fill-zinc-700"} />
        ))}
        <Label x={42} y={192} cls="fill-zinc-500" size={8}>every region mixed in</Label>
      </motion.g>
      {/* the lens */}
      <motion.g {...fade(0.4)}>
        <Pipe pts={[[206, 126], [252, 126]]} cls="stroke-zinc-500" arrowAng={0} />
        <Panel x={256} y={84} w={190} h={84} cls="fill-zinc-900 stroke-sky-400/60" />
        <Label x={272} y={108} cls="fill-sky-300" size={9}>the view = a lens</Label>
        <Label x={272} y={126} cls="fill-zinc-300" size={8}>stored in sqlite_master</Label>
        <Label x={272} y={142} cls="fill-zinc-300" size={8}>as type=&apos;view&apos;</Label>
        <Label x={272} y={158} cls="fill-zinc-500" size={8}>no rows of its own</Label>
      </motion.g>
      {/* the result */}
      <motion.g {...fade(0.55)}>
        <Pipe pts={[[446, 126], [492, 126]]} cls="stroke-zinc-500" arrowAng={0} />
        <Panel x={496} y={52} w={198} h={150} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={512} y={74} cls="fill-zinc-400" size={9}>eu_customers — 8 rows</Label>
        {Array.from({ length: 8 }).map((_, i) => (
          <circle key={i} cx={524 + (i % 4) * 44} cy={98 + Math.floor(i / 4) * 24} r={6} className="fill-sky-400" />
        ))}
        <Label x={512} y={192} cls="fill-zinc-300" size={8}>SELECT * FROM eu_customers</Label>
      </motion.g>
      {/* pushdown + stacking */}
      <motion.g {...fade(0.75)}>
        <Panel x={26} y={218} w={320} h={64} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={238} cls="fill-zinc-300" size={8}>WHERE pushes through the lens:</Label>
        <Label x={42} y={254} cls="fill-zinc-300" size={8}>SELECT * FROM eu_customers WHERE city = &apos;Berlin&apos;</Label>
        <Label x={42} y={270} cls="fill-zinc-500" size={8}>re-runs the definition with your filter folded in</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <Panel x={376} y={218} w={318} h={64} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={392} y={238} cls="fill-zinc-300" size={8}>views stack on views — layers of convenience.</Label>
        <Label x={392} y={254} cls="fill-zinc-300" size={8}>The join lives in exactly one place; analysts never</Label>
        <Label x={392} y={270} cls="fill-zinc-500" size={8}>retype it. Engines recompute per query (no storage).</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 48 intro — SCAN vs SEARCH: why indexes exist ---------- */

function D4IndexLookup() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Without an index SQLite scans all one hundred three orders row by row; after CREATE INDEX the plan reads SEARCH orders USING INDEX and descends straight to the matching rows, at the price of a small write charge on every insert">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>SELECT * FROM orders WHERE customer_id = 1;   -- before and after CREATE INDEX idx_orders_customer ON orders(customer_id)</Label>
      </motion.g>
      {/* SCAN side */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={44} w={320} h={140} cls="fill-zinc-900 stroke-rose-400/40" />
        <Label x={42} y={66} cls="fill-rose-300" size={9}>EXPLAIN QUERY PLAN → SCAN orders</Label>
        {Array.from({ length: 30 }).map((_, i) => (
          <circle key={i} cx={52 + (i % 10) * 29} cy={86 + Math.floor(i / 10) * 22} r={5.5}
            className={i === 3 ? "fill-emerald-400" : "fill-zinc-700"} />
        ))}
        <Label x={42} y={164} cls="fill-zinc-300" size={8}>every row read, one matches — 103 reads to serve 1 row</Label>
        <Label x={42} y={178} cls="fill-zinc-500" size={8}>fine at 103 rows; a career problem at 103 million</Label>
      </motion.g>
      {/* SEARCH side */}
      <motion.g {...fade(0.4)}>
        <Panel x={374} y={44} w={320} h={140} cls="fill-zinc-900 stroke-emerald-400/50" />
        <Label x={390} y={66} cls="fill-emerald-300" size={9}>→ SEARCH orders USING INDEX idx_orders_customer</Label>
        <Label x={390} y={82} cls="fill-zinc-500" size={8}>(customer_id=?)</Label>
        {/* index tree */}
        <Panel x={420} y={94} w={60} h={20} cls="fill-zinc-900 stroke-zinc-600" />
        <Label x={432} y={108} cls="fill-zinc-300" size={7}>[root]</Label>
        <Pipe pts={[[450, 114], [436, 128]]} cls="stroke-emerald-400/70" arrowAng={Math.PI / 2.4} arrowCls="stroke-emerald-400/70" />
        <Pipe pts={[[450, 114], [478, 128]]} cls="stroke-emerald-400/70" arrowAng={Math.PI / 1.7} arrowCls="stroke-emerald-400/70" />
        <Panel x={410} y={130} w={52} h={20} cls="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={418} y={144} cls="fill-zinc-200" size={7}>cust 1</Label>
        <Panel x={462} y={130} w={52} h={20} cls="fill-zinc-900 stroke-zinc-600" />
        <Label x={474} y={144} cls="fill-zinc-400" size={7}>cust 2</Label>
        <Label x={540} y={122} cls="fill-zinc-300" size={8}>sorted keys →</Label>
        <Label x={540} y={138} cls="fill-zinc-300" size={8}>descend, don&apos;t sweep</Label>
        <Label x={390} y={168} cls="fill-zinc-300" size={8}>a handful of page reads, straight to the match</Label>
      </motion.g>
      {/* composite + write cost */}
      <motion.g {...fade(0.65)}>
        <Panel x={26} y={200} w={320} h={64} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={220} cls="fill-zinc-300" size={8}>Composite: ON orders(customer_id, status) serves</Label>
        <Label x={42} y={236} cls="fill-zinc-300" size={8}>filters on customer_id AND customer_id+status;</Label>
        <Label x={42} y={252} cls="fill-zinc-500" size={8}>column order is the phone-book rule — leftmost first</Label>
      </motion.g>
      <motion.g {...fade(0.8)}>
        <Panel x={374} y={200} w={320} h={64} cls="fill-zinc-900 stroke-amber-400/40" />
        <Label x={390} y={220} cls="fill-amber-300" size={8}>the quiet bill: every INSERT/UPDATE on orders</Label>
        <Label x={390} y={236} cls="fill-zinc-300" size={8}>also updates each index. Index the columns you</Label>
        <Label x={390} y={252} cls="fill-zinc-500" size={8}>filter by constantly — not every column you have.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 49 intro — WITH RECURSIVE: the self-feeding query ---------- */

function D5RecursiveUnfold() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="A recursive CTE has two parts: an anchor that seeds one row, and a step that feeds the output back as input until the WHERE guard says stop — producing 1 through 5, or a zero-gap month spine from 2024-01 to 2025-02">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n &lt; 5) SELECT n FROM seq</Label>
      </motion.g>
      {/* anchor */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={48} w={200} h={78} cls="fill-zinc-900 stroke-emerald-400/50" />
        <Label x={42} y={70} cls="fill-emerald-300" size={9}>anchor — seeds row 1</Label>
        <Label x={42} y={90} cls="fill-zinc-200" size={9}>SELECT 1</Label>
        <Label x={42} y={110} cls="fill-zinc-500" size={8}>runs exactly once</Label>
      </motion.g>
      {/* the loop */}
      <motion.g {...fade(0.4)}>
        <Panel x={300} y={48} w={230} h={108} cls="fill-zinc-900 stroke-teal-400/60" />
        <Label x={316} y={70} cls="fill-teal-300" size={9}>step — feeds itself</Label>
        <Label x={316} y={90} cls="fill-zinc-200" size={9}>SELECT n + 1 FROM seq</Label>
        <Label x={316} y={110} cls="fill-zinc-300" size={8}>reads the PREVIOUS step&apos;s</Label>
        <Label x={316} y={126} cls="fill-zinc-300" size={8}>output as its input…</Label>
        <Label x={316} y={146} cls="fill-zinc-500" size={8}>…and queues its own output</Label>
        <Pipe pts={[[300, 102], [226, 102]]} cls="stroke-teal-400" arrowAng={Math.PI} arrowCls="stroke-teal-400" />
        <Label x={228} y={94} cls="fill-teal-300" size={8}>loop</Label>
      </motion.g>
      {/* the guard */}
      <motion.g {...fade(0.55)}>
        <Panel x={560} y={48} w={134} h={108} cls="fill-zinc-900 stroke-amber-400/50" />
        <Label x={576} y={70} cls="fill-amber-300" size={9}>the guard</Label>
        <Label x={576} y={90} cls="fill-zinc-200" size={9}>WHERE n &lt; 5</Label>
        <Label x={576} y={110} cls="fill-zinc-300" size={8}>no new rows →</Label>
        <Label x={576} y={126} cls="fill-zinc-300" size={8}>the loop stops.</Label>
        <Label x={576} y={146} cls="fill-zinc-500" size={8}>forget it → infinite</Label>
      </motion.g>
      {/* output strip */}
      <motion.g {...fade(0.7)}>
        <Label x={26} y={186} cls="fill-zinc-400" size={9}>the fold, step by step:</Label>
        {["1", "2", "3", "4", "5"].map((n, i) => (
          <g key={n}>
            <Panel x={150 + i * 46} y={170} w={38} h={26} cls="fill-zinc-900 stroke-zinc-700" />
            <Label x={162 + i * 46} y={187} cls="fill-zinc-100" size={10}>{n}</Label>
          </g>
        ))}
        <Label x={392} y={187} cls="fill-zinc-500" size={8}>— one row per turn of the loop</Label>
      </motion.g>
      {/* month spine use-case */}
      <motion.g {...fade(0.85)}>
        <Panel x={26} y={214} w={668} h={56} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={234} cls="fill-zinc-300" size={8}>the grown-up use — a zero-gap month spine for reports: seed 2024-01, step the month counter, guard at 14 buckets</Label>
        <Label x={42} y={252} cls="fill-zinc-200" size={9}>2024-01 · 2024-02 · 2024-03 · … · 2025-01 · 2025-02</Label>
        <Label x={420} y={252} cls="fill-zinc-500" size={8}>LEFT JOIN revenue on — quiet months still show a 0</Label>
      </motion.g>
      <motion.g {...fade(1)}>
        <Label x={26} y={290} cls="fill-zinc-400" size={9}>Same shape as lesson 28&apos;s CTEs — plus permission to call itself.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- registry ---------------- */

export const FIGURES_M8: Partial<Record<FigureId, () => React.JSX.Element>> = {
  "d1-table-anatomy": D1TableAnatomy,
  "d2-alter-paths": D2AlterPaths,
  "d3-view-lens": D3ViewLens,
  "d4-index-lookup": D4IndexLookup,
  "d5-recursive-unfold": D5RecursiveUnfold,
};
