"use client";

// Module 2 DEEP-DIVE figures (v9–v16) — the premium theory layer for joins.
// Same visual language as diagrams-m1x.tsx: 720-wide viewBox, Tailwind palette
// classes, framer-motion reveals. Every number shown is real and was verified
// against the live storefront engine via scripts/m2-deep-facts.ts (+facts2).

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

function Rail({ text }: { text: string }) {
  return (
    <motion.g {...fade(1.15)}>
      <rect x={24} y={252} width={676} height={30} rx={7} className="fill-violet-400/10 stroke-violet-400/40" />
      <Label x={362} y={271} anchor="middle" cls="fill-violet-300">{text}</Label>
    </motion.g>
  );
}

/* ---------- v9 · the pair factory (L9) ---------- */

function V9PairFactory() {
  const rand = rng(23);
  const orders: React.JSX.Element[] = [];
  for (let i = 0; i < 30; i++) {
    const cx = 40 + (i % 10) * 22 + rand() * 4 - 2;
    const cy = 92 + Math.floor(i / 10) * 17 + rand() * 4 - 2;
    orders.push(<circle key={i} cx={cx} cy={cy} r={4.2} className={i < 3 ? "fill-teal-400" : "fill-zinc-600"} opacity={i < 3 ? 1 : 0.55} />);
  }
  const customers: React.JSX.Element[] = [];
  for (let i = 0; i < 16; i++) {
    const cx = 470 + (i % 8) * 26 + rand() * 4 - 2;
    const cy = 96 + Math.floor(i / 8) * 20 + rand() * 4 - 2;
    customers.push(
      <circle key={i} cx={cx} cy={cy} r={4.6} className={i === 0 || i === 15 ? "fill-amber-300" : "fill-zinc-600"} opacity={i === 0 || i === 15 ? 1 : 0.55} />,
    );
  }
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="The join as a lookup loop: each order row probes customers by its foreign key and one stitched pair comes out">
      <motion.g {...fade(0)}>
        <Panel x={24} y={62} w={252} h={140} />
        <Label x={150} y={54} anchor="middle" cls="fill-zinc-300">orders — the outer loop · 103 rows</Label>
        {orders}
        <Label x={150} y={222} anchor="middle" cls="fill-zinc-500" size={10}>#1 → 16 · #2 → 13 · #3 → 1 …</Label>
      </motion.g>
      <motion.g {...fade(0.2)}>
        <Panel x={444} y={62} w={252} h={140} />
        <Label x={570} y={54} anchor="middle" cls="fill-zinc-300">customers — probed per row · 16 rows</Label>
        {customers}
        <Label x={570} y={222} anchor="middle" cls="fill-zinc-500" size={10}>1 Alice Chen · … · 16 Pedro Alvarez</Label>
      </motion.g>
      {/* probes */}
      <motion.g {...fade(0.45)}>
        <Pipe pts={[[128, 96], [330, 96], [468, 100]]} cls="stroke-teal-400/80" w={1.5} arrowAng={0} arrowCls="stroke-teal-400" delay={0.45} />
        <Label x={348} y={86} anchor="middle" cls="fill-teal-300" size={10}>order #1 probes customer 16 — match</Label>
        <Pipe pts={[[128, 130], [330, 130], [556, 100]]} cls="stroke-teal-400/60" w={1.4} arrowAng={0} arrowCls="stroke-teal-400" delay={0.65} />
        <Label x={348} y={144} anchor="middle" cls="fill-zinc-500" size={9}>order #2 probes customer 13</Label>
        <Pipe pts={[[128, 164], [330, 164], [474, 100]]} cls="stroke-teal-400/60" w={1.4} arrowAng={0} arrowCls="stroke-teal-400" delay={0.8} />
        <Label x={348} y={178} anchor="middle" cls="fill-zinc-500" size={9}>order #3 probes customer 1</Label>
        <Label x={348} y={116} anchor="middle" cls="fill-zinc-500" size={9}>ON c.id = o.customer_id — checked per pair</Label>
      </motion.g>
      {/* output */}
      <motion.g {...fade(0.95)}>
        <rect x={214} y={196} width={292} height={26} rx={7} className="fill-emerald-400/10 stroke-emerald-400/50" />
        <Label x={360} y={213} anchor="middle" cls="fill-emerald-300" size={10}>one stitched row per order — 103 in, 103 out</Label>
        <Label x={570} y={246} anchor="middle" cls="fill-amber-300/80" size={9}>Alice Chen (id 1) is probed 24× — busiest buyer</Label>
      </motion.g>
      <Rail text="A join is a lookup loop: each left row probes the right table for its key, and the match stitches." />
    </svg>
  );
}

/* ---------- v10 · the pairing grid (L10) ---------- */

function V10PairingGrid() {
  const cells: React.JSX.Element[] = [];
  // left grid: 16 customer rows x 12 order columns (of 103) — candidates vs survivors
  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 12; c++) {
      cells.push(
        <rect key={`${r}-${c}`} x={40 + c * 16} y={78 + r * 11} width={13} height={8} rx={1.5}
          className={c === 0 ? "fill-teal-400/70" : "fill-zinc-800"} opacity={c === 0 ? 1 : 0.6} />,
      );
    }
  }
  const coll: React.JSX.Element[] = [];
  // right grid: same shape — o.id = c.id accidental diagonal
  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 12; c++) {
      coll.push(
        <rect key={`${r}-${c}`} x={424 + c * 16} y={78 + r * 11} width={13} height={8} rx={1.5}
          className={r === c ? "fill-rose-400/80" : "fill-zinc-800"} opacity={r === c ? 1 : 0.6} />,
      );
    }
  }
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Two pairing grids: the foreign key lights one cell per order — 103 survivors; the accidental id collision lights a wrong diagonal — 16 rows of plausible nonsense">
      {/* left grid */}
      <motion.g {...fade(0)}>
        <Label x={40} y={56} cls="fill-zinc-300" size={11}>ON c.id = o.customer_id — the real thread</Label>
        <Label x={40} y={70} cls="fill-zinc-500" size={9}>every order lights exactly one cell — 103 of 1,648 survive</Label>
        {cells}
        <Label x={40} y={266} cls="fill-zinc-500" size={9}>customers ↓ 16 · orders → 103 (12 shown)</Label>
        <Label x={252} y={120} cls="fill-teal-300" size={10}>103 pairs ✓</Label>
      </motion.g>
      {/* right grid */}
      <motion.g {...fade(0.5)}>
        <Label x={424} y={56} cls="fill-zinc-300" size={11}>ON o.id = c.id — the counter collision</Label>
        <Label x={424} y={70} cls="fill-zinc-500" size={9}>two counters · the diagonal = 16 accidental pairings</Label>
        {coll}
        <Label x={424} y={266} cls="fill-zinc-500" size={9}>orders 17+ find nothing and vanish</Label>
        <Label x={640} y={120} cls="fill-rose-300" size={10}>16 accidents</Label>
      </motion.g>
      <motion.g {...fade(0.8)}>
        <XMark x={424 + 9 * 16 + 6} y={78 + 9 * 11 + 4} cls="stroke-rose-300" s={5} delay={0.9} />
      </motion.g>
      <Rail text="ON is a sieve over all possible pairings — a wrong key never errors; it silently keeps wrong pairs." />
    </svg>
  );
}

/* ---------- v11 · hop stages (L11) ---------- */

function V11HopStages() {
  const stages = [
    { x: 24, title: "order_items", sub: "251 rows · the line grain", tag: "251" },
    { x: 198, title: "JOIN orders", sub: "one buyer per line", tag: "251" },
    { x: 372, title: "JOIN customers", sub: "one name per buyer", tag: "251" },
    { x: 546, title: "JOIN products", sub: "one product per line", tag: "251" },
  ];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="A four-table chain keeps 251 rows at every hop — many-to-one joins widen rows, they never multiply them">
      {stages.map((s, i) => (
        <motion.g key={s.title} {...fade(0.15 * i)}>
          <Stage x={s.x} y={92} w={150} h={92} label={s.title} cls={i === 0 ? "fill-zinc-900 stroke-zinc-800" : "fill-zinc-900 stroke-teal-400/40"} />
          <Label x={s.x + 75} y={126} anchor="middle" cls="fill-zinc-500" size={9.5}>{s.sub}</Label>
          <rect x={s.x + 39} y={140} width={72} height={24} rx={6} className={i === 0 ? "fill-zinc-800/60 stroke-zinc-700" : "fill-teal-400/10 stroke-teal-400/50"} />
          <Label x={s.x + 75} y={156} anchor="middle" cls={i === 0 ? "fill-zinc-300" : "fill-teal-300"} size={11}>{s.tag} rows</Label>
          {i < 3 && (
            <motion.g {...fade(0.15 * i + 0.3)}>
              <Arrow x1={s.x + 154} y1={138} x2={s.x + 194} y2={138} cls="stroke-zinc-500" />
            </motion.g>
          )}
        </motion.g>
      ))}
      <motion.g {...fade(0.75)}>
        <Label x={360} y={70} anchor="middle" cls="fill-zinc-400" size={10.5}>oi.order_id → o.id · o.customer_id → c.id · oi.product_id → p.id</Label>
        <Label x={360} y={220} anchor="middle" cls="fill-zinc-500" size={10}>every hop is many-to-one: each line finds exactly one order, one buyer, one product</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <Label x={170} y={248} anchor="middle" cls="fill-emerald-300" size={10}>wider: 3 columns → 11 columns</Label>
        <Label x={550} y={248} anchor="middle" cls="fill-rose-300" size={10}>taller: never — 251 stays 251</Label>
      </motion.g>
      <Rail text="A chain is foreign keys read aloud — many-to-one hops widen every row and the count never moves." />
    </svg>
  );
}

/* ---------- v12 · the preservation gate (L12) ---------- */

function V12PreservationGate() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="LEFT JOIN with the condition in ON keeps 53 rows including one NULL-filled ghost; moving the condition to WHERE deletes the ghost and collapses the join back to 52">
      {/* input */}
      <motion.g {...fade(0)}>
        <Stage x={24} y={78} w={140} h={118} label="customers · 16" />
        <Label x={94} y={116} anchor="middle" cls="fill-zinc-400" size={10}>every row must leave</Label>
        <Label x={94} y={134} anchor="middle" cls="fill-zinc-500" size={9.5}>— that's the promise</Label>
      </motion.g>
      {/* join gate */}
      <motion.g {...fade(0.25)}>
        <Arrow x1={168} y1={132} x2={204} y2={132} cls="stroke-zinc-500" />
        <Stage x={208} y={78} w={172} h={118} label="LEFT JOIN + ON delivered" cls="fill-zinc-900 stroke-sky-400/40" />
        <Label x={294} y={110} anchor="middle" cls="fill-zinc-400" size={10}>52 real matches</Label>
        <Label x={294} y={130} anchor="middle" cls="fill-sky-300" size={10}>+ 1 ghost, NULL-filled</Label>
        <Label x={294} y={156} anchor="middle" cls="fill-zinc-500" size={9.5}>Liam O'Brien · order cols = NULL</Label>
        <Label x={294} y={178} anchor="middle" cls="fill-emerald-300" size={10.5}>53 rows exit ✓</Label>
      </motion.g>
      {/* ghost anatomy */}
      <motion.g {...fade(0.5)}>
        <rect x={398} y={96} width={130} height={26} rx={6} className="fill-zinc-900 stroke-sky-400/50" />
        <Label x={463} y={113} anchor="middle" cls="fill-sky-300" size={9.5}>name: Liam · id: NULL</Label>
        <Label x={463} y={88} anchor="middle" cls="fill-zinc-500" size={9}>the ghost row itself</Label>
        <Label x={463} y={140} anchor="middle" cls="fill-zinc-500" size={9}>his one order (#20)</Label>
        <Label x={463} y={154} anchor="middle" cls="fill-zinc-500" size={9}>is shipped — not delivered</Label>
      </motion.g>
      {/* WHERE machine */}
      <motion.g {...fade(0.7)}>
        <Stage x={556} y={78} w={144} h={118} label="WHERE o.status='delivered'" cls="fill-zinc-900 stroke-rose-400/40" />
        <Label x={628} y={112} anchor="middle" cls="fill-rose-300" size={11}>NULL fails the test</Label>
        <XMark x={628} y={132} cls="stroke-rose-400" s={6} />
        <Label x={628} y={156} anchor="middle" cls="fill-zinc-500" size={9.5}>ghost deleted</Label>
        <Label x={628} y={178} anchor="middle" cls="fill-rose-300" size={10.5}>52 rows — INNER again</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <Pipe pts={[[380, 132], [398, 109]]} cls="stroke-sky-400/60" w={1.3} delay={0.9} />
        <Arrow x1={528} y1={109} x2={556} y2={109} cls="stroke-rose-400/60" />
      </motion.g>
      <Rail text="Right-table filters belong in ON — in WHERE they delete ghosts and LEFT JOIN silently turns INNER." />
    </svg>
  );
}

/* ---------- v13 · the hole detector (L13) ---------- */

function V13HoleDetector() {
  const holes = ["Bluetooth Speaker Mini", "Cycling Jersey Pro", "Ring Light 14\u0022", "Running Socks 3-pack", "USB-C Hub 7-in-1"];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="The anti-join machine: 16 products flow past a pending-lines probe, 11 match, 5 leave NULL-stamped and the IS NULL sieve keeps exactly those five holes">
      {/* input */}
      <motion.g {...fade(0)}>
        <Stage x={24} y={70} w={128} h={120} label="products · 16" />
        <Label x={88} y={104} anchor="middle" cls="fill-zinc-400" size={10}>which never appeared</Label>
        <Label x={88} y={120} anchor="middle" cls="fill-zinc-400" size={10}>in a pending order?</Label>
        <Label x={88} y={150} anchor="middle" cls="fill-zinc-500" size={9}>all ordered at least</Label>
        <Label x={88} y={164} anchor="middle" cls="fill-zinc-500" size={9}>once — 0 total holes</Label>
      </motion.g>
      {/* subquery stage */}
      <motion.g {...fade(0.25)}>
        <Arrow x1={156} y1={128} x2={192} y2={128} cls="stroke-zinc-500" />
        <Stage x={196} y={70} w={180} h={120} label="pending ids (subquery)" cls="fill-zinc-900 stroke-amber-400/40" />
        <Label x={286} y={98} anchor="middle" cls="fill-zinc-400" size={9.5}>SELECT DISTINCT product_id</Label>
        <Label x={286} y={114} anchor="middle" cls="fill-zinc-400" size={9.5}>FROM items JOIN orders</Label>
        <Label x={286} y={130} anchor="middle" cls="fill-zinc-400" size={9.5}>WHERE status = 'pending'</Label>
        <Label x={286} y={156} anchor="middle" cls="fill-amber-300" size={10}>a tidy virtual table —</Label>
        <Label x={286} y={172} anchor="middle" cls="fill-amber-300" size={10}>two hops collapsed to one</Label>
      </motion.g>
      {/* join + sieve */}
      <motion.g {...fade(0.5)}>
        <Arrow x1={380} y1={128} x2={416} y2={128} cls="stroke-zinc-500" />
        <Stage x={420} y={70} w={124} h={120} label="LEFT JOIN probe" cls="fill-zinc-900 stroke-teal-400/40" />
        <Label x={482} y={100} anchor="middle" cls="fill-teal-300" size={10}>11 products match</Label>
        <Label x={482} y={118} anchor="middle" cls="fill-zinc-500" size={9.5}>— real pending ids</Label>
        <Label x={482} y={142} anchor="middle" cls="fill-rose-300" size={10}>5 exit NULL-stamped</Label>
        <Label x={482} y={160} anchor="middle" cls="fill-zinc-500" size={9.5}>— the holes</Label>
      </motion.g>
      {/* sieve output */}
      <motion.g {...fade(0.75)}>
        <Arrow x1={548} y1={128} x2={584} y2={128} cls="stroke-zinc-500" />
        <Stage x={588} y={70} w={112} h={120} label="WHERE id IS NULL" cls="fill-zinc-900 stroke-rose-400/40" />
        {holes.map((h, i) => (
          <Label key={h} x={644} y={98 + i * 15} anchor="middle" cls="fill-rose-200" size={7.8}>{h}</Label>
        ))}
      </motion.g>
      <motion.g {...fade(0.95)}>
        <Label x={360} y={228} anchor="middle" cls="fill-zinc-500" size={10}>PK never NULL, so a NULL probe result can only mean "no match ever" — airtight</Label>
      </motion.g>
      <Rail text="LEFT JOIN + IS NULL is a hole detector — matches fall through the sieve; only the holes survive." />
    </svg>
  );
}

/* ---------- v14 · the mirror triangle (L14) ---------- */

function V14MirrorTriangle() {
  const names = ["Farid", "Grace", "Hiro", "Keiko", "Maya"];
  const cells: React.JSX.Element[] = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const self = r === c;
      const upper = c > r;
      cells.push(
        <g key={`${r}-${c}`}>
          <rect x={252 + c * 34} y={82 + r * 26} width={28} height={20} rx={4}
            className={upper ? "fill-emerald-400/15 stroke-emerald-400/60" : self ? "fill-zinc-900 stroke-zinc-700" : "fill-zinc-900 stroke-zinc-800"} />
          {self && <XMark x={252 + c * 34 + 14} y={82 + r * 26 + 10} cls="stroke-zinc-500" s={5} />}
          {!self && !upper && <XMark x={252 + c * 34 + 14} y={82 + r * 26 + 10} cls="stroke-zinc-600" s={5} />}
        </g>,
      );
    }
  }
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="The APAC self-join matrix: 25 region matches, 5 self-pairs crossed out, 5 mirror duplicates crossed out, 10 upper-triangle pairs survive — and c1.id < c2.id does both crossings at once">
      {/* axes */}
      <motion.g {...fade(0)}>
        <Label x={360} y={56} anchor="middle" cls="fill-zinc-300">APAC — 5 customers, region matches on every cell</Label>
        {names.map((n, i) => (
          <g key={n}>
            <Label x={266 + i * 34} y={76} anchor="middle" cls="fill-zinc-500" size={8.5}>{n}</Label>
            <Label x={244} y={96 + i * 26} anchor="end" cls="fill-zinc-500" size={8.5}>{n}</Label>
          </g>
        ))}
        {cells}
      </motion.g>
      {/* guard ladder */}
      <motion.g {...fade(0.55)}>
        <Stage x={30} y={82} w={168} h={150} label="the guard ladder" />
        <Label x={42} y={106} cls="fill-zinc-400" size={9.5}>no guard</Label>
        <Label x={186} y={106} anchor="end" cls="fill-rose-300" size={10.5}>94 rows</Label>
        <Label x={42} y={136} cls="fill-zinc-400" size={9.5}>c1.id &lt;&gt; c2.id</Label>
        <Label x={186} y={136} anchor="end" cls="fill-amber-300" size={10.5}>78 — mirrors left</Label>
        <Label x={42} y={166} cls="fill-zinc-400" size={9.5}>c1.id &lt; c2.id</Label>
        <Label x={186} y={166} anchor="end" cls="fill-emerald-300" size={10.5}>39 — the honest set</Label>
        <Label x={114} y={192} anchor="middle" cls="fill-zinc-500" size={8.5}>all four regions: 28+10+1+0</Label>
        <Label x={114} y={210} anchor="middle" cls="fill-zinc-600" size={8.5}>LATAM: Bruno alone → 0 pairs</Label>
      </motion.g>
      <motion.g {...fade(0.85)}>
        <Label x={432} y={232} anchor="middle" cls="fill-zinc-500" size={9.5}>strict &lt; needs unique ids — primary keys always are</Label>
      </motion.g>
      <Rail text="One guard — c1.id < c2.id — crosses out diagonal and mirrors at once: 25 candidates, 10 survivors." />
    </svg>
  );
}

/* ---------- v15 · the honest counter (L15) ---------- */

function V15HonestCounter() {
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Two counters read the same LEFT JOIN output: COUNT(*) counts the ghost row and reports 1 order for Liam; COUNT(o.id) skips the NULL and reports the true 0">
      {/* the strip */}
      <motion.g {...fade(0)}>
        <Panel x={24} y={58} w={384} h={150} />
        <Label x={216} y={50} anchor="middle" cls="fill-zinc-300">customers LEFT JOIN orders (ON delivered)</Label>
        <Label x={44} y={80} cls="fill-zinc-500" size={9}>c.name</Label>
        <Label x={180} y={80} cls="fill-zinc-500" size={9}>o.id</Label>
        <Label x={280} y={80} cls="fill-zinc-500" size={9}>o.total</Label>
        <line x1={24} y1={88} x2={408} y2={88} className="stroke-zinc-800" />
        {[
          ["Alice Chen", "#3", "767.64", false],
          ["Emma Wilson", "#8", "233.70", false],
          ["… 14 more buyers …", "…", "…", false],
          ["Liam O'Brien", "NULL", "NULL", true],
        ].map((r, ri) => (
          <g key={ri}>
            <rect x={32} y={96 + ri * 26} width={368} height={22} rx={4}
              className={r[3] ? "fill-sky-400/10 stroke-sky-400/50" : "fill-transparent"} />
            <Label x={44} y={111 + ri * 26} cls={r[3] ? "fill-sky-300" : "fill-zinc-300"} size={10}>{r[0] as string}</Label>
            <Label x={180} y={111 + ri * 26} cls={r[3] ? "fill-sky-300" : "fill-zinc-400"} size={10}>{r[1] as string}</Label>
            <Label x={280} y={111 + ri * 26} cls={r[3] ? "fill-sky-300" : "fill-zinc-400"} size={10}>{r[2] as string}</Label>
          </g>
        ))}
        <Label x={216} y={228} anchor="middle" cls="fill-zinc-500" size={9.5}>every customer here bought — but Liam never had a DELIVERED order</Label>
      </motion.g>
      {/* counter lanes */}
      <motion.g {...fade(0.45)}>
        <Stage x={440} y={66} w={260} h={56} label="COUNT(*) — counts rows" cls="fill-zinc-900 stroke-rose-400/40" />
        <Label x={456} y={96} cls="fill-zinc-400" size={10}>ghost row rides along → Liam reports</Label>
        <Label x={688} y={96} anchor="end" cls="fill-rose-300" size={12}>1</Label>
      </motion.g>
      <motion.g {...fade(0.65)}>
        <Stage x={440} y={142} w={260} h={56} label="COUNT(o.id) — counts values" cls="fill-zinc-900 stroke-emerald-400/40" />
        <Label x={456} y={172} cls="fill-zinc-400" size={10}>NULL is skipped → Liam reports</Label>
        <Label x={688} y={172} anchor="end" cls="fill-emerald-300" size={12}>0</Label>
      </motion.g>
      <motion.g {...fade(0.85)}>
        <Label x={570} y={228} anchor="middle" cls="fill-zinc-500" size={9.5}>6 customers have zero shipped orders — same lie, six ghosts</Label>
      </motion.g>
      <Rail text="COUNT(*) counts rows, COUNT(column) counts values — after LEFT JOIN, count the right side's id." />
    </svg>
  );
}

/* ---------- v16 · the inflation ledger (L16) ---------- */

function V16InflationLedger() {
  const dist = [
    { lines: 1, orders: 26 },
    { lines: 2, orders: 29 },
    { lines: 3, orders: 25 },
    { lines: 4, orders: 23 },
  ];
  return (
    <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="The fan-out lie and the aggregate-first fix: summing totals after joining lines reports 103,244.55 — 2.964x honest — while bucketing per order first lands back on 34,833.28">
      {/* honest lane */}
      <motion.g {...fade(0)}>
        <Stage x={24} y={54} w={148} h={64} label="orders · 103 rows" />
        <Label x={98} y={84} anchor="middle" cls="fill-emerald-300" size={11}>SUM = 34,833.28</Label>
        <Label x={98} y={102} anchor="middle" cls="fill-zinc-500" size={9}>the true revenue</Label>
      </motion.g>
      {/* fan-out machine */}
      <motion.g {...fade(0.2)}>
        <Arrow x1={176} y1={86} x2={212} y2={86} cls="stroke-zinc-500" />
        <Stage x={216} y={54} w={220} h={64} label="JOIN order_items" cls="fill-zinc-900 stroke-rose-400/40" />
        <Label x={326} y={78} anchor="middle" cls="fill-zinc-400" size={9.5}>each order replicates once per line</Label>
        <Label x={326} y={96} anchor="middle" cls="fill-rose-300" size={10}>103 rows → 251 rows</Label>
      </motion.g>
      <motion.g {...fade(0.4)}>
        <Arrow x1={440} y1={86} x2={476} y2={86} cls="stroke-zinc-500" />
        <Stage x={480} y={54} w={216} h={64} label="SUM(o.total) — the lie" cls="fill-zinc-900 stroke-rose-400/40" />
        <Label x={588} y={84} anchor="middle" cls="fill-rose-300" size={11}>103,244.55 · 2.964×</Label>
        <Label x={588} y={102} anchor="middle" cls="fill-zinc-500" size={9}>every total counted 1–4 times</Label>
      </motion.g>
      {/* distribution */}
      <motion.g {...fade(0.55)}>
        <Label x={326} y={142} anchor="middle" cls="fill-zinc-500" size={9}>lines per order — why DISTINCT can't save you (totals are unique, but that's luck):</Label>
        {dist.map((d, i) => (
          <g key={d.lines}>
            <rect x={228 + i * 104} y={152} width={92} height={22} rx={6} className="fill-zinc-900 stroke-zinc-700" />
            <Label x={274 + i * 104} y={167} anchor="middle" cls="fill-zinc-400" size={9}>{d.lines} line{d.lines > 1 ? "s" : ""} → {d.orders} orders</Label>
          </g>
        ))}
      </motion.g>
      {/* fix lane */}
      <motion.g {...fade(0.7)}>
        <Stage x={24} y={196} w={240} h={48} label="the fix — GROUP BY o.id first" cls="fill-zinc-900 stroke-emerald-400/40" />
        <Label x={144} y={226} anchor="middle" cls="fill-zinc-400" size={9.5}>103 buckets · each sums its OWN lines</Label>
        <Arrow x1={268} y1={220} x2={304} y2={220} cls="stroke-zinc-500" />
        <Stage x={308} y={196} w={180} h={48} label="then join / total" cls="fill-zinc-900 stroke-emerald-400/40" />
        <Label x={398} y={226} anchor="middle" cls="fill-emerald-300" size={11}>34,833.28 ✓</Label>
        <Label x={600} y={220} anchor="middle" cls="fill-zinc-500" size={9.5}>line-grain check:</Label>
        <Label x={600} y={234} anchor="middle" cls="fill-zinc-500" size={9.5}>SUM(qty × price) = 34,833.28 ✓</Label>
      </motion.g>
      <Rail text="Summing a one-side column after fan-out multiplies it — aggregate the many side per key first." />
    </svg>
  );
}

/* ---------------- registry ---------------- */

export const FIGURES_M2X: Partial<Record<FigureId, () => React.JSX.Element>> = {
  "v9-pair-factory": V9PairFactory,
  "v10-pairing-grid": V10PairingGrid,
  "v11-hop-stages": V11HopStages,
  "v12-preservation-gate": V12PreservationGate,
  "v13-hole-detector": V13HoleDetector,
  "v14-mirror-triangle": V14MirrorTriangle,
  "v15-honest-counter": V15HonestCounter,
  "v16-inflation-ledger": V16InflationLedger,
};
