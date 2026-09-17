# Case-file atom matrix — Module 2 (Joins & Relationships)

200 scenarios: L9 20 · L10 25 · L11 30 · L12 25 · L13 25 · L14 25 · L15 25 · L16 20 · L36 5.
Every figure ground-truthed in `scripts/facts-cases-m2-out.txt` + `facts-cases-m2b-out.txt`.
Keyword-blank convention: first occurrence of each keyword blanked; later occurrences static
(audit invariant #8 only requires each keyword blanked at least once). Answers pairwise distinct.

## Schema threads (the only five join edges)
- orders.customer_id → customers.id (103 ↔ 16)
- order_items.order_id → orders.id (251 ↔ 103)
- order_items.product_id → products.id (251 ↔ 16)
- products.supplier_id → suppliers.id (16 ↔ 6)
- self-joins: customers↔customers (region), products↔products (supplier), suppliers↔suppliers (region), orders↔orders (customer)

## Ground-truth anchors
- Revenue: honest 34,833.28 · fan-out 103,244.55 (251 join rows) · delivered 15,571.07/52
- Status: delivered 52 · shipped 30 · pending 14 (6,113.00) · cancelled 7 (1,152.49)
- 2025: 13 orders / 4,060.03 · LEFT JOIN arith: 20 vs 13 (7 no-2025 buyers) · delivered-LJ 53 vs 52 (Liam)
- Anti-join universes (all need pre-filtered derived tables — raw never-joins are empty):
  never-2025 = 7 named · never-delivered = Liam only · never-watch = 9 · never-Audio = Dmitri+Jamal
  · never-cancelled = 12 · Speaker Mini never in 2025 · Fitness never bought by US · (products-never-EU/suppliers-never-pending = ∅, unusable)
- Spend: Alice 24/7,262.35 · Emma 17/6,640.56 · Grace 14/4,574.23 · Maya 13/3,644.56 · Chloe 5/2,667.93
  · bottom: Olivia 1/444.80 · Dmitri 2/599.26 · Jamal 2/645.60 · Liam 1/705.39
- Region delivered: EU 6,656.18/24 orders/50 lines · APAC 6,617.68 · US 1,444.77 · LATAM 852.44
- Region orders: EU 45 · APAC 37 · US 19 · LATAM 2 · avg/order LATAM 426.22 · US 383.48 · EU 335.32 · APAC 313.66
- Category revenue (line truth): Audio 11,744.01 · Wearables 6,929.12 · Video 5,198.41 · Electronics 4,818.61 · Accessories 3,294.29/121 units · Apparel 1,984.93 · Fitness 863.91 · delivered Audio 6,337.80/56 units
- Suppliers: products Nordic/Shenzhen/Pacific/Midwest 3 each, Alpine/Andes 2 · revenue Nordic 11,130.25 · Midwest 9,294.93 · Alpine 4,765.63 · Andes 3,613.25 · Shenzhen 3,049.07 · Pacific 2,980.15 · Nordic 43 lines/82 units · Midwest 56 lines
- Lines/order: avg 2.44 · max 4 (orders 1, 6, 11) · min 1 (order 51: Desk Mat 25.47)
- Self-join: same-region customer pairs 39 (EU 28, APAC 10, US 1, LATAM 0) · region sizes EU 8/APAC 5/US 2/LATAM 1 · same-city 0 · same-supplier product pairs 14 · supplier-2 detail 3 pairs · supplier-region pairs 2 (Nordic↔Alpine, Shenzhen↔Pacific) · repeat-order pairs 624
- Hops: Keyboard K1 → Nordic · 15 buyer lines (14 in 2024) · Headset on 24 lines · Watch 2025 lines: Olivia 1, Emma 2, Noah 1 · Alice 50 lines / 7,262.35 · Emma 7 pending lines · EU-delivered lines 50
- Order spot: #74 Farid pending 1,088.44 (Yoga Mat 33.22 + Watch×3 194.34 + Headset×3 157.40) · #43 Chloe 945.21 · #39 Emma 845.92 · #51 Maya 25.47 · #94 Keiko 149.00
- Pending per buyer: Alice 3 · Emma 3 · Chloe 2 · Maya 2 · Farid 1 · Grace 1 · Keiko 1 · Pedro 1
- Delivered per buyer: Alice 12 · Grace 10 · Maya 5 · Emma 4 · Chloe 3 · Liam 0 · Jamal 1 · Olivia 1
- Shipped per buyer: Emma 9 · Alice 6 · Maya 4 · Grace 3 · Isabella 2
- Retention: both-2024-and-2025 = 8 · 2024-only = 7 (Chloe 2,667.93, Pedro 1,686.17, Farid 1,458.97, Bruno 852.44, Liam 705.39, Jamal 645.60, Dmitri 599.26) · 2025-only = Olivia (1 order)
- Inactive buyers: Dmitri 2 · Keiko 4 · active = 14 · inactive-with-orders rows = 6
- Headset supplier Midwest 4.4/US · Mic supplier Alpine 4.8/EU · Speaker supplier Andes 4.0/LATAM
- Shenzhen Electro catalog: Mouse 34.50 · Ring Light 39.99 · Socks 18.50
- EU-supplier products: Keyboard K1, Studio Mic, 4K Webcam, Desk Mat, Smart Watch (5)

## Per-lesson atoms (each ≥ 2 sightings across universes)
- **L9 (20)** first joins: FK-lookup direction · ON match rule as equation · FROM picks the start · qualification of shared names · bare JOIN vs INNER JOIN · joined-column filter (either side) · ORDER BY far side · LIMIT on join · SELECT * spans both · alias assignment · two-column right side · FK-value filter with join present
- **L10 (25)** mechanics: census COUNT(*) join = 251 · row multiplication per order (4-line orders) · match-rule predicate chips (id=id trap) · ambiguity/qualification errors · alias discipline · dropped-row story (DISTINCT o.id = 103) · joined-side WHERE · region/status ledgers · ORDER BY far side · pair census (items↔products) · duplicate column names
- **L11 (30)** chains: items→products (line enrichment) · items→orders→customers (who bought) · +products (3-hop who-bought-what) · items→products→suppliers (vendor behind line) · mid-chain filters (status at hop 1, region at hop 3) · join-order irrelevance · line-revenue expressions · buyer-of-product lists · category revenue 2-hop
- **L12 (25)** LEFT JOIN: preserve-left with NULL gaps · compound ON (status inside ON) · WHERE-vs-ON silent-INNER trap · COUNT(*) vs COUNT(col) arithmetic (20/13, 53/52) · per-buyer delivered counts incl. 0 · flipped-table symmetry · LEFT JOIN + ORDER BY
- **L13 (25)** anti-joins: LEFT JOIN + IS NULL on direct edge (never-2025 = 7) · pre-filtered derived table (never-Audio, never-watch, never-cancelled) · two-hop filter-first (products never in 2025) · airtight-PK reasoning (IS NULL on key column) · anti-join + COUNT · region-scoped holes (Fitness/US)
- **L14 (25)** self-joins: alias pairs c1/c2 mandatory · mirror-kill c1.id < c2.id · self-pair exclusion · same-region pairs (39; EU 28) · same-supplier product pairs (14; Shenzhen detail) · supplier-region pairs (2) · repeat-order pairing (624) · paired output naming (pair_a/pair_b) · extra conditions inside ON
- **L15 (25)** joins + aggregates: spend per buyer GROUP BY c.id · region rollups · category revenue via items · supplier rollup · COUNT(*) vs COUNT(oi.id) zero rows · HAVING over joined counts · avg per region · ORDER BY aggregate · combined WHERE + GROUP + ORDER + LIMIT
- **L16 (20)** pitfalls: fan-out sum 103,244.55 vs 34,833.28 · census before trust · aggregate-first GROUP BY o.id · derived-table pre-aggregation (supplier revenue) · DISTINCT-won't-save reasoning · honest per-order line revenue · fan-out on totals by region · capstone mixes
- **L36 (5)** capstone: retention (8 / 7 / Olivia) · honest region revenue · region mates (self-join) · never-2025 board · fan-out guard

## Difficulty mix target
~60 easy · ~105 medium · ~35 hard (mirrors M1's 62/105/33).

## Universe rotation (same 10 as M1)
month-end close · refund/fraud audit · pricing review · inventory count · marketing funnel · supplier audit · expense report · growth board deck · CS triage · fulfillment deep-dive.
