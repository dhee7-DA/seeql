// Fill drills for Module 7 — Data Modification (lessons 41-44 + capstone 50).
//
// Module rule: fills are audited live against the seed db, so every COMPLETED
// SQL here is a read (SELECT/WITH/EXPLAIN) — the write side is drilled through
// its read-side mirror: preview the blast radius, verify the would-be landed
// rows, mirror the SET/upsert arithmetic with a CASE or expression. Write
// keywords still appear in chips and prompts; the completed queries stay safe.
// See m01.ts for the golden example: template slots {1}..{n}, answers[i]
// completes slot i+1, every completed SQL must run on the seed db.
import type { Fill } from "../types";

export const FILLS_BY_LESSON: Record<number, Fill[]> = {
  // Lesson 41 — INSERT — adding rows
  41: [
    {
      id: "l41-f1",
      prompt: "The clearance-shelf INSERT clones every Apparel product via INSERT INTO … SELECT. Preview how many rows will land: count them with the same WHERE the SELECT arm uses.",
      template: "SELECT COUNT(*) AS rows_to_land\nFROM {1}\nWHERE category = {2};",
      chips: ["products", "order_items", "'Apparel'", "'Clearance'", "Apparel"],
      answers: ["products", "'Apparel'"],
      why: "INSERT INTO … SELECT lands exactly the rows its SELECT returns — here 2, the Cycling Jersey Pro and Running Socks 3-pack, re-priced to 9.99. Zero SELECT rows would mean zero inserts, silently.",
      notes: [
        { slot: 1, why: "order_items knows nothing about categories — the cloned rows come from the catalog itself: products." },
        { slot: 2, why: "Unquoted Apparel is read as a column name and crashes — category values are quoted text. 'Clearance' is the shelf being CREATED, not the one being cloned." },
      ],
    },
    {
      id: "l41-f2",
      prompt: "The win-back campaign's preview crashed with `no such column: inactive` — the flag column is named something else. Fill the real column and the dormant value so the count matches what the INSERT INTO orders SELECT would land.",
      template: "SELECT id AS campaign_customer\nFROM customers\nWHERE {1} = {2};",
      chips: ["active", "inactive", "0", "1", "'inactive'"],
      answers: ["active", "0"],
      why: "The column is active, and active = 0 finds the two dormant accounts — Dmitri Volkov and Keiko Sato — so the campaign's INSERT INTO … SELECT would land exactly 2 pending orders.",
      notes: [
        { slot: 1, why: "The error named the fiction: there is no inactive column — the schema's flag is active, 1 means buying, 0 means dormant." },
        { slot: 2, why: "active = 1 selects the 14 living accounts — the win-back targets the customers NOT buying." },
      ],
    },
    {
      id: "l41-f3",
      prompt: "Tara's INSERT fired and the engine chose the id — which read proves the row landed when you don't know which id it got? Match the key YOU supplied.",
      template: "SELECT id, name\nFROM customers\nWHERE email = {1};",
      chips: ["'tara.singh@example.com'", "tara.singh@example.com", "'Tara Singh'", "email", "id"],
      answers: ["'tara.singh@example.com'"],
      why: "The id came from the engine, but the email came from your VALUES list — on the fresh db this reads empty (the proof it hasn't landed yet); after the insert, the same read returns the row with its new id 17. Names would work today but emails are the natural key an import can rely on.",
      notes: [
        { slot: 1, why: "Unquoted, the address is read as a column name and crashes — text values wear single quotes." },
      ],
    },
    {
      id: "l41-f4",
      prompt: "Read-before-write: one row, both next ids — the numbers the engine will hand out the moment an insert omits the id column (INTEGER PRIMARY KEY = max(id) + 1).",
      template: "SELECT (SELECT MAX(id) + 1 FROM customers) AS next_customer,\n       (SELECT MAX(id) + 1 FROM {1}) AS next_order;",
      chips: ["orders", "order_items", "customers", "products"],
      answers: ["orders"],
      why: "Two scalar subqueries, no FROM needed on the outer SELECT: customers hands out 17, and orders — 103 rows deep — hands out 104. These are exactly the ids problems 1 and 4 will consume.",
      notes: [
        { slot: 1, why: "order_items has its own id sequence — the brief asks where the new ORDER lands: the orders table." },
      ],
    },
    {
      id: "l41-f5",
      prompt: "The two-gadget INSERT must not duplicate anything already on the shelf. Prove both names are new in one read.",
      template: "SELECT COUNT(*) AS already_there\nFROM products\nWHERE name IN ({1}, {2});",
      chips: ["'USB-C Dock Duo'", "'HDMI Cable 3m'", "USB-C Dock Duo", "'USB-C Dock', 'HDMI Cable'", "product_id"],
      answers: ["'USB-C Dock Duo'", "'HDMI Cable 3m'"],
      why: "The count reads 0 today — both names are genuinely new, so the two-row VALUES insert adds them without stepping on anything. After it lands, the same read reports 2.",
      notes: [
        { slot: 1, why: "Unquoted, USB-C Dock Duo is read as three mystery columns — names are quoted text." },
        { slot: 2, why: "Each list member needs its own quotes: IN ('USB-C Dock', 'HDMI Cable') would match nothing — the real names are longer." },
      ],
    },
  ],

  // Lesson 42 — UPDATE — changing rows in place
  42: [
    {
      id: "l42-f1",
      prompt: "The fleet-shipment preview counted 21 rows, but the UPDATE only moves pending orders — the preview's WHERE also caught the 7 cancelled orders (they have no ship date either). Fix the preview so it mirrors the UPDATE's WHERE.",
      template: "SELECT COUNT(*) AS sweep_width\nFROM orders\nWHERE status = {1};",
      chips: ["'pending'", "shipped_at IS NULL", "'shipped'", "pending", "'cancelled'"],
      answers: ["'pending'"],
      why: "The UPDATE's WHERE is status = 'pending', so the preview must say the same: 14 orders. shipped_at IS NULL over-counts at 21 because cancelled orders also lack a ship date — preview and write must agree by construction.",
      notes: [
        { slot: 1, why: "'shipped' counts the 30 already done, and unquoted pending is read as a column — the preview's WHERE must be the UPDATE's WHERE, verbatim." },
      ],
    },
    {
      id: "l42-f2",
      prompt: "Mirror the thin-shelves UPDATE before running it: show each candidate's stock beside the after-delivery number the CASE would write.",
      template: "SELECT id, name, stock,\n       stock + CASE WHEN stock < 50 THEN {1} ELSE {2} END AS after_stock\nFROM products\nWHERE {3};",
      chips: ["40", "0", "50", "stock < 50", "stock > 50"],
      answers: ["40", "0", "stock < 50"],
      why: "The read mirrors SET exactly: Studio Desktop Mic 45 → 85 and Smart Watch S 40 → 80 — the two rows the WHERE keeps. The ELSE 0 guard is why any future row that slips past the filter adds nothing instead of NULL-poisoning its stock.",
      notes: [
        { slot: 1, why: "50 in the THEN branch would deliver 50 units — the delivery is 40; the threshold belongs in the WHEN." },
        { slot: 2, why: "ELSE 50 would hand non-candidates a phantom delivery — the guard adds nothing: ELSE 0." },
        { slot: 3, why: "stock > 50 selects the wrong rows entirely — the delivery targets thin shelves, below 50." },
      ],
    },
    {
      id: "l42-f3",
      prompt: "The 10% Wearables markup, previewed as a read: compute the after-price the UPDATE's SET price = ROUND(price * 1.1, 2) will store.",
      template: "SELECT name, price,\n       ROUND(price * {1}, 2) AS after_price\nFROM products\nWHERE category = {2};",
      chips: ["1.1", "0.9", "1.01", "'Wearables'", "Wearables"],
      answers: ["1.1", "'Wearables'"],
      why: "The mirror computes exactly what SET will write: Fitness Band X2 79 → 86.90 and Smart Watch S 199.99 → 219.99, snapped to clean money. Times 0.9 is a discount; 1.01 is one percent.",
      notes: [
        { slot: 1, why: "0.9 and 1.01 are real arithmetic but different policies — a 10% markup multiplies by 1.10." },
        { slot: 2, why: "Unquoted Wearables is read as a column name and crashes — category values are quoted text." },
      ],
    },
    {
      id: "l42-f4",
      prompt: "The freeze-the-dormant UPDATE cancels every order whose customer is inactive via customer_id IN (SELECT …). Preview its blast radius — the subquery freezes first, then the count.",
      template: "SELECT COUNT(*) AS blast_radius\nFROM orders\nWHERE customer_id IN (SELECT id FROM customers\n                      WHERE active = {1});",
      chips: ["0", "1", "'inactive'", "11", "2"],
      answers: ["0"],
      why: "active = 0 freezes the subquery to {4, 11} — Dmitri Volkov and Keiko Sato — and their orders number 6. That 6 is exactly the affected count the UPDATE will report.",
      notes: [
        { slot: 1, why: "active = 1 is the living business (14 customers) — the freeze targets active = 0. And 'inactive' is a string no column holds; the flag is numeric." },
      ],
    },
    {
      id: "l42-f5",
      prompt: "The EU price-alignment UPDATE pulls each supplier's rating through UPDATE … FROM and writes price = ROUND(price * rating / 5.0, 2). Preview the same math as a join: the divisor and the key that glues each product to its supplier.",
      template: "SELECT p.id, p.name, p.price,\n       ROUND(p.price * s.rating / {1}, 2) AS after_price\nFROM products p\nJOIN suppliers s ON {2}\nWHERE s.region = 'EU';",
      chips: ["5.0", "4.6", "s.id = p.supplier_id", "p.id = s.id", "s.rating = p.price"],
      answers: ["5.0", "s.id = p.supplier_id"],
      why: "The read mirrors UPDATE … FROM: five products pair with their EU supplier, K1's 89.99 landing at 82.79 (4.6 / 5.0) and the Studio Mic's 119 at 114.24. UPDATE … FROM has no ON clause — this join lives in its WHERE, and p.id = s.id would glue the wrong keys entirely.",
      notes: [
        { slot: 1, why: "The factor is rating / 5.0 — a 4.6-rated supplier divides by five, not by its own rating." },
        { slot: 2, why: "s.id = p.id pairs each product with the supplier whose id EQUALS the product's id — a key collision. The supplier's key rides in products.supplier_id." },
      ],
    },
  ],

  // Lesson 43 — DELETE — removing rows safely
  43: [
    {
      id: "l43-f1",
      prompt: "`DELETE FROM orders WHERE status = 'cancelled'` fails with FOREIGN KEY constraint failed while children still point at those orders. Count the child rows holding the fence shut.",
      template: "SELECT COUNT(*) AS fence_pins\nFROM order_items\nWHERE order_id IN (SELECT {1} FROM orders WHERE status = {2});",
      chips: ["id", "customer_id", "'cancelled'", "cancelled", "'pending'"],
      answers: ["id", "'cancelled'"],
      why: "12 line items reference the 7 cancelled orders — those 12 pins are why the parent DELETE refuses. Clear the children first (lesson 43's order: children, then parents) and the same parent delete sails through.",
      notes: [
        { slot: 1, why: "The subquery walks the parent's own key: orders.id. customer_id would collect buyers, not the order ids the fence is pinned by." },
        { slot: 2, why: "Unquoted cancelled is read as a column name and crashes — status values are quoted text." },
      ],
    },
    {
      id: "l43-f2",
      prompt: "QA's bulk-line preview ran `WHERE quantity > 3` and counted 0 lines — but the audit ticket says quantity >= 3, and the DELETE will report 89. Fix the preview's operator and boundary so the numbers agree.",
      template: "SELECT COUNT(*) AS n\nFROM order_items\nWHERE quantity {1} {2};",
      chips: [">=", ">", "3", "4"],
      answers: [">=", "3"],
      why: "Every bulk line on this data is exactly 3 — 89 of them — so > 3 reads 0 while >= 3 reads 89. The preview and the DELETE must share the WHERE verbatim, boundary included, or the mismatch is a fire alarm.",
      notes: [
        { slot: 1, why: "= 3 happens to agree here (89) but isn't the ticket's predicate — write what the audit says." },
        { slot: 2, why: "4 would drop every exactly-3 line — the ticket's boundary is 3, greater-or-equal." },
      ],
    },
    {
      id: "l43-f3",
      prompt: "HDMI 2.1 Cable 2m (product 9) is discontinued. Preview the stop-sell sweep: how many order_items rows SELL product 9?",
      template: "SELECT COUNT(*) AS to_remove\nFROM order_items\nWHERE {1};",
      chips: ["product_id = 9", "order_id = 9", "id = 9", "quantity = 9", "name = 'HDMI 2.1 Cable 2m'"],
      answers: ["product_id = 9"],
      why: "19 lines sell the discontinued cable, scattered across whatever orders carry it — order_id = 9 would target order 9, a different slice entirely. This is also the leaf-table delete that can never trip the foreign-key fence.",
      notes: [
        { slot: 1, why: "id = 9 is a LINE's own id — the criterion is which product the line sells: product_id." },
      ],
    },
    {
      id: "l43-f4",
      prompt: "After DELETE empties a table, the object survives. Prove it against the catalog itself: find the order_items table object in sqlite_master.",
      template: "SELECT name, type\nFROM sqlite_master\nWHERE name = {1} AND type = {2};",
      chips: ["'order_items'", "order_items", "'table'", "'row'", "'DELETE'"],
      answers: ["'order_items'", "'table'"],
      why: "One catalog row answers — type 'table' — even with every order_items line deleted: DELETE empties rows, DROP TABLE is what removes the object. sqlite_master is the database's own inventory, readable like any table.",
      notes: [
        { slot: 1, why: "Unquoted order_items would be read as a COLUMN of sqlite_master — catalog values are quoted text." },
        { slot: 2, why: "'row' isn't a kind sqlite_master records — the object types include 'table', 'index' and 'view'." },
      ],
    },
    {
      id: "l43-f5",
      prompt: "The cancelled orders are soft deletes — parked, not purged. Count the rows a hard DELETE would have destroyed but the status flag kept.",
      template: "SELECT COUNT(*) AS parked\nFROM orders\nWHERE status = {1};",
      chips: ["'cancelled'", "'pending'", "cancelled", "DELETE", "'deleted'"],
      answers: ["'cancelled'"],
      why: "7 cancelled orders — business history a DELETE would have torn out of the FK graph. The flag keeps them queryable for audits and returns while every report simply filters them out.",
      notes: [
        { slot: 1, why: "There is no 'deleted' status on this schema — the storefront's tombstone is spelled 'cancelled'." },
      ],
    },
  ],

  // Lesson 44 — UPSERT & transactions — collisions and all-or-nothing
  44: [
    {
      id: "l44-f1",
      prompt: "The nightly feed pushes product 1 with stock 25 under ON CONFLICT (id) DO UPDATE SET stock = stock + excluded.stock. Mirror the delta arithmetic in a read: what will land?",
      template: "SELECT name, stock,\n       stock + {1} AS after_upsert\nFROM products\nWHERE id = {2};",
      chips: ["25", "excluded.stock", "1", "2", "145"],
      answers: ["25", "1"],
      why: "The mirror reads both worlds the way the upsert does: the incumbent's 120 plus the candidate's 25 lands at 145. excluded.stock is upsert-only vocabulary — a plain SELECT has no candidate row, so the payload's 25 arrives as a literal.",
      notes: [
        { slot: 1, why: "excluded exists only inside the upsert's DO UPDATE branch — a SELECT can't see the rejected candidate, only its values as literals." },
        { slot: 2, why: "id 2 is the mouse ticket's shelf (300) — the K1 payload collides with product 1, the row the ON CONFLICT (id) target catches." },
      ],
    },
    {
      id: "l44-f2",
      prompt: "Two UPDATEs ran inside BEGIN — the fleet shipment moving the 14 pending orders — and then ROLLBACK. Count the orders that are 'shipped' now.",
      template: "SELECT COUNT(*) AS shipped\nFROM orders\nWHERE status = {1};",
      chips: ["'shipped'", "'pending'", "shipped", "'rolled'", "'delivered'"],
      answers: ["'shipped'"],
      why: "ROLLBACK rewinds both UPDATEs as one unit: the 30 shipped are the pre-transaction ones and the 14 pending never moved. Without BEGIN, autocommit would have made the first UPDATE permanent — that's the gap transactions exist to close.",
      notes: [
        { slot: 1, why: "'pending' counts the orders the transaction WOULD have moved — after ROLLBACK they're still 14, untouched. There is no 'rolled' status." },
      ],
    },
    {
      id: "l44-f3",
      prompt: "Before trusting the upsert, probe its conflict target: ON CONFLICT (id) only matters if a row with that key already exists. Count the collisions the payload's id will hit.",
      template: "SELECT COUNT(*) AS will_collide\nFROM products\nWHERE {1} = {2};",
      chips: ["id", "name", "1", "17", "900"],
      answers: ["id", "1"],
      why: "One row matches id 1 — the candidate loses the insert path and DO UPDATE fires. A count of 0 (a payload keyed 900) would have predicted a clean insert with the upsert branch never waking.",
      notes: [
        { slot: 1, why: "The conflict target names the PRIMARY KEY — the probe must read the same column the ON CONFLICT clause declares." },
        { slot: 2, why: "17 is the next free id — probing it returns 0 and predicts an insert, not an update." },
      ],
    },
    {
      id: "l44-f4",
      prompt: "The price-match upsert adopted HIGHER prices — a markup machine — because its guard was inverted (`excluded.price > price`). Mirror the corrected policy as a read: candidate 29.50 against product 2's incumbent shelf price.",
      template: "SELECT id, price,\n       CASE WHEN {1} THEN 'adopt' ELSE 'keep' END AS verdict\nFROM products\nWHERE id = 2;",
      chips: ["29.5 < price", "price < 29.5", "excluded.price < price", "price < price"],
      answers: ["29.5 < price"],
      why: "The corrected guard reads candidate-below-incumbent: 29.5 < 34.5, verdict 'adopt'. excluded.price can't run in a plain SELECT — here the candidate's price is a literal you supply, and the CASE previews exactly which collisions the upsert's WHERE will let through.",
      notes: [
        { slot: 1, why: "price < 29.5 is the inverted bug again — 34.5 < 29.5 is false, so the guard would adopt nothing and the 'cheaper candidate wins' policy silently dies." },
      ],
    },
    {
      id: "l44-f5",
      prompt: "The three-row batch inserts fresh ids 900 and 901 while its third group (id 1) collides. Read the fork before the write: how many of the two fresh keys are already on the shelf?",
      template: "SELECT COUNT(*) AS already_there\nFROM products\nWHERE id IN ({1}, {2});",
      chips: ["900", "901", "1", "'900'"],
      answers: ["900", "901"],
      why: "Zero — both fresh ids sail through the insert branch, while the batch's id 1 (not in this probe — probing it reads 1) collides and takes DO UPDATE. One statement, three fates, 3 changes: the affected count adds them all.",
      notes: [
        { slot: 1, why: "Probing id 1 would read 1 — the collision. This probe sizes the INSERT side of the fork." },
        { slot: 2, why: "'900' quoted compares text against an integer key — ids are bare numbers." },
      ],
    },
  ],

  // Lesson 50 — Case study capstone: the data-fix ticket
  50: [
    {
      id: "l50-f1",
      prompt: "Task 1, the census — the baseline every later fix answers to: per order status, the count and the value, most common first.",
      template: "SELECT status,\n       COUNT(*) AS n,\n       ROUND(SUM({1}), 2) AS value\nFROM {2}\nGROUP BY {3}\nORDER BY n DESC;",
      chips: ["total", "quantity", "orders", "order_items", "status", "customer_id"],
      answers: ["total", "orders", "status"],
      why: "The before-picture: delivered 52, shipped 30, pending 14, cancelled 7 — with delivered holding 15,571.07 of the store's value. Every task after this one moves a number on exactly this baseline, which is how you'll know the fixes worked.",
      notes: [
        { slot: 1, why: "SUM(quantity) adds units, not dollars — the census values each bucket in order total." },
        { slot: 2, why: "order_items has no status or total — the census buckets the orders table." },
        { slot: 3, why: "GROUP BY customer_id would build 16 customer buckets — the incident buckets lifecycle stages." },
      ],
    },
    {
      id: "l50-f2",
      prompt: "Task 2's INSERT adds the skipped Streaming Mic Arm — but first, the damage check that proves the importer really skipped it.",
      template: "SELECT id, name, price\nFROM products\nWHERE name = {1};",
      chips: ["'Streaming Mic Arm'", "Streaming Mic Arm", "'Streaming Mic'", "'mic%'"],
      answers: ["'Streaming Mic Arm'"],
      why: "Zero rows today — the missing launch, proven before anything is written. After task 2's insert, the same read shows the new row with its engine-assigned id 17.",
      notes: [
        { slot: 1, why: "'Streaming Mic' would miss the full name — match the exact string the ticket quotes." },
      ],
    },
    {
      id: "l50-f3",
      prompt: "Task 3 repairs the Wearables feed: Fitness Band X2 → 84.00 and Smart Watch S → 209.99 in ONE statement. Mirror the CASE-in-SET as a read before writing it.",
      template: "SELECT name,\n       CASE name WHEN {1} THEN 84.0\n                 WHEN 'Smart Watch S' THEN 209.99 END AS after_price\nFROM products\nWHERE category = 'Wearables';",
      chips: ["'Fitness Band X2'", "Fitness Band X2", "'fitness band x2'", "'Smart Watch S'"],
      answers: ["'Fitness Band X2'"],
      why: "The mirror lays out both after-prices — 84.00 and 209.99, the feed's intended values — exactly what the UPDATE's CASE writes, one branch per row. Same discipline as the census: one read to check, then one write to trust.",
      notes: [
        { slot: 1, why: "SQLite compares text case-sensitively — 'fitness band x2' matches nothing and the CASE hands back NULL. And unquoted, Fitness Band X2 isn't even one identifier." },
      ],
    },
    {
      id: "l50-f4",
      prompt: "Task 4 purges the test lines: order_items rows whose order is cancelled. Preview the purge's width — and mind which table the subquery reads and which fence rule makes the delete legal.",
      template: "SELECT COUNT(*) AS purge_width\nFROM order_items\nWHERE order_id IN (SELECT id FROM {1} WHERE status = {2});",
      chips: ["orders", "order_items", "customers", "'cancelled'", "'pending'"],
      answers: ["orders", "'cancelled'"],
      why: "12 lines ride the 7 cancelled orders — that 12 is the affected count the DELETE will report. The subquery reads the parent (orders); deleting FROM order_items is legal precisely because the leaf is referenced by nothing.",
      notes: [
        { slot: 1, why: "order_items has no status column — the subquery would crash with `no such column: status`; the cancelled flags live on the parent, orders." },
        { slot: 2, why: "'pending' counts the 14 open orders' lines — the importer's junk is the cancelled batch." },
      ],
    },
    {
      id: "l50-f5",
      prompt: "Task 5 reconciles the mouse stock: the feed's delta of 40 must ADD to product 2's shelf via stock = stock + excluded.stock. The preview was written backwards and predicted 260. Fix the mirror's operator.",
      template: "SELECT name, stock,\n       stock {1} 40 AS after_upsert\nFROM products\nWHERE id = 2;",
      chips: ["+", "-", "*", "||"],
      answers: ["+"],
      why: "The upsert adds the payload: 300 + 40 lands at 340, matching the warehouse counter. Minus predicted 260 and would have shipped a stock cut; || concatenates text — numbers aren't text.",
      notes: [
        { slot: 1, why: "* would invent 12,000 units — the feed's contract is a delta, merged not trusted: stock = stock + excluded.stock." },
      ],
    },
  ],
};
