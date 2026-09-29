// M4 Gauntlet — graded problems, hard tier (gm4-p61..p90).
// Full-assembly subquery/CTE problems over the storefront seed; all solutions
// execute against the live db (gen-expected verifies).
import type { Problem } from "../types";
import { EXPECTED } from "../expected";

const p = (v: Omit<Problem, "expected">): Problem => ({ ...v, expected: EXPECTED[v.id] });

export const m04ProblemsHard: Problem[] = [
  p({
    id: "gm4-p61", difficulty: "hard", title: "The gap-to-ceiling ledger",
    brief: "Per-order distance from the account's peak: total minus the correlated MAX, rounded — leaders read 0.00, the deepest spreads go most negative. Biggest gaps first.",
    hints: ["ROUND(o.total - (SELECT MAX(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id), 2) AS gap.", "ORDER BY gap ASC, id ASC — negative gaps lead."],
    solution: "SELECT o.id, ROUND(o.total - (SELECT MAX(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id), 2) AS gap FROM orders o ORDER BY gap ASC, o.id ASC;",
  }),
  p({
    id: "gm4-p62", difficulty: "hard", title: "The pending-half probe",
    brief: "Nested existence: customers whose pending total is at least HALF their lifetime spend. The grouped probe compares against a correlated scalar — exactly one customer qualifies.",
    hints: ["EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending' GROUP BY o.customer_id HAVING SUM(o.total) >= (SELECT SUM(o2.total) FROM orders o2 WHERE o2.customer_id = c.id) / 2.0).", "SELECT id, name; ORDER BY name."],
    solution: "SELECT id, name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending' GROUP BY o.customer_id HAVING SUM(o.total) >= (SELECT SUM(o2.total) FROM orders o2 WHERE o2.customer_id = c.id) / 2.0) ORDER BY name ASC;",
  }),
  p({
    id: "gm4-p63", difficulty: "hard", title: "Triple-fate survivors",
    brief: "Three ANDed probes — delivered, shipped, cancelled. Each fate needs its own probe; one row never witnesses three statuses. The full-journey customers surface.",
    hints: ["Three EXISTS clauses, aliases o/o2/o3.", "SELECT name; ORDER BY name."],
    solution: "SELECT name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered') AND EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = 'shipped') AND EXISTS (SELECT 1 FROM orders o3 WHERE o3.customer_id = c.id AND o3.status = 'cancelled') ORDER BY name ASC;",
  }),
  p({
    id: "gm4-p64", difficulty: "hard", title: "Pure-Accessories baskets",
    brief: "'ONLY X' decomposition: the basket has items AND no item outside Accessories. Two probes — existence plus anti-existence.",
    hints: ["EXISTS (any item) AND NOT EXISTS (item joined to products WHERE category <> 'Accessories').", "SELECT id, total; ORDER BY id."],
    solution: "SELECT id, total FROM orders o WHERE EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id) AND NOT EXISTS (SELECT 1 FROM order_items oi2 INNER JOIN products p ON p.id = oi2.product_id WHERE oi2.order_id = o.id AND p.category <> 'Accessories') ORDER BY id ASC;",
  }),
  p({
    id: "gm4-p65", difficulty: "hard", title: "Above the best-of-best bar",
    brief: "Scalar-from-derived: the benchmark averages the per-customer MAXIMA — a heavier bar than the plain mean. Thirteen orders clear it.",
    hints: ["WHERE total > (SELECT AVG(t) FROM (SELECT MAX(total) AS t FROM orders GROUP BY customer_id) m).", "SELECT id, total; ORDER BY total DESC."],
    solution: "SELECT id, total FROM orders WHERE total > (SELECT AVG(t) FROM (SELECT MAX(total) AS t FROM orders GROUP BY customer_id) m) ORDER BY total DESC, id ASC;",
  }),
  p({
    id: "gm4-p66", difficulty: "hard", title: "The per-customer argmax",
    brief: "Sixteen rows, one per account: orders whose total EQUALS the correlated MAX of their customer — the leaders' list, biggest ceilings first.",
    hints: ["WHERE o.total = (SELECT MAX(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id).", "SELECT o.id, o.customer_id, o.total; ORDER BY total DESC, id."],
    solution: "SELECT o.id, o.customer_id, o.total FROM orders o WHERE o.total = (SELECT MAX(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) ORDER BY o.total DESC, o.id ASC;",
  }),
  p({
    id: "gm4-p67", difficulty: "hard", title: "The full rank ladder",
    brief: "Every distinct order total with its correlated count of higher distinct totals — a hand-rolled dense rank from 0 (the max) upward.",
    hints: ["SELECT DISTINCT total, (SELECT COUNT(DISTINCT o2.total) FROM orders o2 WHERE o2.total > o.total) AS better FROM orders o.", "ORDER BY better ASC, total DESC."],
    solution: "SELECT DISTINCT total, (SELECT COUNT(DISTINCT o2.total) FROM orders o2 WHERE o2.total > o.total) AS better FROM orders o ORDER BY better ASC, total DESC;",
  }),
  p({
    id: "gm4-p68", difficulty: "hard", title: "Latest-order pending flags",
    brief: "Existence as a column, doubly nested: for each customer, 1 when their LATEST order (MAX id) is still pending — scalar inside EXISTS inside projection.",
    hints: ["EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending' AND o.id = (SELECT MAX(o2.id) FROM orders o2 WHERE o2.customer_id = c.id)).", "Alias the flag latest_pending; ORDER BY name."],
    solution: "SELECT c.name, EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending' AND o.id = (SELECT MAX(o2.id) FROM orders o2 WHERE o2.customer_id = c.id)) AS latest_pending FROM customers c ORDER BY c.name ASC;",
  }),
  p({
    id: "gm4-p69", difficulty: "hard", title: "Row-value IN (SQLite extension)",
    brief: "Tuple membership: (customer_id, status) IN (SELECT 1, 'delivered') pins customer 1's twelve delivered tickets. Portable SQL avoids it — the engine demonstrably runs it.",
    hints: ["The outer tuple mirrors the subquery's two columns.", "SELECT id, total; ORDER BY id."],
    solution: "SELECT id, total FROM orders WHERE (customer_id, status) IN (SELECT 1, 'delivered') ORDER BY id ASC;",
  }),
  p({
    id: "gm4-p70", difficulty: "hard", title: "Latest-is-pending holders",
    brief: "Two-hop IN: customers whose LATEST order (MAX id per customer) carries status 'pending'. The middle list filters; the outer names.",
    hints: ["id IN (SELECT customer_id FROM orders WHERE status = 'pending' AND id IN (SELECT MAX(id) FROM orders GROUP BY customer_id)).", "SELECT name; ORDER BY name."],
    solution: "SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = 'pending' AND id IN (SELECT MAX(id) FROM orders GROUP BY customer_id)) ORDER BY name ASC;",
  }),
  p({
    id: "gm4-p71", difficulty: "hard", title: "The cancelled-EU audit",
    brief: "Two membership tests compose: EU customers (literal region test) who also appear in the cancelled key set.",
    hints: ["WHERE region = 'EU' AND id IN (SELECT customer_id FROM orders WHERE status = 'cancelled').", "SELECT id, name; ORDER BY name."],
    solution: "SELECT id, name FROM customers WHERE region = 'EU' AND id IN (SELECT customer_id FROM orders WHERE status = 'cancelled') ORDER BY name ASC;",
  }),
  p({
    id: "gm4-p72", difficulty: "hard", title: "The non-EU ledger with region shown",
    brief: "Anti-membership with a join-back: orders OUTSIDE the EU id set, annotated with their customer's region — 58 rows.",
    hints: ["Join orders to customers; WHERE o.customer_id NOT IN (EU ids).", "SELECT o.id, o.customer_id, c.region; ORDER BY o.id."],
    solution: "SELECT o.id, o.customer_id, c.region FROM orders o INNER JOIN customers c ON c.id = o.customer_id WHERE o.customer_id NOT IN (SELECT id FROM customers WHERE region = 'EU') ORDER BY o.id ASC;",
  }),
  p({
    id: "gm4-p73", difficulty: "hard", title: "Two walks, one WITH",
    brief: "Two recursive CTEs under one WITH RECURSIVE: a counts 1..3 by ones, b counts 10..30 by tens — the final SELECT reports both maxima (3 and 30).",
    hints: ["WITH RECURSIVE a(x) AS (…), b(y) AS (…) — one RECURSIVE token covers both.", "SELECT (SELECT MAX(x) FROM a) AS mx, (SELECT MAX(y) FROM b) AS my."],
    solution: "WITH RECURSIVE a(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM a WHERE x < 3), b(y) AS (SELECT 10 UNION ALL SELECT y + 10 FROM b WHERE y < 30) SELECT (SELECT MAX(x) FROM a) AS mx, (SELECT MAX(y) FROM b) AS my;",
  }),
  p({
    id: "gm4-p74", difficulty: "hard", title: "The heavy stage, consumed twice",
    brief: "Stage the > 6-order customers once; read the CTE twice — COUNT(*) for roster size (4), SUM(n) for their combined orders (68).",
    hints: ["WITH heavy AS (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id HAVING COUNT(*) > 6).", "SELECT (SELECT COUNT(*) FROM heavy) AS a, (SELECT SUM(n) FROM heavy) AS b."],
    solution: "WITH heavy AS (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id HAVING COUNT(*) > 6) SELECT (SELECT COUNT(*) FROM heavy) AS a, (SELECT SUM(n) FROM heavy) AS b;",
  }),
  p({
    id: "gm4-p75", difficulty: "hard", title: "Nested WITH at subquery depth",
    brief: "WITH inside a derived table: a private CTE of pending ids, counted from the outer expression — fourteen. WITH scopes to any SELECT.",
    hints: ["SELECT COUNT(*) AS n FROM (WITH t AS (SELECT id FROM orders WHERE status = 'pending') SELECT * FROM t).", "The parenthesized query owns its WITH."],
    solution: "SELECT COUNT(*) AS n FROM (WITH t AS (SELECT id FROM orders WHERE status = 'pending') SELECT * FROM t);",
  }),
  p({
    id: "gm4-p76", difficulty: "hard", title: "Monthly revenue over the full spine",
    brief: "Calendar integrity: stage per-month revenue, LEFT JOIN the 14-month spine, COALESCE to 0.00 — every month present, quiet months visible.",
    hints: ["Recursive month spine '2024-01'..'2025-02'; LEFT JOIN the staged revenue ON strftime month.", "ROUND(COALESCE(rev, 0), 2); ORDER BY m."],
    solution: "WITH RECURSIVE m(m) AS (SELECT '2024-01' UNION ALL SELECT strftime('%Y-%m', date(m || '-01', '+1 month')) FROM m WHERE m < '2025-02') SELECT m.m, ROUND(COALESCE(r.rev, 0), 2) AS rev FROM m LEFT JOIN (SELECT strftime('%Y-%m', created_at) AS m, SUM(total) AS rev FROM orders GROUP BY m) r ON r.m = m.m ORDER BY m.m ASC;",
    ordered: true,
  }),
  p({
    id: "gm4-p77", difficulty: "hard", title: "Running revenue curve",
    brief: "CTE + window: stage orders ranked by id, then SUM(total) OVER (ORDER BY rn) — the running curve across 103 orders, ending at the store's grand total.",
    hints: ["WITH ranked AS (SELECT id, total, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM orders).", "Outer: SUM(total) OVER (ORDER BY rn) AS running; ORDER BY rn."],
    solution: "WITH ranked AS (SELECT id, total, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM orders) SELECT id, ROUND(total, 2) AS total, ROUND(SUM(total) OVER (ORDER BY rn), 2) AS running FROM ranked ORDER BY rn ASC;",
    ordered: true,
  }),
  p({
    id: "gm4-p78", difficulty: "hard", title: "The acquisition ledger",
    brief: "Correlated MIN: each customer's FIRST order date — tenure instead of recency. Oldest accounts first.",
    hints: ["(SELECT MIN(o.created_at) FROM orders o WHERE o.customer_id = c.id) AS first_order.", "Filter to buyers; ORDER BY first_order ASC."],
    solution: "SELECT c.name, (SELECT MIN(o.created_at) FROM orders o WHERE o.customer_id = c.id) AS first_order FROM customers c WHERE c.id IN (SELECT customer_id FROM orders) ORDER BY first_order ASC, c.name ASC;",
  }),
  p({
    id: "gm4-p79", difficulty: "hard", title: "The whale threshold, all-scalar",
    brief: "Two-stage benchmark: correlated lifetime SUM per row compared against AVG over a staged per-customer sum — five whales clear 2177.08.",
    hints: ["The correlated SUM in both SELECT and WHERE; the benchmark nests a derived table inside the scalar.", "WHERE … > (SELECT AVG(s) FROM (SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id) t)."],
    solution: "SELECT c.name, ROUND((SELECT SUM(o.total) FROM orders o WHERE o.customer_id = c.id), 2) AS spend FROM customers c WHERE (SELECT SUM(o.total) FROM orders o WHERE o.customer_id = c.id) > (SELECT AVG(s) FROM (SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id) t) ORDER BY spend DESC, c.name ASC;",
  }),
  p({
    id: "gm4-p80", difficulty: "hard", title: "Below their own line",
    brief: "The refund audit's ledger: orders strictly BELOW their customer's average — fifty-eight rows, worst offenders (smallest totals) first. Singles never appear: their only order ties its own mean.",
    hints: ["WHERE o.total < (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id).", "ORDER BY o.total ASC, o.id ASC."],
    solution: "SELECT o.id, o.customer_id, o.total FROM orders o WHERE o.total < (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) ORDER BY o.total ASC, o.id ASC;",
  }),
  p({
    id: "gm4-p81", difficulty: "hard", title: "The inactive-ledger split",
    brief: "Not-EXISTS probe with a flag: orders whose customer is NOT active — the six dormant tickets, plus a 1/0 inactive column fetched by a correlated scalar.",
    hints: ["WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.id = o.customer_id AND c.active = 1).", "Add (SELECT c2.active FROM customers c2 WHERE c2.id = o.customer_id) AS flag; ORDER BY o.id."],
    solution: "SELECT o.id, o.customer_id, (SELECT c2.active FROM customers c2 WHERE c2.id = o.customer_id) AS flag FROM orders o WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.id = o.customer_id AND c.active = 1) ORDER BY o.id ASC;",
  }),
  p({
    id: "gm4-p82", difficulty: "hard", title: "Shelf-relative rank ladder",
    brief: "Per-product correlated count of same-shelf pricier products (DISTINCT for tie-sharing) — the seven leaders read 0. The category version of the rank ladder.",
    hints: ["(SELECT COUNT(DISTINCT p2.price) FROM products p2 WHERE p2.category = p.category AND p2.price > p.price) AS above.", "ORDER BY above ASC, p.price DESC."],
    solution: "SELECT p.name, p.category, (SELECT COUNT(DISTINCT p2.price) FROM products p2 WHERE p2.category = p.category AND p2.price > p.price) AS above FROM products p ORDER BY above ASC, p.price DESC, p.name ASC;",
  }),
  p({
    id: "gm4-p83", difficulty: "hard", title: "Same-city premium orders",
    brief: "Correlated IN: orders over 500 whose customer lives in the city named on the order's customer row — the correlation re-derives the id list per row.",
    hints: ["WHERE o.total > 500 AND o.customer_id IN (SELECT c2.id FROM customers c2 WHERE c2.city = (SELECT c3.city FROM customers c3 WHERE c3.id = o.customer_id)).", "Simpler: compare via a correlated scalar join-free form — SELECT o.id; ORDER BY o.id."],
    solution: "SELECT o.id, o.total FROM orders o WHERE o.total > 500 AND o.customer_id IN (SELECT c2.id FROM customers c2 WHERE c2.city = (SELECT c3.city FROM customers c3 WHERE c3.id = o.customer_id)) ORDER BY o.id ASC;",
  }),
  p({
    id: "gm4-p84", difficulty: "hard", title: "The two-derived shelf audit",
    brief: "Stage per-category averages, join back to products, filter price > staged average — the derived twin of the correlated shelf test. Seven leaders, identical to the correlated answer.",
    hints: ["INNER JOIN (SELECT category, AVG(price) AS ap FROM products GROUP BY category) c ON c.category = p.category WHERE p.price > c.ap.", "SELECT p.name, p.category, p.price; ORDER BY p.price DESC."],
    solution: "SELECT p.name, p.category, p.price FROM products p INNER JOIN (SELECT category, AVG(price) AS ap FROM products GROUP BY category) c ON c.category = p.category WHERE p.price > c.ap ORDER BY p.price DESC, p.name ASC;",
  }),
  p({
    id: "gm4-p85", difficulty: "hard", title: "Categories never sold",
    brief: "Category-level anti-existence: shelves with NO selling product — the probe joins items to products and matches the outer category. The honest answer on this seed is empty.",
    hints: ["SELECT DISTINCT category FROM products p WHERE NOT EXISTS (SELECT 1 FROM order_items oi INNER JOIN products p2 ON p2.id = oi.product_id WHERE p2.category = p.category).", "ORDER BY category."],
    solution: "SELECT DISTINCT category FROM products p WHERE NOT EXISTS (SELECT 1 FROM order_items oi INNER JOIN products p2 ON p2.id = oi.product_id WHERE p2.category = p.category) ORDER BY category ASC;",
  }),
  p({
    id: "gm4-p86", difficulty: "hard", title: "First-order year ledger",
    brief: "Correlated scalar over a computed column: each customer's FIRST order YEAR via strftime inside a correlated MIN — the cohort analysis column.",
    hints: ["(SELECT MIN(strftime('%Y', o.created_at)) FROM orders o WHERE o.customer_id = c.id) AS cohort.", "Filter to buyers; ORDER BY cohort ASC, name."],
    solution: "SELECT c.name, (SELECT MIN(strftime('%Y', o.created_at)) FROM orders o WHERE o.customer_id = c.id) AS cohort FROM customers c WHERE c.id IN (SELECT customer_id FROM orders) ORDER BY cohort ASC, c.name ASC;",
  }),
  p({
    id: "gm4-p87", difficulty: "hard", title: "The stalled-account sweep",
    brief: "Customers whose pending count equals their total order count minus delivered-and-shipped history — expressed directly: customers with pending orders but NO delivered ones. Two probes, one positive one negative.",
    hints: ["EXISTS (… 'pending') AND NOT EXISTS (… 'delivered').", "SELECT name; ORDER BY name."],
    solution: "SELECT name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending') AND NOT EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = 'delivered') ORDER BY name ASC;",
  }),
  p({
    id: "gm4-p88", difficulty: "hard", title: "The spend-vs-tickets matrix",
    brief: "Two correlated scalars side by side: each buyer's order count AND lifetime spend in one ledger, then a CASE tier column (whale >= 3000, regular >= 1000, else occasional). The correlated family dressed for the board.",
    hints: ["Two inner SELECTs plus a CASE over the spend scalar (repeat the scalar inside the CASE).", "ORDER BY spend DESC."],
    solution: "SELECT c.name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS n, ROUND((SELECT SUM(o.total) FROM orders o WHERE o.customer_id = c.id), 2) AS spend, CASE WHEN (SELECT SUM(o.total) FROM orders o WHERE o.customer_id = c.id) >= 3000 THEN 'whale' WHEN (SELECT SUM(o.total) FROM orders o WHERE o.customer_id = c.id) >= 1000 THEN 'regular' ELSE 'occasional' END AS tier FROM customers c WHERE c.id IN (SELECT customer_id FROM orders) ORDER BY spend DESC, c.name ASC;",
  }),
  p({
    id: "gm4-p89", difficulty: "hard", title: "The spine-gap audit",
    brief: "Days with ZERO orders: LEFT JOIN the 424-day spine to orders, keep HAVING COUNT(o.id) = 0 — the quiet calendar the direct GROUP BY would never show.",
    hints: ["Reuse the spine; LEFT JOIN on date(created_at) = d.", "SELECT s.d FROM … GROUP BY s.d HAVING COUNT(o.id) = 0 ORDER BY s.d."],
    solution: "WITH RECURSIVE spine(d) AS (SELECT (SELECT MIN(date(created_at)) FROM orders) UNION ALL SELECT date(d, '+1 day') FROM spine WHERE d < (SELECT MAX(date(created_at)) FROM orders)) SELECT s.d FROM spine s LEFT JOIN orders o ON date(o.created_at) = s.d GROUP BY s.d HAVING COUNT(o.id) = 0 ORDER BY s.d ASC;",
  }),
  p({
    id: "gm4-p90", difficulty: "hard", title: "The per-month active-buyer census",
    brief: "Spine + EXISTS composition: for each of the fourteen months, count customers who placed AT LEAST one order that month — grouped probe inside EXISTS, correlated to the spine's month.",
    hints: ["FROM the month spine m; SELECT m.m, (SELECT COUNT(DISTINCT customer_id) FROM orders WHERE strftime('%Y-%m', created_at) = m.m) AS buyers.", "ORDER BY m.m."],
    solution: "WITH RECURSIVE m(m) AS (SELECT '2024-01' UNION ALL SELECT strftime('%Y-%m', date(m || '-01', '+1 month')) FROM m WHERE m < '2025-02') SELECT m.m, (SELECT COUNT(DISTINCT customer_id) FROM orders WHERE strftime('%Y-%m', created_at) = m.m) AS buyers FROM m ORDER BY m.m ASC;",
    ordered: true,
  }),
];
