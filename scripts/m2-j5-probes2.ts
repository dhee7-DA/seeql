// Probe round 2 for case batch J5 — open questions after round 1.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";

const COPY = "scripts/.m2j5b.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function probe(label: string, sql: string) {
  console.log(`\n## ${label}`);
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    if (rows.length === 0) { console.log("(0 rows)"); return; }
    const cols = Object.keys(rows[0]!);
    console.log(cols.join(" | "));
    for (const r of rows) console.log(cols.map((c) => String(r[c])).join(" | "));
    console.log(`(${rows.length} rows)`);
  } catch (e) {
    console.log(`ERROR: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// S fixed: AVG trap
probe("S2. c LEFT JOIN i aggregates", `SELECT COUNT(*) AS rows_, COUNT(i.id) AS with_inv, ROUND(SUM(i.amount_cents) / 100.0, 2) AS billed, ROUND(AVG(i.amount_cents) / 100.0, 2) AS avg_invoice, ROUND(SUM(i.amount_cents) / COUNT(*) / 100.0, 2) AS sum_div_rows FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id`);

// 505: coincidence oi.id = o.id within headset lines
probe("I4. headset lines with oi.id = o.id coincidence", `SELECT COUNT(*) FROM products p JOIN order_items oi ON oi.product_id = p.id JOIN orders o ON oi.id = o.id WHERE p.name = 'Noise-Canceling Headset'`);

// 512: distractor checks
probe("P2. wire payments on paid invoices (count)", `SELECT COUNT(*) FROM payments p JOIN invoices i ON p.invoice_id = i.id WHERE p.method = 'wire' AND i.status = 'paid'`);
probe("P3. payments on open invoices (count)", `SELECT p.id, i.number, p.amount_cents FROM payments p JOIN invoices i ON p.invoice_id = i.id WHERE i.status = 'open'`);

// 513: coincidence inside Nordic query
probe("Q2. s.id = p.id inside Nordic query", `SELECT COUNT(*) FROM suppliers s JOIN products p ON s.id = p.id JOIN order_items oi ON oi.product_id = p.id WHERE s.name = 'Nordic Gadgets AB'`);

// 514: coincidence checks
probe("R3. p.id = oi.order_id inside low-stock query", `SELECT COUNT(*) FROM products p JOIN order_items oi ON p.id = oi.order_id JOIN orders o ON o.id = oi.order_id WHERE p.stock < 60`);
probe("R4. oi.id = o.id inside low-stock query", `SELECT COUNT(*) FROM products p JOIN order_items oi ON oi.product_id = p.id JOIN orders o ON oi.id = o.id WHERE p.stock < 60`);
probe("R5. stock < 100 product list", `SELECT name, stock FROM products WHERE stock < 100 ORDER BY stock`);

// 521: sort ASC vs DESC tie check + coincidence within open
probe("Y3. open invoices i.id = c.id", `SELECT i.number, c.name FROM invoices i JOIN customers c ON i.id = c.id WHERE i.status = 'open'`);

// 522: threshold distractors
probe("Z3. invoices >= 1000000 count", `SELECT COUNT(*) FROM invoices WHERE amount_cents >= 1000000`);

// 524: coincidence GROUP BY p.id with wrong cond
probe("AB2. wrong cond p.id = oi.order_id group count", `SELECT COUNT(*) FROM products p JOIN order_items oi ON p.id = oi.order_id GROUP BY p.id`);

// 526: MIN and MAX(unit_price) contrasts
probe("AD2. MIN line + MAX unit_price per supplier", `SELECT s.name, ROUND(MAX(oi.quantity * oi.unit_price), 2) AS biggest, ROUND(MIN(oi.quantity * oi.unit_price), 2) AS smallest, ROUND(MAX(oi.unit_price), 2) AS max_unit FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id GROUP BY s.id ORDER BY biggest DESC`);

// 528: <= guard distractor
probe("AE3. orders with total > 200 count", `SELECT COUNT(*) FROM orders WHERE total > 200`);
probe("AE4. <= guard with >200 totals", `SELECT COUNT(*) FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id <= o2.id WHERE o1.total > 200 AND o2.total > 200`);

// 530: threshold distractors
probe("AG2. premium >= 150 row count (WHERE-hardened)", `SELECT COUNT(*) FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.unit_price >= 150`);
probe("AG3. >= 50 row count", `SELECT COUNT(*) FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id AND oi.unit_price >= 50`);
probe("AG4. INNER version of premium >= 100 (count)", `SELECT COUNT(*) FROM products p JOIN order_items oi ON oi.product_id = p.id AND oi.unit_price >= 100`);
probe("AG5. WHERE version row count", `SELECT COUNT(*) FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id WHERE oi.unit_price >= 100`);

// 532: coincidence c.id = i.id inside APAC query
probe("AI2. c.id = i.id inside APAC payments query", `SELECT COUNT(*) FROM payments p JOIN invoices i ON i.id = p.invoice_id JOIN customers c ON c.id = i.id WHERE c.region = 'APAC'`);
probe("AI3. EU payments count", `SELECT COUNT(*) FROM payments p JOIN invoices i ON i.id = p.invoice_id JOIN customers c ON c.id = i.customer_id WHERE c.region = 'EU'`);

// 533: threshold distractors
probe("AJ2. premium >= 50 per supplier rows", `SELECT COUNT(*) FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id AND p.price >= 50`);
probe("AJ3. INNER + WHERE versions of price >= 100", `SELECT
 (SELECT COUNT(*) FROM suppliers s JOIN products p ON p.supplier_id = s.id AND p.price >= 100) AS inner_on,
 (SELECT COUNT(*) FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id WHERE p.price >= 100) AS left_where`);

// 534 / 544: pipeline-hole candidates
probe("AK3. products with no PENDING lines", `SELECT p.name, p.stock, COUNT(oi.id) AS lines, COUNT(o.id) AS pending_lines FROM products p JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'pending' GROUP BY p.id HAVING COUNT(o.id) = 0 ORDER BY p.name`);
probe("AK4. products with no SHIPPED lines", `SELECT p.name, p.stock, COUNT(oi.id) AS lines, COUNT(o.id) AS shipped_lines FROM products p JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'shipped' GROUP BY p.id HAVING COUNT(o.id) = 0 ORDER BY p.name`);
probe("AK5. products with no CANCELLED lines", `SELECT COUNT(*) FROM products p JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'cancelled' GROUP BY p.id HAVING COUNT(o.id) = 0`);
probe("AK6. suppliers with no PENDING lines", `SELECT s.name FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'pending' GROUP BY s.id HAVING COUNT(o.id) = 0`);
probe("AK7. suppliers with no SHIPPED lines", `SELECT s.name FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'shipped' GROUP BY s.id HAVING COUNT(o.id) = 0`);

// 537: GROUP BY i.status distractor
probe("AN3. payments grouped by invoice status", `SELECT i.status, COUNT(*) AS n, ROUND(SUM(p.amount_cents) / 100.0, 2) AS cash FROM payments p JOIN invoices i ON i.id = p.invoice_id GROUP BY i.status ORDER BY cash DESC`);
probe("AN4. p.invoice_id = i.number coincidence", `SELECT COUNT(*) FROM payments p JOIN invoices i ON p.invoice_id = i.number`);

// 539: more wrong-FK variants
probe("AO5. wrong-FK o.id = i.customer_id grouped", `SELECT i.number, COUNT(*) FROM invoices i JOIN orders o ON o.id = i.customer_id WHERE i.amount_cents >= 400000 GROUP BY i.id ORDER BY i.number`);
probe("AO6. wrong-FK o.customer_id = i.id grouped", `SELECT i.number, COUNT(*) FROM invoices i JOIN orders o ON o.customer_id = i.id WHERE i.amount_cents >= 400000 GROUP BY i.id ORDER BY i.number`);

// 540: EU catalog count (distractor literal)
probe("AY2. EU-sourced products count", `SELECT COUNT(*) FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE s.region = 'EU'`);

// 541: >= 300000 payment list
probe("AU3. payments >= 300000", `SELECT p.id, i.number, ROUND(p.amount_cents / 100.0, 2) AS paid, p.method, p.paid_on FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE p.amount_cents >= 300000 ORDER BY paid DESC`);
probe("AU4. payments >= 350000 count", `SELECT COUNT(*) FROM payments WHERE amount_cents >= 350000`);

// 542: 'open' distractor rows
probe("D2. payments on open invoices (full rows)", `SELECT i.number, i.status, c.name, p.paid_on, p.amount_cents FROM payments p JOIN invoices i ON i.id = p.invoice_id JOIN customers c ON c.id = i.customer_id WHERE i.status = 'open'`);

// 543: sort-key distractor validity
probe("AV2. big invoices LEFT JOIN payments sorted by status", `SELECT i.number, i.status, p.id FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE i.amount_cents >= 400000 ORDER BY i.status, p.id`);

// 545: EU pair list count (distractor literal)
probe("AL2. EU same-region pair count", `SELECT COUNT(*) FROM customers a JOIN customers b ON a.region = b.region AND a.id < b.id WHERE a.region = 'EU'`);
probe("AL3. <= guard on APAC pairs", `SELECT COUNT(*) FROM customers a JOIN customers b ON a.region = b.region AND a.id <= b.id WHERE a.region = 'APAC'`);
probe("AL4. same-city pairs among APAC", `SELECT COUNT(*) FROM customers a JOIN customers b ON a.city = b.city AND a.id < b.id WHERE a.region = 'APAC'`);

// 546: distractor checks — SUM expr vs ratio
probe("AR3. revenue per unit full list", `SELECT s.region, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue, SUM(oi.quantity) AS units, ROUND(SUM(oi.quantity * oi.unit_price) / SUM(oi.quantity), 2) AS rev_per_unit FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN suppliers s ON s.id = p.supplier_id GROUP BY s.region ORDER BY rev_per_unit DESC`);

// 548: HAVING distractors
probe("AS3. HAVING >= 8 rows", `SELECT COUNT(*) FROM (SELECT c.id FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING COUNT(*) >= 8)`);
probe("AS4. HAVING >= 12 rows", `SELECT COUNT(*) FROM (SELECT c.id FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING COUNT(*) >= 12)`);

// 549: affinity check + 'cancelled' filter
probe("AT4. order 7 shipped status check (empty distractor)", `SELECT o.id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.id = '7' AND o.status = 'shipped'`);

// 507: no-paid customers — INNER+IS NULL proof (0 rows) and WHERE variant
probe("K3. INNER JOIN + IS NULL variant", `SELECT COUNT(*) FROM customers c JOIN invoices i ON i.customer_id = c.id AND i.status = 'paid' WHERE i.id IS NULL`);

// 519: never-shipped — INNER variant (0 rows), wrong literal variant
probe("W3. INNER JOIN version of never-shipped", `SELECT COUNT(*) FROM customers c JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped' WHERE o.id IS NULL`);
probe("W4. never-DELIVERED via ON filter (count rows)", `SELECT COUNT(*) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered' WHERE o.id IS NULL`);

// 517: region literal distractor
probe("U3. never-invoiced in US only", `SELECT c.name FROM customers c LEFT JOIN invoices i ON i.customer_id = c.id WHERE i.id IS NULL AND c.region = 'US'`);

// 506: INNER version of US-supplier ON-filter query
probe("J4. INNER version", `SELECT COUNT(*) FROM suppliers s JOIN products p ON p.supplier_id = s.id AND s.region = 'US'`);
probe("J5. WHERE version (row count)", `SELECT COUNT(*) FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id WHERE s.region = 'US'`);

// 525: shipped coverage — WHERE variant row count
probe("AC3. WHERE variant of shipped coverage", `SELECT COUNT(*) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.status = 'shipped'`);
probe("AC4. INNER variant of shipped coverage", `SELECT COUNT(*) FROM customers c JOIN orders o ON o.customer_id = c.id AND o.status = 'shipped'`);

// 510: Audio literal distractors
probe("E3. Wearables products with maker", `SELECT p.name, p.price, s.name FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE p.category = 'Wearables' ORDER BY p.price DESC`);

// 501: void — 'open' distractor rows
probe("C3. open-invoice trace single-row shape", `SELECT i.number, i.status, c.name, ROUND(i.amount_cents / 100.0, 2) AS amount FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.status = 'void'`);

// 502: cancelled sorted by c.name vs o.id differ?
probe("M4. cancelled sorted by name", `SELECT o.id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'cancelled' ORDER BY c.name`);

// 503: accessories list
probe("E4. Accessories products with maker", `SELECT p.name, p.price, s.name AS supplier FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE p.category = 'Accessories' ORDER BY p.price DESC`);

// 536: wrong cond variants
probe("AM2. wrong cond oi.id = o.id in supplier chain", `SELECT COUNT(*) FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id JOIN orders o ON oi.id = o.id`);

// 538: honest vs inflated for Emma/Alice only (top rows)
probe("AP3. top 3 inflated with row counts", `SELECT c.name, COUNT(*) AS rows_, ROUND(SUM(o.total), 2) AS inflated FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items oi ON oi.order_id = o.id GROUP BY c.id ORDER BY inflated DESC LIMIT 3`);

db.close();
rmSync(COPY, { force: true });
console.log("\n(done; copy removed)");
