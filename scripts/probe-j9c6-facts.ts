// j9-c probe 6a — remaining facts for cs-317..325 authoring.
// Readonly copy scripts/.tmp-j9c-new.db. RUN FROM PROJECT ROOT.
import { Database } from "bun:sqlite";

const db = new Database("scripts/.tmp-j9c-new.db", { readonly: true });
const q = (sql: string) => db.query(sql).all();
const one = (sql: string) => JSON.stringify(q(sql));
const show = (label: string, sql: string) => {
  console.log(`\n== ${label} ==`);
  try { for (const r of q(sql)) console.log(JSON.stringify(r)); if (q(sql).length === 0) console.log("(0 rows)"); }
  catch (e) { console.log("ERROR:", e instanceof Error ? e.message : e); }
};

// schema bits
show("customers columns", `SELECT name, type FROM pragma_table_info('customers')`);
show("employees columns", `SELECT name, type FROM pragma_table_info('employees')`);
show("order_items columns", `SELECT name, type FROM pragma_table_info('order_items')`);
show("employees full", `SELECT id, name, role, region, manager_id FROM employees ORDER BY id`);

// cs-317 lineage extras
show("317: m.id = m.id tautology count", `SELECT COUNT(*) n FROM employees e JOIN employees m ON m.id = m.id JOIN employees g ON m.manager_id = g.id WHERE e.role = 'rep'`);
show("317: g.manager_id = m.id rows", `SELECT e.name, m.name mgr, g.name grand FROM employees e JOIN employees m ON g.manager_id = m.id JOIN employees g ON g.id = g.id WHERE e.role='rep' ORDER BY e.id`);
show("317: slot2 e.id variant rows", `SELECT e.name, m.name mgr, g.name grand FROM employees e JOIN employees m ON e.manager_id = m.id JOIN employees g ON g.id = e.id WHERE e.role='rep' ORDER BY e.id`);
show("317: slot2 m.id variant rows", `SELECT e.name, m.name mgr, g.name grand FROM employees e JOIN employees m ON e.manager_id = m.id JOIN employees g ON g.id = m.id WHERE e.role='rep' ORDER BY e.id`);
show("317: slot3 g.manager_id variant", `SELECT e.name, m.name, g.manager_id AS grand FROM employees e JOIN employees m ON e.manager_id = m.id JOIN employees g ON m.manager_id = g.id WHERE e.role='rep' ORDER BY e.id`);
show("317: slot1 g.manager_id variant rows", `SELECT e.name, m.name mgr, g.name grand FROM employees e JOIN employees m ON g.manager_id = m.id JOIN employees g ON m.manager_id = g.id WHERE e.role='rep' ORDER BY e.id`);
show("317: 'lead' rows", `SELECT e.name, m.name mgr, g.name grand FROM employees e JOIN employees m ON e.manager_id = m.id JOIN employees g ON m.manager_id = g.id WHERE e.role='lead' ORDER BY e.id`);
show("317: 'manager' rows", `SELECT COUNT(*) n FROM employees e JOIN employees m ON e.manager_id = m.id JOIN employees g ON m.manager_id = g.id WHERE e.role='manager'`);

// cs-318 duel extras
show("318: region tautology + guard + EU WHERE", `SELECT COUNT(*) n FROM suppliers s1 JOIN suppliers s2 ON s1.region = s1.region AND s1.id < s2.id WHERE s1.region = 'EU'`);
show("318: 'APAC' in region-key slot", `SELECT COUNT(*) n FROM suppliers s1 JOIN suppliers s2 ON s1.region = 'APAC' AND s1.id < s2.id WHERE s1.region = 'EU'`);
show("318: APAC duel fill", `SELECT s1.name a, s1.rating ra, s2.name b, s2.rating rb, ROUND(s2.rating - s1.rating,1) edge FROM suppliers s1 JOIN suppliers s2 ON s1.region = s2.region AND s1.id < s2.id WHERE s1.region = 'APAC' ORDER BY edge DESC`);

// cs-319 cohort extras
show("319: same-month pairs full (id<id)", `SELECT c1.name a, c2.name b, substr(c1.created_at,1,7) m, c1.region ra, c2.region rb FROM customers c1 JOIN customers c2 ON strftime('%Y-%m', c1.created_at) = strftime('%Y-%m', c2.created_at) AND c1.id < c2.id ORDER BY m`);
show("319: same-region pairs id<id count", `SELECT COUNT(*) n FROM customers c1 JOIN customers c2 ON c1.id < c2.id WHERE c1.region = c2.region`);
show("319: year-equality + same-region count", `SELECT COUNT(*) n FROM customers c1 JOIN customers c2 ON strftime('%Y', c1.created_at) = strftime('%Y', c2.created_at) AND c1.id < c2.id WHERE c1.region = c2.region`);
show("319: tautology ON + same-region count", `SELECT COUNT(*) n FROM customers c1 JOIN customers c2 ON c1.id < c2.id WHERE c1.region = c2.region`);
show("319: month-day equality count", `SELECT COUNT(*) n FROM customers c1 JOIN customers c2 ON substr(c1.created_at,6) = substr(c2.created_at,6) AND c1.id < c2.id WHERE c1.region = c2.region`);
show("319: same-day equality count", `SELECT COUNT(*) n FROM customers c1 JOIN customers c2 ON c1.created_at = c2.created_at AND c1.id < c2.id WHERE c1.region = c2.region`);
show("319: cross-region WHERE count", `SELECT COUNT(*) n FROM customers c1 JOIN customers c2 ON strftime('%Y-%m', c1.created_at) = strftime('%Y-%m', c2.created_at) AND c1.id < c2.id WHERE c1.region <> c2.region`);
show("319: EU-only WHERE count", `SELECT COUNT(*) n FROM customers c1 JOIN customers c2 ON strftime('%Y-%m', c1.created_at) = strftime('%Y-%m', c2.created_at) AND c1.id < c2.id WHERE c1.region = 'EU'`);
show("319: city column test", `SELECT COUNT(*) n FROM customers c1 JOIN customers c2 ON c1.city = c2.city AND c1.id < c2.id`);

// cs-320 sibling extras
show("320: answer fill", `SELECT m.name manager, e1.name a, e1.region ra, e2.name b, e2.region rb FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id AND e1.id < e2.id JOIN employees m ON m.id = e1.manager_id WHERE e1.region <> e2.region ORDER BY m.id, e1.id`);
show("320: full sibling list (no WHERE)", `SELECT m.name manager, e1.name a, e1.region ra, e2.name b, e2.region rb FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id AND e1.id < e2.id JOIN employees m ON m.id = e1.manager_id ORDER BY m.id, e1.id`);
show("320: slot1 mgr-report variant rows", `SELECT e1.name a, e2.name b FROM employees e1 JOIN employees e2 ON e1.id = e2.manager_id AND e1.id < e2.id JOIN employees m ON m.id = e1.manager_id WHERE e1.region <> e2.region`);
show("320: slot1 EU-arm count", `SELECT COUNT(*) n FROM employees e1 JOIN employees e2 ON e1.region = 'EU' AND e1.id < e2.id JOIN employees m ON m.id = e1.manager_id WHERE e1.region <> e2.region`);
show("320: slot1 truthy-e1.id count", `SELECT COUNT(*) n FROM employees e1 JOIN employees e2 ON e1.id AND e1.id < e2.id JOIN employees m ON m.id = e1.manager_id WHERE e1.region <> e2.region`);
show("320: slot2 mirror rows", `SELECT m.name manager, e1.name a, e2.name b FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id AND e2.id < e1.id JOIN employees m ON m.id = e1.manager_id WHERE e1.region <> e2.region`);
show("320: slot2 EU-arm count", `SELECT COUNT(*) n FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id AND e1.region = 'EU' JOIN employees m ON m.id = e1.manager_id WHERE e1.region <> e2.region`);
show("320: slot2 truthy count", `SELECT COUNT(*) n FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id AND e1.id JOIN employees m ON m.id = e1.manager_id WHERE e1.region <> e2.region`);
show("320: slot3 e1.id variant", `SELECT m.name manager, e1.name a, e2.name b FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id AND e1.id < e2.id JOIN employees m ON m.id = e1.id WHERE e1.region <> e2.region`);
show("320: slot3 e2.id variant", `SELECT m.name manager, e1.name a, e2.name b FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id AND e1.id < e2.id JOIN employees m ON m.id = e2.id WHERE e1.region <> e2.region`);
show("320: slot3 m.manager_id variant", `SELECT COUNT(*) n FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id AND e1.id < e2.id JOIN employees m ON m.id = m.manager_id WHERE e1.region <> e2.region`);
show("320: slot4 same-region variant", `SELECT COUNT(*) n FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.manager_id AND e1.id < e2.id JOIN employees m ON m.id = e1.manager_id WHERE e1.region = e2.region`);

// cs-321 book extras
show("321: answer fill", `SELECT c.name account, o1.id t1, ROUND(o1.total,2) settled, o2.id t2, ROUND(o2.total,2) open_amt, ROUND(o1.total+o2.total,2) book FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id JOIN customers c ON c.id = o1.customer_id WHERE o1.status='delivered' AND o2.status='pending' AND o1.total+o2.total >= 1000 ORDER BY book DESC`);
show("321: 1100 count", `SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id WHERE o1.status='delivered' AND o2.status='pending' AND o1.total+o2.total >= 1100`);
show("321: cancelled arm count", `SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id WHERE o1.status='cancelled' AND o2.status='pending' AND o1.total+o2.total >= 1000`);
show("321: same-status arm rows", `SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id WHERE o1.status = o2.status AND o2.status='pending' AND o1.total+o2.total >= 1000`);
show("321: o1>o2 total arm", `SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id WHERE o1.status='delivered' AND o2.status='pending' AND o1.total > o2.total AND o1.total+o2.total >= 1000`);
show("321: o2>o1 total arm", `SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id WHERE o1.status='delivered' AND o2.status='pending' AND o2.total > o1.total AND o1.total+o2.total >= 1000`);
show("321: o1 shipped status in WHERE", `SELECT COUNT(*) n FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id WHERE o1.status='shipped' AND o2.status='pending' AND o1.total+o2.total >= 1000`);

// cs-322 method board extras
show("322: answer fill", `SELECT c.name buyer, COUNT(*) mixed_pairs FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id JOIN payments p2 ON p1.id < p2.id JOIN orders o2 ON o2.id = p2.order_id JOIN customers c ON c.id = o1.customer_id WHERE o1.customer_id = o2.customer_id AND p1.method <> p2.method GROUP BY c.id HAVING COUNT(*) >= 50 ORDER BY mixed_pairs DESC, c.name`);
show("322: same-method board", `SELECT c.name buyer, COUNT(*) loyal_pairs FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id JOIN payments p2 ON p1.id < p2.id JOIN orders o2 ON o2.id = p2.order_id JOIN customers c ON c.id = o1.customer_id WHERE o1.customer_id = o2.customer_id AND p1.method = p2.method GROUP BY c.id HAVING COUNT(*) >= 50 ORDER BY loyal_pairs DESC, c.name`);
show("322: card-only boolean board", `SELECT COUNT(*) n FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id JOIN payments p2 ON p1.id < p2.id JOIN orders o2 ON o2.id = p2.order_id JOIN customers c ON c.id = o1.customer_id WHERE o1.customer_id = o2.customer_id AND p1.method = 'card'`);
show("322: <>card board", `SELECT c.name buyer, COUNT(*) n FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id JOIN payments p2 ON p1.id < p2.id JOIN orders o2 ON o2.id = p2.order_id JOIN customers c ON c.id = o1.customer_id WHERE o1.customer_id = o2.customer_id AND p1.method <> 'card' GROUP BY c.id HAVING COUNT(*) >= 50 ORDER BY n DESC`);
show("322: collision o1.id = o2.customer_id board", `SELECT COUNT(*) n FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id JOIN payments p2 ON p1.id < p2.id JOIN orders o2 ON o2.id = p2.order_id JOIN customers c ON c.id = o1.customer_id WHERE o1.id = o2.customer_id AND p1.method <> p2.method`);
show("322: o2.id = o2.customer_id board", `SELECT c.name buyer, COUNT(*) n FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id JOIN payments p2 ON p1.id < p2.id JOIN orders o2 ON o2.id = p2.order_id JOIN customers c ON c.id = o1.customer_id WHERE o2.id = o2.customer_id AND p1.method <> p2.method GROUP BY c.id ORDER BY n DESC LIMIT 3`);
show("322: o1.customer_id = o1.id count", `SELECT COUNT(*) n FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id JOIN payments p2 ON p1.id < p2.id JOIN orders o2 ON o2.id = p2.order_id WHERE o1.customer_id = o1.id AND p1.method <> p2.method`);
show("322: method= board rows sample", `SELECT c.name buyer, COUNT(*) loyal_pairs FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id JOIN payments p2 ON p1.id < p2.id JOIN orders o2 ON o2.id = p2.order_id JOIN customers c ON c.id = o1.customer_id WHERE o1.customer_id = o2.customer_id AND p1.method = p2.method GROUP BY c.id ORDER BY loyal_pairs DESC LIMIT 4`);

// cs-323 twins extras
show("323: answer fill", `SELECT p1.name twin_a, p1.category shelf_a, p2.name twin_b, p2.category shelf_b, ROUND(ABS(p2.price - p1.price),2) gap FROM products p1 JOIN products p2 ON p1.id < p2.id AND p1.category <> p2.category WHERE ABS(p2.price - p1.price) <= 5 ORDER BY gap, p1.id`);
show("323: signed p2-p1 as gap rows", `SELECT p1.name a, p2.name b, ROUND(p2.price - p1.price,2) gap FROM products p1 JOIN products p2 ON p1.id < p2.id AND p1.category <> p2.category WHERE ABS(p2.price - p1.price) <= 5 ORDER BY gap, p1.id`);
show("323: slot3 p2.id threshold count", `SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.id < p2.id AND p1.category <> p2.category WHERE ABS(p2.price - p1.price) <= p2.id`);
show("323: slot3 sums threshold count", `SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.id < p2.id AND p1.category <> p2.category WHERE ABS(p2.price - p1.price) <= p1.price + p2.price`);
show("323: slot3 signed p2-p1 count", `SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.id < p2.id AND p1.category <> p2.category WHERE ABS(p2.price - p1.price) <= p2.price - p1.price`);
show("323: slot3 signed p1-p2 count", `SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.id < p2.id AND p1.category <> p2.category WHERE ABS(p2.price - p1.price) <= p1.price - p2.price`);
show("323: no-guard cat<> abs<=5 count", `SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.category <> p2.category WHERE ABS(p2.price - p1.price) <= 5`);

// cs-324 repeat-SKU corridors (NEW)
show("324: same-buyer repeat-SKU pairs per product", `SELECT p.name sku, COUNT(*) repeat_pairs FROM order_items i1 JOIN order_items i2 ON i1.product_id = i2.product_id AND i1.id < i2.id JOIN orders o1 ON o1.id = i1.order_id JOIN orders o2 ON o2.id = i2.order_id JOIN products p ON p.id = i1.product_id WHERE o1.customer_id = o2.customer_id GROUP BY p.id ORDER BY repeat_pairs DESC, p.name`);
show("324: total pairs", `SELECT COUNT(*) n FROM order_items i1 JOIN order_items i2 ON i1.product_id = i2.product_id AND i1.id < i2.id JOIN orders o1 ON o1.id = i1.order_id JOIN orders o2 ON o2.id = i2.order_id WHERE o1.customer_id = o2.customer_id`);
show("324: per-buyer repeat pairs top", `SELECT c.name buyer, COUNT(*) repeat_pairs FROM order_items i1 JOIN order_items i2 ON i1.product_id = i2.product_id AND i1.id < i2.id JOIN orders o1 ON o1.id = i1.order_id JOIN orders o2 ON o2.id = i2.order_id JOIN customers c ON c.id = o1.customer_id WHERE o1.customer_id = o2.customer_id GROUP BY c.id ORDER BY repeat_pairs DESC LIMIT 6`);
show("324: cross-buyer-only count", `SELECT COUNT(*) n FROM order_items i1 JOIN order_items i2 ON i1.product_id = i2.product_id AND i1.id < i2.id JOIN orders o1 ON o1.id = i1.order_id JOIN orders o2 ON o2.id = i2.order_id WHERE o1.customer_id <> o2.customer_id`);
show("324: sample pair rows", `SELECT p.name sku, i1.id a, i1.order_id t1, i1.quantity q1, i2.id b, i2.order_id t2, i2.quantity q2, c.name buyer FROM order_items i1 JOIN order_items i2 ON i1.product_id = i2.product_id AND i1.id < i2.id JOIN orders o1 ON o1.id = i1.order_id JOIN orders o2 ON o2.id = i2.order_id JOIN products p ON p.id = i1.product_id JOIN customers c ON c.id = o1.customer_id WHERE o1.customer_id = o2.customer_id ORDER BY p.name, i1.id LIMIT 12`);
show("324: same-order pairs within corridor", `SELECT COUNT(*) n FROM order_items i1 JOIN order_items i2 ON i1.product_id = i2.product_id AND i1.id < i2.id JOIN orders o1 ON o1.id = i1.order_id JOIN orders o2 ON o2.id = i2.order_id WHERE o1.customer_id = o2.customer_id AND i1.order_id = i2.order_id`);
show("324: qty-contrast subset count", `SELECT COUNT(*) n FROM order_items i1 JOIN order_items i2 ON i1.product_id = i2.product_id AND i1.id < i2.id JOIN orders o1 ON o1.id = i1.order_id JOIN orders o2 ON o2.id = i2.order_id WHERE o1.customer_id = o2.customer_id AND i1.quantity <> i2.quantity`);
show("324: id-collision i1.id = i2.product_id + same buyer", `SELECT COUNT(*) n FROM order_items i1 JOIN order_items i2 ON i1.product_id = i2.product_id AND i1.id = i2.product_id JOIN orders o1 ON o1.id = i1.order_id JOIN orders o2 ON o2.id = i2.order_id WHERE o1.customer_id = o2.customer_id`);
show("324: o1.id = o2.id subset", `SELECT COUNT(*) n FROM order_items i1 JOIN order_items i2 ON i1.product_id = i2.product_id AND i1.id < i2.id JOIN orders o1 ON o1.id = i1.order_id JOIN orders o2 ON o2.id = i2.order_id WHERE o1.id = o2.id AND o1.customer_id = o2.customer_id`);

// cs-325 stock extras
show("325: products stock", `SELECT id, name, category, stock, price FROM products ORDER BY id`);
show("325: answer fill", `SELECT p1.category shelf, p1.name thin_sku, p1.stock thin_units, p2.name deep_sku, p2.stock deep_units, p2.stock - p1.stock AS units_behind FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id WHERE p2.stock - p1.stock >= 100 ORDER BY units_behind DESC`);
show("325: reversed-guard rows", `SELECT p1.category shelf, p1.name, p2.name, p2.stock - p1.stock AS units_behind FROM products p1 JOIN products p2 ON p1.category = p2.category AND p2.id < p1.id WHERE p2.stock - p1.stock >= 100 ORDER BY units_behind DESC`);
show("325: same-house arm count", `SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.id < p2.id WHERE p2.stock - p1.stock >= 100`);
show("325: id-eq arm count", `SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id = p2.id WHERE p2.stock - p1.stock >= 100`);
show("325: >=160 arm rows", `SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id WHERE p2.stock - p1.stock >= 160`);
show("325: reversed-threshold arm rows", `SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id WHERE p1.stock - p2.stock >= 100`);
show("325: sum arm rows", `SELECT COUNT(*) n FROM products p1 JOIN products p2 ON p1.category = p2.category AND p1.id < p2.id WHERE p1.stock + p2.stock >= 100`);

db.close();
console.log("\nprobe-j9c6-facts done");
