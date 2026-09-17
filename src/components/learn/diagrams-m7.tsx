"use client";

// Module 7 lesson figures (lessons 41–44) — the write toolkit:
// INSERT's column/value contract, UPDATE's WHERE sweep, DELETE's scope and
// the foreign-key fence, and the upsert fork. Same drawing kit as every
// module; registry merged in diagrams.tsx. All numbers seed-verified
// (scripts/facts-m78.ts, facts-m78b.ts).

import { motion } from "framer-motion";
import type { FigureId } from "@/lib/curriculum/types";
import { Label, Pipe, Panel, XMark, fade } from "./diagrams-kit";

/* ---------- lesson 41 intro — INSERT: the positional contract ---------- */

function W1InsertMap() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="INSERT binds the column list to the value list positionally: six named columns receive six values in order, the omitted id column gets engine-assigned 17, and RETURNING echoes the landed row">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>INSERT INTO customers (name, email, city, region, active, created_at)</Label>
        <Label x={26} y={38} cls="fill-zinc-500" size={9}>VALUES (&apos;Tara Singh&apos;, &apos;tara.singh@example.com&apos;, &apos;Mumbai&apos;, &apos;APAC&apos;, 1, &apos;2026-01-05&apos;) RETURNING id, name</Label>
      </motion.g>
      {/* column list card */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={58} w={218} h={168} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={80} cls="fill-zinc-400" size={10}>column list — the contract</Label>
        {["name", "email", "city", "region", "active", "created_at"].map((c, i) => (
          <g key={c}>
            <Label x={58} y={102 + i * 20} cls="fill-zinc-200" size={9}>{c}</Label>
            <circle cx={46} cy={98 + i * 20} r={2.5} className="fill-teal-400" />
          </g>
        ))}
        <Label x={42} y={216} cls="fill-zinc-500" size={8}>order is yours — keep VALUES in step</Label>
      </motion.g>
      {/* value list card */}
      <motion.g {...fade(0.35)}>
        <Panel x={476} y={58} w={218} h={168} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={492} y={80} cls="fill-zinc-400" size={10}>value list — position decides</Label>
        {["'Tara Singh'", "'tara.singh@…'", "'Mumbai'", "'APAC'", "1", "'2026-01-05'"].map((v, i) => (
          <g key={i}>
            <circle cx={678} cy={98 + i * 20} r={2.5} className="fill-teal-400" />
            <Label x={492} y={102 + i * 20} cls="fill-zinc-200" size={9}>{v}</Label>
          </g>
        ))}
      </motion.g>
      {/* binding arrows */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.g key={i} {...fade(0.5 + i * 0.05)}>
          <Pipe pts={[[244, 98 + i * 20], [476, 98 + i * 20]]} cls="stroke-teal-400/70" arrowAng={0} arrowCls="stroke-teal-400/70" />
        </motion.g>
      ))}
      {/* the omitted id column */}
      <motion.g {...fade(0.85)}>
        <Panel x={26} y={236} w={300} h={44} cls="fill-zinc-900 stroke-emerald-400/50" />
        <Label x={42} y={254} cls="fill-emerald-300" size={9}>id omitted → engine assigns max(id) + 1</Label>
        <Label x={42} y={270} cls="fill-zinc-300" size={9}>16 customers today, so Tara lands as id 17</Label>
      </motion.g>
      <motion.g {...fade(1)}>
        <Panel x={370} y={236} w={324} h={44} cls="fill-zinc-900 stroke-teal-400/60" />
        <Label x={386} y={254} cls="fill-teal-300" size={9}>RETURNING id, name →</Label>
        <Label x={386} y={270} cls="fill-zinc-100" size={9}>17 | Tara Singh — a write that answers back</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 42 intro — UPDATE: the WHERE sweep ---------- */

function W2UpdateSweep() {
  const dots = Array.from({ length: 16 }, (_, i) => {
    const cx = 386 + (i % 8) * 38;
    const cy = 118 + Math.floor(i / 8) * 34;
    // wearables are product ids 12 (Fitness Band X2) and 13 (Smart Watch S) → positions 11, 12
    const wearable = i === 11 || i === 12;
    return { cx, cy, wearable };
  });
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="UPDATE products SET price = price times 1.1 WHERE category equals Wearables sweeps exactly two of sixteen rows: Fitness Band X2 becomes 86.90 and Smart Watch S becomes 219.99, while without a WHERE all sixteen would be swept">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>UPDATE products SET price = price * 1.1 WHERE category = &apos;Wearables&apos;</Label>
      </motion.g>
      {/* statement anatomy */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={44} w={300} h={92} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={66} cls="fill-violet-300" size={9}>SET price = price * 1.1</Label>
        <Label x={42} y={84} cls="fill-zinc-300" size={8}>the expression reads each row&apos;s OLD price…</Label>
        <Label x={42} y={100} cls="fill-zinc-300" size={8}>…and writes the result back in place</Label>
        <Label x={42} y={122} cls="fill-amber-300" size={8}>no WHERE → every row is swept. Always.</Label>
      </motion.g>
      {/* sweep result */}
      <motion.g {...fade(0.4)}>
        <Label x={386} y={102} cls="fill-zinc-400" size={10}>16 products — WHERE catches 2:</Label>
        {dots.map((d, i) => (
          <g key={i}>
            <circle cx={d.cx} cy={d.cy} r={7} className={d.wearable ? "fill-violet-400" : "fill-zinc-700"} />
            {d.wearable && <circle cx={d.cx} cy={d.cy} r={11} className="fill-none stroke-violet-300" strokeDasharray="3 3" />}
          </g>
        ))}
        <Label x={386} y={196} cls="fill-violet-300" size={9}>Fitness Band X2: 79.00 → 86.90</Label>
        <Label x={386} y={214} cls="fill-violet-300" size={9}>Smart Watch S: 199.99 → 219.99</Label>
      </motion.g>
      {/* in-place identity */}
      <motion.g {...fade(0.6)}>
        <Panel x={26} y={156} w={300} h={112} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={178} cls="fill-zinc-400" size={9}>what UPDATE does NOT do</Label>
        <Label x={42} y={198} cls="fill-zinc-300" size={8}>row count: still 16 — nothing added, nothing gone</Label>
        <Label x={42} y={214} cls="fill-zinc-300" size={8}>ids: unchanged — the same rows, new values</Label>
        <Label x={42} y={230} cls="fill-zinc-300" size={8}>other columns: untouched</Label>
        <Label x={42} y={252} cls="fill-zinc-500" size={8}>RETURNING shows the after-state of every swept row</Label>
      </motion.g>
      {/* CASE branching note */}
      <motion.g {...fade(0.8)}>
        <Panel x={386} y={232} w={308} h={36} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={402} y={248} cls="fill-zinc-300" size={8}>SET can branch per row with CASE, and UPDATE … FROM</Label>
        <Label x={402} y={262} cls="fill-zinc-300" size={8}>pulls new values from another table — lesson 50 uses both</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <line x1={26} y1={280} x2={694} y2={280} className="stroke-zinc-800" />
        <Label x={26} y={296} cls="fill-zinc-400" size={9}>UPDATE rewrites in place — the WHERE clause is the only thing standing between you and all 16 rows.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 43 intro — DELETE: scope + the foreign-key fence ---------- */

function W3DeleteScope() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="DELETE FROM orders WHERE status equals cancelled removes exactly seven whole rows, but deleting a parent that children still reference hits the foreign-key fence — error 787 — so the twelve child order_items rows go first">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>DELETE FROM orders WHERE status = &apos;cancelled&apos;   -- 7 rows, whole rows only</Label>
      </motion.g>
      {/* the sweep */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={42} w={330} h={150} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={64} cls="fill-zinc-400" size={10}>103 orders — WHERE dooms 7</Label>
        {Array.from({ length: 40 }).map((_, i) => {
          const cx = 46 + (i % 10) * 31;
          const cy = 84 + Math.floor(i / 10) * 27;
          const cancelled = i >= 33;
          return cancelled
            ? <g key={i}><circle cx={cx} cy={cy} r={6} className="fill-rose-400/80" /><XMark x={cx} y={cy} cls="stroke-rose-200" s={3.4} delay={0.6} /></g>
            : <circle key={i} cx={cx} cy={cy} r={6} className="fill-zinc-700" />;
        })}
        <Label x={42} y={180} cls="fill-rose-300" size={9}>52 delivered · 30 shipped · 14 pending stay — 7 go</Label>
      </motion.g>
      {/* whole-row semantics */}
      <motion.g {...fade(0.45)}>
        <Panel x={386} y={42} w={308} h={150} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={402} y={64} cls="fill-zinc-400" size={9}>DELETE has no column list</Label>
        <Label x={402} y={86} cls="fill-zinc-300" size={8}>the row either stays or vanishes — entire</Label>
        <Label x={402} y={102} cls="fill-zinc-300" size={8}>RETURNING * prints what you just destroyed</Label>
        <Label x={402} y={126} cls="fill-amber-300" size={8}>the storefront&apos;s own &apos;cancelled&apos; status exists</Label>
        <Label x={402} y={142} cls="fill-amber-300" size={8}>because most shops prefer a soft delete:</Label>
        <Label x={402} y={158} cls="fill-amber-300" size={8}>mark the row, keep the history</Label>
        <Label x={402} y={180} cls="fill-zinc-500" size={8}>no WHERE → TRUNCATE-speed full wipe. All 103.</Label>
      </motion.g>
      {/* the FK fence */}
      <motion.g {...fade(0.65)}>
        <Panel x={26} y={208} w={440} h={76} cls="fill-zinc-900 stroke-rose-400/50" />
        <Label x={42} y={230} cls="fill-rose-300" size={9}>the foreign-key fence (error 787)</Label>
        <Label x={42} y={248} cls="fill-zinc-300" size={8}>order_items still points at 12 lines across those 7 orders —</Label>
        <Label x={42} y={264} cls="fill-zinc-300" size={8}>deleting a referenced parent fails until the children go first</Label>
        <Label x={42} y={278} cls="fill-zinc-500" size={7.5}>DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE status = &apos;cancelled&apos;)</Label>
      </motion.g>
      <motion.g {...fade(0.85)}>
        <Panel x={486} y={208} w={208} h={76} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={502} y={230} cls="fill-zinc-400" size={9}>order of operations</Label>
        <Label x={502} y={248} cls="fill-zinc-300" size={8}>1. delete the 12 child lines</Label>
        <Label x={502} y={264} cls="fill-zinc-300" size={8}>2. delete the 7 orders</Label>
        <Label x={502} y={278} cls="fill-zinc-500" size={8}>both inside one transaction</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 44 intro — the upsert fork + the transaction wrapper ---------- */

function W4UpsertFork() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="An upsert tries the insert path, and at the unique-key fork either stands down with DO NOTHING or updates with DO UPDATE SET stock equals stock plus 50: the Mechanical Keyboard K1 lands at 170 either way">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>INSERT INTO products (id, name, …, stock) VALUES (1, &apos;Mechanical Keyboard K1&apos;, …, 999)</Label>
        <Label x={26} y={38} cls="fill-zinc-500" size={9}>ON CONFLICT(id) DO UPDATE SET stock = stock + 50 RETURNING id, stock</Label>
      </motion.g>
      {/* entry */}
      <motion.g {...fade(0.2)}>
        <Panel x={26} y={62} w={170} h={64} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={42} y={86} cls="fill-zinc-300" size={9}>the arriving row</Label>
        <Label x={42} y={106} cls="fill-zinc-100" size={9}>id 1 · stock 999</Label>
      </motion.g>
      <motion.g {...fade(0.3)}>
        <Pipe pts={[[196, 94], [246, 94]]} cls="stroke-zinc-500" arrowAng={0} />
        <Panel x={250} y={70} w={130} h={48} cls="fill-zinc-900 stroke-zinc-600" />
        <Label x={266} y={90} cls="fill-zinc-300" size={8}>unique-key check</Label>
        <Label x={266} y={106} cls="fill-zinc-500" size={8}>id 1 exists?</Label>
      </motion.g>
      {/* fork: no collision */}
      <motion.g {...fade(0.45)}>
        <Pipe pts={[[315, 70], [315, 40], [420, 40]]} cls="stroke-emerald-400" arrowAng={0} arrowCls="stroke-emerald-400" />
        <Panel x={424} y={22} w={270} h={40} cls="fill-zinc-900 stroke-emerald-400/50" />
        <Label x={440} y={40} cls="fill-emerald-300" size={9}>no collision → plain INSERT path</Label>
        <Label x={440} y={54} cls="fill-zinc-300" size={8}>new row lands; changes = 1</Label>
      </motion.g>
      {/* fork: collision, DO NOTHING */}
      <motion.g {...fade(0.6)}>
        <Pipe pts={[[315, 118], [315, 148], [420, 148]]} cls="stroke-zinc-500" arrowAng={0} />
        <Panel x={424} y={74} w={270} h={40} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={440} y={92} cls="fill-zinc-300" size={9}>collision → DO NOTHING</Label>
        <Label x={440} y={106} cls="fill-zinc-500" size={8}>stands down silently; changes = 0 (INSERT OR IGNORE)</Label>
      </motion.g>
      {/* fork: collision, DO UPDATE */}
      <motion.g {...fade(0.75)}>
        <Pipe pts={[[315, 118], [315, 208], [420, 208]]} cls="stroke-teal-400" arrowAng={0} arrowCls="stroke-teal-400" />
        <Panel x={424} y={126} w={270} h={100} cls="fill-zinc-900 stroke-teal-400/60" />
        <Label x={440} y={148} cls="fill-teal-300" size={9}>collision → DO UPDATE SET …</Label>
        <Label x={440} y={166} cls="fill-zinc-200" size={9}>stock = stock + 50</Label>
        <Label x={440} y={184} cls="fill-zinc-300" size={8}>reads the EXISTING row&apos;s stock (120)…</Label>
        <Label x={440} y={200} cls="fill-zinc-300" size={8}>…170 after; changes = 1</Label>
        <Label x={440} y={216} cls="fill-zinc-500" size={8}>excluded.stock = the arriving 999, if you prefer it</Label>
      </motion.g>
      {/* transaction wrapper */}
      <motion.g {...fade(0.9)}>
        <Panel x={26} y={244} w={668} h={40} cls="fill-zinc-900 stroke-violet-400/50" />
        <Label x={42} y={262} cls="fill-violet-300" size={9}>the transaction wrapper — BEGIN → work → COMMIT, or ROLLBACK and it never happened</Label>
        <Label x={42} y={276} cls="fill-zinc-400" size={8}>the course grader wraps every write in one — real effect, then rollback. INSERT OR REPLACE DELETES the old row rather than updating it.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- registry ---------------- */

export const FIGURES_M7: Partial<Record<FigureId, () => React.JSX.Element>> = {
  "w1-insert-map": W1InsertMap,
  "w2-update-sweep": W2UpdateSweep,
  "w3-delete-scope": W3DeleteScope,
  "w4-upsert-fork": W4UpsertFork,
};
