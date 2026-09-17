// Fill drills for Module 3 (lessons 17-24, capstone lesson 37).
// See m01.ts for the golden example: template slots {1}..{n}, answers[i]
// completes slot i+1, every completed SQL must run on the seed db.
import type { Fill } from "../types";

export const FILLS_BY_LESSON: Record<number, Fill[]> = {
  // Lesson 17 — UNION & UNION ALL: stack result sets
  17: [
    {
      id: "l17-f1",
      prompt: "Stack every order status on every product category — one list, duplicates removed.",
      template: "SELECT status FROM orders\n{1}\nSELECT category FROM products\nORDER BY status;",
      chips: ["UNION", "UNION ALL", "INTERSECT", "EXCEPT"],
      answers: ["UNION"],
      why: "Plain UNION appends the two arms and then dedupes the whole pile — 4 statuses plus 7 categories come out as one alphabetical list of 11. UNION ALL would have kept all 119 raw rows.",
      notes: [
        { slot: 1, why: "UNION ALL appends without deduping — the brief said duplicates removed, and INTERSECT/EXCEPT compare arms against each other instead of merging them." },
      ],
    },
    {
      id: "l17-f2",
      prompt: "One pile of every place the company touches: the customers' city column stacked on the suppliers' region column — nothing removed.",
      template: "SELECT city FROM customers\nUNION ALL\nSELECT {1} FROM suppliers\nORDER BY {2};",
      chips: ["region", "rating", "city", "status"],
      answers: ["region", "city"],
      why: "Position binds the values: arm 1 hands over cities, arm 2 regions — 16 + 6 = 22 rows in one column. The pile is named after the first arm, so the single ORDER BY at the very end sorts it by city.",
      notes: [
        { slot: 1, why: "rating is numeric and would stack fine in SQLite, but the brief asked for places — suppliers' geography lives in region." },
        { slot: 2, why: "The compound takes ONE ORDER BY, after the last arm, and it sorts the combined pile by its output column — city, as arm 1 named it." },
      ],
    },
    {
      id: "l17-f3",
      prompt: "How big is the raw pile? Count every row the un-deduplicated stack of order statuses and product categories produces.",
      template: "SELECT COUNT(*) AS pile FROM (\n  SELECT status FROM orders\n  {1}\n  SELECT category FROM products\n);",
      chips: ["UNION ALL", "UNION", "JOIN", "INTERSECT"],
      answers: ["UNION ALL"],
      why: "119: 103 order rows stacked on 16 product rows, nothing inspected or removed before the count. Plain UNION would have collapsed the pile to 11 before COUNT(*) ever ran.",
      notes: [
        { slot: 1, why: "UNION's dedupe pass runs before the count — you'd report the 11 distinct values, not the raw pile the brief asked for." },
      ],
    },
    {
      id: "l17-f4",
      prompt: "A teammate's directory crashed with `near \"ORDER\": syntax error` — their ORDER BY sat between the arms. The rewrite below is one clause short: finish it so the 22-row directory comes out sorted.",
      template: "SELECT name FROM customers\nUNION ALL\nSELECT name FROM suppliers\n{1} name;",
      chips: ["ORDER BY", "GROUP BY", "WHERE", "SORT BY", "LIMIT"],
      answers: ["ORDER BY"],
      why: "A compound SELECT takes one ORDER BY, written after the last arm, and it sorts the combined pile. Between the arms it parses as nothing — the sort belongs to the finished stack, not to either arm.",
      notes: [
        { slot: 1, why: "GROUP BY would fold the directory into grouped rows and WHERE can't appear after a second arm — the pile needs sorting, and ORDER BY is the only clause that sorts." },
      ],
    },
    {
      id: "l17-f5",
      prompt: "This stack keeps failing with `SELECTs to the left and right of UNION do not have the same number of result columns`. The second arm lost its tag — complete it so both arms carry two columns.",
      template: "SELECT name, 'customer' AS kind FROM customers\nUNION ALL\nSELECT name, {1} FROM {2};",
      chips: ["'supplier'", "suppliers", "supplier", "customers", "'customer'"],
      answers: ["'supplier'", "suppliers"],
      why: "The label literal is a column like any other, so arm 2 must carry one at the same position — quotes included. The table is suppliers, and the finished pile is 22 rows of name + kind.",
      notes: [
        { slot: 1, why: "Bare supplier without quotes would be read as a column name — there is no such column; the tag is a text literal." },
        { slot: 2, why: "The names come from suppliers — customers is arm 1's table, and stacking it twice would tag all 22 rows 'customer'." },
      ],
    },
  ],

  // Lesson 18 — Stacking real data: labels, arms, alignment
  18: [
    {
      id: "l18-f1",
      prompt: "Build the labeled directory: every customer tagged 'customer', every supplier tagged 'supplier', one 22-row pile.",
      template: "SELECT name, {1} AS kind FROM customers\nUNION ALL\nSELECT name, {2} FROM {3}\nORDER BY kind, name;",
      chips: ["'customer'", "'supplier'", "suppliers", "customers", "kind"],
      answers: ["'customer'", "'supplier'", "suppliers"],
      why: "A literal is a constant expression — 'customer' rides on all 16 customer rows, 'supplier' on the 6 supplier rows. Output names come from arm 1, so the whole pile carries the kind column: groupable, filterable, sortable after the fact.",
      notes: [
        { slot: 2, why: "Both arms must tag their own rows — a missing literal breaks the two-column shape and the pile loses the kind column's meaning for arm 2." },
        { slot: 3, why: "The second arm reads suppliers; stacking customers twice would put every row in the pile twice, all tagged 'customer'." },
      ],
    },
    {
      id: "l18-f2",
      prompt: "Report how many rows each source contributes to the labeled pile — one row per kind.",
      template: "SELECT kind, {1} AS n FROM (\n  SELECT 'customer' AS kind FROM customers\n  UNION ALL\n  SELECT 'supplier' FROM suppliers\n) {2} kind\nORDER BY kind;",
      chips: ["COUNT(*)", "SUM(*)", "GROUP BY", "ORDER BY", "WHERE"],
      answers: ["COUNT(*)", "GROUP BY"],
      why: "The label column makes the pile groupable: wrap the stack in a FROM subquery, GROUP BY kind, and COUNT(*) tallies each source — customer 16, supplier 6. The stack itself stays UNION ALL so every row survives to be counted.",
      notes: [
        { slot: 1, why: "SUM(*) is not SQL — and even SUM(COUNT-less rows) aside, counting rows is COUNT's job." },
        { slot: 2, why: "ORDER BY kind alone would return one anonymous total of 22 — one row per source needs GROUP BY kind." },
      ],
    },
    {
      id: "l18-f3",
      prompt: "A teammate wrote `(SELECT id, total FROM orders ORDER BY total DESC LIMIT 3) UNION ALL …` and SQLite answered `near \"UNION\": syntax error` — it rejects parentheses around compound arms. Complete the portable rewrite: the limited arm wrapped as a FROM subquery.",
      template: "SELECT id, total, 'top' AS tag\nFROM ({1}\nORDER BY total DESC, id ASC LIMIT 3)\nUNION ALL\nSELECT id, total, 'bottom' FROM orders\nORDER BY tag DESC, total DESC;",
      chips: ["SELECT id, total FROM orders", "(SELECT id, total FROM orders)", "SELECT id, total, 'top' FROM orders", "orders"],
      answers: ["SELECT id, total FROM orders"],
      why: "The FROM-subquery wrap gives the top-3 slice its own scope — ORDER BY and LIMIT inside, the tag applied outside — and parses in SQLite, Postgres and MySQL alike. The bare parenthesized arm is a SQLite syntax error.",
      notes: [
        { slot: 1, why: "The tag is added by the outer SELECT — putting 'top' inside the wrapped arm would make three columns and break the alignment with the second arm." },
      ],
    },
    {
      id: "l18-f4",
      prompt: "This three-source pile keeps its shape only if every arm carries a tag. Complete the product arm so the stack survives.",
      template: "SELECT 'customer' AS kind FROM customers\nUNION ALL\nSELECT 'supplier' FROM suppliers\nUNION ALL\nSELECT {1} FROM {2};",
      chips: ["'product'", "products", "product", "items", "'supplier'"],
      answers: ["'product'", "products"],
      why: "One literal tag per arm keeps the pile two columns wide end to end — 'product', quotes included — and the rows come from products. The finished pile holds 16 + 6 + 16 = 38 rows, still groupable by kind.",
      notes: [
        { slot: 1, why: "Unquoted product would be read as a column name — products has no such column; the tag is a constant text literal." },
        { slot: 2, why: "The product rows live on products — items is not a table in this schema (line items are order_items)." },
      ],
    },
    {
      id: "l18-f5",
      prompt: "Un-stack a slice after the fact: from the labeled pile, keep only the supplier rows — one row, one honest count.",
      template: "SELECT kind, COUNT(*) AS n FROM (\n  SELECT 'customer' AS kind FROM customers\n  UNION ALL\n  SELECT 'supplier' FROM suppliers\n)\nWHERE {1}\nGROUP BY {2};",
      chips: ["kind = 'supplier'", "kind = customer", "kind IS 'supplier'", "kind", "name"],
      answers: ["kind = 'supplier'", "kind"],
      why: "The label makes the pile filterable: WHERE kind = 'supplier' keeps the 6 tagged rows and GROUP BY kind collapses them into one row. Without the literal tag column the pile would be anonymous — no way to un-stack a slice.",
      notes: [
        { slot: 1, why: "Unquoted customer would be read as a column name (there is none), and IS is not a comparison operator — equality is spelled =." },
        { slot: 2, why: "The bucket key is the label column kind — name exists on neither arm of this pile, so grouping by it would crash." },
      ],
    },
  ],

  // Lesson 19 — INTERSECT: rows present in both
  19: [
    {
      id: "l19-f1",
      prompt: "How many customers have BOTH a delivered and a cancelled order? Count the overlap of the two id sets.",
      template: "SELECT COUNT(*) AS overlap FROM (\n  SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'\n  {1}\n  SELECT DISTINCT customer_id FROM orders WHERE status = 'cancelled'\n);",
      chips: ["INTERSECT", "UNION", "UNION ALL", "EXCEPT"],
      answers: ["INTERSECT"],
      why: "INTERSECT keeps only the rows both arms produce — the 4 double-trouble customers (ids 1, 5, 11, 13). UNION would pool 15 ids, EXCEPT would subtract one set from the other.",
      notes: [
        { slot: 1, why: "UNION answers 'delivered OR cancelled' — the brief wants 'delivered AND cancelled', which is the overlap." },
      ],
    },
    {
      id: "l19-f2",
      prompt: "The cheap-and-plenty shelf: product names priced under 50 that are ALSO stocked above 100 — one overlap, alphabetical.",
      template: "SELECT name FROM products WHERE price {1} 50\nINTERSECT\nSELECT name FROM products WHERE stock {2} 100\nORDER BY name;",
      chips: ["<", ">", "<=", ">=", "!="],
      answers: ["<", ">"],
      why: "Two independent filters, one overlap: 7 product names survive both arms. The strict edges matter — 'under 50' and 'above 100' exclude the boundary values, so <= and >= would change membership.",
      notes: [
        { slot: 1, why: "Backwards — price > 50 lists the expensive products; the cheap arm is price < 50." },
        { slot: 2, why: "stock >= 100 would sweep in the exactly-100 rows too — 'above 100' is a strict >." },
      ],
    },
    {
      id: "l19-f3",
      prompt: "A teammate's service-review query returned 15 names — everyone with EITHER kind of history — but the review wants the names on BOTH lists. Fix the operator and aim the second arm at the right status.",
      template: "SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = 'delivered')\n{1}\nSELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = {2})\nORDER BY name;",
      chips: ["INTERSECT", "UNION", "EXCEPT", "'pending'", "'cancelled'"],
      answers: ["INTERSECT", "'pending'"],
      why: "Two name lists meet in the middle: 8 customers are on both the delivered list and the waiting list. UNION pooled all 15 names with history; the 'cancelled' arm would have shrunk the review to the 4 double-trouble names instead.",
      notes: [
        { slot: 1, why: "EXCEPT subtracts — it would answer 'delivered but never pending', a different ticket. The shared-shelf question is INTERSECT." },
        { slot: 2, why: "The review pairs delivered with pending — 'cancelled' belongs to no arm here and would cut the list to 4 names." },
      ],
    },
    {
      id: "l19-f4",
      prompt: "Set operations are NULL-safe: two arms that each output only NULL still share that row. Complete the probe and see it.",
      template: "SELECT NULL\n{1}\nSELECT NULL;",
      chips: ["INTERSECT", "UNION ALL", "EXCEPT", "= NULL"],
      answers: ["INTERSECT"],
      why: "For set operations, two NULLs count as duplicates of each other — grouping semantics, not comparison semantics — so the overlap is exactly one NULL row. WHERE col = col never matches when NULL is involved; INTERSECT does.",
      notes: [
        { slot: 1, why: "UNION ALL would keep both NULL rows instead of collapsing them to one — the overlap semantics are INTERSECT's." },
      ],
    },
    {
      id: "l19-f5",
      prompt: "The deep-cut list: customer ids holding ALL THREE — a delivered, a pending AND a cancelled order. Two INTERSECTs are chained; complete the third arm.",
      template: "SELECT DISTINCT customer_id FROM orders WHERE status = 'delivered'\nINTERSECT\nSELECT DISTINCT customer_id FROM orders WHERE status = 'pending'\n{1}\nSELECT DISTINCT customer_id FROM orders WHERE status = {2}\nORDER BY customer_id;",
      chips: ["INTERSECT", "UNION", "EXCEPT", "'cancelled'", "'shipped'"],
      answers: ["INTERSECT", "'cancelled'"],
      why: "INTERSECT chains left to right and the pile shrinks to ids present in every arm: 4 customers hold all three statuses. UNION would grow the pile instead of narrowing it.",
      notes: [
        { slot: 1, why: "EXCEPT would subtract the pending set — the deep-cut list is the intersection of all three, not a difference." },
        { slot: 2, why: "The third status is cancelled — 'shipped' answers no ticket in this review." },
      ],
    },
  ],

  // Lesson 20 — EXCEPT: in the first, never in the second
  20: [
    {
      id: "l20-f1",
      prompt: "Customers with nothing on the road: ids of customers who have NO shipped order at all — the anti-join as one operator.",
      template: "SELECT id FROM customers\n{1}\nSELECT DISTINCT customer_id FROM orders WHERE status = 'shipped'\nORDER BY id;",
      chips: ["EXCEPT", "INTERSECT", "UNION", "UNION ALL"],
      answers: ["EXCEPT"],
      why: "EXCEPT keeps the left arm's rows that never appear in the right arm — the 6 quiet customers (ids 2, 3, 4, 6, 11, 15), lesson 14's LEFT JOIN + IS NULL anti-join reborn as a single keyword.",
      notes: [
        { slot: 1, why: "INTERSECT answers the opposite ticket — the 10 customers who DID ship. 'No shipped order' is a subtraction: EXCEPT." },
      ],
    },
    {
      id: "l20-f2",
      prompt: "Expensive, but not audio: product names priced over 100 that are NOT in the Audio category — one subtraction, alphabetical.",
      template: "SELECT name FROM products WHERE price {1} 100\n{2}\nSELECT name FROM products WHERE category = 'Audio'\nORDER BY name;",
      chips: [">", ">=", "<", "EXCEPT", "INTERSECT"],
      answers: [">", "EXCEPT"],
      why: "The left arm lists every over-100 product; EXCEPT removes the names the Audio arm also returns — 4K Webcam Pro and Smart Watch S survive, 2 rows. INTERSECT would keep only the Audio overlap instead of excluding it.",
      notes: [
        { slot: 1, why: "'>= 100' would sweep the exactly-100 products into the candidate list — 'over 100' is strict." },
        { slot: 2, why: "INTERSECT keeps what both arms share — the brief wants the Audio names REMOVED, which is EXCEPT's job." },
      ],
    },
    {
      id: "l20-f3",
      prompt: "A teammate's asymmetry check came back 0 — they subtracted the bigger set from the smaller. Aim the two arms correctly: completed orders with no cancellation, counted.",
      template: "SELECT COUNT(*) AS one_way FROM (\n  SELECT DISTINCT customer_id FROM orders WHERE status = {1}\n  EXCEPT\n  SELECT DISTINCT customer_id FROM orders WHERE status = {2}\n);",
      chips: ["'delivered'", "'cancelled'", "'shipped'", "'pending'"],
      answers: ["'delivered'", "'cancelled'"],
      why: "EXCEPT is directional: delivered EXCEPT cancelled leaves the 11 customers who completed orders and never had one cancelled. Swapped, the answer is 0 — every cancelled-order customer also has a delivered one, so the smaller set empties itself.",
      notes: [
        { slot: 1, why: "The left arm is the set we keep — delivered; putting 'cancelled' first is exactly the 0-row mistake the brief describes." },
        { slot: 2, why: "The right arm is what gets removed — cancelled. 'shipped' or 'pending' would audit a different lifecycle question." },
      ],
    },
    {
      id: "l20-f4",
      prompt: "Audit sanity check: subtract a set from itself. Place the operator that leaves the pile empty.",
      template: "SELECT status FROM orders\n{1}\nSELECT status FROM orders;",
      chips: ["EXCEPT", "INTERSECT", "UNION", "UNION ALL"],
      answers: ["EXCEPT"],
      why: "Every distinct status the left arm holds, the right arm holds too — subtracting a set from itself always leaves 0 rows. A EXCEPT A is the quickest 'is this pile empty' probe in the set-operation toolbox.",
      notes: [
        { slot: 1, why: "INTERSECT would return the 4 distinct statuses (everything shared), UNION ALL the raw 206 — only EXCEPT empties the pile." },
      ],
    },
    {
      id: "l20-f5",
      prompt: "The quietest three: of the customers with no shipped order, the three HIGHEST ids — one sort, one cap, at the very end.",
      template: "SELECT id FROM customers\nEXCEPT\nSELECT DISTINCT customer_id FROM orders WHERE status = 'shipped'\nORDER BY id {1}\n{2} 3;",
      chips: ["DESC", "ASC", "LIMIT", "TOP", "FIRST"],
      answers: ["DESC", "LIMIT"],
      why: "One ORDER BY and one LIMIT ride at the very end of the compound: id DESC lines the six quiet customers up biggest-first and LIMIT 3 caps the pile — ids 15, 11, 6.",
      notes: [
        { slot: 1, why: "Ascending would cap at ids 2, 3, 4 — the FIRST three quiet customers, not the highest." },
        { slot: 2, why: "TOP is SQL Server dialect — SQLite, Postgres and MySQL cap with LIMIT." },
      ],
    },
  ],

  // Lesson 21 — Chains & precedence: who evaluates first
  21: [
    {
      id: "l21-f1",
      prompt: "State SQLite's left-to-right reading explicitly: union delivered with cancelled first, then intersect the pending set. Count the survivors.",
      template: "SELECT COUNT(*) FROM (\n  SELECT * FROM (\n    SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'delivered'\n    UNION\n    SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'cancelled'\n  )\n  {1}\n  SELECT DISTINCT customer_id AS v FROM orders WHERE status = {2}\n);",
      chips: ["INTERSECT", "UNION", "EXCEPT", "'pending'", "'cancelled'"],
      answers: ["INTERSECT", "'pending'"],
      why: "Wrapped, the grouping is stated instead of implied: (A ∪ B) ∩ C — SQLite's own left-to-right reading, which returns 8 ids. The same unwrapped text means something different on Postgres, so the wrap is the portable spell.",
      notes: [
        { slot: 1, why: "UNION would keep the pile growing instead of narrowing to the shared ids — the second stage is an intersection." },
        { slot: 2, why: "The third set is the pending one — 'cancelled' is already inside the union, and delivered ∩ cancelled would collapse to 4." },
      ],
    },
    {
      id: "l21-f2",
      prompt: "ALL binds only its neighbor: stack suppliers twice, fold in the customers — and make the final pass dedupe the whole accumulated pile.",
      template: "SELECT region FROM suppliers\nUNION ALL\nSELECT region FROM suppliers\n{1}\nSELECT region FROM customers;",
      chips: ["UNION", "UNION ALL", "EXCEPT", "INTERSECT"],
      answers: ["UNION"],
      why: "The trailing plain UNION runs a full dedupe over the accumulated 28-row pile — 4 distinct regions survive. ALL only shields its own adjacent pair; it never protects the chain.",
      notes: [
        { slot: 1, why: "A second ALL would keep all 28 raw rows — the dedupe the brief wants comes from a plain UNION at the end." },
      ],
    },
    {
      id: "l21-f3",
      prompt: "SQLite rejected a teammate's parenthesized rewrite with `near \"(\": syntax error` — it bans parentheses around compound arms. Complete the portable spelling: the union wrapped as a FROM subquery, then counted.",
      template: "SELECT COUNT(*) AS grouped FROM (\n  SELECT {1} FROM customers\n  UNION\n  SELECT region FROM {2}\n);",
      chips: ["region", "city", "suppliers", "customers", "rating"],
      answers: ["region", "suppliers"],
      why: "Same shape both arms — region on region — 16 customer rows pooled with 6 supplier rows and deduped once to 4. The FROM-subquery wrap is how SQLite spells grouping; bare parentheses around arms simply don't parse.",
      notes: [
        { slot: 1, why: "city would widen the pile to 20+ values — the arm must mirror the second arm's region column, or the shapes diverge." },
        { slot: 2, why: "The second arm reads suppliers — stacking customers twice would dedupe to just the customer regions." },
      ],
    },
    {
      id: "l21-f4",
      prompt: "Equal precedence reads left to right: the subtraction completes before the stack. Spell it out — delivered minus cancelled, then the pending ids stacked on top — and count.",
      template: "SELECT COUNT(*) AS chained FROM (\n  SELECT v FROM (\n    SELECT DISTINCT customer_id AS v FROM orders WHERE status = {1}\n    EXCEPT\n    SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'cancelled'\n  )\n  UNION ALL\n  SELECT DISTINCT customer_id AS v FROM orders WHERE status = {2}\n);",
      chips: ["'delivered'", "'pending'", "'shipped'", "'cancelled'"],
      answers: ["'delivered'", "'pending'"],
      why: "Left to right: delivered EXCEPT cancelled leaves 11 survivors, then the 8 distinct pending ids stack on top — 19 rows counted. The UNION ALL keeps both piles intact; the wraps make the evaluation order visible.",
      notes: [
        { slot: 1, why: "delivered EXCEPT cancelled is the subtraction that leaves 11 — starting from 'cancelled' drains to 0, the reversed reading." },
        { slot: 2, why: "The stack on top is the pending set — 'shipped' and 'cancelled' belong to no arm of this chain." },
      ],
    },
    {
      id: "l21-f5",
      prompt: "One dedupe pass over three arms, then cut the alphabetical front: statuses and regions in one pile, top 3.",
      template: "SELECT status AS value FROM orders\n{1}\nSELECT region AS value FROM suppliers\nUNION\nSELECT region FROM customers\nORDER BY value\n{2} 3;",
      chips: ["UNION", "UNION ALL", "LIMIT", "TOP", "ORDER"],
      answers: ["UNION", "LIMIT"],
      why: "Plain UNION sweeps the whole pile once — 8 distinct values across statuses and regions — and the trailing ORDER BY value LIMIT 3 cuts APAC, EU, LATAM off the front (SQLite sorts uppercase before lowercase, so the regions surface first).",
      notes: [
        { slot: 1, why: "UNION ALL would keep 28 raw rows and the top 3 would be arbitrary repeats — the dedupe pass is what makes the cut meaningful." },
        { slot: 2, why: "TOP is not SQLite — the cap is LIMIT, written after the final ORDER BY." },
      ],
    },
  ],

  // Lesson 22 — CASE WHEN: branching inside a query
  22: [
    {
      id: "l22-f1",
      prompt: "Label every order: cancelled orders are 'dead', everything else 'alive' — close the branch so no row leaks NULL.",
      template: "SELECT status,\n  CASE WHEN status = 'cancelled' {1} 'dead'\n       {2} 'alive'\n  {3} AS fate\nFROM orders;",
      chips: ["THEN", "ELSE", "END", "WHEN", "AND"],
      answers: ["THEN", "ELSE", "END"],
      why: "WHEN starts the condition, THEN introduces the value it wins, ELSE is the default branch for the other 96 orders, and END closes the expression. Drop the ELSE and those 96 rows surface as NULL — the quietest bug in SQL reporting.",
      notes: [
        { slot: 1, why: "AND combines conditions inside a WHERE-style predicate; it never introduces a branch's value — that's THEN." },
        { slot: 2, why: "WHEN would open a second condition with no value after it — the default branch is spelled ELSE." },
        { slot: 3, why: "Every CASE needs its closing END before the alias — an unterminated CASE is a syntax error, not a default." },
      ],
    },
    {
      id: "l22-f2",
      prompt: "A teammate's labeling CASE left 96 of 103 orders NULL — no ELSE. Add the default branch so everything else reads 'open'.",
      template: "SELECT CASE WHEN status = 'cancelled' THEN 'dead' {1} END AS state\nFROM orders;",
      chips: ["ELSE 'open'", "WHEN 'open'", "THEN 'open'", "ELSE open", "NULL"],
      answers: ["ELSE 'open'"],
      why: "ELSE 'open' is the default branch: the 96 non-cancelled rows get a real label instead of NULL, and the CASE still closes with its END. Unquoted open would be read as a column name — and there is none.",
      notes: [
        { slot: 1, why: "THEN only follows a WHEN condition — the catch-all keyword that introduces the default value is ELSE." },
      ],
    },
    {
      id: "l22-f3",
      prompt: "Stock health buckets: zero stock is 'out', under 10 is 'low', everything else 'ok' — the ladder is tested top-down, first match wins.",
      template: "SELECT name, stock,\n  CASE WHEN stock {1} 0 THEN 'out'\n       WHEN stock {2} 10 THEN 'low'\n       {3} 'ok'\n  END AS shelf\nFROM products\nORDER BY name;",
      chips: ["=", "<", ">", "ELSE", "WHEN"],
      answers: ["=", "<", "ELSE"],
      why: "A searched CASE evaluates each WHEN in order and stops at the first match: stock 0 lands in 'out', 1–9 in 'low', everything from 10 up rides ELSE. Reorder the ladder and the buckets change — branch order is semantics.",
      notes: [
        { slot: 1, why: "stock > 0 would push the zero-stock rows past the first branch — 'zero stock' is an equality test." },
        { slot: 2, why: "'Under 10' is a strict < — stock 10 belongs to the ELSE bucket." },
        { slot: 3, why: "WHEN would open another condition — 'everything else' is ELSE's job." },
      ],
    },
    {
      id: "l22-f4",
      prompt: "Two labels in one pass: size bands by total, and shipping state — unshipped while shipped_at is still NULL.",
      template: "SELECT id,\n  CASE WHEN total > 800 THEN 'big'\n       WHEN total > 300 THEN 'medium'\n       ELSE 'small' END AS size_band,\n  CASE WHEN shipped_at {1} NULL THEN 'unshipped'\n       {2} 'shipped' END AS ship_band\nFROM orders\nORDER BY id\nLIMIT 15;",
      chips: ["IS", "=", "!=", "ELSE", "THEN"],
      answers: ["IS", "ELSE"],
      why: "Two independent CASE expressions ride side by side in one SELECT, each with its own END. NULL never equals anything, so the missing-shipment test is IS NULL — the 21 orders that never left the warehouse read 'unshipped', the rest take the ELSE.",
      notes: [
        { slot: 1, why: "shipped_at = NULL compares against NULL with equality and matches nothing — IS NULL is the only reliable probe." },
        { slot: 2, why: "The second branch is the default for every non-NULL shipment — that's ELSE, not another WHEN (which would need a condition)." },
      ],
    },
    {
      id: "l22-f5",
      prompt: "Count the silent NULLs: `CASE WHEN status = 'cancelled' THEN 'dead' END` (no ELSE) over all orders — how many rows come out unlabeled?",
      template: "SELECT COUNT(*) AS unlabeled FROM (\n  SELECT CASE WHEN status = 'cancelled' THEN 'dead' END AS tag\n  FROM orders\n) WHERE tag {1} NULL;",
      chips: ["IS", "=", "!=", "IS NOT", "LIKE"],
      answers: ["IS"],
      why: "No ELSE means the 96 non-cancelled rows yield NULL, and only IS NULL can find them — the count reads 96. `tag = NULL` compares with equality and matches nothing: the classic silent-empty-result trap.",
      notes: [
        { slot: 1, why: "IS NOT counts the opposite set — the 7 rows that DID get a label. The unlabeled 96 need IS NULL." },
      ],
    },
  ],

  // Lesson 23 — CASE at work: counters, pivots, custom sorts
  23: [
    {
      id: "l23-f1",
      prompt: "One scan, three counters: total orders, delivered, pending — the KPI row every dashboard starts with.",
      template: "SELECT COUNT(*) AS all_orders,\n  {1}(CASE WHEN status = 'delivered' {2} 1 {3} 0 END) AS delivered\nFROM orders;",
      chips: ["SUM", "COUNT", "THEN", "ELSE", "WHEN"],
      answers: ["SUM", "THEN", "ELSE"],
      why: "The CASE votes 1 for every delivered order and 0 otherwise, and SUM adds the votes — 52 of 103. The ELSE 0 keeps the non-matches contributing nothing, so the SUM is the count.",
      notes: [
        { slot: 1, why: "COUNT counts non-NULL values — with ELSE 0 every row is non-NULL, so it would answer 103, not the 52 delivered." },
        { slot: 2, why: "WHEN already opened the branch — the value that a matching row contributes is introduced by THEN." },
        { slot: 3, why: "The non-matching rows must contribute 0, not NULL — that default is ELSE's job, and it keeps SUM honest." },
      ],
    },
    {
      id: "l23-f2",
      prompt: "Rows into columns: in the region × status pivot, complete the shipped counter.",
      template: "SELECT c.region,\n  SUM(CASE WHEN o.status = 'shipped' {1} 1 {2} 0 {3}) AS shipped\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY c.region;",
      chips: ["THEN", "ELSE", "END", "WHEN", "AS"],
      answers: ["THEN", "ELSE", "END"],
      why: "Each pivot column is one conditional SUM: the CASE flags shipped rows with 1, everything else with 0, and END closes the expression before SUM adds the votes — 30 shipped across the whole store, split by region.",
      notes: [
        { slot: 1, why: "The condition is already open — THEN is what introduces the 1 a matching row contributes." },
        { slot: 2, why: "Without ELSE 0 the non-shipped rows yield NULL — SUM would survive, but the explicit 0 is what makes the counter readable and audit-proof." },
        { slot: 3, why: "SUM( needs its CASE closed with END before the parentheses can close — an unterminated CASE breaks the whole SELECT list." },
      ],
    },
    {
      id: "l23-f3",
      prompt: "The ops queue sorted wrong: delivered orders landed in the ELSE bucket, silently. One WHEN literal is misspelled — pick the chip that matches the real status.",
      template: "SELECT id, status FROM orders\nORDER BY CASE status\n  WHEN 'pending'  THEN 0\n  WHEN 'shipped'  THEN 1\n  WHEN {1} THEN 2\n  ELSE 3\nEND, id;",
      chips: ["'delivered'", "'deliverd'", "'Delivered'", "delivered", "'delivered '"],
      why: "The WHEN compares byte-for-byte: 'deliverd', 'Delivered' or a trailing space match no real status, so every delivered order quietly drops to ELSE 3. Statuses are lowercase in this data — 'delivered' exactly.",
      answers: ["'delivered'"],
      notes: [
        { slot: 1, why: "Unquoted delivered would be read as a column name, and the quote-less spelling changes nothing about the data — the literal needs its quotes." },
      ],
    },
    {
      id: "l23-f4",
      prompt: "The delivered share, as a percentage: average the 1/0 votes, scale to 100, round to one decimal.",
      template: "SELECT ROUND({1}(CASE WHEN status = 'delivered' THEN 1.0 ELSE 0 END) * 100, {2}) AS delivered_pct\nFROM orders;",
      chips: ["AVG", "SUM", "COUNT", "1", "0", "2"],
      answers: ["AVG", "1"],
      why: "AVG over the 1/0 votes is the delivered fraction — 52 of 103 orders ≈ 0.505 — and ×100 with ROUND(…, 1) reads 50.5%. SUM would return the raw count 52, not a share.",
      notes: [
        { slot: 1, why: "SUM adds the votes to 52 — the share needs the votes divided by the rows, which is exactly AVG." },
        { slot: 2, why: "ROUND(…, 2) would print 50.49 — the brief wants one decimal." },
      ],
    },
    {
      id: "l23-f5",
      prompt: "The counter, the readable way: with ELSE 0 every row contributes a number, and the aggregate adds the matching ones. Complete the pending counter.",
      template: "SELECT {1}(CASE WHEN status = 'pending' THEN 1 {2} 0 END) AS pending\nFROM orders;",
      chips: ["SUM", "COUNT", "AVG", "ELSE", "THEN"],
      answers: ["SUM", "ELSE"],
      why: "SUM adds fourteen 1s and ignores the 0s — 14 waiting orders, one pass over the table. The ELSE 0 is what makes the SUM-as-count work; without it the non-matching rows would hand SUM nothing but NULLs (which it also skips — but the 0s make the intent explicit).",
      notes: [
        { slot: 1, why: "COUNT with ELSE 0 counts all 103 rows — zeros are not NULL. The no-ELSE spelling is what lets COUNT skip; with ELSE 0, SUM is the counter." },
        { slot: 2, why: "THEN already introduced the 1 — the 0 for every other row comes from the ELSE branch." },
      ],
    },
  ],

  // Lesson 37 — Case study: the quarterly merchandising review (Module 3 capstone)
  37: [
    {
      id: "l37-f1",
      prompt: "In-flight vs complete: stack the two labeled counts — the arithmetic must be able to add up.",
      template: "SELECT {1} AS label, COUNT(*) AS n\nFROM orders WHERE status IN ('pending', 'shipped')\n{2}\nSELECT 'complete', COUNT(*)\nFROM orders WHERE status = 'delivered'\nORDER BY label;",
      chips: ["'in_flight'", "'complete'", "UNION ALL", "UNION", "INTERSECT", "EXCEPT"],
      answers: ["'in_flight'", "UNION ALL"],
      why: "Two one-row count arms, each wearing its literal tag, stacked with UNION ALL: in_flight 44, complete 52 — 96 of 103 orders accounted for, the 7 cancelled excepted. ALL keeps the arithmetic honest; a dedupe pass could only ever delete real rows.",
      notes: [
        { slot: 1, why: "The first arm's tag names the pending+shipped bucket — 'complete' belongs to the delivered arm below." },
        { slot: 2, why: "Plain UNION would dedupe the pile — harmless while the labels differ, but stacked COUNTS should never risk a silent deletion." },
      ],
    },
    {
      id: "l37-f2",
      prompt: "Shared shelves: which categories do BOTH Alice Chen and Emma Wilson buy? Meet the two category lists.",
      template: "SELECT category FROM (\n  SELECT DISTINCT p.category\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  JOIN products p ON p.id = oi.product_id\n  JOIN customers c ON c.id = o.customer_id\n  WHERE c.name = 'Alice Chen'\n  {1}\n  SELECT DISTINCT p.category\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  JOIN products p ON p.id = oi.product_id\n  JOIN customers c ON c.id = o.customer_id\n  WHERE c.name = 'Emma Wilson'\n)\nORDER BY category;",
      chips: ["INTERSECT", "UNION", "UNION ALL", "EXCEPT"],
      answers: ["INTERSECT"],
      why: "Alice buys all 7 categories, Emma 6 — the intersection is the 6 shared shelves. UNION would pool 7, and EXCEPT would answer the other quarter-end question: Alice's one exclusive (Fitness).",
      notes: [
        { slot: 1, why: "UNION merges both shoppers' lists — the shared-shelf question is the overlap, which is INTERSECT's job." },
      ],
    },
    {
      id: "l37-f3",
      prompt: "The status value census, one pass: each status's money column votes with the order total, not with a 1.",
      template: "SELECT ROUND(SUM(CASE WHEN status = 'delivered' {1} total {2} 0 END), 2) AS delivered_value,\n  ROUND(SUM(CASE WHEN status = 'shipped' THEN total ELSE 0 END), 2) AS shipped_value\nFROM orders;",
      chips: ["THEN", "ELSE", "WHEN", "END", "AND"],
      answers: ["THEN", "ELSE"],
      why: "The CASE votes with total: delivered orders contribute their money, everything else contributes 0 — 15,571.07 delivered and 11,996.72 shipped. Four such columns in one pass rebuild the 34,833.28 the store billed.",
      notes: [
        { slot: 1, why: "The condition is open — THEN is what introduces the value a matching row contributes (the total)." },
        { slot: 2, why: "Non-matching rows must contribute 0 so the SUM stays a value, not a mix — that default is ELSE's job." },
      ],
    },
    {
      id: "l37-f4",
      prompt: "The workflow report came out wrong: cancelled orders jumped to the TOP. The sort's CASE forgot its default — close it so cancelled ranks last.",
      template: "SELECT status, COUNT(*) AS n\nFROM orders\nGROUP BY status\nORDER BY CASE status\n  WHEN 'pending'   THEN 1\n  WHEN 'shipped'   THEN 2\n  WHEN 'delivered' THEN 3\n  {1} 4\nEND;",
      chips: ["ELSE", "WHEN", "THEN", "AND"],
      answers: ["ELSE"],
      why: "A branchless CASE yields NULL, and SQLite sorts NULLs first in ascending order — the 7 cancelled orders would leap the queue they were meant to close. ELSE 4 sends them to the back: pending → shipped → delivered → cancelled.",
      notes: [
        { slot: 1, why: "WHEN would open a new condition and THEN needs one — the catch-all rank for everything unmapped is ELSE." },
      ],
    },
    {
      id: "l37-f5",
      prompt: "The two-stage shape: aggregate spend per customer first, classify second. Complete the tier ladder and the inner grouping.",
      template: "SELECT tier, COUNT(*) AS customers FROM (\n  SELECT CASE WHEN SUM(o.total) >= 3000 THEN 'high'\n              WHEN SUM(o.total) >= 1000 THEN 'mid'\n              {1} 'low'\n         END AS tier\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.id\n  {2} BY {3}\n)\nGROUP BY tier\nORDER BY customers DESC, tier;",
      chips: ["ELSE", "GROUP", "c.id", "o.id", "tier"],
      answers: ["ELSE", "GROUP", "c.id"],
      why: "Aggregates can't nest, so the inner query groups the joined rows per customer (GROUP BY c.id), classifies each lifetime spend with the CASE ladder, and the outer query counts tiers: low 8, high 4, mid 4.",
      notes: [
        { slot: 1, why: "'Everything under 1,000' is the default bucket — ELSE, not another WHEN (which would need its own condition)." },
        { slot: 2, why: "The classification needs one row per customer before the CASE can read SUM(o.total) — that's GROUP BY's job, not ORDER BY's." },
        { slot: 3, why: "Grouping by o.id buckets per ORDER — every order would become its own tier. The spend belongs to the customer: c.id." },
      ],
    },
  ],

  // Lesson 24 — Capstone: one report, three patterns (tier ladder, TOTAL ledger, EXCEPT audit)
  24: [
    {
      id: "l24-f1",
      prompt: "Build the tier ladder: aggregate spend per customer first, then label each total — VIP from 5000, regular from 2000, occasional below.",
      template:
        "SELECT name, spend,\n       CASE {1} spend >= 5000 THEN 'vip'\n            WHEN spend >= 2000 THEN 'regular'\n            {2} 'occasional' {3}\nFROM (\n  SELECT c.name AS name, SUM(o.total) AS spend\n  FROM orders o JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n);",
      chips: ["WHEN", "ELSE", "END", "THEN", "IF"],
      answers: ["WHEN", "ELSE", "END"],
      why: "A searched CASE evaluates WHEN guards top to bottom and needs ELSE for the remainder plus END to close. Tiering happens in the OUTER select because the alias spend doesn't exist until the inner GROUP BY has finished — one stage computes, the next labels.",
      notes: [
        { slot: 1, why: "The first guard needs WHEN to introduce it; THEN only ever follows a condition." },
        { slot: 3, why: "CASE expressions must be closed with END — without it the parser reads the rest of the query as more branches." },
      ],
    },
    {
      id: "l24-f2",
      prompt: "Stack a grand-total row under the per-customer ledger — no dedupe pass, and the last row labelled TOTAL.",
      template:
        "SELECT name, spend FROM (\n  SELECT c.name AS name, SUM(o.total) AS spend\n  FROM orders o JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n)\n{1}\nSELECT {2} AS name, SUM(spend) AS spend FROM (\n  SELECT c.name AS name, SUM(o.total) AS spend\n  FROM orders o JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n);",
      chips: ["UNION ALL", "UNION", "UNION DISTINCT", "'TOTAL'", "TOTAL"],
      answers: ["UNION ALL", "'TOTAL'"],
      why: "UNION ALL stacks the arms without a dedupe pass — per-customer rows are already unique, so UNION would only burn a sort. The label is a text literal in single quotes; bare TOTAL would be read as a column name and crash.",
      notes: [
        { slot: 2, why: "Unquoted TOTAL collides with the (nonexistent) column of that name — quotes make it a literal value." },
      ],
    },
    {
      id: "l24-f3",
      prompt: "The FK audit: prove every product_id in order_items points at a real product. Arms must agree on shape — same column, same alias.",
      template:
        "SELECT {1} AS pid FROM order_items\n{2}\nSELECT id AS pid FROM products;",
      chips: ["product_id", "id", "EXCEPT", "INTERSECT", "UNION ALL"],
      answers: ["product_id", "EXCEPT"],
      why: "Arm 1 minus arm 2 lists orphaned references — and returning zero rows IS the audit passing: the foreign-key fence guarantees none. EXCEPT compares by column position, so both arms project one aliased column apiece.",
      notes: [
        { slot: 1, why: "order_items references products through product_id; its own id would audit the wrong relationship." },
        { slot: 2, why: "INTERSECT answers \"who appears in both\" — the opposite question to an orphan sweep." },
      ],
    },
    {
      id: "l24-f4",
      prompt: "Revenue by category from line items — pick the money expression and the grouping column. (Join direction makes this safe: many line items to one product.)",
      template:
        "SELECT p.category, ROUND(SUM({1}), 2) AS revenue\nFROM order_items oi JOIN products p ON p.id = oi.product_id\nGROUP BY {2}\nORDER BY revenue DESC;",
      chips: ["oi.quantity * oi.unit_price", "oi.quantity * p.price", "p.price", "p.category", "oi.order_id"],
      answers: ["oi.quantity * oi.unit_price", "p.category"],
      why: "Each line's money is quantity × its frozen unit_price — p.price is today's catalog price and can drift from what was actually charged. Grouping by p.category is safe because many-to-one joins don't fan out: every line matches exactly one product row.",
      notes: [
        { slot: 1, why: "The fan-out trap only bites when you aggregate the ONE side (orders) across a join to its MANY side — line revenue lives entirely on the many side here." },
      ],
    },
    {
      id: "l24-f5",
      prompt: "This cross-check crashed with `no such column: delivered`. Fill both gaps so it runs and reports the delivered count two different ways.",
      template:
        "SELECT COUNT(*) AS via_rows FROM orders WHERE status = {1}\n{2}\nSELECT SUM(status = 'delivered') AS via_sum FROM orders;",
      chips: ["'delivered'", "delivered", "UNION ALL", "UNION", "INTERSECT"],
      answers: ["'delivered'", "UNION ALL"],
      why: "Text values need single quotes — unquoted delivered looked like a column. Then UNION ALL stacks the two engines of truth: COUNT over filtered rows and SUM over a boolean expression both land on 52, and seeing the number twice is what makes it trustworthy.",
      notes: [
        { slot: 2, why: "UNION would dedupe identical rows — here both arms return 52, so a plain UNION would collapse the cross-check to one row and hide the agreement." },
      ],
    },
  ],
};

