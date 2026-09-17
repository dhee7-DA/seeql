"use client";

// Module 1 figure wave (batch 9-a): lessons 1–3 — Foundations theory expansion.
// Same contract as every module file: 720-wide viewBox, kit primitives only,
// Tailwind palette classes (theme engine re-skins them), framer-motion fade
// reveals, and every number painted is real — verified against the seeded
// storefront (103 orders, 16 customers, 16 products, 6 suppliers).

import { motion } from "framer-motion";
import type { FigureId } from "@/lib/curriculum/types";
import { Arrow, DotField, Label, Panel, Pipe, fade } from "./diagrams-kit";

/* ---------------- figures (9-a owns everything below) ---------------- */

function L1DataTypes() {
  const rows: Array<[string, string, string]> = [
    ["id", "INTEGER", "7"],
    ["name", "TEXT", "'Alice Chen'"],
    ["price", "REAL", "79.0"],
    ["active", "INTEGER (0/1)", "1"],
    ["shipped_at", "TEXT or NULL", "NULL"],
  ];
  return (
    <svg viewBox="0 0 720 240" className="w-full" role="img" aria-label="One column, one type: each cell holds an integer, text, a decimal, a 0/1 flag, or NULL">
      <motion.g {...fade(0)}>
        <Label x={160} y={36} anchor="end" cls="fill-zinc-300">column</Label>
        <Label x={205} y={36} cls="fill-zinc-300">declared type</Label>
        <Label x={455} y={36} cls="fill-zinc-300">one cell holds</Label>
      </motion.g>
      {rows.map(([col, type, sample], i) => {
        const y = 52 + i * 34;
        const nullRow = sample === "NULL";
        return (
          <motion.g key={col} {...fade(0.12 * i)}>
            <Panel x={168} y={y} w={440} h={28} cls={nullRow ? "fill-zinc-900 stroke-amber-700/60" : "fill-zinc-900 stroke-zinc-800"} />
            <Label x={178} y={y + 18} cls="fill-zinc-400">{col}</Label>
            <Label x={205} y={y + 18} cls="fill-sky-400/80">{type}</Label>
            <Label x={455} y={y + 18} cls={nullRow ? "fill-amber-400" : "fill-zinc-200"}>{sample}</Label>
          </motion.g>
        );
      })}
      <motion.g {...fade(0.9)}>
        <Label x={360} y={232} anchor="middle" cls="fill-zinc-500" size={10}>the type belongs to the column — every cell plays by its rule; NULL means “no value yet”, not zero</Label>
      </motion.g>
    </svg>
  );
}

function L1PkAddress() {
  const orders: Array<[string, string, string]> = [
    ["3", "1", "767.64"],
    ["7", "1", "152.52"],
    ["13", "1", "632.29"],
    ["14", "1", "705.23"],
  ];
  return (
    <svg viewBox="0 0 720 240" className="w-full" role="img" aria-label="Foreign key lookup: orders keep only customer_id 1, which resolves to the one customers row Alice Chen, Berlin">
      <motion.g {...fade(0)}>
        <Label x={30} y={36} cls="fill-zinc-500" size={10}>orders · 103 rows</Label>
        <Panel x={30} y={44} w={250} h={152} />
        <Label x={64} y={64} anchor="middle" cls="fill-zinc-500" size={10}>id</Label>
        <Label x={150} y={64} anchor="middle" cls="fill-zinc-500" size={10}>customer_id</Label>
        <Label x={236} y={64} anchor="middle" cls="fill-zinc-500" size={10}>total</Label>
        <line x1={34} y1={72} x2={276} y2={72} className="stroke-zinc-800" />
      </motion.g>
      <motion.g {...fade(0.25)}>
        {orders.map(([id, cid, total], i) => (
          <g key={id}>
            <Label x={64} y={92 + i * 26} anchor="middle" cls="fill-zinc-500" size={10}>{id}</Label>
            <Label x={150} y={92 + i * 26} anchor="middle" cls="fill-emerald-300" size={10}>{cid}</Label>
            <Label x={236} y={92 + i * 26} anchor="middle" cls="fill-zinc-300" size={10}>{total}</Label>
          </g>
        ))}
        <rect x={112} y={54} width={76} height={124} rx={6} className="fill-emerald-400/10 stroke-emerald-400/50" />
        <Label x={30} y={214} cls="fill-zinc-600" size={9}>4 of 103 orders shown — all placed by customer 1</Label>
      </motion.g>
      <motion.g {...fade(0.55)}>
        <Label x={358} y={92} anchor="middle" cls="fill-sky-300" size={10}>{"customer_id = 1"}</Label>
        <Arrow x1={288} y1={116} x2={432} y2={96} cls="stroke-emerald-400" />
      </motion.g>
      <motion.g {...fade(0.8)}>
        <Label x={440} y={36} cls="fill-zinc-500" size={10}>customers · 16 rows</Label>
        <Panel x={440} y={44} w={250} h={68} />
        <Label x={478} y={62} anchor="middle" cls="fill-zinc-500" size={10}>id</Label>
        <Label x={560} y={62} anchor="middle" cls="fill-zinc-500" size={10}>name</Label>
        <Label x={652} y={62} anchor="middle" cls="fill-zinc-500" size={10}>city</Label>
        <line x1={444} y1={70} x2={686} y2={70} className="stroke-zinc-800" />
        <rect x={444} y={80} width={242} height={22} rx={6} className="fill-emerald-400/10 stroke-emerald-400/60" />
        <Label x={478} y={96} anchor="middle" cls="fill-emerald-300" size={10}>1</Label>
        <Label x={560} y={96} anchor="middle" cls="fill-zinc-100" size={10}>Alice Chen</Label>
        <Label x={652} y={96} anchor="middle" cls="fill-zinc-100" size={10}>Berlin</Label>
        <Label x={424} y={134} cls="fill-zinc-500" size={9.5}>name, city, email live here — not in the order</Label>
        <Label x={360} y={224} anchor="middle" cls="fill-zinc-500" size={10}>orders keep the number; the person is resolved on lookup — the idea joins are built on</Label>
      </motion.g>
    </svg>
  );
}

function L2StarExpand() {
  const cols: Array<[string, number]> = [
    ["id", 26], ["name", 52], ["email", 116], ["city", 188], ["region", 244], ["active", 296], ["created_at", 340],
  ];
  const rows: Array<string[]> = [
    ["1", "Alice Chen", "alice.chen@…", "Berlin", "EU", "1", "2023-11-02"],
    ["2", "Bruno Silva", "bruno.silva@…", "São Paulo", "LATAM", "1", "2023-11-17"],
    ["3", "Chloe Dubois", "chloe.dubois@…", "Lyon", "EU", "1", "2023-12-05"],
  ];
  const keep: Array<[string, string]> = [
    ["Alice Chen", "Berlin"],
    ["Bruno Silva", "São Paulo"],
    ["Chloe Dubois", "Lyon"],
  ];
  return (
    <svg viewBox="0 0 720 210" className="w-full" role="img" aria-label="SELECT star unfolds all seven columns of customers, while SELECT name, city keeps only two — same 16 rows either way">
      <motion.g {...fade(0)}>
        <Label x={16} y={28} cls="fill-sky-300" size={10.5}>SELECT * FROM customers</Label>
        <Panel x={16} y={40} w={384} h={104} />
        {cols.map(([h, x]) => (
          <Label key={h} x={x} y={58} cls="fill-zinc-500" size={9}>{h}</Label>
        ))}
        <line x1={20} y1={64} x2={396} y2={64} className="stroke-zinc-800" />
        {rows.map((r, ri) =>
          r.map((c, ci) => (
            <Label key={`${ri}-${ci}`} x={cols[ci][1]} y={82 + ri * 18} cls={ci === 0 ? "fill-zinc-600" : "fill-zinc-400"} size={9}>{c}</Label>
          )),
        )}
        <Label x={16} y={160} cls="fill-zinc-500" size={9.5}>the star unfolds all 7 columns — 16 rows come back, 3 shown</Label>
      </motion.g>
      <motion.g {...fade(0.35)}>
        <Arrow x1={404} y1={92} x2={424} y2={92} />
        <rect x={428} y={56} width={56} height={72} rx={8} className="fill-emerald-400/10 stroke-emerald-400/70" />
        <Label x={456} y={84} anchor="middle" cls="fill-emerald-200" size={9}>name</Label>
        <Label x={456} y={102} anchor="middle" cls="fill-emerald-200" size={9}>city</Label>
        <Arrow x1={488} y1={92} x2={512} y2={92} cls="stroke-emerald-400" />
      </motion.g>
      <motion.g {...fade(0.65)}>
        <Label x={516} y={28} cls="fill-emerald-300" size={10}>SELECT name, city FROM customers</Label>
        <Panel x={516} y={40} w={188} h={104} cls="fill-zinc-900 stroke-emerald-400/50" />
        <Label x={528} y={58} cls="fill-zinc-500" size={9}>name</Label>
        <Label x={692} y={58} anchor="end" cls="fill-zinc-500" size={9}>city</Label>
        <line x1={520} y1={64} x2={700} y2={64} className="stroke-zinc-800" />
        {keep.map(([n, c], ri) => (
          <g key={n}>
            <Label x={528} y={82 + ri * 18} cls="fill-zinc-300" size={9}>{n}</Label>
            <Label x={692} y={82 + ri * 18} anchor="end" cls="fill-zinc-400" size={9}>{c}</Label>
          </g>
        ))}
        <Label x={516} y={160} cls="fill-emerald-300/80" size={9.5}>only the named two pass the gate — same 16 rows</Label>
        <Label x={360} y={192} anchor="middle" cls="fill-zinc-500" size={10}>* drags out all 7 columns; a named list keeps exactly the two you asked for</Label>
      </motion.g>
    </svg>
  );
}

function L2AliasRename() {
  const totals = ["1088.44", "945.21", "845.92"];
  return (
    <svg viewBox="0 0 720 210" className="w-full" role="img" aria-label="SELECT total AS order_total: the output heading is renamed, the stored column and its values are untouched">
      <motion.g {...fade(0)}>
        <Label x={30} y={28} cls="fill-sky-300" size={10.5}>SELECT total AS order_total FROM orders</Label>
        <Label x={120} y={48} anchor="middle" cls="fill-zinc-500" size={9.5}>in the table</Label>
        <Panel x={60} y={56} w={120} h={112} />
        <Label x={120} y={76} anchor="middle" cls="fill-zinc-200" size={10.5}>total</Label>
        <line x1={64} y1={84} x2={176} y2={84} className="stroke-zinc-800" />
        {totals.map((t, i) => (
          <Label key={t} x={120} y={106 + i * 22} anchor="middle" cls="fill-zinc-300" size={10}>{t}</Label>
        ))}
        <Label x={120} y={182} cls="fill-zinc-600" size={8.5}>3 of 103 rows shown</Label>
      </motion.g>
      <motion.g {...fade(0.4)}>
        <Label x={221} y={100} anchor="middle" cls="fill-amber-300" size={11}>AS</Label>
        <Arrow x1={190} y1={112} x2={252} y2={112} cls="stroke-emerald-400" />
      </motion.g>
      <motion.g {...fade(0.6)}>
        <Label x={330} y={48} anchor="middle" cls="fill-emerald-300" size={9.5}>in the output</Label>
        <Panel x={264} y={56} w={132} h={112} cls="fill-zinc-900 stroke-emerald-400/50" />
        <Label x={330} y={76} anchor="middle" cls="fill-emerald-300" size={10.5}>order_total</Label>
        <line x1={268} y1={84} x2={392} y2={84} className="stroke-zinc-800" />
        {totals.map((t, i) => (
          <Label key={t} x={330} y={106 + i * 22} anchor="middle" cls="fill-zinc-300" size={10}>{t}</Label>
        ))}
      </motion.g>
      <motion.g {...fade(0.85)}>
        <Panel x={470} y={56} w={210} h={112} />
        <Label x={482} y={80} cls="fill-emerald-300" size={9.5}>renames:</Label>
        <Label x={482} y={96} cls="fill-zinc-200" size={9.5}>the heading of the output</Label>
        <Label x={482} y={122} cls="fill-zinc-500" size={9.5}>leaves alone:</Label>
        <Label x={482} y={138} cls="fill-zinc-400" size={9.5}>the stored column, the values,</Label>
        <Label x={482} y={154} cls="fill-zinc-400" size={9.5}>the table itself</Label>
        <Label x={360} y={196} anchor="middle" cls="fill-zinc-500" size={10}>the alias exists only in this query&apos;s output — inside the table it is still total</Label>
      </motion.g>
    </svg>
  );
}

function L3FilterFunnel() {
  return (
    <svg viewBox="0 0 720 200" className="w-full" role="img" aria-label="The WHERE funnel: 103 orders pour in, the condition total greater than 500 asks each row a yes or no question, 25 rows pass">
      <motion.g {...fade(0)}>
        <Label x={24} y={44} cls="fill-zinc-300" size={10.5}>FROM orders</Label>
        <Label x={24} y={58} cls="fill-zinc-500" size={9}>103 rows</Label>
        <DotField n={103} cols={26} x0={24} y0={66} gap={13} r={4} passFrom={25} />
      </motion.g>
      <motion.g {...fade(0.35)}>
        <circle cx={28} cy={137} r={4} className="fill-zinc-500" opacity={0.9} />
        <Label x={38} y={141} cls="fill-zinc-400" size={9}>25 pass the test</Label>
        <circle cx={140} cy={137} r={4} className="fill-zinc-700" opacity={0.55} />
        <Label x={150} y={141} cls="fill-zinc-600" size={9}>78 are dropped</Label>
        <Arrow x1={364} y1={94} x2={392} y2={94} />
        <rect x={398} y={72} width={132} height={44} rx={8} className="fill-zinc-900 stroke-emerald-400/70" />
        <Label x={464} y={90} anchor="middle" cls="fill-emerald-300" size={10}>WHERE</Label>
        <Label x={464} y={106} anchor="middle" cls="fill-zinc-200" size={11}>{"total > 500"}</Label>
      </motion.g>
      <motion.g {...fade(0.7)}>
        <Arrow x1={534} y1={94} x2={548} y2={94} cls="stroke-emerald-400" />
        <Label x={548} y={52} cls="fill-emerald-300" size={10}>25 rows out</Label>
        {[...Array(25)].map((_, i) => (
          <circle key={i} cx={552 + (i % 5) * 15} cy={68 + Math.floor(i / 5) * 15} r={4} className="fill-emerald-400" opacity={0.85} />
        ))}
        <Label x={360} y={186} anchor="middle" cls="fill-zinc-500" size={10}>103 in, 25 out — every row gets the same yes/no question; only TRUE survives the funnel</Label>
      </motion.g>
    </svg>
  );
}

function L3AndOr() {
  return (
    <svg viewBox="0 0 720 260" className="w-full" role="img" aria-label="OR widens: EU or APAC merges 8 plus 5 customers into 13. AND narrows: delivered and 2024 keeps 45 of 103 orders">
      <motion.g {...fade(0)}>
        <Label x={160} y={22} anchor="middle" cls="fill-sky-300" size={11}>OR — widens</Label>
        <rect x={56} y={32} width={208} height={22} rx={6} className="fill-zinc-900 stroke-sky-500/60" />
        <Label x={160} y={47} anchor="middle" cls="fill-sky-200" size={9}>{"region = 'EU' OR region = 'APAC'"}</Label>
        <Label x={540} y={22} anchor="middle" cls="fill-emerald-300" size={11}>AND — narrows</Label>
        <rect x={386} y={32} width={312} height={22} rx={6} className="fill-zinc-900 stroke-emerald-500/60" />
        <Label x={542} y={47} anchor="middle" cls="fill-emerald-200" size={9}>{"status = 'delivered' AND created_at LIKE '2024-%'"}</Label>
      </motion.g>
      <motion.g {...fade(0.3)}>
        <Panel x={24} y={76} w={80} h={64} />
        <Label x={64} y={88} anchor="middle" cls="fill-zinc-400" size={9.5}>EU · 8</Label>
        {[...Array(8)].map((_, i) => (
          <circle key={i} cx={40 + (i % 4) * 16} cy={104 + Math.floor(i / 4) * 16} r={4} className="fill-sky-400" opacity={0.85} />
        ))}
        <Panel x={24} y={148} w={80} h={64} />
        <Label x={64} y={160} anchor="middle" cls="fill-zinc-400" size={9.5}>APAC · 5</Label>
        {[...Array(5)].map((_, i) => (
          <circle key={i} cx={40 + (i % 3) * 16} cy={176 + Math.floor(i / 3) * 16} r={4} className="fill-sky-400" opacity={0.85} />
        ))}
        <Arrow x1={108} y1={108} x2={164} y2={122} cls="stroke-emerald-400" />
        <Arrow x1={108} y1={180} x2={164} y2={166} cls="stroke-emerald-400" />
        <Panel x={168} y={96} w={130} h={96} cls="fill-emerald-400/5 stroke-emerald-400/50" />
        <Label x={233} y={114} anchor="middle" cls="fill-emerald-300" size={10.5}>13 customers</Label>
        {[...Array(13)].map((_, i) => (
          <circle key={i} cx={188 + (i % 5) * 15} cy={130 + Math.floor(i / 5) * 15} r={4} className="fill-emerald-400" opacity={0.85} />
        ))}
        <Label x={233} y={228} anchor="middle" cls="fill-zinc-400" size={10}>{"8 + 5 = 13 — either match counts"}</Label>
      </motion.g>
      <motion.g {...fade(0.55)}>
        <Label x={372} y={90} cls="fill-zinc-300" size={10}>103 orders</Label>
        <Arrow x1={440} y1={86} x2={468} y2={86} />
        <rect x={474} y={68} width={140} height={36} rx={8} className="fill-zinc-900 stroke-zinc-700" />
        <Label x={544} y={90} anchor="middle" cls="fill-zinc-200" size={9.5}>{"status = 'delivered'"}</Label>
        <Arrow x1={618} y1={86} x2={644} y2={86} />
        <Label x={652} y={90} cls="fill-emerald-300" size={11}>52</Label>
        <Pipe pts={[[658, 98], [658, 130], [618, 130]]} cls="stroke-emerald-400" arrowAng={Math.PI} />
        <rect x={474} y={112} width={140} height={36} rx={8} className="fill-zinc-900 stroke-zinc-700" />
        <Label x={544} y={134} anchor="middle" cls="fill-zinc-200" size={8.5}>{"created_at LIKE '2024-%'"}</Label>
        <Arrow x1={468} y1={130} x2={440} y2={130} cls="stroke-emerald-400" />
        <Label x={434} y={134} anchor="end" cls="fill-emerald-300" size={11}>45 orders</Label>
        <Label x={544} y={172} anchor="middle" cls="fill-zinc-400" size={10}>{"103 → 52 → 45 — every AND is another gate"}</Label>
      </motion.g>
      <motion.g {...fade(0.85)}>
        <Label x={360} y={246} anchor="middle" cls="fill-zinc-500" size={10}>AND narrows, OR widens — mix them in one WHERE and parentheses decide the grouping</Label>
      </motion.g>
    </svg>
  );
}

export const FIGURES_M1A: Partial<Record<FigureId, () => React.JSX.Element>> = {
  "l1-data-types": L1DataTypes,
  "l1-pk-address": L1PkAddress,
  "l2-star-expand": L2StarExpand,
  "l2-alias-rename": L2AliasRename,
  "l3-filter-funnel": L3FilterFunnel,
  "l3-and-or": L3AndOr,
};
