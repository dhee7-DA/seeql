# Storefront db — probed ground truth for company-kit case studies

Probed 2026-10-12 against db/custom.db (read-only).
Every figure below is copy-paste safe for case briefs and number slots.

### Scale census
```sql
SELECT COUNT(*) FROM <each table>
```
| customers | suppliers | products | orders | order_items | invoices | payments | expenses | ledger_entries |
|---|---|---|---|---|---|---|---|---|
| 16 | 6 | 16 | 103 | 251 | 28 | 27 | 36 | 80 |

### Order value totals
```sql
SELECT COUNT(*), ROUND(SUM(total),2), ROUND(AVG(total),2), MIN(total), MAX(total) FROM orders
```
| orders | total_value | avg_order_value | min_total | max_total |
|---|---|---|---|---|
| 103 | 34833.28 | 338.19 | 25.47 | 1088.44 |

### Order status distribution
```sql
SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY n DESC
```
| status | n | pct |
|---|---|---|
| delivered | 52 | 50.5 |
| shipped | 30 | 29.1 |
| pending | 14 | 13.6 |
| cancelled | 7 | 6.8 |

### Status x region (orders via customer)
```sql
SELECT c.region, o.status, COUNT(*) FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region, o.status
```
| region | status | n |
|---|---|---|
| APAC | delivered | 21 |
| APAC | shipped | 8 |
| APAC | pending | 5 |
| APAC | cancelled | 3 |
| EU | delivered | 24 |
| EU | shipped | 12 |
| EU | pending | 6 |
| EU | cancelled | 3 |
| LATAM | delivered | 2 |
| US | shipped | 10 |
| US | delivered | 5 |
| US | pending | 3 |
| US | cancelled | 1 |

### Region census — orders, buyers, revenue
```sql
SELECT c.region, COUNT(*), COUNT(DISTINCT o.customer_id), ROUND(SUM(o.total),2), ROUND(AVG(o.total),2) FROM orders o JOIN customers c ON c.id=o.customer_id GROUP BY c.region
```
| region | orders | buyers | revenue | aov |
|---|---|---|---|---|
| EU | 45 | 8 | 15089.23 | 335.32 |
| APAC | 37 | 5 | 11605.45 | 313.66 |
| US | 19 | 2 | 7286.16 | 383.48 |
| LATAM | 2 | 1 | 852.44 | 426.22 |

### Cancellation share by region
```sql
100.0 * SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END)/COUNT(*) grouped by region
```
| region | placed | cancelled | cancel_pct |
|---|---|---|---|
| APAC | 37 | 3 | 8.1 |
| EU | 45 | 3 | 6.7 |
| US | 19 | 1 | 5.3 |
| LATAM | 2 | 0 | 0 |

### Customer cities
```sql
SELECT city, region, COUNT(*) FROM customers GROUP BY city, region
```
| city | region | customers |
|---|---|---|
| Austin | US | 1 |
| Berlin | EU | 1 |
| Chicago | US | 1 |
| Cork | EU | 1 |
| Dubai | APAC | 1 |
| Hamburg | EU | 1 |
| London | EU | 1 |
| Lyon | EU | 1 |
| Madrid | EU | 1 |
| Milan | EU | 1 |
| Mumbai | APAC | 1 |
| Nagoya | APAC | 1 |
| Osaka | APAC | 1 |
| Seoul | APAC | 1 |
| São Paulo | LATAM | 1 |
| Tallinn | EU | 1 |

### Repeat vs one-time buyers
```sql
SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id
```
| orders_n | buyers |
|---|---|
| 1 | 2 |
| 2 | 3 |
| 3 | 2 |
| 4 | 4 |
| 5 | 1 |
| 13 | 1 |
| 14 | 1 |
| 17 | 1 |
| 24 | 1 |

### Top spenders
```sql
top spenders by SUM(o.total)
```
| id | name | region | orders | spend |
|---|---|---|---|---|
| 1 | Alice Chen | EU | 24 | 7262.35 |
| 5 | Emma Wilson | US | 17 | 6640.56 |
| 7 | Grace Kim | APAC | 14 | 4574.23 |
| 13 | Maya Patel | APAC | 13 | 3644.56 |
| 3 | Chloe Dubois | EU | 5 | 2667.93 |
| 16 | Pedro Alvarez | EU | 4 | 1686.17 |
| 6 | Farid Nasser | APAC | 3 | 1458.97 |
| 11 | Keiko Sato | APAC | 4 | 1098.6 |
| 9 | Isabella Rossi | EU | 4 | 985.65 |
| 2 | Bruno Silva | LATAM | 2 | 852.44 |
| 8 | Hiro Tanaka | APAC | 3 | 829.09 |
| 14 | Noah Meyer | EU | 4 | 737.68 |
| 12 | Liam O'Brien | EU | 1 | 705.39 |
| 10 | Jamal Wright | US | 2 | 645.6 |
| 4 | Dmitri Volkov | EU | 2 | 599.26 |
| 15 | Olivia Brown | EU | 1 | 444.8 |

### Customer spend concentration
```sql
share of revenue from customers whose lifetime spend crosses a threshold
```
| top_spenders_3000_plus_pct | spenders_2000_plus_pct |
|---|---|
| 63.5 | 71.2 |

### Never-ordered customers
```sql
anti-join count
```
| never_ordered |
|---|
| 0 |

### Category crowns — revenue, units, products
```sql
category revenue/units from order_items
```
| category | products | units | revenue |
|---|---|---|---|
| Audio | 3 | 97 | 11744.01 |
| Wearables | 2 | 53 | 6929.12 |
| Video | 2 | 61 | 5198.41 |
| Electronics | 3 | 85 | 4818.61 |
| Accessories | 3 | 121 | 3294.29 |
| Apparel | 2 | 54 | 1984.93 |
| Fitness | 1 | 27 | 863.91 |

### Category order fan-out
```sql
distinct orders touching each category
```
| category | orders_touched |
|---|---|
| Accessories | 54 |
| Audio | 46 |
| Electronics | 40 |
| Video | 30 |
| Wearables | 23 |
| Apparel | 22 |
| Fitness | 13 |

### Price bands
```sql
CASE price bands over products.price
```
| band | products | avg_price |
|---|---|---|
| mid (50-200) | 8 | 111.5 |
| budget (<50) | 8 | 32.06 |

### Product price ranking
```sql
full product list by price
```
| id | name | category | price | stock |
|---|---|---|---|---|
| 13 | Smart Watch S | Wearables | 199.99 | 40 |
| 4 | Noise-Canceling Headset | Audio | 149.99 | 60 |
| 7 | 4K Webcam Pro | Video | 129 | 70 |
| 5 | Studio Desktop Mic | Audio | 119 | 45 |
| 1 | Mechanical Keyboard K1 | Electronics | 89.99 | 120 |
| 12 | Fitness Band X2 | Wearables | 79 | 95 |
| 15 | Cycling Jersey Pro | Apparel | 65 | 110 |
| 6 | Bluetooth Speaker Mini | Audio | 59.99 | 210 |
| 3 | USB-C Hub 7-in-1 | Electronics | 49 | 85 |
| 10 | Laptop Stand Aluminum | Accessories | 42.5 | 180 |
| 8 | Ring Light 14" | Video | 39.99 | 150 |
| 2 | Wireless Mouse M3 | Electronics | 34.5 | 300 |
| 16 | Yoga Mat Eco 6mm | Fitness | 32 | 220 |
| 11 | Desk Mat Extended | Accessories | 24.99 | 260 |
| 14 | Running Socks 3-pack | Apparel | 18.5 | 400 |
| 9 | HDMI 2.1 Cable 2m | Accessories | 14.99 | 500 |

### Never-ordered products
```sql
anti-join
```
(empty)

### Stock vs sold per product
```sql
stock minus sold per product
```
| id | name | category | stock | units_sold | remaining |
|---|---|---|---|---|---|
| 11 | Desk Mat Extended | Accessories | 260 | 47 | 213 |
| 4 | Noise-Canceling Headset | Audio | 60 | 46 | 14 |
| 9 | HDMI 2.1 Cable 2m | Accessories | 500 | 38 | 462 |
| 2 | Wireless Mouse M3 | Electronics | 300 | 36 | 264 |
| 10 | Laptop Stand Aluminum | Accessories | 180 | 36 | 144 |
| 14 | Running Socks 3-pack | Apparel | 400 | 33 | 367 |
| 7 | 4K Webcam Pro | Video | 70 | 31 | 39 |
| 5 | Studio Desktop Mic | Audio | 45 | 30 | 15 |
| 8 | Ring Light 14" | Video | 150 | 30 | 120 |
| 12 | Fitness Band X2 | Wearables | 95 | 30 | 65 |
| 1 | Mechanical Keyboard K1 | Electronics | 120 | 28 | 92 |
| 16 | Yoga Mat Eco 6mm | Fitness | 220 | 27 | 193 |
| 13 | Smart Watch S | Wearables | 40 | 23 | 17 |
| 3 | USB-C Hub 7-in-1 | Electronics | 85 | 21 | 64 |
| 6 | Bluetooth Speaker Mini | Audio | 210 | 21 | 189 |
| 15 | Cycling Jersey Pro | Apparel | 110 | 21 | 89 |

### Supplier revenue + listings + rating
```sql
supplier revenue via products->order_items
```
| id | name | region | rating | listings | revenue |
|---|---|---|---|---|---|
| 1 | Nordic Gadgets AB | EU | 4.6 | 3 | 11130.25 |
| 4 | Midwest Hardware Co | US | 4.4 | 3 | 9294.93 |
| 5 | Alpine Audio GmbH | EU | 4.8 | 2 | 4765.63 |
| 6 | Andes Naturals SA | LATAM | 4 | 2 | 3613.25 |
| 2 | Shenzhen Electro | APAC | 4.1 | 3 | 3049.07 |
| 3 | Pacific Textiles | APAC | 3.9 | 3 | 2980.15 |

### Supplier revenue share
```sql
each supplier's % of total revenue
```
| name | revenue | pct |
|---|---|---|
| Nordic Gadgets AB | 11130.25 | 32 |
| Midwest Hardware Co | 9294.93 | 26.7 |
| Alpine Audio GmbH | 4765.63 | 13.7 |
| Andes Naturals SA | 3613.25 | 10.4 |
| Shenzhen Electro | 3049.07 | 8.8 |
| Pacific Textiles | 2980.15 | 8.6 |

### Trusted supplier bench (rating >= 4.5)
```sql
suppliers with rating >= 4.5 and their catalog
```
| name | region | rating | listings | avg_price |
|---|---|---|---|---|
| Nordic Gadgets AB | EU | 4.6 | 3 | 139.66 |
| Alpine Audio GmbH | EU | 4.8 | 2 | 72 |

### Date range
```sql
min/max order dates
```
| first_order | last_order | first_ship | last_ship |
|---|---|---|---|
| 2024-01-01 | 2025-02-27 | 2024-01-04 | 2025-03-01 |

### Monthly order trend
```sql
orders grouped by SUBSTR(created_at,1,7)
```
| month | orders | revenue | cancelled |
|---|---|---|---|
| 2024-01 | 8 | 3731.97 | 1 |
| 2024-02 | 9 | 3609.64 | 0 |
| 2024-03 | 8 | 2617.08 | 1 |
| 2024-04 | 7 | 2468.91 | 0 |
| 2024-05 | 8 | 2910.31 | 0 |
| 2024-06 | 6 | 2047.43 | 0 |
| 2024-07 | 8 | 1193.86 | 2 |
| 2024-08 | 7 | 2352.07 | 0 |
| 2024-09 | 9 | 3116.04 | 0 |
| 2024-10 | 7 | 2975.67 | 0 |
| 2024-11 | 6 | 1648.8 | 2 |
| 2024-12 | 7 | 2101.47 | 0 |
| 2025-01 | 6 | 1669.5 | 1 |
| 2025-02 | 7 | 2390.53 | 0 |

### Ship latency (days, where shipped)
```sql
julianday delta where shipped_at IS NOT NULL
```
| shipped | avg_days | min_days | max_days |
|---|---|---|---|
| 82 | 2.98 | 2 | 4 |

### Latency by region (delivered+shipped only)
```sql
regional ship latency, shipped_at IS NOT NULL
```
| region | shipped_orders | avg_days |
|---|---|---|
| LATAM | 2 | 3.5 |
| US | 15 | 3.07 |
| EU | 36 | 2.94 |
| APAC | 29 | 2.93 |

### Invoice status
```sql
invoice status distribution
```
| status | n | total_amount |
|---|---|---|
| open | 6 | 19609 |
| paid | 21 | 66443 |
| void | 1 | 925 |

### Invoice aging vs max paid date
```sql
aging context: reference date = MAX(paid_on) in payments
```
| status | invoices | amount |
|---|---|---|
| open | 6 | 19609 |
| paid | 21 | 66443 |
| void | 1 | 925 |

### Payments by method
```sql
payment method mix
```
| method | payments | total |
|---|---|---|
| card | 16 | 37364 |
| wire | 11 | 32248 |

### AR: invoices without payment
```sql
anti-join AR
```
| unpaid_invoices | unpaid_amount |
|---|---|
| 6 | 15217 |

### Expenses by category
```sql
expense categories
```
| category | n | total |
|---|---|---|
| Rent | 14 | 16800 |
| Ads | 14 | 4570 |
| Travel | 3 | 2521 |
| Tools | 5 | 1525 |

### Payment coverage per invoice (partial-payment check)
```sql
invoices LEFT JOIN grouped payments, classified exact/partial/none
```
| coverage | invoices | invoice_amount | paid_amount |
|---|---|---|---|
| exact | 21 | 65612 | 65612 |
| no payment | 6 | 15217 | 0 |
| partial | 1 | 6148 | 4000 |

### Invoice issue-to-due window (days)
```sql
payment terms spread
```
| avg_terms_days | min_days | max_days |
|---|---|---|
| 30 | 30 | 30 |

### Paid-invoice settlement days
```sql
days from issue to first payment, paid invoices only
```
| paid_invoices | avg_days_to_pay | fastest | slowest |
|---|---|---|---|
| 20 | 28.4 | 13 | 84 |

### Region x category revenue (top combos)
```sql
region x category revenue
```
| region | category | revenue |
|---|---|---|
| APAC | Audio | 5162.4 |
| EU | Audio | 5102.4 |
| EU | Wearables | 3886.3 |
| EU | Video | 2260.79 |
| US | Video | 1885.98 |
| EU | Electronics | 1855.02 |
| US | Wearables | 1767.54 |
| APAC | Accessories | 1432.46 |
| APAC | Electronics | 1410.04 |
| APAC | Wearables | 1275.28 |
| US | Audio | 1121.7 |
| EU | Accessories | 1108.03 |

### Expenses by month
```sql
expense monthly trend
```
| month | n | total |
|---|---|---|
| 2024-01 | 3 | 1719 |
| 2024-02 | 2 | 1440 |
| 2024-03 | 3 | 1917 |
| 2024-04 | 3 | 1749 |
| 2024-05 | 2 | 1480 |
| 2024-06 | 2 | 1510 |
| 2024-07 | 3 | 1794 |
| 2024-08 | 3 | 3210 |
| 2024-09 | 2 | 1545 |
| 2024-10 | 3 | 1859 |
| 2024-11 | 3 | 1974 |
| 2024-12 | 2 | 1610 |
| 2025-01 | 3 | 1959 |
| 2025-02 | 2 | 1650 |

### Ledger trial balance
```sql
global ledger balance check
```
| total_debits | total_credits | delta |
|---|---|---|
| 181080 | 181080 | 0 |

### Ledger balances by account
```sql
ledger balance per account
```
| account | entries | debits | credits | net |
|---|---|---|---|---|
| cash | 27 | 69612 | 25416 | 44196 |
| operating_expenses | 14 | 25416 | 0 | 25416 |
| accounts_receivable | 26 | 86052 | 69612 | 16440 |
| sales_revenue | 13 | 0 | 86052 | -86052 |

### Reconciliation anomalies (verified row-level)
```sql
anomalies: void-but-paid #11 (925.00), paid-no-payments #28 (1756.00), 5 split-payment invoices (1,5,12,19,22), 1 partial (4000 of 6148)
```
| id | status | invoice_amount | payment_rows | paid_amount |
|---|---|---|---|---|
| 1 | paid | 4860 | 2 | 4860 |
| 5 | paid | 5284 | 2 | 5284 |
| 11 | void | 925 | 1 | 925 |
| 12 | paid | 4723 | 2 | 4723 |
| 19 | paid | 5614 | 2 | 5614 |
| 22 | paid | 4459 | 2 | 4459 |
| 25 | open | 6148 | 1 | 4000 |
| 28 | paid | 1756 | 0 | 0 |

### Probe-derived canonical cells — wave-8+9 agent dumps (canonicalized 2026-10-16)

Every figure below was probe-derived by a wave-8/9 kit agent against this db and flagged
for canonicalization in its worklog note. Cells marked **re-verified** were re-probed
2026-10-16; the rest are transcribed verbatim from the verifying agent's note. Kit names
are provenance, not usage restrictions — any kit may quote these.

#### Money-read conventions (read this first)
- Finance tables (`invoices.amount_cents`, `payments.amount_cents`, `expenses.amount`, `ledger_entries.amount`) store **INTEGER cents**; every dollar figure in this file is the `/100.0` read. Example (accor): Rent 16,800.00 = 1,680,000 raw cents. Example (asos): the paid book 66,443.00 = 6,644,300 raw cents. Rupee kits (hdfc) use the identical convention in paise: 6,561,200 paise prints as 65,612.00.
- `orders.total` and `order_items.unit_price` are **REAL dollars** already — no fold needed.
- ROUND ambiguity (n26): every statement-group cent sum on this book is a whole multiple, so a bare-column `ROUND(col, 2)` cents-fold can silently reproduce the dollar digits. Prefer the `/100.0` read or a fixed display fold; avoid bare-column ROUND as a case slot.

#### Invoice / payments cells
- Paid book — **re-verified 2026-10-16**: 21 paid invoices, SUM 66,443.00 (6,644,300 cents), AVG 3,163.95 (316,395.24 cents). (standardchartered's note said "≈3,164 cents" — units slip; the true read is ≈3,164 **dollars**.)
- Payments — **re-verified 2026-10-16**: 27 payment rows, SUM 69,612.00 (6,961,200 cents — ties to the ledger cash credit), AVG payment row 2,578.22 (257,822.22 cents).
- Paid-status settled legs (n26) = **64,687.00** = 65,612.00 exact-covered − 925.00 void-but-debited leg (#11).
- Coverage census bucket composition (remitly/hdfc): exact = **21** because void-but-debited #11 (925.00) folds IN and paid-status-no-payments #28 (1,756.00) folds OUT; none = 6 statements / 15,217.00; partial = 1 (4,000.00 of 6,148.00, invoice #25).
- Dunning blocks beyond the 6/15,217 aggregate (monzo): no-payment open statements **18/873.00, 21/1,295.00, 24/4,937.00, 26/3,562.00, 27/2,794.00**.
- Never-remitted per-status split (kfc): open cohort **5 statements / 13,461.00** vs the single paid lie **#28 / 1,756.00**.
- Split-rail statements (hdfc): **5** invoice cycles settle on BOTH card and wire legs.
- Settlement clock (standardchartered/mufg): 28.4 avg / 13 fastest / 84 slowest settlement days; 22 statements carry legs, 20 of the paid book settle with legs.
- Above-line invoice count (figma): **12** invoices above the line-price ceiling band.

#### Order / line cells
- Basket depth (asos): 251 lines / 103 orders = **2.44** lines per order; max line quantity **3**.
- Total participant units (getyourguide) — **re-verified 2026-10-16**: **498** units across the 251 lines.
- Seat-band fold (figma) — threshold re-derived 2026-10-16: `unit_price < 55` arm **268 units @ 31.01 avg line price**, `>= 55` arm **230 units @ 115.85**.
- Top-customer order ladder (cabify): **24 / 17 / 14 / 13 / 5** with a three-way tie at 4 below.
- 5-trip household ladder cells (kroger): probe-derived, cells live in the kroger case SQL (cs-kroger-*).
- Per-supplier units and per-month LATAM/region revenue splits (mercadolibre): probe-only, not canonical.

#### Region / status / fleet cells
- Per-region status census with abandoned-share column (tesco): probe-derived via the tesco case SQL (cs-tesco-*).
- Aisle×band revenue fold (tesco): Audio/standard **11,744.01 @ 100** … Apparel **1,384.15 / 600.78** (standard vs promo band).
- Corridor lead-time × rider-coverage grid (amtrak): **36/8, 29/5, 15/2, 2/1** (latency / customers per region).
- Delivered-only per-fleet fare books (yango): Nordic **3,711.42**, Alpine **3,013.61** (17 completed rides each).
- Per-category big-ticket fold, threshold 500.00 (yango): Rent **14** / Ads **0** / Travel **1** / Tools **0** line counts.
- LATAM flows (mufg): the 2 LATAM orders are BOTH delivered — the missing cells in the status×region grid are zeros.
- Per-market funded-only latency counts (sofi): **36 / 29 / 15 / 2**.
- 3,000-line cohort foot (marqeta): **22,121.70 over 68 of 103 batches**; the 13-row status×market census with PARTITION loads exists only inside the facts grid above.
- Fare-family revenue beyond the top-12 combos (delta): APAC Video **1,051.64**; LATAM Audio **357.51** (Wearables/Video 0).
- Market-by-tier folio fold (accor; feet exactly to the region books 15,089.23 / 11,605.45 / 7,286.16 / 852.44): EU midscale **12,032.44 @ 79.7%** + economy **3,056.79 @ 20.3%**; APAC **8,611.42 @ 74.2%** + **2,994.03 @ 25.8%**; US **5,335.40 @ 73.2%** + **1,950.76 @ 26.8%**; LATAM **626.25 @ 73.5%** + **226.19 @ 26.5%**. Premium arm is EMPTY (ladder tops out at 199.99 — mercadolibre confirms max).
- Per-zone settled-only customers (hdfc, stamped-only filter): EU **8** / APAC **5** / US **2** / LATAM **1**.

#### Supplier / product / cohort cells
- Trusted-bench avg_price grain (miro): the 139.66/72-style cells are **AVG over supplier rows**, NOT lines-weighted (lines-weighted gives 133.55/62.59). State the grain explicitly when slotting.
- Per-creator usage-line counts (miro): Nordic **43**, Alpine **40**; five-logo ladder foot **24,789.63 = 71.2%** band boundary.
- Per-partner line-vs-SKU counts (kroger): Nordic **43/3**, Midwest **56/3**, Alpine **40/2**, Andes **25/2**, Shenzhen **47/3**, Pacific **40/3**.
- Per-workload-family line records (databricks): Audio **51**, Wearables **25**, Video **32**, Electronics **44**, Accessories **62**, Apparel **24**, Fitness **13**; blended per-unit rates Audio **121.07** vs Accessories **27.23**.
- Category-pair co-usage (airtable): **27 raw pairs** incl. **6 multi-SKU diagonals**; Fitness diagonal impossible at 1 SKU. Usage-ladder tie structure behind RANK drills: **36×2, 30×3, 21×3**.
- ≥5-product member cohort (sofi): **24 / 17 / 14 / 13 / 5** vs the 6.44 mean (exactly 4 above). Statement leg distribution: 0 legs ×6, 1 leg ×17, 2 legs ×5 (of 28 invoices).

#### Open gaps (wanted by agents, still absent from this file)
- Per-market billing-basis burn split (committed vs on-demand dollars, not counts) — databricks.
- Per-market attach split for the 54-of-103 Accessories-family attach — accor.
- Per-rail corridor attribution (card vs wire legs per region) — hdfc/mufg/cabify.
- Per-batch rail attribution (which funding leg settled which statement) — marqeta.
- Per-division tender-rail split — kroger. Per-statement charge-rail split at invoice grain — cabify.
- Per-ride fare counts above the 338.19 mean — yango. Per-partner journey counts — amtrak.
- Per-supplier settlement-coverage cut — mercadolibre. Per-market fire-clock split (fired-vs-completed shares) — kfc.
- Per-workspace board/collaborator usage-line splits — miro (db cannot express board-type granularity; usage telemetry stays at line grain).
- Per-corridor or per-month settlement-day split — standardchartered.
