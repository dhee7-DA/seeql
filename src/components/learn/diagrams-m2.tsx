"use client";

// Module 2 lesson figures (lessons 09–16) — second, concept-deep diagram per
// lesson. Same drawing kit as diagrams.tsx; registry merged there.

import { motion } from "framer-motion";
import type { FigureId } from "@/lib/curriculum/types";
import { Label, Arrow, Link, Pipe, Panel, XMark, DotField, fade } from "./diagrams-kit";

/* ---------- lesson 09 — the FK walk (order 1 → customer 16, seed-verified) ---------- */

function J9MentalModel() {
  return (
    <svg viewBox="0 0 720 270" className="w-full" role="img" aria-label="A join walks the foreign key: order 1 points at customer 16, and the result row stitches both rows together">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id</Label>
      </motion.g>
      <motion.g {...fade(0.25)}>
        <Label x={26} y={36} cls="fill-zinc-400" size={10}>orders — row #1</Label>
        <Panel x={26} y={44} w={260} h={110} />
        <Label x={42} y={66} cls="fill-zinc-500" size={9}>id</Label>
        <Label x={110} y={66} cls="fill-zinc-500" size={9}>customer_id</Label>
        <Label x={216} y={66} cls="fill-zinc-500" size={9}>total</Label>
        <line x1={26} y1={74} x2={286} y2={74} className="stroke-zinc-800" />
        <Label x={42} y={96} cls="fill-zinc-200" size={11}>1</Label>
        <Label x={110} y={96} cls="fill-teal-300" size={11}>16</Label>
        <Label x={216} y={96} cls="fill-zinc-200" size={11}>576.54</Label>
        <Label x={42} y={122} cls="fill-zinc-600" size={8}>amount lives here…</Label>
        <Label x={434} y={36} cls="fill-zinc-400" size={10}>customers — the row it points to</Label>
        <Panel x={434} y={44} w={260} h={110} />
        <Label x={450} y={66} cls="fill-zinc-500" size={9}>id</Label>
        <Label x={502} y={66} cls="fill-zinc-500" size={9}>name</Label>
        <Label x={640} y={66} cls="fill-zinc-500" size={9}>city</Label>
        <line x1={434} y1={74} x2={694} y2={74} className="stroke-zinc-800" />
        <Label x={450} y={96} cls="fill-teal-300" size={11}>16</Label>
        <Label x={502} y={96} cls="fill-zinc-200" size={11}>Pedro Alvarez</Label>
        <Label x={640} y={96} cls="fill-zinc-200" size={11}>Madrid</Label>
        <Label x={450} y={122} cls="fill-zinc-600" size={8}>…identity lives there</Label>
      </motion.g>
      <motion.g {...fade(0.55)}>
        <Link x1={290} y1={99} x2={430} y2={99} cls="stroke-teal-400" w={1.5} dot="fill-teal-400" delay={0.55} />
        <Label x={360} y={86} anchor="middle" cls="fill-teal-300" size={9}>customer_id 16 → id 16</Label>
        <Label x={360} y={118} anchor="middle" cls="fill-zinc-600" size={8}>the pointer is the join</Label>
        <Label x={360} y={132} anchor="middle" cls="fill-zinc-600" size={8}>one customer row per order row</Label>
      </motion.g>
      <motion.g {...fade(0.75)}>
        <Label x={42} y={142} cls="fill-teal-300/80" size={8}>customer_id — the foreign key</Label>
        <Label x={450} y={142} cls="fill-teal-300/80" size={8}>id — the primary key it names</Label>
        <Label x={26} y={162} cls="fill-zinc-600" size={8}>teal = the keys that meet</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <Label x={26} y={186} cls="fill-emerald-300" size={10}>result — one row, columns from both sides</Label>
        <Panel x={26} y={194} w={668} h={46} cls="fill-zinc-900 stroke-emerald-400/50" />
        <Label x={60} y={212} cls="fill-zinc-500" size={9}>o.id</Label>
        <Label x={60} y={230} cls="fill-zinc-100" size={12}>1</Label>
        <Label x={240} y={212} cls="fill-zinc-500" size={9}>c.name — borrowed from the lookup</Label>
        <Label x={240} y={230} cls="fill-zinc-100" size={12}>Pedro Alvarez</Label>
        <Label x={520} y={212} cls="fill-zinc-500" size={9}>o.total</Label>
        <Label x={520} y={230} cls="fill-emerald-200" size={12}>576.54</Label>
        <Arrow x1={156} y1={158} x2={110} y2={190} cls="stroke-emerald-400/70" />
        <Arrow x1={564} y1={158} x2={330} y2={190} cls="stroke-emerald-400/70" />
        <Label x={26} y={248} cls="fill-zinc-400" size={9}>SELECT then picks columns from either side; the match rule decides the rows</Label>
        <Label x={26} y={262} cls="fill-zinc-500" size={9}>every order borrows exactly one customer row at run time — normalization splits, JOIN reunites</Label>
      </motion.g>
      <motion.g {...fade(1.15)}>
        <rect x={556} y={244} width={138} height={24} rx={6} className="fill-zinc-900 stroke-zinc-800" />
        <Label x={625} y={260} anchor="middle" cls="fill-zinc-300" size={9}>103 in → 103 out</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 10 — cartesian product vs ON pruning (103 × 16 = 1648) ---------- */

function J10Cartesian() {
  const dots = (n: number, cols: number, x0: number, y0: number, cls: string, opacity = 0.9) =>
    [...Array(n)].map((_, i) => (
      <circle key={i} cx={x0 + (i % cols) * 12} cy={y0 + Math.floor(i / cols) * 12} r={3} className={cls} opacity={opacity} />
    ));
  return (
    <svg viewBox="0 0 720 290" className="w-full" role="img" aria-label="A JOIN with no ON pairs all 1648 order-customer combinations; adding ON prunes the pile to 103 true pairs">
      <motion.g {...fade(0)}>
        <Label x={26} y={24} cls="fill-zinc-500" size={9}>orders o JOIN customers c — no ON</Label>
        <Label x={420} y={24} cls="fill-zinc-500" size={9}>JOIN customers c ON c.id = o.customer_id</Label>
      </motion.g>
      <motion.g {...fade(0.25)}>
        <Label x={26} y={52} cls="fill-zinc-300" size={10}>every order × every customer</Label>
        <Label x={26} y={70} cls="fill-zinc-500" size={9}>orders · 103</Label>
        {dots(103, 12, 26, 78, "fill-zinc-500")}
        <Label x={186} y={118} anchor="middle" cls="fill-zinc-500" size={14}>×</Label>
        <Label x={214} y={70} cls="fill-zinc-500" size={9}>customers · 16</Label>
        {dots(16, 4, 214, 78, "fill-zinc-500")}
      </motion.g>
      <motion.g {...fade(0.55)}>
        <rect x={26} y={190} width={330} height={46} rx={8} className="fill-amber-400/10 stroke-amber-400/50" />
        <Label x={40} y={210} cls="fill-amber-200" size={16}>1648</Label>
        <Label x={104} y={210} cls="fill-zinc-400" size={10}>pairings — 103 × 16</Label>
        <Label x={40} y={227} cls="fill-zinc-500" size={8}>no match rule — every pairing survives, even impossible ones</Label>
      </motion.g>
      <motion.g {...fade(0.7)}>
        <Arrow x1={366} y1={116} x2={404} y2={116} cls="stroke-zinc-500" />
        <Label x={385} y={104} anchor="middle" cls="fill-zinc-400" size={9}>add ON</Label>
        <Label x={186} y={134} anchor="middle" cls="fill-zinc-600" size={8}>pair up</Label>
      </motion.g>
      <motion.g {...fade(0.8)}>
        <XMark x={385} y={130} cls="stroke-rose-400/70" s={4} delay={0.85} />
        <XMark x={385} y={142} cls="stroke-rose-400/70" s={4} delay={0.93} />
        <XMark x={385} y={154} cls="stroke-rose-400/70" s={4} delay={1.01} />
        <Label x={408} y={170} anchor="end" cls="fill-rose-300/80" size={8}>1545 pairings die at ON</Label>
      </motion.g>
      <motion.g {...fade(0.85)}>
        <Label x={420} y={52} cls="fill-emerald-300" size={10}>only true pairs survive</Label>
        <Label x={420} y={70} cls="fill-zinc-500" size={9}>orders · 103 — each keeps exactly its buyer</Label>
        {dots(103, 12, 420, 78, "fill-emerald-400", 0.85)}
        <Label x={570} y={110} cls="fill-zinc-600" size={8}>one dot =</Label>
        <Label x={570} y={122} cls="fill-zinc-600" size={8}>one order</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <Label x={26} y={182} cls="fill-zinc-600" size={8}>the pile pairs every order with every customer</Label>
        <Label x={420} y={182} cls="fill-zinc-600" size={8}>the gate keeps pairs where ON is true</Label>
      </motion.g>
      <motion.g {...fade(1.05)}>
        <circle cx={420} cy={78} r={6.5} className="stroke-emerald-300" strokeWidth={1.2} fill="none" />
        <Label x={694} y={82} anchor="end" cls="fill-emerald-300/90" size={8}>order 1 → Pedro, its buyer</Label>
      </motion.g>
      <motion.g {...fade(1)}>
        <rect x={420} y={190} width={274} height={46} rx={8} className="fill-emerald-400/10 stroke-emerald-400/60" />
        <Label x={434} y={210} cls="fill-emerald-200" size={16}>103</Label>
        <Label x={486} y={210} cls="fill-zinc-400" size={10}>rows — one per order</Label>
        <Label x={434} y={227} cls="fill-zinc-500" size={8}>the other 1545 pairings never make it out of ON</Label>
      </motion.g>
      <motion.g {...fade(1.1)}>
        <Label x={26} y={258} cls="fill-zinc-500" size={9}>a condition-less JOIN degenerates into a cartesian product — the match rule is what prunes it</Label>
        <Label x={26} y={274} cls="fill-zinc-600" size={9}>SQLite and MySQL run it anyway; PostgreSQL refuses — write CROSS JOIN if you mean it</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 11 — the two-hop chain (16 → 103 → 251, keys labeled) ---------- */

function J11HopMap() {
  return (
    <svg viewBox="0 0 720 262" className="w-full" role="img" aria-label="The two-hop chain: 16 customers to 103 orders to 251 order items, each hop joined on its foreign key">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items oi ON oi.order_id = o.id</Label>
        <Label x={26} y={40} cls="fill-zinc-400" size={10}>one foreign key per hop — the column names practically write the ON clauses</Label>
        <Label x={694} y={22} anchor="end" cls="fill-zinc-600" size={8}>3 tables · 2 hops</Label>
      </motion.g>
      <motion.g {...fade(0.25)}>
        <Label x={26} y={56} cls="fill-zinc-400" size={10}>customers</Label>
        <Panel x={26} y={64} w={168} h={84} />
        <Label x={40} y={102} cls="fill-zinc-100" size={20}>16</Label>
        <Label x={84} y={102} cls="fill-zinc-500" size={9}>rows</Label>
        <Label x={40} y={128} cls="fill-teal-300" size={9}>key: id</Label>
        <Label x={276} y={56} cls="fill-zinc-400" size={10}>orders</Label>
        <Panel x={276} y={64} w={168} h={84} />
        <Label x={290} y={102} cls="fill-zinc-100" size={20}>103</Label>
        <Label x={344} y={102} cls="fill-zinc-500" size={9}>rows</Label>
        <Label x={290} y={128} cls="fill-teal-300" size={9}>keys: id · customer_id</Label>
        <Label x={526} y={56} cls="fill-zinc-400" size={10}>order_items</Label>
        <Panel x={526} y={64} w={168} h={84} />
        <Label x={540} y={102} cls="fill-zinc-100" size={20}>251</Label>
        <Label x={594} y={102} cls="fill-zinc-500" size={9}>rows</Label>
        <Label x={540} y={128} cls="fill-teal-300" size={9}>keys: id · order_id</Label>
      </motion.g>
      <motion.g {...fade(0.4)}>
        <Label x={40} y={142} cls="fill-zinc-600" size={8}>start here — walk right</Label>
        <Label x={290} y={142} cls="fill-zinc-600" size={8}>each hop adds one JOIN … ON</Label>
        <Label x={540} y={142} cls="fill-zinc-600" size={8}>the deepest table</Label>
      </motion.g>
      <motion.g {...fade(0.5)}>
        <Arrow x1={198} y1={106} x2={272} y2={106} cls="stroke-emerald-400" />
        <Label x={235} y={94} anchor="middle" cls="fill-zinc-400" size={9}>1 : N</Label>
        <Arrow x1={448} y1={106} x2={522} y2={106} cls="stroke-emerald-400" />
        <Label x={485} y={94} anchor="middle" cls="fill-zinc-400" size={9}>1 : N</Label>
      </motion.g>
      <motion.g {...fade(0.75)}>
        <rect x={96} y={168} width={204} height={24} rx={6} className="fill-zinc-900 stroke-teal-400/50" />
        <Label x={198} y={160} anchor="middle" cls="fill-zinc-600" size={8}>hop 1</Label>
        <Label x={198} y={184} anchor="middle" cls="fill-teal-200" size={9}>customers.id = orders.customer_id</Label>
        <Label x={198} y={202} anchor="middle" cls="fill-zinc-600" size={8}>the FK points at the primary key</Label>
        <Pipe pts={[[198, 168], [198, 146], [235, 146], [235, 112]]} cls="stroke-teal-400/70" w={1.2} dash="3 3" arrowAng={-Math.PI / 2} delay={0.85} />
        <rect x={416} y={168} width={204} height={24} rx={6} className="fill-zinc-900 stroke-teal-400/50" />
        <Label x={518} y={160} anchor="middle" cls="fill-zinc-600" size={8}>hop 2</Label>
        <Label x={518} y={184} anchor="middle" cls="fill-teal-200" size={9}>orders.id = order_items.order_id</Label>
        <Label x={518} y={202} anchor="middle" cls="fill-zinc-600" size={8}>two hops, one chain</Label>
        <Pipe pts={[[518, 168], [518, 146], [485, 146], [485, 112]]} cls="stroke-teal-400/70" w={1.2} dash="3 3" arrowAng={-Math.PI / 2} delay={0.95} />
      </motion.g>
      <motion.g {...fade(1)}>
        <Label x={26} y={218} cls="fill-zinc-500" size={9}>16 → 103 → 251: rows only grow — every customer's orders, then every order's lines</Label>
        <Label x={26} y={234} cls="fill-zinc-600" size={9}>read backwards each hop is many-to-one, so no row ever duplicates — one JOIN … ON per hop</Label>
        <Label x={26} y={248} cls="fill-zinc-600" size={9}>build it hop by hop — check each hop's rows before adding the next join</Label>
      </motion.g>
      <motion.g {...fade(1.1)}>
        <rect x={540} y={210} width={154} height={26} rx={6} className="fill-zinc-900 stroke-zinc-800" />
        <Label x={617} y={227} anchor="middle" cls="fill-zinc-300" size={10}>16 → 103 → 251</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 12 — WHERE vs ON (103 kept in ON, 45 survive in WHERE) ---------- */

function J12WhereVsOn() {
  const dot = (i: number, x0: number) => ({ cx: x0 + (i % 12) * 12, cy: 104 + Math.floor(i / 12) * 12 });
  return (
    <svg viewBox="0 0 720 308" className="w-full" role="img" aria-label="In ON the region filter keeps all 103 orders with 58 NULL-filled; in WHERE those 58 die and only 45 rows survive, matching an INNER JOIN">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-300" size={10}>FROM orders o LEFT JOIN customers c … — same words, different home</Label>
        <line x1={372} y1={40} x2={372} y2={272} className="stroke-zinc-800" />
      </motion.g>
      <motion.g {...fade(0.3)}>
        <Label x={26} y={44} cls="fill-zinc-400" size={9}>ON o.customer_id = c.id</Label>
        <Label x={26} y={58} cls="fill-teal-300" size={9}>  AND c.region = 'EU'</Label>
        <Label x={26} y={80} cls="fill-zinc-300" size={10}>in ON — shapes the match</Label>
        <Label x={26} y={96} cls="fill-zinc-500" size={9}>103 rows — every order survives</Label>
        {[...Array(103)].map((_, i) => {
          const p = dot(i, 26);
          return <circle key={i} cx={p.cx} cy={p.cy} r={3} className={i < 45 ? "fill-emerald-400" : "fill-amber-400"} opacity={i < 45 ? 0.85 : 0.7} />;
        })}
        <circle cx={32} cy={219} r={3} className="fill-emerald-400" />
        <Label x={40} y={222} cls="fill-zinc-400" size={9}>45 matched (EU)</Label>
        <circle cx={150} cy={219} r={3} className="fill-amber-400" />
        <Label x={158} y={222} cls="fill-zinc-400" size={9}>58 NULL-filled (non-EU)</Label>
        <Label x={26} y={244} cls="fill-zinc-600" size={9}>non-EU buyers ride along with a NULL right side</Label>
      </motion.g>
      <motion.g {...fade(0.45)}>
        <Label x={200} y={140} cls="fill-zinc-600" size={8}>green = matched (EU),</Label>
        <Label x={200} y={152} cls="fill-zinc-600" size={8}>amber = NULL right side</Label>
        <Label x={200} y={164} cls="fill-zinc-600" size={8}>45 + 58 = 103 rows kept</Label>
        <Label x={545} y={140} cls="fill-rose-300/70" size={8}>58 ghost rows —</Label>
        <Label x={545} y={152} cls="fill-rose-300/70" size={8}>6 ×'s shown</Label>
      </motion.g>
      <motion.g {...fade(0.6)}>
        <Label x={392} y={44} cls="fill-zinc-400" size={9}>LEFT JOIN customers c ON …</Label>
        <Label x={392} y={58} cls="fill-rose-300" size={9}>WHERE c.region = 'EU'</Label>
        <Label x={392} y={80} cls="fill-zinc-300" size={10}>in WHERE — filters rows</Label>
        <Label x={392} y={96} cls="fill-zinc-500" size={9}>the 58 NULL rows fail the test…</Label>
        {[...Array(103)].map((_, i) => {
          const p = dot(i, 392);
          return <circle key={i} cx={p.cx} cy={p.cy} r={3} className={i < 45 ? "fill-emerald-400" : "fill-zinc-700"} opacity={i < 45 ? 0.85 : 0.4} />;
        })}
        {[46, 51, 56, 61, 66, 71].map((i, k) => {
          const p = dot(i, 392);
          return <XMark key={i} x={p.cx} y={p.cy} cls="stroke-rose-400/80" s={4} delay={0.9 + k * 0.06} />;
        })}
        <XMark x={398} y={219} cls="stroke-rose-400" s={4} delay={1.1} />
        <Label x={410} y={222} cls="fill-rose-300" size={9}>58 rows deleted — silently</Label>
      </motion.g>
      <motion.g {...fade(0.95)}>
        <rect x={26} y={252} width={330} height={26} rx={6} className="fill-zinc-900 stroke-emerald-400/40" />
        <Label x={191} y={269} anchor="middle" cls="fill-emerald-300" size={9}>the protective join still protects — 103 rows</Label>
      </motion.g>
      <motion.g {...fade(1)}>
        <rect x={392} y={232} width={302} height={40} rx={8} className="fill-emerald-400/10 stroke-emerald-400/60" />
        <Label x={406} y={258} cls="fill-emerald-200" size={14}>45 rows</Label>
        <Label x={478} y={258} cls="fill-zinc-400" size={9}>— identical to the INNER JOIN</Label>
        <Label x={26} y={286} cls="fill-zinc-500" size={9}>right-table filters belong in ON when the unmatched rows must survive — WHERE collapses the LEFT JOIN back to INNER</Label>
        <Label x={26} y={302} cls="fill-zinc-400" size={9}>filter the right table in ON; filter your own table in WHERE — that is the whole rule</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 13 — three spellings, one test (5 products; NOT IN dies on NULL) ---------- */

function J13ThreeSpellings() {
  return (
    <svg viewBox="0 0 720 310" className="w-full" role="img" aria-label="Three spellings of the anti-join all return 5 products today, but NOT IN alone collapses to zero if a NULL sneaks into the list">
      <motion.g {...fade(0)}>
        <Label x={20} y={22} cls="fill-zinc-300" size={10}>one test, three spellings — products that never appear in a pending order</Label>
        <Label x={20} y={38} cls="fill-zinc-500" size={9}>11 of 16 products sit on a pending line — 5 never do · the test: keep left rows with no partner</Label>
      </motion.g>
      <motion.g {...fade(0.15)}>
        <rect x={540} y={10} width={154} height={24} rx={6} className="fill-zinc-900 stroke-zinc-800" />
        <Label x={617} y={26} anchor="middle" cls="fill-zinc-300" size={9}>16 · 11 pending · 5 clean</Label>
      </motion.g>
      <motion.g {...fade(0.2)}>
        <Label x={129} y={50} anchor="middle" cls="fill-emerald-300/80" size={8}>① ② NULL-proof spellings</Label>
        <Label x={591} y={50} anchor="middle" cls="fill-amber-300/80" size={8}>③ has a trap door</Label>
      </motion.g>
      <motion.g {...fade(0.3)}>
        <Panel x={20} y={54} w={218} h={172} />
        <Label x={32} y={70} cls="fill-emerald-300" size={10}>① NOT EXISTS</Label>
        {["WHERE NOT EXISTS (SELECT 1", "  FROM order_items oi", "  JOIN orders o ON o.id = oi.order_id", "  WHERE oi.product_id = p.id", "    AND o.status = 'pending')"].map((l, i) => (
          <Label key={i} x={32} y={88 + i * 13} cls="fill-zinc-400" size={8}>{l}</Label>
        ))}
        <Label x={32} y={166} cls="fill-emerald-300" size={11}>→ 5 products</Label>
        <Label x={32} y={188} cls="fill-zinc-500" size={8}>pro: the planner sees the anti-join</Label>
        <Label x={32} y={202} cls="fill-zinc-600" size={8}>con: the longest to type</Label>
        <Panel x={251} y={54} w={218} h={172} />
        <Label x={263} y={70} cls="fill-emerald-300" size={10}>② LEFT JOIN + IS NULL</Label>
        {["LEFT JOIN (pending ids) pend", "  ON pend.product_id = p.id", "WHERE pend.product_id IS NULL", "  -- lesson 12's two gates"].map((l, i) => (
          <Label key={i} x={263} y={88 + i * 13} cls={i < 3 ? "fill-zinc-400" : "fill-zinc-600"} size={8}>{l}</Label>
        ))}
        <Label x={263} y={166} cls="fill-emerald-300" size={11}>→ 5 products</Label>
        <Label x={263} y={188} cls="fill-zinc-500" size={8}>pro: NULL-proof, works everywhere</Label>
        <Label x={263} y={202} cls="fill-zinc-600" size={8}>con: two gates to wire up</Label>
        <polyline points="140,162 144,167 152,158" className="stroke-emerald-400" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="371,162 375,167 383,158" className="stroke-emerald-400" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Panel x={482} y={54} w={218} h={172} />
        <Label x={494} y={70} cls="fill-amber-300" size={10}>③ NOT IN</Label>
        {["WHERE p.id NOT IN (SELECT", "  oi.product_id FROM order_items", "  JOIN orders o … pending)", "  -- shortest to type", "  -- but 1 NULL ⇒ 0 rows"].map((l, i) => (
          <Label key={i} x={494} y={88 + i * 13} cls={i < 3 ? "fill-zinc-400" : "fill-zinc-600"} size={8}>{l}</Label>
        ))}
        <Label x={494} y={166} cls="fill-amber-300" size={11}>→ 5 products — today</Label>
        <Label x={494} y={188} cls="fill-zinc-500" size={8}>pro: shortest to type</Label>
        <Label x={494} y={202} cls="fill-zinc-600" size={8}>con: one NULL poisons everything</Label>
      </motion.g>
      <motion.g {...fade(0.7)}>
        <rect x={482} y={236} width={218} height={48} rx={8} className="fill-rose-400/10 stroke-rose-400/60" />
        <Label x={494} y={254} cls="fill-rose-300" size={10}>NULL in the subquery list →</Label>
        <Label x={494} y={270} cls="fill-rose-300" size={10}>NOT IN returns nothing</Label>
        <Label x={20} y={250} cls="fill-zinc-500" size={9}>proved on this data: sneak one NULL into the list</Label>
        <Label x={20} y={264} cls="fill-zinc-500" size={9}>(UNION SELECT NULL) and NOT IN drops 5 → 0 rows,</Label>
        <Label x={20} y={278} cls="fill-zinc-500" size={9}>while ① and ② still report the honest 5</Label>
        <XMark x={470} y={260} cls="stroke-rose-400" s={5} delay={0.9} />
      </motion.g>
      <motion.g {...fade(0.85)}>
        <Label x={20} y={242} cls="fill-emerald-300/80" size={8}>① and ② are the NULL-proof spellings — prefer them in production</Label>
        <Label x={20} y={292} cls="fill-zinc-500" size={9}>today all three return the same 5 — the difference only shows when a NULL appears</Label>
      </motion.g>
      <motion.g {...fade(0.9)}>
        <Label x={20} y={300} cls="fill-zinc-600" size={9}>the LEFT JOIN + IS NULL shape asks the question with pieces you already own — and it cannot be poisoned</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 14 — one table opened twice (39 pairs, 10 in APAC) ---------- */

function J14TwoAliases() {
  const apac: Array<[number, string]> = [
    [6, "Farid Nasser"],
    [7, "Grace Kim"],
    [8, "Hiro Tanaka"],
    [11, "Keiko Sato"],
    [13, "Maya Patel"],
  ];
  const cy = (i: number) => 97 + i * 27;
  return (
    <svg viewBox="0 0 720 284" className="w-full" role="img" aria-label="One customers table opened twice as c1 and c2: the pairing rule cross-straps the 5 APAC rows into 10 pairs, 39 pairs across the whole table">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>FROM customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id &lt; c2.id</Label>
      </motion.g>
      <motion.g {...fade(0.25)}>
        <Label x={26} y={36} cls="fill-zinc-300" size={10}>customers — stored once, opened twice</Label>
        <Panel x={26} y={44} w={400} h={190} cls="fill-zinc-900 stroke-zinc-700" />
        <rect x={40} y={56} width={34} height={20} rx={5} className="fill-teal-400/15 stroke-teal-400/60" />
        <Label x={57} y={70} anchor="middle" cls="fill-teal-200" size={10}>c1</Label>
        <rect x={378} y={56} width={34} height={20} rx={5} className="fill-teal-400/15 stroke-teal-400/60" />
        <Label x={395} y={70} anchor="middle" cls="fill-teal-200" size={10}>c2</Label>
        {apac.map(([id, name], i) => (
          <g key={id}>
            <rect x={40} y={86 + i * 27} width={140} height={22} rx={4} className="fill-zinc-950 stroke-zinc-800" />
            <Label x={48} y={101 + i * 27} cls="fill-teal-300" size={9}>{id}</Label>
            <Label x={68} y={101 + i * 27} cls="fill-zinc-200" size={10}>{name}</Label>
            <rect x={272} y={86 + i * 27} width={140} height={22} rx={4} className="fill-zinc-950 stroke-zinc-800" />
            <Label x={280} y={101 + i * 27} cls="fill-teal-300" size={9}>{id}</Label>
            <Label x={300} y={101 + i * 27} cls="fill-zinc-200" size={10}>{name}</Label>
          </g>
        ))}
      </motion.g>
      <motion.g {...fade(0.3)}>
        <Label x={226} y={64} anchor="middle" cls="fill-emerald-300" size={9}>ON c1.region = c2.region</Label>
        <Label x={226} y={78} anchor="middle" cls="fill-zinc-500" size={9}>AND c1.id &lt; c2.id</Label>
      </motion.g>
      <g>
        {apac.flatMap((a, i) =>
          apac.map((b, j) => {
            if (i >= j) return null;
            const sag = 8 + (j - i) * 7;
            const ym = Math.max(cy(i), cy(j)) + sag;
            return (
              <g key={`${a[0]}-${b[0]}`}>
                <path d={`M 182 ${cy(i)} Q 227 ${ym} 270 ${cy(j)}`} className="stroke-emerald-400" strokeWidth={1} fill="none" opacity={0.45} />
                <circle cx={182} cy={cy(i)} r={2} className="fill-emerald-400" opacity={0.7} />
                <circle cx={270} cy={cy(j)} r={2} className="fill-emerald-400" opacity={0.7} />
              </g>
            );
          }),
        )}
      </g>
      <motion.g {...fade(0.8)}>
        <Panel x={452} y={56} w={242} h={88} cls="fill-emerald-400/5 stroke-emerald-400/50" />
        <Label x={573} y={86} anchor="middle" cls="fill-emerald-200" size={20}>39 pairs</Label>
        <Label x={573} y={106} anchor="middle" cls="fill-zinc-400" size={9}>across the whole table</Label>
        <Label x={573} y={126} anchor="middle" cls="fill-emerald-300" size={11}>10 of them in APAC</Label>
        <Panel x={452} y={156} w={242} h={88} />
        <Label x={464} y={174} cls="fill-zinc-300" size={10}>the two guard rails</Label>
        <Label x={464} y={194} cls="fill-zinc-400" size={9}>① c1.id &lt; c2.id: no self-pairs,</Label>
        <Label x={478} y={208} cls="fill-zinc-400" size={9}>no mirror duplicates either</Label>
        <Label x={464} y={226} cls="fill-zinc-400" size={9}>② two aliases: a bare name</Label>
        <Label x={478} y={240} cls="fill-zinc-400" size={9}>would be ambiguous</Label>
      </motion.g>
      <motion.g {...fade(1)}>
        <Label x={26} y={262} cls="fill-zinc-500" size={9}>5 APAC customers → 5·4/2 = 10 pairs — every region contributes its own C(n,2)</Label>
        <Label x={26} y={277} cls="fill-zinc-600" size={9}>swap region for category and the same three lines pair products — a pattern worth memorizing</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 15 — spread, bucket, collapse (16 → 103 → 16) ---------- */

function J15AggPipeline() {
  return (
    <svg viewBox="0 0 720 262" className="w-full" role="img" aria-label="The aggregate pipeline: JOIN spreads 16 customers into 103 joined rows, GROUP BY buckets them into 16 groups, SUM collapses each bucket to one number">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>SELECT c.name, SUM(o.total) FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id</Label>
        <Label x={694} y={22} anchor="end" cls="fill-zinc-600" size={8}>lesson 8's recipe, joined</Label>
      </motion.g>
      <motion.g {...fade(0.2)}>
        <Label x={26} y={52} cls="fill-zinc-300" size={10}>① JOIN — spread</Label>
        <Label x={240} y={52} cls="fill-zinc-300" size={10}>② GROUP BY c.id — bucket</Label>
        <Label x={470} y={52} cls="fill-emerald-300" size={10}>③ SUM(o.total) — collapse</Label>
      </motion.g>
      <motion.g {...fade(0.35)}>
        <Label x={26} y={88} cls="fill-zinc-100" size={20}>16</Label>
        <Label x={72} y={88} cls="fill-zinc-500" size={9}>customers</Label>
        <DotField n={16} cols={8} x0={28} y0={100} gap={12} r={3.2} />
        <Label x={28} y={136} cls="fill-zinc-600" size={8}>one dot = one customer</Label>
      </motion.g>
      <motion.g {...fade(0.5)}>
        <Arrow x1={128} y1={92} x2={166} y2={92} />
        <Label x={147} y={80} anchor="middle" cls="fill-zinc-500" size={8}>16 → 103</Label>
        <Label x={147} y={118} anchor="middle" cls="fill-zinc-400" size={9}>JOIN</Label>
        <Label x={240} y={88} cls="fill-zinc-100" size={20}>103</Label>
        <Label x={292} y={88} cls="fill-zinc-500" size={9}>joined rows</Label>
        <DotField n={103} cols={12} x0={242} y0={100} gap={9.5} r={2.6} />
        <Label x={240} y={188} cls="fill-zinc-600" size={8}>each order row carries its customer along</Label>
        <Label x={240} y={200} cls="fill-zinc-600" size={8}>16 buyers → 103 order rows</Label>
      </motion.g>
      <motion.g {...fade(0.65)}>
        <Arrow x1={366} y1={92} x2={404} y2={92} />
        <Label x={385} y={80} anchor="middle" cls="fill-zinc-500" size={8}>103 → 16</Label>
        <Label x={385} y={118} anchor="middle" cls="fill-zinc-400" size={9}>GROUP BY</Label>
        <Label x={385} y={130} anchor="middle" cls="fill-zinc-500" size={8}>c.id</Label>
      </motion.g>
      <motion.g {...fade(0.8)}>
        <Label x={470} y={88} cls="fill-emerald-200" size={20}>16</Label>
        <Label x={512} y={88} cls="fill-zinc-500" size={9}>groups → one number each</Label>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={470} y={100 + i * 23} width={190} height={18} rx={4} className="fill-zinc-900 stroke-zinc-800" />
            <circle cx={482} cy={109 + i * 23} r={3} className="fill-emerald-400" />
            <Label x={492} y={113 + i * 23} cls="fill-zinc-500" size={8}>bucket</Label>
            <Label x={650} y={113 + i * 23} anchor="end" cls="fill-emerald-300" size={9}>Σ → 1 row</Label>
          </g>
        ))}
        <Label x={565} y={172} anchor="middle" cls="fill-zinc-600" size={9}>···</Label>
        <rect x={470} y={180} width={190} height={18} rx={4} className="fill-zinc-900 stroke-zinc-800" />
        <circle cx={482} cy={189} r={3} className="fill-emerald-400" />
        <Label x={492} y={193} cls="fill-zinc-500" size={8}>16th bucket</Label>
        <Label x={650} y={193} anchor="end" cls="fill-emerald-300" size={9}>Σ → 1 row</Label>
        <Label x={470} y={210} cls="fill-zinc-600" size={8}>one row per customer — buckets stay honest</Label>
      </motion.g>
      <motion.g {...fade(1)}>
        <Label x={26} y={218} cls="fill-zinc-500" size={9}>spread 16 → 103 · bucket 103 → 16 · collapse each bucket to a single SUM</Label>
        <Label x={26} y={234} cls="fill-zinc-600" size={9}>the bucket key (c.id) is what keeps one customer's orders from leaking into another's bucket</Label>
        <Label x={26} y={250} cls="fill-zinc-400" size={9}>preview of the COUNT trap: after a LEFT JOIN, count o.id — never COUNT(*) — or ghost rows pollute the buckets</Label>
      </motion.g>
    </svg>
  );
}

/* ---------- lesson 16 — aggregate first, then join (103,244.55 vs 34,833.28) ---------- */

function J16AggFirst() {
  return (
    <svg viewBox="0 0 720 302" className="w-full" role="img" aria-label="Joining before aggregating inflates SUM to 103,244.55; grouping order_items by order first yields the honest 34,833.28">
      <motion.g {...fade(0)}>
        <Label x={26} y={22} cls="fill-zinc-500" size={9}>SELECT o.id, o.total, SUM(oi.quantity * oi.unit_price)</Label>
        <Label x={26} y={36} cls="fill-zinc-500" size={9}>FROM orders o JOIN order_items oi ON oi.order_id = o.id GROUP BY o.id</Label>
      </motion.g>
      <motion.g {...fade(0.2)}>
        <rect x={540} y={12} width={154} height={24} rx={6} className="fill-zinc-900 stroke-zinc-800" />
        <Label x={617} y={28} anchor="middle" cls="fill-zinc-300" size={9}>103 orders · 251 lines</Label>
      </motion.g>
      <motion.g {...fade(0.3)}>
        <XMark x={32} y={54} cls="stroke-rose-400" s={4.5} delay={0.3} />
        <Label x={44} y={58} cls="fill-rose-300" size={10}>join first — SUM over the fan-out</Label>
        <Panel x={26} y={70} w={130} h={42} />
        <Label x={40} y={88} cls="fill-zinc-200" size={10}>orders</Label>
        <Label x={40} y={104} cls="fill-zinc-500" size={9}>103 rows</Label>
        <Arrow x1={160} y1={91} x2={186} y2={91} cls="stroke-zinc-600" />
        <Label x={173} y={82} anchor="middle" cls="fill-zinc-500" size={9}>JOIN</Label>
        <Panel x={190} y={70} w={150} h={42} />
        <Label x={202} y={88} cls="fill-zinc-200" size={10}>order_items</Label>
        <Label x={202} y={104} cls="fill-zinc-500" size={9}>251 lines</Label>
        <Arrow x1={344} y1={91} x2={370} y2={91} cls="stroke-zinc-600" />
        <rect x={374} y={66} width={158} height={50} rx={8} className="fill-rose-400/10 stroke-rose-400/60" />
        <Label x={386} y={84} cls="fill-zinc-400" size={9}>SUM(o.total) · 251 rows</Label>
        <Label x={386} y={104} cls="fill-rose-200" size={14}>103,244.55</Label>
        <XMark x={548} y={88} cls="stroke-rose-400" s={7} delay={0.6} />
        <Label x={562} y={84} cls="fill-rose-300" size={10}>inflated ~3×</Label>
        <Label x={562} y={98} cls="fill-zinc-500" size={9}>by fan-out</Label>
      </motion.g>
      <motion.g {...fade(0.5)}>
        <Label x={40} y={126} cls="fill-zinc-600" size={8}>the one side…</Label>
        <Label x={202} y={126} cls="fill-zinc-600" size={8}>…joined to the many side</Label>
        <Label x={404} y={126} cls="fill-amber-300/80" size={8}>each total rides 2–4 copies</Label>
        <Label x={562} y={118} cls="fill-zinc-500" size={8}>SUM adds every copy</Label>
      </motion.g>
      <motion.g {...fade(0.7)}>
        <polyline points="32,158 38,166 52,148" className="stroke-emerald-400" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Label x={60} y={162} cls="fill-emerald-300" size={10}>aggregate first — one row per order</Label>
        <Panel x={26} y={174} w={190} h={52} />
        <Label x={38} y={192} cls="fill-sky-300" size={10}>GROUP BY order_id first</Label>
        <Label x={38} y={210} cls="fill-zinc-500" size={9}>251 → 103 one-line orders</Label>
        <Arrow x1={220} y1={200} x2={246} y2={200} cls="stroke-zinc-600" />
        <Panel x={250} y={174} w={150} h={52} />
        <Label x={262} y={192} cls="fill-zinc-200" size={10}>JOIN orders</Label>
        <Label x={262} y={210} cls="fill-zinc-500" size={9}>103 rows, 1:1</Label>
        <Arrow x1={404} y1={200} x2={430} y2={200} cls="stroke-zinc-600" />
        <rect x={434} y={172} width={158} height={56} rx={8} className="fill-emerald-400/10 stroke-emerald-400/60" />
        <Label x={446} y={190} cls="fill-zinc-400" size={9}>SUM(o.total), once each</Label>
        <Label x={446} y={214} cls="fill-emerald-200" size={14}>34,833.28</Label>
        <polyline points="602,196 610,206 624,186" className="stroke-emerald-400" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Label x={513} y={246} anchor="middle" cls="fill-zinc-500" size={9}>matches SUM(orders.total) on the raw table</Label>
        <Label x={38} y={238} cls="fill-sky-300/70" size={8}>the many side, pre-collapsed</Label>
        <Label x={262} y={238} cls="fill-zinc-600" size={8}>1:1 — nothing duplicates</Label>
        <Label x={233} y={188} anchor="middle" cls="fill-zinc-500" size={8}>103</Label>
        <Label x={417} y={188} anchor="middle" cls="fill-zinc-500" size={8}>103</Label>
      </motion.g>
      <motion.g {...fade(1)}>
        <Label x={26} y={272} cls="fill-zinc-500" size={9}>wrong: 103,244.55 · right: 34,833.28 — collapse the many side before it ever touches SUM</Label>
        <Label x={26} y={288} cls="fill-zinc-400" size={9}>checklist: summing a one-side column across a 1:N join? aggregate the many side first, then join</Label>
      </motion.g>
    </svg>
  );
}

export const FIGURES_M2: Partial<Record<FigureId, () => React.JSX.Element>> = {
  "j9-mental-model": J9MentalModel,
  "j10-cartesian": J10Cartesian,
  "j11-hop-map": J11HopMap,
  "j12-where-vs-on": J12WhereVsOn,
  "j13-three-spellings": J13ThreeSpellings,
  "j14-two-aliases": J14TwoAliases,
  "j15-agg-pipeline": J15AggPipeline,
  "j16-agg-first": J16AggFirst,
};
