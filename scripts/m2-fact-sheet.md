# M2 verified fact sheet (probed: scripts/m2-facts*.ts, seed db)

## Volumes
sqlite 3.46.0 (RIGHT/FULL OUTER OK since 3.39) · customers 16 · suppliers 6 · products 16 ·
orders 103 · order_items 251 · invoices 28 · payments 27 · expenses 36 · ledger_entries 80

## Customers (id · name · city · region · active)
1 Alice Chen · Berlin · EU · 1 — 24 orders (max), spend 7262.35, 3 pending
2 Bruno Silva · São Paulo · LATAM · 1 — no pending, no shipped, no cancelled
3 Chloe Dubois · Lyon · EU · 1 — 5 orders, 2667.93, 2 pending, no shipped
4 Dmitri Volkov · Tallinn · EU · 0 — no pending/shipped/cancelled
5 Emma Wilson · Austin · US · 1 — 17 orders, 6640.56, 3 pending
6 Farid Nasser · Dubai · APAC · 1 — 13 orders, 3644.56, 1 pending, no shipped
7 Grace Kim · Seoul · APAC · 1 — 14 orders, 4574.23, 1 pending
8 Hiro Tanaka · Osaka · APAC · 1 — no pending (has shipped orders)
9 Isabella Rossi · Milan · EU · 1 — 4 orders, no pending
10 Jamal Wright · Chicago · US · 1 — no pending
11 Keiko Sato · Nagoya · APAC · 0 — 1 pending, no shipped
12 Liam O'Brien · Cork · EU · 1 — ONLY customer with no delivered order, no pending
13 Maya Patel · Mumbai · APAC · 1 — 13 orders, 3644.56, 2 pending
14 Noah Meyer · Hamburg · EU · 1 — no pending
15 Olivia Brown · London · EU · 1 — no pending, no shipped
16 Pedro Alvarez · Madrid · EU · 1 — 1 pending

Regions: EU 8 · APAC 5 · US 2 · LATAM 1. Same-region pairs 39 (EU 28, APAC 10, US 1 Emma+Jamal, LATAM 0).
All 16 cities distinct → same-city self-join = EMPTY.

## Products (id · name · category · price · supplier)
1 Mechanical Keyboard K1 · Electronics · 89.99 · S1(Nordic, EU)
2 Wireless Mouse M3 · Electronics · 34.50 · S2(Shenzhen, APAC)
3 USB-C Hub 7-in-1 · Electronics · 49.00 · S3(Pacific, APAC)
4 Noise-Canceling Headset · Audio · 149.99 · S4(Midwest, US)
5 Studio Desktop Mic · Audio · 119.00 · S5(Alpine, EU)
6 Bluetooth Speaker Mini · Audio · 59.99 · S6(Andes, LATAM)
7 4K Webcam Pro · Video · 129.00 · S1
8 Ring Light 14" · Video · 39.99 · S2
9 HDMI 2.1 Cable 2m · Accessories · 14.99 · S3
10 Laptop Stand Aluminum · Accessories · 42.50 · S4
11 Desk Mat Extended · Accessories · 24.99 · S5
12 Fitness Band X2 · Wearables · 79.00 · S6
13 Smart Watch S · Wearables · 199.99 · S1
14 Running Socks 3-pack · Apparel · 18.50 · S2
15 Cycling Jersey Pro · Apparel · 65.00 · S3
16 Yoga Mat Eco 6mm · Fitness · 32.00 · S4

Suppliers: 1 Nordic Gadgets AB EU 4.6 · 2 Shenzhen Electro APAC 4.1 · 3 Pacific Textiles APAC 3.9 ·
4 Midwest Hardware Co US 4.4 · 5 Alpine Audio GmbH EU 4.8 · 6 Andes Naturals SA LATAM 4.0
Supplier product counts: Nordic 3, Shenzhen 3, Pacific 3, Midwest 3, Alpine 2, Andes 2.
Supplier revenue: Nordic 11130.25, Midwest 9294.93, Alpine 4765.63, Andes 3613.25, Shenzhen 3049.07, Pacific 2980.15.

## Joins on the seed
- INNER orders×customers = 103 (FK complete: every order has a customer; every customer has orders → plain anti-join EMPTY)
- items×orders = 251 · 3-table chain items→orders→customers = 251 · EU orders 45 · pending w/ names 14
- customers LEFT JOIN orders (plain) = 103, 0 NULL-padded (FK complete)
- LEFT JOIN pending-in-ON: 22 rows; NULL-padded 8 = Bruno, Dmitri, Hiro, Isabella, Jamal, Liam, Noah, Olivia
- pending per customer: 1→3, 3→2, 5→3, 6→1, 7→1, 11→1, 13→2, 16→1 (8 customers, 14 total)
- Anti-joins that bite: no pending 8 · no delivered 1 (Liam) · no shipped 6 (Bruno, Chloe, Dmitri, Farid, Keiko, Olivia) · no cancelled 12
- invoices LEFT/RIGHT/FULL JOIN payments = 33 rows (27 payments cover 22 invoices; 5 invoices have 2 payments: 1, 5, 12, 19, 22)
- 6 unpaid invoices: INV-2024-018 (873.00 open), INV-2024-021 (1295.00 open), INV-2025-024 (4937.00 open),
  INV-2025-026 (3562.00 open), INV-2025-027 (2794.00 open), INV-2025-028 (1756.00 status='paid' but 0 payments!)
- Status quirks: INV-2025-025 'open' WITH a payment · INV-2025-028 'paid' WITHOUT. Invoice statuses: open 6 / paid 21 / void 1.
- 0 orphan payments. FULL OUTER unmatched = 6 invoice-side rows.

## CROSS / SELF figures
- products×products = 256 · expenses×products = 576
- same-category pairs (a≠b, both directions) = 40 = 16 diagonal + 24 off-diagonal; cheaper→pricier same-category = 12
- distinct category pairs = 49 (7×7); categories: Accessories, Apparel, Audio, Electronics, Fitness, Video, Wearables
- same-customer same-status order pairs = 212 · product pairs with identical price = 0 (all prices distinct)

## Fan-out
- honest total 34833.28 → naive join-sum 103244.55 (×2.964); 251 join rows from 103 orders; distinct orders 103
- 4-item orders: 1 (576.54), 6 (752.96), 11 (283.12). items/order: 1→26, 2→29, 3→25, 4→23 (avg 2.44)
- orders-per-customer dist: 1→2, 2→3, 3→2, 4→4, 5→1, 13→1, 14→1, 17→1, 24→1

## Region aggregates (via join)
orders: EU 45, APAC 37, US 19, LATAM 2 · spend: EU 15089.23, APAC 11605.45, US 7286.16, LATAM 852.44
delivered: EU 24, APAC 21, US 5, LATAM 2 · unshipped: EU 9, APAC 8, US 4, LATAM 0 · EU pending 6 · EU delivered revenue 6656.18

## Category revenue (3-table join)
Audio 11744.01/51 li · Wearables 6929.12/25 · Video 5198.41/32 · Electronics 4818.61/44 ·
Accessories 3294.29/62 · Apparel 1984.93/24 · Fitness 863.91/13
Units: Desk Mat 47, Headset 46, HDMI 38, Laptop Stand 36, Mouse 36.
Customer spend top5: Alice 7262.35, Emma 6640.56, Grace 4574.23, Maya 3644.56, Chloe 2667.93.

## Order 1 items (fan-out receipt)
Yoga Mat ×3 @31.02 · HDMI ×2 @15.15 · Desk Mat ×1 @25.26 · Headset ×3 @142.64 (total 576.54)
Order 6: Mic ×3 @119.17 · Keyboard ×3 @89.58 · Desk Mat ×1 @26.03 · Mouse ×3 @33.56 (752.96)

## Payments/expenses
methods: card 16, wire 11 · expense categories: Ads 14, Rent 14, Tools 5, Travel 3
EU unshipped order ids: 1,7,19,21,25,42,43,79,95
