// Keyword Mastery banks — Set operations & CASE (M3 gap closers: UNION +1
// MCQ, INTERSECT +28 MCQs +13 problems, EXCEPT +31 MCQs +14 problems, CASE
// WHEN +31 MCQs; case files not needed — all four keywords already clear the
// 30-case bar). Facts probed via scripts/m3-facts{,2,3}.ts; every solution
// executes against the seed db (gen-expected verifies). Problem ids:
// kb-so-i01..i13 (INTERSECT), kb-so-e01..e14 (EXCEPT).
import type { Mcq, Problem } from "../types";
import { EXPECTED } from "../expected";
import type { KeywordBank } from "./index";
import { setOpsMcqsA } from "./set-ops-mcqs-a";
import { setOpsMcqsB } from "./set-ops-mcqs-b";
import { setOpsMcqsC } from "./set-ops-mcqs-c";

const p = (v: Omit<Problem, "expected">): Problem => ({ ...v, expected: EXPECTED[v.id] });

// ---------- INTERSECT problems (13) ----------
const intersectProblems: Problem[] = [
  p({
    id: "kb-so-i01", difficulty: "easy",
    title: "Regions both sides share",
    brief: "The footprint check: which region codes appear in BOTH the customer directory and the supplier directory? INTERSECT keeps only the shared values, deduplicated — the overlap of the two vocabularies.",
    hints: ["Two SELECT arms, one per table, joined by INTERSECT.", "One column per arm (region), and a trailing ORDER BY region to alphabetize the overlap."],
    solution: "SELECT region FROM customers INTERSECT SELECT region FROM suppliers ORDER BY region ASC;",
  }),
  p({
    id: "kb-so-i02", difficulty: "easy",
    title: "Shelves the catalog and the ledger share",
    brief: "Which product categories exist in the catalog AND have actually sold? Arm one lists catalog categories; arm two derives the sold categories through the order-items join. The intersect is the 'stocked and proven' list.",
    hints: ["Arm one: SELECT category FROM products. Arm two: join order_items to products and select p.category.", "INTERSECT dedupes each arm automatically — no DISTINCT needed. Order by category."],
    solution: "SELECT category FROM products INTERSECT SELECT p.category FROM order_items oi INNER JOIN products p ON p.id = oi.product_id ORDER BY category ASC;",
  }),
  p({
    id: "kb-so-i03", difficulty: "easy",
    title: "The empty overlap",
    brief: "Compliance asks whether any customer city doubles as a supplier company name. Both columns are TEXT, so the INTERSECT is legal — and the honest answer is whatever it is. An empty result is a finding, not a failure.",
    hints: ["Arm one: SELECT city FROM customers. Arm two: SELECT name FROM suppliers.", "Keep one column per arm so the tuple is a single string; ORDER BY city at the end."],
    solution: "SELECT city FROM customers INTERSECT SELECT name FROM suppliers ORDER BY city ASC;",
  }),
  p({
    id: "kb-so-i04", difficulty: "easy",
    title: "Premium shelves with proven demand",
    brief: "Which categories hold a product priced 100 or more AND have actually sold something? Filter the catalog arm to premium, derive the sold arm through the join, and let INTERSECT report the shelves that are both pricey and proven.",
    hints: ["Arm one adds WHERE price >= 100 to the catalog categories.", "Arm two is the sold-categories join from before; ORDER BY category."],
    solution: "SELECT category FROM products WHERE price >= 100 INTERSECT SELECT p.category FROM order_items oi INNER JOIN products p ON p.id = oi.product_id ORDER BY category ASC;",
  }),
  p({
    id: "kb-so-i05", difficulty: "medium",
    title: "Stuck-and-shipped customers",
    brief: "The care team wants customers who have BOTH a delivered order and a pending one — proven buyers currently stuck in the queue. Two status arms at customer-name grain, one INTERSECT, no join gymnastics.",
    hints: ["Each arm: join orders to customers, filter one status, select the name.", "INTERSECT dedupes the joins' fan-out, so repeated customers collapse to one row each."],
    solution: "SELECT c.name AS name FROM orders o INNER JOIN customers c ON o.customer_id = c.id WHERE o.status = 'delivered' INTERSECT SELECT c2.name AS name FROM orders o2 INNER JOIN customers c2 ON o2.customer_id = c2.id WHERE o2.status = 'pending' ORDER BY name ASC;",
  }),
  p({
    id: "kb-so-i06", difficulty: "medium",
    title: "In-transit and impatient",
    brief: "Who is waiting twice — a shipped order still en route AND a pending order not yet moving? The shipped arm and the pending arm meet at customer names; the intersect is the double-wait list for the ops standup.",
    hints: ["Two arms again: one filters status='shipped', the other status='pending'.", "Both arms select c.name; ORDER BY name at the end."],
    solution: "SELECT c.name AS name FROM orders o INNER JOIN customers c ON o.customer_id = c.id WHERE o.status = 'shipped' INTERSECT SELECT c2.name AS name FROM orders o2 INNER JOIN customers c2 ON o2.customer_id = c2.id WHERE o2.status = 'pending' ORDER BY name ASC;",
  }),
  p({
    id: "kb-so-i07", difficulty: "medium",
    title: "EU partners who actually move stock",
    brief: "Procurement's EU review: which supplier names are European AND have products that sold? The sold-supplier arm climbs items → products → suppliers; the EU arm is a filtered directory. The intersect keeps partners that pass both tests.",
    hints: ["Arm one: join order_items to products to suppliers and select s.name. Arm two: suppliers filtered to region='EU'.", "ORDER BY name alphabetizes the partner list."],
    solution: "SELECT s.name FROM order_items oi INNER JOIN products p ON p.id = oi.product_id INNER JOIN suppliers s ON s.id = p.supplier_id INTERSECT SELECT name FROM suppliers WHERE region = 'EU' ORDER BY name ASC;",
  }),
  p({
    id: "kb-so-i08", difficulty: "medium",
    title: "The veteran trio",
    brief: "Customers who have lived all three fates — delivered, shipped AND cancelled. Three status arms chained with two INTERSECTs (left to right) leaves the survivors of every bucket.",
    hints: ["Chain three arms: delivered INTERSECT shipped INTERSECT cancelled.", "SQLite evaluates left to right; each arm joins orders to customers and selects the name."],
    solution: "SELECT c.name AS name FROM orders o INNER JOIN customers c ON o.customer_id = c.id WHERE o.status = 'delivered' INTERSECT SELECT c2.name AS name FROM orders o2 INNER JOIN customers c2 ON o2.customer_id = c2.id WHERE o2.status = 'shipped' INTERSECT SELECT c3.name AS name FROM orders o3 INNER JOIN customers c3 ON o3.customer_id = c3.id WHERE o3.status = 'cancelled' ORDER BY name ASC;",
  }),
  p({
    id: "kb-so-i09", difficulty: "medium",
    title: "Cross-shelf baskets: Electronics + Audio",
    brief: "Merchandising's bundle question: which orders contain BOTH an Electronics item and an Audio item? One arm per category at order grain, INTERSECT for the shared baskets — the set-operator answer to 'bought together'.",
    hints: ["Each arm: join order_items to products, filter one category, select order_id.", "The intersect pairs the two arms on order_id; sort by order_id."],
    solution: "SELECT oi.order_id FROM order_items oi INNER JOIN products p ON p.id = oi.product_id WHERE p.category = 'Electronics' INTERSECT SELECT oi2.order_id FROM order_items oi2 INNER JOIN products p2 ON p2.id = oi2.product_id WHERE p2.category = 'Audio' ORDER BY order_id ASC;",
  }),
  p({
    id: "kb-so-i10", difficulty: "hard",
    title: "Accessories meet Apparel",
    brief: "The style-bundle scout: orders carrying BOTH an Accessories item and an Apparel item — the 'complete the outfit' baskets. Same two-arm intersect at order grain, different shelf pair, different story.",
    hints: ["Two arms, one per category: 'Accessories' and 'Apparel', each selecting order_id from the items-products join.", "Sort the shared basket ids by order_id."],
    solution: "SELECT oi.order_id FROM order_items oi INNER JOIN products p ON p.id = oi.product_id WHERE p.category = 'Accessories' INTERSECT SELECT oi2.order_id FROM order_items oi2 INNER JOIN products p2 ON p2.id = oi2.product_id WHERE p2.category = 'Apparel' ORDER BY order_id ASC;",
  }),
  p({
    id: "kb-so-i11", difficulty: "hard",
    title: "Premium and repriced",
    brief: "Pricing audit: premium products (100 or more) whose lines billed at a DIFFERENT unit price than catalog — the expensive drift worth a meeting. The premium arm is a filter; the drifted arm compares oi.unit_price to p.price.",
    hints: ["Arm one: products WHERE price >= 100. Arm two: the items-products join WHERE oi.unit_price <> p.price.", "Both arms select name; ORDER BY name at the end."],
    solution: "SELECT name FROM products WHERE price >= 100 INTERSECT SELECT p.name FROM order_items oi INNER JOIN products p ON p.id = oi.product_id WHERE oi.unit_price <> p.price ORDER BY name ASC;",
  }),
  p({
    id: "kb-so-i12", difficulty: "hard",
    title: "Shared regions, minus the US",
    brief: "The footprint check with an exclusion: regions both customers and suppliers share, EXCLUDING the US market from this report. Chain the two directory arms, then a filtered arm drops 'US' from the overlap — three operators, left to right.",
    hints: ["Arm one: customers regions. Arm two: suppliers regions, joined by INTERSECT. Arm three: customers regions WHERE region <> 'US', joined by INTERSECT again.", "Left-to-right evaluation makes the third arm subtract from the overlap; ORDER BY region finishes."],
    solution: "SELECT region FROM customers INTERSECT SELECT region FROM suppliers INTERSECT SELECT region FROM customers WHERE region <> 'US' ORDER BY region ASC;",
  }),
  p({
    id: "kb-so-i13", difficulty: "hard",
    title: "Big cross-shelf baskets",
    brief: "The whale-bundle hunt: orders that carry Electronics AND Audio AND crossed 500 in total — triple-arm intersect, two category arms and one big-ticket arm. Three conditions that no single WHERE can express become one compound.",
    hints: ["Arms one and two are the category baskets from before; arm three: SELECT id FROM orders WHERE total >= 500.", "Chain all three with INTERSECT; sort by order_id."],
    solution: "SELECT oi.order_id FROM order_items oi INNER JOIN products p ON p.id = oi.product_id WHERE p.category = 'Electronics' INTERSECT SELECT oi2.order_id FROM order_items oi2 INNER JOIN products p2 ON p2.id = oi2.product_id WHERE p2.category = 'Audio' INTERSECT SELECT o.id FROM orders o WHERE o.total >= 500 ORDER BY order_id ASC;",
  }),
];

// ---------- EXCEPT problems (14) ----------
const exceptProblems: Problem[] = [
  p({
    id: "kb-so-e01", difficulty: "easy",
    title: "Status words, minus regions",
    brief: "A vocabulary drill with a point: which order-status values appear NOWHERE in the customer region vocabulary? The EXCEPT subtracts the region arm from the status arm and the survivors are the status words proper.",
    hints: ["Arm one: SELECT status FROM orders. Arm two: SELECT region FROM customers.", "EXCEPT keeps first-arm values absent from the second; ORDER BY status."],
    solution: "SELECT status FROM orders EXCEPT SELECT region FROM customers ORDER BY status ASC;",
  }),
  p({
    id: "kb-so-e02", difficulty: "easy",
    title: "The non-EU book",
    brief: "The regional complement: every customer EXCEPT the EU eight. The subtracted arm is the filtered directory; what survives is everyone else — the cleanest 'NOT this filter' spelling in set-operator form.",
    hints: ["Arm one: all customer names. Arm two: names WHERE region = 'EU'.", "EXCEPT does the complement; ORDER BY name alphabetizes."],
    solution: "SELECT name FROM customers EXCEPT SELECT name FROM customers WHERE region = 'EU' ORDER BY name ASC;",
  }),
  p({
    id: "kb-so-e03", difficulty: "easy",
    title: "The value-tier shelves",
    brief: "Which categories hold NO product at 100 or more? Subtract the premium-category arm from the full catalog arm — the survivors are the shelves where value pricing lives.",
    hints: ["Arm one: DISTINCT catalog categories. Arm two: categories WHERE price >= 100.", "Both arms select category; ORDER BY category."],
    solution: "SELECT DISTINCT category FROM products EXCEPT SELECT DISTINCT category FROM products WHERE price >= 100 ORDER BY category ASC;",
  }),
  p({
    id: "kb-so-e04", difficulty: "easy",
    title: "Top shelf minus bottom shelf",
    brief: "Are the five most expensive products a different crowd from the five cheapest? Two derived-table arms (each sorted and limited), EXCEPT between them — the overlap would show up as a missing row, and the survivors tell the price story.",
    hints: ["Wrap each arm in a derived table: SELECT name FROM (SELECT name, price FROM products ORDER BY price DESC LIMIT 5) and the ASC twin.", "EXCEPT the derived tables; ORDER BY name."],
    solution: "SELECT name FROM (SELECT name, price FROM products ORDER BY price DESC LIMIT 5) EXCEPT SELECT name FROM (SELECT name, price FROM products ORDER BY price ASC LIMIT 5) ORDER BY name ASC;",
  }),
  p({
    id: "kb-so-e05", difficulty: "medium",
    title: "Never went pending",
    brief: "The smooth-operators list: customers with NO pending order. Subtract the pending-arm (customer names via the join) from the full directory — EXCEPT folds the join fan-out to a clean set first.",
    hints: ["Arm one: SELECT name FROM customers. Arm two: the orders-customers join filtered to status='pending'.", "ORDER BY name for the roster."],
    solution: "SELECT name FROM customers EXCEPT SELECT c.name FROM orders o INNER JOIN customers c ON o.customer_id = c.id WHERE o.status = 'pending' ORDER BY name ASC;",
  }),
  p({
    id: "kb-so-e06", difficulty: "medium",
    title: "The one who never received",
    brief: "A single-name chase list: customers EXCEPT customers-with-delivered-orders. Fifteen of sixteen have received something — the difference is the one account still waiting on its first successful delivery.",
    hints: ["Arm one: all customer names. Arm two: the join filtered to status='delivered'.", "The result is tiny — one row; ORDER BY name keeps it deterministic."],
    solution: "SELECT name FROM customers EXCEPT SELECT c.name FROM orders o INNER JOIN customers c ON o.customer_id = c.id WHERE o.status = 'delivered' ORDER BY name ASC;",
  }),
  p({
    id: "kb-so-e07", difficulty: "medium",
    title: "European partners only",
    brief: "The sourcing team's EU sheet: supplier names EXCEPT the non-EU names. Subtracting the filtered arm is the region cut in set-operator form — the same two names a WHERE would keep, stated as a difference.",
    hints: ["Arm one: all supplier names. Arm two: names WHERE region <> 'EU'.", "ORDER BY name."],
    solution: "SELECT name FROM suppliers EXCEPT SELECT name FROM suppliers WHERE region <> 'EU' ORDER BY name ASC;",
  }),
  p({
    id: "kb-so-e08", difficulty: "medium",
    title: "Statuses still in play",
    brief: "Which status values would survive if cancelled orders were retired tomorrow? Subtract the cancelled arm from the distinct status vocabulary — the remaining values are the ones still worth dashboards.",
    hints: ["Arm one: SELECT DISTINCT status FROM orders. Arm two: status WHERE status='cancelled'.", "ORDER BY status."],
    solution: "SELECT DISTINCT status FROM orders EXCEPT SELECT status FROM orders WHERE status = 'cancelled' ORDER BY status ASC;",
  }),
  p({
    id: "kb-so-e09", difficulty: "medium",
    title: "The 50-dollar line",
    brief: "Which products cost 50 or more? Stated as a difference: the full catalog EXCEPT the sub-50 arm. The subtracted arm defines the cut line — move the boundary and the roster moves with it.",
    hints: ["Arm one: all product names. Arm two: names WHERE price < 50.", "The boundary is strict < — exactly-50 products survive. ORDER BY name."],
    solution: "SELECT name FROM products EXCEPT SELECT name FROM products WHERE price < 50 ORDER BY name ASC;",
  }),
  p({
    id: "kb-so-e10", difficulty: "hard",
    title: "Clean records",
    brief: "Trust screening: customers who have NEVER cancelled an order. Four accounts own all seven cancellations; the difference between the directory and those four is the clean list the credit team trusts.",
    hints: ["Arm one: SELECT name FROM customers. Arm two: the join filtered to status='cancelled'.", "Twelve names survive; ORDER BY name."],
    solution: "SELECT name FROM customers EXCEPT SELECT c.name FROM orders o INNER JOIN customers c ON o.customer_id = c.id WHERE o.status = 'cancelled' ORDER BY name ASC;",
  }),
  p({
    id: "kb-so-e11", difficulty: "hard",
    title: "Subtract your way to delivered",
    brief: "A chain drill: from the full status vocabulary, subtract the open statuses (pending, shipped), then subtract cancelled. What remains is the single finished-good status — two EXCEPTs, left to right, one survivor.",
    hints: ["Arm one: DISTINCT status. Arm two: status IN ('pending','shipped'). Arm three: status = 'cancelled'.", "Chain all with EXCEPT and ORDER BY status."],
    solution: "SELECT DISTINCT status FROM orders EXCEPT SELECT status FROM orders WHERE status IN ('pending','shipped') EXCEPT SELECT status FROM orders WHERE status = 'cancelled' ORDER BY status ASC;",
  }),
  p({
    id: "kb-so-e12", difficulty: "hard",
    title: "Never crossed 500",
    brief: "The nurture list: customers whose ENTIRE order history stays under 500. The big-ticket arm captures anyone who ever crossed the line; the difference keeps the six who never did — prime candidates for the next campaign.",
    hints: ["Arm one: all customer names. Arm two: the join WHERE o.total >= 500 (no status filter).", "ORDER BY name; six rows expected."],
    solution: "SELECT name FROM customers EXCEPT SELECT c.name FROM orders o INNER JOIN customers c ON o.customer_id = c.id WHERE o.total >= 500 ORDER BY name ASC;",
  }),
  p({
    id: "kb-so-e13", difficulty: "hard",
    title: "The footprint, minus LATAM",
    brief: "Board-deck geography: the union of customer and supplier regions, then LATAM carved out for this quarter's cut. UNION builds the universe, EXCEPT subtracts the exception — two operators, one compound, no temp tables.",
    hints: ["Arm one: SELECT region FROM customers UNION SELECT region FROM suppliers. Then EXCEPT the arm SELECT region FROM customers WHERE region='LATAM'.", "Evaluation is left to right; ORDER BY region finishes."],
    solution: "SELECT region FROM customers UNION SELECT region FROM suppliers EXCEPT SELECT region FROM customers WHERE region = 'LATAM' ORDER BY region ASC;",
  }),
  p({
    id: "kb-so-e14", difficulty: "hard",
    title: "Never shipped anything",
    brief: "Logistics outreach: customer emails with NO shipped order — accounts whose nothing is in transit. Ten customers hold shipped orders; the difference between all emails and theirs is the outreach list.",
    hints: ["Arm one: SELECT email FROM customers. Arm two: the join filtered to status='shipped', selecting c.email.", "ORDER BY email for the send list."],
    solution: "SELECT email FROM customers EXCEPT SELECT c.email FROM orders o INNER JOIN customers c ON o.customer_id = c.id WHERE o.status = 'shipped' ORDER BY email ASC;",
  }),
];

// ---------- bank assemblies (one per canonical keyword) ----------
export const unionBank: KeywordBank = {
  kw: "UNION & UNION ALL",
  moduleNum: 3,
  mcqs: setOpsMcqsA.slice(0, 1) as Mcq[],
  cases: [],
  problems: [],
};

export const intersectBank: KeywordBank = {
  kw: "INTERSECT",
  moduleNum: 3,
  mcqs: setOpsMcqsA.slice(1) as Mcq[],
  cases: [],
  problems: intersectProblems,
};

export const exceptBank: KeywordBank = {
  kw: "EXCEPT",
  moduleNum: 3,
  mcqs: setOpsMcqsB,
  cases: [],
  problems: exceptProblems,
};

export const caseWhenBank: KeywordBank = {
  kw: "CASE WHEN",
  moduleNum: 3,
  mcqs: setOpsMcqsC,
  cases: [],
  problems: [],
};
