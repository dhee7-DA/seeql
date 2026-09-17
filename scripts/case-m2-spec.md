# M2 Case-study authoring spec (cs-301..cs-600)

You are authoring Module 2 (Joins) case studies for SeeQL. Read this whole file, the
type definitions, and the exemplars before writing anything.

## Read first
1. `src/lib/curriculum/cases/types.ts` — the `CaseStudy` / `CaseSlot` interfaces, `CASE_TOPICS`, `CASE_UNIVERSES`
2. `src/lib/curriculum/cases/cases-b1.ts` — exemplar voice/format (read ~10 cases)
3. `src/lib/curriculum/cases/cases-b5a.ts` — medium/hard exemplars (skim 5)
4. `scripts/case-audit.ts` — the mechanical gate your files MUST pass

## Hard rules (the audit enforces all of these)
- id `cs-###` unique, topic/universe/tier valid, 3..7 slots, template markers `{1}..{n}` each used EXACTLY once and matching slot count
- `brief` ≥ 120 chars (in-world stakeholder memo, 2–4 sentences, concrete business voice — never mention SQL/queries/the database engine in-world)
- `ask` ≥ 30 chars — the one-line deliverable
- `walkthrough` ≥ 220 chars — "how an analyst thinks" narrative; cites the real result figures
- every slot `why` ≥ 40 chars; `label` ≥ 3 chars
- 2..6 distractors, none duplicating a slot answer, none duplicating each other
- `noVerify` slots ≤ 3 per case (only for figures that can never appear in results, e.g. LIMIT constants or threshold literals like the 400 in `total > 400`)
- filled query: exactly ONE SELECT (NO subqueries), starts with SELECT, no internal `;`
- **Module 2 cases DO use JOIN** (that's the module) — but still flat queries only
- executes without error on the live db; result ≤ 1000 rows
- every `kind: "number"` slot's value MUST appear in the result cells (unless noVerify)
- **consequence rule**: EVERY distractor substituted into EVERY slot must either ERROR or produce a DIFFERENT result. A distractor that reproduces the correct result fails the case (ambiguous).

## Distractor craft for JOIN queries (the part that makes audits fail — design carefully)
- GOOD distractors: wrong qualified column (`c.customer_id` — errors), wrong key (`o.id` where `o.customer_id` belongs — different rows), wrong literal (`'Delivered'` — case-sensitive, empties), wrong table (`products` where `customers` belongs — errors or wrong rows), `HAVING` where `WHERE` belongs (errors), `region` vs `city` (different rows), `LEFT JOIN` vs `JOIN` **only when the slice has ghosts** (different counts), `ON` vs `WHERE` misuse where it changes results.
- FORBIDDEN pairs (they run identical → ambiguous FAIL): `JOIN` vs `INNER JOIN` (same), `LEFT JOIN` vs `LEFT OUTER JOIN` (same), `COUNT(*)` vs `COUNT(o.id)` **when the slice has no ghost rows**, `LIMIT 5` vs `LIMIT 10` when the result has fewer than 5 rows, ascending vs no ORDER BY with a deterministic single row, `SUM(qty*price)` vs `SUM(total)` when both grains agree (they DO agree on this db for status slices — so never offer one as a distractor for the other unless the query truly differs).
- Number distractors: pick values that change the result rows (other ids, other years) — and remember the audit tries them in EVERY slot.

## Verified db facts (storefront, SQLite) — NEVER invent a number
Schema:
- customers(id, name, email, city, region, active, created_at) — 16 rows. EU 8 (Alice Chen/Berlin, Chloe Dubois/Lyon, Dmitri Volkov/Tallinn INACTIVE, Isabella Rossi/Milan, Liam O'Brien/Cork, Noah Meyer/Hamburg, Olivia Brown/London, Pedro Alvarez/Madrid), APAC 5 (Farid Nasser/Dubai, Grace Kim/Seoul, Hiro Tanaka/Osaka, Keiko Sato/Nagoya INACTIVE, Maya Patel/Mumbai), US 2 (Emma Wilson/Austin, Jamal Wright/Chicago), LATAM 1 (Bruno Silva/São Paulo). active=0: Dmitri Volkov, Keiko Sato.
- orders(id, customer_id, status, total, created_at, shipped_at) — 103 rows, all FKs valid, every customer has ≥1 order. delivered 52, shipped 30, pending 14, cancelled 7. shipped_at NULL exactly on the 21 pending+cancelled. Totals 25.47–1,088.44 all distinct, SUM 34,833.28. Order #20 = Liam O'Brien's ONLY order (shipped, 705.39). Biggest order #74 Farid Nasser pending 1,088.44.
- products(id, name, category, price, stock, supplier_id) — 16 rows. Full live catalog (id · name · category · price · stock · supplier_id):
  1 Mechanical Keyboard K1 · Electronics · 89.99 · 120 · →1 Nordic
  2 Wireless Mouse M3 · Electronics · 34.50 · 300 · →2 Shenzhen
  3 USB-C Hub 7-in-1 · Electronics · 49.00 · 85 · →3 Pacific
  4 Noise-Canceling Headset · Audio · 149.99 · 60 · →4 Midwest
  5 Studio Desktop Mic · Audio · 119.00 · 45 · →5 Alpine
  6 Bluetooth Speaker Mini · Audio · 59.99 · 210 · →6 Andes
  7 4K Webcam Pro · Video · 129.00 · 70 · →1 Nordic
  8 Ring Light 14" · Video · 39.99 · 150 · →2 Shenzhen
  9 HDMI 2.1 Cable 2m · Accessories · 14.99 · 500 · →3 Pacific
  10 Laptop Stand Aluminum · Accessories · 42.50 · 180 · →4 Midwest
  11 Desk Mat Extended · Accessories · 24.99 · 260 · →5 Alpine
  12 Fitness Band X2 · Wearables · 79.00 · 95 · →6 Andes
  13 Smart Watch S · Wearables · 199.99 · 40 · →1 Nordic
  14 Running Socks 3-pack · Apparel · 18.50 · 400 · →2 Shenzhen
  15 Cycling Jersey Pro · Apparel · 65.00 · 110 · →3 Pacific
  16 Yoga Mat Eco 6mm · Fitness · 32.00 · 220 · →4 Midwest
  All prices distinct. Every product has ≥1 sale.
- ⚠️ SEED QUIRK — products⋈suppliers distractor ban: products 1–6 have supplier_id equal to their own id (7–16 cycle suppliers 1–4), so the wrong-key distractor `p.id` swapped into a `p.supplier_id` slot REPRODUCES the correct result for any filtered slice that keeps only products with id ≤ 6 (and is ambiguous in others). NEVER offer `p.id` as a distractor in a products⋈suppliers join. Use `s.supplier_id` (no such column — errors) or `s.stock` (errors) instead. Wrong-key distractors on orders⋈customers (`o.id`) and order_items⋈orders (`oi.id`) are safe — they change the result.
- suppliers(id, name, region, rating) — 1 Nordic Gadgets AB (EU 4.6), 2 Shenzhen Electro (APAC 4.1), 3 Pacific Textiles (APAC 3.9), 4 Midwest Hardware Co (US 4.4), 5 Alpine Audio GmbH (EU 4.8), 6 Andes Naturals SA (LATAM 4.0).
- order_items(id, order_id, product_id, quantity, unit_price) — 251 rows, all FKs valid, quantity 1–3. Every product and supplier has ≥1 sale. Lines/order: 1×26, 2×29, 3×25, 4×23. quantity=3 on 89 lines. Biggest line #79 = 3 × 199.97 = 599.91.

Join + aggregate facts (verified):
- orders⋈customers = 103; order_items⋈products = 251; orders⋈order_items = 251; 3/4/5-table chains all 251.
- Cartesian customers×orders = 1,648; products×suppliers = 96; wrong-key o.id=c.id = 16.
- customers LEFT JOIN orders ON ... AND status='delivered' = 53 (52 + 1 ghost: Liam O'Brien); WHERE-collapse = 52.
- ... AND status='shipped' = 36 (30 + 6 ghosts: Bruno Silva, Chloe Dubois, Dmitri Volkov, Farid Nasser, Keiko Sato, Olivia Brown); INNER = 30.
- ... AND status='pending' = 22 (14 + 8 ghosts: Bruno, Dmitri, Hiro, Isabella, Jamal, Liam, Noah, Olivia).
- LEFT JOIN IS NULL hole-finders: never-shipped customers = the 6 names above (17 orders); never-delivered = Liam O'Brien (1 order); with NO status condition there are ZERO holes (everyone ordered, every product sold, every supplier paid).
- NOT IN with a NULL-bearing list returns 0 rows; guarded (IS NOT NULL inside) returns the true answer. (Cases can't use subqueries — express anti-joins as LEFT JOIN ... IS NULL.)
- Spend leaderboard: Alice Chen 7,262.35/24 · Emma Wilson 6,640.56/17 · Grace Kim 4,574.23/14 · Maya Patel 3,644.56/13 · Chloe Dubois 2,667.93/5 · Pedro Alvarez 1,686.17/4 · Farid Nasser 1,458.97/3 · Keiko Sato 1,098.60/4 · Isabella Rossi 985.65/4 · Bruno Silva 852.44/2 · Hiro Tanaka 829.09/3 · Noah Meyer 737.68/4 · Liam O'Brien 705.39/1 · Jamal Wright 645.60/2 · Dmitri Volkov 599.26/2 · Olivia Brown 444.80/1.
- Category revenue (line grain): Audio 11,744.01/51 lines · Wearables 6,929.12/25 · Video 5,198.41/32 · Electronics 4,818.61/44 · Accessories 3,294.29/62 · Apparel 1,984.93/24 · Fitness 863.91/13. Units: Accessories 121, Audio 97, Electronics 85, Video 61, Apparel 54, Wearables 53, Fitness 27.
- Revenue by status: delivered 15,571.07, shipped 11,996.72, pending 6,113.00, cancelled 1,152.49 (line grain = order grain; reconcile to 34,833.28).
- Supplier sales (lines/units/revenue): Nordic 43/82/11,130.25 · Midwest 56/109/9,294.93 · Alpine 40/77/4,765.63 · Andes 25/51/3,613.25 · Shenzhen 47/99/3,049.07 · Pacific 40/80/2,980.15.
- Product revenue podium: Headset 6,888.25 (24 lines) · Smart Watch S 4,582.02 (11) · 4K Webcam Pro 3,989.97 (17) · Studio Mic 3,589.61 (16) · Keyboard K1 2,558.26 (15). Desk Mat 24 lines/1,176.02. HDMI cable 19 lines/38 units/575.50.
- Alice: 24 orders, 50 lines, 100 units. Emma: 17 orders, 46 lines, 98 units. Grace: 14 orders, 34 lines, 67 units. EU delivered: 24 orders / 50 lines / 6,656.18. Berlin: Alice only (24 orders). Region business: EU 45/15,089.23 · APAC 37/11,605.45 · US 19/7,286.16 · LATAM 2/852.44. Shipped by region: EU 12, US 10, APAC 8. EU shipped orders 12.
- Self-join customers same region: 94 ordered → 78 with <> → 39 with < (EU 28, APAC 10, US 1, LATAM 0). Same city: 0 pairs. Products same category (a.id<b.id): 12 (Electronics 3, Audio 3, Accessories 3, Wearables 1, Video 1, Apparel 1). Suppliers same region: 2 pairs. Same-price products: 0. Same-total orders: 0.
- Fan-out: SUM(o.total) after items join = 103,244.55 vs true 34,833.28; AVG 411.33 vs 338.19; COUNT 251 vs 103. Inflated per customer: Emma 21,369.77, Alice 18,784.19, Grace 13,531.03. Line-grain total = 34,833.28 exactly.

## Query shapes per topic (cases must fit the lesson's toolkit)
- l9 First joins: `orders o JOIN customers c ON o.customer_id = c.id` (+ WHERE filters), `products p JOIN suppliers s ON p.supplier_id = s.id`. Lookups with names/regions; keep 1–2 joins max.
- l10 Join mechanics: correct FK inside ON is the star — make `o.customer_id`, `c.id`, `p.supplier_id` chip slots; qualifiers (`o.`, `c.`) as slots; ORDER BY joined columns; the wrong-key trap lives in the walkthrough.
- l11 Multi-table chains: items→orders→customers (→products); hop conditions as slots (`oi.order_id`, `o.id`, `o.customer_id`, `c.id`, `oi.product_id`, `p.id`); filters at any hop.
- l12 LEFT JOIN: `customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = '...'` with IS NULL hole lists, or ghost counts as number slots (53/36/22 patterns).
- l13 Anti-joins: LEFT JOIN ... WHERE right.id IS NULL (no subqueries!); slots: `LEFT JOIN`, `IS NULL`, `oi.id`/`o.id`; number slots: the hole counts above (6 never-shipped, 1 never-delivered, 0 holes = "zeros are findings" cases).
- l14 Self-join: `customers a JOIN customers b ON a.region = b.region AND a.id < b.id`; slots: `a`, `b`, `a.region`, `b.region`, `a.id < b.id` is too long — use `a.id` + `<` … simpler: make the condition one slot `b.region` and a keyword slot `AND`; number slots: 28 EU pairs, 10 APAC, 39 total, 0 same-city.
- l15 Joins + aggregates: line-grain revenue `ROUND(SUM(oi.quantity * oi.unit_price), 2)` grouped by `p.category` / `s.name` / `c.name`; number slots = the revenue figures (they ARE result cells); slots: `GROUP BY`, `JOIN`, `ON`, `SUM(...)`.
- l16 Fan-out & grain: honest line-grain queries (`SUM(oi.quantity * oi.unit_price)`); distractor `o.total` in the SUM slot is consequential (inflates) — pairs with a walkthrough about the 103,244.55 trap; two-count reconciliations; `COUNT(DISTINCT ...)` slots.

## Universe rotation (deterministic)
Order the 10 universes: month-close, refund-audit, pricing, inventory, funnel, supplier, expense, growth, fraud, catalog.
Case with id number N gets `universe = UNIVERSES[(N - 301) % 10]` (index into that order). Over the full 300 this lands exactly 30 per universe — follow it mechanically.

## Business voices (rotate; keep memos in-world, concrete, and human)
month-close = controller closing the books · refund-audit = support lead auditing complaints · pricing = pricing analyst repricing SKUs · inventory = warehouse cycle-count desk · funnel = growth marketer seeding campaigns · supplier = supply-chain QBR pack · expense = finance ops trimming spend · growth = board-deck prep · fraud = risk spot-checks · catalog = merchandising cleaning the catalog.
The memo explains WHY the business needs the numbers; the SQL never appears in the memo voice, but product names, customer names, cities and figures do.

## Quality bar
- Every case teaches ONE join idea at its tier. easy = one join + one filter; medium = two filters / two hops / LEFT JOIN rescue; hard = chains, hole-finders, aggregate attribution, fan-out discipline.
- Walkthroughs read like a senior analyst thinking out loud and always land on the real numbers with their business meaning.
- Slot `why`s explain consequence ("X would print Y / error because Z"), in business terms first, mechanics second.

## Audit + delivery loop
1. Write your allocated file(s) under `src/lib/curriculum/cases/` using the Write tool (split long files into Write + Edit-append passes).
2. Run `bun scripts/case-audit.ts <your file(s)>` — iterate until every case PASSes. Expect first drafts to FAIL on the consequence rule; fix by redesigning distractors, not by weakening the query.
3. Do NOT touch cases/index.ts, types.ts, or anything else. Do NOT run git.
4. Append your worklog section (Task ID given in your prompt).

REPORT BACK: files written, case count by tier, audit output summary (pass/fail counts), and any figures you cited that are not in this spec (should be none).
