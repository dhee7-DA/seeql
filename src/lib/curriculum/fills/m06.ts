// Fill drills for Module 6 — Expert Clinic (lessons 33, 34 + capstone 40).
// See m01.ts for the golden example: template slots {1}..{n}, answers[i]
// completes slot i+1, every completed SQL must run on the seed db.
//
// These are the expert lessons, so the drills lean multi-slot: GROUP_CONCAT
// folds (separator rules, ORDER BY inside), the FILTER census, the UNION-ALL
// grand-total stack, RIGHT/FULL OUTER shapes, the deliberate CROSS JOIN and
// the VALUES band ladder with half-open non-equi bounds.
import type { Fill } from "../types";

export const FILLS_BY_LESSON: Record<number, Fill[]> = {
  // Lesson 33 — String aggregation & grand totals
  33: [
    {
      id: "l33-f1",
      prompt: "Every customer's order statuses folded into one cell — the distinct set, one row per customer, name order.",
      template: "SELECT c.name, {1} AS statuses\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY {2}\nORDER BY c.name;",
      chips: ["GROUP_CONCAT(DISTINCT o.status)", "GROUP_CONCAT(o.status)", "COUNT(DISTINCT o.status)", "c.id", "o.id"],
      answers: ["GROUP_CONCAT(DISTINCT o.status)", "c.id"],
      why: "GROUP_CONCAT folds each customer's orders into one TEXT cell, and DISTINCT keeps the status set from reciting itself — Alice's 24 orders would otherwise repeat delivered a dozen times. Grouping by c.id makes the customer the bucket; the fold does the rest.",
      notes: [
        { slot: 1, why: "GROUP_CONCAT(o.status) folds WITH repeats — one row per customer still, but the string recites delivered once per delivered order. And COUNT(DISTINCT o.status) answers how MANY statuses (a number), not the recital." },
        { slot: 2, why: "Grouping by o.id makes every order its own group — 103 one-value cells instead of 16 customer recitals. The bucket is the customer: c.id." },
      ],
    },
    {
      id: "l33-f2",
      prompt: "The Audio shelf in one cell: all three product names joined by comma-and-space.",
      template: "SELECT {1} AS audio_names\nFROM products\nWHERE category = {2};",
      chips: ["GROUP_CONCAT(name, ', ')", "GROUP_CONCAT(name)", "GROUP_CONCAT(DISTINCT name, ', ')", "'Audio'", "Audio"],
      answers: ["GROUP_CONCAT(name, ', ')", "'Audio'"],
      why: "The separator is GROUP_CONCAT's second argument — one TEXT cell, the three Audio products joined by ', '. DISTINCT can't ride along with a separator on SQLite, and unquoted Audio would be read as a column name.",
      notes: [
        { slot: 1, why: "GROUP_CONCAT(name) runs but folds with the default bare comma — 'Noise-Canceling Headset,Studio Desktop Mic' with no space. The brief's ', ' lives in the second argument." },
        { slot: 2, why: "Unquoted Audio is an identifier — `no such column: Audio`. Category values are text and always wear single quotes." },
      ],
    },
    {
      id: "l33-f3",
      prompt: "The pending count two ways — FILTER's private WHERE beside the portable CASE counter — plus the everything-count alongside.",
      template: "SELECT\n  COUNT(*) FILTER ({1} status = 'pending') AS pending,\n  SUM(CASE {2} status = 'pending' THEN 1 ELSE 0 END) AS pending_case,\n  COUNT(*) AS {3}\nFROM orders;",
      chips: ["WHERE", "FILTER", "WHEN", "IF", "THEN", "total"],
      answers: ["WHERE", "WHEN", "total"],
      why: "FILTER hangs a private WHERE on one aggregate; the CASE spelling routes the same rows to 1-or-0 flags that SUM totals — both read 14 pending, and the bare COUNT(*) rides alongside as the 103-row total. One scan, three numbers, two spellings.",
      notes: [
        { slot: 1, why: "The FILTER keyword is already written before the parenthesis — inside goes a full WHERE predicate, not another FILTER." },
        { slot: 2, why: "CASE branches start with WHEN — THEN introduces the branch value after the condition, and IF isn't SQL here." },
        { slot: 3, why: "Naming the everything-count pending would put two identical column names on one row — this one counts ALL 103 orders, so it earns its own label." },
      ],
    },
    {
      id: "l33-f4",
      prompt: "Fix the broken ledger: the stack refused with `SELECTs to the left and right of UNION ALL do not have the same number of result columns` — the TOTAL arm shrank to one column. Both arms must match the wrapper's two; finish the grand arm's spend.",
      template: "SELECT region, spend FROM (\n  SELECT c.region AS region, ROUND(SUM(o.total), 2) AS spend\n  FROM orders o JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region\n  UNION ALL\n  SELECT 'TOTAL', {1} FROM orders\n)\nORDER BY (region = 'TOTAL'), spend DESC;",
      chips: ["ROUND(SUM(total), 2)", "ROUND(AVG(total), 2)", "ROUND(SUM(o.total), 2)", "COUNT(total)", "spend"],
      answers: ["ROUND(SUM(total), 2)"],
      why: "Compound SELECTs align column counts arm to arm, so the TOTAL arm owes the wrapper a second column: the ungrouped SUM over all 103 orders — 34833.28. The outer sort then pins it below EU 15089.23 · APAC 11605.45 · US 7286.16 · LATAM 852.44.",
      notes: [
        { slot: 1, why: "ROUND(AVG(total), 2) computes the average order (338.19), not the ledger's grand sum; COUNT(total) counts rows (103). And o.total has no alias in this arm — it's FROM orders, plain." },
      ],
    },
    {
      id: "l33-f5",
      prompt: "The monthly ledger: revenue per month with the TOTAL row stacked underneath — calendar order, total pinned last.",
      template: "SELECT mon, rev FROM (\n  SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS rev\n  FROM orders\n  {1} mon\n  UNION {2}\n  SELECT 'TOTAL', ROUND(SUM(total), 2) FROM orders\n)\nORDER BY (mon = 'TOTAL'), mon;",
      chips: ["GROUP BY", "ORDER BY", "WHERE", "ALL", "DISTINCT", "HAVING"],
      answers: ["GROUP BY", "ALL"],
      why: "Arm one buckets the 103 orders into 14 months (2024-01 through 2025-02); arm two carries no GROUP BY, so its SUM spans the whole table — exactly one row. ALL appends it verbatim: 15 rows, the 34833.28 total sunk last by the boolean sort.",
      notes: [
        { slot: 1, why: "WHERE mon merely passes rows through — without GROUP BY the SUM collapses into one row with an arbitrary month. The buckets only exist once GROUP BY mon runs." },
        { slot: 2, why: "Bare UNION runs a dedupe pass the append never asked for — and if a month row ever looked exactly like the total, it would be silently swallowed. ALL keeps both arms verbatim." },
      ],
    },
    {
      id: "l33-f6",
      prompt: "The deterministic fold: every order status exactly once, alphabetized INSIDE the string.",
      template: "SELECT GROUP_CONCAT(DISTINCT status {1} status) AS sorted_statuses\nFROM {2};",
      chips: ["ORDER BY", "GROUP BY", "ASC", "orders", "customers", "order_items"],
      answers: ["ORDER BY", "orders"],
      why: "SQLite 3.44+ takes ORDER BY inside the fold, so the four statuses emerge deterministically — 'cancelled,delivered,pending,shipped' — instead of in whatever order the scan visited them. No GROUP BY needed: the whole table is one group.",
      notes: [
        { slot: 1, why: "GROUP BY can't appear inside an aggregate call — ORDER BY is the clause that orders a fold's interior. A trailing ASC would be redundant anyway: ascending is the default." },
        { slot: 2, why: "status lives on orders — customers and order_items have no such column (`no such column: status`)." },
      ],
    },
  ],

  // Lesson 34 — Every join shape: RIGHT, FULL, CROSS & beyond
  34: [
    {
      id: "l34-f1",
      prompt: "The cancelled-orders probe, spelled from the other side: every customer kept, matched cancelled pairs filled in — 19 rows.",
      template: "SELECT c.name, o.id AS order_id\nFROM orders o\n{1} customers c\n  ON c.id = o.customer_id AND o.status = {2}\nORDER BY c.name;",
      chips: ["RIGHT JOIN", "LEFT JOIN", "INNER JOIN", "CROSS JOIN", "'cancelled'", "cancelled"],
      answers: ["RIGHT JOIN", "'cancelled'"],
      why: "RIGHT keeps the right table the way LEFT keeps the left: the 4 cancelled-order customers surface through their 7 matched pairs, and the 12 customers with no cancelled order ride along NULL-filled — 7 + 12 = 19 rows.",
      notes: [
        { slot: 1, why: "LEFT JOIN keeps the FROM side — all 103 orders with matches filled in. INNER stops at the 7 pairs, and CROSS JOIN with an ON is just an inner join in disguise. Only RIGHT keeps every CUSTOMER." },
        { slot: 2, why: "Unquoted cancelled is read as a column name — `no such column: cancelled`. Status values are text in single quotes." },
      ],
    },
    {
      id: "l34-f2",
      prompt: "The audit join: count every row of the FULL OUTER of orders to customers where the cancelled-probe lives in ON.",
      template: "SELECT COUNT(*) AS full_rows\nFROM orders o\n{1} customers c\n  ON c.id = o.customer_id {2} o.status = 'cancelled';",
      chips: ["FULL OUTER JOIN", "LEFT JOIN", "RIGHT JOIN", "AND", "WHERE", "OR"],
      answers: ["FULL OUTER JOIN", "AND"],
      why: "FULL keeps both sides unconditionally: 7 matched cancelled pairs, the 96 orders the AND excluded from matching but not from surviving, and 12 NULL-filled customers — 115 rows, nothing discarded from either side.",
      notes: [
        { slot: 1, why: "LEFT would stop at 103 (orders kept, customers not) and RIGHT at 19 (customers kept, orders not) — only FULL keeps BOTH sides." },
        { slot: 2, why: "The second match condition chains with AND inside ON — ON decides who MATCHES, not who survives. A top-level WHERE filters the finished result and collapses the audit to the 7 matched pairs; OR matches on either condition and balloons the count to 208." },
      ],
    },
    {
      id: "l34-f3",
      prompt: "The campaign matrix: how many rows does the mail-merge grid produce — every ACTIVE customer against every Electronics product?",
      template: "SELECT COUNT(*) AS campaign_rows\nFROM customers c\n{1} products p\nWHERE c.active = {2} AND p.category = 'Electronics';",
      chips: ["CROSS JOIN", "NATURAL JOIN", "JOIN ON c.id = p.supplier_id", "JOIN ON c.id = p.id", "1", "0"],
      answers: ["CROSS JOIN", "1"],
      why: "No foreign key bridges customers and products — the grid pairs on purpose: 14 active customers × 3 Electronics products = 42 rows, with the WHERE aiming the cartesian at the campaign.",
      notes: [
        { slot: 1, why: "Any ON you invent here is a coincidence of numbering, not a relationship — c.id = p.supplier_id or c.id = p.id matches 3 rows by accident. NATURAL 'joins' on the shared-looking names id and name and empties the grid to 0. Every pairing needs CROSS JOIN, which takes no ON at all." },
        { slot: 2, why: "0 is the INACTIVE flag — 2 churned customers × 3 products = 6 rows pointed at the wrong audience. The campaign targets active = 1." },
      ],
    },
    {
      id: "l34-f4",
      prompt: "The band ladder over order values: each order into exactly one rung via the half-open range — and keep the ladder upright.",
      template: "WITH bands(lo, hi, label) AS (\n  VALUES (0, 50, 'small'), (50, 200, 'medium'),\n         (200, 500, 'large'), (500, 9999, 'jumbo')\n)\nSELECT b.label, COUNT(*) AS n\nFROM orders o\nJOIN bands b ON o.total >= b.lo {1} o.total < b.hi\nGROUP BY b.label\nORDER BY {2};",
      chips: ["AND", "OR", "BETWEEN", "MIN(b.lo)", "b.label", "n DESC"],
      answers: ["AND", "MIN(b.lo)"],
      why: "AND pairs the two bounds into the half-open tile [lo, hi): each of the 103 orders matches exactly one band — 8 small · 30 medium · 40 large · 25 jumbo. MIN(b.lo) keeps the rungs in threshold order, which neither the alphabet nor the counts would.",
      notes: [
        { slot: 1, why: "OR matches a band whenever EITHER bound passes — nearly every band catches nearly every order, and the join fans out to 412 rows. And BETWEEN can't splice into a two-bound comparison like this; its both-ends-closed tiling would double-count seam orders anyway." },
        { slot: 2, why: "ORDER BY b.label files jumbo first (j < l < m < s), and n DESC ranks by rung size, not position: large 40, medium 30, jumbo 25, small 8. Only MIN(b.lo) walks the ladder small → jumbo." },
      ],
    },
    {
      id: "l34-f5",
      prompt: "Fix the broken ladder: the CTE header lost a column and the engine said `table bands has 3 values for 2 columns`. Every VALUES row carries three fields — restore the name the header dropped.",
      template: "WITH bands(lo, hi, {1}) AS (\n  VALUES (0, 50, 'small'), (50, 200, 'medium'),\n         (200, 500, 'large'), (500, 9999, 'jumbo')\n)\nSELECT b.label, COUNT(*) AS n\nFROM orders o\nJOIN bands b ON o.total >= b.lo AND o.total < b.hi\nGROUP BY b.label\nORDER BY MIN(b.lo);",
      chips: ["label", "tag", "n", "hi, label", "price"],
      answers: ["label"],
      why: "The header names the VALUES columns in row order — (lo, hi, label) — and the SELECT reads b.label, so the third column must come back under that exact name. Complete ladder: 8 · 30 · 40 · 25, summing to 103.",
      notes: [
        { slot: 1, why: "tag, n or price would run but rename the column — and then b.label has nothing to read (`no such column: b.label`). A fourth header name (hi, label) re-fires the mismatch in the other direction." },
      ],
    },
    {
      id: "l34-f6",
      prompt: "Pricier than its neighbor: every same-category pair of products where a costs strictly more than b, widest gap first.",
      template: "SELECT a.name AS pricier, b.name AS cheaper,\n  ROUND(a.price - b.price, 2) AS gap\nFROM products a\nJOIN products b\n  ON a.category = {1} AND a.price {2} b.price\nORDER BY gap DESC, pricier;",
      chips: ["b.category", "a.category", "category", ">", "<", "="],
      answers: ["b.category", ">"],
      why: "The self non-equi join matches within-category pairs where a costs strictly more than b — 12 pairs, one-directional by price so no mirror-dedupe is needed. gap rounds the difference and the sort leads with the widest margin.",
      notes: [
        { slot: 1, why: "a.category = a.category is always true — the guard vanishes and every pricier pair across ALL categories floods in (120 pairs). Bare category is ambiguous between the two product aliases (`ambiguous column name: category`)." },
        { slot: 2, why: "< keeps 12 pairs too but swaps the roles — pricier would show the cheaper product. = pairs every product with itself (16 self-rows) since no two same-category products tie on price." },
      ],
    },
  ],

  // Lesson 40 — Capstone: the executive one-pager
  40: [
    {
      id: "l40-f1",
      prompt: "Artifact one, the four-number census: delivered and cancelled from ONE scan — each count with its own private WHERE.",
      template: "SELECT\n  COUNT(*) FILTER ({1} status = 'delivered') AS delivered,\n  COUNT(*) FILTER (WHERE status = {2}) AS cancelled\nFROM orders;",
      chips: ["WHERE", "FILTER", "'cancelled'", "cancelled", "'shipped'", "HAVING"],
      answers: ["WHERE", "'cancelled'"],
      why: "One scan, two private WHEREs: 52 delivered and 7 cancelled from a single snapshot — the board's numbers can't disagree with each other. That snapshot consistency is the one-pager's whole argument for FILTER.",
      notes: [
        { slot: 1, why: "The FILTER keyword is already written before the parenthesis — the clause wants a full WHERE predicate inside it, not another FILTER." },
        { slot: 2, why: "Unquoted cancelled reads as a column (`no such column: cancelled`), and 'shipped' returns the sibling count 30 — the brief's second number is cancelled's 7." },
      ],
    },
    {
      id: "l40-f2",
      prompt: "Fix the broken footprint: the cell died with `DISTINCT aggregates must have exactly one argument` — the line was GROUP_CONCAT(DISTINCT region, ' | '). Keep the dedupe, drop the separator, and pin the alphabet while you're in there.",
      template: "SELECT GROUP_CONCAT(DISTINCT {1} ORDER BY region) AS regions\nFROM {2};",
      chips: ["region", "region, ' | '", "suppliers", "customers", "name"],
      answers: ["region", "suppliers"],
      why: "SQLite lets DISTINCT carry exactly one argument — the separator goes, the dedupe stays, and ORDER BY inside pins the alphabet: 'APAC,EU,LATAM,US' folded from six suppliers holding four regions.",
      notes: [
        { slot: 1, why: "Re-typing the separator re-fires the exact error — DISTINCT and a custom separator can't share one GROUP_CONCAT on this engine. If the board demands ' | ', stage the dedupe in a subquery and fold the derived column. And name would recite the six supplier NAMES — a different string for a different brief." },
        { slot: 2, why: "customers would run and return the same four region labels, but the footprint is where we BUY: suppliers. There is no name table to fold FROM." },
      ],
    },
    {
      id: "l40-f3",
      prompt: "Artifact three, the grand-total stack: seven category revenues from the line items, with a 'GRAND TOTAL' row appended on top of the sort.",
      template: "SELECT category, revenue FROM (\n  SELECT p.category AS category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  {1} p.category\n  UNION {2}\n  SELECT {3}, ROUND(SUM(oi.quantity * oi.unit_price), 2)\n  FROM order_items oi\n)\nORDER BY revenue DESC;",
      chips: ["GROUP BY", "WHERE", "ALL", "DISTINCT", "'GRAND TOTAL'", "GRAND TOTAL"],
      answers: ["GROUP BY", "ALL", "'GRAND TOTAL'"],
      why: "Arm one folds the 251 lines into seven category buckets (Audio leads at 11744.01); arm two skips GROUP BY entirely, so its SUM spans every line — 34833.28. ALL appends without a dedupe pass, and the outer sort puts the grand row, bigger than any category, on top.",
      notes: [
        { slot: 1, why: "WHERE can't create the seven buckets — without GROUP BY the SUM collapses to one row, and the category detail vanishes." },
        { slot: 2, why: "Bare UNION audits for duplicates a total-stack never needs — wasted work at best, and a coincidental match would silently delete a row. The append contract is ALL." },
        { slot: 3, why: "The label is a text literal in single quotes — unquoted, GRAND is read as a column reference (`no such column: GRAND`)." },
      ],
    },
    {
      id: "l40-f4",
      prompt: "Artifact four, the catalog banded: type the VALUES ladder (0/50 budget, 50/100 mid, 100/9999 premium) and join by range so every product lands in exactly one band, ladder order.",
      template: "WITH bands(lo, hi, label) AS (\n  VALUES (0, 50, 'budget'), (50, 100, 'mid'), (100, 9999, 'premium')\n)\nSELECT b.label, COUNT(*) AS n\nFROM products p\nJOIN bands b ON p.price >= b.lo AND p.price {1} b.hi\nGROUP BY b.label\nORDER BY {2};",
      chips: ["<", "<=", "BETWEEN", "MIN(b.lo)", "MAX(b.lo)", "n"],
      answers: ["<", "MIN(b.lo)"],
      why: "The half-open [lo, hi) lands every product in exactly one band — 8 budget · 4 mid · 4 premium, summing to the full catalog of 16. MIN(b.lo) preserves threshold order for the one-pager.",
      notes: [
        { slot: 1, why: "<= runs today — no product sits on a 50/100 seam — but it closes the band, and the first product priced exactly at a boundary would land in two bands at once, inflating the sum past 16. < is the spelling that keeps the bands disjoint." },
        { slot: 2, why: "MAX(b.lo) flips the ladder upside down (premium, mid, budget) and ORDER BY n ranks by rung size — the 4-4 tie between mid and premium resolves arbitrarily. Only MIN(b.lo) walks budget → mid → premium." },
      ],
    },
    {
      id: "l40-f5",
      prompt: "Artifact five, the coverage grid: every supplier against every DISTINCT sales region — 24 cells, supplier-first order.",
      template: "SELECT s.name AS supplier, r.region\nFROM suppliers s\nCROSS JOIN ({1} region FROM customers) r\nORDER BY {2}, r.region;",
      chips: ["SELECT DISTINCT", "SELECT", "DISTINCT", "s.name", "s.region", "r.region"],
      answers: ["SELECT DISTINCT", "s.name"],
      why: "CROSS JOIN takes no ON — it pairs all six suppliers with the deduped region list: 6 × 4 = 24 coverage cells. The DISTINCT in the derived table is what keeps the 16 customer rows from repeating each region four-fold.",
      notes: [
        { slot: 1, why: "Bare SELECT keeps all 16 customer rows — the grid multiplies to 96 cells with every region repeated once per customer. And DISTINCT alone can't introduce the subquery's SELECT." },
        { slot: 2, why: "r.region would double a sort key already present, jumbling suppliers inside each region; s.region is the SUPPLIER's home region, not the grid's. The brief reads supplier-first: s.name." },
      ],
    },
    {
      id: "l40-f6",
      prompt: "The closing artifact: the census goes regional — delivered count beside each region's full volume, busiest region leading.",
      template: "SELECT c.region,\n  COUNT(*) FILTER (WHERE o.status = {1}) AS delivered,\n  COUNT(*) AS total\nFROM orders o JOIN customers c ON c.id = o.customer_id\n{2} c.region\nORDER BY total {3};",
      chips: ["'delivered'", "delivered", "GROUP BY", "ORDER BY", "DESC", "ASC"],
      answers: ["'delivered'", "GROUP BY", "DESC"],
      why: "FILTER counts each region's slice of the 52 delivered orders while COUNT(*) keeps every region's full volume, and GROUP BY builds the four buckets: EU 45 orders (24 delivered) · APAC 37 · US 19 · LATAM 2. DESC leads the one-pager with the busiest region.",
      notes: [
        { slot: 1, why: "Unquoted delivered is read as a column reference and crashes (`no such column: delivered`) — status literals wear single quotes." },
        { slot: 2, why: "The buckets only exist once GROUP BY runs — ORDER BY in that position is the wrong clause entirely." },
        { slot: 3, why: "ASC would lead with the quietest region (LATAM, 2 orders); the board reads biggest-first." },
      ],
    },
  ],
};
