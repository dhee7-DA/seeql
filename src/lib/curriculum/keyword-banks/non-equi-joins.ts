// Keyword Mastery bank — Non-equi & range joins (gap closer: +47 MCQs, +18
// cases, +29 problems). Facts probed via scripts/m2-{facts,hard-facts,
// ne-facts,ne-facts2}*.ts; every solution below executes against the seed db
// (gen-expected verifies). Case ids: cs-2233..cs-2250 (m02 gauntlet owns
// cs-2121..cs-2210, earlier banks own cs-2211..cs-2232).
import type { Mcq, Problem } from "../types";
import { EXPECTED } from "../expected";
import type { KeywordBank } from "./index";
import { nonEquiMcqs } from "./non-equi-mcqs";
import { nonEquiCases } from "./non-equi-cases";

const p = (v: Omit<Problem, "expected">): Problem => ({ ...v, expected: EXPECTED[v.id] });

const problems: Problem[] = [
  p({
    id: "kb-ne-p01", difficulty: "easy",
    title: "The same-shelf ladder, listed",
    brief: "Pricing wants the full same-category cheaper-to-pricier pairing list — twelve pairs across six shelves — with the dollar gap per pairing. The non-equi self join compounds category equality with the strict price inequality; the gap column makes the ladder readable.",
    hints: ["Self join products on category equality plus a.price < b.price.", "The gap is b.price - a.price, rounded to cents. Order widest gap first for the pricing review."],
    solution: "SELECT a.name AS cheaper, b.name AS pricier, ROUND(b.price - a.price, 2) AS gap FROM products a JOIN products b ON a.category = b.category AND a.price < b.price ORDER BY gap DESC, cheaper ASC;",
  }),
  p({
    id: "kb-ne-p02", difficulty: "easy",
    title: "The pricier-peer rank ladder",
    brief: "Every product ranked by how many products cost more than it — the LEFT-kept ladder from zero pricier peers at the ceiling to fifteen at the floor. The catalog's price ranks, derived without a single ranking function. The engine is a non-equi join: every product pairs against every pricier one, LEFT-kept so the ceiling counts zero.",
    hints: ["LEFT JOIN products b ON b.price > a.price so the ceiling product survives with zero.", "COUNT(b.id), not COUNT(*) — padded rows must read zero. Group per product; sort ascending so the ceiling leads."],
    solution: "SELECT a.name AS product, COUNT(b.id) AS pricier_peers FROM products a LEFT JOIN products b ON b.price > a.price GROUP BY a.id ORDER BY pricier_peers ASC, product ASC;",
  }),
  p({
    id: "kb-ne-p03", difficulty: "easy",
    title: "Flagship per supplier",
    brief: "The sourcing one-pager: each supplier's most expensive product with its price — the argmax problem solved by the non-equi anti-join. Six flagships, Smart Watch S's 199.99 headlining.",
    hints: ["Join products to same-supplier products costing MORE; the flagship finds nothing.", "LEFT JOIN plus WHERE b.id IS NULL keeps the peaks. Sort by price descending for the one-pager."],
    solution: "SELECT s.name AS supplier, a.name AS flagship, a.price FROM suppliers s JOIN products a ON a.supplier_id = s.id LEFT JOIN products b ON b.supplier_id = a.supplier_id AND b.price > a.price WHERE b.id IS NULL ORDER BY a.price DESC, s.name ASC;",
  }),
  p({
    id: "kb-ne-p04", difficulty: "medium",
    title: "Same-region spend rivalry",
    brief: "The rivalry report: same-region customer pairs whose total spend differs by at least 1000 — twenty-one pairs, Alice's whale gap topping the board. Spend is staged per customer, then the self join pairs the region-mates. The rivalry pairs ride a range join condition — an ABS gap of at least 1000 — layered on the same-region self join.",
    hints: ["Stage spend per customer in a derived table with COALESCE, then self join it.", "a.id < b.id dedupes the pairing; region equality scopes it. ABS(a.spend - b.spend) >= 1000 finds the rivalry; sort widest first."],
    solution: "SELECT a.name AS customer_a, b.name AS customer_b, ROUND(a.spend, 2) AS spend_a, ROUND(b.spend, 2) AS spend_b, ROUND(ABS(a.spend - b.spend), 2) AS gap FROM (SELECT c.id, c.name, c.region, COALESCE(SUM(o.total), 0) AS spend FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id) a JOIN (SELECT c.id, c.name, c.region, COALESCE(SUM(o.total), 0) AS spend FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id) b ON a.region = b.region AND a.id < b.id WHERE ABS(a.spend - b.spend) >= 1000 ORDER BY gap DESC;",
  }),
  p({
    id: "kb-ne-p05", difficulty: "easy",
    title: "The tightest squeeze",
    brief: "Which two products sit closest on the price axis? One row: the slimmest gap in the catalog — 2.50 between the Yoga Mat and the Wireless Mouse. The range join computes every gap; the sort and limit take the tightest.",
    hints: ["Join products on b.price > a.price and compute the gap.", "ORDER BY gap ASC LIMIT 1 answers 'closest'. Round the gap to cents for the memo."],
    solution: "SELECT a.name AS lower_priced, b.name AS higher_priced, ROUND(b.price - a.price, 2) AS gap FROM products a JOIN products b ON b.price > a.price ORDER BY gap ASC LIMIT 1;",
  }),
  p({
    id: "kb-ne-p06", difficulty: "medium",
    title: "The lopsided census",
    brief: "Spend disparity at a glance: how many order pairs have one total at least double the other? 3027 of the 5253 unordered pairs qualify — the two-sided OR test over the deduped self join. The lopsided census is a two-sided range join: either order can be the double-sized whale.",
    hints: ["Self join orders on a.id < b.id.", "The disparity test is two-sided: a.total >= 2 * b.total OR b.total >= 2 * a.total. COUNT(*) reads the qualifying pair space."],
    solution: "SELECT COUNT(*) AS lopsided FROM orders a JOIN orders b ON a.id < b.id AND (a.total >= 2 * b.total OR b.total >= 2 * a.total);",
  }),
  p({
    id: "kb-ne-p07", difficulty: "medium",
    title: "Close-spent region-mates",
    brief: "Community comfort check: same-region customer pairs whose total spend sits within 500 dollars of each other — eleven pairs. The staged-spend self join with an ABS distance ceiling, the softer twin of the rivalry report. The comfort pairs come from a range join with an ABS ceiling — spends within 500 dollars of each other.",
    hints: ["Stage spend per customer (COALESCE keeps no-order customers at 0), then self join same-region pairs.", "ABS(a.spend - b.spend) < 500 is the closeness test. a.id < b.id keeps each pair once."],
    solution: "SELECT a.name AS customer_a, b.name AS customer_b, ROUND(a.spend, 2) AS spend_a, ROUND(b.spend, 2) AS spend_b, ROUND(ABS(a.spend - b.spend), 2) AS gap FROM (SELECT c.id, c.name, c.region, COALESCE(SUM(o.total), 0) AS spend FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id) a JOIN (SELECT c.id, c.name, c.region, COALESCE(SUM(o.total), 0) AS spend FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id) b ON a.region = b.region AND a.id < b.id WHERE ABS(a.spend - b.spend) < 500 ORDER BY gap ASC;",
  }),
  p({
    id: "kb-ne-p08", difficulty: "medium",
    title: "The markup neighbourhood, listed",
    brief: "Fourteen product pairs where the pricier side costs at most 1.5 times the cheaper, each with its gap. The BETWEEN with a computed upper bound is the band; the id inequality dedupes; the board reads proximity in dollars. The band is a BETWEEN with a computed bound — the range join's 50%-markup neighbourhood.",
    hints: ["Self join on a.id < b.id AND b.price BETWEEN a.price AND a.price * 1.5.", "The computed upper bound makes the band a 50% markup test. Order by gap descending to lead with the steepest in-band pair."],
    solution: "SELECT a.name AS base_item, b.name AS marked_up, ROUND(b.price - a.price, 2) AS gap FROM products a JOIN products b ON a.id < b.id AND b.price BETWEEN a.price AND a.price * 1.5 ORDER BY gap DESC;",
  }),
  p({
    id: "kb-ne-p09", difficulty: "medium",
    title: "Near-twin order totals",
    brief: "Fraud's coincidence baseline: order pairs whose totals sit within 50 dollars of each other — 735 pairs, one of them EXACTLY on the boundary. The ABS distance makes the test two-sided; the id inequality counts each pair once. The near-twin census is an ABS range join: totals within 50 dollars, one pair exactly on the boundary.",
    hints: ["Self join orders on a.id < b.id.", "ABS(a.total - b.total) <= 50 is the two-sided window. COUNT(*) delivers the baseline figure."],
    solution: "SELECT COUNT(*) AS near_twins FROM orders a JOIN orders b ON a.id < b.id AND ABS(a.total - b.total) <= 50;",
  }),
  p({
    id: "kb-ne-p10", difficulty: "medium",
    title: "Solid partials, listed",
    brief: "Collections wants the payments fencing between half and the full invoice amount — all twenty-seven, each with its invoice and coverage percent. The range comparison rides cents; the percentage renders for humans. The fence is a two-sided range comparison: at least half, at most full — a non-equi test inside each row.",
    hints: ["Join payments to invoices; the fence is amount_cents >= half AND <= full.", "Coverage percent: pay.amount_cents * 100.0 / i.amount_cents. Sort by coverage descending to headline the near-full payments."],
    solution: "SELECT i.number, pay.amount_cents / 100.0 AS paid, ROUND(pay.amount_cents * 100.0 / i.amount_cents, 1) AS coverage_pct FROM payments pay JOIN invoices i ON pay.invoice_id = i.id WHERE pay.amount_cents <= i.amount_cents AND pay.amount_cents >= i.amount_cents / 2 ORDER BY coverage_pct DESC, i.number ASC;",
  }),
  p({
    id: "kb-ne-p11", difficulty: "medium",
    title: "Close-rating supplier pairs",
    brief: "The substitution shortlist: supplier pairs within half a star of each other — eight pairs — with the exact gap rendered. The ABS distance is two-sided; the strict test keeps the exact-0.5 pair OFF the list per the memo. The shortlist is a closeness range join: ABS rating gaps strictly under half a star.",
    hints: ["Self join suppliers on a.id < b.id.", "ABS(a.rating - b.rating) < 0.5 is the closeness test — strict, per the memo. Order by gap ascending: tightest bonds first."],
    solution: "SELECT a.name AS supplier_a, b.name AS supplier_b, ROUND(ABS(a.rating - b.rating), 2) AS gap FROM suppliers a JOIN suppliers b ON a.id < b.id AND ABS(a.rating - b.rating) < 0.5 ORDER BY gap ASC, supplier_a ASC;",
  }),
  p({
    id: "kb-ne-p12", difficulty: "easy",
    title: "Gaps within reach",
    brief: "The pricing radar's inner circle: product pairs within five dollars of each other — exactly three pairings, slimmest first. A two-sided distance filter over the deduped pair space. The radar is a bounded range join: price gaps at most five dollars, deduped by the id inequality.",
    hints: ["Self join products; the gap is b.price - a.price with the cheaper side fixed by the inequality.", "The filter b.price - a.price <= 5 with a.id < b.id dedupes and bounds at once. Three pairs qualify: 2.50, 2.51, 3.51."],
    solution: "SELECT a.name AS lower_priced, b.name AS higher_priced, ROUND(b.price - a.price, 2) AS gap FROM products a JOIN products b ON a.id < b.id AND b.price > a.price AND b.price - a.price <= 5 ORDER BY gap ASC;",
  }),
  p({
    id: "kb-ne-p13", difficulty: "medium",
    title: "Twin invoices, listed",
    brief: "The close's pattern hunt: same-customer invoice pairs where the later amount sits within 10% of the earlier — four pairs with their dollar drifts. The BETWEEN with a computed ceiling is the band. The hunt is a BETWEEN-with-computed-ceiling range join: the later invoice within 10% of the earlier.",
    hints: ["Self join invoices on customer equality plus a.id < b.id.", "b.amount_cents BETWEEN a.amount_cents AND a.amount_cents * 1.1 is the 10% band. Drift in dollars: (b.amount_cents - a.amount_cents) / 100.0."],
    solution: "SELECT a.number AS invoice_a, b.number AS invoice_b, ROUND((b.amount_cents - a.amount_cents) / 100.0, 2) AS drift FROM invoices a JOIN invoices b ON a.customer_id = b.customer_id AND a.id < b.id AND b.amount_cents BETWEEN a.amount_cents AND a.amount_cents * 1.1 ORDER BY drift DESC;",
  }),
  p({
    id: "kb-ne-p14", difficulty: "easy",
    title: "The mid-market band count",
    brief: "How many orders fall between 100 and 300 dollars inclusive? Thirty-nine — the funnel's middle band, counted with the BETWEEN whose bounds both count. BETWEEN is the range vocabulary here — the single-table warm-up for cross-table range joins.",
    hints: ["BETWEEN 100 AND 300 is inclusive on both ends.", "COUNT(*) over orders delivers the band's size."],
    solution: "SELECT COUNT(*) AS mid_market FROM orders WHERE total BETWEEN 100 AND 300;",
  }),
  p({
    id: "kb-ne-p15", difficulty: "medium",
    title: "The escalation census",
    brief: "Spend momentum: same-customer order pairs where the LATER order totals more — 266 climbs out of 624 pairs. The id inequality fixes the earlier-later orientation; the total test asks whether customers escalate. The climb test stacks two inequalities — the non-equi self join's orientation plus its direction.",
    hints: ["Self join orders on customer equality plus a.id < b.id.", "b.total > a.total asks whether the later order grew. COUNT(*) reads the climb count."],
    solution: "SELECT COUNT(*) AS escalations FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND a.id < b.id AND b.total > a.total;",
  }),
  p({
    id: "kb-ne-p16", difficulty: "medium",
    title: "The oversold check",
    brief: "Inventory's negative-space audit: products whose ordered quantity exceeds their stock. Expect an EMPTY result — every product's cumulative demand sits at or below stock — and the empty result IS the compliance evidence. The comparison is a range join at group grain: demanded quantity versus stock, joined and summed.",
    hints: ["Join products to their order lines and SUM the quantities.", "HAVING SUM(oi.quantity) > p.stock keeps only violations. An empty result means no product oversells — that is the finding."],
    solution: "SELECT p.name, p.stock, SUM(oi.quantity) AS demanded FROM products p JOIN order_items oi ON oi.product_id = p.id GROUP BY p.id HAVING SUM(oi.quantity) > p.stock ORDER BY demanded - p.stock DESC;",
  }),
  p({
    id: "kb-ne-p17", difficulty: "easy",
    title: "Both-orientation shelf pairs",
    brief: "The undirected pair count, directed: same-category product pairs listed in BOTH orientations — twenty-four rows for the twelve unordered shelf pairs. The price inequality flips to an exclusion so each pair tells its story twice. The price exclusion makes this a non-equi pairing: same shelf, different price, both orientations listed.",
    hints: ["Same-category join with a.price <> b.price — all prices are distinct, so this excludes only self-pairs.", "No id guard: both orientations appear. 24 rows = 12 unordered pairs × 2 directions."],
    solution: "SELECT a.name AS cheaper_side, b.name AS pricier_side FROM products a JOIN products b ON a.category = b.category AND a.price <> b.price ORDER BY cheaper_side ASC, pricier_side ASC;",
  }),
  p({
    id: "kb-ne-p18", difficulty: "easy",
    title: "The rank ladder, top five",
    brief: "The five products with the MOST pricier peers — the price floor and its neighbours, fifteen peers down to eleven. The LEFT-kept rank ladder read from the other end. The rank ladder reads the non-equi join's counts from the top: most pricier peers first.",
    hints: ["LEFT JOIN products b ON b.price > a.price; COUNT(b.id) is the rank.", "ORDER BY pricier_peers DESC LIMIT 5 takes the floor end. The HDMI cable's fifteen peers top the list."],
    solution: "SELECT a.name AS product, COUNT(b.id) AS pricier_peers FROM products a LEFT JOIN products b ON b.price > a.price GROUP BY a.id ORDER BY pricier_peers DESC, product ASC LIMIT 5;",
  }),
  p({
    id: "kb-ne-p19", difficulty: "easy",
    title: "The widest span",
    brief: "The catalog's price story in one row: the two products farthest apart — HDMI Cable to Smart Watch, 185.00. The closest-gap query's DESC twin. The widest span is the range join's extreme bookend: every gap computed, the largest taken.",
    hints: ["Join products on b.price > a.price and compute the gap.", "ORDER BY gap DESC LIMIT 1 answers 'widest'. The floor and ceiling products are the pairing."],
    solution: "SELECT a.name AS lower_priced, b.name AS higher_priced, ROUND(b.price - a.price, 2) AS gap FROM products a JOIN products b ON b.price > a.price ORDER BY gap DESC LIMIT 1;",
  }),
  p({
    id: "kb-ne-p20", difficulty: "medium",
    title: "Same-supplier price pairs",
    brief: "The sourcing ethics check: same-supplier product pairs where one is cheaper — seven pairs where the cheaper product also carries the lower id. Two inequalities compound: supplier equality scopes, price inequality orients. Two inequalities compound — supplier equality scopes, the price inequality orients: a textbook non-equi pairing.",
    hints: ["Join products on a.supplier_id = b.supplier_id AND a.id < b.id AND a.price < b.price.", "The id and price inequalities dedupe AND orient the pairing. Seven pairs qualify on the seed."],
    solution: "SELECT a.name AS cheaper, b.name AS pricier, ROUND(b.price - a.price, 2) AS gap FROM products a JOIN products b ON a.supplier_id = b.supplier_id AND a.id < b.id AND a.price < b.price ORDER BY gap DESC;",
  }),
  p({
    id: "kb-ne-p21", difficulty: "hard",
    title: "The closest order pair",
    brief: "Which two orders total nearest the same amount? One row — the tightest ABS distance in the order book. The pair-space is 5253 candidates; the distance filter and the sort find the needle. The needle comes from an ABS range join over the whole order book: 5253 candidates, one tightest pair.",
    hints: ["Self join orders on a.id < b.id with ABS(a.total - b.total) AS gap.", "ORDER BY gap ASC LIMIT 1 takes the tightest. The ABS makes the distance two-sided."],
    solution: "SELECT a.id AS order_a, b.id AS order_b, ROUND(ABS(a.total - b.total), 2) AS gap FROM orders a JOIN orders b ON a.id < b.id ORDER BY gap ASC LIMIT 1;",
  }),
  p({
    id: "kb-ne-p22", difficulty: "medium",
    title: "Near-full coverages",
    brief: "Treasury's coverage census: payments covering at least 90% of their invoice. The ratio test rides cents; the count says how many payments nearly settle their bill outright. The coverage test is a range join against a computed constant — 90% of each invoice's own amount.",
    hints: ["Join payments to invoices.", "The test: pay.amount_cents >= i.amount_cents * 0.9. COUNT(*) delivers the census figure."],
    solution: "SELECT COUNT(*) AS near_full FROM payments pay JOIN invoices i ON pay.invoice_id = i.id WHERE pay.amount_cents >= i.amount_cents * 0.9;",
  }),
  p({
    id: "kb-ne-p23", difficulty: "easy",
    title: "The inactive pair",
    brief: "Data hygiene's curiosity: the only customer pair where BOTH accounts are deactivated — Dmitri and Keiko, paired regardless of region. The active-product test compresses two flags into one comparison. The active-product test is a compressed range-free equality — but the pairing itself is the non-equi self join's dedupe grammar.",
    hints: ["Self join customers on a.id < b.id.", "The test a.active + b.active = 0 finds pairs where both flags are zero. One row expected."],
    solution: "SELECT a.name AS customer_a, b.name AS customer_b, a.region AS region_a, b.region AS region_b FROM customers a JOIN customers b ON a.id < b.id AND a.active + b.active = 0;",
  }),
  p({
    id: "kb-ne-p24", difficulty: "hard",
    title: "Per-order price spread",
    brief: "The order-level range measure: each order's price spread — dearest line minus cheapest line — top three widest. The aggregate cousin of the pairwise range join: extremes per group instead of rows paired.",
    hints: ["Join lines to their orders; MAX(unit_price) - MIN(unit_price) is the spread.", "GROUP BY order_id; ROUND to cents. ORDER BY spread DESC LIMIT 3 takes the widest orders."],
    solution: "SELECT o.id AS order_id, ROUND(MAX(oi.unit_price) - MIN(oi.unit_price), 2) AS spread FROM orders o JOIN order_items oi ON oi.order_id = o.id GROUP BY o.id ORDER BY spread DESC, order_id ASC LIMIT 3;",
  }),
  p({
    id: "kb-ne-p25", difficulty: "hard",
    title: "Supplier catalog width",
    brief: "Each supplier's price span — priciest catalog item minus cheapest — widest first. Midwest's 117.99 spread leads; the narrow specialist trails. Extremes per group, rendered to cents. The width is a range join measured at group grain: MAX minus MIN over each supplier's joined catalog.",
    hints: ["Join suppliers to products; MAX(p.price) - MIN(p.price) is the width.", "GROUP BY supplier; ROUND to cents. ORDER BY width DESC ranks the wide-catalog suppliers first."],
    solution: "SELECT s.name, ROUND(MAX(p.price) - MIN(p.price), 2) AS width FROM suppliers s JOIN products p ON p.supplier_id = s.id GROUP BY s.id ORDER BY width DESC, s.name ASC;",
  }),
  p({
    id: "kb-ne-p26", difficulty: "hard",
    title: "The top-spender orbit",
    brief: "Customers whose lifetime spend sits within 10% of the storefront's top spender — the whale's orbit. The staged-spend self join against the maximum: a range comparison where one bound is computed from the data's own extreme. The orbit is a range join against the data's own extreme: spend at least 90% of the maximum.",
    hints: ["Stage spend per customer; find the max spend in a derived table.", "Keep customers with spend >= 0.9 * max_spend. Alice anchors the orbit at 7262.35."],
    solution: "SELECT t.name, ROUND(t.spend, 2) AS spend FROM (SELECT c.id, c.name, COALESCE(SUM(o.total), 0) AS spend FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id) t JOIN (SELECT MAX(spend) AS max_spend FROM (SELECT c.id, COALESCE(SUM(o.total), 0) AS spend FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id)) m ON t.spend >= 0.9 * m.max_spend ORDER BY t.spend DESC;",
  }),
  p({
    id: "kb-ne-p27", difficulty: "medium",
    title: "Parallel reorders, counted",
    brief: "Same-customer, same-status, same-month order pairs — the parallel-reorder census: twelve pairs. Truncate-then-compare turns timestamps into month buckets; the status equality defines parallel. Truncate-then-compare is bucketed range join matching: same customer, same month-sized neighbourhood, same status.",
    hints: ["Self join orders on customer equality plus a.id < b.id.", "strftime('%Y-%m', ...) truncates both timestamps to month before comparing. a.status = b.status keeps the parallel pairs; COUNT(*) reads them."],
    solution: "SELECT COUNT(*) AS parallel_pairs FROM orders a JOIN orders b ON a.customer_id = b.customer_id AND a.id < b.id AND strftime('%Y-%m', a.created_at) = strftime('%Y-%m', b.created_at) WHERE a.status = b.status;",
  }),
  p({
    id: "kb-ne-p28", difficulty: "hard",
    title: "Comfortable spends, any region",
    brief: "The cross-region comfort census: customer pairs whose total spends sit within 500 dollars of each other, regions unrestricted. Staged spends, ABS distance, deduped pairs — the geography-free cousin of the region-mate check. The comfort census is an unconstrained ABS range join: spends within 500 dollars, geography ignored.",
    hints: ["Stage spend per customer, then self join on a.id < b.id only.", "ABS(a.spend - b.spend) < 500 is the comfort band. COUNT(*) reads the census; region needs no filter here."],
    solution: "SELECT COUNT(*) AS comfortable_pairs FROM (SELECT c.id, COALESCE(SUM(o.total), 0) AS spend FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id) a JOIN (SELECT c.id, COALESCE(SUM(o.total), 0) AS spend FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id) b ON a.id < b.id WHERE ABS(a.spend - b.spend) < 500;",
  }),
  p({
    id: "kb-ne-p29", difficulty: "medium",
    title: "The price-band census",
    brief: "The CASE-built band census: entry (under 30), core (30–60), pro (60–120), elite (120-plus) — half-open so no product double-fits. Three entry products, six core, four pro, three elite: the seed's price distribution in four rows. The CASE chain is the range join's declarative cousin: half-open bands tiling the price axis.",
    hints: ["CASE WHEN chains are half-open by fall-through: < 30, < 60, < 120, else elite.", "GROUP BY the band label; COUNT reads each band's size. Entry 3, core 6, pro 4, elite 3 — sixteen products, four bands."],
    solution: "SELECT CASE WHEN price < 30 THEN 'entry' WHEN price < 60 THEN 'core' WHEN price < 120 THEN 'pro' ELSE 'elite' END AS band, COUNT(*) AS products FROM products GROUP BY band ORDER BY products DESC, band ASC;",
  }),
];

export const nonEquiJoinsBank: KeywordBank = {
  kw: "Non-equi & range joins",
  moduleNum: 2,
  mcqs: nonEquiMcqs,
  cases: nonEquiCases,
  problems,
};
