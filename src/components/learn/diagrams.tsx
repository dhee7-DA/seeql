"use client";

// Interactive SQL diagrams — flat visual language: solid fills, 1px lines,
// no gradients, no glow. Every number shown is real (computed from the
// seeded storefront db by scripts/gen-expected.ts). Figures animate in via
// framer-motion and re-skin automatically because they paint with Tailwind
// palette utilities (which the theme engine redefines per theme).

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import type { FigureId } from "@/lib/curriculum/types";
import { FIGURES_M2 } from "./diagrams-m2";
import { FIGURES_M1X } from "./diagrams-m1x";
import { FIGURES_M3 } from "./diagrams-m3";
import { FIGURES_M4 } from "./diagrams-m4";
import { FIGURES_M5 } from "./diagrams-m5";
import { FIGURES_M6 } from "./diagrams-m6";
import { FIGURES_M7 } from "./diagrams-m7";
import { FIGURES_M8 } from "./diagrams-m8";
import { FIGURES_M9 } from "./diagrams-m9";
import { cn } from "@/lib/utils";

/* ---------------- shared bits ---------------- */

import {
  Arrow,
  DotField,
  Label,
  Link,
  MONO,
  Panel,
  Pipe,
  XMark,
  fade,
  rng,
} from "./diagrams-kit";

/* ---------------- figures ---------------- */

function L1Anatomy() {
  const cx = [200, 320, 470, 560];
  const rows = [
    ["1", "Alice Chen", "Berlin", "1"],
    ["2", "Bruno Silva", "São Paulo", "1"],
    ["3", "Chloe Dubois", "Lyon", "1"],
  ];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Anatomy of a table: rows, columns, primary key">
      <motion.g {...fade(0)}>
        <Panel x={130} y={54} w={500} h={196} />
        {["id", "name", "city", "active"].map((h, i) => (
          <Label key={h} x={cx[i]} y={80} anchor="middle" cls="fill-zinc-300">{h}</Label>
        ))}
        <line x1={130} y1={92} x2={630} y2={92} className="stroke-zinc-800" />
        {rows.map((r, ri) =>
          r.map((cell, ci) => (
            <g key={`${ri}-${ci}`}>
              <Label x={cx[ci]} y={118 + ri * 34} anchor="middle" cls={ci === 0 ? "fill-emerald-300" : "fill-zinc-400"}>
                {cell}
              </Label>
            </g>
          )),
        )}
        {/* row band */}
        <motion.rect {...fade(0.3)} x={134} y={98} width={492} height={30} rx={6} className="fill-emerald-400/10 stroke-emerald-400/60" />
        <Label x={126} y={117} anchor="end" cls="fill-emerald-300" size={10}>a row = one customer</Label>
        {/* column band */}
        <motion.rect {...fade(0.5)} x={434} y={62} width={72} height={184} rx={6} className="fill-teal-400/10 stroke-teal-400/60" />
        <Label x={470} y={270} anchor="middle" cls="fill-teal-300">a column — one attribute</Label>
        {/* PK flag */}
        <motion.g {...fade(0.7)}>
          <rect x={168} y={30} width={64} height={18} rx={4} className="fill-emerald-400" />
          <Label x={200} y={43} anchor="middle" cls="fill-[#052e1c]" size={10}>PK · unique</Label>
          <Arrow x1={200} y1={48} x2={200} y2={58} cls="stroke-emerald-400" />
          <Label x={620} y={43} anchor="end" cls="fill-zinc-500">customers</Label>
        </motion.g>
      </motion.g>
    </svg>
  );
}

function L2Projection() {
  const before = [
    ["1", "Mechanical Keyboard K1", "Electronics", "89.99", "120"],
    ["2", "Wireless Mouse M3", "Electronics", "34.50", "300"],
    ["4", "Noise-Canceling Headset", "Audio", "149.99", "60"],
    ["9", "HDMI 2.1 Cable 2m", "Accessories", "14.99", "500"],
  ];
  const after = [
    ["Mechanical Keyboard K1", "89.99"],
    ["Wireless Mouse M3", "34.50"],
    ["Noise-Canceling Headset", "149.99"],
    ["HDMI 2.1 Cable 2m", "14.99"],
  ];
  return (
    <svg viewBox="0 0 720 260" className="w-full" role="img" aria-label="Projection keeps only chosen columns">
      <motion.g {...fade(0)}>
        <Panel x={16} y={40} w={280} h={168} />
        <Label x={28} y={28} cls="fill-zinc-500">products · 5 columns</Label>
        {before.map((r, ri) =>
          r.map((c, ci) => (
            <Label key={`${ri}-${ci}`} x={ci === 1 ? 40 : 28 + [0, 0, 136, 206, 246][ci]} y={66 + ri * 34} cls={ci === 1 ? "fill-zinc-300" : "fill-zinc-500"} size={10}>
              {ci === 1 && c.length > 19 ? c.slice(0, 19) + "…" : c}
            </Label>
          )),
        )}
      </motion.g>
      <motion.g {...fade(0.35)}>
        <rect x={318} y={92} width={118} height={30} rx={6} className="fill-emerald-400/15 stroke-emerald-400/70" />
        <Label x={377} y={111} anchor="middle" cls="fill-emerald-300" size={10}>SELECT name, price</Label>
        <Arrow x1={300} y1={124} x2={314} y2={107} />
        <Arrow x1={440} y1={107} x2={454} y2={124} cls="stroke-emerald-400" />
      </motion.g>
      <motion.g {...fade(0.6)}>
        <Panel x={458} y={40} w={246} h={168} cls="fill-zinc-900 stroke-emerald-400/50" />
        <Label x={470} y={28} cls="fill-emerald-300">result · 2 columns, same rows</Label>
        {after.map((r, ri) => (
          <g key={ri}>
            <Label x={470} y={66 + ri * 34} cls="fill-zinc-300" size={10}>{r[0].length > 24 ? r[0].slice(0, 23) + "…" : r[0]}</Label>
            <Label x={692} y={66 + ri * 34} anchor="end" cls="fill-zinc-400" size={10}>{r[1]}</Label>
          </g>
        ))}
      </motion.g>
    </svg>
  );
}

function L3WhereGate() {
  return (
    <svg viewBox="0 0 720 250" className="w-full" role="img" aria-label="WHERE filters rows: 103 orders in, 65 pass total > 200">
      <motion.g {...fade(0)}>
        <Label x={30} y={30} cls="fill-zinc-300">FROM orders</Label>
        <Label x={30} y={48} cls="fill-zinc-500" size={10}>103 rows</Label>
        <DotField n={103} cols={12} x0={30} y0={62} gap={16} />
      </motion.g>
      <motion.g {...fade(0.4)}>
        <rect x={280} y={92} width={132} height={44} rx={8} className="fill-zinc-900 stroke-emerald-400/70" />
        <Label x={346} y={110} anchor="middle" cls="fill-emerald-300" size={10}>WHERE</Label>
        <Label x={346} y={126} anchor="middle" cls="fill-zinc-200" size={11}>total &gt; 200</Label>
        <Arrow x1={228} y1={114} x2={276} y2={114} />
      </motion.g>
      <motion.g {...fade(0.8)}>
        <Label x={560} y={30} cls="fill-emerald-300">65 rows pass</Label>
        <g>
          {[...Array(65)].map((_, i) => (
            <circle key={i} cx={470 + (i % 9) * 16} cy={44 + Math.floor(i / 9) * 16} r={4} className="fill-emerald-400" opacity={0.85} />
          ))}
        </g>
        <Label x={470} y={216} cls="fill-zinc-500" size={10}>38 rows dropped — they never reach SELECT</Label>
        <Link x1={414} y1={106} x2={458} y2={54} cls="stroke-emerald-400" w={1.4} bend={0.65} delay={0.9} />
        <Link x1={414} y1={130} x2={458} y2={168} cls="stroke-zinc-700" w={1.3} bend={0.65} delay={1.05} />
        <Label x={466} y={192} cls="fill-zinc-600" size={10}>dropped</Label>
      </motion.g>
    </svg>
  );
}

function L3NullLogic() {
  const rows = [
    { expr: "shipped_at = NULL", res: "unknown", cls: "fill-amber-300" },
    { expr: "shipped_at != NULL", res: "unknown", cls: "fill-amber-300" },
    { expr: "shipped_at IS NULL", res: "true / false", cls: "fill-emerald-300" },
  ];
  return (
    <svg viewBox="0 0 720 250" className="w-full" role="img" aria-label="Three-valued logic: only IS NULL can match missing values">
      <motion.g {...fade(0)}>
        <Panel x={16} y={26} w={330} h={160} />
        <Label x={30} y={50} cls="fill-zinc-300">comparing against NULL</Label>
        {rows.map((r, i) => (
          <g key={i}>
            <Label x={30} y={82 + i * 34} cls="fill-zinc-400" size={11}>{r.expr}</Label>
            <Label x={332} y={82 + i * 34} anchor="end" cls={r.cls} size={11}>{r.res}</Label>
            {i < 2 && <line x1={30} y1={92 + i * 34} x2={332} y2={92 + i * 34} className="stroke-zinc-800" />}
          </g>
        ))}
        <Label x={16} y={214} cls="fill-zinc-500" size={10}>WHERE keeps only rows where the condition is definitely true — so = NULL matches nothing.</Label>
      </motion.g>
      <motion.g {...fade(0.5)}>
        <rect x={400} y={26} width={130} height={44} rx={8} className="fill-zinc-900 stroke-emerald-400/70" />
        <Label x={465} y={44} anchor="middle" cls="fill-emerald-300" size={10}>WHERE</Label>
        <Label x={465} y={60} anchor="middle" cls="fill-zinc-200" size={11}>shipped_at IS NULL</Label>
        <Label x={400} y={100} cls="fill-zinc-500" size={10}>103 orders</Label>
        <Arrow x1={536} y1={48} x2={570} y2={48} cls="stroke-emerald-400" />
        <rect x={576} y={26} width={128} height={44} rx={8} className="fill-emerald-400/10 stroke-emerald-400/60" />
        <Label x={640} y={44} anchor="middle" cls="fill-emerald-300" size={12}>21 rows</Label>
        <Label x={640} y={60} anchor="middle" cls="fill-zinc-500" size={9}>pending + cancelled</Label>
        <Arrow x1={536} y1={64} x2={570} y2={140} cls="stroke-zinc-700" />
        <rect x={576} y={118} width={128} height={44} rx={8} className="fill-zinc-900 stroke-zinc-800" />
        <Label x={640} y={136} anchor="middle" cls="fill-zinc-400" size={12}>82 rows</Label>
        <Label x={640} y={152} anchor="middle" cls="fill-zinc-500" size={9}>have a ship date</Label>
      </motion.g>
    </svg>
  );
}

function L4SortLimit() {
  const unsorted = [312.4, 945.21, 1088.44, 64.2, 845.92, 199.8, 421.05];
  const sorted = [...unsorted].sort((a, b) => b - a);
  const top3 = sorted.slice(0, 3);
  const colX = 300;
  const colX2 = 470;
  return (
    <svg viewBox="0 0 720 260" className="w-full" role="img" aria-label="ORDER BY sorts, LIMIT cuts the top of the sorted list">
      <motion.g {...fade(0)}>
        <Label x={30} y={34} cls="fill-zinc-300">totals as they come</Label>
        {unsorted.map((v, i) => (
          <g key={i}>
            <rect x={30} y={46 + i * 26} width={150} height={20} rx={4} className={top3.includes(v) ? "fill-emerald-400/15 stroke-emerald-400/60" : "fill-zinc-900 stroke-zinc-800"} />
            <Label x={170} y={60 + i * 26} anchor="end" cls="fill-zinc-400" size={10}>{v.toFixed(2)}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.4)}>
        <rect x={196} y={100} width={90} height={30} rx={6} className="fill-zinc-900 stroke-zinc-700" />
        <Label x={241} y={119} anchor="middle" cls="fill-zinc-300" size={9}>ORDER BY</Label>
        <Label x={241} y={131} anchor="middle" cls="fill-zinc-300" size={9}>total DESC</Label>
        <Arrow x1={186} y1={115} x2={192} y2={115} />
        <Arrow x1={288} y1={115} x2={294} y2={115} />
      </motion.g>
      <motion.g {...fade(0.6)}>
        <Label x={colX} y={34} cls="fill-zinc-300">sorted</Label>
        {sorted.map((v, i) => (
          <g key={i}>
            <rect x={colX} y={46 + i * 26} width={120} height={20} rx={4} className={i < 3 ? "fill-emerald-400/15 stroke-emerald-400/60" : "fill-zinc-900 stroke-zinc-800"} />
            <Label x={colX + 110} y={60 + i * 26} anchor="end" cls={i < 3 ? "fill-emerald-300" : "fill-zinc-500"} size={10}>{v.toFixed(2)}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.8)}>
        <rect x={560} y={70} width={70} height={30} rx={6} className="fill-zinc-900 stroke-rose-400/70" />
        <Label x={595} y={89} anchor="middle" cls="fill-rose-300" size={10}>LIMIT 3</Label>
        <Arrow x1={592} y1={100} x2={592} y2={118} cls="stroke-rose-400/80" />
        <Label x={colX2 + 40} y={34} cls="fill-emerald-300">top 3</Label>
        {top3.map((v, i) => (
          <g key={i}>
            <rect x={colX2} y={124 + i * 30} width={150} height={24} rx={5} className="fill-emerald-400/15 stroke-emerald-400/70" />
            <Label x={colX2 + 10} y={140 + i * 30} cls="fill-zinc-300" size={10}>order #{[74, 43, 39][i]}</Label>
            <Label x={colX2 + 140} y={140 + i * 30} anchor="end" cls="fill-emerald-300" size={10}>{v.toFixed(2)}</Label>
          </g>
        ))}
      </motion.g>
    </svg>
  );
}

const STATUS_CLS: Record<string, string> = {
  delivered: "fill-emerald-400",
  shipped: "fill-teal-400",
  pending: "fill-amber-400",
  cancelled: "fill-rose-400",
};

function L5Distinct() {
  // one tick per order (103), colored by status — then collapse
  const seq: string[] = [
    ...Array(52).fill("delivered"), ...Array(30).fill("shipped"),
    ...Array(14).fill("pending"), ...Array(7).fill("cancelled"),
  ];
  const rand = rng(11);
  const shuffled = seq
    .map((v) => ({ v, k: rand() }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.v);
  const unique: Array<[string, number]> = [
    ["delivered", 52], ["shipped", 30], ["pending", 14], ["cancelled", 7],
  ];
  return (
    <svg viewBox="0 0 720 250" className="w-full" role="img" aria-label="DISTINCT collapses 103 status values into the 4 that exist">
      <motion.g {...fade(0)}>
        <Label x={30} y={30} cls="fill-zinc-300">SELECT status FROM orders</Label>
        <Label x={30} y={48} cls="fill-zinc-500" size={10}>103 rows, only 4 different values</Label>
        {shuffled.map((s, i) => (
          <rect key={i} x={30 + (i % 26) * 9} y={62 + Math.floor(i / 26) * 14} width={6} height={10} rx={2} className={STATUS_CLS[s]} opacity={0.8} />
        ))}
      </motion.g>
      <motion.g {...fade(0.45)}>
        <rect x={300} y={100} width={96} height={32} rx={6} className="fill-zinc-900 stroke-emerald-400/70" />
        <Label x={348} y={120} anchor="middle" cls="fill-emerald-300" size={11}>DISTINCT</Label>
        <Arrow x1={286} y1={116} x2={296} y2={116} />
      </motion.g>
      <motion.g {...fade(0.7)}>
        <Label x={452} y={30} cls="fill-emerald-300">4 rows — one per value</Label>
        {unique.map(([s, n], i) => (
          <g key={s}>
            <rect x={452} y={44 + i * 40} width={238} height={32} rx={6} className="fill-zinc-900 stroke-zinc-800" />
            <rect x={462} y={53 + i * 40} width={14} height={14} rx={3} className={STATUS_CLS[s]} />
            <Label x={486} y={64 + i * 40} cls="fill-zinc-200" size={11}>{s}</Label>
            <Label x={680} y={64 + i * 40} anchor="end" cls="fill-zinc-500" size={10}>× {n}</Label>
          </g>
        ))}
      </motion.g>
    </svg>
  );
}

function L6Aggregate() {
  const stats: Array<[string, string]> = [
    ["COUNT(*)", "103"],
    ["SUM(total)", "34,833.28"],
    ["AVG(total)", "338.19"],
    ["MIN(total)", "25.47"],
    ["MAX(total)", "1,088.44"],
  ];
  return (
    <svg viewBox="0 0 720 240" className="w-full" role="img" aria-label="Aggregates collapse the whole table into one row">
      <motion.g {...fade(0)}>
        <Label x={30} y={34} cls="fill-zinc-300">FROM orders — 103 rows</Label>
        <DotField n={103} cols={11} x0={30} y0={52} gap={16} />
      </motion.g>
      <motion.g {...fade(0.4)}>
        <Arrow x1={225} y1={130} x2={278} y2={130} />
        <Label x={252} y={120} anchor="middle" cls="fill-zinc-500" size={9}>collapse</Label>
      </motion.g>
      <motion.g {...fade(0.7)}>
        <Panel x={284} y={60} w={410} h={150} cls="fill-zinc-900 stroke-emerald-400/50" />
        <Label x={302} y={88} cls="fill-emerald-300">one row out</Label>
        {stats.map(([k, v], i) => (
          <g key={k}>
            <Label x={302} y={114 + i * 20} cls="fill-zinc-400" size={11}>{k}</Label>
            <Label x={678} y={114 + i * 20} anchor="end" cls="fill-zinc-200" size={11}>{v}</Label>
            {i < 4 && <line x1={302} y1={120 + i * 20} x2={678} y2={120 + i * 20} className="stroke-zinc-800" />}
          </g>
        ))}
      </motion.g>
    </svg>
  );
}

function L7GroupBy() {
  const buckets: Array<[string, number, string]> = [
    ["delivered", 52, "fill-emerald-400"],
    ["shipped", 30, "fill-teal-400"],
    ["pending", 14, "fill-amber-400"],
    ["cancelled", 7, "fill-rose-400"],
  ];
  return (
    <svg viewBox="0 0 720 260" className="w-full" role="img" aria-label="GROUP BY splits rows into buckets, one result row per bucket">
      <motion.g {...fade(0)}>
        <Label x={30} y={34} cls="fill-zinc-300">103 rows</Label>
        <DotField n={103} cols={12} x0={30} y0={52} gap={16} />
        <Arrow x1={255} y1={140} x2={300} y2={140} />
        <Label x={278} y={128} anchor="middle" cls="fill-emerald-300" size={9}>GROUP BY</Label>
        <Label x={278} y={158} anchor="middle" cls="fill-zinc-500" size={9}>status</Label>
      </motion.g>
      <motion.g {...fade(0.5)}>
        {buckets.map(([s, n, cls], i) => {
          const bx = 324 + i * 96;
          const h = 12 + Math.round(n * 1.6);
          return (
            <g key={s}>
              <rect x={bx} y={190 - h} width={72} height={h} rx={5} className={cn(cls, "opacity-80")} />
              <Label x={bx + 36} y={206} anchor="middle" cls="fill-zinc-300" size={10}>{s}</Label>
              <Label x={bx + 36} y={222} anchor="middle" cls="fill-zinc-500" size={10}>n = {n}</Label>
              <Label x={bx + 36} y={196 - h} anchor="middle" cls="fill-zinc-400" size={11}>{n}</Label>
            </g>
          );
        })}
        <Label x={324} y={248} cls="fill-zinc-500" size={10}>COUNT(*) per bucket → one result row per status</Label>
      </motion.g>
    </svg>
  );
}

function useSteps(n: number) {
  const [step, setStep] = useState(0);
  return { step, next: () => setStep((s) => Math.min(n - 1, s + 1)), prev: () => setStep((s) => Math.max(0, s - 1)), setStep };
}

function L8WhereHaving() {
  const { step, next, prev } = useSteps(3);
  const buckets: Array<[string, number, string]> = [
    ["delivered", 52, "fill-emerald-400"],
    ["shipped", 30, "fill-teal-400"],
    ["pending", 14, "fill-amber-400"],
    ["cancelled", 7, "fill-rose-400"],
  ];
  return (
    <div>
      <svg viewBox="0 0 720 270" className="w-full" role="img" aria-label="The full pipeline: FROM, GROUP BY, HAVING">
        {/* FROM stage */}
        <g opacity={step === 0 ? 1 : 0.35}>
          <Label x={26} y={30} cls={step === 0 ? "fill-zinc-200" : "fill-zinc-500"}>① FROM orders — 103 rows</Label>
          <DotField n={103} cols={10} x0={26} y0={48} gap={14} />
        </g>
        {/* GROUP BY stage */}
        <g opacity={step === 1 ? 1 : step > 1 ? 0.7 : 0.3}>
          <Label x={288} y={30} cls={step === 1 ? "fill-zinc-200" : "fill-zinc-500"}>② GROUP BY status — buckets</Label>
          {buckets.map(([s, n, cls], i) => {
            const bx = 288 + i * 86;
            const h = 10 + Math.round(n * 1.5);
            return (
              <g key={s}>
                <rect x={bx} y={186 - h} width={64} height={h} rx={4} className={cn(cls, "opacity-80")} />
                <Label x={bx + 32} y={200} anchor="middle" cls="fill-zinc-400" size={9}>{s}</Label>
                <Label x={bx + 32} y={214} anchor="middle" cls="fill-zinc-500" size={10}>{n}</Label>
              </g>
            );
          })}
        </g>
        {/* HAVING stage */}
        <g opacity={step === 2 ? 1 : 0.3}>
          <Label x={288} y={240} cls={step === 2 ? "fill-zinc-200" : "fill-zinc-500"}>
            ③ HAVING COUNT(*) &gt; 10 — cancelled (7) is struck
          </Label>
          {step === 2 && (
            <g>
              <line x1={520} y1={168} x2={556} y2={120} className="stroke-rose-400" strokeWidth={2} />
              <line x1={556} y1={168} x2={520} y2={120} className="stroke-rose-400" strokeWidth={2} />
              <rect x={608} y={128} width={100} height={54} rx={7} className="fill-emerald-400/10 stroke-emerald-400/60" />
              <Label x={658} y={150} anchor="middle" cls="fill-emerald-300" size={11}>3 rows out</Label>
              <Label x={658} y={168} anchor="middle" cls="fill-zinc-500" size={9}>all but cancelled</Label>
            </g>
          )}
        </g>
        {/* progress rail */}
        <rect x={26} y={252} width={668} height={3} rx={1.5} className="fill-zinc-800" />
        <rect x={26} y={252} width={222 + step * 223} height={3} rx={1.5} className="fill-emerald-400" />
      </svg>
      <div className="mt-1 flex items-center justify-between">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className={cn("h-1.5 w-6 rounded-full", i <= step ? "bg-emerald-400" : "bg-zinc-800")} />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={prev} disabled={step === 0} className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 disabled:opacity-40">
            Back
          </button>
          <button onClick={next} disabled={step === 2} className="rounded-md bg-emerald-400 px-3 py-1.5 text-xs font-medium text-[#052e1c] hover:brightness-110 disabled:opacity-40">
            {step === 2 ? "Done" : "Next step"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- join figures (Module 2) ---------------- */

function RowCard({
  x,
  y,
  w,
  h,
  title,
  rows,
  cols,
  colX,
  highlight = [],
  accent = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  rows: string[][];
  cols: string[];
  colX: number[];
  highlight?: number[];
  accent?: boolean;
}) {
  return (
    <g>
      <Panel x={x} y={y} w={w} h={h} cls={accent ? "fill-zinc-900 stroke-emerald-400/50" : "fill-zinc-900 stroke-zinc-800"} />
      <Label x={x + 12} y={y - 8} cls={accent ? "fill-emerald-300" : "fill-zinc-500"} size={10}>{title}</Label>
      {cols.map((c, i) => (
        <Label key={c} x={x + colX[i]} y={y + 18} cls="fill-zinc-500" size={9}>{c}</Label>
      ))}
      <line x1={x} y1={y + 26} x2={x + w} y2={y + 26} className="stroke-zinc-800" />
      {rows.map((r, ri) => (
        <g key={ri} opacity={highlight.includes(ri) ? 1 : 0.85}>
          {highlight.includes(ri) && (
            <rect x={x + 2} y={y + 32 + ri * 24} width={w - 4} height={21} rx={4} className="fill-emerald-400/10 stroke-emerald-400/50" />
          )}
          {r.map((cell, ci) => (
            <Label
              key={ci}
              x={x + colX[ci]}
              y={y + 47 + ri * 24}
              cls={highlight.includes(ri) ? "fill-zinc-100" : ci === 0 ? "fill-zinc-300" : "fill-zinc-400"}
              size={10}
            >
              {cell}
            </Label>
          ))}
        </g>
      ))}
    </g>
  );
}

function J1FkLookup() {
  // real rows: order 1 → Pedro Alvarez (id 16), order 2 → Maya Patel (id 13),
  // order 3 → Alice Chen (id 1). Row band centers: y + 42.5 + ri * 24.
  const oy = 44; // orders card y
  const cy = 44; // customers card y
  const links = [
    { from: 0, to: 2, delay: 0.45 }, // order 1 → id 16 Pedro
    { from: 1, to: 1, delay: 0.62 }, // order 2 → id 13 Maya
    { from: 2, to: 0, delay: 0.79 }, // order 3 → id 1 Alice
  ];
  return (
    <svg viewBox="0 0 720 260" className="w-full" role="img" aria-label="JOIN follows the foreign key to look up rows in the other table">
      <motion.g {...fade(0)}>
        <RowCard
          x={30} y={oy} w={270} h={150} title="orders"
          cols={["id", "customer_id", "total"]} colX={[46, 130, 220]}
          rows={[
            ["1", "16", "576.54"],
            ["2", "13", "416.81"],
            ["3", "1", "767.64"],
          ]}
        />
        <RowCard
          x={430} y={cy} w={250} h={126} title="customers" accent
          cols={["id", "name", "city"]} colX={[16, 62, 190]}
          rows={[
            ["1", "Alice Chen", "Berlin"],
            ["13", "Maya Patel", "Mumbai"],
            ["16", "Pedro Alvarez", "Madrid"],
          ]}
        />
      </motion.g>
      <g>
        {links.map((l) => (
          <Link
            key={l.from}
            x1={300} y1={oy + 42.5 + l.from * 24}
            x2={426} y2={cy + 42.5 + l.to * 24}
            cls="stroke-emerald-400" w={1.4}
            dot="fill-emerald-400"
            bend={0.55}
            delay={l.delay}
          />
        ))}
      </g>
      <motion.g {...fade(1)}>
        <Label x={365} y={216} anchor="middle" cls="fill-emerald-300" size={10}>JOIN customers c ON c.id = o.customer_id</Label>
        <Label x={365} y={252} anchor="middle" cls="fill-zinc-500" size={10}>each order borrows one customer row at run time — follow the arrows</Label>
      </motion.g>
    </svg>
  );
}

function J2InnerMatch() {
  // real: order 1 → Pedro (LATAM), order 2 → Maya (APAC), order 80 → Dmitri (EU);
  // restricted to EU customers only order 80 survives.
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="INNER JOIN keeps only rows with a match on both sides">
      <motion.g {...fade(0)}>
        <RowCard
          x={30} y={48} w={230} h={174} title="orders"
          cols={["id", "customer_id"]} colX={[46, 150]}
          rows={[
            ["1", "16 · Pedro"],
            ["2", "13 · Maya"],
            ["80", "3 · Dmitri"],
          ]}
          highlight={[2]}
        />
        <RowCard
          x={460} y={48} w={220} h={126} title="customers · region = 'EU'" accent
          cols={["id", "name"]} colX={[16, 76]}
          rows={[
            ["1", "Alice Chen"],
            ["3", "Dmitri Volkov"],
          ]}
          highlight={[1]}
        />
      </motion.g>
      <motion.g {...fade(0.45)}>
        <Label x={374} y={90} anchor="middle" cls="fill-emerald-300" size={10}>JOIN … ON region = 'EU'</Label>
        <rect x={300} y={98} width={120} height={52} rx={8} className="fill-zinc-900 stroke-emerald-400/70" />
      </motion.g>
      {/* unmatched rows stop before the gate */}
      <g>
        <Link x1={260} y1={90.5} x2={287} y2={90.5} cls="stroke-zinc-600" w={1.3} dash="3 4" arrow={false} delay={0.6} />
        <Link x1={260} y1={114.5} x2={287} y2={114.5} cls="stroke-zinc-600" w={1.3} dash="3 4" arrow={false} delay={0.72} />
        <XMark x={293} y={90.5} cls="stroke-zinc-500" s={3.5} delay={0.95} />
        <XMark x={293} y={114.5} cls="stroke-zinc-500" s={3.5} delay={1.05} />
      </g>
      {/* the one matched pair flows through the gate */}
      <g>
        <Link x1={260} y1={138.5} x2={456} y2={114.5} cls="stroke-emerald-400" w={1.4} dot="fill-emerald-400" bend={0.5} delay={0.9} />
      </g>
      <motion.g {...fade(0.8)}>
        <Label x={30} y={252} cls="fill-zinc-500" size={10}>orders 1 and 2 have no EU match — INNER JOIN silently drops them</Label>
      </motion.g>
    </svg>
  );
}

function J3Chain() {
  return (
    <svg viewBox="0 0 720 250" className="w-full" role="img" aria-label="A three-table chain: order_items to orders to customers, plus products">
      <motion.g {...fade(0)}>
        <Panel x={24} y={70} w={140} h={84} cls="fill-zinc-900 stroke-emerald-400/50" />
        <Label x={38} y={62} cls="fill-emerald-300" size={10}>order_items</Label>
        <Label x={38} y={94} cls="fill-zinc-300" size={10}>id = 1</Label>
        <Label x={38} y={114} cls="fill-zinc-400" size={10}>order_id = 1</Label>
        <Label x={38} y={134} cls="fill-zinc-400" size={10}>product_id = 16</Label>

        <Panel x={230} y={70} w={140} h={84} />
        <Label x={244} y={62} cls="fill-zinc-500" size={10}>orders</Label>
        <Label x={244} y={94} cls="fill-zinc-300" size={10}>id = 1</Label>
        <Label x={244} y={114} cls="fill-zinc-400" size={10}>customer_id = 16</Label>
        <Label x={244} y={134} cls="fill-zinc-400" size={10}>status = delivered</Label>

        <Panel x={436} y={70} w={130} h={84} cls="fill-zinc-900 stroke-emerald-400/50" />
        <Label x={450} y={62} cls="fill-emerald-300" size={10}>customers</Label>
        <Label x={450} y={94} cls="fill-zinc-300" size={10}>id = 16</Label>
        <Label x={450} y={114} cls="fill-zinc-400" size={10}>Pedro Alvarez</Label>
        <Label x={450} y={134} cls="fill-zinc-400" size={10}>Madrid</Label>

        <Panel x={596} y={70} w={110} h={84} cls="fill-zinc-900 stroke-emerald-400/50" />
        <Label x={610} y={62} cls="fill-emerald-300" size={10}>products</Label>
        <Label x={610} y={94} cls="fill-zinc-300" size={10}>id = 16</Label>
        <Label x={610} y={114} cls="fill-zinc-400" size={10}>Yoga Mat</Label>
        <Label x={610} y={134} cls="fill-zinc-400" size={10}>Fitness</Label>
      </motion.g>
      <motion.g {...fade(0.5)}>
        <Arrow x1={168} y1={112} x2={226} y2={112} cls="stroke-emerald-400" />
        <Label x={197} y={100} anchor="middle" cls="fill-zinc-500" size={8}>ON o.id</Label>
        <Arrow x1={374} y1={112} x2={432} y2={112} cls="stroke-emerald-400" />
        <Label x={403} y={100} anchor="middle" cls="fill-zinc-500" size={8}>ON c.id</Label>
        <Pipe
          pts={[[94, 158], [94, 198], [651, 198], [651, 158]]}
          cls="stroke-zinc-500" w={1.3} dash="4 3"
          arrowAng={-Math.PI / 2} arrowCls="stroke-zinc-500"
          delay={0.7}
        />
        <Label x={372} y={190} anchor="middle" cls="fill-zinc-500" size={9}>ON p.id — the second link hangs off order_items</Label>
        <Label x={365} y={232} anchor="middle" cls="fill-zinc-400" size={10}>“which customer bought which product” = 3 hops, one query</Label>
      </motion.g>
    </svg>
  );
}

function J4LeftJoin() {
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="LEFT JOIN carries customers with no delivered order, filling the right side with NULL">
      <motion.g {...fade(0)}>
        <Label x={30} y={30} cls="fill-zinc-300">FROM customers — 16 rows</Label>
        <DotField n={16} cols={8} x0={30} y0={48} gap={18} />
        <Label x={430} y={30} cls="fill-zinc-500" size={10}>LEFT JOIN orders · status = 'delivered'</Label>
      </motion.g>
      <motion.g {...fade(0.4)}>
        {[
          ["Alice Chen", "12 delivered orders", false],
          ["Bruno Silva", "orders, none delivered*", true],
          ["Maya Patel", "orders, none delivered*", true],
          ["Liam O'Brien", "no match → NULL", true],
        ].map(([name, note, dim], i) => (
          <g key={i}>
            <rect x={30} y={118 + i * 36} width={330} height={28} rx={5} className={i === 3 ? "fill-zinc-900 stroke-emerald-400/60" : "fill-zinc-900 stroke-zinc-800"} strokeDasharray={i === 3 ? "4 3" : undefined} />
            <Label x={44} y={136 + i * 36} cls="fill-zinc-200" size={11}>{name}</Label>
            <Label x={348} y={136 + i * 36} anchor="end" cls={i === 3 ? "fill-emerald-300" : "fill-zinc-500"} size={9}>{note}</Label>
          </g>
        ))}
        <Label x={30} y={266} cls="fill-zinc-600" size={9}>* delivered counts vary — the point: the left row survives either way</Label>
      </motion.g>
      <motion.g {...fade(0.7)}>
        <rect x={430} y={196} width={250} height={56} rx={8} className="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={444} y={218} cls="fill-emerald-300" size={10}>Liam O'Brien | NULL | NULL | NULL</Label>
        <Label x={444} y={238} cls="fill-zinc-500" size={9}>kept, with the right side filled by NULL</Label>
        <Link x1={364} y1={240} x2={426} y2={224} cls="stroke-emerald-400" w={1.4} dot="fill-emerald-400" delay={0.85} />
      </motion.g>
    </svg>
  );
}

function J5AntiJoin() {
  return (
    <svg viewBox="0 0 720 260" className="w-full" role="img" aria-label="Anti-join: WHERE o.id IS NULL keeps only customers with no delivered order">
      <motion.g {...fade(0)}>
        <Label x={30} y={34} cls="fill-zinc-300">16 customers</Label>
        <DotField n={16} cols={4} x0={30} y0={52} gap={22} r={5} />
        <Arrow x1={140} y1={90} x2={216} y2={90} />
        <rect x={222} y={62} width={210} height={56} rx={8} className="fill-zinc-900 stroke-zinc-700" />
        <Label x={327} y={84} anchor="middle" cls="fill-zinc-300" size={10}>LEFT JOIN orders</Label>
        <Label x={327} y={102} anchor="middle" cls="fill-zinc-400" size={9}>ON customer_id AND status='delivered'</Label>
      </motion.g>
      <motion.g {...fade(0.45)}>
        <Arrow x1={436} y1={90} x2={496} y2={90} />
        <rect x={502} y={54} width={190} height={72} rx={8} className="fill-zinc-900 stroke-emerald-400/70" />
        <Label x={597} y={76} anchor="middle" cls="fill-emerald-300" size={10}>WHERE o.id IS NULL</Label>
        <Label x={597} y={94} anchor="middle" cls="fill-zinc-400" size={9}>“never matched”</Label>
        <Label x={597} y={112} anchor="middle" cls="fill-zinc-500" size={9}>the two-gate trick from lesson 8</Label>
      </motion.g>
      <motion.g {...fade(0.75)}>
        <rect x={30} y={150} width={330} height={84} rx={8} className="fill-emerald-400/5 stroke-emerald-400/50" />
        <Label x={46} y={176} cls="fill-emerald-300" size={11}>Result — 1 customer</Label>
        <Label x={46} y={200} cls="fill-zinc-200" size={11}>Liam O'Brien · 1 order · none delivered</Label>
        <Label x={46} y={222} cls="fill-zinc-500" size={9}>every other customer has at least one delivered order</Label>
        <rect x={400} y={150} width={290} height={84} rx={8} className="fill-zinc-900 stroke-zinc-800" />
        <Label x={416} y={176} cls="fill-zinc-300" size={10}>Change one word — status = 'shipped'</Label>
        <Label x={416} y={198} cls="fill-zinc-400" size={10}>→ 6 customers have nothing shipped</Label>
        <Label x={416} y={218} cls="fill-zinc-500" size={9}>same pattern answers “who is still waiting?”</Label>
      </motion.g>
    </svg>
  );
}

function J6SelfJoin() {
  const apac = ["Farid", "Grace", "Hiro", "Keiko", "Maya"];
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="Self-join pairs customers from the same region: 39 pairs in total">
      <motion.g {...fade(0)}>
        <Label x={30} y={34} cls="fill-zinc-300">FROM customers c1</Label>
        <Label x={400} y={34} cls="fill-zinc-300">JOIN customers c2</Label>
        <Label x={30} y={52} cls="fill-zinc-500" size={10}>the same table, two aliases</Label>
        {apac.map((n, i) => (
          <g key={n}>
            <rect x={30} y={68 + i * 36} width={120} height={26} rx={5} className="fill-zinc-900 stroke-zinc-800" />
            <Label x={42} y={85 + i * 36} cls="fill-zinc-300" size={10}>{n}</Label>
            <rect x={400} y={68 + i * 36} width={120} height={26} rx={5} className="fill-zinc-900 stroke-zinc-800" />
            <Label x={412} y={85 + i * 36} cls="fill-zinc-300" size={10}>{n}</Label>
          </g>
        ))}
        <Label x={30} y={266} cls="fill-zinc-500" size={9}>APAC members (5) — same list on both sides</Label>
      </motion.g>
      <motion.g {...fade(0.5)}>
        <Label x={275} y={60} anchor="middle" cls="fill-emerald-300" size={9}>ON c1.region = c2.region</Label>
        <Label x={275} y={75} anchor="middle" cls="fill-zinc-500" size={9}>AND c1.id &lt; c2.id</Label>
        {apac.flatMap((a, i) =>
          apac.map((b, j) => {
            if (i >= j) return null;
            const y1 = 81 + i * 36;
            const y2 = 81 + j * 36;
            const sag = 9 + (j - i) * 7;
            return (
              <g key={`${a}-${b}`}>
                <path
                  d={`M 152 ${y1} Q 274 ${Math.max(y1, y2) + sag} 396 ${y2}`}
                  className="stroke-emerald-400" strokeWidth={1} fill="none" opacity={0.5}
                />
                <circle cx={152} cy={y1} r={2.2} className="fill-emerald-400" opacity={0.75} />
                <circle cx={396} cy={y2} r={2.2} className="fill-emerald-400" opacity={0.75} />
              </g>
            );
          }),
        )}
        <Label x={275} y={254} anchor="middle" cls="fill-zinc-400" size={10}>5 × 5 grid, half kept → C(5,2) = 10 pairs</Label>
      </motion.g>
      <motion.g {...fade(0.8)}>
        <rect x={540} y={168} width={160} height={86} rx={8} className="fill-emerald-400/5 stroke-emerald-400/50" />
        <Label x={620} y={192} anchor="middle" cls="fill-emerald-300" size={16}>39 pairs</Label>
        <Label x={620} y={212} anchor="middle" cls="fill-zinc-400" size={9}>EU 28 · APAC 10</Label>
        <Label x={620} y={228} anchor="middle" cls="fill-zinc-400" size={9}>US 1 · LATAM 0</Label>
        <Label x={620} y={246} anchor="middle" cls="fill-zinc-500" size={9}>across the whole store</Label>
      </motion.g>
    </svg>
  );
}

function J7Fanout() {
  return (
    <svg viewBox="0 0 720 270" className="w-full" role="img" aria-label="Joining orders to order_items duplicates each order total — SUM inflates from 34,833 to 103,244">
      <motion.g {...fade(0)}>
        <Panel x={30} y={40} w={200} h={64} />
        <Label x={44} y={62} cls="fill-zinc-300" size={11}>orders · one row</Label>
        <Label x={44} y={84} cls="fill-zinc-400" size={10}>total = its own amount</Label>
      </motion.g>
      <motion.g {...fade(0.4)}>
        {["item A", "item B", "item C", "item D"].map((it, i) => (
          <g key={it}>
            <rect x={288} y={26 + i * 52} width={160} height={40} rx={6} className="fill-zinc-900 stroke-zinc-800" />
            <Label x={302} y={44 + i * 52} cls="fill-zinc-400" size={10}>{it} — one line</Label>
            <Label x={302} y={58 + i * 52} cls="fill-amber-300" size={9}>carries a copy of the order total</Label>
          </g>
        ))}
        {[0, 1, 2, 3].map((i) => (
          <Link
            key={i}
            x1={234} y1={72} x2={284} y2={46 + i * 52}
            cls="stroke-amber-400/80" w={1.3}
            dot="fill-amber-400" bend={0.6}
            delay={0.5 + i * 0.14}
          />
        ))}
        <Label x={259} y={244} anchor="middle" cls="fill-zinc-500" size={9}>the JOIN fans one order row out across its 4 items</Label>
      </motion.g>
      <motion.g {...fade(0.7)}>
        <Label x={496} y={40} cls="fill-zinc-300">SUM(o.total) after the join</Label>
        <rect x={496} y={52} width={150} height={110} rx={6} className="fill-amber-400/15 stroke-amber-400/60" />
        <Label x={571} y={114} anchor="middle" cls="fill-amber-200" size={12}>103,244.55</Label>
        <Label x={496} y={186} cls="fill-zinc-300">true revenue — SUM(orders.total)</Label>
        <rect x={496} y={198} width={48} height={26} rx={6} className="fill-emerald-400/20 stroke-emerald-400/60" />
        <Label x={620} y={216} anchor="end" cls="fill-emerald-300" size={11}>34,833.28</Label>
        <Label x={496} y={248} cls="fill-zinc-500" size={9}>≈ 3× inflated (251 items × 103 orders)</Label>
      </motion.g>
    </svg>
  );
}

function J8JoinAggregate() {
  const top = [
    ["Alice Chen", 7262.35, 24],
    ["Emma Wilson", 6640.56, 17],
    ["Grace Kim", 4574.23, 14],
    ["Maya Patel", 3644.56, 13],
  ] as const;
  const max = top[0][1];
  return (
    <svg viewBox="0 0 720 250" className="w-full" role="img" aria-label="Join customers to orders, group by customer, sum the totals: top 4 spenders">
      <motion.g {...fade(0)}>
        <Label x={30} y={30} cls="fill-zinc-300">customers JOIN orders</Label>
        <Label x={30} y={48} cls="fill-zinc-500" size={10}>103 order rows, each carrying its customer</Label>
        <DotField n={103} cols={12} x0={30} y0={62} gap={15} />
        <Arrow x1={250} y1={140} x2={296} y2={140} />
        <Label x={273} y={128} anchor="middle" cls="fill-emerald-300" size={9}>GROUP BY</Label>
        <Label x={273} y={158} anchor="middle" cls="fill-zinc-500" size={9}>customer</Label>
      </motion.g>
      <motion.g {...fade(0.5)}>
        <Label x={330} y={30} cls="fill-emerald-300">SUM(o.total) — top 4 of 16</Label>
        {top.map(([name, spend, orders], i) => (
          <g key={name}>
            <rect x={330} y={48 + i * 44} width={Math.round((spend / max) * 280)} height={30} rx={5} className="fill-emerald-400/15 stroke-emerald-400/60" />
            <Label x={340} y={67 + i * 44} cls="fill-zinc-200" size={10}>{name}</Label>
            <Label x={676} y={67 + i * 44} anchor="end" cls="fill-zinc-300" size={10}>{spend.toFixed(2)}</Label>
            <Label x={676} y={40 + i * 44} anchor="end" cls="fill-zinc-500" size={8}>{orders} orders</Label>
          </g>
        ))}
        <Label x={330} y={234} cls="fill-zinc-500" size={10}>16 groups out — one per customer, even those with a single order</Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- set-op & case figures (Module 3) ---------------- */

function Chip({
  x,
  y,
  w,
  h = 26,
  text,
  cls = "fill-zinc-900 stroke-zinc-800",
  textCls = "fill-zinc-300",
  size = 10,
  dash,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  text: string;
  cls?: string;
  textCls?: string;
  size?: number;
  dash?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} className={cls} strokeDasharray={dash} strokeWidth={1} />
      <Label x={x + w / 2} y={y + h / 2 + size * 0.35} anchor="middle" cls={textCls} size={size}>
        {text}
      </Label>
    </g>
  );
}

function S1Union() {
  return (
    <svg viewBox="0 0 720 270" className="w-full" role="img" aria-label="UNION ALL appends everything; UNION dedupes the pile to distinct rows">
      <motion.g {...fade(0)}>
        <Label x={26} y={34} cls="fill-zinc-300">SELECT status FROM orders</Label>
        <Label x={26} y={50} cls="fill-zinc-500" size={10}>103 rows, 4 distinct values</Label>
        <DotField n={103} cols={10} x0={26} y0={62} gap={13} r={3.4} />
      </motion.g>
      <g>
        <Link x1={168} y1={110} x2={296} y2={78} cls="stroke-emerald-400" w={1.4} dot="fill-emerald-400" bend={0.5} delay={0.45} />
        <Link x1={168} y1={150} x2={296} y2={172} cls="stroke-amber-400/80" w={1.4} dot="fill-amber-400" bend={0.5} delay={0.6} />
      </g>
      <motion.g {...fade(0.55)}>
        <rect x={302} y={46} width={392} height={58} rx={8} className="fill-zinc-900 stroke-emerald-400/60" />
        <Label x={318} y={68} cls="fill-emerald-300" size={11}>UNION ALL — pure append</Label>
        <Label x={318} y={90} cls="fill-zinc-400" size={10}>nothing inspected, nothing removed → every row kept</Label>
      </motion.g>
      <motion.g {...fade(0.75)}>
        <rect x={302} y={132} width={392} height={100} rx={8} className="fill-zinc-900 stroke-amber-400/60" />
        <Label x={318} y={154} cls="fill-amber-300" size={11}>UNION — dedupe pass</Label>
        {["cancelled", "delivered", "pending", "shipped"].map((s, i) => (
          <Chip key={s} x={318 + (i % 2) * 186} y={166 + Math.floor(i / 2) * 32} w={172} text={s} cls="fill-zinc-950 stroke-zinc-700" />
        ))}
        <XMark x={560} y={150} cls="stroke-amber-400/70" s={4} delay={1.05} />
        <XMark x={576} y={150} cls="stroke-amber-400/70" s={4} delay={1.15} />
        <XMark x={592} y={150} cls="stroke-amber-400/70" s={4} delay={1.25} />
      </motion.g>
      <motion.g {...fade(1)}>
        <Label x={30} y={240} cls="fill-zinc-500" size={10}>
          the same SELECT stacked on itself: ALL → 206 rows, UNION → 4 distinct statuses
        </Label>
        <Label x={30} y={258} cls="fill-zinc-600" size={9}>
          dedupe compares ENTIRE rows across and within arms — and costs a sort
        </Label>
      </motion.g>
    </svg>
  );
}

function S2StackLabels() {
  return (
    <svg viewBox="0 0 720 260" className="w-full" role="img" aria-label="Two source tables stack into one pile, each row tagged with a literal label column">
      <motion.g {...fade(0)}>
        <Panel x={26} y={44} w={176} h={92} />
        <Label x={40} y={64} cls="fill-emerald-300" size={10}>customers</Label>
        <Label x={40} y={88} cls="fill-zinc-300" size={11}>16 rows</Label>
        <Chip x={40} y={100} w={104} h={22} text="'customer' AS kind" cls="fill-emerald-400/10 stroke-emerald-400/50" textCls="fill-emerald-300" size={9} />
        <Panel x={26} y={154} w={176} h={76} />
        <Label x={40} y={174} cls="fill-emerald-300" size={10}>suppliers</Label>
        <Label x={40} y={196} cls="fill-zinc-300" size={11}>6 rows</Label>
        <Chip x={40} y={202} w={100} h={22} text="'supplier'" cls="fill-emerald-400/10 stroke-emerald-400/50" textCls="fill-emerald-300" size={9} />
      </motion.g>
      <g>
        <Pipe pts={[[202, 90], [248, 90], [248, 118], [296, 118]]} cls="stroke-emerald-400" w={1.4} arrowAng={0} delay={0.5} />
        <Pipe pts={[[202, 192], [248, 192], [248, 118], [296, 118]]} cls="stroke-emerald-400" w={1.4} arrowAng={0} delay={0.65} />
      </g>
      <motion.g {...fade(0.7)}>
        <rect x={300} y={52} width={394} height={140} rx={8} className="fill-zinc-900 stroke-zinc-700" />
        <Label x={314} y={72} cls="fill-zinc-500" size={9}>name</Label>
        <Label x={560} y={72} cls="fill-emerald-300" size={9}>kind ← from label</Label>
        <line x1={300} y1={80} x2={694} y2={80} className="stroke-zinc-800" />
        {[
          ["Alice Chen", "customer"],
          ["Nordic Gadgets AB", "supplier"],
          ["Maya Patel", "customer"],
        ].map(([n, k], i) => (
          <g key={n}>
            <Label x={314} y={102 + i * 26} cls="fill-zinc-300" size={10}>{n}</Label>
            <Label x={560} y={102 + i * 26} cls="fill-zinc-400" size={10}>{k}</Label>
            {i < 2 && <line x1={300} y1={110 + i * 26} x2={694} y2={110 + i * 26} className="stroke-zinc-800/70" />}
          </g>
        ))}
        <Label x={314} y={186} cls="fill-zinc-500" size={9}>22 rows in the pile — every row remembers its source</Label>
      </motion.g>
      <motion.g {...fade(1)}>
        <Label x={30} y={244} cls="fill-zinc-500" size={10}>
          stack first, summarize outside: wrap the pile in FROM, then GROUP BY kind
        </Label>
      </motion.g>
    </svg>
  );
}

function S3Intersect() {
  return (
    <svg viewBox="0 0 720 264" className="w-full" role="img" aria-label="INTERSECT keeps rows present in both sets: 4 customers overlap">
      <motion.g {...fade(0)}>
        <rect x={54} y={44} width={310} height={144} rx={10} className="fill-zinc-900 stroke-zinc-700" />
        <Label x={70} y={66} cls="fill-zinc-400" size={10}>delivered customers</Label>
        <Label x={70} y={118} cls="fill-zinc-200" size={22}>15</Label>
        <Label x={70} y={140} cls="fill-zinc-500" size={9}>every customer but Liam</Label>
        <rect x={356} y={44} width={310} height={144} rx={10} className="fill-zinc-900 stroke-zinc-700" />
        <Label x={480} y={66} cls="fill-zinc-400" size={10}>cancelled customers</Label>
        <Label x={480} y={118} cls="fill-zinc-200" size={22}>4</Label>
        <Label x={480} y={140} cls="fill-zinc-500" size={9}>ids 1 · 5 · 11 · 13</Label>
      </motion.g>
      <motion.g {...fade(0.45)}>
        <rect x={324} y={44} width={72} height={144} rx={10} className="fill-emerald-400/15 stroke-emerald-400/70" />
        <Label x={360} y={108} anchor="middle" cls="fill-emerald-300" size={22}>4</Label>
        <Label x={360} y={126} anchor="middle" cls="fill-emerald-300" size={9}>both</Label>
        <Label x={360} y={36} anchor="middle" cls="fill-emerald-300" size={10}>INTERSECT</Label>
      </motion.g>
      <motion.g {...fade(0.75)}>
        <rect x={54} y={204} width={612} height={44} rx={8} className="fill-emerald-400/5 stroke-emerald-400/50" />
        <Label x={70} y={222} cls="fill-emerald-300" size={10}>the overlap — Alice Chen · Emma Wilson · Keiko Sato · Maya Patel</Label>
        <Label x={70} y={240} cls="fill-zinc-500" size={9}>same 4 that INNER JOIN + DISTINCT finds — rows identical on ALL columns count once</Label>
      </motion.g>
    </svg>
  );
}

function S4Except() {
  return (
    <svg viewBox="0 0 720 264" className="w-full" role="img" aria-label="EXCEPT subtracts the second set from the first — asymmetric by design">
      <motion.g {...fade(0)}>
        <rect x={54} y={40} width={300} height={140} rx={10} className="fill-zinc-900 stroke-zinc-700" />
        <Label x={70} y={62} cls="fill-zinc-400" size={10}>delivered customers — 15</Label>
        <Label x={70} y={112} cls="fill-zinc-200" size={22}>11</Label>
        <Label x={70} y={134} cls="fill-zinc-500" size={9}>never had a cancellation</Label>
        <Label x={70} y={162} cls="fill-zinc-600" size={9}>15 − 4 overlap = 11 survive</Label>
      </motion.g>
      <motion.g {...fade(0.4)}>
        <rect x={354} y={40} width={200} height={140} rx={10} className="fill-zinc-900 stroke-amber-400/60" strokeDasharray="5 4" />
        <Label x={370} y={62} cls="fill-amber-300" size={10}>cancelled — 4</Label>
        <Label x={370} y={84} cls="fill-zinc-500" size={9}>the set being subtracted</Label>
        <Label x={370} y={112} cls="fill-amber-200" size={16}>− 4</Label>
        <Label x={370} y={134} cls="fill-zinc-500" size={9}>dashed: consumed, not kept</Label>
      </motion.g>
      <g>
        <Link x1={358} y1={110} x2={352} y2={110} cls="stroke-amber-400/70" w={1.3} arrow={false} dash="3 4" delay={0.6} />
      </g>
      <motion.g {...fade(0.7)}>
        <rect x={54} y={200} width={300} height={50} rx={8} className="fill-emerald-400/5 stroke-emerald-400/50" />
        <Label x={70} y={220} cls="fill-emerald-300" size={10}>delivered EXCEPT cancelled → 11</Label>
        <Label x={70} y={238} cls="fill-zinc-500" size={9}>completed history, never a cancellation</Label>
        <rect x={374} y={200} width={292} height={50} rx={8} className="fill-zinc-900 stroke-zinc-800" />
        <Label x={390} y={220} cls="fill-zinc-300" size={10}>cancelled EXCEPT delivered → 0</Label>
        <Label x={390} y={238} cls="fill-zinc-500" size={9}>all 4 also delivered — order matters</Label>
      </motion.g>
    </svg>
  );
}

function S5Precedence() {
  const { step, next, prev } = useSteps(3);
  const setChips = (
    <>
      <Chip x={40} y={60} w={150} text="A · delivered · 15" cls="fill-zinc-900 stroke-zinc-700" />
      <Chip x={210} y={60} w={140} text="B · cancelled · 4" cls="fill-zinc-900 stroke-zinc-700" />
      <Chip x={370} y={60} w={130} text="C · pending · 8" cls="fill-zinc-900 stroke-zinc-700" />
    </>
  );
  return (
    <div>
      <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="A UNION B INTERSECT C evaluates differently per engine: 8 rows in SQLite, 15 in the standard">
        {/* step 0 — the chain */}
        {step === 0 && (
          <g>
            <Label x={40} y={40} cls="fill-zinc-200">① A UNION B INTERSECT C — no parentheses, no hints</Label>
            {setChips}
            <Label x={40} y={124} cls="fill-zinc-500" size={10}>which operator binds first? the engines disagree — and the data disagrees with them</Label>
            <Label x={40} y={142} cls="fill-zinc-600" size={9}>on this store the two readings differ by 7 rows — this diagram proves it</Label>
          </g>
        )}
        {/* step 1 — SQLite */}
        {step === 1 && (
          <g>
            <Label x={40} y={40} cls="fill-zinc-200">② SQLite — equal precedence, left to right</Label>
            <Chip x={40} y={62} w={150} text="A · 15" cls="fill-zinc-900 stroke-zinc-700" />
            <Label x={200} y={79} anchor="middle" cls="fill-zinc-400" size={12}>∪</Label>
            <Chip x={220} y={62} w={130} text="B · 4" cls="fill-zinc-900 stroke-zinc-700" />
            <rect x={30} y={52} width={330} height={46} rx={9} className="fill-none stroke-zinc-500" strokeDasharray="4 3" />
            <Label x={375} y={79} anchor="middle" cls="fill-zinc-400" size={12}>∩</Label>
            <Chip x={400} y={62} w={120} text="C · 8" cls="fill-zinc-900 stroke-zinc-700" />
            <Link x1={530} y1={75} x2={576} y2={75} cls="stroke-emerald-400" w={1.4} delay={0.2} />
            <rect x={582} y={52} width={110} height={46} rx={8} className="fill-emerald-400/10 stroke-emerald-400/60" />
            <Label x={637} y={72} anchor="middle" cls="fill-emerald-300" size={14}>8</Label>
            <Label x={637} y={88} anchor="middle" cls="fill-zinc-500" size={8}>(A∪B)∩C</Label>
            <Label x={40} y={136} cls="fill-zinc-500" size={10}>verified on this db: ids 1 · 3 · 5 · 6 · 7 · 11 · 13 · 16 — delivered customers who also wait</Label>
          </g>
        )}
        {/* step 2 — standard */}
        {step === 2 && (
          <g>
            <Label x={40} y={40} cls="fill-zinc-200">③ Postgres · MySQL 8.0.31+ — INTERSECT binds tighter</Label>
            <Chip x={40} y={62} w={150} text="A · 15" cls="fill-zinc-900 stroke-zinc-700" />
            <Label x={200} y={79} anchor="middle" cls="fill-zinc-400" size={12}>∪</Label>
            <Chip x={220} y={62} w={130} text="B · 4" cls="fill-zinc-900 stroke-zinc-700" />
            <Label x={360} y={79} anchor="middle" cls="fill-zinc-400" size={12}>∩</Label>
            <Chip x={380} y={62} w={120} text="C · 8" cls="fill-zinc-900 stroke-zinc-700" />
            <rect x={210} y={52} width={300} height={46} rx={9} className="fill-none stroke-zinc-500" strokeDasharray="4 3" />
            <Label x={360} y={118} anchor="middle" cls="fill-zinc-500" size={9}>B ∩ C evaluated first = {`{1,5,11,13}`} — all inside A</Label>
            <Link x1={520} y1={75} x2={576} y2={75} cls="stroke-amber-400/80" w={1.4} delay={0.2} />
            <rect x={582} y={52} width={110} height={46} rx={8} className="fill-amber-400/10 stroke-amber-400/60" />
            <Label x={637} y={72} anchor="middle" cls="fill-amber-300" size={14}>15</Label>
            <Label x={637} y={88} anchor="middle" cls="fill-zinc-500" size={8}>A∪(B∩C)</Label>
            <Label x={40} y={136} cls="fill-zinc-500" size={10}>same query text: 8 rows here, 15 there — write the grouping you mean, every time</Label>
          </g>
        )}
        {/* the fix — always visible, brighter once both readings are known */}
        <motion.g {...fade(0.2)} opacity={step === 2 ? 1 : 0.6}>
          <rect x={40} y={168} width={640} height={74} rx={8} className="fill-zinc-900 stroke-zinc-800" />
          <Label x={56} y={190} cls="fill-emerald-300" size={10}>the portable spelling — each arm in its own FROM scope:</Label>
          <Label x={56} y={212} cls="fill-zinc-300" size={10}>SELECT * FROM (A UNION B) INTERSECT SELECT … C</Label>
          <Label x={56} y={230} cls="fill-zinc-500" size={9}>parses on SQLite (where bare parens around arms are a syntax error), Postgres and MySQL alike</Label>
        </motion.g>
        {/* progress rail */}
        <rect x={40} y={266} width={640} height={3} rx={1.5} className="fill-zinc-800" />
        <rect x={40} y={266} width={213 + step * 213} height={3} rx={1.5} className="fill-emerald-400" />
      </svg>
      <div className="mt-1 flex items-center justify-between">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className={cn("h-1.5 w-6 rounded-full", i <= step ? "bg-emerald-400" : "bg-zinc-800")} />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={prev} disabled={step === 0} className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 disabled:opacity-40">
            Back
          </button>
          <button onClick={next} disabled={step === 2} className="rounded-md bg-emerald-400 px-3 py-1.5 text-xs font-medium text-[#052e1c] hover:brightness-110 disabled:opacity-40">
            {step === 2 ? "Done" : "Next step"}
          </button>
        </div>
      </div>
    </div>
  );
}

function S6CaseSwitch() {
  const rows = [
    ["order 1", "delivered", 0],
    ["order 2", "shipped", 1],
    ["order 3", "pending", 2],
    ["order 4", "cancelled", 3],
  ] as const;
  const lanes = [
    ["done", "52 rows", "fill-emerald-400/10 stroke-emerald-400/60", "fill-emerald-300"],
    ["on its way", "30 rows", "fill-teal-400/10 stroke-teal-400/60", "fill-teal-300"],
    ["waiting", "14 rows", "fill-amber-400/10 stroke-amber-400/60", "fill-amber-300"],
    ["dead end", "7 rows", "fill-rose-400/10 stroke-rose-400/60", "fill-rose-300"],
  ] as const;
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="CASE evaluates branches top to bottom: first match wins, and a missing ELSE leaks NULL">
      <motion.g {...fade(0)}>
        {rows.map(([id, st], i) => (
          <g key={id}>
            <Chip x={26} y={44 + i * 44} w={180} h={30} text={`${id} · ${st}`} cls="fill-zinc-900 stroke-zinc-800" />
          </g>
        ))}
        <Label x={26} y={34} cls="fill-zinc-500" size={9}>FROM orders — one CASE per row</Label>
      </motion.g>
      <g>
        {rows.map((_, i) => (
          <Link key={i} x1={210} y1={59 + i * 44} x2={296} y2={104} cls="stroke-zinc-600" w={1.2} arrow={false} bend={0.45} delay={0.4 + i * 0.12} />
        ))}
      </g>
      <motion.g {...fade(0.7)}>
        <rect x={300} y={58} width={150} height={132} rx={10} className="fill-zinc-900 stroke-emerald-400/70" />
        <Label x={375} y={84} anchor="middle" cls="fill-emerald-300" size={11}>CASE</Label>
        <Label x={375} y={104} anchor="middle" cls="fill-zinc-400" size={9}>WHEN status = …</Label>
        <Label x={375} y={120} anchor="middle" cls="fill-zinc-400" size={9}>THEN value</Label>
        <Label x={375} y={140} anchor="middle" cls="fill-zinc-400" size={9}>… first match wins</Label>
        <Label x={375} y={162} anchor="middle" cls="fill-zinc-500" size={9}>ELSE — or NULL</Label>
        <Label x={375} y={182} anchor="middle" cls="fill-zinc-500" size={9}>END</Label>
      </motion.g>
      <g>
        {lanes.map((_, i) => (
          <Link key={i} x1={454} y1={104} x2={516} y2={70 + i * 44} cls="stroke-zinc-600" w={1.2} bend={0.45} delay={0.9 + i * 0.12} />
        ))}
      </g>
      <motion.g {...fade(1.1)}>
        {lanes.map(([name, n, cls, textCls], i) => (
          <g key={name}>
            <rect x={522} y={56 + i * 44} width={172} height={30} rx={6} className={cls} />
            <Label x={534} y={75 + i * 44} cls={textCls} size={10}>{name}</Label>
            <Label x={682} y={75 + i * 44} anchor="end" cls="fill-zinc-400" size={10}>{n}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(1.3)}>
        <Label x={26} y={252} cls="fill-zinc-500" size={10}>
          branches read top to bottom — reorder them and the 14 pending orders change label (lesson verified)
        </Label>
        <Label x={26} y={270} cls="fill-zinc-600" size={9}>
          drop the ELSE and 96 of 103 rows come out NULL — the quietest bug in reporting
        </Label>
      </motion.g>
    </svg>
  );
}

function S7CaseAgg() {
  const matrix: Array<[string, number, number, number, number, number]> = [
    ["APAC", 21, 8, 5, 3, 37],
    ["EU", 24, 12, 6, 3, 45],
    ["LATAM", 2, 0, 0, 0, 2],
    ["US", 5, 10, 3, 1, 19],
  ];
  const colX = [322, 448, 504, 560, 616, 664];
  return (
    <svg viewBox="0 0 720 270" className="w-full" role="img" aria-label="Conditional SUM counts every status in one pass: the region by status pivot">
      <motion.g {...fade(0)}>
        <Label x={26} y={34} cls="fill-zinc-300">FROM orders ⋈ customers — 103 rows, one scan</Label>
        <DotField n={103} cols={10} x0={26} y0={48} gap={13} r={3.4} />
        <Arrow x1={168} y1={130} x2={222} y2={130} />
        <Label x={195} y={118} anchor="middle" cls="fill-emerald-300" size={9}>SUM</Label>
        <Label x={195} y={148} anchor="middle" cls="fill-zinc-500" size={8}>CASE ×4</Label>
      </motion.g>
      <motion.g {...fade(0.5)}>
        <Panel x={300} y={40} w={394} h={168} cls="fill-zinc-900 stroke-emerald-400/40" />
        {["region", "del", "shp", "pnd", "cnc", "tot"].map((h, i) => (
          <Label key={h} x={colX[i]} y={62} cls={i === 0 ? "fill-zinc-400" : "fill-emerald-300"} size={9}>{h}</Label>
        ))}
        <line x1={300} y1={70} x2={694} y2={70} className="stroke-zinc-800" />
        {matrix.map((r, ri) => (
          <g key={r[0]}>
            {r.map((v, ci) => (
              <Label key={ci} x={colX[ci]} y={92 + ri * 26} cls={ci === 0 ? "fill-zinc-200" : "fill-zinc-400"} size={10}>
                {String(v)}
              </Label>
            ))}
            {ri < 3 && <line x1={300} y1={100 + ri * 26} x2={694} y2={100 + ri * 26} className="stroke-zinc-800/70" />}
          </g>
        ))}
        <Label x={300} y={226} cls="fill-zinc-500" size={10}>columns must add back to the whole: 52 + 30 + 14 + 7 = 103</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <Label x={26} y={248} cls="fill-zinc-500" size={10}>
          one conditional column per status — 103 rows become a 4 × 4 cross-tab in a single pass
        </Label>
      </motion.g>
    </svg>
  );
}

function S8Capstone() {
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="One report, three patterns: CASE tiers, a UNION ALL ledger with TOTAL, and an EXCEPT audit">
      <motion.g {...fade(0)}>
        <Label x={30} y={30} cls="fill-zinc-300">one report — segment · stack · audit</Label>
      </motion.g>
      <motion.g {...fade(0.3)}>
        <Panel x={30} y={46} w={204} h={178} />
        <Label x={44} y={68} cls="fill-emerald-300" size={10}>① CASE tiers</Label>
        {[
          ["high · ≥ 3,000", "4", "fill-emerald-400/15 stroke-emerald-400/50"],
          ["mid · ≥ 1,000", "4", "fill-teal-400/15 stroke-teal-400/50"],
          ["low", "8", "fill-zinc-900 stroke-zinc-700"],
        ].map(([t, n, cls], i) => (
          <g key={t}>
            <Chip x={44} y={82 + i * 44} w={132} h={30} text={t} cls={cls} />
            <Label x={190} y={102 + i * 44} anchor="end" cls="fill-zinc-200" size={12}>{n}</Label>
          </g>
        ))}
        <Label x={44} y={216} cls="fill-zinc-500" size={8}>Alice 7,262.35 leads the high tier</Label>
      </motion.g>
      <motion.g {...fade(0.55)}>
        <Panel x={258} y={46} w={204} h={178} />
        <Label x={272} y={68} cls="fill-emerald-300" size={10}>② ledger + TOTAL</Label>
        {[
          ["2024-12", "1,103.13"],
          ["2025-01", "724.11"],
          ["2025-02", "707.35"],
        ].map(([m, r], i) => (
          <g key={m}>
            <Label x={272} y={94 + i * 26} cls="fill-zinc-300" size={10}>{m}</Label>
            <Label x={448} y={94 + i * 26} anchor="end" cls="fill-zinc-400" size={10}>{r}</Label>
          </g>
        ))}
        <line x1={258} y1={176} x2={462} y2={176} className="stroke-emerald-400/50" />
        <Label x={272} y={196} cls="fill-emerald-300" size={10}>TOTAL</Label>
        <Label x={448} y={196} anchor="end" cls="fill-emerald-300" size={10}>15,571.07</Label>
        <Label x={272} y={216} cls="fill-zinc-500" size={8}>52 delivered orders pinned by UNION ALL</Label>
      </motion.g>
      <motion.g {...fade(0.8)}>
        <Panel x={486} y={46} w={204} h={178} cls="fill-zinc-900 stroke-amber-400/40" />
        <Label x={500} y={68} cls="fill-amber-300" size={10}>③ EXCEPT audit</Label>
        <Label x={500} y={94} cls="fill-zinc-400" size={9}>delivered-only category:</Label>
        <Label x={500} y={126} cls="fill-amber-200" size={18}>Apparel</Label>
        <Label x={500} y={150} cls="fill-zinc-500" size={9}>6 of 7 categories sit in both</Label>
        <Label x={500} y={168} cls="fill-zinc-500" size={9}>delivered and pending lists</Label>
        <Label x={500} y={216} cls="fill-zinc-500" size={8}>group first — fan-out contained</Label>
      </motion.g>
      <motion.g {...fade(1)}>
        <Label x={30} y={252} cls="fill-zinc-500" size={10}>
          three composable patterns — segment with CASE, stack with UNION ALL, audit with EXCEPT — cover most reports
        </Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- module 1 — second-wave figures ---------------- */

function L1SchemaMap() {
  const card = (x: number, y: number, name: string, n: string, key: string, keyCls: string, w = 150) => (
    <motion.g {...fade(0)}>
      <Panel x={x} y={y} w={w} h={72} />
      <Label x={x + 14} y={y + 22} cls="fill-zinc-100" size={12}>{name}</Label>
      <Label x={x + 14} y={y + 46} cls="fill-teal-300" size={15}>{n}</Label>
      <Label x={x + 14} y={y + 62} cls={keyCls} size={8.5}>{key}</Label>
    </motion.g>
  );
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="The storefront schema: five tables glued by four one-to-many foreign keys">
      {card(30, 60, "customers", "16 rows", "id — primary key", "fill-emerald-300")}
      {card(295, 60, "orders", "103 rows", "customer_id — foreign key", "fill-amber-300")}
      {card(555, 60, "order_items", "251 rows", "order_id · product_id", "fill-amber-300", 135)}
      {card(30, 196, "suppliers", "6 rows", "id — primary key", "fill-emerald-300")}
      {card(295, 196, "products", "16 rows", "supplier_id — foreign key", "fill-amber-300")}
      <Link x1={180} y1={88} x2={295} y2={88} cls="stroke-emerald-400/70" delay={0.3} />
      <Label x={237} y={78} anchor="middle" cls="fill-emerald-300" size={9}>1 : N</Label>
      <Link x1={445} y1={88} x2={555} y2={88} cls="stroke-emerald-400/70" delay={0.45} />
      <Label x={500} y={78} anchor="middle" cls="fill-emerald-300" size={9}>1 : N</Label>
      <Link x1={445} y1={222} x2={575} y2={118} cls="stroke-emerald-400/70" delay={0.6} />
      <Label x={502} y={162} anchor="middle" cls="fill-emerald-300" size={9}>1 : N</Label>
      <Link x1={180} y1={232} x2={295} y2={232} cls="stroke-emerald-400/70" delay={0.75} />
      <Label x={237} y={222} anchor="middle" cls="fill-emerald-300" size={9}>1 : N</Label>
      <motion.g {...fade(0.9)}>
        <Label x={30} y={40} cls="fill-zinc-500" size={9}>one customer places many orders — one order holds many lines — one supplier feeds many products</Label>
        <Label x={30} y={290} cls="fill-zinc-500" size={9.5}>five tables, four foreign keys — every query in this course walks some path across this map</Label>
      </motion.g>
    </svg>
  );
}

function L2ExprMath() {
  const rows = [
    { id: "1", qty: "3", price: "31.02", out: "93.06" },
    { id: "2", qty: "2", price: "15.15", out: "30.30" },
    { id: "3", qty: "1", price: "25.26", out: "25.26" },
  ];
  return (
    <svg viewBox="0 0 720 250" className="w-full" role="img" aria-label="The expression quantity times unit_price is evaluated once per row, producing line_total for each">
      <motion.g {...fade(0)}>
        <Label x={30} y={44} cls="fill-zinc-500">order_items</Label>
        <Panel x={30} y={54} w={210} h={148} />
        <Label x={58} y={76} cls="fill-zinc-500" size={9}>id</Label>
        <Label x={120} y={76} cls="fill-zinc-500" size={9}>quantity</Label>
        <Label x={226} y={76} anchor="end" cls="fill-zinc-500" size={9}>unit_price</Label>
        {rows.map((r, i) => (
          <g key={i}>
            <Label x={58} y={104 + i * 34} cls="fill-zinc-400">{r.id}</Label>
            <Label x={120} y={104 + i * 34} cls="fill-zinc-300">{r.qty}</Label>
            <Label x={226} y={104 + i * 34} anchor="end" cls="fill-zinc-300">{r.price}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.4)}>
        <rect x={296} y={98} width={148} height={58} rx={8} className="fill-zinc-900 stroke-sky-400/70" strokeWidth={1} />
        <Label x={370} y={122} anchor="middle" cls="fill-sky-300" size={10}>quantity * unit_price</Label>
        <Label x={370} y={140} anchor="middle" cls="fill-zinc-500" size={8}>evaluated once per row</Label>
        {[0, 1, 2].map((i) => (
          <Link key={`in${i}`} x1={244} y1={100 + i * 34} x2={292} y2={120} cls="stroke-zinc-600" arrow={i === 2} bend={0.5} delay={0.5 + i * 0.12} />
        ))}
        {[0, 1, 2].map((i) => (
          <Link key={`out${i}`} x1={448} y1={128} x2={486} y2={100 + i * 34} cls="stroke-sky-400/70" arrow={i === 2} bend={0.5} delay={0.7 + i * 0.12} />
        ))}
      </motion.g>
      <motion.g {...fade(0.6)}>
        <Label x={490} y={44} cls="fill-emerald-300">result — line_total</Label>
        <Panel x={490} y={54} w={200} h={148} cls="fill-zinc-900 stroke-emerald-400/50" />
        {rows.map((r, i) => (
          <g key={i}>
            <Label x={518} y={104 + i * 34} cls="fill-zinc-500">{r.id}</Label>
            <Label x={666} y={104 + i * 34} anchor="end" cls="fill-sky-300">{r.out}</Label>
          </g>
        ))}
        <Label x={490} y={222} cls="fill-zinc-500" size={9}>AS names the computed column</Label>
      </motion.g>
      <motion.g {...fade(0.8)}>
        <Label x={30} y={236} cls="fill-zinc-500" size={9.5}>quantity * unit_price AS line_total — one output value per row; the stored table is never touched</Label>
      </motion.g>
    </svg>
  );
}

function L3LikeMatch() {
  const names = [
    { t: "Mechanical Keyboard K1", hit: true },
    { t: "Wireless Mouse M3", hit: false },
    { t: "USB-C Hub 7-in-1", hit: false },
    { t: "Noise-Canceling Headset", hit: false },
    { t: "HDMI 2.1 Cable 2m", hit: false },
    { t: "Studio Desktop Mic", hit: false },
  ];
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="The pattern percent Keyboard percent matches one of sixteen product names, case-insensitively in SQLite">
      <motion.g {...fade(0)}>
        <rect x={30} y={36} width={176} height={30} rx={8} className="fill-zinc-900 stroke-amber-400/70" strokeWidth={1} />
        <Label x={118} y={55} anchor="middle" cls="fill-amber-200" size={13}>{"%Keyboard%"}</Label>
        <Label x={224} y={55} cls="fill-emerald-300" size={11}>matches 1 of 16 products</Label>
      </motion.g>
      <motion.g {...fade(0.3)}>
        {names.map((n, i) => {
          const y = 96 + i * 26;
          return (
            <g key={n.t}>
              {n.hit && <rect x={30} y={y - 14} width={420} height={22} rx={5} className="fill-emerald-400/10 stroke-emerald-400/60" strokeWidth={1} />}
              {!n.hit && <XMark x={44} y={y - 3} s={4} delay={0.5 + i * 0.08} />}
              {n.hit && (
                <path d={`M ${40} ${y - 3} l 4 4 l 7 -8`} fill="none" className="stroke-emerald-400" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
              )}
              <Label x={58} y={y} cls={n.hit ? "fill-zinc-100" : "fill-zinc-500"}>{n.t}</Label>
            </g>
          );
        })}
        <g>
          <Label x={122} y={76} cls="fill-amber-300" size={9}>% = anything</Label>
          <Label x={196} y={76} cls="fill-amber-300" size={9}>anything = %</Label>
          <line x1={130} y1={99} x2={186} y2={99} className="stroke-emerald-400" strokeWidth={2} strokeLinecap="round" />
        </g>
      </motion.g>
      <motion.g {...fade(0.6)}>
        <Panel x={500} y={84} w={190} h={118} />
        <Label x={514} y={106} cls="fill-zinc-300" size={10}>% any run of chars</Label>
        <Label x={514} y={124} cls="fill-zinc-300" size={10}>_ exactly one char</Label>
        <line x1={514} y1={136} x2={676} y2={136} className="stroke-zinc-800" />
        <Label x={514} y={156} cls="fill-sky-300" size={10}>{"%Desk% → 2 rows"}</Label>
        <Label x={514} y={174} cls="fill-zinc-500" size={8.5}>Studio Desktop Mic</Label>
        <Label x={514} y={188} cls="fill-zinc-500" size={8.5}>Desk Mat Extended</Label>
      </motion.g>
      <motion.g {...fade(0.8)}>
        <Label x={30} y={262} cls="fill-zinc-500" size={9.5}>SQLite&apos;s LIKE ignores case — &quot;%KEYBOARD%&quot; finds the same row; PostgreSQL&apos;s LIKE is case-sensitive (it offers ILIKE)</Label>
      </motion.g>
    </svg>
  );
}

function L4NullSpread() {
  const rows = [
    { id: "1", total: "576.54", ship: "NULL", hole: true },
    { id: "2", total: "416.81", ship: "2024-01-18", hole: false },
    { id: "3", total: "767.64", ship: "2024-01-26", hole: false },
  ];
  return (
    <svg viewBox="0 0 720 270" className="w-full" role="img" aria-label="COUNT star counts 103 rows, COUNT of shipped_at counts only 82 values because 21 orders have no ship date">
      <motion.g {...fade(0)}>
        <Label x={30} y={44} cls="fill-zinc-500">orders — the ship-date holes</Label>
        <Panel x={30} y={54} w={330} h={130} />
        <Label x={58} y={76} cls="fill-zinc-500" size={9}>id</Label>
        <Label x={110} y={76} cls="fill-zinc-500" size={9}>total</Label>
        <Label x={330} y={76} anchor="end" cls="fill-zinc-500" size={9}>shipped_at</Label>
        {rows.map((r, i) => (
          <g key={i}>
            <Label x={58} y={102 + i * 28} cls="fill-zinc-400">{r.id}</Label>
            <Label x={110} y={102 + i * 28} cls="fill-zinc-300">{r.total}</Label>
            <Label x={330} y={102 + i * 28} anchor="end" cls={r.hole ? "fill-amber-300" : "fill-zinc-300"}>{r.ship}</Label>
          </g>
        ))}
        <Label x={30} y={208} cls="fill-amber-300" size={9.5}>shipped_at + 0 → NULL — math that touches a hole returns a hole</Label>
      </motion.g>
      <motion.g {...fade(0.4)}>
        <Panel x={420} y={54} w={270} h={56} />
        <Label x={436} y={78} cls="fill-zinc-400" size={11}>COUNT(*)</Label>
        <Label x={674} y={82} anchor="end" cls="fill-zinc-200" size={17}>103</Label>
        <Label x={436} y={96} cls="fill-zinc-600" size={8.5}>every row counts, holes included</Label>
      </motion.g>
      <motion.g {...fade(0.6)}>
        <Panel x={420} y={128} w={270} h={56} cls="fill-zinc-900 stroke-emerald-400/50" />
        <Label x={436} y={152} cls="fill-zinc-400" size={11}>COUNT(shipped_at)</Label>
        <Label x={674} y={156} anchor="end" cls="fill-emerald-300" size={17}>82</Label>
        <Label x={436} y={170} cls="fill-zinc-600" size={8.5}>NULL rows are skipped by the aggregate</Label>
      </motion.g>
      <motion.g {...fade(0.8)}>
        {Array.from({ length: 103 }, (_, i) => (
          <rect key={i} x={30 + i * 6.4} y={226} width={5} height={14} rx={1}
            className={i % 5 === 0 ? "fill-amber-400/80" : "fill-zinc-600"} />
        ))}
        <Label x={30} y={256} cls="fill-zinc-500" size={9}>103 slots = COUNT(*)</Label>
        <Label x={690} y={256} anchor="end" cls="fill-amber-300/90" size={9}>21 amber slots = shipped_at IS NULL (14 pending + 7 cancelled)</Label>
      </motion.g>
    </svg>
  );
}

function L5MultiKeySort() {
  const eu = [
    { name: "Chloe Dubois", total: "945.21" },
    { name: "Alice Chen", total: "767.64" },
    { name: "Liam O'Brien", total: "705.39" },
  ];
  const apac = [
    { name: "Farid Nasser", total: "1,088.44" },
    { name: "Grace Kim", total: "826.03" },
    { name: "Grace Kim", total: "625.14" },
  ];
  const band = (x: number, title: string, cls: string, rows: Array<{ name: string; total: string }>, delay: number) => (
    <motion.g {...fade(delay)}>
      <Panel x={x} y={58} w={300} h={182} cls="fill-zinc-900 stroke-zinc-800" />
      <Label x={x + 16} y={82} cls={cls} size={10}>{title}</Label>
      {rows.map((r, i) => (
        <g key={i}>
          <Label x={x + 16} y={112 + i * 32} cls="fill-zinc-300">{r.name}</Label>
          <Label x={x + 284} y={112 + i * 32} anchor="end" cls="fill-emerald-200">{r.total}</Label>
        </g>
      ))}
      <Label x={x + 16} y={224} cls="fill-zinc-600" size={8.5}>… more orders below, same internal sort</Label>
    </motion.g>
  );
  return (
    <svg viewBox="0 0 720 290" className="w-full" role="img" aria-label="Two-key sort: region ascending forms the bands, total descending orders rows inside each band">
      <motion.g {...fade(0)}>
        <Label x={30} y={38} cls="fill-zinc-200" size={12}>ORDER BY region ASC, total DESC</Label>
        <Label x={690} y={38} anchor="end" cls="fill-sky-300" size={9.5}>key 2 · total DESC — sorts inside each band</Label>
        <Label x={30} y={52} cls="fill-violet-300" size={9.5}>key 1 · region ASC — decides which band a row lands in</Label>
      </motion.g>
      {band(30, "APAC — first band (A before E)", "fill-sky-300", apac, 0.3)}
      {band(390, "EU — second band", "fill-violet-300", eu, 0.5)}
      <motion.g {...fade(0.8)}>
        <Label x={30} y={266} cls="fill-zinc-500" size={9.5}>top 3 of each region shown — Grace Kim appears twice: she placed two APAC orders</Label>
        <Label x={30} y={282} cls="fill-zinc-600" size={9}>region sorts once, total re-sorts inside every band</Label>
      </motion.g>
    </svg>
  );
}

function L6DistinctMech() {
  const rows = [
    { t: "EU · Berlin", cls: "fill-sky-300" },
    { t: "LATAM · São Paulo", cls: "fill-teal-300" },
    { t: "EU · Lyon", cls: "fill-sky-300" },
    { t: "EU · Tallinn", cls: "fill-sky-300" },
    { t: "US · Austin", cls: "fill-amber-300" },
    { t: "APAC · Dubai", cls: "fill-violet-300" },
    { t: "APAC · Seoul", cls: "fill-violet-300" },
    { t: "APAC · Osaka", cls: "fill-violet-300" },
  ];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="DISTINCT region collapses sixteen customers into four regions, but region with city has no equal rows so all sixteen survive">
      <motion.g {...fade(0)}>
        <Label x={30} y={36} cls="fill-zinc-300" size={11}>SELECT DISTINCT region FROM customers</Label>
        {rows.map((r, i) => {
          const x = 30 + (i % 8) * 84;
          const y = i < 8 ? 50 : 78;
          return (
            <g key={r.t}>
              <rect x={x} y={y} width={78} height={20} rx={6} className="fill-zinc-900 stroke-zinc-800" strokeWidth={1} />
              <Label x={x + 39} y={y + 14} anchor="middle" cls={r.cls} size={8}>{r.t}</Label>
            </g>
          );
        })}
        <Label x={30} y={92} cls="fill-zinc-600" size={9}>+8 more regions in the table</Label>
        <Arrow x1={360} y1={106} x2={360} y2={128} cls="stroke-emerald-400" />
        <Label x={374} y={120} cls="fill-zinc-500" size={9}>equal rows merge</Label>
      </motion.g>
      <motion.g {...fade(0.4)}>
        {[
          { t: "APAC × 5", cls: "fill-violet-300 stroke-violet-400/60" },
          { t: "EU × 8", cls: "fill-sky-300 stroke-sky-400/60" },
          { t: "LATAM × 1", cls: "fill-teal-300 stroke-teal-400/60" },
          { t: "US × 2", cls: "fill-amber-300 stroke-amber-400/60" },
        ].map((c, i) => (
          <g key={c.t}>
            <rect x={30 + i * 96} y={138} width={88} height={24} rx={7} className={`fill-zinc-900 ${c.cls}`} strokeWidth={1} />
            <Label x={30 + i * 96 + 44} y={154} anchor="middle" cls={c.cls} size={10}>{c.t}</Label>
          </g>
        ))}
        <Label x={30 + 3 * 96 + 88 + 16} y={154} cls="fill-emerald-300" size={11}>16 rows → 4</Label>
      </motion.g>
      <motion.g {...fade(0.6)}>
        <Label x={30} y={204} cls="fill-zinc-300" size={11}>SELECT DISTINCT region, city</Label>
        <Label x={30} y={226} cls="fill-zinc-500" size={9.5}>same 16 rows, two columns — Berlin ≠ Lyon ≠ Tallinn … no two selected rows are equal</Label>
        <rect x={30} y={238} width={210} height={26} rx={7} className="fill-zinc-900 stroke-emerald-400/60" strokeWidth={1} />
        <Label x={135} y={255} anchor="middle" cls="fill-emerald-300" size={11}>16 rows → 16</Label>
      </motion.g>
      <motion.g {...fade(0.8)}>
        <Label x={30} y={290} cls="fill-zinc-500" size={9.5}>DISTINCT compares the whole selected row — widen the SELECT list and previously equal rows separate</Label>
      </motion.g>
    </svg>
  );
}

function L7CountStar() {
  const cards = [
    { label: "COUNT(*)", value: "103", cls: "fill-teal-300" },
    { label: "SUM(total)", value: "34,833.28", cls: "fill-emerald-300" },
    { label: "AVG(total)", value: "338.19", cls: "fill-sky-300" },
    { label: "MIN(total)", value: "25.47", cls: "fill-zinc-200" },
    { label: "MAX(total)", value: "1,088.44", cls: "fill-zinc-200" },
  ];
  return (
    <svg viewBox="0 0 720 260" className="w-full" role="img" aria-label="Five aggregates answer real storefront numbers, and COUNT star versus COUNT of shipped_at exposes the twenty-one NULL rows">
      <motion.g {...fade(0)}>
        <Label x={30} y={36} cls="fill-zinc-500" size={10}>SELECT COUNT(*), SUM(total), AVG(total), MIN(total), MAX(total) FROM orders</Label>
        {cards.map((c, i) => (
          <g key={c.label}>
            <Panel x={30 + i * 136} y={52} w={124} h={64} />
            <Label x={30 + i * 136 + 14} y={74} cls="fill-zinc-500" size={9}>{c.label}</Label>
            <Label x={30 + i * 136 + 14} y={100} cls={c.cls} size={c.value.length > 8 ? 14 : 16}>{c.value}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.4)}>
        <Label x={30} y={152} cls="fill-zinc-300" size={11}>COUNT(*) = 103  vs  COUNT(shipped_at) = 82</Label>
        {Array.from({ length: 103 }, (_, i) => (
          <rect key={i} x={30 + i * 6.4} y={164} width={5} height={14} rx={1}
            className={i % 5 === 0 ? "fill-amber-400/80" : "fill-zinc-600"} />
        ))}
        <Label x={30} y={198} cls="fill-zinc-500" size={9}>■ a row (82 with a ship date)</Label>
        <Label x={690} y={198} anchor="end" cls="fill-amber-300/90" size={9}>■ shipped_at IS NULL (21)</Label>
      </motion.g>
      <motion.g {...fade(0.7)}>
        <Label x={30} y={230} cls="fill-zinc-500" size={9.5}>COUNT(*) counts rows; COUNT(column) counts values — the 21 holes are pending + cancelled</Label>
        <Label x={30} y={246} cls="fill-zinc-600" size={9}>MIN and MAX ignore the holes too</Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- 3D figures ----------------
 * The three.js/fiber/drei chunk is only pulled when a lesson actually renders
 * one of these ids — figure-3d.tsx (and through it figures3d.tsx) is loaded
 * via next/dynamic with ssr:false, so the main lesson bundle stays light.
 * Devices without WebGL fall back to a note inside the host's boundary. */

const Figure3DHost = dynamic(() => import("./figure-3d"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full animate-pulse rounded-lg bg-zinc-900/60" aria-hidden />
  ),
});

const FIG3D_IDS = new Set<FigureId>([
  "j2-join-space-3d",
  "j12-left-space-3d",
  "l8-bins-space-3d",
  "t32-running-space-3d",
]);

/* ---------------- registry ---------------- */

const FIGURES: Partial<Record<FigureId, () => React.JSX.Element>> = {
  ...FIGURES_M1X,
  ...FIGURES_M2,
  ...FIGURES_M3,
  ...FIGURES_M4,
  ...FIGURES_M5,
  ...FIGURES_M6,
  ...FIGURES_M7,
  ...FIGURES_M8,
  ...FIGURES_M9,
  "l1-anatomy": L1Anatomy,
  "l2-projection": L2Projection,
  "l3-where-gate": L3WhereGate,
  "l3-null-logic": L3NullLogic,
  "l4-sort-limit": L4SortLimit,
  "l5-distinct": L5Distinct,
  "l6-aggregate": L6Aggregate,
  "l7-groupby": L7GroupBy,
  "l8-where-having": L8WhereHaving,
  "j1-fk-lookup": J1FkLookup,
  "j2-inner-match": J2InnerMatch,
  "j3-chain": J3Chain,
  "j4-left-join": J4LeftJoin,
  "j5-anti-join": J5AntiJoin,
  "j6-self-join": J6SelfJoin,
  "j7-fanout": J7Fanout,
  "j8-join-aggregate": J8JoinAggregate,
  "s1-union": S1Union,
  "s2-stack-labels": S2StackLabels,
  "s3-intersect": S3Intersect,
  "s4-except": S4Except,
  "s5-precedence": S5Precedence,
  "s6-case-switch": S6CaseSwitch,
  "s7-case-agg": S7CaseAgg,
  "s8-capstone": S8Capstone,
  "l1-schema-map": L1SchemaMap,
  "l2-expr-math": L2ExprMath,
  "l3-like-match": L3LikeMatch,
  "l4-null-spread": L4NullSpread,
  "l5-multikey-sort": L5MultiKeySort,
  "l6-distinct-mech": L6DistinctMech,
  "l7-count-star": L7CountStar,
};

export function hasFigure(id: FigureId): boolean {
  return id in FIGURES || FIG3D_IDS.has(id);
}

/** Diagram content without lesson chrome — used by the library grid, the
 * lightbox, the landing showcase and FigureFrame, which bring their own
 * frames/replay controls. 3D ids route to the dynamically-loaded host. */
export function FigureBare({ id }: { id: FigureId }) {
  if (FIG3D_IDS.has(id)) return <Figure3DHost id={id} />;
  const Cmp = FIGURES[id];
  if (!Cmp) return null;
  return <Cmp />;
}

export function Figure({ id }: { id: FigureId }) {
  const is3D = FIG3D_IDS.has(id);
  const Cmp = is3D ? null : FIGURES[id];
  if (!is3D && !Cmp) return null;
  return (
    <figure className="my-5 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-3">
      {is3D ? <Figure3DHost id={id} /> : Cmp ? <Cmp /> : null}
      <figcaption className="mt-2 border-t border-zinc-800 pt-2 text-[11px] text-zinc-500">
        {is3D
          ? "Interactive 3D scene — real numbers from the storefront database. Drag to orbit, scroll to zoom."
          : "Interactive diagram — real numbers from the storefront database."}
      </figcaption>
    </figure>
  );
}
