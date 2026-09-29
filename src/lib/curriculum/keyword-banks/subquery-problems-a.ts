// Keyword Mastery bank — IN-subquery graded problems (kb-sq-i01..i19).
// Every solution executes against the seed db; gen-expected generates the
// grading targets. Probed facts: EU orders 45 / US 19, delivered-EU 24,
// EU pending 6, 12 Electronics buyers, 16/0 membership splits, multi-column
// row-value IN 12 rows, products-above-avg 6.
import type { Problem } from "../types";
import { EXPECTED } from "../expected";

const p = (v: Omit<Problem, "expected">): Problem => ({ ...v, expected: EXPECTED[v.id] });

export const subqueryProblemsA: Problem[] = [
  p({
    id: "kb-sq-i01", difficulty: "easy",
    title: "Buyers via the key set",
    brief: "The retention team wants the customer directory filtered to actual buyers — via an IN subquery, not a join. The subquery collects every customer_id that appears in orders; the outer query keeps the directory rows whose id makes the cut. All sixteen qualify on this seed, and each appears exactly once.",
    hints: ["The outer query selects name FROM customers with a WHERE id IN (…) membership test.", "The subquery is SELECT customer_id FROM orders — one column, the key set. ORDER BY name."],
    solution: "SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders) ORDER BY name ASC;",
  }),
  p({
    id: "kb-sq-i02", difficulty: "easy",
    title: "The never-bought audit",
    brief: "Flip the key set: NOT IN keeps directory rows ABSENT from the orders id set. The honest answer on this seed is an empty result — every customer has ordered. Run it anyway; the audit's clean bill is itself the deliverable.",
    hints: ["Same shape as the buyers query, with NOT IN between id and the subquery.", "The subquery stays SELECT customer_id FROM orders; ORDER BY name."],
    solution: "SELECT name FROM customers WHERE id NOT IN (SELECT customer_id FROM orders) ORDER BY name ASC;",
  }),
  p({
    id: "kb-sq-i03", difficulty: "easy",
    title: "EU order ledger",
    brief: "Operations wants every order placed by a European customer — the ledger rows, not a count. The IN subquery derives the 8 EU ids from the directory; the outer query pulls all orders referencing them: 45 rows with id, customer_id, status, and total.",
    hints: ["SELECT id, customer_id, status, total FROM orders WHERE customer_id IN (…).", "The subquery: SELECT id FROM customers WHERE region = 'EU'. Order by order id."],
    solution: "SELECT id, customer_id, status, total FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = 'EU') ORDER BY id ASC;",
  }),
  p({
    id: "kb-sq-i04", difficulty: "easy",
    title: "US order ledger",
    brief: "Same hop, different region: pull every order whose customer calls the US home. The subquery's id list shrinks to 2 customers; the ledger grows to 19 rows — the US accounts are heavy buyers relative to their directory share.",
    hints: ["The outer query is unchanged from the EU ledger except the region literal.", "Subquery: SELECT id FROM customers WHERE region = 'US'; sort by order id."],
    solution: "SELECT id, customer_id, status, total FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = 'US') ORDER BY id ASC;",
  }),
  p({
    id: "kb-sq-i05", difficulty: "easy",
    title: "Delivered in Europe",
    brief: "Two filters, two homes: status lives on orders, region lives on customers. The IN subquery fixes the EU key set; the outer WHERE applies the delivered filter within it — 24 rows of proven European fulfillment.",
    hints: ["Add AND status = 'delivered' to the outer query of the EU ledger.", "Keep the same EU id subquery; ORDER BY id."],
    solution: "SELECT id, customer_id, status, total FROM orders WHERE status = 'delivered' AND customer_id IN (SELECT id FROM customers WHERE region = 'EU') ORDER BY id ASC;",
  }),
  p({
    id: "kb-sq-i06", difficulty: "easy",
    title: "EU pending watchlist",
    brief: "Compliance watches the undecided money: pending orders belonging to EU customers. Six orders make the list. The IN subquery holds the 8 EU ids; the outer filter keeps status = 'pending' rows among them.",
    hints: ["Same composition — swap the status literal to 'pending'.", "Subquery unchanged: EU ids from customers. ORDER BY id."],
    solution: "SELECT id, customer_id, status, total FROM orders WHERE status = 'pending' AND customer_id IN (SELECT id FROM customers WHERE region = 'EU') ORDER BY id ASC;",
  }),
  p({
    id: "kb-sq-i07", difficulty: "easy",
    title: "Products above the line",
    brief: "Pricing's quick cut: products priced above the CATALOG AVERAGE. The scalar subquery computes the 71.7769 benchmark; the outer comparison keeps the six premium products with their names and prices. The scalar benchmark here pairs with an IN subquery family: threshold tests against derived values.",
    hints: ["SELECT id, name, price FROM products WHERE price > (…).", "The scalar: SELECT AVG(price) FROM products. ORDER BY price DESC."],
    solution: "SELECT id, name, price FROM products WHERE price > (SELECT AVG(price) FROM products) ORDER BY price DESC;",
  }),
  p({
    id: "kb-sq-i08", difficulty: "medium",
    title: "Electronics buyers",
    brief: "The three-hop key chain: Electronics product ids → order_ids in order_items → customer_ids in orders → customer names. Twelve of the sixteen customers bought something from the Electronics shelf. Each hop is an IN subquery wrapped in the next.",
    hints: ["Outermost: SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE id IN (…)).", "Innermost: product ids FROM products WHERE category = 'Electronics'. ORDER BY name."],
    solution: "SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE id IN (SELECT order_id FROM order_items WHERE product_id IN (SELECT id FROM products WHERE category = 'Electronics'))) ORDER BY name ASC;",
  }),
  p({
    id: "kb-sq-i09", difficulty: "medium",
    title: "Suppliers with proven demand",
    brief: "Supplier review: which suppliers' products have actually sold? The subquery climbs items → products and collects supplier_ids; the outer query keeps directory rows in that set. All six suppliers pass on this seed.",
    hints: ["SELECT id, name, region FROM suppliers WHERE id IN (…).", "Subquery: SELECT p.supplier_id FROM order_items oi INNER JOIN products p ON p.id = oi.product_id. ORDER BY name."],
    solution: "SELECT id, name, region FROM suppliers WHERE id IN (SELECT p.supplier_id FROM order_items oi INNER JOIN products p ON p.id = oi.product_id) ORDER BY name ASC;",
  }),
  p({
    id: "kb-sq-i10", difficulty: "medium",
    title: "The ghost-supplier check",
    brief: "Flip the set: suppliers whose products NEVER sold. NOT IN over the sold-supplier key set. The honest result is empty — all six suppliers moved stock — but the audit query is the deliverable, and it guards the day a ghost appears.",
    hints: ["Swap IN for NOT IN in the proven-demand query.", "Keep the same subquery; ORDER BY name."],
    solution: "SELECT id, name, region FROM suppliers WHERE id NOT IN (SELECT p.supplier_id FROM order_items oi INNER JOIN products p ON p.id = oi.product_id) ORDER BY name ASC;",
  }),
  p({
    id: "kb-sq-i11", difficulty: "medium",
    title: "Cancelled-order customers",
    brief: "Churn outreach needs the customers touched by a cancellation. The subquery collects customer_ids from cancelled orders (7 tickets, 4 holders); the outer query names them once each from the directory.",
    hints: ["SELECT id, name, email FROM customers WHERE id IN (…).", "Subquery: SELECT customer_id FROM orders WHERE status = 'cancelled'. ORDER BY name."],
    solution: "SELECT id, name, email FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = 'cancelled') ORDER BY name ASC;",
  }),
  p({
    id: "kb-sq-i12", difficulty: "medium",
    title: "Shared-region customers",
    brief: "Membership over text: customers whose region appears in the supplier directory's region vocabulary. Both tables span the same four codes, so all sixteen customers pass — the query documents vocabulary overlap as a filter.",
    hints: ["SELECT name, region FROM customers WHERE region IN (…).", "Subquery: SELECT region FROM suppliers. ORDER BY name."],
    solution: "SELECT name, region FROM customers WHERE region IN (SELECT region FROM suppliers) ORDER BY name ASC;",
  }),
  p({
    id: "kb-sq-i13", difficulty: "medium",
    title: "Big-ticket EU orders",
    brief: "Two predicates compose: the IN subquery fixes the EU key set, and the outer comparison keeps totals above 500. The result is the European big-ticket ledger — count the rows and the region's premium profile emerges.",
    hints: ["Add AND total > 500 to the EU ledger query.", "Subquery unchanged; ORDER BY total DESC for the ranking read."],
    solution: "SELECT id, customer_id, total FROM orders WHERE total > 500 AND customer_id IN (SELECT id FROM customers WHERE region = 'EU') ORDER BY total DESC;",
  }),
  p({
    id: "kb-sq-i14", difficulty: "medium",
    title: "Above-average order buyers",
    brief: "Scalar-in-composition: find customers who own at least one order above the store-wide average total. The scalar computes 338.19; the outer query filters orders first, then the IN-style membership names the distinct holders.",
    hints: ["Use SELECT DISTINCT c.name FROM customers c INNER JOIN orders o … WHERE o.total > (SELECT AVG(total) FROM orders) — or a two-hop IN chain.", "ORDER BY name keeps the roster tidy."],
    solution: "SELECT DISTINCT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE total > (SELECT AVG(total) FROM orders)) ORDER BY name ASC;",
  }),
  p({
    id: "kb-sq-i15", difficulty: "hard",
    title: "Row-value IN (SQLite extension)",
    brief: "SQLite accepts tuple membership: WHERE (customer_id, status) IN (SELECT 1, 'delivered'). The pair test pins customer 1's delivered orders — twelve rows. Write it exactly so and note the portability caveat in the walkthrough.",
    hints: ["The outer tuple (customer_id, status) mirrors the subquery's two columns.", "Subquery: SELECT 1, 'delivered'. ORDER BY id."],
    solution: "SELECT id, total FROM orders WHERE (customer_id, status) IN (SELECT 1, 'delivered') ORDER BY id ASC;",
  }),
  p({
    id: "kb-sq-i16", difficulty: "hard",
    title: "Latest-order pending holders",
    brief: "The two-hop test: a customer's LATEST order (their MAX order id) is still pending. Inner subquery: per-customer MAX(id). Middle: customer_ids whose latest order has status 'pending'. Outer: the directory names them.",
    hints: ["SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = 'pending' AND id IN (…)).", "Innermost: SELECT MAX(id) FROM orders GROUP BY customer_id. ORDER BY name."],
    solution: "SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE status = 'pending' AND id IN (SELECT MAX(id) FROM orders GROUP BY customer_id)) ORDER BY name ASC;",
  }),
  p({
    id: "kb-sq-i17", difficulty: "hard",
    title: "Regions with no supplier footprint",
    brief: "The vocabulary audit: DISTINCT customer regions absent from the supplier region set. NOT IN over text — safe here because regions are never NULL. The seed's honest answer: empty, both tables span the same four codes.",
    hints: ["SELECT DISTINCT region FROM customers WHERE region NOT IN (…).", "Subquery: SELECT region FROM suppliers. ORDER BY region."],
    solution: "SELECT DISTINCT region FROM customers WHERE region NOT IN (SELECT region FROM suppliers) ORDER BY region ASC;",
  }),
  p({
    id: "kb-sq-i18", difficulty: "hard",
    title: "Customers matching a two-key probe",
    brief: "Combine a literal list and a subquery with AND: customers who are EU members of the directory AND hold at least one cancelled order. Two membership tests — region IN a derived list, id IN the cancelled key set.",
    hints: ["WHERE region = 'EU' AND id IN (SELECT customer_id FROM orders WHERE status = 'cancelled').", "Keep the outer SELECT minimal — id, name. ORDER BY name."],
    solution: "SELECT id, name FROM customers WHERE region = 'EU' AND id IN (SELECT customer_id FROM orders WHERE status = 'cancelled') ORDER BY name ASC;",
  }),
  p({
    id: "kb-sq-i19", difficulty: "hard",
    title: "The never-EU ledger",
    brief: "Anti-membership with a guard: every order whose customer is NOT in the EU id set. Regions are NOT NULL on this seed, so NOT IN is safe — 58 orders sit outside Europe (103 minus 45). Pull id, customer_id, region via a join-back for readable rows.",
    hints: ["SELECT o.id, o.customer_id, c.region FROM orders o INNER JOIN customers c ON c.id = o.customer_id WHERE o.customer_id NOT IN (…).", "Subquery: EU ids. ORDER BY o.id."],
    solution: "SELECT o.id, o.customer_id, c.region FROM orders o INNER JOIN customers c ON c.id = o.customer_id WHERE o.customer_id NOT IN (SELECT id FROM customers WHERE region = 'EU') ORDER BY o.id ASC;",
  }),
];
