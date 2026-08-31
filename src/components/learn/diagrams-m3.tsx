"use client";

// Module 3 lesson figures (lessons 17–24) — second, concept-deep diagram per
// lesson. Same drawing kit as diagrams.tsx; registry merged there.

import { motion } from "framer-motion";
import type { FigureId } from "@/lib/curriculum/types";
import {
  Arrow,
  DotField,
  Label,
  Link,
  Panel,
  XMark,
  drawIn,
  fade,
} from "./diagrams-kit";

/* ---------------- local bits ---------------- */

function Chip({
  x,
  y,
  w,
  h = 22,
  text,
  cls = "fill-zinc-900 stroke-zinc-800",
  textCls = "fill-zinc-300",
  size = 9,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  text: string;
  cls?: string;
  textCls?: string;
  size?: number;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5} className={cls} strokeWidth={1} />
      <Label x={x + w / 2} y={y + h / 2 + size * 0.35} anchor="middle" cls={textCls} size={size}>
        {text}
      </Label>
    </g>
  );
}

/* ---------------- lesson 17 — dedupe is the whole difference ---------------- */

function S9UnionVsAll() {
  const statuses = ["cancelled", "delivered", "pending", "shipped"];
  return (
    <svg
      viewBox="0 0 720 300"
      className="w-full"
      role="img"
      aria-label="UNION ALL stacks 206 rows; UNION dedupes the same pile down to the 4 distinct statuses"
    >
      <motion.g {...fade(0)}>
        <Label x={28} y={22} cls="fill-zinc-400" size={10}>
          SELECT status FROM orders UNION ALL SELECT status FROM orders  -- 206
        </Label>
        <Label x={28} y={38} cls="fill-zinc-600" size={9}>
          SELECT status FROM orders UNION SELECT status FROM orders  -- 4
        </Label>
      </motion.g>
      {/* left — UNION ALL keeps everything */}
      <motion.g {...fade(0.3)}>
        <Panel x={28} y={58} w={306} h={196} />
        <Label x={44} y={80} cls="fill-zinc-200" size={11}>UNION ALL — pure append</Label>
        <Label x={44} y={96} cls="fill-zinc-500" size={8}>arm 1 · 103 rows</Label>
        <DotField n={103} cols={15} x0={44} y0={106} gap={8.5} r={2.3} />
        <Label x={44} y={176} cls="fill-zinc-500" size={8}>arm 2 · 103 rows</Label>
        <DotField n={103} cols={15} x0={44} y0={186} gap={8.5} r={2.3} />
        <Label x={318} y={140} anchor="end" cls="fill-zinc-100" size={20}>= 206</Label>
        <Label x={318} y={156} anchor="end" cls="fill-zinc-500" size={8}>rows kept — every last one</Label>
      </motion.g>
      <motion.g {...fade(0.55)}>
        <Arrow x1={340} y1={150} x2={380} y2={150} />
        <Label x={360} y={140} anchor="middle" cls="fill-zinc-600" size={8}>same pile</Label>
      </motion.g>
      {/* right — UNION dedupes */}
      <motion.g {...fade(0.7)}>
        <Panel x={386} y={58} w={306} h={196} />
        <Label x={402} y={80} cls="fill-emerald-300" size={11}>UNION — appends, then dedupes</Label>
        <Label x={402} y={96} cls="fill-zinc-500" size={8}>same 206-row pile → distinct whole rows</Label>
        {statuses.map((s, i) => (
          <Chip key={s} x={402} y={106 + i * 24} w={140} h={20} text={s}
            cls="fill-zinc-950 stroke-emerald-400/40" textCls="fill-emerald-200" />
        ))}
        <Label x={676} y={140} anchor="end" cls="fill-emerald-300" size={20}>= 4</Label>
        <Label x={676} y={156} anchor="end" cls="fill-zinc-500" size={8}>rows survive</Label>
        <Chip x={402} y={208} w={170} h={20} text="delivered — repeat"
          cls="fill-zinc-950 stroke-zinc-800" textCls="fill-zinc-600" size={8} />
        <XMark x={414} y={218} cls="stroke-rose-400/80" s={4} delay={1.1} />
        <Label x={402} y={244} cls="fill-zinc-500" size={8}>202 repeat rows never make it out</Label>
      </motion.g>
      <motion.g {...fade(1)}>
        <Label x={28} y={276} cls="fill-zinc-400" size={10}>
          ALL: 103 + 103 = 206 rows out — UNION: the same pile collapses to the 4 distinct statuses
        </Label>
        <Label x={28} y={292} cls="fill-zinc-600" size={9}>
          dedupe compares entire rows, across and within arms — and it costs a sort
        </Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- lesson 18 — columns bind by position ---------------- */

function S10PositionBinding() {
  const arm1: Array<[string, number]> = [["delivered", 52], ["shipped", 30], ["pending", 14], ["cancelled", 7]];
  const arm2: Array<[string, number]> = [["EU", 2], ["APAC", 2], ["US", 1], ["LATAM", 1]];
  return (
    <svg
      viewBox="0 0 720 330"
      className="w-full"
      role="img"
      aria-label="Columns bind by position, not by name: the stack keeps arm 1's two headers, and both arms must select exactly two columns"
    >
      <motion.g {...fade(0)}>
        <Label x={28} y={22} cls="fill-zinc-400" size={9}>SELECT status, COUNT(*) FROM orders GROUP BY status</Label>
        <Label x={28} y={36} cls="fill-zinc-600" size={9}>UNION ALL SELECT region, COUNT(*) FROM suppliers GROUP BY region</Label>
      </motion.g>
      {/* the two arms */}
      <motion.g {...fade(0.3)}>
        <Panel x={28} y={48} w={320} h={104} />
        <Label x={44} y={68} cls="fill-emerald-300" size={10}>arm 1 — orders</Label>
        <line x1={44} y1={74} x2={332} y2={74} className="stroke-zinc-800" />
        {arm1.map(([s, n], i) => (
          <g key={s}>
            <Label x={44} y={92 + i * 14} cls="fill-zinc-300" size={9}>{s}</Label>
            <Label x={332} y={92 + i * 14} anchor="end" cls="fill-zinc-400" size={9}>{n}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.45)}>
        <Panel x={372} y={48} w={320} h={104} />
        <Label x={388} y={68} cls="fill-sky-300" size={10}>arm 2 — suppliers</Label>
        <line x1={388} y1={74} x2={676} y2={74} className="stroke-zinc-800" />
        {arm2.map(([r, n], i) => (
          <g key={r}>
            <Label x={388} y={92 + i * 14} cls="fill-zinc-300" size={9}>{r}</Label>
            <Label x={676} y={92 + i * 14} anchor="end" cls="fill-zinc-400" size={9}>{n}</Label>
          </g>
        ))}
      </motion.g>
      <g>
        <Link x1={188} y1={154} x2={300} y2={194} cls="stroke-emerald-400" w={1.4} delay={0.5} />
        <Link x1={532} y1={154} x2={420} y2={194} cls="stroke-sky-400" w={1.4} delay={0.65} />
      </g>
      {/* the pile — arm 1's names on top */}
      <motion.g {...fade(0.8)}>
        <Panel x={220} y={198} w={280} h={126} />
        <Label x={236} y={216} cls="fill-emerald-300" size={9}>status</Label>
        <Label x={484} y={216} anchor="end" cls="fill-sky-300" size={9}>COUNT(*)</Label>
        <line x1={236} y1={222} x2={484} y2={222} className="stroke-zinc-800" />
        {arm1.map(([s, n], i) => (
          <g key={s}>
            <Label x={236} y={234 + i * 12} cls="fill-zinc-300" size={8}>{s}</Label>
            <Label x={484} y={234 + i * 12} anchor="end" cls="fill-zinc-400" size={8}>{n}</Label>
          </g>
        ))}
        <line x1={236} y1={276} x2={484} y2={276} className="stroke-zinc-700" strokeDasharray="3 3" />
        {arm2.map(([r, n], i) => (
          <g key={r}>
            <Label x={236} y={288 + i * 11} cls="fill-sky-300" size={8}>{r}</Label>
            <Label x={484} y={288 + i * 11} anchor="end" cls="fill-zinc-500" size={8}>{n}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(1.05)}>
        <Label x={512} y={216} cls="fill-emerald-300" size={8}>result headers = arm 1&apos;s</Label>
        <Label x={512} y={228} cls="fill-emerald-300" size={8}>names — arm 2&apos;s are discarded</Label>
        <Label x={512} y={252} cls="fill-zinc-400" size={8}>count is law: both arms</Label>
        <Label x={512} y={264} cls="fill-zinc-400" size={8}>select exactly 2 columns</Label>
        <Label x={512} y={292} cls="fill-sky-300" size={8}>arm 2&apos;s rows, bound by</Label>
        <Label x={512} y={304} cls="fill-sky-300" size={8}>position, not by name</Label>
        <Label x={512} y={322} cls="fill-zinc-600" size={8}>8 rows in the pile — 4 per arm</Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- lesson 19 — in both, counted once ---------------- */

function S11BothSides() {
  const both: Array<[string, string]> = [["1", "Alice Chen"], ["5", "Emma Wilson"], ["11", "Keiko Sato"], ["13", "Maya Patel"]];
  return (
    <svg
      viewBox="0 0 720 300"
      className="w-full"
      role="img"
      aria-label="INTERSECT keeps the 4 customer ids present in both sets, counted once and NULL-safe"
    >
      <motion.g {...fade(0)}>
        <Label x={28} y={22} cls="fill-zinc-400" size={9}>SELECT DISTINCT customer_id FROM orders WHERE status = &apos;delivered&apos;</Label>
        <Label x={28} y={36} cls="fill-zinc-600" size={9}>INTERSECT SELECT DISTINCT customer_id FROM orders WHERE status = &apos;cancelled&apos;  -- 4 rows</Label>
      </motion.g>
      <motion.g {...fade(0.3)}>
        <rect x={60} y={52} width={380} height={180} rx={10} className="fill-zinc-900 stroke-zinc-700" />
        <rect x={280} y={52} width={380} height={180} rx={10} className="fill-zinc-900 stroke-zinc-700" />
        <Label x={76} y={76} cls="fill-zinc-400" size={9}>arm A · delivered — 15</Label>
        <Label x={76} y={110} cls="fill-zinc-200" size={20}>11</Label>
        <Label x={76} y={128} cls="fill-zinc-500" size={8}>delivered only — never cancelled</Label>
        <Label x={76} y={152} cls="fill-zinc-600" size={8}>an arm that repeats a row still counts once</Label>
        <Label x={76} y={166} cls="fill-zinc-600" size={8}>DISTINCT semantics, on both sides</Label>
        <Label x={76} y={188} cls="fill-zinc-500" size={8}>15 − 4 in both = 11 alone</Label>
        <Label x={644} y={76} anchor="end" cls="fill-zinc-400" size={9}>arm B · cancelled — 4</Label>
        <Label x={644} y={110} anchor="end" cls="fill-zinc-200" size={20}>0</Label>
        <Label x={644} y={128} anchor="end" cls="fill-zinc-500" size={8}>cancelled only — B sits fully inside A</Label>
        <Label x={644} y={152} anchor="end" cls="fill-zinc-600" size={8}>in both = identical on ALL output columns</Label>
      </motion.g>
      <motion.g {...fade(0.6)}>
        <rect x={280} y={52} width={160} height={180} rx={10} className="fill-emerald-400/15 stroke-emerald-400/70" />
        <Label x={360} y={76} anchor="middle" cls="fill-emerald-300" size={10}>in both — 4</Label>
        {both.map(([id, name], i) => (
          <Label key={id} x={360} y={102 + i * 18} anchor="middle" cls="fill-emerald-200" size={9}>
            {id} · {name}
          </Label>
        ))}
        <Label x={360} y={180} anchor="middle" cls="fill-emerald-300" size={8}>ids 1 · 5 · 11 · 13</Label>
        <Label x={360} y={218} anchor="middle" cls="fill-emerald-300" size={8}>counted once</Label>
      </motion.g>
      <motion.g {...fade(0.8)}>
        <Chip x={180} y={238} w={110} h={22} text="15 · delivered" />
        <Label x={310} y={254} anchor="middle" cls="fill-zinc-400" size={12}>∩</Label>
        <Chip x={330} y={238} w={110} h={22} text="4 · cancelled" />
        <Label x={460} y={254} anchor="middle" cls="fill-zinc-400" size={12}>=</Label>
        <Chip x={480} y={238} w={110} h={22} text="4 · in both"
          cls="fill-emerald-400/10 stroke-emerald-400/60" textCls="fill-emerald-300" />
      </motion.g>
      <motion.g {...fade(0.95)}>
        <Label x={28} y={278} cls="fill-zinc-400" size={10}>
          a row survives only if BOTH arms contain it — identical on every output column, duplicates collapsed
        </Label>
        <Label x={28} y={294} cls="fill-zinc-600" size={9}>
          an arm listing Alice three times still matches once — and NULL matches NULL, set-op safe
        </Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- lesson 20 — EXCEPT as a NULL-safe anti-join ---------------- */

function S12ExceptAudit() {
  const customers: Array<[string, string]> = [
    ["1", "Alice"], ["2", "Bruno"], ["3", "Chloe"], ["4", "Dmitri"],
    ["5", "Emma"], ["6", "Farid"], ["7", "Grace"], ["8", "Hiro"],
    ["9", "Isabella"], ["10", "Jamal"], ["11", "Keiko"], ["12", "Liam"],
    ["13", "Maya"], ["14", "Noah"], ["15", "Olivia"], ["16", "Pedro"],
  ];
  const shipped = new Set(["1", "5", "7", "8", "9", "10", "12", "13", "14", "16"]);
  return (
    <svg
      viewBox="0 0 720 300"
      className="w-full"
      role="img"
      aria-label="EXCEPT subtracts the 10 shipped customers from all 16 — six survive; NOT IN would die on a single NULL"
    >
      <motion.g {...fade(0)}>
        <Label x={28} y={22} cls="fill-zinc-400" size={9}>SELECT id FROM customers</Label>
        <Label x={28} y={36} cls="fill-zinc-600" size={9}>EXCEPT SELECT DISTINCT customer_id FROM orders WHERE status = &apos;shipped&apos;  -- 6</Label>
      </motion.g>
      {/* arm A with arm B's members struck */}
      <motion.g {...fade(0.3)}>
        <Panel x={28} y={46} w={330} h={216} />
        <Label x={44} y={66} cls="fill-zinc-200" size={10}>arm A — all 16 customers</Label>
        <Label x={44} y={80} cls="fill-zinc-500" size={8}>arm B — the 10 shipped ids, struck where they match</Label>
        {customers.map(([id, name], i) => {
          const inB = shipped.has(id);
          const cx = 44 + (i % 4) * 78;
          const cy = 90 + Math.floor(i / 4) * 27;
          return (
            <g key={id}>
              <Chip x={cx} y={cy} w={72} h={20} text={`${id} · ${name}`} size={8}
                cls={inB ? "fill-zinc-900 stroke-zinc-800" : "fill-emerald-400/10 stroke-emerald-400/60"}
                textCls={inB ? "fill-zinc-600" : "fill-emerald-200"} />
              {inB && <XMark x={cx + 36} y={cy + 10} cls="stroke-rose-400/80" s={5} delay={0.8 + i * 0.05} />}
            </g>
          );
        })}
        <Label x={44} y={212} cls="fill-emerald-300" size={8}>6 survive — no shipped order at all</Label>
        <Label x={44} y={228} cls="fill-rose-300" size={8}>10 struck — present in arm B</Label>
        <Label x={44} y={248} cls="fill-zinc-600" size={8}>arm B is consumed, not kept — subtracted from A</Label>
      </motion.g>
      {/* survivors + the NULL warning */}
      <motion.g {...fade(0.6)}>
        <Panel x={382} y={46} w={310} h={100} cls="fill-zinc-900 stroke-emerald-400/40" />
        <Label x={398} y={68} cls="fill-emerald-300" size={10}>A EXCEPT B → survive</Label>
        <Label x={406} y={118} cls="fill-emerald-300" size={20}>6</Label>
        <Label x={436} y={92} cls="fill-zinc-300" size={9}>ids 2 · 3 · 4 · 6 · 11 · 15</Label>
        <Label x={436} y={110} cls="fill-zinc-500" size={8}>Bruno · Chloe · Dmitri · Farid</Label>
        <Label x={436} y={126} cls="fill-zinc-500" size={8}>Keiko · Olivia</Label>
        <Label x={436} y={140} cls="fill-zinc-600" size={8}>LEFT JOIN · NOT EXISTS · EXCEPT agree</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <Panel x={382} y={158} w={310} h={104} cls="fill-rose-400/10 stroke-rose-400/50" />
        <Label x={398} y={180} cls="fill-rose-300" size={10}>NOT IN dies on NULL — EXCEPT doesn&apos;t</Label>
        <Label x={398} y={200} cls="fill-zinc-300" size={8}>one NULL in the subquery and NOT IN keeps nothing at all</Label>
        <Label x={398} y={216} cls="fill-zinc-400" size={8}>set ops group rows: NULLs match NULLs, so the audit still runs</Label>
        <Label x={398} y={236} cls="fill-zinc-500" size={8}>plus a free DISTINCT: repeats inside an arm collapse first</Label>
      </motion.g>
      <motion.g {...fade(1.1)}>
        <Label x={28} y={284} cls="fill-zinc-600" size={9}>swap the arms and you audit a different question — EXCEPT is asymmetric by design</Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- lesson 21 — who evaluates first ---------------- */

function S13EvalOrder() {
  const leftEdges = ["M 66 180 L 104 152", "M 154 180 L 120 152", "M 112 130 L 142 106", "M 245 130 L 160 106"];
  const rightEdges = ["M 460 130 L 490 106", "M 586 130 L 506 106", "M 540 180 L 578 152", "M 630 180 L 594 152"];
  return (
    <svg
      viewBox="0 0 720 310"
      className="w-full"
      role="img"
      aria-label="SQLite reads A UNION B INTERSECT C left to right and returns 8 ids; the standard binds INTERSECT first and returns 15"
    >
      <motion.g {...fade(0)}>
        <Label x={28} y={22} cls="fill-zinc-300" size={10}>A UNION B INTERSECT C — one text, two bindings</Label>
        <Label x={28} y={38} cls="fill-zinc-500" size={9}>A · delivered · 15      B · cancelled · 4      C · pending · 8</Label>
      </motion.g>
      {/* SQLite — left to right */}
      <motion.g {...fade(0.25)}>
        <Panel x={24} y={48} w={324} h={210} />
        <Label x={40} y={68} cls="fill-zinc-300" size={9}>SQLite — equal precedence, left to right</Label>
        <rect x={26} y={122} width={178} height={90} rx={8} fill="none" className="stroke-zinc-500" strokeDasharray="4 3" />
      </motion.g>
      {leftEdges.map((d, i) => (
        <motion.path key={i} {...drawIn(0.45 + i * 0.1)} d={d} className="stroke-zinc-600" strokeWidth={1.2} fill="none" />
      ))}
      <motion.g {...fade(0.4)}>
        <Chip x={132} y={84} w={36} h={22} text="∩" textCls="fill-zinc-200" size={12} />
        <Chip x={94} y={130} w={36} h={22} text="∪" textCls="fill-zinc-200" size={12} />
        <Chip x={215} y={130} w={60} h={22} text="C · 8" />
        <Chip x={28} y={180} w={76} h={22} text="A · 15" />
        <Chip x={116} y={180} w={76} h={22} text="B · 4" />
      </motion.g>
      <motion.g {...fade(0.8)}>
        <rect x={40} y={224} width={280} height={30} rx={7} className="fill-emerald-400/10 stroke-emerald-400/60" />
        <Label x={54} y={243} cls="fill-zinc-300" size={9}>(A ∪ B) ∩ C → ids 1·3·5·6·7·11·13·16</Label>
        <Label x={306} y={244} anchor="end" cls="fill-emerald-300" size={14}>8</Label>
      </motion.g>
      {/* standard — INTERSECT binds first */}
      <motion.g {...fade(1)}>
        <Panel x={372} y={48} w={324} h={210} />
        <Label x={388} y={68} cls="fill-zinc-300" size={9}>standard · Postgres · MySQL — INTERSECT first</Label>
        <rect x={494} y={122} width={184} height={90} rx={8} fill="none" className="stroke-zinc-500" strokeDasharray="4 3" />
      </motion.g>
      {rightEdges.map((d, i) => (
        <motion.path key={i} {...drawIn(1.2 + i * 0.1)} d={d} className="stroke-zinc-600" strokeWidth={1.2} fill="none" />
      ))}
      <motion.g {...fade(1.15)}>
        <Chip x={480} y={84} w={36} h={22} text="∪" textCls="fill-zinc-200" size={12} />
        <Chip x={430} y={130} w={60} h={22} text="A · 15" />
        <Chip x={568} y={130} w={36} h={22} text="∩" textCls="fill-zinc-200" size={12} />
        <Chip x={510} y={180} w={60} h={22} text="B · 4" />
        <Chip x={600} y={180} w={60} h={22} text="C · 8" />
      </motion.g>
      <motion.g {...fade(1.55)}>
        <rect x={388} y={224} width={280} height={30} rx={7} className="fill-sky-400/10 stroke-sky-400/60" />
        <Label x={402} y={243} cls="fill-zinc-300" size={9}>A ∪ (B ∩ C) — B ∩ C = {"{1,5,11,13}"} ⊆ A</Label>
        <Label x={654} y={244} anchor="end" cls="fill-sky-300" size={14}>15</Label>
      </motion.g>
      <motion.g {...fade(1.8)}>
        <Label x={28} y={282} cls="fill-zinc-400" size={10}>
          same text — 8 rows in SQLite, 15 in the standard: the engines disagree on which rows survive
        </Label>
        <Label x={28} y={298} cls="fill-zinc-600" size={9}>
          B sits fully inside A, so the standard&apos;s B ∩ C is just B — and the answer is every delivered id
        </Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- lesson 22 — CASE as a router ---------------- */

function S14RowRouter() {
  const lanes = [
    ["delivered → 'done'", "52 rows", "fill-emerald-400/10 stroke-emerald-400/60", "fill-emerald-300"],
    ["shipped → 'on its way'", "30 rows", "fill-teal-400/10 stroke-teal-400/60", "fill-teal-300"],
    ["pending → 'waiting'", "14 rows", "fill-amber-400/10 stroke-amber-400/60", "fill-amber-300"],
    ["ELSE → 'dead end'", "7 rows", "fill-rose-400/10 stroke-rose-400/60", "fill-rose-300"],
  ] as const;
  return (
    <svg
      viewBox="0 0 720 300"
      className="w-full"
      role="img"
      aria-label="CASE routes each of 103 orders down exactly one branch — 52, 30, 14 and 7 — with ELSE catching the rest"
    >
      <motion.g {...fade(0)}>
        <Label x={28} y={18} cls="fill-zinc-400" size={9}>SELECT CASE status WHEN &apos;delivered&apos; THEN &apos;done&apos; WHEN &apos;shipped&apos; THEN &apos;on its way&apos;</Label>
        <Label x={28} y={32} cls="fill-zinc-600" size={9}>WHEN &apos;pending&apos; THEN &apos;waiting&apos; ELSE &apos;dead end&apos; END FROM orders</Label>
      </motion.g>
      <motion.g {...fade(0.25)}>
        <Label x={28} y={62} cls="fill-zinc-300" size={10}>103 order rows</Label>
        <DotField n={103} cols={10} x0={28} y0={74} gap={10} r={2.6} />
      </motion.g>
      <motion.g {...fade(0.5)}>
        <Arrow x1={128} y1={124} x2={172} y2={124} />
        <Label x={150} y={112} anchor="middle" cls="fill-zinc-500" size={8}>one CASE per row</Label>
        <rect x={176} y={62} width={190} height={140} rx={10} className="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={271} y={84} anchor="middle" cls="fill-emerald-300" size={10}>CASE status</Label>
        <Label x={271} y={104} anchor="middle" cls="fill-zinc-400" size={8}>WHEN &apos;delivered&apos; THEN …</Label>
        <Label x={271} y={120} anchor="middle" cls="fill-zinc-400" size={8}>WHEN &apos;shipped&apos; THEN …</Label>
        <Label x={271} y={136} anchor="middle" cls="fill-zinc-400" size={8}>WHEN &apos;pending&apos; THEN …</Label>
        <Label x={271} y={152} anchor="middle" cls="fill-zinc-300" size={8}>ELSE …</Label>
        <Label x={271} y={170} anchor="middle" cls="fill-zinc-300" size={9}>END</Label>
        <Label x={271} y={190} anchor="middle" cls="fill-zinc-600" size={8}>first match wins — then stops</Label>
      </motion.g>
      <g>
        <Link x1={366} y1={86} x2={470} y2={80} cls="stroke-emerald-400" w={1.3} delay={0.9} />
        <Link x1={366} y1={118} x2={470} y2={132} cls="stroke-teal-400" w={1.3} delay={1} />
        <Link x1={366} y1={150} x2={470} y2={184} cls="stroke-amber-400/80" w={1.3} delay={1.1} />
        <Link x1={366} y1={182} x2={470} y2={236} cls="stroke-rose-400/80" w={1.3} delay={1.2} />
      </g>
      <motion.g {...fade(1.1)}>
        {lanes.map(([name, n, cls, textCls], i) => {
          const ly = 62 + i * 52;
          return (
            <g key={name}>
              <rect x={474} y={ly} width={220} height={36} rx={7} className={cls} />
              <Label x={490} y={ly + 22} cls={textCls} size={9}>{name}</Label>
              <Label x={680} y={ly + 22} anchor="end" cls="fill-zinc-200" size={11}>{n}</Label>
            </g>
          );
        })}
      </motion.g>
      <motion.g {...fade(1.35)}>
        <Label x={28} y={276} cls="fill-zinc-400" size={10}>
          one row in, exactly one branch out: 52 + 30 + 14 + 7 = 103 — nothing falls through
        </Label>
        <Label x={28} y={292} cls="fill-zinc-600" size={9}>
          ELSE catches everything the WHENs missed — here, just the 7 cancelled orders
        </Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- lesson 23 — rows into columns ---------------- */

function S15PivotBuild() {
  const long: Array<[string, string]> = [
    ["APAC", "delivered"], ["EU", "shipped"], ["US", "pending"], ["EU", "delivered"], ["LATAM", "delivered"],
  ];
  const flags: Array<[string, number, number]> = [
    ["delivered", 1, 0], ["shipped", 0, 1], ["pending", 0, 0], ["delivered", 1, 0], ["pending", 0, 0],
  ];
  const matrix: Array<[string, number, number, number]> = [
    ["APAC", 21, 8, 37], ["EU", 24, 12, 45], ["LATAM", 2, 0, 2], ["US", 5, 10, 19],
  ];
  return (
    <svg
      viewBox="0 0 720 300"
      className="w-full"
      role="img"
      aria-label="The pivot built in three stages: long region-status rows, 1/0 flag columns from CASE, collapsed into the region by status matrix"
    >
      <motion.g {...fade(0)}>
        <Label x={24} y={18} cls="fill-zinc-400" size={8}>
          SELECT c.region, SUM(CASE WHEN o.status=&apos;delivered&apos; THEN 1 ELSE 0 END) AS delivered, … FROM orders o JOIN customers c … GROUP BY c.region
        </Label>
      </motion.g>
      {/* stage 1 — long rows */}
      <motion.g {...fade(0.3)}>
        <Panel x={24} y={40} w={208} h={190} />
        <Label x={40} y={62} cls="fill-zinc-200" size={10}>① long rows</Label>
        <Label x={40} y={76} cls="fill-zinc-500" size={8}>103 × (region, status)</Label>
        {long.map(([r, s], i) => (
          <g key={i}>
            <Label x={40} y={96 + i * 17} cls="fill-zinc-300" size={9}>{r}</Label>
            <Label x={216} y={96 + i * 17} anchor="end" cls="fill-zinc-500" size={9}>{s}</Label>
          </g>
        ))}
        <Label x={40} y={216} cls="fill-zinc-600" size={8}>status buried in every row</Label>
      </motion.g>
      <motion.g {...fade(0.45)}><Arrow x1={236} y1={135} x2={256} y2={135} /></motion.g>
      {/* stage 2 — flag columns */}
      <motion.g {...fade(0.55)}>
        <Panel x={260} y={40} w={208} h={190} />
        <Label x={276} y={62} cls="fill-sky-300" size={10}>② flag columns</Label>
        <Label x={276} y={76} cls="fill-zinc-500" size={8}>CASE picks 1 or 0 per rule</Label>
        <Label x={276} y={96} cls="fill-zinc-500" size={8}>status</Label>
        <Label x={400} y={96} anchor="middle" cls="fill-sky-300" size={8}>del</Label>
        <Label x={444} y={96} anchor="middle" cls="fill-sky-300" size={8}>shp</Label>
        <line x1={272} y1={102} x2={452} y2={102} className="stroke-zinc-800" />
        {flags.map(([s, d, sh], i) => (
          <g key={i}>
            <Label x={276} y={120 + i * 17} cls="fill-zinc-300" size={9}>{s}</Label>
            <Label x={400} y={120 + i * 17} anchor="middle" size={9} cls={d ? "fill-sky-300" : "fill-zinc-600"}>{d}</Label>
            <Label x={444} y={120 + i * 17} anchor="middle" size={9} cls={sh ? "fill-sky-300" : "fill-zinc-600"}>{sh}</Label>
          </g>
        ))}
        <Label x={276} y={216} cls="fill-zinc-600" size={8}>SUM(flag) is the count</Label>
      </motion.g>
      <motion.g {...fade(0.7)}><Arrow x1={472} y1={135} x2={492} y2={135} /></motion.g>
      {/* stage 3 — the wide matrix */}
      <motion.g {...fade(0.8)}>
        <Panel x={496} y={40} w={198} h={190} cls="fill-zinc-900 stroke-emerald-400/40" />
        <Label x={512} y={62} cls="fill-emerald-300" size={10}>③ the matrix</Label>
        <Label x={512} y={96} cls="fill-zinc-400" size={8}>region</Label>
        <Label x={604} y={96} anchor="middle" cls="fill-zinc-400" size={8}>del</Label>
        <Label x={644} y={96} anchor="middle" cls="fill-zinc-400" size={8}>shp</Label>
        <Label x={678} y={96} anchor="middle" cls="fill-emerald-300" size={8}>tot</Label>
        <line x1={508} y1={102} x2={688} y2={102} className="stroke-zinc-800" />
        {matrix.map(([r, d, sh, t], i) => (
          <g key={r}>
            <Label x={512} y={122 + i * 24} cls="fill-zinc-200" size={9}>{r}</Label>
            <Label x={604} y={122 + i * 24} anchor="middle" cls="fill-zinc-300" size={9}>{d}</Label>
            <Label x={644} y={122 + i * 24} anchor="middle" cls="fill-zinc-300" size={9}>{sh}</Label>
            <Label x={678} y={122 + i * 24} anchor="middle" cls="fill-emerald-300" size={9}>{t}</Label>
          </g>
        ))}
        <Label x={512} y={216} cls="fill-zinc-600" size={8}>52 delivered · 103 total</Label>
      </motion.g>
      <motion.g {...fade(1)}>
        <Label x={24} y={262} cls="fill-zinc-400" size={10}>
          buckets rebuild the whole: 21+24+2+5 = 52 delivered · 37+45+2+19 = 103 total
        </Label>
        <Label x={24} y={278} cls="fill-zinc-600" size={9}>
          one conditional column per status, one GROUP BY, one scan — no spreadsheet needed
        </Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- lesson 24 — two passes, one query ---------------- */

function S16TwoStage() {
  const tiers = [
    ["high", "4", "Σ 22,121.70", "fill-emerald-300"],
    ["mid", "4", "Σ 6,911.67", "fill-teal-300"],
    ["low", "8", "Σ 5,799.91", "fill-zinc-300"],
  ] as const;
  const sample = [
    ["Alice", "7,262.35", "high", "fill-emerald-300"],
    ["Chloe", "2,667.93", "mid", "fill-teal-300"],
    ["Olivia", "444.80", "low", "fill-zinc-400"],
  ] as const;
  return (
    <svg
      viewBox="0 0 720 300"
      className="w-full"
      role="img"
      aria-label="Two passes, one query: the inner query maps each of 16 customers to a lifetime-value tier, the outer query groups the tiers"
    >
      <motion.g {...fade(0)}>
        <Label x={28} y={18} cls="fill-zinc-400" size={8}>
          SELECT tier, COUNT(*) AS customers FROM ( SELECT CASE WHEN SUM(o.total) &gt;= 3000 THEN &apos;high&apos; …
        </Label>
        <Label x={28} y={32} cls="fill-zinc-600" size={8}>
          … ELSE &apos;low&apos; END FROM orders o JOIN customers c … GROUP BY c.id ) GROUP BY tier — inner sums, outer counts
        </Label>
      </motion.g>
      <motion.g {...fade(0.25)}>
        <Panel x={24} y={48} w={150} h={180} />
        <Label x={40} y={70} cls="fill-zinc-200" size={10}>16 customers</Label>
        <Label x={40} y={84} cls="fill-zinc-500" size={8}>customers ⋈ orders</Label>
        <DotField n={16} cols={4} x0={44} y0={104} gap={24} r={3.4} />
        <Label x={40} y={196} cls="fill-zinc-600" size={8}>GROUP BY c.id —</Label>
        <Label x={40} y={210} cls="fill-zinc-600" size={8}>one spend total each</Label>
      </motion.g>
      <g><Link x1={178} y1={138} x2={210} y2={138} cls="stroke-zinc-600" w={1.3} delay={0.5} /></g>
      <motion.g {...fade(0.55)}>
        <Panel x={214} y={48} w={236} h={180} />
        <Label x={230} y={70} cls="fill-sky-300" size={10}>inner pass — classify</Label>
        <Label x={230} y={84} cls="fill-zinc-500" size={8}>SUM(o.total) per customer, then the CASE</Label>
        {sample.map(([name, spend, tier, tc], i) => (
          <g key={name}>
            <Label x={230} y={108 + i * 24} cls="fill-zinc-300" size={9}>{name}</Label>
            <Label x={330} y={108 + i * 24} anchor="end" cls="fill-zinc-400" size={9}>{spend}</Label>
            <Label x={344} y={108 + i * 24} cls="fill-zinc-600" size={9}>→</Label>
            <Label x={434} y={108 + i * 24} anchor="end" cls={tc} size={9}>{tier}</Label>
          </g>
        ))}
        <Label x={230} y={184} cls="fill-zinc-500" size={8}>≥ 3000 → high · ≥ 1000 → mid · else low</Label>
        <Label x={230} y={202} cls="fill-zinc-600" size={8}>16 rows out — one per customer</Label>
      </motion.g>
      <g><Link x1={454} y1={138} x2={486} y2={138} cls="stroke-sky-400" w={1.3} delay={0.8} /></g>
      <motion.g {...fade(0.85)}>
        <Panel x={490} y={48} w={204} h={180} cls="fill-zinc-900 stroke-emerald-400/40" />
        <Label x={506} y={70} cls="fill-emerald-300" size={10}>outer pass — count</Label>
        <Label x={506} y={84} cls="fill-zinc-500" size={8}>GROUP BY tier</Label>
        {tiers.map(([name, n, sum, tc], i) => (
          <g key={name}>
            <Label x={506} y={110 + i * 36} cls={tc} size={9}>{name}</Label>
            <Label x={614} y={110 + i * 36} anchor="end" cls="fill-zinc-100" size={15}>{n}</Label>
            <Label x={678} y={110 + i * 36} anchor="end" cls="fill-zinc-500" size={8}>{sum}</Label>
          </g>
        ))}
        <Label x={506} y={216} cls="fill-zinc-600" size={8}>4 + 4 + 8 = 16 customers</Label>
      </motion.g>
      <motion.g {...fade(1.05)}>
        <Label x={28} y={262} cls="fill-zinc-400" size={10}>
          two stages, one query — SUM per customer first, classify with CASE, then GROUP BY the tiers outside
        </Label>
        <Label x={28} y={278} cls="fill-zinc-600" size={9}>
          aggregates cannot nest — a flat GROUP BY cannot count a SUM it is still computing
        </Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- registry ---------------- */

export const FIGURES_M3: Partial<Record<FigureId, () => React.JSX.Element>> = {
  "s9-union-vs-all": S9UnionVsAll,
  "s10-position-binding": S10PositionBinding,
  "s11-both-sides": S11BothSides,
  "s12-except-audit": S12ExceptAudit,
  "s13-eval-order": S13EvalOrder,
  "s14-row-router": S14RowRouter,
  "s15-pivot-build": S15PivotBuild,
  "s16-two-stage": S16TwoStage,
};
