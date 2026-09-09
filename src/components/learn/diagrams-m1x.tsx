"use client";

// Module 1 DEEP-DIVE figures (v1–v8) — the premium theory layer.
// Same visual language as diagrams.tsx: 720-wide viewBox, Tailwind palette
// classes, framer-motion reveals. Every number shown is real and was verified
// against the live storefront engine via scripts/m1-facts.ts.

import { motion } from "framer-motion";
import type { FigureId } from "@/lib/curriculum/types";
import { Arrow, Label, Panel, Pipe, XMark, fade, rng } from "./diagrams-kit";

/* ---------- shared local bits ---------- */

function Stage({ x, y, w, h, label, cls = "fill-zinc-900 stroke-zinc-800" }: { x: number; y: number; w: number; h: number; label: string; cls?: string }) {
  return (
    <g>
      <Panel x={x} y={y} w={w} h={h} cls={cls} />
      <Label x={x + w / 2} y={y - 7} anchor="middle" cls="fill-zinc-500" size={10}>
        {label}
      </Label>
    </g>
  );
}

/* ---------- v1 · grain zoom (L1) ---------- */

function V1GrainZoom() {
  const rand = rng(11);
  const dots: React.JSX.Element[] = [];
  for (let i = 0; i < 36; i++) {
    const cx = 44 + (i % 12) * 17 + rand() * 5 - 2.5;
    const cy = 84 + Math.floor(i / 12) * 17 + rand() * 5 - 2.5;
    dots.push(<circle key={i} cx={cx} cy={cy} r={4.5} className={i === 15 ? "fill-emerald-400" : "fill-zinc-600"} opacity={i === 15 ? 1 : 0.5} />);
  }
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Zooming from one order row into its order-item lines — table grain">
      {/* left: orders, many rows */}
      <motion.g {...fade(0)}>
        <Panel x={24} y={56} w={252} h={150} />
        <Label x={150} y={48} anchor="middle" cls="fill-zinc-300">orders · 103 rows · grain = one purchase event</Label>
        {dots}
        <Label x={150} y={232} anchor="middle" cls="fill-zinc-500" size={10}>id · customer_id · status · total · shipped_at</Label>
      </motion.g>
      {/* zoom lens on one row */}
      <motion.g {...fade(0.35)}>
        <rect x={30} y={138} width={58} height={14} rx={4} className="fill-emerald-400/15 stroke-emerald-400" strokeWidth={1.5} />
        <Label x={59} y={148} anchor="middle" cls="fill-emerald-300" size={9}>order #16</Label>
      </motion.g>
      <motion.g {...fade(0.5)}>
        <Pipe pts={[[96, 145], [180, 145], [258, 145]]} cls="stroke-emerald-400/80" w={1.6} arrowAng={0} arrowCls="stroke-emerald-400" delay={0.5} />
        <Label x={180} y={134} anchor="middle" cls="fill-emerald-300" size={10}>zoom into one row</Label>
      </motion.g>
      {/* right: exploded lines */}
      <motion.g {...fade(0.7)}>
        <Panel x={278} y={56} w={394} h={150} />
        <Label x={475} y={48} anchor="middle" cls="fill-zinc-300">order_items · 251 rows · grain = one product line</Label>
        {[
          ["16", "Wireless Keyboard", "1", "89.90"],
          ["16", "Gaming Mouse", "2", "39.50"],
          ["16", "USB-C Hub", "1", "34.00"],
        ].map((r, ri) => (
          <g key={ri}>
            <motion.rect {...fade(0.85 + ri * 0.12)} x={292} y={70 + ri * 42} width={366} height={34} rx={7} className={ri === 0 ? "fill-emerald-400/10 stroke-emerald-400/60" : "fill-zinc-900 stroke-zinc-800"} />
            {[
              ["order_id", 322],
              ["product", 448],
              ["qty", 540],
              ["unit_price", 614],
            ].map(([t, x]) => (
              <Label key={t as string} x={x as number} y={82 + ri * 42} anchor="middle" cls="fill-zinc-500" size={9}>
                {t as string}
              </Label>
            ))}
            {r.map((c, ci) => (
              <Label key={ci} x={[322, 448, 540, 614][ci]} y={95 + ri * 42} anchor="middle" cls={ci === 0 ? "fill-emerald-300" : "fill-zinc-300"} size={10}>
                {c}
              </Label>
            ))}
          </g>
        ))}
        <Label x={475} y={232} anchor="middle" cls="fill-zinc-500" size={10}>one order → as many line rows as products in the basket</Label>
      </motion.g>
      {/* takeaway rail */}
      <motion.g {...fade(1.15)}>
        <rect x={24} y={252} width={648} height={30} rx={7} className="fill-violet-400/10 stroke-violet-400/40" />
        <Label x={348} y={271} anchor="middle" cls="fill-violet-300">Every table has a grain. Before you aggregate, ask: what is ONE row here?</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- v2 · SELECT projection pipeline (L2) ---------- */

function V2SelectPipeline() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="FROM loads rows, SELECT projects columns — the pipeline runs FROM first">
      {/* input table */}
      <motion.g {...fade(0)}>
        <Stage x={20} y={64} w={170} h={168} label="customers · 16 rows × 6 cols" />
        {["id", "name", "city", "region", "active", "created_at"].map((h, ri) => (
          <g key={h}>
            <rect x={30} y={74 + ri * 26} width={150} height={22} rx={4} className={ri === 1 || ri === 2 ? "fill-emerald-400/15 stroke-emerald-400/70" : "fill-zinc-950 stroke-zinc-800"} />
            <Label x={105} y={89 + ri * 26} anchor="middle" cls={ri === 1 || ri === 2 ? "fill-emerald-300" : "fill-zinc-500"} size={10}>
              {h}
            </Label>
          </g>
        ))}
      </motion.g>
      {/* arrow */}
      <motion.g {...fade(0.25)}>
        <Arrow x1={196} y1={148} x2={238} y2={148} cls="stroke-zinc-500" />
        <Label x={217} y={136} anchor="middle" cls="fill-zinc-500" size={9}>FROM</Label>
      </motion.g>
      {/* projector */}
      <motion.g {...fade(0.4)}>
        <Stage x={244} y={64} w={216} h={168} label="SELECT — the column shrink ray" cls="fill-zinc-900 stroke-emerald-400/40" />
        <Label x={352} y={102} anchor="middle" cls="fill-zinc-400" size={11}>keep only what you name</Label>
        <rect x={258} y={118} width={188} height={26} rx={6} className="fill-zinc-950 stroke-zinc-800" />
        <Label x={352} y={135} anchor="middle" cls="fill-zinc-500" size={10}>name, city — 4 columns dropped</Label>
        <rect x={258} y={152} width={188} height={26} rx={6} className="fill-teal-400/10 stroke-teal-400/60" />
        <Label x={352} y={169} anchor="middle" cls="fill-teal-300" size={10}>region AS zone — rename on the way out</Label>
        <Label x={352} y={204} anchor="middle" cls="fill-zinc-500" size={10}>aliases shape the output, not the table</Label>
      </motion.g>
      {/* arrow */}
      <motion.g {...fade(0.6)}>
        <Arrow x1={466} y1={148} x2={508} y2={148} cls="stroke-zinc-500" />
      </motion.g>
      {/* output */}
      <motion.g {...fade(0.75)}>
        <Stage x={514} y={64} w={182} h={168} label="result · 16 rows × 2 cols" />
        <rect x={526} y={80} width={158} height={26} rx={5} className="fill-zinc-950 stroke-zinc-800" />
        <Label x={605} y={97} anchor="middle" cls="fill-zinc-300" size={10}>name · zone</Label>
        {[0, 1, 2, 3].map((ri) => (
          <g key={ri}>
            <rect x={526} y={112 + ri * 26} width={158} height={22} rx={4} className="fill-zinc-900 stroke-zinc-800/70" />
            <Label x={566} y={127 + ri * 26} anchor="middle" cls="fill-zinc-400" size={9}>
              {["Alice Chen", "Bruno Silva", "Chloe Dubois", "… +13"][ri]}
            </Label>
            <Label x={652} y={127 + ri * 26} anchor="middle" cls="fill-zinc-500" size={9}>
              {["EU", "LATAM", "EU", "…"][ri]}
            </Label>
          </g>
        ))}
      </motion.g>
      {/* bottom insight */}
      <motion.g {...fade(1)}>
        <rect x={20} y={252} width={676} height={30} rx={7} className="fill-violet-400/10 stroke-violet-400/40" />
        <Label x={358} y={271} anchor="middle" cls="fill-violet-300">You write SELECT first, but FROM runs first: load the rows, then shape them.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- v3 · WHERE gate + operator ladder (L3) ---------- */

function V3WhereGateLadder() {
  const rand = rng(23);
  const pass: React.JSX.Element[] = [];
  const fail: React.JSX.Element[] = [];
  for (let i = 0; i < 103; i++) {
    const isPass = i < 34;
    const t = i / 103;
    const x = 60 + t * 360;
    const y = 96 + Math.sin(i * 2.7) * 26 + rand() * 8 - 4;
    const dot = <circle key={i} cx={x} cy={y} r={4} className={isPass ? "fill-emerald-400" : "fill-zinc-600"} opacity={isPass ? 0.95 : 0.45} />;
    if (isPass) pass.push(dot);
    else fail.push(dot);
  }
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="WHERE tests each row; the predicate is a gate; AND binds tighter than OR">
      {/* flow field */}
      <motion.g {...fade(0)}>{fail}</motion.g>
      {/* gate */}
      <motion.g {...fade(0.3)}>
        <Panel x={196} y={44} w={128} h={104} cls="fill-zinc-900 stroke-emerald-400/40" />
        <Label x={260} y={62} anchor="middle" cls="fill-zinc-400" size={10}>WHERE — per-row gate</Label>
        <rect x={208} y={74} width={104} height={22} rx={5} className="fill-zinc-950 stroke-zinc-800" />
        <Label x={260} y={89} anchor="middle" cls="fill-emerald-300" size={10}>total &gt; 400</Label>
        <Label x={260} y={114} anchor="middle" cls="fill-zinc-500" size={9}>asked 103 times —</Label>
        <Label x={260} y={126} anchor="middle" cls="fill-zinc-500" size={9}>once per row</Label>
        {/* diverted rows */}
        <Pipe pts={[[330, 150], [400, 178], [430, 214]]} cls="stroke-rose-400/60" w={1.4} dash="4 4" arrowAng={1.1} arrowCls="stroke-rose-400/70" delay={0.5} />
        <XMark x={448} y={224} cls="stroke-rose-400" delay={0.7} />
        <Label x={520} y={228} cls="fill-rose-300" size={10}>69 rows stopped at the gate</Label>
      </motion.g>
      {/* survivors exit */}
      <motion.g {...fade(0.55)}>{pass}</motion.g>
      <motion.g {...fade(0.65)}>
        <Pipe pts={[[430, 96], [520, 96], [596, 96]]} cls="stroke-emerald-400/70" w={1.6} arrowAng={0} arrowCls="stroke-emerald-400" delay={0.6} />
        <Label x={706} y={100} anchor="end" cls="fill-emerald-300" size={11}>34 rows pass</Label>
      </motion.g>
      {/* operator ladder */}
      <motion.g {...fade(0.85)}>
        <Panel x={20} y={188} w={676} h={96} />
        <Label x={40} y={210} cls="fill-zinc-300" size={11}>operator ladder — who binds tightest</Label>
        {[
          ["NOT", 150, "tightest"],
          ["AND", 290, "middle"],
          ["OR", 420, "loosest"],
        ].map(([t, x, note]) => (
          <g key={t as string}>
            <rect x={(x as number) - 34} y={220} width={68} height={24} rx={6} className="fill-zinc-950 stroke-zinc-700" />
            <Label x={x as number} y={236} anchor="middle" cls="fill-zinc-200" size={11}>{t as string}</Label>
            <Label x={x as number} y={262} anchor="middle" cls="fill-zinc-500" size={9}>{note as string}</Label>
          </g>
        ))}
        <g>
          <Label x={688} y={230} anchor="end" cls="fill-rose-300" size={10}>pending AND big OR cancelled → 12 rows</Label>
          <Label x={688} y={252} anchor="end" cls="fill-emerald-300" size={10}>pending AND (big OR cancelled) → 5 rows</Label>
        </g>
        <Label x={40} y={276} cls="fill-zinc-500" size={9}>Same words, different meaning — AND merges before OR. Parentheses are cheap; wrong reports are not.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- v4 · NULL three-valued gates (L4) ---------- */

function V4NullThreeGates() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="NULL comparisons return UNKNOWN; only IS NULL can find them">
      {/* left: the three gates */}
      <motion.g {...fade(0)}>
        <Label x={28} y={44} cls="fill-zinc-300" size={11}>Ask a NULL a question, get UNKNOWN back</Label>
        <Label x={28} y={64} cls="fill-zinc-500" size={10}>row: order #1 · shipped_at = NULL</Label>
        {[
          ["shipped_at = '2024-06-01'", "UNKNOWN", "amber"],
          ["shipped_at != '2024-06-01'", "UNKNOWN", "amber"],
          ["shipped_at IS NULL", "TRUE", "emerald"],
        ].map(([q, verdict, tone], i) => (
          <g key={i}>
            <motion.rect {...fade(0.2 + i * 0.15)} x={28} y={80 + i * 44} width={330} height={34} rx={7} className={tone === "emerald" ? "fill-emerald-400/10 stroke-emerald-400/60" : "fill-amber-400/10 stroke-amber-400/50"} />
            <Label x={44} y={101 + i * 44} cls="fill-zinc-300" size={10}>{q}</Label>
            <Label x={344} y={101 + i * 44} anchor="end" cls={tone === "emerald" ? "fill-emerald-300" : "fill-amber-300"} size={10}>{verdict}</Label>
          </g>
        ))}
        <Label x={28} y={222} cls="fill-zinc-500" size={10}>WHERE keeps TRUE only — UNKNOWN rows silently vanish in both directions</Label>
        <Label x={28} y={240} cls="fill-zinc-500" size={10}>of the = / != pair. That is why NOT IN + NULL is a famous trap (M4).</Label>
      </motion.g>
      {/* right: funnel over real rows */}
      <motion.g {...fade(0.5)}>
        <Panel x={400} y={56} w={296} h={168} />
        <Label x={548} y={48} anchor="middle" cls="fill-zinc-400" size={10}>103 orders, asked: shipped_at IS NULL</Label>
        <circle cx={470} cy={120} r={34} className="fill-zinc-700/60" />
        <Label x={470} y={117} anchor="middle" cls="fill-zinc-300" size={11}>103</Label>
        <Label x={470} y={132} anchor="middle" cls="fill-zinc-500" size={9}>rows</Label>
        <Arrow x1={510} y1={120} x2={556} y2={120} cls="stroke-zinc-500" />
        <rect x={562} y={88} width={112} height={30} rx={6} className="fill-emerald-400/15 stroke-emerald-400/60" />
        <Label x={618} y={101} anchor="middle" cls="fill-emerald-300" size={10}>82 shipped</Label>
        <Label x={618} y={113} anchor="middle" cls="fill-emerald-300/70" size={9}>TRUE → kept</Label>
        <rect x={562} y={130} width={112} height={30} rx={6} className="fill-amber-400/10 stroke-amber-400/50" />
        <Label x={618} y={143} anchor="middle" cls="fill-amber-300" size={10}>21 NULL</Label>
        <Label x={618} y={155} anchor="middle" cls="fill-amber-300/70" size={9}>UNKNOWN → gone</Label>
        <Label x={548} y={206} anchor="middle" cls="fill-zinc-500" size={10}>NULL never equals anything — not even another NULL</Label>
      </motion.g>
      {/* bottom: COUNT fact */}
      <motion.g {...fade(0.9)}>
        <rect x={20} y={252} width={676} height={30} rx={7} className="fill-violet-400/10 stroke-violet-400/40" />
        <Label x={358} y={271} anchor="middle" cls="fill-violet-300">COUNT(*) counts rows (103) · COUNT(shipped_at) counts values (82) — the 21 NULLs are invisible to it</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- v5 · ORDER BY sort + LIMIT slice (L5) ---------- */

function V5SortSlice() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Multi-key sort then LIMIT slice, with real sorted rows">
      {/* left: unsorted */}
      <motion.g {...fade(0)}>
        <Label x={30} y={44} cls="fill-zinc-300" size={11}>as stored — no order guaranteed</Label>
        {["pending · 88.10", "cancelled · 397.99", "delivered · 752.96", "shipped · 143.86", "pending · 25.47", "cancelled · 90.35"].map((t, i) => (
          <rect key={i} x={30} y={58 + i * 30} width={190} height={24} rx={5} className="fill-zinc-900 stroke-zinc-800" opacity={0.85} />
        ))}
        {["pending · 88.10", "cancelled · 397.99", "delivered · 752.96", "shipped · 143.86", "pending · 25.47", "cancelled · 90.35"].map((t, i) => (
          <Label key={i} x={125} y={74 + i * 30} anchor="middle" cls="fill-zinc-500" size={9}>{t}</Label>
        ))}
      </motion.g>
      {/* middle: sorted strip, two keys */}
      <motion.g {...fade(0.4)}>
        <Label x={286} y={44} cls="fill-zinc-300" size={11}>ORDER BY status ASC, total DESC</Label>
        <Label x={286} y={62} cls="fill-zinc-500" size={9}>key 1: status A→Z · key 2: money high→low inside each tie</Label>
        {[
          ["cancelled", "397.99", true],
          ["cancelled", "206.19", true],
          ["cancelled", "152.52", true],
          ["cancelled", "143.86", false],
          ["delivered", "752.96", false],
          ["delivered", "522.10", false],
          ["pending", "88.10", false],
          ["pending", "25.47", false],
        ].map(([s, v, hot], i) => (
          <g key={i}>
            <rect x={286} y={74 + i * 26} width={200} height={21} rx={4} className={hot ? "fill-emerald-400/15 stroke-emerald-400/70" : "fill-zinc-900 stroke-zinc-800"} />
            <Label x={300} y={88 + i * 26} cls={hot ? "fill-emerald-300" : "fill-zinc-400"} size={9}>{s as string}</Label>
            <Label x={472} y={88 + i * 26} anchor="end" cls={hot ? "fill-emerald-300" : "fill-zinc-400"} size={9}>{v as string}</Label>
          </g>
        ))}
        {/* LIMIT bracket */}
        <motion.g {...fade(0.8)}>
          <Pipe pts={[[496, 74], [516, 74], [516, 145], [496, 145]]} cls="stroke-teal-400/80" w={1.6} delay={0.8} />
          <Label x={548} y={104} cls="fill-teal-300" size={10}>LIMIT 3</Label>
          <Label x={548} y={120} cls="fill-zinc-500" size={9}>slice the</Label>
          <Label x={548} y={132} cls="fill-zinc-500" size={9}>sorted strip</Label>
        </motion.g>
      </motion.g>
      {/* right: engine note */}
      <motion.g {...fade(1)}>
        <Panel x={560} y={170} w={136} h={82} cls="fill-zinc-900 stroke-teal-400/30" />
        <Label x={628} y={190} anchor="middle" cls="fill-teal-300" size={9}>engine truth</Label>
        <Label x={572} y={208} cls="fill-zinc-400" size={8.5}>EXPLAIN shows</Label>
        <Label x={572} y={222} cls="fill-zinc-400" size={8.5}>USE TEMP B-TREE</Label>
        <Label x={572} y={236} cls="fill-zinc-400" size={8.5}>FOR ORDER BY —</Label>
        <Label x={572} y={250} cls="fill-zinc-400" size={8.5}>sorting costs work</Label>
      </motion.g>
      {/* bottom */}
      <motion.g {...fade(1.1)}>
        <rect x={20} y={252} width={676} height={30} rx={7} className="fill-violet-400/10 stroke-violet-400/40" />
        <Label x={358} y={271} anchor="middle" cls="fill-violet-300">Ties are broken by the second key; without LIMIT, \"top 3\" is just a sorted list nobody finished reading</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- v6 · DISTINCT sieve (L6) ---------- */

function V6DistinctSieve() {
  const chips: React.JSX.Element[] = [];
  const regions = ["EU", "EU", "APAC", "US", "EU", "APAC", "EU", "APAC", "EU", "LATAM", "EU", "APAC", "EU", "EU", "US", "APAC"];
  const toneOf: Record<string, string> = { EU: "fill-emerald-400/15 stroke-emerald-400/60", APAC: "fill-teal-400/10 stroke-teal-400/60", US: "fill-amber-400/10 stroke-amber-400/50", LATAM: "fill-violet-400/10 stroke-violet-400/50" };
  regions.forEach((r, i) => {
    const x = 30 + (i % 8) * 32;
    const y = 64 + Math.floor(i / 8) * 34;
    chips.push(
      <motion.g key={i} {...fade(0.05 * i)}>
        <rect x={x} y={y} width={26} height={26} rx={5} className={toneOf[r]} />
        <Label x={x + 13} y={y + 17} anchor="middle" cls="fill-zinc-300" size={8.5}>{r}</Label>
      </motion.g>,
    );
  });
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="DISTINCT collapses duplicates into a set of unique values">
      <motion.g {...fade(0)}>
        <Label x={30} y={46} cls="fill-zinc-300" size={11}>16 customers, region column</Label>
        {chips}
      </motion.g>
      <motion.g {...fade(0.5)}>
        <Arrow x1={292} y1={110} x2={350} y2={110} cls="stroke-zinc-500" />
        <Label x={321} y={98} anchor="middle" cls="fill-zinc-500" size={9}>sieve</Label>
      </motion.g>
      {/* buckets */}
      <motion.g {...fade(0.7)}>
        <Label x={366} y={46} cls="fill-zinc-300" size={11}>SELECT DISTINCT region — one copy of each value</Label>
        {[
          ["EU", 8, "fill-emerald-400/15 stroke-emerald-400/60", "fill-emerald-300"],
          ["APAC", 5, "fill-teal-400/10 stroke-teal-400/60", "fill-teal-300"],
          ["US", 2, "fill-amber-400/10 stroke-amber-400/50", "fill-amber-300"],
          ["LATAM", 1, "fill-violet-400/10 stroke-violet-400/50", "fill-violet-300"],
        ].map(([r, n, box, txt], i) => (
          <g key={i}>
            <rect x={366 + i * 86} y={62} width={78} height={56} rx={7} className={box as string} />
            <Label x={405 + i * 86} y={86} anchor="middle" cls={txt as string} size={11}>{r as string}</Label>
            <Label x={405 + i * 86} y={104} anchor="middle" cls="fill-zinc-400" size={10}>×{n as number}</Label>
          </g>
        ))}
        <Label x={530} y={140} anchor="middle" cls="fill-zinc-500" size={9}>4 rows out — order inside DISTINCT output is still undefined</Label>
      </motion.g>
      {/* contrast row */}
      <motion.g {...fade(0.95)}>
        <Panel x={30} y={162} w={656} h={70} />
        <Label x={48} y={184} cls="fill-zinc-300" size={10}>the counting trio on the same column</Label>
        <g>
          <Label x={48} y={210} cls="fill-zinc-400" size={10}>COUNT(*) = 16 rows</Label>
          <Label x={260} y={210} cls="fill-zinc-400" size={10}>COUNT(region) = 16 non-NULL</Label>
          <Label x={480} y={210} cls="fill-emerald-300" size={10}>COUNT(DISTINCT region) = 4</Label>
        </g>
      </motion.g>
      <motion.g {...fade(1.1)}>
        <rect x={20} y={252} width={676} height={30} rx={7} className="fill-violet-400/10 stroke-violet-400/40" />
        <Label x={358} y={271} anchor="middle" cls="fill-violet-300">16 cities too — every customer lives in a different one; DISTINCT is how you find an all-unique column.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- v7 · aggregate collapse (L7) ---------- */

function V7AggregateCollapse() {
  const rand = rng(31);
  const dots: React.JSX.Element[] = [];
  for (let i = 0; i < 60; i++) {
    const cx = 60 + (i % 20) * 13 + rand() * 4 - 2;
    const cy = 92 + Math.floor(i / 20) * 16 + rand() * 4 - 2;
    dots.push(<circle key={i} cx={cx} cy={cy} r={3.4} className="fill-zinc-500" opacity={0.7} />);
  }
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Aggregates collapse many rows into one value — verified storefront numbers">
      <motion.g {...fade(0)}>
        <Label x={30} y={48} cls="fill-zinc-300" size={11}>order_items · 251 rows</Label>
        <Label x={30} y={66} cls="fill-zinc-500" size={9}>quantity × unit_price per line</Label>
        {dots}
        <Label x={30} y={152} cls="fill-zinc-500" size={9}>input grain: 251 rows</Label>
      </motion.g>
      <motion.g {...fade(0.35)}>
        <Pipe pts={[[160, 108], [220, 108], [268, 108]]} cls="stroke-zinc-500" w={1.6} arrowAng={0} arrowCls="stroke-zinc-400" delay={0.35} />
        <Label x={214} y={96} anchor="middle" cls="fill-zinc-500" size={9}>collapse</Label>
      </motion.g>
      {/* collapse dial */}
      <motion.g {...fade(0.5)}>
        <Panel x={274} y={62} w={172} h={112} cls="fill-zinc-900 stroke-emerald-400/40" />
        <Label x={360} y={86} anchor="middle" cls="fill-zinc-400" size={10}>one row out</Label>
        <circle cx={360} cy={124} r={22} className="fill-zinc-950 stroke-emerald-400/70" strokeWidth={1.5} />
        <Label x={360} y={129} anchor="middle" cls="fill-emerald-300" size={11}>1</Label>
        <Label x={360} y={162} anchor="middle" cls="fill-zinc-500" size={9}>grain changes: many → one</Label>
      </motion.g>
      {/* five readouts */}
      <motion.g {...fade(0.7)}>
        <Arrow x1={452} y1={118} x2={492} y2={118} cls="stroke-zinc-500" />
        <Label x={472} y={106} anchor="middle" cls="fill-zinc-500" size={9}>pick a function</Label>
        {[
          ["COUNT", "251 lines", "fill-zinc-300"],
          ["SUM", "34,833.28", "fill-emerald-300"],
          ["AVG", "138.78", "fill-emerald-300"],
          ["MIN", "14.46", "fill-teal-300"],
          ["MAX", "599.91", "fill-amber-300"],
        ].map(([fn, val, cls], i) => (
          <g key={i}>
            <rect x={498} y={48 + i * 34} width={196} height={28} rx={6} className="fill-zinc-900 stroke-zinc-800" />
            <Label x={512} y={66 + i * 34} cls="fill-zinc-500" size={10}>{fn}</Label>
            <Label x={680} y={66 + i * 34} anchor="end" cls={cls as string} size={10}>{val}</Label>
          </g>
        ))}
      </motion.g>
      {/* bottom */}
      <motion.g {...fade(1)}>
        <rect x={20} y={252} width={676} height={30} rx={7} className="fill-violet-400/10 stroke-violet-400/40" />
        <Label x={358} y={271} anchor="middle" cls="fill-violet-300">SUM verified live; aggregates skip NULL inputs — why COUNT(shipped_at) said 82, not 103</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- v8 · GROUP BY buckets then HAVING gate (L8) ---------- */

function V8BucketGate() {
  const chips: React.JSX.Element[] = [];
  const order = [...Array(52).fill("D"), ...Array(30).fill("S"), ...Array(14).fill("P"), ...Array(7).fill("X")];
  const colOf: Record<string, string> = { D: "fill-emerald-400", S: "fill-teal-400", P: "fill-amber-400", X: "fill-zinc-500" };
  order.forEach((k, i) => {
    const x = 34 + (i % 26) * 7.4;
    const y = 74 + Math.floor(i / 26) * 12;
    chips.push(<rect key={i} x={x} y={y} width={5} height={8} rx={1.5} className={colOf[k]} opacity={0.8} />);
  });
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="GROUP BY forms buckets, HAVING filters the buckets — real status counts">
      <motion.g {...fade(0)}>
        <Label x={30} y={48} cls="fill-zinc-300" size={11}>103 orders · one chip per row</Label>
        {chips}
        <Label x={30} y={146} cls="fill-zinc-500" size={9}>GROUP BY status routes every row into its bucket →</Label>
      </motion.g>
      <motion.g {...fade(0.3)}>
        <Arrow x1={240} y1={96} x2={282} y2={96} cls="stroke-zinc-500" />
      </motion.g>
      {/* buckets */}
      <motion.g {...fade(0.5)}>
        {[
          ["delivered", 52, "stroke-emerald-400/60", "fill-emerald-300", 0],
          ["shipped", 30, "stroke-teal-400/60", "fill-teal-300", 1],
          ["pending", 14, "stroke-amber-400/60", "fill-amber-300", 2],
          ["cancelled", 7, "stroke-zinc-600", "fill-zinc-300", 3],
        ].map(([label, n, box, txt, i]) => (
          <g key={i}>
            <rect x={288 + (i as number) * 106} y={70} width={96} height={64} rx={8} className={`fill-zinc-900 ${box}`} />
            <Label x={336 + (i as number) * 106} y={94} anchor="middle" cls={txt as string} size={9.5}>{label as string}</Label>
            <Label x={336 + (i as number) * 106} y={116} anchor="middle" cls="fill-zinc-200" size={13}>{n as number}</Label>
          </g>
        ))}
        <Label x={480} y={150} anchor="middle" cls="fill-zinc-500" size={9}>4 buckets — the aggregate ran once per bucket, not per row</Label>
      </motion.g>
      {/* HAVING gate */}
      <motion.g {...fade(0.75)}>
        <Arrow x1={288} y1={182} x2={326} y2={182} cls="stroke-zinc-500" />
        <Label x={304} y={170} anchor="middle" cls="fill-zinc-500" size={9}>gate</Label>
        <rect x={332} y={166} width={168} height={32} rx={7} className="fill-zinc-900 stroke-rose-400/50" />
        <Label x={416} y={186} anchor="middle" cls="fill-rose-300" size={10}>HAVING COUNT(*) &gt;= 30</Label>
      </motion.g>
      {/* verdicts */}
      <motion.g {...fade(0.95)}>
        {[
          ["delivered · 52", "kept", "fill-emerald-400/15 stroke-emerald-400/60", "fill-emerald-300", 0],
          ["shipped · 30", "kept", "fill-emerald-400/15 stroke-emerald-400/60", "fill-emerald-300", 1],
          ["pending · 14", "dropped", "fill-rose-400/10 stroke-rose-400/50", "fill-rose-300", 2],
          ["cancelled · 7", "dropped", "fill-rose-400/10 stroke-rose-400/50", "fill-rose-300", 3],
        ].map(([t, verdict, box, cls, i]) => (
          <g key={i}>
            <rect x={288 + (i as number) * 106} y={214} width={96} height={26} rx={6} className={box as string} />
            <Label x={336 + (i as number) * 106} y={231} anchor="middle" cls={cls as string} size={8.5}>{verdict as string}</Label>
            {(verdict as string) === "dropped" && <XMark x={374 + (i as number) * 106} y={200} cls="stroke-rose-400" s={3.5} delay={1.05} />}
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(1.15)}>
        <rect x={20} y={252} width={676} height={30} rx={7} className="fill-violet-400/10 stroke-violet-400/40" />
        <Label x={358} y={271} anchor="middle" cls="fill-violet-300">WHERE filters rows before buckets; HAVING filters buckets after — same family, different objects.</Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- registry ---------------- */

export const FIGURES_M1X: Partial<Record<FigureId, () => React.JSX.Element>> = {
  "v1-grain-zoom": V1GrainZoom,
  "v2-select-pipeline": V2SelectPipeline,
  "v3-where-gate-ladder": V3WhereGateLadder,
  "v4-null-three-gates": V4NullThreeGates,
  "v5-sort-slice": V5SortSlice,
  "v6-distinct-sieve": V6DistinctSieve,
  "v7-aggregate-collapse": V7AggregateCollapse,
  "v8-bucket-gate": V8BucketGate,
};
