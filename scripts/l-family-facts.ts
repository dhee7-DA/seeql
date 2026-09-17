/** l-family audit probes — verify data-truth claims in L1-L8 figures. */
import { Database } from "bun:sqlite";
import { copyFileSync } from "node:fs";

copyFileSync("db/custom.db", "scripts/.laudit-facts.db");
const db = new Database("scripts/.laudit-facts.db", { readonly: true });

function q(label: string, sql: string) {
  try {
    const rows = db.query(sql).all() as Record<string, unknown>[];
    console.log(`## ${label}`);
    console.log(JSON.stringify(rows).slice(0, 1400));
  } catch (e) {
    console.log(`## ${label}\nERROR ${(e as Error).message.slice(0, 140)}`);
  }
}

// l3-where-gate: total > 200
q("l3 gate", `SELECT SUM(CASE WHEN total > 200 THEN 1 ELSE 0 END) pass, SUM(CASE WHEN total <= 200 THEN 1 ELSE 0 END) drop FROM orders`);

// l4-sort-limit: top 3
q("l4 top3", `SELECT id, total FROM orders ORDER BY total DESC LIMIT 3`);

// l4-null-spread: order 1
q("l4 order1", `SELECT id, total, shipped_at FROM orders ORDER BY id LIMIT 1`);

// l5-multikey-sort: APAC + EU top3
q("l5 bands", `SELECT c.region, c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.region IN ('APAC','EU') ORDER BY c.region ASC, o.total DESC LIMIT 8`);

// l6-distinct-mech: regions of customers
q("l6 regions", `SELECT region, COUNT(*) n FROM customers GROUP BY region ORDER BY region`);

// l3-like-match: %Keyboard% and %Desk%
q("l3 like kb", `SELECT COUNT(*) n FROM products WHERE name LIKE '%Keyboard%'`);
q("l3 like desk", `SELECT COUNT(*) n FROM products WHERE name LIKE '%Desk%'`);

// l2-projection: the 4 products shown
q("l2 products", `SELECT id, name, category, price, stock FROM products WHERE id IN (1,2,4,9) ORDER BY id`);

// l2-expr-math: order_items 1-3
q("l2 line totals", `SELECT id, quantity, unit_price, ROUND(quantity * unit_price, 2) line_total FROM order_items ORDER BY id LIMIT 3`);

// l4-null-spread: slot colors ground
q("l4 nulls", `SELECT SUM(CASE WHEN shipped_at IS NULL THEN 1 ELSE 0 END) holes FROM orders`);

db.close();
