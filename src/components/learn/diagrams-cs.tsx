"use client";

// Case studies — figures for the case-study lessons (L35-L40, L50, L51, L58). Same flat visual language as every module: 720-wide
// viewBox, Panel/Label/Arrow from diagrams-kit, Tailwind palette classes for
// theme re-skinning, framer-motion reveals. Every number shown is real —
// verified against the seeded storefront by scripts/cs-figures-facts.ts and
// the live-graded EXPECTED table.

import { motion } from "framer-motion";
import { Arrow, DotField, Label, MONO, Panel, XMark, fade } from "./diagrams-kit";

/* ---------------- shared bits ---------------- */

function Chip({ x, y, text, cls = "fill-emerald-400/15 stroke-emerald-400/60", txt = "fill-emerald-300", size = 11 }: { x: number; y: number; text: string; cls?: string; txt?: string; size?: number }) {
  const w = Math.max(44, text.length * (size * 0.66) + 16);
  return (
    <motion.g {...fade(0)}>
      <rect x={x - w / 2} y={y - 11} width={w} height={22} rx={7} className={cls} strokeWidth={1} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize={size} className={txt} fontFamily={MONO}>
        {text}
      </text>
    </motion.g>
  );
}

/* ---------------- lesson 35 — the new analyst's first week ---------------- */

/** cs35 — the founder's brief mapped to six shapes with their live answers. */
function Cs35BriefMap() {
  const rows: Array<[string, string, string]> = [
    ["Marketing-ready EU", "WHERE ∧", "7 names"],
    ["Budget shelf", "COUNT", "8"],
    ["Cities served", "COUNT DISTINCT", "16"],
    ["Warehouse depth", "SUM", "2,845"],
    ["Premium five", "ORDER · LIMIT", "$199.99 → $89.99"],
    ["Crowded categories", "GROUP · HAVING", "3 cats × 3"],
  ];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="The founder's six asks mapped to six SQL shapes with their live answers">
      <motion.g {...fade(0)}>
        <Panel x={16} y={54} w={168} h={216} cls="fill-zinc-900 stroke-zinc-700" />
        <Label x={100} y={82} anchor="middle" cls="fill-zinc-200">the founder&apos;s note</Label>
        <Label x={100} y={108} anchor="middle" cls="fill-zinc-500" size={10}>&ldquo;six numbers,</Label>
        <Label x={100} y={124} anchor="middle" cls="fill-zinc-500" size={10}>two lists —</Label>
        <Label x={100} y={140} anchor="middle" cls="fill-zinc-500" size={10}>nothing fancy.&rdquo;</Label>
        <Label x={100} y={176} anchor="middle" cls="fill-zinc-400" size={10}>you pick the tool</Label>
        <Label x={100} y={192} anchor="middle" cls="fill-zinc-400" size={10}>for every ask</Label>
        <text x={100} y={244} textAnchor="middle" fontSize={10} className="fill-emerald-300" fontFamily={MONO}>single table only</text>
      </motion.g>
      {rows.map(([ask, shape, ans], i) => {
        const y = 68 + i * 36;
        return (
          <motion.g key={ask} {...fade(0.15 + i * 0.08)}>
            <Label x={204} y={y} cls="fill-zinc-300" size={11}>{ask}</Label>
            <Chip x={392} y={y - 4} text={shape} cls="fill-teal-400/10 stroke-teal-400/50" txt="fill-teal-300" size={10} />
            <Arrow x1={330} y1={y - 4} x2={350} y2={y - 4} />
            <text x={560} y={y} textAnchor="middle" fontSize={12} className="fill-emerald-300" fontFamily={MONO}>{ans}</text>
          </motion.g>
        );
      })}
      <motion.g {...fade(0.8)}>
        <line x1={196} y1={54} x2={196} y2={270} className="stroke-zinc-800" />
        <Label x={648} y={54} anchor="end" cls="fill-zinc-500" size={10}>answers live-graded against the store</Label>
      </motion.g>
    </svg>
  );
}

/** cs35 — the two-gate filter: 16 customers → active = 1 → region = 'EU'. */
function Cs35FilterFunnel() {
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="Two WHERE gates: 16 customers, active = 1 keeps 14, region = EU keeps 7">
      <motion.g {...fade(0)}>
        <Panel x={20} y={56} w={168} h={120} />
        <Label x={104} y={44} anchor="middle" cls="fill-zinc-400" size={10}>customers · 16</Label>
        <DotField n={16} cols={8} x0={38} y0={72} gap={18} r={5} />
        <Label x={104} y={200} anchor="middle" cls="fill-zinc-500" size={10}>one table, no joins</Label>
      </motion.g>
      <motion.g {...fade(0.3)}>
        <rect x={212} y={92} width={104} height={34} rx={8} className="fill-zinc-900 stroke-zinc-600" />
        <text x={264} y={106} textAnchor="middle" fontSize={10} className="fill-zinc-300" fontFamily={MONO}>WHERE</text>
        <text x={264} y={119} textAnchor="middle" fontSize={10} className="fill-zinc-400" fontFamily={MONO}>active = 1</text>
        <Arrow x1={192} y1={108} x2={208} y2={108} />
        <Label x={264} y={152} anchor="middle" cls="fill-emerald-300" size={11}>14 pass</Label>
        <Label x={264} y={168} anchor="middle" cls="fill-zinc-500" size={9}>2 dormant drop</Label>
        <Arrow x1={320} y1={108} x2={336} y2={108} />
      </motion.g>
      <motion.g {...fade(0.55)}>
        <Panel x={340} y={56} w={140} h={120} />
        <Label x={410} y={78} anchor="middle" cls="fill-zinc-400" size={10}>active pool · 14</Label>
        <DotField n={14} cols={7} x0={362} y0={92} gap={18} r={5} />
      </motion.g>
      <motion.g {...fade(0.7)}>
        <rect x={504} y={92} width={110} height={34} rx={8} className="fill-zinc-900 stroke-zinc-600" />
        <text x={559} y={106} textAnchor="middle" fontSize={10} className="fill-zinc-300" fontFamily={MONO}>AND</text>
        <text x={559} y={119} textAnchor="middle" fontSize={10} className="fill-zinc-400" fontFamily={MONO}>region = &apos;EU&apos;</text>
        <Arrow x1={484} y1={108} x2={500} y2={108} />
        <Label x={559} y={152} anchor="middle" cls="fill-emerald-300" size={11}>7 remain</Label>
        <Arrow x1={618} y1={108} x2={634} y2={108} cls="stroke-emerald-400" />
      </motion.g>
      <motion.g {...fade(0.9)}>
        <Panel x={640} y={56} w={64} h={120} cls="fill-emerald-400/10 stroke-emerald-400/50" />
        <text x={672} y={124} textAnchor="middle" fontSize={20} className="fill-emerald-300" fontFamily={MONO}>7</text>
      </motion.g>
      <motion.g {...fade(1)}>
        <Label x={20} y={236} cls="fill-zinc-500" size={10}>the marketing list, alphabetical:</Label>
        <text x={20} y={264} fontSize={10} className="fill-zinc-300" fontFamily={MONO}>Alice Berlin · Chloe Lyon · Isabella Milan · Liam Cork · Noah Hamburg · Olivia London · Pedro Madrid</text>
      </motion.g>
    </svg>
  );
}

/** cs35 — sort-slice (premium five) and bucket-gate (crowded categories). */
function Cs35ShapeLadder() {
  const top5: Array<[string, string]> = [
    ["Smart Watch S", "199.99"],
    ["Noise-Canceling Headset", "149.99"],
    ["4K Webcam Pro", "129.00"],
    ["Studio Desktop Mic", "119.00"],
    ["Mechanical Keyboard K1", "89.99"],
  ];
  const buckets: Array<[string, number]> = [["Accessories", 3], ["Audio", 3], ["Electronics", 3]];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Left: ORDER BY price DESC LIMIT 5 slices the premium shelf. Right: GROUP BY with HAVING COUNT > 2 keeps three crowded categories.">
      <motion.g {...fade(0)}>
        <Panel x={16} y={44} w={316} h={214} />
        <Label x={28} y={32} cls="fill-zinc-400">sort, then slice — the premium five</Label>
        {top5.map(([name, price], i) => (
          <g key={name}>
            <rect x={20} y={56 + i * 30} width={308} height={26} rx={5} className={i < 5 ? "fill-zinc-800/60 stroke-zinc-700" : ""} strokeWidth={1} />
            <Label x={34} y={73 + i * 30} cls="fill-zinc-300" size={10}>{name.length > 26 ? name.slice(0, 25) + "…" : name}</Label>
            <text x={312} y={73 + i * 30} textAnchor="end" fontSize={10} className="fill-emerald-300" fontFamily={MONO}>{price}</text>
          </g>
        ))}
        <line x1={16} y1={210} x2={332} y2={210} className="stroke-emerald-400" strokeDasharray="4 4" />
        <Label x={332} y={228} anchor="end" cls="fill-emerald-300" size={10}>LIMIT 5 — the cut</Label>
        <Label x={16} y={278} cls="fill-zinc-500" size={10}>price DESC, name as tie-breaker → reproducible</Label>
      </motion.g>
      <motion.g {...fade(0.4)}>
        <Panel x={388} y={44} w={316} h={214} />
        <Label x={400} y={32} cls="fill-zinc-400">bucket, then gate — crowded categories</Label>
        {buckets.map(([cat, n], i) => (
          <g key={cat}>
            <Label x={400} y={82 + i * 44} cls="fill-zinc-300" size={10}>{cat}</Label>
            <DotField n={n} cols={3} x0={496} y0={68 + i * 44} gap={18} r={5} />
            <text x={580} y={82 + i * 44} fontSize={11} className="fill-zinc-400" fontFamily={MONO}>COUNT = {n}</text>
          </g>
        ))}
        <rect x={492} y={188} width={112} height={30} rx={7} className="fill-teal-400/10 stroke-teal-400/50" />
        <text x={548} y={207} textAnchor="middle" fontSize={10} className="fill-teal-300" fontFamily={MONO}>HAVING &gt; 2</text>
        <Label x={400} y={232} cls="fill-zinc-500" size={10}>Apparel 2 · Fitness 1 · Video 2 stay behind the gate</Label>
        <Label x={388} y={278} cls="fill-zinc-500" size={10}>WHERE filters rows — HAVING filters finished buckets</Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- lesson 36 — who's still buying? ---------------- */

/** cs36 — pick the join by what the brief must keep. */
function Cs36JoinPicker() {
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="Three briefs pick three joins: INNER ranks buyers, LEFT JOIN + IS NULL finds holes, self-join counts pairs">
      {[
        { y: 16, ask: "rank the buyers", join: "INNER JOIN", keep: "keep every match", out: "Alice 24 · Emma 17 · Grace 14 · Maya 13 · Chloe 5", cls: "fill-emerald-400/15 stroke-emerald-400/60", txt: "fill-emerald-300" },
        { y: 106, ask: "who never shipped?", join: "LEFT JOIN + IS NULL", keep: "keep only the holes", out: "Bruno · Chloe · Dmitri · Farid · Keiko · Olivia", cls: "fill-amber-400/15 stroke-amber-400/60", txt: "fill-amber-300" },
        { y: 196, ask: "region mates?", join: "customers ⋈ customers", keep: "pair each with each", out: "39 pairs, each counted once", cls: "fill-teal-400/15 stroke-teal-400/50", txt: "fill-teal-300" },
      ].map((r, i) => (
        <motion.g key={r.ask} {...fade(i * 0.25)}>
          <Panel x={16} y={r.y} w={688} h={78} />
          <Label x={32} y={r.y + 30} cls="fill-zinc-200" size={11}>&ldquo;{r.ask}&rdquo;</Label>
          <Label x={32} y={r.y + 52} cls="fill-zinc-500" size={9}>the brief</Label>
          <Arrow x1={170} y1={r.y + 39} x2={190} y2={r.y + 39} />
          <rect x={196} y={r.y + 22} width={188} height={34} rx={7} className={r.cls} />
          <text x={290} y={r.y + 43} textAnchor="middle" fontSize={10.5} className={r.txt} fontFamily={MONO}>{r.join}</text>
          <Label x={290} y={r.y + 70} anchor="middle" cls="fill-zinc-500" size={9}>{r.keep}</Label>
          <Arrow x1={392} y1={r.y + 39} x2={412} y2={r.y + 39} />
          <text x={424} y={r.y + 35} fontSize={9.5} className="fill-zinc-300" fontFamily={MONO}>{r.out}</text>
          <Label x={424} y={r.y + 58} cls="fill-zinc-500" size={9}>verified output</Label>
          {i === 0 && <Label x={684} y={r.y + 58} anchor="end" cls="fill-zinc-600" size={9}>orders join item lines</Label>}
        </motion.g>
      ))}
    </svg>
  );
}

/** cs36 — the anti-join: LEFT JOIN to shipped orders, keep the IS NULL holes. */
function Cs36AntiHoles() {
  const holes = new Set(["Bruno Silva", "Chloe Dubois", "Dmitri Volkov", "Farid Nasser", "Keiko Sato", "Olivia Brown"]);
  const all = ["Alice Chen", "Bruno Silva", "Chloe Dubois", "Dmitri Volkov", "Emma Wilson", "Farid Nasser", "Grace Kim", "Hiro Tanaka", "Isabella Rossi", "Jamal Wright", "Keiko Sato", "Liam O'Brien", "Maya Patel", "Noah Meyer", "Olivia Brown", "Pedro Alvarez"];
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="16 customers LEFT JOINed to shipped orders: six have no shipped order — the anti-join holes">
      <motion.g {...fade(0)}>
        <Label x={20} y={30} cls="fill-zinc-400">16 customers × shipped orders — who has never shipped?</Label>
      </motion.g>
      {all.map((name, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const x = 20 + col * 172, y = 52 + row * 46;
        const hole = holes.has(name);
        return (
          <motion.g key={name} {...fade(0.1 + i * 0.03)}>
            <rect x={x} y={y} width={160} height={36} rx={6} className={hole ? "fill-amber-400/10 stroke-amber-400/60" : "fill-zinc-900 stroke-zinc-800"} strokeWidth={1} />
            <Label x={x + 12} y={y + 22} cls={hole ? "fill-amber-200" : "fill-zinc-400"} size={10}>{name}</Label>
            <circle cx={x + 146} cy={y + 18} r={4.5} className={hole ? "fill-amber-400" : "fill-emerald-400"} />
          </motion.g>
        );
      })}
      <motion.g {...fade(0.7)}>
        <rect x={708} y={52} width={0} height={0} />
        <Label x={20} y={262} cls="fill-zinc-500" size={10}>green = shipped at least once · amber = the anti-join keeps these six</Label>
        <Chip x={596} y={258} text="same shape on delivered → 1 hole: Liam" cls="fill-teal-400/10 stroke-teal-400/50" txt="fill-teal-300" size={9} />
      </motion.g>
    </svg>
  );
}

/** cs36 — revenue per category: sum the item LINES, not joined order totals. */
function Cs36RevenueMap() {
  const cats: Array<[string, number]> = [
    ["Audio", 11744.01], ["Wearables", 6929.12], ["Video", 5198.41], ["Electronics", 4818.61],
    ["Accessories", 3294.29], ["Apparel", 1984.93], ["Fitness", 863.91],
  ];
  const max = 11744.01;
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Revenue per category from item lines: Audio 11744.01 down to Fitness 863.91; honest storewide total 34833.28">
      <motion.g {...fade(0)}>
        <Label x={20} y={28} cls="fill-zinc-400">revenue per category — via order_items → products</Label>
        <Chip x={560} y={24} text="orders ⋈ order_items ⋈ products" cls="fill-zinc-900 stroke-zinc-700" txt="fill-zinc-300" size={9} />
      </motion.g>
      {cats.map(([cat, v], i) => {
        const y = 52 + i * 30;
        return (
          <motion.g key={cat} {...fade(0.15 + i * 0.07)}>
            <Label x={20} y={y + 14} cls="fill-zinc-300" size={10}>{cat}</Label>
            <rect x={110} y={y} width={(v / max) * 380} height={20} rx={4} className="fill-emerald-400/25 stroke-emerald-400/60" strokeWidth={1} />
            <text x={110 + (v / max) * 380 + 10} y={y + 14} fontSize={10.5} className="fill-emerald-300" fontFamily={MONO}>{v.toLocaleString("en-US", { minimumFractionDigits: 2 })}</text>
          </motion.g>
        );
      })}
      <motion.g {...fade(0.8)}>
        <rect x={110} y={264} width={300} height={22} rx={5} className="fill-zinc-800/60 stroke-zinc-600" />
        <text x={260} y={279} textAnchor="middle" fontSize={10} className="fill-zinc-200" fontFamily={MONO}>true_revenue = 34,833.28</text>
        <text x={700} y={279} textAnchor="end" fontSize={9} className="fill-zinc-500" fontFamily={MONO}>joining orders first triples the money</text>
      </motion.g>
    </svg>
  );
}

/* ---------------- lesson 37 — the quarterly merchandising review ---------------- */

/** cs37 — UNION ALL arms: in_flight (pending + shipped) vs complete. */
function Cs37ArmStack() {
  return (
    <svg viewBox="0 0 720 260" className="w-full" role="img" aria-label="UNION ALL stacks two labeled arms: in_flight 44 (14 pending + 30 shipped) and complete 52 delivered — 103 orders total">
      <motion.g {...fade(0)}>
        <Panel x={60} y={48} w={280} h={72} />
        <Label x={76} y={70} cls="fill-teal-300" size={11}>&apos;in_flight&apos;</Label>
        <text x={320} y={70} textAnchor="end" fontSize={13} className="fill-teal-300" fontFamily={MONO}>44</text>
        <rect x={76} y={84} width={90} height={24} rx={5} className="fill-zinc-800/60 stroke-zinc-700" />
        <text x={121} y={100} textAnchor="middle" fontSize={9.5} className="fill-zinc-300" fontFamily={MONO}>pending 14</text>
        <rect x={174} y={84} width={90} height={24} rx={5} className="fill-zinc-800/60 stroke-zinc-700" />
        <text x={219} y={100} textAnchor="middle" fontSize={9.5} className="fill-zinc-300" fontFamily={MONO}>shipped 30</text>
        <Label x={276} y={100} cls="fill-zinc-500" size={9}>one CASE</Label>
      </motion.g>
      <motion.g {...fade(0.35)}>
        <rect x={380} y={58} width={130} height={28} rx={7} className="fill-emerald-400/15 stroke-emerald-400/60" />
        <text x={445} y={76} textAnchor="middle" fontSize={10.5} className="fill-emerald-300" fontFamily={MONO}>UNION ALL</text>
        <Label x={445} y={102} anchor="middle" cls="fill-zinc-500" size={9}>labels travel with rows</Label>
      </motion.g>
      <motion.g {...fade(0.55)}>
        <Panel x={60} y={140} w={280} h={60} />
        <Label x={76} y={166} cls="fill-emerald-300" size={11}>&apos;complete&apos;</Label>
        <text x={320} y={166} textAnchor="end" fontSize={13} className="fill-emerald-300" fontFamily={MONO}>52</text>
        <Label x={76} y={186} cls="fill-zinc-500" size={9}>delivered — the finished arm</Label>
      </motion.g>
      <motion.g {...fade(0.75)}>
        <Panel x={560} y={120} w={140} h={104} cls="fill-zinc-900 stroke-zinc-700" />
        <text x={630} y={162} textAnchor="middle" fontSize={22} className="fill-zinc-100" fontFamily={MONO}>103</text>
        <Label x={630} y={186} anchor="middle" cls="fill-zinc-500" size={10}>orders, stacked</Label>
        <Label x={630} y={204} anchor="middle" cls="fill-zinc-600" size={9}>44 + 52 — no dedupe</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <Label x={60} y={232} cls="fill-zinc-500" size={10}>UNION ALL keeps both arms; UNION would spend a sort proving 44 ∩ 52 = ∅</Label>
      </motion.g>
    </svg>
  );
}

/** cs37 — the region × status pivot, one pass with SUM(CASE ...). */
function Cs37PivotGrid() {
  const regions: Array<[string, number[]]> = [
    ["APAC", [5, 8, 21, 3]],
    ["EU", [6, 12, 24, 3]],
    ["LATAM", [0, 0, 2, 0]],
    ["US", [3, 10, 5, 1]],
  ];
  const heads = ["pending", "shipped", "delivered", "cancelled"];
  return (
    <svg viewBox="0 0 720 260" className="w-full" role="img" aria-label="Region by status pivot: APAC 5/8/21/3, EU 6/12/24/3, LATAM 0/0/2/0, US 3/10/5/1 — built in one pass with SUM CASE">
      <motion.g {...fade(0)}>
        <Label x={20} y={30} cls="fill-zinc-400">one row per region, four counters beside it</Label>
        {heads.map((h, i) => (
          <Label key={h} x={300 + i * 92} y={60} anchor="middle" cls="fill-zinc-500" size={10}>{h}</Label>
        ))}
        <line x1={288} y1={70} x2={688} y2={70} className="stroke-zinc-800" />
      </motion.g>
      {regions.map(([r, vals], ri) => (
        <motion.g key={r} {...fade(0.2 + ri * 0.12)}>
          <Label x={20} y={94 + ri * 38} cls="fill-zinc-200" size={11}>{r}</Label>
          {vals.map((v, ci) => (
            <g key={ci}>
              <rect x={252 + ci * 92} y={80 + ri * 38} width={84} height={26} rx={5} className={v === 0 ? "fill-zinc-900 stroke-zinc-800" : "fill-zinc-800/50 stroke-zinc-700"} strokeWidth={1} />
              <text x={294 + ci * 92} y={97 + ri * 38} textAnchor="middle" fontSize={11} className={v === 0 ? "fill-zinc-600" : "fill-zinc-200"} fontFamily={MONO}>{v}</text>
            </g>
          ))}
        </motion.g>
      ))}
      <motion.g {...fade(0.8)}>
        <Chip x={170} y={232} text="SUM(CASE WHEN status = … THEN 1 ELSE 0 END) …" cls="fill-zinc-900 stroke-zinc-700" txt="fill-zinc-300" size={9} />
        <Label x={20} y={256} cls="fill-zinc-500" size={10}>one scan, four pivots — CASE turns rows into columns</Label>
      </motion.g>
    </svg>
  );
}

/** cs37 — alphabetical vs workflow order; the money census beside it. */
function Cs37WorkflowOrder() {
  const alpha = ["cancelled 7", "delivered 52", "pending 14", "shipped 30"];
  const workflow: Array<[string, number, string]> = [
    ["pending", 14, "1"],
    ["shipped", 30, "2"],
    ["delivered", 52, "3"],
    ["cancelled", 7, "4"],
  ];
  const money: Array<[string, string]> = [
    ["delivered", "15,571.07"],
    ["shipped", "11,996.72"],
    ["pending", "6,113.00"],
    ["cancelled", "1,152.49"],
  ];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Workflow order via CASE key beats alphabetical order; the money census: delivered 15571.07, shipped 11996.72, pending 6113, cancelled 1152.49">
      <motion.g {...fade(0)}>
        <Panel x={20} y={48} w={280} h={150} cls="fill-zinc-950 stroke-zinc-800" />
        <Label x={36} y={70} cls="fill-zinc-500">ORDER BY status — alphabetical</Label>
        {alpha.map((s, i) => (
          <g key={s}>
            <Label x={52} y={98 + i * 24} cls="fill-zinc-500" size={10}>{s}</Label>
          </g>
        ))}
        <XMark x={272} y={70} cls="stroke-zinc-600" />
        <Label x={36} y={192} cls="fill-zinc-600" size={9}>true but unreadable for the ops standup</Label>
      </motion.g>
      <motion.g {...fade(0.35)}>
        <Panel x={360} y={48} w={340} h={150} cls="fill-emerald-400/5 stroke-emerald-400/40" />
        <Label x={376} y={70} cls="fill-emerald-300">ORDER BY the CASE key — workflow order</Label>
        {workflow.map(([s, n, k], i) => (
          <g key={s}>
            <rect x={376} y={84 + i * 27} width={22} height={20} rx={4} className="fill-emerald-400/20 stroke-emerald-400/60" />
            <text x={387} y={98 + i * 27} textAnchor="middle" fontSize={10} className="fill-emerald-200" fontFamily={MONO}>{k}</text>
            <Label x={410} y={98 + i * 27} cls="fill-zinc-300" size={10}>{s}</Label>
            <text x={688} y={98 + i * 27} textAnchor="end" fontSize={11} className="fill-emerald-300" fontFamily={MONO}>{n}</text>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.7)}>
        <line x1={20} y1={222} x2={700} y2={222} className="stroke-zinc-800" />
        <Label x={20} y={244} cls="fill-zinc-400">the money census — one row, four SUM(CASE) columns</Label>
        {money.map(([s, v], i) => (
          <text key={s} x={40 + i * 172} y={272} fontSize={10.5} className="fill-zinc-300" fontFamily={MONO}>
            {s} ${v}
          </text>
        ))}
      </motion.g>
      <Arrow x1={304} y1={122} x2={356} y2={122} cls="stroke-emerald-400" />
    </svg>
  );
}

/* ---------------- lesson 38 — the VIP shortlist ---------------- */

/** cs38 — stage spends, draw the average line, count who clears it. */
function Cs38StageAverage() {
  const above: Array<[string, number]> = [
    ["Alice", 7262.35], ["Emma", 6640.56], ["Grace", 4574.23], ["Maya", 3644.56], ["Chloe", 2667.93],
  ];
  const max = 7262.35, avg = 2177.08, base = 110, scale = 150;
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Staged per-customer spends: Alice 7262.35, Emma 6640.56, Grace 4574.23, Maya 3644.56, Chloe 2667.93 clear the 2177.08 average; eleven customers stay below">
      <motion.g {...fade(0)}>
        <Label x={20} y={28} cls="fill-zinc-400">stage each customer&apos;s lifetime spend — a query in FROM</Label>
      </motion.g>
      {above.map(([name, v], i) => {
        const h = (v / max) * scale;
        const x = 60 + i * 92;
        return (
          <motion.g key={name} {...fade(0.15 + i * 0.08)}>
            <rect x={x} y={base + scale - h} width={56} height={h} rx={4} className="fill-emerald-400/25 stroke-emerald-400/60" strokeWidth={1} />
            <text x={x + 28} y={base + scale - h - 6} textAnchor="middle" fontSize={9.5} className="fill-emerald-300" fontFamily={MONO}>{v.toLocaleString("en-US", { minimumFractionDigits: 2 })}</text>
            <Label x={x + 28} y={base + scale + 16} anchor="middle" cls="fill-zinc-300" size={10}>{name}</Label>
          </motion.g>
        );
      })}
      <motion.g {...fade(0.6)}>
        <line x1={40} y1={base + scale - (avg / max) * scale} x2={560} y2={base + scale - (avg / max) * scale} className="stroke-amber-400" strokeDasharray="5 4" />
        <Label x={564} y={base + scale - (avg / max) * scale + 4} cls="fill-amber-300" size={10}>avg customer 2,177.08</Label>
      </motion.g>
      <motion.g {...fade(0.8)}>
        <rect x={40} y={base + scale - (avg / max) * scale} width={520} height={((avg / max) * scale)} className="fill-zinc-800/30" />
        <Label x={40} y={294} cls="fill-zinc-500" size={10}>five customers clear the bar — eleven stay below it (bottom: Olivia 444.80)</Label>
      </motion.g>
      <motion.g {...fade(1)}>
        <Panel x={596} y={120} w={108} h={92} cls="fill-zinc-900 stroke-zinc-700" />
        <text x={650} y={158} textAnchor="middle" fontSize={20} className="fill-emerald-300" fontFamily={MONO}>5</text>
        <Label x={650} y={180} anchor="middle" cls="fill-zinc-500" size={9}>above the</Label>
        <Label x={650} y={194} anchor="middle" cls="fill-zinc-500" size={9}>household bar</Label>
      </motion.g>
    </svg>
  );
}

/** cs38 — EXISTS: the per-row probe; one hit is enough. */
function Cs38ExistsProbe() {
  const pending = new Set(["Alice Chen", "Chloe Dubois", "Emma Wilson", "Farid Nasser", "Grace Kim", "Keiko Sato", "Maya Patel", "Pedro Alvarez"]);
  const all = ["Alice Chen", "Bruno Silva", "Chloe Dubois", "Dmitri Volkov", "Emma Wilson", "Farid Nasser", "Grace Kim", "Hiro Tanaka", "Isabella Rossi", "Jamal Wright", "Keiko Sato", "Liam O'Brien", "Maya Patel", "Noah Meyer", "Olivia Brown", "Pedro Alvarez"];
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="EXISTS probes each customer for a pending order: eight fire true, eight false — one matching row is enough">
      <motion.g {...fade(0)}>
        <Label x={20} y={28} cls="fill-zinc-400">EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = &apos;pending&apos;)</Label>
      </motion.g>
      {all.map((name, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const x = 20 + col * 172, y = 52 + row * 46;
        const hit = pending.has(name);
        return (
          <motion.g key={name} {...fade(0.1 + i * 0.03)}>
            <rect x={x} y={y} width={160} height={36} rx={6} className={hit ? "fill-emerald-400/10 stroke-emerald-400/60" : "fill-zinc-900 stroke-zinc-800"} strokeWidth={1} />
            <Label x={x + 12} y={y + 22} cls={hit ? "fill-zinc-200" : "fill-zinc-500"} size={10}>{name}</Label>
            <text x={x + 146} y={y + 23} textAnchor="end" fontSize={9} className={hit ? "fill-emerald-300" : "fill-zinc-600"} fontFamily={MONO}>
              {hit ? "TRUE" : "false"}
            </text>
          </motion.g>
        );
      })}
      <motion.g {...fade(0.8)}>
        <Label x={20} y={262} cls="fill-zinc-500" size={10}>the probe stops at the FIRST matching row — eight TRUEs, one hit each, zero scans wasted</Label>
      </motion.g>
    </svg>
  );
}

/** cs38 — the CTE chain: stage → filter → top 3; veterans badge beside. */
function Cs38CtePipeline() {
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="CTE pipeline: staged spends 16 rows, above-average filter keeps 5, top 3 by spend; three status veterans named beside">
      {[
        { x: 20, title: "staged", n: "16", note: "one row per customer", rows: ["spend per customer"] },
        { x: 250, title: "above_avg", n: "5", note: "spend > customer avg", rows: ["the household bar"] },
        { x: 480, title: "top 3", n: "3", note: "ORDER BY spend DESC", rows: ["Alice 7,262.35", "Emma 6,640.56", "Grace 4,574.23"] },
      ].map((s, i) => (
        <motion.g key={s.title} {...fade(i * 0.25)}>
          <Panel x={s.x} y={56} w={200} h={i === 2 ? 130 : 100} />
          <Label x={s.x + 14} y={80} cls="fill-zinc-200" size={11}>{s.title}</Label>
          <text x={s.x + 186} y={80} textAnchor="end" fontSize={12} className="fill-emerald-300" fontFamily={MONO}>{s.n}</text>
          {s.rows.map((r, ri) => (
            <Label key={r} x={s.x + 14} y={104 + ri * 22} cls={ri === 0 && i < 2 ? "fill-zinc-500" : "fill-zinc-300"} size={10}>{r}</Label>
          ))}
          <Label x={s.x + 14} y={i === 2 ? 172 : 140} cls="fill-zinc-600" size={9}>{s.note}</Label>
          {i < 2 && <Arrow x1={s.x + 204} y1={106} x2={s.x + 226} y2={106} cls="stroke-emerald-400" />}
        </motion.g>
      ))}
      <motion.g {...fade(0.8)}>
        <Label x={20} y={216} cls="fill-zinc-400">WITH staged AS (…) — the readable subquery, step by step</Label>
        <Panel x={20} y={228} w={440} h={40} cls="fill-amber-400/5 stroke-amber-400/40" />
        <Label x={36} y={252} cls="fill-zinc-300" size={10}>veterans — COUNT(DISTINCT status) = 4:</Label>
        <Chip x={360} y={248} text="Alice · Emma · Maya" size={9} />
        <Label x={480} y={252} cls="fill-zinc-500" size={9}>breadth, not volume</Label>
      </motion.g>
    </svg>
  );
}



/* ---------------- lesson 39 — the ops calendar ---------------- */

/** cs39 — '%Y-%m' turns timestamps into 14 sortable month buckets. */
function Cs39MonthBuckets() {
  const buckets: Array<[string, number]> = [
    ["24-01", 8], ["24-02", 9], ["24-03", 8], ["24-04", 7], ["24-05", 8], ["24-06", 6], ["24-07", 8],
    ["24-08", 7], ["24-09", 9], ["24-10", 7], ["24-11", 6], ["24-12", 7], ["25-01", 6], ["25-02", 7],
  ];
  const max = 9;
  return (
    <svg viewBox="0 0 720 260" className="w-full" role="img" aria-label="Fourteen month buckets from strftime, counts 8 9 8 7 8 6 8 7 9 7 6 7 6 7 — 103 orders in calendar order">
      <motion.g {...fade(0)}>
        <Label x={20} y={28} cls="fill-zinc-400">strftime(&apos;%Y-%m&apos;, created_at) — one bucket per month, calendar order</Label>
      </motion.g>
      {buckets.map(([mon, n], i) => {
        const h = (n / max) * 120;
        const x = 28 + i * 48;
        return (
          <motion.g key={mon} {...fade(0.1 + i * 0.04)}>
            <rect x={x} y={196 - h} width={36} height={h} rx={4} className={n >= 9 ? "fill-emerald-400/30 stroke-emerald-400/70" : "fill-emerald-400/15 stroke-emerald-400/50"} strokeWidth={1} />
            <text x={x + 18} y={188 - h} textAnchor="middle" fontSize={10} className="fill-emerald-300" fontFamily={MONO}>{n}</text>
            <text x={x + 18} y={216} textAnchor="middle" fontSize={8.5} className="fill-zinc-500" fontFamily={MONO}>{mon}</text>
          </motion.g>
        );
      })}
      <motion.g {...fade(0.8)}>
        <line x1={20} y1={196} x2={704} y2={196} className="stroke-zinc-700" />
        <Label x={20} y={244} cls="fill-zinc-500" size={10}>14 buckets, 103 orders — &apos;2024-9&apos; sorts wrong, &apos;2024-09&apos; sorts right: text buckets stay honest</Label>
        <Chip x={648} y={240} text="GROUP BY mon" cls="fill-zinc-900 stroke-zinc-700" txt="fill-zinc-300" size={9} />
      </motion.g>
    </svg>
  );
}

/** cs39 — the running revenue line: SUM() OVER (ORDER BY mon). */
function Cs39RunningLine() {
  const running = [3731.97, 7341.61, 9958.69, 12427.6, 15337.91, 17385.34, 18579.2, 20931.27, 24047.31, 27022.98, 28671.78, 30773.25, 32442.75, 34833.28];
  const revenue = [3731.97, 3609.64, 2617.08, 2468.91, 2910.31, 2047.43, 1193.86, 2352.07, 3116.04, 2975.67, 1648.8, 2101.47, 1669.5, 2390.53];
  const max = 34833.28, x0 = 40, dx = 46, base = 210, h = 130;
  const pt = (i: number) => `${x0 + i * dx},${base - (running[i] / max) * h}`;
  const revPt = (i: number) => `${x0 + i * dx},${base - (revenue[i] / max) * h}`;
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Running revenue climbs from 3731.97 in Jan to 34833.28 by Feb 2025; monthly revenue dashed line shows the July trough of 1193.86">
      <motion.g {...fade(0)}>
        <Label x={20} y={28} cls="fill-zinc-400">the running line — SUM(revenue) OVER (ORDER BY mon)</Label>
      </motion.g>
      <motion.g {...fade(0.25)}>
        <Panel x={20} y={44} w={664} h={196} />
      </motion.g>
      <motion.g {...fade(0.35)}>
        <polyline points={revenue.map(revPt).join(" ")} fill="none" className="stroke-zinc-600" strokeWidth={1.2} strokeDasharray="3 3" />
        {revenue.map((_, i) => (
          <circle key={i} cx={x0 + i * dx} cy={base - (revenue[i] / max) * h} r={2.4} className="fill-zinc-500" />
        ))}
      </motion.g>
      <motion.g {...fade(0.55)}>
        <polyline points={running.map(pt).join(" ")} fill="none" className="stroke-emerald-400" strokeWidth={1.8} />
        {running.map((v, i) => (
          <circle key={i} cx={x0 + i * dx} cy={base - (v / max) * h} r={3} className="fill-emerald-400" />
        ))}
      </motion.g>
      <motion.g {...fade(0.8)}>
        <text x={x0} y={base - (running[0] / max) * h - 10} fontSize={10} className="fill-emerald-300" fontFamily={MONO}>3,731.97</text>
        <text x={x0 + 6 * dx} y={base - (revenue[6] / max) * h - 10} textAnchor="middle" fontSize={9} className="fill-zinc-400" fontFamily={MONO}>Jul 1,193.86</text>
        <text x={x0 + 13 * dx} y={base - (running[13] / max) * h - 10} textAnchor="end" fontSize={10} className="fill-emerald-300" fontFamily={MONO}>34,833.28</text>
        {["24-01", "24-07", "25-02"].map((m, i) => (
          <text key={m} x={x0 + [0, 6, 13][i] * dx} y={base + 18} textAnchor="middle" fontSize={8.5} className="fill-zinc-500" fontFamily={MONO}>{m}</text>
        ))}
        <Label x={20} y={282} cls="fill-zinc-500" size={10}>dashed = monthly revenue · solid = cumulative — the dips never reset the climb</Label>
      </motion.g>
    </svg>
  );
}

/** cs39 — LAG measures Alice's rhythm; ship speed and quartiles beside. */
function Cs39GapLag() {
  const gaps = [20, 29, 5, 9, 13, 18, 12, 25, 36, 34, 12, 22, 13, 1, 14, 51, 21, 11, 3, 20, 21, 17, 7];
  const max = 51;
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="Alice's 23 LAG gaps between consecutive orders, tallest 51 days; average ship speed 2.98 days over 82 orders; spend quartiles 26 26 26 25">
      <motion.g {...fade(0)}>
        <Label x={20} y={28} cls="fill-zinc-400">julianday(order) − julianday(LAG(order)) — Alice&apos;s rhythm, 24 orders</Label>
      </motion.g>
      {gaps.map((g, i) => {
        const h = (g / max) * 120;
        const x = 32 + i * 28;
        return (
          <motion.g key={i} {...fade(0.08 + i * 0.03)}>
            <line x1={x} y1={196} x2={x} y2={196 - h} className={g === 51 ? "stroke-amber-400" : "stroke-teal-400"} strokeWidth={2.4} />
            <circle cx={x} cy={196 - h} r={2.6} className={g === 51 ? "fill-amber-400" : "fill-teal-400"} />
            <text x={x} y={214} textAnchor="middle" fontSize={8} className="fill-zinc-600" fontFamily={MONO}>{g}</text>
          </motion.g>
        );
      })}
      <motion.g {...fade(0.8)}>
        <line x1={20} y1={196} x2={700} y2={196} className="stroke-zinc-700" />
        <Label x={20} y={240} cls="fill-zinc-500" size={10}>first row: NULL — LAG has nothing before it · 51-day quiet spell before Nov</Label>
      </motion.g>
      <motion.g {...fade(1)}>
        <Chip x={150} y={262} text="avg ship 2.98d over 82 orders" cls="fill-zinc-900 stroke-zinc-700" txt="fill-zinc-300" size={9} />
        <Chip x={360} y={262} text="NTILE(4): 26 · 26 · 26 · 25" cls="fill-zinc-900 stroke-zinc-700" txt="fill-zinc-300" size={9} />
        <Chip x={580} y={262} text="NULL sorts last" cls="fill-amber-400/10 stroke-amber-400/50" txt="fill-amber-300" size={9} />
      </motion.g>
    </svg>
  );
}

/* ---------------- lesson 40 — the executive one-pager ---------------- */

/** cs40 — one row, four FILTER counts: the whole pipeline at a glance. */
function Cs40FilterCensus() {
  const cells: Array<[string, number, string]> = [
    ["delivered", 52, "stroke-emerald-400/60"],
    ["shipped", 30, "stroke-teal-400/50"],
    ["pending", 14, "stroke-amber-400/50"],
    ["cancelled", 7, "stroke-zinc-600"],
  ];
  return (
    <svg viewBox="0 0 720 240" className="w-full" role="img" aria-label="One census row via COUNT FILTER: delivered 52, shipped 30, pending 14, cancelled 7">
      <motion.g {...fade(0)}>
        <Label x={20} y={30} cls="fill-zinc-400">COUNT(*) FILTER (WHERE status = …) — four counters, one scan, one row</Label>
      </motion.g>
      {cells.map(([s, n, stroke], i) => (
        <motion.g key={s} {...fade(0.15 + i * 0.1)}>
          <rect x={24 + i * 172} y={58} width={156} height={96} rx={8} className="fill-zinc-900 stroke-zinc-800" strokeWidth={1} />
          <rect x={24 + i * 172} y={58} width={156} height={96} rx={8} fill="none" className={stroke} strokeWidth={1} />
          <text x={102 + i * 172} y={118} textAnchor="middle" fontSize={26} className="fill-zinc-100" fontFamily={MONO}>{n}</text>
          <Label x={102 + i * 172} y={140} anchor="middle" cls="fill-zinc-400" size={10}>{s}</Label>
        </motion.g>
      ))}
      <motion.g {...fade(0.7)}>
        <Label x={20} y={186} cls="fill-zinc-500" size={10}>same shape works for money: SUM(total) FILTER (WHERE …) = the value census</Label>
        <Chip x={580} y={206} text="52 + 30 + 14 + 7 = 103" cls="fill-zinc-900 stroke-zinc-700" txt="fill-zinc-300" size={9} />
      </motion.g>
    </svg>
  );
}

/** cs40 — GROUP_CONCAT folds the footprint; VALUES bands type the catalog. */
function Cs40FoldBand() {
  const suppliers: Array<[string, string]> = [
    ["Nordic Gadgets AB", "EU"], ["Shenzhen Electro", "APAC"], ["Pacific Textiles", "APAC"],
    ["Midwest Hardware", "US"], ["Alpine Audio", "EU"], ["Andes Naturals", "LATAM"],
  ];
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="Six supplier regions fold into one sorted string APAC,EU,LATAM,US; VALUES bands split 16 products into budget 8, mid 4, premium 4">
      <motion.g {...fade(0)}>
        <Panel x={20} y={48} w={320} h={170} />
        <Label x={36} y={70} cls="fill-zinc-400">six suppliers, regions as they come</Label>
        {suppliers.map(([n, r], i) => (
          <g key={n}>
            <Label x={36} y={94 + i * 20} cls="fill-zinc-400" size={9.5}>{n}</Label>
            <text x={326} y={94 + i * 20} textAnchor="end" fontSize={9.5} className="fill-zinc-500" fontFamily={MONO}>{r}</text>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.4)}>
        <Arrow x1={344} y1={130} x2={372} y2={130} cls="stroke-emerald-400" />
        <Label x={358} y={118} anchor="middle" cls="fill-zinc-500" size={8}>fold</Label>
      </motion.g>
      <motion.g {...fade(0.55)}>
        <Panel x={376} y={70} w={324} h={64} cls="fill-emerald-400/10 stroke-emerald-400/50" />
        <Label x={392} y={92} cls="fill-zinc-400" size={10}>GROUP_CONCAT(DISTINCT region ORDER BY region)</Label>
        <text x={392} y={118} fontSize={12} className="fill-emerald-300" fontFamily={MONO}>APAC,EU,LATAM,US</text>
        <Label x={392} y={150} cls="fill-zinc-600" size={9}>deduped, alphabetized, one cell</Label>
      </motion.g>
      <motion.g {...fade(0.75)}>
        <Panel x={376} y={170} w={324} h={92} />
        <Label x={392} y={192} cls="fill-zinc-400">the VALUES band ladder, joined on price</Label>
        {([["budget", 8, "0 – 49.99"], ["mid", 4, "50 – 99.99"], ["premium", 4, "100 +"]] as Array<[string, number, string]>).map(([label, n, range], i) => (
          <g key={label}>
            <rect x={392} y={202 + i * 18} width={12} height={12} rx={3} className="fill-teal-400/30 stroke-teal-400/60" />
            <Label x={414} y={212 + i * 18} cls="fill-zinc-300" size={9.5}>{label}</Label>
            <text x={520} y={212 + i * 18} fontSize={9.5} className="fill-zinc-500" fontFamily={MONO}>{range}</text>
            <text x={688} y={212 + i * 18} textAnchor="end" fontSize={10} className="fill-teal-300" fontFamily={MONO}>{n}</text>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.9)}>
        <Label x={20} y={244} cls="fill-zinc-500" size={10}>a typed band table in FROM — no CASE ladder in the SELECT</Label>
        <Label x={20} y={266} cls="fill-zinc-600" size={9}>16 products: 8 + 4 + 4</Label>
      </motion.g>
    </svg>
  );
}

/** cs40 — UNION ALL appends the GRAND TOTAL row; the deliberate cross join. */
function Cs40GrandStack() {
  const cats: Array<[string, number]> = [
    ["Audio", 11744.01], ["Wearables", 6929.12], ["Video", 5198.41], ["Electronics", 4818.61],
    ["Accessories", 3294.29], ["Apparel", 1984.93], ["Fitness", 863.91],
  ];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Seven category revenues stacked by UNION ALL with a GRAND TOTAL row of 34833.28 appended; six suppliers cross joined with four regions make 24 coverage cells">
      <motion.g {...fade(0)}>
        <Label x={20} y={26} cls="fill-zinc-400">one column contract, two SELECTs</Label>
      </motion.g>
      {cats.map(([c, v], i) => (
        <motion.g key={c} {...fade(0.1 + i * 0.05)}>
          <Label x={36} y={52 + i * 26} cls="fill-zinc-300" size={10}>{c}</Label>
          <text x={300} y={52 + i * 26} textAnchor="end" fontSize={10} className="fill-zinc-400" fontFamily={MONO}>{v.toLocaleString("en-US", { minimumFractionDigits: 2 })}</text>
        </motion.g>
      ))}
      <motion.g {...fade(0.55)}>
        <rect x={24} y={228} width={292} height={30} rx={6} className="fill-emerald-400/15 stroke-emerald-400/70" />
        <Label x={36} y={248} cls="fill-emerald-200" size={10.5}>GRAND TOTAL</Label>
        <text x={300} y={248} textAnchor="end" fontSize={11} className="fill-emerald-300" fontFamily={MONO}>34,833.28</text>
        <Label x={20} y={284} cls="fill-zinc-500" size={10}>SELECT category, SUM(total) … UNION ALL SELECT &apos;GRAND TOTAL&apos;, SUM(total)</Label>
      </motion.g>
      <motion.g {...fade(0.7)}>
        <Panel x={400} y={44} w={300} h={214} />
        <Label x={416} y={66} cls="fill-zinc-400">the deliberate CROSS JOIN — coverage grid</Label>
        {["Alpine", "Andes", "Midwest", "Nordic", "Pacific", "Shenzhen"].map((s, ri) =>
          ["APAC", "EU", "LATAM", "US"].map((rg, ci) => (
            <rect key={`${s}-${rg}`} x={448 + ci * 62} y={78 + ri * 26} width={56} height={20} rx={4} className="fill-teal-400/10 stroke-teal-400/40" strokeWidth={1} />
          )),
        )}
        {["APAC", "EU", "LATAM", "US"].map((rg, ci) => (
          <text key={rg} x={476 + ci * 62} y={74} textAnchor="middle" fontSize={7} className="fill-zinc-500" fontFamily={MONO}>{rg}</text>
        ))}
        {["Alpine", "Andes", "Midwest", "Nordic", "Pacific", "Shenzhen"].map((s, ri) => (
          <text key={s} x={442} y={92 + ri * 26} textAnchor="end" fontSize={7} className="fill-zinc-500" fontFamily={MONO}>{s}</text>
        ))}
        <Label x={416} y={250} cls="fill-zinc-500" size={9}>6 × 4 = 24 cells — every pairing, on purpose</Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- lesson 50 — the data-fix ticket ---------------- */

/** cs50 — assess the damage: the verbatim census that opens the ticket. */
function Cs50DamageCensus() {
  const rows: Array<[string, number, string]> = [
    ["delivered", 52, "15,571.07"],
    ["shipped", 30, "11,996.72"],
    ["pending", 14, "6,113.00"],
    ["cancelled", 7, "1,152.49"],
  ];
  return (
    <svg viewBox="0 0 720 240" className="w-full" role="img" aria-label="The damage census: delivered 52 worth 15571.07, shipped 30 worth 11996.72, pending 14 worth 6113, cancelled 7 worth 1152.49 — 103 orders, 34833.28">
      <motion.g {...fade(0)}>
        <Label x={20} y={30} cls="fill-zinc-400">step 1 — READ before you write: the verbatim census</Label>
      </motion.g>
      {rows.map(([s, n, v], i) => (
        <motion.g key={s} {...fade(0.15 + i * 0.1)}>
          <rect x={24 + i * 172} y={52} width={156} height={110} rx={8} className="fill-zinc-900 stroke-zinc-800" strokeWidth={1} />
          <text x={102 + i * 172} y={104} textAnchor="middle" fontSize={24} className="fill-zinc-100" fontFamily={MONO}>{n}</text>
          <Label x={102 + i * 172} y={126} anchor="middle" cls="fill-zinc-400" size={10}>{s}</Label>
          <text x={102 + i * 172} y={148} textAnchor="middle" fontSize={10} className="fill-emerald-300" fontFamily={MONO}>${v}</text>
        </motion.g>
      ))}
      <motion.g {...fade(0.7)}>
        <Chip x={130} y={204} text="103 orders · $34,833.28 at risk" cls="fill-amber-400/10 stroke-amber-400/50" txt="fill-amber-300" size={10} />
        <Label x={260} y={208} cls="fill-zinc-500" size={10}>the baseline every later write must reconcile against</Label>
      </motion.g>
    </svg>
  );
}

/** cs50 — the runbook: read → insert → update → delete → upsert, in that order. */
function Cs50Runbook() {
  const steps: Array<[string, string, string]> = [
    ["1", "READ", "census baseline"],
    ["2", "INSERT", "the skipped launch"],
    ["3", "UPDATE", "the price feed"],
    ["4", "DELETE", "test line items"],
    ["5", "UPSERT", "the stock delta"],
  ];
  return (
    <svg viewBox="0 0 720 220" className="w-full" role="img" aria-label="The incident runbook in order: read, insert, update, delete, upsert — children before parents, deltas merged not trusted">
      {steps.map(([n, verb, note], i) => (
        <motion.g key={n} {...fade(i * 0.12)}>
          <rect x={20 + i * 140} y={64} width={124} height={92} rx={8} className="fill-zinc-900 stroke-zinc-700" strokeWidth={1} />
          <circle cx={44 + i * 140} cy={88} r={11} className="fill-emerald-400/20 stroke-emerald-400/70" />
          <text x={44 + i * 140} y={92} textAnchor="middle" fontSize={11} className="fill-emerald-300" fontFamily={MONO}>{n}</text>
          <text x={60 + i * 140} y={92} fontSize={11} className="fill-zinc-100" fontFamily={MONO}>{verb}</text>
          <Label x={32 + i * 140} y={116} cls="fill-zinc-400" size={9}>{note}</Label>
          {i < 4 && <Arrow x1={148 + i * 140} y1={110} x2={160 + i * 140} y2={110} cls="stroke-emerald-400" />}
        </motion.g>
      ))}
      <motion.g {...fade(0.8)}>
        <Label x={20} y={190} cls="fill-zinc-500" size={10}>children before parents on DELETE · deltas merged, never trusted · every write gets its row count checked</Label>
      </motion.g>
    </svg>
  );
}

/** cs50 — the four writes and their verified outcomes, sandboxed. */
function Cs50WriteSteps() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Four writes: insert product 17 Streaming Mic Arm at 29.99 stock 75; update Wearables to 84 and 209.99 in one statement; delete 12 line items under cancelled orders; upsert mouse stock to 340">
      {[
        { x: 20, y: 40, verb: "INSERT", color: "stroke-emerald-400/60", lines: ["products #17 · Streaming Mic Arm", "Audio · 29.99 · stock 75 · supplier 5", "one row in, RETURNING id = 17"] },
        { x: 372, y: 40, verb: "UPDATE", color: "stroke-teal-400/50", lines: ["Fitness Band X2 → 84.00", "Smart Watch S → 209.99", "one statement, CASE per row"] },
        { x: 20, y: 172, verb: "DELETE", color: "stroke-amber-400/50", lines: ["12 order_items under cancelled", "orders — children first", "affected count = 12 = truth"] },
        { x: 372, y: 172, verb: "UPSERT", color: "stroke-zinc-500", lines: ["Wireless Mouse M3 stock → 340", "today's delta applied ON CONFLICT", "merged, not trusted"] },
      ].map((q) => (
        <motion.g key={q.verb} {...fade(q.y === 40 ? 0.1 : 0.45)}>
          <Panel x={q.x} y={q.y} w={328} h={q.y === 40 ? 116 : 104} />
          <text x={q.x + 16} y={q.y + 26} fontSize={11} className="fill-zinc-100" fontFamily={MONO}>{q.verb}</text>
          <rect x={q.x + 16} y={q.y + 34} width={296} height={1} className="fill-zinc-800" />
          {q.lines.map((l, li) => (
            <Label key={l} x={q.x + 16} y={q.y + 56 + li * 20} cls={li === 0 ? "fill-zinc-200" : "fill-zinc-500"} size={9.5}>{l}</Label>
          ))}
        </motion.g>
      ))}
      <motion.g {...fade(0.8)}>
        <Label x={20} y={292} cls="fill-zinc-500" size={10}>sandboxed ticket: BEGIN → the four writes → verify counts → COMMIT (or ROLL back and nobody ever knew)</Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- lesson 51 — building the reporting layer ---------------- */

/** cs51 — the reporting layer: five moves stacked on the base schema. */
function Cs51LayerStack() {
  const layers: Array<[string, string, string, string]> = [
    ["idx_orders_created", "INDEX", "the calendar filter goes SEARCH", "stroke-zinc-600"],
    ["month_targets", "TABLE", "PK + NOT NULL + CHECK (target >= 0)", "stroke-amber-400/50"],
    ["recursive spine", "CTE", "14 months, even the empty ones", "stroke-teal-400/50"],
    ["month_revenue", "VIEW", "the month query, named once", "stroke-emerald-400/60"],
    ["storefront base", "9 TABLES", "orders · products · customers …", "stroke-zinc-700"],
  ];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="The reporting layer stacked on the base schema: view names the query, recursive spine keeps months honest, targets table has teeth, index speeds the calendar filter">
      {layers.map(([name, kind, note, stroke], i) => (
        <motion.g key={name} {...fade(i * 0.14)}>
          <rect x={140 - i * 24} y={40 + i * 44} width={360 + i * 48} height={38} rx={7} className="fill-zinc-900 stroke-zinc-800" strokeWidth={1} />
          <rect x={140 - i * 24} y={40 + i * 44} width={360 + i * 48} height={38} rx={7} fill="none" className={stroke} strokeWidth={1} />
          <text x={160 - i * 24} y={64 + i * 44} fontSize={11} className="fill-zinc-100" fontFamily={MONO}>{name}</text>
          <Chip x={330 - i * 24} y={59 + i * 44} text={kind} cls="fill-zinc-800/60 stroke-zinc-600" txt="fill-zinc-300" size={8.5} />
          <Label x={386 - i * 24} y={63 + i * 44} cls="fill-zinc-500" size={9.5}>{note}</Label>
        </motion.g>
      ))}
      <motion.g {...fade(0.85)}>
        <Label x={20} y={284} cls="fill-zinc-500" size={10}>built bottom-up, queried top-down — every layer is one CREATE away</Label>
      </motion.g>
    </svg>
  );
}

/** cs51 — the recursive spine walks 14 months and names the trough. */
function Cs51WorstMonth() {
  const rev = [3731.97, 3609.64, 2617.08, 2468.91, 2910.31, 2047.43, 1193.86, 2352.07, 3116.04, 2975.67, 1648.8, 2101.47, 1669.5, 2390.53];
  const max = 3731.97;
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="Recursive spine seeds 2024-01 and walks 14 months; LEFT JOIN to revenue finds the July trough 1193.86 — the worst month">
      <motion.g {...fade(0)}>
        <Label x={20} y={28} cls="fill-zinc-400">seed &apos;2024-01&apos; → m &lt; 14 guard → LEFT JOIN revenue — every month survives</Label>
      </motion.g>
      {rev.map((v, i) => {
        const h = Math.max((v / max) * 140, 8);
        const x = 28 + i * 48;
        const trough = v === 1193.86;
        return (
          <motion.g key={i} {...fade(0.1 + i * 0.04)}>
            <rect x={x} y={206 - h} width={36} height={h} rx={4} className={trough ? "fill-amber-400/25 stroke-amber-400/70" : "fill-emerald-400/15 stroke-emerald-400/50"} strokeWidth={1} />
            <text x={x + 18} y={222} textAnchor="middle" fontSize={8.5} className="fill-zinc-500" fontFamily={MONO}>{`m${i + 1}`}</text>
          </motion.g>
        );
      })}
      <motion.g {...fade(0.7)}>
        <line x1={20} y1={206} x2={704} y2={206} className="stroke-zinc-700" />
        <rect x={328} y={40} width={120} height={40} rx={7} className="fill-amber-400/10 stroke-amber-400/60" />
        <text x={388} y={58} textAnchor="middle" fontSize={10} className="fill-amber-300" fontFamily={MONO}>2024-07</text>
        <text x={388} y={72} textAnchor="middle" fontSize={10} className="fill-amber-200" fontFamily={MONO}>1,193.86</text>
        <Label x={20} y={252} cls="fill-zinc-500" size={10}>ORDER BY revenue LIMIT 1 — the standup gets the exact number, not a shrug</Label>
      </motion.g>
    </svg>
  );
}

/** cs51 — inventory the schema you stand on: what the ticket added. */
function Cs51SchemaGains() {
  const base = ["customers", "expenses", "invoices", "ledger_entries", "order_items", "orders", "payments", "products", "suppliers"];
  const gains: Array<[string, string, string]> = [
    ["view", "month_revenue", "the month query, named once"],
    ["table", "month_targets", "staging with CHECK teeth"],
    ["index", "idx_orders_created", "the calendar filter, indexed"],
  ];
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="sqlite_master inventory: nine base tables plus three objects the ticket added — a view, a table and an index">
      <motion.g {...fade(0)}>
        <Panel x={20} y={52} w={300} h={196} />
        <Label x={36} y={76} cls="fill-zinc-400">the storefront you found — 9 tables</Label>
        {base.map((t, i) => (
          <g key={t}>
            <text x={52 + (i % 2) * 140} y={100 + Math.floor(i / 2) * 26} fontSize={9.5} className="fill-zinc-400" fontFamily={MONO}>{t}</text>
          </g>
        ))}
        <Label x={36} y={232} cls="fill-zinc-600" size={9}>sqlite_master, type = &apos;table&apos;</Label>
      </motion.g>
      <motion.g {...fade(0.4)}>
        <Arrow x1={324} y1={150} x2={352} y2={150} cls="stroke-emerald-400" />
        <Label x={338} y={138} anchor="middle" cls="fill-emerald-300" size={9}>+ticket</Label>
      </motion.g>
      <motion.g {...fade(0.55)}>
        <Panel x={356} y={52} w={344} h={196} cls="fill-emerald-400/5 stroke-emerald-400/40" />
        <Label x={372} y={76} cls="fill-emerald-300">what the reporting layer added</Label>
        {gains.map(([type, name, note], i) => (
          <g key={name}>
            <rect x={372} y={92 + i * 48} width={312} height={40} rx={6} className="fill-zinc-900 stroke-zinc-800" strokeWidth={1} />
            <Chip x={408} y={112 + i * 48} text={type} cls="fill-teal-400/10 stroke-teal-400/50" txt="fill-teal-300" size={8.5} />
            <text x={446} y={110 + i * 48} fontSize={10} className="fill-zinc-200" fontFamily={MONO}>{name}</text>
            <Label x={446} y={124 + i * 48} cls="fill-zinc-500" size={9}>{note}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.85)}>
        <Label x={20} y={272} cls="fill-zinc-500" size={10}>close the ticket like a professional: SELECT type, name FROM sqlite_master — inventory what you stand on</Label>
      </motion.g>
    </svg>
  );
}

/* ---------------- lesson 58 — the quarter-end close pack ---------------- */

/** cs58 — the close pack: five deliverables, each with its live number. */
function Cs58ClosePack() {
  const cards: Array<[string, string, string, string]> = [
    ["PIPELINE", "due-date buckets", "15,609", "owed, by due month"],
    ["CASH", "LAG growth line", "68,687", "landed, 13 months"],
    ["ROLLFWD", "net per customer", "17,365", "11 customers"],
    ["TIE-OUT", "subledger vs GL", "gap 925", "the void refund"],
    ["LEAGUE", "CUME_DIST", "top-3 65%", "of all exposure"],
  ];
  return (
    <svg viewBox="0 0 720 220" className="w-full" role="img" aria-label="The close pack's five deliverables: due-date pipeline 15,609 owed; cash curve 68,687 landed; rollforward 17,365 across 11 customers; tie-out gap 925; exposure league top three hold 65 percent">
      {cards.map(([tag, name, num, note], i) => (
        <motion.g key={tag} {...fade(i * 0.12)}>
          <rect x={20 + i * 140} y={56} width={124} height={96} rx={8} className="fill-zinc-900 stroke-zinc-700" strokeWidth={1} />
          <text x={32 + i * 140} y={80} fontSize={8.5} className="fill-zinc-500" fontFamily={MONO}>{tag}</text>
          <Label x={32 + i * 140} y={102} cls="fill-zinc-200" size={9.5}>{name}</Label>
          <text x={32 + i * 140} y={126} fontSize={13} className="fill-emerald-300" fontFamily={MONO}>{num}</text>
          <Label x={32 + i * 140} y={142} cls="fill-zinc-500" size={8.5}>{note}</Label>
        </motion.g>
      ))}
      <motion.g {...fade(0.8)}>
        <Label x={20} y={190} cls="fill-zinc-500" size={10}>frozen AS OF 2025-03-15 · every number reproducible on demand · reads only — the pack never touches the books</Label>
      </motion.g>
    </svg>
  );
}

/** cs58 — thirteen months of cash collected (bars) vs revenue booked (line). */
function Cs58CashVsBook() {
  const cash = [2430, 7993, 4231, 4978, 1982, 5888, 6254.5, 8420.5, 6185, 2807, 5490, 5877, 7076];
  const booked = [7003, 5009, 5284, 4318, 5888, 2968, 7270, 5801, 6187, 8297, 8830, 11085, 8112];
  const labels = ["24-02", "24-03", "24-04", "24-05", "24-06", "24-07", "24-08", "24-09", "24-10", "24-11", "24-12", "25-01", "25-02"];
  const MAX = 11085;
  const base = 208, top = 58, H = base - top;
  const step = 49.2, x0 = 50, bw = 28;
  const cx = (i: number) => x0 + i * step + bw / 2;
  const cy = (v: number) => base - (v / MAX) * H;
  const linePts = booked.map((v, i) => `${cx(i)},${cy(v)}`).join(" ");
  return (
    <svg viewBox="0 0 720 280" className="w-full" role="img" aria-label="Thirteen months, February 2024 to February 2025: bars are cash collected, peaking 7,993 in March 2024; the line is revenue booked, peaking 11,085 in January 2025 while that month's cash was only 5,877 — booked is not banked">
      {/* legend */}
      <motion.g {...fade(0)}>
        <rect x={20} y={24} width={10} height={10} rx={2} className="fill-emerald-400/25 stroke-emerald-400/60" strokeWidth={1} />
        <Label x={36} y={33} cls="fill-zinc-400" size={9.5}>cash collected (payments)</Label>
        <line x1={196} y1={29} x2={222} y2={29} className="stroke-teal-400" strokeWidth={1.5} />
        <Label x={228} y={33} cls="fill-zinc-400" size={9.5}>revenue booked (non-void invoices)</Label>
      </motion.g>
      {/* bars + line + labels */}
      {cash.map((v, i) => {
        const h = Math.max((v / MAX) * H, 3);
        return (
          <motion.g key={i} {...fade(0.08 + i * 0.035)}>
            <rect x={x0 + i * step} y={base - h} width={bw} height={h} rx={3} className="fill-emerald-400/20 stroke-emerald-400/50" strokeWidth={1} />
            <text x={cx(i)} y={base + 14} textAnchor="middle" fontSize={8} className="fill-zinc-500" fontFamily={MONO}>{labels[i]}</text>
          </motion.g>
        );
      })}
      <motion.g {...fade(0.5)}>
        <polyline points={linePts} fill="none" className="stroke-teal-400" strokeWidth={1.5} strokeDasharray="1 0" />
        {booked.map((v, i) => (
          <circle key={i} cx={cx(i)} cy={cy(v)} r={2.4} className="fill-teal-300" />
        ))}
      </motion.g>
      {/* cash peak annotation */}
      <motion.g {...fade(0.65)}>
        <text x={cx(1)} y={base - (7993 / MAX) * H - 8} textAnchor="middle" fontSize={9} className="fill-emerald-300" fontFamily={MONO}>7,993 peak</text>
      </motion.g>
      {/* booked peak callout */}
      <motion.g {...fade(0.75)}>
        <rect x={452} y={14} width={200} height={40} rx={7} className="fill-zinc-900 stroke-teal-400/50" strokeWidth={1} />
        <text x={464} y={30} fontSize={9.5} className="fill-zinc-200" fontFamily={MONO}>25-01 booked 11,085</text>
        <text x={464} y={44} fontSize={9} className="fill-zinc-400" fontFamily={MONO}>cash that month: 5,877</text>
        <Arrow x1={570} y1={54} x2={600} y2={58} cls="stroke-teal-400" />
      </motion.g>
      {/* baseline + totals */}
      <motion.g {...fade(0.85)}>
        <line x1={40} y1={base} x2={700} y2={base} className="stroke-zinc-700" />
        <Label x={20} y={252} cls="fill-zinc-500" size={10}>booked 86,052 · cash against live bills 68,687 — the 17,365 between them is exactly the receivable this pack chases</Label>
      </motion.g>
    </svg>
  );
}

/** cs58 — the two-worlds tie-out: subledger 17,365 vs GL 16,440, gap = 925 refund. */
function Cs58TwoWorlds() {
  const scale = 10 / 1000; // px per dollar
  const base = 246;
  const openH = 15609 * scale, ghostH = 1756 * scale, ledgerH = 16440 * scale;
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="The tie-out: the subledger stacks open AR 15,609 plus the ghost 1,756 for 17,365; the ledger shows one 16,440 net. The 925 between them is the void invoice's payment — a refund owed to Liam, not an error">
      {/* left: subledger stack */}
      <motion.g {...fade(0)}>
        <Label x={72} y={40} cls="fill-zinc-300">the subledger — evidence per row</Label>
        <rect x={72} y={base - openH} width={190} height={openH} rx={4} className="fill-emerald-400/15 stroke-emerald-400/60" strokeWidth={1} />
        <text x={167} y={base - openH / 2} textAnchor="middle" fontSize={11} className="fill-emerald-200" fontFamily={MONO}>open AR</text>
        <text x={167} y={base - openH / 2 + 18} textAnchor="middle" fontSize={12} className="fill-emerald-300" fontFamily={MONO}>15,609</text>
        <rect x={72} y={base - openH - ghostH - 4} width={190} height={ghostH} rx={4} className="fill-amber-400/20 stroke-amber-400/70" strokeWidth={1} />
        <text x={167} y={base - openH - 11} textAnchor="middle" fontSize={9.5} className="fill-amber-200" fontFamily={MONO}>ghost · 1,756</text>
        <line x1={72} y1={base} x2={262} y2={base} className="stroke-zinc-600" />
        <text x={274} y={base - openH - ghostH + 4} fontSize={11} className="fill-zinc-100" fontFamily={MONO}>Σ 17,365</text>
      </motion.g>
      {/* right: ledger */}
      <motion.g {...fade(0.25)}>
        <Label x={470} y={40} cls="fill-zinc-300">the ledger — the GL&apos;s net</Label>
        <rect x={470} y={base - ledgerH} width={190} height={ledgerH} rx={4} className="fill-zinc-800/60 stroke-zinc-600" strokeWidth={1} />
        <text x={565} y={base - ledgerH / 2} textAnchor="middle" fontSize={11} className="fill-zinc-300" fontFamily={MONO}>accounts_receivable</text>
        <text x={565} y={base - ledgerH / 2 + 18} textAnchor="middle" fontSize={12} className="fill-zinc-100" fontFamily={MONO}>16,440</text>
        <line x1={470} y1={base} x2={660} y2={base} className="stroke-zinc-600" />
      </motion.g>
      {/* the 925 bridge */}
      <motion.g {...fade(0.5)}>
        <line x1={280} y1={base - ledgerH} x2={452} y2={base - ledgerH} className="stroke-rose-400" strokeWidth={1.2} strokeDasharray="5 4" />
        <Arrow x1={404} y1={base - ledgerH} x2={448} y2={base - ledgerH} cls="stroke-rose-400" />
        <text x={366} y={base - ledgerH - 10} textAnchor="middle" fontSize={12} className="fill-rose-300" fontFamily={MONO}>− 925</text>
        <Label x={366} y={base - ledgerH + 22} anchor="middle" cls="fill-zinc-400" size={9}>INV-2024-011&apos;s cash arrived —</Label>
        <Label x={366} y={base - ledgerH + 36} anchor="middle" cls="fill-zinc-400" size={9}>against a voided bill: a refund owed</Label>
        <Label x={366} y={base - ledgerH + 50} anchor="middle" cls="fill-zinc-400" size={9}>to Liam, not AR settled</Label>
      </motion.g>
      {/* exception ledger */}
      <motion.g {...fade(0.75)}>
        <rect x={72} y={262} width={340} height={30} rx={6} className="fill-amber-400/10 stroke-amber-400/50" strokeWidth={1} />
        <text x={84} y={281} fontSize={9} className="fill-amber-200" fontFamily={MONO}>ghost 1,756 — status &apos;paid&apos; · zero payments · both worlds</text>
        <rect x={420} y={262} width={240} height={30} rx={6} className="fill-rose-400/10 stroke-rose-400/50" strokeWidth={1} />
        <text x={432} y={281} fontSize={9} className="fill-rose-200" fontFamily={MONO}>void 925 — cash, no live bill</text>
      </motion.g>
    </svg>
  );
}

/* ---------------- registry ---------------- */

export const FIGURES_CS: Record<string, React.ComponentType> = {
  "cs35-brief-map": Cs35BriefMap,
  "cs35-filter-funnel": Cs35FilterFunnel,
  "cs35-shape-ladder": Cs35ShapeLadder,
  "cs36-join-picker": Cs36JoinPicker,
  "cs36-anti-holes": Cs36AntiHoles,
  "cs36-revenue-map": Cs36RevenueMap,
  "cs37-arm-stack": Cs37ArmStack,
  "cs37-pivot-grid": Cs37PivotGrid,
  "cs37-workflow-order": Cs37WorkflowOrder,
  "cs38-stage-average": Cs38StageAverage,
  "cs38-exists-probe": Cs38ExistsProbe,
  "cs38-cte-pipeline": Cs38CtePipeline,
  "cs39-month-buckets": Cs39MonthBuckets,
  "cs39-running-line": Cs39RunningLine,
  "cs39-gap-lag": Cs39GapLag,
  "cs40-filter-census": Cs40FilterCensus,
  "cs40-fold-band": Cs40FoldBand,
  "cs40-grand-stack": Cs40GrandStack,
  "cs50-damage-census": Cs50DamageCensus,
  "cs50-runbook": Cs50Runbook,
  "cs50-write-steps": Cs50WriteSteps,
  "cs51-layer-stack": Cs51LayerStack,
  "cs51-worst-month": Cs51WorstMonth,
  "cs51-schema-gains": Cs51SchemaGains,
  "cs58-close-pack": Cs58ClosePack,
  "cs58-cash-vs-book": Cs58CashVsBook,
  "cs58-two-worlds": Cs58TwoWorlds,
};
