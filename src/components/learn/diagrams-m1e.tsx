"use client";

// Module 1 theory-expansion figures (wave 2, lessons 5–8 + case study 35).
// Same visual language as diagrams-kit; every number is real, verified
// against the seeded storefront db (scripts/facts-m1-500.ts).

import { motion } from "framer-motion";
import type { FigureId } from "@/lib/curriculum/types";
import { Arrow, DotField, Label, Link, Panel, XMark, fade } from "./diagrams-kit";

/* ---------------- lesson 5 ---------------- */

function L5SortDirections() {
  const asc = [
    ["1", "HDMI 2.1 Cable 2m", "14.99"],
    ["2", "Running Socks 3-pack", "18.50"],
    ["⋯", "⋯", "⋯"],
    ["16", "Smart Watch S", "199.99"],
  ];
  const desc = [...asc].slice().reverse();
  return (
    <svg viewBox="0 0 720 250" className="w-full" role="img" aria-label="Ascending and descending sort of product prices">
      <motion.g {...fade(0)}>
        <Label x={100} y={28} anchor="middle" cls="fill-teal-300" size={11}>ORDER BY price ASC</Label>
        <Panel x={20} y={40} w={220} h={150} />
        {asc.map(([id, name, price], i) => (
          <g key={id}>
            <Label x={34} y={64 + i * 34} cls="fill-zinc-500" size={9.5}>{id}</Label>
            <Label x={56} y={64 + i * 34} cls="fill-zinc-400" size={9.5}>{name}</Label>
            <Label x={226} y={64 + i * 34} anchor="end" cls={i === 0 ? "fill-emerald-300" : "fill-zinc-400"} size={9.5}>{price}</Label>
          </g>
        ))}
        <Label x={130} y={212} anchor="middle" cls="fill-zinc-500" size={9.5}>cheapest first</Label>
      </motion.g>
      <motion.g {...fade(0.35)}>
        <Arrow x1={256} y1={70} x2={300} y2={70} cls="stroke-zinc-600" />
        <Label x={278} y={58} anchor="middle" cls="fill-zinc-500" size={9}>flip</Label>
        <Arrow x1={464} y1={160} x2={420} y2={160} cls="stroke-zinc-600" />
      </motion.g>
      <motion.g {...fade(0.55)}>
        <Label x={620} y={28} anchor="middle" cls="fill-amber-300" size={11}>ORDER BY price DESC</Label>
        <Panel x={480} y={40} w={220} h={150} />
        {desc.map(([id, name, price], i) => (
          <g key={id}>
            <Label x={494} y={64 + i * 34} cls="fill-zinc-500" size={9.5}>{id}</Label>
            <Label x={516} y={64 + i * 34} cls="fill-zinc-400" size={9.5}>{name}</Label>
            <Label x={686} y={64 + i * 34} anchor="end" cls={i === 0 ? "fill-amber-300" : "fill-zinc-400"} size={9.5}>{price}</Label>
          </g>
        ))}
        <Label x={590} y={212} anchor="middle" cls="fill-zinc-500" size={9.5}>priciest first</Label>
      </motion.g>
      <motion.g {...fade(0.8)}>
        <Label x={360} y={238} anchor="middle" cls="fill-zinc-500" size={10}>
          numbers sort by value, text by characters, ISO dates by calendar — same keyword, three intuitions
        </Label>
      </motion.g>
    </svg>
  );
}

function L5Window() {
  const ticks: React.JSX.Element[] = [];
  const x0 = 40, total = 103, w = 6.21;
  for (let i = 0; i < total; i++) {
    const page1 = i < 5;
    const page2 = i >= 5 && i < 10;
    const last = i >= 100;
    const cls = page1 ? "fill-emerald-400" : page2 ? "fill-amber-400" : last ? "fill-teal-400" : "fill-zinc-700";
    ticks.push(<rect key={i} x={x0 + i * w} y={104} width={4} height={26} rx={1} className={cls} opacity={page1 || page2 || last ? 0.95 : 0.6} />);
  }
  return (
    <svg viewBox="0 0 720 250" className="w-full" role="img" aria-label="LIMIT and OFFSET as a moving window over sorted rows">
      <motion.g {...fade(0)}>
        <Label x={40} y={86} cls="fill-zinc-400" size={10.5}>103 orders, sorted by total DESC — then sliced</Label>
        {ticks}
        <Label x={40} y={150} cls="fill-emerald-300" size={9.5}>LIMIT 5 OFFSET 0 — page 1</Label>
        <Label x={150} y={168} cls="fill-amber-300" size={9.5}>OFFSET 5 — page 2</Label>
        <Label x={586} y={150} anchor="end" cls="fill-teal-300" size={9.5}>last page: 3 rows</Label>
      </motion.g>
      <motion.g {...fade(0.5)}>
        <rect x={40} y={186} width={330} height={30} rx={6} className="fill-zinc-900 stroke-zinc-700" />
        <Label x={54} y={205} cls="fill-zinc-300" size={10.5}>page n → OFFSET (n − 1) × LIMIT</Label>
        <rect x={390} y={186} width={290} height={30} rx={6} className="fill-zinc-900 stroke-zinc-700" />
        <Label x={404} y={205} cls="fill-zinc-300" size={10.5}>103 rows @ 5/page → 21 pages</Label>
      </motion.g>
      <motion.g {...fade(0.85)}>
        <Label x={360} y={238} anchor="middle" cls="fill-zinc-500" size={10}>
          LIMIT picks how many, OFFSET skips from the top — without ORDER BY the window lands on arbitrary rows
        </Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- lesson 6 ---------------- */

function L6Cardinality() {
  const groups: Array<[string, number, number, string]> = [
    ["city", 16, 16, "no shrink — every value unique"],
    ["region", 16, 4, "16 customers share 4 regions"],
    ["active", 16, 2, "16 customers share 2 flags"],
  ];
  const s = 7.4;
  return (
    <svg viewBox="0 0 720 250" className="w-full" role="img" aria-label="How much DISTINCT shrinks three customer columns">
      <motion.g {...fade(0)}>
        <Label x={40} y={30} cls="fill-zinc-500" size={10}>rows in (16)</Label>
        <Label x={190} y={30} cls="fill-emerald-300" size={10}>rows out (DISTINCT)</Label>
      </motion.g>
      {groups.map(([col, inn, out, note], i) => {
        const y0 = 56 + i * 62;
        return (
          <motion.g key={col} {...fade(0.15 + i * 0.18)}>
            <rect x={40} y={y0} width={inn * s} height={22} rx={4} className="fill-zinc-700" />
            <Label x={40 + inn * s + 10} y={y0 + 15} cls="fill-zinc-500" size={10}>{inn}</Label>
            <rect x={190} y={y0} width={Math.max(out * s, 14)} height={22} rx={4} className="fill-emerald-400/70" />
            <Label x={190 + Math.max(out * s, 14) + 10} y={y0 + 15} cls="fill-emerald-300" size={10}>{out}</Label>
            <Label x={40} y={y0 - 8} cls="fill-zinc-300" size={10.5}>customers.{col}</Label>
            <Label x={430} y={y0 + 15} cls="fill-zinc-500" size={10}>{note}</Label>
          </motion.g>
        );
      })}
      <motion.g {...fade(0.9)}>
        <Label x={360} y={242} anchor="middle" cls="fill-zinc-500" size={10}>
          cardinality — the number of distinct values a column holds — decides how far DISTINCT can collapse it
        </Label>
      </motion.g>
    </svg>
  );
}

function L6Dropdown() {
  return (
    <svg viewBox="0 0 720 220" className="w-full" role="img" aria-label="DISTINCT plus ORDER BY feeding a UI dropdown">
      <motion.g {...fade(0)}>
        <rect x={24} y={40} width={250} height={64} rx={6} className="fill-zinc-900 stroke-zinc-700" />
        <Label x={38} y={62} cls="fill-teal-300" size={10}>SELECT DISTINCT region</Label>
        <Label x={38} y={78} cls="fill-teal-300" size={10}>FROM customers</Label>
        <Label x={38} y={94} cls="fill-teal-300" size={10}>ORDER BY region;</Label>
        <Label x={24} y={124} cls="fill-zinc-500" size={9.5}>16 customer rows → 4 region rows</Label>
        <Arrow x1={288} y1={72} x2={356} y2={72} cls="stroke-emerald-400" />
      </motion.g>
      <motion.g {...fade(0.4)}>
        <rect x={364} y={30} width={170} height={30} rx={6} className="fill-zinc-900 stroke-zinc-600" />
        <Label x={380} y={50} cls="fill-zinc-200" size={11}>region ▾</Label>
        {["APAC", "EU", "LATAM", "US"].map((r, i) => (
          <g key={r}>
            <rect x={364} y={64 + i * 30} width={170} height={28} rx={0} className={i % 2 ? "fill-zinc-900" : "fill-zinc-950"} />
            <Label x={380} y={82 + i * 30} cls="fill-zinc-300" size={10.5}>{r}</Label>
          </g>
        ))}
        <rect x={364} y={30} width={170} height={154} rx={6} className="fill-none stroke-zinc-600" />
      </motion.g>
      <motion.g {...fade(0.7)}>
        <Label x={600} y={82} cls="fill-zinc-500" size={10}>clean, sorted,</Label>
        <Label x={600} y={98} cls="fill-zinc-500" size={10}>stable — every</Label>
        <Label x={600} y={114} cls="fill-zinc-500" size={10}>filter dropdown</Label>
        <Label x={600} y={130} cls="fill-zinc-500" size={10}>starts here</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <Label x={360} y={206} anchor="middle" cls="fill-zinc-500" size={10}>
          dedupe with DISTINCT, then sort with ORDER BY — the pair behind every clean option list
        </Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- lesson 7 ---------------- */

function L7FiveAggregates() {
  const outs: Array<[string, string]> = [
    ["COUNT(*)", "103"],
    ["SUM(total)", "34833.28"],
    ["AVG(total)", "338.19"],
    ["MIN(total)", "25.47"],
    ["MAX(total)", "1088.44"],
  ];
  return (
    <svg viewBox="0 0 720 260" className="w-full" role="img" aria-label="Five aggregates collapsing 103 order rows into one answer each">
      <motion.g {...fade(0)}>
        <Label x={60} y={30} cls="fill-zinc-400" size={10.5}>orders · 103 rows</Label>
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={60} y={44 + i * 20} width={150} height={14} rx={3} className="fill-zinc-800" opacity={1 - i * 0.07} />
        ))}
      </motion.g>
      <motion.g {...fade(0.35)}>
        <polygon points="238,60 238,190 300,125" className="fill-zinc-900 stroke-zinc-700" />
        <Label x={262} y={216} anchor="middle" cls="fill-zinc-500" size={9.5}>collapse</Label>
      </motion.g>
      <motion.g {...fade(0.5)}>
        {outs.map(([expr, val], i) => (
          <g key={expr}>
            <rect x={330} y={36 + i * 40} width={220} height={30} rx={6} className="fill-zinc-900 stroke-zinc-800" />
            <Label x={344} y={55 + i * 40} cls="fill-teal-300" size={10}>{expr}</Label>
            <Label x={536} y={55 + i * 40} anchor="end" cls="fill-emerald-300" size={11}>{val}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.8)}>
        <Label x={580} y={30} cls="fill-zinc-500" size={9.5}>verified on the storefront:</Label>
        <Label x={580} y={46} cls="fill-zinc-500" size={9.5}>one number per aggregate,</Label>
        <Label x={580} y={62} cls="fill-zinc-500" size={9.5}>no matter how many rows</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <Label x={360} y={244} anchor="middle" cls="fill-zinc-500" size={10}>
          an aggregate eats many rows and returns exactly one value — a question about the group, not about any row
        </Label>
      </motion.g>
    </svg>
  );
}

function L7CountMenu() {
  const rows: Array<[string, string, string]> = [
    ["How many orders exist?", "COUNT(*)", "103"],
    ["How many ever shipped?", "COUNT(shipped_at)", "82"],
    ["How many distinct buyers?", "COUNT(DISTINCT customer_id)", "16"],
  ];
  return (
    <svg viewBox="0 0 720 220" className="w-full" role="img" aria-label="Three COUNT spellings answering three different questions">
      <motion.g {...fade(0)}>
        <Label x={40} y={30} cls="fill-zinc-500" size={10}>the question</Label>
        <Label x={330} y={30} cls="fill-zinc-500" size={10}>the spelling</Label>
        <Label x={620} y={30} anchor="middle" cls="fill-zinc-500" size={10}>the answer</Label>
      </motion.g>
      {rows.map(([qq, expr, ans], i) => (
        <motion.g key={expr} {...fade(0.15 + i * 0.2)}>
          <rect x={30} y={44 + i * 50} width={250} height={36} rx={6} className="fill-zinc-900 stroke-zinc-800" />
          <Label x={44} y={66 + i * 50} cls="fill-zinc-400" size={10}>{qq}</Label>
          <Arrow x1={286} y1={62 + i * 50} x2={316} y2={62 + i * 50} cls="stroke-zinc-700" />
          <rect x={324} y={44 + i * 50} width={250} height={36} rx={6} className="fill-zinc-900 stroke-zinc-700" />
          <Label x={338} y={66 + i * 50} cls="fill-teal-300" size={10}>{expr}</Label>
          <Arrow x1={580} y1={62 + i * 50} x2={610} y2={62 + i * 50} cls="stroke-zinc-700" />
          <Label x={655} y={68 + i * 50} anchor="middle" cls="fill-emerald-300" size={13}>{ans}</Label>
        </motion.g>
      ))}
      <motion.g {...fade(0.85)}>
        <Label x={360} y={204} anchor="middle" cls="fill-zinc-500" size={10}>
          same table, three different questions — the COUNT you pick IS the question you asked
        </Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- lesson 8 ---------------- */

function L8GroupPipeline() {
  const buckets: Array<[string, number, string, string]> = [
    ["delivered", 52, "fill-emerald-400/60", "fill-emerald-300"],
    ["shipped", 30, "fill-teal-400/60", "fill-teal-300"],
    ["pending", 14, "fill-amber-400/60", "fill-amber-300"],
    ["cancelled", 7, "fill-rose-400/60", "fill-rose-300"],
  ];
  const s = 1.05;
  return (
    <svg viewBox="0 0 720 310" className="w-full" role="img" aria-label="GROUP BY bucketing orders by status and HAVING filtering the buckets">
      <motion.g {...fade(0)}>
        <DotField n={24} cols={8} x0={44} y0={70} gap={14} />
        <Label x={44} y={54} cls="fill-zinc-400" size={10}>103 orders</Label>
        <Label x={44} y={202} cls="fill-zinc-600" size={9}>rows</Label>
        <Arrow x1={170} y1={120} x2={204} y2={120} />
      </motion.g>
      <motion.g {...fade(0.3)}>
        <Label x={218} y={54} cls="fill-zinc-400" size={10}>GROUP BY status</Label>
        {buckets.map(([st, n, fill], i) => {
          const h = n * s;
          return (
            <g key={st}>
              <rect x={218 + i * 62} y={190 - h} width={46} height={h} rx={4} className={fill} />
              <Label x={241 + i * 62} y={202} anchor="middle" cls="fill-zinc-500" size={8.5}>{st.slice(0, 4)}</Label>
              <Label x={241 + i * 62} y={184 - h} anchor="middle" cls="fill-zinc-400" size={9}>{n}</Label>
            </g>
          );
        })}
        <Arrow x1={484} y1={120} x2={518} y2={120} />
      </motion.g>
      <motion.g {...fade(0.55)}>
        <Label x={530} y={54} cls="fill-zinc-400" size={10}>SELECT status, COUNT(*)</Label>
        {buckets.map(([st, n], i) => (
          <g key={st}>
            <rect x={530} y={64 + i * 40} width={160} height={30} rx={5} className="fill-zinc-900 stroke-zinc-800" />
            <Label x={544} y={83 + i * 40} cls="fill-zinc-400" size={9.5}>{st}</Label>
            <Label x={676} y={83 + i * 40} anchor="end" cls="fill-emerald-300" size={10}>{n}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.75)}>
        <rect x={218} y={222} width={280} height={28} rx={6} className="fill-zinc-900 stroke-amber-400/70" />
        <Label x={232} y={240} cls="fill-amber-300" size={10.5}>HAVING COUNT(*) &gt;= 14</Label>
        <Arrow x1={504} y1={236} x2={530} y2={236} cls="stroke-amber-400/80" />
        <g opacity={0.45}>
          <XMark x={624} y={224} cls="stroke-rose-400" s={6} />
          <Label x={636} y={228} cls="fill-rose-300" size={9.5}>cancelled (7) dropped</Label>
        </g>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <Label x={360} y={296} anchor="middle" cls="fill-zinc-500" size={10}>
          WHERE filters rows before the buckets exist; HAVING filters the buckets after — different stages, different jobs
        </Label>
      </motion.g>
    </svg>
  );
}

function L8SelectRule() {
  return (
    <svg viewBox="0 0 720 260" className="w-full" role="img" aria-label="What may appear in SELECT of a grouped query">
      <motion.g {...fade(0)}>
        <rect x={24} y={36} width={320} height={180} rx={8} className="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={40} y={60} cls="fill-emerald-300" size={11}>✓ every column earns its place</Label>
        <Label x={40} y={88} cls="fill-teal-300" size={9.5}>SELECT status, COUNT(*)</Label>
        <Label x={40} y={104} cls="fill-teal-300" size={9.5}>FROM orders GROUP BY status</Label>
        <Label x={40} y={132} cls="fill-zinc-400" size={9.5}>status — the grouping key, one per bucket ✓</Label>
        <Label x={40} y={150} cls="fill-zinc-400" size={9.5}>COUNT(*) — an aggregate of each bucket ✓</Label>
        <Label x={40} y={186} cls="fill-emerald-300" size={10}>→ 4 tidy rows: delivered · shipped · pending · cancelled</Label>
      </motion.g>
      <motion.g {...fade(0.4)}>
        <rect x={376} y={36} width={320} height={180} rx={8} className="fill-zinc-900 stroke-rose-400/60" />
        <Label x={392} y={60} cls="fill-rose-300" size={11}>✗ one stray column poisons the query</Label>
        <Label x={392} y={88} cls="fill-teal-300" size={9.5}>SELECT status, total, COUNT(*)</Label>
        <Label x={392} y={104} cls="fill-teal-300" size={9.5}>FROM orders GROUP BY status</Label>
        <Label x={392} y={132} cls="fill-zinc-400" size={9.5}>total — not grouped, not aggregated:</Label>
        <Label x={392} y={150} cls="fill-zinc-400" size={9.5}>which of the 52 delivered totals did you mean?</Label>
        <Label x={392} y={186} cls="fill-rose-300" size={9.5}>→ SQLite runs it and picks a total at random;</Label>
      </motion.g>
      <motion.g {...fade(0.7)}>
        <Label x={360} y={240} anchor="middle" cls="fill-zinc-500" size={10}>
          the rule: every SELECT column must be a GROUP BY column or inside an aggregate — PostgreSQL rejects the rest
        </Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- lesson 35 ---------------- */

function L35QuestionToSql() {
  const steps: Array<[string, string]> = [
    ["FROM orders", "the sales ledger — one row per purchase"],
    ["GROUP BY status", "one bucket per lifecycle stage"],
    ["SELECT status, COUNT(*)", "the label + the measure"],
    ["ORDER BY COUNT(*) DESC", "busiest stage first"],
  ];
  const answer: Array<[string, number]> = [
    ["delivered", 52], ["shipped", 30], ["pending", 14], ["cancelled", 7],
  ];
  return (
    <svg viewBox="0 0 720 290" className="w-full" role="img" aria-label="Mapping a business question onto SQL clauses">
      <motion.g {...fade(0)}>
        <rect x={24} y={24} width={470} height={34} rx={6} className="fill-zinc-900 stroke-zinc-600" />
        <Label x={38} y={45} cls="fill-zinc-200" size={10.5}>"Which lifecycle stages dominate — how many orders in each?"</Label>
      </motion.g>
      {steps.map(([clause, role], i) => (
        <motion.g key={clause} {...fade(0.15 + i * 0.12)}>
          <rect x={24} y={76 + i * 42} width={250} height={32} rx={6} className="fill-zinc-900 stroke-zinc-800" />
          <Label x={38} y={96 + i * 42} cls="fill-teal-300" size={10}>{clause}</Label>
          <Label x={290} y={96 + i * 42} cls="fill-zinc-500" size={9.5}>{role}</Label>
          <Link x1={280} y1={92 + i * 42} x2={436} y2={116} cls="stroke-zinc-800" arrow={false} />
        </motion.g>
      ))}
      <motion.g {...fade(0.8)}>
        <Panel x={446} y={84} w={240} h={172} cls="fill-zinc-900 stroke-emerald-400/50" />
        <Label x={460} y={106} cls="fill-emerald-300" size={10.5}>the answer — real</Label>
        {answer.map(([r, n], i) => (
          <g key={r}>
            <Label x={460} y={134 + i * 30} cls="fill-zinc-300" size={11}>{r}</Label>
            <rect x={560} y={124 + i * 30} width={n * 1.9} height={12} rx={3} className="fill-emerald-400/70" />
            <Label x={672} y={134 + i * 30} anchor="end" cls="fill-emerald-300" size={11}>{n}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.95)}>
        <Label x={360} y={278} anchor="middle" cls="fill-zinc-500" size={10}>
          every report is a question pulled apart clause by clause — 52 + 30 + 14 + 7 = 103 ✓
        </Label>
      </motion.g>
    </svg>
  );
}

function L35ClauseOrder() {
  const pairs: Array<[string, string]> = [
    ["SELECT", "5"],
    ["FROM", "1"],
    ["WHERE", "2"],
    ["GROUP BY", "3"],
    ["HAVING", "4"],
    ["ORDER BY", "6"],
  ];
  const byExec = [...pairs].sort((a, b) => Number(a[1]) - Number(b[1]));
  return (
    <svg viewBox="0 0 720 260" className="w-full" role="img" aria-label="Written clause order versus execution order">
      <motion.g {...fade(0)}>
        <Label x={120} y={28} anchor="middle" cls="fill-zinc-400" size={10.5}>how you write it</Label>
        {pairs.map(([c], i) => (
          <g key={c}>
            <rect x={50} y={44 + i * 32} width={140} height={26} rx={5} className="fill-zinc-900 stroke-zinc-800" />
            <Label x={64} y={61 + i * 32} cls="fill-zinc-300" size={10}>{c}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.45)}>
        <Label x={500} y={28} anchor="middle" cls="fill-emerald-300" size={10.5}>how it actually runs</Label>
        {byExec.map(([c, n], i) => (
          <g key={c}>
            <rect x={430} y={44 + i * 32} width={140} height={26} rx={5} className="fill-zinc-900 stroke-emerald-400/50" />
            <circle cx={447} cy={57 + i * 32} r={9} className="fill-emerald-400/20 stroke-emerald-400/70" />
            <Label x={447} y={61 + i * 32} anchor="middle" cls="fill-emerald-300" size={9.5}>{n}</Label>
            <Label x={464} y={61 + i * 32} cls="fill-zinc-300" size={10}>{c}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.75)}>
        <rect x={592} y={44} width={112} height={176} rx={8} className="fill-zinc-900 stroke-zinc-800" />
        <Label x={604} y={66} cls="fill-amber-300" size={9.5}>aliases are</Label>
        <Label x={604} y={80} cls="fill-amber-300" size={9.5}>born at step 5</Label>
        <Label x={604} y={104} cls="fill-zinc-500" size={9}>WHERE (2) can't</Label>
        <Label x={604} y={118} cls="fill-zinc-500" size={9}>see them —</Label>
        <Label x={604} y={140} cls="fill-zinc-500" size={9}>ORDER BY (6)</Label>
        <Label x={604} y={154} cls="fill-zinc-500" size={9}>can</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <Label x={360} y={248} anchor="middle" cls="fill-zinc-500" size={10}>
          the engine never runs top-to-bottom — clause order is syntax, execution order is semantics
        </Label>
      </motion.g>
    </svg>
  );
}

export const FIGURES_M1E: Partial<Record<FigureId, () => React.JSX.Element>> = {
  "l5-sort-directions": L5SortDirections,
  "l5-window": L5Window,
  "l6-cardinality": L6Cardinality,
  "l6-dropdown": L6Dropdown,
  "l7-five-aggregates": L7FiveAggregates,
  "l7-count-menu": L7CountMenu,
  "l8-group-pipeline": L8GroupPipeline,
  "l8-select-rule": L8SelectRule,
  "l35-question-to-sql": L35QuestionToSql,
  "l35-clause-order": L35ClauseOrder,
};
