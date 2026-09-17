"use client";

// Module 1 theory-expansion figures (wave 2, lessons 1–4).
// Same visual language as diagrams-kit: 720-wide viewBox, Tailwind palette
// classes, framer-motion reveals. Every number shown is real, verified
// against the seeded storefront db (scripts/facts-m1-500.ts).

import { motion } from "framer-motion";
import type { FigureId } from "@/lib/curriculum/types";
import { Arrow, Label, Link, Panel, Pipe, XMark, fade } from "./diagrams-kit";

/* ---------------- lesson 1 ---------------- */

function L1WhyDb() {
  const files = ["orders_final_v2.xlsx", "customers_COPY (3).csv", "summary_LAST_final.csv"];
  const guarantees = [
    "typed columns — 89.99 is a number",
    "constraints — ids unique, refs valid",
    "one copy — every tool asks it",
    "SQL — ask, and get a table back",
  ];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="A folder of spreadsheets versus one database">
      <motion.g {...fade(0)}>
        <Label x={30} y={30} cls="fill-zinc-500">a folder of files</Label>
        {files.map((f, i) => (
          <g key={f}>
            <rect x={30} y={44 + i * 34} width={196} height={26} rx={5} className="fill-zinc-900 stroke-zinc-800" />
            <Label x={42} y={61 + i * 34} cls="fill-zinc-400" size={10}>{f}</Label>
          </g>
        ))}
        {["no types — '89.99' can be text", "no rules — typos ship silently", "N copies — which one is true?"].map((w, i) => (
          <g key={w}>
            <XMark x={40} y={178 + i * 24} cls="stroke-amber-400/80" />
            <Label x={54} y={182 + i * 24} cls="fill-zinc-500" size={10}>{w}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.3)}>
        <Arrow x1={248} y1={150} x2={296} y2={150} cls="stroke-emerald-400" />
      </motion.g>
      <motion.g {...fade(0.5)}>
        <Panel x={308} y={40} w={380} h={200} />
        <Label x={322} y={62} cls="fill-zinc-300" size={12}>storefront.db — one source of truth</Label>
        {/* mini table */}
        <rect x={324} y={76} width={150} height={148} rx={6} className="fill-zinc-950 stroke-zinc-800" />
        {["id", "name", "city"].map((h, i) => (
          <Label key={h} x={340 + i * 48} y={94} cls="fill-zinc-300" size={10}>{h}</Label>
        ))}
        <line x1={324} y1={102} x2={474} y2={102} className="stroke-zinc-800" />
        {[["1", "Alice", "Berlin"], ["2", "Bruno", "São Paulo"], ["3", "Chloe", "Lyon"]].map((r, ri) =>
          r.map((c, ci) => (
            <Label key={`${ri}-${ci}`} x={340 + ci * 48} y={122 + ri * 22} cls={ci === 0 ? "fill-emerald-300" : "fill-zinc-500"} size={9.5}>{c}</Label>
          )),
        )}
        {guarantees.map((g, i) => (
          <g key={g}>
            <rect x={488} y={80 + i * 38} width={8} height={8} rx={2} className="fill-emerald-400" />
            <Label x={504} y={88 + i * 38} cls="fill-zinc-400" size={9.5}>{g}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.8)}>
        <Label x={360} y={272} anchor="middle" cls="fill-zinc-500" size={10.5}>
          a database is a promise: the data is in one place, shaped the same way, every time
        </Label>
      </motion.g>
    </svg>
  );
}

function L1CrudDoors() {
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="The four SQL verbs acting on a table">
      <motion.g {...fade(0)}>
        <Label x={360} y={30} anchor="middle" cls="fill-zinc-300" size={12}>customers</Label>
        <Panel x={272} y={88} w={176} h={122} />
        {["id", "name", "city"].map((h, i) => (
          <Label key={h} x={292 + i * 56} y={108} cls="fill-zinc-300" size={10}>{h}</Label>
        ))}
        <line x1={272} y1={116} x2={448} y2={116} className="stroke-zinc-800" />
        {[["1", "Alice", "Berlin"], ["2", "Bruno", "São Paulo"], ["3", "Chloe", "Lyon"]].map((r, ri) =>
          r.map((c, ci) => (
            <Label key={`${ri}-${ci}`} x={292 + ci * 56} y={136 + ri * 24} cls={ci === 0 ? "fill-emerald-300" : "fill-zinc-500"} size={9.5}>{c}</Label>
          )),
        )}
      </motion.g>
      {/* INSERT — in */}
      <motion.g {...fade(0.25)}>
        <Arrow x1={96} y1={149} x2={262} y2={149} cls="stroke-emerald-400" />
        <rect x={96} y={104} width={78} height={20} rx={4} className="fill-emerald-400/15 stroke-emerald-400/70" />
        <Label x={135} y={118} anchor="middle" cls="fill-emerald-300" size={10.5}>INSERT</Label>
        <Label x={96} y={172} cls="fill-zinc-500" size={9.5}>adds a new row</Label>
      </motion.g>
      {/* SELECT — out */}
      <motion.g {...fade(0.4)}>
        <Arrow x1={458} y1={149} x2={624} y2={149} cls="stroke-teal-300" />
        <rect x={546} y={104} width={78} height={20} rx={4} className="fill-teal-400/15 stroke-teal-400/70" />
        <Label x={585} y={118} anchor="middle" cls="fill-teal-300" size={10.5}>SELECT</Label>
        <Label x={624} y={172} anchor="end" cls="fill-zinc-500" size={9.5}>reads rows out</Label>
      </motion.g>
      {/* UPDATE — in place */}
      <motion.g {...fade(0.55)}>
        <Pipe pts={[[424, 84], [424, 52], [496, 52], [496, 84]]} cls="stroke-amber-400" arrowAng={Math.PI / 2} arrowCls="stroke-amber-400" />
        <rect x={478} y={22} width={78} height={20} rx={4} className="fill-amber-400/15 stroke-amber-400/70" />
        <Label x={517} y={36} anchor="middle" cls="fill-amber-300" size={10.5}>UPDATE</Label>
        <Label x={564} y={36} cls="fill-zinc-500" size={9.5}>changes values in place</Label>
      </motion.g>
      {/* DELETE — gone */}
      <motion.g {...fade(0.7)}>
        <Arrow x1={360} y1={214} x2={360} y2={252} cls="stroke-rose-400" />
        <XMark x={382} y={236} cls="stroke-rose-400" />
        <rect x={390} y={222} width={70} height={20} rx={4} className="fill-rose-400/15 stroke-rose-400/70" />
        <Label x={425} y={236} anchor="middle" cls="fill-rose-300" size={10.5}>DELETE</Label>
      </motion.g>
      <motion.g {...fade(0.85)}>
        <Label x={360} y={272} anchor="middle" cls="fill-zinc-500" size={10}>
          everything you will ever do to a table is one of these four verbs — this module is all SELECT
        </Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- lesson 2 ---------------- */

function L2ClausePipeline() {
  const bars = (x0: number, active: number[] | "all" | "none") =>
    [0, 1, 2, 3, 4].map((i) => {
      const cls =
        active === "all" ? "fill-zinc-800 stroke-zinc-700"
        : active === "none" ? "fill-zinc-900 stroke-zinc-800"
        : active.includes(i) ? "fill-emerald-400/25 stroke-emerald-400/70"
        : "fill-zinc-900 stroke-zinc-800";
      return <rect key={i} x={x0 + i * 32} y={96} width={22} height={64} rx={4} className={cls} />;
    });
  return (
    <svg viewBox="0 0 720 240" className="w-full" role="img" aria-label="FROM picks the source, SELECT picks the columns">
      <motion.g {...fade(0)}>
        {bars(34, "all")}
        <Label x={34} y={186} cls="fill-zinc-500" size={10}>orders · 103 rows × 5 columns</Label>
        <rect x={16} y={44} width={140} height={22} rx={4} className="fill-zinc-900 stroke-zinc-700" />
        <Label x={86} y={59} anchor="middle" cls="fill-zinc-300" size={10.5}>FROM orders</Label>
      </motion.g>
      <motion.g {...fade(0.3)}>
        <Arrow x1={196} y1={128} x2={240} y2={128} />
      </motion.g>
      <motion.g {...fade(0.45)}>
        {bars(254, [1, 3])}
        <Label x={254} y={186} cls="fill-zinc-500" size={10}>SELECT customer_id, total</Label>
        <Label x={254} y={202} cls="fill-emerald-300/80" size={9.5}>keeps 2 of the 5 columns</Label>
      </motion.g>
      <motion.g {...fade(0.6)}>
        <Arrow x1={416} y1={128} x2={460} y2={128} />
      </motion.g>
      <motion.g {...fade(0.75)}>
        {bars(474, [0, 1])}
        <Label x={474} y={186} cls="fill-emerald-300" size={10}>result · 103 rows × 2 columns</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <Label x={360} y={224} anchor="middle" cls="fill-zinc-500" size={10}>
          FROM chooses the source table; SELECT keeps only the named columns — the row count never changed
        </Label>
      </motion.g>
    </svg>
  );
}

function L2EverythingTable() {
  return (
    <svg viewBox="0 0 720 230" className="w-full" role="img" aria-label="A query result is itself a table">
      <motion.g {...fade(0)}>
        <rect x={24} y={34} width={228} height={44} rx={6} className="fill-zinc-900 stroke-zinc-700" />
        <Label x={38} y={52} cls="fill-teal-300" size={10}>SELECT customer_id, total</Label>
        <Label x={38} y={68} cls="fill-teal-300" size={10}>FROM orders;</Label>
        <Arrow x1={138} y1={82} x2={138} y2={104} />
      </motion.g>
      <motion.g {...fade(0.35)}>
        <Panel x={48} y={110} w={180} h={84} />
        {[0, 1].map((i) => (
          <rect key={i} x={78 + i * 60} y={126} width={26} height={52} rx={4} className="fill-emerald-400/25 stroke-emerald-400/70" />
        ))}
        <Label x={138} y={212} anchor="middle" cls="fill-zinc-500" size={10}>result · 103 × 2</Label>
      </motion.g>
      <motion.g {...fade(0.6)}>
        <Arrow x1={238} y1={152} x2={286} y2={152} cls="stroke-emerald-400" />
        <rect x={296} y={116} width={150} height={72} rx={8} className="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={371} y={148} anchor="middle" cls="fill-emerald-300" size={11}>still a table!</Label>
        <Label x={371} y={168} anchor="middle" cls="fill-zinc-500" size={9.5}>rows + typed columns</Label>
      </motion.g>
      <motion.g {...fade(0.8)}>
        {["…filter it — WHERE", "…sort it — ORDER BY", "…aggregate it — COUNT"].map((t, i) => (
          <g key={t}>
            <rect x={486} y={112 + i * 28} width={196} height={22} rx={4} className="fill-zinc-900 stroke-zinc-800" />
            <Label x={500} y={127 + i * 28} cls="fill-zinc-400" size={10}>{t}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.95)}>
        <Label x={360} y={222} anchor="middle" cls="fill-zinc-500" size={10}>
          a result set is itself a table — which is why SQL can wrap queries inside queries (Module 4)
        </Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- lesson 3 ---------------- */

function L3PredicateToolbox() {
  const leaves: Array<[string, string, string]> = [
    ["COMPARE", "total > 200", "65 of 103 survive"],
    ["RANGE", "total BETWEEN 50", "AND 200 — 30 survive"],
    ["SET", "status IN ('shipped',", "'delivered') — 82 survive"],
    ["PATTERN", "created_at", "LIKE '2024%' — 90"],
    ["NULL TEST", "shipped_at IS NULL", "— 21 survive"],
  ];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="The five predicate families of WHERE">
      <motion.g {...fade(0)}>
        <rect x={262} y={22} width={196} height={30} rx={6} className="fill-zinc-900 stroke-zinc-600" />
        <Label x={360} y={42} anchor="middle" cls="fill-zinc-200" size={12}>WHERE …</Label>
      </motion.g>
      {leaves.map(([fam, l1, l2], i) => {
        const cx = 30 + i * 140 + 60;
        return (
          <g key={fam}>
            <motion.g {...fade(0.2 + i * 0.12)}>
              <Link x1={360} y1={52} x2={cx} y2={126} cls="stroke-zinc-700" arrow={false} dot="fill-zinc-600" />
              <rect x={30 + i * 140} y={126} width={124} height={78} rx={8} className="fill-zinc-900 stroke-zinc-800" />
              <Label x={92 + i * 140} y={146} anchor="middle" cls="fill-zinc-300" size={9.5}>{fam}</Label>
              <Label x={92 + i * 140} y={168} anchor="middle" cls="fill-teal-300" size={9}>{l1}</Label>
              <Label x={92 + i * 140} y={186} anchor="middle" cls="fill-teal-300" size={9}>{l2}</Label>
            </motion.g>
          </g>
        );
      })}
      <motion.g {...fade(0.95)}>
        <Label x={360} y={244} anchor="middle" cls="fill-zinc-500" size={10}>
          five predicate families cover almost every filter you will ever write
        </Label>
        <Label x={360} y={264} anchor="middle" cls="fill-zinc-600" size={9.5}>
          every count is real — verified against the storefront: 65 · 30 · 82 · 90 · 21
        </Label>
      </motion.g>
    </svg>
  );
}

function L3RowTriage() {
  const rows: Array<[string, string, "pass" | "fail"]> = [
    ["order #74", "total 1088.44", "pass"],
    ["the smallest order", "total 25.47", "fail"],
    ["smallest delivered", "total 30.24", "fail"],
  ];
  return (
    <svg viewBox="0 0 720 260" className="w-full" role="img" aria-label="WHERE gives every row a verdict">
      <motion.g {...fade(0)}>
        {rows.map(([t, v, verdict], i) => (
          <g key={t}>
            <rect x={26} y={40 + i * 52} width={190} height={40} rx={6} className="fill-zinc-900 stroke-zinc-800" />
            <Label x={40} y={57 + i * 52} cls="fill-zinc-400" size={10}>{t}</Label>
            <Label x={40} y={72 + i * 52} cls="fill-zinc-500" size={10}>{v}</Label>
            <Arrow
              x1={220} y1={60 + i * 52} x2={296} y2={verdict === "pass" ? 118 : 172}
              cls={verdict === "pass" ? "stroke-emerald-400" : "stroke-zinc-700"}
            />
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.4)}>
        <polygon points="300,110 420,110 400,180 320,180" className="fill-zinc-900 stroke-zinc-600" />
        <Label x={360} y={136} anchor="middle" cls="fill-zinc-200" size={11}>WHERE</Label>
        <Label x={360} y={154} anchor="middle" cls="fill-teal-300" size={10}>total &gt; 200</Label>
      </motion.g>
      <motion.g {...fade(0.6)}>
        <Arrow x1={404} y1={124} x2={486} y2={96} cls="stroke-emerald-400" />
        <rect x={494} y={72} width={200} height={44} rx={6} className="fill-emerald-400/10 stroke-emerald-400/60" />
        <Label x={594} y={90} anchor="middle" cls="fill-emerald-300" size={10.5}>TRUE → passes</Label>
        <Label x={594} y={106} anchor="middle" cls="fill-zinc-500" size={9.5}>65 of 103 orders</Label>
      </motion.g>
      <motion.g {...fade(0.75)}>
        <Arrow x1={404} y1={166} x2={486} y2={196} cls="stroke-zinc-700" />
        <rect x={494} y={176} width={200} height={44} rx={6} className="fill-zinc-900 stroke-zinc-800" />
        <Label x={594} y={194} anchor="middle" cls="fill-rose-300" size={10.5}>FALSE → bounced</Label>
        <Label x={594} y={210} anchor="middle" cls="fill-zinc-500" size={9.5}>38 of 103 orders</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <Label x={360} y={244} anchor="middle" cls="fill-zinc-500" size={10}>
          WHERE asks every row a yes/no question — only TRUE gets through. 65 + 38 = 103.
        </Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- lesson 4 ---------------- */

function L4ThreeCauses() {
  const cells = ["set", "NULL", "set", "NULL", "set", "NULL"];
  const causes: Array<[string, string, string, string]> = [
    ["Hasn't happened yet", "pending orders ship later", "14 rows", "stroke-amber-400/70 fill-amber-400/10 fill-amber-300"],
    ["Will never happen", "cancelled orders never ship", "7 rows", "stroke-rose-400/70 fill-rose-400/10 fill-rose-300"],
    ["Unknown / not recorded", "the value was lost upstream", "0 here — most common in real data", "stroke-zinc-700 fill-zinc-900 fill-zinc-400"],
  ];
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="Three reasons a value can be NULL">
      <motion.g {...fade(0)}>
        <Panel x={30} y={40} w={140} h={196} />
        <Label x={100} y={60} anchor="middle" cls="fill-zinc-300" size={10.5}>orders.shipped_at</Label>
        {cells.map((c, i) => (
          <g key={i}>
            <rect
              x={44} y={72 + i * 26} width={112} height={20} rx={4}
              className={c === "NULL" ? "fill-rose-400/10 stroke-rose-400/60" : "fill-zinc-950 stroke-zinc-800"}
            />
            <Label x={100} y={86 + i * 26} anchor="middle" cls={c === "NULL" ? "fill-rose-300" : "fill-zinc-500"} size={9.5}>
              {c === "NULL" ? "NULL" : "timestamp ✓"}
            </Label>
          </g>
        ))}
        <Label x={100} y={252} anchor="middle" cls="fill-zinc-500" size={9.5}>21 NULLs of 103</Label>
      </motion.g>
      {causes.map(([title, sub, count, chip], i) => (
        <motion.g key={title} {...fade(0.25 + i * 0.15)}>
          <rect x={240} y={40 + i * 72} width={250} height={60} rx={8} className={`fill-zinc-900 ${chip.split(" ")[0]}`} />
          <Label x={256} y={62 + i * 72} cls={chip.split(" ")[2]} size={11}>{title}</Label>
          <Label x={256} y={80 + i * 72} cls="fill-zinc-500" size={9.5}>{sub}</Label>
          <Label x={256} y={94 + i * 72} cls={chip.split(" ")[2]} size={9.5}>{count}</Label>
          <Link x1={172} y1={168} x2={236} y2={70 + i * 72} cls="stroke-zinc-700" arrow={false} dot={i < 2 ? "fill-rose-400/80" : undefined} dash="3 3" />
        </motion.g>
      ))}
      <motion.g {...fade(0.75)}>
        <rect x={516} y={76} width={178} height={128} rx={8} className="fill-emerald-400/10 stroke-emerald-400/60" />
        <Label x={605} y={102} anchor="middle" cls="fill-emerald-300" size={10.5}>the audit that adds up</Label>
        <Label x={530} y={126} cls="fill-zinc-400" size={10}>82 timestamps set</Label>
        <Label x={530} y={144} cls="fill-zinc-400" size={10}>= 52 delivered + 30 shipped</Label>
        <Label x={530} y={168} cls="fill-zinc-400" size={10}>21 NULLs</Label>
        <Label x={530} y={186} cls="fill-zinc-400" size={10}>= 14 pending + 7 cancelled</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <Label x={360} y={268} anchor="middle" cls="fill-zinc-500" size={10}>
          NULL is not zero and not an empty string — it is the absence of a value, and it always has a story
        </Label>
      </motion.g>
    </svg>
  );
}

function L4CountVerdict() {
  const scale = 1.2;
  const bars: Array<[string, number, number, string, string]> = [
    ["COUNT(*)", 103, 103 * scale, "fill-zinc-700", "fill-zinc-300"],
    ["COUNT(shipped_at)", 82, 82 * scale, "fill-emerald-400/60", "fill-emerald-300"],
    ["the gap", 21, 21 * scale, "fill-amber-400/60", "fill-amber-300"],
  ];
  return (
    <svg viewBox="0 0 720 250" className="w-full" role="img" aria-label="COUNT star versus COUNT column on orders">
      <motion.g {...fade(0)}>
        <line x1={80} y1={200} x2={640} y2={200} className="stroke-zinc-800" />
        {bars.map(([name, v, h, fill, txt], i) => (
          <g key={name}>
            <motion.rect
              {...fade(0.15 + i * 0.2)}
              x={140 + i * 190} y={200 - h} width={90} height={h} rx={6} className={fill}
            />
            <Label x={185 + i * 190} y={192 - h} anchor="middle" cls={txt} size={12}>{v}</Label>
            <Label x={185 + i * 190} y={222} anchor="middle" cls="fill-zinc-400" size={10}>{name}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.8)}>
        <Label x={360} y={186} anchor="middle" cls="fill-amber-300" size={10}>= the orders that never shipped</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <Label x={360} y={244} anchor="middle" cls="fill-zinc-500" size={10}>
          COUNT(*) counts rows; COUNT(column) counts values — the 21-row gap answers "which orders never shipped?"
        </Label>
      </motion.g>
    </svg>
  );
}

export const FIGURES_M1D: Partial<Record<FigureId, () => React.JSX.Element>> = {
  "l1-why-db": L1WhyDb,
  "l1-crud-doors": L1CrudDoors,
  "l2-clause-pipeline": L2ClausePipeline,
  "l2-everything-table": L2EverythingTable,
  "l3-predicate-toolbox": L3PredicateToolbox,
  "l3-row-triage": L3RowTriage,
  "l4-three-causes": L4ThreeCauses,
  "l4-count-verdict": L4CountVerdict,
};
